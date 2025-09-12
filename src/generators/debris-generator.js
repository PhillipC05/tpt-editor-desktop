/**
 * TPT Debris Generator
 * Generates various types of scattered debris and broken objects
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DebrisGenerator {
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
     * Generate debris sprite
     */
    async generateDebris(config) {
        const width = 24;
        const height = 16;

        await this.initImage(width, height);

        switch (config.debrisType) {
            case 'rocks':
                await this.generateScatteredRocks(config);
                break;
            case 'weapons':
                await this.generateBrokenWeapons(config);
                break;
            case 'furniture':
                await this.generateRuinedFurniture(config);
                break;
            case 'construction':
                await this.generateConstructionDebris(config);
                break;
            case 'natural':
                await this.generateNaturalDebris(config);
                break;
            default:
                await this.generateScatteredRocks(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.debrisType.charAt(0).toUpperCase() + config.debrisType.slice(1)} Debris`,
            type: 'debris',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                debrisType: config.debrisType,
                age: config.age || 'recent',
                scattering: config.scattering || 'random',
                density: config.density || 'medium',
                material: config.material || 'mixed',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate scattered rocks
     */
    async generateScatteredRocks(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const rockCount = config.density === 'dense' ? 8 : config.density === 'sparse' ? 3 : 5;

        for (let i = 0; i < rockCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 6 + 3;

            // Rock color variation
            const rockColor = this.adjustColorBrightness('#696969', (Math.random() - 0.5) * 60);
            ctx.fillStyle = rockColor;

            // Irregular rock shape
            ctx.beginPath();
            const points = 6;
            for (let j = 0; j < points; j++) {
                const angle = (j / points) * Math.PI * 2;
                const radius = size * (0.7 + Math.random() * 0.6);
                const pointX = x + Math.cos(angle) * radius;
                const pointY = y + Math.sin(angle) * radius;

                if (j === 0) {
                    ctx.moveTo(pointX, pointY);
                } else {
                    ctx.lineTo(pointX, pointY);
                }
            }
            ctx.closePath();
            ctx.fill();

            // Add highlights
            ctx.fillStyle = this.adjustColorBrightness(rockColor, 40);
            ctx.beginPath();
            ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate broken weapons
     */
    async generateBrokenWeapons(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const weaponCount = config.density === 'dense' ? 6 : config.density === 'sparse' ? 2 : 4;

        for (let i = 0; i < weaponCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const weaponType = Math.floor(Math.random() * 3); // 0: sword, 1: axe, 2: spear

            const metalColor = '#C0C0C0';
            const rustColor = '#8B4513';

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * Math.PI * 0.5); // Random rotation

            switch (weaponType) {
                case 0: // Broken sword
                    // Blade
                    ctx.fillStyle = metalColor;
                    ctx.fillRect(-8, -1, 12, 2);
                    // Handle
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(-10, -1, 3, 2);
                    // Break point
                    ctx.fillStyle = rustColor;
                    ctx.fillRect(-2, -2, 4, 4);
                    break;

                case 1: // Broken axe
                    // Handle
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(-6, -1, 8, 2);
                    // Blade remnant
                    ctx.fillStyle = metalColor;
                    ctx.beginPath();
                    ctx.moveTo(2, -3);
                    ctx.lineTo(6, 0);
                    ctx.lineTo(2, 3);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 2: // Broken spear
                    // Shaft
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(-10, -1, 16, 2);
                    // Point remnant
                    ctx.fillStyle = metalColor;
                    ctx.beginPath();
                    ctx.moveTo(6, -2);
                    ctx.lineTo(10, 0);
                    ctx.lineTo(6, 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }

            ctx.restore();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate ruined furniture
     */
    async generateRuinedFurniture(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const furnitureCount = config.density === 'dense' ? 4 : config.density === 'sparse' ? 1 : 2;

        for (let i = 0; i < furnitureCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const furnitureType = Math.floor(Math.random() * 3); // 0: chair, 1: table, 2: shelf

            const woodColor = '#8B4513';
            const brokenWoodColor = '#654321';

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * Math.PI * 0.3); // Slight random rotation

            switch (furnitureType) {
                case 0: // Broken chair
                    // Seat
                    ctx.fillStyle = woodColor;
                    ctx.fillRect(-4, -2, 8, 4);
                    // Legs (broken)
                    ctx.fillRect(-3, 2, 2, 3);
                    ctx.fillRect(1, 2, 2, 2); // One leg shorter
                    ctx.fillRect(-3, -6, 2, 3); // Back leg
                    // Back rest (broken)
                    ctx.fillRect(-1, -8, 2, 4);
                    break;

                case 1: // Broken table
                    // Tabletop
                    ctx.fillStyle = woodColor;
                    ctx.fillRect(-6, -1, 12, 2);
                    // Legs (some broken)
                    ctx.fillRect(-5, 1, 2, 4);
                    ctx.fillRect(3, 1, 2, 3); // One leg shorter
                    ctx.fillRect(-5, -5, 2, 3); // Corner leg
                    ctx.fillRect(3, -5, 2, 2); // Broken corner leg
                    break;

                case 2: // Broken shelf
                    // Shelves
                    ctx.fillStyle = woodColor;
                    ctx.fillRect(-8, -6, 16, 2);
                    ctx.fillRect(-8, -2, 16, 2);
                    ctx.fillRect(-8, 2, 12, 2); // Broken shelf
                    // Supports
                    ctx.fillRect(-7, -8, 2, 12);
                    ctx.fillRect(5, -8, 2, 8); // Broken support
                    break;
            }

            ctx.restore();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate construction debris
     */
    async generateConstructionDebris(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const debrisCount = config.density === 'dense' ? 12 : config.density === 'sparse' ? 4 : 8;

        for (let i = 0; i < debrisCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const debrisType = Math.floor(Math.random() * 4); // 0: brick, 1: timber, 2: metal, 3: mixed

            switch (debrisType) {
                case 0: // Brick pieces
                    const brickColor = '#CD853F';
                    ctx.fillStyle = this.adjustColorBrightness(brickColor, (Math.random() - 0.5) * 40);
                    ctx.fillRect(x - 3, y - 2, 6, 4);
                    break;

                case 1: // Timber pieces
                    const woodColor = '#8B4513';
                    ctx.fillStyle = this.adjustColorBrightness(woodColor, (Math.random() - 0.5) * 30);
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate((Math.random() - 0.5) * Math.PI);
                    ctx.fillRect(-4, -1, 8, 2);
                    ctx.restore();
                    break;

                case 2: // Metal pieces
                    const metalColor = '#C0C0C0';
                    ctx.fillStyle = this.adjustColorBrightness(metalColor, (Math.random() - 0.5) * 50);
                    ctx.beginPath();
                    ctx.moveTo(x - 2, y);
                    ctx.lineTo(x + 2, y - 1);
                    ctx.lineTo(x + 1, y + 1);
                    ctx.lineTo(x - 3, y + 1);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 3: // Mixed debris
                    ctx.fillStyle = '#696969';
                    ctx.beginPath();
                    ctx.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate natural debris
     */
    async generateNaturalDebris(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const debrisCount = config.density === 'dense' ? 10 : config.density === 'sparse' ? 3 : 6;

        for (let i = 0; i < debrisCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const debrisType = Math.floor(Math.random() * 3); // 0: branches, 1: leaves, 2: stones

            switch (debrisType) {
                case 0: // Fallen branches
                    const branchColor = '#654321';
                    ctx.strokeStyle = this.adjustColorBrightness(branchColor, (Math.random() - 0.5) * 30);
                    ctx.lineWidth = 1 + Math.random();
                    ctx.beginPath();
                    ctx.moveTo(x - 5, y);
                    ctx.bezierCurveTo(x - 2, y - 2, x + 2, y - 1, x + 5, y);
                    ctx.stroke();
                    break;

                case 1: // Scattered leaves
                    const leafColors = ['#228B22', '#32CD32', '#DC143C', '#FFD700'];
                    const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                    ctx.fillStyle = leafColor;
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(Math.random() * Math.PI * 2);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 2 + Math.random() * 2, 1 + Math.random(), 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    break;

                case 2: // Small stones
                    const stoneColor = '#808080';
                    ctx.fillStyle = this.adjustColorBrightness(stoneColor, (Math.random() - 0.5) * 40);
                    ctx.beginPath();
                    const stoneSize = 1 + Math.random() * 2;
                    ctx.ellipse(x, y, stoneSize, stoneSize * 0.8, Math.random() * Math.PI, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        }

        await this.applyCanvasToImage(ctx);
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
     * Save debris to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = DebrisGenerator;
