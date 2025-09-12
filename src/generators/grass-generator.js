/**
 * TPT Grass Generator
 * Generates various types of grass patches with different styles and variations
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class GrassGenerator {
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
     * Generate grass sprite
     */
    async generateGrass(config) {
        const width = 24;
        const height = 16;

        await this.initImage(width, height);

        switch (config.grassType) {
            case 'short':
                await this.generateShortGrass(config);
                break;
            case 'tall':
                await this.generateTallGrass(config);
                break;
            case 'decorative':
                await this.generateDecorativeGrass(config);
                break;
            case 'patch':
                await this.generateGrassPatch(config);
                break;
            default:
                await this.generateShortGrass(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.color || 'Green'} ${config.grassType.charAt(0).toUpperCase() + config.grassType.slice(1)} Grass`,
            type: 'grass',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                grassType: config.grassType,
                color: config.color || 'green',
                density: config.density || 'medium',
                season: config.season || 'summer',
                height: config.height || 'short',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate short grass (meadow grass)
     */
    async generateShortGrass(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const baseColor = this.getGrassColor(config.color || 'green');
        const bladeCount = config.density === 'dense' ? 15 : config.density === 'sparse' ? 5 : 10;

        // Draw multiple grass blades
        for (let i = 0; i < bladeCount; i++) {
            const x = Math.random() * width;
            const y = height * (0.6 + Math.random() * 0.4); // Bottom 60-100% of height
            const bladeHeight = height * (0.2 + Math.random() * 0.3); // 20-50% of total height
            const bladeWidth = width * 0.02;

            // Slight color variation for each blade
            const bladeColor = this.adjustColorBrightness(baseColor, (Math.random() - 0.5) * 40);

            ctx.strokeStyle = bladeColor;
            ctx.lineWidth = bladeWidth;
            ctx.lineCap = 'round';

            // Draw curved blade
            ctx.beginPath();
            ctx.moveTo(x, y);
            const curveX = x + (Math.random() - 0.5) * width * 0.1;
            const curveY = y - bladeHeight * 0.7;
            ctx.quadraticCurveTo(curveX, curveY, x + (Math.random() - 0.5) * width * 0.05, y - bladeHeight);
            ctx.stroke();
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate tall grass
     */
    async generateTallGrass(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const baseColor = this.getGrassColor(config.color || 'green');
        const bladeCount = config.density === 'dense' ? 12 : config.density === 'sparse' ? 4 : 8;

        // Draw taller, more dramatic grass blades
        for (let i = 0; i < bladeCount; i++) {
            const x = Math.random() * width;
            const y = height * (0.8 + Math.random() * 0.2); // Bottom 80-100% of height
            const bladeHeight = height * (0.6 + Math.random() * 0.4); // 60-100% of total height
            const bladeWidth = width * 0.03;

            const bladeColor = this.adjustColorBrightness(baseColor, (Math.random() - 0.5) * 30);

            ctx.strokeStyle = bladeColor;
            ctx.lineWidth = bladeWidth;
            ctx.lineCap = 'round';

            // Draw more curved, flowing blade
            ctx.beginPath();
            ctx.moveTo(x, y);
            const cp1x = x + (Math.random() - 0.5) * width * 0.2;
            const cp1y = y - bladeHeight * 0.4;
            const cp2x = x + (Math.random() - 0.5) * width * 0.15;
            const cp2y = y - bladeHeight * 0.8;
            const endX = x + (Math.random() - 0.5) * width * 0.1;
            const endY = y - bladeHeight;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
            ctx.stroke();

            // Add secondary blades for more fullness
            if (Math.random() > 0.6) {
                ctx.strokeStyle = this.adjustColorBrightness(bladeColor, -20);
                ctx.lineWidth = bladeWidth * 0.7;
                ctx.beginPath();
                ctx.moveTo(x + width * 0.02, y);
                ctx.quadraticCurveTo(
                    x + width * 0.02 + (Math.random() - 0.5) * width * 0.1,
                    y - bladeHeight * 0.5,
                    x + width * 0.02 + (Math.random() - 0.5) * width * 0.05,
                    y - bladeHeight * 0.8
                );
                ctx.stroke();
            }
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate decorative grass
     */
    async generateDecorativeGrass(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const baseColor = this.getGrassColor(config.color || 'green');

        // Create a more stylized, decorative pattern
        const patternSize = Math.min(width, height) * 0.8;
        const centerX = width * 0.5;
        const centerY = height * 0.7;

        // Draw radial grass pattern
        const bladeCount = 16;
        for (let i = 0; i < bladeCount; i++) {
            const angle = (i / bladeCount) * Math.PI * 2;
            const distance = patternSize * (0.3 + Math.random() * 0.4);

            const startX = centerX + Math.cos(angle) * (patternSize * 0.2);
            const startY = centerY + Math.sin(angle) * (patternSize * 0.2);
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;

            const bladeColor = this.adjustColorBrightness(baseColor, (Math.random() - 0.5) * 50);

            ctx.strokeStyle = bladeColor;
            ctx.lineWidth = width * 0.015;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Add some smaller accent blades
        for (let i = 0; i < 8; i++) {
            const x = centerX + (Math.random() - 0.5) * patternSize * 0.6;
            const y = centerY + (Math.random() - 0.5) * patternSize * 0.6;

            if (x >= 0 && x < width && y >= 0 && y < height) {
                const bladeColor = this.adjustColorBrightness(baseColor, (Math.random() - 0.5) * 40);

                ctx.strokeStyle = bladeColor;
                ctx.lineWidth = width * 0.01;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + (Math.random() - 0.5) * width * 0.1, y - height * 0.15);
                ctx.stroke();
            }
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate grass patch
     */
    async generateGrassPatch(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const baseColor = this.getGrassColor(config.color || 'green');

        // Create irregular patch shape
        ctx.fillStyle = baseColor;
        ctx.beginPath();

        // Generate irregular shape using multiple curves
        const points = [];
        const numPoints = 8;

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = Math.min(width, height) * (0.3 + Math.random() * 0.3);
            const x = width * 0.5 + Math.cos(angle) * radius;
            const y = height * 0.5 + Math.sin(angle) * radius;
            points.push({ x, y });
        }

        // Draw smooth curve through points
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const prevPoint = points[i - 1];
            const currentPoint = points[i];
            const nextPoint = points[(i + 1) % points.length];

            const cp1x = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
            const cp1y = prevPoint.y + (currentPoint.y - prevPoint.y) * 0.5;
            const cp2x = currentPoint.x - (nextPoint.x - currentPoint.x) * 0.5;
            const cp2y = currentPoint.y - (nextPoint.y - currentPoint.y) * 0.5;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, currentPoint.x, currentPoint.y);
        }
        ctx.closePath();
        ctx.fill();

        // Add grass blades within the patch
        const bladeCount = config.density === 'dense' ? 20 : config.density === 'sparse' ? 8 : 12;

        for (let i = 0; i < bladeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * Math.min(width, height) * 0.25;
            const x = width * 0.5 + Math.cos(angle) * radius;
            const y = height * 0.5 + Math.sin(angle) * radius;

            if (x >= 0 && x < width && y >= 0 && y < height) {
                const bladeColor = this.adjustColorBrightness(baseColor, (Math.random() - 0.5) * 30);

                ctx.strokeStyle = bladeColor;
                ctx.lineWidth = width * 0.01;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + (Math.random() - 0.5) * width * 0.08, y - height * 0.12);
                ctx.stroke();
            }
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Get grass color based on configuration
     */
    getGrassColor(color) {
        const colors = {
            green: '#228B22',
            light_green: '#32CD32',
            dark_green: '#006400',
            yellow_green: '#9ACD32',
            blue_green: '#00CED1',
            brown: '#8B4513',
            golden: '#DAA520'
        };
        return colors[color] || colors.green;
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
     * Save grass to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = GrassGenerator;
