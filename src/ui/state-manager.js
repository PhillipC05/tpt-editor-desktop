/**
 * TPT Asset Editor Desktop - State Manager
 * Manages UI state persistence and synchronization
 */

class StateManager {
    constructor() {
        this.state = {};
        this.persistedState = {};
        this.stateChangeListeners = new Map();
        this.autoSaveTimer = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the state manager
     */
    async initialize() {
        try {
            console.log('Initializing State Manager...');

            // Load persisted state
            await this.loadPersistedState();

            // Set up auto-save
            this.setupAutoSave();

            // Set up state synchronization
            this.setupStateSync();

            this.isInitialized = true;
            console.log('State Manager initialized successfully');

        } catch (error) {
            console.error('Failed to initialize State Manager:', error);
            throw error;
        }
    }

    /**
     * Load persisted state from storage
     */
    async loadPersistedState() {
        try {
            if (!window.electronAPI) return;

            const result = await window.electronAPI.dbGetUIState();
            if (result.success && result.state) {
                this.persistedState = result.state;
                this.state = { ...this.persistedState };
                console.log('Persisted state loaded:', this.persistedState);
            } else {
                // Initialize with default state
                this.initializeDefaultState();
            }
        } catch (error) {
            console.error('Error loading persisted state:', error);
            this.initializeDefaultState();
        }
    }

    /**
     * Initialize default state
     */
    initializeDefaultState() {
        this.state = {
            ui: {
                theme: 'light',
                language: 'en',
                sidebarCollapsed: false,
                activeView: 'dashboard',
                windowSize: { width: 1200, height: 800 },
                windowPosition: { x: 100, y: 100 }
            },
            generator: {
                lastUsedType: null,
                recentConfigs: [],
                favoriteTemplates: [],
                autoPreview: true,
                realTimeUpdates: true
            },
            library: {
                viewMode: 'grid',
                sortBy: 'date',
                sortOrder: 'desc',
                filterType: 'all',
                searchQuery: '',
                selectedAssets: [],
                lastViewedAsset: null
            },
            batch: {
                lastJobConfig: null,
                recentJobs: [],
                autoStartJobs: false,
                maxConcurrentJobs: 3
            },
            settings: {
                lastOpenedSection: 'general',
                unsavedChanges: false,
                validationErrors: {}
            },
            session: {
                lastActive: new Date().toISOString(),
                sessionStart: new Date().toISOString(),
                actionsPerformed: 0,
                assetsGenerated: 0
            }
        };

        this.persistedState = { ...this.state };
    }

    /**
     * Set up auto-save functionality
     */
    setupAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveTimer = setInterval(() => {
            this.autoSaveState();
        }, 30000);

        // Save on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveState();
            }
        });

        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }

    /**
     * Set up state synchronization
     */
    setupStateSync() {
        // Listen for state changes from other parts of the application
        document.addEventListener('stateChange', (event) => {
            const { key, value, source } = event.detail;
            this.updateState(key, value, source);
        });

        // Sync state across browser tabs/windows (if applicable)
        window.addEventListener('storage', (event) => {
            if (event.key === 'tpt-ui-state') {
                this.handleExternalStateChange(event.newValue);
            }
        });
    }

    /**
     * Get state value
     */
    getState(key, defaultValue = null) {
        return this.getNestedValue(this.state, key) || defaultValue;
    }

    /**
     * Set state value
     */
    setState(key, value, options = {}) {
        const oldValue = this.getNestedValue(this.state, key);

        // Update state
        this.setNestedValue(this.state, key, value);

        // Trigger change listeners
        this.triggerStateChange(key, value, oldValue, options);

        // Auto-save if enabled
        if (options.autoSave !== false) {
            this.scheduleAutoSave();
        }

        // Sync with external storage if needed
        if (options.sync !== false) {
            this.syncStateToStorage(key, value);
        }

        return value;
    }

    /**
     * Update state (internal method)
     */
    updateState(key, value, source = 'internal') {
        const oldValue = this.getNestedValue(this.state, key);
        this.setNestedValue(this.state, key, value);

        // Trigger change listeners
        this.triggerStateChange(key, value, oldValue, { source });
    }

    /**
     * Merge state object
     */
    mergeState(stateObject, options = {}) {
        const changes = [];

        const mergeRecursive = (obj, path = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const fullPath = path ? `${path}.${key}` : key;

                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    mergeRecursive(value, fullPath);
                } else {
                    const oldValue = this.getNestedValue(this.state, fullPath);
                    if (oldValue !== value) {
                        this.setNestedValue(this.state, fullPath, value);
                        changes.push({ key: fullPath, value, oldValue });
                    }
                }
            }
        };

        mergeRecursive(stateObject);

        // Trigger change listeners for all changes
        changes.forEach(change => {
            this.triggerStateChange(change.key, change.value, change.oldValue, options);
        });

        // Auto-save if enabled
        if (options.autoSave !== false && changes.length > 0) {
            this.scheduleAutoSave();
        }

        return changes.length;
    }

    /**
     * Subscribe to state changes
     */
    subscribe(key, callback, options = {}) {
        if (!this.stateChangeListeners.has(key)) {
            this.stateChangeListeners.set(key, []);
        }

        const listener = {
            callback,
            options,
            id: Date.now() + Math.random()
        };

        this.stateChangeListeners.get(key).push(listener);

        // Return unsubscribe function
        return () => {
            const listeners = this.stateChangeListeners.get(key);
            if (listeners) {
                const index = listeners.findIndex(l => l.id === listener.id);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }

    /**
     * Unsubscribe from state changes
     */
    unsubscribe(key, callback) {
        const listeners = this.stateChangeListeners.get(key);
        if (listeners) {
            const index = listeners.findIndex(l => l.callback === callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Trigger state change listeners
     */
    triggerStateChange(key, newValue, oldValue, options = {}) {
        const listeners = this.stateChangeListeners.get(key);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener.callback(newValue, oldValue, key, options);
                } catch (error) {
                    console.error(`Error in state change listener for ${key}:`, error);
                }
            });
        }

        // Also trigger wildcard listeners
        const wildcardListeners = this.stateChangeListeners.get('*');
        if (wildcardListeners) {
            wildcardListeners.forEach(listener => {
                try {
                    listener.callback(newValue, oldValue, key, options);
                } catch (error) {
                    console.error(`Error in wildcard state change listener:`, error);
                }
            });
        }
    }

    /**
     * Save state to persistent storage
     */
    async saveState() {
        try {
            if (!window.electronAPI) return;

            const result = await window.electronAPI.dbSaveUIState(this.state);
            if (result.success) {
                this.persistedState = { ...this.state };
                console.log('State saved successfully');
            } else {
                console.error('Failed to save state:', result.error);
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    /**
     * Load state from persistent storage
     */
    async loadState() {
        await this.loadPersistedState();
        return this.state;
    }

    /**
     * Reset state to defaults
     */
    async resetState(options = {}) {
        // Keep session data
        const sessionData = this.state.session;

        // Initialize default state
        this.initializeDefaultState();

        // Restore session data
        this.state.session = sessionData;

        // Save if requested
        if (options.save !== false) {
            await this.saveState();
        }

        // Trigger reset event
        document.dispatchEvent(new CustomEvent('stateReset', {
            detail: { options }
        }));

        return this.state;
    }

    /**
     * Export state for backup
     */
    exportState() {
        return {
            state: { ...this.state },
            persistedState: { ...this.persistedState },
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Import state from backup
     */
    async importState(backupData, options = {}) {
        try {
            if (!backupData.state) {
                throw new Error('Invalid backup data');
            }

            // Validate backup data
            this.validateBackupData(backupData);

            // Merge imported state
            this.mergeState(backupData.state, { autoSave: false });

            // Save if requested
            if (options.save !== false) {
                await this.saveState();
            }

            // Trigger import event
            document.dispatchEvent(new CustomEvent('stateImported', {
                detail: { backupData, options }
            }));

            return true;
        } catch (error) {
            console.error('Error importing state:', error);
            throw error;
        }
    }

    /**
     * Validate backup data
     */
    validateBackupData(backupData) {
        if (typeof backupData !== 'object') {
            throw new Error('Backup data must be an object');
        }

        if (!backupData.state) {
            throw new Error('Backup data must contain state');
        }

        // Add more validation as needed
    }

    /**
     * Get state difference
     */
    getStateDiff(otherState = null) {
        const compareState = otherState || this.persistedState;
        return this.getObjectDiff(this.state, compareState);
    }

    /**
     * Check if state has unsaved changes
     */
    hasUnsavedChanges() {
        const diff = this.getStateDiff();
        return Object.keys(diff).length > 0;
    }

    /**
     * Get state statistics
     */
    getStateStats() {
        return {
            totalKeys: this.countKeys(this.state),
            persistedKeys: this.countKeys(this.persistedState),
            unsavedChanges: this.hasUnsavedChanges(),
            listenersCount: Array.from(this.stateChangeListeners.values())
                .reduce((sum, listeners) => sum + listeners.length, 0),
            lastSaved: this.persistedState._lastSaved || null,
            lastModified: this.state._lastModified || null
        };
    }

    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        // Debounce auto-save
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.autoSaveState();
        }, 5000); // 5 second debounce
    }

    /**
     * Auto-save state
     */
    async autoSaveState() {
        if (this.hasUnsavedChanges()) {
            await this.saveState();
        }
    }

    /**
     * Sync state to external storage
     */
    syncStateToStorage(key, value) {
        try {
            // Sync to localStorage for cross-tab communication
            const syncData = {
                key,
                value,
                timestamp: Date.now(),
                source: 'state-manager'
            };

            localStorage.setItem('tpt-ui-state-sync', JSON.stringify(syncData));
        } catch (error) {
            console.error('Error syncing state to storage:', error);
        }
    }

    /**
     * Handle external state change
     */
    handleExternalStateChange(newValue) {
        try {
            const syncData = JSON.parse(newValue);
            if (syncData.source !== 'state-manager') {
                // Update state from external change
                this.updateState(syncData.key, syncData.value, 'external');
            }
        } catch (error) {
            console.error('Error handling external state change:', error);
        }
    }

    /**
     * Get nested value from object
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Set nested value in object
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);

        target[lastKey] = value;

        // Update last modified timestamp
        obj._lastModified = new Date().toISOString();
    }

    /**
     * Get object difference
     */
    getObjectDiff(obj1, obj2, path = '') {
        const diff = {};

        // Get all keys from both objects
        const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

        for (const key of keys) {
            const fullPath = path ? `${path}.${key}` : key;
            const val1 = obj1[key];
            const val2 = obj2[key];

            if (val1 === val2) continue;

            if (typeof val1 === 'object' && typeof val2 === 'object' &&
                val1 !== null && val2 !== null && !Array.isArray(val1) && !Array.isArray(val2)) {
                const nestedDiff = this.getObjectDiff(val1, val2, fullPath);
                if (Object.keys(nestedDiff).length > 0) {
                    Object.assign(diff, nestedDiff);
                }
            } else {
                diff[fullPath] = { oldValue: val2, newValue: val1 };
            }
        }

        return diff;
    }

    /**
     * Count keys in object recursively
     */
    countKeys(obj, count = 0) {
        for (const [key, value] of Object.entries(obj)) {
            if (key.startsWith('_')) continue; // Skip internal keys
            count++;

            if (typeof value === 'object' && value !== null) {
                count = this.countKeys(value, count);
            }
        }
        return count;
    }

    /**
     * Create state snapshot
     */
    createSnapshot(name = null) {
        const snapshot = {
            id: Date.now().toString(),
            name: name || `Snapshot ${new Date().toLocaleString()}`,
            state: { ...this.state },
            createdAt: new Date().toISOString()
        };

        // Store snapshot (in a real implementation, this would be persisted)
        if (!this.snapshots) {
            this.snapshots = [];
        }

        this.snapshots.push(snapshot);

        // Keep only last 10 snapshots
        if (this.snapshots.length > 10) {
            this.snapshots.shift();
        }

        return snapshot.id;
    }

    /**
     * Restore from snapshot
     */
    restoreSnapshot(snapshotId) {
        const snapshot = this.snapshots?.find(s => s.id === snapshotId);
        if (!snapshot) {
            throw new Error('Snapshot not found');
        }

        this.state = { ...snapshot.state };
        this.triggerStateChange('*', this.state, null, { source: 'snapshot' });

        return true;
    }

    /**
     * Get snapshots list
     */
    getSnapshots() {
        return this.snapshots || [];
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        console.log('Cleaning up State Manager...');

        // Clear auto-save timer
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }

        // Save final state
        await this.saveState();

        // Clear listeners
        this.stateChangeListeners.clear();

        // Clear snapshots
        this.snapshots = [];
    }
}

module.exports = StateManager;
