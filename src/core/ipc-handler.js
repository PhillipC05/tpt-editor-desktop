/**
 * TPT Asset Editor Desktop - IPC Handler
 * Manages Inter-Process Communication between main and renderer processes
 */

const { ipcMain, dialog, shell, clipboard } = require('electron');
const path = require('path');
const fs = require('fs').promises;

class IPCHandler {
    constructor(databaseManager) {
        this.databaseManager = databaseManager;
        this.handlers = new Map();
        this.activeOperations = new Map();
        this.operationId = 0;

        this.setupCoreHandlers();
    }

    /**
     * Set up IPC handlers for the main window
     */
    setupIPCHandlers(window) {
        this.mainWindow = window;
        this.registerAllHandlers();
        console.log('IPC handlers registered');
    }

    /**
     * Set up core IPC handlers
     */
    setupCoreHandlers() {
        // Application lifecycle
        this.registerHandler('app:get-version', this.handleGetVersion.bind(this));
        this.registerHandler('app:get-platform', this.handleGetPlatform.bind(this));
        this.registerHandler('app:quit', this.handleQuit.bind(this));
        this.registerHandler('app:restart', this.handleRestart.bind(this));

        // Window management
        this.registerHandler('window:minimize', this.handleWindowMinimize.bind(this));
        this.registerHandler('window:maximize', this.handleWindowMaximize.bind(this));
        this.registerHandler('window:restore', this.handleWindowRestore.bind(this));
        this.registerHandler('window:close', this.handleWindowClose.bind(this));
        this.registerHandler('window:toggle-dev-tools', this.handleToggleDevTools.bind(this));

        // File system operations
        this.registerHandler('fs:read-file', this.handleReadFile.bind(this));
        this.registerHandler('fs:write-file', this.handleWriteFile.bind(this));
        this.registerHandler('fs:delete-file', this.handleDeleteFile.bind(this));
        this.registerHandler('fs:list-directory', this.handleListDirectory.bind(this));
        this.registerHandler('fs:create-directory', this.handleCreateDirectory.bind(this));
        this.registerHandler('fs:select-directory', this.handleSelectDirectory.bind(this));
        this.registerHandler('fs:select-file', this.handleSelectFile.bind(this));

        // Database operations
        this.registerHandler('db:get-assets', this.handleGetAssets.bind(this));
        this.registerHandler('db:save-asset', this.handleSaveAsset.bind(this));
        this.registerHandler('db:delete-asset', this.handleDeleteAsset.bind(this));
        this.registerHandler('db:update-asset', this.handleUpdateAsset.bind(this));
        this.registerHandler('db:get-settings', this.handleGetSettings.bind(this));
        this.registerHandler('db:save-setting', this.handleSaveSetting.bind(this));

        // Asset generation
        this.registerHandler('generate:asset', this.handleGenerateAsset.bind(this));
        this.registerHandler('generate:batch', this.handleGenerateBatch.bind(this));
        this.registerHandler('generate:preview', this.handleGeneratePreview.bind(this));

        // Export operations
        this.registerHandler('export:asset', this.handleExportAsset.bind(this));
        this.registerHandler('export:batch', this.handleExportBatch.bind(this));
        this.registerHandler('export:project', this.handleExportProject.bind(this));

        // Dialog operations
        this.registerHandler('dialog:open-directory', this.handleOpenDirectoryDialog.bind(this));
        this.registerHandler('dialog:save-file', this.handleSaveFileDialog.bind(this));
        this.registerHandler('dialog:open-file', this.handleOpenFileDialog.bind(this));
        this.registerHandler('dialog:message-box', this.handleMessageBox.bind(this));

        // System operations
        this.registerHandler('system:open-external', this.handleOpenExternal.bind(this));
        this.registerHandler('system:clipboard-write', this.handleClipboardWrite.bind(this));
        this.registerHandler('system:clipboard-read', this.handleClipboardRead.bind(this));
        this.registerHandler('system:get-path', this.handleGetPath.bind(this));

        // Menu actions
        this.registerHandler('menu:action', this.handleMenuAction.bind(this));

        // Progress tracking
        this.registerHandler('progress:start', this.handleProgressStart.bind(this));
        this.registerHandler('progress:update', this.handleProgressUpdate.bind(this));
        this.registerHandler('progress:complete', this.handleProgressComplete.bind(this));
    }

    /**
     * Register an IPC handler
     */
    registerHandler(channel, handler) {
        this.handlers.set(channel, handler);
        ipcMain.handle(channel, async (event, ...args) => {
            try {
                return await handler(event, ...args);
            } catch (error) {
                console.error(`Error in IPC handler '${channel}':`, error);
                throw error;
            }
        });
    }

    /**
     * Register all handlers with ipcMain
     */
    registerAllHandlers() {
        // All handlers are already registered in setupCoreHandlers
        console.log(`Registered ${this.handlers.size} IPC handlers`);
    }

    /**
     * Send message to renderer process
     */
    sendToRenderer(channel, data) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send(channel, data);
        }
    }

    /**
     * Handle get version
     */
    async handleGetVersion() {
        const packageJson = require('../../package.json');
        return packageJson.version;
    }

    /**
     * Handle get platform
     */
    async handleGetPlatform() {
        return process.platform;
    }

    /**
     * Handle quit application
     */
    async handleQuit() {
        const { app } = require('electron');
        app.quit();
    }

    /**
     * Handle restart application
     */
    async handleRestart() {
        const { app } = require('electron');
        app.relaunch();
        app.quit();
    }

    /**
     * Handle window minimize
     */
    async handleWindowMinimize() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.minimize();
        }
    }

    /**
     * Handle window maximize
     */
    async handleWindowMaximize() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            if (this.mainWindow.isMaximized()) {
                this.mainWindow.restore();
            } else {
                this.mainWindow.maximize();
            }
        }
    }

    /**
     * Handle window restore
     */
    async handleWindowRestore() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.restore();
        }
    }

    /**
     * Handle window close
     */
    async handleWindowClose() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.close();
        }
    }

    /**
     * Handle toggle dev tools
     */
    async handleToggleDevTools() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.toggleDevTools();
        }
    }

    /**
     * Handle read file
     */
    async handleReadFile(event, filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return { success: true, content };
        } catch (error) {
            console.error('Error reading file:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle write file
     */
    async handleWriteFile(event, filePath, content) {
        try {
            await fs.writeFile(filePath, content, 'utf8');
            return { success: true };
        } catch (error) {
            console.error('Error writing file:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle delete file
     */
    async handleDeleteFile(event, filePath) {
        try {
            await fs.unlink(filePath);
            return { success: true };
        } catch (error) {
            console.error('Error deleting file:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle list directory
     */
    async handleListDirectory(event, dirPath) {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            const result = items.map(item => ({
                name: item.name,
                isDirectory: item.isDirectory(),
                isFile: item.isFile(),
                path: path.join(dirPath, item.name)
            }));
            return { success: true, items: result };
        } catch (error) {
            console.error('Error listing directory:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle create directory
     */
    async handleCreateDirectory(event, dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
            return { success: true };
        } catch (error) {
            console.error('Error creating directory:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle select directory dialog
     */
    async handleSelectDirectoryDialog() {
        const result = await dialog.showOpenDialog(this.mainWindow, {
            properties: ['openDirectory', 'createDirectory'],
            title: 'Select Directory'
        });

        return {
            canceled: result.canceled,
            filePaths: result.filePaths
        };
    }

    /**
     * Handle select file dialog
     */
    async handleSelectFileDialog(event, options = {}) {
        const defaultOptions = {
            properties: ['openFile'],
            title: 'Select File'
        };

        const dialogOptions = { ...defaultOptions, ...options };
        const result = await dialog.showOpenDialog(this.mainWindow, dialogOptions);

        return {
            canceled: result.canceled,
            filePaths: result.filePaths
        };
    }

    /**
     * Handle get assets from database
     */
    async handleGetAssets(event, query = {}) {
        try {
            const assets = await this.databaseManager.getAssets(query);
            return { success: true, assets };
        } catch (error) {
            console.error('Error getting assets:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle save asset to database
     */
    async handleSaveAsset(event, asset) {
        try {
            const result = await this.databaseManager.saveAsset(asset);
            return { success: true, id: result };
        } catch (error) {
            console.error('Error saving asset:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle delete asset from database
     */
    async handleDeleteAsset(event, assetId) {
        try {
            await this.databaseManager.deleteAsset(assetId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting asset:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle update asset in database
     */
    async handleUpdateAsset(event, assetId, updates) {
        try {
            await this.databaseManager.updateAsset(assetId, updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating asset:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle get settings
     */
    async handleGetSettings(event, key) {
        try {
            const value = await this.databaseManager.getSetting(key);
            return { success: true, value };
        } catch (error) {
            console.error('Error getting setting:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle save setting
     */
    async handleSaveSetting(event, key, value) {
        try {
            await this.databaseManager.saveSetting(key, value);
            return { success: true };
        } catch (error) {
            console.error('Error saving setting:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle asset generation
     */
    async handleGenerateAsset(event, type, config) {
        try {
            // This would integrate with the asset generation system
            // For now, return a placeholder response
            const asset = {
                id: Date.now().toString(),
                type: type,
                name: `${type} Asset`,
                config: config,
                created_at: new Date().toISOString(),
                sprite: {
                    data: 'placeholder',
                    width: 64,
                    height: 64,
                    format: 'png'
                }
            };

            return { success: true, asset };
        } catch (error) {
            console.error('Error generating asset:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle batch generation
     */
    async handleGenerateBatch(event, batchConfig) {
        try {
            // This would handle batch asset generation
            // For now, return a placeholder response
            const assets = [];
            for (let i = 0; i < batchConfig.count; i++) {
                assets.push({
                    id: `${Date.now()}-${i}`,
                    type: batchConfig.type,
                    name: `${batchConfig.type} Asset ${i + 1}`,
                    created_at: new Date().toISOString()
                });
            }

            return { success: true, assets };
        } catch (error) {
            console.error('Error generating batch:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle preview generation
     */
    async handleGeneratePreview(event, type, config) {
        try {
            // This would generate a preview asset
            const preview = {
                type: type,
                config: config,
                sprite: {
                    data: 'preview-placeholder',
                    width: 128,
                    height: 128,
                    format: 'png'
                }
            };

            return { success: true, preview };
        } catch (error) {
            console.error('Error generating preview:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle asset export
     */
    async handleExportAsset(event, assetId, format, options = {}) {
        try {
            // Get asset from database
            const asset = await this.databaseManager.getAssetById(assetId);
            if (!asset) {
                return { success: false, error: 'Asset not found' };
            }

            // Show save dialog
            const result = await dialog.showSaveDialog(this.mainWindow, {
                title: 'Export Asset',
                defaultPath: `${asset.name}.${format}`,
                filters: this.getExportFilters(format)
            });

            if (result.canceled) {
                return { success: false, error: 'Export cancelled' };
            }

            // Export the asset (placeholder implementation)
            await this.exportAssetToFile(asset, result.filePath, format, options);

            return { success: true, path: result.filePath };
        } catch (error) {
            console.error('Error exporting asset:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle batch export
     */
    async handleExportBatch(event, assetIds, format, options = {}) {
        try {
            // Show directory selection dialog
            const result = await dialog.showOpenDialog(this.mainWindow, {
                properties: ['openDirectory'],
                title: 'Select Export Directory'
            });

            if (result.canceled) {
                return { success: false, error: 'Export cancelled' };
            }

            const exportDir = result.filePaths[0];
            const exportedPaths = [];

            // Export each asset
            for (const assetId of assetIds) {
                const asset = await this.databaseManager.getAssetById(assetId);
                if (asset) {
                    const fileName = `${asset.name}.${format}`;
                    const filePath = path.join(exportDir, fileName);

                    await this.exportAssetToFile(asset, filePath, format, options);
                    exportedPaths.push(filePath);
                }
            }

            return { success: true, paths: exportedPaths };
        } catch (error) {
            console.error('Error exporting batch:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle project export
     */
    async handleExportProject(event, projectConfig) {
        try {
            // Show directory selection dialog
            const result = await dialog.showOpenDialog(this.mainWindow, {
                properties: ['openDirectory', 'createDirectory'],
                title: 'Select Project Export Directory'
            });

            if (result.canceled) {
                return { success: false, error: 'Export cancelled' };
            }

            const exportDir = result.filePaths[0];

            // Export project (placeholder implementation)
            await this.exportProjectToDirectory(projectConfig, exportDir);

            return { success: true, path: exportDir };
        } catch (error) {
            console.error('Error exporting project:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get export file filters
     */
    getExportFilters(format) {
        const filters = {
            png: [{ name: 'PNG Image', extensions: ['png'] }],
            jpg: [{ name: 'JPEG Image', extensions: ['jpg', 'jpeg'] }],
            svg: [{ name: 'SVG Vector', extensions: ['svg'] }],
            json: [{ name: 'JSON Data', extensions: ['json'] }],
            wav: [{ name: 'WAV Audio', extensions: ['wav'] }],
            mp3: [{ name: 'MP3 Audio', extensions: ['mp3'] }]
        };

        return filters[format] || [{ name: 'All Files', extensions: ['*'] }];
    }

    /**
     * Export asset to file (placeholder implementation)
     */
    async exportAssetToFile(asset, filePath, format, options) {
        // This would implement the actual export logic
        // For now, create a placeholder file
        const content = JSON.stringify(asset, null, 2);
        await fs.writeFile(filePath, content, 'utf8');
    }

    /**
     * Export project to directory (placeholder implementation)
     */
    async exportProjectToDirectory(projectConfig, exportDir) {
        // This would implement the actual project export logic
        const projectPath = path.join(exportDir, 'project.json');
        const content = JSON.stringify(projectConfig, null, 2);
        await fs.writeFile(projectPath, content, 'utf8');
    }

    /**
     * Handle save file dialog
     */
    async handleSaveFileDialog(event, options = {}) {
        const defaultOptions = {
            title: 'Save File'
        };

        const dialogOptions = { ...defaultOptions, ...options };
        const result = await dialog.showSaveDialog(this.mainWindow, dialogOptions);

        return {
            canceled: result.canceled,
            filePath: result.filePath
        };
    }

    /**
     * Handle open file dialog
     */
    async handleOpenFileDialog(event, options = {}) {
        const defaultOptions = {
            properties: ['openFile']
        };

        const dialogOptions = { ...defaultOptions, ...options };
        const result = await dialog.showOpenDialog(this.mainWindow, dialogOptions);

        return {
            canceled: result.canceled,
            filePaths: result.filePaths
        };
    }

    /**
     * Handle message box
     */
    async handleMessageBox(event, options = {}) {
        const result = await dialog.showMessageBox(this.mainWindow, options);
        return result;
    }

    /**
     * Handle open external URL
     */
    async handleOpenExternal(event, url) {
        try {
            await shell.openExternal(url);
            return { success: true };
        } catch (error) {
            console.error('Error opening external URL:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle clipboard write
     */
    async handleClipboardWrite(event, text) {
        try {
            clipboard.writeText(text);
            return { success: true };
        } catch (error) {
            console.error('Error writing to clipboard:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle clipboard read
     */
    async handleClipboardRead() {
        try {
            const text = clipboard.readText();
            return { success: true, text };
        } catch (error) {
            console.error('Error reading from clipboard:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle get system path
     */
    async handleGetPath(event, name) {
        const { app } = require('electron');
        return app.getPath(name);
    }

    /**
     * Handle menu action
     */
    async handleMenuAction(event, action) {
        // Forward menu actions to renderer
        this.sendToRenderer('menu-action', { action });
    }

    /**
     * Handle progress start
     */
    async handleProgressStart(event, operation) {
        const operationId = `op-${++this.operationId}`;
        this.activeOperations.set(operationId, operation);

        this.sendToRenderer('progress-started', { operationId, operation });
        return { operationId };
    }

    /**
     * Handle progress update
     */
    async handleProgressUpdate(event, operationId, progress, details) {
        if (this.activeOperations.has(operationId)) {
            this.sendToRenderer('progress-updated', { operationId, progress, details });
        }
    }

    /**
     * Handle progress complete
     */
    async handleProgressComplete(event, operationId, success, result) {
        if (this.activeOperations.has(operationId)) {
            this.activeOperations.delete(operationId);
            this.sendToRenderer('progress-completed', { operationId, success, result });
        }
    }

    /**
     * Clean up IPC handlers
     */
    cleanup() {
        console.log('Cleaning up IPC handlers...');

        // Remove all handlers
        for (const channel of this.handlers.keys()) {
            ipcMain.removeHandler(channel);
        }

        this.handlers.clear();
        this.activeOperations.clear();
    }

    /**
     * Get handler statistics
     */
    getHandlerStats() {
        return {
            totalHandlers: this.handlers.size,
            activeOperations: this.activeOperations.size,
            handlers: Array.from(this.handlers.keys())
        };
    }
}

module.exports = IPCHandler;
