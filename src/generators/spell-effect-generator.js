/**
 * TPT Spell Effect Generator
 * Generates various magical spell effects and projectiles
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class SpellEffectGenerator {
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
     * Generate spell effect sprite
     */
    async generateSpellEffect(config) {
        const width = 24;
        const height = 24;

        await this.initImage(width, height);

        switch (config.effectType) {
            case 'fireball':
                await this.generateFireball(config);
                break;
            case 'lightning':
                await this.generateLightning(config);
                break;
            case 'healing':
                await this.generateHealing(config);
                break;
            case 'shield':
                await this.generateShield(config);
                break;
            case 'teleport':
                await this.generateTeleport(config);
                break;
            case 'summon':
                await this.generateSummoningCircle(config);
                break;
            case 'elemental':
                await this.generateElementalEffect(config);
                break;
            case 'impact':
                await this.generateImpactEffect(config);
                break;
            default:
                await this.generateFireball(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.effectType.charAt(0).toUpperCase() + config.effectType.slice(1)} Spell Effect`,
            type: 'spell_effect',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                effectType: config.effectType,
                element: config.element || 'fire',
                intensity: config.intensity || 'medium',
                duration: config.duration || 'instant',
                size: config.size || 'medium',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate fireball effect
     */
    async generateFireball(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Core fireball
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.4
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FF6347');
        gradient.addColorStop(1, '#DC143C');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Flame tendrils
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const startX = width * 0.5 + Math.cos(angle) * width * 0.2;
            const startY = height * 0.5 + Math.sin(angle) * height * 0.2;
            const endX = width * 0.5 + Math.cos(angle) * width * 0.35;
            const endY = height * 0.5 + Math.sin(angle) * height * 0.35;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Inner glow
        ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.15, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate lightning bolt
     */
    async generateLightning(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        ctx.strokeStyle = '#00BFFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00BFFF';
        ctx.shadowBlur = 5;

        // Main lightning bolt path
        ctx.beginPath();
        ctx.moveTo(width * 0.1, height * 0.1);

        let currentX = width * 0.1;
        let currentY = height * 0.1;

        while (currentX < width * 0.9) {
            const nextX = currentX + width * 0.15;
            const nextY = currentY + (Math.random() - 0.5) * height * 0.3;
            ctx.lineTo(nextX, Math.max(0, Math.min(height, nextY)));
            currentX = nextX;
            currentY = nextY;
        }

        ctx.stroke();

        // Secondary branches
        ctx.strokeStyle = 'rgba(0, 191, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 3;

        for (let i = 0; i < 3; i++) {
            const branchStart = width * (0.2 + i * 0.2);
            ctx.beginPath();
            ctx.moveTo(branchStart, height * 0.3 + (Math.random() - 0.5) * height * 0.2);
            ctx.lineTo(branchStart + width * 0.1, height * 0.5 + (Math.random() - 0.5) * height * 0.2);
            ctx.stroke();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate healing effect
     */
    async generateHealing(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Healing cross
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(width * 0.2, height * 0.5);
        ctx.lineTo(width * 0.8, height * 0.5);
        ctx.stroke();

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.2);
        ctx.lineTo(width * 0.5, height * 0.8);
        ctx.stroke();

        // Healing particles
        ctx.fillStyle = '#90EE90';
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = width * (0.25 + Math.random() * 0.15);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Glow effect
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.4
        );
        gradient.addColorStop(0, 'rgba(50, 205, 50, 0.3)');
        gradient.addColorStop(1, 'rgba(50, 205, 50, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.4, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate shield effect
     */
    async generateShield(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Shield outline
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#4169E1';
        ctx.shadowBlur = 3;

        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.5, width * 0.35, height * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Shield interior
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.4, 0,
            width * 0.5, height * 0.5, width * 0.3
        );
        gradient.addColorStop(0, 'rgba(65, 105, 225, 0.4)');
        gradient.addColorStop(1, 'rgba(65, 105, 225, 0.1)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.5, width * 0.3, height * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Energy particles
        ctx.fillStyle = '#00BFFF';
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const distance = width * (0.2 + Math.random() * 0.15);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate teleport effect
     */
    async generateTeleport(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Portal rings
        for (let ring = 0; ring < 3; ring++) {
            const radius = width * (0.1 + ring * 0.15);
            const alpha = 1 - ring * 0.2;

            ctx.strokeStyle = `rgba(138, 43, 226, ${alpha})`;
            ctx.lineWidth = 3 - ring;
            ctx.shadowColor = '#8A2BE2';
            ctx.shadowBlur = 5;

            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.5, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Energy particles
        ctx.fillStyle = '#DDA0DD';
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = width * (0.05 + Math.random() * 0.25);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }

        // Central vortex
        const vortexGradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.15
        );
        vortexGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        vortexGradient.addColorStop(1, 'rgba(138, 43, 226, 0.4)');

        ctx.fillStyle = vortexGradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.15, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate summoning circle
     */
    async generateSummoningCircle(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Outer circle
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#8B0000';
        ctx.shadowBlur = 3;

        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        // Inner runes/symbols
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;

        // Pentagram
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const radius = width * 0.25;

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 72 - 90) * Math.PI / 180;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();

        // Connecting lines for pentagram
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle1 = (i * 72 - 90) * Math.PI / 180;
            const angle2 = ((i + 2) % 5 * 72 - 90) * Math.PI / 180;

            const x1 = centerX + Math.cos(angle1) * radius;
            const y1 = centerY + Math.sin(angle1) * radius;
            const x2 = centerX + Math.cos(angle2) * radius;
            const y2 = centerY + Math.sin(angle2) * radius;

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();

        // Energy particles
        ctx.fillStyle = '#FF4500';
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = width * (0.15 + Math.random() * 0.2);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate elemental effect
     */
    async generateElementalEffect(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const element = config.element || 'fire';
        let primaryColor, secondaryColor;

        switch (element) {
            case 'fire':
                primaryColor = '#FF4500';
                secondaryColor = '#FFD700';
                break;
            case 'ice':
                primaryColor = '#00CED1';
                secondaryColor = '#F0F8FF';
                break;
            case 'wind':
                primaryColor = '#98FB98';
                secondaryColor = '#F5F5F5';
                break;
            case 'earth':
                primaryColor = '#8B4513';
                secondaryColor = '#228B22';
                break;
            default:
                primaryColor = '#FF4500';
                secondaryColor = '#FFD700';
        }

        // Elemental orb
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.35
        );
        gradient.addColorStop(0, secondaryColor);
        gradient.addColorStop(0.7, primaryColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Elemental particles
        ctx.fillStyle = secondaryColor;
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const distance = width * (0.2 + Math.random() * 0.2);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate impact effect
     */
    async generateImpactEffect(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Shockwave rings
        for (let ring = 0; ring < 4; ring++) {
            const radius = width * (0.1 + ring * 0.15);
            const alpha = 0.8 - ring * 0.2;

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 4 - ring;
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 3;

            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.5, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Impact particles
        for (let i = 0; i < 25; i++) {
            const angle = (i / 25) * Math.PI * 2;
            const distance = width * (0.05 + Math.random() * 0.3);
            const x = width * 0.5 + Math.cos(angle) * distance;
            const y = height * 0.5 + Math.sin(angle) * distance;

            const colors = ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Central flash
        const flashGradient = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.2
        );
        flashGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        flashGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = flashGradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.2, 0, Math.PI * 2);
        ctx.fill();

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
     * Save spell effect to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = SpellEffectGenerator;
