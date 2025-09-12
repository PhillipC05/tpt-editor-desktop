/**
 * TPT Debuff Icon Generator
 * Generates various debuff status effect icons for game UI
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DebuffIconGenerator {
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
     * Generate debuff icon sprite
     */
    async generateDebuffIcon(config) {
        const width = 24;
        const height = 24;

        await this.initImage(width, height);

        switch (config.debuffType) {
            case 'poison':
                await this.generatePoisonDebuff(config);
                break;
            case 'slow':
                await this.generateSlowDebuff(config);
                break;
            case 'weakness':
                await this.generateWeaknessDebuff(config);
                break;
            case 'confusion':
                await this.generateConfusionDebuff(config);
                break;
            case 'fear':
                await this.generateFearDebuff(config);
                break;
            default:
                await this.generatePoisonDebuff(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.debuffType.charAt(0).toUpperCase() + config.debuffType.slice(1)} Debuff Icon`,
            type: 'debuff_icon',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                debuffType: config.debuffType,
                severity: config.severity || 'moderate',
                duration: config.duration || 'temporary',
                curable: config.curable || true,
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate poison debuff icon
     */
    async generatePoisonDebuff(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background circle
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.35, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Poison vial symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Vial body
        ctx.beginPath();
        ctx.moveTo(width * 0.4, height * 0.7);
        ctx.lineTo(width * 0.4, height * 0.3);
        ctx.lineTo(width * 0.6, height * 0.3);
        ctx.lineTo(width * 0.6, height * 0.7);
        ctx.stroke();

        // Vial neck
        ctx.beginPath();
        ctx.moveTo(width * 0.45, height * 0.25);
        ctx.lineTo(width * 0.45, height * 0.2);
        ctx.lineTo(width * 0.55, height * 0.2);
        ctx.lineTo(width * 0.55, height * 0.25);
        ctx.stroke();

        // Poison liquid
        ctx.fillStyle = '#8A2BE2';
        ctx.beginPath();
        ctx.moveTo(width * 0.42, height * 0.65);
        ctx.lineTo(width * 0.42, height * 0.45);
        ctx.lineTo(width * 0.58, height * 0.45);
        ctx.lineTo(width * 0.58, height * 0.65);
        ctx.closePath();
        ctx.fill();

        // Skull and crossbones (small)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;

        // Skull
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.55, width * 0.08, 0, Math.PI);
        ctx.stroke();

        // Crossbones
        ctx.beginPath();
        ctx.moveTo(width * 0.45, height * 0.6);
        ctx.lineTo(width * 0.55, height * 0.6);
        ctx.moveTo(width * 0.5, height * 0.57);
        ctx.lineTo(width * 0.5, height * 0.63);
        ctx.stroke();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate slow debuff icon
     */
    async generateSlowDebuff(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background circle
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#6495ED';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.35, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Hourglass symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Top triangle
        ctx.beginPath();
        ctx.moveTo(width * 0.35, height * 0.3);
        ctx.lineTo(width * 0.5, height * 0.45);
        ctx.lineTo(width * 0.65, height * 0.3);
        ctx.closePath();
        ctx.stroke();

        // Bottom triangle
        ctx.beginPath();
        ctx.moveTo(width * 0.35, height * 0.7);
        ctx.lineTo(width * 0.5, height * 0.55);
        ctx.lineTo(width * 0.65, height * 0.7);
        ctx.closePath();
        ctx.stroke();

        // Middle connection
        ctx.beginPath();
        ctx.moveTo(width * 0.4, height * 0.5);
        ctx.lineTo(width * 0.6, height * 0.5);
        ctx.stroke();

        // Sand particles
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 6; i++) {
            const x = width * (0.4 + Math.random() * 0.2);
            const y = height * (0.45 + Math.random() * 0.1);
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate weakness debuff icon
     */
    async generateWeaknessDebuff(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background circle
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.35, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Broken sword symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Blade (broken)
        ctx.beginPath();
        ctx.moveTo(width * 0.35, height * 0.3);
        ctx.lineTo(width * 0.45, height * 0.3);
        ctx.lineTo(width * 0.4, height * 0.45);
        ctx.lineTo(width * 0.5, height * 0.45);
        ctx.stroke();

        // Break point
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width * 0.45, height * 0.3);
        ctx.lineTo(width * 0.5, height * 0.45);
        ctx.stroke();

        // Handle
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.45);
        ctx.lineTo(width * 0.5, height * 0.65);
        ctx.stroke();

        // Cross-guard
        ctx.beginPath();
        ctx.moveTo(width * 0.45, height * 0.45);
        ctx.lineTo(width * 0.55, height * 0.45);
        ctx.stroke();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate confusion debuff icon
     */
    async generateConfusionDebuff(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background circle
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#FF7F50';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.35, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Swirly confusion symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Main spiral
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.3);
        ctx.quadraticCurveTo(width * 0.7, height * 0.4, width * 0.6, height * 0.6);
        ctx.quadraticCurveTo(width * 0.4, height * 0.7, width * 0.4, height * 0.5);
        ctx.quadraticCurveTo(width * 0.6, height * 0.3, width * 0.5, height * 0.3);
        ctx.stroke();

        // Question mark
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(width * 0.35, height * 0.35, width * 0.08, 0, Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width * 0.35, height * 0.43);
        ctx.lineTo(width * 0.35, height * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width * 0.35, height * 0.52, 1, 0, Math.PI * 2);
        ctx.stroke();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate fear debuff icon
     */
    async generateFearDebuff(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background circle
        ctx.fillStyle = '#2F2F2F';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#4F4F4F';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.35, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Skull symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Skull outline
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.4, width * 0.12, 0, Math.PI);
        ctx.stroke();

        // Eye sockets
        ctx.beginPath();
        ctx.arc(width * 0.45, height * 0.38, width * 0.02, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width * 0.55, height * 0.38, width * 0.02, 0, Math.PI * 2);
        ctx.stroke();

        // Nose
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.4);
        ctx.lineTo(width * 0.5, height * 0.45);
        ctx.stroke();

        // Teeth
        ctx.beginPath();
        ctx.moveTo(width * 0.47, height * 0.45);
        ctx.lineTo(width * 0.47, height * 0.5);
        ctx.moveTo(width * 0.53, height * 0.45);
        ctx.lineTo(width * 0.53, height * 0.5);
        ctx.stroke();

        // Fear lines (sweat drops)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;

        for (let i = 0; i < 4; i++) {
            const x = width * (0.3 + i * 0.1);
            const y = height * 0.25;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + height * 0.08);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x, y + height * 0.08, 1.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        await this.applyCanvasToImage(ctx);
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
     * Save debuff icon to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = DebuffIconGenerator;
