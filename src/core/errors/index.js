/**
 * TPT Asset Editor Desktop - Error Classes and Handler
 * Centralized exports for all error-related functionality
 */

const BaseError = require('./base-error');
const ValidationError = require('./validation-error');
const GenerationError = require('./generation-error');
const DatabaseError = require('./database-error');
const ErrorHandler = require('./error-handler');

module.exports = {
    BaseError,
    ValidationError,
    GenerationError,
    DatabaseError,
    ErrorHandler,

    // Convenience function to create error handler instance
    createErrorHandler: (options = {}) => new ErrorHandler(options),

    // Convenience functions for common error types
    createValidationError: (message, field, value, constraints) =>
        new ValidationError(message, field, value, constraints),

    createGenerationError: (message, generatorType, config, details) =>
        new GenerationError(message, generatorType, config, details),

    createDatabaseError: (message, operation, collection, query, details) =>
        new DatabaseError(message, operation, collection, query, details)
};
