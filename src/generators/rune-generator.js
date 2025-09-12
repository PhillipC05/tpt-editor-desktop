/**
 * Rune Generator - Complete rune and magical symbol sprite generation system
 * Generates various types of runes, magical symbols, and mystical markings
 */

const Jimp = require('jimp');
const path = require('path');

class RuneGenerator {
    constructor() {
        this.runeTypes = {
            ELEMENTAL: 'elemental',
            POWER: 'power',
            PROTECTION: 'protection',
            ANCIENT: 'ancient',
            MAGICAL: 'magical',
            CURSE: 'curse',
            BLESSING: 'blessing',
            ILLUSION: 'illusion',
            SUMMONING: 'summoning',
            TELEPORTATION: 'teleportation'
        };

        this.elementalRunes = {
            FIRE: 'fire',
            WATER: 'water',
            EARTH: 'earth',
            AIR: 'air',
            LIGHTNING: 'lightning',
            ICE: 'ice',
            LIGHT: 'light',
            DARKNESS: 'darkness'
        };

        this.powerRunes = {
            STRENGTH: 'strength',
            SPEED: 'speed',
            WISDOM: 'wisdom',
            COURAGE: 'courage',
            FOCUS: 'focus',
            ENDURANCE: 'endurance',
            LUCK: 'luck',
            CHARISMA: 'charisma'
        };

        this.protectionRunes = {
            SHIELD: 'shield',
            WARD: 'ward',
            BARRIER: 'barrier',
            REFLECTION: 'reflection',
            ABSORPTION: 'absorption',
            PURIFICATION: 'purification',
            SANCTUARY: 'sanctuary',
            GUARDIAN: 'guardian'
        };

        this.runeSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            EXTRA_LARGE: 'extra_large'
        };

        this.runeQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.runeStyles = {
            CLASSIC: 'classic',
            ANCIENT: 'ancient',
            ELVEN: 'elven',
            DWARVEN: 'dwarven',
            DEMONIC: 'demonic',
            CELESTIAL: 'celestial',
            DRACONIC: 'draconic',
            FORBIDDEN: 'forbidden'
        };

        this.surfaceTypes = {
            STONE: 'stone',
            METAL: 'metal',
            WOOD: 'wood',
            CRYSTAL: 'crystal',
            SKIN: 'skin',
            PAPER: 'paper',
            MAGICAL: 'magical'
        };

        // Rune templates with their meanings and effects
        this.runeTemplates = {
            // Elemental Runes
            [this.elementalRunes.FIRE]: {
                name: 'Fire Rune',
                description: 'Rune of flame and destruction',
                basePower: 25,
                element: 'fire',
                effects: ['fire_damage', 'burning', 'heat'],
                symbols: ['flame', 'triangle', 'zigzag'],
                color: '#FF4500'
            },
            [this.elementalRunes.WATER]: {
                name: 'Water Rune',
                description: 'Rune of flow and healing',
                basePower: 20,
                element: 'water',
                effects: ['water_damage', 'healing', 'flow'],
                symbols: ['wave', 'spiral', 'droplet'],
                color: '#00BFFF'
            },
            [this.elementalRunes.EARTH]: {
                name: 'Earth Rune',
                description: 'Rune of stability and strength',
                basePower: 30,
                element: 'earth',
                effects: ['earth_damage', 'stability', 'growth'],
                symbols: ['mountain', 'square', 'root'],
                color: '#8B4513'
            },
            [this.elementalRunes.AIR]: {
                name: 'Air Rune',
                description: 'Rune of freedom and speed',
                basePower: 18,
                element: 'air',
                effects: ['wind_damage', 'speed', 'freedom'],
                symbols: ['wind_lines', 'circle', 'feather'],
                color: '#87CEEB'
            },
            [this.elementalRunes.LIGHTNING]: {
                name: 'Lightning Rune',
                description: 'Rune of power and energy',
                basePower: 35,
                element: 'lightning',
                effects: ['lightning_damage', 'paralysis', 'energy'],
                symbols: ['bolt', 'zigzag', 'starburst'],
                color: '#FFD700'
            },
            [this.elementalRunes.ICE]: {
                name: 'Ice Rune',
                description: 'Rune of cold and preservation',
                basePower: 22,
                element: 'ice',
                effects: ['ice_damage', 'slow', 'preservation'],
                symbols: ['snowflake', 'diamond', 'frost'],
                color: '#ADD8E6'
            },
            [this.elementalRunes.LIGHT]: {
                name: 'Light Rune',
                description: 'Rune of illumination and truth',
                basePower: 28,
                element: 'light',
                effects: ['light_damage', 'reveal', 'healing'],
                symbols: ['sun', 'ray', 'eye'],
                color: '#FFFF00'
            },
            [this.elementalRunes.DARKNESS]: {
                name: 'Darkness Rune',
                description: 'Rune of shadow and mystery',
                basePower: 32,
                element: 'darkness',
                effects: ['dark_damage', 'stealth', 'fear'],
                symbols: ['moon', 'void', 'shadow'],
                color: '#2F2F2F'
            },

            // Power Runes
            [this.powerRunes.STRENGTH]: {
                name: 'Strength Rune',
                description: 'Rune of physical power',
                basePower: 25,
                element: 'physical',
                effects: ['strength_boost', 'damage_increase', 'durability'],
                symbols: ['fist', 'hammer', 'mountain'],
                color: '#DC143C'
            },
            [this.powerRunes.SPEED]: {
                name: 'Speed Rune',
                description: 'Rune of swiftness and agility',
                basePower: 20,
                element: 'physical',
                effects: ['speed_boost', 'dodge', 'quickness'],
                symbols: ['arrow', 'lightning', 'wind'],
                color: '#00FF00'
            },
            [this.powerRunes.WISDOM]: {
                name: 'Wisdom Rune',
                description: 'Rune of knowledge and insight',
                basePower: 18,
                element: 'mental',
                effects: ['wisdom_boost', 'magic_power', 'perception'],
                symbols: ['eye', 'book', 'owl'],
                color: '#9370DB'
            },
            [this.powerRunes.COURAGE]: {
                name: 'Courage Rune',
                description: 'Rune of bravery and resolve',
                basePower: 22,
                element: 'mental',
                effects: ['courage_boost', 'fear_resistance', 'morale'],
                symbols: ['lion', 'shield', 'flame'],
                color: '#FFD700'
            },
            [this.powerRunes.FOCUS]: {
                name: 'Focus Rune',
                description: 'Rune of concentration and precision',
                basePower: 16,
                element: 'mental',
                effects: ['focus_boost', 'accuracy', 'clarity'],
                symbols: ['target', 'arrow', 'crystal'],
                color: '#FF6347'
            },
            [this.powerRunes.ENDURANCE]: {
                name: 'Endurance Rune',
                description: 'Rune of stamina and resilience',
                basePower: 24,
                element: 'physical',
                effects: ['endurance_boost', 'health_regen', 'resistance'],
                symbols: ['oak', 'shield', 'heart'],
                color: '#228B22'
            },
            [this.powerRunes.LUCK]: {
                name: 'Luck Rune',
                description: 'Rune of fortune and chance',
                basePower: 15,
                element: 'spiritual',
                effects: ['luck_boost', 'critical_chance', 'fortune'],
                symbols: ['clover', 'dice', 'star'],
                color: '#32CD32'
            },
            [this.powerRunes.CHARISMA]: {
                name: 'Charisma Rune',
                description: 'Rune of charm and persuasion',
                basePower: 19,
                element: 'social',
                effects: ['charisma_boost', 'persuasion', 'leadership'],
                symbols: ['crown', 'mask', 'rose'],
                color: '#FF69B4'
            },

            // Protection Runes
            [this.protectionRunes.SHIELD]: {
                name: 'Shield Rune',
                description: 'Rune of physical protection',
                basePower: 30,
                element: 'protection',
                effects: ['physical_defense', 'block', 'resistance'],
                symbols: ['shield', 'wall', 'armor'],
                color: '#708090'
            },
            [this.protectionRunes.WARD]: {
                name: 'Ward Rune',
                description: 'Rune of magical protection',
                basePower: 28,
                element: 'protection',
                effects: ['magic_defense', 'ward', 'barrier'],
                symbols: ['circle', 'pentagram', 'ward'],
                color: '#9370DB'
            },
            [this.protectionRunes.BARRIER]: {
                name: 'Barrier Rune',
                description: 'Rune of impenetrable defense',
                basePower: 35,
                element: 'protection',
                effects: ['absolute_defense', 'barrier', 'invulnerability'],
                symbols: ['wall', 'lock', 'diamond'],
                color: '#4169E1'
            },
            [this.protectionRunes.REFLECTION]: {
                name: 'Reflection Rune',
                description: 'Rune of spell reflection',
                basePower: 32,
                element: 'protection',
                effects: ['spell_reflection', 'mirror', 'retaliation'],
                symbols: ['mirror', 'arrow', 'circle'],
                color: '#C0C0C0'
            },
            [this.protectionRunes.ABSORPTION]: {
                name: 'Absorption Rune',
                description: 'Rune of energy absorption',
                basePower: 26,
                element: 'protection',
                effects: ['energy_absorption', 'drain', 'conversion'],
                symbols: ['sponge', 'vortex', 'web'],
                color: '#8B0000'
            },
            [this.protectionRunes.PURIFICATION]: {
                name: 'Purification Rune',
                description: 'Rune of cleansing and healing',
                basePower: 24,
                element: 'protection',
                effects: ['purification', 'healing', 'cleansing'],
                symbols: ['water', 'light', 'cross'],
                color: '#FFFFFF'
            },
            [this.protectionRunes.SANCTUARY]: {
                name: 'Sanctuary Rune',
                description: 'Rune of holy protection',
                basePower: 38,
                element: 'protection',
                effects: ['holy_protection', 'sanctuary', 'divine_shield'],
                symbols: ['cross', 'crown', 'wings'],
                color: '#FFD700'
            },
            [this.protectionRunes.GUARDIAN]: {
                name: 'Guardian Rune',
                description: 'Rune of watchful protection',
                basePower: 33,
                element: 'protection',
                effects: ['guardian', 'watchful', 'alert'],
                symbols: ['eye', 'sword', 'shield'],
                color: '#8B4513'
            }
        };

        // Size modifiers
        this.sizeModifiers = {
            [this.runeSizes.SMALL]: {
                multiplier: 0.6,
                powerMultiplier: 0.8,
                pixelSize: 16,
                features: ['small', 'discreet', 'subtle']
            },
            [this.runeSizes.MEDIUM]: {
                multiplier: 1.0,
                powerMultiplier: 1.0,
                pixelSize: 24,
                features: ['medium', 'standard', 'balanced']
            },
            [this.runeSizes.LARGE]: {
                multiplier: 1.5,
                powerMultiplier: 1.2,
                pixelSize: 32,
                features: ['large', 'prominent', 'powerful']
            },
            [this.runeSizes.EXTRA_LARGE]: {
                multiplier: 2.2,
                powerMultiplier: 1.5,
                pixelSize: 40,
                features: ['extra_large', 'massive', 'dominant']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.runeQualities.COMMON]: {
                statMultiplier: 1.0,
                powerMultiplier: 1.0,
                rarity: 1,
                features: ['common', 'standard', 'reliable']
            },
            [this.runeQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                powerMultiplier: 1.3,
                rarity: 2,
                features: ['uncommon', 'enhanced', 'improved']
            },
            [this.runeQualities.RARE]: {
                statMultiplier: 1.5,
                powerMultiplier: 1.8,
                rarity: 3,
                features: ['rare', 'exceptional', 'superior']
            },
            [this.runeQualities.EPIC]: {
                statMultiplier: 2.0,
                powerMultiplier: 2.5,
                rarity: 4,
                features: ['epic', 'masterwork', 'elite']
            },
            [this.runeQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                powerMultiplier: 4.0,
                rarity: 5,
                features: ['legendary', 'artifact', 'legendary']
            },
            [this.runeQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                powerMultiplier: 8.0,
                rarity: 6,
                features: ['mythical', 'divine', 'ultimate']
            }
        };

        // Style modifiers
        this.styleModifiers = {
            [this.runeStyles.CLASSIC]: {
                name: 'Classic',
                colors: { primary: '#FFD700', secondary: '#000000', accent: '#FF0000' },
                features: ['traditional', 'timeless', 'recognizable']
            },
            [this.runeStyles.ANCIENT]: {
                name: 'Ancient',
                colors: { primary: '#8B4513', secondary: '#654321', accent: '#FFD700' },
                features: ['historical', 'aged', 'traditional']
            },
            [this.runeStyles.ELVEN]: {
                name: 'Elven',
                colors: { primary: '#90EE90', secondary: '#228B22', accent: '#FFD700' },
                features: ['elegant', 'natural', 'graceful']
            },
            [this.runeStyles.DWARVEN]: {
                name: 'Dwarven',
                colors: { primary: '#C0C0C0', secondary: '#2F4F4F', accent: '#FFD700' },
                features: ['rugged', 'durable', 'craftsman']
            },
            [this.runeStyles.DEMONIC]: {
                name: 'Demonic',
                colors: { primary: '#8B0000', secondary: '#000000', accent: '#FF4500' },
                features: ['dark', 'intimidating', 'forbidden']
            },
            [this.runeStyles.CELESTIAL]: {
                name: 'Celestial',
                colors: { primary: '#FFFFFF', secondary: '#FFD700', accent: '#87CEEB' },
                features: ['holy', 'radiant', 'divine']
            },
            [this.runeStyles.DRACONIC]: {
                name: 'Draconic',
                colors: { primary: '#DC143C', secondary: '#000000', accent: '#FFD700' },
                features: ['powerful', 'majestic', 'ancient']
            },
            [this.runeStyles.FORBIDDEN]: {
                name: 'Forbidden',
                colors: { primary: '#4B0082', secondary: '#2F2F2F', accent: '#9370DB' },
                features: ['mysterious', 'dangerous', 'arcane']
            }
        };

        // Surface modifiers
        this.surfaceModifiers = {
            [this.surfaceTypes.STONE]: {
                name: 'Stone',
                durability: 500,
                powerAmplification: 1.2,
                features: ['permanent', 'durable', 'earthy']
            },
            [this.surfaceTypes.METAL]: {
                name: 'Metal',
                durability: 300,
                powerAmplification: 1.5,
                features: ['conductive', 'durable', 'metallic']
            },
            [this.surfaceTypes.WOOD]: {
                name: 'Wood',
                durability: 150,
                powerAmplification: 0.8,
                features: ['natural', 'flexible', 'organic']
            },
            [this.surfaceTypes.CRYSTAL]: {
                name: 'Crystal',
                durability: 200,
                powerAmplification: 2.0,
                features: ['pure', 'amplifying', 'transparent']
            },
            [this.surfaceTypes.SKIN]: {
                name: 'Skin',
                durability: 100,
                powerAmplification: 1.0,
                features: ['personal', 'temporary', 'intimate']
            },
            [this.surfaceTypes.PAPER]: {
                name: 'Paper',
                durability: 50,
                powerAmplification: 0.6,
                features: ['temporary', 'portable', 'fragile']
            },
            [this.surfaceTypes.MAGICAL]: {
                name: 'Magical',
                durability: 1000,
                powerAmplification: 3.0,
                features: ['eternal', 'powerful', 'mystical']
            }
        };

        // Rune symbols and their shapes
        this.runeSymbols = {
            flame: { shape: 'triangle', width: 6, height: 8, color: '#FF4500' },
            wave: { shape: 'sine_wave', width: 8, height: 4, color: '#00BFFF' },
            mountain: { shape: 'triangle', width: 8, height: 6, color: '#8B4513' },
            wind_lines: { shape: 'lines', width: 6, height: 4, color: '#87CEEB' },
            bolt: { shape: 'zigzag', width: 4, height: 8, color: '#FFD700' },
            snowflake: { shape: 'star', width: 6, height: 6, color: '#ADD8E6' },
            sun: { shape: 'circle', width: 6, height: 6, color: '#FFFF00' },
            moon: { shape: 'crescent', width: 6, height: 4, color: '#C0C0C0' },
            fist: { shape: 'fist', width: 4, height: 6, color: '#DC143C' },
            arrow: { shape: 'arrow', width: 6, height: 2, color: '#00FF00' },
            eye: { shape: 'circle', width: 4, height: 4, color: '#9370DB' },
            lion: { shape: 'lion_head', width: 6, height: 6, color: '#FFD700' },
            target: { shape: 'bullseye', width: 6, height: 6, color: '#FF6347' },
            oak: { shape: 'tree', width: 4, height: 8, color: '#228B22' },
            clover: { shape: 'clover', width: 6, height: 6, color: '#32CD32' },
            crown: { shape: 'crown', width: 8, height: 4, color: '#FF69B4' },
            shield: { shape: 'shield', width: 6, height: 8, color: '#708090' },
            circle: { shape: 'circle', width: 6, height: 6, color: '#9370DB' },
            wall: { shape: 'rectangle', width: 8, height: 6, color: '#4169E1' },
            mirror: { shape: 'diamond', width: 6, height: 8, color: '#C0C0C0' },
            sponge: { shape: 'porous', width: 6, height: 6, color: '#8B0000' },
            cross: { shape: 'cross', width: 4, height: 6, color: '#FFFFFF' },
            wings: { shape: 'wings', width: 8, height: 4, color: '#FFD700' }
        };
    }

    /**
     * Generate rune sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.runeTypes.ELEMENTAL,
            subtype: options.subtype || this.elementalRunes.FIRE,
            size: options.size || this.runeSizes.MEDIUM,
            quality: options.quality || this.runeQualities.COMMON,
            style: options.style || this.runeStyles.CLASSIC,
            surface: options.surface || this.surfaceTypes.STONE,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates
        const runeTemplate = this.runeTemplates[config.subtype];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];
        const styleTemplate = this.styleModifiers[config.style];
        const surfaceTemplate = this.surfaceModifiers[config.surface];

        if (!runeTemplate || !sizeTemplate || !qualityTemplate || !styleTemplate || !surfaceTemplate) {
            throw new Error(`Unknown rune configuration: ${config.type}, ${config.subtype}, ${config.size}, ${config.quality}, ${config.style}, ${config.surface}`);
        }

        // Calculate final stats
        const finalStats = this.calculateRuneStats(runeTemplate, sizeTemplate, qualityTemplate, surfaceTemplate, config);

        // Generate rune data
        const runeData = {
            id: this.generateRuneId(),
            name: this.generateRuneName(runeTemplate.name, sizeTemplate, qualityTemplate, styleTemplate),
            type: config.type,
            subtype: config.subtype,
            size: config.size,
            quality: config.quality,
            style: config.style,
            surface: config.surface,
            runeTemplate: runeTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            styleTemplate: styleTemplate,
            surfaceTemplate: surfaceTemplate,
            stats: finalStats,
            features: [...runeTemplate.effects, ...sizeTemplate.features, ...qualityTemplate.features, ...styleTemplate.features, ...surfaceTemplate.features],
            description: this.generateDescription(runeTemplate, sizeTemplate, qualityTemplate, styleTemplate, surfaceTemplate),
            appearance: this.generateAppearance(runeTemplate, styleTemplate, config.quality),
            effects: this.generateEffects(runeTemplate, finalStats),
            symbols: this.generateSymbols(runeTemplate.symbols, styleTemplate.colors)
        };

        // Generate sprite image
        const spriteImage = await this.generateRuneSprite(runeData, config);

        return {
            image: spriteImage,
            data: runeData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'RuneGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate rune sprite image
     */
    async generateRuneSprite(runeData, config) {
        const width = config.width || runeData.sizeTemplate.pixelSize * 2;
        const height = config.height || runeData.sizeTemplate.pixelSize * 2;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw rune based on type
        await this.drawRuneBase(image, runeData, config);

        // Apply quality effects
        if (runeData.quality !== this.runeQualities.COMMON) {
            await this.addQualityEffects(image, runeData.quality);
        }

        return image;
    }

    /**
     * Draw rune base shape
     */
    async drawRuneBase(image, runeData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = runeData.sizeTemplate.pixelSize / 24;
        const colors = runeData.styleTemplate.colors;

        // Draw rune background/circle
        await this.drawRuneCircle(image, centerX, centerY, scale, colors, runeData);

        // Draw rune symbols
        await this.drawRuneSymbols(image, centerX, centerY, scale, colors, runeData);

        // Draw rune border
        await this.drawRuneBorder(image, centerX, centerY, scale, colors, runeData);
    }

    /**
     * Draw rune circle background
     */
    async drawRuneCircle(image, x, y, scale, colors, runeData) {
        const radius = 20 * scale;

        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const distance = Math.sqrt(i * i + j * j);
                    if (distance <= radius && distance >= radius * 0.8) {
                        const r = parseInt(colors.secondary.slice(1, 3), 16);
                        const g = parseInt(colors.secondary.slice(3, 5), 16);
                        const b = parseInt(colors.secondary.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw rune symbols
     */
    async drawRuneSymbols(image, x, y, scale, colors, runeData) {
        const symbols = runeData.symbols.slice(0, 3); // Limit to 3 main symbols
        const angleStep = (Math.PI * 2) / symbols.length;

        symbols.forEach((symbol, index) => {
            const angle = index * angleStep;
            const distance = 8 * scale;
            const symbolX = x + Math.cos(angle) * distance;
            const symbolY = y + Math.sin(angle) * distance;

            this.drawSymbol(image, symbolX, symbolY, scale, colors, symbol);
        });
    }

    /**
     * Draw individual symbol
     */
    drawSymbol(image, x, y, scale, colors, symbol) {
        const symbolData = this.runeSymbols[symbol];
        if (!symbolData) return;

        const width = symbolData.width * scale;
        const height = symbolData.height * scale;

        for (let i = -width; i < width; i++) {
            for (let j = -height; j < height; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (this.isInSymbolShape(i, j, width, height, symbolData.shape)) {
                        const r = parseInt(symbolData.color.slice(1, 3), 16);
                        const g = parseInt(symbolData.color.slice(3, 5), 16);
                        const b = parseInt(symbolData.color.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Check if point is in symbol shape
     */
    isInSymbolShape(i, j, width, height, shape) {
        switch (shape) {
            case 'triangle':
                return Math.abs(i) <= width - Math.abs(j) * width / height && Math.abs(j) <= height;
            case 'circle':
                return i * i + j * j <= width * height;
            case 'rectangle':
                return Math.abs(i) <= width && Math.abs(j) <= height;
            case 'star':
                // Simple star approximation
                const angle = Math.atan2(j, i);
                const distance = Math.sqrt(i * i + j * j);
                const starPoints = 5;
                const starDepth = 0.5;
                const starRadius = distance / Math.max(width, height);
                const starFactor = Math.cos(angle * starPoints / 2) * starDepth + (1 - starDepth);
                return starRadius <= starFactor;
            case 'diamond':
                return Math.abs(i) + Math.abs(j) <= Math.max(width, height);
            case 'sine_wave':
                return Math.abs(j - Math.sin(i / width * Math.PI * 2) * height * 0.5) <= height * 0.3;
            case 'lines':
                return Math.abs(j) <= height * 0.2 || Math.abs(i) <= width * 0.2;
            case 'zigzag':
                const zigzag = Math.abs(j - Math.sin(i / width * Math.PI * 4) * height * 0.3);
                return zigzag <= height * 0.4;
            case 'crescent':
                const crescentDistance = Math.sqrt(i * i + j * j);
                const crescent = Math.sqrt((i + width * 0.3) * (i + width * 0.3) + j * j);
                return crescentDistance <= width && crescent >= width * 0.7;
            case 'fist':
                return Math.abs(i) <= width && Math.abs(j) <= height && (j >= 0 || Math.abs(i) <= width * 0.6);
            case 'arrow':
                return (Math.abs(i) <= width * 0.2 && Math.abs(j) <= height) ||
                       (j >= 0 && Math.abs(i) <= width - Math.abs(j) * width / height);
            case 'bullseye':
                const rings = Math.floor(Math.sqrt(i * i + j * j) / (width / 3));
                return rings % 2 === 0;
            case 'tree':
                return (Math.abs(i) <= width * 0.3 && Math.abs(j) <= height) ||
                       (Math.abs(j) >= height * 0.7 && Math.abs(i) <= width - Math.abs(j - height * 0.7) * width / (height * 0.3));
            case 'clover':
                const leaf1 = Math.sqrt((i - width * 0.3) * (i - width * 0.3) + (j - height * 0.3) * (j - height * 0.3)) <= width * 0.4;
                const leaf2 = Math.sqrt((i + width * 0.3) * (i + width * 0.3) + (j - height * 0.3) * (j - height * 0.3)) <= width * 0.4;
                const leaf3 = Math.sqrt((i - width * 0.3) * (i - width * 0.3) + (j + height * 0.3) * (j + height * 0.3)) <= width * 0.4;
                const leaf4 = Math.sqrt((i + width * 0.3) * (i + width * 0.3) + (j + height * 0.3) * (j + height * 0.3)) <= width * 0.4;
                return leaf1 || leaf2 || leaf3 || leaf4;
            case 'crown':
                return (Math.abs(j) <= height * 0.3 && Math.abs(i) <= width) ||
                       (j >= height * 0.3 && Math.abs(i) <= width * 0.8 && Math.abs(j) <= height);
            case 'shield':
                return Math.abs(i) <= width && Math.abs(j) <= height && j >= -height * 0.8;
            case 'porous':
                return Math.abs(i) <= width && Math.abs(j) <= height && (Math.random() > 0.3);
            case 'cross':
                return Math.abs(i) <= width * 0.3 || Math.abs(j) <= height * 0.3;
            case 'wings':
                return (Math.abs(i) <= width && Math.abs(j) <= height * 0.4) ||
                       (Math.abs(j) >= height * 0.4 && Math.abs(i) <= width - Math.abs(j - height * 0.4) * width / (height * 0.6));
            case 'lion_head':
                return Math.sqrt(i * i + j * j) <= width * 0.8 && j <= height * 0.6;
            default:
                return Math.abs(i) <= width && Math.abs(j) <= height;
        }
    }

    /**
     * Draw rune border
     */
    async drawRuneBorder(image, x, y, scale, colors, runeData) {
        const radius = 20 * scale;

        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const distance = Math.sqrt(i * i + j * j);
                    if (Math.abs(distance - radius) <= 1) {
                        const r = parseInt(colors.primary.slice(1, 3), 16);
                        const g = parseInt(colors.primary.slice(3, 5), 16);
                        const b = parseInt(colors.primary.slice(5, 7), 16);
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
            case this.runeQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.runeQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.runeQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.runeQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Calculate rune stats
     */
    calculateRuneStats(runeTemplate, sizeTemplate, qualityTemplate, surfaceTemplate, config) {
        const stats = {
            power: Math.round(runeTemplate.basePower * sizeTemplate.powerMultiplier * qualityTemplate.powerMultiplier * surfaceTemplate.powerAmplification),
            durability: surfaceTemplate.durability,
            rarity: Math.max(runeTemplate.rarity || 1, qualityTemplate.rarity),
            amplification: surfaceTemplate.powerAmplification,
            effectiveness: Math.round(qualityTemplate.statMultiplier * surfaceTemplate.powerAmplification * 100)
        };

        return stats;
    }

    /**
     * Generate rune ID
     */
    generateRuneId() {
        return 'rune_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate rune name
     */
    generateRuneName(runeName, sizeTemplate, qualityTemplate, styleTemplate) {
        const sizePrefixes = {
            [this.runeSizes.SMALL]: 'Minor ',
            [this.runeSizes.MEDIUM]: '',
            [this.runeSizes.LARGE]: 'Major ',
            [this.runeSizes.EXTRA_LARGE]: 'Grand '
        };

        const qualityPrefixes = {
            [this.runeQualities.COMMON]: '',
            [this.runeQualities.UNCOMMON]: 'Enhanced ',
            [this.runeQualities.RARE]: 'Ancient ',
            [this.runeQualities.EPIC]: 'Powerful ',
            [this.runeQualities.LEGENDARY]: 'Legendary ',
            [this.runeQualities.MYTHICAL]: 'Mythical '
        };

        const styleSuffixes = {
            [this.runeStyles.CLASSIC]: '',
            [this.runeStyles.ANCIENT]: ' (Ancient Style)',
            [this.runeStyles.ELVEN]: ' (Elven Style)',
            [this.runeStyles.DWARVEN]: ' (Dwarven Style)',
            [this.runeStyles.DEMONIC]: ' (Demonic Style)',
            [this.runeStyles.CELESTIAL]: ' (Celestial Style)',
            [this.runeStyles.DRACONIC]: ' (Draconic Style)',
            [this.runeStyles.FORBIDDEN]: ' (Forbidden Style)'
        };

        return `${qualityPrefixes[qualityTemplate]}${sizePrefixes[sizeTemplate]}${runeName}${styleSuffixes[styleTemplate]}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(runeTemplate, sizeTemplate, qualityTemplate, styleTemplate, surfaceTemplate) {
        const qualityDesc = {
            [this.runeQualities.COMMON]: 'A standard rune',
            [this.runeQualities.UNCOMMON]: 'An enhanced rune',
            [this.runeQualities.RARE]: 'An ancient rune',
            [this.runeQualities.EPIC]: 'A powerful rune',
            [this.runeQualities.LEGENDARY]: 'A legendary rune',
            [this.runeQualities.MYTHICAL]: 'A mythical rune'
        };

        const styleDesc = {
            [this.runeStyles.CLASSIC]: 'with classic styling',
            [this.runeStyles.ANCIENT]: 'with ancient styling',
            [this.runeStyles.ELVEN]: 'with elven styling',
            [this.runeStyles.DWARVEN]: 'with dwarven styling',
            [this.runeStyles.DEMONIC]: 'with demonic styling',
            [this.runeStyles.CELESTIAL]: 'with celestial styling',
            [this.runeStyles.DRACONIC]: 'with draconic styling',
            [this.runeStyles.FORBIDDEN]: 'with forbidden styling'
        };

        const surfaceDesc = ` carved into ${surfaceTemplate.name.toLowerCase()}`;

        return `${qualityDesc[qualityTemplate]} ${styleDesc[styleTemplate]}${surfaceDesc}. ${runeTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(runeTemplate, styleTemplate, quality) {
        return {
            primaryColor: styleTemplate.colors.primary,
            secondaryColor: styleTemplate.colors.secondary,
            accentColor: styleTemplate.colors.accent,
            runeTemplate: runeTemplate,
            styleTemplate: styleTemplate,
            quality: quality
        };
    }

    /**
     * Generate effects
     */
    generateEffects(runeTemplate, stats) {
        const effects = [];

        // Power effect
        effects.push({
            type: 'rune_power',
            power: stats.power,
            duration: -1, // Permanent
            instant: false
        });

        // Amplification effect
        effects.push({
            type: 'power_amplification',
            power: stats.amplification,
            duration: -1,
            instant: false
        });

        // Effectiveness effect
        effects.push({
            type: 'effectiveness',
            power: stats.effectiveness,
            duration: -1,
            instant: false
        });

        // Add specific rune effects
        runeTemplate.effects.forEach(effect => {
            effects.push({
                type: effect,
                power: stats.power,
                duration: -1,
                instant: false
            });
        });

        return effects;
    }

    /**
     * Generate symbols
     */
    generateSymbols(symbolTypes, colors) {
        return symbolTypes.map(symbolType => {
            const symbolData = this.runeSymbols[symbolType];
            if (symbolData) {
                return {
                    type: symbolType,
                    ...symbolData,
                    color: colors.primary // Use primary color for symbols
                };
            }
            return null;
        }).filter(symbol => symbol !== null);
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addRareGlow(image) { return image; }
    async addEpicGlow(image) { return image; }
    async addLegendaryGlow(image) { return image; }
    async addMythicalGlow(image) { return image; }

    /**
     * Batch generate runes
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const rune = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(rune);
            } catch (error) {
                console.error(`Failed to generate rune ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(r => r !== null);
    }

    /**
     * Generate rune by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.subtype) options.subtype = criteria.subtype;
        if (criteria.size) options.size = criteria.size;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.style) options.style = criteria.style;
        if (criteria.surface) options.surface = criteria.surface;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get rune statistics
     */
    getRuneStatistics() {
        return {
            totalTypes: Object.keys(this.runeTypes).length,
            totalElementalRunes: Object.keys(this.elementalRunes).length,
            totalPowerRunes: Object.keys(this.powerRunes).length,
            totalProtectionRunes: Object.keys(this.protectionRunes).length,
            totalSizes: Object.keys(this.runeSizes).length,
            totalQualities: Object.keys(this.runeQualities).length,
            totalStyles: Object.keys(this.runeStyles).length,
            totalSurfaces: Object.keys(this.surfaceTypes).length,
            runeTemplates: Object.keys(this.runeTemplates).length,
            symbolTypes: Object.keys(this.runeSymbols).length
        };
    }

    /**
     * Export rune data
     */
    async exportRuneData(rune, outputPath) {
        const exportData = {
            ...rune.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save rune data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate rune configuration
     */
    validateRuneConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.runeTypes).includes(config.type)) {
            errors.push(`Invalid rune type: ${config.type}`);
        }

        if (config.subtype && !Object.values(this.runeTemplates).some(template => template.name.toLowerCase().includes(config.subtype.toLowerCase()))) {
            errors.push(`Invalid rune subtype: ${config.subtype}`);
        }

        if (config.size && !Object.values(this.runeSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.runeQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.style && !Object.values(this.runeStyles).includes(config.style)) {
            errors.push(`Invalid style: ${config.style}`);
        }

        if (config.surface && !Object.values(this.surfaceTypes).includes(config.surface)) {
            errors.push(`Invalid surface type: ${config.surface}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate elemental rune set
     */
    async generateElementalRuneSet() {
        const elementalRunes = Object.keys(this.elementalRunes);
        const runeSet = [];

        for (const runeKey of elementalRunes) {
            const rune = await this.generate({
                type: this.runeTypes.ELEMENTAL,
                subtype: runeKey,
                size: this.runeSizes.MEDIUM,
                quality: this.runeQualities.UNCOMMON,
                style: this.runeStyles.CLASSIC,
                surface: this.surfaceTypes.STONE
            });
            runeSet.push(rune);
        }

        return runeSet;
    }

    /**
     * Generate power rune set
     */
    async generatePowerRuneSet() {
        const powerRunes = Object.keys(this.powerRunes);
        const runeSet = [];

        for (const runeKey of powerRunes) {
            const rune = await this.generate({
                type: this.runeTypes.POWER,
                subtype: runeKey,
                size: this.runeSizes.MEDIUM,
                quality: this.runeQualities.RARE,
                style: this.runeStyles.ANCIENT,
                surface: this.surfaceTypes.CRYSTAL
            });
            runeSet.push(rune);
        }

        return runeSet;
    }

    /**
     * Generate protection rune set
     */
    async generateProtectionRuneSet() {
        const protectionRunes = Object.keys(this.protectionRunes);
        const runeSet = [];

        for (const runeKey of protectionRunes) {
            const rune = await this.generate({
                type: this.runeTypes.PROTECTION,
                subtype: runeKey,
                size: this.runeSizes.MEDIUM,
                quality: this.runeQualities.EPIC,
                style: this.runeStyles.CELESTIAL,
                surface: this.surfaceTypes.MAGICAL
            });
            runeSet.push(rune);
        }

        return runeSet;
    }

    /**
     * Generate complete rune collection
     */
    async generateCompleteRuneCollection() {
        const collection = {
            elemental: await this.generateElementalRuneSet(),
            power: await this.generatePowerRuneSet(),
            protection: await this.generateProtectionRuneSet(),
            totalRunes: 0,
            collectionValue: 0
        };

        // Calculate totals
        const allRunes = [...collection.elemental, ...collection.power, ...collection.protection];
        collection.totalRunes = allRunes.length;
        collection.collectionValue = allRunes.reduce((sum, rune) => sum + rune.data.stats.power, 0);

        return collection;
    }

    /**
     * Generate rune with specific power level
     */
    async generateRuneByPower(minPower, maxPower, options = {}) {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const quality = this.getRandomFromArray(Object.values(this.runeQualities));
            const size = this.getRandomFromArray(Object.values(this.runeSizes));
            const surface = this.getRandomFromArray(Object.values(this.surfaceTypes));
            const subtype = this.getRandomFromArray(Object.values(this.runeTemplates));

            const estimatedPower = this.calculateRuneStats(
                subtype,
                this.sizeModifiers[size],
                this.qualityModifiers[quality],
                this.surfaceModifiers[surface],
                {}
            ).power;

            if (estimatedPower >= minPower && estimatedPower <= maxPower) {
                return await this.generate({
                    subtype: subtype.name.toLowerCase().replace(' rune', ''),
                    size: size,
                    quality: quality,
                    surface: surface,
                    ...options
                });
            }

            attempts++;
        }

        // Fallback
        return await this.generate({
            size: this.runeSizes.MEDIUM,
            quality: this.runeQualities.COMMON,
            surface: this.surfaceTypes.STONE,
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
     * Generate rune combination
     */
    async generateRuneCombination(runeTypes, options = {}) {
        const combination = [];

        for (const runeType of runeTypes) {
            const rune = await this.generate({
                subtype: runeType,
                ...options
            });
            combination.push(rune);
        }

        return combination;
    }

    /**
     * Calculate rune synergy
     */
    calculateRuneSynergy(runes) {
        const synergy = {
            totalPower: 0,
            synergyBonus: 0,
            elementBalance: {},
            synergyEffects: []
        };

        // Calculate total power
        synergy.totalPower = runes.reduce((sum, rune) => sum + rune.data.stats.power, 0);

        // Calculate element balance
        runes.forEach(rune => {
            const element = rune.data.runeTemplate.element;
            synergy.elementBalance[element] = (synergy.elementBalance[element] || 0) + 1;
        });

        // Calculate synergy bonus based on balance
        const elementCounts = Object.values(synergy.elementBalance);
        const maxCount = Math.max(...elementCounts);
        const minCount = Math.min(...elementCounts);
        const balanceRatio = minCount / maxCount;

        synergy.synergyBonus = Math.round(synergy.totalPower * balanceRatio * 0.25); // 25% bonus for perfect balance

        // Add synergy effects
        if (balanceRatio >= 0.8) {
            synergy.synergyEffects.push('perfect_harmony');
            synergy.synergyEffects.push('amplified_power');
        } else if (balanceRatio >= 0.6) {
            synergy.synergyEffects.push('balanced_elements');
        }

        return synergy;
    }

    /**
     * Generate rune circle (multiple runes in formation)
     */
    async generateRuneCircle(centerRune, surroundingRunes = [], options = {}) {
        const circle = {
            center: centerRune,
            surrounding: surroundingRunes,
            formation: 'circle',
            synergy: this.calculateRuneSynergy([centerRune, ...surroundingRunes])
        };

        return circle;
    }

    /**
     * Generate rune performance report
     */
    generateRunePerformanceReport(runeData) {
        const performance = {
            overall: 0,
            categories: {}
        };

        // Calculate performance scores
        performance.categories.power = Math.min(100, (runeData.stats.power / 100) * 100);
        performance.categories.effectiveness = Math.min(100, runeData.stats.effectiveness);
        performance.categories.amplification = Math.min(100, (runeData.stats.amplification / 3) * 100);
        performance.categories.durability = Math.min(100, (runeData.stats.durability / 1000) * 100);

        // Calculate overall performance
        const scores = Object.values(performance.categories);
        performance.overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        return performance;
    }

    /**
     * Generate rune upgrade options
     */
    generateRuneUpgradeOptions(runeData) {
        const upgrades = [];

        // Quality upgrades
        if (runeData.quality !== this.runeQualities.MYTHICAL) {
            const nextQuality = this.getNextQuality(runeData.quality);
            upgrades.push({
                type: 'quality',
                name: `Upgrade to ${nextQuality} quality`,
                cost: Math.round(runeData.stats.power * 2),
                benefits: ['+50% power', '+25% effectiveness', '+1 rarity']
            });
        }

        // Size upgrades
        if (runeData.size !== this.runeSizes.EXTRA_LARGE) {
            const nextSize = this.getNextSize(runeData.size);
            upgrades.push({
                type: 'size',
                name: `Upgrade to ${nextSize} size`,
                cost: Math.round(runeData.stats.power * 1.5),
                benefits: ['+25% power', '+15% visibility']
            });
        }

        // Surface upgrades
        if (runeData.surface !== this.surfaceTypes.MAGICAL) {
            const nextSurface = this.getNextSurface(runeData.surface);
            upgrades.push({
                type: 'surface',
                name: `Transfer to ${nextSurface} surface`,
                cost: Math.round(runeData.stats.power * 3),
                benefits: ['+100% amplification', '+200% durability']
            });
        }

        return upgrades;
    }

    /**
     * Get next quality level
     */
    getNextQuality(currentQuality) {
        const qualities = Object.values(this.runeQualities);
        const currentIndex = qualities.indexOf(currentQuality);
        return qualities[Math.min(currentIndex + 1, qualities.length - 1)];
    }

    /**
     * Get next size level
     */
    getNextSize(currentSize) {
        const sizes = Object.values(this.runeSizes);
        const currentIndex = sizes.indexOf(currentSize);
        return sizes[Math.min(currentIndex + 1, sizes.length - 1)];
    }

    /**
     * Get next surface type
     */
    getNextSurface(currentSurface) {
        const surfaces = Object.values(this.surfaceTypes);
        const currentIndex = surfaces.indexOf(currentSurface);
        return surfaces[Math.min(currentIndex + 1, surfaces.length - 1)];
    }

    /**
     * Calculate rune crafting cost
     */
    calculateRuneCraftingCost(runeData) {
        const baseCost = runeData.stats.power * 10; // Base cost scales with power
        const qualityMultiplier = this.getQualityMultiplier(runeData.quality);
        const surfaceMultiplier = this.getSurfaceMultiplier(runeData.surface);

        return Math.round(baseCost * qualityMultiplier * surfaceMultiplier);
    }

    /**
     * Get quality multiplier for crafting
     */
    getQualityMultiplier(quality) {
        const multipliers = {
            [this.runeQualities.COMMON]: 1.0,
            [this.runeQualities.UNCOMMON]: 2.0,
            [this.runeQualities.RARE]: 5.0,
            [this.runeQualities.EPIC]: 15.0,
            [this.runeQualities.LEGENDARY]: 50.0,
            [this.runeQualities.MYTHICAL]: 200.0
        };

        return multipliers[quality] || 1.0;
    }

    /**
     * Get surface multiplier for crafting
     */
    getSurfaceMultiplier(surface) {
        const multipliers = {
            [this.surfaceTypes.PAPER]: 0.5,
            [this.surfaceTypes.WOOD]: 1.0,
            [this.surfaceTypes.STONE]: 1.5,
            [this.surfaceTypes.METAL]: 2.0,
            [this.surfaceTypes.CRYSTAL]: 3.0,
            [this.surfaceTypes.SKIN]: 4.0,
            [this.surfaceTypes.MAGICAL]: 10.0
        };

        return multipliers[surface] || 1.0;
    }

    /**
     * Generate rune crafting requirements
     */
    generateRuneCraftingRequirements(runeData) {
        const requirements = {
            materials: [],
            skills: [],
            time: 0,
            difficulty: 'normal'
        };

        // Material requirements based on surface
        switch (runeData.surface) {
            case this.surfaceTypes.PAPER:
                requirements.materials.push({ name: 'parchment', quantity: 1 });
                requirements.materials.push({ name: 'ink', quantity: 1 });
                break;
            case this.surfaceTypes.WOOD:
                requirements.materials.push({ name: 'wooden_plank', quantity: 1 });
                requirements.materials.push({ name: 'carving_tool', quantity: 1 });
                break;
            case this.surfaceTypes.STONE:
                requirements.materials.push({ name: 'stone_slab', quantity: 1 });
                requirements.materials.push({ name: 'chisel', quantity: 1 });
                break;
            case this.surfaceTypes.METAL:
                requirements.materials.push({ name: 'metal_plate', quantity: 1 });
                requirements.materials.push({ name: 'engraving_tool', quantity: 1 });
                break;
            case this.surfaceTypes.CRYSTAL:
                requirements.materials.push({ name: 'crystal_shard', quantity: 1 });
                requirements.materials.push({ name: 'precision_tools', quantity: 1 });
                break;
            case this.surfaceTypes.SKIN:
                requirements.materials.push({ name: 'leather', quantity: 1 });
                requirements.materials.push({ name: 'tattooing_needle', quantity: 1 });
                break;
            case this.surfaceTypes.MAGICAL:
                requirements.materials.push({ name: 'ethereal_essence', quantity: 1 });
                requirements.materials.push({ name: 'arcane_focus', quantity: 1 });
                break;
        }

        // Skill requirements based on quality
        const skillLevels = {
            [this.runeQualities.COMMON]: 'novice',
            [this.runeQualities.UNCOMMON]: 'apprentice',
            [this.runeQualities.RARE]: 'journeyman',
            [this.runeQualities.EPIC]: 'adept',
            [this.runeQualities.LEGENDARY]: 'master',
            [this.runeQualities.MYTHICAL]: 'grandmaster'
        };

        requirements.skills.push({
            name: 'runecrafting',
            level: skillLevels[runeData.quality] || 'novice'
        });

        // Time requirements based on complexity
        const timeMultipliers = {
            [this.runeQualities.COMMON]: 1,
            [this.runeQualities.UNCOMMON]: 2,
            [this.runeQualities.RARE]: 4,
            [this.runeQualities.EPIC]: 8,
            [this.runeQualities.LEGENDARY]: 16,
            [this.runeQualities.MYTHICAL]: 32
        };

        requirements.time = timeMultipliers[runeData.quality] * 60; // minutes

        // Difficulty based on quality
        const difficulties = {
            [this.runeQualities.COMMON]: 'easy',
            [this.runeQualities.UNCOMMON]: 'normal',
            [this.runeQualities.RARE]: 'hard',
            [this.runeQualities.EPIC]: 'very_hard',
            [this.runeQualities.LEGENDARY]: 'master',
            [this.runeQualities.MYTHICAL]: 'legendary'
        };

        requirements.difficulty = difficulties[runeData.quality] || 'normal';

        return requirements;
    }

    /**
     * Generate rune comparison
     */
    async generateRuneComparison(runeType, qualities = ['common', 'rare', 'epic']) {
        const comparison = {};

        for (const quality of qualities) {
            const rune = await this.generate({
                subtype: runeType,
                quality: quality
            });

            comparison[quality] = {
                name: rune.data.name,
                power: rune.data.stats.power,
                effectiveness: rune.data.stats.effectiveness,
                amplification: rune.data.stats.amplification,
                performance: this.generateRunePerformanceReport(rune.data)
            };
        }

        return comparison;
    }

    /**
     * Generate themed rune collection
     */
    async generateThemedRuneCollection(theme = 'elemental', count = 8) {
        const collection = [];

        let style, surface, quality;

        switch (theme) {
            case 'elemental':
                style = this.runeStyles.CLASSIC;
                surface = this.surfaceTypes.STONE;
                quality = this.runeQualities.UNCOMMON;
                break;
            case 'ancient':
                style = this.runeStyles.ANCIENT;
                surface = this.surfaceTypes.STONE;
                quality = this.runeQualities.RARE;
                break;
            case 'elven':
                style = this.runeStyles.ELVEN;
                surface = this.surfaceTypes.CRYSTAL;
                quality = this.runeQualities.EPIC;
                break;
            case 'dwarven':
                style = this.runeStyles.DWARVEN;
                surface = this.surfaceTypes.METAL;
                quality = this.runeQualities.UNCOMMON;
                break;
            case 'demonic':
                style = this.runeStyles.DEMONIC;
                surface = this.surfaceTypes.MAGICAL;
                quality = this.runeQualities.LEGENDARY;
                break;
            case 'celestial':
                style = this.runeStyles.CELESTIAL;
                surface = this.surfaceTypes.MAGICAL;
                quality = this.runeQualities.MYTHICAL;
                break;
            default:
                style = this.runeStyles.CLASSIC;
                surface = this.surfaceTypes.STONE;
                quality = this.runeQualities.COMMON;
        }

        const runeTypes = Object.keys(this.runeTemplates);

        for (let i = 0; i < count; i++) {
            const runeType = runeTypes[Math.floor(Math.random() * runeTypes.length)];

            const rune = await this.generate({
                subtype: runeType,
                size: this.runeSizes.MEDIUM,
                quality: quality,
                style: style,
                surface: surface
            });

            collection.push(rune);
        }

        return collection;
    }
}

module.exports = RuneGenerator;
