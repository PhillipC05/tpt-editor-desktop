/**
 * TPT Pixel Art Generator
 * Generates general pixel art images, scenes, and artwork
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PixelArtGenerator {
    constructor() {
        this.image = null;
        this.width = 0;
        this.height = 0;
        this.palette = {};
    }

    /**
     * Initialize image with given dimensions
     */
    async initImage(width, height) {
        this.width = width;
        this.height = height;
        this.image = new Jimp(width, height, 0x00000000); // Transparent background
        this.initializePalette();
    }

    /**
     * Initialize color palette
     */
    initializePalette() {
        this.palette = {
            // Basic colors
            black: 0xFF000000,
            white: 0xFFFFFFFF,
            red: 0xFFFF0000,
            green: 0xFF00FF00,
            blue: 0xFF0000FF,
            yellow: 0xFFFFFF00,
            cyan: 0xFF00FFFF,
            magenta: 0xFFFF00FF,

            // Extended palette
            darkGray: 0xFF333333,
            gray: 0xFF666666,
            lightGray: 0xFFAAAAAA,
            brown: 0xFF8B4513,
            orange: 0xFFFFA500,
            pink: 0xFFFFC0CB,
            purple: 0xFF800080,
            navy: 0xFF000080,
            teal: 0xFF008080,
            lime: 0xFF00FF80,
            maroon: 0xFF800000,
            olive: 0xFF808000,

            // Skin tones
            skinLight: 0xFFF5DEB3,
            skinMedium: 0xFFD2B48C,
            skinDark: 0xFF8B4513,

            // Nature colors
            grassGreen: 0xFF228B22,
            treeGreen: 0xFF006400,
            skyBlue: 0xFF87CEEB,
            cloudWhite: 0xFFFAF0E6,
            dirtBrown: 0xFF8B4513,
            stoneGray: 0xFF696969,
            waterBlue: 0xFF4169E1,

            // Building colors
            brickRed: 0xFFCD5C5C,
            woodBrown: 0xFF8B4513,
            roofRed: 0xFF8B0000,
            windowBlue: 0xFF4682B4
        };
    }

    /**
     * Generate pixel art based on type
     */
    async generatePixelArt(config) {
        const width = config.width || 64;
        const height = config.height || 64;

        await this.initImage(width, height);

        switch (config.artType) {
            case 'landscape':
                await this.generateLandscape(config);
                break;
            case 'portrait':
                await this.generatePortrait(config);
                break;
            case 'abstract':
                await this.generateAbstract(config);
                break;
            case 'geometric':
                await this.generateGeometric(config);
                break;
            case 'character':
                await this.generateCharacter(config);
                break;
            case 'building':
                await this.generateBuilding(config);
                break;
            case 'nature':
                await this.generateNature(config);
                break;
            case 'space':
                await this.generateSpace(config);
                break;
            case 'fantasy':
                await this.generateFantasy(config);
                break;
            case 'retro':
                await this.generateRetro(config);
                break;
            default:
                await this.generateLandscape(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.artType.charAt(0).toUpperCase() + config.artType.slice(1)} Pixel Art`,
            type: 'pixel_art',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                artType: config.artType,
                style: config.style || 'default',
                theme: config.theme || 'neutral',
                complexity: config.complexity || 'medium',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate landscape pixel art
     */
    async generateLandscape(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
        skyGradient.addColorStop(0, '#87CEEB'); // Sky blue
        skyGradient.addColorStop(1, '#E0F6FF'); // Light blue
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, height * 0.6);

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.2, width * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Mountains
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.6);
        ctx.lineTo(width * 0.2, height * 0.3);
        ctx.lineTo(width * 0.4, height * 0.4);
        ctx.lineTo(width * 0.6, height * 0.2);
        ctx.lineTo(width * 0.8, height * 0.35);
        ctx.lineTo(width, height * 0.6);
        ctx.closePath();
        ctx.fill();

        // Trees
        for (let i = 0; i < 8; i++) {
            const treeX = (i * width) / 8 + Math.random() * 20 - 10;
            const treeHeight = height * (0.4 + Math.random() * 0.2);

            // Trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(treeX - 2, height * 0.6 - treeHeight * 0.3, 4, treeHeight * 0.3);

            // Leaves
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(treeX, height * 0.6 - treeHeight, treeHeight * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ground
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, height * 0.6, width, height * 0.4);

        // Flowers
        for (let i = 0; i < 15; i++) {
            const flowerX = Math.random() * width;
            const flowerY = height * (0.65 + Math.random() * 0.3);

            // Stem
            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(flowerX, flowerY);
            ctx.lineTo(flowerX, flowerY - 8);
            ctx.stroke();

            // Flower
            ctx.fillStyle = ['#FF69B4', '#FFD700', '#FF6347', '#9370DB'][Math.floor(Math.random() * 4)];
            ctx.beginPath();
            ctx.arc(flowerX, flowerY - 8, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate portrait pixel art
     */
    async generatePortrait(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(0, 0, width, height);

        // Face
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.45, width * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(width * 0.42, height * 0.4, width * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.58, height * 0.4, width * 0.03, 0, Math.PI * 2);
        ctx.fill();

        // Eye whites
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(width * 0.425, height * 0.395, width * 0.015, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.585, height * 0.395, width * 0.015, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.42);
        ctx.lineTo(width * 0.5, height * 0.48);
        ctx.stroke();

        // Mouth
        ctx.strokeStyle = '#FF6347';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.52, width * 0.08, 0, Math.PI);
        ctx.stroke();

        // Hair
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.25, width * 0.28, 0, Math.PI * 2);
        ctx.fill();

        // Shirt
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.moveTo(width * 0.2, height * 0.7);
        ctx.lineTo(width * 0.8, height * 0.7);
        ctx.lineTo(width * 0.75, height);
        ctx.lineTo(width * 0.25, height);
        ctx.closePath();
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate abstract pixel art
     */
    async generateAbstract(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Random color palette for abstract art
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

        // Generate random shapes
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 10 + Math.random() * 30;
            const color = colors[Math.floor(Math.random() * colors.length)];

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.7;

            if (Math.random() < 0.5) {
                // Circle
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Rectangle
                ctx.fillRect(x - size/2, y - size/2, size, size);
            }
        }

        // Add some geometric patterns
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        for (let i = 0; i < 10; i++) {
            const x1 = Math.random() * width;
            const y1 = Math.random() * height;
            const x2 = Math.random() * width;
            const y2 = Math.random() * height;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate geometric pixel art
     */
    async generateGeometric(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Generate geometric patterns
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

        // Circles
        for (let i = 0; i < 8; i++) {
            const x = width * (0.1 + (i % 4) * 0.2);
            const y = height * (0.2 + Math.floor(i / 4) * 0.3);
            const radius = width * 0.08;

            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Triangles
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.1);
        ctx.lineTo(width * 0.3, height * 0.4);
        ctx.lineTo(width * 0.7, height * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Squares
        ctx.fillStyle = '#FF6347';
        ctx.fillRect(width * 0.1, height * 0.6, width * 0.15, width * 0.15);
        ctx.strokeRect(width * 0.1, height * 0.6, width * 0.15, width * 0.15);

        ctx.fillStyle = '#32CD32';
        ctx.fillRect(width * 0.75, height * 0.6, width * 0.15, width * 0.15);
        ctx.strokeRect(width * 0.75, height * 0.6, width * 0.15, width * 0.15);

        // Hexagon
        ctx.fillStyle = '#9370DB';
        ctx.beginPath();
        const centerX = width * 0.5;
        const centerY = height * 0.8;
        const hexRadius = width * 0.08;

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = centerX + hexRadius * Math.cos(angle);
            const y = centerY + hexRadius * Math.sin(angle);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate character pixel art
     */
    async generateCharacter(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Background
        ctx.fillStyle = '#E6E6FA';
        ctx.fillRect(0, 0, width, height);

        // Character body (simple stick figure style)
        const centerX = width * 0.5;
        const bodyY = height * 0.5;

        // Head
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.arc(centerX, height * 0.3, width * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX - width * 0.02, height * 0.28, width * 0.01, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + width * 0.02, height * 0.28, width * 0.01, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, height * 0.38);
        ctx.lineTo(centerX, height * 0.6);
        ctx.stroke();

        // Arms
        ctx.beginPath();
        ctx.moveTo(centerX, height * 0.45);
        ctx.lineTo(centerX - width * 0.08, height * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, height * 0.45);
        ctx.lineTo(centerX + width * 0.08, height * 0.5);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(centerX, height * 0.6);
        ctx.lineTo(centerX - width * 0.05, height * 0.75);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, height * 0.6);
        ctx.lineTo(centerX + width * 0.05, height * 0.75);
        ctx.stroke();

        // Clothes
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(centerX - width * 0.06, height * 0.4, width * 0.12, height * 0.15);

        // Hat
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(centerX - width * 0.05, height * 0.2, width * 0.1, height * 0.05);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate building pixel art
     */
    async generateBuilding(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Sky background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, width, height);

        // Building base
        ctx.fillStyle = '#CD5C5C';
        ctx.fillRect(width * 0.2, height * 0.4, width * 0.6, height * 0.6);

        // Building outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(width * 0.2, height * 0.4, width * 0.6, height * 0.6);

        // Windows
        ctx.fillStyle = '#4682B4';
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const windowX = width * (0.25 + col * 0.12);
                const windowY = height * (0.45 + row * 0.15);
                ctx.fillRect(windowX, windowY, width * 0.08, height * 0.08);
                ctx.strokeRect(windowX, windowY, width * 0.08, height * 0.08);
            }
        }

        // Door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(width * 0.45, height * 0.85, width * 0.1, height * 0.15);
        ctx.strokeRect(width * 0.45, height * 0.85, width * 0.1, height * 0.15);

        // Roof
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(width * 0.15, height * 0.4);
        ctx.lineTo(width * 0.5, height * 0.2);
        ctx.lineTo(width * 0.85, height * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Chimney
        ctx.fillStyle = '#696969';
        ctx.fillRect(width * 0.65, height * 0.25, width * 0.05, height * 0.1);
        ctx.strokeRect(width * 0.65, height * 0.25, width * 0.05, height * 0.1);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate nature pixel art
     */
    async generateNature(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Sky
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, width, height * 0.7);

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.2, width * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Mountains in background
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        ctx.lineTo(width * 0.3, height * 0.4);
        ctx.lineTo(width * 0.7, height * 0.5);
        ctx.lineTo(width, height * 0.7);
        ctx.closePath();
        ctx.fill();

        // Lake
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.8, width * 0.3, height * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trees
        for (let i = 0; i < 6; i++) {
            const treeX = width * (0.1 + i * 0.15);
            const treeBaseY = height * 0.75;

            // Trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(treeX - 3, treeBaseY - 20, 6, 20);

            // Leaves
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(treeX, treeBaseY - 25, 15, 0, Math.PI * 2);
            ctx.fill();
        }

        // Flowers
        const flowerColors = ['#FF69B4', '#FFD700', '#FF6347', '#9370DB'];
        for (let i = 0; i < 12; i++) {
            const flowerX = Math.random() * width;
            const flowerY = height * (0.75 + Math.random() * 0.2);

            // Stem
            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(flowerX, flowerY);
            ctx.lineTo(flowerX, flowerY - 8);
            ctx.stroke();

            // Flower
            ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            ctx.beginPath();
            ctx.arc(flowerX, flowerY - 8, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate space pixel art
     */
    async generateSpace(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Space background (dark)
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, width, height);

        // Stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
            const starX = Math.random() * width;
            const starY = Math.random() * height;
            const starSize = Math.random() * 2 + 1;

            ctx.beginPath();
            ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Planets
        // Planet 1
        ctx.fillStyle = '#CD853F';
        ctx.beginPath();
        ctx.arc(width * 0.2, height * 0.3, width * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Planet 2
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(width * 0.7, height * 0.6, width * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Planet 3 (gas giant)
        const gradient = ctx.createRadialGradient(
            width * 0.5, height * 0.8, 0,
            width * 0.5, height * 0.8, width * 0.15
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.7, '#FF6347');
        gradient.addColorStop(1, '#8B0000');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.8, width * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Rings for gas giant
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.8, width * 0.18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.8, width * 0.22, 0, Math.PI * 2);
        ctx.stroke();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate fantasy pixel art
     */
    async generateFantasy(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Mystical background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#4B0082');
        bgGradient.addColorStop(0.5, '#8A2BE2');
        bgGradient.addColorStop(1, '#DA70D6');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Magical runes/symbols
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 3;

        // Draw mystical symbols
        for (let i = 0; i < 8; i++) {
            const symbolX = width * (0.1 + i * 0.1);
            const symbolY = height * (0.2 + (i % 2) * 0.6);

            // Random mystical symbol
            ctx.save();
            ctx.translate(symbolX, symbolY);
            ctx.rotate((i / 8) * Math.PI * 2);

            // Draw a mystical rune
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.lineTo(10, -10);
            ctx.lineTo(0, 10);
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        // Floating crystals
        for (let i = 0; i < 5; i++) {
            const crystalX = width * (0.2 + i * 0.15);
            const crystalY = height * (0.4 + Math.random() * 0.4);

            ctx.fillStyle = '#9370DB';
            ctx.beginPath();
            ctx.moveTo(crystalX, crystalY - 10);
            ctx.lineTo(crystalX - 8, crystalY + 10);
            ctx.lineTo(crystalX + 8, crystalY + 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Magical particles
        ctx.fillStyle = '#FFFACD';
        for (let i = 0; i < 30; i++) {
            const particleX = Math.random() * width;
            const particleY = Math.random() * height;
            const particleSize = Math.random() * 3 + 1;

            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate retro pixel art
     */
    async generateRetro(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        // Retro color palette
        const retroColors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

        // Create a retro pattern
        const pixelSize = 4;
        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                const colorIndex = Math.floor(Math.random() * retroColors.length);
                ctx.fillStyle = retroColors[colorIndex];
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }

        // Add some retro shapes
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        // Retro spaceship
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(width * 0.4, height * 0.3, width * 0.2, height * 0.1);
        ctx.strokeRect(width * 0.4, height * 0.3, width * 0.2, height * 0.1);

        // Wings
        ctx.beginPath();
        ctx.moveTo(width * 0.4, height * 0.35);
        ctx.lineTo(width * 0.3, height * 0.4);
        ctx.lineTo(width * 0.4, height * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width * 0.6, height * 0.35);
        ctx.lineTo(width * 0.7, height * 0.4);
        ctx.lineTo(width * 0.6, height * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Retro cityscape
        ctx.fillStyle = '#808080';
        for (let i = 0; i < 8; i++) {
            const buildingHeight = height * (0.3 + Math.random() * 0.4);
            const buildingWidth = width * 0.08;
            const buildingX = i * width * 0.11 + width * 0.05;

            ctx.fillRect(buildingX, height - buildingHeight, buildingWidth, buildingHeight);
            ctx.strokeRect(buildingX, height - buildingHeight, buildingWidth, buildingHeight);

            // Windows
            ctx.fillStyle = '#FFFF00';
            for (let w = 0; w < 3; w++) {
                for (let h = 0; h < 5; h++) {
                    if (Math.random() < 0.7) {
                        ctx.fillRect(
                            buildingX + w * buildingWidth * 0.3 + buildingWidth * 0.1,
                            height - buildingHeight + h * buildingHeight * 0.15 + buildingHeight * 0.1,
                            buildingWidth * 0.2,
                            buildingHeight * 0.1
                        );
                    }
                }
            }
            ctx.fillStyle = '#808080';
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
     * Save pixel art to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = PixelArtGenerator;
