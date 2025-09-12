/**
 * Particle Animation Generator - Complex particle systems and effects
 * Handles generation of animated particle systems for explosions, magic, weather, and special effects
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class ParticleAnimationGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Particle system database
        this.particleSystemsDatabase = {
            explosions: {
                name: 'Explosions',
                types: ['fireball_explosion', 'grenade_blast', 'magic_burst', 'nuclear_detonation', 'chemical_reaction', 'electrical_discharge', 'plasma_burst', 'ice_shatter', 'rock_fragmentation', 'energy_wave'],
                particle_types: ['fire', 'smoke', 'sparks', 'debris', 'energy', 'dust', 'plasma', 'ice', 'rock', 'lightning'],
                effects: ['shockwave', 'fire_trail', 'smoke_cloud', 'spark_shower', 'debris_field', 'energy_rings', 'plasma_cloud', 'ice_crystals', 'rock_shrapnel', 'lightning_arcs'],
                frame_counts: { fireball_explosion: 12, grenade_blast: 10, magic_burst: 15, nuclear_detonation: 20, chemical_reaction: 16, electrical_discharge: 8, plasma_burst: 14, ice_shatter: 11, rock_fragmentation: 13, energy_wave: 18 }
            },
            magic_effects: {
                name: 'Magic Effects',
                types: ['fire_spell', 'ice_spell', 'lightning_spell', 'healing_spell', 'shield_spell', 'teleport_spell', 'summon_spell', 'curse_spell', 'blessing_spell', 'enchantment_spell'],
                particle_types: ['energy', 'sparkle', 'mist', 'rune', 'aura', 'orb', 'beam', 'wave', 'swirl', 'glyph'],
                effects: ['casting_glow', 'spell_trail', 'magic_circle', 'energy_burst', 'aura_field', 'rune_activation', 'beam_stream', 'wave_pulse', 'swirl_vortex', 'glyph_pattern'],
                frame_counts: { fire_spell: 14, ice_spell: 12, lightning_spell: 16, healing_spell: 10, shield_spell: 8, teleport_spell: 18, summon_spell: 20, curse_spell: 13, blessing_spell: 11, enchantment_spell: 15 }
            },
            weather_effects: {
                name: 'Weather Effects',
                types: ['rain_storm', 'snow_fall', 'wind_gust', 'lightning_strike', 'fog_roll', 'dust_storm', 'hail_stones', 'tornado', 'rainbow_arc', 'aurora_borealis'],
                particle_types: ['raindrop', 'snowflake', 'wind_particle', 'lightning_bolt', 'fog_particle', 'dust_mote', 'hail_stone', 'tornado_vortex', 'rainbow_ray', 'aurora_wave'],
                effects: ['downpour', 'blizzard', 'gale_force', 'thunder_clap', 'mist_shroud', 'sand_blast', 'ice_impact', 'funnel_cloud', 'prismatic_beam', 'northern_lights'],
                frame_counts: { rain_storm: 24, snow_fall: 30, wind_gust: 12, lightning_strike: 8, fog_roll: 36, dust_storm: 20, hail_stones: 16, tornado: 28, rainbow_arc: 22, aurora_borealis: 32 }
            },
            environmental_effects: {
                name: 'Environmental Effects',
                types: ['campfire_smoke', 'waterfall_mist', 'volcano_eruption', 'forest_fire', 'ocean_spray', 'desert_oasis', 'mountain_peak', 'cave_crystal', 'swamp_gas', 'coral_reef'],
                particle_types: ['smoke', 'mist', 'ash', 'ember', 'spray', 'steam', 'dust', 'sparkle', 'bubble', 'glow'],
                effects: ['rising_smoke', 'falling_mist', 'erupting_ash', 'floating_embers', 'crashing_spray', 'rising_steam', 'swirling_dust', 'dancing_sparkles', 'bubbling_water', 'pulsing_glow'],
                frame_counts: { campfire_smoke: 25, waterfall_mist: 20, volcano_eruption: 18, forest_fire: 22, ocean_spray: 16, desert_oasis: 14, mountain_peak: 12, cave_crystal: 19, swamp_gas: 21, coral_reef: 24 }
            }
        };

        // Particle physics properties
        this.particlePhysics = {
            gravity: { x: 0, y: 0.1 },
            wind: { x: 0.05, y: 0 },
            friction: 0.98,
            bounce: 0.6,
            life_decay: 0.95,
            size_decay: 0.98,
            alpha_decay: 0.96
        };

        // Color palettes for different effects
        this.effectColors = {
            fire: [0xFF4500, 0xFF6347, 0xFFD700, 0xFFFF00, 0xFFFFFF],
            ice: [0xE0FFFF, 0xB0E0E6, 0x87CEEB, 0x4682B4, 0x4169E1],
            lightning: [0xE6E6FA, 0xDDA0DD, 0xDA70D6, 0x9370DB, 0x8A2BE2],
            magic: [0x9370DB, 0x8A2BE2, 0x9932CC, 0xBA55D3, 0xDA70D6],
            blood: [0xDC143C, 0x8B0000, 0xFF0000, 0xFF6347, 0xFFA07A],
            smoke: [0x696969, 0x808080, 0xA9A9A9, 0xC0C0C0, 0xD3D3D3],
            dust: [0xDEB887, 0xD2B48C, 0xBC8F8F, 0xCD853F, 0xD2691E],
            energy: [0x00CED1, 0x48D1CC, 0x20B2AA, 0x008B8B, 0x008080],
            water: [0x4169E1, 0x00BFFF, 0x87CEEB, 0xE0FFFF, 0xF0F8FF],
            earth: [0x8B4513, 0x696969, 0x228B22, 0xDEB887, 0xD2B48C]
        };

        // Particle shapes
        this.particleShapes = {
            circle: 'circle',
            square: 'square',
            triangle: 'triangle',
            star: 'star',
            diamond: 'diamond',
            ring: 'ring',
            spark: 'spark',
            leaf: 'leaf',
            crystal: 'crystal',
            orb: 'orb'
        };

        // Animation curves for different effects
        this.animationCurves = {
            linear: (t) => t,
            ease_in: (t) => t * t,
            ease_out: (t) => 1 - Math.pow(1 - t, 2),
            ease_in_out: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
            bounce: (t) => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) return n1 * t * t;
                else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
                else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
                else return n1 * (t -= 2.625 / d1) * t + 0.984375;
            },
            elastic: (t) => {
                const c4 = (2 * Math.PI) / 3;
                return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
            }
        };
    }

    /**
     * Main particle animation generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine particle system type and generate accordingly
        const systemType = config.systemType || 'explosions';
        const subType = config.subType || 'fireball_explosion';
        const frameCount = config.frameCount || 12;

        switch (systemType) {
            case 'explosions':
                return await this.generateExplosionAnimation(image, config);
            case 'magic_effects':
                return await this.generateMagicAnimation(image, config);
            case 'weather_effects':
                return await this.generateWeatherAnimation(image, config);
            case 'environmental_effects':
                return await this.generateEnvironmentalAnimation(image, config);
            default:
                return await this.generateExplosionAnimation(image, config);
        }
    }

    /**
     * Generate explosion animation sequence
     */
    async generateExplosionAnimation(image, config) {
        const { width, height } = image.bitmap;
        const type = config.explosionType || 'fireball_explosion';
        const particleType = config.particleType || 'fire';
        const effect = config.effect || 'shockwave';
        const frameCount = config.frameCount || this.particleSystemsDatabase.explosions.frame_counts[type];

        const frames = [];

        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            const frameImage = new Jimp(width, height);

            // Copy base image
            image.scan(0, 0, width, height, function(x, y, idx) {
                frameImage.bitmap.data[idx] = this.bitmap.data[idx];
                frameImage.bitmap.data[idx + 1] = this.bitmap.data[idx + 1];
                frameImage.bitmap.data[idx + 2] = this.bitmap.data[idx + 2];
                frameImage.bitmap.data[idx + 3] = this.bitmap.data[idx + 3];
            });

            // Apply explosion animation transformations
            await this.applyExplosionFrame(frameImage, type, particleType, effect, frameIndex, frameCount);

            frames.push(frameImage);
        }

        return frames;
    }

    /**
     * Apply explosion frame transformations
     */
    async applyExplosionFrame(image, type, particleType, effect, frameIndex, totalFrames) {
        const { width, height } = image.bitmap;
        const progress = frameIndex / (totalFrames - 1);
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Calculate explosion radius based on progress
        const maxRadius = Math.min(width, height) * 0.4;
        const currentRadius = this.animationCurves.ease_out(progress) * maxRadius;

        // Generate particles based on explosion type
        switch (type) {
            case 'fireball_explosion':
                await this.generateFireballExplosion(image, centerX, centerY, currentRadius, progress, particleType);
                break;
            case 'grenade_blast':
                await this.generateGrenadeBlast(image, centerX, centerY, currentRadius, progress, particleType);
                break;
            case 'magic_burst':
                await this.generateMagicBurst(image, centerX, centerY, currentRadius, progress, particleType);
                break;
            case 'nuclear_detonation':
                await this.generateNuclearDetonation(image, centerX, centerY, currentRadius, progress, particleType);
                break;
            case 'electrical_discharge':
                await this.generateElectricalDischarge(image, centerX, centerY, currentRadius, progress, particleType);
                break;
            default:
                await this.generateGenericExplosion(image, centerX, centerY, currentRadius, progress, particleType);
        }

        // Apply effect-specific enhancements
        await this.applyExplosionEffect(image, effect, progress, centerX, centerY, currentRadius);
    }

    /**
     * Generate fireball explosion particles
     */
    async generateFireballExplosion(image, centerX, centerY, radius, progress, particleType) {
        const particleCount = Math.floor(50 * (1 - progress * 0.5));

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * radius;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;

            // Fire particle with varying size and color
            const size = Math.max(1, Math.floor((1 - progress) * 6));
            const colorIndex = Math.floor(Math.random() * this.effectColors.fire.length);
            const color = this.effectColors.fire[colorIndex];

            this.utils.drawEllipse(image, particleX, particleY, size, size, color);

            // Add fire trail
            if (Math.random() < 0.3) {
                const trailLength = Math.random() * 10;
                for (let t = 0; t < trailLength; t++) {
                    const trailX = particleX - Math.cos(angle) * t * 2;
                    const trailY = particleY - Math.sin(angle) * t * 2;
                    const trailAlpha = Math.max(0, 1 - t / trailLength);
                    this.utils.drawEllipse(image, trailX, trailY, size * 0.5, size * 0.5, color, trailAlpha);
                }
            }
        }

        // Add smoke particles
        const smokeCount = Math.floor(20 * progress);
        for (let i = 0; i < smokeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.8;
            const smokeX = centerX + Math.cos(angle) * distance;
            const smokeY = centerY + Math.sin(angle) * distance;

            const smokeColor = this.effectColors.smoke[Math.floor(Math.random() * this.effectColors.smoke.length)];
            this.utils.drawEllipse(image, smokeX, smokeY, 4, 4, smokeColor, 0.6);
        }
    }

    /**
     * Generate grenade blast particles
     */
    async generateGrenadeBlast(image, centerX, centerY, radius, progress, particleType) {
        const particleCount = Math.floor(80 * (1 - progress * 0.3));

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
            const distance = Math.random() * radius;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;

            // Shrapnel/debris particles
            const size = Math.max(1, Math.floor((1 - progress) * 4));
            const color = Math.random() < 0.7 ? 0x696969 : 0x8B4513; // Metal or wood

            this.utils.drawEllipse(image, particleX, particleY, size, size, color);

            // Add debris trails
            if (Math.random() < 0.4) {
                const trailLength = Math.random() * 8;
                for (let t = 0; t < trailLength; t++) {
                    const trailX = particleX - Math.cos(angle) * t * 1.5;
                    const trailY = particleY - Math.sin(angle) * t * 1.5;
                    this.utils.drawEllipse(image, trailX, trailY, size * 0.3, size * 0.3, color, 0.8 - t / trailLength);
                }
            }
        }

        // Add shockwave ring
        if (progress > 0.3 && progress < 0.7) {
            const ringRadius = radius * (progress - 0.3) / 0.4;
            const ringThickness = Math.max(1, Math.floor(ringRadius * 0.1));

            for (let r = ringRadius - ringThickness; r <= ringRadius + ringThickness; r++) {
                const circumference = Math.floor(r * Math.PI * 2);
                for (let i = 0; i < circumference; i += 2) {
                    const angle = (i / circumference) * Math.PI * 2;
                    const ringX = centerX + Math.cos(angle) * r;
                    const ringY = centerY + Math.sin(angle) * r;
                    this.utils.drawEllipse(image, ringX, ringY, 1, 1, 0xFFFFFF, 0.7);
                }
            }
        }
    }

    /**
     * Generate magic burst particles
     */
    async generateMagicBurst(image, centerX, centerY, radius, progress, particleType) {
        const particleCount = Math.floor(60 * (1 - progress * 0.4));

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * radius;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;

            // Magic sparkle particles
            const size = Math.max(1, Math.floor((1 - progress) * 8));
            const colorIndex = Math.floor(Math.random() * this.effectColors.magic.length);
            const color = this.effectColors.magic[colorIndex];

            // Draw star-shaped sparkle
            await this.drawSparkle(image, particleX, particleY, size, color);

            // Add magical trails
            if (Math.random() < 0.5) {
                const trailLength = Math.random() * 12;
                for (let t = 0; t < trailLength; t++) {
                    const trailX = particleX - Math.cos(angle) * t * 3;
                    const trailY = particleY - Math.sin(angle) * t * 3;
                    const trailAlpha = Math.max(0, 1 - t / trailLength);
                    await this.drawSparkle(image, trailX, trailY, size * 0.5, color, trailAlpha);
                }
            }
        }

        // Add magic runes/circles
        if (progress > 0.2 && progress < 0.8) {
            const circleRadius = radius * (progress - 0.2) / 0.6;
            const runeCount = Math.floor(circleRadius / 5);

            for (let i = 0; i < runeCount; i++) {
                const angle = (i / runeCount) * Math.PI * 2;
                const runeX = centerX + Math.cos(angle) * circleRadius;
                const runeY = centerY + Math.sin(angle) * circleRadius;

                this.utils.drawEllipse(image, runeX, runeY, 2, 2, 0xFFD700);
            }
        }
    }

    /**
     * Generate nuclear detonation particles
     */
    async generateNuclearDetonation(image, centerX, centerY, radius, progress, particleType) {
        // Mushroom cloud effect
        const cloudRadius = radius * 2;
        const stemHeight = radius * 0.8;

        // Generate mushroom cloud
        const cloudParticles = Math.floor(100 * progress);
        for (let i = 0; i < cloudParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * cloudRadius;
            const cloudX = centerX + Math.cos(angle) * distance;
            const cloudY = centerY - stemHeight + Math.sin(angle) * distance * 0.5;

            const smokeColor = this.effectColors.smoke[Math.floor(Math.random() * this.effectColors.smoke.length)];
            this.utils.drawEllipse(image, cloudX, cloudY, 6, 6, smokeColor, 0.8);
        }

        // Generate stem
        const stemParticles = Math.floor(50 * progress);
        for (let i = 0; i < stemParticles; i++) {
            const stemX = centerX + (Math.random() - 0.5) * radius * 0.4;
            const stemY = centerY + Math.random() * stemHeight;

            const ashColor = Math.random() < 0.6 ? 0x696969 : 0x2F2F2F;
            this.utils.drawEllipse(image, stemX, stemY, 4, 4, ashColor, 0.9);
        }

        // Add fireball core
        if (progress < 0.6) {
            const coreRadius = radius * (1 - progress / 0.6);
            const coreParticles = Math.floor(30 * (1 - progress / 0.6));

            for (let i = 0; i < coreParticles; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * coreRadius;
                const coreX = centerX + Math.cos(angle) * distance;
                const coreY = centerY + Math.sin(angle) * distance;

                const fireColor = this.effectColors.fire[Math.floor(Math.random() * this.effectColors.fire.length)];
                this.utils.drawEllipse(image, coreX, coreY, 3, 3, fireColor);
            }
        }
    }

    /**
     * Generate electrical discharge particles
     */
    async generateElectricalDischarge(image, centerX, centerY, radius, progress, particleType) {
        const boltCount = Math.floor(8 * (1 - progress * 0.5));

        for (let b = 0; b < boltCount; b++) {
            const startAngle = (b / boltCount) * Math.PI * 2;
            const endAngle = startAngle + Math.random() * Math.PI * 0.5 - Math.PI * 0.25;

            // Generate lightning bolt path
            const boltSegments = Math.floor(8 + Math.random() * 8);
            let currentX = centerX;
            let currentY = centerY;

            for (let s = 0; s < boltSegments; s++) {
                const segmentProgress = s / (boltSegments - 1);
                const targetAngle = startAngle + (endAngle - startAngle) * segmentProgress;
                const jitter = (Math.random() - 0.5) * Math.PI * 0.3;
                const actualAngle = targetAngle + jitter;

                const segmentLength = radius * 0.1;
                const nextX = currentX + Math.cos(actualAngle) * segmentLength;
                const nextY = currentY + Math.sin(actualAngle) * segmentLength;

                // Draw lightning segment
                this.utils.drawLine(image, currentX, currentY, nextX, nextY, 0xE6E6FA, 3);

                // Add spark particles along bolt
                if (Math.random() < 0.3) {
                    const sparkX = (currentX + nextX) * 0.5 + (Math.random() - 0.5) * 4;
                    const sparkY = (currentY + nextY) * 0.5 + (Math.random() - 0.5) * 4;
                    this.utils.drawEllipse(image, sparkX, sparkY, 2, 2, 0xFFFFFF);
                }

                currentX = nextX;
                currentY = nextY;
            }
        }

        // Add electrical discharge particles
        const dischargeCount = Math.floor(40 * (1 - progress * 0.6));
        for (let i = 0; i < dischargeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.8;
            const dischargeX = centerX + Math.cos(angle) * distance;
            const dischargeY = centerY + Math.sin(angle) * distance;

            const energyColor = this.effectColors.energy[Math.floor(Math.random() * this.effectColors.energy.length)];
            this.utils.drawEllipse(image, dischargeX, dischargeY, 2, 2, energyColor);
        }
    }

    /**
     * Generate generic explosion particles
     */
    async generateGenericExplosion(image, centerX, centerY, radius, progress, particleType) {
        const particleCount = Math.floor(60 * (1 - progress * 0.4));

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * radius;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;

            const size = Math.max(1, Math.floor((1 - progress) * 5));
            const color = this.effectColors.energy[Math.floor(Math.random() * this.effectColors.energy.length)];

            this.utils.drawEllipse(image, particleX, particleY, size, size, color);
        }
    }

    /**
     * Apply explosion effect enhancements
     */
    async applyExplosionEffect(image, effect, progress, centerX, centerY, radius) {
        switch (effect) {
            case 'shockwave':
                await this.addShockwaveEffect(image, progress, centerX, centerY, radius);
                break;
            case 'fire_trail':
                await this.addFireTrailEffect(image, progress, centerX, centerY, radius);
                break;
            case 'smoke_cloud':
                await this.addSmokeCloudEffect(image, progress, centerX, centerY, radius);
                break;
            case 'spark_shower':
                await this.addSparkShowerEffect(image, progress, centerX, centerY, radius);
                break;
            case 'debris_field':
                await this.addDebrisFieldEffect(image, progress, centerX, centerY, radius);
                break;
        }
    }

    /**
     * Generate magic animation sequence
     */
    async generateMagicAnimation(image, config) {
        const { width, height } = image.bitmap;
        const type = config.magicType || 'fire_spell';
        const particleType = config.particleType || 'energy';
        const effect = config.effect || 'casting_glow';
        const frameCount = config.frameCount || this.particleSystemsDatabase.magic_effects.frame_counts[type];

        const frames = [];

        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            const frameImage = new Jimp(width, height);

            // Copy base image
            image.scan(0, 0, width, height, function(x, y, idx) {
                frameImage.bitmap.data[idx] = this.bitmap.data[idx];
                frameImage.bitmap.data[idx + 1] = this.bitmap.data[idx + 1];
                frameImage.bitmap.data[idx + 2] = this.bitmap.data[idx + 2];
                frameImage.bitmap.data[idx + 3] = this.bitmap.data[idx + 3];
            });

            // Apply magic animation transformations
            await this.applyMagicFrame(frameImage, type, particleType, effect, frameIndex, frameCount);

            frames.push(frameImage);
        }

        return frames;
    }

    /**
     * Apply magic frame transformations
     */
    async applyMagicFrame(image, type, particleType, effect, frameIndex, totalFrames) {
        const { width, height } = image.bitmap;
        const progress = frameIndex / (totalFrames - 1);
        const centerX = width * 0.5;
        const centerY = height * 0.4;

        switch (type) {
            case 'fire_spell':
                await this.generateFireSpell(image, centerX, centerY, progress, particleType);
                break;
            case 'ice_spell':
                await this.generateIceSpell(image, centerX, centerY, progress, particleType);
                break;
            case 'lightning_spell':
                await this.generateLightningSpell(image, centerX, centerY, progress, particleType);
                break;
            case 'healing_spell':
                await this.generateHealingSpell(image, centerX, centerY, progress, particleType);
                break;
            case 'shield_spell':
                await this.generateShieldSpell(image, centerX, centerY, progress, particleType);
                break;
            default:
                await this.generateGenericSpell(image, centerX, centerY, progress, particleType);
        }

        // Apply effect-specific enhancements
        await this.applyMagicEffect(image, effect, progress, centerX, centerY);
    }

    /**
     * Generate weather animation sequence
     */
    async generateWeatherAnimation(image, config) {
        const { width, height } = image.bitmap;
        const type = config.weatherType || 'rain_storm';
        const particleType = config.particleType || 'raindrop';
        const effect = config.effect || 'downpour';
        const frameCount = config.frameCount || this.particleSystemsDatabase.weather_effects.frame_counts[type];

        const frames = [];

        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            const frameImage = new Jimp(width, height);

            // Copy base image
            image.scan(0, 0, width, height, function(x, y, idx) {
                frameImage.bitmap.data[idx] = this.bitmap.data[idx];
                frameImage.bitmap.data[idx + 1] = this.bitmap.data[idx + 1];
                frameImage.bitmap.data[idx + 2] = this.bitmap.data[idx + 2];
                frameImage.bitmap.data[idx + 3] = this.bitmap.data[idx + 3];
            });

            // Apply weather animation transformations
            await this.applyWeatherFrame(frameImage, type, particleType, effect, frameIndex, frameCount);

            frames.push(frameImage);
        }

        return frames;
    }

    /**
     * Generate environmental animation sequence
     */
    async generateEnvironmentalAnimation(image, config) {
        const { width, height } = image.bitmap;
        const type = config.environmentalType || 'campfire_smoke';
        const particleType = config.particleType || 'smoke';
        const effect = config.effect || 'rising_smoke';
        const frameCount = config.frameCount || this.particleSystemsDatabase.environmental_effects.frame_counts[type];

        const frames = [];

        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            const frameImage = new Jimp(width, height);

            // Copy base image
            image.scan(0, 0, width, height, function(x, y, idx) {
                frameImage.bitmap.data[idx] = this.bitmap.data[idx];
                frameImage.bitmap.data[idx + 1] = this.bitmap.data[idx + 1];
                frameImage.bitmap.data[idx + 2] = this.bitmap.data[idx + 2];
                frameImage.bitmap.data[idx + 3] = this.bitmap.data[idx + 3];
            });

            // Apply environmental animation transformations
            await this.applyEnvironmentalFrame(frameImage, type, particleType, effect, frameIndex, frameCount);

            frames.push(frameImage);
        }

        return frames;
    }

    /**
     * Helper methods for drawing particles
     */
    async drawSparkle(image, x, y, size, color, alpha = 1) {
        // Draw a simple star sparkle
        const points = [
            { x: x, y: y - size },
            { x: x + size * 0.3, y: y - size * 0.3 },
            { x: x + size, y: y },
            { x: x + size * 0.3, y: y + size * 0.3 },
            { x: x, y: y + size },
            { x: x - size * 0.3, y: y + size * 0.3 },
            { x: x - size, y: y },
            { x: x - size * 0.3, y: y - size * 0.3 }
        ];

        for (const point of points) {
            this.utils.drawEllipse(image, point.x, point.y, 1, 1, color, alpha);
        }

        // Add center dot
        this.utils.drawEllipse(image, x, y, size * 0.3, size * 0.3, color, alpha);
    }

    async addShockwaveEffect(image, progress, centerX, centerY, radius) {
        if (progress > 0.2 && progress < 0.8) {
            const waveRadius = radius * (progress - 0.2) / 0.6;
            const waveThickness = Math.max(1, Math.floor(waveRadius * 0.08));

            for (let r = waveRadius - waveThickness; r <= waveRadius + waveThickness; r++) {
                const circumference = Math.floor(r * Math.PI * 2);
                for (let i = 0; i < circumference; i += 3) {
                    const angle = (i / circumference) * Math.PI * 2;
                    const waveX = centerX + Math.cos(angle) * r;
                    const waveY = centerY + Math.sin(angle) * r;
                    this.utils.drawEllipse(image, waveX, waveY, 1, 1, 0xFFFFFF, 0.8);
                }
            }
        }
    }

    async addFireTrailEffect(image, progress, centerX, centerY, radius) {
        const trailCount = Math.floor(12 * progress);

        for (let i = 0; i < trailCount; i++) {
            const angle = (i / trailCount) * Math.PI * 2;
            const trailLength = Math.random() * radius * 0.6;

            for (let t = 0; t < trailLength; t += 2) {
                const trailX = centerX + Math.cos(angle) * t;
                const trailY = centerY + Math.sin(angle) * t;
                const trailAlpha = Math.max(0, 1 - t / trailLength);

                const fireColor = this.effectColors.fire[Math.floor(Math.random() * this.effectColors.fire.length)];
                this.utils.drawEllipse(image, trailX, trailY, 2, 2, fireColor, trailAlpha);
            }
        }
    }

    async addSmokeCloudEffect(image, progress, centerX, centerY, radius) {
        const cloudCount = Math.floor(25 * progress);

        for (let i = 0; i < cloudCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 1.2;
            const cloudX = centerX + Math.cos(angle) * distance;
            const cloudY = centerY + Math.sin(angle) * distance;

            const smokeColor = this.effectColors.smoke[Math.floor(Math.random() * this.effectColors.smoke.length)];
            this.utils.drawEllipse(image, cloudX, cloudY, 5, 5, smokeColor, 0.7);
        }
    }

    async addSparkShowerEffect(image, progress, centerX, centerY, radius) {
        const sparkCount = Math.floor(30 * (1 - progress * 0.5));

        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const sparkX = centerX + Math.cos(angle) * distance;
            const sparkY = centerY + Math.sin(angle) * distance;

            // Draw spark as small line
            const sparkLength = Math.random() * 8 + 4;
            const endX = sparkX + Math.cos(angle) * sparkLength;
            const endY = sparkY + Math.sin(angle) * sparkLength;

            this.utils.drawLine(image, sparkX, sparkY, endX, endY, 0xFFD700, 1);
        }
    }

    async addDebrisFieldEffect(image, progress, centerX, centerY, radius) {
        const debrisCount = Math.floor(40 * progress);

        for (let i = 0; i < debrisCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 1.5;
            const debrisX = centerX + Math.cos(angle) * distance;
            const debrisY = centerY + Math.sin(angle) * distance;

            const debrisColor = Math.random() < 0.5 ? 0x696969 : 0x8B4513;
            const size = Math.floor(Math.random() * 3) + 1;

            this.utils.drawEllipse(image, debrisX, debrisY, size, size, debrisColor);
        }
    }

    async addMagicEffect(image, effect, progress, centerX, centerY) {
        switch (effect) {
            case 'casting_glow':
                await this.addCastingGlow(image, progress, centerX, centerY);
                break;
            case 'spell_trail':
                await this.addSpellTrail(image, progress, centerX, centerY);
                break;
            case 'magic_circle':
                await this.addMagicCircle(image, progress, centerX, centerY);
                break;
        }
    }

    async addCastingGlow(image, progress, centerX, centerY) {
        const glowRadius = 30 + progress * 20;
        const glowParticles = Math.floor(20 * progress);

        for (let i = 0; i < glowParticles; i++) {
            const angle = (i / glowParticles) * Math.PI * 2;
            const glowX = centerX + Math.cos(angle) * glowRadius;
            const glowY = centerY + Math.sin(angle) * glowRadius;

            const magicColor = this.effectColors.magic[Math.floor(Math.random() * this.effectColors.magic.length)];
            this.utils.drawEllipse(image, glowX, glowY, 2, 2, magicColor, 0.8);
        }
    }

    async addSpellTrail(image, progress, centerX, centerY) {
        const trailLength = 15;
        const trailParticles = Math.floor(10 * progress);

        for (let i = 0; i < trailParticles; i++) {
            const trailX = centerX - i * 3;
            const trailY = centerY - i * 2;
            const trailAlpha = Math.max(0, 1 - i / trailLength);

            const energyColor = this.effectColors.energy[Math.floor(Math.random() * this.effectColors.energy.length)];
            this.utils.drawEllipse(image, trailX, trailY, 2, 2, energyColor, trailAlpha);
        }
    }

    async addMagicCircle(image, progress, centerX, centerY) {
        const circleRadius = 25 + progress * 15;
        const runeCount = Math.floor(circleRadius / 4);

        for (let i = 0; i < runeCount; i++) {
            const angle = (i / runeCount) * Math.PI * 2;
            const runeX = centerX + Math.cos(angle) * circleRadius;
            const runeY = centerY + Math.sin(angle) * circleRadius;

            this.utils.drawEllipse(image, runeX, runeY, 2, 2, 0xFFD700, 0.9);
        }
    }

    // Spell generation methods
    async generateFireSpell(image, centerX, centerY, progress, particleType) {
        const particleCount = Math.floor(25 * (1 - progress * 0.3));

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;

            const fireColor = this.effectColors.fire[Math.floor(Math.random() * this.effectColors.fire.length)];
            this.utils.drawEllipse(image, particleX, particleY, 3, 3, fireColor);
        }
    }

    async generateIceSpell(image, centerX, centerY, progress, particleType) {
        const particleCount = Math.floor(20 * (1 - progress * 0.4));

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * 35;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;

            const iceColor = this.effectColors.ice[Math.floor(Math.random() * this.effectColors.ice.length)];
            await this.drawSparkle(image, particleX, particleY, 2, iceColor);
        }
    }

    async generateLightningSpell(image, centerX, centerY, progress, particleType) {
        const boltCount = Math.floor(6 * (1 - progress * 0.5));

        for (let b = 0; b < boltCount; b++) {
            const startAngle = (b / boltCount) * Math.PI * 2;
            let currentX = centerX;
            let currentY = centerY;

            for (let s = 0; s < 6; s++) {
                const jitter = (Math.random() - 0.5) * Math.PI * 0.4;
                const actualAngle = startAngle + jitter;

                const segmentLength = 8;
                const nextX = currentX + Math.cos(actualAngle) * segmentLength;
                const nextY = currentY + Math.sin(actualAngle) * segmentLength;

                this.utils.drawLine(image, currentX, currentY, nextX, nextY, 0xE6E6FA, 2);

                currentX = nextX;
                currentY = nextY;
            }
        }
    }

    async generateHealingSpell(image, centerX, centerY, progress, particleType) {
        const particleCount = Math.floor(30 * progress);

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * 45;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;

            const healingColor = Math.random() < 0.5 ? 0x32CD32 : 0xFFD700;
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, healingColor, 0.8);
        }
    }

    async generateShieldSpell(image, centerX, centerY, progress, particleType) {
        const shieldRadius = 25 + progress * 10;
        const particleCount = Math.floor(shieldRadius / 3);

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const particleX = centerX + Math.cos(angle) * shieldRadius;
            const particleY = centerY + Math.sin(angle) * shieldRadius;

            const shieldColor = Math.random() < 0.5 ? 0x4169E1 : 0x00CED1;
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, shieldColor, 0.7);
        }
    }

    async generateGenericSpell(image, centerX, centerY, progress, particleType) {
        const particleCount = Math.floor(25 * (1 - progress * 0.4));

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;

            const magicColor = this.effectColors.magic[Math.floor(Math.random() * this.effectColors.magic.length)];
            this.utils.drawEllipse(image, particleX, particleY, 3, 3, magicColor);
        }
    }

    // Weather and environmental frame methods
    async applyWeatherFrame(image, type, particleType, effect, frameIndex, totalFrames) {
        const { width, height } = image.bitmap;
        const progress = frameIndex / (totalFrames - 1);

        switch (type) {
            case 'rain_storm':
                await this.generateRainStorm(image, progress, width, height);
                break;
            case 'snow_fall':
                await this.generateSnowFall(image, progress, width, height);
                break;
            case 'wind_gust':
                await this.generateWindGust(image, progress, width, height);
                break;
        }
    }

    async applyEnvironmentalFrame(image, type, particleType, effect, frameIndex, totalFrames) {
        const { width, height } = image.bitmap;
        const progress = frameIndex / (totalFrames - 1);

        switch (type) {
            case 'campfire_smoke':
                await this.generateCampfireSmoke(image, progress, width, height);
                break;
            case 'waterfall_mist':
                await this.generateWaterfallMist(image, progress, width, height);
                break;
            case 'volcano_eruption':
                await this.generateVolcanoEruption(image, progress, width, height);
                break;
        }
    }

    // Weather generation methods
    async generateRainStorm(image, progress, width, height) {
        const raindropCount = Math.floor(50 + progress * 50);

        for (let i = 0; i < raindropCount; i++) {
            const rainX = Math.random() * width;
            const rainY = (Math.random() * height * 0.8) + (progress * height * 0.2);
            const rainLength = 3 + Math.random() * 5;

            this.utils.drawLine(image, rainX, rainY, rainX + 1, rainY + rainLength, 0x4169E1, 1);
        }

        // Add splash effects at bottom
        if (progress > 0.8) {
            const splashCount = Math.floor(20 * (progress - 0.8) / 0.2);
            for (let i = 0; i < splashCount; i++) {
                const splashX = Math.random() * width;
                const splashY = height * 0.9 + Math.random() * height * 0.1;

                this.utils.drawEllipse(image, splashX, splashY, 2, 1, 0x4169E1, 0.6);
            }
        }
    }

    async generateSnowFall(image, progress, width, height) {
        const snowflakeCount = Math.floor(30 + progress * 40);

        for (let i = 0; i < snowflakeCount; i++) {
            const snowX = Math.random() * width;
            const snowY = (Math.random() * height * 0.7) + (progress * height * 0.3);
            const snowSize = 1 + Math.random() * 2;

            // Draw simple snowflake
            this.utils.drawEllipse(image, snowX, snowY, snowSize, snowSize, 0xFFFFFF, 0.8);

            // Add sparkle effect
            if (Math.random() < 0.3) {
                await this.drawSparkle(image, snowX, snowY, snowSize * 0.5, 0xE6E6FA, 0.6);
            }
        }
    }

    async generateWindGust(image, progress, width, height) {
        const windParticleCount = Math.floor(25 * (1 - progress * 0.5));

        for (let i = 0; i < windParticleCount; i++) {
            const windX = Math.random() * width;
            const windY = Math.random() * height;
            const windLength = 4 + Math.random() * 8;
            const windAngle = Math.PI * 0.2 + Math.random() * Math.PI * 0.1; // Mostly rightward

            const endX = windX + Math.cos(windAngle) * windLength;
            const endY = windY + Math.sin(windAngle) * windLength;

            this.utils.drawLine(image, windX, windY, endX, endY, 0xE6E6FA, 1);
        }
    }

    // Environmental generation methods
    async generateCampfireSmoke(image, progress, width, height) {
        const smokeParticleCount = Math.floor(20 + progress * 30);

        for (let i = 0; i < smokeParticleCount; i++) {
            const smokeX = width * 0.5 + (Math.random() - 0.5) * width * 0.3;
            const smokeY = height * 0.6 - progress * height * 0.4 + Math.random() * height * 0.2;
            const smokeSize = 3 + Math.random() * 4;

            const smokeColor = this.effectColors.smoke[Math.floor(Math.random() * this.effectColors.smoke.length)];
            this.utils.drawEllipse(image, smokeX, smokeY, smokeSize, smokeSize, smokeColor, 0.7);
        }

        // Add rising motion blur
        if (progress > 0.3) {
            await this.addMotionBlur(image, 0, -1, 0.2);
        }
    }

    async generateWaterfallMist(image, progress, width, height) {
        const mistParticleCount = Math.floor(35 + progress * 25);

        for (let i = 0; i < mistParticleCount; i++) {
            const mistX = Math.random() * width;
            const mistY = height * 0.4 + Math.random() * height * 0.4;
            const mistSize = 2 + Math.random() * 3;

            const mistColor = this.effectColors.water[Math.floor(Math.random() * this.effectColors.water.length)];
            this.utils.drawEllipse(image, mistX, mistY, mistSize, mistSize, mistColor, 0.6);
        }

        // Add cascading water droplets
        const dropletCount = Math.floor(15 * progress);
        for (let i = 0; i < dropletCount; i++) {
            const dropletX = Math.random() * width;
            const dropletY = height * 0.3 + Math.random() * height * 0.5;
            const dropletLength = 2 + Math.random() * 4;

            this.utils.drawLine(image, dropletX, dropletY, dropletX + 1, dropletY + dropletLength, 0x4169E1, 1);
        }
    }

    async generateVolcanoEruption(image, progress, width, height) {
        // Ash cloud
        const ashParticleCount = Math.floor(40 * progress);
        for (let i = 0; i < ashParticleCount; i++) {
            const ashX = width * 0.5 + (Math.random() - 0.5) * width * 0.6;
            const ashY = height * 0.3 - progress * height * 0.3 + Math.random() * height * 0.3;
            const ashSize = 2 + Math.random() * 3;

            const ashColor = Math.random() < 0.6 ? 0x696969 : 0x2F2F2F;
            this.utils.drawEllipse(image, ashX, ashY, ashSize, ashSize, ashColor, 0.8);
        }

        // Lava particles
        if (progress > 0.4) {
            const lavaParticleCount = Math.floor(25 * (progress - 0.4) / 0.6);
            for (let i = 0; i < lavaParticleCount; i++) {
                const lavaX = width * 0.5 + (Math.random() - 0.5) * width * 0.4;
                const lavaY = height * 0.7 + Math.random() * height * 0.2;

                const lavaColor = this.effectColors.fire[Math.floor(Math.random() * this.effectColors.fire.length)];
                this.utils.drawEllipse(image, lavaX, lavaY, 3, 3, lavaColor);
            }
        }

        // Smoke trail
        const smokeTrailCount = Math.floor(30 * progress);
        for (let i = 0; i < smokeTrailCount; i++) {
            const smokeX = width * 0.5 + (Math.random() - 0.5) * width * 0.5;
            const smokeY = height * 0.2 - progress * height * 0.4 + Math.random() * height * 0.3;

            const smokeColor = this.effectColors.smoke[Math.floor(Math.random() * this.effectColors.smoke.length)];
            this.utils.drawEllipse(image, smokeX, smokeY, 4, 4, smokeColor, 0.6);
        }
    }

    // Object animation frame methods
    async applyOpenCloseFrame(image, progress, object) {
        const { width, height } = image.bitmap;

        switch (object) {
            case 'chest':
                // Chest lid opening animation
                const lidAngle = progress * 90;
                // This would require complex transformation - simplified version
                if (progress > 0.5) {
                    // Add opening particles
                    const particleCount = Math.floor(10 * (progress - 0.5) / 0.5);
                    for (let i = 0; i < particleCount; i++) {
                        const particleX = width * 0.5 + (Math.random() - 0.5) * width * 0.3;
                        const particleY = height * 0.4 + Math.random() * height * 0.2;
                        this.utils.drawEllipse(image, particleX, particleY, 2, 2, 0x8B4513, 0.7);
                    }
                }
                break;
            case 'door':
                // Door opening animation
                const doorOffset = progress * 20;
                // Simplified door opening effect
                if (progress > 0.3) {
                    const dustCount = Math.floor(8 * (progress - 0.3) / 0.7);
                    for (let i = 0; i < dustCount; i++) {
                        const dustX = width * 0.5 + (Math.random() - 0.5) * width * 0.4;
                        const dustY = height * 0.5 + Math.random() * height * 0.3;
                        this.utils.drawEllipse(image, dustX, dustY, 1, 1, 0xDEB887, 0.8);
                    }
                }
                break;
        }
    }

    async applySpinRotateFrame(image, progress, object) {
        const { width, height } = image.bitmap;

        // Rotation angle
        const rotationAngle = progress * Math.PI * 2;

        // Add rotation blur effect
        await this.addMotionBlur(image, Math.cos(rotationAngle) * 2, Math.sin(rotationAngle) * 2, 0.2);
    }

    async applyBounceBobFrame(image, progress, object) {
        const { width, height } = image.bitmap;

        // Bouncing motion
        const bounceOffset = Math.abs(Math.sin(progress * Math.PI * 2)) * 5;

        // Add bounce shadow
        await this.addBounceShadow(image, bounceOffset);
    }

    async applyGlowPulseFrame(image, progress, object, effect) {
        const { width, height } = image.bitmap;

        // Pulsing glow effect
        const glowIntensity = 0.5 + Math.sin(progress * Math.PI * 2) * 0.5;

        let glowColor;
        switch (effect) {
            case 'magical':
                glowColor = 0x9370DB;
                break;
            case 'destructive':
                glowColor = 0xDC143C;
                break;
            case 'healing':
                glowColor = 0x32CD32;
                break;
            default:
                glowColor = 0xFFD700;
        }

        await this.addGlowEffect(image, glowColor, glowIntensity);
    }

    async applyShakeRumbleFrame(image, progress, object) {
        const { width, height } = image.bitmap;

        // Shaking motion
        const shakeOffset = Math.sin(progress * Math.PI * 8) * 3;

        // Apply shake transformation
        await this.addShakeEffect(image, progress);
    }

    async applyExpandContractFrame(image, progress, object) {
        const { width, height } = image.bitmap;

        // Expansion/contraction effect
        const scaleFactor = 1 + Math.sin(progress * Math.PI * 2) * 0.2;

        // Add scaling effect (would require complex transformation)
        await this.addScaleEffect(image, scaleFactor);
    }

    async applyFadeInOutFrame(image, progress, object) {
        const { width, height } = image.bitmap;

        // Fade effect
        const alpha = Math.sin(progress * Math.PI);

        // Apply alpha transparency
        await this.addFadeEffect(image, alpha);
    }

    async applyColorShiftFrame(image, progress, object, effect) {
        const { width, height } = image.bitmap;

        // Color shifting effect
        const colorShift = Math.floor(progress * 255);

        await this.addColorShiftEffect(image, colorShift, effect);
    }

    async applyOrbitCircleFrame(image, progress, object) {
        const { width, height } = image.bitmap;

        // Orbital motion
        const orbitAngle = progress * Math.PI * 2;
        const orbitRadius = 15;

        // Add orbital trail
        for (let i = 0; i < 5; i++) {
            const trailAngle = orbitAngle - (i * 0.2);
            const trailX = width * 0.5 + Math.cos(trailAngle) * orbitRadius;
            const trailY = height * 0.5 + Math.sin(trailAngle) * orbitRadius;

            const alpha = (5 - i) / 5 * 0.5;
            this.utils.drawEllipse(image, trailX, trailY, 2, 2, 0xFFD700, alpha);
        }
    }

    // Additional helper methods
    async addBounceShadow(image, offset) {
        const { width, height } = image.bitmap;
        const shadowY = height * 0.9 + offset;

        // Draw elongated shadow based on bounce height
        for (let x = width * 0.3; x < width * 0.7; x++) {
            const shadowAlpha = 0.3 * (1 - offset / 10);
            this.utils.drawEllipse(image, x, shadowY, 1, 2, 0x000000, shadowAlpha);
        }
    }

    async addShakeEffect(image, progress) {
        const { width, height } = image.bitmap;

        // Add shake particles
        for (let i = 0; i < 4; i++) {
            const shakeX = width * 0.5 + Math.random() * 6 - 3;
            const shakeY = height * 0.5 + Math.random() * 6 - 3;
            this.utils.drawEllipse(image, shakeX, shakeY, 1, 1, 0x696969);
        }
    }

    async addScaleEffect(image, scaleFactor) {
        // Add scaling glow effect
        const glowIntensity = (scaleFactor - 1) * 2;
        await this.addGlowEffect(image, 0xFFFFFF, glowIntensity);
    }

    async addFadeEffect(image, alpha) {
        // This would require modifying the alpha channel of the entire image
        // For now, add fade particles
        const { width, height } = image.bitmap;

        for (let i = 0; i < 8; i++) {
            const particleX = Math.random() * width;
            const particleY = Math.random() * height;
            this.utils.drawEllipse(image, particleX, particleY, 1, 1, 0xFFFFFF, alpha * 0.5);
        }
    }

    async addColorShiftEffect(image, colorShift, effect) {
        const { width, height } = image.bitmap;

        // Add color-shifting particles
        let shiftColor;
        switch (effect) {
            case 'magical':
                shiftColor = 0x9370DB;
                break;
            case 'destructive':
                shiftColor = 0xDC143C;
                break;
            case 'healing':
                shiftColor = 0x32CD32;
                break;
            default:
                shiftColor = 0xFFD700;
        }

        for (let i = 0; i < 6; i++) {
            const particleX = Math.random() * width;
            const particleY = Math.random() * height;
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, shiftColor);
        }
    }

    // Additional magic effect methods
    async addMagicalGlow(image, progress) {
        const { width, height } = image.bitmap;
        const centerX = width * 0.5;
        const centerY = height * 0.4;

        // Add expanding magical glow
        const glowRadius = 20 + (progress * 30);
        const glowColor = this.effectColors.magic[Math.floor(progress * this.effectColors.magic.length)];

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const glowX = centerX + Math.cos(angle) * glowRadius;
            const glowY = centerY + Math.sin(angle) * glowRadius;

            this.utils.drawEllipse(image, glowX, glowY, 2, 2, glowColor);
        }
    }

    async addSpellParticles(image, direction) {
        const { width, height } = image.bitmap;
        const centerX = width * 0.5;
        const centerY = height * 0.4;

        // Add spell projectile particles
        for (let i = 0; i < 8; i++) {
            let particleX, particleY;

            switch (direction) {
                case 'north':
                    particleX = centerX + Math.random() * 40 - 20;
                    particleY = centerY - 30 - Math.random() * 20;
                    break;
                case 'south':
                    particleX = centerX + Math.random() * 40 - 20;
                    particleY = centerY + 30 + Math.random() * 20;
                    break;
                case 'east':
                    particleX = centerX + 30 + Math.random() * 20;
                    particleY = centerY + Math.random() * 40 - 20;
                    break;
                case 'west':
                    particleX = centerX - 30 - Math.random() * 20;
                    particleY = centerY + Math.random() * 40 - 20;
                    break;
                default:
                    particleX = centerX + Math.random() * 60 - 30;
                    particleY = centerY + Math.random() * 60 - 30;
            }

            const particleColor = this.animationColors.energy[Math.floor(Math.random() * this.animationColors.energy.length)];
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, particleColor);
        }
    }

    async addImpactEffect(image, direction) {
        const { width, height } = image.bitmap;
        let impactX, impactY;

        switch (direction) {
            case 'north':
                impactX = width * 0.5;
                impactY = height * 0.2;
                break;
            case 'south':
                impactX = width * 0.5;
                impactY = height * 0.8;
                break;
            case 'east':
                impactX = width * 0.8;
                impactY = height * 0.5;
                break;
            case 'west':
                impactX = width * 0.2;
                impactY = height * 0.5;
                break;
            default:
                impactX = width * 0.5;
                impactY = height * 0.5;
        }

        // Add impact particles
        for (let i = 0; i < 6; i++) {
            const particleX = impactX + Math.random() * 20 - 10;
            const particleY = impactY + Math.random() * 20 - 10;
            const particleColor = this.animationColors.energy[Math.floor(Math.random() * this.animationColors.energy.length)];
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, particleColor);
        }
    }

    async addForceFeedback(image, bodyRotation) {
        const { width, height } = image.bitmap;
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Add force lines emanating from center
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + (bodyRotation * Math.PI / 180);
            const forceX = centerX + Math.cos(angle) * 25;
            const forceY = centerY + Math.sin(angle) * 25;

            this.utils.drawLine(image, centerX, centerY, forceX, forceY, 0xFFFFFF, 1);
        }
    }

    async addSubtleGlow(image, offsetX, offsetY) {
        const { width, height } = image.bitmap;

        // Add subtle glow around the sprite
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const glowX = width * 0.5 + Math.cos(angle) * 15 + offsetX;
            const glowY = height * 0.5 + Math.sin(angle) * 20 + offsetY;

            this.utils.drawEllipse(image, glowX, glowY, 1, 1, 0xFFFFFF);
        }
    }

    // Monster animation frame methods
    async applySlitherFrame(image, progress, species) {
        const { width, height } = image.bitmap;

        // S-shaped slithering motion
        const slitherOffset = Math.sin(progress * Math.PI * 4) * 3;
        const verticalOffset = Math.sin(progress * Math.PI * 2) * 2;

        // Add slither trail
        for (let i = 0; i < 3; i++) {
            const trailX = width * 0.5 + slitherOffset - i * 2;
            const trailY = height * 0.5 + verticalOffset;
            this.utils.drawEllipse(image, trailX, trailY, 2, 2, 0x8B4513);
        }
    }

    async applyFlyFlapFrame(image, progress, species) {
        const { width, height } = image.bitmap;

        // Wing flapping motion
        const wingAngle = Math.sin(progress * Math.PI * 4) * 30;

        // Add wing blur effect
        if (Math.abs(wingAngle) > 15) {
            await this.addMotionBlur(image, 0, -2, 0.3);
        }
    }

    async applyHopJumpFrame(image, progress, species) {
        const { width, height } = image.bitmap;

        // Hopping motion with bounce
        const hopHeight = Math.abs(Math.sin(progress * Math.PI * 2)) * 5;

        // Add ground impact dust
        if (progress > 0.8) {
            await this.addDustCloud(image, direction);
        }
    }

    async applyLungeAttackFrame(image, progress, species) {
        const { width, height } = image.bitmap;

        // Forward lunging motion
        const lungeOffset = progress * 8;

        // Add motion blur for speed
        await this.addMotionBlur(image, lungeOffset * 0.5, 0, 0.4);
    }

    async applyBiteSnapFrame(image, progress, species) {
        const { width, height } = image.bitmap;

        // Jaw snapping motion
        const jawOffset = Math.sin(progress * Math.PI * 2) * 3;

        // Add bite effect particles
        if (progress > 0.5 && progress < 0.7) {
            const biteX = width * 0.5;
            const biteY = height * 0.3;
            for (let i = 0; i < 4; i++) {
                const particleX = biteX + Math.random() * 10 - 5;
                const particleY = biteY + Math.random() * 10 - 5;
                this.utils.drawEllipse(image, particleX, particleY, 1, 1, 0xDC143C);
            }
        }
    }

    async applyRoarBellowFrame(image, progress, species) {
        const { width, height } = image.bitmap;

        // Roaring effect with expanding sound waves
        const roarRadius = progress * 20;

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const waveX = width * 0.5 + Math.cos(angle) * roarRadius;
            const waveY = height * 0.5 + Math.sin(angle) * roarRadius;

            this.utils.drawEllipse(image, waveX, waveY, 1, 1, 0xFFFFFF);
        }
    }

    async applyBehaviorEffect(image, behavior, progress) {
        switch (behavior) {
            case 'aggressive':
                // Add aggressive red glow
                if (progress > 0.7) {
                    await this.addGlowEffect(image, 0xDC143C, 0.3);
                }
                break;
            case 'scared':
                // Add fearful shaking
                await this.addShakeEffect(image, progress);
                break;
            case 'angry':
                // Add angry particles
                if (Math.floor(progress * 5) % 2 === 0) {
                    await this.addAngerParticles(image);
                }
                break;
        }
    }

    async addDustCloud(image, direction) {
        const { width, height } = image.bitmap;
        let cloudX, cloudY;

        switch (direction) {
            case 'north':
                cloudX = width * 0.5;
                cloudY = height * 0.9;
                break;
            case 'south':
                cloudX = width * 0.5;
                cloudY = height * 0.1;
                break;
            case 'east':
                cloudX = width * 0.1;
                cloudY = height * 0.5;
                break;
            case 'west':
                cloudX = width * 0.9;
                cloudY = height * 0.5;
                break;
            default:
                cloudX = width * 0.5;
                cloudY = height * 0.5;
        }

        // Add dust cloud particles
        for (let i = 0; i < 5; i++) {
            const particleX = cloudX + Math.random() * 15 - 7.5;
            const particleY = cloudY + Math.random() * 15 - 7.5;
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, 0xDEB887);
        }
    }

    async addBlinkEffect(image) {
        const { width, height } = image.bitmap;
        const eyeY = height * 0.35;

        // Add blink lines over eyes
        this.utils.drawLine(image, width * 0.45, eyeY, width * 0.48, eyeY, 0x000000, 2);
        this.utils.drawLine(image, width * 0.52, eyeY, width * 0.55, eyeY, 0x000000, 2);
    }

    async addSubtleMovement(image, direction) {
        // Add very subtle random movement
        const offsetX = (Math.random() - 0.5) * 2;
        const offsetY = (Math.random() - 0.5) * 2;

        // This would require pixel manipulation to shift the entire sprite
        // For now, just add a subtle glow effect
        await this.addSubtleGlow(image, offsetX, offsetY);
    }

    async addAngerParticles(image) {
        const { width, height } = image.bitmap;

        for (let i = 0; i < 3; i++) {
            const particleX = width * 0.5 + Math.random() * 20 - 10;
            const particleY = height * 0.3 + Math.random() * 10 - 5;
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, 0xDC143C);
        }
    }

    async addSpeedLines(image, direction) {
        const { width, height } = image.bitmap;

        for (let i = 0; i < 6; i++) {
            let lineX1, lineY1, lineX2, lineY2;

            switch (direction) {
                case 'north':
                    lineX1 = width * 0.3 + Math.random() * width * 0.4;
                    lineY1 = height * 0.8;
                    lineX2 = lineX1;
                    lineY2 = height * 0.6;
                    break;
                case 'south':
                    lineX1 = width * 0.3 + Math.random() * width * 0.4;
                    lineY1 = height * 0.2;
                    lineX2 = lineX1;
                    lineY2 = height * 0.4;
                    break;
                case 'east':
                    lineX1 = width * 0.2;
                    lineY1 = height * 0.3 + Math.random() * height * 0.4;
                    lineX2 = width * 0.4;
                    lineY2 = lineY1;
                    break;
                case 'west':
                    lineX1 = width * 0.8;
                    lineY1 = height * 0.3 + Math.random() * height * 0.4;
                    lineX2 = width * 0.6;
                    lineY2 = lineY1;
                    break;
                default:
                    lineX1 = width * 0.3 + Math.random() * width * 0.4;
                    lineY1 = height * 0.3 + Math.random() * height * 0.4;
                    lineX2 = lineX1 + 20;
                    lineY2 = lineY1 - 20;
            }

            this.utils.drawLine(image, lineX1, lineY1, lineX2, lineY2, 0xFFFFFF, 1);
        }
    }

    async addFootDust(image, direction) {
        const { width, height } = image.bitmap;
        let dustX, dustY;

        switch (direction) {
            case 'north':
                dustX = width * 0.5;
                dustY = height * 0.8;
                break;
            case 'south':
                dustX = width * 0.5;
                dustY = height * 0.2;
                break;
            case 'east':
                dustX = width * 0.2;
                dustY = height * 0.5;
                break;
            case 'west':
                dustX = width * 0.8;
                dustY = height * 0.5;
                break;
            default:
                dustX = width * 0.5;
                dustY = height * 0.5;
        }

        // Add small dust particles
        for (let i = 0; i < 3; i++) {
            const particleX = dustX + Math.random() * 10 - 5;
            const particleY = dustY + Math.random() * 10 - 5;
            this.utils.drawEllipse(image, particleX, particleY, 1, 1, 0xDEB887);
        }
    }
}

module.exports = ParticleAnimationGenerator;
