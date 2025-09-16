/**
 * Input validation utilities with TypeScript support
 * Provides type-safe validation functions for various data types
 */

import { ValidationRule, ValidationResult } from '../types/index.js';

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    name: 'required',
    validate: (value: any) => value !== null && value !== undefined && value !== '',
    message,
    severity: 'error'
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    name: 'minLength',
    validate: (value: string) => typeof value === 'string' && value.length >= min,
    message: message || `Must be at least ${min} characters long`,
    severity: 'error'
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    name: 'maxLength',
    validate: (value: string) => typeof value === 'string' && value.length <= max,
    message: message || `Must be no more than ${max} characters long`,
    severity: 'error'
  }),

  email: (message = 'Must be a valid email address'): ValidationRule => ({
    name: 'email',
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return typeof value === 'string' && emailRegex.test(value);
    },
    message,
    severity: 'error'
  }),

  url: (message = 'Must be a valid URL'): ValidationRule => ({
    name: 'url',
    validate: (value: string) => {
      if (typeof value !== 'string') return false;
      try {
        const url = new (require('url').URL)(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    message,
    severity: 'error'
  }),

  number: (message = 'Must be a valid number'): ValidationRule => ({
    name: 'number',
    validate: (value: any) => typeof value === 'number' && !isNaN(value),
    message,
    severity: 'error'
  }),

  integer: (message = 'Must be a valid integer'): ValidationRule => ({
    name: 'integer',
    validate: (value: any) => Number.isInteger(value),
    message,
    severity: 'error'
  }),

  positive: (message = 'Must be a positive number'): ValidationRule => ({
    name: 'positive',
    validate: (value: number) => typeof value === 'number' && value > 0,
    message,
    severity: 'error'
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    name: 'range',
    validate: (value: number) => typeof value === 'number' && value >= min && value <= max,
    message: message || `Must be between ${min} and ${max}`,
    severity: 'error'
  }),

  oneOf: (options: any[], message?: string): ValidationRule => ({
    name: 'oneOf',
    validate: (value: any) => options.includes(value),
    message: message || `Must be one of: ${options.join(', ')}`,
    severity: 'error'
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    name: 'pattern',
    validate: (value: string) => typeof value === 'string' && regex.test(value),
    message,
    severity: 'error'
  }),

  custom: (validator: (value: any) => boolean, message: string, severity: 'error' | 'warning' | 'info' = 'error'): ValidationRule => ({
    name: 'custom',
    validate: validator,
    message,
    severity
  })
};

/**
 * Validate a single value against a validation rule
 */
export function validateValue(value: any, rule: ValidationRule): boolean {
  try {
    return rule.validate(value);
  } catch (error) {
    console.warn(`Validation error for rule ${rule.name}:`, error);
    return false;
  }
}

/**
 * Validate an object against multiple validation rules
 */
export function validateObject(data: Record<string, any>, rules: Record<string, ValidationRule[]>): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    for (const rule of fieldRules) {
      const valid = validateValue(value, rule);

      if (!valid) {
        isValid = false;

        if (rule.severity === 'error') {
          errors.push({
            field,
            rule: rule.name,
            message: rule.message,
            severity: rule.severity
          });
        } else if (rule.severity === 'warning') {
          warnings.push({
            field,
            rule: rule.name,
            message: rule.message
          });
        }
      }
    }
  }

  return {
    isValid,
    errors,
    warnings
  };
}

/**
 * Validate asset configuration
 */
export function validateAssetConfig(config: any): ValidationResult {
  const rules: Record<string, ValidationRule[]> = {
    width: [
      ValidationRules.required('Width is required'),
      ValidationRules.integer('Width must be an integer'),
      ValidationRules.range(1, 4096, 'Width must be between 1 and 4096')
    ],
    height: [
      ValidationRules.required('Height is required'),
      ValidationRules.integer('Height must be an integer'),
      ValidationRules.range(1, 4096, 'Height must be between 1 and 4096')
    ],
    quality: [
      ValidationRules.oneOf(['low', 'medium', 'high', 'ultra'], 'Quality must be low, medium, high, or ultra')
    ],
    format: [
      ValidationRules.oneOf(['png', 'jpeg', 'webp'], 'Format must be png, jpeg, or webp')
    ]
  };

  return validateObject(config, rules);
}

/**
 * Validate generator parameters
 */
export function validateGeneratorParams(generator: string, params: any): ValidationResult {
  const baseRules: Record<string, ValidationRule[]> = {
    seed: [
      ValidationRules.custom(
        (value) => value === undefined || (typeof value === 'number' && value >= 0),
        'Seed must be a non-negative number',
        'warning'
      )
    ],
    variation: [
      ValidationRules.custom(
        (value) => value === undefined || (typeof value === 'number' && value >= 0 && value <= 100),
        'Variation must be between 0 and 100',
        'warning'
      )
    ]
  };

  // Add generator-specific validation rules
  switch (generator) {
    case 'character':
      baseRules.level = [
        ValidationRules.custom(
          (value) => value === undefined || (typeof value === 'number' && value >= 1 && value <= 100),
          'Character level must be between 1 and 100'
        )
      ];
      baseRules.class = [
        ValidationRules.oneOf(
          ['warrior', 'mage', 'rogue', 'paladin', 'ranger', 'druid', 'necromancer', 'summoner', 'archer', 'knight', 'barbarian', 'assassin', 'cleric', 'monk', 'sorcerer'],
          'Invalid character class'
        )
      ];
      break;

    case 'audio':
      baseRules.duration = [
        ValidationRules.number('Duration must be a number'),
        ValidationRules.range(0.1, 300, 'Duration must be between 0.1 and 300 seconds')
      ];
      baseRules.sampleRate = [
        ValidationRules.oneOf([44100, 48000, 96000], 'Sample rate must be 44100, 48000, or 96000')
      ];
      break;

    case 'level':
      baseRules.size = [
        ValidationRules.oneOf(['small', 'medium', 'large', 'huge'], 'Size must be small, medium, large, or huge')
      ];
      baseRules.difficulty = [
        ValidationRules.oneOf(['easy', 'normal', 'hard', 'expert'], 'Difficulty must be easy, normal, hard, or expert')
      ];
      break;
  }

  return validateObject(params, baseRules);
}

/**
 * Sanitize input data
 */
export function sanitizeInput(input: string, options: {
  maxLength?: number;
  allowHtml?: boolean;
  allowNewlines?: boolean;
} = {}): string {
  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  // Handle HTML
  if (!options.allowHtml) {
    sanitized = sanitized.replace(/</g, '<').replace(/>/g, '>');
  }

  // Handle newlines
  if (!options.allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ');
  }

  return sanitized;
}

/**
 * Validate file path for security
 */
export function validateFilePath(filePath: string): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  // Check for directory traversal
  if (filePath.includes('../') || filePath.includes('..\\')) {
    errors.push({
      field: 'filePath',
      rule: 'directoryTraversal',
      message: 'Path contains directory traversal',
      severity: 'error'
    });
  }

  // Check for absolute paths
  if (filePath.startsWith('/') || filePath.match(/^[A-Z]:/)) {
    warnings.push({
      field: 'filePath',
      rule: 'absolutePath',
      message: 'Absolute paths may not be portable'
    });
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(filePath)) {
    errors.push({
      field: 'filePath',
      rule: 'invalidCharacters',
      message: 'Path contains invalid characters',
      severity: 'error'
    });
  }

  // Check file extension
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.wav', '.mp3', '.ogg', '.json'];
  const hasValidExtension = allowedExtensions.some(ext => filePath.toLowerCase().endsWith(ext));

  if (!hasValidExtension) {
    warnings.push({
      field: 'filePath',
      rule: 'fileExtension',
      message: 'File extension may not be supported'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate plugin manifest
 */
export function validatePluginManifest(manifest: any): ValidationResult {
  const rules: Record<string, ValidationRule[]> = {
    name: [
      ValidationRules.required('Plugin name is required'),
      ValidationRules.minLength(3, 'Plugin name must be at least 3 characters'),
      ValidationRules.maxLength(50, 'Plugin name must be no more than 50 characters'),
      ValidationRules.pattern(/^[a-zA-Z0-9_-]+$/, 'Plugin name can only contain letters, numbers, hyphens, and underscores')
    ],
    version: [
      ValidationRules.required('Plugin version is required'),
      ValidationRules.pattern(/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0.0)')
    ],
    main: [
      ValidationRules.required('Main entry point is required'),
      ValidationRules.pattern(/\.(js|ts)$/, 'Main file must be a .js or .ts file')
    ]
  };

  return validateObject(manifest, rules);
}

/**
 * Batch validation utility
 */
export function validateBatch(items: any[], validator: (item: any) => ValidationResult): {
  valid: any[];
  invalid: Array<{ item: any; result: ValidationResult }>;
  summary: { total: number; valid: number; invalid: number; errors: number; warnings: number };
} {
  const valid: any[] = [];
  const invalid: Array<{ item: any; result: ValidationResult }> = [];

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const item of items) {
    const result = validator(item);

    if (result.isValid) {
      valid.push(item);
    } else {
      invalid.push({ item, result });
    }

    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }

  return {
    valid,
    invalid,
    summary: {
      total: items.length,
      valid: valid.length,
      invalid: invalid.length,
      errors: totalErrors,
      warnings: totalWarnings
    }
  };
}

// Export default validation functions for backward compatibility
export default {
  validateValue,
  validateObject,
  validateAssetConfig,
  validateGeneratorParams,
  sanitizeInput,
  validateFilePath,
  validatePluginManifest,
  validateBatch,
  ValidationRules
};
