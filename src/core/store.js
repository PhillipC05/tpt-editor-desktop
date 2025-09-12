/**
 * TPT Asset Editor Desktop - Centralized State Management Store
 * Flux/Redux-like store for managing application state
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class Store extends EventEmitter {
    constructor(options = {}) {
        super();

        this.state = {};
        this.reducers = new Map();
        this.middlewares = [];
        this.listeners = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = options.maxHistorySize || 50;
        this.persistenceEnabled = options.persistenceEnabled !== false;
        this.persistencePath = options.persistencePath || path.join(process.cwd(), 'store-state.json');
        this.autoSaveInterval = options.autoSaveInterval || 30000; // 30 seconds
        this.validationEnabled = options.validationEnabled !== false;

        // Initialize state
        this.initializeState();

        // Set up auto-save if enabled
        if (this.persistenceEnabled) {
            this.setupAutoSave();
        }

        // Set up state validation if enabled
        if (this.validationEnabled) {
            this.setupValidation();
        }
    }

    /**
     * Initialize the store state
     */
    initializeState() {
        this.state = {
            // Application state
            app: {
                version: '1.0.0',
                initialized: false,
                loading: false,
                error: null,
                theme: 'light',
                language: 'en',
                lastSaved: null,
                sessionId: this.generateSessionId()
            },

            // UI state
            ui: {
                currentView: 'home',
                sidebarCollapsed: false,
                activeModal: null,
                notifications: [],
                breadcrumbs: [],
                searchQuery: '',
                selectedItems: [],
                contextMenu: null
            },

            // Asset state
            assets: {
                items: [],
                selectedAsset: null,
                filters: {
                    type: 'all',
                    tags: [],
                    quality: { min: 0, max: 1 },
                    dateRange: null,
                    search: ''
                },
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0
                },
                loading: false,
                error: null,
                stats: {
                    total: 0,
                    byType: {},
                    averageQuality: 0,
                    totalSize: 0
                }
            },

            // Generator state
            generators: {
                activeGenerator: null,
                runningGenerators: [],
                generatorQueue: [],
                presets: {},
                history: [],
                settings: {
                    autoSave: true,
                    quality: 'high',
                    format: 'png',
                    batchSize: 10
                }
            },

            // User preferences
            preferences: {
                ui: {
                    theme: 'light',
                    language: 'en',
                    animations: true,
                    soundEffects: true,
                    autoSave: true
                },
                generation: {
                    defaultQuality: 'high',
                    defaultFormat: 'png',
                    batchSize: 10,
                    autoExport: false
                },
                performance: {
                    maxMemory: 512, // MB
                    maxConcurrentGenerators: 3,
                    cacheSize: 100
                }
            },

            // System state
            system: {
                memoryUsage: 0,
                cpuUsage: 0,
                diskUsage: 0,
                networkStatus: 'online',
                lastBackup: null,
                performance: {
                    fps: 60,
                    renderTime: 0,
                    loadTime: 0
                }
            },

            // Plugin state
            plugins: {
                installed: [],
                enabled: [],
                marketplace: [],
                updates: []
            },

            // Workspace state
            workspace: {
                currentProject: null,
                recentProjects: [],
                unsavedChanges: false,
                autoSaveEnabled: true,
                lastAutoSave: null
            }
        };

        this.emit('initialized', this.state);
    }

    /**
     * Register a reducer for a specific state slice
     */
    registerReducer(sliceName, reducer) {
        if (typeof reducer !== 'function') {
            throw new Error('Reducer must be a function');
        }

        this.reducers.set(sliceName, reducer);
        console.log(`Registered reducer for slice: ${sliceName}`);
    }

    /**
     * Add middleware to the store
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }

        this.middlewares.push(middleware);
        console.log(`Added middleware: ${middleware.name || 'anonymous'}`);
    }

    /**
     * Dispatch an action to update state
     */
    async dispatch(action) {
        if (!action || typeof action.type !== 'string') {
            throw new Error('Action must have a type property');
        }

        try {
            // Apply middlewares
            let processedAction = action;
            for (const middleware of this.middlewares) {
                processedAction = await middleware(processedAction, this.state);
                if (!processedAction) break;
            }

            if (!processedAction) return;

            // Create action context
            const context = {
                action: processedAction,
                previousState: this.deepClone(this.state),
                timestamp: Date.now(),
                sessionId: this.state.app.sessionId
            };

            // Apply reducers
            const newState = this.applyReducers(processedAction);

            // Validate new state if validation is enabled
            if (this.validationEnabled) {
                await this.validateState(newState, processedAction);
            }

            // Update state
            this.state = newState;

            // Add to history
            this.addToHistory(context);

            // Emit events
            this.emit('stateChanged', {
                action: processedAction,
                previousState: context.previousState,
                newState: newState,
                context
            });

            this.emit(processedAction.type, {
                action: processedAction,
                state: newState,
                context
            });

            // Auto-save if enabled
            if (this.persistenceEnabled && this.shouldAutoSave(processedAction)) {
                await this.saveState();
            }

            return newState;

        } catch (error) {
            console.error('Error dispatching action:', error);
            this.emit('dispatchError', { action, error });

            // Emit error action
            this.dispatch({
                type: 'ERROR_OCCURRED',
                payload: {
                    message: error.message,
                    action: action,
                    timestamp: Date.now()
                }
            });

            throw error;
        }
    }

    /**
     * Apply all registered reducers to create new state
     */
    applyReducers(action) {
        const newState = this.deepClone(this.state);

        for (const [sliceName, reducer] of this.reducers) {
            if (newState[sliceName] !== undefined) {
                const sliceState = reducer(newState[sliceName], action);
                if (sliceState !== undefined) {
                    newState[sliceName] = sliceState;
                }
            }
        }

        return newState;
    }

    /**
     * Get current state (optionally for a specific slice)
     */
    getState(sliceName = null) {
        if (sliceName) {
            return this.state[sliceName];
        }
        return this.deepClone(this.state);
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener, sliceName = null) {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }

        const listenerId = this.generateId();
        const wrappedListener = (data) => {
            if (!sliceName || data.action.type.includes(sliceName.toUpperCase())) {
                listener(data);
            }
        };

        this.listeners.set(listenerId, wrappedListener);
        this.on('stateChanged', wrappedListener);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listenerId);
            this.removeListener('stateChanged', wrappedListener);
        };
    }

    /**
     * Subscribe to specific action types
     */
    subscribeToAction(actionType, listener) {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }

        const listenerId = this.generateId();
        this.listeners.set(listenerId, listener);
        this.on(actionType, listener);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listenerId);
            this.removeListener(actionType, listener);
        };
    }

    /**
     * Add action to history for undo/redo
     */
    addToHistory(context) {
        // Remove any history after current index (for when we're not at the end)
        this.history = this.history.slice(0, this.historyIndex + 1);

        // Add new action to history
        this.history.push(context);

        // Maintain history size limit
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    /**
     * Undo last action
     */
    async undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousContext = this.history[this.historyIndex];

            this.state = previousContext.previousState;
            this.emit('undo', {
                action: previousContext.action,
                state: this.state,
                context: previousContext
            });

            return true;
        }
        return false;
    }

    /**
     * Redo next action
     */
    async redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const nextContext = this.history[this.historyIndex];

            this.state = this.applyReducers(nextContext.action);
            this.emit('redo', {
                action: nextContext.action,
                state: this.state,
                context: nextContext
            });

            return true;
        }
        return false;
    }

    /**
     * Get history information
     */
    getHistoryInfo() {
        return {
            canUndo: this.historyIndex > 0,
            canRedo: this.historyIndex < this.history.length - 1,
            currentIndex: this.historyIndex,
            totalActions: this.history.length,
            maxHistorySize: this.maxHistorySize
        };
    }

    /**
     * Save state to persistent storage
     */
    async saveState() {
        try {
            const stateToSave = {
                state: this.state,
                history: this.history,
                historyIndex: this.historyIndex,
                timestamp: Date.now(),
                version: this.state.app.version
            };

            await fs.writeFile(this.persistencePath, JSON.stringify(stateToSave, null, 2));
            this.state.app.lastSaved = new Date().toISOString();

            this.emit('stateSaved', {
                path: this.persistencePath,
                timestamp: Date.now()
            });

            console.log('State saved to:', this.persistencePath);
        } catch (error) {
            console.error('Error saving state:', error);
            throw error;
        }
    }

    /**
     * Load state from persistent storage
     */
    async loadState() {
        try {
            const data = await fs.readFile(this.persistencePath, 'utf8');
            const savedData = JSON.parse(data);

            // Validate saved data
            if (savedData.state && savedData.version === this.state.app.version) {
                this.state = { ...this.state, ...savedData.state };
                this.history = savedData.history || [];
                this.historyIndex = savedData.historyIndex || -1;

                this.emit('stateLoaded', {
                    path: this.persistencePath,
                    timestamp: savedData.timestamp
                });

                console.log('State loaded from:', this.persistencePath);
                return true;
            } else {
                console.warn('Saved state version mismatch or invalid data');
                return false;
            }
        } catch (error) {
            console.warn('Error loading state, using default:', error.message);
            return false;
        }
    }

    /**
     * Reset state to initial values
     */
    async resetState() {
        const previousState = this.deepClone(this.state);
        this.initializeState();
        this.history = [];
        this.historyIndex = -1;

        this.emit('stateReset', {
            previousState,
            newState: this.state
        });

        if (this.persistenceEnabled) {
            await this.saveState();
        }
    }

    /**
     * Set up auto-save functionality
     */
    setupAutoSave() {
        this.autoSaveTimer = setInterval(async () => {
            try {
                if (this.state.workspace.unsavedChanges) {
                    await this.saveState();
                    this.state.workspace.lastAutoSave = new Date().toISOString();
                    this.state.workspace.unsavedChanges = false;
                }
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }, this.autoSaveInterval);
    }

    /**
     * Set up state validation
     */
    setupValidation() {
        // Add validation middleware
        this.use(async (action, state) => {
            // Basic validation - can be extended
            if (action.payload) {
                this.validateActionPayload(action.payload);
            }
            return action;
        });
    }

    /**
     * Validate action payload
     */
    validateActionPayload(payload) {
        // Basic payload validation - can be extended with schema validation
        if (payload && typeof payload === 'object') {
            // Check for common validation issues
            if (payload.id && typeof payload.id !== 'string') {
                throw new Error('ID must be a string');
            }

            if (payload.name && typeof payload.name !== 'string') {
                throw new Error('Name must be a string');
            }

            if (payload.type && typeof payload.type !== 'string') {
                throw new Error('Type must be a string');
            }
        }
    }

    /**
     * Validate state after changes
     */
    async validateState(newState, action) {
        // Basic state validation - can be extended
        if (!newState.app) {
            throw new Error('App state is required');
        }

        if (!newState.ui) {
            throw new Error('UI state is required');
        }

        if (!newState.assets) {
            throw new Error('Assets state is required');
        }

        // Validate specific constraints
        if (newState.assets.selectedAsset && !newState.assets.items.find(item => item.id === newState.assets.selectedAsset)) {
            console.warn('Selected asset not found in items list');
        }
    }

    /**
     * Check if action should trigger auto-save
     */
    shouldAutoSave(action) {
        const autoSaveActions = [
            'ASSET_CREATED',
            'ASSET_UPDATED',
            'ASSET_DELETED',
            'GENERATOR_COMPLETED',
            'PREFERENCES_UPDATED',
            'PROJECT_SAVED'
        ];

        return autoSaveActions.includes(action.type);
    }

    /**
     * Deep clone an object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));

        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get store statistics
     */
    getStats() {
        return {
            stateSize: JSON.stringify(this.state).length,
            historySize: this.history.length,
            listenersCount: this.listeners.size,
            reducersCount: this.reducers.size,
            middlewaresCount: this.middlewares.size,
            persistenceEnabled: this.persistenceEnabled,
            validationEnabled: this.validationEnabled,
            sessionId: this.state.app.sessionId
        };
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        // Clear auto-save timer
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        // Save final state
        if (this.persistenceEnabled) {
            try {
                await this.saveState();
            } catch (error) {
                console.warn('Failed to save state during cleanup:', error);
            }
        }

        // Clear all listeners
        this.removeAllListeners();

        // Clear collections
        this.reducers.clear();
        this.listeners.clear();
        this.middlewares = [];
        this.history = [];
        this.historyIndex = -1;

        console.log('Store cleaned up');
    }
}

module.exports = Store;
