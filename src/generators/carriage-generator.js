/**
 * Carriage Generator - Complete carriage and coach sprite generation system
 * Generates various types of carriages with different purposes, luxury levels, and features
 */

const Jimp = require('jimp');
const path = require('path');

class CarriageGenerator {
    constructor() {
        this.carriageTypes = {
            ROYAL: 'royal',
            STAGE: 'stage',
            FUNERAL: 'funeral',
            PRIVATE: 'private',
            MILITARY: 'military',
            COMMERCIAL: 'commercial'
        };

        this.carriageSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            LUXURY: 'luxury'
        };

        this.carriageQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.comfortLevels = {
            BASIC: 'basic',
            STANDARD: 'standard',
            LUXURY: 'luxury',
            ROYAL: 'royal'
        };

        // Carriage material templates
        this.carriageMaterialTemplates = {
            [this.carriageTypes.ROYAL]: {
                name: 'Royal Carriage',
                description: 'An ornate carriage fit for nobility',
                baseValue: 10000,
                durability: 400,
                capacity: 4,
                weight: 800,
                speed: 12,
                comfort: this.comfortLevels.ROYAL,
                color: '#FFD700',
                features: ['luxury_transport', 'noble_passengers', 'ornate_design', 'ceremonial']
            },
            [this.carriageTypes.STAGE]: {
                name: 'Stagecoach',
                description: 'A sturdy coach for passenger service',
                baseValue: 2500,
                durability: 350,
                capacity: 8,
                weight: 600,
                speed: 10,
                comfort: this.comfortLevels.STANDARD,
                color: '#8B4513',
                features: ['passenger_service', 'public_transport', 'reliable', 'scheduled']
            },
            [this.carriageTypes.FUNERAL]: {
                name: 'Funeral Carriage',
                description: 'A solemn carriage for ceremonial purposes',
                baseValue: 3000,
                durability: 300,
                capacity: 2,
                weight: 700,
                speed: 6,
                comfort: this.comfortLevels.BASIC,
                color: '#2F4F4F',
                features: ['ceremonial_transport', 'solemn_design', 'traditional', 'respectful']
            },
            [this.carriageTypes.PRIVATE]: {
                name: 'Private Carriage',
                description: 'An elegant private carriage',
                baseValue: 5000,
                durability: 320,
                capacity: 6,
                weight: 500,
                speed: 14,
                comfort: this.comfortLevels.LUXURY,
                color: '#DAA520',
                features: ['private_transport', 'elegant_design', 'personal', 'comfortable']
            },
            [this.carriageTypes.MILITARY]: {
                name: 'Military Carriage',
                description: 'A reinforced military transport carriage',
                baseValue: 4000,
                durability: 500,
                capacity: 6,
                weight: 900,
                speed: 8,
                comfort: this.comfortLevels.BASIC,
                color: '#696969',
                features: ['military_transport', 'reinforced', 'secure', 'tactical']
            },
            [this.carriageTypes.COMMERCIAL]: {
                name: 'Commercial Carriage',
                description: 'A practical carriage for business use',
                baseValue: 1800,
                durability: 280,
                capacity: 10,
                weight: 550,
                speed: 11,
                comfort: this.comfortLevels.STANDARD,
                color: '#A0522D',
                features: ['business_transport', 'practical', 'efficient', 'versatile']
            }
        };

        // Size modifiers
        this.sizeModifiers = {
            [this.carriageSizes.SMALL]: {
                multiplier: 0.7,
                capacityMultiplier: 0.6,
                pixelSize: 56,
                features: ['small', 'compact', 'maneuverable']
            },
            [this.carriageSizes.MEDIUM]: {
                multiplier: 1.0,
                capacityMultiplier: 1.0,
                pixelSize: 72,
                features: ['medium', 'standard', 'balanced']
            },
            [this.carriageSizes.LARGE]: {
                multiplier: 1.5,
                capacityMultiplier: 1.4,
                pixelSize: 88,
                features: ['large', 'spacious', 'impressive']
            },
            [this.carriageSizes.LUXURY]: {
                multiplier: 2.5,
                capacityMultiplier: 1.2,
                pixelSize: 104,
                features: ['luxury', 'grand', 'prestigious']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.carriageQualities.COMMON]: {
                statMultiplier: 1.0,
                valueMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                speedMultiplier: 1.0,
                rarity: 1,
                features: ['common', 'standard', 'serviceable']
            },
            [this.carriageQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                valueMultiplier: 1.5,
                durabilityMultiplier: 1.1,
                speedMultiplier: 1.05,
                rarity: 2,
                features: ['uncommon', 'well_made', 'refined']
            },
            [this.carriageQualities.RARE]: {
                statMultiplier: 1.5,
                valueMultiplier: 2.5,
                durabilityMultiplier: 1.25,
                speedMultiplier: 1.1,
                rarity: 3,
                features: ['rare', 'exceptional', 'elite']
            },
            [this.carriageQualities.EPIC]: {
                statMultiplier: 2.0,
                valueMultiplier: 4.0,
                durabilityMultiplier: 1.5,
                speedMultiplier: 1.2,
                rarity: 4,
                features: ['epic', 'masterwork', 'superior']
            },
            [this.carriageQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                valueMultiplier: 8.0,
                durabilityMultiplier: 2.0,
                speedMultiplier: 1.4,
                rarity: 5,
                features: ['legendary', 'artifact', 'legendary']
            },
            [this.carriageQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                valueMultiplier: 20.0,
                durabilityMultiplier: 3.0,
                speedMultiplier: 1.8,
                rarity: 6,
                features: ['mythical', 'divine', 'ultimate']
            }
        };

        // Comfort level modifiers
        this.comfortModifiers = {
            [this.comfortLevels.BASIC]: {
                comfortBonus: 0,
                speedPenalty: 0,
                weightPenalty: 0,
                features: ['basic_comfort', 'functional', 'no_frills']
            },
            [this.comfortLevels.STANDARD]: {
                comfortBonus: 1,
                speedPenalty: 0.05,
                weightPenalty: 50,
                features: ['standard_comfort', 'adequate', 'practical']
            },
            [this.comfortLevels.LUXURY]: {
                comfortBonus: 2,
                speedPenalty: 0.1,
                weightPenalty: 100,
                features: ['luxury_comfort', 'plush', 'elegant']
            },
            [this.comfortLevels.ROYAL]: {
                comfortBonus: 3,
                speedPenalty: 0.15,
                weightPenalty: 150,
                features: ['royal_comfort', 'opulent', 'prestigious']
            }
        };

        // Carriage colors and effects
        this.carriageColors = {
            royal: { base: '#FFD700', trim: '#B8860B', accents: '#FF0000', interior: '#F5DEB3' },
            stage: { base: '#8B4513', trim: '#654321', accents: '#DAA520', interior: '#F5F5DC' },
            funeral: { base: '#2F4F4F', trim: '#000000', accents: '#696969', interior: '#000000' },
            private: { base: '#DAA520', trim: '#B8860B', accents: '#8B4513', interior: '#FFF8DC' },
            military: { base: '#696969', trim: '#2F4F4F', accents: '#FFD700', interior: '#F5F5F5' },
            commercial: { base: '#A0522D', trim: '#8B4513', accents: '#654321', interior: '#FAF0E6' }
        };
    }

    /**
     * Generate a carriage sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.carriageTypes.ROYAL,
            size: options.size || this.carriageSizes.MEDIUM,
            quality: options.quality || this.carriageQualities.COMMON,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates
        const materialTemplate = this.carriageMaterialTemplates[config.type];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];
        const comfortTemplate = this.comfortModifiers[materialTemplate.comfort];

        if (!materialTemplate || !sizeTemplate || !qualityTemplate || !comfortTemplate) {
            throw new Error(`Unknown carriage configuration: ${config.type}, ${config.size}, ${config.quality}`);
        }

        // Calculate final stats
        const finalStats = this.calculateCarriageStats(materialTemplate, sizeTemplate, qualityTemplate, comfortTemplate, config);

        // Generate carriage data
        const carriageData = {
            id: this.generateCarriageId(),
            name: this.generateCarriageName(materialTemplate.name, sizeTemplate, qualityTemplate),
            type: config.type,
            size: config.size,
            quality: config.quality,
            comfort: materialTemplate.comfort,
            materialTemplate: materialTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            comfortTemplate: comfortTemplate,
            stats: finalStats,
            features: [...materialTemplate.features, ...sizeTemplate.features, ...qualityTemplate.features, ...comfortTemplate.features],
            description: this.generateDescription(materialTemplate, sizeTemplate, qualityTemplate, comfortTemplate),
            appearance: this.generateAppearance(materialTemplate, config.quality),
            effects: this.generateEffects(materialTemplate, finalStats)
        };

        // Generate sprite image
        const spriteImage = await this.generateCarriageSprite(carriageData, config);

        return {
            image: spriteImage,
            data: carriageData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'CarriageGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate carriage sprite image
     */
    async generateCarriageSprite(carriageData, config) {
        const width = config.width || 112;
        const height = config.height || 80;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw carriage based on type
        await this.drawCarriageBase(image, carriageData, config);

        // Apply quality effects
        if (carriageData.quality !== this.carriageQualities.COMMON) {
            await this.addQualityEffects(image, carriageData.quality);
        }

        return image;
    }

    /**
     * Draw carriage base shape
     */
    async drawCarriageBase(image, carriageData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = carriageData.sizeTemplate.pixelSize / 72;
        const colors = this.carriageColors[carriageData.type];

        // Draw carriage body
        await this.drawCarriageBody(image, centerX, centerY, scale, colors, carriageData);

        // Draw carriage wheels
        await this.drawCarriageWheels(image, centerX, centerY, scale, colors, carriageData);

        // Draw carriage details
        await this.drawCarriageDetails(image, centerX, centerY, scale, colors, carriageData);
    }

    /**
     * Draw carriage body
     */
    async drawCarriageBody(image, x, y, scale, colors, carriageData) {
        const bodyWidth = 40 * scale;
        const bodyHeight = 24 * scale;

        // Main body - more rectangular than wagons
        for (let i = -bodyWidth; i < bodyWidth; i++) {
            for (let j = -bodyHeight; j < bodyHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - bodyHeight / 2);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Carriage body shape - more formal than wagon
                    if (Math.abs(i) <= bodyWidth && Math.abs(j) <= bodyHeight) {
                        const distance = Math.sqrt(i * i + j * j) / Math.sqrt(bodyWidth * bodyWidth + bodyHeight * bodyHeight);
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

        // Add windows for passenger carriages
        if (carriageData.type !== this.carriageTypes.FUNERAL && carriageData.type !== this.carriageTypes.MILITARY) {
            await this.drawCarriageWindows(image, x, y, scale, colors, carriageData);
        }

        // Add ornate details for royal carriages
        if (carriageData.type === this.carriageTypes.ROYAL) {
            await this.drawRoyalDetails(image, x, y, scale, colors, carriageData);
        }
    }

    /**
     * Draw carriage windows
     */
    async drawCarriageWindows(image, x, y, scale, colors, carriageData) {
        const windowWidth = 8 * scale;
        const windowHeight = 6 * scale;

        // Left window
        for (let i = -windowWidth; i < 0; i++) {
            for (let j = -windowHeight; j < windowHeight; j++) {
                const pixelX = Math.floor(x + i - 12 * scale);
                const pixelY = Math.floor(y + j - 4 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= windowWidth && Math.abs(j) <= windowHeight) {
                        // Window glass
                        const r = Math.floor(parseInt(colors.interior.slice(1, 3), 16) * 0.8);
                        const g = Math.floor(parseInt(colors.interior.slice(3, 5), 16) * 0.8);
                        const b = Math.floor(parseInt(colors.interior.slice(5, 7), 16) * 0.8);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Right window
        for (let i = 0; i < windowWidth; i++) {
            for (let j = -windowHeight; j < windowHeight; j++) {
                const pixelX = Math.floor(x + i + 12 * scale);
                const pixelY = Math.floor(y + j - 4 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= windowWidth && Math.abs(j) <= windowHeight) {
                        // Window glass
                        const r = Math.floor(parseInt(colors.interior.slice(1, 3), 16) * 0.8);
                        const g = Math.floor(parseInt(colors.interior.slice(3, 5), 16) * 0.8);
                        const b = Math.floor(parseInt(colors.interior.slice(5, 7), 16) * 0.8);
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
    async drawRoyalDetails(image, x, y, scale, colors, carriageData) {
        // Add gold trim and royal symbols
        const trimColor = { r: 255, g: 215, b: 0 };
        const accentColor = { r: 255, g: 0, b: 0 };

        // Corner decorations
        const corners = [
            { x: x - 32 * scale, y: y - 12 * scale },
            { x: x + 32 * scale, y: y - 12 * scale }
        ];

        for (const corner of corners) {
            for (let i = -4; i <= 4; i++) {
                for (let j = -4; j <= 4; j++) {
                    const pixelX = Math.floor(corner.x + i);
                    const pixelY = Math.floor(corner.y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if (Math.abs(i) + Math.abs(j) <= 4) {
                            const color = (trimColor.r << 16) | (trimColor.g << 8) | trimColor.b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }

        // Royal crest in center
        for (let i = -6; i <= 6; i++) {
            for (let j = -4; j <= 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - 8 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 4 && j >= -3) {
                        const color = (accentColor.r << 16) | (accentColor.g << 8) | accentColor.b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw carriage wheels
     */
    async drawCarriageWheels(image, x, y, scale, colors, carriageData) {
        const wheelRadius = 8 * scale;
        const wheelOffset = 20 * scale;

        // Left front wheel
        await this.drawWheel(image, x - wheelOffset, y + 6 * scale, wheelRadius, colors);

        // Right front wheel
        await this.drawWheel(image, x + wheelOffset, y + 6 * scale, wheelRadius, colors);

        // Left rear wheel
        await this.drawWheel(image, x - wheelOffset, y + 16 * scale, wheelRadius, colors);

        // Right rear wheel
        await this.drawWheel(image, x + wheelOffset, y + 16 * scale, wheelRadius, colors);
    }

    /**
     * Draw single wheel
     */
    async drawWheel(image, x, y, radius, colors) {
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        // Wheel rim
                        const distance = Math.sqrt(i * i + j * j);
                        if (distance >= radius - 1 && distance <= radius) {
                            const rimColor = '#654321';
                            const r = parseInt(rimColor.slice(1, 3), 16);
                            const g = parseInt(rimColor.slice(3, 5), 16);
                            const b = parseInt(rimColor.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        } else if (distance < radius - 1) {
                            // Wheel hub
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

        // Wheel spokes
        for (let spoke = 0; spoke < 8; spoke++) {
            const angle = (spoke / 8) * Math.PI * 2;
            for (let dist = 0; dist < radius - 1; dist += 0.5) {
                const spokeX = Math.cos(angle) * dist;
                const spokeY = Math.sin(angle) * dist;
                const pixelX = Math.floor(x + spokeX);
                const pixelY = Math.floor(y + spokeY);
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
     * Draw carriage details
     */
    async drawCarriageDetails(image, x, y, scale, colors, carriageData) {
        // Add axle
        const axleColor = '#2F4F4F';
        for (let i = -24 * scale; i < 24 * scale; i++) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y + 10 * scale);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt(axleColor.slice(1, 3), 16);
                const g = parseInt(axleColor.slice(3, 5), 16);
                const b = parseInt(axleColor.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }

        // Add door for passenger carriages
        if (carriageData.type !== this.carriageTypes.FUNERAL) {
            await this.drawCarriageDoor(image, x, y, scale, colors, carriageData);
        }

        // Add specific details based on carriage type
        if (carriageData.type === this.carriageTypes.MILITARY) {
            await this.addMilitaryDetails(image, x, y, scale, colors);
        } else if (carriageData.type === this.carriageTypes.FUNERAL) {
            await this.addFuneralDetails(image, x, y, scale, colors);
        }
    }

    /**
     * Draw carriage door
     */
    async drawCarriageDoor(image, x, y, scale, colors, carriageData) {
        const doorWidth = 6 * scale;
        const doorHeight = 12 * scale;

        for (let i = -doorWidth; i < doorWidth; i++) {
            for (let j = -doorHeight; j < doorHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - 2 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= doorWidth && Math.abs(j) <= doorHeight) {
                        const r = Math.floor(parseInt(colors.base.slice(1, 3), 16) * 0.9);
                        const g = Math.floor(parseInt(colors.base.slice(3, 5), 16) * 0.9);
                        const b = Math.floor(parseInt(colors.base.slice(5, 7), 16) * 0.9);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Door handle
        const handleX = x;
        const handleY = y - 2 * scale;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const pixelX = Math.floor(handleX + i);
                const pixelY = Math.floor(handleY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) + Math.abs(j) <= 1) {
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
     * Add military details
     */
    async addMilitaryDetails(image, x, y, scale, colors) {
        // Add reinforced plating
        const plateColor = '#696969';
        for (let i = -30 * scale; i < 30 * scale; i += 3) {
            for (let j = -14 * scale; j < -10 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 25 * scale) {
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
     * Add funeral details
     */
    async addFuneralDetails(image, x, y, scale, colors) {
        // Add solemn decorations
        const decorationColor = '#000000';
        for (let i = -20 * scale; i < 20 * scale; i += 4) {
            for (let j = -16 * scale; j < -12 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 16 * scale) {
                        const r = parseInt(decorationColor.slice(1, 3), 16);
                        const g = parseInt(decorationColor.slice(3, 5), 16);
                        const b = parseInt(decorationColor.slice(5, 7), 16);
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
            case this.carriageQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.carriageQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.carriageQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.carriageQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Calculate carriage stats
     */
    calculateCarriageStats(materialTemplate, sizeTemplate, qualityTemplate, comfortTemplate, config) {
        const stats = {
            value: Math.round(materialTemplate.baseValue * sizeTemplate.multiplier * qualityTemplate.valueMultiplier),
            durability: Math.round(materialTemplate.durability * qualityTemplate.durabilityMultiplier),
            capacity: Math.round(materialTemplate.capacity * sizeTemplate.capacityMultiplier),
            weight: Math.round(materialTemplate.weight * sizeTemplate.multiplier + comfortTemplate.weightPenalty),
            speed: Math.round(materialTemplate.speed * qualityTemplate.speedMultiplier * (1 - comfortTemplate.speedPenalty)),
            comfort: comfortTemplate.comfortBonus,
            rarity: Math.max(materialTemplate.rarity || 1, qualityTemplate.rarity)
        };

        return stats;
    }

    /**
     * Generate carriage ID
     */
    generateCarriageId() {
        return 'carriage_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate carriage name
     */
    generateCarriageName(materialName, sizeTemplate, qualityTemplate) {
        const sizePrefixes = {
            [this.carriageSizes.SMALL]: 'Small ',
            [this.carriageSizes.MEDIUM]: '',
            [this.carriageSizes.LARGE]: 'Large ',
            [this.carriageSizes.LUXURY]: 'Luxury '
        };

        const qualityPrefixes = {
            [this.carriageQualities.COMMON]: '',
            [this.carriageQualities.UNCOMMON]: 'Fine ',
            [this.carriageQualities.RARE]: 'Rare ',
            [this.carriageQualities.EPIC]: 'Epic ',
            [this.carriageQualities.LEGENDARY]: 'Legendary ',
            [this.carriageQualities.MYTHICAL]: 'Mythical '
        };

        return `${qualityPrefixes[qualityTemplate]}${sizePrefixes[sizeTemplate]}${materialName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(materialTemplate, sizeTemplate, qualityTemplate, comfortTemplate) {
        const qualityDesc = {
            [this.carriageQualities.COMMON]: 'A standard carriage',
            [this.carriageQualities.UNCOMMON]: 'A well-crafted carriage',
            [this.carriageQualities.RARE]: 'A finely made carriage',
            [this.carriageQualities.EPIC]: 'A masterfully crafted carriage',
            [this.carriageQualities.LEGENDARY]: 'A legendary carriage of great quality',
            [this.carriageQualities.MYTHICAL]: 'A mythical carriage of unimaginable craftsmanship'
        };

        const comfortDesc = {
            [this.comfortLevels.BASIC]: 'with basic comforts',
            [this.comfortLevels.STANDARD]: 'with standard comforts',
            [this.comfortLevels.LUXURY]: 'with luxury comforts',
            [this.comfortLevels.ROYAL]: 'with royal comforts'
        };

        return `${qualityDesc[qualityTemplate]} ${comfortDesc[comfortTemplate]}. ${materialTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(materialTemplate, quality) {
        const colors = this.carriageColors[materialTemplate.color.toLowerCase().replace('#', '')] || this.carriageColors.royal;

        return {
            baseColor: colors.base,
            trimColor: colors.trim,
            accentColor: colors.accents,
            interiorColor: colors.interior,
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
            type: 'carriage_value',
            power: stats.value,
            duration: -1, // Permanent
            instant: false
        });

        // Capacity effect
        effects.push({
            type: 'passenger_capacity',
            power: stats.capacity,
            duration: -1,
            instant: false
        });

        // Speed effect
        effects.push({
            type: 'travel_speed',
            power: stats.speed,
            duration: -1,
            instant: false
        });

        // Comfort effect
        effects.push({
            type: 'comfort_bonus',
            power: stats.comfort,
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
                type: 'prestige_bonus',
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
     * Batch generate carriages
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const carriage = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(carriage);
            } catch (error) {
                console.error(`Failed to generate carriage ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(c => c !== null);
    }

    /**
     * Generate carriage by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.size) options.size = criteria.size;
        if (criteria.quality) options.quality = criteria.quality;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get carriage statistics
     */
    getCarriageStatistics() {
        return {
            totalTypes: Object.keys(this.carriageTypes).length,
            totalSizes: Object.keys(this.carriageSizes).length,
            totalQualities: Object.keys(this.carriageQualities).length,
            totalComfortLevels: Object.keys(this.comfortLevels).length,
            materialTemplates: Object.keys(this.carriageMaterialTemplates).length
        };
    }

    /**
     * Export carriage data
     */
    async exportCarriageData(carriage, outputPath) {
        const exportData = {
            ...carriage.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save carriage data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate carriage configuration
     */
    validateCarriageConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.carriageTypes).includes(config.type)) {
            errors.push(`Invalid carriage type: ${config.type}`);
        }

        if (config.size && !Object.values(this.carriageSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.carriageQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate carriage collection
     */
    async generateCarriageCollection(count = 5, theme = 'mixed') {
        const collection = [];

        for (let i = 0; i < count; i++) {
            let options = {};

            switch (theme) {
                case 'royal':
                    options.type = this.carriageTypes.ROYAL;
                    break;
                case 'commercial':
                    options.type = this.carriageTypes.COMMERCIAL;
                    break;
                case 'military':
                    options.type = this.carriageTypes.MILITARY;
                    break;
                case 'private':
                    options.type = this.carriageTypes.PRIVATE;
                    break;
                default:
                    // Mixed - all types
                    break;
            }

            const carriage = await this.generate(options);
            collection.push(carriage);
        }

        return collection;
    }

    /**
     * Calculate carriage maintenance cost
     */
    calculateMaintenanceCost(carriageData) {
        const baseCost = carriageData.stats.value * 0.02; // 2% of carriage value per maintenance (more than wagons)
        const comfortMultiplier = carriageData.comfort === this.comfortLevels.ROYAL ? 2.0 :
                                 carriageData.comfort === this.comfortLevels.LUXURY ? 1.5 : 1.0;
        const qualityMultiplier = carriageData.quality === this.carriageQualities.MYTHICAL ? 3.0 :
                                 carriageData.quality === this.carriageQualities.LEGENDARY ? 2.0 : 1.0;

        return Math.round(baseCost * comfortMultiplier * qualityMultiplier);
    }

    /**
     * Calculate carriage repair cost
     */
    calculateRepairCost(carriageData, damagePercentage = 50) {
        return Math.round((carriageData.stats.value * damagePercentage / 100) * 0.4); // 40% of damaged value (more expensive than wagons)
    }

    /**
     * Get carriage capacity info
     */
    getCarriageCapacityInfo(carriageData) {
        return {
            maxCapacity: carriageData.stats.capacity,
            currentLoad: 0, // Would be tracked separately
            availableCapacity: carriageData.stats.capacity,
            weightCapacity: Math.round(carriageData.stats.capacity * 3.0) // Carriages can carry more weight per person
        };
    }

    /**
     * Calculate carriage travel time
     */
    calculateTravelTime(carriageData, distance, terrain = 'road') {
        const baseSpeed = carriageData.stats.speed;
        const terrainMultiplier = terrain === 'road' ? 1.0 :
                                 terrain === 'dirt' ? 0.7 :
                                 terrain === 'rough' ? 0.5 :
                                 terrain === 'mountain' ? 0.3 : 0.6;

        const loadMultiplier = 1.0; // Would be based on current load
        const comfortPenalty = carriageData.comfort === this.comfortLevels.ROYAL ? 0.9 :
                              carriageData.comfort === this.comfortLevels.LUXURY ? 0.95 : 1.0;

        const effectiveSpeed = baseSpeed * terrainMultiplier * loadMultiplier * comfortPenalty;

        return Math.round(distance / effectiveSpeed);
    }

    /**
     * Generate carriage upgrade options
     */
    generateUpgradeOptions(carriageData) {
        const upgrades = [];

        // Quality upgrades
        if (carriageData.quality !== this.carriageQualities.MYTHICAL) {
            const nextQuality = this.getNextQuality(carriageData.quality);
            upgrades.push({
                type: 'quality',
                name: `Upgrade to ${nextQuality} quality`,
                cost: Math.round(carriageData.stats.value * 0.6),
                benefits: ['+30% stats', '+60% value']
            });
        }

        // Size upgrades
        if (carriageData.size !== this.carriageSizes.LUXURY) {
            const nextSize = this.getNextSize(carriageData.size);
            upgrades.push({
                type: 'size',
                name: `Upgrade to ${nextSize} size`,
                cost: Math.round(carriageData.stats.value * 1.0),
                benefits: ['+50% capacity', '+30% weight']
            });
        }

        // Comfort upgrades
        if (carriageData.comfort !== this.comfortLevels.ROYAL) {
            const nextComfort = this.getNextComfort(carriageData.comfort);
            upgrades.push({
                type: 'comfort',
                name: `Upgrade to ${nextComfort} comfort`,
                cost: Math.round(carriageData.stats.value * 0.4),
                benefits: ['+1 comfort', '+10% prestige']
            });
        }

        return upgrades;
    }

    /**
     * Get next quality level
     */
    getNextQuality(currentQuality) {
        const qualities = Object.values(this.carriageQualities);
        const currentIndex = qualities.indexOf(currentQuality);
        return qualities[Math.min(currentIndex + 1, qualities.length - 1)];
    }

    /**
     * Get next size level
     */
    getNextSize(currentSize) {
        const sizes = Object.values(this.carriageSizes);
        const currentIndex = sizes.indexOf(currentSize);
        return sizes[Math.min(currentIndex + 1, sizes.length - 1)];
    }

    /**
     * Get next comfort level
     */
    getNextComfort(currentComfort) {
        const comforts = Object.values(this.comfortLevels);
        const currentIndex = comforts.indexOf(currentComfort);
        return comforts[Math.min(currentIndex + 1, comforts.length - 1)];
    }

    /**
     * Calculate carriage depreciation
     */
    calculateDepreciation(carriageData, ageInYears = 1) {
        const depreciationRate = 0.04; // 4% per year (faster than wagons due to luxury materials)
        const comfortMultiplier = carriageData.comfort === this.comfortLevels.ROYAL ? 0.7 :
                                 carriageData.comfort === this.comfortLevels.LUXURY ? 0.8 : 1.0;
        const qualityMultiplier = carriageData.quality === this.carriageQualities.MYTHICAL ? 0.3 :
                                 carriageData.quality === this.carriageQualities.LEGENDARY ? 0.5 : 1.0;

        const depreciation = carriageData.stats.value * depreciationRate * ageInYears * comfortMultiplier * qualityMultiplier;
        return Math.round(Math.max(0, carriageData.stats.value - depreciation));
    }

    /**
     * Generate carriage route information
     */
    generateRouteInfo(carriageData, startLocation, endLocation, distance) {
        const travelTime = this.calculateTravelTime(carriageData, distance);
        const maintenanceCost = this.calculateMaintenanceCost(carriageData);
        const comfortLevel = carriageData.comfort;

        return {
            startLocation,
            endLocation,
            distance,
            travelTime,
            maintenanceCost,
            comfortLevel,
            passengerCapacity: carriageData.stats.capacity,
            estimatedArrival: new Date(Date.now() + travelTime * 60 * 60 * 1000).toISOString()
        };
    }

    /**
     * Calculate carriage passenger comfort rating
     */
    calculatePassengerComfort(carriageData) {
        const baseComfort = carriageData.stats.comfort;
        const qualityBonus = carriageData.quality === this.carriageQualities.MYTHICAL ? 3 :
                           carriageData.quality === this.carriageQualities.LEGENDARY ? 2 :
                           carriageData.quality === this.carriageQualities.EPIC ? 1 : 0;

        const sizeBonus = carriageData.size === this.carriageSizes.LUXURY ? 2 :
                         carriageData.size === this.carriageSizes.LARGE ? 1 : 0;

        return baseComfort + qualityBonus + sizeBonus;
    }
}

module.exports = CarriageGenerator;
