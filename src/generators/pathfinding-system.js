/**
 * Pathfinding System - A* pathfinding for sprite movement and navigation
 * Implements A* algorithm with various heuristics and grid-based navigation
 */

class PathfindingSystem {
    constructor(options = {}) {
        this.gridWidth = options.gridWidth || 50;
        this.gridHeight = options.gridHeight || 50;
        this.cellSize = options.cellSize || 32; // pixels per cell
        this.diagonalMovement = options.diagonalMovement !== false;
        this.heuristicType = options.heuristicType || 'manhattan'; // manhattan, euclidean, chebyshev

        // Collision grid (true = blocked, false = walkable)
        this.collisionGrid = this.initializeGrid();

        // Pathfinding state
        this.openSet = new Set();
        this.closedSet = new Set();
        this.cameFrom = new Map();
        this.gScore = new Map();
        this.fScore = new Map();

        // Path smoothing
        this.smoothingEnabled = options.smoothingEnabled !== false;
        this.smoothingIterations = options.smoothingIterations || 3;

        // Performance settings
        this.maxIterations = options.maxIterations || 1000;
        this.timeout = options.timeout || 5000; // 5 seconds

        // Path caching
        this.pathCache = new Map();
        this.cacheEnabled = options.cacheEnabled !== false;
        this.maxCacheSize = options.maxCacheSize || 100;
    }

    /**
     * Initialize collision grid
     */
    initializeGrid() {
        const grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                grid[y][x] = false; // false = walkable, true = blocked
            }
        }
        return grid;
    }

    /**
     * Convert world coordinates to grid coordinates
     */
    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.cellSize),
            y: Math.floor(worldY / this.cellSize)
        };
    }

    /**
     * Convert grid coordinates to world coordinates
     */
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.cellSize + this.cellSize / 2,
            y: gridY * this.cellSize + this.cellSize / 2
        };
    }

    /**
     * Set collision at grid position
     */
    setCollision(gridX, gridY, blocked = true) {
        if (this.isValidGridPosition(gridX, gridY)) {
            this.collisionGrid[gridY][gridX] = blocked;
            // Clear path cache when obstacles change
            if (this.cacheEnabled) {
                this.pathCache.clear();
            }
        }
    }

    /**
     * Set collision at world position
     */
    setWorldCollision(worldX, worldY, blocked = true) {
        const gridPos = this.worldToGrid(worldX, worldY);
        this.setCollision(gridPos.x, gridPos.y, blocked);
    }

    /**
     * Check if grid position is valid
     */
    isValidGridPosition(x, y) {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    }

    /**
     * Check if grid position is walkable
     */
    isWalkable(x, y) {
        return this.isValidGridPosition(x, y) && !this.collisionGrid[y][x];
    }

    /**
     * Get neighbors of a grid position
     */
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // North
            { x: 1, y: 0 },  // East
            { x: 0, y: 1 },  // South
            { x: -1, y: 0 }  // West
        ];

        // Add diagonal directions if enabled
        if (this.diagonalMovement) {
            directions.push(
                { x: 1, y: -1 },  // Northeast
                { x: 1, y: 1 },   // Southeast
                { x: -1, y: 1 },  // Southwest
                { x: -1, y: -1 }  // Northwest
            );
        }

        for (const dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;

            if (this.isWalkable(newX, newY)) {
                neighbors.push({ x: newX, y: newY });
            }
        }

        return neighbors;
    }

    /**
     * Calculate heuristic distance between two points
     */
    calculateHeuristic(x1, y1, x2, y2) {
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);

        switch (this.heuristicType) {
            case 'manhattan':
                return dx + dy;
            case 'euclidean':
                return Math.sqrt(dx * dx + dy * dy);
            case 'chebyshev':
                return Math.max(dx, dy);
            case 'diagonal':
                const diagonal = Math.min(dx, dy);
                const straight = dx + dy;
                return diagonal * Math.sqrt(2) + (straight - 2 * diagonal);
            default:
                return dx + dy;
        }
    }

    /**
     * Calculate movement cost between two adjacent cells
     */
    calculateMovementCost(fromX, fromY, toX, toY) {
        const dx = Math.abs(fromX - toX);
        const dy = Math.abs(fromY - toY);

        // Diagonal movement costs more
        if (dx === 1 && dy === 1) {
            return Math.sqrt(2);
        } else {
            return 1;
        }
    }

    /**
     * Find path using A* algorithm
     */
    findPath(startX, startY, endX, endY) {
        // Convert world coordinates to grid
        const startGrid = this.worldToGrid(startX, startY);
        const endGrid = this.worldToGrid(endX, endY);

        // Check if start or end is blocked
        if (!this.isWalkable(startGrid.x, startGrid.y) || !this.isWalkable(endGrid.x, endGrid.y)) {
            return null;
        }

        // Check cache first
        if (this.cacheEnabled) {
            const cacheKey = `${startGrid.x},${startGrid.y}-${endGrid.x},${endGrid.y}`;
            if (this.pathCache.has(cacheKey)) {
                return this.pathCache.get(cacheKey);
            }
        }

        // Initialize A* algorithm
        this.openSet.clear();
        this.closedSet.clear();
        this.cameFrom.clear();
        this.gScore.clear();
        this.fScore.clear();

        const startKey = `${startGrid.x},${startGrid.y}`;
        const endKey = `${endGrid.x},${endGrid.y}`;

        this.openSet.add(startKey);
        this.gScore.set(startKey, 0);
        this.fScore.set(startKey, this.calculateHeuristic(startGrid.x, startGrid.y, endGrid.x, endGrid.y));

        let iterations = 0;
        const startTime = Date.now();

        while (this.openSet.size > 0) {
            // Timeout check
            if (Date.now() - startTime > this.timeout) {
                console.warn('Pathfinding timeout');
                return null;
            }

            // Iteration limit check
            if (iterations++ > this.maxIterations) {
                console.warn('Pathfinding iteration limit reached');
                return null;
            }

            // Find node with lowest fScore
            let currentKey = null;
            let lowestFScore = Infinity;

            for (const key of this.openSet) {
                const fScore = this.fScore.get(key) || Infinity;
                if (fScore < lowestFScore) {
                    lowestFScore = fScore;
                    currentKey = key;
                }
            }

            if (!currentKey) break;

            const [currentX, currentY] = currentKey.split(',').map(Number);

            // Check if we reached the goal
            if (currentX === endGrid.x && currentY === endGrid.y) {
                const path = this.reconstructPath(currentKey);
                const smoothedPath = this.smoothingEnabled ? this.smoothPath(path) : path;

                // Cache the result
                if (this.cacheEnabled) {
                    const cacheKey = `${startGrid.x},${startGrid.y}-${endGrid.x},${endGrid.y}`;
                    this.pathCache.set(cacheKey, smoothedPath);

                    // Limit cache size
                    if (this.pathCache.size > this.maxCacheSize) {
                        const firstKey = this.pathCache.keys().next().value;
                        this.pathCache.delete(firstKey);
                    }
                }

                return smoothedPath;
            }

            this.openSet.delete(currentKey);
            this.closedSet.add(currentKey);

            // Check all neighbors
            const neighbors = this.getNeighbors(currentX, currentY);

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;

                if (this.closedSet.has(neighborKey)) {
                    continue;
                }

                const tentativeGScore = (this.gScore.get(currentKey) || 0) +
                    this.calculateMovementCost(currentX, currentY, neighbor.x, neighbor.y);

                if (!this.openSet.has(neighborKey)) {
                    this.openSet.add(neighborKey);
                } else if (tentativeGScore >= (this.gScore.get(neighborKey) || Infinity)) {
                    continue;
                }

                this.cameFrom.set(neighborKey, currentKey);
                this.gScore.set(neighborKey, tentativeGScore);
                this.fScore.set(neighborKey,
                    tentativeGScore + this.calculateHeuristic(neighbor.x, neighbor.y, endGrid.x, endGrid.y));
            }
        }

        // No path found
        return null;
    }

    /**
     * Reconstruct path from A* results
     */
    reconstructPath(endKey) {
        const path = [];
        let currentKey = endKey;

        while (currentKey) {
            const [x, y] = currentKey.split(',').map(Number);
            const worldPos = this.gridToWorld(x, y);
            path.unshift(worldPos);
            currentKey = this.cameFrom.get(currentKey);
        }

        return path;
    }

    /**
     * Smooth path to remove unnecessary waypoints
     */
    smoothPath(path) {
        if (path.length <= 2) return path;

        const smoothed = [path[0]];

        for (let i = 0; i < this.smoothingIterations; i++) {
            const newPath = [path[0]];

            for (let j = 1; j < path.length - 1; j++) {
                const prev = newPath[newPath.length - 1];
                const current = path[j];
                const next = path[j + 1];

                // Check if we can skip the current point
                if (!this.lineIntersectsObstacle(prev.x, prev.y, next.x, next.y)) {
                    // Skip current point
                    continue;
                } else {
                    // Keep current point
                    newPath.push(current);
                }
            }

            newPath.push(path[path.length - 1]);
            path = newPath;
        }

        smoothed.push(...path.slice(1));
        return smoothed;
    }

    /**
     * Check if line between two points intersects obstacles
     */
    lineIntersectsObstacle(x1, y1, x2, y2) {
        // Bresenham's line algorithm to check for obstacles
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;

        let x = x1;
        let y = y1;

        while (true) {
            // Check if current position is blocked
            const gridPos = this.worldToGrid(x, y);
            if (!this.isWalkable(gridPos.x, gridPos.y)) {
                return true;
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

        return false;
    }

    /**
     * Find nearest walkable position to given coordinates
     */
    findNearestWalkablePosition(worldX, worldY, maxDistance = 5) {
        const startGrid = this.worldToGrid(worldX, worldY);

        // Check if start position is walkable
        if (this.isWalkable(startGrid.x, startGrid.y)) {
            return this.gridToWorld(startGrid.x, startGrid.y);
        }

        // Search in expanding circles
        for (let radius = 1; radius <= maxDistance; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) + Math.abs(dy) === radius || (Math.abs(dx) === radius && Math.abs(dy) === radius)) {
                        const checkX = startGrid.x + dx;
                        const checkY = startGrid.y + dy;

                        if (this.isWalkable(checkX, checkY)) {
                            return this.gridToWorld(checkX, checkY);
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Get path cost (for comparing path quality)
     */
    getPathCost(path) {
        if (!path || path.length < 2) return 0;

        let totalCost = 0;
        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const gridPrev = this.worldToGrid(prev.x, prev.y);
            const gridCurrent = this.worldToGrid(current.x, current.y);

            totalCost += this.calculateMovementCost(gridPrev.x, gridPrev.y, gridCurrent.x, gridCurrent.y);
        }

        return totalCost;
    }

    /**
     * Optimize path for specific movement types
     */
    optimizePathForMovement(path, movementType) {
        switch (movementType) {
            case 'grid':
                return this.optimizeForGridMovement(path);
            case 'free':
                return this.optimizeForFreeMovement(path);
            case 'diagonal':
                return this.optimizeForDiagonalMovement(path);
            default:
                return path;
        }
    }

    /**
     * Optimize path for grid-based movement
     */
    optimizeForGridMovement(path) {
        if (!path || path.length < 2) return path;

        const optimized = [path[0]];

        for (let i = 1; i < path.length; i++) {
            const current = path[i];
            const gridPos = this.worldToGrid(current.x, current.y);
            const worldPos = this.gridToWorld(gridPos.x, gridPos.y);

            // Only add if it's a different grid cell
            const lastOptimized = optimized[optimized.length - 1];
            const lastGridPos = this.worldToGrid(lastOptimized.x, lastOptimized.y);

            if (gridPos.x !== lastGridPos.x || gridPos.y !== lastGridPos.y) {
                optimized.push(worldPos);
            }
        }

        return optimized;
    }

    /**
     * Optimize path for free movement
     */
    optimizeForFreeMovement(path) {
        // For free movement, the smoothed path is already optimized
        return path;
    }

    /**
     * Optimize path for diagonal movement
     */
    optimizeForDiagonalMovement(path) {
        if (!path || path.length < 3) return path;

        const optimized = [path[0]];

        for (let i = 1; i < path.length - 1; i++) {
            const prev = optimized[optimized.length - 1];
            const current = path[i];
            const next = path[i + 1];

            // Check if we can move diagonally
            const canMoveDiagonally = this.canMoveDiagonallyBetween(prev, next);

            if (canMoveDiagonally) {
                // Skip the current waypoint
                continue;
            } else {
                optimized.push(current);
            }
        }

        optimized.push(path[path.length - 1]);
        return optimized;
    }

    /**
     * Check if diagonal movement is possible between two points
     */
    canMoveDiagonallyBetween(point1, point2) {
        const grid1 = this.worldToGrid(point1.x, point1.y);
        const grid2 = this.worldToGrid(point2.x, point2.y);

        const dx = Math.abs(grid2.x - grid1.x);
        const dy = Math.abs(grid2.y - grid1.y);

        // Must be diagonal movement
        if (dx !== dy || dx === 0) return false;

        // Check if the diagonal path is clear
        const stepX = grid2.x > grid1.x ? 1 : -1;
        const stepY = grid2.y > grid1.y ? 1 : -1;

        let x = grid1.x;
        let y = grid1.y;

        for (let i = 0; i < dx; i++) {
            x += stepX;
            y += stepY;

            if (!this.isWalkable(x, y)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Create navigation mesh for more complex pathfinding
     */
    createNavigationMesh() {
        // This would create a navigation mesh for more complex environments
        // For now, return the grid-based system
        return {
            type: 'grid',
            width: this.gridWidth,
            height: this.gridHeight,
            cellSize: this.cellSize
        };
    }

    /**
     * Get pathfinding statistics
     */
    getStatistics() {
        return {
            gridSize: `${this.gridWidth}x${this.gridHeight}`,
            cellSize: this.cellSize,
            walkableCells: this.countWalkableCells(),
            blockedCells: this.countBlockedCells(),
            cacheSize: this.pathCache.size,
            cacheEnabled: this.cacheEnabled,
            diagonalMovement: this.diagonalMovement,
            heuristicType: this.heuristicType
        };
    }

    /**
     * Count walkable cells
     */
    countWalkableCells() {
        let count = 0;
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (!this.collisionGrid[y][x]) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Count blocked cells
     */
    countBlockedCells() {
        let count = 0;
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.collisionGrid[y][x]) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Clear all collision data
     */
    clearCollisions() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.collisionGrid[y][x] = false;
            }
        }

        if (this.cacheEnabled) {
            this.pathCache.clear();
        }
    }

    /**
     * Load collision data from array
     */
    loadCollisionData(collisionData) {
        if (collisionData.length !== this.gridHeight ||
            collisionData[0].length !== this.gridWidth) {
            throw new Error('Collision data dimensions do not match grid size');
        }

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.collisionGrid[y][x] = collisionData[y][x];
            }
        }

        if (this.cacheEnabled) {
            this.pathCache.clear();
        }
    }

    /**
     * Export collision data
     */
    exportCollisionData() {
        return {
            width: this.gridWidth,
            height: this.gridHeight,
            cellSize: this.cellSize,
            collisionGrid: this.collisionGrid
        };
    }
}

module.exports = PathfindingSystem;
