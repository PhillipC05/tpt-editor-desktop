/**
 * Plugin Manager - Handles plugin loading, management, and lifecycle
 */

const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.pluginConfigs = new Map();
        this.enabledPlugins = new Set();
        this.pluginDirectory = path.join(app.getPath('userData'), 'plugins');
        this.isInitialized = false;
    }

    /**
     * Initialize plugin manager
     */
    async initialize() {
        try {
            // Ensure plugin directory exists
            await fs.mkdir(this.pluginDirectory, { recursive: true });

            // Load plugin configurations
            await this.loadPluginConfigs();

            // Load enabled plugins
            await this.loadEnabledPlugins();

            this.isInitialized = true;
            console.log('Plugin manager initialized successfully');

        } catch (error) {
            console.error('Failed to initialize plugin manager:', error);
            throw error;
        }
    }

    /**
     * Load plugin configurations
     */
    async loadPluginConfigs() {
        try {
            const configPath = path.join(this.pluginDirectory, 'plugins.json');

            // Check if config file exists
            try {
                await fs.access(configPath);
            } catch {
                // Create default config file
                await this.createDefaultConfig(configPath);
                return;
            }

            const configData = await fs.readFile(configPath, 'utf8');
            const configs = JSON.parse(configData);

            for (const [pluginId, config] of Object.entries(configs)) {
                this.pluginConfigs.set(pluginId, config);
            }

        } catch (error) {
            console.error('Failed to load plugin configurations:', error);
        }
    }

    /**
     * Create default plugin configuration
     */
    async createDefaultConfig(configPath) {
        const defaultConfig = {
            version: '1.0.0',
            plugins: {}
        };

        await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    }

    /**
     * Load enabled plugins
     */
    async loadEnabledPlugins() {
        try {
            for (const [pluginId, config] of this.pluginConfigs) {
                if (config.enabled) {
                    await this.loadPlugin(pluginId, config);
                }
            }
        } catch (error) {
            console.error('Failed to load enabled plugins:', error);
        }
    }

    /**
     * Load a specific plugin
     */
    async loadPlugin(pluginId, config) {
        try {
            const pluginPath = config.path || path.join(this.pluginDirectory, pluginId);

            // Check if plugin directory exists
            await fs.access(pluginPath);

            // Load plugin manifest
            const manifestPath = path.join(pluginPath, 'package.json');
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

            // Load main plugin file
            const mainFile = manifest.main || 'index.js';
            const mainPath = path.join(pluginPath, mainFile);

            // Clear require cache for development
            delete require.cache[require.resolve(mainPath)];

            const PluginClass = require(mainPath);

            // Create plugin instance
            const pluginInstance = new PluginClass({
                id: pluginId,
                config: config.settings || {},
                pluginPath
            });

            // Initialize plugin
            if (pluginInstance.initialize) {
                await pluginInstance.initialize();
            }

            // Store plugin instance
            this.plugins.set(pluginId, {
                instance: pluginInstance,
                manifest,
                config,
                path: pluginPath,
                loadedAt: new Date()
            });

            this.enabledPlugins.add(pluginId);

            console.log(`Plugin '${pluginId}' loaded successfully`);

            // Emit plugin loaded event
            this.emitPluginEvent('plugin-loaded', { pluginId, manifest });

        } catch (error) {
            console.error(`Failed to load plugin '${pluginId}':`, error);
            throw error;
        }
    }

    /**
     * Unload a plugin
     */
    async unloadPlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin '${pluginId}' not found`);
            }

            // Call plugin cleanup method
            if (plugin.instance.cleanup) {
                await plugin.instance.cleanup();
            }

            // Remove plugin instance
            this.plugins.delete(pluginId);
            this.enabledPlugins.delete(pluginId);

            console.log(`Plugin '${pluginId}' unloaded successfully`);

            // Emit plugin unloaded event
            this.emitPluginEvent('plugin-unloaded', { pluginId });

        } catch (error) {
            console.error(`Failed to unload plugin '${pluginId}':`, error);
            throw error;
        }
    }

    /**
     * Install a plugin from path
     */
    async installPlugin(pluginPath) {
        try {
            // Validate plugin structure
            await this.validatePlugin(pluginPath);

            // Read plugin manifest
            const manifestPath = path.join(pluginPath, 'package.json');
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

            const pluginId = manifest.name;

            // Copy plugin to plugin directory
            const targetPath = path.join(this.pluginDirectory, pluginId);
            await fs.mkdir(targetPath, { recursive: true });

            // Copy plugin files
            await this.copyPluginFiles(pluginPath, targetPath);

            // Create plugin configuration
            const config = {
                id: pluginId,
                name: manifest.name,
                version: manifest.version,
                description: manifest.description,
                author: manifest.author,
                path: targetPath,
                enabled: false,
                installedAt: new Date().toISOString(),
                settings: {}
            };

            // Save configuration
            await this.savePluginConfig(pluginId, config);

            console.log(`Plugin '${pluginId}' installed successfully`);

            return {
                id: pluginId,
                name: manifest.name,
                version: manifest.version,
                installed: true
            };

        } catch (error) {
            console.error('Failed to install plugin:', error);
            throw error;
        }
    }

    /**
     * Uninstall a plugin
     */
    async uninstallPlugin(pluginId) {
        try {
            // Unload plugin if it's loaded
            if (this.enabledPlugins.has(pluginId)) {
                await this.unloadPlugin(pluginId);
            }

            const plugin = this.pluginConfigs.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin '${pluginId}' not found`);
            }

            // Remove plugin files
            if (plugin.path) {
                await fs.rmdir(plugin.path, { recursive: true });
            }

            // Remove configuration
            this.pluginConfigs.delete(pluginId);
            await this.savePluginConfigs();

            console.log(`Plugin '${pluginId}' uninstalled successfully`);

        } catch (error) {
            console.error(`Failed to uninstall plugin '${pluginId}':`, error);
            throw error;
        }
    }

    /**
     * Enable a plugin
     */
    async enablePlugin(pluginId) {
        try {
            const config = this.pluginConfigs.get(pluginId);
            if (!config) {
                throw new Error(`Plugin '${pluginId}' not found`);
            }

            if (this.enabledPlugins.has(pluginId)) {
                return; // Already enabled
            }

            // Load the plugin
            await this.loadPlugin(pluginId, config);

            // Update configuration
            config.enabled = true;
            await this.savePluginConfig(pluginId, config);

            console.log(`Plugin '${pluginId}' enabled successfully`);

        } catch (error) {
            console.error(`Failed to enable plugin '${pluginId}':`, error);
            throw error;
        }
    }

    /**
     * Disable a plugin
     */
    async disablePlugin(pluginId) {
        try {
            if (!this.enabledPlugins.has(pluginId)) {
                return; // Already disabled
            }

            // Unload the plugin
            await this.unloadPlugin(pluginId);

            // Update configuration
            const config = this.pluginConfigs.get(pluginId);
            if (config) {
                config.enabled = false;
                await this.savePluginConfig(pluginId, config);
            }

            console.log(`Plugin '${pluginId}' disabled successfully`);

        } catch (error) {
            console.error(`Failed to disable plugin '${pluginId}':`, error);
            throw error;
        }
    }

    /**
     * Get installed plugins
     */
    async getInstalledPlugins() {
        const plugins = [];

        for (const [pluginId, config] of this.pluginConfigs) {
            const plugin = this.plugins.get(pluginId);

            plugins.push({
                id: pluginId,
                name: config.name || pluginId,
                version: config.version || '1.0.0',
                description: config.description || '',
                author: config.author || '',
                enabled: this.enabledPlugins.has(pluginId),
                loaded: plugin !== undefined,
                settings: config.settings || {},
                manifest: plugin ? plugin.manifest : null
            });
        }

        return plugins;
    }

    /**
     * Get plugin settings
     */
    async getPluginSettings(pluginId) {
        const config = this.pluginConfigs.get(pluginId);
        return config ? config.settings || {} : {};
    }

    /**
     * Update plugin settings
     */
    async updatePluginSettings(pluginId, settings) {
        try {
            const config = this.pluginConfigs.get(pluginId);
            if (!config) {
                throw new Error(`Plugin '${pluginId}' not found`);
            }

            config.settings = { ...config.settings, ...settings };
            await this.savePluginConfig(pluginId, config);

            // Notify plugin of settings change
            const plugin = this.plugins.get(pluginId);
            if (plugin && plugin.instance.onSettingsChanged) {
                await plugin.instance.onSettingsChanged(settings);
            }

            console.log(`Plugin '${pluginId}' settings updated`);

        } catch (error) {
            console.error(`Failed to update plugin '${pluginId}' settings:`, error);
            throw error;
        }
    }

    /**
     * Validate plugin structure
     */
    async validatePlugin(pluginPath) {
        try {
            // Check for package.json
            const manifestPath = path.join(pluginPath, 'package.json');
            await fs.access(manifestPath);

            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

            // Validate required fields
            if (!manifest.name) {
                throw new Error('Plugin manifest missing required field: name');
            }

            if (!manifest.main) {
                throw new Error('Plugin manifest missing required field: main');
            }

            // Check for main file
            const mainPath = path.join(pluginPath, manifest.main);
            await fs.access(mainPath);

        } catch (error) {
            throw new Error(`Invalid plugin structure: ${error.message}`);
        }
    }

    /**
     * Copy plugin files
     */
    async copyPluginFiles(sourcePath, targetPath) {
        const entries = await fs.readdir(sourcePath, { withFileTypes: true });

        for (const entry of entries) {
            const sourceFile = path.join(sourcePath, entry.name);
            const targetFile = path.join(targetPath, entry.name);

            if (entry.isDirectory()) {
                await fs.mkdir(targetFile, { recursive: true });
                await this.copyPluginFiles(sourceFile, targetFile);
            } else {
                await fs.copyFile(sourceFile, targetFile);
            }
        }
    }

    /**
     * Save plugin configuration
     */
    async savePluginConfig(pluginId, config) {
        this.pluginConfigs.set(pluginId, config);
        await this.savePluginConfigs();
    }

    /**
     * Save all plugin configurations
     */
    async savePluginConfigs() {
        try {
            const configPath = path.join(this.pluginDirectory, 'plugins.json');
            const configs = {};

            for (const [pluginId, config] of this.pluginConfigs) {
                configs[pluginId] = config;
            }

            await fs.writeFile(configPath, JSON.stringify({
                version: '1.0.0',
                plugins: configs
            }, null, 2), 'utf8');

        } catch (error) {
            console.error('Failed to save plugin configurations:', error);
            throw error;
        }
    }

    /**
     * Get plugin instance
     */
    getPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        return plugin ? plugin.instance : null;
    }

    /**
     * Check if plugin is enabled
     */
    isPluginEnabled(pluginId) {
        return this.enabledPlugins.has(pluginId);
    }

    /**
     * Get plugin manifest
     */
    getPluginManifest(pluginId) {
        const plugin = this.plugins.get(pluginId);
        return plugin ? plugin.manifest : null;
    }

    /**
     * Execute plugin hook
     */
    async executeHook(hookName, ...args) {
        const results = [];

        for (const [pluginId, plugin] of this.plugins) {
            if (plugin.instance && typeof plugin.instance[hookName] === 'function') {
                try {
                    const result = await plugin.instance[hookName](...args);
                    results.push({ pluginId, result });
                } catch (error) {
                    console.error(`Plugin '${pluginId}' hook '${hookName}' failed:`, error);
                }
            }
        }

        return results;
    }

    /**
     * Emit plugin event
     */
    emitPluginEvent(event, data) {
        // This can be extended to emit events to other parts of the application
        console.log(`Plugin event: ${event}`, data);
    }

    /**
     * Get plugin statistics
     */
    getStatistics() {
        return {
            totalPlugins: this.pluginConfigs.size,
            enabledPlugins: this.enabledPlugins.size,
            loadedPlugins: this.plugins.size,
            pluginDirectory: this.pluginDirectory
        };
    }

    /**
     * Cleanup plugin manager
     */
    async cleanup() {
        // Unload all plugins
        for (const pluginId of this.enabledPlugins) {
            try {
                await this.unloadPlugin(pluginId);
            } catch (error) {
                console.error(`Failed to unload plugin '${pluginId}' during cleanup:`, error);
            }
        }

        this.plugins.clear();
        this.pluginConfigs.clear();
        this.enabledPlugins.clear();
    }
}

module.exports = PluginManager;
