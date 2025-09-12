/**
 * Lantern Generator - Complete lantern and enclosed lighting sprite generation system
 * Generates various types of lanterns, lamps, and protected light sources
 */

const Jimp = require('jimp');
const path = require('path');

class LanternGenerator {
    constructor() {
        this.lanternTypes = {
            HANGING_LANTERN: 'hanging_lantern',
            PORTABLE_LANTERN: 'portable_lantern',
            STORM_LANTERN: 'storm_lantern',
            STREET_LANTERN: 'street_lantern',
            MAGIC_LANTERN: 'magic_lantern',
            PAPER_LANTERN: 'paper_lantern',
            CRYSTAL_LANTERN: 'crystal_lantern',
            SKELETON_LANTERN: 'skeleton_lantern'
        };

        this.flameTypes = {
            NORMAL: 'normal',
            MAGICAL: 'magical',
            COLORED: 'colored',
            ETERNAL: 'eternal',
            UNSTABLE: 'unstable',
            SOULFIRE: 'soulfire'
        };

        this.lanternSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            EXTRA_LARGE: 'extra_large'
        };

        this.lanternQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.materialTypes = {
            METAL: 'metal',
            GLASS: 'glass',
            WOOD: 'wood',
            PAPER: 'paper',
            CRYSTAL: 'crystal',
            BONE: 'bone',
            MAGICAL: 'magical'
        };

        this.fuelTypes = {
            OIL: 'oil',
            WAX: 'wax',
            MAGICAL: 'magical',
            ETERNAL: 'eternal',
            SOUL: 'soul',
            ALCHEMICAL: 'alchemical'
        };

        this.mountingTypes = {
            HANGING: 'hanging',
            PORTABLE: 'portable',
            WALL_MOUNTED: 'wall_mounted',
            POLE_MOUNTED: 'pole_mounted',
            FLOATING: 'floating',
            TABLETOP: 'tabletop'
        };

        // Lantern templates with their properties
        this.lanternTemplates = {
            [this.lanternTypes.HANGING_LANTERN]: {
                name: 'Hanging Lantern',
                description: 'Lantern suspended from chains or ropes for overhead lighting',
                baseBrightness: 18,
                baseDuration: 240,
                fuelConsumption: 1,
                lightRadius: 10,
                weatherResistance: 6,
                features: ['suspended', 'overhead_light', 'swaying'],
                mountingType: this.mountingTypes.HANGING
            },
            [this.lanternTypes.PORTABLE_LANTERN]: {
                name: 'Portable Lantern',
                description: 'Handheld lantern for exploration and travel',
                baseBrightness: 14,
                baseDuration: 180,
                fuelConsumption: 2,
                lightRadius: 7,
                weatherResistance: 4,
                features: ['handheld', 'portable', 'exploration'],
                mountingType: this.mountingTypes.PORTABLE
            },
            [this.lanternTypes.STORM_LANTERN]: {
                name: 'Storm Lantern',
                description: 'Weatherproof lantern with protective housing',
                baseBrightness: 16,
                baseDuration: 300,
                fuelConsumption: 1,
                lightRadius: 8,
                weatherResistance: 10,
                features: ['weatherproof', 'durable', 'nautical'],
                mountingType: this.mountingTypes.PORTABLE
            },
            [this.lanternTypes.STREET_LANTERN]: {
                name: 'Street Lantern',
                description: 'Public lantern for street and pathway illumination',
                baseBrightness: 22,
                baseDuration: 360,
                fuelConsumption: 2,
                lightRadius: 12,
                weatherResistance: 8,
                features: ['public', 'street_light', 'communal'],
                mountingType: this.mountingTypes.POLE_MOUNTED
            },
            [this.lanternTypes.MAGIC_LANTERN]: {
                name: 'Magic Lantern',
                description: 'Enchanted lantern with magical illumination',
                baseBrightness: 25,
                baseDuration: -1, // Eternal
                fuelConsumption: 0,
                lightRadius: 11,
                weatherResistance: 12,
                features: ['magical', 'eternal', 'enchanted'],
                mountingType: this.mountingTypes.HANGING
            },
            [this.lanternTypes.PAPER_LANTERN]: {
                name: 'Paper Lantern',
                description: 'Delicate lantern made from paper and light wood',
                baseBrightness: 12,
                baseDuration: 120,
                fuelConsumption: 3,
                lightRadius: 6,
                weatherResistance: 2,
                features: ['delicate', 'ornamental', 'festive'],
                mountingType: this.mountingTypes.HANGING
            },
            [this.lanternTypes.CRYSTAL_LANTERN]: {
                name: 'Crystal Lantern',
                description: 'Elegant lantern with crystal glass panels',
                baseBrightness: 20,
                baseDuration: 280,
                fuelConsumption: 1,
                lightRadius: 9,
                weatherResistance: 7,
                features: ['elegant', 'crystal', 'refined'],
                mountingType: this.mountingTypes.TABLETOP
            },
            [this.lanternTypes.SKELETON_LANTERN]: {
                name: 'Skeleton Lantern',
                description: 'Macabre lantern made from bones and dark materials',
                baseBrightness: 15,
                baseDuration: 200,
                fuelConsumption: 2,
                lightRadius: 7,
                weatherResistance: 5,
                features: ['macabre', 'bone', 'dark'],
                mountingType: this.mountingTypes.PORTABLE
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
            [this.lanternSizes.SMALL]: {
                multiplier: 0.6,
                brightnessMultiplier: 0.7,
                durationMultiplier: 0.8,
                pixelSize: 20,
                features: ['small', 'discreet', 'compact']
            },
            [this.lanternSizes.MEDIUM]: {
                multiplier: 1.0,
                brightnessMultiplier: 1.0,
                durationMultiplier: 1.0,
                pixelSize: 30,
                features: ['medium', 'standard', 'balanced']
            },
            [this.lanternSizes.LARGE]: {
                multiplier: 1.5,
                brightnessMultiplier: 1.3,
                durationMultiplier: 1.2,
                pixelSize: 40,
                features: ['large', 'prominent', 'powerful']
            },
            [this.lanternSizes.EXTRA_LARGE]: {
                multiplier: 2.2,
                brightnessMultiplier: 1.8,
                durationMultiplier: 1.5,
                pixelSize: 50,
                features: ['extra_large', 'massive', 'dominant']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.lanternQualities.COMMON]: {
                statMultiplier: 1.0,
                brightnessMultiplier: 1.0,
                durationMultiplier: 1.0,
                rarity: 1,
                features: ['common', 'standard', 'reliable']
            },
            [this.lanternQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                brightnessMultiplier: 1.1,
                durationMultiplier: 1.3,
                rarity: 2,
                features: ['uncommon', 'enhanced', 'improved']
            },
            [this.lanternQualities.RARE]: {
                statMultiplier: 1.5,
                brightnessMultiplier: 1.3,
                durationMultiplier: 1.8,
                rarity: 3,
                features: ['rare', 'exceptional', 'superior']
            },
            [this.lanternQualities.EPIC]: {
                statMultiplier: 2.0,
                brightnessMultiplier: 1.6,
                durationMultiplier: 2.5,
                rarity: 4,
                features: ['epic', 'masterwork', 'elite']
            },
            [this.lanternQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                brightnessMultiplier: 2.0,
                durationMultiplier: 4.0,
                rarity: 5,
                features: ['legendary', 'artifact', 'legendary']
            },
            [this.lanternQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                brightnessMultiplier: 3.0,
                durationMultiplier: 8.0,
                rarity: 6,
                features: ['mythical', 'divine', 'ultimate']
            }
        };

        // Material modifiers
        this.materialModifiers = {
            [this.materialTypes.METAL]: {
                name: 'Metal',
                durability: 250,
                heatResistance: 120,
                weight: 20,
                transparency: 0,
                features: ['durable', 'conductive', 'heavy']
            },
            [this.materialTypes.GLASS]: {
                name: 'Glass',
                durability: 80,
                heatResistance: 40,
                weight: 8,
                transparency: 0.9,
                features: ['transparent', 'fragile', 'clear']
            },
            [this.materialTypes.WOOD]: {
                name: 'Wood',
                durability: 120,
                heatResistance: 30,
                weight: 12,
                transparency: 0,
                features: ['natural', 'flexible', 'warm']
            },
            [this.materialTypes.PAPER]: {
                name: 'Paper',
                durability: 30,
                heatResistance: 10,
                weight: 2,
                transparency: 0.7,
                features: ['delicate', 'flexible', 'ornamental']
            },
            [this.materialTypes.CRYSTAL]: {
                name: 'Crystal',
                durability: 180,
                heatResistance: 80,
                weight: 15,
                transparency: 0.95,
                features: ['pure', 'amplifying', 'elegant']
            },
            [this.materialTypes.BONE]: {
                name: 'Bone',
                durability: 100,
                heatResistance: 50,
                weight: 6,
                transparency: 0.3,
                features: ['organic', 'ritualistic', 'macabre']
            },
            [this.materialTypes.MAGICAL]: {
                name: 'Magical',
                durability: 400,
                heatResistance: 200,
                weight: 5,
                transparency: 0.8,
                features: ['magical', 'eternal', 'mystical']
            }
        };

        // Fuel modifiers
        this.fuelModifiers = {
            [this.fuelTypes.OIL]: {
                name: 'Oil',
                burnTime: 240,
                brightness: 1.0,
                smoke: 3,
                features: ['clean', 'bright', 'efficient']
            },
            [this.fuelTypes.WAX]: {
                name: 'Wax',
                burnTime: 300,
                brightness: 0.9,
                smoke: 1,
                features: ['clean', 'steady', 'long_burning']
            },
            [this.fuelTypes.MAGICAL]: {
                name: 'Magical',
                burnTime: 400,
                brightness: 1.4,
                smoke: 0,
                features: ['magical', 'bright', 'smokeless']
            },
            [this.fuelTypes.ETERNAL]: {
                name: 'Eternal',
                burnTime: -1,
                brightness: 1.6,
                smoke: 0,
                features: ['eternal', 'divine', 'perfect']
            },
            [this.fuelTypes.SOUL]: {
                name: 'Soul',
                burnTime: 500,
                brightness: 1.2,
                smoke: 8,
                features: ['soul_bound', 'dark', 'powerful']
            },
            [this.fuelTypes.ALCHEMICAL]: {
                name: 'Alchemical',
                burnTime: 350,
                brightness: 1.3,
                smoke: 2,
                features: ['chemical', 'bright', 'unstable']
            }
        };

        // Glass/panel variations
        this.glassVariations = {
            CLEAR: { name: 'Clear', tint: '#FFFFFF', opacity: 0.1 },
            FROSTED: { name: 'Frosted', tint: '#F5F5F5', opacity: 0.3 },
            COLORED: { name: 'Colored', tint: '#87CEEB', opacity: 0.2 },
            STAINED: { name: 'Stained', tint: '#9370DB', opacity: 0.25 },
            MAGICAL: { name: 'Magical', tint: '#00FFFF', opacity: 0.15 }
        };
    }

    /**
     * Generate lantern sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.lanternTypes.HANGING_LANTERN,
            flameType: options.flameType || this.flameTypes.NORMAL,
            size: options.size || this.lanternSizes.MEDIUM,
            quality: options.quality || this.lanternQualities.COMMON,
            material: options.material || this.materialTypes.METAL,
            fuel: options.fuel || this.fuelTypes.OIL,
            glassType: options.glassType || 'CLEAR',
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates
        const lanternTemplate = this.lanternTemplates[config.type];
        const flameTemplate = this.flameTemplates[config.flameType];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];
        const materialTemplate = this.materialModifiers[config.material];
        const fuelTemplate = this.fuelModifiers[config.fuel];
        const glassTemplate = this.glassVariations[config.glassType];

        if (!lanternTemplate || !flameTemplate || !sizeTemplate || !qualityTemplate || !materialTemplate || !fuelTemplate || !glassTemplate) {
            throw new Error(`Unknown lantern configuration: ${config.type}, ${config.flameType}, ${config.size}, ${config.quality}, ${config.material}, ${config.fuel}, ${config.glassType}`);
        }

        // Calculate final stats
        const finalStats = this.calculateLanternStats(lanternTemplate, flameTemplate, sizeTemplate, qualityTemplate, materialTemplate, fuelTemplate, glassTemplate, config);

        // Generate lantern data
        const lanternData = {
            id: this.generateLanternId(),
            name: this.generateLanternName(lanternTemplate.name, flameTemplate.name, sizeTemplate, qualityTemplate),
            type: config.type,
            flameType: config.flameType,
            size: config.size,
            quality: config.quality,
            material: config.material,
            fuel: config.fuel,
            glassType: config.glassType,
            lanternTemplate: lanternTemplate,
            flameTemplate: flameTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            materialTemplate: materialTemplate,
            fuelTemplate: fuelTemplate,
            glassTemplate: glassTemplate,
            stats: finalStats,
            features: [...lanternTemplate.features, ...flameTemplate.features, ...sizeTemplate.features, ...qualityTemplate.features, ...materialTemplate.features, ...fuelTemplate.features],
            description: this.generateDescription(lanternTemplate, flameTemplate, sizeTemplate, qualityTemplate, materialTemplate, fuelTemplate, glassTemplate),
            appearance: this.generateAppearance(lanternTemplate, flameTemplate, materialTemplate, glassTemplate, config.quality),
            effects: this.generateEffects(lanternTemplate, flameTemplate, finalStats),
            lightData: this.generateLightData(lanternTemplate, flameTemplate, finalStats)
        };

        // Generate sprite image
        const spriteImage = await this.generateLanternSprite(lanternData, config);

        return {
            image: spriteImage,
            data: lanternData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'LanternGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate lantern sprite image
     */
    async generateLanternSprite(lanternData, config) {
        const width = config.width || lanternData.sizeTemplate.pixelSize * 2;
        const height = config.height || lanternData.sizeTemplate.pixelSize * 3;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw lantern based on type
        await this.drawLanternBase(image, lanternData, config);

        // Draw flame
        await this.drawFlame(image, lanternData, config);

        // Apply quality effects
        if (lanternData.quality !== this.lanternQualities.COMMON) {
            await this.addQualityEffects(image, lanternData.quality);
        }

        return image;
    }

    /**
     * Draw lantern base shape
     */
    async drawLanternBase(image, lanternData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = lanternData.sizeTemplate.pixelSize / 30;

        // Draw lantern base based on type
        switch (lanternData.type) {
            case this.lanternTypes.HANGING_LANTERN:
                await this.drawHangingLantern(image, centerX, centerY, scale, lanternData);
                break;
            case this.lanternTypes.PORTABLE_LANTERN:
                await this.drawPortableLantern(image, centerX, centerY, scale, lanternData);
                break;
            case this.lanternTypes.STORM_LANTERN:
                await this.drawStormLantern(image, centerX, centerY, scale, lanternData);
                break;
            case this.lanternTypes.STREET_LANTERN:
                await this.drawStreetLantern(image, centerX, centerY, scale, lanternData);
                break;
            case this.lanternTypes.MAGIC_LANTERN:
                await this.drawMagicLantern(image, centerX, centerY, scale, lanternData);
                break;
            case this.lanternTypes.PAPER_LANTERN:
                await this.drawPaperLantern(image, centerX, centerY, scale, lanternData);
                break;
            case this.lanternTypes.CRYSTAL_LANTERN:
                await this.drawCrystalLantern(image, centerX, centerY, scale, lanternData);
                break;
            case this.lanternTypes.SKELETON_LANTERN:
                await this.drawSkeletonLantern(image, centerX, centerY, scale, lanternData);
                break;
        }
    }

    /**
     * Draw hanging lantern
     */
    async drawHangingLantern(image, x, y, scale, lanternData) {
        const bodyWidth = 16 * scale;
        const bodyHeight = 20 * scale;
        const topWidth = 12 * scale;
        const bottomWidth = 14 * scale;
        const chainLength = 8 * scale;

        // Draw chains
        for (let chain = -2; chain <= 2; chain += 4) {
            const chainX = x + chain * bodyWidth * 0.3;
            for (let j = -chainLength; j < 0; j++) {
                const pixelX = Math.floor(chainX);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const r = parseInt('#2F4F4F'.slice(1, 3), 16);
                    const g = parseInt('#2F4F4F'.slice(3, 5), 16);
                    const b = parseInt('#2F4F4F'.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }

        // Draw lantern body (trapezoid shape)
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = 0; j < bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Calculate width at this height (trapezoid)
                    const progress = j / bodyHeight;
                    const currentWidth = topWidth + (bottomWidth - topWidth) * progress;
                    const halfWidth = currentWidth / 2;

                    if (Math.abs(i) <= halfWidth) {
                        // Frame color
                        const r = parseInt('#8B4513'.slice(1, 3), 16);
                        const g = parseInt('#8B4513'.slice(3, 5), 16);
                        const b = parseInt('#8B4513'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw glass panels
        await this.drawGlassPanels(image, x, y, scale, lanternData, bodyWidth, bodyHeight);
    }

    /**
     * Draw portable lantern
     */
    async drawPortableLantern(image, x, y, scale, lanternData) {
        const bodyWidth = 12 * scale;
        const bodyHeight = 16 * scale;
        const handleWidth = 14 * scale;
        const handleHeight = 3 * scale;

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

        // Draw lantern body
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = 0; j < bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bodyWidth && j >= 0 && j < bodyHeight) {
                        const r = parseInt('#2F4F4F'.slice(1, 3), 16);
                        const g = parseInt('#2F4F4F'.slice(3, 5), 16);
                        const b = parseInt('#2F4F4F'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw glass panels
        await this.drawGlassPanels(image, x, y, scale, lanternData, bodyWidth, bodyHeight);
    }

    /**
     * Draw storm lantern
     */
    async drawStormLantern(image, x, y, scale, lanternData) {
        const bodyWidth = 14 * scale;
        const bodyHeight = 18 * scale;
        const guardWidth = 16 * scale;
        const guardHeight = 4 * scale;

        // Draw protective guard/frame
        for (let i = -guardWidth; i < guardWidth; i++) {
            for (let j = -guardHeight; j < guardHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= guardWidth && Math.abs(j) <= guardHeight) {
                        const r = parseInt('#2F4F4F'.slice(1, 3), 16);
                        const g = parseInt('#2F4F4F'.slice(3, 5), 16);
                        const b = parseInt('#2F4F4F'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw lantern body
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = guardHeight; j < guardHeight + bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bodyWidth && j >= guardHeight && j < guardHeight + bodyHeight) {
                        const r = parseInt('#654321'.slice(1, 3), 16);
                        const g = parseInt('#654321'.slice(3, 5), 16);
                        const b = parseInt('#654321'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw glass panels
        await this.drawGlassPanels(image, x, y + guardHeight, scale, lanternData, bodyWidth, bodyHeight);
    }

    /**
     * Draw street lantern
     */
    async drawStreetLantern(image, x, y, scale, lanternData) {
        const poleWidth = 3 * scale;
        const poleHeight = 25 * scale;
        const lanternWidth = 12 * scale;
        const lanternHeight = 14 * scale;

        // Draw pole
        for (let i = -poleWidth; i < poleWidth; i++) {
            for (let j = 0; j < poleHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= poleWidth && j >= 0 && j < poleHeight) {
                        const r = parseInt('#2F4F4F'.slice(1, 3), 16);
                        const g = parseInt('#2F4F4F'.slice(3, 5), 16);
                        const b = parseInt('#2F4F4F'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw lantern body
        const lanternY = y - lanternHeight;
        for (let i = -lanternWidth; i < lanternWidth; i++) {
            for (let j = 0; j < lanternHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(lanternY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= lanternWidth && j >= 0 && j < lanternHeight) {
                        const r = parseInt('#654321'.slice(1, 3), 16);
                        const g = parseInt('#654321'.slice(3, 5), 16);
                        const b = parseInt('#654321'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw glass panels
        await this.drawGlassPanels(image, x, lanternY, scale, lanternData, lanternWidth, lanternHeight);
    }

    /**
     * Draw magic lantern
     */
    async drawMagicLantern(image, x, y, scale, lanternData) {
        const orbRadius = 12 * scale;

        // Draw magical orb
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

        // Draw magical runes around the orb
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
            const runeX = x + Math.cos(angle) * (orbRadius + 2);
            const runeY = y + Math.sin(angle) * (orbRadius + 2);

            // Simple rune mark
            const pixelX = Math.floor(runeX);
            const pixelY = Math.floor(runeY);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt('#FFD700'.slice(1, 3), 16);
                const g = parseInt('#FFD700'.slice(3, 5), 16);
                const b = parseInt('#FFD700'.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }
    }

    /**
     * Draw paper lantern
     */
    async drawPaperLantern(image, x, y, scale, lanternData) {
        const bodyWidth = 14 * scale;
        const bodyHeight = 18 * scale;

        // Draw paper body (more rounded)
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = 0; j < bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Rounded rectangle shape
                    const halfWidth = bodyWidth;
                    const halfHeight = bodyHeight / 2;
                    const dx = Math.abs(i) - halfWidth + 2;
                    const dy = Math.abs(j - halfHeight) - halfHeight + 2;

                    if (dx <= 0 || dy <= 0 || (dx * dx + dy * dy) <= 4) {
                        const r = parseInt('#F5DEB3'.slice(1, 3), 16);
                        const g = parseInt('#F5DEB3'.slice(3, 5), 16);
                        const b = parseInt('#F5DEB3'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw bamboo frame
        for (let i = -bodyWidth; i < bodyWidth; i += 4) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y + bodyHeight / 2);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt('#8B4513'.slice(1, 3), 16);
                const g = parseInt('#8B4513'.slice(3, 5), 16);
                const b = parseInt('#8B4513'.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }

        // Draw glass panels (translucent paper)
        await this.drawGlassPanels(image, x, y, scale, lanternData, bodyWidth, bodyHeight);
    }

    /**
     * Draw crystal lantern
     */
    async drawCrystalLantern(image, x, y, scale, lanternData) {
        const bodyWidth = 10 * scale;
        const bodyHeight = 16 * scale;

        // Draw crystal body
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = 0; j < bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bodyWidth && j >= 0 && j < bodyHeight) {
                        const r = parseInt('#E6E6FA'.slice(1, 3), 16);
                        const g = parseInt('#E6E6FA'.slice(3, 5), 16);
                        const b = parseInt('#E6E6FA'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw crystal facets
        for (let i = -bodyWidth + 2; i < bodyWidth - 2; i += 4) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y + bodyHeight / 2);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt('#B0E0E6'.slice(1, 3), 16);
                const g = parseInt('#B0E0E6'.slice(3, 5), 16);
                const b = parseInt('#B0E0E6'.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }

        // Draw glass panels
        await this.drawGlassPanels(image, x, y, scale, lanternData, bodyWidth, bodyHeight);
    }

    /**
     * Draw skeleton lantern
     */
    async drawSkeletonLantern(image, x, y, scale, lanternData) {
        const bodyWidth = 12 * scale;
        const bodyHeight = 16 * scale;

        // Draw bone frame
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = 0; j < bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= bodyWidth && j >= 0 && j < bodyHeight) {
                        // Bone-like pattern
                        if ((i + j) % 8 < 2 || (i - j) % 8 < 2) {
                            const r = parseInt('#F5F5DC'.slice(1, 3), 16);
                            const g = parseInt('#F5F5DC'.slice(3, 5), 16);
                            const b = parseInt('#F5F5DC'.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }

        // Draw glass panels
        await this.drawGlassPanels(image, x, y, scale, lanternData, bodyWidth, bodyHeight);
    }

    /**
     * Draw glass panels
     */
    async drawGlassPanels(image, x, y, scale, lanternData, bodyWidth, bodyHeight) {
        const glassTint = lanternData.glassTemplate.tint;
        const glassOpacity = lanternData.glassTemplate.opacity;

        // Draw glass panels on sides
        for (let side = -1; side <= 1; side += 2) {
            const panelX = x + side * (bodyWidth - 2);
            for (let i = -2; i < 2; i++) {
                for (let j = 2; j < bodyHeight - 2; j++) {
                    const pixelX = Math.floor(panelX + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if (Math.abs(i) <= 2 && j >= 2 && j < bodyHeight - 2) {
                            const r = Math.floor(parseInt(glassTint.slice(1, 3), 16) * glassOpacity);
                            const g = Math.floor(parseInt(glassTint.slice(3, 5), 16) * glassOpacity);
                            const b = Math.floor(parseInt(glassTint.slice(5, 7), 16) * glassOpacity);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw flame
     */
    async drawFlame(image, lanternData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = lanternData.sizeTemplate.pixelSize / 30;

        // Get flame shape based on lantern type
        const flameShape = this.getFlameShape(lanternData.type);
        const flameColors = lanternData.flameTemplate.colors;

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
     * Get flame shape for lantern type
     */
    getFlameShape(lanternType) {
        switch (lanternType) {
            case this.lanternTypes.MAGIC_LANTERN:
                return { width: 6, height: 6, pattern: 'pulsing' };
            case this.lanternTypes.PAPER_LANTERN:
                return { width: 4, height: 8, pattern: 'gentle' };
            case this.lanternTypes.STORM_LANTERN:
                return { width: 3, height: 6, pattern: 'steady' };
            default:
                return { width: 3, height: 6, pattern: 'flickering' };
        }
    }

    /**
     * Check if point is in flame shape
     */
    isInFlameShape(x, y, pattern) {
        switch (pattern) {
            case 'flickering':
                const flicker = Math.sin(x * 10) * 0.1;
                return Math.abs(x) <= (0.5 - y * 0.3 + flicker) && y >= 0 && y <= 1;
            case 'steady':
                return Math.abs(x) <= (0.3 - y * 0.2) && y >= 0 && y <= 1;
            case 'pulsing':
                const pulse = Math.sin(Date.now() * 0.01) * 0.1;
                return Math.sqrt(x * x + (y - 0.5) * (y - 0.5)) <= (0.5 + pulse);
            case 'gentle':
                return Math.abs(x) <= (0.2 - y * 0.1) && y >= 0 && y <= 1;
            default:
                return Math.abs(x) <= (0.5 - y * 0.3) && y >= 0 && y <= 1;
        }
    }

    /**
     * Add quality effects
     */
    async addQualityEffects(image, quality) {
        switch (quality) {
            case this.lanternQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.lanternQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.lanternQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.lanternQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Calculate lantern stats
     */
    calculateLanternStats(lanternTemplate, flameTemplate, sizeTemplate, qualityTemplate, materialTemplate, fuelTemplate, glassTemplate, config) {
        const stats = {
            brightness: Math.round(lanternTemplate.baseBrightness * sizeTemplate.brightnessMultiplier * qualityTemplate.brightnessMultiplier * flameTemplate.intensity * fuelTemplate.brightness),
            duration: lanternTemplate.baseDuration === -1 ? -1 : Math.round(lanternTemplate.baseDuration * sizeTemplate.durationMultiplier * qualityTemplate.durationMultiplier * fuelTemplate.burnTime / 60), // Convert to minutes
            fuelConsumption: Math.round(lanternTemplate.fuelConsumption * qualityTemplate.statMultiplier),
            lightRadius: Math.round(lanternTemplate.lightRadius * sizeTemplate.multiplier * qualityTemplate.statMultiplier),
            durability: materialTemplate.durability,
            weight: materialTemplate.weight * sizeTemplate.multiplier,
            heatResistance: materialTemplate.heatResistance,
            stability: flameTemplate.stability,
            smoke: fuelTemplate.smoke,
            weatherResistance: lanternTemplate.weatherResistance,
            transparency: materialTemplate.transparency,
            rarity: qualityTemplate.rarity
        };

        return stats;
    }

    /**
     * Generate lantern ID
     */
    generateLanternId() {
        return 'lantern_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate lantern name
     */
    generateLanternName(lanternName, flameName, sizeTemplate, qualityTemplate) {
        const sizePrefixes = {
            [this.lanternSizes.SMALL]: 'Small ',
            [this.lanternSizes.MEDIUM]: '',
            [this.lanternSizes.LARGE]: 'Large ',
            [this.lanternSizes.EXTRA_LARGE]: 'Grand '
        };

        const qualityPrefixes = {
            [this.lanternQualities.COMMON]: '',
            [this.lanternQualities.UNCOMMON]: 'Fine ',
            [this.lanternQualities.RARE]: 'Ornate ',
            [this.lanternQualities.EPIC]: 'Magnificent ',
            [this.lanternQualities.LEGENDARY]: 'Legendary ',
            [this.lanternQualities.MYTHICAL]: 'Mythical '
        };

        return `${qualityPrefixes[qualityTemplate]}${sizePrefixes[sizeTemplate]}${lanternName} with ${flameName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(lanternTemplate, flameTemplate, sizeTemplate, qualityTemplate, materialTemplate, fuelTemplate, glassTemplate) {
        const qualityDesc = {
            [this.lanternQualities.COMMON]: 'A standard lantern',
            [this.lanternQualities.UNCOMMON]: 'A well-crafted lantern',
            [this.lanternQualities.RARE]: 'An ornate lantern',
            [this.lanternQualities.EPIC]: 'A magnificent lantern',
            [this.lanternQualities.LEGENDARY]: 'A legendary lantern',
            [this.lanternQualities.MYTHICAL]: 'A mythical lantern'
        };

        const materialDesc = ` made of ${materialTemplate.name.toLowerCase()}`;
        const fuelDesc = ` fueled by ${fuelTemplate.name.toLowerCase()}`;

        return `${qualityDesc[qualityTemplate]}${materialDesc}${fuelDesc}. ${lanternTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(lanternTemplate, flameTemplate, materialTemplate, glassTemplate, quality) {
        return {
            lanternType: lanternTemplate,
            flameType: flameTemplate,
            material: materialTemplate,
            glassType: glassTemplate,
            quality: quality,
            primaryColor: flameTemplate.colors.core,
            secondaryColor: materialTemplate.name === 'Metal' ? '#C0C0C0' : '#8B4513',
            glassColor: glassTemplate.tint
        };
    }

    /**
     * Generate effects
     */
    generateEffects(lanternTemplate, flameTemplate, stats) {
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

        // Weather resistance effect
        effects.push({
            type: 'weather_resistance',
            power: stats.weatherResistance,
            duration: -1,
            instant: false
        });

        return effects;
    }

    /**
     * Generate light data
     */
    generateLightData(lanternTemplate, flameTemplate, stats) {
        return {
            brightness: stats.brightness,
            radius: stats.lightRadius,
            color: flameTemplate.colors.core,
            flicker: flameTemplate.stability < 1.0,
            magical: flameTemplate.magical,
            duration: stats.duration,
            fuelConsumption: stats.fuelConsumption,
            weatherResistance: stats.weatherResistance
        };
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addRareGlow(image) { return image; }
    async addEpicGlow(image) { return image; }
    async addLegendaryGlow(image) { return image; }
    async addMythicalGlow(image) { return image; }

    /**
     * Batch generate lanterns
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const lantern = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(lantern);
            } catch (error) {
                console.error(`Failed to generate lantern ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(l => l !== null);
    }

    /**
     * Generate lantern by specific criteria
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
        if (criteria.glassType) options.glassType = criteria.glassType;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get lantern statistics
     */
    getLanternStatistics() {
        return {
            totalTypes: Object.keys(this.lanternTypes).length,
            totalFlameTypes: Object.keys(this.flameTypes).length,
            totalSizes: Object.keys(this.lanternSizes).length,
            totalQualities: Object.keys(this.lanternQualities).length,
            totalMaterials: Object.keys(this.materialTypes).length,
            totalFuels: Object.keys(this.fuelTypes).length,
            totalGlassTypes: Object.keys(this.glassVariations).length,
            lanternTemplates: Object.keys(this.lanternTemplates).length,
            flameTemplates: Object.keys(this.flameTemplates).length
        };
    }

    /**
     * Export lantern data
     */
    async exportLanternData(lantern, outputPath) {
        const exportData = {
            ...lantern.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save lantern data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate lantern configuration
     */
    validateLanternConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.lanternTypes).includes(config.type)) {
            errors.push(`Invalid lantern type: ${config.type}`);
        }

        if (config.flameType && !Object.values(this.flameTypes).includes(config.flameType)) {
            errors.push(`Invalid flame type: ${config.flameType}`);
        }

        if (config.size && !Object.values(this.lanternSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.lanternQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.material && !Object.values(this.materialTypes).includes(config.material)) {
            errors.push(`Invalid material type: ${config.material}`);
        }

        if (config.fuel && !Object.values(this.fuelTypes).includes(config.fuel)) {
            errors.push(`Invalid fuel type: ${config.fuel}`);
        }

        if (config.glassType && !Object.keys(this.glassVariations).includes(config.glassType)) {
            errors.push(`Invalid glass type: ${config.glassType}`);
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

        const lanternTypes = Object.values(this.lanternTypes);

        for (let i = 0; i < count; i++) {
            let lanternType, flameType, material, fuel, glassType;

            switch (theme) {
                case 'dungeon':
                    lanternType = [this.lanternTypes.HANGING_LANTERN, this.lanternTypes.PORTABLE_LANTERN][Math.floor(Math.random() * 2)];
                    flameType = this.flameTypes.NORMAL;
                    material = this.materialTypes.METAL;
                    fuel = this.fuelTypes.OIL;
                    glassType = 'FROSTED';
                    break;
                case 'magical':
                    lanternType = [this.lanternTypes.MAGIC_LANTERN, this.lanternTypes.CRYSTAL_LANTERN][Math.floor(Math.random() * 2)];
                    flameType = [this.flameTypes.MAGICAL, this.flameTypes.ETERNAL][Math.floor(Math.random() * 2)];
                    material = this.materialTypes.MAGICAL;
                    fuel = this.fuelTypes.MAGICAL;
                    glassType = 'MAGICAL';
                    break;
                case 'noble':
                    lanternType = [this.lanternTypes.STREET_LANTERN, this.lanternTypes.CRYSTAL_LANTERN][Math.floor(Math.random() * 2)];
                    flameType = this.flameTypes.NORMAL;
                    material = this.materialTypes.CRYSTAL;
                    fuel = this.fuelTypes.WAX;
                    glassType = 'STAINED';
                    break;
                case 'nautical':
                    lanternType = this.lanternTypes.STORM_LANTERN;
                    flameType = this.flameTypes.NORMAL;
                    material = this.materialTypes.METAL;
                    fuel = this.fuelTypes.OIL;
                    glassType = 'CLEAR';
                    break;
                default:
                    lanternType = lanternTypes[Math.floor(Math.random() * lanternTypes.length)];
                    flameType = Object.values(this.flameTypes)[Math.floor(Math.random() * Object.values(this.flameTypes).length)];
                    material = Object.values(this.materialTypes)[Math.floor(Math.random() * Object.values(this.materialTypes).length)];
                    fuel = Object.values(this.fuelTypes)[Math.floor(Math.random() * Object.values(this.fuelTypes).length)];
                    glassType = Object.keys(this.glassVariations)[Math.floor(Math.random() * Object.keys(this.glassVariations).length)];
            }

            const lantern = await this.generate({
                type: lanternType,
                flameType: flameType,
                size: this.lanternSizes.MEDIUM,
                quality: this.lanternQualities.COMMON,
                material: material,
                fuel: fuel,
                glassType: glassType
            });

            lightingSet.push(lantern);
        }

        return lightingSet;
    }

    /**
     * Generate lantern with specific brightness
     */
    async generateLanternByBrightness(minBrightness, maxBrightness, options = {}) {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const quality = this.getRandomFromArray(Object.values(this.lanternQualities));
            const size = this.getRandomFromArray(Object.values(this.lanternSizes));
            const flameType = this.getRandomFromArray(Object.values(this.flameTypes));
            const fuel = this.getRandomFromArray(Object.values(this.fuelTypes));
            const glassType = this.getRandomFromArray(Object.keys(this.glassVariations));

            const lanternTemplate = this.lanternTemplates[options.type || this.lanternTypes.HANGING_LANTERN];
            const flameTemplate = this.flameTemplates[flameType];
            const sizeTemplate = this.sizeModifiers[size];
            const qualityTemplate = this.qualityModifiers[quality];
            const fuelTemplate = this.fuelModifiers[fuel];

            const estimatedBrightness = Math.round(lanternTemplate.baseBrightness *
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
                    glassType: glassType,
                    ...options
                });
            }

            attempts++;
        }

        // Fallback
        return await this.generate({
            size: this.lanternSizes.MEDIUM,
            quality: this.lanternQualities.COMMON,
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
     * Calculate lantern maintenance cost
     */
    calculateMaintenanceCost(lanternData) {
        const baseCost = lanternData.stats.brightness * 0.15; // 15% of brightness value per maintenance (lanterns need more care)
        const materialMultiplier = lanternData.material === this.materialTypes.MAGICAL ? 5.0 :
                                  lanternData.material === this.materialTypes.CRYSTAL ? 3.0 :
                                  lanternData.material === this.materialTypes.GLASS ? 2.0 : 1.0;

        return Math.round(baseCost * materialMultiplier);
    }

    /**
     * Calculate fuel consumption rate
     */
    calculateFuelConsumption(lanternData, timeInMinutes = 60) {
        const consumptionRate = lanternData.stats.fuelConsumption / 60; // per minute
        return Math.round(consumptionRate * timeInMinutes);
    }

    /**
     * Generate lantern performance report
     */
    generatePerformanceReport(lanternData) {
        const performance = {
            overall: 0,
            categories: {}
        };

        // Calculate performance scores
        performance.categories.brightness = Math.min(100, (lanternData.stats.brightness / 50) * 100);
        performance.categories.duration = lanternData.stats.duration === -1 ? 100 : Math.min(100, (lanternData.stats.duration / 300) * 100);
        performance.categories.radius = Math.min(100, (lanternData.stats.lightRadius / 20) * 100);
        performance.categories.weatherResistance = Math.min(100, (lanternData.stats.weatherResistance / 15) * 100);
        performance.categories.stability = Math.min(100, lanternData.stats.stability * 100);

        // Calculate overall performance
        const scores = Object.values(performance.categories);
        performance.overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        return performance;
    }

    /**
     * Generate lantern upgrade options
     */
    generateUpgradeOptions(lanternData) {
        const upgrades = [];

        // Quality upgrades
        if (lanternData.quality !== this.lanternQualities.MYTHICAL) {
            const nextQuality = this.getNextQuality(lanternData.quality);
            upgrades.push({
                type: 'quality',
                name: `Upgrade to ${nextQuality} quality`,
                cost: Math.round(lanternData.stats.brightness * 2.5),
                benefits: ['+30% brightness', '+50% duration', '+1 rarity']
            });
        }

        // Size upgrades
        if (lanternData.size !== this.lanternSizes.EXTRA_LARGE) {
            const nextSize = this.getNextSize(lanternData.size);
            upgrades.push({
                type: 'size',
                name: `Upgrade to ${nextSize} size`,
                cost: Math.round(lanternData.stats.brightness * 2),
                benefits: ['+25% brightness', '+20% light radius']
            });
        }

        // Flame upgrades
        if (lanternData.flameType !== this.flameTypes.ETERNAL) {
            upgrades.push({
                type: 'flame',
                name: 'Upgrade to eternal flame',
                cost: Math.round(lanternData.stats.brightness * 6),
                benefits: ['Infinite duration', '+50% brightness', 'No fuel consumption']
            });
        }

        // Glass upgrades
        if (lanternData.glassType !== 'MAGICAL') {
            upgrades.push({
                type: 'glass',
                name: 'Upgrade to magical glass',
                cost: Math.round(lanternData.stats.brightness * 3),
                benefits: ['+20% brightness', '+30% weather resistance']
            });
        }

        return upgrades;
    }

    /**
     * Get next quality level
     */
    getNextQuality(currentQuality) {
        const qualities = Object.values(this.lanternQualities);
        const currentIndex = qualities.indexOf(currentQuality);
        return qualities[Math.min(currentIndex + 1, qualities.length - 1)];
    }

    /**
     * Get next size level
     */
    getNextSize(currentSize) {
        const sizes = Object.values(this.lanternSizes);
        const currentIndex = sizes.indexOf(currentSize);
        return sizes[Math.min(currentIndex + 1, sizes.length - 1)];
    }

    /**
     * Generate lantern comparison
     */
    async generateLanternComparison(lanternType, qualities = ['common', 'rare', 'epic']) {
        const comparison = {};

        for (const quality of qualities) {
            const lantern = await this.generate({
                type: lanternType,
                quality: quality
            });

            comparison[quality] = {
                name: lantern.data.name,
                brightness: lantern.data.stats.brightness,
                duration: lantern.data.stats.duration,
                lightRadius: lantern.data.stats.lightRadius,
                weatherResistance: lantern.data.stats.weatherResistance,
                performance: this.generatePerformanceReport(lantern.data)
            };
        }

        return comparison;
    }

    /**
     * Generate themed lantern collection
     */
    async generateThemedLanternCollection(theme = 'dungeon', count = 8) {
        const collection = [];

        let material, fuel, flameType, glassType;

        switch (theme) {
            case 'dungeon':
                material = this.materialTypes.METAL;
                fuel = this.fuelTypes.OIL;
                flameType = this.flameTypes.NORMAL;
                glassType = 'FROSTED';
                break;
            case 'castle':
                material = this.materialTypes.METAL;
                fuel = this.fuelTypes.WAX;
                flameType = this.flameTypes.NORMAL;
                glassType = 'CLEAR';
                break;
            case 'magical':
                material = this.materialTypes.MAGICAL;
                fuel = this.fuelTypes.MAGICAL;
                flameType = this.flameTypes.MAGICAL;
                glassType = 'MAGICAL';
                break;
            case 'noble':
                material = this.materialTypes.CRYSTAL;
                fuel = this.fuelTypes.WAX;
                flameType = this.flameTypes.NORMAL;
                glassType = 'STAINED';
                break;
            case 'nautical':
                material = this.materialTypes.METAL;
                fuel = this.fuelTypes.OIL;
                flameType = this.flameTypes.NORMAL;
                glassType = 'CLEAR';
                break;
            case 'festive':
                material = this.materialTypes.PAPER;
                fuel = this.fuelTypes.WAX;
                flameType = this.flameTypes.COLORED;
                glassType = 'COLORED';
                break;
            default:
                material = this.materialTypes.METAL;
                fuel = this.fuelTypes.OIL;
                flameType = this.flameTypes.NORMAL;
                glassType = 'CLEAR';
        }

        const lanternTypes = Object.values(this.lanternTypes);

        for (let i = 0; i < count; i++) {
            const lanternType = lanternTypes[Math.floor(Math.random() * lanternTypes.length)];

            const lantern = await this.generate({
                type: lanternType,
                flameType: flameType,
                size: this.lanternSizes.MEDIUM,
                quality: this.lanternQualities.COMMON,
                material: material,
                fuel: fuel,
                glassType: glassType
            });

            collection.push(lantern);
        }

        return collection;
    }

    /**
     * Generate street lighting system
     */
    async generateStreetLightingSystem(streetLength = 100, lanternSpacing = 20) {
        const lightingSystem = {
            lanterns: [],
            totalBrightness: 0,
            coverage: 0,
            maintenanceCost: 0
        };

        const numLanterns = Math.ceil(streetLength / lanternSpacing);

        for (let i = 0; i < numLanterns; i++) {
            const lantern = await this.generate({
                type: this.lanternTypes.STREET_LANTERN,
                size: this.lanternSizes.LARGE,
                quality: this.lanternQualities.UNCOMMON,
                material: this.materialTypes.METAL,
                fuel: this.fuelTypes.OIL,
                glassType: 'CLEAR'
            });

            lightingSystem.lanterns.push({
                position: i * lanternSpacing,
                lantern: lantern
            });

            lightingSystem.totalBrightness += lantern.data.stats.brightness;
            lightingSystem.maintenanceCost += this.calculateMaintenanceCost(lantern.data);
        }

        lightingSystem.coverage = Math.min(100, (lightingSystem.lanterns.length * 20 / streetLength) * 100);

        return lightingSystem;
    }

    /**
     * Generate indoor lighting set
     */
    async generateIndoorLightingSet(roomType = 'dining', count = 4) {
        const lightingSet = [];

        let lanternType, flameType, material, fuel, glassType;

        switch (roomType) {
            case 'dining':
                lanternType = this.lanternTypes.CHANDELIER;
                flameType = this.flameTypes.NORMAL;
                material = this.materialTypes.METAL;
                fuel = this.fuelTypes.WAX;
                glassType = 'STAINED';
                break;
            case 'bedroom':
                lanternType = this.lanternTypes.CANDLESTICK;
                flameType = this.flameTypes.NORMAL;
                material = this.materialTypes.METAL;
                fuel = this.fuelTypes.WAX;
                glassType = 'CLEAR';
                break;
            case 'library':
                lanternType = this.lanternTypes.CRYSTAL_LANTERN;
                flameType = this.flameTypes.NORMAL;
                material = this.materialTypes.CRYSTAL;
                fuel = this.fuelTypes.OIL;
                glassType = 'CLEAR';
                break;
            case 'throne':
                lanternType = this.lanternTypes.MAGIC_LANTERN;
                flameType = this.flameTypes.ETERNAL;
                material = this.materialTypes.MAGICAL;
                fuel = this.fuelTypes.ETERNAL;
                glassType = 'MAGICAL';
                break;
            default:
                lanternType = this.lanternTypes.HANGING_LANTERN;
                flameType = this.flameTypes.NORMAL;
                material = this.materialTypes.METAL;
                fuel = this.fuelTypes.OIL;
                glassType = 'CLEAR';
        }

        for (let i = 0; i < count; i++) {
            const lantern = await this.generate({
                type: lanternType,
                flameType: flameType,
                size: this.lanternSizes.MEDIUM,
                quality: this.lanternQualities.UNCOMMON,
                material: material,
                fuel: fuel,
                glassType: glassType
            });

            lightingSet.push(lantern);
        }

        return lightingSet;
    }
}

module.exports = LanternGenerator;
