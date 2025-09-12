/**
 * Performance Profiler - Advanced performance monitoring and optimization tools
 * Provides real-time performance metrics, memory analysis, and optimization recommendations
 */

const { performance, PerformanceObserver } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');
const v8 = require('v8');

class PerformanceProfiler {
    constructor(options = {}) {
        this.isEnabled = options.enabled !== false;
        this.sampleInterval = options.sampleInterval || 1000; // 1 second
        this.maxSamples = options.maxSamples || 3600; // 1 hour of data
        this.logPath = options.logPath || path.join(app.getPath('userData'), 'performance-logs');

        this.samples = [];
        this.currentSample = null;
        this.isRecording = false;
        this.sessionStart = null;

        this.metrics = {
            fps: [],
            frameTime: [],
            memoryUsage: [],
            cpuUsage: [],
            gcStats: [],
            eventLoopLag: [],
            heapStats: []
        };

        this.observers = new Map();
        this.timers = new Map();
        this.counters = new Map();

        this.performanceMarks = new Map();
        this.measurements = [];

        this.alerts = [];
        this.thresholds = {
            fps: { min: 30, critical: 15 },
            memoryUsage: { max: 500 * 1024 * 1024, critical: 800 * 1024 * 1024 }, // 500MB, 800MB
            frameTime: { max: 33, critical: 100 }, // 30fps, 10fps
            eventLoopLag: { max: 50, critical: 200 } // 50ms, 200ms
        };

        this.init();
    }

    /**
     * Initialize performance profiler
     */
    async init() {
        if (!this.isEnabled) return;

        try {
            // Ensure log directory exists
            await fs.mkdir(this.logPath, { recursive: true });

            // Setup performance observers
            this.setupPerformanceObservers();

            // Setup memory monitoring
            this.setupMemoryMonitoring();

            // Setup event loop monitoring
            this.setupEventLoopMonitoring();

            console.log('Performance profiler initialized');

        } catch (error) {
            console.error('Failed to initialize performance profiler:', error);
        }
    }

    /**
     * Setup performance observers
     */
    setupPerformanceObservers() {
        // Observe garbage collection
        const gcObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.recordGCEvent(entry);
            }
        });
        gcObserver.observe({ entryTypes: ['gc'] });
        this.observers.set('gc', gcObserver);

        // Observe function calls (if available)
        try {
            const functionObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordFunctionCall(entry);
                }
            });
            functionObserver.observe({ entryTypes: ['function'] });
            this.observers.set('function', functionObserver);
        } catch (error) {
            // Function timing might not be available
        }

        // Observe marks and measures
        const markObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'mark') {
                    this.performanceMarks.set(entry.name, entry);
                } else if (entry.entryType === 'measure') {
                    this.measurements.push(entry);
                }
            }
        });
        markObserver.observe({ entryTypes: ['mark', 'measure'] });
        this.observers.set('marks', markObserver);
    }

    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        // Monitor heap statistics
        setInterval(() => {
            if (!this.isRecording) return;

            const heapStats = v8.getHeapStatistics();
            const heapSpaceStats = v8.getHeapSpaceStatistics();

            this.recordMetric('heapStats', {
                timestamp: Date.now(),
                totalHeapSize: heapStats.total_heap_size,
                usedHeapSize: heapStats.used_heap_size,
                externalMemory: heapStats.external_memory,
                heapSizeLimit: heapStats.heap_size_limit,
                mallocedMemory: heapStats.malloced_memory,
                peakMallocedMemory: heapStats.peak_malloced_memory,
                spaces: heapSpaceStats.map(space => ({
                    spaceName: space.space_name,
                    spaceSize: space.space_size,
                    spaceUsedSize: space.space_used_size,
                    spaceAvailableSize: space.space_available_size,
                    physicalSpaceSize: space.physical_space_size
                }))
            });
        }, this.sampleInterval);
    }

    /**
     * Setup event loop monitoring
     */
    setupEventLoopMonitoring() {
        let lastCheck = performance.now();

        const checkEventLoop = () => {
            const now = performance.now();
            const lag = now - lastCheck - this.sampleInterval;

            if (this.isRecording) {
                this.recordMetric('eventLoopLag', lag);
                this.checkThresholds('eventLoopLag', lag);
            }

            lastCheck = now;
            setTimeout(checkEventLoop, this.sampleInterval);
        };

        setTimeout(checkEventLoop, this.sampleInterval);
    }

    /**
     * Start performance recording
     */
    startRecording(sessionName = null) {
        if (!this.isEnabled) return;

        this.isRecording = true;
        this.sessionStart = Date.now();
        this.currentSample = {
            sessionName: sessionName || `session_${this.sessionStart}`,
            startTime: this.sessionStart,
            samples: []
        };

        console.log(`Performance recording started: ${this.currentSample.sessionName}`);

        // Start sampling timer
        this.startSampling();

        this.emit('recording-started', {
            sessionName: this.currentSample.sessionName,
            startTime: this.sessionStart
        });
    }

    /**
     * Stop performance recording
     */
    async stopRecording() {
        if (!this.isRecording) return;

        this.isRecording = false;
        const endTime = Date.now();
        const duration = endTime - this.sessionStart;

        if (this.currentSample) {
            this.currentSample.endTime = endTime;
            this.currentSample.duration = duration;

            // Save session data
            await this.saveSessionData(this.currentSample);

            this.emit('recording-stopped', {
                sessionName: this.currentSample.sessionName,
                duration,
                sampleCount: this.currentSample.samples.length
            });
        }

        // Stop sampling
        this.stopSampling();

        console.log(`Performance recording stopped: ${duration}ms, ${this.samples.length} samples`);
    }

    /**
     * Start sampling performance metrics
     */
    startSampling() {
        this.samplingTimer = setInterval(() => {
            if (!this.isRecording) return;

            this.takeSample();
        }, this.sampleInterval);
    }

    /**
     * Stop sampling
     */
    stopSampling() {
        if (this.samplingTimer) {
            clearInterval(this.samplingTimer);
            this.samplingTimer = null;
        }
    }

    /**
     * Take performance sample
     */
    takeSample() {
        const timestamp = Date.now();
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        const sample = {
            timestamp,
            memoryUsage: {
                rss: memoryUsage.rss,
                heapTotal: memoryUsage.heapTotal,
                heapUsed: memoryUsage.heapUsed,
                external: memoryUsage.external,
                arrayBuffers: memoryUsage.arrayBuffers
            },
            cpuUsage: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            uptime: process.uptime(),
            pid: process.pid,
            platform: process.platform,
            nodeVersion: process.version
        };

        // Calculate derived metrics
        if (this.samples.length > 0) {
            const prevSample = this.samples[this.samples.length - 1];
            const timeDiff = (timestamp - prevSample.timestamp) / 1000; // seconds

            // Calculate CPU usage percentage
            const cpuDiff = {
                user: cpuUsage.user - prevSample.cpuUsage.user,
                system: cpuUsage.system - prevSample.cpuUsage.system
            };
            const totalCpuTime = cpuDiff.user + cpuDiff.system;
            sample.cpuPercent = (totalCpuTime / (timeDiff * 1000000)) * 100; // percentage
        }

        this.samples.push(sample);

        // Keep only recent samples
        if (this.samples.length > this.maxSamples) {
            this.samples = this.samples.slice(-this.maxSamples);
        }

        // Check thresholds
        this.checkThresholds('memoryUsage', memoryUsage.heapUsed);
        if (sample.cpuPercent) {
            this.checkThresholds('cpuUsage', sample.cpuPercent);
        }

        // Add to current session
        if (this.currentSample) {
            this.currentSample.samples.push(sample);
        }

        this.emit('sample-taken', sample);
    }

    /**
     * Record GC event
     */
    recordGCEvent(entry) {
        const gcEvent = {
            timestamp: Date.now(),
            kind: entry.kind,
            startTime: entry.startTime,
            duration: entry.duration,
            flags: entry.flags
        };

        this.recordMetric('gcStats', gcEvent);

        // GC events can indicate memory pressure
        if (entry.duration > 100) { // Long GC pause
            this.createAlert('warning', 'Long GC pause detected', {
                duration: entry.duration,
                kind: entry.kind
            });
        }
    }

    /**
     * Record function call
     */
    recordFunctionCall(entry) {
        // This would track function performance
        // Implementation depends on available performance APIs
    }

    /**
     * Record custom metric
     */
    recordMetric(name, value) {
        if (!this.metrics[name]) {
            this.metrics[name] = [];
        }

        const metric = {
            timestamp: Date.now(),
            value
        };

        this.metrics[name].push(metric);

        // Keep only recent metrics
        if (this.metrics[name].length > 1000) {
            this.metrics[name] = this.metrics[name].slice(-1000);
        }
    }

    /**
     * Start performance timer
     */
    startTimer(name) {
        this.timers.set(name, {
            startTime: performance.now(),
            startTimestamp: Date.now()
        });
    }

    /**
     * End performance timer
     */
    endTimer(name) {
        const timer = this.timers.get(name);
        if (!timer) return null;

        const endTime = performance.now();
        const duration = endTime - timer.startTime;

        this.timers.delete(name);

        // Record the measurement
        performance.measure(name, {
            start: timer.startTimestamp,
            end: Date.now()
        });

        return duration;
    }

    /**
     * Increment performance counter
     */
    incrementCounter(name, value = 1) {
        const current = this.counters.get(name) || 0;
        this.counters.set(name, current + value);
    }

    /**
     * Get counter value
     */
    getCounter(name) {
        return this.counters.get(name) || 0;
    }

    /**
     * Reset counter
     */
    resetCounter(name) {
        this.counters.delete(name);
    }

    /**
     * Create performance mark
     */
    mark(name) {
        performance.mark(name);
    }

    /**
     * Measure between marks
     */
    measure(name, startMark, endMark) {
        try {
            performance.measure(name, startMark, endMark);
            const entries = performance.getEntriesByName(name);
            return entries[entries.length - 1];
        } catch (error) {
            console.error('Failed to measure performance:', error);
            return null;
        }
    }

    /**
     * Check performance thresholds
     */
    checkThresholds(metric, value) {
        const threshold = this.thresholds[metric];
        if (!threshold) return;

        let level = null;
        let message = '';

        if (metric === 'memoryUsage') {
            if (value >= threshold.critical) {
                level = 'critical';
                message = `Memory usage critically high: ${(value / 1024 / 1024).toFixed(1)}MB`;
            } else if (value >= threshold.max) {
                level = 'warning';
                message = `Memory usage high: ${(value / 1024 / 1024).toFixed(1)}MB`;
            }
        } else if (metric === 'fps' && value !== undefined) {
            if (value <= threshold.critical) {
                level = 'critical';
                message = `FPS critically low: ${value.toFixed(1)}`;
            } else if (value <= threshold.min) {
                level = 'warning';
                message = `FPS low: ${value.toFixed(1)}`;
            }
        } else if (metric === 'frameTime') {
            if (value >= threshold.critical) {
                level = 'critical';
                message = `Frame time critically high: ${value.toFixed(1)}ms`;
            } else if (value >= threshold.max) {
                level = 'warning';
                message = `Frame time high: ${value.toFixed(1)}ms`;
            }
        } else if (metric === 'eventLoopLag') {
            if (value >= threshold.critical) {
                level = 'critical';
                message = `Event loop lag critically high: ${value.toFixed(1)}ms`;
            } else if (value >= threshold.max) {
                level = 'warning';
                message = `Event loop lag high: ${value.toFixed(1)}ms`;
            }
        }

        if (level) {
            this.createAlert(level, message, { metric, value, threshold });
        }
    }

    /**
     * Create performance alert
     */
    createAlert(level, message, data = {}) {
        const alert = {
            id: `alert_${Date.now()}_${Math.random()}`,
            timestamp: Date.now(),
            level, // 'warning', 'critical'
            message,
            data,
            acknowledged: false
        };

        this.alerts.push(alert);

        // Keep only recent alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }

        this.emit('alert', alert);

        console.warn(`Performance Alert [${level.toUpperCase()}]: ${message}`);
    }

    /**
     * Get performance statistics
     */
    getStatistics(timeRange = 60000) { // Last minute by default
        const now = Date.now();
        const startTime = now - timeRange;

        const recentSamples = this.samples.filter(s => s.timestamp >= startTime);

        if (recentSamples.length === 0) {
            return { error: 'No samples available for the specified time range' };
        }

        const stats = {
            timeRange,
            sampleCount: recentSamples.length,
            averageSampleInterval: timeRange / recentSamples.length,

            memoryUsage: this.calculateStats(recentSamples.map(s => s.memoryUsage.heapUsed)),
            cpuUsage: this.calculateStats(recentSamples.map(s => s.cpuPercent).filter(Boolean)),
            gcEvents: this.metrics.gcStats?.filter(gc => gc.timestamp >= startTime) || [],

            alerts: this.alerts.filter(a => a.timestamp >= startTime),
            activeTimers: Array.from(this.timers.keys()),
            counters: Object.fromEntries(this.counters)
        };

        // Calculate memory trend
        if (recentSamples.length >= 2) {
            const first = recentSamples[0].memoryUsage.heapUsed;
            const last = recentSamples[recentSamples.length - 1].memoryUsage.heapUsed;
            stats.memoryTrend = ((last - first) / first) * 100; // percentage change
        }

        return stats;
    }

    /**
     * Calculate basic statistics
     */
    calculateStats(values) {
        if (values.length === 0) return null;

        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);

        return {
            min: sorted[0],
            max: sorted[sorted.length - 1],
            average: sum / values.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }

    /**
     * Generate performance report
     */
    async generateReport(options = {}) {
        const stats = this.getStatistics(options.timeRange || 300000); // 5 minutes

        const report = {
            generatedAt: new Date().toISOString(),
            sessionInfo: {
                name: this.currentSample?.sessionName,
                duration: this.currentSample ? Date.now() - this.sessionStart : 0,
                isRecording: this.isRecording
            },
            statistics: stats,
            recommendations: this.generateRecommendations(stats),
            systemInfo: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                electronVersion: process.versions.electron,
                totalMemory: require('os').totalmem(),
                cpuCount: require('os').cpus().length
            }
        };

        // Save report if requested
        if (options.saveToFile) {
            const reportPath = path.join(this.logPath, `performance-report-${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
            report.filePath = reportPath;
        }

        return report;
    }

    /**
     * Generate optimization recommendations
     */
    generateRecommendations(stats) {
        const recommendations = [];

        // Memory recommendations
        if (stats.memoryUsage) {
            const avgMemoryMB = stats.memoryUsage.average / 1024 / 1024;

            if (avgMemoryMB > 400) {
                recommendations.push({
                    type: 'memory',
                    priority: 'high',
                    title: 'High memory usage detected',
                    description: `Average memory usage: ${avgMemoryMB.toFixed(1)}MB`,
                    suggestions: [
                        'Implement object pooling for frequently created objects',
                        'Use streaming for large file processing',
                        'Implement memory cleanup for unused assets',
                        'Consider using worker threads for heavy computations'
                    ]
                });
            }

            if (stats.memoryTrend > 10) {
                recommendations.push({
                    type: 'memory',
                    priority: 'medium',
                    title: 'Memory leak suspected',
                    description: `Memory usage increasing by ${stats.memoryTrend.toFixed(1)}% over time`,
                    suggestions: [
                        'Check for circular references',
                        'Implement proper cleanup in event listeners',
                        'Use weak references where appropriate',
                        'Monitor object creation patterns'
                    ]
                });
            }
        }

        // CPU recommendations
        if (stats.cpuUsage && stats.cpuUsage.average > 50) {
            recommendations.push({
                type: 'cpu',
                priority: 'high',
                title: 'High CPU usage detected',
                description: `Average CPU usage: ${stats.cpuUsage.average.toFixed(1)}%`,
                suggestions: [
                    'Optimize rendering loops',
                    'Implement frame rate limiting',
                    'Use Web Workers for heavy computations',
                    'Cache expensive calculations'
                ]
            });
        }

        // GC recommendations
        if (stats.gcEvents && stats.gcEvents.length > 10) {
            const avgGCDuration = stats.gcEvents.reduce((sum, gc) => sum + gc.duration, 0) / stats.gcEvents.length;

            if (avgGCDuration > 50) {
                recommendations.push({
                    type: 'gc',
                    priority: 'medium',
                    title: 'Frequent long GC pauses',
                    description: `Average GC pause: ${avgGCDuration.toFixed(1)}ms`,
                    suggestions: [
                        'Reduce object allocation rate',
                        'Use object pooling',
                        'Avoid large object creation in hot paths',
                        'Consider incremental GC tuning'
                    ]
                });
            }
        }

        // Alert-based recommendations
        if (stats.alerts && stats.alerts.length > 0) {
            const criticalAlerts = stats.alerts.filter(a => a.level === 'critical');

            if (criticalAlerts.length > 0) {
                recommendations.push({
                    type: 'alerts',
                    priority: 'critical',
                    title: 'Critical performance issues detected',
                    description: `${criticalAlerts.length} critical alerts in the last monitoring period`,
                    suggestions: [
                        'Review recent changes for performance regressions',
                        'Check for infinite loops or recursive calls',
                        'Monitor for memory leaks',
                        'Consider reducing feature complexity'
                    ]
                });
            }
        }

        return recommendations;
    }

    /**
     * Save session data
     */
    async saveSessionData(session) {
        try {
            const fileName = `${session.sessionName}.json`;
            const filePath = path.join(this.logPath, fileName);

            const data = {
                session,
                metrics: this.metrics,
                alerts: this.alerts,
                savedAt: new Date().toISOString()
            };

            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

            console.log(`Performance session saved: ${filePath}`);

        } catch (error) {
            console.error('Failed to save session data:', error);
        }
    }

    /**
     * Load session data
     */
    async loadSessionData(sessionName) {
        try {
            const filePath = path.join(this.logPath, `${sessionName}.json`);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to load session data:', error);
            return null;
        }
    }

    /**
     * Get performance summary
     */
    getSummary() {
        const stats = this.getStatistics(300000); // Last 5 minutes

        return {
            isRecording: this.isRecording,
            sessionDuration: this.sessionStart ? Date.now() - this.sessionStart : 0,
            sampleCount: this.samples.length,
            alertCount: this.alerts.length,
            activeTimers: this.timers.size,
            memoryUsage: stats.memoryUsage ? {
                current: (stats.memoryUsage.average / 1024 / 1024).toFixed(1) + 'MB',
                peak: (stats.memoryUsage.max / 1024 / 1024).toFixed(1) + 'MB'
            } : null,
            cpuUsage: stats.cpuUsage ? stats.cpuUsage.average.toFixed(1) + '%' : null,
            recentAlerts: this.alerts.slice(-5).map(a => ({
                level: a.level,
                message: a.message,
                timestamp: new Date(a.timestamp).toLocaleTimeString()
            }))
        };
    }

    /**
     * Clear all data
     */
    clearData() {
        this.samples = [];
        this.metrics = {
            fps: [],
            frameTime: [],
            memoryUsage: [],
            cpuUsage: [],
            gcStats: [],
            eventLoopLag: [],
            heapStats: []
        };
        this.alerts = [];
        this.measurements = [];
        this.performanceMarks.clear();
        this.timers.clear();
        this.counters.clear();

        console.log('Performance profiler data cleared');
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.stopRecording();
        this.stopSampling();

        // Disconnect observers
        for (const observer of this.observers.values()) {
            observer.disconnect();
        }
        this.observers.clear();

        console.log('Performance profiler cleaned up');
    }

    /**
     * Event emission helper
     */
    emit(event, data) {
        // This would integrate with the main event system
        console.log(`Performance profiler event: ${event}`, data);
    }
}

module.exports = PerformanceProfiler;
