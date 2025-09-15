/**
 * Dependency Analyzer
 * Advanced dependency analysis and optimization tools
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class DependencyAnalyzer {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || process.cwd();
        this.packageJsonPath = path.join(this.projectRoot, 'package.json');
        this.nodeModulesPath = path.join(this.projectRoot, 'node_modules');
        this.bundleSizeCache = new Map();
        this.dependencyTreeCache = new Map();
        this.vulnerabilityCache = new Map();
        this.lastAnalysis = null;

        this.init();
    }

    /**
     * Initialize the dependency analyzer
     */
    async init() {
        console.log('Dependency analyzer initialized');
    }

    /**
     * Analyze all dependencies
     */
    async analyzeDependencies(options = {}) {
        const {
            includeDev = true,
            includePeer = true,
            includeOptional = true,
            maxDepth = 5,
            includeSizes = true,
            includeVulnerabilities = true
        } = options;

        console.log('Starting comprehensive dependency analysis...');

        const analysis = {
            timestamp: new Date().toISOString(),
            packageInfo: await this.getPackageInfo(),
            dependencyTree: await this.buildDependencyTree(maxDepth),
            bundleSize: includeSizes ? await this.calculateBundleSize() : null,
            vulnerabilities: includeVulnerabilities ? await this.scanVulnerabilities() : null,
            recommendations: [],
            statistics: {}
        };

        // Generate recommendations
        analysis.recommendations = await this.generateRecommendations(analysis);

        // Calculate statistics
        analysis.statistics = this.calculateStatistics(analysis);

        this.lastAnalysis = analysis;
        return analysis;
    }

    /**
     * Get package.json information
     */
    async getPackageInfo() {
        try {
            const packageJson = JSON.parse(await fs.readFile(this.packageJsonPath, 'utf8'));

            return {
                name: packageJson.name,
                version: packageJson.version,
                dependencies: packageJson.dependencies || {},
                devDependencies: packageJson.devDependencies || {},
                peerDependencies: packageJson.peerDependencies || {},
                optionalDependencies: packageJson.optionalDependencies || {},
                totalDependencies: Object.keys(packageJson.dependencies || {}).length,
                totalDevDependencies: Object.keys(packageJson.devDependencies || {}).length,
                totalPeerDependencies: Object.keys(packageJson.peerDependencies || {}).length,
                totalOptionalDependencies: Object.keys(packageJson.optionalDependencies || {}).length
            };
        } catch (error) {
            throw new Error(`Failed to read package.json: ${error.message}`);
        }
    }

    /**
     * Build dependency tree
     */
    async buildDependencyTree(maxDepth = 5) {
        const packageJson = JSON.parse(await fs.readFile(this.packageJsonPath, 'utf8'));
        const tree = {
            name: packageJson.name,
            version: packageJson.version,
            dependencies: {}
        };

        // Analyze production dependencies
        for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
            tree.dependencies[name] = await this.analyzeDependency(name, version, 1, maxDepth);
        }

        return tree;
    }

    /**
     * Analyze individual dependency
     */
    async analyzeDependency(name, version, currentDepth, maxDepth) {
        if (currentDepth > maxDepth) {
            return { name, version, truncated: true };
        }

        try {
            const packagePath = path.join(this.nodeModulesPath, name, 'package.json');
            const depPackage = JSON.parse(await fs.readFile(packagePath, 'utf8'));

            const dependency = {
                name,
                version: depPackage.version,
                description: depPackage.description,
                license: depPackage.license,
                homepage: depPackage.homepage,
                repository: depPackage.repository,
                size: await this.getPackageSize(name),
                dependencies: {}
            };

            // Analyze sub-dependencies
            if (currentDepth < maxDepth && depPackage.dependencies) {
                for (const [subName, subVersion] of Object.entries(depPackage.dependencies)) {
                    dependency.dependencies[subName] = await this.analyzeDependency(
                        subName,
                        subVersion,
                        currentDepth + 1,
                        maxDepth
                    );
                }
            }

            return dependency;

        } catch (error) {
            return {
                name,
                version,
                error: `Failed to analyze: ${error.message}`
            };
        }
    }

    /**
     * Calculate bundle size
     */
    async calculateBundleSize() {
        const bundleSize = {
            total: 0,
            dependencies: {},
            breakdown: {
                javascript: 0,
                typescript: 0,
                json: 0,
                css: 0,
                images: 0,
                other: 0
            },
            largestPackages: [],
            recommendations: []
        };

        try {
            const packageJson = JSON.parse(await fs.readFile(this.packageJsonPath, 'utf8'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            for (const [name] of Object.entries(dependencies)) {
                const size = await this.getPackageSize(name);
                bundleSize.dependencies[name] = size;
                bundleSize.total += size;

                // Categorize by file type
                const breakdown = await this.getPackageFileBreakdown(name);
                Object.entries(breakdown).forEach(([type, size]) => {
                    bundleSize.breakdown[type] = (bundleSize.breakdown[type] || 0) + size;
                });
            }

            // Find largest packages
            bundleSize.largestPackages = Object.entries(bundleSize.dependencies)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([name, size]) => ({ name, size }));

            // Generate size recommendations
            bundleSize.recommendations = this.generateSizeRecommendations(bundleSize);

        } catch (error) {
            console.error('Failed to calculate bundle size:', error);
        }

        return bundleSize;
    }

    /**
     * Get package size
     */
    async getPackageSize(packageName) {
        if (this.bundleSizeCache.has(packageName)) {
            return this.bundleSizeCache.get(packageName);
        }

        try {
            const packagePath = path.join(this.nodeModulesPath, packageName);
            const size = await this.calculateDirectorySize(packagePath);
            this.bundleSizeCache.set(packageName, size);
            return size;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Calculate directory size recursively
     */
    async calculateDirectorySize(dirPath) {
        let totalSize = 0;

        try {
            const items = await fs.readdir(dirPath);

            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);

                if (stats.isDirectory()) {
                    // Skip node_modules to avoid double counting
                    if (item !== 'node_modules') {
                        totalSize += await this.calculateDirectorySize(itemPath);
                    }
                } else if (stats.isFile()) {
                    totalSize += stats.size;
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
        }

        return totalSize;
    }

    /**
     * Get package file breakdown
     */
    async getPackageFileBreakdown(packageName) {
        const breakdown = {
            javascript: 0,
            typescript: 0,
            json: 0,
            css: 0,
            images: 0,
            other: 0
        };

        try {
            const packagePath = path.join(this.nodeModulesPath, packageName);
            await this.analyzeDirectoryFiles(packagePath, breakdown);
        } catch (error) {
            // Package doesn't exist or can't be analyzed
        }

        return breakdown;
    }

    /**
     * Analyze directory files for breakdown
     */
    async analyzeDirectoryFiles(dirPath, breakdown) {
        try {
            const items = await fs.readdir(dirPath);

            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);

                if (stats.isDirectory()) {
                    // Skip node_modules
                    if (item !== 'node_modules') {
                        await this.analyzeDirectoryFiles(itemPath, breakdown);
                    }
                } else if (stats.isFile()) {
                    const ext = path.extname(item).toLowerCase();
                    const size = stats.size;

                    switch (ext) {
                        case '.js':
                        case '.mjs':
                        case '.cjs':
                            breakdown.javascript += size;
                            break;
                        case '.ts':
                        case '.tsx':
                            breakdown.typescript += size;
                            break;
                        case '.json':
                            breakdown.json += size;
                            break;
                        case '.css':
                        case '.scss':
                        case '.sass':
                        case '.less':
                            breakdown.css += size;
                            break;
                        case '.png':
                        case '.jpg':
                        case '.jpeg':
                        case '.gif':
                        case '.svg':
                        case '.webp':
                        case '.ico':
                            breakdown.images += size;
                            break;
                        default:
                            breakdown.other += size;
                    }
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
        }
    }

    /**
     * Scan for vulnerabilities
     */
    async scanVulnerabilities() {
        // In a real implementation, this would integrate with npm audit or Snyk
        // For now, we'll simulate vulnerability scanning
        const vulnerabilities = {
            total: 0,
            critical: 0,
            high: 0,
            moderate: 0,
            low: 0,
            issues: [],
            lastScanned: new Date().toISOString()
        };

        // Simulate some vulnerabilities for demonstration
        vulnerabilities.issues = [
            {
                package: 'example-package',
                severity: 'high',
                title: 'Remote Code Execution Vulnerability',
                description: 'This package has a vulnerability that allows remote code execution',
                cve: 'CVE-2023-12345',
                cvssScore: 8.5,
                affectedVersions: '< 2.0.0',
                fixedVersions: '>= 2.0.0'
            },
            {
                package: 'another-package',
                severity: 'moderate',
                title: 'Information Disclosure',
                description: 'This package may disclose sensitive information',
                cve: 'CVE-2023-67890',
                cvssScore: 5.3,
                affectedVersions: '< 1.5.0',
                fixedVersions: '>= 1.5.0'
            }
        ];

        vulnerabilities.total = vulnerabilities.issues.length;
        vulnerabilities.critical = vulnerabilities.issues.filter(i => i.severity === 'critical').length;
        vulnerabilities.high = vulnerabilities.issues.filter(i => i.severity === 'high').length;
        vulnerabilities.moderate = vulnerabilities.issues.filter(i => i.severity === 'moderate').length;
        vulnerabilities.low = vulnerabilities.issues.filter(i => i.severity === 'low').length;

        return vulnerabilities;
    }

    /**
     * Generate recommendations
     */
    async generateRecommendations(analysis) {
        const recommendations = [];

        // Bundle size recommendations
        if (analysis.bundleSize) {
            const totalMB = (analysis.bundleSize.total / (1024 * 1024)).toFixed(2);

            if (analysis.bundleSize.total > 100 * 1024 * 1024) { // 100MB
                recommendations.push({
                    type: 'bundle-size',
                    severity: 'high',
                    title: 'Large Bundle Size',
                    description: `Total bundle size is ${totalMB}MB. Consider optimizing dependencies.`,
                    suggestions: [
                        'Remove unused dependencies',
                        'Use tree-shaking friendly packages',
                        'Consider lazy loading for large dependencies',
                        'Evaluate alternative packages with smaller footprints'
                    ]
                });
            }

            // Large package recommendations
            analysis.bundleSize.largestPackages.slice(0, 3).forEach(pkg => {
                const sizeMB = (pkg.size / (1024 * 1024)).toFixed(2);
                if (pkg.size > 10 * 1024 * 1024) { // 10MB
                    recommendations.push({
                        type: 'large-package',
                        severity: 'medium',
                        title: `Large Package: ${pkg.name}`,
                        description: `Package ${pkg.name} is ${sizeMB}MB. Consider alternatives.`,
                        suggestions: [
                            `Evaluate if ${pkg.name} is essential`,
                            'Look for lighter alternatives',
                            'Consider using only specific parts of the package'
                        ]
                    });
                }
            });
        }

        // Vulnerability recommendations
        if (analysis.vulnerabilities && analysis.vulnerabilities.total > 0) {
            recommendations.push({
                type: 'security',
                severity: analysis.vulnerabilities.critical > 0 ? 'critical' : 'high',
                title: 'Security Vulnerabilities Found',
                description: `Found ${analysis.vulnerabilities.total} security vulnerabilities.`,
                suggestions: [
                    'Update vulnerable packages to latest versions',
                    'Review and apply security patches',
                    'Consider replacing vulnerable packages',
                    'Run regular security audits'
                ]
            });
        }

        // Dependency tree recommendations
        if (analysis.dependencyTree) {
            const depCount = Object.keys(analysis.dependencyTree.dependencies).length;
            if (depCount > 50) {
                recommendations.push({
                    type: 'dependency-count',
                    severity: 'medium',
                    title: 'High Dependency Count',
                    description: `Project has ${depCount} direct dependencies. Consider consolidation.`,
                    suggestions: [
                        'Audit and remove unused dependencies',
                        'Look for packages that combine multiple functionalities',
                        'Consider creating custom utilities instead of adding dependencies'
                    ]
                });
            }
        }

        return recommendations;
    }

    /**
     * Calculate statistics
     */
    calculateStatistics(analysis) {
        const stats = {
            totalDependencies: 0,
            totalDevDependencies: 0,
            bundleSizeMB: 0,
            vulnerabilitiesCount: 0,
            recommendationsCount: 0
        };

        if (analysis.packageInfo) {
            stats.totalDependencies = analysis.packageInfo.totalDependencies;
            stats.totalDevDependencies = analysis.packageInfo.totalDevDependencies;
        }

        if (analysis.bundleSize) {
            stats.bundleSizeMB = (analysis.bundleSize.total / (1024 * 1024)).toFixed(2);
        }

        if (analysis.vulnerabilities) {
            stats.vulnerabilitiesCount = analysis.vulnerabilities.total;
        }

        if (analysis.recommendations) {
            stats.recommendationsCount = analysis.recommendations.length;
        }

        return stats;
    }

    /**
     * Generate size recommendations
     */
    generateSizeRecommendations(bundleSize) {
        const recommendations = [];

        // Check for large JavaScript bundles
        const jsMB = (bundleSize.breakdown.javascript / (1024 * 1024)).toFixed(2);
        if (bundleSize.breakdown.javascript > 50 * 1024 * 1024) { // 50MB
            recommendations.push(`JavaScript bundle is ${jsMB}MB. Consider code splitting.`);
        }

        // Check for large image assets
        const imgMB = (bundleSize.breakdown.images / (1024 * 1024)).toFixed(2);
        if (bundleSize.breakdown.images > 20 * 1024 * 1024) { // 20MB
            recommendations.push(`Image assets are ${imgMB}MB. Consider optimization.`);
        }

        return recommendations;
    }

    /**
     * Create dependency visualization
     */
    createDependencyVisualization(dependencyTree, format = 'json') {
        switch (format) {
            case 'mermaid':
                return this.createMermaidDiagram(dependencyTree);
            case 'dot':
                return this.createDotDiagram(dependencyTree);
            case 'json':
            default:
                return JSON.stringify(dependencyTree, null, 2);
        }
    }

    /**
     * Create Mermaid diagram
     */
    createMermaidDiagram(tree) {
        let diagram = 'graph TD\n';
        diagram += `    ${tree.name}[${tree.name}@${tree.version}]\n`;

        const processDependencies = (deps, parent) => {
            Object.entries(deps).forEach(([name, dep]) => {
                const nodeId = name.replace(/[^a-zA-Z0-9]/g, '_');
                diagram += `    ${nodeId}[${name}@${dep.version}]\n`;
                diagram += `    ${parent} --> ${nodeId}\n`;

                if (dep.dependencies && Object.keys(dep.dependencies).length > 0) {
                    processDependencies(dep.dependencies, nodeId);
                }
            });
        };

        if (tree.dependencies) {
            processDependencies(tree.dependencies, tree.name.replace(/[^a-zA-Z0-9]/g, '_'));
        }

        return diagram;
    }

    /**
     * Create DOT diagram
     */
    createDotDiagram(tree) {
        let diagram = 'digraph dependencies {\n';
        diagram += '    node [shape=box];\n';

        const processDependencies = (deps, parent) => {
            Object.entries(deps).forEach(([name, dep]) => {
                const nodeId = `"${name}@${dep.version}"`;
                diagram += `    ${nodeId};\n`;
                diagram += `    "${parent}" -> ${nodeId};\n`;

                if (dep.dependencies && Object.keys(dep.dependencies).length > 0) {
                    processDependencies(dep.dependencies, `${name}@${dep.version}`);
                }
            });
        };

        const rootId = `"${tree.name}@${tree.version}"`;
        diagram += `    ${rootId};\n`;

        if (tree.dependencies) {
            processDependencies(tree.dependencies, `${tree.name}@${tree.version}`);
        }

        diagram += '}\n';
        return diagram;
    }

    /**
     * Export analysis report
     */
    async exportAnalysisReport(analysis, format = 'json') {
        const report = {
            generatedAt: new Date().toISOString(),
            analysis
        };

        switch (format) {
            case 'html':
                return this.createHTMLReport(report);
            case 'markdown':
                return this.createMarkdownReport(report);
            case 'json':
            default:
                return JSON.stringify(report, null, 2);
        }
    }

    /**
     * Create HTML report
     */
    createHTMLReport(report) {
        const analysis = report.analysis;

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Dependency Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #e8f4fd; border-radius: 3px; }
        .recommendation { margin: 10px 0; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; }
        .vulnerability { margin: 10px 0; padding: 10px; background: #f8d7da; border-left: 4px solid #dc3545; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Dependency Analysis Report</h1>
        <p>Generated on ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>

    <div class="section">
        <h2>Package Information</h2>
        <div class="metric">Name: ${analysis.packageInfo.name}</div>
        <div class="metric">Version: ${analysis.packageInfo.version}</div>
        <div class="metric">Dependencies: ${analysis.packageInfo.totalDependencies}</div>
        <div class="metric">Dev Dependencies: ${analysis.packageInfo.totalDevDependencies}</div>
    </div>

    ${analysis.bundleSize ? `
    <div class="section">
        <h2>Bundle Size Analysis</h2>
        <div class="metric">Total Size: ${(analysis.bundleSize.total / (1024 * 1024)).toFixed(2)} MB</div>
        <div class="metric">JavaScript: ${(analysis.bundleSize.breakdown.javascript / (1024 * 1024)).toFixed(2)} MB</div>
        <div class="metric">TypeScript: ${(analysis.bundleSize.breakdown.typescript / (1024 * 1024)).toFixed(2)} MB</div>
        <div class="metric">Images: ${(analysis.bundleSize.breakdown.images / (1024 * 1024)).toFixed(2)} MB</div>

        <h3>Largest Packages</h3>
        <table>
            <tr><th>Package</th><th>Size (MB)</th></tr>
            ${analysis.bundleSize.largestPackages.map(pkg =>
                `<tr><td>${pkg.name}</td><td>${(pkg.size / (1024 * 1024)).toFixed(2)}</td></tr>`
            ).join('')}
        </table>
    </div>
    ` : ''}

    ${analysis.vulnerabilities ? `
    <div class="section">
        <h2>Security Vulnerabilities</h2>
        <div class="metric">Total: ${analysis.vulnerabilities.total}</div>
        <div class="metric">Critical: ${analysis.vulnerabilities.critical}</div>
        <div class="metric">High: ${analysis.vulnerabilities.high}</div>
        <div class="metric">Moderate: ${analysis.vulnerabilities.moderate}</div>

        ${analysis.vulnerabilities.issues.map(issue => `
        <div class="vulnerability">
            <h4>${issue.title}</h4>
            <p><strong>Package:</strong> ${issue.package}</p>
            <p><strong>Severity:</strong> ${issue.severity}</p>
            <p><strong>Description:</strong> ${issue.description}</p>
            <p><strong>Affected:</strong> ${issue.affectedVersions}</p>
            <p><strong>Fixed:</strong> ${issue.fixedVersions}</p>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2>Recommendations</h2>
        ${analysis.recommendations.map(rec => `
        <div class="recommendation">
            <h4>${rec.title}</h4>
            <p><strong>Severity:</strong> ${rec.severity}</p>
            <p>${rec.description}</p>
            <ul>
                ${rec.suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
        `).join('')}
    </div>
</body>
</html>`;
    }

    /**
     * Create Markdown report
     */
    createMarkdownReport(report) {
        const analysis = report.analysis;

        let markdown = `# Dependency Analysis Report

Generated on ${new Date(report.generatedAt).toLocaleString()}

## Package Information

- **Name**: ${analysis.packageInfo.name}
- **Version**: ${analysis.packageInfo.version}
- **Dependencies**: ${analysis.packageInfo.totalDependencies}
- **Dev Dependencies**: ${analysis.packageInfo.totalDevDependencies}

`;

        if (analysis.bundleSize) {
            markdown += `## Bundle Size Analysis

- **Total Size**: ${(analysis.bundleSize.total / (1024 * 1024)).toFixed(2)} MB
- **JavaScript**: ${(analysis.bundleSize.breakdown.javascript / (1024 * 1024)).toFixed(2)} MB
- **TypeScript**: ${(analysis.bundleSize.breakdown.typescript / (1024 * 1024)).toFixed(2)} MB
- **Images**: ${(analysis.bundleSize.breakdown.images / (1024 * 1024)).toFixed(2)} MB

### Largest Packages

| Package | Size (MB) |
|---------|-----------|
${analysis.bundleSize.largestPackages.map(pkg =>
    `| ${pkg.name} | ${(pkg.size / (1024 * 1024)).toFixed(2)} |`
).join('\n')}

`;
        }

        if (analysis.vulnerabilities) {
            markdown += `## Security Vulnerabilities

- **Total**: ${analysis.vulnerabilities.total}
- **Critical**: ${analysis.vulnerabilities.critical}
- **High**: ${analysis.vulnerabilities.high}
- **Moderate**: ${analysis.vulnerabilities.moderate}

`;
        }

        if (analysis.recommendations.length > 0) {
            markdown += `## Recommendations

${analysis.recommendations.map(rec => `### ${rec.title}

**Severity**: ${rec.severity}

${rec.description}

**Suggestions**:
${rec.suggestions.map(s => `- ${s}`).join('\n')}

`).join('\n')}`;
        }

        return markdown;
    }

    /**
     * Get last analysis
     */
    getLastAnalysis() {
        return this.lastAnalysis;
    }

    /**
     * Clear caches
     */
    clearCaches() {
        this.bundleSizeCache.clear();
        this.dependencyTreeCache.clear();
        this.vulnerabilityCache.clear();
        console.log('Dependency analyzer caches cleared');
    }

    /**
     * Destroy the analyzer
     */
    destroy() {
        this.clearCaches();
        console.log('Dependency analyzer destroyed');
    }
}

module.exports = DependencyAnalyzer;
