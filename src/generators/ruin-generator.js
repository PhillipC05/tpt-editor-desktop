/**
 * TPT Ruin Generator
 * Generates various types of ruined structures and ancient remnants
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class RuinGenerator {
    constructor() {
        this.image = null;
        this.width = 0;
        this.height = 0;
    }

    /**
     * Initialize image with given dimensions
     */
    async initImage(width, height) {
        this.width = width;
        this.height = height;
        this.image = new Jimp(width, height, 0x00000000); // Transparent background
    }

    /**
     * Generate ruin sprite
     */
    async generateRuin(config) {
        const width = 32;
        const height = 32;

        await this.initImage(width, height);

        switch (config.ruinType) {
            case 'wall':
                await this.generateBrokenWall(config);
                break;
            case 'pillar':
                await this.generateCollapsedPillar(config);
                break;
            case 'statue':
                await this.generateRuinedStatue(config);
                break;
            case 'foundation':
                await this.generateAncientFoundation(config);
                break;
            default:
                await this.generateBrokenWall(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.ruinType.charAt(0).toUpperCase() + config.ruinType.slice(1)} Ruin`,
            type: 'ruin',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                ruinType: config.ruinType,
                age: config.age || 'ancient',
                condition: config.condition || 'crumbling',
                material: config.material || 'stone',
                overgrown: config.overgrown || false,
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate broken wall
     */
    async generateBrokenWall(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const stoneColor = this.getRuinColor('stone', config.age || 'ancient');
        const crackColor = '#333333';

        // Draw base wall structure
        ctx.fillStyle = stoneColor;
        ctx.fillRect(0, height * 0.3, width, height * 0.7);

        // Add stone blocks
        const blockSize = 6;
        for (let y = Math.floor(height * 0.3); y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                const blockColor = this.adjustColorBrightness(stoneColor, (Math.random() - 0.5) * 30);
                ctx.fillStyle = blockColor;
                ctx.fillRect(x, y, blockSize, blockSize);

                // Add mortar lines
                ctx.strokeStyle = '#666666';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, blockSize, blockSize);
            }
        }

        // Add cracks and damage
        this.addCracks(ctx, width, height, config.condition);

        // Add weathering effects
        this.addWeathering(ctx, width, height, config.age);

        // Add vegetation if overgrown
        if (config.overgrown) {
            this.addVegetation(ctx, width, height);
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate collapsed pillar
     */
    async generateCollapsedPillar(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const stoneColor = this.getRuinColor('stone', config.age || 'ancient');

        // Draw broken pillar base
        ctx.fillStyle = stoneColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.8, width * 0.25, height * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw broken pillar shaft
        ctx.save();
        ctx.translate(width * 0.5, height * 0.5);
        ctx.rotate(Math.PI * 0.1); // Slight tilt

        // Draw shaft pieces
        const shaftPieces = 3;
        for (let i = 0; i < shaftPieces; i++) {
            const pieceY = i * height * 0.15;
            const pieceWidth = width * (0.15 - i * 0.02);

            ctx.fillStyle = this.adjustColorBrightness(stoneColor, (Math.random() - 0.5) * 20);
            ctx.fillRect(-pieceWidth / 2, pieceY, pieceWidth, height * 0.12);

            // Add cracks to pieces
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-pieceWidth / 2, pieceY + height * 0.06);
            ctx.lineTo(pieceWidth / 2, pieceY + height * 0.06);
            ctx.stroke();
        }

        ctx.restore();

        // Add debris around base
        this.addDebris(ctx, width, height);

        // Add weathering
        this.addWeathering(ctx, width, height, config.age);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate ruined statue
     */
    async generateRuinedStatue(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const stoneColor = this.getRuinColor('stone', config.age || 'ancient');

        // Draw statue base
        ctx.fillStyle = stoneColor;
        ctx.fillRect(width * 0.35, height * 0.7, width * 0.3, height * 0.25);

        // Draw broken statue body
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.4, width * 0.15, height * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw broken arms/legs (scattered pieces)
        const limbPieces = 4;
        for (let i = 0; i < limbPieces; i++) {
            const angle = (i / limbPieces) * Math.PI * 2;
            const distance = width * 0.2;
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.ellipse(x, y, width * 0.05, height * 0.08, angle, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add damage and cracks
        this.addCracks(ctx, width, height, 'damaged');

        // Add moss and vegetation
        if (config.overgrown) {
            this.addMoss(ctx, width, height);
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate ancient foundation
     */
    async generateAncientFoundation(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const stoneColor = this.getRuinColor('stone', config.age || 'ancient');

        // Draw foundation outline
        ctx.strokeStyle = stoneColor;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
        ctx.setLineDash([]);

        // Draw remaining foundation stones
        const stoneCount = 8;
        for (let i = 0; i < stoneCount; i++) {
            const x = width * (0.15 + Math.random() * 0.7);
            const y = height * (0.15 + Math.random() * 0.7);
            const size = width * (0.05 + Math.random() * 0.08);

            ctx.fillStyle = this.adjustColorBrightness(stoneColor, (Math.random() - 0.5) * 40);
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add overgrown vegetation
        if (config.overgrown) {
            this.addOvergrownVegetation(ctx, width, height);
        }

        // Add erosion effects
        this.addErosion(ctx, width, height, config.age);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Get ruin color based on material and age
     */
    getRuinColor(material, age) {
        const colors = {
            stone: {
                ancient: '#696969',
                old: '#808080',
                weathered: '#A9A9A9'
            },
            marble: {
                ancient: '#F5F5F5',
                old: '#D3D3D3',
                weathered: '#C0C0C0'
            }
        };

        return colors[material]?.[age] || colors.stone.ancient;
    }

    /**
     * Add cracks and damage
     */
    addCracks(ctx, width, height, condition) {
        const crackCount = condition === 'crumbling' ? 5 : condition === 'damaged' ? 3 : 1;

        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;

        for (let i = 0; i < crackCount; i++) {
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            const endX = startX + (Math.random() - 0.5) * width * 0.4;
            const endY = startY + (Math.random() - 0.5) * height * 0.4;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Add smaller crack branches
            if (Math.random() > 0.5) {
                const branchX = (startX + endX) / 2 + (Math.random() - 0.5) * width * 0.1;
                const branchY = (startY + endY) / 2 + (Math.random() - 0.5) * height * 0.1;

                ctx.beginPath();
                ctx.moveTo(branchX, branchY);
                ctx.lineTo(branchX + (Math.random() - 0.5) * width * 0.15, branchY + (Math.random() - 0.5) * height * 0.15);
                ctx.stroke();
            }
        }
    }

    /**
     * Add weathering effects
     */
    addWeathering(ctx, width, height, age) {
        const weatheringIntensity = age === 'ancient' ? 0.8 : age === 'old' ? 0.5 : 0.2;

        // Add surface wear
        ctx.fillStyle = `rgba(139, 69, 19, ${weatheringIntensity * 0.3})`;
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add discoloration
        ctx.fillStyle = `rgba(160, 82, 45, ${weatheringIntensity * 0.2})`;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Add vegetation overgrowth
     */
    addVegetation(ctx, width, height) {
        // Add grass and weeds
        ctx.fillStyle = '#228B22';

        for (let i = 0; i < 12; i++) {
            const x = Math.random() * width;
            const y = height * (0.8 + Math.random() * 0.2);
            const height = Math.random() * 6 + 2;

            ctx.fillRect(x, y, 1, height);
        }

        // Add vines
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.bezierCurveTo(
                Math.random() * width, Math.random() * height,
                Math.random() * width, Math.random() * height,
                Math.random() * width, Math.random() * height
            );
            ctx.stroke();
        }
    }

    /**
     * Add debris around base
     */
    addDebris(ctx, width, height) {
        const debrisCount = 6;

        for (let i = 0; i < debrisCount; i++) {
            const x = width * 0.5 + (Math.random() - 0.5) * width * 0.6;
            const y = height * 0.85 + Math.random() * height * 0.15;
            const size = Math.random() * 4 + 2;

            ctx.fillStyle = this.adjustColorBrightness('#696969', (Math.random() - 0.5) * 30);
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add moss growth
     */
    addMoss(ctx, width, height) {
        ctx.fillStyle = '#228B22';

        for (let i = 0; i < 15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add overgrown vegetation
     */
    addOvergrownVegetation(ctx, width, height) {
        // Add thick vegetation covering
        ctx.fillStyle = '#006400';

        for (let i = 0; i < 25; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 4 + 2;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add tree roots
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;

        for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, height);
            ctx.bezierCurveTo(
                Math.random() * width, height * 0.7,
                Math.random() * width, height * 0.5,
                Math.random() * width, height * 0.3
            );
            ctx.stroke();
        }
    }

    /**
     * Add erosion effects
     */
    addErosion(ctx, width, height, age) {
        const erosionIntensity = age === 'ancient' ? 0.6 : 0.3;

        // Add eroded edges
        ctx.fillStyle = `rgba(139, 69, 19, ${erosionIntensity})`;

        // Create irregular eroded shapes
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 8 + 4;

            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Adjust color brightness
     */
    adjustColorBrightness(color, amount) {
        const usePound = color[0] === '#';
        const col = usePound ? color.slice(1) : color;

        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = (num >> 8 & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;

        return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
    }

    /**
     * Create canvas context for 2D drawing
     */
    createCanvasContext(width, height) {
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return ctx;
    }

    /**
     * Apply canvas context to Jimp image
     */
    async applyCanvasToImage(ctx) {
        const canvas = ctx.canvas;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const srcIdx = (y * canvas.width + x) * 4;
                const dstIdx = (y * this.width + x) * 4;

                this.image.bitmap.data[dstIdx] = imageData.data[srcIdx];     // R
                this.image.bitmap.data[dstIdx + 1] = imageData.data[srcIdx + 1]; // G
                this.image.bitmap.data[dstIdx + 2] = imageData.data[srcIdx + 2]; // B
                this.image.bitmap.data[dstIdx + 3] = imageData.data[srcIdx + 3]; // A
            }
        }
    }

    /**
     * Save ruin to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = RuinGenerator;
