/**
 * TPT Asset Editor Desktop - Asset Repository
 * Specialized repository for asset data operations
 */

const BaseRepository = require('./base-repository');

class AssetRepository extends BaseRepository {
    constructor(databaseManager) {
        super('assets', databaseManager);

        // Asset-specific cache settings
        this.cacheMaxSize = 1000;
        this.queryCacheMaxSize = 200;

        // Asset-specific indexes
        this.indexes = [
            { type: 1, created_at: -1 },
            { name: 1 },
            { tags: 1 },
            { 'metadata.quality': -1 },
            { 'metadata.generator': 1 }
        ];
    }

    /**
     * Custom validation for asset documents
     */
    async customValidation(document, operation, existingDocument = null) {
        // Validate required fields
        if (!document.name || document.name.trim().length === 0) {
            throw new Error('Asset name is required');
        }

        if (!document.type) {
            throw new Error('Asset type is required');
        }

        // Validate asset type
        const validTypes = [
            'character', 'monster', 'item', 'tile', 'sfx', 'music', 'ambient',
            'vehicle', 'building', 'particle', 'ui', 'sprite', 'animation',
            'level', 'texture', 'material', 'model', 'audio'
        ];

        if (!validTypes.includes(document.type)) {
            throw new Error(`Invalid asset type: ${document.type}`);
        }

        // Validate asset-specific data
        if (document.sprite) {
            this.validateSpriteData(document.sprite);
        }

        if (document.audio) {
            this.validateAudioData(document.audio);
        }

        if (document.model) {
            this.validateModelData(document.model);
        }

        // Validate metadata
        if (document.metadata) {
            this.validateMetadata(document.metadata);
        }

        // Validate tags
        if (document.tags && !Array.isArray(document.tags)) {
            throw new Error('Tags must be an array');
        }

        // For updates, ensure version consistency
        if (operation === 'update' && existingDocument) {
            if (document.version && document.version <= existingDocument.version) {
                throw new Error('Version must be incremented for updates');
            }
        }
    }

    /**
     * Validate sprite data
     */
    validateSpriteData(sprite) {
        if (!sprite.data) {
            throw new Error('Sprite data is required');
        }

        if (!sprite.width || !sprite.height) {
            throw new Error('Sprite dimensions are required');
        }

        if (sprite.width <= 0 || sprite.height <= 0) {
            throw new Error('Sprite dimensions must be positive');
        }

        if (!sprite.format) {
            throw new Error('Sprite format is required');
        }

        const validFormats = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
        if (!validFormats.includes(sprite.format.toLowerCase())) {
            throw new Error(`Invalid sprite format: ${sprite.format}`);
        }
    }

    /**
     * Validate audio data
     */
    validateAudioData(audio) {
        if (!audio.data) {
            throw new Error('Audio data is required');
        }

        if (!audio.sampleRate) {
            throw new Error('Audio sample rate is required');
        }

        if (audio.sampleRate <= 0) {
            throw new Error('Audio sample rate must be positive');
        }

        if (!audio.channels) {
            throw new Error('Audio channels is required');
        }

        if (audio.channels < 1 || audio.channels > 8) {
            throw new Error('Audio channels must be between 1 and 8');
        }

        if (!audio.format) {
            throw new Error('Audio format is required');
        }

        const validFormats = ['wav', 'mp3', 'ogg', 'm4a', 'aac', 'flac'];
        if (!validFormats.includes(audio.format.toLowerCase())) {
            throw new Error(`Invalid audio format: ${audio.format}`);
        }
    }

    /**
     * Validate model data
     */
    validateModelData(model) {
        if (!model.data) {
            throw new Error('Model data is required');
        }

        if (!model.format) {
            throw new Error('Model format is required');
        }

        const validFormats = ['obj', 'fbx', 'gltf', 'glb', 'dae', '3ds', 'blend'];
        if (!validFormats.includes(model.format.toLowerCase())) {
            throw new Error(`Invalid model format: ${model.format}`);
        }

        if (model.vertices !== undefined && model.vertices < 0) {
            throw new Error('Model vertices count cannot be negative');
        }
    }

    /**
     * Validate metadata
     */
    validateMetadata(metadata) {
        if (metadata.quality !== undefined) {
            if (typeof metadata.quality !== 'number' ||
                metadata.quality < 0 || metadata.quality > 1) {
                throw new Error('Quality must be a number between 0 and 1');
            }
        }

        if (metadata.size !== undefined && metadata.size < 0) {
            throw new Error('Size cannot be negative');
        }

        if (metadata.duration !== undefined && metadata.duration < 0) {
            throw new Error('Duration cannot be negative');
        }
    }

    /**
     * Find assets by type
     */
    async findByType(type, options = {}) {
        const query = { type };
        return await this.find(query, options);
    }

    /**
     * Find assets by tags
     */
    async findByTags(tags, options = {}) {
        const query = { tags: { $in: tags } };
        return await this.find(query, options);
    }

    /**
     * Find assets by quality range
     */
    async findByQuality(minQuality = 0, maxQuality = 1, options = {}) {
        const query = {
            'metadata.quality': {
                $gte: minQuality,
                $lte: maxQuality
            }
        };
        return await this.find(query, options);
    }

    /**
     * Find assets by date range
     */
    async findByDateRange(startDate, endDate, options = {}) {
        const query = {
            created_at: {
                $gte: startDate.toISOString(),
                $lte: endDate.toISOString()
            }
        };
        return await this.find(query, options);
    }

    /**
     * Find assets by generator
     */
    async findByGenerator(generatorName, options = {}) {
        const query = { 'metadata.generator': generatorName };
        return await this.find(query, options);
    }

    /**
     * Search assets by name or description
     */
    async search(query, options = {}) {
        const searchQuery = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } },
                { type: { $regex: query, $options: 'i' } }
            ]
        };

        return await this.find(searchQuery, options);
    }

    /**
     * Get assets statistics
     */
    async getAssetStats(options = {}) {
        try {
            const pipeline = [
                {
                    $group: {
                        _id: null,
                        totalAssets: { $sum: 1 },
                        totalSize: { $sum: '$metadata.size' },
                        averageQuality: { $avg: '$metadata.quality' },
                        typeBreakdown: {
                            $push: '$type'
                        },
                        tagBreakdown: {
                            $push: '$tags'
                        },
                        generatorBreakdown: {
                            $push: '$metadata.generator'
                        },
                        oldestAsset: { $min: '$created_at' },
                        newestAsset: { $max: '$created_at' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalAssets: 1,
                        totalSize: 1,
                        averageQuality: 1,
                        typeBreakdown: 1,
                        oldestAsset: 1,
                        newestAsset: 1
                    }
                }
            ];

            const result = await this.aggregate(pipeline, options);

            if (result.success && result.documents && result.documents.length > 0) {
                const stats = result.documents[0];

                // Process type breakdown
                const typeCounts = {};
                stats.typeBreakdown.forEach(type => {
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                });
                stats.typeBreakdown = typeCounts;

                // Process tag breakdown
                const tagCounts = {};
                stats.tagBreakdown.flat().forEach(tag => {
                    if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
                stats.tagBreakdown = tagCounts;

                // Process generator breakdown
                const generatorCounts = {};
                stats.generatorBreakdown.forEach(generator => {
                    if (generator) generatorCounts[generator] = (generatorCounts[generator] || 0) + 1;
                });
                stats.generatorBreakdown = generatorCounts;

                return { success: true, stats };
            } else {
                return {
                    success: true,
                    stats: {
                        totalAssets: 0,
                        totalSize: 0,
                        averageQuality: 0,
                        typeBreakdown: {},
                        tagBreakdown: {},
                        generatorBreakdown: {},
                        oldestAsset: null,
                        newestAsset: null
                    }
                };
            }

        } catch (error) {
            console.error('Error getting asset statistics:', error);
            throw error;
        }
    }

    /**
     * Get assets by quality ranking
     */
    async getTopQualityAssets(limit = 10, options = {}) {
        const queryOptions = {
            sort: { 'metadata.quality': -1, created_at: -1 },
            limit,
            ...options
        };

        return await this.find({}, queryOptions);
    }

    /**
     * Get recently created assets
     */
    async getRecentAssets(limit = 20, options = {}) {
        const queryOptions = {
            sort: { created_at: -1 },
            limit,
            ...options
        };

        return await this.find({}, queryOptions);
    }

    /**
     * Get assets by size range
     */
    async getAssetsBySize(minSize = 0, maxSize = Infinity, options = {}) {
        const query = {
            'metadata.size': {
                $gte: minSize,
                $lte: maxSize
            }
        };

        return await this.find(query, options);
    }

    /**
     * Duplicate an asset
     */
    async duplicateAsset(assetId, modifications = {}) {
        const originalAsset = await this.findById(assetId);
        if (!originalAsset.success) {
            throw new Error(`Asset not found: ${assetId}`);
        }

        const duplicatedAsset = {
            ...originalAsset.document,
            ...modifications,
            id: this.generateAssetId(),
            name: modifications.name || `${originalAsset.document.name} Copy`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: 1,
            duplicated_from: assetId
        };

        // Remove database-specific fields
        delete duplicatedAsset._id;

        return await this.create(duplicatedAsset);
    }

    /**
     * Bulk update assets
     */
    async bulkUpdate(query, updateData, options = {}) {
        // Add bulk operation metadata
        const bulkUpdateData = {
            ...updateData,
            updated_at: new Date().toISOString(),
            bulk_updated: true,
            bulk_update_timestamp: new Date().toISOString()
        };

        return await this.updateMany(query, bulkUpdateData, options);
    }

    /**
     * Archive assets (soft delete)
     */
    async archiveAssets(assetIds, options = {}) {
        const query = { id: { $in: assetIds } };
        const updateData = {
            archived: true,
            archived_at: new Date().toISOString(),
            archived_by: options.userId || 'system'
        };

        return await this.bulkUpdate(query, updateData, options);
    }

    /**
     * Unarchive assets
     */
    async unarchiveAssets(assetIds, options = {}) {
        const query = { id: { $in: assetIds } };
        const updateData = {
            archived: false,
            unarchived_at: new Date().toISOString(),
            unarchived_by: options.userId || 'system',
            $unset: { archived_at: 1, archived_by: 1 }
        };

        return await this.bulkUpdate(query, updateData, options);
    }

    /**
     * Get archived assets
     */
    async getArchivedAssets(options = {}) {
        const query = { archived: true };
        return await this.find(query, options);
    }

    /**
     * Permanently delete archived assets older than specified date
     */
    async cleanupArchivedAssets(olderThanDate, options = {}) {
        const query = {
            archived: true,
            archived_at: { $lt: olderThanDate.toISOString() }
        };

        return await this.deleteMany(query, options);
    }

    /**
     * Add tags to assets
     */
    async addTags(assetIds, tags, options = {}) {
        const query = { id: { $in: assetIds } };
        const updateData = {
            $addToSet: { tags: { $each: tags } }
        };

        return await this.updateMany(query, updateData, options);
    }

    /**
     * Remove tags from assets
     */
    async removeTags(assetIds, tags, options = {}) {
        const query = { id: { $in: assetIds } };
        const updateData = {
            $pullAll: { tags: tags }
        };

        return await this.updateMany(query, updateData, options);
    }

    /**
     * Get assets with specific tags
     */
    async getAssetsWithTags(tags, options = {}) {
        const query = { tags: { $all: tags } };
        return await this.find(query, options);
    }

    /**
     * Get assets without specific tags
     */
    async getAssetsWithoutTags(tags, options = {}) {
        const query = { tags: { $nin: tags } };
        return await this.find(query, options);
    }

    /**
     * Update asset quality score
     */
    async updateQualityScore(assetId, qualityScore, options = {}) {
        if (qualityScore < 0 || qualityScore > 1) {
            throw new Error('Quality score must be between 0 and 1');
        }

        const updateData = {
            'metadata.quality': qualityScore,
            'metadata.quality_updated_at': new Date().toISOString(),
            'metadata.quality_updated_by': options.userId || 'system'
        };

        return await this.update(assetId, updateData, options);
    }

    /**
     * Get assets by quality threshold
     */
    async getAssetsByQualityThreshold(minQuality = 0.8, options = {}) {
        const query = {
            'metadata.quality': { $gte: minQuality }
        };

        return await this.find(query, options);
    }

    /**
     * Export assets to different format
     */
    async exportAssets(assetIds, format, options = {}) {
        const assets = await this.find({ id: { $in: assetIds } });

        if (!assets.success) {
            throw new Error('Failed to find assets for export');
        }

        const exportData = {
            format,
            exported_at: new Date().toISOString(),
            exported_by: options.userId || 'system',
            assets: assets.documents.map(asset => ({
                id: asset.id,
                name: asset.name,
                type: asset.type,
                data: asset.sprite || asset.audio || asset.model,
                metadata: asset.metadata
            }))
        };

        return exportData;
    }

    /**
     * Import assets from export data
     */
    async importAssets(exportData, options = {}) {
        if (!exportData.assets || !Array.isArray(exportData.assets)) {
            throw new Error('Invalid export data format');
        }

        const results = [];
        const transaction = options.transaction || await this.beginTransaction();

        try {
            for (const assetData of exportData.assets) {
                // Prepare asset for import
                const importedAsset = {
                    ...assetData,
                    id: this.generateAssetId(),
                    imported_at: new Date().toISOString(),
                    imported_from: exportData.exported_at,
                    imported_by: options.userId || 'system'
                };

                // Remove any existing database fields
                delete importedAsset._id;

                const result = await this.create(importedAsset, { transaction });
                results.push(result);
            }

            if (!options.transaction) {
                await this.commitTransaction(transaction);
            }

            return {
                success: true,
                imported: results.length,
                results
            };

        } catch (error) {
            if (!options.transaction) {
                await this.rollbackTransaction(transaction);
            }
            throw error;
        }
    }

    /**
     * Get asset usage statistics
     */
    async getUsageStats(timeframe = '30d', options = {}) {
        const endDate = new Date();
        const startDate = new Date();

        // Calculate start date based on timeframe
        switch (timeframe) {
            case '1d':
                startDate.setDate(endDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        const pipeline = [
            {
                $match: {
                    created_at: {
                        $gte: startDate.toISOString(),
                        $lte: endDate.toISOString()
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: { $dateFromString: { dateString: '$created_at' } }
                        }
                    },
                    count: { $sum: 1 },
                    types: { $addToSet: '$type' },
                    totalSize: { $sum: '$metadata.size' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ];

        const result = await this.aggregate(pipeline, options);

        if (result.success) {
            return {
                success: true,
                timeframe,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                data: result.documents
            };
        } else {
            throw new Error('Failed to get usage statistics');
        }
    }

    /**
     * Generate unique asset ID
     */
    generateAssetId() {
        return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize asset indexes
     */
    async initializeIndexes() {
        try {
            for (const index of this.indexes) {
                await this.createIndex(index);
            }

            console.log('Asset repository indexes initialized');
        } catch (error) {
            console.error('Error initializing asset indexes:', error);
        }
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        // Call parent cleanup
        await super.cleanup();

        // Additional asset-specific cleanup
        console.log('Asset repository cleaned up');
    }
}

module.exports = AssetRepository;
