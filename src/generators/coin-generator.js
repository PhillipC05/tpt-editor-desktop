/**
 * Coin Generator - Complete coin and currency sprite generation system
 * Generates various types of coins with different materials, designs, and historical variations
 */

const Jimp = require('jimp');
const path = require('path');

class CoinGenerator {
    constructor() {
        this.coinTypes = {
            GOLD: 'gold',
            SILVER: 'silver',
            COPPER: 'copper',
            PLATINUM: 'platinum',
            ANCIENT: 'ancient',
            MAGICAL: 'magical'
        };

        this.coinDenominations = {
            PENNY: 'penny',
            NICKEL: 'nickel',
            DIME: 'dime',
            QUARTER: 'quarter',
            HALF_DOLLAR: 'half_dollar',
            DOLLAR: 'dollar',
            FIVE_DOLLAR: 'five_dollar',
            TEN_DOLLAR: 'ten_dollar',
            TWENTY_DOLLAR: 'twenty_dollar',
            FIFTY_DOLLAR: 'fifty_dollar'
        };

        this.coinQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.coinSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge'
        };

        // Coin material templates
        this.coinMaterialTemplates = {
            GOLD: {
                name: 'Gold Coin',
                description: 'A gleaming gold coin',
                baseValue: 100,
                weight: 8.5,
                purity: 0.95,
                color: '#FFD700',
                reflectivity: 0.9,
                features: ['precious_metal', 'high_value', 'collector_item']
            },
            SILVER: {
                name: 'Silver Coin',
                description: 'A shiny silver coin',
                baseValue: 10,
                weight: 6.2,
                purity: 0.92,
                color: '#C0C0C0',
                reflectivity: 0.8,
                features: ['precious_metal', 'medium_value', 'circulated']
            },
            COPPER: {
                name: 'Copper Coin',
                description: 'A common copper coin',
                baseValue: 1,
                weight: 3.1,
                purity: 0.85,
                color: '#B87333',
                reflectivity: 0.3,
                features: ['base_metal', 'low_value', 'everyday_use']
            },
            PLATINUM: {
                name: 'Platinum Coin',
                description: 'A rare platinum coin',
                baseValue: 500,
                weight: 15.5,
                purity: 0.98,
                color: '#E5E4E2',
                reflectivity: 0.7,
                features: ['rare_metal', 'very_high_value', 'investment']
            },
            ANCIENT: {
                name: 'Ancient Coin',
                description: 'An ancient historical coin',
                baseValue: 200,
                weight: 12.0,
                purity: 0.88,
                color: '#8B7355',
                reflectivity: 0.4,
                features: ['historical', 'collectible', 'aged']
            },
            MAGICAL: {
                name: 'Magical Coin',
                description: 'A coin imbued with magical properties',
                baseValue: 1000,
                weight: 5.0,
                purity: 1.0,
                color: '#9370DB',
                reflectivity: 0.95,
                features: ['enchanted', 'magical_properties', 'rare']
            }
        };

        // Coin denomination templates
        this.coinDenominationTemplates = {
            PENNY: {
                name: 'Penny',
                description: 'A small copper coin',
                multiplier: 0.01,
                diameter: 19.05,
                thickness: 1.55,
                features: ['small_denomination', 'copper', 'common']
            },
            NICKEL: {
                name: 'Nickel',
                description: 'A five-cent coin',
                multiplier: 0.05,
                diameter: 21.21,
                thickness: 1.95,
                features: ['small_denomination', 'nickel', 'common']
            },
            DIME: {
                name: 'Dime',
                description: 'A ten-cent coin',
                multiplier: 0.10,
                diameter: 17.91,
                thickness: 1.35,
                features: ['small_denomination', 'silver', 'common']
            },
            QUARTER: {
                name: 'Quarter',
                description: 'A twenty-five cent coin',
                multiplier: 0.25,
                diameter: 24.26,
                thickness: 1.75,
                features: ['medium_denomination', 'silver', 'common']
            },
            HALF_DOLLAR: {
                name: 'Half Dollar',
                description: 'A fifty-cent coin',
                multiplier: 0.50,
                diameter: 30.61,
                thickness: 2.15,
                features: ['medium_denomination', 'silver', 'uncommon']
            },
            DOLLAR: {
                name: 'Dollar Coin',
                description: 'A one-dollar coin',
                multiplier: 1.0,
                diameter: 26.49,
                thickness: 2.0,
                features: ['standard_denomination', 'gold', 'circulated']
            },
            FIVE_DOLLAR: {
                name: 'Five Dollar Coin',
                description: 'A five-dollar coin',
                multiplier: 5.0,
                diameter: 21.59,
                thickness: 1.95,
                features: ['high_denomination', 'gold', 'rare']
            },
            TEN_DOLLAR: {
                name: 'Ten Dollar Coin',
                description: 'A ten-dollar coin',
                multiplier: 10.0,
                diameter: 26.96,
                thickness: 2.0,
                features: ['high_denomination', 'gold', 'rare']
            },
            TWENTY_DOLLAR: {
                name: 'Twenty Dollar Coin',
                description: 'A twenty-dollar coin',
                multiplier: 20.0,
                diameter: 32.0,
                thickness: 2.4,
                features: ['high_denomination', 'gold', 'very_rare']
            },
            FIFTY_DOLLAR: {
                name: 'Fifty Dollar Coin',
                description: 'A fifty-dollar coin',
                multiplier: 50.0,
                diameter: 38.1,
                thickness: 2.8,
                features: ['premium_denomination', 'platinum', 'extremely_rare']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.coinQualities.COMMON]: {
                statMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                valueMultiplier: 1.0,
                purityMultiplier: 1.0,
                rarity: 1
            },
            [this.coinQualities.UNCOMMON]: {
                statMultiplier: 1.1,
                durabilityMultiplier: 1.05,
                valueMultiplier: 1.2,
                purityMultiplier: 1.05,
                rarity: 2
            },
            [this.coinQualities.RARE]: {
                statMultiplier: 1.25,
                durabilityMultiplier: 1.1,
                valueMultiplier: 1.5,
                purityMultiplier: 1.1,
                rarity: 3
            },
            [this.coinQualities.EPIC]: {
                statMultiplier: 1.5,
                durabilityMultiplier: 1.2,
                valueMultiplier: 2.0,
                purityMultiplier: 1.2,
                rarity: 4
            },
            [this.coinQualities.LEGENDARY]: {
                statMultiplier: 2.0,
                durabilityMultiplier: 1.5,
                valueMultiplier: 3.0,
                purityMultiplier: 1.5,
                rarity: 5
            },
            [this.coinQualities.MYTHICAL]: {
                statMultiplier: 3.0,
                durabilityMultiplier: 2.0,
                valueMultiplier: 5.0,
                purityMultiplier: 2.0,
                rarity: 6
            }
        };

        // Coin design patterns
        this.coinPatterns = {
            CLASSIC: 'classic',
            MODERN: 'modern',
            ANCIENT: 'ancient',
            FANTASY: 'fantasy',
            ROYAL: 'royal',
            TRIBAL: 'tribal'
        };

        // Coin colors and effects
        this.coinColors = {
            gold: { base: '#FFD700', edge: '#B8860B', highlight: '#FFFF00' },
            silver: { base: '#C0C0C0', edge: '#808080', highlight: '#FFFFFF' },
            copper: { base: '#B87333', edge: '#8B4513', highlight: '#CD853F' },
            platinum: { base: '#E5E4E2', edge: '#A9A9A9', highlight: '#F5F5F5' },
            ancient: { base: '#8B7355', edge: '#654321', highlight: '#A0522D' },
            magical: { base: '#9370DB', edge: '#4B0082', highlight: '#DA70D6', glow: '#FF00FF' }
        };
    }

    /**
     * Generate a coin sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.coinTypes.GOLD,
            denomination: options.denomination || this.coinDenominations.DOLLAR,
            quality: options.quality || this.coinQualities.COMMON,
            size: options.size || this.coinSizes.MEDIUM,
            pattern: options.pattern || this.coinPatterns.CLASSIC,
            minted: options.minted || false,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates based on type and denomination
        const materialTemplate = this.coinMaterialTemplates[config.type];
        const denominationTemplate = this.coinDenominationTemplates[config.denomination];

        if (!materialTemplate || !denominationTemplate) {
            throw new Error(`Unknown coin type or denomination: ${config.type}, ${config.denomination}`);
        }

        // Apply material and quality modifiers
        const qualityMods = this.qualityModifiers[config.quality];

        // Calculate final stats
        const finalStats = this.calculateCoinStats(materialTemplate, denominationTemplate, qualityMods, config.size);

        // Generate coin data
        const coinData = {
            id: this.generateCoinId(),
            name: this.generateCoinName(materialTemplate.name, denominationTemplate.name, config.quality),
            type: config.type,
            denomination: config.denomination,
            quality: config.quality,
            size: config.size,
            pattern: config.pattern,
            minted: config.minted,
            materialTemplate: materialTemplate,
            denominationTemplate: denominationTemplate,
            stats: finalStats,
            features: [...materialTemplate.features, ...denominationTemplate.features],
            description: this.generateDescription(materialTemplate, denominationTemplate, config.quality),
            appearance: this.generateAppearance(materialTemplate, config.quality, config.pattern, config.minted),
            effects: this.generateEffects(materialTemplate, finalStats, config.minted)
        };

        // Generate sprite image
        const spriteImage = await this.generateCoinSprite(coinData, config);

        return {
            image: spriteImage,
            data: coinData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'CoinGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate coin sprite image
     */
    async generateCoinSprite(coinData, config) {
        const width = config.width || 32;
        const height = config.height || 32;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw coin based on type
        await this.drawCoinBase(image, coinData, config);

        // Apply quality effects
        if (coinData.quality !== this.coinQualities.COMMON) {
            await this.addQualityEffects(image, coinData.quality);
        }

        // Add minting effects
        if (coinData.minted) {
            await this.addMintingEffects(image, coinData.appearance);
        }

        return image;
    }

    /**
     * Draw coin base shape
     */
    async drawCoinBase(image, coinData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = config.size === this.coinSizes.SMALL ? 0.7 : config.size === this.coinSizes.LARGE ? 1.3 : 1.0;

        const radius = 12 * scale;
        const colors = this.coinColors[coinData.type];

        // Draw coin circle
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(centerX + i);
                    const pixelY = Math.floor(centerY + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        // Base coin color
                        image.setPixelColor(
                            (parseInt(colors.base.slice(1, 3), 16) << 16) |
                            (parseInt(colors.base.slice(3, 5), 16) << 8) |
                            parseInt(colors.base.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }

        // Add edge highlighting
        await this.addCoinEdge(image, centerX, centerY, radius, colors);

        // Add coin design/pattern
        await this.addCoinDesign(image, coinData, centerX, centerY, radius);
    }

    /**
     * Add coin edge highlighting
     */
    async addCoinEdge(image, centerX, centerY, radius, colors) {
        const edgeWidth = 1;

        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                const distance = Math.sqrt(i * i + j * j);
                if (distance >= radius - edgeWidth && distance <= radius) {
                    const pixelX = Math.floor(centerX + i);
                    const pixelY = Math.floor(centerY + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.edge.slice(1, 3), 16) << 16) |
                            (parseInt(colors.edge.slice(3, 5), 16) << 8) |
                            parseInt(colors.edge.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Add coin design/pattern
     */
    async addCoinDesign(image, coinData, centerX, centerY, radius) {
        switch (coinData.pattern) {
            case this.coinPatterns.CLASSIC:
                await this.addClassicDesign(image, coinData, centerX, centerY, radius);
                break;
            case this.coinPatterns.ANCIENT:
                await this.addAncientDesign(image, coinData, centerX, centerY, radius);
                break;
            case this.coinPatterns.FANTASY:
                await this.addFantasyDesign(image, coinData, centerX, centerY, radius);
                break;
            case this.coinPatterns.ROYAL:
                await this.addRoyalDesign(image, coinData, centerX, centerY, radius);
                break;
            default:
                await this.addClassicDesign(image, coinData, centerX, centerY, radius);
        }
    }

    /**
     * Add classic coin design
     */
    async addClassicDesign(image, coinData, centerX, centerY, radius) {
        // Simple denomination number
        const denominationValue = coinData.denominationTemplate.multiplier;
        const number = denominationValue >= 1 ? denominationValue : Math.round(1 / denominationValue);

        // Draw simple number in center
        await this.drawCoinNumber(image, centerX, centerY, number);
    }

    /**
     * Draw coin number
     */
    async drawCoinNumber(image, x, y, number) {
        const numberStr = number.toString();
        const charWidth = 3;
        const charHeight = 5;

        for (let i = 0; i < numberStr.length; i++) {
            const char = numberStr[i];
            const charX = x - (numberStr.length * charWidth) / 2 + i * charWidth;

            // Simple number drawing (simplified)
            for (let cx = 0; cx < charWidth; cx++) {
                for (let cy = 0; cy < charHeight; cy++) {
                    const pixelX = Math.floor(charX + cx);
                    const pixelY = Math.floor(y + cy - charHeight / 2);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if (Math.random() > 0.5) { // Simple pattern
                            image.setPixelColor(0xFF000000, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Add ancient coin design
     */
    async addAncientDesign(image, coinData, centerX, centerY, radius) {
        // Ancient symbols and patterns
        for (let i = -8; i < 8; i += 2) {
            for (let j = -8; j < 8; j += 2) {
                if (i * i + j * j <= 36) {
                    const pixelX = Math.floor(centerX + i);
                    const pixelY = Math.floor(centerY + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if ((i + j) % 4 === 0) {
                            image.setPixelColor(0xFF000000, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Add fantasy coin design
     */
    async addFantasyDesign(image, coinData, centerX, centerY, radius) {
        // Fantasy runes and symbols
        const runes = ['✨', '🔮', '⚡', '🌟', '💎'];
        const runeCount = Math.min(5, Math.floor(radius / 3));

        for (let i = 0; i < runeCount; i++) {
            const angle = (i / runeCount) * Math.PI * 2;
            const distance = radius * 0.6;
            const runeX = centerX + Math.cos(angle) * distance;
            const runeY = centerY + Math.sin(angle) * distance;

            // Draw rune (simplified as dot)
            const pixelX = Math.floor(runeX);
            const pixelY = Math.floor(runeY);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                image.setPixelColor(0xFF000000, pixelX, pixelY);
            }
        }
    }

    /**
     * Add royal coin design
     */
    async addRoyalDesign(image, coinData, centerX, centerY, radius) {
        // Crown or royal symbol in center
        for (let i = -6; i < 6; i++) {
            for (let j = -4; j < 2; j++) {
                const pixelX = Math.floor(centerX + i);
                const pixelY = Math.floor(centerY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) < 4 && j < 0) {
                        image.setPixelColor(0xFF000000, pixelX, pixelY);
                    }
                    // Crown points
                    if (Math.abs(i) <= 6 && Math.abs(i) >= 4 && j >= -2) {
                        image.setPixelColor(0xFF000000, pixelX, pixelY);
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
            case this.coinQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.coinQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.coinQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.coinQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Add minting effects
     */
    async addMintingEffects(image, appearance) {
        if (appearance.mintMark) {
            await this.addMintMark(image);
        }
    }

    /**
     * Calculate coin stats
     */
    calculateCoinStats(materialTemplate, denominationTemplate, qualityMods, size) {
        const sizeMultiplier = size === this.coinSizes.SMALL ? 0.7 : size === this.coinSizes.LARGE ? 1.3 : 1.0;

        const stats = {
            value: Math.round(materialTemplate.baseValue * denominationTemplate.multiplier * qualityMods.valueMultiplier),
            weight: Math.round(materialTemplate.weight * sizeMultiplier * 100) / 100,
            purity: Math.min(1.0, materialTemplate.purity * qualityMods.purityMultiplier),
            diameter: Math.round(denominationTemplate.diameter * sizeMultiplier),
            thickness: Math.round(denominationTemplate.thickness * sizeMultiplier * 100) / 100
        };

        return stats;
    }

    /**
     * Generate coin ID
     */
    generateCoinId() {
        return 'coin_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate coin name
     */
    generateCoinName(materialName, denominationName, quality) {
        const qualityPrefixes = {
            [this.coinQualities.COMMON]: '',
            [this.coinQualities.UNCOMMON]: 'Fine ',
            [this.coinQualities.RARE]: 'Rare ',
            [this.coinQualities.EPIC]: 'Epic ',
            [this.coinQualities.LEGENDARY]: 'Legendary ',
            [this.coinQualities.MYTHICAL]: 'Mythical '
        };

        return `${qualityPrefixes[quality]}${materialName} ${denominationName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(materialTemplate, denominationTemplate, quality) {
        const qualityDesc = {
            [this.coinQualities.COMMON]: 'A standard coin',
            [this.coinQualities.UNCOMMON]: 'A well-minted coin',
            [this.coinQualities.RARE]: 'A finely crafted coin',
            [this.coinQualities.EPIC]: 'A masterfully minted coin',
            [this.coinQualities.LEGENDARY]: 'A legendary coin of great value',
            [this.coinQualities.MYTHICAL]: 'A mythical coin of unimaginable worth'
        };

        return `${qualityDesc[quality]} made of ${materialTemplate.description.toLowerCase()}. ${denominationTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(materialTemplate, quality, pattern, minted) {
        const colors = this.coinColors[materialTemplate.color.toLowerCase().replace('#', '')] || this.coinColors.gold;

        return {
            baseColor: colors.base,
            edgeColor: colors.edge,
            highlightColor: colors.highlight,
            glowColor: colors.glow || null,
            material: materialTemplate,
            quality: quality,
            pattern: pattern,
            minted: minted,
            mintMark: minted
        };
    }

    /**
     * Generate effects
     */
    generateEffects(materialTemplate, stats, minted) {
        const effects = [];

        // Value effect
        effects.push({
            type: 'currency_value',
            power: stats.value,
            duration: -1, // Permanent
            instant: false
        });

        // Material-specific effects
        if (materialTemplate.features.includes('precious_metal')) {
            effects.push({
                type: 'collector_value',
                power: 1.5,
                duration: -1,
                instant: false
            });
        }

        if (materialTemplate.features.includes('enchanted')) {
            effects.push({
                type: 'magical_aura',
                power: 1,
                duration: -1,
                instant: false
            });
        }

        // Minting effects
        if (minted) {
            effects.push({
                type: 'mint_condition',
                power: 1.2,
                duration: -1,
                instant: false
            });
        }

        return effects;
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addRareGlow(image) { return image; }
    async addEpicGlow(image) { return image; }
    async addLegendaryGlow(image) { return image; }
    async addMythicalGlow(image) { return image; }
    async addMintMark(image) { return image; }

    /**
     * Batch generate coins
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const coin = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(coin);
            } catch (error) {
                console.error(`Failed to generate coin ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(c => c !== null);
    }

    /**
     * Generate coin by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.denomination) options.denomination = criteria.denomination;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.size) options.size = criteria.size;
        if (criteria.pattern) options.pattern = criteria.pattern;
        if (criteria.minted !== undefined) options.minted = criteria.minted;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get coin statistics
     */
    getCoinStatistics() {
        return {
            totalTypes: Object.keys(this.coinTypes).length,
            totalDenominations: Object.keys(this.coinDenominations).length,
            totalQualities: Object.keys(this.coinQualities).length,
            totalSizes: Object.keys(this.coinSizes).length,
            totalPatterns: Object.keys(this.coinPatterns).length,
            materialTemplates: Object.keys(this.coinMaterialTemplates).length,
            denominationTemplates: Object.keys(this.coinDenominationTemplates).length
        };
    }

    /**
     * Export coin data
     */
    async exportCoinData(coin, outputPath) {
        const exportData = {
            ...coin.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save coin data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate coin configuration
     */
    validateCoinConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.coinTypes).includes(config.type)) {
            errors.push(`Invalid coin type: ${config.type}`);
        }

        if (config.denomination && !Object.values(this.coinDenominations).includes(config.denomination)) {
            errors.push(`Invalid denomination: ${config.denomination}`);
        }

        if (config.quality && !Object.values(this.coinQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.size && !Object.values(this.coinSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.pattern && !Object.values(this.coinPatterns).includes(config.pattern)) {
            errors.push(`Invalid pattern: ${config.pattern}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = CoinGenerator;
