/**
 * Basic Animation System - Character walk cycles, attack animations
 * Handles generation of animated sprite sequences for game characters and objects
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class BasicAnimationSystem {
    constructor() {
        this.utils = new SpriteUtils();

        // Animation database
        this.animationDatabase = {
            character_animations: {
                name: 'Character Animations',
                types: ['walk_cycle', 'run_cycle', 'idle_poses', 'attack_swing', 'attack_thrust', 'cast_spell', 'block_defend', 'hurt_reaction', 'death_sequence', 'jump_leap'],
                classes: ['warrior', 'mage', 'rogue', 'archer', 'paladin', 'necromancer', 'monk', 'barbarian', 'cleric', 'ranger'],
                directions: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'],
                frame_counts: { walk_cycle: 8, run_cycle: 6, idle_poses: 4, attack_swing: 5, attack_thrust: 4, cast_spell: 6, block_defend: 3, hurt_reaction: 3, death_sequence: 8, jump_leap: 6 }
            },
            monster_animations: {
                name: 'Monster Animations',
                types: ['slither', 'fly_flap', 'hop_jump', 'lunge_attack', 'bite_snap', 'roar_bellow', 'spit_projectile', 'tail_whip', 'charge_rush', 'burrow_dig'],
                species: ['dragon', 'goblin', 'orc', 'skeleton', 'zombie', 'spider', 'wolf', 'bear', 'snake', 'bird'],
                behaviors: ['aggressive', 'defensive', 'hungry', 'scared', 'curious', 'sleepy', 'angry', 'playful', 'guarding', 'hunting'],
                frame_counts: { slither: 6, fly_flap: 4, hop_jump: 5, lunge_attack: 4, bite_snap: 3, roar_bellow: 5, spit_projectile: 4, tail_whip: 4, charge_rush: 6, burrow_dig: 7 }
            },
            object_animations: {
                name: 'Object Animations',
                types: ['open_close', 'spin_rotate', 'bounce_bob', 'glow_pulse', 'shake_rumble', 'expand_contract', 'fade_in_out', 'color_shift', 'size_change', 'orbit_circle'],
                objects: ['chest', 'door', 'lever', 'crystal', 'torch', 'portal', 'machine', 'statue', 'fountain', 'weapon'],
                effects: ['magical', 'mechanical', 'natural', 'destructive', 'healing', 'cursed', 'blessed', 'neutral', 'chaotic', 'ordered'],
                frame_counts: { open_close: 6, spin_rotate: 8, bounce_bob: 4, glow_pulse: 6, shake_rumble: 5, expand_contract: 6, fade_in_out: 8, color_shift: 7, size_change: 5, orbit_circle: 12 }
            }
        };

        // Animation timing and easing
        this.animationTiming = {
            walk_cycle: { duration: 800, easing: 'linear', loop: true },
            run_cycle: { duration: 600, easing: 'ease_out', loop: true },
            idle_poses: { duration: 2000, easing: 'ease_in_out', loop: true },
            attack_swing: { duration: 400, easing: 'ease_out', loop: false },
            attack_thrust: { duration: 300, easing: 'linear', loop: false },
            cast_spell: { duration: 800, easing: 'ease_in_out', loop: false },
            block_defend: { duration: 200, easing: 'ease_out', loop: false },
            hurt_reaction: { duration: 300, easing: 'ease_in', loop: false },
            death_sequence: { duration: 1000, easing: 'ease_in', loop: false },
            jump_leap: { duration: 500, easing: 'ease_out', loop: false }
        };

        // Keyframe data for different animations
        this.keyframeData = {
            walk_cycle: [
                { frame: 0, body_offset: { x: 0, y: 0 }, arm_angle: 0, leg_angle: 0 },
                { frame: 1, body_offset: { x: 1, y: -1 }, arm_angle: 15, leg_angle: -20 },
                { frame: 2, body_offset: { x: 2, y: 0 }, arm_angle: 30, leg_angle: 0 },
                { frame: 3, body_offset: { x: 1, y: 1 }, arm_angle: 15, leg_angle: 20 },
                { frame: 4, body_offset: { x: 0, y: 0 }, arm_angle: 0, leg_angle: 0 },
                { frame: 5, body_offset: { x: -1, y: -1 }, arm_angle: -15, leg_angle: 20 },
                { frame: 6, body_offset: { x: -2, y: 0 }, arm_angle: -30, leg_angle: 0 },
                { frame: 7, body_offset: { x: -1, y: 1 }, arm_angle: -15, leg_angle: -20 }
            ],
            attack_swing: [
                { frame: 0, weapon_angle: 0, body_rotation: 0 },
                { frame: 1, weapon_angle: 30, body_rotation: 10 },
                { frame: 2, weapon_angle: 90, body_rotation: 20 },
                { frame: 3, weapon_angle: 150, body_rotation: 15 },
                { frame: 4, weapon_angle: 180, body_rotation: 5 }
            ],
            cast_spell: [
                { frame: 0, hand_position: { x: 0, y: 0 }, energy_particles: 0 },
                { frame: 1, hand_position: { x: 5, y: -5 }, energy_particles: 2 },
                { frame: 2, hand_position: { x: 10, y: -10 }, energy_particles: 5 },
                { frame: 3, hand_position: { x: 15, y: -15 }, energy_particles: 8 },
                { frame: 4, hand_position: { x: 20, y: -20 }, energy_particles: 12 },
                { frame: 5, hand_position: { x: 25, y: -25 }, energy_particles: 15 }
            ]
        };

        // Color palettes for animation effects
        this.animationColors = {
            energy: [0x9370DB, 0x4169E1, 0x00CED1, 0x32CD32, 0xFFD700],
            blood: [0xDC143C, 0x8B0000, 0xFF0000, 0xFF6347, 0xFFA07A],
            magic: [0x9370DB, 0x8A2BE2, 0x9932CC, 0xBA55D3, 0xDA70D6],
            fire: [0xFF4500, 0xFF6347, 0xFFD700, 0xFFFF00, 0xFFFFFF],
            ice: [0xE0FFFF, 0xB0E0E6, 0x87CEEB, 0x4682B4, 0x4169E1]
        };
    }

    /**
     * Main animation generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine animation type and generate accordingly
        const animationType = config.animationType || 'character_animations';
        const subType = config.subType || 'walk_cycle';
        const frameCount = config.frameCount || 8;

        switch (animationType) {
            case 'character_animations':
                return await this.generateCharacterAnimation(image, config);
            case 'monster_animations':
                return await this.generateMonsterAnimation(image, config);
            case 'object_animations':
                return await this.generateObjectAnimation(image, config);
            default:
                return await this.generateCharacterAnimation(image, config);
        }
    }

    /**
     * Generate character animation sequence
     */
    async generateCharacterAnimation(image, config) {
        const { width, height } = image.bitmap;
        const type = config.animationType || 'walk_cycle';
        const characterClass = config.characterClass || 'warrior';
        const direction = config.direction || 'south';
        const frameCount = config.frameCount || this.animationDatabase.character_animations.frame_counts[type];

        const frames = [];

        // Generate each frame of the animation
        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            const frameImage = new Jimp(width, height);

            // Copy base image
            image.scan(0, 0, width, height, function(x, y, idx) {
                frameImage.bitmap.data[idx] = this.bitmap.data[idx];
                frameImage.bitmap.data[idx + 1] = this.bitmap.data[idx + 1];
                frameImage.bitmap.data[idx + 2] = this.bitmap.data[idx + 2];
                frameImage.bitmap.data[idx + 3] = this.bitmap.data[idx + 3];
            });

            // Apply animation transformations
            await this.applyCharacterAnimationFrame(frameImage, type, characterClass, direction, frameIndex, frameCount);

            frames.push(frameImage);
        }

        return frames;
    }

    /**
     * Apply character animation frame transformations
     */
    async applyCharacterAnimationFrame(image, type, characterClass, direction, frameIndex, totalFrames) {
        const { width, height } = image.bitmap;
        const progress = frameIndex / (totalFrames - 1);

        switch (type) {
            case 'walk_cycle':
                await this.applyWalkCycleFrame(image, progress, direction);
                break;
            case 'run_cycle':
                await this.applyRunCycleFrame(image, progress, direction);
                break;
            case 'idle_poses':
                await this.applyIdlePoseFrame(image, progress, direction);
                break;
            case 'attack_swing':
                await this.applyAttackSwingFrame(image, progress, direction);
                break;
            case 'attack_thrust':
                await this.applyAttackThrustFrame(image, progress, direction);
                break;
            case 'cast_spell':
                await this.applyCastSpellFrame(image, progress, direction);
                break;
            case 'block_defend':
                await this.applyBlockDefendFrame(image, progress, direction);
                break;
            case 'hurt_reaction':
                await this.applyHurtReactionFrame(image, progress, direction);
                break;
            case 'death_sequence':
                await this.applyDeathSequenceFrame(image, progress, direction);
                break;
            case 'jump_leap':
                await this.applyJumpLeapFrame(image, progress, direction);
                break;
        }
    }

    /**
     * Apply walk cycle animation frame
     */
    async applyWalkCycleFrame(image, progress, direction) {
        const { width, height } = image.bitmap;
        const keyframes = this.keyframeData.walk_cycle;
        const keyframeIndex = Math.floor(progress * (keyframes.length - 1));
        const keyframe = keyframes[keyframeIndex];

        // Apply body offset based on direction
        let offsetX = keyframe.body_offset.x;
        let offsetY = keyframe.body_offset.y;

        switch (direction) {
            case 'north':
                offsetY = -Math.abs(offsetY);
                break;
            case 'south':
                offsetY = Math.abs(offsetY);
                break;
            case 'east':
                offsetX = Math.abs(offsetX);
                break;
            case 'west':
                offsetX = -Math.abs(offsetX);
                break;
        }

        // Apply subtle bouncing motion
        const bounceOffset = Math.sin(progress * Math.PI * 2) * 2;

        // Add motion blur effect for faster movement
        if (Math.abs(offsetX) > 1 || Math.abs(offsetY) > 1) {
            await this.addMotionBlur(image, offsetX * 0.5, offsetY * 0.5, 0.3);
        }

        // Add foot dust particles
        if (frameIndex % 2 === 0) {
            await this.addFootDust(image, direction);
        }
    }

    /**
     * Apply run cycle animation frame
     */
    async applyRunCycleFrame(image, progress, direction) {
        const { width, height } = image.bitmap;

        // More exaggerated movement for running
        const runOffset = Math.sin(progress * Math.PI * 4) * 4;
        const bounceOffset = Math.abs(Math.sin(progress * Math.PI * 2)) * 3;

        // Apply direction-based offset
        let offsetX = 0, offsetY = 0;
        switch (direction) {
            case 'north':
                offsetY = -runOffset;
                break;
            case 'south':
                offsetY = runOffset;
                break;
            case 'east':
                offsetX = runOffset;
                break;
            case 'west':
                offsetX = -runOffset;
                break;
        }

        // Add motion blur
        await this.addMotionBlur(image, offsetX * 0.8, offsetY * 0.8, 0.5);

        // Add speed lines
        await this.addSpeedLines(image, direction);

        // Add dust clouds
        if (Math.floor(progress * 6) % 2 === 0) {
            await this.addDustCloud(image, direction);
        }
    }

    /**
     * Apply idle pose animation frame
     */
    async applyIdlePoseFrame(image, progress, direction) {
        const { width, height } = image.bitmap;

        // Subtle breathing motion
        const breathOffset = Math.sin(progress * Math.PI * 2) * 0.5;

        // Occasional blinking
        if (Math.floor(progress * 4) === 1) {
            await this.addBlinkEffect(image);
        }

        // Random subtle movements
        if (Math.random() < 0.1) {
            await this.addSubtleMovement(image, direction);
        }
    }

    /**
     * Apply attack swing animation frame
     */
    async applyAttackSwingFrame(image, progress, direction) {
        const { width, height } = image.bitmap;
        const keyframes = this.keyframeData.attack_swing;
        const keyframeIndex = Math.floor(progress * (keyframes.length - 1));
        const keyframe = keyframes[keyframeIndex];

        // Apply weapon swing motion
        const weaponAngle = keyframe.weapon_angle;
        const bodyRotation = keyframe.body_rotation;

        // Add weapon trail effect
        await this.addWeaponTrail(image, weaponAngle, direction);

        // Add impact effect at peak of swing
        if (progress > 0.6 && progress < 0.8) {
            await this.addImpactEffect(image, direction);
        }

        // Add force feedback visual
        await this.addForceFeedback(image, bodyRotation);
    }

    /**
     * Apply cast spell animation frame
     */
    async applyCastSpellFrame(image, progress, direction) {
        const { width, height } = image.bitmap;
        const keyframes = this.keyframeData.cast_spell;
        const keyframeIndex = Math.floor(progress * (keyframes.length - 1));
        const keyframe = keyframes[keyframeIndex];

        // Add magical energy particles
        for (let i = 0; i < keyframe.energy_particles; i++) {
            const particleX = width * 0.5 + keyframe.hand_position.x + Math.random() * 20 - 10;
            const particleY = height * 0.4 + keyframe.hand_position.y + Math.random() * 20 - 10;
            const particleColor = this.animationColors.magic[Math.floor(Math.random() * this.animationColors.magic.length)];

            this.utils.drawEllipse(image, particleX, particleY, 2, 2, particleColor);
        }

        // Add magical glow
        await this.addMagicalGlow(image, progress);

        // Add spell casting particles
        if (progress > 0.7) {
            await this.addSpellParticles(image, direction);
        }
    }

    /**
     * Generate monster animation sequence
     */
    async generateMonsterAnimation(image, config) {
        const { width, height } = image.bitmap;
        const type = config.animationType || 'slither';
        const species = config.species || 'dragon';
        const behavior = config.behavior || 'aggressive';
        const frameCount = config.frameCount || this.animationDatabase.monster_animations.frame_counts[type];

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

            // Apply monster animation transformations
            await this.applyMonsterAnimationFrame(frameImage, type, species, behavior, frameIndex, frameCount);

            frames.push(frameImage);
        }

        return frames;
    }

    /**
     * Apply monster animation frame transformations
     */
    async applyMonsterAnimationFrame(image, type, species, behavior, frameIndex, totalFrames) {
        const progress = frameIndex / (totalFrames - 1);

        switch (type) {
            case 'slither':
                await this.applySlitherFrame(image, progress, species);
                break;
            case 'fly_flap':
                await this.applyFlyFlapFrame(image, progress, species);
                break;
            case 'hop_jump':
                await this.applyHopJumpFrame(image, progress, species);
                break;
            case 'lunge_attack':
                await this.applyLungeAttackFrame(image, progress, species);
                break;
            case 'bite_snap':
                await this.applyBiteSnapFrame(image, progress, species);
                break;
            case 'roar_bellow':
                await this.applyRoarBellowFrame(image, progress, species);
                break;
        }

        // Apply behavior-specific effects
        await this.applyBehaviorEffect(image, behavior, progress);
    }

    /**
     * Generate object animation sequence
     */
    async generateObjectAnimation(image, config) {
        const { width, height } = image.bitmap;
        const type = config.animationType || 'open_close';
        const object = config.object || 'chest';
        const effect = config.effect || 'magical';
        const frameCount = config.frameCount || this.animationDatabase.object_animations.frame_counts[type];

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

            // Apply object animation transformations
            await this.applyObjectAnimationFrame(frameImage, type, object, effect, frameIndex, frameCount);

            frames.push(frameImage);
        }

        return frames;
    }

    /**
     * Apply object animation frame transformations
     */
    async applyObjectAnimationFrame(image, type, object, effect, frameIndex, totalFrames) {
        const { width, height } = image.bitmap;
        const progress = frameIndex / (totalFrames - 1);

        switch (type) {
            case 'open_close':
                await this.applyOpenCloseFrame(image, progress, object);
                break;
            case 'spin_rotate':
                await this.applySpinRotateFrame(image, progress, object);
                break;
            case 'bounce_bob':
                await this.applyBounceBobFrame(image, progress, object);
                break;
            case 'glow_pulse':
                await this.applyGlowPulseFrame(image, progress, object, effect);
                break;
            case 'shake_rumble':
                await this.applyShakeRumbleFrame(image, progress, object);
                break;
            case 'expand_contract':
                await this.applyExpandContractFrame(image, progress, object);
                break;
            case 'fade_in_out':
                await this.applyFadeInOutFrame(image, progress, object);
                break;
            case 'color_shift':
                await this.applyColorShiftFrame(image, progress, object, effect);
                break;
            case 'orbit_circle':
                await this.applyOrbitCircleFrame(image, progress, object);
                break;
        }
    }

    /**
     * Helper methods for animation effects
     */
    async addMotionBlur(image, offsetX, offsetY, intensity) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const blurX = Math.floor(x + offsetX * intensity);
                const blurY = Math.floor(y + offsetY * intensity);

                if (blurX >= 0 && blurX < width && blurY >= 0 && blurY < height) {
                    const idx = (y * width + x) * 4;
                    const blurIdx = (blurY * width + blurX) * 4;

                    // Blend colors for motion blur effect
                    for (let c = 0; c < 3; c++) {
                        image.bitmap.data[idx + c] = Math.floor(
                            (image.bitmap.data[idx + c] + image.bitmap.data[blurIdx + c]) * 0.5
                        );
                    }
                }
            }
        }
    }

    async addWeaponTrail(image, angle, direction) {
        const { width, height } = image.bitmap;
        const centerX = width * 0.5;
        const centerY = height * 0.4;

        // Calculate trail points based on weapon swing
        for (let i = 0; i < 5; i++) {
            const trailAngle = angle - (i * 10);
            const distance = 20 + (i * 5);
            const trailX = centerX + Math.cos(trailAngle * Math.PI / 180) * distance;
            const trailY = centerY + Math.sin(trailAngle * Math.PI / 180) * distance;

            const alpha = (5 - i) / 5 * 0.5;
            this.utils.drawEllipse(image, trailX, trailY, 3, 3, 0xC0C0C0, alpha);
        }
    }

    async addMagicalGlow(image, progress) {
        const { width, height } = image.bitmap;
        const centerX = width * 0.5;
        const centerY = height * 0.4;

        // Add expanding magical glow
        const glowRadius = 20 + (progress * 30);
        const glowColor = this.animationColors.magic[Math.floor(progress * this.animationColors.magic.length)];

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
            await this.addDustCloud(image, 'south');
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

    // Object animation frame methods
    async applyOpenCloseFrame(image, progress, object) {
        const { width, height } = image.bitmap;

        switch (object) {
            case 'chest':
                // Chest lid opening animation
                const lidAngle = progress * 90;
                // This would require complex transformation
                break;
            case 'door':
                // Door opening animation
                const doorOffset = progress * 20;
                // Apply door opening transformation
                break;
        }
    }

    async applySpinRotateFrame(image, progress, object) {
        const { width, height } = image.bitmap;

        // Rotation angle
        const rotationAngle = progress * Math.PI * 2;

        // Add rotation blur effect
        await this.addRotationBlur(image, rotationAngle);
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
    async addGlowEffect(image, color, intensity) {
        const { width, height } = image.bitmap;

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const glowX = width * 0.5 + Math.cos(angle) * 18;
            const glowY = height * 0.5 + Math.sin(angle) * 24;

            this.utils.drawEllipse(image, glowX, glowY, 2, 2, color, intensity);
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

    async addAngerParticles(image) {
        const { width, height } = image.bitmap;

        for (let i = 0; i < 3; i++) {
            const particleX = width * 0.5 + Math.random() * 20 - 10;
            const particleY = height * 0.3 + Math.random() * 10 - 5;
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, 0xDC143C);
        }
    }

    async addRotationBlur(image, angle) {
        // Add rotational blur effect
        await this.addMotionBlur(image, Math.cos(angle) * 2, Math.sin(angle) * 2, 0.2);
    }

    async addBounceShadow(image, offset) {
        const { width, height } = image.bitmap;
        const shadowY = height * 0.9 + offset;

        // Draw elongated shadow based on bounce height
        for (let x = width * 0.3; x < width * 0.7; x++) {
            const shadowAlpha = 0.3 * (1 - offset / 10);
            this.utils.drawEllipse(image, x, shadowY, 1, 2, 0x000000, shadowAlpha);
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

    // Additional attack and hurt methods
    async applyAttackThrustFrame(image, progress, direction) {
        const { width, height } = image.bitmap;

        // Thrusting motion
        const thrustOffset = progress * 6;

        // Add weapon thrust trail
        await this.addWeaponTrail(image, 0, direction);

        // Add thrust impact
        if (progress > 0.7) {
            await this.addImpactEffect(image, direction);
        }
    }

    async applyBlockDefendFrame(image, progress, direction) {
        const { width, height } = image.bitmap;

        // Defensive blocking pose
        const blockOffset = progress * 2;

        // Add defensive glow
        await this.addGlowEffect(image, 0x4169E1, 0.4);
    }

    async applyHurtReactionFrame(image, progress, direction) {
        const { width, height } = image.bitmap;

        // Hurt reaction with knockback
        const hurtOffset = Math.sin(progress * Math.PI) * 4;

        // Add hurt particles
        for (let i = 0; i < 4; i++) {
            const particleX = width * 0.5 + Math.random() * 15 - 7.5;
            const particleY = height * 0.5 + Math.random() * 15 - 7.5;
            const particleColor = this.animationColors.blood[Math.floor(Math.random() * this.animationColors.blood.length)];
            this.utils.drawEllipse(image, particleX, particleY, 2, 2, particleColor);
        }
    }

    async applyDeathSequenceFrame(image, progress, direction) {
        const { width, height } = image.bitmap;

        // Death sequence with falling motion
        const fallOffset = progress * 8;

        // Add death particles
        if (progress > 0.5) {
            for (let i = 0; i < 3; i++) {
                const particleX = width * 0.5 + Math.random() * 20 - 10;
                const particleY = height * 0.5 + Math.random() * 20 - 10;
                this.utils.drawEllipse(image, particleX, particleY, 2, 2, 0x696969);
            }
        }
    }

    async applyJumpLeapFrame(image, progress, direction) {
        const { width, height } = image.bitmap;

        // Jumping motion with arc
        const jumpHeight = Math.sin(progress * Math.PI) * 8;

        // Add jump dust
        if (progress < 0.3) {
            await this.addDustCloud(image, 'south');
        }
    }
}

module.exports = BasicAnimationSystem;
