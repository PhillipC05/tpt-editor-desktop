/**
 * TPT Asset Editor Desktop - Base Error Class
 * Foundation for all application-specific errors
 */

class BaseError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500, details = {}) {
        super(message);

        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.stackTrace = this.stack;
        this.context = {};

        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Add context information to the error
     */
    withContext(context) {
        this.context = { ...this.context, ...context };
        return this;
    }

    /**
     * Add user-friendly message
     */
    withUserMessage(message) {
        this.userMessage = message;
        return this;
    }

    /**
     * Convert error to JSON for logging/serialization
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stackTrace,
            userMessage: this.userMessage
        };
    }

    /**
     * Convert error to string representation
     */
    toString() {
        return `${this.name} [${this.code}]: ${this.message}`;
    }
}

module.exports = BaseError;
