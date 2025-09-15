/**
 * Input Validator and Sanitizer
 * Comprehensive input validation and sanitization for security
 */

const crypto = require('crypto');

class InputValidator {
    constructor(options = {}) {
        this.options = {
            maxStringLength: options.maxStringLength || 10000,
            maxArrayLength: options.maxArrayLength || 1000,
            maxObjectDepth: options.maxObjectDepth || 10,
            maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
            allowedFileTypes: options.allowedFileTypes || [
                'image/png', 'image/jpeg', 'image/gif', 'image/webp',
                'application/json', 'text/plain', 'text/csv'
            ],
            sanitizeHTML: options.sanitizeHTML !== false,
            ...options
        };

        this.validationRules = new Map();
        this.sanitizationRules = new Map();
        this.securityPatterns = new Map();

        this.init();
    }

    /**
     * Initialize the input validator
     */
    init() {
        this.setupValidationRules();
        this.setupSanitizationRules();
        this.setupSecurityPatterns();

        console.log('Input validator initialized');
    }

    /**
     * Setup validation rules
     */
    setupValidationRules() {
        // String validation
        this.addValidationRule('string', (value, options = {}) => {
            if (typeof value !== 'string') {
                return { valid: false, error: 'Must be a string' };
            }

            const length = value.length;
            const { minLength = 0, maxLength = this.options.maxStringLength, pattern } = options;

            if (length < minLength) {
                return { valid: false, error: `Must be at least ${minLength} characters` };
            }

            if (length > maxLength) {
                return { valid: false, error: `Must be at most ${maxLength} characters` };
            }

            if (pattern && !pattern.test(value)) {
                return { valid: false, error: 'Does not match required pattern' };
            }

            return { valid: true };
        });

        // Number validation
        this.addValidationRule('number', (value, options = {}) => {
            if (typeof value !== 'number' || isNaN(value)) {
                return { valid: false, error: 'Must be a valid number' };
            }

            const { min, max, integer = false } = options;

            if (min !== undefined && value < min) {
                return { valid: false, error: `Must be at least ${min}` };
            }

            if (max !== undefined && value > max) {
                return { valid: false, error: `Must be at most ${max}` };
            }

            if (integer && !Number.isInteger(value)) {
                return { valid: false, error: 'Must be an integer' };
            }

            return { valid: true };
        });

        // Email validation
        this.addValidationRule('email', (value) => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                return { valid: false, error: 'Invalid email format' };
            }
            return { valid: true };
        });

        // URL validation
        this.addValidationRule('url', (value) => {
            try {
                const url = new URL(value);
                if (!['http:', 'https:'].includes(url.protocol)) {
                    return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
                }
                return { valid: true };
            } catch {
                return { valid: false, error: 'Invalid URL format' };
            }
        });

        // Array validation
        this.addValidationRule('array', (value, options = {}) => {
            if (!Array.isArray(value)) {
                return { valid: false, error: 'Must be an array' };
            }

            const { minLength = 0, maxLength = this.options.maxArrayLength, itemType } = options;

            if (value.length < minLength) {
                return { valid: false, error: `Must have at least ${minLength} items` };
            }

            if (value.length > maxLength) {
                return { valid: false, error: `Must have at most ${maxLength} items` };
            }

            if (itemType) {
                for (let i = 0; i < value.length; i++) {
                    const itemValidation = this.validate(value[i], itemType);
                    if (!itemValidation.valid) {
                        return { valid: false, error: `Item ${i}: ${itemValidation.error}` };
                    }
                }
            }

            return { valid: true };
        });

        // Object validation
        this.addValidationRule('object', (value, options = {}) => {
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                return { valid: false, error: 'Must be an object' };
            }

            const { schema, maxDepth = this.options.maxObjectDepth } = options;

            // Check object depth
            const depth = this.getObjectDepth(value);
            if (depth > maxDepth) {
                return { valid: false, error: `Object depth exceeds maximum of ${maxDepth}` };
            }

            // Validate against schema if provided
            if (schema) {
                for (const [key, rule] of Object.entries(schema)) {
                    if (value.hasOwnProperty(key)) {
                        const fieldValidation = this.validate(value[key], rule);
                        if (!fieldValidation.valid) {
                            return { valid: false, error: `Field '${key}': ${fieldValidation.error}` };
                        }
                    } else if (rule.required) {
                        return { valid: false, error: `Required field '${key}' is missing` };
                    }
                }
            }

            return { valid: true };
        });

        // File validation
        this.addValidationRule('file', (value, options = {}) => {
            if (!value || typeof value !== 'object') {
                return { valid: false, error: 'Invalid file object' };
            }

            const { maxSize = this.options.maxFileSize, allowedTypes = this.options.allowedFileTypes } = options;

            if (value.size > maxSize) {
                return { valid: false, error: `File size exceeds maximum of ${maxSize} bytes` };
            }

            if (allowedTypes && !allowedTypes.includes(value.type)) {
                return { valid: false, error: `File type '${value.type}' is not allowed` };
            }

            return { valid: true };
        });
    }

    /**
     * Setup sanitization rules
     */
    setupSanitizationRules() {
        // HTML sanitization
        this.addSanitizationRule('html', (value) => {
            if (!this.options.sanitizeHTML) return value;

            // Remove script tags and event handlers
            let sanitized = value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]*\bon\w+\s*=[^>]*>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/vbscript:/gi, '')
                .replace(/data:(?!image\/)/gi, '');

        // Remove dangerous attributes
        sanitized = sanitized.replace(/<[^>]*\s+(?:on\w+|style|href)\s*=\s*["'][^"']*["'][^>]*>/gi, (match) => {
            return match.replace(/\s+(?:on\w+|style|href)\s*=\s*["'][^"']*["']/gi, '');
        });

            return sanitized;
        });

        // SQL injection prevention
        this.addSanitizationRule('sql', (value) => {
            // Remove or escape SQL injection patterns
            return value
                .replace(/'/g, "''")  // Escape single quotes
                .replace(/;/g, '')     // Remove semicolons
                .replace(/--/g, '')    // Remove SQL comments
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                .replace(/\b(union|select|insert|update|delete|drop|create|alter)\b/gi, ''); // Remove SQL keywords
        });

        // Path traversal prevention
        this.addSanitizationRule('path', (value) => {
            // Remove path traversal attempts
            return value
                .replace(/\.\./g, '')  // Remove ..
                .replace(/~/g, '')     // Remove ~
                .replace(/^\//, '')    // Remove leading /
                .replace(/^[a-zA-Z]:/, '') // Remove Windows drive letters
                .replace(/[<>:|?*]/g, ''); // Remove invalid filename characters
        });

        // General string sanitization
        this.addSanitizationRule('string', (value) => {
            return value
                .trim()
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
                .substring(0, this.options.maxStringLength); // Limit length
        });
    }

    /**
     * Setup security patterns
     */
    setupSecurityPatterns() {
        // XSS patterns
        this.securityPatterns.set('xss', [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
        ]);

        // SQL injection patterns
        this.securityPatterns.set('sql-injection', [
            /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(select|from|where|into)\b)/gi,
            /('|(\\x27)|(\\x2D\\x2D)|(\\/\\*))/gi,
            /(\\x3B|\\x2D\\x2D|\\x23|\\x2F\\x2A)/gi
        ]);

        // Path traversal patterns
        this.securityPatterns.set('path-traversal', [
            /\.\.[\/\\]/g,
            /~\/+/g,
            /^[a-zA-Z]:[\/\\]/g,
            /\/etc\/passwd/gi,
            /\/etc\/shadow/gi,
            /\/proc\/self\/environ/gi
        ]);

        // Command injection patterns
        this.securityPatterns.set('command-injection', [
            /[;&|`$()]/g,
            /\b(rm|del|format|shutdown|reboot)\b/gi,
            /\\x[0-9a-fA-F]{2}/g
        ]);
    }

    /**
     * Add validation rule
     */
    addValidationRule(name, rule) {
        this.validationRules.set(name, rule);
    }

    /**
     * Add sanitization rule
     */
    addSanitizationRule(name, rule) {
        this.sanitizationRules.set(name, rule);
    }

    /**
     * Validate input
     */
    validate(value, type, options = {}) {
        const rule = this.validationRules.get(type);
        if (!rule) {
            return { valid: false, error: `Unknown validation type: ${type}` };
        }

        return rule(value, options);
    }

    /**
     * Sanitize input
     */
    sanitize(value, type) {
        if (typeof value !== 'string') {
            return value;
        }

        const rule = this.sanitizationRules.get(type);
        if (rule) {
            return rule(value);
        }

        // Apply general string sanitization
        return this.sanitizationRules.get('string')(value);
    }

    /**
     * Validate and sanitize input
     */
    validateAndSanitize(value, type, validationOptions = {}, sanitizationType = type) {
        // First validate
        const validation = this.validate(value, type, validationOptions);
        if (!validation.valid) {
            return validation;
        }

        // Then sanitize
        const sanitized = this.sanitize(value, sanitizationType);

        return {
            valid: true,
            sanitized,
            original: value
        };
    }

    /**
     * Check for security threats
     */
    checkSecurityThreats(value, threatTypes = ['xss', 'sql-injection', 'path-traversal', 'command-injection']) {
        if (typeof value !== 'string') {
            return { safe: true, threats: [] };
        }

        const threats = [];

        for (const threatType of threatTypes) {
            const patterns = this.securityPatterns.get(threatType) || [];
            for (const pattern of patterns) {
                const matches = value.match(pattern);
                if (matches) {
                    threats.push({
                        type: threatType,
                        pattern: pattern.source,
                        matches: matches.length,
                        sample: matches[0].substring(0, 50)
                    });
                }
            }
        }

        return {
            safe: threats.length === 0,
            threats
        };
    }

    /**
     * Validate file upload
     */
    validateFileUpload(file, options = {}) {
        const validation = this.validate(file, 'file', options);
        if (!validation.valid) {
            return validation;
        }

        // Additional file security checks
        const securityCheck = this.checkFileSecurity(file);
        if (!securityCheck.safe) {
            return {
                valid: false,
                error: `File security check failed: ${securityCheck.threats.map(t => t.type).join(', ')}`
            };
        }

        return { valid: true };
    }

    /**
     * Check file security
     */
    checkFileSecurity(file) {
        // Check file extension vs MIME type consistency
        const extension = this.getFileExtension(file.name);
        const expectedMimeType = this.getMimeTypeFromExtension(extension);

        if (expectedMimeType && file.type !== expectedMimeType) {
            return {
                safe: false,
                threats: [{
                    type: 'file-type-mismatch',
                    description: `File extension suggests ${expectedMimeType} but MIME type is ${file.type}`
                }]
            };
        }

        // Check for dangerous file types
        const dangerousTypes = [
            'application/x-msdownload', // .exe
            'application/x-msdos-program', // .com
            'application/x-msmetafile', // .wmf
            'application/x-shockwave-flash' // .swf
        ];

        if (dangerousTypes.includes(file.type)) {
            return {
                safe: false,
                threats: [{
                    type: 'dangerous-file-type',
                    description: `File type ${file.type} is not allowed`
                }]
            };
        }

        return { safe: true, threats: [] };
    }

    /**
     * Validate form data
     */
    validateFormData(formData, schema) {
        const errors = [];
        const sanitized = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = formData[field];

            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({ field, error: 'This field is required' });
                continue;
            }

            if (value !== undefined && value !== null && value !== '') {
                const validation = this.validateAndSanitize(
                    value,
                    rules.type,
                    rules.validation || {},
                    rules.sanitization || rules.type
                );

                if (!validation.valid) {
                    errors.push({ field, error: validation.error });
                } else {
                    sanitized[field] = validation.sanitized;
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            sanitized
        };
    }

    /**
     * Validate API request
     */
    validateAPIRequest(req, schema) {
        const { body, query, params } = req;

        // Validate request body
        if (schema.body) {
            const bodyValidation = this.validateFormData(body, schema.body);
            if (!bodyValidation.valid) {
                return {
                    valid: false,
                    errors: bodyValidation.errors,
                    type: 'body'
                };
            }
        }

        // Validate query parameters
        if (schema.query) {
            const queryValidation = this.validateFormData(query, schema.query);
            if (!queryValidation.valid) {
                return {
                    valid: false,
                    errors: queryValidation.errors,
                    type: 'query'
                };
            }
        }

        // Validate URL parameters
        if (schema.params) {
            const paramsValidation = this.validateFormData(params, schema.params);
            if (!paramsValidation.valid) {
                return {
                    valid: false,
                    errors: paramsValidation.errors,
                    type: 'params'
                };
            }
        }

        return { valid: true };
    }

    /**
     * Get object depth
     */
    getObjectDepth(obj, currentDepth = 0) {
        if (currentDepth > this.options.maxObjectDepth) {
            return currentDepth;
        }

        if (typeof obj !== 'object' || obj === null) {
            return currentDepth;
        }

        let maxDepth = currentDepth;

        for (const value of Object.values(obj)) {
            if (typeof value === 'object' && value !== null) {
                const depth = this.getObjectDepth(value, currentDepth + 1);
                maxDepth = Math.max(maxDepth, depth);
            }
        }

        return maxDepth;
    }

    /**
     * Get file extension
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    /**
     * Get MIME type from extension
     */
    getMimeTypeFromExtension(extension) {
        const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'json': 'application/json',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'pdf': 'application/pdf'
        };

        return mimeTypes[extension];
    }

    /**
     * Generate CSRF token
     */
    generateCSRFToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Validate CSRF token
     */
    validateCSRFToken(token, sessionToken) {
        if (!token || !sessionToken) {
            return false;
        }

        // Use constant-time comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(token, 'hex'),
            Buffer.from(sessionToken, 'hex')
        );
    }

    /**
     * Rate limiting check (basic implementation)
     */
    checkRateLimit(identifier, maxRequests = 100, windowMs = 15 * 60 * 1000) {
        // This would typically use Redis or similar for production
        // For now, we'll use a simple in-memory implementation
        const now = Date.now();
        const windowStart = now - windowMs;

        // This is a placeholder - in production, you'd check against a store
        return { allowed: true, remaining: maxRequests - 1 };
    }

    /**
     * Create validation schema
     */
    createSchema(schemaDefinition) {
        return {
            validate: (data) => this.validateFormData(data, schemaDefinition),
            sanitize: (data) => {
                const result = this.validateFormData(data, schemaDefinition);
                return result.valid ? result.sanitized : null;
            }
        };
    }

    /**
     * Get validation statistics
     */
    getStatistics() {
        return {
            rulesCount: this.validationRules.size,
            sanitizationRulesCount: this.sanitizationRules.size,
            securityPatternsCount: this.securityPatterns.size,
            options: this.options
        };
    }

    /**
     * Clear caches and reset
     */
    clear() {
        // Clear any cached data if implemented
        console.log('Input validator cleared');
    }

    /**
     * Destroy the validator
     */
    destroy() {
        this.clear();
        this.validationRules.clear();
        this.sanitizationRules.clear();
        this.securityPatterns.clear();

        console.log('Input validator destroyed');
    }
}

module.exports = InputValidator;
