/**
 * Key Generator - Complete key and lock sprite generation system
 * Generates various types of keys with different materials, designs, and magical properties
 */

const Jimp = require('jimp');
const path = require('path');

class KeyGenerator {
    constructor() {
        this.keyTypes = {
            DOOR: 'door',
            CHEST: 'chest',
            GATE: 'gate',
            MASTER: 'master',
            SKELETON: 'skeleton',
            MAGICAL: 'magical'
        };

        this.materialTypes = {
            IRON: 'iron',
            BRASS: 'brass',
            SILVER: 'silver',
            GOLD: 'gold',
            MITHRIL: 'mithril',
            ADAMANT: 'adamant',
            MAGICAL: 'magical',
            BONE: 'bone'
        };

        this.keyQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.keySizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge'
        };

        // Door key templates
        this.doorKeyTemplates = {
            HOUSE: {
                name: 'House Key',
                description: 'A standard house key',
                keyType: 'house',
                complexity: 3,
                durability: 80,
                features: ['house_access', 'standard_lock', 'residential']
            },
            CHEST: {
                name: 'Chest Key',
                description: 'A key for opening chests',
                keyType: 'chest',
                complexity: 2,
                durability: 60,
                features: ['chest_access', 'simple_lock', 'storage']
            },
            GATE: {
                name: 'Gate Key',
                description: 'A large key for gates',
                keyType: 'gate',
                complexity: 4,
                durability: 100,
                features: ['gate_access', 'heavy_lock', 'security']
            }
        };

        // Master key templates
        this.masterKeyTemplates = {
            HOUSE_MASTER: {
                name: 'House Master Key',
                description: 'Opens multiple house doors',
                keyType: 'master_house',
                complexity: 5,
                durability: 120,
                unlocks: ['house', 'cottage', 'manor'],
                features: ['multi_house', 'master_key', 'convenience']
            },
            CHEST_MASTER: {
                name: 'Chest Master Key',
                description: 'Opens various chests',
                keyType: 'master_chest',
                complexity: 4,
                durability: 90,
                unlocks: ['chest', 'box', 'coffer'],
                features: ['multi_chest', 'master_key', 'treasure']
            },
            BUILDING_MASTER: {
                name: 'Building Master Key',
                description: 'Opens all building doors',
                keyType: 'master_building',
                complexity: 6,
                durability: 150,
                unlocks: ['house', 'shop', 'tavern', 'castle'],
                features: ['multi_building', 'master_key', 'authority']
            }
        };

        // Skeleton key templates
        this.skeletonKeyTemplates = {
            BASIC_SKELETON: {
                name: 'Skeleton Key',
                description: 'Can pick simple locks',
                keyType: 'skeleton_basic',
                complexity: 3,
                durability: 40,
                successRate: 0.6,
                features: ['lockpicking', 'basic_locks', 'thief_tool']
            },
            ADVANCED_SKELETON: {
                name: 'Advanced Skeleton Key',
                description: 'Can pick complex locks',
                keyType: 'skeleton_advanced',
                complexity: 5,
                durability: 60,
                successRate: 0.8,
                features: ['lockpicking', 'complex_locks', 'master_thief']
            },
            PERFECT_SKELETON: {
                name: 'Perfect Skeleton Key',
                description: 'Opens almost any lock',
                keyType: 'skeleton_perfect',
                complexity: 7,
                durability: 80,
                successRate: 0.95,
                features: ['lockpicking', 'any_lock', 'legendary_thief']
            }
        };

        // Material properties
        this.materialProperties = {
            [this.materialTypes.IRON]: {
                durability: 1.0,
                flexibility: 0.8,
                color: '#708090',
                magicalAffinity: 0.2,
                value: 1.0,
                weight: 1.0
            },
            [this.materialTypes.BRASS]: {
                durability: 0.8,
                flexibility: 0.9,
                color: '#B87333',
                magicalAffinity: 0.3,
                value: 1.5,
                weight: 0.9
            },
            [this.materialTypes.SILVER]: {
                durability: 0.9,
                flexibility: 0.85,
                color: '#C0C0C0',
                magicalAffinity: 0.6,
                value: 5.0,
                weight: 0.95
            },
            [this.materialTypes.GOLD]: {
                durability: 0.7,
                flexibility: 0.75,
                color: '#FFD700',
                magicalAffinity: 0.4,
                value: 10.0,
                weight: 1.2
            },
            [this.materialTypes.MITHRIL]: {
                durability: 2.0,
                flexibility: 1.5,
                color: '#C0C0C0',
                magicalAffinity: 0.9,
                value: 25.0,
                weight: 0.4
            },
            [this.materialTypes.ADAMANT]: {
                durability: 3.0,
                flexibility: 2.0,
                color: '#696969',
                magicalAffinity: 0.5,
                value: 60.0,
                weight: 0.9
            },
            [this.materialTypes.MAGICAL]: {
                durability: 2.5,
                flexibility: 1.8,
                color: '#9370DB',
                magicalAffinity: 1.0,
                value: 100.0,
                weight: 0.6
            },
            [this.materialTypes.BONE]: {
                durability: 0.6,
                flexibility: 0.7,
                color: '#F5F5DC',
                magicalAffinity: 0.7,
                value: 2.0,
                weight: 0.5
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.keyQualities.COMMON]: {
                statMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                valueMultiplier: 1.0,
                successMultiplier: 1.0,
                rarity: 1
            },
            [this.keyQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                durabilityMultiplier: 1.1,
                valueMultiplier: 1.8,
                successMultiplier: 1.1,
                rarity: 2
            },
            [this.keyQualities.RARE]: {
                statMultiplier: 1.5,
                durabilityMultiplier: 1.25,
                valueMultiplier: 4.0,
                successMultiplier: 1.25,
                rarity: 3
            },
            [this.keyQualities.EPIC]: {
                statMultiplier: 2.0,
                durabilityMultiplier: 1.5,
                valueMultiplier: 12.0,
                successMultiplier: 1.5,
                rarity: 4
            },
            [this.keyQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                durabilityMultiplier: 2.0,
                valueMultiplier: 40.0,
                successMultiplier: 2.0,
                rarity: 5
            },
            [this.keyQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                durabilityMultiplier: 3.0,
                valueMultiplier: 150.0,
                successMultiplier: 3.0,
                rarity: 6
            }
        };

        // Key design patterns
        this.keyPatterns = {
            SIMPLE: 'simple',
            COMPLEX: 'complex',
            ORNATE: 'ornate',
            ANCIENT: 'ancient',
            MAGICAL: 'magical'
        };

        // Key colors and effects
        this.keyColors = {
            iron: { base: '#708090', handle: '#654321', teeth: '#2F4F4F' },
            brass: { base: '#B87333', handle: '#654321', teeth: '#8B4513' },
            silver: { base: '#C0C0C0', handle: '#654321', teeth: '#808080' },
            gold: { base: '#FFD700', handle: '#654321', teeth: '#B8860B' },
            mithril: { base: '#C0C0C0', handle: '#654321', teeth: '#A9A9A9', glow: '#E6E6FA' },
            adamant: { base: '#696969', handle: '#654321', teeth: '#2F4F4F', glow: '#D3D3D3' },
            magical: { base: '#9370DB', handle: '#654321', teeth: '#4B0082', glow: '#DA70D6' },
            bone: { base: '#F5F5DC', handle: '#F5F5DC', teeth: '#DEB887' }
        };
    }

    /**
     * Generate a key sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.keyTypes.DOOR,
            subtype: options.subtype || 'HOUSE',
            material: options.material || this.materialTypes.IRON,
            quality: options.quality || this.keyQualities.COMMON,
            size: options.size || this.keySizes.MEDIUM,
            pattern: options.pattern || this.keyPatterns.SIMPLE,
            enchanted: options.enchanted || false,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate template based on type
        let template;
        switch (config.type) {
            case this.keyTypes.DOOR:
                template = this.doorKeyTemplates[config.subtype];
                break;
            case this.keyTypes.CHEST:
                template = this.doorKeyTemplates[config.subtype] || this.doorKeyTemplates.CHEST;
                break;
            case this.keyTypes.GATE:
                template = this.doorKeyTemplates[config.subtype] || this.doorKeyTemplates.GATE;
                break;
            case this.keyTypes.MASTER:
                template = this.masterKeyTemplates[config.subtype];
                break;
            case this.keyTypes.SKELETON:
                template = this.skeletonKeyTemplates[config.subtype];
                break;
            default:
                template = this.doorKeyTemplates.HOUSE;
        }

        if (!template) {
            throw new Error(`Unknown key subtype: ${config.subtype}`);
        }

        // Apply material and quality modifiers
        const materialProps = this.materialProperties[config.material];
        const qualityMods = this.qualityModifiers[config.quality];

        // Calculate final stats
        const finalStats = this.calculateKeyStats(template, materialProps, qualityMods, config.size);

        // Generate key data
        const keyData = {
            id: this.generateKeyId(),
            name: this.generateKeyName(template.name, config.material, config.quality),
            type: config.type,
            subtype: config.subtype,
            material: config.material,
            quality: config.quality,
            size: config.size,
            pattern: config.pattern,
            template: template,
            stats: finalStats,
            materialProps: materialProps,
            features: [...template.features],
            description: this.generateDescription(template, config.material, config.quality),
            appearance: this.generateAppearance(template, config.material, config.quality, config.pattern, config.enchanted),
            effects: this.generateEffects(template, finalStats, config.enchanted)
        };

        // Generate sprite image
        const spriteImage = await this.generateKeySprite(keyData, config);

        return {
            image: spriteImage,
            data: keyData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'KeyGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate key sprite image
     */
    async generateKeySprite(keyData, config) {
        const width = config.width || 48;
        const height = config.height || 32;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw key based on type
        await this.drawKeyBase(image, keyData, config);

        // Apply quality effects
        if (keyData.quality !== this.keyQualities.COMMON) {
            await this.addQualityEffects(image, keyData.quality);
        }

        // Add enchantment effects
        if (keyData.appearance.enchanted) {
            await this.addEnchantmentEffects(image, keyData.appearance);
        }

        return image;
    }

    /**
     * Draw key base shape
     */
    async drawKeyBase(image, keyData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = config.size === this.keySizes.SMALL ? 0.7 : config.size === this.keySizes.LARGE ? 1.3 : 1.0;

        // Draw key based on type
        switch (keyData.type) {
            case this.keyTypes.DOOR:
            case this.keyTypes.CHEST:
            case this.keyTypes.GATE:
                await this.drawStandardKey(image, centerX, centerY, scale, keyData.material, keyData.pattern);
                break;
            case this.keyTypes.MASTER:
                await this.drawMasterKey(image, centerX, centerY, scale, keyData.material, keyData.pattern);
                break;
            case this.keyTypes.SKELETON:
                await this.drawSkeletonKey(image, centerX, centerY, scale, keyData.material, keyData.pattern);
                break;
        }
    }

    /**
     * Draw standard key
     */
    async drawStandardKey(image, x, y, scale, material, pattern) {
        const colors = this.keyColors[material];

        // Key shaft
        for (let i = -2; i < 3; i++) {
            for (let j = -12 * scale; j < 8 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.base.slice(1, 3), 16) << 16) |
                        (parseInt(colors.base.slice(3, 5), 16) << 8) |
                        parseInt(colors.base.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Key handle
        for (let i = -4 * scale; i < 4 * scale; i++) {
            for (let j = 6 * scale; j < 12 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Key teeth
        await this.drawKeyTeeth(image, x, y, scale, material, pattern);
    }

    /**
     * Draw master key
     */
    async drawMasterKey(image, x, y, scale, material, pattern) {
        const colors = this.keyColors[material];

        // Larger shaft for master key
        for (let i = -3; i < 4; i++) {
            for (let j = -15 * scale; j < 10 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.base.slice(1, 3), 16) << 16) |
                        (parseInt(colors.base.slice(3, 5), 16) << 8) |
                        parseInt(colors.base.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Master key handle (more ornate)
        for (let i = -5 * scale; i < 5 * scale; i++) {
            for (let j = 8 * scale; j < 14 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Master key teeth (more complex)
        await this.drawMasterKeyTeeth(image, x, y, scale, material, pattern);
    }

    /**
     * Draw skeleton key
     */
    async drawSkeletonKey(image, x, y, scale, material, pattern) {
        const colors = this.keyColors[material];

        // Thin shaft for skeleton key
        for (let i = -1; i < 2; i++) {
            for (let j = -10 * scale; j < 6 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.base.slice(1, 3), 16) << 16) |
                        (parseInt(colors.base.slice(3, 5), 16) << 8) |
                        parseInt(colors.base.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Skeleton key handle
        for (let i = -3 * scale; i < 3 * scale; i++) {
            for (let j = 4 * scale; j < 8 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Skeleton key teeth (minimal)
        await this.drawSkeletonKeyTeeth(image, x, y, scale, material, pattern);
    }

    /**
     * Draw key teeth
     */
    async drawKeyTeeth(image, x, y, scale, material, pattern) {
        const colors = this.keyColors[material];
        const teeth = this.generateKeyTeeth(pattern);

        for (let i = 0; i < teeth.length; i++) {
            const tooth = teeth[i];
            const toothX = x - 8 * scale + i * 2 * scale;
            const toothY = y - tooth.depth * scale;

            for (let tx = -0.5 * scale; tx < 0.5 * scale; tx++) {
                for (let ty = 0; ty < tooth.depth * scale; ty++) {
                    const pixelX = Math.floor(toothX + tx);
                    const pixelY = Math.floor(toothY + ty);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.teeth.slice(1, 3), 16) << 16) |
                            (parseInt(colors.teeth.slice(3, 5), 16) << 8) |
                            parseInt(colors.teeth.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw master key teeth
     */
    async drawMasterKeyTeeth(image, x, y, scale, material, pattern) {
        const colors = this.keyColors[material];
        const teeth = this.generateMasterKeyTeeth(pattern);

        for (let i = 0; i < teeth.length; i++) {
            const tooth = teeth[i];
            const toothX = x - 10 * scale + i * 2 * scale;
            const toothY = y - tooth.depth * scale;

            for (let tx = -0.5 * scale; tx < 0.5 * scale; tx++) {
                for (let ty = 0; ty < tooth.depth * scale; ty++) {
                    const pixelX = Math.floor(toothX + tx);
                    const pixelY = Math.floor(toothY + ty);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.teeth.slice(1, 3), 16) << 16) |
                            (parseInt(colors.teeth.slice(3, 5), 16) << 8) |
                            parseInt(colors.teeth.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw skeleton key teeth
     */
    async drawSkeletonKeyTeeth(image, x, y, scale, material, pattern) {
        const colors = this.keyColors[material];
        const teeth = this.generateSkeletonKeyTeeth(pattern);

        for (let i = 0; i < teeth.length; i++) {
            const tooth = teeth[i];
            const toothX = x - 6 * scale + i * 2 * scale;
            const toothY = y - tooth.depth * scale;

            for (let tx = -0.3 * scale; tx < 0.3 * scale; tx++) {
                for (let ty = 0; ty < tooth.depth * scale; ty++) {
                    const pixelX = Math.floor(toothX + tx);
                    const pixelY = Math.floor(toothY + ty);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.teeth.slice(1, 3), 16) << 16) |
                            (parseInt(colors.teeth.slice(3, 5), 16) << 8) |
                            parseInt(colors.teeth.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Generate key teeth pattern
     */
    generateKeyTeeth(pattern) {
        const teeth = [];
        const numTeeth = pattern === this.keyPatterns.COMPLEX ? 6 : pattern === this.keyPatterns.ORNATE ? 8 : 4;

        for (let i = 0; i < numTeeth; i++) {
            teeth.push({
                depth: 2 + Math.random() * 3,
                width: 1 + Math.random() * 0.5
            });
        }

        return teeth;
    }

    /**
     * Generate master key teeth pattern
     */
    generateMasterKeyTeeth(pattern) {
        const teeth = [];
        const numTeeth = 8;

        for (let i = 0; i < numTeeth; i++) {
            teeth.push({
                depth: 3 + Math.random() * 4,
                width: 1.5 + Math.random() * 0.5
            });
        }

        return teeth;
    }

    /**
     * Generate skeleton key teeth pattern
     */
    generateSkeletonKeyTeeth(pattern) {
        const teeth = [];
        const numTeeth = 3;

        for (let i = 0; i < numTeeth; i++) {
            teeth.push({
                depth: 1 + Math.random() * 2,
                width: 0.5 + Math.random() * 0.3
            });
        }

        return teeth;
    }

    /**
     * Add quality effects
     */
    async addQualityEffects(image, quality) {
        switch (quality) {
            case this.keyQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.keyQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.keyQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.keyQualities.MYTHICAL:
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
     * Calculate key stats
     */
    calculateKeyStats(template, materialProps, qualityMods, size) {
        const sizeMultiplier = size === this.keySizes.SMALL ? 0.7 : size === this.keySizes.LARGE ? 1.3 : 1.0;

        const stats = {
            durability: Math.round(template.durability * materialProps.durability * qualityMods.durabilityMultiplier),
            complexity: template.complexity || 3,
            value: Math.round(materialProps.value * qualityMods.valueMultiplier * sizeMultiplier),
            weight: Math.round(materialProps.weight * sizeMultiplier * 100) / 100,
            successRate: (template.successRate || 1.0) * qualityMods.successMultiplier
        };

        return stats;
    }

    /**
     * Generate key ID
     */
    generateKeyId() {
        return 'key_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate key name
     */
    generateKeyName(baseName, material, quality) {
        const qualityPrefixes = {
            [this.keyQualities.COMMON]: '',
            [this.keyQualities.UNCOMMON]: 'Fine ',
            [this.keyQualities.RARE]: 'Rare ',
            [this.keyQualities.EPIC]: 'Epic ',
            [this.keyQualities.LEGENDARY]: 'Legendary ',
            [this.keyQualities.MYTHICAL]: 'Mythical '
        };

        const materialSuffixes = {
            [this.materialTypes.IRON]: 'Iron ',
            [this.materialTypes.BRASS]: 'Brass ',
            [this.materialTypes.SILVER]: 'Silver ',
            [this.materialTypes.GOLD]: 'Gold ',
            [this.materialTypes.MITHRIL]: 'Mithril ',
            [this.materialTypes.ADAMANT]: 'Adamant ',
            [this.materialTypes.MAGICAL]: 'Magical ',
            [this.materialTypes.BONE]: 'Bone '
        };

        return `${qualityPrefixes[quality]}${materialSuffixes[material]}${baseName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(template, material, quality) {
        const qualityDesc = {
            [this.keyQualities.COMMON]: 'A standard key',
            [this.keyQualities.UNCOMMON]: 'A well-crafted key',
            [this.keyQualities.RARE]: 'A finely made key',
            [this.keyQualities.EPIC]: 'A masterfully crafted key',
            [this.keyQualities.LEGENDARY]: 'A legendary key of great power',
            [this.keyQualities.MYTHICAL]: 'A mythical key of unimaginable power'
        };

        const materialDesc = {
            [this.materialTypes.IRON]: 'forged from iron',
            [this.materialTypes.BRASS]: 'crafted from brass',
            [this.materialTypes.SILVER]: 'made of silver',
            [this.materialTypes.GOLD]: 'crafted from gold',
            [this.materialTypes.MITHRIL]: 'forged from mithril',
            [this.materialTypes.ADAMANT]: 'made of adamant',
            [this.materialTypes.MAGICAL]: 'imbued with magic',
            [this.materialTypes.BONE]: 'carved from bone'
        };

        return `${qualityDesc[quality]} ${materialDesc[material]}. ${template.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(template, material, quality, pattern, enchanted) {
        const colors = this.keyColors[material];

        return {
            baseColor: colors.base,
            handleColor: colors.handle,
            teethColor: colors.teeth,
            glowColor: enchanted && colors.glow ? colors.glow : null,
            material: material,
            quality: quality,
            pattern: pattern,
            enchanted: enchanted
        };
    }

    /**
     * Generate effects
     */
    generateEffects(template, stats, enchanted) {
        const effects = [];

        // Primary key effect
        effects.push({
            type: 'unlocking',
            power: stats.complexity,
            duration: -1, // Permanent
            instant: false
        });

        // Durability effect
        effects.push({
            type: 'durability',
            power: stats.durability,
            duration: -1,
            instant: false
        });

        // Success rate for skeleton keys
        if (stats.successRate && stats.successRate < 1.0) {
            effects.push({
                type: 'success_rate',
                power: stats.successRate,
                duration: -1,
                instant: false
            });
        }

        // Material-specific effects
        if (template.unlocks) {
            effects.push({
                type: 'multi_unlock',
                power: template.unlocks.length,
                duration: -1,
                instant: false
            });
        }

        // Enchantment effects
        if (enchanted) {
            effects.push({
                type: 'enchantment',
                power: 1,
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
    async addGlowEffect(image, color) { return image; }

    /**
     * Batch generate keys
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const key = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(key);
            } catch (error) {
                console.error(`Failed to generate key ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(k => k !== null);
    }

    /**
     * Generate key by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.subtype) options.subtype = criteria.subtype;
        if (criteria.material) options.material = criteria.material;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.size) options.size = criteria.size;
        if (criteria.pattern) options.pattern = criteria.pattern;
        if (criteria.enchanted !== undefined) options.enchanted = criteria.enchanted;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get key statistics
     */
    getKeyStatistics() {
        return {
            totalTypes: Object.keys(this.keyTypes).length,
            totalMaterials: Object.keys(this.materialTypes).length,
            totalQualities: Object.keys(this.keyQualities).length,
            totalSizes: Object.keys(this.keySizes).length,
            totalPatterns: Object.keys(this.keyPatterns).length,
            doorKeyTypes: Object.keys(this.doorKeyTemplates).length,
            masterKeyTypes: Object.keys(this.masterKeyTemplates).length,
            skeletonKeyTypes: Object.keys(this.skeletonKeyTemplates).length
        };
    }

    /**
     * Export key data
     */
    async exportKeyData(key, outputPath) {
        const exportData = {
            ...key.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save key data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate key configuration
     */
    validateKeyConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.keyTypes).includes(config.type)) {
            errors.push(`Invalid key type: ${config.type}`);
        }

        if (config.material && !Object.values(this.materialTypes).includes(config.material)) {
            errors.push(`Invalid material type: ${config.material}`);
        }

        if (config.quality && !Object.values(this.keyQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.size && !Object.values(this.keySizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.pattern && !Object.values(this.keyPatterns).includes(config.pattern)) {
            errors.push(`Invalid pattern: ${config.pattern}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = KeyGenerator;
