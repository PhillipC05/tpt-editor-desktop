/**
 * TPT Asset Editor Desktop - Database Manager
 * Handles all database operations and data persistence
 */

const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');

class DatabaseManager {
    constructor() {
        this.dbPath = null;
        this.data = {
            assets: [],
            settings: new Map(),
            projects: [],
            presets: [],
            templates: [],
            history: [],
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        };
        this.isInitialized = false;
    }

    /**
     * Initialize the database
     */
    async initialize() {
        try {
            // Set up database path
            await this.setupDatabasePath();

            // Load existing data
            await this.loadDatabase();

            // Set up auto-save
            this.setupAutoSave();

            this.isInitialized = true;
            console.log('Database initialized successfully');

        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    /**
     * Set up database file path
     */
    async setupDatabasePath() {
        const userDataPath = app.getPath('userData');
        const dbDir = path.join(userDataPath, 'database');

        // Ensure database directory exists
        await fs.mkdir(dbDir, { recursive: true });

        this.dbPath = path.join(dbDir, 'tpt-assets.db.json');
        console.log('Database path:', this.dbPath);
    }

    /**
     * Load database from file
     */
    async loadDatabase() {
        try {
            // Check if database file exists
            await fs.access(this.dbPath);

            // Read and parse database file
            const content = await fs.readFile(this.dbPath, 'utf8');
            const loadedData = JSON.parse(content);

            // Merge loaded data with default structure
            this.data = {
                ...this.data,
                ...loadedData,
                settings: new Map(Object.entries(loadedData.settings || {}))
            };

            console.log(`Loaded database with ${this.data.assets.length} assets`);

        } catch (error) {
            if (error.code === 'ENOENT') {
                // Database file doesn't exist, create new one
                console.log('Database file not found, creating new database');
                await this.saveDatabase();
            } else {
                console.error('Error loading database:', error);
                throw error;
            }
        }
    }

    /**
     * Save database to file
     */
    async saveDatabase() {
        try {
            // Update last modified timestamp
            this.data.metadata.lastModified = new Date().toISOString();

            // Convert settings Map to object for serialization
            const dataToSave = {
                ...this.data,
                settings: Object.fromEntries(this.data.settings)
            };

            // Write to file
            const content = JSON.stringify(dataToSave, null, 2);
            await fs.writeFile(this.dbPath, content, 'utf8');

            console.log('Database saved successfully');

        } catch (error) {
            console.error('Error saving database:', error);
            throw error;
        }
    }

    /**
     * Set up auto-save functionality
     */
    setupAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(async () => {
            try {
                await this.saveDatabase();
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }, 30000);

        // Save on process exit
        process.on('exit', async () => {
            try {
                await this.saveDatabase();
            } catch (error) {
                console.error('Exit save failed:', error);
            }
        });

        // Save on app quit
        app.on('before-quit', async () => {
            try {
                await this.saveDatabase();
            } catch (error) {
                console.error('Quit save failed:', error);
            }
        });
    }

    /**
     * Get all assets with optional filtering
     */
    async getAssets(query = {}) {
        let assets = [...this.data.assets];

        // Apply filters
        if (query.type) {
            assets = assets.filter(asset => asset.type === query.type);
        }

        if (query.category) {
            assets = assets.filter(asset => asset.category === query.category);
        }

        if (query.search) {
            const searchTerm = query.search.toLowerCase();
            assets = assets.filter(asset =>
                asset.name.toLowerCase().includes(searchTerm) ||
                asset.type.toLowerCase().includes(searchTerm) ||
                (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        if (query.limit) {
            assets = assets.slice(0, query.limit);
        }

        if (query.sortBy) {
            assets.sort((a, b) => {
                const aVal = a[query.sortBy];
                const bVal = b[query.sortBy];

                if (query.sortOrder === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
        } else {
            // Default sort by creation date (newest first)
            assets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return assets;
    }

    /**
     * Get asset by ID
     */
    async getAssetById(assetId) {
        return this.data.assets.find(asset => asset.id === assetId) || null;
    }

    /**
     * Save asset to database
     */
    async saveAsset(asset) {
        try {
            // Generate ID if not provided
            if (!asset.id) {
                asset.id = this.generateId();
            }

            // Set timestamps
            const now = new Date().toISOString();
            if (!asset.created_at) {
                asset.created_at = now;
            }
            asset.updated_at = now;

            // Check if asset already exists
            const existingIndex = this.data.assets.findIndex(a => a.id === asset.id);

            if (existingIndex >= 0) {
                // Update existing asset
                this.data.assets[existingIndex] = { ...this.data.assets[existingIndex], ...asset };
            } else {
                // Add new asset
                this.data.assets.push(asset);
            }

            // Save to disk
            await this.saveDatabase();

            console.log(`Asset saved: ${asset.name} (${asset.id})`);
            return asset.id;

        } catch (error) {
            console.error('Error saving asset:', error);
            throw error;
        }
    }

    /**
     * Delete asset from database
     */
    async deleteAsset(assetId) {
        try {
            const index = this.data.assets.findIndex(asset => asset.id === assetId);

            if (index >= 0) {
                const deletedAsset = this.data.assets.splice(index, 1)[0];

                // Save to disk
                await this.saveDatabase();

                console.log(`Asset deleted: ${deletedAsset.name} (${assetId})`);
                return true;
            }

            return false;

        } catch (error) {
            console.error('Error deleting asset:', error);
            throw error;
        }
    }

    /**
     * Update asset in database
     */
    async updateAsset(assetId, updates) {
        try {
            const asset = await this.getAssetById(assetId);

            if (!asset) {
                throw new Error(`Asset not found: ${assetId}`);
            }

            // Apply updates
            Object.assign(asset, updates);
            asset.updated_at = new Date().toISOString();

            // Save to disk
            await this.saveDatabase();

            console.log(`Asset updated: ${asset.name} (${assetId})`);
            return asset;

        } catch (error) {
            console.error('Error updating asset:', error);
            throw error;
        }
    }

    /**
     * Get setting value
     */
    async getSetting(key) {
        return this.data.settings.get(key);
    }

    /**
     * Save setting value
     */
    async saveSetting(key, value) {
        try {
            this.data.settings.set(key, value);

            // Save to disk
            await this.saveDatabase();

            console.log(`Setting saved: ${key} = ${value}`);
            return true;

        } catch (error) {
            console.error('Error saving setting:', error);
            throw error;
        }
    }

    /**
     * Get all settings
     */
    async getAllSettings() {
        return Object.fromEntries(this.data.settings);
    }

    /**
     * Get all projects
     */
    async getProjects() {
        return [...this.data.projects];
    }

    /**
     * Save project
     */
    async saveProject(project) {
        try {
            if (!project.id) {
                project.id = this.generateId();
            }

            const now = new Date().toISOString();
            if (!project.created_at) {
                project.created_at = now;
            }
            project.updated_at = now;

            const existingIndex = this.data.projects.findIndex(p => p.id === project.id);

            if (existingIndex >= 0) {
                this.data.projects[existingIndex] = { ...this.data.projects[existingIndex], ...project };
            } else {
                this.data.projects.push(project);
            }

            await this.saveDatabase();

            console.log(`Project saved: ${project.name} (${project.id})`);
            return project.id;

        } catch (error) {
            console.error('Error saving project:', error);
            throw error;
        }
    }

    /**
     * Delete project
     */
    async deleteProject(projectId) {
        try {
            const index = this.data.projects.findIndex(project => project.id === projectId);

            if (index >= 0) {
                const deletedProject = this.data.projects.splice(index, 1)[0];
                await this.saveDatabase();

                console.log(`Project deleted: ${deletedProject.name} (${projectId})`);
                return true;
            }

            return false;

        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    /**
     * Get all presets
     */
    async getPresets(assetType = null) {
        let presets = [...this.data.presets];

        if (assetType) {
            presets = presets.filter(preset => preset.assetType === assetType);
        }

        return presets;
    }

    /**
     * Save preset
     */
    async savePreset(preset) {
        try {
            if (!preset.id) {
                preset.id = this.generateId();
            }

            const now = new Date().toISOString();
            if (!preset.created_at) {
                preset.created_at = now;
            }
            preset.updated_at = now;

            const existingIndex = this.data.presets.findIndex(p => p.id === preset.id);

            if (existingIndex >= 0) {
                this.data.presets[existingIndex] = { ...this.data.presets[existingIndex], ...preset };
            } else {
                this.data.presets.push(preset);
            }

            await this.saveDatabase();

            console.log(`Preset saved: ${preset.name} (${preset.id})`);
            return preset.id;

        } catch (error) {
            console.error('Error saving preset:', error);
            throw error;
        }
    }

    /**
     * Delete preset
     */
    async deletePreset(presetId) {
        try {
            const index = this.data.presets.findIndex(preset => preset.id === presetId);

            if (index >= 0) {
                const deletedPreset = this.data.presets.splice(index, 1)[0];
                await this.saveDatabase();

                console.log(`Preset deleted: ${deletedPreset.name} (${presetId})`);
                return true;
            }

            return false;

        } catch (error) {
            console.error('Error deleting preset:', error);
            throw error;
        }
    }

    /**
     * Get preset by ID
     */
    async getPresetById(presetId) {
        return this.data.presets.find(preset => preset.id === presetId) || null;
    }

    /**
     * Get all templates
     */
    async getTemplates(assetType = null) {
        let templates = [...this.data.templates];

        if (assetType) {
            templates = templates.filter(template => template.assetType === assetType);
        }

        return templates;
    }

    /**
     * Save template
     */
    async saveTemplate(template) {
        try {
            if (!template.id) {
                template.id = this.generateId();
            }

            const now = new Date().toISOString();
            if (!template.created_at) {
                template.created_at = now;
            }
            template.updated_at = now;

            const existingIndex = this.data.templates.findIndex(t => t.id === template.id);

            if (existingIndex >= 0) {
                this.data.templates[existingIndex] = { ...this.data.templates[existingIndex], ...template };
            } else {
                this.data.templates.push(template);
            }

            await this.saveDatabase();

            console.log(`Template saved: ${template.name} (${template.id})`);
            return template.id;

        } catch (error) {
            console.error('Error saving template:', error);
            throw error;
        }
    }

    /**
     * Delete template
     */
    async deleteTemplate(templateId) {
        try {
            const index = this.data.templates.findIndex(template => template.id === templateId);

            if (index >= 0) {
                const deletedTemplate = this.data.templates.splice(index, 1)[0];
                await this.saveDatabase();

                console.log(`Template deleted: ${deletedTemplate.name} (${templateId})`);
                return true;
            }

            return false;

        } catch (error) {
            console.error('Error deleting template:', error);
            throw error;
        }
    }

    /**
     * Get template by ID
     */
    async getTemplateById(templateId) {
        return this.data.templates.find(template => template.id === templateId) || null;
    }

    /**
     * Increment template usage count
     */
    async incrementTemplateUsage(templateId) {
        try {
            const template = await this.getTemplateById(templateId);
            if (template) {
                template.usageCount = (template.usageCount || 0) + 1;
                await this.saveDatabase();
            }
        } catch (error) {
            console.error('Error incrementing template usage:', error);
        }
    }

    /**
     * Get recommended templates
     */
    async getRecommendedTemplates(assetType) {
        try {
            const templates = await this.getTemplates(assetType);

            // Sort by usage count and return top recommendations
            return templates
                .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
                .slice(0, 5);

        } catch (error) {
            console.error('Error getting recommended templates:', error);
            return [];
        }
    }

    /**
     * Get templates by category
     */
    async getTemplatesByCategory(category) {
        return this.data.templates.filter(template => template.category === category);
    }

    /**
     * Get all templates (for management)
     */
    async getAllTemplates() {
        return [...this.data.templates];
    }

    /**
     * Add operation to history
     */
    async addToHistory(operation) {
        try {
            operation.id = this.generateId();
            operation.timestamp = new Date().toISOString();

            this.data.history.unshift(operation);

            // Keep only last 1000 operations
            if (this.data.history.length > 1000) {
                this.data.history = this.data.history.slice(0, 1000);
            }

            await this.saveDatabase();

        } catch (error) {
            console.error('Error adding to history:', error);
        }
    }

    /**
     * Get operation history
     */
    async getHistory(limit = 100) {
        return this.data.history.slice(0, limit);
    }

    /**
     * Clear operation history
     */
    async clearHistory() {
        this.data.history = [];
        await this.saveDatabase();
        console.log('Operation history cleared');
    }

    /**
     * Get database statistics
     */
    async getStats() {
        return {
            assets: {
                total: this.data.assets.length,
                byType: this.getAssetCountByType(),
                byCategory: this.getAssetCountByCategory()
            },
            projects: {
                total: this.data.projects.length
            },
            presets: {
                total: this.data.presets.length
            },
            templates: {
                total: this.data.templates.length
            },
            history: {
                total: this.data.history.length
            },
            metadata: { ...this.data.metadata }
        };
    }

    /**
     * Get asset count by type
     */
    getAssetCountByType() {
        const counts = {};
        this.data.assets.forEach(asset => {
            counts[asset.type] = (counts[asset.type] || 0) + 1;
        });
        return counts;
    }

    /**
     * Get asset count by category
     */
    getAssetCountByCategory() {
        const counts = {};
        this.data.assets.forEach(asset => {
            const category = asset.category || 'uncategorized';
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Export database to file
     */
    async exportDatabase(exportPath) {
        try {
            const exportData = {
                ...this.data,
                settings: Object.fromEntries(this.data.settings),
                exported_at: new Date().toISOString(),
                version: this.data.metadata.version
            };

            const content = JSON.stringify(exportData, null, 2);
            await fs.writeFile(exportPath, content, 'utf8');

            console.log(`Database exported to: ${exportPath}`);
            return true;

        } catch (error) {
            console.error('Error exporting database:', error);
            throw error;
        }
    }

    /**
     * Import database from file
     */
    async importDatabase(importPath) {
        try {
            const content = await fs.readFile(importPath, 'utf8');
            const importData = JSON.parse(content);

            // Validate import data
            if (!importData.assets || !Array.isArray(importData.assets)) {
                throw new Error('Invalid database format');
            }

            // Merge imported data
            this.data.assets = [...this.data.assets, ...importData.assets];
            this.data.projects = [...this.data.projects, ...(importData.projects || [])];
            this.data.presets = [...this.data.presets, ...(importData.presets || [])];
            this.data.templates = [...this.data.templates, ...(importData.templates || [])];

            // Handle settings
            if (importData.settings) {
                const importedSettings = typeof importData.settings === 'object' ?
                    importData.settings : JSON.parse(importData.settings);

                for (const [key, value] of Object.entries(importedSettings)) {
                    this.data.settings.set(key, value);
                }
            }

            await this.saveDatabase();

            console.log(`Database imported from: ${importPath}`);
            return {
                assetsImported: importData.assets.length,
                projectsImported: (importData.projects || []).length,
                presetsImported: (importData.presets || []).length,
                templatesImported: (importData.templates || []).length
            };

        } catch (error) {
            console.error('Error importing database:', error);
            throw error;
        }
    }

    /**
     * Backup database
     */
    async createBackup() {
        try {
            const backupDir = path.dirname(this.dbPath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(backupDir, `tpt-assets-backup-${timestamp}.db.json`);

            await this.exportDatabase(backupPath);

            console.log(`Database backup created: ${backupPath}`);
            return backupPath;

        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }

    /**
     * Clean up resources
     */
    async close() {
        console.log('Closing database manager...');

        // Clear auto-save interval
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Final save
        try {
            await this.saveDatabase();
        } catch (error) {
            console.error('Error during final save:', error);
        }
    }

    /**
     * Get database file path
     */
    getDatabasePath() {
        return this.dbPath;
    }

    /**
     * Check database integrity
     */
    async checkIntegrity() {
        try {
            // Basic integrity checks
            const issues = [];

            // Check for assets without IDs
            const assetsWithoutIds = this.data.assets.filter(asset => !asset.id);
            if (assetsWithoutIds.length > 0) {
                issues.push(`${assetsWithoutIds.length} assets without IDs`);
            }

            // Check for duplicate IDs
            const assetIds = this.data.assets.map(asset => asset.id);
            const uniqueIds = new Set(assetIds);
            if (assetIds.length !== uniqueIds.size) {
                issues.push('Duplicate asset IDs found');
            }

            // Check for assets without required fields
            const assetsWithoutName = this.data.assets.filter(asset => !asset.name);
            if (assetsWithoutName.length > 0) {
                issues.push(`${assetsWithoutName.length} assets without names`);
            }

            return {
                valid: issues.length === 0,
                issues: issues
            };

        } catch (error) {
            console.error('Error checking database integrity:', error);
            return {
                valid: false,
                issues: ['Integrity check failed']
            };
        }
    }

    /**
     * Repair database
     */
    async repairDatabase() {
        try {
            console.log('Starting database repair...');

            let repaired = 0;

            // Fix assets without IDs
            this.data.assets.forEach(asset => {
                if (!asset.id) {
                    asset.id = this.generateId();
                    repaired++;
                }
            });

            // Fix assets without names
            this.data.assets.forEach(asset => {
                if (!asset.name) {
                    asset.name = `Asset ${asset.id}`;
                    repaired++;
                }
            });

            // Remove assets with duplicate IDs
            const seenIds = new Set();
            this.data.assets = this.data.assets.filter(asset => {
                if (seenIds.has(asset.id)) {
                    repaired++;
                    return false;
                }
                seenIds.add(asset.id);
                return true;
            });

            if (repaired > 0) {
                await this.saveDatabase();
                console.log(`Database repaired: ${repaired} issues fixed`);
            }

            return { repaired };

        } catch (error) {
            console.error('Error repairing database:', error);
            throw error;
        }
    }
}

module.exports = DatabaseManager;
