/**
 * Level Validator
 * Validates generated levels for playability and quality
 */

class LevelValidator {
    constructor() {
        this.validationRules = {
            connectivity: {
                minWalkablePercentage: 0.3,
                maxIsolatedAreas: 3,
                minPathWidth: 1
            },
            balance: {
                minEntities: 5,
                maxEntities: 200,
                minTreasureDensity: 0.1,
                maxHazardDensity: 0.3
            },
            accessibility: {
                minEntrances: 1,
                maxDeadEnds: 10,
                minLoopPaths: 2
            },
            lighting: {
                minLightCoverage: 0.4,
                maxDarkAreas: 5,
                minLightIntensity: 0.2
            }
        };
    }

    /**
     * Validate complete level
     */
    async validate(level) {
        const results = {
            overall: 'valid',
            score: 100,
            issues: [],
            warnings: [],
            metrics: {}
        };

        try {
            // Basic structure validation
            this.validateStructure(level, results);

            // Connectivity validation
            this.validateConnectivity(level, results);

            // Balance validation
            this.validateBalance(level, results);

            // Accessibility validation
            this.validateAccessibility(level, results);

            // Lighting validation
            this.validateLighting(level, results);

            // Calculate overall score
            results.score = this.calculateScore(results);

            // Determine overall status
            results.overall = this.determineOverallStatus(results);

        } catch (error) {
            results.overall = 'error';
            results.issues.push({
                type: 'validation_error',
                severity: 'critical',
                message: `Validation failed: ${error.message}`
            });
        }

        return results;
    }

    /**
     * Validate level structure
     */
    validateStructure(level, results) {
        // Check required properties
        const required = ['id', 'name', 'type', 'layers', 'entities', 'config'];
        const missing = required.filter(prop => !level[prop]);

        if (missing.length > 0) {
            results.issues.push({
                type: 'structure',
                severity: 'critical',
                message: `Missing required properties: ${missing.join(', ')}`
            });
        }

        // Validate dimensions
        if (level.config?.dimensions) {
            const { width, height } = level.config.dimensions;
            if (width <= 0 || height <= 0 || width > 200 || height > 200) {
                results.issues.push({
                    type: 'structure',
                    severity: 'critical',
                    message: `Invalid dimensions: ${width}x${height}`
                });
            }
        }

        // Validate layers
        if (level.layers) {
            const requiredLayers = ['ground'];
            const missingLayers = requiredLayers.filter(layer => !level.layers[layer]);

            if (missingLayers.length > 0) {
                results.issues.push({
                    type: 'structure',
                    severity: 'major',
                    message: `Missing required layers: ${missingLayers.join(', ')}`
                });
            }
        }

        results.metrics.structureCompleteness = this.calculateStructureCompleteness(level);
    }

    /**
     * Validate level connectivity
     */
    validateConnectivity(level, results) {
        if (!level.layers?.ground) return;

        const walkableTiles = this.countWalkableTiles(level.layers.ground);
        const totalTiles = level.config.dimensions.width * level.config.dimensions.height;
        const walkablePercentage = walkableTiles / totalTiles;

        results.metrics.walkablePercentage = walkablePercentage;

        // Check minimum walkable area
        if (walkablePercentage < this.validationRules.connectivity.minWalkablePercentage) {
            results.issues.push({
                type: 'connectivity',
                severity: 'major',
                message: `Walkable area too small: ${Math.round(walkablePercentage * 100)}% (minimum ${Math.round(this.validationRules.connectivity.minWalkablePercentage * 100)}%)`
            });
        }

        // Check for isolated areas
        const isolatedAreas = this.findIsolatedAreas(level.layers.ground);
        results.metrics.isolatedAreas = isolatedAreas.length;

        if (isolatedAreas.length > this.validationRules.connectivity.maxIsolatedAreas) {
            results.warnings.push({
                type: 'connectivity',
                severity: 'minor',
                message: `Too many isolated areas: ${isolatedAreas.length} (maximum ${this.validationRules.connectivity.maxIsolatedAreas})`
            });
        }

        // Check main area connectivity
        const mainAreaSize = this.getMainAreaSize(level.layers.ground);
        results.metrics.mainAreaConnectivity = mainAreaSize / walkableTiles;

        if (results.metrics.mainAreaConnectivity < 0.8) {
            results.warnings.push({
                type: 'connectivity',
                severity: 'minor',
                message: `Main area connectivity low: ${Math.round(results.metrics.mainAreaConnectivity * 100)}%`
            });
        }
    }

    /**
     * Validate level balance
     */
    validateBalance(level, results) {
        const entityCount = level.entities?.length || 0;
        results.metrics.entityCount = entityCount;

        // Check entity count
        if (entityCount < this.validationRules.balance.minEntities) {
            results.warnings.push({
                type: 'balance',
                severity: 'minor',
                message: `Low entity count: ${entityCount} (minimum ${this.validationRules.balance.minEntities})`
            });
        }

        if (entityCount > this.validationRules.balance.maxEntities) {
            results.issues.push({
                type: 'balance',
                severity: 'major',
                message: `Too many entities: ${entityCount} (maximum ${this.validationRules.balance.maxEntities})`
            });
        }

        // Check entity type distribution
        const entityTypes = this.countEntityTypes(level.entities);
        results.metrics.entityTypeDistribution = entityTypes;

        // Check for treasure balance
        const treasureCount = this.countTreasureEntities(level.entities);
        const totalArea = level.config.dimensions.width * level.config.dimensions.height;
        const treasureDensity = treasureCount / totalArea;

        results.metrics.treasureDensity = treasureDensity;

        if (treasureDensity < this.validationRules.balance.minTreasureDensity) {
            results.warnings.push({
                type: 'balance',
                severity: 'minor',
                message: `Low treasure density: ${(treasureDensity * 1000).toFixed(1)} per 1000 tiles`
            });
        }

        // Check difficulty balance
        const difficultyScore = this.calculateDifficultyScore(level);
        results.metrics.difficultyScore = difficultyScore;

        if (difficultyScore > 2.0) {
            results.warnings.push({
                type: 'balance',
                severity: 'minor',
                message: `High difficulty score: ${difficultyScore.toFixed(1)}`
            });
        }
    }

    /**
     * Validate level accessibility
     */
    validateAccessibility(level, results) {
        if (!level.layers?.ground) return;

        // Find entrances/exits
        const entrances = this.findEntrances(level);
        results.metrics.entranceCount = entrances.length;

        if (entrances.length < this.validationRules.accessibility.minEntrances) {
            results.issues.push({
                type: 'accessibility',
                severity: 'major',
                message: `Insufficient entrances: ${entrances.length} (minimum ${this.validationRules.accessibility.minEntrances})`
            });
        }

        // Check for dead ends
        const deadEnds = this.findDeadEnds(level.layers.ground);
        results.metrics.deadEndCount = deadEnds.length;

        if (deadEnds.length > this.validationRules.accessibility.maxDeadEnds) {
            results.warnings.push({
                type: 'accessibility',
                severity: 'minor',
                message: `Too many dead ends: ${deadEnds.length} (maximum ${this.validationRules.accessibility.maxDeadEnds})`
            });
        }

        // Check for loops/paths
        const loops = this.findLoops(level.layers.ground);
        results.metrics.loopCount = loops.length;

        if (loops.length < this.validationRules.accessibility.minLoopPaths) {
            results.warnings.push({
                type: 'accessibility',
                severity: 'minor',
                message: `Few alternative paths: ${loops.length} (minimum ${this.validationRules.accessibility.minLoopPaths})`
            });
        }
    }

    /**
     * Validate level lighting
     */
    validateLighting(level, results) {
        const lightSources = level.lighting?.length || 0;
        results.metrics.lightSourceCount = lightSources;

        if (!level.layers?.ground) return;

        // Calculate light coverage
        const lightCoverage = this.calculateLightCoverage(level);
        results.metrics.lightCoverage = lightCoverage;

        if (lightCoverage < this.validationRules.lighting.minLightCoverage) {
            results.warnings.push({
                type: 'lighting',
                severity: 'minor',
                message: `Low light coverage: ${Math.round(lightCoverage * 100)}% (minimum ${Math.round(this.validationRules.lighting.minLightCoverage * 100)}%)`
            });
        }

        // Check for dark areas
        const darkAreas = this.findDarkAreas(level);
        results.metrics.darkAreaCount = darkAreas.length;

        if (darkAreas.length > this.validationRules.lighting.maxDarkAreas) {
            results.warnings.push({
                type: 'lighting',
                severity: 'minor',
                message: `Too many dark areas: ${darkAreas.length} (maximum ${this.validationRules.lighting.maxDarkAreas})`
            });
        }

        // Check light intensity
        const avgIntensity = this.calculateAverageLightIntensity(level.lighting);
        results.metrics.averageLightIntensity = avgIntensity;

        if (avgIntensity < this.validationRules.lighting.minLightIntensity) {
            results.warnings.push({
                type: 'lighting',
                severity: 'minor',
                message: `Low average light intensity: ${avgIntensity.toFixed(2)}`
            });
        }
    }

    /**
     * Calculate overall validation score
     */
    calculateScore(results) {
        let score = 100;

        // Deduct points for issues
        results.issues.forEach(issue => {
            switch (issue.severity) {
                case 'critical': score -= 25; break;
                case 'major': score -= 15; break;
                case 'minor': score -= 5; break;
            }
        });

        // Deduct points for warnings
        results.warnings.forEach(warning => {
            score -= 2;
        });

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Determine overall validation status
     */
    determineOverallStatus(results) {
        const criticalIssues = results.issues.filter(i => i.severity === 'critical').length;
        const majorIssues = results.issues.filter(i => i.severity === 'major').length;

        if (criticalIssues > 0) return 'invalid';
        if (majorIssues > 0) return 'needs_fixes';
        if (results.warnings.length > 3) return 'needs_improvements';
        return 'valid';
    }

    /**
     * Helper: Count walkable tiles
     */
    countWalkableTiles(layer) {
        let count = 0;
        layer.forEach(row => {
            row.forEach(tile => {
                if (tile.walkable) count++;
            });
        });
        return count;
    }

    /**
     * Helper: Find isolated areas
     */
    findIsolatedAreas(layer) {
        const visited = Array(layer.length).fill().map(() => Array(layer[0].length).fill(false));
        const areas = [];

        for (let y = 0; y < layer.length; y++) {
            for (let x = 0; x < layer[y].length; x++) {
                if (layer[y][x].walkable && !visited[y][x]) {
                    const area = this.floodFillArea(layer, x, y, visited);
                    if (area.length > 0) {
                        areas.push(area);
                    }
                }
            }
        }

        return areas.filter(area => area.length < 50); // Small areas are considered isolated
    }

    /**
     * Helper: Flood fill to find area
     */
    floodFillArea(layer, startX, startY, visited) {
        const area = [];
        const queue = [{ x: startX, y: startY }];
        const directions = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];

        while (queue.length > 0) {
            const { x, y } = queue.shift();

            if (x < 0 || x >= layer[0].length || y < 0 || y >= layer.length ||
                visited[y][x] || !layer[y][x].walkable) {
                continue;
            }

            visited[y][x] = true;
            area.push({ x, y });

            directions.forEach(dir => {
                queue.push({ x: x + dir.dx, y: y + dir.dy });
            });
        }

        return area;
    }

    /**
     * Helper: Get main area size
     */
    getMainAreaSize(layer) {
        const areas = this.findIsolatedAreas(layer);
        if (areas.length === 0) return 0;

        // Find largest area
        let maxSize = 0;
        areas.forEach(area => {
            if (area.length > maxSize) {
                maxSize = area.length;
            }
        });

        return maxSize;
    }

    /**
     * Helper: Calculate structure completeness
     */
    calculateStructureCompleteness(level) {
        let completeness = 0;
        const checks = [
            level.id,
            level.name,
            level.type,
            level.layers,
            level.entities,
            level.config,
            level.config?.dimensions
        ];

        checks.forEach(check => {
            if (check) completeness += 1;
        });

        return completeness / checks.length;
    }

    /**
     * Helper: Count entity types
     */
    countEntityTypes(entities) {
        const counts = {};
        if (!entities) return counts;

        entities.forEach(entity => {
            counts[entity.type] = (counts[entity.type] || 0) + 1;
        });

        return counts;
    }

    /**
     * Helper: Count treasure entities
     */
    countTreasureEntities(entities) {
        if (!entities) return 0;

        const treasureTypes = ['chest', 'treasure', 'coin', 'gem', 'gold'];
        return entities.filter(entity =>
            treasureTypes.some(type => entity.type?.includes(type))
        ).length;
    }

    /**
     * Helper: Calculate difficulty score
     */
    calculateDifficultyScore(level) {
        let score = 0;

        // Factor in entity count
        score += (level.entities?.length || 0) * 0.1;

        // Factor in level size
        const area = level.config?.dimensions ?
            level.config.dimensions.width * level.config.dimensions.height : 0;
        score += Math.sqrt(area) * 0.05;

        // Factor in level type difficulty
        const typeMultipliers = {
            'dungeon': 1.5,
            'cave': 1.3,
            'mountain': 1.2,
            'swamp': 1.1,
            'forest': 0.9,
            'town': 0.7,
            'castle': 1.0,
            'ruins': 1.4
        };

        score *= typeMultipliers[level.type] || 1.0;

        return score;
    }

    /**
     * Helper: Find entrances
     */
    findEntrances(level) {
        // Simplified: look for doors or gaps in outer walls
        const entrances = [];
        if (!level.entities) return entrances;

        level.entities.forEach(entity => {
            if (entity.type?.includes('door') || entity.type?.includes('entrance')) {
                entrances.push(entity);
            }
        });

        return entrances;
    }

    /**
     * Helper: Find dead ends
     */
    findDeadEnds(layer) {
        const deadEnds = [];

        for (let y = 0; y < layer.length; y++) {
            for (let x = 0; x < layer[y].length; x++) {
                if (layer[y][x].walkable) {
                    const adjacent = this.getAdjacentWalkable(layer, x, y);
                    if (adjacent.length === 1) {
                        deadEnds.push({ x, y });
                    }
                }
            }
        }

        return deadEnds;
    }

    /**
     * Helper: Get adjacent walkable tiles
     */
    getAdjacentWalkable(layer, x, y) {
        const adjacent = [];
        const directions = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];

        directions.forEach(dir => {
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (nx >= 0 && nx < layer[0].length && ny >= 0 && ny < layer.length &&
                layer[ny][nx].walkable) {
                adjacent.push({ x: nx, y: ny });
            }
        });

        return adjacent;
    }

    /**
     * Helper: Find loops in level
     */
    findLoops(layer) {
        // Simplified loop detection - count tiles with 3+ connections
        const loops = [];

        for (let y = 0; y < layer.length; y++) {
            for (let x = 0; x < layer[y].length; x++) {
                if (layer[y][x].walkable) {
                    const adjacent = this.getAdjacentWalkable(layer, x, y);
                    if (adjacent.length >= 3) {
                        loops.push({ x, y, connections: adjacent.length });
                    }
                }
            }
        }

        return loops;
    }

    /**
     * Helper: Calculate light coverage
     */
    calculateLightCoverage(level) {
        if (!level.layers?.ground || !level.lighting) return 0;

        const totalTiles = level.layers.ground.length * level.layers.ground[0].length;
        let litTiles = 0;

        // Simplified: assume each light source covers a radius
        level.lighting.forEach(light => {
            const radius = light.range || 5;
            const coverage = Math.PI * radius * radius;
            litTiles += Math.min(coverage, totalTiles);
        });

        return Math.min(1, litTiles / totalTiles);
    }

    /**
     * Helper: Find dark areas
     */
    findDarkAreas(level) {
        // Simplified: areas without nearby light sources
        const darkAreas = [];
        if (!level.lighting || level.lighting.length === 0) {
            darkAreas.push({ x: 0, y: 0, size: 100 }); // Whole level is dark
        }
        return darkAreas;
    }

    /**
     * Helper: Calculate average light intensity
     */
    calculateAverageLightIntensity(lighting) {
        if (!lighting || lighting.length === 0) return 0;

        const totalIntensity = lighting.reduce((sum, light) => sum + (light.intensity || 1), 0);
        return totalIntensity / lighting.length;
    }

    /**
     * Generate validation report
     */
    generateReport(results) {
        let report = `# Level Validation Report\n\n`;
        report += `**Overall Status:** ${results.overall.toUpperCase()}\n`;
        report += `**Score:** ${results.score}/100\n\n`;

        if (results.issues.length > 0) {
            report += `## Issues (${results.issues.length})\n`;
            results.issues.forEach((issue, i) => {
                report += `${i + 1}. **${issue.severity.toUpperCase()}**: ${issue.message}\n`;
            });
            report += '\n';
        }

        if (results.warnings.length > 0) {
            report += `## Warnings (${results.warnings.length})\n`;
            results.warnings.forEach((warning, i) => {
                report += `${i + 1}. **${warning.severity.toUpperCase()}**: ${warning.message}\n`;
            });
            report += '\n';
        }

        report += `## Metrics\n`;
        Object.entries(results.metrics).forEach(([key, value]) => {
            if (typeof value === 'number') {
                report += `- **${key}:** ${value.toFixed ? value.toFixed(2) : value}\n`;
            } else if (typeof value === 'object') {
                report += `- **${key}:** ${JSON.stringify(value)}\n`;
            } else {
                report += `- **${key}:** ${value}\n`;
            }
        });

        return report;
    }
}

module.exports = LevelValidator;
