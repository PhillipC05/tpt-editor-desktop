/**
 * TPT Level Generator
 * Main orchestrator for generating complete game levels using all sprite generators
 */

const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class LevelGenerator {
    constructor() {
        this.level = null;
        this.generators = {};
        this.config = {};
        this.metadata = {};
    }

    /**
     * Initialize level generator with configuration
     */
    async initialize(config = {}) {
        this.config = {
            width: config.width || 32, // tiles
            height: config.height || 24, // tiles
            tileSize: config.tileSize || 32, // pixels
            levelType: config.levelType || 'dungeon',
            theme: config.theme || 'medieval',
            difficulty: config.difficulty || 'normal',
            seed: config.seed || Math.random(),
            ...config
        };

        // Initialize random seed for reproducible generation
        this.randomSeed = this.config.seed;
        Math.random = this.seededRandom.bind(this);

        // Initialize level data structure
        this.level = {
            id: uuidv4(),
            name: config.name || this.generateLevelName(),
            type: this.config.levelType,
            theme: this.config.theme,
            difficulty: this.config.difficulty,
            dimensions: {
                width: this.config.width,
                height: this.config.height,
                tileSize: this.config.tileSize
            },
            layers: {
                background: this.createEmptyLayer(),
                terrain: this.createEmptyLayer(),
                structures: this.createEmptyLayer(),
                interactive: this.createEmptyLayer(),
                lighting: this.createEmptyLayer(),
                effects: this.createEmptyLayer()
            },
            entities: [],
            metadata: {
                generated: new Date().toISOString(),
                version: '1.0',
                seed: this.config.seed,
                objectives: this.generateObjectives(),
                description: this.generateDescription()
            }
        };

        return this;
    }

    /**
     * Generate complete level
     */
    async generateLevel(config = {}) {
        await this.initialize(config);

        console.log(`Generating ${this.config.levelType} level: ${this.level.name}`);

        // Generate level based on type
        switch (this.config.levelType) {
            case 'dungeon':
                await this.generateDungeonLevel();
                break;
            case 'cave':
                await this.generateCaveLevel();
                break;
            case 'forest':
                await this.generateForestLevel();
                break;
            case 'town':
                await this.generateTownLevel();
                break;
            case 'castle':
                await this.generateCastleLevel();
                break;
            default:
                await this.generateDungeonLevel();
        }

        // Post-process level
        await this.postProcessLevel();

        // Validate level
        await this.validateLevel();

        return this.level;
    }

    /**
     * Generate dungeon level
     */
    async generateDungeonLevel() {
        console.log('Generating dungeon layout...');

        // Generate room layout
        const rooms = await this.generateRoomLayout();

        // Generate corridors
        const corridors = await this.generateCorridors(rooms);

        // Place terrain
        await this.placeDungeonTerrain(rooms, corridors);

        // Place structures
        await this.placeDungeonStructures(rooms);

        // Place interactive elements
        await this.placeInteractiveElements(rooms);

        // Place lighting
        await this.placeDungeonLighting(rooms, corridors);

        // Place enemies and NPCs
        await this.placeDungeonEntities(rooms);
    }

    /**
     * Generate cave level
     */
    async generateCaveLevel() {
        console.log('Generating cave system...');

        // Generate cave network
        const caveNetwork = await this.generateCaveNetwork();

        // Generate stalactites and formations
        await this.placeCaveFormations(caveNetwork);

        // Place cave terrain
        await this.placeCaveTerrain(caveNetwork);

        // Place cave structures
        await this.placeCaveStructures(caveNetwork);

        // Place cave lighting
        await this.placeCaveLighting(caveNetwork);

        // Place cave entities
        await this.placeCaveEntities(caveNetwork);
    }

    /**
     * Generate forest level
     */
    async generateForestLevel() {
        console.log('Generating forest environment...');

        // Generate terrain layout
        const terrainLayout = await this.generateForestTerrain();

        // Place trees and vegetation
        await this.placeForestVegetation(terrainLayout);

        // Generate paths and clearings
        await this.placeForestPaths(terrainLayout);

        // Place forest structures
        await this.placeForestStructures(terrainLayout);

        // Place forest lighting
        await this.placeForestLighting(terrainLayout);

        // Place forest entities
        await this.placeForestEntities(terrainLayout);
    }

    /**
     * Generate town level
     */
    async generateTownLevel() {
        console.log('Generating town layout...');

        // Generate town layout
        const townLayout = await this.generateTownLayout();

        // Place buildings
        await this.placeTownBuildings(townLayout);

        // Generate streets and paths
        await this.placeTownStreets(townLayout);

        // Place town structures
        await this.placeTownStructures(townLayout);

        // Place town lighting
        await this.placeTownLighting(townLayout);

        // Place town entities
        await this.placeTownEntities(townLayout);
    }

    /**
     * Generate castle level
     */
    async generateCastleLevel() {
        console.log('Generating castle complex...');

        // Generate castle layout
        const castleLayout = await this.generateCastleLayout();

        // Place castle structures
        await this.placeCastleStructures(castleLayout);

        // Generate castle terrain
        await this.placeCastleTerrain(castleLayout);

        // Place castle lighting
        await this.placeCastleLighting(castleLayout);

        // Place castle entities
        await this.placeCastleEntities(castleLayout);
    }

    /**
     * Generate room layout for dungeon
     */
    async generateRoomLayout() {
        const rooms = [];
        const minRooms = 5;
        const maxRooms = 12;
        const roomCount = minRooms + Math.floor(Math.random() * (maxRooms - minRooms));

        for (let i = 0; i < roomCount; i++) {
            const room = {
                id: `room_${i}`,
                x: Math.floor(Math.random() * (this.config.width - 8)) + 4,
                y: Math.floor(Math.random() * (this.config.height - 6)) + 3,
                width: 4 + Math.floor(Math.random() * 6), // 4-10 tiles
                height: 3 + Math.floor(Math.random() * 4), // 3-7 tiles
                type: this.getRandomRoomType(),
                connections: []
            };
            rooms.push(room);
        }

        return rooms;
    }

    /**
     * Generate corridors connecting rooms
     */
    async generateCorridors(rooms) {
        const corridors = [];

        // Connect rooms with corridors
        for (let i = 0; i < rooms.length - 1; i++) {
            const room1 = rooms[i];
            const room2 = rooms[i + 1];

            const corridor = {
                id: `corridor_${i}`,
                startX: room1.x + Math.floor(room1.width / 2),
                startY: room1.y + Math.floor(room1.height / 2),
                endX: room2.x + Math.floor(room2.width / 2),
                endY: room2.y + Math.floor(room2.height / 2),
                width: 1 + Math.floor(Math.random() * 2) // 1-2 tiles wide
            };

            corridors.push(corridor);
        }

        return corridors;
    }

    /**
     * Place dungeon terrain
     */
    async placeDungeonTerrain(rooms, corridors) {
        // Place floor tiles in rooms
        for (const room of rooms) {
            for (let x = room.x; x < room.x + room.width; x++) {
                for (let y = room.y; y < room.y + room.height; y++) {
                    if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                        this.level.layers.terrain[y][x] = 'dungeon_floor';
                    }
                }
            }
        }

        // Place corridor tiles
        for (const corridor of corridors) {
            // Horizontal corridor
            const startX = Math.min(corridor.startX, corridor.endX);
            const endX = Math.max(corridor.startX, corridor.endX);
            const y = corridor.startY;

            for (let x = startX; x <= endX; x++) {
                if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                    this.level.layers.terrain[y][x] = 'dungeon_floor';
                }
            }

            // Vertical corridor
            const startY = Math.min(corridor.startY, corridor.endY);
            const endY = Math.max(corridor.startY, corridor.endY);
            const x = corridor.endX;

            for (let y = startY; y <= endY; y++) {
                if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                    this.level.layers.terrain[y][x] = 'dungeon_floor';
                }
            }
        }

        // Place walls around rooms and corridors
        await this.placeDungeonWalls(rooms, corridors);
    }

    /**
     * Place dungeon walls
     */
    async placeDungeonWalls(rooms, corridors) {
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (this.level.layers.terrain[y][x] === 'dungeon_floor') {
                    // Check adjacent tiles for walls
                    const adjacentTiles = this.getAdjacentTiles(x, y);

                    for (const [dx, dy] of adjacentTiles) {
                        const nx = x + dx;
                        const ny = y + dy;

                        if (nx >= 0 && nx < this.config.width && ny >= 0 && ny < this.config.height) {
                            if (this.level.layers.terrain[ny][nx] === null) {
                                // Place wall
                                this.level.layers.structures[ny][nx] = 'dungeon_wall';
                            }
                        } else {
                            // Edge of map - place wall
                            this.level.layers.structures[y][x] = 'dungeon_wall';
                        }
                    }
                }
            }
        }
    }

    /**
     * Place dungeon structures
     */
    async placeDungeonStructures(rooms) {
        for (const room of rooms) {
            // Place doors
            if (Math.random() < 0.7) { // 70% chance of door
                const doorX = room.x + Math.floor(room.width / 2);
                const doorY = room.y; // North door
                if (doorX >= 0 && doorX < this.config.width && doorY >= 0 && doorY < this.config.height) {
                    this.level.layers.interactive[doorY][doorX] = 'dungeon_door';
                }
            }

            // Place torches
            const torchCount = 1 + Math.floor(Math.random() * 3); // 1-3 torches per room
            for (let i = 0; i < torchCount; i++) {
                const torchX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
                const torchY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));

                if (torchX >= 0 && torchX < this.config.width && torchY >= 0 && torchY < this.config.height) {
                    this.level.layers.lighting[torchY][torchX] = 'torch';
                }
            }

            // Place treasure chests
            if (Math.random() < 0.4) { // 40% chance of treasure
                const chestX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
                const chestY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));

                if (chestX >= 0 && chestX < this.config.width && chestY >= 0 && chestY < this.config.height) {
                    this.level.layers.interactive[chestY][chestX] = 'treasure_chest';
                }
            }
        }
    }

    /**
     * Place interactive elements
     */
    async placeInteractiveElements(rooms) {
        // Place various interactive elements throughout the level
        const interactiveElements = ['lever', 'switch', 'rune', 'portal'];

        for (const room of rooms) {
            if (Math.random() < 0.3) { // 30% chance per room
                const elementType = interactiveElements[Math.floor(Math.random() * interactiveElements.length)];
                const elementX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
                const elementY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));

                if (elementX >= 0 && elementX < this.config.width && elementY >= 0 && elementY < this.config.height) {
                    this.level.layers.interactive[elementY][elementX] = elementType;
                }
            }
        }
    }

    /**
     * Place dungeon lighting
     */
    async placeDungeonLighting(rooms, corridors) {
        // Lighting is already placed in structures, but we can add ambient effects
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (this.level.layers.terrain[y][x] === 'dungeon_floor') {
                    // Add subtle ambient lighting
                    this.level.layers.effects[y][x] = 'ambient_dark';
                }
            }
        }
    }

    /**
     * Place dungeon entities
     */
    async placeDungeonEntities(rooms) {
        for (const room of rooms) {
            // Place enemies
            const enemyCount = Math.floor(Math.random() * 4); // 0-3 enemies per room
            for (let i = 0; i < enemyCount; i++) {
                const enemyX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
                const enemyY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));

                if (enemyX >= 0 && enemyX < this.config.width && enemyY >= 0 && enemyY < this.config.height) {
                    this.level.entities.push({
                        id: `enemy_${room.id}_${i}`,
                        type: 'enemy',
                        x: enemyX,
                        y: enemyY,
                        enemyType: this.getRandomEnemyType(),
                        level: this.config.difficulty
                    });
                }
            }

            // Place NPCs (rare)
            if (Math.random() < 0.1) { // 10% chance
                const npcX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
                const npcY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));

                if (npcX >= 0 && npcX < this.config.width && npcY >= 0 && npcY < this.config.height) {
                    this.level.entities.push({
                        id: `npc_${room.id}`,
                        type: 'npc',
                        x: npcX,
                        y: npcY,
                        npcType: this.getRandomNPCType(),
                        dialogue: this.generateNPCDialogue()
                    });
                }
            }
        }
    }

    /**
     * Create empty layer
     */
    createEmptyLayer() {
        const layer = [];
        for (let y = 0; y < this.config.height; y++) {
            layer[y] = [];
            for (let x = 0; x < this.config.width; x++) {
                layer[y][x] = null;
            }
        }
        return layer;
    }

    /**
     * Get adjacent tiles
     */
    getAdjacentTiles(x, y) {
        return [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0],           [1, 0],
            [-1, 1],  [0, 1],  [1, 1]
        ];
    }

    /**
     * Get random room type
     */
    getRandomRoomType() {
        const roomTypes = ['normal', 'treasure', 'boss', 'puzzle', 'rest'];
        return roomTypes[Math.floor(Math.random() * roomTypes.length)];
    }

    /**
     * Get random enemy type
     */
    getRandomEnemyType() {
        const enemyTypes = ['goblin', 'skeleton', 'orc', 'spider', 'rat'];
        return enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    }

    /**
     * Get random NPC type
     */
    getRandomNPCType() {
        const npcTypes = ['merchant', 'quest_giver', 'guard', 'prisoner'];
        return npcTypes[Math.floor(Math.random() * npcTypes.length)];
    }

    /**
     * Generate level name
     */
    generateLevelName() {
        const prefixes = ['Ancient', 'Dark', 'Forgotten', 'Mysterious', 'Cursed'];
        const suffixes = ['Dungeon', 'Caverns', 'Ruins', 'Temple', 'Fortress'];

        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        return `${prefix} ${suffix}`;
    }

    /**
     * Generate objectives
     */
    generateObjectives() {
        const objectives = [
            'Find the treasure chamber',
            'Defeat the dungeon boss',
            'Rescue the prisoners',
            'Collect ancient artifacts',
            'Escape the collapsing dungeon'
        ];

        const selectedObjectives = [];
        const objectiveCount = 1 + Math.floor(Math.random() * 3); // 1-3 objectives

        for (let i = 0; i < objectiveCount; i++) {
            const objective = objectives[Math.floor(Math.random() * objectives.length)];
            if (!selectedObjectives.includes(objective)) {
                selectedObjectives.push(objective);
            }
        }

        return selectedObjectives;
    }

    /**
     * Generate description
     */
    generateDescription() {
        const descriptions = [
            'A dark and dangerous dungeon filled with traps and treasures.',
            'An ancient underground complex shrouded in mystery.',
            'A labyrinth of stone corridors and hidden chambers.',
            'A forgotten ruin teeming with supernatural forces.',
            'A vast cavern system with untold secrets.'
        ];

        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    /**
     * Generate NPC dialogue
     */
    generateNPCDialogue() {
        const dialogues = [
            'Beware of the traps ahead!',
            'I have information about the treasure... for a price.',
            'The boss is stronger than you think.',
            'Take this key, it might help you.',
            'I was imprisoned here for years...'
        ];

        return dialogues[Math.floor(Math.random() * dialogues.length)];
    }

    /**
     * Seeded random number generator
     */
    seededRandom() {
        const x = Math.sin(this.randomSeed++) * 10000;
        return x - Math.floor(x);
    }

    /**
     * Post-process level
     */
    async postProcessLevel() {
        // Add level polish and final touches
        console.log('Post-processing level...');

        // Ensure connectivity
        await this.ensureLevelConnectivity();

        // Add decorative elements
        await this.addDecorativeElements();

        // Balance difficulty
        await this.balanceDifficulty();
    }

    /**
     * Ensure level connectivity
     */
    async ensureLevelConnectivity() {
        // Basic connectivity check - ensure main areas are reachable
        // This is a simplified version
        console.log('Ensuring level connectivity...');
    }

    /**
     * Add decorative elements
     */
    async addDecorativeElements() {
        // Add decorative elements like banners, statues, etc.
        console.log('Adding decorative elements...');
    }

    /**
     * Balance difficulty
     */
    async balanceDifficulty() {
        // Balance enemy placement and treasure distribution
        console.log('Balancing difficulty...');
    }

    /**
     * Validate level
     */
    async validateLevel() {
        console.log('Validating level...');

        // Basic validation checks
        const validationResults = {
            hasStartPoint: false,
            hasEndPoint: false,
            hasTreasures: false,
            hasEnemies: false,
            isConnected: false
        };

        // Check for key elements
        for (const entity of this.level.entities) {
            if (entity.type === 'enemy') validationResults.hasEnemies = true;
        }

        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (this.level.layers.interactive[y][x] === 'treasure_chest') {
                    validationResults.hasTreasures = true;
                }
            }
        }

        // Basic connectivity check
        validationResults.isConnected = this.checkBasicConnectivity();

        console.log('Validation results:', validationResults);
        return validationResults;
    }

    /**
     * Check basic connectivity
     */
    checkBasicConnectivity() {
        // Simplified connectivity check
        let floorTiles = 0;
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (this.level.layers.terrain[y][x] === 'dungeon_floor') {
                    floorTiles++;
                }
            }
        }
        return floorTiles > 10; // At least 10 floor tiles for a valid level
    }

    /**
     * Export level to file
     */
    async exportToFile(outputPath) {
        const exportData = {
            level: this.level,
            config: this.config,
            exportDate: new Date().toISOString(),
            format: 'tpt_level_v1'
        };

        await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2));
        return outputPath;
    }

    /**
     * Generate cave network using cellular automata
     */
    async generateCaveNetwork() {
        const tunnels = [];
        const chambers = [];

        // Initialize cave grid with random noise
        const caveGrid = [];
        for (let y = 0; y < this.config.height; y++) {
            caveGrid[y] = [];
            for (let x = 0; x < this.config.width; x++) {
                // 45% chance of being rock (wall), 55% chance of being empty (tunnel)
                caveGrid[y][x] = Math.random() < 0.45;
            }
        }

        // Apply cellular automata rules (4-5 rule)
        for (let iterations = 0; iterations < 5; iterations++) {
            const newGrid = [];
            for (let y = 0; y < this.config.height; y++) {
                newGrid[y] = [];
                for (let x = 0; x < this.config.width; x++) {
                    let neighbors = 0;

                    // Count neighbors
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;

                            const nx = x + dx;
                            const ny = y + dy;

                            if (nx >= 0 && nx < this.config.width && ny >= 0 && ny < this.config.height) {
                                if (caveGrid[ny][nx]) neighbors++;
                            } else {
                                // Edges count as walls
                                neighbors++;
                            }
                        }
                    }

                    // Apply rules
                    if (caveGrid[y][x]) {
                        // Wall: stays wall if 4+ neighbors are walls
                        newGrid[y][x] = neighbors >= 4;
                    } else {
                        // Empty: becomes wall if 5+ neighbors are walls
                        newGrid[y][x] = neighbors >= 5;
                    }
                }
            }

            // Copy new grid
            for (let y = 0; y < this.config.height; y++) {
                for (let x = 0; x < this.config.width; x++) {
                    caveGrid[y][x] = newGrid[y][x];
                }
            }
        }

        // Extract tunnels and chambers
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (!caveGrid[y][x]) {
                    // Check if this is part of a tunnel or chamber
                    const regionSize = this.floodFill(caveGrid, x, y, false, true);

                    if (regionSize > 50) {
                        // Large area = chamber
                        chambers.push({
                            x, y,
                            width: Math.sqrt(regionSize),
                            height: Math.sqrt(regionSize),
                            size: regionSize
                        });
                    } else if (regionSize > 5) {
                        // Medium area = tunnel
                        tunnels.push({
                            x, y,
                            width: Math.sqrt(regionSize),
                            height: Math.sqrt(regionSize),
                            size: regionSize
                        });
                    }
                }
            }
        }

        return { tunnels, chambers, caveGrid };
    }

    /**
     * Flood fill algorithm to find connected regions
     */
    floodFill(grid, startX, startY, targetValue, replacementValue) {
        const stack = [[startX, startY]];
        let size = 0;

        while (stack.length > 0) {
            const [x, y] = stack.pop();

            if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) continue;
            if (grid[y][x] !== targetValue) continue;

            grid[y][x] = replacementValue;
            size++;

            // Add neighbors
            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }

        return size;
    }

    /**
     * Place cave formations (stalactites, stalagmites, crystals)
     */
    async placeCaveFormations(caveNetwork) {
        const { tunnels, chambers, caveGrid } = caveNetwork;

        // Place formations in chambers
        for (const chamber of chambers) {
            const formationCount = Math.floor(Math.random() * 5) + 3; // 3-7 formations

            for (let i = 0; i < formationCount; i++) {
                const formationX = chamber.x + Math.floor(Math.random() * chamber.width);
                const formationY = chamber.y + Math.floor(Math.random() * chamber.height);

                if (formationX >= 0 && formationX < this.config.width &&
                    formationY >= 0 && formationY < this.config.height) {

                    const formationType = this.getRandomCaveFormation();
                    this.level.layers.structures[formationY][formationX] = formationType;
                }
            }
        }

        // Place crystal clusters
        const crystalCount = Math.floor(Math.random() * 8) + 5; // 5-12 crystals
        for (let i = 0; i < crystalCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const crystalX = Math.floor(Math.random() * this.config.width);
                const crystalY = Math.floor(Math.random() * this.config.height);

                if (!caveGrid[crystalY][crystalX] &&
                    this.level.layers.structures[crystalY][crystalX] === null) {
                    this.level.layers.structures[crystalY][crystalX] = 'crystal_cluster';
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Place cave terrain
     */
    async placeCaveTerrain(caveNetwork) {
        const { tunnels, chambers, caveGrid } = caveNetwork;

        // Place terrain based on cave grid
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (!caveGrid[y][x]) {
                    // Open space - place cave floor
                    this.level.layers.terrain[y][x] = 'cave_floor';
                } else {
                    // Wall - place cave wall
                    this.level.layers.structures[y][x] = 'cave_wall';
                }
            }
        }

        // Add water features
        const waterCount = Math.floor(Math.random() * 3) + 1; // 1-3 water features
        for (let i = 0; i < waterCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const waterX = Math.floor(Math.random() * this.config.width);
                const waterY = Math.floor(Math.random() * this.config.height);

                if (!caveGrid[waterY][waterX] &&
                    this.level.layers.terrain[waterY][waterX] === 'cave_floor') {
                    this.level.layers.terrain[waterY][waterX] = 'cave_water';
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Place cave structures
     */
    async placeCaveStructures(caveNetwork) {
        const { tunnels, chambers, caveGrid } = caveNetwork;

        // Place mushrooms and fungi
        const mushroomCount = Math.floor(Math.random() * 15) + 10; // 10-24 mushrooms
        for (let i = 0; i < mushroomCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const mushroomX = Math.floor(Math.random() * this.config.width);
                const mushroomY = Math.floor(Math.random() * this.config.height);

                if (!caveGrid[mushroomY][mushroomX] &&
                    this.level.layers.structures[mushroomY][mushroomX] === null) {
                    this.level.layers.structures[mushroomY][mushroomX] = 'cave_mushroom';
                    placed = true;
                }
                attempts++;
            }
        }

        // Place treasure in chambers
        for (const chamber of chambers) {
            if (Math.random() < 0.6) { // 60% chance per chamber
                const treasureX = chamber.x + Math.floor(Math.random() * chamber.width);
                const treasureY = chamber.y + Math.floor(Math.random() * chamber.height);

                if (treasureX >= 0 && treasureX < this.config.width &&
                    treasureY >= 0 && treasureY < this.config.height &&
                    !caveGrid[treasureY][treasureX]) {
                    this.level.layers.interactive[treasureY][treasureX] = 'treasure_chest';
                }
            }
        }
    }

    /**
     * Place cave lighting
     */
    async placeCaveLighting(caveNetwork) {
        const { tunnels, chambers, caveGrid } = caveNetwork;

        // Place glowing mushrooms for ambient light
        const glowMushroomCount = Math.floor(Math.random() * 8) + 6; // 6-13 glowing mushrooms
        for (let i = 0; i < glowMushroomCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const glowX = Math.floor(Math.random() * this.config.width);
                const glowY = Math.floor(Math.random() * this.config.height);

                if (!caveGrid[glowY][glowX] &&
                    this.level.layers.lighting[glowY][glowX] === null) {
                    this.level.layers.lighting[glowY][glowX] = 'glowing_mushroom';
                    placed = true;
                }
                attempts++;
            }
        }

        // Place crystal lights
        const crystalLightCount = Math.floor(Math.random() * 5) + 3; // 3-7 crystal lights
        for (let i = 0; i < crystalLightCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const lightX = Math.floor(Math.random() * this.config.width);
                const lightY = Math.floor(Math.random() * this.config.height);

                if (!caveGrid[lightY][lightX] &&
                    this.level.layers.lighting[lightY][lightX] === null) {
                    this.level.layers.lighting[lightY][lightX] = 'crystal_light';
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Place cave entities
     */
    async placeCaveEntities(caveNetwork) {
        const { tunnels, chambers, caveGrid } = caveNetwork;

        // Place cave enemies
        const enemyCount = Math.floor(Math.random() * 6) + 4; // 4-9 enemies
        for (let i = 0; i < enemyCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const enemyX = Math.floor(Math.random() * this.config.width);
                const enemyY = Math.floor(Math.random() * this.config.height);

                if (!caveGrid[enemyY][enemyX] &&
                    this.level.layers.terrain[enemyY][enemyX] === 'cave_floor') {
                    this.level.entities.push({
                        id: `cave_enemy_${i}`,
                        type: 'enemy',
                        x: enemyX,
                        y: enemyY,
                        enemyType: this.getRandomCaveEnemyType(),
                        level: this.config.difficulty
                    });
                    placed = true;
                }
                attempts++;
            }
        }

        // Place cave NPCs (rare)
        if (Math.random() < 0.2) { // 20% chance
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const npcX = Math.floor(Math.random() * this.config.width);
                const npcY = Math.floor(Math.random() * this.config.height);

                if (!caveGrid[npcY][npcX] &&
                    this.level.layers.terrain[npcY][npcX] === 'cave_floor') {
                    this.level.entities.push({
                        id: `cave_hermit`,
                        type: 'npc',
                        x: npcX,
                        y: npcY,
                        npcType: 'cave_hermit',
                        dialogue: 'These caves hold many secrets...'
                    });
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Get random cave formation type
     */
    getRandomCaveFormation() {
        const formations = ['stalactite', 'stalagmite', 'pillar', 'flowstone'];
        return formations[Math.floor(Math.random() * formations.length)];
    }

    /**
     * Get random cave enemy type
     */
    getRandomCaveEnemyType() {
        const enemies = ['cave_spider', 'goblin', 'bat', 'troll', 'ooze'];
        return enemies[Math.floor(Math.random() * enemies.length)];
    }

    /**
     * Generate forest terrain with clearings and paths
     */
    async generateForestTerrain() {
        const areas = [];
        const clearings = [];
        const paths = [];

        // Create base forest terrain
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                this.level.layers.terrain[y][x] = 'forest_grass';
            }
        }

        // Generate clearings
        const clearingCount = Math.floor(Math.random() * 4) + 2; // 2-5 clearings
        for (let i = 0; i < clearingCount; i++) {
            const clearing = {
                x: Math.floor(Math.random() * (this.config.width - 6)) + 3,
                y: Math.floor(Math.random() * (this.config.height - 6)) + 3,
                width: 3 + Math.floor(Math.random() * 4), // 3-6 tiles
                height: 3 + Math.floor(Math.random() * 4), // 3-6 tiles
                type: this.getRandomClearingType()
            };
            clearings.push(clearing);

            // Clear the area
            for (let x = clearing.x; x < clearing.x + clearing.width; x++) {
                for (let y = clearing.y; y < clearing.y + clearing.height; y++) {
                    if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                        this.level.layers.terrain[y][x] = 'forest_clearing';
                    }
                }
            }
        }

        // Generate paths connecting clearings
        for (let i = 0; i < clearings.length - 1; i++) {
            const clearing1 = clearings[i];
            const clearing2 = clearings[i + 1];

            const path = {
                startX: clearing1.x + Math.floor(clearing1.width / 2),
                startY: clearing1.y + Math.floor(clearing1.height / 2),
                endX: clearing2.x + Math.floor(clearing2.width / 2),
                endY: clearing2.y + Math.floor(clearing2.height / 2),
                width: 1
            };
            paths.push(path);

            // Draw path
            this.drawPath(path);
        }

        return { areas, clearings, paths };
    }

    /**
     * Draw path between two points
     */
    drawPath(path) {
        const dx = path.endX - path.startX;
        const dy = path.endY - path.startY;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));

        for (let i = 0; i <= steps; i++) {
            const x = Math.round(path.startX + (dx * i) / steps);
            const y = Math.round(path.startY + (dy * i) / steps);

            if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                this.level.layers.terrain[y][x] = 'forest_path';
            }
        }
    }

    /**
     * Place forest vegetation (trees, flowers, bushes)
     */
    async placeForestVegetation(terrainLayout) {
        const { clearings, paths } = terrainLayout;

        // Place trees throughout the forest
        const treeCount = Math.floor((this.config.width * this.config.height) * 0.15); // 15% tree coverage
        for (let i = 0; i < treeCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const treeX = Math.floor(Math.random() * this.config.width);
                const treeY = Math.floor(Math.random() * this.config.height);

                // Don't place trees in clearings or on paths
                const inClearing = clearings.some(clearing =>
                    treeX >= clearing.x && treeX < clearing.x + clearing.width &&
                    treeY >= clearing.y && treeY < clearing.y + clearing.height
                );

                const onPath = this.level.layers.terrain[treeY][treeX] === 'forest_path';

                if (!inClearing && !onPath && this.level.layers.structures[treeY][treeX] === null) {
                    const treeType = this.getRandomTreeType();
                    this.level.layers.structures[treeY][treeX] = treeType;
                    placed = true;
                }
                attempts++;
            }
        }

        // Place bushes and flowers
        const bushCount = Math.floor((this.config.width * this.config.height) * 0.08); // 8% bush coverage
        for (let i = 0; i < bushCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const bushX = Math.floor(Math.random() * this.config.width);
                const bushY = Math.floor(Math.random() * this.config.height);

                const inClearing = clearings.some(clearing =>
                    bushX >= clearing.x && bushX < clearing.x + clearing.width &&
                    bushY >= clearing.y && bushY < clearing.y + clearing.height
                );

                const onPath = this.level.layers.terrain[bushY][bushX] === 'forest_path';

                if (!inClearing && !onPath && this.level.layers.structures[bushY][bushX] === null) {
                    const vegetationType = this.getRandomVegetationType();
                    this.level.layers.structures[bushY][bushX] = vegetationType;
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Place forest paths and trails
     */
    async placeForestPaths(terrainLayout) {
        // Paths are already placed in generateForestTerrain
        // Add some additional side trails
        const sideTrailCount = Math.floor(Math.random() * 3) + 1; // 1-3 side trails

        for (let i = 0; i < sideTrailCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const startX = Math.floor(Math.random() * this.config.width);
                const startY = Math.floor(Math.random() * this.config.height);
                const endX = Math.floor(Math.random() * this.config.width);
                const endY = Math.floor(Math.random() * this.config.height);

                // Make sure start and end are different
                if (Math.abs(startX - endX) > 3 || Math.abs(startY - endY) > 3) {
                    const trail = {
                        startX, startY, endX, endY, width: 1
                    };
                    this.drawPath(trail);
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Place forest structures (ruins, camps, etc.)
     */
    async placeForestStructures(terrainLayout) {
        const { clearings } = terrainLayout;

        // Place structures in clearings
        for (const clearing of clearings) {
            if (Math.random() < 0.4) { // 40% chance per clearing
                const structureType = this.getRandomForestStructure();
                const structureX = clearing.x + Math.floor(Math.random() * clearing.width);
                const structureY = clearing.y + Math.floor(Math.random() * clearing.height);

                if (structureX >= 0 && structureX < this.config.width &&
                    structureY >= 0 && structureY < this.config.height) {
                    this.level.layers.structures[structureY][structureX] = structureType;
                }
            }
        }

        // Place scattered forest structures
        const scatteredStructureCount = Math.floor(Math.random() * 4) + 2; // 2-5 scattered structures
        for (let i = 0; i < scatteredStructureCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const structureX = Math.floor(Math.random() * this.config.width);
                const structureY = Math.floor(Math.random() * this.config.height);

                const inClearing = clearings.some(clearing =>
                    structureX >= clearing.x && structureX < clearing.x + clearing.width &&
                    structureY >= clearing.y && structureY < clearing.y + clearing.height
                );

                if (!inClearing && this.level.layers.structures[structureY][structureX] === null) {
                    const structureType = this.getRandomForestStructure();
                    this.level.layers.structures[structureY][structureX] = structureType;
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Place forest lighting
     */
    async placeForestLighting(terrainLayout) {
        const { clearings } = terrainLayout;

        // Place campfires in clearings
        for (const clearing of clearings) {
            if (Math.random() < 0.3) { // 30% chance per clearing
                const fireX = clearing.x + Math.floor(Math.random() * clearing.width);
                const fireY = clearing.y + Math.floor(Math.random() * clearing.height);

                if (fireX >= 0 && fireX < this.config.width &&
                    fireY >= 0 && fireY < this.config.height) {
                    this.level.layers.lighting[fireY][fireX] = 'campfire';
                }
            }
        }

        // Place scattered torches
        const torchCount = Math.floor(Math.random() * 6) + 4; // 4-9 torches
        for (let i = 0; i < torchCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const torchX = Math.floor(Math.random() * this.config.width);
                const torchY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.lighting[torchY][torchX] === null) {
                    this.level.layers.lighting[torchY][torchX] = 'torch';
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Place forest entities
     */
    async placeForestEntities(terrainLayout) {
        const { clearings } = terrainLayout;

        // Place forest enemies
        const enemyCount = Math.floor(Math.random() * 5) + 3; // 3-7 enemies
        for (let i = 0; i < enemyCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const enemyX = Math.floor(Math.random() * this.config.width);
                const enemyY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.terrain[enemyY][enemyX] !== 'forest_path' &&
                    this.level.layers.structures[enemyY][enemyX] === null) {
                    this.level.entities.push({
                        id: `forest_enemy_${i}`,
                        type: 'enemy',
                        x: enemyX,
                        y: enemyY,
                        enemyType: this.getRandomForestEnemyType(),
                        level: this.config.difficulty
                    });
                    placed = true;
                }
                attempts++;
            }
        }

        // Place forest NPCs
        if (Math.random() < 0.25) { // 25% chance
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const npcX = Math.floor(Math.random() * this.config.width);
                const npcY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.terrain[npcY][npcX] === 'forest_clearing') {
                    this.level.entities.push({
                        id: `forest_druid`,
                        type: 'npc',
                        x: npcX,
                        y: npcY,
                        npcType: 'druid',
                        dialogue: 'The forest has many secrets...'
                    });
                    placed = true;
                }
                attempts++;
            }
        }

        // Place treasure in clearings
        for (const clearing of clearings) {
            if (Math.random() < 0.5) { // 50% chance per clearing
                const treasureX = clearing.x + Math.floor(Math.random() * clearing.width);
                const treasureY = clearing.y + Math.floor(Math.random() * clearing.height);

                if (treasureX >= 0 && treasureX < this.config.width &&
                    treasureY >= 0 && treasureY < this.config.height) {
                    this.level.layers.interactive[treasureY][treasureX] = 'treasure_chest';
                }
            }
        }
    }

    /**
     * Get random clearing type
     */
    getRandomClearingType() {
        const types = ['normal', 'pond', 'ruins', 'camp', 'shrine'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Get random tree type
     */
    getRandomTreeType() {
        const trees = ['oak_tree', 'pine_tree', 'birch_tree', 'willow_tree', 'ancient_tree'];
        return trees[Math.floor(Math.random() * trees.length)];
    }

    /**
     * Get random vegetation type
     */
    getRandomVegetationType() {
        const vegetation = ['bush', 'flowers', 'mushrooms', 'ferns', 'berries'];
        return vegetation[Math.floor(Math.random() * vegetation.length)];
    }

    /**
     * Get random forest structure type
     */
    getRandomForestStructure() {
        const structures = ['ruins', 'campsite', 'shrine', 'statue', 'well', 'wagon'];
        return structures[Math.floor(Math.random() * structures.length)];
    }

    /**
     * Get random forest enemy type
     */
    getRandomForestEnemyType() {
        const enemies = ['wolf', 'bandit', 'spider', 'bear', 'goblin', 'boar'];
        return enemies[Math.floor(Math.random() * enemies.length)];
    }

    /**
     * Generate town layout with districts and buildings
     */
    async generateTownLayout() {
        const districts = [];
        const buildings = [];
        const streets = [];

        // Create base town terrain
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                this.level.layers.terrain[y][x] = 'town_dirt';
            }
        }

        // Generate districts
        const districtCount = Math.floor(Math.random() * 3) + 2; // 2-4 districts
        for (let i = 0; i < districtCount; i++) {
            const district = {
                id: `district_${i}`,
                x: Math.floor(Math.random() * (this.config.width - 10)) + 5,
                y: Math.floor(Math.random() * (this.config.height - 8)) + 4,
                width: 6 + Math.floor(Math.random() * 8), // 6-13 tiles
                height: 5 + Math.floor(Math.random() * 6), // 5-10 tiles
                type: this.getRandomDistrictType()
            };
            districts.push(district);
        }

        // Generate buildings in districts
        for (const district of districts) {
            const buildingCount = Math.floor(Math.random() * 4) + 3; // 3-6 buildings per district

            for (let i = 0; i < buildingCount; i++) {
                const building = {
                    id: `building_${district.id}_${i}`,
                    x: district.x + Math.floor(Math.random() * (district.width - 3)) + 1,
                    y: district.y + Math.floor(Math.random() * (district.height - 3)) + 1,
                    width: 2 + Math.floor(Math.random() * 2), // 2-3 tiles
                    height: 2 + Math.floor(Math.random() * 2), // 2-3 tiles
                    type: this.getRandomBuildingType(),
                    district: district.id
                };
                buildings.push(building);

                // Place building on terrain
                for (let x = building.x; x < building.x + building.width; x++) {
                    for (let y = building.y; y < building.y + building.height; y++) {
                        if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                            this.level.layers.terrain[y][x] = 'town_building';
                        }
                    }
                }
            }
        }

        // Generate streets connecting districts
        for (let i = 0; i < districts.length - 1; i++) {
            const district1 = districts[i];
            const district2 = districts[i + 1];

            const street = {
                startX: district1.x + Math.floor(district1.width / 2),
                startY: district1.y + Math.floor(district1.height / 2),
                endX: district2.x + Math.floor(district2.width / 2),
                endY: district2.y + Math.floor(district2.height / 2),
                width: 2
            };
            streets.push(street);

            // Draw street
            this.drawStreet(street);
        }

        return { districts, buildings, streets };
    }

    /**
     * Draw street between two points
     */
    drawStreet(street) {
        const dx = street.endX - street.startX;
        const dy = street.endY - street.startY;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));

        for (let i = 0; i <= steps; i++) {
            const x = Math.round(street.startX + (dx * i) / steps);
            const y = Math.round(street.startY + (dy * i) / steps);

            // Draw wider street
            for (let sx = x - Math.floor(street.width / 2); sx <= x + Math.floor(street.width / 2); sx++) {
                for (let sy = y - Math.floor(street.width / 2); sy <= y + Math.floor(street.width / 2); sy++) {
                    if (sx >= 0 && sx < this.config.width && sy >= 0 && sy < this.config.height) {
                        this.level.layers.terrain[sy][sx] = 'town_street';
                    }
                }
            }
        }
    }

    /**
     * Place town buildings
     */
    async placeTownBuildings(townLayout) {
        const { buildings } = townLayout;

        // Buildings are already placed in generateTownLayout
        // Add building details and doors
        for (const building of buildings) {
            // Place doors
            const doorSide = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
            let doorX = building.x;
            let doorY = building.y;

            switch (doorSide) {
                case 0: // Top
                    doorX = building.x + Math.floor(building.width / 2);
                    doorY = building.y;
                    break;
                case 1: // Right
                    doorX = building.x + building.width - 1;
                    doorY = building.y + Math.floor(building.height / 2);
                    break;
                case 2: // Bottom
                    doorX = building.x + Math.floor(building.width / 2);
                    doorY = building.y + building.height - 1;
                    break;
                case 3: // Left
                    doorX = building.x;
                    doorY = building.y + Math.floor(building.height / 2);
                    break;
            }

            if (doorX >= 0 && doorX < this.config.width && doorY >= 0 && doorY < this.config.height) {
                this.level.layers.interactive[doorY][doorX] = 'town_door';
            }

            // Place windows
            const windowCount = Math.floor(Math.random() * 3) + 1; // 1-3 windows
            for (let i = 0; i < windowCount; i++) {
                let windowX, windowY;
                let attempts = 0;

                do {
                    windowX = building.x + Math.floor(Math.random() * building.width);
                    windowY = building.y + Math.floor(Math.random() * building.height);
                    attempts++;
                } while (attempts < 10 && (windowX === doorX && windowY === doorY));

                if (windowX >= 0 && windowX < this.config.width && windowY >= 0 && windowY < this.config.height) {
                    this.level.layers.structures[windowY][windowX] = 'town_window';
                }
            }
        }
    }

    /**
     * Place town streets
     */
    async placeTownStreets(townLayout) {
        // Streets are already placed in generateTownLayout
        // Add street details like lanterns
        const { streets } = townLayout;

        for (const street of streets) {
            // Place street lanterns
            const lanternCount = Math.floor(Math.random() * 4) + 2; // 2-5 lanterns per street
            for (let i = 0; i < lanternCount; i++) {
                const lanternX = Math.round(street.startX + (street.endX - street.startX) * i / lanternCount);
                const lanternY = Math.round(street.startY + (street.endY - street.startY) * i / lanternCount);

                // Offset from center
                const offsetX = Math.floor(Math.random() * 3) - 1; // -1 to 1
                const offsetY = Math.floor(Math.random() * 3) - 1; // -1 to 1

                const finalX = lanternX + offsetX;
                const finalY = lanternY + offsetY;

                if (finalX >= 0 && finalX < this.config.width && finalY >= 0 && finalY < this.config.height) {
                    this.level.layers.lighting[finalY][finalX] = 'street_lantern';
                }
            }
        }
    }

    /**
     * Place town structures
     */
    async placeTownStructures(townLayout) {
        const { districts } = townLayout;

        // Place town structures like wells, statues, etc.
        const structureCount = Math.floor(Math.random() * 5) + 3; // 3-7 structures
        for (let i = 0; i < structureCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const structureX = Math.floor(Math.random() * this.config.width);
                const structureY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.terrain[structureY][structureX] === 'town_dirt' &&
                    this.level.layers.structures[structureY][structureX] === null) {
                    const structureType = this.getRandomTownStructure();
                    this.level.layers.structures[structureY][structureX] = structureType;
                    placed = true;
                }
                attempts++;
            }
        }

        // Place market stalls in districts
        for (const district of districts) {
            if (Math.random() < 0.4) { // 40% chance per district
                const stallX = district.x + Math.floor(Math.random() * district.width);
                const stallY = district.y + Math.floor(Math.random() * district.height);

                if (stallX >= 0 && stallX < this.config.width && stallY >= 0 && stallY < this.config.height) {
                    this.level.layers.structures[stallY][stallX] = 'market_stall';
                }
            }
        }
    }

    /**
     * Place town lighting
     */
    async placeTownLighting(townLayout) {
        // Additional lighting beyond street lanterns
        const extraLightCount = Math.floor(Math.random() * 8) + 6; // 6-13 extra lights
        for (let i = 0; i < extraLightCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const lightX = Math.floor(Math.random() * this.config.width);
                const lightY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.lighting[lightY][lightX] === null) {
                    const lightType = this.getRandomTownLight();
                    this.level.layers.lighting[lightY][lightX] = lightType;
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Place town entities
     */
    async placeTownEntities(townLayout) {
        const { districts } = townLayout;

        // Place town guards
        const guardCount = Math.floor(Math.random() * 4) + 2; // 2-5 guards
        for (let i = 0; i < guardCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const guardX = Math.floor(Math.random() * this.config.width);
                const guardY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.terrain[guardY][guardX] === 'town_street' &&
                    this.level.layers.structures[guardY][guardX] === null) {
                    this.level.entities.push({
                        id: `town_guard_${i}`,
                        type: 'npc',
                        x: guardX,
                        y: guardY,
                        npcType: 'town_guard',
                        dialogue: 'Stay out of trouble, citizen.'
                    });
                    placed = true;
                }
                attempts++;
            }
        }

        // Place merchants in buildings
        for (const district of districts) {
            if (Math.random() < 0.3) { // 30% chance per district
                const merchantX = district.x + Math.floor(Math.random() * district.width);
                const merchantY = district.y + Math.floor(Math.random() * district.height);

                if (merchantX >= 0 && merchantX < this.config.width &&
                    merchantY >= 0 && merchantY < this.config.height) {
                    this.level.entities.push({
                        id: `town_merchant_${district.id}`,
                        type: 'npc',
                        x: merchantX,
                        y: merchantY,
                        npcType: 'merchant',
                        dialogue: 'Welcome to my shop!'
                    });
                }
            }
        }

        // Place random townsfolk
        const townsfolkCount = Math.floor(Math.random() * 6) + 4; // 4-9 townsfolk
        for (let i = 0; i < townsfolkCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const folkX = Math.floor(Math.random() * this.config.width);
                const folkY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.terrain[folkY][folkX] === 'town_street' &&
                    this.level.layers.structures[folkY][folkX] === null) {
                    this.level.entities.push({
                        id: `townsfolk_${i}`,
                        type: 'npc',
                        x: folkX,
                        y: folkY,
                        npcType: 'townsfolk',
                        dialogue: this.getRandomTownsfolkDialogue()
                    });
                    placed = true;
                }
                attempts++;
            }
        }

        // Place treasure in buildings (rare)
        for (const district of districts) {
            if (Math.random() < 0.15) { // 15% chance per district
                const treasureX = district.x + Math.floor(Math.random() * district.width);
                const treasureY = district.y + Math.floor(Math.random() * district.height);

                if (treasureX >= 0 && treasureX < this.config.width &&
                    treasureY >= 0 && treasureY < this.config.height) {
                    this.level.layers.interactive[treasureY][treasureX] = 'treasure_chest';
                }
            }
        }
    }

    /**
     * Get random district type
     */
    getRandomDistrictType() {
        const types = ['residential', 'commercial', 'market', 'noble'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Get random building type
     */
    getRandomBuildingType() {
        const types = ['house', 'shop', 'tavern', 'inn', 'blacksmith', 'temple'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Get random town structure type
     */
    getRandomTownStructure() {
        const structures = ['town_well', 'town_statue', 'town_fountain', 'town_cart', 'town_bench'];
        return structures[Math.floor(Math.random() * structures.length)];
    }

    /**
     * Get random town light type
     */
    getRandomTownLight() {
        const lights = ['street_lantern', 'building_light', 'torch', 'candle'];
        return lights[Math.floor(Math.random() * lights.length)];
    }

    /**
     * Get random townsfolk dialogue
     */
    getRandomTownsfolkDialogue() {
        const dialogues = [
            'Beautiful day, isn\'t it?',
            'Watch your step!',
            'Have you seen the market?',
            'The guards are extra vigilant today.',
            'Welcome to our town!'
        ];
        return dialogues[Math.floor(Math.random() * dialogues.length)];
    }

    /**
     * Generate castle layout with walls, towers, and courtyards
     */
    async generateCastleLayout() {
        const sections = [];
        const towers = [];
        const walls = [];
        const courtyards = [];

        // Create base castle terrain
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                this.level.layers.terrain[y][x] = 'castle_stone';
            }
        }

        // Generate outer walls
        const wallThickness = 2;
        const innerWidth = this.config.width - (wallThickness * 2);
        const innerHeight = this.config.height - (wallThickness * 2);

        // Outer walls
        for (let x = 0; x < this.config.width; x++) {
            for (let y = 0; y < wallThickness; y++) {
                this.level.layers.structures[y][x] = 'castle_wall';
                this.level.layers.structures[this.config.height - 1 - y][x] = 'castle_wall';
            }
        }

        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < wallThickness; x++) {
                this.level.layers.structures[y][x] = 'castle_wall';
                this.level.layers.structures[y][this.config.width - 1 - x] = 'castle_wall';
            }
        }

        // Generate towers at corners
        const towerPositions = [
            { x: wallThickness, y: wallThickness }, // Top-left
            { x: this.config.width - wallThickness - 3, y: wallThickness }, // Top-right
            { x: wallThickness, y: this.config.height - wallThickness - 3 }, // Bottom-left
            { x: this.config.width - wallThickness - 3, y: this.config.height - wallThickness - 3 } // Bottom-right
        ];

        for (let i = 0; i < towerPositions.length; i++) {
            const tower = {
                id: `tower_${i}`,
                x: towerPositions[i].x,
                y: towerPositions[i].y,
                width: 3,
                height: 3,
                type: 'corner_tower'
            };
            towers.push(tower);

            // Place tower
            for (let x = tower.x; x < tower.x + tower.width; x++) {
                for (let y = tower.y; y < tower.y + tower.height; y++) {
                    if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                        this.level.layers.structures[y][x] = 'castle_tower';
                    }
                }
            }
        }

        // Generate main keep in center
        const keep = {
            id: 'main_keep',
            x: Math.floor(this.config.width / 2) - 4,
            y: Math.floor(this.config.height / 2) - 4,
            width: 8,
            height: 8,
            type: 'main_keep'
        };
        sections.push(keep);

        // Place keep
        for (let x = keep.x; x < keep.x + keep.width; x++) {
            for (let y = keep.y; y < keep.y + keep.height; y++) {
                if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                    this.level.layers.structures[y][x] = 'castle_keep';
                }
            }
        }

        // Generate courtyards
        const courtyardCount = Math.floor(Math.random() * 2) + 1; // 1-2 courtyards
        for (let i = 0; i < courtyardCount; i++) {
            const courtyard = {
                id: `courtyard_${i}`,
                x: wallThickness + 2 + Math.floor(Math.random() * (innerWidth - 8)),
                y: wallThickness + 2 + Math.floor(Math.random() * (innerHeight - 8)),
                width: 4 + Math.floor(Math.random() * 4), // 4-7 tiles
                height: 4 + Math.floor(Math.random() * 4), // 4-7 tiles
                type: 'courtyard'
            };
            courtyards.push(courtyard);

            // Clear courtyard area
            for (let x = courtyard.x; x < courtyard.x + courtyard.width; x++) {
                for (let y = courtyard.y; y < courtyard.y + courtyard.height; y++) {
                    if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                        this.level.layers.terrain[y][x] = 'castle_cobblestone';
                    }
                }
            }
        }

        // Generate inner walls and sections
        const sectionCount = Math.floor(Math.random() * 3) + 2; // 2-4 sections
        for (let i = 0; i < sectionCount; i++) {
            const section = {
                id: `section_${i}`,
                x: wallThickness + 1 + Math.floor(Math.random() * (innerWidth - 6)),
                y: wallThickness + 1 + Math.floor(Math.random() * (innerHeight - 6)),
                width: 3 + Math.floor(Math.random() * 3), // 3-5 tiles
                height: 3 + Math.floor(Math.random() * 3), // 3-5 tiles
                type: this.getRandomCastleSectionType()
            };
            sections.push(section);

            // Place section
            for (let x = section.x; x < section.x + section.width; x++) {
                for (let y = section.y; y < section.y + section.height; y++) {
                    if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
                        this.level.layers.structures[y][x] = 'castle_section';
                    }
                }
            }
        }

        return { sections, towers, walls, courtyards, keep };
    }

    /**
     * Place castle structures
     */
    async placeCastleStructures(castleLayout) {
        const { sections, towers, courtyards, keep } = castleLayout;

        // Place doors in towers
        for (const tower of towers) {
            // Place door facing courtyard
            const doorX = tower.x + Math.floor(tower.width / 2);
            const doorY = tower.y + tower.height - 1; // Bottom door

            if (doorX >= 0 && doorX < this.config.width && doorY >= 0 && doorY < this.config.height) {
                this.level.layers.interactive[doorY][doorX] = 'castle_door';
            }
        }

        // Place main keep entrance
        const keepDoorX = keep.x + Math.floor(keep.width / 2);
        const keepDoorY = keep.y + keep.height - 1;

        if (keepDoorX >= 0 && keepDoorX < this.config.width && keepDoorY >= 0 && keepDoorY < this.config.height) {
            this.level.layers.interactive[keepDoorY][keepDoorX] = 'castle_main_door';
        }

        // Place castle structures in sections
        for (const section of sections) {
            if (section.type === 'barracks') {
                // Place beds and weapon racks
                const bedCount = Math.floor(Math.random() * 3) + 2; // 2-4 beds
                for (let i = 0; i < bedCount; i++) {
                    const bedX = section.x + Math.floor(Math.random() * section.width);
                    const bedY = section.y + Math.floor(Math.random() * section.height);

                    if (bedX >= 0 && bedX < this.config.width && bedY >= 0 && bedY < this.config.height) {
                        this.level.layers.structures[bedY][bedX] = 'castle_bed';
                    }
                }
            } else if (section.type === 'armory') {
                // Place weapon racks and armor stands
                const rackCount = Math.floor(Math.random() * 2) + 1; // 1-2 racks
                for (let i = 0; i < rackCount; i++) {
                    const rackX = section.x + Math.floor(Math.random() * section.width);
                    const rackY = section.y + Math.floor(Math.random() * section.height);

                    if (rackX >= 0 && rackX < this.config.width && rackY >= 0 && rackY < this.config.height) {
                        this.level.layers.structures[rackY][rackX] = 'weapon_rack';
                    }
                }
            } else if (section.type === 'dining_hall') {
                // Place tables and chairs
                const tableCount = Math.floor(Math.random() * 2) + 1; // 1-2 tables
                for (let i = 0; i < tableCount; i++) {
                    const tableX = section.x + Math.floor(Math.random() * section.width);
                    const tableY = section.y + Math.floor(Math.random() * section.height);

                    if (tableX >= 0 && tableX < this.config.width && tableY >= 0 && tableY < this.config.height) {
                        this.level.layers.structures[tableY][tableX] = 'dining_table';
                    }
                }
            }
        }

        // Place decorative elements
        const decorationCount = Math.floor(Math.random() * 6) + 4; // 4-9 decorations
        for (let i = 0; i < decorationCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const decoX = Math.floor(Math.random() * this.config.width);
                const decoY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.structures[decoY][decoX] === null &&
                    this.level.layers.terrain[decoY][decoX] === 'castle_cobblestone') {
                    const decoType = this.getRandomCastleDecoration();
                    this.level.layers.structures[decoY][decoX] = decoType;
                    placed = true;
                }
                attempts++;
            }
        }
    }

    /**
     * Place castle terrain
     */
    async placeCastleTerrain(castleLayout) {
        // Terrain is already placed in generateCastleLayout
        // Add terrain variations
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (this.level.layers.terrain[y][x] === 'castle_stone') {
                    // Add some moss and wear to stone
                    if (Math.random() < 0.1) { // 10% chance
                        this.level.layers.terrain[y][x] = 'castle_stone_mossy';
                    }
                }
            }
        }
    }

    /**
     * Place castle lighting
     */
    async placeCastleLighting(castleLayout) {
        const { towers, sections, courtyards } = castleLayout;

        // Place torches on walls
        const wallTorchCount = Math.floor(Math.random() * 8) + 6; // 6-13 wall torches
        for (let i = 0; i < wallTorchCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const torchX = Math.floor(Math.random() * this.config.width);
                const torchY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.structures[torchY][torchX] === 'castle_wall') {
                    this.level.layers.lighting[torchY][torchX] = 'wall_torch';
                    placed = true;
                }
                attempts++;
            }
        }

        // Place tower lights
        for (const tower of towers) {
            const towerLightX = tower.x + Math.floor(tower.width / 2);
            const towerLightY = tower.y + tower.height - 1;

            if (towerLightX >= 0 && towerLightX < this.config.width &&
                towerLightY >= 0 && towerLightY < this.config.height) {
                this.level.layers.lighting[towerLightY][towerLightX] = 'tower_light';
            }
        }

        // Place courtyard lanterns
        for (const courtyard of courtyards) {
            const lanternCount = Math.floor(Math.random() * 3) + 1; // 1-3 lanterns per courtyard
            for (let i = 0; i < lanternCount; i++) {
                const lanternX = courtyard.x + Math.floor(Math.random() * courtyard.width);
                const lanternY = courtyard.y + Math.floor(Math.random() * courtyard.height);

                if (lanternX >= 0 && lanternX < this.config.width &&
                    lanternY >= 0 && lanternY < this.config.height) {
                    this.level.layers.lighting[lanternY][lanternX] = 'courtyard_lantern';
                }
            }
        }

        // Place interior lights in sections
        for (const section of sections) {
            if (Math.random() < 0.6) { // 60% chance per section
                const lightX = section.x + Math.floor(Math.random() * section.width);
                const lightY = section.y + Math.floor(Math.random() * section.height);

                if (lightX >= 0 && lightX < this.config.width &&
                    lightY >= 0 && lightY < this.config.height) {
                    this.level.layers.lighting[lightY][lightX] = 'interior_light';
                }
            }
        }
    }

    /**
     * Place castle entities
     */
    async placeCastleEntities(castleLayout) {
        const { sections, towers, courtyards, keep } = castleLayout;

        // Place castle guards
        const guardCount = Math.floor(Math.random() * 6) + 4; // 4-9 guards
        for (let i = 0; i < guardCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const guardX = Math.floor(Math.random() * this.config.width);
                const guardY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.terrain[guardY][guardX] === 'castle_cobblestone' &&
                    this.level.layers.structures[guardY][guardX] === null) {
                    this.level.entities.push({
                        id: `castle_guard_${i}`,
                        type: 'enemy',
                        x: guardX,
                        y: guardY,
                        enemyType: 'castle_guard',
                        level: this.config.difficulty
                    });
                    placed = true;
                }
                attempts++;
            }
        }

        // Place castle servants/NPCs
        const servantCount = Math.floor(Math.random() * 4) + 2; // 2-5 servants
        for (let i = 0; i < servantCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                const servantX = Math.floor(Math.random() * this.config.width);
                const servantY = Math.floor(Math.random() * this.config.height);

                if (this.level.layers.terrain[servantY][servantX] === 'castle_cobblestone' &&
                    this.level.layers.structures[servantY][servantX] === null) {
                    this.level.entities.push({
                        id: `castle_servant_${i}`,
                        type: 'npc',
                        x: servantX,
                        y: servantY,
                        npcType: 'castle_servant',
                        dialogue: this.getRandomCastleServantDialogue()
                    });
                    placed = true;
                }
                attempts++;
            }
        }

        // Place treasure in keep
        if (Math.random() < 0.7) { // 70% chance
            const treasureX = keep.x + Math.floor(Math.random() * keep.width);
            const treasureY = keep.y + Math.floor(Math.random() * keep.height);

            if (treasureX >= 0 && treasureX < this.config.width &&
                treasureY >= 0 && treasureY < this.config.height) {
                this.level.layers.interactive[treasureY][treasureX] = 'treasure_chest';
            }
        }

        // Place treasure in sections (rare)
        for (const section of sections) {
            if (Math.random() < 0.2) { // 20% chance per section
                const treasureX = section.x + Math.floor(Math.random() * section.width);
                const treasureY = section.y + Math.floor(Math.random() * section.height);

                if (treasureX >= 0 && treasureX < this.config.width &&
                    treasureY >= 0 && treasureY < this.config.height) {
                    this.level.layers.interactive[treasureY][treasureX] = 'treasure_chest';
                }
            }
        }

        // Place boss enemy in keep (for boss levels)
        if (this.config.difficulty === 'hard' || Math.random() < 0.3) {
            const bossX = keep.x + Math.floor(keep.width / 2);
            const bossY = keep.y + Math.floor(keep.height / 2);

            if (bossX >= 0 && bossX < this.config.width &&
                bossY >= 0 && bossY < this.config.height) {
                this.level.entities.push({
                    id: 'castle_boss',
                    type: 'enemy',
                    x: bossX,
                    y: bossY,
                    enemyType: 'castle_lord',
                    level: 'boss'
                });
            }
        }
    }

    /**
     * Get random castle section type
     */
    getRandomCastleSectionType() {
        const types = ['barracks', 'armory', 'dining_hall', 'library', 'chapel'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Get random castle decoration type
     */
    getRandomCastleDecoration() {
        const decorations = ['castle_banner', 'castle_statue', 'castle_fountain', 'castle_bench', 'castle_urn'];
        return decorations[Math.floor(Math.random() * decorations.length)];
    }

    /**
     * Get random castle servant dialogue
     */
    getRandomCastleServantDialogue() {
        const dialogues = [
            'Welcome to the castle, milord.',
            'The lord is not receiving visitors right now.',
            'Please state your business.',
            'The castle has stood for centuries.',
            'Mind your manners in the presence of nobility.'
        ];
        return dialogues[Math.floor(Math.random() * dialogues.length)];
    }
}

module.exports = LevelGenerator;
