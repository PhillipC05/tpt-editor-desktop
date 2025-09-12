/**
 * Level Layout Composer
 * Handles tile-based level layout generation with rooms and corridors
 */

const { v4: uuidv4 } = require('uuid');

class LevelLayoutComposer {
    constructor() {
        this.tileSize = 32; // Standard tile size
    }

    /**
     * Generate level layout based on configuration
     */
    async generate(config) {
        const { width, height } = config.dimensions;

        // Initialize empty layout
        const layout = {
            ground: this.createEmptyLayer(width, height),
            walls: this.createEmptyLayer(width, height),
            decorations: this.createEmptyLayer(width, height),
            metadata: {
                width,
                height,
                tileSize: this.tileSize
            }
        };

        // Generate layout based on level type
        switch (config.levelType) {
            case 'dungeon':
                await this.generateDungeonLayout(layout, config);
                break;
            case 'cave':
                await this.generateCaveLayout(layout, config);
                break;
            case 'forest':
                await this.generateForestLayout(layout, config);
                break;
            case 'town':
                await this.generateTownLayout(layout, config);
                break;
            case 'castle':
                await this.generateCastleLayout(layout, config);
                break;
            case 'ruins':
                await this.generateRuinsLayout(layout, config);
                break;
            case 'mountain':
                await this.generateMountainLayout(layout, config);
                break;
            case 'swamp':
                await this.generateSwampLayout(layout, config);
                break;
            default:
                await this.generateDungeonLayout(layout, config);
        }

        return layout;
    }

    /**
     * Create empty layer with given dimensions
     */
    createEmptyLayer(width, height) {
        const layer = [];
        for (let y = 0; y < height; y++) {
            layer[y] = [];
            for (let x = 0; x < width; x++) {
                layer[y][x] = {
                    tileId: 0,
                    tileType: 'empty',
                    walkable: true,
                    solid: false,
                    x,
                    y
                };
            }
        }
        return layer;
    }

    /**
     * Generate dungeon layout with rooms and corridors
     */
    async generateDungeonLayout(layout, config) {
        const { width, height } = layout.metadata;

        // Generate rooms using BSP tree algorithm
        const rooms = this.generateRoomsBSP(width, height, config);

        // Connect rooms with corridors
        const corridors = this.connectRooms(rooms, layout);

        // Place rooms
        rooms.forEach(room => {
            this.placeRoom(layout, room);
        });

        // Place corridors
        corridors.forEach(corridor => {
            this.placeCorridor(layout, corridor);
        });

        // Add walls around walkable areas
        this.addWalls(layout);

        // Add dungeon-specific decorations
        this.addDungeonDecorations(layout, rooms);
    }

    /**
     * Generate cave layout using cellular automata
     */
    async generateCaveLayout(layout, config) {
        const { width, height } = layout.metadata;

        // Initialize with random noise
        this.initializeCaveNoise(layout, 0.45);

        // Apply cellular automata rules
        for (let i = 0; i < 5; i++) {
            this.applyCellularAutomata(layout);
        }

        // Ensure connectivity
        this.ensureConnectivity(layout);

        // Add cave-specific features
        this.addCaveFeatures(layout);
    }

    /**
     * Generate forest layout
     */
    async generateForestLayout(layout, config) {
        const { width, height } = layout.metadata;

        // Fill with grass tiles
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                layout.ground[y][x] = {
                    tileId: 1,
                    tileType: 'grass',
                    walkable: true,
                    solid: false,
                    x,
                    y
                };
            }
        }

        // Add dirt paths
        this.addPaths(layout, 3);

        // Add water features
        this.addWaterFeatures(layout, 2);

        // Add forest-specific decorations
        this.addForestDecorations(layout);
    }

    /**
     * Generate town layout with streets and buildings
     */
    async generateTownLayout(layout, config) {
        const { width, height } = layout.metadata;

        // Create street grid
        this.createStreetGrid(layout);

        // Place building lots
        const buildingLots = this.createBuildingLots(layout);

        // Add town decorations
        this.addTownDecorations(layout, buildingLots);
    }

    /**
     * Generate castle layout
     */
    async generateCastleLayout(layout, config) {
        const { width, height } = layout.metadata;

        // Create outer walls
        this.createCastleWalls(layout);

        // Create inner courtyard
        this.createCourtyard(layout);

        // Add towers and buildings
        this.addCastleStructures(layout);

        // Add castle-specific decorations
        this.addCastleDecorations(layout);
    }

    /**
     * Generate ruins layout
     */
    async generateRuinsLayout(layout, config) {
        const { width, height } = layout.metadata;

        // Start with town layout
        await this.generateTownLayout(layout, config);

        // Add ruin effects
        this.addRuinEffects(layout);

        // Add overgrown vegetation
        this.addOvergrownVegetation(layout);
    }

    /**
     * Generate mountain layout
     */
    async generateMountainLayout(layout, config) {
        const { width, height } = layout.metadata;

        // Create height map
        const heightMap = this.generateHeightMap(width, height);

        // Convert height map to tiles
        this.applyHeightMap(layout, heightMap);

        // Add mountain features
        this.addMountainFeatures(layout);
    }

    /**
     * Generate swamp layout
     */
    async generateSwampLayout(layout, config) {
        const { width, height } = layout.metadata;

        // Fill with mud/swamp tiles
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tileType = Math.random() > 0.7 ? 'mud' : 'grass';
                layout.ground[y][x] = {
                    tileId: tileType === 'mud' ? 2 : 1,
                    tileType,
                    walkable: true,
                    solid: false,
                    x,
                    y
                };
            }
        }

        // Add water pools
        this.addWaterPools(layout, 5);

        // Add swamp decorations
        this.addSwampDecorations(layout);
    }

    /**
     * Generate rooms using Binary Space Partitioning
     */
    generateRoomsBSP(width, height, config) {
        const rooms = [];
        const minRoomSize = 6;
        const maxRoomSize = 12;

        // Create initial partition
        const partitions = [{
            x: 0,
            y: 0,
            width,
            height
        }];

        // Split partitions
        for (let i = 0; i < 4; i++) {
            const newPartitions = [];
            partitions.forEach(partition => {
                if (partition.width > maxRoomSize * 2 || partition.height > maxRoomSize * 2) {
                    const splitPartitions = this.splitPartition(partition, minRoomSize);
                    newPartitions.push(...splitPartitions);
                } else {
                    newPartitions.push(partition);
                }
            });
            partitions.length = 0;
            partitions.push(...newPartitions);
        }

        // Create rooms from partitions
        partitions.forEach(partition => {
            const room = this.createRoomFromPartition(partition, minRoomSize, maxRoomSize);
            if (room) {
                rooms.push(room);
            }
        });

        return rooms;
    }

    /**
     * Split partition for BSP
     */
    splitPartition(partition, minSize) {
        const canSplitHorizontally = partition.width >= minSize * 2;
        const canSplitVertically = partition.height >= minSize * 2;

        if (!canSplitHorizontally && !canSplitVertically) {
            return [partition];
        }

        const splitHorizontally = canSplitHorizontally && (!canSplitVertically || Math.random() > 0.5);

        if (splitHorizontally) {
            const splitX = partition.x + minSize + Math.floor(Math.random() * (partition.width - minSize * 2));
            return [
                { x: partition.x, y: partition.y, width: splitX - partition.x, height: partition.height },
                { x: splitX, y: partition.y, width: partition.x + partition.width - splitX, height: partition.height }
            ];
        } else {
            const splitY = partition.y + minSize + Math.floor(Math.random() * (partition.height - minSize * 2));
            return [
                { x: partition.x, y: partition.y, width: partition.width, height: splitY - partition.y },
                { x: partition.x, y: splitY, width: partition.width, height: partition.y + partition.height - splitY }
            ];
        }
    }

    /**
     * Create room from partition
     */
    createRoomFromPartition(partition, minSize, maxSize) {
        const roomWidth = Math.min(maxSize, Math.max(minSize, partition.width - 2));
        const roomHeight = Math.min(maxSize, Math.max(minSize, partition.height - 2));

        if (roomWidth < minSize || roomHeight < minSize) {
            return null;
        }

        const roomX = partition.x + Math.floor((partition.width - roomWidth) / 2);
        const roomY = partition.y + Math.floor((partition.height - roomHeight) / 2);

        return {
            x: roomX,
            y: roomY,
            width: roomWidth,
            height: roomHeight,
            centerX: roomX + Math.floor(roomWidth / 2),
            centerY: roomY + Math.floor(roomHeight / 2)
        };
    }

    /**
     * Connect rooms with corridors
     */
    connectRooms(rooms, layout) {
        const corridors = [];

        for (let i = 0; i < rooms.length - 1; i++) {
            const roomA = rooms[i];
            const roomB = rooms[i + 1];

            const corridor = this.createCorridor(roomA, roomB);
            corridors.push(corridor);
        }

        return corridors;
    }

    /**
     * Create corridor between two rooms
     */
    createCorridor(roomA, roomB) {
        const startX = roomA.centerX;
        const startY = roomA.centerY;
        const endX = roomB.centerX;
        const endY = roomB.centerY;

        return {
            startX,
            startY,
            endX,
            endY,
            width: 1
        };
    }

    /**
     * Place room in layout
     */
    placeRoom(layout, room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (x >= 0 && x < layout.metadata.width && y >= 0 && y < layout.metadata.height) {
                    layout.ground[y][x] = {
                        tileId: 3, // Stone floor
                        tileType: 'stone_floor',
                        walkable: true,
                        solid: false,
                        x,
                        y
                    };
                }
            }
        }
    }

    /**
     * Place corridor in layout
     */
    placeCorridor(layout, corridor) {
        const points = this.getCorridorPoints(corridor);

        points.forEach(point => {
            const { x, y } = point;
            if (x >= 0 && x < layout.metadata.width && y >= 0 && y < layout.metadata.height) {
                layout.ground[y][x] = {
                    tileId: 3, // Stone floor
                    tileType: 'stone_floor',
                    walkable: true,
                    solid: false,
                    x,
                    y
                };
            }
        });
    }

    /**
     * Get points for corridor
     */
    getCorridorPoints(corridor) {
        const points = [];
        const dx = Math.abs(corridor.endX - corridor.startX);
        const dy = Math.abs(corridor.endY - corridor.startY);
        const sx = corridor.startX < corridor.endX ? 1 : -1;
        const sy = corridor.startY < corridor.endY ? 1 : -1;
        let err = dx - dy;

        let x = corridor.startX;
        let y = corridor.startY;

        while (true) {
            points.push({ x, y });

            if (x === corridor.endX && y === corridor.endY) break;

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

        return points;
    }

    /**
     * Add walls around walkable areas
     */
    addWalls(layout) {
        const { width, height } = layout.metadata;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (layout.ground[y][x].walkable) {
                    // Check adjacent tiles
                    const adjacent = this.getAdjacentTiles(x, y, width, height);

                    adjacent.forEach(adj => {
                        if (layout.ground[adj.y][adj.x].tileType === 'empty') {
                            layout.walls[adj.y][adj.x] = {
                                tileId: 4, // Stone wall
                                tileType: 'stone_wall',
                                walkable: false,
                                solid: true,
                                x: adj.x,
                                y: adj.y
                            };
                        }
                    });
                }
            }
        }
    }

    /**
     * Get adjacent tiles
     */
    getAdjacentTiles(x, y, width, height) {
        const adjacent = [];
        const directions = [
            { dx: 0, dy: -1 }, // North
            { dx: 1, dy: 0 },  // East
            { dx: 0, dy: 1 },  // South
            { dx: -1, dy: 0 }  // West
        ];

        directions.forEach(dir => {
            const newX = x + dir.dx;
            const newY = y + dir.dy;

            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                adjacent.push({ x: newX, y: newY });
            }
        });

        return adjacent;
    }

    /**
     * Initialize cave with random noise
     */
    initializeCaveNoise(layout, fillProbability) {
        const { width, height } = layout.metadata;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const isWall = Math.random() < fillProbability;
                layout.ground[y][x] = {
                    tileId: isWall ? 4 : 3,
                    tileType: isWall ? 'stone_wall' : 'stone_floor',
                    walkable: !isWall,
                    solid: isWall,
                    x,
                    y
                };
            }
        }
    }

    /**
     * Apply cellular automata rules
     */
    applyCellularAutomata(layout) {
        const { width, height } = layout.metadata;
        const newLayout = this.createEmptyLayer(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const wallCount = this.countAdjacentWalls(layout, x, y);

                if (layout.ground[y][x].solid) {
                    // Wall stays wall if 4+ neighbors are walls
                    newLayout[y][x] = wallCount >= 4 ?
                        layout.ground[y][x] :
                        { tileId: 3, tileType: 'stone_floor', walkable: true, solid: false, x, y };
                } else {
                    // Empty becomes wall if 5+ neighbors are walls
                    newLayout[y][x] = wallCount >= 5 ?
                        { tileId: 4, tileType: 'stone_wall', walkable: false, solid: true, x, y } :
                        layout.ground[y][x];
                }
            }
        }

        // Copy new layout
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                layout.ground[y][x] = newLayout[y][x];
            }
        }
    }

    /**
     * Count adjacent walls
     */
    countAdjacentWalls(layout, x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;

                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < layout.metadata.width &&
                    ny >= 0 && ny < layout.metadata.height) {
                    if (layout.ground[ny][nx].solid) {
                        count++;
                    }
                } else {
                    // Count out-of-bounds as walls
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Ensure cave connectivity
     */
    ensureConnectivity(layout) {
        // Simple flood fill to ensure main area is connected
        // This is a simplified version - a full implementation would be more complex
        const { width, height } = layout.metadata;
        const visited = Array(height).fill().map(() => Array(width).fill(false));

        // Find first walkable tile
        let startX = -1, startY = -1;
        for (let y = 0; y < height && startY === -1; y++) {
            for (let x = 0; x < width && startY === -1; x++) {
                if (layout.ground[y][x].walkable) {
                    startX = x;
                    startY = y;
                }
            }
        }

        if (startX !== -1) {
            this.floodFill(layout, startX, startY, visited);
        }
    }

    /**
     * Flood fill algorithm
     */
    floodFill(layout, x, y, visited) {
        if (x < 0 || x >= layout.metadata.width ||
            y < 0 || y >= layout.metadata.height ||
            visited[y][x] || !layout.ground[y][x].walkable) {
            return;
        }

        visited[y][x] = true;

        // Recursively fill adjacent tiles
        this.floodFill(layout, x + 1, y, visited);
        this.floodFill(layout, x - 1, y, visited);
        this.floodFill(layout, x, y + 1, visited);
        this.floodFill(layout, x, y - 1, visited);
    }

    // Placeholder methods for other layout types
    addDungeonDecorations(layout, rooms) { /* Implementation */ }
    addCaveFeatures(layout) { /* Implementation */ }
    addPaths(layout, count) { /* Implementation */ }
    addWaterFeatures(layout, count) { /* Implementation */ }
    addForestDecorations(layout) { /* Implementation */ }
    createStreetGrid(layout) { /* Implementation */ }
    createBuildingLots(layout) { return []; }
    addTownDecorations(layout, lots) { /* Implementation */ }
    createCastleWalls(layout) { /* Implementation */ }
    createCourtyard(layout) { /* Implementation */ }
    addCastleStructures(layout) { /* Implementation */ }
    addCastleDecorations(layout) { /* Implementation */ }
    addRuinEffects(layout) { /* Implementation */ }
    addOvergrownVegetation(layout) { /* Implementation */ }
    generateHeightMap(width, height) { return []; }
    applyHeightMap(layout, heightMap) { /* Implementation */ }
    addMountainFeatures(layout) { /* Implementation */ }
    addWaterPools(layout, count) { /* Implementation */ }
    addSwampDecorations(layout) { /* Implementation */ }
}

module.exports = LevelLayoutComposer;
