/**
 * Scroll Generator - Complete scroll and document sprite generation system
 * Generates various types of scrolls with different materials, content, and magical properties
 */

const Jimp = require('jimp');
const path = require('path');

class ScrollGenerator {
    constructor() {
        this.scrollTypes = {
            SPELL: 'spell',
            MAP: 'map',
            DOCUMENT: 'document',
            ANCIENT: 'ancient',
            MAGICAL: 'magical'
        };

        this.materialTypes = {
            PARCHMENT: 'parchment',
            PAPER: 'paper',
            MAGICAL_PAPER: 'magical_paper',
            ANCIENT_PARCHMENT: 'ancient_parchment',
            CRYSTAL_PAPER: 'crystal_paper'
        };

        this.scrollQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.scrollSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge'
        };

        // Spell scroll templates
        this.spellScrollTemplates = {
            FIREBALL: {
                name: 'Fireball Scroll',
                description: 'Scroll containing the fireball spell',
                spellType: 'offensive',
                manaCost: 25,
                damage: 50,
                range: 100,
                cooldown: 30,
                features: ['fire_damage', 'area_effect', 'combustion']
            },
            HEAL: {
                name: 'Healing Scroll',
                description: 'Scroll containing healing magic',
                spellType: 'restorative',
                manaCost: 20,
                healing: 75,
                range: 50,
                cooldown: 45,
                features: ['health_restore', 'divine_magic', 'regeneration']
            },
            TELEPORT: {
                name: 'Teleport Scroll',
                description: 'Scroll containing teleportation magic',
                spellType: 'utility',
                manaCost: 40,
                range: 200,
                cooldown: 120,
                features: ['instant_movement', 'spatial_magic', 'escape']
            },
            SUMMON: {
                name: 'Summon Scroll',
                description: 'Scroll containing summoning magic',
                spellType: 'summoning',
                manaCost: 60,
                duration: 300,
                cooldown: 180,
                features: ['creature_summon', 'arcane_magic', 'ally']
            },
            LIGHTNING: {
                name: 'Lightning Scroll',
                description: 'Scroll containing lightning magic',
                spellType: 'offensive',
                manaCost: 35,
                damage: 80,
                range: 150,
                cooldown: 25,
                features: ['electric_damage', 'chain_effect', 'storm']
            },
            SHIELD: {
                name: 'Protection Scroll',
                description: 'Scroll containing protective magic',
                spellType: 'defensive',
                manaCost: 30,
                duration: 240,
                cooldown: 90,
                features: ['damage_reduction', 'ward_magic', 'defense']
            }
        };

        // Map scroll templates
        this.mapScrollTemplates = {
            TREASURE: {
                name: 'Treasure Map',
                description: 'Map showing location of hidden treasure',
                mapType: 'treasure',
                locations: ['buried_chest', 'hidden_cave', 'ancient_ruins'],
                difficulty: 'medium',
                features: ['marked_locations', 'compass_rose', 'landmarks']
            },
            WORLD: {
                name: 'World Map',
                description: 'Detailed map of the known world',
                mapType: 'geographical',
                locations: ['cities', 'mountains', 'rivers', 'forests'],
                scale: 'continental',
                features: ['political_borders', 'terrain_types', 'trade_routes']
            },
            DUNGEON: {
                name: 'Dungeon Map',
                description: 'Map of underground dungeon complex',
                mapType: 'architectural',
                locations: ['rooms', 'corridors', 'traps', 'treasure_rooms'],
                difficulty: 'hard',
                features: ['room_layouts', 'trap_markers', 'secret_doors']
            },
            NAVIGATION: {
                name: 'Navigation Chart',
                description: 'Sea navigation chart with currents and hazards',
                mapType: 'nautical',
                locations: ['ports', 'reefs', 'currents', 'islands'],
                scale: 'regional',
                features: ['depth_soundings', 'wind_patterns', 'safe_routes']
            }
        };

        // Document scroll templates
        this.documentScrollTemplates = {
            LETTER: {
                name: 'Personal Letter',
                description: 'Handwritten letter with personal message',
                documentType: 'correspondence',
                contentType: 'personal',
                length: 'short',
                features: ['handwriting', 'seal', 'signature']
            },
            CONTRACT: {
                name: 'Legal Contract',
                description: 'Formal legal agreement document',
                documentType: 'legal',
                contentType: 'formal',
                length: 'medium',
                features: ['legal_language', 'signatures', 'witnesses']
            },
            ANCIENT_TEXT: {
                name: 'Ancient Text',
                description: 'Ancient manuscript with historical significance',
                documentType: 'historical',
                contentType: 'ancient',
                length: 'long',
                features: ['archaic_language', 'aged_appearance', 'historical_value']
            },
            RECIPE: {
                name: 'Recipe Scroll',
                description: 'Culinary recipe with detailed instructions',
                documentType: 'instructional',
                contentType: 'practical',
                length: 'medium',
                features: ['ingredients_list', 'cooking_steps', 'measurements']
            },
            PROPHECY: {
                name: 'Prophecy Scroll',
                description: 'Mystical prophecy with cryptic predictions',
                documentType: 'mystical',
                contentType: 'prophetic',
                length: 'long',
                features: ['cryptic_language', 'mystical_symbols', 'foretelling']
            }
        };

        // Material properties
        this.materialProperties = {
            [this.materialTypes.PARCHMENT]: {
                durability: 6,
                flexibility: 0.8,
                transparency: 0.1,
                color: '#F5F5DC',
                agingRate: 0.3,
                magicalAffinity: 0.2
            },
            [this.materialTypes.PAPER]: {
                durability: 4,
                flexibility: 0.9,
                transparency: 0.05,
                color: '#FFFFFF',
                agingRate: 0.5,
                magicalAffinity: 0.1
            },
            [this.materialTypes.MAGICAL_PAPER]: {
                durability: 8,
                flexibility: 0.7,
                transparency: 0.2,
                color: '#E6E6FA',
                agingRate: 0.1,
                magicalAffinity: 0.9
            },
            [this.materialTypes.ANCIENT_PARCHMENT]: {
                durability: 3,
                flexibility: 0.6,
                transparency: 0.15,
                color: '#DEB887',
                agingRate: 0.8,
                magicalAffinity: 0.4
            },
            [this.materialTypes.CRYSTAL_PAPER]: {
                durability: 10,
                flexibility: 0.5,
                transparency: 0.8,
                color: '#F0F8FF',
                agingRate: 0.05,
                magicalAffinity: 1.0
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.scrollQualities.COMMON]: {
                statMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                valueMultiplier: 1.0,
                readability: 0.8,
                rarity: 1
            },
            [this.scrollQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                durabilityMultiplier: 1.1,
                valueMultiplier: 1.8,
                readability: 0.85,
                rarity: 2
            },
            [this.scrollQualities.RARE]: {
                statMultiplier: 1.5,
                durabilityMultiplier: 1.25,
                valueMultiplier: 4.0,
                readability: 0.9,
                rarity: 3
            },
            [this.scrollQualities.EPIC]: {
                statMultiplier: 2.0,
                durabilityMultiplier: 1.5,
                valueMultiplier: 12.0,
                readability: 0.95,
                rarity: 4
            },
            [this.scrollQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                durabilityMultiplier: 2.0,
                valueMultiplier: 40.0,
                readability: 0.98,
                rarity: 5
            },
            [this.scrollQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                durabilityMultiplier: 3.0,
                valueMultiplier: 150.0,
                readability: 1.0,
                rarity: 6
            }
        };

        // Scroll colors and effects
        this.scrollColors = {
            parchment: { base: '#F5F5DC', aged: '#DEB887', burnt: '#8B4513' },
            paper: { base: '#FFFFFF', aged: '#F5F5F5', burnt: '#696969' },
            magical: { base: '#E6E6FA', glow: '#9370DB', runes: '#4B0082' },
            ancient: { base: '#DEB887', faded: '#D2B48C', mystical: '#DAA520' },
            crystal: { base: '#F0F8FF', prism: '#87CEEB', energy: '#00BFFF' }
        };
    }

    /**
     * Generate a scroll sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.scrollTypes.SPELL,
            subtype: options.subtype || 'FIREBALL',
            material: options.material || this.materialTypes.PARCHMENT,
            quality: options.quality || this.scrollQualities.COMMON,
            size: options.size || this.scrollSizes.MEDIUM,
            age: options.age || 0,
            enchanted: options.enchanted || false,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate template based on type
        let template;
        switch (config.type) {
            case this.scrollTypes.SPELL:
                template = this.spellScrollTemplates[config.subtype];
                break;
            case this.scrollTypes.MAP:
                template = this.mapScrollTemplates[config.subtype];
                break;
            case this.scrollTypes.DOCUMENT:
                template = this.documentScrollTemplates[config.subtype];
                break;
            default:
                template = this.spellScrollTemplates.FIREBALL;
        }

        if (!template) {
            throw new Error(`Unknown scroll subtype: ${config.subtype}`);
        }

        // Apply material and quality modifiers
        const materialProps = this.materialProperties[config.material];
        const qualityMods = this.qualityModifiers[config.quality];

        // Calculate final stats
        const finalStats = this.calculateScrollStats(template, qualityMods, config.size, config.age);

        // Generate scroll data
        const scrollData = {
            id: this.generateScrollId(),
            name: this.generateScrollName(template.name, config.quality, config.material),
            type: config.type,
            subtype: config.subtype,
            material: config.material,
            quality: config.quality,
            size: config.size,
            age: config.age,
            template: template,
            stats: finalStats,
            materialProps: materialProps,
            features: [...template.features],
            description: this.generateDescription(template, config.quality, config.material, config.age),
            appearance: this.generateAppearance(template, config.material, config.quality, config.age, config.enchanted),
            content: this.generateContent(template, config.type, config.quality),
            effects: this.generateEffects(template, finalStats, config.enchanted)
        };

        // Generate sprite image
        const spriteImage = await this.generateScrollSprite(scrollData, config);

        return {
            image: spriteImage,
            data: scrollData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'ScrollGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate scroll sprite image
     */
    async generateScrollSprite(scrollData, config) {
        const width = config.width || 64;
        const height = config.height || 96;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw scroll paper/material
        await this.drawScrollMaterial(image, scrollData, config);

        // Draw scroll content
        await this.drawScrollContent(image, scrollData, config);

        // Add decorations and seals
        await this.addDecorations(image, scrollData, config);

        // Apply aging effects
        if (scrollData.age > 0) {
            await this.applyAgingEffects(image, scrollData.age);
        }

        // Add magical effects
        if (scrollData.appearance.enchanted) {
            await this.addMagicalEffects(image, scrollData.appearance);
        }

        return image;
    }

    /**
     * Draw scroll material
     */
    async drawScrollMaterial(image, scrollData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = config.size === this.scrollSizes.SMALL ? 0.7 : config.size === this.scrollSizes.LARGE ? 1.3 : 1.0;

        const scrollWidth = 40 * scale;
        const scrollHeight = 60 * scale;

        // Draw scroll shape (rolled paper)
        for (let i = -scrollWidth / 2; i < scrollWidth / 2; i++) {
            for (let j = -scrollHeight / 2; j < scrollHeight / 2; j++) {
                const pixelX = Math.floor(centerX + i);
                const pixelY = Math.floor(centerY + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    // Scroll material color
                    const materialColor = scrollData.materialProps.color;
                    image.setPixelColor(
                        (parseInt(materialColor.slice(1, 3), 16) << 16) |
                        (parseInt(materialColor.slice(3, 5), 16) << 8) |
                        parseInt(materialColor.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Add material-specific effects
        await this.addMaterialEffects(image, scrollData.material, centerX, centerY, scrollWidth, scrollHeight);
    }

    /**
     * Add material-specific effects
     */
    async addMaterialEffects(image, material, centerX, centerY, width, height) {
        switch (material) {
            case this.materialTypes.MAGICAL_PAPER:
                await this.addMagicalPaperEffects(image, centerX, centerY, width, height);
                break;
            case this.materialTypes.ANCIENT_PARCHMENT:
                await this.addAncientEffects(image, centerX, centerY, width, height);
                break;
            case this.materialTypes.CRYSTAL_PAPER:
                await this.addCrystalEffects(image, centerX, centerY, width, height);
                break;
        }
    }

    /**
     * Draw scroll content
     */
    async drawScrollContent(image, scrollData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;

        switch (scrollData.type) {
            case this.scrollTypes.SPELL:
                await this.drawSpellContent(image, scrollData, centerX, centerY);
                break;
            case this.scrollTypes.MAP:
                await this.drawMapContent(image, scrollData, centerX, centerY);
                break;
            case this.scrollTypes.DOCUMENT:
                await this.drawDocumentContent(image, scrollData, centerX, centerY);
                break;
        }
    }

    /**
     * Draw spell content
     */
    async drawSpellContent(image, scrollData, centerX, centerY) {
        // Draw magical runes and symbols
        const runes = this.generateSpellRunes(scrollData.subtype);

        for (let i = 0; i < runes.length; i++) {
            const rune = runes[i];
            const x = centerX + (i % 3 - 1) * 8;
            const y = centerY + Math.floor(i / 3) * 6 - 10;

            // Draw rune symbol
            for (let rx = -2; rx < 3; rx++) {
                for (let ry = -2; ry < 3; ry++) {
                    const pixelX = Math.floor(x + rx);
                    const pixelY = Math.floor(y + ry);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        if (Math.abs(rx) + Math.abs(ry) <= 2) {
                            image.setPixelColor(0xFF000000, pixelX, pixelY); // Black ink
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw map content
     */
    async drawMapContent(image, scrollData, centerX, centerY) {
        // Draw simple map features
        const features = scrollData.template.locations || [];

        for (let i = 0; i < Math.min(features.length, 5); i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = 15;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            // Draw location marker
            for (let mx = -1; mx < 2; mx++) {
                for (let my = -1; my < 2; my++) {
                    const pixelX = Math.floor(x + mx);
                    const pixelY = Math.floor(y + my);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF000000, pixelX, pixelY);
                    }
                }
            }
        }

        // Draw simple paths
        for (let i = 0; i < 3; i++) {
            const startX = centerX - 10 + i * 7;
            const startY = centerY - 5;
            const endX = centerX - 10 + i * 7;
            const endY = centerY + 5;

            // Draw line
            const steps = 10;
            for (let step = 0; step <= steps; step++) {
                const x = startX + (endX - startX) * step / steps;
                const y = startY + (endY - startY) * step / steps;
                const pixelX = Math.floor(x);
                const pixelY = Math.floor(y);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF000000, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw document content
     */
    async drawDocumentContent(image, scrollData, centerX, centerY) {
        // Draw text lines
        const lines = Math.min(scrollData.content.lines || 8, 12);

        for (let line = 0; line < lines; line++) {
            const lineY = centerY - 15 + line * 3;
            const lineLength = 20 + Math.random() * 10;

            // Draw text line
            for (let x = 0; x < lineLength; x++) {
                const pixelX = Math.floor(centerX - lineLength / 2 + x);
                const pixelY = Math.floor(lineY);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    if (Math.random() > 0.3) { // Simulate text density
                        image.setPixelColor(0xFF000000, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Add decorations and seals
     */
    async addDecorations(image, scrollData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;

        // Add decorative borders
        await this.addDecorativeBorder(image, centerX, centerY, scrollData.size);

        // Add seals for certain types
        if (scrollData.type === this.scrollTypes.DOCUMENT || scrollData.quality !== this.scrollQualities.COMMON) {
            await this.addSeal(image, centerX, centerY + 25, scrollData.quality);
        }

        // Add ribbons or ties
        await this.addRibbons(image, centerX, centerY, scrollData.material);
    }

    /**
     * Apply aging effects
     */
    async applyAgingEffects(image, age) {
        if (age <= 0) return;

        const agingFactor = Math.min(age / 100, 1);

        // Apply yellowing/browning
        for (let x = 0; x < image.bitmap.width; x++) {
            for (let y = 0; y < image.bitmap.height; y++) {
                const color = image.getPixelColor(x, y);
                if ((color & 0xFF000000) !== 0) { // Not transparent
                    const r = (color >> 16) & 0xFF;
                    const g = (color >> 8) & 0xFF;
                    const b = color & 0xFF;

                    // Age the colors
                    const newR = Math.max(0, r - agingFactor * 50);
                    const newG = Math.max(0, g - agingFactor * 30);
                    const newB = Math.max(0, b - agingFactor * 20);

                    const newColor = (newR << 16) | (newG << 8) | newB | 0xFF000000;
                    image.setPixelColor(newColor, x, y);
                }
            }
        }

        // Add wear and tear
        if (agingFactor > 0.5) {
            await this.addWearAndTear(image, agingFactor);
        }
    }

    /**
     * Add magical effects
     */
    async addMagicalEffects(image, appearance) {
        if (appearance.glowColor) {
            await this.addGlowEffect(image, appearance.glowColor);
        }

        if (appearance.runeGlow) {
            await this.addRuneGlow(image);
        }
    }

    /**
     * Calculate scroll stats
     */
    calculateScrollStats(template, qualityMods, size, age) {
        const sizeMultiplier = size === this.scrollSizes.SMALL ? 0.7 : size === this.scrollSizes.LARGE ? 1.3 : 1.0;
        const ageMultiplier = Math.max(0.1, 1 - age / 200); // Age reduces effectiveness

        const stats = {
            power: Math.round((template.manaCost || template.damage || template.healing || 10) * qualityMods.statMultiplier * sizeMultiplier * ageMultiplier),
            durability: Math.round(100 * qualityMods.durabilityMultiplier * (1 - age / 100)),
            value: Math.round(50 * qualityMods.valueMultiplier * sizeMultiplier),
            readability: qualityMods.readability * ageMultiplier,
            weight: 0.1 * sizeMultiplier
        };

        return stats;
    }

    /**
     * Generate scroll ID
     */
    generateScrollId() {
        return 'scroll_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate scroll name
     */
    generateScrollName(baseName, quality, material) {
        const qualityPrefixes = {
            [this.scrollQualities.COMMON]: '',
            [this.scrollQualities.UNCOMMON]: 'Fine ',
            [this.scrollQualities.RARE]: 'Rare ',
            [this.scrollQualities.EPIC]: 'Epic ',
            [this.scrollQualities.LEGENDARY]: 'Legendary ',
            [this.scrollQualities.MYTHICAL]: 'Mythical '
        };

        const materialSuffixes = {
            [this.materialTypes.ANCIENT_PARCHMENT]: ' (Ancient)',
            [this.materialTypes.MAGICAL_PAPER]: ' (Enchanted)',
            [this.materialTypes.CRYSTAL_PAPER]: ' (Crystal)',
            [this.materialTypes.PARCHMENT]: '',
            [this.materialTypes.PAPER]: ''
        };

        return `${qualityPrefixes[quality]}${baseName}${materialSuffixes[material]}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(template, quality, material, age) {
        const qualityDesc = {
            [this.scrollQualities.COMMON]: 'A standard scroll',
            [this.scrollQualities.UNCOMMON]: 'A well-crafted scroll',
            [this.scrollQualities.RARE]: 'A finely made scroll',
            [this.scrollQualities.EPIC]: 'A masterfully crafted scroll',
            [this.scrollQualities.LEGENDARY]: 'A legendary scroll of great power',
            [this.scrollQualities.MYTHICAL]: 'A mythical scroll of unimaginable power'
        };

        const materialDesc = {
            [this.materialTypes.PARCHMENT]: 'written on parchment',
            [this.materialTypes.PAPER]: 'written on paper',
            [this.materialTypes.MAGICAL_PAPER]: 'written on enchanted paper',
            [this.materialTypes.ANCIENT_PARCHMENT]: 'written on ancient parchment',
            [this.materialTypes.CRYSTAL_PAPER]: 'written on crystal paper'
        };

        const ageDesc = age > 50 ? ' that shows signs of age' : age > 25 ? ' that is somewhat aged' : '';

        return `${qualityDesc[quality]} ${materialDesc[material]}${ageDesc}. ${template.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(template, material, quality, age, enchanted) {
        // Determine base colors
        let baseColor = '#F5F5DC'; // Default parchment
        let glowColor = null;
        let runeGlow = false;

        // Set colors based on material
        switch (material) {
            case this.materialTypes.PARCHMENT:
                baseColor = this.scrollColors.parchment.base;
                break;
            case this.materialTypes.PAPER:
                baseColor = this.scrollColors.paper.base;
                break;
            case this.materialTypes.MAGICAL_PAPER:
                baseColor = this.scrollColors.magical.base;
                glowColor = this.scrollColors.magical.glow;
                runeGlow = true;
                break;
            case this.materialTypes.ANCIENT_PARCHMENT:
                baseColor = age > 50 ? this.scrollColors.ancient.faded : this.scrollColors.ancient.base;
                break;
            case this.materialTypes.CRYSTAL_PAPER:
                baseColor = this.scrollColors.crystal.base;
                glowColor = this.scrollColors.crystal.energy;
                break;
        }

        // Apply aging
        if (age > 25) {
            baseColor = this.adjustColorForAge(baseColor, age);
        }

        // Enhance glow for higher qualities
        if (quality === this.scrollQualities.EPIC || quality === this.scrollQualities.LEGENDARY || quality === this.scrollQualities.MYTHICAL) {
            glowColor = this.adjustGlowColor(glowColor, quality);
        }

        return {
            baseColor: baseColor,
            glowColor: enchanted ? glowColor : null,
            runeGlow: runeGlow && enchanted,
            material: material,
            quality: quality,
            age: age,
            enchanted: enchanted
        };
    }

    /**
     * Generate content
     */
    generateContent(template, type, quality) {
        const content = {
            type: type,
            quality: quality,
            readability: this.qualityModifiers[quality].readability
        };

        switch (type) {
            case this.scrollTypes.SPELL:
                content.spellData = {
                    name: template.name,
                    type: template.spellType,
                    manaCost: template.manaCost,
                    effects: template.features
                };
                content.lines = 6;
                break;
            case this.scrollTypes.MAP:
                content.mapData = {
                    type: template.mapType,
                    locations: template.locations,
                    difficulty: template.difficulty
                };
                content.lines = 4;
                break;
            case this.scrollTypes.DOCUMENT:
                content.documentData = {
                    type: template.documentType,
                    contentType: template.contentType,
                    length: template.length
                };
                content.lines = template.length === 'long' ? 12 : template.length === 'medium' ? 8 : 4;
                break;
        }

        return content;
    }

    /**
     * Generate effects
     */
    generateEffects(template, stats, enchanted) {
        const effects = [];

        // Primary effect based on scroll type
        if (template.manaCost) {
            effects.push({
                type: 'spell_cast',
                power: stats.power,
                duration: 0,
                instant: true,
                manaCost: template.manaCost
            });
        }

        // Add durability effect
        effects.push({
            type: 'durability',
            power: stats.durability,
            duration: -1, // Permanent
            instant: false
        });

        // Add readability effect
        effects.push({
            type: 'readability',
            power: stats.readability,
            duration: -1,
            instant: false
        });

        // Add enchantment effects
        if (enchanted) {
            effects.push({
                type: 'enchantment',
                power: 1,
                duration: -1,
                instant: false
            });
        }

        return effects;
    }

    /**
     * Generate spell runes
     */
    generateSpellRunes(subtype) {
        const runeSets = {
            FIREBALL: ['🔥', '💥', '⚡'],
            HEAL: ['✨', '💚', '🌟'],
            TELEPORT: ['🌌', '⚡', '💫'],
            SUMMON: ['🐉', '📿', '🔮'],
            LIGHTNING: ['⚡', '🌩️', '💥'],
            SHIELD: ['🛡️', '✨', '🔰']
        };

        return runeSets[subtype] || ['📜', '✨', '🔮'];
    }

    /**
     * Adjust color for age
     */
    adjustColorForAge(baseColor, age) {
        const agingFactor = Math.min(age / 100, 1);
        const rgb = this.hexToRgb(baseColor);

        const newR = Math.max(0, rgb.r - agingFactor * 40);
        const newG = Math.max(0, rgb.g - agingFactor * 20);
        const newB = Math.max(0, rgb.b - agingFactor * 10);

        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * Adjust glow color for higher qualities
     */
    adjustGlowColor(baseColor, quality) {
        if (!baseColor) return '#FFFFFF';

        const rgb = this.hexToRgb(baseColor);
        let multiplier = 1.0;

        switch (quality) {
            case this.scrollQualities.EPIC:
                multiplier = 1.3;
                break;
            case this.scrollQualities.LEGENDARY:
                multiplier = 1.6;
                break;
            case this.scrollQualities.MYTHICAL:
                multiplier = 2.0;
                break;
        }

        const newR = Math.min(255, Math.floor(rgb.r * multiplier));
        const newG = Math.min(255, Math.floor(rgb.g * multiplier));
        const newB = Math.min(255, Math.floor(rgb.b * multiplier));

        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * Utility functions
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addMagicalPaperEffects(image, centerX, centerY, width, height) { return image; }
    async addAncientEffects(image, centerX, centerY, width, height) { return image; }
    async addCrystalEffects(image, centerX, centerY, width, height) { return image; }
    async addDecorativeBorder(image, centerX, centerY, size) { return image; }
    async addSeal(image, x, y, quality) { return image; }
    async addRibbons(image, centerX, centerY, material) { return image; }
    async addWearAndTear(image, agingFactor) { return image; }
    async addGlowEffect(image, color) { return image; }
    async addRuneGlow(image) { return image; }

    /**
     * Batch generate scrolls
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const scroll = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(scroll);
            } catch (error) {
                console.error(`Failed to generate scroll ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(s => s !== null);
    }

    /**
     * Generate scroll by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.subtype) options.subtype = criteria.subtype;
        if (criteria.material) options.material = criteria.material;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.size) options.size = criteria.size;
        if (criteria.age !== undefined) options.age = criteria.age;
        if (criteria.enchanted !== undefined) options.enchanted = criteria.enchanted;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get scroll statistics
     */
    getScrollStatistics() {
        return {
            totalTypes: Object.keys(this.scrollTypes).length,
            totalMaterials: Object.keys(this.materialTypes).length,
            totalQualities: Object.keys(this.scrollQualities).length,
            totalSizes: Object.keys(this.scrollSizes).length,
            spellScrollTypes: Object.keys(this.spellScrollTemplates).length,
            mapScrollTypes: Object.keys(this.mapScrollTemplates).length,
            documentScrollTypes: Object.keys(this.documentScrollTemplates).length
        };
    }

    /**
     * Export scroll data
     */
    async exportScrollData(scroll, outputPath) {
        const exportData = {
            ...scroll.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save scroll data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate scroll configuration
     */
    validateScrollConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.scrollTypes).includes(config.type)) {
            errors.push(`Invalid scroll type: ${config.type}`);
        }

        if (config.material && !Object.values(this.materialTypes).includes(config.material)) {
            errors.push(`Invalid material type: ${config.material}`);
        }

        if (config.quality && !Object.values(this.scrollQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.size && !Object.values(this.scrollSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        if (config.age !== undefined && (config.age < 0 || config.age > 100)) {
            errors.push(`Invalid age: ${config.age} (must be 0-100)`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = ScrollGenerator;
