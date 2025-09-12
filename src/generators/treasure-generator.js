/**
 * Treasure Generator
 * Generates and places treasures in levels
 */

class TreasureGenerator {
    constructor() {}

    async generate(config, layers) {
        const entities = [];

        // Generate treasures based on level type and difficulty
        const treasureCount = this.calculateTreasureCount(config);

        for (let i = 0; i < treasureCount; i++) {
            const position = this.findTreasureSpot(config, layers, entities);
            if (position) {
                entities.push({
                    id: `treasure_${i}`,
                    type: 'treasure_chest',
                    name: 'Treasure Chest',
                    position,
                    properties: {
                        rarity: this.getTreasureRarity(config),
                        locked: Math.random() > 0.5
                    }
                });
            }
        }

        return entities;
    }

    calculateTreasureCount(config) {
        const baseCount = config.size === 'small' ? 2 : config.size === 'medium' ? 4 : 6;
        const difficultyMultiplier = config.difficulty === 'easy' ? 0.5 : config.difficulty === 'hard' ? 1.5 : 1.0;
        return Math.floor(baseCount * difficultyMultiplier);
    }

    findTreasureSpot(config, layers, existingEntities) {
        // Find suitable spot for treasure
        const { width, height } = config.dimensions;
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;

            if (this.isValidTreasureSpot(x, y, layers, existingEntities)) {
                return { x, y };
            }
            attempts++;
        }

        return null;
    }

    isValidTreasureSpot(x, y, layers, existingEntities) {
        // Check if spot is walkable and not too close to other treasures
        if (!layers.ground?.[y]?.[x]?.walkable) return false;

        // Check distance from other treasures
        for (const entity of existingEntities) {
            if (entity.type === 'treasure_chest') {
                const distance = Math.sqrt(
                    Math.pow(entity.position.x - x, 2) + Math.pow(entity.position.y - y, 2)
                );
                if (distance < 5) return false; // Minimum distance between treasures
            }
        }

        return true;
    }

    getTreasureRarity(config) {
        const rarities = ['common', 'uncommon', 'rare', 'epic'];
        const weights = config.difficulty === 'easy' ? [0.6, 0.3, 0.1, 0.0] :
                       config.difficulty === 'hard' ? [0.2, 0.3, 0.3, 0.2] :
                       [0.4, 0.3, 0.2, 0.1];

        const random = Math.random();
        let cumulative = 0;

        for (let i = 0; i < weights.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return rarities[i];
            }
        }

        return 'common';
    }
}

module.exports = TreasureGenerator;
