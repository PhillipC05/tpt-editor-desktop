/**
 * TPT Vehicle Generator - JavaScript/Node.js version
 * Procedural vehicle sprite generation for the desktop application
 */

const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class VehicleGenerator {
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
     * Generate car sprite
     */
    async generateCar(config) {
        const width = 64;
        const height = 32;

        this.initCanvas(width, height);

        // Generate car based on type
        switch (config.carType) {
            case 'sedan':
                this.generateSedan(config);
                break;
            case 'truck':
                this.generateTruck(config);
                break;
            case 'sports':
                this.generateSportsCar(config);
                break;
            case 'van':
                this.generateVan(config);
                break;
            default:
                this.generateSedan(config);
        }

        // Convert to buffer
        const buffer = this.canvas.toBuffer('image/png');

        return {
            id: uuidv4(),
            name: `${config.carType.charAt(0).toUpperCase() + config.carType.slice(1)} Car`,
            type: 'vehicle',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                vehicleType: 'car',
                carType: config.carType,
                color: config.color || '#FF0000',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate motorcycle sprite
     */
    async generateMotorcycle(config) {
        const width = 48;
        const height = 24;

        this.initCanvas(width, height);

        this.generateMotorcycleBody(config);

        const buffer = this.canvas.toBuffer('image/png');

        return {
            id: uuidv4(),
            name: 'Motorcycle',
            type: 'vehicle',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                vehicleType: 'motorcycle',
                color: config.color || '#000000',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate spaceship sprite
     */
    async generateSpaceship(config) {
        const width = 56;
        const height = 32;

        this.initCanvas(width, height);

        switch (config.shipType) {
            case 'fighter':
                this.generateFighter(config);
                break;
            case 'cruiser':
                this.generateCruiser(config);
                break;
            case 'cargo':
                this.generateCargoShip(config);
                break;
            default:
                this.generateFighter(config);
        }

        const buffer = this.canvas.toBuffer('image/png');

        return {
            id: uuidv4(),
            name: `${config.shipType.charAt(0).toUpperCase() + config.shipType.slice(1)} Spaceship`,
            type: 'vehicle',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                vehicleType: 'spaceship',
                shipType: config.shipType,
                color: config.color || '#808080',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate boat sprite
     */
    async generateBoat(config) {
        const width = 64;
        const height = 24;

        this.initCanvas(width, height);

        switch (config.boatType) {
            case 'sailboat':
                this.generateSailboat(config);
                break;
            case 'motorboat':
                this.generateMotorboat(config);
                break;
            case 'canoe':
                this.generateCanoe(config);
                break;
            default:
                this.generateSailboat(config);
        }

        const buffer = this.canvas.toBuffer('image/png');

        return {
            id: uuidv4(),
            name: `${config.boatType.charAt(0).toUpperCase() + config.boatType.slice(1)} Boat`,
            type: 'vehicle',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                vehicleType: 'boat',
                boatType: config.boatType,
                color: config.color || '#8B4513',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate submarine sprite
     */
    async generateSubmarine(config) {
        const width = 72;
        const height = 20;

        this.initCanvas(width, height);

        this.generateSubmarineBody(config);

        const buffer = this.canvas.toBuffer('image/png');

        return {
            id: uuidv4(),
            name: 'Submarine',
            type: 'vehicle',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                vehicleType: 'submarine',
                color: config.color || '#000080',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate sedan car
     */
    generateSedan(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#FF0000';

        // Car body
        ctx.fillStyle = color;
        ctx.fillRect(width * 0.2, height * 0.4, width * 0.6, height * 0.4);

        // Car roof
        ctx.fillRect(width * 0.3, height * 0.2, width * 0.4, height * 0.3);

        // Wheels
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(width * 0.25, height * 0.9, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width * 0.75, height * 0.9, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(width * 0.32, height * 0.25, width * 0.15, height * 0.2);
        ctx.fillRect(width * 0.53, height * 0.25, width * 0.15, height * 0.2);

        // Headlights
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(width * 0.15, height * 0.5, width * 0.03, height * 0.1);
        ctx.fillRect(width * 0.82, height * 0.5, width * 0.03, height * 0.1);

        // Exhaust
        ctx.fillStyle = '#808080';
        ctx.fillRect(width * 0.85, height * 0.7, width * 0.05, height * 0.05);
    }

    /**
     * Generate truck
     */
    generateTruck(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#000080';

        // Truck body
        ctx.fillStyle = color;
        ctx.fillRect(width * 0.15, height * 0.3, width * 0.7, height * 0.5);

        // Truck bed
        ctx.fillRect(width * 0.5, height * 0.2, width * 0.35, height * 0.4);

        // Wheels
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(width * 0.2, height * 0.9, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width * 0.4, height * 0.9, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width * 0.7, height * 0.9, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(width * 0.17, height * 0.35, width * 0.1, height * 0.15);

        // Headlights
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(width * 0.1, height * 0.4, width * 0.03, height * 0.1);
    }

    /**
     * Generate sports car
     */
    generateSportsCar(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#FF4500';

        // Sleek body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.6, width * 0.4, height * 0.25, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Car roof
        ctx.fillRect(width * 0.35, height * 0.3, width * 0.3, height * 0.2);

        // Wheels
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(width * 0.25, height * 0.85, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width * 0.75, height * 0.85, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Spoiler
        ctx.fillStyle = '#808080';
        ctx.fillRect(width * 0.8, height * 0.2, width * 0.1, height * 0.15);

        // Headlights
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(width * 0.15, height * 0.5, width * 0.03, height * 0.08);
        ctx.fillRect(width * 0.82, height * 0.5, width * 0.03, height * 0.08);
    }

    /**
     * Generate van
     */
    generateVan(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#FFFFFF';

        // Van body
        ctx.fillStyle = color;
        ctx.fillRect(width * 0.2, height * 0.3, width * 0.6, height * 0.5);

        // Van roof
        ctx.fillRect(width * 0.25, height * 0.15, width * 0.5, height * 0.25);

        // Wheels
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(width * 0.25, height * 0.9, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width * 0.75, height * 0.9, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(width * 0.27, height * 0.2, width * 0.15, height * 0.15);
        ctx.fillRect(width * 0.48, height * 0.2, width * 0.15, height * 0.15);
        ctx.fillRect(width * 0.65, height * 0.2, width * 0.15, height * 0.15);

        // Sliding door
        ctx.fillStyle = '#808080';
        ctx.fillRect(width * 0.45, height * 0.35, width * 0.02, height * 0.4);
    }

    /**
     * Generate motorcycle body
     */
    generateMotorcycleBody(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#000000';

        // Motorcycle frame
        ctx.fillStyle = color;
        ctx.fillRect(width * 0.3, height * 0.5, width * 0.4, height * 0.1);

        // Handlebars
        ctx.fillRect(width * 0.25, height * 0.4, width * 0.5, height * 0.05);

        // Seat
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(width * 0.4, height * 0.3, width * 0.3, height * 0.15);

        // Wheels
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(width * 0.25, height * 0.8, width * 0.08, height * 0.12, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width * 0.75, height * 0.8, width * 0.08, height * 0.12, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Engine
        ctx.fillStyle = '#808080';
        ctx.fillRect(width * 0.35, height * 0.55, width * 0.15, height * 0.08);
    }

    /**
     * Generate fighter spaceship
     */
    generateFighter(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#808080';

        // Main body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.2);
        ctx.lineTo(width * 0.3, height * 0.8);
        ctx.lineTo(width * 0.5, height * 0.7);
        ctx.lineTo(width * 0.7, height * 0.8);
        ctx.closePath();
        ctx.fill();

        // Wings
        ctx.fillRect(width * 0.1, height * 0.6, width * 0.3, height * 0.1);
        ctx.fillRect(width * 0.6, height * 0.6, width * 0.3, height * 0.1);

        // Cockpit
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.35, width * 0.15, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Engines
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(width * 0.25, height * 0.75, width * 0.05, height * 0.1);
        ctx.fillRect(width * 0.7, height * 0.75, width * 0.05, height * 0.1);
    }

    /**
     * Generate cruiser spaceship
     */
    generateCruiser(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#C0C0C0';

        // Main body
        ctx.fillStyle = color;
        ctx.fillRect(width * 0.2, height * 0.4, width * 0.6, height * 0.3);

        // Bridge
        ctx.fillRect(width * 0.4, height * 0.2, width * 0.2, height * 0.25);

        // Wings
        ctx.fillRect(width * 0.05, height * 0.5, width * 0.25, height * 0.1);
        ctx.fillRect(width * 0.7, height * 0.5, width * 0.25, height * 0.1);

        // Engines
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(width * 0.15, height * 0.7, width * 0.05, height * 0.15);
        ctx.fillRect(width * 0.8, height * 0.7, width * 0.05, height * 0.15);

        // Windows
        ctx.fillStyle = '#FFFF00';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(width * (0.25 + i * 0.1), height * 0.45, width * 0.02, height * 0.05);
        }
    }

    /**
     * Generate cargo ship
     */
    generateCargoShip(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#696969';

        // Hull
        ctx.fillStyle = color;
        ctx.fillRect(width * 0.1, height * 0.6, width * 0.8, height * 0.2);

        // Superstructure
        ctx.fillRect(width * 0.6, height * 0.3, width * 0.2, height * 0.35);

        // Cargo containers
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(width * 0.15, height * 0.4, width * 0.1, height * 0.2);
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(width * 0.3, height * 0.4, width * 0.1, height * 0.2);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(width * 0.45, height * 0.4, width * 0.1, height * 0.2);

        // Bridge
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(width * 0.65, height * 0.35, width * 0.1, height * 0.1);
    }

    /**
     * Generate sailboat
     */
    generateSailboat(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#8B4513';

        // Hull
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(width * 0.2, height * 0.8);
        ctx.lineTo(width * 0.8, height * 0.8);
        ctx.lineTo(width * 0.7, height * 0.9);
        ctx.lineTo(width * 0.3, height * 0.9);
        ctx.closePath();
        ctx.fill();

        // Mast
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(width * 0.5 - 2, height * 0.2, 4, height * 0.6);

        // Sail
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.2);
        ctx.lineTo(width * 0.3, height * 0.6);
        ctx.lineTo(width * 0.5, height * 0.8);
        ctx.closePath();
        ctx.fill();

        // Rudder
        ctx.fillStyle = '#000000';
        ctx.fillRect(width * 0.75, height * 0.85, width * 0.02, height * 0.1);
    }

    /**
     * Generate motorboat
     */
    generateMotorboat(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#000080';

        // Hull
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(width * 0.15, height * 0.7);
        ctx.lineTo(width * 0.85, height * 0.7);
        ctx.lineTo(width * 0.75, height * 0.9);
        ctx.lineTo(width * 0.25, height * 0.9);
        ctx.closePath();
        ctx.fill();

        // Cabin
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(width * 0.4, height * 0.4, width * 0.2, height * 0.3);

        // Engine
        ctx.fillStyle = '#808080';
        ctx.fillRect(width * 0.8, height * 0.6, width * 0.1, height * 0.15);

        // Wake
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(width * 0.1, height * 0.95, width * 0.8, height * 0.05);
    }

    /**
     * Generate canoe
     */
    generateCanoe(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#8B4513';

        // Canoe hull
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.8, width * 0.4, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Paddles
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(width * 0.2, height * 0.3, width * 0.02, height * 0.4);
        ctx.fillRect(width * 0.78, height * 0.3, width * 0.02, height * 0.4);
    }

    /**
     * Generate submarine body
     */
    generateSubmarineBody(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const color = config.color || '#000080';

        // Main body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.5, width * 0.4, height * 0.3, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Sail
        ctx.fillRect(width * 0.4, height * 0.2, width * 0.2, height * 0.4);

        // Periscope
        ctx.fillStyle = '#808080';
        ctx.fillRect(width * 0.48, height * 0.1, width * 0.04, height * 0.15);

        // Propeller
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.ellipse(width * 0.9, height * 0.5, width * 0.03, height * 0.08, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.ellipse(width * 0.35, height * 0.5, width * 0.05, height * 0.08, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width * 0.65, height * 0.5, width * 0.05, height * 0.08, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Add wheels to vehicle
     */
    addWheels(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        ctx.fillStyle = '#000000';

        // Front wheel
        ctx.beginPath();
        ctx.ellipse(width * 0.25, height * 0.9, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Rear wheel
        ctx.beginPath();
        ctx.ellipse(width * 0.75, height * 0.9, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Wheel details
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.ellipse(width * 0.25, height * 0.9, width * 0.04, height * 0.05, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width * 0.75, height * 0.9, width * 0.04, height * 0.05, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Add damage effects
     */
    addDamage(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        if (config.damage && config.damage > 0) {
            ctx.fillStyle = '#000000';

            // Add dents and scratches
            for (let i = 0; i < config.damage * 5; i++) {
                const x = Math.floor(Math.random() * width);
                const y = Math.floor(Math.random() * height);
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    /**
     * Add lights
     */
    addLights(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        // Headlights
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(width * 0.15, height * 0.5, width * 0.03, height * 0.1);
        ctx.fillRect(width * 0.82, height * 0.5, width * 0.03, height * 0.1);

        // Taillights
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(width * 0.1, height * 0.7, width * 0.02, height * 0.08);
        ctx.fillRect(width * 0.88, height * 0.7, width * 0.02, height * 0.08);
    }

    /**
     * Add exhaust
     */
    addExhaust(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        ctx.fillStyle = '#808080';
        ctx.fillRect(width * 0.85, height * 0.7, width * 0.05, height * 0.05);
    }

    /**
     * Save vehicle to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }

    /**
     * Export vehicle metadata as JSON
     */
    async exportAsJSON(asset) {
        // Create a clean metadata object for export
        const exportData = {
            id: asset.id,
            name: asset.name,
            type: asset.type,
            config: asset.config,
            metadata: asset.metadata,
            sprite: {
                width: asset.sprite.width,
                height: asset.sprite.height,
                format: asset.sprite.format
            },
            export: {
                format: 'json',
                timestamp: new Date().toISOString(),
                version: '1.0'
            }
        };

        return {
            ...asset,
            data: JSON.stringify(exportData, null, 2),
            format: 'json',
            metadata: {
                ...asset.metadata,
                exported: new Date().toISOString(),
                exportFormat: 'json'
            }
        };
    }

    /**
     * Export vehicle as sprite sheet
     */
    async exportAsSpriteSheet(asset, options = {}) {
        // For now, we'll just return the original sprite with metadata
        // In a more advanced implementation, this could combine multiple sprites
        return {
            ...asset,
            sprite: {
                ...asset.sprite,
                format: 'png',
                sheet: true
            },
            metadata: {
                ...asset.metadata,
                exported: new Date().toISOString(),
                exportFormat: 'spritesheet'
            }
        };
    }
}

module.exports = VehicleGenerator;
