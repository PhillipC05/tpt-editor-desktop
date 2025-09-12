/**
 * Sprite Post-Processor - Advanced sprite optimization and enhancement
 * Handles sprite compression, format conversion, quality enhancement, and optimization
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');

class SpritePostProcessor {
    constructor(options = {}) {
        this.options = {
            enableCompression: options.enableCompression !== false,
            enableOptimization: options.enableOptimization !== false,
            enableEnhancement: options.enableEnhancement !== false,
            enableFormatConversion: options.enableFormatConversion !== false,
            qualityThreshold: options.qualityThreshold || 0.8,
            compressionLevel: options.compressionLevel || 6,
            ...options
        };

        // Processing pipelines
        this.pipelines = {
            BASIC: 'basic',
            OPTIMIZATION: 'optimization',
            ENHANCEMENT: 'enhancement',
            COMPRESSION: 'compression',
            QUALITY_ASSURANCE: 'quality_assurance'
        };

        // Image formats
        this.formats = {
            PNG: 'png',
            JPEG: 'jpeg',
            WEBP: 'webp',
            BMP: 'bmp',
            TIFF: 'tiff'
        };

        // Quality metrics
        this.qualityMetrics = {
            totalSpritesProcessed: 0,
            averageCompressionRatio: 0,
            averageQualityScore: 0,
            processingTime: 0,
            optimizationSavings: 0
        };

        // Processing presets
        this.presets = {
            WEB_OPTIMIZED: {
                format: this.formats.WEBP,
                quality: 85,
                compression: 'lossy',
                optimization: true
            },
            GAME_READY: {
                format: this.formats.PNG,
                quality: 100,
                compression: 'lossless',
                optimization: true
            },
            MOBILE_OPTIMIZED: {
                format: this.formats.WEBP,
                quality: 75,
                compression: 'lossy',
                optimization: true,
                maxSize: 512
            },
            RETRO_PIXEL: {
                format: this.formats.PNG,
                quality: 100,
                compression: 'lossless',
                pixelate: true,
                dither: true
            }
        };
    }

    /**
     * Process sprite with specified pipeline
     */
    async processSprite(spriteImage, pipeline = this.pipelines.BASIC, options = {}) {
        const startTime = Date.now();
        let processedImage = spriteImage.clone();

        try {
            switch (pipeline) {
                case this.pipelines.BASIC:
                    processedImage = await this.applyBasicProcessing(processedImage, options);
                    break;

                case this.pipelines.OPTIMIZATION:
                    processedImage = await this.applyOptimization(processedImage, options);
                    break;

                case this.pipelines.ENHANCEMENT:
                    processedImage = await this.applyEnhancement(processedImage, options);
                    break;

                case this.pipelines.COMPRESSION:
                    processedImage = await this.applyCompression(processedImage, options);
                    break;

                case this.pipelines.QUALITY_ASSURANCE:
                    processedImage = await this.applyQualityAssurance(processedImage, options);
                    break;

                default:
                    processedImage = await this.applyBasicProcessing(processedImage, options);
            }

            // Update metrics
            const endTime = Date.now();
            this.updateQualityMetrics(processedImage, spriteImage, endTime - startTime);

            return processedImage;

        } catch (error) {
            console.error('Error in sprite post-processing:', error);
            return spriteImage; // Return original if processing fails
        }
    }

    /**
     * Apply basic processing
     */
    async applyBasicProcessing(image, options) {
        let processedImage = image.clone();

        // Trim transparent pixels
        if (options.trim) {
            processedImage = await this.trimTransparentPixels(processedImage);
        }

        // Apply basic color correction
        if (options.colorCorrection) {
            processedImage = await this.applyColorCorrection(processedImage, options.colorCorrection);
        }

        // Resize if needed
        if (options.resize) {
            processedImage = await this.resizeImage(processedImage, options.resize);
        }

        return processedImage;
    }

    /**
     * Apply optimization processing
     */
    async applyOptimization(image, options) {
        let processedImage = image.clone();

        // Remove unnecessary metadata
        processedImage = await this.stripMetadata(processedImage);

        // Optimize color palette
        if (options.optimizePalette) {
            processedImage = await this.optimizeColorPalette(processedImage, options.optimizePalette);
        }

        // Apply lossless compression
        if (options.losslessCompression) {
            processedImage = await this.applyLosslessCompression(processedImage);
        }

        // Remove duplicate pixels/transparency
        processedImage = await this.removeDuplicatePixels(processedImage);

        return processedImage;
    }

    /**
     * Apply enhancement processing
     */
    async applyEnhancement(image, options) {
        let processedImage = image.clone();

        // Apply sharpening
        if (options.sharpen) {
            processedImage = await this.applySharpening(processedImage, options.sharpen);
        }

        // Apply noise reduction
        if (options.denoise) {
            processedImage = await this.applyNoiseReduction(processedImage, options.denoise);
        }

        // Enhance contrast
        if (options.enhanceContrast) {
            processedImage = await this.enhanceContrast(processedImage, options.enhanceContrast);
        }

        // Apply anti-aliasing
        if (options.antiAlias) {
            processedImage = await this.applyAntiAliasing(processedImage, options.antiAlias);
        }

        return processedImage;
    }

    /**
     * Apply compression processing
     */
    async applyCompression(image, options) {
        let processedImage = image.clone();

        // Apply lossy compression
        if (options.lossyCompression) {
            processedImage = await this.applyLossyCompression(processedImage, options.lossyCompression);
        }

        // Resize for compression
        if (options.resizeForCompression) {
            processedImage = await this.resizeForCompression(processedImage, options.resizeForCompression);
        }

        // Apply format-specific compression
        if (options.formatCompression) {
            processedImage = await this.applyFormatCompression(processedImage, options.formatCompression);
        }

        return processedImage;
    }

    /**
     * Apply quality assurance processing
     */
    async applyQualityAssurance(image, options) {
        let processedImage = image.clone();

        // Check and fix common issues
        processedImage = await this.fixCommonIssues(processedImage);

        // Validate sprite quality
        const qualityScore = await this.validateQuality(processedImage);

        if (qualityScore < this.options.qualityThreshold) {
            console.warn(`Sprite quality below threshold: ${qualityScore}`);
            if (options.autoFix) {
                processedImage = await this.autoFixQualityIssues(processedImage, qualityScore);
            }
        }

        // Add quality metadata
        processedImage.qualityScore = qualityScore;

        return processedImage;
    }

    /**
     * Trim transparent pixels
     */
    async trimTransparentPixels(image) {
        // Find bounds of non-transparent pixels
        let minX = image.bitmap.width;
        let minY = image.bitmap.height;
        let maxX = 0;
        let maxY = 0;

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            const alpha = image.bitmap.data[idx + 3];
            if (alpha > 0) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        });

        // Crop to content
        if (minX < maxX && minY < maxY) {
            return image.crop(minX, minY, maxX - minX + 1, maxY - minY + 1);
        }

        return image;
    }

    /**
     * Apply color correction
     */
    async applyColorCorrection(image, correction) {
        return image.color([
            { apply: 'brightness', params: [correction.brightness || 0] },
            { apply: 'contrast', params: [correction.contrast || 0] },
            { apply: 'saturate', params: [correction.saturation || 0] }
        ]);
    }

    /**
     * Resize image
     */
    async resizeImage(image, resizeOptions) {
        const { width, height, maintainAspectRatio = true, algorithm = Jimp.RESIZE_BICUBIC } = resizeOptions;

        if (maintainAspectRatio) {
            return image.resize(width, height, algorithm);
        } else {
            return image.resize(width, Jimp.AUTO, algorithm);
        }
    }

    /**
     * Strip metadata
     */
    async stripMetadata(image) {
        // Jimp automatically strips most metadata when processing
        return image;
    }

    /**
     * Optimize color palette
     */
    async optimizeColorPalette(image, options) {
        // This would implement color quantization
        // For now, return the image as-is
        return image;
    }

    /**
     * Apply lossless compression
     */
    async applyLosslessCompression(image) {
        // PNG is already lossless, but we can optimize it
        return image;
    }

    /**
     * Remove duplicate pixels
     */
    async removeDuplicatePixels(image) {
        // This would implement duplicate pixel removal
        return image;
    }

    /**
     * Apply sharpening
     */
    async applySharpening(image, sharpenOptions) {
        const { strength = 1.0 } = sharpenOptions;
        const sharpenKernel = [
            0, -strength, 0,
            -strength, 1 + 4 * strength, -strength,
            0, -strength, 0
        ];

        return image.convolution(sharpenKernel);
    }

    /**
     * Apply noise reduction
     */
    async applyNoiseReduction(image, denoiseOptions) {
        // Simple noise reduction using median filter
        const processedImage = image.clone();

        // This is a simplified implementation
        return processedImage.blur(0.5);
    }

    /**
     * Enhance contrast
     */
    async enhanceContrast(image, contrastOptions) {
        const { level = 1.2 } = contrastOptions;
        return image.contrast(level);
    }

    /**
     * Apply anti-aliasing
     */
    async applyAntiAliasing(image, aaOptions) {
        // This would implement anti-aliasing
        return image;
    }

    /**
     * Apply lossy compression
     */
    async applyLossyCompression(image, compressionOptions) {
        // This would implement lossy compression for JPEG/WebP
        return image;
    }

    /**
     * Resize for compression
     */
    async resizeForCompression(image, resizeOptions) {
        const { maxWidth, maxHeight, quality } = resizeOptions;

        if (image.bitmap.width > maxWidth || image.bitmap.height > maxHeight) {
            return image.resize(maxWidth, maxHeight, Jimp.RESIZE_BICUBIC);
        }

        return image;
    }

    /**
     * Apply format-specific compression
     */
    async applyFormatCompression(image, formatOptions) {
        // This would implement format-specific compression
        return image;
    }

    /**
     * Fix common issues
     */
    async fixCommonIssues(image) {
        let processedImage = image.clone();

        // Fix color banding
        processedImage = await this.fixColorBanding(processedImage);

        // Fix pixel artifacts
        processedImage = await this.fixPixelArtifacts(processedImage);

        // Ensure proper transparency
        processedImage = await this.ensureProperTransparency(processedImage);

        return processedImage;
    }

    /**
     * Validate quality
     */
    async validateQuality(image) {
        let score = 1.0;

        // Check image dimensions
        if (image.bitmap.width < 8 || image.bitmap.height < 8) {
            score -= 0.3;
        }

        // Check for excessive transparency
        const transparentPixels = this.countTransparentPixels(image);
        const transparencyRatio = transparentPixels / (image.bitmap.width * image.bitmap.height);

        if (transparencyRatio > 0.9) {
            score -= 0.2; // Too much transparency
        }

        // Check color diversity
        const uniqueColors = this.countUniqueColors(image);
        if (uniqueColors < 5) {
            score -= 0.1; // Too few colors
        }

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Auto-fix quality issues
     */
    async autoFixQualityIssues(image, qualityScore) {
        let processedImage = image.clone();

        if (qualityScore < 0.5) {
            // Major quality issues - apply comprehensive fixes
            processedImage = await this.applyEnhancement(processedImage, {
                sharpen: { strength: 0.5 },
                enhanceContrast: { level: 1.1 },
                denoise: true
            });
        } else if (qualityScore < 0.7) {
            // Minor quality issues - apply light fixes
            processedImage = await this.enhanceContrast(processedImage, { level: 1.05 });
        }

        return processedImage;
    }

    /**
     * Count transparent pixels
     */
    countTransparentPixels(image) {
        let count = 0;

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            if (image.bitmap.data[idx + 3] < 128) {
                count++;
            }
        });

        return count;
    }

    /**
     * Count unique colors
     */
    countUniqueColors(image) {
        const colors = new Set();

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            const color = (image.bitmap.data[idx] << 16) |
                         (image.bitmap.data[idx + 1] << 8) |
                         image.bitmap.data[idx + 2];
            colors.add(color);
        });

        return colors.size;
    }

    /**
     * Fix color banding
     */
    async fixColorBanding(image) {
        // Apply slight blur to reduce banding
        return image.blur(0.3);
    }

    /**
     * Fix pixel artifacts
     */
    async fixPixelArtifacts(image) {
        // Apply median filter to reduce artifacts
        return image.blur(0.5);
    }

    /**
     * Ensure proper transparency
     */
    async ensureProperTransparency(image) {
        // This would ensure proper alpha channel handling
        return image;
    }

    /**
     * Update quality metrics
     */
    updateQualityMetrics(processedImage, originalImage, processingTime) {
        this.qualityMetrics.totalSpritesProcessed++;

        // Calculate compression ratio
        const originalSize = originalImage.bitmap.width * originalImage.bitmap.height * 4;
        const processedSize = processedImage.bitmap.width * processedImage.bitmap.height * 4;
        const compressionRatio = processedSize / originalSize;

        this.qualityMetrics.averageCompressionRatio =
            (this.qualityMetrics.averageCompressionRatio * (this.qualityMetrics.totalSpritesProcessed - 1) + compressionRatio) /
            this.qualityMetrics.totalSpritesProcessed;

        // Update processing time
        this.qualityMetrics.processingTime += processingTime;

        // Calculate quality score
        const qualityScore = processedImage.qualityScore || 0.8;
        this.qualityMetrics.averageQualityScore =
            (this.qualityMetrics.averageQualityScore * (this.qualityMetrics.totalSpritesProcessed - 1) + qualityScore) /
            this.qualityMetrics.totalSpritesProcessed;
    }

    /**
     * Process sprite with preset
     */
    async processWithPreset(spriteImage, presetName, customOptions = {}) {
        const preset = this.presets[presetName];

        if (!preset) {
            throw new Error(`Unknown preset: ${presetName}`);
        }

        const options = { ...preset, ...customOptions };
        return await this.processSprite(spriteImage, this.pipelines.OPTIMIZATION, options);
    }

    /**
     * Batch process sprites
     */
    async batchProcessSprites(sprites, pipeline = this.pipelines.BASIC, options = {}) {
        const results = [];

        for (const sprite of sprites) {
            try {
                const processedSprite = await this.processSprite(sprite.image, pipeline, options);
                results.push({
                    original: sprite,
                    processed: processedSprite,
                    success: true
                });
            } catch (error) {
                console.error(`Failed to process sprite ${sprite.name}:`, error);
                results.push({
                    original: sprite,
                    processed: sprite.image,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Export processed sprite
     */
    async exportProcessedSprite(processedImage, outputPath, format = this.formats.PNG, quality = 100) {
        const fullPath = outputPath.endsWith(`.${format}`) ? outputPath : `${outputPath}.${format}`;

        switch (format) {
            case this.formats.PNG:
                await processedImage.writeAsync(fullPath);
                break;
            case this.formats.JPEG:
                await processedImage.quality(quality).writeAsync(fullPath);
                break;
            case this.formats.WEBP:
                // WebP support would require additional library
                await processedImage.writeAsync(fullPath.replace('.webp', '.png'));
                break;
            default:
                await processedImage.writeAsync(fullPath);
        }

        return fullPath;
    }

    /**
     * Get processing statistics
     */
    getProcessingStatistics() {
        return {
            ...this.qualityMetrics,
            averageProcessingTime: this.qualityMetrics.processingTime / Math.max(1, this.qualityMetrics.totalSpritesProcessed),
            compressionSavings: (1 - this.qualityMetrics.averageCompressionRatio) * 100
        };
    }

    /**
     * Create processing report
     */
    async createProcessingReport(outputPath) {
        const stats = this.getProcessingStatistics();
        const report = {
            timestamp: new Date().toISOString(),
            statistics: stats,
            presets: Object.keys(this.presets),
            pipelines: Object.values(this.pipelines),
            supportedFormats: Object.values(this.formats)
        };

        await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8');
        return outputPath;
    }

    /**
     * Optimize for specific use case
     */
    optimizeForUseCase(useCase) {
        const optimizations = {
            WEB_GAME: {
                pipeline: this.pipelines.COMPRESSION,
                preset: this.presets.WEB_OPTIMIZED,
                format: this.formats.WEBP
            },
            MOBILE_GAME: {
                pipeline: this.pipelines.COMPRESSION,
                preset: this.presets.MOBILE_OPTIMIZED,
                format: this.formats.WEBP
            },
            DESKTOP_GAME: {
                pipeline: this.pipelines.OPTIMIZATION,
                preset: this.presets.GAME_READY,
                format: this.formats.PNG
            },
            RETRO_GAME: {
                pipeline: this.pipelines.ENHANCEMENT,
                preset: this.presets.RETRO_PIXEL,
                format: this.formats.PNG
            }
        };

        return optimizations[useCase] || optimizations.DESKTOP_GAME;
    }
}

module.exports = SpritePostProcessor;
