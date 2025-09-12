/**
 * TPT Database Schema - SQLite database management for all asset types
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs').promises;

class DatabaseSchema {
    constructor(dbPath = null) {
        // Use default path if not provided
        if (!dbPath) {
            const userDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
            dbPath = path.join(userDataPath, 'tpt-asset-editor', 'assets.db');
        }

        // Ensure directory exists
        const dbDir = path.dirname(dbPath);
        try {
            require('fs').mkdirSync(dbDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        this.db = new Database(dbPath);
        this.init();
    }

    init() {
        // Enable WAL mode for better performance
        this.db.pragma('journal_mode = WAL');

        // Create all tables
        this.createAssetsTable();
        this.createAudioAssetsTable();
        this.createVehicleAssetsTable();
        this.createBuildingAssetsTable();
        this.createParticleAssetsTable();
        this.createUIAssetsTable();
        this.createTagsTable();
        this.createAssetTagsTable();
        this.createPresetsTable();
        this.createTemplatesTable();
        this.createProgressHistoryTable();
        this.createPerformanceMetricsTable();

        // Create indexes for better performance
        this.createIndexes();
    }

    createAssetsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS assets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                data TEXT NOT NULL,
                format TEXT NOT NULL,
                width INTEGER,
                height INTEGER,
                file_size INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                favorite BOOLEAN DEFAULT 0,
                tags TEXT DEFAULT '[]'
            )
        `;
        this.db.exec(sql);
    }

    createAudioAssetsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS audio_assets (
                id TEXT PRIMARY KEY,
                asset_id TEXT NOT NULL UNIQUE,
                duration REAL,
                sample_rate INTEGER,
                channels INTEGER,
                bit_depth INTEGER,
                quality INTEGER,
                audio_type TEXT,
                waveform_data TEXT,
                spectrum_data TEXT,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
            )
        `;
        this.db.exec(sql);
    }

    createVehicleAssetsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS vehicle_assets (
                id TEXT PRIMARY KEY,
                asset_id TEXT NOT NULL UNIQUE,
                vehicle_type TEXT,
                car_type TEXT,
                color TEXT,
                damage REAL DEFAULT 0,
                customization TEXT DEFAULT '{}',
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
            )
        `;
        this.db.exec(sql);
    }

    createBuildingAssetsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS building_assets (
                id TEXT PRIMARY KEY,
                asset_id TEXT NOT NULL UNIQUE,
                building_type TEXT,
                style TEXT,
                color TEXT,
                roof_color TEXT,
                has_garden BOOLEAN DEFAULT 0,
                architectural_style TEXT,
                customization TEXT DEFAULT '{}',
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
            )
        `;
        this.db.exec(sql);
    }

    createParticleAssetsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS particle_assets (
                id TEXT PRIMARY KEY,
                asset_id TEXT NOT NULL UNIQUE,
                effect_type TEXT,
                frame_count INTEGER DEFAULT 1,
                color TEXT,
                intensity REAL DEFAULT 1.0,
                animation_data TEXT,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
            )
        `;
        this.db.exec(sql);
    }

    createUIAssetsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS ui_assets (
                id TEXT PRIMARY KEY,
                asset_id TEXT NOT NULL UNIQUE,
                element_type TEXT,
                state TEXT DEFAULT 'normal',
                style TEXT,
                color TEXT,
                text TEXT,
                icon TEXT,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
            )
        `;
        this.db.exec(sql);
    }

    createTagsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                color TEXT DEFAULT '#666666',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        this.db.exec(sql);
    }

    createAssetTagsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS asset_tags (
                asset_id TEXT NOT NULL,
                tag_id INTEGER NOT NULL,
                PRIMARY KEY (asset_id, tag_id),
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )
        `;
        this.db.exec(sql);
    }

    createPresetsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS presets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                asset_type TEXT NOT NULL,
                config TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                usage_count INTEGER DEFAULT 0
            )
        `;
        this.db.exec(sql);
    }

    createTemplatesTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS templates (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                asset_type TEXT NOT NULL,
                config TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                usage_count INTEGER DEFAULT 0
            )
        `;
        this.db.exec(sql);
    }

    createProgressHistoryTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS progress_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation_id TEXT UNIQUE NOT NULL,
                operation_type TEXT NOT NULL,
                description TEXT NOT NULL,
                total_items INTEGER DEFAULT 1,
                completed_items INTEGER DEFAULT 0,
                status TEXT DEFAULT 'running',
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME,
                duration REAL,
                final_details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        this.db.exec(sql);
    }

    createPerformanceMetricsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS performance_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT UNIQUE NOT NULL,
                metric_value REAL NOT NULL,
                recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        this.db.exec(sql);
    }

    createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type)',
            'CREATE INDEX IF NOT EXISTS idx_assets_created ON assets(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_assets_name ON assets(name)',
            'CREATE INDEX IF NOT EXISTS idx_audio_assets_type ON audio_assets(audio_type)',
            'CREATE INDEX IF NOT EXISTS idx_vehicle_type ON vehicle_assets(vehicle_type)',
            'CREATE INDEX IF NOT EXISTS idx_building_type ON building_assets(building_type)',
            'CREATE INDEX IF NOT EXISTS idx_particle_type ON particle_assets(effect_type)',
            'CREATE INDEX IF NOT EXISTS idx_ui_type ON ui_assets(element_type)'
        ];

        indexes.forEach(sql => this.db.exec(sql));
    }

    // Asset CRUD operations
    saveAsset(asset) {
        const insert = this.db.prepare(`
            INSERT OR REPLACE INTO assets
            (id, name, type, data, format, width, height, file_size, updated_at, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        `);

        const fileSize = asset.sprite?.data ? Buffer.from(asset.sprite.data, 'base64').length :
                        asset.audio?.data ? Buffer.from(asset.audio.data, 'base64').length : 0;

        insert.run(
            asset.id,
            asset.name,
            asset.type,
            asset.sprite?.data || asset.audio?.data || '',
            asset.sprite?.format || asset.audio?.format || 'png',
            asset.sprite?.width || 0,
            asset.sprite?.height || 0,
            fileSize,
            JSON.stringify(asset.tags || [])
        );

        // Save type-specific data
        switch (asset.type) {
            case 'audio':
                this.saveAudioAsset(asset);
                break;
            case 'vehicle':
                this.saveVehicleAsset(asset);
                break;
            case 'building':
                this.saveBuildingAsset(asset);
                break;
            case 'particle':
                this.saveParticleAsset(asset);
                break;
            case 'ui':
                this.saveUIAsset(asset);
                break;
        }

        return asset.id;
    }

    saveAudioAsset(asset) {
        const insert = this.db.prepare(`
            INSERT OR REPLACE INTO audio_assets
            (id, asset_id, duration, sample_rate, channels, bit_depth, quality, audio_type, waveform_data, spectrum_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
            asset.id,
            asset.id,
            asset.audio?.duration || 0,
            asset.audio?.sampleRate || 44100,
            asset.audio?.channels || 1,
            16,
            asset.config?.quality || 128,
            asset.config?.type || 'sfx',
            asset.waveformData || null,
            asset.spectrumData || null
        );
    }

    saveVehicleAsset(asset) {
        const insert = this.db.prepare(`
            INSERT OR REPLACE INTO vehicle_assets
            (id, asset_id, vehicle_type, car_type, color, damage, customization)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
            asset.id,
            asset.id,
            asset.metadata?.vehicleType || 'car',
            asset.metadata?.carType || 'sedan',
            asset.metadata?.color || '#FF0000',
            0,
            JSON.stringify(asset.customization || {})
        );
    }

    saveBuildingAsset(asset) {
        const insert = this.db.prepare(`
            INSERT OR REPLACE INTO building_assets
            (id, asset_id, building_type, style, color, roof_color, has_garden, architectural_style, customization)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
            asset.id,
            asset.id,
            asset.metadata?.buildingType || 'cottage',
            asset.metadata?.style || 'traditional',
            asset.metadata?.color || '#8B4513',
            asset.config?.roofColor || '#654321',
            asset.config?.hasGarden ? 1 : 0,
            asset.config?.architecturalStyle || null,
            JSON.stringify(asset.customization || {})
        );
    }

    saveParticleAsset(asset) {
        const insert = this.db.prepare(`
            INSERT OR REPLACE INTO particle_assets
            (id, asset_id, effect_type, frame_count, color, intensity, animation_data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
            asset.id,
            asset.id,
            asset.metadata?.effectType || 'explosion',
            asset.metadata?.frameCount || 1,
            asset.config?.color || '#FFFFFF',
            asset.config?.intensity || 1.0,
            JSON.stringify(asset.animationData || {})
        );
    }

    saveUIAsset(asset) {
        const insert = this.db.prepare(`
            INSERT OR REPLACE INTO ui_assets
            (id, asset_id, element_type, state, style, color, text, icon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
            asset.id,
            asset.id,
            asset.metadata?.elementType || 'button',
            asset.metadata?.state || 'normal',
            asset.metadata?.style || 'default',
            asset.config?.color || '#4A90E2',
            asset.config?.text || '',
            asset.config?.icon || null
        );
    }

    // Retrieval methods
    getAssets(type = null, limit = 50, offset = 0) {
        let sql = 'SELECT * FROM assets WHERE 1=1';
        const params = [];

        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const stmt = this.db.prepare(sql);
        return stmt.all(...params);
    }

    getAsset(id) {
        const stmt = this.db.prepare('SELECT * FROM assets WHERE id = ?');
        return stmt.get(id);
    }

    getAudioAssets(limit = 50, offset = 0) {
        const sql = `
            SELECT a.*, aa.duration, aa.sample_rate, aa.channels, aa.bit_depth,
                   aa.quality, aa.audio_type, aa.waveform_data, aa.spectrum_data
            FROM assets a
            JOIN audio_assets aa ON a.id = aa.asset_id
            WHERE a.type = 'audio'
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `;
        return this.db.prepare(sql).all(limit, offset);
    }

    getVehicleAssets(limit = 50, offset = 0) {
        const sql = `
            SELECT a.*, va.vehicle_type, va.car_type, va.color, va.damage, va.customization
            FROM assets a
            JOIN vehicle_assets va ON a.id = va.asset_id
            WHERE a.type = 'vehicle'
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `;
        return this.db.prepare(sql).all(limit, offset);
    }

    getBuildingAssets(limit = 50, offset = 0) {
        const sql = `
            SELECT a.*, ba.building_type, ba.style, ba.color, ba.roof_color,
                   ba.has_garden, ba.architectural_style, ba.customization
            FROM assets a
            JOIN building_assets ba ON a.id = ba.asset_id
            WHERE a.type = 'building'
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `;
        return this.db.prepare(sql).all(limit, offset);
    }

    getParticleAssets(limit = 50, offset = 0) {
        const sql = `
            SELECT a.*, pa.effect_type, pa.frame_count, pa.color, pa.intensity, pa.animation_data
            FROM assets a
            JOIN particle_assets pa ON a.id = pa.asset_id
            WHERE a.type = 'particle'
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `;
        return this.db.prepare(sql).all(limit, offset);
    }

    getUIAssets(limit = 50, offset = 0) {
        const sql = `
            SELECT a.*, ua.element_type, ua.state, ua.style, ua.color, ua.text, ua.icon
            FROM assets a
            JOIN ui_assets ua ON a.id = ua.asset_id
            WHERE a.type = 'ui'
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `;
        return this.db.prepare(sql).all(limit, offset);
    }

    // Search and filter
    searchAssets(query, type = null, tags = [], limit = 50, offset = 0) {
        let sql = 'SELECT * FROM assets WHERE name LIKE ?';
        const params = [`%${query}%`];

        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }

        if (tags.length > 0) {
            sql += ` AND id IN (
                SELECT asset_id FROM asset_tags
                WHERE tag_id IN (
                    SELECT id FROM tags WHERE name IN (${tags.map(() => '?').join(',')})
                )
                GROUP BY asset_id
                HAVING COUNT(*) = ?
            )`;
            params.push(...tags, tags.length);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const stmt = this.db.prepare(sql);
        return stmt.all(...params);
    }

    // Tag management
    addTag(assetId, tagName, color = '#666666') {
        // Insert tag if it doesn't exist
        const insertTag = this.db.prepare(`
            INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)
        `);
        insertTag.run(tagName, color);

        // Get tag ID
        const getTagId = this.db.prepare('SELECT id FROM tags WHERE name = ?');
        const tag = getTagId.get(tagName);

        if (tag) {
            // Link asset to tag
            const linkTag = this.db.prepare(`
                INSERT OR IGNORE INTO asset_tags (asset_id, tag_id) VALUES (?, ?)
            `);
            linkTag.run(assetId, tag.id);
        }
    }

    // Audio-specific tagging
    addAudioTag(assetId, tagName, category = 'general') {
        const colorMap = {
            'sfx': '#FF6B6B',
            'music': '#4ECDC4',
            'ambient': '#45B7D1',
            'voice': '#96CEB4',
            'ui': '#FFEAA7',
            'general': '#DDA0DD'
        };

        const color = colorMap[category] || colorMap.general;
        this.addTag(assetId, tagName, color);
    }

    // Batch tagging for audio assets
    batchAddAudioTags(assetIds, tags, category = 'general') {
        const transaction = this.db.transaction(() => {
            assetIds.forEach(assetId => {
                tags.forEach(tag => {
                    this.addAudioTag(assetId, tag, category);
                });
            });
        });
        transaction();
    }

    removeTag(assetId, tagName) {
        const sql = `
            DELETE FROM asset_tags
            WHERE asset_id = ? AND tag_id = (
                SELECT id FROM tags WHERE name = ?
            )
        `;
        this.db.prepare(sql).run(assetId, tagName);
    }

    getTags() {
        return this.db.prepare('SELECT * FROM tags ORDER BY name').all();
    }

    getAssetTags(assetId) {
        const sql = `
            SELECT t.* FROM tags t
            JOIN asset_tags at ON t.id = at.tag_id
            WHERE at.asset_id = ?
            ORDER BY t.name
        `;
        return this.db.prepare(sql).all(assetId);
    }

    // Favorites
    toggleFavorite(assetId) {
        const sql = `
            UPDATE assets
            SET favorite = CASE WHEN favorite = 1 THEN 0 ELSE 1 END
            WHERE id = ?
        `;
        this.db.prepare(sql).run(assetId);
    }

    getFavorites(type = null) {
        let sql = 'SELECT * FROM assets WHERE favorite = 1';
        if (type) {
            sql += ' AND type = ?';
        }
        sql += ' ORDER BY updated_at DESC';

        const stmt = this.db.prepare(sql);
        return type ? stmt.all(type) : stmt.all();
    }

    // Delete operations
    deleteAsset(id) {
        const stmt = this.db.prepare('DELETE FROM assets WHERE id = ?');
        stmt.run(id);
        // CASCADE constraints will handle related tables
    }

    // Statistics
    getStats() {
        const stats = {
            total: 0,
            byType: {},
            recent: 0,
            favorites: 0
        };

        // Total count
        stats.total = this.db.prepare('SELECT COUNT(*) as count FROM assets').get().count;

        // Count by type
        const types = ['character', 'monster', 'item', 'tile', 'audio', 'vehicle', 'building', 'particle', 'ui'];
        types.forEach(type => {
            const count = this.db.prepare('SELECT COUNT(*) as count FROM assets WHERE type = ?').get(type).count;
            if (count > 0) {
                stats.byType[type] = count;
            }
        });

        // Recent assets (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        stats.recent = this.db.prepare('SELECT COUNT(*) as count FROM assets WHERE created_at >= ?').get(sevenDaysAgo.toISOString()).count;

        // Favorites
        stats.favorites = this.db.prepare('SELECT COUNT(*) as count FROM assets WHERE favorite = 1').get().count;

        return stats;
    }

    // Maintenance
    vacuum() {
        this.db.exec('VACUUM');
    }

    optimize() {
        this.db.exec('ANALYZE');
    }

    backup(backupPath) {
        // Create backup
        const backup = this.db.backup(backupPath);
        backup.step(-1);
        backup.finish();
    }

    close() {
        this.db.close();
    }
}

module.exports = DatabaseSchema;
