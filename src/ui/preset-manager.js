/**
 * TPT Preset Manager
 * Manages generation presets, templates, and user configurations
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PresetManager {
    constructor() {
        this.presets = {};
        this.templates = {};
        this.userPresets = {};
        this.communityPresets = {};
        this.presetCategories = {};
    }

    /**
     * Initialize preset manager
     */
    async initialize() {
        await this.loadPresets();
        await this.loadTemplates();
        await this.loadUserPresets();
        await this.initializeDefaultPresets();
    }

    /**
     * Load built-in presets
     */
    async loadPresets() {
        try {
            const presetsPath = path.join(process.cwd(), 'src/presets');
            const presetFiles = await fs.readdir(presetsPath);

            for (const file of presetFiles) {
                if (file.endsWith('.json')) {
                    const presetData = await fs.readFile(path.join(presetsPath, file), 'utf8');
                    const preset = JSON.parse(presetData);
                    this.presets[preset.id] = preset;
                }
            }
        } catch (error) {
            console.error('Failed to load presets:', error);
        }
    }

    /**
     * Load project templates
     */
    async loadTemplates() {
        try {
            const templatesPath = path.join(process.cwd(), 'src/templates');
            const templateFiles = await fs.readdir(templatesPath);

            for (const file of templateFiles) {
                if (file.endsWith('.json')) {
                    const templateData = await fs.readFile(path.join(templatesPath, file), 'utf8');
                    const template = JSON.parse(templateData);
                    this.templates[template.id] = template;
                }
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    }

    /**
     * Load user-created presets
     */
    async loadUserPresets() {
        try {
            const userPresetsPath = path.join(process.cwd(), 'user-presets.json');
            const userPresetsData = await fs.readFile(userPresetsPath, 'utf8');
            this.userPresets = JSON.parse(userPresetsData);
        } catch (error) {
            // Initialize empty user presets
            this.userPresets = {};
        }
    }

    /**
     * Save user presets
     */
    async saveUserPresets() {
        try {
            const userPresetsPath = path.join(process.cwd(), 'user-presets.json');
            await fs.writeFile(userPresetsPath, JSON.stringify(this.userPresets, null, 2));
        } catch (error) {
            console.error('Failed to save user presets:', error);
        }
    }

    /**
     * Initialize default presets for common use cases
     */
    async initializeDefaultPresets() {
        const defaultPresets = {
            // Character presets
            'warrior-basic': {
                id: 'warrior-basic',
                name: 'Basic Warrior',
                category: 'character',
                generator: 'character-generator',
                parameters: {
                    characterClass: 'warrior',
                    level: 1,
                    style: 'pixel',
                    theme: 'medieval',
                    equipment: ['sword', 'shield']
                },
                tags: ['warrior', 'basic', 'medieval'],
                created: new Date().toISOString(),
                usage: 0
            },

            'mage-powerful': {
                id: 'mage-powerful',
                name: 'Powerful Mage',
                category: 'character',
                generator: 'character-generator',
                parameters: {
                    characterClass: 'mage',
                    level: 10,
                    style: 'pixel',
                    theme: 'fantasy',
                    equipment: ['staff', 'robe']
                },
                tags: ['mage', 'powerful', 'fantasy'],
                created: new Date().toISOString(),
                usage: 0
            },

            // Environment presets
            'forest-clearing': {
                id: 'forest-clearing',
                name: 'Forest Clearing',
                category: 'environment',
                generator: 'level-generator',
                parameters: {
                    levelType: 'forest',
                    width: 32,
                    height: 24,
                    theme: 'natural',
                    difficulty: 'normal'
                },
                tags: ['forest', 'nature', 'outdoor'],
                created: new Date().toISOString(),
                usage: 0
            },

            'dungeon-crypt': {
                id: 'dungeon-crypt',
                name: 'Ancient Crypt',
                category: 'environment',
                generator: 'level-generator',
                parameters: {
                    levelType: 'dungeon',
                    width: 40,
                    height: 30,
                    theme: 'dark',
                    difficulty: 'hard'
                },
                tags: ['dungeon', 'crypt', 'underground'],
                created: new Date().toISOString(),
                usage: 0
            },

            // Item presets
            'sword-legendary': {
                id: 'sword-legendary',
                name: 'Legendary Sword',
                category: 'item',
                generator: 'weapon-generator',
                parameters: {
                    weaponType: 'sword',
                    material: 'mithril',
                    enchantment: 'fire_damage',
                    quality: 'legendary'
                },
                tags: ['sword', 'legendary', 'enchanted'],
                created: new Date().toISOString(),
                usage: 0
            },

            // Pixel art presets
            'pixel-landscape': {
                id: 'pixel-landscape',
                name: 'Pixel Landscape',
                category: 'pixel-art',
                generator: 'pixel-art-generator',
                parameters: {
                    artType: 'landscape',
                    width: 256,
                    height: 192,
                    style: 'pixel',
                    theme: 'natural'
                },
                tags: ['landscape', 'pixel', 'nature'],
                created: new Date().toISOString(),
                usage: 0
            }
        };

        // Add default presets if they don't exist
        for (const [presetId, preset] of Object.entries(defaultPresets)) {
            if (!this.userPresets[presetId]) {
                this.userPresets[presetId] = preset;
            }
        }

        await this.saveUserPresets();
    }

    /**
     * Create a new preset
     */
    async createPreset(name, category, generator, parameters, tags = []) {
        const preset = {
            id: uuidv4(),
            name: name,
            category: category,
            generator: generator,
            parameters: parameters,
            tags: tags,
            created: new Date().toISOString(),
            usage: 0,
            isUserCreated: true
        };

        this.userPresets[preset.id] = preset;
        await this.saveUserPresets();

        return preset;
    }

    /**
     * Update existing preset
     */
    async updatePreset(presetId, updates) {
        if (!this.userPresets[presetId]) {
            throw new Error('Preset not found');
        }

        this.userPresets[presetId] = {
            ...this.userPresets[presetId],
            ...updates,
            modified: new Date().toISOString()
        };

        await this.saveUserPresets();
        return this.userPresets[presetId];
    }

    /**
     * Delete preset
     */
    async deletePreset(presetId) {
        if (!this.userPresets[presetId]) {
            throw new Error('Preset not found');
        }

        delete this.userPresets[presetId];
        await this.saveUserPresets();
        return true;
    }

    /**
     * Get preset by ID
     */
    getPreset(presetId) {
        return this.userPresets[presetId] || this.presets[presetId];
    }

    /**
     * Get presets by category
     */
    getPresetsByCategory(category) {
        const allPresets = { ...this.presets, ...this.userPresets };
        return Object.values(allPresets).filter(preset => preset.category === category);
    }

    /**
     * Get presets by generator
     */
    getPresetsByGenerator(generator) {
        const allPresets = { ...this.presets, ...this.userPresets };
        return Object.values(allPresets).filter(preset => preset.generator === generator);
    }

    /**
     * Search presets by name or tags
     */
    searchPresets(query) {
        const allPresets = { ...this.presets, ...this.userPresets };
        const lowerQuery = query.toLowerCase();

        return Object.values(allPresets).filter(preset => {
            return preset.name.toLowerCase().includes(lowerQuery) ||
                   preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        });
    }

    /**
     * Get popular presets
     */
    getPopularPresets(limit = 10) {
        const allPresets = { ...this.presets, ...this.userPresets };
        return Object.values(allPresets)
            .sort((a, b) => b.usage - a.usage)
            .slice(0, limit);
    }

    /**
     * Increment preset usage
     */
    async incrementPresetUsage(presetId) {
        const preset = this.userPresets[presetId] || this.presets[presetId];
        if (preset) {
            preset.usage = (preset.usage || 0) + 1;
            if (this.userPresets[presetId]) {
                await this.saveUserPresets();
            }
        }
    }

    /**
     * Export preset
     */
    exportPreset(presetId) {
        const preset = this.getPreset(presetId);
        if (!preset) {
            throw new Error('Preset not found');
        }

        return JSON.stringify(preset, null, 2);
    }

    /**
     * Import preset
     */
    async importPreset(presetJson) {
        try {
            const preset = JSON.parse(presetJson);

            // Validate preset structure
            if (!preset.id || !preset.name || !preset.category) {
                throw new Error('Invalid preset format');
            }

            // Generate new ID to avoid conflicts
            preset.id = uuidv4();
            preset.imported = new Date().toISOString();
            preset.isImported = true;

            this.userPresets[preset.id] = preset;
            await this.saveUserPresets();

            return preset;
        } catch (error) {
            throw new Error('Failed to import preset: ' + error.message);
        }
    }

    /**
     * Create project template
     */
    async createTemplate(name, description, presetIds, settings = {}) {
        const template = {
            id: uuidv4(),
            name: name,
            description: description,
            presetIds: presetIds,
            settings: settings,
            created: new Date().toISOString(),
            usage: 0,
            isUserCreated: true
        };

        this.templates[template.id] = template;
        await this.saveTemplates();

        return template;
    }

    /**
     * Get template by ID
     */
    getTemplate(templateId) {
        return this.templates[templateId];
    }

    /**
     * Get all templates
     */
    getAllTemplates() {
        return Object.values(this.templates);
    }

    /**
     * Apply template to project
     */
    async applyTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        const appliedPresets = [];
        for (const presetId of template.presetIds) {
            const preset = this.getPreset(presetId);
            if (preset) {
                appliedPresets.push(preset);
                await this.incrementPresetUsage(presetId);
            }
        }

        // Increment template usage
        template.usage = (template.usage || 0) + 1;
        await this.saveTemplates();

        return {
            template: template,
            appliedPresets: appliedPresets
        };
    }

    /**
     * Save templates
     */
    async saveTemplates() {
        try {
            const templatesPath = path.join(process.cwd(), 'user-templates.json');
            await fs.writeFile(templatesPath, JSON.stringify(this.templates, null, 2));
        } catch (error) {
            console.error('Failed to save templates:', error);
        }
    }

    /**
     * Load templates
     */
    async loadTemplates() {
        try {
            const templatesPath = path.join(process.cwd(), 'user-templates.json');
            const templatesData = await fs.readFile(templatesPath, 'utf8');
            const loadedTemplates = JSON.parse(templatesData);

            // Merge with built-in templates
            this.templates = { ...this.templates, ...loadedTemplates };
        } catch (error) {
            // Use built-in templates only
        }
    }

    /**
     * Get preset categories
     */
    getPresetCategories() {
        const allPresets = { ...this.presets, ...this.userPresets };
        const categories = {};

        Object.values(allPresets).forEach(preset => {
            if (!categories[preset.category]) {
                categories[preset.category] = [];
            }
            categories[preset.category].push(preset);
        });

        return categories;
    }

    /**
     * Get preset statistics
     */
    getPresetStatistics() {
        const allPresets = { ...this.presets, ...this.userPresets };
        const stats = {
            total: Object.keys(allPresets).length,
            byCategory: {},
            byGenerator: {},
            mostUsed: null,
            recentlyCreated: null
        };

        let maxUsage = 0;
        let mostRecent = null;

        Object.values(allPresets).forEach(preset => {
            // Category stats
            stats.byCategory[preset.category] = (stats.byCategory[preset.category] || 0) + 1;

            // Generator stats
            stats.byGenerator[preset.generator] = (stats.byGenerator[preset.generator] || 0) + 1;

            // Most used
            if (preset.usage > maxUsage) {
                maxUsage = preset.usage;
                stats.mostUsed = preset;
            }

            // Most recent
            const created = new Date(preset.created);
            if (!mostRecent || created > mostRecent) {
                mostRecent = created;
                stats.recentlyCreated = preset;
            }
        });

        return stats;
    }

    /**
     * Clean up unused presets
     */
    async cleanupUnusedPresets(threshold = 0) {
        const presetsToDelete = [];

        Object.entries(this.userPresets).forEach(([id, preset]) => {
            if ((preset.usage || 0) <= threshold && preset.isUserCreated) {
                presetsToDelete.push(id);
            }
        });

        presetsToDelete.forEach(id => {
            delete this.userPresets[id];
        });

        if (presetsToDelete.length > 0) {
            await this.saveUserPresets();
        }

        return presetsToDelete.length;
    }

    /**
     * Backup all presets and templates
     */
    async createBackup() {
        const backup = {
            presets: this.userPresets,
            templates: this.templates,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const backupPath = path.join(process.cwd(), `preset-backup-${Date.now()}.json`);
        await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));

        return backupPath;
    }

    /**
     * Restore from backup
     */
    async restoreFromBackup(backupPath) {
        try {
            const backupData = await fs.readFile(backupPath, 'utf8');
            const backup = JSON.parse(backupData);

            this.userPresets = { ...this.userPresets, ...backup.presets };
            this.templates = { ...this.templates, ...backup.templates };

            await this.saveUserPresets();
            await this.saveTemplates();

            return true;
        } catch (error) {
            throw new Error('Failed to restore from backup: ' + error.message);
        }
    }
}

module.exports = PresetManager;
