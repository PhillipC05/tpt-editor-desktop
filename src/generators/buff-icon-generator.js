/**
 * TPT Buff Icon Generator
 * Generates various buff status effect icons for game UI
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class BuffIconGenerator {
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
     * Generate buff icon sprite
     */
    async generateBuffIcon(config) {
        const width = 24;
        const height = 24;

        await this.initImage(width, height);

        switch (config.buffType) {
            case 'strength':
                await this.generateStrengthBuff(config);
                break;
            case 'speed':
                await this.generateSpeedBuff(config);
                break;
            case 'defense':
                await this.generateDefenseBuff(config);
                break;
            case 'health':
                await this.generateHealthBuff(config);
                break;
            case 'mana':
                await this.generateManaBuff(config);
                break;
            default:
                await this.generateStrengthBuff(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.buffType.charAt(0).toUpperCase() + config.buffType.slice(1)} Buff Icon`,
            type: 'buff_icon',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                buffType: config.buffType,
                quality: config.quality || 'common',
                duration: config.duration || 'temporary',
                stackable: config.stackable || false,
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate strength buff icon
     */
    async generateStrengthBuff(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background circle
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.35, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Muscle arm symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Upper arm
        ctx.beginPath();
        ctx.moveTo(width * 0.4, height * 0.6);
        ctx.lineTo(width * 0.35, height * 0.45);
        ctx.stroke();

        // Lower arm
        ctx.beginPath();
        ctx.moveTo(width * 0.35, height * 0.45);
        ctx.lineTo(width * 0.45, height * 0.35);
        ctx.stroke();

        // Bicep bulge
        ctx.beginPath();
        ctx.arc(width * 0.37, height * 0.5, width * 0.08, 0, Math.PI * 2);
        ctx.stroke();

        // Plus symbol for buff
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width * 0.7, height * 0.4);
        ctx.lineTo(width * 0.7, height * 0.6);
        ctx.moveTo(width * 0.65, height * 0.5);
        ctx.lineTo(width * 0.75, height * 0.5);
        ctx.stroke();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate speed buff icon
     */
    async generateSpeedBuff(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background circle
        ctx.fillStyle = '#00CED1';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.35, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Lightning bolt symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(width * 0.35, height * 0.3);
        ctx.lineTo(width * 0.45, height * 0.3);
        ctx.lineTo(width * 0.4, height * 0.45);
        ctx.lineTo(width * 0.6, height * 0.45);
        ctx.lineTo(width * 0.5, height * 0.65);
        ctx.lineTo(width * 0.65, height * 0.65);
        ctx.stroke();

        // Motion lines
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);

        for (let i = 0; i < 3; i++) {
            const y = height * (0.35 + i * 0.15);
            ctx.beginPath();
            ctx.moveTo(width * 0.75, y);
            ctx.lineTo(width * 0.85, y);
            ctx.stroke();
        }

        ctx.setLineDash([]);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate defense buff icon
     */
    async generateDefenseBuff(config) {
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

        // Shield symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Shield outline
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.25);
        ctx.lineTo(width * 0.35, height * 0.4);
        ctx.lineTo(width * 0.35, height * 0.7);
        ctx.lineTo(width * 0.65, height * 0.7);
        ctx.lineTo(width * 0.65, height * 0.4);
        ctx.closePath();
        ctx.stroke();

        // Shield boss
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.45, width * 0.05, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate health buff icon
     */
    async generateHealthBuff(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background circle
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.35, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Heart symbol
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.65);
        ctx.bezierCurveTo(width * 0.35, height * 0.55, width * 0.35, height * 0.4, width * 0.5, height * 0.35);
        ctx.bezierCurveTo(width * 0.65, height * 0.4, width * 0.65, height * 0.55, width * 0.5, height * 0.65);
        ctx.closePath();
        ctx.fill();

        // Regeneration arrows
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;

        // Upward arrow
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.25);
        ctx.lineTo(width * 0.5, height * 0.15);
        ctx.lineTo(width * 0.45, height * 0.2);
        ctx.moveTo(width * 0.5, height * 0.15);
        ctx.lineTo(width * 0.55, height * 0.2);
        ctx.stroke();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate mana buff icon
     */
    async generateManaBuff(config) {
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

        // Magic crystal symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Crystal outline
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.25);
        ctx.lineTo(width * 0.35, height * 0.45);
        ctx.lineTo(width * 0.5, height * 0.65);
        ctx.lineTo(width * 0.65, height * 0.45);
        ctx.closePath();
        ctx.stroke();

        // Inner crystal facets
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.35);
        ctx.lineTo(width * 0.42, height * 0.5);
        ctx.lineTo(width * 0.5, height * 0.55);
        ctx.lineTo(width * 0.58, height * 0.5);
        ctx.closePath();
        ctx.stroke();

        // Magic sparkles
        ctx.fillStyle = '#FFFACD';
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const distance = width * 0.35;
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
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
     * Save buff icon to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = BuffIconGenerator;
