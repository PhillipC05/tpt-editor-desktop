/**
 * Armor Generator - Complete armor and clothing sprite generation system
 * Generates helmets, chest armor, boots, gloves, belts, and shoulder armor with full customization
 */

const Jimp = require('jimp');
const path = require('path');

class ArmorGenerator {
    constructor() {
        this.armorTypes = {
            HELMETS: 'helmets',
            CHEST_ARMOR: 'chest_armor',
            BOOTS: 'boots',
            GLOVES: 'gloves',
            BELTS: 'belts',
            SHOULDERS: 'shoulders'
        };

        this.helmetTypes = {
            GREAT_HELM: 'great_helm',
            BASCINET: 'bascinet',
            SALLET: 'sallet',
            BARBUTE: 'barbute',
            MORION: 'morion',
            OPEN_HELMET: 'open_helmet',
            FULL_HELMET: 'full_helmet',
            VISOR_HELMET: 'visor_helmet',
            CROWN: 'crown',
            HOOD: 'hood'
        };

        this.chestArmorTypes = {
            PLATE_ARMOR: 'plate_armor',
            CHAINMAIL: 'chainmail',
            LEATHER_ARMOR: 'leather_armor',
            ROBES: 'robes',
            CLOAK: 'cloak',
            BREASTPLATE: 'breastplate',
            SCALE_ARMOR: 'scale_armor',
            LAMELLAR: 'lamellar',
            BRIGANDINE: 'brigandine',
            CUIRASS: 'cuirass'
        };

        this.bootTypes = {
            GREAVES: 'greaves',
            SABATONS: 'sabatons',
            LEATHER_BOOTS: 'leather_boots',
            CLOTH_SHOES: 'cloth_shoes',
            HEAVY_BOOTS: 'heavy_boots',
            LIGHT_BOOTS: 'light_boots',
            RIDING_BOOTS: 'riding_boots',
            COMBAT_BOOTS: 'combat_boots',
            MAGICAL_BOOTS: 'magical_boots',
            STEALTH_BOOTS: 'stealth_boots'
        };

        this.gloveTypes = {
            GAUNTLETS: 'gauntlets',
            BRACERS: 'bracers',
            LEATHER_GLOVES: 'leather_gloves',
            CLOTH_GLOVES: 'cloth_gloves',
            MITTENS: 'mittens',
            FINGERLESS_GLOVES: 'fingerless_gloves',
            ARM_GUARDS: 'arm_guards',
            VAMBRACES: 'vambraces',
            MAGICAL_GLOVES: 'magical_gloves',
            WORK_GLOVES: 'work_gloves'
        };

        this.beltTypes = {
            LEATHER_BELT: 'leather_belt',
            METAL_BUCKLE_BELT: 'metal_buckle_belt',
            DECORATIVE_BELT: 'decorative_belt',
            UTILITY_BELT: 'utility_belt',
            CEREMONIAL_BELT: 'ceremonial_belt',
            MAGICAL_BELT: 'magical_belt',
            CHAIN_BELT: 'chain_belt',
            ROPE_BELT: 'rope_belt',
            GEMMED_BELT: 'gemmed_belt',
            SIMPLE_BELT: 'simple_belt'
        };

        this.shoulderTypes = {
            PAULDRONS: 'pauldrons',
            SPAULDERS: 'spaulders',
            EPAULETS: 'epaulets',
            SHOULDER_GUARDS: 'shoulder_guards',
            SHOULDER_PLATES: 'shoulder_plates',
            SHOULDER_CAPE: 'shoulder_cape',
            SHOULDER_CHAIN: 'shoulder_chain',
            SHOULDER_PAD: 'shoulder_pad',
            MAGICAL_SHOULDERS: 'magical_shoulders',
            CEREMONIAL_SHOULDERS: 'ceremonial_shoulders'
        };

        this.materials = {
            IRON: 'iron',
            STEEL: 'steel',
            MITHRIL: 'mithril',
            ADAMANT: 'adamant',
            DARK_METAL: 'dark_metal',
            LEATHER: 'leather',
            HARD_LEATHER: 'hard_leather',
            DRAGON_LEATHER: 'dragon_leather',
            CLOTH: 'cloth',
            SILK: 'silk',
            MAGICAL_CLOTH: 'magical_cloth',
            GOLD: 'gold',
            SILVER: 'silver',
            BONE: 'bone',
            CRYSTAL: 'crystal',
            WOOD: 'wood'
        };

        this.qualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.sizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge'
        };

        // Material properties for stats calculation
        this.materialProperties = {
            [this.materials.IRON]: {
                durability: 8,
                defense: 6,
                weight: 1.2,
                magicResistance: 0,
                color: '#708090',
                shine: 0.3
            },
            [this.materials.STEEL]: {
                durability: 10,
                defense: 8,
                weight: 1.1,
                magicResistance: 1,
                color: '#2F4F4F',
                shine: 0.5
            },
            [this.materials.MITHRIL]: {
                durability: 12,
                defense: 9,
                weight: 0.6,
                magicResistance: 4,
                color: '#E6E6FA',
                shine: 0.8
            },
            [this.materials.ADAMANT]: {
                durability: 15,
                defense: 12,
                weight: 1.4,
                magicResistance: 6,
                color: '#696969',
                shine: 0.2
            },
            [this.materials.DARK_METAL]: {
                durability: 13,
                defense: 10,
                weight: 1.3,
                magicResistance: 8,
                color: '#2F2F2F',
                shine: 0.1
            },
            [this.materials.LEATHER]: {
                durability: 6,
                defense: 3,
                weight: 0.4,
                magicResistance: 1,
                color: '#8B4513',
                shine: 0.0
            },
            [this.materials.HARD_LEATHER]: {
                durability: 8,
                defense: 5,
                weight: 0.6,
                magicResistance: 2,
                color: '#654321',
                shine: 0.1
            },
            [this.materials.DRAGON_LEATHER]: {
                durability: 14,
                defense: 11,
                weight: 0.8,
                magicResistance: 7,
                color: '#8B0000',
                shine: 0.3
            },
            [this.materials.CLOTH]: {
                durability: 3,
                defense: 1,
                weight: 0.2,
                magicResistance: 2,
                color: '#F5F5DC',
                shine: 0.0
            },
            [this.materials.SILK]: {
                durability: 4,
                defense: 2,
                weight: 0.1,
                magicResistance: 3,
                color: '#FFFACD',
                shine: 0.2
            },
            [this.materials.MAGICAL_CLOTH]: {
                durability: 7,
                defense: 4,
                weight: 0.3,
                magicResistance: 8,
                color: '#9370DB',
                shine: 0.6
            },
            [this.materials.GOLD]: {
                durability: 5,
                defense: 3,
                weight: 1.5,
                magicResistance: 5,
                color: '#FFD700',
                shine: 0.9
            },
            [this.materials.SILVER]: {
                durability: 6,
                defense: 4,
                weight: 1.0,
                magicResistance: 4,
                color: '#C0C0C0',
                shine: 0.7
            },
            [this.materials.BONE]: {
                durability: 7,
                defense: 5,
                weight: 0.7,
                magicResistance: 3,
                color: '#F5F5DC',
                shine: 0.1
            },
            [this.materials.CRYSTAL]: {
                durability: 9,
                defense: 6,
                weight: 0.5,
                magicResistance: 9,
                color: '#87CEEB',
                shine: 0.8
            },
            [this.materials.WOOD]: {
                durability: 5,
                defense: 4,
                weight: 0.8,
                magicResistance: 1,
                color: '#8B4513',
                shine: 0.0
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.qualities.COMMON]: {
                statMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                valueMultiplier: 1.0,
                rarity: 1
            },
            [this.qualities.UNCOMMON]: {
                statMultiplier: 1.15,
                durabilityMultiplier: 1.25,
                valueMultiplier: 1.8,
                rarity: 2
            },
            [this.qualities.RARE]: {
                statMultiplier: 1.35,
                durabilityMultiplier: 1.6,
                valueMultiplier: 4.0,
                rarity: 3
            },
            [this.qualities.EPIC]: {
                statMultiplier: 1.6,
                durabilityMultiplier: 2.2,
                valueMultiplier: 12.0,
                rarity: 4
            },
            [this.qualities.LEGENDARY]: {
                statMultiplier: 2.0,
                durabilityMultiplier: 3.5,
                valueMultiplier: 40.0,
                rarity: 5
            },
            [this.qualities.MYTHICAL]: {
                statMultiplier: 3.0,
                durabilityMultiplier: 6.0,
                valueMultiplier: 150.0,
                rarity: 6
            }
        };

        // Armor templates with detailed specifications
        this.helmetTemplates = {
            [this.helmetTypes.GREAT_HELM]: {
                name: 'Great Helm',
                description: 'A large, imposing helmet that covers the entire head',
                baseDefense: 8,
                weight: 4,
                coverage: 0.95,
                visibilityPenalty: 0.3,
                features: ['full_coverage', 'intimidating', 'heavy']
            },
            [this.helmetTypes.BASCINET]: {
                name: 'Bascinet',
                description: 'A medieval helmet with a visor',
                baseDefense: 6,
                weight: 3,
                coverage: 0.85,
                visibilityPenalty: 0.2,
                features: ['visor', 'ventilation', 'balanced']
            },
            [this.helmetTypes.SALLET]: {
                description: 'A sleek helmet with a pointed top',
                baseDefense: 5,
                weight: 2.5,
                coverage: 0.8,
                visibilityPenalty: 0.15,
                features: ['aerodynamic', 'light', 'visor']
            },
            [this.helmetTypes.BARBUTE]: {
                name: 'Barbute',
                description: 'A helmet with a T-shaped opening',
                baseDefense: 7,
                weight: 3.5,
                coverage: 0.9,
                visibilityPenalty: 0.25,
                features: ['T_visage', 'balanced_protection', 'classic']
            },
            [this.helmetTypes.MORION]: {
                name: 'Morion',
                description: 'A crested helmet with a high comb',
                baseDefense: 4,
                weight: 2,
                coverage: 0.7,
                visibilityPenalty: 0.1,
                features: ['crested', 'ornamental', 'light']
            }
        };

        this.chestArmorTemplates = {
            [this.chestArmorTypes.PLATE_ARMOR]: {
                name: 'Full Plate Armor',
                description: 'Complete metal armor covering the entire torso',
                baseDefense: 15,
                weight: 25,
                coverage: 0.98,
                mobilityPenalty: 0.4,
                features: ['full_coverage', 'maximum_protection', 'heavy']
            },
            [this.chestArmorTypes.CHAINMAIL]: {
                name: 'Chainmail Shirt',
                description: 'Flexible armor made of interlocking metal rings',
                baseDefense: 8,
                weight: 12,
                coverage: 0.85,
                mobilityPenalty: 0.2,
                features: ['flexible', 'balanced', 'versatile']
            },
            [this.chestArmorTypes.LEATHER_ARMOR]: {
                name: 'Leather Armor',
                description: 'Armor made from hardened leather',
                baseDefense: 5,
                weight: 8,
                coverage: 0.75,
                mobilityPenalty: 0.1,
                features: ['light', 'quiet', 'flexible']
            },
            [this.chestArmorTypes.ROBES]: {
                name: 'Magical Robes',
                description: 'Flowing robes with magical properties',
                baseDefense: 3,
                weight: 4,
                coverage: 0.6,
                mobilityPenalty: 0.05,
                features: ['magical', 'comfortable', 'light']
            },
            [this.chestArmorTypes.CLOAK]: {
                name: 'Cloak',
                description: 'A flowing cloak for protection and style',
                baseDefense: 2,
                weight: 3,
                coverage: 0.4,
                mobilityPenalty: 0.02,
                features: ['stylish', 'versatile', 'light']
            }
        };

        this.bootTemplates = {
            [this.bootTypes.GREAVES]: {
                name: 'Greaves',
                description: 'Metal leg armor covering from knee to ankle',
                baseDefense: 6,
                weight: 8,
                coverage: 0.8,
                mobilityPenalty: 0.15,
                features: ['leg_protection', 'sturdy', 'metal']
            },
            [this.bootTypes.SABATONS]: {
                name: 'Sabatons',
                description: 'Metal foot armor with individual toe protection',
                baseDefense: 4,
                weight: 5,
                coverage: 0.9,
                mobilityPenalty: 0.2,
                features: ['foot_protection', 'detailed', 'heavy']
            },
            [this.bootTypes.LEATHER_BOOTS]: {
                name: 'Leather Boots',
                description: 'Comfortable leather boots for general use',
                baseDefense: 2,
                weight: 2,
                coverage: 0.6,
                mobilityPenalty: 0.05,
                features: ['comfortable', 'versatile', 'light']
            },
            [this.bootTypes.CLOTH_SHOES]: {
                name: 'Cloth Shoes',
                description: 'Simple cloth shoes for everyday wear',
                baseDefense: 1,
                weight: 1,
                coverage: 0.3,
                mobilityPenalty: 0.02,
                features: ['light', 'comfortable', 'casual']
            }
        };

        this.gloveTemplates = {
            [this.gloveTypes.GAUNTLETS]: {
                name: 'Gauntlets',
                description: 'Heavy metal gloves for maximum hand protection',
                baseDefense: 5,
                weight: 4,
                coverage: 0.95,
                mobilityPenalty: 0.25,
                features: ['hand_protection', 'heavy', 'metal']
            },
            [this.gloveTypes.BRACERS]: {
                name: 'Bracers',
                description: 'Arm guards covering the forearms',
                baseDefense: 3,
                weight: 2,
                coverage: 0.7,
                mobilityPenalty: 0.1,
                features: ['forearm_protection', 'balanced', 'versatile']
            },
            [this.gloveTypes.LEATHER_GLOVES]: {
                name: 'Leather Gloves',
                description: 'Flexible leather gloves for dexterity',
                baseDefense: 2,
                weight: 1,
                coverage: 0.8,
                mobilityPenalty: 0.05,
                features: ['dexterous', 'comfortable', 'light']
            },
            [this.gloveTypes.CLOTH_GLOVES]: {
                name: 'Cloth Gloves',
                description: 'Simple cloth gloves for basic protection',
                baseDefense: 1,
                weight: 0.5,
                coverage: 0.6,
                mobilityPenalty: 0.02,
                features: ['light', 'comfortable', 'basic']
            }
        };

        this.beltTemplates = {
            [this.beltTypes.LEATHER_BELT]: {
                name: 'Leather Belt',
                description: 'A sturdy leather belt for holding equipment',
                baseDefense: 1,
                weight: 1,
                capacity: 4,
                features: ['equipment_holder', 'durable', 'versatile']
            },
            [this.beltTypes.METAL_BUCKLE_BELT]: {
                name: 'Metal Buckle Belt',
                description: 'A belt with a decorative metal buckle',
                baseDefense: 2,
                weight: 1.5,
                capacity: 5,
                features: ['ornamental', 'sturdy', 'equipment_holder']
            },
            [this.beltTypes.DECORATIVE_BELT]: {
                name: 'Decorative Belt',
                description: 'An ornate belt for ceremonial occasions',
                baseDefense: 1,
                weight: 1.2,
                capacity: 3,
                features: ['ornamental', 'ceremonial', 'stylish']
            },
            [this.beltTypes.UTILITY_BELT]: {
                name: 'Utility Belt',
                description: 'A practical belt with multiple pouches',
                baseDefense: 1,
                weight: 2,
                capacity: 8,
                features: ['high_capacity', 'practical', 'pouches']
            }
        };

        this.shoulderTemplates = {
            [this.shoulderTypes.PAULDRONS]: {
                name: 'Pauldrons',
                description: 'Large metal shoulder guards',
                baseDefense: 6,
                weight: 6,
                coverage: 0.8,
                mobilityPenalty: 0.15,
                features: ['shoulder_protection', 'imposing', 'heavy']
            },
            [this.shoulderTypes.SPAULDERS]: {
                name: 'Spalders',
                description: 'Articulated shoulder armor plates',
                baseDefense: 5,
                weight: 4,
                coverage: 0.75,
                mobilityPenalty: 0.1,
                features: ['articulated', 'balanced', 'protective']
            },
            [this.shoulderTypes.EPAULETS]: {
                name: 'Epaulets',
                description: 'Decorative shoulder ornaments',
                baseDefense: 2,
                weight: 1,
                coverage: 0.4,
                mobilityPenalty: 0.02,
                features: ['ornamental', 'light', 'stylish']
            },
            [this.shoulderTypes.SHOULDER_GUARDS]: {
                name: 'Shoulder Guards',
                description: 'Simple shoulder protection pads',
                baseDefense: 3,
                weight: 2,
                coverage: 0.6,
                mobilityPenalty: 0.05,
                features: ['practical', 'light', 'protective']
            }
        };
    }

    /**
     * Generate armor piece
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.armorTypes.CHEST_ARMOR,
            subtype: options.subtype || this.chestArmorTypes.PLATE_ARMOR,
            material: options.material || this.materials.IRON,
            quality: options.quality || this.qualities.COMMON,
            size: options.size || this.sizes.MEDIUM,
            enchanted: options.enchanted || false,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate template based on type
        let template;
        switch (config.type) {
            case this.armorTypes.HELMETS:
                template = this.helmetTemplates[config.subtype];
                break;
            case this.armorTypes.CHEST_ARMOR:
                template = this.chestArmorTemplates[config.subtype];
                break;
            case this.armorTypes.BOOTS:
                template = this.bootTemplates[config.subtype];
                break;
            case this.armorTypes.GLOVES:
                template = this.gloveTemplates[config.subtype];
                break;
            case this.armorTypes.BELTS:
                template = this.beltTemplates[config.subtype];
                break;
            case this.armorTypes.SHOULDERS:
                template = this.shoulderTemplates[config.subtype];
                break;
            default:
                throw new Error(`Unknown armor type: ${config.type}`);
        }

        if (!template) {
            throw new Error(`Unknown armor subtype: ${config.subtype}`);
        }

        // Apply material and quality modifiers
        const materialProps = this.materialProperties[config.material];
        const qualityMods = this.qualityModifiers[config.quality];

        // Calculate final stats
        const finalStats = {
            defense: Math.round(template.baseDefense * qualityMods.statMultiplier * (materialProps.defense / 10)),
            durability: Math.round(materialProps.durability * qualityMods.durabilityMultiplier),
            weight: Math.round(template.weight * materialProps.weight * (config.size === this.sizes.SMALL ? 0.7 : config.size === this.sizes.LARGE ? 1.3 : 1.0)),
            magicResistance: Math.round(materialProps.magicResistance * qualityMods.statMultiplier),
            value: Math.round(20 * qualityMods.valueMultiplier * (materialProps.magicResistance + 1)),
            coverage: template.coverage || 0.8,
            mobilityPenalty: (template.mobilityPenalty || 0) * materialProps.weight,
            visibilityPenalty: template.visibilityPenalty || 0
        };

        // Generate armor data
        const armorData = {
            id: this.generateArmorId(),
            name: this.generateArmorName(template.name, config.material, config.quality),
            type: config.type,
            subtype: config.subtype,
            material: config.material,
            quality: config.quality,
            size: config.size,
            template: template,
            stats: finalStats,
            features: [...template.features],
            description: this.generateDescription(template, config.material, config.quality),
            appearance: this.generateAppearance(config.material, config.quality, config.enchanted),
            requirements: this.generateRequirements(finalStats.weight),
            enchantments: config.enchanted ? this.generateEnchantments(config.quality) : []
        };

        // Generate sprite image
        const spriteImage = await this.generateArmorSprite(armorData, config);

        return {
            image: spriteImage,
            data: armorData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'ArmorGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate armor sprite image
     */
    async generateArmorSprite(armorData, config) {
        const width = config.width || 64;
        const height = config.height || 64;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw armor based on type
        await this.drawArmorBase(image, armorData, config);

        // Apply material appearance
        await this.applyMaterialAppearance(image, armorData.material, armorData.quality);

        // Add quality effects
        if (armorData.quality !== this.qualities.COMMON) {
            await this.addQualityEffects(image, armorData.quality);
        }

        // Add enchantments
        if (armorData.enchantments.length > 0) {
            await this.addEnchantmentEffects(image, armorData.enchantments);
        }

        return image;
    }

    /**
     * Draw armor base shape
     */
    async drawArmorBase(image, armorData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = config.size === this.sizes.SMALL ? 0.7 : config.size === this.sizes.LARGE ? 1.3 : 1.0;

        switch (armorData.type) {
            case this.armorTypes.HELMETS:
                await this.drawHelmet(image, centerX, centerY, armorData.subtype, scale);
                break;
            case this.armorTypes.CHEST_ARMOR:
                await this.drawChestArmor(image, centerX, centerY, armorData.subtype, scale);
                break;
            case this.armorTypes.BOOTS:
                await this.drawBoots(image, centerX, centerY, armorData.subtype, scale);
                break;
            case this.armorTypes.GLOVES:
                await this.drawGloves(image, centerX, centerY, armorData.subtype, scale);
                break;
            case this.armorTypes.BELTS:
                await this.drawBelt(image, centerX, centerY, armorData.subtype, scale);
                break;
            case this.armorTypes.SHOULDERS:
                await this.drawShoulders(image, centerX, centerY, armorData.subtype, scale);
                break;
        }
    }

    /**
     * Draw helmet
     */
    async drawHelmet(image, x, y, subtype, scale) {
        switch (subtype) {
            case this.helmetTypes.GREAT_HELM:
                await this.drawGreatHelm(image, x, y, scale);
                break;
            case this.helmetTypes.BASCINET:
                await this.drawBascinet(image, x, y, scale);
                break;
            case this.helmetTypes.SALLET:
                await this.drawSallet(image, x, y, scale);
                break;
            case this.helmetTypes.BARBUTE:
                await this.drawBarbute(image, x, y, scale);
                break;
            case this.helmetTypes.MORION:
                await this.drawMorion(image, x, y, scale);
                break;
            default:
                await this.drawGreatHelm(image, x, y, scale);
        }
    }

    /**
     * Draw great helm
     */
    async drawGreatHelm(image, x, y, scale) {
        const width = 25 * scale;
        const height = 30 * scale;

        // Main helmet shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                // Create rounded rectangular shape
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.2) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY); // Iron color
                    }
                }
            }
        }

        // Eye slits
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -2; j < 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - 5 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF000000, pixelX, pixelY); // Black eye slits
                }
            }
        }

        // Nasal guard
        for (let i = -2; i < 2; i++) {
            for (let j = 0; j < 8 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - 2 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF708090, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw bascinet
     */
    async drawBascinet(image, x, y, scale) {
        const width = 22 * scale;
        const height = 28 * scale;

        // Main helmet
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.1) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // Visor
        for (let i = -10 * scale; i < 10 * scale; i++) {
            for (let j = -3; j < 3; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF2F4F4F, pixelX, pixelY); // Darker visor
                }
            }
        }
    }

    /**
     * Draw sallet
     */
    async drawSallet(image, x, y, scale) {
        const width = 20 * scale;
        const height = 25 * scale;

        // Main helmet
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // Pointed top
        for (let i = -3; i < 3; i++) {
            for (let j = -height / 2; j < -height / 2 + 5 * scale; j++) {
                if (Math.abs(i) < (1 - (j + height / 2) / (5 * scale)) * 3) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw barbute
     */
    async drawBarbute(image, x, y, scale) {
        const width = 24 * scale;
        const height = 26 * scale;

        // Main helmet
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // T-shaped face opening
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -2; j < 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j + 2 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF000000, pixelX, pixelY); // Face opening
                }
            }
        }

        for (let i = -2; i < 2; i++) {
            for (let j = 0; j < 6 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF000000, pixelX, pixelY); // Vertical part of T
                }
            }
        }
    }

    /**
     * Draw morion
     */
    async drawMorion(image, x, y, scale) {
        const width = 18 * scale;
        const height = 22 * scale;

        // Main helmet
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // Crest
        for (let i = -12 * scale; i < 12 * scale; i++) {
            for (let j = -3; j < 3; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - 8 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF708090, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw chest armor
     */
    async drawChestArmor(image, x, y, subtype, scale) {
        switch (subtype) {
            case this.chestArmorTypes.PLATE_ARMOR:
                await this.drawPlateArmor(image, x, y, scale);
                break;
            case this.chestArmorTypes.CHAINMAIL:
                await this.drawChainmail(image, x, y, scale);
                break;
            case this.chestArmorTypes.LEATHER_ARMOR:
                await this.drawLeatherArmor(image, x, y, scale);
                break;
            case this.chestArmorTypes.ROBES:
                await this.drawRobes(image, x, y, scale);
                break;
            case this.chestArmorTypes.CLOAK:
                await this.drawCloak(image, x, y, scale);
                break;
            default:
                await this.drawPlateArmor(image, x, y, scale);
        }
    }

    /**
     * Draw plate armor
     */
    async drawPlateArmor(image, x, y, scale) {
        const width = 30 * scale;
        const height = 40 * scale;

        // Breastplate
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // Shoulder plates
        for (let i = -width / 2 - 5 * scale; i < -width / 2; i++) {
            for (let j = -height / 4; j < height / 4; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF708090, pixelX, pixelY);
                }
            }
        }

        for (let i = width / 2; i < width / 2 + 5 * scale; i++) {
            for (let j = -height / 4; j < height / 4; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF708090, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw chainmail
     */
    async drawChainmail(image, x, y, scale) {
        const width = 28 * scale;
        const height = 38 * scale;

        // Chainmail pattern
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    // Create chainmail pattern
                    const pattern = (Math.floor(i / 2) + Math.floor(j / 2)) % 2;
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        const color = pattern === 0 ? 0xFF708090 : 0xFF2F4F4F;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw leather armor
     */
    async drawLeatherArmor(image, x, y, scale) {
        const width = 26 * scale;
        const height = 36 * scale;

        // Leather armor shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF8B4513, pixelX, pixelY);
                    }
                }
            }
        }

        // Leather stitching
        for (let i = -width / 2; i < width / 2; i += 4 * scale) {
            for (let j = -height / 2; j < height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF654321, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw robes
     */
    async drawRobes(image, x, y, scale) {
        const width = 24 * scale;
        const height = 42 * scale;

        // Robe shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFF5F5DC, pixelX, pixelY);
                    }
                }
            }
        }

        // Robe folds
        for (let i = -width / 3; i < width / 3; i += 3 * scale) {
            for (let j = -height / 2; j < height / 2; j++) {
                if (Math.sin(i * 0.5) > 0.5) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFE6E6FA, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw cloak
     */
    async drawCloak(image, x, y, scale) {
        const width = 32 * scale;
        const height = 45 * scale;

        // Cloak shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                // Create triangular cloak shape
                const relativeY = (j + height / 2) / height;
                const maxWidth = width * (1 - relativeY * 0.7);
                if (Math.abs(i) < maxWidth / 2) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF654321, pixelX, pixelY);
                    }
                }
            }
        }

        // Hood
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -height / 2; j < -height / 2 + 12 * scale; j++) {
                const distFromCenter = Math.abs(i) / (8 * scale) + Math.abs(j + height / 2) / (12 * scale);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF654321, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw boots
     */
    async drawBoots(image, x, y, subtype, scale) {
        switch (subtype) {
            case this.bootTypes.GREAVES:
                await this.drawGreaves(image, x, y, scale);
                break;
            case this.bootTypes.SABATONS:
                await this.drawSabatons(image, x, y, scale);
                break;
            case this.bootTypes.LEATHER_BOOTS:
                await this.drawLeatherBoots(image, x, y, scale);
                break;
            case this.bootTypes.CLOTH_SHOES:
                await this.drawClothShoes(image, x, y, scale);
                break;
            default:
                await this.drawLeatherBoots(image, x, y, scale);
        }
    }

    /**
     * Draw greaves
     */
    async drawGreaves(image, x, y, scale) {
        const width = 12 * scale;
        const height = 25 * scale;

        // Metal greaves
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // Knee joint
        for (let i = -6 * scale; i < 6 * scale; i++) {
            for (let j = -2; j < 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - 8 * scale);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF2F4F4F, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw sabatons
     */
    async drawSabatons(image, x, y, scale) {
        const width = 10 * scale;
        const height = 15 * scale;

        // Metal foot armor
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // Individual toe plates
        for (let toe = 0; toe < 5; toe++) {
            const toeX = x - 6 * scale + toe * 3 * scale;
            for (let i = -1; i < 1; i++) {
                for (let j = -2; j < 2; j++) {
                    const pixelX = Math.floor(toeX + i);
                    const pixelY = Math.floor(y + j + 5 * scale);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF2F4F4F, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw leather boots
     */
    async drawLeatherBoots(image, x, y, scale) {
        const width = 8 * scale;
        const height = 18 * scale;

        // Leather boot shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF8B4513, pixelX, pixelY);
                    }
                }
            }
        }

        // Boot stitching
        for (let i = -width / 2; i < width / 2; i += 2 * scale) {
            for (let j = -height / 2; j < height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF654321, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw cloth shoes
     */
    async drawClothShoes(image, x, y, scale) {
        const width = 6 * scale;
        const height = 12 * scale;

        // Cloth shoe shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFF5F5DC, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw gloves
     */
    async drawGloves(image, x, y, subtype, scale) {
        switch (subtype) {
            case this.gloveTypes.GAUNTLETS:
                await this.drawGauntlets(image, x, y, scale);
                break;
            case this.gloveTypes.BRACERS:
                await this.drawBracers(image, x, y, scale);
                break;
            case this.gloveTypes.LEATHER_GLOVES:
                await this.drawLeatherGloves(image, x, y, scale);
                break;
            case this.gloveTypes.CLOTH_GLOVES:
                await this.drawClothGloves(image, x, y, scale);
                break;
            default:
                await this.drawLeatherGloves(image, x, y, scale);
        }
    }

    /**
     * Draw gauntlets
     */
    async drawGauntlets(image, x, y, scale) {
        const width = 8 * scale;
        const height = 12 * scale;

        // Metal gauntlet
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // Finger joints
        for (let finger = 0; finger < 4; finger++) {
            const fingerY = y - 4 * scale + finger * 3 * scale;
            for (let i = -3; i < 3; i++) {
                for (let j = -1; j < 1; j++) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(fingerY + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF2F4F4F, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw bracers
     */
    async drawBracers(image, x, y, scale) {
        const width = 6 * scale;
        const height = 15 * scale;

        // Arm guard
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw leather gloves
     */
    async drawLeatherGloves(image, x, y, scale) {
        const width = 5 * scale;
        const height = 10 * scale;

        // Leather glove shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF8B4513, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw cloth gloves
     */
    async drawClothGloves(image, x, y, scale) {
        const width = 4 * scale;
        const height = 8 * scale;

        // Cloth glove shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFF5F5DC, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw belt
     */
    async drawBelt(image, x, y, subtype, scale) {
        switch (subtype) {
            case this.beltTypes.LEATHER_BELT:
                await this.drawLeatherBelt(image, x, y, scale);
                break;
            case this.beltTypes.METAL_BUCKLE_BELT:
                await this.drawMetalBuckleBelt(image, x, y, scale);
                break;
            case this.beltTypes.DECORATIVE_BELT:
                await this.drawDecorativeBelt(image, x, y, scale);
                break;
            case this.beltTypes.UTILITY_BELT:
                await this.drawUtilityBelt(image, x, y, scale);
                break;
            default:
                await this.drawLeatherBelt(image, x, y, scale);
        }
    }

    /**
     * Draw leather belt
     */
    async drawLeatherBelt(image, x, y, scale) {
        const width = 25 * scale;
        const height = 4 * scale;

        // Belt strap
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY);
                }
            }
        }

        // Simple buckle
        for (let i = -3; i < 3; i++) {
            for (let j = -3; j < 3; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF708090, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw metal buckle belt
     */
    async drawMetalBuckleBelt(image, x, y, scale) {
        await this.drawLeatherBelt(image, x, y, scale);

        // Decorative metal buckle
        for (let i = -4; i < 4; i++) {
            for (let j = -4; j < 4; j++) {
                if (Math.abs(i) + Math.abs(j) < 6) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFC0C0C0, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw decorative belt
     */
    async drawDecorativeBelt(image, x, y, scale) {
        await this.drawLeatherBelt(image, x, y, scale);

        // Decorative elements
        for (let i = -20 * scale; i < 20 * scale; i += 5 * scale) {
            for (let j = -2; j < 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFFFD700, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw utility belt
     */
    async drawUtilityBelt(image, x, y, scale) {
        await this.drawLeatherBelt(image, x, y, scale);

        // Pouches
        for (let pouch = -2; pouch <= 2; pouch++) {
            const pouchX = x + pouch * 6 * scale;
            for (let i = -2; i < 2; i++) {
                for (let j = -3; j < 1; j++) {
                    const pixelX = Math.floor(pouchX + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF654321, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw shoulders
     */
    async drawShoulders(image, x, y, subtype, scale) {
        switch (subtype) {
            case this.shoulderTypes.PAULDRONS:
                await this.drawPauldrons(image, x, y, scale);
                break;
            case this.shoulderTypes.SPAULDERS:
                await this.drawSpalders(image, x, y, scale);
                break;
            case this.shoulderTypes.EPAULETS:
                await this.drawEpaulets(image, x, y, scale);
                break;
            case this.shoulderTypes.SHOULDER_GUARDS:
                await this.drawShoulderGuards(image, x, y, scale);
                break;
            default:
                await this.drawPauldrons(image, x, y, scale);
        }
    }

    /**
     * Draw pauldrons
     */
    async drawPauldrons(image, x, y, scale) {
        const width = 15 * scale;
        const height = 12 * scale;

        // Large shoulder plate
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // Spikes or ridges
        for (let i = -width / 3; i < width / 3; i += 3 * scale) {
            for (let j = -height / 2 - 2 * scale; j < -height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF708090, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw spalders
     */
    async drawSpalders(image, x, y, scale) {
        const width = 12 * scale;
        const height = 10 * scale;

        // Articulated shoulder plate
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }

        // Articulation lines
        for (let i = -width / 2; i < width / 2; i += 4 * scale) {
            for (let j = -height / 2; j < height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF2F4F4F, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw epaulets
     */
    async drawEpaulets(image, x, y, scale) {
        const width = 8 * scale;
        const height = 6 * scale;

        // Decorative shoulder ornaments
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFFD700, pixelX, pixelY);
                    }
                }
            }
        }

        // Tassels
        for (let i = -width / 3; i < width / 3; i += 2 * scale) {
            for (let j = height / 2; j < height / 2 + 4 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFFFD700, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw shoulder guards
     */
    async drawShoulderGuards(image, x, y, scale) {
        const width = 10 * scale;
        const height = 8 * scale;

        // Simple shoulder protection
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF708090, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Apply material appearance
     */
    async applyMaterialAppearance(image, material, quality) {
        const materialProps = this.materialProperties[material];
        const qualityMods = this.qualityModifiers[quality];

        // Apply material color tint
        const tintColor = this.hexToRgb(materialProps.color);

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            const r = image.bitmap.data[idx];
            const g = image.bitmap.data[idx + 1];
            const b = image.bitmap.data[idx + 2];
            const a = image.bitmap.data[idx + 3];

            if (a > 0) {
                // Apply material tint
                const newR = Math.min(255, Math.floor(r * 0.7 + tintColor.r * 0.3));
                const newG = Math.min(255, Math.floor(g * 0.7 + tintColor.g * 0.3));
                const newB = Math.min(255, Math.floor(b * 0.7 + tintColor.b * 0.3));

                image.bitmap.data[idx] = newR;
                image.bitmap.data[idx + 1] = newG;
                image.bitmap.data[idx + 2] = newB;
            }
        });

        // Add material-specific effects
        if (material === this.materials.CRYSTAL) {
            await this.addCrystalEffect(image);
        } else if (material === this.materials.GOLD) {
            await this.addGoldEffect(image);
        } else if (material === this.materials.DARK_METAL) {
            await this.addDarkMetalEffect(image);
        }
    }

    /**
     * Add quality effects
     */
    async addQualityEffects(image, quality) {
        switch (quality) {
            case this.qualities.RARE:
                await this.addRareEffect(image);
                break;
            case this.qualities.EPIC:
                await this.addEpicEffect(image);
                break;
            case this.qualities.LEGENDARY:
                await this.addLegendaryEffect(image);
                break;
            case this.qualities.MYTHICAL:
                await this.addMythicalEffect(image);
                break;
        }
    }

    /**
     * Add enchantment effects
     */
    async addEnchantmentEffects(image, enchantments) {
        for (const enchantment of enchantments) {
            switch (enchantment.type) {
                case 'fire':
                    await this.addFireEnchantment(image);
                    break;
                case 'ice':
                    await this.addIceEnchantment(image);
                    break;
                case 'lightning':
                    await this.addLightningEnchantment(image);
                    break;
                case 'holy':
                    await this.addHolyEnchantment(image);
                    break;
            }
        }
    }

    /**
     * Generate armor ID
     */
    generateArmorId() {
        return 'armor_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate armor name
     */
    generateArmorName(baseName, material, quality) {
        const materialNames = {
            [this.materials.IRON]: 'Iron',
            [this.materials.STEEL]: 'Steel',
            [this.materials.MITHRIL]: 'Mithril',
            [this.materials.ADAMANT]: 'Adamant',
            [this.materials.DARK_METAL]: 'Dark',
            [this.materials.LEATHER]: 'Leather',
            [this.materials.HARD_LEATHER]: 'Hard Leather',
            [this.materials.DRAGON_LEATHER]: 'Dragon Leather',
            [this.materials.CLOTH]: 'Cloth',
            [this.materials.SILK]: 'Silk',
            [this.materials.MAGICAL_CLOTH]: 'Magical',
            [this.materials.GOLD]: 'Golden',
            [this.materials.SILVER]: 'Silver',
            [this.materials.BONE]: 'Bone',
            [this.materials.CRYSTAL]: 'Crystal',
            [this.materials.WOOD]: 'Wooden'
        };

        const qualityNames = {
            [this.qualities.COMMON]: '',
            [this.qualities.UNCOMMON]: 'Fine ',
            [this.qualities.RARE]: 'Rare ',
            [this.qualities.EPIC]: 'Epic ',
            [this.qualities.LEGENDARY]: 'Legendary ',
            [this.qualities.MYTHICAL]: 'Mythical '
        };

        const materialName = materialNames[material] || '';
        const qualityName = qualityNames[quality] || '';

        return `${qualityName}${materialName} ${baseName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(template, material, quality) {
        const materialDesc = {
            [this.materials.IRON]: 'durable and reliable',
            [this.materials.STEEL]: 'strong and resilient',
            [this.materials.MITHRIL]: 'light and magical',
            [this.materials.ADAMANT]: 'unbreakable and powerful',
            [this.materials.DARK_METAL]: 'cursed and formidable',
            [this.materials.LEATHER]: 'flexible and quiet',
            [this.materials.HARD_LEATHER]: 'tough and protective',
            [this.materials.DRAGON_LEATHER]: 'exotic and fire-resistant',
            [this.materials.CLOTH]: 'comfortable and lightweight',
            [this.materials.SILK]: 'elegant and smooth',
            [this.materials.MAGICAL_CLOTH]: 'enchanted and mystical',
            [this.materials.GOLD]: 'ornate and valuable',
            [this.materials.SILVER]: 'pure and reflective',
            [this.materials.BONE]: 'savage and primal',
            [this.materials.CRYSTAL]: 'radiant and magical',
            [this.materials.WOOD]: 'natural and sturdy'
        };

        const qualityDesc = {
            [this.qualities.COMMON]: 'A standard piece of armor',
            [this.qualities.UNCOMMON]: 'A well-crafted piece of armor',
            [this.qualities.RARE]: 'A finely made piece of armor',
            [this.qualities.EPIC]: 'A masterfully crafted piece of armor',
            [this.qualities.LEGENDARY]: 'A legendary piece of armor of great power',
            [this.qualities.MYTHICAL]: 'A mythical piece of armor of unimaginable power'
        };

        const materialDescription = materialDesc[material] || 'well-made';
        const qualityDescription = qualityDesc[quality] || 'A piece of armor';

        return `${qualityDescription} made of ${materialDescription} material. ${template.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(material, quality, enchanted) {
        const materialProps = this.materialProperties[material];

        return {
            primaryColor: materialProps.color,
            secondaryColor: this.adjustBrightness(materialProps.color, -0.3),
            glowColor: enchanted ? this.generateGlowColor(quality) : null,
            effects: this.generateVisualEffects(material, quality, enchanted)
        };
    }

    /**
     * Generate requirements
     */
    generateRequirements(weight) {
        return {
            strength: Math.max(1, Math.floor(weight / 3)),
            level: Math.max(1, Math.floor(weight / 4))
        };
    }

    /**
     * Generate enchantments
     */
    generateEnchantments(quality) {
        const enchantments = [];
        const enchantmentCount = Math.floor(this.qualityModifiers[quality].rarity / 2);

        const possibleEnchantments = [
            { type: 'fire', name: 'of Flame', effect: '+Fire Resistance' },
            { type: 'ice', name: 'of Frost', effect: '+Ice Resistance' },
            { type: 'lightning', name: 'of Thunder', effect: '+Lightning Resistance' },
            { type: 'holy', name: 'of Light', effect: '+Holy Resistance' },
            { type: 'protection', name: 'of Protection', effect: '+Defense' },
            { type: 'durability', name: 'of Durability', effect: '+Max Durability' }
        ];

        for (let i = 0; i < enchantmentCount; i++) {
            const enchantment = possibleEnchantments[Math.floor(Math.random() * possibleEnchantments.length)];
            enchantments.push(enchantment);
        }

        return enchantments;
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

    adjustBrightness(hex, factor) {
        const rgb = this.hexToRgb(hex);
        const newR = Math.max(0, Math.min(255, Math.floor(rgb.r * (1 + factor))));
        const newG = Math.max(0, Math.min(255, Math.floor(rgb.g * (1 + factor))));
        const newB = Math.max(0, Math.min(255, Math.floor(rgb.b * (1 + factor))));

        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    generateGlowColor(quality) {
        const colors = {
            [this.qualities.RARE]: '#FFD700',
            [this.qualities.EPIC]: '#FF4500',
            [this.qualities.LEGENDARY]: '#9370DB',
            [this.qualities.MYTHICAL]: '#FF1493'
        };
        return colors[quality] || '#FFFFFF';
    }

    generateVisualEffects(material, quality, enchanted) {
        const effects = [];

        if (material === this.materials.CRYSTAL) {
            effects.push('glowing');
        }

        if (quality === this.qualities.LEGENDARY) {
            effects.push('legendary_aura');
        }

        if (enchanted) {
            effects.push('magical_glow');
        }

        return effects;
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addCrystalEffect(image) { return image; }
    async addGoldEffect(image) { return image; }
    async addDarkMetalEffect(image) { return image; }
    async addRareEffect(image) { return image; }
    async addEpicEffect(image) { return image; }
    async addLegendaryEffect(image) { return image; }
    async addMythicalEffect(image) { return image; }

    /**
     * Add fire enchantment effect
     */
    async addFireEnchantment(image) {
        // Add red/orange glow effect
        return image;
    }

    /**
     * Add ice enchantment effect
     */
    async addIceEnchantment(image) {
        // Add blue glow effect
        return image;
    }

    /**
     * Add lightning enchantment effect
     */
    async addLightningEnchantment(image) {
        // Add white/blue electrical effect
        return image;
    }

    /**
     * Add holy enchantment effect
     */
    async addHolyEnchantment(image) {
        // Add golden glow effect
        return image;
    }

    /**
     * Batch generate armor
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const armor = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(armor);
            } catch (error) {
                console.error(`Failed to generate armor ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(a => a !== null);
    }

    /**
     * Generate armor by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.subtype) options.subtype = criteria.subtype;
        if (criteria.material) options.material = criteria.material;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.size) options.size = criteria.size;
        if (criteria.enchanted !== undefined) options.enchanted = criteria.enchanted;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get armor statistics
     */
    getArmorStatistics() {
        return {
            totalTypes: Object.keys(this.armorTypes).length,
            totalHelmetTypes: Object.keys(this.helmetTypes).length,
            totalChestTypes: Object.keys(this.chestArmorTypes).length,
            totalBootTypes: Object.keys(this.bootTypes).length,
            totalGloveTypes: Object.keys(this.gloveTypes).length,
            totalBeltTypes: Object.keys(this.beltTypes).length,
            totalShoulderTypes: Object.keys(this.shoulderTypes).length,
            totalMaterials: Object.keys(this.materials).length,
            totalQualities: Object.keys(this.qualities).length,
            totalSizes: Object.keys(this.sizes).length
        };
    }

    /**
     * Export armor data
     */
    async exportArmorData(armor, outputPath) {
        const exportData = {
            ...armor.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save armor data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate armor configuration
     */
    validateArmorConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.armorTypes).includes(config.type)) {
            errors.push(`Invalid armor type: ${config.type}`);
        }

        if (config.material && !Object.values(this.materials).includes(config.material)) {
            errors.push(`Invalid material: ${config.material}`);
        }

        if (config.quality && !Object.values(this.qualities).includes(config.quality)) {
            errors.push(`Invalid quality: ${config.quality}`);
        }

        if (config.size && !Object.values(this.sizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = ArmorGenerator;
