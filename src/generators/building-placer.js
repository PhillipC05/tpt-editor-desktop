/**
 * Building Placer
 * Places buildings and structures in levels
 */

class BuildingPlacer {
    constructor() {
        // Will integrate with existing building generator
    }

    /**
     * Place buildings in level
     */
    async place(config, layers) {
        const entities = [];

        // Only place buildings for appropriate level types
        if (['town', 'castle', 'ruins'].includes(config.levelType)) {
            // Generate building placements based on level type
            const buildingPlacements = this.generateBuildingPlacements(config, layers);

            buildingPlacements.forEach(placement => {
                entities.push({
                    id: `building_${placement.x}_${placement.y}`,
                    type: 'building',
                    name: placement.buildingType,
                    position: { x: placement.x, y: placement.y },
                    size: placement.size,
                    properties: {
                        buildingType: placement.buildingType,
                        style: placement.style
                    }
                });
            });
        }

        return entities;
    }

    /**
     * Generate building placements
     */
    generateBuildingPlacements(config, layers) {
        const placements = [];
        const { width, height } = config.dimensions;

        // Simple grid-based placement for towns
        if (config.levelType === 'town') {
            for (let x = 5; x < width - 10; x += 8) {
                for (let y = 5; y < height - 10; y += 6) {
                    if (Math.random() > 0.3) { // 70% chance of building
                        placements.push({
                            x,
                            y,
                            buildingType: this.getRandomBuildingType(),
                            size: { width: 3, height: 4 },
                            style: 'medieval'
                        });
                    }
                }
            }
        }

        return placements;
    }

    /**
     * Get random building type
     */
    getRandomBuildingType() {
        const types = ['house', 'shop', 'tavern', 'blacksmith', 'temple'];
        return types[Math.floor(Math.random() * types.length)];
    }
}

module.exports = BuildingPlacer;
