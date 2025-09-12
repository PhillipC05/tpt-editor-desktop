/**
 * TPT Flower Generator
 * Generates various types of flowers with seasonal variations and growth stages
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FlowerGenerator {
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
     * Generate flower sprite
     */
    async generateFlower(config) {
        const width = 16;
        const height = 20;

        await this.initImage(width, height);

        switch (config.flowerType) {
            case 'tulip':
                await this.generateTulip(config);
                break;
            case 'rose':
                await this.generateRose(config);
                break;
            case 'sunflower':
                await this.generateSunflower(config);
                break;
            case 'daisy':
                await this.generateDaisy(config);
                break;
            case 'lily':
                await this.generateLily(config);
                break;
            case 'orchid':
                await this.generateOrchid(config);
                break;
            default:
                await this.generateDaisy(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.color || 'White'} ${config.flowerType.charAt(0).toUpperCase() + config.flowerType.slice(1)}`,
            type: 'flower',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                flowerType: config.flowerType,
                color: config.color || 'white',
                season: config.season || 'spring',
                growthStage: config.growthStage || 'bloom',
                size: config.size || 'medium',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate tulip flower
     */
    async generateTulip(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const petalColor = this.getFlowerColor(config.color || 'red');
        const stemColor = '#228B22';
        const leafColor = '#32CD32';

        // Draw stem
        ctx.strokeStyle = stemColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.9);
        ctx.lineTo(width * 0.5, height * 0.3);
        ctx.stroke();

        // Draw leaves
        ctx.fillStyle = leafColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.35, height * 0.6, width * 0.15, height * 0.08, -Math.PI * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(width * 0.65, height * 0.55, width * 0.15, height * 0.08, Math.PI * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Draw petals (cup shape)
        ctx.fillStyle = petalColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.25, width * 0.12, height * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner details
        ctx.fillStyle = this.adjustColorBrightness(petalColor, -20);
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.25, width * 0.08, height * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate rose flower
     */
    async generateRose(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const petalColor = this.getFlowerColor(config.color || 'red');
        const stemColor = '#228B22';
        const thornColor = '#8B4513';

        // Draw stem
        ctx.strokeStyle = stemColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.9);
        ctx.lineTo(width * 0.5, height * 0.4);
        ctx.stroke();

        // Draw thorns
        ctx.fillStyle = thornColor;
        for (let i = 0; i < 3; i++) {
            const y = height * (0.5 + i * 0.15);
            ctx.beginPath();
            ctx.moveTo(width * 0.5, y);
            ctx.lineTo(width * 0.45, y - height * 0.02);
            ctx.lineTo(width * 0.55, y - height * 0.02);
            ctx.closePath();
            ctx.fill();
        }

        // Draw petals (layered)
        const petalLayers = 3;
        for (let layer = 0; layer < petalLayers; layer++) {
            const size = (width * 0.08) * (1 - layer * 0.2);
            const alpha = 1 - layer * 0.1;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = petalColor;
            ctx.beginPath();
            ctx.ellipse(width * 0.5, height * 0.3, size, size * 1.2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        // Draw center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.3, width * 0.03, height * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate sunflower
     */
    async generateSunflower(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const petalColor = this.getFlowerColor(config.color || 'yellow');
        const centerColor = '#8B4513';
        const stemColor = '#228B22';

        // Draw stem
        ctx.strokeStyle = stemColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.9);
        ctx.lineTo(width * 0.5, height * 0.5);
        ctx.stroke();

        // Draw leaves
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(width * 0.3, height * 0.7, width * 0.12, height * 0.06, -Math.PI * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Draw petals (around center)
        ctx.fillStyle = petalColor;
        const petalCount = 12;
        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalX = width * 0.5 + Math.cos(angle) * width * 0.15;
            const petalY = height * 0.35 + Math.sin(angle) * height * 0.12;

            ctx.save();
            ctx.translate(petalX, petalY);
            ctx.rotate(angle);
            ctx.fillRect(-width * 0.03, -height * 0.08, width * 0.06, height * 0.16);
            ctx.restore();
        }

        // Draw center
        ctx.fillStyle = centerColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.35, width * 0.08, height * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate daisy flower
     */
    async generateDaisy(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const petalColor = '#FFFFFF';
        const centerColor = '#FFD700';
        const stemColor = '#228B22';

        // Draw stem
        ctx.strokeStyle = stemColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.9);
        ctx.lineTo(width * 0.5, height * 0.4);
        ctx.stroke();

        // Draw petals (white)
        ctx.fillStyle = petalColor;
        const petalCount = 8;
        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalX = width * 0.5 + Math.cos(angle) * width * 0.12;
            const petalY = height * 0.3 + Math.sin(angle) * height * 0.08;

            ctx.save();
            ctx.translate(petalX, petalY);
            ctx.rotate(angle);
            ctx.fillRect(-width * 0.025, -height * 0.06, width * 0.05, height * 0.12);
            ctx.restore();
        }

        // Draw center
        ctx.fillStyle = centerColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.3, width * 0.06, height * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate lily flower
     */
    async generateLily(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const petalColor = this.getFlowerColor(config.color || 'white');
        const stemColor = '#228B22';
        const stamenColor = '#FFD700';

        // Draw stem
        ctx.strokeStyle = stemColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.9);
        ctx.lineTo(width * 0.5, height * 0.5);
        ctx.stroke();

        // Draw petals (trumpet shape)
        ctx.fillStyle = petalColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.35, width * 0.08, height * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw petal extensions
        ctx.beginPath();
        ctx.ellipse(width * 0.4, height * 0.35, width * 0.06, height * 0.08, -Math.PI * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(width * 0.6, height * 0.35, width * 0.06, height * 0.08, Math.PI * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Draw stamens
        ctx.fillStyle = stamenColor;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const stamenX = width * 0.5 + Math.cos(angle) * width * 0.03;
            const stamenY = height * 0.35 + Math.sin(angle) * height * 0.04;

            ctx.beginPath();
            ctx.ellipse(stamenX, stamenY, width * 0.01, height * 0.02, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate orchid flower
     */
    async generateOrchid(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const petalColor = this.getFlowerColor(config.color || 'purple');
        const stemColor = '#228B22';
        const lipColor = '#FF69B4';

        // Draw stem
        ctx.strokeStyle = stemColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.9);
        ctx.lineTo(width * 0.5, height * 0.6);
        ctx.stroke();

        // Draw main petals
        ctx.fillStyle = petalColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.4, width * 0.06, height * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw side petals
        ctx.beginPath();
        ctx.ellipse(width * 0.35, height * 0.45, width * 0.04, height * 0.06, -Math.PI * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(width * 0.65, height * 0.45, width * 0.04, height * 0.06, Math.PI * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Draw lip (distinctive orchid feature)
        ctx.fillStyle = lipColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.5, width * 0.05, height * 0.03, 0, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Get flower color based on configuration
     */
    getFlowerColor(color) {
        const colors = {
            white: '#FFFFFF',
            red: '#DC143C',
            pink: '#FF69B4',
            yellow: '#FFD700',
            orange: '#FFA500',
            purple: '#8A2BE2',
            blue: '#4169E1',
            lavender: '#E6E6FA'
        };
        return colors[color] || colors.white;
    }

    /**
     * Adjust color brightness
     */
    adjustColorBrightness(color, amount) {
        // Simple brightness adjustment
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
     * Save flower to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = FlowerGenerator;
