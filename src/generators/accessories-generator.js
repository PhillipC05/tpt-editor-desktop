/**
 * Accessories Generator - Hats, helmets, jewelry, capes, belts
 * Handles generation of wearable accessories with various styles and materials
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class AccessoriesGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Accessories database
        this.accessoriesDatabase = {
            hats: {
                name: 'Hats',
                types: ['wizard_hat', 'crown', 'cap', 'beret', 'top_hat', 'fedora', 'bowler', 'sun_hat', 'pirate_hat', 'chef_hat'],
                materials: ['cloth', 'leather', 'metal', 'wood', 'gemstone', 'magical'],
                colors: ['red', 'blue', 'green', 'black', 'white', 'gold', 'silver', 'purple', 'brown', 'gray']
            },
            helmets: {
                name: 'Helmets',
                types: ['great_helm', 'basinet', 'sallet', 'barbute', 'close_helm', 'burgonet', 'morion', 'kabuto', 'spangenhelm', 'viking_helm'],
                materials: ['steel', 'iron', 'mithril', 'adamant', 'dragon_scale', 'bone'],
                decorations: ['plumes', 'horns', 'wings', 'crown', 'runes', 'jewels']
            },
            jewelry: {
                name: 'Jewelry',
                types: ['necklace', 'bracelet', 'ring', 'earrings', 'tiara', 'brooch', 'pendant', 'crown', 'circlet', 'torc'],
                materials: ['gold', 'silver', 'platinum', 'copper', 'gemstone', 'crystal', 'bone', 'wood'],
                gems: ['diamond', 'ruby', 'sapphire', 'emerald', 'amethyst', 'topaz', 'opal', 'pearl', 'onyx', 'jade']
            },
            capes: {
                name: 'Capes',
                types: ['hooded_cape', 'shoulder_cape', 'full_cape', 'tabard', 'cloak', 'mantle', 'shawl', 'poncho', 'robe', 'tunic'],
                materials: ['wool', 'silk', 'velvet', 'leather', 'fur', 'chainmail', 'magical_fabric'],
                colors: ['red', 'blue', 'black', 'white', 'purple', 'green', 'gold', 'silver', 'brown', 'gray']
            },
            belts: {
                name: 'Belts',
                types: ['leather_belt', 'chain_belt', 'cloth_belt', 'rope_belt', 'metal_belt', 'gem_belt', 'magical_belt', 'utility_belt', 'ceremonial_belt', 'armored_belt'],
                materials: ['leather', 'metal', 'cloth', 'chain', 'gemstone', 'magical'],
                buckles: ['round', 'square', 'oval', 'shield', 'animal', 'jewelry', 'magical', 'plain']
            }
        };

        // Material properties
        this.materialProperties = {
            cloth: { shine: 0.2, texture: 'soft', durability: 0.3 },
            leather: { shine: 0.3, texture: 'rough', durability: 0.6 },
            metal: { shine: 0.9, texture: 'smooth', durability: 0.9 },
            wood: { shine: 0.4, texture: 'grainy', durability: 0.5 },
            gemstone: { shine: 1.0, texture: 'crystalline', durability: 0.8 },
            magical: { shine: 0.8, texture: 'ethereal', durability: 1.0 },
            steel: { shine: 0.7, texture: 'metallic', durability: 0.95 },
            iron: { shine: 0.6, texture: 'rough_metal', durability: 0.85 },
            mithril: { shine: 0.95, texture: 'light_metal', durability: 0.98 },
            adamant: { shine: 0.9, texture: 'hard_metal', durability: 1.0 },
            dragon_scale: { shine: 0.8, texture: 'scaly', durability: 0.9 },
            bone: { shine: 0.3, texture: 'porous', durability: 0.4 },
            gold: { shine: 1.0, texture: 'precious', durability: 0.7 },
            silver: { shine: 0.9, texture: 'noble', durability: 0.6 },
            platinum: { shine: 0.85, texture: 'rare', durability: 0.8 },
            copper: { shine: 0.8, texture: 'warm_metal', durability: 0.5 },
            crystal: { shine: 0.95, texture: 'transparent', durability: 0.6 },
            wool: { shine: 0.1, texture: 'fibrous', durability: 0.4 },
            silk: { shine: 0.6, texture: 'smooth_fabric', durability: 0.3 },
            velvet: { shine: 0.4, texture: 'luxurious', durability: 0.35 },
            fur: { shine: 0.2, texture: 'hairy', durability: 0.5 },
            chainmail: { shine: 0.7, texture: 'linked', durability: 0.8 }
        };

        // Color palettes
        this.colorPalettes = {
            red: [0xDC143C, 0xB22222, 0xFF0000, 0x8B0000, 0xFF6347],
            blue: [0x4169E1, 0x0000FF, 0x000080, 0x87CEEB, 0x1E90FF],
            green: [0x228B22, 0x006400, 0x32CD32, 0x008000, 0x90EE90],
            black: [0x000000, 0x2F2F2F, 0x696969, 0x808080, 0xA9A9A9],
            white: [0xFFFFFF, 0xF5F5F5, 0xE6E6FA, 0xF0F8FF, 0xFFFAF0],
            gold: [0xFFD700, 0xFFA500, 0xFF6347, 0xFFFF00, 0xFFE4B5],
            silver: [0xC0C0C0, 0xA8A8A8, 0xD3D3D3, 0xF5F5F5, 0xE6E6FA],
            purple: [0x9370DB, 0x8A2BE2, 0x9932CC, 0xBA55D3, 0xDA70D6],
            brown: [0x8B4513, 0x654321, 0xA0522D, 0xCD853F, 0xDEB887],
            gray: [0x808080, 0x696969, 0xA9A9A9, 0xC0C0C0, 0xD3D3D3]
        };

        // Gem colors
        this.gemColors = {
            diamond: [0xE6E6FA, 0xF0F8FF, 0xFFFFFF, 0xB0C4DE, 0x87CEEB],
            ruby: [0xDC143C, 0xB22222, 0xFF0000, 0x8B0000, 0xFF6347],
            sapphire: [0x4169E1, 0x0000FF, 0x000080, 0x1E90FF, 0x00BFFF],
            emerald: [0x228B22, 0x006400, 0x32CD32, 0x008000, 0x90EE90],
            amethyst: [0x9370DB, 0x8A2BE2, 0x9932CC, 0xBA55D3, 0xDA70D6],
            topaz: [0xFFD700, 0xFFA500, 0xFF6347, 0xFFFF00, 0xFFE4B5],
            opal: [0xFFFFFF, 0xE6E6FA, 0xF0F8FF, 0xB0C4DE, 0x87CEEB],
            pearl: [0xF5F5F5, 0xE6E6FA, 0xFFFFFF, 0xF0F8FF, 0xFFFAF0],
            onyx: [0x000000, 0x2F2F2F, 0x696969, 0x808080, 0xA9A9A9],
            jade: [0x228B22, 0x006400, 0x32CD32, 0x008000, 0x90EE90]
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine accessory type and generate accordingly
        const accessoryType = config.accessoryType || 'hats';
        const subType = config.subType || 'wizard_hat';

        switch (accessoryType) {
            case 'hats':
                await this.generateHat(image, config);
                break;
            case 'helmets':
                await this.generateHelmet(image, config);
                break;
            case 'jewelry':
                await this.generateJewelry(image, config);
                break;
            case 'capes':
                await this.generateCape(image, config);
                break;
            case 'belts':
                await this.generateBelt(image, config);
                break;
            default:
                await this.generateHat(image, config);
        }
    }

    /**
     * Generate hat
     */
    async generateHat(image, config) {
        const { width, height } = image.bitmap;
        const type = config.hatType || 'wizard_hat';
        const material = config.hatMaterial || 'cloth';
        const color = config.hatColor || 'blue';
        const size = config.hatSize || 'medium';

        const hatData = this.accessoriesDatabase.hats;

        // Calculate hat dimensions
        const sizeMultiplier = { small: 0.7, medium: 1.0, large: 1.3, extra_large: 1.6 };
        const multiplier = sizeMultiplier[size];

        const hatWidth = Math.floor(60 * multiplier);
        const hatHeight = Math.floor(50 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const hatY = Math.floor(height * 0.2);

        // Generate hat base
        await this.generateHatBase(image, centerX, hatY, hatWidth, hatHeight, type, material, color);

        // Add material-specific details
        await this.addHatDetails(image, centerX, hatY, hatWidth, hatHeight, type, material);

        // Add decorative elements
        await this.addHatDecorations(image, centerX, hatY, hatWidth, hatHeight, type, material);

        // Add shadow
        await this.addAccessoryShadow(image, centerX - hatWidth * 0.4, hatY, hatWidth, hatHeight);
    }

    /**
     * Generate hat base
     */
    async generateHatBase(image, centerX, y, width, height, type, material, color) {
        const baseColor = this.getAccessoryColor(color, material);

        switch (type) {
            case 'wizard_hat':
                // Conical wizard hat
                const points = [
                    { x: centerX, y: y },
                    { x: centerX - width * 0.3, y: y + height * 0.8 },
                    { x: centerX + width * 0.3, y: y + height * 0.8 }
                ];
                await this.fillIrregularShape(image, points, baseColor);

                // Add brim
                this.utils.drawEllipse(image, centerX, y + height * 0.9, width * 0.6, height * 0.1, baseColor);
                break;

            case 'crown':
                // Royal crown
                for (let i = 0; i < 5; i++) {
                    const crownX = centerX - width * 0.3 + (i * width * 0.15);
                    const crownY = y + height * 0.2;
                    this.utils.drawEllipse(image, crownX, crownY, width * 0.08, height * 0.6, baseColor);

                    // Add crown points
                    this.utils.drawEllipse(image, crownX, crownY - height * 0.2, width * 0.04, height * 0.2, baseColor);
                }
                break;

            case 'cap':
                // Baseball cap style
                this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.5, height * 0.4, baseColor);
                // Bill
                this.utils.drawEllipse(image, centerX, y + height * 0.6, width * 0.6, height * 0.15, baseColor);
                break;

            case 'top_hat':
                // Tall top hat
                this.utils.drawRectangle(image, centerX - width * 0.2, y, width * 0.4, height * 0.8, baseColor);
                // Brim
                this.utils.drawEllipse(image, centerX, y + height * 0.9, width * 0.5, height * 0.1, baseColor);
                break;

            default:
                // Generic hat shape
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.5, baseColor);
        }
    }

    /**
     * Generate helmet
     */
    async generateHelmet(image, config) {
        const { width, height } = image.bitmap;
        const type = config.helmetType || 'great_helm';
        const material = config.helmetMaterial || 'steel';
        const decoration = config.helmetDecoration || 'plain';

        const helmetData = this.accessoriesDatabase.helmets;

        // Calculate helmet dimensions
        const helmetWidth = Math.floor(50);
        const helmetHeight = Math.floor(60);
        const centerX = Math.floor(width * 0.5);
        const helmetY = Math.floor(height * 0.15);

        // Generate helmet base
        await this.generateHelmetBase(image, centerX, helmetY, helmetWidth, helmetHeight, type, material);

        // Add material-specific details
        await this.addHelmetDetails(image, centerX, helmetY, helmetWidth, helmetHeight, material);

        // Add decorations
        if (decoration !== 'plain') {
            await this.addHelmetDecorations(image, centerX, helmetY, helmetWidth, helmetHeight, decoration);
        }

        // Add shadow
        await this.addAccessoryShadow(image, centerX - helmetWidth * 0.4, helmetY, helmetWidth, helmetHeight);
    }

    /**
     * Generate helmet base
     */
    async generateHelmetBase(image, centerX, y, width, height, type, material) {
        const baseColor = this.getAccessoryColor(material, 'helmet');

        switch (type) {
            case 'great_helm':
                // Full face covering helmet
                this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.4, height * 0.5, baseColor);
                // Face opening
                this.utils.drawEllipse(image, centerX, y + height * 0.35, width * 0.25, height * 0.3, 0x000000);
                break;

            case 'basinet':
                // Open face helmet
                this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.4, height * 0.5, baseColor);
                // Nasal guard
                this.utils.drawRectangle(image, centerX - 2, y + height * 0.2, 4, height * 0.3, baseColor);
                break;

            case 'kabuto':
                // Japanese style helmet
                this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.4, height * 0.5, baseColor);
                // Curved neck guard
                for (let i = 0; i < 3; i++) {
                    const guardY = y + height * (0.6 + i * 0.1);
                    this.utils.drawEllipse(image, centerX, guardY, width * (0.5 - i * 0.1), height * 0.08, baseColor);
                }
                break;

            default:
                // Generic helmet shape
                this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.4, height * 0.5, baseColor);
        }
    }

    /**
     * Generate jewelry
     */
    async generateJewelry(image, config) {
        const { width, height } = image.bitmap;
        const type = config.jewelryType || 'necklace';
        const material = config.jewelryMaterial || 'gold';
        const gem = config.jewelryGem || 'diamond';

        const jewelryData = this.accessoriesDatabase.jewelry;

        // Calculate jewelry dimensions
        const jewelryWidth = Math.floor(40);
        const jewelryHeight = Math.floor(30);
        const centerX = Math.floor(width * 0.5);
        const jewelryY = Math.floor(height * 0.3);

        // Generate jewelry base
        await this.generateJewelryBase(image, centerX, jewelryY, jewelryWidth, jewelryHeight, type, material);

        // Add gems
        await this.addJewelryGems(image, centerX, jewelryY, jewelryWidth, jewelryHeight, type, gem);

        // Add material details
        await this.addJewelryDetails(image, centerX, jewelryY, jewelryWidth, jewelryHeight, material);

        // Add shadow
        await this.addAccessoryShadow(image, centerX - jewelryWidth * 0.4, jewelryY, jewelryWidth, jewelryHeight);
    }

    /**
     * Generate jewelry base
     */
    async generateJewelryBase(image, centerX, y, width, height, type, material) {
        const baseColor = this.getAccessoryColor(material, 'jewelry');

        switch (type) {
            case 'necklace':
                // Chain necklace
                for (let i = 0; i < 8; i++) {
                    const chainX = centerX - width * 0.4 + (i * width * 0.1);
                    const chainY = y + Math.sin(i * 0.8) * height * 0.2;
                    this.utils.drawEllipse(image, chainX, chainY, 2, 2, baseColor);
                }
                break;

            case 'bracelet':
                // Arm bracelet
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const braceletX = centerX + Math.cos(angle) * width * 0.3;
                    const braceletY = y + Math.sin(angle) * height * 0.3;
                    this.utils.drawEllipse(image, braceletX, braceletY, 3, 3, baseColor);
                }
                break;

            case 'ring':
                // Finger ring
                this.utils.drawEllipse(image, centerX, y, width * 0.2, height * 0.15, baseColor);
                this.utils.drawEllipse(image, centerX, y, width * 0.15, height * 0.1, 0x000000);
                break;

            case 'earrings':
                // Pair of earrings
                this.utils.drawEllipse(image, centerX - width * 0.2, y, width * 0.1, height * 0.2, baseColor);
                this.utils.drawEllipse(image, centerX + width * 0.2, y, width * 0.1, height * 0.2, baseColor);
                break;

            case 'tiara':
                // Head tiara
                for (let i = 0; i < 5; i++) {
                    const tiaraX = centerX - width * 0.3 + (i * width * 0.15);
                    const tiaraY = y;
                    this.utils.drawEllipse(image, tiaraX, tiaraY, width * 0.06, height * 0.1, baseColor);

                    // Add points
                    if (i % 2 === 0) {
                        this.utils.drawEllipse(image, tiaraX, tiaraY - height * 0.1, width * 0.03, height * 0.1, baseColor);
                    }
                }
                break;

            default:
                // Generic jewelry shape
                this.utils.drawEllipse(image, centerX, y, width * 0.2, height * 0.15, baseColor);
        }
    }

    /**
     * Generate cape
     */
    async generateCape(image, config) {
        const { width, height } = image.bitmap;
        const type = config.capeType || 'hooded_cape';
        const material = config.capeMaterial || 'wool';
        const color = config.capeColor || 'blue';

        const capeData = this.accessoriesDatabase.capes;

        // Calculate cape dimensions
        const capeWidth = Math.floor(80);
        const capeHeight = Math.floor(120);
        const centerX = Math.floor(width * 0.5);
        const capeY = Math.floor(height * 0.2);

        // Generate cape base
        await this.generateCapeBase(image, centerX, capeY, capeWidth, capeHeight, type, material, color);

        // Add material-specific details
        await this.addCapeDetails(image, centerX, capeY, capeWidth, capeHeight, material);

        // Add decorative elements
        await this.addCapeDecorations(image, centerX, capeY, capeWidth, capeHeight, type);

        // Add shadow
        await this.addAccessoryShadow(image, centerX - capeWidth * 0.4, capeY, capeWidth, capeHeight);
    }

    /**
     * Generate cape base
     */
    async generateCapeBase(image, centerX, y, width, height, type, material, color) {
        const baseColor = this.getAccessoryColor(color, material);

        switch (type) {
            case 'hooded_cape':
                // Cape with hood
                const capePoints = [
                    { x: centerX - width * 0.3, y: y },
                    { x: centerX - width * 0.4, y: y + height * 0.8 },
                    { x: centerX + width * 0.4, y: y + height * 0.8 },
                    { x: centerX + width * 0.3, y: y }
                ];
                await this.fillIrregularShape(image, capePoints, baseColor);

                // Add hood
                this.utils.drawEllipse(image, centerX, y - height * 0.1, width * 0.2, height * 0.15, baseColor);
                break;

            case 'full_cape':
                // Full flowing cape
                const fullCapePoints = [
                    { x: centerX - width * 0.4, y: y },
                    { x: centerX - width * 0.5, y: y + height },
                    { x: centerX + width * 0.5, y: y + height },
                    { x: centerX + width * 0.4, y: y }
                ];
                await this.fillIrregularShape(image, fullCapePoints, baseColor);
                break;

            case 'cloak':
                // Simple cloak
                const cloakPoints = [
                    { x: centerX - width * 0.25, y: y },
                    { x: centerX - width * 0.35, y: y + height * 0.9 },
                    { x: centerX + width * 0.35, y: y + height * 0.9 },
                    { x: centerX + width * 0.25, y: y }
                ];
                await this.fillIrregularShape(image, cloakPoints, baseColor);
                break;

            default:
                // Generic cape shape
                const genericPoints = [
                    { x: centerX - width * 0.3, y: y },
                    { x: centerX - width * 0.4, y: y + height },
                    { x: centerX + width * 0.4, y: y + height },
                    { x: centerX + width * 0.3, y: y }
                ];
                await this.fillIrregularShape(image, genericPoints, baseColor);
        }
    }

    /**
     * Generate belt
     */
    async generateBelt(image, config) {
        const { width, height } = image.bitmap;
        const type = config.beltType || 'leather_belt';
        const material = config.beltMaterial || 'leather';
        const buckle = config.beltBuckle || 'round';

        const beltData = this.accessoriesDatabase.belts;

        // Calculate belt dimensions
        const beltWidth = Math.floor(60);
        const beltHeight = Math.floor(15);
        const centerX = Math.floor(width * 0.5);
        const beltY = Math.floor(height * 0.4);

        // Generate belt base
        await this.generateBeltBase(image, centerX, beltY, beltWidth, beltHeight, type, material);

        // Add buckle
        await this.addBeltBuckle(image, centerX, beltY, beltWidth, beltHeight, buckle, material);

        // Add material details
        await this.addBeltDetails(image, centerX, beltY, beltWidth, beltHeight, material);

        // Add shadow
        await this.addAccessoryShadow(image, centerX - beltWidth * 0.4, beltY, beltWidth, beltHeight);
    }

    /**
     * Generate belt base
     */
    async generateBeltBase(image, centerX, y, width, height, type, material) {
        const baseColor = this.getAccessoryColor(material, 'belt');

        switch (type) {
            case 'leather_belt':
                // Simple leather belt
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);
                // Add stitching
                for (let i = 0; i < 5; i++) {
                    const stitchX = centerX - width * 0.35 + (i * width * 0.15);
                    this.utils.drawLine(image, stitchX, y + 2, stitchX, y + height - 2, 0x000000);
                }
                break;

            case 'chain_belt':
                // Chain belt
                for (let i = 0; i < 8; i++) {
                    const chainX = centerX - width * 0.4 + (i * width * 0.1);
                    const chainY = y + height * 0.5;
                    this.utils.drawEllipse(image, chainX, chainY, 3, 3, baseColor);
                }
                break;

            case 'cloth_belt':
                // Cloth belt with folds
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);
                // Add folds
                for (let i = 0; i < 3; i++) {
                    const foldX = centerX - width * 0.3 + (i * width * 0.2);
                    this.utils.drawLine(image, foldX, y, foldX, y + height, this.utils.adjustBrightness(baseColor, -20));
                }
                break;

            default:
                // Generic belt
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);
        }
    }

    /**
     * Helper methods
     */
    getAccessoryColor(color, material) {
        const materialProps = this.materialProperties[material];
        const baseColors = this.colorPalettes[color] || this.colorPalettes['gray'];

        if (materialProps) {
            // Adjust color based on material properties
            const adjustedColor = baseColors[Math.floor(Math.random() * baseColors.length)];
            return this.adjustColorForMaterial(adjustedColor, materialProps);
        }

        return baseColors[Math.floor(Math.random() * baseColors.length)];
    }

    adjustColorForMaterial(color, materialProps) {
        // Adjust brightness based on material shine
        const brightness = materialProps.shine;
        return this.utils.adjustBrightness(color, (brightness - 0.5) * 100);
    }

    async addHatDetails(image, centerX, y, width, height, type, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'soft') {
            // Add soft fabric folds
            for (let i = 0; i < 3; i++) {
                const foldX = centerX + Math.floor((Math.random() - 0.5) * width * 0.4);
                const foldY = y + Math.floor(Math.random() * height * 0.6);
                this.utils.drawLine(image, foldX, foldY, foldX + 5, foldY + 3, this.utils.adjustBrightness(this.getAccessoryColor('gray', material), -30));
            }
        } else if (materialProps.texture === 'metallic') {
            // Add metallic shine
            this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.1, height * 0.2, 0xFFFFFF);
        }
    }

    async addHatDecorations(image, centerX, y, width, height, type, material) {
        if (type === 'wizard_hat') {
            // Add wizard hat star
            this.utils.drawEllipse(image, centerX, y - height * 0.1, width * 0.05, height * 0.08, 0xFFD700);
        } else if (type === 'pirate_hat') {
            // Add pirate skull and crossbones
            this.utils.drawEllipse(image, centerX, y + height * 0.2, width * 0.08, height * 0.1, 0xFFFFFF);
            this.utils.drawEllipse(image, centerX - width * 0.05, y + height * 0.18, width * 0.03, height * 0.04, 0x000000);
            this.utils.drawEllipse(image, centerX + width * 0.05, y + height * 0.18, width * 0.03, height * 0.04, 0x000000);
        }
    }

    async addHelmetDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture.includes('metal')) {
            // Add metallic reflections
            for (let i = 0; i < 3; i++) {
                const reflectionX = centerX + Math.floor((Math.random() - 0.5) * width * 0.3);
                const reflectionY = y + Math.floor(Math.random() * height * 0.4);
                this.utils.drawEllipse(image, reflectionX, reflectionY, 2, 3, 0xFFFFFF);
            }
        }
    }

    async addHelmetDecorations(image, centerX, y, width, height, decoration) {
        switch (decoration) {
            case 'plumes':
                // Add feather plumes
                for (let i = 0; i < 3; i++) {
                    const plumeX = centerX - width * 0.2 + (i * width * 0.2);
                    const plumeY = y - height * 0.1;
                    this.utils.drawEllipse(image, plumeX, plumeY, 3, height * 0.2, 0xDC143C);
                }
                break;
            case 'horns':
                // Add horns
                this.utils.drawEllipse(image, centerX - width * 0.3, y - height * 0.1, width * 0.08, height * 0.15, 0x8B4513);
                this.utils.drawEllipse(image, centerX + width * 0.3, y - height * 0.1, width * 0.08, height * 0.15, 0x8B4513);
                break;
            case 'runes':
                // Add magical runes
                for (let i = 0; i < 4; i++) {
                    const runeX = centerX + Math.floor((Math.random() - 0.5) * width * 0.4);
                    const runeY = y + Math.floor(Math.random() * height * 0.5);
                    this.utils.drawEllipse(image, runeX, runeY, 2, 2, 0x9370DB);
                }
                break;
        }
    }

    async addJewelryGems(image, centerX, y, width, height, type, gem) {
        const gemColor = this.gemColors[gem] || this.gemColors['diamond'];

        switch (type) {
            case 'necklace':
                // Add pendant gem
                this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.08, height * 0.12, gemColor[Math.floor(Math.random() * gemColor.length)]);
                break;
            case 'bracelet':
                // Add bracelet gems
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2;
                    const gemX = centerX + Math.cos(angle) * width * 0.25;
                    const gemY = y + Math.sin(angle) * height * 0.25;
                    this.utils.drawEllipse(image, gemX, gemY, 3, 3, gemColor[Math.floor(Math.random() * gemColor.length)]);
                }
                break;
            case 'ring':
                // Add ring gem
                this.utils.drawEllipse(image, centerX, y, width * 0.06, height * 0.08, gemColor[Math.floor(Math.random() * gemColor.length)]);
                break;
            case 'earrings':
                // Add earring gems
                this.utils.drawEllipse(image, centerX - width * 0.2, y, width * 0.04, height * 0.06, gemColor[Math.floor(Math.random() * gemColor.length)]);
                this.utils.drawEllipse(image, centerX + width * 0.2, y, width * 0.04, height * 0.06, gemColor[Math.floor(Math.random() * gemColor.length)]);
                break;
            case 'tiara':
                // Add tiara gems
                for (let i = 0; i < 3; i++) {
                    const gemX = centerX - width * 0.2 + (i * width * 0.2);
                    const gemY = y;
                    this.utils.drawEllipse(image, gemX, gemY, 3, 3, gemColor[Math.floor(Math.random() * gemColor.length)]);
                }
                break;
        }
    }

    async addJewelryDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.shine > 0.8) {
            // Add precious metal shine
            for (let i = 0; i < 5; i++) {
                const shineX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                const shineY = y + Math.floor(Math.random() * height * 0.8);
                this.utils.drawEllipse(image, shineX, shineY, 1, 1, 0xFFFFFF);
            }
        }
    }

    async addCapeDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'fibrous') {
            // Add fabric weave pattern
            for (let i = 0; i < 8; i++) {
                const weaveX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                const weaveY = y + Math.floor(Math.random() * height);
                this.utils.drawLine(image, weaveX, weaveY, weaveX + 3, weaveY, this.utils.adjustBrightness(this.getAccessoryColor('gray', material), -20));
            }
        } else if (materialProps.texture === 'hairy') {
            // Add fur texture
            for (let i = 0; i < 15; i++) {
                const furX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                const furY = y + Math.floor(Math.random() * height);
                this.utils.drawEllipse(image, furX, furY, 1, 2, this.utils.adjustBrightness(this.getAccessoryColor('brown', material), -10));
            }
        }
    }

    async addCapeDecorations(image, centerX, y, width, height, type) {
        if (type === 'tabard') {
            // Add heraldic design
            this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.15, height * 0.2, 0xFFD700);
        } else if (type === 'robe') {
            // Add robe trim
            this.utils.drawRectangle(image, centerX - width * 0.35, y + height * 0.8, width * 0.7, height * 0.05, 0xFFD700);
        }
    }

    async addBeltBuckle(image, centerX, y, width, height, buckle, material) {
        const buckleColor = this.getAccessoryColor('gold', material);

        switch (buckle) {
            case 'round':
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.08, height * 0.12, buckleColor);
                break;
            case 'square':
                this.utils.drawRectangle(image, centerX - width * 0.04, y + height * 0.44, width * 0.08, height * 0.12, buckleColor);
                break;
            case 'shield':
                const shieldPoints = [
                    { x: centerX, y: y + height * 0.4 },
                    { x: centerX - width * 0.05, y: y + height * 0.5 },
                    { x: centerX, y: y + height * 0.6 },
                    { x: centerX + width * 0.05, y: y + height * 0.5 }
                ];
                await this.fillIrregularShape(image, shieldPoints, buckleColor);
                break;
            case 'animal':
                // Simple animal shape (lion head)
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.06, height * 0.1, buckleColor);
                break;
            case 'jewelry':
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.08, height * 0.12, buckleColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.04, height * 0.08, 0x9370DB);
                break;
            default:
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.08, height * 0.12, buckleColor);
        }
    }

    async addBeltDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'rough') {
            // Add leather texture
            for (let i = 0; i < 6; i++) {
                const textureX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                const textureY = y + Math.floor(Math.random() * height);
                this.utils.drawEllipse(image, textureX, textureY, 1, 1, this.utils.adjustBrightness(this.getAccessoryColor('brown', material), -20));
            }
        }
    }

    async addAccessoryShadow(image, x, y, width, height) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const shadowOffset = Math.floor(width * 0.05);

        for (let sy = 0; sy < shadowOffset; sy++) {
            for (let sx = 0; sx < width; sx++) {
                const shadowX = x + sx;
                const shadowY = y + height + sy;

                if (shadowX >= 0 && shadowX < imgWidth && shadowY >= 0 && shadowY < imgHeight) {
                    const idx = (shadowY * imgWidth + shadowX) * 4;
                    const alpha = Math.floor(30 * (1 - sy / shadowOffset));
                    image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
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

module.exports = AccessoriesGenerator;
