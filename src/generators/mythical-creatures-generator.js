/**
 * Mythical Creatures Generator - Dragons, unicorns, griffins, phoenixes
 * Handles generation of legendary and fantastical creatures with magical properties
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class MythicalCreaturesGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Mythical creatures database
        this.mythicalDatabase = {
            dragon: {
                name: 'Dragon',
                types: ['fire', 'ice', 'storm', 'shadow', 'ancient', 'young'],
                sizes: ['hatchling', 'juvenile', 'adult', 'ancient', 'colossal'],
                colors: ['red', 'blue', 'green', 'black', 'white', 'gold', 'purple'],
                poses: ['flying', 'standing', 'sleeping', 'roaring', 'breathing_fire'],
                elements: ['fire', 'ice', 'lightning', 'poison', 'acid']
            },
            unicorn: {
                name: 'Unicorn',
                variants: ['celestial', 'forest', 'arctic', 'volcanic', 'ethereal'],
                sizes: ['foal', 'young', 'adult', 'elder'],
                colors: ['white', 'silver', 'golden', 'rainbow', 'crystal'],
                poses: ['standing', 'running', 'grazing', 'magical_glow'],
                horns: ['spiral', 'straight', 'curved', 'crystal', 'flame']
            },
            griffin: {
                name: 'Griffin',
                types: ['noble', 'feral', 'storm', 'flame', 'guardian'],
                sizes: ['chick', 'young', 'adult', 'elder'],
                colors: ['golden', 'brown', 'white', 'gray', 'red'],
                poses: ['standing', 'flying', 'guarding', 'hunting'],
                wings: ['majestic', 'battle_torn', 'feathered', 'leathery']
            },
            phoenix: {
                name: 'Phoenix',
                phases: ['rebirth', 'ascension', 'immortal', 'cosmic'],
                sizes: ['chick', 'young', 'adult', 'ancient'],
                colors: ['fiery_red', 'golden', 'white', 'rainbow', 'cosmic'],
                poses: ['flying', 'perched', 'rising', 'bursting'],
                effects: ['flames', 'sparks', 'light_rays', 'energy_waves']
            },
            basilisk: {
                name: 'Basilisk',
                variants: ['stone', 'venom', 'hypnotic', 'ancient'],
                sizes: ['young', 'adult', 'elder'],
                colors: ['green', 'brown', 'gray', 'black'],
                poses: ['coiled', 'striking', 'glaring', 'slithering'],
                abilities: ['petrification', 'venom', 'hypnosis', 'regeneration']
            },
            mermaid: {
                name: 'Mermaid',
                types: ['ocean', 'river', 'coral', 'deep_sea', 'freshwater'],
                colors: ['blue', 'green', 'purple', 'silver', 'golden'],
                poses: ['swimming', 'singing', 'resting', 'magical'],
                accessories: ['shell_necklace', 'pearl_crown', 'trident', 'starfish']
            },
            centaur: {
                name: 'Centaur',
                tribes: ['forest', 'mountain', 'desert', 'arctic', 'noble'],
                colors: ['brown', 'black', 'white', 'chestnut', 'gray'],
                poses: ['standing', 'running', 'archery', 'guarding'],
                weapons: ['bow', 'spear', 'sword', 'staff']
            },
            sphinx: {
                name: 'Sphinx',
                types: ['guardian', 'riddle', 'desert', 'temple'],
                sizes: ['young', 'adult', 'ancient'],
                colors: ['sand', 'golden', 'black', 'white'],
                poses: ['sitting', 'guarding', 'mysterious', 'wise'],
                accessories: ['crown', 'necklace', 'bracelets']
            },
            kraken: {
                name: 'Kraken',
                variants: ['deep_sea', 'storm', 'ancient', 'coral'],
                sizes: ['young', 'adult', 'elder'],
                colors: ['deep_blue', 'purple', 'black', 'bioluminescent'],
                poses: ['emerging', 'tentacles', 'submerged', 'attacking'],
                effects: ['bubbles', 'lightning', 'ink_cloud', 'waves']
            },
            pegasus: {
                name: 'Pegasus',
                types: ['celestial', 'storm', 'forest', 'arctic'],
                sizes: ['foal', 'young', 'adult', 'elder'],
                colors: ['white', 'gray', 'black', 'golden'],
                poses: ['flying', 'standing', 'galloping', 'magical'],
                wings: ['majestic', 'storm', 'ethereal', 'battle']
            }
        };

        // Magical effects database
        this.magicalEffects = {
            fire: {
                colors: ['#FF4500', '#FF6347', '#FFA500', '#FFD700'],
                particles: 'flames',
                glow: 'intense'
            },
            ice: {
                colors: ['#87CEEB', '#B0E0E6', '#F0F8FF', '#E6E6FA'],
                particles: 'snowflakes',
                glow: 'cool'
            },
            lightning: {
                colors: ['#FFFF00', '#FFA500', '#FFFFFF', '#87CEEB'],
                particles: 'sparks',
                glow: 'electric'
            },
            ethereal: {
                colors: ['#E6E6FA', '#DDA0DD', '#DA70D6', '#9370DB'],
                particles: 'stars',
                glow: 'mystical'
            },
            shadow: {
                colors: ['#2F2F2F', '#696969', '#000000', '#1C1C1C'],
                particles: 'shadows',
                glow: 'dark'
            },
            holy: {
                colors: ['#FFD700', '#FFFF00', '#FFFFFF', '#F0F8FF'],
                particles: 'lights',
                glow: 'divine'
            }
        };

        // Animation frames for mythical creatures
        this.animationFrames = {
            dragon: 8,
            unicorn: 6,
            griffin: 7,
            phoenix: 10,
            basilisk: 5,
            mermaid: 6,
            centaur: 8,
            sphinx: 4,
            kraken: 9,
            pegasus: 7
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine mythical creature type and generate accordingly
        const creatureType = config.creatureType || 'dragon';
        const subType = config.subType || 'fire';

        switch (creatureType) {
            case 'dragon':
                await this.generateDragon(image, config);
                break;
            case 'unicorn':
                await this.generateUnicorn(image, config);
                break;
            case 'griffin':
                await this.generateGriffin(image, config);
                break;
            case 'phoenix':
                await this.generatePhoenix(image, config);
                break;
            case 'basilisk':
                await this.generateBasilisk(image, config);
                break;
            case 'mermaid':
                await this.generateMermaid(image, config);
                break;
            case 'centaur':
                await this.generateCentaur(image, config);
                break;
            case 'sphinx':
                await this.generateSphinx(image, config);
                break;
            case 'kraken':
                await this.generateKraken(image, config);
                break;
            case 'pegasus':
                await this.generatePegasus(image, config);
                break;
            default:
                await this.generateDragon(image, config);
        }
    }

    /**
     * Generate dragon
     */
    async generateDragon(image, config) {
        const { width, height } = image.bitmap;
        const type = config.dragonType || 'fire';
        const size = config.dragonSize || 'adult';
        const color = config.dragonColor || 'red';
        const pose = config.dragonPose || 'standing';
        const element = config.dragonElement || 'fire';

        // Calculate dragon dimensions
        const sizeMultiplier = { hatchling: 0.4, juvenile: 0.7, adult: 1.0, ancient: 1.4, colossal: 2.0 };
        const multiplier = sizeMultiplier[size];

        const dragonWidth = Math.floor(120 * multiplier);
        const dragonHeight = Math.floor(100 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const dragonY = Math.floor(height - dragonHeight - 10);

        // Generate dragon body
        await this.generateDragonBody(image, centerX, dragonY, dragonWidth, dragonHeight, type, color, pose);

        // Generate dragon wings
        if (pose === 'flying' || size !== 'hatchling') {
            await this.generateDragonWings(image, centerX, dragonY, dragonWidth, dragonHeight, color, pose);
        }

        // Generate dragon head
        await this.generateDragonHead(image, centerX, dragonY, dragonWidth, dragonHeight, type, color);

        // Generate dragon tail
        await this.generateDragonTail(image, centerX, dragonY, dragonWidth, dragonHeight, color);

        // Add elemental effects
        await this.addElementalEffects(image, centerX, dragonY, dragonWidth, dragonHeight, element, pose);

        // Add dragon scales and details
        await this.addDragonDetails(image, centerX, dragonY, dragonWidth, dragonHeight, color, type);

        // Add shadow
        await this.addCreatureShadow(image, centerX - dragonWidth * 0.5, dragonY, dragonWidth, dragonHeight);
    }

    /**
     * Generate dragon body
     */
    async generateDragonBody(image, centerX, y, width, height, type, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'dragon');

        // Main body as a series of connected ellipses
        const segments = 6;
        for (let i = 0; i < segments; i++) {
            const segmentX = centerX - width * 0.3 + (i * width * 0.1);
            const segmentY = y + height * 0.3 + (i * height * 0.1);
            const segmentWidth = width * (0.8 - i * 0.1);
            const segmentHeight = height * (0.6 - i * 0.05);

            this.utils.drawEllipse(image, segmentX, segmentY, segmentWidth * 0.5, segmentHeight * 0.5, bodyColor);
        }

        // Add legs
        const legPositions = [
            { x: centerX - width * 0.35, y: y + height * 0.7 },
            { x: centerX - width * 0.15, y: y + height * 0.75 },
            { x: centerX + width * 0.15, y: y + height * 0.75 },
            { x: centerX + width * 0.35, y: y + height * 0.7 }
        ];

        for (const leg of legPositions) {
            this.utils.drawRectangle(image, leg.x - 3, leg.y, 6, height * 0.3, bodyColor);
            // Add claws
            this.utils.drawEllipse(image, leg.x, leg.y + height * 0.3, 4, 4, 0x000000);
        }
    }

    /**
     * Generate dragon wings
     */
    async generateDragonWings(image, centerX, y, width, height, color, pose) {
        const wingColor = this.getCreatureColor(color, 'wing');
        const wingSpan = width * 1.2;

        if (pose === 'flying') {
            // Extended wings for flying
            const leftWingPoints = [
                { x: centerX - width * 0.2, y: y + height * 0.2 },
                { x: centerX - wingSpan * 0.5, y: y - height * 0.3 },
                { x: centerX - wingSpan * 0.3, y: y + height * 0.1 }
            ];
            const rightWingPoints = [
                { x: centerX + width * 0.2, y: y + height * 0.2 },
                { x: centerX + wingSpan * 0.5, y: y - height * 0.3 },
                { x: centerX + wingSpan * 0.3, y: y + height * 0.1 }
            ];

            await this.fillIrregularShape(image, leftWingPoints, wingColor);
            await this.fillIrregularShape(image, rightWingPoints, wingColor);

            // Add wing membranes
            await this.addWingMembranes(image, centerX, y, width, height, wingColor);
        } else {
            // Folded wings
            const leftWingPoints = [
                { x: centerX - width * 0.2, y: y + height * 0.2 },
                { x: centerX - width * 0.4, y: y - height * 0.1 },
                { x: centerX - width * 0.1, y: y + height * 0.3 }
            ];
            const rightWingPoints = [
                { x: centerX + width * 0.2, y: y + height * 0.2 },
                { x: centerX + width * 0.4, y: y - height * 0.1 },
                { x: centerX + width * 0.1, y: y + height * 0.3 }
            ];

            await this.fillIrregularShape(image, leftWingPoints, wingColor);
            await this.fillIrregularShape(image, rightWingPoints, wingColor);
        }
    }

    /**
     * Generate dragon head
     */
    async generateDragonHead(image, centerX, y, width, height, type, color) {
        const headColor = this.getCreatureColor(color, 'head');
        const headSize = width * 0.25;

        // Head shape
        this.utils.drawEllipse(image, centerX, y, headSize, headSize * 0.8, headColor);

        // Eyes
        const eyeColor = type === 'shadow' ? 0xFF0000 : 0xFFFF00;
        this.utils.drawEllipse(image, centerX - headSize * 0.3, y - headSize * 0.1, headSize * 0.15, headSize * 0.2, eyeColor);
        this.utils.drawEllipse(image, centerX + headSize * 0.3, y - headSize * 0.1, headSize * 0.15, headSize * 0.2, eyeColor);

        // Pupils
        this.utils.drawEllipse(image, centerX - headSize * 0.3, y - headSize * 0.1, headSize * 0.08, headSize * 0.12, 0x000000);
        this.utils.drawEllipse(image, centerX + headSize * 0.3, y - headSize * 0.1, headSize * 0.08, headSize * 0.12, 0x000000);

        // Horns
        const hornColor = this.getCreatureColor(color, 'horn');
        this.utils.drawEllipse(image, centerX - headSize * 0.4, y - headSize * 0.4, headSize * 0.1, headSize * 0.3, hornColor);
        this.utils.drawEllipse(image, centerX + headSize * 0.4, y - headSize * 0.4, headSize * 0.1, headSize * 0.3, hornColor);

        // Nostrils
        this.utils.drawEllipse(image, centerX - headSize * 0.15, y + headSize * 0.2, headSize * 0.05, headSize * 0.08, 0x000000);
        this.utils.drawEllipse(image, centerX + headSize * 0.15, y + headSize * 0.2, headSize * 0.05, headSize * 0.08, 0x000000);

        // Teeth (if roaring)
        if (type === 'roaring') {
            for (let i = 0; i < 6; i++) {
                const toothX = centerX - headSize * 0.25 + (i * headSize * 0.08);
                this.utils.drawRectangle(image, toothX, y + headSize * 0.1, 2, headSize * 0.15, 0xFFFFFF);
            }
        }
    }

    /**
     * Generate dragon tail
     */
    async generateDragonTail(image, centerX, y, width, height, color) {
        const tailColor = this.getCreatureColor(color, 'tail');
        const tailLength = width * 0.8;
        const tailSegments = 8;

        for (let i = 0; i < tailSegments; i++) {
            const tailX = centerX + width * 0.4 + (i * tailLength * 0.1);
            const tailY = y + height * 0.5 + (i * height * 0.05);
            const segmentSize = width * (0.15 - i * 0.015);

            this.utils.drawEllipse(image, tailX, tailY, segmentSize, segmentSize * 0.6, tailColor);

            // Add spikes along the tail
            if (i % 2 === 0) {
                this.utils.drawEllipse(image, tailX, tailY - segmentSize * 0.8, segmentSize * 0.3, segmentSize * 0.5, tailColor);
            }
        }

        // Tail tip
        const tipX = centerX + width * 0.4 + tailLength;
        const tipY = y + height * 0.5 + (tailSegments * height * 0.05);
        this.utils.drawEllipse(image, tipX, tipY, width * 0.08, width * 0.12, tailColor);
    }

    /**
     * Generate unicorn
     */
    async generateUnicorn(image, config) {
        const { width, height } = image.bitmap;
        const variant = config.unicornVariant || 'celestial';
        const size = config.unicornSize || 'adult';
        const color = config.unicornColor || 'white';
        const pose = config.unicornPose || 'standing';
        const horn = config.unicornHorn || 'spiral';

        // Calculate unicorn dimensions
        const sizeMultiplier = { foal: 0.5, young: 0.8, adult: 1.0, elder: 1.2 };
        const multiplier = sizeMultiplier[size];

        const unicornWidth = Math.floor(80 * multiplier);
        const unicornHeight = Math.floor(90 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const unicornY = Math.floor(height - unicornHeight - 5);

        // Generate horse body
        await this.generateHorseBody(image, centerX, unicornY, unicornWidth, unicornHeight, color, pose);

        // Generate unicorn horn
        await this.generateUnicornHorn(image, centerX, unicornY, unicornWidth, unicornHeight, horn, variant);

        // Generate mane and tail
        await this.generateHorseMane(image, centerX, unicornY, unicornWidth, unicornHeight, color, variant);

        // Add magical effects
        await this.addUnicornMagic(image, centerX, unicornY, unicornWidth, unicornHeight, variant, pose);

        // Add shadow
        await this.addCreatureShadow(image, centerX - unicornWidth * 0.5, unicornY, unicornWidth, unicornHeight);
    }

    /**
     * Generate horse body (base for unicorn)
     */
    async generateHorseBody(image, centerX, y, width, height, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'horse');

        // Main body
        this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.35, bodyColor);

        // Head
        this.utils.drawEllipse(image, centerX - width * 0.25, y + height * 0.1, width * 0.15, height * 0.2, bodyColor);

        // Legs
        const legPositions = [
            { x: centerX - width * 0.35, y: y + height * 0.6 },
            { x: centerX - width * 0.15, y: y + height * 0.65 },
            { x: centerX + width * 0.15, y: y + height * 0.65 },
            { x: centerX + width * 0.35, y: y + height * 0.6 }
        ];

        for (const leg of legPositions) {
            this.utils.drawRectangle(image, leg.x - 3, leg.y, 6, height * 0.4, bodyColor);
            // Hooves
            this.utils.drawEllipse(image, leg.x, leg.y + height * 0.4, 4, 6, 0x000000);
        }

        // Tail
        this.utils.drawEllipse(image, centerX + width * 0.4, y + height * 0.3, width * 0.08, height * 0.3, bodyColor);
    }

    /**
     * Generate unicorn horn
     */
    async generateUnicornHorn(image, centerX, y, width, height, horn, variant) {
        const hornColor = this.getCreatureColor(variant, 'horn');
        const hornBaseX = centerX - width * 0.25;
        const hornBaseY = y + height * 0.05;

        switch (horn) {
            case 'spiral':
                // Spiral horn
                for (let i = 0; i < 20; i++) {
                    const angle = (i / 20) * Math.PI * 4;
                    const radius = 2 + (i / 20) * 8;
                    const hornX = hornBaseX + Math.cos(angle) * radius;
                    const hornY = hornBaseY - (i / 20) * height * 0.25;
                    this.utils.drawEllipse(image, hornX, hornY, 2, 2, hornColor);
                }
                break;
            case 'straight':
                // Straight horn
                this.utils.drawEllipse(image, hornBaseX, hornBaseY - height * 0.15, 3, height * 0.3, hornColor);
                break;
            case 'crystal':
                // Crystal horn
                for (let i = 0; i < 15; i++) {
                    const hornX = hornBaseX + Math.sin(i * 0.4) * 3;
                    const hornY = hornBaseY - (i / 15) * height * 0.25;
                    this.utils.drawEllipse(image, hornX, hornY, 3, 3, hornColor);
                }
                // Add crystal facets
                for (let i = 0; i < 6; i++) {
                    const facetX = hornBaseX + Math.cos((i / 6) * Math.PI * 2) * 4;
                    const facetY = hornBaseY - height * 0.15;
                    this.utils.drawLine(image, hornBaseX, hornBaseY, facetX, facetY, this.utils.adjustBrightness(hornColor, -30));
                }
                break;
        }

        // Add horn glow
        await this.addHornGlow(image, hornBaseX, hornBaseY, width, height, hornColor, variant);
    }

    /**
     * Generate griffin
     */
    async generateGriffin(image, config) {
        const { width, height } = image.bitmap;
        const type = config.griffinType || 'noble';
        const size = config.griffinSize || 'adult';
        const color = config.griffinColor || 'golden';
        const pose = config.griffinPose || 'standing';
        const wings = config.griffinWings || 'majestic';

        // Calculate griffin dimensions
        const sizeMultiplier = { chick: 0.4, young: 0.7, adult: 1.0, elder: 1.3 };
        const multiplier = sizeMultiplier[size];

        const griffinWidth = Math.floor(100 * multiplier);
        const griffinHeight = Math.floor(85 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const griffinY = Math.floor(height - griffinHeight - 5);

        // Generate lion body
        await this.generateLionBody(image, centerX, griffinY, griffinWidth, griffinHeight, color, pose);

        // Generate eagle head
        await this.generateEagleHead(image, centerX, griffinY, griffinWidth, griffinHeight, type, color);

        // Generate wings
        await this.generateGriffinWings(image, centerX, griffinY, griffinWidth, griffinHeight, color, wings, pose);

        // Generate tail
        await this.generateGriffinTail(image, centerX, griffinY, griffinWidth, griffinHeight, color);

        // Add griffin details
        await this.addGriffinDetails(image, centerX, griffinY, griffinWidth, griffinHeight, type, color);

        // Add shadow
        await this.addCreatureShadow(image, centerX - griffinWidth * 0.5, griffinY, griffinWidth, griffinHeight);
    }

    /**
     * Generate phoenix
     */
    async generatePhoenix(image, config) {
        const { width, height } = image.bitmap;
        const phase = config.phoenixPhase || 'immortal';
        const size = config.phoenixSize || 'adult';
        const color = config.phoenixColor || 'fiery_red';
        const pose = config.phoenixPose || 'flying';
        const effect = config.phoenixEffect || 'flames';

        // Calculate phoenix dimensions
        const sizeMultiplier = { chick: 0.4, young: 0.7, adult: 1.0, ancient: 1.3 };
        const multiplier = sizeMultiplier[size];

        const phoenixWidth = Math.floor(90 * multiplier);
        const phoenixHeight = Math.floor(80 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const phoenixY = Math.floor(height - phoenixHeight - 5);

        // Generate phoenix body
        await this.generatePhoenixBody(image, centerX, phoenixY, phoenixWidth, phoenixHeight, color, pose);

        // Generate phoenix wings
        await this.generatePhoenixWings(image, centerX, phoenixY, phoenixWidth, phoenixHeight, color, pose);

        // Generate phoenix tail
        await this.generatePhoenixTail(image, centerX, phoenixY, phoenixWidth, phoenixHeight, color);

        // Generate phoenix head
        await this.generatePhoenixHead(image, centerX, phoenixY, phoenixWidth, phoenixHeight, color, phase);

        // Add rebirth effects
        await this.addPhoenixEffects(image, centerX, phoenixY, phoenixWidth, phoenixHeight, effect, phase);

        // Add shadow
        await this.addCreatureShadow(image, centerX - phoenixWidth * 0.5, phoenixY, phoenixWidth, phoenixHeight);
    }

    /**
     * Generate phoenix body
     */
    async generatePhoenixBody(image, centerX, y, width, height, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'phoenix');

        // Main body
        this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.3, height * 0.35, bodyColor);

        // Legs
        const legPositions = [
            { x: centerX - width * 0.15, y: y + height * 0.7 },
            { x: centerX + width * 0.15, y: y + height * 0.7 }
        ];

        for (const leg of legPositions) {
            this.utils.drawRectangle(image, leg.x - 2, leg.y, 4, height * 0.3, bodyColor);
            // Talons
            this.utils.drawEllipse(image, leg.x, leg.y + height * 0.3, 3, 4, 0x000000);
        }
    }

    /**
     * Generate phoenix wings
     */
    async generatePhoenixWings(image, centerX, y, width, height, color, pose) {
        const wingColor = this.getCreatureColor(color, 'wing');
        const wingSpan = width * 1.5;

        if (pose === 'flying') {
            // Extended wings
            const leftWingPoints = [
                { x: centerX - width * 0.15, y: y + height * 0.2 },
                { x: centerX - wingSpan * 0.4, y: y - height * 0.2 },
                { x: centerX - wingSpan * 0.2, y: y + height * 0.1 }
            ];
            const rightWingPoints = [
                { x: centerX + width * 0.15, y: y + height * 0.2 },
                { x: centerX + wingSpan * 0.4, y: y - height * 0.2 },
                { x: centerX + wingSpan * 0.2, y: y + height * 0.1 }
            ];

            await this.fillIrregularShape(image, leftWingPoints, wingColor);
            await this.fillIrregularShape(image, rightWingPoints, wingColor);
        } else {
            // Folded wings
            const leftWingPoints = [
                { x: centerX - width * 0.15, y: y + height * 0.2 },
                { x: centerX - width * 0.35, y: y - height * 0.1 },
                { x: centerX - width * 0.05, y: y + height * 0.3 }
            ];
            const rightWingPoints = [
                { x: centerX + width * 0.15, y: y + height * 0.2 },
                { x: centerX + width * 0.35, y: y - height * 0.1 },
                { x: centerX + width * 0.05, y: y + height * 0.3 }
            ];

            await this.fillIrregularShape(image, leftWingPoints, wingColor);
            await this.fillIrregularShape(image, rightWingPoints, wingColor);
        }

        // Add flame effects on wings
        await this.addWingFlames(image, centerX, y, width, height, wingColor);
    }

    /**
     * Generate phoenix tail
     */
    async generatePhoenixTail(image, centerX, y, width, height, color) {
        const tailColor = this.getCreatureColor(color, 'tail');
        const tailLength = width * 0.6;
        const tailSegments = 6;

        for (let i = 0; i < tailSegments; i++) {
            const tailX = centerX + width * 0.25 + (i * tailLength * 0.15);
            const tailY = y + height * 0.4 + Math.sin(i * 0.5) * height * 0.1;
            const segmentSize = width * (0.12 - i * 0.015);

            this.utils.drawEllipse(image, tailX, tailY, segmentSize, segmentSize * 0.8, tailColor);

            // Add flame tips
            if (i > 3) {
                this.utils.drawEllipse(image, tailX, tailY - segmentSize * 0.5, segmentSize * 0.8, segmentSize * 0.4, 0xFF4500);
            }
        }
    }

    /**
     * Generate phoenix head
     */
    async generatePhoenixHead(image, centerX, y, width, height, color, phase) {
        const headColor = this.getCreatureColor(color, 'head');
        const headSize = width * 0.18;

        // Head shape
        this.utils.drawEllipse(image, centerX - width * 0.2, y + height * 0.1, headSize, headSize * 0.9, headColor);

        // Eyes
        const eyeColor = phase === 'cosmic' ? 0x9370DB : 0xFFFF00;
        this.utils.drawEllipse(image, centerX - width * 0.25, y + height * 0.08, headSize * 0.15, headSize * 0.2, eyeColor);
        this.utils.drawEllipse(image, centerX - width * 0.15, y + height * 0.08, headSize * 0.15, headSize * 0.2, eyeColor);

        // Beak
        this.utils.drawEllipse(image, centerX - width * 0.3, y + height * 0.12, headSize * 0.1, headSize * 0.15, 0xFFA500);

        // Head crest/flames
        for (let i = 0; i < 8; i++) {
            const crestX = centerX - width * 0.2 + Math.cos((i / 8) * Math.PI) * headSize * 0.8;
            const crestY = y + height * 0.05 - Math.sin((i / 8) * Math.PI) * headSize * 0.4;
            this.utils.drawEllipse(image, crestX, crestY, 2, 4, 0xFF4500);
        }
    }

    /**
     * Helper methods
     */
    getCreatureColor(color, type) {
        const colorMap = {
            red: { dragon: 0xDC143C, wing: 0xB22222, head: 0x8B0000, tail: 0xDC143C, horn: 0xFFD700 },
            blue: { dragon: 0x4169E1, wing: 0x000080, head: 0x191970, tail: 0x4169E1, horn: 0x87CEEB },
            green: { dragon: 0x228B22, wing: 0x006400, head: 0x008000, tail: 0x228B22, horn: 0x32CD32 },
            black: { dragon: 0x2F2F2F, wing: 0x000000, head: 0x1C1C1C, tail: 0x2F2F2F, horn: 0x696969 },
            white: { dragon: 0xF5F5F5, wing: 0xFFFFFF, head: 0xE6E6FA, tail: 0xF5F5F5, horn: 0xFFFFFF },
            golden: { dragon: 0xFFD700, wing: 0xFFA500, head: 0xFF6347, tail: 0xFFD700, horn: 0xFFFF00 },
            purple: { dragon: 0x9370DB, wing: 0x8A2BE2, head: 0x9932CC, tail: 0x9370DB, horn: 0xDA70D6 },
            white: { horse: 0xF5F5F5, unicorn: 0xFFFFFF, mane: 0xE6E6FA },
            silver: { horse: 0xC0C0C0, unicorn: 0xD3D3D3, mane: 0xF5F5F5 },
            golden: { horse: 0xFFD700, unicorn: 0xFFA500, mane: 0xFFFF00 },
            rainbow: { horse: 0xFF6347, unicorn: 0x9370DB, mane: 0x4169E1 },
            crystal: { horse: 0xE6E6FA, unicorn: 0xF0F8FF, mane: 0xFFFFFF },
            golden: { griffin: 0xFFD700, wing: 0xFFA500, beak: 0xFF6347, tail: 0xFFD700 },
            brown: { griffin: 0x8B4513, wing: 0x654321, beak: 0x2F4F4F, tail: 0x8B4513 },
            white: { griffin: 0xF5F5F5, wing: 0xE6E6FA, beak: 0xFFFFFF, tail: 0xF5F5F5 },
            gray: { griffin: 0x696969, wing: 0x808080, beak: 0xC0C0C0, tail: 0x696969 },
            red: { griffin: 0xDC143C, wing: 0xB22222, beak: 0x8B0000, tail: 0xDC143C },
            fiery_red: { phoenix: 0xDC143C, wing: 0xFF4500, head: 0xB22222, tail: 0xFF6347 },
            golden: { phoenix: 0xFFD700, wing: 0xFFA500, head: 0xFF6347, tail: 0xFFFF00 },
            white: { phoenix: 0xF5F5F5, wing: 0xE6E6FA, head: 0xFFFFFF, tail: 0xF0F8FF },
            rainbow: { phoenix: 0xFF6347, wing: 0x9370DB, head: 0x4169E1, tail: 0xDA70D6 },
            cosmic: { phoenix: 0x9370DB, wing: 0x8A2BE2, head: 0x9932CC, tail: 0xDA70D6 }
        };

        return colorMap[color]?.[type] || 0x808080;
    }

    async addElementalEffects(image, centerX, y, width, height, element, pose) {
        const effectData = this.magicalEffects[element];
        if (!effectData) return;

        // Add elemental particles around the creature
        for (let i = 0; i < 15; i++) {
            const particleX = centerX + Math.floor((Math.random() - 0.5) * width * 1.2);
            const particleY = y + Math.floor(Math.random() * height);
            const particleColor = this.utils.getColor(effectData.colors[Math.floor(Math.random() * effectData.colors.length)]);
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, particleColor);
        }
    }

    async addWingMembranes(image, centerX, y, width, height, wingColor) {
        // Add wing membrane details
        for (let i = 0; i < 8; i++) {
            const membraneX = centerX + Math.floor((Math.random() - 0.5) * width);
            const membraneY = y + Math.floor(Math.random() * height * 0.6);
            this.utils.drawLine(image, membraneX, membraneY, membraneX + Math.floor(Math.random() * 10) - 5,
                             membraneY + Math.floor(Math.random() * 10) - 5, this.utils.adjustBrightness(wingColor, -20));
        }
    }

    async addDragonDetails(image, centerX, y, width, height, color, type) {
        const scaleColor = this.getCreatureColor(color, 'scale');

        // Add scales
        for (let i = 0; i < 30; i++) {
            const scaleX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
            const scaleY = y + Math.floor(Math.random() * height * 0.7);
            this.utils.drawEllipse(image, scaleX, scaleY, 3, 4, scaleColor);
        }

        // Add spikes
        for (let i = 0; i < 12; i++) {
            const spikeX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
            const spikeY = y + Math.floor(Math.random() * height * 0.5);
            this.utils.drawEllipse(image, spikeX, spikeY, 2, 6, scaleColor);
        }
    }

    async addCreatureShadow(image, x, y, width, height) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;
        const shadowOffset = Math.floor(width * 0.03);

        for (let sy = 0; sy < shadowOffset; sy++) {
            for (let sx = 0; sx < width; sx++) {
                const shadowX = x + sx;
                const shadowY = y + height + sy;

                if (shadowX >= 0 && shadowX < imgWidth && shadowY >= 0 && shadowY < imgHeight) {
                    const idx = (shadowY * imgWidth + shadowX) * 4;
                    const alpha = Math.floor(50 * (1 - sy / shadowOffset));
                    image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                }
            }
        }
    }

    async generateHorseMane(image, centerX, y, width, height, color, variant) {
        const maneColor = this.getCreatureColor(color, 'mane');

        // Add flowing mane
        for (let i = 0; i < 15; i++) {
            const maneX = centerX - width * 0.2 + Math.sin(i * 0.3) * 8;
            const maneY = y + height * 0.05 + i * 3;
            this.utils.drawEllipse(image, maneX, maneY, 3, 6, maneColor);
        }
    }

    async addUnicornMagic(image, centerX, y, width, height, variant, pose) {
        const magicColor = this.getCreatureColor(variant, 'magic');

        // Add magical particles
        for (let i = 0; i < 12; i++) {
            const particleX = centerX + Math.floor((Math.random() - 0.5) * width);
            const particleY = y + Math.floor(Math.random() * height);
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, magicColor);
        }
    }

    async addHornGlow(image, hornBaseX, hornBaseY, width, height, hornColor, variant) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        // Add horn glow
        for (let dy = -height * 0.1; dy <= height * 0.1; dy++) {
            for (let dx = -width * 0.05; dx <= width * 0.05; dx++) {
                const glowX = hornBaseX + dx;
                const glowY = hornBaseY + dy;
                if (glowX >= 0 && glowX < imgWidth && glowY >= 0 && glowY < imgHeight) {
                    const idx = (Math.floor(glowY) * imgWidth + Math.floor(glowX)) * 4;
                    const alpha = Math.floor(100 * (1 - Math.abs(dx) / (width * 0.05)));
                    image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                }
            }
        }
    }

    async generateLionBody(image, centerX, y, width, height, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'griffin');

        // Lion body
        this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.35, height * 0.3, bodyColor);

        // Legs
        const legPositions = [
            { x: centerX - width * 0.25, y: y + height * 0.6 },
            { x: centerX - width * 0.1, y: y + height * 0.65 },
            { x: centerX + width * 0.1, y: y + height * 0.65 },
            { x: centerX + width * 0.25, y: y + height * 0.6 }
        ];

        for (const leg of legPositions) {
            this.utils.drawRectangle(image, leg.x - 3, leg.y, 6, height * 0.4, bodyColor);
            // Paws
            this.utils.drawEllipse(image, leg.x, leg.y + height * 0.4, 4, 6, 0x000000);
        }

        // Tail
        this.utils.drawEllipse(image, centerX + width * 0.35, y + height * 0.3, width * 0.08, height * 0.3, bodyColor);
    }

    async generateEagleHead(image, centerX, y, width, height, type, color) {
        const headColor = this.getCreatureColor(color, 'head');
        const beakColor = this.getCreatureColor(color, 'beak');
        const headSize = width * 0.2;

        // Head shape
        this.utils.drawEllipse(image, centerX - width * 0.2, y + height * 0.1, headSize, headSize * 0.9, headColor);

        // Eyes
        this.utils.drawEllipse(image, centerX - width * 0.25, y + height * 0.08, headSize * 0.15, headSize * 0.2, 0xFFFF00);
        this.utils.drawEllipse(image, centerX - width * 0.15, y + height * 0.08, headSize * 0.15, headSize * 0.2, 0xFFFF00);

        // Pupils
        this.utils.drawEllipse(image, centerX - width * 0.25, y + height * 0.08, headSize * 0.08, headSize * 0.12, 0x000000);
        this.utils.drawEllipse(image, centerX - width * 0.15, y + height * 0.08, headSize * 0.08, headSize * 0.12, 0x000000);

        // Beak
        this.utils.drawEllipse(image, centerX - width * 0.3, y + height * 0.12, headSize * 0.1, headSize * 0.15, beakColor);

        // Head crest
        for (let i = 0; i < 6; i++) {
            const crestX = centerX - width * 0.2 + Math.cos((i / 6) * Math.PI) * headSize * 0.6;
            const crestY = y + height * 0.05 - Math.sin((i / 6) * Math.PI) * headSize * 0.3;
            this.utils.drawEllipse(image, crestX, crestY, 2, 4, headColor);
        }
    }

    async generateGriffinWings(image, centerX, y, width, height, color, wings, pose) {
        const wingColor = this.getCreatureColor(color, 'wing');
        const wingSpan = width * 1.3;

        if (pose === 'flying') {
            // Extended wings
            const leftWingPoints = [
                { x: centerX - width * 0.15, y: y + height * 0.2 },
                { x: centerX - wingSpan * 0.4, y: y - height * 0.2 },
                { x: centerX - wingSpan * 0.2, y: y + height * 0.1 }
            ];
            const rightWingPoints = [
                { x: centerX + width * 0.15, y: y + height * 0.2 },
                { x: centerX + wingSpan * 0.4, y: y - height * 0.2 },
                { x: centerX + wingSpan * 0.2, y: y + height * 0.1 }
            ];

            await this.fillIrregularShape(image, leftWingPoints, wingColor);
            await this.fillIrregularShape(image, rightWingPoints, wingColor);
        } else {
            // Folded wings
            const leftWingPoints = [
                { x: centerX - width * 0.15, y: y + height * 0.2 },
                { x: centerX - width * 0.35, y: y - height * 0.1 },
                { x: centerX - width * 0.05, y: y + height * 0.3 }
            ];
            const rightWingPoints = [
                { x: centerX + width * 0.15, y: y + height * 0.2 },
                { x: centerX + width * 0.35, y: y - height * 0.1 },
                { x: centerX + width * 0.05, y: y + height * 0.3 }
            ];

            await this.fillIrregularShape(image, leftWingPoints, wingColor);
            await this.fillIrregularShape(image, rightWingPoints, wingColor);
        }

        // Add wing details based on wings type
        if (wings === 'battle_torn') {
            await this.addTornWingDetails(image, centerX, y, width, height, wingColor);
        } else if (wings === 'feathered') {
            await this.addFeatheredWingDetails(image, centerX, y, width, height, wingColor);
        }
    }

    async generateGriffinTail(image, centerX, y, width, height, color) {
        const tailColor = this.getCreatureColor(color, 'tail');
        const tailLength = width * 0.5;
        const tailSegments = 6;

        for (let i = 0; i < tailSegments; i++) {
            const tailX = centerX + width * 0.35 + (i * tailLength * 0.15);
            const tailY = y + height * 0.4 + Math.sin(i * 0.4) * height * 0.08;
            const segmentSize = width * (0.1 - i * 0.01);

            this.utils.drawEllipse(image, tailX, tailY, segmentSize, segmentSize * 0.7, tailColor);

            // Add tail feathers
            if (i > 2) {
                for (let j = 0; j < 3; j++) {
                    const featherX = tailX + Math.cos((j / 3) * Math.PI) * segmentSize * 0.8;
                    const featherY = tailY + Math.sin((j / 3) * Math.PI) * segmentSize * 0.8;
                    this.utils.drawEllipse(image, featherX, featherY, 2, 4, tailColor);
                }
            }
        }
    }

    async addGriffinDetails(image, centerX, y, width, height, type, color) {
        const detailColor = this.getCreatureColor(color, 'detail');

        // Add fur details
        for (let i = 0; i < 20; i++) {
            const furX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
            const furY = y + Math.floor(Math.random() * height * 0.5);
            this.utils.drawEllipse(image, furX, furY, 2, 3, detailColor);
        }

        // Add noble details for noble griffins
        if (type === 'noble') {
            // Add gold accents
            this.utils.drawEllipse(image, centerX - width * 0.2, y + height * 0.08, 4, 4, 0xFFD700);
            this.utils.drawEllipse(image, centerX - width * 0.15, y + height * 0.08, 4, 4, 0xFFD700);
        }
    }

    async addWingFlames(image, centerX, y, width, height, wingColor) {
        // Add flame effects on wing edges
        for (let i = 0; i < 10; i++) {
            const flameX = centerX + Math.floor((Math.random() - 0.5) * width * 1.2);
            const flameY = y + Math.floor(Math.random() * height * 0.4);
            this.utils.drawEllipse(image, flameX, flameY, 3, 5, 0xFF4500);
        }
    }

    async addPhoenixEffects(image, centerX, y, width, height, effect, phase) {
        const { width: imgWidth, height: imgHeight } = image.bitmap;

        switch (effect) {
            case 'flames':
                // Add flame particles
                for (let i = 0; i < 20; i++) {
                    const flameX = centerX + Math.floor((Math.random() - 0.5) * width * 1.5);
                    const flameY = y + Math.floor(Math.random() * height);
                    const flameSize = Math.floor(2 + Math.random() * 4);
                    this.utils.drawEllipse(image, flameX, flameY, flameSize, flameSize * 1.5, 0xFF4500);
                }
                break;
            case 'sparks':
                // Add spark particles
                for (let i = 0; i < 15; i++) {
                    const sparkX = centerX + Math.floor((Math.random() - 0.5) * width * 1.3);
                    const sparkY = y + Math.floor(Math.random() * height);
                    this.utils.drawEllipse(image, sparkX, sparkY, 1, 1, 0xFFFF00);
                }
                break;
            case 'energy_waves':
                // Add energy wave effects
                for (let r = 1; r <= 3; r++) {
                    const radius = (width * 0.4 * r) / 3;
                    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                        const waveX = centerX + Math.cos(angle) * radius;
                        const waveY = y + Math.sin(angle) * radius;
                        if (waveX >= 0 && waveX < imgWidth && waveY >= 0 && waveY < imgHeight) {
                            const idx = (Math.floor(waveY) * imgWidth + Math.floor(waveX)) * 4;
                            image.bitmap.data[idx + 3] = Math.floor(120 * (1 - Math.abs(Math.sin(angle * 3))));
                        }
                    }
                }
                break;
        }

        // Add rebirth glow for rebirth phase
        if (phase === 'rebirth') {
            for (let dy = -height * 0.2; dy <= height * 0.2; dy++) {
                for (let dx = -width * 0.2; dx <= width * 0.2; dx++) {
                    const glowX = centerX + dx;
                    const glowY = y + dy;
                    if (glowX >= 0 && glowX < imgWidth && glowY >= 0 && glowY < imgHeight) {
                        const idx = (Math.floor(glowY) * imgWidth + Math.floor(glowX)) * 4;
                        const alpha = Math.floor(100 * (1 - Math.sqrt(dx * dx + dy * dy) / (Math.max(width, height) * 0.2)));
                        image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                    }
                }
            }
        }
    }

    async addTornWingDetails(image, centerX, y, width, height, wingColor) {
        // Add battle damage to wings
        for (let i = 0; i < 8; i++) {
            const tearX = centerX + Math.floor((Math.random() - 0.5) * width);
            const tearY = y + Math.floor(Math.random() * height * 0.4);
            const tearLength = Math.floor(5 + Math.random() * 10);

            for (let j = 0; j < tearLength; j++) {
                const tx = tearX + Math.floor((Math.random() - 0.5) * 4);
                const ty = tearY + j;
                if (tx >= 0 && tx < image.bitmap.width && ty >= 0 && ty < image.bitmap.height) {
                    const idx = (ty * image.bitmap.width + tx) * 4;
                    image.bitmap.data[idx] = Math.max(image.bitmap.data[idx], 50);
                    image.bitmap.data[idx + 1] = Math.max(image.bitmap.data[idx + 1], 50);
                    image.bitmap.data[idx + 2] = Math.max(image.bitmap.data[idx + 2], 50);
                }
            }
        }
    }

    async addFeatheredWingDetails(image, centerX, y, width, height, wingColor) {
        // Add feather details to wings
        for (let i = 0; i < 25; i++) {
            const featherX = centerX + Math.floor((Math.random() - 0.5) * width);
            const featherY = y + Math.floor(Math.random() * height * 0.4);
            const featherLength = Math.floor(3 + Math.random() * 5);

            for (let j = 0; j < featherLength; j++) {
                const fx = featherX;
                const fy = featherY + j;
                if (fx >= 0 && fx < image.bitmap.width && fy >= 0 && fy < image.bitmap.height) {
                    const idx = (fy * image.bitmap.width + fx) * 4;
                    const featherColor = this.utils.adjustBrightness(wingColor, Math.floor((Math.random() - 0.5) * 40));
                    image.bitmap.data[idx] = (featherColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (featherColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = featherColor & 0xFF;
                }
            }
        }
    }

    async fillIrregularShape(image, points, color) {
        const { width, height } = image.bitmap;

        // Find bounding box
        let minX = width, maxX = 0, minY = height, maxY = 0;
        for (const point of points) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }

        // Scanline fill
        for (let y = minY; y <= maxY; y++) {
            const intersections = [];

            // Find intersections with scanline
            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                const p2 = points[(i + 1) % points.length];

                if ((p1.y <= y && p2.y > y) || (p1.y > y && p2.y <= y)) {
                    const x = p1.x + (y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y);
                    intersections.push(Math.floor(x));
                }
            }

            // Sort intersections
            intersections.sort((a, b) => a - b);

            // Fill between pairs of intersections
            for (let i = 0; i < intersections.length; i += 2) {
                if (i + 1 < intersections.length) {
                    const startX = Math.max(0, intersections[i]);
                    const endX = Math.min(width - 1, intersections[i + 1]);

                    for (let x = startX; x <= endX; x++) {
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const idx = (y * width + x) * 4;
                            image.bitmap.data[idx] = (color >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = color & 0xFF;
                            image.bitmap.data[idx + 3] = 255;
                        }
                    }
                }
            }
        }
    }

    async generateKrakenBody(image, centerX, y, width, height, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'kraken');

        // Large bulbous head/body
        this.utils.drawEllipse(image, centerX, y + height * 0.3, width * 0.4, height * 0.4, bodyColor);

        // Eyes
        this.utils.drawEllipse(image, centerX - width * 0.15, y + height * 0.2, width * 0.08, height * 0.1, 0xFFFF00);
        this.utils.drawEllipse(image, centerX + width * 0.15, y + height * 0.2, width * 0.08, height * 0.1, 0xFFFF00);

        // Pupils
        this.utils.drawEllipse(image, centerX - width * 0.15, y + height * 0.2, width * 0.04, height * 0.06, 0x000000);
        this.utils.drawEllipse(image, centerX + width * 0.15, y + height * 0.2, width * 0.04, height * 0.06, 0x000000);

        // Beak
        this.utils.drawEllipse(image, centerX, y + height * 0.35, width * 0.06, height * 0.08, 0x8B4513);
    }

    async generateKrakenTentacles(image, centerX, y, width, height, color, variant) {
        const tentacleColor = this.getCreatureColor(color, 'tentacle');

        // Generate 8 tentacles
        for (let t = 0; t < 8; t++) {
            const baseAngle = (t / 8) * Math.PI * 2;
            const tentacleLength = height * 0.8;

            for (let s = 0; s < 10; s++) {
                const segmentAngle = baseAngle + Math.sin(s * 0.5) * 0.3;
                const segmentX = centerX + Math.cos(segmentAngle) * (width * 0.2 + s * tentacleLength * 0.08);
                const segmentY = y + height * 0.4 + Math.sin(segmentAngle) * (width * 0.2 + s * tentacleLength * 0.08);
                const segmentSize = Math.max(2, 8 - s);

                this.utils.drawEllipse(image, segmentX, segmentY, segmentSize, segmentSize * 0.8, tentacleColor);

                // Add suckers
                if (s % 2 === 0) {
                    for (let sucker = 0; sucker < 3; sucker++) {
                        const suckerAngle = segmentAngle + (sucker - 1) * 0.3;
                        const suckerX = segmentX + Math.cos(suckerAngle) * segmentSize;
                        const suckerY = segmentY + Math.sin(suckerAngle) * segmentSize;
                        this.utils.drawEllipse(image, suckerX, suckerY, 2, 2, 0x000000);
                    }
                }
            }
        }
    }

    async addKrakenEffects(image, centerX, y, width, height, variant) {
        switch (variant) {
            case 'storm':
                // Add lightning effects
                for (let i = 0; i < 8; i++) {
                    const lightningX = centerX + Math.floor((Math.random() - 0.5) * width);
                    const lightningY = y + Math.floor(Math.random() * height);
                    this.utils.drawEllipse(image, lightningX, lightningY, 2, 4, 0xFFFF00);
                }
                break;
            case 'bioluminescent':
                // Add glowing spots
                for (let i = 0; i < 15; i++) {
                    const glowX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const glowY = y + Math.floor(Math.random() * height);
                    this.utils.drawEllipse(image, glowX, glowY, 3, 3, 0x00FFFF);
                }
                break;
        }
    }

    // Additional creature generation methods
    async generateBasilisk(image, config) {
        const { width, height } = image.bitmap;
        const variant = config.basiliskVariant || 'stone';
        const size = config.basiliskSize || 'adult';
        const color = config.basiliskColor || 'green';
        const pose = config.basiliskPose || 'coiled';

        // Calculate basilisk dimensions
        const sizeMultiplier = { young: 0.7, adult: 1.0, elder: 1.3 };
        const multiplier = sizeMultiplier[size];

        const basiliskWidth = Math.floor(100 * multiplier);
        const basiliskHeight = Math.floor(60 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const basiliskY = Math.floor(height - basiliskHeight - 5);

        // Generate basilisk body
        await this.generateBasiliskBody(image, centerX, basiliskY, basiliskWidth, basiliskHeight, color, pose);

        // Generate basilisk head
        await this.generateBasiliskHead(image, centerX, basiliskY, basiliskWidth, basiliskHeight, variant, color);

        // Generate basilisk tail
        await this.generateBasiliskTail(image, centerX, basiliskY, basiliskWidth, basiliskHeight, color);

        // Add variant-specific effects
        await this.addBasiliskEffects(image, centerX, basiliskY, basiliskWidth, basiliskHeight, variant);

        // Add shadow
        await this.addCreatureShadow(image, centerX - basiliskWidth * 0.5, basiliskY, basiliskWidth, basiliskHeight);
    }

    async generateMermaid(image, config) {
        const { width, height } = image.bitmap;
        const type = config.mermaidType || 'ocean';
        const color = config.mermaidColor || 'blue';
        const pose = config.mermaidPose || 'swimming';
        const accessory = config.mermaidAccessory || 'shell_necklace';

        // Calculate mermaid dimensions
        const mermaidWidth = Math.floor(50 + Math.random() * 30);
        const mermaidHeight = Math.floor(100 + Math.random() * 40);
        const centerX = Math.floor(width * 0.5);
        const mermaidY = Math.floor(height - mermaidHeight - 5);

        // Generate mermaid upper body
        await this.generateMermaidUpperBody(image, centerX, mermaidY, mermaidWidth, mermaidHeight, color, pose);

        // Generate mermaid tail
        await this.generateMermaidTail(image, centerX, mermaidY, mermaidWidth, mermaidHeight, color, type);

        // Generate mermaid hair
        await this.generateMermaidHair(image, centerX, mermaidY, mermaidWidth, mermaidHeight, color);

        // Add accessory
        await this.addMermaidAccessory(image, centerX, mermaidY, mermaidWidth, mermaidHeight, accessory);

        // Add magical effects
        await this.addMermaidMagic(image, centerX, mermaidY, mermaidWidth, mermaidHeight, type);

        // Add shadow
        await this.addCreatureShadow(image, centerX - mermaidWidth * 0.5, mermaidY, mermaidWidth, mermaidHeight);
    }

    async generateCentaur(image, config) {
        const { width, height } = image.bitmap;
        const tribe = config.centaurTribe || 'forest';
        const color = config.centaurColor || 'brown';
        const pose = config.centaurPose || 'standing';
        const weapon = config.centaurWeapon || 'bow';

        // Calculate centaur dimensions
        const centaurWidth = Math.floor(70 + Math.random() * 30);
        const centaurHeight = Math.floor(120 + Math.random() * 40);
        const centerX = Math.floor(width * 0.5);
        const centaurY = Math.floor(height - centaurHeight - 5);

        // Generate human upper body
        await this.generateCentaurUpperBody(image, centerX, centaurY, centaurWidth, centaurHeight, color, pose);

        // Generate horse lower body
        await this.generateCentaurLowerBody(image, centerX, centaurY, centaurWidth, centaurHeight, color, tribe);

        // Add weapon
        await this.addCentaurWeapon(image, centerX, centaurY, centaurWidth, centaurHeight, weapon);

        // Add tribal details
        await this.addCentaurTribalDetails(image, centerX, centaurY, centaurWidth, centaurHeight, tribe);

        // Add shadow
        await this.addCreatureShadow(image, centerX - centaurWidth * 0.5, centaurY, centaurWidth, centaurHeight);
    }

    async generateSphinx(image, config) {
        const { width, height } = image.bitmap;
        const type = config.sphinxType || 'guardian';
        const size = config.sphinxSize || 'adult';
        const color = config.sphinxColor || 'golden';
        const pose = config.sphinxPose || 'sitting';
        const accessory = config.sphinxAccessory || 'crown';

        // Calculate sphinx dimensions
        const sizeMultiplier = { young: 0.7, adult: 1.0, ancient: 1.4 };
        const multiplier = sizeMultiplier[size];

        const sphinxWidth = Math.floor(110 * multiplier);
        const sphinxHeight = Math.floor(90 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const sphinxY = Math.floor(height - sphinxHeight - 5);

        // Generate lion body
        await this.generateSphinxBody(image, centerX, sphinxY, sphinxWidth, sphinxHeight, color, pose);

        // Generate human head
        await this.generateSphinxHead(image, centerX, sphinxY, sphinxWidth, sphinxHeight, type, color);

        // Generate wings
        await this.generateSphinxWings(image, centerX, sphinxY, sphinxWidth, sphinxHeight, color);

        // Add accessory
        await this.addSphinxAccessory(image, centerX, sphinxY, sphinxWidth, sphinxHeight, accessory);

        // Add mystical effects
        await this.addSphinxEffects(image, centerX, sphinxY, sphinxWidth, sphinxHeight, type);

        // Add shadow
        await this.addCreatureShadow(image, centerX - sphinxWidth * 0.5, sphinxY, sphinxWidth, sphinxHeight);
    }

    async generateKraken(image, config) {
        const { width, height } = image.bitmap;
        const variant = config.krakenVariant || 'deep_sea';
        const size = config.krakenSize || 'adult';
        const color = config.krakenColor || 'deep_blue';
        const pose = config.krakenPose || 'emerging';

        // Calculate kraken dimensions
        const sizeMultiplier = { young: 0.6, adult: 1.0, elder: 1.5 };
        const multiplier = sizeMultiplier[size];

        const krakenWidth = Math.floor(140 * multiplier);
        const krakenHeight = Math.floor(100 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const krakenY = Math.floor(height - krakenHeight - 5);

        // Generate kraken head/body
        await this.generateKrakenBody(image, centerX, krakenY, krakenWidth, krakenHeight, color, pose);

        // Generate tentacles
        await this.generateKrakenTentacles(image, centerX, krakenY, krakenWidth, krakenHeight, color, variant);

        // Add variant effects
        await this.addKrakenEffects(image, centerX, krakenY, krakenWidth, krakenHeight, variant);

        // Add shadow
        await this.addCreatureShadow(image, centerX - krakenWidth * 0.5, krakenY, krakenWidth, krakenHeight);
    }

    async generatePegasus(image, config) {
        const { width, height } = image.bitmap;
        const type = config.pegasusType || 'celestial';
        const size = config.pegasusSize || 'adult';
        const color = config.pegasusColor || 'white';
        const pose = config.pegasusPose || 'standing';
        const wings = config.pegasusWings || 'majestic';

        // Calculate pegasus dimensions
        const sizeMultiplier = { foal: 0.5, young: 0.8, adult: 1.0, elder: 1.2 };
        const multiplier = sizeMultiplier[size];

        const pegasusWidth = Math.floor(85 * multiplier);
        const pegasusHeight = Math.floor(95 * multiplier);
        const centerX = Math.floor(width * 0.5);
        const pegasusY = Math.floor(height - pegasusHeight - 5);

        // Generate horse body
        await this.generatePegasusBody(image, centerX, pegasusY, pegasusWidth, pegasusHeight, color, pose);

        // Generate wings
        await this.generatePegasusWings(image, centerX, pegasusY, pegasusWidth, pegasusHeight, color, wings, pose);

        // Generate mane and tail
        await this.generatePegasusMane(image, centerX, pegasusY, pegasusWidth, pegasusHeight, color, type);

        // Add celestial effects
        await this.addPegasusEffects(image, centerX, pegasusY, pegasusWidth, pegasusHeight, type);

        // Add shadow
        await this.addCreatureShadow(image, centerX - pegasusWidth * 0.5, pegasusY, pegasusWidth, pegasusHeight);
    }

    // Helper methods for additional creatures
    async generateBasiliskBody(image, centerX, y, width, height, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'basilisk');

        if (pose === 'coiled') {
            // Coiled body
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 3;
                const radius = width * (0.4 - i * 0.03);
                const coilX = centerX + Math.cos(angle) * radius;
                const coilY = y + height * 0.4 + Math.sin(angle) * radius;
                this.utils.drawEllipse(image, coilX, coilY, width * (0.15 - i * 0.01), height * (0.12 - i * 0.008), bodyColor);
            }
        } else {
            // Stretched body
            this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.3, bodyColor);
        }
    }

    async generateBasiliskHead(image, centerX, y, width, height, variant, color) {
        const headColor = this.getCreatureColor(color, 'head');
        const headSize = width * 0.18;

        // Head shape
        this.utils.drawEllipse(image, centerX, y, headSize, headSize * 0.9, headColor);

        // Eyes
        const eyeColor = variant === 'hypnotic' ? 0x9370DB : 0xFFFF00;
        this.utils.drawEllipse(image, centerX - headSize * 0.3, y - headSize * 0.1, headSize * 0.15, headSize * 0.2, eyeColor);
        this.utils.drawEllipse(image, centerX + headSize * 0.3, y - headSize * 0.1, headSize * 0.15, headSize * 0.2, eyeColor);

        // Fangs
        this.utils.drawRectangle(image, centerX - headSize * 0.1, y + headSize * 0.1, 2, headSize * 0.2, 0xFFFFFF);
        this.utils.drawRectangle(image, centerX + headSize * 0.1, y + headSize * 0.1, 2, headSize * 0.2, 0xFFFFFF);

        // Horns/spikes
        for (let i = 0; i < 4; i++) {
            const hornAngle = (i / 4) * Math.PI * 2;
            const hornX = centerX + Math.cos(hornAngle) * headSize * 0.8;
            const hornY = y + Math.sin(hornAngle) * headSize * 0.8;
            this.utils.drawEllipse(image, hornX, hornY, 3, 6, headColor);
        }
    }

    async generateBasiliskTail(image, centerX, y, width, height, color) {
        const tailColor = this.getCreatureColor(color, 'tail');
        const tailLength = width * 0.6;
        const tailSegments = 6;

        for (let i = 0; i < tailSegments; i++) {
            const tailX = centerX + width * 0.4 + (i * tailLength * 0.15);
            const tailY = y + height * 0.5 + Math.sin(i * 0.5) * height * 0.1;
            const segmentSize = width * (0.12 - i * 0.015);

            this.utils.drawEllipse(image, tailX, tailY, segmentSize, segmentSize * 0.8, tailColor);

            // Add tail spikes
            if (i % 2 === 0) {
                this.utils.drawEllipse(image, tailX, tailY - segmentSize * 0.6, segmentSize * 0.3, segmentSize * 0.5, tailColor);
            }
        }
    }

    async addBasiliskEffects(image, centerX, y, width, height, variant) {
        switch (variant) {
            case 'stone':
                // Add stone-like texture
                for (let i = 0; i < 20; i++) {
                    const stoneX = centerX + Math.floor((Math.random() - 0.5) * width * 0.8);
                    const stoneY = y + Math.floor(Math.random() * height);
                    this.utils.drawEllipse(image, stoneX, stoneY, 3, 4, 0x696969);
                }
                break;
            case 'hypnotic':
                // Add hypnotic swirls
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const swirlX = centerX + Math.cos(angle) * width * 0.3;
                    const swirlY = y + Math.sin(angle) * height * 0.3;
                    this.utils.drawEllipse(image, swirlX, swirlY, 4, 4, 0x9370DB);
                }
                break;
        }
    }

    async generateMermaidUpperBody(image, centerX, y, width, height, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'mermaid');

        // Upper body (human-like)
        this.utils.drawEllipse(image, centerX, y + height * 0.2, width * 0.3, height * 0.25, bodyColor);

        // Arms
        this.utils.drawEllipse(image, centerX - width * 0.35, y + height * 0.15, width * 0.08, height * 0.2, bodyColor);
        this.utils.drawEllipse(image, centerX + width * 0.35, y + height * 0.15, width * 0.08, height * 0.2, bodyColor);

        // Head
        this.utils.drawEllipse(image, centerX, y, width * 0.15, height * 0.15, bodyColor);
    }

    async generateMermaidTail(image, centerX, y, width, height, color, type) {
        const tailColor = this.getCreatureColor(color, 'tail');

        // Fish-like tail
        const tailPoints = [
            { x: centerX, y: y + height * 0.4 },
            { x: centerX - width * 0.4, y: y + height * 0.6 },
            { x: centerX - width * 0.2, y: y + height },
            { x: centerX + width * 0.2, y: y + height },
            { x: centerX + width * 0.4, y: y + height * 0.6 }
        ];

        await this.fillIrregularShape(image, tailPoints, tailColor);

        // Add scales
        for (let i = 0; i < 15; i++) {
            const scaleX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
            const scaleY = y + height * 0.5 + Math.floor(Math.random() * height * 0.4);
            this.utils.drawEllipse(image, scaleX, scaleY, 3, 2, this.utils.adjustBrightness(tailColor, -20));
        }

        // Add fins
        this.utils.drawEllipse(image, centerX - width * 0.45, y + height * 0.7, width * 0.15, height * 0.1, tailColor);
        this.utils.drawEllipse(image, centerX + width * 0.45, y + height * 0.7, width * 0.15, height * 0.1, tailColor);
    }

    async generateMermaidHair(image, centerX, y, width, height, color) {
        const hairColor = this.getCreatureColor(color, 'hair');

        // Flowing hair
        for (let i = 0; i < 12; i++) {
            const hairX = centerX + Math.sin(i * 0.4) * width * 0.2;
            const hairY = y - height * 0.05 + i * 4;
            const hairWidth = Math.max(1, 6 - i * 0.4);
            this.utils.drawEllipse(image, hairX, hairY, hairWidth, 3, hairColor);
        }
    }

    async addMermaidAccessory(image, centerX, y, width, height, accessory) {
        switch (accessory) {
            case 'shell_necklace':
                // Add shell necklace
                for (let i = 0; i < 5; i++) {
                    const shellX = centerX - width * 0.2 + (i * width * 0.08);
                    const shellY = y + height * 0.25;
                    this.utils.drawEllipse(image, shellX, shellY, 4, 3, 0xFFE4B5);
                }
                break;
            case 'pearl_crown':
                // Add pearl crown
                for (let i = 0; i < 7; i++) {
                    const pearlX = centerX - width * 0.15 + (i * width * 0.04);
                    const pearlY = y - height * 0.02;
                    this.utils.drawEllipse(image, pearlX, pearlY, 2, 2, 0xF5F5F5);
                }
                break;
        }
    }

    async addMermaidMagic(image, centerX, y, width, height, type) {
        const magicColor = this.getCreatureColor(type, 'magic');

        // Add magical bubbles/particles
        for (let i = 0; i < 10; i++) {
            const bubbleX = centerX + Math.floor((Math.random() - 0.5) * width);
            const bubbleY = y + Math.floor(Math.random() * height);
            this.utils.drawEllipse(image, bubbleX, bubbleY, 2, 2, magicColor);
        }
    }

    async generateCentaurUpperBody(image, centerX, y, width, height, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'centaur');

        // Human torso
        this.utils.drawEllipse(image, centerX, y + height * 0.15, width * 0.25, height * 0.2, bodyColor);

        // Arms
        this.utils.drawEllipse(image, centerX - width * 0.3, y + height * 0.1, width * 0.08, height * 0.15, bodyColor);
        this.utils.drawEllipse(image, centerX + width * 0.3, y + height * 0.1, width * 0.08, height * 0.15, bodyColor);

        // Head
        this.utils.drawEllipse(image, centerX, y, width * 0.12, height * 0.12, bodyColor);

        // Hair
        for (let i = 0; i < 8; i++) {
            const hairX = centerX + Math.sin(i * 0.5) * width * 0.1;
            const hairY = y - height * 0.02 + i * 2;
            this.utils.drawEllipse(image, hairX, hairY, 3, 4, this.utils.adjustBrightness(bodyColor, -30));
        }
    }

    async generateCentaurLowerBody(image, centerX, y, width, height, color, tribe) {
        const bodyColor = this.getCreatureColor(color, 'horse');

        // Horse body
        this.utils.drawEllipse(image, centerX, y + height * 0.5, width * 0.35, height * 0.25, bodyColor);

        // Legs
        const legPositions = [
            { x: centerX - width * 0.25, y: y + height * 0.6 },
            { x: centerX - width * 0.1, y: y + height * 0.65 },
            { x: centerX + width * 0.1, y: y + height * 0.65 },
            { x: centerX + width * 0.25, y: y + height * 0.6 }
        ];

        for (const leg of legPositions) {
            this.utils.drawRectangle(image, leg.x - 3, leg.y, 6, height * 0.4, bodyColor);
            this.utils.drawEllipse(image, leg.x, leg.y + height * 0.4, 4, 6, 0x000000);
        }

        // Tail
        this.utils.drawEllipse(image, centerX + width * 0.35, y + height * 0.4, width * 0.08, height * 0.2, bodyColor);
    }

    async addCentaurWeapon(image, centerX, y, width, height, weapon) {
        switch (weapon) {
            case 'bow':
                // Draw bow
                this.utils.drawEllipse(image, centerX + width * 0.35, y + height * 0.1, 2, height * 0.15, 0x8B4513);
                // Draw string
                this.utils.drawLine(image, centerX + width * 0.35, y + height * 0.05, centerX + width * 0.35, y + height * 0.2, 0xFFFFFF);
                break;
            case 'spear':
                // Draw spear
                this.utils.drawRectangle(image, centerX + width * 0.35, y + height * 0.05, 2, height * 0.2, 0x8B4513);
                this.utils.drawEllipse(image, centerX + width * 0.35, y + height * 0.03, 4, 4, 0xC0C0C0);
                break;
        }
    }

    async addCentaurTribalDetails(image, centerX, y, width, height, tribe) {
        const detailColor = this.getCreatureColor(tribe, 'detail');

        // Add tribal patterns
        for (let i = 0; i < 12; i++) {
            const patternX = centerX + Math.floor((Math.random() - 0.5) * width * 0.6);
            const patternY = y + Math.floor(Math.random() * height * 0.4);
            this.utils.drawEllipse(image, patternX, patternY, 2, 2, detailColor);
        }
    }

    async generateSphinxBody(image, centerX, y, width, height, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'sphinx');

        // Lion body
        this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.35, height * 0.3, bodyColor);

        // Legs
        const legPositions = [
            { x: centerX - width * 0.25, y: y + height * 0.6 },
            { x: centerX - width * 0.1, y: y + height * 0.65 },
            { x: centerX + width * 0.1, y: y + height * 0.65 },
            { x: centerX + width * 0.25, y: y + height * 0.6 }
        ];

        for (const leg of legPositions) {
            this.utils.drawRectangle(image, leg.x - 3, leg.y, 6, height * 0.4, bodyColor);
            this.utils.drawEllipse(image, leg.x, leg.y + height * 0.4, 4, 6, 0x000000);
        }

        // Tail
        this.utils.drawEllipse(image, centerX + width * 0.35, y + height * 0.4, width * 0.08, height * 0.2, bodyColor);
    }

    async generateSphinxHead(image, centerX, y, width, height, type, color) {
        const headColor = this.getCreatureColor(color, 'head');
        const headSize = width * 0.2;

        // Human-like head
        this.utils.drawEllipse(image, centerX - width * 0.2, y + height * 0.1, headSize, headSize * 0.9, headColor);

        // Eyes
        this.utils.drawEllipse(image, centerX - width * 0.25, y + height * 0.08, headSize * 0.15, headSize * 0.2, 0xFFFF00);
        this.utils.drawEllipse(image, centerX - width * 0.15, y + height * 0.08, headSize * 0.15, headSize * 0.2, 0xFFFF00);

        // Pupils
        this.utils.drawEllipse(image, centerX - width * 0.25, y + height * 0.08, headSize * 0.08, headSize * 0.12, 0x000000);
        this.utils.drawEllipse(image, centerX - width * 0.15, y + height * 0.08, headSize * 0.08, headSize * 0.12, 0x000000);

        // Mouth
        this.utils.drawEllipse(image, centerX - width * 0.2, y + height * 0.15, headSize * 0.1, headSize * 0.08, 0x000000);

        // Headdress
        for (let i = 0; i < 6; i++) {
            const headdressX = centerX - width * 0.2 + Math.cos((i / 6) * Math.PI) * headSize * 0.8;
            const headdressY = y + height * 0.05 - Math.sin((i / 6) * Math.PI) * headSize * 0.3;
            this.utils.drawEllipse(image, headdressX, headdressY, 3, 5, headColor);
        }
    }

    async generateSphinxWings(image, centerX, y, width, height, color) {
        const wingColor = this.getCreatureColor(color, 'wing');
        const wingSpan = width * 1.2;

        // Large majestic wings
        const leftWingPoints = [
            { x: centerX - width * 0.15, y: y + height * 0.2 },
            { x: centerX - wingSpan * 0.5, y: y - height * 0.3 },
            { x: centerX - wingSpan * 0.3, y: y + height * 0.1 }
        ];
        const rightWingPoints = [
            { x: centerX + width * 0.15, y: y + height * 0.2 },
            { x: centerX + wingSpan * 0.5, y: y - height * 0.3 },
            { x: centerX + wingSpan * 0.3, y: y + height * 0.1 }
        ];

        await this.fillIrregularShape(image, leftWingPoints, wingColor);
        await this.fillIrregularShape(image, rightWingPoints, wingColor);

        // Add wing details
        await this.addWingMembranes(image, centerX, y, width, height, wingColor);
    }

    async addSphinxAccessory(image, centerX, y, width, height, accessory) {
        switch (accessory) {
            case 'crown':
                // Add golden crown
                for (let i = 0; i < 5; i++) {
                    const crownX = centerX - width * 0.15 + (i * width * 0.06);
                    const crownY = y - height * 0.02;
                    this.utils.drawEllipse(image, crownX, crownY, 3, 4, 0xFFD700);
                }
                break;
            case 'necklace':
                // Add jeweled necklace
                for (let i = 0; i < 7; i++) {
                    const necklaceX = centerX - width * 0.2 + (i * width * 0.06);
                    const necklaceY = y + height * 0.15;
                    this.utils.drawEllipse(image, necklaceX, necklaceY, 2, 2, 0x9370DB);
                }
                break;
        }
    }

    async addSphinxEffects(image, centerX, y, width, height, type) {
        const effectColor = this.getCreatureColor(type, 'effect');

        // Add mystical aura
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const effectX = centerX + Math.cos(angle) * width * 0.6;
            const effectY = y + Math.sin(angle) * height * 0.6;
            this.utils.drawEllipse(image, effectX, effectY, 3, 3, effectColor);
        }
    }

    async generatePegasusBody(image, centerX, y, width, height, color, pose) {
        const bodyColor = this.getCreatureColor(color, 'pegasus');

        // Horse body
        this.utils.drawEllipse(image, centerX, y + height * 0.4, width * 0.4, height * 0.35, bodyColor);

        // Head
        this.utils.drawEllipse(image, centerX - width * 0.25, y + height * 0.1, width * 0.15, height * 0.2, bodyColor);

        // Legs
        const legPositions = [
            { x: centerX - width * 0.35, y: y + height * 0.6 },
            { x: centerX - width * 0.15, y: y + height * 0.65 },
            { x: centerX + width * 0.15, y: y + height * 0.65 },
            { x: centerX + width * 0.35, y: y + height * 0.6 }
        ];

        for (const leg of legPositions) {
            this.utils.drawRectangle(image, leg.x - 3, leg.y, 6, height * 0.4, bodyColor);
            this.utils.drawEllipse(image, leg.x, leg.y + height * 0.4, 4, 6, 0x000000);
        }

        // Tail
        this.utils.drawEllipse(image, centerX + width * 0.4, y + height * 0.3, width * 0.08, height * 0.3, bodyColor);
    }

    async generatePegasusWings(image, centerX, y, width, height, color, wings, pose) {
        const wingColor = this.getCreatureColor(color, 'wing');
        const wingSpan = width * 1.4;

        if (pose === 'flying') {
            // Extended wings
            const leftWingPoints = [
                { x: centerX - width * 0.15, y: y + height * 0.2 },
                { x: centerX - wingSpan * 0.4, y: y - height * 0.3 },
                { x: centerX - wingSpan * 0.2, y: y + height * 0.1 }
            ];
            const rightWingPoints = [
                { x: centerX + width * 0.15, y: y + height * 0.2 },
                { x: centerX + wingSpan * 0.4, y: y - height * 0.3 },
                { x: centerX + wingSpan * 0.2, y: y + height * 0.1 }
            ];

            await this.fillIrregularShape(image, leftWingPoints, wingColor);
            await this.fillIrregularShape(image, rightWingPoints, wingColor);
        } else {
            // Folded wings
            const leftWingPoints = [
                { x: centerX - width * 0.15, y: y + height * 0.2 },
                { x: centerX - width * 0.35, y: y - height * 0.1 },
                { x: centerX - width * 0.05, y: y + height * 0.3 }
            ];
            const rightWingPoints = [
                { x: centerX + width * 0.15, y: y + height * 0.2 },
                { x: centerX + width * 0.35, y: y - height * 0.1 },
                { x: centerX + width * 0.05, y: y + height * 0.3 }
            ];

            await this.fillIrregularShape(image, leftWingPoints, wingColor);
            await this.fillIrregularShape(image, rightWingPoints, wingColor);
        }

        // Add wing details based on wings type
        if (wings === 'storm') {
            await this.addStormWingDetails(image, centerX, y, width, height, wingColor);
        } else if (wings === 'ethereal') {
            await this.addEtherealWingDetails(image, centerX, y, width, height, wingColor);
        }
    }

    async generatePegasusMane(image, centerX, y, width, height, color, type) {
        const maneColor = this.getCreatureColor(color, 'mane');

        // Add flowing mane
        for (let i = 0; i < 15; i++) {
            const maneX = centerX - width * 0.2 + Math.sin(i * 0.3) * 8;
            const maneY = y + height * 0.05 + i * 3;
            this.utils.drawEllipse(image, maneX, maneY, 3, 6, maneColor);
        }
    }

    async addPegasusEffects(image, centerX, y, width, height, type) {
        const effectColor = this.getCreatureColor(type, 'effect');

        // Add celestial particles
        for (let i = 0; i < 12; i++) {
            const particleX = centerX + Math.floor((Math.random() - 0.5) * width);
            const particleY = y + Math.floor(Math.random() * height);
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, effectColor);
        }
    }

    async addStormWingDetails(image, centerX, y, width, height, wingColor) {
        // Add storm effects to wings
        for (let i = 0; i < 10; i++) {
            const stormX = centerX + Math.floor((Math.random() - 0.5) * width);
            const stormY = y + Math.floor(Math.random() * height * 0.4);
            this.utils.drawEllipse(image, stormX, stormY, 2, 3, 0x87CEEB);
        }
    }

    async addEtherealWingDetails(image, centerX, y, width, height, wingColor) {
        // Add ethereal glow to wings
        for (let i = 0; i < 15; i++) {
            const etherealX = centerX + Math.floor((Math.random() - 0.5) * width);
            const etherealY = y + Math.floor(Math.random() * height * 0.4);
            this.utils.drawEllipse(image, etherealX, etherealY, 1, 1, 0xE6E6FA);
        }
    }
}

module.exports = MythicalCreaturesGenerator;
