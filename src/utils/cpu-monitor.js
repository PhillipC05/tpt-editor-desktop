/**
 * TPT Asset Editor Desktop - CPU Monitor
 * Monitors CPU usage and provides throttling capabilities
 */

const os = require('os');
const { performance } = require('perf_hooks');

class CPUMonitor {
    /**
     * Creates a new CPU monitor instance
     * @param {Object} [options={}] - Monitor options
     * @param {number} [options.sampleInterval=1000] - Sampling interval in milliseconds
     * @param {number} [options.historySize=60] - Number of samples to keep in history
     * @param {number} [options.highThreshold=80] - High CPU usage threshold (percentage)
     * @param {number} [options.criticalThreshold=95] - Critical CPU usage threshold (percentage)
     */
    constructor(options = {}) {
        this.options = {
            sampleInterval: 1000,
            historySize: 60,
            highThreshold: 80,
            criticalThreshold: 95,
            ...options
        };

        this.samples = [];
        this.isMonitoring = false;
        this.intervalId = null;
        this.listeners = new Map();

        // CPU usage tracking
        this.lastCpuUsage = process.cpuUsage();
        this.lastTimestamp = performance.now();

        // Throttling state
        this.isThrottling = false;
        this.throttleLevel = 0; // 0 = no throttling, 1-3 = increasing levels
        this.throttledOperations = new Set();

        // Bind methods
        this.startMonitoring = this.startMonitoring.bind(this);
        this.stopMonitoring = this.stopMonitoring.bind(this);
        this.takeSample = this.takeSample.bind(this);
        this.getCurrentUsage = this.getCurrentUsage.bind(this);
        this.shouldThrottle = this.shouldThrottle.bind(this);
        this.throttleOperation = this.throttleOperation.bind(this);
    }

    /**
     * Start CPU monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.intervalId = setInterval(this.takeSample, this.options.sampleInterval);

        this.emit('monitoringStarted');
        console.log('CPU monitoring started');
    }

    /**
     * Stop CPU monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.emit('monitoringStopped');
        console.log('CPU monitoring stopped');
    }

    /**
     * Take a CPU usage sample
     */
    takeSample() {
        const currentUsage = this.getCurrentUsage();
        const timestamp = Date.now();

        const sample = {
            timestamp,
            usage: currentUsage,
            throttleLevel: this.throttleLevel,
            isThrottling: this.isThrottling
        };

        this.samples.push(sample);

        // Maintain history size
        if (this.samples.length > this.options.historySize) {
            this.samples.shift();
        }

        // Check thresholds and emit events
        this.checkThresholds(currentUsage);

        // Update throttling state
        this.updateThrottlingState(currentUsage);

        this.emit('sample', sample);
    }

    /**
     * Get current CPU usage percentage
     * @returns {number} CPU usage percentage (0-100)
     */
    getCurrentUsage() {
        const currentCpuUsage = process.cpuUsage();
        const currentTimestamp = performance.now();

        // Calculate CPU usage since last measurement
        const cpuTimeDiff = (currentCpuUsage.user + currentCpuUsage.system) -
                           (this.lastCpuUsage.user + this.lastCpuUsage.system);
        const timeDiff = currentTimestamp - this.lastTimestamp;

        // Update for next measurement
        this.lastCpuUsage = currentCpuUsage;
        this.lastTimestamp = currentTimestamp;

        if (timeDiff === 0) return 0;

        // Convert to percentage (assuming single CPU core for simplicity)
        // In a real application, you'd divide by os.cpus().length
        const usagePercent = (cpuTimeDiff / (timeDiff * 1000)) * 100;

        return Math.min(100, Math.max(0, usagePercent));
    }

    /**
     * Check CPU usage thresholds and emit events
     * @param {number} usage - Current CPU usage percentage
     */
    checkThresholds(usage) {
        if (usage >= this.options.criticalThreshold) {
            this.emit('critical', { usage, threshold: this.options.criticalThreshold });
        } else if (usage >= this.options.highThreshold) {
            this.emit('high', { usage, threshold: this.options.highThreshold });
        } else if (usage < this.options.highThreshold - 10) {
            this.emit('normal', { usage });
        }
    }

    /**
     * Update throttling state based on CPU usage
     * @param {number} usage - Current CPU usage percentage
     */
    updateThrottlingState(usage) {
        const oldThrottleLevel = this.throttleLevel;
        let newThrottleLevel = 0;

        if (usage >= this.options.criticalThreshold) {
            newThrottleLevel = 3; // Maximum throttling
        } else if (usage >= this.options.highThreshold) {
            newThrottleLevel = 2; // High throttling
        } else if (usage >= this.options.highThreshold - 20) {
            newThrottleLevel = 1; // Light throttling
        }

        if (newThrottleLevel !== oldThrottleLevel) {
            this.throttleLevel = newThrottleLevel;
            this.isThrottling = newThrottleLevel > 0;

            this.emit('throttleLevelChanged', {
                oldLevel: oldThrottleLevel,
                newLevel: newThrottleLevel,
                usage
            });
        }
    }

    /**
     * Check if operations should be throttled
     * @param {string} [operationType] - Type of operation to check
     * @returns {boolean} True if operation should be throttled
     */
    shouldThrottle(operationType = null) {
        if (!this.isThrottling) return false;

        if (operationType && this.throttledOperations.has(operationType)) {
            return true;
        }

        return this.throttleLevel > 0;
    }

    /**
     * Throttle an operation based on current CPU usage
     * @param {Function} operation - Operation to throttle
     * @param {Object} [options={}] - Throttling options
     * @param {string} [options.type] - Operation type for tracking
     * @param {number} [options.priority=1] - Operation priority (1-3, higher = more important)
     * @returns {Promise|undefined} Operation result or undefined if throttled
     */
    async throttleOperation(operation, options = {}) {
        const { type, priority = 1 } = options;

        // Don't throttle high-priority operations unless critical
        if (priority >= 3 && this.throttleLevel < 3) {
            return operation();
        }

        // Check if this operation type is already throttled
        if (type && this.throttledOperations.has(type)) {
            this.emit('operationThrottled', { type, priority, throttleLevel: this.throttleLevel });
            return undefined;
        }

        // Apply throttling based on level
        if (this.shouldThrottle(type)) {
            const delay = this.getThrottleDelay();
            await this.sleep(delay);

            if (type) {
                this.throttledOperations.add(type);
                // Remove from throttled set after delay
                setTimeout(() => {
                    this.throttledOperations.delete(type);
                }, delay * 2);
            }
        }

        return operation();
    }

    /**
     * Get throttle delay based on current level
     * @returns {number} Delay in milliseconds
     */
    getThrottleDelay() {
        switch (this.throttleLevel) {
            case 1: return 100;  // Light throttling
            case 2: return 500;  // High throttling
            case 3: return 2000; // Critical throttling
            default: return 0;
        }
    }

    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get CPU usage statistics
     * @param {number} [timeRange] - Time range in milliseconds for statistics
     * @returns {Object} CPU usage statistics
     */
    getStatistics(timeRange = null) {
        let samples = this.samples;

        if (timeRange) {
            const cutoffTime = Date.now() - timeRange;
            samples = this.samples.filter(sample => sample.timestamp >= cutoffTime);
        }

        if (samples.length === 0) {
            return {
                current: 0,
                average: 0,
                min: 0,
                max: 0,
                samples: 0,
                throttleLevel: this.throttleLevel,
                isThrottling: this.isThrottling
            };
        }

        const usages = samples.map(sample => sample.usage);
        const current = usages[usages.length - 1];

        return {
            current,
            average: usages.reduce((sum, usage) => sum + usage, 0) / usages.length,
            min: Math.min(...usages),
            max: Math.max(...usages),
            samples: samples.length,
            throttleLevel: this.throttleLevel,
            isThrottling: this.isThrottling,
            timeRange: timeRange || (samples.length * this.options.sampleInterval)
        };
    }

    /**
     * Get CPU usage history
     * @param {number} [limit] - Maximum number of samples to return
     * @returns {Array} Array of CPU usage samples
     */
    getHistory(limit = null) {
        const samples = limit ? this.samples.slice(-limit) : this.samples;
        return samples.map(sample => ({
            timestamp: sample.timestamp,
            usage: sample.usage,
            throttleLevel: sample.throttleLevel,
            isThrottling: sample.isThrottling
        }));
    }

    /**
     * Set CPU usage thresholds
     * @param {Object} thresholds - New threshold values
     * @param {number} [thresholds.high] - High CPU usage threshold
     * @param {number} [thresholds.critical] - Critical CPU usage threshold
     */
    setThresholds(thresholds) {
        if (thresholds.high !== undefined) {
            this.options.highThreshold = thresholds.high;
        }
        if (thresholds.critical !== undefined) {
            this.options.criticalThreshold = thresholds.critical;
        }

        this.emit('thresholdsChanged', {
            high: this.options.highThreshold,
            critical: this.options.criticalThreshold
        });
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event listener function
     */
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(listener);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event listener function
     */
    off(event, listener) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`Error in CPU monitor event listener:`, error);
                }
            });
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopMonitoring();
        this.listeners.clear();
        this.samples = [];
        this.throttledOperations.clear();
    }

    /**
     * Get system CPU information
     * @returns {Object} System CPU information
     */
    static getSystemInfo() {
        const cpus = os.cpus();
        return {
            count: cpus.length,
            model: cpus[0]?.model || 'Unknown',
            speed: cpus[0]?.speed || 0,
            platform: os.platform(),
            arch: os.arch(),
            loadAverage: os.loadavg()
        };
    }

    /**
     * Create a throttled version of a function
     * @param {Function} func - Function to throttle
     * @param {Object} [options={}] - Throttling options
     * @returns {Function} Throttled function
     */
    createThrottledFunction(func, options = {}) {
        return async (...args) => {
            return this.throttleOperation(() => func(...args), options);
        };
    }
}

module.exports = CPUMonitor;
