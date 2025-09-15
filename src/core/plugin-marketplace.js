/**
 * Plugin Marketplace
 * Complete ecosystem for plugin discovery, installation, ratings, and updates
 */

const UserPreferences = require('./user-preferences');
const PluginSystem = require('./plugin-system');
const PluginSecurity = require('./plugin-security');

class PluginMarketplace {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.pluginSystem = options.pluginSystem || new PluginSystem();
        this.pluginSecurity = options.pluginSecurity || new PluginSecurity();

        this.marketplaceUrl = 'https://api.tpt-plugins.example.com'; // Placeholder
        this.installedPlugins = new Map();
        this.availablePlugins = new Map();
        this.pluginReviews = new Map();
        this.downloadQueue = new Map();
        this.updateQueue = new Map();

        this.init();
    }

    /**
     * Initialize the plugin marketplace
     */
    async init() {
        await this.preferences.init();
        this.setupEventListeners();
        await this.loadInstalledPlugins();
        await this.refreshAvailablePlugins();

        console.log('Plugin marketplace initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for plugin system events
        this.pluginSystem.on('plugin-installed', (data) => {
            this.handlePluginInstalled(data);
        });

        this.pluginSystem.on('plugin-uninstalled', (data) => {
            this.handlePluginUninstalled(data);
        });

        this.pluginSystem.on('plugin-updated', (data) => {
            this.handlePluginUpdated(data);
        });
    }

    /**
     * Load installed plugins
     */
    async loadInstalledPlugins() {
        const installed = this.preferences.get('installedPlugins', []);

        for (const pluginData of installed) {
            this.installedPlugins.set(pluginData.id, {
                ...pluginData,
                installDate: new Date(pluginData.installDate),
                lastUsed: pluginData.lastUsed ? new Date(pluginData.lastUsed) : null,
                localVersion: pluginData.version
            });
        }
    }

    /**
     * Refresh available plugins from marketplace
     */
    async refreshAvailablePlugins() {
        try {
            // In a real implementation, this would fetch from the marketplace API
            // For now, we'll simulate with some example plugins
            const mockPlugins = this.getMockAvailablePlugins();

            this.availablePlugins.clear();
            mockPlugins.forEach(plugin => {
                this.availablePlugins.set(plugin.id, plugin);
            });

            this.emit('marketplace-refreshed', {
                pluginCount: mockPlugins.length
            });

        } catch (error) {
            console.error('Failed to refresh available plugins:', error);
            this.emit('marketplace-refresh-error', { error });
        }
    }

    /**
     * Get mock available plugins (for demonstration)
     */
    getMockAvailablePlugins() {
        return [
            {
                id: 'advanced-export',
                name: 'Advanced Export Tools',
                description: 'Enhanced export capabilities with multiple formats and compression options',
                version: '2.1.0',
                author: 'TPT Team',
                category: 'productivity',
                tags: ['export', 'productivity', 'formats'],
                downloads: 15420,
                rating: 4.8,
                reviews: 342,
                price: 0, // Free
                compatibility: ['1.0.0', '2.0.0'],
                dependencies: [],
                screenshots: ['screenshot1.png', 'screenshot2.png'],
                changelog: 'Added WebP export support and improved compression',
                lastUpdated: '2025-01-15',
                size: 2457600, // 2.4MB
                verified: true,
                featured: true
            },
            {
                id: 'ai-assistant',
                name: 'AI Asset Assistant',
                description: 'AI-powered suggestions and automated asset optimization',
                version: '1.3.2',
                author: 'AI Innovations Inc',
                category: 'ai',
                tags: ['ai', 'automation', 'optimization'],
                downloads: 8750,
                rating: 4.6,
                reviews: 198,
                price: 9.99,
                compatibility: ['1.5.0', '2.0.0'],
                dependencies: ['advanced-export'],
                screenshots: ['ai-demo1.png', 'ai-demo2.png'],
                changelog: 'Improved AI model accuracy and added batch processing',
                lastUpdated: '2025-01-20',
                size: 15728640, // 15MB
                verified: true,
                featured: true
            },
            {
                id: 'theme-pack-dark',
                name: 'Dark Theme Collection',
                description: 'Beautiful dark themes with multiple variants',
                version: '1.0.5',
                author: 'Design Studio',
                category: 'themes',
                tags: ['themes', 'dark', 'ui'],
                downloads: 25680,
                rating: 4.9,
                reviews: 567,
                price: 4.99,
                compatibility: ['1.0.0', '2.0.0'],
                dependencies: [],
                screenshots: ['dark-theme1.png', 'dark-theme2.png'],
                changelog: 'Added new midnight theme variant',
                lastUpdated: '2025-01-10',
                size: 512000, // 512KB
                verified: true,
                featured: false
            },
            {
                id: 'batch-processor',
                name: 'Batch Processing Suite',
                description: 'Advanced batch processing with queue management and scheduling',
                version: '3.2.1',
                author: 'Productivity Pro',
                category: 'productivity',
                tags: ['batch', 'processing', 'automation'],
                downloads: 12340,
                rating: 4.7,
                reviews: 289,
                price: 14.99,
                compatibility: ['2.0.0'],
                dependencies: [],
                screenshots: ['batch-ui1.png', 'batch-ui2.png'],
                changelog: 'Added scheduling features and improved queue management',
                lastUpdated: '2025-01-25',
                size: 5242880, // 5MB
                verified: true,
                featured: true
            },
            {
                id: 'collaboration-tools',
                name: 'Team Collaboration Suite',
                description: 'Real-time collaboration tools for team asset creation',
                version: '1.1.0',
                author: 'TeamWorks',
                category: 'collaboration',
                tags: ['collaboration', 'team', 'real-time'],
                downloads: 6780,
                rating: 4.4,
                reviews: 156,
                price: 19.99,
                compatibility: ['2.0.0'],
                dependencies: ['advanced-export'],
                screenshots: ['collab1.png', 'collab2.png'],
                changelog: 'Added voice chat and improved real-time sync',
                lastUpdated: '2025-01-18',
                size: 10485760, // 10MB
                verified: true,
                featured: false
            }
        ];
    }

    /**
     * Search plugins
     */
    searchPlugins(query, filters = {}) {
        const { category, tags, author, minRating, maxPrice, verifiedOnly } = filters;

        return Array.from(this.availablePlugins.values())
            .filter(plugin => {
                // Text search
                if (query) {
                    const searchTerm = query.toLowerCase();
                    const searchableText = `${plugin.name} ${plugin.description} ${plugin.tags.join(' ')}`.toLowerCase();
                    if (!searchableText.includes(searchTerm)) return false;
                }

                // Category filter
                if (category && plugin.category !== category) return false;

                // Tags filter
                if (tags && tags.length > 0) {
                    if (!tags.some(tag => plugin.tags.includes(tag))) return false;
                }

                // Author filter
                if (author && plugin.author !== author) return false;

                // Rating filter
                if (minRating && plugin.rating < minRating) return false;

                // Price filter
                if (maxPrice !== undefined && plugin.price > maxPrice) return false;

                // Verified filter
                if (verifiedOnly && !plugin.verified) return false;

                return true;
            })
            .sort((a, b) => {
                // Sort by relevance, rating, downloads
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                if (a.rating !== b.rating) return b.rating - a.rating;
                return b.downloads - a.downloads;
            });
    }

    /**
     * Get plugin details
     */
    async getPluginDetails(pluginId) {
        const plugin = this.availablePlugins.get(pluginId) || this.installedPlugins.get(pluginId);

        if (!plugin) {
            throw new Error(`Plugin '${pluginId}' not found`);
        }

        // Add installation status
        const installed = this.installedPlugins.get(pluginId);
        if (installed) {
            plugin.installed = true;
            plugin.installedVersion = installed.localVersion;
            plugin.installDate = installed.installDate;
            plugin.lastUsed = installed.lastUsed;
        } else {
            plugin.installed = false;
        }

        // Add reviews
        plugin.reviews = this.pluginReviews.get(pluginId) || [];

        return plugin;
    }

    /**
     * Install plugin
     */
    async installPlugin(pluginId, options = {}) {
        const plugin = this.availablePlugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin '${pluginId}' not found in marketplace`);
        }

        // Check if already installed
        if (this.installedPlugins.has(pluginId)) {
            const installed = this.installedPlugins.get(pluginId);
            if (installed.localVersion === plugin.version) {
                throw new Error(`Plugin '${plugin.name}' is already installed`);
            }
        }

        // Check dependencies
        await this.checkDependencies(plugin);

        // Check compatibility
        this.checkCompatibility(plugin);

        // Add to download queue
        this.downloadQueue.set(pluginId, {
            plugin,
            status: 'downloading',
            progress: 0,
            options
        });

        this.emit('plugin-install-started', { pluginId, plugin });

        try {
            // Simulate download process
            await this.simulateDownload(pluginId);

            // Register with plugin system
            const pluginDefinition = this.createPluginDefinition(plugin);
            const registeredId = await this.pluginSystem.registerPlugin(pluginDefinition);

            // Mark as installed
            this.installedPlugins.set(pluginId, {
                ...plugin,
                installDate: new Date(),
                lastUsed: null,
                localVersion: plugin.version
            });

            // Save installation data
            await this.saveInstalledPlugins();

            // Remove from download queue
            this.downloadQueue.delete(pluginId);

            this.emit('plugin-installed', { pluginId, plugin, registeredId });

            return registeredId;

        } catch (error) {
            this.downloadQueue.get(pluginId).status = 'error';
            this.downloadQueue.get(pluginId).error = error.message;
            this.emit('plugin-install-error', { pluginId, error });
            throw error;
        }
    }

    /**
     * Uninstall plugin
     */
    async uninstallPlugin(pluginId) {
        const installed = this.installedPlugins.get(pluginId);
        if (!installed) {
            throw new Error(`Plugin '${pluginId}' is not installed`);
        }

        try {
            // Unload from plugin system
            await this.pluginSystem.unloadPlugin(pluginId);

            // Remove from installed plugins
            this.installedPlugins.delete(pluginId);

            // Save installation data
            await this.saveInstalledPlugins();

            this.emit('plugin-uninstalled', { pluginId, plugin: installed });

        } catch (error) {
            console.error(`Failed to uninstall plugin '${pluginId}':`, error);
            this.emit('plugin-uninstall-error', { pluginId, error });
            throw error;
        }
    }

    /**
     * Update plugin
     */
    async updatePlugin(pluginId) {
        const installed = this.installedPlugins.get(pluginId);
        const available = this.availablePlugins.get(pluginId);

        if (!installed) {
            throw new Error(`Plugin '${pluginId}' is not installed`);
        }

        if (!available) {
            throw new Error(`Plugin '${pluginId}' not found in marketplace`);
        }

        if (installed.localVersion === available.version) {
            throw new Error(`Plugin '${pluginId}' is already up to date`);
        }

        // Add to update queue
        this.updateQueue.set(pluginId, {
            fromVersion: installed.localVersion,
            toVersion: available.version,
            status: 'updating',
            progress: 0
        });

        this.emit('plugin-update-started', { pluginId, fromVersion: installed.localVersion, toVersion: available.version });

        try {
            // Simulate update process
            await this.simulateUpdate(pluginId);

            // Update installed version
            installed.localVersion = available.version;
            installed.lastUpdated = new Date();

            // Save installation data
            await this.saveInstalledPlugins();

            // Remove from update queue
            this.updateQueue.delete(pluginId);

            this.emit('plugin-updated', { pluginId, fromVersion: installed.localVersion, toVersion: available.version });

        } catch (error) {
            this.updateQueue.get(pluginId).status = 'error';
            this.updateQueue.get(pluginId).error = error.message;
            this.emit('plugin-update-error', { pluginId, error });
            throw error;
        }
    }

    /**
     * Check for plugin updates
     */
    async checkForUpdates() {
        const updates = [];

        for (const [pluginId, installed] of this.installedPlugins) {
            const available = this.availablePlugins.get(pluginId);
            if (available && installed.localVersion !== available.version) {
                updates.push({
                    pluginId,
                    name: installed.name,
                    currentVersion: installed.localVersion,
                    newVersion: available.version,
                    changelog: available.changelog
                });
            }
        }

        this.emit('updates-available', { updates });
        return updates;
    }

    /**
     * Submit plugin review
     */
    async submitReview(pluginId, review) {
        const { rating, title, comment, author } = review;

        if (!this.installedPlugins.has(pluginId)) {
            throw new Error('Can only review installed plugins');
        }

        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        const newReview = {
            id: this.generateReviewId(),
            pluginId,
            rating,
            title,
            comment,
            author: author || 'Anonymous',
            date: new Date().toISOString(),
            verified: true // Since user has it installed
        };

        if (!this.pluginReviews.has(pluginId)) {
            this.pluginReviews.set(pluginId, []);
        }

        this.pluginReviews.get(pluginId).push(newReview);

        // Update plugin rating
        this.updatePluginRating(pluginId);

        this.emit('review-submitted', { pluginId, review: newReview });

        return newReview;
    }

    /**
     * Get plugin reviews
     */
    getPluginReviews(pluginId, options = {}) {
        const { sortBy = 'date', limit = 10 } = options;
        const reviews = this.pluginReviews.get(pluginId) || [];

        return reviews
            .sort((a, b) => {
                switch (sortBy) {
                    case 'rating':
                        return b.rating - a.rating;
                    case 'date':
                    default:
                        return new Date(b.date) - new Date(a.date);
                }
            })
            .slice(0, limit);
    }

    /**
     * Get featured plugins
     */
    getFeaturedPlugins() {
        return Array.from(this.availablePlugins.values())
            .filter(plugin => plugin.featured)
            .sort((a, b) => b.rating - a.rating);
    }

    /**
     * Get popular plugins
     */
    getPopularPlugins() {
        return Array.from(this.availablePlugins.values())
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, 10);
    }

    /**
     * Get plugins by category
     */
    getPluginsByCategory(category) {
        return Array.from(this.availablePlugins.values())
            .filter(plugin => plugin.category === category);
    }

    /**
     * Get plugin statistics
     */
    getStatistics() {
        const totalAvailable = this.availablePlugins.size;
        const totalInstalled = this.installedPlugins.size;
        const updatesAvailable = this.getUpdatesAvailable().length;
        const totalReviews = Array.from(this.pluginReviews.values()).reduce((sum, reviews) => sum + reviews.length, 0);

        return {
            totalAvailable,
            totalInstalled,
            updatesAvailable,
            totalReviews,
            categories: this.getCategoryStats(),
            averageRating: this.getAverageRating()
        };
    }

    /**
     * Get category statistics
     */
    getCategoryStats() {
        const stats = {};

        for (const plugin of this.availablePlugins.values()) {
            if (!stats[plugin.category]) {
                stats[plugin.category] = 0;
            }
            stats[plugin.category]++;
        }

        return stats;
    }

    /**
     * Get average rating across all plugins
     */
    getAverageRating() {
        const plugins = Array.from(this.availablePlugins.values());
        if (plugins.length === 0) return 0;

        const totalRating = plugins.reduce((sum, plugin) => sum + plugin.rating, 0);
        return totalRating / plugins.length;
    }

    /**
     * Get available updates
     */
    getUpdatesAvailable() {
        const updates = [];

        for (const [pluginId, installed] of this.installedPlugins) {
            const available = this.availablePlugins.get(pluginId);
            if (available && installed.localVersion !== available.version) {
                updates.push({
                    pluginId,
                    name: installed.name,
                    currentVersion: installed.localVersion,
                    newVersion: available.version
                });
            }
        }

        return updates;
    }

    /**
     * Check plugin dependencies
     */
    async checkDependencies(plugin) {
        if (!plugin.dependencies || plugin.dependencies.length === 0) {
            return;
        }

        const missingDeps = [];

        for (const depId of plugin.dependencies) {
            if (!this.installedPlugins.has(depId)) {
                const depPlugin = this.availablePlugins.get(depId);
                if (depPlugin) {
                    missingDeps.push(depPlugin.name);
                } else {
                    missingDeps.push(depId);
                }
            }
        }

        if (missingDeps.length > 0) {
            throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
        }
    }

    /**
     * Check plugin compatibility
     */
    checkCompatibility(plugin) {
        // In a real implementation, this would check against the current app version
        // For now, we'll just ensure the compatibility array includes current version
        const currentVersion = '2.0.0'; // Placeholder

        if (!plugin.compatibility.includes(currentVersion)) {
            console.warn(`Plugin '${plugin.name}' may not be compatible with version ${currentVersion}`);
        }
    }

    /**
     * Create plugin definition for plugin system
     */
    createPluginDefinition(marketplacePlugin) {
        return {
            id: marketplacePlugin.id,
            name: marketplacePlugin.name,
            version: marketplacePlugin.version,
            description: marketplacePlugin.description,
            author: marketplacePlugin.author,
            category: marketplacePlugin.category,
            tags: marketplacePlugin.tags,

            // Plugin system integration
            factory: () => this.createPluginInstance(marketplacePlugin),
            config: {
                marketplaceData: marketplacePlugin
            }
        };
    }

    /**
     * Create plugin instance
     */
    createPluginInstance(marketplacePlugin) {
        // This would create the actual plugin instance
        // For now, return a mock implementation
        return {
            id: marketplacePlugin.id,
            name: marketplacePlugin.name,
            version: marketplacePlugin.version,

            init: async (context) => {
                console.log(`Initializing plugin: ${marketplacePlugin.name}`);
                // Plugin initialization logic would go here
            },

            destroy: async () => {
                console.log(`Destroying plugin: ${marketplacePlugin.name}`);
                // Plugin cleanup logic would go here
            }
        };
    }

    /**
     * Update plugin rating based on reviews
     */
    updatePluginRating(pluginId) {
        const reviews = this.pluginReviews.get(pluginId) || [];
        if (reviews.length === 0) return;

        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        const plugin = this.availablePlugins.get(pluginId);
        if (plugin) {
            plugin.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal
            plugin.reviews = reviews.length;
        }
    }

    /**
     * Generate review ID
     */
    generateReviewId() {
        return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Simulate download process
     */
    async simulateDownload(pluginId) {
        const download = this.downloadQueue.get(pluginId);
        const steps = 10;

        for (let i = 1; i <= steps; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            download.progress = (i / steps) * 100;
            this.emit('download-progress', { pluginId, progress: download.progress });
        }
    }

    /**
     * Simulate update process
     */
    async simulateUpdate(pluginId) {
        const update = this.updateQueue.get(pluginId);
        const steps = 8;

        for (let i = 1; i <= steps; i++) {
            await new Promise(resolve => setTimeout(resolve, 150));
            update.progress = (i / steps) * 100;
            this.emit('update-progress', { pluginId, progress: update.progress });
        }
    }

    /**
     * Save installed plugins
     */
    async saveInstalledPlugins() {
        const installedArray = Array.from(this.installedPlugins.values());
        await this.preferences.set('installedPlugins', installedArray);
    }

    /**
     * Handle plugin installed event
     */
    handlePluginInstalled(data) {
        // Update usage statistics
        const installed = this.installedPlugins.get(data.pluginId);
        if (installed) {
            installed.lastUsed = new Date();
        }
    }

    /**
     * Handle plugin uninstalled event
     */
    handlePluginUninstalled(data) {
        // Clean up marketplace data
        // Additional cleanup logic
    }

    /**
     * Handle plugin updated event
     */
    handlePluginUpdated(data) {
        // Update version information
        const installed = this.installedPlugins.get(data.pluginId);
        if (installed) {
            installed.localVersion = data.toVersion;
            installed.lastUpdated = new Date();
        }
    }

    /**
     * Emit event
     */
    emit(eventType, data) {
        const event = new CustomEvent(`plugin-marketplace-${eventType}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the plugin marketplace
     */
    destroy() {
        this.installedPlugins.clear();
        this.availablePlugins.clear();
        this.pluginReviews.clear();
        this.downloadQueue.clear();
        this.updateQueue.clear();

        console.log('Plugin marketplace destroyed');
    }
}

module.exports = PluginMarketplace;
