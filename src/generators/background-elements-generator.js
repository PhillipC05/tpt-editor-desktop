/**
 * Background Elements Generator - Skyboxes, parallax layers, distant scenery
 * Handles generation of background elements for game environments with depth and atmosphere
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class BackgroundElementsGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Background elements database
        this.backgroundElementsDatabase = {
            skyboxes: {
                name: 'Skyboxes',
                types: ['day_sky', 'sunset_sky', 'night_sky', 'stormy_sky', 'cloudy_sky', 'starry_sky', 'aurora_sky', 'alien_sky', 'magical_sky', 'apocalyptic_sky'],
                atmospheres: ['clear', 'hazy', 'foggy', 'dusty', 'smoky', 'magical', 'ethereal', 'stormy', 'peaceful', 'ominous'],
                times: ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'evening', 'midnight', 'witching_hour'],
                weathers: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'stormy', 'foggy', 'hazy', 'clear', 'overcast']
            },
            parallax_layers: {
                name: 'Parallax Layers',
                types: ['distant_mountains', 'nearby_hills', 'forest_silhouette', 'cloud_layer', 'building_silhouette', 'floating_islands', 'crystal_formations', 'ruins_outline', 'volcanic_peaks', 'iceberg_floes'],
                depths: ['very_distant', 'distant', 'mid_ground', 'near', 'very_near'],
                movements: ['static', 'slow_drift', 'medium_flow', 'fast_stream', 'chaotic'],
                densities: ['sparse', 'moderate', 'dense', 'overgrown', 'cluttered']
            },
            distant_scenery: {
                name: 'Distant Scenery',
                types: ['mountain_range', 'city_skyline', 'forest_horizon', 'ocean_horizon', 'desert_dunes', 'floating_continents', 'crystal_spires', 'ancient_ruins', 'volcanic_landscape', 'frozen_tundra'],
                details: ['silhouetted', 'outlined', 'detailed', 'textured', 'layered', 'gradient', 'sharp', 'soft', 'geometric', 'organic'],
                scales: ['tiny', 'small', 'medium', 'large', 'massive', 'colossal', 'infinite'],
                compositions: ['single_element', 'scattered', 'clustered', 'linear', 'circular', 'random', 'symmetrical', 'asymmetrical']
            }
        };

        // Color palettes for different environments
        this.environmentPalettes = {
            day: {
                sky: [0x87CEEB, 0x00BFFF, 0x1E90FF, 0x4169E1, 0x0000FF],
                clouds: [0xFFFFFF, 0xF5F5F5, 0xE6E6FA, 0xF0F8FF, 0xFFFAF0],
                mountains: [0x696969, 0x808080, 0xA9A9A9, 0xC0C0C0, 0xD3D3D3],
                sunset: [0xFF4500, 0xFF6347, 0xFFD700, 0xFFFF00, 0xFFA500]
            },
            night: {
                sky: [0x191970, 0x000080, 0x00008B, 0x0000CD, 0x0000FF],
                stars: [0xFFFFFF, 0xF5F5F5, 0xE6E6FA, 0xF0F8FF, 0xFFFAF0],
                moon: [0xFFFFF0, 0xF5DEB3, 0xDEB887, 0xD2B48C, 0xBC8F8F],
                aurora: [0x00CED1, 0x48D1CC, 0x20B2AA, 0x008B8B, 0x008080]
            },
            stormy: {
                sky: [0x696969, 0x808080, 0xA9A9A9, 0xC0C0C0, 0xD3D3D3],
                clouds: [0x2F2F2F, 0x404040, 0x606060, 0x808080, 0xA0A0A0],
                lightning: [0xE6E6FA, 0xDDA0DD, 0xDA70D6, 0x9370DB, 0x8A2BE2],
                rain: [0x4169E1, 0x00BFFF, 0x87CEEB, 0xE0FFFF, 0xF0F8FF]
            },
            magical: {
                sky: [0x9370DB, 0x8A2BE2, 0x9932CC, 0xBA55D3, 0xDA70D6],
                energy: [0x00CED1, 0x48D1CC, 0x20B2AA, 0x008B8B, 0x008080],
                particles: [0xFFD700, 0xFFA500, 0xFF6347, 0xFFFF00, 0xFFE4B5],
                auras: [0x9370DB, 0xE6E6FA, 0xDA70D6, 0xFF69B4, 0x00CED1]
            },
            alien: {
                sky: [0xFF1493, 0xFF69B4, 0xFFB6C1, 0xFFC0CB, 0xFFF0F5],
                atmosphere: [0x00CED1, 0x48D1CC, 0x20B2AA, 0x008B8B, 0x008080],
                formations: [0x9370DB, 0x8A2BE2, 0x9932CC, 0xBA55D3, 0xDA70D6],
                energy: [0xFFD700, 0xFFA500, 0xFF6347, 0xFFFF00, 0xFFE4B5]
            }
        };

        // Layer depth multipliers for parallax
        this.depthMultipliers = {
            very_distant: 0.1,
            distant: 0.25,
            mid_ground: 0.5,
            near: 0.75,
            very_near: 0.9
        };

        // Atmospheric effects
        this.atmosphericEffects = {
            clear: { haze: 0.1, particles: 0.2, distortion: 0.0 },
            hazy: { haze: 0.4, particles: 0.5, distortion: 0.1 },
            foggy: { haze: 0.7, particles: 0.8, distortion: 0.2 },
            dusty: { haze: 0.5, particles: 0.6, distortion: 0.15 },
            smoky: { haze: 0.6, particles: 0.9, distortion: 0.25 },
            magical: { haze: 0.3, particles: 0.7, distortion: 0.1 },
            ethereal: { haze: 0.2, particles: 0.4, distortion: 0.05 },
            stormy: { haze: 0.8, particles: 1.0, distortion: 0.3 },
            peaceful: { haze: 0.15, particles: 0.3, distortion: 0.02 },
            ominous: { haze: 0.9, particles: 0.8, distortion: 0.4 }
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine background element type and generate accordingly
        const elementType = config.elementType || 'skyboxes';
        const subType = config.subType || 'day_sky';

        switch (elementType) {
            case 'skyboxes':
                await this.generateSkybox(image, config);
                break;
            case 'parallax_layers':
                await this.generateParallaxLayer(image, config);
                break;
            case 'distant_scenery':
                await this.generateDistantScenery(image, config);
                break;
            default:
                await this.generateSkybox(image, config);
        }
    }

    /**
     * Generate skybox
     */
    async generateSkybox(image, config) {
        const { width, height } = image.bitmap;
        const type = config.skyboxType || 'day_sky';
        const atmosphere = config.atmosphere || 'clear';
        const time = config.time || 'noon';
        const weather = config.weather || 'sunny';

        const skyboxData = this.backgroundElementsDatabase.skyboxes;

        // Generate sky gradient
        await this.generateSkyGradient(image, type, time, weather);

        // Add atmospheric effects
        await this.addAtmosphericEffects(image, atmosphere, type);

        // Add celestial bodies
        await this.addCelestialBodies(image, type, time);

        // Add weather elements
        await this.addWeatherElements(image, weather, type);

        // Add special effects based on type
        await this.addSkyboxSpecialEffects(image, type, atmosphere);
    }

    /**
     * Generate sky gradient
     */
    async generateSkyGradient(image, type, time, weather) {
        const { width, height } = image.bitmap;
        const palette = this.getEnvironmentPalette(type, time);

        // Create vertical gradient
        for (let y = 0; y < height; y++) {
            const progress = y / height;
            const colorIndex = Math.floor(progress * (palette.sky.length - 1));
            const nextIndex = Math.min(colorIndex + 1, palette.sky.length - 1);
            const blend = (progress * (palette.sky.length - 1)) - colorIndex;

            const color1 = palette.sky[colorIndex];
            const color2 = palette.sky[nextIndex];
            const blendedColor = this.blendColors(color1, color2, blend);

            // Apply gradient to entire row
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                image.bitmap.data[idx] = (blendedColor >> 16) & 0xFF;
                image.bitmap.data[idx + 1] = (blendedColor >> 8) & 0xFF;
                image.bitmap.data[idx + 2] = blendedColor & 0xFF;
                image.bitmap.data[idx + 3] = 255;
            }
        }
    }

    /**
     * Generate parallax layer
     */
    async generateParallaxLayer(image, config) {
        const { width, height } = image.bitmap;
        const type = config.parallaxType || 'distant_mountains';
        const depth = config.depth || 'distant';
        const movement = config.movement || 'static';
        const density = config.density || 'moderate';

        const parallaxData = this.backgroundElementsDatabase.parallax_layers;

        // Generate base layer
        await this.generateParallaxBase(image, type, depth);

        // Add layer elements based on type
        await this.addParallaxElements(image, type, density, depth);

        // Apply depth-based effects
        await this.applyDepthEffects(image, depth);

        // Add movement indicators
        if (movement !== 'static') {
            await this.addMovementIndicators(image, movement, type);
        }
    }

    /**
     * Generate parallax base
     */
    async generateParallaxBase(image, type, depth) {
        const { width, height } = image.bitmap;
        const depthMultiplier = this.depthMultipliers[depth];
        const baseColor = this.getDepthColor(depth);

        switch (type) {
            case 'distant_mountains':
                // Generate mountain silhouette
                const mountainCount = Math.floor(8 + Math.random() * 8);
                for (let i = 0; i < mountainCount; i++) {
                    const mountainX = (i / mountainCount) * width;
                    const mountainHeight = height * 0.3 + Math.random() * height * 0.4;
                    const mountainWidth = width * 0.15 + Math.random() * width * 0.1;

                    // Create mountain shape
                    const points = [
                        { x: mountainX, y: height },
                        { x: mountainX + mountainWidth * 0.3, y: height - mountainHeight * 0.7 },
                        { x: mountainX + mountainWidth * 0.5, y: height - mountainHeight },
                        { x: mountainX + mountainWidth * 0.7, y: height - mountainHeight * 0.8 },
                        { x: mountainX + mountainWidth, y: height }
                    ];

                    await this.fillIrregularShape(image, points, baseColor);
                }
                break;

            case 'cloud_layer':
                // Generate cloud layer
                const cloudCount = Math.floor(12 + Math.random() * 12);
                for (let i = 0; i < cloudCount; i++) {
                    const cloudX = Math.random() * width;
                    const cloudY = height * 0.2 + Math.random() * height * 0.4;
                    const cloudSize = width * 0.08 + Math.random() * width * 0.12;

                    // Create fluffy cloud
                    for (let c = 0; c < 8; c++) {
                        const circleX = cloudX + (Math.random() - 0.5) * cloudSize;
                        const circleY = cloudY + (Math.random() - 0.5) * cloudSize * 0.5;
                        const circleRadius = cloudSize * 0.15 + Math.random() * cloudSize * 0.1;

                        this.utils.drawEllipse(image, circleX, circleY, circleRadius, circleRadius * 0.6, baseColor, 0.8);
                    }
                }
                break;

            case 'forest_silhouette':
                // Generate forest silhouette
                const treeCount = Math.floor(15 + Math.random() * 15);
                for (let i = 0; i < treeCount; i++) {
                    const treeX = (i / treeCount) * width;
                    const treeHeight = height * 0.4 + Math.random() * height * 0.3;
                    const treeWidth = width * 0.03 + Math.random() * width * 0.04;

                    // Create tree shape
                    const treePoints = [
                        { x: treeX, y: height },
                        { x: treeX + treeWidth * 0.2, y: height - treeHeight * 0.3 },
                        { x: treeX + treeWidth * 0.5, y: height - treeHeight },
                        { x: treeX + treeWidth * 0.8, y: height - treeHeight * 0.3 },
                        { x: treeX + treeWidth, y: height }
                    ];

                    await this.fillIrregularShape(image, treePoints, baseColor);
                }
                break;

            default:
                // Generic parallax base
                this.utils.drawRectangle(image, 0, height * 0.7, width, height * 0.3, baseColor);
        }
    }

    /**
     * Generate distant scenery
     */
    async generateDistantScenery(image, config) {
        const { width, height } = image.bitmap;
        const type = config.sceneryType || 'mountain_range';
        const detail = config.detail || 'silhouetted';
        const scale = config.scale || 'medium';
        const composition = config.composition || 'scattered';

        const sceneryData = this.backgroundElementsDatabase.distant_scenery;

        // Generate base scenery
        await this.generateSceneryBase(image, type, scale);

        // Add detail elements
        await this.addSceneryDetails(image, type, detail, scale);

        // Apply composition layout
        await this.applySceneryComposition(image, composition, type);

        // Add atmospheric perspective
        await this.addSceneryAtmosphere(image, scale);
    }

    /**
     * Helper methods
     */
    getEnvironmentPalette(type, time) {
        let paletteKey;
        switch (type) {
            case 'day_sky':
            case 'sunset_sky':
                paletteKey = 'day';
                break;
            case 'night_sky':
            case 'starry_sky':
                paletteKey = 'night';
                break;
            case 'stormy_sky':
                paletteKey = 'stormy';
                break;
            case 'magical_sky':
                paletteKey = 'magical';
                break;
            case 'alien_sky':
                paletteKey = 'alien';
                break;
            default:
                paletteKey = 'day';
        }

        return this.environmentPalettes[paletteKey];
    }

    blendColors(color1, color2, ratio) {
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;

        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;

        const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

        return (r << 16) | (g << 8) | b;
    }

    async addAtmosphericEffects(image, atmosphere, type) {
        const { width, height } = image.bitmap;
        const effects = this.atmosphericEffects[atmosphere];

        // Add haze effect
        if (effects.haze > 0) {
            for (let y = 0; y < height; y++) {
                const hazeAlpha = effects.haze * (y / height);
                for (let x = 0; x < width; x += 4) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx + 3] = Math.max(0, image.bitmap.data[idx + 3] - hazeAlpha * 100);
                }
            }
        }

        // Add atmospheric particles
        if (effects.particles > 0) {
            const particleCount = Math.floor(effects.particles * 50);
            for (let i = 0; i < particleCount; i++) {
                const particleX = Math.random() * width;
                const particleY = Math.random() * height;
                const particleSize = 1 + Math.random() * 2;

                let particleColor;
                switch (type) {
                    case 'magical_sky':
                        particleColor = this.environmentPalettes.magical.energy[Math.floor(Math.random() * 5)];
                        break;
                    case 'stormy_sky':
                        particleColor = this.environmentPalettes.stormy.lightning[Math.floor(Math.random() * 5)];
                        break;
                    default:
                        particleColor = 0xFFFFFF;
                }

                this.utils.drawEllipse(image, particleX, particleY, particleSize, particleSize, particleColor, 0.6);
            }
        }
    }

    async addCelestialBodies(image, type, time) {
        const { width, height } = image.bitmap;

        switch (type) {
            case 'day_sky':
                // Add sun
                if (time === 'morning' || time === 'noon' || time === 'afternoon') {
                    const sunX = width * 0.8;
                    const sunY = height * 0.2;
                    const sunRadius = Math.min(width, height) * 0.08;

                    this.utils.drawEllipse(image, sunX, sunY, sunRadius, sunRadius, 0xFFD700);

                    // Add sun rays
                    for (let i = 0; i < 12; i++) {
                        const angle = (i / 12) * Math.PI * 2;
                        const rayLength = sunRadius * 1.5;
                        const rayX = sunX + Math.cos(angle) * rayLength;
                        const rayY = sunY + Math.sin(angle) * rayLength;

                        this.utils.drawLine(image, sunX, sunY, rayX, rayY, 0xFFD700, 2);
                    }
                }
                break;

            case 'night_sky':
                // Add moon
                const moonX = width * 0.7;
                const moonY = height * 0.25;
                const moonRadius = Math.min(width, height) * 0.06;

                this.utils.drawEllipse(image, moonX, moonY, moonRadius, moonRadius, 0xFFFFF0);

                // Add stars
                const starCount = Math.floor(20 + Math.random() * 30);
                for (let i = 0; i < starCount; i++) {
                    const starX = Math.random() * width;
                    const starY = Math.random() * height * 0.6;
                    const starSize = 1 + Math.random() * 2;

                    this.utils.drawEllipse(image, starX, starY, starSize, starSize, 0xFFFFFF);
                }
                break;

            case 'starry_sky':
                // Dense star field
                const denseStarCount = Math.floor(50 + Math.random() * 50);
                for (let i = 0; i < denseStarCount; i++) {
                    const starX = Math.random() * width;
                    const starY = Math.random() * height;
                    const starSize = 0.5 + Math.random() * 2;

                    const starColor = Math.random() < 0.8 ? 0xFFFFFF : 0xE6E6FA;
                    this.utils.drawEllipse(image, starX, starY, starSize, starSize, starColor);
                }
                break;
        }
    }

    async addWeatherElements(image, weather, type) {
        const { width, height } = image.bitmap;

        switch (weather) {
            case 'cloudy':
                // Add clouds
                const cloudCount = Math.floor(8 + Math.random() * 8);
                for (let i = 0; i < cloudCount; i++) {
                    const cloudX = Math.random() * width;
                    const cloudY = height * 0.15 + Math.random() * height * 0.3;
                    const cloudSize = width * 0.1 + Math.random() * width * 0.15;

                    // Create fluffy cloud
                    for (let c = 0; c < 6; c++) {
                        const circleX = cloudX + (Math.random() - 0.5) * cloudSize;
                        const circleY = cloudY + (Math.random() - 0.5) * cloudSize * 0.4;
                        const circleRadius = cloudSize * 0.12 + Math.random() * cloudSize * 0.08;

                        const cloudColor = type.includes('stormy') ? 0x696969 : 0xFFFFFF;
                        this.utils.drawEllipse(image, circleX, circleY, circleRadius, circleRadius * 0.7, cloudColor, 0.9);
                    }
                }
                break;

            case 'stormy':
                // Add dark storm clouds
                const stormCloudCount = Math.floor(12 + Math.random() * 8);
                for (let i = 0; i < stormCloudCount; i++) {
                    const cloudX = Math.random() * width;
                    const cloudY = height * 0.1 + Math.random() * height * 0.4;
                    const cloudSize = width * 0.12 + Math.random() * width * 0.18;

                    for (let c = 0; c < 8; c++) {
                        const circleX = cloudX + (Math.random() - 0.5) * cloudSize;
                        const circleY = cloudY + (Math.random() - 0.5) * cloudSize * 0.5;
                        const circleRadius = cloudSize * 0.1 + Math.random() * cloudSize * 0.1;

                        this.utils.drawEllipse(image, circleX, circleY, circleRadius, circleRadius * 0.6, 0x2F2F2F, 0.95);
                    }
                }
                break;
        }
    }

    async addSkyboxSpecialEffects(image, type, atmosphere) {
        const { width, height } = image.bitmap;

        switch (type) {
            case 'aurora_sky':
                // Add aurora borealis
                for (let y = 0; y < height * 0.4; y++) {
                    const auroraIntensity = Math.sin(y / height * Math.PI * 4) * 0.5;
                    if (auroraIntensity > 0.1) {
                        for (let x = 0; x < width; x += 2) {
                            const auroraColor = this.environmentPalettes.night.aurora[Math.floor(Math.random() * 5)];
                            this.utils.drawEllipse(image, x, y, 1, 2, auroraColor, auroraIntensity);
                        }
                    }
                }
                break;

            case 'magical_sky':
                // Add magical energy streams
                const streamCount = Math.floor(5 + Math.random() * 5);
                for (let i = 0; i < streamCount; i++) {
                    const startX = Math.random() * width;
                    const startY = height;
                    const endX = startX + (Math.random() - 0.5) * width * 0.3;
                    const endY = Math.random() * height * 0.6;

                    const energyColor = this.environmentPalettes.magical.energy[Math.floor(Math.random() * 5)];
                    this.utils.drawLine(image, startX, startY, endX, endY, energyColor, 2);
                }
                break;

            case 'apocalyptic_sky':
                // Add ominous red glow
                for (let y = 0; y < height; y++) {
                    const glowIntensity = 0.3 * (1 - y / height);
                    for (let x = 0; x < width; x += 3) {
                        this.utils.drawEllipse(image, x, y, 1, 1, 0xDC143C, glowIntensity);
                    }
                }
                break;
        }
    }

    async addParallaxElements(image, type, density, depth) {
        const { width, height } = image.bitmap;
        const depthMultiplier = this.depthMultipliers[depth];

        let elementCount;
        switch (density) {
            case 'sparse':
                elementCount = 5;
                break;
            case 'moderate':
                elementCount = 10;
                break;
            case 'dense':
                elementCount = 20;
                break;
            case 'overgrown':
                elementCount = 30;
                break;
            case 'cluttered':
                elementCount = 40;
                break;
            default:
                elementCount = 10;
        }

        for (let i = 0; i < elementCount; i++) {
            const elementX = Math.random() * width;
            const elementY = height * 0.7 + Math.random() * height * 0.3;
            const elementSize = width * 0.02 + Math.random() * width * 0.04;

            const elementColor = this.getDepthColor(depth);
            this.utils.drawEllipse(image, elementX, elementY, elementSize, elementSize * 0.6, elementColor, 0.8);
        }
    }

    async applyDepthEffects(image, depth) {
        const { width, height } = image.bitmap;
        const depthMultiplier = this.depthMultipliers[depth];

        // Apply depth-based blur and transparency
        const blurAmount = (1 - depthMultiplier) * 2;
        const alphaMultiplier = 0.5 + depthMultiplier * 0.5;

        // Simple depth effect - reduce contrast and saturation
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                if (image.bitmap.data[idx + 3] > 0) {
                    image.bitmap.data[idx + 3] = Math.floor(image.bitmap.data[idx + 3] * alphaMultiplier);
                }
            }
        }
    }

    async addMovementIndicators(image, movement, type) {
        const { width, height } = image.bitmap;

        switch (movement) {
            case 'slow_drift':
                // Add gentle drift arrows
                for (let i = 0; i < 3; i++) {
                    const arrowX = width * 0.1 + (i * width * 0.3);
                    const arrowY = height * 0.5;
                    this.utils.drawLine(image, arrowX, arrowY, arrowX + 15, arrowY, 0xFFFFFF, 1);
                    this.utils.drawLine(image, arrowX + 12, arrowY - 3, arrowX + 15, arrowY, 0xFFFFFF, 1);
                    this.utils.drawLine(image, arrowX + 12, arrowY + 3, arrowX + 15, arrowY, 0xFFFFFF, 1);
                }
                break;

            case 'fast_stream':
                // Add fast movement streaks
                for (let i = 0; i < 5; i++) {
                    const streakX = Math.random() * width;
                    const streakY = Math.random() * height;
                    const streakLength = 20 + Math.random() * 30;
                    this.utils.drawLine(image, streakX, streakY, streakX + streakLength, streakY, 0xFFFFFF, 2);
                }
                break;
        }
    }

    async generateSceneryBase(image, type, scale) {
        const { width, height } = image.bitmap;

        switch (type) {
            case 'mountain_range':
                // Generate mountain range
                const peakCount = Math.floor(6 + Math.random() * 8);
                for (let i = 0; i < peakCount; i++) {
                    const peakX = (i / peakCount) * width;
                    const peakHeight = height * 0.2 + Math.random() * height * 0.3;
                    const peakWidth = width * 0.12 + Math.random() * width * 0.08;

                    const peakPoints = [
                        { x: peakX, y: height },
                        { x: peakX + peakWidth * 0.4, y: height - peakHeight * 0.6 },
                        { x: peakX + peakWidth * 0.5, y: height - peakHeight },
                        { x: peakX + peakWidth * 0.6, y: height - peakHeight * 0.7 },
                        { x: peakX + peakWidth, y: height }
                    ];

                    const mountainColor = 0x696969;
                    await this.fillIrregularShape(image, peakPoints, mountainColor);
                }
                break;

            case 'city_skyline':
                // Generate city skyline
                const buildingCount = Math.floor(10 + Math.random() * 15);
                for (let i = 0; i < buildingCount; i++) {
                    const buildingX = (i / buildingCount) * width;
                    const buildingWidth = width * 0.04 + Math.random() * width * 0.06;
                    const buildingHeight = height * 0.15 + Math.random() * height * 0.25;

                    const buildingColor = Math.random() < 0.5 ? 0x696969 : 0x808080;
                    this.utils.drawRectangle(image, buildingX, height - buildingHeight, buildingWidth, buildingHeight, buildingColor);

                    // Add windows
                    const windowRows = Math.floor(buildingHeight / 15);
                    const windowCols = Math.floor(buildingWidth / 8);
                    for (let r = 0; r < windowRows; r++) {
                        for (let c = 0; c < windowCols; c++) {
                            if (Math.random() < 0.7) {
                                const windowX = buildingX + c * 10 + 2;
                                const windowY = height - buildingHeight + r * 12 + 2;
                                this.utils.drawRectangle(image, windowX, windowY, 6, 8, 0xFFFF00);
                            }
                        }
                    }
                }
                break;

            case 'ocean_horizon':
                // Generate ocean horizon
                const waveCount = Math.floor(8 + Math.random() * 8);
                for (let i = 0; i < waveCount; i++) {
                    const waveX = (i / waveCount) * width;
                    const waveAmplitude = height * 0.05 + Math.random() * height * 0.08;

                    // Draw wave shape
                    const wavePoints = [];
                    for (let w = 0; w <= 10; w++) {
                        const waveProgress = w / 10;
                        const waveHeight = Math.sin(waveProgress * Math.PI) * waveAmplitude;
                        wavePoints.push({
                            x: waveX + waveProgress * width * 0.12,
                            y: height * 0.7 + waveHeight
                        });
                    }

                    const oceanColor = 0x4169E1;
                    await this.fillIrregularShape(image, wavePoints, oceanColor);
                }
                break;
        }
    }

    async addSceneryDetails(image, type, detail, scale) {
        const { width, height } = image.bitmap;

        switch (detail) {
            case 'textured':
                // Add texture details
                for (let i = 0; i < 50; i++) {
                    const detailX = Math.random() * width;
                    const detailY = height * 0.6 + Math.random() * height * 0.4;
                    const detailSize = 1 + Math.random() * 2;

                    this.utils.drawEllipse(image, detailX, detailY, detailSize, detailSize, 0x808080, 0.6);
                }
                break;

            case 'detailed':
                // Add detailed elements
                const detailCount = Math.floor(20 + Math.random() * 20);
                for (let i = 0; i < detailCount; i++) {
                    const detailX = Math.random() * width;
                    const detailY = height * 0.65 + Math.random() * height * 0.35;
                    const detailSize = 2 + Math.random() * 3;

                    const detailColor = Math.random() < 0.5 ? 0x696969 : 0xA9A9A9;
                    this.utils.drawEllipse(image, detailX, detailY, detailSize, detailSize, detailColor);
                }
                break;
        }
    }

    async applySceneryComposition(image, composition, type) {
        // Apply composition-based layout adjustments
        // This would involve repositioning elements based on composition rules
        // For now, just ensure good distribution
    }

    async addSceneryAtmosphere(image, scale) {
        const { width, height } = image.bitmap;

        // Add atmospheric perspective based on scale
        const hazeAmount = scale === 'distant' ? 0.3 : scale === 'very_distant' ? 0.5 : 0.1;

        if (hazeAmount > 0) {
            for (let y = 0; y < height; y++) {
                const hazeAlpha = hazeAmount * (y / height);
                for (let x = 0; x < width; x += 3) {
                    const idx = (y * width + x) * 4;
                    if (image.bitmap.data[idx + 3] > 0) {
                        image.bitmap.data[idx + 3] = Math.max(0, image.bitmap.data[idx + 3] - hazeAlpha * 150);
                    }
                }
            }
        }
    }

    getDepthColor(depth) {
        switch (depth) {
            case 'very_distant':
                return 0xD3D3D3;
            case 'distant':
                return 0xA9A9A9;
            case 'mid_ground':
                return 0x808080;
            case 'near':
                return 0x696969;
            case 'very_near':
                return 0x2F2F2F;
            default:
                return 0x808080;
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

        // Simple fill - for each point in bounding box, check if inside shape
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (this.isPointInPolygon(x, y, points)) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx] = (color >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = color & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }
    }

    isPointInPolygon(x, y, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            if (((polygon[i].y > y) !== (polygon[j].y > y)) &&
                (x < (polygon[j].x - polygon[i].x) * (y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
                inside = !inside;
            }
        }
        return inside;
    }
}

module.exports = BackgroundElementsGenerator;
