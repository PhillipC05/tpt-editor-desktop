/**
 * Performance Optimization Utilities for TPT Asset Editor
 * Handles algorithm optimization, caching, parallel processing, and I/O optimization
 */

class PerformanceOptimizer {
    constructor() {
        this.resultCache = new Map();
        this.generationCache = new Map();
        this.workerPool = [];
        this.maxWorkers = 4;
        this.cacheMaxSize = 500;
        this.cacheExpirationTime = 30 * 60 * 1000; // 30 minutes

        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            parallelTasks: 0,
            optimizedOperations: 0,
            ioOperations: 0,
            avgGenerationTime: 0
        };

        this.initializeWorkers();
        this.startCacheCleanup();
    }

    /**
     * Initialize web workers for parallel processing
     */
    initializeWorkers() {
        // Create worker pool for CPU-intensive tasks
        for (let i = 0; i < this.maxWorkers; i++) {
            try {
                // In a real implementation, you'd create actual web workers
                // For now, we'll simulate with setTimeout
                this.workerPool.push({
                    id: i,
                    busy: false,
                    task: null
                });
            } catch (error) {
                console.warn('Web Workers not supported, falling back to main thread');
            }
        }
    }

    /**
     * Start automatic cache cleanup
     */
    startCacheCleanup() {
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 5 * 60 * 1000); // Clean every 5 minutes
    }

    /**
     * Clean up expired cache entries
     */
    cleanupExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, entry] of this.resultCache.entries()) {
            if (now - entry.timestamp > this.cacheExpirationTime) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.resultCache.delete(key));

        if (expiredKeys.length > 0) {
            console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }

    // ===== CACHING SYSTEM =====

    /**
     * Generate cache key for asset configuration
     */
    generateCacheKey(type, config) {
        // Create a deterministic key from config
        const sortedConfig = this.sortObjectKeys(config);
        return `${type}_${JSON.stringify(sortedConfig)}`;
    }

    /**
     * Sort object keys for consistent cache keys
     */
    sortObjectKeys(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObjectKeys(item));
        }

        const sorted = {};
        Object.keys(obj).sort().forEach(key => {
            sorted[key] = this.sortObjectKeys(obj[key]);
        });

        return sorted;
    }

    /**
     * Check if result is cached
     */
    getCachedResult(type, config) {
        const key = this.generateCacheKey(type, config);
        const cached = this.resultCache.get(key);

        if (cached && Date.now() - cached.timestamp < this.cacheExpirationTime) {
            this.stats.cacheHits++;
            return cached.result;
        }

        this.stats.cacheMisses++;
        return null;
    }

    /**
     * Cache generation result
     */
    cacheResult(type, config, result) {
        if (this.resultCache.size >= this.cacheMaxSize) {
            // Remove oldest entry (simple FIFO)
            const firstKey = this.resultCache.keys().next().value;
            this.resultCache.delete(firstKey);
        }

        const key = this.generateCacheKey(type, config);
        this.resultCache.set(key, {
            result: result,
            timestamp: Date.now(),
            accessCount: 0
        });
    }

    /**
     * Optimized asset generation with caching
     */
    async generateAssetOptimized(type, config, generator) {
        const startTime = Date.now();

        // Check cache first
        const cached = this.getCachedResult(type, config);
        if (cached) {
            return cached;
        }

        // Generate new asset
        const result = await generator.generate(type, config);

        // Cache the result
        this.cacheResult(type, config, result);

        const generationTime = Date.now() - startTime;
        this.updateAverageGenerationTime(generationTime);

        return result;
    }

    /**
     * Update average generation time
     */
    updateAverageGenerationTime(newTime) {
        const alpha = 0.1; // Smoothing factor
        this.stats.avgGenerationTime = this.stats.avgGenerationTime * (1 - alpha) + newTime * alpha;
    }

    // ===== PARALLEL PROCESSING =====

    /**
     * Execute tasks in parallel using worker pool
     */
    async executeParallel(tasks, maxConcurrency = this.maxWorkers) {
        const results = [];
        const executing = [];

        for (const task of tasks) {
            const promise = this.executeTaskInWorker(task);
            results.push(promise);

            if (executing.length >= maxConcurrency) {
                await Promise.race(executing);
            }
        }

        return Promise.all(results);
    }

    /**
     * Execute single task in worker (simulated)
     */
    async executeTaskInWorker(task) {
        // Find available worker
        const worker = this.workerPool.find(w => !w.busy);
        if (!worker) {
            // All workers busy, execute on main thread
            return this.executeOnMainThread(task);
        }

        worker.busy = true;
        worker.task = task;

        try {
            // Simulate worker execution
            const result = await this.simulateWorkerExecution(task);
            this.stats.parallelTasks++;
            return result;
        } finally {
            worker.busy = false;
            worker.task = null;
        }
    }

    /**
     * Simulate worker execution (in real implementation, this would use actual workers)
     */
    async simulateWorkerExecution(task) {
        // Simulate processing time based on task complexity
        const processingTime = Math.random() * 1000 + 500;
        await new Promise(resolve => setTimeout(resolve, processingTime));

        // Simulate result
        return {
            taskId: task.id,
            result: `Processed ${task.type}`,
            processingTime: processingTime
        };
    }

    /**
     * Execute task on main thread
     */
    async executeOnMainThread(task) {
        const startTime = Date.now();
        const result = await task.execute();
        const processingTime = Date.now() - startTime;

        return {
            taskId: task.id,
            result: result,
            processingTime: processingTime,
            executedOnMainThread: true
        };
    }

    /**
     * Batch process assets with parallel optimization
     */
    async batchProcessOptimized(assets, generator) {
        const tasks = assets.map((asset, index) => ({
            id: index,
            type: asset.type,
            config: asset.config,
            execute: async () => {
                return await this.generateAssetOptimized(asset.type, asset.config, generator);
            }
        }));

        const results = await this.executeParallel(tasks);
        return results;
    }

    // ===== ALGORITHM OPTIMIZATIONS =====

    /**
     * Optimize sprite generation algorithms
     */
    optimizeSpriteGeneration(generator) {
        const originalGenerate = generator.generate.bind(generator);

        generator.generate = async (config) => {
            const startTime = Date.now();

            // Use optimized drawing techniques
            const result = await this.applyDrawingOptimizations(originalGenerate, config);

            const generationTime = Date.now() - startTime;
            this.stats.optimizedOperations++;

            return result;
        };

        return generator;
    }

    /**
     * Apply drawing optimizations
     */
    async applyDrawingOptimizations(originalGenerate, config) {
        // Pre-allocate canvas if not using memory manager
        if (window.memoryManager) {
            const canvas = window.memoryManager.getCanvas(config.width || 256, config.height || 256);

            try {
                // Use optimized context settings
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false; // Disable for pixel art

                const result = await originalGenerate({ ...config, canvas: canvas });

                // Release canvas back to pool
                window.memoryManager.releaseCanvas(canvas);

                return result;
            } catch (error) {
                window.memoryManager.releaseCanvas(canvas);
                throw error;
            }
        } else {
            return await originalGenerate(config);
        }
    }

    /**
     * Optimize audio generation algorithms
     */
    optimizeAudioGeneration(generator) {
        const originalGenerateSFX = generator.generateSFX.bind(generator);

        generator.generateSFX = async (config) => {
            const startTime = Date.now();

            // Use optimized audio processing
            const result = await this.applyAudioOptimizations(originalGenerateSFX, config);

            const generationTime = Date.now() - startTime;
            this.stats.optimizedOperations++;

            return result;
        };

        return generator;
    }

    /**
     * Apply audio processing optimizations
     */
    async applyAudioOptimizations(originalGenerate, config) {
        // Use faster algorithms for common cases
        if (config.effectType === 'button_click' && config.duration < 0.5) {
            // Use pre-computed templates for simple effects
            return this.generateOptimizedButtonClick(config);
        }

        return await originalGenerate(config);
    }

    /**
     * Generate optimized button click sound
     */
    generateOptimizedButtonClick(config) {
        // Simplified algorithm for fast generation
        const sampleRate = config.sampleRate || 44100;
        const duration = config.duration || 0.1;
        const samples = Math.floor(sampleRate * duration);

        const audioData = new Float32Array(samples);

        // Generate simple click envelope
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const envelope = Math.max(0, 1 - t * 20); // Fast decay
            const frequency = 1000 + Math.random() * 500; // Slight variation
            audioData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
        }

        return {
            audio: {
                data: Buffer.from(audioData.buffer).toString('base64'),
                duration: duration,
                sampleRate: sampleRate,
                format: 'wav'
            },
            metadata: {
                generatedAt: new Date().toISOString(),
                optimized: true
            }
        };
    }

    // ===== I/O OPTIMIZATION =====

    /**
     * Optimize file I/O operations
     */
    optimizeFileIO() {
        // Batch file operations
        this.pendingWrites = new Map();
        this.writeBatchTimeout = null;

        // Process batched writes
        this.processBatchedWrites = () => {
            const writes = Array.from(this.pendingWrites.entries());
            this.pendingWrites.clear();

            // Execute writes in parallel
            const promises = writes.map(([filePath, data]) => {
                return fs.writeFile(filePath, data).catch(error => {
                    console.error(`Failed to write ${filePath}:`, error);
                });
            });

            Promise.all(promises).then(() => {
                this.stats.ioOperations += writes.length;
            });
        };
    }

    /**
     * Queue file write for batch processing
     */
    queueFileWrite(filePath, data) {
        this.pendingWrites.set(filePath, data);

        // Debounce batch processing
        if (this.writeBatchTimeout) {
            clearTimeout(this.writeBatchTimeout);
        }

        this.writeBatchTimeout = setTimeout(() => {
            this.processBatchedWrites();
        }, 100); // Batch within 100ms
    }

    /**
     * Optimized batch export
     */
    async exportBatchOptimized(assets, basePath, format = 'png') {
        const exportTasks = assets.map((asset, index) => ({
            id: index,
            type: 'export',
            config: { asset, basePath, format },
            execute: async () => {
                const fileName = `${asset.type}_${asset.id}.${format}`;
                const filePath = path.join(basePath, fileName);

                // In real implementation, convert asset to specified format
                const exportData = this.convertAssetToFormat(asset, format);

                // Queue for batched writing
                this.queueFileWrite(filePath, exportData);

                return { filePath, success: true };
            }
        }));

        const results = await this.executeParallel(exportTasks, 8); // Higher concurrency for I/O
        return results;
    }

    /**
     * Convert asset to specified format (simplified)
     */
    convertAssetToFormat(asset, format) {
        // In real implementation, this would handle format conversion
        if (asset.type.includes('sfx') || asset.type.includes('music') || asset.type.includes('ambient')) {
            return Buffer.from(asset.audio?.data || 'mock-audio-data', 'base64');
        } else {
            return Buffer.from('mock-image-data', 'utf8');
        }
    }

    // ===== PERFORMANCE MONITORING =====

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const cacheHitRate = this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) * 100;

        return {
            cache: {
                size: this.resultCache.size,
                maxSize: this.cacheMaxSize,
                hitRate: cacheHitRate.toFixed(2) + '%',
                hits: this.stats.cacheHits,
                misses: this.stats.cacheMisses
            },
            parallel: {
                workers: this.workerPool.length,
                busyWorkers: this.workerPool.filter(w => w.busy).length,
                parallelTasks: this.stats.parallelTasks
            },
            optimization: {
                optimizedOperations: this.stats.optimizedOperations,
                avgGenerationTime: Math.round(this.stats.avgGenerationTime) + 'ms',
                ioOperations: this.stats.ioOperations
            }
        };
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport() {
        const stats = this.getPerformanceStats();

        return {
            timestamp: new Date().toISOString(),
            summary: {
                cacheEfficiency: stats.cache.hitRate,
                parallelUtilization: `${stats.parallel.busyWorkers}/${stats.parallel.workers} workers active`,
                avgGenerationTime: stats.optimization.avgGenerationTime,
                totalOptimizations: stats.optimization.optimizedOperations
            },
            details: stats,
            recommendations: this.generatePerformanceRecommendations(stats)
        };
    }

    /**
     * Generate performance optimization recommendations
     */
    generatePerformanceRecommendations(stats) {
        const recommendations = [];

        if (parseFloat(stats.cache.hitRate) < 50) {
            recommendations.push('Consider increasing cache size or adjusting cache expiration time');
        }

        if (stats.parallel.busyWorkers === 0 && stats.parallel.parallelTasks > 0) {
            recommendations.push('Workers are underutilized, consider increasing maxWorkers');
        }

        if (stats.optimization.avgGenerationTime > 2000) {
            recommendations.push('Average generation time is high, consider algorithm optimizations');
        }

        if (stats.optimization.ioOperations > 1000) {
            recommendations.push('High I/O operations detected, consider batching or caching strategies');
        }

        return recommendations;
    }

    /**
     * Reset performance statistics
     */
    resetStats() {
        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            parallelTasks: 0,
            optimizedOperations: 0,
            ioOperations: 0,
            avgGenerationTime: 0
        };
    }
}

// Global performance optimizer instance
let performanceOptimizer;

if (typeof window !== 'undefined') {
    performanceOptimizer = new PerformanceOptimizer();
    window.performanceOptimizer = performanceOptimizer;
} else {
    performanceOptimizer = new PerformanceOptimizer();
    module.exports = performanceOptimizer;
}
