/**
 * TPT Aura Generator
 * Generates various magical auras and protective fields
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AuraGenerator {
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
     * Generate aura sprite
     */
    async generateAura(config) {
        const width = 32;
        const height = 32;

        await this.initImage(width, height);

        switch (config.auraType) {
            case 'protection':
                await this.generateProtectionAura(config);
                break;
            case 'power':
                await this.generatePowerAura(config);
                break;
            case 'regeneration':
                await this.generateRegenerationAura(config);
                break;
            case 'curse':
                await this.generateCurseAura(config);
                break;
            case 'blessing':
                await this.generateBlessingAura(config);
                break;
            default:
                await this.generateProtectionAura(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.auraType.charAt(0).toUpperCase() + config.auraType.slice(1)} Aura`,
            type: 'aura',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                auraType: config.auraType,
                element: config.element || 'neutral',
                intensity: config.intensity || 'medium',
                duration: config.duration || 'temporary',
                size: config.size || 'medium',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate protection aura
     */
    async generateProtectionAura(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Outer protective ring
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#4169E1';
        ctx.shadowBlur = 5;

        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        // Inner energy field
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.35
        );
        gradient.addColorStop(0, 'rgba(65, 105, 225, 0.6)');
        gradient.addColorStop(0.7, 'rgba(65, 105, 225, 0.3)');
        gradient.addColorStop(1, 'rgba(65, 105, 225, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Protective runes/symbols
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        // Draw shield-like symbols
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = width * 0.5 + Math.cos(angle) * width * 0.25;
            const y = height * 0.5 + Math.sin(angle) * height * 0.25;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Simple shield symbol
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.lineTo(-2, 3);
            ctx.lineTo(2, 3);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        }

        // Energy particles
        ctx.fillStyle = '#87CEEB';
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = width * (0.15 + Math.random() * 0.15);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate power aura
     */
    async generatePowerAura(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Intense energy field
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.45
        );
        gradient.addColorStop(0, 'rgba(255, 140, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 69, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Power symbols (flames/lightning)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 3;

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = width * 0.5 + Math.cos(angle) * width * 0.2;
            const y = height * 0.5 + Math.sin(angle) * height * 0.2;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Flame-like symbol
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(-2, 0);
            ctx.lineTo(2, 0);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        }

        // Intense energy particles
        ctx.fillStyle = '#FFA500';
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = width * (0.1 + Math.random() * 0.25);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 1.5 + Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate regeneration aura
     */
    async generateRegenerationAura(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Healing energy field
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.4
        );
        gradient.addColorStop(0, 'rgba(50, 205, 50, 0.7)');
        gradient.addColorStop(0.6, 'rgba(34, 139, 34, 0.4)');
        gradient.addColorStop(1, 'rgba(34, 139, 34, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Healing symbols (plus signs)
        ctx.strokeStyle = '#90EE90';
        ctx.lineWidth = 2;

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = width * 0.5 + Math.cos(angle) * width * 0.25;
            const y = height * 0.5 + Math.sin(angle) * height * 0.25;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle * 0.5); // Slight rotation

            // Plus symbol
            ctx.beginPath();
            ctx.moveTo(-3, 0);
            ctx.lineTo(3, 0);
            ctx.moveTo(0, -3);
            ctx.lineTo(0, 3);
            ctx.stroke();

            ctx.restore();
        }

        // Gentle healing particles
        ctx.fillStyle = '#98FB98';
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const distance = width * (0.15 + Math.random() * 0.15);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate curse aura
     */
    async generateCurseAura(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Dark, ominous energy field
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.45
        );
        gradient.addColorStop(0, 'rgba(139, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.6)');
        gradient.addColorStop(1, 'rgba(75, 0, 130, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Cursed symbols (skulls, bones)
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#8B0000';
        ctx.shadowBlur = 2;

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = width * 0.5 + Math.cos(angle) * width * 0.25;
            const y = height * 0.5 + Math.sin(angle) * height * 0.25;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Simple skull symbol
            ctx.beginPath();
            ctx.arc(0, -1, 2, 0, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-1.5, 0);
            ctx.lineTo(1.5, 0);
            ctx.stroke();

            ctx.restore();
        }

        // Dark energy particles
        ctx.fillStyle = '#DC143C';
        for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2;
            const distance = width * (0.1 + Math.random() * 0.25);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate blessing aura
     */
    async generateBlessingAura(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Holy, radiant energy field
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.4
        );
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Blessing symbols (stars, crosses)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 3;

        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const x = width * 0.5 + Math.cos(angle) * width * 0.25;
            const y = height * 0.5 + Math.sin(angle) * height * 0.25;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle * 0.3);

            if (i % 2 === 0) {
                // Star symbol
                ctx.beginPath();
                for (let j = 0; j < 5; j++) {
                    const starAngle = (j / 5) * Math.PI * 2;
                    const starX = Math.cos(starAngle) * 3;
                    const starY = Math.sin(starAngle) * 3;

                    if (j === 0) {
                        ctx.moveTo(starX, starY);
                    } else {
                        ctx.lineTo(starX, starY);
                    }
                }
                ctx.closePath();
                ctx.stroke();
            } else {
                // Cross symbol
                ctx.beginPath();
                ctx.moveTo(-2, 0);
                ctx.lineTo(2, 0);
                ctx.moveTo(0, -2);
                ctx.lineTo(0, 2);
                ctx.stroke();
            }

            ctx.restore();
        }

        // Radiant particles
        ctx.fillStyle = '#FFFACD';
        for (let i = 0; i < 18; i++) {
            const angle = (i / 18) * Math.PI * 2;
            const distance = width * (0.15 + Math.random() * 0.15);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
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
     * Save aura to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = AuraGenerator;
