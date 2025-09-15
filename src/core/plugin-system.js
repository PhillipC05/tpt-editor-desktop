/**
 * Plugin System
 * Comprehensive plugin architecture for extensibility
 */

const UserPreferences = require('./user-preferences');
const EventEmitter = require('events');

class PluginSystem extends EventEmitter {
    constructor(options = {}) {
        super();
        this.preferences = options.preferences || new UserPreferences();
        this.plugins = new Map();
        this.pluginInstances = new Map();
        this.hooks = new Map();
        this.middleware = new Map();
        this.services = new Map();
        this.extensions = new Map();
        this.pluginStore = new Map();
        this.isInitialized = false;

        this.init();
    }

    /**
     * Initialize the plugin system
     */
    async init() {
        await this.preferences.init();
        this.setupCoreHooks();
        this.setupCoreServices();
        this.loadPluginStore();
        this.isInitialized = true;

        console.log('Plugin system initialized');
        this.emit('initialized');
    }

    /**
     * Setup core hooks
     */
    setupCoreHooks() {
        const coreHooks = [
            'app:init',
            'app:ready',
            'app:shutdown',
            'generator:created',
            'generator:execute',
            'generator:complete',
            'ui:render',
            'ui:mount',
            'ui:unmount',
            'file:save',
            'file:load',
            'file:export',
            'settings:load',
            'settings:save',
            'theme:change',
            'shortcut:execute',
            'preset:save',
            'preset:load',
            'security:audit',
            'performance:measure'
        ];

        coreHooks.forEach(hookName => {
            this.hooks.set(hookName, new Set());
        });
    }

    /**
     * Setup core services
     */
    setupCoreServices() {
        const coreServices = {
            'logger': this.createLoggerService(),
            'storage': this.createStorageService(),
            'event-bus': this.createEventBusService(),
            'ui-manager': this.createUIManagerService(),
            'generator-manager': this.createGeneratorManagerService(),
            'file-manager': this.createFileManagerService(),
            'settings-manager': this.createSettingsManagerService()
        };

        Object.entries(coreServices).forEach(([name, service]) => {
            this.services.set(name, service);
        });
    }

    /**
     * Register a plugin
     */
    async registerPlugin(pluginDefinition) {
        try {
            this.validatePluginDefinition(pluginDefinition);

            const plugin = {
                ...pluginDefinition,
                id: pluginDefinition.id || this.generatePluginId(),
                version: pluginDefinition.version || '1.0.0',
                enabled: pluginDefinition.enabled !== false,
                loaded: false,
                instance: null,
                hooks: new Map(),
                services: new Map(),
                extensions: new Map(),
                metadata: {
                    registeredAt: new Date().toISOString(),
                    loadCount: 0,
                    errorCount: 0,
                    lastError: null
                }
            };

            this.plugins.set(plugin.id, plugin);
            this.pluginStore.set(plugin.id, plugin);

            this.emit('plugin-registered', { plugin });

            // Auto-load if enabled
            if (plugin.enabled) {
                await this.loadPlugin(plugin.id);
            }

            return plugin.id;

        } catch (error) {
            console.error('Failed to register plugin:', error);
            this.emit('plugin-registration-error', { plugin: pluginDefinition, error });
            throw error;
        }
    }

    /**
     * Load a plugin
     */
    async loadPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin '${pluginId}' not found`);
        }

        if (plugin.loaded) {
            return plugin.instance;
        }

        try {
            // Create plugin instance
            const instance = await this.createPluginInstance(plugin);

            // Initialize plugin
            if (typeof instance.init === 'function') {
                await instance.init({
                    services: this.services,
                    hooks: this.hooks,
                    emit: (event, data) => this.emit(event, { ...data, pluginId })
                });
            }

            // Register plugin hooks
            if (instance.hooks) {
                this.registerPluginHooks(pluginId, instance.hooks);
            }

            // Register plugin services
            if (instance.services) {
                this.registerPluginServices(pluginId, instance.services);
            }

            // Register plugin extensions
            if (instance.extensions) {
                this.registerPluginExtensions(pluginId, instance.extensions);
            }

            plugin.instance = instance;
            plugin.loaded = true;
            plugin.metadata.loadCount++;

            this.pluginInstances.set(pluginId, instance);

            this.emit('plugin-loaded', { pluginId, plugin });

            return instance;

        } catch (error) {
            console.error(`Failed to load plugin '${pluginId}':`, error);
            plugin.metadata.errorCount++;
            plugin.metadata.lastError = error.message;
            this.emit('plugin-load-error', { pluginId, error });
            throw error;
        }
    }

    /**
     * Unload a plugin
     */
    async unloadPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin || !plugin.loaded) {
            return;
        }

        try {
            const instance = plugin.instance;

            // Call plugin cleanup
            if (typeof instance.destroy === 'function') {
                await instance.destroy();
            }

            // Unregister hooks
            this.unregisterPluginHooks(pluginId);

            // Unregister services
            this.unregisterPluginServices(pluginId);

            // Unregister extensions
            this.unregisterPluginExtensions(pluginId);

            plugin.loaded = false;
            plugin.instance = null;
            this.pluginInstances.delete(pluginId);

            this.emit('plugin-unloaded', { pluginId, plugin });

        } catch (error) {
            console.error(`Failed to unload plugin '${pluginId}':`, error);
            this.emit('plugin-unload-error', { pluginId, error });
            throw error;
        }
    }

    /**
     * Enable a plugin
     */
    async enablePlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin '${pluginId}' not found`);
        }

        if (plugin.enabled) {
            return;
        }

        plugin.enabled = true;
        await this.savePluginStore();

        this.emit('plugin-enabled', { pluginId, plugin });

        // Load if not already loaded
        if (!plugin.loaded) {
            await this.loadPlugin(pluginId);
        }
    }

    /**
     * Disable a plugin
     */
    async disablePlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin '${pluginId}' not found`);
        }

        if (!plugin.enabled) {
            return;
        }

        plugin.enabled = false;
        await this.savePluginStore();

        this.emit('plugin-disabled', { pluginId, plugin });

        // Unload if loaded
        if (plugin.loaded) {
            await this.unloadPlugin(pluginId);
        }
    }

    /**
     * Execute hooks
     */
    async executeHooks(hookName, context = {}) {
        const hookSet = this.hooks.get(hookName);
        if (!hookSet || hookSet.size === 0) {
            return context;
        }

        const results = [];
        for (const hook of hookSet) {
            try {
                const result = await hook(context);
                results.push(result);

                // Allow hooks to modify context
                if (result && typeof result === 'object') {
                    Object.assign(context, result);
                }
            } catch (error) {
                console.error(`Hook '${hookName}' failed:`, error);
                this.emit('hook-error', { hookName, error, context });
            }
        }

        return { context, results };
    }

    /**
     * Register plugin hooks
     */
    registerPluginHooks(pluginId, hooks) {
        Object.entries(hooks).forEach(([hookName, hookFunction]) => {
            if (!this.hooks.has(hookName)) {
                this.hooks.set(hookName, new Set());
            }

            const hookSet = this.hooks.get(hookName);
            const wrappedHook = async (context) => {
                try {
                    return await hookFunction(context);
                } catch (error) {
                    console.error(`Plugin '${pluginId}' hook '${hookName}' failed:`, error);
                    throw error;
                }
            };

            hookSet.add(wrappedHook);

            // Track hook for cleanup
            const plugin = this.plugins.get(pluginId);
            if (plugin) {
                if (!plugin.hooks.has(hookName)) {
                    plugin.hooks.set(hookName, new Set());
                }
                plugin.hooks.get(hookName).add(wrappedHook);
            }
        });
    }

    /**
     * Unregister plugin hooks
     */
    unregisterPluginHooks(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return;

        plugin.hooks.forEach((hookSet, hookName) => {
            const globalHookSet = this.hooks.get(hookName);
            if (globalHookSet) {
                hookSet.forEach(hook => globalHookSet.delete(hook));
            }
        });

        plugin.hooks.clear();
    }

    /**
     * Register plugin services
     */
    registerPluginServices(pluginId, services) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return;

        Object.entries(services).forEach(([serviceName, service]) => {
            const fullServiceName = `${pluginId}:${serviceName}`;
            this.services.set(fullServiceName, service);
            plugin.services.set(serviceName, service);
        });
    }

    /**
     * Unregister plugin services
     */
    unregisterPluginServices(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return;

        plugin.services.forEach((service, serviceName) => {
            const fullServiceName = `${pluginId}:${serviceName}`;
            this.services.delete(fullServiceName);
        });

        plugin.services.clear();
    }

    /**
     * Register plugin extensions
     */
    registerPluginExtensions(pluginId, extensions) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return;

        Object.entries(extensions).forEach(([extensionPoint, extension]) => {
            if (!this.extensions.has(extensionPoint)) {
                this.extensions.set(extensionPoint, new Map());
            }

            const extensionMap = this.extensions.get(extensionPoint);
            extensionMap.set(pluginId, extension);
            plugin.extensions.set(extensionPoint, extension);
        });
    }

    /**
     * Unregister plugin extensions
     */
    unregisterPluginExtensions(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return;

        plugin.extensions.forEach((extension, extensionPoint) => {
            const extensionMap = this.extensions.get(extensionPoint);
            if (extensionMap) {
                extensionMap.delete(pluginId);
            }
        });

        plugin.extensions.clear();
    }

    /**
     * Get extensions for a point
     */
    getExtensions(extensionPoint) {
        const extensionMap = this.extensions.get(extensionPoint);
        if (!extensionMap) return new Map();

        return new Map(extensionMap);
    }

    /**
     * Get service
     */
    getService(serviceName) {
        return this.services.get(serviceName);
    }

    /**
     * Get plugin
     */
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }

    /**
     * Get all plugins
     */
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }

    /**
     * Get loaded plugins
     */
    getLoadedPlugins() {
        return Array.from(this.plugins.values()).filter(p => p.loaded);
    }

    /**
     * Get enabled plugins
     */
    getEnabledPlugins() {
        return Array.from(this.plugins.values()).filter(p => p.enabled);
    }

    /**
     * Create plugin instance
     */
    async createPluginInstance(plugin) {
        if (typeof plugin.factory === 'function') {
            return await plugin.factory();
        }

        if (typeof plugin.module === 'string') {
            // Dynamic import for ES modules
            const module = await import(plugin.module);
            return new module.default(plugin.config || {});
        }

        if (typeof plugin.constructor === 'function') {
            return new plugin.constructor(plugin.config || {});
        }

        throw new Error(`Plugin '${plugin.id}' has no valid factory, module, or constructor`);
    }

    /**
     * Validate plugin definition
     */
    validatePluginDefinition(definition) {
        if (!definition) {
            throw new Error('Plugin definition is required');
        }

        if (!definition.name) {
            throw new Error('Plugin name is required');
        }

        if (!definition.factory && !definition.module && !definition.constructor) {
            throw new Error('Plugin must have a factory, module, or constructor');
        }

        // Validate version format
        if (definition.version && !/^\d+\.\d+\.\d+/.test(definition.version)) {
            throw new Error('Plugin version must be in semver format (x.y.z)');
        }

        // Validate dependencies
        if (definition.dependencies) {
            if (!Array.isArray(definition.dependencies)) {
                throw new Error('Plugin dependencies must be an array');
            }
        }
    }

    /**
     * Generate plugin ID
     */
    generatePluginId() {
        return `plugin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Load plugin store
     */
    loadPluginStore() {
        const storedPlugins = this.preferences.get('plugins', []);
        storedPlugins.forEach(plugin => {
            this.plugins.set(plugin.id, plugin);
        });
    }

    /**
     * Save plugin store
     */
    async savePluginStore() {
        const pluginsArray = Array.from(this.plugins.values());
        await this.preferences.set('plugins', pluginsArray);
    }

    /**
     * Create logger service
     */
    createLoggerService() {
        return {
            info: (message, ...args) => console.info(`[PLUGIN] ${message}`, ...args),
            warn: (message, ...args) => console.warn(`[PLUGIN] ${message}`, ...args),
            error: (message, ...args) => console.error(`[PLUGIN] ${message}`, ...args),
            debug: (message, ...args) => console.debug(`[PLUGIN] ${message}`, ...args)
        };
    }

    /**
     * Create storage service
     */
    createStorageService() {
        return {
            get: (key) => this.preferences.get(`plugin_${key}`),
            set: (key, value) => this.preferences.set(`plugin_${key}`, value),
            remove: (key) => this.preferences.remove(`plugin_${key}`)
        };
    }

    /**
     * Create event bus service
     */
    createEventBusService() {
        return {
            emit: (event, data) => this.emit(event, data),
            on: (event, handler) => this.on(event, handler),
            off: (event, handler) => this.off(event, handler)
        };
    }

    /**
     * Create UI manager service
     */
    createUIManagerService() {
        return {
            addMenuItem: (menuId, item) => {
                // Implementation would integrate with UI system
                this.emit('ui:add-menu-item', { menuId, item });
            },
            addToolbarButton: (toolbarId, button) => {
                this.emit('ui:add-toolbar-button', { toolbarId, button });
            },
            addPanel: (panel) => {
                this.emit('ui:add-panel', { panel });
            }
        };
    }

    /**
     * Create generator manager service
     */
    createGeneratorManagerService() {
        return {
            registerGenerator: (generator) => {
                this.emit('generator:register', { generator });
            },
            unregisterGenerator: (generatorId) => {
                this.emit('generator:unregister', { generatorId });
            }
        };
    }

    /**
     * Create file manager service
     */
    createFileManagerService() {
        return {
            readFile: async (path) => {
                // Implementation would integrate with file system
                return await this.emitAsync('file:read', { path });
            },
            writeFile: async (path, content) => {
                return await this.emitAsync('file:write', { path, content });
            }
        };
    }

    /**
     * Create settings manager service
     */
    createSettingsManagerService() {
        return {
            get: (key) => this.preferences.get(key),
            set: (key, value) => this.preferences.set(key, value),
            onChange: (key, handler) => {
                this.preferences.on('changed', ({ key: changedKey, newValue }) => {
                    if (changedKey === key) {
                        handler(newValue);
                    }
                });
            }
        };
    }

    /**
     * Emit async event
     */
    async emitAsync(event, data) {
        return new Promise((resolve) => {
            const handler = (result) => {
                this.off(event, handler);
                resolve(result);
            };
            this.once(event, handler);
            this.emit(event, data);
        });
    }

    /**
     * Get plugin statistics
     */
    getStatistics() {
        const total = this.plugins.size;
        const loaded = Array.from(this.plugins.values()).filter(p => p.loaded).length;
        const enabled = Array.from(this.plugins.values()).filter(p => p.enabled).length;
        const hooks = Array.from(this.hooks.values()).reduce((sum, set) => sum + set.size, 0);
        const services = this.services.size;
        const extensions = Array.from(this.extensions.values()).reduce((sum, map) => sum + map.size, 0);

        return {
            total,
            loaded,
            enabled,
            disabled: total - enabled,
            hooks,
            services,
            extensions
        };
    }

    /**
     * Export plugin configuration
     */
    exportConfiguration() {
        const config = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            plugins: Array.from(this.plugins.values()),
            hooks: Array.from(this.hooks.entries()).map(([name, set]) => [name, set.size]),
            services: Array.from(this.services.keys()),
            extensions: Array.from(this.extensions.entries()).map(([point, map]) => [point, Array.from(map.keys())])
        };

        return JSON.stringify(config, null, 2);
    }

    /**
     * Import plugin configuration
     */
    async importConfiguration(jsonData) {
        try {
            const config = JSON.parse(jsonData);

            if (config.plugins && Array.isArray(config.plugins)) {
                for (const plugin of config.plugins) {
                    await this.registerPlugin(plugin);
                }
            }

            this.emit('configuration-imported', config);
            return true;

        } catch (error) {
            console.error('Failed to import plugin configuration:', error);
            this.emit('configuration-import-error', { error });
            return false;
        }
    }

    /**
     * Destroy the plugin system
     */
    async destroy() {
        // Unload all plugins
        for (const [pluginId] of this.plugins) {
            if (this.plugins.get(pluginId).loaded) {
                await this.unloadPlugin(pluginId);
            }
        }

        this.plugins.clear();
        this.pluginInstances.clear();
        this.hooks.clear();
        this.services.clear();
        this.extensions.clear();
        this.pluginStore.clear();

        this.emit('destroyed');
        console.log('Plugin system destroyed');
    }
}

module.exports = PluginSystem;
