/**
 * Centralized Error Logger for TPT Asset Editor Desktop
 * Provides consistent error handling and logging across the application
 */

class ErrorHandler {
  /**
   * Log an error with context
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @param {Object} metadata - Additional metadata
   */
  static logError(message, error, context = 'Unknown', metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      error: error ? error.message : 'No error object',
      stack: error ? error.stack : 'No stack trace',
      context,
      metadata
    };

    // Log to console
    console.error(`[${timestamp}] ERROR in ${context}: ${message}`, error);

    // In a production environment, you might want to:
    // 1. Write to a log file
    // 2. Send to a remote logging service
    // 3. Display in UI

    return logEntry;
  }

  /**
   * Log a warning
   * @param {string} message - Warning message
   * @param {string} context - Context where warning occurred
   * @param {Object} metadata - Additional metadata
   */
  static logWarning(message, context = 'Unknown', metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      context,
      metadata,
      level: 'warning'
    };

    console.warn(`[${timestamp}] WARNING in ${context}: ${message}`);

    return logEntry;
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {string} context - Context where info occurred
   * @param {Object} metadata - Additional metadata
   */
  static logInfo(message, context = 'Unknown', metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      context,
      metadata,
      level: 'info'
    };

    console.info(`[${timestamp}] INFO in ${context}: ${message}`);

    return logEntry;
  }

  /**
   * Create a standardized error response
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {number} statusCode - HTTP status code (if applicable)
   * @returns {Object} Standardized error object
   */
  static createErrorResponse(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    return {
      success: false,
      error: {
        message,
        code,
        statusCode,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Wrap an async function with error handling
   * @param {Function} fn - Async function to wrap
   * @param {string} context - Context for error logging
   * @returns {Function} Wrapped function with error handling
   */
  static asyncWrapper(fn, context = 'Async Operation') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.logError(`Error in ${context}`, error, context, { args });
        throw error;
      }
    };
  }

  /**
   * Wrap a synchronous function with error handling
   * @param {Function} fn - Synchronous function to wrap
   * @param {string} context - Context for error logging
   * @returns {Function} Wrapped function with error handling
   */
  static syncWrapper(fn, context = 'Sync Operation') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.logError(`Error in ${context}`, error, context, { args });
        throw error;
      }
    };
  }
}

module.exports = ErrorHandler;