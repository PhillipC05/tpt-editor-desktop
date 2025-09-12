/**
 * TPT Path Generator
 * Generates various types of paths and walkways for game environments
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PathGenerator {
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
     * Generate path sprite
     */
    async generatePath(config) {
        const width = 32;
        const height = 32;

        await this.initImage(width, height);

        switch (config.pathType) {
            case 'dirt':
                await this.generateDirtPath(config);
                break;
            case 'stone':
                await this.generateStonePath(config);
                break;
            case 'brick':
                await this.generateBrickPath(config);
                break;
            case 'gravel':
                await this.generateGravelPath(config);
                break;
            case 'wood':
                await this.generateWoodPath(config);
                break;
            default:
                await this.generateDirtPath(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.pathType.charAt(0).toUpperCase() + config.pathType.slice(1)} Path`,
            type: 'path',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                pathType: config.pathType,
                width: config.width || 'standard',
                condition: config.condition || 'well_maintained',
                season: config.season || 'spring',
                material: config.material || 'natural',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate dirt path
     */
    async generateDirtPath(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const baseColor = this.getPathColor('dirt', config.condition || 'well_maintained');

        // Create base dirt texture
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        // Add dirt texture variation
        this.addDirtTexture(ctx, width, height, config);

        // Add path edges/wear
        if (config.condition === 'worn') {
            this.addWearEffects(ctx, width, height);
        } else if (config.condition === 'overgrown') {
            this.addOvergrowth(ctx, width, height);
        }

        // Add seasonal effects
        if (config.season === 'autumn') {
            this.addAutumnLeaves(ctx, width, height);
        } else if (config.season === 'winter') {
            this.addSnowCover(ctx, width, height);
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate stone path
     */
    async generateStonePath(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const stoneColor = this.getPathColor('stone', config.condition || 'well_maintained');

        // Create stone slab pattern
        const slabSize = config.width === 'wide' ? 12 : 8;
        const rows = Math.ceil(height / slabSize);
        const cols = Math.ceil(width / slabSize);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * slabSize;
                const y = row * slabSize;

                // Slight color variation for each slab
                const slabColor = this.adjustColorBrightness(stoneColor, (Math.random() - 0.5) * 20);
                ctx.fillStyle = slabColor;

                // Draw slab with slight irregularities
                ctx.beginPath();
                ctx.roundRect(x + 1, y + 1, slabSize - 2, slabSize - 2, 1);
                ctx.fill();

                // Add mortar lines
                ctx.strokeStyle = '#666666';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, slabSize, slabSize);
            }
        }

        // Add stone texture
        this.addStoneTexture(ctx, width, height, config);

        // Add wear effects
        if (config.condition === 'worn') {
            this.addStoneWear(ctx, width, height);
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate brick path
     */
    async generateBrickPath(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const brickColor = this.getPathColor('brick', config.condition || 'well_maintained');
        const mortarColor = '#8B7355';

        // Create brick pattern
        const brickWidth = config.width === 'wide' ? 10 : 8;
        const brickHeight = config.width === 'wide' ? 6 : 4;
        const mortarThickness = 1;

        const rows = Math.ceil(height / (brickHeight + mortarThickness));
        const cols = Math.ceil(width / (brickWidth + mortarThickness));

        for (let row = 0; row < rows; row++) {
            // Offset every other row for brick pattern
            const offset = (row % 2) * (brickWidth / 2);

            for (let col = 0; col < cols; col++) {
                const x = col * (brickWidth + mortarThickness) + offset;
                const y = row * (brickHeight + mortarThickness);

                // Slight color variation for each brick
                const brickVariation = this.adjustColorBrightness(brickColor, (Math.random() - 0.5) * 30);
                ctx.fillStyle = brickVariation;
                ctx.fillRect(x, y, brickWidth, brickHeight);
            }
        }

        // Add mortar
        ctx.fillStyle = mortarColor;
        for (let row = 0; row < rows; row++) {
            const offset = (row % 2) * (brickWidth / 2);

            for (let col = 0; col < cols; col++) {
                const x = col * (brickWidth + mortarThickness) + offset;
                const y = row * (brickHeight + mortarThickness);

                // Horizontal mortar
                ctx.fillRect(x, y + brickHeight, brickWidth, mortarThickness);
                // Vertical mortar
                ctx.fillRect(x + brickWidth, y, mortarThickness, brickHeight + mortarThickness);
            }
        }

        // Add brick texture and wear
        this.addBrickTexture(ctx, width, height, config);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate gravel path
     */
    async generateGravelPath(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const gravelColor = this.getPathColor('gravel', config.condition || 'well_maintained');

        // Create base gravel layer
        ctx.fillStyle = gravelColor;
        ctx.fillRect(0, 0, width, height);

        // Add individual gravel stones
        const stoneCount = config.density === 'dense' ? 25 : config.density === 'sparse' ? 10 : 18;

        for (let i = 0; i < stoneCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 1;

            // Slight color variation for each stone
            const stoneColor = this.adjustColorBrightness(gravelColor, (Math.random() - 0.5) * 40);
            ctx.fillStyle = stoneColor;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Add highlight
            ctx.fillStyle = this.adjustColorBrightness(stoneColor, 30);
            ctx.beginPath();
            ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add gravel texture
        this.addGravelTexture(ctx, width, height, config);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate wood path
     */
    async generateWoodPath(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const woodColor = this.getPathColor('wood', config.condition || 'well_maintained');

        // Create wooden plank pattern
        const plankWidth = config.width === 'wide' ? width : 12;
        const plankHeight = 8;

        const rows = Math.ceil(height / plankHeight);

        for (let row = 0; row < rows; row++) {
            const y = row * plankHeight;

            // Draw plank
            ctx.fillStyle = this.adjustColorBrightness(woodColor, (Math.random() - 0.5) * 20);
            ctx.fillRect(0, y, plankWidth, plankHeight);

            // Add wood grain
            ctx.strokeStyle = this.adjustColorBrightness(woodColor, -30);
            ctx.lineWidth = 1;

            for (let i = 0; i < 3; i++) {
                const grainY = y + plankHeight * (0.2 + i * 0.3);
                ctx.beginPath();
                ctx.moveTo(0, grainY);
                ctx.lineTo(plankWidth, grainY + (Math.random() - 0.5) * 2);
                ctx.stroke();
            }

            // Add plank separation
            if (row < rows - 1) {
                ctx.fillStyle = '#4A4A4A';
                ctx.fillRect(0, y + plankHeight - 1, plankWidth, 2);
            }
        }

        // Add wood wear and texture
        this.addWoodTexture(ctx, width, height, config);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Get path color based on type and condition
     */
    getPathColor(type, condition) {
        const colors = {
            dirt: {
                well_maintained: '#8B4513',
                worn: '#654321',
                overgrown: '#4A4A4A'
            },
            stone: {
                well_maintained: '#A9A9A9',
                worn: '#808080',
                overgrown: '#696969'
            },
            brick: {
                well_maintained: '#CD853F',
                worn: '#A0522D',
                overgrown: '#8B4513'
            },
            gravel: {
                well_maintained: '#D3D3D3',
                worn: '#B0B0B0',
                overgrown: '#A0A0A0'
            },
            wood: {
                well_maintained: '#8B4513',
                worn: '#654321',
                overgrown: '#4A4A4A'
            }
        };

        return colors[type]?.[condition] || colors.dirt.well_maintained;
    }

    /**
     * Add dirt texture
     */
    addDirtTexture(ctx, width, height, config) {
        // Add small dirt particles and variations
        ctx.fillStyle = this.adjustColorBrightness(ctx.fillStyle, -20);

        for (let i = 0; i < 15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add stone texture
     */
    addStoneTexture(ctx, width, height, config) {
        // Add stone surface variations
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';

        for (let i = 0; i < 10; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 4 + 2;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add brick texture
     */
    addBrickTexture(ctx, width, height, config) {
        // Add subtle brick surface variations
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add gravel texture
     */
    addGravelTexture(ctx, width, height, config) {
        // Add small gravel highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';

        for (let i = 0; i < 12; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 1.5 + 0.5;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add wood texture
     */
    addWoodTexture(ctx, width, height, config) {
        // Add wood knot and grain variations
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';

        for (let i = 0; i < 8; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 2;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add wear effects
     */
    addWearEffects(ctx, width, height) {
        // Add worn path effects
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';

        for (let i = 0; i < 10; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 6 + 3;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add overgrowth effects
     */
    addOvergrowth(ctx, width, height) {
        // Add grass and weed overgrowth
        ctx.fillStyle = '#228B22';

        for (let i = 0; i < 8; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const height = Math.random() * 4 + 2;

            ctx.fillRect(x, y, 1, height);
        }
    }

    /**
     * Add autumn leaves
     */
    addAutumnLeaves(ctx, width, height) {
        const leafColors = ['#DC143C', '#FFA500', '#FFD700'];

        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const color = leafColors[Math.floor(Math.random() * leafColors.length)];

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add snow cover
     */
    addSnowCover(ctx, width, height) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(0, 0, width, height);

        // Add snow texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';

        for (let i = 0; i < 15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Add stone wear effects
     */
    addStoneWear(ctx, width, height) {
        // Add cracks and wear to stone
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;

        for (let i = 0; i < 3; i++) {
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            const endX = startX + (Math.random() - 0.5) * 10;
            const endY = startY + (Math.random() - 0.5) * 10;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
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
     * Save path to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = PathGenerator;
