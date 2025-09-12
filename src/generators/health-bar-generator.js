/**
 * TPT Health Bar Generator
 * Generates various health bar styles for game UI
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class HealthBarGenerator {
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
     * Generate health bar sprite
     */
    async generateHealthBar(config) {
        const width = config.width || 64;
        const height = config.height || 8;

        await this.initImage(width, height);

        switch (config.barStyle) {
            case 'standard':
                await this.generateStandardBar(config);
                break;
            case 'segmented':
                await this.generateSegmentedBar(config);
                break;
            case 'circular':
                await this.generateCircularBar(config);
                break;
            case 'hearts':
                await this.generateHeartsBar(config);
                break;
            case 'custom':
                await this.generateCustomBar(config);
                break;
            default:
                await this.generateStandardBar(config);
        }

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.barStyle.charAt(0).toUpperCase() + config.barStyle.slice(1)} Health Bar`,
            type: 'health_bar',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                barStyle: config.barStyle,
                maxHealth: config.maxHealth || 100,
                currentHealth: config.currentHealth || 100,
                width: width,
                height: height,
                colorScheme: config.colorScheme || 'red_green',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate standard health bar
     */
    async generateStandardBar(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const maxHealth = config.maxHealth || 100;
        const currentHealth = config.currentHealth || 100;
        const healthPercent = Math.max(0, Math.min(1, currentHealth / maxHealth));

        // Background (empty health)
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(0, 0, width, height);

        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, width, height);

        // Fill (current health)
        const fillWidth = width * healthPercent;
        const gradient = ctx.createLinearGradient(0, 0, fillWidth, 0);

        if (config.colorScheme === 'red_green') {
            gradient.addColorStop(0, '#FF0000');
            gradient.addColorStop(0.5, '#FFA500');
            gradient.addColorStop(1, '#00FF00');
        } else if (config.colorScheme === 'blue_white') {
            gradient.addColorStop(0, '#FF0000');
            gradient.addColorStop(1, '#00BFFF');
        } else {
            gradient.addColorStop(0, '#FF0000');
            gradient.addColorStop(1, '#00FF00');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(1, 1, fillWidth - 2, height - 2);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate segmented health bar
     */
    async generateSegmentedBar(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const maxHealth = config.maxHealth || 100;
        const currentHealth = config.currentHealth || 100;
        const segments = config.segments || 10;
        const segmentWidth = width / segments;

        // Background segments
        ctx.fillStyle = '#8B0000';
        for (let i = 0; i < segments; i++) {
            const x = i * segmentWidth;
            ctx.fillRect(x + 1, 1, segmentWidth - 2, height - 2);

            // Segment divider
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + segmentWidth, 0);
            ctx.lineTo(x + segmentWidth, height);
            ctx.stroke();
        }

        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);

        // Fill active segments
        const activeSegments = Math.ceil((currentHealth / maxHealth) * segments);

        for (let i = 0; i < activeSegments; i++) {
            const x = i * segmentWidth;
            const gradient = ctx.createLinearGradient(x, 0, x + segmentWidth, 0);

            if (config.colorScheme === 'red_green') {
                gradient.addColorStop(0, '#FF0000');
                gradient.addColorStop(1, '#00FF00');
            } else {
                gradient.addColorStop(0, '#FF0000');
                gradient.addColorStop(1, '#00BFFF');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(x + 2, 2, segmentWidth - 4, height - 4);
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate circular health bar
     */
    async generateCircularBar(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const radius = Math.min(width, height) * 0.4;

        const maxHealth = config.maxHealth || 100;
        const currentHealth = config.currentHealth || 100;
        const healthPercent = Math.max(0, Math.min(1, currentHealth / maxHealth));

        // Background circle
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Health arc
        const startAngle = -Math.PI * 0.5; // Start from top
        const endAngle = startAngle + (Math.PI * 2 * healthPercent);

        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate hearts-based health bar
     */
    async generateHeartsBar(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const maxHealth = config.maxHealth || 100;
        const currentHealth = config.currentHealth || 100;
        const hearts = config.hearts || 5;
        const heartSize = Math.min(width / hearts * 0.8, height * 0.8);
        const spacing = width / hearts;

        for (let i = 0; i < hearts; i++) {
            const x = i * spacing + (spacing - heartSize) * 0.5;
            const y = (height - heartSize) * 0.5;

            const heartHealth = Math.max(0, Math.min(1, (currentHealth - (i * maxHealth / hearts)) / (maxHealth / hearts)));

            // Draw heart outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            this.drawHeart(ctx, x, y, heartSize);

            // Fill heart based on health
            if (heartHealth > 0) {
                const gradient = ctx.createRadialGradient(
                    x + heartSize * 0.3, y + heartSize * 0.2, 0,
                    x + heartSize * 0.5, y + heartSize * 0.5, heartSize * 0.5
                );

                if (heartHealth > 0.5) {
                    gradient.addColorStop(0, '#FF69B4');
                    gradient.addColorStop(1, '#DC143C');
                } else {
                    gradient.addColorStop(0, '#FFA07A');
                    gradient.addColorStop(1, '#FF6347');
                }

                ctx.fillStyle = gradient;
                this.drawHeart(ctx, x, y, heartSize * heartHealth);
            }
        }

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Generate custom health bar
     */
    async generateCustomBar(config) {
        const { width, height } = this.image.bitmap;
        const ctx = this.createCanvasContext(width, height);

        const maxHealth = config.maxHealth || 100;
        const currentHealth = config.currentHealth || 100;
        const healthPercent = Math.max(0, Math.min(1, currentHealth / maxHealth));

        // Custom background with pattern
        ctx.fillStyle = '#654321';
        ctx.fillRect(0, 0, width, height);

        // Add texture
        ctx.fillStyle = 'rgba(101, 67, 33, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 4 + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Border with custom style
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);

        // Inner border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 3, width - 6, height - 6);

        // Health fill with custom gradient
        const fillWidth = (width - 8) * healthPercent;
        const gradient = ctx.createLinearGradient(4, 0, fillWidth + 4, 0);

        if (config.colorScheme === 'red_green') {
            gradient.addColorStop(0, '#8B0000');
            gradient.addColorStop(0.3, '#DC143C');
            gradient.addColorStop(0.7, '#FF6347');
            gradient.addColorStop(1, '#32CD32');
        } else {
            gradient.addColorStop(0, '#8B0000');
            gradient.addColorStop(1, '#00BFFF');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(4, 4, fillWidth, height - 8);

        // Add shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(4, 4, fillWidth * 0.3, 2);

        await this.applyCanvasToImage(ctx);
    }

    /**
     * Draw heart shape
     */
    drawHeart(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);

        ctx.beginPath();
        ctx.moveTo(size * 0.5, size * 0.25);
        ctx.bezierCurveTo(size * 0.5, size * 0.1, size * 0.25, size * 0.1, size * 0.25, size * 0.25);
        ctx.bezierCurveTo(size * 0.25, size * 0.4, size * 0.5, size * 0.55, size * 0.5, size * 0.55);
        ctx.bezierCurveTo(size * 0.5, size * 0.55, size * 0.75, size * 0.4, size * 0.75, size * 0.25);
        ctx.bezierCurveTo(size * 0.75, size * 0.1, size * 0.5, size * 0.1, size * 0.5, size * 0.25);
        ctx.closePath();

        ctx.restore();
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
     * Save health bar to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = HealthBarGenerator;
