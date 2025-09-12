/**
 * TPT Particle Generator - JavaScript/Node.js version
 * Procedural particle effects and animations
 */

const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ParticleGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Initialize canvas with given dimensions
     */
    initCanvas(width, height) {
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');

        // Enable alpha blending
        this.ctx.globalCompositeOperation = 'source-over';

        // Clear canvas with transparent background
        this.ctx.clearRect(0, 0, width, height);
    }

    /**
     * Generate particle effect
     */
    async generateParticleEffect(config) {
        const width = config.width || 64;
        const height = config.height || 64;

        this.initCanvas(width, height);

        switch (config.effectType) {
            case 'explosion':
                this.generateExplosion(config);
                break;
            case 'fire':
                this.generateFire(config);
                break;
            case 'magic':
                this.generateMagic(config);
                break;
            case 'weather':
                this.generateWeather(config);
                break;
            case 'light':
                this.generateLight(config);
                break;
            case 'transition':
                this.generateTransition(config);
                break;
            default:
                this.generateExplosion(config);
        }

        // Convert to buffer
        const buffer = this.canvas.toBuffer('image/png');

        return {
            id: uuidv4(),
            name: `${config.effectType.charAt(0).toUpperCase() + config.effectType.slice(1)} Effect`,
            type: 'particle',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                effectType: config.effectType,
                frameCount: config.frameCount || 1,
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate explosion effect
     */
    generateExplosion(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const intensity = config.intensity || 1.0;

        // Create explosion particles
        for (let i = 0; i < 50 * intensity; i++) {
            const angle = (Math.PI * 2 * i) / (50 * intensity);
            const distance = Math.random() * width * 0.4;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            const size = Math.random() * 4 + 1;
            const alpha = Math.random() * 0.8 + 0.2;

            // Color gradient from yellow to red to black
            const colorProgress = Math.random();
            let color;
            if (colorProgress < 0.3) {
                color = `rgba(255, 255, 0, ${alpha})`; // Yellow
            } else if (colorProgress < 0.7) {
                color = `rgba(255, 165, 0, ${alpha})`; // Orange
            } else {
                color = `rgba(0, 0, 0, ${alpha})`; // Black
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size, 0, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Add shockwave
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, width * 0.3, height * 0.3, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }

    /**
     * Generate fire effect
     */
    generateFire(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const baseY = height * 0.8;

        // Create flame particles
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = baseY - Math.random() * height * 0.6;

            const size = Math.random() * 3 + 1;
            const alpha = Math.random() * 0.9 + 0.1;

            // Color gradient from red to yellow
            const colorProgress = y / height;
            const r = Math.floor(255);
            const g = Math.floor(255 * (1 - colorProgress));
            const b = Math.floor(100 * (1 - colorProgress));

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 1.5, 0, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Add glow effect
        const gradient = ctx.createRadialGradient(width * 0.5, baseY, 0, width * 0.5, baseY, width * 0.4);
        gradient.addColorStop(0, 'rgba(255, 100, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Generate magic effect
     */
    generateMagic(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Create magical particles
        for (let i = 0; i < 80; i++) {
            const angle = (Math.PI * 2 * i) / 80;
            const radius = Math.random() * width * 0.3;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const size = Math.random() * 2 + 1;
            const alpha = Math.random() * 0.8 + 0.2;

            // Magical colors
            const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#0000FF'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            ctx.fillStyle = this.hexToRgba(color, alpha);
            ctx.beginPath();
            ctx.ellipse(x, y, size, size, 0, 0, 2 * Math.PI);
            ctx.fill();

            // Add sparkle effect
            if (Math.random() < 0.3) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(x - 1, y - 1, 2, 2);
            }
        }

        // Add magical glow
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.4);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Generate weather effect
     */
    generateWeather(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const weatherType = config.weatherType || 'rain';

        if (weatherType === 'rain') {
            // Rain drops
            ctx.strokeStyle = 'rgba(200, 200, 255, 0.6)';
            ctx.lineWidth = 1;

            for (let i = 0; i < 50; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const length = Math.random() * 10 + 5;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 2, y + length);
                ctx.stroke();
            }
        } else if (weatherType === 'snow') {
            // Snowflakes
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

            for (let i = 0; i < 30; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 3 + 1;

                ctx.beginPath();
                ctx.ellipse(x, y, size, size, 0, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        // Add atmospheric effect
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(200, 200, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(200, 200, 255, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Generate light effect
     */
    generateLight(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Light rays
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;

        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const startRadius = width * 0.1;
            const endRadius = width * 0.4;

            ctx.beginPath();
            ctx.moveTo(
                centerX + Math.cos(angle) * startRadius,
                centerY + Math.sin(angle) * startRadius
            );
            ctx.lineTo(
                centerX + Math.cos(angle) * endRadius,
                centerY + Math.sin(angle) * endRadius
            );
            ctx.stroke();
        }

        // Central glow
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Generate transition effect
     */
    generateTransition(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const transitionType = config.transitionType || 'fade';

        if (transitionType === 'fade') {
            // Simple fade to black
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (transitionType === 'swirl') {
            // Swirling particles
            for (let i = 0; i < 100; i++) {
                const angle = (Math.PI * 2 * i) / 100;
                const radius = Math.random() * width * 0.4;
                const x = width * 0.5 + Math.cos(angle) * radius;
                const y = height * 0.5 + Math.sin(angle) * radius;

                const size = Math.random() * 2 + 1;
                const alpha = Math.random() * 0.6 + 0.2;

                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.ellipse(x, y, size, size, 0, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    /**
     * Create particle emitter
     */
    createParticleEmitter(config) {
        const particles = [];
        const particleCount = config.particleCount || 20;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: config.emitX || 0,
                y: config.emitY || 0,
                vx: (Math.random() - 0.5) * (config.speed || 2),
                vy: (Math.random() - 0.5) * (config.speed || 2),
                life: config.life || 60,
                maxLife: config.life || 60,
                size: config.size || 2,
                color: config.color || '#FFFFFF',
                alpha: 1.0
            });
        }

        return particles;
    }

    /**
     * Update particles
     */
    updateParticles(particles) {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;

            // Apply gravity if specified
            if (particle.gravity) {
                particle.vy += particle.gravity;
            }
        });

        // Remove dead particles
        return particles.filter(particle => particle.life > 0);
    }

    /**
     * Render particles
     */
    renderParticles(particles) {
        const ctx = this.ctx;

        particles.forEach(particle => {
            ctx.fillStyle = this.hexToRgba(particle.color, particle.alpha);
            ctx.beginPath();
            ctx.ellipse(particle.x, particle.y, particle.size, particle.size, 0, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    /**
     * Generate animation frames
     */
    async generateAnimationFrames(config) {
        const frames = [];
        const frameCount = config.frameCount || 8;

        for (let frame = 0; frame < frameCount; frame++) {
            const width = config.width || 64;
            const height = config.height || 64;

            this.initCanvas(width, height);

            // Generate frame based on effect type
            const frameConfig = { ...config, frame: frame, frameProgress: frame / (frameCount - 1) };
            this.generateParticleEffect(frameConfig);

            const buffer = this.canvas.toBuffer('image/png');
            frames.push({
                frame: frame,
                data: buffer.toString('base64')
            });
        }

        return frames;
    }

    /**
     * Apply color gradient to particles
     */
    applyColorGradient(particles, startColor, endColor) {
        particles.forEach((particle, index) => {
            const progress = index / particles.length;
            particle.color = this.interpolateColor(startColor, endColor, progress);
        });
    }

    /**
     * Apply size variation
     */
    applySizeVariation(particles, minSize, maxSize) {
        particles.forEach(particle => {
            particle.size = minSize + Math.random() * (maxSize - minSize);
        });
    }

    /**
     * Apply opacity control
     */
    applyOpacityControl(particles, fadeIn = false, fadeOut = true) {
        particles.forEach(particle => {
            if (fadeIn && particle.life > particle.maxLife * 0.8) {
                particle.alpha *= (particle.maxLife - particle.life) / (particle.maxLife * 0.2);
            }
            if (fadeOut && particle.life < particle.maxLife * 0.2) {
                particle.alpha *= particle.life / (particle.maxLife * 0.2);
            }
        });
    }

    /**
     * Apply movement patterns
     */
    applyMovementPattern(particles, pattern = 'radial') {
        particles.forEach((particle, index) => {
            if (pattern === 'radial') {
                const angle = (Math.PI * 2 * index) / particles.length;
                particle.vx = Math.cos(angle) * 2;
                particle.vy = Math.sin(angle) * 2;
            } else if (pattern === 'spiral') {
                const angle = (Math.PI * 2 * index) / particles.length;
                const radius = index * 0.1;
                particle.vx = Math.cos(angle + radius) * 2;
                particle.vy = Math.sin(angle + radius) * 2;
            }
        });
    }

    /**
     * Helper function to convert hex to rgba
     */
    hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Helper function to interpolate colors
     */
    interpolateColor(color1, color2, factor) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Save particle effect to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = ParticleGenerator;
