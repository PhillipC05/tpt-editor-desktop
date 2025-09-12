/**
 * Tile Sprite Generator
 * Handles generation of tile sprites
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-utils');

class TileGenerator {
    constructor() {
        this.utils = new SpriteUtils();
    }

    /**
     * Main tile generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Generate tile based on type
        switch (config.tileType) {
            case 'grass':
                await this.generateGrassTile(config, image);
                break;
            case 'water':
                await this.generateWaterTile(config, image);
                break;
            case 'stone':
                await this.generateStoneTile(config, image);
                break;
            case 'dirt':
                await this.generateDirtTile(config, image);
                break;
            case 'sand':
                await this.generateSandTile(config, image);
                break;
            case 'snow':
                await this.generateSnowTile(config, image);
                break;
            case 'lava':
                await this.generateLavaTile(config, image);
                break;
            case 'ice':
                await this.generateIceTile(config, image);
                break;
            case 'wood':
                await this.generateWoodTile(config, image);
                break;
            case 'brick':
                await this.generateBrickTile(config, image);
                break;
            case 'metal':
                await this.generateMetalTile(config, image);
                break;
            case 'crystal':
                await this.generateCrystalTile(config, image);
                break;
            case 'moss':
                await this.generateMossTile(config, image);
                break;
            case 'mud':
                await this.generateMudTile(config, image);
                break;
            case 'gravel':
                await this.generateGravelTile(config, image);
                break;
            case 'cobblestone':
                await this.generateCobblestoneTile(config, image);
                break;
            case 'marble':
                await this.generateMarbleTile(config, image);
                break;
            case 'carpet':
                await this.generateCarpetTile(config, image);
                break;
            case 'tiles':
                await this.generateTilesTile(config, image);
                break;
            default:
                await this.generateGrassTile(config, image);
        }
    }

    /**
     * Generate grass tile
     */
    async generateGrassTile(config, image) {
        const { width, height } = image.bitmap;

        // Base grass color
        const grassColor = this.utils.getColor('#228B22');
        this.utils.drawRectangle(image, 0, 0, width, height, grassColor);

        // Add grass texture
        const textureColor = this.utils.getColor('#32CD32');
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            image.bitmap.data[idx] = (textureColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (textureColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = textureColor & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }

        // Add some grass blades
        const bladeColor = this.utils.getColor('#006400');
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * (height * 0.7) + height * 0.7);
            const bladeHeight = Math.floor(Math.random() * 8) + 3;
            for (let by = 0; by < bladeHeight && y + by < height; by++) {
                const idx = ((y + by) * width + x) * 4;
                image.bitmap.data[idx] = (bladeColor >> 16) & 0xFF;
                image.bitmap.data[idx + 1] = (bladeColor >> 8) & 0xFF;
                image.bitmap.data[idx + 2] = bladeColor & 0xFF;
                image.bitmap.data[idx + 3] = 255;
            }
        }
    }

    /**
     * Generate water tile
     */
    async generateWaterTile(config, image) {
        const { width, height } = image.bitmap;

        // Base water color
        const waterColor = this.utils.getColor('#00008B');
        this.utils.drawRectangle(image, 0, 0, width, height, waterColor);

        // Add water highlights
        const highlightColor = this.utils.getColor('#4682B4');
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            image.bitmap.data[idx] = (highlightColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (highlightColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = highlightColor & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }

        // Add ripples
        const rippleColor = this.utils.getColor('#87CEEB');
        for (let i = 0; i < 5; i++) {
            const centerX = Math.floor(Math.random() * width);
            const centerY = Math.floor(Math.random() * height);
            const radius = Math.floor(Math.random() * 10) + 5;

            for (let y = centerY - radius; y <= centerY + radius; y++) {
                for (let x = centerX - radius; x <= centerX + radius; x++) {
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const dx = (x - centerX) / radius;
                        const dy = (y - centerY) / radius;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= 1 && distance > 0.7) {
                            const idx = (y * width + x) * 4;
                            image.bitmap.data[idx] = (rippleColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (rippleColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = rippleColor & 0xFF;
                            image.bitmap.data[idx + 3] = 255;
                        }
                    }
                }
            }
        }
    }

    /**
     * Generate stone tile
     */
    async generateStoneTile(config, image) {
        const { width, height } = image.bitmap;

        // Base stone color
        const stoneColor = this.utils.getColor('#808080');
        this.utils.drawRectangle(image, 0, 0, width, height, stoneColor);

        // Add stone texture
        for (let i = 0; i < 50; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const color = Math.random() > 0.5 ? this.utils.getColor('#A9A9A9') : this.utils.getColor('#696969');
            const idx = (y * width + x) * 4;
            image.bitmap.data[idx] = (color >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = color & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }

        // Add some cracks (simple line representation)
        const crackColor = this.utils.getColor('#404040');
        for (let i = 0; i < 5; i++) {
            const x1 = Math.floor(Math.random() * width);
            const y1 = Math.floor(Math.random() * height);
            const x2 = Math.min(width - 1, x1 + Math.floor(Math.random() * 20) - 10);
            const y2 = Math.min(height - 1, y1 + Math.floor(Math.random() * 20) - 10);

            // Simple line drawing using Bresenham's algorithm
            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);
            const sx = x1 < x2 ? 1 : -1;
            const sy = y1 < y2 ? 1 : -1;
            let err = dx - dy;

            let x = x1;
            let y = y1;

            while (true) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx] = (crackColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (crackColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = crackColor & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }

                if (x === x2 && y === y2) break;

                const e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y += sy;
                }
            }
        }
    }

    /**
     * Generate dirt tile
     */
    async generateDirtTile(config, image) {
        const { width, height } = image.bitmap;

        // Base dirt color
        const dirtColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, 0, 0, width, height, dirtColor);

        // Add dirt texture
        const textureColor = this.utils.getColor('#A0522D');
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            image.bitmap.data[idx] = (textureColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (textureColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = textureColor & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }

        // Add some small rocks
        const rockColor = this.utils.getColor('#696969');
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const size = Math.floor(Math.random() * 3) + 1;
            this.utils.drawEllipse(image, x, y, size, size, rockColor);
        }
    }

    /**
     * Generate sand tile
     */
    async generateSandTile(config, image) {
        const { width, height } = image.bitmap;

        // Base sand color
        const sandColor = this.utils.getColor('#F4A460');
        this.utils.drawRectangle(image, 0, 0, width, height, sandColor);

        // Add sand texture
        const textureColor = this.utils.getColor('#DEB887');
        for (let i = 0; i < 25; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            image.bitmap.data[idx] = (textureColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (textureColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = textureColor & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }

        // Add some small dunes
        const duneColor = this.utils.getColor('#D2B48C');
        for (let i = 0; i < 3; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const size = Math.floor(Math.random() * 8) + 4;
            this.utils.drawEllipse(image, x, y, size, size * 0.6, duneColor);
        }
    }

    /**
     * Generate snow tile
     */
    async generateSnowTile(config, image) {
        const { width, height } = image.bitmap;

        // Base snow color
        const snowColor = this.utils.getColor('#FFFFFF');
        this.utils.drawRectangle(image, 0, 0, width, height, snowColor);

        // Add snow texture
        const textureColor = this.utils.getColor('#F8F8FF');
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            image.bitmap.data[idx] = (textureColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (textureColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = textureColor & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }
    }

    /**
     * Generate lava tile
     */
    async generateLavaTile(config, image) {
        const { width, height } = image.bitmap;

        // Base lava color
        const lavaColor = this.utils.getColor('#FF4500');
        this.utils.drawRectangle(image, 0, 0, width, height, lavaColor);

        // Add lava bubbles
        const bubbleColor = this.utils.getColor('#FFD700');
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const size = Math.floor(Math.random() * 4) + 2;
            this.utils.drawEllipse(image, x, y, size, size, bubbleColor);
        }

        // Add glow effect
        this.utils.applyGlow(image, Math.floor(width * 0.5), Math.floor(height * 0.5), Math.floor(width * 0.4), this.utils.getColor('#FF6347'), 0.4);
    }

    /**
     * Generate ice tile
     */
    async generateIceTile(config, image) {
        const { width, height } = image.bitmap;

        // Base ice color
        const iceColor = this.utils.getColor('#87CEEB');
        this.utils.drawRectangle(image, 0, 0, width, height, iceColor);

        // Add ice cracks
        const crackColor = this.utils.getColor('#4682B4');
        for (let i = 0; i < 8; i++) {
            const x1 = Math.floor(Math.random() * width);
            const y1 = Math.floor(Math.random() * height);
            const x2 = Math.min(width - 1, x1 + Math.floor(Math.random() * 15) - 7);
            const y2 = Math.min(height - 1, y1 + Math.floor(Math.random() * 15) - 7);

            this.utils.drawLine(image, x1, y1, x2, y2, crackColor);
        }
    }

    /**
     * Generate wood tile
     */
    async generateWoodTile(config, image) {
        const { width, height } = image.bitmap;

        // Base wood color
        const woodColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, 0, 0, width, height, woodColor);

        // Add wood grain
        const grainColor = this.utils.getColor('#A0522D');
        for (let i = 0; i < 6; i++) {
            const y = Math.floor(height * (0.1 + i * 0.15));
            this.utils.drawRectangle(image, 0, y, width, 2, grainColor);
        }
    }

    /**
     * Generate brick tile
     */
    async generateBrickTile(config, image) {
        const { width, height } = image.bitmap;

        // Base brick color
        const brickColor = this.utils.getColor('#CD853F');
        this.utils.drawRectangle(image, 0, 0, width, height, brickColor);

        // Add brick pattern
        const mortarColor = this.utils.getColor('#696969');
        const brickHeight = Math.floor(height / 4);

        for (let row = 0; row < 4; row++) {
            const y = row * brickHeight;
            const offset = row % 2 === 0 ? 0 : Math.floor(width * 0.25);

            // Horizontal mortar lines
            this.utils.drawRectangle(image, 0, y, width, 1, mortarColor);
            this.utils.drawRectangle(image, 0, y + brickHeight - 1, width, 1, mortarColor);

            // Vertical mortar lines
            for (let col = 0; col < 4; col++) {
                const x = offset + col * Math.floor(width * 0.25);
                this.utils.drawRectangle(image, x, y, 1, brickHeight, mortarColor);
            }
        }
    }

    /**
     * Generate metal tile
     */
    async generateMetalTile(config, image) {
        const { width, height } = image.bitmap;

        // Base metal color
        const metalColor = this.utils.getColor('#C0C0C0');
        this.utils.drawRectangle(image, 0, 0, width, height, metalColor);

        // Add metallic sheen
        const sheenColor = this.utils.getColor('#F5F5F5');
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            image.bitmap.data[idx] = (sheenColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (sheenColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = sheenColor & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }
    }

    /**
     * Generate crystal tile
     */
    async generateCrystalTile(config, image) {
        const { width, height } = image.bitmap;

        // Base crystal color
        const crystalColor = this.utils.getColor('#9370DB');
        this.utils.drawRectangle(image, 0, 0, width, height, crystalColor);

        // Add crystal facets
        const facetColor = this.utils.getColor('#BA55D3');
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(width * (0.2 + Math.random() * 0.6));
            const y = Math.floor(height * (0.2 + Math.random() * 0.6));
            const size = Math.floor(Math.random() * 6) + 3;
            this.utils.drawEllipse(image, x, y, size, size, facetColor);
        }

        // Add glow effect
        this.utils.applyGlow(image, Math.floor(width * 0.5), Math.floor(height * 0.5), Math.floor(width * 0.3), crystalColor, 0.3);
    }

    /**
     * Generate moss tile
     */
    async generateMossTile(config, image) {
        const { width, height } = image.bitmap;

        // Base stone color
        const stoneColor = this.utils.getColor('#808080');
        this.utils.drawRectangle(image, 0, 0, width, height, stoneColor);

        // Add moss patches
        const mossColor = this.utils.getColor('#228B22');
        for (let i = 0; i < 12; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const size = Math.floor(Math.random() * 8) + 4;
            this.utils.drawEllipse(image, x, y, size, size * 0.6, mossColor);
        }
    }

    /**
     * Generate mud tile
     */
    async generateMudTile(config, image) {
        const { width, height } = image.bitmap;

        // Base mud color
        const mudColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, 0, 0, width, height, mudColor);

        // Add mud texture
        const textureColor = this.utils.getColor('#654321');
        for (let i = 0; i < 25; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            image.bitmap.data[idx] = (textureColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (textureColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = textureColor & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }

        // Add water puddles
        const puddleColor = this.utils.getColor('#4682B4');
        for (let i = 0; i < 3; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const size = Math.floor(Math.random() * 6) + 3;
            this.utils.drawEllipse(image, x, y, size, size * 0.3, puddleColor);
        }
    }

    /**
     * Generate gravel tile
     */
    async generateGravelTile(config, image) {
        const { width, height } = image.bitmap;

        // Base gravel color
        const gravelColor = this.utils.getColor('#A9A9A9');
        this.utils.drawRectangle(image, 0, 0, width, height, gravelColor);

        // Add gravel stones
        const stoneColor = this.utils.getColor('#808080');
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const size = Math.floor(Math.random() * 3) + 1;
            this.utils.drawEllipse(image, x, y, size, size, stoneColor);
        }
    }

    /**
     * Generate cobblestone tile
     */
    async generateCobblestoneTile(config, image) {
        const { width, height } = image.bitmap;

        // Base stone color
        const stoneColor = this.utils.getColor('#696969');
        this.utils.drawRectangle(image, 0, 0, width, height, stoneColor);

        // Add cobblestone pattern
        const mortarColor = this.utils.getColor('#2F2F2F');
        const stoneSize = Math.floor(width / 3);

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const x = col * stoneSize;
                const y = row * stoneSize;

                // Draw stone
                this.utils.drawRectangle(image, x + 1, y + 1, stoneSize - 2, stoneSize - 2, stoneColor);

                // Draw mortar around stone
                if (col < 2) this.utils.drawRectangle(image, x + stoneSize - 1, y, 2, stoneSize, mortarColor);
                if (row < 2) this.utils.drawRectangle(image, x, y + stoneSize - 1, stoneSize, 2, mortarColor);
            }
        }
    }

    /**
     * Generate marble tile
     */
    async generateMarbleTile(config, image) {
        const { width, height } = image.bitmap;

        // Base marble color
        const marbleColor = this.utils.getColor('#F5F5F5');
        this.utils.drawRectangle(image, 0, 0, width, height, marbleColor);

        // Add marble veins
        const veinColor = this.utils.getColor('#D3D3D3');
        for (let i = 0; i < 8; i++) {
            const x1 = Math.floor(Math.random() * width);
            const y1 = Math.floor(Math.random() * height);
            const x2 = Math.min(width - 1, x1 + Math.floor(Math.random() * 30) - 15);
            const y2 = Math.min(height - 1, y1 + Math.floor(Math.random() * 30) - 15);

            this.utils.drawLine(image, x1, y1, x2, y2, veinColor);
        }
    }

    /**
     * Generate carpet tile
     */
    async generateCarpetTile(config, image) {
        const { width, height } = image.bitmap;

        // Base carpet color
        const carpetColor = this.utils.getColor('#8B0000');
        this.utils.drawRectangle(image, 0, 0, width, height, carpetColor);

        // Add carpet texture
        const textureColor = this.utils.getColor('#DC143C');
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;
            image.bitmap.data[idx] = (textureColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (textureColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = textureColor & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }
    }

    /**
     * Generate tiles tile
     */
    async generateTilesTile(config, image) {
        const { width, height } = image.bitmap;

        // Base tile color
        const tileColor = this.utils.getColor('#FFFFFF');
        this.utils.drawRectangle(image, 0, 0, width, height, tileColor);

        // Add tile pattern
        const groutColor = this.utils.getColor('#808080');
        const tileSize = Math.floor(width / 4);

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = col * tileSize;
                const y = row * tileSize;

                // Draw tile
                const tileColor = row % 2 === col % 2 ? this.utils.getColor('#FFFFFF') : this.utils.getColor('#F5F5F5');
                this.utils.drawRectangle(image, x + 1, y + 1, tileSize - 2, tileSize - 2, tileColor);

                // Draw grout
                if (col < 3) this.utils.drawRectangle(image, x + tileSize - 1, y, 2, tileSize, groutColor);
                if (row < 3) this.utils.drawRectangle(image, x, y + tileSize - 1, tileSize, 2, groutColor);
            }
        }
    }
}

module.exports = TileGenerator;
