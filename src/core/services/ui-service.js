/**
 * TPT Asset Editor Desktop - UI Service
 * Business logic layer for UI operations and state management
 */

const EventEmitter = require('events');

class UIService extends EventEmitter {
    constructor(store, assetService, generatorService) {
        super();

        this.store = store;
        this.assetService = assetService;
        this.generatorService = generatorService;

        // UI state
        this.currentView = 'dashboard';
        this.currentAssetType = null;
        this.currentConfig = {};
        this.generatedAsset = null;
        this.loadingStates = new Map();
        this.notifications = [];

        // Bind methods
        this.switchView = this.switchView.bind(this);
        this.selectAssetType = this.selectAssetType.bind(this);
        this.updateConfig = this.updateConfig.bind(this);
        this.generateAsset = this.generateAsset.bind(this);
        this.saveAsset = this.saveAsset.bind(this);
    }

    /**
     * Switch between application views
     */
    async switchView(viewName, options = {}) {
        try {
            // Validate view name
            const validViews = ['dashboard', 'generator', 'library', 'batch', 'templates', 'settings'];
            if (!validViews.includes(viewName)) {
                throw new Error(`Invalid view: ${viewName}`);
            }

            const previousView = this.currentView;
            this.currentView = viewName;

            // Update store
            this.store.dispatch({
                type: 'VIEW_SWITCHED',
                payload: {
                    from: previousView,
                    to: viewName,
                    options
                }
            });

            // Emit view change event
            this.emit('viewChanged', {
                previousView,
                currentView: viewName,
                options
            });

            // Handle view-specific initialization
            await this.initializeView(viewName, options);

            return true;

        } catch (error) {
            console.error('Error switching view:', error);
            this.emit('viewChangeError', { viewName, error });
            throw error;
        }
    }

    /**
     * Initialize view-specific data and state
     */
    async initializeView(viewName, options = {}) {
        switch (viewName) {
            case 'dashboard':
                await this.initializeDashboard();
                break;
            case 'library':
                await this.initializeLibrary(options);
                break;
            case 'generator':
                await this.initializeGenerator(options);
                break;
            case 'batch':
                await this.initializeBatch();
                break;
            case 'templates':
                await this.initializeTemplates();
                break;
            case 'settings':
                await this.initializeSettings();
                break;
        }
    }

    /**
     * Initialize dashboard view
     */
    async initializeDashboard() {
        try {
            // Load recent assets
            const recentAssets = await this.assetService.getAssets({}, {
                limit: 6,
                sort: { created_at: -1 }
            });

            // Load statistics
            const stats = await this.assetService.getAssetStatistics();

            // Update store
            this.store.dispatch({
                type: 'DASHBOARD_INITIALIZED',
                payload: {
                    recentAssets: recentAssets.assets,
                    stats
                }
            });

            this.emit('dashboardInitialized', { recentAssets, stats });

        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.emit('dashboardInitError', error);
        }
    }

    /**
     * Initialize library view
     */
    async initializeLibrary(options = {}) {
        try {
            const query = options.search ? {
                $or: [
                    { name: { $regex: options.search, $options: 'i' } },
                    { type: { $regex: options.search, $options: 'i' } },
                    { tags: { $in: [new RegExp(options.search, 'i')] } }
                ]
            } : {};

            const assets = await this.assetService.getAssets(query, {
                limit: 50,
                sort: { created_at: -1 }
            });

            // Update store
            this.store.dispatch({
                type: 'LIBRARY_INITIALIZED',
                payload: {
                    assets: assets.assets,
                    total: assets.total,
                    searchQuery: options.search || ''
                }
            });

            this.emit('libraryInitialized', assets);

        } catch (error) {
            console.error('Error initializing library:', error);
            this.emit('libraryInitError', error);
        }
    }

    /**
     * Initialize generator view
     */
    async initializeGenerator(options = {}) {
        try {
            // Reset generator state
            this.currentAssetType = null;
            this.currentConfig = {};
            this.generatedAsset = null;

            // Update store
            this.store.dispatch({
                type: 'GENERATOR_INITIALIZED',
                payload: {
                    assetType: null,
                    config: {},
                    generatedAsset: null
                }
            });

            this.emit('generatorInitialized', options);

        } catch (error) {
            console.error('Error initializing generator:', error);
            this.emit('generatorInitError', error);
        }
    }

    /**
     * Initialize batch view
     */
    async initializeBatch() {
        try {
            // Update store
            this.store.dispatch({
                type: 'BATCH_INITIALIZED',
                payload: {}
            });

            this.emit('batchInitialized');

        } catch (error) {
            console.error('Error initializing batch:', error);
            this.emit('batchInitError', error);
        }
    }

    /**
     * Initialize templates view
     */
    async initializeTemplates() {
        try {
            // Update store
            this.store.dispatch({
                type: 'TEMPLATES_INITIALIZED',
                payload: {}
            });

            this.emit('templatesInitialized');

        } catch (error) {
            console.error('Error initializing templates:', error);
            this.emit('templatesInitError', error);
        }
    }

    /**
     * Initialize settings view
     */
    async initializeSettings() {
        try {
            // Load current settings from store
            const settings = this.store.getState('preferences');

            // Update store
            this.store.dispatch({
                type: 'SETTINGS_INITIALIZED',
                payload: { settings }
            });

            this.emit('settingsInitialized', settings);

        } catch (error) {
            console.error('Error initializing settings:', error);
            this.emit('settingsInitError', error);
        }
    }

    /**
     * Select asset type for generation
     */
    async selectAssetType(type, options = {}) {
        try {
            // Validate asset type
            const validTypes = [
                'character', 'monster', 'item', 'tile',
                'sfx', 'music', 'ambient',
                'vehicle', 'building',
                'particle', 'ui'
            ];

            if (!validTypes.includes(type)) {
                throw new Error(`Invalid asset type: ${type}`);
            }

            this.currentAssetType = type;
            this.currentConfig = this.getDefaultConfigForType(type);

            // Update store
            this.store.dispatch({
                type: 'ASSET_TYPE_SELECTED',
                payload: {
                    assetType: type,
                    config: this.currentConfig
                }
            });

            this.emit('assetTypeSelected', {
                type,
                config: this.currentConfig,
                options
            });

            return this.currentConfig;

        } catch (error) {
            console.error('Error selecting asset type:', error);
            this.emit('assetTypeSelectError', { type, error });
            throw error;
        }
    }

    /**
     * Update current configuration
     */
    async updateConfig(updates, options = {}) {
        try {
            // Merge updates with current config
            this.currentConfig = {
                ...this.currentConfig,
                ...updates
            };

            // Validate configuration
            await this.validateConfig(this.currentAssetType, this.currentConfig);

            // Update store
            this.store.dispatch({
                type: 'CONFIG_UPDATED',
                payload: {
                    assetType: this.currentAssetType,
                    config: this.currentConfig,
                    updates
                }
            });

            this.emit('configUpdated', {
                config: this.currentConfig,
                updates,
                options
            });

            return this.currentConfig;

        } catch (error) {
            console.error('Error updating config:', error);
            this.emit('configUpdateError', { updates, error });
            throw error;
        }
    }

    /**
     * Generate asset using current configuration
     */
    async generateAsset(options = {}) {
        try {
            if (!this.currentAssetType) {
                throw new Error('No asset type selected');
            }

            if (!this.currentConfig || Object.keys(this.currentConfig).length === 0) {
                throw new Error('No configuration available');
            }

            // Set loading state
            this.setLoadingState('generation', true);

            // Update store
            this.store.dispatch({
                type: 'ASSET_GENERATION_STARTED',
                payload: {
                    assetType: this.currentAssetType,
                    config: this.currentConfig
                }
            });

            this.emit('assetGenerationStarted', {
                assetType: this.currentAssetType,
                config: this.currentConfig
            });

            // Generate asset using generator service
            const asset = await this.generatorService.generateAsset(
                this.currentAssetType,
                this.currentConfig,
                options
            );

            this.generatedAsset = asset;

            // Update store
            this.store.dispatch({
                type: 'ASSET_GENERATION_COMPLETED',
                payload: { asset }
            });

            this.emit('assetGenerationCompleted', { asset });

            return asset;

        } catch (error) {
            console.error('Error generating asset:', error);

            // Update store
            this.store.dispatch({
                type: 'ASSET_GENERATION_FAILED',
                payload: { error: error.message }
            });

            this.emit('assetGenerationFailed', { error });
            throw error;

        } finally {
            this.setLoadingState('generation', false);
        }
    }

    /**
     * Regenerate current asset
     */
    async regenerateAsset(options = {}) {
        try {
            if (!this.generatedAsset) {
                throw new Error('No asset to regenerate');
            }

            return await this.generateAsset(options);

        } catch (error) {
            console.error('Error regenerating asset:', error);
            throw error;
        }
    }

    /**
     * Save generated asset
     */
    async saveAsset(options = {}) {
        try {
            if (!this.generatedAsset) {
                throw new Error('No asset to save');
            }

            // Set loading state
            this.setLoadingState('saving', true);

            // Asset is already saved by generator service, just update UI state
            this.store.dispatch({
                type: 'ASSET_SAVED',
                payload: { asset: this.generatedAsset }
            });

            this.emit('assetSaved', { asset: this.generatedAsset, options });

            // Show success notification
            this.showNotification('Asset saved successfully!', 'success');

            return this.generatedAsset;

        } catch (error) {
            console.error('Error saving asset:', error);
            this.showNotification('Failed to save asset', 'error');
            throw error;

        } finally {
            this.setLoadingState('saving', false);
        }
    }

    /**
     * Handle global search
     */
    async handleGlobalSearch(query, options = {}) {
        try {
            if (!query || query.trim().length === 0) {
                // Clear search
                this.store.dispatch({
                    type: 'SEARCH_CLEARED',
                    payload: {}
                });
                this.emit('searchCleared');
                return;
            }

            // Update store
            this.store.dispatch({
                type: 'SEARCH_STARTED',
                payload: { query }
            });

            this.emit('searchStarted', { query });

            // Perform search
            const results = await this.assetService.searchAssets(query, options);

            // Update store
            this.store.dispatch({
                type: 'SEARCH_COMPLETED',
                payload: {
                    query,
                    results: results.assets,
                    total: results.total
                }
            });

            this.emit('searchCompleted', { query, results });

            return results;

        } catch (error) {
            console.error('Error performing search:', error);

            this.store.dispatch({
                type: 'SEARCH_FAILED',
                payload: { query, error: error.message }
            });

            this.emit('searchFailed', { query, error });
            throw error;
        }
    }

    /**
     * Handle quick actions from dashboard
     */
    async handleQuickAction(action, options = {}) {
        try {
            switch (action) {
                case 'generate-character':
                    await this.selectAssetType('character');
                    await this.switchView('generator');
                    break;
                case 'generate-monster':
                    await this.selectAssetType('monster');
                    await this.switchView('generator');
                    break;
                case 'generate-item':
                    await this.selectAssetType('item');
                    await this.switchView('generator');
                    break;
                case 'generate-sfx':
                    await this.selectAssetType('sfx');
                    await this.switchView('generator');
                    break;
                case 'open-library':
                    await this.switchView('library');
                    break;
                case 'open-batch':
                    await this.switchView('batch');
                    break;
                default:
                    throw new Error(`Unknown quick action: ${action}`);
            }

            this.emit('quickActionHandled', { action, options });

        } catch (error) {
            console.error('Error handling quick action:', error);
            this.emit('quickActionError', { action, error });
            throw error;
        }
    }

    /**
     * Show asset preview
     */
    showAssetPreview(asset, options = {}) {
        try {
            // Update store
            this.store.dispatch({
                type: 'ASSET_PREVIEW_SHOWN',
                payload: { asset, options }
            });

            this.emit('assetPreviewShown', { asset, options });

        } catch (error) {
            console.error('Error showing asset preview:', error);
            this.emit('assetPreviewError', { asset, error });
        }
    }

    /**
     * Export assets
     */
    async exportAssets(assetIds, format = 'png', options = {}) {
        try {
            // Set loading state
            this.setLoadingState('export', true);

            // Update store
            this.store.dispatch({
                type: 'ASSET_EXPORT_STARTED',
                payload: { assetIds, format }
            });

            this.emit('assetExportStarted', { assetIds, format });

            // Perform export
            const results = await this.assetService.batchExport(assetIds, options.exportPath || './exports', format, options);

            // Update store
            this.store.dispatch({
                type: 'ASSET_EXPORT_COMPLETED',
                payload: { results, format }
            });

            this.emit('assetExportCompleted', { results, format });

            // Show success notification
            const successCount = results.filter(r => r.success).length;
            this.showNotification(`Exported ${successCount}/${assetIds.length} assets`, 'success');

            return results;

        } catch (error) {
            console.error('Error exporting assets:', error);

            this.store.dispatch({
                type: 'ASSET_EXPORT_FAILED',
                payload: { error: error.message }
            });

            this.emit('assetExportFailed', { error });
            this.showNotification('Export failed', 'error');
            throw error;

        } finally {
            this.setLoadingState('export', false);
        }
    }

    /**
     * Get default configuration for asset type
     */
    getDefaultConfigForType(type) {
        const defaults = {
            character: {
                classType: 'warrior',
                equipment: [],
                detailLevel: 5
            },
            monster: {
                monsterType: 'goblin',
                sizeVariant: 'medium',
                detailLevel: 5
            },
            item: {
                itemType: 'sword',
                rarity: 'common',
                detailLevel: 4
            },
            tile: {
                tileType: 'grass',
                biome: 'grassland',
                variation: 0.2
            },
            sfx: {
                effectType: 'sword_attack',
                duration: 1.0
            },
            music: {
                style: 'village',
                duration: 120
            },
            ambient: {
                type: 'forest',
                duration: 60
            },
            vehicle: {
                vehicleType: 'car',
                era: 'modern',
                size: 1.0,
                detailLevel: 5
            },
            building: {
                buildingCategory: 'residential',
                era: 'modern',
                size: 1.0,
                detailLevel: 5
            },
            particle: {
                effectCategory: 'combat',
                visualStyle: 'realistic',
                particleCount: 100,
                duration: 2.0
            },
            ui: {
                elementCategory: 'interactive',
                uiStyle: 'modern',
                size: 64,
                cornerRadius: 8
            }
        };

        return defaults[type] || {};
    }

    /**
     * Validate configuration
     */
    async validateConfig(type, config) {
        if (!type || !config) return;

        // Basic validation - can be extended
        switch (type) {
            case 'character':
                if (!config.classType) {
                    throw new Error('Character class is required');
                }
                break;
            case 'monster':
                if (!config.monsterType) {
                    throw new Error('Monster type is required');
                }
                break;
            case 'vehicle':
                if (!config.vehicleType) {
                    throw new Error('Vehicle type is required');
                }
                break;
            case 'building':
                if (!config.buildingCategory) {
                    throw new Error('Building category is required');
                }
                break;
        }
    }

    /**
     * Set loading state
     */
    setLoadingState(operation, isLoading) {
        if (isLoading) {
            this.loadingStates.set(operation, true);
        } else {
            this.loadingStates.delete(operation);
        }

        // Update store
        this.store.dispatch({
            type: 'LOADING_STATE_CHANGED',
            payload: {
                operation,
                isLoading,
                activeOperations: Array.from(this.loadingStates.keys())
            }
        });

        this.emit('loadingStateChanged', { operation, isLoading });
    }

    /**
     * Check if operation is loading
     */
    isLoading(operation = null) {
        if (operation) {
            return this.loadingStates.has(operation);
        }
        return this.loadingStates.size > 0;
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: this.generateId(),
            message,
            type,
            timestamp: Date.now(),
            duration
        };

        this.notifications.push(notification);

        // Update store
        this.store.dispatch({
            type: 'NOTIFICATION_SHOWN',
            payload: { notification }
        });

        this.emit('notificationShown', notification);

        // Auto-remove notification
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, duration);
        }

        return notification.id;
    }

    /**
     * Remove notification
     */
    removeNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index > -1) {
            const notification = this.notifications.splice(index, 1)[0];

            // Update store
            this.store.dispatch({
                type: 'NOTIFICATION_REMOVED',
                payload: { notificationId }
            });

            this.emit('notificationRemoved', notification);
        }
    }

    /**
     * Get current UI state
     */
    getUIState() {
        return {
            currentView: this.currentView,
            currentAssetType: this.currentAssetType,
            currentConfig: this.currentConfig,
            generatedAsset: this.generatedAsset,
            loadingStates: Array.from(this.loadingStates.keys()),
            notifications: [...this.notifications]
        };
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `ui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        this.loadingStates.clear();
        this.notifications = [];
        this.currentAssetType = null;
        this.currentConfig = {};
        this.generatedAsset = null;
        this.removeAllListeners();

        console.log('UI service cleaned up');
    }
}

module.exports = UIService;
