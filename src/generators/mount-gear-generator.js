/**
 * Mount Gear Generator - Complete mount equipment and riding gear sprite generation system
 * Generates various types of saddles, bridles, armor, and accessories for mounts
 */

const Jimp = require('jimp');
const path = require('path');

class MountGearGenerator {
    constructor() {
        this.gearTypes = {
            SADDLE: 'saddle',
            BRIDLE: 'bridle',
            SADDLEBAGS: 'saddlebags',
            RIDING_BOOTS: 'riding_boots',
            SPURS: 'spurs',
            MOUNT_ARMOR: 'mount_armor',
            BLANKET: 'blanket',
            CARE_ITEMS: 'care_items'
        };

        this.gearSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HEAVY: 'heavy'
        };

        this.gearQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.mountTypes = {
            HORSE: 'horse',
            UNICORN: 'unicorn',
            PEGASUS: 'pegasus',
            DRAGON: 'dragon',
            GRIFFIN: 'griffin',
            WOLF: 'wolf',
            BEAR: 'bear'
        };

        // Gear material templates
        this.gearMaterialTemplates = {
            [this.gearTypes.SADDLE]: {
                name: 'Saddle',
                description: 'A riding saddle for mounts',
                baseValue: 150,
                durability: 200,
                weight: 25,
                comfort: 8,
                features: ['riding_support', 'comfortable', 'secure', 'adjustable']
            },
            [this.gearTypes.BRIDLE]: {
                name: 'Bridle',
                description: 'Headgear and reins for mount control',
                baseValue: 80,
                durability: 150,
                weight: 8,
                control: 9,
                features: ['mount_control', 'reins', 'bit', 'headgear']
            },
            [this.gearTypes.SADDLEBAGS]: {
                name: 'Saddlebags',
                description: 'Storage bags attached to saddle',
                baseValue: 120,
                durability: 120,
                weight: 15,
                capacity: 40,
                features: ['storage', 'cargo', 'balanced', 'accessible']
            },
            [this.gearTypes.RIDING_BOOTS]: {
                name: 'Riding Boots',
                description: 'Protective boots for riders',
                baseValue: 200,
                durability: 180,
                weight: 12,
                protection: 6,
                features: ['rider_protection', 'comfortable', 'durable', 'stylish']
            },
            [this.gearTypes.SPURS]: {
                name: 'Spurs',
                description: 'Metal attachments for rider control',
                baseValue: 100,
                durability: 250,
                weight: 3,
                controlBonus: 3,
                features: ['mount_control', 'precision', 'traditional', 'sharp']
            },
            [this.gearTypes.MOUNT_ARMOR]: {
                name: 'Mount Armor',
                description: 'Protective armor for mounts',
                baseValue: 800,
                durability: 400,
                weight: 80,
                defense: 12,
                features: ['mount_protection', 'reinforced', 'battle_ready', 'intimidating']
            },
            [this.gearTypes.BLANKET]: {
                name: 'Blanket',
                description: 'Protective and decorative blanket',
                baseValue: 60,
                durability: 100,
                weight: 10,
                warmth: 5,
                features: ['warmth', 'decoration', 'protection', 'comfort']
            },
            [this.gearTypes.CARE_ITEMS]: {
                name: 'Care Items',
                description: 'Tools and items for mount care',
                baseValue: 40,
                durability: 80,
                weight: 5,
                careBonus: 4,
                features: ['mount_care', 'grooming', 'health', 'maintenance']
            }
        };

        // Size modifiers
        this.sizeModifiers = {
            [this.gearSizes.SMALL]: {
                multiplier: 0.7,
                capacityMultiplier: 0.6,
                pixelSize: 24,
                features: ['small', 'lightweight', 'compact']
            },
            [this.gearSizes.MEDIUM]: {
                multiplier: 1.0,
                capacityMultiplier: 1.0,
                pixelSize: 32,
                features: ['medium', 'standard', 'versatile']
            },
            [this.gearSizes.LARGE]: {
                multiplier: 1.5,
                capacityMultiplier: 1.8,
                pixelSize: 40,
                features: ['large', 'spacious', 'heavy']
            },
            [this.gearSizes.HEAVY]: {
                multiplier: 2.5,
                capacityMultiplier: 3.0,
                pixelSize: 48,
                features: ['heavy', 'massive', 'reinforced']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.gearQualities.COMMON]: {
                statMultiplier: 1.0,
                valueMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                rarity: 1,
                features: ['common', 'standard', 'serviceable']
            },
            [this.gearQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                valueMultiplier: 1.5,
                durabilityMultiplier: 1.1,
                rarity: 2,
                features: ['uncommon', 'well_made', 'reliable']
            },
            [this.gearQualities.RARE]: {
                statMultiplier: 1.5,
                valueMultiplier: 2.5,
                durabilityMultiplier: 1.25,
                rarity: 3,
                features: ['rare', 'exceptional', 'high_quality']
            },
            [this.gearQualities.EPIC]: {
                statMultiplier: 2.0,
                valueMultiplier: 4.0,
                durabilityMultiplier: 1.5,
                rarity: 4,
                features: ['epic', 'masterwork', 'elite']
            },
            [this.gearQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                valueMultiplier: 8.0,
                durabilityMultiplier: 2.0,
                rarity: 5,
                features: ['legendary', 'artifact', 'legendary']
            },
            [this.gearQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                valueMultiplier: 20.0,
                durabilityMultiplier: 3.0,
                rarity: 6,
                features: ['mythical', 'divine', 'ultimate']
            }
        };

        // Mount compatibility
        this.mountCompatibility = {
            [this.mountTypes.HORSE]: ['saddle', 'bridle', 'saddlebags', 'blanket', 'mount_armor'],
            [this.mountTypes.UNICORN]: ['saddle', 'bridle', 'saddlebags', 'blanket', 'mount_armor'],
            [this.mountTypes.PEGASUS]: ['saddle', 'bridle', 'saddlebags', 'blanket', 'mount_armor'],
            [this.mountTypes.DRAGON]: ['saddle', 'bridle', 'saddlebags', 'mount_armor'],
            [this.mountTypes.GRIFFIN]: ['saddle', 'bridle', 'saddlebags', 'mount_armor'],
            [this.mountTypes.WOLF]: ['saddle', 'bridle', 'saddlebags', 'blanket'],
            [this.mountTypes.BEAR]: ['saddle', 'bridle', 'saddlebags', 'blanket']
        };

        // Gear colors and effects
        this.gearColors = {
            saddle: { base: '#8B4513', trim: '#654321', accents: '#DAA520' },
            bridle: { base: '#654321', metal: '#C0C0C0', leather: '#8B4513' },
            saddlebags: { base: '#8B4513', trim: '#654321', buckles: '#C0C0C0' },
            riding_boots: { base: '#654321', trim: '#000000', accents: '#FFD700' },
            spurs: { base: '#C0C0C0', sharp: '#FFD700', leather: '#8B4513' },
            mount_armor: { base: '#696969', trim: '#C0C0C0', accents: '#FFD700' },
            blanket: { base: '#DC143C', trim: '#FFD700', pattern: '#000000' },
            care_items: { base: '#8B4513', metal: '#C0C0C0', accents: '#654321' }
        };
    }

    /**
     * Generate mount gear sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.gearTypes.SADDLE,
            size: options.size || this.gearSizes.MEDIUM,
            quality: options.quality || this.gearQualities.COMMON,
            mountType: options.mountType || this.mountTypes.HORSE,
            customizations: options.customizations || {},
            ...options
        };

        // Check mount compatibility
        if (!this.isCompatible(config.type, config.mountType)) {
            throw new Error(`Gear type ${config.type} is not compatible with mount ${config.mountType}`);
        }

        // Get appropriate templates
        const materialTemplate = this.gearMaterialTemplates[config.type];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];

        if (!materialTemplate || !sizeTemplate || !qualityTemplate) {
            throw new Error(`Unknown gear configuration: ${config.type}, ${config.size}, ${config.quality}`);
        }

        // Calculate final stats
        const finalStats = this.calculateGearStats(materialTemplate, sizeTemplate, qualityTemplate, config);

        // Generate gear data
        const gearData = {
            id: this.generateGearId(),
            name: this.generateGearName(materialTemplate.name, sizeTemplate, qualityTemplate),
            type: config.type,
            size: config.size,
            quality: config.quality,
            mountType: config.mountType,
            materialTemplate: materialTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            stats: finalStats,
            features: [...materialTemplate.features, ...sizeTemplate.features, ...qualityTemplate.features],
            description: this.generateDescription(materialTemplate, sizeTemplate, qualityTemplate, config.mountType),
            appearance: this.generateAppearance(materialTemplate, config.quality),
            effects: this.generateEffects(materialTemplate, finalStats),
            compatibility: this.getCompatibilityInfo(config.type)
        };

        // Generate sprite image
        const spriteImage = await this.generateGearSprite(gearData, config);

        return {
            image: spriteImage,
            data: gearData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'MountGearGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate gear sprite image
     */
    async generateGearSprite(gearData, config) {
        const width = config.width || 64;
        const height = config.height || 48;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw gear based on type
        await this.drawGearBase(image, gearData, config);

        // Apply quality effects
        if (gearData.quality !== this.gearQualities.COMMON) {
            await this.addQualityEffects(image, gearData.quality);
        }

        return image;
    }

    /**
     * Draw gear base shape
     */
    async drawGearBase(image, gearData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = gearData.sizeTemplate.pixelSize / 32;
        const colors = this.gearColors[gearData.type];

        // Draw gear based on type
        switch (gearData.type) {
            case this.gearTypes.SADDLE:
                await this.drawSaddle(image, centerX, centerY, scale, colors, gearData);
                break;
            case this.gearTypes.BRIDLE:
                await this.drawBridle(image, centerX, centerY, scale, colors, gearData);
                break;
            case this.gearTypes.SADDLEBAGS:
                await this.drawSaddlebags(image, centerX, centerY, scale, colors, gearData);
                break;
            case this.gearTypes.RIDING_BOOTS:
                await this.drawRidingBoots(image, centerX, centerY, scale, colors, gearData);
                break;
            case this.gearTypes.SPURS:
                await this.drawSpurs(image, centerX, centerY, scale, colors, gearData);
                break;
            case this.gearTypes.MOUNT_ARMOR:
                await this.drawMountArmor(image, centerX, centerY, scale, colors, gearData);
                break;
            case this.gearTypes.BLANKET:
                await this.drawBlanket(image, centerX, centerY, scale, colors, gearData);
                break;
            case this.gearTypes.CARE_ITEMS:
                await this.drawCareItems(image, centerX, centerY, scale, colors, gearData);
                break;
            default:
                await this.drawSaddle(image, centerX, centerY, scale, colors, gearData);
        }
    }

    /**
     * Draw saddle
     */
    async drawSaddle(image, x, y, scale, colors, gearData) {
        const saddleWidth = 24 * scale;
        const saddleHeight = 12 * scale;

        // Main saddle body
        for (let i = -saddleWidth; i < saddleWidth; i++) {
            for (let j = -saddleHeight; j < saddleHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Saddle shape
                    if (Math.abs(i) <= saddleWidth && Math.abs(j) <= saddleHeight) {
                        const distance = Math.sqrt(i * i + j * j) / Math.sqrt(saddleWidth * saddleWidth + saddleHeight * saddleHeight);
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

        // Saddle horn
        for (let i = -2; i <= 2; i++) {
            for (let j = -4; j <= 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - 6 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 1.5 && j >= -3) {
                        const r = parseInt(colors.trim.slice(1, 3), 16);
                        const g = parseInt(colors.trim.slice(3, 5), 16);
                        const b = parseInt(colors.trim.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw bridle
     */
    async drawBridle(image, x, y, scale, colors, gearData) {
        // Headpiece
        for (let i = -16 * scale; i < 16 * scale; i++) {
            for (let j = -2; j <= 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(j) <= 1) {
                        const r = parseInt(colors.leather.slice(1, 3), 16);
                        const g = parseInt(colors.leather.slice(3, 5), 16);
                        const b = parseInt(colors.leather.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Bit
        for (let i = -4; i <= 4; i++) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y + 3);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt(colors.metal.slice(1, 3), 16);
                const g = parseInt(colors.metal.slice(3, 5), 16);
                const b = parseInt(colors.metal.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }

        // Reins
        for (let i = -20 * scale; i < -16 * scale; i++) {
            for (let j = -1; j <= 1; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j + 2);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const r = parseInt(colors.leather.slice(1, 3), 16);
                    const g = parseInt(colors.leather.slice(3, 5), 16);
                    const b = parseInt(colors.leather.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw saddlebags
     */
    async drawSaddlebags(image, x, y, scale, colors, gearData) {
        const bagWidth = 8 * scale;
        const bagHeight = 12 * scale;

        // Left bag
        for (let i = -bagWidth; i < 0; i++) {
            for (let j = -bagHeight; j < bagHeight; j++) {
                const pixelX = Math.floor(x + i - 6 * scale);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bagWidth && Math.abs(j) <= bagHeight) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Right bag
        for (let i = 0; i < bagWidth; i++) {
            for (let j = -bagHeight; j < bagHeight; j++) {
                const pixelX = Math.floor(x + i + 6 * scale);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bagWidth && Math.abs(j) <= bagHeight) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Buckles
        const bucklePositions = [
            { x: x - 6 * scale, y: y - 8 * scale },
            { x: x + 6 * scale, y: y - 8 * scale }
        ];

        for (const pos of bucklePositions) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const pixelX = Math.floor(pos.x + i);
                    const pixelY = Math.floor(pos.y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        const r = parseInt(colors.buckles.slice(1, 3), 16);
                        const g = parseInt(colors.buckles.slice(3, 5), 16);
                        const b = parseInt(colors.buckles.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw riding boots
     */
    async drawRidingBoots(image, x, y, scale, colors, gearData) {
        const bootWidth = 6 * scale;
        const bootHeight = 16 * scale;

        // Left boot
        for (let i = -bootWidth; i < 0; i++) {
            for (let j = -bootHeight; j < bootHeight; j++) {
                const pixelX = Math.floor(x + i - 4 * scale);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bootWidth && Math.abs(j) <= bootHeight) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Right boot
        for (let i = 0; i < bootWidth; i++) {
            for (let j = -bootHeight; j < bootHeight; j++) {
                const pixelX = Math.floor(x + i + 4 * scale);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bootWidth && Math.abs(j) <= bootHeight) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw spurs
     */
    async drawSpurs(image, x, y, scale, colors, gearData) {
        // Left spur
        for (let i = -3; i <= 3; i++) {
            for (let j = -2; j <= 2; j++) {
                const pixelX = Math.floor(x + i - 6 * scale);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) + Math.abs(j) <= 3) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Right spur
        for (let i = -3; i <= 3; i++) {
            for (let j = -2; j <= 2; j++) {
                const pixelX = Math.floor(x + i + 6 * scale);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) + Math.abs(j) <= 3) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Sharp points
        const sharpColor = { r: 255, g: 215, b: 0 };
        const points = [
            { x: x - 8 * scale, y: y - 3 },
            { x: x + 8 * scale, y: y - 3 }
        ];

        for (const point of points) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const pixelX = Math.floor(point.x + i);
                    const pixelY = Math.floor(point.y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if (Math.abs(i) + Math.abs(j) <= 1) {
                            const color = (sharpColor.r << 16) | (sharpColor.g << 8) | sharpColor.b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw mount armor
     */
    async drawMountArmor(image, x, y, scale, colors, gearData) {
        const armorWidth = 28 * scale;
        const armorHeight = 20 * scale;

        // Main armor plating
        for (let i = -armorWidth; i < armorWidth; i++) {
            for (let j = -armorHeight; j < armorHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= armorWidth && Math.abs(j) <= armorHeight) {
                        const distance = Math.sqrt(i * i + j * j) / Math.sqrt(armorWidth * armorWidth + armorHeight * armorHeight);
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

        // Armor trim
        for (let i = -armorWidth; i < armorWidth; i++) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y - armorHeight + 2);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                if (Math.abs(i) <= armorWidth) {
                    const r = parseInt(colors.trim.slice(1, 3), 16);
                    const g = parseInt(colors.trim.slice(3, 5), 16);
                    const b = parseInt(colors.trim.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw blanket
     */
    async drawBlanket(image, x, y, scale, colors, gearData) {
        const blanketWidth = 26 * scale;
        const blanketHeight = 18 * scale;

        for (let i = -blanketWidth; i < blanketWidth; i++) {
            for (let j = -blanketHeight; j < blanketHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= blanketWidth && Math.abs(j) <= blanketHeight) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Pattern
        for (let i = -blanketWidth; i < blanketWidth; i += 4) {
            for (let j = -blanketHeight; j < blanketHeight; j += 4) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if ((i + j) % 8 === 0) {
                        const r = parseInt(colors.pattern.slice(1, 3), 16);
                        const g = parseInt(colors.pattern.slice(3, 5), 16);
                        const b = parseInt(colors.pattern.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw care items
     */
    async drawCareItems(image, x, y, scale, colors, gearData) {
        // Brush
        for (let i = -8; i < 8; i++) {
            for (let j = -2; j <= 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(j) <= 1) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Bristles
        for (let i = -6; i < 6; i += 2) {
            for (let j = -4; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const r = parseInt(colors.base.slice(1, 3), 16);
                    const g = parseInt(colors.base.slice(3, 5), 16);
                    const b = parseInt(colors.base.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Add quality effects
     */
    async addQualityEffects(image, quality) {
        switch (quality) {
            case this.gearQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.gearQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.gearQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.gearQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Calculate gear stats
     */
    calculateGearStats(materialTemplate, sizeTemplate, qualityTemplate, config) {
        const stats = {
            value: Math.round(materialTemplate.baseValue * sizeTemplate.multiplier * qualityTemplate.valueMultiplier),
            durability: Math.round(materialTemplate.durability * qualityTemplate.durabilityMultiplier),
            weight: Math.round(materialTemplate.weight * sizeTemplate.multiplier),
            rarity: Math.max(materialTemplate.rarity || 1, qualityTemplate.rarity)
        };

        // Add type-specific stats
        if (materialTemplate.comfort) {
            stats.comfort = Math.round(materialTemplate.comfort * qualityTemplate.statMultiplier);
        }
        if (materialTemplate.control) {
            stats.control = Math.round(materialTemplate.control * qualityTemplate.statMultiplier);
        }
        if (materialTemplate.capacity) {
            stats.capacity = Math.round(materialTemplate.capacity * sizeTemplate.capacityMultiplier);
        }
        if (materialTemplate.protection) {
            stats.protection = Math.round(materialTemplate.protection * qualityTemplate.statMultiplier);
        }
        if (materialTemplate.controlBonus) {
            stats.controlBonus = Math.round(materialTemplate.controlBonus * qualityTemplate.statMultiplier);
        }
        if (materialTemplate.defense) {
            stats.defense = Math.round(materialTemplate.defense * qualityTemplate.statMultiplier);
        }
        if (materialTemplate.warmth) {
            stats.warmth = Math.round(materialTemplate.warmth * qualityTemplate.statMultiplier);
        }
        if (materialTemplate.careBonus) {
            stats.careBonus = Math.round(materialTemplate.careBonus * qualityTemplate.statMultiplier);
        }

        return stats;
    }

    /**
     * Generate gear ID
     */
    generateGearId() {
        return 'mount_gear_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate gear name
     */
    generateGearName(materialName, sizeTemplate, qualityTemplate) {
        const sizePrefixes = {
            [this.gearSizes.SMALL]: 'Small ',
            [this.gearSizes.MEDIUM]: '',
            [this.gearSizes.LARGE]: 'Large ',
            [this.gearSizes.HEAVY]: 'Heavy '
        };

        const qualityPrefixes = {
            [this.gearQualities.COMMON]: '',
            [this.gearQualities.UNCOMMON]: 'Fine ',
            [this.gearQualities.RARE]: 'Rare ',
            [this.gearQualities.EPIC]: 'Epic ',
            [this.gearQualities.LEGENDARY]: 'Legendary ',
            [this.gearQualities.MYTHICAL]: 'Mythical '
        };

        return `${qualityPrefixes[qualityTemplate]}${sizePrefixes[sizeTemplate]}${materialName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(materialTemplate, sizeTemplate, qualityTemplate, mountType) {
        const qualityDesc = {
            [this.gearQualities.COMMON]: 'A standard piece of mount gear',
            [this.gearQualities.UNCOMMON]: 'A well-crafted piece of mount gear',
            [this.gearQualities.RARE]: 'A finely made piece of mount gear',
            [this.gearQualities.EPIC]: 'A masterfully crafted piece of mount gear',
            [this.gearQualities.LEGENDARY]: 'A legendary piece of mount gear',
            [this.gearQualities.MYTHICAL]: 'A mythical piece of mount gear'
        };

        const mountDesc = mountType ? ` designed for ${mountType}s` : '';

        return `${qualityDesc[qualityTemplate]}${mountDesc}. ${materialTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(materialTemplate, quality) {
        const colors = this.gearColors[materialTemplate.color.toLowerCase().replace('#', '')] || this.gearColors.saddle;

        return {
            baseColor: colors.base,
            trimColor: colors.trim,
            accentColor: colors.accents,
            material: materialTemplate,
            quality: quality
        };
    }

    /**
     * Generate effects
     */
    generateEffects(materialTemplate, stats) {
        const effects = [];

        // Value effect
        effects.push({
            type: 'gear_value',
            power: stats.value,
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

        // Type-specific effects
        if (stats.comfort) {
            effects.push({
                type: 'rider_comfort',
                power: stats.comfort,
                duration: -1,
                instant: false
            });
        }

        if (stats.control) {
            effects.push({
                type: 'mount_control',
                power: stats.control,
                duration: -1,
                instant: false
            });
        }

        if (stats.capacity) {
            effects.push({
                type: 'cargo_capacity',
                power: stats.capacity,
                duration: -1,
                instant: false
            });
        }

        if (stats.protection) {
            effects.push({
                type: 'rider_protection',
                power: stats.protection,
                duration: -1,
                instant: false
            });
        }

        if (stats.controlBonus) {
            effects.push({
                type: 'control_bonus',
                power: stats.controlBonus,
                duration: -1,
                instant: false
            });
        }

        if (stats.defense) {
            effects.push({
                type: 'mount_defense',
                power: stats.defense,
                duration: -1,
                instant: false
            });
        }

        if (stats.warmth) {
            effects.push({
                type: 'warmth',
                power: stats.warmth,
                duration: -1,
                instant: false
            });
        }

        if (stats.careBonus) {
            effects.push({
                type: 'mount_health',
                power: stats.careBonus,
                duration: -1,
                instant: false
            });
        }

        return effects;
    }

    /**
     * Check if gear is compatible with mount
     */
    isCompatible(gearType, mountType) {
        const compatibleGear = this.mountCompatibility[mountType] || [];
        return compatibleGear.includes(gearType);
    }

    /**
     * Get compatibility info
     */
    getCompatibilityInfo(gearType) {
        const compatibleMounts = [];
        for (const [mountType, gearTypes] of Object.entries(this.mountCompatibility)) {
            if (gearTypes.includes(gearType)) {
                compatibleMounts.push(mountType);
            }
        }
        return compatibleMounts;
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addRareGlow(image) { return image; }
    async addEpicGlow(image) { return image; }
    async addLegendaryGlow(image) { return image; }
    async addMythicalGlow(image) { return image; }

    /**
     * Batch generate mount gear
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const gear = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(gear);
            } catch (error) {
                console.error(`Failed to generate mount gear ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(g => g !== null);
    }

    /**
     * Generate gear by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.size) options.size = criteria.size;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.mountType) options.mountType = criteria.mountType;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get gear statistics
     */
    getGearStatistics() {
        return {
            totalTypes: Object.keys(this.gearTypes).length,
            totalSizes: Object.keys(this.gearSizes).length,
            totalQualities: Object.keys(this.gearQualities).length,
            totalMountTypes: Object.keys(this.mountTypes).length,
            materialTemplates: Object.keys(this.gearMaterialTemplates).length
        };
    }

    /**
     * Export gear data
     */
    async exportGearData(gear, outputPath) {
        const exportData = {
            ...gear.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save gear data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate gear configuration
     */
    validateGearConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.gearTypes).includes(config.type)) {
            errors.push(`Invalid gear type: ${config.type}`);
        }

        if (config.size && !Object.values(this.gearSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.gearQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.mountType && !Object.values(this.mountTypes).includes(config.mountType)) {
            errors.push(`Invalid mount type: ${config.mountType}`);
        }

        // Check compatibility
        if (config.type && config.mountType && !this.isCompatible(config.type, config.mountType)) {
            errors.push(`Gear type ${config.type} is not compatible with mount ${config.mountType}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate gear collection
     */
    async generateGearCollection(count = 5, theme = 'mixed') {
        const collection = [];

        for (let i = 0; i < count; i++) {
            let options = {};

            switch (theme) {
                case 'riding':
                    options.type = this.gearTypes.SADDLE;
                    break;
                case 'combat':
                    options.type = this.gearTypes.MOUNT_ARMOR;
                    break;
                case 'luxury':
                    options.type = this.gearTypes.BLANKET;
                    break;
                case 'utility':
                    options.type = this.gearTypes.SADDLEBAGS;
                    break;
                default:
                    // Mixed - all types
                    break;
            }

            const gear = await this.generate(options);
            collection.push(gear);
        }

        return collection;
    }
}

module.exports = MountGearGenerator;
