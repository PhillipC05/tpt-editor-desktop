/**
 * Shop Sign Generator - Complete shop sign and business marker sprite generation system
 * Generates various types of shop signs, business markers, and commercial indicators
 */

const Jimp = require('jimp');
const path = require('path');

class ShopSignGenerator {
    constructor() {
        this.shopTypes = {
            WEAPON_SHOP: 'weapon_shop',
            TAVERN: 'tavern',
            MAGIC_SHOP: 'magic_shop',
            GENERAL_STORE: 'general_store',
            INN: 'inn',
            BLACKSMITH: 'blacksmith',
            APOTHECARY: 'apothecary',
            JEWELER: 'jeweler',
            TAILOR: 'tailor',
            BAKER: 'baker',
            BUTCHER: 'butcher',
            ALCHEMIST: 'alchemist',
            BOOKSTORE: 'bookstore',
            STABLES: 'stables'
        };

        this.signSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            EXTRA_LARGE: 'extra_large'
        };

        this.signQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.signStyles = {
            CLASSIC: 'classic',
            FANTASY: 'fantasy',
            MEDIEVAL: 'medieval',
            MODERN: 'modern',
            MAGICAL: 'magical',
            RUSTIC: 'rustic'
        };

        this.hangingTypes = {
            WOODEN_SIGN: 'wooden_sign',
            METAL_SIGN: 'metal_sign',
            STONE_SIGN: 'stone_sign',
            MAGICAL_SIGN: 'magical_sign',
            BANNER: 'banner',
            TOTEM: 'totem'
        };

        // Shop sign templates
        this.shopSignTemplates = {
            [this.shopTypes.WEAPON_SHOP]: {
                name: 'Weapon Shop Sign',
                description: 'Sign for a weapon and armor shop',
                baseValue: 25,
                visibility: 20,
                appeal: 15,
                features: ['sword_and_shield', 'weapon_motifs', 'battle_ready', 'armory'],
                symbols: ['sword', 'shield', 'crossed_axes', 'helmet']
            },
            [this.shopTypes.TAVERN]: {
                name: 'Tavern Sign',
                description: 'Sign for a tavern or inn',
                baseValue: 30,
                visibility: 25,
                appeal: 20,
                features: ['mugs_and_barrels', 'food_motifs', 'social_hub', 'hospitality'],
                symbols: ['beer_mug', 'barrel', 'roast_chicken', 'tankard']
            },
            [this.shopTypes.MAGIC_SHOP]: {
                name: 'Magic Shop Sign',
                description: 'Sign for a magical items shop',
                baseValue: 40,
                visibility: 18,
                appeal: 25,
                features: ['stars_and_runes', 'magical_motifs', 'mystical', 'enchanted'],
                symbols: ['star', 'rune', 'wand', 'crystal_ball']
            },
            [this.shopTypes.GENERAL_STORE]: {
                name: 'General Store Sign',
                description: 'Sign for a general merchandise store',
                baseValue: 20,
                visibility: 22,
                appeal: 12,
                features: ['various_goods', 'merchant_motifs', 'versatile', 'practical'],
                symbols: ['scales', 'goods_pile', 'merchant_bag', 'open_chest']
            },
            [this.shopTypes.INN]: {
                name: 'Inn Sign',
                description: 'Sign for an inn or lodging house',
                baseValue: 35,
                visibility: 24,
                appeal: 18,
                features: ['beds_and_keys', 'rest_motifs', 'accommodation', 'comfort'],
                symbols: ['bed', 'key', 'candle', 'rest_symbol']
            },
            [this.shopTypes.BLACKSMITH]: {
                name: 'Blacksmith Sign',
                description: 'Sign for a blacksmith forge',
                baseValue: 28,
                visibility: 19,
                appeal: 14,
                features: ['anvil_and_hammer', 'forge_motifs', 'craftsmanship', 'metalwork'],
                symbols: ['anvil', 'hammer', 'tongs', 'horseshoe']
            },
            [this.shopTypes.APOTHECARY]: {
                name: 'Apothecary Sign',
                description: 'Sign for an apothecary or herbalist',
                baseValue: 32,
                visibility: 17,
                appeal: 16,
                features: ['potions_and_herbs', 'healing_motifs', 'medicinal', 'natural'],
                symbols: ['mortar_pestle', 'herb_bundle', 'potion_bottle', 'healing_symbol']
            },
            [this.shopTypes.JEWELER]: {
                name: 'Jeweler Sign',
                description: 'Sign for a jewelry and gem shop',
                baseValue: 45,
                visibility: 16,
                appeal: 22,
                features: ['gems_and_jewelry', 'luxury_motifs', 'precious', 'elegant'],
                symbols: ['gem', 'necklace', 'ring', 'crown']
            },
            [this.shopTypes.TAILOR]: {
                name: 'Tailor Sign',
                description: 'Sign for a tailor or clothier',
                baseValue: 22,
                visibility: 18,
                appeal: 13,
                features: ['needles_and_thread', 'cloth_motifs', 'fashion', 'sewing'],
                symbols: ['needle', 'spool', 'scissors', 'measuring_tape']
            },
            [this.shopTypes.BAKER]: {
                name: 'Baker Sign',
                description: 'Sign for a bakery',
                baseValue: 18,
                visibility: 21,
                appeal: 17,
                features: ['bread_and_pastries', 'food_motifs', 'fresh_baked', 'aromatic'],
                symbols: ['loaf_bread', 'croissant', 'rolling_pin', 'oven']
            },
            [this.shopTypes.BUTCHER]: {
                name: 'Butcher Sign',
                description: 'Sign for a butcher shop',
                baseValue: 24,
                visibility: 20,
                appeal: 11,
                features: ['meat_and_cleavers', 'butcher_motifs', 'fresh_meat', 'cuts'],
                symbols: ['cleaver', 'meat_hook', 'sausage', 'steak']
            },
            [this.shopTypes.ALCHEMIST]: {
                name: 'Alchemist Sign',
                description: 'Sign for an alchemist laboratory',
                baseValue: 38,
                visibility: 15,
                appeal: 19,
                features: ['flasks_and_retorts', 'chemical_motifs', 'experimental', 'arcane'],
                symbols: ['flask', 'retort', 'bunsen_burner', 'chemical_symbol']
            },
            [this.shopTypes.BOOKSTORE]: {
                name: 'Bookstore Sign',
                description: 'Sign for a bookstore or library',
                baseValue: 26,
                visibility: 16,
                appeal: 15,
                features: ['books_and_scrolls', 'knowledge_motifs', 'literary', 'scholarly'],
                symbols: ['open_book', 'scroll', 'quill', 'spectacles']
            },
            [this.shopTypes.STABLES]: {
                name: 'Stables Sign',
                description: 'Sign for horse stables or mount services',
                baseValue: 27,
                visibility: 19,
                appeal: 12,
                features: ['horse_and_hay', 'stable_motifs', 'equine', 'mount_care'],
                symbols: ['horse_head', 'hay_bale', 'bridle', 'saddle']
            }
        };

        // Size modifiers
        this.sizeModifiers = {
            [this.signSizes.SMALL]: {
                multiplier: 0.6,
                visibilityMultiplier: 0.8,
                pixelSize: 32,
                features: ['small', 'discreet', 'compact']
            },
            [this.signSizes.MEDIUM]: {
                multiplier: 1.0,
                visibilityMultiplier: 1.0,
                pixelSize: 48,
                features: ['medium', 'standard', 'balanced']
            },
            [this.signSizes.LARGE]: {
                multiplier: 1.5,
                visibilityMultiplier: 1.2,
                pixelSize: 64,
                features: ['large', 'prominent', 'visible']
            },
            [this.signSizes.EXTRA_LARGE]: {
                multiplier: 2.2,
                visibilityMultiplier: 1.5,
                pixelSize: 80,
                features: ['extra_large', 'massive', 'dominant']
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.signQualities.COMMON]: {
                statMultiplier: 1.0,
                valueMultiplier: 1.0,
                visibilityMultiplier: 1.0,
                appealMultiplier: 1.0,
                rarity: 1,
                features: ['common', 'standard', 'serviceable']
            },
            [this.signQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                valueMultiplier: 1.5,
                visibilityMultiplier: 1.1,
                appealMultiplier: 1.2,
                rarity: 2,
                features: ['uncommon', 'enhanced', 'attractive']
            },
            [this.signQualities.RARE]: {
                statMultiplier: 1.5,
                valueMultiplier: 2.5,
                visibilityMultiplier: 1.25,
                appealMultiplier: 1.5,
                rarity: 3,
                features: ['rare', 'exceptional', 'eye_catching']
            },
            [this.signQualities.EPIC]: {
                statMultiplier: 2.0,
                valueMultiplier: 4.0,
                visibilityMultiplier: 1.5,
                appealMultiplier: 2.0,
                rarity: 4,
                features: ['epic', 'masterwork', 'striking']
            },
            [this.signQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                valueMultiplier: 8.0,
                visibilityMultiplier: 2.0,
                appealMultiplier: 3.0,
                rarity: 5,
                features: ['legendary', 'artifact', 'mesmerizing']
            },
            [this.signQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                valueMultiplier: 20.0,
                visibilityMultiplier: 3.0,
                appealMultiplier: 5.0,
                rarity: 6,
                features: ['mythical', 'divine', 'hypnotic']
            }
        };

        // Style modifiers
        this.styleModifiers = {
            [this.signStyles.CLASSIC]: {
                name: 'Classic',
                colors: { base: '#8B4513', accent: '#FFD700', text: '#000000', border: '#654321' },
                features: ['traditional', 'timeless', 'elegant']
            },
            [this.signStyles.FANTASY]: {
                name: 'Fantasy',
                colors: { base: '#4B0082', accent: '#FFD700', text: '#FFFFFF', border: '#9370DB' },
                features: ['magical', 'mystical', 'enchanted']
            },
            [this.signStyles.MEDIEVAL]: {
                name: 'Medieval',
                colors: { base: '#654321', accent: '#C0C0C0', text: '#000000', border: '#2F4F4F' },
                features: ['historical', 'authentic', 'craftsman']
            },
            [this.signStyles.MODERN]: {
                name: 'Modern',
                colors: { base: '#FFFFFF', accent: '#000000', text: '#000000', border: '#808080' },
                features: ['contemporary', 'clean', 'minimalist']
            },
            [this.signStyles.MAGICAL]: {
                name: 'Magical',
                colors: { base: '#FF1493', accent: '#00FFFF', text: '#FFFFFF', border: '#8A2BE2' },
                features: ['magical', 'glowing', 'mysterious']
            },
            [this.signStyles.RUSTIC]: {
                name: 'Rustic',
                colors: { base: '#DEB887', accent: '#8B4513', text: '#000000', border: '#654321' },
                features: ['natural', 'wooden', 'handcrafted']
            }
        };

        // Hanging mechanism types
        this.hangingModifiers = {
            [this.hangingTypes.WOODEN_SIGN]: {
                name: 'Wooden Sign',
                durability: 150,
                weatherResistance: 8,
                features: ['wooden', 'traditional', 'creaky']
            },
            [this.hangingTypes.METAL_SIGN]: {
                name: 'Metal Sign',
                durability: 300,
                weatherResistance: 15,
                features: ['metal', 'durable', 'clanging']
            },
            [this.hangingTypes.STONE_SIGN]: {
                name: 'Stone Sign',
                durability: 500,
                weatherResistance: 20,
                features: ['stone', 'permanent', 'heavy']
            },
            [this.hangingTypes.MAGICAL_SIGN]: {
                name: 'Magical Sign',
                durability: 1000,
                weatherResistance: 25,
                features: ['magical', 'floating', 'glowing']
            },
            [this.hangingTypes.BANNER]: {
                name: 'Banner',
                durability: 80,
                weatherResistance: 5,
                features: ['cloth', 'flowing', 'colorful']
            },
            [this.hangingTypes.TOTEM]: {
                name: 'Totem',
                durability: 400,
                weatherResistance: 18,
                features: ['carved', 'tribal', 'spiritual']
            }
        };

        // Shop symbols and motifs
        this.shopSymbols = {
            sword: { shape: 'straight_line', width: 2, height: 12, color: '#C0C0C0' },
            shield: { shape: 'triangle', width: 8, height: 10, color: '#8B4513' },
            beer_mug: { shape: 'rectangle', width: 4, height: 6, color: '#8B4513' },
            barrel: { shape: 'cylinder', width: 6, height: 8, color: '#654321' },
            star: { shape: 'star', width: 8, height: 8, color: '#FFD700' },
            rune: { shape: 'circle', width: 6, height: 6, color: '#9370DB' },
            wand: { shape: 'straight_line', width: 1, height: 10, color: '#8B4513' },
            scales: { shape: 'balance', width: 10, height: 6, color: '#C0C0C0' },
            bed: { shape: 'rectangle', width: 8, height: 4, color: '#8B4513' },
            key: { shape: 'key_shape', width: 3, height: 6, color: '#FFD700' },
            anvil: { shape: 'rectangle', width: 6, height: 4, color: '#2F4F4F' },
            hammer: { shape: 'hammer_shape', width: 2, height: 8, color: '#8B4513' },
            mortar_pestle: { shape: 'bowl_stick', width: 4, height: 6, color: '#8B4513' },
            herb_bundle: { shape: 'bundle', width: 3, height: 8, color: '#228B22' },
            gem: { shape: 'diamond', width: 4, height: 6, color: '#FF1493' },
            needle: { shape: 'straight_line', width: 1, height: 6, color: '#C0C0C0' },
            loaf_bread: { shape: 'rectangle', width: 5, height: 3, color: '#DEB887' },
            cleaver: { shape: 'axe_shape', width: 2, height: 8, color: '#C0C0C0' },
            flask: { shape: 'flask_shape', width: 3, height: 6, color: '#87CEEB' },
            open_book: { shape: 'book_shape', width: 6, height: 8, color: '#8B4513' },
            horse_head: { shape: 'horse_head', width: 6, height: 6, color: '#8B4513' }
        };
    }

    /**
     * Generate shop sign sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.shopTypes.WEAPON_SHOP,
            size: options.size || this.signSizes.MEDIUM,
            quality: options.quality || this.signQualities.COMMON,
            style: options.style || this.signStyles.CLASSIC,
            hangingType: options.hangingType || this.hangingTypes.WOODEN_SIGN,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate templates
        const shopTemplate = this.shopSignTemplates[config.type];
        const sizeTemplate = this.sizeModifiers[config.size];
        const qualityTemplate = this.qualityModifiers[config.quality];
        const styleTemplate = this.styleModifiers[config.style];
        const hangingTemplate = this.hangingModifiers[config.hangingType];

        if (!shopTemplate || !sizeTemplate || !qualityTemplate || !styleTemplate || !hangingTemplate) {
            throw new Error(`Unknown shop sign configuration: ${config.type}, ${config.size}, ${config.quality}, ${config.style}, ${config.hangingType}`);
        }

        // Calculate final stats
        const finalStats = this.calculateSignStats(shopTemplate, sizeTemplate, qualityTemplate, hangingTemplate, config);

        // Generate sign data
        const signData = {
            id: this.generateSignId(),
            name: this.generateSignName(shopTemplate.name, sizeTemplate, qualityTemplate, styleTemplate),
            type: config.type,
            size: config.size,
            quality: config.quality,
            style: config.style,
            hangingType: config.hangingType,
            shopTemplate: shopTemplate,
            sizeTemplate: sizeTemplate,
            qualityTemplate: qualityTemplate,
            styleTemplate: styleTemplate,
            hangingTemplate: hangingTemplate,
            stats: finalStats,
            features: [...shopTemplate.features, ...sizeTemplate.features, ...qualityTemplate.features, ...styleTemplate.features, ...hangingTemplate.features],
            description: this.generateDescription(shopTemplate, sizeTemplate, qualityTemplate, styleTemplate, hangingTemplate),
            appearance: this.generateAppearance(shopTemplate, styleTemplate, config.quality),
            effects: this.generateEffects(shopTemplate, finalStats),
            symbols: this.generateSymbols(shopTemplate.symbols, styleTemplate.colors)
        };

        // Generate sprite image
        const spriteImage = await this.generateSignSprite(signData, config);

        return {
            image: spriteImage,
            data: signData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'ShopSignGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate sign sprite image
     */
    async generateSignSprite(signData, config) {
        const width = config.width || signData.sizeTemplate.pixelSize * 3;
        const height = config.height || signData.sizeTemplate.pixelSize * 2;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw sign based on type
        await this.drawSignBase(image, signData, config);

        // Apply quality effects
        if (signData.quality !== this.signQualities.COMMON) {
            await this.addQualityEffects(image, signData.quality);
        }

        return image;
    }

    /**
     * Draw sign base shape
     */
    async drawSignBase(image, signData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = signData.sizeTemplate.pixelSize / 48;
        const colors = signData.styleTemplate.colors;

        // Draw sign background
        await this.drawSignBackground(image, centerX, centerY, scale, colors, signData);

        // Draw shop symbols
        await this.drawShopSymbols(image, centerX, centerY, scale, colors, signData);

        // Draw hanging mechanism
        await this.drawHangingMechanism(image, centerX, centerY, scale, colors, signData);

        // Add text/name if needed
        if (config.includeText) {
            await this.drawSignText(image, centerX, centerY, scale, colors, signData);
        }
    }

    /**
     * Draw sign background
     */
    async drawSignBackground(image, x, y, scale, colors, signData) {
        const signWidth = 32 * scale;
        const signHeight = 20 * scale;

        // Main sign board
        for (let i = -signWidth; i < signWidth; i++) {
            for (let j = -signHeight; j < signHeight; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.abs(i) <= signWidth && Math.abs(j) <= signHeight) {
                        const r = parseInt(colors.base.slice(1, 3), 16);
                        const g = parseInt(colors.base.slice(3, 5), 16);
                        const b = parseInt(colors.base.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }

        // Border
        await this.addBorder(image, x, y, signWidth, signHeight, colors.border);
    }

    /**
     * Draw shop symbols
     */
    async drawShopSymbols(image, x, y, scale, colors, signData) {
        const symbolSpacing = 12 * scale;
        const symbols = signData.symbols.slice(0, 3); // Limit to 3 main symbols

        symbols.forEach((symbol, index) => {
            const symbolX = x + (index - 1) * symbolSpacing;
            const symbolY = y - 4 * scale;

            this.drawSymbol(image, symbolX, symbolY, scale, colors, symbol);
        });
    }

    /**
     * Draw individual symbol
     */
    drawSymbol(image, x, y, scale, colors, symbol) {
        const symbolData = this.shopSymbols[symbol];
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
            case 'straight_line':
                return Math.abs(i) <= width * 0.3 && Math.abs(j) <= height;
            case 'rectangle':
                return Math.abs(i) <= width && Math.abs(j) <= height;
            case 'triangle':
                return Math.abs(i) <= width - Math.abs(j) * width / height && Math.abs(j) <= height;
            case 'circle':
                return i * i + j * j <= width * height;
            case 'star':
                // Simple star approximation
                const angle = Math.atan2(j, i);
                const distance = Math.sqrt(i * i + j * j);
                const starPoints = 5;
                const starDepth = 0.5;
                const starAngle = Math.PI * 2 / starPoints;
                const starRadius = distance / Math.max(width, height);
                const starFactor = Math.cos(angle * starPoints / 2) * starDepth + (1 - starDepth);
                return starRadius <= starFactor;
            case 'diamond':
                return Math.abs(i) + Math.abs(j) <= Math.max(width, height);
            case 'cylinder':
                return Math.abs(i) <= width && Math.abs(j) <= height * 0.8;
            case 'hammer_shape':
                return (Math.abs(i) <= width && Math.abs(j) <= height * 0.7) ||
                       (Math.abs(i) <= width * 2 && Math.abs(j) >= height * 0.7 && Math.abs(j) <= height);
            case 'key_shape':
                return (Math.abs(i) <= width && Math.abs(j) <= height * 0.8) ||
                       (Math.abs(i) >= width && Math.abs(i) <= width * 1.5 && Math.abs(j) <= height * 0.3);
            case 'bowl_stick':
                return (i * i + j * j <= width * height * 0.6) ||
                       (Math.abs(i) <= width * 0.2 && Math.abs(j) <= height);
            case 'bundle':
                return Math.abs(i) <= width && Math.abs(j) <= height;
            case 'axe_shape':
                return (Math.abs(i) <= width && Math.abs(j) <= height * 0.8) ||
                       (Math.abs(i) <= width * 1.5 && Math.abs(j) >= height * 0.8 && Math.abs(j) <= height);
            case 'flask_shape':
                return (Math.abs(i) <= width * 0.6 && Math.abs(j) <= height * 0.8) ||
                       (Math.abs(i) <= width && Math.abs(j) >= height * 0.8 && Math.abs(j) <= height);
            case 'book_shape':
                return Math.abs(i) <= width && Math.abs(j) <= height;
            case 'horse_head':
                return Math.sqrt(i * i + j * j) <= width * 0.8 && j <= height * 0.6;
            case 'balance':
                return (Math.abs(i) <= width * 0.8 && Math.abs(j) <= height * 0.2) ||
                       (Math.abs(j) <= height && Math.abs(i) <= width * 0.1);
            default:
                return Math.abs(i) <= width && Math.abs(j) <= height;
        }
    }

    /**
     * Draw hanging mechanism
     */
    async drawHangingMechanism(image, x, y, scale, colors, signData) {
        const hangingType = signData.hangingType;
        const signWidth = 32 * scale;
        const signHeight = 20 * scale;

        switch (hangingType) {
            case this.hangingTypes.WOODEN_SIGN:
                // Wooden chains/brackets
                for (let i = -signWidth * 0.8; i < signWidth * 0.8; i += 4) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y - signHeight - 2 * scale);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        const r = parseInt('#654321'.slice(1, 3), 16);
                        const g = parseInt('#654321'.slice(3, 5), 16);
                        const b = parseInt('#654321'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
                break;

            case this.hangingTypes.METAL_SIGN:
                // Metal chains
                for (let i = -signWidth * 0.9; i < signWidth * 0.9; i += 3) {
                    for (let j = -signHeight - 8 * scale; j < -signHeight; j++) {
                        const pixelX = Math.floor(x + i);
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
                break;

            case this.hangingTypes.BANNER:
                // Banner poles
                for (let j = -signHeight - 10 * scale; j < -signHeight + 2 * scale; j++) {
                    const pixelX1 = Math.floor(x - signWidth);
                    const pixelX2 = Math.floor(x + signWidth);
                    const pixelY = Math.floor(y + j);

                    if (pixelX1 >= 0 && pixelX1 < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        const r = parseInt('#8B4513'.slice(1, 3), 16);
                        const g = parseInt('#8B4513'.slice(3, 5), 16);
                        const b = parseInt('#8B4513'.slice(5, 7), 16);
                        const color = (r << 16) | (g << 8) | b | 0xFF000000;
                        image.setPixelColor(color, pixelX1, pixelY);
                        image.setPixelColor(color, pixelX2, pixelY);
                    }
                }
                break;

            case this.hangingTypes.MAGICAL_SIGN:
                // Magical floating effect
                for (let i = -signWidth * 1.2; i < signWidth * 1.2; i++) {
                    for (let j = -signHeight - 6 * scale; j < -signHeight; j++) {
                        const pixelX = Math.floor(x + i);
                        const pixelY = Math.floor(y + j);
                        if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                            if (Math.random() > 0.7) {
                                const r = parseInt('#9370DB'.slice(1, 3), 16);
                                const g = parseInt('#9370DB'.slice(3, 5), 16);
                                const b = parseInt('#9370DB'.slice(5, 7), 16);
                                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                                image.setPixelColor(color, pixelX, pixelY);
                            }
                        }
                    }
                }
                break;
        }
    }

    /**
     * Draw sign text
     */
    async drawSignText(image, x, y, scale, colors, signData) {
        // Simple text representation - would be more complex in real implementation
        const textY = y + 6 * scale;
        const textWidth = 20 * scale;

        for (let i = -textWidth; i < textWidth; i++) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(textY);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                if (Math.abs(i) <= textWidth) {
                    const r = parseInt(colors.text.slice(1, 3), 16);
                    const g = parseInt(colors.text.slice(3, 5), 16);
                    const b = parseInt(colors.text.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Add border to sign
     */
    async addBorder(image, x, y, width, height, borderColor) {
        // Top border
        for (let i = -width - 1; i <= width + 1; i++) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y - height - 1);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt(borderColor.slice(1, 3), 16);
                const g = parseInt(borderColor.slice(3, 5), 16);
                const b = parseInt(borderColor.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }

        // Bottom border
        for (let i = -width - 1; i <= width + 1; i++) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y + height + 1);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                const r = parseInt(borderColor.slice(1, 3), 16);
                const g = parseInt(borderColor.slice(3, 5), 16);
                const b = parseInt(borderColor.slice(5, 7), 16);
                const color = (r << 16) | (g << 8) | b | 0xFF000000;
                image.setPixelColor(color, pixelX, pixelY);
            }
        }

        // Left and right borders
        for (let j = -height - 1; j <= height + 1; j++) {
            const pixelY = Math.floor(y + j);
            if (pixelY >= 0 && pixelY < image.bitmap.height) {
                // Left border
                const pixelX1 = Math.floor(x - width - 1);
                if (pixelX1 >= 0 && pixelX1 < image.bitmap.width) {
                    const r = parseInt(borderColor.slice(1, 3), 16);
                    const g = parseInt(borderColor.slice(3, 5), 16);
                    const b = parseInt(borderColor.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX1, pixelY);
                }

                // Right border
                const pixelX2 = Math.floor(x + width + 1);
                if (pixelX2 >= 0 && pixelX2 < image.bitmap.width) {
                    const r = parseInt(borderColor.slice(1, 3), 16);
                    const g = parseInt(borderColor.slice(3, 5), 16);
                    const b = parseInt(borderColor.slice(5, 7), 16);
                    const color = (r << 16) | (g << 8) | b | 0xFF000000;
                    image.setPixelColor(color, pixelX2, pixelY);
                }
            }
        }
    }

    /**
     * Add quality effects
     */
    async addQualityEffects(image, quality) {
        switch (quality) {
            case this.signQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.signQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.signQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.signQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Calculate sign stats
     */
    calculateSignStats(shopTemplate, sizeTemplate, qualityTemplate, hangingTemplate, config) {
        const stats = {
            value: Math.round(shopTemplate.baseValue * sizeTemplate.multiplier * qualityTemplate.valueMultiplier),
            visibility: Math.round(shopTemplate.visibility * sizeTemplate.visibilityMultiplier * qualityTemplate.visibilityMultiplier),
            appeal: Math.round(shopTemplate.appeal * qualityTemplate.appealMultiplier),
            durability: hangingTemplate.durability,
            weatherResistance: hangingTemplate.weatherResistance,
            rarity: Math.max(shopTemplate.rarity || 1, qualityTemplate.rarity)
        };

        return stats;
    }

    /**
     * Generate sign ID
     */
    generateSignId() {
        return 'shop_sign_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate sign name
     */
    generateSignName(shopName, sizeTemplate, qualityTemplate, styleTemplate) {
        const sizePrefixes = {
            [this.signSizes.SMALL]: 'Small ',
            [this.signSizes.MEDIUM]: '',
            [this.signSizes.LARGE]: 'Large ',
            [this.signSizes.EXTRA_LARGE]: 'Grand '
        };

        const qualityPrefixes = {
            [this.signQualities.COMMON]: '',
            [this.signQualities.UNCOMMON]: 'Fine ',
            [this.signQualities.RARE]: 'Ornate ',
            [this.signQualities.EPIC]: 'Magnificent ',
            [this.signQualities.LEGENDARY]: 'Legendary ',
            [this.signQualities.MYTHICAL]: 'Mythical '
        };

        const styleSuffixes = {
            [this.signStyles.CLASSIC]: '',
            [this.signStyles.FANTASY]: ' (Fantasy Style)',
            [this.signStyles.MEDIEVAL]: ' (Medieval Style)',
            [this.signStyles.MODERN]: ' (Modern Style)',
            [this.signStyles.MAGICAL]: ' (Magical Style)',
            [this.signStyles.RUSTIC]: ' (Rustic Style)'
        };

        return `${qualityPrefixes[qualityTemplate]}${sizePrefixes[sizeTemplate]}${shopName}${styleSuffixes[styleTemplate]}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(shopTemplate, sizeTemplate, qualityTemplate, styleTemplate, hangingTemplate) {
        const qualityDesc = {
            [this.signQualities.COMMON]: 'A standard shop sign',
            [this.signQualities.UNCOMMON]: 'A well-crafted shop sign',
            [this.signQualities.RARE]: 'An ornate shop sign',
            [this.signQualities.EPIC]: 'A magnificent shop sign',
            [this.signQualities.LEGENDARY]: 'A legendary shop sign',
            [this.signQualities.MYTHICAL]: 'A mythical shop sign'
        };

        const styleDesc = {
            [this.signStyles.CLASSIC]: 'with classic styling',
            [this.signStyles.FANTASY]: 'with fantasy styling',
            [this.signStyles.MEDIEVAL]: 'with medieval styling',
            [this.signStyles.MODERN]: 'with modern styling',
            [this.signStyles.MAGICAL]: 'with magical styling',
            [this.signStyles.RUSTIC]: 'with rustic styling'
        };

        const hangingDesc = ` hanging from ${hangingTemplate.name.toLowerCase()}`;

        return `${qualityDesc[qualityTemplate]} ${styleDesc[styleTemplate]}${hangingDesc}. ${shopTemplate.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(shopTemplate, styleTemplate, quality) {
        return {
            baseColor: styleTemplate.colors.base,
            accentColor: styleTemplate.colors.accent,
            textColor: styleTemplate.colors.text,
            borderColor: styleTemplate.colors.border,
            shopTemplate: shopTemplate,
            styleTemplate: styleTemplate,
            quality: quality
        };
    }

    /**
     * Generate effects
     */
    generateEffects(shopTemplate, stats) {
        const effects = [];

        // Value effect
        effects.push({
            type: 'sign_value',
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

        // Appeal effect
        effects.push({
            type: 'customer_appeal',
            power: stats.appeal,
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
     * Generate symbols
     */
    generateSymbols(symbolTypes, colors) {
        return symbolTypes.map(symbolType => {
            const symbolData = this.shopSymbols[symbolType];
            if (symbolData) {
                return {
                    type: symbolType,
                    ...symbolData,
                    color: colors.accent // Use accent color for symbols
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
     * Batch generate shop signs
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const sign = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(sign);
            } catch (error) {
                console.error(`Failed to generate shop sign ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(s => s !== null);
    }

    /**
     * Generate sign by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.size) options.size = criteria.size;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.style) options.style = criteria.style;
        if (criteria.hangingType) options.hangingType = criteria.hangingType;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get sign statistics
     */
    getSignStatistics() {
        return {
            totalTypes: Object.keys(this.shopTypes).length,
            totalSizes: Object.keys(this.signSizes).length,
            totalQualities: Object.keys(this.signQualities).length,
            totalStyles: Object.keys(this.signStyles).length,
            totalHangingTypes: Object.keys(this.hangingTypes).length,
            shopTemplates: Object.keys(this.shopSignTemplates).length,
            symbolTypes: Object.keys(this.shopSymbols).length
        };
    }

    /**
     * Export sign data
     */
    async exportSignData(sign, outputPath) {
        const exportData = {
            ...sign.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save sign data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate sign configuration
     */
    validateSignConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.shopTypes).includes(config.type)) {
            errors.push(`Invalid shop type: ${config.type}`);
        }

        if (config.size && !Object.values(this.signSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.quality && !Object.values(this.signQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.style && !Object.values(this.signStyles).includes(config.style)) {
            errors.push(`Invalid style: ${config.style}`);
        }

        if (config.hangingType && !Object.values(this.hangingTypes).includes(config.hangingType)) {
            errors.push(`Invalid hanging type: ${config.hangingType}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate shop district
     */
    async generateShopDistrict(count = 8, theme = 'mixed') {
        const district = [];

        const shopTypes = Object.values(this.shopTypes);

        for (let i = 0; i < count; i++) {
            let shopType;

            switch (theme) {
                case 'weapons':
                    shopType = this.shopTypes.WEAPON_SHOP;
                    break;
                case 'magic':
                    shopType = [this.shopTypes.MAGIC_SHOP, this.shopTypes.APOTHECARY, this.shopTypes.ALCHEMIST][Math.floor(Math.random() * 3)];
                    break;
                case 'food':
                    shopType = [this.shopTypes.TAVERN, this.shopTypes.BAKER, this.shopTypes.BUTCHER][Math.floor(Math.random() * 3)];
                    break;
                case 'crafts':
                    shopType = [this.shopTypes.BLACKSMITH, this.shopTypes.TAILOR, this.shopTypes.JEWELER][Math.floor(Math.random() * 3)];
                    break;
                default:
                    shopType = shopTypes[Math.floor(Math.random() * shopTypes.length)];
            }

            const sign = await this.generate({
                type: shopType,
                size: this.signSizes.MEDIUM,
                quality: this.signQualities.COMMON,
                style: this.signStyles.CLASSIC,
                hangingType: this.hangingTypes.WOODEN_SIGN
            });

            district.push(sign);
        }

        return district;
    }

    /**
     * Generate marketplace signs
     */
    async generateMarketplaceSigns(count = 12) {
        const marketplace = [];

        const marketShops = [
            this.shopTypes.GENERAL_STORE,
            this.shopTypes.BAKER,
            this.shopTypes.BUTCHER,
            this.shopTypes.TAILOR,
            this.shopTypes.APOTHECARY,
            this.shopTypes.JEWELER
        ];

        for (let i = 0; i < count; i++) {
            const shopType = marketShops[Math.floor(Math.random() * marketShops.length)];

            const sign = await this.generate({
                type: shopType,
                size: this.signSizes.SMALL,
                quality: this.signQualities.COMMON,
                style: this.signStyles.RUSTIC,
                hangingType: this.hangingTypes.WOODEN_SIGN
            });

            marketplace.push(sign);
        }

        return marketplace;
    }

    /**
     * Generate premium shop signs
     */
    async generatePremiumShopSigns(count = 5) {
        const premium = [];

        const premiumShops = [
            this.shopTypes.MAGIC_SHOP,
            this.shopTypes.JEWELER,
            this.shopTypes.ALCHEMIST,
            this.shopTypes.WEAPON_SHOP,
            this.shopTypes.INN
        ];

        for (let i = 0; i < count; i++) {
            const shopType = premiumShops[Math.floor(Math.random() * premiumShops.length)];

            const sign = await this.generate({
                type: shopType,
                size: this.signSizes.LARGE,
                quality: this.signQualities.RARE,
                style: this.signStyles.FANTASY,
                hangingType: this.hangingTypes.METAL_SIGN
            });

            premium.push(sign);
        }

        return premium;
    }

    /**
     * Calculate sign maintenance cost
     */
    calculateMaintenanceCost(signData) {
        const baseCost = signData.stats.value * 0.02; // 2% of sign value per maintenance
        const hangingMultiplier = signData.hangingType === this.hangingTypes.MAGICAL_SIGN ? 3.0 :
                                 signData.hangingType === this.hangingTypes.METAL_SIGN ? 1.5 : 1.0;

        return Math.round(baseCost * hangingMultiplier);
    }

    /**
     * Calculate sign repair cost
     */
    calculateRepairCost(signData, damagePercentage = 50) {
        return Math.round((signData.stats.value * damagePercentage / 100) * 0.5); // 50% of damaged value (signs are expensive to repair)
    }

    /**
     * Get sign durability info
     */
    getSignDurabilityInfo(signData) {
        return {
            maxDurability: signData.stats.durability,
            currentDurability: signData.stats.durability, // Would be tracked separately
            durabilityPercentage: 100,
            weatherResistance: signData.stats.weatherResistance,
            repairCost: this.calculateRepairCost(signData, 100)
        };
    }

    /**
     * Generate sign upgrade options
     */
    generateUpgradeOptions(signData) {
        const upgrades = [];

        // Quality upgrades
        if (signData.quality !== this.signQualities.MYTHICAL) {
            const nextQuality = this.getNextQuality(signData.quality);
            upgrades.push({
                type: 'quality',
                name: `Upgrade to ${nextQuality} quality`,
                cost: Math.round(signData.stats.value * 0.8),
                benefits: ['+25% visibility', '+30% appeal', '+50% value']
            });
        }

        // Size upgrades
        if (signData.size !== this.signSizes.EXTRA_LARGE) {
            const nextSize = this.getNextSize(signData.size);
            upgrades.push({
                type: 'size',
                name: `Upgrade to ${nextSize} size`,
                cost: Math.round(signData.stats.value * 0.6),
                benefits: ['+50% visibility', '+25% appeal']
            });
        }

        // Hanging upgrades
        if (signData.hangingType !== this.hangingTypes.MAGICAL_SIGN) {
            const nextHanging = this.getNextHanging(signData.hangingType);
            upgrades.push({
                type: 'hanging',
                name: `Upgrade to ${nextHanging} hanging`,
                cost: Math.round(signData.stats.value * 0.4),
                benefits: ['+100% durability', '+50% weather resistance']
            });
        }

        return upgrades;
    }

    /**
     * Get next quality level
     */
    getNextQuality(currentQuality) {
        const qualities = Object.values(this.signQualities);
        const currentIndex = qualities.indexOf(currentQuality);
        return qualities[Math.min(currentIndex + 1, qualities.length - 1)];
    }

    /**
     * Get next size level
     */
    getNextSize(currentSize) {
        const sizes = Object.values(this.signSizes);
        const currentIndex = sizes.indexOf(currentSize);
        return sizes[Math.min(currentIndex + 1, sizes.length - 1)];
    }

    /**
     * Get next hanging type
     */
    getNextHanging(currentHanging) {
        const hangings = Object.values(this.hangingTypes);
        const currentIndex = hangings.indexOf(currentHanging);
        return hangings[Math.min(currentIndex + 1, hangings.length - 1)];
    }

    /**
     * Calculate sign depreciation
     */
    calculateDepreciation(signData, ageInYears = 1) {
        const depreciationRate = 0.08; // 8% per year (signs weather faster)
        const hangingMultiplier = signData.hangingType === this.hangingTypes.MAGICAL_SIGN ? 0.2 :
                                 signData.hangingType === this.hangingTypes.STONE_SIGN ? 0.5 : 1.0;

        const depreciation = signData.stats.value * depreciationRate * ageInYears * hangingMultiplier;
        return Math.round(Math.max(0, signData.stats.value - depreciation));
    }

    /**
     * Get sign care requirements
     */
    getSignCareRequirements(signData) {
        const careLevel = signData.hangingType === this.hangingTypes.MAGICAL_SIGN ? 'minimal' :
                         signData.hangingType === this.hangingTypes.STONE_SIGN ? 'low' :
                         signData.hangingType === this.hangingTypes.METAL_SIGN ? 'moderate' : 'regular';

        return {
            careLevel: careLevel,
            maintenanceFrequency: careLevel === 'minimal' ? 60 :
                                careLevel === 'low' ? 30 :
                                careLevel === 'moderate' ? 14 : 7, // days
            careItems: ['brush', 'oil', 'cloth', 'paint'],
            costPerMaintenance: this.calculateMaintenanceCost(signData)
        };
    }

    /**
     * Generate sign performance report
     */
    generatePerformanceReport(signData) {
        const performance = {
            overall: 0,
            categories: {}
        };

        // Calculate performance scores
        performance.categories.visibility = Math.min(100, (signData.stats.visibility / 30) * 100);
        performance.categories.appeal = Math.min(100, (signData.stats.appeal / 25) * 100);
        performance.categories.durability = Math.min(100, (signData.stats.durability / 1000) * 100);
        performance.categories.weatherResistance = Math.min(100, (signData.stats.weatherResistance / 25) * 100);

        // Calculate overall performance
        const scores = Object.values(performance.categories);
        performance.overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        return performance;
    }

    /**
     * Generate sign comparison
     */
    async generateSignComparison(shopType, qualities = ['common', 'rare', 'epic']) {
        const comparison = {};

        for (const quality of qualities) {
            const sign = await this.generate({
                type: shopType,
                quality: quality
            });

            comparison[quality] = {
                name: sign.data.name,
                value: sign.data.stats.value,
                visibility: sign.data.stats.visibility,
                appeal: sign.data.stats.appeal,
                performance: this.generatePerformanceReport(sign.data)
            };
        }

        return comparison;
    }

    /**
     * Generate themed sign collection
     */
    async generateThemedSignCollection(theme = 'fantasy', count = 6) {
        const collection = [];

        let style, hangingType, quality;

        switch (theme) {
            case 'fantasy':
                style = this.signStyles.FANTASY;
                hangingType = this.hangingTypes.METAL_SIGN;
                quality = this.signQualities.UNCOMMON;
                break;
            case 'medieval':
                style = this.signStyles.MEDIEVAL;
                hangingType = this.hangingTypes.WOODEN_SIGN;
                quality = this.signQualities.COMMON;
                break;
            case 'magical':
                style = this.signStyles.MAGICAL;
                hangingType = this.hangingTypes.MAGICAL_SIGN;
                quality = this.signQualities.RARE;
                break;
            case 'rustic':
                style = this.signStyles.RUSTIC;
                hangingType = this.hangingTypes.WOODEN_SIGN;
                quality = this.signQualities.COMMON;
                break;
            default:
                style = this.signStyles.CLASSIC;
                hangingType = this.hangingTypes.WOODEN_SIGN;
                quality = this.signQualities.COMMON;
        }

        const shopTypes = Object.values(this.shopTypes);

        for (let i = 0; i < count; i++) {
            const shopType = shopTypes[Math.floor(Math.random() * shopTypes.length)];

            const sign = await this.generate({
                type: shopType,
                size: this.signSizes.MEDIUM,
                quality: quality,
                style: style,
                hangingType: hangingType
            });

            collection.push(sign);
        }

        return collection;
    }

    /**
     * Generate sign with specific value range
     */
    async generateSignByValue(shopType, minValue, maxValue) {
        const shopTemplate = this.shopSignTemplates[shopType];

        if (!shopTemplate) {
            throw new Error('Invalid shop type');
        }

        // Try different combinations until we find one in the value range
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const quality = this.getRandomFromArray(Object.values(this.signQualities));
            const size = this.getRandomFromArray(Object.values(this.signSizes));
            const hangingType = this.getRandomFromArray(Object.values(this.hangingTypes));

            const estimatedValue = this.calculateSignStats(
                shopTemplate,
                this.sizeModifiers[size],
                this.qualityModifiers[quality],
                this.hangingModifiers[hangingType],
                {}
            ).value;

            if (estimatedValue >= minValue && estimatedValue <= maxValue) {
                return await this.generate({
                    type: shopType,
                    size: size,
                    quality: quality,
                    hangingType: hangingType
                });
            }

            attempts++;
        }

        // Fallback to medium quality
        return await this.generate({
            type: shopType,
            size: this.signSizes.MEDIUM,
            quality: this.signQualities.COMMON,
            hangingType: this.hangingTypes.WOODEN_SIGN
        });
    }

    /**
     * Get random item from array
     */
    getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Generate business district
     */
    async generateBusinessDistrict(districtType = 'mixed') {
        const district = {
            name: '',
            signs: [],
            totalValue: 0,
            averageAppeal: 0,
            districtType: districtType
        };

        let signCount, name;

        switch (districtType) {
            case 'market':
                signCount = 15;
                name = 'Market District';
                district.signs = await this.generateMarketplaceSigns(signCount);
                break;
            case 'premium':
                signCount = 8;
                name = 'Premium Shopping District';
                district.signs = await this.generatePremiumShopSigns(signCount);
                break;
            case 'magical':
                signCount = 10;
                name = 'Arcane Quarter';
                district.signs = await this.generateThemedSignCollection('magical', signCount);
                break;
            default:
                signCount = 12;
                name = 'Mixed Business District';
                district.signs = await this.generateShopDistrict(signCount);
        }

        district.name = name;

        // Calculate district statistics
        let totalValue = 0;
        let totalAppeal = 0;

        district.signs.forEach(sign => {
            totalValue += sign.data.stats.value;
            totalAppeal += sign.data.stats.appeal;
        });

        district.totalValue = totalValue;
        district.averageAppeal = Math.round(totalAppeal / district.signs.length);

        return district;
    }
}

module.exports = ShopSignGenerator;
