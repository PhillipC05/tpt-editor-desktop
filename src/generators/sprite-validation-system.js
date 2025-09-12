/**
 * Sprite Validation System - Comprehensive quality assurance and validation
 * Ensures sprites meet technical and quality standards for game development
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');

class SpriteValidationSystem {
    constructor(options = {}) {
        this.options = {
            strictMode: options.strictMode || false,
            minQualityScore: options.minQualityScore || 0.7,
            maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB
            supportedFormats: options.supportedFormats || ['png', 'jpg', 'jpeg', 'webp'],
            enableDetailedAnalysis: options.enableDetailedAnalysis !== false,
            ...options
        };

        // Validation rules
        this.validationRules = {
            DIMENSIONS: 'dimensions',
            FILE_SIZE: 'file_size',
            COLOR_DEPTH: 'color_depth',
            TRANSPARENCY: 'transparency',
            ASPECT_RATIO: 'aspect_ratio',
            PIXEL_PERFECT: 'pixel_perfect',
            COLOR_PALETTE: 'color_palette',
            EDGE_ARTIFACTS: 'edge_artifacts',
            COMPRESSION_RATIO: 'compression_ratio',
            METADATA_VALIDITY: 'metadata_validity'
        };

        // Quality thresholds
        this.qualityThresholds = {
            excellent: 0.9,
            good: 0.8,
            acceptable: 0.7,
            poor: 0.5,
            unacceptable: 0.3
        };

        // Validation results
        this.validationResults = {
            totalSpritesValidated: 0,
            passedValidations: 0,
            failedValidations: 0,
            qualityDistribution: {
                excellent: 0,
                good: 0,
                acceptable: 0,
                poor: 0,
                unacceptable: 0
            },
            commonIssues: new Map(),
            validationHistory: []
        };

        // Sprite standards by category
        this.spriteStandards = {
            characters: {
                minWidth: 16,
                maxWidth: 128,
                minHeight: 16,
                maxHeight: 128,
                preferredAspectRatio: 1.0,
                maxColors: 256,
                transparencyRequired: true
            },
            items: {
                minWidth: 8,
                maxWidth: 64,
                minHeight: 8,
                maxHeight: 64,
                preferredAspectRatio: 1.0,
                maxColors: 128,
                transparencyRequired: true
            },
            tiles: {
                minWidth: 16,
                maxWidth: 64,
                minHeight: 16,
                maxHeight: 64,
                preferredAspectRatio: 1.0,
                maxColors: 64,
                transparencyRequired: false
            },
            ui: {
                minWidth: 8,
                maxWidth: 256,
                minHeight: 8,
                maxHeight: 128,
                preferredAspectRatio: null, // Variable
                maxColors: 32,
                transparencyRequired: true
            },
            particles: {
                minWidth: 4,
                maxWidth: 32,
                minHeight: 4,
                maxHeight: 32,
                preferredAspectRatio: 1.0,
                maxColors: 16,
                transparencyRequired: true
            }
        };
    }

    /**
     * Validate single sprite
     */
    async validateSprite(spriteImage, spriteName = 'unknown', category = 'characters', options = {}) {
        const startTime = Date.now();
        const validationResult = {
            spriteName: spriteName,
            category: category,
            timestamp: new Date().toISOString(),
            overallScore: 0,
            passed: true,
            issues: [],
            recommendations: [],
            technicalDetails: {},
            qualityMetrics: {}
        };

        try {
            // Basic validation
            const basicResult = await this.performBasicValidation(spriteImage, category);
            validationResult.technicalDetails = { ...basicResult };

            // Quality analysis
            const qualityResult = await this.performQualityAnalysis(spriteImage);
            validationResult.qualityMetrics = { ...qualityResult };

            // Content analysis
            const contentResult = await this.performContentAnalysis(spriteImage);
            validationResult.technicalDetails = { ...validationResult.technicalDetails, ...contentResult };

            // Calculate overall score
            validationResult.overallScore = this.calculateOverallScore(
                basicResult,
                qualityResult,
                contentResult,
                category
            );

            // Determine pass/fail
            validationResult.passed = validationResult.overallScore >= this.options.minQualityScore;

            // Generate issues and recommendations
            validationResult.issues = this.generateIssuesList(basicResult, qualityResult, contentResult);
            validationResult.recommendations = this.generateRecommendations(validationResult.issues, category);

            // Update validation statistics
            this.updateValidationStatistics(validationResult);

            // Add to history
            this.validationResults.validationHistory.push(validationResult);

            const endTime = Date.now();
            validationResult.processingTime = endTime - startTime;

            return validationResult;

        } catch (error) {
            console.error(`Error validating sprite ${spriteName}:`, error);
            validationResult.passed = false;
            validationResult.issues.push({
                type: 'validation_error',
                severity: 'critical',
                message: `Validation failed: ${error.message}`
            });
            return validationResult;
        }
    }

    /**
     * Perform basic validation
     */
    async performBasicValidation(image, category) {
        const standards = this.spriteStandards[category] || this.spriteStandards.characters;
        const result = {
            dimensions: { valid: true, issues: [] },
            fileSize: { valid: true, issues: [] },
            format: { valid: true, issues: [] },
            aspectRatio: { valid: true, issues: [] }
        };

        // Check dimensions
        if (image.bitmap.width < standards.minWidth) {
            result.dimensions.valid = false;
            result.dimensions.issues.push(`Width too small: ${image.bitmap.width}px (minimum: ${standards.minWidth}px)`);
        }
        if (image.bitmap.width > standards.maxWidth) {
            result.dimensions.valid = false;
            result.dimensions.issues.push(`Width too large: ${image.bitmap.width}px (maximum: ${standards.maxWidth}px)`);
        }
        if (image.bitmap.height < standards.minHeight) {
            result.dimensions.valid = false;
            result.dimensions.issues.push(`Height too small: ${image.bitmap.height}px (minimum: ${standards.minHeight}px)`);
        }
        if (image.bitmap.height > standards.maxHeight) {
            result.dimensions.valid = false;
            result.dimensions.issues.push(`Height too large: ${image.bitmap.height}px (maximum: ${standards.maxHeight}px)`);
        }

        // Check aspect ratio
        if (standards.preferredAspectRatio) {
            const aspectRatio = image.bitmap.width / image.bitmap.height;
            const tolerance = 0.1;
            if (Math.abs(aspectRatio - standards.preferredAspectRatio) > tolerance) {
                result.aspectRatio.valid = false;
                result.aspectRatio.issues.push(`Aspect ratio ${aspectRatio.toFixed(2)} deviates from preferred ${standards.preferredAspectRatio}`);
            }
        }

        // Estimate file size (rough calculation)
        const estimatedSize = image.bitmap.width * image.bitmap.height * 4; // RGBA
        if (estimatedSize > this.options.maxFileSize) {
            result.fileSize.valid = false;
            result.fileSize.issues.push(`Estimated file size too large: ${(estimatedSize / 1024).toFixed(1)}KB`);
        }

        return result;
    }

    /**
     * Perform quality analysis
     */
    async performQualityAnalysis(image) {
        const result = {
            colorDiversity: this.analyzeColorDiversity(image),
            edgeQuality: this.analyzeEdgeQuality(image),
            noiseLevel: this.analyzeNoiseLevel(image),
            compressionArtifacts: this.analyzeCompressionArtifacts(image),
            overallQuality: 0
        };

        // Calculate overall quality score
        result.overallQuality = (
            result.colorDiversity.score * 0.3 +
            result.edgeQuality.score * 0.3 +
            (1 - result.noiseLevel.score) * 0.2 +
            (1 - result.compressionArtifacts.score) * 0.2
        );

        return result;
    }

    /**
     * Perform content analysis
     */
    async performContentAnalysis(image) {
        const result = {
            transparencyUsage: this.analyzeTransparencyUsage(image),
            colorPalette: this.analyzeColorPalette(image),
            pixelDistribution: this.analyzePixelDistribution(image),
            contentDensity: this.analyzeContentDensity(image)
        };

        return result;
    }

    /**
     * Analyze color diversity
     */
    analyzeColorDiversity(image) {
        const colors = new Set();
        let totalPixels = 0;
        let coloredPixels = 0;

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            const r = image.bitmap.data[idx];
            const g = image.bitmap.data[idx + 1];
            const b = image.bitmap.data[idx + 2];
            const a = image.bitmap.data[idx + 3];

            totalPixels++;

            if (a > 0) {
                coloredPixels++;
                const colorKey = `${r},${g},${b}`;
                colors.add(colorKey);
            }
        });

        const uniqueColors = colors.size;
        const colorRatio = uniqueColors / coloredPixels;

        // Score based on color diversity (0-1, higher is better)
        let score = Math.min(uniqueColors / 256, 1); // Max 256 colors for good score

        if (uniqueColors < 8) score *= 0.5; // Too few colors
        if (uniqueColors > 512) score *= 0.8; // Too many colors (potential noise)

        return {
            uniqueColors: uniqueColors,
            totalPixels: totalPixels,
            coloredPixels: coloredPixels,
            colorRatio: colorRatio,
            score: score
        };
    }

    /**
     * Analyze edge quality
     */
    analyzeEdgeQuality(image) {
        // Simple edge detection using gradient analysis
        let edgePixels = 0;
        let totalEdges = 0;

        for (let y = 1; y < image.bitmap.height - 1; y++) {
            for (let x = 1; x < image.bitmap.width - 1; x++) {
                const idx = (y * image.bitmap.width + x) * 4;
                const alpha = image.bitmap.data[idx + 3];

                if (alpha > 0) {
                    // Check neighboring pixels for alpha differences
                    const neighbors = [
                        ((y - 1) * image.bitmap.width + x) * 4,
                        ((y + 1) * image.bitmap.width + x) * 4,
                        (y * image.bitmap.width + (x - 1)) * 4,
                        (y * image.bitmap.width + (x + 1)) * 4
                    ];

                    let edgeStrength = 0;
                    for (const neighborIdx of neighbors) {
                        const neighborAlpha = image.bitmap.data[neighborIdx + 3];
                        edgeStrength += Math.abs(alpha - neighborAlpha);
                    }

                    if (edgeStrength > 50) { // Threshold for edge detection
                        edgePixels++;
                        totalEdges += edgeStrength;
                    }
                }
            }
        }

        // Score based on edge quality (0-1, higher is better)
        const averageEdgeStrength = totalEdges / Math.max(edgePixels, 1);
        let score = Math.min(averageEdgeStrength / 255, 1);

        if (edgePixels < 10) score *= 0.3; // Too few edges (blurry)
        if (averageEdgeStrength > 200) score *= 0.7; // Too sharp (potential aliasing)

        return {
            edgePixels: edgePixels,
            averageEdgeStrength: averageEdgeStrength,
            score: score
        };
    }

    /**
     * Analyze noise level
     */
    analyzeNoiseLevel(image) {
        // Simple noise detection using pixel variance
        let totalVariance = 0;
        let sampleCount = 0;

        // Sample every 4th pixel for performance
        for (let y = 0; y < image.bitmap.height; y += 4) {
            for (let x = 0; x < image.bitmap.width; x += 4) {
                const idx = (y * image.bitmap.width + x) * 4;
                const alpha = image.bitmap.data[idx + 3];

                if (alpha > 0) {
                    const r = image.bitmap.data[idx];
                    const g = image.bitmap.data[idx + 1];
                    const b = image.bitmap.data[idx + 2];

                    // Check neighboring pixels for variance
                    if (x + 1 < image.bitmap.width && y + 1 < image.bitmap.height) {
                        const neighborIdx = ((y + 1) * image.bitmap.width + (x + 1)) * 4;
                        const nr = image.bitmap.data[neighborIdx];
                        const ng = image.bitmap.data[neighborIdx + 1];
                        const nb = image.bitmap.data[neighborIdx + 2];

                        const variance = (
                            Math.pow(r - nr, 2) +
                            Math.pow(g - ng, 2) +
                            Math.pow(b - nb, 2)
                        ) / 3;

                        totalVariance += variance;
                        sampleCount++;
                    }
                }
            }
        }

        const averageVariance = totalVariance / Math.max(sampleCount, 1);
        const noiseLevel = Math.sqrt(averageVariance);

        // Score based on noise level (0-1, lower noise is better)
        const score = Math.max(0, 1 - (noiseLevel / 50)); // Normalize to 0-50 range

        return {
            averageVariance: averageVariance,
            noiseLevel: noiseLevel,
            sampleCount: sampleCount,
            score: score
        };
    }

    /**
     * Analyze compression artifacts
     */
    analyzeCompressionArtifacts(image) {
        // Simple artifact detection using pattern analysis
        let artifactScore = 0;
        let blockCount = 0;

        // Check for 8x8 block artifacts (common in JPEG compression)
        for (let y = 0; y < image.bitmap.height - 8; y += 8) {
            for (let x = 0; x < image.bitmap.width - 8; x += 8) {
                let blockVariance = 0;

                // Calculate variance within 8x8 block
                for (let by = 0; by < 8; by++) {
                    for (let bx = 0; bx < 8; bx++) {
                        const idx = ((y + by) * image.bitmap.width + (x + bx)) * 4;
                        const r = image.bitmap.data[idx];
                        const g = image.bitmap.data[idx + 1];
                        const b = image.bitmap.data[idx + 2];

                        // Simple variance calculation
                        blockVariance += (r + g + b) / 3;
                    }
                }

                blockVariance /= 64; // Average

                // Check for block uniformity (artifact indicator)
                if (blockVariance < 10) { // Very uniform block
                    artifactScore += 0.1;
                    blockCount++;
                }
            }
        }

        const finalArtifactScore = Math.min(artifactScore / Math.max(blockCount, 1), 1);

        return {
            artifactScore: finalArtifactScore,
            blockCount: blockCount,
            score: 1 - finalArtifactScore // Invert for quality score
        };
    }

    /**
     * Analyze transparency usage
     */
    analyzeTransparencyUsage(image) {
        let transparentPixels = 0;
        let semiTransparentPixels = 0;
        let totalPixels = image.bitmap.width * image.bitmap.height;

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            const alpha = image.bitmap.data[idx + 3];

            if (alpha === 0) {
                transparentPixels++;
            } else if (alpha < 255) {
                semiTransparentPixels++;
            }
        });

        const transparencyRatio = transparentPixels / totalPixels;
        const semiTransparencyRatio = semiTransparentPixels / totalPixels;

        return {
            transparentPixels: transparentPixels,
            semiTransparentPixels: semiTransparentPixels,
            totalPixels: totalPixels,
            transparencyRatio: transparencyRatio,
            semiTransparencyRatio: semiTransparencyRatio
        };
    }

    /**
     * Analyze color palette
     */
    analyzeColorPalette(image) {
        const palette = new Map();
        let totalColoredPixels = 0;

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            const alpha = image.bitmap.data[idx + 3];

            if (alpha > 0) {
                const r = image.bitmap.data[idx];
                const g = image.bitmap.data[idx + 1];
                const b = image.bitmap.data[idx + 2];
                const colorKey = `${r},${g},${b}`;

                palette.set(colorKey, (palette.get(colorKey) || 0) + 1);
                totalColoredPixels++;
            }
        });

        // Sort by frequency
        const sortedPalette = Array.from(palette.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10 colors

        return {
            uniqueColors: palette.size,
            dominantColors: sortedPalette,
            totalColoredPixels: totalColoredPixels
        };
    }

    /**
     * Analyze pixel distribution
     */
    analyzePixelDistribution(image) {
        const distribution = {
            top: 0, bottom: 0, left: 0, right: 0,
            center: 0, corners: 0
        };

        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const margin = Math.min(image.bitmap.width, image.bitmap.height) * 0.1;

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            const alpha = image.bitmap.data[idx + 3];

            if (alpha > 0) {
                // Check regions
                if (y < margin) distribution.top++;
                if (y > image.bitmap.height - margin) distribution.bottom++;
                if (x < margin) distribution.left++;
                if (x > image.bitmap.width - margin) distribution.right++;

                // Center region
                if (Math.abs(x - centerX) < margin && Math.abs(y - centerY) < margin) {
                    distribution.center++;
                }

                // Corners
                const isCorner = (
                    (x < margin || x > image.bitmap.width - margin) &&
                    (y < margin || y > image.bitmap.height - margin)
                );
                if (isCorner) distribution.corners++;
            }
        });

        return distribution;
    }

    /**
     * Analyze content density
     */
    analyzeContentDensity(image) {
        let contentPixels = 0;
        let edgePixels = 0;
        const totalPixels = image.bitmap.width * image.bitmap.height;

        // Count content pixels and edge pixels
        for (let y = 0; y < image.bitmap.height; y++) {
            for (let x = 0; x < image.bitmap.width; x++) {
                const idx = (y * image.bitmap.width + x) * 4;
                const alpha = image.bitmap.data[idx + 3];

                if (alpha > 0) {
                    contentPixels++;

                    // Check if it's an edge pixel
                    const isEdge = (
                        x === 0 || x === image.bitmap.width - 1 ||
                        y === 0 || y === image.bitmap.height - 1 ||
                        this.isEdgePixel(image, x, y)
                    );

                    if (isEdge) edgePixels++;
                }
            }
        }

        const density = contentPixels / totalPixels;
        const edgeRatio = edgePixels / Math.max(contentPixels, 1);

        return {
            contentPixels: contentPixels,
            edgePixels: edgePixels,
            totalPixels: totalPixels,
            density: density,
            edgeRatio: edgeRatio
        };
    }

    /**
     * Check if pixel is an edge pixel
     */
    isEdgePixel(image, x, y) {
        const idx = (y * image.bitmap.width + x) * 4;
        const alpha = image.bitmap.data[idx + 3];

        // Check neighboring pixels
        const neighbors = [
            [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
        ];

        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < image.bitmap.width && ny >= 0 && ny < image.bitmap.height) {
                const nIdx = (ny * image.bitmap.width + nx) * 4;
                const nAlpha = image.bitmap.data[nIdx + 3];

                if (Math.abs(alpha - nAlpha) > 100) {
                    return true; // Significant alpha difference indicates edge
                }
            }
        }

        return false;
    }

    /**
     * Calculate overall score
     */
    calculateOverallScore(basicResult, qualityResult, contentResult, category) {
        let score = 0;
        let totalWeight = 0;

        // Basic validation (40% weight)
        const basicValid = Object.values(basicResult).every(r => r.valid);
        score += (basicValid ? 1 : 0.5) * 0.4;
        totalWeight += 0.4;

        // Quality metrics (35% weight)
        score += qualityResult.overallQuality * 0.35;
        totalWeight += 0.35;

        // Content analysis (25% weight)
        const contentScore = this.calculateContentScore(contentResult, category);
        score += contentScore * 0.25;
        totalWeight += 0.25;

        return score / totalWeight;
    }

    /**
     * Calculate content score
     */
    calculateContentScore(contentResult, category) {
        const standards = this.spriteStandards[category] || this.spriteStandards.characters;

        let score = 1.0;

        // Check transparency usage
        if (standards.transparencyRequired && contentResult.transparencyUsage.transparencyRatio < 0.1) {
            score *= 0.8; // Should have more transparency
        }

        // Check color palette size
        if (contentResult.colorPalette.uniqueColors > standards.maxColors) {
            score *= 0.9; // Too many colors
        }

        // Check content density
        if (contentResult.contentDensity.density < 0.1) {
            score *= 0.7; // Too sparse
        } else if (contentResult.contentDensity.density > 0.9) {
            score *= 0.8; // Too dense
        }

        return score;
    }

    /**
     * Generate issues list
     */
    generateIssuesList(basicResult, qualityResult, contentResult) {
        const issues = [];

        // Basic validation issues
        for (const [type, result] of Object.entries(basicResult)) {
            if (!result.valid) {
                for (const issue of result.issues) {
                    issues.push({
                        type: type,
                        severity: this.getIssueSeverity(type),
                        message: issue
                    });
                }
            }
        }

        // Quality issues
        if (qualityResult.overallQuality < 0.7) {
            issues.push({
                type: 'quality',
                severity: 'medium',
                message: `Low overall quality score: ${(qualityResult.overallQuality * 100).toFixed(1)}%`
            });
        }

        if (qualityResult.noiseLevel.score > 0.3) {
            issues.push({
                type: 'noise',
                severity: 'medium',
                message: `High noise level detected: ${qualityResult.noiseLevel.noiseLevel.toFixed(2)}`
            });
        }

        // Content issues
        if (contentResult.contentDensity.density < 0.05) {
            issues.push({
                type: 'content',
                severity: 'high',
                message: 'Sprite appears to be mostly empty or transparent'
            });
        }

        return issues;
    }

    /**
     * Get issue severity
     */
    getIssueSeverity(type) {
        const severityMap = {
            dimensions: 'high',
            file_size: 'medium',
            format: 'high',
            aspect_ratio: 'low',
            quality: 'medium',
            noise: 'medium',
            content: 'high',
            transparency: 'medium',
            color_palette: 'low'
        };

        return severityMap[type] || 'medium';
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(issues, category) {
        const recommendations = [];

        for (const issue of issues) {
            switch (issue.type) {
                case 'dimensions':
                    if (issue.message.includes('too small')) {
                        recommendations.push('Increase sprite resolution for better quality');
                    } else if (issue.message.includes('too large')) {
                        recommendations.push('Reduce sprite resolution to optimize performance');
                    }
                    break;

                case 'quality':
                    recommendations.push('Apply sharpening and contrast enhancement');
                    recommendations.push('Reduce noise and compression artifacts');
                    break;

                case 'noise':
                    recommendations.push('Apply noise reduction filter');
                    recommendations.push('Use higher quality source images');
                    break;

                case 'content':
                    recommendations.push('Add more visual content to the sprite');
                    recommendations.push('Ensure proper alpha channel usage');
                    break;

                case 'transparency':
                    recommendations.push('Review and optimize transparency usage');
                    break;
            }
        }

        // Category-specific recommendations
        const standards = this.spriteStandards[category];
        if (standards) {
            if (standards.transparencyRequired) {
                recommendations.push('Ensure proper transparency for game integration');
            }
        }

        return [...new Set(recommendations)]; // Remove duplicates
    }

    /**
     * Update validation statistics
     */
    updateValidationStatistics(result) {
        this.validationResults.totalSpritesValidated++;

        if (result.passed) {
            this.validationResults.passedValidations++;
        } else {
            this.validationResults.failedValidations++;
        }

        // Update quality distribution
        const qualityLevel = this.getQualityLevel(result.overallScore);
        this.validationResults.qualityDistribution[qualityLevel]++;

        // Update common issues
        for (const issue of result.issues) {
            const key = `${issue.type}_${issue.severity}`;
            this.validationResults.commonIssues.set(
                key,
                (this.validationResults.commonIssues.get(key) || 0) + 1
            );
        }
    }

    /**
     * Get quality level
     */
    getQualityLevel(score) {
        if (score >= this.qualityThresholds.excellent) return 'excellent';
        if (score >= this.qualityThresholds.good) return 'good';
        if (score >= this.qualityThresholds.acceptable) return 'acceptable';
        if (score >= this.qualityThresholds.poor) return 'poor';
        return 'unacceptable';
    }

    /**
     * Batch validate sprites
     */
    async batchValidateSprites(sprites, category = 'characters', options = {}) {
        const results = [];
        const startTime = Date.now();

        console.log(`Starting batch validation of ${sprites.length} sprites...`);

        for (let i = 0; i < sprites.length; i++) {
            const sprite = sprites[i];

            try {
                const result = await this.validateSprite(
                    sprite.image,
                    sprite.name || `sprite_${i}`,
                    category,
                    options
                );

                results.push(result);

                // Progress reporting
                if ((i + 1) % 10 === 0) {
                    console.log(`Validated ${i + 1}/${sprites.length} sprites...`);
                }

            } catch (error) {
                console.error(`Failed to validate sprite ${i}:`, error);
                results.push({
                    spriteName: sprite.name || `sprite_${i}`,
                    passed: false,
                    issues: [{ type: 'error', severity: 'critical', message: error.message }]
                });
            }
        }

        const endTime = Date.now();
        const summary = this.generateBatchSummary(results, endTime - startTime);

        console.log(`Batch validation completed in ${(endTime - startTime) / 1000}s`);
        console.log(`Results: ${summary.passedCount}/${summary.totalCount} sprites passed validation`);

        return {
            results: results,
            summary: summary
        };
    }

    /**
     * Generate batch summary
     */
    generateBatchSummary(results, totalTime) {
        const summary = {
            totalCount: results.length,
            passedCount: results.filter(r => r.passed).length,
            failedCount: results.filter(r => !r.passed).length,
            averageScore: 0,
            totalTime: totalTime,
            averageTimePerSprite: totalTime / results.length,
            qualityDistribution: { ...this.qualityThresholds },
            topIssues: []
        };

        // Calculate average score
        const totalScore = results.reduce((sum, r) => sum + r.overallScore, 0);
        summary.averageScore = totalScore / results.length;

        // Count quality levels
        summary.qualityDistribution = {
            excellent: results.filter(r => r.overallScore >= this.qualityThresholds.excellent).length,
            good: results.filter(r => r.overallScore >= this.qualityThresholds.good && r.overallScore < this.qualityThresholds.excellent).length,
            acceptable: results.filter(r => r.overallScore >= this.qualityThresholds.acceptable && r.overallScore < this.qualityThresholds.good).length,
            poor: results.filter(r => r.overallScore >= this.qualityThresholds.poor && r.overallScore < this.qualityThresholds.acceptable).length,
            unacceptable: results.filter(r => r.overallScore < this.qualityThresholds.poor).length
        };

        // Find top issues
        const issueCount = new Map();
        for (const result of results) {
            for (const issue of result.issues) {
                const key = `${issue.type}: ${issue.message}`;
                issueCount.set(key, (issueCount.get(key) || 0) + 1);
            }
        }

        summary.topIssues = Array.from(issueCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([issue, count]) => ({ issue, count }));

        return summary;
    }

    /**
     * Export validation report
     */
    async exportValidationReport(outputPath, results = null) {
        const report = {
            timestamp: new Date().toISOString(),
            systemConfig: {
                strictMode: this.options.strictMode,
                minQualityScore: this.options.minQualityScore,
                maxFileSize: this.options.maxFileSize,
                supportedFormats: this.options.supportedFormats
            },
            statistics: this.validationResults,
            spriteStandards: this.spriteStandards,
            qualityThresholds: this.qualityThresholds
        };

        if (results) {
            report.batchResults = results;
        }

        await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8');
        return outputPath;
    }

    /**
     * Get validation statistics
     */
    getValidationStatistics() {
        return { ...this.validationResults };
    }

    /**
     * Reset validation statistics
     */
    resetStatistics() {
        this.validationResults = {
            totalSpritesValidated: 0,
            passedValidations: 0,
            failedValidations: 0,
            qualityDistribution: {
                excellent: 0,
                good: 0,
                acceptable: 0,
                poor: 0,
                unacceptable: 0
            },
            commonIssues: new Map(),
            validationHistory: []
        };
    }

    /**
     * Validate sprite against custom criteria
     */
    async validateAgainstCriteria(spriteImage, criteria) {
        const result = {
            passed: true,
            score: 1.0,
            issues: []
        };

        // Check custom dimensions
        if (criteria.minWidth && spriteImage.bitmap.width < criteria.minWidth) {
            result.passed = false;
            result.score *= 0.8;
            result.issues.push(`Width below minimum: ${spriteImage.bitmap.width} < ${criteria.minWidth}`);
        }

        if (criteria.maxWidth && spriteImage.bitmap.width > criteria.maxWidth) {
            result.passed = false;
            result.score *= 0.8;
            result.issues.push(`Width above maximum: ${spriteImage.bitmap.width} > ${criteria.maxWidth}`);
        }

        // Check custom color constraints
        if (criteria.maxColors) {
            const colorCount = this.analyzeColorDiversity(spriteImage).uniqueColors;
            if (colorCount > criteria.maxColors) {
                result.passed = false;
                result.score *= 0.9;
                result.issues.push(`Too many colors: ${colorCount} > ${criteria.maxColors}`);
            }
        }

        // Check custom quality requirements
        if (criteria.minQualityScore) {
            const qualityAnalysis = await this.performQualityAnalysis(spriteImage);
            if (qualityAnalysis.overallQuality < criteria.minQualityScore) {
                result.passed = false;
                result.score *= qualityAnalysis.overallQuality;
                result.issues.push(`Quality below threshold: ${(qualityAnalysis.overallQuality * 100).toFixed(1)}% < ${(criteria.minQualityScore * 100).toFixed(1)}%`);
            }
        }

        return result;
    }
}

module.exports = SpriteValidationSystem;
