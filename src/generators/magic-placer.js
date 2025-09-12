/**
 * Magic Placer
 * Places magical elements in levels
 */

class MagicPlacer {
    constructor() {}

    async place(config, layers) {
        const entities = [];

        // Only add magic for appropriate level types
        if (['dungeon', 'ruins', 'forest', 'castle'].includes(config.levelType)) {
            entities.push(...this.addMagicalElements(config, layers));
        }

        return entities;
    }

    addMagicalElements(config, layers) {
        const elements = [];

        // Add some magical elements
        if (Math.random() > 0.7) {
            elements.push({
                id: 'magic_rune_1',
                type: 'rune',
                name: 'Ancient Rune',
                position: { x: 5, y: 5 },
                properties: { magical: true }
            });
        }

        return elements;
    }
}

module.exports = MagicPlacer;
