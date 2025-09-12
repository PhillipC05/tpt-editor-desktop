/**
 * Spritesheet Packer - Texture atlas generation with optimal packing algorithms
 * Handles generation of spritesheets from individual sprites with multiple packing strategies
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');

class SpritesheetPacker {
    constructor() {
        this.packingAlgorithms = {
            SHELF: 'shelf',
            SKYLINE: 'skyline',
            MAXRECTS: 'maxrects'
        };

        this.packingStrategies = {
            BEST_AREA_FIT: 'bestAreaFit',
            BEST_SHORT_SIDE_FIT: 'bestShortSideFit',
            BEST_LONG_SIDE_FIT: 'bestLongSideFit',
            BOTTOM_LEFT_RULE: 'bottomLeftRule',
            CONTACT_POINT_RULE: 'contactPointRule'
        };

        // Default packing options
        this.defaultOptions = {
            algorithm: this.packingAlgorithms.MAXRECTS,
            strategy: this.packingStrategies.BEST_AREA_FIT,
            padding: 2,
            powerOfTwo: true,
            square: false,
            maxWidth: 4096,
            maxHeight: 4096,
            allowRotation: false,
            sortBy: 'area', // area, width, height, perimeter
            sortOrder: 'descending' // ascending, descending
        };

        // Rectangle packing data structures
        this.rectangles = [];
        this.packedRectangles = [];
        this.freeRectangles = [];
    }

    /**
     * Main spritesheet generation method
     */
    async generate(sprites, options = {}) {
        const config = { ...this.defaultOptions, ...options };

        // Prepare sprites for packing
        const preparedSprites = await this.prepareSprites(sprites);

        // Sort sprites based on configuration
        const sortedSprites = this.sortSprites(preparedSprites, config.sortBy, config.sortOrder);

        // Initialize packing area
        const packingArea = this.initializePackingArea(config);

        // Pack sprites using selected algorithm
        const packedSprites = await this.packSprites(sortedSprites, packingArea, config);

        // Generate final spritesheet
        const spritesheet = await this.generateSpritesheet(packedSprites, packingArea, config);

        // Generate metadata
        const metadata = this.generateMetadata(packedSprites, packingArea, config);

        return {
            spritesheet: spritesheet,
            metadata: metadata,
            config: config,
            stats: {
                totalSprites: packedSprites.length,
                spritesheetWidth: packingArea.width,
                spritesheetHeight: packingArea.height,
                packingEfficiency: this.calculatePackingEfficiency(packedSprites, packingArea),
                averageSpriteSize: this.calculateAverageSpriteSize(packedSprites)
            }
        };
    }

    /**
     * Prepare sprites for packing
     */
    async prepareSprites(sprites) {
        const prepared = [];

        for (const sprite of sprites) {
            // Load sprite image if it's a file path
            let image;
            if (typeof sprite.image === 'string') {
                image = await Jimp.read(sprite.image);
            } else {
                // Assume it's already a Jimp image
                image = sprite.image;
            }

            prepared.push({
                id: sprite.id || `sprite_${prepared.length}`,
                name: sprite.name || `sprite_${prepared.length}`,
                image: image,
                width: image.bitmap.width,
                height: image.bitmap.height,
                area: image.bitmap.width * image.bitmap.height,
                perimeter: 2 * (image.bitmap.width + image.bitmap.height),
                x: 0, // Will be set during packing
                y: 0, // Will be set during packing
                rotated: false,
                metadata: sprite.metadata || {}
            });
        }

        return prepared;
    }

    /**
     * Sort sprites based on criteria
     */
    sortSprites(sprites, sortBy, sortOrder) {
        return sprites.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'area':
                    aValue = a.area;
                    bValue = b.area;
                    break;
                case 'width':
                    aValue = a.width;
                    bValue = b.width;
                    break;
                case 'height':
                    aValue = a.height;
                    bValue = b.height;
                    break;
                case 'perimeter':
                    aValue = a.perimeter;
                    bValue = b.perimeter;
                    break;
                default:
                    aValue = a.area;
                    bValue = b.area;
            }

            if (sortOrder === 'descending') {
                return bValue - aValue;
            } else {
                return aValue - bValue;
            }
        });
    }

    /**
     * Initialize packing area
     */
    initializePackingArea(config) {
        let width = 256;
        let height = 256;

        // Start with minimum size and grow as needed
        while (width < config.maxWidth && height < config.maxHeight) {
            if (this.canFitAllSprites(this.rectangles, width, height, config)) {
                break;
            }

            // Grow the packing area
            if (config.square) {
                width *= 2;
                height *= 2;
            } else {
                if (width <= height) {
                    width *= 2;
                } else {
                    height *= 2;
                }
            }

            if (width > config.maxWidth || height > config.maxHeight) {
                width = Math.min(width, config.maxWidth);
                height = Math.min(height, config.maxHeight);
                break;
            }
        }

        // Ensure power of two if requested
        if (config.powerOfTwo) {
            width = this.nextPowerOfTwo(width);
            height = this.nextPowerOfTwo(height);
        }

        return {
            width: Math.min(width, config.maxWidth),
            height: Math.min(height, config.maxHeight)
        };
    }

    /**
     * Check if all sprites can fit in the given area
     */
    canFitAllSprites(sprites, width, height, config) {
        const totalArea = sprites.reduce((sum, sprite) => sum + sprite.area, 0);
        const packingArea = width * height;
        const paddingArea = sprites.length * (config.padding * 2) * (config.padding * 2);

        return totalArea + paddingArea <= packingArea * 0.95; // 95% efficiency threshold
    }

    /**
     * Pack sprites using selected algorithm
     */
    async packSprites(sprites, packingArea, config) {
        this.freeRectangles = [{ x: 0, y: 0, width: packingArea.width, height: packingArea.height }];
        this.packedRectangles = [];

        for (const sprite of sprites) {
            const packed = this.packSprite(sprite, config);

            if (packed) {
                this.packedRectangles.push(packed);
            } else {
                console.warn(`Could not pack sprite: ${sprite.name}`);
            }
        }

        return this.packedRectangles;
    }

    /**
     * Pack individual sprite
     */
    packSprite(sprite, config) {
        let bestFit = null;
        let bestScore = Infinity;

        // Try packing without rotation first
        let fit = this.findBestFit(sprite, config);
        if (fit) {
            bestFit = fit;
            bestScore = fit.score;
        }

        // Try with rotation if allowed
        if (config.allowRotation && sprite.width !== sprite.height) {
            const rotatedSprite = {
                ...sprite,
                width: sprite.height,
                height: sprite.width,
                rotated: true
            };

            const rotatedFit = this.findBestFit(rotatedSprite, config);
            if (rotatedFit && rotatedFit.score < bestScore) {
                bestFit = rotatedFit;
                bestScore = rotatedFit.score;
            }
        }

        if (bestFit) {
            // Update free rectangles
            this.updateFreeRectangles(bestFit, config.padding);

            return {
                ...sprite,
                x: bestFit.x,
                y: bestFit.y,
                rotated: bestFit.rotated || false,
                packed: true
            };
        }

        return null;
    }

    /**
     * Find best fit for sprite using selected strategy
     */
    findBestFit(sprite, config) {
        let bestFit = null;
        let bestScore = Infinity;

        for (const freeRect of this.freeRectangles) {
            if (sprite.width <= freeRect.width && sprite.height <= freeRect.height) {
                const score = this.calculateFitScore(sprite, freeRect, config.strategy);

                if (score < bestScore) {
                    bestScore = score;
                    bestFit = {
                        x: freeRect.x,
                        y: freeRect.y,
                        width: sprite.width,
                        height: sprite.height,
                        rotated: sprite.rotated || false,
                        score: score
                    };
                }
            }
        }

        return bestFit;
    }

    /**
     * Calculate fit score based on strategy
     */
    calculateFitScore(sprite, freeRect, strategy) {
        const dx = freeRect.width - sprite.width;
        const dy = freeRect.height - sprite.height;

        switch (strategy) {
            case this.packingStrategies.BEST_AREA_FIT:
                return dx * dy;
            case this.packingStrategies.BEST_SHORT_SIDE_FIT:
                return Math.min(dx, dy);
            case this.packingStrategies.BEST_LONG_SIDE_FIT:
                return Math.max(dx, dy);
            case this.packingStrategies.BOTTOM_LEFT_RULE:
                return freeRect.x + freeRect.y;
            case this.packingStrategies.CONTACT_POINT_RULE:
                return -(freeRect.x + freeRect.y);
            default:
                return dx * dy;
        }
    }

    /**
     * Update free rectangles after placing a sprite
     */
    updateFreeRectangles(packedRect, padding) {
        const paddedRect = {
            x: packedRect.x - padding,
            y: packedRect.y - padding,
            width: packedRect.width + padding * 2,
            height: packedRect.height + padding * 2
        };

        const newFreeRectangles = [];

        for (const freeRect of this.freeRectangles) {
            if (!this.rectanglesOverlap(paddedRect, freeRect)) {
                newFreeRectangles.push(freeRect);
            } else {
                // Split the free rectangle
                const splits = this.splitRectangle(freeRect, paddedRect);
                newFreeRectangles.push(...splits);
            }
        }

        // Remove duplicates and merge adjacent rectangles
        this.freeRectangles = this.mergeRectangles(this.removeDuplicateRectangles(newFreeRectangles));
    }

    /**
     * Check if two rectangles overlap
     */
    rectanglesOverlap(rect1, rect2) {
        return !(rect1.x + rect1.width <= rect2.x ||
                 rect2.x + rect2.width <= rect1.x ||
                 rect1.y + rect1.height <= rect2.y ||
                 rect2.y + rect2.height <= rect1.y);
    }

    /**
     * Split rectangle around another rectangle
     */
    splitRectangle(freeRect, packedRect) {
        const splits = [];

        // Top rectangle
        if (freeRect.y < packedRect.y) {
            splits.push({
                x: freeRect.x,
                y: freeRect.y,
                width: freeRect.width,
                height: packedRect.y - freeRect.y
            });
        }

        // Bottom rectangle
        if (freeRect.y + freeRect.height > packedRect.y + packedRect.height) {
            splits.push({
                x: freeRect.x,
                y: packedRect.y + packedRect.height,
                width: freeRect.width,
                height: (freeRect.y + freeRect.height) - (packedRect.y + packedRect.height)
            });
        }

        // Left rectangle
        if (freeRect.x < packedRect.x) {
            const leftY = Math.max(freeRect.y, packedRect.y);
            const leftHeight = Math.min(freeRect.y + freeRect.height, packedRect.y + packedRect.height) - leftY;

            if (leftHeight > 0) {
                splits.push({
                    x: freeRect.x,
                    y: leftY,
                    width: packedRect.x - freeRect.x,
                    height: leftHeight
                });
            }
        }

        // Right rectangle
        if (freeRect.x + freeRect.width > packedRect.x + packedRect.width) {
            const rightY = Math.max(freeRect.y, packedRect.y);
            const rightHeight = Math.min(freeRect.y + freeRect.height, packedRect.y + packedRect.height) - rightY;

            if (rightHeight > 0) {
                splits.push({
                    x: packedRect.x + packedRect.width,
                    y: rightY,
                    width: (freeRect.x + freeRect.width) - (packedRect.x + packedRect.width),
                    height: rightHeight
                });
            }
        }

        return splits;
    }

    /**
     * Remove duplicate rectangles
     */
    removeDuplicateRectangles(rectangles) {
        const unique = [];
        const seen = new Set();

        for (const rect of rectangles) {
            const key = `${rect.x},${rect.y},${rect.width},${rect.height}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(rect);
            }
        }

        return unique;
    }

    /**
     * Merge adjacent rectangles
     */
    mergeRectangles(rectangles) {
        let merged = [...rectangles];
        let didMerge = true;

        while (didMerge) {
            didMerge = false;
            const newMerged = [];

            for (let i = 0; i < merged.length; i++) {
                let mergedRect = merged[i];
                let wasMerged = false;

                for (let j = i + 1; j < merged.length; j++) {
                    const mergedWith = this.mergeTwoRectangles(mergedRect, merged[j]);
                    if (mergedWith) {
                        mergedRect = mergedWith;
                        merged.splice(j, 1);
                        didMerge = true;
                        wasMerged = true;
                        j--; // Adjust index after splice
                    }
                }

                newMerged.push(mergedRect);
            }

            merged = newMerged;
        }

        return merged;
    }

    /**
     * Merge two rectangles if they are adjacent
     */
    mergeTwoRectangles(rect1, rect2) {
        // Same Y position and height - merge horizontally
        if (rect1.y === rect2.y && rect1.height === rect2.height) {
            if (rect1.x + rect1.width === rect2.x) {
                return {
                    x: rect1.x,
                    y: rect1.y,
                    width: rect1.width + rect2.width,
                    height: rect1.height
                };
            } else if (rect2.x + rect2.width === rect1.x) {
                return {
                    x: rect2.x,
                    y: rect2.y,
                    width: rect1.width + rect2.width,
                    height: rect1.height
                };
            }
        }

        // Same X position and width - merge vertically
        if (rect1.x === rect2.x && rect1.width === rect2.width) {
            if (rect1.y + rect1.height === rect2.y) {
                return {
                    x: rect1.x,
                    y: rect1.y,
                    width: rect1.width,
                    height: rect1.height + rect2.height
                };
            } else if (rect2.y + rect2.height === rect1.y) {
                return {
                    x: rect2.x,
                    y: rect2.y,
                    width: rect1.width,
                    height: rect1.height + rect2.height
                };
            }
        }

        return null;
    }

    /**
     * Generate final spritesheet image
     */
    async generateSpritesheet(packedSprites, packingArea, config) {
        const spritesheet = new Jimp(packingArea.width, packingArea.height, 0x00000000);

        for (const sprite of packedSprites) {
            // Handle rotation
            let spriteImage = sprite.image;
            if (sprite.rotated) {
                spriteImage = sprite.image.clone().rotate(90);
            }

            // Composite sprite onto spritesheet
            spritesheet.composite(spriteImage, sprite.x, sprite.y);
        }

        return spritesheet;
    }

    /**
     * Generate metadata for spritesheet
     */
    generateMetadata(packedSprites, packingArea, config) {
        const frames = {};
        const animations = {};

        for (const sprite of packedSprites) {
            frames[sprite.id] = {
                frame: {
                    x: sprite.x,
                    y: sprite.y,
                    w: sprite.width,
                    h: sprite.height
                },
                rotated: sprite.rotated || false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: sprite.width,
                    h: sprite.height
                },
                sourceSize: {
                    w: sprite.width,
                    h: sprite.height
                }
            };
        }

        return {
            frames: frames,
            animations: animations,
            meta: {
                app: "TPT Asset Editor Spritesheet Packer",
                version: "1.0",
                image: "spritesheet.png",
                format: "RGBA8888",
                size: {
                    w: packingArea.width,
                    h: packingArea.height
                },
                scale: 1,
                smartupdate: ""
            }
        };
    }

    /**
     * Calculate packing efficiency
     */
    calculatePackingEfficiency(packedSprites, packingArea) {
        const totalSpriteArea = packedSprites.reduce((sum, sprite) => sum + sprite.area, 0);
        const totalArea = packingArea.width * packingArea.height;

        return totalSpriteArea / totalArea;
    }

    /**
     * Calculate average sprite size
     */
    calculateAverageSpriteSize(packedSprites) {
        if (packedSprites.length === 0) return { width: 0, height: 0 };

        const totalWidth = packedSprites.reduce((sum, sprite) => sum + sprite.width, 0);
        const totalHeight = packedSprites.reduce((sum, sprite) => sum + sprite.height, 0);

        return {
            width: totalWidth / packedSprites.length,
            height: totalHeight / packedSprites.length
        };
    }

    /**
     * Get next power of two
     */
    nextPowerOfTwo(value) {
        let power = 1;
        while (power < value) {
            power *= 2;
        }
        return power;
    }

    /**
     * Export spritesheet to file
     */
    async export(spritesheetData, outputPath, format = 'png') {
        const { spritesheet, metadata } = spritesheetData;

        // Export spritesheet image
        const imagePath = outputPath.replace(/\.[^/.]+$/, `.${format}`);
        await spritesheet.writeAsync(imagePath);

        // Export metadata
        const metadataPath = outputPath.replace(/\.[^/.]+$/, '.json');
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

        return {
            imagePath: imagePath,
            metadataPath: metadataPath
        };
    }

    /**
     * Generate multi-resolution spritesheets
     */
    async generateMultiResolution(sprites, baseOptions = {}) {
        const resolutions = [1, 2, 4]; // 1x, 2x, 4x
        const spritesheets = {};

        for (const scale of resolutions) {
            const options = {
                ...baseOptions,
                scale: scale,
                maxWidth: Math.min(baseOptions.maxWidth || 4096, 4096 / scale),
                maxHeight: Math.min(baseOptions.maxHeight || 4096, 4096 / scale)
            };

            // Scale sprites for this resolution
            const scaledSprites = await this.scaleSprites(sprites, scale);

            spritesheets[`${scale}x`] = await this.generate(scaledSprites, options);
        }

        return spritesheets;
    }

    /**
     * Scale sprites for multi-resolution
     */
    async scaleSprites(sprites, scale) {
        const scaled = [];

        for (const sprite of sprites) {
            let scaledImage = sprite.image;

            if (scale !== 1) {
                scaledImage = sprite.image.clone();

                if (scale > 1) {
                    // Upscale using nearest neighbor for pixel art
                    scaledImage.resize(
                        Math.floor(sprite.width * scale),
                        Math.floor(sprite.height * scale),
                        Jimp.RESIZE_NEAREST_NEIGHBOR
                    );
                } else {
                    // Downscale
                    scaledImage.resize(
                        Math.floor(sprite.width * scale),
                        Math.floor(sprite.height * scale),
                        Jimp.RESIZE_BICUBIC
                    );
                }
            }

            scaled.push({
                ...sprite,
                image: scaledImage,
                width: Math.floor(sprite.width * scale),
                height: Math.floor(sprite.height * scale),
                area: Math.floor(sprite.width * scale) * Math.floor(sprite.height * scale)
            });
        }

        return scaled;
    }
}

module.exports = SpritesheetPacker;
