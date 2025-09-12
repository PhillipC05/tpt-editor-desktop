/**
 * Quest Marker Generator - Complete quest marker and indicator sprite generation system
 * Generates various types of quest markers, directional indicators, and location markers
 */

const Jimp = require('jimp');
const path = require('path');

class QuestMarkerGenerator {
    constructor() {
        this.markerTypes = {
            EXCLAMATION: 'exclamation',
            QUESTION: 'question',
            SKULL_CROSSBONES: 'skull_crossbones',
            ARROW_UP: 'arrow_up',
            ARROW_DOWN: 'arrow_down',
            ARROW_LEFT: 'arrow_left',
            ARROW_RIGHT: 'arrow_right',
            CAMP: 'camp',
            RUINS: 'ruins',
            TOWN: 'town',
            DUNGEON: 'dungeon',
            TREASURE: 'treasure',
            WARNING: 'warning',
            CHECKPOINT: 'checkpoint'
        };

        this.markerSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            EXTRA_LARGE: 'extra_large'
        };

        this.markerQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.markerStyles = {
            CLASSIC: 'classic',
            FANTASY: 'fantasy',
            MODERN: 'modern',
            ANCIENT: 'ancient',
            MAGICAL: 'magical'
        };

        // Marker material templates
        this.markerMaterialTemplates = {
            [this.markerTypes.EXCLAMATION]: {
                name: 'Exclamation Mark',
                description: 'Important quest marker',
                baseValue: 10,
                visibility: 15,
                importance: 8,
                features: ['important_quest', 'attention_grabbing', 'urgent', 'visible']
            },
            [this.markerTypes.QUESTION]: {
                name: 'Question Mark',
                description: 'Investigation quest marker',
                baseValue: 8,
                visibility: 12,
                importance: 6,
                features: ['investigation_quest', 'mystery', 'curiosity', 'exploration']
            },
            [this.markerTypes.SKULL_CROSSBONES]: {
                name: 'Skull and Crossbones',
                description: 'Danger warning marker',
                baseValue: 15,
                visibility: 18,
                importance: 9,
                features: ['danger_warning', 'hazard', 'caution', 'intimidating']
            },
            [this.markerTypes.ARROW_UP]: {
                name: 'Up Arrow',
                description: 'Directional indicator pointing up',
                baseValue: 5,
                visibility: 10,
                importance: 4,
                features: ['directional', 'guidance', 'navigation', 'upward']
            },
            [this.markerTypes.ARROW_DOWN]: {
                name: 'Down Arrow',
                description: 'Directional indicator pointing down',
                baseValue: 5,
                visibility: 10,
                importance: 4,
                features: ['directional', 'guidance', 'navigation', 'downward']
            },
            [this.markerTypes.ARROW_LEFT]: {
                name: 'Left Arrow',
                description: 'Directional indicator pointing left',
                baseValue: 5,
                visibility: 10,
                importance: 4,
                features: ['directional', 'guidance', 'navigation', 'leftward']
            },
            [this.markerTypes.ARROW_RIGHT]: {
                name: 'Right Arrow',
                description: 'Directional indicator pointing right',
                baseValue: 5,
                visibility: 10,
                importance: 4,
                features: ['directional', 'guidance', 'navigation', 'rightward']
            },
            [this.markerTypes.CAMP]: {
                name: 'Camp Marker',
                description: 'Rest area or safe location marker',
                baseValue: 12,
                visibility: 14,
                importance: 5,
                features: ['rest_area', 'safe_location', 'campfire', 'shelter']
            },
            [this.markerTypes.RUINS]: {
                name: 'Ruins Marker',
                description: 'Ancient ruins or exploration site marker',
                baseValue: 20,
                visibility: 16,
                importance: 7,
                features: ['ancient_ruins', 'exploration', 'history', 'treasure']
            },
            [this.markerTypes.TOWN]: {
                name: 'Town Marker',
                description: 'Settlement or populated area marker',
                baseValue: 18,
                visibility: 20,
                importance: 6,
                features: ['settlement', 'civilization', 'trade', 'population']
            },
            [this.markerTypes.DUNGEON]: {
                name: 'Dungeon Marker',
                description: 'Underground complex or dangerous area marker',
                baseValue: 25,
                visibility: 17,
                importance: 8,
                features: ['underground', 'dangerous', 'complex', 'challenge']
            },
            [this.markerTypes.TREASURE]: {
                name: 'Treasure Marker',
                description: 'Valuable items or reward location marker',
                baseValue: 30,
                visibility: 19,
                importance: 9,
                features: ['valuable', 'reward', 'treasure', 'wealth']
            },
            [this.markerTypes.WARNING]: {
                name: 'Warning Marker',
                description: 'Caution or hazard area marker',
                baseValue: 14,
                visibility: 16,
                importance: 7,
                features: ['caution', 'hazard', 'warning', 'danger']
            },
            [this.markerTypes.CHECKPOINT]: {
                name: 'Checkpoint Marker',
                description: 'Progress or milestone marker',
                baseValue: 16,
                visibility: 15,
                importance: 6,
                features: ['progress', 'milestone', 'checkpoint', 'achievement']
            }
        };

        // Size modifiers
        this.sizeModifiers = {
            [this.markerSizes.SMALL]: {
                multiplier: 0.6,
                visibilityMultiplier: 0.8,
                pixelSize: 16,
                features: ['small', 'discreet', 'subtle']
            },
            [this.markerSizes.MEDIUM]: {
                multiplier: 1.0,
                visibilityMultiplier: 1.0,
                pixelSize: 24,
                features: ['medium', 'standard', 'balanced']
            },
            [this.markerSizes.LARGE]: {
                multiplier: 1.5,
                visibilityMultiplier: 1.2,
                pixelSize: 32,
                features: ['large', 'prominent', 'visible']
            },
            [this.markerSizes.EXTRA_LARGE]: {
                multiplier: 2.2,
                visibilityMultiplier: 1.5,
                pixelSize: 40,
                features: ['extra_large', 'massive', 'dominant']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.markerQualities.COMMON]: {
                statMultiplier: 1.0,
                valueMultiplier: 1.0,
                visibilityMultiplier: 1.0,
                rarity: 1,
                features: ['common', 'standard', 'reliable']
            },
            [this.markerQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                valueMultiplier: 1.5,
                visibilityMultiplier: 1.1,
                rarity: 2,
                features: ['uncommon', 'enhanced', 'improved']
            },
            [this.markerQualities.RARE]: {
                statMultiplier: 1.5,
                valueMultiplier: 2.5,
                visibilityMultiplier: 1.25,
                rarity: 3,
                features: ['rare', 'exceptional', 'superior']
            },
            [this.markerQualities.EPIC]: {
                statMultiplier: 2.0,
                valueMultiplier: 4.0,
                visibilityMultiplier: 1.5,
                rarity: 4,
                features: ['epic', 'masterwork', 'elite']
            },
            [this.markerQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                valueMultiplier: 8.0,
                visibilityMultiplier: 2.0,
                rarity: 5,
                features: ['legendary', 'artifact', 'legendary']
            },
            [this.markerQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                valueMultiplier: 20.0,
                visibilityMultiplier: 3.0,
                rarity: 6,
                features: ['mythical', 'divine', 'ultimate']
            }
        };

        // Style modifiers
        this.styleModifiers = {
            [this.markerStyles.CLASSIC]: {
                name: 'Classic',
                colors: { base: '#FFD700', accent: '#FF0000', outline: '#000000' },
                features: ['traditional', 'timeless', 'recognizable']
            },
            [this.markerStyles.FANTASY]: {
                name: 'Fantasy',
                colors: { base: '#9370DB', accent: '#FFD700', outline: '#4B0082' },
                features: ['magical', 'mystical', 'enchanted']
            },
            [this.markerStyles.MODERN]: {
                name: 'Modern',
                colors: { base: '#00FF00', accent: '#FFFFFF', outline: '#000000' },
                features: ['contemporary', 'clean', 'digital']
            },
            [this.markerStyles.ANCIENT]: {
                name: 'Ancient',
                colors: { base: '#8B4513', accent: '#FFD700', outline: '#654321' },
                features: ['historical', 'aged', 'traditional']
            },
            [this.markerStyles.MAGICAL]: {
                name: 'Magical',
                colors: { base: '#FF1493', accent: '#00FFFF', outline: '#8A2BE2' },
                features: ['magical', 'glowing', 'mysterious']
            }
        };

        // Animation states
        this.animationStates = {
            STATIC: 'static',
            PULSING: 'pulsing',
            ROTATING: 'rotating',
            BOUNCING: 'bouncing',
            GLOWING: 'glowing'
        };
    }

    /**
     * Generate quest marker sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.markerTypes.EXCLAMATION,
            size: options.size || this.markerSizes.MEDIUM,
            quality: options.quality || this.markerQualities.COMMON,
            style: options.style || this.markerStyles.CLASSIC,
            animation: options.animation || this.animationStates.STATIC,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates
        const materialTemplate = this.markerMaterialTemplates[config.type];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];
        const styleTemplate = this.styleModifiers[config.style];

        if (!materialTemplate || !sizeTemplate || !qualityTemplate || !styleTemplate) {
            throw new Error(`Unknown marker configuration: ${config.type}, ${config.size}, ${config.quality}, ${config.style}`);
        }

        // Calculate final stats
        const finalStats = this.calculateMarkerStats(materialTemplate, sizeTemplate, qualityTemplate, config);

        // Generate marker data
        const markerData = {
            id: this.generateMarkerId(),
            name: this.generateMarkerName(materialTemplate.name, sizeTemplate, qualityTemplate, styleTemplate),
            type: config.type,
            size: config.size,
            quality: config.quality,
            style: config.style,
            animation: config.animation,
            materialTemplate: materialTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            styleTemplate: styleTemplate,
            stats: finalStats,
            features: [...materialTemplate.features, ...sizeTemplate.features, ...qualityTemplate.features, ...styleTemplate.features],
            description: this.generateDescription(materialTemplate, sizeTemplate, qualityTemplate, styleTemplate),
            appearance: this.generateAppearance(materialTemplate, styleTemplate, config.quality),
            effects: this.generateEffects(materialTemplate, finalStats),
            animationData: this.generateAnimationData(config.animation, finalStats)
        };

        // Generate sprite image
        const spriteImage = await this.generateMarkerSprite(markerData, config);

        return {
            image: spriteImage,
            data: markerData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'QuestMarkerGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate marker sprite image
     */
    async generateMarkerSprite(markerData, config) {
        const width = config.width || markerData.sizeTemplate.pixelSize * 2;
        const height = config.height || markerData.sizeTemplate.pixelSize * 2;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw marker based on type
        await this.drawMarkerBase(image, markerData, config);

        // Apply quality effects
        if (markerData.quality !== this.markerQualities.COMMON) {
            await this.addQualityEffects(image, markerData.quality);
        }

        // Apply animation effects if needed
        if (markerData.animation !== this.animationStates.STATIC) {
            await this.addAnimationEffects(image, markerData.animation);
        }

        return image;
    }

    /**
     * Draw marker base shape
     */
    async drawMarkerBase(image, markerData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = markerData.sizeTemplate.pixelSize / 24;
        const colors = markerData.styleTemplate.colors;

        // Draw marker based on type
        switch (markerData.type) {
            case this.markerTypes.EXCLAMATION:
                await this.drawExclamationMark(image, centerX, centerY, scale, colors, markerData);
                break;
            case this.markerTypes.QUESTION:
                await this.drawQuestionMark(image, centerX, centerY, scale, colors, markerData);
                break;
            case this.markerTypes.SKULL_CROSSBONES:
                await this.drawSkullCrossbones(image, centerX, centerY, scale, colors, markerData);
                break;
            case this.markerTypes.ARROW_UP:
                await this.drawArrow(image, centerX, centerY, scale, colors, markerData, 'up');
                break;
            case this.markerTypes.ARROW_DOWN:
                await this.drawArrow(image, centerX, centerY, scale, colors, markerData, 'down');
                break;
            case this.markerTypes.ARROW_LEFT:
                await this.drawArrow(image, centerX, centerY, scale, colors, markerData, 'left');
                break;
            case this.markerTypes.ARROW_RIGHT:
                await this.drawArrow(image, centerX, centerY, scale, colors, markerData, 'right');
                break;
            case this.markerTypes.CAMP:
                await this.drawCamp(image, centerX, centerY, scale, colors, markerData);
                break;
            case this.markerTypes.RUINS:
                await this.drawRuins(image, centerX, centerY, scale, colors, markerData);
                break;
            case this.markerTypes.TOWN:
                await this.drawTown(image, centerX, centerY, scale, colors, markerData);
                break;
            case this.markerTypes.DUNGEON:
                await this.drawDungeon(image, centerX, centerY, scale, colors, markerData);
                break;
            case this.markerTypes.TREASURE:
                await this.drawTreasure(image, centerX, centerY, scale, colors, markerData);
                break;
            case this.markerTypes.WARNING:
                await this.drawWarning(image, centerX, centerY, scale, colors, markerData);
                break;
            case this.markerTypes.CHECKPOINT:
                await this.drawCheckpoint(image, centerX, centerY, scale, colors, markerData);
                break;
            default:
                await this.drawExclamationMark(image, centerX, centerY, scale, colors, markerData);
        }
    }

    /**
     * Draw exclamation mark
     */
    async drawExclamationMark(image, x, y, scale, colors, markerData) {
        const width = 4 * scale;
        const height = 16 * scale;

        // Draw exclamation point body
        for (let i = -width; i < width; i++) {
            for (let j = -height; j < height; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Exclamation mark shape
                    if (Math.abs(i) <= width && Math.abs(j) <= height) {
                        // Main vertical line
                        if (Math.abs(i) <= width * 0.3 && j < height * 0.7) {
                            const r = parseInt(colors.base.slice(1, 3), 16);
                            const g = parseInt(colors.base.slice(3, 5), 16);
                            const b = parseInt(colors.base.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                        // Dot at bottom
                        else if (Math.abs(i) <= width * 0.5 && Math.abs(j - height * 0.8) <= width * 0.5) {
                            const r = parseInt(colors.accent.slice(1, 3), 16);
                            const g = parseInt(colors.accent.slice(3, 5), 16);
                            const b = parseInt(colors.accent.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }

        // Add outline
        await this.addOutline(image, x, y, width, height, colors.outline);
    }

    /**
     * Draw question mark
     */
    async drawQuestionMark(image, x, y, scale, colors, markerData) {
        const width = 4 * scale;
        const height = 16 * scale;

        // Draw question mark shape
        for (let i = -width; i < width; i++) {
            for (let j = -height; j < height; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Question mark shape approximation
                    if (Math.abs(i) <= width && Math.abs(j) <= height) {
                        // Curved top part
                        if (j < height * 0.3 && Math.sqrt(i * i + (j - height * 0.2) * (j - height * 0.2)) <= width) {
                            const r = parseInt(colors.base.slice(1, 3), 16);
                            const g = parseInt(colors.base.slice(3, 5), 16);
                            const b = parseInt(colors.base.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                        // Vertical line
                        else if (Math.abs(i) <= width * 0.3 && j >= height * 0.3 && j < height * 0.7) {
                            const r = parseInt(colors.base.slice(1, 3), 16);
                            const g = parseInt(colors.base.slice(3, 5), 16);
                            const b = parseInt(colors.base.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                        // Dot at bottom
                        else if (Math.abs(i) <= width * 0.5 && Math.abs(j - height * 0.8) <= width * 0.5) {
                            const r = parseInt(colors.accent.slice(1, 3), 16);
                            const g = parseInt(colors.accent.slice(3, 5), 16);
                            const b = parseInt(colors.accent.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }

        // Add outline
        await this.addOutline(image, x, y, width, height, colors.outline);
    }

    /**
     * Draw skull and crossbones
     */
    async drawSkullCrossbones(image, x, y, scale, colors, markerData) {
        const size = 12 * scale;

        // Draw skull
        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Skull shape
                    if (Math.sqrt(i * i + j * j) <= size * 0.8) {
                        // Eye sockets
                        if (Math.abs(i) <= size * 0.3 && Math.abs(j) <= size * 0.2 && Math.abs(j) > size * 0.1) {
                            const r = parseInt(colors.outline.slice(1, 3), 16);
                            const g = parseInt(colors.outline.slice(3, 5), 16);
                            const b = parseInt(colors.outline.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                        // Nose hole
                        else if (Math.abs(i) <= size * 0.1 && Math.abs(j + size * 0.1) <= size * 0.1) {
                            const r = parseInt(colors.outline.slice(1, 3), 16);
                            const g = parseInt(colors.outline.slice(3, 5), 16);
                            const b = parseInt(colors.outline.slice(5, 7), 16);
                            const color = (r << 16) | (g << 8) | b | 0xFF000000;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                        // Main skull
                        else {
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

        // Draw crossbones
        // Horizontal bone
        for (let i = -size * 1.2; i < size * 1.2; i++) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y + size * 0.6);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                if (Math.abs(i) <= size * 1.2) {
                    const r = parseInt(colors.accent.slice(1, 3), 16);
                    const g = parseInt(colors.accent.slice(3, 5), 16);
                    const b = parseInt(colors.accent.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }

        // Vertical bone
        for (let j = -size * 0.8; j < size * 0.8; j++) {
            const pixelX = Math.floor(x);
            const pixelY = Math.floor(y + j);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                if (Math.abs(j) <= size * 0.8) {
                    const r = parseInt(colors.accent.slice(1, 3), 16);
                    const g = parseInt(colors.accent.slice(3, 5), 16);
                    const b = parseInt(colors.accent.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw arrow
     */
    async drawArrow(image, x, y, scale, colors, markerData, direction) {
        const length = 16 * scale;
        const headSize = 6 * scale;

        let angle = 0;
        switch (direction) {
            case 'up': angle = -Math.PI / 2; break;
            case 'down': angle = Math.PI / 2; break;
            case 'left': angle = Math.PI; break;
            case 'right': angle = 0; break;
        }

        // Draw arrow shaft
        for (let i = 0; i < length; i++) {
            const shaftX = Math.cos(angle) * i;
            const shaftY = Math.sin(angle) * i;
            const pixelX = Math.floor(x + shaftX);
            const pixelY = Math.floor(y + shaftY);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt(colors.base.slice(1, 3), 16);
                const g = parseInt(colors.base.slice(3, 5), 16);
                const b = parseInt(colors.base.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }

        // Draw arrow head
        const headX = Math.cos(angle) * length;
        const headY = Math.sin(angle) * length;

        for (let i = -headSize; i < headSize; i++) {
            for (let j = -headSize; j < headSize; j++) {
                const pixelX = Math.floor(x + headX + i);
                const pixelY = Math.floor(y + headY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Arrow head shape
                    const localX = i;
                    const localY = j;
                    const rotatedX = localX * Math.cos(angle) - localY * Math.sin(angle);
                    const rotatedY = localX * Math.sin(angle) + localY * Math.cos(angle);

                    if (rotatedX >= 0 && Math.abs(rotatedY) <= headSize - Math.abs(rotatedX)) {
                        const r = parseInt(colors.accent.slice(1, 3), 16);
                        const g = parseInt(colors.accent.slice(3, 5), 16);
                        const b = parseInt(colors.accent.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw camp marker
     */
    async drawCamp(image, x, y, scale, colors, markerData) {
        const size = 12 * scale;

        // Draw tent shape
        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Tent triangle
                    if (j >= 0 && Math.abs(i) <= size - Math.abs(j)) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw campfire
        for (let i = -3; i <= 3; i++) {
            for (let j = -2; j <= 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + size * 0.8 + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) + Math.abs(j) <= 3) {
                        const r = parseInt(colors.accent.slice(1, 3), 16);
                        const g = parseInt(colors.accent.slice(3, 5), 16);
                        const b = parseInt(colors.accent.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw ruins marker
     */
    async drawRuins(image, x, y, scale, colors, markerData) {
        const size = 12 * scale;

        // Draw broken pillar
        for (let i = -3; i <= 3; i++) {
            for (let j = -size; j < size; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 3 && j >= -size && j < size * 0.7) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw broken top
        for (let i = -5; i <= 5; i++) {
            for (let j = -2; j <= 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y - size * 0.8 + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 5 && Math.abs(j) <= 2) {
                        const r = parseInt(colors.accent.slice(1, 3), 16);
                        const g = parseInt(colors.accent.slice(3, 5), 16);
                        const b = parseInt(colors.accent.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw town marker
     */
    async drawTown(image, x, y, scale, colors, markerData) {
        const size = 12 * scale;

        // Draw buildings
        for (let building = -2; building <= 2; building++) {
            const buildingX = x + building * 6 * scale;
            const buildingHeight = size * (0.5 + Math.random() * 0.5);

            for (let i = -2; i <= 2; i++) {
                for (let j = 0; j < buildingHeight; j++) {
                    const pixelX = Math.floor(buildingX + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if (Math.abs(i) <= 2 && j >= 0 && j < buildingHeight) {
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
    }

    /**
     * Draw dungeon marker
     */
    async drawDungeon(image, x, y, scale, colors, markerData) {
        const size = 12 * scale;

        // Draw dungeon entrance
        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Cave entrance shape
                    if (Math.sqrt(i * i + j * j) <= size && j >= -size * 0.3) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw entrance bars
        for (let i = -size * 0.8; i < size * 0.8; i += 3) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y + size * 0.2);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt(colors.accent.slice(1, 3), 16);
                const g = parseInt(colors.accent.slice(3, 5), 16);
                const b = parseInt(colors.accent.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }
    }

    /**
     * Draw treasure marker
     */
    async drawTreasure(image, x, y, scale, colors, markerData) {
        const size = 12 * scale;

        // Draw treasure chest
        for (let i = -size; i < size; i++) {
            for (let j = -size * 0.6; j < size * 0.6; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Chest shape
                    if (Math.abs(i) <= size && Math.abs(j) <= size * 0.6) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw lock
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y - size * 0.2 + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) + Math.abs(j) <= 2) {
                        const r = parseInt(colors.accent.slice(1, 3), 16);
                        const g = parseInt(colors.accent.slice(3, 5), 16);
                        const b = parseInt(colors.accent.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw warning marker
     */
    async drawWarning(image, x, y, scale, colors, markerData) {
        const size = 12 * scale;

        // Draw warning triangle
        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Warning triangle
                    if (j >= 0 && Math.abs(i) <= size - Math.abs(j)) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw exclamation mark inside
        for (let i = -2; i <= 2; i++) {
            for (let j = -6; j < 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= 1 && j >= -6 && j < 0) {
                        const r = parseInt(colors.accent.slice(1, 3), 16);
                        const g = parseInt(colors.accent.slice(3, 5), 16);
                        const b = parseInt(colors.accent.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                    // Dot
                    else if (Math.abs(i) <= 1 && Math.abs(j - 1) <= 1) {
                        const r = parseInt(colors.accent.slice(1, 3), 16);
                        const g = parseInt(colors.accent.slice(3, 5), 16);
                        const b = parseInt(colors.accent.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw checkpoint marker
     */
    async drawCheckpoint(image, x, y, scale, colors, markerData) {
        const size = 12 * scale;

        // Draw flagpole
        for (let j = -size; j < size; j++) {
            const pixelX = Math.floor(x);
            const pixelY = Math.floor(y + j);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                if (j >= -size && j < size * 0.8) {
                    const r = parseInt(colors.outline.slice(1, 3), 16);
                    const g = parseInt(colors.outline.slice(3, 5), 16);
                    const b = parseInt(colors.outline.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }

        // Draw flag
        for (let i = 1; i < size * 0.8; i++) {
            for (let j = -size * 0.6; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (j >= -size * 0.6 && j < 0) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw checkmark on flag
        const checkPoints = [
            { x: 2, y: -4 }, { x: 3, y: -3 }, { x: 5, y: -5 }, { x: 6, y: -4 }, { x: 8, y: -2 }
        ];

        for (const point of checkPoints) {
            const pixelX = Math.floor(x + point.x * scale);
            const pixelY = Math.floor(y + point.y * scale);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt(colors.accent.slice(1, 3), 16);
                const g = parseInt(colors.accent.slice(3, 5), 16);
                const b = parseInt(colors.accent.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }
    }

    /**
     * Add outline to marker
     */
    async addOutline(image, x, y, width, height, outlineColor) {
        // Simple outline implementation
        for (let i = -width - 1; i <= width + 1; i++) {
            for (let j = -height - 1; j <= height + 1; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Check if this is an outline pixel (adjacent to filled area)
                    const isOutline = (Math.abs(i) > width || Math.abs(j) > height) &&
                                    (Math.abs(i) <= width + 1 && Math.abs(j) <= height + 1);
                    if (isOutline) {
                        const r = parseInt(outlineColor.slice(1, 3), 16);
                        const g = parseInt(outlineColor.slice(3, 5), 16);
                        const b = parseInt(outlineColor.slice(5, 7), 16);
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
            case this.markerQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.markerQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.markerQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.markerQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Add animation effects
     */
    async addAnimationEffects(image, animation) {
        // Animation effects would be implemented with frame-based animation
        // For now, just add a subtle glow for animated markers
        if (animation !== this.animationStates.STATIC) {
            await this.addSubtleGlow(image);
        }
    }

    /**
     * Calculate marker stats
     */
    calculateMarkerStats(materialTemplate, sizeTemplate, qualityTemplate, config) {
        const stats = {
            value: Math.round(materialTemplate.baseValue * sizeTemplate.multiplier * qualityTemplate.valueMultiplier),
            visibility: Math.round(materialTemplate.visibility * sizeTemplate.visibilityMultiplier * qualityTemplate.visibilityMultiplier),
            importance: Math.round(materialTemplate.importance * qualityTemplate.statMultiplier),
            rarity: Math.max(materialTemplate.rarity || 1, qualityTemplate.rarity)
        };

        return stats;
    }

    /**
     * Generate marker ID
     */
    generateMarkerId() {
        return 'quest_marker_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate marker name
     */
    generateMarkerName(materialName, sizeTemplate, qualityTemplate, styleTemplate) {
        const sizePrefixes = {
            [this.markerSizes.SMALL]: 'Small ',
            [this.markerSizes.MEDIUM]: '',
            [this.markerSizes.LARGE]: 'Large ',
            [this.markerSizes.EXTRA_LARGE]: 'Extra Large '
        };

        const qualityPrefixes = {
            [this.markerQualities.COMMON]: '',
            [this.markerQualities.UNCOMMON]: 'Enhanced ',
            [this.markerQualities.RARE]: 'Rare ',
            [this.markerQualities.EPIC]: 'Epic ',
            [this.markerQualities.LEGENDARY]: 'Legendary ',
            [this.markerQualities.MYTHICAL]: 'Mythical '
        };

        const styleSuffixes = {
            [this.markerStyles.CLASSIC]: '',
            [this.markerStyles.FANTASY]: ' (Fantasy)',
            [this.markerStyles.MODERN]: ' (Modern)',
            [this.markerStyles.ANCIENT]: ' (Ancient)',
            [this.markerStyles.MAGICAL]: ' (Magical)'
        };

        return `${qualityPrefixes[qualityTemplate]}${sizePrefixes[sizeTemplate]}${materialName}${styleSuffixes[styleTemplate]}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(materialTemplate, sizeTemplate, qualityTemplate, styleTemplate) {
        const qualityDesc = {
            [this.markerQualities.COMMON]: 'A standard quest marker',
            [this.markerQualities.UNCOMMON]: 'An enhanced quest marker',
            [this.markerQualities.RARE]: 'A rare quest marker',
            [this.markerQualities.EPIC]: 'An epic quest marker',
            [this.markerQualities.LEGENDARY]: 'A legendary quest marker',
            [this.markerQualities.MYTHICAL]: 'A mythical quest marker'
        };

        const styleDesc = {
            [this.markerStyles.CLASSIC]: 'with classic styling',
            [this.markerStyles.FANTASY]: 'with fantasy styling',
            [this.markerStyles.MODERN]: 'with modern styling',
            [this.markerStyles.ANCIENT]: 'with ancient styling',
            [this.markerStyles.MAGICAL]: 'with magical styling'
        };

        return `${qualityDesc[qualityTemplate]} ${styleDesc[styleTemplate]}. ${materialTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(materialTemplate, styleTemplate, quality) {
        return {
            baseColor: styleTemplate.colors.base,
            accentColor: styleTemplate.colors.accent,
            outlineColor: styleTemplate.colors.outline,
            material: materialTemplate,
            style: styleTemplate,
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
            type: 'marker_value',
            power: stats.value,
            duration: -1, // Permanent
            instant: false
        });

        // Visibility effect
        effects.push({
            type: 'visibility_bonus',
            power: stats.visibility,
            duration: -1,
            instant: false
        });

        // Importance effect
        effects.push({
            type: 'quest_importance',
            power: stats.importance,
            duration: -1,
            instant: false
        });

        return effects;
    }

    /**
     * Generate animation data
     */
    generateAnimationData(animation, stats) {
        const animationData = {
            type: animation,
            frames: [],
            duration: 1000, // milliseconds
            loop: true
        };

        switch (animation) {
            case this.animationStates.PULSING:
                animationData.frames = [
                    { scale: 1.0, opacity: 1.0 },
                    { scale: 1.1, opacity: 0.8 },
                    { scale: 1.0, opacity: 1.0 }
                ];
                break;
            case this.animationStates.ROTATING:
                animationData.frames = [
                    { rotation: 0 },
                    { rotation: 90 },
                    { rotation: 180 },
                    { rotation: 270 },
                    { rotation: 0 }
                ];
                break;
            case this.animationStates.BOUNCING:
                animationData.frames = [
                    { yOffset: 0 },
                    { yOffset: -2 },
                    { yOffset: 0 },
                    { yOffset: 2 },
                    { yOffset: 0 }
                ];
                break;
            case this.animationStates.GLOWING:
                animationData.frames = [
                    { glow: 0 },
                    { glow: 1 },
                    { glow: 0 }
                ];
                break;
            default:
                animationData.frames = [{ scale: 1.0, opacity: 1.0 }];
        }

        return animationData;
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addRareGlow(image) { return image; }
    async addEpicGlow(image) { return image; }
    async addLegendaryGlow(image) { return image; }
    async addMythicalGlow(image) { return image; }
    async addSubtleGlow(image) { return image; }

    /**
     * Batch generate quest markers
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const marker = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(marker);
            } catch (error) {
                console.error(`Failed to generate quest marker ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(m => m !== null);
    }

    /**
     * Generate marker by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.size) options.size = criteria.size;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.style) options.style = criteria.style;
        if (criteria.animation) options.animation = criteria.animation;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get marker statistics
     */
    getMarkerStatistics() {
        return {
            totalTypes: Object.keys(this.markerTypes).length,
            totalSizes: Object.keys(this.markerSizes).length,
            totalQualities: Object.keys(this.markerQualities).length,
            totalStyles: Object.keys(this.markerStyles).length,
            totalAnimations: Object.keys(this.animationStates).length,
            materialTemplates: Object.keys(this.markerMaterialTemplates).length
        };
    }

    /**
     * Export marker data
     */
    async exportMarkerData(marker, outputPath) {
        const exportData = {
            ...marker.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save marker data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate marker configuration
     */
    validateMarkerConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.markerTypes).includes(config.type)) {
            errors.push(`Invalid marker type: ${config.type}`);
        }

        if (config.size && !Object.values(this.markerSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.markerQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.style && !Object.values(this.markerStyles).includes(config.style)) {
            errors.push(`Invalid style: ${config.style}`);
        }

        if (config.animation && !Object.values(this.animationStates).includes(config.animation)) {
            errors.push(`Invalid animation: ${config.animation}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate marker collection
     */
    async generateMarkerCollection(count = 5, theme = 'mixed') {
        const collection = [];

        for (let i = 0; i < count; i++) {
            let options = {};

            switch (theme) {
                case 'quest':
                    options.type = this.markerTypes.EXCLAMATION;
                    break;
                case 'danger':
                    options.type = this.markerTypes.SKULL_CROSSBONES;
                    break;
                case 'directional':
                    const arrows = [this.markerTypes.ARROW_UP, this.markerTypes.ARROW_DOWN,
                                  this.markerTypes.ARROW_LEFT, this.markerTypes.ARROW_RIGHT];
                    options.type = arrows[Math.floor(Math.random() * arrows.length)];
                    break;
                case 'location':
                    const locations = [this.markerTypes.CAMP, this.markerTypes.RUINS,
                                     this.markerTypes.TOWN, this.markerTypes.DUNGEON, this.markerTypes.TREASURE];
                    options.type = locations[Math.floor(Math.random() * locations.length)];
                    break;
                default:
                    // Mixed - all types
                    break;
            }

            const marker = await this.generate(options);
            collection.push(marker);
        }

        return collection;
    }

    /**
     * Generate quest marker set
     */
    async generateQuestMarkerSet() {
        const set = [];

        // Main quest markers
        const mainQuest = await this.generate({
            type: this.markerTypes.EXCLAMATION,
            size: this.markerSizes.LARGE,
            quality: this.markerQualities.RARE,
            style: this.markerStyles.FANTASY,
            animation: this.animationStates.PULSING
        });
        set.push(mainQuest);

        // Side quest markers
        const sideQuest = await this.generate({
            type: this.markerTypes.QUESTION,
            size: this.markerSizes.MEDIUM,
            quality: this.markerQualities.UNCOMMON,
            style: this.markerStyles.CLASSIC,
            animation: this.animationStates.STATIC
        });
        set.push(sideQuest);

        // Directional markers
        const directions = [this.markerTypes.ARROW_UP, this.markerTypes.ARROW_DOWN,
                          this.markerTypes.ARROW_LEFT, this.markerTypes.ARROW_RIGHT];

        for (const direction of directions) {
            const arrow = await this.generate({
                type: direction,
                size: this.markerSizes.SMALL,
                quality: this.markerQualities.COMMON,
                style: this.markerStyles.MODERN,
                animation: this.animationStates.STATIC
            });
            set.push(arrow);
        }

        return set;
    }

    /**
     * Generate location marker set
     */
    async generateLocationMarkerSet() {
        const set = [];

        const locations = [
            { type: this.markerTypes.CAMP, quality: this.markerQualities.COMMON },
            { type: this.markerTypes.TOWN, quality: this.markerQualities.UNCOMMON },
            { type: this.markerTypes.RUINS, quality: this.markerQualities.RARE },
            { type: this.markerTypes.DUNGEON, quality: this.markerQualities.EPIC },
            { type: this.markerTypes.TREASURE, quality: this.markerQualities.LEGENDARY }
        ];

        for (const location of locations) {
            const marker = await this.generate({
                type: location.type,
                size: this.markerSizes.MEDIUM,
                quality: location.quality,
                style: this.markerStyles.FANTASY,
                animation: location.type === this.markerTypes.TREASURE ? this.animationStates.GLOWING : this.animationStates.STATIC
            });
            set.push(marker);
        }

        return set;
    }

    /**
     * Calculate marker visibility range
     */
    calculateVisibilityRange(markerData) {
        const baseRange = 50; // Base visibility range in game units
        const sizeMultiplier = markerData.size === this.markerSizes.EXTRA_LARGE ? 2.0 :
                              markerData.size === this.markerSizes.LARGE ? 1.5 :
                              markerData.size === this.markerSizes.MEDIUM ? 1.0 :
                              markerData.size === this.markerSizes.SMALL ? 0.7 : 0.5;

        const qualityMultiplier = markerData.quality === this.markerQualities.MYTHICAL ? 3.0 :
                                 markerData.quality === this.markerQualities.LEGENDARY ? 2.5 :
                                 markerData.quality === this.markerQualities.EPIC ? 2.0 :
                                 markerData.quality === this.markerQualities.RARE ? 1.5 :
                                 markerData.quality === this.markerQualities.UNCOMMON ? 1.2 : 1.0;

        const styleMultiplier = markerData.style === this.markerStyles.MAGICAL ? 1.5 :
                               markerData.style === this.markerStyles.FANTASY ? 1.3 :
                               markerData.style === this.markerStyles.MODERN ? 1.1 : 1.0;

        return Math.round(baseRange * sizeMultiplier * qualityMultiplier * styleMultiplier);
    }

    /**
     * Generate marker performance report
     */
    generatePerformanceReport(markerData) {
        const performance = {
            overall: 0,
            categories: {}
        };

        // Calculate performance scores
        performance.categories.visibility = Math.min(100, (markerData.stats.visibility / 50) * 100);
        performance.categories.importance = Math.min(100, (markerData.stats.importance / 10) * 100);
        performance.categories.value = Math.min(100, (markerData.stats.value / 50) * 100);

        // Calculate overall performance
        const scores = Object.values(performance.categories);
        performance.overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        return performance;
    }

    /**
     * Generate marker comparison
     */
    async generateMarkerComparison(markerType, qualities = ['common', 'rare', 'epic']) {
        const comparison = {};

        for (const quality of qualities) {
            const marker = await this.generate({
                type: markerType,
                quality: quality
            });

            comparison[quality] = {
                name: marker.data.name,
                value: marker.data.stats.value,
                visibility: marker.data.stats.visibility,
                importance: marker.data.stats.importance,
                performance: this.generatePerformanceReport(marker.data)
            };
        }

        return comparison;
    }
}

module.exports = QuestMarkerGenerator;
