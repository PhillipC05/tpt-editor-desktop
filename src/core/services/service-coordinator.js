/**
 * TPT Asset Editor Desktop - Service Coordinator
 * Coordinates interactions between all services and provides clean API boundaries
 *
 * The ServiceCoordinator acts as the central hub for all service interactions,
 * providing a unified API for the application while managing service lifecycle,
 * inter-service communication, and cross-cutting concerns like logging and error handling.
 *
 * @class ServiceCoordinator
 * @extends EventEmitter
 *
 * @example
 * ```javascript
 * const coordinator = new ServiceCoordinator();
 * await coordinator.initialize();
 *
 * // Generate an asset
 * const asset = await coordinator.generateAsset('character', { classType: 'warrior' });
 *
 * // Switch UI view
 * await coordinator.switchView('generator');
 *
 * // Handle global search
 * const results = await coordinator.handleGlobalSearch('sword');
 * ```
 */
const EventEmitter = require('events');

class ServiceCoordinator extends EventEmitter {
    /**
     * Creates a new ServiceCoordinator instance
     *
     * @constructor
     */
    constructor() {
        super();

        /**
         * Map of registered services
         * @type {Map<string, Object>}
         * @private
         */
        this.services = new Map();

        /**
         * Whether the coordinator has been initialized
         * @type {boolean}
         * @private
         */
        this.initialized = false;

        /**
         * Array of middleware functions
         * @type {Array<Function>}
         * @private
         */
        this.middleware = [];

        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.registerService = this.registerService.bind(this);
        this.getService = this.getService.bind(this);
        this.execute = this.execute.bind(this);
    }

    /**
     * Initialize the service coordinator and all its services
     *
     * This method sets up service dependencies, initializes all services in the correct order,
     * establishes inter-service communication channels, and configures middleware.
     *
     * @param {Object} [options={}] - Initialization options
     * @param {boolean} [options.enableLogging=true] - Whether to enable service logging
     * @param {boolean} [options.enableErrorHandling=true] - Whether to enable error handling middleware
     * @returns {Promise<void>}
     *
     * @fires ServiceCoordinator#initialized
     * @fires ServiceCoordinator#initializationError
     *
     * @example
     * ```javascript
     * const coordinator = new ServiceCoordinator();
     * await coordinator.initialize({
     *   enableLogging: true,
     *   enableErrorHandling: true
     * });
     * ```
     */
    async initialize(options = {}) {
        try {
            console.log('Initializing service coordinator...');

            // Set up service dependencies
            await this.setupServiceDependencies();

            // Initialize all services
            await this.initializeServices();

            // Set up inter-service communication
            this.setupServiceCommunication();

            // Set up middleware
            this.setupMiddleware();

            this.initialized = true;
            this.emit('initialized');

            console.log('Service coordinator initialized successfully');

        } catch (error) {
            console.error('Failed to initialize service coordinator:', error);
            this.emit('initializationError', error);
            throw error;
        }
    }

    /**
     * Set up service dependencies
     */
    async setupServiceDependencies() {
        try {
            // Import services
            const AssetService = require('./asset-service');
            const GeneratorService = require('./generator-service');
            const UIService = require('./ui-service');
            const Store = require('../store');

            // Create store first (no dependencies)
            const store = new Store();
            this.registerService('store', store);

            // Create database manager
            const DatabaseManager = require('../database-manager');
            const dbManager = new DatabaseManager();
            this.registerService('database', dbManager);

            // Create file system service
            const FileSystemService = require('../file-system-service');
            const fsService = new FileSystemService();
            this.registerService('filesystem', fsService);

            // Create asset service
            const assetService = new AssetService(dbManager, fsService);
            this.registerService('asset', assetService);

            // Create generator service
            const generatorService = new GeneratorService(assetService, store);
            this.registerService('generator', generatorService);

            // Create UI service
            const uiService = new UIService(store, assetService, generatorService);
            this.registerService('ui', uiService);

            console.log('Service dependencies set up');

        } catch (error) {
            console.error('Error setting up service dependencies:', error);
            throw error;
        }
    }

    /**
     * Initialize all services
     */
    async initializeServices() {
        const initOrder = ['database', 'filesystem', 'store', 'asset', 'generator', 'ui'];

        for (const serviceName of initOrder) {
            const service = this.services.get(serviceName);
            if (service && typeof service.initialize === 'function') {
                try {
                    await service.initialize();
                    console.log(`Service ${serviceName} initialized`);
                } catch (error) {
                    console.error(`Failed to initialize service ${serviceName}:`, error);
                    throw error;
                }
            }
        }
    }

    /**
     * Set up inter-service communication
     */
    setupServiceCommunication() {
        // Asset Service -> Store communication
        const assetService = this.getService('asset');
        const store = this.getService('store');

        assetService.on('assetCreated', (data) => {
            store.dispatch({
                type: 'ASSET_CREATED',
                payload: data
            });
        });

        assetService.on('assetUpdated', (data) => {
            store.dispatch({
                type: 'ASSET_UPDATED',
                payload: data
            });
        });

        assetService.on('assetDeleted', (data) => {
            store.dispatch({
                type: 'ASSET_DELETED',
                payload: data
            });
        });

        // Generator Service -> Store communication
        const generatorService = this.getService('generator');

        generatorService.on('generationStarted', (data) => {
            store.dispatch({
                type: 'GENERATION_STARTED',
                payload: data
            });
        });

        generatorService.on('generationCompleted', (data) => {
            store.dispatch({
                type: 'GENERATION_COMPLETED',
                payload: data
            });
        });

        generatorService.on('generationFailed', (data) => {
            store.dispatch({
                type: 'GENERATION_FAILED',
                payload: data
            });
        });

        // UI Service -> Store communication
        const uiService = this.getService('ui');

        uiService.on('viewChanged', (data) => {
            store.dispatch({
                type: 'VIEW_CHANGED',
                payload: data
            });
        });

        uiService.on('assetTypeSelected', (data) => {
            store.dispatch({
                type: 'ASSET_TYPE_SELECTED',
                payload: data
            });
        });

        console.log('Inter-service communication set up');
    }

    /**
     * Set up middleware
     */
    setupMiddleware() {
        // Add logging middleware
        this.use(async (context, next) => {
            const startTime = Date.now();
            console.log(`[ServiceCoordinator] Executing ${context.operation} on ${context.service}`);

            try {
                const result = await next();
                const duration = Date.now() - startTime;
                console.log(`[ServiceCoordinator] ${context.operation} completed in ${duration}ms`);
                return result;
            } catch (error) {
                const duration = Date.now() - startTime;
                console.error(`[ServiceCoordinator] ${context.operation} failed after ${duration}ms:`, error);
                throw error;
            }
        });

        // Add error handling middleware
        this.use(async (context, next) => {
            try {
                return await next();
            } catch (error) {
                // Emit error event
                this.emit('operationError', {
                    operation: context.operation,
                    service: context.service,
                    error: error.message,
                    context
                });

                // Update store with error
                const store = this.getService('store');
                if (store) {
                    store.dispatch({
                        type: 'OPERATION_ERROR',
                        payload: {
                            operation: context.operation,
                            service: context.service,
                            error: error.message
                        }
                    });
                }

                throw error;
            }
        });

        console.log('Middleware set up');
    }

    /**
     * Register a service with the coordinator
     *
     * @param {string} name - Unique name for the service
     * @param {Object} service - Service instance to register
     * @throws {Error} If service name is already registered
     *
     * @fires ServiceCoordinator#serviceRegistered
     *
     * @example
     * ```javascript
     * const myService = new MyService();
     * coordinator.registerService('myService', myService);
     * ```
     */
    registerService(name, service) {
        if (this.services.has(name)) {
            throw new Error(`Service ${name} is already registered`);
        }

        this.services.set(name, service);
        this.emit('serviceRegistered', { name, service });

        console.log(`Service ${name} registered`);
    }

    /**
     * Get a registered service by name
     *
     * @param {string} name - Name of the service to retrieve
     * @returns {Object} The requested service instance
     * @throws {Error} If service is not found
     *
     * @example
     * ```javascript
     * const assetService = coordinator.getService('asset');
     * ```
     */
    getService(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not found`);
        }
        return service;
    }

    /**
     * Execute an operation on a service with middleware applied
     *
     * This method applies all registered middleware before executing the actual service operation,
     * providing cross-cutting concerns like logging, error handling, and performance monitoring.
     *
     * @param {string} serviceName - Name of the service to execute operation on
     * @param {string} operation - Name of the operation to execute
     * @param {...*} args - Arguments to pass to the operation
     * @returns {*} Result of the operation
     * @throws {Error} If coordinator is not initialized or service/operation not found
     *
     * @fires ServiceCoordinator#operationError
     *
     * @example
     * ```javascript
     * // Execute asset service operation
     * const assets = await coordinator.execute('asset', 'getAssets', { type: 'character' });
     *
     * // Execute generator service operation
     * const asset = await coordinator.execute('generator', 'generateAsset', 'character', config);
     * ```
     */
    async execute(serviceName, operation, ...args) {
        if (!this.initialized) {
            throw new Error('Service coordinator not initialized');
        }

        const service = this.getService(serviceName);
        const operationFn = service[operation];

        if (typeof operationFn !== 'function') {
            throw new Error(`Operation ${operation} not found on service ${serviceName}`);
        }

        const context = {
            service: serviceName,
            operation,
            args,
            timestamp: Date.now()
        };

        // Execute middleware chain
        let index = 0;
        const next = async () => {
            if (index < this.middleware.length) {
                const middleware = this.middleware[index++];
                return await middleware(context, next);
            } else {
                // Execute the actual operation
                return await operationFn.apply(service, args);
            }
        };

        return await next();
    }

    /**
     * Add middleware to the execution chain
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }

        this.middleware.push(middleware);
        console.log('Middleware added to service coordinator');
    }

    /**
     * Get service status
     */
    getServiceStatus() {
        const status = {};

        for (const [name, service] of this.services) {
            status[name] = {
                registered: true,
                initialized: typeof service.initialized === 'boolean' ? service.initialized : true,
                type: service.constructor.name
            };
        }

        return status;
    }

    /**
     * Get coordinator status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            services: this.getServiceStatus(),
            middlewareCount: this.middleware.length
        };
    }

    /**
     * Clean up all services
     */
    async cleanup() {
        console.log('Cleaning up service coordinator...');

        // Clean up services in reverse order
        const cleanupOrder = ['ui', 'generator', 'asset', 'filesystem', 'database', 'store'];

        for (const serviceName of cleanupOrder) {
            const service = this.services.get(serviceName);
            if (service && typeof service.cleanup === 'function') {
                try {
                    await service.cleanup();
                    console.log(`Service ${serviceName} cleaned up`);
                } catch (error) {
                    console.warn(`Error cleaning up service ${serviceName}:`, error);
                }
            }
        }

        this.services.clear();
        this.middleware = [];
        this.initialized = false;
        this.removeAllListeners();

        console.log('Service coordinator cleaned up');
    }

    // Convenience methods for common operations

    /**
     * Generate a single asset
     *
     * @param {string} type - Type of asset to generate (e.g., 'character', 'monster', 'vehicle')
     * @param {Object} config - Configuration object for the asset generation
     * @param {Object} [options={}] - Additional options for generation
     * @param {string} [options.name] - Custom name for the generated asset
     * @param {boolean} [options.save=true] - Whether to automatically save the asset
     * @returns {Promise<Object>} Generated asset object
     *
     * @example
     * ```javascript
     * const asset = await coordinator.generateAsset('character', {
     *   classType: 'warrior',
     *   equipment: ['sword', 'shield']
     * }, { name: 'Hero Character' });
     * ```
     */
    async generateAsset(type, config, options = {}) {
        return await this.execute('generator', 'generateAsset', type, config, options);
    }

    /**
     * Generate multiple assets in batch
     *
     * @param {Array<Object>} generations - Array of generation configurations
     * @param {Object} [options={}] - Batch processing options
     * @param {number} [options.concurrency=3] - Maximum concurrent generations
     * @returns {Promise<Object>} Batch generation results
     *
     * @example
     * ```javascript
     * const results = await coordinator.generateBatch([
     *   { type: 'character', config: { classType: 'warrior' }, name: 'Warrior 1' },
     *   { type: 'monster', config: { monsterType: 'goblin' }, name: 'Goblin 1' }
     * ], { concurrency: 2 });
     * ```
     */
    async generateBatch(generations, options = {}) {
        return await this.execute('generator', 'generateBatch', generations, options);
    }

    /**
     * Switch to a different UI view
     *
     * @param {string} viewName - Name of the view to switch to
     * @param {Object} [options={}] - View switching options
     * @returns {Promise<boolean>} Success status
     *
     * @example
     * ```javascript
     * await coordinator.switchView('generator');
     * await coordinator.switchView('library', { search: 'sword' });
     * ```
     */
    async switchView(viewName, options = {}) {
        return await this.execute('ui', 'switchView', viewName, options);
    }

    /**
     * Select an asset type for generation
     *
     * @param {string} type - Asset type to select
     * @param {Object} [options={}] - Selection options
     * @returns {Promise<Object>} Default configuration for the selected type
     *
     * @example
     * ```javascript
     * const config = await coordinator.selectAssetType('character');
     * console.log('Default config:', config);
     * ```
     */
    async selectAssetType(type, options = {}) {
        return await this.execute('ui', 'selectAssetType', type, options);
    }

    /**
     * Update current asset generation configuration
     *
     * @param {Object} updates - Configuration updates to apply
     * @param {Object} [options={}] - Update options
     * @returns {Promise<Object>} Updated configuration
     *
     * @example
     * ```javascript
     * const config = await coordinator.updateConfig({
     *   classType: 'mage',
     *   detailLevel: 8
     * });
     * ```
     */
    async updateConfig(updates, options = {}) {
        return await this.execute('ui', 'updateConfig', updates, options);
    }

    /**
     * Retrieve assets with optional filtering and pagination
     *
     * @param {Object} [query={}] - Query filter object
     * @param {Object} [options={}] - Query options
     * @param {number} [options.limit=50] - Maximum number of assets to return
     * @param {number} [options.skip=0] - Number of assets to skip
     * @param {Object} [options.sort] - Sort specification
     * @returns {Promise<Object>} Assets result with pagination info
     *
     * @example
     * ```javascript
     * const result = await coordinator.getAssets(
     *   { type: 'character' },
     *   { limit: 10, sort: { created_at: -1 } }
     * );
     * console.log(`${result.total} assets found`);
     * ```
     */
    async getAssets(query = {}, options = {}) {
        return await this.execute('asset', 'getAssets', query, options);
    }

    /**
     * Save a new asset to the database
     *
     * @param {Object} assetData - Asset data to save
     * @param {string} assetData.name - Asset name
     * @param {string} assetData.type - Asset type
     * @param {Object} [options={}] - Save options
     * @returns {Promise<Object>} Saved asset object
     *
     * @example
     * ```javascript
     * const asset = await coordinator.saveAsset({
     *   name: 'My Character',
     *   type: 'character',
     *   sprite: { data: '...', width: 64, height: 64 }
     * });
     * ```
     */
    async saveAsset(assetData, options = {}) {
        return await this.execute('asset', 'createAsset', assetData, options);
    }

    /**
     * Export assets to files
     *
     * @param {Array<string>} assetIds - IDs of assets to export
     * @param {string} [format='png'] - Export format
     * @param {Object} [options={}] - Export options
     * @param {string} [options.exportPath] - Custom export path
     * @returns {Promise<Array<Object>>} Export results
     *
     * @example
     * ```javascript
     * const results = await coordinator.exportAssets(
     *   ['asset1', 'asset2'],
     *   'png',
     *   { exportPath: './exports' }
     * );
     * ```
     */
    async exportAssets(assetIds, format = 'png', options = {}) {
        return await this.execute('ui', 'exportAssets', assetIds, format, options);
    }

    /**
     * Perform global search across assets
     *
     * @param {string} query - Search query string
     * @param {Object} [options={}] - Search options
     * @returns {Promise<Object>} Search results
     *
     * @example
     * ```javascript
     * const results = await coordinator.handleGlobalSearch('sword');
     * console.log(`Found ${results.total} assets`);
     * ```
     */
    async handleGlobalSearch(query, options = {}) {
        return await this.execute('ui', 'handleGlobalSearch', query, options);
    }

    /**
     * Handle a quick action from the UI
     *
     * @param {string} action - Action identifier
     * @param {Object} [options={}] - Action options
     * @returns {Promise<*>} Action result
     *
     * @example
     * ```javascript
     * await coordinator.handleQuickAction('generate-character');
     * await coordinator.handleQuickAction('open-library');
     * ```
     */
    async handleQuickAction(action, options = {}) {
        return await this.execute('ui', 'handleQuickAction', action, options);
    }

    /**
     * Get current UI state
     *
     * @returns {Object} Current UI state object containing view, asset type, config, etc.
     * @property {string} currentView - Currently active view name
     * @property {string|null} currentAssetType - Currently selected asset type
     * @property {Object} currentConfig - Current asset generation configuration
     * @property {Object|null} generatedAsset - Last generated asset
     * @property {Array<string>} loadingStates - Array of active loading operations
     * @property {Array<Object>} notifications - Array of active notifications
     *
     * @example
     * ```javascript
     * const uiState = coordinator.getUIState();
     * console.log('Current view:', uiState.currentView);
     * console.log('Selected asset type:', uiState.currentAssetType);
     * ```
     */
    getUIState() {
        const uiService = this.getService('ui');
        return uiService.getUIState();
    }

    /**
     * Get store state (optionally for a specific slice)
     *
     * @param {string|null} [sliceName=null] - Name of state slice to retrieve, or null for entire state
     * @returns {Object} Store state object or specific slice
     *
     * @example
     * ```javascript
     * // Get entire state
     * const fullState = coordinator.getStoreState();
     *
     * // Get specific slice
     * const assetsState = coordinator.getStoreState('assets');
     * const uiState = coordinator.getStoreState('ui');
     * ```
     */
    getStoreState(sliceName = null) {
        const store = this.getService('store');
        return store.getState(sliceName);
    }

    /**
     * Dispatch action to the store
     *
     * @param {Object} action - Action object to dispatch
     * @param {string} action.type - Action type identifier
     * @param {*} [action.payload] - Action payload data
     * @returns {Promise<Object>} Updated state after action is processed
     *
     * @fires Store#stateChanged
     *
     * @example
     * ```javascript
     * // Dispatch a simple action
     * await coordinator.dispatch({
     *   type: 'SET_THEME',
     *   payload: { theme: 'dark' }
     * });
     *
     * // Dispatch an asset-related action
     * await coordinator.dispatch({
     *   type: 'ASSET_SELECTED',
     *   payload: { assetId: 'asset123' }
     * });
     * ```
     */
    async dispatch(action) {
        const store = this.getService('store');
        return await store.dispatch(action);
    }
}

module.exports = ServiceCoordinator;
