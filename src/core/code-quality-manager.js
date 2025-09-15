/**
 * Code Quality Manager
 * Comprehensive code quality analysis, automated code review, and quality metrics
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class CodeQualityManager {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || process.cwd();
        this.sourcePaths = options.sourcePaths || [
            path.join(this.projectRoot, 'src'),
            path.join(this.projectRoot, 'assets', 'js'),
            path.join(this.projectRoot, 'main.js'),
            path.join(this.projectRoot, 'preload.js')
        ];

        this.qualityRules = {
            complexity: {
                maxCyclomaticComplexity: 10,
                maxFunctionLength: 50,
                maxFileLength: 300,
                maxParameters: 5
            },
            style: {
                indentSize: 2,
                maxLineLength: 100,
                requireSemicolons: true,
                quoteStyle: 'single'
            },
            bestPractices: {
                requireJSDoc: true,
                noConsoleLog: true,
                noDebugger: true,
                requireErrorHandling: true
            },
            security: {
                noEval: true,
                noInnerHTML: true,
                requireInputValidation: true,
                noHardcodedSecrets: true
            }
        };

        this.qualityMetrics = new Map();
        this.issues = new Map();
        this.reports = new Map();

        this.init();
    }

    /**
     * Initialize the code quality manager
     */
    async init() {
        await this.loadConfiguration();
        await this.setupQualityTools();
        await this.initializeMetrics();

        console.log('Code quality manager initialized');
    }

    /**
     * Load quality configuration
     */
    async loadConfiguration() {
        try {
            const configPath = path.join(this.projectRoot, '.code-quality.json');
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);

            // Merge with default rules
            this.qualityRules = {
                ...this.qualityRules,
                ...config
            };

            console.log('Quality configuration loaded');
        } catch (error) {
            console.log('Using default quality configuration');
        }
    }

    /**
     * Setup quality analysis tools
     */
    async setupQualityTools() {
        // Check for required tools
        const tools = ['eslint', 'prettier', 'jscpd', 'complexity-report'];

        for (const tool of tools) {
            try {
                await execAsync(`${tool} --version`);
                console.log(`✓ ${tool} is available`);
            } catch (error) {
                console.warn(`⚠ ${tool} is not available`);
            }
        }
    }

    /**
     * Initialize quality metrics
     */
    async initializeMetrics() {
        this.qualityMetrics.set('complexity', {
            averageCyclomaticComplexity: 0,
            maxCyclomaticComplexity: 0,
            functionsOverThreshold: 0,
            totalFunctions: 0
        });

        this.qualityMetrics.set('style', {
            filesFormatted: 0,
            totalFiles: 0,
            styleViolations: 0
        });

        this.qualityMetrics.set('bestPractices', {
            documentedFunctions: 0,
            totalFunctions: 0,
            consoleLogs: 0,
            debuggerStatements: 0
        });

        this.qualityMetrics.set('security', {
            securityIssues: 0,
            inputValidations: 0,
            potentialVulnerabilities: 0
        });

        this.qualityMetrics.set('coverage', {
            linesCovered: 0,
            totalLines: 0,
            functionsCovered: 0,
            totalFunctions: 0
        });
    }

    /**
     * Run comprehensive code quality analysis
     */
    async analyzeCode(options = {}) {
        const {
            includeComplexity = true,
            includeStyle = true,
            includeBestPractices = true,
            includeSecurity = true,
            includeCoverage = true,
            generateReport = true
        } = options;

        console.log('Starting comprehensive code quality analysis...');

        const analysisId = this.generateAnalysisId();
        const startTime = Date.now();

        try {
            // Reset metrics
            await this.initializeMetrics();

            // Run analysis phases
            if (includeComplexity) {
                await this.analyzeComplexity();
            }

            if (includeStyle) {
                await this.analyzeStyle();
            }

            if (includeBestPractices) {
                await this.analyzeBestPractices();
            }

            if (includeSecurity) {
                await this.analyzeSecurity();
            }

            if (includeCoverage) {
                await this.analyzeCoverage();
            }

            // Calculate overall score
            const overallScore = this.calculateOverallScore();

            // Generate report
            let report = null;
            if (generateReport) {
                report = await this.generateQualityReport(analysisId);
            }

            const executionTime = Date.now() - startTime;

            const result = {
                analysisId,
                timestamp: new Date().toISOString(),
                executionTime,
                overallScore,
                metrics: Object.fromEntries(this.qualityMetrics),
                issues: Object.fromEntries(this.issues),
                report
            };

            console.log(`Code quality analysis completed in ${executionTime}ms`);
            console.log(`Overall quality score: ${overallScore.toFixed(1)}/100`);

            return result;

        } catch (error) {
            console.error('Code quality analysis failed:', error);
            throw error;
        }
    }

    /**
     * Analyze code complexity
     */
    async analyzeComplexity() {
        console.log('Analyzing code complexity...');

        const complexityMetrics = this.qualityMetrics.get('complexity');

        for (const sourcePath of this.sourcePaths) {
            try {
                const files = await this.getJavaScriptFiles(sourcePath);

                for (const file of files) {
                    const content = await fs.readFile(file, 'utf8');
                    const fileComplexity = this.analyzeFileComplexity(content, file);

                    complexityMetrics.totalFunctions += fileComplexity.functions.length;

                    for (const func of fileComplexity.functions) {
                        complexityMetrics.averageCyclomaticComplexity =
                            (complexityMetrics.averageCyclomaticComplexity * (complexityMetrics.totalFunctions - fileComplexity.functions.length) +
                             func.complexity) / complexityMetrics.totalFunctions;

                        complexityMetrics.maxCyclomaticComplexity = Math.max(
                            complexityMetrics.maxCyclomaticComplexity,
                            func.complexity
                        );

                        if (func.complexity > this.qualityRules.complexity.maxCyclomaticComplexity) {
                            complexityMetrics.functionsOverThreshold++;
                        }

                        // Record issue if complexity is too high
                        if (func.complexity > this.qualityRules.complexity.maxCyclomaticComplexity) {
                            this.recordIssue('complexity', 'high-complexity', {
                                file,
                                function: func.name,
                                complexity: func.complexity,
                                threshold: this.qualityRules.complexity.maxCyclomaticComplexity,
                                line: func.line
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn(`Failed to analyze complexity for ${sourcePath}:`, error.message);
            }
        }

        console.log(`Analyzed ${complexityMetrics.totalFunctions} functions`);
    }

    /**
     * Analyze file complexity
     */
    analyzeFileComplexity(content, filePath) {
        const lines = content.split('\n');
        const functions = [];
        let currentFunction = null;
        let braceCount = 0;
        let complexity = 1; // Base complexity

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNumber = i + 1;

            // Function start
            const funcMatch = line.match(/(?:function\s+(\w+)|(?:const|var|let)\s+(\w+)\s*=\s*(?:async\s+)?\s*\()/);
            if (funcMatch && !currentFunction) {
                currentFunction = {
                    name: funcMatch[1] || funcMatch[2],
                    line: lineNumber,
                    startLine: lineNumber,
                    complexity: 1,
                    parameters: this.countParameters(line)
                };
                braceCount = 0;
                complexity = 1;
            }

            // Count braces
            if (currentFunction) {
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;

                // Complexity keywords
                const complexityKeywords = ['if', 'else if', 'for', 'while', 'do', 'switch', 'case', 'catch', '&&', '||', '?'];
                for (const keyword of complexityKeywords) {
                    const matches = line.match(new RegExp(`\\b${keyword}\\b`, 'g'));
                    if (matches) {
                        complexity += matches.length;
                    }
                }

                // Function end
                if (braceCount === 0 && currentFunction) {
                    currentFunction.complexity = complexity;
                    currentFunction.endLine = lineNumber;
                    functions.push(currentFunction);
                    currentFunction = null;
                }
            }
        }

        return { functions };
    }

    /**
     * Count function parameters
     */
    countParameters(line) {
        const paramMatch = line.match(/\(([^)]*)\)/);
        if (!paramMatch) return 0;

        const params = paramMatch[1];
        if (!params.trim()) return 0;

        return params.split(',').length;
    }

    /**
     * Analyze code style
     */
    async analyzeStyle() {
        console.log('Analyzing code style...');

        const styleMetrics = this.qualityMetrics.get('style');

        try {
            // Run ESLint
            const eslintCommand = `npx eslint ${this.sourcePaths.join(' ')} --format json --no-eslintrc --config ${path.join(this.projectRoot, '.eslintrc.js')}`;
            const { stdout } = await execAsync(eslintCommand);
            const eslintResults = JSON.parse(stdout);

            for (const result of eslintResults) {
                styleMetrics.totalFiles++;
                styleMetrics.styleViolations += result.messages.length;

                for (const message of result.messages) {
                    this.recordIssue('style', message.ruleId || 'style-violation', {
                        file: result.filePath,
                        line: message.line,
                        column: message.column,
                        message: message.message,
                        severity: message.severity
                    });
                }
            }

            // Check Prettier formatting
            const prettierCommand = `npx prettier --check ${this.sourcePaths.join(' ')}`;
            try {
                await execAsync(prettierCommand);
                styleMetrics.filesFormatted = styleMetrics.totalFiles;
            } catch (error) {
                // Some files need formatting
                const unformattedFiles = error.stdout.split('\n').filter(line => line.trim());
                styleMetrics.filesFormatted = styleMetrics.totalFiles - unformattedFiles.length;
            }

        } catch (error) {
            console.warn('Style analysis failed:', error.message);
        }

        console.log(`Analyzed ${styleMetrics.totalFiles} files, ${styleMetrics.styleViolations} style violations`);
    }

    /**
     * Analyze best practices
     */
    async analyzeBestPractices() {
        console.log('Analyzing best practices...');

        const bestPracticesMetrics = this.qualityMetrics.get('bestPractices');

        for (const sourcePath of this.sourcePaths) {
            try {
                const files = await this.getJavaScriptFiles(sourcePath);

                for (const file of files) {
                    const content = await fs.readFile(file, 'utf8');
                    const analysis = this.analyzeFileBestPractices(content, file);

                    bestPracticesMetrics.totalFunctions += analysis.functions;
                    bestPracticesMetrics.documentedFunctions += analysis.documentedFunctions;
                    bestPracticesMetrics.consoleLogs += analysis.consoleLogs;
                    bestPracticesMetrics.debuggerStatements += analysis.debuggerStatements;

                    // Record issues
                    for (const issue of analysis.issues) {
                        this.recordIssue('bestPractices', issue.type, issue);
                    }
                }
            } catch (error) {
                console.warn(`Failed to analyze best practices for ${sourcePath}:`, error.message);
            }
        }

        console.log(`Analyzed ${bestPracticesMetrics.totalFunctions} functions`);
    }

    /**
     * Analyze file best practices
     */
    analyzeFileBestPractices(content, filePath) {
        const lines = content.split('\n');
        let functions = 0;
        let documentedFunctions = 0;
        let consoleLogs = 0;
        let debuggerStatements = 0;
        const issues = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNumber = i + 1;

            // Count functions
            if (line.match(/(?:function\s+\w+|(?:const|var|let)\s+\w+\s*=\s*(?:async\s+)?\s*\()/)) {
                functions++;

                // Check for JSDoc documentation
                let hasDocumentation = false;
                for (let j = Math.max(0, i - 5); j < i; j++) {
                    if (lines[j].trim().startsWith('/**')) {
                        hasDocumentation = true;
                        break;
                    }
                }

                if (hasDocumentation) {
                    documentedFunctions++;
                } else if (this.qualityRules.bestPractices.requireJSDoc) {
                    issues.push({
                        type: 'missing-jsdoc',
                        file: filePath,
                        line: lineNumber,
                        message: 'Function is missing JSDoc documentation'
                    });
                }
            }

            // Count console.log statements
            if (line.includes('console.log') && this.qualityRules.bestPractices.noConsoleLog) {
                consoleLogs++;
                issues.push({
                    type: 'console-log',
                    file: filePath,
                    line: lineNumber,
                    message: 'console.log statement found'
                });
            }

            // Count debugger statements
            if (line.includes('debugger') && this.qualityRules.bestPractices.noDebugger) {
                debuggerStatements++;
                issues.push({
                    type: 'debugger-statement',
                    file: filePath,
                    line: lineNumber,
                    message: 'debugger statement found'
                });
            }
        }

        return {
            functions,
            documentedFunctions,
            consoleLogs,
            debuggerStatements,
            issues
        };
    }

    /**
     * Analyze security issues
     */
    async analyzeSecurity() {
        console.log('Analyzing security...');

        const securityMetrics = this.qualityMetrics.get('security');

        for (const sourcePath of this.sourcePaths) {
            try {
                const files = await this.getJavaScriptFiles(sourcePath);

                for (const file of files) {
                    const content = await fs.readFile(file, 'utf8');
                    const analysis = this.analyzeFileSecurity(content, file);

                    securityMetrics.securityIssues += analysis.issues.length;
                    securityMetrics.inputValidations += analysis.inputValidations;
                    securityMetrics.potentialVulnerabilities += analysis.vulnerabilities;

                    // Record issues
                    for (const issue of analysis.issues) {
                        this.recordIssue('security', issue.type, issue);
                    }
                }
            } catch (error) {
                console.warn(`Failed to analyze security for ${sourcePath}:`, error.message);
            }
        }

        console.log(`Found ${securityMetrics.securityIssues} security issues`);
    }

    /**
     * Analyze file security
     */
    analyzeFileSecurity(content, filePath) {
        const lines = content.split('\n');
        const issues = [];
        let inputValidations = 0;
        let vulnerabilities = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineNumber = i + 1;

            // Check for eval usage
            if (line.includes('eval(') && this.qualityRules.security.noEval) {
                issues.push({
                    type: 'eval-usage',
                    file: filePath,
                    line: lineNumber,
                    message: 'Use of eval() detected - potential security risk'
                });
                vulnerabilities++;
            }

            // Check for innerHTML usage
            if (line.includes('innerHTML') && this.qualityRules.security.noInnerHTML) {
                issues.push({
                    type: 'innerhtml-usage',
                    file: filePath,
                    line: lineNumber,
                    message: 'Use of innerHTML detected - potential XSS risk'
                });
                vulnerabilities++;
            }

            // Check for hardcoded secrets
            const secretPatterns = [
                /password\s*[:=]\s*['"][^'"]*['"]/i,
                /secret\s*[:=]\s*['"][^'"]*['"]/i,
                /token\s*[:=]\s*['"][^'"]*['"]/i,
                /key\s*[:=]\s*['"][^'"]*['"]/i
            ];

            for (const pattern of secretPatterns) {
                if (pattern.test(line) && this.qualityRules.security.noHardcodedSecrets) {
                    issues.push({
                        type: 'hardcoded-secret',
                        file: filePath,
                        line: lineNumber,
                        message: 'Potential hardcoded secret detected'
                    });
                    vulnerabilities++;
                }
            }

            // Check for input validation
            if (line.includes('validate') || line.includes('sanitize')) {
                inputValidations++;
            }
        }

        return {
            issues,
            inputValidations,
            vulnerabilities
        };
    }

    /**
     * Analyze test coverage
     */
    async analyzeCoverage() {
        console.log('Analyzing test coverage...');

        const coverageMetrics = this.qualityMetrics.get('coverage');

        try {
            // Run test coverage
            const testCommand = 'npm test -- --coverage';
            const { stdout } = await execAsync(testCommand);

            // Parse coverage output (simplified)
            const coverageMatch = stdout.match(/Lines\s*:\s*(\d+\.\d+)%/);
            if (coverageMatch) {
                const coveragePercent = parseFloat(coverageMatch[1]);
                coverageMetrics.linesCovered = Math.round(coveragePercent);
                coverageMetrics.totalLines = 100;
            }

        } catch (error) {
            console.warn('Coverage analysis failed:', error.message);
        }
    }

    /**
     * Calculate overall quality score
     */
    calculateOverallScore() {
        const weights = {
            complexity: 0.25,
            style: 0.20,
            bestPractices: 0.25,
            security: 0.20,
            coverage: 0.10
        };

        let totalScore = 0;

        // Complexity score
        const complexity = this.qualityMetrics.get('complexity');
        const complexityScore = Math.max(0, 100 - (complexity.functionsOverThreshold / Math.max(1, complexity.totalFunctions)) * 100);
        totalScore += complexityScore * weights.complexity;

        // Style score
        const style = this.qualityMetrics.get('style');
        const styleScore = Math.max(0, 100 - (style.styleViolations / Math.max(1, style.totalFiles * 10)) * 100);
        totalScore += styleScore * weights.style;

        // Best practices score
        const bestPractices = this.qualityMetrics.get('bestPractices');
        const docScore = bestPractices.totalFunctions > 0 ?
            (bestPractices.documentedFunctions / bestPractices.totalFunctions) * 100 : 100;
        const consoleScore = Math.max(0, 100 - bestPractices.consoleLogs * 10);
        const bestPracticesScore = (docScore + consoleScore) / 2;
        totalScore += bestPracticesScore * weights.bestPractices;

        // Security score
        const security = this.qualityMetrics.get('security');
        const securityScore = Math.max(0, 100 - security.securityIssues * 5);
        totalScore += securityScore * weights.security;

        // Coverage score
        const coverage = this.qualityMetrics.get('coverage');
        const coverageScore = coverage.linesCovered;
        totalScore += coverageScore * weights.coverage;

        return Math.round(totalScore * 10) / 10;
    }

    /**
     * Generate quality report
     */
    async generateQualityReport(analysisId) {
        const report = {
            id: analysisId,
            timestamp: new Date().toISOString(),
            summary: {
                overallScore: this.calculateOverallScore(),
                totalIssues: this.countTotalIssues(),
                totalFiles: await this.countTotalFiles()
            },
            metrics: Object.fromEntries(this.qualityMetrics),
            issues: Object.fromEntries(this.issues),
            recommendations: this.generateRecommendations()
        };

        // Save report
        const reportPath = path.join(this.projectRoot, 'reports', 'quality', `${analysisId}.json`);
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        this.reports.set(analysisId, report);

        return report;
    }

    /**
     * Count total issues
     */
    countTotalIssues() {
        let total = 0;
        for (const [category, issues] of this.issues) {
            total += issues.length;
        }
        return total;
    }

    /**
     * Count total files
     */
    async countTotalFiles() {
        let total = 0;
        for (const sourcePath of this.sourcePaths) {
            try {
                const files = await this.getJavaScriptFiles(sourcePath);
                total += files.length;
            } catch (error) {
                // Ignore errors
            }
        }
        return total;
    }

    /**
     * Generate recommendations
     */
    generateRecommendations() {
        const recommendations = [];

        const complexity = this.qualityMetrics.get('complexity');
        if (complexity.functionsOverThreshold > 0) {
            recommendations.push({
                type: 'complexity',
                priority: 'high',
                message: `Refactor ${complexity.functionsOverThreshold} functions with high complexity`,
                action: 'Break down complex functions into smaller, more manageable pieces'
            });
        }

        const style = this.qualityMetrics.get('style');
        if (style.styleViolations > 0) {
            recommendations.push({
                type: 'style',
                priority: 'medium',
                message: `Fix ${style.styleViolations} style violations`,
                action: 'Run ESLint and Prettier to automatically fix style issues'
            });
        }

        const bestPractices = this.qualityMetrics.get('bestPractices');
        const undocumentedPercent = bestPractices.totalFunctions > 0 ?
            ((bestPractices.totalFunctions - bestPractices.documentedFunctions) / bestPractices.totalFunctions) * 100 : 0;

        if (undocumentedPercent > 20) {
            recommendations.push({
                type: 'documentation',
                priority: 'medium',
                message: `${undocumentedPercent.toFixed(1)}% of functions are undocumented`,
                action: 'Add JSDoc documentation to all public functions'
            });
        }

        const security = this.qualityMetrics.get('security');
        if (security.securityIssues > 0) {
            recommendations.push({
                type: 'security',
                priority: 'high',
                message: `Address ${security.securityIssues} security issues`,
                action: 'Review and fix all security vulnerabilities'
            });
        }

        return recommendations;
    }

    /**
     * Auto-fix quality issues
     */
    async autoFix(options = {}) {
        const {
            fixStyle = true,
            fixFormatting = true,
            removeConsoleLogs = false,
            removeDebugger = false
        } = options;

        console.log('Starting auto-fix process...');

        let fixedFiles = 0;
        let fixedIssues = 0;

        try {
            if (fixStyle) {
                console.log('Fixing style issues...');
                await execAsync(`npx eslint ${this.sourcePaths.join(' ')} --fix`);
                fixedIssues += await this.countAutoFixedIssues('style');
            }

            if (fixFormatting) {
                console.log('Fixing formatting issues...');
                await execAsync(`npx prettier --write ${this.sourcePaths.join(' ')}`);
                fixedFiles += await this.countFormattedFiles();
            }

            if (removeConsoleLogs) {
                console.log('Removing console.log statements...');
                fixedIssues += await this.removeConsoleLogs();
            }

            if (removeDebugger) {
                console.log('Removing debugger statements...');
                fixedIssues += await this.removeDebuggerStatements();
            }

            console.log(`Auto-fix completed: ${fixedFiles} files formatted, ${fixedIssues} issues fixed`);

            return {
                fixedFiles,
                fixedIssues,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Auto-fix failed:', error);
            throw error;
        }
    }

    /**
     * Count auto-fixed issues
     */
    async countAutoFixedIssues(category) {
        // Simplified - would need to compare before/after
        return 0;
    }

    /**
     * Count formatted files
     */
    async countFormattedFiles() {
        let count = 0;
        for (const sourcePath of this.sourcePaths) {
            try {
                const files = await this.getJavaScriptFiles(sourcePath);
                count += files.length;
            } catch (error) {
                // Ignore
            }
        }
        return count;
    }

    /**
     * Remove console.log statements
     */
    async removeConsoleLogs() {
        let removed = 0;

        for (const sourcePath of this.sourcePaths) {
            try {
                const files = await this.getJavaScriptFiles(sourcePath);

                for (const file of files) {
                    const content = await fs.readFile(file, 'utf8');
                    const newContent = content.replace(/^\s*console\.log\(.*\);\s*$/gm, '');

                    if (newContent !== content) {
                        await fs.writeFile(file, newContent);
                        removed++;
                    }
                }
            } catch (error) {
                // Ignore
            }
        }

        return removed;
    }

    /**
     * Remove debugger statements
     */
    async removeDebuggerStatements() {
        let removed = 0;

        for (const sourcePath of this.sourcePaths) {
            try {
                const files = await this.getJavaScriptFiles(sourcePath);

                for (const file of files) {
                    const content = await fs.readFile(file, 'utf8');
                    const newContent = content.replace(/^\s*debugger;\s*$/gm, '');

                    if (newContent !== content) {
                        await fs.writeFile(file, newContent);
                        removed++;
                    }
                }
            } catch (error) {
                // Ignore
            }
        }

        return removed;
    }

    /**
     * Get JavaScript files from directory
     */
    async getJavaScriptFiles(dirPath) {
        const files = [];

        async function scan(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await scan(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
        }

        await scan(dirPath);
        return files;
    }

    /**
     * Record quality issue
     */
    recordIssue(category, type, details) {
        if (!this.issues.has(category)) {
            this.issues.set(category, []);
        }

        this.issues.get(category).push({
            type,
            ...details,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Generate analysis ID
     */
    generateAnalysisId() {
        return `quality-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get quality metrics
     */
    getMetrics() {
        return {
            current: Object.fromEntries(this.qualityMetrics),
            overallScore: this.calculateOverallScore(),
            totalIssues: this.countTotalIssues(),
            lastAnalysis: new Date().toISOString()
        };
    }

    /**
     * Get quality reports
     */
    getReports(options = {}) {
        const { limit = 10, sortBy = 'timestamp' } = options;

        const reports = Array.from(this.reports.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

        return reports;
    }

    /**
     * Export quality configuration
     */
    async exportConfiguration() {
        const configPath = path.join(this.projectRoot, '.code-quality.json');
        await fs.writeFile(configPath, JSON.stringify(this.qualityRules, null, 2));
        console.log('Quality configuration exported');
    }

    /**
     * Destroy the quality manager
     */
    destroy() {
        this.qualityMetrics.clear();
        this.issues.clear();
        this.reports.clear();

        console.log('Code quality manager destroyed');
    }
}

module.exports = CodeQualityManager;
