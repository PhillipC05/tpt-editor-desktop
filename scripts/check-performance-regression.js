#!/usr/bin/env node

/**
 * Performance Regression Detection Script
 * Compares current performance metrics with historical baselines
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceRegressionChecker {
    constructor() {
        this.baselineDir = path.join(__dirname, '..', 'performance-baselines');
        this.resultsDir = path.join(__dirname, '..', 'benchmark-results');
        this.thresholds = {
            generationSpeed: 0.1, // 10% degradation allowed
            memoryUsage: 0.15,    // 15% increase allowed
            cpuUsage: 0.2,        // 20% increase allowed
            scalability: 0.1      // 10% degradation allowed
        };
    }

    async run() {
        try {
            console.log('🔍 Checking for performance regressions...');

            // Ensure directories exist
            await fs.mkdir(this.baselineDir, { recursive: true });
            await fs.mkdir(this.resultsDir, { recursive: true });

            // Load current results
            const currentResults = await this.loadCurrentResults();

            if (!currentResults) {
                console.log('No current performance results found. Creating baseline...');
                await this.createBaseline();
                return;
            }

            // Load baseline
            const baseline = await this.loadBaseline();

            if (!baseline) {
                console.log('No baseline found. Saving current results as baseline...');
                await this.saveBaseline(currentResults);
                return;
            }

            // Compare results
            const regressions = await this.compareResults(baseline, currentResults);

            // Generate report
            const report = await this.generateRegressionReport(regressions, currentResults);

            // Save report
            await this.saveRegressionReport(report);

            // Check if any regressions exceed thresholds
            const criticalRegressions = regressions.filter(r => r.severity === 'critical');

            if (criticalRegressions.length > 0) {
                console.error('🚨 CRITICAL PERFORMANCE REGRESSIONS DETECTED!');
                console.error(`Found ${criticalRegressions.length} critical regression(s)`);

                // Exit with error code to fail CI
                process.exit(1);
            } else if (regressions.length > 0) {
                console.warn('⚠️  Performance regressions detected but within acceptable thresholds');
                console.warn(`Found ${regressions.length} regression(s)`);
            } else {
                console.log('✅ No significant performance regressions detected');
            }

        } catch (error) {
            console.error('Failed to check performance regressions:', error);
            process.exit(1);
        }
    }

    async loadCurrentResults() {
        try {
            const files = await fs.readdir(this.resultsDir);
            const latestFile = files
                .filter(f => f.endsWith('.json'))
                .sort()
                .reverse()[0];

            if (!latestFile) return null;

            const filePath = path.join(this.resultsDir, latestFile);
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.warn('Failed to load current results:', error.message);
            return null;
        }
    }

    async loadBaseline() {
        try {
            const baselinePath = path.join(this.baselineDir, 'performance-baseline.json');
            const content = await fs.readFile(baselinePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }

    async saveBaseline(results) {
        const baselinePath = path.join(this.baselineDir, 'performance-baseline.json');
        const baseline = {
            timestamp: new Date().toISOString(),
            version: this.getCurrentVersion(),
            results: results
        };

        await fs.writeFile(baselinePath, JSON.stringify(baseline, null, 2));
        console.log('✅ Baseline saved');
    }

    async createBaseline() {
        // Run performance benchmarks to create initial baseline
        const { PerformanceBenchmark } = require('../src/tests/performance-benchmark');
        const benchmark = new PerformanceBenchmark();

        console.log('Running initial performance benchmarks...');

        // Run basic benchmarks for key generators
        const generators = [
            { name: 'Character Generator', generator: require('../src/generators/sprite-generators/character-generator') },
            { name: 'Building Generator', generator: require('../src/generators/building-generator') },
            { name: 'Particle Generator', generator: require('../src/generators/particle-generator') }
        ];

        const testConfigs = generators.map(g => ({
            generatorName: g.name,
            generator: g.generator,
            parameters: {},
            iterations: 50
        }));

        await benchmark.runGenerationSpeedTests(generators, testConfigs);
        await benchmark.runMemoryUsageBenchmarks(generators, testConfigs);

        const results = benchmark.results;
        await this.saveBaseline(results);

        console.log('✅ Initial baseline created');
    }

    async compareResults(baseline, current) {
        const regressions = [];

        // Compare generation speed
        if (baseline.results.generationSpeed && current.generationSpeed) {
            const genRegressions = this.compareGenerationSpeed(
                baseline.results.generationSpeed,
                current.generationSpeed
            );
            regressions.push(...genRegressions);
        }

        // Compare memory usage
        if (baseline.results.memoryUsage && current.memoryUsage) {
            const memRegressions = this.compareMemoryUsage(
                baseline.results.memoryUsage,
                current.memoryUsage
            );
            regressions.push(...memRegressions);
        }

        // Compare CPU usage
        if (baseline.results.cpuUsage && current.cpuUsage) {
            const cpuRegressions = this.compareCpuUsage(
                baseline.results.cpuUsage,
                current.cpuUsage
            );
            regressions.push(...cpuRegressions);
        }

        return regressions;
    }

    compareGenerationSpeed(baseline, current) {
        const regressions = [];

        baseline.tests.forEach((baselineTest, index) => {
            const currentTest = current.tests[index];
            if (!currentTest) return;

            const degradation = (currentTest.averageTime - baselineTest.averageTime) / baselineTest.averageTime;

            if (degradation > this.thresholds.generationSpeed) {
                regressions.push({
                    type: 'generation-speed',
                    generator: baselineTest.generatorName,
                    baseline: baselineTest.averageTime,
                    current: currentTest.averageTime,
                    degradation: degradation,
                    severity: degradation > this.thresholds.generationSpeed * 2 ? 'critical' : 'warning',
                    message: `${baselineTest.generatorName} generation speed degraded by ${(degradation * 100).toFixed(1)}%`
                });
            }
        });

        return regressions;
    }

    compareMemoryUsage(baseline, current) {
        const regressions = [];

        baseline.tests.forEach((baselineTest, index) => {
            const currentTest = current.tests[index];
            if (!currentTest) return;

            const increase = (currentTest.averageMemory - baselineTest.averageMemory) / baselineTest.averageMemory;

            if (increase > this.thresholds.memoryUsage) {
                regressions.push({
                    type: 'memory-usage',
                    generator: baselineTest.generatorName,
                    baseline: baselineTest.averageMemory,
                    current: currentTest.averageMemory,
                    increase: increase,
                    severity: increase > this.thresholds.memoryUsage * 2 ? 'critical' : 'warning',
                    message: `${baselineTest.generatorName} memory usage increased by ${(increase * 100).toFixed(1)}%`
                });
            }
        });

        return regressions;
    }

    compareCpuUsage(baseline, current) {
        const regressions = [];

        baseline.tests.forEach((baselineTest, index) => {
            const currentTest = current.tests[index];
            if (!currentTest) return;

            const increase = (currentTest.averageCpu - baselineTest.averageCpu) / baselineTest.averageCpu;

            if (increase > this.thresholds.cpuUsage) {
                regressions.push({
                    type: 'cpu-usage',
                    generator: baselineTest.generatorName,
                    baseline: baselineTest.averageCpu,
                    current: currentTest.averageCpu,
                    increase: increase,
                    severity: increase > this.thresholds.cpuUsage * 2 ? 'critical' : 'warning',
                    message: `${baselineTest.generatorName} CPU usage increased by ${(increase * 100).toFixed(1)}%`
                });
            }
        });

        return regressions;
    }

    async generateRegressionReport(regressions, currentResults) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalRegressions: regressions.length,
                criticalRegressions: regressions.filter(r => r.severity === 'critical').length,
                warningRegressions: regressions.filter(r => r.severity === 'warning').length,
                status: regressions.some(r => r.severity === 'critical') ? 'failed' : 'passed'
            },
            regressions: regressions,
            currentPerformance: {
                generationSpeed: currentResults.generationSpeed?.summary,
                memoryUsage: currentResults.memoryUsage?.summary,
                cpuUsage: currentResults.cpuUsage?.summary
            },
            recommendations: this.generateRecommendations(regressions)
        };

        return report;
    }

    generateRecommendations(regressions) {
        const recommendations = [];

        const criticalCount = regressions.filter(r => r.severity === 'critical').length;
        const generationRegressions = regressions.filter(r => r.type === 'generation-speed');
        const memoryRegressions = regressions.filter(r => r.type === 'memory-usage');
        const cpuRegressions = regressions.filter(r => r.type === 'cpu-usage');

        if (criticalCount > 0) {
            recommendations.push('🚨 Critical performance regressions detected. Immediate investigation required.');
        }

        if (generationRegressions.length > 0) {
            recommendations.push('🔧 Review recent changes to generation algorithms for performance optimizations.');
        }

        if (memoryRegressions.length > 0) {
            recommendations.push('💾 Investigate memory leaks and optimize memory usage patterns.');
        }

        if (cpuRegressions.length > 0) {
            recommendations.push('⚡ Consider implementing CPU throttling or optimizing CPU-intensive operations.');
        }

        if (regressions.length === 0) {
            recommendations.push('✅ Performance is within acceptable thresholds. Keep monitoring.');
        }

        return recommendations;
    }

    async saveRegressionReport(report) {
        const reportPath = path.join(this.resultsDir, `regression-report_${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        // Also save HTML version
        const htmlReport = this.generateHTMLReport(report);
        const htmlPath = path.join(this.resultsDir, `regression-report_${Date.now()}.html`);
        await fs.writeFile(htmlPath, htmlReport);

        console.log(`📊 Regression report saved: ${reportPath}`);
        console.log(`📄 HTML report saved: ${htmlPath}`);
    }

    generateHTMLReport(report) {
        const statusColor = report.summary.status === 'failed' ? '#dc3545' : '#28a745';
        const statusIcon = report.summary.status === 'failed' ? '🚨' : '✅';

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Regression Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: ${statusColor}; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .regression { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .critical { background: #f8d7da; border-color: #f5c6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .metric { display: inline-block; margin: 5px 10px 5px 0; padding: 5px 10px; background: #e9ecef; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${statusIcon} Performance Regression Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>

    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">Total Regressions: ${report.summary.totalRegressions}</div>
        <div class="metric">Critical: ${report.summary.criticalRegressions}</div>
        <div class="metric">Warnings: ${report.summary.warningRegressions}</div>
        <div class="metric">Status: ${report.summary.status.toUpperCase()}</div>
    </div>

    <h2>Regressions</h2>
    ${report.regressions.length === 0 ?
        '<p>✅ No performance regressions detected</p>' :
        report.regressions.map(r => `
            <div class="regression ${r.severity}">
                <h3>${r.generator} - ${r.type.replace('-', ' ').toUpperCase()}</h3>
                <p><strong>${r.message}</strong></p>
                <div class="metric">Baseline: ${r.baseline.toFixed(2)}</div>
                <div class="metric">Current: ${r.current.toFixed(2)}</div>
                <div class="metric">Change: ${((r.degradation || r.increase) * 100).toFixed(1)}%</div>
            </div>
        `).join('')
    }

    <h2>Recommendations</h2>
    <ul>
        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
</body>
</html>`;
    }

    getCurrentVersion() {
        try {
            const packageJson = require('../package.json');
            return packageJson.version;
        } catch {
            return 'unknown';
        }
    }
}

// Run the regression checker
if (require.main === module) {
    const checker = new PerformanceRegressionChecker();
    checker.run().catch(error => {
        console.error('Performance regression check failed:', error);
        process.exit(1);
    });
}

module.exports = PerformanceRegressionChecker;
