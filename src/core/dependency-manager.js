/**
 * Dependency Manager
 * Handles security audits, updates, and dependency management
 */

const { execSync, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const UserPreferences = require('./user-preferences');

class DependencyManager {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.packageJsonPath = path.join(process.cwd(), 'package.json');
        this.packageLockPath = path.join(process.cwd(), 'package-lock.json');
        this.auditResults = null;
        this.outdatedPackages = null;
        this.securityReport = null;

        this.init();
    }

    /**
     * Initialize the dependency manager
     */
    async init() {
        await this.preferences.init();
        this.setupEventListeners();

        console.log('Dependency manager initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for security check requests
        document.addEventListener('security-check-requested', () => {
            this.runSecurityAudit();
        });

        // Listen for dependency update requests
        document.addEventListener('dependency-update-requested', (e) => {
            this.updateDependencies(e.detail?.options);
        });
    }

    /**
     * Run comprehensive security audit
     */
    async runSecurityAudit() {
        try {
            console.log('Running security audit...');

            // Run npm audit
            const auditResult = await this.runNpmAudit();
            this.auditResults = auditResult;

            // Get outdated packages
            const outdatedResult = await this.runNpmOutdated();
            this.outdatedPackages = outdatedResult;

            // Analyze dependencies
            const analysis = await this.analyzeDependencies();

            // Generate security report
            this.securityReport = this.generateSecurityReport(auditResult, outdatedResult, analysis);

            this.emit('security-audit-complete', {
                auditResults: auditResult,
                outdatedPackages: outdatedResult,
                analysis: analysis,
                report: this.securityReport
            });

            console.log('Security audit completed');
            return this.securityReport;

        } catch (error) {
            console.error('Security audit failed:', error);
            this.emit('security-audit-error', { error: error.message });
            throw error;
        }
    }

    /**
     * Run npm audit
     */
    async runNpmAudit() {
        return new Promise((resolve, reject) => {
            exec('npm audit --json', { cwd: process.cwd() }, (error, stdout, stderr) => {
                if (error && !stdout) {
                    reject(error);
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (parseError) {
                    // If JSON parsing fails, return raw output
                    resolve({
                        raw: stdout,
                        error: stderr,
                        parsed: false
                    });
                }
            });
        });
    }

    /**
     * Run npm outdated
     */
    async runNpmOutdated() {
        return new Promise((resolve, reject) => {
            exec('npm outdated --json', { cwd: process.cwd() }, (error, stdout, stderr) => {
                if (error && !stdout) {
                    reject(error);
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (parseError) {
                    resolve({
                        raw: stdout,
                        error: stderr,
                        parsed: false
                    });
                }
            });
        });
    }

    /**
     * Analyze dependencies
     */
    async analyzeDependencies() {
        const packageJson = await this.readPackageJson();
        const analysis = {
            totalDependencies: 0,
            devDependencies: 0,
            productionDependencies: 0,
            vulnerabilities: {
                critical: 0,
                high: 0,
                moderate: 0,
                low: 0,
                info: 0
            },
            outdated: {
                major: 0,
                minor: 0,
                patch: 0
            },
            bundleSize: {
                estimated: 0,
                largest: []
            },
            licenseIssues: [],
            maintenanceIssues: []
        };

        // Count dependencies
        if (packageJson.dependencies) {
            analysis.productionDependencies = Object.keys(packageJson.dependencies).length;
        }
        if (packageJson.devDependencies) {
            analysis.devDependencies = Object.keys(packageJson.devDependencies).length;
        }
        analysis.totalDependencies = analysis.productionDependencies + analysis.devDependencies;

        // Analyze vulnerabilities
        if (this.auditResults && this.auditResults.vulnerabilities) {
            const vulns = this.auditResults.vulnerabilities;
            analysis.vulnerabilities = {
                critical: vulns.critical || 0,
                high: vulns.high || 0,
                moderate: vulns.moderate || 0,
                low: vulns.low || 0,
                info: vulns.info || 0
            };
        }

        // Analyze outdated packages
        if (this.outdatedPackages && typeof this.outdatedPackages === 'object') {
            Object.values(this.outdatedPackages).forEach(pkg => {
                if (pkg.current && pkg.latest) {
                    const currentParts = pkg.current.split('.').map(Number);
                    const latestParts = pkg.latest.split('.').map(Number);

                    if (latestParts[0] > currentParts[0]) {
                        analysis.outdated.major++;
                    } else if (latestParts[1] > currentParts[1]) {
                        analysis.outdated.minor++;
                    } else if (latestParts[2] > currentParts[2]) {
                        analysis.outdated.patch++;
                    }
                }
            });
        }

        // Estimate bundle size (rough calculation)
        analysis.bundleSize.estimated = this.estimateBundleSize(packageJson);

        // Find largest packages
        analysis.bundleSize.largest = this.findLargestPackages(packageJson);

        return analysis;
    }

    /**
     * Generate security report
     */
    generateSecurityReport(auditResults, outdatedPackages, analysis) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalDependencies: analysis.totalDependencies,
                vulnerabilities: analysis.vulnerabilities,
                outdatedPackages: {
                    total: analysis.outdated.major + analysis.outdated.minor + analysis.outdated.patch,
                    major: analysis.outdated.major,
                    minor: analysis.outdated.minor,
                    patch: analysis.outdated.patch
                },
                riskLevel: this.calculateRiskLevel(analysis)
            },
            vulnerabilities: [],
            outdated: [],
            recommendations: [],
            actions: []
        };

        // Extract vulnerability details
        if (auditResults && auditResults.vulnerabilities) {
            Object.entries(auditResults.vulnerabilities).forEach(([severity, count]) => {
                if (count > 0) {
                    report.vulnerabilities.push({
                        severity,
                        count,
                        description: this.getSeverityDescription(severity)
                    });
                }
            });
        }

        // Extract outdated package details
        if (outdatedPackages && typeof outdatedPackages === 'object') {
            Object.entries(outdatedPackages).forEach(([name, info]) => {
                report.outdated.push({
                    name,
                    current: info.current,
                    wanted: info.wanted,
                    latest: info.latest,
                    type: this.getUpdateType(info.current, info.latest)
                });
            });
        }

        // Generate recommendations
        report.recommendations = this.generateRecommendations(analysis);

        // Generate action items
        report.actions = this.generateActions(analysis);

        return report;
    }

    /**
     * Calculate overall risk level
     */
    calculateRiskLevel(analysis) {
        const vulnScore = (
            analysis.vulnerabilities.critical * 10 +
            analysis.vulnerabilities.high * 5 +
            analysis.vulnerabilities.moderate * 2 +
            analysis.vulnerabilities.low * 1
        );

        const outdatedScore = (
            analysis.outdated.major * 5 +
            analysis.outdated.minor * 2 +
            analysis.outdated.patch * 1
        );

        const totalScore = vulnScore + outdatedScore;

        if (totalScore >= 50 || analysis.vulnerabilities.critical > 0) {
            return 'critical';
        } else if (totalScore >= 25 || analysis.vulnerabilities.high > 0) {
            return 'high';
        } else if (totalScore >= 10 || analysis.vulnerabilities.moderate > 2) {
            return 'moderate';
        } else if (totalScore >= 5) {
            return 'low';
        } else {
            return 'minimal';
        }
    }

    /**
     * Get severity description
     */
    getSeverityDescription(severity) {
        const descriptions = {
            critical: 'Immediate security risk requiring urgent attention',
            high: 'Significant security risk that should be addressed soon',
            moderate: 'Security risk that should be addressed when possible',
            low: 'Minor security concern with low exploitation risk',
            info: 'Informational security notice'
        };
        return descriptions[severity] || 'Unknown severity level';
    }

    /**
     * Get update type
     */
    getUpdateType(current, latest) {
        if (!current || !latest) return 'unknown';

        const currentParts = current.split('.').map(Number);
        const latestParts = latest.split('.').map(Number);

        if (latestParts[0] > currentParts[0]) return 'major';
        if (latestParts[1] > currentParts[1]) return 'minor';
        if (latestParts[2] > currentParts[2]) return 'patch';

        return 'current';
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        // Vulnerability recommendations
        if (analysis.vulnerabilities.critical > 0) {
            recommendations.push({
                priority: 'critical',
                category: 'security',
                title: 'Address Critical Security Vulnerabilities',
                description: `${analysis.vulnerabilities.critical} critical vulnerabilities found. Update immediately.`,
                action: 'Run security updates and replace vulnerable dependencies'
            });
        }

        if (analysis.vulnerabilities.high > 0) {
            recommendations.push({
                priority: 'high',
                category: 'security',
                title: 'Address High-Severity Vulnerabilities',
                description: `${analysis.vulnerabilities.high} high-severity vulnerabilities found.`,
                action: 'Update vulnerable dependencies or find secure alternatives'
            });
        }

        // Outdated package recommendations
        if (analysis.outdated.major > 0) {
            recommendations.push({
                priority: 'high',
                category: 'maintenance',
                title: 'Update Major Version Dependencies',
                description: `${analysis.outdated.major} packages have major version updates available.`,
                action: 'Review breaking changes and update carefully'
            });
        }

        if (analysis.outdated.minor > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'maintenance',
                title: 'Update Minor Version Dependencies',
                description: `${analysis.outdated.minor} packages have minor updates available.`,
                action: 'Update to get new features and bug fixes'
            });
        }

        // General recommendations
        recommendations.push({
            priority: 'medium',
            category: 'maintenance',
            title: 'Regular Security Audits',
            description: 'Schedule regular dependency security audits.',
            action: 'Set up automated security scanning in CI/CD pipeline'
        });

        recommendations.push({
            priority: 'low',
            category: 'optimization',
            title: 'Dependency Optimization',
            description: 'Review and optimize dependency usage.',
            action: 'Remove unused dependencies and consider lighter alternatives'
        });

        return recommendations;
    }

    /**
     * Generate action items
     */
    generateActions(analysis) {
        const actions = [];

        // Immediate actions for critical issues
        if (analysis.vulnerabilities.critical > 0) {
            actions.push({
                type: 'security',
                priority: 'critical',
                title: 'Fix Critical Vulnerabilities',
                command: 'npm audit fix --force',
                description: 'Attempt to automatically fix critical vulnerabilities'
            });
        }

        // Update actions
        if (analysis.outdated.major > 0) {
            actions.push({
                type: 'maintenance',
                priority: 'high',
                title: 'Update Major Versions',
                command: 'npm update --save',
                description: 'Update packages to latest major versions (review breaking changes)'
            });
        }

        if (analysis.outdated.minor > 0) {
            actions.push({
                type: 'maintenance',
                priority: 'medium',
                title: 'Update Minor Versions',
                command: 'npm update',
                description: 'Update packages to latest minor versions'
            });
        }

        // General maintenance actions
        actions.push({
            type: 'maintenance',
            priority: 'medium',
            title: 'Clean npm Cache',
            command: 'npm cache clean --force',
            description: 'Clean npm cache to free up space'
        });

        actions.push({
            type: 'maintenance',
            priority: 'low',
            title: 'Reinstall Dependencies',
            command: 'rm -rf node_modules package-lock.json && npm install',
            description: 'Clean reinstall of all dependencies'
        });

        return actions;
    }

    /**
     * Update dependencies
     */
    async updateDependencies(options = {}) {
        const { type = 'minor', force = false } = options;

        try {
            console.log(`Updating ${type} dependencies...`);

            let command;
            switch (type) {
                case 'patch':
                    command = 'npm update';
                    break;
                case 'minor':
                    command = 'npm update';
                    break;
                case 'major':
                    command = force ? 'npm update --save' : 'npm update';
                    break;
                case 'all':
                    command = 'npm update --save';
                    break;
                default:
                    command = 'npm update';
            }

            const result = await this.runCommand(command);

            // Re-run audit after update
            await this.runSecurityAudit();

            this.emit('dependencies-updated', {
                type,
                result,
                newAudit: this.securityReport
            });

            console.log('Dependencies updated successfully');
            return result;

        } catch (error) {
            console.error('Dependency update failed:', error);
            this.emit('dependency-update-error', { error: error.message });
            throw error;
        }
    }

    /**
     * Fix security vulnerabilities
     */
    async fixVulnerabilities(options = {}) {
        const { force = false } = options;

        try {
            console.log('Attempting to fix security vulnerabilities...');

            const command = force ? 'npm audit fix --force' : 'npm audit fix';
            const result = await this.runCommand(command);

            // Re-run audit after fix
            await this.runSecurityAudit();

            this.emit('vulnerabilities-fixed', {
                result,
                newAudit: this.securityReport
            });

            console.log('Security fixes applied');
            return result;

        } catch (error) {
            console.error('Security fix failed:', error);
            this.emit('vulnerability-fix-error', { error: error.message });
            throw error;
        }
    }

    /**
     * Clean up unused dependencies
     */
    async cleanupDependencies() {
        try {
            console.log('Cleaning up dependencies...');

            // Check for unused dependencies (this is a simple check)
            const result = await this.runCommand('npm prune');

            // Re-run audit after cleanup
            await this.runSecurityAudit();

            this.emit('dependencies-cleaned', {
                result,
                newAudit: this.securityReport
            });

            console.log('Dependencies cleaned up');
            return result;

        } catch (error) {
            console.error('Dependency cleanup failed:', error);
            this.emit('dependency-cleanup-error', { error: error.message });
            throw error;
        }
    }

    /**
     * Estimate bundle size
     */
    estimateBundleSize(packageJson) {
        // Rough estimation based on known package sizes
        const sizeEstimates = {
            'react': 130, // KB
            'lodash': 70,
            'moment': 200,
            'jquery': 90,
            'axios': 15,
            'express': 180,
            'canvas': 800, // Large for image processing
            'sharp': 1000, // Very large
            'jimp': 600,
            'better-sqlite3': 400,
            'uuid': 5,
            'mime-types': 10,
            'pixelmatch': 20,
            'pngjs': 50,
            'fs-extra': 25,
            'wavefile': 30,
            'lamejs': 40,
            'ogg.js': 15,
            'audioworklet-polyfill': 10
        };

        let totalSize = 0;
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        Object.keys(allDeps).forEach(dep => {
            totalSize += sizeEstimates[dep] || 50; // Default 50KB estimate
        });

        return totalSize;
    }

    /**
     * Find largest packages
     */
    findLargestPackages(packageJson) {
        const sizeEstimates = {
            'sharp': 1000,
            'canvas': 800,
            'jimp': 600,
            'better-sqlite3': 400,
            'moment': 200,
            'express': 180,
            'react': 130,
            'lodash': 70,
            'jquery': 90
        };

        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        const packages = Object.keys(allDeps).map(dep => ({
            name: dep,
            size: sizeEstimates[dep] || 50
        }));

        return packages
            .sort((a, b) => b.size - a.size)
            .slice(0, 10);
    }

    /**
     * Read package.json
     */
    async readPackageJson() {
        const content = await fs.readFile(this.packageJsonPath, 'utf8');
        return JSON.parse(content);
    }

    /**
     * Run shell command
     */
    async runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    stdout,
                    stderr,
                    success: true
                });
            });
        });
    }

    /**
     * Get current security report
     */
    getSecurityReport() {
        return this.securityReport;
    }

    /**
     * Get audit results
     */
    getAuditResults() {
        return this.auditResults;
    }

    /**
     * Get outdated packages
     */
    getOutdatedPackages() {
        return this.outdatedPackages;
    }

    /**
     * Export security report
     */
    exportSecurityReport() {
        if (!this.securityReport) {
            throw new Error('No security report available. Run audit first.');
        }

        return JSON.stringify(this.securityReport, null, 2);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
            border-radius: 4px;
            z-index: 10001;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds for security messages
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    /**
     * Emit event
     */
    emit(eventType, data) {
        const event = new CustomEvent(`dependency-manager-${eventType}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the dependency manager
     */
    destroy() {
        this.auditResults = null;
        this.outdatedPackages = null;
        this.securityReport = null;

        console.log('Dependency manager destroyed');
    }
}

module.exports = DependencyManager;
