/**
 * TPT Candle Generator
 * Generates various types of candles with different styles and effects
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CandleGenerator {
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
     * Generate candle sprite
     */
    async generateCandle(config) {
        const width = 16;
        const height = 24;

        await this.initImage(width, height);

        switch (config.candleType) {
            case 'taper':
                await this.generateTaperCandle(config);
                break;
            case 'pillar':
                await this.generatePillarCandle(config);
                break;
            case 'votiv':
                await this.generateVotiveCandle(config);
                break;
            case 'candlestick':
                await this.generateCandlestick(config);
                break;
            default:
                await this.generateTaperCandle(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.color || 'White'} ${config.candleType.charAt(0).toUpperCase() + config.candleType.slice(1)} Candle`,
            type: 'candle',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                candleType: config.candleType,
                color: config.color || 'white',
                burnState: config.burnState || 'new',
                waxType: config.waxType || 'paraffin',
                scent: config.scent || 'unscented',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate taper candle (long thin candle)
     */
    async generateTaperCandle(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const candleColor = this.getCandleColor(config.color || 'white');
        const wickColor = '#2F2F2F';

        // Draw candle body (tapered)
        ctx.fillStyle = candleColor;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.1);
        ctx.lineTo(width * 0.3, height * 0.9);
        ctx.lineTo(width * 0.7, height * 0.9);
        ctx.closePath();
        ctx.fill();

        // Draw wick
        ctx.fillStyle = wickColor;
        ctx.fillRect(width * 0.48, height * 0.05, width * 0.04, height * 0.1);

        // Add burn effects if needed
        if (config.burnState === 'burning') {
            await this.addFlameEffect(width * 0.5, height * 0.05);
        } else if (config.burnState === 'burnt') {
            await this.addBurntEffect();
        }

        // Apply to Jimp image
        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate pillar candle (thick round candle)
     */
    async generatePillarCandle(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const candleColor = this.getCandleColor(config.color || 'white');
        const wickColor = '#2F2F2F';

        // Draw candle body (cylindrical)
        ctx.fillStyle = candleColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.5, width * 0.35, height * 0.4, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Draw wick
        ctx.fillStyle = wickColor;
        ctx.fillRect(width * 0.48, height * 0.08, width * 0.04, height * 0.1);

        // Add decorative elements
        if (config.decorative) {
            await this.addDecorativeElements(config);
        }

        // Add burn effects
        if (config.burnState === 'burning') {
            await this.addFlameEffect(width * 0.5, height * 0.08);
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate votive candle (small container candle)
     */
    async generateVotiveCandle(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const candleColor = this.getCandleColor(config.color || 'white');
        const glassColor = 'rgba(200, 200, 255, 0.3)';

        // Draw glass container
        ctx.fillStyle = glassColor;
        ctx.fillRect(width * 0.2, height * 0.6, width * 0.6, height * 0.3);

        // Draw glass outline
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.strokeRect(width * 0.2, height * 0.6, width * 0.6, height * 0.3);

        // Draw wax inside
        ctx.fillStyle = candleColor;
        ctx.fillRect(width * 0.25, height * 0.65, width * 0.5, height * 0.2);

        // Draw wick
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(width * 0.48, height * 0.6, width * 0.04, height * 0.08);

        if (config.burnState === 'burning') {
            await this.addFlameEffect(width * 0.5, height * 0.6);
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate candlestick (candle holder)
     */
    async generateCandlestick(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const metalColor = '#C0C0C0';
        const candleColor = this.getCandleColor(config.color || 'white');

        // Draw base
        ctx.fillStyle = metalColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.85, width * 0.25, height * 0.05, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Draw stem
        ctx.fillStyle = metalColor;
        ctx.fillRect(width * 0.48, height * 0.3, width * 0.04, height * 0.55);

        // Draw candle
        ctx.fillStyle = candleColor;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.2, width * 0.15, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Draw wick
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(width * 0.48, height * 0.15, width * 0.04, height * 0.05);

        if (config.burnState === 'burning') {
            await this.addFlameEffect(width * 0.5, height * 0.15);
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Get candle color based on configuration
     */
    getCandleColor(color) {
        const colors = {
            white: '#FFFFFF',
            red: '#DC143C',
            blue: '#4169E1',
            green: '#228B22',
            purple: '#8A2BE2',
            yellow: '#FFD700',
            pink: '#FF69B4',
            black: '#2F2F2F'
        };
        return colors[color] || colors.white;
    }

    /**
     * Add flame effect
     */
    async addFlameEffect(x, y) {
        const flameColors = ['#FFD700', '#FFA500', '#FF6347'];

        for (let i = 0; i < 3; i++) {
            const flameX = x + (Math.random() - 0.5) * 4;
            const flameY = y - i * 2;
            const flameColor = flameColors[i];

            for (let py = flameY; py < flameY + 3; py++) {
                for (let px = flameX - 1; px <= flameX + 1; px++) {
                    if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                        const idx = (py * this.width + px) * 4;
                        const color = parseInt(flameColor.slice(1), 16);
                        this.image.bitmap.data[idx] = (color >> 16) & 0xFF;     // R
                        this.image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;  // G
                        this.image.bitmap.data[idx + 2] = color & 0xFF;         // B
                        this.image.bitmap.data[idx + 3] = 255;                  // A
                    }
                }
            }
        }
    }

    /**
     * Add burnt effect
     */
    async addBurntEffect() {
        // Add soot and burn marks
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height * 0.3);

            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                const idx = (y * this.width + x) * 4;
                this.image.bitmap.data[idx] = 47;     // R
                this.image.bitmap.data[idx + 1] = 47; // G
                this.image.bitmap.data[idx + 2] = 47; // B
                this.image.bitmap.data[idx + 3] = 255; // A
            }
        }
    }

    /**
     * Add decorative elements
     */
    async addDecorativeElements(config) {
        // Add simple decorative patterns
        const patternColor = '#FFD700';

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const x = this.width * 0.5 + Math.cos(angle) * this.width * 0.25;
            const y = this.height * 0.5 + Math.sin(angle) * this.height * 0.3;

            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                const idx = (Math.floor(y) * this.width + Math.floor(x)) * 4;
                const color = parseInt(patternColor.slice(1), 16);
                this.image.bitmap.data[idx] = (color >> 16) & 0xFF;
                this.image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                this.image.bitmap.data[idx + 2] = color & 0xFF;
                this.image.bitmap.data[idx + 3] = 255;
            }
        }
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
     * Save candle to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = CandleGenerator;
