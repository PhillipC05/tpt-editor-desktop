/**
 * Magical Items Generator - Wands, orbs, runes, spellbooks with enchantment effects
 * Handles generation of magical artifacts with glowing effects and mystical properties
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class MagicalItemsGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Magical items database
        this.magicalDatabase = {
            wand: {
                name: 'Magical Wand',
                materials: ['wood', 'crystal', 'metal', 'bone', 'precious'],
                cores: ['phoenix_feather', 'dragon_heartstring', 'unicorn_hair', 'veela_hair', 'thestral_tail'],
                tips: ['simple', 'ornate', 'gemmed', 'spiked', 'curved'],
                lengths: ['short', 'medium', 'long', 'staff'],
                enchantments: ['fire', 'ice', 'lightning', 'healing', 'illusion']
            },
            orb: {
                name: 'Crystal Orb',
                materials: ['crystal', 'glass', 'gemstone', 'obsidian', 'quartz'],
                sizes: ['small', 'medium', 'large', 'massive'],
                shapes: ['sphere', 'teardrop', 'irregular', 'faceted', 'smooth'],
                powers: ['scrying', 'teleportation', 'mind_reading', 'weather_control', 'time_manipulation'],
                glows: ['blue', 'red', 'green', 'purple', 'white', 'rainbow']
            },
            rune: {
                name: 'Ancient Rune',
                types: ['stone', 'metal', 'crystal', 'wood', 'bone'],
                shapes: ['circular', 'rectangular', 'triangular', 'irregular', 'complex'],
                symbols: ['power', 'protection', 'wisdom', 'destruction', 'creation', 'balance'],
                ages: ['ancient', 'elder', 'primordial', 'eternal'],
                effects: ['glowing', 'pulsing', 'floating', 'humming', 'warm']
            },
            spellbook: {
                name: 'Spellbook',
                covers: ['leather', 'metal', 'crystal', 'wood', 'dragonhide'],
                sizes: ['small', 'medium', 'large', 'tome', 'grimoire'],
                bindings: ['simple', 'ornate', 'magical', 'cursed', 'blessed'],
                schools: ['fire', 'ice', 'lightning', 'necromancy', 'illusion', 'healing'],
                conditions: ['pristine', 'weathered', 'burnt', 'frozen', 'glowing']
            },
            amulet: {
                name: 'Magical Amulet',
                shapes: ['circular', 'triangular', 'pentagonal', 'irregular', 'animal'],
                materials: ['gold', 'silver', 'crystal', 'bone', 'stone'],
                gems: ['ruby', 'sapphire', 'emerald', 'diamond', 'amethyst', 'onyx'],
                enchantments: ['protection', 'strength', 'wisdom', 'luck', 'invisibility'],
                chains: ['simple', 'ornate', 'magical', 'cursed', 'blessed']
            },
            ring: {
                name: 'Magical Ring',
                bands: ['gold', 'silver', 'platinum', 'mithril', 'adamantite'],
                settings: ['simple', 'ornate', 'gemmed', 'plain', 'engraved'],
                gems: ['ruby', 'sapphire', 'emerald', 'diamond', 'amethyst', 'onyx', 'opal'],
                powers: ['invisibility', 'strength', 'teleportation', 'mind_shield', 'elemental_control'],
                sizes: ['small', 'medium', 'large']
            },
            staff: {
                name: 'Magical Staff',
                woods: ['oak', 'ebony', 'yew', 'holly', 'elder'],
                tips: ['crystal', 'orb', 'skull', 'talon', 'flame'],
                lengths: ['short', 'medium', 'long', 'tall'],
                decorations: ['simple', 'ornate', 'runic', 'gemmed', 'natural'],
                elements: ['fire', 'ice', 'lightning', 'earth', 'wind', 'spirit']
            },
            tome: {
                name: 'Ancient Tome',
                covers: ['dragonhide', 'demonhide', 'angel_feathers', 'void_cloth', 'star_silk'],
                sizes: ['small', 'medium', 'large', 'massive'],
                bindings: ['chains', 'tendrils', 'runes', 'crystals', 'void'],
                contents: ['spells', 'prophecies', 'curses', 'blessings', 'forbidden_knowledge'],
                auras: ['holy', 'unholy', 'neutral', 'chaotic', 'lawful']
            }
        };

        // Enchantment effects database
        this.enchantmentEffects = {
            fire: {
                colors: ['#FF4500', '#FF6347', '#FFA500', '#FFD700'],
                particles: 'flames',
                glow: 'intense'
            },
            ice: {
                colors: ['#87CEEB', '#B0E0E6', '#F0F8FF', '#E6E6FA'],
                particles: 'snowflakes',
                glow: 'cool'
            },
            lightning: {
                colors: ['#FFFF00', '#FFA500', '#FFFFFF', '#87CEEB'],
                particles: 'sparks',
                glow: 'electric'
            },
            healing: {
                colors: ['#98FB98', '#90EE90', '#00FF7F', '#32CD32'],
                particles: 'hearts',
                glow: 'gentle'
            },
            illusion: {
                colors: ['#9370DB', '#8A2BE2', '#DA70D6', '#DDA0DD'],
                particles: 'stars',
                glow: 'mystical'
            },
            protection: {
                colors: ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF'],
                particles: 'shields',
                glow: 'golden'
            },
            destruction: {
                colors: ['#DC143C', '#B22222', '#8B0000', '#FF0000'],
                particles: 'skulls',
                glow: 'dark'
            },
            creation: {
                colors: ['#98FB98', '#00FF7F', '#32CD32', '#228B22'],
                particles: 'flowers',
                glow: 'vibrant'
            }
        };

        // Animation frames for magical effects
        this.animationFrames = {
            wand: 6,
            orb: 8,
            rune: 4,
            spellbook: 5,
            amulet: 6,
            ring: 4,
            staff: 7,
            tome: 6
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine magical item type and generate accordingly
        const itemType = config.magicalItemType || 'wand';
        const subType = config.subType || 'wood';

        switch (itemType) {
            case 'wand':
                await this.generateWand(image, config);
                break;
            case 'orb':
                await this.generateOrb(image, config);
                break;
            case 'rune':
                await this.generateRune(image, config);
                break;
            case 'spellbook':
                await this.generateSpellbook(image, config);
                break;
            case 'amulet':
                await this.generateAmulet(image, config);
                break;
            case 'ring':
                await this.generateRing(image, config);
                break;
            case 'staff':
                await this.generateStaff(image, config);
                break;
            case 'tome':
                await this.generateTome(image, config);
                break;
            default:
                await this.generateWand(image, config);
        }
    }

    /**
     * Generate magical wand
     */
    async generateWand(image, config) {
        const { width, height } = image.bitmap;
        const material = config.wandMaterial || 'wood';
        const core = config.wandCore || 'phoenix_feather';
        const tip = config.wandTip || 'simple';
        const length = config.wandLength || 'medium';
        const enchantment = config.wandEnchantment || 'fire';

        const wandData = this.magicalDatabase.wand;

        // Calculate wand dimensions
        const lengthMultiplier = { short: 0.6, medium: 1.0, long: 1.4, staff: 2.0 };
        const multiplier = lengthMultiplier[length];

        const wandLength = Math.floor(60 * multiplier);
        const wandThickness = Math.floor(4 + Math.random() * 4);
        const centerX = Math.floor(width * 0.5);
        const wandY = Math.floor(height - wandLength - 10);

        // Generate wand shaft
        await this.generateWandShaft(image, centerX, wandY, wandLength, wandThickness, material);

        // Generate wand core (magical essence)
        await this.generateWandCore(image, centerX, wandY, wandLength, core);

        // Generate wand tip
        await this.generateWandTip(image, centerX, wandY, wandThickness, tip);

        // Add enchantment effects
        await this.addEnchantmentEffects(image, centerX, wandY, wandLength, enchantment);

        // Add magical glow
        await this.addMagicalGlow(image, centerX, wandY, wandLength, wandThickness, enchantment);
    }

    /**
     * Generate wand shaft
     */
    async generateWandShaft(image, centerX, y, length, thickness, material) {
        const { width, height } = image.bitmap;

        // Draw wand shaft as a vertical line with slight curve
        for (let i = 0; i < length; i++) {
            const shaftY = y + i;
            const curve = Math.sin(i * 0.1) * 2; // Slight curve
            const shaftX = centerX + curve;

            if (shaftX >= 0 && shaftX < width && shaftY >= 0 && shaftY < height) {
                // Draw shaft with thickness
                for (let t = -thickness; t <= thickness; t++) {
                    const pixelX = Math.floor(shaftX) + t;
                    if (pixelX >= 0 && pixelX < width) {
                        const idx = (shaftY * width + pixelX) * 4;
                        const materialColor = this.getMaterialColor(material, 'shaft');
                        image.bitmap.data[idx] = (materialColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (materialColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = materialColor & 0xFF;
                        image.bitmap.data[idx + 3] = 255;
                    }
                }
            }
        }

        // Add material-specific texture
        await this.addMaterialTexture(image, centerX - thickness, y, thickness * 2, length, material);
    }

    /**
     * Generate wand core (magical essence)
     */
    async generateWandCore(image, centerX, y, length, core) {
        const { width, height } = image.bitmap;

        // Draw magical core as subtle inner glow
        for (let i = 0; i < length; i++) {
            const coreY = y + i;
            const coreX = centerX + Math.sin(i * 0.1) * 2;

            if (coreX >= 0 && coreX < width && coreY >= 0 && coreY < height) {
                const idx = (coreY * width + Math.floor(coreX)) * 4;
                const coreColor = this.getCoreColor(core);
                const alpha = Math.floor(150 + Math.random() * 105);

                // Blend with existing color
                const existingR = image.bitmap.data[idx];
                const existingG = image.bitmap.data[idx + 1];
                const existingB = image.bitmap.data[idx + 2];

                image.bitmap.data[idx] = Math.floor((existingR + ((coreColor >> 16) & 0xFF)) * 0.5);
                image.bitmap.data[idx + 1] = Math.floor((existingG + ((coreColor >> 8) & 0xFF)) * 0.5);
                image.bitmap.data[idx + 2] = Math.floor((existingB + (coreColor & 0xFF)) * 0.5);
                image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
            }
        }
    }

    /**
     * Generate wand tip
     */
    async generateWandTip(image, centerX, y, thickness, tip) {
        const { width, height } = image.bitmap;
        const tipSize = thickness * 2;

        switch (tip) {
            case 'simple':
                // Simple rounded tip
                this.utils.drawEllipse(image, centerX, y - tipSize * 0.5, tipSize * 0.5, tipSize * 0.5, 0xFFFFFF);
                break;
            case 'ornate':
                // Ornate tip with details
                this.utils.drawEllipse(image, centerX, y - tipSize * 0.5, tipSize * 0.5, tipSize * 0.5, 0xFFD700);
                // Add decorative elements
                this.utils.drawEllipse(image, centerX - tipSize * 0.3, y - tipSize * 0.3, tipSize * 0.2, tipSize * 0.2, 0xFF6347);
                this.utils.drawEllipse(image, centerX + tipSize * 0.3, y - tipSize * 0.3, tipSize * 0.2, tipSize * 0.2, 0xFF6347);
                break;
            case 'gemmed':
                // Gemmed tip
                this.utils.drawEllipse(image, centerX, y - tipSize * 0.5, tipSize * 0.5, tipSize * 0.5, 0xFF0000);
                // Add smaller gems around
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI * 2) / 4;
                    const gemX = centerX + Math.cos(angle) * tipSize * 0.8;
                    const gemY = y - Math.sin(angle) * tipSize * 0.8;
                    this.utils.drawEllipse(image, gemX, gemY, tipSize * 0.15, tipSize * 0.15, 0x9370DB);
                }
                break;
            case 'spiked':
                // Spiked tip
                this.utils.drawEllipse(image, centerX, y - tipSize * 0.5, tipSize * 0.5, tipSize * 0.5, 0xC0C0C0);
                // Add spikes
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2) / 6;
                    const spikeX = centerX + Math.cos(angle) * tipSize * 0.6;
                    const spikeY = y - Math.sin(angle) * tipSize * 0.6;
                    this.utils.drawEllipse(image, spikeX, spikeY, tipSize * 0.1, tipSize * 0.1, 0x808080);
                }
                break;
            case 'curved':
                // Curved tip
                this.utils.drawEllipse(image, centerX + tipSize * 0.3, y - tipSize * 0.3, tipSize * 0.4, tipSize * 0.6, 0xFFFFFF);
                break;
        }
    }

    /**
     * Generate crystal orb
     */
    async generateOrb(image, config) {
        const { width, height } = image.bitmap;
        const material = config.orbMaterial || 'crystal';
        const size = config.orbSize || 'medium';
        const shape = config.orbShape || 'sphere';
        const power = config.orbPower || 'scrying';
        const glow = config.orbGlow || 'blue';

        const orbData = this.magicalDatabase.orb;

        // Calculate orb dimensions
        const sizeMultiplier = { small: 0.6, medium: 1.0, large: 1.4, massive: 1.8 };
        const multiplier = sizeMultiplier[size];

        const orbSize = Math.floor(40 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.5);

        // Generate orb body
        await this.generateOrbBody(image, centerX, centerY, orbSize, material, shape);

        // Add internal magical effects
        await this.addOrbInternalEffects(image, centerX, centerY, orbSize, power);

        // Add orb glow
        await this.addOrbGlow(image, centerX, centerY, orbSize, glow);

        // Add surface details
        await this.addOrbSurfaceDetails(image, centerX, centerY, orbSize, material);
    }

    /**
     * Generate orb body
     */
    async generateOrbBody(image, centerX, centerY, size, material, shape) {
        const { width, height } = image.bitmap;
        const materialColor = this.getMaterialColor(material, 'orb');

        if (shape === 'sphere') {
            // Perfect sphere
            this.utils.drawEllipse(image, centerX, centerY, size * 0.5, size * 0.5, materialColor);
        } else if (shape === 'teardrop') {
            // Teardrop shape
            this.utils.drawEllipse(image, centerX, centerY - size * 0.2, size * 0.4, size * 0.6, materialColor);
        } else if (shape === 'irregular') {
            // Irregular shape
            const points = [];
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                const radius = size * (0.4 + Math.random() * 0.2);
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                points.push({ x: Math.floor(x), y: Math.floor(y) });
            }
            await this.fillIrregularShape(image, points, materialColor);
        } else if (shape === 'faceted') {
            // Faceted crystal
            this.utils.drawEllipse(image, centerX, centerY, size * 0.5, size * 0.5, materialColor);
            // Add facet lines
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const startX = centerX + Math.cos(angle) * size * 0.3;
                const startY = centerY + Math.sin(angle) * size * 0.3;
                const endX = centerX + Math.cos(angle) * size * 0.5;
                const endY = centerY + Math.sin(angle) * size * 0.5;
                this.utils.drawLine(image, startX, startY, endX, endY, this.utils.adjustBrightness(materialColor, -30));
            }
        } else {
            // Smooth sphere
            this.utils.drawEllipse(image, centerX, centerY, size * 0.5, size * 0.5, materialColor);
        }
    }

    /**
     * Generate ancient rune
     */
    async generateRune(image, config) {
        const { width, height } = image.bitmap;
        const type = config.runeType || 'stone';
        const shape = config.runeShape || 'circular';
        const symbol = config.runeSymbol || 'power';
        const age = config.runeAge || 'ancient';
        const effect = config.runeEffect || 'glowing';

        const runeData = this.magicalDatabase.rune;

        // Calculate rune dimensions
        const runeSize = Math.floor(50 + Math.random() * 30);
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.5);

        // Generate rune base
        await this.generateRuneBase(image, centerX, centerY, runeSize, type, shape);

        // Add rune symbol
        await this.addRuneSymbol(image, centerX, centerY, runeSize, symbol);

        // Add age effects
        await this.addRuneAgeEffects(image, centerX, centerY, runeSize, age);

        // Add magical effect
        await this.addRuneMagicalEffect(image, centerX, centerY, runeSize, effect);
    }

    /**
     * Generate rune base
     */
    async generateRuneBase(image, centerX, centerY, size, type, shape) {
        const materialColor = this.getMaterialColor(type, 'rune');

        if (shape === 'circular') {
            this.utils.drawEllipse(image, centerX, centerY, size * 0.5, size * 0.5, materialColor);
        } else if (shape === 'rectangular') {
            this.utils.drawRectangle(image, centerX - size * 0.4, centerY - size * 0.4, size * 0.8, size * 0.8, materialColor);
        } else if (shape === 'triangular') {
            const points = [
                { x: centerX, y: centerY - size * 0.5 },
                { x: centerX - size * 0.43, y: centerY + size * 0.25 },
                { x: centerX + size * 0.43, y: centerY + size * 0.25 }
            ];
            await this.fillIrregularShape(image, points, materialColor);
        } else {
            // Irregular shape
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const radius = size * (0.3 + Math.random() * 0.3);
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                points.push({ x: Math.floor(x), y: Math.floor(y) });
            }
            await this.fillIrregularShape(image, points, materialColor);
        }

        // Add material texture
        await this.addMaterialTexture(image, centerX - size * 0.4, centerY - size * 0.4, size * 0.8, size * 0.8, type);
    }

    /**
     * Generate spellbook
     */
    async generateSpellbook(image, config) {
        const { width, height } = image.bitmap;
        const cover = config.spellbookCover || 'leather';
        const size = config.spellbookSize || 'medium';
        const binding = config.spellbookBinding || 'simple';
        const school = config.spellbookSchool || 'fire';
        const condition = config.spellbookCondition || 'pristine';

        const bookData = this.magicalDatabase.spellbook;

        // Calculate book dimensions
        const sizeMultiplier = { small: 0.7, medium: 1.0, large: 1.3, tome: 1.6, grimoire: 1.9 };
        const multiplier = sizeMultiplier[size];

        const bookWidth = Math.floor(60 * multiplier);
        const bookHeight = Math.floor(80 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const bookY = Math.floor(height - bookHeight - 10);

        // Generate book cover
        await this.generateBookCover(image, centerX, bookY, bookWidth, bookHeight, cover, condition);

        // Generate book pages
        await this.generateBookPages(image, centerX, bookY, bookWidth, bookHeight);

        // Generate book binding
        await this.generateBookBinding(image, centerX, bookY, bookWidth, bookHeight, binding);

        // Add school-specific magical effects
        await this.addSchoolMagicalEffects(image, centerX, bookY, bookWidth, bookHeight, school);

        // Add condition effects
        await this.addBookConditionEffects(image, centerX, bookY, bookWidth, bookHeight, condition);
    }

    /**
     * Generate book cover
     */
    async generateBookCover(image, centerX, y, width, height, cover, condition) {
        const coverColor = this.getMaterialColor(cover, 'cover');

        // Front cover
        this.utils.drawRectangle(image, centerX - width * 0.45, y + height * 0.05, width * 0.9, height * 0.9, coverColor);

        // Spine
        this.utils.drawRectangle(image, centerX - width * 0.05, y, width * 0.1, height, coverColor);

        // Back cover (slightly visible)
        this.utils.drawRectangle(image, centerX + width * 0.4, y + height * 0.1, width * 0.05, height * 0.8, coverColor);

        // Add cover texture
        await this.addMaterialTexture(image, centerX - width * 0.45, y + height * 0.05, width * 0.9, height * 0.9, cover);
    }

    /**
     * Generate book pages
     */
    async generateBookPages(image, centerX, y, width, height) {
        const pageColor = 0xF5F5DC; // Beige
        const numPages = 5;

        for (let i = 0; i < numPages; i++) {
            const pageOffset = i * 2;
            this.utils.drawRectangle(image, centerX - width * 0.4 + pageOffset, y + height * 0.1,
                                   width * 0.35 - pageOffset, height * 0.8, pageColor);
        }

        // Add page details (runes, text)
        await this.addPageDetails(image, centerX - width * 0.35, y + height * 0.15, width * 0.3, height * 0.7);
    }

    /**
     * Generate book binding
     */
    async generateBookBinding(image, centerX, y, width, height, binding) {
        const bindingColor = this.getMaterialColor('metal', 'binding');

        if (binding === 'simple') {
            // Simple metal corners
            this.utils.drawRectangle(image, centerX - width * 0.45, y + height * 0.05, width * 0.05, height * 0.05, bindingColor);
            this.utils.drawRectangle(image, centerX + width * 0.4, y + height * 0.05, width * 0.05, height * 0.05, bindingColor);
            this.utils.drawRectangle(image, centerX - width * 0.45, y + height * 0.9, width * 0.05, height * 0.05, bindingColor);
            this.utils.drawRectangle(image, centerX + width * 0.4, y + height * 0.9, width * 0.05, height * 0.05, bindingColor);
        } else if (binding === 'ornate') {
            // Ornate metal work
            for (let i = 0; i < 8; i++) {
                const bindingX = centerX - width * 0.47 + (i * width * 0.12);
                const bindingY = y + height * (i % 2 === 0 ? 0.03 : 0.92);
                this.utils.drawEllipse(image, bindingX, bindingY, 3, 3, bindingColor);
            }
        } else if (binding === 'magical') {
            // Magical binding with runes
            for (let i = 0; i < 6; i++) {
                const runeX = centerX - width * 0.45 + (i * width * 0.15);
                const runeY = y + height * 0.5;
                this.utils.drawEllipse(image, runeX, runeY, 4, 4, 0x9370DB);
            }
        }
    }

    /**
     * Helper methods
     */
    getMaterialColor(material, type) {
        const colorMap = {
            wood: { shaft: 0x8B4513, orb: 0xD2691E, cover: 0x8B4513, rune: 0x8B4513 },
            crystal: { shaft: 0xE6E6FA, orb: 0xF0F8FF, cover: 0xE6E6FA, rune: 0xE6E6FA },
            metal: { shaft: 0x696969, orb: 0xC0C0C0, cover: 0x696969, rune: 0x696969 },
            bone: { shaft: 0xF5F5DC, orb: 0xFFFACD, cover: 0xF5F5DC, rune: 0xF5F5DC },
            precious: { shaft: 0xFFD700, orb: 0xFFD700, cover: 0xFFD700, rune: 0xFFD700 },
            stone: { shaft: 0x708090, orb: 0x778899, cover: 0x708090, rune: 0x708090 },
            glass: { shaft: 0xE6E6FA, orb: 0xF0F8FF, cover: 0xE6E6FA, rune: 0xE6E6FA },
            leather: { shaft: 0x8B4513, orb: 0xA0522D, cover: 0x8B4513, rune: 0x8B4513 },
            gold: { shaft: 0xFFD700, orb: 0xFFD700, cover: 0xFFD700, rune: 0xFFD700 },
            silver: { shaft: 0xC0C0C0, orb: 0xC0C0C0, cover: 0xC0C0C0, rune: 0xC0C0C0 }
        };

        return colorMap[material]?.[type] || 0x808080;
    }

    getCoreColor(core) {
        const coreColors = {
            phoenix_feather: 0xFF4500,
            dragon_heartstring: 0xDC143C,
            unicorn_hair: 0x9370DB,
            veela_hair: 0xFF69B4,
            thestral_tail: 0x2F4F4F
        };
        return coreColors[core] || 0xFFFFFF;
    }

    async addEnchantmentEffects(image, centerX, y, length, enchantment) {
        const effectData = this.enchantmentEffects[enchantment];
        if (!effectData) return;

        const { width, height } = image.bitmap;

        // Add particle effects along the wand
        for (let i = 0; i < 8; i++) {
            const particleY = y + Math.floor(Math.random() * length);
            const particleX = centerX + Math.floor((Math.random() - 0.5) * 20);
            const particleColor = this.utils.getColor(effectData.colors[Math.floor(Math.random() * effectData.colors.length)]);

            if (particleX >= 0 && particleX < width && particleY >= 0 && particleY < height) {
                const particleSize = Math.floor(2 + Math.random() * 3);
                this.utils.drawEllipse(image, particleX, particleY, particleSize, particleSize, particleColor);
            }
        }
    }

    async addMagicalGlow(image, centerX, y, length, thickness, enchantment) {
        const effectData = this.enchantmentEffects[enchantment];
        if (!effectData) return;

        const { width, height } = image.bitmap;
        const glowColor = this.utils.getColor(effectData.colors[0]);

        // Add glow around the wand
        for (let i = 0; i < length; i++) {
            const glowY = y + i;
            const glowX = centerX + Math.sin(i * 0.1) * 2;

            for (let dx = -thickness * 2; dx <= thickness * 2; dx++) {
                for (let dy = -thickness * 2; dy <= thickness * 2; dy++) {
                    const pixelX = Math.floor(glowX) + dx;
                    const pixelY = glowY + dy;

                    if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= thickness * 2) {
                            const idx = (pixelY * width + pixelX) * 4;
                            const alpha = Math.floor(100 * (1 - distance / (thickness * 2)));
                            image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                        }
                    }
                }
            }
        }
    }

    async addOrbInternalEffects(image, centerX, centerY, size, power) {
        const { width, height } = image.bitmap;

        // Add internal magical swirls or effects based on power
        switch (power) {
            case 'scrying':
                // Add vision-like swirls
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5;
                    const radius = size * 0.2;
                    const swirlX = centerX + Math.cos(angle) * radius;
                    const swirlY = centerY + Math.sin(angle) * radius;
                    this.utils.drawEllipse(image, swirlX, swirlY, size * 0.1, size * 0.1, 0x87CEEB);
                }
                break;
            case 'teleportation':
                // Add portal-like rings
                for (let r = 1; r <= 3; r++) {
                    const ringRadius = (size * 0.3 * r) / 3;
                    for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
                        const ringX = centerX + Math.cos(angle) * ringRadius;
                        const ringY = centerY + Math.sin(angle) * ringRadius;
                        if (ringX >= 0 && ringX < width && ringY >= 0 && ringY < height) {
                            const idx = (Math.floor(ringY) * width + Math.floor(ringX)) * 4;
                            image.bitmap.data[idx + 3] = Math.floor(150 + Math.random() * 105);
                        }
                    }
                }
                break;
        }
    }

    async addOrbGlow(image, centerX, centerY, size, glow) {
        const { width, height } = image.bitmap;
        const glowColors = {
            blue: 0x87CEEB,
            red: 0xFF6347,
            green: 0x32CD32,
            purple: 0x9370DB,
            white: 0xFFFFFF,
            rainbow: 0xFF6347 // Will be modified for rainbow effect
        };

        const baseGlowColor = glowColors[glow] || 0xFFFFFF;

        // Add glow around the orb
        for (let dy = -size; dy <= size; dy++) {
            for (let dx = -size; dx <= size; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= size * 0.6 && distance > size * 0.4) {
                    const glowX = centerX + dx;
                    const glowY = centerY + dy;

                    if (glowX >= 0 && glowX < width && glowY >= 0 && glowY < height) {
                        const idx = (Math.floor(glowY) * width + Math.floor(glowX)) * 4;
                        let glowColor = baseGlowColor;

                        if (glow === 'rainbow') {
                            const angle = Math.atan2(dy, dx);
                            const hue = (angle + Math.PI) / (Math.PI * 2);
                            glowColor = this.hslToRgb(hue, 1, 0.5);
                        }

                        const alpha = Math.floor(150 * (1 - (distance - size * 0.4) / (size * 0.2)));
                        if (alpha > 0) {
                            image.bitmap.data[idx] = (glowColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (glowColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = glowColor & 0xFF;
                            image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                        }
                    }
                }
            }
        }
    }

    async addOrbSurfaceDetails(image, centerX, centerY, size, material) {
        if (material === 'crystal' || material === 'gemstone') {
            // Add crystal facets
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                const startX = centerX + Math.cos(angle) * size * 0.3;
                const startY = centerY + Math.sin(angle) * size * 0.3;
                const endX = centerX + Math.cos(angle) * size * 0.5;
                const endY = centerY + Math.sin(angle) * size * 0.5;
                this.utils.drawLine(image, startX, startY, endX, endY, this.utils.adjustBrightness(this.getMaterialColor(material, 'orb'), -30));
            }
        }
    }

    async addRuneSymbol(image, centerX, centerY, size, symbol) {
        const symbolColor = 0xFFD700; // Gold

        // Draw different symbols based on type
        switch (symbol) {
            case 'power':
                // Draw a lightning bolt symbol
                this.utils.drawLine(image, centerX, centerY - size * 0.2, centerX, centerY + size * 0.2, symbolColor);
                this.utils.drawLine(image, centerX, centerY - size * 0.2, centerX - size * 0.1, centerY, symbolColor);
                this.utils.drawLine(image, centerX, centerY - size * 0.2, centerX + size * 0.1, centerY, symbolColor);
                break;
            case 'protection':
                // Draw a shield symbol
                this.utils.drawEllipse(image, centerX, centerY, size * 0.15, size * 0.2, symbolColor);
                this.utils.drawLine(image, centerX - size * 0.15, centerY - size * 0.1, centerX, centerY - size * 0.25, symbolColor);
                this.utils.drawLine(image, centerX + size * 0.15, centerY - size * 0.1, centerX, centerY - size * 0.25, symbolColor);
                break;
            case 'wisdom':
                // Draw an eye symbol
                this.utils.drawEllipse(image, centerX, centerY, size * 0.2, size * 0.1, symbolColor);
                this.utils.drawEllipse(image, centerX, centerY, size * 0.08, size * 0.08, 0x000000);
                break;
            case 'destruction':
                // Draw a skull symbol
                this.utils.drawEllipse(image, centerX, centerY - size * 0.1, size * 0.15, size * 0.1, symbolColor);
                this.utils.drawEllipse(image, centerX - size * 0.08, centerY + size * 0.05, size * 0.05, size * 0.08, symbolColor);
                this.utils.drawEllipse(image, centerX + size * 0.08, centerY + size * 0.05, size * 0.05, size * 0.08, symbolColor);
                break;
        }
    }

    async addRuneAgeEffects(image, centerX, centerY, size, age) {
        const { width, height } = image.bitmap;

        if (age === 'ancient' || age === 'elder') {
            // Add cracks and weathering
            for (let i = 0; i < 10; i++) {
                const crackX = centerX + Math.floor((Math.random() - 0.5) * size * 0.8);
                const crackY = centerY + Math.floor((Math.random() - 0.5) * size * 0.8);
                const crackLength = Math.floor(5 + Math.random() * 15);

                for (let j = 0; j < crackLength; j++) {
                    const cx = crackX + Math.floor((Math.random() - 0.5) * 4);
                    const cy = crackY + j;
                    if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                        const idx = (cy * width + cx) * 4;
                        image.bitmap.data[idx] = Math.max(image.bitmap.data[idx], 100);
                        image.bitmap.data[idx + 1] = Math.max(image.bitmap.data[idx + 1], 100);
                        image.bitmap.data[idx + 2] = Math.max(image.bitmap.data[idx + 2], 100);
                    }
                }
            }
        }

        if (age === 'primordial' || age === 'eternal') {
            // Add glowing runes around the edge
            for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI * 2) / 12;
                const runeX = centerX + Math.cos(angle) * size * 0.45;
                const runeY = centerY + Math.sin(angle) * size * 0.45;
                this.utils.drawEllipse(image, runeX, runeY, 3, 3, 0xFFD700);
            }
        }
    }

    async addRuneMagicalEffect(image, centerX, centerY, size, effect) {
        const { width, height } = image.bitmap;

        switch (effect) {
            case 'glowing':
                // Add soft glow
                for (let dy = -size * 0.3; dy <= size * 0.3; dy++) {
                    for (let dx = -size * 0.3; dx <= size * 0.3; dx++) {
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= size * 0.3) {
                            const glowX = centerX + dx;
                            const glowY = centerY + dy;
                            if (glowX >= 0 && glowX < width && glowY >= 0 && glowY < height) {
                                const idx = (Math.floor(glowY) * width + Math.floor(glowX)) * 4;
                                const alpha = Math.floor(100 * (1 - distance / (size * 0.3)));
                                image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                            }
                        }
                    }
                }
                break;
            case 'pulsing':
                // Add pulsing effect (will be animated)
                this.utils.drawEllipse(image, centerX, centerY, size * 0.4, size * 0.4, 0x9370DB);
                break;
            case 'floating':
                // Add floating particles
                for (let i = 0; i < 6; i++) {
                    const particleX = centerX + Math.floor((Math.random() - 0.5) * size * 0.8);
                    const particleY = centerY + Math.floor((Math.random() - 0.5) * size * 0.8);
                    this.utils.drawEllipse(image, particleX, particleY, 2, 2, 0xFFFFFF);
                }
                break;
        }
    }

    async addPageDetails(image, x, y, width, height) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        // Add random runes and symbols to pages
        for (let i = 0; i < 20; i++) {
            const runeX = x + Math.floor(Math.random() * width);
            const runeY = y + Math.floor(Math.random() * height);

            if (runeX >= 0 && runeX < imgWidth && runeY >= 0 && runeY < imgHeight) {
                const runeSize = Math.floor(1 + Math.random() * 2);
                this.utils.drawEllipse(image, runeX, runeY, runeSize, runeSize, 0x000000);
            }
        }
    }

    async addSchoolMagicalEffects(image, centerX, y, width, height, school) {
        const effectData = this.enchantmentEffects[school];
        if (!effectData) return;

        // Add school-specific magical effects around the book
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            const effectX = centerX + Math.cos(angle) * width * 0.6;
            const effectY = y + Math.sin(angle) * height * 0.6;
            const effectColor = this.utils.getColor(effectData.colors[Math.floor(Math.random() * effectData.colors.length)]);

            this.utils.drawEllipse(image, effectX, effectY, 3, 3, effectColor);
        }
    }

    async addBookConditionEffects(image, centerX, y, width, height, condition) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        switch (condition) {
            case 'weathered':
                // Add wear and tear
                for (let i = 0; i < 15; i++) {
                    const wearX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const wearY = y + Math.floor(Math.random() * height);
                    if (wearX >= 0 && wearX < imgWidth && wearY >= 0 && wearY < imgHeight) {
                        const idx = (wearY * imgWidth + wearX) * 4;
                        image.bitmap.data[idx] = Math.max(image.bitmap.data[idx], 150);
                        image.bitmap.data[idx + 1] = Math.max(image.bitmap.data[idx + 1], 150);
                        image.bitmap.data[idx + 2] = Math.max(image.bitmap.data[idx + 2], 150);
                    }
                }
                break;
            case 'burnt':
                // Add burn marks
                for (let i = 0; i < 8; i++) {
                    const burnX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                    const burnY = y + Math.floor(Math.random() * height * 0.8);
                    this.utils.drawEllipse(image, burnX, burnY, 5, 5, 0x2F1B14);
                }
                break;
            case 'glowing':
                // Add magical glow
                for (let dy = -height * 0.2; dy <= height * 0.2; dy++) {
                    for (let dx = -width * 0.2; dx <= width * 0.2; dx++) {
                        const glowX = centerX + dx;
                        const glowY = y + dy;
                        if (glowX >= 0 && glowX < imgWidth && glowY >= 0 && glowY < imgHeight) {
                            const idx = (Math.floor(glowY) * imgWidth + Math.floor(glowX)) * 4;
                            const alpha = Math.floor(80 * (1 - Math.abs(dx) / (width * 0.2)));
                            image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                        }
                    }
                }
                break;
        }
    }

    // Additional methods for other magical items
    async generateAmulet(image, config) {
        const { width, height } = image.bitmap;
        const shape = config.amuletShape || 'circular';
        const material = config.amuletMaterial || 'gold';
        const gem = config.amuletGem || 'ruby';
        const enchantment = config.amuletEnchantment || 'protection';
        const chain = config.amuletChain || 'simple';

        // Calculate amulet dimensions
        const amuletSize = Math.floor(30 + Math.random() * 20);
        const centerX = Math.floor(width * 0.5);
        const amuletY = Math.floor(height * 0.4);

        // Generate chain
        await this.generateAmuletChain(image, centerX, amuletY, amuletSize, chain);

        // Generate amulet body
        await this.generateAmuletBody(image, centerX, amuletY, amuletSize, shape, material);

        // Add gem
        await this.addAmuletGem(image, centerX, amuletY, amuletSize, gem);

        // Add enchantment effects
        await this.addAmuletEnchantment(image, centerX, amuletY, amuletSize, enchantment);
    }

    async generateRing(image, config) {
        const { width, height } = image.bitmap;
        const band = config.ringBand || 'gold';
        const setting = config.ringSetting || 'simple';
        const gem = config.ringGem || 'diamond';
        const power = config.ringPower || 'invisibility';
        const size = config.ringSize || 'medium';

        // Calculate ring dimensions
        const ringSize = { small: 20, medium: 25, large: 30 }[size] || 25;
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.5);

        // Generate ring band
        await this.generateRingBand(image, centerX, centerY, ringSize, band);

        // Generate setting
        await this.generateRingSetting(image, centerX, centerY, ringSize, setting);

        // Add gem
        await this.addRingGem(image, centerX, centerY, ringSize, gem);

        // Add power effects
        await this.addRingPower(image, centerX, centerY, ringSize, power);
    }

    async generateStaff(image, config) {
        const { width, height } = image.bitmap;
        const wood = config.staffWood || 'oak';
        const tip = config.staffTip || 'crystal';
        const length = config.staffLength || 'long';
        const decoration = config.staffDecoration || 'simple';
        const element = config.staffElement || 'fire';

        // Calculate staff dimensions
        const lengthMultiplier = { short: 0.7, medium: 1.0, long: 1.3, tall: 1.6 };
        const multiplier = lengthMultiplier[length];

        const staffLength = Math.floor(100 * multiplier);
        const staffThickness = Math.floor(6 + Math.random() * 4);
        const centerX = Math.floor(width * 0.5);
        const staffY = Math.floor(height - staffLength - 10);

        // Generate staff shaft
        await this.generateStaffShaft(image, centerX, staffY, staffLength, staffThickness, wood);

        // Generate staff tip
        await this.generateStaffTip(image, centerX, staffY, staffThickness, tip);

        // Add decorations
        await this.addStaffDecorations(image, centerX, staffY, staffLength, decoration);

        // Add elemental effects
        await this.addElementalEffects(image, centerX, staffY, staffLength, element);
    }

    async generateTome(image, config) {
        const { width, height } = image.bitmap;
        const cover = config.tomeCover || 'dragonhide';
        const size = config.tomeSize || 'large';
        const binding = config.tomeBinding || 'chains';
        const content = config.tomeContent || 'spells';
        const aura = config.tomeAura || 'holy';

        // Calculate tome dimensions
        const sizeMultiplier = { small: 0.7, medium: 1.0, large: 1.3, massive: 1.6 };
        const multiplier = sizeMultiplier[size];

        const tomeWidth = Math.floor(70 * multiplier);
        const tomeHeight = Math.floor(90 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const tomeY = Math.floor(height - tomeHeight - 10);

        // Generate tome cover
        await this.generateTomeCover(image, centerX, tomeY, tomeWidth, tomeHeight, cover);

        // Generate tome binding
        await this.generateTomeBinding(image, centerX, tomeY, tomeWidth, tomeHeight, binding);

        // Add content effects
        await this.addTomeContent(image, centerX, tomeY, tomeWidth, tomeHeight, content);

        // Add aura
        await this.addTomeAura(image, centerX, tomeY, tomeWidth, tomeHeight, aura);
    }

    // Helper methods for amulet
    async generateAmuletChain(image, centerX, y, size, chain) {
        const chainLength = Math.floor(size * 2);
        const chainColor = this.getMaterialColor(chain === 'simple' ? 'silver' : 'gold', 'chain');

        for (let i = 0; i < chainLength; i++) {
            const chainY = y - size - i;
            const chainX = centerX + Math.sin(i * 0.5) * 3;
            this.utils.drawEllipse(image, chainX, chainY, 2, 2, chainColor);
        }
    }

    async generateAmuletBody(image, centerX, y, size, shape, material) {
        const materialColor = this.getMaterialColor(material, 'amulet');

        switch (shape) {
            case 'circular':
                this.utils.drawEllipse(image, centerX, y, size * 0.4, size * 0.4, materialColor);
                break;
            case 'triangular':
                const points = [
                    { x: centerX, y: y - size * 0.4 },
                    { x: centerX - size * 0.35, y: y + size * 0.2 },
                    { x: centerX + size * 0.35, y: y + size * 0.2 }
                ];
                await this.fillIrregularShape(image, points, materialColor);
                break;
            case 'pentagonal':
                // Draw pentagon
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5 - Math.PI * 0.5;
                    const nextAngle = ((i + 1) * Math.PI * 2) / 5 - Math.PI * 0.5;
                    const x1 = centerX + Math.cos(angle) * size * 0.4;
                    const y1 = y + Math.sin(angle) * size * 0.4;
                    const x2 = centerX + Math.cos(nextAngle) * size * 0.4;
                    const y2 = y + Math.sin(nextAngle) * size * 0.4;
                    this.utils.drawLine(image, x1, y1, x2, y2, materialColor);
                }
                break;
        }
    }

    async addAmuletGem(image, centerX, y, size, gem) {
        const gemColor = this.getGemColor(gem);
        this.utils.drawEllipse(image, centerX, y, size * 0.2, size * 0.2, gemColor);
    }

    async addAmuletEnchantment(image, centerX, y, size, enchantment) {
        const effectData = this.enchantmentEffects[enchantment];
        if (!effectData) return;

        // Add enchantment particles around amulet
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const particleX = centerX + Math.cos(angle) * size * 0.6;
            const particleY = y + Math.sin(angle) * size * 0.6;
            const particleColor = this.utils.getColor(effectData.colors[Math.floor(Math.random() * effectData.colors.length)]);
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, particleColor);
        }
    }

    // Helper methods for ring
    async generateRingBand(image, centerX, centerY, size, band) {
        const bandColor = this.getMaterialColor(band, 'ring');
        this.utils.drawEllipse(image, centerX, centerY, size * 0.4, size * 0.4, bandColor);
        this.utils.drawEllipse(image, centerX, centerY, size * 0.3, size * 0.3, 0x000000); // Inner hole
    }

    async generateRingSetting(image, centerX, centerY, size, setting) {
        if (setting === 'gemmed' || setting === 'ornate') {
            // Add prongs or setting details
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4;
                const prongX = centerX + Math.cos(angle) * size * 0.25;
                const prongY = centerY + Math.sin(angle) * size * 0.25;
                this.utils.drawRectangle(image, prongX - 1, prongY - 1, 2, 2, 0xFFD700);
            }
        }
    }

    async addRingGem(image, centerX, centerY, size, gem) {
        const gemColor = this.getGemColor(gem);
        this.utils.drawEllipse(image, centerX, centerY, size * 0.15, size * 0.15, gemColor);
    }

    async addRingPower(image, centerX, centerY, size, power) {
        // Add subtle power effects
        const powerColor = this.getPowerColor(power);
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const effectX = centerX + Math.cos(angle) * size * 0.5;
            const effectY = centerY + Math.sin(angle) * size * 0.5;
            this.utils.drawEllipse(image, effectX, effectY, 1, 1, powerColor);
        }
    }

    // Helper methods for staff
    async generateStaffShaft(image, centerX, y, length, thickness, wood) {
        const woodColor = this.getMaterialColor(wood, 'staff');

        for (let i = 0; i < length; i++) {
            const staffY = y + i;
            const staffX = centerX + Math.sin(i * 0.05) * 2; // Slight curve

            for (let t = -thickness; t <= thickness; t++) {
                const pixelX = Math.floor(staffX) + t;
                if (pixelX >= 0 && pixelX < image.bitmap.width) {
                    const idx = (staffY * image.bitmap.width + pixelX) * 4;
                    image.bitmap.data[idx] = (woodColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (woodColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = woodColor & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }
    }

    async generateStaffTip(image, centerX, y, thickness, tip) {
        const tipSize = thickness * 3;

        switch (tip) {
            case 'crystal':
                this.utils.drawEllipse(image, centerX, y - tipSize * 0.5, tipSize * 0.5, tipSize * 0.5, 0xE6E6FA);
                break;
            case 'orb':
                this.utils.drawEllipse(image, centerX, y - tipSize * 0.5, tipSize * 0.4, tipSize * 0.4, 0x9370DB);
                break;
            case 'skull':
                // Simple skull shape
                this.utils.drawEllipse(image, centerX, y - tipSize * 0.3, tipSize * 0.3, tipSize * 0.2, 0xFFFFFF);
                this.utils.drawEllipse(image, centerX - tipSize * 0.15, y - tipSize * 0.1, tipSize * 0.1, tipSize * 0.15, 0xFFFFFF);
                this.utils.drawEllipse(image, centerX + tipSize * 0.15, y - tipSize * 0.1, tipSize * 0.1, tipSize * 0.15, 0xFFFFFF);
                break;
            case 'flame':
                // Flame shape
                const points = [
                    { x: centerX, y: y - tipSize * 0.6 },
                    { x: centerX - tipSize * 0.2, y: y - tipSize * 0.2 },
                    { x: centerX + tipSize * 0.2, y: y - tipSize * 0.2 },
                    { x: centerX, y: y + tipSize * 0.1 }
                ];
                await this.fillIrregularShape(image, points, 0xFF4500);
                break;
        }
    }

    async addStaffDecorations(image, centerX, y, length, decoration) {
        if (decoration === 'runic' || decoration === 'ornate') {
            // Add runes along the staff
            for (let i = 0; i < 8; i++) {
                const runeY = y + (i + 1) * (length * 0.8) / 9;
                const runeX = centerX + Math.sin(i * 0.8) * 8;
                this.utils.drawEllipse(image, runeX, runeY, 3, 3, 0xFFD700);
            }
        }
    }

    async addElementalEffects(image, centerX, y, length, element) {
        const effectData = this.enchantmentEffects[element];
        if (!effectData) return;

        // Add elemental particles along the staff
        for (let i = 0; i < 10; i++) {
            const particleY = y + Math.floor(Math.random() * length);
            const particleX = centerX + Math.floor((Math.random() - 0.5) * 16);
            const particleColor = this.utils.getColor(effectData.colors[Math.floor(Math.random() * effectData.colors.length)]);
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, particleColor);
        }
    }

    // Helper methods for tome
    async generateTomeCover(image, centerX, y, width, height, cover) {
        const coverColor = this.getMaterialColor(cover, 'tome');

        // Main cover
        this.utils.drawRectangle(image, centerX - width * 0.45, y, width * 0.9, height, coverColor);

        // Add cover texture
        await this.addMaterialTexture(image, centerX - width * 0.45, y, width * 0.9, height, cover);
    }

    async generateTomeBinding(image, centerX, y, width, height, binding) {
        switch (binding) {
            case 'chains':
                // Add chain bindings
                for (let i = 0; i < 6; i++) {
                    const chainY = y + (i + 1) * (height * 0.8) / 7;
                    this.utils.drawRectangle(image, centerX - width * 0.5, chainY, width, 2, 0x696969);
                }
                break;
            case 'runes':
                // Add rune bindings
                for (let i = 0; i < 8; i++) {
                    const runeY = y + (i + 1) * (height * 0.8) / 9;
                    const runeX = centerX + Math.sin(i * 0.8) * width * 0.4;
                    this.utils.drawEllipse(image, runeX, runeY, 4, 4, 0xFFD700);
                }
                break;
        }
    }

    async addTomeContent(image, centerX, y, width, height, content) {
        // Add content-specific effects
        switch (content) {
            case 'curses':
                // Add dark symbols
                for (let i = 0; i < 15; i++) {
                    const symbolX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const symbolY = y + Math.floor(Math.random() * height * 0.8);
                    this.utils.drawEllipse(image, symbolX, symbolY, 2, 2, 0x8B0000);
                }
                break;
            case 'forbidden_knowledge':
                // Add mysterious symbols
                for (let i = 0; i < 12; i++) {
                    const symbolX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const symbolY = y + Math.floor(Math.random() * height * 0.8);
                    this.utils.drawEllipse(image, symbolX, symbolY, 3, 3, 0x9370DB);
                }
                break;
        }
    }

    async addTomeAura(image, centerX, y, width, height, aura) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const auraColors = {
            holy: 0xFFD700,
            unholy: 0x8B0000,
            neutral: 0x9370DB,
            chaotic: 0xFF6347,
            lawful: 0x4169E1
        };

        const auraColor = auraColors[aura] || 0xFFFFFF;

        // Add aura glow around the tome
        for (let dy = -height * 0.3; dy <= height * 0.3; dy++) {
            for (let dx = -width * 0.3; dx <= width * 0.3; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= Math.max(width, height) * 0.3) {
                    const glowX = centerX + dx;
                    const glowY = y + dy;
                    if (glowX >= 0 && glowX < imgWidth && glowY >= 0 && glowY < imgHeight) {
                        const idx = (Math.floor(glowY) * imgWidth + Math.floor(glowX)) * 4;
                        const alpha = Math.floor(120 * (1 - distance / (Math.max(width, height) * 0.3)));
                        if (alpha > 0) {
                            image.bitmap.data[idx] = (auraColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (auraColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = auraColor & 0xFF;
                            image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                        }
                    }
                }
            }
        }
    }

    // Utility methods
    getGemColor(gem) {
        const gemColors = {
            ruby: 0xDC143C,
            sapphire: 0x000080,
            emerald: 0x006400,
            diamond: 0xF0F8FF,
            amethyst: 0x9370DB,
            onyx: 0x000000,
            opal: 0xFFE4E1
        };
        return gemColors[gem] || 0xFFFFFF;
    }

    getPowerColor(power) {
        const powerColors = {
            invisibility: 0xE6E6FA,
            strength: 0xDC143C,
            teleportation: 0x9370DB,
            mind_shield: 0x4169E1,
            elemental_control: 0xFF6347
        };
        return powerColors[power] || 0xFFFFFF;
    }

    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return Math.floor(r * 255) << 16 | Math.floor(g * 255) << 8 | Math.floor(b * 255);
    }

    async addMaterialTexture(image, x, y, width, height, material) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        // Add material-specific texture effects
        for (let gy = y; gy < y + height; gy += 4) {
            if (gy >= 0 && gy < imgHeight) {
                for (let gx = x; gx < x + width; gx += 4) {
                    if (gx >= 0 && gx < imgWidth && Math.random() < 0.3) {
                        const idx = (gy * imgWidth + gx) * 4;
                        const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                        if (currentColor !== 0) {
                            // Apply subtle texture variation
                            const variation = Math.floor((Math.random() - 0.5) * 40);
                            image.bitmap.data[idx] = Math.max(0, Math.min(255, image.bitmap.data[idx] + variation));
                            image.bitmap.data[idx + 1] = Math.max(0, Math.min(255, image.bitmap.data[idx + 1] + variation));
                            image.bitmap.data[idx + 2] = Math.max(0, Math.min(255, image.bitmap.data[idx + 2] + variation));
                        }
                    }
                }
            }
        }
    }

    async fillIrregularShape(image, points, color) {
        const { width, height } = image.bitmap;

        // Find bounding box
        let minX = width, maxX = 0, minY = height, maxY = 0;
        for (const point of points) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }

        // Scanline fill
        for (let y = minY; y <= maxY; y++) {
            const intersections = [];

            // Find intersections with scanline
            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                const p2 = points[(i + 1) % points.length];

                if ((p1.y <= y && p2.y > y) || (p1.y > y && p2.y <= y)) {
                    const x = p1.x + (y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y);
                    intersections.push(Math.floor(x));
                }
            }

            // Sort intersections
            intersections.sort((a, b) => a - b);

            // Fill between pairs of intersections
            for (let i = 0; i < intersections.length; i += 2) {
                if (i + 1 < intersections.length) {
                    const startX = Math.max(0, intersections[i]);
                    const endX = Math.min(width - 1, intersections[i + 1]);

                    for (let x = startX; x <= endX; x++) {
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const idx = (y * width + x) * 4;
                            image.bitmap.data[idx] = (color >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = color & 0xFF;
                            image.bitmap.data[idx + 3] = 255;
                        }
                    }
                }
            }
        }
    }
}

module.exports = MagicalItemsGenerator;
