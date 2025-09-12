/**
 * TPT Asset Editor Desktop - Memory Manager
 * Intelligent memory pooling and optimization system
 */

const EventEmitter = require('events');

class MemoryManager extends EventEmitter {
    constructor(options = {}) {
        super();

        this.maxMemoryMB = options.maxMemoryMB || 512;
        this.warningThresholdMB = options.warningThresholdMB || 400;
        this.criticalThresholdMB = options.criticalThresholdMB || 450;
        this.cleanupInterval = options.cleanupInterval || 30000; // 30 seconds
        this.objectPools = new Map();
        this.cache = new Map();
        this.weakRefs = new Set();
        this.memoryStats = {
            peakUsage: 0,
            currentUsage: 0,
            allocations: 0,
            deallocations: 0,
            cacheHits: 0,
            cacheMisses: 0,
            poolHits: 0,
            poolMisses: 0,
            forcedGC: 0
        };

        this.setupMemoryMonitoring();
        this.initializeObjectPools();
        console.log('Memory Manager initialized');
    }

    /**
     * Set up memory monitoring and automatic cleanup
     */
    setupMemoryMonitoring() {
        // Monitor memory usage
        this.monitoringInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, this.cleanupInterval);

        // Set up finalization registry for weak references
        if (typeof FinalizationRegistry !== 'undefined') {
            this.finalizationRegistry = new FinalizationRegistry((heldValue) => {
                this.handleObjectCleanup(heldValue);
            });
        }

        // Handle process memory warnings
        if (typeof process !== 'undefined' && process.on) {
            process.on('warning', (warning) => {
                if (warning.name === 'MemoryWarning') {
                    this.handleMemoryWarning(warning);
                }
            });
        }
    }

    /**
     * Initialize object pools for frequently used objects
     */
    initializeObjectPools() {
        // Canvas pool for image generation
        this.createObjectPool('canvas', {
            maxSize: 20,
            factory: () => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                return canvas;
            },
            reset: (canvas) => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return canvas;
            }
        });

        // ImageData pool for pixel manipulation
        this.createObjectPool('imageData', {
            maxSize: 50,
            factory: () => new ImageData(64, 64),
            reset: (imageData) => {
                // Clear image data
                for (let i = 0; i < imageData.data.length; i++) {
                    imageData.data[i] = 0;
                }
                return imageData;
            }
        });

        // Array pool for various sizes
        this.createObjectPool('array_small', {
            maxSize: 100,
            factory: () => new Array(64),
            reset: (arr) => {
                arr.length = 64;
                return arr.fill(0);
            }
        });

        this.createObjectPool('array_medium', {
            maxSize: 50,
            factory: () => new Array(256),
            reset: (arr) => {
                arr.length = 256;
                return arr.fill(0);
            }
        });

        this.createObjectPool('array_large', {
            maxSize: 20,
            factory: () => new Array(1024),
            reset: (arr) => {
                arr.length = 1024;
                return arr.fill(0);
            }
        });

        // Uint8Array pool for binary data
        this.createObjectPool('uint8Array', {
            maxSize: 30,
            factory: () => new Uint8Array(4096),
            reset: (arr) => {
                return arr.fill(0);
            }
        });

        // Float32Array pool for audio data
        this.createObjectPool('float32Array', {
            maxSize: 25,
            factory: () => new Float32Array(2048),
            reset: (arr) => {
                return arr.fill(0);
            }
        });
    }

    /**
     * Create an object pool
     */
    createObjectPool(name, config) {
        const pool = {
            name,
            maxSize: config.maxSize,
            available: [],
            inUse: new Set(),
            factory: config.factory,
            reset: config.reset,
            stats: {
                created: 0,
                reused: 0,
                disposed: 0
            }
        };

        this.objectPools.set(name, pool);
        console.log(`Created object pool: ${name} (max: ${config.maxSize})`);
    }

    /**
     * Get an object from the pool
     */
    getFromPool(poolName) {
        const pool = this.objectPools.get(poolName);
        if (!pool) {
            throw new Error(`Object pool '${poolName}' not found`);
        }

        let object;

        if (pool.available.length > 0) {
            // Reuse existing object
            object = pool.available.pop();
            pool.stats.reused++;
            this.memoryStats.poolHits++;
        } else {
            // Create new object
            object = pool.factory();
            pool.stats.created++;
            this.memoryStats.poolMisses++;
        }

        pool.inUse.add(object);

        // Track with weak reference if available
        if (this.finalizationRegistry) {
            this.finalizationRegistry.register(object, { poolName, object }, object);
        }

        return object;
    }

    /**
     * Return an object to the pool
     */
    returnToPool(poolName, object) {
        const pool = this.objectPools.get(poolName);
        if (!pool) {
            console.warn(`Object pool '${poolName}' not found`);
            return;
        }

        if (!pool.inUse.has(object)) {
            console.warn(`Object not found in pool '${poolName}'`);
            return;
        }

        pool.inUse.delete(object);

        if (pool.available.length < pool.maxSize) {
            // Reset and return to pool
            const resetObject = pool.reset(object);
            pool.available.push(resetObject);
        } else {
            // Pool is full, dispose of object
            pool.stats.disposed++;
        }
    }

    /**
     * Check current memory usage
     */
    checkMemoryUsage() {
        const usage = this.getMemoryUsage();

        if (usage > this.memoryStats.peakUsage) {
            this.memoryStats.peakUsage = usage;
        }

        this.memoryStats.currentUsage = usage;

        // Emit memory usage event
        this.emit('memoryUsage', {
            current: usage,
            peak: this.memoryStats.peakUsage,
            percentage: (usage / this.maxMemoryMB) * 100
        });

        // Check thresholds
        if (usage > this.criticalThresholdMB) {
            this.handleCriticalMemoryUsage();
        } else if (usage > this.warningThresholdMB) {
            this.handleHighMemoryUsage();
        }
    }

    /**
     * Get current memory usage in MB
     */
    getMemoryUsage() {
        if (typeof performance !== 'undefined' && performance.memory) {
            // Browser environment
            return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        } else if (typeof process !== 'undefined' && process.memoryUsage) {
            // Node.js environment
            const usage = process.memoryUsage();
            return Math.round(usage.heapUsed / 1024 / 1024);
        }

        // Fallback - estimate based on object counts
        return Math.round((this.cache.size + this.weakRefs.size) * 0.1);
    }

    /**
     * Handle critical memory usage
     */
    async handleCriticalMemoryUsage() {
        console.warn('Critical memory usage detected, performing emergency cleanup');

        this.emit('criticalMemoryUsage', {
            usage: this.memoryStats.currentUsage,
            threshold: this.criticalThresholdMB
        });

        // Force garbage collection if available
        if (typeof global !== 'undefined' && global.gc) {
            global.gc();
            this.memoryStats.forcedGC++;
        }

        // Aggressive cleanup
        await this.aggressiveCleanup();

        // If still critical, emit emergency event
        const newUsage = this.getMemoryUsage();
        if (newUsage > this.criticalThresholdMB) {
            this.emit('memoryEmergency', {
                usage: newUsage,
                threshold: this.criticalThresholdMB
            });
        }
    }

    /**
     * Handle high memory usage
     */
    async handleHighMemoryUsage() {
        console.warn('High memory usage detected, performing cleanup');

        this.emit('highMemoryUsage', {
            usage: this.memoryStats.currentUsage,
            threshold: this.warningThresholdMB
        });

        // Perform standard cleanup
        await this.performCleanup();
    }

    /**
     * Handle memory warning from Node.js
     */
    handleMemoryWarning(warning) {
        console.warn('Memory warning received:', warning.message);
        this.emit('memoryWarning', { warning });

        // Perform cleanup
        this.performCleanup();
    }

    /**
     * Perform standard cleanup
     */
    async performCleanup() {
        // Clear expired cache entries
        await this.cleanupExpiredCache();

        // Clean up object pools
        this.cleanupObjectPools();

        // Suggest garbage collection
        this.suggestGarbageCollection();
    }

    /**
     * Perform aggressive cleanup
     */
    async aggressiveCleanup() {
        // Clear all caches
        this.cache.clear();

        // Clear object pools
        for (const pool of this.objectPools.values()) {
            pool.available = [];
        }

        // Clear weak references
        this.weakRefs.clear();

        // Force cleanup of large objects
        this.emit('aggressiveCleanup');
    }

    /**
     * Clean up expired cache entries
     */
    async cleanupExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expires && entry.expires < now) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => {
            this.cache.delete(key);
        });

        if (expiredKeys.length > 0) {
            console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }

    /**
     * Clean up object pools
     */
    cleanupObjectPools() {
        for (const pool of this.objectPools.values()) {
            // Remove excess objects from available pool
            const excess = pool.available.length - Math.floor(pool.maxSize * 0.5);
            if (excess > 0) {
                pool.available.splice(0, excess);
                pool.stats.disposed += excess;
            }
        }
    }

    /**
     * Suggest garbage collection
     */
    suggestGarbageCollection() {
        if (typeof global !== 'undefined' && global.gc) {
            global.gc();
            this.memoryStats.forcedGC++;
        }
    }

    /**
     * Cache an object with optional expiration
     */
    setCache(key, value, options = {}) {
        const entry = {
            value,
            created: Date.now(),
            expires: options.ttl ? Date.now() + options.ttl : null,
            size: this.estimateObjectSize(value)
        };

        this.cache.set(key, entry);
        this.memoryStats.allocations++;

        // Check if we need to cleanup
        if (this.cache.size > 1000) { // Arbitrary limit
            this.cleanupExpiredCache();
        }
    }

    /**
     * Get cached object
     */
    getCache(key) {
        const entry = this.cache.get(key);

        if (entry) {
            if (entry.expires && entry.expires < Date.now()) {
                this.cache.delete(key);
                this.memoryStats.cacheMisses++;
                return null;
            }

            this.memoryStats.cacheHits++;
            return entry.value;
        }

        this.memoryStats.cacheMisses++;
        return null;
    }

    /**
     * Clear cache entry
     */
    clearCache(key) {
        if (this.cache.delete(key)) {
            this.memoryStats.deallocations++;
        }
    }

    /**
     * Estimate object size (rough approximation)
     */
    estimateObjectSize(obj) {
        if (obj === null || obj === undefined) return 0;

        const type = typeof obj;

        switch (type) {
            case 'boolean':
                return 4;
            case 'number':
                return 8;
            case 'string':
                return obj.length * 2;
            case 'object':
                if (Array.isArray(obj)) {
                    return obj.length * 8 + obj.reduce((sum, item) => sum + this.estimateObjectSize(item), 0);
                } else if (obj instanceof ArrayBuffer) {
                    return obj.byteLength;
                } else if (obj instanceof Uint8Array || obj instanceof Float32Array) {
                    return obj.length * obj.BYTES_PER_ELEMENT;
                } else {
                    let size = 0;
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            size += key.length * 2 + this.estimateObjectSize(obj[key]);
                        }
                    }
                    return size;
                }
            default:
                return 8; // Default size
        }
    }

    /**
     * Handle object cleanup when garbage collected
     */
    handleObjectCleanup(heldValue) {
        const { poolName, object } = heldValue;

        // Remove from in-use set if it exists
        const pool = this.objectPools.get(poolName);
        if (pool) {
            pool.inUse.delete(object);
        }

        this.weakRefs.delete(heldValue);
    }

    /**
     * Create a weak reference to an object
     */
    createWeakRef(object, callback) {
        if (typeof WeakRef !== 'undefined') {
            const weakRef = new WeakRef(object);
            const heldValue = { weakRef, callback };

            this.weakRefs.add(heldValue);

            // Set up finalization if registry exists
            if (this.finalizationRegistry) {
                this.finalizationRegistry.register(object, heldValue, object);
            }

            return weakRef;
        }

        // Fallback - just return the object
        return { deref: () => object };
    }

    /**
     * Get memory statistics
     */
    getMemoryStats() {
        const poolStats = {};
        for (const [name, pool] of this.objectPools.entries()) {
            poolStats[name] = {
                available: pool.available.length,
                inUse: pool.inUse.size,
                maxSize: pool.maxSize,
                stats: { ...pool.stats }
            };
        }

        return {
            memory: {
                current: this.memoryStats.currentUsage,
                peak: this.memoryStats.peakUsage,
                max: this.maxMemoryMB,
                percentage: (this.memoryStats.currentUsage / this.maxMemoryMB) * 100
            },
            allocations: {
                total: this.memoryStats.allocations,
                deallocations: this.memoryStats.deallocations,
                active: this.memoryStats.allocations - this.memoryStats.deallocations
            },
            cache: {
                size: this.cache.size,
                hits: this.memoryStats.cacheHits,
                misses: this.memoryStats.cacheMisses,
                hitRate: this.memoryStats.cacheHits / (this.memoryStats.cacheHits + this.memoryStats.cacheMisses) * 100
            },
            pools: poolStats,
            gc: {
                forced: this.memoryStats.forcedGC
            }
        };
    }

    /**
     * Get pool statistics
     */
    getPoolStats(poolName) {
        const pool = this.objectPools.get(poolName);
        if (!pool) {
            return null;
        }

        return {
            name: poolName,
            available: pool.available.length,
            inUse: pool.inUse.size,
            total: pool.available.length + pool.inUse.size,
            maxSize: pool.maxSize,
            utilization: ((pool.available.length + pool.inUse.size) / pool.maxSize) * 100,
            stats: { ...pool.stats }
        };
    }

    /**
     * Optimize memory usage
     */
    async optimize() {
        console.log('Starting memory optimization...');

        // Perform full cleanup
        await this.aggressiveCleanup();

        // Optimize object pools
        for (const pool of this.objectPools.values()) {
            // Reduce pool sizes if utilization is low
            const utilization = (pool.available.length + pool.inUse.size) / pool.maxSize;
            if (utilization < 0.3) {
                const newMaxSize = Math.max(5, Math.floor(pool.maxSize * 0.7));
                pool.maxSize = newMaxSize;

                // Trim available objects
                if (pool.available.length > newMaxSize) {
                    const excess = pool.available.length - newMaxSize;
                    pool.available.splice(0, excess);
                    pool.stats.disposed += excess;
                }
            }
        }

        // Force garbage collection
        this.suggestGarbageCollection();

        console.log('Memory optimization completed');
        this.emit('optimized');
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        // Clear monitoring interval
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        // Perform final cleanup
        await this.aggressiveCleanup();

        // Clear all pools
        this.objectPools.clear();

        // Clear event listeners
        this.removeAllListeners();

        console.log('Memory Manager cleaned up');
    }
}

module.exports = MemoryManager;
