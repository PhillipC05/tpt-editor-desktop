/**
 * Interactive Elements Generator - Doors, gates, levers, switches, portals
 * Handles generation of interactive game elements with various states and animations
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class InteractiveElementsGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Interactive elements database
        this.interactiveElementsDatabase = {
            doors: {
                name: 'Doors',
                types: ['wooden_door', 'iron_door', 'stone_door', 'magical_door', 'secret_door', 'double_door', 'trap_door', 'portcullis', 'barn_door', 'cellar_door'],
                materials: ['wood', 'iron', 'stone', 'magical_wood', 'reinforced_wood', 'brass', 'silver', 'gold', 'bone', 'crystal'],
                states: ['closed', 'opening', 'open', 'closing', 'locked', 'broken']
            },
            gates: {
                name: 'Gates',
                types: ['iron_gate', 'wooden_gate', 'castle_gate', 'garden_gate', 'portcullis_gate', 'fence_gate', 'magic_gate', 'prison_gate', 'toll_gate', 'barn_gate'],
                materials: ['iron', 'wood', 'steel', 'brass', 'silver', 'gold', 'mithril', 'adamant', 'bone'],
                states: ['closed', 'opening', 'open', 'closing', 'locked', 'rusty', 'broken']
            },
            levers: {
                name: 'Levers',
                types: ['simple_lever', 'fancy_lever', 'mechanical_lever', 'magic_lever', 'ancient_lever', 'rusty_lever', 'golden_lever', 'wooden_lever', 'stone_lever', 'crystal_lever'],
                materials: ['wood', 'iron', 'steel', 'gold', 'silver', 'crystal', 'bone', 'mithril', 'brass'],
                states: ['off', 'on', 'broken', 'stuck', 'magical_glow']
            },
            switches: {
                name: 'Switches',
                types: ['toggle_switch', 'push_button', 'lever_switch', 'rotary_switch', 'pressure_plate', 'pull_chain', 'magic_crystal', 'rune_switch', 'key_switch', 'timer_switch'],
                materials: ['metal', 'wood', 'stone', 'crystal', 'gold', 'silver', 'bone', 'mithril', 'brass'],
                states: ['off', 'on', 'pressed', 'broken', 'glowing']
            },
            portals: {
                name: 'Portals',
                types: ['magic_portal', 'stone_portal', 'wooden_portal', 'crystal_portal', 'rune_portal', 'dimensional_portal', 'time_portal', 'teleport_circle', 'gate_portal', 'mirror_portal'],
                materials: ['stone', 'wood', 'crystal', 'rune_stone', 'magical_energy', 'metal', 'bone', 'mithril'],
                states: ['inactive', 'activating', 'active', 'deactivating', 'unstable', 'broken']
            }
        };

        // Material properties
        this.materialProperties = {
            wood: { durability: 0.4, texture: 'grainy', color: 0x8B4513, shine: 0.2 },
            iron: { durability: 0.8, texture: 'metallic', color: 0x708090, shine: 0.6 },
            stone: { durability: 0.9, texture: 'rough', color: 0x696969, shine: 0.1 },
            steel: { durability: 0.95, texture: 'smooth_metal', color: 0x2F4F4F, shine: 0.7 },
            brass: { durability: 0.7, texture: 'warm_metal', color: 0xCD853F, shine: 0.8 },
            silver: { durability: 0.6, texture: 'noble', color: 0xC0C0C0, shine: 0.9 },
            gold: { durability: 0.5, texture: 'precious', color: 0xFFD700, shine: 1.0 },
            crystal: { durability: 0.3, texture: 'transparent', color: 0xE6E6FA, shine: 0.95 },
            bone: { durability: 0.2, texture: 'porous', color: 0xF5F5DC, shine: 0.3 },
            mithril: { durability: 0.98, texture: 'light_metal', color: 0xE6E6FA, shine: 0.85 },
            adamant: { durability: 1.0, texture: 'hard_metal', color: 0x2F4F4F, shine: 0.9 },
            magical_wood: { durability: 0.6, texture: 'ethereal', color: 0x9370DB, shine: 0.5 },
            reinforced_wood: { durability: 0.7, texture: 'reinforced', color: 0x8B4513, shine: 0.3 },
            rune_stone: { durability: 0.8, texture: 'engraved', color: 0x696969, shine: 0.4 },
            magical_energy: { durability: 0.1, texture: 'energy', color: 0x9370DB, shine: 0.8 }
        };

        // Animation frames for different states
        this.animationFrames = {
            doors: {
                closed: 1,
                opening: 4,
                open: 1,
                closing: 4,
                locked: 1,
                broken: 1
            },
            gates: {
                closed: 1,
                opening: 6,
                open: 1,
                closing: 6,
                locked: 1,
                rusty: 1,
                broken: 1
            },
            levers: {
                off: 1,
                on: 1,
                broken: 1,
                stuck: 1,
                magical_glow: 3
            },
            switches: {
                off: 1,
                on: 1,
                pressed: 1,
                broken: 1,
                glowing: 2
            },
            portals: {
                inactive: 1,
                activating: 5,
                active: 4,
                deactivating: 3,
                unstable: 3,
                broken: 1
            }
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine element type and generate accordingly
        const elementType = config.elementType || 'doors';
        const subType = config.subType || 'wooden_door';
        const state = config.state || 'closed';

        switch (elementType) {
            case 'doors':
                await this.generateDoor(image, config);
                break;
            case 'gates':
                await this.generateGate(image, config);
                break;
            case 'levers':
                await this.generateLever(image, config);
                break;
            case 'switches':
                await this.generateSwitch(image, config);
                break;
            case 'portals':
                await this.generatePortal(image, config);
                break;
            default:
                await this.generateDoor(image, config);
        }
    }

    /**
     * Generate door
     */
    async generateDoor(image, config) {
        const { width, height } = image.bitmap;
        const type = config.doorType || 'wooden_door';
        const material = config.doorMaterial || 'wood';
        const state = config.doorState || 'closed';
        const size = config.doorSize || 'medium';

        const doorData = this.interactiveElementsDatabase.doors;

        // Calculate door dimensions
        const sizeMultiplier = { small: 0.6, medium: 1.0, large: 1.4, extra_large: 1.8 };
        const multiplier = sizeMultiplier[size];

        const doorWidth = Math.floor(40 * multiplier);
        const doorHeight = Math.floor(80 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const doorY = Math.floor(height * 0.3);

        // Generate door base
        await this.generateDoorBase(image, centerX, doorY, doorWidth, doorHeight, type, material, state);

        // Add material-specific details
        await this.addDoorDetails(image, centerX, doorY, doorWidth, doorHeight, type, material, state);

        // Add state-specific effects
        await this.addDoorStateEffects(image, centerX, doorY, doorWidth, doorHeight, state);

        // Add shadow
        await this.addElementShadow(image, centerX - doorWidth * 0.4, doorY, doorWidth, doorHeight);
    }

    /**
     * Generate door base
     */
    async generateDoorBase(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'wooden_door':
                // Wooden door with planks
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);

                // Add wooden planks
                for (let i = 0; i < 4; i++) {
                    const plankY = y + (i * height * 0.2);
                    this.utils.drawRectangle(image, centerX - width * 0.35, plankY, width * 0.7, height * 0.15,
                        this.utils.adjustBrightness(baseColor, -10));
                }
                break;

            case 'iron_door':
                // Iron door with rivets
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);

                // Add iron panels
                for (let i = 0; i < 3; i++) {
                    const panelY = y + (i * height * 0.25);
                    this.utils.drawRectangle(image, centerX - width * 0.35, panelY, width * 0.7, height * 0.2,
                        this.utils.adjustBrightness(baseColor, i * 5));
                }
                break;

            case 'stone_door':
                // Stone door
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);

                // Add stone blocks
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 3; j++) {
                        const blockX = centerX - width * 0.35 + (j * width * 0.35);
                        const blockY = y + (i * height * 0.15);
                        this.utils.drawRectangle(image, blockX, blockY, width * 0.3, height * 0.12,
                            this.utils.adjustBrightness(baseColor, (i + j) * 3));
                    }
                }
                break;

            case 'magical_door':
                // Magical door with runes
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);

                // Add magical runes
                for (let i = 0; i < 8; i++) {
                    const runeX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                    const runeY = y + Math.floor(Math.random() * height * 0.8);
                    this.utils.drawEllipse(image, runeX, runeY, 3, 3, 0x9370DB);
                }
                break;

            case 'double_door':
                // Double door
                this.utils.drawRectangle(image, centerX - width * 0.45, y, width * 0.4, height, baseColor);
                this.utils.drawRectangle(image, centerX + width * 0.05, y, width * 0.4, height, baseColor);
                break;

            default:
                // Generic door
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);
        }

        // Add door handle
        if (state !== 'broken') {
            const handleX = centerX + width * 0.25;
            const handleY = y + height * 0.5;
            this.utils.drawEllipse(image, handleX, handleY, 4, 4, 0xFFD700);
        }
    }

    /**
     * Generate gate
     */
    async generateGate(image, config) {
        const { width, height } = image.bitmap;
        const type = config.gateType || 'iron_gate';
        const material = config.gateMaterial || 'iron';
        const state = config.gateState || 'closed';

        const gateData = this.interactiveElementsDatabase.gates;

        // Calculate gate dimensions
        const gateWidth = Math.floor(80);
        const gateHeight = Math.floor(100);
        const centerX = Math.floor(width * 0.5);
        const gateY = Math.floor(height * 0.25);

        // Generate gate base
        await this.generateGateBase(image, centerX, gateY, gateWidth, gateHeight, type, material, state);

        // Add material-specific details
        await this.addGateDetails(image, centerX, gateY, gateWidth, gateHeight, type, material, state);

        // Add state-specific effects
        await this.addGateStateEffects(image, centerX, gateY, gateWidth, gateHeight, state);

        // Add shadow
        await this.addElementShadow(image, centerX - gateWidth * 0.4, gateY, gateWidth, gateHeight);
    }

    /**
     * Generate gate base
     */
    async generateGateBase(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'iron_gate':
                // Iron gate with bars
                // Vertical bars
                for (let i = 0; i < 5; i++) {
                    const barX = centerX - width * 0.35 + (i * width * 0.15);
                    this.utils.drawRectangle(image, barX, y, 3, height, baseColor);
                }

                // Horizontal bars
                for (let i = 0; i < 4; i++) {
                    const barY = y + (i * height * 0.2);
                    this.utils.drawRectangle(image, centerX - width * 0.35, barY, width * 0.7, 3, baseColor);
                }
                break;

            case 'castle_gate':
                // Large castle gate
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);

                // Add reinforcement bars
                for (let i = 0; i < 3; i++) {
                    const barY = y + (i * height * 0.25);
                    this.utils.drawRectangle(image, centerX - width * 0.35, barY, width * 0.7, 5, baseColor);
                }

                // Add spikes on top
                for (let i = 0; i < 7; i++) {
                    const spikeX = centerX - width * 0.35 + (i * width * 0.1);
                    const spikeY = y - 5;
                    this.utils.drawTriangle(image, spikeX, spikeY, spikeX + 3, spikeY, spikeX + 1.5, spikeY - 8, baseColor);
                }
                break;

            case 'portcullis_gate':
                // Portcullis with teeth
                // Vertical bars
                for (let i = 0; i < 8; i++) {
                    const barX = centerX - width * 0.4 + (i * width * 0.1);
                    this.utils.drawRectangle(image, barX, y, 2, height, baseColor);
                }

                // Add pointed teeth at bottom
                for (let i = 0; i < 8; i++) {
                    const toothX = centerX - width * 0.4 + (i * width * 0.1);
                    const toothY = y + height;
                    this.utils.drawTriangle(image, toothX, toothY, toothX + 2, toothY, toothX + 1, toothY + 10, baseColor);
                }
                break;

            default:
                // Generic gate
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);
        }
    }

    /**
     * Generate lever
     */
    async generateLever(image, config) {
        const { width, height } = image.bitmap;
        const type = config.leverType || 'simple_lever';
        const material = config.leverMaterial || 'wood';
        const state = config.leverState || 'off';

        const leverData = this.interactiveElementsDatabase.levers;

        // Calculate lever dimensions
        const leverWidth = Math.floor(30);
        const leverHeight = Math.floor(40);
        const centerX = Math.floor(width * 0.5);
        const leverY = Math.floor(height * 0.4);

        // Generate lever base
        await this.generateLeverBase(image, centerX, leverY, leverWidth, leverHeight, type, material, state);

        // Add material-specific details
        await this.addLeverDetails(image, centerX, leverY, leverWidth, leverHeight, type, material, state);

        // Add state-specific effects
        await this.addLeverStateEffects(image, centerX, leverY, leverWidth, leverHeight, state);

        // Add shadow
        await this.addElementShadow(image, centerX - leverWidth * 0.4, leverY, leverWidth, leverHeight);
    }

    /**
     * Generate lever base
     */
    async generateLeverBase(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        // Lever base/pivot
        this.utils.drawRectangle(image, centerX - width * 0.1, y + height * 0.8, width * 0.2, height * 0.2, 0x8B4513);

        // Lever arm
        const leverAngle = state === 'on' ? Math.PI * 0.3 : -Math.PI * 0.3;
        const armLength = height * 0.7;
        const armEndX = centerX + Math.cos(leverAngle) * armLength;
        const armEndY = y + height * 0.9 + Math.sin(leverAngle) * armLength;

        this.utils.drawLine(image, centerX, y + height * 0.9, armEndX, armEndY, baseColor, 3);

        // Lever handle
        this.utils.drawEllipse(image, armEndX, armEndY, 6, 6, baseColor);
    }

    /**
     * Generate switch
     */
    async generateSwitch(image, config) {
        const { width, height } = image.bitmap;
        const type = config.switchType || 'toggle_switch';
        const material = config.switchMaterial || 'metal';
        const state = config.switchState || 'off';

        const switchData = this.interactiveElementsDatabase.switches;

        // Calculate switch dimensions
        const switchWidth = Math.floor(25);
        const switchHeight = Math.floor(30);
        const centerX = Math.floor(width * 0.5);
        const switchY = Math.floor(height * 0.4);

        // Generate switch base
        await this.generateSwitchBase(image, centerX, switchY, switchWidth, switchHeight, type, material, state);

        // Add material-specific details
        await this.addSwitchDetails(image, centerX, switchY, switchWidth, switchHeight, type, material, state);

        // Add state-specific effects
        await this.addSwitchStateEffects(image, centerX, switchY, switchWidth, switchHeight, state);

        // Add shadow
        await this.addElementShadow(image, centerX - switchWidth * 0.4, switchY, switchWidth, switchHeight);
    }

    /**
     * Generate switch base
     */
    async generateSwitchBase(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'toggle_switch':
                // Toggle switch base
                this.utils.drawRectangle(image, centerX - width * 0.3, y, width * 0.6, height * 0.8, baseColor);

                // Toggle lever
                const toggleY = state === 'on' ? y + height * 0.2 : y + height * 0.5;
                this.utils.drawRectangle(image, centerX - width * 0.1, toggleY, width * 0.2, height * 0.2, 0xFFD700);
                break;

            case 'push_button':
                // Push button
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.3, height * 0.3, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.2, height * 0.2, 0xFF0000);
                break;

            case 'pressure_plate':
                // Pressure plate
                this.utils.drawRectangle(image, centerX - width * 0.4, y + height * 0.6, width * 0.8, height * 0.2, baseColor);

                // Add pressure indicators
                for (let i = 0; i < 3; i++) {
                    const indicatorX = centerX - width * 0.3 + (i * width * 0.3);
                    this.utils.drawEllipse(image, indicatorX, y + height * 0.7, 2, 2, 0xFFD700);
                }
                break;

            case 'pull_chain':
                // Pull chain
                // Chain housing
                this.utils.drawRectangle(image, centerX - width * 0.2, y, width * 0.4, height * 0.3, baseColor);

                // Chain
                for (let i = 0; i < 4; i++) {
                    const chainY = y + height * 0.3 + (i * height * 0.15);
                    this.utils.drawEllipse(image, centerX, chainY, 2, 2, 0xC0C0C0);
                }

                // Pull handle
                this.utils.drawEllipse(image, centerX, y + height * 0.7, 4, 4, 0xC0C0C0);
                break;

            default:
                // Generic switch
                this.utils.drawRectangle(image, centerX - width * 0.3, y, width * 0.6, height * 0.4, baseColor);
        }
    }

    /**
     * Generate portal
     */
    async generatePortal(image, config) {
        const { width, height } = image.bitmap;
        const type = config.portalType || 'magic_portal';
        const material = config.portalMaterial || 'stone';
        const state = config.portalState || 'inactive';

        const portalData = this.interactiveElementsDatabase.portals;

        // Calculate portal dimensions
        const portalWidth = Math.floor(60);
        const portalHeight = Math.floor(80);
        const centerX = Math.floor(width * 0.5);
        const portalY = Math.floor(height * 0.3);

        // Generate portal base
        await this.generatePortalBase(image, centerX, portalY, portalWidth, portalHeight, type, material, state);

        // Add material-specific details
        await this.addPortalDetails(image, centerX, portalY, portalWidth, portalHeight, type, material, state);

        // Add state-specific effects
        await this.addPortalStateEffects(image, centerX, portalY, portalWidth, portalHeight, state);

        // Add shadow
        await this.addElementShadow(image, centerX - portalWidth * 0.4, portalY, portalWidth, portalHeight);
    }

    /**
     * Generate portal base
     */
    async generatePortalBase(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'magic_portal':
                // Magical portal frame
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.5, baseColor);

                // Portal opening
                if (state === 'active') {
                    this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.3, height * 0.4, 0x9370DB);
                }
                break;

            case 'stone_portal':
                // Stone portal arch
                // Arch stones
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI;
                    const stoneX = centerX + Math.cos(angle) * width * 0.35;
                    const stoneY = y + height * 0.2 + Math.sin(angle) * height * 0.3;
                    this.utils.drawEllipse(image, stoneX, stoneY, 8, 8, baseColor);
                }

                // Portal opening
                if (state === 'active') {
                    this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.25, height * 0.35, 0x000000);
                }
                break;

            case 'crystal_portal':
                // Crystal portal
                // Crystal frame
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const crystalX = centerX + Math.cos(angle) * width * 0.35;
                    const crystalY = y + height * 0.4 + Math.sin(angle) * height * 0.35;
                    this.utils.drawEllipse(image, crystalX, crystalY, 6, 6, baseColor);
                }

                // Portal opening
                if (state === 'active') {
                    this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.25, height * 0.3, 0xE6E6FA);
                }
                break;

            case 'rune_portal':
                // Rune portal
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.5, baseColor);

                // Add runes around the edge
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const runeX = centerX + Math.cos(angle) * width * 0.35;
                    const runeY = y + height * 0.4 + Math.sin(angle) * height * 0.4;
                    this.utils.drawEllipse(image, runeX, runeY, 3, 3, 0xFFD700);
                }

                // Portal opening
                if (state === 'active') {
                    this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.3, height * 0.4, 0x9370DB);
                }
                break;

            default:
                // Generic portal
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.5, baseColor);
        }
    }

    /**
     * Helper methods
     */
    async addDoorDetails(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'grainy') {
            // Add wood grain
            for (let i = 0; i < 6; i++) {
                const grainY = y + (i * height * 0.15);
                this.utils.drawLine(image, centerX - width * 0.35, grainY, centerX + width * 0.35, grainY,
                    this.utils.adjustBrightness(materialProps.color, -15), 1);
            }
        } else if (materialProps.texture === 'metallic') {
            // Add metallic shine
            for (let i = 0; i < 3; i++) {
                const shineX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                const shineY = y + Math.floor(Math.random() * height * 0.8);
                this.utils.drawEllipse(image, shineX, shineY, 2, 2, 0xFFFFFF);
            }
        }
    }

    async addDoorStateEffects(image, centerX, y, width, height, state) {
        switch (state) {
            case 'locked':
                // Add lock
                this.utils.drawRectangle(image, centerX + width * 0.2, y + height * 0.4, 8, 12, 0xFFD700);
                this.utils.drawEllipse(image, centerX + width * 0.24, y + height * 0.46, 2, 2, 0x000000);
                break;
            case 'broken':
                // Add damage
                for (let i = 0; i < 5; i++) {
                    const damageX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const damageY = y + Math.floor(Math.random() * height);
                    this.utils.drawEllipse(image, damageX, damageY, 3, 3, 0x8B4513);
                }
                break;
        }
    }

    async addGateDetails(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'metallic') {
            // Add rivets
            for (let i = 0; i < 8; i++) {
                const rivetX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                const rivetY = y + Math.floor(Math.random() * height);
                this.utils.drawEllipse(image, rivetX, rivetY, 2, 2, 0x696969);
            }
        }
    }

    async addGateStateEffects(image, centerX, y, width, height, state) {
        switch (state) {
            case 'locked':
                // Add large lock
                this.utils.drawRectangle(image, centerX - 6, y + height * 0.4, 12, 20, 0xFFD700);
                this.utils.drawEllipse(image, centerX, y + height * 0.5, 3, 3, 0x000000);
                break;
            case 'rusty':
                // Add rust spots
                for (let i = 0; i < 10; i++) {
                    const rustX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const rustY = y + Math.floor(Math.random() * height);
                    this.utils.drawEllipse(image, rustX, rustY, 2, 2, 0x8B4513);
                }
                break;
            case 'broken':
                // Add damage
                for (let i = 0; i < 8; i++) {
                    const damageX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const damageY = y + Math.floor(Math.random() * height);
                    this.utils.drawEllipse(image, damageX, damageY, 4, 4, 0x696969);
                }
                break;
        }
    }

    async addLeverDetails(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'grainy') {
            // Add wood grain to handle
            this.utils.drawLine(image, centerX - 5, y + height * 0.9, centerX + 5, y + height * 0.9,
                this.utils.adjustBrightness(materialProps.color, -20), 1);
        }
    }

    async addLeverStateEffects(image, centerX, y, width, height, state) {
        if (state === 'magical_glow') {
            // Add magical glow
            for (let i = 0; i < 5; i++) {
                const glowX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                const glowY = y + Math.floor(Math.random() * height);
                this.utils.drawEllipse(image, glowX, glowY, 2, 2, 0x9370DB);
            }
        } else if (state === 'broken') {
            // Add broken effect
            this.utils.drawLine(image, centerX - 3, y + height * 0.9, centerX + 3, y + height * 0.9, 0x8B4513, 2);
        }
    }

    async addSwitchDetails(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];

        if (materialProps.shine > 0.7) {
            // Add metallic shine
            this.utils.drawEllipse(image, centerX, y + height * 0.3, 2, 2, 0xFFFFFF);
        }
    }

    async addSwitchStateEffects(image, centerX, y, width, height, state) {
        if (state === 'glowing') {
            // Add glow effect
            for (let i = 0; i < 3; i++) {
                const glowX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                const glowY = y + Math.floor(Math.random() * height * 0.6);
                this.utils.drawEllipse(image, glowX, glowY, 2, 2, 0xFFD700);
            }
        } else if (state === 'pressed') {
            // Add pressed effect
            this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.25, height * 0.25, 0xFF0000);
        }
    }

    async addPortalDetails(image, centerX, y, width, height, type, material, state) {
        const materialProps = this.materialProperties[material];

        if (type === 'rune_portal') {
            // Add more detailed runes
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const runeX = centerX + Math.cos(angle) * width * 0.35;
                const runeY = y + height * 0.4 + Math.sin(angle) * height * 0.4;
                this.utils.drawEllipse(image, runeX, runeY, 2, 2, 0xFFD700);
            }
        }
    }

    async addPortalStateEffects(image, centerX, y, width, height, state) {
        switch (state) {
            case 'active':
                // Add swirling energy
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const energyX = centerX + Math.cos(angle) * width * 0.2;
                    const energyY = y + height * 0.4 + Math.sin(angle) * height * 0.3;
                    this.utils.drawEllipse(image, energyX, energyY, 2, 2, 0x9370DB);
                }
                break;
            case 'unstable':
                // Add unstable energy bursts
                for (let i = 0; i < 8; i++) {
                    const burstX = centerX + Math.floor((Math.random() - 0.5) * width * 0.4);
                    const burstY = y + height * 0.4 + Math.floor((Math.random() - 0.5) * height * 0.4);
                    this.utils.drawEllipse(image, burstX, burstY, 3, 3, 0xFF0000);
                }
                break;
            case 'broken':
                // Add broken/cracked effect
                for (let i = 0; i < 6; i++) {
                    const crackX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                    const crackY = y + Math.floor(Math.random() * height);
                    this.utils.drawLine(image, crackX, crackY, crackX + 5, crackY + 5, 0x000000, 1);
                }
                break;
        }
    }

    async addElementShadow(image, x, y, width, height) {
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

module.exports = InteractiveElementsGenerator;
