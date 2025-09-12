/**
 * Light Placer
 * Sets up lighting for levels
 */

class LightPlacer {
    constructor() {}

    async setup(config, layers, entities) {
        const lights = [];

        // Add lighting based on level type
        switch (config.levelType) {
            case 'dungeon':
                lights.push(...this.setupDungeonLighting(config, layers));
                break;
            case 'cave':
                lights.push(...this.setupCaveLighting(config, layers));
                break;
            default:
                lights.push(...this.setupBasicLighting(config, layers));
        }

        return lights;
    }

    setupDungeonLighting(config, layers) {
        const lights = [];

        // Add torches along walls
        const torchCount = Math.floor(config.dimensions.width / 8);
        for (let i = 0; i < torchCount; i++) {
            lights.push({
                id: `torch_${i}`,
                type: 'torch',
                position: { x: i * 8 + 2, y: 2 },
                properties: {
                    intensity: 0.8,
                    range: 6,
                    color: { r: 1, g: 0.6, b: 0.2 }
                }
            });
        }

        return lights;
    }

    setupCaveLighting(config, layers) {
        return [{
            id: 'ambient_light',
            type: 'ambient',
            position: { x: 0, y: 0 },
            properties: {
                intensity: 0.3,
                range: 100,
                color: { r: 0.5, g: 0.5, b: 0.8 }
            }
        }];
    }

    setupBasicLighting(config, layers) {
        return [{
            id: 'sunlight',
            type: 'directional',
            position: { x: 0, y: 0 },
            properties: {
                intensity: 1.0,
                range: 1000,
                color: { r: 1, g: 1, b: 0.9 }
            }
        }];
    }
}

module.exports = LightPlacer;
