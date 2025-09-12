/**
 * Asset Cache - High-performance caching system for generated assets
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

class AssetCache {
    constructor(options = {}) {
        this.cacheDir = options.cacheDir || path.join(app.getPath('userData'), 'cache', 'assets');
        this.maxCacheSize = options.maxCacheSize || 1024 * 1024 * 1024; // 1GB default
        this.maxFileAge = options.maxFileAge || 30 * 24 * 60 * 60 * 1000; // 30 days
        this.compressionEnabled = options.compressionEnabled !== false;
        this.encryptionEnabled = options.encryptionEnabled || false;

        this.cacheIndex = new Map();
        this.memoryCache = new Map();
        this.maxMemoryCacheSize = options.maxMemoryCacheSize || 100 * 1024 * 1024; // 100MB
        this.currentMemorySize = 0;

        this.isInitialized = false;
        this.cleanupInterval = null;
    }

    /**
     * Initialize the cache system
     */
    async initialize() {
        try {
            // Ensure cache directory exists
            await fs.mkdir(this.cacheDir, { recursive: true });

            // Load cache index
            await this.loadCacheIndex();

            // Start cleanup interval
            this.startCleanupInterval();

            this.isInitialized = true;
            console.log('Asset cache initialized successfully');

        } catch (error) {
            console.error('Failed to initialize asset cache:', error);
            throw error;
        }
    }

    /**
     * Load cache index from disk
     */
    async loadCacheIndex() {
        try {
            const indexPath = path.join(this.cacheDir, 'cache-index.json');

            try {
                await fs.access(indexPath);
                const indexData = await fs.readFile(indexPath, 'utf8');
                const index = JSON.parse(indexData);

                // Validate and load cache entries
                for (const [key, entry] of Object.entries(index.entries || {})) {
                    if (await this.validateCacheEntry(entry)) {
                        this.cacheIndex.set(key, entry);
                    }
                }

                console.log(`Loaded ${this.cacheIndex.size} cache entries`);

            } catch {
                // Index file doesn't exist or is corrupted, create new one
                console.log('Creating new cache index');
            }

        } catch (error) {
            console.error('Failed to load cache index:', error);
        }
    }

    /**
     * Validate cache entry
     */
    async validateCacheEntry(entry) {
        try {
            // Check if file exists
            await fs.access(entry.filePath);

            // Check if file is not too old
            const fileAge = Date.now() - entry.createdAt;
            if (fileAge > this.maxFileAge) {
                return false;
            }

            // Check file size
            const stats = await fs.stat(entry.filePath);
            if (stats.size !== entry.size) {
                return false;
            }

            return true;

        } catch {
            return false;
        }
    }

    /**
     * Generate cache key from asset configuration
     */
    generateCacheKey(assetType, config) {
        const configString = JSON.stringify({
            type: assetType,
            config: this.normalizeConfig(config)
        }, Object.keys(config).sort());

        return crypto.createHash('sha256').update(configString).digest('hex');
    }

    /**
     * Normalize configuration for consistent caching
     */
    normalizeConfig(config) {
        if (!config || typeof config !== 'object') return {};

        const normalized = { ...config };

        // Remove volatile properties
        delete normalized.timestamp;
        delete normalized.randomSeed;
        delete normalized.sessionId;

        // Sort object keys for consistency
        return this.sortObjectKeys(normalized);
    }

    /**
     * Sort object keys recursively
     */
    sortObjectKeys(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObjectKeys(item));
        }

        const sorted = {};
        const keys = Object.keys(obj).sort();

        for (const key of keys) {
            sorted[key] = this.sortObjectKeys(obj[key]);
        }

        return sorted;
    }

    /**
     * Check if asset is cached
     */
    async isCached(assetType, config) {
        const cacheKey = this.generateCacheKey(assetType, config);
        return this.cacheIndex.has(cacheKey);
    }

    /**
     * Get cached asset
     */
    async getCachedAsset(assetType, config) {
        const cacheKey = this.generateCacheKey(assetType, config);

        // Check memory cache first
        if (this.memoryCache.has(cacheKey)) {
            const cached = this.memoryCache.get(cacheKey);
            cached.lastAccessed = Date.now();
            return cached.data;
        }

        // Check disk cache
        const entry = this.cacheIndex.get(cacheKey);
        if (!entry) {
            return null;
        }

        try {
            // Read cached file
            let data = await fs.readFile(entry.filePath);

            // Decompress if needed
            if (entry.compressed) {
                data = await this.decompress(data);
            }

            // Decrypt if needed
            if (entry.encrypted) {
                data = await this.decrypt(data, entry.encryptionKey);
            }

            // Parse JSON data
            const assetData = JSON.parse(data.toString());

            // Update access time
            entry.lastAccessed = Date.now();
            await this.saveCacheIndex();

            // Add to memory cache if not too large
            if (data.length <= this.maxMemoryCacheSize * 0.1) { // Max 10% of memory cache
                this.addToMemoryCache(cacheKey, assetData, data.length);
            }

            return assetData;

        } catch (error) {
            console.error('Failed to read cached asset:', error);
            // Remove invalid cache entry
            this.cacheIndex.delete(cacheKey);
            await this.saveCacheIndex();
            return null;
        }
    }

    /**
     * Cache asset
     */
    async cacheAsset(assetType, config, data) {
        const cacheKey = this.generateCacheKey(assetType, config);

        try {
            // Prepare data for storage
            let processedData = JSON.stringify(data);
            let buffer = Buffer.from(processedData);

            // Compress if enabled
            let compressed = false;
            if (this.compressionEnabled && buffer.length > 1024) { // Only compress larger files
                buffer = await this.compress(buffer);
                compressed = true;
            }

            // Encrypt if enabled
            let encrypted = false;
            let encryptionKey = null;
            if (this.encryptionEnabled) {
                const result = await this.encrypt(buffer);
                buffer = result.data;
                encryptionKey = result.key;
                encrypted = true;
            }

            // Generate file path
            const fileName = `${cacheKey}.cache`;
            const filePath = path.join(this.cacheDir, fileName);

            // Write to disk
            await fs.writeFile(filePath, buffer);

            // Create cache entry
            const entry = {
                key: cacheKey,
                assetType,
                config: this.normalizeConfig(config),
                filePath,
                size: buffer.length,
                originalSize: processedData.length,
                compressed,
                encrypted,
                encryptionKey,
                createdAt: Date.now(),
                lastAccessed: Date.now(),
                accessCount: 1
            };

            // Add to cache index
            this.cacheIndex.set(cacheKey, entry);
            await this.saveCacheIndex();

            // Add to memory cache
            this.addToMemoryCache(cacheKey, data, processedData.length);

            // Check cache size limits
            await this.enforceCacheLimits();

            console.log(`Asset cached: ${cacheKey} (${(buffer.length / 1024).toFixed(2)} KB)`);

        } catch (error) {
            console.error('Failed to cache asset:', error);
            throw error;
        }
    }

    /**
     * Add data to memory cache
     */
    addToMemoryCache(key, data, size) {
        // Remove old entries if needed
        while (this.currentMemorySize + size > this.maxMemoryCacheSize && this.memoryCache.size > 0) {
            const oldestKey = this.memoryCache.keys().next().value;
            const oldestEntry = this.memoryCache.get(oldestKey);
            this.currentMemorySize -= oldestEntry.size;
            this.memoryCache.delete(oldestKey);
        }

        // Add new entry
        this.memoryCache.set(key, {
            data,
            size,
            lastAccessed: Date.now()
        });

        this.currentMemorySize += size;
    }

    /**
     * Remove asset from cache
     */
    async removeFromCache(assetType, config) {
        const cacheKey = this.generateCacheKey(assetType, config);

        // Remove from memory cache
        if (this.memoryCache.has(cacheKey)) {
            const entry = this.memoryCache.get(cacheKey);
            this.currentMemorySize -= entry.size;
            this.memoryCache.delete(cacheKey);
        }

        // Remove from disk cache
        const entry = this.cacheIndex.get(cacheKey);
        if (entry) {
            try {
                await fs.unlink(entry.filePath);
            } catch (error) {
                console.error('Failed to remove cache file:', error);
            }

            this.cacheIndex.delete(cacheKey);
            await this.saveCacheIndex();
        }
    }

    /**
     * Clear entire cache
     */
    async clearCache() {
        try {
            // Clear memory cache
            this.memoryCache.clear();
            this.currentMemorySize = 0;

            // Clear disk cache
            for (const [key, entry] of this.cacheIndex) {
                try {
                    await fs.unlink(entry.filePath);
                } catch (error) {
                    console.error(`Failed to remove cache file ${entry.filePath}:`, error);
                }
            }

            this.cacheIndex.clear();
            await this.saveCacheIndex();

            console.log('Cache cleared successfully');

        } catch (error) {
            console.error('Failed to clear cache:', error);
            throw error;
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStatistics() {
        const stats = {
            totalEntries: this.cacheIndex.size,
            memoryCacheEntries: this.memoryCache.size,
            memoryCacheSize: this.currentMemorySize,
            diskCacheSize: 0,
            oldestEntry: null,
            newestEntry: null,
            mostAccessed: null,
            leastAccessed: null
        };

        let maxAccessCount = 0;
        let minAccessCount = Infinity;
        let oldestTime = Date.now();
        let newestTime = 0;

        for (const [key, entry] of this.cacheIndex) {
            stats.diskCacheSize += entry.size;

            if (entry.createdAt < oldestTime) {
                oldestTime = entry.createdAt;
                stats.oldestEntry = entry;
            }

            if (entry.createdAt > newestTime) {
                newestTime = entry.createdAt;
                stats.newestEntry = entry;
            }

            if (entry.accessCount > maxAccessCount) {
                maxAccessCount = entry.accessCount;
                stats.mostAccessed = entry;
            }

            if (entry.accessCount < minAccessCount) {
                minAccessCount = entry.accessCount;
                stats.leastAccessed = entry;
            }
        }

        return stats;
    }

    /**
     * Enforce cache size limits
     */
    async enforceCacheLimits() {
        try {
            let totalSize = 0;
            const entries = [];

            // Calculate total size and collect entries
            for (const [key, entry] of this.cacheIndex) {
                totalSize += entry.size;
                entries.push({ key, entry, size: entry.size });
            }

            // Remove old entries if cache is too large
            if (totalSize > this.maxCacheSize) {
                // Sort by access time (oldest first)
                entries.sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);

                let removedSize = 0;
                for (const { key, entry, size } of entries) {
                    if (totalSize - removedSize <= this.maxCacheSize * 0.8) { // Keep 80% of max size
                        break;
                    }

                    try {
                        await fs.unlink(entry.filePath);
                        this.cacheIndex.delete(key);
                        removedSize += size;
                    } catch (error) {
                        console.error(`Failed to remove cache file ${entry.filePath}:`, error);
                    }
                }

                await this.saveCacheIndex();
                console.log(`Cache cleanup: removed ${(removedSize / 1024 / 1024).toFixed(2)} MB`);
            }

            // Remove expired entries
            const now = Date.now();
            const expiredKeys = [];

            for (const [key, entry] of this.cacheIndex) {
                if (now - entry.createdAt > this.maxFileAge) {
                    expiredKeys.push(key);
                }
            }

            for (const key of expiredKeys) {
                const entry = this.cacheIndex.get(key);
                try {
                    await fs.unlink(entry.filePath);
                } catch (error) {
                    console.error(`Failed to remove expired cache file ${entry.filePath}:`, error);
                }
                this.cacheIndex.delete(key);
            }

            if (expiredKeys.length > 0) {
                await this.saveCacheIndex();
                console.log(`Removed ${expiredKeys.length} expired cache entries`);
            }

        } catch (error) {
            console.error('Failed to enforce cache limits:', error);
        }
    }

    /**
     * Save cache index to disk
     */
    async saveCacheIndex() {
        try {
            const indexPath = path.join(this.cacheDir, 'cache-index.json');
            const index = {
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                entries: Object.fromEntries(this.cacheIndex)
            };

            await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');

        } catch (error) {
            console.error('Failed to save cache index:', error);
            throw error;
        }
    }

    /**
     * Compress data
     */
    async compress(data) {
        // Simple compression using zlib
        const zlib = require('zlib');
        return new Promise((resolve, reject) => {
            zlib.gzip(data, (error, compressed) => {
                if (error) reject(error);
                else resolve(compressed);
            });
        });
    }

    /**
     * Decompress data
     */
    async decompress(data) {
        const zlib = require('zlib');
        return new Promise((resolve, reject) => {
            zlib.gunzip(data, (error, decompressed) => {
                if (error) reject(error);
                else resolve(decompressed);
            });
        });
    }

    /**
     * Encrypt data
     */
    async encrypt(data) {
        const algorithm = 'aes-256-gcm';
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(algorithm, key);

        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return {
            data: Buffer.concat([iv, encrypted]),
            key: key.toString('hex')
        };
    }

    /**
     * Decrypt data
     */
    async decrypt(data, keyHex) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(keyHex, 'hex');
        const iv = data.slice(0, 16);
        const encrypted = data.slice(16);
        const decipher = crypto.createDecipher(algorithm, key);

        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted;
    }

    /**
     * Start cleanup interval
     */
    startCleanupInterval() {
        // Run cleanup every hour
        this.cleanupInterval = setInterval(async () => {
            try {
                await this.enforceCacheLimits();
            } catch (error) {
                console.error('Cache cleanup failed:', error);
            }
        }, 60 * 60 * 1000);
    }

    /**
     * Stop cleanup interval
     */
    stopCleanupInterval() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    /**
     * Preload frequently used assets into memory
     */
    async preloadFrequentAssets() {
        try {
            // Get most accessed assets
            const frequentEntries = Array.from(this.cacheIndex.values())
                .sort((a, b) => b.accessCount - a.accessCount)
                .slice(0, 10); // Top 10

            for (const entry of frequentEntries) {
                if (!this.memoryCache.has(entry.key)) {
                    try {
                        let data = await fs.readFile(entry.filePath);

                        if (entry.compressed) {
                            data = await this.decompress(data);
                        }

                        if (entry.encrypted) {
                            data = await this.decrypt(data, entry.encryptionKey);
                        }

                        const assetData = JSON.parse(data.toString());
                        this.addToMemoryCache(entry.key, assetData, data.length);

                    } catch (error) {
                        console.error(`Failed to preload asset ${entry.key}:`, error);
                    }
                }
            }

            console.log(`Preloaded ${frequentEntries.length} frequent assets into memory`);

        } catch (error) {
            console.error('Failed to preload frequent assets:', error);
        }
    }

    /**
     * Optimize cache for specific use case
     */
    async optimizeForUseCase(useCase) {
        const optimizations = {
            'memory-intensive': {
                maxMemoryCacheSize: this.maxMemoryCacheSize * 2,
                compressionEnabled: true,
                encryptionEnabled: false
            },
            'disk-intensive': {
                maxCacheSize: this.maxCacheSize * 2,
                maxFileAge: this.maxFileAge * 2,
                compressionEnabled: true
            },
            'speed-optimized': {
                maxMemoryCacheSize: this.maxMemoryCacheSize * 1.5,
                compressionEnabled: false,
                encryptionEnabled: false
            },
            'security-focused': {
                encryptionEnabled: true,
                maxFileAge: this.maxFileAge * 0.5
            }
        };

        const config = optimizations[useCase];
        if (config) {
            Object.assign(this, config);
            console.log(`Cache optimized for use case: ${useCase}`);
        }
    }

    /**
     * Cleanup and destroy cache
     */
    async destroy() {
        try {
            this.stopCleanupInterval();
            await this.clearCache();
            console.log('Asset cache destroyed');
        } catch (error) {
            console.error('Failed to destroy cache:', error);
        }
    }
}

module.exports = AssetCache;
