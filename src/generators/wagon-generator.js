/**
 * Wagon Generator - Complete wagon and cart sprite generation system
 * Generates various types of wagons with different materials, purposes, and configurations
 */

const Jimp = require('jimp');
const path = require('path');

class WagonGenerator {
    constructor() {
        this.wagonTypes = {
            MERCHANT: 'merchant',
            COVERED: 'covered',
            CART: 'cart',
            FARM: 'farm',
            MILITARY: 'military',
            ROYAL: 'royal'
        };

        this.wagonSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge'
        };

        this.wagonQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.wheelTypes = {
            WOODEN: 'wooden',
            IRON_RIMMED: 'iron_rimmed',
            STEEL: 'steel',
            MAGICAL: 'magical'
        };

        // Wagon material templates
        this.wagonMaterialTemplates = {
            [this.wagonTypes.MERCHANT]: {
                name: 'Merchant Wagon',
                description: 'A sturdy wagon for transporting goods',
                baseValue: 500,
                durability: 150,
                capacity: 100,
                weight: 200,
                speed: 8,
                color: '#8B4513',
                features: ['cargo_transport', 'merchant_goods', 'durable', 'reliable']
            },
            [this.wagonTypes.COVERED]: {
                name: 'Covered Wagon',
                description: 'A wagon with protective covering for passengers',
                baseValue: 800,
                durability: 180,
                capacity: 80,
                weight: 250,
                speed: 6,
                color: '#654321',
                features: ['passenger_transport', 'weather_protection', 'comfortable', 'family_friendly']
            },
            [this.wagonTypes.CART]: {
                name: 'Simple Cart',
                description: 'A basic cart for light cargo',
                baseValue: 150,
                durability: 80,
                capacity: 30,
                weight: 80,
                speed: 12,
                color: '#A0522D',
                features: ['light_cargo', 'simple_design', 'maneuverable', 'affordable']
            },
            [this.wagonTypes.FARM]: {
                name: 'Farm Wagon',
                description: 'A rugged wagon for agricultural use',
                baseValue: 300,
                durability: 200,
                capacity: 150,
                weight: 300,
                speed: 5,
                color: '#8B7355',
                features: ['heavy_cargo', 'farm_equipment', 'rugged', 'practical']
            },
            [this.wagonTypes.MILITARY]: {
                name: 'Military Wagon',
                description: 'A reinforced wagon for military operations',
                baseValue: 1200,
                durability: 300,
                capacity: 120,
                weight: 400,
                speed: 7,
                color: '#2F4F4F',
                features: ['military_transport', 'reinforced', 'secure', 'strategic']
            },
            [this.wagonTypes.ROYAL]: {
                name: 'Royal Carriage',
                description: 'An ornate carriage for nobility',
                baseValue: 5000,
                durability: 250,
                capacity: 6,
                weight: 350,
                speed: 9,
                color: '#FFD700',
                features: ['luxury_transport', 'noble_passengers', 'ornate', 'prestigious']
            }
        };

        // Size modifiers
        this.sizeModifiers = {
            [this.wagonSizes.SMALL]: {
                multiplier: 0.6,
                capacityMultiplier: 0.5,
                pixelSize: 48,
                features: ['small', 'compact', 'agile']
            },
            [this.wagonSizes.MEDIUM]: {
                multiplier: 1.0,
                capacityMultiplier: 1.0,
                pixelSize: 64,
                features: ['medium', 'standard', 'versatile']
            },
            [this.wagonSizes.LARGE]: {
                multiplier: 1.8,
                capacityMultiplier: 2.0,
                pixelSize: 80,
                features: ['large', 'spacious', 'powerful']
            },
            [this.wagonSizes.HUGE]: {
                multiplier: 3.0,
                capacityMultiplier: 4.0,
                pixelSize: 96,
                features: ['huge', 'massive', 'impressive']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.wagonQualities.COMMON]: {
                statMultiplier: 1.0,
                valueMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                speedMultiplier: 1.0,
                rarity: 1,
                features: ['common', 'standard', 'reliable']
            },
            [this.wagonQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                valueMultiplier: 1.5,
                durabilityMultiplier: 1.1,
                speedMultiplier: 1.05,
                rarity: 2,
                features: ['uncommon', 'well_made', 'efficient']
            },
            [this.wagonQualities.RARE]: {
                statMultiplier: 1.5,
                valueMultiplier: 2.5,
                durabilityMultiplier: 1.25,
                speedMultiplier: 1.1,
                rarity: 3,
                features: ['rare', 'exceptional', 'high_performance']
            },
            [this.wagonQualities.EPIC]: {
                statMultiplier: 2.0,
                valueMultiplier: 4.0,
                durabilityMultiplier: 1.5,
                speedMultiplier: 1.2,
                rarity: 4,
                features: ['epic', 'masterwork', 'elite']
            },
            [this.wagonQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                valueMultiplier: 8.0,
                durabilityMultiplier: 2.0,
                speedMultiplier: 1.4,
                rarity: 5,
                features: ['legendary', 'artifact', 'supreme']
            },
            [this.wagonQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                valueMultiplier: 20.0,
                durabilityMultiplier: 3.0,
                speedMultiplier: 1.8,
                rarity: 6,
                features: ['mythical', 'divine', 'ultimate']
            }
        };

        // Wheel templates
        this.wheelTemplates = {
            [this.wheelTypes.WOODEN]: {
                name: 'Wooden Wheels',
                description: 'Basic wooden wheels',
                durability: 50,
                speedBonus: 0,
                weight: 20,
                features: ['wooden', 'basic', 'repairable']
            },
            [this.wheelTypes.IRON_RIMMED]: {
                name: 'Iron-Rimmed Wheels',
                description: 'Wooden wheels with iron reinforcement',
                durability: 100,
                speedBonus: 0.1,
                weight: 30,
                features: ['iron_rimmed', 'reinforced', 'durable']
            },
            [this.wheelTypes.STEEL]: {
                name: 'Steel Wheels',
                description: 'Full steel wheels',
                durability: 200,
                speedBonus: 0.2,
                weight: 40,
                features: ['steel', 'heavy', 'industrial']
            },
            [this.wheelTypes.MAGICAL]: {
                name: 'Magical Wheels',
                description: 'Wheels enchanted with magic',
                durability: 300,
                speedBonus: 0.5,
                weight: 15,
                features: ['magical', 'enchanted', 'lightweight']
            }
        };

        // Wagon colors and effects
        this.wagonColors = {
            merchant: { base: '#8B4513', trim: '#654321', wheels: '#654321' },
            covered: { base: '#654321', trim: '#2F4F4F', wheels: '#8B4513', cover: '#F5F5DC' },
            cart: { base: '#A0522D', trim: '#8B4513', wheels: '#654321' },
            farm: { base: '#8B7355', trim: '#654321', wheels: '#2F4F4F' },
            military: { base: '#2F4F4F', trim: '#000000', wheels: '#696969' },
            royal: { base: '#FFD700', trim: '#B8860B', wheels: '#8B4513', accents: '#FF0000' }
        };
    }

    /**
     * Generate a wagon sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.wagonTypes.MERCHANT,
            size: options.size || this.wagonSizes.MEDIUM,
            quality: options.quality || this.wagonQualities.COMMON,
            wheelType: options.wheelType || this.wheelTypes.WOODEN,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates
        const materialTemplate = this.wagonMaterialTemplates[config.type];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];
        const wheelTemplate = this.wheelTemplates[config.wheelType];

        if (!materialTemplate || !sizeTemplate || !qualityTemplate || !wheelTemplate) {
            throw new Error(`Unknown wagon configuration: ${config.type}, ${config.size}, ${config.quality}, ${config.wheelType}`);
        }

        // Calculate final stats
        const finalStats = this.calculateWagonStats(materialTemplate, sizeTemplate, qualityTemplate, wheelTemplate, config);

        // Generate wagon data
        const wagonData = {
            id: this.generateWagonId(),
            name: this.generateWagonName(materialTemplate.name, sizeTemplate, qualityTemplate),
            type: config.type,
            size: config.size,
            quality: config.quality,
            wheelType: config.wheelType,
            materialTemplate: materialTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            wheelTemplate: wheelTemplate,
            stats: finalStats,
            features: [...materialTemplate.features, ...sizeTemplate.features, ...qualityTemplate.features, ...wheelTemplate.features],
            description: this.generateDescription(materialTemplate, sizeTemplate, qualityTemplate, wheelTemplate),
            appearance: this.generateAppearance(materialTemplate, config.quality),
            effects: this.generateEffects(materialTemplate, finalStats)
        };

        // Generate sprite image
        const spriteImage = await this.generateWagonSprite(wagonData, config);

        return {
            image: spriteImage,
            data: wagonData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'WagonGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate wagon sprite image
     */
    async generateWagonSprite(wagonData, config) {
        const width = config.width || 96;
        const height = config.height || 64;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw wagon based on type
        await this.drawWagonBase(image, wagonData, config);

        // Apply quality effects
        if (wagonData.quality !== this.wagonQualities.COMMON) {
            await this.addQualityEffects(image, wagonData.quality);
        }

        return image;
    }

    /**
     * Draw wagon base shape
     */
    async drawWagonBase(image, wagonData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = wagonData.sizeTemplate.pixelSize / 64;
        const colors = this.wagonColors[wagonData.type];

        // Draw wagon body
        await this.drawWagonBody(image, centerX, centerY, scale, colors, wagonData);

        // Draw wagon wheels
        await this.drawWagonWheels(image, centerX, centerY, scale, colors, wagonData);

        // Draw wagon details
        await this.drawWagonDetails(image, centerX, centerY, scale, colors, wagonData);
    }

    /**
     * Draw wagon body
     */
    async drawWagonBody(image, x, y, scale, colors, wagonData) {
        const bodyWidth = 32 * scale;
        const bodyHeight = 16 * scale;

        // Main body
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = -bodyHeight; j < bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - bodyHeight / 2);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Wagon body shape
                    if (Math.abs(i) <= bodyWidth && Math.abs(j) <= bodyHeight) {
                        const distance = Math.sqrt(i * i + j * j) / Math.sqrt(bodyWidth * bodyWidth + bodyHeight * bodyHeight);
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

        // Add cover for covered wagons
        if (wagonData.type === this.wagonTypes.COVERED) {
            await this.drawWagonCover(image, x, y, scale, colors, wagonData);
        }

        // Add ornate details for royal wagons
        if (wagonData.type === this.wagonTypes.ROYAL) {
            await this.drawRoyalDetails(image, x, y, scale, colors, wagonData);
        }
    }

    /**
     * Draw wagon cover
     */
    async drawWagonCover(image, x, y, scale, colors, wagonData) {
        const coverWidth = 30 * scale;
        const coverHeight = 12 * scale;

        for (let i = -coverWidth; i < coverWidth; i++) {
            for (let j = -coverHeight; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - coverHeight / 2);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= coverWidth && j >= -coverHeight) {
                        const r = parseInt(colors.cover.slice(1, 3), 16);
                        const g = parseInt(colors.cover.slice(3, 5), 16);
                        const b = parseInt(colors.cover.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw royal details
     */
    async drawRoyalDetails(image, x, y, scale, colors, wagonData) {
        // Add gold trim and royal symbols
        const trimColor = { r: 255, g: 215, b: 0 };
        const accentColor = { r: 255, g: 0, b: 0 };

        // Corner decorations
        const corners = [
            { x: x - 24 * scale, y: y - 8 * scale },
            { x: x + 24 * scale, y: y - 8 * scale }
        ];

        for (const corner of corners) {
            for (let i = -3; i <= 3; i++) {
                for (let j = -3; j <= 3; j++) {
                    const pixelX = Math.floor(corner.x + i);
                    const pixelY = Math.floor(corner.y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if (Math.abs(i) + Math.abs(j) <= 3) {
                            const color = (trimColor.r << 16) | (trimColor.g << 8) | trimColor.b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }

        // Royal crest in center
        for (let i = -4; i <= 4; i++) {
            for (let j = -3; j <= 1; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - 6 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 2 && j >= -2) {
                        const color = (accentColor.r << 16) | (accentColor.g << 8) | accentColor.b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw wagon wheels
     */
    async drawWagonWheels(image, x, y, scale, colors, wagonData) {
        const wheelRadius = 6 * scale;
        const wheelOffset = 16 * scale;

        // Left wheel
        await this.drawWheel(image, x - wheelOffset, y + 4 * scale, wheelRadius, colors, wagonData);

        // Right wheel
        await this.drawWheel(image, x + wheelOffset, y + 4 * scale, wheelRadius, colors, wagonData);

        // Add rear wheels for larger wagons
        if (wagonData.size === this.wagonSizes.LARGE || wagonData.size === this.wagonSizes.HUGE) {
            await this.drawWheel(image, x - wheelOffset, y + 12 * scale, wheelRadius, colors, wagonData);
            await this.drawWheel(image, x + wheelOffset, y + 12 * scale, wheelRadius, colors, wagonData);
        }
    }

    /**
     * Draw single wheel
     */
    async drawWheel(image, x, y, radius, colors, wagonData) {
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        // Wheel rim
                        const distance = Math.sqrt(i * i + j * j);
                        if (distance >= radius - 1 && distance <= radius) {
                            const rimColor = wagonData.wheelType === this.wheelTypes.STEEL ? '#696969' :
                                           wagonData.wheelType === this.wheelTypes.MAGICAL ? '#9370DB' :
                                           '#654321';
                            const r = parseInt(rimColor.slice(1, 3), 16);
                            const g = parseInt(rimColor.slice(3, 5), 16);
                            const b = parseInt(rimColor.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        } else if (distance < radius - 1) {
                            // Wheel hub
                            const r = parseInt(colors.wheels.slice(1, 3), 16);
                            const g = parseInt(colors.wheels.slice(3, 5), 16);
                            const b = parseInt(colors.wheels.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }

        // Wheel spokes
        for (let spoke = 0; spoke < 6; spoke++) {
            const angle = (spoke / 6) * Math.PI * 2;
            for (let dist = 0; dist < radius - 1; dist += 0.5) {
                const spokeX = Math.cos(angle) * dist;
                const spokeY = Math.sin(angle) * dist;
                const pixelX = Math.floor(x + spokeX);
                const pixelY = Math.floor(y + spokeY);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const r = parseInt(colors.wheels.slice(1, 3), 16);
                    const g = parseInt(colors.wheels.slice(3, 5), 16);
                    const b = parseInt(colors.wheels.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw wagon details
     */
    async drawWagonDetails(image, x, y, scale, colors, wagonData) {
        // Add axle
        const axleColor = '#2F4F4F';
        for (let i = -20 * scale; i < 20 * scale; i++) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y + 6 * scale);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt(axleColor.slice(1, 3), 16);
                const g = parseInt(axleColor.slice(3, 5), 16);
                const b = parseInt(axleColor.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }

        // Add trim/details based on wagon type
        if (wagonData.type === this.wagonTypes.MILITARY) {
            await this.addMilitaryDetails(image, x, y, scale, colors);
        } else if (wagonData.type === this.wagonTypes.FARM) {
            await this.addFarmDetails(image, x, y, scale, colors);
        }
    }

    /**
     * Add military details
     */
    async addMilitaryDetails(image, x, y, scale, colors) {
        // Add reinforced plating
        const plateColor = '#696969';
        for (let i = -25 * scale; i < 25 * scale; i += 2) {
            for (let j = -10 * scale; j < -6 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 20 * scale) {
                        const r = parseInt(plateColor.slice(1, 3), 16);
                        const g = parseInt(plateColor.slice(3, 5), 16);
                        const b = parseInt(plateColor.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Add farm details
     */
    async addFarmDetails(image, x, y, scale, colors) {
        // Add tool storage areas
        const toolColor = '#8B7355';
        for (let i = -15 * scale; i < -10 * scale; i++) {
            for (let j = -8 * scale; j < -4 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const r = parseInt(toolColor.slice(1, 3), 16);
                    const g = parseInt(toolColor.slice(3, 5), 16);
                    const b = parseInt(toolColor.slice(5, 7), 16);
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
            case this.wagonQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.wagonQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.wagonQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.wagonQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Calculate wagon stats
     */
    calculateWagonStats(materialTemplate, sizeTemplate, qualityTemplate, wheelTemplate, config) {
        const stats = {
            value: Math.round(materialTemplate.baseValue * sizeTemplate.multiplier * qualityTemplate.valueMultiplier),
            durability: Math.round(materialTemplate.durability * qualityTemplate.durabilityMultiplier),
            capacity: Math.round(materialTemplate.capacity * sizeTemplate.capacityMultiplier),
            weight: Math.round(materialTemplate.weight * sizeTemplate.multiplier + wheelTemplate.weight * (config.size === this.wagonSizes.LARGE || config.size === this.wagonSizes.HUGE ? 4 : 2)),
            speed: Math.round(materialTemplate.speed * qualityTemplate.speedMultiplier * (1 + wheelTemplate.speedBonus)),
            wheelDurability: wheelTemplate.durability,
            rarity: Math.max(materialTemplate.rarity || 1, qualityTemplate.rarity)
        };

        return stats;
    }

    /**
     * Generate wagon ID
     */
    generateWagonId() {
        return 'wagon_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate wagon name
     */
    generateWagonName(materialName, sizeTemplate, qualityTemplate) {
        const sizePrefixes = {
            [this.wagonSizes.SMALL]: 'Small ',
            [this.wagonSizes.MEDIUM]: '',
            [this.wagonSizes.LARGE]: 'Large ',
            [this.wagonSizes.HUGE]: 'Huge '
        };

        const qualityPrefixes = {
            [this.wagonQualities.COMMON]: '',
            [this.wagonQualities.UNCOMMON]: 'Fine ',
            [this.wagonQualities.RARE]: 'Rare ',
            [this.wagonQualities.EPIC]: 'Epic ',
            [this.wagonQualities.LEGENDARY]: 'Legendary ',
            [this.wagonQualities.MYTHICAL]: 'Mythical '
        };

        return `${qualityPrefixes[qualityTemplate]}${sizePrefixes[sizeTemplate]}${materialName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(materialTemplate, sizeTemplate, qualityTemplate, wheelTemplate) {
        const qualityDesc = {
            [this.wagonQualities.COMMON]: 'A standard wagon',
            [this.wagonQualities.UNCOMMON]: 'A well-crafted wagon',
            [this.wagonQualities.RARE]: 'A finely made wagon',
            [this.wagonQualities.EPIC]: 'A masterfully crafted wagon',
            [this.wagonQualities.LEGENDARY]: 'A legendary wagon of great quality',
            [this.wagonQualities.MYTHICAL]: 'A mythical wagon of unimaginable craftsmanship'
        };

        return `${qualityDesc[qualityTemplate]} with ${wheelTemplate.name.toLowerCase()}. ${materialTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(materialTemplate, quality) {
        const colors = this.wagonColors[materialTemplate.color.toLowerCase().replace('#', '')] || this.wagonColors.merchant;

        return {
            baseColor: colors.base,
            trimColor: colors.trim,
            wheelColor: colors.wheels,
            coverColor: colors.cover,
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
            type: 'wagon_value',
            power: stats.value,
            duration: -1, // Permanent
            instant: false
        });

        // Capacity effect
        effects.push({
            type: 'cargo_capacity',
            power: stats.capacity,
            duration: -1,
            instant: false
        });

        // Speed effect
        effects.push({
            type: 'movement_speed',
            power: stats.speed,
            duration: -1,
            instant: false
        });

        // Durability effect
        effects.push({
            type: 'durability',
            power: stats.durability,
            duration: -1,
            instant: false
        });

        // Material-specific effects
        if (materialTemplate.features.includes('reinforced')) {
            effects.push({
                type: 'damage_resistance',
                power: 1.5,
                duration: -1,
                instant: false
            });
        }

        if (materialTemplate.features.includes('luxury_transport')) {
            effects.push({
                type: 'comfort_bonus',
                power: 2.0,
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

    /**
     * Batch generate wagons
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const wagon = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(wagon);
            } catch (error) {
                console.error(`Failed to generate wagon ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(w => w !== null);
    }

    /**
     * Generate wagon by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.size) options.size = criteria.size;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.wheelType) options.wheelType = criteria.wheelType;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get wagon statistics
     */
    getWagonStatistics() {
        return {
            totalTypes: Object.keys(this.wagonTypes).length,
            totalSizes: Object.keys(this.wagonSizes).length,
            totalQualities: Object.keys(this.wagonQualities).length,
            totalWheelTypes: Object.keys(this.wheelTypes).length,
            materialTemplates: Object.keys(this.wagonMaterialTemplates).length,
            wheelTemplates: Object.keys(this.wheelTemplates).length
        };
    }

    /**
     * Export wagon data
     */
    async exportWagonData(wagon, outputPath) {
        const exportData = {
            ...wagon.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save wagon data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate wagon configuration
     */
    validateWagonConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.wagonTypes).includes(config.type)) {
            errors.push(`Invalid wagon type: ${config.type}`);
        }

        if (config.size && !Object.values(this.wagonSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.wagonQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.wheelType && !Object.values(this.wheelTypes).includes(config.wheelType)) {
            errors.push(`Invalid wheel type: ${config.wheelType}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate wagon collection
     */
    async generateWagonCollection(count = 5, theme = 'mixed') {
        const collection = [];

        for (let i = 0; i < count; i++) {
            let options = {};

            switch (theme) {
                case 'merchant':
                    options.type = this.wagonTypes.MERCHANT;
                    break;
                case 'military':
                    options.type = this.wagonTypes.MILITARY;
                    break;
                case 'luxury':
                    options.type = this.wagonTypes.ROYAL;
                    break;
                case 'farm':
                    options.type = this.wagonTypes.FARM;
                    break;
                default:
                    // Mixed - all types
                    break;
            }

            const wagon = await this.generate(options);
            collection.push(wagon);
        }

        return collection;
    }

    /**
     * Calculate wagon maintenance cost
     */
    calculateMaintenanceCost(wagonData) {
        const baseCost = wagonData.stats.value * 0.01; // 1% of wagon value per maintenance
        const wheelMultiplier = wagonData.wheelType === this.wheelTypes.MAGICAL ? 0.5 :
                               wagonData.wheelType === this.wheelTypes.STEEL ? 1.5 : 1.0;
        const qualityMultiplier = wagonData.quality === this.wagonQualities.MYTHICAL ? 2.0 :
                                 wagonData.quality === this.wagonQualities.LEGENDARY ? 1.5 : 1.0;

        return Math.round(baseCost * wheelMultiplier * qualityMultiplier);
    }

    /**
     * Calculate wagon repair cost
     */
    calculateRepairCost(wagonData, damagePercentage = 50) {
        return Math.round((wagonData.stats.value * damagePercentage / 100) * 0.3); // 30% of damaged value
    }

    /**
     * Get wagon capacity info
     */
    getWagonCapacityInfo(wagonData) {
        return {
            maxCapacity: wagonData.stats.capacity,
            currentLoad: 0, // Would be tracked separately
            availableCapacity: wagonData.stats.capacity,
            weightCapacity: Math.round(wagonData.stats.capacity * 2.5) // Rough weight estimate
        };
    }

    /**
     * Calculate wagon travel time
     */
    calculateTravelTime(wagonData, distance, terrain = 'road') {
        const baseSpeed = wagonData.stats.speed;
        const terrainMultiplier = terrain === 'road' ? 1.0 :
                                 terrain === 'dirt' ? 0.8 :
                                 terrain === 'rough' ? 0.6 :
                                 terrain === 'mountain' ? 0.4 : 0.7;

        const loadMultiplier = 1.0; // Would be based on current load
        const effectiveSpeed = baseSpeed * terrainMultiplier * loadMultiplier;

        return Math.round(distance / effectiveSpeed);
    }

    /**
     * Generate wagon upgrade options
     */
    generateUpgradeOptions(wagonData) {
        const upgrades = [];

        // Wheel upgrades
        if (wagonData.wheelType === this.wheelTypes.WOODEN) {
            upgrades.push({
                type: 'wheels',
                name: 'Upgrade to Iron-Rimmed Wheels',
                cost: Math.round(wagonData.stats.value * 0.2),
                benefits: ['+50 durability', '+10% speed']
            });
        }

        if (wagonData.wheelType === this.wheelTypes.IRON_RIMMED) {
            upgrades.push({
                type: 'wheels',
                name: 'Upgrade to Steel Wheels',
                cost: Math.round(wagonData.stats.value * 0.3),
                benefits: ['+100 durability', '+20% speed']
            });
        }

        // Quality upgrades
        if (wagonData.quality !== this.wagonQualities.MYTHICAL) {
            const nextQuality = this.getNextQuality(wagonData.quality);
            upgrades.push({
                type: 'quality',
                name: `Upgrade to ${nextQuality} quality`,
                cost: Math.round(wagonData.stats.value * 0.5),
                benefits: ['+25% stats', '+50% value']
            });
        }

        // Size upgrades
        if (wagonData.size !== this.wagonSizes.HUGE) {
            const nextSize = this.getNextSize(wagonData.size);
            upgrades.push({
                type: 'size',
                name: `Upgrade to ${nextSize} size`,
                cost: Math.round(wagonData.stats.value * 0.8),
                benefits: ['+100% capacity', '+50% weight']
            });
        }

        return upgrades;
    }

    /**
     * Get next quality level
     */
    getNextQuality(currentQuality) {
        const qualities = Object.values(this.wagonQualities);
        const currentIndex = qualities.indexOf(currentQuality);
        return qualities[Math.min(currentIndex + 1, qualities.length - 1)];
    }

    /**
     * Get next size level
     */
    getNextSize(currentSize) {
        const sizes = Object.values(this.wagonSizes);
        const currentIndex = sizes.indexOf(currentSize);
        return sizes[Math.min(currentIndex + 1, sizes.length - 1)];
    }

    /**
     * Calculate wagon depreciation
     */
    calculateDepreciation(wagonData, ageInYears = 1) {
        const depreciationRate = 0.05; // 5% per year
        const qualityMultiplier = wagonData.quality === this.wagonQualities.MYTHICAL ? 0.5 :
                                 wagonData.quality === this.wagonQualities.LEGENDARY ? 0.7 : 1.0;

        const depreciation = wagonData.stats.value * depreciationRate * ageInYears * qualityMultiplier;
        return Math.round(Math.max(0, wagonData.stats.value - depreciation));
    }
}

module.exports = WagonGenerator;
