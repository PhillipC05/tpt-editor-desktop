/**
 * Rocks & Minerals Generator - Boulders, crystals, ore deposits, gemstones
 * Handles generation of geological and mineral assets with realistic textures and formations
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class RocksGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Boulder database
        this.boulderDatabase = {
            granite: {
                name: 'Granite Boulder',
                colors: ['#696969', '#708090', '#778899', '#2F4F4F'],
                texture: 'coarse',
                size: { min: 48, max: 96 },
                shape: 'irregular'
            },
            limestone: {
                name: 'Limestone Boulder',
                colors: ['#F5F5DC', '#FFFACD', '#FAFAD2', '#FFE4B5'],
                texture: 'smooth',
                size: { min: 40, max: 80 },
                shape: 'rounded'
            },
            sandstone: {
                name: 'Sandstone Boulder',
                colors: ['#DEB887', '#D2B48C', '#BC8F8F', '#F4A460'],
                texture: 'layered',
                size: { min: 52, max: 88 },
                shape: 'blocky'
            },
            basalt: {
                name: 'Basalt Boulder',
                colors: ['#2F2F2F', '#363636', '#1C1C1C', '#404040'],
                texture: 'rough',
                size: { min: 44, max: 92 },
                shape: 'angular'
            },
            marble: {
                name: 'Marble Boulder',
                colors: ['#FFFFFF', '#F8F8FF', '#F0F8FF', '#E6E6FA'],
                texture: 'veined',
                size: { min: 38, max: 76 },
                shape: 'smooth'
            }
        };

        // Crystal database
        this.crystalDatabase = {
            quartz: {
                name: 'Quartz Crystal',
                colors: ['#FFFFFF', '#F0F8FF', '#E6E6FA', '#DDA0DD'],
                facets: 6,
                glow: true,
                size: { min: 16, max: 48 }
            },
            amethyst: {
                name: 'Amethyst Crystal',
                colors: ['#9370DB', '#8A2BE2', '#9932CC', '#BA55D3'],
                facets: 8,
                glow: true,
                size: { min: 20, max: 52 }
            },
            ruby: {
                name: 'Ruby Crystal',
                colors: ['#DC143C', '#FF0000', '#B22222', '#8B0000'],
                facets: 12,
                glow: true,
                size: { min: 18, max: 46 }
            },
            emerald: {
                name: 'Emerald Crystal',
                colors: ['#006400', '#008000', '#228B22', '#32CD32'],
                facets: 10,
                glow: true,
                size: { min: 22, max: 50 }
            },
            sapphire: {
                name: 'Sapphire Crystal',
                colors: ['#000080', '#0000CD', '#191970', '#00008B'],
                facets: 8,
                glow: true,
                size: { min: 20, max: 48 }
            },
            diamond: {
                name: 'Diamond Crystal',
                colors: ['#F0F8FF', '#E6E6FA', '#FFFFFF', '#F5F5F5'],
                facets: 16,
                glow: true,
                size: { min: 14, max: 42 }
            }
        };

        // Ore database
        this.oreDatabase = {
            copper: {
                name: 'Copper Ore',
                baseColor: '#8B4513',
                veinColors: ['#B87333', '#CD853F', '#D2691E'],
                veinIntensity: 0.7,
                size: { min: 32, max: 64 }
            },
            iron: {
                name: 'Iron Ore',
                baseColor: '#696969',
                veinColors: ['#2F4F4F', '#556B2F', '#8B4513'],
                veinIntensity: 0.8,
                size: { min: 36, max: 68 }
            },
            gold: {
                name: 'Gold Ore',
                baseColor: '#8B4513',
                veinColors: ['#FFD700', '#FFA500', '#FF6347'],
                veinIntensity: 0.9,
                size: { min: 28, max: 56 }
            },
            silver: {
                name: 'Silver Ore',
                baseColor: '#696969',
                veinColors: ['#C0C0C0', '#A9A9A9', '#808080'],
                veinIntensity: 0.6,
                size: { min: 30, max: 60 }
            },
            mithril: {
                name: 'Mithril Ore',
                baseColor: '#F5F5F5',
                veinColors: ['#E6E6FA', '#DDA0DD', '#DA70D6'],
                veinIntensity: 0.5,
                size: { min: 24, max: 52 }
            },
            adamantite: {
                name: 'Adamantite Ore',
                baseColor: '#2F2F2F',
                veinColors: ['#FF4500', '#DC143C', '#B22222'],
                veinIntensity: 1.0,
                size: { min: 26, max: 58 }
            }
        };

        // Gemstone database
        this.gemDatabase = {
            ruby: {
                name: 'Ruby Gem',
                colors: ['#DC143C', '#FF0000', '#B22222'],
                cut: 'brilliant',
                size: { min: 8, max: 24 }
            },
            emerald: {
                name: 'Emerald Gem',
                colors: ['#006400', '#228B22', '#32CD32'],
                cut: 'emerald',
                size: { min: 10, max: 26 }
            },
            sapphire: {
                name: 'Sapphire Gem',
                colors: ['#000080', '#0000CD', '#191970'],
                cut: 'round',
                size: { min: 9, max: 25 }
            },
            diamond: {
                name: 'Diamond Gem',
                colors: ['#F0F8FF', '#E6E6FA', '#FFFFFF'],
                cut: 'princess',
                size: { min: 6, max: 20 }
            },
            amethyst: {
                name: 'Amethyst Gem',
                colors: ['#9370DB', '#8A2BE2', '#9932CC'],
                cut: 'oval',
                size: { min: 11, max: 27 }
            },
            topaz: {
                name: 'Topaz Gem',
                colors: ['#FFD700', '#FFA500', '#FF6347'],
                cut: 'pear',
                size: { min: 10, max: 26 }
            }
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine asset type and generate accordingly
        const assetType = config.assetType || 'boulder';
        const subType = config.subType || 'granite';

        switch (assetType) {
            case 'boulder':
                await this.generateBoulder(image, config);
                break;
            case 'crystal':
                await this.generateCrystal(image, config);
                break;
            case 'ore':
                await this.generateOre(image, config);
                break;
            case 'gem':
                await this.generateGem(image, config);
                break;
            default:
                await this.generateBoulder(image, config);
        }
    }

    /**
     * Generate boulder with realistic rock texture
     */
    async generateBoulder(image, config) {
        const { width, height } = image.bitmap;
        const boulderType = config.boulderType || 'granite';

        const boulderData = this.boulderDatabase[boulderType];
        if (!boulderData) return;

        const boulderColor = this.utils.getColor(boulderData.colors[Math.floor(Math.random() * boulderData.colors.length)]);
        const boulderSize = Math.floor(boulderData.size.min + Math.random() * (boulderData.size.max - boulderData.size.min));
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.6);

        // Generate irregular boulder shape
        await this.generateIrregularShape(image, centerX, centerY, boulderSize, boulderColor, boulderData.shape);

        // Apply texture based on boulder type
        switch (boulderData.texture) {
            case 'coarse':
                await this.applyCoarseTexture(image, boulderColor);
                break;
            case 'smooth':
                await this.applySmoothTexture(image, boulderColor);
                break;
            case 'layered':
                await this.applyLayeredTexture(image, boulderColor);
                break;
            case 'rough':
                await this.applyRoughTexture(image, boulderColor);
                break;
            case 'veined':
                await this.applyVeinedTexture(image, boulderColor);
                break;
        }

        // Add shadows and highlights
        await this.addRockLighting(image);
    }

    /**
     * Generate irregular rock shape
     */
    async generateIrregularShape(image, centerX, centerY, size, color, shape) {
        const { width, height } = image.bitmap;
        const numPoints = shape === 'rounded' ? 12 : shape === 'blocky' ? 8 : 16;

        // Generate irregular polygon points
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * 2 * Math.PI) / numPoints;
            const radius = size * (0.7 + Math.random() * 0.3); // Vary radius for irregularity
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            points.push({ x: Math.floor(x), y: Math.floor(y) });
        }

        // Fill the irregular shape
        await this.fillIrregularShape(image, points, color);
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

    /**
     * Generate crystal with facets and glow
     */
    async generateCrystal(image, config) {
        const { width, height } = image.bitmap;
        const crystalType = config.crystalType || 'quartz';

        const crystalData = this.crystalDatabase[crystalType];
        if (!crystalData) return;

        const crystalColor = this.utils.getColor(crystalData.colors[Math.floor(Math.random() * crystalData.colors.length)]);
        const crystalSize = Math.floor(crystalData.size.min + Math.random() * (crystalData.size.max - crystalData.size.min));
        const centerX = Math.floor(width * 0.5);
        const baseY = height - Math.floor(height * 0.1);

        // Generate crystal facets
        const facets = crystalData.facets;
        for (let i = 0; i < facets; i++) {
            const angle = (i * 2 * Math.PI) / facets;
            const nextAngle = ((i + 1) * 2 * Math.PI) / facets;

            // Top point
            const topX = centerX;
            const topY = baseY - crystalSize;

            // Base points
            const baseX1 = centerX + Math.cos(angle) * crystalSize * 0.5;
            const baseY1 = baseY;
            const baseX2 = centerX + Math.cos(nextAngle) * crystalSize * 0.5;
            const baseY2 = baseY;

            // Draw facet
            this.drawTriangle(image, topX, topY, baseX1, baseY1, baseX2, baseY2, crystalColor);
        }

        // Add glow effect if crystal glows
        if (crystalData.glow) {
            this.utils.applyGlow(image, centerX, baseY - crystalSize * 0.5, crystalSize * 0.3, crystalColor, 0.6);
        }

        // Add crystal imperfections
        await this.addCrystalImperfections(image, crystalColor);
    }

    /**
     * Generate ore deposit with veins
     */
    async generateOre(image, config) {
        const { width, height } = image.bitmap;
        const oreType = config.oreType || 'copper';

        const oreData = this.oreDatabase[oreType];
        if (!oreData) return;

        const baseColor = this.utils.getColor(oreData.baseColor);
        const oreSize = Math.floor(oreData.size.min + Math.random() * (oreData.size.max - oreData.size.min));
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.6);

        // Generate base rock
        this.utils.drawEllipse(image, centerX, centerY, oreSize * 0.5, oreSize * 0.4, baseColor);

        // Add ore veins
        const numVeins = Math.floor(3 + Math.random() * 5);
        for (let i = 0; i < numVeins; i++) {
            const veinStartX = centerX + Math.floor((Math.random() - 0.5) * oreSize * 0.8);
            const veinStartY = centerY + Math.floor((Math.random() - 0.5) * oreSize * 0.6);
            const veinLength = Math.floor(Math.random() * oreSize * 0.4) + 10;

            // Draw vein as a series of connected points
            for (let j = 0; j < veinLength; j++) {
                const veinX = veinStartX + Math.floor((Math.random() - 0.5) * 4);
                const veinY = veinStartY + j;

                if (veinX >= 0 && veinX < width && veinY >= 0 && veinY < height) {
                    const idx = (veinY * width + veinX) * 4;
                    const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                    // Only draw on base rock
                    if (currentColor !== 0) {
                        const veinColor = this.utils.getColor(oreData.veinColors[Math.floor(Math.random() * oreData.veinColors.length)]);
                        image.bitmap.data[idx] = (veinColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (veinColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = veinColor & 0xFF;
                    }
                }
            }
        }

        // Add ore sparkle effect
        if (oreData.veinIntensity > 0.7) {
            await this.addOreSparkle(image, oreData.veinColors);
        }
    }

    /**
     * Generate cut gemstone
     */
    async generateGem(image, config) {
        const { width, height } = image.bitmap;
        const gemType = config.gemType || 'ruby';

        const gemData = this.gemDatabase[gemType];
        if (!gemData) return;

        const gemColor = this.utils.getColor(gemData.colors[Math.floor(Math.random() * gemData.colors.length)]);
        const gemSize = Math.floor(gemData.size.min + Math.random() * (gemData.size.max - gemData.size.min));
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.5);

        // Generate gem based on cut type
        switch (gemData.cut) {
            case 'brilliant':
                await this.generateBrilliantCut(image, centerX, centerY, gemSize, gemColor);
                break;
            case 'emerald':
                await this.generateEmeraldCut(image, centerX, centerY, gemSize, gemColor);
                break;
            case 'round':
                await this.generateRoundCut(image, centerX, centerY, gemSize, gemColor);
                break;
            case 'princess':
                await this.generatePrincessCut(image, centerX, centerY, gemSize, gemColor);
                break;
            case 'oval':
                await this.generateOvalCut(image, centerX, centerY, gemSize, gemColor);
                break;
            case 'pear':
                await this.generatePearCut(image, centerX, centerY, gemSize, gemColor);
                break;
        }

        // Add gem sparkle and highlights
        await this.addGemSparkle(image, gemColor);
    }

    /**
     * Generate brilliant cut gem
     */
    async generateBrilliantCut(image, centerX, centerY, size, color) {
        const { width, height } = image.bitmap;

        // Brilliant cut has many facets
        const facets = [
            // Table (top)
            { points: [
                { x: centerX, y: centerY - size * 0.8 },
                { x: centerX - size * 0.4, y: centerY - size * 0.4 },
                { x: centerX + size * 0.4, y: centerY - size * 0.4 }
            ]},
            // Crown facets
            { points: [
                { x: centerX - size * 0.4, y: centerY - size * 0.4 },
                { x: centerX - size * 0.6, y: centerY },
                { x: centerX, y: centerY - size * 0.8 }
            ]},
            { points: [
                { x: centerX + size * 0.4, y: centerY - size * 0.4 },
                { x: centerX + size * 0.6, y: centerY },
                { x: centerX, y: centerY - size * 0.8 }
            ]},
            // Pavilion facets
            { points: [
                { x: centerX - size * 0.6, y: centerY },
                { x: centerX, y: centerY + size * 0.8 },
                { x: centerX - size * 0.3, y: centerY + size * 0.4 }
            ]},
            { points: [
                { x: centerX + size * 0.6, y: centerY },
                { x: centerX, y: centerY + size * 0.8 },
                { x: centerX + size * 0.3, y: centerY + size * 0.4 }
            ]}
        ];

        for (const facet of facets) {
            this.drawTriangle(image, facet.points[0].x, facet.points[0].y,
                            facet.points[1].x, facet.points[1].y,
                            facet.points[2].x, facet.points[2].y, color);
        }
    }

    /**
     * Generate emerald cut gem
     */
    async generateEmeraldCut(image, centerX, centerY, size, color) {
        const { width, height } = image.bitmap;

        // Emerald cut is rectangular with beveled corners
        const halfWidth = size * 0.4;
        const halfHeight = size * 0.3;

        // Main rectangle
        this.utils.drawRectangle(image, centerX - halfWidth, centerY - halfHeight,
                               halfWidth * 2, halfHeight * 2, color);

        // Add beveled corners
        const bevelSize = size * 0.1;
        // Top-left bevel
        this.drawTriangle(image, centerX - halfWidth, centerY - halfHeight,
                         centerX - halfWidth + bevelSize, centerY - halfHeight,
                         centerX - halfWidth, centerY - halfHeight + bevelSize,
                         this.utils.adjustBrightness(color, 30));
    }

    /**
     * Generate round cut gem
     */
    async generateRoundCut(image, centerX, centerY, size, color) {
        // Round cut is circular with facets
        this.utils.drawEllipse(image, centerX, centerY, size * 0.4, size * 0.4, color);

        // Add facet lines
        const numFacets = 16;
        for (let i = 0; i < numFacets; i++) {
            const angle = (i * 2 * Math.PI) / numFacets;
            const innerRadius = size * 0.2;
            const outerRadius = size * 0.4;

            const innerX = centerX + Math.cos(angle) * innerRadius;
            const innerY = centerY + Math.sin(angle) * innerRadius;
            const outerX = centerX + Math.cos(angle) * outerRadius;
            const outerY = centerY + Math.sin(angle) * outerRadius;

            this.utils.drawLine(image, innerX, innerY, outerX, outerY,
                             this.utils.adjustBrightness(color, 20));
        }
    }

    /**
     * Generate princess cut gem
     */
    async generatePrincessCut(image, centerX, centerY, size, color) {
        const { width, height } = image.bitmap;

        // Princess cut is square with pointed corners
        const halfSize = size * 0.35;

        // Draw as 4 triangles forming a square
        this.drawTriangle(image, centerX, centerY - halfSize,
                         centerX - halfSize, centerY,
                         centerX, centerY, color);
        this.drawTriangle(image, centerX, centerY - halfSize,
                         centerX + halfSize, centerY,
                         centerX, centerY, color);
        this.drawTriangle(image, centerX, centerY + halfSize,
                         centerX - halfSize, centerY,
                         centerX, centerY, color);
        this.drawTriangle(image, centerX, centerY + halfSize,
                         centerX + halfSize, centerY,
                         centerX, centerY, color);
    }

    /**
     * Generate oval cut gem
     */
    async generateOvalCut(image, centerX, centerY, size, color) {
        // Oval cut is elliptical
        this.utils.drawEllipse(image, centerX, centerY, size * 0.4, size * 0.3, color);
    }

    /**
     * Generate pear cut gem
     */
    async generatePearCut(image, centerX, centerY, size, color) {
        const { width, height } = image.bitmap;

        // Pear cut is teardrop shaped
        const points = [
            { x: centerX, y: centerY - size * 0.5 }, // Top point
            { x: centerX - size * 0.3, y: centerY - size * 0.2 }, // Top-left
            { x: centerX - size * 0.4, y: centerY + size * 0.3 }, // Bottom-left
            { x: centerX, y: centerY + size * 0.5 }, // Bottom point
            { x: centerX + size * 0.4, y: centerY + size * 0.3 }, // Bottom-right
            { x: centerX + size * 0.3, y: centerY - size * 0.2 }  // Top-right
        ];

        await this.fillIrregularShape(image, points, color);
    }

    /**
     * Draw triangle
     */
    drawTriangle(image, x1, y1, x2, y2, x3, y3, color) {
        const { width, height } = image.bitmap;

        // Simple triangle fill using barycentric coordinates
        const minX = Math.min(x1, x2, x3);
        const maxX = Math.max(x1, x2, x3);
        const minY = Math.min(y1, y2, y3);
        const maxY = Math.max(y1, y2, y3);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (this.pointInTriangle(x, y, x1, y1, x2, y2, x3, y3)) {
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

    /**
     * Check if point is inside triangle
     */
    pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
        const area = 0.5 * (-y2 * x3 + y1 * (-x2 + x3) + x1 * (y2 - y3) + x2 * y3);
        const s = 1 / (2 * area) * (y1 * x3 - x1 * y3 + (y3 - y1) * px + (x1 - x3) * py);
        const t = 1 / (2 * area) * (x1 * y2 - y1 * x2 + (y1 - y2) * px + (x2 - x1) * py);

        return s >= 0 && t >= 0 && (s + t) <= 1;
    }

    /**
     * Apply coarse texture to rock
     */
    async applyCoarseTexture(image, baseColor) {
        const { width, height } = image.bitmap;
        const darkerColor = this.utils.adjustBrightness(baseColor, -40);
        const lighterColor = this.utils.adjustBrightness(baseColor, 20);

        // Add random coarse grains
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < 0.08) {
                    const idx = (y * width + x) * 4;
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

    /**
     * Apply smooth texture to rock
     */
    async applySmoothTexture(image, baseColor) {
        const { width, height } = image.bitmap;
        const highlightColor = this.utils.adjustBrightness(baseColor, 30);

        // Add subtle smooth variations
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < 0.03) {
                    const idx = (y * width + x) * 4;
                    const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                    if (currentColor !== 0) {
                        image.bitmap.data[idx] = (highlightColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (highlightColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = highlightColor & 0xFF;
                    }
                }
            }
        }
    }

    /**
     * Apply layered texture to rock
     */
    async applyLayeredTexture(image, baseColor) {
        const { width, height } = image.bitmap;
        const layerColors = [
            this.utils.adjustBrightness(baseColor, -15),
            baseColor,
            this.utils.adjustBrightness(baseColor, -8),
            this.utils.adjustBrightness(baseColor, 8)
        ];

        // Add horizontal sedimentary layers
        for (let y = 0; y < height; y++) {
            const layerIndex = Math.floor((y / height) * layerColors.length);
            const layerColor = layerColors[layerIndex];

            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                if (currentColor !== 0 && Math.random() < 0.4) {
                    image.bitmap.data[idx] = (layerColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (layerColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = layerColor & 0xFF;
                }
            }
        }
    }

    /**
     * Apply rough texture to rock
     */
    async applyRoughTexture(image, baseColor) {
        const { width, height } = image.bitmap;
        const darkColor = this.utils.adjustBrightness(baseColor, -50);
        const lightColor = this.utils.adjustBrightness(baseColor, 25);

        // Add rough, jagged variations
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < 0.12) {
                    const idx = (y * width + x) * 4;
                    const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                    if (currentColor !== 0) {
                        const textureColor = Math.random() < 0.7 ? darkColor : lightColor;
                        image.bitmap.data[idx] = (textureColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (textureColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = textureColor & 0xFF;
                    }
                }
            }
        }
    }

    /**
     * Apply veined texture to rock
     */
    async applyVeinedTexture(image, baseColor) {
        const { width, height } = image.bitmap;
        const veinColor = this.utils.adjustBrightness(baseColor, -30);

        // Add mineral veins
        for (let i = 0; i < 3; i++) {
            const startX = Math.floor(Math.random() * width);
            const startY = Math.floor(Math.random() * height);
            const length = Math.floor(20 + Math.random() * 40);

            for (let j = 0; j < length; j++) {
                const veinX = startX + Math.floor((Math.random() - 0.5) * 6);
                const veinY = startY + j;

                if (veinX >= 0 && veinX < width && veinY >= 0 && veinY < height) {
                    const idx = (veinY * width + veinX) * 4;
                    const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                    if (currentColor !== 0) {
                        image.bitmap.data[idx] = (veinColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (veinColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = veinColor & 0xFF;
                    }
                }
            }
        }
    }

    /**
     * Add rock lighting effects
     */
    async addRockLighting(image) {
        const { width, height } = image.bitmap;

        // Add subtle shadows and highlights
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                if (currentColor !== 0) {
                    // Add highlight to top-left areas
                    if (x < width * 0.4 && y < height * 0.4) {
                        const highlightColor = this.utils.adjustBrightness(currentColor, 15);
                        image.bitmap.data[idx] = (highlightColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (highlightColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = highlightColor & 0xFF;
                    }

                    // Add shadow to bottom-right areas
                    if (x > width * 0.6 && y > height * 0.6) {
                        const shadowColor = this.utils.adjustBrightness(currentColor, -10);
                        image.bitmap.data[idx] = (shadowColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (shadowColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = shadowColor & 0xFF;
                    }
                }
            }
        }
    }

    /**
     * Add crystal imperfections
     */
    async addCrystalImperfections(image, crystalColor) {
        const { width, height } = image.bitmap;
        const imperfectionColor = this.utils.adjustBrightness(crystalColor, -20);

        // Add small imperfections and inclusions
        for (let i = 0; i < 5; i++) {
            const imperfectionX = Math.floor(Math.random() * width);
            const imperfectionY = Math.floor(Math.random() * height);
            const imperfectionSize = Math.floor(1 + Math.random() * 3);

            for (let dy = -imperfectionSize; dy <= imperfectionSize; dy++) {
                for (let dx = -imperfectionSize; dx <= imperfectionSize; dx++) {
                    const x = imperfectionX + dx;
                    const y = imperfectionY + dy;

                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const idx = (y * width + x) * 4;
                        const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                        if (currentColor !== 0 && Math.sqrt(dx * dx + dy * dy) <= imperfectionSize) {
                            image.bitmap.data[idx] = (imperfectionColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (imperfectionColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = imperfectionColor & 0xFF;
                        }
                    }
                }
            }
        }
    }

    /**
     * Add ore sparkle effect
     */
    async addOreSparkle(image, veinColors) {
        const { width, height } = image.bitmap;

        // Add metallic sparkles
        for (let i = 0; i < 8; i++) {
            const sparkleX = Math.floor(Math.random() * width);
            const sparkleY = Math.floor(Math.random() * height);
            const sparkleColor = this.utils.getColor(veinColors[Math.floor(Math.random() * veinColors.length)]);

            if (sparkleX >= 0 && sparkleX < width && sparkleY >= 0 && sparkleY < height) {
                const idx = (sparkleY * width + sparkleX) * 4;
                const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                if (currentColor !== 0) {
                    const brightColor = this.utils.adjustBrightness(sparkleColor, 40);
                    image.bitmap.data[idx] = (brightColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (brightColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = brightColor & 0xFF;
                }
            }
        }
    }

    /**
     * Add gem sparkle and highlights
     */
    async addGemSparkle(image, gemColor) {
        const { width, height } = image.bitmap;
        const highlightColor = this.utils.adjustBrightness(gemColor, 50);

        // Add gem facets and highlights
        for (let i = 0; i < 12; i++) {
            const sparkleX = Math.floor(Math.random() * width);
            const sparkleY = Math.floor(Math.random() * height);

            if (sparkleX >= 0 && sparkleX < width && sparkleY >= 0 && sparkleY < height) {
                const idx = (sparkleY * width + sparkleX) * 4;
                const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                if (currentColor !== 0) {
                    image.bitmap.data[idx] = (highlightColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (highlightColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = highlightColor & 0xFF;
                }
            }
        }
    }
}

module.exports = RocksGenerator;
