/**
 * TPT Asset Editor Desktop - Generation Error
 * Errors related to asset generation processes
 */

const BaseError = require('./base-error');

class GenerationError extends BaseError {
    constructor(message, generatorType = null, config = null, details = {}) {
        super(message, 'GENERATION_ERROR', 500, {
            generatorType,
            config,
            ...details
        });

        this.generatorType = generatorType;
        this.config = config;
    }

    /**
     * Create error for generator not found
     */
    static generatorNotFound(type) {
        return new GenerationError(
            `Generator not found: ${type}`,
            type,
            null,
            { reason: 'generator_missing' }
        ).withUserMessage(`The ${type} generator is not available. Please check your installation.`);
    }

    /**
     * Create error for generator failure
     */
    static generatorFailed(type, reason, config = null) {
        return new GenerationError(
            `Generator ${type} failed: ${reason}`,
            type,
            config,
            { reason, phase: 'execution' }
        ).withUserMessage(`Failed to generate ${type} asset. Please try again or check your configuration.`);
    }

    /**
     * Create error for invalid generator configuration
     */
    static invalidConfig(type, config, validationErrors = []) {
        return new GenerationError(
            `Invalid configuration for ${type} generator`,
            type,
            config,
            {
                validationErrors,
                phase: 'validation'
            }
        ).withUserMessage(`Please check your ${type} configuration and try again.`);
    }

    /**
     * Create error for generator timeout
     */
    static timeout(type, timeoutMs, config = null) {
        return new GenerationError(
            `Generator ${type} timed out after ${timeoutMs}ms`,
            type,
            config,
            {
                timeoutMs,
                phase: 'timeout'
            }
        ).withUserMessage(`Generation took too long. Please try again or use simpler settings.`);
    }

    /**
     * Create error for resource exhaustion
     */
    static resourceExhausted(type, resource, config = null) {
        return new GenerationError(
            `Resource exhausted during ${type} generation: ${resource}`,
            type,
            config,
            {
                resource,
                phase: 'resource_limitation'
            }
        ).withUserMessage(`Not enough ${resource} to complete generation. Please free up resources and try again.`);
    }

    /**
     * Create error for quality enhancement failure
     */
    static qualityEnhancementFailed(type, reason, config = null) {
        return new GenerationError(
            `Quality enhancement failed for ${type}: ${reason}`,
            type,
            config,
            {
                reason,
                phase: 'quality_enhancement'
            }
        ).withUserMessage(`Asset generated successfully but quality enhancement failed. The asset is still usable.`);
    }

    /**
     * Create error for concurrent generation limit exceeded
     */
    static concurrencyLimitExceeded(current, max) {
        return new GenerationError(
            `Maximum concurrent generations exceeded: ${current}/${max}`,
            null,
            null,
            {
                current,
                max,
                phase: 'concurrency_limit'
            }
        ).withUserMessage(`Too many generations running. Please wait for some to complete.`);
    }

    /**
     * Create error for batch generation failure
     */
    static batchGenerationFailed(failedCount, totalCount, errors = []) {
        return new GenerationError(
            `Batch generation failed: ${failedCount}/${totalCount} assets failed`,
            'batch',
            null,
            {
                failedCount,
                totalCount,
                errors,
                phase: 'batch_processing'
            }
        ).withUserMessage(`${failedCount} out of ${totalCount} assets failed to generate. Check individual errors for details.`);
    }
}

module.exports = GenerationError;
