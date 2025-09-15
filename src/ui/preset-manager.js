/**
 * Preset Manager
 * Handles saving, loading, and managing parameter presets for generators
 */

const UserPreferences = require('../core/user-preferences');

class PresetManager {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.presets = new Map();
        this.categories = new Map();
        this.tags = new Set();
        this.currentGenerator = null;
        this.eventListeners = new Map();

        this.init();
    }

    /**
     * Initialize the preset manager
     */
    async init() {
        await this.preferences.init();
        this.loadPresets();
        this.setupEventListeners();

        console.log('Preset manager initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for generator changes
        document.addEventListener('generator-changed', (e) => {
            this.setCurrentGenerator(e.detail?.generatorId);
        });

        // Listen for parameter changes to track unsaved changes
        document.addEventListener('parameter-changed', (e) => {
            this.markAsModified();
        });
    }

    /**
     * Set current generator
     */
    setCurrentGenerator(generatorId) {
        this.currentGenerator = generatorId;
        this.emit('generator-changed', { generatorId });
    }

    /**
     * Save current parameters as a preset
     */
    async savePreset(name, options = {}) {
        if (!this.currentGenerator) {
            throw new Error('No generator selected');
        }

        const parameters = this.getCurrentParameters();
        if (!parameters || Object.keys(parameters).length === 0) {
            throw new Error('No parameters to save');
        }

        const preset = {
            id: this.generatePresetId(),
            name: name.trim(),
            generatorId: this.currentGenerator,
            parameters: { ...parameters },
            category: options.category || 'user',
            tags: options.tags || [],
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            usageCount: 0,
            rating: 0,
            isFavorite: false,
            description: options.description || '',
            thumbnail: options.thumbnail || null
        };

        // Validate preset
        this.validatePreset(preset);

        // Save to storage
        this.presets.set(preset.id, preset);

        // Add to category
        if (!this.categories.has(preset.category)) {
            this.categories.set(preset.category, []);
        }
        this.categories.get(preset.category).push(preset.id);

        // Add tags
        preset.tags.forEach(tag => this.tags.add(tag));

        // Save to preferences
        await this.savePresetsToStorage();

        this.emit('preset-saved', { preset });
        this.showNotification(`Preset "${name}" saved successfully`, 'success');

        return preset;
    }

    /**
     * Load a preset
     */
    async loadPreset(presetId) {
        const preset = this.presets.get(presetId);
        if (!preset) {
            throw new Error(`Preset '${presetId}' not found`);
        }

        // Check if generator matches
        if (preset.generatorId !== this.currentGenerator) {
            const confirmed = confirm(`This preset is for ${preset.generatorId}. Load it anyway?`);
            if (!confirmed) return;
        }

        // Apply parameters
        await this.applyPresetParameters(preset.parameters);

        // Update usage statistics
        preset.usageCount++;
        preset.lastUsedAt = new Date().toISOString();
        await this.savePresetsToStorage();

        this.emit('preset-loaded', { preset });
        this.showNotification(`Preset "${preset.name}" loaded`, 'info');

        return preset;
    }

    /**
     * Delete a preset
     */
    async deletePreset(presetId) {
        const preset = this.presets.get(presetId);
        if (!preset) {
            throw new Error(`Preset '${presetId}' not found`);
        }

        // Confirm deletion
        const confirmed = confirm(`Delete preset "${preset.name}"? This action cannot be undone.`);
        if (!confirmed) return;

        // Remove from storage
        this.presets.delete(presetId);

        // Remove from category
        const categoryPresets = this.categories.get(preset.category) || [];
        const index = categoryPresets.indexOf(presetId);
        if (index > -1) {
            categoryPresets.splice(index, 1);
        }

        // Clean up empty categories
        if (categoryPresets.length === 0) {
            this.categories.delete(preset.category);
        }

        // Save changes
        await this.savePresetsToStorage();

        this.emit('preset-deleted', { presetId, preset });
        this.showNotification(`Preset "${preset.name}" deleted`, 'info');
    }

    /**
     * Update a preset
     */
    async updatePreset(presetId, updates) {
        const preset = this.presets.get(presetId);
        if (!preset) {
            throw new Error(`Preset '${presetId}' not found`);
        }

        // Update preset
        Object.assign(preset, updates, {
            modifiedAt: new Date().toISOString()
        });

        // Handle category changes
        if (updates.category && updates.category !== preset.category) {
            // Remove from old category
            const oldCategoryPresets = this.categories.get(preset.category) || [];
            const index = oldCategoryPresets.indexOf(presetId);
            if (index > -1) {
                oldCategoryPresets.splice(index, 1);
            }

            // Add to new category
            if (!this.categories.has(updates.category)) {
                this.categories.set(updates.category, []);
            }
            this.categories.get(updates.category).push(presetId);
        }

        // Handle tag changes
        if (updates.tags) {
            updates.tags.forEach(tag => this.tags.add(tag));
        }

        // Validate updated preset
        this.validatePreset(preset);

        // Save changes
        await this.savePresetsToStorage();

        this.emit('preset-updated', { preset });
        this.showNotification(`Preset "${preset.name}" updated`, 'success');

        return preset;
    }

    /**
     * Get presets for current generator
     */
    getPresetsForCurrentGenerator() {
        if (!this.currentGenerator) return [];

        return Array.from(this.presets.values())
            .filter(preset => preset.generatorId === this.currentGenerator)
            .sort((a, b) => {
                // Sort by favorite, then by usage count, then by name
                if (a.isFavorite && !b.isFavorite) return -1;
                if (!a.isFavorite && b.isFavorite) return 1;
                if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
                return a.name.localeCompare(b.name);
            });
    }

    /**
     * Get presets by category
     */
    getPresetsByCategory(category) {
        const categoryPresetIds = this.categories.get(category) || [];
        return categoryPresetIds.map(id => this.presets.get(id)).filter(Boolean);
    }

    /**
     * Get presets by tags
     */
    getPresetsByTags(tags) {
        return Array.from(this.presets.values())
            .filter(preset => tags.some(tag => preset.tags.includes(tag)));
    }

    /**
     * Search presets
     */
    searchPresets(query, options = {}) {
        const { category, tags, generatorId } = options;

        return Array.from(this.presets.values())
            .filter(preset => {
                // Filter by generator if specified
                if (generatorId && preset.generatorId !== generatorId) return false;

                // Filter by category if specified
                if (category && preset.category !== category) return false;

                // Filter by tags if specified
                if (tags && tags.length > 0) {
                    if (!tags.some(tag => preset.tags.includes(tag))) return false;
                }

                // Search by query
                if (query) {
                    const searchTerm = query.toLowerCase();
                    return preset.name.toLowerCase().includes(searchTerm) ||
                           preset.description.toLowerCase().includes(searchTerm) ||
                           preset.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                }

                return true;
            })
            .sort((a, b) => {
                // Sort by relevance if searching
                if (query) {
                    const aScore = this.calculateSearchScore(a, query);
                    const bScore = this.calculateSearchScore(b, query);
                    return bScore - aScore;
                }

                // Default sort
                if (a.isFavorite && !b.isFavorite) return -1;
                if (!a.isFavorite && b.isFavorite) return 1;
                return b.usageCount - a.usageCount;
            });
    }

    /**
     * Calculate search relevance score
     */
    calculateSearchScore(preset, query) {
        const searchTerm = query.toLowerCase();
        let score = 0;

        // Name match (highest weight)
        if (preset.name.toLowerCase().includes(searchTerm)) {
            score += 10;
            if (preset.name.toLowerCase().startsWith(searchTerm)) score += 5;
        }

        // Description match
        if (preset.description.toLowerCase().includes(searchTerm)) {
            score += 3;
        }

        // Tag match
        preset.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm)) {
                score += 2;
            }
        });

        // Usage bonus
        score += Math.min(preset.usageCount, 5);

        // Favorite bonus
        if (preset.isFavorite) score += 3;

        return score;
    }

    /**
     * Toggle favorite status
     */
    async toggleFavorite(presetId) {
        const preset = this.presets.get(presetId);
        if (!preset) return;

        preset.isFavorite = !preset.isFavorite;
        await this.savePresetsToStorage();

        this.emit('preset-favorite-toggled', { presetId, isFavorite: preset.isFavorite });
    }

    /**
     * Rate a preset
     */
    async ratePreset(presetId, rating) {
        const preset = this.presets.get(presetId);
        if (!preset) return;

        preset.rating = Math.max(0, Math.min(5, rating));
        await this.savePresetsToStorage();

        this.emit('preset-rated', { presetId, rating: preset.rating });
    }

    /**
     * Export presets
     */
    exportPresets(presetIds = null) {
        const presetsToExport = presetIds
            ? presetIds.map(id => this.presets.get(id)).filter(Boolean)
            : Array.from(this.presets.values());

        const exportData = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            presets: presetsToExport,
            categories: Array.from(this.categories.entries()),
            tags: Array.from(this.tags)
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import presets
     */
    async importPresets(jsonData) {
        try {
            const importData = JSON.parse(jsonData);

            if (!importData.presets || !Array.isArray(importData.presets)) {
                throw new Error('Invalid preset data format');
            }

            let importedCount = 0;
            const conflicts = [];

            for (const preset of importData.presets) {
                // Generate new ID to avoid conflicts
                const originalId = preset.id;
                preset.id = this.generatePresetId();

                // Check for name conflicts
                const existingPreset = Array.from(this.presets.values())
                    .find(p => p.name === preset.name && p.generatorId === preset.generatorId);

                if (existingPreset) {
                    conflicts.push({
                        imported: preset,
                        existing: existingPreset,
                        originalId
                    });
                    continue;
                }

                // Validate and add preset
                this.validatePreset(preset);
                this.presets.set(preset.id, preset);

                // Add to category
                if (!this.categories.has(preset.category)) {
                    this.categories.set(preset.category, []);
                }
                this.categories.get(preset.category).push(preset.id);

                // Add tags
                preset.tags.forEach(tag => this.tags.add(tag));

                importedCount++;
            }

            await this.savePresetsToStorage();

            this.emit('presets-imported', { importedCount, conflicts });

            if (conflicts.length > 0) {
                this.showNotification(`${importedCount} presets imported. ${conflicts.length} conflicts found.`, 'warning');
            } else {
                this.showNotification(`${importedCount} presets imported successfully`, 'success');
            }

            return { importedCount, conflicts };
        } catch (error) {
            console.error('Failed to import presets:', error);
            this.showNotification('Failed to import presets', 'error');
            throw error;
        }
    }

    /**
     * Create preset from randomization
     */
    async createRandomizedPreset(basePresetId, intensity = 0.3) {
        const basePreset = this.presets.get(basePresetId);
        if (!basePreset) {
            throw new Error(`Base preset '${basePresetId}' not found`);
        }

        const randomizedParams = this.randomizeParameters(basePreset.parameters, intensity);

        const randomPreset = await this.savePreset(
            `${basePreset.name} (Random ${Math.round(intensity * 100)}%)`,
            {
                category: 'randomized',
                tags: [...basePreset.tags, 'randomized'],
                description: `Randomized version of "${basePreset.name}" with ${Math.round(intensity * 100)}% variation`
            }
        );

        // Apply the randomized parameters
        await this.applyPresetParameters(randomizedParams);

        return randomPreset;
    }

    /**
     * Randomize parameters
     */
    randomizeParameters(parameters, intensity) {
        const randomized = {};

        for (const [key, value] of Object.entries(parameters)) {
            if (typeof value === 'number') {
                // Randomize numeric values
                const variation = value * intensity;
                const min = Math.max(0, value - variation);
                const max = value + variation;
                randomized[key] = min + Math.random() * (max - min);
            } else if (typeof value === 'boolean') {
                // Randomly flip boolean values
                randomized[key] = Math.random() < intensity ? !value : value;
            } else if (Array.isArray(value)) {
                // For arrays, keep original (could be enhanced to randomize selections)
                randomized[key] = [...value];
            } else {
                // Keep other types as-is
                randomized[key] = value;
            }
        }

        return randomized;
    }

    /**
     * Get preset statistics
     */
    getStatistics() {
        const total = this.presets.size;
        const categories = this.categories.size;
        const tags = this.tags.size;
        const favorites = Array.from(this.presets.values()).filter(p => p.isFavorite).length;
        const totalUsage = Array.from(this.presets.values()).reduce((sum, p) => sum + p.usageCount, 0);

        return {
            total,
            categories,
            tags,
            favorites,
            totalUsage,
            averageRating: total > 0
                ? Array.from(this.presets.values()).reduce((sum, p) => sum + p.rating, 0) / total
                : 0
        };
    }

    /**
     * Get current parameters from UI
     */
    getCurrentParameters() {
        // This would integrate with the actual UI to get current parameter values
        // For now, return a mock implementation
        const parameters = {};

        // Get all parameter inputs
        const inputs = document.querySelectorAll('[data-parameter]');
        inputs.forEach(input => {
            const paramName = input.dataset.parameter;
            let value;

            if (input.type === 'checkbox') {
                value = input.checked;
            } else if (input.type === 'range' || input.type === 'number') {
                value = parseFloat(input.value);
            } else if (input.type === 'color') {
                value = input.value;
            } else {
                value = input.value;
            }

            if (paramName && value !== undefined) {
                parameters[paramName] = value;
            }
        });

        return parameters;
    }

    /**
     * Apply preset parameters to UI
     */
    async applyPresetParameters(parameters) {
        // Apply parameters to UI elements
        for (const [paramName, value] of Object.entries(parameters)) {
            const input = document.querySelector(`[data-parameter="${paramName}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else {
                    input.value = value;
                }

                // Trigger change event
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // Emit event for other components
        this.emit('parameters-applied', { parameters });
    }

    /**
     * Generate unique preset ID
     */
    generatePresetId() {
        return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validate preset
     */
    validatePreset(preset) {
        if (!preset.name || preset.name.trim().length === 0) {
            throw new Error('Preset name is required');
        }

        if (!preset.generatorId) {
            throw new Error('Generator ID is required');
        }

        if (!preset.parameters || typeof preset.parameters !== 'object') {
            throw new Error('Parameters must be an object');
        }

        if (preset.name.length > 100) {
            throw new Error('Preset name must be less than 100 characters');
        }

        if (preset.description && preset.description.length > 500) {
            throw new Error('Description must be less than 500 characters');
        }
    }

    /**
     * Load presets from storage
     */
    loadPresets() {
        const savedPresets = this.preferences.get('presets', []);
        const savedCategories = this.preferences.get('presetCategories', []);
        const savedTags = this.preferences.get('presetTags', []);

        // Load presets
        savedPresets.forEach(preset => {
            this.presets.set(preset.id, preset);
        });

        // Load categories
        savedCategories.forEach(([category, presetIds]) => {
            this.categories.set(category, presetIds);
        });

        // Load tags
        savedTags.forEach(tag => {
            this.tags.add(tag);
        });
    }

    /**
     * Save presets to storage
     */
    async savePresetsToStorage() {
        const presetsArray = Array.from(this.presets.values());
        const categoriesArray = Array.from(this.categories.entries());
        const tagsArray = Array.from(this.tags);

        await this.preferences.set('presets', presetsArray);
        await this.preferences.set('presetCategories', categoriesArray);
        await this.preferences.set('presetTags', tagsArray);
    }

    /**
     * Mark current state as modified
     */
    markAsModified() {
        this.emit('parameters-modified', {
            generatorId: this.currentGenerator,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
            border-radius: 4px;
            z-index: 10001;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Emit event
     */
    emit(eventType, data) {
        const event = new CustomEvent(`preset-manager-${eventType}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the preset manager
     */
    destroy() {
        this.presets.clear();
        this.categories.clear();
        this.tags.clear();
        this.eventListeners.clear();

        console.log('Preset manager destroyed');
    }
}

module.exports = PresetManager;
