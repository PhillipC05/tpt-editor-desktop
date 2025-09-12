/**
 * Performance Optimizer - Faster generation, better memory management
 * Optimizes generation algorithms, implements caching, and manages memory efficiently
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class PerformanceOptimizer {
    constructor(options = {}) {
        // Performance settings
        this.settings = {
            maxCacheSize: options.maxCacheSize || 100,
            cacheExpirationTime: options.cacheExpirationTime || 3600000, // 1 hour
            maxConcurrentOperations: options.maxConcurrentOperations || 4,
            memoryLimit: options.memoryLimit || 512 * 1024 * 1024, // 512MB
            enableParallelProcessing: options.enableParallelProcessing !== false,
            enableResultCaching: options.enableResultCaching !== false,
            enableMemoryPooling: options.enableMemoryPooling !== false,
            ...options
        };

        // Cache systems
        this.resultCache = new Map();
        this.templateCache = new Map();
        this.imageCache = new Map();

        // Memory management
        this.memoryPool = new Map();
        this.activeOperations = new Set();
        this.operationQueue = [];

        // Performance metrics
        this.metrics = {
            totalOperations: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageGenerationTime: 0,
            peakMemoryUsage: 0,
            totalMemorySaved: 0,
            optimizationScore: 0
        };

        // Optimization strategies
        this.optimizationStrategies = {
            LAZY_LOADING: 'lazy_loading',
            RESULT_CACHING: 'result_caching',
            MEMORY_POOLING: 'memory_pooling',
            PARALLEL_PROCESSING: 'parallel_processing',
            ALGORITHM_OPTIMIZATION: 'algorithm_optimization',
            RESOURCE_PRELOADING: 'resource_preloading'
        };

        // Active optimizations
        this.activeOptimizations = new Set([
            this.optimizationStrategies.RESULT_CACHING,
            this.optimizationStrategies.MEMORY_POOLING,
            this.optimizationStrategies.PARALLEL_PROCESSING
        ]);

        // Performance monitoring
        this.performanceMonitor = {
            startTime: null,
            operationCount: 0,
            memoryUsage: 0,
            cpuUsage: 0
        };

        // Initialize performance monitoring
        this.startPerformanceMonitoring();
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        this.performanceMonitor.startTime = Date.now();

        // Monitor memory usage
        setInterval(() => {
            const memUsage = process.memoryUsage();
            this.performanceMonitor.memoryUsage = memUsage.heapUsed;

            if (memUsage.heapUsed > this.metrics.peakMemoryUsage) {
                this.metrics.peakMemoryUsage = memUsage.heapUsed;
            }

            // Trigger garbage collection if memory usage is high
            if (memUsage.heapUsed > this.settings.memoryLimit * 0.8) {
                if (global.gc) {
                    global.gc();
                }
            }
        }, 5000); // Check every 5 seconds
    }

    /**
     * Optimize generation operation
     */
    async optimizeGeneration(generatorName, operation, parameters, options = {}) {
        const operationId = this.generateOperationId(generatorName, parameters);
        const startTime = Date.now();

        try {
            // Check cache first
            if (this.activeOptimizations.has(this.optimizationStrategies.RESULT_CACHING)) {
                const cachedResult = this.getCachedResult(operationId);
                if (cachedResult) {
                    this.metrics.cacheHits++;
                    return cachedResult;
                }
            }

            this.metrics.cacheMisses++;
            this.metrics.totalOperations++;

            // Queue operation if too many are running
            if (this.activeOperations.size >= this.settings.maxConcurrentOperations) {
                return await this.queueOperation(generatorName, operation, parameters, options);
            }

            // Execute operation with optimizations
            this.activeOperations.add(operationId);

            const result = await this.executeOptimizedOperation(operation, parameters, options);

            // Cache result
            if (this.activeOptimizations.has(this.optimizationStrategies.RESULT_CACHING)) {
                this.cacheResult(operationId, result);
            }

            // Update performance metrics
            const endTime = Date.now();
            const operationTime = endTime - startTime;
            this.updatePerformanceMetrics(operationTime);

            this.activeOperations.delete(operationId);

            return result;

        } catch (error) {
            this.activeOperations.delete(operationId);
            console.error(`Error in optimized operation ${generatorName}:`, error);
            throw error;
        }
    }

    /**
     * Execute operation with optimizations
     */
    async executeOptimizedOperation(operation, parameters, options) {
        // Apply memory pooling if enabled
        if (this.activeOptimizations.has(this.optimizationStrategies.MEMORY_POOLING)) {
            return await this.executeWithMemoryPooling(operation, parameters, options);
        }

        // Apply parallel processing if enabled
        if (this.activeOptimizations.has(this.optimizationStrategies.PARALLEL_PROCESSING) && options.parallelizable) {
            return await this.executeWithParallelProcessing(operation, parameters, options);
        }

        // Execute normally
        return await operation(parameters, options);
    }

    /**
     * Execute with memory pooling
     */
    async executeWithMemoryPooling(operation, parameters, options) {
        const poolKey = this.getPoolKey(parameters);

        // Try to get from memory pool
        let pooledResource = this.memoryPool.get(poolKey);

        if (pooledResource) {
            // Reuse pooled resource
            this.metrics.totalMemorySaved += this.estimateMemoryUsage(pooledResource);
        }

        try {
            const result = await operation(parameters, { ...options, pooledResource });

            // Return resource to pool if it's reusable
            if (result && this.isReusableResource(result)) {
                this.memoryPool.set(poolKey, result);

                // Limit pool size
                if (this.memoryPool.size > 50) {
                    const firstKey = this.memoryPool.keys().next().value;
                    this.memoryPool.delete(firstKey);
                }
            }

            return result;

        } catch (error) {
            // Clean up pooled resource on error
            if (pooledResource) {
                this.memoryPool.delete(poolKey);
            }
            throw error;
        }
    }

    /**
     * Execute with parallel processing
     */
    async executeWithParallelProcessing(operation, parameters, options) {
        const { parallelTasks, combineResults } = options;

        if (!parallelTasks || !combineResults) {
            return await operation(parameters, options);
        }

        // Split work into parallel tasks
        const taskPromises = parallelTasks.map(task =>
            this.limitConcurrency(() => operation(task.parameters, task.options))
        );

        // Execute tasks in parallel with concurrency limit
        const results = await Promise.all(taskPromises);

        // Combine results
        return combineResults(results);
    }

    /**
     * Limit concurrency of operations
     */
    async limitConcurrency(operation) {
        return new Promise((resolve, reject) => {
            const execute = async () => {
                try {
                    const result = await operation();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            // Execute immediately if under concurrency limit
            if (this.activeOperations.size < this.settings.maxConcurrentOperations) {
                execute();
            } else {
                // Queue for later execution
                this.operationQueue.push({ execute, resolve, reject });
            }
        });
    }

    /**
     * Queue operation for later execution
     */
    async queueOperation(generatorName, operation, parameters, options) {
        return new Promise((resolve, reject) => {
            this.operationQueue.push({
                generatorName,
                operation,
                parameters,
                options,
                resolve,
                reject,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Process operation queue
     */
    async processOperationQueue() {
        while (this.operationQueue.length > 0 &&
               this.activeOperations.size < this.settings.maxConcurrentOperations) {

            const queuedOperation = this.operationQueue.shift();

            // Check if operation has timed out
            if (Date.now() - queuedOperation.timestamp > 30000) { // 30 seconds
                queuedOperation.reject(new Error('Operation timed out in queue'));
                continue;
            }

            try {
                const result = await this.optimizeGeneration(
                    queuedOperation.generatorName,
                    queuedOperation.operation,
                    queuedOperation.parameters,
                    queuedOperation.options
                );
                queuedOperation.resolve(result);
            } catch (error) {
                queuedOperation.reject(error);
            }
        }
    }

    /**
     * Get cached result
     */
    getCachedResult(operationId) {
        const cached = this.resultCache.get(operationId);

        if (cached) {
            // Check if cache entry has expired
            if (Date.now() - cached.timestamp > this.settings.cacheExpirationTime) {
                this.resultCache.delete(operationId);
                return null;
            }

            return cached.result;
        }

        return null;
    }

    /**
     * Cache result
     */
    cacheResult(operationId, result) {
        // Limit cache size
        if (this.resultCache.size >= this.settings.maxCacheSize) {
            const firstKey = this.resultCache.keys().next().value;
            this.resultCache.delete(firstKey);
        }

        this.resultCache.set(operationId, {
            result: result,
            timestamp: Date.now(),
            size: this.estimateMemoryUsage(result)
        });
    }

    /**
     * Generate operation ID
     */
    generateOperationId(generatorName, parameters) {
        const paramString = JSON.stringify(parameters, Object.keys(parameters).sort());
        return `${generatorName}_${this.hashString(paramString)}`;
    }

    /**
     * Simple string hashing
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Get memory pool key
     */
    getPoolKey(parameters) {
        // Create a key based on parameter types and sizes
        const keyParts = [];

        for (const [key, value] of Object.entries(parameters)) {
            if (typeof value === 'object' && value !== null) {
                keyParts.push(`${key}_${this.getObjectSignature(value)}`);
            } else {
                keyParts.push(`${key}_${typeof value}_${String(value).length}`);
            }
        }

        return keyParts.join('_');
    }

    /**
     * Get object signature for pooling
     */
    getObjectSignature(obj) {
        if (Array.isArray(obj)) {
            return `array_${obj.length}`;
        }

        if (obj.width && obj.height) {
            return `image_${obj.width}x${obj.height}`;
        }

        return `object_${Object.keys(obj).length}`;
    }

    /**
     * Check if resource is reusable
     */
    isReusableResource(resource) {
        // Define criteria for reusable resources
        if (resource && typeof resource === 'object') {
            // Images, canvases, and large data structures can be reused
            return resource.width || resource.height || resource.length > 1000;
        }

        return false;
    }

    /**
     * Estimate memory usage of an object
     */
    estimateMemoryUsage(obj) {
        if (!obj) return 0;

        // Rough estimation based on type
        if (typeof obj === 'string') {
            return obj.length * 2; // 2 bytes per character
        }

        if (Array.isArray(obj)) {
            return obj.length * 8; // 8 bytes per element estimate
        }

        if (obj.width && obj.height) {
            // Image estimation
            return obj.width * obj.height * 4; // 4 bytes per pixel (RGBA)
        }

        if (typeof obj === 'object') {
            return Object.keys(obj).length * 16; // 16 bytes per property estimate
        }

        return 8; // Default 8 bytes
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(operationTime) {
        // Update average generation time
        const totalTime = this.metrics.averageGenerationTime * (this.metrics.totalOperations - 1);
        this.metrics.averageGenerationTime = (totalTime + operationTime) / this.metrics.totalOperations;

        // Calculate optimization score
        const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses);
        const memoryEfficiency = Math.min(1, this.metrics.totalMemorySaved / (this.metrics.peakMemoryUsage || 1));

        this.metrics.optimizationScore = (cacheHitRate * 0.4 + memoryEfficiency * 0.3 + (1 / Math.max(1, this.metrics.averageGenerationTime / 1000)) * 0.3) * 100;
    }

    /**
     * Preload resources for better performance
     */
    async preloadResources(resourceList) {
        if (!this.activeOptimizations.has(this.optimizationStrategies.RESOURCE_PRELOADING)) {
            return;
        }

        const preloadPromises = resourceList.map(async (resource) => {
            try {
                if (resource.type === 'image') {
                    // Preload image
                    const image = await this.loadImage(resource.path);
                    this.imageCache.set(resource.path, image);
                } else if (resource.type === 'template') {
                    // Preload template
                    const template = await this.loadTemplate(resource.path);
                    this.templateCache.set(resource.path, template);
                }
            } catch (error) {
                console.warn(`Failed to preload resource ${resource.path}:`, error);
            }
        });

        await Promise.all(preloadPromises);
    }

    /**
     * Load image (placeholder)
     */
    async loadImage(path) {
        // This would load an image using the appropriate library
        return { path, loaded: true };
    }

    /**
     * Load template (placeholder)
     */
    async loadTemplate(path) {
        // This would load a template
        return { path, loaded: true };
    }

    /**
     * Optimize algorithm for specific use case
     */
    optimizeAlgorithm(algorithmName, parameters) {
        const optimizations = {
            'image_generation': {
                // Reduce color depth for faster processing
                colorDepth: parameters.colorDepth || 256,
                // Use faster algorithms for large images
                useFastAlgorithm: parameters.width * parameters.height > 100000
            },
            'sprite_packing': {
                // Use simpler packing for small numbers of sprites
                useSimplePacking: parameters.sprites?.length < 10,
                // Pre-sort sprites for better packing
                preSortSprites: true
            },
            'audio_synthesis': {
                // Use lookup tables for common waveforms
                useWaveformCache: true,
                // Optimize sample rate for preview
                optimizeSampleRate: parameters.preview === true
            }
        };

        return optimizations[algorithmName] || {};
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        const uptime = Date.now() - this.performanceMonitor.startTime;

        return {
            uptime: uptime,
            totalOperations: this.metrics.totalOperations,
            cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100,
            averageGenerationTime: this.metrics.averageGenerationTime,
            peakMemoryUsage: this.metrics.peakMemoryUsage,
            totalMemorySaved: this.metrics.totalMemorySaved,
            optimizationScore: this.metrics.optimizationScore,
            activeOperations: this.activeOperations.size,
            queuedOperations: this.operationQueue.length,
            cacheSize: this.resultCache.size,
            memoryPoolSize: this.memoryPool.size,
            activeOptimizations: Array.from(this.activeOptimizations)
        };
    }

    /**
     * Enable optimization strategy
     */
    enableOptimization(strategy) {
        if (Object.values(this.optimizationStrategies).includes(strategy)) {
            this.activeOptimizations.add(strategy);
            console.log(`Enabled optimization: ${strategy}`);
            return true;
        }
        return false;
    }

    /**
     * Disable optimization strategy
     */
    disableOptimization(strategy) {
        this.activeOptimizations.delete(strategy);
        console.log(`Disabled optimization: ${strategy}`);
        return true;
    }

    /**
     * Clear all caches
     */
    clearCaches() {
        this.resultCache.clear();
        this.templateCache.clear();
        this.imageCache.clear();
        this.memoryPool.clear();

        console.log('All caches cleared');
    }

    /**
     * Get memory usage statistics
     */
    getMemoryStats() {
        const memUsage = process.memoryUsage();

        return {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss,
            peakUsage: this.metrics.peakMemoryUsage,
            cacheMemoryUsage: this.calculateCacheMemoryUsage(),
            poolMemoryUsage: this.calculatePoolMemoryUsage()
        };
    }

    /**
     * Calculate cache memory usage
     */
    calculateCacheMemoryUsage() {
        let totalSize = 0;

        for (const entry of this.resultCache.values()) {
            totalSize += entry.size || 0;
        }

        for (const entry of this.imageCache.values()) {
            totalSize += this.estimateMemoryUsage(entry);
        }

        for (const entry of this.templateCache.values()) {
            totalSize += this.estimateMemoryUsage(entry);
        }

        return totalSize;
    }

    /**
     * Calculate memory pool usage
     */
    calculatePoolMemoryUsage() {
        let totalSize = 0;

        for (const entry of this.memoryPool.values()) {
            totalSize += this.estimateMemoryUsage(entry);
        }

        return totalSize;
    }

    /**
     * Export performance data
     */
    async exportPerformanceData(outputPath) {
        const performanceData = {
            timestamp: new Date().toISOString(),
            settings: this.settings,
            metrics: this.metrics,
            performanceReport: this.getPerformanceReport(),
            memoryStats: this.getMemoryStats(),
            activeOptimizations: Array.from(this.activeOptimizations)
        };

        await fs.writeFile(outputPath, JSON.stringify(performanceData, null, 2), 'utf8');
        return outputPath;
    }

    /**
     * Optimize for specific workload
     */
    optimizeForWorkload(workloadType, parameters = {}) {
        const workloadOptimizations = {
            'batch_generation': {
                // Increase cache size for batch operations
                maxCacheSize: Math.max(this.settings.maxCacheSize, 200),
                // Enable parallel processing
                enableParallelProcessing: true,
                // Increase concurrent operations
                maxConcurrentOperations: Math.min(os.cpus().length, 8)
            },
            'real_time_generation': {
                // Smaller cache for real-time
                maxCacheSize: Math.min(this.settings.maxCacheSize, 50),
                // Enable memory pooling
                enableMemoryPooling: true,
                // Lower concurrent operations for responsiveness
                maxConcurrentOperations: 2
            },
            'memory_constrained': {
                // Reduce cache size
                maxCacheSize: 25,
                // Aggressive memory management
                enableMemoryPooling: true,
                // Lower memory limit
                memoryLimit: 256 * 1024 * 1024 // 256MB
            }
        };

        const optimizations = workloadOptimizations[workloadType];
        if (optimizations) {
            // Apply workload-specific optimizations
            Object.assign(this.settings, optimizations);

            // Adjust active optimizations based on workload
            if (workloadType === 'memory_constrained') {
                this.disableOptimization(this.optimizationStrategies.RESOURCE_PRELOADING);
            } else if (workloadType === 'batch_generation') {
                this.enableOptimization(this.optimizationStrategies.PARALLEL_PROCESSING);
            }

            console.log(`Optimized for workload: ${workloadType}`);
            return true;
        }

        return false;
    }

    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations() {
        const recommendations = [];

        const report = this.getPerformanceReport();

        // Cache recommendations
        if (report.cacheHitRate < 50) {
            recommendations.push({
                type: 'cache',
                message: 'Consider increasing cache size or adjusting cache expiration time',
                impact: 'high'
            });
        }

        // Memory recommendations
        if (report.peakMemoryUsage > this.settings.memoryLimit * 0.9) {
            recommendations.push({
                type: 'memory',
                message: 'Memory usage is high, consider enabling memory pooling or reducing cache size',
                impact: 'high'
            });
        }

        // Performance recommendations
        if (report.averageGenerationTime > 2000) {
            recommendations.push({
                type: 'performance',
                message: 'Generation time is high, consider enabling parallel processing or algorithm optimization',
                impact: 'medium'
            });
        }

        // Queue recommendations
        if (report.queuedOperations > 5) {
            recommendations.push({
                type: 'concurrency',
                message: 'Many operations are queued, consider increasing max concurrent operations',
                impact: 'medium'
            });
        }

        return recommendations;
    }

    /**
     * Auto-optimize based on current performance
     */
    async autoOptimize() {
        const recommendations = this.getOptimizationRecommendations();

        for (const recommendation of recommendations) {
            switch (recommendation.type) {
                case 'cache':
                    if (this.settings.maxCacheSize < 200) {
                        this.settings.maxCacheSize = Math.min(200, this.settings.maxCacheSize * 2);
                        console.log('Auto-optimized: Increased cache size');
                    }
                    break;

                case 'memory':
                    this.enableOptimization(this.optimizationStrategies.MEMORY_POOLING);
                    this.settings.maxCacheSize = Math.max(25, this.settings.maxCacheSize / 2);
                    console.log('Auto-optimized: Enabled memory pooling and reduced cache size');
                    break;

                case 'performance':
                    this.enableOptimization(this.optimizationStrategies.PARALLEL_PROCESSING);
                    console.log('Auto-optimized: Enabled parallel processing');
                    break;

                case 'concurrency':
                    this.settings.maxConcurrentOperations = Math.min(os.cpus().length, this.settings.maxConcurrentOperations + 2);
                    console.log('Auto-optimized: Increased concurrent operations');
                    break;
            }
        }

        // Clear old cache entries
        this.cleanExpiredCache();

        return recommendations.length;
    }

    /**
     * Clean expired cache entries
     */
    cleanExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, entry] of this.resultCache.entries()) {
            if (now - entry.timestamp > this.settings.cacheExpirationTime) {
                expiredKeys.push(key);
            }
        }

        for (const key of expiredKeys) {
            this.resultCache.delete(key);
        }

        if (expiredKeys.length > 0) {
            console.log(`Cleaned ${expiredKeys.length} expired cache entries`);
        }
    }

    /**
     * Shutdown optimizer
     */
    async shutdown() {
        // Process remaining queued operations
        while (this.operationQueue.length > 0) {
            await this.processOperationQueue();
        }

        // Clear all caches and pools
        this.clearCaches();

        console.log('Performance optimizer shut down');
    }
}

module.exports = PerformanceOptimizer;
