/**
 * Furniture Generator - Tables, chairs, beds, cabinets with material variations
 * Handles generation of household and decorative furniture with realistic textures and details
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class FurnitureGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Furniture database
        this.furnitureDatabase = {
            table: {
                name: 'Table',
                styles: ['wooden', 'metal', 'stone', 'glass', 'antique'],
                shapes: ['round', 'square', 'rectangular', 'oval'],
                sizes: ['small', 'medium', 'large', 'grand'],
                materials: {
                    wooden: {
                        baseColor: '#8B4513',
                        accentColor: '#D2691E',
                        legColor: '#654321'
                    },
                    metal: {
                        baseColor: '#696969',
                        accentColor: '#C0C0C0',
                        legColor: '#2F4F4F'
                    },
                    stone: {
                        baseColor: '#708090',
                        accentColor: '#778899',
                        legColor: '#696969'
                    },
                    glass: {
                        baseColor: '#E6E6FA',
                        accentColor: '#F0F8FF',
                        legColor: '#C0C0C0'
                    },
                    antique: {
                        baseColor: '#DAA520',
                        accentColor: '#FFD700',
                        legColor: '#8B4513'
                    }
                }
            },
            chair: {
                name: 'Chair',
                types: ['dining', 'armchair', 'stool', 'throne', 'rocking'],
                materials: ['wood', 'metal', 'leather', 'fabric', 'stone'],
                styles: ['simple', 'ornate', 'modern', 'rustic', 'royal'],
                materials: {
                    wood: {
                        frameColor: '#8B4513',
                        seatColor: '#D2691E',
                        accentColor: '#654321'
                    },
                    metal: {
                        frameColor: '#696969',
                        seatColor: '#C0C0C0',
                        accentColor: '#2F4F4F'
                    },
                    leather: {
                        frameColor: '#8B4513',
                        seatColor: '#8B4513',
                        accentColor: '#654321'
                    },
                    fabric: {
                        frameColor: '#8B4513',
                        seatColor: '#FFE4E1',
                        accentColor: '#DDA0DD'
                    },
                    stone: {
                        frameColor: '#708090',
                        seatColor: '#778899',
                        accentColor: '#696969'
                    }
                }
            },
            bed: {
                name: 'Bed',
                sizes: ['single', 'double', 'queen', 'king', 'grand'],
                styles: ['simple', 'four_poster', 'canopy', 'platform', 'storage'],
                materials: ['wood', 'metal', 'wrought_iron', 'bamboo', 'stone'],
                materials: {
                    wood: {
                        frameColor: '#8B4513',
                        beddingColor: '#FFFFFF',
                        accentColor: '#D2691E'
                    },
                    metal: {
                        frameColor: '#696969',
                        beddingColor: '#F5F5F5',
                        accentColor: '#C0C0C0'
                    },
                    wrought_iron: {
                        frameColor: '#2F4F4F',
                        beddingColor: '#FFFFFF',
                        accentColor: '#696969'
                    },
                    bamboo: {
                        frameColor: '#DAA520',
                        beddingColor: '#F5F5DC',
                        accentColor: '#CD853F'
                    },
                    stone: {
                        frameColor: '#708090',
                        beddingColor: '#FFFFFF',
                        accentColor: '#778899'
                    }
                }
            },
            cabinet: {
                name: 'Cabinet',
                types: ['wardrobe', 'bookshelf', 'display', 'storage', 'china'],
                materials: ['wood', 'metal', 'glass', 'antique', 'modern'],
                sizes: ['small', 'medium', 'large', 'tall', 'wide'],
                materials: {
                    wood: {
                        frameColor: '#8B4513',
                        doorColor: '#D2691E',
                        shelfColor: '#654321'
                    },
                    metal: {
                        frameColor: '#696969',
                        doorColor: '#C0C0C0',
                        shelfColor: '#2F4F4F'
                    },
                    glass: {
                        frameColor: '#8B4513',
                        doorColor: '#E6E6FA',
                        shelfColor: '#D2691E'
                    },
                    antique: {
                        frameColor: '#DAA520',
                        doorColor: '#FFD700',
                        shelfColor: '#8B4513'
                    },
                    modern: {
                        frameColor: '#FFFFFF',
                        doorColor: '#F5F5F5',
                        shelfColor: '#E6E6FA'
                    }
                }
            },
            shelf: {
                name: 'Shelf',
                types: ['wall', 'floor', 'corner', 'floating', 'ladder'],
                materials: ['wood', 'metal', 'glass', 'bamboo', 'stone'],
                sizes: ['small', 'medium', 'large', 'extra_large'],
                materials: {
                    wood: {
                        baseColor: '#8B4513',
                        shelfColor: '#D2691E',
                        supportColor: '#654321'
                    },
                    metal: {
                        baseColor: '#696969',
                        shelfColor: '#C0C0C0',
                        supportColor: '#2F4F4F'
                    },
                    glass: {
                        baseColor: '#E6E6FA',
                        shelfColor: '#F0F8FF',
                        supportColor: '#C0C0C0'
                    },
                    bamboo: {
                        baseColor: '#DAA520',
                        shelfColor: '#CD853F',
                        supportColor: '#8B4513'
                    },
                    stone: {
                        baseColor: '#708090',
                        shelfColor: '#778899',
                        supportColor: '#696969'
                    }
                }
            }
        };

        // Animation frames for interactive furniture
        this.animationFrames = {
            chair: 4,
            bed: 6,
            cabinet: 8,
            table: 2,
            shelf: 3
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine furniture type and generate accordingly
        const furnitureType = config.furnitureType || 'table';
        const subType = config.subType || 'wooden';

        switch (furnitureType) {
            case 'table':
                await this.generateTable(image, config);
                break;
            case 'chair':
                await this.generateChair(image, config);
                break;
            case 'bed':
                await this.generateBed(image, config);
                break;
            case 'cabinet':
                await this.generateCabinet(image, config);
                break;
            case 'shelf':
                await this.generateShelf(image, config);
                break;
            default:
                await this.generateTable(image, config);
        }
    }

    /**
     * Generate table
     */
    async generateTable(image, config) {
        const { width, height } = image.bitmap;
        const style = config.tableStyle || 'wooden';
        const shape = config.tableShape || 'rectangular';
        const size = config.tableSize || 'medium';

        const tableData = this.furnitureDatabase.table;
        const materialData = tableData.materials[style];

        // Calculate table dimensions
        const sizeMultiplier = { small: 0.7, medium: 1.0, large: 1.3, grand: 1.6 };
        const multiplier = sizeMultiplier[size];

        const tableWidth = Math.floor(100 * multiplier);
        const tableHeight = Math.floor(60 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const tableY = Math.floor(height - tableHeight - 5);

        // Generate table top
        await this.generateTableTop(image, centerX, tableY, tableWidth, tableHeight, materialData, shape);

        // Generate table legs/supports
        await this.generateTableSupports(image, centerX, tableY, tableWidth, tableHeight, materialData, style);

        // Add decorative elements
        await this.addTableDecorations(image, centerX, tableY, tableWidth, tableHeight, style, size);

        // Add shadow
        await this.addFurnitureShadow(image, centerX - tableWidth * 0.5, tableY, tableWidth, tableHeight);
    }

    /**
     * Generate table top
     */
    async generateTableTop(image, centerX, y, width, height, materialData, shape) {
        const topThickness = Math.floor(height * 0.15);
        const topY = y;

        switch (shape) {
            case 'round':
                this.utils.drawEllipse(image, centerX, topY + topThickness * 0.5, width * 0.5, topThickness * 0.5, materialData.baseColor);
                break;
            case 'square':
                this.utils.drawRectangle(image, centerX - width * 0.5, topY, width, topThickness, materialData.baseColor);
                break;
            case 'oval':
                this.utils.drawEllipse(image, centerX, topY + topThickness * 0.5, width * 0.5, topThickness * 0.4, materialData.baseColor);
                break;
            default: // rectangular
                this.utils.drawRectangle(image, centerX - width * 0.5, topY, width, topThickness, materialData.baseColor);
        }

        // Add surface texture
        await this.addSurfaceTexture(image, centerX - width * 0.5, topY, width, topThickness, materialData.baseColor);
    }

    /**
     * Generate table supports
     */
    async generateTableSupports(image, centerX, y, width, height, materialData, style) {
        const legHeight = Math.floor(height * 0.85);
        const legThickness = Math.floor(width * 0.08);

        switch (style) {
            case 'metal':
                // Four metal legs
                this.utils.drawRectangle(image, centerX - width * 0.4, y + height * 0.15, legThickness, legHeight, materialData.legColor);
                this.utils.drawRectangle(image, centerX + width * 0.4 - legThickness, y + height * 0.15, legThickness, legHeight, materialData.legColor);
                this.utils.drawRectangle(image, centerX - width * 0.4, y + height - legThickness, legThickness, legThickness, materialData.legColor);
                this.utils.drawRectangle(image, centerX + width * 0.4 - legThickness, y + height - legThickness, legThickness, legThickness, materialData.legColor);
                break;

            case 'stone':
                // Stone pedestal
                this.utils.drawRectangle(image, centerX - width * 0.3, y + height * 0.2, width * 0.6, legHeight * 0.8, materialData.legColor);
                break;

            case 'glass':
                // Minimal glass supports
                this.utils.drawRectangle(image, centerX - width * 0.45, y + height * 0.15, legThickness * 0.5, legHeight, materialData.legColor);
                this.utils.drawRectangle(image, centerX + width * 0.45 - legThickness * 0.5, y + height * 0.15, legThickness * 0.5, legHeight, materialData.legColor);
                break;

            default: // wooden/antique
                // Four wooden legs with cross braces
                const legPositions = [
                    { x: centerX - width * 0.35, y: y + height * 0.15 },
                    { x: centerX + width * 0.35 - legThickness, y: y + height * 0.15 },
                    { x: centerX - width * 0.35, y: y + height - legThickness },
                    { x: centerX + width * 0.35 - legThickness, y: y + height - legThickness }
                ];

                for (const pos of legPositions) {
                    this.utils.drawRectangle(image, pos.x, pos.y, legThickness, legThickness, materialData.legColor);
                }

                // Add cross braces for antique style
                if (style === 'antique') {
                    this.utils.drawRectangle(image, centerX - width * 0.3, y + height * 0.4, width * 0.6, legThickness * 0.5, materialData.accentColor);
                    this.utils.drawRectangle(image, centerX - width * 0.3, y + height * 0.6, width * 0.6, legThickness * 0.5, materialData.accentColor);
                }
        }
    }

    /**
     * Generate chair
     */
    async generateChair(image, config) {
        const { width, height } = image.bitmap;
        const type = config.chairType || 'dining';
        const material = config.chairMaterial || 'wood';
        const style = config.chairStyle || 'simple';

        const chairData = this.furnitureDatabase.chair;
        const materialData = chairData.materials[material];

        // Calculate chair dimensions
        const chairWidth = Math.floor(40 + Math.random() * 20);
        const chairHeight = Math.floor(60 + Math.random() * 20);
        const centerX = Math.floor(width * 0.5);
        const chairY = Math.floor(height - chairHeight - 5);

        // Generate chair frame
        await this.generateChairFrame(image, centerX, chairY, chairWidth, chairHeight, materialData, type, style);

        // Generate seat
        await this.generateChairSeat(image, centerX, chairY, chairWidth, chairHeight, materialData, type);

        // Generate backrest
        await this.generateChairBack(image, centerX, chairY, chairWidth, chairHeight, materialData, type, style);

        // Add decorative elements
        await this.addChairDecorations(image, centerX, chairY, chairWidth, chairHeight, style);

        // Add shadow
        await this.addFurnitureShadow(image, centerX - chairWidth * 0.5, chairY, chairWidth, chairHeight);
    }

    /**
     * Generate chair frame
     */
    async generateChairFrame(image, centerX, y, width, height, materialData, type, style) {
        const legHeight = Math.floor(height * 0.8);
        const legThickness = Math.floor(width * 0.08);

        // Four legs
        const legPositions = [
            { x: centerX - width * 0.3, y: y + height * 0.2 },
            { x: centerX + width * 0.3 - legThickness, y: y + height * 0.2 },
            { x: centerX - width * 0.3, y: y + height - legThickness },
            { x: centerX + width * 0.3 - legThickness, y: y + height - legThickness }
        ];

        for (const pos of legPositions) {
            this.utils.drawRectangle(image, pos.x, pos.y, legThickness, legThickness, materialData.frameColor);
        }

        // Side stretchers
        this.utils.drawRectangle(image, centerX - width * 0.35, y + height * 0.4, width * 0.7, legThickness * 0.5, materialData.frameColor);
        this.utils.drawRectangle(image, centerX - width * 0.35, y + height * 0.6, width * 0.7, legThickness * 0.5, materialData.frameColor);
    }

    /**
     * Generate chair seat
     */
    async generateChairSeat(image, centerX, y, width, height, materialData, type) {
        const seatWidth = Math.floor(width * 0.8);
        const seatHeight = Math.floor(height * 0.15);
        const seatX = centerX - seatWidth * 0.5;
        const seatY = y + height * 0.25;

        this.utils.drawRectangle(image, seatX, seatY, seatWidth, seatHeight, materialData.seatColor);

        // Add seat texture
        await this.addFabricTexture(image, seatX, seatY, seatWidth, seatHeight, materialData.seatColor, 'fabric');
    }

    /**
     * Generate chair back
     */
    async generateChairBack(image, centerX, y, width, height, materialData, type, style) {
        const backWidth = Math.floor(width * 0.1);
        const backHeight = Math.floor(height * 0.6);
        const backX = centerX - backWidth * 0.5;
        const backY = y + height * 0.05;

        // Vertical back supports
        this.utils.drawRectangle(image, backX, backY, backWidth, backHeight, materialData.frameColor);

        // Horizontal slats
        const numSlats = style === 'simple' ? 3 : style === 'ornate' ? 5 : 4;
        for (let i = 0; i < numSlats; i++) {
            const slatY = backY + (i + 1) * (backHeight * 0.8) / (numSlats + 1);
            const slatWidth = Math.floor(width * 0.6);
            const slatX = centerX - slatWidth * 0.5;

            this.utils.drawRectangle(image, slatX, slatY, slatWidth, backWidth * 0.3, materialData.frameColor);
        }

        // Add ornate details
        if (style === 'ornate') {
            await this.addOrnateChairDetails(image, centerX, backY, width, backHeight, materialData);
        }
    }

    /**
     * Generate bed
     */
    async generateBed(image, config) {
        const { width, height } = image.bitmap;
        const size = config.bedSize || 'double';
        const style = config.bedStyle || 'simple';
        const material = config.bedMaterial || 'wood';

        const bedData = this.furnitureDatabase.bed;
        const materialData = bedData.materials[material];

        // Calculate bed dimensions
        const sizeMultiplier = { single: 0.8, double: 1.0, queen: 1.2, king: 1.4, grand: 1.6 };
        const multiplier = sizeMultiplier[size];

        const bedWidth = Math.floor(120 * multiplier);
        const bedHeight = Math.floor(80 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const bedY = Math.floor(height - bedHeight - 5);

        // Generate bed frame
        await this.generateBedFrame(image, centerX, bedY, bedWidth, bedHeight, materialData, style);

        // Generate mattress and bedding
        await this.generateBedding(image, centerX, bedY, bedWidth, bedHeight, materialData);

        // Generate headboard
        await this.generateHeadboard(image, centerX, bedY, bedWidth, bedHeight, materialData, style);

        // Add decorative elements
        await this.addBedDecorations(image, centerX, bedY, bedWidth, bedHeight, style);

        // Add shadow
        await this.addFurnitureShadow(image, centerX - bedWidth * 0.5, bedY, bedWidth, bedHeight);
    }

    /**
     * Generate bed frame
     */
    async generateBedFrame(image, centerX, y, width, height, materialData, style) {
        const frameThickness = Math.floor(width * 0.05);

        // Side rails
        this.utils.drawRectangle(image, centerX - width * 0.5, y + height * 0.3, width, frameThickness, materialData.frameColor);
        this.utils.drawRectangle(image, centerX - width * 0.5, y + height - frameThickness, width, frameThickness, materialData.frameColor);

        // End rails
        this.utils.drawRectangle(image, centerX - width * 0.5, y + height * 0.3, frameThickness, height * 0.7, materialData.frameColor);
        this.utils.drawRectangle(image, centerX + width * 0.5 - frameThickness, y + height * 0.3, frameThickness, height * 0.7, materialData.frameColor);

        // Legs
        const legHeight = Math.floor(height * 0.3);
        this.utils.drawRectangle(image, centerX - width * 0.45, y + height - legHeight, frameThickness, legHeight, materialData.frameColor);
        this.utils.drawRectangle(image, centerX + width * 0.45 - frameThickness, y + height - legHeight, frameThickness, legHeight, materialData.frameColor);
    }

    /**
     * Generate bedding
     */
    async generateBedding(image, centerX, y, width, height, materialData) {
        const mattressWidth = Math.floor(width * 0.9);
        const mattressHeight = Math.floor(height * 0.25);
        const mattressX = centerX - mattressWidth * 0.5;
        const mattressY = y + height * 0.35;

        // Mattress
        this.utils.drawRectangle(image, mattressX, mattressY, mattressWidth, mattressHeight, materialData.beddingColor);

        // Pillow
        const pillowWidth = Math.floor(width * 0.25);
        const pillowHeight = Math.floor(height * 0.08);
        const pillowX = centerX - pillowWidth * 0.5;
        const pillowY = mattressY - pillowHeight;

        this.utils.drawEllipse(image, pillowX + pillowWidth * 0.5, pillowY + pillowHeight * 0.5, pillowWidth * 0.5, pillowHeight * 0.5, '#FFFFFF');

        // Blanket
        const blanketHeight = Math.floor(mattressHeight * 0.8);
        const blanketY = mattressY + mattressHeight - blanketHeight;
        this.utils.drawRectangle(image, mattressX, blanketY, mattressWidth, blanketHeight, '#4169E1');
    }

    /**
     * Generate headboard
     */
    async generateHeadboard(image, centerX, y, width, height, materialData, style) {
        const headboardWidth = Math.floor(width * 0.9);
        const headboardHeight = Math.floor(height * 0.25);
        const headboardX = centerX - headboardWidth * 0.5;
        const headboardY = y;

        this.utils.drawRectangle(image, headboardX, headboardY, headboardWidth, headboardHeight, materialData.frameColor);

        // Add style-specific headboard details
        switch (style) {
            case 'four_poster':
                await this.addFourPosterDetails(image, headboardX, headboardY, headboardWidth, headboardHeight, materialData);
                break;
            case 'canopy':
                await this.addCanopyDetails(image, headboardX, headboardY, headboardWidth, headboardHeight, materialData);
                break;
            case 'platform':
                await this.addPlatformDetails(image, headboardX, headboardY, headboardWidth, headboardHeight, materialData);
                break;
        }
    }

    /**
     * Generate cabinet
     */
    async generateCabinet(image, config) {
        const { width, height } = image.bitmap;
        const type = config.cabinetType || 'wardrobe';
        const material = config.cabinetMaterial || 'wood';
        const size = config.cabinetSize || 'medium';

        const cabinetData = this.furnitureDatabase.cabinet;
        const materialData = cabinetData.materials[material];

        // Calculate cabinet dimensions
        const sizeMultiplier = { small: 0.7, medium: 1.0, large: 1.3, tall: 1.1, wide: 1.4 };
        const multiplier = sizeMultiplier[size];

        const cabinetWidth = Math.floor(80 * multiplier);
        const cabinetHeight = Math.floor(120 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const cabinetY = Math.floor(height - cabinetHeight - 5);

        // Generate cabinet body
        await this.generateCabinetBody(image, centerX, cabinetY, cabinetWidth, cabinetHeight, materialData, type);

        // Generate doors/drawers
        await this.generateCabinetDoors(image, centerX, cabinetY, cabinetWidth, cabinetHeight, materialData, type);

        // Generate shelves
        await this.generateCabinetShelves(image, centerX, cabinetY, cabinetWidth, cabinetHeight, materialData, type);

        // Add decorative elements
        await this.addCabinetDecorations(image, centerX, cabinetY, cabinetWidth, cabinetHeight, material, type);

        // Add shadow
        await this.addFurnitureShadow(image, centerX - cabinetWidth * 0.5, cabinetY, cabinetWidth, cabinetHeight);
    }

    /**
     * Generate cabinet body
     */
    async generateCabinetBody(image, centerX, y, width, height, materialData, type) {
        // Main cabinet body
        this.utils.drawRectangle(image, centerX - width * 0.5, y, width, height, materialData.frameColor);

        // Add body texture
        await this.addWoodGrainTexture(image, centerX - width * 0.5, y, width, height, materialData.frameColor);
    }

    /**
     * Generate cabinet doors
     */
    async generateCabinetDoors(image, centerX, y, width, height, materialData, type) {
        const doorWidth = Math.floor(width * 0.4);
        const doorHeight = Math.floor(height * 0.8);
        const doorY = y + height * 0.1;

        // Left door
        this.utils.drawRectangle(image, centerX - width * 0.45, doorY, doorWidth, doorHeight, materialData.doorColor);

        // Right door
        this.utils.drawRectangle(image, centerX + width * 0.05, doorY, doorWidth, doorHeight, materialData.doorColor);

        // Door handles
        const handleSize = Math.floor(width * 0.03);
        this.utils.drawRectangle(image, centerX - width * 0.25, doorY + doorHeight * 0.5 - handleSize * 0.5, handleSize, handleSize, materialData.frameColor);
        this.utils.drawRectangle(image, centerX + width * 0.25 - handleSize, doorY + doorHeight * 0.5 - handleSize * 0.5, handleSize, handleSize, materialData.frameColor);
    }

    /**
     * Generate cabinet shelves
     */
    async generateCabinetShelves(image, centerX, y, width, height, materialData, type) {
        const numShelves = type === 'bookshelf' ? 5 : 3;
        const shelfHeight = Math.floor(height * 0.02);

        for (let i = 0; i < numShelves; i++) {
            const shelfY = y + height * 0.15 + (i * height * 0.7) / (numShelves - 1);
            this.utils.drawRectangle(image, centerX - width * 0.45, shelfY, width * 0.9, shelfHeight, materialData.shelfColor);
        }
    }

    /**
     * Generate shelf
     */
    async generateShelf(image, config) {
        const { width, height } = image.bitmap;
        const type = config.shelfType || 'wall';
        const material = config.shelfMaterial || 'wood';
        const size = config.shelfSize || 'medium';

        const shelfData = this.furnitureDatabase.shelf;
        const materialData = shelfData.materials[material];

        // Calculate shelf dimensions
        const sizeMultiplier = { small: 0.7, medium: 1.0, large: 1.3, extra_large: 1.6 };
        const multiplier = sizeMultiplier[size];

        const shelfWidth = Math.floor(100 * multiplier);
        const shelfHeight = Math.floor(80 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const shelfY = Math.floor(height - shelfHeight - 5);

        // Generate shelf structure based on type
        switch (type) {
            case 'wall':
                await this.generateWallShelf(image, centerX, shelfY, shelfWidth, shelfHeight, materialData);
                break;
            case 'floor':
                await this.generateFloorShelf(image, centerX, shelfY, shelfWidth, shelfHeight, materialData);
                break;
            case 'corner':
                await this.generateCornerShelf(image, centerX, shelfY, shelfWidth, shelfHeight, materialData);
                break;
            case 'floating':
                await this.generateFloatingShelf(image, centerX, shelfY, shelfWidth, shelfHeight, materialData);
                break;
            case 'ladder':
                await this.generateLadderShelf(image, centerX, shelfY, shelfWidth, shelfHeight, materialData);
                break;
        }

        // Add shadow
        await this.addFurnitureShadow(image, centerX - shelfWidth * 0.5, shelfY, shelfWidth, shelfHeight);
    }

    /**
     * Generate wall shelf
     */
    async generateWallShelf(image, centerX, y, width, height, materialData) {
        const shelfThickness = Math.floor(height * 0.1);
        const numShelves = 3;

        for (let i = 0; i < numShelves; i++) {
            const shelfY = y + i * (height * 0.3);
            this.utils.drawRectangle(image, centerX - width * 0.5, shelfY, width, shelfThickness, materialData.shelfColor);

            // Add supports
            if (i < numShelves - 1) {
                this.utils.drawRectangle(image, centerX - width * 0.45, shelfY + shelfThickness, width * 0.1, height * 0.3 - shelfThickness, materialData.supportColor);
                this.utils.drawRectangle(image, centerX + width * 0.35, shelfY + shelfThickness, width * 0.1, height * 0.3 - shelfThickness, materialData.supportColor);
            }
        }
    }

    /**
     * Generate floor shelf
     */
    async generateFloorShelf(image, centerX, y, width, height, materialData) {
        const shelfThickness = Math.floor(height * 0.08);
        const numShelves = 4;

        for (let i = 0; i < numShelves; i++) {
            const shelfY = y + i * (height * 0.22);
            this.utils.drawRectangle(image, centerX - width * 0.5, shelfY, width, shelfThickness, materialData.shelfColor);
        }

        // Add side panels
        this.utils.drawRectangle(image, centerX - width * 0.5, y, width * 0.05, height, materialData.supportColor);
        this.utils.drawRectangle(image, centerX + width * 0.45, y, width * 0.05, height, materialData.supportColor);
    }

    /**
     * Helper methods for textures and details
     */
    async addWoodGrainTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const darkerColor = this.utils.adjustBrightness(baseColor, -30);

        for (let gy = y; gy < y + height; gy += 3) {
            if (gy >= 0 && gy < imgHeight) {
                for (let gx = x; gx < x + width; gx++) {
                    if (gx >= 0 && gx < imgWidth && Math.random() < 0.3) {
                        const idx = (gy * imgWidth + gx) * 4;
                        const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                        if (currentColor !== 0) {
                            image.bitmap.data[idx] = (darkerColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (darkerColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = darkerColor & 0xFF;
                        }
                    }
                }
            }
        }
    }

    async addSurfaceTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const highlightColor = this.utils.adjustBrightness(baseColor, 20);

        for (let gy = y; gy < y + height; gy++) {
            for (let gx = x; gx < x + width; gx++) {
                if (gx >= 0 && gx < imgWidth && gy >= 0 && gy < imgHeight && Math.random() < 0.1) {
                    const idx = (gy * imgWidth + gx) * 4;
                    image.bitmap.data[idx] = (highlightColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (highlightColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = highlightColor & 0xFF;
                }
            }
        }
    }

    async addFabricTexture(image, x, y, width, height, baseColor, fabricType) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        switch (fabricType) {
            case 'fabric':
                const weaveColor = this.utils.adjustBrightness(baseColor, -15);
                for (let gy = y; gy < y + height; gy += 2) {
                    if (gy >= 0 && gy < imgHeight) {
                        for (let gx = x; gx < x + width; gx += 2) {
                            if (gx >= 0 && gx < imgWidth && Math.random() < 0.2) {
                                const idx = (gy * imgWidth + gx) * 4;
                                image.bitmap.data[idx] = (weaveColor >> 16) & 0xFF;
                                image.bitmap.data[idx + 1] = (weaveColor >> 8) & 0xFF;
                                image.bitmap.data[idx + 2] = weaveColor & 0xFF;
                            }
                        }
                    }
                }
                break;
        }
    }

    async addFurnitureShadow(image, x, y, width, height) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const shadowOffset = Math.floor(width * 0.03);

        for (let sy = 0; sy < shadowOffset; sy++) {
            for (let sx = 0; sx < width; sx++) {
                const shadowX = x + sx;
                const shadowY = y + height + sy;

                if (shadowX >= 0 && shadowX < imgWidth && shadowY >= 0 && shadowY < imgHeight) {
                    const idx = (shadowY * imgWidth + shadowX) * 4;
                    const alpha = Math.floor(40 * (1 - sy / shadowOffset));
                    image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                }
            }
        }
    }

    // Additional helper methods would be implemented here for the remaining furniture details
    async addTableDecorations(image, centerX, tableY, tableWidth, tableHeight, style, size) {}
    async addChairDecorations(image, centerX, chairY, chairWidth, chairHeight, style) {}
    async addOrnateChairDetails(image, centerX, backY, width, backHeight, materialData) {}
    async addBedDecorations(image, centerX, bedY, bedWidth, bedHeight, style) {}
    async addFourPosterDetails(image, headboardX, headboardY, headboardWidth, headboardHeight, materialData) {}
    async addCanopyDetails(image, headboardX, headboardY, headboardWidth, headboardHeight, materialData) {}
    async addPlatformDetails(image, headboardX, headboardY, headboardWidth, headboardHeight, materialData) {}
    async addCabinetDecorations(image, centerX, cabinetY, cabinetWidth, cabinetHeight, material, type) {}
    async generateCornerShelf(image, centerX, shelfY, shelfWidth, shelfHeight, materialData) {}
    async generateFloatingShelf(image, centerX, shelfY, shelfWidth, shelfHeight, materialData) {}
    async generateLadderShelf(image, centerX, shelfY, shelfWidth, shelfHeight, materialData) {}
}

module.exports = FurnitureGenerator;
