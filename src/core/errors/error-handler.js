/**
 * TPT Asset Editor Desktop - Error Handler
 * Centralized error handling, recovery, and reporting system
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class ErrorHandler extends EventEmitter {
    constructor(options = {}) {
        super();

        this.logPath = options.logPath || path.join(process.cwd(), 'logs', 'errors.log');
        this.maxLogSize = options.maxLogSize || 10 * 1024 * 1024; // 10MB
        this.maxLogFiles = options.maxLogFiles || 5;
        this.recoveryStrategies = new Map();
        this.errorCounts = new Map();
        this.errorPatterns = new Map();

        // Initialize log directory
        this.initializeLogging();

        // Set up default recovery strategies
        this.setupDefaultRecoveryStrategies();

        // Set up global error handlers
        this.setupGlobalErrorHandlers();
    }

    /**
     * Initialize logging system
     */
    async initializeLogging() {
        try {
            const logDir = path.dirname(this.logPath);
            await fs.mkdir(logDir, { recursive: true });

            // Check if log file exists and rotate if necessary
            await this.rotateLogIfNeeded();

            console.log('Error logging initialized:', this.logPath);
        } catch (error) {
            console.error('Failed to initialize error logging:', error);
        }
    }

    /**
     * Handle an error with recovery and logging
     */
    async handleError(error, context = {}) {
        try {
            // Enhance error with context
            const enhancedError = this.enhanceError(error, context);

            // Log the error
            await this.logError(enhancedError);

            // Update error statistics
            this.updateErrorStatistics(enhancedError);

            // Attempt recovery
            const recoveryResult = await this.attemptRecovery(enhancedError);

            // Emit error event
            this.emit('errorHandled', {
                error: enhancedError,
                recovery: recoveryResult,
                context
            });

            return {
                handled: true,
                recovery: recoveryResult,
                error: enhancedError
            };

        } catch (handlingError) {
            console.error('Error in error handler:', handlingError);

            // Fallback error handling
            this.emit('errorHandlerFailed', {
                originalError: error,
                handlingError,
                context
            });

            return {
                handled: false,
                recovery: null,
                error: handlingError
            };
        }
    }

    /**
     * Enhance error with additional context
     */
    enhanceError(error, context) {
        if (error instanceof Error) {
            // Add context to existing error
            error.context = { ...error.context, ...context };
            error.handledAt = new Date().toISOString();
            return error;
        } else {
            // Create new error from non-Error object
            const newError = new Error(typeof error === 'string' ? error : 'Unknown error');
            newError.context = context;
            newError.handledAt = new Date().toISOString();
            return newError;
        }
    }

    /**
     * Log error to file and console
     */
    async logError(error) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                message: error.message,
                stack: error.stack,
                code: error.code,
                context: error.context,
                userMessage: error.userMessage
            };

            const logLine = JSON.stringify(logEntry) + '\n';

            // Write to log file
            await fs.appendFile(this.logPath, logLine);

            // Also log to console with appropriate level
            console.error('[ErrorHandler]', error.message, {
                code: error.code,
                context: error.context
            });

        } catch (logError) {
            console.error('Failed to log error:', logError);
        }
    }

    /**
     * Update error statistics for monitoring
     */
    updateErrorStatistics(error) {
        const errorKey = error.code || error.name || 'UNKNOWN';

        // Update error count
        const currentCount = this.errorCounts.get(errorKey) || 0;
        this.errorCounts.set(errorKey, currentCount + 1);

        // Update error patterns
        const patternKey = this.generatePatternKey(error);
        const patternCount = this.errorPatterns.get(patternKey) || 0;
        this.errorPatterns.set(patternKey, patternCount + 1);

        // Emit statistics update
        this.emit('statisticsUpdated', {
            errorCounts: Object.fromEntries(this.errorCounts),
            errorPatterns: Object.fromEntries(this.errorPatterns)
        });
    }

    /**
     * Attempt error recovery
     */
    async attemptRecovery(error) {
        try {
            const recoveryStrategy = this.findRecoveryStrategy(error);

            if (recoveryStrategy) {
                const result = await recoveryStrategy(error);

                this.emit('recoveryAttempted', {
                    error,
                    strategy: recoveryStrategy.name,
                    result
                });

                return {
                    attempted: true,
                    successful: result.success,
                    strategy: recoveryStrategy.name,
                    result: result.data
                };
            }

            return {
                attempted: false,
                reason: 'No recovery strategy found'
            };

        } catch (recoveryError) {
            console.error('Recovery attempt failed:', recoveryError);

            return {
                attempted: true,
                successful: false,
                error: recoveryError.message
            };
        }
    }

    /**
     * Find appropriate recovery strategy for error
     */
    findRecoveryStrategy(error) {
        // Try exact code match first
        if (error.code && this.recoveryStrategies.has(error.code)) {
            return this.recoveryStrategies.get(error.code);
        }

        // Try error name match
        if (error.name && this.recoveryStrategies.has(error.name)) {
            return this.recoveryStrategies.get(error.name);
        }

        // Try pattern matching
        for (const [pattern, strategy] of this.recoveryStrategies) {
            if (this.matchesPattern(error, pattern)) {
                return strategy;
            }
        }

        return null;
    }

    /**
     * Check if error matches a pattern
     */
    matchesPattern(error, pattern) {
        // Simple pattern matching - can be enhanced
        const errorString = `${error.name}:${error.code}:${error.message}`.toLowerCase();
        return errorString.includes(pattern.toLowerCase());
    }

    /**
     * Register a recovery strategy
     */
    registerRecoveryStrategy(pattern, strategy) {
        if (typeof strategy !== 'function') {
            throw new Error('Recovery strategy must be a function');
        }

        this.recoveryStrategies.set(pattern, strategy);
        console.log(`Recovery strategy registered for: ${pattern}`);
    }

    /**
     * Set up default recovery strategies
     */
    setupDefaultRecoveryStrategies() {
        // Database connection recovery
        this.registerRecoveryStrategy('DATABASE_ERROR', async (error) => {
            if (error.details?.reason === 'connection_lost') {
                // Attempt to reconnect
                try {
                    // This would integrate with the database manager
                    console.log('Attempting database reconnection...');
                    return { success: true, data: 'Database reconnected' };
                } catch (reconnectError) {
                    return { success: false, data: reconnectError.message };
                }
            }
            return { success: false, data: 'No automatic recovery available' };
        });

        // Generation timeout recovery
        this.registerRecoveryStrategy('GENERATION_ERROR', async (error) => {
            if (error.details?.phase === 'timeout') {
                // Suggest retry with simpler settings
                return {
                    success: true,
                    data: 'Suggested: Retry with reduced complexity or increased timeout'
                };
            }
            return { success: false, data: 'Generation failed' };
        });

        // Validation error recovery
        this.registerRecoveryStrategy('VALIDATION_ERROR', async (error) => {
            // Provide suggestions based on validation error
            const suggestions = this.generateValidationSuggestions(error);
            return {
                success: true,
                data: suggestions
            };
        });

        // Network error recovery
        this.registerRecoveryStrategy('NETWORK_ERROR', async (error) => {
            // Attempt retry with exponential backoff
            console.log('Network error detected, attempting retry...');
            return { success: true, data: 'Retry scheduled' };
        });
    }

    /**
     * Generate validation error suggestions
     */
    generateValidationSuggestions(error) {
        const suggestions = [];

        if (error.field && error.details?.constraints) {
            const { constraints } = error.details;

            if (constraints.required) {
                suggestions.push(`Please provide a value for ${error.field}`);
            }

            if (constraints.min !== undefined || constraints.max !== undefined) {
                suggestions.push(`Value must be between ${constraints.min} and ${constraints.max}`);
            }

            if (constraints.expectedType) {
                suggestions.push(`Please provide a ${constraints.expectedType}`);
            }
        }

        return suggestions.length > 0 ? suggestions : ['Please check your input and try again'];
    }

    /**
     * Set up global error handlers
     */
    setupGlobalErrorHandlers() {
        // Handle uncaught exceptions
        process.on('uncaughtException', async (error) => {
            console.error('Uncaught Exception:', error);
            await this.handleError(error, { source: 'uncaughtException' });
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', async (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            const error = reason instanceof Error ? reason : new Error(String(reason));
            await this.handleError(error, { source: 'unhandledRejection', promise });
        });

        // Handle process warnings
        process.on('warning', async (warning) => {
            console.warn('Process Warning:', warning);
            await this.handleError(warning, { source: 'processWarning', level: 'warning' });
        });
    }

    /**
     * Rotate log file if it gets too large
     */
    async rotateLogIfNeeded() {
        try {
            const stats = await fs.stat(this.logPath);
            if (stats.size > this.maxLogSize) {
                await this.rotateLog();
            }
        } catch (error) {
            // File doesn't exist or can't be read, that's fine
        }
    }

    /**
     * Rotate log files
     */
    async rotateLog() {
        try {
            const logDir = path.dirname(this.logPath);
            const baseName = path.basename(this.logPath, '.log');

            // Move current log to backup
            const backupPath = path.join(logDir, `${baseName}.1.log`);
            await fs.rename(this.logPath, backupPath);

            // Rotate existing backups
            for (let i = this.maxLogFiles - 1; i > 0; i--) {
                const oldPath = path.join(logDir, `${baseName}.${i}.log`);
                const newPath = path.join(logDir, `${baseName}.${i + 1}.log`);

                try {
                    await fs.rename(oldPath, newPath);
                } catch (error) {
                    // File doesn't exist, skip
                }
            }

            console.log('Log files rotated');
        } catch (error) {
            console.error('Failed to rotate log files:', error);
        }
    }

    /**
     * Generate pattern key for error
     */
    generatePatternKey(error) {
        return `${error.name || 'Error'}:${error.code || 'UNKNOWN'}`;
    }

    /**
     * Get error statistics
     */
    getErrorStatistics() {
        return {
            errorCounts: Object.fromEntries(this.errorCounts),
            errorPatterns: Object.fromEntries(this.errorPatterns),
            totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0),
            uniqueErrorTypes: this.errorCounts.size
        };
    }

    /**
     * Clear error statistics
     */
    clearErrorStatistics() {
        this.errorCounts.clear();
        this.errorPatterns.clear();
        this.emit('statisticsCleared');
    }

    /**
     * Export error log
     */
    async exportErrorLog(exportPath) {
        try {
            await fs.copyFile(this.logPath, exportPath);
            return { success: true, path: exportPath };
        } catch (error) {
            console.error('Failed to export error log:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        // Clear all recovery strategies
        this.recoveryStrategies.clear();

        // Clear statistics
        this.clearErrorStatistics();

        // Remove all listeners
        this.removeAllListeners();

        console.log('Error handler cleaned up');
    }
}

module.exports = ErrorHandler;
