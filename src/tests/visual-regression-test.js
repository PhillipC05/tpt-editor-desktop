/**
 * Visual Regression Testing Framework
 * Automated visual testing for sprite generators and UI components
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { createCanvas, loadImage } = require('canvas');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;

class VisualRegressionTest {
    constructor(options = {}) {
        this.baselineDir = options.baselineDir || path.join(__dirname, '..', '..', 'test-baselines');
        this.screenshotsDir = options.screenshotsDir || path.join(__dirname, '..', '..', 'test-screenshots');
        this.diffDir = options.diffDir || path.join(__dirname, '..', '..', 'test-diffs');
        this.threshold = options.threshold || 0.1; // 10% difference threshold
        this.tolerance = options.tolerance || 0; // Pixel difference tolerance

        this.testResults = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the visual testing framework
     */
    async initialize() {
        try {
            // Ensure directories exist
            await fs.mkdir(this.baselineDir, { recursive: true });
            await fs.mkdir(this.screenshotsDir, { recursive: true });
            await fs.mkdir(this.diffDir, { recursive: true });

            this.isInitialized = true;
            console.log('Visual regression testing framework initialized');

        } catch (error) {
            console.error('Failed to initialize visual regression testing:', error);
            throw error;
        }
    }

    /**
     * Capture screenshot of a canvas or image
     */
    async captureScreenshot(element, testName, options = {}) {
        const { width = 256, height = 256, format = 'png' } = options;

        try {
            let imageData;

            if (element instanceof HTMLCanvasElement) {
                // Handle canvas element
                const canvas = createCanvas(width, height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(element, 0, 0, width, height);
                imageData = canvas.toBuffer();
            } else if (element instanceof ImageData) {
                // Handle ImageData
                const canvas = createCanvas(width, height);
                const ctx = canvas.getContext('2d');
                ctx.putImageData(element, 0, 0);
                imageData = canvas.toBuffer();
            } else if (Buffer.isBuffer(element)) {
                // Handle buffer
                imageData = element;
            } else {
                throw new Error('Unsupported element type for screenshot capture');
            }

            const filename = `${testName}_${Date.now()}.${format}`;
            const filepath = path.join(this.screenshotsDir, filename);

            await fs.writeFile(filepath, imageData);
            return { filepath, data: imageData };

        } catch (error) {
            console.error(`Failed to capture screenshot for ${testName}:`, error);
            throw error;
        }
    }

    /**
     * Create baseline screenshot
     */
    async createBaseline(testName, imageData, options = {}) {
        const { format = 'png' } = options;
        const filename = `${testName}_baseline.${format}`;
        const filepath = path.join(this.baselineDir, filename);

        await fs.writeFile(filepath, imageData);
        console.log(`Created baseline: ${filepath}`);

        return filepath;
    }

    /**
     * Compare screenshot with baseline
     */
    async compareWithBaseline(testName, screenshotPath, options = {}) {
        const { format = 'png' } = options;
        const baselinePath = path.join(this.baselineDir, `${testName}_baseline.${format}`);
        const diffPath = path.join(this.diffDir, `${testName}_diff_${Date.now()}.${format}`);

        try {
            // Check if baseline exists
            try {
                await fs.access(baselinePath);
            } catch {
                console.log(`No baseline found for ${testName}, creating new baseline`);
                const screenshotData = await fs.readFile(screenshotPath);
                await this.createBaseline(testName, screenshotData, options);
                return { passed: true, isNew: true, difference: 0 };
            }

            // Load images
            const baselineImage = PNG.sync.read(await fs.readFile(baselinePath));
            const screenshotImage = PNG.sync.read(await fs.readFile(screenshotPath));

            // Ensure images have the same dimensions
            if (baselineImage.width !== screenshotImage.width ||
                baselineImage.height !== screenshotImage.height) {
                throw new Error('Image dimensions do not match baseline');
            }

            // Create diff image
            const { width, height } = baselineImage;
            const diffImage = new PNG({ width, height });

            // Compare images
            const diffPixels = pixelmatch(
                baselineImage.data,
                screenshotImage.data,
                diffImage.data,
                width,
                height,
                { threshold: this.threshold, includeAA: false }
            );

            const totalPixels = width * height;
            const difference = diffPixels / totalPixels;

            // Save diff image if there are differences
            if (diffPixels > 0) {
                await fs.writeFile(diffPath, PNG.sync.write(diffImage));
            }

            const passed = difference <= this.threshold;

            const result = {
                testName,
                passed,
                difference,
                diffPixels,
                totalPixels,
                baselinePath,
                screenshotPath,
                diffPath: diffPixels > 0 ? diffPath : null,
                threshold: this.threshold
            };

            this.testResults.push(result);
            return result;

        } catch (error) {
            console.error(`Failed to compare ${testName}:`, error);
            throw error;
        }
    }

    /**
     * Run visual test for a generator
     */
    async runGeneratorTest(generator, testConfig, options = {}) {
        const { testName, parameters, expectedDimensions = { width: 256, height: 256 } } = testConfig;

        try {
            console.log(`Running visual test: ${testName}`);

            // Generate asset
            const asset = await generator.generate(parameters);

            // Convert to image data (assuming asset has image data)
            let imageData;
            if (asset.canvas) {
                imageData = await this.captureScreenshot(asset.canvas, testName, expectedDimensions);
            } else if (asset.imageData) {
                imageData = await this.captureScreenshot(asset.imageData, testName, expectedDimensions);
            } else if (asset.buffer) {
                // Assume it's already image data
                imageData = { filepath: '', data: asset.buffer };
            } else {
                throw new Error('Generator did not produce recognizable image data');
            }

            // Compare with baseline
            const result = await this.compareWithBaseline(testName, imageData.filepath, options);

            console.log(`Test ${testName}: ${result.passed ? 'PASSED' : 'FAILED'} (${(result.difference * 100).toFixed(2)}% difference)`);

            return result;

        } catch (error) {
            console.error(`Visual test failed for ${testName}:`, error);
            throw error;
        }
    }

    /**
     * Run visual tests for multiple generators
     */
    async runGeneratorTests(generators, testConfigs, options = {}) {
        const results = [];
        const { parallel = false, concurrency = 3 } = options;

        if (parallel) {
            // Run tests in parallel with concurrency limit
            for (let i = 0; i < testConfigs.length; i += concurrency) {
                const batch = testConfigs.slice(i, i + concurrency);
                const batchPromises = batch.map(async (config, index) => {
                    const generatorIndex = i + index;
                    const generator = generators[generatorIndex];
                    return await this.runGeneratorTest(generator, config, options);
                });

                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
            }
        } else {
            // Run tests sequentially
            for (let i = 0; i < testConfigs.length; i++) {
                const result = await this.runGeneratorTest(generators[i], testConfigs[i], options);
                results.push(result);
            }
        }

        return results;
    }

    /**
     * Generate test report
     */
    async generateReport(options = {}) {
        const { format = 'json', outputPath } = options;

        const report = {
            timestamp: new Date().toISOString(),
            totalTests: this.testResults.length,
            passedTests: this.testResults.filter(r => r.passed).length,
            failedTests: this.testResults.filter(r => !r.passed).length,
            newBaselines: this.testResults.filter(r => r.isNew).length,
            results: this.testResults,
            summary: {
                averageDifference: this.testResults.reduce((sum, r) => sum + r.difference, 0) / this.testResults.length,
                maxDifference: Math.max(...this.testResults.map(r => r.difference)),
                minDifference: Math.min(...this.testResults.map(r => r.difference))
            }
        };

        if (format === 'json') {
            const reportPath = outputPath || path.join(this.diffDir, `visual-test-report_${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`Visual test report saved: ${reportPath}`);
        } else if (format === 'html') {
            const htmlReport = this.generateHTMLReport(report);
            const reportPath = outputPath || path.join(this.diffDir, `visual-test-report_${Date.now()}.html`);
            await fs.writeFile(reportPath, htmlReport);
            console.log(`Visual test HTML report saved: ${reportPath}`);
        }

        return report;
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport(report) {
        const passedTests = report.results.filter(r => r.passed && !r.isNew);
        const failedTests = report.results.filter(r => !r.passed && !r.isNew);
        const newTests = report.results.filter(r => r.isNew);

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Visual Regression Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f0f0f0; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .test-result { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { background: #d4edda; border-color: #c3e6cb; }
        .failed { background: #f8d7da; border-color: #f5c6cb; }
        .new { background: #d1ecf1; border-color: #bee5eb; }
        .images { display: flex; gap: 10px; margin-top: 10px; }
        .images img { max-width: 200px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>Visual Regression Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Timestamp:</strong> ${report.timestamp}</p>
        <p><strong>Total Tests:</strong> ${report.totalTests}</p>
        <p><strong>Passed:</strong> ${report.passedTests}</p>
        <p><strong>Failed:</strong> ${report.failedTests}</p>
        <p><strong>New Baselines:</strong> ${report.newBaselines}</p>
        <p><strong>Average Difference:</strong> ${(report.summary.averageDifference * 100).toFixed(2)}%</p>
        <p><strong>Max Difference:</strong> ${(report.summary.maxDifference * 100).toFixed(2)}%</p>
    </div>

    <h2>Test Results</h2>
    ${report.results.map(result => `
        <div class="test-result ${result.isNew ? 'new' : (result.passed ? 'passed' : 'failed')}">
            <h3>${result.testName}</h3>
            <p><strong>Status:</strong> ${result.isNew ? 'New Baseline' : (result.passed ? 'Passed' : 'Failed')}</p>
            <p><strong>Difference:</strong> ${(result.difference * 100).toFixed(2)}%</p>
            <p><strong>Threshold:</strong> ${(result.threshold * 100).toFixed(2)}%</p>
            ${result.diffPath ? `<p><strong>Diff Image:</strong> ${result.diffPath}</p>` : ''}
            <div class="images">
                <div>
                    <p><strong>Baseline:</strong></p>
                    <img src="${result.baselinePath}" alt="Baseline" />
                </div>
                <div>
                    <p><strong>Screenshot:</strong></p>
                    <img src="${result.screenshotPath}" alt="Screenshot" />
                </div>
                ${result.diffPath ? `
                <div>
                    <p><strong>Diff:</strong></p>
                    <img src="${result.diffPath}" alt="Diff" />
                </div>
                ` : ''}
            </div>
        </div>
    `).join('')}
</body>
</html>`;
    }

    /**
     * Clean up test artifacts
     */
    async cleanup(options = {}) {
        const { keepBaselines = true, keepFailedDiffs = true, maxAge = 7 * 24 * 60 * 60 * 1000 } = options;

        try {
            // Clean up old screenshots
            const screenshots = await fs.readdir(this.screenshotsDir);
            for (const file of screenshots) {
                const filePath = path.join(this.screenshotsDir, file);
                const stats = await fs.stat(filePath);
                const age = Date.now() - stats.mtime.getTime();

                if (age > maxAge) {
                    await fs.unlink(filePath);
                }
            }

            // Clean up old diffs (keep failed ones if specified)
            if (!keepFailedDiffs) {
                const diffs = await fs.readdir(this.diffDir);
                for (const file of diffs) {
                    const filePath = path.join(this.diffDir, file);
                    const stats = await fs.stat(filePath);
                    const age = Date.now() - stats.mtime.getTime();

                    if (age > maxAge) {
                        await fs.unlink(filePath);
                    }
                }
            }

            console.log('Visual test cleanup completed');

        } catch (error) {
            console.error('Failed to cleanup visual tests:', error);
        }
    }

    /**
     * Get test statistics
     */
    getStatistics() {
        const stats = {
            totalTests: this.testResults.length,
            passedTests: this.testResults.filter(r => r.passed && !r.isNew).length,
            failedTests: this.testResults.filter(r => !r.passed && !r.isNew).length,
            newBaselines: this.testResults.filter(r => r.isNew).length,
            averageDifference: 0,
            maxDifference: 0,
            minDifference: Infinity
        };

        if (stats.totalTests > 0) {
            const differences = this.testResults.map(r => r.difference);
            stats.averageDifference = differences.reduce((sum, d) => sum + d, 0) / differences.length;
            stats.maxDifference = Math.max(...differences);
            stats.minDifference = Math.min(...differences);
        }

        return stats;
    }
}

module.exports = VisualRegressionTest;
