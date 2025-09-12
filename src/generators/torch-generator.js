/**
 * Torch Generator - Complete torch and lighting sprite generation system
 * Generates various types of torches, flames, and lighting effects
 */

const Jimp = require('jimp');
const path = require('path');

class TorchGenerator {
    constructor() {
        this.torchTypes = {
            WALL_TORCH: 'wall_torch',
            HANDHELD_TORCH: 'handheld_torch',
            STANDING_TORCH: 'standing_torch',
            BRAZIER: 'brazier',
            LANTERN: 'lantern',
            CANDLESTICK: 'candlestick',
            CHANDELIER: 'chandelier',
            MAGICAL_ORB: 'magical_orb'
        };

        this.flameTypes = {
            NORMAL: 'normal',
            MAGICAL: 'magical',
            COLORED: 'colored',
            ETERNAL: 'eternal',
            UNSTABLE: 'unstable',
            SOULFIRE: 'soulfire'
        };

        this.torchSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            EXTRA_LARGE: 'extra_large'
        };

        this.torchQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.materialTypes = {
            WOOD: 'wood',
            METAL: 'metal',
            STONE: 'stone',
            CRYSTAL: 'crystal',
            MAGICAL: 'magical',
            BONE: 'bone'
        };

        this.fuelTypes = {
            WOOD: 'wood',
            OIL: 'oil',
            WAX: 'wax',
            MAGICAL: 'magical',
            ETERNAL: 'eternal',
            SOUL: 'soul'
        };

        // Torch templates with their properties
        this.torchTemplates = {
            [this.torchTypes.WALL_TORCH]: {
                name: 'Wall Torch',
                description: 'Torch mounted on a wall for ambient lighting',
                baseBrightness: 15,
                baseDuration: 120,
                fuelConsumption: 2,
                lightRadius: 8,
                features: ['wall_mounted', 'ambient_light', 'flickering'],
                mountType: 'wall_bracket'
            },
            [this.torchTypes.HANDHELD_TORCH]: {
                name: 'Handheld Torch',
                description: 'Portable torch for exploration and combat',
                baseBrightness: 12,
                baseDuration: 90,
                fuelConsumption: 3,
                lightRadius: 6,
                features: ['portable', 'combat_ready', 'exploration'],
                mountType: 'handheld'
            },
            [this.torchTypes.STANDING_TORCH]: {
                name: 'Standing Torch',
                description: 'Floor-mounted torch for area illumination',
                baseBrightness: 18,
                baseDuration: 150,
                fuelConsumption: 2,
                lightRadius: 10,
                features: ['floor_mounted', 'area_light', 'decorative'],
                mountType: 'floor_stand'
            },
            [this.torchTypes.BRAZIER]: {
                name: 'Brazier',
                description: 'Large metal bowl for containing flames',
                baseBrightness: 25,
                baseDuration: 200,
                fuelConsumption: 4,
                lightRadius: 12,
                features: ['large_flame', 'ceremonial', 'durable'],
                mountType: 'metal_bowl'
            },
            [this.torchTypes.LANTERN]: {
                name: 'Lantern',
                description: 'Protected flame in a glass enclosure',
                baseBrightness: 10,
                baseDuration: 180,
                fuelConsumption: 1,
                lightRadius: 5,
                features: ['protected_flame', 'weatherproof', 'portable'],
                mountType: 'glass_enclosure'
            },
            [this.torchTypes.CANDLESTICK]: {
                name: 'Candlestick',
                description: 'Elegant candle holder for refined settings',
                baseBrightness: 8,
                baseDuration: 240,
                fuelConsumption: 1,
                lightRadius: 4,
                features: ['elegant', 'refined', 'decorative'],
                mountType: 'candle_holder'
            },
            [this.torchTypes.CHANDELIER]: {
                name: 'Chandelier',
                description: 'Multi-candle lighting fixture for grand spaces',
                baseBrightness: 35,
                baseDuration: 300,
                fuelConsumption: 5,
                lightRadius: 15,
                features: ['multi_flame', 'grand', 'ornate'],
                mountType: 'ceiling_fixture'
            },
            [this.torchTypes.MAGICAL_ORB]: {
                name: 'Magical Orb',
                description: 'Floating magical light source',
                baseBrightness: 20,
                baseDuration: -1, // Eternal
                fuelConsumption: 0,
                lightRadius: 8,
                features: ['magical', 'floating', 'eternal'],
                mountType: 'magical_field'
            }
        };

        // Flame templates
        this.flameTemplates = {
            [this.flameTypes.NORMAL]: {
                name: 'Normal Flame',
                colors: { core: '#FF4500', mid: '#FFA500', outer: '#FFFF00' },
                intensity: 1.0,
                stability: 0.8,
                magical: false,
                features: ['flickering', 'warm', 'natural']
            },
            [this.flameTypes.MAGICAL]: {
                name: 'Magical Flame',
                colors: { core: '#9370DB', mid: '#00FFFF', outer: '#FFFFFF' },
                intensity: 1.5,
                stability: 1.0,
                magical: true,
                features: ['steady', 'magical', 'bright']
            },
            [this.flameTypes.COLORED]: {
                name: 'Colored Flame',
                colors: { core: '#FF1493', mid: '#00FF00', outer: '#4169E1' },
                intensity: 1.2,
                stability: 0.9,
                magical: true,
                features: ['colorful', 'magical', 'vibrant']
            },
            [this.flameTypes.ETERNAL]: {
                name: 'Eternal Flame',
                colors: { core: '#FFD700', mid: '#FFFFFF', outer: '#F0F8FF' },
                intensity: 1.8,
                stability: 1.0,
                magical: true,
                features: ['eternal', 'pure', 'divine']
            },
            [this.flameTypes.UNSTABLE]: {
                name: 'Unstable Flame',
                colors: { core: '#8B0000', mid: '#FF0000', outer: '#FFFF00' },
                intensity: 2.0,
                stability: 0.3,
                magical: true,
                features: ['volatile', 'dangerous', 'powerful']
            },
            [this.flameTypes.SOULFIRE]: {
                name: 'Soulfire',
                colors: { core: '#2F2F2F', mid: '#8B0000', outer: '#DC143C' },
                intensity: 1.3,
                stability: 0.9,
                magical: true,
                features: ['soul_bound', 'dark', 'intense']
            }
        };

        // Size modifiers
        this.sizeModifiers = {
            [this.torchSizes.SMALL]: {
                multiplier: 0.6,
                brightnessMultiplier: 0.7,
                durationMultiplier: 0.8,
                pixelSize: 16,
                features: ['small', 'discreet', 'compact']
            },
            [this.torchSizes.MEDIUM]: {
                multiplier: 1.0,
                brightnessMultiplier: 1.0,
                durationMultiplier: 1.0,
                pixelSize: 24,
                features: ['medium', 'standard', 'balanced']
            },
            [this.torchSizes.LARGE]: {
                multiplier: 1.5,
                brightnessMultiplier: 1.3,
                durationMultiplier: 1.2,
                pixelSize: 32,
                features: ['large', 'prominent', 'powerful']
            },
            [this.torchSizes.EXTRA_LARGE]: {
                multiplier: 2.2,
                brightnessMultiplier: 1.8,
                durationMultiplier: 1.5,
                pixelSize: 40,
                features: ['extra_large', 'massive', 'dominant']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.torchQualities.COMMON]: {
                statMultiplier: 1.0,
                brightnessMultiplier: 1.0,
                durationMultiplier: 1.0,
                rarity: 1,
                features: ['common', 'standard', 'reliable']
            },
            [this.torchQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                brightnessMultiplier: 1.1,
                durationMultiplier: 1.3,
                rarity: 2,
                features: ['uncommon', 'enhanced', 'improved']
            },
            [this.torchQualities.RARE]: {
                statMultiplier: 1.5,
                brightnessMultiplier: 1.3,
                durationMultiplier: 1.8,
                rarity: 3,
                features: ['rare', 'exceptional', 'superior']
            },
            [this.torchQualities.EPIC]: {
                statMultiplier: 2.0,
                brightnessMultiplier: 1.6,
                durationMultiplier: 2.5,
                rarity: 4,
                features: ['epic', 'masterwork', 'elite']
            },
            [this.torchQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                brightnessMultiplier: 2.0,
                durationMultiplier: 4.0,
                rarity: 5,
                features: ['legendary', 'artifact', 'legendary']
            },
            [this.torchQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                brightnessMultiplier: 3.0,
                durationMultiplier: 8.0,
                rarity: 6,
                features: ['mythical', 'divine', 'ultimate']
            }
        };

        // Material modifiers
        this.materialModifiers = {
            [this.materialTypes.WOOD]: {
                name: 'Wood',
                durability: 80,
                heatResistance: 20,
                weight: 5,
                features: ['flammable', 'natural', 'flexible']
            },
            [this.materialTypes.METAL]: {
                name: 'Metal',
                durability: 200,
                heatResistance: 100,
                weight: 15,
                features: ['durable', 'conductive', 'heavy']
            },
            [this.materialTypes.STONE]: {
                name: 'Stone',
                durability: 300,
                heatResistance: 150,
                weight: 25,
                features: ['very_durable', 'heat_resistant', 'heavy']
            },
            [this.materialTypes.CRYSTAL]: {
                name: 'Crystal',
                durability: 150,
                heatResistance: 80,
                weight: 8,
                features: ['pure', 'amplifying', 'fragile']
            },
            [this.materialTypes.MAGICAL]: {
                name: 'Magical',
                durability: 500,
                heatResistance: 200,
                weight: 3,
                features: ['magical', 'eternal', 'lightweight']
            },
            [this.materialTypes.BONE]: {
                name: 'Bone',
                durability: 120,
                heatResistance: 60,
                weight: 6,
                features: ['organic', 'ritualistic', 'lightweight']
            }
        };

        // Fuel modifiers
        this.fuelModifiers = {
            [this.fuelTypes.WOOD]: {
                name: 'Wood',
                burnTime: 120,
                brightness: 1.0,
                smoke: 8,
                features: ['natural', 'smoky', 'renewable']
            },
            [this.fuelTypes.OIL]: {
                name: 'Oil',
                burnTime: 180,
                brightness: 1.2,
                smoke: 2,
                features: ['clean', 'bright', 'efficient']
            },
            [this.fuelTypes.WAX]: {
                name: 'Wax',
                burnTime: 240,
                brightness: 0.8,
                smoke: 1,
                features: ['clean', 'steady', 'long_burning']
            },
            [this.fuelTypes.MAGICAL]: {
                name: 'Magical',
                burnTime: 300,
                brightness: 1.5,
                smoke: 0,
                features: ['magical', 'bright', 'smokeless']
            },
            [this.fuelTypes.ETERNAL]: {
                name: 'Eternal',
                burnTime: -1,
                brightness: 1.8,
                smoke: 0,
                features: ['eternal', 'divine', 'perfect']
            },
            [this.fuelTypes.SOUL]: {
                name: 'Soul',
                burnTime: 600,
                brightness: 1.3,
                smoke: 5,
                features: ['soul_bound', 'dark', 'powerful']
            }
        };

        // Flame shapes and patterns
        this.flameShapes = {
            torch: { width: 4, height: 12, pattern: 'flickering' },
            candle: { width: 2, height: 8, pattern: 'steady' },
            brazier: { width: 8, height: 16, pattern: 'roaring' },
            orb: { width: 6, height: 6, pattern: 'pulsing' },
            lantern: { width: 3, height: 6, pattern: 'gentle' },
            chandelier: { width: 10, height: 20, pattern: 'multi_flame' }
        };
    }

    /**
     * Generate torch sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.torchTypes.WALL_TORCH,
            flameType: options.flameType || this.flameTypes.NORMAL,
            size: options.size || this.torchSizes.MEDIUM,
            quality: options.quality || this.torchQualities.COMMON,
            material: options.material || this.materialTypes.WOOD,
            fuel: options.fuel || this.fuelTypes.WOOD,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates
        const torchTemplate = this.torchTemplates[config.type];
        const flameTemplate = this.flameTemplates[config.flameType];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];
        const materialTemplate = this.materialModifiers[config.material];
        const fuelTemplate = this.fuelModifiers[config.fuel];

        if (!torchTemplate || !flameTemplate || !sizeTemplate || !qualityTemplate || !materialTemplate || !fuelTemplate) {
            throw new Error(`Unknown torch configuration: ${config.type}, ${config.flameType}, ${config.size}, ${config.quality}, ${config.material}, ${config.fuel}`);
        }

        // Calculate final stats
        const finalStats = this.calculateTorchStats(torchTemplate, flameTemplate, sizeTemplate, qualityTemplate, materialTemplate, fuelTemplate, config);

        // Generate torch data
        const torchData = {
            id: this.generateTorchId(),
            name: this.generateTorchName(torchTemplate.name, flameTemplate.name, sizeTemplate, qualityTemplate),
            type: config.type,
            flameType: config.flameType,
            size: config.size,
            quality: config.quality,
            material: config.material,
            fuel: config.fuel,
            torchTemplate: torchTemplate,
            flameTemplate: flameTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            materialTemplate: materialTemplate,
            fuelTemplate: fuelTemplate,
            stats: finalStats,
            features: [...torchTemplate.features, ...flameTemplate.features, ...sizeTemplate.features, ...qualityTemplate.features, ...materialTemplate.features, ...fuelTemplate.features],
            description: this.generateDescription(torchTemplate, flameTemplate, sizeTemplate, qualityTemplate, materialTemplate, fuelTemplate),
            appearance: this.generateAppearance(torchTemplate, flameTemplate, materialTemplate, config.quality),
            effects: this.generateEffects(torchTemplate, flameTemplate, finalStats),
            lightData: this.generateLightData(torchTemplate, flameTemplate, finalStats)
        };

        // Generate sprite image
        const spriteImage = await this.generateTorchSprite(torchData, config);

        return {
            image: spriteImage,
            data: torchData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'TorchGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate torch sprite image
     */
    async generateTorchSprite(torchData, config) {
        const width = config.width || torchData.sizeTemplate.pixelSize * 2;
        const height = config.height || torchData.sizeTemplate.pixelSize * 3;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw torch based on type
        await this.drawTorchBase(image, torchData, config);

        // Draw flame
        await this.drawFlame(image, torchData, config);

        // Apply quality effects
        if (torchData.quality !== this.torchQualities.COMMON) {
            await this.addQualityEffects(image, torchData.quality);
        }

        return image;
    }

    /**
     * Draw torch base shape
     */
    async drawTorchBase(image, torchData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = torchData.sizeTemplate.pixelSize / 24;

        // Draw torch base based on type
        switch (torchData.type) {
            case this.torchTypes.WALL_TORCH:
                await this.drawWallTorch(image, centerX, centerY, scale, torchData);
                break;
            case this.torchTypes.HANDHELD_TORCH:
                await this.drawHandheldTorch(image, centerX, centerY, scale, torchData);
                break;
            case this.torchTypes.STANDING_TORCH:
                await this.drawStandingTorch(image, centerX, centerY, scale, torchData);
                break;
            case this.torchTypes.BRAZIER:
                await this.drawBrazier(image, centerX, centerY, scale, torchData);
                break;
            case this.torchTypes.LANTERN:
                await this.drawLantern(image, centerX, centerY, scale, torchData);
                break;
            case this.torchTypes.CANDLESTICK:
                await this.drawCandlestick(image, centerX, centerY, scale, torchData);
                break;
            case this.torchTypes.CHANDELIER:
                await this.drawChandelier(image, centerX, centerY, scale, torchData);
                break;
            case this.torchTypes.MAGICAL_ORB:
                await this.drawMagicalOrb(image, centerX, centerY, scale, torchData);
                break;
        }
    }

    /**
     * Draw wall torch
     */
    async drawWallTorch(image, x, y, scale, torchData) {
        const handleWidth = 3 * scale;
        const handleHeight = 16 * scale;
        const bracketWidth = 8 * scale;
        const bracketHeight = 4 * scale;

        // Draw wall bracket
        for (let i = -bracketWidth; i < bracketWidth; i++) {
            for (let j = -bracketHeight; j < bracketHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - handleHeight * 0.5);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bracketWidth && Math.abs(j) <= bracketHeight) {
                        const r = parseInt('#2F4F4F'.slice(1, 3), 16);
                        const g = parseInt('#2F4F4F'.slice(3, 5), 16);
                        const b = parseInt('#2F4F4F'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw torch handle
        for (let i = -handleWidth; i < handleWidth; i++) {
            for (let j = 0; j < handleHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= handleWidth && j >= 0 && j < handleHeight) {
                        const r = parseInt('#8B4513'.slice(1, 3), 16);
                        const g = parseInt('#8B4513'.slice(3, 5), 16);
                        const b = parseInt('#8B4513'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw handheld torch
     */
    async drawHandheldTorch(image, x, y, scale, torchData) {
        const handleWidth = 2 * scale;
        const handleHeight = 14 * scale;
        const headWidth = 4 * scale;
        const headHeight = 6 * scale;

        // Draw handle
        for (let i = -handleWidth; i < handleWidth; i++) {
            for (let j = 0; j < handleHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= handleWidth && j >= 0 && j < handleHeight) {
                        const r = parseInt('#654321'.slice(1, 3), 16);
                        const g = parseInt('#654321'.slice(3, 5), 16);
                        const b = parseInt('#654321'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw torch head
        for (let i = -headWidth; i < headWidth; i++) {
            for (let j = -headHeight; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= headWidth && Math.abs(j) <= headHeight) {
                        const r = parseInt('#2F2F2F'.slice(1, 3), 16);
                        const g = parseInt('#2F2F2F'.slice(3, 5), 16);
                        const b = parseInt('#2F2F2F'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw standing torch
     */
    async drawStandingTorch(image, x, y, scale, torchData) {
        const poleWidth = 2 * scale;
        const poleHeight = 20 * scale;
        const baseWidth = 6 * scale;
        const baseHeight = 4 * scale;

        // Draw base
        for (let i = -baseWidth; i < baseWidth; i++) {
            for (let j = poleHeight - baseHeight; j < poleHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= baseWidth && j >= poleHeight - baseHeight && j < poleHeight) {
                        const r = parseInt('#2F4F4F'.slice(1, 3), 16);
                        const g = parseInt('#2F4F4F'.slice(3, 5), 16);
                        const b = parseInt('#2F4F4F'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw pole
        for (let i = -poleWidth; i < poleWidth; i++) {
            for (let j = 0; j < poleHeight - baseHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= poleWidth && j >= 0 && j < poleHeight - baseHeight) {
                        const r = parseInt('#8B4513'.slice(1, 3), 16);
                        const g = parseInt('#8B4513'.slice(3, 5), 16);
                        const b = parseInt('#8B4513'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw brazier
     */
    async drawBrazier(image, x, y, scale, torchData) {
        const bowlWidth = 12 * scale;
        const bowlHeight = 6 * scale;
        const standWidth = 4 * scale;
        const standHeight = 8 * scale;

        // Draw bowl
        for (let i = -bowlWidth; i < bowlWidth; i++) {
            for (let j = -bowlHeight; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Bowl shape (wider at top)
                    const bowlShape = Math.abs(i) <= bowlWidth && Math.abs(j) <= bowlHeight &&
                                    Math.abs(i) <= bowlWidth * (1 - Math.abs(j) / bowlHeight * 0.3);
                    if (bowlShape) {
                        const r = parseInt('#2F4F4F'.slice(1, 3), 16);
                        const g = parseInt('#2F4F4F'.slice(3, 5), 16);
                        const b = parseInt('#2F4F4F'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw stands
        for (let stand = -1; stand <= 1; stand += 2) {
            const standX = x + stand * bowlWidth * 0.6;
            for (let i = -standWidth; i < standWidth; i++) {
                for (let j = 0; j < standHeight; j++) {
                    const pixelX = Math.floor(standX + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if (Math.abs(i) <= standWidth && j >= 0 && j < standHeight) {
                            const r = parseInt('#654321'.slice(1, 3), 16);
                            const g = parseInt('#654321'.slice(3, 5), 16);
                            const b = parseInt('#654321'.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw lantern
     */
    async drawLantern(image, x, y, scale, torchData) {
        const bodyWidth = 6 * scale;
        const bodyHeight = 10 * scale;
        const handleWidth = 8 * scale;
        const handleHeight = 2 * scale;

        // Draw lantern body
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = -bodyHeight; j < bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bodyWidth && Math.abs(j) <= bodyHeight) {
                        const r = parseInt('#2F4F4F'.slice(1, 3), 16);
                        const g = parseInt('#2F4F4F'.slice(3, 5), 16);
                        const b = parseInt('#2F4F4F'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw handle
        for (let i = -handleWidth; i < handleWidth; i++) {
            for (let j = -handleHeight; j < handleHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y - bodyHeight - handleHeight);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= handleWidth && Math.abs(j) <= handleHeight) {
                        const r = parseInt('#654321'.slice(1, 3), 16);
                        const g = parseInt('#654321'.slice(3, 5), 16);
                        const b = parseInt('#654321'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw candlestick
     */
    async drawCandlestick(image, x, y, scale, torchData) {
        const baseWidth = 4 * scale;
        const baseHeight = 3 * scale;
        const stemWidth = 1 * scale;
        const stemHeight = 8 * scale;
        const holderWidth = 3 * scale;
        const holderHeight = 2 * scale;

        // Draw base
        for (let i = -baseWidth; i < baseWidth; i++) {
            for (let j = stemHeight; j < stemHeight + baseHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= baseWidth && j >= stemHeight && j < stemHeight + baseHeight) {
                        const r = parseInt('#C0C0C0'.slice(1, 3), 16);
                        const g = parseInt('#C0C0C0'.slice(3, 5), 16);
                        const b = parseInt('#C0C0C0'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw stem
        for (let i = -stemWidth; i < stemWidth; i++) {
            for (let j = 0; j < stemHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= stemWidth && j >= 0 && j < stemHeight) {
                        const r = parseInt('#C0C0C0'.slice(1, 3), 16);
                        const g = parseInt('#C0C0C0'.slice(3, 5), 16);
                        const b = parseInt('#C0C0C0'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw candle holder
        for (let i = -holderWidth; i < holderWidth; i++) {
            for (let j = -holderHeight; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= holderWidth && Math.abs(j) <= holderHeight) {
                        const r = parseInt('#C0C0C0'.slice(1, 3), 16);
                        const g = parseInt('#C0C0C0'.slice(3, 5), 16);
                        const b = parseInt('#C0C0C0'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw chandelier
     */
    async drawChandelier(image, x, y, scale, torchData) {
        const frameWidth = 16 * scale;
        const frameHeight = 4 * scale;
        const chainLength = 6 * scale;

        // Draw frame
        for (let i = -frameWidth; i < frameWidth; i++) {
            for (let j = -frameHeight; j < frameHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - chainLength);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= frameWidth && Math.abs(j) <= frameHeight) {
                        const r = parseInt('#FFD700'.slice(1, 3), 16);
                        const g = parseInt('#FFD700'.slice(3, 5), 16);
                        const b = parseInt('#FFD700'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw chains
        for (let chain = -3; chain <= 3; chain += 2) {
            const chainX = x + chain * frameWidth * 0.3;
            for (let j = -chainLength; j < 0; j++) {
                const pixelX = Math.floor(chainX);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const r = parseInt('#C0C0C0'.slice(1, 3), 16);
                    const g = parseInt('#C0C0C0'.slice(3, 5), 16);
                    const b = parseInt('#C0C0C0'.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw magical orb
     */
    async drawMagicalOrb(image, x, y, scale, torchData) {
        const orbRadius = 8 * scale;

        // Draw orb
        for (let i = -orbRadius; i < orbRadius; i++) {
            for (let j = -orbRadius; j < orbRadius; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const distance = Math.sqrt(i * i + j * j);
                    if (distance <= orbRadius) {
                        const r = parseInt('#9370DB'.slice(1, 3), 16);
                        const g = parseInt('#9370DB'.slice(3, 5), 16);
                        const b = parseInt('#9370DB'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw flame
     */
    async drawFlame(image, torchData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = torchData.sizeTemplate.pixelSize / 24;

        // Get flame shape based on torch type
        const flameShape = this.flameShapes[torchData.type] || this.flameShapes.torch;
        const flameColors = torchData.flameTemplate.colors;

        // Draw flame based on shape
        for (let i = -flameShape.width * scale; i < flameShape.width * scale; i++) {
            for (let j = -flameShape.height * scale; j < 0; j++) {
                const pixelX = Math.floor(centerX + i);
                const pixelY = Math.floor(centerY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Flame shape logic
                    const flameX = i / (flameShape.width * scale);
                    const flameY = -j / (flameShape.height * scale);

                    if (this.isInFlameShape(flameX, flameY, flameShape.pattern)) {
                        // Color gradient based on height
                        let color;
                        if (flameY < 0.3) {
                            color = flameColors.outer;
                        } else if (flameY < 0.7) {
                            color = flameColors.mid;
                        } else {
                            color = flameColors.core;
                        }

                        const r = parseInt(color.slice(1, 3), 16);
                        const g = parseInt(color.slice(3, 5), 16);
                        const b = parseInt(color.slice(5, 7), 16);
                        const finalColor = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(finalColor, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Check if point is in flame shape
     */
    isInFlameShape(x, y, pattern) {
        switch (pattern) {
            case 'flickering':
                // Add some randomness for flickering effect
                const flicker = Math.sin(x * 10) * 0.1;
                return Math.abs(x) <= (0.5 - y * 0.3 + flicker) && y >= 0 && y <= 1;
            case 'steady':
                return Math.abs(x) <= (0.3 - y * 0.2) && y >= 0 && y <= 1;
            case 'roaring':
                return Math.abs(x) <= (0.8 - y * 0.4) && y >= 0 && y <= 1;
            case 'pulsing':
                const pulse = Math.sin(Date.now() * 0.01) * 0.1;
                return Math.sqrt(x * x + (y - 0.5) * (y - 0.5)) <= (0.5 + pulse);
            case 'gentle':
                return Math.abs(x) <= (0.2 - y * 0.1) && y >= 0 && y <= 1;
            case 'multi_flame':
                // Multiple flame points
                return (Math.abs(x - 0.3) <= 0.1 && y >= 0 && y <= 1) ||
                       (Math.abs(x + 0.3) <= 0.1 && y >= 0 && y <= 1) ||
                       (Math.abs(x) <= 0.05 && y >= 0 && y <= 1);
            default:
                return Math.abs(x) <= (0.5 - y * 0.3) && y >= 0 && y <= 1;
        }
    }

    /**
     * Add quality effects
     */
    async addQualityEffects(image, quality) {
        switch (quality) {
            case this.torchQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.torchQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.torchQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.torchQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Calculate torch stats
     */
    calculateTorchStats(torchTemplate, flameTemplate, sizeTemplate, qualityTemplate, materialTemplate, fuelTemplate, config) {
        const stats = {
            brightness: Math.round(torchTemplate.baseBrightness * sizeTemplate.brightnessMultiplier * qualityTemplate.brightnessMultiplier * flameTemplate.intensity * fuelTemplate.brightness),
            duration: torchTemplate.baseDuration === -1 ? -1 : Math.round(torchTemplate.baseDuration * sizeTemplate.durationMultiplier * qualityTemplate.durationMultiplier * fuelTemplate.burnTime / 60), // Convert to minutes
            fuelConsumption: Math.round(torchTemplate.fuelConsumption * qualityTemplate.statMultiplier),
            lightRadius: Math.round(torchTemplate.lightRadius * sizeTemplate.multiplier * qualityTemplate.statMultiplier),
            durability: materialTemplate.durability,
            weight: materialTemplate.weight * sizeTemplate.multiplier,
            heatResistance: materialTemplate.heatResistance,
            stability: flameTemplate.stability,
            smoke: fuelTemplate.smoke,
            rarity: qualityTemplate.rarity
        };

        return stats;
    }

    /**
     * Generate torch ID
     */
    generateTorchId() {
        return 'torch_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate torch name
     */
    generateTorchName(torchName, flameName, sizeTemplate, qualityTemplate) {
        const sizePrefixes = {
            [this.torchSizes.SMALL]: 'Small ',
            [this.torchSizes.MEDIUM]: '',
            [this.torchSizes.LARGE]: 'Large ',
            [this.torchSizes.EXTRA_LARGE]: 'Grand '
        };

        const qualityPrefixes = {
            [this.torchQualities.COMMON]: '',
            [this.torchQualities.UNCOMMON]: 'Fine ',
            [this.torchQualities.RARE]: 'Ornate ',
            [this.torchQualities.EPIC]: 'Magnificent ',
            [this.torchQualities.LEGENDARY]: 'Legendary ',
            [this.torchQualities.MYTHICAL]: 'Mythical '
        };

        return `${qualityPrefixes[qualityTemplate]}${sizePrefixes[sizeTemplate]}${torchName} with ${flameName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(torchTemplate, flameTemplate, sizeTemplate, qualityTemplate, materialTemplate, fuelTemplate) {
        const qualityDesc = {
            [this.torchQualities.COMMON]: 'A standard torch',
            [this.torchQualities.UNCOMMON]: 'A well-crafted torch',
            [this.torchQualities.RARE]: 'An ornate torch',
            [this.torchQualities.EPIC]: 'A magnificent torch',
            [this.torchQualities.LEGENDARY]: 'A legendary torch',
            [this.torchQualities.MYTHICAL]: 'A mythical torch'
        };

        const materialDesc = ` made of ${materialTemplate.name.toLowerCase()}`;
        const fuelDesc = ` fueled by ${fuelTemplate.name.toLowerCase()}`;

        return `${qualityDesc[qualityTemplate]}${materialDesc}${fuelDesc}. ${torchTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(torchTemplate, flameTemplate, materialTemplate, quality) {
        return {
            torchType: torchTemplate,
            flameType: flameTemplate,
            material: materialTemplate,
            quality: quality,
            primaryColor: flameTemplate.colors.core,
            secondaryColor: materialTemplate.name === 'Metal' ? '#C0C0C0' : '#8B4513'
        };
    }

    /**
     * Generate effects
     */
    generateEffects(torchTemplate, flameTemplate, stats) {
        const effects = [];

        // Light effect
        effects.push({
            type: 'light_source',
            power: stats.brightness,
            duration: stats.duration,
            instant: false,
            radius: stats.lightRadius
        });

        // Heat effect
        effects.push({
            type: 'heat_source',
            power: Math.round(stats.brightness * 0.3),
            duration: stats.duration,
            instant: false
        });

        // Flame-specific effects
        if (flameTemplate.magical) {
            effects.push({
                type: 'magical_illumination',
                power: Math.round(stats.brightness * flameTemplate.intensity),
                duration: stats.duration,
                instant: false
            });
        }

        return effects;
    }

    /**
     * Generate light data
     */
    generateLightData(torchTemplate, flameTemplate, stats) {
        return {
            brightness: stats.brightness,
            radius: stats.lightRadius,
            color: flameTemplate.colors.core,
            flicker: flameTemplate.stability < 1.0,
            magical: flameTemplate.magical,
            duration: stats.duration,
            fuelConsumption: stats.fuelConsumption
        };
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addRareGlow(image) { return image; }
    async addEpicGlow(image) { return image; }
    async addLegendaryGlow(image) { return image; }
    async addMythicalGlow(image) { return image; }

    /**
     * Batch generate torches
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const torch = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(torch);
            } catch (error) {
                console.error(`Failed to generate torch ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(t => t !== null);
    }

    /**
     * Generate torch by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.flameType) options.flameType = criteria.flameType;
        if (criteria.size) options.size = criteria.size;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.material) options.material = criteria.material;
        if (criteria.fuel) options.fuel = criteria.fuel;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get torch statistics
     */
    getTorchStatistics() {
        return {
            totalTypes: Object.keys(this.torchTypes).length,
            totalFlameTypes: Object.keys(this.flameTypes).length,
            totalSizes: Object.keys(this.torchSizes).length,
            totalQualities: Object.keys(this.torchQualities).length,
            totalMaterials: Object.keys(this.materialTypes).length,
            totalFuels: Object.keys(this.fuelTypes).length,
            torchTemplates: Object.keys(this.torchTemplates).length,
            flameTemplates: Object.keys(this.flameTemplates).length
        };
    }

    /**
     * Export torch data
     */
    async exportTorchData(torch, outputPath) {
        const exportData = {
            ...torch.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save torch data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate torch configuration
     */
    validateTorchConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.torchTypes).includes(config.type)) {
            errors.push(`Invalid torch type: ${config.type}`);
        }

        if (config.flameType && !Object.values(this.flameTypes).includes(config.flameType)) {
            errors.push(`Invalid flame type: ${config.flameType}`);
        }

        if (config.size && !Object.values(this.torchSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.torchQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.material && !Object.values(this.materialTypes).includes(config.material)) {
            errors.push(`Invalid material type: ${config.material}`);
        }

        if (config.fuel && !Object.values(this.fuelTypes).includes(config.fuel)) {
            errors.push(`Invalid fuel type: ${config.fuel}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate lighting set
     */
    async generateLightingSet(count = 6, theme = 'mixed') {
        const lightingSet = [];

        const torchTypes = Object.values(this.torchTypes);

        for (let i = 0; i < count; i++) {
            let torchType, flameType, material, fuel;

            switch (theme) {
                case 'dungeon':
                    torchType = [this.torchTypes.WALL_TORCH, this.torchTypes.STANDING_TORCH][Math.floor(Math.random() * 2)];
                    flameType = this.flameTypes.NORMAL;
                    material = this.materialTypes.WOOD;
                    fuel = this.fuelTypes.WOOD;
                    break;
                case 'magical':
                    torchType = [this.torchTypes.MAGICAL_ORB, this.torchTypes.LANTERN][Math.floor(Math.random() * 2)];
                    flameType = [this.flameTypes.MAGICAL, this.flameTypes.ETERNAL][Math.floor(Math.random() * 2)];
                    material = this.materialTypes.MAGICAL;
                    fuel = this.fuelTypes.MAGICAL;
                    break;
                case 'noble':
                    torchType = [this.torchTypes.CHANDELIER, this.torchTypes.CANDLESTICK][Math.floor(Math.random() * 2)];
                    flameType = this.flameTypes.NORMAL;
                    material = this.materialTypes.METAL;
                    fuel = this.fuelTypes.WAX;
                    break;
                default:
                    torchType = torchTypes[Math.floor(Math.random() * torchTypes.length)];
                    flameType = Object.values(this.flameTypes)[Math.floor(Math.random() * Object.values(this.flameTypes).length)];
                    material = Object.values(this.materialTypes)[Math.floor(Math.random() * Object.values(this.materialTypes).length)];
                    fuel = Object.values(this.fuelTypes)[Math.floor(Math.random() * Object.values(this.fuelTypes).length)];
            }

            const torch = await this.generate({
                type: torchType,
                flameType: flameType,
                size: this.torchSizes.MEDIUM,
                quality: this.torchQualities.COMMON,
                material: material,
                fuel: fuel
            });

            lightingSet.push(torch);
        }

        return lightingSet;
    }

    /**
     * Generate torch with specific brightness
     */
    async generateTorchByBrightness(minBrightness, maxBrightness, options = {}) {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const quality = this.getRandomFromArray(Object.values(this.torchQualities));
            const size = this.getRandomFromArray(Object.values(this.torchSizes));
            const flameType = this.getRandomFromArray(Object.values(this.flameTypes));
            const fuel = this.getRandomFromArray(Object.values(this.fuelTypes));

            const torchTemplate = this.torchTemplates[options.type || this.torchTypes.WALL_TORCH];
            const flameTemplate = this.flameTemplates[flameType];
            const sizeTemplate = this.sizeModifiers[size];
            const qualityTemplate = this.qualityModifiers[quality];
            const fuelTemplate = this.fuelModifiers[fuel];

            const estimatedBrightness = Math.round(torchTemplate.baseBrightness *
                sizeTemplate.brightnessMultiplier *
                qualityTemplate.brightnessMultiplier *
                flameTemplate.intensity *
                fuelTemplate.brightness);

            if (estimatedBrightness >= minBrightness && estimatedBrightness <= maxBrightness) {
                return await this.generate({
                    size: size,
                    quality: quality,
                    flameType: flameType,
                    fuel: fuel,
                    ...options
                });
            }

            attempts++;
        }

        // Fallback
        return await this.generate({
            size: this.torchSizes.MEDIUM,
            quality: this.torchQualities.COMMON,
            ...options
        });
    }

    /**
     * Get random item from array
     */
    getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Calculate torch maintenance cost
     */
    calculateMaintenanceCost(torchData) {
        const baseCost = torchData.stats.brightness * 0.1; // 10% of brightness value per maintenance
        const materialMultiplier = torchData.material === this.materialTypes.MAGICAL ? 5.0 :
                                  torchData.material === this.materialTypes.CRYSTAL ? 3.0 :
                                  torchData.material === this.materialTypes.METAL ? 2.0 : 1.0;

        return Math.round(baseCost * materialMultiplier);
    }

    /**
     * Calculate fuel consumption rate
     */
    calculateFuelConsumption(torchData, timeInMinutes = 60) {
        const consumptionRate = torchData.stats.fuelConsumption / 60; // per minute
        return Math.round(consumptionRate * timeInMinutes);
    }

    /**
     * Generate torch performance report
     */
    generatePerformanceReport(torchData) {
        const performance = {
            overall: 0,
            categories: {}
        };

        // Calculate performance scores
        performance.categories.brightness = Math.min(100, (torchData.stats.brightness / 50) * 100);
        performance.categories.duration = torchData.stats.duration === -1 ? 100 : Math.min(100, (torchData.stats.duration / 300) * 100);
        performance.categories.radius = Math.min(100, (torchData.stats.lightRadius / 20) * 100);
        performance.categories.stability = Math.min(100, torchData.stats.stability * 100);

        // Calculate overall performance
        const scores = Object.values(performance.categories);
        performance.overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        return performance;
    }

    /**
     * Generate torch upgrade options
     */
    generateUpgradeOptions(torchData) {
        const upgrades = [];

        // Quality upgrades
        if (torchData.quality !== this.torchQualities.MYTHICAL) {
            const nextQuality = this.getNextQuality(torchData.quality);
            upgrades.push({
                type: 'quality',
                name: `Upgrade to ${nextQuality} quality`,
                cost: Math.round(torchData.stats.brightness * 2),
                benefits: ['+30% brightness', '+50% duration', '+1 rarity']
            });
        }

        // Size upgrades
        if (torchData.size !== this.torchSizes.EXTRA_LARGE) {
            const nextSize = this.getNextSize(torchData.size);
            upgrades.push({
                type: 'size',
                name: `Upgrade to ${nextSize} size`,
                cost: Math.round(torchData.stats.brightness * 1.5),
                benefits: ['+25% brightness', '+20% light radius']
            });
        }

        // Flame upgrades
        if (torchData.flameType !== this.flameTypes.ETERNAL) {
            upgrades.push({
                type: 'flame',
                name: 'Upgrade to eternal flame',
                cost: Math.round(torchData.stats.brightness * 5),
                benefits: ['Infinite duration', '+50% brightness', 'No fuel consumption']
            });
        }

        return upgrades;
    }

    /**
     * Get next quality level
     */
    getNextQuality(currentQuality) {
        const qualities = Object.values(this.torchQualities);
        const currentIndex = qualities.indexOf(currentQuality);
        return qualities[Math.min(currentIndex + 1, qualities.length - 1)];
    }

    /**
     * Get next size level
     */
    getNextSize(currentSize) {
        const sizes = Object.values(this.torchSizes);
        const currentIndex = sizes.indexOf(currentSize);
        return sizes[Math.min(currentIndex + 1, sizes.length - 1)];
    }

    /**
     * Generate torch comparison
     */
    async generateTorchComparison(torchType, qualities = ['common', 'rare', 'epic']) {
        const comparison = {};

        for (const quality of qualities) {
            const torch = await this.generate({
                type: torchType,
                quality: quality
            });

            comparison[quality] = {
                name: torch.data.name,
                brightness: torch.data.stats.brightness,
                duration: torch.data.stats.duration,
                lightRadius: torch.data.stats.lightRadius,
                performance: this.generatePerformanceReport(torch.data)
            };
        }

        return comparison;
    }

    /**
     * Generate themed torch collection
     */
    async generateThemedTorchCollection(theme = 'dungeon', count = 8) {
        const collection = [];

        let style, material, fuel, flameType;

        switch (theme) {
            case 'dungeon':
                material = this.materialTypes.WOOD;
                fuel = this.fuelTypes.WOOD;
                flameType = this.flameTypes.NORMAL;
                break;
            case 'castle':
                material = this.materialTypes.METAL;
                fuel = this.fuelTypes.OIL;
                flameType = this.flameTypes.NORMAL;
                break;
            case 'magical':
                material = this.materialTypes.MAGICAL;
                fuel = this.fuelTypes.MAGICAL;
                flameType = this.flameTypes.MAGICAL;
                break;
            case 'noble':
                material = this.materialTypes.METAL;
                fuel = this.fuelTypes.WAX;
                flameType = this.flameTypes.NORMAL;
                break;
            default:
                material = this.materialTypes.WOOD;
                fuel = this.fuelTypes.WOOD;
                flameType = this.flameTypes.NORMAL;
        }

        const torchTypes = Object.values(this.torchTypes);

        for (let i = 0; i < count; i++) {
            const torchType = torchTypes[Math.floor(Math.random() * torchTypes.length)];

            const torch = await this.generate({
                type: torchType,
                flameType: flameType,
                size: this.torchSizes.MEDIUM,
                quality: this.torchQualities.COMMON,
                material: material,
                fuel: fuel
            });

            collection.push(torch);
        }

        return collection;
    }
}

module.exports = TorchGenerator;
