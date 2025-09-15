/**
 * Visual Quality Assessment System
 * Automated quality verification for generated sprites and assets
 */

const fs = require('fs').promises;
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');

class VisualQualityAssessor {
    constructor(options = {}) {
        this.qualityThresholds = {
            minContrastRatio: options.minContrastRatio || 4.5,
            maxColorDeviation: options.maxColorDeviation || 10,
            minEdgeSharpness: options.minEdgeSharpness || 0.3,
            maxNoiseLevel: options.maxNoiseLevel || 5,
            minResolution: options.minResolution || 32,
            maxScalingArtifacts: options.maxScalingArtifacts || 0.1,
            ...options.qualityThresholds
        };

        this.assessmentResults = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the quality assessment system
     */
    async initialize() {
        this.isInitialized = true;
        console.log('Visual quality assessment system initialized');
    }

    /**
     * Assess sprite consistency across generators
     */
    async assessSpriteConsistency(sprites, options = {}) {
        const { styleReference, colorPalette, dimensions } = options;
        const results = {
            overallScore: 0,
            consistencyScore: 0,
            styleAdherence: 0,
            colorConsistency: 0,
            dimensionConsistency: 0,
            issues: [],
            recommendations: []
        };

        try {
            // Analyze style consistency
            if (styleReference) {
                const styleResults = await this.analyzeStyleConsistency(sprites, styleReference);
                results.styleAdherence = styleResults.score;
                results.issues.push(...styleResults.issues);
            }

            // Analyze color consistency
            if (colorPalette) {
                const colorResults = await this.analyzeColorConsistency(sprites, colorPalette);
                results.colorConsistency = colorResults.score;
                results.issues.push(...colorResults.issues);
            }

            // Analyze dimension consistency
            if (dimensions) {
                const dimensionResults = await this.analyzeDimensionConsistency(sprites, dimensions);
                results.dimensionConsistency = dimensionResults.score;
                results.issues.push(...dimensionResults.issues);
            }

            // Calculate overall consistency score
            const scores = [results.styleAdherence, results.colorConsistency, results.dimensionConsistency]
                .filter(score => score > 0);

            results.consistencyScore = scores.length > 0 ?
                scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

            results.overallScore = results.consistencyScore;

            // Generate recommendations
            results.recommendations = this.generateConsistencyRecommendations(results);

        } catch (error) {
            console.error('Failed to assess sprite consistency:', error);
            results.issues.push(`Assessment failed: ${error.message}`);
        }

        this.assessmentResults.push({
            type: 'consistency',
            timestamp: new Date().toISOString(),
            results
        });

        return results;
    }

    /**
     * Analyze style consistency
     */
    async analyzeStyleConsistency(sprites, styleReference) {
        const results = { score: 0, issues: [] };

        try {
            // Compare each sprite against the style reference
            const comparisons = [];

            for (const sprite of sprites) {
                const comparison = await this.compareSpriteToReference(sprite, styleReference);
                comparisons.push(comparison);
            }

            // Calculate average style adherence
            const totalScore = comparisons.reduce((sum, comp) => sum + comp.score, 0);
            results.score = totalScore / comparisons.length;

            // Identify style inconsistencies
            comparisons.forEach((comp, index) => {
                if (comp.score < 0.7) {
                    results.issues.push(`Sprite ${index + 1} has low style adherence (${(comp.score * 100).toFixed(1)}%)`);
                }
            });

        } catch (error) {
            results.issues.push(`Style analysis failed: ${error.message}`);
        }

        return results;
    }

    /**
     * Analyze color consistency
     */
    async analyzeColorConsistency(sprites, colorPalette) {
        const results = { score: 0, issues: [] };

        try {
            const colorAnalyses = [];

            for (const sprite of sprites) {
                const analysis = await this.analyzeSpriteColors(sprite, colorPalette);
                colorAnalyses.push(analysis);
            }

            // Calculate average color consistency
            const totalScore = colorAnalyses.reduce((sum, analysis) => sum + analysis.consistencyScore, 0);
            results.score = totalScore / colorAnalyses.length;

            // Identify color issues
            colorAnalyses.forEach((analysis, index) => {
                if (analysis.consistencyScore < 0.8) {
                    results.issues.push(`Sprite ${index + 1} has inconsistent colors (${(analysis.consistencyScore * 100).toFixed(1)}%)`);
                }

                if (analysis.outOfPaletteColors > 0) {
                    results.issues.push(`Sprite ${index + 1} has ${analysis.outOfPaletteColors} colors outside the palette`);
                }
            });

        } catch (error) {
            results.issues.push(`Color analysis failed: ${error.message}`);
        }

        return results;
    }

    /**
     * Analyze dimension consistency
     */
    async analyzeDimensionConsistency(sprites, expectedDimensions) {
        const results = { score: 0, issues: [] };

        try {
            let consistentCount = 0;

            for (const sprite of sprites) {
                const dimensions = await this.getSpriteDimensions(sprite);
                const isConsistent = this.checkDimensionConsistency(dimensions, expectedDimensions);

                if (isConsistent) {
                    consistentCount++;
                } else {
                    results.issues.push(`Sprite dimensions ${dimensions.width}x${dimensions.height} don't match expected ${expectedDimensions.width}x${expectedDimensions.height}`);
                }
            }

            results.score = consistentCount / sprites.length;

        } catch (error) {
            results.issues.push(`Dimension analysis failed: ${error.message}`);
        }

        return results;
    }

    /**
     * Verify color accuracy
     */
    async verifyColorAccuracy(imageData, referenceColors, options = {}) {
        const { tolerance = this.qualityThresholds.maxColorDeviation } = options;
        const results = {
            accuracy: 0,
            deviations: [],
            passed: false,
            issues: []
        };

        try {
            const colors = await this.extractColors(imageData);
            let totalDeviation = 0;
            let colorCount = 0;

            for (const color of colors) {
                const closestReference = this.findClosestColor(color, referenceColors);
                const deviation = this.calculateColorDeviation(color, closestReference);

                results.deviations.push({
                    original: color,
                    reference: closestReference,
                    deviation
                });

                totalDeviation += deviation;
                colorCount++;

                if (deviation > tolerance) {
                    results.issues.push(`Color ${this.colorToString(color)} deviates by ${deviation.toFixed(2)} from reference`);
                }
            }

            results.accuracy = colorCount > 0 ? 1 - (totalDeviation / colorCount / 100) : 0;
            results.passed = results.deviations.every(d => d.deviation <= tolerance);

        } catch (error) {
            results.issues.push(`Color accuracy verification failed: ${error.message}`);
        }

        return results;
    }

    /**
     * Check scaling and resolution quality
     */
    async checkScalingQuality(originalImage, scaledImage, scaleFactor, options = {}) {
        const { maxArtifacts = this.qualityThresholds.maxScalingArtifacts } = options;
        const results = {
            quality: 0,
            artifacts: 0,
            sharpness: 0,
            passed: false,
            issues: []
        };

        try {
            // Analyze scaling artifacts
            const artifactAnalysis = await this.analyzeScalingArtifacts(originalImage, scaledImage, scaleFactor);
            results.artifacts = artifactAnalysis.level;

            // Analyze edge sharpness
            const sharpnessAnalysis = await this.analyzeEdgeSharpness(scaledImage);
            results.sharpness = sharpnessAnalysis.score;

            // Calculate overall quality
            results.quality = (results.sharpness + (1 - results.artifacts)) / 2;
            results.passed = results.artifacts <= maxArtifacts && results.sharpness >= this.qualityThresholds.minEdgeSharpness;

            if (results.artifacts > maxArtifacts) {
                results.issues.push(`High scaling artifacts detected (${(results.artifacts * 100).toFixed(1)}% above threshold)`);
            }

            if (results.sharpness < this.qualityThresholds.minEdgeSharpness) {
                results.issues.push(`Low edge sharpness (${(results.sharpness * 100).toFixed(1)}% below threshold)`);
            }

        } catch (error) {
            results.issues.push(`Scaling quality check failed: ${error.message}`);
        }

        return results;
    }

    /**
     * Analyze sprite colors
     */
    async analyzeSpriteColors(sprite, colorPalette) {
        const results = {
            consistencyScore: 0,
            paletteCoverage: 0,
            outOfPaletteColors: 0,
            dominantColors: [],
            colorDistribution: new Map()
        };

        try {
            const colors = await this.extractColors(sprite);
            let inPaletteCount = 0;

            for (const color of colors) {
                const isInPalette = colorPalette.some(paletteColor =>
                    this.calculateColorDeviation(color, paletteColor) <= this.qualityThresholds.maxColorDeviation
                );

                if (isInPalette) {
                    inPaletteCount++;
                } else {
                    results.outOfPaletteColors++;
                }

                // Track color distribution
                const colorKey = this.colorToString(color);
                results.colorDistribution.set(colorKey, (results.colorDistribution.get(colorKey) || 0) + 1);
            }

            results.paletteCoverage = colors.length > 0 ? inPaletteCount / colors.length : 0;
            results.consistencyScore = results.paletteCoverage;

            // Extract dominant colors
            results.dominantColors = this.extractDominantColors(results.colorDistribution, 5);

        } catch (error) {
            console.error('Failed to analyze sprite colors:', error);
        }

        return results;
    }

    /**
     * Extract colors from image data
     */
    async extractColors(imageData) {
        const colors = new Set();

        try {
            let buffer;
            if (Buffer.isBuffer(imageData)) {
                buffer = imageData;
            } else if (imageData.data) {
                buffer = Buffer.from(imageData.data);
            } else {
                // Assume it's a file path
                buffer = await fs.readFile(imageData);
            }

            // Use sharp to extract colors
            const image = sharp(buffer);
            const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

            // Sample colors (to avoid processing every pixel)
            const sampleRate = Math.max(1, Math.floor(data.length / info.channels / 1000));

            for (let i = 0; i < data.length; i += info.channels * sampleRate) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = info.channels === 4 ? data[i + 3] : 255;

                // Skip transparent pixels
                if (a > 128) {
                    colors.add(`${r},${g},${b}`);
                }
            }

        } catch (error) {
            console.error('Failed to extract colors:', error);
        }

        return Array.from(colors).map(colorStr => {
            const [r, g, b] = colorStr.split(',').map(Number);
            return { r, g, b };
        });
    }

    /**
     * Get sprite dimensions
     */
    async getSpriteDimensions(sprite) {
        try {
            let buffer;
            if (Buffer.isBuffer(sprite)) {
                buffer = sprite;
            } else if (sprite.data) {
                buffer = Buffer.from(sprite.data);
            } else {
                buffer = await fs.readFile(sprite);
            }

            const metadata = await sharp(buffer).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                aspectRatio: metadata.width / metadata.height
            };
        } catch (error) {
            console.error('Failed to get sprite dimensions:', error);
            return { width: 0, height: 0, aspectRatio: 0 };
        }
    }

    /**
     * Check dimension consistency
     */
    checkDimensionConsistency(actual, expected) {
        const tolerance = 0.05; // 5% tolerance
        const widthDiff = Math.abs(actual.width - expected.width) / expected.width;
        const heightDiff = Math.abs(actual.height - expected.height) / expected.height;

        return widthDiff <= tolerance && heightDiff <= tolerance;
    }

    /**
     * Compare sprite to reference
     */
    async compareSpriteToReference(sprite, reference) {
        // Simplified style comparison
        // In a real implementation, this would use more sophisticated style analysis
        return {
            score: Math.random() * 0.4 + 0.6, // Mock score between 0.6-1.0
            differences: []
        };
    }

    /**
     * Find closest color in palette
     */
    findClosestColor(color, palette) {
        let closest = palette[0];
        let minDistance = this.calculateColorDeviation(color, closest);

        for (const paletteColor of palette) {
            const distance = this.calculateColorDeviation(color, paletteColor);
            if (distance < minDistance) {
                minDistance = distance;
                closest = paletteColor;
            }
        }

        return closest;
    }

    /**
     * Calculate color deviation
     */
    calculateColorDeviation(color1, color2) {
        const rDiff = color1.r - color2.r;
        const gDiff = color1.g - color2.g;
        const bDiff = color1.b - color2.b;

        // Euclidean distance in RGB space
        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    }

    /**
     * Convert color to string
     */
    colorToString(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    /**
     * Extract dominant colors
     */
    extractDominantColors(colorDistribution, count) {
        return Array.from(colorDistribution.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([colorStr]) => {
                const [r, g, b] = colorStr.split(',').map(Number);
                return { r, g, b };
            });
    }

    /**
     * Analyze scaling artifacts
     */
    async analyzeScalingArtifacts(original, scaled, scaleFactor) {
        // Simplified artifact analysis
        // In a real implementation, this would detect aliasing, blurring, etc.
        return {
            level: Math.random() * 0.2, // Mock artifact level
            types: []
        };
    }

    /**
     * Analyze edge sharpness
     */
    async analyzeEdgeSharpness(image) {
        // Simplified sharpness analysis
        // In a real implementation, this would use edge detection algorithms
        return {
            score: Math.random() * 0.4 + 0.6 // Mock sharpness score
        };
    }

    /**
     * Generate consistency recommendations
     */
    generateConsistencyRecommendations(results) {
        const recommendations = [];

        if (results.consistencyScore < 0.8) {
            recommendations.push('Consider creating a unified style guide for all generators');
        }

        if (results.colorConsistency < 0.8) {
            recommendations.push('Standardize color palettes across all sprite generators');
        }

        if (results.dimensionConsistency < 0.9) {
            recommendations.push('Implement consistent dimension standards for all sprites');
        }

        if (results.styleAdherence < 0.7) {
            recommendations.push('Review and update generator algorithms to better match style references');
        }

        return recommendations;
    }

    /**
     * Generate quality metrics
     */
    async generateQualityMetrics(sprites, options = {}) {
        const metrics = {
            timestamp: new Date().toISOString(),
            spriteCount: sprites.length,
            averageQuality: 0,
            qualityDistribution: {},
            issues: [],
            recommendations: []
        };

        try {
            const qualityScores = [];

            for (const sprite of sprites) {
                const quality = await this.assessIndividualQuality(sprite, options);
                qualityScores.push(quality.score);

                // Track quality distribution
                const bucket = Math.floor(quality.score * 10) / 10;
                metrics.qualityDistribution[bucket] = (metrics.qualityDistribution[bucket] || 0) + 1;

                if (quality.issues.length > 0) {
                    metrics.issues.push(...quality.issues.map(issue => `${sprite.name}: ${issue}`));
                }
            }

            metrics.averageQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;

            // Generate recommendations based on metrics
            if (metrics.averageQuality < 0.7) {
                metrics.recommendations.push('Overall sprite quality needs improvement');
            }

            if (Object.keys(metrics.qualityDistribution).length > 3) {
                metrics.recommendations.push('Quality is inconsistent across sprites - consider standardization');
            }

        } catch (error) {
            metrics.issues.push(`Quality metrics generation failed: ${error.message}`);
        }

        return metrics;
    }

    /**
     * Assess individual sprite quality
     */
    async assessIndividualQuality(sprite, options = {}) {
        const quality = {
            score: 0,
            contrast: 0,
            sharpness: 0,
            noise: 0,
            issues: []
        };

        try {
            // Analyze contrast
            quality.contrast = await this.analyzeContrast(sprite);

            // Analyze sharpness
            quality.sharpness = await this.analyzeSharpness(sprite);

            // Analyze noise
            quality.noise = await this.analyzeNoise(sprite);

            // Calculate overall score
            quality.score = (quality.contrast + quality.sharpness + (1 - quality.noise)) / 3;

            // Check against thresholds
            if (quality.contrast < this.qualityThresholds.minContrastRatio / 10) {
                quality.issues.push('Low contrast ratio');
            }

            if (quality.sharpness < this.qualityThresholds.minEdgeSharpness) {
                quality.issues.push('Low edge sharpness');
            }

            if (quality.noise > this.qualityThresholds.maxNoiseLevel / 10) {
                quality.issues.push('High noise level');
            }

        } catch (error) {
            quality.issues.push(`Quality assessment failed: ${error.message}`);
        }

        return quality;
    }

    /**
     * Analyze contrast
     */
    async analyzeContrast(sprite) {
        // Simplified contrast analysis
        return Math.random() * 0.4 + 0.6; // Mock contrast score
    }

    /**
     * Analyze sharpness
     */
    async analyzeSharpness(sprite) {
        // Simplified sharpness analysis
        return Math.random() * 0.3 + 0.5; // Mock sharpness score
    }

    /**
     * Analyze noise
     */
    async analyzeNoise(sprite) {
        // Simplified noise analysis
        return Math.random() * 0.2; // Mock noise level
    }

    /**
     * Generate comprehensive quality report
     */
    async generateQualityReport(sprites, options = {}) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {},
            detailed: [],
            recommendations: []
        };

        try {
            // Generate quality metrics
            const metrics = await this.generateQualityMetrics(sprites, options);
            report.summary = {
                totalSprites: metrics.spriteCount,
                averageQuality: metrics.averageQuality,
                qualityDistribution: metrics.qualityDistribution,
                totalIssues: metrics.issues.length
            };

            // Generate detailed assessments
            for (const sprite of sprites) {
                const assessment = await this.assessIndividualQuality(sprite, options);
                report.detailed.push({
                    name: sprite.name || 'Unknown',
                    quality: assessment
                });
            }

            // Generate recommendations
            report.recommendations = this.generateQualityRecommendations(report);

        } catch (error) {
            report.summary.error = error.message;
        }

        return report;
    }

    /**
     * Generate quality recommendations
     */
    generateQualityRecommendations(report) {
        const recommendations = [];

        if (report.summary.averageQuality < 0.7) {
            recommendations.push('Implement quality enhancement algorithms for low-quality sprites');
        }

        if (report.summary.totalIssues > report.summary.totalSprites * 0.5) {
            recommendations.push('Review and update sprite generation algorithms to reduce common issues');
        }

        if (Object.keys(report.summary.qualityDistribution).length > 3) {
            recommendations.push('Standardize quality control parameters across all generators');
        }

        return recommendations;
    }

    /**
     * Get assessment statistics
     */
    getStatistics() {
        const stats = {
            totalAssessments: this.assessmentResults.length,
            averageScore: 0,
            assessmentTypes: new Map(),
            recentIssues: []
        };

        if (stats.totalAssessments > 0) {
            let totalScore = 0;

            for (const assessment of this.assessmentResults) {
                totalScore += assessment.results.overallScore || 0;
                stats.assessmentTypes.set(assessment.type, (stats.assessmentTypes.get(assessment.type) || 0) + 1);
                stats.recentIssues.push(...assessment.results.issues);
            }

            stats.averageScore = totalScore / stats.totalAssessments;
            stats.recentIssues = stats.recentIssues.slice(-10); // Last 10 issues
        }

        return stats;
    }
}

module.exports = VisualQualityAssessor;
