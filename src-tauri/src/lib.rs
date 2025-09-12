use tauri::Manager;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use chrono::Utc;
use std::fs;
use rusqlite::{Connection, params};
use uuid::Uuid;
use tauri_plugin_dialog::DialogExt;
use std::sync::Mutex;
use tauri::State;

// Database state management
struct DbState(Mutex<Connection>);

fn init_database(app_handle: &tauri::AppHandle) -> Result<Connection, String> {
    let app_dir = app_handle.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create app directory: {}", e))?;
    
    let db_path = app_dir.join("tpt_assets.db");
    let conn = Connection::open(&db_path)
        .map_err(|e| format!("Failed to open database: {}", e))?;
    
    // Create tables
    conn.execute(
        "CREATE TABLE IF NOT EXISTS assets (
            id TEXT PRIMARY KEY,
            asset_type TEXT NOT NULL,
            name TEXT NOT NULL,
            config TEXT,
            metadata TEXT,
            file_path TEXT,
            file_size INTEGER,
            quality_score INTEGER,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    ).map_err(|e| format!("Failed to create assets table: {}", e))?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    ).map_err(|e| format!("Failed to create settings table: {}", e))?;
    
    Ok(conn)
}

#[derive(Debug, Serialize, Deserialize)]
struct AssetFilters {
    r#type: Option<String>,
    search: Option<String>,
    limit: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Asset {
    id: String,
    asset_type: String,
    name: String,
    config: Option<serde_json::Value>,
    metadata: Option<serde_json::Value>,
    file_path: Option<String>,
    file_size: Option<u64>,
    quality_score: Option<u32>,
    created_at: Option<String>,
    updated_at: Option<String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      // Initialize database
      let conn = init_database(&app.handle())?;
      app.manage(DbState(Mutex::new(conn)));
      
      Ok(())
    })
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .invoke_handler(tauri::generate_handler![
      db_get_assets,
      db_save_asset,
      db_delete_asset,
      db_get_setting,
      db_save_setting,
      fs_save_file,
      fs_read_file,
      fs_ensure_dir,
      dialog_open_directory,
      dialog_save_file,
      generate_asset,
      generate_batch
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
// Helper function to create a row mapper
fn create_asset_row_mapper() -> impl Fn(&rusqlite::Row) -> rusqlite::Result<serde_json::Value> {
    |row| {
        let config_str: Option<String> = row.get(3)?;
        let metadata_str: Option<String> = row.get(4)?;
        
        let config: Option<serde_json::Value> = config_str
            .and_then(|s| serde_json::from_str(&s).ok());
        let metadata: Option<serde_json::Value> = metadata_str
            .and_then(|s| serde_json::from_str(&s).ok());
        
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "asset_type": row.get::<_, String>(1)?,
            "name": row.get::<_, String>(2)?,
            "config": config,
            "metadata": metadata,
            "file_path": row.get::<_, Option<String>>(5)?,
            "file_size": row.get::<_, Option<u64>>(6)?,
            "quality_score": row.get::<_, Option<u32>>(7)?,
            "created_at": row.get::<_, String>(8)?,
            "updated_at": row.get::<_, String>(9)?
        }))
    }
}

async fn db_get_assets(
    db_state: State<'_, DbState>,
    filters: AssetFilters
) -> Result<Vec<serde_json::Value>, String> {
    let conn = db_state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let mut query = "SELECT id, asset_type, name, config, metadata, file_path, file_size, quality_score, created_at, updated_at FROM assets".to_string();
    let mut conditions = Vec::new();
    
    // Build query conditions
    if filters.r#type.is_some() {
        conditions.push("asset_type = ?");
    }
    
    if filters.search.is_some() {
        conditions.push("name LIKE ?");
    }
    
    if !conditions.is_empty() {
        query.push_str(&format!(" WHERE {}", conditions.join(" AND ")));
    }
    
    query.push_str(" ORDER BY updated_at DESC");
    
    if let Some(limit) = filters.limit {
        query.push_str(&format!(" LIMIT {}", limit));
    }
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    // Execute query with proper parameter binding
    let rows = if let (Some(asset_type), Some(search)) = (&filters.r#type, &filters.search) {
        let search_pattern = format!("%{}%", search);
        stmt.query_map(params![asset_type, search_pattern], create_asset_row_mapper())
            .map_err(|e| format!("Query execution error: {}", e))?
    } else if let Some(asset_type) = &filters.r#type {
        stmt.query_map(params![asset_type], create_asset_row_mapper())
            .map_err(|e| format!("Query execution error: {}", e))?
    } else if let Some(search) = &filters.search {
        let search_pattern = format!("%{}%", search);
        stmt.query_map(params![search_pattern], create_asset_row_mapper())
            .map_err(|e| format!("Query execution error: {}", e))?
    } else {
        stmt.query_map([], create_asset_row_mapper())
            .map_err(|e| format!("Query execution error: {}", e))?
    };
    
    let mut assets = Vec::new();
    for asset_result in rows {
        assets.push(asset_result.map_err(|e| format!("Row parsing error: {}", e))?);
    }
    
    Ok(assets)
}

#[tauri::command]
async fn db_save_asset(
    db_state: State<'_, DbState>,
    asset: serde_json::Value
) -> Result<String, String> {
    let conn = db_state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let default_id = Uuid::new_v4().to_string();
    let id = asset.get("id")
        .and_then(|v| v.as_str())
        .unwrap_or(&default_id);
    
    let asset_type = asset.get("asset_type")
        .and_then(|v| v.as_str())
        .ok_or("Missing asset_type")?;
    
    let name = asset.get("name")
        .and_then(|v| v.as_str())
        .ok_or("Missing name")?;
    
    let config_str = asset.get("config")
        .map(|v| serde_json::to_string(v).unwrap_or_default());
    
    let metadata_str = asset.get("metadata")
        .map(|v| serde_json::to_string(v).unwrap_or_default());
    
    let file_path = asset.get("file_path")
        .and_then(|v| v.as_str());
    
    let file_size = asset.get("file_size")
        .and_then(|v| v.as_u64());
    
    let quality_score = asset.get("quality_score")
        .and_then(|v| v.as_u64())
        .map(|v| v as u32);
    
    let now = Utc::now().to_rfc3339();
    let created_at = asset.get("created_at")
        .and_then(|v| v.as_str())
        .unwrap_or(&now);
    
    conn.execute(
        "INSERT OR REPLACE INTO assets 
         (id, asset_type, name, config, metadata, file_path, file_size, quality_score, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![id, asset_type, name, config_str, metadata_str, file_path, file_size, quality_score, created_at, now],
    ).map_err(|e| format!("Failed to save asset: {}", e))?;
    
    Ok(id.to_string())
}

#[tauri::command]
async fn db_delete_asset(
    db_state: State<'_, DbState>,
    asset_id: String
) -> Result<String, String> {
    let conn = db_state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let rows_affected = conn.execute(
        "DELETE FROM assets WHERE id = ?1",
        params![asset_id],
    ).map_err(|e| format!("Failed to delete asset: {}", e))?;
    
    if rows_affected == 0 {
        return Err("Asset not found".to_string());
    }
    
    Ok("Asset deleted successfully".to_string())
}

#[tauri::command]
async fn db_get_setting(
    db_state: State<'_, DbState>,
    key: String
) -> Result<Option<String>, String> {
    let conn = db_state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let result = stmt.query_row(params![key], |row| {
        Ok(row.get::<_, String>(0)?)
    });
    
    match result {
        Ok(value) => Ok(Some(value)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(format!("Database error: {}", e))
    }
}

#[tauri::command]
async fn db_save_setting(
    db_state: State<'_, DbState>,
    key: String,
    value: String
) -> Result<String, String> {
    let conn = db_state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let now = Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)",
        params![key, value, now],
    ).map_err(|e| format!("Failed to save setting: {}", e))?;
    
    Ok("Setting saved successfully".to_string())
}

#[tauri::command]
async fn fs_save_file(path: String, data: Vec<u8>) -> Result<String, String> {
    let file_path = PathBuf::from(&path);
    
    // Ensure parent directory exists
    if let Some(parent) = file_path.parent() {
        tokio::fs::create_dir_all(parent).await
            .map_err(|e| format!("Failed to create directories: {}", e))?;
    }
    
    tokio::fs::write(&file_path, data).await
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(format!("File saved successfully to: {}", path))
}

#[tauri::command]
async fn fs_read_file(path: String) -> Result<Vec<u8>, String> {
    let file_path = PathBuf::from(&path);
    
    if !file_path.exists() {
        return Err(format!("File does not exist: {}", path));
    }
    
    tokio::fs::read(&file_path).await
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
async fn fs_ensure_dir(path: String) -> Result<String, String> {
    let dir_path = PathBuf::from(&path);
    
    tokio::fs::create_dir_all(&dir_path).await
        .map_err(|e| format!("Failed to create directory: {}", e))?;
    
    Ok(format!("Directory ensured: {}", path))
}

#[tauri::command]
async fn dialog_open_directory(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    use std::sync::mpsc;
    
    let (tx, rx) = mpsc::channel();
    
    app_handle.dialog().file().pick_folder(move |folder_path| {
        let result = match folder_path {
            Some(path) => Ok(vec![path.to_string()]),
            None => Ok(vec![]) // User cancelled
        };
        let _ = tx.send(result);
    });
    
    rx.recv().map_err(|e| format!("Dialog communication error: {}", e))?
}

#[tauri::command]
async fn dialog_save_file(
    app_handle: tauri::AppHandle,
    options: serde_json::Value
) -> Result<String, String> {
    use std::sync::mpsc;
    
    let (tx, rx) = mpsc::channel();
    
    let mut file_dialog = app_handle.dialog().file();
    
    // Extract options from JSON
    if let Some(title) = options.get("title").and_then(|v| v.as_str()) {
        file_dialog = file_dialog.set_title(title);
    }
    
    if let Some(filename) = options.get("defaultFileName").and_then(|v| v.as_str()) {
        file_dialog = file_dialog.set_file_name(filename);
    }
    
    // Add file filters if provided
    if let Some(filters) = options.get("filters").and_then(|v| v.as_array()) {
        for filter in filters {
            if let (Some(name), Some(extensions)) = (
                filter.get("name").and_then(|v| v.as_str()),
                filter.get("extensions").and_then(|v| v.as_array())
            ) {
                let ext_strings: Vec<&str> = extensions
                    .iter()
                    .filter_map(|e| e.as_str())
                    .collect();
                file_dialog = file_dialog.add_filter(name, &ext_strings);
            }
        }
    }
    
    file_dialog.save_file(move |file_path| {
        let result = match file_path {
            Some(path) => Ok(path.to_string()),
            None => Err("User cancelled".to_string())
        };
        let _ = tx.send(result);
    });
    
    rx.recv().map_err(|e| format!("Dialog communication error: {}", e))?
}

#[tauri::command]
async fn generate_asset(asset_type: String, config: serde_json::Value) -> Result<serde_json::Value, String> {
    // This would generate an asset based on the type and configuration
    // For now, returning a placeholder response
    Ok(serde_json::json!({
        "type": asset_type,
        "config": config,
        "data": "placeholder-generated-data",
        "metadata": {
            "generated_at": Utc::now().to_rfc3339(),
            "version": "1.0.0"
        }
    }))
}

#[tauri::command]
async fn generate_batch(_assets: Vec<serde_json::Value>) -> Result<Vec<serde_json::Value>, String> {
    // This would generate multiple assets
    // For now, returning an empty vector as a placeholder
    Ok(vec![])
}
