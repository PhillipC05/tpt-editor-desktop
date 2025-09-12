/**
 * TPT Asset Editor Desktop - Validation Utilities
 * Input validation and data sanitization helpers
 */

class ValidationUtils {
    /**
     * Validate string input
     * @param {string} value - Value to validate
     * @param {Object} [options={}] - Validation options
     * @param {number} [options.minLength=0] - Minimum length
     * @param {number} [options.maxLength] - Maximum length
     * @param {RegExp} [options.pattern] - Pattern to match
     * @param {boolean} [options.required=false] - Whether value is required
     * @param {string[]} [options.allowedValues] - Array of allowed values
     * @returns {Object} Validation result with isValid and error message
     */
    static validateString(value, options = {}) {
        // Check if required
        if (options.required && (!value || value.trim() === '')) {
            return { isValid: false, error: 'This field is required' };
        }

        // If not required and empty, consider valid
        if (!value || value.trim() === '') {
            return { isValid: true };
        }

        const trimmed = value.trim();

        // Check minimum length
        if (options.minLength && trimmed.length < options.minLength) {
            return { isValid: false, error: `Minimum length is ${options.minLength} characters` };
        }

        // Check maximum length
        if (options.maxLength && trimmed.length > options.maxLength) {
            return { isValid: false, error: `Maximum length is ${options.maxLength} characters` };
        }

        // Check pattern
        if (options.pattern && !options.pattern.test(trimmed)) {
            return { isValid: false, error: 'Invalid format' };
        }

        // Check allowed values
        if (options.allowedValues && !options.allowedValues.includes(trimmed)) {
            return { isValid: false, error: `Value must be one of: ${options.allowedValues.join(', ')}` };
        }

        return { isValid: true };
    }

    /**
     * Validate number input
     * @param {number|string} value - Value to validate
     * @param {Object} [options={}] - Validation options
     * @param {number} [options.min] - Minimum value
     * @param {number} [options.max] - Maximum value
     * @param {boolean} [options.integer=false] - Whether value must be integer
     * @param {boolean} [options.required=false] - Whether value is required
     * @returns {Object} Validation result
     */
    static validateNumber(value, options = {}) {
        // Check if required
        if (options.required && (value === null || value === undefined || value === '')) {
            return { isValid: false, error: 'This field is required' };
        }

        // If not required and empty, consider valid
        if (value === null || value === undefined || value === '') {
            return { isValid: true };
        }

        const num = Number(value);

        // Check if valid number
        if (isNaN(num)) {
            return { isValid: false, error: 'Must be a valid number' };
        }

        // Check if integer
        if (options.integer && !Number.isInteger(num)) {
            return { isValid: false, error: 'Must be a whole number' };
        }

        // Check minimum value
        if (options.min !== undefined && num < options.min) {
            return { isValid: false, error: `Minimum value is ${options.min}` };
        }

        // Check maximum value
        if (options.max !== undefined && num > options.max) {
            return { isValid: false, error: `Maximum value is ${options.max}` };
        }

        return { isValid: true, value: num };
    }

    /**
     * Validate boolean input
     * @param {boolean|any} value - Value to validate
     * @param {Object} [options={}] - Validation options
     * @param {boolean} [options.required=false] - Whether value is required
     * @returns {Object} Validation result
     */
    static validateBoolean(value, options = {}) {
        // Check if required
        if (options.required && (value === null || value === undefined)) {
            return { isValid: false, error: 'This field is required' };
        }

        // If not required and null/undefined, consider valid
        if (value === null || value === undefined) {
            return { isValid: true };
        }

        // Check if valid boolean
        if (typeof value !== 'boolean') {
            return { isValid: false, error: 'Must be true or false' };
        }

        return { isValid: true, value };
    }

    /**
     * Validate array input
     * @param {Array} value - Array to validate
     * @param {Object} [options={}] - Validation options
     * @param {number} [options.minLength=0] - Minimum array length
     * @param {number} [options.maxLength] - Maximum array length
     * @param {boolean} [options.required=false] - Whether array is required
     * @param {Function} [options.itemValidator] - Function to validate each item
     * @returns {Object} Validation result
     */
    static validateArray(value, options = {}) {
        // Check if required
        if (options.required && (!value || !Array.isArray(value))) {
            return { isValid: false, error: 'This field is required' };
        }

        // If not required and null/undefined, consider valid
        if (value === null || value === undefined) {
            return { isValid: true };
        }

        // Check if array
        if (!Array.isArray(value)) {
            return { isValid: false, error: 'Must be an array' };
        }

        // Check minimum length
        if (options.minLength && value.length < options.minLength) {
            return { isValid: false, error: `Minimum ${options.minLength} items required` };
        }

        // Check maximum length
        if (options.maxLength && value.length > options.maxLength) {
            return { isValid: false, error: `Maximum ${options.maxLength} items allowed` };
        }

        // Validate each item if validator provided
        if (options.itemValidator) {
            for (let i = 0; i < value.length; i++) {
                const itemResult = options.itemValidator(value[i]);
                if (!itemResult.isValid) {
                    return { isValid: false, error: `Item ${i + 1}: ${itemResult.error}` };
                }
            }
        }

        return { isValid: true, value };
    }

    /**
     * Validate object input
     * @param {Object} value - Object to validate
     * @param {Object} [options={}] - Validation options
     * @param {boolean} [options.required=false] - Whether object is required
     * @param {Object} [options.schema] - Schema for object validation
     * @returns {Object} Validation result
     */
    static validateObject(value, options = {}) {
        // Check if required
        if (options.required && (!value || typeof value !== 'object')) {
            return { isValid: false, error: 'This field is required' };
        }

        // If not required and null/undefined, consider valid
        if (value === null || value === undefined) {
            return { isValid: true };
        }

        // Check if object
        if (typeof value !== 'object' || Array.isArray(value)) {
            return { isValid: false, error: 'Must be an object' };
        }

        // Validate against schema if provided
        if (options.schema) {
            for (const [key, validator] of Object.entries(options.schema)) {
                if (validator.required && !(key in value)) {
                    return { isValid: false, error: `Missing required field: ${key}` };
                }

                if (key in value) {
                    const fieldResult = validator.validate(value[key]);
                    if (!fieldResult.isValid) {
                        return { isValid: false, error: `${key}: ${fieldResult.error}` };
                    }
                }
            }
        }

        return { isValid: true, value };
    }

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @param {Object} [options={}] - Validation options
     * @param {boolean} [options.required=false] - Whether email is required
     * @returns {Object} Validation result
     */
    static validateEmail(email, options = {}) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return this.validateString(email, {
            ...options,
            pattern: emailPattern,
            patternError: 'Invalid email format'
        });
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @param {Object} [options={}] - Validation options
     * @param {boolean} [options.required=false] - Whether URL is required
     * @param {string[]} [options.allowedProtocols=['http','https']] - Allowed protocols
     * @returns {Object} Validation result
     */
    static validateUrl(url, options = {}) {
        const allowedProtocols = options.allowedProtocols || ['http', 'https'];
        const protocolPattern = new RegExp(`^(${allowedProtocols.join('|')}):`, 'i');
        const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

        return this.validateString(url, {
            ...options,
            pattern: urlPattern,
            customValidator: (value) => {
                if (!protocolPattern.test(value)) {
                    return { isValid: false, error: `URL must start with: ${allowedProtocols.join(', ')}` };
                }
                return { isValid: true };
            }
        });
    }

    /**
     * Validate file path
     * @param {string} filePath - File path to validate
     * @param {Object} [options={}] - Validation options
     * @param {boolean} [options.required=false] - Whether path is required
     * @param {string[]} [options.allowedExtensions] - Allowed file extensions
     * @param {boolean} [options.checkExists=false] - Whether to check if file exists
     * @returns {Object} Validation result
     */
    static validateFilePath(filePath, options = {}) {
        const result = this.validateString(filePath, {
            ...options,
            minLength: 1
        });

        if (!result.isValid) return result;

        // Check for dangerous characters
        const dangerousChars = /[<>:"|?*\x00-\x1f]/;
        if (dangerousChars.test(filePath)) {
            return { isValid: false, error: 'File path contains invalid characters' };
        }

        // Check for directory traversal
        if (filePath.includes('..') || filePath.includes('../')) {
            return { isValid: false, error: 'File path contains directory traversal' };
        }

        // Check file extension
        if (options.allowedExtensions) {
            const ext = filePath.split('.').pop()?.toLowerCase();
            if (!ext || !options.allowedExtensions.includes(ext)) {
                return { isValid: false, error: `File must have one of these extensions: ${options.allowedExtensions.join(', ')}` };
            }
        }

        // Check if file exists (async operation)
        if (options.checkExists) {
            // This would need to be handled differently for async validation
            return { isValid: true, needsAsyncCheck: true };
        }

        return { isValid: true };
    }

    /**
     * Validate color value
     * @param {string} color - Color value to validate
     * @param {Object} [options={}] - Validation options
     * @param {boolean} [options.required=false] - Whether color is required
     * @param {string[]} [options.allowedFormats=['hex','rgb','rgba','hsl','hsla']] - Allowed color formats
     * @returns {Object} Validation result
     */
    static validateColor(color, options = {}) {
        const allowedFormats = options.allowedFormats || ['hex', 'rgb', 'rgba', 'hsl', 'hsla'];

        const patterns = {
            hex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            rgb: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            rgba: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0|1|0?\.\d+)\)$/,
            hsl: /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
            hsla: /^hsla\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%,\s*(0|1|0?\.\d+)\)$/
        };

        const result = this.validateString(color, options);
        if (!result.isValid) return result;

        const isValidFormat = allowedFormats.some(format => {
            const pattern = patterns[format];
            return pattern && pattern.test(color);
        });

        if (!isValidFormat) {
            return { isValid: false, error: `Invalid color format. Allowed: ${allowedFormats.join(', ')}` };
        }

        return { isValid: true };
    }

    /**
     * Validate date string
     * @param {string} dateString - Date string to validate
     * @param {Object} [options={}] - Validation options
     * @param {boolean} [options.required=false] - Whether date is required
     * @param {string} [options.format='ISO'] - Date format ('ISO', 'US', 'EU')
     * @param {Date} [options.minDate] - Minimum allowed date
     * @param {Date} [options.maxDate] - Maximum allowed date
     * @returns {Object} Validation result
     */
    static validateDate(dateString, options = {}) {
        const result = this.validateString(dateString, options);
        if (!result.isValid) return result;

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return { isValid: false, error: 'Invalid date format' };
        }

        // Check date range
        if (options.minDate && date < options.minDate) {
            return { isValid: false, error: `Date must be after ${options.minDate.toISOString().split('T')[0]}` };
        }

        if (options.maxDate && date > options.maxDate) {
            return { isValid: false, error: `Date must be before ${options.maxDate.toISOString().split('T')[0]}` };
        }

        return { isValid: true, value: date };
    }

    /**
     * Validate UUID
     * @param {string} uuid - UUID string to validate
     * @param {Object} [options={}] - Validation options
     * @param {boolean} [options.required=false] - Whether UUID is required
     * @param {number} [options.version=4] - UUID version to validate
     * @returns {Object} Validation result
     */
    static validateUUID(uuid, options = {}) {
        const version = options.version || 4;
        const uuidPattern = new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-${version}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, 'i');

        return this.validateString(uuid, {
            ...options,
            pattern: uuidPattern,
            patternError: `Invalid UUID v${version} format`
        });
    }

    /**
     * Sanitize string input
     * @param {string} value - String to sanitize
     * @param {Object} [options={}] - Sanitization options
     * @param {boolean} [options.trim=true] - Whether to trim whitespace
     * @param {boolean} [options.lowercase=false] - Whether to convert to lowercase
     * @param {boolean} [options.uppercase=false] - Whether to convert to uppercase
     * @param {number} [options.maxLength] - Maximum length to truncate to
     * @returns {string} Sanitized string
     */
    static sanitizeString(value, options = {}) {
        if (!value) return value;

        let sanitized = value;

        if (options.trim) {
            sanitized = sanitized.trim();
        }

        if (options.lowercase) {
            sanitized = sanitized.toLowerCase();
        } else if (options.uppercase) {
            sanitized = sanitized.toUpperCase();
        }

        if (options.maxLength && sanitized.length > options.maxLength) {
            sanitized = sanitized.substring(0, options.maxLength);
        }

        return sanitized;
    }

    /**
     * Validate and sanitize input data
     * @param {Object} data - Data object to validate and sanitize
     * @param {Object} schema - Validation schema
     * @returns {Object} Validation result with sanitized data
     */
    static validateAndSanitize(data, schema) {
        const result = { isValid: true, errors: {}, sanitizedData: {} };

        for (const [field, config] of Object.entries(schema)) {
            const value = data[field];

            // Run validation
            const validationResult = config.validator(value, config.options || {});
            if (!validationResult.isValid) {
                result.isValid = false;
                result.errors[field] = validationResult.error;
                continue;
            }

            // Apply sanitization if provided
            if (config.sanitizer) {
                result.sanitizedData[field] = config.sanitizer(validationResult.value || value);
            } else {
                result.sanitizedData[field] = validationResult.value || value;
            }
        }

        return result;
    }

    /**
     * Create validation schema for common use cases
     */
    static createSchema() {
        return {
            string: (options) => ({ validator: this.validateString, options }),
            number: (options) => ({ validator: this.validateNumber, options }),
            boolean: (options) => ({ validator: this.validateBoolean, options }),
            array: (options) => ({ validator: this.validateArray, options }),
            object: (options) => ({ validator: this.validateObject, options }),
            email: (options) => ({ validator: this.validateEmail, options }),
            url: (options) => ({ validator: this.validateUrl, options }),
            filePath: (options) => ({ validator: this.validateFilePath, options }),
            color: (options) => ({ validator: this.validateColor, options }),
            date: (options) => ({ validator: this.validateDate, options }),
            uuid: (options) => ({ validator: this.validateUUID, options })
        };
    }
}

module.exports = ValidationUtils;
