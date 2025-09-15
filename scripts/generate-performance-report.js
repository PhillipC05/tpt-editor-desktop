#!/usr/bin/env node

/**
 * Performance Report Generator
 * Generates comprehensive performance reports from benchmark results
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceReportGenerator {
    constructor() {
        this.resultsDir = path.join(__dirname, '..', 'benchmark-results');
        this.reportsDir = path.join(__dirname, '..', 'performance-reports');
        this.baselineDir = path.join(__dirname, '..', 'performance-baselines');
    }

    async generate() {
        try {
            console.log('📊 Generating performance report...');

            // Ensure directories exist
            await fs.mkdir(this.reportsDir, { recursive: true });

            // Load latest benchmark results
            const benchmarkResults = await this.loadLatestBenchmarkResults();

            if (!benchmarkResults) {
                console.log('No benchmark results found. Run benchmarks first.');
                return;
            }

            // Load baseline for comparison
            const baseline = await this.loadBaseline();

            // Generate comprehensive report
            const report = await this.generateComprehensiveReport(benchmarkResults, baseline);

            // Save reports in multiple formats
            await this.saveReports(report);

            console.log('✅ Performance report generated successfully');

            return report;

        } catch (error) {
            console.error('Failed to generate performance report:', error);
            throw error;
        }
    }

    async loadLatestBenchmarkResults() {
        try {
            const files = await fs.readdir(this.resultsDir);
            const jsonFiles = files
                .filter(f => f.endsWith('.json') && f.includes('benchmark-report'))
                .sort()
                .reverse();

            if (jsonFiles.length === 0) return null;

            const latestFile = jsonFiles[0];
            const filePath = path.join(this.resultsDir, latestFile);
            const content = await fs.readFile(filePath, 'utf8');

            return JSON.parse(content);
        } catch (error) {
            console.warn('Failed to load benchmark results:', error.message);
            return null;
        }
    }

    async loadBaseline() {
        try {
            const baselinePath = path.join(this.baselineDir, 'performance-baseline.json');
            const content = await fs.readFile(baselinePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.warn('No baseline found for comparison');
            return null;
        }
    }

    async generateComprehensiveReport(currentResults, baseline) {
        const report = {
            timestamp: new Date().toISOString(),
            version: this.getVersion(),
            environment: this.getEnvironmentInfo(),
            summary: {},
            benchmarks: {},
            comparisons: {},
            trends: {},
            recommendations: []
        };

        // Generate summary
        report.summary = this.generateSummary(currentResults);

        // Process each benchmark type
        if (currentResults.generationSpeed) {
            report.benchmarks.generationSpeed = this.processGenerationSpeedBenchmark(
                currentResults.generationSpeed,
                baseline?.results?.generationSpeed
            );
        }

        if (currentResults.memoryUsage) {
            report.benchmarks.memoryUsage = this.processMemoryUsageBenchmark(
                currentResults.memoryUsage,
                baseline?.results?.memoryUsage
            );
        }

        if (currentResults.cpuUsage) {
            report.benchmarks.cpuUsage = this.processCpuUsageBenchmark(
                currentResults.cpuUsage,
                baseline?.results?.cpuUsage
            );
        }

        if (currentResults.scalability) {
            report.benchmarks.scalability = this.processScalabilityBenchmark(
                currentResults.scalability,
                baseline?.results?.scalability
            );
        }

        // Generate comparisons
        report.comparisons = this.generateComparisons(report.benchmarks);

        // Analyze trends
        report.trends = this.analyzeTrends(report.benchmarks);

        // Generate recommendations
        report.recommendations = this.generateRecommendations(report);

        return report;
    }

    generateSummary(results) {
        const summary = {
            totalBenchmarks: 0,
            totalTests: 0,
            averagePerformance: 0,
            bestPerforming: null,
            worstPerforming: null,
            overallHealth: 'unknown'
        };

        let totalScore = 0;
        let benchmarkCount = 0;

        // Calculate summary from all benchmark types
        Object.values(results).forEach(benchmarkType => {
            if (benchmarkType && benchmarkType.tests) {
                summary.totalTests += benchmarkType.tests.length;
                benchmarkCount++;

                // Calculate average performance score
                const avgScore = benchmarkType.tests.reduce((sum, test) => {
                    if (test.averageTime) {
                        // Lower time is better for generation speed
                        return sum + (1000 / test.averageTime);
                    }
                    return sum;
                }, 0) / benchmarkType.tests.length;

                totalScore += avgScore;
            }
        });

        summary.totalBenchmarks = benchmarkCount;
        summary.averagePerformance = benchmarkCount > 0 ? totalScore / benchmarkCount : 0;

        // Determine overall health
        if (summary.averagePerformance > 80) {
            summary.overallHealth = 'excellent';
        } else if (summary.averagePerformance > 60) {
            summary.overallHealth = 'good';
        } else if (summary.averagePerformance > 40) {
            summary.overallHealth = 'fair';
        } else {
            summary.overallHealth = 'poor';
        }

        return summary;
    }

    processGenerationSpeedBenchmark(current, baseline) {
        const processed = {
            tests: [],
            summary: {
                averageTime: 0,
                fastestTest: null,
                slowestTest: null,
                totalThroughput: 0
            },
            comparison: null
        };

        // Process current results
        current.tests.forEach(test => {
            const processedTest = {
                generatorName: test.generatorName,
                averageTime: test.averageTime,
                minTime: test.minTime,
                maxTime: test.maxTime,
                p95Time: test.p95Time,
                p99Time: test.p99Time,
                throughput: test.throughput,
                errors: test.errors,
                iterations: test.iterations
            };

            processed.tests.push(processedTest);
            processed.summary.averageTime += test.averageTime;
            processed.summary.totalThroughput += test.throughput;

            if (!processed.summary.fastestTest ||
                test.averageTime < processed.summary.fastestTest.averageTime) {
                processed.summary.fastestTest = processedTest;
            }

            if (!processed.summary.slowestTest ||
                test.averageTime > processed.summary.slowestTest.averageTime) {
                processed.summary.slowestTest = processedTest;
            }
        });

        processed.summary.averageTime /= current.tests.length;

        // Compare with baseline
        if (baseline) {
            processed.comparison = this.compareGenerationSpeedResults(current, baseline);
        }

        return processed;
    }

    processMemoryUsageBenchmark(current, baseline) {
        const processed = {
            tests: [],
            summary: {
                averageMemoryGrowth: 0,
                peakMemoryUsage: 0,
                memoryEfficiency: 0,
                potentialLeaks: []
            },
            comparison: null
        };

        // Process current results
        current.tests.forEach(test => {
            const processedTest = {
                generatorName: test.generatorName,
                memoryGrowth: test.memoryGrowth,
                peakMemory: test.peakMemory,
                averageMemory: test.averageMemory,
                memoryEfficiency: test.memoryEfficiency,
                leaksDetected: test.leaksDetected,
                iterations: test.iterations
            };

            processed.tests.push(processedTest);
            processed.summary.averageMemoryGrowth += test.memoryGrowth;
            processed.summary.peakMemoryUsage = Math.max(processed.summary.peakMemoryUsage, test.peakMemory);
            processed.summary.memoryEfficiency += test.memoryEfficiency;

            if (test.leaksDetected) {
                processed.summary.potentialLeaks.push(test.generatorName);
            }
        });

        const testCount = current.tests.length;
        processed.summary.averageMemoryGrowth /= testCount;
        processed.summary.memoryEfficiency /= testCount;

        // Compare with baseline
        if (baseline) {
            processed.comparison = this.compareMemoryUsageResults(current, baseline);
        }

        return processed;
    }

    processCpuUsageBenchmark(current, baseline) {
        const processed = {
            tests: [],
            summary: {
                averageCpuUsage: 0,
                peakCpuUsage: 0,
                cpuEfficiency: 0,
                totalOperations: 0
            },
            comparison: null
        };

        // Process current results
        current.tests.forEach(test => {
            const processedTest = {
                generatorName: test.generatorName,
                averageCpu: test.averageCpu,
                peakCpu: test.peakCpu,
                cpuEfficiency: test.cpuEfficiency,
                operationsCompleted: test.operationsCompleted,
                operationsPerSecond: test.operationsPerSecond,
                timeSpent: test.timeSpent
            };

            processed.tests.push(processedTest);
            processed.summary.averageCpuUsage += test.averageCpu;
            processed.summary.peakCpuUsage = Math.max(processed.summary.peakCpuUsage, test.peakCpu);
            processed.summary.cpuEfficiency += test.cpuEfficiency;
            processed.summary.totalOperations += test.operationsCompleted;
        });

        const testCount = current.tests.length;
        processed.summary.averageCpuUsage /= testCount;
        processed.summary.cpuEfficiency /= testCount;

        // Compare with baseline
        if (baseline) {
            processed.comparison = this.compareCpuUsageResults(current, baseline);
        }

        return processed;
    }

    processScalabilityBenchmark(current, baseline) {
        const processed = {
            tests: [],
            summary: {
                averageEfficiency: 0,
                bestConcurrency: 1,
                scalabilityScore: 0
            },
            comparison: null
        };

        // Process current results
        current.tests.forEach(test => {
            const processedTest = {
                generatorName: test.generatorName,
                concurrencyLevels: test.results.map(r => r.concurrency),
                throughputByConcurrency: test.results.map(r => ({
                    concurrency: r.concurrency,
                    throughput: r.throughput,
                    efficiency: r.efficiency
                }))
            };

            processed.tests.push(processedTest);

            // Calculate scalability metrics
            const scalabilityMetrics = this.calculateScalabilityMetrics(test.results);
            processed.summary.averageEfficiency += scalabilityMetrics.averageEfficiency;
            processed.summary.scalabilityScore += scalabilityMetrics.scalabilityScore;
        });

        const testCount = current.tests.length;
        processed.summary.averageEfficiency /= testCount;
        processed.summary.scalabilityScore /= testCount;

        // Compare with baseline
        if (baseline) {
            processed.comparison = this.compareScalabilityResults(current, baseline);
        }

        return processed;
    }

    compareGenerationSpeedResults(current, baseline) {
        const comparison = {
            improvements: [],
            regressions: [],
            averageChange: 0
        };

        let totalChange = 0;
        let comparisonCount = 0;

        current.tests.forEach((currentTest, index) => {
            const baselineTest = baseline.tests[index];
            if (!baselineTest) return;

            const change = ((baselineTest.averageTime - currentTest.averageTime) / baselineTest.averageTime) * 100;
            totalChange += change;
            comparisonCount++;

            const comparisonItem = {
                generator: currentTest.generatorName,
                baselineTime: baselineTest.averageTime,
                currentTime: currentTest.averageTime,
                changePercent: change,
                status: change > 5 ? 'improvement' : change < -5 ? 'regression' : 'stable'
            };

            if (change > 5) {
                comparison.improvements.push(comparisonItem);
            } else if (change < -5) {
                comparison.regressions.push(comparisonItem);
            }
        });

        comparison.averageChange = comparisonCount > 0 ? totalChange / comparisonCount : 0;

        return comparison;
    }

    compareMemoryUsageResults(current, baseline) {
        const comparison = {
            improvements: [],
            regressions: [],
            averageChange: 0
        };

        let totalChange = 0;
        let comparisonCount = 0;

        current.tests.forEach((currentTest, index) => {
            const baselineTest = baseline.tests[index];
            if (!baselineTest) return;

            const change = ((baselineTest.memoryGrowth - currentTest.memoryGrowth) / baselineTest.memoryGrowth) * 100;
            totalChange += change;
            comparisonCount++;

            const comparisonItem = {
                generator: currentTest.generatorName,
                baselineGrowth: baselineTest.memoryGrowth,
                currentGrowth: currentTest.memoryGrowth,
                changePercent: change,
                status: change > 10 ? 'improvement' : change < -10 ? 'regression' : 'stable'
            };

            if (change > 10) {
                comparison.improvements.push(comparisonItem);
            } else if (change < -10) {
                comparison.regressions.push(comparisonItem);
            }
        });

        comparison.averageChange = comparisonCount > 0 ? totalChange / comparisonCount : 0;

        return comparison;
    }

    compareCpuUsageResults(current, baseline) {
        const comparison = {
            improvements: [],
            regressions: [],
            averageChange: 0
        };

        let totalChange = 0;
        let comparisonCount = 0;

        current.tests.forEach((currentTest, index) => {
            const baselineTest = baseline.tests[index];
            if (!baselineTest) return;

            const change = ((baselineTest.averageCpu - currentTest.averageCpu) / baselineTest.averageCpu) * 100;
            totalChange += change;
            comparisonCount++;

            const comparisonItem = {
                generator: currentTest.generatorName,
                baselineCpu: baselineTest.averageCpu,
                currentCpu: currentTest.averageCpu,
                changePercent: change,
                status: change > 5 ? 'improvement' : change < -5 ? 'regression' : 'stable'
            };

            if (change > 5) {
                comparison.improvements.push(comparisonItem);
            } else if (change < -5) {
                comparison.regressions.push(comparisonItem);
            }
        });

        comparison.averageChange = comparisonCount > 0 ? totalChange / comparisonCount : 0;

        return comparison;
    }

    compareScalabilityResults(current, baseline) {
        // Simplified scalability comparison
        return {
            improvements: [],
            regressions: [],
            averageChange: 0
        };
    }

    calculateScalabilityMetrics(results) {
        const metrics = {
            averageEfficiency: 0,
            scalabilityScore: 0,
            optimalConcurrency: 1
        };

        if (results.length === 0) return metrics;

        let totalEfficiency = 0;
        let maxThroughput = 0;
        let optimalConcurrency = 1;

        results.forEach(result => {
            totalEfficiency += result.efficiency;

            if (result.throughput > maxThroughput) {
                maxThroughput = result.throughput;
                optimalConcurrency = result.concurrency;
            }
        });

        metrics.averageEfficiency = totalEfficiency / results.length;
        metrics.scalabilityScore = (maxThroughput / results[0].throughput) * 100; // Percentage improvement
        metrics.optimalConcurrency = optimalConcurrency;

        return metrics;
    }

    generateComparisons(benchmarks) {
        const comparisons = {};

        Object.keys(benchmarks).forEach(benchmarkType => {
            if (benchmarks[benchmarkType].comparison) {
                comparisons[benchmarkType] = benchmarks[benchmarkType].comparison;
            }
        });

        return comparisons;
    }

    analyzeTrends(benchmarks) {
        // Analyze performance trends across different benchmark types
        const trends = {
            overallTrend: 'stable',
            concerningAreas: [],
            improvingAreas: []
        };

        // Analyze generation speed trends
        if (benchmarks.generationSpeed?.comparison) {
            const genComparison = benchmarks.generationSpeed.comparison;
            if (genComparison.regressions.length > genComparison.improvements.length) {
                trends.concerningAreas.push('generation-speed');
            } else if (genComparison.improvements.length > genComparison.regressions.length) {
                trends.improvingAreas.push('generation-speed');
            }
        }

        // Analyze memory usage trends
        if (benchmarks.memoryUsage?.comparison) {
            const memComparison = benchmarks.memoryUsage.comparison;
            if (memComparison.regressions.length > 0) {
                trends.concerningAreas.push('memory-usage');
            }
        }

        // Determine overall trend
        if (trends.concerningAreas.length > trends.improvingAreas.length) {
            trends.overallTrend = 'degrading';
        } else if (trends.improvingAreas.length > trends.concerningAreas.length) {
            trends.overallTrend = 'improving';
        }

        return trends;
    }

    generateRecommendations(report) {
        const recommendations = [];

        // Performance recommendations
        if (report.trends.overallTrend === 'degrading') {
            recommendations.push('🚨 Performance is degrading. Review recent changes for optimization opportunities.');
        }

        // Generation speed recommendations
        if (report.benchmarks.generationSpeed?.summary?.averageTime > 2000) {
            recommendations.push('🐌 Generation speed is slow. Consider optimizing generation algorithms.');
        }

        // Memory recommendations
        if (report.benchmarks.memoryUsage?.summary?.potentialLeaks.length > 0) {
            recommendations.push(`💾 Potential memory leaks detected in: ${report.benchmarks.memoryUsage.summary.potentialLeaks.join(', ')}`);
        }

        // CPU recommendations
        if (report.benchmarks.cpuUsage?.summary?.averageCpuUsage > 80) {
            recommendations.push('⚡ High CPU usage detected. Consider CPU optimization or throttling.');
        }

        // Scalability recommendations
        if (report.benchmarks.scalability?.summary?.scalabilityScore < 150) {
            recommendations.push('📈 Poor scalability detected. Review concurrent processing implementation.');
        }

        if (recommendations.length === 0) {
            recommendations.push('✅ Performance metrics are within acceptable ranges. Keep monitoring.');
        }

        return recommendations;
    }

    async saveReports(report) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseName = `performance-report-${timestamp}`;

        // Save JSON report
        const jsonPath = path.join(this.reportsDir, `${baseName}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

        // Save HTML report
        const htmlReport = this.generateHTMLReport(report);
        const htmlPath = path.join(this.reportsDir, `${baseName}.html`);
        await fs.writeFile(htmlPath, htmlReport);

        // Save Markdown summary
        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(this.reportsDir, `${baseName}.md`);
        await fs.writeFile(markdownPath, markdownReport);

        console.log(`📄 JSON report: ${jsonPath}`);
        console.log(`🌐 HTML report: ${htmlPath}`);
        console.log(`📝 Markdown report: ${markdownPath}`);
    }

    generateHTMLReport(report) {
        const healthColor = {
            excellent: '#28a745',
            good: '#17a2b8',
            fair: '#ffc107',
            poor: '#dc3545'
        };

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: ${healthColor[report.summary.overallHealth] || '#6c757d'}; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .benchmark { margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .metric { display: inline-block; margin: 5px 10px 5px 0; padding: 5px 10px; background: #e9ecef; border-radius: 3px; }
        .comparison { margin: 10px 0; padding: 10px; background: #fff3cd; border-radius: 5px; }
        .recommendations { background: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .trend-improving { color: #28a745; }
        .trend-degrading { color: #dc3545; }
        .trend-stable { color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Performance Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p>Version: ${report.version} | Environment: ${report.environment.platform}</p>
    </div>

    <div class="summary">
        <h2>📊 Summary</h2>
        <div class="metric">Overall Health: ${report.summary.overallHealth.toUpperCase()}</div>
        <div class="metric">Total Benchmarks: ${report.summary.totalBenchmarks}</div>
        <div class="metric">Total Tests: ${report.summary.totalTests}</div>
        <div class="metric">Average Performance: ${report.summary.averagePerformance.toFixed(2)}</div>
    </div>

    <h2>🔬 Benchmark Results</h2>

    ${Object.entries(report.benchmarks).map(([type, benchmark]) => `
        <div class="benchmark">
            <h3>${type.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>

            ${benchmark.tests.map(test => `
                <div class="metric">${test.generatorName}: ${test.averageTime ? test.averageTime.toFixed(2) + 'ms' : 'N/A'}</div>
            `).join('')}

            ${benchmark.comparison ? `
                <div class="comparison">
                    <h4>Comparison with Baseline</h4>
                    <div class="metric">Average Change: ${benchmark.comparison.averageChange.toFixed(2)}%</div>
                    <div class="metric trend-improving">Improvements: ${benchmark.comparison.improvements.length}</div>
                    <div class="metric trend-degrading">Regressions: ${benchmark.comparison.regressions.length}</div>
                </div>
            ` : ''}
        </div>
    `).join('')}

    <div class="recommendations">
        <h2>💡 Recommendations</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <footer style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p>This report was automatically generated by the performance monitoring system.</p>
    </footer>
</body>
</html>`;
    }

    generateMarkdownReport(report) {
        return `# 🚀 Performance Report

**Generated:** ${report.timestamp}
**Version:** ${report.version}
**Environment:** ${report.environment.platform}

## 📊 Summary
- **Overall Health:** ${report.summary.overallHealth.toUpperCase()}
- **Total Benchmarks:** ${report.summary.totalBenchmarks}
- **Total Tests:** ${report.summary.totalTests}
- **Average Performance:** ${report.summary.averagePerformance.toFixed(2)}

## 🔬 Benchmark Results

${Object.entries(report.benchmarks).map(([type, benchmark]) => `
### ${type.replace(/([A-Z])/g, ' $1').toUpperCase()}

${benchmark.tests.map(test =>
    `- **${test.generatorName}:** ${test.averageTime ? test.averageTime.toFixed(2) + 'ms' : 'N/A'}`
).join('\n')}

${benchmark.comparison ? `
#### Comparison with Baseline
- **Average Change:** ${benchmark.comparison.averageChange.toFixed(2)}%
- **Improvements:** ${benchmark.comparison.improvements.length}
- **Regressions:** ${benchmark.comparison.regressions.length}
` : ''}
`).join('\n')}

## 💡 Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*This report was automatically generated by the performance monitoring system.*
`;
    }

    getVersion() {
        try {
            const packageJson = require('../package.json');
            return packageJson.version;
        } catch {
            return 'unknown';
        }
    }

    getEnvironmentInfo() {
        return {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            totalMemory: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + ' MB'
        };
    }
}

// Run the report generator
if (require.main === module) {
    const generator = new PerformanceReportGenerator();
    generator.generate().catch(error => {
        console.error('Performance report generation failed:', error);
        process.exit(1);
    });
}

module.exports = PerformanceReportGenerator;
