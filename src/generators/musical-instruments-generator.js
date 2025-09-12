/**
 * Musical Instruments Generator - Guitars, pianos, drums, flutes
 * Handles generation of musical instruments with various styles and materials
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class MusicalInstrumentsGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Musical instruments database
        this.musicalInstrumentsDatabase = {
            guitars: {
                name: 'Guitars',
                types: ['acoustic_guitar', 'electric_guitar', 'bass_guitar', 'classical_guitar', 'ukulele', 'mandolin', 'banjo', 'lute', 'harp_guitar', 'dobro'],
                materials: ['wood', 'metal', 'carbon_fiber', 'plastic', 'ebony', 'maple', 'mahogany', 'spruce', 'cedar', 'rosewood'],
                styles: ['standard', 'flying_v', 'stratocaster', 'les_paul', 'telecaster', 'jazzmaster', 'jaguar', 'explorer', 'firebird', 'sg'],
                finishes: ['natural', 'sunburst', 'black', 'white', 'red', 'blue', 'green', 'metallic', 'transparent', 'pearl']
            },
            pianos: {
                name: 'Pianos',
                types: ['grand_piano', 'upright_piano', 'baby_grand', 'console_piano', 'spinet_piano', 'digital_piano', 'electric_piano', 'harpsichord', 'clavichord', 'celesta'],
                materials: ['wood', 'metal', 'plastic', 'ivory', 'ebony', 'brass', 'steel', 'felt', 'leather', 'synthetic'],
                styles: ['concert_grand', 'parlor_grand', 'boudoir_grand', 'mini_grand', 'professional_upright', 'studio_upright', 'modern', 'antique', 'art_deco', 'contemporary'],
                finishes: ['polished_wood', 'ebony', 'walnut', 'mahogany', 'white', 'black', 'metallic', 'pearl', 'matte', 'glossy']
            },
            drums: {
                name: 'Drums',
                types: ['drum_kit', 'snare_drum', 'bass_drum', 'toms', 'cymbals', 'conga', 'bongo', 'djembe', 'taiko', 'steel_drum'],
                materials: ['wood', 'metal', 'plastic', 'skin', 'synthetic', 'brass', 'steel', 'copper', 'aluminum', 'fiberglass'],
                styles: ['rock', 'jazz', 'fusion', 'latin', 'electronic', 'orchestral', 'military', 'folk', 'world', 'experimental'],
                finishes: ['chrome', 'brass', 'black', 'white', 'wood_natural', 'wood_stained', 'metallic', 'matte', 'glossy', 'textured']
            },
            flutes: {
                name: 'Flutes',
                types: ['concert_flute', 'piccolo', 'alto_flute', 'bass_flute', 'pan_flute', 'bamboo_flute', 'native_flute', 'ocarina', 'whistle', 'recorder'],
                materials: ['metal', 'wood', 'bamboo', 'plastic', 'bone', 'ivory', 'crystal', 'glass', 'ceramic', 'stone'],
                styles: ['bohemian', 'french', 'german', 'english', 'american', 'asian', 'native_american', 'african', 'modern', 'antique'],
                finishes: ['silver', 'gold', 'nickel', 'brass', 'wood_natural', 'wood_stained', 'black', 'white', 'colored', 'engraved']
            }
        };

        // Material properties
        this.materialProperties = {
            wood: { durability: 0.7, resonance: 0.8, density: 0.6, color: 0x8B4513, texture: 'grainy' },
            metal: { durability: 0.9, resonance: 0.9, density: 0.8, color: 0x708090, texture: 'metallic' },
            carbon_fiber: { durability: 0.95, resonance: 0.7, density: 0.5, color: 0x2F2F2F, texture: 'carbon' },
            plastic: { durability: 0.6, resonance: 0.4, density: 0.4, color: 0xF0F0F0, texture: 'smooth' },
            ebony: { durability: 0.8, resonance: 0.85, density: 0.7, color: 0x2F2F2F, texture: 'ebony' },
            maple: { durability: 0.75, resonance: 0.9, density: 0.6, color: 0xDEB887, texture: 'maple' },
            mahogany: { durability: 0.8, resonance: 0.85, density: 0.65, color: 0x8B4513, texture: 'mahogany' },
            spruce: { durability: 0.7, resonance: 0.95, density: 0.45, color: 0xF5DEB3, texture: 'spruce' },
            cedar: { durability: 0.65, resonance: 0.9, density: 0.5, color: 0xD2B48C, texture: 'cedar' },
            rosewood: { durability: 0.75, resonance: 0.88, density: 0.55, color: 0x8B4513, texture: 'rosewood' },
            ivory: { durability: 0.6, resonance: 0.7, density: 0.8, color: 0xFFFFF0, texture: 'ivory' },
            brass: { durability: 0.85, resonance: 0.8, density: 0.85, color: 0xCD853F, texture: 'brassy' },
            steel: { durability: 0.95, resonance: 0.75, density: 0.9, color: 0x2F4F4F, texture: 'steel' },
            felt: { durability: 0.4, resonance: 0.3, density: 0.3, color: 0x696969, texture: 'felt' },
            leather: { durability: 0.6, resonance: 0.4, density: 0.5, color: 0x8B4513, texture: 'leather' },
            synthetic: { durability: 0.8, resonance: 0.5, density: 0.4, color: 0xF0F0F0, texture: 'synthetic' },
            skin: { durability: 0.5, resonance: 0.6, density: 0.4, color: 0xDEB887, texture: 'skin' },
            bamboo: { durability: 0.4, resonance: 0.75, density: 0.4, color: 0xDEB887, texture: 'bamboo' },
            bone: { durability: 0.5, resonance: 0.7, density: 0.7, color: 0xF5F5DC, texture: 'bone' },
            crystal: { durability: 0.3, resonance: 0.95, density: 0.6, color: 0xE6E6FA, texture: 'crystal' },
            glass: { durability: 0.2, resonance: 0.9, density: 0.5, color: 0xF0F8FF, texture: 'glass' },
            ceramic: { durability: 0.7, resonance: 0.6, density: 0.8, color: 0xF5F5F5, texture: 'ceramic' },
            stone: { durability: 0.9, resonance: 0.4, density: 0.8, color: 0x696969, texture: 'stone' }
        };

        // Color palettes
        this.colorPalettes = {
            natural_wood: [0x8B4513, 0xDEB887, 0xD2B48C, 0xF5DEB3, 0xCD853F],
            metallic: [0x708090, 0xCD853F, 0xC0C0C0, 0xFFD700, 0x2F4F4F],
            dark: [0x2F2F2F, 0x000000, 0x696969, 0x808080, 0xA9A9A9],
            bright: [0xFFFFFF, 0xF0F0F0, 0xE6E6FA, 0xF0F8FF, 0xFFFAF0],
            colored: [0xDC143C, 0x4169E1, 0x228B22, 0xFFD700, 0x9370DB]
        };

        // String configurations for stringed instruments
        this.stringConfigs = {
            guitar: { strings: 6, tuning: ['E', 'A', 'D', 'G', 'B', 'E'] },
            bass: { strings: 4, tuning: ['E', 'A', 'D', 'G'] },
            ukulele: { strings: 4, tuning: ['G', 'C', 'E', 'A'] },
            mandolin: { strings: 8, tuning: ['G', 'D', 'A', 'E', 'G', 'D', 'A', 'E'] },
            banjo: { strings: 5, tuning: ['G', 'D', 'G', 'B', 'D'] },
            lute: { strings: 6, tuning: ['E', 'A', 'D', 'F#', 'B', 'E'] }
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine instrument type and generate accordingly
        const instrumentType = config.instrumentType || 'guitars';
        const subType = config.subType || 'acoustic_guitar';

        switch (instrumentType) {
            case 'guitars':
                await this.generateGuitar(image, config);
                break;
            case 'pianos':
                await this.generatePiano(image, config);
                break;
            case 'drums':
                await this.generateDrum(image, config);
                break;
            case 'flutes':
                await this.generateFlute(image, config);
                break;
            default:
                await this.generateGuitar(image, config);
        }
    }

    /**
     * Generate guitar
     */
    async generateGuitar(image, config) {
        const { width, height } = image.bitmap;
        const type = config.guitarType || 'acoustic_guitar';
        const material = config.guitarMaterial || 'wood';
        const style = config.guitarStyle || 'standard';
        const finish = config.guitarFinish || 'natural';

        const guitarsData = this.musicalInstrumentsDatabase.guitars;

        // Calculate guitar dimensions
        const guitarWidth = Math.floor(80);
        const guitarHeight = Math.floor(120);
        const centerX = Math.floor(width * 0.5);
        const guitarY = Math.floor(height * 0.3);

        // Generate guitar body
        await this.generateGuitarBody(image, centerX, guitarY, guitarWidth, guitarHeight, type, material, style);

        // Generate neck and headstock
        await this.generateGuitarNeck(image, centerX, guitarY, guitarWidth, guitarHeight, type, material);

        // Add strings
        await this.addGuitarStrings(image, centerX, guitarY, guitarWidth, guitarHeight, type);

        // Add hardware
        await this.addGuitarHardware(image, centerX, guitarY, guitarWidth, guitarHeight, type, material);

        // Apply finish
        await this.applyGuitarFinish(image, centerX, guitarY, guitarWidth, guitarHeight, finish);

        // Add material details
        await this.addGuitarDetails(image, centerX, guitarY, guitarWidth, guitarHeight, material);

        // Add shadow
        await this.addInstrumentShadow(image, centerX - guitarWidth * 0.4, guitarY, guitarWidth, guitarHeight);
    }

    /**
     * Generate guitar body
     */
    async generateGuitarBody(image, centerX, y, width, height, type, material, style) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (style) {
            case 'standard':
                // Standard acoustic body shape
                // Body outline
                this.utils.drawEllipse(image, centerX, y + height * 0.6, width * 0.4, height * 0.5, baseColor);
                // Upper bout
                this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.25, height * 0.3, baseColor);
                // Waist
                this.utils.drawRectangle(image, centerX - width * 0.1, y + height * 0.4, width * 0.2, height * 0.2, baseColor);
                break;

            case 'flying_v':
                // Flying V electric guitar
                // Main body
                this.utils.drawRectangle(image, centerX - width * 0.3, y + height * 0.4, width * 0.6, height * 0.4, baseColor);
                // Wings
                this.utils.drawTriangle(image, centerX - width * 0.4, y + height * 0.2, centerX - width * 0.2, y + height * 0.4, centerX - width * 0.3, y + height * 0.6, baseColor);
                this.utils.drawTriangle(image, centerX + width * 0.4, y + height * 0.2, centerX + width * 0.2, y + height * 0.4, centerX + width * 0.3, y + height * 0.6, baseColor);
                break;

            case 'stratocaster':
                // Fender Stratocaster
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.35, height * 0.45, baseColor);
                // Cutaways
                this.utils.drawEllipse(image, centerX - width * 0.25, y + height * 0.4, width * 0.15, height * 0.25, 0x000000);
                this.utils.drawEllipse(image, centerX + width * 0.25, y + height * 0.4, width * 0.15, height * 0.25, 0x000000);
                break;

            case 'les_paul':
                // Gibson Les Paul
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.4, height * 0.5, baseColor);
                // Single cutaway
                this.utils.drawEllipse(image, centerX - width * 0.3, y + height * 0.4, width * 0.2, height * 0.3, 0x000000);
                break;

            default:
                // Generic guitar body
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.35, height * 0.45, baseColor);
        }

        // Add sound hole for acoustic guitars
        if (type === 'acoustic_guitar' || type === 'classical_guitar') {
            this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.08, height * 0.1, 0x000000);
        }
    }

    /**
     * Generate guitar neck
     */
    async generateGuitarNeck(image, centerX, y, width, height, type, material) {
        const materialProps = this.materialProperties[material];
        const neckColor = materialProps.color;

        // Neck
        this.utils.drawRectangle(image, centerX - width * 0.05, y, width * 0.1, height * 0.8, neckColor);

        // Headstock
        this.utils.drawRectangle(image, centerX - width * 0.15, y - height * 0.1, width * 0.3, height * 0.1, neckColor);

        // Frets (simplified)
        for (let i = 0; i < 12; i++) {
            const fretY = y + (i * height * 0.06);
            this.utils.drawLine(image, centerX - width * 0.08, fretY, centerX + width * 0.08, fretY, 0xC0C0C0, 1);
        }

        // Nut
        this.utils.drawRectangle(image, centerX - width * 0.08, y - 2, width * 0.16, 4, 0xFFFFF0);
    }

    /**
     * Add guitar strings
     */
    async addGuitarStrings(image, centerX, y, width, height, type) {
        const stringConfig = this.stringConfigs.guitar;

        for (let i = 0; i < stringConfig.strings; i++) {
            const stringY = y + height * 0.1 + (i * height * 0.05);
            const stringX = centerX;

            // String from nut to bridge
            this.utils.drawLine(image, centerX - width * 0.08, stringY, centerX + width * 0.08, stringY, 0xC0C0C0, 1);
        }
    }

    /**
     * Generate piano
     */
    async generatePiano(image, config) {
        const { width, height } = image.bitmap;
        const type = config.pianoType || 'grand_piano';
        const material = config.pianoMaterial || 'wood';
        const style = config.pianoStyle || 'concert_grand';
        const finish = config.pianoFinish || 'polished_wood';

        const pianosData = this.musicalInstrumentsDatabase.pianos;

        // Calculate piano dimensions
        const pianoWidth = Math.floor(120);
        const pianoHeight = Math.floor(80);
        const centerX = Math.floor(width * 0.5);
        const pianoY = Math.floor(height * 0.4);

        // Generate piano body
        await this.generatePianoBody(image, centerX, pianoY, pianoWidth, pianoHeight, type, material, style);

        // Add keyboard
        await this.addPianoKeyboard(image, centerX, pianoY, pianoWidth, pianoHeight, type);

        // Add legs and supports
        await this.addPianoSupports(image, centerX, pianoY, pianoWidth, pianoHeight, type);

        // Apply finish
        await this.applyPianoFinish(image, centerX, pianoY, pianoWidth, pianoHeight, finish);

        // Add material details
        await this.addPianoDetails(image, centerX, pianoY, pianoWidth, pianoHeight, material);

        // Add shadow
        await this.addInstrumentShadow(image, centerX - pianoWidth * 0.4, pianoY, pianoWidth, pianoHeight);
    }

    /**
     * Generate piano body
     */
    async generatePianoBody(image, centerX, y, width, height, type, material, style) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'grand_piano':
                // Grand piano curved body
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.6, baseColor);
                // Lid
                this.utils.drawEllipse(image, centerX, y - height * 0.1, width * 0.35, height * 0.2, baseColor);
                break;

            case 'upright_piano':
                // Upright piano rectangular body
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);
                // Top curve
                this.utils.drawEllipse(image, centerX, y - height * 0.1, width * 0.35, height * 0.2, baseColor);
                break;

            case 'digital_piano':
                // Modern digital piano
                this.utils.drawRectangle(image, centerX - width * 0.4, y + height * 0.2, width * 0.8, height * 0.6, 0x2F2F2F);
                // Control panel
                this.utils.drawRectangle(image, centerX - width * 0.3, y, width * 0.6, height * 0.15, 0x000000);
                break;

            default:
                // Generic piano body
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);
        }
    }

    /**
     * Add piano keyboard
     */
    async addPianoKeyboard(image, centerX, y, width, height, type) {
        const keyboardY = y + height * 0.7;
        const keyWidth = width * 0.02;
        const whiteKeyHeight = height * 0.25;
        const blackKeyHeight = height * 0.15;

        // White keys
        for (let i = 0; i < 14; i++) {
            const keyX = centerX - width * 0.25 + (i * keyWidth * 1.5);
            this.utils.drawRectangle(image, keyX, keyboardY, keyWidth, whiteKeyHeight, 0xFFFFF0);
        }

        // Black keys
        const blackKeyPositions = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13];
        for (let i = 0; i < blackKeyPositions.length; i++) {
            const keyX = centerX - width * 0.25 + (blackKeyPositions[i] * keyWidth * 1.5) - keyWidth * 0.3;
            this.utils.drawRectangle(image, keyX, keyboardY, keyWidth * 0.6, blackKeyHeight, 0x000000);
        }
    }

    /**
     * Generate drum
     */
    async generateDrum(image, config) {
        const { width, height } = image.bitmap;
        const type = config.drumType || 'drum_kit';
        const material = config.drumMaterial || 'wood';
        const style = config.drumStyle || 'rock';
        const finish = config.drumFinish || 'chrome';

        const drumsData = this.musicalInstrumentsDatabase.drums;

        // Calculate drum dimensions
        const drumWidth = Math.floor(100);
        const drumHeight = Math.floor(80);
        const centerX = Math.floor(width * 0.5);
        const drumY = Math.floor(height * 0.4);

        // Generate drum shell
        await this.generateDrumShell(image, centerX, drumY, drumWidth, drumHeight, type, material);

        // Add drum heads
        await this.addDrumHeads(image, centerX, drumY, drumWidth, drumHeight, type);

        // Add hardware
        await this.addDrumHardware(image, centerX, drumY, drumWidth, drumHeight, type, material);

        // Apply finish
        await this.applyDrumFinish(image, centerX, drumY, drumWidth, drumHeight, finish);

        // Add material details
        await this.addDrumDetails(image, centerX, drumY, drumWidth, drumHeight, material);

        // Add shadow
        await this.addInstrumentShadow(image, centerX - drumWidth * 0.4, drumY, drumWidth, drumHeight);
    }

    /**
     * Generate drum shell
     */
    async generateDrumShell(image, centerX, y, width, height, type, material) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'snare_drum':
                // Snare drum cylindrical shell
                this.utils.drawRectangle(image, centerX - width * 0.3, y + height * 0.2, width * 0.6, height * 0.6, baseColor);
                // Snare wires underneath
                this.utils.drawRectangle(image, centerX - width * 0.25, y + height * 0.75, width * 0.5, height * 0.05, 0xC0C0C0);
                break;

            case 'bass_drum':
                // Large bass drum
                this.utils.drawRectangle(image, centerX - width * 0.4, y + height * 0.1, width * 0.8, height * 0.8, baseColor);
                break;

            case 'toms':
                // Tom toms
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.35, height * 0.5, baseColor);
                break;

            case 'conga':
                // Conga drum hourglass shape
                this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.25, height * 0.3, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.3, height * 0.3, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.7, width * 0.25, height * 0.3, baseColor);
                break;

            case 'djembe':
                // Djembe goblet shape
                this.utils.drawEllipse(image, centerX, y + height * 0.2, width * 0.2, height * 0.2, baseColor);
                this.utils.drawRectangle(image, centerX - width * 0.15, y + height * 0.3, width * 0.3, height * 0.5, baseColor);
                this.utils.drawEllipse(image, centerX, y + height * 0.8, width * 0.25, height * 0.2, baseColor);
                break;

            default:
                // Generic drum shell
                this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.35, height * 0.5, baseColor);
        }
    }

    /**
     * Add drum heads
     */
    async addDrumHeads(image, centerX, y, width, height, type) {
        // Top head
        this.utils.drawEllipse(image, centerX, y + height * 0.2, width * 0.3, height * 0.1, 0xF5F5DC);

        // Bottom head
        this.utils.drawEllipse(image, centerX, y + height * 0.8, width * 0.3, height * 0.1, 0xF5F5DC);

        // Tension rods
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const rodX = centerX + Math.cos(angle) * width * 0.25;
            const rodY = y + height * 0.2 + Math.sin(angle) * height * 0.08;
            this.utils.drawEllipse(image, rodX, rodY, 2, 2, 0xC0C0C0);
        }
    }

    /**
     * Generate flute
     */
    async generateFlute(image, config) {
        const { width, height } = image.bitmap;
        const type = config.fluteType || 'concert_flute';
        const material = config.fluteMaterial || 'metal';
        const style = config.fluteStyle || 'bohemian';
        const finish = config.fluteFinish || 'silver';

        const flutesData = this.musicalInstrumentsDatabase.flutes;

        // Calculate flute dimensions
        const fluteWidth = Math.floor(60);
        const fluteHeight = Math.floor(20);
        const centerX = Math.floor(width * 0.5);
        const fluteY = Math.floor(height * 0.4);

        // Generate flute body
        await this.generateFluteBody(image, centerX, fluteY, fluteWidth, fluteHeight, type, material, style);

        // Add keys and mechanisms
        await this.addFluteKeys(image, centerX, fluteY, fluteWidth, fluteHeight, type);

        // Add mouthpiece
        await this.addFluteMouthpiece(image, centerX, fluteY, fluteWidth, fluteHeight, type);

        // Apply finish
        await this.applyFluteFinish(image, centerX, fluteY, fluteWidth, fluteHeight, finish);

        // Add material details
        await this.addFluteDetails(image, centerX, fluteY, fluteWidth, fluteHeight, material);

        // Add shadow
        await this.addInstrumentShadow(image, centerX - fluteWidth * 0.4, fluteY, fluteWidth, fluteHeight);
    }

    /**
     * Generate flute body
     */
    async generateFluteBody(image, centerX, y, width, height, type, material, style) {
        const materialProps = this.materialProperties[material];
        const baseColor = materialProps.color;

        switch (type) {
            case 'concert_flute':
                // Modern concert flute
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);
                // Head joint
                this.utils.drawRectangle(image, centerX - width * 0.45, y - height * 0.5, width * 0.1, height * 0.5, baseColor);
                break;

            case 'piccolo':
                // Small piccolo
                this.utils.drawRectangle(image, centerX - width * 0.3, y, width * 0.6, height * 0.8, baseColor);
                this.utils.drawRectangle(image, centerX - width * 0.35, y - height * 0.3, width * 0.08, height * 0.3, baseColor);
                break;

            case 'pan_flute':
                // Pan flute with multiple pipes
                for (let i = 0; i < 8; i++) {
                    const pipeX = centerX - width * 0.3 + (i * width * 0.08);
                    const pipeHeight = height * (0.5 + i * 0.05);
                    this.utils.drawRectangle(image, pipeX, y - pipeHeight, width * 0.05, pipeHeight, baseColor);
                }
                break;

            case 'bamboo_flute':
                // Traditional bamboo flute
                this.utils.drawRectangle(image, centerX - width * 0.3, y, width * 0.6, height, baseColor);
                // Bamboo nodes
                for (let i = 0; i < 4; i++) {
                    const nodeX = centerX - width * 0.25 + (i * width * 0.15);
                    this.utils.drawLine(image, nodeX, y, nodeX, y + height, 0x8B4513, 2);
                }
                break;

            case 'ocarina':
                // Ocarina egg shape
                this.utils.drawEllipse(image, centerX, y, width * 0.25, height * 0.8, baseColor);
                // Finger holes
                for (let i = 0; i < 4; i++) {
                    const holeX = centerX - width * 0.15 + (i * width * 0.1);
                    this.utils.drawEllipse(image, holeX, y, width * 0.03, height * 0.05, 0x000000);
                }
                break;

            default:
                // Generic flute body
                this.utils.drawRectangle(image, centerX - width * 0.4, y, width * 0.8, height, baseColor);
        }
    }

    /**
     * Add flute keys
     */
    async addFluteKeys(image, centerX, y, width, height, type) {
        if (type === 'concert_flute' || type === 'piccolo') {
            // Modern flute keys
            for (let i = 0; i < 6; i++) {
                const keyX = centerX - width * 0.3 + (i * width * 0.1);
                this.utils.drawEllipse(image, keyX, y + height * 0.2, width * 0.04, height * 0.08, 0xC0C0C0);
                // Key posts
                this.utils.drawLine(image, keyX, y + height * 0.3, keyX, y + height * 0.5, 0xC0C0C0, 1);
            }
        } else if (type === 'recorder') {
            // Recorder finger holes
            for (let i = 0; i < 7; i++) {
                const holeX = centerX - width * 0.25 + (i * width * 0.07);
                this.utils.drawEllipse(image, holeX, y, width * 0.03, height * 0.05, 0x000000);
            }
        }
    }

    /**
     * Helper methods
     */
    async addGuitarHardware(image, centerX, y, width, height, type, material) {
        // Bridge
        this.utils.drawRectangle(image, centerX - width * 0.05, y + height * 0.7, width * 0.1, height * 0.05, 0xC0C0C0);

        // Tuners
        for (let i = 0; i < 6; i++) {
            const tunerX = centerX - width * 0.12 + (i * width * 0.04);
            this.utils.drawEllipse(image, tunerX, y - height * 0.08, width * 0.02, height * 0.03, 0xC0C0C0);
        }

        // Pickups for electric guitars
        if (type === 'electric_guitar') {
            this.utils.drawRectangle(image, centerX - width * 0.08, y + height * 0.4, width * 0.16, height * 0.03, 0x000000);
        }
    }

    async applyGuitarFinish(image, centerX, y, width, height, finish) {
        // Apply finish effects based on type
        switch (finish) {
            case 'sunburst':
                // Create sunburst gradient effect
                for (let i = 0; i < 10; i++) {
                    const radius = (i / 10) * width * 0.4;
                    const alpha = Math.floor(255 * (1 - i / 10));
                    // This would require more complex pixel manipulation
                }
                break;
            case 'metallic':
                // Add metallic reflections
                for (let i = 0; i < 5; i++) {
                    const reflectionX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                    const reflectionY = y + Math.floor(Math.random() * height * 0.8);
                    this.utils.drawEllipse(image, reflectionX, reflectionY, 3, 4, 0xFFFFFF);
                }
                break;
        }
    }

    async addGuitarDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'grainy') {
            // Add wood grain
            for (let i = 0; i < 8; i++) {
                const grainX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                const grainY = y + Math.floor(Math.random() * height);
                this.utils.drawLine(image, grainX, grainY, grainX + 6, grainY + 2, this.utils.adjustBrightness(materialProps.color, -20), 1);
            }
        }
    }

    async addPianoSupports(image, centerX, y, width, height, type) {
        if (type === 'grand_piano') {
            // Grand piano legs
            for (let i = 0; i < 3; i++) {
                const legX = centerX - width * 0.2 + (i * width * 0.2);
                this.utils.drawRectangle(image, legX, y + height, width * 0.05, height * 0.3, 0x8B4513);
            }
        } else if (type === 'upright_piano') {
            // Upright piano legs
            for (let i = 0; i < 4; i++) {
                const legX = centerX - width * 0.3 + (i * width * 0.15);
                this.utils.drawRectangle(image, legX, y + height, width * 0.04, height * 0.2, 0x8B4513);
            }
        }
    }

    async addPianoDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'grainy') {
            // Add wood grain
            for (let i = 0; i < 12; i++) {
                const grainX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                const grainY = y + Math.floor(Math.random() * height);
                this.utils.drawLine(image, grainX, grainY, grainX + 8, grainY + 3, this.utils.adjustBrightness(materialProps.color, -15), 1);
            }
        }
    }

    async addDrumHardware(image, centerX, y, width, height, type, material) {
        // Lugs and tension rods
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const lugX = centerX + Math.cos(angle) * width * 0.28;
            const lugY = y + height * 0.4 + Math.sin(angle) * height * 0.35;
            this.utils.drawEllipse(image, lugX, lugY, 3, 3, 0xC0C0C0);
        }
    }

    async applyDrumFinish(image, centerX, y, width, height, finish) {
        switch (finish) {
            case 'chrome':
                // Add chrome reflections
                for (let i = 0; i < 6; i++) {
                    const reflectionX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                    const reflectionY = y + Math.floor(Math.random() * height * 0.8);
                    this.utils.drawEllipse(image, reflectionX, reflectionY, 2, 3, 0xFFFFFF);
                }
                break;
            case 'wood_natural':
                // Add wood grain
                for (let i = 0; i < 10; i++) {
                    const grainX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const grainY = y + Math.floor(Math.random() * height);
                    this.utils.drawLine(image, grainX, grainY, grainX + 5, grainY + 2, this.utils.adjustBrightness(0x8B4513, -20), 1);
                }
                break;
        }
    }

    async addDrumDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'metallic') {
            // Add metallic texture
            for (let i = 0; i < 8; i++) {
                const textureX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                const textureY = y + Math.floor(Math.random() * height);
                this.utils.drawEllipse(image, textureX, textureY, 1, 1, 0xFFFFFF);
            }
        }
    }

    async addFluteMouthpiece(image, centerX, y, width, height, type) {
        if (type === 'concert_flute' || type === 'piccolo') {
            // Modern flute mouthpiece
            this.utils.drawEllipse(image, centerX - width * 0.45, y - height * 0.3, width * 0.05, height * 0.2, 0xFFFFFF);
        } else if (type === 'recorder') {
            // Recorder mouthpiece
            this.utils.drawEllipse(image, centerX - width * 0.35, y, width * 0.04, height * 0.15, 0xFFFFFF);
        }
    }

    async applyFluteFinish(image, centerX, y, width, height, finish) {
        switch (finish) {
            case 'silver':
            case 'gold':
                // Add metallic shine
                for (let i = 0; i < 4; i++) {
                    const shineX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const shineY = y + Math.floor(Math.random() * height);
                    this.utils.drawEllipse(image, shineX, shineY, 1, 2, 0xFFFFFF);
                }
                break;
            case 'wood_natural':
                // Add wood grain
                for (let i = 0; i < 6; i++) {
                    const grainX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const grainY = y + Math.floor(Math.random() * height);
                    this.utils.drawLine(image, grainX, grainY, grainX + 4, grainY + 1, this.utils.adjustBrightness(0x8B4513, -20), 1);
                }
                break;
        }
    }

    async addFluteDetails(image, centerX, y, width, height, material) {
        const materialProps = this.materialProperties[material];

        if (materialProps.texture === 'transparent') {
            // Add crystal/glass effects
            for (let i = 0; i < 3; i++) {
                const effectX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
                const effectY = y + Math.floor(Math.random() * height);
                this.utils.drawEllipse(image, effectX, effectY, 1, 1, 0xFFFFFF);
            }
        }
    }

    async addInstrumentShadow(image, x, y, width, height) {
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

module.exports = MusicalInstrumentsGenerator;
