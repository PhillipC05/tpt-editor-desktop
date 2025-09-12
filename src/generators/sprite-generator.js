/**
 * TPT Sprite Generator - Main Orchestrator
 * Procedural sprite generation for the desktop application
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import specialized generators
const CharacterGenerator = require('./sprite-generators/character-generator');
const MonsterGenerator = require('./sprite-generators/monster-generator');
const ItemGenerator = require('./sprite-generators/item-generator');
const TileGenerator = require('./sprite-generators/tile-generator');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class SpriteGenerator {
    constructor() {
        this.image = null;
        this.width = 0;
        this.height = 0;
        this.characterGenerator = new CharacterGenerator();
        this.monsterGenerator = new MonsterGenerator();
        this.itemGenerator = new ItemGenerator();
        this.tileGenerator = new TileGenerator();
        this.utils = new SpriteUtils();
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
     * Generate character sprite
     */
    async generateCharacter(config) {
        const width = 64; // Increased resolution for better quality
        const height = 96;

        await this.initImage(width, height);
        await this.characterGenerator.generate(this.image, config);

        // Convert to buffer
        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.classType.charAt(0).toUpperCase() + config.classType.slice(1)} Character`,
            type: 'character',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                classType: config.classType,
                equipment: config.equipment || {},
                bodyType: config.bodyType || 'medium',
                skinTone: config.skinTone || 'tan',
                hairColor: config.hairColor || 'brown',
                generated: new Date().toISOString(),
                version: '2.0'
            }
        };
    }

    /**
     * Generate monster sprite
     */
    async generateMonster(config) {
        const width = 32;
        const height = 32;

        await this.initImage(width, height);
        await this.monsterGenerator.generate(this.image, config);

        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.monsterType.charAt(0).toUpperCase() + config.monsterType.slice(1)} Monster`,
            type: 'monster',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                monsterType: config.monsterType,
                sizeVariant: config.sizeVariant || 'medium',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate item sprite
     */
    async generateItem(config) {
        const width = 32; // Increased size for better detail
        const height = 32;

        await this.initImage(width, height);
        await this.itemGenerator.generate(this.image, config);

        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        const rarityConfig = this.utils.getRarityConfig(config.rarity || 'common');

        return {
            id: uuidv4(),
            name: `${rarityConfig.prefix} ${config.itemType.charAt(0).toUpperCase() + config.itemType.slice(1)}`,
            type: 'item',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                itemType: config.itemType,
                category: config.category || 'weapon',
                rarity: config.rarity || 'common',
                level: config.level || 1,
                value: rarityConfig.value,
                generated: new Date().toISOString(),
                version: '2.0'
            }
        };
    }

    /**
     * Generate tile sprite
     */
    async generateTile(config) {
        const width = 32;
        const height = 32;

        await this.initImage(width, height);
        await this.tileGenerator.generate(this.image, config);

        const buffer = await this.image.getBufferAsync(Jimp.MIME_PNG);

        return {
            id: uuidv4(),
            name: `${config.tileType.charAt(0).toUpperCase() + config.tileType.slice(1)} Tile`,
            type: 'tile',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                tileType: config.tileType,
                biome: config.biome || 'grass',
                variation: config.variation || 0,
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }
}

module.exports = SpriteGenerator;
