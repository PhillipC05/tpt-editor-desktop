/**
 * Preload Script - Secure bridge between main and renderer processes
 * This script runs in the renderer process but has access to Node.js APIs
 * It exposes a secure API to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Application info
    getAppInfo: () => ipcRenderer.invoke('app-get-info'),
    quitApp: () => ipcRenderer.invoke('app-quit'),
    restartApp: () => ipcRenderer.invoke('app-restart'),
    openExternal: (url) => ipcRenderer.invoke('app-open-external', url),
    showItemInFolder: (fullPath) => ipcRenderer.invoke('app-show-item-in-folder', fullPath),
    getSystemInfo: () => ipcRenderer.invoke('app-get-system-info'),

    // Asset operations
    getAssets: (filters) => ipcRenderer.invoke('db-get-assets', filters),
    getAsset: (assetId) => ipcRenderer.invoke('db-get-asset', assetId),
    saveAsset: (asset) => ipcRenderer.invoke('db-save-asset', asset),
    updateAsset: (assetId, updates) => ipcRenderer.invoke('db-update-asset', assetId, updates),
    deleteAsset: (assetId) => ipcRenderer.invoke('db-delete-asset', assetId),
    searchAssets: (query, filters) => ipcRenderer.invoke('db-search-assets', query, filters),
    getAssetStats: () => ipcRenderer.invoke('db-get-asset-stats'),
    batchSaveAssets: (assets) => ipcRenderer.invoke('db-batch-save-assets', assets),
    batchDeleteAssets: (assetIds) => ipcRenderer.invoke('db-batch-delete-assets', assetIds),

    // Settings operations
    getSetting: (key) => ipcRenderer.invoke('db-get-setting', key),
    setSetting: (key, value) => ipcRenderer.invoke('db-set-setting', key, value),
    getAllSettings: () => ipcRenderer.invoke('db-get-all-settings'),
    deleteSetting: (key) => ipcRenderer.invoke('db-delete-setting', key),
    resetSettings: () => ipcRenderer.invoke('db-reset-settings'),

    // File system operations
    showOpenDialog: (options) => ipcRenderer.invoke('dialog-open-file', options),
    showOpenDirectoryDialog: (options) => ipcRenderer.invoke('dialog-open-directory', options),
    showSaveDialog: (options) => ipcRenderer.invoke('dialog-save-file', options),
    readFile: (filePath, options) => ipcRenderer.invoke('fs-read-file', filePath, options),
    writeFile: (filePath, data, options) => ipcRenderer.invoke('fs-write-file', filePath, data, options),
    fileExists: (filePath) => ipcRenderer.invoke('fs-file-exists', filePath),
    getFileStats: (filePath) => ipcRenderer.invoke('fs-get-file-stats', filePath),
    createDirectory: (dirPath) => ipcRenderer.invoke('fs-create-directory', dirPath),
    readDirectory: (dirPath) => ipcRenderer.invoke('fs-read-directory', dirPath),
    deleteFile: (filePath) => ipcRenderer.invoke('fs-delete', filePath),
    copyFile: (sourcePath, destPath) => ipcRenderer.invoke('fs-copy-file', sourcePath, destPath),
    moveFile: (sourcePath, destPath) => ipcRenderer.invoke('fs-move-file', sourcePath, destPath),

    // Generator operations
    generateAsset: (assetType, config) => ipcRenderer.invoke('generate-asset', assetType, config),
    getGeneratorConfigSchema: (assetType) => ipcRenderer.invoke('get-generator-config-schema', assetType),
    getAvailableGenerators: () => ipcRenderer.invoke('get-available-generators'),
    validateGeneratorConfig: (assetType, config) => ipcRenderer.invoke('validate-generator-config', assetType, config),

    // Plugin operations
    getInstalledPlugins: () => ipcRenderer.invoke('plugins-get-installed'),
    installPlugin: (pluginPath) => ipcRenderer.invoke('plugins-install', pluginPath),
    uninstallPlugin: (pluginId) => ipcRenderer.invoke('plugins-uninstall', pluginId),
    enablePlugin: (pluginId) => ipcRenderer.invoke('plugins-enable', pluginId),
    disablePlugin: (pluginId) => ipcRenderer.invoke('plugins-disable', pluginId),
    getPluginSettings: (pluginId) => ipcRenderer.invoke('plugins-get-settings', pluginId),
    updatePluginSettings: (pluginId, settings) => ipcRenderer.invoke('plugins-update-settings', pluginId, settings),

    // Error handling
    showErrorDialog: (options) => ipcRenderer.invoke('show-error-dialog', options),
    showMessageDialog: (options) => ipcRenderer.invoke('show-message-dialog', options),
    showConfirmDialog: (options) => ipcRenderer.invoke('show-confirm-dialog', options),

    // Event listeners
    on: (channel, callback) => {
        // Whitelist of allowed channels
        const allowedChannels = [
            'menu-action',
            'asset-generation-progress',
            'asset-generation-complete',
            'batch-progress',
            'settings-changed',
            'plugin-loaded',
            'plugin-unloaded',
            'window-focus',
            'window-blur'
        ];

        if (allowedChannels.includes(channel)) {
            ipcRenderer.on(channel, callback);

            // Return cleanup function
            return () => {
                ipcRenderer.removeListener(channel, callback);
            };
        } else {
            console.warn(`Channel '${channel}' is not allowed`);
        }
    },

    // Remove event listeners
    removeListener: (channel, callback) => {
        ipcRenderer.removeListener(channel, callback);
    },

    // Send messages to main process
    send: (channel, ...args) => {
        // Whitelist of allowed channels for sending
        const allowedChannels = [
            'renderer-ready',
            'request-focus',
            'request-minimize',
            'request-maximize',
            'request-close',
            'log-message',
            'performance-metrics'
        ];

        if (allowedChannels.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        } else {
            console.warn(`Channel '${channel}' is not allowed for sending`);
        }
    }
});

// Additional security: Remove any existing electron globals
if (window.electron) {
    delete window.electron;
}

// Prevent context isolation bypass
Object.freeze(window.electronAPI);

// Log that preload script has loaded
console.log('TPT Asset Editor preload script loaded successfully');
