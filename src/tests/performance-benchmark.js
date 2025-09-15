/**
 * Performance Benchmarking Suite
 * Comprehensive performance testing and benchmarking for all system components
 */

const fs = require('fs').promises;
const path = require('path');
const { performance, PerformanceObserver } = require('perf_hooks');

class PerformanceBenchmark {
    constructor(options = {}) {
        this.resultsDir = options.resultsDir || path.join(__dirname, '..', '..', 'benchmark-results');
        this.iterations = options.iterations || 100;
        this.warmupIterations = options.warmupIterations || 10;
        this.timeout = options.timeout || 30000; // 30 seconds
        this.memoryThreshold = options.memoryThreshold || 100 * 1024 * 1024; // 100MB

        this.results = [];
        this.isRunning = false;
        this.performanceObserver = null;

        this.setupPerformanceObserver();
    }

    /**
     * Setup performance observer for detailed metrics
     */
    setupPerformanceObserver() {
        this.performanceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
                console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
            }
        });

        this.performanceObserver.observe({ entryTypes: ['measure', 'function'] });
    }

    /**
     * Initialize benchmarking environment
     */
    async initialize() {
        try {
            await fs.mkdir(this.resultsDir, { recursive: true });
            console.log('Performance benchmarking suite initialized');
        } catch (error) {
            console.error('Failed to initialize benchmarking:', error);
            throw error;
        }
    }

    /**
     * Run generation speed tests
     */
    async runGenerationSpeedTests(generators, testConfigs) {
        console.log('Running generation speed tests...');

        const results = {
            type: 'generation-speed',
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {}
        };

        for (const config of testConfigs) {
            const { generatorName, generator, parameters, iterations = this.iterations } = config;

            console.log(`Testing ${generatorName} generation speed...`);

            const testResult = await this.benchmarkGeneration(generator, parameters, iterations);
            testResult.generatorName = generatorName;

            results.tests.push(testResult);
        }

        // Calculate summary statistics
        results.summary = this.calculateSummaryStatistics(results.tests);

        this.results.push(results);
        return results;
    }

    /**
     * Benchmark individual generator
     */
    async benchmarkGeneration(generator, parameters, iterations) {
        const result = {
            parameters,
            iterations,
            times: [],
            memoryUsage: [],
            errors: 0,
            averageTime: 0,
            minTime: Infinity,
            maxTime: 0,
            p95Time: 0,
            p99Time: 0,
            throughput: 0, // items per second
            memoryDelta: 0
        };

        // Warmup phase
        console.log('  Warming up...');
        for (let i = 0; i < this.warmupIterations; i++) {
            try {
                await generator.generate(parameters);
            } catch (error) {
                console.warn(`Warmup iteration ${i} failed:`, error.message);
            }
        }

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }

        const initialMemory = process.memoryUsage();

        // Benchmark phase
        console.log(`  Running ${iterations} iterations...`);
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();

            try {
                performance.mark(`gen-start-${i}`);
                const asset = await generator.generate(parameters);
                performance.mark(`gen-end-${i}`);
                performance.measure(`generation-${i}`, `gen-start-${i}`, `gen-end-${i}`);

                const endTime = performance.now();
                const duration = endTime - startTime;

                result.times.push(duration);
                result.minTime = Math.min(result.minTime, duration);
                result.maxTime = Math.max(result.maxTime, duration);

                // Track memory usage
                const memUsage = process.memoryUsage();
                result.memoryUsage.push(memUsage.heapUsed);

            } catch (error) {
                result.errors++;
                console.warn(`Iteration ${i} failed:`, error.message);
            }

            // Progress indicator
            if ((i + 1) % 10 === 0) {
                console.log(`    Completed ${i + 1}/${iterations} iterations`);
            }
        }

        const finalMemory = process.memoryUsage();
        result.memoryDelta = finalMemory.heapUsed - initialMemory.heapUsed;

        // Calculate statistics
        if (result.times.length > 0) {
            result.averageTime = result.times.reduce((sum, time) => sum + time, 0) / result.times.length;

            // Calculate percentiles
            const sortedTimes = result.times.sort((a, b) => a - b);
            const p95Index = Math.floor(sortedTimes.length * 0.95);
            const p99Index = Math.floor(sortedTimes.length * 0.99);

            result.p95Time = sortedTimes[p95Index];
            result.p99Time = sortedTimes[p99Index];

            // Calculate throughput
            result.throughput = 1000 / result.averageTime; // items per second
        }

        return result;
    }

    /**
     * Run memory usage benchmarks
     */
    async runMemoryUsageBenchmarks(generators, testConfigs) {
        console.log('Running memory usage benchmarks...');

        const results = {
            type: 'memory-usage',
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {}
        };

        for (const config of testConfigs) {
            const { generatorName, generator, parameters, iterations = 50 } = config;

            console.log(`Testing ${generatorName} memory usage...`);

            const testResult = await this.benchmarkMemoryUsage(generator, parameters, iterations);
            testResult.generatorName = generatorName;

            results.tests.push(testResult);
        }

        results.summary = this.calculateMemorySummary(results.tests);
        this.results.push(results);
        return results;
    }

    /**
     * Benchmark memory usage for generator
     */
    async benchmarkMemoryUsage(generator, parameters, iterations) {
        const result = {
            parameters,
            iterations,
            memorySnapshots: [],
            peakMemory: 0,
            averageMemory: 0,
            memoryGrowth: 0,
            memoryEfficiency: 0,
            leaksDetected: false
        };

        const initialMemory = process.memoryUsage().heapUsed;

        for (let i = 0; i < iterations; i++) {
            // Force GC before each iteration
            if (global.gc) {
                global.gc();
            }

            const beforeMemory = process.memoryUsage().heapUsed;

            try {
                await generator.generate(parameters);
            } catch (error) {
                console.warn(`Memory test iteration ${i} failed:`, error.message);
                continue;
            }

            const afterMemory = process.memoryUsage().heapUsed;
            const memoryDelta = afterMemory - beforeMemory;

            result.memorySnapshots.push({
                iteration: i,
                before: beforeMemory,
                after: afterMemory,
                delta: memoryDelta
            });

            result.peakMemory = Math.max(result.peakMemory, afterMemory);
        }

        const finalMemory = process.memoryUsage().heapUsed;
        result.memoryGrowth = finalMemory - initialMemory;

        // Calculate average memory usage
        if (result.memorySnapshots.length > 0) {
            result.averageMemory = result.memorySnapshots.reduce((sum, snap) => sum + snap.after, 0) / result.memorySnapshots.length;
        }

        // Calculate memory efficiency (lower is better)
        result.memoryEfficiency = result.memoryGrowth / iterations;

        // Detect potential memory leaks
        const recentSnapshots = result.memorySnapshots.slice(-10);
        if (recentSnapshots.length >= 5) {
            const trend = this.calculateMemoryTrend(recentSnapshots);
            result.leaksDetected = trend > 1024 * 1024; // 1MB growth trend
        }

        return result;
    }

    /**
     * Run CPU usage profiling
     */
    async runCpuUsageProfiling(generators, testConfigs) {
        console.log('Running CPU usage profiling...');

        const results = {
            type: 'cpu-usage',
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {}
        };

        for (const config of testConfigs) {
            const { generatorName, generator, parameters, duration = 10000 } = config; // 10 seconds

            console.log(`Profiling ${generatorName} CPU usage...`);

            const testResult = await this.profileCpuUsage(generator, parameters, duration);
            testResult.generatorName = generatorName;

            results.tests.push(testResult);
        }

        results.summary = this.calculateCpuSummary(results.tests);
        this.results.push(results);
        return results;
    }

    /**
     * Profile CPU usage for generator
     */
    async profileCpuUsage(generator, parameters, duration) {
        const result = {
            parameters,
            duration,
            cpuUsage: [],
            averageCpu: 0,
            peakCpu: 0,
            cpuEfficiency: 0,
            timeSpent: 0
        };

        const startTime = process.hrtime.bigint();
        let operationsCompleted = 0;

        // Run operations for specified duration
        const endTime = Date.now() + duration;

        while (Date.now() < endTime) {
            try {
                await generator.generate(parameters);
                operationsCompleted++;

                // Sample CPU usage every 100ms
                if (operationsCompleted % 10 === 0) {
                    const cpuUsage = process.cpuUsage();
                    const totalCpu = (cpuUsage.user + cpuUsage.system) / 1000; // Convert to milliseconds
                    result.cpuUsage.push(totalCpu);
                    result.peakCpu = Math.max(result.peakCpu, totalCpu);
                }
            } catch (error) {
                console.warn('CPU profiling iteration failed:', error.message);
            }
        }

        const endHrtime = process.hrtime.bigint();
        result.timeSpent = Number(endHrtime - startTime) / 1e6; // Convert to milliseconds

        // Calculate average CPU usage
        if (result.cpuUsage.length > 0) {
            result.averageCpu = result.cpuUsage.reduce((sum, cpu) => sum + cpu, 0) / result.cpuUsage.length;
        }

        // Calculate CPU efficiency (operations per CPU millisecond)
        if (result.averageCpu > 0) {
            result.cpuEfficiency = operationsCompleted / result.averageCpu;
        }

        result.operationsCompleted = operationsCompleted;
        result.operationsPerSecond = operationsCompleted / (duration / 1000);

        return result;
    }

    /**
     * Run scalability tests
     */
    async runScalabilityTests(generators, testConfigs) {
        console.log('Running scalability tests...');

        const results = {
            type: 'scalability',
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {}
        };

        for (const config of testConfigs) {
            const { generatorName, generator, parameters, concurrencyLevels = [1, 2, 4, 8, 16] } = config;

            console.log(`Testing ${generatorName} scalability...`);

            const testResult = await this.testScalability(generator, parameters, concurrencyLevels);
            testResult.generatorName = generatorName;

            results.tests.push(testResult);
        }

        results.summary = this.calculateScalabilitySummary(results.tests);
        this.results.push(results);
        return results;
    }

    /**
     * Test scalability with different concurrency levels
     */
    async testScalability(generator, parameters, concurrencyLevels) {
        const result = {
            parameters,
            concurrencyLevels,
            results: []
        };

        for (const concurrency of concurrencyLevels) {
            console.log(`    Testing with ${concurrency} concurrent operations...`);

            const concurrencyResult = await this.testConcurrencyLevel(generator, parameters, concurrency);
            result.results.push({
                concurrency,
                ...concurrencyResult
            });
        }

        return result;
    }

    /**
     * Test specific concurrency level
     */
    async testConcurrencyLevel(generator, parameters, concurrency) {
        const promises = [];
        const startTime = performance.now();

        // Create concurrent operations
        for (let i = 0; i < concurrency; i++) {
            promises.push(this.timedGeneration(generator, parameters));
        }

        const results = await Promise.all(promises);
        const endTime = performance.now();

        const totalTime = endTime - startTime;
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const averageTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

        return {
            totalTime,
            successful,
            failed,
            averageTime,
            throughput: successful / (totalTime / 1000), // operations per second
            efficiency: successful / concurrency // success rate
        };
    }

    /**
     * Timed generation for concurrency testing
     */
    async timedGeneration(generator, parameters) {
        const startTime = performance.now();

        try {
            await generator.generate(parameters);
            const endTime = performance.now();

            return {
                success: true,
                duration: endTime - startTime
            };
        } catch (error) {
            const endTime = performance.now();

            return {
                success: false,
                duration: endTime - startTime,
                error: error.message
            };
        }
    }

    /**
     * Calculate summary statistics
     */
    calculateSummaryStatistics(tests) {
        const summary = {
            totalTests: tests.length,
            averageGenerationTime: 0,
            fastestGenerator: null,
            slowestGenerator: null,
            mostEfficient: null,
            leastEfficient: null
        };

        if (tests.length === 0) return summary;

        let totalTime = 0;
        let fastestTime = Infinity;
        let slowestTime = 0;
        let highestThroughput = 0;
        let lowestThroughput = Infinity;

        for (const test of tests) {
            totalTime += test.averageTime;

            if (test.averageTime < fastestTime) {
                fastestTime = test.averageTime;
                summary.fastestGenerator = test.generatorName;
            }

            if (test.averageTime > slowestTime) {
                slowestTime = test.averageTime;
                summary.slowestGenerator = test.generatorName;
            }

            if (test.throughput > highestThroughput) {
                highestThroughput = test.throughput;
                summary.mostEfficient = test.generatorName;
            }

            if (test.throughput < lowestThroughput) {
                lowestThroughput = test.throughput;
                summary.leastEfficient = test.generatorName;
            }
        }

        summary.averageGenerationTime = totalTime / tests.length;

        return summary;
    }

    /**
     * Calculate memory summary
     */
    calculateMemorySummary(tests) {
        const summary = {
            totalTests: tests.length,
            averageMemoryGrowth: 0,
            highestMemoryUsage: 0,
            mostMemoryEfficient: null,
            leastMemoryEfficient: null,
            potentialLeaks: []
        };

        if (tests.length === 0) return summary;

        let totalGrowth = 0;

        for (const test of tests) {
            totalGrowth += test.memoryGrowth;

            if (test.peakMemory > summary.highestMemoryUsage) {
                summary.highestMemoryUsage = test.peakMemory;
            }

            if (test.leaksDetected) {
                summary.potentialLeaks.push(test.generatorName);
            }
        }

        summary.averageMemoryGrowth = totalGrowth / tests.length;

        return summary;
    }

    /**
     * Calculate CPU summary
     */
    calculateCpuSummary(tests) {
        const summary = {
            totalTests: tests.length,
            averageCpuUsage: 0,
            highestCpuUsage: 0,
            mostCpuEfficient: null,
            leastCpuEfficient: null
        };

        if (tests.length === 0) return summary;

        let totalCpu = 0;
        let highestEfficiency = 0;
        let lowestEfficiency = Infinity;

        for (const test of tests) {
            totalCpu += test.averageCpu;

            if (test.averageCpu > summary.highestCpuUsage) {
                summary.highestCpuUsage = test.averageCpu;
            }

            if (test.cpuEfficiency > highestEfficiency) {
                highestEfficiency = test.cpuEfficiency;
                summary.mostCpuEfficient = test.generatorName;
            }

            if (test.cpuEfficiency < lowestEfficiency) {
                lowestEfficiency = test.cpuEfficiency;
                summary.leastCpuEfficient = test.generatorName;
            }
        }

        summary.averageCpuUsage = totalCpu / tests.length;

        return summary;
    }

    /**
     * Calculate scalability summary
     */
    calculateScalabilitySummary(tests) {
        const summary = {
            totalTests: tests.length,
            bestScalability: null,
            worstScalability: null,
            averageEfficiency: 0
        };

        // Analyze scalability patterns
        for (const test of tests) {
            const scalability = this.analyzeScalabilityPattern(test.results);
            // Implementation would analyze how performance scales with concurrency
        }

        return summary;
    }

    /**
     * Analyze scalability pattern
     */
    analyzeScalabilityPattern(results) {
        // Analyze how throughput changes with concurrency
        const pattern = {
            linearScaling: true,
            efficiency: 0,
            optimalConcurrency: 1
        };

        // Implementation would analyze scaling efficiency
        return pattern;
    }

    /**
     * Calculate memory trend
     */
    calculateMemoryTrend(snapshots) {
        if (snapshots.length < 2) return 0;

        const first = snapshots[0].after;
        const last = snapshots[snapshots.length - 1].after;

        return (last - first) / snapshots.length;
    }

    /**
     * Generate comprehensive benchmark report
     */
    async generateReport(options = {}) {
        const { format = 'json', includeCharts = true } = options;

        const report = {
            timestamp: new Date().toISOString(),
            summary: this.generateOverallSummary(),
            detailed: this.results,
            recommendations: this.generateRecommendations()
        };

        const reportPath = path.join(this.resultsDir, `benchmark-report_${Date.now()}.${format}`);

        if (format === 'json') {
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        } else if (format === 'html') {
            const htmlReport = this.generateHTMLReport(report);
            await fs.writeFile(reportPath, htmlReport);
        }

        console.log(`Benchmark report saved: ${reportPath}`);
        return report;
    }

    /**
     * Generate overall summary
     */
    generateOverallSummary() {
        const summary = {
            totalBenchmarks: this.results.length,
            benchmarkTypes: new Set(),
            performance: {},
            memory: {},
            cpu: {},
            scalability: {}
        };

        for (const result of this.results) {
            summary.benchmarkTypes.add(result.type);

            switch (result.type) {
                case 'generation-speed':
                    summary.performance = result.summary;
                    break;
                case 'memory-usage':
                    summary.memory = result.summary;
                    break;
                case 'cpu-usage':
                    summary.cpu = result.summary;
                    break;
                case 'scalability':
                    summary.scalability = result.summary;
                    break;
            }
        }

        summary.benchmarkTypes = Array.from(summary.benchmarkTypes);
        return summary;
    }

    /**
     * Generate recommendations based on results
     */
    generateRecommendations() {
        const recommendations = [];

        for (const result of this.results) {
            switch (result.type) {
                case 'generation-speed':
                    if (result.summary.averageGenerationTime > 2000) {
                        recommendations.push('Consider optimizing generation algorithms for better performance');
                    }
                    break;
                case 'memory-usage':
                    if (result.summary.potentialLeaks.length > 0) {
                        recommendations.push(`Investigate potential memory leaks in: ${result.summary.potentialLeaks.join(', ')}`);
                    }
                    break;
                case 'cpu-usage':
                    if (result.summary.averageCpuUsage > 80) {
                        recommendations.push('High CPU usage detected - consider implementing CPU throttling');
                    }
                    break;
            }
        }

        return recommendations;
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Benchmark Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f0f0f0; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .benchmark { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #e9ecef; border-radius: 3px; }
        .good { background: #d4edda; }
        .warning { background: #fff3cd; }
        .danger { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>Performance Benchmark Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Timestamp:</strong> ${report.timestamp}</p>
        <p><strong>Total Benchmarks:</strong> ${report.summary.totalBenchmarks}</p>
        <p><strong>Benchmark Types:</strong> ${report.summary.benchmarkTypes.join(', ')}</p>
    </div>

    <h2>Detailed Results</h2>
    ${report.detailed.map(result => `
        <div class="benchmark">
            <h3>${result.type.toUpperCase()}</h3>
            <div class="metric">Tests: ${result.tests.length}</div>
            ${this.formatBenchmarkMetrics(result)}
        </div>
    `).join('')}

    <h2>Recommendations</h2>
    <ul>
        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
</body>
</html>`;
    }

    /**
     * Format benchmark metrics for HTML
     */
    formatBenchmarkMetrics(result) {
        let metrics = '';

        switch (result.type) {
            case 'generation-speed':
                metrics = `
                    <div class="metric">Avg Time: ${result.summary.averageGenerationTime.toFixed(2)}ms</div>
                    <div class="metric">Fastest: ${result.summary.fastestGenerator}</div>
                    <div class="metric">Most Efficient: ${result.summary.mostEfficient}</div>
                `;
                break;
            case 'memory-usage':
                metrics = `
                    <div class="metric">Avg Growth: ${(result.summary.averageMemoryGrowth / 1024 / 1024).toFixed(2)}MB</div>
                    <div class="metric">Peak Usage: ${(result.summary.highestMemoryUsage / 1024 / 1024).toFixed(2)}MB</div>
                    ${result.summary.potentialLeaks.length > 0 ? `<div class="metric warning">Leaks: ${result.summary.potentialLeaks.join(', ')}</div>` : ''}
                `;
                break;
            case 'cpu-usage':
                metrics = `
                    <div class="metric">Avg CPU: ${result.summary.averageCpuUsage.toFixed(2)}%</div>
                    <div class="metric">Most Efficient: ${result.summary.mostCpuEfficient}</div>
                `;
                break;
        }

        return metrics;
    }

    /**
     * Cleanup benchmark resources
     */
    async cleanup() {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }

        // Force garbage collection
        if (global.gc) {
            global.gc();
        }

        console.log('Benchmark cleanup completed');
    }
}

module.exports = PerformanceBenchmark;
