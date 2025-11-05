/**
 * Tests for ValidationError class
 */

const { describe, it, expect } = require('@jest/globals');
const ValidationError = require('../validation-error');
const BaseError = require('../base-error');

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should create validation error with all parameters', () => {
      const constraints = { min: 0, max: 100 };
      const error = new ValidationError('Invalid value', 'age', 150, constraints);

      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid value');
      expect(error.field).toBe('age');
      expect(error.value).toBe(150);
      expect(error.constraints).toEqual(constraints);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should create validation error with minimal parameters', () => {
      const error = new ValidationError('Validation failed');

      expect(error.message).toBe('Validation failed');
      expect(error.field).toBeNull();
      expect(error.value).toBeNull();
      expect(error.constraints).toEqual({});
    });

    it('should include field, value, and constraints in details', () => {
      const error = new ValidationError('Invalid', 'name', 'test', { required: true });

      expect(error.details).toEqual({
        field: 'name',
        value: 'test',
        constraints: { required: true },
      });
    });
  });

  describe('static required()', () => {
    it('should create required field error', () => {
      const error = ValidationError.required('email');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("field 'email' is required");
      expect(error.field).toBe('email');
      expect(error.value).toBeNull();
      expect(error.constraints).toEqual({ required: true });
      expect(error.userMessage).toBe('Please provide a value for email');
    });

    it('should support custom type parameter', () => {
      const error = ValidationError.required('username', 'parameter');

      expect(error.message).toBe("parameter 'username' is required");
      expect(error.userMessage).toBe('Please provide a value for username');
    });

    it('should have correct error code and status', () => {
      const error = ValidationError.required('field');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('static invalidType()', () => {
    it('should create invalid type error for string', () => {
      const error = ValidationError.invalidType('count', 'number', 'abc');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Field 'count' must be of type number");
      expect(error.field).toBe('count');
      expect(error.value).toBe('abc');
      expect(error.constraints).toEqual({
        expectedType: 'number',
        actualType: 'string',
      });
      expect(error.userMessage).toBe('Please provide a valid number for count');
    });

    it('should handle object types', () => {
      const error = ValidationError.invalidType('config', 'object', null);

      expect(error.constraints).toEqual({
        expectedType: 'object',
        actualType: 'object', // typeof null is 'object'
      });
    });

    it('should handle undefined values', () => {
      const error = ValidationError.invalidType('value', 'string', undefined);

      // When undefined is passed to a function with default parameter value=null,
      // JavaScript treats undefined as "not provided" and uses the default (null)
      expect(error.value).toBeNull();
      expect(error.details.value).toBeNull();
      expect(error.constraints.actualType).toBe('undefined');
    });
  });

  describe('static invalidValue()', () => {
    it('should create invalid value error', () => {
      const error = ValidationError.invalidValue('status', 'pending', 'must be active or inactive');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Invalid value for field 'status': must be active or inactive");
      expect(error.field).toBe('status');
      expect(error.value).toBe('pending');
      expect(error.constraints).toEqual({ reason: 'must be active or inactive' });
      expect(error.userMessage).toBe('Please provide a valid value for status');
    });

    it('should handle complex values', () => {
      const complexValue = { nested: { data: 123 } };
      const error = ValidationError.invalidValue('config', complexValue, 'invalid structure');

      expect(error.value).toEqual(complexValue);
      expect(error.constraints.reason).toBe('invalid structure');
    });
  });

  describe('static outOfRange()', () => {
    it('should create out of range error', () => {
      const error = ValidationError.outOfRange('age', 150, 0, 120);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Field 'age' must be between 0 and 120");
      expect(error.field).toBe('age');
      expect(error.value).toBe(150);
      expect(error.constraints).toEqual({
        min: 0,
        max: 120,
        actual: 150,
      });
      expect(error.userMessage).toBe('Please provide a value between 0 and 120 for age');
    });

    it('should handle negative ranges', () => {
      const error = ValidationError.outOfRange('temperature', -100, -50, 50);

      expect(error.constraints).toEqual({
        min: -50,
        max: 50,
        actual: -100,
      });
    });

    it('should handle float ranges', () => {
      const error = ValidationError.outOfRange('percentage', 1.5, 0.0, 1.0);

      expect(error.constraints.min).toBe(0.0);
      expect(error.constraints.max).toBe(1.0);
      expect(error.constraints.actual).toBe(1.5);
    });
  });

  describe('static invalidFormat()', () => {
    it('should create invalid format error', () => {
      const error = ValidationError.invalidFormat('email', 'notanemail', 'user@domain.com');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Field 'email' has invalid format. Expected: user@domain.com");
      expect(error.field).toBe('email');
      expect(error.value).toBe('notanemail');
      expect(error.constraints).toEqual({ expectedFormat: 'user@domain.com' });
      expect(error.userMessage).toBe('Please provide email in the correct format');
    });

    it('should handle regex format descriptions', () => {
      const error = ValidationError.invalidFormat('phone', '1234', '/\\d{3}-\\d{3}-\\d{4}/');

      expect(error.constraints.expectedFormat).toBe('/\\d{3}-\\d{3}-\\d{4}/');
    });
  });

  describe('static duplicate()', () => {
    it('should create duplicate value error', () => {
      const error = ValidationError.duplicate('username', 'john_doe');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Field 'username' must be unique. Value 'john_doe' already exists");
      expect(error.field).toBe('username');
      expect(error.value).toBe('john_doe');
      expect(error.constraints).toEqual({ duplicate: true });
      expect(error.userMessage).toBe('Please choose a different value for username');
    });

    it('should handle numeric duplicate values', () => {
      const error = ValidationError.duplicate('id', 12345);

      expect(error.value).toBe(12345);
      expect(error.message).toContain('12345');
    });
  });

  describe('method chaining', () => {
    it('should support withContext chaining', () => {
      const error = ValidationError.required('email')
        .withContext({ userId: 123 });

      expect(error.field).toBe('email');
      expect(error.context.userId).toBe(123);
    });

    it('should allow overriding userMessage', () => {
      const error = ValidationError.required('email')
        .withUserMessage('Custom user message');

      expect(error.userMessage).toBe('Custom user message');
    });

    it('should support full chaining', () => {
      const error = ValidationError.invalidValue('status', 'invalid', 'wrong format')
        .withContext({ operation: 'update', userId: 123 })
        .withUserMessage('Please select a valid status');

      expect(error.field).toBe('status');
      expect(error.context.operation).toBe('update');
      expect(error.context.userId).toBe(123);
      expect(error.userMessage).toBe('Please select a valid status');
    });
  });

  describe('inheritance and serialization', () => {
    it('should serialize to JSON correctly', () => {
      const error = ValidationError.outOfRange('age', 150, 0, 120);
      const json = error.toJSON();

      expect(json.name).toBe('ValidationError');
      expect(json.code).toBe('VALIDATION_ERROR');
      expect(json.statusCode).toBe(400);
      expect(json.details.field).toBe('age');
      expect(json.details.value).toBe(150);
      expect(json.details.constraints).toEqual({
        min: 0,
        max: 120,
        actual: 150,
      });
    });

    it('should have correct string representation', () => {
      const error = ValidationError.required('email');
      const str = error.toString();

      expect(str).toBe("ValidationError [VALIDATION_ERROR]: field 'email' is required");
    });

    it('should be catchable as BaseError', () => {
      try {
        throw ValidationError.required('field');
      } catch (error) {
        expect(error instanceof BaseError).toBe(true);
        expect(error instanceof ValidationError).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle null field names', () => {
      const error = new ValidationError('Error', null, 'value', {});

      expect(error.field).toBeNull();
      expect(error.value).toBe('value');
    });

    it('should handle empty string fields', () => {
      const error = ValidationError.required('');

      expect(error.field).toBe('');
      expect(error.message).toBe("field '' is required");
    });

    it('should handle special characters in field names', () => {
      const error = ValidationError.required('user.email.address');

      expect(error.field).toBe('user.email.address');
      expect(error.message).toContain('user.email.address');
    });

    it('should handle very large constraint objects', () => {
      const largeConstraints = {
        rule1: 'value1',
        rule2: 'value2',
        rule3: Array(100).fill('data'),
      };

      const error = new ValidationError('Error', 'field', 'value', largeConstraints);

      expect(error.constraints).toEqual(largeConstraints);
    });
  });
});
