/**
 * Gem Generator - Complete gem and crystal sprite generation system
 * Generates various types of gems with different cuts, sizes, qualities, and magical properties
 */

const Jimp = require('jimp');
const path = require('path');

class GemGenerator {
    constructor() {
        this.gemTypes = {
            DIAMOND: 'diamond',
            RUBY: 'ruby',
            SAPPHIRE: 'sapphire',
            EMERALD: 'emerald',
            AMETHYST: 'amethyst',
            TOPAZ: 'topaz',
            GARNET: 'garnet',
            OPAL: 'opal',
            AQUAMARINE: 'aquamarine',
            PERIDOT: 'peridot',
            MANA_CRYSTAL: 'mana_crystal',
            SOUL_GEM: 'soul_gem',
            VOID_CRYSTAL: 'void_crystal',
            STAR_CRYSTAL: 'star_crystal'
        };

        this.gemCuts = {
            ROUND: 'round',
            SQUARE: 'square',
            OVAL: 'oval',
            HEART: 'heart',
            PEAR: 'pear',
            MARQUISE: 'marquise',
            EMERALD: 'emerald_cut',
            PRINCESS: 'princess',
            CUSHION: 'cushion',
            RADIANT: 'radiant'
        };

        this.gemSizes = {
            TINY: 'tiny',
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge',
            COLOSSAL: 'colossal'
        };

        this.gemQualities = {
            FLAWLESS: 'flawless',
            VVS1: 'vvs1',
            VVS2: 'vvs2',
            VS1: 'vs1',
            VS2: 'vs2',
            SI1: 'si1',
            SI2: 'si2',
            I1: 'i1',
            I2: 'i2',
            I3: 'i3'
        };

        this.gemClarities = {
            FL: 'flawless',
            IF: 'internally_flawless',
            VVS1: 'very_very_slightly_included_1',
            VVS2: 'very_very_slightly_included_2',
            VS1: 'very_slightly_included_1',
            VS2: 'very_slightly_included_2',
            SI1: 'slightly_included_1',
            SI2: 'slightly_included_2',
            I1: 'included_1',
            I2: 'included_2',
            I3: 'included_3'
        };

        // Gem material templates
        this.gemMaterialTemplates = {
            [this.gemTypes.DIAMOND]: {
                name: 'Diamond',
                description: 'A brilliant diamond of exceptional clarity',
                baseValue: 5000,
                hardness: 10,
                refractiveIndex: 2.42,
                color: '#FFFFFF',
                dispersion: 0.044,
                rarity: 8,
                magicalAffinity: 0.3,
                features: ['brilliant', 'colorless', 'precious', 'industrial']
            },
            [this.gemTypes.RUBY]: {
                name: 'Ruby',
                description: 'A deep red ruby of fiery passion',
                baseValue: 3000,
                hardness: 9,
                refractiveIndex: 1.77,
                color: '#DC143C',
                dispersion: 0.018,
                rarity: 7,
                magicalAffinity: 0.8,
                features: ['fiery', 'red', 'precious', 'courage']
            },
            [this.gemTypes.SAPPHIRE]: {
                name: 'Sapphire',
                description: 'A deep blue sapphire of wisdom',
                baseValue: 2500,
                hardness: 9,
                refractiveIndex: 1.77,
                color: '#0000FF',
                dispersion: 0.018,
                rarity: 7,
                magicalAffinity: 0.9,
                features: ['wise', 'blue', 'precious', 'truth']
            },
            [this.gemTypes.EMERALD]: {
                name: 'Emerald',
                description: 'A vibrant green emerald of growth',
                baseValue: 4000,
                hardness: 7.5,
                refractiveIndex: 1.58,
                color: '#008000',
                dispersion: 0.014,
                rarity: 8,
                magicalAffinity: 0.7,
                features: ['growth', 'green', 'precious', 'healing']
            },
            [this.gemTypes.AMETHYST]: {
                name: 'Amethyst',
                description: 'A purple amethyst of spirituality',
                baseValue: 500,
                hardness: 7,
                refractiveIndex: 1.55,
                color: '#8A2BE2',
                dispersion: 0.013,
                rarity: 4,
                magicalAffinity: 0.6,
                features: ['spiritual', 'purple', 'semi_precious', 'protection']
            },
            [this.gemTypes.TOPAZ]: {
                name: 'Topaz',
                description: 'A golden topaz of abundance',
                baseValue: 800,
                hardness: 8,
                refractiveIndex: 1.62,
                color: '#FFD700',
                dispersion: 0.014,
                rarity: 5,
                magicalAffinity: 0.5,
                features: ['abundance', 'golden', 'semi_precious', 'prosperity']
            },
            [this.gemTypes.GARNET]: {
                name: 'Garnet',
                description: 'A deep red garnet of vitality',
                baseValue: 600,
                hardness: 7.5,
                refractiveIndex: 1.83,
                color: '#8B0000',
                dispersion: 0.022,
                rarity: 4,
                magicalAffinity: 0.4,
                features: ['vitality', 'red', 'semi_precious', 'energy']
            },
            [this.gemTypes.OPAL]: {
                name: 'Opal',
                description: 'An iridescent opal of mystery',
                baseValue: 1200,
                hardness: 5.5,
                refractiveIndex: 1.45,
                color: '#F0F8FF',
                dispersion: 0.020,
                rarity: 6,
                magicalAffinity: 0.9,
                features: ['mysterious', 'iridescent', 'semi_precious', 'luck']
            },
            [this.gemTypes.AQUAMARINE]: {
                name: 'Aquamarine',
                description: 'A serene blue aquamarine of peace',
                baseValue: 700,
                hardness: 7.5,
                refractiveIndex: 1.58,
                color: '#7FFFD4',
                dispersion: 0.014,
                rarity: 5,
                magicalAffinity: 0.6,
                features: ['peaceful', 'blue', 'semi_precious', 'communication']
            },
            [this.gemTypes.PERIDOT]: {
                name: 'Peridot',
                description: 'A bright green peridot of renewal',
                baseValue: 400,
                hardness: 6.5,
                refractiveIndex: 1.66,
                color: '#9ACD32',
                dispersion: 0.016,
                rarity: 4,
                magicalAffinity: 0.5,
                features: ['renewal', 'green', 'semi_precious', 'growth']
            },
            [this.gemTypes.MANA_CRYSTAL]: {
                name: 'Mana Crystal',
                description: 'A glowing crystal of magical energy',
                baseValue: 8000,
                hardness: 8,
                refractiveIndex: 2.0,
                color: '#9370DB',
                dispersion: 0.030,
                rarity: 9,
                magicalAffinity: 1.0,
                features: ['magical', 'glowing', 'mana', 'power']
            },
            [this.gemTypes.SOUL_GEM]: {
                name: 'Soul Gem',
                description: 'A mysterious gem containing soul energy',
                baseValue: 15000,
                hardness: 9,
                refractiveIndex: 2.2,
                color: '#8B008B',
                dispersion: 0.050,
                rarity: 10,
                magicalAffinity: 1.0,
                features: ['soul', 'mysterious', 'powerful', 'rare']
            },
            [this.gemTypes.VOID_CRYSTAL]: {
                name: 'Void Crystal',
                description: 'A dark crystal from the void',
                baseValue: 20000,
                hardness: 10,
                refractiveIndex: 2.5,
                color: '#2F2F2F',
                dispersion: 0.060,
                rarity: 10,
                magicalAffinity: 1.0,
                features: ['void', 'dark', 'powerful', 'dangerous']
            },
            [this.gemTypes.STAR_CRYSTAL]: {
                name: 'Star Crystal',
                description: 'A crystal that captures starlight',
                baseValue: 10000,
                hardness: 8.5,
                refractiveIndex: 2.1,
                color: '#F0F8FF',
                dispersion: 0.040,
                rarity: 9,
                magicalAffinity: 0.8,
                features: ['starlight', 'bright', 'magical', 'celestial']
            }
        };

        // Gem cut templates
        this.gemCutTemplates = {
            [this.gemCuts.ROUND]: {
                name: 'Round Brilliant',
                description: 'Classic round cut with maximum brilliance',
                facets: 58,
                lightReturn: 0.85,
                fire: 0.8,
                scintillation: 0.9,
                features: ['brilliant', 'classic', 'maximum_light']
            },
            [this.gemCuts.SQUARE]: {
                name: 'Square',
                description: 'Square cut with clean lines',
                facets: 49,
                lightReturn: 0.75,
                fire: 0.7,
                scintillation: 0.8,
                features: ['square', 'clean', 'modern']
            },
            [this.gemCuts.OVAL]: {
                name: 'Oval',
                description: 'Elongated oval cut',
                facets: 56,
                lightReturn: 0.80,
                fire: 0.75,
                scintillation: 0.85,
                features: ['oval', 'elongated', 'elegant']
            },
            [this.gemCuts.HEART]: {
                name: 'Heart',
                description: 'Romantic heart-shaped cut',
                facets: 59,
                lightReturn: 0.70,
                fire: 0.65,
                scintillation: 0.75,
                features: ['heart', 'romantic', 'emotional']
            },
            [this.gemCuts.PEAR]: {
                name: 'Pear',
                description: 'Teardrop-shaped pear cut',
                facets: 58,
                lightReturn: 0.78,
                fire: 0.73,
                scintillation: 0.82,
                features: ['pear', 'teardrop', 'graceful']
            },
            [this.gemCuts.MARQUISE]: {
                name: 'Marquise',
                description: 'Boat-shaped marquise cut',
                facets: 58,
                lightReturn: 0.82,
                fire: 0.77,
                scintillation: 0.87,
                features: ['marquise', 'boat', 'elongated']
            },
            [this.gemCuts.EMERALD]: {
                name: 'Emerald Cut',
                description: 'Rectangular step cut',
                facets: 49,
                lightReturn: 0.65,
                fire: 0.6,
                scintillation: 0.7,
                features: ['emerald', 'rectangular', 'step_cut']
            },
            [this.gemCuts.PRINCESS]: {
                name: 'Princess',
                description: 'Square modified brilliant cut',
                facets: 49,
                lightReturn: 0.75,
                fire: 0.7,
                scintillation: 0.8,
                features: ['princess', 'square', 'brilliant']
            },
            [this.gemCuts.CUSHION]: {
                name: 'Cushion',
                description: 'Square with rounded corners',
                facets: 64,
                lightReturn: 0.72,
                fire: 0.67,
                scintillation: 0.77,
                features: ['cushion', 'rounded', 'vintage']
            },
            [this.gemCuts.RADIANT]: {
                name: 'Radiant',
                description: 'Rectangular with trimmed corners',
                facets: 70,
                lightReturn: 0.78,
                fire: 0.73,
                scintillation: 0.83,
                features: ['radiant', 'rectangular', 'brilliant']
            }
        };

        // Size modifiers
        this.sizeModifiers = {
            [this.gemSizes.TINY]: {
                multiplier: 0.1,
                caratRange: [0.01, 0.49],
                pixelSize: 8,
                features: ['tiny', 'delicate', 'rare']
            },
            [this.gemSizes.SMALL]: {
                multiplier: 0.5,
                caratRange: [0.5, 0.99],
                pixelSize: 12,
                features: ['small', 'manageable', 'common']
            },
            [this.gemSizes.MEDIUM]: {
                multiplier: 1.0,
                caratRange: [1.0, 2.99],
                pixelSize: 16,
                features: ['medium', 'standard', 'versatile']
            },
            [this.gemSizes.LARGE]: {
                multiplier: 2.5,
                caratRange: [3.0, 4.99],
                pixelSize: 20,
                features: ['large', 'impressive', 'valuable']
            },
            [this.gemSizes.HUGE]: {
                multiplier: 5.0,
                caratRange: [5.0, 9.99],
                pixelSize: 24,
                features: ['huge', 'spectacular', 'rare']
            },
            [this.gemSizes.COLOSSAL]: {
                multiplier: 10.0,
                caratRange: [10.0, 50.0],
                pixelSize: 32,
                features: ['colossal', 'legendary', 'mythical']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.gemQualities.FLAWLESS]: {
                statMultiplier: 3.0,
                valueMultiplier: 5.0,
                clarityBonus: 1.0,
                rarity: 10,
                features: ['flawless', 'perfect', 'ultimate']
            },
            [this.gemQualities.VVS1]: {
                statMultiplier: 2.5,
                valueMultiplier: 3.5,
                clarityBonus: 0.9,
                rarity: 9,
                features: ['very_very_slight', 'excellent', 'rare']
            },
            [this.gemQualities.VVS2]: {
                statMultiplier: 2.2,
                valueMultiplier: 3.0,
                clarityBonus: 0.85,
                rarity: 8,
                features: ['very_very_slight', 'excellent', 'rare']
            },
            [this.gemQualities.VS1]: {
                statMultiplier: 1.8,
                valueMultiplier: 2.2,
                clarityBonus: 0.75,
                rarity: 7,
                features: ['very_slight', 'very_good', 'valuable']
            },
            [this.gemQualities.VS2]: {
                statMultiplier: 1.6,
                valueMultiplier: 2.0,
                clarityBonus: 0.7,
                rarity: 6,
                features: ['very_slight', 'very_good', 'valuable']
            },
            [this.gemQualities.SI1]: {
                statMultiplier: 1.3,
                valueMultiplier: 1.5,
                clarityBonus: 0.6,
                rarity: 5,
                features: ['slightly_included', 'good', 'standard']
            },
            [this.gemQualities.SI2]: {
                statMultiplier: 1.2,
                valueMultiplier: 1.3,
                clarityBonus: 0.55,
                rarity: 4,
                features: ['slightly_included', 'good', 'standard']
            },
            [this.gemQualities.I1]: {
                statMultiplier: 1.0,
                valueMultiplier: 1.0,
                clarityBonus: 0.4,
                rarity: 3,
                features: ['included', 'acceptable', 'common']
            },
            [this.gemQualities.I2]: {
                statMultiplier: 0.8,
                valueMultiplier: 0.7,
                clarityBonus: 0.3,
                rarity: 2,
                features: ['included', 'poor', 'common']
            },
            [this.gemQualities.I3]: {
                statMultiplier: 0.6,
                valueMultiplier: 0.5,
                clarityBonus: 0.2,
                rarity: 1,
                features: ['heavily_included', 'poor', 'common']
            }
        };

        // Gem colors and effects
        this.gemColors = {
            diamond: { base: '#FFFFFF', facets: '#F0F8FF', highlight: '#E6E6FA', glow: '#FFFFFF' },
            ruby: { base: '#DC143C', facets: '#FF0000', highlight: '#FF6347', glow: '#FF4500' },
            sapphire: { base: '#0000FF', facets: '#4169E1', highlight: '#87CEEB', glow: '#00BFFF' },
            emerald: { base: '#008000', facets: '#32CD32', highlight: '#90EE90', glow: '#00FF7F' },
            amethyst: { base: '#8A2BE2', facets: '#9932CC', highlight: '#DDA0DD', glow: '#DA70D6' },
            topaz: { base: '#FFD700', facets: '#FFA500', highlight: '#FFFF00', glow: '#FFD700' },
            garnet: { base: '#8B0000', facets: '#B22222', highlight: '#DC143C', glow: '#FF0000' },
            opal: { base: '#F0F8FF', facets: '#E6E6FA', highlight: '#FFFFFF', glow: '#87CEEB' },
            aquamarine: { base: '#7FFFD4', facets: '#AFEEEE', highlight: '#E0FFFF', glow: '#00FFFF' },
            peridot: { base: '#9ACD32', facets: '#ADFF2F', highlight: '#F0FFF0', glow: '#32CD32' },
            mana_crystal: { base: '#9370DB', facets: '#8A2BE2', highlight: '#DDA0DD', glow: '#FF00FF' },
            soul_gem: { base: '#8B008B', facets: '#9932CC', highlight: '#DDA0DD', glow: '#FF1493' },
            void_crystal: { base: '#2F2F2F', facets: '#696969', highlight: '#A9A9A9', glow: '#000000' },
            star_crystal: { base: '#F0F8FF', facets: '#E6E6FA', highlight: '#FFFFFF', glow: '#FFFF00' }
        };
    }

    /**
     * Generate a gem sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.gemTypes.DIAMOND,
            cut: options.cut || this.gemCuts.ROUND,
            size: options.size || this.gemSizes.MEDIUM,
            quality: options.quality || this.gemQualities.VS1,
            clarity: options.clarity || this.gemClarities.VS1,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates
        const materialTemplate = this.gemMaterialTemplates[config.type];
        const cutTemplate = this.gemCutTemplates[config.cut];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];

        if (!materialTemplate || !cutTemplate || !sizeTemplate || !qualityTemplate) {
            throw new Error(`Unknown gem configuration: ${config.type}, ${config.cut}, ${config.size}, ${config.quality}`);
        }

        // Calculate final stats
        const finalStats = this.calculateGemStats(materialTemplate, cutTemplate, sizeTemplate, qualityTemplate, config);

        // Generate gem data
        const gemData = {
            id: this.generateGemId(),
            name: this.generateGemName(materialTemplate.name, cutTemplate.name, config.size, config.quality),
            type: config.type,
            cut: config.cut,
            size: config.size,
            quality: config.quality,
            clarity: config.clarity,
            materialTemplate: materialTemplate,
            cutTemplate: cutTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            stats: finalStats,
            features: [...materialTemplate.features, ...cutTemplate.features, ...sizeTemplate.features, ...qualityTemplate.features],
            description: this.generateDescription(materialTemplate, cutTemplate, sizeTemplate, qualityTemplate),
            appearance: this.generateAppearance(materialTemplate, cutTemplate, config.quality, config.clarity),
            effects: this.generateEffects(materialTemplate, finalStats)
        };

        // Generate sprite image
        const spriteImage = await this.generateGemSprite(gemData, config);

        return {
            image: spriteImage,
            data: gemData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'GemGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate gem sprite image
     */
    async generateGemSprite(gemData, config) {
        const width = config.width || 64;
        const height = config.height || 64;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw gem based on cut
        await this.drawGemBase(image, gemData, config);

        // Apply quality effects
        if (gemData.quality !== this.gemQualities.I3) {
            await this.addQualityEffects(image, gemData.quality);
        }

        // Add clarity effects
        await this.addClarityEffects(image, gemData.clarity);

        return image;
    }

    /**
     * Draw gem base shape
     */
    async drawGemBase(image, gemData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = gemData.sizeTemplate.pixelSize / 16;
        const colors = this.gemColors[gemData.type];

        // Draw gem based on cut
        switch (gemData.cut) {
            case this.gemCuts.ROUND:
                await this.drawRoundGem(image, centerX, centerY, scale, colors, gemData);
                break;
            case this.gemCuts.SQUARE:
                await this.drawSquareGem(image, centerX, centerY, scale, colors, gemData);
                break;
            case this.gemCuts.OVAL:
                await this.drawOvalGem(image, centerX, centerY, scale, colors, gemData);
                break;
            case this.gemCuts.HEART:
                await this.drawHeartGem(image, centerX, centerY, scale, colors, gemData);
                break;
            case this.gemCuts.PEAR:
                await this.drawPearGem(image, centerX, centerY, scale, colors, gemData);
                break;
            case this.gemCuts.MARQUISE:
                await this.drawMarquiseGem(image, centerX, centerY, scale, colors, gemData);
                break;
            case this.gemCuts.EMERALD:
                await this.drawEmeraldGem(image, centerX, centerY, scale, colors, gemData);
                break;
            case this.gemCuts.PRINCESS:
                await this.drawPrincessGem(image, centerX, centerY, scale, colors, gemData);
                break;
            case this.gemCuts.CUSHION:
                await this.drawCushionGem(image, centerX, centerY, scale, colors, gemData);
                break;
            case this.gemCuts.RADIANT:
                await this.drawRadiantGem(image, centerX, centerY, scale, colors, gemData);
                break;
            default:
                await this.drawRoundGem(image, centerX, centerY, scale, colors, gemData);
        }

        // Add facets
        await this.addGemFacets(image, gemData, centerX, centerY, scale);
    }

    /**
     * Draw round gem
     */
    async drawRoundGem(image, x, y, scale, colors, gemData) {
        const radius = 12 * scale;

        // Draw main gem body
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        // Base gem color with gradient
                        const distance = Math.sqrt(i * i + j * j) / radius;
                        const intensity = 1 - distance * 0.3;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw square gem
     */
    async drawSquareGem(image, x, y, scale, colors, gemData) {
        const size = 14 * scale;

        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const distance = Math.max(Math.abs(i), Math.abs(j)) / size;
                    const intensity = 1 - distance * 0.2;
                    const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                    const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                    const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw oval gem
     */
    async drawOvalGem(image, x, y, scale, colors, gemData) {
        const width = 16 * scale;
        const height = 12 * scale;

        for (let i = -width; i < width; i++) {
            for (let j = -height; j < height; j++) {
                if ((i * i) / (width * width) + (j * j) / (height * height) <= 1) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        const distance = Math.sqrt((i * i) / (width * width) + (j * j) / (height * height));
                        const intensity = 1 - distance * 0.3;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw heart gem
     */
    async drawHeartGem(image, x, y, scale, colors, gemData) {
        const size = 12 * scale;

        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Heart shape formula
                    const heart = Math.pow((i / size), 2) + Math.pow((j / size + 0.3), 2) - 1;
                    const top = -Math.abs(i / size) + 1;
                    if (heart <= 0 || (j / size >= -0.3 && top >= 0)) {
                        const distance = Math.sqrt(i * i + j * j) / size;
                        const intensity = 1 - distance * 0.4;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw pear gem
     */
    async drawPearGem(image, x, y, scale, colors, gemData) {
        const width = 10 * scale;
        const height = 16 * scale;

        for (let i = -width; i < width; i++) {
            for (let j = -height; j < height; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Pear shape (oval with pointed bottom)
                    const oval = (i * i) / (width * width) + (j * j) / (height * height);
                    const point = j > 0 ? Math.abs(i / width) * (1 - j / height) : 0;
                    if (oval <= 1 && point <= 0.3) {
                        const distance = Math.sqrt(i * i + j * j) / Math.max(width, height);
                        const intensity = 1 - distance * 0.3;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw marquise gem
     */
    async drawMarquiseGem(image, x, y, scale, colors, gemData) {
        const width = 16 * scale;
        const height = 8 * scale;

        for (let i = -width; i < width; i++) {
            for (let j = -height; j < height; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Marquise shape (boat shape)
                    const boat = Math.pow(Math.abs(i) / width, 2) + Math.pow(j / height, 2);
                    if (boat <= 1) {
                        const distance = Math.sqrt(i * i + j * j) / Math.max(width, height);
                        const intensity = 1 - distance * 0.3;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw emerald gem
     */
    async drawEmeraldGem(image, x, y, scale, colors, gemData) {
        const width = 14 * scale;
        const height = 10 * scale;

        for (let i = -width; i < width; i++) {
            for (let j = -height; j < height; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Rectangular with step cuts
                    if (Math.abs(i) <= width && Math.abs(j) <= height) {
                        const distance = Math.max(Math.abs(i) / width, Math.abs(j) / height);
                        const intensity = 1 - distance * 0.2;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw princess gem
     */
    async drawPrincessGem(image, x, y, scale, colors, gemData) {
        const size = 12 * scale;

        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Square with brilliant cut
                    if (Math.abs(i) <= size && Math.abs(j) <= size) {
                        const distance = Math.max(Math.abs(i), Math.abs(j)) / size;
                        const intensity = 1 - distance * 0.3;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw cushion gem
     */
    async drawCushionGem(image, x, y, scale, colors, gemData) {
        const size = 12 * scale;

        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Square with rounded corners
                    const cornerRadius = size * 0.2;
                    const distToCorner = Math.max(Math.abs(i) - (size - cornerRadius), Math.abs(j) - (size - cornerRadius));
                    if (Math.max(Math.abs(i), Math.abs(j)) <= size - cornerRadius || distToCorner <= cornerRadius) {
                        const distance = Math.sqrt(i * i + j * j) / size;
                        const intensity = 1 - distance * 0.3;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw radiant gem
     */
    async drawRadiantGem(image, x, y, scale, colors, gemData) {
        const width = 14 * scale;
        const height = 10 * scale;

        for (let i = -width; i < width; i++) {
            for (let j = -height; j < height; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Rectangle with trimmed corners
                    const cornerTrim = 2 * scale;
                    if (Math.abs(i) <= width - cornerTrim || Math.abs(j) <= height - cornerTrim) {
                        const distance = Math.max(Math.abs(i) / width, Math.abs(j) / height);
                        const intensity = 1 - distance * 0.3;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Add gem facets
     */
    async addGemFacets(image, gemData, centerX, centerY, scale) {
        const colors = this.gemColors[gemData.type];
        const facetCount = gemData.cutTemplate.facets;

        // Add facet highlights
        for (let i = 0; i < facetCount; i++) {
            const angle = (i / facetCount) * Math.PI * 2;
            const distance = 8 * scale;
            const facetX = centerX + Math.cos(angle) * distance;
            const facetY = centerY + Math.sin(angle) * distance;

            // Draw facet highlight
            for (let fx = -1; fx <= 1; fx++) {
                for (let fy = -1; fy <= 1; fy++) {
                    const pixelX = Math.floor(facetX + fx);
                    const pixelY = Math.floor(facetY + fy);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        const r = parseInt(colors.highlight.slice(1, 3), 16);
                        const g = parseInt(colors.highlight.slice(3, 5), 16);
                        const b = parseInt(colors.highlight.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Add quality effects
     */
    async addQualityEffects(image, quality) {
        switch (quality) {
            case this.gemQualities.FLAWLESS:
                await this.addFlawlessGlow(image);
                break;
            case this.gemQualities.VVS1:
            case this.gemQualities.VVS2:
                await this.addExcellentGlow(image);
                break;
            case this.gemQualities.VS1:
            case this.gemQualities.VS2:
                await this.addVeryGoodGlow(image);
                break;
        }
    }

    /**
     * Add clarity effects
     */
    async addClarityEffects(image, clarity) {
        switch (clarity) {
            case this.gemClarities.FL:
            case this.gemClarities.IF:
                await this.addPerfectClarity(image);
                break;
            case this.gemClarities.VVS1:
            case this.gemClarities.VVS2:
                await this.addExcellentClarity(image);
                break;
            case this.gemClarities.I1:
            case this.gemClarities.I2:
            case this.gemClarities.I3:
                await this.addIncludedClarity(image);
                break;
        }
    }

    /**
     * Calculate gem stats
     */
    calculateGemStats(materialTemplate, cutTemplate, sizeTemplate, qualityTemplate, config) {
        const caratRange = sizeTemplate.caratRange;
        const carats = caratRange[0] + Math.random() * (caratRange[1] - caratRange[0]);

        const stats = {
            carats: Math.round(carats * 100) / 100,
            value: Math.round(materialTemplate.baseValue * sizeTemplate.multiplier * qualityTemplate.valueMultiplier * (carats / sizeTemplate.multiplier)),
            hardness: materialTemplate.hardness,
            refractiveIndex: materialTemplate.refractiveIndex,
            dispersion: materialTemplate.dispersion,
            lightReturn: cutTemplate.lightReturn * qualityTemplate.clarityBonus,
            fire: cutTemplate.fire * qualityTemplate.clarityBonus,
            scintillation: cutTemplate.scintillation * qualityTemplate.clarityBonus,
            rarity: Math.max(materialTemplate.rarity, qualityTemplate.rarity),
            magicalAffinity: materialTemplate.magicalAffinity
        };

        return stats;
    }

    /**
     * Generate gem ID
     */
    generateGemId() {
        return 'gem_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate gem name
     */
    generateGemName(materialName, cutName, size, quality) {
        const sizePrefixes = {
            [this.gemSizes.TINY]: 'Tiny ',
            [this.gemSizes.SMALL]: 'Small ',
            [this.gemSizes.MEDIUM]: '',
            [this.gemSizes.LARGE]: 'Large ',
            [this.gemSizes.HUGE]: 'Huge ',
            [this.gemSizes.COLOSSAL]: 'Colossal '
        };

        const qualitySuffixes = {
            [this.gemQualities.FLAWLESS]: ' (Flawless)',
            [this.gemQualities.VVS1]: ' (VVS1)',
            [this.gemQualities.VVS2]: ' (VVS2)',
            [this.gemQualities.VS1]: ' (VS1)',
            [this.gemQualities.VS2]: ' (VS2)',
            [this.gemQualities.SI1]: ' (SI1)',
            [this.gemQualities.SI2]: ' (SI2)',
            [this.gemQualities.I1]: ' (I1)',
            [this.gemQualities.I2]: ' (I2)',
            [this.gemQualities.I3]: ' (I3)'
        };

        return `${sizePrefixes[size]}${materialName} ${cutName}${qualitySuffixes[quality]}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(materialTemplate, cutTemplate, sizeTemplate, qualityTemplate) {
        const qualityDesc = {
            [this.gemQualities.FLAWLESS]: 'A flawless gem of perfect clarity',
            [this.gemQualities.VVS1]: 'An excellent gem with very very slight inclusions',
            [this.gemQualities.VVS2]: 'An excellent gem with very very slight inclusions',
            [this.gemQualities.VS1]: 'A very good gem with very slight inclusions',
            [this.gemQualities.VS2]: 'A very good gem with very slight inclusions',
            [this.gemQualities.SI1]: 'A good gem with slight inclusions',
            [this.gemQualities.SI2]: 'A good gem with slight inclusions',
            [this.gemQualities.I1]: 'An acceptable gem with inclusions',
            [this.gemQualities.I2]: 'A gem with noticeable inclusions',
            [this.gemQualities.I3]: 'A gem with heavy inclusions'
        };

        return `${qualityDesc[qualityTemplate]}. ${materialTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(materialTemplate, cutTemplate, quality, clarity) {
        const colors = this.gemColors[materialTemplate.color.toLowerCase().replace('#', '')] || this.gemColors.diamond;

        return {
            baseColor: colors.base,
            facetColor: colors.facets,
            highlightColor: colors.highlight,
            glowColor: colors.glow || null,
            material: materialTemplate,
            cut: cutTemplate,
            quality: quality,
            clarity: clarity
        };
    }

    /**
     * Generate effects
     */
    generateEffects(materialTemplate, stats) {
        const effects = [];

        // Value effect
        effects.push({
            type: 'gem_value',
            power: stats.value,
            duration: -1, // Permanent
            instant: false
        });

        // Material-specific effects
        if (materialTemplate.magicalAffinity > 0.5) {
            effects.push({
                type: 'magical_enhancement',
                power: materialTemplate.magicalAffinity,
                duration: -1,
                instant: false
            });
        }

        // Rarity effect
        effects.push({
            type: 'rarity_aura',
            power: stats.rarity,
            duration: -1,
            instant: false
        });

        // Light effects
        if (stats.lightReturn > 0.8) {
            effects.push({
                type: 'brilliance',
                power: stats.lightReturn,
                duration: -1,
                instant: false
            });
        }

        return effects;
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addFlawlessGlow(image) { return image; }
    async addExcellentGlow(image) { return image; }
    async addVeryGoodGlow(image) { return image; }
    async addPerfectClarity(image) { return image; }
    async addExcellentClarity(image) { return image; }
    async addIncludedClarity(image) { return image; }

    /**
     * Batch generate gems
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const gem = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(gem);
            } catch (error) {
                console.error(`Failed to generate gem ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(g => g !== null);
    }

    /**
     * Generate gem by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.cut) options.cut = criteria.cut;
        if (criteria.size) options.size = criteria.size;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.clarity) options.clarity = criteria.clarity;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get gem statistics
     */
    getGemStatistics() {
        return {
            totalTypes: Object.keys(this.gemTypes).length,
            totalCuts: Object.keys(this.gemCuts).length,
            totalSizes: Object.keys(this.gemSizes).length,
            totalQualities: Object.keys(this.gemQualities).length,
            totalClarities: Object.keys(this.gemClarities).length,
            materialTemplates: Object.keys(this.gemMaterialTemplates).length,
            cutTemplates: Object.keys(this.gemCutTemplates).length
        };
    }

    /**
     * Export gem data
     */
    async exportGemData(gem, outputPath) {
        const exportData = {
            ...gem.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save gem data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate gem configuration
     */
    validateGemConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.gemTypes).includes(config.type)) {
            errors.push(`Invalid gem type: ${config.type}`);
        }

        if (config.cut && !Object.values(this.gemCuts).includes(config.cut)) {
            errors.push(`Invalid cut type: ${config.cut}`);
        }

        if (config.size && !Object.values(this.gemSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.gemQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.clarity && !Object.values(this.gemClarities).includes(config.clarity)) {
            errors.push(`Invalid clarity level: ${config.clarity}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get gem value estimate
     */
    getGemValueEstimate(type, cut, size, quality, clarity) {
        const materialTemplate = this.gemMaterialTemplates[type];
        const cutTemplate = this.gemCutTemplates[cut];
        const sizeTemplate = this.sizeModifiers[size];
        const qualityTemplate = this.qualityModifiers[quality];

        if (!materialTemplate || !cutTemplate || !sizeTemplate || !qualityTemplate) {
            return 0;
        }

        const caratRange = sizeTemplate.caratRange;
        const avgCarats = (caratRange[0] + caratRange[1]) / 2;

        return Math.round(materialTemplate.baseValue * sizeTemplate.multiplier * qualityTemplate.valueMultiplier * (avgCarats / sizeTemplate.multiplier));
    }

    /**
     * Get gem rarity score
     */
    getGemRarityScore(type, cut, size, quality, clarity) {
        const materialTemplate = this.gemMaterialTemplates[type];
        const qualityTemplate = this.qualityModifiers[quality];

        if (!materialTemplate || !qualityTemplate) {
            return 0;
        }

        return Math.max(materialTemplate.rarity, qualityTemplate.rarity);
    }

    /**
     * Generate gem collection
     */
    async generateGemCollection(count = 5, theme = 'mixed') {
        const collection = [];

        for (let i = 0; i < count; i++) {
            let options = {};

            switch (theme) {
                case 'precious':
                    options.type = this.getRandomFromArray([
                        this.gemTypes.DIAMOND,
                        this.gemTypes.RUBY,
                        this.gemTypes.SAPPHIRE,
                        this.gemTypes.EMERALD
                    ]);
                    break;
                case 'semi_precious':
                    options.type = this.getRandomFromArray([
                        this.gemTypes.AMETHYST,
                        this.gemTypes.TOPAZ,
                        this.gemTypes.GARNET,
                        this.gemTypes.AQUAMARINE,
                        this.gemTypes.PERIDOT,
                        this.gemTypes.OPAL
                    ]);
                    break;
                case 'magical':
                    options.type = this.getRandomFromArray([
                        this.gemTypes.MANA_CRYSTAL,
                        this.gemTypes.SOUL_GEM,
                        this.gemTypes.VOID_CRYSTAL,
                        this.gemTypes.STAR_CRYSTAL
                    ]);
                    break;
                default:
                    // Mixed - all types
                    break;
            }

            const gem = await this.generate(options);
            collection.push(gem);
        }

        return collection;
    }

    /**
     * Get random item from array
     */
    getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Generate gem with specific carat weight
     */
    async generateGemByCarats(type, cut, quality, targetCarats) {
        const materialTemplate = this.gemMaterialTemplates[type];
        const cutTemplate = this.gemCutTemplates[cut];
        const qualityTemplate = this.qualityModifiers[quality];

        if (!materialTemplate || !cutTemplate || !qualityTemplate) {
            throw new Error('Invalid gem configuration');
        }

        // Find appropriate size for target carats
        let selectedSize = this.gemSizes.MEDIUM;
        for (const [sizeKey, sizeTemplate] of Object.entries(this.sizeModifiers)) {
            const [min, max] = sizeTemplate.caratRange;
            if (targetCarats >= min && targetCarats <= max) {
                selectedSize = sizeKey;
                break;
            }
        }

        return await this.generate({
            type: type,
            cut: cut,
            size: selectedSize,
            quality: quality,
            customizations: { targetCarats: targetCarats }
        });
    }

    /**
     * Generate gem with specific value range
     */
    async generateGemByValue(type, cut, minValue, maxValue) {
        const materialTemplate = this.gemMaterialTemplates[type];
        const cutTemplate = this.gemCutTemplates[cut];

        if (!materialTemplate || !cutTemplate) {
            throw new Error('Invalid gem type or cut');
        }

        // Try different combinations until we find one in the value range
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const quality = this.getRandomFromArray(Object.values(this.gemQualities));
            const size = this.getRandomFromArray(Object.values(this.gemSizes));

            const estimatedValue = this.getGemValueEstimate(type, cut, size, quality, this.gemClarities.VS1);

            if (estimatedValue >= minValue && estimatedValue <= maxValue) {
                return await this.generate({
                    type: type,
                    cut: cut,
                    size: size,
                    quality: quality
                });
            }

            attempts++;
        }

        // Fallback to medium quality
        return await this.generate({
            type: type,
            cut: cut,
            size: this.gemSizes.MEDIUM,
            quality: this.gemQualities.VS1
        });
    }
}

module.exports = GemGenerator;
