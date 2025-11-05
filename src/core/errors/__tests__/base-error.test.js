/**
 * Tests for BaseError class
 */

const { describe, it, expect, beforeEach } = require('@jest/globals');
const BaseError = require('../base-error');

describe('BaseError', () => {
  describe('constructor', () => {
    it('should create error with default values', () => {
      const error = new BaseError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('BaseError');
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({});
    });

    it('should create error with custom values', () => {
      const details = { field: 'test', value: 123 };
      const error = new BaseError('Custom error', 'CUSTOM_CODE', 400, details);

      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });

    it('should have a timestamp', () => {
      const before = new Date().toISOString();
      const error = new BaseError('Test error');
      const after = new Date().toISOString();

      expect(error.timestamp).toBeDefined();
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(error.timestamp >= before).toBe(true);
      expect(error.timestamp <= after).toBe(true);
    });

    it('should have a stack trace', () => {
      const error = new BaseError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stackTrace).toBeDefined();
      expect(error.stack).toContain('BaseError');
      expect(error.stack).toContain('Test error');
    });

    it('should initialize context as empty object', () => {
      const error = new BaseError('Test error');

      expect(error.context).toEqual({});
    });
  });

  describe('withContext', () => {
    it('should add context to error', () => {
      const error = new BaseError('Test error');
      const context = { userId: 123, operation: 'test' };

      const result = error.withContext(context);

      expect(result).toBe(error); // Should return same instance
      expect(error.context).toEqual(context);
    });

    it('should merge multiple contexts', () => {
      const error = new BaseError('Test error');

      error.withContext({ userId: 123 });
      error.withContext({ operation: 'test' });

      expect(error.context).toEqual({
        userId: 123,
        operation: 'test',
      });
    });

    it('should overwrite existing context keys', () => {
      const error = new BaseError('Test error');

      error.withContext({ userId: 123 });
      error.withContext({ userId: 456 });

      expect(error.context.userId).toBe(456);
    });

    it('should support method chaining', () => {
      const error = new BaseError('Test error');

      const result = error
        .withContext({ userId: 123 })
        .withContext({ operation: 'test' });

      expect(result).toBe(error);
      expect(error.context).toEqual({
        userId: 123,
        operation: 'test',
      });
    });
  });

  describe('withUserMessage', () => {
    it('should add user-friendly message', () => {
      const error = new BaseError('Technical error');
      const userMessage = 'Something went wrong. Please try again.';

      const result = error.withUserMessage(userMessage);

      expect(result).toBe(error);
      expect(error.userMessage).toBe(userMessage);
    });

    it('should support method chaining with withContext', () => {
      const error = new BaseError('Technical error');

      const result = error
        .withContext({ userId: 123 })
        .withUserMessage('User-friendly message');

      expect(result).toBe(error);
      expect(error.context.userId).toBe(123);
      expect(error.userMessage).toBe('User-friendly message');
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new BaseError('Test error', 'TEST_CODE', 400, { test: true });
      const json = error.toJSON();

      expect(json).toHaveProperty('name', 'BaseError');
      expect(json).toHaveProperty('message', 'Test error');
      expect(json).toHaveProperty('code', 'TEST_CODE');
      expect(json).toHaveProperty('statusCode', 400);
      expect(json).toHaveProperty('details', { test: true });
      expect(json).toHaveProperty('context', {});
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('stack');
    });

    it('should include context and userMessage if set', () => {
      const error = new BaseError('Test error')
        .withContext({ userId: 123 })
        .withUserMessage('User message');

      const json = error.toJSON();

      expect(json.context).toEqual({ userId: 123 });
      expect(json.userMessage).toBe('User message');
    });

    it('should be serializable with JSON.stringify', () => {
      const error = new BaseError('Test error', 'TEST_CODE');
      const jsonString = JSON.stringify(error);
      const parsed = JSON.parse(jsonString);

      expect(parsed.name).toBe('BaseError');
      expect(parsed.message).toBe('Test error');
      expect(parsed.code).toBe('TEST_CODE');
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const error = new BaseError('Test error', 'TEST_CODE');
      const str = error.toString();

      expect(str).toBe('BaseError [TEST_CODE]: Test error');
    });

    it('should work with default code', () => {
      const error = new BaseError('Test error');
      const str = error.toString();

      expect(str).toBe('BaseError [UNKNOWN_ERROR]: Test error');
    });

    it('should be called by String() constructor', () => {
      const error = new BaseError('Test error', 'TEST_CODE');
      const str = String(error);

      expect(str).toBe('BaseError [TEST_CODE]: Test error');
    });
  });

  describe('inheritance', () => {
    it('should be instance of Error', () => {
      const error = new BaseError('Test error');

      expect(error instanceof Error).toBe(true);
    });

    it('should be instance of BaseError', () => {
      const error = new BaseError('Test error');

      expect(error instanceof BaseError).toBe(true);
    });

    it('should work with try-catch', () => {
      expect(() => {
        throw new BaseError('Test error');
      }).toThrow(BaseError);
    });

    it('should preserve error message in catch', () => {
      try {
        throw new BaseError('Test error', 'TEST_CODE');
      } catch (error) {
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('TEST_CODE');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      const error = new BaseError('');

      expect(error.message).toBe('');
      expect(error.toString()).toBe('BaseError [UNKNOWN_ERROR]: ');
    });

    it('should handle null details', () => {
      const error = new BaseError('Test error', 'CODE', 500, null);

      expect(error.details).toBeNull();
    });

    it('should handle undefined values', () => {
      const error = new BaseError(undefined);

      // JavaScript Error constructor converts undefined message to empty string
      expect(error.message).toBe('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new BaseError(longMessage);

      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(10000);
    });

    it('should handle complex details objects', () => {
      const complexDetails = {
        nested: {
          deeply: {
            value: 123,
          },
        },
        array: [1, 2, 3],
        fn: () => {},
      };

      const error = new BaseError('Test', 'CODE', 500, complexDetails);

      expect(error.details).toEqual(complexDetails);
    });
  });
});
