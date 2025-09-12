/**
 * Tool Generator - Complete tool and equipment sprite generation system
 * Generates various tools with different materials, qualities, and functionalities
 */

const Jimp = require('jimp');
const path = require('path');

class ToolGenerator {
    constructor() {
        this.toolTypes = {
            WORK: 'work',
            CRAFTING: 'crafting',
            FISHING: 'fishing',
            MINING: 'mining',
            FARMING: 'farming',
            COOKING: 'cooking',
            MAGICAL: 'magical'
        };

        this.materialTypes = {
            WOOD: 'wood',
            IRON: 'iron',
            STEEL: 'steel',
            MITHRIL: 'mithril',
            ADAMANT: 'adamant',
            MAGICAL: 'magical',
            BONE: 'bone',
            STONE: 'stone'
        };

        this.toolQualities = {
            COMMON: 'common',
            UNCOMMON: 'uncommon',
            RARE: 'rare',
            EPIC: 'epic',
            LEGENDARY: 'legendary',
            MYTHICAL: 'mythical'
        };

        this.toolSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large',
            HUGE: 'huge'
        };

        // Work tool templates
        this.workToolTemplates = {
            HAMMER: {
                name: 'Hammer',
                description: 'A sturdy hammer for construction and repairs',
                toolType: 'construction',
                baseDurability: 100,
                baseEfficiency: 1.0,
                weight: 2.5,
                features: ['hammering', 'nails', 'repairs', 'construction']
            },
            SAW: {
                name: 'Saw',
                description: 'A sharp saw for cutting wood',
                toolType: 'carpentry',
                baseDurability: 80,
                baseEfficiency: 1.2,
                weight: 1.8,
                features: ['cutting', 'wood', 'precision', 'carpentry']
            },
            PICKAXE: {
                name: 'Pickaxe',
                description: 'A heavy pickaxe for breaking rocks',
                toolType: 'mining',
                baseDurability: 120,
                baseEfficiency: 0.8,
                weight: 4.0,
                features: ['breaking', 'rocks', 'mining', 'heavy']
            },
            SHOVEL: {
                name: 'Shovel',
                description: 'A shovel for digging and moving earth',
                toolType: 'excavation',
                baseDurability: 90,
                baseEfficiency: 1.1,
                weight: 3.2,
                features: ['digging', 'earth', 'excavation', 'versatile']
            },
            AXE: {
                name: 'Axe',
                description: 'A sharp axe for chopping wood',
                toolType: 'lumber',
                baseDurability: 110,
                baseEfficiency: 1.3,
                weight: 3.8,
                features: ['chopping', 'wood', 'lumber', 'powerful']
            }
        };

        // Crafting tool templates
        this.craftingToolTemplates = {
            ANVIL: {
                name: 'Anvil',
                description: 'A heavy anvil for metalworking',
                toolType: 'smithing',
                baseDurability: 500,
                baseEfficiency: 0.9,
                weight: 50.0,
                features: ['metalworking', 'hammering', 'forging', 'stationary']
            },
            FORGE: {
                name: 'Forge',
                description: 'A forge for heating and shaping metal',
                toolType: 'smithing',
                baseDurability: 300,
                baseEfficiency: 1.0,
                weight: 75.0,
                features: ['heating', 'metal', 'forging', 'fire']
            },
            WORKBENCH: {
                name: 'Workbench',
                description: 'A sturdy workbench for crafting',
                toolType: 'general_crafting',
                baseDurability: 200,
                baseEfficiency: 1.1,
                weight: 25.0,
                features: ['crafting', 'assembly', 'workspace', 'versatile']
            },
            GRINDSTONE: {
                name: 'Grindstone',
                description: 'A grindstone for sharpening tools',
                toolType: 'sharpening',
                baseDurability: 150,
                baseEfficiency: 1.4,
                weight: 30.0,
                features: ['sharpening', 'grinding', 'maintenance', 'precision']
            }
        };

        // Fishing tool templates
        this.fishingToolTemplates = {
            FISHING_ROD: {
                name: 'Fishing Rod',
                description: 'A fishing rod for catching fish',
                toolType: 'fishing',
                baseDurability: 60,
                baseEfficiency: 1.0,
                weight: 1.2,
                features: ['casting', 'reeling', 'fish', 'patience']
            },
            NET: {
                name: 'Fishing Net',
                description: 'A net for catching multiple fish',
                toolType: 'fishing',
                baseDurability: 40,
                baseEfficiency: 1.5,
                weight: 2.0,
                features: ['netting', 'multiple_fish', 'shallow_water', 'efficient']
            },
            BAIT_BUCKET: {
                name: 'Bait Bucket',
                description: 'A bucket for storing fishing bait',
                toolType: 'bait_storage',
                baseDurability: 30,
                baseEfficiency: 1.0,
                weight: 1.5,
                features: ['bait_storage', 'preservation', 'convenient', 'essential']
            }
        };

        // Mining tool templates
        this.miningToolTemplates = {
            MINING_PICKAXE: {
                name: 'Mining Pickaxe',
                description: 'A specialized pickaxe for mining',
                toolType: 'mining',
                baseDurability: 150,
                baseEfficiency: 1.2,
                weight: 4.5,
                features: ['ore_extraction', 'rock_breaking', 'underground', 'specialized']
            },
            DRILL: {
                name: 'Mining Drill',
                description: 'A mechanical drill for mining',
                toolType: 'mining',
                baseDurability: 200,
                baseEfficiency: 2.0,
                weight: 8.0,
                features: ['drilling', 'mechanical', 'fast', 'advanced']
            },
            LANTERN: {
                name: 'Mining Lantern',
                description: 'A lantern for underground illumination',
                toolType: 'lighting',
                baseDurability: 80,
                baseEfficiency: 1.0,
                weight: 2.2,
                features: ['illumination', 'underground', 'safety', 'essential']
            },
            CART: {
                name: 'Mining Cart',
                description: 'A cart for transporting ore',
                toolType: 'transport',
                baseDurability: 250,
                baseEfficiency: 1.0,
                weight: 15.0,
                features: ['transportation', 'ore_carrying', 'wheels', 'capacity']
            }
        };

        // Farming tool templates
        this.farmingToolTemplates = {
            HOE: {
                name: 'Hoe',
                description: 'A hoe for tilling soil',
                toolType: 'soil_preparation',
                baseDurability: 70,
                baseEfficiency: 1.1,
                weight: 2.8,
                features: ['tilling', 'soil', 'preparation', 'planting']
            },
            SICKLE: {
                name: 'Sickle',
                description: 'A sickle for harvesting crops',
                toolType: 'harvesting',
                baseDurability: 65,
                baseEfficiency: 1.3,
                weight: 1.5,
                features: ['harvesting', 'crops', 'cutting', 'precision']
            },
            WATERING_CAN: {
                name: 'Watering Can',
                description: 'A can for watering plants',
                toolType: 'irrigation',
                baseDurability: 50,
                baseEfficiency: 1.0,
                weight: 1.8,
                features: ['watering', 'plants', 'irrigation', 'care']
            },
            PLOW: {
                name: 'Plow',
                description: 'A plow for large-scale farming',
                toolType: 'large_farming',
                baseDurability: 180,
                baseEfficiency: 0.8,
                weight: 12.0,
                features: ['plowing', 'large_areas', 'soil_turning', 'heavy']
            }
        };

        // Cooking tool templates
        this.cookingToolTemplates = {
            POT: {
                name: 'Cooking Pot',
                description: 'A pot for cooking soups and stews',
                toolType: 'cooking',
                baseDurability: 100,
                baseEfficiency: 1.0,
                weight: 3.5,
                features: ['boiling', 'soups', 'stews', 'versatile']
            },
            PAN: {
                name: 'Frying Pan',
                description: 'A pan for frying and sautéing',
                toolType: 'cooking',
                baseDurability: 90,
                baseEfficiency: 1.2,
                weight: 2.2,
                features: ['frying', 'sautéing', 'cooking', 'versatile']
            },
            KNIFE: {
                name: 'Kitchen Knife',
                description: 'A sharp knife for food preparation',
                toolType: 'food_prep',
                baseDurability: 60,
                baseEfficiency: 1.4,
                weight: 0.8,
                features: ['cutting', 'food_prep', 'precision', 'essential']
            },
            MORTAR: {
                name: 'Mortar and Pestle',
                description: 'A mortar for grinding ingredients',
                toolType: 'grinding',
                baseDurability: 120,
                baseEfficiency: 0.9,
                weight: 4.0,
                features: ['grinding', 'ingredients', 'herbs', 'traditional']
            }
        };

        // Material properties
        this.materialProperties = {
            [this.materialTypes.WOOD]: {
                durability: 0.7,
                efficiency: 0.8,
                weight: 0.6,
                color: '#8B4513',
                magicalAffinity: 0.3,
                value: 1.0
            },
            [this.materialTypes.IRON]: {
                durability: 1.0,
                efficiency: 1.0,
                weight: 1.0,
                color: '#708090',
                magicalAffinity: 0.2,
                value: 2.0
            },
            [this.materialTypes.STEEL]: {
                durability: 1.5,
                efficiency: 1.3,
                weight: 1.1,
                color: '#2F4F4F',
                magicalAffinity: 0.1,
                value: 4.0
            },
            [this.materialTypes.MITHRIL]: {
                durability: 3.0,
                efficiency: 2.0,
                weight: 0.3,
                color: '#C0C0C0',
                magicalAffinity: 0.8,
                value: 20.0
            },
            [this.materialTypes.ADAMANT]: {
                durability: 5.0,
                efficiency: 3.0,
                weight: 0.8,
                color: '#696969',
                magicalAffinity: 0.4,
                value: 50.0
            },
            [this.materialTypes.MAGICAL]: {
                durability: 4.0,
                efficiency: 2.5,
                weight: 0.5,
                color: '#9370DB',
                magicalAffinity: 1.0,
                value: 100.0
            },
            [this.materialTypes.BONE]: {
                durability: 0.8,
                efficiency: 0.9,
                weight: 0.4,
                color: '#F5F5DC',
                magicalAffinity: 0.6,
                value: 3.0
            },
            [this.materialTypes.STONE]: {
                durability: 1.2,
                efficiency: 0.7,
                weight: 1.5,
                color: '#696969',
                magicalAffinity: 0.1,
                value: 1.5
            }
        };

        // Quality modifiers
        this.qualityModifiers = {
            [this.toolQualities.COMMON]: {
                statMultiplier: 1.0,
                durabilityMultiplier: 1.0,
                efficiencyMultiplier: 1.0,
                valueMultiplier: 1.0,
                rarity: 1
            },
            [this.toolQualities.UNCOMMON]: {
                statMultiplier: 1.2,
                durabilityMultiplier: 1.1,
                efficiencyMultiplier: 1.1,
                valueMultiplier: 1.8,
                rarity: 2
            },
            [this.toolQualities.RARE]: {
                statMultiplier: 1.5,
                durabilityMultiplier: 1.25,
                efficiencyMultiplier: 1.25,
                valueMultiplier: 4.0,
                rarity: 3
            },
            [this.toolQualities.EPIC]: {
                statMultiplier: 2.0,
                durabilityMultiplier: 1.5,
                efficiencyMultiplier: 1.5,
                valueMultiplier: 12.0,
                rarity: 4
            },
            [this.toolQualities.LEGENDARY]: {
                statMultiplier: 3.0,
                durabilityMultiplier: 2.0,
                efficiencyMultiplier: 2.0,
                valueMultiplier: 40.0,
                rarity: 5
            },
            [this.toolQualities.MYTHICAL]: {
                statMultiplier: 5.0,
                durabilityMultiplier: 3.0,
                efficiencyMultiplier: 3.0,
                valueMultiplier: 150.0,
                rarity: 6
            }
        };

        // Tool colors and effects
        this.toolColors = {
            wood: { base: '#8B4513', handle: '#654321', metal: '#C0C0C0' },
            iron: { base: '#708090', handle: '#654321', metal: '#708090' },
            steel: { base: '#2F4F4F', handle: '#654321', metal: '#2F4F4F' },
            mithril: { base: '#C0C0C0', handle: '#654321', metal: '#C0C0C0', glow: '#E6E6FA' },
            adamant: { base: '#696969', handle: '#654321', metal: '#696969', glow: '#D3D3D3' },
            magical: { base: '#9370DB', handle: '#654321', metal: '#9370DB', glow: '#DA70D6' },
            bone: { base: '#F5F5DC', handle: '#F5F5DC', metal: '#C0C0C0' },
            stone: { base: '#696969', handle: '#654321', metal: '#696969' }
        };
    }

    /**
     * Generate a tool sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.toolTypes.WORK,
            subtype: options.subtype || 'HAMMER',
            material: options.material || this.materialTypes.IRON,
            quality: options.quality || this.toolQualities.COMMON,
            size: options.size || this.toolSizes.MEDIUM,
            enchanted: options.enchanted || false,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate template based on type
        let template;
        switch (config.type) {
            case this.toolTypes.WORK:
                template = this.workToolTemplates[config.subtype];
                break;
            case this.toolTypes.CRAFTING:
                template = this.craftingToolTemplates[config.subtype];
                break;
            case this.toolTypes.FISHING:
                template = this.fishingToolTemplates[config.subtype];
                break;
            case this.toolTypes.MINING:
                template = this.miningToolTemplates[config.subtype];
                break;
            case this.toolTypes.FARMING:
                template = this.farmingToolTemplates[config.subtype];
                break;
            case this.toolTypes.COOKING:
                template = this.cookingToolTemplates[config.subtype];
                break;
            default:
                template = this.workToolTemplates.HAMMER;
        }

        if (!template) {
            throw new Error(`Unknown tool subtype: ${config.subtype}`);
        }

        // Apply material and quality modifiers
        const materialProps = this.materialProperties[config.material];
        const qualityMods = this.qualityModifiers[config.quality];

        // Calculate final stats
        const finalStats = this.calculateToolStats(template, materialProps, qualityMods, config.size);

        // Generate tool data
        const toolData = {
            id: this.generateToolId(),
            name: this.generateToolName(template.name, config.material, config.quality),
            type: config.type,
            subtype: config.subtype,
            material: config.material,
            quality: config.quality,
            size: config.size,
            template: template,
            stats: finalStats,
            materialProps: materialProps,
            features: [...template.features],
            description: this.generateDescription(template, config.material, config.quality),
            appearance: this.generateAppearance(template, config.material, config.quality, config.enchanted),
            effects: this.generateEffects(template, finalStats, config.enchanted)
        };

        // Generate sprite image
        const spriteImage = await this.generateToolSprite(toolData, config);

        return {
            image: spriteImage,
            data: toolData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'ToolGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate tool sprite image
     */
    async generateToolSprite(toolData, config) {
        const width = config.width || 64;
        const height = config.height || 64;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw tool based on type
        await this.drawToolBase(image, toolData, config);

        // Apply quality effects
        if (toolData.quality !== this.toolQualities.COMMON) {
            await this.addQualityEffects(image, toolData.quality);
        }

        // Add enchantment effects
        if (toolData.appearance.enchanted) {
            await this.addEnchantmentEffects(image, toolData.appearance);
        }

        return image;
    }

    /**
     * Draw tool base shape
     */
    async drawToolBase(image, toolData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = config.size === this.toolSizes.SMALL ? 0.7 : config.size === this.toolSizes.LARGE ? 1.3 : 1.0;

        switch (toolData.type) {
            case this.toolTypes.WORK:
                await this.drawWorkTool(image, centerX, centerY, toolData.subtype, scale, toolData.material);
                break;
            case this.toolTypes.CRAFTING:
                await this.drawCraftingTool(image, centerX, centerY, toolData.subtype, scale, toolData.material);
                break;
            case this.toolTypes.FISHING:
                await this.drawFishingTool(image, centerX, centerY, toolData.subtype, scale, toolData.material);
                break;
            case this.toolTypes.MINING:
                await this.drawMiningTool(image, centerX, centerY, toolData.subtype, scale, toolData.material);
                break;
            case this.toolTypes.FARMING:
                await this.drawFarmingTool(image, centerX, centerY, toolData.subtype, scale, toolData.material);
                break;
            case this.toolTypes.COOKING:
                await this.drawCookingTool(image, centerX, centerY, toolData.subtype, scale, toolData.material);
                break;
        }
    }

    /**
     * Draw work tool
     */
    async drawWorkTool(image, x, y, subtype, scale, material) {
        switch (subtype) {
            case 'HAMMER':
                await this.drawHammer(image, x, y, scale, material);
                break;
            case 'SAW':
                await this.drawSaw(image, x, y, scale, material);
                break;
            case 'PICKAXE':
                await this.drawPickaxe(image, x, y, scale, material);
                break;
            case 'SHOVEL':
                await this.drawShovel(image, x, y, scale, material);
                break;
            case 'AXE':
                await this.drawAxe(image, x, y, scale, material);
                break;
            default:
                await this.drawHammer(image, x, y, scale, material);
        }
    }

    /**
     * Draw hammer
     */
    async drawHammer(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Handle
        for (let i = -2; i < 3; i++) {
            for (let j = 0; j < 25 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Head
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -5 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw saw
     */
    async drawSaw(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Handle
        for (let i = -1; i < 2; i++) {
            for (let j = 0; j < 20 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Blade
        for (let i = -10 * scale; i < 10 * scale; i++) {
            for (let j = -3 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Teeth
        for (let i = -8 * scale; i < 8 * scale; i += 2 * scale) {
            const pixelX = Math.floor(x + i);
            const pixelY = Math.floor(y - 4 * scale);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                image.setPixelColor(0xFF000000, pixelX, pixelY);
            }
        }
    }

    /**
     * Draw pickaxe
     */
    async drawPickaxe(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Handle
        for (let i = -2; i < 3; i++) {
            for (let j = 0; j < 30 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Pick head
        for (let i = -6 * scale; i < 6 * scale; i++) {
            for (let j = -8 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw shovel
     */
    async drawShovel(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Handle
        for (let i = -2; i < 3; i++) {
            for (let j = 0; j < 25 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Blade
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -6 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw axe
     */
    async drawAxe(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Handle
        for (let i = -2; i < 3; i++) {
            for (let j = 0; j < 28 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Axe head
        for (let i = -5 * scale; i < 8 * scale; i++) {
            for (let j = -10 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw crafting tool
     */
    async drawCraftingTool(image, x, y, subtype, scale, material) {
        switch (subtype) {
            case 'ANVIL':
                await this.drawAnvil(image, x, y, scale, material);
                break;
            case 'FORGE':
                await this.drawForge(image, x, y, scale, material);
                break;
            case 'WORKBENCH':
                await this.drawWorkbench(image, x, y, scale, material);
                break;
            case 'GRINDSTONE':
                await this.drawGrindstone(image, x, y, scale, material);
                break;
            default:
                await this.drawAnvil(image, x, y, scale, material);
        }
    }

    /**
     * Draw anvil
     */
    async drawAnvil(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Base
        for (let i = -15 * scale; i < 15 * scale; i++) {
            for (let j = 5 * scale; j < 15 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Top surface
        for (let i = -12 * scale; i < 12 * scale; i++) {
            for (let j = -5 * scale; j < 5 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw forge
     */
    async drawForge(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Forge body
        for (let i = -12 * scale; i < 12 * scale; i++) {
            for (let j = -8 * scale; j < 8 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Fire pit
        for (let i = -6 * scale; i < 6 * scale; i++) {
            for (let j = -3 * scale; j < 3 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFFF4500, pixelX, pixelY); // Orange fire
                }
            }
        }
    }

    /**
     * Draw workbench
     */
    async drawWorkbench(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Table top
        for (let i = -20 * scale; i < 20 * scale; i++) {
            for (let j = -3 * scale; j < 3 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.base.slice(1, 3), 16) << 16) |
                        (parseInt(colors.base.slice(3, 5), 16) << 8) |
                        parseInt(colors.base.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Legs
        for (let leg = 0; leg < 4; leg++) {
            const legX = leg % 2 === 0 ? -15 * scale : 15 * scale;
            const legY = leg < 2 ? -8 * scale : 8 * scale;

            for (let i = -2; i < 3; i++) {
                for (let j = 0; j < 12 * scale; j++) {
                    const pixelX = Math.floor(x + legX + i);
                    const pixelY = Math.floor(y + legY + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.base.slice(1, 3), 16) << 16) |
                            (parseInt(colors.base.slice(3, 5), 16) << 8) |
                            parseInt(colors.base.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw grindstone
     */
    async drawGrindstone(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Stone wheel
        for (let i = -10 * scale; i < 10 * scale; i++) {
            for (let j = -10 * scale; j < 10 * scale; j++) {
                if (i * i + j * j <= (10 * scale) * (10 * scale)) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.base.slice(1, 3), 16) << 16) |
                            (parseInt(colors.base.slice(3, 5), 16) << 8) |
                            parseInt(colors.base.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }

        // Frame
        for (let i = -12 * scale; i < 12 * scale; i++) {
            for (let j = -2; j < 3; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw fishing tool
     */
    async drawFishingTool(image, x, y, subtype, scale, material) {
        switch (subtype) {
            case 'FISHING_ROD':
                await this.drawFishingRod(image, x, y, scale, material);
                break;
            case 'NET':
                await this.drawNet(image, x, y, scale, material);
                break;
            case 'BAIT_BUCKET':
                await this.drawBaitBucket(image, x, y, scale, material);
                break;
            default:
                await this.drawFishingRod(image, x, y, scale, material);
        }
    }

    /**
     * Draw fishing rod
     */
    async drawFishingRod(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Rod shaft
        for (let i = -1; i < 2; i++) {
            for (let j = -25 * scale; j < 5 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.base.slice(1, 3), 16) << 16) |
                        (parseInt(colors.base.slice(3, 5), 16) << 8) |
                        parseInt(colors.base.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Line
        for (let i = 0; i < 15 * scale; i++) {
            const pixelX = Math.floor(x);
            const pixelY = Math.floor(y - 25 * scale - i);
            if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                image.setPixelColor(0xFF000000, pixelX, pixelY);
            }
        }
    }

    /**
     * Draw net
     */
    async drawNet(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Net frame
        for (let i = -12 * scale; i < 12 * scale; i++) {
            for (let j = -8 * scale; j < 8 * scale; j++) {
                if (Math.abs(i) === 12 * scale || Math.abs(j) === 8 * scale) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.base.slice(1, 3), 16) << 16) |
                            (parseInt(colors.base.slice(3, 5), 16) << 8) |
                            parseInt(colors.base.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }

        // Net mesh
        for (let i = -10 * scale; i < 10 * scale; i += 3 * scale) {
            for (let j = -6 * scale; j < 6 * scale; j += 3 * scale) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF000000, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw bait bucket
     */
    async drawBaitBucket(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Bucket body
        for (let i = -6 * scale; i < 6 * scale; i++) {
            for (let j = -8 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Handle
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -10 * scale; j < -8 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw mining tool
     */
    async drawMiningTool(image, x, y, subtype, scale, material) {
        switch (subtype) {
            case 'MINING_PICKAXE':
                await this.drawMiningPickaxe(image, x, y, scale, material);
                break;
            case 'DRILL':
                await this.drawDrill(image, x, y, scale, material);
                break;
            case 'LANTERN':
                await this.drawLantern(image, x, y, scale, material);
                break;
            case 'CART':
                await this.drawCart(image, x, y, scale, material);
                break;
            default:
                await this.drawMiningPickaxe(image, x, y, scale, material);
        }
    }

    /**
     * Draw farming tool
     */
    async drawFarmingTool(image, x, y, subtype, scale, material) {
        switch (subtype) {
            case 'HOE':
                await this.drawHoe(image, x, y, scale, material);
                break;
            case 'SICKLE':
                await this.drawSickle(image, x, y, scale, material);
                break;
            case 'WATERING_CAN':
                await this.drawWateringCan(image, x, y, scale, material);
                break;
            case 'PLOW':
                await this.drawPlow(image, x, y, scale, material);
                break;
            default:
                await this.drawHoe(image, x, y, scale, material);
        }
    }

    /**
     * Draw cooking tool
     */
    async drawCookingTool(image, x, y, subtype, scale, material) {
        switch (subtype) {
            case 'POT':
                await this.drawPot(image, x, y, scale, material);
                break;
            case 'PAN':
                await this.drawPan(image, x, y, scale, material);
                break;
            case 'KNIFE':
                await this.drawKnife(image, x, y, scale, material);
                break;
            case 'MORTAR':
                await this.drawMortar(image, x, y, scale, material);
                break;
            default:
                await this.drawPot(image, x, y, scale, material);
        }
    }

    /**
     * Draw mining pickaxe
     */
    async drawMiningPickaxe(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Handle
        for (let i = -2; i < 3; i++) {
            for (let j = 0; j < 35 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Pick head
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -12 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw drill
     */
    async drawDrill(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Drill body
        for (let i = -4 * scale; i < 4 * scale; i++) {
            for (let j = -15 * scale; j < 5 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Drill bit
        for (let i = -2 * scale; i < 2 * scale; i++) {
            for (let j = -20 * scale; j < -15 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw lantern
     */
    async drawLantern(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Lantern body
        for (let i = -5 * scale; i < 5 * scale; i++) {
            for (let j = -8 * scale; j < 2 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Light
        for (let i = -3 * scale; i < 3 * scale; i++) {
            for (let j = -6 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFFFFF00, pixelX, pixelY); // Yellow light
                }
            }
        }
    }

    /**
     * Draw cart
     */
    async drawCart(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Cart body
        for (let i = -12 * scale; i < 12 * scale; i++) {
            for (let j = -6 * scale; j < 2 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.base.slice(1, 3), 16) << 16) |
                        (parseInt(colors.base.slice(3, 5), 16) << 8) |
                        parseInt(colors.base.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Wheels
        for (let wheel = 0; wheel < 2; wheel++) {
            const wheelX = wheel === 0 ? -8 * scale : 8 * scale;
            for (let i = -3 * scale; i < 3 * scale; i++) {
                for (let j = 2 * scale; j < 8 * scale; j++) {
                    if (i * i + (j - 5 * scale) * (j - 5 * scale) <= (3 * scale) * (3 * scale)) {
                        const pixelX = Math.floor(x + wheelX + i);
                        const pixelY = Math.floor(y + j);
                        if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                            image.setPixelColor(
                                (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                                (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                                parseInt(colors.metal.slice(5, 7), 16) |
                                0xFF000000
                            , pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw hoe
     */
    async drawHoe(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Handle
        for (let i = -2; i < 3; i++) {
            for (let j = 0; j < 25 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Blade
        for (let i = -6 * scale; i < 6 * scale; i++) {
            for (let j = -4 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw sickle
     */
    async drawSickle(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Handle
        for (let i = -1; i < 2; i++) {
            for (let j = 0; j < 15 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Curved blade
        for (let i = -8 * scale; i < 4 * scale; i++) {
            for (let j = -6 * scale; j < 0; j++) {
                const curve = Math.sin(i / (12 * scale) * Math.PI) * 3 * scale;
                if (Math.abs(j - curve) < 2 * scale) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                            (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                            parseInt(colors.metal.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw watering can
     */
    async drawWateringCan(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Can body
        for (let i = -6 * scale; i < 6 * scale; i++) {
            for (let j = -8 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Spout
        for (let i = 4 * scale; i < 8 * scale; i++) {
            for (let j = -3 * scale; j < 0; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw plow
     */
    async drawPlow(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Plow body
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -6 * scale; j < 2 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Blade
        for (let i = -4 * scale; i < 4 * scale; i++) {
            for (let j = 2 * scale; j < 6 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw pot
     */
    async drawPot(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Pot body
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -6 * scale; j < 4 * scale; j++) {
                if (i * i + j * j <= (8 * scale) * (8 * scale) && j >= -6 * scale) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                            (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                            parseInt(colors.metal.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }

        // Handle
        for (let i = -10 * scale; i < -6 * scale; i++) {
            for (let j = -2 * scale; j < 2 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw pan
     */
    async drawPan(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Pan body
        for (let i = -10 * scale; i < 10 * scale; i++) {
            for (let j = -2 * scale; j < 2 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Handle
        for (let i = 8 * scale; i < 12 * scale; i++) {
            for (let j = -1 * scale; j < 1 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw knife
     */
    async drawKnife(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Handle
        for (let i = -1; i < 2; i++) {
            for (let j = 0; j < 8 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.handle.slice(1, 3), 16) << 16) |
                        (parseInt(colors.handle.slice(3, 5), 16) << 8) |
                        parseInt(colors.handle.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }

        // Blade
        for (let i = -6 * scale; i < 0; i++) {
            for (let j = -2 * scale; j < 2 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.metal.slice(1, 3), 16) << 16) |
                        (parseInt(colors.metal.slice(3, 5), 16) << 8) |
                        parseInt(colors.metal.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw mortar
     */
    async drawMortar(image, x, y, scale, material) {
        const colors = this.toolColors[material];

        // Mortar bowl
        for (let i = -8 * scale; i < 8 * scale; i++) {
            for (let j = -4 * scale; j < 2 * scale; j++) {
                if (i * i + j * j <= (8 * scale) * (8 * scale)) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(
                            (parseInt(colors.base.slice(1, 3), 16) << 16) |
                            (parseInt(colors.base.slice(3, 5), 16) << 8) |
                            parseInt(colors.base.slice(5, 7), 16) |
                            0xFF000000
                        , pixelX, pixelY);
                    }
                }
            }
        }

        // Pestle
        for (let i = -1; i < 2; i++) {
            for (let j = -8 * scale; j < -4 * scale; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(
                        (parseInt(colors.base.slice(1, 3), 16) << 16) |
                        (parseInt(colors.base.slice(3, 5), 16) << 8) |
                        parseInt(colors.base.slice(5, 7), 16) |
                        0xFF000000
                    , pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Add quality effects
     */
    async addQualityEffects(image, quality) {
        switch (quality) {
            case this.toolQualities.RARE:
                await this.addRareGlow(image);
                break;
            case this.toolQualities.EPIC:
                await this.addEpicGlow(image);
                break;
            case this.toolQualities.LEGENDARY:
                await this.addLegendaryGlow(image);
                break;
            case this.toolQualities.MYTHICAL:
                await this.addMythicalGlow(image);
                break;
        }
    }

    /**
     * Add enchantment effects
     */
    async addEnchantmentEffects(image, appearance) {
        if (appearance.glowColor) {
            await this.addGlowEffect(image, appearance.glowColor);
        }
    }

    /**
     * Calculate tool stats
     */
    calculateToolStats(template, materialProps, qualityMods, size) {
        const sizeMultiplier = size === this.toolSizes.SMALL ? 0.7 : size === this.toolSizes.LARGE ? 1.3 : 1.0;

        const stats = {
            durability: Math.round(template.baseDurability * materialProps.durability * qualityMods.durabilityMultiplier),
            efficiency: Math.round(template.baseEfficiency * materialProps.efficiency * qualityMods.efficiencyMultiplier * 100) / 100,
            value: Math.round(materialProps.value * qualityMods.valueMultiplier * sizeMultiplier),
            weight: Math.round(template.weight * materialProps.weight * sizeMultiplier * 100) / 100
        };

        return stats;
    }

    /**
     * Generate tool ID
     */
    generateToolId() {
        return 'tool_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate tool name
     */
    generateToolName(baseName, material, quality) {
        const qualityPrefixes = {
            [this.toolQualities.COMMON]: '',
            [this.toolQualities.UNCOMMON]: 'Fine ',
            [this.toolQualities.RARE]: 'Rare ',
            [this.toolQualities.EPIC]: 'Epic ',
            [this.toolQualities.LEGENDARY]: 'Legendary ',
            [this.toolQualities.MYTHICAL]: 'Mythical '
        };

        const materialSuffixes = {
            [this.materialTypes.WOOD]: 'Wooden ',
            [this.materialTypes.IRON]: 'Iron ',
            [this.materialTypes.STEEL]: 'Steel ',
            [this.materialTypes.MITHRIL]: 'Mithril ',
            [this.materialTypes.ADAMANT]: 'Adamant ',
            [this.materialTypes.MAGICAL]: 'Magical ',
            [this.materialTypes.BONE]: 'Bone ',
            [this.materialTypes.STONE]: 'Stone '
        };

        return `${qualityPrefixes[quality]}${materialSuffixes[material]}${baseName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(template, material, quality) {
        const qualityDesc = {
            [this.toolQualities.COMMON]: 'A standard tool',
            [this.toolQualities.UNCOMMON]: 'A well-crafted tool',
            [this.toolQualities.RARE]: 'A finely made tool',
            [this.toolQualities.EPIC]: 'A masterfully crafted tool',
            [this.toolQualities.LEGENDARY]: 'A legendary tool of great power',
            [this.toolQualities.MYTHICAL]: 'A mythical tool of unimaginable power'
        };

        const materialDesc = {
            [this.materialTypes.WOOD]: 'made of wood',
            [this.materialTypes.IRON]: 'forged from iron',
            [this.materialTypes.STEEL]: 'crafted from steel',
            [this.materialTypes.MITHRIL]: 'forged from mithril',
            [this.materialTypes.ADAMANT]: 'crafted from adamant',
            [this.materialTypes.MAGICAL]: 'imbued with magic',
            [this.materialTypes.BONE]: 'carved from bone',
            [this.materialTypes.STONE]: 'hewn from stone'
        };

        return `${qualityDesc[quality]} ${materialDesc[material]}. ${template.description}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(template, material, quality, enchanted) {
        const colors = this.toolColors[material];

        return {
            baseColor: colors.base,
            handleColor: colors.handle,
            metalColor: colors.metal,
            glowColor: enchanted && colors.glow ? colors.glow : null,
            material: material,
            quality: quality,
            enchanted: enchanted
        };
    }

    /**
     * Generate effects
     */
    generateEffects(template, stats, enchanted) {
        const effects = [];

        // Primary tool effect
        effects.push({
            type: 'tool_efficiency',
            power: stats.efficiency,
            duration: -1, // Permanent
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
        if (template.toolType === 'smithing') {
            effects.push({
                type: 'smithing_bonus',
                power: 1.2,
                duration: -1,
                instant: false
            });
        }

        // Enchantment effects
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

    // Placeholder methods for effects (would be implemented with actual image processing)
    async addRareGlow(image) { return image; }
    async addEpicGlow(image) { return image; }
    async addLegendaryGlow(image) { return image; }
    async addMythicalGlow(image) { return image; }
    async addGlowEffect(image, color) { return image; }

    /**
     * Batch generate tools
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const tool = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(tool);
            } catch (error) {
                console.error(`Failed to generate tool ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(t => t !== null);
    }

    /**
     * Generate tool by specific criteria
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
     * Get tool statistics
     */
    getToolStatistics() {
        return {
            totalTypes: Object.keys(this.toolTypes).length,
            totalMaterials: Object.keys(this.materialTypes).length,
            totalQualities: Object.keys(this.toolQualities).length,
            totalSizes: Object.keys(this.toolSizes).length,
            workToolTypes: Object.keys(this.workToolTemplates).length,
            craftingToolTypes: Object.keys(this.craftingToolTemplates).length,
            fishingToolTypes: Object.keys(this.fishingToolTemplates).length,
            miningToolTypes: Object.keys(this.miningToolTemplates).length,
            farmingToolTypes: Object.keys(this.farmingToolTemplates).length,
            cookingToolTypes: Object.keys(this.cookingToolTemplates).length
        };
    }

    /**
     * Export tool data
     */
    async exportToolData(tool, outputPath) {
        const exportData = {
            ...tool.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save tool data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate tool configuration
     */
    validateToolConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.toolTypes).includes(config.type)) {
            errors.push(`Invalid tool type: ${config.type}`);
        }

        if (config.material && !Object.values(this.materialTypes).includes(config.material)) {
            errors.push(`Invalid material type: ${config.material}`);
        }

        if (config.quality && !Object.values(this.toolQualities).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        if (config.size && !Object.values(this.toolSizes).includes(config.size)) {
            errors.push(`Invalid size: ${config.size}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = ToolGenerator;
