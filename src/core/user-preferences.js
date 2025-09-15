/**
 * User Preferences Management System
 * Handles user settings, preferences, and configuration persistence
 */

const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');
const EventEmitter = require('events');

class UserPreferences extends EventEmitter {
    constructor(options = {}) {
        super();

        this.preferencesDir = options.preferencesDir || path.join(app.getPath('userData'), 'preferences');
        this.preferencesFile = path.join(this.preferencesDir, 'user-preferences.json');
        this.backupDir = path.join(this.preferencesDir, 'backups');

        // Default preferences
        this.defaults = {
            // UI Preferences
            theme: 'system',
            language: 'en',
            fontSize: 'medium',
            highContrast: false,
            animations: true,
            compactMode: false,

            // Experience Level
            experienceLevel: 'intermediate', // 'beginner', 'intermediate', 'advanced'
            showTooltips: true,
            showAdvancedOptions: false,
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds

            // Performance Preferences
            maxConcurrentOperations: 4,
            memoryLimit: 512, // MB
            enableGpuAcceleration: true,
            enableBackgroundProcessing: true,

            // Generator Preferences
            defaultGeneratorSettings: {},
            favoriteGenerators: [],
            recentGenerators: [],

            // Notification Preferences
            enableNotifications: true,
            notificationTypes: {
                generationComplete: true,
                errors: true,
                warnings: true,
                updates: false
            },

            // Privacy Preferences
            enableAnalytics: false,
            enableCrashReporting: true,
            shareUsageData: false,

            // Shortcut Preferences
            customShortcuts: {},
            enableKeyboardShortcuts: true,

            // Window Preferences
            windowBounds: null,
            maximized: false,
            alwaysOnTop: false,

            // Recent Files
            recentFiles: [],
            maxRecentFiles: 10,

            // Export Preferences
            defaultExportFormat: 'png',
            defaultExportQuality: 90,
            exportDirectory: null
        };

        this.preferences = { ...this.defaults };
        this.isLoaded = false;
        this.isDirty = false;

        // Auto-save timer
        this.autoSaveTimer = null;

        this.init();
    }

    /**
     * Initialize the preferences system
     */
    async init() {
        try {
            await fs.mkdir(this.preferencesDir, { recursive: true });
            await fs.mkdir(this.backupDir, { recursive: true });

            await this.load();
            this.setupAutoSave();

            console.log('User preferences system initialized');
        } catch (error) {
            console.error('Failed to initialize user preferences:', error);
            // Continue with defaults
        }
    }

    /**
     * Load preferences from disk
     */
    async load() {
        try {
            const data = await fs.readFile(this.preferencesFile, 'utf8');
            const loadedPrefs = JSON.parse(data);

            // Deep merge with defaults
            this.preferences = this.deepMerge(this.defaults, loadedPrefs);

            // Validate preferences
            this.validatePreferences();

            this.isLoaded = true;
            this.emit('loaded', this.preferences);

            console.log('User preferences loaded successfully');

        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, use defaults
                console.log('No preferences file found, using defaults');
                this.preferences = { ...this.defaults };
                this.isLoaded = true;
            } else {
                console.error('Failed to load preferences:', error);
                throw error;
            }
        }
    }

    /**
     * Save preferences to disk
     */
    async save() {
        try {
            // Create backup before saving
            await this.createBackup();

            const data = JSON.stringify(this.preferences, null, 2);
            await fs.writeFile(this.preferencesFile, data, 'utf8');

            this.isDirty = false;
            this.emit('saved', this.preferences);

            console.log('User preferences saved successfully');

        } catch (error) {
            console.error('Failed to save preferences:', error);
            throw error;
        }
    }

    /**
     * Get a preference value
     */
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.preferences;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    /**
     * Set a preference value
     */
    set(key, value) {
        const keys = key.split('.');
        let obj = this.preferences;

        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in obj) || typeof obj[k] !== 'object') {
                obj[k] = {};
            }
            obj = obj[k];
        }

        // Set the value
        const finalKey = keys[keys.length - 1];
        const oldValue = obj[finalKey];
        obj[finalKey] = value;

        this.isDirty = true;
        this.emit('changed', { key, oldValue, newValue: value });

        // Auto-save if enabled
        if (this.get('autoSave')) {
            this.scheduleAutoSave();
        }

        return value;
    }

    /**
     * Set multiple preferences at once
     */
    setMultiple(preferences) {
        const changes = [];

        for (const [key, value] of Object.entries(preferences)) {
            const oldValue = this.get(key);
            this.set(key, value);
            changes.push({ key, oldValue, newValue: value });
        }

        this.emit('batch-changed', changes);
        return changes;
    }

    /**
     * Reset a preference to its default value
     */
    reset(key) {
        const keys = key.split('.');
        let defaultsObj = this.defaults;

        // Navigate to the default value
        for (const k of keys) {
            if (defaultsObj && typeof defaultsObj === 'object' && k in defaultsObj) {
                defaultsObj = defaultsObj[k];
            } else {
                throw new Error(`No default value found for preference: ${key}`);
            }
        }

        return this.set(key, defaultsObj);
    }

    /**
     * Reset all preferences to defaults
     */
    async resetAll() {
        this.preferences = { ...this.defaults };
        this.isDirty = true;

        await this.save();
        this.emit('reset', this.preferences);

        console.log('All preferences reset to defaults');
    }

    /**
     * Check if user is in beginner mode
     */
    isBeginnerMode() {
        return this.get('experienceLevel') === 'beginner';
    }

    /**
     * Check if user is in advanced mode
     */
    isAdvancedMode() {
        return this.get('experienceLevel') === 'advanced';
    }

    /**
     * Set experience level
     */
    setExperienceLevel(level) {
        if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
            throw new Error(`Invalid experience level: ${level}`);
        }

        const oldLevel = this.get('experienceLevel');
        this.set('experienceLevel', level);

        // Adjust related preferences based on experience level
        this.adjustPreferencesForExperienceLevel(level, oldLevel);

        this.emit('experience-level-changed', { oldLevel, newLevel: level });
    }

    /**
     * Adjust preferences based on experience level
     */
    adjustPreferencesForExperienceLevel(newLevel, oldLevel) {
        const adjustments = {
            beginner: {
                showTooltips: true,
                showAdvancedOptions: false,
                maxConcurrentOperations: 2,
                enableNotifications: true
            },
            intermediate: {
                showTooltips: true,
                showAdvancedOptions: false,
                maxConcurrentOperations: 4,
                enableNotifications: true
            },
            advanced: {
                showTooltips: false,
                showAdvancedOptions: true,
                maxConcurrentOperations: 8,
                enableNotifications: false
            }
        };

        if (adjustments[newLevel]) {
            this.setMultiple(adjustments[newLevel]);
        }
    }

    /**
     * Add recent file
     */
    addRecentFile(filePath) {
        const recentFiles = this.get('recentFiles', []);
        const maxRecent = this.get('maxRecentFiles', 10);

        // Remove if already exists
        const filtered = recentFiles.filter(f => f !== filePath);

        // Add to beginning
        filtered.unshift(filePath);

        // Limit to max
        const limited = filtered.slice(0, maxRecent);

        this.set('recentFiles', limited);
    }

    /**
     * Remove recent file
     */
    removeRecentFile(filePath) {
        const recentFiles = this.get('recentFiles', []);
        const filtered = recentFiles.filter(f => f !== filePath);
        this.set('recentFiles', filtered);
    }

    /**
     * Clear recent files
     */
    clearRecentFiles() {
        this.set('recentFiles', []);
    }

    /**
     * Add favorite generator
     */
    addFavoriteGenerator(generatorId) {
        const favorites = this.get('favoriteGenerators', []);
        if (!favorites.includes(generatorId)) {
            favorites.push(generatorId);
            this.set('favoriteGenerators', favorites);
        }
    }

    /**
     * Remove favorite generator
     */
    removeFavoriteGenerator(generatorId) {
        const favorites = this.get('favoriteGenerators', []);
        const filtered = favorites.filter(id => id !== generatorId);
        this.set('favoriteGenerators', filtered);
    }

    /**
     * Add recent generator
     */
    addRecentGenerator(generatorId) {
        const recent = this.get('recentGenerators', []);
        const filtered = recent.filter(id => id !== generatorId);
        filtered.unshift(generatorId);

        // Keep only last 20
        const limited = filtered.slice(0, 20);
        this.set('recentGenerators', limited);
    }

    /**
     * Get UI preferences for current experience level
     */
    getUIConfiguration() {
        const experienceLevel = this.get('experienceLevel');
        const theme = this.get('theme');
        const highContrast = this.get('highContrast');

        return {
            experienceLevel,
            theme,
            highContrast,
            showTooltips: this.get('showTooltips'),
            showAdvancedOptions: this.get('showAdvancedOptions'),
            compactMode: this.get('compactMode'),
            animations: this.get('animations'),
            fontSize: this.get('fontSize')
        };
    }

    /**
     * Get performance preferences
     */
    getPerformanceConfiguration() {
        return {
            maxConcurrentOperations: this.get('maxConcurrentOperations'),
            memoryLimit: this.get('memoryLimit'),
            enableGpuAcceleration: this.get('enableGpuAcceleration'),
            enableBackgroundProcessing: this.get('enableBackgroundProcessing')
        };
    }

    /**
     * Export preferences to file
     */
    async exportPreferences(filePath) {
        try {
            const exportData = {
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                preferences: this.preferences
            };

            await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
            console.log(`Preferences exported to: ${filePath}`);

        } catch (error) {
            console.error('Failed to export preferences:', error);
            throw error;
        }
    }

    /**
     * Import preferences from file
     */
    async importPreferences(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            const importData = JSON.parse(data);

            if (!importData.preferences) {
                throw new Error('Invalid preferences file format');
            }

            // Merge imported preferences with current ones
            const merged = this.deepMerge(this.preferences, importData.preferences);
            this.preferences = merged;
            this.isDirty = true;

            await this.save();
            this.emit('imported', importData);

            console.log(`Preferences imported from: ${filePath}`);

        } catch (error) {
            console.error('Failed to import preferences:', error);
            throw error;
        }
    }

    /**
     * Create backup of current preferences
     */
    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.backupDir, `preferences-backup-${timestamp}.json`);

            const backupData = {
                timestamp: new Date().toISOString(),
                preferences: this.preferences
            };

            await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));

            // Clean old backups (keep last 10)
            await this.cleanOldBackups();

        } catch (error) {
            console.warn('Failed to create preferences backup:', error);
        }
    }

    /**
     * Clean old backup files
     */
    async cleanOldBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files
                .filter(f => f.startsWith('preferences-backup-'))
                .sort()
                .reverse();

            // Keep only last 10 backups
            if (backupFiles.length > 10) {
                const toDelete = backupFiles.slice(10);
                for (const file of toDelete) {
                    await fs.unlink(path.join(this.backupDir, file));
                }
            }

        } catch (error) {
            console.warn('Failed to clean old backups:', error);
        }
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        if (this.get('autoSave')) {
            this.scheduleAutoSave();
        }
    }

    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        const interval = this.get('autoSaveInterval', 30000);
        this.autoSaveTimer = setTimeout(async () => {
            if (this.isDirty) {
                try {
                    await this.save();
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }
        }, interval);
    }

    /**
     * Deep merge two objects
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * Validate preferences structure
     */
    validatePreferences() {
        // Ensure all required keys exist
        const requiredKeys = ['theme', 'language', 'experienceLevel'];

        for (const key of requiredKeys) {
            if (!(key in this.preferences)) {
                console.warn(`Missing required preference: ${key}, using default`);
                this.preferences[key] = this.defaults[key];
            }
        }

        // Validate experience level
        const validLevels = ['beginner', 'intermediate', 'advanced'];
        if (!validLevels.includes(this.preferences.experienceLevel)) {
            console.warn(`Invalid experience level: ${this.preferences.experienceLevel}, using default`);
            this.preferences.experienceLevel = this.defaults.experienceLevel;
        }

        // Validate theme
        const validThemes = ['light', 'dark', 'system'];
        if (!validThemes.includes(this.preferences.theme)) {
            console.warn(`Invalid theme: ${this.preferences.theme}, using default`);
            this.preferences.theme = this.defaults.theme;
        }
    }

    /**
     * Get all preferences (for debugging)
     */
    getAll() {
        return { ...this.preferences };
    }

    /**
     * Get preferences summary
     */
    getSummary() {
        return {
            experienceLevel: this.get('experienceLevel'),
            theme: this.get('theme'),
            language: this.get('language'),
            highContrast: this.get('highContrast'),
            animations: this.get('animations'),
            autoSave: this.get('autoSave'),
            enableNotifications: this.get('enableNotifications'),
            favoriteGeneratorsCount: this.get('favoriteGenerators', []).length,
            recentFilesCount: this.get('recentFiles', []).length
        };
    }

    /**
     * Destroy the preferences system
     */
    async destroy() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        if (this.isDirty) {
            await this.save();
        }

        this.removeAllListeners();
        console.log('User preferences system destroyed');
    }
}

module.exports = UserPreferences;
