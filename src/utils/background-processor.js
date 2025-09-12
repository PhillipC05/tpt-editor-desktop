/**
 * TPT Asset Editor Desktop - Background Processor
 * Web Worker-based background processing system for CPU-intensive tasks
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

class BackgroundProcessor extends EventEmitter {
    constructor(options = {}) {
        super();

        this.maxWorkers = options.maxWorkers || 4;
        this.workerScriptPath = options.workerScriptPath || path.join(__dirname, 'worker.js');
        this.taskQueue = [];
        this.activeWorkers = new Map();
        this.completedTasks = new Map();
        this.taskStats = {
            total: 0,
            completed: 0,
            failed: 0,
            cancelled: 0,
            averageDuration: 0
        };

        this.isProcessing = false;
        this.workerPool = [];
        this.taskTimeouts = new Map();

        this.initializeWorkerPool();
        console.log('Background Processor initialized');
    }

    /**
     * Initialize the worker pool
     */
    initializeWorkerPool() {
        // Create worker pool
        for (let i = 0; i < this.maxWorkers; i++) {
            this.createWorker(i);
        }
    }

    /**
     * Create a new worker
     */
    createWorker(id) {
        try {
            let worker;

            if (typeof Worker !== 'undefined') {
                // Browser environment
                worker = new Worker(this.workerScriptPath);
            } else {
                // Node.js environment - use worker_threads if available
                const { Worker: NodeWorker } = require('worker_threads');
                worker = new NodeWorker(this.workerScriptPath);
            }

            const workerInstance = {
                id,
                worker,
                busy: false,
                currentTask: null,
                startTime: null,
                taskCount: 0
            };

            // Set up message handler
            worker.onmessage = (event) => {
                this.handleWorkerMessage(workerInstance, event);
            };

            // Set up error handler
            worker.onerror = (error) => {
                this.handleWorkerError(workerInstance, error);
            };

            this.workerPool.push(workerInstance);
            console.log(`Worker ${id} created`);
        } catch (error) {
            console.error(`Failed to create worker ${id}:`, error);
        }
    }

    /**
     * Add a task to the processing queue
     */
    async addTask(task) {
        if (!task || typeof task !== 'object') {
            throw new Error('Task must be a valid object');
        }

        if (!task.type || typeof task.type !== 'string') {
            throw new Error('Task must have a type property');
        }

        const taskId = this.generateTaskId();
        const taskWrapper = {
            id: taskId,
            type: task.type,
            data: task.data || {},
            priority: task.priority || 'normal',
            timeout: task.timeout || 300000, // 5 minutes default
            created: Date.now(),
            status: 'queued',
            progress: 0,
            result: null,
            error: null
        };

        // Add to appropriate position based on priority
        this.insertTaskByPriority(taskWrapper);

        this.taskStats.total++;
        this.emit('taskAdded', { task: taskWrapper });

        console.log(`Task ${taskId} added to queue (${this.taskQueue.length} total)`);

        // Start processing if not already running
        if (!this.isProcessing) {
            this.startProcessing();
        }

        return taskId;
    }

    /**
     * Insert task into queue based on priority
     */
    insertTaskByPriority(task) {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const taskPriority = priorityOrder[task.priority] || 1;

        let insertIndex = this.taskQueue.length;
        for (let i = 0; i < this.taskQueue.length; i++) {
            const queuePriority = priorityOrder[this.taskQueue[i].priority] || 1;
            if (taskPriority < queuePriority) {
                insertIndex = i;
                break;
            }
        }

        this.taskQueue.splice(insertIndex, 0, task);
    }

    /**
     * Start processing tasks
     */
    async startProcessing() {
        if (this.isProcessing) return;

        this.isProcessing = true;
        console.log('Background processing started');

        while (this.taskQueue.length > 0 && this.isProcessing) {
            const availableWorker = this.getAvailableWorker();

            if (availableWorker) {
                const task = this.taskQueue.shift();
                await this.assignTaskToWorker(task, availableWorker);
            } else {
                // Wait for a worker to become available
                await this.waitForWorker();
            }
        }

        this.isProcessing = false;
        console.log('Background processing completed');
        this.emit('processingComplete');
    }

    /**
     * Get an available worker
     */
    getAvailableWorker() {
        return this.workerPool.find(worker => !worker.busy);
    }

    /**
     * Wait for a worker to become available
     */
    waitForWorker() {
        return new Promise((resolve) => {
            const checkWorker = () => {
                const availableWorker = this.getAvailableWorker();
                if (availableWorker) {
                    resolve(availableWorker);
                } else {
                    setTimeout(checkWorker, 100); // Check every 100ms
                }
            };
            checkWorker();
        });
    }

    /**
     * Assign a task to a worker
     */
    async assignTaskToWorker(task, worker) {
        worker.busy = true;
        worker.currentTask = task;
        worker.startTime = Date.now();
        worker.taskCount++;

        task.status = 'processing';
        task.workerId = worker.id;

        this.activeWorkers.set(task.id, worker);
        this.emit('taskStarted', { task, worker: worker.id });

        // Set up timeout
        const timeoutId = setTimeout(() => {
            this.handleTaskTimeout(task);
        }, task.timeout);

        this.taskTimeouts.set(task.id, timeoutId);

        try {
            // Send task to worker
            const message = {
                type: 'execute',
                taskId: task.id,
                taskType: task.type,
                data: task.data
            };

            worker.worker.postMessage(message);
        } catch (error) {
            console.error(`Failed to send task ${task.id} to worker:`, error);
            this.handleTaskError(task, error);
        }
    }

    /**
     * Handle messages from workers
     */
    handleWorkerMessage(worker, event) {
        const { type, taskId, data, error, progress } = event.data;

        const task = this.findTaskById(taskId);
        if (!task) {
            console.warn(`Received message for unknown task: ${taskId}`);
            return;
        }

        switch (type) {
            case 'progress':
                this.handleTaskProgress(task, progress);
                break;

            case 'result':
                this.handleTaskResult(task, data);
                break;

            case 'error':
                this.handleTaskError(task, error);
                break;

            default:
                console.warn(`Unknown message type: ${type}`);
        }

        // Clean up worker
        this.releaseWorker(worker);
    }

    /**
     * Handle worker errors
     */
    handleWorkerError(worker, error) {
        console.error(`Worker ${worker.id} error:`, error);

        if (worker.currentTask) {
            this.handleTaskError(worker.currentTask, error);
        }

        // Clean up worker
        this.releaseWorker(worker);

        // Try to recreate worker
        this.recreateWorker(worker.id);
    }

    /**
     * Handle task progress updates
     */
    handleTaskProgress(task, progress) {
        task.progress = Math.max(0, Math.min(100, progress));
        this.emit('taskProgress', { task, progress });
    }

    /**
     * Handle task completion
     */
    handleTaskResult(task, result) {
        const duration = Date.now() - task.created;

        task.status = 'completed';
        task.result = result;
        task.duration = duration;
        task.completedAt = Date.now();

        this.completedTasks.set(task.id, task);
        this.taskStats.completed++;

        // Update average duration
        this.taskStats.averageDuration =
            (this.taskStats.averageDuration * (this.taskStats.completed - 1) + duration) / this.taskStats.completed;

        // Clean up timeout
        const timeoutId = this.taskTimeouts.get(task.id);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.taskTimeouts.delete(task.id);
        }

        this.emit('taskCompleted', { task, result, duration });
        console.log(`Task ${task.id} completed in ${duration}ms`);
    }

    /**
     * Handle task errors
     */
    handleTaskError(task, error) {
        task.status = 'failed';
        task.error = error;
        task.failedAt = Date.now();

        this.taskStats.failed++;

        // Clean up timeout
        const timeoutId = this.taskTimeouts.get(task.id);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.taskTimeouts.delete(task.id);
        }

        this.emit('taskFailed', { task, error });
        console.error(`Task ${task.id} failed:`, error);
    }

    /**
     * Handle task timeout
     */
    handleTaskTimeout(task) {
        console.warn(`Task ${task.id} timed out`);

        task.status = 'timeout';
        task.error = new Error('Task timeout');
        task.failedAt = Date.now();

        this.taskStats.failed++;

        // Clean up timeout
        this.taskTimeouts.delete(task.id);

        this.emit('taskTimeout', { task });

        // Release worker
        const worker = this.activeWorkers.get(task.id);
        if (worker) {
            this.releaseWorker(worker);
        }
    }

    /**
     * Release a worker back to the pool
     */
    releaseWorker(worker) {
        worker.busy = false;
        worker.currentTask = null;
        worker.startTime = null;

        if (worker.currentTask) {
            this.activeWorkers.delete(worker.currentTask.id);
        }
    }

    /**
     * Recreate a failed worker
     */
    recreateWorker(workerId) {
        const workerIndex = this.workerPool.findIndex(w => w.id === workerId);
        if (workerIndex !== -1) {
            // Terminate old worker
            try {
                this.workerPool[workerIndex].worker.terminate();
            } catch (error) {
                console.warn(`Failed to terminate worker ${workerId}:`, error);
            }

            // Create new worker
            this.createWorker(workerId);
        }
    }

    /**
     * Cancel a task
     */
    async cancelTask(taskId) {
        const task = this.findTaskById(taskId);
        if (!task) {
            return false;
        }

        if (task.status === 'queued') {
            // Remove from queue
            const index = this.taskQueue.findIndex(t => t.id === taskId);
            if (index !== -1) {
                this.taskQueue.splice(index, 1);
            }
        } else if (task.status === 'processing') {
            // Send cancel message to worker
            const worker = this.activeWorkers.get(taskId);
            if (worker) {
                try {
                    worker.worker.postMessage({
                        type: 'cancel',
                        taskId
                    });
                } catch (error) {
                    console.warn(`Failed to cancel task ${taskId}:`, error);
                }
            }
        }

        task.status = 'cancelled';
        task.cancelledAt = Date.now();
        this.taskStats.cancelled++;

        this.emit('taskCancelled', { task });
        return true;
    }

    /**
     * Get task status
     */
    getTaskStatus(taskId) {
        const task = this.findTaskById(taskId);
        return task ? { ...task } : null;
    }

    /**
     * Get all tasks
     */
    getAllTasks() {
        const allTasks = [
            ...this.taskQueue,
            ...Array.from(this.activeWorkers.values()).map(w => w.currentTask).filter(Boolean),
            ...Array.from(this.completedTasks.values())
        ];

        return allTasks.map(task => ({ ...task }));
    }

    /**
     * Get processing statistics
     */
    getStats() {
        const workerStats = this.workerPool.map(worker => ({
            id: worker.id,
            busy: worker.busy,
            taskCount: worker.taskCount,
            currentTask: worker.currentTask ? worker.currentTask.id : null
        }));

        return {
            tasks: {
                total: this.taskStats.total,
                queued: this.taskQueue.length,
                active: this.activeWorkers.size,
                completed: this.taskStats.completed,
                failed: this.taskStats.failed,
                cancelled: this.taskStats.cancelled
            },
            workers: {
                total: this.workerPool.length,
                available: workerStats.filter(w => !w.busy).length,
                busy: workerStats.filter(w => w.busy).length,
                details: workerStats
            },
            performance: {
                averageTaskDuration: this.taskStats.averageDuration,
                successRate: this.taskStats.total > 0 ?
                    (this.taskStats.completed / this.taskStats.total) * 100 : 0
            },
            isProcessing: this.isProcessing
        };
    }

    /**
     * Find task by ID
     */
    findTaskById(taskId) {
        // Check queue
        let task = this.taskQueue.find(t => t.id === taskId);

        // Check active tasks
        if (!task) {
            for (const worker of this.workerPool) {
                if (worker.currentTask && worker.currentTask.id === taskId) {
                    task = worker.currentTask;
                    break;
                }
            }
        }

        // Check completed tasks
        if (!task) {
            task = this.completedTasks.get(taskId);
        }

        return task;
    }

    /**
     * Generate unique task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear completed tasks
     */
    clearCompletedTasks(maxAge = 3600000) { // 1 hour default
        const cutoff = Date.now() - maxAge;
        const toDelete = [];

        for (const [taskId, task] of this.completedTasks) {
            if (task.completedAt && task.completedAt < cutoff) {
                toDelete.push(taskId);
            }
        }

        toDelete.forEach(taskId => {
            this.completedTasks.delete(taskId);
        });

        console.log(`Cleared ${toDelete.length} old completed tasks`);
        return toDelete.length;
    }

    /**
     * Pause processing
     */
    pause() {
        this.isProcessing = false;
        console.log('Background processing paused');
        this.emit('paused');
    }

    /**
     * Resume processing
     */
    resume() {
        if (!this.isProcessing && this.taskQueue.length > 0) {
            this.startProcessing();
        }
        console.log('Background processing resumed');
        this.emit('resumed');
    }

    /**
     * Stop all processing
     */
    async stop() {
        this.isProcessing = false;

        // Cancel all queued tasks
        const queuedTasks = [...this.taskQueue];
        this.taskQueue = [];

        for (const task of queuedTasks) {
            task.status = 'cancelled';
            task.cancelledAt = Date.now();
            this.taskStats.cancelled++;
            this.emit('taskCancelled', { task });
        }

        // Wait for active tasks to complete or timeout
        const activePromises = Array.from(this.activeWorkers.values()).map(worker => {
            return new Promise((resolve) => {
                const checkWorker = () => {
                    if (!worker.busy) {
                        resolve();
                    } else {
                        setTimeout(checkWorker, 100);
                    }
                };
                checkWorker();
            });
        });

        if (activePromises.length > 0) {
            await Promise.race([
                Promise.all(activePromises),
                new Promise(resolve => setTimeout(resolve, 10000)) // 10 second timeout
            ]);
        }

        console.log('Background processing stopped');
        this.emit('stopped');
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        // Stop processing
        await this.stop();

        // Terminate all workers
        for (const worker of this.workerPool) {
            try {
                worker.worker.terminate();
            } catch (error) {
                console.warn(`Failed to terminate worker ${worker.id}:`, error);
            }
        }

        // Clear collections
        this.workerPool = [];
        this.taskQueue = [];
        this.activeWorkers.clear();
        this.completedTasks.clear();
        this.taskTimeouts.clear();

        // Clear event listeners
        this.removeAllListeners();

        console.log('Background Processor cleaned up');
    }
}

module.exports = BackgroundProcessor;
