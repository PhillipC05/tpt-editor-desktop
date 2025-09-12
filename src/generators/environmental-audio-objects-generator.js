/**
 * Environmental Audio Objects Generator - Wind chimes, bells, fountains, machinery
 * Handles generation of environmental audio objects with various materials and effects
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class EnvironmentalAudioObjectsGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Environmental audio objects database
        this.environmentalAudioObjectsDatabase = {
            wind_chimes: {
                name: 'Wind Chimes',
                types: ['bamboo_chimes', 'metal_chimes', 'crystal_chimes', 'wooden_chimes', 'bone_chimes', 'shell_chimes', 'glass_chimes', 'copper_chimes', 'silver_chimes', 'golden_chimes'],
                materials: ['bamboo', 'metal', 'crystal', 'wood', 'bone', 'shell', 'glass', 'copper', 'silver', 'gold'],
                sizes: ['small', 'medium', 'large', 'extra_large'],
                arrangements: ['circular', 'linear', 'scattered', 'layered', 'spiral']
            },
            bells: {
                name: 'Bells',
                types: ['church_bell', 'hand_bell', 'wind_bell', 'temple_bell', 'ship_bell', 'cowbell', 'jingle_bell', 'gong', 'chime_bell', 'liberty_bell'],
                materials: ['brass', 'bronze', 'copper', 'silver', 'gold', 'iron', 'steel', 'crystal', 'wood', 'bone'],
                sizes: ['tiny', 'small', 'medium', 'large', 'massive'],
                mountings: ['hanging', 'standing', 'handheld', 'wall_mounted', 'ceiling_mounted']
            },
            fountains: {
                name: 'Fountains',
                types: ['stone_fountain', 'marble_fountain', 'bronze_fountain', 'crystal_fountain', 'magical_fountain', 'wall_fountain', 'floor_fountain', 'floating_fountain', 'cascade_fountain', 'geyser_fountain'],
                materials: ['stone', 'marble', 'bronze', 'crystal', 'magical_stone', 'copper', 'brass', 'silver', 'gold', 'obsidian'],
                water_types: ['calm', 'bubbling', 'spraying', 'cascading', 'geyser', 'magical', 'colored', 'sparkling', 'frozen', 'boiling'],
                basins: ['circular', 'square', 'rectangular', 'irregular', 'multi_level', 'ornamental', 'simple', 'elaborate', 'natural', 'geometric']
            },
            machinery: {
                name: 'Machinery',
                types: ['water_wheel', 'windmill', 'grinding_wheel', 'pulley_system', 'clockwork', 'steam_engine', 'gears', 'levers', 'pistons', 'conveyor'],
                materials: ['wood', 'iron', 'steel', 'brass', 'copper', 'stone', 'leather', 'rope', 'chain', 'crystal'],
                mechanisms: ['rotating', 'reciprocating', 'oscillating', 'linear', 'circular', 'complex', 'simple', 'automated', 'manual', 'magical'],
                power_sources: ['water', 'wind', 'steam', 'manual', 'magical', 'clockwork', 'electric', 'geothermal', 'solar', 'kinetic']
            }
        };

        // Material properties
        this.materialProperties = {
            bamboo: { durability: 0.3, resonance: 0.7, density: 0.4, color: 0xDEB887, texture: 'fibrous' },
            metal: { durability: 0.9, resonance: 0.8, density: 0.8, color: 0x708090, texture: 'metallic' },
            crystal: { durability: 0.6, resonance: 0.95, density: 0.6, color: 0xE6E6FA, texture: 'transparent' },
            wood: { durability: 0.5, resonance: 0.6, density: 0.5, color: 0x8B4513, texture: 'grainy' },
            bone: { durability: 0.4, resonance: 0.75, density: 0.7, color: 0xF5F5DC, texture: 'porous' },
            shell: { durability: 0.3, resonance: 0.8, density: 0.6, color: 0xFFFACD, texture: 'iridescent' },
            glass: { durability: 0.2, resonance: 0.9, density: 0.5, color: 0xF0F8FF, texture: 'transparent' },
            copper: { durability: 0.7, resonance: 0.85, density: 0.9, color: 0xCD853F, texture: 'warm_metal' },
            silver: { durability: 0.6, resonance: 0.9, density: 0.95, color: 0xC0C0C0, texture: 'noble' },
            gold: { durability: 0.5, resonance: 0.95, density: 1.0, color: 0xFFD700, texture: 'precious' },
            brass: { durability: 0.8, resonance: 0.8, density: 0.85, color: 0xCD853F, texture: 'brassy' },
            bronze: { durability: 0.85, resonance: 0.75, density: 0.88, color: 0xCD853F, texture: 'antique' },
            iron: { durability: 0.9, resonance: 0.6, density: 0.9, color: 0x708090, texture: 'rough_metal' },
            steel: { durability: 0.95, resonance: 0.7, density: 0.95, color: 0x2F4F4F, texture: 'smooth_metal' },
            stone: { durability: 0.95, resonance: 0.3, density: 0.8, color: 0x696969, texture: 'rough' },
            marble: { durability: 0.9, resonance: 0.4, density: 0.85, color: 0xF5F5F5, texture: 'veined' },
            obsidian: { durability: 0.8, resonance: 0.5, density: 0.9, color: 0x2F2F2F, texture: 'glassy' },
            leather: { durability: 0.6, resonance: 0.4, density: 0.5, color: 0x8B4513, texture: 'flexible' },
            rope: { durability: 0.4, resonance: 0.2, density: 0.3, color: 0x8B4513, texture: 'twisted' },
            chain: { durability: 0.8, resonance: 0.6, density: 0.9, color: 0x696969, texture: 'linked' },
            magical_stone: { durability: 0.7, resonance: 0.9, density: 0.6, color: 0x9370DB, texture: 'glowing' }
        };

        // Audio properties for different materials
        this.audioProperties = {
            bamboo: { pitch: 'high', timbre: 'hollow', decay: 'medium', volume: 0.6 },
            metal: { pitch: 'bright', timbre: 'ringing', decay: 'long', volume: 0.8 },
            crystal: { pitch: 'pure', timbre: 'clear', decay: 'very_long', volume: 0.7 },
            wood: { pitch: 'warm', timbre: 'mellow', decay: 'medium', volume: 0.5 },
            bone: { pitch: 'sharp', timbre: 'dry', decay: 'short', volume: 0.4 },
            shell: { pitch: 'resonant', timbre: 'oceanic', decay: 'medium', volume: 0.6 },
            glass: { pitch: 'crisp', timbre: 'brittle', decay: 'long', volume: 0.5 },
            copper: { pitch: 'mellow', timbre: 'warm', decay: 'long', volume: 0.7 },
            silver: { pitch: 'bright', timbre: 'pure', decay: 'very_long', volume: 0.8 },
            gold: { pitch: 'rich', timbre: 'luxurious', decay: 'very_long', volume: 0.9 }
        };

        // Color palettes
        this.colorPalettes = {
            natural: [0x8B4513, 0xDEB887, 0x696969, 0xF5F5DC, 0xFFFACD],
            metallic: [0x708090, 0xCD853F, 0xC0C0C0, 0xFFD700, 0x2F4F4F],
            magical: [0x9370DB, 0xE6E6FA, 0xDA70D6, 0xFF69B4, 0x00CED1],
            water: [0x4169E1, 0x00BFFF, 0x87CEEB, 0xE0FFFF, 0xF0F8FF],
            earth: [0x8B4513, 0x696969, 0x228B22, 0xDEB887, 0xD2B48C]
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine object type and generate accordingly
        const objectType = config.objectType || 'wind_chimes';
        const subType = config.subType || 'bamboo_chimes';

        switch (objectType) {
            case 'wind_chimes':
                await this.generateWindChimes(image, config);
                break;
            case 'bells':
                await this.generateBell(image, config);
                break;
            case 'fountains':
                await this.generateFountain(image, config);
                break;
            case 'machinery':
                await this.generateMachinery(image, config);
                break;
            default:
                await this.generateWindChimes(image, config);
        }
    }

    /**
     * Generate wind chimes
     */
    async generateWindChimes(image, config) {
        const { width, height } = image.bitmap;
        const type = config.chimeType || 'bamboo_chimes';
        const material = config.chimeMaterial || 'bamboo';
        const size = config.chimeSize || 'medium';
        const arrangement = config.chimeArrangement || 'circular';

        const chimesData = this.environmentalAudioObjectsDatabase.wind_chimes;

        // Calculate chimes dimensions
        const sizeMultiplier = { small: 0.6, medium: 1.0, large: 1.4, extra_large: 1.8 };
        const multiplier = sizeMultiplier[size];

        const chimesWidth = Math.floor(60 * multiplier);
        const chimesHeight = Math.floor(80 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const chimesY = Math.floor(height * 0.2);

        // Generate base structure
        await this.generateChimesBase(image, centerX, chimesY, chimesWidth, chimesHeight, type, material);

        // Generate chimes arrangement
        await this.generateChimesArrangement(image, centerX, chimesY, chimesWidth, chimesHeight, arrangement, material, size);

        // Add material-specific details
        await this.addChimesDetails(image, centerX, chimesY, chimesWidth, chimesHeight, material);

        // Add wind effects
        await this.addWindEffects(image, centerX, chimesY, chimesWidth, chimesHeight);

        // Add shadow
        await this.addObjectShadow(image, centerX - chimesWidth * 0.4, chimesY, chimesWidth, chimesHeight);
    }

    /**
     * Generate chimes base
     */
    async generateChimesBase(image, centerX, y, width, height, type, material) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        // Main hanging structure
        this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height * 0.1, baseColor);

        // Hanging strings/chains
        for (let i = 0; i < 5; i++) {
            const stringX = centerX - width * 0.35 + (i * width * 0.15);
            this.utils.drawLine(image, stringX, y + height * 0.1, stringX, y + height * 0.9, 0x696969, 1);
        }

        // Top mounting
        this.utils.drawEllipse(image, centerX, y - 5, width * 0.1, height * 0.05, baseColor);
    }

    /**
     * Generate chimes arrangement
     */
    async generateChimesArrangement(image, centerX, y, width, height, arrangement, material, size) {
        const materialProps = this.materialProperties[material];
        const chimeColor = materialProps.color;
        const chimeCount = size === 'small' ? 3 : size === 'medium' ? 5 : size === 'large' ? 7 : 9;

        switch (arrangement) {
            case 'circular':
                // Circular arrangement
                for (let i = 0; i < chimeCount; i++) {
                    const angle = (i / chimeCount) * Math.PI * 2;
                    const chimeX = centerX + Math.cos(angle) * width * 0.25;
                    const chimeY = y + height * 0.4 + Math.sin(angle) * height * 0.2;
                    this.utils.drawEllipse(image, chimeX, chimeY, width * 0.03, height * 0.08, chimeColor);
                }
                break;

            case 'linear':
                // Linear arrangement
                for (let i = 0; i < chimeCount; i++) {
                    const chimeX = centerX - width * 0.3 + (i * width * 0.15);
                    const chimeY = y + height * 0.4;
                    this.utils.drawEllipse(image, chimeX, chimeY, width * 0.03, height * 0.08, chimeColor);
                }
                break;

            case 'scattered':
                // Scattered random arrangement
                for (let i = 0; i < chimeCount; i++) {
                    const chimeX = centerX + Math.floor((Math.random() - 0.5) * width * 0.5);
                    const chimeY = y + height * 0.3 + Math.floor(Math.random() * height * 0.4);
                    this.utils.drawEllipse(image, chimeX, chimeY, width * 0.03, height * 0.08, chimeColor);
                }
                break;

            case 'layered':
                // Layered arrangement
                for (let layer = 0; layer < 3; layer++) {
                    const layerChimes = Math.floor(chimeCount / 3);
                    for (let i = 0; i < layerChimes; i++) {
                        const chimeX = centerX - width * 0.25 + (i * width * 0.1);
                        const chimeY = y + height * 0.3 + (layer * height * 0.15);
                        this.utils.drawEllipse(image, chimeX, chimeY, width * 0.025, height * 0.06, chimeColor);
                    }
                }
                break;

            case 'spiral':
                // Spiral arrangement
                for (let i = 0; i < chimeCount; i++) {
                    const angle = (i / chimeCount) * Math.PI * 4;
                    const radius = (i / chimeCount) * width * 0.25;
                    const chimeX = centerX + Math.cos(angle) * radius;
                    const chimeY = y + height * 0.4 + Math.sin(angle) * radius;
                    this.utils.drawEllipse(image, chimeX, chimeY, width * 0.025, height * 0.06, chimeColor);
                }
                break;
        }
    }

    /**
     * Generate bell
     */
    async generateBell(image, config) {
        const { width, height } = image.bitmap;
        const type = config.bellType || 'church_bell';
        const material = config.bellMaterial || 'brass';
        const size = config.bellSize || 'medium';
        const mounting = config.bellMounting || 'hanging';

        const bellsData = this.environmentalAudioObjectsDatabase.bells;

        // Calculate bell dimensions
        const sizeMultiplier = { tiny: 0.4, small: 0.6, medium: 1.0, large: 1.4, massive: 1.8 };
        const multiplier = sizeMultiplier[size];

        const bellWidth = Math.floor(50 * multiplier);
        const bellHeight = Math.floor(60 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const bellY = Math.floor(height * 0.25);

        // Generate bell base
        await this.generateBellBase(image, centerX, bellY, bellWidth, bellHeight, type, material, mounting);

        // Add material-specific details
        await this.addBellDetails(image, centerX, bellY, bellWidth, bellHeight, material);

        // Add mounting system
        await this.addBellMounting(image, centerX, bellY, bellWidth, bellHeight, mounting, material);

        // Add clapper
        await this.addBellClapper(image, centerX, bellY, bellWidth, bellHeight, material);

        // Add shadow
        await this.addObjectShadow(image, centerX - bellWidth * 0.4, bellY, bellWidth, bellHeight);
    }

    /**
     * Generate bell base
     */
    async generateBellBase(image, centerX, y, width, height, type, material, mounting) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'church_bell':
                // Large church bell shape
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.5, baseColor);
                // Bell opening
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.3, height * 0.4, 0x000000);
                // Bell crown
                this.utils.drawEllipse(image, centerX, y, width * 0.2, height * 0.1, baseColor);
                break;

            case 'hand_bell':
                // Small hand bell
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.25, height * 0.35, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.15, height * 0.25, 0x000000);
                // Handle
                this.utils.drawRectangle(image, centerX - width * 0.05, y, width * 0.1, height * 0.2, baseColor);
                break;

            case 'wind_bell':
                // Wind bell with curved shape
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.3, height * 0.4, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.2, height * 0.3, 0x000000);
                // Curved top
                this.utils.drawEllipse(image, centerX, y + height * 0.1, width * 0.25, height * 0.15, baseColor);
                break;

            case 'temple_bell':
                // Temple bell with ornate design
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.35, height * 0.45, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.25, height * 0.35, 0x000000);
                // Decorative elements
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const decoX = centerX + Math.cos(angle) * width * 0.3;
                    const decoY = y + height * 0.4 + Math.sin(angle) * height * 0.35;
                    this.utils.drawEllipse(image, decoX, decoY, 3, 3, 0xFFD700);
                }
                break;

            default:
                // Generic bell shape
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.3, height * 0.4, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.2, height * 0.3, 0x000000);
        }
    }

    /**
     * Generate fountain
     */
    async generateFountain(image, config) {
        const { width, height } = image.bitmap;
        const type = config.fountainType || 'stone_fountain';
        const material = config.fountainMaterial || 'stone';
        const waterType = config.fountainWaterType || 'calm';
        const basin = config.fountainBasin || 'circular';

        const fountainsData = this.environmentalAudioObjectsDatabase.fountains;

        // Calculate fountain dimensions
        const fountainWidth = Math.floor(80);
        const fountainHeight = Math.floor(100);
        const centerX = Math.floor(width * 0.5);
        const fountainY = Math.floor(height * 0.2);

        // Generate basin
        await this.generateFountainBasin(image, centerX, fountainY, fountainWidth, fountainHeight, basin, material);

        // Generate fountain structure
        await this.generateFountainStructure(image, centerX, fountainY, fountainWidth, fountainHeight, type, material);

        // Add water effects
        await this.addWaterEffects(image, centerX, fountainY, fountainWidth, fountainHeight, waterType);

        // Add material details
        await this.addFountainDetails(image, centerX, fountainY, fountainWidth, fountainHeight, material);

        // Add shadow
        await this.addObjectShadow(image, centerX - fountainWidth * 0.4, fountainY, fountainWidth, fountainHeight);
    }

    /**
     * Generate fountain basin
     */
    async generateFountainBasin(image, centerX, y, width, height, basin, material) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (basin) {
            case 'circular':
                // Circular basin
                this.utils.drawEllipse(image, centerX, y + height * 0.8, width * 0.4, height * 0.15, baseColor);
                break;

            case 'square':
                // Square basin
                this.utils.drawRectangle(image, centerX - width * 0.4, y + height * 0.75, width * 0.8, height * 0.2, baseColor);
                break;

            case 'rectangular':
                // Rectangular basin
                this.utils.drawRectangle(image, centerX - width * 0.45, y + height * 0.75, width * 0.9, height * 0.2, baseColor);
                break;

            case 'multi_level':
                // Multi-level basin
                this.utils.drawEllipse(image, centerX, y + height * 0.8, width * 0.4, height * 0.15, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.65, width * 0.25, height * 0.1, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.15, height * 0.08, baseColor);
                break;

            case 'ornamental':
                // Ornamental basin with decorative elements
                this.utils.drawEllipse(image, centerX, y + height * 0.8, width * 0.4, height * 0.15, baseColor);
                // Add decorative carvings
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const decoX = centerX + Math.cos(angle) * width * 0.35;
                    const decoY = y + height * 0.8 + Math.sin(angle) * height * 0.1;
                    this.utils.drawEllipse(image, decoX, decoY, 4, 4, 0xFFD700);
                }
                break;

            default:
                // Simple basin
                this.utils.drawEllipse(image, centerX, y + height * 0.8, width * 0.4, height * 0.15, baseColor);
        }
    }

    /**
     * Generate fountain structure
     */
    async generateFountainStructure(image, centerX, y, width, height, type, material) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'stone_fountain':
                // Simple stone fountain
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.15, height * 0.2, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.2, width * 0.1, height * 0.15, baseColor);
                break;

            case 'marble_fountain':
                // Ornate marble fountain
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.18, height * 0.25, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.2, width * 0.12, height * 0.18, baseColor);
                // Add marble veins
                for (let i = 0; i < 5; i++) {
                    const veinX = centerX + Math.floor((Math.random() - 0.5) * width * 0.3);
                    const veinY = y + Math.floor(Math.random() * height * 0.5);
                    this.utils.drawLine(image, veinX, veinY, veinX + 10, veinY + 5, 0xD3D3D3, 1);
                }
                break;

            case 'bronze_fountain':
                // Bronze fountain with detailed work
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.16, height * 0.22, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.2, width * 0.11, height * 0.16, baseColor);
                // Add bronze patina
                for (let i = 0; i < 8; i++) {
                    const patinaX = centerX + Math.floor((Math.random() - 0.5) * width * 0.25);
                    const patinaY = y + Math.floor(Math.random() * height * 0.4);
                    this.utils.drawEllipse(image, patinaX, patinaY, 2, 2, 0x228B22);
                }
                break;

            case 'magical_fountain':
                // Magical fountain with glowing effects
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.17, height * 0.23, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.2, width * 0.13, height * 0.17, baseColor);
                // Add magical runes
                for (let i = 0; i < 6; i++) {
                    const runeX = centerX + Math.floor((Math.random() - 0.5) * width * 0.25);
                    const runeY = y + Math.floor(Math.random() * height * 0.4);
                    this.utils.drawEllipse(image, runeX, runeY, 3, 3, 0x9370DB);
                }
                break;

            default:
                // Simple fountain
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.15, height * 0.2, baseColor);
        }
    }

    /**
     * Generate machinery
     */
    async generateMachinery(image, config) {
        const { width, height } = image.bitmap;
        const type = config.machineryType || 'water_wheel';
        const material = config.machineryMaterial || 'wood';
        const mechanism = config.machineryMechanism || 'rotating';
        const powerSource = config.machineryPowerSource || 'water';

        const machineryData = this.environmentalAudioObjectsDatabase.machinery;

        // Calculate machinery dimensions
        const machineryWidth = Math.floor(100);
        const machineryHeight = Math.floor(80);
        const centerX = Math.floor(width * 0.5);
        const machineryY = Math.floor(height * 0.25);

        // Generate machinery base
        await this.generateMachineryBase(image, centerX, machineryY, machineryWidth, machineryHeight, type, material);

        // Add mechanism
        await this.addMachineryMechanism(image, centerX, machineryY, machineryWidth, machineryHeight, mechanism, material);

        // Add power source elements
        await this.addPowerSource(image, centerX, machineryY, machineryWidth, machineryHeight, powerSource);

        // Add material details
        await this.addMachineryDetails(image, centerX, machineryY, machineryWidth, machineryHeight, material);

        // Add shadow
        await this.addObjectShadow(image, centerX - machineryWidth * 0.4, machineryY, machineryWidth, machineryHeight);
    }

    /**
     * Generate machinery base
     */
    async generateMachineryBase(image, centerX, y, width, height, type, material) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'water_wheel':
                // Large water wheel
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.6, baseColor);
                // Spokes
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const spokeX = centerX + Math.cos(angle) * width * 0.35;
                    const spokeY = y + height * 0.4 + Math.sin(angle) * height * 0.5;
                    this.utils.drawLine(image, centerX, y + height * 0.4, spokeX, spokeY, baseColor, 2);
                }
                // Buckets/paddles
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const bucketX = centerX + Math.cos(angle) * width * 0.38;
                    const bucketY = y + height * 0.4 + Math.sin(angle) * height * 0.55;
                    this.utils.drawRectangle(image, bucketX - 3, bucketY - 3, 6, 6, baseColor);
                }
                break;

            case 'windmill':
                // Windmill structure
                this.utils.drawRectangle(image, centerX - width * 0.05, y, width * 0.1, height * 0.8, baseColor);
                // Blades
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const bladeX = centerX + Math.cos(angle) * width * 0.3;
                    const bladeY = y + height * 0.2 + Math.sin(angle) * height * 0.3;
                    this.utils.drawRectangle(image, centerX - 2, y + height * 0.2, bladeX - centerX, 4, baseColor);
                }
                break;

            case 'grinding_wheel':
                // Grinding wheel with stone
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.25, height * 0.4, 0x696969);
                // Frame
                this.utils.drawRectangle(image, centerX - width * 0.3, y + height * 0.2, width * 0.6, height * 0.1, baseColor);
                break;

            case 'gears':
                // System of gears
                this.utils.drawEllipse(image, centerX - width * 0.2, y + height * 0.4, width * 0.15, height * 0.2, baseColor);
                this.utils.drawEllipse(image, centerX + width * 0.2, y + height * 0.4, width * 0.15, height * 0.2, baseColor);
                // Teeth
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const toothX = centerX - width * 0.2 + Math.cos(angle) * width * 0.17;
                    const toothY = y + height * 0.4 + Math.sin(angle) * height * 0.22;
                    this.utils.drawEllipse(image, toothX, toothY, 2, 2, baseColor);
                }
                break;

            default:
                // Generic machinery
                this.utils.drawRectangle(image, centerX - width * 0.3, y, width * 0.6, height * 0.6, baseColor);
        }
    }

    /**
     * Helper methods
     */
    async addChimesDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'fibrous') {
            // Add bamboo texture
            for (let i = 0; i < 10; i++) {
                const textureX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                const textureY = y + Math.floor(Math.random() * height);
                this.utils.drawLine(image, textureX, textureY, textureX + 2, textureY, this.utils.adjustBrightness(materialProps.color, -20), 1);
            }
        } else if (materialProps.texture === 'metallic') {
            // Add metallic shine
            for (let i = 0; i < 5; i++) {
                const shineX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                const shineY = y + Math.floor(Math.random() * height * 0.8);
                this.utils.drawEllipse(image, shineX, shineY, 1, 1, 0xFFFFFF);
            }
        }
    }

    async addWindEffects(image, centerX, y, width, height) {
        // Add subtle wind movement indicators
        for (let i = 0; i < 3; i++) {
            const windX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
            const windY = y + Math.floor(Math.random() * height);
            this.utils.drawLine(image, windX, windY, windX + 3, windY - 2, 0xE6E6FA, 1);
        }
    }

    async addBellDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.shine > 0.8) {
            // Add metallic reflections
            for (let i = 0; i < 4; i++) {
                const reflectionX = centerX + Math.floor((Math.random() - 0.5) * width * 0.5);
                const reflectionY = y + Math.floor(Math.random() * height * 0.6);
                this.utils.drawEllipse(image, reflectionX, reflectionY, 2, 3, 0xFFFFFF);
            }
        }
    }

    async addBellMounting(image, centerX, y, width, height, mounting, material) {
        const materialProps = this.materialProperties[material];
        const mountColor = materialProps.color;

        switch (mounting) {
            case 'hanging':
                // Hanging chain/mount
                this.utils.drawRectangle(image, centerX - width * 0.05, y - height * 0.1, width * 0.1, height * 0.1, mountColor);
                this.utils.drawLine(image, centerX, y - height * 0.1, centerX, y - height * 0.2, mountColor, 2);
                break;
            case 'standing':
                // Standing mount
                this.utils.drawRectangle(image, centerX - width * 0.1, y + height * 0.8, width * 0.2, height * 0.15, mountColor);
                break;
            case 'wall_mounted':
                // Wall mount
                this.utils.drawRectangle(image, centerX - width * 0.15, y - height * 0.05, width * 0.3, height * 0.1, mountColor);
                break;
        }
    }

    async addBellClapper(image, centerX, y, width, height, material) {
        const clapperColor = this.materialProperties[material].color;
        const clapperX = centerX;
        const clapperY = y + height * 0.5;

        this.utils.drawEllipse(image, clapperX, clapperY, 3, 4, clapperColor);
        this.utils.drawLine(image, clapperX, clapperY - 2, clapperX, y + height * 0.2, clapperColor, 1);
    }

    async addWaterEffects(image, centerX, y, width, height, waterType) {
        const waterColor = 0x4169E1;

        switch (waterType) {
            case 'calm':
                // Calm water surface
                this.utils.drawEllipse(image, centerX, y + height * 0.8, width * 0.35, height * 0.1, waterColor);
                break;
            case 'bubbling':
                // Bubbling water
                for (let i = 0; i < 8; i++) {
                    const bubbleX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                    const bubbleY = y + height * 0.75 + Math.floor(Math.random() * height * 0.1);
                    this.utils.drawEllipse(image, bubbleX, bubbleY, 2, 2, waterColor);
                }
                break;
            case 'spraying':
                // Spraying water
                for (let i = 0; i < 6; i++) {
                    const sprayX = centerX + Math.floor((Math.random() - 0.5) * width * 0.4);
                    const sprayY = y + height * 0.3 + Math.floor(Math.random() * height * 0.3);
                    this.utils.drawLine(image, sprayX, sprayY, sprayX + 2, sprayY - 5, waterColor, 1);
                }
                break;
            case 'cascading':
                // Cascading water
                for (let i = 0; i < 10; i++) {
                    const cascadeX = centerX + Math.floor((Math.random() - 0.5) * width * 0.5);
                    const cascadeY = y + height * 0.2 + Math.floor(Math.random() * height * 0.5);
                    this.utils.drawLine(image, cascadeX, cascadeY, cascadeX + 1, cascadeY + 3, waterColor, 1);
                }
                break;
            case 'magical':
                // Magical water with glowing effects
                this.utils.drawEllipse(image, centerX, y + height * 0.8, width * 0.35, height * 0.1, 0x9370DB);
                for (let i = 0; i < 5; i++) {
                    const magicX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                    const magicY = y + height * 0.75 + Math.floor(Math.random() * height * 0.1);
                    this.utils.drawEllipse(image, magicX, magicY, 2, 2, 0xFFD700);
                }
                break;
        }
    }

    async addFountainDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'veined') {
            // Add marble veins
            for (let i = 0; i < 6; i++) {
                const veinX = centerX + Math.floor((Math.random() - 0.5) * width * 0.7);
                const veinY = y + Math.floor(Math.random() * height * 0.7);
                this.utils.drawLine(image, veinX, veinY, veinX + 8, veinY + 3, 0xD3D3D3, 1);
            }
        } else if (materialProps.texture === 'rough') {
            // Add stone texture
            for (let i = 0; i < 12; i++) {
                const textureX = centerX + Math.floor((Math.random() - 0.5) * width * 0.7);
                const textureY = y + Math.floor(Math.random() * height * 0.7);
                this.utils.drawEllipse(image, textureX, textureY, 1, 1, this.utils.adjustBrightness(materialProps.color, -15));
            }
        }
    }

    async addMachineryMechanism(image, centerX, y, width, height, mechanism, material) {
        const materialProps = this.materialProperties[material];
        const mechColor = materialProps.color;

        switch (mechanism) {
            case 'rotating':
                // Add rotation indicators
                this.utils.drawEllipse(image, centerX, y + height * 0.4, 3, 3, 0xFF0000);
                this.utils.drawLine(image, centerX, y + height * 0.4, centerX + width * 0.2, y + height * 0.4, 0xFF0000, 1);
                break;
            case 'reciprocating':
                // Add back-and-forth motion indicators
                this.utils.drawRectangle(image, centerX - width * 0.15, y + height * 0.35, width * 0.3, 4, mechColor);
                this.utils.drawLine(image, centerX - width * 0.15, y + height * 0.37, centerX - width * 0.15, y + height * 0.2, mechColor, 2);
                break;
            case 'oscillating':
                // Add oscillating motion indicators
                this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.1, height * 0.15, mechColor);
                this.utils.drawLine(image, centerX, y + height * 0.3, centerX, y + height * 0.1, mechColor, 1);
                break;
        }
    }

    async addPowerSource(image, centerX, y, width, height, powerSource) {
        switch (powerSource) {
            case 'water':
                // Add water flow indicators
                for (let i = 0; i < 4; i++) {
                    const waterX = centerX - width * 0.4 + (i * width * 0.2);
                    const waterY = y + height * 0.8;
                    this.utils.drawLine(image, waterX, waterY, waterX + 2, waterY - 4, 0x4169E1, 1);
                }
                break;
            case 'wind':
                // Add wind indicators
                for (let i = 0; i < 3; i++) {
                    const windX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const windY = y + Math.floor(Math.random() * height);
                    this.utils.drawLine(image, windX, windY, windX + 3, windY - 2, 0xE6E6FA, 1);
                }
                break;
            case 'steam':
                // Add steam indicators
                for (let i = 0; i < 5; i++) {
                    const steamX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                    const steamY = y + Math.floor(Math.random() * height * 0.6);
                    this.utils.drawEllipse(image, steamX, steamY, 2, 3, 0xF5F5F5);
                }
                break;
            case 'magical':
                // Add magical energy indicators
                for (let i = 0; i < 4; i++) {
                    const magicX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                    const magicY = y + Math.floor(Math.random() * height * 0.6);
                    this.utils.drawEllipse(image, magicX, magicY, 3, 3, 0x9370DB);
                }
                break;
        }
    }

    async addMachineryDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'grainy') {
            // Add wood grain
            for (let i = 0; i < 8; i++) {
                const grainX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                const grainY = y + Math.floor(Math.random() * height);
                this.utils.drawLine(image, grainX, grainY, grainX + 4, grainY, this.utils.adjustBrightness(materialProps.color, -20), 1);
            }
        } else if (materialProps.texture === 'metallic') {
            // Add metallic details
            for (let i = 0; i < 6; i++) {
                const detailX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                const detailY = y + Math.floor(Math.random() * height);
                this.utils.drawEllipse(image, detailX, detailY, 2, 2, 0xFFFFFF);
            }
        }
    }

    async addObjectShadow(image, x, y, width, height) {
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
}

module.exports = EnvironmentalAudioObjectsGenerator;
