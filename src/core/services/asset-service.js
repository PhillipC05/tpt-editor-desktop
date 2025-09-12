/**
 * TPT Asset Editor Desktop - Asset Service
 * Business logic layer for asset operations
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

class AssetService extends EventEmitter {
    constructor(databaseManager, fileSystemService) {
        super();

        this.db = databaseManager;
        this.fs = fileSystemService;
        this.assetCache = new Map();
        this.cacheEnabled = true;
        this.maxCacheSize = 1000;
    }

    /**
     * Create a new asset
     */
    async createAsset(assetData, options = {}) {
        try {
            // Validate asset data
            await this.validateAssetData(assetData);

            // Generate unique ID if not provided
            if (!assetData.id) {
                assetData.id = this.generateAssetId();
            }

            // Set creation metadata
            assetData.created_at = new Date().toISOString();
            assetData.updated_at = assetData.created_at;
            assetData.version = 1;

            // Save to database
            const result = await this.db.saveAsset(assetData);

            if (result.success) {
                // Cache the asset
                if (this.cacheEnabled) {
                    this.assetCache.set(assetData.id, assetData);
                    this.maintainCacheSize();
                }

                // Emit creation event
                this.emit('assetCreated', {
                    asset: assetData,
                    options
                });

                return result.asset;
            } else {
                throw new Error(result.error || 'Failed to create asset');
            }

        } catch (error) {
            console.error('Error creating asset:', error);
            throw error;
        }
    }

    /**
     * Update an existing asset
     */
    async updateAsset(assetId, updateData, options = {}) {
        try {
            // Get existing asset
            const existingAsset = await this.getAsset(assetId);
            if (!existingAsset) {
                throw new Error(`Asset not found: ${assetId}`);
            }

            // Merge update data
            const updatedAsset = {
                ...existingAsset,
                ...updateData,
                id: assetId, // Ensure ID doesn't change
                updated_at: new Date().toISOString(),
                version: (existingAsset.version || 1) + 1
            };

            // Validate updated asset
            await this.validateAssetData(updatedAsset);

            // Save to database
            const result = await this.db.updateAsset(assetId, updatedAsset);

            if (result.success) {
                // Update cache
                if (this.cacheEnabled) {
                    this.assetCache.set(assetId, updatedAsset);
                }

                // Emit update event
                this.emit('assetUpdated', {
                    asset: updatedAsset,
                    previousAsset: existingAsset,
                    options
                });

                return updatedAsset;
            } else {
                throw new Error(result.error || 'Failed to update asset');
            }

        } catch (error) {
            console.error('Error updating asset:', error);
            throw error;
        }
    }

    /**
     * Get asset by ID
     */
    async getAsset(assetId, options = {}) {
        try {
            // Check cache first
            if (this.cacheEnabled && !options.skipCache) {
                const cachedAsset = this.assetCache.get(assetId);
                if (cachedAsset) {
                    return cachedAsset;
                }
            }

            // Fetch from database
            const result = await this.db.getAsset(assetId);

            if (result.success && result.asset) {
                // Cache the asset
                if (this.cacheEnabled) {
                    this.assetCache.set(assetId, result.asset);
                }

                return result.asset;
            } else {
                return null;
            }

        } catch (error) {
            console.error('Error getting asset:', error);
            throw error;
        }
    }

    /**
     * Get multiple assets with filtering and pagination
     */
    async getAssets(query = {}, options = {}) {
        try {
            const result = await this.db.getAssets(query, options);

            if (result.success) {
                const assets = result.assets || [];

                // Cache assets if enabled
                if (this.cacheEnabled && !options.skipCache) {
                    assets.forEach(asset => {
                        this.assetCache.set(asset.id, asset);
                    });
                    this.maintainCacheSize();
                }

                return {
                    assets,
                    total: result.total || assets.length,
                    page: options.page || 1,
                    limit: options.limit || assets.length
                };
            } else {
                throw new Error(result.error || 'Failed to get assets');
            }

        } catch (error) {
            console.error('Error getting assets:', error);
            throw error;
        }
    }

    /**
     * Delete asset
     */
    async deleteAsset(assetId, options = {}) {
        try {
            // Get asset before deletion for cleanup
            const asset = await this.getAsset(assetId);

            if (!asset) {
                throw new Error(`Asset not found: ${assetId}`);
            }

            // Delete from database
            const result = await this.db.deleteAsset(assetId);

            if (result.success) {
                // Remove from cache
                if (this.cacheEnabled) {
                    this.assetCache.delete(assetId);
                }

                // Clean up associated files if requested
                if (options.deleteFiles && asset.filePath) {
                    await this.cleanupAssetFiles(asset);
                }

                // Emit deletion event
                this.emit('assetDeleted', {
                    assetId,
                    asset,
                    options
                });

                return true;
            } else {
                throw new Error(result.error || 'Failed to delete asset');
            }

        } catch (error) {
            console.error('Error deleting asset:', error);
            throw error;
        }
    }

    /**
     * Duplicate asset
     */
    async duplicateAsset(assetId, modifications = {}, options = {}) {
        try {
            const originalAsset = await this.getAsset(assetId);

            if (!originalAsset) {
                throw new Error(`Asset not found: ${assetId}`);
            }

            // Create duplicate with modifications
            const duplicateAsset = {
                ...originalAsset,
                ...modifications,
                id: this.generateAssetId(),
                name: modifications.name || `${originalAsset.name} Copy`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                version: 1,
                duplicated_from: assetId
            };

            // Remove database-specific fields
            delete duplicateAsset._id;

            return await this.createAsset(duplicateAsset, options);

        } catch (error) {
            console.error('Error duplicating asset:', error);
            throw error;
        }
    }

    /**
     * Search assets
     */
    async searchAssets(searchQuery, options = {}) {
        try {
            const query = {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { type: { $regex: searchQuery, $options: 'i' } },
                    { tags: { $in: [new RegExp(searchQuery, 'i')] } },
                    { description: { $regex: searchQuery, $options: 'i' } }
                ]
            };

            return await this.getAssets(query, options);

        } catch (error) {
            console.error('Error searching assets:', error);
            throw error;
        }
    }

    /**
     * Export asset to file
     */
    async exportAsset(assetId, exportPath, format = 'png', options = {}) {
        try {
            const asset = await this.getAsset(assetId);

            if (!asset) {
                throw new Error(`Asset not found: ${assetId}`);
            }

            let exportData;
            let fileName;

            // Prepare export data based on asset type
            if (asset.sprite) {
                exportData = Buffer.from(asset.sprite.data, 'base64');
                fileName = `${asset.name}.${format}`;
            } else if (asset.audio) {
                exportData = Buffer.from(asset.audio.data, 'base64');
                fileName = `${asset.name}.${format}`;
            } else {
                throw new Error(`Unsupported asset type for export: ${asset.type}`);
            }

            // Ensure export directory exists
            await this.fs.ensureDirectory(path.dirname(exportPath));

            // Write file
            const fullPath = path.join(exportPath, fileName);
            await fs.writeFile(fullPath, exportData);

            // Update asset metadata
            await this.updateAsset(assetId, {
                last_exported: new Date().toISOString(),
                export_path: fullPath,
                export_format: format
            });

            this.emit('assetExported', {
                assetId,
                asset,
                exportPath: fullPath,
                format
            });

            return fullPath;

        } catch (error) {
            console.error('Error exporting asset:', error);
            throw error;
        }
    }

    /**
     * Import asset from file
     */
    async importAsset(filePath, metadata = {}, options = {}) {
        try {
            // Read file
            const fileData = await fs.readFile(filePath);
            const fileName = path.basename(filePath);
            const fileExt = path.extname(filePath).toLowerCase();

            // Determine asset type from file extension
            const assetType = this.determineAssetTypeFromExtension(fileExt);

            // Create asset data
            const assetData = {
                name: metadata.name || fileName.replace(/\.[^/.]+$/, ''),
                type: assetType,
                ...metadata,
                filePath: filePath,
                fileSize: fileData.length,
                imported_at: new Date().toISOString()
            };

            // Process file data based on type
            if (assetType === 'sprite' || assetType === 'character' || assetType === 'monster') {
                assetData.sprite = {
                    data: fileData.toString('base64'),
                    format: fileExt.slice(1),
                    width: metadata.width || 64,
                    height: metadata.height || 64
                };
            } else if (assetType === 'sfx' || assetType === 'music' || assetType === 'ambient') {
                assetData.audio = {
                    data: fileData.toString('base64'),
                    format: fileExt.slice(1),
                    sampleRate: metadata.sampleRate || 44100,
                    channels: metadata.channels || 1,
                    duration: metadata.duration || 1.0
                };
            }

            return await this.createAsset(assetData, options);

        } catch (error) {
            console.error('Error importing asset:', error);
            throw error;
        }
    }

    /**
     * Batch export assets
     */
    async batchExport(assetIds, exportPath, format = 'png', options = {}) {
        try {
            const results = [];
            const total = assetIds.length;

            this.emit('batchExportStart', { assetIds, exportPath, format });

            for (let i = 0; i < total; i++) {
                const assetId = assetIds[i];

                try {
                    const exportResult = await this.exportAsset(assetId, exportPath, format, options);
                    results.push({
                        success: true,
                        assetId,
                        exportPath: exportResult
                    });
                } catch (error) {
                    results.push({
                        success: false,
                        assetId,
                        error: error.message
                    });
                }

                // Emit progress
                this.emit('batchExportProgress', {
                    completed: i + 1,
                    total,
                    currentAssetId: assetId
                });
            }

            this.emit('batchExportComplete', {
                results,
                exportPath,
                format,
                successCount: results.filter(r => r.success).length,
                totalCount: total
            });

            return results;

        } catch (error) {
            console.error('Error in batch export:', error);
            throw error;
        }
    }

    /**
     * Get asset statistics
     */
    async getAssetStatistics(options = {}) {
        try {
            const result = await this.db.getAssetStatistics(options);

            if (result.success) {
                return result.statistics;
            } else {
                throw new Error(result.error || 'Failed to get asset statistics');
            }

        } catch (error) {
            console.error('Error getting asset statistics:', error);
            throw error;
        }
    }

    /**
     * Validate asset data
     */
    async validateAssetData(assetData) {
        if (!assetData.name || assetData.name.trim().length === 0) {
            throw new Error('Asset name is required');
        }

        if (!assetData.type) {
            throw new Error('Asset type is required');
        }

        // Type-specific validation
        if (assetData.sprite) {
            if (!assetData.sprite.data) {
                throw new Error('Sprite data is required');
            }
            if (!assetData.sprite.width || !assetData.sprite.height) {
                throw new Error('Sprite dimensions are required');
            }
        }

        if (assetData.audio) {
            if (!assetData.audio.data) {
                throw new Error('Audio data is required');
            }
            if (!assetData.audio.sampleRate) {
                throw new Error('Audio sample rate is required');
            }
        }

        return true;
    }

    /**
     * Generate unique asset ID
     */
    generateAssetId() {
        return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Determine asset type from file extension
     */
    determineAssetTypeFromExtension(extension) {
        const typeMap = {
            '.png': 'sprite',
            '.jpg': 'sprite',
            '.jpeg': 'sprite',
            '.gif': 'sprite',
            '.bmp': 'sprite',
            '.wav': 'sfx',
            '.mp3': 'music',
            '.ogg': 'ambient',
            '.m4a': 'music',
            '.aac': 'music'
        };

        return typeMap[extension] || 'unknown';
    }

    /**
     * Clean up asset files
     */
    async cleanupAssetFiles(asset) {
        try {
            if (asset.filePath && await this.fs.fileExists(asset.filePath)) {
                await fs.unlink(asset.filePath);
            }

            if (asset.export_path && await this.fs.fileExists(asset.export_path)) {
                await fs.unlink(asset.export_path);
            }
        } catch (error) {
            console.warn('Error cleaning up asset files:', error);
        }
    }

    /**
     * Maintain cache size
     */
    maintainCacheSize() {
        if (this.assetCache.size > this.maxCacheSize) {
            // Remove oldest entries (simple LRU approximation)
            const entries = Array.from(this.assetCache.entries());
            const toRemove = entries.slice(0, this.assetCache.size - this.maxCacheSize);

            toRemove.forEach(([key]) => {
                this.assetCache.delete(key);
            });
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.assetCache.clear();
        this.emit('cacheCleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.assetCache.size,
            maxSize: this.maxCacheSize,
            enabled: this.cacheEnabled
        };
    }

    /**
     * Set cache settings
     */
    setCacheSettings(enabled, maxSize) {
        this.cacheEnabled = enabled;
        this.maxCacheSize = maxSize;

        if (!enabled) {
            this.clearCache();
        } else {
            this.maintainCacheSize();
        }
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        this.clearCache();
        this.removeAllListeners();
        console.log('Asset service cleaned up');
    }
}

module.exports = AssetService;
