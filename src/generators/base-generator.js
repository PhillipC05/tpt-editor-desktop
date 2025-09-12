/**
 * TPT Asset Editor Desktop - Base Generator Class
 * Provides common functionality and patterns for all asset generators
 */

const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class BaseGenerator extends EventEmitter {
    constructor(options = {}) {
        super();

        // Generator metadata
        this.name = options.name || 'Base Generator';
        this.version = options.version || '1.0.0';
        this.description = options.description || 'Base asset generator';
        this.assetType = options.assetType || 'unknown';

        // Configuration defaults
        this.defaultConfig = options.defaultConfig || {};
        this.supportedFormats = options.supportedFormats || ['png'];
        this.maxBatchSize = options.maxBatchSize || 50;

        // Performance tracking
        this.generationStats = {
            totalGenerated: 0,
            totalTime: 0,
            averageTime: 0,
            successRate: 100,
            lastGenerated: null
        };

        // Caching
        this.cache = new Map();
        this.cacheEnabled = options.cacheEnabled !== false;
        this.cacheMaxSize = options.cacheMaxSize || 100;

        // Validation
        this.validators = new Map();

        // Progress tracking
        this.currentProgress = {
            operation: null,
            completed: 0,
            total: 0,
            startTime: null
        };
    }

    /**
     * Generate asset with common processing pipeline
     */
    async generate(config = {}, options = {}) {
        const startTime = Date.now();
        const operationId = options.operationId || uuidv4();

        try {
            // Validate configuration
            const validatedConfig = await this.validateConfig(config);

            // Check cache first
            if (this.cacheEnabled && options.useCache !== false) {
                const cacheKey = this.getCacheKey(validatedConfig);
                const cachedResult = this.cache.get(cacheKey);
                if (cachedResult) {
                    this.emit('cacheHit', { operationId, cacheKey });
                    return cachedResult;
                }
            }

            // Emit generation start event
            this.emit('generationStart', {
                operationId,
                config: validatedConfig,
                options
            });

            // Pre-generation setup
            await this.preGenerate(validatedConfig, options);

            // Core generation logic (implemented by subclasses)
            const result = await this.generateAsset(validatedConfig, options);

            // Post-generation processing
            const processedResult = await this.postGenerate(result, validatedConfig, options);

            // Create standardized asset object
            const asset = this.createAssetObject(processedResult, validatedConfig, options);

            // Cache result if enabled
            if (this.cacheEnabled && options.useCache !== false) {
                const cacheKey = this.getCacheKey(validatedConfig);
                this.cache.set(cacheKey, asset);

                // Maintain cache size limit
                if (this.cache.size > this.cacheMaxSize) {
                    const firstKey = this.cache.keys().next().value;
                    this.cache.delete(firstKey);
                }
            }

            // Update statistics
            const generationTime = Date.now() - startTime;
            this.updateGenerationStats(generationTime, true);

            // Emit success event
            this.emit('generationSuccess', {
                operationId,
                asset,
                generationTime,
                config: validatedConfig
            });

            return asset;

        } catch (error) {
            // Update statistics for failure
            const generationTime = Date.now() - startTime;
            this.updateGenerationStats(generationTime, false);

            // Emit error event
            this.emit('generationError', {
                operationId,
                error: error.message,
                config,
                generationTime
            });

            throw error;
        }
    }

    /**
     * Generate multiple assets in batch
     */
    async generateBatch(configs = [], options = {}) {
        const results = [];
        const startTime = Date.now();
        const batchId = options.batchId || uuidv4();

        this.emit('batchStart', { batchId, count: configs.length });

        for (let i = 0; i < configs.length; i++) {
            try {
                const config = configs[i];
                const asset = await this.generate(config, {
                    ...options,
                    batchIndex: i,
                    batchId,
                    operationId: `${batchId}-${i}`
                });

                results.push({
                    success: true,
                    asset,
                    index: i
                });

                // Emit batch progress
                this.emit('batchProgress', {
                    batchId,
                    completed: i + 1,
                    total: configs.length,
                    currentAsset: asset
                });

            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    index: i,
                    config: configs[i]
                });

                this.emit('batchError', {
                    batchId,
                    index: i,
                    error: error.message
                });
            }
        }

        const totalTime = Date.now() - startTime;
        const successCount = results.filter(r => r.success).length;

        this.emit('batchComplete', {
            batchId,
            results,
            totalTime,
            successCount,
            totalCount: configs.length
        });

        return results;
    }

    /**
     * Validate configuration object
     */
    async validateConfig(config) {
        // Merge with defaults
        const mergedConfig = { ...this.defaultConfig, ...config };

        // Run custom validators
        for (const [key, validator] of this.validators) {
            try {
                const value = mergedConfig[key];
                const isValid = await validator(value, mergedConfig);
                if (!isValid) {
                    throw new Error(`Validation failed for ${key}: ${value}`);
                }
            } catch (error) {
                throw new Error(`Configuration validation error: ${error.message}`);
            }
        }

        // Run built-in validation
        await this.validateConfigInternal(mergedConfig);

        return mergedConfig;
    }

    /**
     * Internal configuration validation (override in subclasses)
     */
    async validateConfigInternal(config) {
        // Default validation - can be overridden by subclasses
        if (typeof config !== 'object') {
            throw new Error('Configuration must be an object');
        }
    }

    /**
     * Pre-generation setup
     */
    async preGenerate(config, options) {
        // Setup progress tracking
        if (options.trackProgress) {
            this.currentProgress = {
                operation: 'generation',
                completed: 0,
                total: 100,
                startTime: Date.now()
            };
        }

        // Emit pre-generation event
        this.emit('preGenerate', { config, options });
    }

    /**
     * Core asset generation logic (must be implemented by subclasses)
     */
    async generateAsset(config, options) {
        throw new Error('generateAsset() must be implemented by subclass');
    }

    /**
     * Post-generation processing
     */
    async postGenerate(result, config, options) {
        // Apply post-processing if specified
        if (options.postProcessing) {
            return await this.applyPostProcessing(result, options.postProcessing);
        }

        return result;
    }

    /**
     * Create standardized asset object
     */
    createAssetObject(result, config, options) {
        const asset = {
            id: options.id || uuidv4(),
            name: this.generateAssetName(result, config, options),
            type: this.assetType,
            config: config,
            metadata: this.generateMetadata(result, config, options),
            generated: new Date().toISOString(),
            generator: {
                name: this.name,
                version: this.version,
                type: this.assetType
            }
        };

        // Add result-specific data
        if (result.data) {
            asset.data = result.data;
        }

        // Add format-specific data (sprite, audio, etc.)
        if (result.sprite) {
            asset.sprite = result.sprite;
        }

        if (result.audio) {
            asset.audio = result.audio;
        }

        if (result.model) {
            asset.model = result.model;
        }

        return asset;
    }

    /**
     * Generate asset name
     */
    generateAssetName(result, config, options) {
        // Default naming strategy - can be overridden
        const prefix = options.namePrefix || '';
        const suffix = options.nameSuffix || '';
        const baseName = config.name || `${this.assetType.charAt(0).toUpperCase() + this.assetType.slice(1)} Asset`;

        return `${prefix}${baseName}${suffix}`;
    }

    /**
     * Generate asset metadata
     */
    generateMetadata(result, config, options) {
        return {
            generated: new Date().toISOString(),
            version: this.version,
            config: { ...config },
            options: { ...options },
            generator: this.name,
            quality: options.quality || 'standard',
            tags: options.tags || []
        };
    }

    /**
     * Apply post-processing to result
     */
    async applyPostProcessing(result, postProcessing) {
        // Default post-processing - can be extended by subclasses
        if (postProcessing.resize && result.sprite) {
            return await this.resizeAsset(result, postProcessing.resize);
        }

        if (postProcessing.optimize && result.sprite) {
            return await this.optimizeAsset(result, postProcessing.optimize);
        }

        return result;
    }

    /**
     * Get cache key for configuration
     */
    getCacheKey(config) {
        // Create a deterministic string from config
        return JSON.stringify(config, Object.keys(config).sort());
    }

    /**
     * Update generation statistics
     */
    updateGenerationStats(generationTime, success) {
        this.generationStats.totalGenerated++;
        this.generationStats.totalTime += generationTime;
        this.generationStats.averageTime = this.generationStats.totalTime / this.generationStats.totalGenerated;
        this.generationStats.lastGenerated = new Date().toISOString();

        if (!success) {
            const failureRate = (this.generationStats.totalGenerated - (this.generationStats.successRate / 100 * this.generationStats.totalGenerated)) / this.generationStats.totalGenerated;
            this.generationStats.successRate = (1 - failureRate) * 100;
        }
    }

    /**
     * Get generation statistics
     */
    getGenerationStats() {
        return { ...this.generationStats };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.emit('cacheCleared');
    }

    /**
     * Get cache size
     */
    getCacheSize() {
        return this.cache.size;
    }

    /**
     * Add configuration validator
     */
    addValidator(key, validator) {
        this.validators.set(key, validator);
    }

    /**
     * Remove configuration validator
     */
    removeValidator(key) {
        this.validators.delete(key);
    }

    /**
     * Export generator configuration
     */
    exportConfiguration() {
        return {
            name: this.name,
            version: this.version,
            description: this.description,
            assetType: this.assetType,
            defaultConfig: { ...this.defaultConfig },
            supportedFormats: [...this.supportedFormats],
            maxBatchSize: this.maxBatchSize,
            cacheEnabled: this.cacheEnabled,
            cacheMaxSize: this.cacheMaxSize,
            validators: Array.from(this.validators.keys()),
            generationStats: { ...this.generationStats }
        };
    }

    /**
     * Import generator configuration
     */
    importConfiguration(config) {
        if (config.name) this.name = config.name;
        if (config.version) this.version = config.version;
        if (config.description) this.description = config.description;
        if (config.assetType) this.assetType = config.assetType;
        if (config.defaultConfig) this.defaultConfig = { ...config.defaultConfig };
        if (config.supportedFormats) this.supportedFormats = [...config.supportedFormats];
        if (config.maxBatchSize) this.maxBatchSize = config.maxBatchSize;
        if (config.cacheEnabled !== undefined) this.cacheEnabled = config.cacheEnabled;
        if (config.cacheMaxSize) this.cacheMaxSize = config.cacheMaxSize;

        this.emit('configurationImported', config);
    }

    /**
     * Create progress tracker
     */
    createProgressTracker(operation, total) {
        return {
            operation,
            completed: 0,
            total,
            startTime: Date.now(),
            update: (completed) => {
                this.currentProgress.completed = completed;
                this.emit('progressUpdate', {
                    operation,
                    completed,
                    total,
                    percentage: (completed / total) * 100
                });
            },
            complete: () => {
                const duration = Date.now() - this.currentProgress.startTime;
                this.emit('progressComplete', {
                    operation,
                    duration,
                    total
                });
            }
        };
    }

    /**
     * Get current progress
     */
    getCurrentProgress() {
        return { ...this.currentProgress };
    }

    /**
     * Utility method to resize assets
     */
    async resizeAsset(asset, dimensions) {
        // Default implementation - should be overridden by subclasses
        console.warn('resizeAsset() not implemented for this generator type');
        return asset;
    }

    /**
     * Utility method to optimize assets
     */
    async optimizeAsset(asset, options) {
        // Default implementation - should be overridden by subclasses
        console.warn('optimizeAsset() not implemented for this generator type');
        return asset;
    }

    /**
     * Utility method to validate asset
     */
    async validateAsset(asset) {
        // Basic validation
        if (!asset.id) {
            throw new Error('Asset must have an ID');
        }

        if (!asset.name) {
            throw new Error('Asset must have a name');
        }

        if (!asset.type) {
            throw new Error('Asset must have a type');
        }

        return true;
    }

    /**
     * Utility method to merge configurations
     */
    mergeConfigurations(baseConfig, overrideConfig) {
        return { ...baseConfig, ...overrideConfig };
    }

    /**
     * Utility method to deep clone objects
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Utility method to generate random values within range
     */
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Utility method to clamp values
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Utility method to normalize values
     */
    normalize(value, min, max) {
        return (value - min) / (max - min);
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        // Clear cache
        this.clearCache();

        // Clear validators
        this.validators.clear();

        // Remove all listeners
        this.removeAllListeners();

        // Reset progress
        this.currentProgress = {
            operation: null,
            completed: 0,
            total: 0,
            startTime: null
        };

        console.log(`Cleaned up ${this.name} generator`);
    }
}

module.exports = BaseGenerator;
