/**
 * TPT Building Generator - JavaScript/Node.js version
 * Procedural building and architecture sprite generation
 */

const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class BuildingGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Initialize canvas with given dimensions
     */
    initCanvas(width, height) {
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');

        // Enable alpha blending
        this.ctx.globalCompositeOperation = 'source-over';

        // Clear canvas with transparent background
        this.ctx.clearRect(0, 0, width, height);
    }

    /**
     * Generate house sprite
     */
    async generateHouse(config) {
        const width = 48;
        const height = 64;

        this.initCanvas(width, height);

        switch (config.houseType) {
            case 'cottage':
                this.generateCottage(config);
                break;
            case 'mansion':
                this.generateMansion(config);
                break;
            case 'castle':
                this.generateCastle(config);
                break;
            case 'tower':
                this.generateTower(config);
                break;
            case 'shop':
                this.generateShop(config);
                break;
            default:
                this.generateCottage(config);
        }

        // Convert to buffer
        const buffer = this.canvas.toBuffer('image/png');

        return {
            id: uuidv4(),
            name: `${config.houseType.charAt(0).toUpperCase() + config.houseType.slice(1)} Building`,
            type: 'building',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                buildingType: config.houseType,
                style: config.style || 'traditional',
                color: config.color || '#8B4513',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate cottage
     */
    generateCottage(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const wallColor = config.color || '#8B4513';
        const roofColor = config.roofColor || '#654321';

        // Foundation
        ctx.fillStyle = '#696969';
        ctx.fillRect(width * 0.1, height * 0.85, width * 0.8, height * 0.15);

        // Walls
        ctx.fillStyle = wallColor;
        ctx.fillRect(width * 0.2, height * 0.5, width * 0.6, height * 0.35);

        // Roof
        ctx.fillStyle = roofColor;
        ctx.beginPath();
        ctx.moveTo(width * 0.15, height * 0.5);
        ctx.lineTo(width * 0.5, height * 0.3);
        ctx.lineTo(width * 0.85, height * 0.5);
        ctx.closePath();
        ctx.fill();

        // Chimney
        ctx.fillStyle = '#696969';
        ctx.fillRect(width * 0.7, height * 0.25, width * 0.08, height * 0.25);

        // Door
        this.addDoor(width * 0.45, height * 0.7, width * 0.1, height * 0.15);

        // Windows
        this.addWindow(width * 0.3, height * 0.55, width * 0.08, height * 0.1);
        this.addWindow(width * 0.62, height * 0.55, width * 0.08, height * 0.1);

        // Decorative elements
        this.addDecorativeElements(config);
    }

    /**
     * Generate mansion
     */
    generateMansion(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const wallColor = config.color || '#F5F5DC';
        const roofColor = config.roofColor || '#8B4513';

        // Foundation
        ctx.fillStyle = '#696969';
        ctx.fillRect(width * 0.05, height * 0.9, width * 0.9, height * 0.1);

        // Main building
        ctx.fillStyle = wallColor;
        ctx.fillRect(width * 0.1, height * 0.4, width * 0.8, height * 0.5);

        // Second floor
        ctx.fillRect(width * 0.15, height * 0.2, width * 0.7, height * 0.3);

        // Roof
        ctx.fillStyle = roofColor;
        ctx.beginPath();
        ctx.moveTo(width * 0.1, height * 0.2);
        ctx.lineTo(width * 0.5, height * 0.1);
        ctx.lineTo(width * 0.9, height * 0.2);
        ctx.closePath();
        ctx.fill();

        // Columns
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(width * 0.2, height * 0.4, width * 0.05, height * 0.5);
        ctx.fillRect(width * 0.75, height * 0.4, width * 0.05, height * 0.5);

        // Chimneys
        ctx.fillStyle = '#696969';
        ctx.fillRect(width * 0.15, height * 0.05, width * 0.06, height * 0.15);
        ctx.fillRect(width * 0.79, height * 0.05, width * 0.06, height * 0.15);

        // Doors and windows
        this.addDoor(width * 0.47, height * 0.75, width * 0.06, height * 0.15);
        this.addWindow(width * 0.25, height * 0.45, width * 0.08, height * 0.12);
        this.addWindow(width * 0.67, height * 0.45, width * 0.08, height * 0.12);
        this.addWindow(width * 0.25, height * 0.25, width * 0.08, height * 0.12);
        this.addWindow(width * 0.47, height * 0.25, width * 0.08, height * 0.12);
        this.addWindow(width * 0.67, height * 0.25, width * 0.08, height * 0.12);

        // Balcony
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(width * 0.2, height * 0.35, width * 0.6, height * 0.05);
    }

    /**
     * Generate castle
     */
    generateCastle(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const wallColor = config.color || '#696969';
        const roofColor = config.roofColor || '#000000';

        // Base walls
        ctx.fillStyle = wallColor;
        ctx.fillRect(width * 0.1, height * 0.6, width * 0.8, height * 0.3);

        // Towers
        ctx.fillRect(width * 0.05, height * 0.3, width * 0.15, height * 0.4);
        ctx.fillRect(width * 0.8, height * 0.3, width * 0.15, height * 0.4);

        // Tower roofs
        ctx.fillStyle = roofColor;
        ctx.beginPath();
        ctx.moveTo(width * 0.05, height * 0.3);
        ctx.lineTo(width * 0.125, height * 0.2);
        ctx.lineTo(width * 0.2, height * 0.3);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width * 0.8, height * 0.3);
        ctx.lineTo(width * 0.875, height * 0.2);
        ctx.lineTo(width * 0.95, height * 0.3);
        ctx.closePath();
        ctx.fill();

        // Main roof
        ctx.fillStyle = roofColor;
        ctx.beginPath();
        ctx.moveTo(width * 0.1, height * 0.4);
        ctx.lineTo(width * 0.5, height * 0.25);
        ctx.lineTo(width * 0.9, height * 0.4);
        ctx.closePath();
        ctx.fill();

        // Battlements
        ctx.fillStyle = wallColor;
        for (let i = 0; i < 8; i++) {
            const x = width * (0.15 + i * 0.08);
            ctx.fillRect(x, height * 0.35, width * 0.04, height * 0.05);
        }

        // Portcullis
        ctx.fillStyle = '#000000';
        ctx.fillRect(width * 0.45, height * 0.6, width * 0.1, height * 0.3);

        // Arrow slits
        ctx.fillStyle = '#000000';
        ctx.fillRect(width * 0.08, height * 0.45, width * 0.04, height * 0.1);
        ctx.fillRect(width * 0.88, height * 0.45, width * 0.04, height * 0.1);
    }

    /**
     * Generate tower
     */
    generateTower(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const wallColor = config.color || '#8B4513';
        const roofColor = config.roofColor || '#654321';

        // Tower base
        ctx.fillStyle = wallColor;
        ctx.fillRect(width * 0.3, height * 0.8, width * 0.4, height * 0.2);

        // Tower walls
        ctx.fillRect(width * 0.35, height * 0.2, width * 0.3, height * 0.6);

        // Roof
        ctx.fillStyle = roofColor;
        ctx.beginPath();
        ctx.moveTo(width * 0.3, height * 0.2);
        ctx.lineTo(width * 0.5, height * 0.1);
        ctx.lineTo(width * 0.7, height * 0.2);
        ctx.closePath();
        ctx.fill();

        // Windows
        this.addWindow(width * 0.4, height * 0.3, width * 0.08, height * 0.08);
        this.addWindow(width * 0.4, height * 0.45, width * 0.08, height * 0.08);
        this.addWindow(width * 0.4, height * 0.6, width * 0.08, height * 0.08);

        // Door
        this.addDoor(width * 0.45, height * 0.85, width * 0.1, height * 0.15);

        // Battlements
        ctx.fillStyle = wallColor;
        for (let i = 0; i < 5; i++) {
            const x = width * (0.36 + i * 0.05);
            ctx.fillRect(x, height * 0.15, width * 0.02, height * 0.05);
        }
    }

    /**
     * Generate shop
     */
    generateShop(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const wallColor = config.color || '#F5F5DC';
        const roofColor = config.roofColor || '#8B4513';

        // Foundation
        ctx.fillStyle = '#696969';
        ctx.fillRect(width * 0.1, height * 0.9, width * 0.8, height * 0.1);

        // Walls
        ctx.fillStyle = wallColor;
        ctx.fillRect(width * 0.15, height * 0.5, width * 0.7, height * 0.4);

        // Roof
        ctx.fillStyle = roofColor;
        ctx.beginPath();
        ctx.moveTo(width * 0.1, height * 0.5);
        ctx.lineTo(width * 0.5, height * 0.35);
        ctx.lineTo(width * 0.9, height * 0.5);
        ctx.closePath();
        ctx.fill();

        // Sign
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(width * 0.35, height * 0.2, width * 0.3, height * 0.15);

        // Door
        this.addDoor(width * 0.45, height * 0.75, width * 0.1, height * 0.15);

        // Windows
        this.addWindow(width * 0.25, height * 0.55, width * 0.08, height * 0.1);
        this.addWindow(width * 0.67, height * 0.55, width * 0.08, height * 0.1);

        // Display window
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(width * 0.2, height * 0.65, width * 0.6, height * 0.1);
    }

    /**
     * Add door to building
     */
    addDoor(x, y, width, height) {
        const ctx = this.ctx;

        // Door frame
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, width, height);

        // Door
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 2, y + 2, width - 4, height - 4);

        // Handle
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(x + width - 6, y + height * 0.5, 2, 2, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Add window to building
     */
    addWindow(x, y, width, height) {
        const ctx = this.ctx;

        // Window frame
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, width, height);

        // Window glass
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + 2, y + 2, width - 4, height - 4);

        // Window cross
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + width * 0.5 - 1, y + 2, 2, height - 4);
        ctx.fillRect(x + 2, y + height * 0.5 - 1, width - 4, 2);
    }

    /**
     * Add decorative elements
     */
    addDecorativeElements(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        if (config.style === 'gothic') {
            // Gothic arches
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.7, width * 0.15, 0, Math.PI);
            ctx.stroke();
        } else if (config.style === 'modern') {
            // Modern lines
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(width * 0.2, height * 0.6);
            ctx.lineTo(width * 0.8, height * 0.6);
            ctx.stroke();
        }

        // Flowers or plants
        if (config.hasGarden) {
            ctx.fillStyle = '#228B22';
            ctx.fillRect(width * 0.1, height * 0.9, width * 0.1, height * 0.1);
            ctx.fillRect(width * 0.8, height * 0.9, width * 0.1, height * 0.1);

            // Flowers
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.ellipse(width * 0.15, height * 0.85, 3, 3, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(width * 0.85, height * 0.85, 3, 3, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    /**
     * Add chimney
     */
    addChimney(x, y, width, height) {
        const ctx = this.ctx;

        ctx.fillStyle = '#696969';
        ctx.fillRect(x, y, width, height);

        // Smoke
        ctx.fillStyle = '#D3D3D3';
        ctx.beginPath();
        ctx.ellipse(x + width * 0.5, y - 5, 4, 3, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Add roof details
     */
    addRoofDetails(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        if (config.roofType === 'tiled') {
            ctx.fillStyle = '#8B4513';
            for (let i = 0; i < 10; i++) {
                const x = width * (0.2 + i * 0.06);
                const y = height * (0.35 + (i % 2) * 0.02);
                ctx.fillRect(x, y, width * 0.04, height * 0.02);
            }
        }
    }

    /**
     * Add architectural style elements
     */
    addArchitecturalStyle(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        if (config.architecturalStyle === 'victorian') {
            // Victorian details
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(width * 0.3, height * 0.4, width * 0.4, height * 0.05);
        } else if (config.architecturalStyle === 'colonial') {
            // Colonial pillars
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(width * 0.25, height * 0.5, width * 0.05, height * 0.3);
            ctx.fillRect(width * 0.7, height * 0.5, width * 0.05, height * 0.3);
        }
    }

    /**
     * Save building to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = BuildingGenerator;
