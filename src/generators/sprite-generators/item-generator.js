/**
 * Enhanced Item Sprite Generator
 * Handles generation of 50+ item sprites with rarity systems and categories
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-utils');

class ItemGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Define comprehensive item database
        this.itemDatabase = {
            // WEAPONS (15+ types)
            weapons: {
                melee: {
                    sword: { name: 'Sword', rarity: 'common', damage: 8 },
                    longsword: { name: 'Longsword', rarity: 'uncommon', damage: 10 },
                    greatsword: { name: 'Greatsword', rarity: 'rare', damage: 15 },
                    shortsword: { name: 'Shortsword', rarity: 'common', damage: 6 },
                    rapier: { name: 'Rapier', rarity: 'uncommon', damage: 9 },
                    scimitar: { name: 'Scimitar', rarity: 'uncommon', damage: 9 },
                    katana: { name: 'Katana', rarity: 'epic', damage: 12 },
                    dagger: { name: 'Dagger', rarity: 'common', damage: 5 },
                    dirk: { name: 'Dirk', rarity: 'uncommon', damage: 6 },
                    stiletto: { name: 'Stiletto', rarity: 'rare', damage: 7 }
                },
                axe: {
                    handaxe: { name: 'Handaxe', rarity: 'common', damage: 7 },
                    battleaxe: { name: 'Battleaxe', rarity: 'uncommon', damage: 11 },
                    greataxe: { name: 'Greataxe', rarity: 'rare', damage: 16 },
                    waraxe: { name: 'Waraxe', rarity: 'uncommon', damage: 12 },
                    throwingaxe: { name: 'Throwing Axe', rarity: 'common', damage: 6 }
                },
                blunt: {
                    mace: { name: 'Mace', rarity: 'common', damage: 8 },
                    morningstar: { name: 'Morningstar', rarity: 'rare', damage: 13 },
                    warhammer: { name: 'Warhammer', rarity: 'uncommon', damage: 12 },
                    club: { name: 'Club', rarity: 'common', damage: 6 },
                    flail: { name: 'Flail', rarity: 'rare', damage: 14 }
                },
                polearm: {
                    spear: { name: 'Spear', rarity: 'common', damage: 9 },
                    halberd: { name: 'Halberd', rarity: 'rare', damage: 15 },
                    pike: { name: 'Pike', rarity: 'uncommon', damage: 11 },
                    lance: { name: 'Lance', rarity: 'epic', damage: 18 },
                    trident: { name: 'Trident', rarity: 'rare', damage: 13 }
                }
            },

            // RANGED WEAPONS (8+ types)
            ranged: {
                bow: {
                    shortbow: { name: 'Shortbow', rarity: 'common', damage: 6 },
                    longbow: { name: 'Longbow', rarity: 'uncommon', damage: 8 },
                    recurvebow: { name: 'Recurve Bow', rarity: 'rare', damage: 10 },
                    crossbow: { name: 'Crossbow', rarity: 'uncommon', damage: 12 },
                    arbalest: { name: 'Arbalest', rarity: 'epic', damage: 16 }
                },
                thrown: {
                    javelin: { name: 'Javelin', rarity: 'common', damage: 7 },
                    throwingknife: { name: 'Throwing Knife', rarity: 'uncommon', damage: 5 },
                    shuriken: { name: 'Shuriken', rarity: 'rare', damage: 4 },
                    boomerang: { name: 'Boomerang', rarity: 'uncommon', damage: 6 }
                }
            },

            // MAGIC WEAPONS (6+ types)
            magic: {
                staff: {
                    woodenstaff: { name: 'Wooden Staff', rarity: 'common', damage: 4 },
                    crystalstaff: { name: 'Crystal Staff', rarity: 'rare', damage: 6 },
                    runestaff: { name: 'Rune Staff', rarity: 'epic', damage: 8 },
                    archmage_staff: { name: 'Archmage Staff', rarity: 'legendary', damage: 12 }
                },
                wand: {
                    apprentice_wand: { name: 'Apprentice Wand', rarity: 'common', damage: 3 },
                    mage_wand: { name: 'Mage Wand', rarity: 'uncommon', damage: 5 },
                    archmage_wand: { name: 'Archmage Wand', rarity: 'rare', damage: 7 },
                    legendary_wand: { name: 'Legendary Wand', rarity: 'legendary', damage: 10 }
                },
                orb: {
                    crystal_orb: { name: 'Crystal Orb', rarity: 'uncommon', damage: 5 },
                    void_orb: { name: 'Void Orb', rarity: 'rare', damage: 8 },
                    chaos_orb: { name: 'Chaos Orb', rarity: 'epic', damage: 12 }
                }
            },

            // ARMOR (12+ types)
            armor: {
                helmet: {
                    leather_cap: { name: 'Leather Cap', rarity: 'common', defense: 2 },
                    chain_coif: { name: 'Chain Coif', rarity: 'uncommon', defense: 3 },
                    iron_helmet: { name: 'Iron Helmet', rarity: 'uncommon', defense: 4 },
                    steel_helmet: { name: 'Steel Helmet', rarity: 'rare', defense: 5 },
                    great_helm: { name: 'Great Helm', rarity: 'rare', defense: 6 },
                    dragon_helm: { name: 'Dragon Helm', rarity: 'epic', defense: 8 }
                },
                chest: {
                    leather_tunic: { name: 'Leather Tunic', rarity: 'common', defense: 3 },
                    chain_shirt: { name: 'Chain Shirt', rarity: 'uncommon', defense: 5 },
                    breastplate: { name: 'Breastplate', rarity: 'rare', defense: 7 },
                    full_plate: { name: 'Full Plate', rarity: 'epic', defense: 10 },
                    dragon_scale: { name: 'Dragon Scale', rarity: 'legendary', defense: 12 }
                },
                legs: {
                    leather_pants: { name: 'Leather Pants', rarity: 'common', defense: 2 },
                    chain_legs: { name: 'Chain Legs', rarity: 'uncommon', defense: 4 },
                    plate_legs: { name: 'Plate Legs', rarity: 'rare', defense: 6 },
                    greaves: { name: 'Greaves', rarity: 'rare', defense: 5 }
                },
                boots: {
                    leather_boots: { name: 'Leather Boots', rarity: 'common', defense: 1 },
                    chain_boots: { name: 'Chain Boots', rarity: 'uncommon', defense: 2 },
                    steel_boots: { name: 'Steel Boots', rarity: 'uncommon', defense: 3 },
                    plate_boots: { name: 'Plate Boots', rarity: 'rare', defense: 4 }
                }
            },

            // SHIELDS (4+ types)
            shields: {
                buckler: { name: 'Buckler', rarity: 'common', defense: 3 },
                round_shield: { name: 'Round Shield', rarity: 'uncommon', defense: 5 },
                kite_shield: { name: 'Kite Shield', rarity: 'rare', defense: 7 },
                tower_shield: { name: 'Tower Shield', rarity: 'epic', defense: 10 },
                dragon_shield: { name: 'Dragon Shield', rarity: 'legendary', defense: 12 }
            },

            // CONSUMABLES (8+ types)
            consumables: {
                potions: {
                    health_potion: { name: 'Health Potion', rarity: 'common', effect: 'heal' },
                    mana_potion: { name: 'Mana Potion', rarity: 'common', effect: 'restore_mana' },
                    strength_potion: { name: 'Strength Potion', rarity: 'uncommon', effect: 'buff_strength' },
                    invisibility_potion: { name: 'Invisibility Potion', rarity: 'rare', effect: 'invisibility' },
                    regeneration_potion: { name: 'Regeneration Potion', rarity: 'epic', effect: 'regeneration' }
                },
                food: {
                    bread: { name: 'Bread', rarity: 'common', effect: 'heal_small' },
                    cheese: { name: 'Cheese', rarity: 'common', effect: 'heal_small' },
                    apple: { name: 'Apple', rarity: 'common', effect: 'heal_small' },
                    roasted_meat: { name: 'Roasted Meat', rarity: 'uncommon', effect: 'heal_medium' },
                    dragon_steak: { name: 'Dragon Steak', rarity: 'epic', effect: 'heal_large' }
                },
                scrolls: {
                    fireball_scroll: { name: 'Fireball Scroll', rarity: 'uncommon', effect: 'cast_fireball' },
                    teleport_scroll: { name: 'Teleport Scroll', rarity: 'rare', effect: 'teleport' },
                    resurrection_scroll: { name: 'Resurrection Scroll', rarity: 'legendary', effect: 'resurrect' }
                }
            },

            // TOOLS (6+ types)
            tools: {
                mining: {
                    pickaxe: { name: 'Pickaxe', rarity: 'common', durability: 100 },
                    hammer: { name: 'Hammer', rarity: 'common', durability: 80 },
                    chisel: { name: 'Chisel', rarity: 'uncommon', durability: 60 }
                },
                gathering: {
                    fishing_rod: { name: 'Fishing Rod', rarity: 'common', durability: 70 },
                    sickle: { name: 'Sickle', rarity: 'common', durability: 90 },
                    skinning_knife: { name: 'Skinning Knife', rarity: 'uncommon', durability: 75 }
                },
                crafting: {
                    anvil: { name: 'Anvil', rarity: 'rare', durability: 500 },
                    forge: { name: 'Forge', rarity: 'epic', durability: 1000 }
                }
            },

            // ACCESSORIES (8+ types)
            accessories: {
                rings: {
                    copper_ring: { name: 'Copper Ring', rarity: 'common', effect: 'none' },
                    silver_ring: { name: 'Silver Ring', rarity: 'uncommon', effect: 'mana_regen' },
                    gold_ring: { name: 'Gold Ring', rarity: 'rare', effect: 'health_regen' },
                    ruby_ring: { name: 'Ruby Ring', rarity: 'epic', effect: 'fire_resistance' },
                    diamond_ring: { name: 'Diamond Ring', rarity: 'legendary', effect: 'all_resistance' }
                },
                necklaces: {
                    copper_amulet: { name: 'Copper Amulet', rarity: 'common', effect: 'none' },
                    silver_necklace: { name: 'Silver Necklace', rarity: 'uncommon', effect: 'stealth' },
                    gold_necklace: { name: 'Gold Necklace', rarity: 'rare', effect: 'luck' },
                    crystal_necklace: { name: 'Crystal Necklace', rarity: 'epic', effect: 'magic_power' }
                },
                belts: {
                    leather_belt: { name: 'Leather Belt', rarity: 'common', effect: 'none' },
                    studded_belt: { name: 'Studded Belt', rarity: 'uncommon', effect: 'strength' },
                    champion_belt: { name: 'Champion Belt', rarity: 'epic', effect: 'combat_mastery' }
                }
            },

            // MATERIALS (10+ types)
            materials: {
                ores: {
                    copper_ore: { name: 'Copper Ore', rarity: 'common', value: 5 },
                    iron_ore: { name: 'Iron Ore', rarity: 'common', value: 8 },
                    silver_ore: { name: 'Silver Ore', rarity: 'uncommon', value: 15 },
                    gold_ore: { name: 'Gold Ore', rarity: 'rare', value: 25 },
                    mithril_ore: { name: 'Mithril Ore', rarity: 'epic', value: 50 },
                    adamantium_ore: { name: 'Adamantium Ore', rarity: 'legendary', value: 100 }
                },
                gems: {
                    amethyst: { name: 'Amethyst', rarity: 'uncommon', value: 20 },
                    emerald: { name: 'Emerald', rarity: 'rare', value: 40 },
                    ruby: { name: 'Ruby', rarity: 'rare', value: 45 },
                    sapphire: { name: 'Sapphire', rarity: 'rare', value: 42 },
                    diamond: { name: 'Diamond', rarity: 'epic', value: 80 },
                    dragon_gem: { name: 'Dragon Gem', rarity: 'legendary', value: 200 }
                },
                woods: {
                    oak_log: { name: 'Oak Log', rarity: 'common', value: 3 },
                    pine_log: { name: 'Pine Log', rarity: 'common', value: 4 },
                    mahogany_log: { name: 'Mahogany Log', rarity: 'uncommon', value: 8 },
                    elder_log: { name: 'Elder Log', rarity: 'rare', value: 15 },
                    dragonwood_log: { name: 'Dragonwood Log', rarity: 'epic', value: 30 }
                }
            },

            // MAGICAL ITEMS (6+ types)
            magical: {
                tomes: {
                    spellbook: { name: 'Spellbook', rarity: 'uncommon', spells: 5 },
                    grimoire: { name: 'Grimoire', rarity: 'rare', spells: 10 },
                    codex: { name: 'Codex of Power', rarity: 'epic', spells: 20 },
                    necronomicon: { name: 'Necronomicon', rarity: 'legendary', spells: 50 }
                },
                artifacts: {
                    phoenix_feather: { name: 'Phoenix Feather', rarity: 'epic', effect: 'revive' },
                    dragon_scale: { name: 'Dragon Scale', rarity: 'legendary', effect: 'invulnerability' },
                    unicorn_horn: { name: 'Unicorn Horn', rarity: 'legendary', effect: 'healing_aura' }
                }
            }
        };

        // Rarity configuration
        this.rarityConfig = {
            common: { color: '#FFFFFF', glow: false, multiplier: 1.0 },
            uncommon: { color: '#00FF00', glow: false, multiplier: 1.2 },
            rare: { color: '#0080FF', glow: true, multiplier: 1.5 },
            epic: { color: '#8000FF', glow: true, multiplier: 2.0 },
            legendary: { color: '#FFD700', glow: true, multiplier: 3.0 }
        };
    }

    /**
     * Main item generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine rarity-based properties
        const rarityConfig = this.utils.getRarityConfig(config.rarity || 'common');
        config.rarityColor = rarityConfig.color;
        config.glowEffect = rarityConfig.glow;

        // Generate based on category and type
        const category = config.category || 'weapon';
        const itemType = config.itemType || 'sword';

        switch (category) {
            case 'weapon':
                await this.generateWeaponItem(itemType, config, image);
                break;
            case 'armor':
                await this.generateArmorItem(itemType, config, image);
                break;
            case 'consumable':
                await this.generateConsumableItem(itemType, config, image);
                break;
            case 'tool':
                await this.generateToolItem(itemType, config, image);
                break;
            case 'accessory':
                await this.generateAccessoryItem(itemType, config, image);
                break;
            case 'material':
                await this.generateMaterialItem(itemType, config, image);
                break;
            case 'magical':
                await this.generateMagicalItem(itemType, config, image);
                break;
            default:
                await this.generateWeaponItem(itemType, config, image);
        }

        // Add rarity glow effect if applicable
        if (config.glowEffect) {
            await this.addRarityGlow(config.rarityColor, image);
        }
    }

    /**
     * Generate weapon item
     */
    async generateWeaponItem(itemType, config, image) {
        const { width, height } = image.bitmap;

        switch (itemType) {
            case 'sword':
                await this.generateSword(config, image);
                break;
            case 'axe':
                await this.generateAxe(config, image);
                break;
            case 'bow':
                await this.generateBow(config, image);
                break;
            case 'staff':
                await this.generateStaff(config, image);
                break;
            case 'dagger':
                await this.generateDagger(config, image);
                break;
            case 'mace':
                await this.generateMace(config, image);
                break;
            case 'spear':
                await this.generateSpear(config, image);
                break;
            default:
                await this.generateSword(config, image);
        }
    }

    /**
     * Generate armor item
     */
    async generateArmorItem(itemType, config, image) {
        const { width, height } = image.bitmap;

        switch (itemType) {
            case 'helmet':
                await this.generateHelmet(config, image);
                break;
            case 'chestplate':
                await this.generateChestplate(config, image);
                break;
            case 'boots':
                await this.generateBoots(config, image);
                break;
            case 'shield':
                await this.generateShield(config, image);
                break;
            default:
                await this.generateChestplate(config, image);
        }
    }

    /**
     * Generate consumable item
     */
    async generateConsumableItem(itemType, config, image) {
        const { width, height } = image.bitmap;

        switch (itemType) {
            case 'potion':
                await this.generatePotion(config, image);
                break;
            case 'food':
                await this.generateFood(config, image);
                break;
            case 'scroll':
                await this.generateScroll(config, image);
                break;
            default:
                await this.generatePotion(config, image);
        }
    }

    /**
     * Generate tool item
     */
    async generateToolItem(itemType, config, image) {
        const { width, height } = image.bitmap;

        switch (itemType) {
            case 'pickaxe':
                await this.generatePickaxe(config, image);
                break;
            case 'hammer':
                await this.generateHammer(config, image);
                break;
            case 'fishing_rod':
                await this.generateFishingRod(config, image);
                break;
            default:
                await this.generatePickaxe(config, image);
        }
    }

    /**
     * Generate accessory item
     */
    async generateAccessoryItem(itemType, config, image) {
        const { width, height } = image.bitmap;

        switch (itemType) {
            case 'ring':
                await this.generateRing(config, image);
                break;
            case 'necklace':
                await this.generateNecklace(config, image);
                break;
            case 'amulet':
                await this.generateAmulet(config, image);
                break;
            default:
                await this.generateRing(config, image);
        }
    }

    /**
     * Generate material item
     */
    async generateMaterialItem(itemType, config, image) {
        const { width, height } = image.bitmap;

        switch (itemType) {
            case 'ore':
                await this.generateOre(config, image);
                break;
            case 'gem':
                await this.generateGem(config, image);
                break;
            case 'wood':
                await this.generateWood(config, image);
                break;
            default:
                await this.generateOre(config, image);
        }
    }

    /**
     * Generate magical item
     */
    async generateMagicalItem(itemType, config, image) {
        const { width, height } = image.bitmap;

        switch (itemType) {
            case 'orb':
                await this.generateOrb(config, image);
                break;
            case 'wand':
                await this.generateWand(config, image);
                break;
            case 'tome':
                await this.generateTome(config, image);
                break;
            default:
                await this.generateOrb(config, image);
        }
    }

    /**
     * Generate sword
     */
    async generateSword(config, image) {
        const { width, height } = image.bitmap;

        // Blade (silver)
        const bladeColor = this.utils.getColor('#C0C0C0');
        this.utils.drawRectangle(image, Math.floor(width * 0.4), Math.floor(height * 0.1), Math.floor(width * 0.2), Math.floor(height * 0.7), bladeColor);

        // Hilt (brown)
        const hiltColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.45), Math.floor(height * 0.75), Math.floor(width * 0.1), Math.floor(height * 0.2), hiltColor);

        // Guard (gold)
        const guardColor = this.utils.getColor('#FFD700');
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.3), Math.floor(height * 0.05), guardColor);
    }

    /**
     * Generate axe
     */
    async generateAxe(config, image) {
        const { width, height } = image.bitmap;

        // Handle (brown)
        const handleColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.3), Math.floor(width * 0.04), Math.floor(height * 0.6), handleColor);

        // Blade (gray)
        const bladeColor = this.utils.getColor('#808080');
        // Axe head
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.2), Math.floor(width * 0.3), Math.floor(height * 0.15), bladeColor);
    }

    /**
     * Generate bow
     */
    async generateBow(config, image) {
        const { width, height } = image.bitmap;

        // Bow curve (brown)
        const bowColor = this.utils.getColor('#8B4513');
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.5);
        const radius = Math.floor(height * 0.3);

        // Draw a simple curved bow shape
        for (let angle = Math.PI * 0.2; angle <= Math.PI * 0.8; angle += 0.1) {
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                image.bitmap.data[idx] = (bowColor >> 16) & 0xFF;
                image.bitmap.data[idx + 1] = (bowColor >> 8) & 0xFF;
                image.bitmap.data[idx + 2] = bowColor & 0xFF;
                image.bitmap.data[idx + 3] = 255;
            }
        }

        // String (gray)
        const stringColor = this.utils.getColor('#808080');
        const x1 = Math.floor(width * 0.35);
        const y1 = Math.floor(height * 0.25);
        const x2 = Math.floor(width * 0.65);
        const y2 = Math.floor(height * 0.75);

        this.utils.drawLine(image, x1, y1, x2, y2, stringColor);
    }

    /**
     * Generate staff
     */
    async generateStaff(config, image) {
        const { width, height } = image.bitmap;

        // Staff shaft (brown)
        const shaftColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.1), Math.floor(width * 0.04), Math.floor(height * 0.8), shaftColor);

        // Crystal top (blue)
        const crystalColor = this.utils.getColor('#4169E1');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.08), Math.floor(width * 0.06), Math.floor(height * 0.04), crystalColor);
    }

    /**
     * Generate dagger
     */
    async generateDagger(config, image) {
        const { width, height } = image.bitmap;

        // Blade (silver)
        const bladeColor = this.utils.getColor('#C0C0C0');
        this.utils.drawRectangle(image, Math.floor(width * 0.45), Math.floor(height * 0.2), Math.floor(width * 0.1), Math.floor(height * 0.6), bladeColor);

        // Hilt (black)
        const hiltColor = this.utils.getColor('#000000');
        this.utils.drawRectangle(image, Math.floor(width * 0.47), Math.floor(height * 0.75), Math.floor(width * 0.06), Math.floor(height * 0.15), hiltColor);
    }

    /**
     * Generate mace
     */
    async generateMace(config, image) {
        const { width, height } = image.bitmap;

        // Handle (brown)
        const handleColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.4), Math.floor(width * 0.04), Math.floor(height * 0.5), handleColor);

        // Head (spiked metal)
        const headColor = this.utils.getColor('#708090');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.35), Math.floor(width * 0.08), Math.floor(height * 0.06), headColor);
    }

    /**
     * Generate spear
     */
    async generateSpear(config, image) {
        const { width, height } = image.bitmap;

        // Shaft (brown)
        const shaftColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.2), Math.floor(width * 0.04), Math.floor(height * 0.7), shaftColor);

        // Blade (silver)
        const bladeColor = this.utils.getColor('#C0C0C0');
        this.utils.drawRectangle(image, Math.floor(width * 0.46), Math.floor(height * 0.1), Math.floor(width * 0.08), Math.floor(height * 0.15), bladeColor);
    }

    /**
     * Generate helmet
     */
    async generateHelmet(config, image) {
        const { width, height } = image.bitmap;

        // Helmet shape (gray)
        const helmetColor = this.utils.getColor('#708090');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.4), Math.floor(width * 0.25), Math.floor(height * 0.3), helmetColor);

        // Face opening (black)
        const faceColor = this.utils.getColor('#000000');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.45), Math.floor(width * 0.15), Math.floor(height * 0.15), faceColor);
    }

    /**
     * Generate chestplate
     */
    async generateChestplate(config, image) {
        const { width, height } = image.bitmap;

        // Armor plates (brown)
        const armorColor = this.utils.getColor('#8B4513');

        // Chest plate
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.3), Math.floor(width * 0.6), Math.floor(height * 0.5), armorColor);

        // Shoulder pads
        const shoulderColor = this.utils.getColor('#654321');
        this.utils.drawEllipse(image, Math.floor(width * 0.25), Math.floor(height * 0.35), Math.floor(width * 0.1), Math.floor(height * 0.075), shoulderColor);
        this.utils.drawEllipse(image, Math.floor(width * 0.75), Math.floor(height * 0.35), Math.floor(width * 0.1), Math.floor(height * 0.075), shoulderColor);

        // Belt
        const beltColor = this.utils.getColor('#000000');
        this.utils.drawRectangle(image, Math.floor(width * 0.15), Math.floor(height * 0.65), Math.floor(width * 0.7), Math.floor(height * 0.075), beltColor);
    }

    /**
     * Generate boots
     */
    async generateBoots(config, image) {
        const { width, height } = image.bitmap;

        // Boot shape (brown)
        const bootColor = this.utils.getColor('#8B4513');

        // Left boot
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.6), Math.floor(width * 0.15), Math.floor(height * 0.3), bootColor);

        // Right boot
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.6), Math.floor(width * 0.15), Math.floor(height * 0.3), bootColor);
    }

    /**
     * Generate shield
     */
    async generateShield(config, image) {
        const { width, height } = image.bitmap;

        // Shield (steel blue)
        const shieldColor = this.utils.getColor('#4682B4');
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.5);
        const radiusX = Math.floor(width * 0.3);
        const radiusY = Math.floor(height * 0.4);

        for (let y = centerY - radiusY; y <= centerY + radiusY; y++) {
            for (let x = centerX - radiusX; x <= centerX + radiusX; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const dx = (x - centerX) / radiusX;
                    const dy = (y - centerY) / radiusY;
                    if (dx * dx + dy * dy <= 1) {
                        const idx = (y * width + x) * 4;
                        image.bitmap.data[idx] = (shieldColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (shieldColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = shieldColor & 0xFF;
                        image.bitmap.data[idx + 3] = 255;
                    }
                }
            }
        }

        // Border (gold)
        const borderColor = this.utils.getColor('#FFD700');
        // Top and bottom borders
        this.utils.drawRectangle(image, centerX - radiusX, centerY - radiusY, radiusX * 2, 2, borderColor);
        this.utils.drawRectangle(image, centerX - radiusX, centerY + radiusY - 1, radiusX * 2, 2, borderColor);

        // Emblem (red cross)
        const crossColor = this.utils.getColor('#FF0000');
        // Vertical part
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.3), Math.floor(width * 0.04), Math.floor(height * 0.4), crossColor);
        // Horizontal part
        this.utils.drawRectangle(image, Math.floor(width * 0.42), Math.floor(height * 0.48), Math.floor(width * 0.16), Math.floor(height * 0.04), crossColor);
    }

    /**
     * Generate potion
     */
    async generatePotion(config, image) {
        const { width, height } = image.bitmap;

        // Bottle (glass - light blue)
        const bottleColor = this.utils.getColor('#87CEEB');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.2), Math.floor(width * 0.4), Math.floor(height * 0.7), bottleColor);

        // Liquid (red for health potion)
        const liquidColor = this.utils.getColor('#FF0000');
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.3), Math.floor(width * 0.3), Math.floor(height * 0.5), liquidColor);

        // Cork (brown)
        const corkColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.4), Math.floor(height * 0.1), Math.floor(width * 0.2), Math.floor(height * 0.15), corkColor);
    }

    /**
     * Generate food
     */
    async generateFood(config, image) {
        const { width, height } = image.bitmap;

        // Food item (various colors based on type)
        const foodColor = this.utils.getColor('#D2691E'); // Saddle brown for bread/meat
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.5), Math.floor(width * 0.25), Math.floor(height * 0.2), foodColor);
    }

    /**
     * Generate scroll
     */
    async generateScroll(config, image) {
        const { width, height } = image.bitmap;

        // Scroll paper (cream)
        const paperColor = this.utils.getColor('#FFF8DC');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.3), Math.floor(width * 0.6), Math.floor(height * 0.4), paperColor);

        // Ribbon (red)
        const ribbonColor = this.utils.getColor('#DC143C');
        this.utils.drawRectangle(image, Math.floor(width * 0.45), Math.floor(height * 0.25), Math.floor(width * 0.1), Math.floor(height * 0.1), ribbonColor);
    }

    /**
     * Generate pickaxe
     */
    async generatePickaxe(config, image) {
        const { width, height } = image.bitmap;

        // Handle (brown)
        const handleColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.3), Math.floor(width * 0.04), Math.floor(height * 0.6), handleColor);

        // Pick head (gray)
        const headColor = this.utils.getColor('#808080');
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.2), Math.floor(width * 0.3), Math.floor(height * 0.15), headColor);
    }

    /**
     * Generate hammer
     */
    async generateHammer(config, image) {
        const { width, height } = image.bitmap;

        // Handle (brown)
        const handleColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.3), Math.floor(width * 0.04), Math.floor(height * 0.6), handleColor);

        // Hammer head (gray)
        const headColor = this.utils.getColor('#708090');
        this.utils.drawRectangle(image, Math.floor(width * 0.4), Math.floor(height * 0.2), Math.floor(width * 0.2), Math.floor(height * 0.12), headColor);
    }

    /**
     * Generate fishing rod
     */
    async generateFishingRod(config, image) {
        const { width, height } = image.bitmap;

        // Rod (brown)
        const rodColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.2), Math.floor(width * 0.04), Math.floor(height * 0.7), rodColor);

        // Line (gray)
        const lineColor = this.utils.getColor('#808080');
        this.utils.drawLine(image, Math.floor(width * 0.5), Math.floor(height * 0.2), Math.floor(width * 0.7), Math.floor(height * 0.1), lineColor);
    }

    /**
     * Generate ring
     */
    async generateRing(config, image) {
        const { width, height } = image.bitmap;

        // Ring band (gold)
        const bandColor = this.utils.getColor('#FFD700');
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.5);
        const outerRadius = Math.floor(width * 0.2);
        const innerRadius = Math.floor(width * 0.15);

        // Draw ring shape (annulus)
        for (let y = centerY - outerRadius; y <= centerY + outerRadius; y++) {
            for (let x = centerX - outerRadius; x <= centerX + outerRadius; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const dx = (x - centerX) / outerRadius;
                    const dy = (y - centerY) / outerRadius;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= 1 && distance >= innerRadius / outerRadius) {
                        const idx = (y * width + x) * 4;
                        image.bitmap.data[idx] = (bandColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (bandColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = bandColor & 0xFF;
                        image.bitmap.data[idx + 3] = 255;
                    }
                }
            }
        }

        // Gem (red)
        const gemColor = this.utils.getColor('#FF0000');
        this.utils.drawEllipse(image, centerX, centerY, Math.floor(width * 0.08), Math.floor(height * 0.06), gemColor);
    }

    /**
     * Generate necklace
     */
    async generateNecklace(config, image) {
        const { width, height } = image.bitmap;

        // Chain (gold)
        const chainColor = this.utils.getColor('#FFD700');
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.5);
        const radius = Math.floor(width * 0.25);

        // Draw necklace curve
        for (let angle = 0; angle <= Math.PI; angle += 0.1) {
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                image.bitmap.data[idx] = (chainColor >> 16) & 0xFF;
                image.bitmap.data[idx + 1] = (chainColor >> 8) & 0xFF;
                image.bitmap.data[idx + 2] = chainColor & 0xFF;
                image.bitmap.data[idx + 3] = 255;
            }
        }

        // Pendant (blue gem)
        const pendantColor = this.utils.getColor('#4169E1');
        this.utils.drawEllipse(image, centerX, Math.floor(height * 0.75), Math.floor(width * 0.08), Math.floor(height * 0.06), pendantColor);
    }

    /**
     * Generate amulet
     */
    async generateAmulet(config, image) {
        const { width, height } = image.bitmap;

        // Amulet shape (gold)
        const amuletColor = this.utils.getColor('#FFD700');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.25), amuletColor);

        // Symbol (red)
        const symbolColor = this.utils.getColor('#FF0000');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.4), Math.floor(width * 0.06), Math.floor(height * 0.04), symbolColor);
    }

    /**
     * Generate ore
     */
    async generateOre(config, image) {
        const { width, height } = image.bitmap;

        // Ore chunk (gray with metallic flecks)
        const oreColor = this.utils.getColor('#696969');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.5), Math.floor(width * 0.25), Math.floor(height * 0.2), oreColor);

        // Metallic flecks (silver)
        const fleckColor = this.utils.getColor('#C0C0C0');
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(width * (0.4 + Math.random() * 0.2));
            const y = Math.floor(height * (0.4 + Math.random() * 0.2));
            this.utils.drawEllipse(image, x, y, Math.floor(width * 0.02), Math.floor(height * 0.015), fleckColor);
        }
    }

    /**
     * Generate gem
     */
    async generateGem(config, image) {
        const { width, height } = image.bitmap;

        // Gem facets (various colors)
        const gemColor = this.utils.getColor('#FF00FF'); // Magenta for gem
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.5), Math.floor(width * 0.2), Math.floor(height * 0.15), gemColor);

        // Highlight (white)
        const highlightColor = this.utils.getColor('#FFFFFF');
        this.utils.drawEllipse(image, Math.floor(width * 0.45), Math.floor(height * 0.45), Math.floor(width * 0.05), Math.floor(height * 0.03), highlightColor);
    }

    /**
     * Generate wood
     */
    async generateWood(config, image) {
        const { width, height } = image.bitmap;

        // Wood log (brown)
        const woodColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.4), Math.floor(width * 0.6), Math.floor(height * 0.3), woodColor);

        // Bark texture (darker brown)
        const barkColor = this.utils.getColor('#654321');
        for (let i = 0; i < 3; i++) {
            this.utils.drawRectangle(image, Math.floor(width * (0.25 + i * 0.15)), Math.floor(height * 0.4), Math.floor(width * 0.02), Math.floor(height * 0.3), barkColor);
        }
    }

    /**
     * Generate orb
     */
    async generateOrb(config, image) {
        const { width, height } = image.bitmap;

        // Outer glow (light blue)
        const glowColor = this.utils.getColor('#87CEEB');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.5), Math.floor(width * 0.25), Math.floor(height * 0.2), glowColor);

        // Inner core (bright blue)
        const coreColor = this.utils.getColor('#00FFFF');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.12), coreColor);

        // Energy sparks (white)
        const sparkColor = this.utils.getColor('#FFFFFF');
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const x = Math.floor(width * 0.5 + Math.cos(angle) * width * 0.2);
            const y = Math.floor(height * 0.5 + Math.sin(angle) * height * 0.15);
            this.utils.drawEllipse(image, x, y, Math.floor(width * 0.02), Math.floor(height * 0.015), sparkColor);
        }
    }

    /**
     * Generate wand
     */
    async generateWand(config, image) {
        const { width, height } = image.bitmap;

        // Wand shaft (wood)
        const shaftColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.2), Math.floor(width * 0.04), Math.floor(height * 0.7), shaftColor);

        // Crystal tip (purple)
        const crystalColor = this.utils.getColor('#8A2BE2');
        this.utils.drawEllipse(image, Math.floor(width * 0.5), Math.floor(height * 0.15), Math.floor(width * 0.06), Math.floor(height * 0.04), crystalColor);
    }

    /**
     * Generate tome
     */
    async generateTome(config, image) {
        const { width, height } = image.bitmap;

        // Book cover (brown)
        const coverColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.3), Math.floor(width * 0.5), Math.floor(height * 0.5), coverColor);

        // Pages (cream)
        const pageColor = this.utils.getColor('#FFF8DC');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.35), Math.floor(width * 0.4), Math.floor(height * 0.4), pageColor);

        // Mystic runes (gold)
        const runeColor = this.utils.getColor('#FFD700');
        for (let i = 0; i < 3; i++) {
            this.utils.drawRectangle(image, Math.floor(width * (0.35 + i * 0.1)), Math.floor(height * 0.4), Math.floor(width * 0.02), Math.floor(height * 0.3), runeColor);
        }
    }

    /**
     * Add rarity glow effect
     */
    async addRarityGlow(rarityColor, image) {
        const { width, height } = image.bitmap;
        const color = this.utils.getColor(rarityColor);

        // Add glow around the item
        this.utils.applyGlow(image, Math.floor(width * 0.5), Math.floor(height * 0.5), Math.floor(width * 0.3), color, 0.3);
    }
}

module.exports = ItemGenerator;
