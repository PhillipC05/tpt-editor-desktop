/**
 * Treasure Chest Generator - Complete treasure chest and container sprite generation system
 * Generates various types of chests with different materials, locks, and treasure contents
 */

const Jimp = require('jimp');
const path = require('path');

class TreasureChestGenerator {
    constructor() {
        this.chestTypes = {
            WOODEN: 'wooden',
            METAL: 'metal',
            ORNATE: 'ornate',
            MAGICAL: 'magical',
            ANCIENT: 'ancient',
            PIRATE: 'pirate'
        };

        this.chestSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge'
        };

        this.chestQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.lockTypes = {
            NONE: 'none',
            SIMPLE: 'simple',
            COMPLEX: 'complex',
            MAGICAL: 'magical',
            CURSED: 'cursed'
        };

        // Chest material templates
        this.chestMaterialTemplates = {
            [this.chestTypes.WOODEN]: {
                name: 'Wooden Chest',
                description: 'A sturdy wooden chest',
                baseValue: 50,
                durability: 100,
                capacity: 20,
                weight: 15,
                color: '#8B4513',
                features: ['wooden', 'basic', 'common', 'breakable']
            },
            [this.chestTypes.METAL]: {
                name: 'Metal Chest',
                description: 'A reinforced metal chest',
                baseValue: 200,
                durability: 300,
                capacity: 25,
                weight: 35,
                color: '#708090',
                features: ['metal', 'reinforced', 'durable', 'heavy']
            },
            [this.chestTypes.ORNATE]: {
                name: 'Ornate Chest',
                description: 'An elaborately decorated chest',
                baseValue: 1000,
                durability: 150,
                capacity: 30,
                weight: 25,
                color: '#FFD700',
                features: ['ornate', 'decorative', 'valuable', 'elegant']
            },
            [this.chestTypes.MAGICAL]: {
                name: 'Magical Chest',
                description: 'A chest imbued with magical properties',
                baseValue: 5000,
                durability: 500,
                capacity: 40,
                weight: 20,
                color: '#9370DB',
                features: ['magical', 'enchanted', 'mysterious', 'powerful']
            },
            [this.chestTypes.ANCIENT]: {
                name: 'Ancient Chest',
                description: 'An ancient relic chest',
                baseValue: 2000,
                durability: 200,
                capacity: 35,
                weight: 30,
                color: '#8B7355',
                features: ['ancient', 'historical', 'fragile', 'valuable']
            },
            [this.chestTypes.PIRATE]: {
                name: 'Pirate Chest',
                description: 'A weathered pirate treasure chest',
                baseValue: 300,
                durability: 120,
                capacity: 25,
                weight: 20,
                color: '#654321',
                features: ['pirate', 'weathered', 'nautical', 'treasure']
            }
        };

        // Size modifiers
        this.sizeModifiers = {
            [this.chestSizes.SMALL]: {
                multiplier: 0.5,
                capacityMultiplier: 0.6,
                pixelSize: 32,
                features: ['small', 'portable', 'compact']
            },
            [this.chestSizes.MEDIUM]: {
                multiplier: 1.0,
                capacityMultiplier: 1.0,
                pixelSize: 48,
                features: ['medium', 'standard', 'versatile']
            },
            [this.chestSizes.LARGE]: {
                multiplier: 2.0,
                capacityMultiplier: 1.8,
                pixelSize: 64,
                features: ['large', 'spacious', 'heavy']
            },
            [this.chestSizes.HUGE]: {
                multiplier: 4.0,
                capacityMultiplier: 3.0,
                pixelSize: 80,
                features: ['huge', 'massive', 'immobile']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.chestQualities.COMMON]: {
                statMultiplier: 1.0,
                valueMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                rarity: 1,
                features: ['common', 'standard', 'ordinary']
            },
            [this.chestQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                valueMultiplier: 1.5,
                durabilityMultiplier: 1.1,
                rarity: 2,
                features: ['uncommon', 'well_made', 'quality']
            },
            [this.chestQualities.RARE]: {
                statMultiplier: 1.5,
                valueMultiplier: 2.5,
                durabilityMultiplier: 1.25,
                rarity: 3,
                features: ['rare', 'exceptional', 'valuable']
            },
            [this.chestQualities.EPIC]: {
                statMultiplier: 2.0,
                valueMultiplier: 4.0,
                durabilityMultiplier: 1.5,
                rarity: 4,
                features: ['epic', 'masterwork', 'legendary']
            },
            [this.chestQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                valueMultiplier: 8.0,
                durabilityMultiplier: 2.0,
                rarity: 5,
                features: ['legendary', 'artifact', 'mythical']
            },
            [this.chestQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                valueMultiplier: 20.0,
                durabilityMultiplier: 3.0,
                rarity: 6,
                features: ['mythical', 'divine', 'ultimate']
            }
        };

        // Lock templates
        this.lockTemplates = {
            [this.lockTypes.NONE]: {
                name: 'No Lock',
                description: 'No locking mechanism',
                security: 0,
                complexity: 0,
                features: ['unlocked', 'open', 'accessible']
            },
            [this.lockTypes.SIMPLE]: {
                name: 'Simple Lock',
                description: 'A basic locking mechanism',
                security: 10,
                complexity: 1,
                features: ['simple', 'basic', 'breakable']
            },
            [this.lockTypes.COMPLEX]: {
                name: 'Complex Lock',
                description: 'An intricate locking mechanism',
                security: 25,
                complexity: 3,
                features: ['complex', 'intricate', 'secure']
            },
            [this.lockTypes.MAGICAL]: {
                name: 'Magical Lock',
                description: 'A lock sealed by magic',
                security: 50,
                complexity: 5,
                features: ['magical', 'enchanted', 'powerful']
            },
            [this.lockTypes.CURSED]: {
                name: 'Cursed Lock',
                description: 'A lock cursed with dark magic',
                security: 75,
                complexity: 7,
                features: ['cursed', 'dangerous', 'trapped']
            }
        };

        // Chest colors and effects
        this.chestColors = {
            wooden: { base: '#8B4513', trim: '#654321', lock: '#2F4F4F' },
            metal: { base: '#708090', trim: '#2F4F4F', lock: '#FFD700' },
            ornate: { base: '#FFD700', trim: '#B8860B', lock: '#FF0000' },
            magical: { base: '#9370DB', trim: '#4B0082', lock: '#FF00FF', glow: '#DA70D6' },
            ancient: { base: '#8B7355', trim: '#654321', lock: '#8B0000' },
            pirate: { base: '#654321', trim: '#2F4F4F', lock: '#FFD700' }
        };
    }

    /**
     * Generate a treasure chest sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.chestTypes.WOODEN,
            size: options.size || this.chestSizes.MEDIUM,
            quality: options.quality || this.chestQualities.COMMON,
            lockType: options.lockType || this.lockTypes.SIMPLE,
            isOpen: options.isOpen || false,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates
        const materialTemplate = this.chestMaterialTemplates[config.type];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];
        const lockTemplate = this.lockTemplates[config.lockType];

        if (!materialTemplate || !sizeTemplate || !qualityTemplate || !lockTemplate) {
            throw new Error(`Unknown chest configuration: ${config.type}, ${config.size}, ${config.quality}, ${config.lockType}`);
        }

        // Calculate final stats
        const finalStats = this.calculateChestStats(materialTemplate, sizeTemplate, qualityTemplate, lockTemplate, config);

        // Generate chest data
        const chestData = {
            id: this.generateChestId(),
            name: this.generateChestName(materialTemplate.name, sizeTemplate, qualityTemplate, config.isOpen),
            type: config.type,
            size: config.size,
            quality: config.quality,
            lockType: config.lockType,
            isOpen: config.isOpen,
            materialTemplate: materialTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            lockTemplate: lockTemplate,
            stats: finalStats,
            features: [...materialTemplate.features, ...sizeTemplate.features, ...qualityTemplate.features, ...lockTemplate.features],
            description: this.generateDescription(materialTemplate, sizeTemplate, qualityTemplate, lockTemplate, config.isOpen),
            appearance: this.generateAppearance(materialTemplate, config.quality, config.isOpen),
            contents: this.generateContents(finalStats.capacity, config.type, config.quality),
            effects: this.generateEffects(materialTemplate, finalStats, config.lockType)
        };

        // Generate sprite image
        const spriteImage = await this.generateChestSprite(chestData, config);

        return {
            image: spriteImage,
            data: chestData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'TreasureChestGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate chest sprite image
     */
    async generateChestSprite(chestData, config) {
        const width = config.width || 64;
        const height = config.height || 48;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw chest based on type and state
        await this.drawChestBase(image, chestData, config);

        // Apply quality effects
        if (chestData.quality !== this.chestQualities.COMMON) {
            await this.addQualityEffects(image, chestData.quality);
        }

        // Add lock effects
        if (chestData.lockType !== this.lockTypes.NONE) {
            await this.addLockEffects(image, chestData.lockType, chestData.isOpen);
        }

        return image;
    }

    /**
     * Draw chest base shape
     */
    async drawChestBase(image, chestData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = chestData.sizeTemplate.pixelSize / 48;
        const colors = this.chestColors[chestData.type];

        // Draw chest body
        await this.drawChestBody(image, centerX, centerY, scale, colors, chestData);

        // Draw chest lid
        await this.drawChestLid(image, centerX, centerY, scale, colors, chestData);

        // Draw chest details
        await this.drawChestDetails(image, centerX, centerY, scale, colors, chestData);

        // Draw lock
        if (chestData.lockType !== this.lockTypes.NONE) {
            await this.drawChestLock(image, centerX, centerY, scale, colors, chestData);
        }
    }

    /**
     * Draw chest body
     */
    async drawChestBody(image, x, y, scale, colors, chestData) {
        const bodyWidth = 24 * scale;
        const bodyHeight = 16 * scale;

        // Main body
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = -bodyHeight; j < bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j + bodyHeight / 2);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Rounded rectangle shape
                    const distFromCenter = Math.sqrt(i * i + j * j);
                    const maxDist = Math.sqrt(bodyWidth * bodyWidth + bodyHeight * bodyHeight);
                    if (distFromCenter <= maxDist * 0.8) {
                        const intensity = 1 - (distFromCenter / maxDist) * 0.3;
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
     * Draw chest lid
     */
    async drawChestLid(image, x, y, scale, colors, chestData) {
        const lidWidth = 22 * scale;
        const lidHeight = 8 * scale;
        const lidOffset = chestData.isOpen ? -6 * scale : 0;

        // Lid
        for (let i = -lidWidth; i < lidWidth; i++) {
            for (let j = -lidHeight; j < lidHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - lidHeight / 2 + lidOffset);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Lid shape
                    const distFromCenter = Math.sqrt(i * i + j * j);
                    const maxDist = Math.sqrt(lidWidth * lidWidth + lidHeight * lidHeight);
                    if (distFromCenter <= maxDist * 0.9) {
                        const intensity = 1 - (distFromCenter / maxDist) * 0.2;
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * intensity * 0.9);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * intensity * 0.9);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * intensity * 0.9);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw chest details
     */
    async drawChestDetails(image, x, y, scale, colors, chestData) {
        // Add decorative elements based on chest type
        switch (chestData.type) {
            case this.chestTypes.ORNATE:
                await this.addOrnateDetails(image, x, y, scale, colors);
                break;
            case this.chestTypes.MAGICAL:
                await this.addMagicalDetails(image, x, y, scale, colors);
                break;
            case this.chestTypes.ANCIENT:
                await this.addAncientDetails(image, x, y, scale, colors);
                break;
            case this.chestTypes.PIRATE:
                await this.addPirateDetails(image, x, y, scale, colors);
                break;
        }

        // Add hinges
        await this.addHinges(image, x, y, scale, colors);
    }

    /**
     * Draw chest lock
     */
    async drawChestLock(image, x, y, scale, colors, chestData) {
        const lockSize = 4 * scale;
        const lockX = x;
        const lockY = y - 8 * scale;

        // Lock body
        for (let i = -lockSize; i < lockSize; i++) {
            for (let j = -lockSize; j < lockSize; j++) {
                const pixelX = Math.floor(lockX + i);
                const pixelY = Math.floor(lockY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= lockSize && Math.abs(j) <= lockSize) {
                        const r = parseInt(colors.lock.slice(1, 3), 16);
                        const g = parseInt(colors.lock.slice(3, 5), 16);
                        const b = parseInt(colors.lock.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Keyhole
        const keyholeX = lockX;
        const keyholeY = lockY;
        for (let i = -1; i <= 1; i++) {
            for (let j = -2; j <= 2; j++) {
                const pixelX = Math.floor(keyholeX + i);
                const pixelY = Math.floor(keyholeY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 0.5 && Math.abs(j) <= 1.5) {
                        image.setPixelColor(0xFF000000, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Add ornate details
     */
    async addOrnateDetails(image, x, y, scale, colors) {
        // Add gold trim and decorations
        const trimColor = { r: 255, g: 215, b: 0 };

        // Corner decorations
        const corners = [
            { x: x - 18 * scale, y: y - 6 * scale },
            { x: x + 18 * scale, y: y - 6 * scale },
            { x: x - 18 * scale, y: y + 6 * scale },
            { x: x + 18 * scale, y: y + 6 * scale }
        ];

        for (const corner of corners) {
            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    const pixelX = Math.floor(corner.x + i);
                    const pixelY = Math.floor(corner.y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if (Math.abs(i) + Math.abs(j) <= 2) {
                            const color = (trimColor.r << 16) | (trimColor.g << 8) | trimColor.b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Add magical details
     */
    async addMagicalDetails(image, x, y, scale, colors) {
        // Add glowing runes
        const runeColor = { r: 255, g: 0, b: 255 };

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = 16 * scale;
            const runeX = x + Math.cos(angle) * distance;
            const runeY = y + Math.sin(angle) * distance;

            for (let rx = -1; rx <= 1; rx++) {
                for (let ry = -1; ry <= 1; ry++) {
                    const pixelX = Math.floor(runeX + rx);
                    const pixelY = Math.floor(runeY + ry);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        const color = (runeColor.r << 16) | (runeColor.g << 8) | runeColor.b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Add ancient details
     */
    async addAncientDetails(image, x, y, scale, colors) {
        // Add weathered patterns
        for (let i = -20 * scale; i < 20 * scale; i += 4) {
            for (let j = -12 * scale; j < 12 * scale; j += 4) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.random() > 0.7) {
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * 0.6);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * 0.6);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * 0.6);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Add pirate details
     */
    async addPirateDetails(image, x, y, scale, colors) {
        // Add skull and crossbones or similar pirate motifs
        const skullX = x;
        const skullY = y - 10 * scale;

        // Simple skull shape
        for (let i = -3; i <= 3; i++) {
            for (let j = -2; j <= 2; j++) {
                const pixelX = Math.floor(skullX + i);
                const pixelY = Math.floor(skullY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 2 && Math.abs(j) <= 1.5) {
                        image.setPixelColor(0xFFFFFFFF, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Add hinges
     */
    async addHinges(image, x, y, scale, colors) {
        const hingeColor = { r: 192, g: 192, b: 192 };

        // Left hinge
        const leftHingeX = x - 16 * scale;
        const hingeY = y;

        for (let i = -2; i <= 2; i++) {
            for (let j = -6; j <= 6; j++) {
                const pixelX = Math.floor(leftHingeX + i);
                const pixelY = Math.floor(hingeY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 1) {
                        const color = (hingeColor.r << 16) | (hingeColor.g << 8) | hingeColor.b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Right hinge
        const rightHingeX = x + 16 * scale;

        for (let i = -2; i <= 2; i++) {
            for (let j = -6; j <= 6; j++) {
                const pixelX = Math.floor(rightHingeX + i);
                const pixelY = Math.floor(hingeY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 1) {
                        const color = (hingeColor.r << 16) | (hingeColor.g << 8) | hingeColor.b | 0xFF000000;
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
            case this.chestQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.chestQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.chestQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.chestQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Add lock effects
     */
    async addLockEffects(image, lockType, isOpen) {
        if (lockType === this.lockTypes.MAGICAL) {
            await this.addMagicalLockGlow(image);
        } else if (lockType === this.lockTypes.CURSED) {
            await this.addCursedLockGlow(image);
        }
    }

    /**
     * Calculate chest stats
     */
    calculateChestStats(materialTemplate, sizeTemplate, qualityTemplate, lockTemplate, config) {
        const stats = {
            value: Math.round(materialTemplate.baseValue * sizeTemplate.multiplier * qualityTemplate.valueMultiplier),
            durability: Math.round(materialTemplate.durability * qualityTemplate.durabilityMultiplier),
            capacity: Math.round(materialTemplate.capacity * sizeTemplate.capacityMultiplier),
            weight: Math.round(materialTemplate.weight * sizeTemplate.multiplier),
            security: lockTemplate.security,
            rarity: Math.max(materialTemplate.rarity || 1, qualityTemplate.rarity)
        };

        return stats;
    }

    /**
     * Generate chest ID
     */
    generateChestId() {
        return 'chest_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate chest name
     */
    generateChestName(materialName, sizeTemplate, qualityTemplate, isOpen) {
        const sizePrefixes = {
            [this.chestSizes.SMALL]: 'Small ',
            [this.chestSizes.MEDIUM]: '',
            [this.chestSizes.LARGE]: 'Large ',
            [this.chestSizes.HUGE]: 'Huge '
        };

        const qualityPrefixes = {
            [this.chestQualities.COMMON]: '',
            [this.chestQualities.UNCOMMON]: 'Fine ',
            [this.chestQualities.RARE]: 'Rare ',
            [this.chestQualities.EPIC]: 'Epic ',
            [this.chestQualities.LEGENDARY]: 'Legendary ',
            [this.chestQualities.MYTHICAL]: 'Mythical '
        };

        const stateSuffix = isOpen ? ' (Open)' : '';

        return `${qualityPrefixes[qualityTemplate]}${sizePrefixes[sizeTemplate]}${materialName}${stateSuffix}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(materialTemplate, sizeTemplate, qualityTemplate, lockTemplate, isOpen) {
        const qualityDesc = {
            [this.chestQualities.COMMON]: 'A standard chest',
            [this.chestQualities.UNCOMMON]: 'A well-crafted chest',
            [this.chestQualities.RARE]: 'A finely made chest',
            [this.chestQualities.EPIC]: 'A masterfully crafted chest',
            [this.chestQualities.LEGENDARY]: 'A legendary chest of great value',
            [this.chestQualities.MYTHICAL]: 'A mythical chest of unimaginable worth'
        };

        const lockDesc = lockTemplate.name !== 'No Lock' ? ` secured with a ${lockTemplate.name.toLowerCase()}` : '';
        const stateDesc = isOpen ? ' The chest is open.' : ' The chest is closed.';

        return `${qualityDesc[qualityTemplate]} made of ${materialTemplate.description.toLowerCase()}${lockDesc}.${stateDesc}`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(materialTemplate, quality, isOpen) {
        const colors = this.chestColors[materialTemplate.color.toLowerCase().replace('#', '')] || this.chestColors.wooden;

        return {
            baseColor: colors.base,
            trimColor: colors.trim,
            lockColor: colors.lock,
            glowColor: colors.glow || null,
            material: materialTemplate,
            quality: quality,
            isOpen: isOpen
        };
    }

    /**
     * Generate contents
     */
    generateContents(capacity, type, quality) {
        const contents = [];
        const itemCount = Math.min(capacity, Math.floor(Math.random() * capacity) + 1);

        // Generate treasure based on chest type and quality
        for (let i = 0; i < itemCount; i++) {
            const itemType = this.getRandomTreasureType(type, quality);
            const itemValue = this.getRandomTreasureValue(quality);

            contents.push({
                type: itemType,
                value: itemValue,
                quantity: Math.floor(Math.random() * 5) + 1
            });
        }

        return contents;
    }

    /**
     * Generate effects
     */
    generateEffects(materialTemplate, stats, lockType) {
        const effects = [];

        // Value effect
        effects.push({
            type: 'treasure_value',
            power: stats.value,
            duration: -1, // Permanent
            instant: false
        });

        // Capacity effect
        effects.push({
            type: 'storage_capacity',
            power: stats.capacity,
            duration: -1,
            instant: false
        });

        // Security effect
        if (stats.security > 0) {
            effects.push({
                type: 'security',
                power: stats.security,
                duration: -1,
                instant: false
            });
        }

        // Material-specific effects
        if (materialTemplate.features.includes('magical')) {
            effects.push({
                type: 'magical_aura',
                power: 1,
                duration: -1,
                instant: false
            });
        }

        // Lock-specific effects
        if (lockType === this.lockTypes.MAGICAL) {
            effects.push({
                type: 'magical_lock',
                power: 1,
                duration: -1,
                instant: false
            });
        } else if (lockType === this.lockTypes.CURSED) {
            effects.push({
                type: 'cursed_lock',
                power: 1,
                duration: -1,
                instant: false
            });
        }

        return effects;
    }

    /**
     * Get random treasure type
     */
    getRandomTreasureType(chestType, quality) {
        const treasureTypes = {
            [this.chestTypes.WOODEN]: ['coins', 'jewelry', 'potions', 'scrolls'],
            [this.chestTypes.METAL]: ['coins', 'gems', 'weapons', 'armor'],
            [this.chestTypes.ORNATE]: ['jewelry', 'gems', 'artifacts', 'gold'],
            [this.chestTypes.MAGICAL]: ['mana_crystals', 'spellbooks', 'artifacts', 'enchanted_items'],
            [this.chestTypes.ANCIENT]: ['artifacts', 'ancient_coins', 'relics', 'scrolls'],
            [this.chestTypes.PIRATE]: ['gold', 'jewelry', 'maps', 'weapons']
        };

        const qualityMultipliers = {
            [this.chestQualities.COMMON]: 1,
            [this.chestQualities.UNCOMMON]: 1.5,
            [this.chestQualities.RARE]: 2,
            [this.chestQualities.EPIC]: 3,
            [this.chestQualities.LEGENDARY]: 5,
            [this.chestQualities.MYTHICAL]: 10
        };

        const types = treasureTypes[chestType] || treasureTypes[this.chestTypes.WOODEN];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Get random treasure value
     */
    getRandomTreasureValue(quality) {
        const baseValues = {
            [this.chestQualities.COMMON]: [1, 50],
            [this.chestQualities.UNCOMMON]: [50, 200],
            [this.chestQualities.RARE]: [200, 1000],
            [this.chestQualities.EPIC]: [1000, 5000],
            [this.chestQualities.LEGENDARY]: [5000, 25000],
            [this.chestQualities.MYTHICAL]: [25000, 100000]
        };

        const [min, max] = baseValues[quality] || baseValues[this.chestQualities.COMMON];
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addRareGlow(image) { return image; }
    async addEpicGlow(image) { return image; }
    async addLegendaryGlow(image) { return image; }
    async addMythicalGlow(image) { return image; }
    async addMagicalLockGlow(image) { return image; }
    async addCursedLockGlow(image) { return image; }

    /**
     * Batch generate chests
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const chest = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(chest);
            } catch (error) {
                console.error(`Failed to generate chest ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(c => c !== null);
    }

    /**
     * Generate chest by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.size) options.size = criteria.size;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.lockType) options.lockType = criteria.lockType;
        if (criteria.isOpen !== undefined) options.isOpen = criteria.isOpen;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get chest statistics
     */
    getChestStatistics() {
        return {
            totalTypes: Object.keys(this.chestTypes).length,
            totalSizes: Object.keys(this.chestSizes).length,
            totalQualities: Object.keys(this.chestQualities).length,
            totalLockTypes: Object.keys(this.lockTypes).length,
            materialTemplates: Object.keys(this.chestMaterialTemplates).length,
            lockTemplates: Object.keys(this.lockTemplates).length
        };
    }

    /**
     * Export chest data
     */
    async exportChestData(chest, outputPath) {
        const exportData = {
            ...chest.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save chest data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate chest configuration
     */
    validateChestConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.chestTypes).includes(config.type)) {
            errors.push(`Invalid chest type: ${config.type}`);
        }

        if (config.size && !Object.values(this.chestSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.chestQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.lockType && !Object.values(this.lockTypes).includes(config.lockType)) {
            errors.push(`Invalid lock type: ${config.lockType}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate treasure collection
     */
    async generateTreasureCollection(count = 5, theme = 'mixed') {
        const collection = [];

        for (let i = 0; i < count; i++) {
            let options = {};

            switch (theme) {
                case 'wooden':
                    options.type = this.chestTypes.WOODEN;
                    break;
                case 'metal':
                    options.type = this.chestTypes.METAL;
                    break;
                case 'ornate':
                    options.type = this.chestTypes.ORNATE;
                    break;
                case 'magical':
                    options.type = this.chestTypes.MAGICAL;
                    break;
                case 'ancient':
                    options.type = this.chestTypes.ANCIENT;
                    break;
                case 'pirate':
                    options.type = this.chestTypes.PIRATE;
                    break;
                default:
                    // Mixed - all types
                    break;
            }

            const chest = await this.generate(options);
            collection.push(chest);
        }

        return collection;
    }

    /**
     * Open chest
     */
    async openChest(chestData) {
        if (chestData.isOpen) {
            throw new Error('Chest is already open');
        }

        // Create open version
        const openChest = { ...chestData, isOpen: true };
        const spriteImage = await this.generateChestSprite({ data: openChest }, {});

        return {
            ...chestData,
            isOpen: true,
            image: spriteImage,
            contents: chestData.contents // Reveal contents when opened
        };
    }

    /**
     * Close chest
     */
    async closeChest(chestData) {
        if (!chestData.isOpen) {
            throw new Error('Chest is already closed');
        }

        // Create closed version
        const closedChest = { ...chestData, isOpen: false };
        const spriteImage = await this.generateChestSprite({ data: closedChest }, {});

        return {
            ...chestData,
            isOpen: false,
            image: spriteImage
        };
    }

    /**
     * Calculate total treasure value
     */
    calculateTotalTreasureValue(chestData) {
        if (!chestData.contents) {
            return 0;
        }

        return chestData.contents.reduce((total, item) => {
            return total + (item.value * item.quantity);
        }, 0);
    }

    /**
     * Get chest capacity info
     */
    getChestCapacityInfo(chestData) {
        const usedCapacity = chestData.contents ? chestData.contents.length : 0;
        const totalCapacity = chestData.stats.capacity;

        return {
            used: usedCapacity,
            total: totalCapacity,
            available: totalCapacity - usedCapacity,
            percentage: Math.round((usedCapacity / totalCapacity) * 100)
        };
    }
}

module.exports = TreasureChestGenerator;
