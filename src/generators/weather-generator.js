/**
 * Weather Effects Generator - Rain, snow, lightning, clouds, fog particles
 * Handles generation of atmospheric and weather-related visual effects
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class WeatherGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Weather effect database
        this.weatherDatabase = {
            rain: {
                name: 'Rain',
                intensity: { light: 0.3, moderate: 0.6, heavy: 1.0 },
                colors: ['#87CEEB', '#4682B4', '#4169E1'],
                particleCount: { min: 20, max: 100 },
                speed: { min: 2, max: 8 }
            },
            snow: {
                name: 'Snow',
                intensity: { light: 0.2, moderate: 0.5, heavy: 0.8 },
                colors: ['#FFFFFF', '#F8F8FF', '#E6E6FA'],
                particleCount: { min: 15, max: 80 },
                speed: { min: 1, max: 4 }
            },
            fog: {
                name: 'Fog',
                density: { light: 0.3, moderate: 0.6, thick: 0.9 },
                colors: ['#D3D3D3', '#A9A9A9', '#808080'],
                layers: { min: 3, max: 8 }
            },
            clouds: {
                name: 'Clouds',
                types: ['cumulus', 'stratus', 'cirrus', 'nimbus'],
                density: { sparse: 0.2, moderate: 0.5, dense: 0.8 },
                colors: ['#FFFFFF', '#F5F5F5', '#E8E8E8']
            },
            lightning: {
                name: 'Lightning',
                intensity: { mild: 0.4, moderate: 0.7, severe: 1.0 },
                colors: ['#FFFF00', '#FFA500', '#FFFFFF'],
                branches: { min: 2, max: 6 }
            },
            hail: {
                name: 'Hail',
                size: { small: 2, medium: 4, large: 6 },
                colors: ['#F0F8FF', '#E6E6FA', '#FFFFFF'],
                particleCount: { min: 10, max: 50 }
            },
            wind: {
                name: 'Wind',
                strength: { gentle: 0.3, moderate: 0.6, strong: 1.0 },
                direction: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'],
                effects: ['leaves', 'dust', 'ripples']
            }
        };

        // Particle system for weather effects
        this.particleSystem = {
            gravity: 0.1,
            windForce: 0.05,
            turbulence: 0.02,
            lifetime: { min: 100, max: 300 }
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine weather type and generate accordingly
        const weatherType = config.weatherType || 'rain';
        const subType = config.subType || 'moderate';

        switch (weatherType) {
            case 'rain':
                await this.generateRain(image, config);
                break;
            case 'snow':
                await this.generateSnow(image, config);
                break;
            case 'fog':
                await this.generateFog(image, config);
                break;
            case 'clouds':
                await this.generateClouds(image, config);
                break;
            case 'lightning':
                await this.generateLightning(image, config);
                break;
            case 'hail':
                await this.generateHail(image, config);
                break;
            case 'wind':
                await this.generateWind(image, config);
                break;
            default:
                await this.generateRain(image, config);
        }
    }

    /**
     * Generate rain effect
     */
    async generateRain(image, config) {
        const { width, height } = image.bitmap;
        const intensity = config.intensity || 'moderate';
        const rainData = this.weatherDatabase.rain;

        const particleCount = Math.floor(rainData.particleCount.min +
            (rainData.particleCount.max - rainData.particleCount.min) * rainData.intensity[intensity]);
        const rainColor = this.utils.getColor(rainData.colors[Math.floor(Math.random() * rainData.colors.length)]);

        // Generate raindrops
        for (let i = 0; i < particleCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const length = Math.floor(8 + Math.random() * 12);
            const thickness = Math.floor(1 + Math.random() * 2);

            // Draw raindrop as a diagonal line
            await this.drawRaindrop(image, x, y, length, thickness, rainColor);
        }

        // Add splash effects at the bottom
        if (intensity !== 'light') {
            await this.addRainSplashes(image, Math.floor(particleCount * 0.3), rainColor);
        }
    }

    /**
     * Draw a single raindrop
     */
    async drawRaindrop(image, x, y, length, thickness, color) {
        const { width, height } = image.bitmap;

        for (let i = 0; i < length; i++) {
            const dropX = x + Math.floor(i * 0.7); // Slight diagonal
            const dropY = y + i;

            if (dropX >= 0 && dropX < width && dropY >= 0 && dropY < height) {
                for (let t = 0; t < thickness; t++) {
                    const pixelX = dropX + t;
                    if (pixelX >= 0 && pixelX < width) {
                        const idx = (dropY * width + pixelX) * 4;
                        image.bitmap.data[idx] = (color >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = color & 0xFF;
                        image.bitmap.data[idx + 3] = Math.floor(180 + Math.random() * 75); // Vary opacity
                    }
                }
            }
        }
    }

    /**
     * Add rain splash effects
     */
    async addRainSplashes(image, splashCount, color) {
        const { width, height } = image.bitmap;

        for (let i = 0; i < splashCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = height - Math.floor(Math.random() * 20) - 5; // Near bottom
            const splashSize = Math.floor(3 + Math.random() * 5);

            // Draw splash as small circles radiating outward
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI * 0.25) {
                const splashX = x + Math.cos(angle) * splashSize;
                const splashY = y + Math.sin(angle) * splashSize;

                if (splashX >= 0 && splashX < width && splashY >= 0 && splashY < height) {
                    const idx = (Math.floor(splashY) * width + Math.floor(splashX)) * 4;
                    image.bitmap.data[idx] = (color >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = color & 0xFF;
                    image.bitmap.data[idx + 3] = Math.floor(100 + Math.random() * 100);
                }
            }
        }
    }

    /**
     * Generate snow effect
     */
    async generateSnow(image, config) {
        const { width, height } = image.bitmap;
        const intensity = config.intensity || 'moderate';
        const snowData = this.weatherDatabase.snow;

        const particleCount = Math.floor(snowData.particleCount.min +
            (snowData.particleCount.max - snowData.particleCount.min) * snowData.intensity[intensity]);
        const snowColor = this.utils.getColor(snowData.colors[Math.floor(Math.random() * snowData.colors.length)]);

        // Generate snowflakes
        for (let i = 0; i < particleCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const size = Math.floor(2 + Math.random() * 4);

            // Draw snowflake
            await this.drawSnowflake(image, x, y, size, snowColor);
        }

        // Add ground accumulation
        if (intensity === 'heavy') {
            await this.addSnowAccumulation(image, snowColor);
        }
    }

    /**
     * Draw a snowflake
     */
    async drawSnowflake(image, centerX, centerY, size, color) {
        const { width, height } = image.bitmap;

        // Simple snowflake pattern
        const arms = 6;
        for (let arm = 0; arm < arms; arm++) {
            const angle = (arm * Math.PI * 2) / arms;

            // Main arm
            for (let i = 0; i < size; i++) {
                const x = centerX + Math.cos(angle) * i;
                const y = centerY + Math.sin(angle) * i;

                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                    image.bitmap.data[idx] = (color >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = color & 0xFF;
                    image.bitmap.data[idx + 3] = Math.floor(200 + Math.random() * 55);
                }
            }

            // Side branches
            for (let branch = 1; branch <= 2; branch++) {
                const branchAngle = angle + (branch % 2 === 0 ? Math.PI * 0.3 : -Math.PI * 0.3);
                const branchLength = size * 0.4;

                for (let i = 0; i < branchLength; i++) {
                    const x = centerX + Math.cos(branchAngle) * i;
                    const y = centerY + Math.sin(branchAngle) * i;

                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                        image.bitmap.data[idx] = (color >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = color & 0xFF;
                        image.bitmap.data[idx + 3] = Math.floor(150 + Math.random() * 105);
                    }
                }
            }
        }

        // Center dot
        if (centerX >= 0 && centerX < width && centerY >= 0 && centerY < height) {
            const idx = (centerY * width + centerX) * 4;
            image.bitmap.data[idx] = (color >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = color & 0xFF;
            image.bitmap.data[idx + 3] = 255;
        }
    }

    /**
     * Add snow accumulation on ground
     */
    async addSnowAccumulation(image, snowColor) {
        const { width, height } = image.bitmap;
        const accumulationHeight = Math.floor(height * 0.1);

        for (let y = height - accumulationHeight; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < 0.7) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx] = (snowColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (snowColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = snowColor & 0xFF;
                    image.bitmap.data[idx + 3] = Math.floor(150 + Math.random() * 105);
                }
            }
        }
    }

    /**
     * Generate fog effect
     */
    async generateFog(image, config) {
        const { width, height } = image.bitmap;
        const density = config.density || 'moderate';
        const fogData = this.weatherDatabase.fog;

        const layerCount = Math.floor(fogData.layers.min +
            (fogData.layers.max - fogData.layers.min) * fogData.density[density]);
        const fogColor = this.utils.getColor(fogData.colors[Math.floor(Math.random() * fogData.colors.length)]);

        // Generate fog layers
        for (let layer = 0; layer < layerCount; layer++) {
            const layerY = Math.floor((layer / layerCount) * height);
            const layerHeight = Math.floor(height / layerCount);
            const opacity = Math.floor(50 + (layer / layerCount) * 100);

            // Create cloud-like shapes for fog
            await this.generateFogLayer(image, layerY, layerHeight, fogColor, opacity, density);
        }
    }

    /**
     * Generate a single fog layer
     */
    async generateFogLayer(image, startY, layerHeight, color, baseOpacity, density) {
        const { width, height } = image.bitmap;
        const endY = Math.min(startY + layerHeight, height);

        for (let y = startY; y < endY; y++) {
            for (let x = 0; x < width; x++) {
                // Create organic fog pattern
                const noise = this.generateNoise(x * 0.01, y * 0.01, density === 'thick' ? 3 : 2);
                const opacity = Math.floor(baseOpacity * noise);

                if (opacity > 20) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx] = (color >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = color & 0xFF;
                    image.bitmap.data[idx + 3] = opacity;
                }
            }
        }
    }

    /**
     * Generate clouds
     */
    async generateClouds(image, config) {
        const { width, height } = image.bitmap;
        const cloudType = config.cloudType || 'cumulus';
        const density = config.density || 'moderate';
        const cloudData = this.weatherDatabase.clouds;

        const cloudCount = Math.floor(3 + density === 'dense' ? 5 : density === 'sparse' ? 1 : 3);
        const cloudColor = this.utils.getColor(cloudData.colors[Math.floor(Math.random() * cloudData.colors.length)]);

        for (let i = 0; i < cloudCount; i++) {
            const cloudX = Math.floor(Math.random() * width);
            const cloudY = Math.floor(height * 0.1 + Math.random() * height * 0.3);
            const cloudSize = Math.floor(width * (0.2 + Math.random() * 0.3));

            await this.generateCloud(image, cloudX, cloudY, cloudSize, cloudColor, cloudType);
        }
    }

    /**
     * Generate a single cloud
     */
    async generateCloud(image, centerX, centerY, size, color, type) {
        const { width, height } = image.bitmap;
        const puffCount = type === 'cirrus' ? 8 : type === 'stratus' ? 12 : 6;

        for (let i = 0; i < puffCount; i++) {
            const angle = (i * Math.PI * 2) / puffCount;
            const distance = size * (0.3 + Math.random() * 0.7);
            const puffX = centerX + Math.cos(angle) * distance;
            const puffY = centerY + Math.sin(angle) * distance;
            const puffSize = size * (0.2 + Math.random() * 0.3);

            // Draw cloud puff
            this.utils.drawEllipse(image, puffX, puffY, puffSize * 0.5, puffSize * 0.4, color);

            // Add some smaller puffs for more realistic shape
            for (let j = 0; j < 3; j++) {
                const smallAngle = angle + (Math.random() - 0.5) * Math.PI * 0.5;
                const smallDistance = distance * (0.8 + Math.random() * 0.4);
                const smallX = centerX + Math.cos(smallAngle) * smallDistance;
                const smallY = centerY + Math.sin(smallAngle) * smallDistance;
                const smallSize = puffSize * (0.3 + Math.random() * 0.4);

                this.utils.drawEllipse(image, smallX, smallY, smallSize * 0.5, smallSize * 0.4, color);
            }
        }
    }

    /**
     * Generate lightning effect
     */
    async generateLightning(image, config) {
        const { width, height } = image.bitmap;
        const intensity = config.intensity || 'moderate';
        const lightningData = this.weatherDatabase.lightning;

        const boltCount = intensity === 'severe' ? 3 : intensity === 'mild' ? 1 : 2;
        const lightningColor = this.utils.getColor(lightningData.colors[Math.floor(Math.random() * lightningData.colors.length)]);

        for (let i = 0; i < boltCount; i++) {
            const startX = Math.floor(Math.random() * width);
            const startY = 0;
            const endX = startX + Math.floor((Math.random() - 0.5) * width * 0.3);
            const endY = height;

            await this.generateLightningBolt(image, startX, startY, endX, endY, lightningColor, intensity);
        }

        // Add lightning glow
        await this.addLightningGlow(image, lightningColor);
    }

    /**
     * Generate a single lightning bolt
     */
    async generateLightningBolt(image, startX, startY, endX, endY, color, intensity) {
        const { width, height } = image.bitmap;
        const segments = intensity === 'severe' ? 15 : intensity === 'mild' ? 8 : 12;

        let currentX = startX;
        let currentY = startY;

        for (let i = 0; i < segments; i++) {
            const progress = i / segments;
            const targetX = startX + (endX - startX) * progress;
            const targetY = startY + (endY - startY) * progress;

            // Add some zigzag
            const zigzag = (Math.random() - 0.5) * 20;
            const nextX = targetX + zigzag;
            const nextY = targetY;

            // Draw segment
            await this.drawLightningSegment(image, currentX, currentY, nextX, nextY, color);

            currentX = nextX;
            currentY = nextY;

            // Add branches occasionally
            if (Math.random() < 0.3 && intensity !== 'mild') {
                const branchLength = Math.floor(10 + Math.random() * 20);
                const branchAngle = (Math.random() - 0.5) * Math.PI * 0.5;
                const branchEndX = currentX + Math.cos(branchAngle) * branchLength;
                const branchEndY = currentY + Math.sin(branchAngle) * branchLength;

                await this.drawLightningSegment(image, currentX, currentY, branchEndX, branchEndY, color);
            }
        }
    }

    /**
     * Draw lightning segment
     */
    async drawLightningSegment(image, x1, y1, x2, y2, color) {
        const { width, height } = image.bitmap;
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const steps = Math.floor(distance);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;

            if (x >= 0 && x < width && y >= 0 && y < height) {
                // Draw thicker line for lightning
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const pixelX = Math.floor(x) + dx;
                        const pixelY = Math.floor(y) + dy;

                        if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                            const idx = (pixelY * width + pixelX) * 4;
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

    /**
     * Add lightning glow effect
     */
    async addLightningGlow(image, lightningColor) {
        const { width, height } = image.bitmap;

        // Create a subtle glow around bright areas
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = image.bitmap.data[idx];
                const g = image.bitmap.data[idx + 1];
                const b = image.bitmap.data[idx + 2];

                // If pixel is bright (lightning), add glow to neighbors
                if (r > 200 && g > 200 && b > 200) {
                    for (let dy = -2; dy <= 2; dy++) {
                        for (let dx = -2; dx <= 2; dx++) {
                            const glowX = x + dx;
                            const glowY = y + dy;

                            if (glowX >= 0 && glowX < width && glowY >= 0 && glowY < height) {
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                if (distance <= 2) {
                                    const glowIdx = (glowY * width + glowX) * 4;
                                    const glowOpacity = Math.floor(50 * (1 - distance / 2));

                                    if (glowOpacity > 0) {
                                        image.bitmap.data[glowIdx] = Math.max(image.bitmap.data[glowIdx], (lightningColor >> 16) & 0xFF);
                                        image.bitmap.data[glowIdx + 1] = Math.max(image.bitmap.data[glowIdx + 1], (lightningColor >> 8) & 0xFF);
                                        image.bitmap.data[glowIdx + 2] = Math.max(image.bitmap.data[glowIdx + 2], lightningColor & 0xFF);
                                        image.bitmap.data[glowIdx + 3] = Math.max(image.bitmap.data[glowIdx + 3], glowOpacity);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Generate hail effect
     */
    async generateHail(image, config) {
        const { width, height } = image.bitmap;
        const size = config.size || 'medium';
        const hailData = this.weatherDatabase.hail;

        const particleCount = Math.floor(hailData.particleCount.min +
            (hailData.particleCount.max - hailData.particleCount.min) * Math.random());
        const hailColor = this.utils.getColor(hailData.colors[Math.floor(Math.random() * hailData.colors.length)]);
        const hailSize = hailData.size[size];

        // Generate hailstones
        for (let i = 0; i < particleCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);

            // Draw hailstone as a circle with highlight
            this.utils.drawEllipse(image, x, y, hailSize, hailSize, hailColor);

            // Add highlight
            const highlightColor = this.utils.adjustBrightness(hailColor, 50);
            this.utils.drawEllipse(image, x - hailSize * 0.3, y - hailSize * 0.3, hailSize * 0.4, hailSize * 0.4, highlightColor);
        }
    }

    /**
     * Generate wind effect
     */
    async generateWind(image, config) {
        const { width, height } = image.bitmap;
        const strength = config.strength || 'moderate';
        const direction = config.direction || 'east';
        const windData = this.weatherDatabase.wind;

        // Add wind lines/particles
        const particleCount = Math.floor(10 + windData.strength[strength] * 20);

        for (let i = 0; i < particleCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const length = Math.floor(5 + Math.random() * 15);

            // Draw wind streak based on direction
            let endX = x;
            let endY = y;

            switch (direction) {
                case 'east':
                    endX = x + length;
                    break;
                case 'west':
                    endX = x - length;
                    break;
                case 'north':
                    endY = y - length;
                    break;
                case 'south':
                    endY = y + length;
                    break;
                case 'northeast':
                    endX = x + length;
                    endY = y - length;
                    break;
                case 'northwest':
                    endX = x - length;
                    endY = y - length;
                    break;
                case 'southeast':
                    endX = x + length;
                    endY = y + length;
                    break;
                case 'southwest':
                    endX = x - length;
                    endY = y + length;
                    break;
            }

            const windColor = this.utils.getColor('#E6E6FA'); // Light lavender
            await this.drawWindStreak(image, x, y, endX, endY, windColor);
        }

        // Add wind effects to existing elements
        if (config.effects) {
            for (const effect of config.effects) {
                switch (effect) {
                    case 'leaves':
                        await this.addWindLeaves(image, direction, strength);
                        break;
                    case 'dust':
                        await this.addWindDust(image, direction, strength);
                        break;
                    case 'ripples':
                        await this.addWindRipples(image, direction, strength);
                        break;
                }
            }
        }
    }

    /**
     * Draw wind streak
     */
    async drawWindStreak(image, x1, y1, x2, y2, color) {
        const { width, height } = image.bitmap;
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const steps = Math.floor(distance);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;

            if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                image.bitmap.data[idx] = (color >> 16) & 0xFF;
                image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                image.bitmap.data[idx + 2] = color & 0xFF;
                image.bitmap.data[idx + 3] = Math.floor(100 + Math.random() * 100);
            }
        }
    }

    /**
     * Add wind-blown leaves
     */
    async addWindLeaves(image, direction, strength) {
        const { width, height } = image.bitmap;
        const leafCount = Math.floor(5 + strength === 'strong' ? 10 : strength === 'gentle' ? 2 : 5);

        for (let i = 0; i < leafCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const leafColor = this.utils.getColor(['#228B22', '#32CD32', '#006400', '#8FBC8F'][Math.floor(Math.random() * 4)]);

            // Draw simple leaf shape
            this.utils.drawEllipse(image, x, y, 3, 5, leafColor);
            this.utils.drawEllipse(image, x + 2, y - 1, 2, 3, leafColor);
        }
    }

    /**
     * Add wind-blown dust
     */
    async addWindDust(image, direction, strength) {
        const { width, height } = image.bitmap;
        const dustCount = Math.floor(15 + strength === 'strong' ? 20 : strength === 'gentle' ? 5 : 10);

        for (let i = 0; i < dustCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const dustColor = this.utils.getColor('#D2B48C'); // Tan

            // Draw small dust particles
            this.utils.drawEllipse(image, x, y, 1, 1, dustColor);
        }
    }

    /**
     * Add wind-created ripples
     */
    async addWindRipples(image, direction, strength) {
        const { width, height } = image.bitmap;
        const rippleCount = Math.floor(8 + strength === 'strong' ? 12 : strength === 'gentle' ? 3 : 6);

        for (let i = 0; i < rippleCount; i++) {
            const centerX = Math.floor(Math.random() * width);
            const centerY = Math.floor(height * 0.8 + Math.random() * height * 0.2); // Near ground
            const rippleColor = this.utils.getColor('#4682B4'); // Steel blue

            // Draw concentric ripple circles
            for (let radius = 5; radius <= 15; radius += 3) {
                const opacity = Math.floor(255 * (1 - radius / 15));
                if (opacity > 0) {
                    // Draw circle outline
                    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                        const x = centerX + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius;

                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                            image.bitmap.data[idx] = (rippleColor >> 16) & 0xFF;
                            image.bitmap.data[idx + 1] = (rippleColor >> 8) & 0xFF;
                            image.bitmap.data[idx + 2] = rippleColor & 0xFF;
                            image.bitmap.data[idx + 3] = opacity;
                        }
                    }
                }
            }
        }
    }

    /**
     * Generate noise for organic effects
     */
    generateNoise(x, y, octaves = 2) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;

        for (let i = 0; i < octaves; i++) {
            value += Math.sin(x * frequency) * Math.cos(y * frequency) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return (value + 1) * 0.5; // Normalize to 0-1
    }

    /**
     * Generate weather particle system
     */
    generateParticleSystem(config) {
        const particles = [];
        const particleCount = config.particleCount || 50;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * (config.width || 256),
                y: Math.random() * (config.height || 256),
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2,
                life: Math.random() * 100,
                maxLife: 100,
                size: Math.random() * 3 + 1,
                color: config.particleColor || '#FFFFFF'
            });
        }

        return particles;
    }

    /**
     * Update particle system
     */
    updateParticles(particles, deltaTime) {
        for (const particle of particles) {
            // Apply gravity
            particle.vy += this.particleSystem.gravity * deltaTime;

            // Apply wind
            particle.vx += this.particleSystem.windForce * deltaTime;

            // Add turbulence
            particle.vx += (Math.random() - 0.5) * this.particleSystem.turbulence;
            particle.vy += (Math.random() - 0.5) * this.particleSystem.turbulence;

            // Update position
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;

            // Update life
            particle.life -= deltaTime;
        }

        // Remove dead particles
        return particles.filter(p => p.life > 0);
    }
}

module.exports = WeatherGenerator;
