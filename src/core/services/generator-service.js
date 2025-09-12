/**
 * TPT Asset Editor Desktop - Generator Service
 * Business logic layer for asset generation operations
 */

const EventEmitter = require('events');
const path = require('path');

class GeneratorService extends EventEmitter {
    constructor(assetService, store) {
        super();

        this.assetService = assetService;
        this.store = store;
        this.activeGenerators = new Map();
        this.generatorQueue = [];
        this.maxConcurrentGenerators = 3;

        // Bind methods
        this.generateAsset = this.generateAsset.bind(this);
        this.generateBatch = this.generateBatch.bind(this);
        this.cancelGeneration = this.cancelGeneration.bind(this);
    }

    /**
     * Generate a single asset
     */
    async generateAsset(type, config, options = {}) {
        try {
            const generationId = this.generateId();

            // Create generation context
            const context = {
                id: generationId,
                type,
                config,
                options,
                startTime: Date.now(),
                status: 'running',
                progress: 0
            };

            this.activeGenerators.set(generationId, context);
            this.emit('generationStarted', context);

            // Update store
            this.store.dispatch({
                type: 'GENERATOR_STARTED',
                payload: { generationId, type, config }
            });

            // Validate inputs
            await this.validateGenerationInputs(type, config);

            // Generate the asset based on type
            const result = await this.executeGeneration(type, config, context);

            // Create asset data
            const assetData = {
                name: options.name || this.generateAssetName(type, config),
                type: type,
                generator: {
                    type: type,
                    config: config,
                    version: '1.0.0',
                    generationId: generationId
                },
                quality_score: this.calculateQualityScore(result),
                tags: this.generateTags(type, config),
                metadata: {
                    generation_time: Date.now() - context.startTime,
                    generator_version: '1.0.0',
                    config_hash: this.hashConfig(config)
                },
                ...result
            };

            // Save asset
            const savedAsset = await this.assetService.createAsset(assetData, {
                generationId,
                skipCache: false
            });

            // Update context
            context.status = 'completed';
            context.result = savedAsset;
            context.endTime = Date.now();

            // Update store
            this.store.dispatch({
                type: 'GENERATOR_COMPLETED',
                payload: {
                    generationId,
                    asset: savedAsset,
                    duration: context.endTime - context.startTime
                }
            });

            this.emit('generationCompleted', context);

            // Clean up
            this.activeGenerators.delete(generationId);

            return savedAsset;

        } catch (error) {
            console.error('Error generating asset:', error);

            // Update context on error
            const context = this.activeGenerators.get(generationId);
            if (context) {
                context.status = 'failed';
                context.error = error.message;
                context.endTime = Date.now();

                this.emit('generationFailed', context);
                this.activeGenerators.delete(generationId);
            }

            // Update store
            this.store.dispatch({
                type: 'GENERATOR_FAILED',
                payload: { generationId, error: error.message }
            });

            throw error;
        }
    }

    /**
     * Generate multiple assets in batch
     */
    async generateBatch(generations, options = {}) {
        try {
            const batchId = this.generateId();
            const results = [];
            const errors = [];

            this.emit('batchGenerationStarted', { batchId, count: generations.length });

            // Update store
            this.store.dispatch({
                type: 'BATCH_GENERATION_STARTED',
                payload: { batchId, count: generations.length }
            });

            // Process generations with concurrency control
            const concurrencyLimit = options.concurrency || this.maxConcurrentGenerators;
            const chunks = this.chunkArray(generations, concurrencyLimit);

            for (const chunk of chunks) {
                const promises = chunk.map(async (generation, index) => {
                    try {
                        const result = await this.generateAsset(
                            generation.type,
                            generation.config,
                            {
                                ...options,
                                name: generation.name,
                                batchId,
                                batchIndex: results.length + index
                            }
                        );
                        results.push(result);
                        return result;
                    } catch (error) {
                        errors.push({
                            generation,
                            error: error.message
                        });
                        return null;
                    }
                });

                await Promise.allSettled(promises);

                // Update progress
                const progress = (results.length + errors.length) / generations.length * 100;
                this.emit('batchGenerationProgress', {
                    batchId,
                    completed: results.length,
                    failed: errors.length,
                    total: generations.length,
                    progress
                });
            }

            const batchResult = {
                batchId,
                results: results.filter(r => r !== null),
                errors,
                total: generations.length,
                successCount: results.length,
                errorCount: errors.length
            };

            // Update store
            this.store.dispatch({
                type: 'BATCH_GENERATION_COMPLETED',
                payload: batchResult
            });

            this.emit('batchGenerationCompleted', batchResult);

            return batchResult;

        } catch (error) {
            console.error('Error in batch generation:', error);
            throw error;
        }
    }

    /**
     * Cancel an active generation
     */
    async cancelGeneration(generationId) {
        const context = this.activeGenerators.get(generationId);
        if (!context) {
            throw new Error(`Generation not found: ${generationId}`);
        }

        context.status = 'cancelled';
        context.endTime = Date.now();

        // Update store
        this.store.dispatch({
            type: 'GENERATOR_CANCELLED',
            payload: { generationId }
        });

        this.emit('generationCancelled', context);
        this.activeGenerators.delete(generationId);

        return true;
    }

    /**
     * Get active generations
     */
    getActiveGenerations() {
        return Array.from(this.activeGenerators.values());
    }

    /**
     * Get generation statistics
     */
    getGenerationStats() {
        const active = this.getActiveGenerations();
        const completed = active.filter(g => g.status === 'completed').length;
        const failed = active.filter(g => g.status === 'failed').length;
        const running = active.filter(g => g.status === 'running').length;

        return {
            active: active.length,
            completed,
            failed,
            running,
            queueLength: this.generatorQueue.length
        };
    }

    /**
     * Validate generation inputs
     */
    async validateGenerationInputs(type, config) {
        if (!type || typeof type !== 'string') {
            throw new Error('Asset type is required and must be a string');
        }

        if (!config || typeof config !== 'object') {
            throw new Error('Configuration is required and must be an object');
        }

        // Type-specific validation
        switch (type) {
            case 'character':
                await this.validateCharacterConfig(config);
                break;
            case 'monster':
                await this.validateMonsterConfig(config);
                break;
            case 'vehicle':
                await this.validateVehicleConfig(config);
                break;
            case 'building':
                await this.validateBuildingConfig(config);
                break;
            case 'sfx':
            case 'music':
            case 'ambient':
                await this.validateAudioConfig(config);
                break;
            case 'particle':
                await this.validateParticleConfig(config);
                break;
            case 'ui':
                await this.validateUIConfig(config);
                break;
            default:
                // Generic validation for unknown types
                if (!config.name && !config.type) {
                    throw new Error('Configuration must include name or type');
                }
        }
    }

    /**
     * Execute generation based on type
     */
    async executeGeneration(type, config, context) {
        // Update progress
        context.progress = 10;
        this.emit('generationProgress', { ...context });

        // Import the appropriate generator
        let generator;
        try {
            switch (type) {
                case 'character':
                case 'monster':
                case 'item':
                case 'tile':
                    generator = await this.loadGenerator('sprite-generator');
                    break;
                case 'vehicle':
                    generator = await this.loadGenerator('vehicle-generator');
                    break;
                case 'building':
                    generator = await this.loadGenerator('building-generator');
                    break;
                case 'sfx':
                case 'music':
                case 'ambient':
                    generator = await this.loadGenerator('audio-generator');
                    break;
                case 'particle':
                    generator = await this.loadGenerator('particle-generator');
                    break;
                case 'ui':
                    generator = await this.loadGenerator('ui-generator');
                    break;
                default:
                    throw new Error(`Unsupported generator type: ${type}`);
            }
        } catch (error) {
            throw new Error(`Failed to load generator for ${type}: ${error.message}`);
        }

        // Update progress
        context.progress = 30;
        this.emit('generationProgress', { ...context });

        // Execute generation
        const result = await generator.generate(config);

        // Update progress
        context.progress = 80;
        this.emit('generationProgress', { ...context });

        // Post-process result
        const processedResult = await this.postProcessResult(result, type, config);

        // Update progress
        context.progress = 100;
        this.emit('generationProgress', { ...context });

        return processedResult;
    }

    /**
     * Load generator module
     */
    async loadGenerator(type) {
        try {
            const generatorPath = path.join(__dirname, '../../generators', `${type}.js`);
            const GeneratorClass = require(generatorPath);

            // If it's a class, instantiate it
            if (typeof GeneratorClass === 'function') {
                return new GeneratorClass();
            }

            // If it's an object with generate method
            if (GeneratorClass.generate) {
                return GeneratorClass;
            }

            throw new Error(`Invalid generator format for ${type}`);

        } catch (error) {
            throw new Error(`Failed to load generator ${type}: ${error.message}`);
        }
    }

    /**
     * Post-process generation result
     */
    async postProcessResult(result, type, config) {
        // Apply quality enhancement if enabled
        if (this.store.getState('generators').settings.quality === 'high') {
            result = await this.applyQualityEnhancement(result, type);
        }

        // Add metadata
        result.metadata = {
            ...result.metadata,
            processed_at: new Date().toISOString(),
            processing_version: '1.0.0'
        };

        return result;
    }

    /**
     * Apply quality enhancement
     */
    async applyQualityEnhancement(result, type) {
        try {
            const enhancer = await this.loadGenerator('asset-quality-enhancer');
            return await enhancer.enhance(result, type);
        } catch (error) {
            console.warn('Quality enhancement failed, using original result:', error);
            return result;
        }
    }

    /**
     * Generate asset name
     */
    generateAssetName(type, config) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        return `${type}_${timestamp}`;
    }

    /**
     * Calculate quality score
     */
    calculateQualityScore(result) {
        // Basic quality calculation - can be enhanced
        let score = 0.5; // Base score

        // Add points for various quality indicators
        if (result.metadata) score += 0.1;
        if (result.tags && result.tags.length > 0) score += 0.1;
        if (result.sprite && result.sprite.width > 32) score += 0.1;
        if (result.audio && result.audio.duration > 1) score += 0.1;

        return Math.min(score, 1.0);
    }

    /**
     * Generate tags for asset
     */
    generateTags(type, config) {
        const tags = [type];

        // Add type-specific tags
        if (config.classType) tags.push(config.classType);
        if (config.monsterType) tags.push(config.monsterType);
        if (config.vehicleType) tags.push(config.vehicleType);
        if (config.buildingCategory) tags.push(config.buildingCategory);
        if (config.effectType) tags.push(config.effectType);
        if (config.elementCategory) tags.push(config.elementCategory);

        // Add quality tags
        if (config.detailLevel > 7) tags.push('high-detail');
        if (config.size > 2) tags.push('large');
        if (config.size < 0.5) tags.push('small');

        return [...new Set(tags)]; // Remove duplicates
    }

    /**
     * Hash configuration for tracking
     */
    hashConfig(config) {
        const crypto = require('crypto');
        const configString = JSON.stringify(config);
        return crypto.createHash('md5').update(configString).digest('hex');
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Chunk array for batch processing
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Validation methods for different asset types
     */
    async validateCharacterConfig(config) {
        if (!config.classType) {
            throw new Error('Character class type is required');
        }
        const validClasses = ['warrior', 'mage', 'ranger', 'rogue', 'paladin'];
        if (!validClasses.includes(config.classType)) {
            throw new Error(`Invalid character class: ${config.classType}`);
        }
    }

    async validateMonsterConfig(config) {
        if (!config.monsterType) {
            throw new Error('Monster type is required');
        }
        const validTypes = ['goblin', 'wolf', 'skeleton', 'orc', 'dragon', 'troll'];
        if (!validTypes.includes(config.monsterType)) {
            throw new Error(`Invalid monster type: ${config.monsterType}`);
        }
    }

    async validateVehicleConfig(config) {
        if (!config.vehicleType) {
            throw new Error('Vehicle type is required');
        }
        const validTypes = ['car', 'truck', 'motorcycle', 'spaceship', 'boat', 'aircraft', 'tank', 'mech'];
        if (!validTypes.includes(config.vehicleType)) {
            throw new Error(`Invalid vehicle type: ${config.vehicleType}`);
        }
    }

    async validateBuildingConfig(config) {
        if (!config.buildingCategory) {
            throw new Error('Building category is required');
        }
        const validCategories = ['residential', 'commercial', 'industrial', 'military', 'religious', 'entertainment', 'infrastructure'];
        if (!validCategories.includes(config.buildingCategory)) {
            throw new Error(`Invalid building category: ${config.buildingCategory}`);
        }
    }

    async validateAudioConfig(config) {
        if (config.duration && (config.duration < 0.1 || config.duration > 300)) {
            throw new Error('Audio duration must be between 0.1 and 300 seconds');
        }
        if (config.sampleRate && ![22050, 44100, 48000].includes(config.sampleRate)) {
            throw new Error('Invalid sample rate');
        }
    }

    async validateParticleConfig(config) {
        if (config.particleCount && (config.particleCount < 1 || config.particleCount > 10000)) {
            throw new Error('Particle count must be between 1 and 10000');
        }
        if (config.duration && (config.duration < 0.1 || config.duration > 30)) {
            throw new Error('Particle duration must be between 0.1 and 30 seconds');
        }
    }

    async validateUIConfig(config) {
        if (!config.elementCategory) {
            throw new Error('UI element category is required');
        }
        const validCategories = ['interactive', 'containers', 'indicators', 'navigation', 'input', 'display', 'icons', 'decorative'];
        if (!validCategories.includes(config.elementCategory)) {
            throw new Error(`Invalid UI element category: ${config.elementCategory}`);
        }
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        // Cancel all active generations
        for (const [id, context] of this.activeGenerators) {
            await this.cancelGeneration(id);
        }

        this.activeGenerators.clear();
        this.generatorQueue = [];
        this.removeAllListeners();

        console.log('Generator service cleaned up');
    }
}

module.exports = GeneratorService;
