/**
 * Potion Generator - Complete potion and elixir sprite generation system
 * Generates magical potions with various effects, bottle types, and quality variations
 */

const Jimp = require('jimp');
const path = require('path');

class PotionGenerator {
    constructor() {
        this.potionTypes = {
            HEALTH: 'health',
            MANA: 'mana',
            BUFF: 'buff',
            DEBUFF: 'debuff',
            UTILITY: 'utility',
            ALCHEMICAL: 'alchemical'
        };

        this.bottleTypes = {
            GLASS: 'glass',
            CERAMIC: 'ceramic',
            METAL: 'metal',
            CRYSTAL: 'crystal',
            WOODEN: 'wooden',
            SKIN: 'skin'
        };

        this.potionQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.potionSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge'
        };

        // Potion effect templates
        this.healthPotionTemplates = {
            MINOR: {
                name: 'Minor Health Potion',
                description: 'Restores a small amount of health',
                baseHealing: 50,
                duration: 0,
                cooldown: 30,
                features: ['instant_heal', 'common', 'red']
            },
            MEDIUM: {
                name: 'Health Potion',
                description: 'Restores health',
                baseHealing: 100,
                duration: 0,
                cooldown: 45,
                features: ['instant_heal', 'versatile', 'red']
            },
            MAJOR: {
                name: 'Major Health Potion',
                description: 'Restores a large amount of health',
                baseHealing: 200,
                duration: 0,
                cooldown: 60,
                features: ['instant_heal', 'powerful', 'red']
            },
            SUPERIOR: {
                name: 'Superior Health Potion',
                description: 'Restores a massive amount of health',
                baseHealing: 400,
                duration: 0,
                cooldown: 90,
                features: ['instant_heal', 'premium', 'red']
            }
        };

        this.manaPotionTemplates = {
            MINOR: {
                name: 'Minor Mana Potion',
                description: 'Restores a small amount of mana',
                baseMana: 50,
                duration: 0,
                cooldown: 30,
                features: ['instant_mana', 'common', 'blue']
            },
            MEDIUM: {
                name: 'Mana Potion',
                description: 'Restores mana',
                baseMana: 100,
                duration: 0,
                cooldown: 45,
                features: ['instant_mana', 'versatile', 'blue']
            },
            MAJOR: {
                name: 'Major Mana Potion',
                description: 'Restores a large amount of mana',
                baseMana: 200,
                duration: 0,
                cooldown: 60,
                features: ['instant_mana', 'powerful', 'blue']
            },
            SUPERIOR: {
                name: 'Superior Mana Potion',
                description: 'Restores a massive amount of mana',
                baseMana: 400,
                duration: 0,
                cooldown: 90,
                features: ['instant_mana', 'premium', 'blue']
            }
        };

        this.buffPotionTemplates = {
            STRENGTH: {
                name: 'Strength Potion',
                description: 'Increases physical strength',
                effect: 'strength',
                basePower: 5,
                duration: 300,
                cooldown: 60,
                features: ['buff', 'combat', 'red']
            },
            SPEED: {
                name: 'Speed Potion',
                description: 'Increases movement speed',
                effect: 'speed',
                basePower: 20,
                duration: 240,
                cooldown: 45,
                features: ['buff', 'mobility', 'yellow']
            },
            DEFENSE: {
                name: 'Defense Potion',
                description: 'Increases physical defense',
                effect: 'defense',
                basePower: 10,
                duration: 360,
                cooldown: 75,
                features: ['buff', 'protection', 'green']
            },
            REGENERATION: {
                name: 'Regeneration Potion',
                description: 'Restores health over time',
                effect: 'regeneration',
                basePower: 5,
                duration: 180,
                cooldown: 90,
                features: ['buff', 'healing', 'pink']
            }
        };

        this.debuffPotionTemplates = {
            POISON: {
                name: 'Poison Potion',
                description: 'Deals damage over time',
                effect: 'poison',
                basePower: 8,
                duration: 120,
                cooldown: 30,
                features: ['debuff', 'damage', 'green']
            },
            SLOW: {
                name: 'Slow Potion',
                description: 'Reduces movement speed',
                effect: 'slow',
                basePower: 15,
                duration: 180,
                cooldown: 45,
                features: ['debuff', 'mobility', 'purple']
            },
            WEAKNESS: {
                name: 'Weakness Potion',
                description: 'Reduces physical strength',
                effect: 'weakness',
                basePower: 6,
                duration: 240,
                cooldown: 60,
                features: ['debuff', 'combat', 'gray']
            }
        };

        this.utilityPotionTemplates = {
            INVISIBILITY: {
                name: 'Invisibility Potion',
                description: 'Makes the drinker invisible',
                effect: 'invisibility',
                basePower: 1,
                duration: 180,
                cooldown: 300,
                features: ['utility', 'stealth', 'transparent']
            },
            TELEPORTATION: {
                name: 'Teleportation Potion',
                description: 'Allows short-range teleportation',
                effect: 'teleportation',
                basePower: 50,
                duration: 0,
                cooldown: 120,
                features: ['utility', 'movement', 'blue']
            },
            LEVITATION: {
                name: 'Levitation Potion',
                description: 'Allows floating and slow flight',
                effect: 'levitation',
                basePower: 1,
                duration: 120,
                cooldown: 180,
                features: ['utility', 'movement', 'white']
            }
        };

        // Bottle material properties
        this.bottleProperties = {
            [this.bottleTypes.GLASS]: {
                durability: 3,
                transparency: 0.9,
                weight: 0.2,
                color: '#E6F3FF',
                breakChance: 0.1
            },
            [this.bottleTypes.CERAMIC]: {
                durability: 6,
                transparency: 0.1,
                weight: 0.4,
                color: '#F5DEB3',
                breakChance: 0.05
            },
            [this.bottleTypes.METAL]: {
                durability: 10,
                transparency: 0.0,
                weight: 0.6,
                color: '#C0C0C0',
                breakChance: 0.02
            },
            [this.bottleTypes.CRYSTAL]: {
                durability: 8,
                transparency: 0.95,
                weight: 0.3,
                color: '#B0E0E6',
                breakChance: 0.15
            },
            [this.bottleTypes.WOODEN]: {
                durability: 5,
                transparency: 0.0,
                weight: 0.3,
                color: '#8B4513',
                breakChance: 0.08
            },
            [this.bottleTypes.SKIN]: {
                durability: 4,
                transparency: 0.0,
                weight: 0.25,
                color: '#D2691E',
                breakChance: 0.12
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.potionQualities.COMMON]: {
                statMultiplier: 1.0,
                durationMultiplier: 1.0,
                valueMultiplier: 1.0,
                rarity: 1
            },
            [this.potionQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                durationMultiplier: 1.1,
                valueMultiplier: 1.8,
                rarity: 2
            },
            [this.potionQualities.RARE]: {
                statMultiplier: 1.5,
                durationMultiplier: 1.25,
                valueMultiplier: 4.0,
                rarity: 3
            },
            [this.potionQualities.EPIC]: {
                statMultiplier: 2.0,
                durationMultiplier: 1.5,
                valueMultiplier: 12.0,
                rarity: 4
            },
            [this.potionQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                durationMultiplier: 2.0,
                valueMultiplier: 40.0,
                rarity: 5
            },
            [this.potionQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                durationMultiplier: 3.0,
                valueMultiplier: 150.0,
                rarity: 6
            }
        };

        // Potion color schemes
        this.potionColors = {
            red: { liquid: '#FF0000', glow: '#FF4444', bubbles: '#FF6666' },
            blue: { liquid: '#0000FF', glow: '#4444FF', bubbles: '#6666FF' },
            green: { liquid: '#00FF00', glow: '#44FF44', bubbles: '#66FF66' },
            yellow: { liquid: '#FFFF00', glow: '#FFFF44', bubbles: '#FFFF66' },
            purple: { liquid: '#800080', glow: '#A044A0', bubbles: '#C066C0' },
            pink: { liquid: '#FF69B4', glow: '#FF8BC4', bubbles: '#FFADD4' },
            white: { liquid: '#FFFFFF', glow: '#FFFFFF', bubbles: '#F0F0F0' },
            black: { liquid: '#000000', glow: '#333333', bubbles: '#666666' },
            orange: { liquid: '#FFA500', glow: '#FFB544', bubbles: '#FFC566' },
            transparent: { liquid: '#E6F3FF', glow: '#FFFFFF', bubbles: '#FFFFFF' }
        };
    }

    /**
     * Generate a potion sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.potionTypes.HEALTH,
            subtype: options.subtype || 'MEDIUM',
            bottleType: options.bottleType || this.bottleTypes.GLASS,
            quality: options.quality || this.potionQualities.COMMON,
            size: options.size || this.potionSizes.MEDIUM,
            enchanted: options.enchanted || false,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate template based on type
        let template;
        switch (config.type) {
            case this.potionTypes.HEALTH:
                template = this.healthPotionTemplates[config.subtype];
                break;
            case this.potionTypes.MANA:
                template = this.manaPotionTemplates[config.subtype];
                break;
            case this.potionTypes.BUFF:
                template = this.buffPotionTemplates[config.subtype];
                break;
            case this.potionTypes.DEBUFF:
                template = this.debuffPotionTemplates[config.subtype];
                break;
            case this.potionTypes.UTILITY:
                template = this.utilityPotionTemplates[config.subtype];
                break;
            default:
                template = this.healthPotionTemplates.MEDIUM;
        }

        if (!template) {
            throw new Error(`Unknown potion subtype: ${config.subtype}`);
        }

        // Apply material and quality modifiers
        const bottleProps = this.bottleProperties[config.bottleType];
        const qualityMods = this.qualityModifiers[config.quality];

        // Calculate final stats
        const finalStats = this.calculatePotionStats(template, qualityMods, config.size);

        // Generate potion data
        const potionData = {
            id: this.generatePotionId(),
            name: this.generatePotionName(template.name, config.quality),
            type: config.type,
            subtype: config.subtype,
            bottleType: config.bottleType,
            quality: config.quality,
            size: config.size,
            template: template,
            stats: finalStats,
            bottle: bottleProps,
            features: [...template.features],
            description: this.generateDescription(template, config.quality, config.bottleType),
            appearance: this.generateAppearance(template, config.bottleType, config.quality, config.enchanted),
            effects: this.generateEffects(template, finalStats, config.enchanted)
        };

        // Generate sprite image
        const spriteImage = await this.generatePotionSprite(potionData, config);

        return {
            image: spriteImage,
            data: potionData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'PotionGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate potion sprite image
     */
    async generatePotionSprite(potionData, config) {
        const width = config.width || 32;
        const height = config.height || 48;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw bottle
        await this.drawBottle(image, potionData, config);

        // Draw liquid
        await this.drawLiquid(image, potionData, config);

        // Add effects
        if (potionData.quality !== this.potionQualities.COMMON) {
            await this.addQualityEffects(image, potionData.quality);
        }

        // Add enchantment effects
        if (potionData.appearance.enchanted) {
            await this.addEnchantmentEffects(image, potionData.appearance);
        }

        return image;
    }

    /**
     * Draw bottle
     */
    async drawBottle(image, potionData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = config.size === this.potionSizes.SMALL ? 0.7 : config.size === this.potionSizes.LARGE ? 1.3 : 1.0;

        const bottleWidth = 12 * scale;
        const bottleHeight = 32 * scale;

        // Draw bottle based on type
        switch (potionData.bottleType) {
            case this.bottleTypes.GLASS:
                await this.drawGlassBottle(image, centerX, centerY, bottleWidth, bottleHeight, potionData.bottle);
                break;
            case this.bottleTypes.CERAMIC:
                await this.drawCeramicBottle(image, centerX, centerY, bottleWidth, bottleHeight, potionData.bottle);
                break;
            case this.bottleTypes.METAL:
                await this.drawMetalBottle(image, centerX, centerY, bottleWidth, bottleHeight, potionData.bottle);
                break;
            case this.bottleTypes.CRYSTAL:
                await this.drawCrystalBottle(image, centerX, centerY, bottleWidth, bottleHeight, potionData.bottle);
                break;
            case this.bottleTypes.WOODEN:
                await this.drawWoodenBottle(image, centerX, centerY, bottleWidth, bottleHeight, potionData.bottle);
                break;
            case this.bottleTypes.SKIN:
                await this.drawSkinBottle(image, centerX, centerY, bottleWidth, bottleHeight, potionData.bottle);
                break;
        }

        // Add cork/stopper
        await this.drawCork(image, centerX, centerY - bottleHeight / 2, scale, potionData.bottleType);
    }

    /**
     * Draw glass bottle
     */
    async drawGlassBottle(image, x, y, width, height, bottleProps) {
        // Bottle outline
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        // Glass with slight blue tint
                        const alpha = bottleProps.transparency * 0.8;
                        image.setPixelColor(
                            (Math.floor(bottleProps.color.slice(1, 3), 16) << 16) |
                            (Math.floor(bottleProps.color.slice(3, 5), 16) << 8) |
                            Math.floor(bottleProps.color.slice(5, 7), 16) |
                            (Math.floor(alpha * 255) << 24)
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw ceramic bottle
     */
    async drawCeramicBottle(image, x, y, width, height, bottleProps) {
        // Ceramic bottle with matte finish
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (Math.floor(bottleProps.color.slice(1, 3), 16) << 16) |
                            (Math.floor(bottleProps.color.slice(3, 5), 16) << 8) |
                            Math.floor(bottleProps.color.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw metal bottle
     */
    async drawMetalBottle(image, x, y, width, height, bottleProps) {
        // Metal bottle with metallic shine
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        // Add metallic highlights
                        const highlight = Math.sin(i * 0.5) * Math.cos(j * 0.3) > 0.5 ? 0.8 : 1.0;
                        const r = Math.min(255, Math.floor(parseInt(bottleProps.color.slice(1, 3), 16) * highlight));
                        const g = Math.min(255, Math.floor(parseInt(bottleProps.color.slice(3, 5), 16) * highlight));
                        const b = Math.min(255, Math.floor(parseInt(bottleProps.color.slice(5, 7), 16) * highlight));

                        image.setPixelColor((r << 16) | (g << 8) | b | 0xFF000000, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw crystal bottle
     */
    async drawCrystalBottle(image, x, y, width, height, bottleProps) {
        // Crystal bottle with facets
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        // Crystal with rainbow highlights
                        const rainbow = Math.sin(i * 0.3) * Math.cos(j * 0.4);
                        let color = bottleProps.color;
                        if (rainbow > 0.7) color = '#FF0000';
                        else if (rainbow > 0.3) color = '#00FF00';
                        else if (rainbow > -0.3) color = '#0000FF';
                        else if (rainbow > -0.7) color = '#FFFF00';

                        image.setPixelColor(
                            (parseInt(color.slice(1, 3), 16) << 16) |
                            (parseInt(color.slice(3, 5), 16) << 8) |
                            parseInt(color.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw wooden bottle
     */
    async drawWoodenBottle(image, x, y, width, height, bottleProps) {
        // Wooden bottle with grain pattern
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        // Wood grain pattern
                        const grain = Math.sin(j * 0.2) * Math.cos(i * 0.1) > 0.5 ? 0.9 : 1.0;
                        const r = Math.floor(parseInt(bottleProps.color.slice(1, 3), 16) * grain);
                        const g = Math.floor(parseInt(bottleProps.color.slice(3, 5), 16) * grain);
                        const b = Math.floor(parseInt(bottleProps.color.slice(5, 7), 16) * grain);

                        image.setPixelColor((r << 16) | (g << 8) | b | 0xFF000000, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw skin bottle
     */
    async drawSkinBottle(image, x, y, width, height, bottleProps) {
        // Leather skin bottle
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(bottleProps.color.slice(1, 3), 16) << 16) |
                            (parseInt(bottleProps.color.slice(3, 5), 16) << 8) |
                            parseInt(bottleProps.color.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw cork/stopper
     */
    async drawCork(image, x, y, scale, bottleType) {
        const corkWidth = 4 * scale;
        const corkHeight = 3 * scale;

        for (let i = -corkWidth / 2; i < corkWidth / 2; i++) {
            for (let j = 0; j < corkHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Cork color based on bottle type
                    let corkColor = '#8B4513'; // Default wood
                    if (bottleType === this.bottleTypes.GLASS || bottleType === this.bottleTypes.CRYSTAL) {
                        corkColor = '#654321'; // Darker cork
                    }

                    image.setPixelColor(
                        (parseInt(corkColor.slice(1, 3), 16) << 16) |
                        (parseInt(corkColor.slice(3, 5), 16) << 8) |
                        parseInt(corkColor.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw liquid
     */
    async drawLiquid(image, potionData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = config.size === this.potionSizes.SMALL ? 0.7 : config.size === this.potionSizes.LARGE ? 1.3 : 1.0;

        const liquidWidth = 8 * scale;
        const liquidHeight = 20 * scale;
        const liquidLevel = centerY + 2 * scale;

        // Get liquid color from appearance
        const liquidColor = potionData.appearance.liquidColor;

        // Draw liquid
        for (let i = -liquidWidth / 2; i < liquidWidth / 2; i++) {
            for (let j = 0; j < liquidHeight; j++) {
                const pixelX = Math.floor(centerX + i);
                const pixelY = Math.floor(liquidLevel + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Only draw if inside bottle
                    const bottleCheck = this.isInsideBottle(pixelX - centerX, pixelY - centerY, liquidWidth, liquidHeight);
                    if (bottleCheck) {
                        image.setPixelColor(
                            (parseInt(liquidColor.slice(1, 3), 16) << 16) |
                            (parseInt(liquidColor.slice(3, 5), 16) << 8) |
                            parseInt(liquidColor.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }

        // Add bubbles
        if (potionData.appearance.bubbles) {
            await this.addBubbles(image, centerX, liquidLevel, liquidWidth, liquidHeight, potionData.appearance.bubbleColor);
        }
    }

    /**
     * Check if point is inside bottle
     */
    isInsideBottle(relX, relY, width, height) {
        const bottleWidth = 12;
        const bottleHeight = 32;
        const distFromCenter = Math.abs(relX) / (bottleWidth / 2) + Math.abs(relY) / (bottleHeight / 2);
        return distFromCenter <= 0.9;
    }

    /**
     * Add bubbles to liquid
     */
    async addBubbles(image, centerX, liquidLevel, width, height, bubbleColor) {
        const bubbleCount = Math.floor(Math.random() * 5) + 3;

        for (let i = 0; i < bubbleCount; i++) {
            const bubbleX = centerX + (Math.random() - 0.5) * width * 0.8;
            const bubbleY = liquidLevel + Math.random() * height * 0.6;
            const bubbleSize = Math.random() * 2 + 1;

            for (let bx = -bubbleSize; bx < bubbleSize; bx++) {
                for (let by = -bubbleSize; by < bubbleSize; by++) {
                    if (bx * bx + by * by <= bubbleSize * bubbleSize) {
                        const pixelX = Math.floor(bubbleX + bx);
                        const pixelY = Math.floor(bubbleY + by);
                        if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                            if (this.isInsideBottle(pixelX - centerX, pixelY - liquidLevel - height / 2, width, height)) {
                                image.setPixelColor(
                                    (parseInt(bubbleColor.slice(1, 3), 16) << 16) |
                                    (parseInt(bubbleColor.slice(3, 5), 16) << 8) |
                                    parseInt(bubbleColor.slice(5, 7), 16) |
                                    0xFF000000
                                , pixelX, pixelY);
                            }
                        }
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
            case this.potionQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.potionQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.potionQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.potionQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Add enchantment effects
     */
    async addEnchantmentEffects(image, appearance) {
        if (appearance.glowColor) {
            await this.addGlowEffect(image, appearance.glowColor);
        }
    }

    /**
     * Calculate potion stats
     */
    calculatePotionStats(template, qualityMods, size) {
        const sizeMultiplier = size === this.potionSizes.SMALL ? 0.7 : size === this.potionSizes.LARGE ? 1.3 : 1.0;

        const stats = {
            power: Math.round((template.baseHealing || template.baseMana || template.basePower || 0) * qualityMods.statMultiplier * sizeMultiplier),
            duration: Math.round((template.duration || 0) * qualityMods.durationMultiplier),
            cooldown: template.cooldown || 0,
            value: Math.round(10 * qualityMods.valueMultiplier * sizeMultiplier)
        };

        return stats;
    }

    /**
     * Generate potion ID
     */
    generatePotionId() {
        return 'potion_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate potion name
     */
    generatePotionName(baseName, quality) {
        const qualityPrefixes = {
            [this.potionQualities.COMMON]: '',
            [this.potionQualities.UNCOMMON]: 'Fine ',
            [this.potionQualities.RARE]: 'Rare ',
            [this.potionQualities.EPIC]: 'Epic ',
            [this.potionQualities.LEGENDARY]: 'Legendary ',
            [this.potionQualities.MYTHICAL]: 'Mythical '
        };

        return `${qualityPrefixes[quality]}${baseName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(template, quality, bottleType) {
        const qualityDesc = {
            [this.potionQualities.COMMON]: 'A standard potion',
            [this.potionQualities.UNCOMMON]: 'A well-crafted potion',
            [this.potionQualities.RARE]: 'A finely made potion',
            [this.potionQualities.EPIC]: 'A masterfully crafted potion',
            [this.potionQualities.LEGENDARY]: 'A legendary potion of great power',
            [this.potionQualities.MYTHICAL]: 'A mythical potion of unimaginable power'
        };

        const bottleDesc = {
            [this.bottleTypes.GLASS]: 'in a glass bottle',
            [this.bottleTypes.CERAMIC]: 'in a ceramic bottle',
            [this.bottleTypes.METAL]: 'in a metal flask',
            [this.bottleTypes.CRYSTAL]: 'in a crystal vial',
            [this.bottleTypes.WOODEN]: 'in a wooden flask',
            [this.bottleTypes.SKIN]: 'in a leather skin'
        };

        return `${qualityDesc[quality]} ${bottleDesc[bottleType]}. ${template.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(template, bottleType, quality, enchanted) {
        // Determine liquid color based on potion type
        let liquidColor = '#FF0000'; // Default red
        let glowColor = null;
        let bubbles = false;
        let bubbleColor = '#FFFFFF';

        // Set colors based on potion features
        if (template.features.includes('red')) {
            liquidColor = this.potionColors.red.liquid;
            glowColor = this.potionColors.red.glow;
            bubbleColor = this.potionColors.red.bubbles;
        } else if (template.features.includes('blue')) {
            liquidColor = this.potionColors.blue.liquid;
            glowColor = this.potionColors.blue.glow;
            bubbleColor = this.potionColors.blue.bubbles;
        } else if (template.features.includes('green')) {
            liquidColor = this.potionColors.green.liquid;
            glowColor = this.potionColors.green.glow;
            bubbleColor = this.potionColors.green.bubbles;
        } else if (template.features.includes('yellow')) {
            liquidColor = this.potionColors.yellow.liquid;
            glowColor = this.potionColors.yellow.glow;
            bubbleColor = this.potionColors.yellow.bubbles;
        } else if (template.features.includes('purple')) {
            liquidColor = this.potionColors.purple.liquid;
            glowColor = this.potionColors.purple.glow;
            bubbleColor = this.potionColors.purple.bubbles;
        } else if (template.features.includes('pink')) {
            liquidColor = this.potionColors.pink.liquid;
            glowColor = this.potionColors.pink.glow;
            bubbleColor = this.potionColors.pink.bubbles;
        } else if (template.features.includes('white')) {
            liquidColor = this.potionColors.white.liquid;
            glowColor = this.potionColors.white.glow;
            bubbleColor = this.potionColors.white.bubbles;
        } else if (template.features.includes('transparent')) {
            liquidColor = this.potionColors.transparent.liquid;
            glowColor = this.potionColors.transparent.glow;
            bubbleColor = this.potionColors.transparent.bubbles;
        }

        // Add bubbles for certain potion types
        if (template.features.includes('buff') || template.features.includes('utility')) {
            bubbles = true;
        }

        // Enhance glow for higher qualities
        if (quality === this.potionQualities.EPIC || quality === this.potionQualities.LEGENDARY || quality === this.potionQualities.MYTHICAL) {
            glowColor = this.adjustGlowColor(glowColor, quality);
        }

        return {
            liquidColor: liquidColor,
            glowColor: enchanted ? glowColor : null,
            bubbles: bubbles,
            bubbleColor: bubbleColor,
            bottleType: bottleType,
            quality: quality,
            enchanted: enchanted
        };
    }

    /**
     * Generate effects
     */
    generateEffects(template, stats, enchanted) {
        const effects = [];

        // Primary effect based on potion type
        if (template.baseHealing) {
            effects.push({
                type: 'heal',
                power: stats.power,
                duration: stats.duration,
                instant: true
            });
        } else if (template.baseMana) {
            effects.push({
                type: 'restore_mana',
                power: stats.power,
                duration: stats.duration,
                instant: true
            });
        } else if (template.effect) {
            effects.push({
                type: template.effect,
                power: stats.power,
                duration: stats.duration,
                instant: false
            });
        }

        // Add cooldown
        if (stats.cooldown > 0) {
            effects.push({
                type: 'cooldown',
                power: stats.cooldown,
                duration: stats.cooldown,
                instant: false
            });
        }

        // Add enchantment effects
        if (enchanted) {
            effects.push({
                type: 'enchantment',
                power: 1,
                duration: stats.duration,
                instant: false
            });
        }

        return effects;
    }

    /**
     * Adjust glow color for higher qualities
     */
    adjustGlowColor(baseColor, quality) {
        if (!baseColor) return '#FFFFFF';

        const rgb = this.hexToRgb(baseColor);
        let multiplier = 1.0;

        switch (quality) {
            case this.potionQualities.EPIC:
                multiplier = 1.3;
                break;
            case this.potionQualities.LEGENDARY:
                multiplier = 1.6;
                break;
            case this.potionQualities.MYTHICAL:
                multiplier = 2.0;
                break;
        }

        const newR = Math.min(255, Math.floor(rgb.r * multiplier));
        const newG = Math.min(255, Math.floor(rgb.g * multiplier));
        const newB = Math.min(255, Math.floor(rgb.b * multiplier));

        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * Utility functions
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addRareGlow(image) { return image; }
    async addEpicGlow(image) { return image; }
    async addLegendaryGlow(image) { return image; }
    async addMythicalGlow(image) { return image; }
    async addGlowEffect(image, color) { return image; }

    /**
     * Batch generate potions
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const potion = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(potion);
            } catch (error) {
                console.error(`Failed to generate potion ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(p => p !== null);
    }

    /**
     * Generate potion by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.subtype) options.subtype = criteria.subtype;
        if (criteria.bottleType) options.bottleType = criteria.bottleType;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.size) options.size = criteria.size;
        if (criteria.enchanted !== undefined) options.enchanted = criteria.enchanted;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get potion statistics
     */
    getPotionStatistics() {
        return {
            totalTypes: Object.keys(this.potionTypes).length,
            totalBottleTypes: Object.keys(this.bottleTypes).length,
            totalQualities: Object.keys(this.potionQualities).length,
            totalSizes: Object.keys(this.potionSizes).length,
            healthPotionTypes: Object.keys(this.healthPotionTemplates).length,
            manaPotionTypes: Object.keys(this.manaPotionTemplates).length,
            buffPotionTypes: Object.keys(this.buffPotionTemplates).length,
            debuffPotionTypes: Object.keys(this.debuffPotionTemplates).length,
            utilityPotionTypes: Object.keys(this.utilityPotionTemplates).length
        };
    }

    /**
     * Export potion data
     */
    async exportPotionData(potion, outputPath) {
        const exportData = {
            ...potion.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save potion data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate potion configuration
     */
    validatePotionConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.potionTypes).includes(config.type)) {
            errors.push(`Invalid potion type: ${config.type}`);
        }

        if (config.bottleType && !Object.values(this.bottleTypes).includes(config.bottleType)) {
            errors.push(`Invalid bottle type: ${config.bottleType}`);
        }

        if (config.quality && !Object.values(this.potionQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.size && !Object.values(this.potionSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = PotionGenerator;
