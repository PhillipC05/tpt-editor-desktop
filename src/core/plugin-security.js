/**
 * Plugin Security Manager
 * Handles plugin sandboxing, permissions, and security auditing
 */

const UserPreferences = require('./user-preferences');
const { VM } = require('vm');
const crypto = require('crypto');

class PluginSecurity {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.pluginSystem = options.pluginSystem;
        this.permissions = new Map();
        this.sandboxes = new Map();
        this.auditLog = [];
        this.securityPolicies = new Map();
        this.threatPatterns = new Set();

        this.init();
    }

    /**
     * Initialize plugin security
     */
    async init() {
        await this.preferences.init();
        this.setupDefaultPermissions();
        this.setupSecurityPolicies();
        this.setupThreatDetection();
        this.loadSecuritySettings();

        console.log('Plugin security initialized');
    }

    /**
     * Setup default permissions
     */
    setupDefaultPermissions() {
        const defaultPermissions = {
            // File system permissions
            'fs:read': {
                description: 'Read files from the file system',
                risk: 'low',
                default: true
            },
            'fs:write': {
                description: 'Write files to the file system',
                risk: 'medium',
                default: false
            },
            'fs:delete': {
                description: 'Delete files from the file system',
                risk: 'high',
                default: false
            },

            // Network permissions
            'network:http': {
                description: 'Make HTTP requests',
                risk: 'medium',
                default: false
            },
            'network:websocket': {
                description: 'Establish WebSocket connections',
                risk: 'medium',
                default: false
            },

            // System permissions
            'system:exec': {
                description: 'Execute system commands',
                risk: 'high',
                default: false
            },
            'system:spawn': {
                description: 'Spawn child processes',
                risk: 'high',
                default: false
            },

            // UI permissions
            'ui:modify': {
                description: 'Modify the user interface',
                risk: 'medium',
                default: true
            },
            'ui:access': {
                description: 'Access UI elements and data',
                risk: 'low',
                default: true
            },

            // Data permissions
            'data:read': {
                description: 'Read application data',
                risk: 'low',
                default: true
            },
            'data:write': {
                description: 'Write application data',
                risk: 'medium',
                default: false
            },

            // Generator permissions
            'generator:execute': {
                description: 'Execute generators',
                risk: 'low',
                default: true
            },
            'generator:modify': {
                description: 'Modify generator configurations',
                risk: 'medium',
                default: false
            },

            // Plugin permissions
            'plugin:install': {
                description: 'Install new plugins',
                risk: 'high',
                default: false
            },
            'plugin:uninstall': {
                description: 'Uninstall plugins',
                risk: 'high',
                default: false
            }
        };

        Object.entries(defaultPermissions).forEach(([permission, config]) => {
            this.permissions.set(permission, config);
        });
    }

    /**
     * Setup security policies
     */
    setupSecurityPolicies() {
        const policies = {
            // Sandbox policies
            'sandbox:strict': {
                description: 'Strict sandbox with limited access',
                allowedPermissions: ['fs:read', 'ui:access', 'data:read', 'generator:execute'],
                maxMemory: 50 * 1024 * 1024, // 50MB
                maxExecutionTime: 30000, // 30 seconds
                networkAccess: false
            },

            'sandbox:moderate': {
                description: 'Moderate sandbox with extended access',
                allowedPermissions: ['fs:read', 'fs:write', 'ui:modify', 'data:read', 'data:write', 'generator:execute', 'generator:modify'],
                maxMemory: 100 * 1024 * 1024, // 100MB
                maxExecutionTime: 60000, // 60 seconds
                networkAccess: true
            },

            'sandbox:permissive': {
                description: 'Permissive sandbox with broad access',
                allowedPermissions: ['*'], // All permissions
                maxMemory: 500 * 1024 * 1024, // 500MB
                maxExecutionTime: 300000, // 5 minutes
                networkAccess: true
            }
        };

        Object.entries(policies).forEach(([policy, config]) => {
            this.securityPolicies.set(policy, config);
        });
    }

    /**
     * Setup threat detection
     */
    setupThreatDetection() {
        // Common threat patterns
        const patterns = [
            // Code injection patterns
            /eval\s*\(/gi,
            /Function\s*\(/gi,
            /setTimeout\s*\(\s*['"`]/gi,
            /setInterval\s*\(\s*['"`]/gi,

            // File system abuse
            /\.\.[\/\\]/gi, // Directory traversal
            /\/etc\/passwd/gi,
            /\/etc\/shadow/gi,

            // Network abuse
            /http:\/\/.*:.*@/gi, // Basic auth in URLs
            /password.*=.*['"`]/gi,

            // Memory abuse
            /while\s*\(\s*true\s*\)/gi,
            /for\s*\(\s*;;\s*\)/gi,

            // System abuse
            /require\s*\(\s*['"`]child_process['"`]\s*\)/gi,
            /require\s*\(\s*['"`]fs['"`]\s*\)/gi,
            /process\.exit/gi,
            /global\./gi
        ];

        patterns.forEach(pattern => {
            this.threatPatterns.add(pattern);
        });
    }

    /**
     * Create sandbox for plugin
     */
    createSandbox(pluginId, securityLevel = 'moderate') {
        const policy = this.securityPolicies.get(`sandbox:${securityLevel}`) ||
                      this.securityPolicies.get('sandbox:moderate');

        const sandbox = {
            // Safe globals
            console: {
                log: (...args) => this.safeLog(pluginId, 'log', ...args),
                warn: (...args) => this.safeLog(pluginId, 'warn', ...args),
                error: (...args) => this.safeLog(pluginId, 'error', ...args),
                info: (...args) => this.safeLog(pluginId, 'info', ...args)
            },

            // Safe Math and Date
            Math: Math,
            Date: Date,
            JSON: JSON,

            // Safe Array and Object methods
            Array: Array,
            Object: Object,
            String: String,
            Number: Number,
            Boolean: Boolean,

            // Plugin context
            pluginId: pluginId,
            securityLevel: securityLevel,

            // Safe setTimeout/setInterval with limits
            setTimeout: (callback, delay) => {
                if (delay > policy.maxExecutionTime) {
                    throw new Error(`Timeout exceeds maximum allowed: ${policy.maxExecutionTime}ms`);
                }
                return setTimeout(() => {
                    try {
                        callback();
                    } catch (error) {
                        this.handlePluginError(pluginId, error);
                    }
                }, delay);
            },

            setInterval: (callback, delay) => {
                if (delay > policy.maxExecutionTime) {
                    throw new Error(`Interval delay exceeds maximum allowed: ${policy.maxExecutionTime}ms`);
                }
                return setInterval(() => {
                    try {
                        callback();
                    } catch (error) {
                        this.handlePluginError(pluginId, error);
                    }
                }, delay);
            },

            // Clear timers
            clearTimeout: clearTimeout,
            clearInterval: clearInterval
        };

        // Add permission-checked APIs
        this.addPermissionCheckedAPIs(sandbox, pluginId, policy);

        this.sandboxes.set(pluginId, {
            sandbox,
            policy,
            context: new VM.createContext(sandbox),
            createdAt: new Date().toISOString()
        });

        this.auditLog.push({
            timestamp: new Date().toISOString(),
            type: 'sandbox_created',
            pluginId,
            securityLevel,
            policy: policy.description
        });

        return sandbox;
    }

    /**
     * Add permission-checked APIs to sandbox
     */
    addPermissionCheckedAPIs(sandbox, pluginId, policy) {
        // File system API
        sandbox.fs = {
            readFile: (path) => this.checkPermissionAndExecute(pluginId, 'fs:read', () => {
                // Safe file read implementation
                return this.safeFileRead(path);
            }),

            writeFile: (path, content) => this.checkPermissionAndExecute(pluginId, 'fs:write', () => {
                // Safe file write implementation
                return this.safeFileWrite(path, content);
            }),

            deleteFile: (path) => this.checkPermissionAndExecute(pluginId, 'fs:delete', () => {
                // Safe file delete implementation
                return this.safeFileDelete(path);
            })
        };

        // Network API
        if (policy.networkAccess) {
            sandbox.fetch = (url, options = {}) => this.checkPermissionAndExecute(pluginId, 'network:http', () => {
                return this.safeFetch(url, options);
            });
        }

        // System API
        sandbox.system = {
            exec: (command) => this.checkPermissionAndExecute(pluginId, 'system:exec', () => {
                throw new Error('System execution not allowed in sandbox');
            }),

            spawn: (command, args) => this.checkPermissionAndExecute(pluginId, 'system:spawn', () => {
                throw new Error('Process spawning not allowed in sandbox');
            })
        };

        // UI API
        sandbox.ui = {
            modify: (selector, changes) => this.checkPermissionAndExecute(pluginId, 'ui:modify', () => {
                return this.safeUIModify(selector, changes);
            }),

            access: (selector) => this.checkPermissionAndExecute(pluginId, 'ui:access', () => {
                return this.safeUIAccess(selector);
            })
        };

        // Data API
        sandbox.data = {
            read: (key) => this.checkPermissionAndExecute(pluginId, 'data:read', () => {
                return this.safeDataRead(key);
            }),

            write: (key, value) => this.checkPermissionAndExecute(pluginId, 'data:write', () => {
                return this.safeDataWrite(key, value);
            })
        };

        // Generator API
        sandbox.generator = {
            execute: (generatorId, params) => this.checkPermissionAndExecute(pluginId, 'generator:execute', () => {
                return this.safeGeneratorExecute(generatorId, params);
            }),

            modify: (generatorId, config) => this.checkPermissionAndExecute(pluginId, 'generator:modify', () => {
                return this.safeGeneratorModify(generatorId, config);
            })
        };
    }

    /**
     * Execute code in sandbox
     */
    async executeInSandbox(pluginId, code) {
        const sandboxData = this.sandboxes.get(pluginId);
        if (!sandboxData) {
            throw new Error(`Sandbox not found for plugin: ${pluginId}`);
        }

        // Security scan
        const securityIssues = this.scanCodeForThreats(code);
        if (securityIssues.length > 0) {
            this.auditLog.push({
                timestamp: new Date().toISOString(),
                type: 'security_threat_detected',
                pluginId,
                threats: securityIssues,
                code: code.substring(0, 200) + '...'
            });

            throw new Error(`Security threats detected in plugin code: ${securityIssues.join(', ')}`);
        }

        try {
            const result = VM.runInContext(code, sandboxData.context, {
                timeout: sandboxData.policy.maxExecutionTime,
                filename: `plugin-${pluginId}.js`
            });

            this.auditLog.push({
                timestamp: new Date().toISOString(),
                type: 'code_execution',
                pluginId,
                success: true
            });

            return result;

        } catch (error) {
            this.auditLog.push({
                timestamp: new Date().toISOString(),
                type: 'code_execution_error',
                pluginId,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Check permission and execute
     */
    checkPermissionAndExecute(pluginId, permission, action) {
        if (!this.hasPermission(pluginId, permission)) {
            const error = new Error(`Permission denied: ${permission}`);
            this.auditLog.push({
                timestamp: new Date().toISOString(),
                type: 'permission_denied',
                pluginId,
                permission,
                error: error.message
            });
            throw error;
        }

        this.auditLog.push({
            timestamp: new Date().toISOString(),
            type: 'permission_granted',
            pluginId,
            permission
        });

        return action();
    }

    /**
     * Check if plugin has permission
     */
    hasPermission(pluginId, permission) {
        const plugin = this.pluginSystem?.getPlugin(pluginId);
        if (!plugin) return false;

        const pluginPermissions = plugin.permissions || [];
        const permissionConfig = this.permissions.get(permission);

        // Check if permission is allowed by policy
        const sandboxData = this.sandboxes.get(pluginId);
        if (sandboxData) {
            const allowedPermissions = sandboxData.policy.allowedPermissions;
            if (!allowedPermissions.includes('*') && !allowedPermissions.includes(permission)) {
                return false;
            }
        }

        // Check plugin-specific permissions
        return pluginPermissions.includes(permission) ||
               (permissionConfig && permissionConfig.default);
    }

    /**
     * Grant permission to plugin
     */
    grantPermission(pluginId, permission) {
        const plugin = this.pluginSystem?.getPlugin(pluginId);
        if (!plugin) {
            throw new Error(`Plugin not found: ${pluginId}`);
        }

        if (!plugin.permissions) {
            plugin.permissions = [];
        }

        if (!plugin.permissions.includes(permission)) {
            plugin.permissions.push(permission);

            this.auditLog.push({
                timestamp: new Date().toISOString(),
                type: 'permission_granted_admin',
                pluginId,
                permission,
                grantedBy: 'admin'
            });
        }
    }

    /**
     * Revoke permission from plugin
     */
    revokePermission(pluginId, permission) {
        const plugin = this.pluginSystem?.getPlugin(pluginId);
        if (!plugin) return;

        if (plugin.permissions) {
            const index = plugin.permissions.indexOf(permission);
            if (index > -1) {
                plugin.permissions.splice(index, 1);

                this.auditLog.push({
                    timestamp: new Date().toISOString(),
                    type: 'permission_revoked',
                    pluginId,
                    permission,
                    revokedBy: 'admin'
                });
            }
        }
    }

    /**
     * Scan code for security threats
     */
    scanCodeForThreats(code) {
        const threats = [];

        for (const pattern of this.threatPatterns) {
            const matches = code.match(pattern);
            if (matches) {
                threats.push(`${pattern.source} (${matches.length} occurrences)`);
            }
        }

        return threats;
    }

    /**
     * Validate plugin code
     */
    async validatePluginCode(pluginId, code) {
        const issues = [];

        // Security scan
        const securityIssues = this.scanCodeForThreats(code);
        if (securityIssues.length > 0) {
            issues.push({
                type: 'security',
                severity: 'high',
                message: `Security threats detected: ${securityIssues.join(', ')}`
            });
        }

        // Syntax validation
        try {
            new VM.Script(code);
        } catch (error) {
            issues.push({
                type: 'syntax',
                severity: 'high',
                message: `Syntax error: ${error.message}`
            });
        }

        // Size limits
        const sandboxData = this.sandboxes.get(pluginId);
        if (sandboxData && code.length > sandboxData.policy.maxMemory) {
            issues.push({
                type: 'size',
                severity: 'medium',
                message: `Code size exceeds limit: ${code.length} > ${sandboxData.policy.maxMemory}`
            });
        }

        return issues;
    }

    /**
     * Get security report for plugin
     */
    getSecurityReport(pluginId) {
        const plugin = this.pluginSystem?.getPlugin(pluginId);
        const sandboxData = this.sandboxes.get(pluginId);

        const report = {
            pluginId,
            securityLevel: sandboxData?.policy.description || 'Unknown',
            permissions: plugin?.permissions || [],
            auditEntries: this.auditLog.filter(entry => entry.pluginId === pluginId),
            threatCount: this.auditLog.filter(entry =>
                entry.pluginId === pluginId && entry.type === 'security_threat_detected'
            ).length,
            permissionDenials: this.auditLog.filter(entry =>
                entry.pluginId === pluginId && entry.type === 'permission_denied'
            ).length,
            lastActivity: this.auditLog
                .filter(entry => entry.pluginId === pluginId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp
        };

        return report;
    }

    /**
     * Get overall security report
     */
    getOverallSecurityReport() {
        const report = {
            totalPlugins: this.pluginSystem?.getAllPlugins().length || 0,
            activeSandboxes: this.sandboxes.size,
            totalAuditEntries: this.auditLog.length,
            securityIncidents: this.auditLog.filter(entry =>
                entry.type === 'security_threat_detected'
            ).length,
            permissionDenials: this.auditLog.filter(entry =>
                entry.type === 'permission_denied'
            ).length,
            recentActivity: this.auditLog
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10)
        };

        return report;
    }

    /**
     * Safe logging function
     */
    safeLog(pluginId, level, ...args) {
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');

        console[level](`[PLUGIN:${pluginId}] ${message}`);

        this.auditLog.push({
            timestamp: new Date().toISOString(),
            type: 'log',
            pluginId,
            level,
            message
        });
    }

    /**
     * Handle plugin errors
     */
    handlePluginError(pluginId, error) {
        console.error(`Plugin ${pluginId} error:`, error);

        this.auditLog.push({
            timestamp: new Date().toISOString(),
            type: 'plugin_error',
            pluginId,
            error: error.message,
            stack: error.stack
        });
    }

    /**
     * Safe file operations (implementations would be more robust)
     */
    async safeFileRead(path) {
        // Implementation would include path validation, size limits, etc.
        console.log(`[SECURITY] Plugin file read: ${path}`);
        return 'File content (simulated)';
    }

    async safeFileWrite(path, content) {
        // Implementation would include path validation, content validation, etc.
        console.log(`[SECURITY] Plugin file write: ${path}`);
        return true;
    }

    async safeFileDelete(path) {
        // Implementation would include path validation, confirmation, etc.
        console.log(`[SECURITY] Plugin file delete: ${path}`);
        return true;
    }

    async safeFetch(url, options) {
        // Implementation would include URL validation, request limits, etc.
        console.log(`[SECURITY] Plugin network request: ${url}`);
        return { status: 200, data: 'Response data (simulated)' };
    }

    async safeUIModify(selector, changes) {
        // Implementation would include selector validation, change limits, etc.
        console.log(`[SECURITY] Plugin UI modify: ${selector}`);
        return true;
    }

    async safeUIAccess(selector) {
        // Implementation would include selector validation, access limits, etc.
        console.log(`[SECURITY] Plugin UI access: ${selector}`);
        return 'UI element data (simulated)';
    }

    async safeDataRead(key) {
        // Implementation would include key validation, access control, etc.
        console.log(`[SECURITY] Plugin data read: ${key}`);
        return 'Data value (simulated)';
    }

    async safeDataWrite(key, value) {
        // Implementation would include key validation, value validation, etc.
        console.log(`[SECURITY] Plugin data write: ${key}`);
        return true;
    }

    async safeGeneratorExecute(generatorId, params) {
        // Implementation would include parameter validation, execution limits, etc.
        console.log(`[SECURITY] Plugin generator execute: ${generatorId}`);
        return 'Generator result (simulated)';
    }

    async safeGeneratorModify(generatorId, config) {
        // Implementation would include config validation, modification limits, etc.
        console.log(`[SECURITY] Plugin generator modify: ${generatorId}`);
        return true;
    }

    /**
     * Load security settings
     */
    loadSecuritySettings() {
        const settings = this.preferences.get('pluginSecurity', {});
        // Load custom permissions, policies, etc.
    }

    /**
     * Save security settings
     */
    async saveSecuritySettings() {
        const settings = {
            // Save custom permissions, policies, etc.
        };
        await this.preferences.set('pluginSecurity', settings);
    }

    /**
     * Export security audit log
     */
    exportAuditLog() {
        return JSON.stringify(this.auditLog, null, 2);
    }

    /**
     * Clear audit log (admin function)
     */
    clearAuditLog() {
        this.auditLog = [];
        this.auditLog.push({
            timestamp: new Date().toISOString(),
            type: 'audit_log_cleared',
            clearedBy: 'admin'
        });
    }

    /**
     * Destroy security manager
     */
    destroy() {
        this.permissions.clear();
        this.sandboxes.clear();
        this.securityPolicies.clear();
        this.threatPatterns.clear();

        console.log('Plugin security manager destroyed');
    }
}

module.exports = PluginSecurity;
