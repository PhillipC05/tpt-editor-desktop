/**
 * Tests for GenerationError class
 */

const { describe, it, expect } = require('@jest/globals');
const GenerationError = require('../generation-error');
const BaseError = require('../base-error');

describe('GenerationError', () => {
  describe('constructor', () => {
    it('should create generation error with all parameters', () => {
      const config = { width: 64, height: 64 };
      const details = { phase: 'rendering' };
      const error = new GenerationError('Generation failed', 'sprite', config, details);

      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(GenerationError);
      expect(error.message).toBe('Generation failed');
      expect(error.generatorType).toBe('sprite');
      expect(error.config).toEqual(config);
      expect(error.code).toBe('GENERATION_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.details.generatorType).toBe('sprite');
      expect(error.details.config).toEqual(config);
      expect(error.details.phase).toBe('rendering');
    });

    it('should create generation error with minimal parameters', () => {
      const error = new GenerationError('Generation failed');

      expect(error.message).toBe('Generation failed');
      expect(error.generatorType).toBeNull();
      expect(error.config).toBeNull();
    });

    it('should merge additional details', () => {
      const error = new GenerationError('Failed', 'audio', null, {
        duration: 5,
        format: 'wav',
      });

      expect(error.details.duration).toBe(5);
      expect(error.details.format).toBe('wav');
      expect(error.details.generatorType).toBe('audio');
    });
  });

  describe('static generatorNotFound()', () => {
    it('should create generator not found error', () => {
      const error = GenerationError.generatorNotFound('custom-sprite');

      expect(error).toBeInstanceOf(GenerationError);
      expect(error.message).toBe('Generator not found: custom-sprite');
      expect(error.generatorType).toBe('custom-sprite');
      expect(error.config).toBeNull();
      expect(error.details.reason).toBe('generator_missing');
      expect(error.userMessage).toBe(
        'The custom-sprite generator is not available. Please check your installation.'
      );
    });
  });

  describe('static generatorFailed()', () => {
    it('should create generator failed error', () => {
      const config = { size: 64 };
      const error = GenerationError.generatorFailed('particle', 'invalid parameters', config);

      expect(error.message).toBe('Generator particle failed: invalid parameters');
      expect(error.generatorType).toBe('particle');
      expect(error.config).toEqual(config);
      expect(error.details.reason).toBe('invalid parameters');
      expect(error.details.phase).toBe('execution');
      expect(error.userMessage).toContain('Failed to generate particle asset');
    });

    it('should create error without config', () => {
      const error = GenerationError.generatorFailed('audio', 'memory limit exceeded');

      expect(error.config).toBeNull();
      expect(error.details.reason).toBe('memory limit exceeded');
    });
  });

  describe('static invalidConfig()', () => {
    it('should create invalid config error', () => {
      const config = { width: -10, height: 'invalid' };
      const validationErrors = [
        'width must be positive',
        'height must be a number',
      ];
      const error = GenerationError.invalidConfig('building', config, validationErrors);

      expect(error.message).toBe('Invalid configuration for building generator');
      expect(error.generatorType).toBe('building');
      expect(error.config).toEqual(config);
      expect(error.details.validationErrors).toEqual(validationErrors);
      expect(error.details.phase).toBe('validation');
      expect(error.userMessage).toBe('Please check your building configuration and try again.');
    });

    it('should handle empty validation errors', () => {
      const error = GenerationError.invalidConfig('vehicle', {}, []);

      expect(error.details.validationErrors).toEqual([]);
    });
  });

  describe('static timeout()', () => {
    it('should create timeout error', () => {
      const config = { complexity: 'high' };
      const error = GenerationError.timeout('terrain', 30000, config);

      expect(error.message).toBe('Generator terrain timed out after 30000ms');
      expect(error.generatorType).toBe('terrain');
      expect(error.config).toEqual(config);
      expect(error.details.timeoutMs).toBe(30000);
      expect(error.details.phase).toBe('timeout');
      expect(error.userMessage).toContain('Generation took too long');
    });

    it('should handle timeout without config', () => {
      const error = GenerationError.timeout('animation', 5000);

      expect(error.config).toBeNull();
      expect(error.details.timeoutMs).toBe(5000);
    });
  });

  describe('static resourceExhausted()', () => {
    it('should create resource exhausted error', () => {
      const config = { resolution: '4K' };
      const error = GenerationError.resourceExhausted('texture', 'memory', config);

      expect(error.message).toBe('Resource exhausted during texture generation: memory');
      expect(error.generatorType).toBe('texture');
      expect(error.config).toEqual(config);
      expect(error.details.resource).toBe('memory');
      expect(error.details.phase).toBe('resource_limitation');
      expect(error.userMessage).toContain('Not enough memory');
    });

    it('should handle different resource types', () => {
      const error = GenerationError.resourceExhausted('video', 'disk space');

      expect(error.details.resource).toBe('disk space');
      expect(error.userMessage).toContain('disk space');
    });
  });

  describe('static qualityEnhancementFailed()', () => {
    it('should create quality enhancement failed error', () => {
      const config = { enhance: true };
      const error = GenerationError.qualityEnhancementFailed('icon', 'filter unavailable', config);

      expect(error.message).toBe('Quality enhancement failed for icon: filter unavailable');
      expect(error.generatorType).toBe('icon');
      expect(error.config).toEqual(config);
      expect(error.details.reason).toBe('filter unavailable');
      expect(error.details.phase).toBe('quality_enhancement');
      expect(error.userMessage).toContain('Asset generated successfully');
      expect(error.userMessage).toContain('quality enhancement failed');
    });
  });

  describe('static concurrencyLimitExceeded()', () => {
    it('should create concurrency limit error', () => {
      const error = GenerationError.concurrencyLimitExceeded(10, 5);

      expect(error.message).toBe('Maximum concurrent generations exceeded: 10/5');
      expect(error.generatorType).toBeNull();
      expect(error.config).toBeNull();
      expect(error.details.current).toBe(10);
      expect(error.details.max).toBe(5);
      expect(error.details.phase).toBe('concurrency_limit');
      expect(error.userMessage).toContain('Too many generations running');
    });
  });

  describe('static batchGenerationFailed()', () => {
    it('should create batch generation failed error', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const error = GenerationError.batchGenerationFailed(3, 10, errors);

      expect(error.message).toBe('Batch generation failed: 3/10 assets failed');
      expect(error.generatorType).toBe('batch');
      expect(error.config).toBeNull();
      expect(error.details.failedCount).toBe(3);
      expect(error.details.totalCount).toBe(10);
      expect(error.details.errors).toEqual(errors);
      expect(error.details.phase).toBe('batch_processing');
      expect(error.userMessage).toContain('3 out of 10 assets failed');
    });

    it('should handle empty error array', () => {
      const error = GenerationError.batchGenerationFailed(5, 20, []);

      expect(error.details.errors).toEqual([]);
    });

    it('should handle 100% failure', () => {
      const error = GenerationError.batchGenerationFailed(10, 10);

      expect(error.details.failedCount).toBe(10);
      expect(error.details.totalCount).toBe(10);
    });
  });

  describe('method chaining', () => {
    it('should support withContext chaining', () => {
      const error = GenerationError.generatorFailed('sprite', 'crash')
        .withContext({ attemptNumber: 3 });

      expect(error.generatorType).toBe('sprite');
      expect(error.context.attemptNumber).toBe(3);
    });

    it('should allow overriding userMessage', () => {
      const error = GenerationError.timeout('audio', 5000)
        .withUserMessage('Custom timeout message');

      expect(error.userMessage).toBe('Custom timeout message');
    });

    it('should support full chaining', () => {
      const error = GenerationError.invalidConfig('vehicle', {}, ['error1'])
        .withContext({ userId: 456, operation: 'create' })
        .withUserMessage('Please fix your configuration');

      expect(error.generatorType).toBe('vehicle');
      expect(error.context.userId).toBe(456);
      expect(error.userMessage).toBe('Please fix your configuration');
    });
  });

  describe('inheritance and serialization', () => {
    it('should serialize to JSON correctly', () => {
      const config = { width: 128 };
      const error = GenerationError.generatorFailed('weapon', 'invalid data', config);
      const json = error.toJSON();

      expect(json.name).toBe('GenerationError');
      expect(json.code).toBe('GENERATION_ERROR');
      expect(json.statusCode).toBe(500);
      expect(json.details.generatorType).toBe('weapon');
      expect(json.details.config).toEqual(config);
      expect(json.details.reason).toBe('invalid data');
    });

    it('should have correct string representation', () => {
      const error = GenerationError.generatorNotFound('custom');
      const str = error.toString();

      expect(str).toBe('GenerationError [GENERATION_ERROR]: Generator not found: custom');
    });

    it('should be catchable as BaseError', () => {
      try {
        throw GenerationError.timeout('test', 1000);
      } catch (error) {
        expect(error instanceof BaseError).toBe(true);
        expect(error instanceof GenerationError).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle null generator type', () => {
      const error = new GenerationError('Error', null, {}, {});

      expect(error.generatorType).toBeNull();
      expect(error.details.generatorType).toBeNull();
    });

    it('should handle empty strings', () => {
      const error = GenerationError.generatorFailed('', '');

      expect(error.message).toBe('Generator  failed: ');
      expect(error.generatorType).toBe('');
    });

    it('should handle complex config objects', () => {
      const complexConfig = {
        nested: {
          deeply: {
            value: 123,
            array: [1, 2, 3],
          },
        },
        fn: () => {},
      };

      const error = new GenerationError('Error', 'test', complexConfig, {});

      expect(error.config).toEqual(complexConfig);
      expect(error.details.config).toEqual(complexConfig);
    });

    it('should handle very long error messages', () => {
      const longReason = 'A'.repeat(10000);
      const error = GenerationError.generatorFailed('test', longReason);

      expect(error.details.reason).toBe(longReason);
      expect(error.message.length).toBeGreaterThan(10000);
    });

    it('should handle special characters in generator type', () => {
      const error = GenerationError.generatorNotFound('custom/sprite@v2');

      expect(error.generatorType).toBe('custom/sprite@v2');
      expect(error.message).toContain('custom/sprite@v2');
    });

    it('should handle large validation error arrays', () => {
      const largeErrors = Array(1000).fill('validation error');
      const error = GenerationError.invalidConfig('test', {}, largeErrors);

      expect(error.details.validationErrors.length).toBe(1000);
    });
  });
});
