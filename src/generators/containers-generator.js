/**
 * Containers Generator - Chests, barrels, crates, sacks with opening animations
 * Handles generation of storage containers with realistic textures and interactive elements
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class ContainersGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Container database
        this.containerDatabase = {
            chest: {
                name: 'Treasure Chest',
                styles: ['wooden', 'metal', 'ornate', 'ancient'],
                sizes: ['small', 'medium', 'large', 'grand'],
                lockTypes: ['none', 'simple', 'complex', 'magical'],
                materials: {
                    wooden: {
                        baseColor: '#8B4513',
                        accentColor: '#D2691E',
                        lockColor: '#FFD700'
                    },
                    metal: {
                        baseColor: '#696969',
                        accentColor: '#C0C0C0',
                        lockColor: '#FFD700'
                    },
                    ornate: {
                        baseColor: '#DAA520',
                        accentColor: '#FFD700',
                        lockColor: '#FF6347'
                    },
                    ancient: {
                        baseColor: '#2F4F4F',
                        accentColor: '#696969',
                        lockColor: '#8B0000'
                    }
                }
            },
            barrel: {
                name: 'Storage Barrel',
                types: ['wooden', 'metal', 'wine', 'powder'],
                sizes: ['small', 'medium', 'large'],
                contents: ['empty', 'filled', 'overflowing'],
                materials: {
                    wooden: {
                        baseColor: '#8B4513',
                        bandColor: '#2F4F4F',
                        contentColor: '#DAA520'
                    },
                    metal: {
                        baseColor: '#696969',
                        bandColor: '#C0C0C0',
                        contentColor: '#4169E1'
                    },
                    wine: {
                        baseColor: '#8B4513',
                        bandColor: '#2F4F4F',
                        contentColor: '#8B0000'
                    },
                    powder: {
                        baseColor: '#8B4513',
                        bandColor: '#2F4F4F',
                        contentColor: '#F5F5DC'
                    }
                }
            },
            crate: {
                name: 'Wooden Crate',
                qualities: ['rough', 'polished', 'reinforced', 'decorative'],
                sizes: ['small', 'medium', 'large', 'stackable'],
                markings: ['none', 'fragile', 'hazard', 'valuable'],
                materials: {
                    rough: {
                        baseColor: '#8B4513',
                        accentColor: '#A0522D',
                        markingColor: '#FF0000'
                    },
                    polished: {
                        baseColor: '#D2691E',
                        accentColor: '#CD853F',
                        markingColor: '#FFD700'
                    },
                    reinforced: {
                        baseColor: '#8B4513',
                        accentColor: '#696969',
                        markingColor: '#FFFF00'
                    },
                    decorative: {
                        baseColor: '#DAA520',
                        accentColor: '#FFD700',
                        markingColor: '#FF6347'
                    }
                }
            },
            sack: {
                name: 'Storage Sack',
                fabrics: ['burlap', 'canvas', 'silk', 'leather'],
                contents: ['grain', 'coins', 'gems', 'herbs'],
                sizes: ['small', 'medium', 'large', 'bulging'],
                materials: {
                    burlap: {
                        baseColor: '#DEB887',
                        accentColor: '#D2B48C',
                        contentColor: '#DAA520'
                    },
                    canvas: {
                        baseColor: '#F5F5DC',
                        accentColor: '#FAFAD2',
                        contentColor: '#4169E1'
                    },
                    silk: {
                        baseColor: '#FFE4E1',
                        accentColor: '#FFB6C1',
                        contentColor: '#9370DB'
                    },
                    leather: {
                        baseColor: '#8B4513',
                        accentColor: '#A0522D',
                        contentColor: '#FFD700'
                    }
                }
            },
            box: {
                name: 'Decorative Box',
                styles: ['jewelry', 'document', 'tool', 'ornamental'],
                materials: ['wood', 'metal', 'ceramic', 'precious'],
                sizes: ['tiny', 'small', 'medium', 'large'],
                materials: {
                    wood: {
                        baseColor: '#D2691E',
                        accentColor: '#CD853F',
                        liningColor: '#8B4513'
                    },
                    metal: {
                        baseColor: '#C0C0C0',
                        accentColor: '#FFD700',
                        liningColor: '#696969'
                    },
                    ceramic: {
                        baseColor: '#F0E68C',
                        accentColor: '#DAA520',
                        liningColor: '#DEB887'
                    },
                    precious: {
                        baseColor: '#FFD700',
                        accentColor: '#FF6347',
                        liningColor: '#9370DB'
                    }
                }
            }
        };

        // Animation frames for opening containers
        this.animationFrames = {
            chest: 8,
            barrel: 6,
            crate: 4,
            sack: 5,
            box: 6
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine container type and generate accordingly
        const containerType = config.containerType || 'chest';
        const subType = config.subType || 'wooden';

        switch (containerType) {
            case 'chest':
                await this.generateChest(image, config);
                break;
            case 'barrel':
                await this.generateBarrel(image, config);
                break;
            case 'crate':
                await this.generateCrate(image, config);
                break;
            case 'sack':
                await this.generateSack(image, config);
                break;
            case 'box':
                await this.generateBox(image, config);
                break;
            default:
                await this.generateChest(image, config);
        }
    }

    /**
     * Generate treasure chest
     */
    async generateChest(image, config) {
        const { width, height } = image.bitmap;
        const style = config.chestStyle || 'wooden';
        const size = config.chestSize || 'medium';
        const lockType = config.lockType || 'simple';

        const chestData = this.containerDatabase.chest;
        const materialData = chestData.materials[style];

        // Calculate chest dimensions based on size
        const sizeMultiplier = { small: 0.7, medium: 1.0, large: 1.3, grand: 1.6 };
        const multiplier = sizeMultiplier[size];

        const chestWidth = Math.floor(80 * multiplier);
        const chestHeight = Math.floor(60 * multiplier);
        const chestX = Math.floor((width - chestWidth) * 0.5);
        const chestY = Math.floor(height - chestHeight - 10);

        // Generate chest body
        await this.generateChestBody(image, chestX, chestY, chestWidth, chestHeight, materialData, style);

        // Add lock if specified
        if (lockType !== 'none') {
            await this.addChestLock(image, chestX, chestY, chestWidth, chestHeight, materialData, lockType);
        }

        // Add decorative elements
        await this.addChestDecorations(image, chestX, chestY, chestWidth, chestHeight, style, size);

        // Add shadow
        await this.addContainerShadow(image, chestX, chestY, chestWidth, chestHeight);
    }

    /**
     * Generate chest body
     */
    async generateChestBody(image, x, y, width, height, materialData, style) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        // Main chest body
        this.utils.drawRectangle(image, x, y + height * 0.3, width, height * 0.7, materialData.baseColor);

        // Chest lid
        this.utils.drawRectangle(image, x + 2, y, width - 4, height * 0.35, materialData.accentColor);

        // Add wood grain texture
        if (style === 'wooden' || style === 'ancient') {
            await this.addWoodGrainTexture(image, x, y, width, height, materialData.baseColor);
        }

        // Add metal reinforcements for metal/ornate chests
        if (style === 'metal' || style === 'ornate') {
            await this.addMetalReinforcements(image, x, y, width, height, materialData.accentColor);
        }
    }

    /**
     * Add chest lock
     */
    async addChestLock(image, x, y, width, height, materialData, lockType) {
        const lockX = x + width * 0.5 - 8;
        const lockY = y + height * 0.4;

        // Lock body
        this.utils.drawRectangle(image, lockX, lockY, 16, 12, materialData.lockColor);

        // Lock mechanism
        if (lockType === 'complex' || lockType === 'magical') {
            // Add keyhole
            this.utils.drawRectangle(image, lockX + 6, lockY + 2, 4, 8, '#000000');

            // Add decorative elements for complex locks
            if (lockType === 'complex') {
                this.utils.drawEllipse(image, lockX + 2, lockY + 6, 2, 2, materialData.accentColor);
                this.utils.drawEllipse(image, lockX + 12, lockY + 6, 2, 2, materialData.accentColor);
            }

            // Add magical glow for magical locks
            if (lockType === 'magical') {
                await this.addMagicalGlow(image, lockX - 2, lockY - 2, 20, 16, materialData.lockColor);
            }
        }
    }

    /**
     * Add chest decorations
     */
    async addChestDecorations(image, x, y, width, height, style, size) {
        if (style === 'ornate') {
            // Add ornate carvings
            await this.addOrnateCarvings(image, x, y, width, height);
        }

        if (size === 'grand') {
            // Add grand chest decorations
            await this.addGrandDecorations(image, x, y, width, height);
        }

        // Add corner reinforcements
        await this.addCornerReinforcements(image, x, y, width, height, style);
    }

    /**
     * Generate storage barrel
     */
    async generateBarrel(image, config) {
        const { width, height } = image.bitmap;
        const type = config.barrelType || 'wooden';
        const size = config.barrelSize || 'medium';
        const content = config.barrelContent || 'empty';

        const barrelData = this.containerDatabase.barrel;
        const materialData = barrelData.materials[type];

        // Calculate barrel dimensions
        const sizeMultiplier = { small: 0.6, medium: 1.0, large: 1.4 };
        const multiplier = sizeMultiplier[size];

        const barrelWidth = Math.floor(60 * multiplier);
        const barrelHeight = Math.floor(80 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const barrelY = Math.floor(height - barrelHeight - 5);

        // Generate barrel body
        await this.generateBarrelBody(image, centerX, barrelY, barrelWidth, barrelHeight, materialData, type);

        // Add contents if not empty
        if (content !== 'empty') {
            await this.addBarrelContents(image, centerX, barrelY, barrelWidth, barrelHeight, materialData, content);
        }

        // Add barrel bands
        await this.addBarrelBands(image, centerX, barrelY, barrelWidth, barrelHeight, materialData);

        // Add shadow
        await this.addContainerShadow(image, centerX - barrelWidth * 0.5, barrelY, barrelWidth, barrelHeight);
    }

    /**
     * Generate barrel body
     */
    async generateBarrelBody(image, centerX, y, width, height, materialData, type) {
        const radius = width * 0.5;

        // Draw barrel as a series of stacked ellipses
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const segmentY = y + (i * height) / segments;
            const segmentHeight = height / segments + 1;
            const segmentRadius = radius * (0.8 + 0.4 * Math.sin((i / segments) * Math.PI));

            this.utils.drawEllipse(image, centerX, segmentY, segmentRadius, segmentHeight * 0.5, materialData.baseColor);
        }

        // Add wood grain for wooden barrels
        if (type === 'wooden' || type === 'wine') {
            await this.addBarrelGrain(image, centerX, y, width, height, materialData.baseColor);
        }
    }

    /**
     * Add barrel contents
     */
    async addBarrelContents(image, centerX, y, width, height, materialData, content) {
        const contentHeight = content === 'overflowing' ? height * 0.8 : content === 'filled' ? height * 0.6 : height * 0.3;
        const contentY = y + height - contentHeight;

        // Draw content level
        this.utils.drawEllipse(image, centerX, contentY + contentHeight * 0.5, width * 0.4, contentHeight * 0.5, materialData.contentColor);

        // Add overflow effect for overflowing barrels
        if (content === 'overflowing') {
            await this.addOverflowEffect(image, centerX, y, width, materialData.contentColor);
        }
    }

    /**
     * Add barrel bands
     */
    async addBarrelBands(image, centerX, y, width, height, materialData) {
        const bandPositions = [0.2, 0.5, 0.8];

        for (const pos of bandPositions) {
            const bandY = y + height * pos;
            const bandWidth = width * 0.9;
            const bandHeight = 3;

            this.utils.drawRectangle(image, centerX - bandWidth * 0.5, bandY - bandHeight * 0.5,
                                   bandWidth, bandHeight, materialData.bandColor);
        }
    }

    /**
     * Generate wooden crate
     */
    async generateCrate(image, config) {
        const { width, height } = image.bitmap;
        const quality = config.crateQuality || 'rough';
        const size = config.crateSize || 'medium';
        const marking = config.crateMarking || 'none';

        const crateData = this.containerDatabase.crate;
        const materialData = crateData.materials[quality];

        // Calculate crate dimensions
        const sizeMultiplier = { small: 0.7, medium: 1.0, large: 1.3, stackable: 0.9 };
        const multiplier = sizeMultiplier[size];

        const crateWidth = Math.floor(70 * multiplier);
        const crateHeight = Math.floor(50 * multiplier);
        const crateX = Math.floor((width - crateWidth) * 0.5);
        const crateY = Math.floor(height - crateHeight - 10);

        // Generate crate body
        await this.generateCrateBody(image, crateX, crateY, crateWidth, crateHeight, materialData, quality);

        // Add markings if specified
        if (marking !== 'none') {
            await this.addCrateMarkings(image, crateX, crateY, crateWidth, crateHeight, materialData, marking);
        }

        // Add shadow
        await this.addContainerShadow(image, crateX, crateY, crateWidth, crateHeight);
    }

    /**
     * Generate crate body
     */
    async generateCrateBody(image, x, y, width, height, materialData, quality) {
        // Main crate body
        this.utils.drawRectangle(image, x, y, width, height, materialData.baseColor);

        // Add wooden planks
        const plankHeight = Math.floor(height * 0.15);
        for (let i = 0; i < 5; i++) {
            const plankY = y + i * (height * 0.2);
            this.utils.drawRectangle(image, x, plankY, width, plankHeight, materialData.accentColor);

            // Add plank texture
            if (quality !== 'polished') {
                await this.addPlankTexture(image, x, plankY, width, plankHeight, materialData.baseColor);
            }
        }

        // Add crate frame
        await this.addCrateFrame(image, x, y, width, height, materialData.accentColor);
    }

    /**
     * Add crate markings
     */
    async addCrateMarkings(image, x, y, width, height, materialData, marking) {
        const centerX = x + width * 0.5;
        const centerY = y + height * 0.5;

        switch (marking) {
            case 'fragile':
                // Draw "FRAGILE" text
                await this.drawTextMarking(image, centerX - 20, centerY - 5, 'FRAGILE', materialData.markingColor);
                break;
            case 'hazard':
                // Draw hazard symbol
                await this.drawHazardSymbol(image, centerX, centerY, 15, materialData.markingColor);
                break;
            case 'valuable':
                // Draw value markings
                await this.drawValueMarkings(image, x, y, width, height, materialData.markingColor);
                break;
        }
    }

    /**
     * Generate storage sack
     */
    async generateSack(image, config) {
        const { width, height } = image.bitmap;
        const fabric = config.sackFabric || 'burlap';
        const content = config.sackContent || 'grain';
        const size = config.sackSize || 'medium';

        const sackData = this.containerDatabase.sack;
        const materialData = sackData.materials[fabric];

        // Calculate sack dimensions
        const sizeMultiplier = { small: 0.6, medium: 1.0, large: 1.4, bulging: 1.2 };
        const multiplier = sizeMultiplier[size];

        const sackWidth = Math.floor(50 * multiplier);
        const sackHeight = Math.floor(60 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const sackY = Math.floor(height - sackHeight - 5);

        // Generate sack body
        await this.generateSackBody(image, centerX, sackY, sackWidth, sackHeight, materialData, fabric, size);

        // Add contents
        await this.addSackContents(image, centerX, sackY, sackWidth, sackHeight, materialData, content, size);

        // Add sack details
        await this.addSackDetails(image, centerX, sackY, sackWidth, sackHeight, materialData, fabric);

        // Add shadow
        await this.addContainerShadow(image, centerX - sackWidth * 0.5, sackY, sackWidth, sackHeight);
    }

    /**
     * Generate sack body
     */
    async generateSackBody(image, centerX, y, width, height, materialData, fabric, size) {
        // Draw sack as a rounded rectangle with bulge
        const bulge = size === 'bulging' ? 0.2 : 0.1;

        // Main sack body
        this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.5, height * 0.5, materialData.baseColor);

        // Add fabric texture
        await this.addFabricTexture(image, centerX - width * 0.5, y, width, height, materialData.baseColor, fabric);

        // Add drawstring at top
        const drawstringY = y + 5;
        this.utils.drawRectangle(image, centerX - width * 0.3, drawstringY, width * 0.6, 2, materialData.accentColor);
    }

    /**
     * Add sack contents
     */
    async addSackContents(image, centerX, y, width, height, materialData, content, size) {
        const contentHeight = size === 'bulging' ? height * 0.7 : height * 0.5;
        const contentY = y + height - contentHeight;

        // Draw content bulge
        this.utils.drawEllipse(image, centerX, contentY + contentHeight * 0.5,
                             width * 0.4, contentHeight * 0.5, materialData.contentColor);

        // Add content-specific details
        switch (content) {
            case 'grain':
                await this.addGrainTexture(image, centerX - width * 0.3, contentY, width * 0.6, contentHeight, materialData.contentColor);
                break;
            case 'coins':
                await this.addCoinTexture(image, centerX - width * 0.3, contentY, width * 0.6, contentHeight, materialData.contentColor);
                break;
            case 'gems':
                await this.addGemTexture(image, centerX - width * 0.3, contentY, width * 0.6, contentHeight, materialData.contentColor);
                break;
        }
    }

    /**
     * Generate decorative box
     */
    async generateBox(image, config) {
        const { width, height } = image.bitmap;
        const style = config.boxStyle || 'jewelry';
        const material = config.boxMaterial || 'wood';
        const size = config.boxSize || 'small';

        const boxData = this.containerDatabase.box;
        const materialData = boxData.materials[material];

        // Calculate box dimensions
        const sizeMultiplier = { tiny: 0.4, small: 0.7, medium: 1.0, large: 1.3 };
        const multiplier = sizeMultiplier[size];

        const boxWidth = Math.floor(60 * multiplier);
        const boxHeight = Math.floor(40 * multiplier);
        const boxX = Math.floor((width - boxWidth) * 0.5);
        const boxY = Math.floor(height - boxHeight - 10);

        // Generate box body
        await this.generateBoxBody(image, boxX, boxY, boxWidth, boxHeight, materialData, material, style);

        // Add style-specific decorations
        await this.addBoxDecorations(image, boxX, boxY, boxWidth, boxHeight, materialData, style);

        // Add lid
        await this.addBoxLid(image, boxX, boxY, boxWidth, boxHeight, materialData, material);

        // Add shadow
        await this.addContainerShadow(image, boxX, boxY, boxWidth, boxHeight);
    }

    /**
     * Generate box body
     */
    async generateBoxBody(image, x, y, width, height, materialData, material, style) {
        // Main box body
        this.utils.drawRectangle(image, x, y + height * 0.3, width, height * 0.7, materialData.baseColor);

        // Add material-specific texture
        switch (material) {
            case 'wood':
                await this.addWoodGrainTexture(image, x, y, width, height, materialData.baseColor);
                break;
            case 'metal':
                await this.addMetalTexture(image, x, y, width, height, materialData.baseColor);
                break;
            case 'ceramic':
                await this.addCeramicTexture(image, x, y, width, height, materialData.baseColor);
                break;
            case 'precious':
                await this.addPreciousTexture(image, x, y, width, height, materialData.baseColor);
                break;
        }
    }

    /**
     * Add box decorations
     */
    async addBoxDecorations(image, x, y, width, height, materialData, style) {
        switch (style) {
            case 'jewelry':
                await this.addJewelryDecorations(image, x, y, width, height, materialData);
                break;
            case 'document':
                await this.addDocumentDecorations(image, x, y, width, height, materialData);
                break;
            case 'tool':
                await this.addToolDecorations(image, x, y, width, height, materialData);
                break;
            case 'ornamental':
                await this.addOrnamentalDecorations(image, x, y, width, height, materialData);
                break;
        }
    }

    /**
     * Add container shadow
     */
    async addContainerShadow(image, x, y, width, height) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const shadowOffset = Math.floor(width * 0.05);
        const shadowColor = '#000000';

        // Draw shadow as a soft ellipse
        for (let sy = 0; sy < shadowOffset; sy++) {
            for (let sx = 0; sx < width; sx++) {
                const shadowX = x + sx;
                const shadowY = y + height + sy;

                if (shadowX >= 0 && shadowX < imgWidth && shadowY >= 0 && shadowY < imgHeight) {
                    const idx = (shadowY * imgWidth + shadowX) * 4;
                    const alpha = Math.floor(50 * (1 - sy / shadowOffset));
                    image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                }
            }
        }
    }

    /**
     * Add wood grain texture
     */
    async addWoodGrainTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const darkerColor = this.utils.adjustBrightness(baseColor, -30);
        const lighterColor = this.utils.adjustBrightness(baseColor, 20);

        // Add horizontal wood grains
        for (let gy = y; gy < y + height; gy += 3) {
            if (gy >= 0 && gy < imgHeight) {
                for (let gx = x; gx < x + width; gx++) {
                    if (gx >= 0 && gx < imgWidth && Math.random() < 0.3) {
                        const idx = (gy * imgWidth + gx) * 4;
                        const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                        if (currentColor !== 0) {
                            const grainColor = Math.random() < 0.6 ? darkerColor : lighterColor;
                            image.bitmap.data[idx] = (grainColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (grainColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = grainColor & 0xFF;
                        }
                    }
                }
            }
        }
    }

    /**
     * Add metal reinforcements
     */
    async addMetalReinforcements(image, x, y, width, height, accentColor) {
        // Add corner reinforcements
        const cornerSize = 8;
        this.utils.drawRectangle(image, x, y, cornerSize, cornerSize, accentColor);
        this.utils.drawRectangle(image, x + width - cornerSize, y, cornerSize, cornerSize, accentColor);
        this.utils.drawRectangle(image, x, y + height - cornerSize, cornerSize, cornerSize, accentColor);
        this.utils.drawRectangle(image, x + width - cornerSize, y + height - cornerSize, cornerSize, cornerSize, accentColor);
    }

    /**
     * Add ornate carvings
     */
    async addOrnateCarvings(image, x, y, width, height) {
        const carvingColor = '#DAA520';

        // Add decorative patterns
        for (let i = 0; i < 5; i++) {
            const carvingX = x + Math.floor(Math.random() * width);
            const carvingY = y + Math.floor(Math.random() * height);
            const carvingSize = Math.floor(3 + Math.random() * 5);

            this.utils.drawEllipse(image, carvingX, carvingY, carvingSize, carvingSize, carvingColor);
        }
    }

    /**
     * Add grand decorations
     */
    async addGrandDecorations(image, x, y, width, height) {
        const goldColor = '#FFD700';

        // Add gold accents
        this.utils.drawRectangle(image, x + width * 0.1, y + height * 0.1, width * 0.8, 3, goldColor);
        this.utils.drawRectangle(image, x + width * 0.1, y + height * 0.9, width * 0.8, 3, goldColor);
        this.utils.drawRectangle(image, x + width * 0.1, y + height * 0.1, 3, height * 0.8, goldColor);
        this.utils.drawRectangle(image, x + width * 0.9, y + height * 0.1, 3, height * 0.8, goldColor);
    }

    /**
     * Add corner reinforcements
     */
    async addCornerReinforcements(image, x, y, width, height, style) {
        const reinforcementColor = style === 'metal' ? '#C0C0C0' : '#8B4513';
        const cornerSize = 6;

        // Add corner brackets
        this.utils.drawRectangle(image, x - 2, y - 2, cornerSize, cornerSize, reinforcementColor);
        this.utils.drawRectangle(image, x + width - cornerSize + 2, y - 2, cornerSize, cornerSize, reinforcementColor);
        this.utils.drawRectangle(image, x - 2, y + height - cornerSize + 2, cornerSize, cornerSize, reinforcementColor);
        this.utils.drawRectangle(image, x + width - cornerSize + 2, y + height - cornerSize + 2, cornerSize, cornerSize, reinforcementColor);
    }

    /**
     * Add magical glow
     */
    async addMagicalGlow(image, x, y, width, height, glowColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        for (let gy = y; gy < y + height; gy++) {
            for (let gx = x; gx < x + width; gx++) {
                if (gx >= 0 && gx < imgWidth && gy >= 0 && gy < imgHeight) {
                    const distance = Math.sqrt((gx - (x + width * 0.5)) ** 2 + (gy - (y + height * 0.5)) ** 2);
                    if (distance <= width * 0.5) {
                        const idx = (gy * imgWidth + gx) * 4;
                        const alpha = Math.floor(100 * (1 - distance / (width * 0.5)));
                        image.bitmap.data[idx] = (glowColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (glowColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = glowColor & 0xFF;
                        image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                    }
                }
            }
        }
    }

    /**
     * Add barrel grain
     */
    async addBarrelGrain(image, centerX, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const darkerColor = this.utils.adjustBrightness(baseColor, -40);

        // Add vertical wood grains
        for (let gx = centerX - width * 0.4; gx < centerX + width * 0.4; gx += 4) {
            if (gx >= 0 && gx < imgWidth) {
                for (let gy = y; gy < y + height; gy++) {
                    if (gy >= 0 && gy < imgHeight && Math.random() < 0.2) {
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

    /**
     * Add overflow effect
     */
    async addOverflowEffect(image, centerX, y, width, overflowColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        // Add overflow particles
        for (let i = 0; i < 10; i++) {
            const particleX = centerX + Math.floor((Math.random() - 0.5) * width);
            const particleY = y + Math.floor(Math.random() * 10);
            const particleSize = Math.floor(1 + Math.random() * 3);

            this.utils.drawEllipse(image, particleX, particleY, particleSize, particleSize, overflowColor);
        }
    }

    /**
     * Add plank texture
     */
    async addPlankTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const darkerColor = this.utils.adjustBrightness(baseColor, -25);

        // Add plank grain lines
        for (let gy = y; gy < y + height; gy += 2) {
            if (gy >= 0 && gy < imgHeight) {
                for (let gx = x; gx < x + width; gx++) {
                    if (gx >= 0 && gx < imgWidth && Math.random() < 0.15) {
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

    /**
     * Add crate frame
     */
    async addCrateFrame(image, x, y, width, height, frameColor) {
        // Add frame around crate
        this.utils.drawRectangle(image, x, y, width, 2, frameColor);
        this.utils.drawRectangle(image, x, y + height - 2, width, 2, frameColor);
        this.utils.drawRectangle(image, x, y, 2, height, frameColor);
        this.utils.drawRectangle(image, x + width - 2, y, 2, height, frameColor);
    }

    /**
     * Draw text marking
     */
    async drawTextMarking(image, x, y, text, color) {
        // Simple text rendering - just draw rectangles for letters
        const letterWidth = 4;
        const letterHeight = 6;

        for (let i = 0; i < text.length; i++) {
            const letterX = x + i * (letterWidth + 1);
            this.utils.drawRectangle(image, letterX, y, letterWidth, letterHeight, color);
        }
    }

    /**
     * Draw hazard symbol
     */
    async drawHazardSymbol(image, centerX, centerY, size, color) {
        // Draw triangle for hazard symbol
        const points = [
            { x: centerX, y: centerY - size },
            { x: centerX - size, y: centerY + size },
            { x: centerX + size, y: centerY + size }
        ];

        await this.fillIrregularShape(image, points, color);

        // Add exclamation mark
        this.utils.drawRectangle(image, centerX - 1, centerY - size * 0.5, 2, size * 0.6, '#000000');
        this.utils.drawRectangle(image, centerX - 1, centerY + size * 0.2, 2, 3, '#000000');
    }

    /**
     * Draw value markings
     */
    async drawValueMarkings(image, x, y, width, height, color) {
        // Draw dollar signs or value symbols
        for (let i = 0; i < 3; i++) {
            const markX = x + width * (0.2 + i * 0.3);
            const markY = y + height * 0.5;

            // Simple dollar sign shape
            this.utils.drawRectangle(image, markX, markY - 8, 2, 16, color);
            this.utils.drawRectangle(image, markX - 3, markY - 6, 8, 2, color);
            this.utils.drawRectangle(image, markX - 3, markY + 4, 8, 2, color);
        }
    }

    /**
     * Add fabric texture
     */
    async addFabricTexture(image, x, y, width, height, baseColor, fabric) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        switch (fabric) {
            case 'burlap':
                await this.addBurlapTexture(image, x, y, width, height, baseColor);
                break;
            case 'canvas':
                await this.addCanvasTexture(image, x, y, width, height, baseColor);
                break;
            case 'silk':
                await this.addSilkTexture(image, x, y, width, height, baseColor);
                break;
            case 'leather':
                await this.addLeatherTexture(image, x, y, width, height, baseColor);
                break;
        }
    }

    /**
     * Add burlap texture
     */
    async addBurlapTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const weaveColor = this.utils.adjustBrightness(baseColor, -20);

        // Add burlap weave pattern
        for (let gy = y; gy < y + height; gy += 3) {
            if (gy >= 0 && gy < imgHeight) {
                for (let gx = x; gx < x + width; gx += 3) {
                    if (gx >= 0 && gx < imgWidth && Math.random() < 0.4) {
                        const idx = (gy * imgWidth + gx) * 4;
                        const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                        if (currentColor !== 0) {
                            image.bitmap.data[idx] = (weaveColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (weaveColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = weaveColor & 0xFF;
                        }
                    }
                }
            }
        }
    }

    /**
     * Add canvas texture
     */
    async addCanvasTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const threadColor = this.utils.adjustBrightness(baseColor, -15);

        // Add canvas thread pattern
        for (let gy = y; gy < y + height; gy += 4) {
            if (gy >= 0 && gy < imgHeight) {
                // Horizontal threads
                for (let gx = x; gx < x + width; gx++) {
                    if (gx >= 0 && gx < imgWidth && Math.random() < 0.2) {
                        const idx = (gy * imgWidth + gx) * 4;
                        const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                        if (currentColor !== 0) {
                            image.bitmap.data[idx] = (threadColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (threadColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = threadColor & 0xFF;
                        }
                    }
                }
            }
        }

        // Vertical threads
        for (let gx = x; gx < x + width; gx += 4) {
            if (gx >= 0 && gx < imgWidth) {
                for (let gy = y; gy < y + height; gy++) {
                    if (gy >= 0 && gy < imgHeight && Math.random() < 0.2) {
                        const idx = (gy * imgWidth + gx) * 4;
                        const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                        if (currentColor !== 0) {
                            image.bitmap.data[idx] = (threadColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (threadColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = threadColor & 0xFF;
                        }
                    }
                }
            }
        }
    }

    /**
     * Add silk texture
     */
    async addSilkTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const sheenColor = this.utils.adjustBrightness(baseColor, 30);

        // Add silk sheen effect
        for (let gy = y; gy < y + height; gy++) {
            for (let gx = x; gx < x + width; gx++) {
                if (gx >= 0 && gx < imgWidth && gy >= 0 && gy < imgHeight && Math.random() < 0.05) {
                    const idx = (gy * imgWidth + gx) * 4;
                    const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                    if (currentColor !== 0) {
                        image.bitmap.data[idx] = (sheenColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (sheenColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = sheenColor & 0xFF;
                    }
                }
            }
        }
    }

    /**
     * Add leather texture
     */
    async addLeatherTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const creaseColor = this.utils.adjustBrightness(baseColor, -25);

        // Add leather creases and wrinkles
        for (let i = 0; i < 8; i++) {
            const creaseX = x + Math.floor(Math.random() * width);
            const creaseY = y + Math.floor(Math.random() * height);
            const creaseLength = Math.floor(10 + Math.random() * 20);
            const creaseAngle = Math.random() * Math.PI * 2;

            // Draw crease line
            for (let j = 0; j < creaseLength; j++) {
                const cx = creaseX + Math.cos(creaseAngle) * j;
                const cy = creaseY + Math.sin(creaseAngle) * j;

                if (cx >= x && cx < x + width && cy >= y && cy < y + height) {
                    const idx = (Math.floor(cy) * imgWidth + Math.floor(cx)) * 4;
                    const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                    if (currentColor !== 0) {
                        image.bitmap.data[idx] = (creaseColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (creaseColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = creaseColor & 0xFF;
                    }
                }
            }
        }
    }

    /**
     * Add grain texture
     */
    async addGrainTexture(image, x, y, width, height, grainColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        // Add grain particles
        for (let i = 0; i < 20; i++) {
            const grainX = x + Math.floor(Math.random() * width);
            const grainY = y + Math.floor(Math.random() * height);
            const grainSize = Math.floor(1 + Math.random() * 2);

            this.utils.drawEllipse(image, grainX, grainY, grainSize, grainSize, grainColor);
        }
    }

    /**
     * Add coin texture
     */
    async addCoinTexture(image, x, y, width, height, coinColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        // Add coin shapes
        for (let i = 0; i < 15; i++) {
            const coinX = x + Math.floor(Math.random() * width);
            const coinY = y + Math.floor(Math.random() * height);
            const coinSize = Math.floor(2 + Math.random() * 3);

            this.utils.drawEllipse(image, coinX, coinY, coinSize, coinSize, coinColor);
        }
    }

    /**
     * Add gem texture
     */
    async addGemTexture(image, x, y, width, height, gemColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        // Add gem sparkles
        for (let i = 0; i < 12; i++) {
            const gemX = x + Math.floor(Math.random() * width);
            const gemY = y + Math.floor(Math.random() * height);
            const gemSize = Math.floor(1 + Math.random() * 2);

            this.utils.drawEllipse(image, gemX, gemY, gemSize, gemSize, gemColor);

            // Add sparkle effect
            if (Math.random() < 0.5) {
                const sparkleColor = this.utils.adjustBrightness(gemColor, 50);
                this.utils.drawEllipse(image, gemX - 1, gemY - 1, 1, 1, sparkleColor);
            }
        }
    }

    /**
     * Add sack details
     */
    async addSackDetails(image, centerX, y, width, height, materialData, fabric) {
        // Add stitching details
        const stitchColor = this.utils.adjustBrightness(materialData.baseColor, -30);

        // Top stitching
        this.utils.drawRectangle(image, centerX - width * 0.4, y + 3, width * 0.8, 1, stitchColor);

        // Side stitching
        this.utils.drawRectangle(image, centerX - width * 0.45, y + 10, 1, height * 0.6, stitchColor);
        this.utils.drawRectangle(image, centerX + width * 0.45, y + 10, 1, height * 0.6, stitchColor);
    }

    /**
     * Add box lid
     */
    async addBoxLid(image, x, y, width, height, materialData, material) {
        // Add lid as separate piece
        this.utils.drawRectangle(image, x + 2, y - 5, width - 4, 8, materialData.accentColor);

        // Add lid texture
        if (material === 'wood') {
            await this.addWoodGrainTexture(image, x + 2, y - 5, width - 4, 8, materialData.accentColor);
        }
    }

    /**
     * Add jewelry decorations
     */
    async addJewelryDecorations(image, x, y, width, height, materialData) {
        const jewelColor = '#9370DB';

        // Add gem-like decorations
        for (let i = 0; i < 6; i++) {
            const jewelX = x + width * (0.2 + i * 0.15);
            const jewelY = y + height * 0.2;
            const jewelSize = 3;

            this.utils.drawEllipse(image, jewelX, jewelY, jewelSize, jewelSize, jewelColor);
        }
    }

    /**
     * Add document decorations
     */
    async addDocumentDecorations(image, x, y, width, height, materialData) {
        const paperColor = '#F5F5DC';

        // Add paper-like texture
        this.utils.drawRectangle(image, x + 5, y + 5, width - 10, height - 10, paperColor);
    }

    /**
     * Add tool decorations
     */
    async addToolDecorations(image, x, y, width, height, materialData) {
        const toolColor = '#696969';

        // Add tool-like markings
        for (let i = 0; i < 4; i++) {
            const toolX = x + width * (0.15 + i * 0.2);
            const toolY = y + height * 0.3;

            this.utils.drawRectangle(image, toolX, toolY, 4, 8, toolColor);
        }
    }

    /**
     * Add ornamental decorations
     */
    async addOrnamentalDecorations(image, x, y, width, height, materialData) {
        const goldColor = '#FFD700';

        // Add ornate patterns
        for (let i = 0; i < 8; i++) {
            const patternX = x + Math.floor(Math.random() * width);
            const patternY = y + Math.floor(Math.random() * height);
            const patternSize = Math.floor(2 + Math.random() * 3);

            this.utils.drawEllipse(image, patternX, patternY, patternSize, patternSize, goldColor);
        }
    }

    /**
     * Add metal texture
     */
    async addMetalTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const highlightColor = this.utils.adjustBrightness(baseColor, 30);
        const shadowColor = this.utils.adjustBrightness(baseColor, -20);

        // Add metallic highlights and shadows
        for (let gy = y; gy < y + height; gy++) {
            for (let gx = x; gx < x + width; gx++) {
                if (gx >= 0 && gx < imgWidth && gy >= 0 && gy < imgHeight) {
                    const idx = (gy * imgWidth + gx) * 4;
                    const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                    if (currentColor !== 0) {
                        // Add random metallic variations
                        if (Math.random() < 0.1) {
                            const metalColor = Math.random() < 0.5 ? highlightColor : shadowColor;
                            image.bitmap.data[idx] = (metalColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (metalColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = metalColor & 0xFF;
                        }
                    }
                }
            }
        }
    }

    /**
     * Add ceramic texture
     */
    async addCeramicTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const glazeColor = this.utils.adjustBrightness(baseColor, 20);

        // Add ceramic glaze effect
        for (let gy = y; gy < y + height; gy++) {
            for (let gx = x; gx < x + width; gx++) {
                if (gx >= 0 && gx < imgWidth && gy >= 0 && gy < imgHeight && Math.random() < 0.05) {
                    const idx = (gy * imgWidth + gx) * 4;
                    const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                    if (currentColor !== 0) {
                        image.bitmap.data[idx] = (glazeColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (glazeColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = glazeColor & 0xFF;
                    }
                }
            }
        }
    }

    /**
     * Add precious texture
     */
    async addPreciousTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const sparkleColor = '#FFFFFF';

        // Add precious gem-like sparkles
        for (let i = 0; i < 15; i++) {
            const sparkleX = x + Math.floor(Math.random() * width);
            const sparkleY = y + Math.floor(Math.random() * height);

            if (sparkleX >= 0 && sparkleX < imgWidth && sparkleY >= 0 && sparkleY < imgHeight) {
                const idx = (sparkleY * imgWidth + sparkleX) * 4;
                const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                if (currentColor !== 0) {
                    image.bitmap.data[idx] = (sparkleColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (sparkleColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = sparkleColor & 0xFF;
                }
            }
        }
    }

    /**
     * Fill irregular shape using scanline algorithm
     */
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

module.exports = ContainersGenerator;
