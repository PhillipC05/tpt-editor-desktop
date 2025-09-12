/**
 * Weapon Generator - Individual weapon sprites for game assets
 * Generates swords, bows, staffs, guns, and other weapons with variations
 */

const Jimp = require('jimp');
const path = require('path');

class WeaponGenerator {
    constructor() {
        this.weaponTypes = {
            SWORDS: 'swords',
            BOWS: 'bows',
            STAFFS: 'staffs',
            AXES: 'axes',
            HAMMERS: 'hammers',
            DAGGERS: 'daggers',
            SPEARS: 'spears',
            GUNS: 'guns',
            MAGICAL: 'magical',
            SHIELDS: 'shields'
        };

        this.weaponMaterials = {
            IRON: 'iron',
            STEEL: 'steel',
            SILVER: 'silver',
            GOLD: 'gold',
            MITHRIL: 'mithril',
            ADAMANT: 'adamant',
            WOOD: 'wood',
            BONE: 'bone',
            CRYSTAL: 'crystal',
            DARK_METAL: 'dark_metal'
        };

        this.weaponQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.weaponSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge'
        };

        // Base weapon templates
        this.weaponTemplates = {
            [this.weaponTypes.SWORDS]: [
                {
                    name: 'Longsword',
                    description: 'A classic straight sword',
                    baseDamage: 8,
                    weight: 3,
                    traits: ['versatile', 'balanced']
                },
                {
                    name: 'Broadsword',
                    description: 'A wide, heavy blade',
                    baseDamage: 10,
                    weight: 4,
                    traits: ['heavy', 'powerful']
                },
                {
                    name: 'Rapier',
                    description: 'A slender thrusting sword',
                    baseDamage: 6,
                    weight: 2,
                    traits: ['fast', 'precise']
                },
                {
                    name: 'Katana',
                    description: 'An elegant curved blade',
                    baseDamage: 9,
                    weight: 3,
                    traits: ['sharp', 'graceful']
                },
                {
                    name: 'Claymore',
                    description: 'A massive two-handed sword',
                    baseDamage: 12,
                    weight: 6,
                    traits: ['massive', 'slow']
                }
            ],
            [this.weaponTypes.BOWS]: [
                {
                    name: 'Shortbow',
                    description: 'A simple wooden bow',
                    baseDamage: 6,
                    weight: 2,
                    traits: ['ranged', 'fast']
                },
                {
                    name: 'Longbow',
                    description: 'A tall, powerful bow',
                    baseDamage: 8,
                    weight: 3,
                    traits: ['ranged', 'accurate']
                },
                {
                    name: 'Crossbow',
                    description: 'A mechanical ranged weapon',
                    baseDamage: 10,
                    weight: 4,
                    traits: ['ranged', 'powerful']
                },
                {
                    name: 'Recurve Bow',
                    description: 'A curved composite bow',
                    baseDamage: 7,
                    weight: 2,
                    traits: ['ranged', 'reliable']
                }
            ],
            [this.weaponTypes.STAFFS]: [
                {
                    name: 'Wooden Staff',
                    description: 'A simple wooden staff',
                    baseDamage: 4,
                    weight: 3,
                    traits: ['magical', 'versatile']
                },
                {
                    name: 'Crystal Staff',
                    description: 'A staff topped with crystal',
                    baseDamage: 6,
                    weight: 4,
                    traits: ['magical', 'elemental']
                },
                {
                    name: 'Archmage Staff',
                    description: 'An ornate magical staff',
                    baseDamage: 8,
                    weight: 5,
                    traits: ['magical', 'powerful']
                },
                {
                    name: 'Druid Staff',
                    description: 'A nature-infused staff',
                    baseDamage: 5,
                    weight: 3,
                    traits: ['magical', 'natural']
                }
            ],
            [this.weaponTypes.AXES]: [
                {
                    name: 'Hand Axe',
                    description: 'A single-handed axe',
                    baseDamage: 6,
                    weight: 3,
                    traits: ['versatile', 'sharp']
                },
                {
                    name: 'Battle Axe',
                    description: 'A large two-handed axe',
                    baseDamage: 10,
                    weight: 5,
                    traits: ['heavy', 'powerful']
                },
                {
                    name: 'War Axe',
                    description: 'A balanced combat axe',
                    baseDamage: 8,
                    weight: 4,
                    traits: ['balanced', 'reliable']
                }
            ],
            [this.weaponTypes.HAMMERS]: [
                {
                    name: 'War Hammer',
                    description: 'A heavy metal hammer',
                    baseDamage: 8,
                    weight: 5,
                    traits: ['heavy', 'crushing']
                },
                {
                    name: 'Maul',
                    description: 'A massive two-handed hammer',
                    baseDamage: 12,
                    weight: 8,
                    traits: ['massive', 'destructive']
                },
                {
                    name: 'Mace',
                    description: 'A spiked metal club',
                    baseDamage: 7,
                    weight: 4,
                    traits: ['spiked', 'versatile']
                }
            ],
            [this.weaponTypes.DAGGERS]: [
                {
                    name: 'Dagger',
                    description: 'A simple stabbing knife',
                    baseDamage: 4,
                    weight: 1,
                    traits: ['fast', 'concealable']
                },
                {
                    name: 'Dirk',
                    description: 'A long, thin dagger',
                    baseDamage: 5,
                    weight: 1,
                    traits: ['precise', 'fast']
                },
                {
                    name: 'Kris',
                    description: 'A wavy-bladed dagger',
                    baseDamage: 6,
                    weight: 2,
                    traits: ['exotic', 'sharp']
                }
            ],
            [this.weaponTypes.SPEARS]: [
                {
                    name: 'Spear',
                    description: 'A long pole with a pointed tip',
                    baseDamage: 7,
                    weight: 4,
                    traits: ['reach', 'versatile']
                },
                {
                    name: 'Lance',
                    description: 'A cavalry spear',
                    baseDamage: 9,
                    weight: 6,
                    traits: ['mounted', 'powerful']
                },
                {
                    name: 'Trident',
                    description: 'A three-pronged spear',
                    baseDamage: 8,
                    weight: 5,
                    traits: ['exotic', 'versatile']
                }
            ],
            [this.weaponTypes.GUNS]: [
                {
                    name: 'Pistol',
                    description: 'A single-shot handgun',
                    baseDamage: 8,
                    weight: 2,
                    traits: ['ranged', 'fast']
                },
                {
                    name: 'Rifle',
                    description: 'A long-barreled firearm',
                    baseDamage: 12,
                    weight: 4,
                    traits: ['ranged', 'accurate']
                },
                {
                    name: 'Shotgun',
                    description: 'A short-range scatter weapon',
                    baseDamage: 10,
                    weight: 3,
                    traits: ['ranged', 'devastating']
                }
            ],
            [this.weaponTypes.MAGICAL]: [
                {
                    name: 'Spellblade',
                    description: 'A sword infused with magic',
                    baseDamage: 9,
                    weight: 3,
                    traits: ['magical', 'versatile']
                },
                {
                    name: 'Elemental Orb',
                    description: 'A floating magical sphere',
                    baseDamage: 7,
                    weight: 1,
                    traits: ['magical', 'elemental']
                },
                {
                    name: 'Rune Sword',
                    description: 'A sword covered in glowing runes',
                    baseDamage: 11,
                    weight: 4,
                    traits: ['magical', 'powerful']
                }
            ],
            [this.weaponTypes.SHIELDS]: [
                {
                    name: 'Buckler',
                    description: 'A small round shield',
                    baseDamage: 2,
                    weight: 2,
                    traits: ['defensive', 'fast']
                },
                {
                    name: 'Heater Shield',
                    description: 'A medium kite-shaped shield',
                    baseDamage: 1,
                    weight: 4,
                    traits: ['defensive', 'balanced']
                },
                {
                    name: 'Tower Shield',
                    description: 'A large rectangular shield',
                    baseDamage: 1,
                    weight: 8,
                    traits: ['defensive', 'heavy']
                }
            ]
        };

        // Material properties
        this.materialProperties = {
            [this.weaponMaterials.IRON]: {
                durability: 8,
                sharpness: 6,
                weight: 1.0,
                magic: 0,
                color: '#708090'
            },
            [this.weaponMaterials.STEEL]: {
                durability: 10,
                sharpness: 8,
                weight: 1.1,
                magic: 0,
                color: '#2F4F4F'
            },
            [this.weaponMaterials.SILVER]: {
                durability: 6,
                sharpness: 7,
                weight: 0.9,
                magic: 3,
                color: '#C0C0C0'
            },
            [this.weaponMaterials.GOLD]: {
                durability: 4,
                sharpness: 5,
                weight: 1.2,
                magic: 2,
                color: '#FFD700'
            },
            [this.weaponMaterials.MITHRIL]: {
                durability: 12,
                sharpness: 9,
                weight: 0.7,
                magic: 5,
                color: '#E6E6FA'
            },
            [this.weaponMaterials.ADAMANT]: {
                durability: 15,
                sharpness: 10,
                weight: 1.3,
                magic: 4,
                color: '#696969'
            },
            [this.weaponMaterials.WOOD]: {
                durability: 5,
                sharpness: 3,
                weight: 0.6,
                magic: 1,
                color: '#8B4513'
            },
            [this.weaponMaterials.BONE]: {
                durability: 6,
                sharpness: 8,
                weight: 0.8,
                magic: 2,
                color: '#F5F5DC'
            },
            [this.weaponMaterials.CRYSTAL]: {
                durability: 7,
                sharpness: 9,
                weight: 0.5,
                magic: 8,
                color: '#87CEEB'
            },
            [this.weaponMaterials.DARK_METAL]: {
                durability: 11,
                sharpness: 7,
                weight: 1.4,
                magic: 6,
                color: '#2F2F2F'
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.weaponQualities.COMMON]: {
                damageMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                valueMultiplier: 1.0,
                rarity: 1
            },
            [this.weaponQualities.UNCOMMON]: {
                damageMultiplier: 1.1,
                durabilityMultiplier: 1.2,
                valueMultiplier: 1.5,
                rarity: 2
            },
            [this.weaponQualities.RARE]: {
                damageMultiplier: 1.25,
                durabilityMultiplier: 1.5,
                valueMultiplier: 3.0,
                rarity: 3
            },
            [this.weaponQualities.EPIC]: {
                damageMultiplier: 1.5,
                durabilityMultiplier: 2.0,
                valueMultiplier: 8.0,
                rarity: 4
            },
            [this.weaponQualities.LEGENDARY]: {
                damageMultiplier: 2.0,
                durabilityMultiplier: 3.0,
                valueMultiplier: 25.0,
                rarity: 5
            },
            [this.weaponQualities.MYTHICAL]: {
                damageMultiplier: 3.0,
                durabilityMultiplier: 5.0,
                valueMultiplier: 100.0,
                rarity: 6
            }
        };
    }

    /**
     * Generate a weapon sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.weaponTypes.SWORDS,
            material: options.material || this.weaponMaterials.IRON,
            quality: options.quality || this.weaponQualities.COMMON,
            size: options.size || this.weaponSizes.MEDIUM,
            enchanted: options.enchanted || false,
            customizations: options.customizations || {},
            ...options
        };

        // Get weapon template
        const templates = this.weaponTemplates[config.type];
        if (!templates || templates.length === 0) {
            throw new Error(`No templates found for weapon type: ${config.type}`);
        }

        const template = templates[Math.floor(Math.random() * templates.length)];

        // Apply material properties
        const materialProps = this.materialProperties[config.material];
        const qualityMods = this.qualityModifiers[config.quality];

        // Calculate final stats
        const finalStats = {
            damage: Math.round(template.baseDamage * qualityMods.damageMultiplier * (materialProps.sharpness / 10)),
            durability: Math.round(materialProps.durability * qualityMods.durabilityMultiplier),
            weight: Math.round(template.weight * materialProps.weight * (config.size === this.weaponSizes.SMALL ? 0.7 : config.size === this.weaponSizes.LARGE ? 1.3 : 1.0)),
            value: Math.round(10 * qualityMods.valueMultiplier * (materialProps.magic + 1)),
            magic: materialProps.magic
        };

        // Generate weapon data
        const weaponData = {
            id: this.generateWeaponId(),
            name: this.generateWeaponName(template.name, config.material, config.quality),
            type: config.type,
            material: config.material,
            quality: config.quality,
            size: config.size,
            template: template,
            stats: finalStats,
            traits: [...template.traits],
            description: this.generateDescription(template, config.material, config.quality),
            appearance: this.generateAppearance(config.material, config.quality, config.enchanted),
            requirements: this.generateRequirements(finalStats.weight),
            enchantments: config.enchanted ? this.generateEnchantments(config.quality) : []
        };

        // Generate sprite image
        const spriteImage = await this.generateWeaponSprite(weaponData, config);

        return {
            image: spriteImage,
            data: weaponData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'WeaponGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate weapon sprite image
     */
    async generateWeaponSprite(weaponData, config) {
        const width = config.width || 64;
        const height = config.height || 64;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw weapon based on type
        await this.drawWeaponBase(image, weaponData, config);

        // Apply material appearance
        await this.applyMaterialAppearance(image, weaponData.material, weaponData.quality);

        // Add quality effects
        if (weaponData.quality !== this.weaponQualities.COMMON) {
            await this.addQualityEffects(image, weaponData.quality);
        }

        // Add enchantments
        if (weaponData.enchantments.length > 0) {
            await this.addEnchantmentEffects(image, weaponData.enchantments);
        }

        return image;
    }

    /**
     * Draw weapon base shape
     */
    async drawWeaponBase(image, weaponData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;

        switch (weaponData.type) {
            case this.weaponTypes.SWORDS:
                await this.drawSword(image, centerX, centerY, weaponData.size);
                break;
            case this.weaponTypes.BOWS:
                await this.drawBow(image, centerX, centerY, weaponData.size);
                break;
            case this.weaponTypes.STAFFS:
                await this.drawStaff(image, centerX, centerY, weaponData.size);
                break;
            case this.weaponTypes.AXES:
                await this.drawAxe(image, centerX, centerY, weaponData.size);
                break;
            case this.weaponTypes.HAMMERS:
                await this.drawHammer(image, centerX, centerY, weaponData.size);
                break;
            case this.weaponTypes.DAGGERS:
                await this.drawDagger(image, centerX, centerY, weaponData.size);
                break;
            case this.weaponTypes.SPEARS:
                await this.drawSpear(image, centerX, centerY, weaponData.size);
                break;
            case this.weaponTypes.GUNS:
                await this.drawGun(image, centerX, centerY, weaponData.size);
                break;
            case this.weaponTypes.MAGICAL:
                await this.drawMagicalWeapon(image, centerX, centerY, weaponData.size);
                break;
            case this.weaponTypes.SHIELDS:
                await this.drawShield(image, centerX, centerY, weaponData.size);
                break;
        }
    }

    /**
     * Draw sword
     */
    async drawSword(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;

        // Blade
        for (let i = -20 * scale; i < 20 * scale; i++) {
            for (let j = -40 * scale; j < 10 * scale; j++) {
                if (Math.abs(i) < 2 && j < 0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFC0C0C0, pixelX, pixelY); // Silver blade
                    }
                }
            }
        }

        // Crossguard
        for (let i = -15 * scale; i < 15 * scale; i++) {
            for (let j = -3; j < 3; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY); // Brown crossguard
                }
            }
        }

        // Handle
        for (let i = -2; i < 2; i++) {
            for (let j = 0; j < 20 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF654321, pixelX, pixelY); // Dark brown handle
                }
            }
        }
    }

    /**
     * Draw bow (simplified)
     */
    async drawBow(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;

        // Bow curve
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const radius = 25 * scale;
            const bowX = x + Math.cos(angle) * radius;
            const bowY = y + Math.sin(angle) * radius;

            // Only draw the curved part
            if (Math.abs(Math.cos(angle)) > 0.3) {
                const pixelX = Math.floor(bowX);
                const pixelY = Math.floor(bowY);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY); // Brown wood
                }
            }
        }

        // String
        for (let i = -25 * scale; i < 25 * scale; i++) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                image.setPixelColor(0xFFFFFFFF, pixelX, pixelY); // White string
            }
        }
    }

    /**
     * Draw staff (simplified)
     */
    async drawStaff(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;

        // Staff shaft
        for (let i = -2; i < 2; i++) {
            for (let j = -30 * scale; j < 30 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY); // Brown wood
                }
            }
        }

        // Crystal top
        for (let i = -5; i < 5; i++) {
            for (let j = -35 * scale; j < -25 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF87CEEB, pixelX, pixelY); // Light blue crystal
                }
            }
        }
    }

    /**
     * Draw axe (simplified)
     */
    async drawAxe(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;

        // Handle
        for (let i = -2; i < 2; i++) {
            for (let j = 0; j < 25 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY); // Brown wood
                }
            }
        }

        // Blade
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -15 * scale; j < 0; j++) {
                if (Math.abs(i) + Math.abs(j) < 12 * scale) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFC0C0C0, pixelX, pixelY); // Silver blade
                    }
                }
            }
        }
    }

    /**
     * Draw hammer (simplified)
     */
    async drawHammer(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;

        // Handle
        for (let i = -2; i < 2; i++) {
            for (let j = 0; j < 20 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY); // Brown wood
                }
            }
        }

        // Head
        for (let i = -6 * scale; i < 6 * scale; i++) {
            for (let j = -12 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF2F4F4F, pixelX, pixelY); // Dark steel
                }
            }
        }
    }

    /**
     * Draw dagger (simplified)
     */
    async drawDagger(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;

        // Blade
        for (let i = -1; i < 1; i++) {
            for (let j = -20 * scale; j < 5 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFC0C0C0, pixelX, pixelY); // Silver blade
                }
            }
        }

        // Handle
        for (let i = -2; i < 2; i++) {
            for (let j = 5 * scale; j < 15 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF654321, pixelX, pixelY); // Dark brown handle
                }
            }
        }
    }

    /**
     * Draw spear (simplified)
     */
    async drawSpear(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;

        // Shaft
        for (let i = -1; i < 1; i++) {
            for (let j = -25 * scale; j < 20 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY); // Brown wood
                }
            }
        }

        // Point
        for (let i = -2; i < 2; i++) {
            for (let j = -30 * scale; j < -20 * scale; j++) {
                if (Math.abs(i) < (1 - (j + 30 * scale) / (10 * scale))) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFC0C0C0, pixelX, pixelY); // Silver point
                    }
                }
            }
        }
    }

    /**
     * Draw gun (simplified)
     */
    async drawGun(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;

        // Barrel
        for (let i = -2; i < 15 * scale; i++) {
            for (let j = -2; j < 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF2F4F4F, pixelX, pixelY); // Dark metal
                }
            }
        }

        // Handle
        for (let i = 2 * scale; i < 8 * scale; i++) {
            for (let j = 2; j < 8 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY); // Brown handle
                }
            }
        }
    }

    /**
     * Draw magical weapon (simplified)
     */
    async drawMagicalWeapon(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;

        // Base sword shape
        await this.drawSword(image, x, y, size);

        // Add magical glow effect
        for (let i = -25 * scale; i < 25 * scale; i++) {
            for (let j = -45 * scale; j < 15 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    const distance = Math.sqrt(i * i + j * j);
                    if (distance < 3 && Math.random() > 0.7) {
                        image.setPixelColor(0xFF87CEEB, pixelX, pixelY); // Magical blue glow
                    }
                }
            }
        }
    }

    /**
     * Draw shield (simplified)
     */
    async drawShield(image, x, y, size) {
        const scale = size === this.weaponSizes.SMALL ? 0.7 : size === this.weaponSizes.LARGE ? 1.3 : 1.0;
        const width = 20 * scale;
        const height = 30 * scale;

        // Shield shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                // Create oval shield shape
                if ((i * i) / (width * width) + (j * j) / (height * height) <= 0.25) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF8B4513, pixelX, pixelY); // Brown wood
                    }
                }
            }
        }

        // Metal rim
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                if ((i * i) / (width * width) + (j * j) / (height * height) <= 0.25 &&
                    (i * i) / (width * width) + (j * j) / (height * height) > 0.2) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFC0C0C0, pixelX, pixelY); // Silver rim
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
        if (material === this.weaponMaterials.CRYSTAL) {
            await this.addCrystalEffect(image);
        } else if (material === this.weaponMaterials.GOLD) {
            await this.addGoldEffect(image);
        } else if (material === this.weaponMaterials.DARK_METAL) {
            await this.addDarkMetalEffect(image);
        }
    }

    /**
     * Add quality effects
     */
    async addQualityEffects(image, quality) {
        switch (quality) {
            case this.weaponQualities.RARE:
                await this.addRareEffect(image);
                break;
            case this.weaponQualities.EPIC:
                await this.addEpicEffect(image);
                break;
            case this.weaponQualities.LEGENDARY:
                await this.addLegendaryEffect(image);
                break;
            case this.weaponQualities.MYTHICAL:
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
     * Generate weapon ID
     */
    generateWeaponId() {
        return 'weapon_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate weapon name
     */
    generateWeaponName(baseName, material, quality) {
        const materialNames = {
            [this.weaponMaterials.IRON]: 'Iron',
            [this.weaponMaterials.STEEL]: 'Steel',
            [this.weaponMaterials.SILVER]: 'Silver',
            [this.weaponMaterials.GOLD]: 'Golden',
            [this.weaponMaterials.MITHRIL]: 'Mithril',
            [this.weaponMaterials.ADAMANT]: 'Adamant',
            [this.weaponMaterials.WOOD]: 'Wooden',
            [this.weaponMaterials.BONE]: 'Bone',
            [this.weaponMaterials.CRYSTAL]: 'Crystal',
            [this.weaponMaterials.DARK_METAL]: 'Dark'
        };

        const qualityNames = {
            [this.weaponQualities.COMMON]: '',
            [this.weaponQualities.UNCOMMON]: 'Fine ',
            [this.weaponQualities.RARE]: 'Rare ',
            [this.weaponQualities.EPIC]: 'Epic ',
            [this.weaponQualities.LEGENDARY]: 'Legendary ',
            [this.weaponQualities.MYTHICAL]: 'Mythical '
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
            [this.weaponMaterials.IRON]: 'reliable and sturdy',
            [this.weaponMaterials.STEEL]: 'sharp and durable',
            [this.weaponMaterials.SILVER]: 'pure and magical',
            [this.weaponMaterials.GOLD]: 'ornate and valuable',
            [this.weaponMaterials.MITHRIL]: 'light and magical',
            [this.weaponMaterials.ADAMANT]: 'unbreakable and powerful',
            [this.weaponMaterials.WOOD]: 'natural and flexible',
            [this.weaponMaterials.BONE]: 'savage and primal',
            [this.weaponMaterials.CRYSTAL]: 'magical and radiant',
            [this.weaponMaterials.DARK_METAL]: 'cursed and powerful'
        };

        const qualityDesc = {
            [this.weaponQualities.COMMON]: 'A standard weapon',
            [this.weaponQualities.UNCOMMON]: 'A well-crafted weapon',
            [this.weaponQualities.RARE]: 'A finely made weapon',
            [this.weaponQualities.EPIC]: 'A masterfully crafted weapon',
            [this.weaponQualities.LEGENDARY]: 'A legendary weapon of great power',
            [this.weaponQualities.MYTHICAL]: 'A mythical weapon of unimaginable power'
        };

        const materialDescription = materialDesc[material] || 'well-made';
        const qualityDescription = qualityDesc[quality] || 'A weapon';

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
            strength: Math.max(1, Math.floor(weight / 2)),
            level: Math.max(1, Math.floor(weight / 3))
        };
    }

    /**
     * Generate enchantments
     */
    generateEnchantments(quality) {
        const enchantments = [];
        const enchantmentCount = Math.floor(this.qualityModifiers[quality].rarity / 2);

        const possibleEnchantments = [
            { type: 'fire', name: 'of Flame', effect: '+Fire Damage' },
            { type: 'ice', name: 'of Frost', effect: '+Ice Damage' },
            { type: 'lightning', name: 'of Thunder', effect: '+Lightning Damage' },
            { type: 'holy', name: 'of Light', effect: '+Holy Damage' },
            { type: 'sharpness', name: 'of Sharpness', effect: '+Critical Hit Chance' },
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
            [this.weaponQualities.RARE]: '#FFD700',
            [this.weaponQualities.EPIC]: '#FF4500',
            [this.weaponQualities.LEGENDARY]: '#9370DB',
            [this.weaponQualities.MYTHICAL]: '#FF1493'
        };
        return colors[quality] || '#FFFFFF';
    }

    generateVisualEffects(material, quality, enchanted) {
        const effects = [];

        if (material === this.weaponMaterials.CRYSTAL) {
            effects.push('glowing');
        }

        if (quality === this.weaponQualities.LEGENDARY) {
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
     * Batch generate weapons
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const weapon = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(weapon);
            } catch (error) {
                console.error(`Failed to generate weapon ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(w => w !== null);
    }

    /**
     * Generate weapon by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.material) options.material = criteria.material;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.size) options.size = criteria.size;
        if (criteria.enchanted !== undefined) options.enchanted = criteria.enchanted;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get weapon statistics
     */
    getWeaponStatistics() {
        return {
            totalTypes: Object.keys(this.weaponTypes).length,
            totalMaterials: Object.keys(this.weaponMaterials).length,
            totalQualities: Object.keys(this.weaponQualities).length,
            totalSizes: Object.keys(this.weaponSizes).length,
            weaponTemplates: Object.keys(this.weaponTemplates).reduce((acc, type) => {
                acc[type] = this.weaponTemplates[type].length;
                return acc;
            }, {})
        };
    }

    /**
     * Export weapon data
     */
    async exportWeaponData(weapon, outputPath) {
        const exportData = {
            ...weapon.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save weapon data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate weapon configuration
     */
    validateWeaponConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.weaponTypes).includes(config.type)) {
            errors.push(`Invalid weapon type: ${config.type}`);
        }

        if (config.material && !Object.values(this.weaponMaterials).includes(config.material)) {
            errors.push(`Invalid material: ${config.material}`);
        }

        if (config.quality && !Object.values(this.weaponQualities).includes(config.quality)) {
            errors.push(`Invalid quality: ${config.quality}`);
        }

        if (config.size && !Object.values(this.weaponSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = WeaponGenerator;
