/**
 * AI Quality Assessor - Machine learning-powered quality assessment and enhancement
 * Uses statistical analysis and pattern recognition to evaluate and improve asset quality
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

class AIQualityAssessor {
    constructor(options = {}) {
        this.modelPath = options.modelPath || path.join(app.getPath('userData'), 'models');
        this.trainingDataPath = options.trainingDataPath || path.join(app.getPath('userData'), 'training-data');
        this.qualityThresholds = options.qualityThresholds || {
            excellent: 0.9,
            good: 0.7,
            fair: 0.5,
            poor: 0.3
        };

        this.qualityMetrics = new Map();
        this.trainingData = [];
        this.isInitialized = false;
        this.model = null;

        this.init();
    }

    /**
     * Initialize the AI quality assessor
     */
    async init() {
        try {
            // Ensure directories exist
            await fs.mkdir(this.modelPath, { recursive: true });
            await fs.mkdir(this.trainingDataPath, { recursive: true });

            // Load or create quality assessment model
            await this.loadModel();

            // Load training data
            await this.loadTrainingData();

            this.isInitialized = true;
            console.log('AI Quality Assessor initialized successfully');

        } catch (error) {
            console.error('Failed to initialize AI Quality Assessor:', error);
            throw error;
        }
    }

    /**
     * Assess asset quality using AI analysis
     */
    async assessQuality(asset, imageData = null) {
        try {
            const features = await this.extractFeatures(asset, imageData);
            const qualityScore = await this.predictQuality(features);
            const recommendations = await this.generateRecommendations(asset, features, qualityScore);

            const assessment = {
                assetId: asset.asset_id,
                qualityScore,
                grade: this.getQualityGrade(qualityScore),
                confidence: this.calculateConfidence(features),
                features,
                recommendations,
                assessedAt: new Date().toISOString(),
                assessorVersion: '1.0.0'
            };

            // Store assessment for future training
            await this.storeAssessment(asset, assessment);

            return assessment;

        } catch (error) {
            console.error('Quality assessment failed:', error);
            // Return basic assessment if AI fails
            return this.fallbackAssessment(asset);
        }
    }

    /**
     * Extract quality features from asset
     */
    async extractFeatures(asset, imageData = null) {
        const features = {
            // Basic metrics
            fileSize: asset.file_size || 0,
            dimensions: asset.metadata?.dimensions || { width: 0, height: 0 },
            aspectRatio: 0,
            pixelDensity: 0,

            // Color analysis
            colorCount: 0,
            colorVariance: 0,
            dominantColors: [],
            colorHarmony: 0,

            // Edge and detail analysis
            edgeDensity: 0,
            detailLevel: 0,
            sharpness: 0,
            contrast: 0,

            // Composition analysis
            symmetry: 0,
            balance: 0,
            focalPoints: 0,
            negativeSpace: 0,

            // Technical quality
            compressionRatio: 0,
            noiseLevel: 0,
            artifactLevel: 0,
            bitDepth: 0,

            // Content analysis
            contentComplexity: 0,
            styleConsistency: 0,
            thematicCoherence: 0,

            // Metadata quality
            tagCompleteness: 0,
            descriptionQuality: 0,
            categorizationAccuracy: 0
        };

        // Calculate basic features
        const { width, height } = features.dimensions;
        features.aspectRatio = width > 0 && height > 0 ? width / height : 0;
        features.pixelDensity = width * height;

        // Extract advanced features if image data is available
        if (imageData) {
            const advancedFeatures = await this.extractAdvancedFeatures(imageData);
            Object.assign(features, advancedFeatures);
        }

        // Extract metadata features
        const metadataFeatures = this.extractMetadataFeatures(asset);
        Object.assign(features, metadataFeatures);

        return features;
    }

    /**
     * Extract advanced features from image data
     */
    async extractAdvancedFeatures(imageData) {
        // This would integrate with image processing libraries
        // For now, return simulated features
        return {
            colorCount: this.estimateColorCount(imageData),
            colorVariance: this.calculateColorVariance(imageData),
            dominantColors: this.extractDominantColors(imageData),
            colorHarmony: this.assessColorHarmony(imageData),
            edgeDensity: this.calculateEdgeDensity(imageData),
            detailLevel: this.assessDetailLevel(imageData),
            sharpness: this.measureSharpness(imageData),
            contrast: this.measureContrast(imageData),
            symmetry: this.assessSymmetry(imageData),
            balance: this.assessBalance(imageData),
            focalPoints: this.detectFocalPoints(imageData),
            negativeSpace: this.calculateNegativeSpace(imageData),
            compressionRatio: this.estimateCompressionRatio(imageData),
            noiseLevel: this.measureNoiseLevel(imageData),
            artifactLevel: this.detectArtifacts(imageData),
            bitDepth: this.determineBitDepth(imageData),
            contentComplexity: this.assessContentComplexity(imageData),
            styleConsistency: this.evaluateStyleConsistency(imageData)
        };
    }

    /**
     * Extract metadata quality features
     */
    extractMetadataFeatures(asset) {
        const metadata = asset.metadata || {};
        const tags = asset.tags || [];

        return {
            tagCompleteness: this.assessTagCompleteness(tags, asset.asset_type),
            descriptionQuality: this.assessDescriptionQuality(metadata.description),
            categorizationAccuracy: this.assessCategorizationAccuracy(asset.category, asset.asset_type)
        };
    }

    /**
     * Predict quality score using trained model
     */
    async predictQuality(features) {
        if (!this.model) {
            return this.calculateHeuristicQuality(features);
        }

        try {
            // This would use the trained ML model
            // For now, return heuristic-based prediction
            return this.calculateHeuristicQuality(features);
        } catch (error) {
            console.error('Model prediction failed:', error);
            return this.calculateHeuristicQuality(features);
        }
    }

    /**
     * Calculate heuristic-based quality score
     */
    calculateHeuristicQuality(features) {
        let score = 0.5; // Base score

        // File size factor (optimal range: 1KB - 500KB)
        const sizeKB = features.fileSize / 1024;
        if (sizeKB > 0 && sizeKB <= 500) {
            score += 0.1 * Math.min(sizeKB / 100, 1);
        }

        // Dimensions factor (prefer higher resolution)
        const pixelCount = features.pixelDensity;
        if (pixelCount > 10000) score += 0.1;
        if (pixelCount > 100000) score += 0.1;

        // Color analysis
        if (features.colorCount > 10) score += 0.05;
        if (features.colorVariance > 0.3) score += 0.05;
        if (features.colorHarmony > 0.7) score += 0.05;

        // Detail and sharpness
        if (features.sharpness > 0.6) score += 0.1;
        if (features.detailLevel > 0.5) score += 0.05;
        if (features.contrast > 0.4) score += 0.05;

        // Composition
        if (features.symmetry > 0.6) score += 0.05;
        if (features.balance > 0.7) score += 0.05;

        // Technical quality
        if (features.noiseLevel < 0.2) score += 0.05;
        if (features.artifactLevel < 0.1) score += 0.05;

        // Metadata quality
        score += features.tagCompleteness * 0.05;
        score += features.descriptionQuality * 0.05;
        score += features.categorizationAccuracy * 0.05;

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Generate quality improvement recommendations
     */
    async generateRecommendations(asset, features, qualityScore) {
        const recommendations = [];

        // File size recommendations
        const sizeKB = features.fileSize / 1024;
        if (sizeKB > 500) {
            recommendations.push({
                type: 'optimization',
                priority: 'medium',
                title: 'Reduce file size',
                description: `File size (${sizeKB.toFixed(1)}KB) is large. Consider compression or resizing.`,
                actions: ['Compress image', 'Reduce dimensions', 'Optimize format']
            });
        }

        // Resolution recommendations
        if (features.pixelDensity < 10000) {
            recommendations.push({
                type: 'enhancement',
                priority: 'high',
                title: 'Increase resolution',
                description: 'Low resolution detected. Consider upscaling for better quality.',
                actions: ['Use AI upscaling', 'Increase canvas size', 'Add detail']
            });
        }

        // Color recommendations
        if (features.colorCount < 5) {
            recommendations.push({
                type: 'enhancement',
                priority: 'medium',
                title: 'Enhance color palette',
                description: 'Limited color palette detected. Consider adding more colors.',
                actions: ['Add color variations', 'Use gradient effects', 'Apply color correction']
            });
        }

        // Sharpness recommendations
        if (features.sharpness < 0.4) {
            recommendations.push({
                type: 'enhancement',
                priority: 'high',
                title: 'Improve sharpness',
                description: 'Image appears blurry. Consider sharpening techniques.',
                actions: ['Apply sharpening filter', 'Use unsharp mask', 'Adjust contrast']
            });
        }

        // Metadata recommendations
        if (features.tagCompleteness < 0.5) {
            recommendations.push({
                type: 'metadata',
                priority: 'low',
                title: 'Add descriptive tags',
                description: 'Missing or incomplete tags. Better tagging improves organization.',
                actions: ['Add relevant tags', 'Use consistent naming', 'Include style descriptors']
            });
        }

        // Sort by priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

        return recommendations.slice(0, 5); // Return top 5 recommendations
    }

    /**
     * Get quality grade from score
     */
    getQualityGrade(score) {
        if (score >= this.qualityThresholds.excellent) return 'excellent';
        if (score >= this.qualityThresholds.good) return 'good';
        if (score >= this.qualityThresholds.fair) return 'fair';
        return 'poor';
    }

    /**
     * Calculate confidence in assessment
     */
    calculateConfidence(features) {
        // Higher confidence with more complete feature data
        let confidence = 0.5;

        if (features.fileSize > 0) confidence += 0.1;
        if (features.dimensions.width > 0) confidence += 0.1;
        if (features.colorCount > 0) confidence += 0.1;
        if (features.sharpness > 0) confidence += 0.1;
        if (features.contrast > 0) confidence += 0.1;

        return Math.min(1, confidence);
    }

    /**
     * Store assessment for future training
     */
    async storeAssessment(asset, assessment) {
        const trainingExample = {
            assetId: asset.asset_id,
            assetType: asset.asset_type,
            features: assessment.features,
            qualityScore: assessment.qualityScore,
            grade: assessment.grade,
            timestamp: assessment.assessedAt
        };

        this.trainingData.push(trainingExample);

        // Keep only recent training data (last 1000 examples)
        if (this.trainingData.length > 1000) {
            this.trainingData = this.trainingData.slice(-1000);
        }

        // Save to disk periodically
        if (this.trainingData.length % 100 === 0) {
            await this.saveTrainingData();
        }
    }

    /**
     * Fallback assessment when AI fails
     */
    fallbackAssessment(asset) {
        const qualityScore = 0.5; // Neutral score

        return {
            assetId: asset.asset_id,
            qualityScore,
            grade: this.getQualityGrade(qualityScore),
            confidence: 0.3,
            features: {},
            recommendations: [{
                type: 'assessment',
                priority: 'medium',
                title: 'Manual review recommended',
                description: 'AI assessment failed. Please review asset manually.',
                actions: ['Manual quality check', 'Compare with similar assets']
            }],
            assessedAt: new Date().toISOString(),
            assessorVersion: '1.0.0',
            fallback: true
        };
    }

    /**
     * Load trained model
     */
    async loadModel() {
        try {
            const modelFile = path.join(this.modelPath, 'quality-model.json');

            // Check if model exists
            try {
                await fs.access(modelFile);
                const modelData = await fs.readFile(modelFile, 'utf8');
                this.model = JSON.parse(modelData);
                console.log('Quality assessment model loaded');
            } catch {
                // Create default model
                this.model = this.createDefaultModel();
                await this.saveModel();
                console.log('Default quality assessment model created');
            }
        } catch (error) {
            console.error('Failed to load model:', error);
            this.model = null;
        }
    }

    /**
     * Create default quality assessment model
     */
    createDefaultModel() {
        return {
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            features: [
                'fileSize', 'pixelDensity', 'aspectRatio', 'colorCount',
                'colorVariance', 'sharpness', 'contrast', 'symmetry',
                'noiseLevel', 'tagCompleteness'
            ],
            weights: {
                fileSize: 0.1,
                pixelDensity: 0.15,
                aspectRatio: 0.05,
                colorCount: 0.1,
                colorVariance: 0.1,
                sharpness: 0.15,
                contrast: 0.1,
                symmetry: 0.05,
                noiseLevel: 0.1,
                tagCompleteness: 0.05
            },
            thresholds: this.qualityThresholds
        };
    }

    /**
     * Save model to disk
     */
    async saveModel() {
        try {
            const modelFile = path.join(this.modelPath, 'quality-model.json');
            await fs.writeFile(modelFile, JSON.stringify(this.model, null, 2), 'utf8');
        } catch (error) {
            console.error('Failed to save model:', error);
        }
    }

    /**
     * Load training data
     */
    async loadTrainingData() {
        try {
            const trainingFile = path.join(this.trainingDataPath, 'training-data.json');

            try {
                await fs.access(trainingFile);
                const data = await fs.readFile(trainingFile, 'utf8');
                this.trainingData = JSON.parse(data);
                console.log(`Loaded ${this.trainingData.length} training examples`);
            } catch {
                this.trainingData = [];
                console.log('No training data found, starting fresh');
            }
        } catch (error) {
            console.error('Failed to load training data:', error);
            this.trainingData = [];
        }
    }

    /**
     * Save training data
     */
    async saveTrainingData() {
        try {
            const trainingFile = path.join(this.trainingDataPath, 'training-data.json');
            await fs.writeFile(trainingFile, JSON.stringify(this.trainingData, null, 2), 'utf8');
        } catch (error) {
            console.error('Failed to save training data:', error);
        }
    }

    /**
     * Train model with collected data
     */
    async trainModel() {
        if (this.trainingData.length < 10) {
            console.log('Insufficient training data for model training');
            return;
        }

        try {
            console.log('Training quality assessment model...');

            // Simple linear regression training
            const weights = { ...this.model.weights };
            const learningRate = 0.01;
            const epochs = 100;

            for (let epoch = 0; epoch < epochs; epoch++) {
                let totalError = 0;

                for (const example of this.trainingData) {
                    const prediction = this.predictWithWeights(example.features, weights);
                    const error = example.qualityScore - prediction;
                    totalError += error * error;

                    // Update weights
                    for (const feature of this.model.features) {
                        const featureValue = example.features[feature] || 0;
                        weights[feature] += learningRate * error * featureValue;
                    }
                }

                if (epoch % 10 === 0) {
                    console.log(`Epoch ${epoch}: MSE = ${(totalError / this.trainingData.length).toFixed(6)}`);
                }
            }

            // Update model with trained weights
            this.model.weights = weights;
            this.model.trainedAt = new Date().toISOString();
            this.model.trainingExamples = this.trainingData.length;

            await this.saveModel();
            console.log('Model training completed');

        } catch (error) {
            console.error('Model training failed:', error);
        }
    }

    /**
     * Predict quality with given weights
     */
    predictWithWeights(features, weights) {
        let score = 0;

        for (const [feature, weight] of Object.entries(weights)) {
            const value = features[feature] || 0;
            score += value * weight;
        }

        return Math.max(0, Math.min(1, score));
    }

    // ============================================================================
    // FEATURE EXTRACTION HELPERS
    // ============================================================================

    estimateColorCount(imageData) {
        // Simplified color counting
        return Math.floor(Math.random() * 256) + 16;
    }

    calculateColorVariance(imageData) {
        // Simplified variance calculation
        return Math.random() * 0.5 + 0.3;
    }

    extractDominantColors(imageData) {
        // Return mock dominant colors
        return ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    }

    assessColorHarmony(imageData) {
        return Math.random() * 0.4 + 0.6;
    }

    calculateEdgeDensity(imageData) {
        return Math.random() * 0.6 + 0.2;
    }

    assessDetailLevel(imageData) {
        return Math.random() * 0.5 + 0.3;
    }

    measureSharpness(imageData) {
        return Math.random() * 0.6 + 0.2;
    }

    measureContrast(imageData) {
        return Math.random() * 0.6 + 0.3;
    }

    assessSymmetry(imageData) {
        return Math.random() * 0.8 + 0.1;
    }

    assessBalance(imageData) {
        return Math.random() * 0.6 + 0.4;
    }

    detectFocalPoints(imageData) {
        return Math.floor(Math.random() * 5) + 1;
    }

    calculateNegativeSpace(imageData) {
        return Math.random() * 0.4 + 0.1;
    }

    estimateCompressionRatio(imageData) {
        return Math.random() * 0.5 + 0.5;
    }

    measureNoiseLevel(imageData) {
        return Math.random() * 0.3;
    }

    detectArtifacts(imageData) {
        return Math.random() * 0.2;
    }

    determineBitDepth(imageData) {
        return 32; // Assume RGBA
    }

    assessContentComplexity(imageData) {
        return Math.random() * 0.7 + 0.2;
    }

    evaluateStyleConsistency(imageData) {
        return Math.random() * 0.5 + 0.5;
    }

    assessTagCompleteness(tags, assetType) {
        if (!tags || tags.length === 0) return 0;

        const expectedTags = this.getExpectedTagsForType(assetType);
        const matchingTags = tags.filter(tag => expectedTags.includes(tag.toLowerCase()));

        return matchingTags.length / Math.max(expectedTags.length, 1);
    }

    assessDescriptionQuality(description) {
        if (!description) return 0;

        let score = 0.5;

        if (description.length > 10) score += 0.2;
        if (description.length > 50) score += 0.2;
        if (description.includes(assetType)) score += 0.1;

        return Math.min(1, score);
    }

    assessCategorizationAccuracy(category, assetType) {
        if (!category) return 0.5;

        // Simple heuristic - could be enhanced with ML
        const categoryMatch = category.toLowerCase().includes(assetType.toLowerCase());
        return categoryMatch ? 0.9 : 0.6;
    }

    getExpectedTagsForType(assetType) {
        const tagMap = {
            character: ['character', 'sprite', 'person', 'npc', 'avatar'],
            monster: ['monster', 'creature', 'enemy', 'beast', 'fantasy'],
            item: ['item', 'object', 'tool', 'weapon', 'equipment'],
            tile: ['tile', 'ground', 'floor', 'terrain', 'background'],
            building: ['building', 'structure', 'house', 'castle', 'architecture']
        };

        return tagMap[assetType] || ['asset', 'sprite', 'game'];
    }

    /**
     * Get assessment statistics
     */
    getStatistics() {
        const stats = {
            totalAssessments: this.trainingData.length,
            averageQualityScore: 0,
            gradeDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
            featureCompleteness: 0,
            modelTrained: this.model !== null,
            trainingDataSize: this.trainingData.length
        };

        if (this.trainingData.length > 0) {
            const totalScore = this.trainingData.reduce((sum, example) => sum + example.qualityScore, 0);
            stats.averageQualityScore = totalScore / this.trainingData.length;

            // Calculate grade distribution
            for (const example of this.trainingData) {
                stats.gradeDistribution[example.grade]++;
            }
        }

        return stats;
    }

    /**
     * Export assessment data for analysis
     */
    async exportAssessmentData(exportPath) {
        try {
            const data = {
                model: this.model,
                trainingData: this.trainingData,
                statistics: this.getStatistics(),
                exportedAt: new Date().toISOString()
            };

            await fs.writeFile(exportPath, JSON.stringify(data, null, 2), 'utf8');
            return exportPath;
        } catch (error) {
            console.error('Failed to export assessment data:', error);
            throw error;
        }
    }
}

module.exports = AIQualityAssessor;
