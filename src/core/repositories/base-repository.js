/**
 * TPT Asset Editor Desktop - Base Repository Class
 * Provides common data access patterns and database abstraction
 */

const EventEmitter = require('events');

class BaseRepository extends EventEmitter {
    constructor(collectionName, databaseManager) {
        super();

        this.collectionName = collectionName;
        this.db = databaseManager;
        this.cache = new Map();
        this.cacheEnabled = true;
        this.cacheMaxSize = 500;
        this.queryCache = new Map();
        this.queryCacheMaxSize = 100;
    }

    /**
     * Find documents with optional filtering, sorting, and pagination
     */
    async find(query = {}, options = {}) {
        try {
            // Check query cache first
            if (this.cacheEnabled && !options.skipCache) {
                const cacheKey = this.getQueryCacheKey(query, options);
                const cachedResult = this.queryCache.get(cacheKey);
                if (cachedResult && this.isCacheValid(cachedResult.timestamp)) {
                    return cachedResult.data;
                }
            }

            const result = await this.db.find(this.collectionName, query, options);

            if (result.success) {
                const documents = result.documents || [];

                // Cache individual documents
                if (this.cacheEnabled && !options.skipCache) {
                    documents.forEach(doc => {
                        this.cache.set(doc.id || doc._id, doc);
                    });
                    this.maintainCacheSize();

                    // Cache query result
                    const cacheKey = this.getQueryCacheKey(query, options);
                    this.queryCache.set(cacheKey, {
                        data: result,
                        timestamp: Date.now()
                    });
                    this.maintainQueryCacheSize();
                }

                this.emit('find', { query, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Find operation failed');
            }

        } catch (error) {
            console.error(`Error finding documents in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Find a single document by ID
     */
    async findById(id, options = {}) {
        try {
            // Check cache first
            if (this.cacheEnabled && !options.skipCache) {
                const cachedDoc = this.cache.get(id);
                if (cachedDoc) {
                    return { success: true, document: cachedDoc };
                }
            }

            const result = await this.db.findById(this.collectionName, id, options);

            if (result.success && result.document) {
                // Cache the document
                if (this.cacheEnabled && !options.skipCache) {
                    this.cache.set(id, result.document);
                    this.maintainCacheSize();
                }

                this.emit('findById', { id, options, result });
                return result;
            } else {
                return { success: false, error: result.error || 'Document not found' };
            }

        } catch (error) {
            console.error(`Error finding document by ID in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Find one document matching the query
     */
    async findOne(query = {}, options = {}) {
        try {
            const result = await this.db.findOne(this.collectionName, query, options);

            if (result.success) {
                this.emit('findOne', { query, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Find one operation failed');
            }

        } catch (error) {
            console.error(`Error finding one document in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Create a new document
     */
    async create(document, options = {}) {
        try {
            // Validate document before creation
            await this.validateDocument(document, 'create');

            // Set creation metadata
            const now = new Date().toISOString();
            document.created_at = document.created_at || now;
            document.updated_at = document.updated_at || now;
            document.version = document.version || 1;

            const result = await this.db.create(this.collectionName, document, options);

            if (result.success) {
                // Cache the new document
                if (this.cacheEnabled && !options.skipCache && result.document) {
                    this.cache.set(result.document.id || result.document._id, result.document);
                    this.maintainCacheSize();
                }

                // Invalidate relevant query caches
                this.invalidateQueryCache();

                this.emit('create', { document, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Create operation failed');
            }

        } catch (error) {
            console.error(`Error creating document in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Update an existing document
     */
    async update(id, updateData, options = {}) {
        try {
            // Get existing document for validation
            const existingResult = await this.findById(id);
            if (!existingResult.success) {
                throw new Error(`Document not found: ${id}`);
            }

            // Validate update data
            await this.validateDocument(updateData, 'update', existingResult.document);

            // Set update metadata
            updateData.updated_at = new Date().toISOString();
            updateData.version = (existingResult.document.version || 1) + 1;

            const result = await this.db.update(this.collectionName, id, updateData, options);

            if (result.success) {
                // Update cache
                if (this.cacheEnabled && !options.skipCache && result.document) {
                    this.cache.set(id, result.document);
                }

                // Invalidate relevant query caches
                this.invalidateQueryCache();

                this.emit('update', { id, updateData, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Update operation failed');
            }

        } catch (error) {
            console.error(`Error updating document in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Update multiple documents
     */
    async updateMany(query, updateData, options = {}) {
        try {
            // Validate update data
            await this.validateDocument(updateData, 'updateMany');

            // Set update metadata for each document
            updateData.updated_at = new Date().toISOString();

            const result = await this.db.updateMany(this.collectionName, query, updateData, options);

            if (result.success) {
                // Clear affected cache entries
                if (this.cacheEnabled) {
                    // This is a simplified approach - in practice, you'd want to be more selective
                    this.invalidateQueryCache();
                }

                this.emit('updateMany', { query, updateData, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Update many operation failed');
            }

        } catch (error) {
            console.error(`Error updating multiple documents in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Delete a document by ID
     */
    async delete(id, options = {}) {
        try {
            // Get document before deletion for cleanup
            const documentResult = await this.findById(id);
            if (!documentResult.success) {
                throw new Error(`Document not found: ${id}`);
            }

            const result = await this.db.delete(this.collectionName, id, options);

            if (result.success) {
                // Remove from cache
                if (this.cacheEnabled) {
                    this.cache.delete(id);
                }

                // Invalidate query cache
                this.invalidateQueryCache();

                this.emit('delete', { id, options, result, document: documentResult.document });
                return result;
            } else {
                throw new Error(result.error || 'Delete operation failed');
            }

        } catch (error) {
            console.error(`Error deleting document in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Delete multiple documents
     */
    async deleteMany(query, options = {}) {
        try {
            const result = await this.db.deleteMany(this.collectionName, query, options);

            if (result.success) {
                // Clear cache (simplified - should be more selective in production)
                if (this.cacheEnabled) {
                    this.invalidateQueryCache();
                }

                this.emit('deleteMany', { query, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Delete many operation failed');
            }

        } catch (error) {
            console.error(`Error deleting multiple documents in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Count documents matching a query
     */
    async count(query = {}, options = {}) {
        try {
            const result = await this.db.count(this.collectionName, query, options);

            if (result.success) {
                this.emit('count', { query, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Count operation failed');
            }

        } catch (error) {
            console.error(`Error counting documents in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Check if a document exists
     */
    async exists(query = {}, options = {}) {
        try {
            const countResult = await this.count(query, options);
            return countResult.success && countResult.count > 0;
        } catch (error) {
            console.error(`Error checking document existence in ${this.collectionName}:`, error);
            return false;
        }
    }

    /**
     * Get distinct values for a field
     */
    async distinct(field, query = {}, options = {}) {
        try {
            const result = await this.db.distinct(this.collectionName, field, query, options);

            if (result.success) {
                this.emit('distinct', { field, query, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Distinct operation failed');
            }

        } catch (error) {
            console.error(`Error getting distinct values in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Perform aggregation operations
     */
    async aggregate(pipeline, options = {}) {
        try {
            const result = await this.db.aggregate(this.collectionName, pipeline, options);

            if (result.success) {
                this.emit('aggregate', { pipeline, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Aggregate operation failed');
            }

        } catch (error) {
            console.error(`Error performing aggregation in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Create indexes for better query performance
     */
    async createIndex(keys, options = {}) {
        try {
            const result = await this.db.createIndex(this.collectionName, keys, options);

            if (result.success) {
                this.emit('createIndex', { keys, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Create index operation failed');
            }

        } catch (error) {
            console.error(`Error creating index in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Get collection statistics
     */
    async getStats(options = {}) {
        try {
            const result = await this.db.getCollectionStats(this.collectionName, options);

            if (result.success) {
                this.emit('getStats', { options, result });
                return result;
            } else {
                throw new Error(result.error || 'Get stats operation failed');
            }

        } catch (error) {
            console.error(`Error getting collection stats for ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Validate document data
     */
    async validateDocument(document, operation = 'create', existingDocument = null) {
        // Basic validation - can be overridden by subclasses
        if (!document || typeof document !== 'object') {
            throw new Error('Document must be a valid object');
        }

        // Call custom validation if implemented
        if (this.customValidation) {
            await this.customValidation(document, operation, existingDocument);
        }

        return true;
    }

    /**
     * Get query cache key
     */
    getQueryCacheKey(query, options) {
        return JSON.stringify({
            collection: this.collectionName,
            query,
            options: {
                sort: options.sort,
                limit: options.limit,
                skip: options.skip,
                projection: options.projection
            }
        });
    }

    /**
     * Check if cache entry is still valid
     */
    isCacheValid(timestamp, maxAge = 300000) { // 5 minutes default
        return (Date.now() - timestamp) < maxAge;
    }

    /**
     * Maintain cache size
     */
    maintainCacheSize() {
        if (this.cache.size > this.cacheMaxSize) {
            // Remove oldest entries (simple LRU approximation)
            const entries = Array.from(this.cache.entries());
            const toRemove = entries.slice(0, this.cache.size - this.cacheMaxSize);

            toRemove.forEach(([key]) => {
                this.cache.delete(key);
            });
        }
    }

    /**
     * Maintain query cache size
     */
    maintainQueryCacheSize() {
        if (this.queryCache.size > this.queryCacheMaxSize) {
            // Remove oldest entries
            const entries = Array.from(this.queryCache.entries());
            const toRemove = entries.slice(0, this.queryCache.size - this.queryCacheMaxSize);

            toRemove.forEach(([key]) => {
                this.queryCache.delete(key);
            });
        }
    }

    /**
     * Invalidate query cache
     */
    invalidateQueryCache() {
        this.queryCache.clear();
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.cache.clear();
        this.queryCache.clear();
        this.emit('cacheCleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            documentCache: {
                size: this.cache.size,
                maxSize: this.cacheMaxSize
            },
            queryCache: {
                size: this.queryCache.size,
                maxSize: this.queryCacheMaxSize
            }
        };
    }

    /**
     * Set cache settings
     */
    setCacheSettings(enabled, maxSize, queryMaxSize) {
        this.cacheEnabled = enabled;
        this.cacheMaxSize = maxSize || this.cacheMaxSize;
        this.queryCacheMaxSize = queryMaxSize || this.queryCacheMaxSize;

        if (!enabled) {
            this.clearCache();
        } else {
            this.maintainCacheSize();
            this.maintainQueryCacheSize();
        }
    }

    /**
     * Begin a transaction (if supported by the database)
     */
    async beginTransaction(options = {}) {
        try {
            const result = await this.db.beginTransaction(options);

            if (result.success) {
                this.emit('transactionBegin', { options, result });
                return result.transaction;
            } else {
                throw new Error(result.error || 'Begin transaction failed');
            }

        } catch (error) {
            console.error(`Error beginning transaction in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Commit a transaction
     */
    async commitTransaction(transaction, options = {}) {
        try {
            const result = await this.db.commitTransaction(transaction, options);

            if (result.success) {
                this.emit('transactionCommit', { transaction, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Commit transaction failed');
            }

        } catch (error) {
            console.error(`Error committing transaction in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Rollback a transaction
     */
    async rollbackTransaction(transaction, options = {}) {
        try {
            const result = await this.db.rollbackTransaction(transaction, options);

            if (result.success) {
                this.emit('transactionRollback', { transaction, options, result });
                return result;
            } else {
                throw new Error(result.error || 'Rollback transaction failed');
            }

        } catch (error) {
            console.error(`Error rolling back transaction in ${this.collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        this.clearCache();
        this.removeAllListeners();
        console.log(`Repository ${this.collectionName} cleaned up`);
    }
}

module.exports = BaseRepository;
