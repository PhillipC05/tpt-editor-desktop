/**
 * Background Processor - Handles asynchronous task processing and job queues
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');

class BackgroundProcessor extends EventEmitter {
    constructor(options = {}) {
        super();

        this.maxConcurrentJobs = options.maxConcurrentJobs || 4;
        this.jobTimeout = options.jobTimeout || 300000; // 5 minutes
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000; // 1 second

        this.jobQueue = [];
        this.activeJobs = new Map();
        this.completedJobs = [];
        this.failedJobs = [];

        this.isProcessing = false;
        this.isPaused = false;
        this.jobIdCounter = 0;

        // Job types and their handlers
        this.jobHandlers = new Map();
        this.registerDefaultHandlers();

        // Statistics
        this.stats = {
            totalJobsProcessed: 0,
            totalJobsFailed: 0,
            totalJobsSucceeded: 0,
            averageProcessingTime: 0,
            jobsByType: new Map()
        };

        // Persistence
        this.persistenceEnabled = options.persistenceEnabled !== false;
        this.persistencePath = options.persistencePath || path.join(app.getPath('userData'), 'background-jobs.json');

        this.init();
    }

    /**
     * Initialize the background processor
     */
    async init() {
        try {
            if (this.persistenceEnabled) {
                await this.loadPersistedJobs();
            }

            // Start processing loop
            this.startProcessingLoop();

            console.log('Background processor initialized');

        } catch (error) {
            console.error('Failed to initialize background processor:', error);
            throw error;
        }
    }

    /**
     * Register default job handlers
     */
    registerDefaultHandlers() {
        // Asset generation handler
        this.registerHandler('generate-asset', async (job) => {
            const { assetType, config } = job.data;

            // Import the appropriate generator dynamically
            const generator = await this.loadGenerator(assetType);
            if (!generator) {
                throw new Error(`Generator not found for asset type: ${assetType}`);
            }

            const result = await generator.generate(config);
            return result;
        });

        // Batch processing handler
        this.registerHandler('batch-generate', async (job) => {
            const { items, options } = job.data;
            const results = [];

            for (const item of items) {
                try {
                    const result = await this.executeJob({
                        type: 'generate-asset',
                        data: item,
                        priority: job.priority
                    });
                    results.push({ success: true, result, item });
                } catch (error) {
                    results.push({ success: false, error: error.message, item });
                }
            }

            return results;
        });

        // File processing handler
        this.registerHandler('process-file', async (job) => {
            const { filePath, operation, options } = job.data;

            switch (operation) {
                case 'optimize':
                    return await this.optimizeFile(filePath, options);
                case 'convert':
                    return await this.convertFile(filePath, options);
                case 'compress':
                    return await this.compressFile(filePath, options);
                default:
                    throw new Error(`Unknown file operation: ${operation}`);
            }
        });

        // Database maintenance handler
        this.registerHandler('database-maintenance', async (job) => {
            const { operation } = job.data;

            // This would integrate with the database manager
            switch (operation) {
                case 'optimize':
                    // Run database optimization
                    return { optimized: true };
                case 'backup':
                    // Create database backup
                    return { backedUp: true };
                case 'cleanup':
                    // Clean up old data
                    return { cleaned: true };
                default:
                    throw new Error(`Unknown database operation: ${operation}`);
            }
        });
    }

    /**
     * Register a job handler
     */
    registerHandler(jobType, handler) {
        this.jobHandlers.set(jobType, handler);
    }

    /**
     * Unregister a job handler
     */
    unregisterHandler(jobType) {
        this.jobHandlers.delete(jobType);
    }

    /**
     * Add job to queue
     */
    async addJob(job) {
        const jobId = ++this.jobIdCounter;

        const fullJob = {
            id: jobId,
            type: job.type,
            data: job.data || {},
            priority: job.priority || 0,
            createdAt: new Date(),
            status: 'queued',
            attempts: 0,
            maxAttempts: job.maxAttempts || this.retryAttempts,
            timeout: job.timeout || this.jobTimeout,
            progress: 0,
            progressMessage: '',
            ...job
        };

        this.jobQueue.push(fullJob);
        this.sortQueueByPriority();

        // Persist job if enabled
        if (this.persistenceEnabled) {
            await this.persistJobs();
        }

        this.emit('job-queued', fullJob);

        console.log(`Job ${jobId} (${job.type}) added to queue`);

        return jobId;
    }

    /**
     * Add multiple jobs to queue
     */
    async addJobs(jobs) {
        const jobIds = [];

        for (const job of jobs) {
            const jobId = await this.addJob(job);
            jobIds.push(jobId);
        }

        return jobIds;
    }

    /**
     * Get job by ID
     */
    getJob(jobId) {
        // Check active jobs
        if (this.activeJobs.has(jobId)) {
            return this.activeJobs.get(jobId);
        }

        // Check queued jobs
        const queuedJob = this.jobQueue.find(job => job.id === jobId);
        if (queuedJob) {
            return queuedJob;
        }

        // Check completed jobs
        const completedJob = this.completedJobs.find(job => job.id === jobId);
        if (completedJob) {
            return completedJob;
        }

        // Check failed jobs
        const failedJob = this.failedJobs.find(job => job.id === jobId);
        if (failedJob) {
            return failedJob;
        }

        return null;
    }

    /**
     * Cancel job
     */
    async cancelJob(jobId) {
        const job = this.getJob(jobId);
        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }

        if (job.status === 'active') {
            // Cancel active job
            job.status = 'cancelled';
            job.cancelledAt = new Date();
            this.activeJobs.delete(jobId);
            this.emit('job-cancelled', job);
        } else if (job.status === 'queued') {
            // Remove from queue
            const index = this.jobQueue.findIndex(j => j.id === jobId);
            if (index !== -1) {
                this.jobQueue.splice(index, 1);
                job.status = 'cancelled';
                job.cancelledAt = new Date();
                this.emit('job-cancelled', job);
            }
        }

        if (this.persistenceEnabled) {
            await this.persistJobs();
        }
    }

    /**
     * Pause processing
     */
    pause() {
        this.isPaused = true;
        this.emit('processing-paused');
        console.log('Background processing paused');
    }

    /**
     * Resume processing
     */
    resume() {
        this.isPaused = false;
        this.emit('processing-resumed');
        console.log('Background processing resumed');
    }

    /**
     * Clear job queue
     */
    async clearQueue() {
        this.jobQueue = [];
        this.emit('queue-cleared');

        if (this.persistenceEnabled) {
            await this.persistJobs();
        }

        console.log('Job queue cleared');
    }

    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            queuedJobs: this.jobQueue.length,
            activeJobs: this.activeJobs.size,
            completedJobs: this.completedJobs.length,
            failedJobs: this.failedJobs.length,
            isProcessing: this.isProcessing,
            isPaused: this.isPaused,
            maxConcurrentJobs: this.maxConcurrentJobs
        };
    }

    /**
     * Get processing statistics
     */
    getStatistics() {
        return {
            ...this.stats,
            jobsByType: Object.fromEntries(this.stats.jobsByType),
            currentStatus: this.getQueueStatus()
        };
    }

    /**
     * Start processing loop
     */
    startProcessingLoop() {
        setInterval(async () => {
            if (!this.isPaused && this.jobQueue.length > 0 && this.activeJobs.size < this.maxConcurrentJobs) {
                await this.processNextJob();
            }
        }, 1000); // Check every second
    }

    /**
     * Process next job in queue
     */
    async processNextJob() {
        if (this.jobQueue.length === 0 || this.activeJobs.size >= this.maxConcurrentJobs) {
            return;
        }

        const job = this.jobQueue.shift();
        job.status = 'active';
        job.startedAt = new Date();
        job.attempts++;

        this.activeJobs.set(job.id, job);
        this.emit('job-started', job);

        try {
            // Execute job with timeout
            const result = await this.executeJobWithTimeout(job);

            // Job completed successfully
            job.status = 'completed';
            job.completedAt = new Date();
            job.result = result;
            job.processingTime = job.completedAt - job.startedAt;

            this.activeJobs.delete(job.id);
            this.completedJobs.push(job);

            // Update statistics
            this.updateJobStatistics(job, true);

            this.emit('job-completed', job);

            console.log(`Job ${job.id} (${job.type}) completed successfully`);

        } catch (error) {
            await this.handleJobError(job, error);
        }

        // Persist state
        if (this.persistenceEnabled) {
            await this.persistJobs();
        }
    }

    /**
     * Execute job with timeout
     */
    async executeJobWithTimeout(job) {
        return new Promise(async (resolve, reject) => {
            // Set timeout
            const timeout = setTimeout(() => {
                reject(new Error(`Job ${job.id} timed out after ${job.timeout}ms`));
            }, job.timeout);

            try {
                const result = await this.executeJob(job);
                clearTimeout(timeout);
                resolve(result);
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    /**
     * Execute job
     */
    async executeJob(job) {
        const handler = this.jobHandlers.get(job.type);
        if (!handler) {
            throw new Error(`No handler registered for job type: ${job.type}`);
        }

        // Update progress callback
        job.updateProgress = (progress, message) => {
            job.progress = Math.max(0, Math.min(100, progress));
            job.progressMessage = message || '';
            this.emit('job-progress', job);
        };

        const result = await handler(job);
        return result;
    }

    /**
     * Handle job error
     */
    async handleJobError(job, error) {
        job.lastError = error.message;
        job.errorStack = error.stack;

        // Check if job should be retried
        if (job.attempts < job.maxAttempts) {
            // Retry job
            job.status = 'retrying';
            job.nextRetryAt = new Date(Date.now() + (this.retryDelay * job.attempts));

            // Add back to queue with higher priority for retry
            job.priority += 1;
            this.jobQueue.unshift(job);

            this.emit('job-retry', job);

            console.log(`Job ${job.id} failed, retrying (attempt ${job.attempts}/${job.maxAttempts})`);

        } else {
            // Job failed permanently
            job.status = 'failed';
            job.failedAt = new Date();

            this.activeJobs.delete(job.id);
            this.failedJobs.push(job);

            // Update statistics
            this.updateJobStatistics(job, false);

            this.emit('job-failed', job);

            console.error(`Job ${job.id} (${job.type}) failed permanently:`, error.message);
        }
    }

    /**
     * Update job statistics
     */
    updateJobStatistics(job, success) {
        this.stats.totalJobsProcessed++;

        if (success) {
            this.stats.totalJobsSucceeded++;
        } else {
            this.stats.totalJobsFailed++;
        }

        // Update jobs by type
        const typeStats = this.stats.jobsByType.get(job.type) || {
            total: 0,
            succeeded: 0,
            failed: 0,
            averageTime: 0
        };

        typeStats.total++;

        if (success) {
            typeStats.succeeded++;
        } else {
            typeStats.failed++;
        }

        if (job.processingTime) {
            typeStats.averageTime = (typeStats.averageTime * (typeStats.total - 1) + job.processingTime) / typeStats.total;
        }

        this.stats.jobsByType.set(job.type, typeStats);

        // Update overall average processing time
        if (job.processingTime) {
            this.stats.averageProcessingTime =
                (this.stats.averageProcessingTime * (this.stats.totalJobsProcessed - 1) + job.processingTime) /
                this.stats.totalJobsProcessed;
        }
    }

    /**
     * Sort queue by priority
     */
    sortQueueByPriority() {
        this.jobQueue.sort((a, b) => {
            // Higher priority first
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }

            // Then by creation time (FIFO)
            return a.createdAt - b.createdAt;
        });
    }

    /**
     * Load persisted jobs
     */
    async loadPersistedJobs() {
        try {
            const data = await fs.readFile(this.persistencePath, 'utf8');
            const persisted = JSON.parse(data);

            // Restore queued jobs
            for (const job of persisted.queuedJobs || []) {
                job.createdAt = new Date(job.createdAt);
                this.jobQueue.push(job);
            }

            // Restore active jobs
            for (const job of persisted.activeJobs || []) {
                job.createdAt = new Date(job.createdAt);
                job.startedAt = new Date(job.startedAt);
                this.activeJobs.set(job.id, job);
            }

            // Update job ID counter
            if (persisted.lastJobId) {
                this.jobIdCounter = persisted.lastJobId;
            }

            console.log(`Loaded ${this.jobQueue.length} queued and ${this.activeJobs.size} active jobs from persistence`);

        } catch (error) {
            // File doesn't exist or is corrupted, start fresh
            console.log('No persisted jobs found, starting fresh');
        }
    }

    /**
     * Persist jobs to disk
     */
    async persistJobs() {
        try {
            const data = {
                queuedJobs: this.jobQueue,
                activeJobs: Array.from(this.activeJobs.values()),
                lastJobId: this.jobIdCounter,
                persistedAt: new Date().toISOString()
            };

            await fs.writeFile(this.persistencePath, JSON.stringify(data, null, 2), 'utf8');

        } catch (error) {
            console.error('Failed to persist jobs:', error);
        }
    }

    /**
     * Load generator dynamically
     */
    async loadGenerator(assetType) {
        try {
            let generatorPath;

            // Map asset types to generator files
            const generatorMap = {
                'character': '../generators/sprite-generators/character-generator',
                'monster': '../generators/sprite-generators/monster-generator',
                'item': '../generators/sprite-generators/item-generator',
                'tile': '../generators/sprite-generators/tile-generator',
                'sfx': '../generators/audio-generator',
                'music': '../generators/audio-generator',
                'ambient': '../generators/audio-generator',
                'vehicle': '../generators/vehicle-generator',
                'building': '../generators/building-generator',
                'particle': '../generators/particle-generator',
                'ui': '../generators/ui-generator'
            };

            generatorPath = generatorMap[assetType];

            if (!generatorPath) {
                // Try to find generator in generators directory
                const fs = require('fs');
                const generatorsDir = path.join(__dirname, '../generators');
                const files = fs.readdirSync(generatorsDir);

                const matchingFile = files.find(file =>
                    file.includes(assetType) && file.endsWith('-generator.js')
                );

                if (matchingFile) {
                    generatorPath = `../generators/${matchingFile.replace('.js', '')}`;
                }
            }

            if (!generatorPath) {
                return null;
            }

            const GeneratorClass = require(generatorPath);
            return new GeneratorClass();
        } catch (error) {
            console.error(`Error loading generator for ${assetType}:`, error);
            return null;
        }
    }

    /**
     * File optimization helper
     */
    async optimizeFile(filePath, options) {
        // This would implement file optimization logic
        // For now, return a placeholder result
        return {
            optimized: true,
            originalSize: 0,
            optimizedSize: 0,
            savings: 0
        };
    }

    /**
     * File conversion helper
     */
    async convertFile(filePath, options) {
        // This would implement file conversion logic
        // For now, return a placeholder result
        return {
            converted: true,
            from: options.from || 'unknown',
            to: options.to || 'unknown',
            outputPath: filePath.replace(/\.[^/.]+$/, `.${options.to}`)
        };
    }

    /**
     * File compression helper
     */
    async compressFile(filePath, options) {
        // This would implement file compression logic
        // For now, return a placeholder result
        return {
            compressed: true,
            algorithm: options.algorithm || 'gzip',
            originalSize: 0,
            compressedSize: 0,
            compressionRatio: 0
        };
    }

    /**
     * Cleanup old completed/failed jobs
     */
    async cleanupOldJobs(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
        const cutoffTime = Date.now() - maxAge;

        // Clean up completed jobs
        this.completedJobs = this.completedJobs.filter(job =>
            job.completedAt && job.completedAt.getTime() > cutoffTime
        );

        // Clean up failed jobs
        this.failedJobs = this.failedJobs.filter(job =>
            job.failedAt && job.failedAt.getTime() > cutoffTime
        );

        console.log(`Cleaned up old jobs, ${this.completedJobs.length} completed and ${this.failedJobs.length} failed jobs remaining`);
    }

    /**
     * Shutdown processor
     */
    async shutdown() {
        console.log('Shutting down background processor...');

        this.pause();

        // Wait for active jobs to complete
        const activeJobPromises = Array.from(this.activeJobs.values()).map(job => {
            return new Promise(resolve => {
                const timeout = setTimeout(() => {
                    console.warn(`Job ${job.id} did not complete within shutdown timeout`);
                    resolve();
                }, 10000); // 10 second timeout

                this.once(`job-completed`, (completedJob) => {
                    if (completedJob.id === job.id) {
                        clearTimeout(timeout);
                        resolve();
                    }
                });

                this.once(`job-failed`, (failedJob) => {
                    if (failedJob.id === job.id) {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
            });
        });

        await Promise.all(activeJobPromises);

        // Final persistence
        if (this.persistenceEnabled) {
            await this.persistJobs();
        }

        console.log('Background processor shutdown complete');
    }
}

module.exports = BackgroundProcessor;
