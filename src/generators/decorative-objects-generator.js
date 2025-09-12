/**
 * Decorative Objects Generator - Paintings, statues, vases, lanterns
 * Handles generation of decorative and ornamental objects with artistic details
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class DecorativeObjectsGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Decorative objects database
        this.decorativeDatabase = {
            painting: {
                name: 'Painting',
                styles: ['portrait', 'landscape', 'abstract', 'still_life', 'historical'],
                frames: ['wooden', 'gold', 'simple', 'ornate', 'modern'],
                sizes: ['small', 'medium', 'large', 'grand'],
                colors: {
                    wooden: {
                        frameColor: '#8B4513',
                        accentColor: '#D2691E',
                        canvasColor: '#FFFFFF'
                    },
                    gold: {
                        frameColor: '#FFD700',
                        accentColor: '#FFA500',
                        canvasColor: '#F5F5DC'
                    },
                    simple: {
                        frameColor: '#696969',
                        accentColor: '#C0C0C0',
                        canvasColor: '#FFFFFF'
                    },
                    ornate: {
                        frameColor: '#DAA520',
                        accentColor: '#FFD700',
                        canvasColor: '#F0F8FF'
                    },
                    modern: {
                        frameColor: '#FFFFFF',
                        accentColor: '#F5F5F5',
                        canvasColor: '#000000'
                    }
                }
            },
            statue: {
                name: 'Statue',
                types: ['humanoid', 'animal', 'abstract', 'bust', 'figurine'],
                materials: ['stone', 'bronze', 'marble', 'wood', 'crystal'],
                poses: ['standing', 'sitting', 'kneeling', 'reclining', 'dynamic'],
                materials: {
                    stone: {
                        baseColor: '#708090',
                        accentColor: '#778899',
                        detailColor: '#696969'
                    },
                    bronze: {
                        baseColor: '#CD853F',
                        accentColor: '#D2691E',
                        detailColor: '#8B4513'
                    },
                    marble: {
                        baseColor: '#F5F5F5',
                        accentColor: '#E6E6FA',
                        detailColor: '#D3D3D3'
                    },
                    wood: {
                        baseColor: '#8B4513',
                        accentColor: '#D2691E',
                        detailColor: '#654321'
                    },
                    crystal: {
                        baseColor: '#E6E6FA',
                        accentColor: '#F0F8FF',
                        detailColor: '#B0C4DE'
                    }
                }
            },
            vase: {
                name: 'Vase',
                shapes: ['cylindrical', 'bulbous', 'flared', 'narrow', 'urn'],
                materials: ['ceramic', 'porcelain', 'crystal', 'metal', 'stone'],
                decorations: ['plain', 'painted', 'engraved', 'gilded', 'textured'],
                materials: {
                    ceramic: {
                        baseColor: '#F4A460',
                        accentColor: '#D2691E',
                        contentColor: '#4169E1'
                    },
                    porcelain: {
                        baseColor: '#FFFFFF',
                        accentColor: '#F5F5F5',
                        contentColor: '#FF6347'
                    },
                    crystal: {
                        baseColor: '#E6E6FA',
                        accentColor: '#F0F8FF',
                        contentColor: '#9370DB'
                    },
                    metal: {
                        baseColor: '#C0C0C0',
                        accentColor: '#FFD700',
                        contentColor: '#228B22'
                    },
                    stone: {
                        baseColor: '#708090',
                        accentColor: '#778899',
                        contentColor: '#DAA520'
                    }
                }
            },
            lantern: {
                name: 'Lantern',
                types: ['hanging', 'standing', 'table', 'street', 'decorative'],
                materials: ['metal', 'glass', 'paper', 'wood', 'stone'],
                lights: ['candle', 'oil', 'electric', 'magical', 'none'],
                materials: {
                    metal: {
                        frameColor: '#696969',
                        glassColor: '#E6E6FA',
                        lightColor: '#FFD700'
                    },
                    glass: {
                        frameColor: '#C0C0C0',
                        glassColor: '#F0F8FF',
                        lightColor: '#FFFF00'
                    },
                    paper: {
                        frameColor: '#D2691E',
                        glassColor: '#F5F5DC',
                        lightColor: '#FFA500'
                    },
                    wood: {
                        frameColor: '#8B4513',
                        glassColor: '#E6E6FA',
                        lightColor: '#FFD700'
                    },
                    stone: {
                        frameColor: '#708090',
                        glassColor: '#F0F8FF',
                        lightColor: '#FFFF00'
                    }
                }
            },
            mirror: {
                name: 'Mirror',
                shapes: ['rectangular', 'round', 'oval', 'arch', 'irregular'],
                frames: ['wooden', 'metal', 'stone', 'ornate', 'simple'],
                sizes: ['small', 'medium', 'large', 'grand'],
                frames: {
                    wooden: {
                        frameColor: '#8B4513',
                        accentColor: '#D2691E',
                        glassColor: '#F0F8FF'
                    },
                    metal: {
                        frameColor: '#C0C0C0',
                        accentColor: '#FFD700',
                        glassColor: '#E6E6FA'
                    },
                    stone: {
                        frameColor: '#708090',
                        accentColor: '#778899',
                        glassColor: '#F0F8FF'
                    },
                    ornate: {
                        frameColor: '#FFD700',
                        accentColor: '#FFA500',
                        glassColor: '#E6E6FA'
                    },
                    simple: {
                        frameColor: '#FFFFFF',
                        accentColor: '#F5F5F5',
                        glassColor: '#F0F8FF'
                    }
                }
            },
            candle_holder: {
                name: 'Candle Holder',
                types: ['single', 'multi', 'wall', 'table', 'standing'],
                materials: ['metal', 'crystal', 'wood', 'stone', 'ceramic'],
                styles: ['simple', 'ornate', 'antique', 'modern', 'rustic'],
                materials: {
                    metal: {
                        baseColor: '#C0C0C0',
                        accentColor: '#FFD700',
                        flameColor: '#FFFF00'
                    },
                    crystal: {
                        baseColor: '#E6E6FA',
                        accentColor: '#F0F8FF',
                        flameColor: '#FFA500'
                    },
                    wood: {
                        baseColor: '#8B4513',
                        accentColor: '#D2691E',
                        flameColor: '#FFD700'
                    },
                    stone: {
                        baseColor: '#708090',
                        accentColor: '#778899',
                        flameColor: '#FFFF00'
                    },
                    ceramic: {
                        baseColor: '#F4A460',
                        accentColor: '#D2691E',
                        flameColor: '#FFA500'
                    }
                }
            },
            clock: {
                name: 'Clock',
                types: ['wall', 'mantle', 'grandfather', 'table', 'pocket'],
                styles: ['antique', 'modern', 'ornate', 'simple', 'industrial'],
                mechanisms: ['mechanical', 'quartz', 'digital', 'sundial', 'hourglass'],
                materials: {
                    antique: {
                        caseColor: '#8B4513',
                        faceColor: '#FFFFFF',
                        handColor: '#000000'
                    },
                    modern: {
                        caseColor: '#FFFFFF',
                        faceColor: '#F5F5F5',
                        handColor: '#000000'
                    },
                    ornate: {
                        caseColor: '#FFD700',
                        faceColor: '#F0F8FF',
                        handColor: '#8B0000'
                    },
                    simple: {
                        caseColor: '#696969',
                        faceColor: '#FFFFFF',
                        handColor: '#000000'
                    },
                    industrial: {
                        caseColor: '#2F4F4F',
                        faceColor: '#FFFFFF',
                        handColor: '#FFD700'
                    }
                }
            }
        };

        // Animation frames for interactive decorative objects
        this.animationFrames = {
            lantern: 4,
            candle_holder: 6,
            clock: 12,
            painting: 2,
            statue: 3,
            vase: 2,
            mirror: 2
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine decorative object type and generate accordingly
        const objectType = config.objectType || 'painting';
        const subType = config.subType || 'portrait';

        switch (objectType) {
            case 'painting':
                await this.generatePainting(image, config);
                break;
            case 'statue':
                await this.generateStatue(image, config);
                break;
            case 'vase':
                await this.generateVase(image, config);
                break;
            case 'lantern':
                await this.generateLantern(image, config);
                break;
            case 'mirror':
                await this.generateMirror(image, config);
                break;
            case 'candle_holder':
                await this.generateCandleHolder(image, config);
                break;
            case 'clock':
                await this.generateClock(image, config);
                break;
            default:
                await this.generatePainting(image, config);
        }
    }

    /**
     * Generate painting
     */
    async generatePainting(image, config) {
        const { width, height } = image.bitmap;
        const style = config.paintingStyle || 'portrait';
        const frame = config.paintingFrame || 'wooden';
        const size = config.paintingSize || 'medium';

        const paintingData = this.decorativeDatabase.painting;
        const materialData = paintingData.colors[frame];

        // Calculate painting dimensions
        const sizeMultiplier = { small: 0.6, medium: 1.0, large: 1.4, grand: 1.8 };
        const multiplier = sizeMultiplier[size];

        const paintingWidth = Math.floor(80 * multiplier);
        const paintingHeight = Math.floor(60 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const paintingY = Math.floor(height - paintingHeight - 10);

        // Generate frame
        await this.generatePaintingFrame(image, centerX, paintingY, paintingWidth, paintingHeight, materialData, frame);

        // Generate canvas
        await this.generateCanvas(image, centerX, paintingY, paintingWidth, paintingHeight, materialData);

        // Generate painting content based on style
        await this.generatePaintingContent(image, centerX, paintingY, paintingWidth, paintingHeight, style);

        // Add shadow
        await this.addDecorativeShadow(image, centerX - paintingWidth * 0.5, paintingY, paintingWidth, paintingHeight);
    }

    /**
     * Generate painting frame
     */
    async generatePaintingFrame(image, centerX, y, width, height, materialData, frame) {
        const frameThickness = Math.floor(width * 0.08);

        // Outer frame
        this.utils.drawRectangle(image, centerX - width * 0.5 - frameThickness, y - frameThickness,
                               width + frameThickness * 2, height + frameThickness * 2, materialData.frameColor);

        // Inner frame
        this.utils.drawRectangle(image, centerX - width * 0.5 - frameThickness * 0.5, y - frameThickness * 0.5,
                               width + frameThickness, height + frameThickness, materialData.accentColor);

        // Add decorative elements based on frame type
        if (frame === 'ornate' || frame === 'gold') {
            await this.addOrnateFrameDetails(image, centerX, y, width, height, frameThickness, materialData);
        }
    }

    /**
     * Generate canvas
     */
    async generateCanvas(image, centerX, y, width, height, materialData) {
        // Canvas background
        this.utils.drawRectangle(image, centerX - width * 0.5, y, width, height, materialData.canvasColor);

        // Add canvas texture
        await this.addCanvasTexture(image, centerX - width * 0.5, y, width, height, materialData.canvasColor);
    }

    /**
     * Generate painting content
     */
    async generatePaintingContent(image, centerX, y, width, height, style) {
        const contentX = centerX - width * 0.5;
        const contentY = y;

        switch (style) {
            case 'portrait':
                await this.generatePortrait(image, contentX, contentY, width, height);
                break;
            case 'landscape':
                await this.generateLandscape(image, contentX, contentY, width, height);
                break;
            case 'abstract':
                await this.generateAbstract(image, contentX, contentY, width, height);
                break;
            case 'still_life':
                await this.generateStillLife(image, contentX, contentY, width, height);
                break;
            case 'historical':
                await this.generateHistorical(image, contentX, contentY, width, height);
                break;
        }
    }

    /**
     * Generate statue
     */
    async generateStatue(image, config) {
        const { width, height } = image.bitmap;
        const type = config.statueType || 'humanoid';
        const material = config.statueMaterial || 'stone';
        const pose = config.statuePose || 'standing';

        const statueData = this.decorativeDatabase.statue;
        const materialData = statueData.materials[material];

        // Calculate statue dimensions
        const statueWidth = Math.floor(40 + Math.random() * 30);
        const statueHeight = Math.floor(80 + Math.random() * 40);
        const centerX = Math.floor(width * 0.5);
        const statueY = Math.floor(height - statueHeight - 5);

        // Generate statue base
        await this.generateStatueBase(image, centerX, statueY, statueWidth, statueHeight, materialData);

        // Generate statue figure based on type
        await this.generateStatueFigure(image, centerX, statueY, statueWidth, statueHeight, materialData, type, pose);

        // Add material-specific details
        await this.addMaterialDetails(image, centerX, statueY, statueWidth, statueHeight, materialData, material);

        // Add shadow
        await this.addDecorativeShadow(image, centerX - statueWidth * 0.5, statueY, statueWidth, statueHeight);
    }

    /**
     * Generate statue base
     */
    async generateStatueBase(image, centerX, y, width, height, materialData) {
        const baseHeight = Math.floor(height * 0.15);
        const baseY = y + height - baseHeight;

        // Base platform
        this.utils.drawRectangle(image, centerX - width * 0.6, baseY, width * 1.2, baseHeight, materialData.baseColor);

        // Base details
        this.utils.drawRectangle(image, centerX - width * 0.55, baseY + baseHeight * 0.2, width * 1.1, baseHeight * 0.6, materialData.accentColor);
    }

    /**
     * Generate statue figure
     */
    async generateStatueFigure(image, centerX, y, width, height, materialData, type, pose) {
        const figureHeight = Math.floor(height * 0.8);
        const figureY = y + height * 0.05;

        switch (type) {
            case 'humanoid':
                await this.generateHumanoidStatue(image, centerX, figureY, width, figureHeight, materialData, pose);
                break;
            case 'animal':
                await this.generateAnimalStatue(image, centerX, figureY, width, figureHeight, materialData, pose);
                break;
            case 'abstract':
                await this.generateAbstractStatue(image, centerX, figureY, width, figureHeight, materialData, pose);
                break;
            case 'bust':
                await this.generateBustStatue(image, centerX, figureY, width, figureHeight, materialData);
                break;
            case 'figurine':
                await this.generateFigurineStatue(image, centerX, figureY, width, figureHeight, materialData);
                break;
        }
    }

    /**
     * Generate vase
     */
    async generateVase(image, config) {
        const { width, height } = image.bitmap;
        const shape = config.vaseShape || 'cylindrical';
        const material = config.vaseMaterial || 'ceramic';
        const decoration = config.vaseDecoration || 'plain';

        const vaseData = this.decorativeDatabase.vase;
        const materialData = vaseData.materials[material];

        // Calculate vase dimensions
        const vaseWidth = Math.floor(30 + Math.random() * 20);
        const vaseHeight = Math.floor(60 + Math.random() * 30);
        const centerX = Math.floor(width * 0.5);
        const vaseY = Math.floor(height - vaseHeight - 5);

        // Generate vase body
        await this.generateVaseBody(image, centerX, vaseY, vaseWidth, vaseHeight, materialData, shape);

        // Add contents
        await this.addVaseContents(image, centerX, vaseY, vaseWidth, vaseHeight, materialData);

        // Add decorations
        if (decoration !== 'plain') {
            await this.addVaseDecorations(image, centerX, vaseY, vaseWidth, vaseHeight, materialData, decoration);
        }

        // Add shadow
        await this.addDecorativeShadow(image, centerX - vaseWidth * 0.5, vaseY, vaseWidth, vaseHeight);
    }

    /**
     * Generate vase body
     */
    async generateVaseBody(image, centerX, y, width, height, materialData, shape) {
        const segments = 6;

        for (let i = 0; i < segments; i++) {
            const segmentY = y + (i * height) / segments;
            const segmentHeight = height / segments + 1;

            let segmentWidth;
            switch (shape) {
                case 'cylindrical':
                    segmentWidth = width;
                    break;
                case 'bulbous':
                    segmentWidth = width * (0.8 + 0.4 * Math.sin((i / segments) * Math.PI));
                    break;
                case 'flared':
                    segmentWidth = width * (0.6 + 0.8 * (i / segments));
                    break;
                case 'narrow':
                    segmentWidth = width * (0.9 - 0.3 * (i / segments));
                    break;
                case 'urn':
                    segmentWidth = width * (0.7 + 0.6 * Math.sin((i / segments) * Math.PI * 2));
                    break;
                default:
                    segmentWidth = width;
            }

            this.utils.drawEllipse(image, centerX, segmentY, segmentWidth * 0.5, segmentHeight * 0.5, materialData.baseColor);
        }

        // Add material texture
        await this.addMaterialTexture(image, centerX - width * 0.5, y, width, height, materialData.baseColor, 'ceramic');
    }

    /**
     * Generate lantern
     */
    async generateLantern(image, config) {
        const { width, height } = image.bitmap;
        const type = config.lanternType || 'hanging';
        const material = config.lanternMaterial || 'metal';
        const light = config.lanternLight || 'candle';

        const lanternData = this.decorativeDatabase.lantern;
        const materialData = lanternData.materials[material];

        // Calculate lantern dimensions
        const lanternWidth = Math.floor(25 + Math.random() * 15);
        const lanternHeight = Math.floor(40 + Math.random() * 20);
        const centerX = Math.floor(width * 0.5);
        const lanternY = Math.floor(height - lanternHeight - 5);

        // Generate lantern frame
        await this.generateLanternFrame(image, centerX, lanternY, lanternWidth, lanternHeight, materialData, type);

        // Generate lantern glass/panels
        await this.generateLanternGlass(image, centerX, lanternY, lanternWidth, lanternHeight, materialData);

        // Add light source
        if (light !== 'none') {
            await this.addLanternLight(image, centerX, lanternY, lanternWidth, lanternHeight, materialData, light);
        }

        // Add hanging mechanism if applicable
        if (type === 'hanging') {
            await this.addHangingMechanism(image, centerX, lanternY, lanternWidth, materialData);
        }

        // Add shadow
        await this.addDecorativeShadow(image, centerX - lanternWidth * 0.5, lanternY, lanternWidth, lanternHeight);
    }

    /**
     * Generate lantern frame
     */
    async generateLanternFrame(image, centerX, y, width, height, materialData, type) {
        // Frame structure
        this.utils.drawRectangle(image, centerX - width * 0.5, y, width, height, materialData.frameColor);

        // Frame details
        const detailHeight = Math.floor(height * 0.1);
        for (let i = 0; i < 4; i++) {
            const detailY = y + (i + 1) * (height * 0.75) / 4;
            this.utils.drawRectangle(image, centerX - width * 0.4, detailY, width * 0.8, detailHeight, materialData.frameColor);
        }
    }

    /**
     * Generate lantern glass
     */
    async generateLanternGlass(image, centerX, y, width, height, materialData) {
        const glassWidth = Math.floor(width * 0.7);
        const glassHeight = Math.floor(height * 0.6);
        const glassX = centerX - glassWidth * 0.5;
        const glassY = y + height * 0.15;

        // Glass panels
        this.utils.drawRectangle(image, glassX, glassY, glassWidth, glassHeight, materialData.glassColor);

        // Glass frame
        this.utils.drawRectangle(image, glassX - 1, glassY - 1, glassWidth + 2, glassHeight + 2, materialData.frameColor);
    }

    /**
     * Generate mirror
     */
    async generateMirror(image, config) {
        const { width, height } = image.bitmap;
        const shape = config.mirrorShape || 'rectangular';
        const frame = config.mirrorFrame || 'wooden';
        const size = config.mirrorSize || 'medium';

        const mirrorData = this.decorativeDatabase.mirror;
        const materialData = mirrorData.frames[frame];

        // Calculate mirror dimensions
        const sizeMultiplier = { small: 0.6, medium: 1.0, large: 1.4, grand: 1.8 };
        const multiplier = sizeMultiplier[size];

        const mirrorWidth = Math.floor(60 * multiplier);
        const mirrorHeight = Math.floor(80 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const mirrorY = Math.floor(height - mirrorHeight - 5);

        // Generate mirror frame
        await this.generateMirrorFrame(image, centerX, mirrorY, mirrorWidth, mirrorHeight, materialData, frame, shape);

        // Generate mirror glass
        await this.generateMirrorGlass(image, centerX, mirrorY, mirrorWidth, mirrorHeight, materialData, shape);

        // Add frame decorations
        await this.addFrameDecorations(image, centerX, mirrorY, mirrorWidth, mirrorHeight, materialData, frame);

        // Add shadow
        await this.addDecorativeShadow(image, centerX - mirrorWidth * 0.5, mirrorY, mirrorWidth, mirrorHeight);
    }

    /**
     * Generate mirror frame
     */
    async generateMirrorFrame(image, centerX, y, width, height, materialData, frame, shape) {
        const frameThickness = Math.floor(width * 0.08);

        if (shape === 'round') {
            // Circular frame
            const radius = Math.max(width, height) * 0.5 + frameThickness;
            this.utils.drawEllipse(image, centerX, y + height * 0.5, radius, radius, materialData.frameColor);
        } else {
            // Rectangular frame
            this.utils.drawRectangle(image, centerX - width * 0.5 - frameThickness, y - frameThickness,
                                   width + frameThickness * 2, height + frameThickness * 2, materialData.frameColor);
        }
    }

    /**
     * Generate mirror glass
     */
    async generateMirrorGlass(image, centerX, y, width, height, materialData, shape) {
        if (shape === 'round') {
            // Circular glass
            this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.45, height * 0.45, materialData.glassColor);
        } else {
            // Rectangular glass
            this.utils.drawRectangle(image, centerX - width * 0.45, y + height * 0.05, width * 0.9, height * 0.9, materialData.glassColor);
        }

        // Add reflection effect
        await this.addMirrorReflection(image, centerX - width * 0.45, y + height * 0.05, width * 0.9, height * 0.9, materialData.glassColor);
    }

    /**
     * Generate candle holder
     */
    async generateCandleHolder(image, config) {
        const { width, height } = image.bitmap;
        const type = config.candleHolderType || 'single';
        const material = config.candleHolderMaterial || 'metal';
        const style = config.candleHolderStyle || 'simple';

        const candleData = this.decorativeDatabase.candle_holder;
        const materialData = candleData.materials[material];

        // Calculate candle holder dimensions
        const holderWidth = Math.floor(20 + Math.random() * 15);
        const holderHeight = Math.floor(30 + Math.random() * 20);
        const centerX = Math.floor(width * 0.5);
        const holderY = Math.floor(height - holderHeight - 5);

        // Generate holder base
        await this.generateHolderBase(image, centerX, holderY, holderWidth, holderHeight, materialData, type);

        // Generate candle(s)
        await this.generateCandles(image, centerX, holderY, holderWidth, holderHeight, materialData, type);

        // Add flame effects
        await this.addFlameEffects(image, centerX, holderY, holderWidth, holderHeight, materialData, type);

        // Add shadow
        await this.addDecorativeShadow(image, centerX - holderWidth * 0.5, holderY, holderWidth, holderHeight);
    }

    /**
     * Generate clock
     */
    async generateClock(image, config) {
        const { width, height } = image.bitmap;
        const type = config.clockType || 'wall';
        const style = config.clockStyle || 'antique';
        const mechanism = config.clockMechanism || 'mechanical';

        const clockData = this.decorativeDatabase.clock;
        const materialData = clockData.materials[style];

        // Calculate clock dimensions
        const clockWidth = Math.floor(40 + Math.random() * 20);
        const clockHeight = Math.floor(40 + Math.random() * 20);
        const centerX = Math.floor(width * 0.5);
        const clockY = Math.floor(height - clockHeight - 5);

        // Generate clock case
        await this.generateClockCase(image, centerX, clockY, clockWidth, clockHeight, materialData, type, style);

        // Generate clock face
        await this.generateClockFace(image, centerX, clockY, clockWidth, clockHeight, materialData);

        // Generate clock hands
        await this.generateClockHands(image, centerX, clockY, clockWidth, clockHeight, materialData);

        // Add mechanism details
        await this.addMechanismDetails(image, centerX, clockY, clockWidth, clockHeight, materialData, mechanism);

        // Add shadow
        await this.addDecorativeShadow(image, centerX - clockWidth * 0.5, clockY, clockWidth, clockHeight);
    }

    /**
     * Generate clock case
     */
    async generateClockCase(image, centerX, y, width, height, materialData, type, style) {
        // Clock case
        this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.5, height * 0.5, materialData.caseColor);

        // Case details based on style
        if (style === 'ornate') {
            await this.addOrnateClockDetails(image, centerX, y, width, height, materialData);
        } else if (style === 'antique') {
            await this.addAntiqueClockDetails(image, centerX, y, width, height, materialData);
        }
    }

    /**
     * Generate clock face
     */
    async generateClockFace(image, centerX, y, width, height, materialData) {
        const faceRadius = Math.floor(width * 0.35);

        // Clock face
        this.utils.drawEllipse(image, centerX, y + height * 0.5, faceRadius, faceRadius, materialData.faceColor);

        // Hour markers
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12 - Math.PI * 0.5;
            const markerX = centerX + Math.cos(angle) * faceRadius * 0.9;
            const markerY = y + height * 0.5 + Math.sin(angle) * faceRadius * 0.9;

            this.utils.drawRectangle(image, markerX - 1, markerY - 1, 2, 2, materialData.handColor);
        }

        // Minute markers
        for (let i = 0; i < 60; i++) {
            if (i % 5 !== 0) { // Skip hour markers
                const angle = (i * Math.PI * 2) / 60 - Math.PI * 0.5;
                const markerX = centerX + Math.cos(angle) * faceRadius * 0.95;
                const markerY = y + height * 0.5 + Math.sin(angle) * faceRadius * 0.95;

                this.utils.drawRectangle(image, markerX, markerY, 1, 1, materialData.handColor);
            }
        }
    }

    /**
     * Generate clock hands
     */
    async generateClockHands(image, centerX, y, width, height, materialData) {
        const centerY = y + height * 0.5;
        const faceRadius = Math.floor(width * 0.35);

        // Hour hand
        const hourAngle = -Math.PI * 0.5 + Math.PI * 0.3; // 3 o'clock position
        const hourLength = faceRadius * 0.5;
        const hourEndX = centerX + Math.cos(hourAngle) * hourLength;
        const hourEndY = centerY + Math.sin(hourAngle) * hourLength;

        await this.drawClockHand(image, centerX, centerY, hourEndX, hourEndY, materialData.handColor, 2);

        // Minute hand
        const minuteAngle = -Math.PI * 0.5 + Math.PI * 0.1; // 12:30 position
        const minuteLength = faceRadius * 0.7;
        const minuteEndX = centerX + Math.cos(minuteAngle) * minuteLength;
        const minuteEndY = centerY + Math.sin(minuteAngle) * minuteLength;

        await this.drawClockHand(image, centerX, centerY, minuteEndX, minuteEndY, materialData.handColor, 1);

        // Second hand
        const secondAngle = -Math.PI * 0.5 - Math.PI * 0.2; // 8 o'clock position
        const secondLength = faceRadius * 0.8;
        const secondEndX = centerX + Math.cos(secondAngle) * secondLength;
        const secondEndY = centerY + Math.sin(secondAngle) * secondLength;

        await this.drawClockHand(image, centerX, centerY, secondEndX, secondEndY, '#FF0000', 1);
    }

    /**
     * Draw clock hand
     */
    async drawClockHand(image, startX, startY, endX, endY, color, thickness) {
        const { width, height } = image.bitmap;
        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const steps = Math.floor(distance);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;

            if (x >= 0 && x < width && y >= 0 && y < height) {
                for (let dx = -thickness; dx <= thickness; dx++) {
                    for (let dy = -thickness; dy <= thickness; dy++) {
                        const pixelX = Math.floor(x) + dx;
                        const pixelY = Math.floor(y) + dy;

                        if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                            const idx = (pixelY * width + pixelX) * 4;
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

    /**
     * Helper methods for textures and details
     */
    async addCanvasTexture(image, x, y, width, height, baseColor) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const weaveColor = this.utils.adjustBrightness(baseColor, -10);

        for (let gy = y; gy < y + height; gy += 2) {
            if (gy >= 0 && gy < imgHeight) {
                for (let gx = x; gx < x + width; gx += 2) {
                    if (gx >= 0 && gx < imgWidth && Math.random() < 0.15) {
                        const idx = (gy * imgWidth + gx) * 4;
                        image.bitmap.data[idx] = (weaveColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (weaveColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = weaveColor & 0xFF;
                    }
                }
            }
        }
    }

    async addMaterialTexture(image, x, y, width, height, baseColor, material) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        switch (material) {
            case 'ceramic':
                const glazeColor = this.utils.adjustBrightness(baseColor, 15);
                for (let gy = y; gy < y + height; gy++) {
                    for (let gx = x; gx < x + width; gx++) {
                        if (gx >= 0 && gx < imgWidth && gy >= 0 && gy < imgHeight && Math.random() < 0.08) {
                            const idx = (gy * imgWidth + gx) * 4;
                            image.bitmap.data[idx] = (glazeColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (glazeColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = glazeColor & 0xFF;
                        }
                    }
                }
                break;
        }
    }

    async addDecorativeShadow(image, x, y, width, height) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const shadowOffset = Math.floor(width * 0.02);

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

    // Additional helper methods would be implemented here for the remaining decorative object details
    async addOrnateFrameDetails(image, centerX, y, width, height, frameThickness, materialData) {}
    async generatePortrait(image, contentX, contentY, width, height) {}
    async generateLandscape(image, contentX, contentY, width, height) {}
    async generateAbstract(image, contentX, contentY, width, height) {}
    async generateStillLife(image, contentX, contentY, width, height) {}
    async generateHistorical(image, contentX, contentY, width, height) {}
    async generateStatueBase(image, centerX, y, width, height, materialData) {}
    async generateHumanoidStatue(image, centerX, figureY, width, figureHeight, materialData, pose) {}
    async generateAnimalStatue(image, centerX, figureY, width, figureHeight, materialData, pose) {}
    async generateAbstractStatue(image, centerX, figureY, width, figureHeight, materialData, pose) {}
    async generateBustStatue(image, centerX, figureY, width, figureHeight, materialData) {}
    async generateFigurineStatue(image, centerX, figureY, width, figureHeight, materialData) {}
    async addMaterialDetails(image, centerX, y, width, height, materialData, material) {}
    async addVaseContents(image, centerX, y, width, height, materialData) {}
    async addVaseDecorations(image, centerX, y, width, height, materialData, decoration) {}
    async generateLanternFrame(image, centerX, y, width, height, materialData, type) {}
    async generateLanternGlass(image, centerX, y, width, height, materialData) {}
    async addLanternLight(image, centerX, y, width, height, materialData, light) {}
    async addHangingMechanism(image, centerX, y, width, materialData) {}
    async generateMirrorFrame(image, centerX, y, width, height, materialData, frame, shape) {}
    async generateMirrorGlass(image, centerX, y, width, height, materialData, shape) {}
    async addMirrorReflection(image, x, y, width, height, glassColor) {}
    async addFrameDecorations(image, centerX, y, width, height, materialData, frame) {}
    async generateHolderBase(image, centerX, y, width, height, materialData, type) {}
    async generateCandles(image, centerX, y, width, height, materialData, type) {}
    async addFlameEffects(image, centerX, y, width, height, materialData, type) {}
    async generateClockCase(image, centerX, y, width, height, materialData, type, style) {}
    async generateClockFace(image, centerX, y, width, height, materialData) {}
    async generateClockHands(image, centerX, y, width, height, materialData) {}
    async addMechanismDetails(image, centerX, y, width, height, materialData, mechanism) {}
    async addOrnateClockDetails(image, centerX, y, width, height, materialData) {}
    async addAntiqueClockDetails(image, centerX, y, width, height, materialData) {}
}

module.exports = DecorativeObjectsGenerator;
