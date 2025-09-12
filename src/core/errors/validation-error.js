/**
 * TPT Asset Editor Desktop - Validation Error
 * Errors related to input validation and data integrity
 */

const BaseError = require('./base-error');

class ValidationError extends BaseError {
    constructor(message, field = null, value = null, constraints = {}) {
        super(message, 'VALIDATION_ERROR', 400, {
            field,
            value,
            constraints
        });

        this.field = field;
        this.value = value;
        this.constraints = constraints;
    }

    /**
     * Create validation error for required field
     */
    static required(field, type = 'field') {
        return new ValidationError(
            `${type} '${field}' is required`,
            field,
            null,
            { required: true }
        ).withUserMessage(`Please provide a value for ${field}`);
    }

    /**
     * Create validation error for invalid type
     */
    static invalidType(field, expectedType, actualValue) {
        return new ValidationError(
            `Field '${field}' must be of type ${expectedType}`,
            field,
            actualValue,
            { expectedType, actualType: typeof actualValue }
        ).withUserMessage(`Please provide a valid ${expectedType} for ${field}`);
    }

    /**
     * Create validation error for invalid value
     */
    static invalidValue(field, value, reason) {
        return new ValidationError(
            `Invalid value for field '${field}': ${reason}`,
            field,
            value,
            { reason }
        ).withUserMessage(`Please provide a valid value for ${field}`);
    }

    /**
     * Create validation error for out of range
     */
    static outOfRange(field, value, min, max) {
        return new ValidationError(
            `Field '${field}' must be between ${min} and ${max}`,
            field,
            value,
            { min, max, actual: value }
        ).withUserMessage(`Please provide a value between ${min} and ${max} for ${field}`);
    }

    /**
     * Create validation error for invalid format
     */
    static invalidFormat(field, value, expectedFormat) {
        return new ValidationError(
            `Field '${field}' has invalid format. Expected: ${expectedFormat}`,
            field,
            value,
            { expectedFormat }
        ).withUserMessage(`Please provide ${field} in the correct format`);
    }

    /**
     * Create validation error for duplicate value
     */
    static duplicate(field, value) {
        return new ValidationError(
            `Field '${field}' must be unique. Value '${value}' already exists`,
            field,
            value,
            { duplicate: true }
        ).withUserMessage(`Please choose a different value for ${field}`);
    }
}

module.exports = ValidationError;
