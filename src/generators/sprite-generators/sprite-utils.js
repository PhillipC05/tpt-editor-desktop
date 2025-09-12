/**
 * Sprite Utilities - Common functions for sprite generation
 */

const Jimp = require('jimp');

class SpriteUtils {
    constructor() {}

    /**
     * Get rarity configuration
     */
    getRarityConfig(rarity) {
        const configs = {
            common: { color: '#C0C0C0', glow: false, prefix: '', value: 10 },
            uncommon: { color: '#00FF00', glow: false, prefix: 'Uncommon ', value: 25 },
            rare: { color: '#0080FF', glow: true, prefix: 'Rare ', value: 50 },
            epic: { color: '#8000FF', glow: true, prefix: 'Epic ', value: 100 },
            legendary: { color: '#FFD700', glow: true, prefix: 'Legendary ', value: 250 },
            mythical: { color: '#FF4500', glow: true, prefix: 'Mythical ', value: 500 }
        };
        return configs[rarity] || configs.common;
    }

    /**
     * Convert hex color to Jimp color
     */
    getColor(hexColor) {
        return Jimp.cssColorToHex(hexColor);
    }

    /**
     * Draw a circle/ellipse shape
     */
    drawEllipse(image, centerX, centerY, radiusX, radiusY, color) {
        const { width, height } = image.bitmap;

        for (let y = Math.max(0, centerY - radiusY); y <= Math.min(height - 1, centerY + radiusY); y++) {
            for (let x = Math.max(0, centerX - radiusX); x <= Math.min(width - 1, centerX + radiusX); x++) {
                const dx = (x - centerX) / radiusX;
                const dy = (y - centerY) / radiusY;
                if (dx * dx + dy * dy <= 1) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx] = (color >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = color & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }
    }

    /**
     * Draw a rectangle
     */
    drawRectangle(image, startX, startY, width, height, color) {
        const imgWidth = image.bitmap.width;
        const imgHeight = image.bitmap.height;

        for (let y = Math.max(0, startY); y < Math.min(startY + height, imgHeight); y++) {
            for (let x = Math.max(0, startX); x < Math.min(startX + width, imgWidth); x++) {
                const idx = (y * imgWidth + x) * 4;
                image.bitmap.data[idx] = (color >> 16) & 0xFF;
                image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                image.bitmap.data[idx + 2] = color & 0xFF;
                image.bitmap.data[idx + 3] = 255;
            }
        }
    }

    /**
     * Draw a line using Bresenham's algorithm
     */
    drawLine(image, x1, y1, x2, y2, color) {
        const imgWidth = image.bitmap.width;
        const imgHeight = image.bitmap.height;

        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;

        let x = x1;
        let y = y1;

        while (true) {
            if (x >= 0 && x < imgWidth && y >= 0 && y < imgHeight) {
                const idx = (y * imgWidth + x) * 4;
                image.bitmap.data[idx] = (color >> 16) & 0xFF;
                image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                image.bitmap.data[idx + 2] = color & 0xFF;
                image.bitmap.data[idx + 3] = 255;
            }

            if (x === x2 && y === y2) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }

    /**
     * Draw rounded rectangle
     */
    drawRoundedRect(image, x, y, width, height, radius, color) {
        // Draw main rectangle
        this.drawRectangle(image, x + radius, y, width - 2 * radius, height, color);
        this.drawRectangle(image, x, y + radius, width, height - 2 * radius, color);
        
        // Draw corners as quarter circles
        this.drawQuarterCircle(image, x + radius, y + radius, radius, color, 'top-left');
        this.drawQuarterCircle(image, x + width - radius, y + radius, radius, color, 'top-right');
        this.drawQuarterCircle(image, x + radius, y + height - radius, radius, color, 'bottom-left');
        this.drawQuarterCircle(image, x + width - radius, y + height - radius, radius, color, 'bottom-right');
    }

    /**
     * Draw quarter circle for rounded corners
     */
    drawQuarterCircle(image, centerX, centerY, radius, color, corner) {
        const { width, height } = image.bitmap;
        const startAngle = corner === 'top-left' ? Math.PI : corner === 'top-right' ? 0 : corner === 'bottom-left' ? Math.PI / 2 : 3 * Math.PI / 2;
        const endAngle = startAngle + Math.PI / 2;

        for (let angle = startAngle; angle < endAngle; angle += 0.1) {
            const x = Math.floor(centerX + radius * Math.cos(angle));
            const y = Math.floor(centerY + radius * Math.sin(angle));
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (y * width + x) * 4;
                image.bitmap.data[idx] = (color >> 16) & 0xFF;
                image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                image.bitmap.data[idx + 2] = color & 0xFF;
                image.bitmap.data[idx + 3] = 255;
            }
        }
    }

    /**
     * Draw shadow under sprite
     */
    drawShadow(image, width, height) {
        const shadowColor = Jimp.cssColorToHex('rgba(0,0,0,0.3)');
        const shadowSize = Math.floor(width * 0.1);
        
        // Draw subtle ground shadow
        for (let y = height - shadowSize; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = Math.max(0, 50 - Math.abs(x - width/2) * 2);
                const idx = (y * width + x) * 4;
                image.bitmap.data[idx] = 0;     // R
                image.bitmap.data[idx + 1] = 0; // G  
                image.bitmap.data[idx + 2] = 0; // B
                image.bitmap.data[idx + 3] = alpha; // A
            }
        }
    }

    /**
     * Draw hair on head
     */
    drawHair(image, centerX, centerY, radius, color, style = 'short') {
        const { width, height } = image.bitmap;
        
        if (style === 'short') {
            // Short spiky hair
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const spikeLength = this.random(radius * 0.3, radius * 0.6);
                const endX = centerX + Math.cos(angle) * spikeLength;
                const endY = centerY + Math.sin(angle) * spikeLength * 0.7; // Flatter hair
                this.drawLine(image, centerX, centerY, endX, endY, color);
            }
        } else if (style === 'long') {
            // Long flowing hair
            this.drawEllipse(image, centerX, centerY - radius * 0.5, radius * 1.2, radius * 0.8, color);
        }
    }

    /**
     * Draw eyes
     */
    drawEyes(image, centerX, centerY, headRadius) {
        const eyeRadius = headRadius * 0.08;
        const eyeDistance = headRadius * 0.4;
        
        // Left eye
        this.drawEllipse(image, centerX - eyeDistance, centerY, eyeRadius * 1.5, eyeRadius, Jimp.cssColorToHex('#000000'));
        
        // Right eye
        this.drawEllipse(image, centerX + eyeDistance, centerY, eyeRadius * 1.5, eyeRadius, Jimp.cssColorToHex('#000000'));
        
        // Eye highlights
        const highlightColor = Jimp.cssColorToHex('#FFFFFF');
        this.drawEllipse(image, centerX - eyeDistance + 2, centerY - 2, eyeRadius * 0.6, eyeRadius * 0.6, highlightColor);
        this.drawEllipse(image, centerX + eyeDistance + 2, centerY - 2, eyeRadius * 0.6, eyeRadius * 0.6, highlightColor);
    }

    /**
     * Draw mouth
     */
    drawMouth(image, centerX, centerY, headRadius) {
        const mouthWidth = headRadius * 0.6;
        const mouthHeight = headRadius * 0.15;
        
        // Simple curved mouth
        for (let x = centerX - mouthWidth/2; x <= centerX + mouthWidth/2; x++) {
            const y = centerY + Math.sqrt(mouthHeight * mouthHeight - Math.pow(x - centerX, 2) / (mouthWidth/2 * mouthWidth/2) * mouthHeight * mouthHeight);
            if (y >= 0 && y < image.bitmap.height) {
                this.drawLine(image, x, Math.floor(y), x, Math.floor(y) + 1, Jimp.cssColorToHex('#8B0000'));
            }
        }
    }

    /**
     * Draw shading for depth
     */
    drawShading(image, x, y, width, height, shadowColor, intensity = 0.3) {
        const alpha = Math.floor(255 * intensity);
        this.drawRectangle(image, x, y, width, height, Jimp.cssColorToHex(`rgba(0,0,0,${alpha})`));
    }

    /**
     * Draw leather straps
     */
    drawLeatherStraps(image, centerX, centerY, width, height, color) {
        const strapColor = this.getColor(color);
        const strapWidth = Math.floor(width * 0.05);
        
        // Diagonal strap across chest
        this.drawLine(image, centerX - width/2, centerY, centerX + width/2, centerY + height, strapColor);
        this.drawLine(image, centerX - width/2 + 2, centerY, centerX + width/2 + 2, centerY + height, strapColor);
        
        // Horizontal belt
        this.drawRectangle(image, centerX - width/2, centerY + height * 0.7, width, strapWidth, strapColor);
    }

    /**
     * Draw arm (upper or lower)
     */
    drawArm(image, startX, startY, length, width, color, type) {
        const armColor = this.getColor(color);
        
        if (type.includes('upper')) {
            // Upper arm with shoulder pad
            this.drawRoundedRect(image, startX, startY, width, length * 0.6, 2, armColor);
            
            // Shoulder joint
            this.drawEllipse(image, startX + width/2, startY, width * 1.2, width * 0.8, armColor);
        } else {
            // Lower arm
            this.drawRoundedRect(image, startX, startY, width * 0.9, length, 2, armColor);
        }
    }

    /**
     * Draw leg
     */
    drawLeg(image, startX, startY, length, width, color, side) {
        const legColor = this.getColor(color);
        this.drawRoundedRect(image, startX, startY, width, length, 2, legColor);
        
        // Knee joint
        const kneeY = startY + length * 0.6;
        this.drawEllipse(image, startX + width/2, kneeY, width * 1.1, width * 0.7, legColor);
    }

    /**
     * Draw boot
     */
    drawBoot(image, startX, startY, width, color) {
        const bootColor = this.getColor(color);
        this.drawRoundedRect(image, startX - width * 0.1, startY, width * 1.2, width * 0.8, 3, bootColor);
        
        // Boot sole
        this.drawRectangle(image, startX - width * 0.1, startY + width * 0.8, width * 1.2, width * 0.1, this.getColor('#333333'));
    }

    /**
     * Draw belt
     */
    drawBelt(image, centerX, centerY, width, color) {
        const beltColor = this.getColor(color);
        const beltHeight = Math.floor(width * 0.04);
        this.drawRoundedRect(image, centerX - width/2, centerY, width, beltHeight, 2, beltColor);
    }

    /**
     * Draw belt buckle
     */
    drawBeltBuckle(image, centerX, centerY, size, color) {
        const buckleColor = this.getColor(color);
        this.drawRoundedRect(image, centerX - size/2, centerY - size/2, size, size, 2, buckleColor);
        
        // Buckle detail
        this.drawEllipse(image, centerX, centerY, size * 0.3, size * 0.3, this.getColor('#8B4513'));
    }

    /**
     * Draw pauldrons (shoulder armor)
     */
    drawPauldron(image, centerX, centerY, size, color, side) {
        const pauldronColor = this.getColor(color);
        const offset = side === 'left' ? -1 : 1;
        
        // Main pauldron
        this.drawRoundedRect(image, centerX + offset * size * 0.3, centerY, size, size * 1.2, 3, pauldronColor);
        
        // Spikes
        for (let i = 0; i < 3; i++) {
            const spikeX = centerX + offset * (size * 0.5 + i * size * 0.2);
            const spikeY = centerY + size * 0.1;
            this.drawSpike(image, spikeX, spikeY, size * 0.15, pauldronColor);
        }
    }

    /**
     * Draw spike decoration
     */
    drawSpike(image, centerX, centerY, size, color) {
        const spikeColor = this.getColor(color);
        
        // Main spike triangle
        this.drawTriangle(image, centerX, centerY - size, centerX - size * 0.5, centerY + size * 0.5, centerX + size * 0.5, centerY + size * 0.5, spikeColor);
    }

    /**
     * Draw triangle (basic implementation)
     */
    drawTriangle(image, x1, y1, x2, y2, x3, y3, color) {
        this.drawLine(image, x1, y1, x2, y2, color);
        this.drawLine(image, x2, y2, x3, y3, color);
        this.drawLine(image, x3, y3, x1, y1, color);
    }

    /**
     * Draw rivets on armor
     */
    drawRivets(image, centerX, centerY, count, color) {
        const rivetColor = this.getColor(color);
        const rivetSize = Math.floor(count * 2);
        
        for (let i = 0; i < count; i++) {
            const rivetX = centerX + (i - count/2) * 8;
            const rivetY = centerY;
            this.drawEllipse(image, rivetX, rivetY, rivetSize, rivetSize, rivetColor);
            
            // Rivet highlight
            this.drawEllipse(image, rivetX - 1, rivetY - 1, rivetSize * 0.6, rivetSize * 0.6, this.getColor('#FFFFFF'));
        }
    }

    /**
     * Draw detailed blade for weapons
     */
    drawBlade(image, startX, startY, width, length, color) {
        const bladeColor = this.getColor(color);
        
        // Main blade body
        this.drawRoundedRect(image, startX, startY, width, length, 1, bladeColor);
        
        // Blade edges
        this.drawLine(image, startX, startY, startX + width, startY + length, this.getColor('#C0C0C0'));
        this.drawLine(image, startX, startY + length, startX + width, startY, this.getColor('#C0C0C0'));
    }

    /**
     * Draw blade tip
     */
    drawBladeTip(image, tipX, tipY, color) {
        const tipColor = this.getColor(color);
        this.drawTriangle(image, tipX, tipY, tipX - 3, tipY + 6, tipX + 3, tipY + 6, tipColor);
    }

    /**
     * Draw highlight on metallic surfaces
     */
    drawHighlight(image, x, y, width, height, color, intensity = 0.2) {
        const alpha = Math.floor(255 * intensity);
        this.drawRectangle(image, x, y, Math.floor(width * 0.3), Math.floor(height * 0.4), Jimp.cssColorToHex(`rgba(255,255,255,${alpha})`));
    }

    /**
     * Generate random number within range
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generate random float within range
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Add transparency to a region
     */
    addTransparency(image, startX, startY, width, height, alpha) {
        const imgWidth = image.bitmap.width;
        const imgHeight = image.bitmap.height;

        for (let y = Math.max(0, startY); y < Math.min(startY + height, imgHeight); y++) {
            for (let x = Math.max(0, startX); x < Math.min(startX + width, imgWidth); x++) {
                const idx = (y * imgWidth + x) * 4;
                image.bitmap.data[idx + 3] = Math.min(image.bitmap.data[idx + 3], alpha);
            }
        }
    }

    /**
     * Apply a simple glow effect
     */
    applyGlow(image, centerX, centerY, radius, color, intensity = 0.5) {
        const imgWidth = image.bitmap.width;
        const imgHeight = image.bitmap.height;

        for (let y = Math.max(0, centerY - radius); y <= Math.min(imgHeight - 1, centerY + radius); y++) {
            for (let x = Math.max(0, centerX - radius); x <= Math.min(imgWidth - 1, centerX + radius); x++) {
                const dx = (x - centerX) / radius;
                const dy = (y - centerY) / radius;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= 1) {
                    const idx = (y * imgWidth + x) * 4;
                    const alpha = Math.floor((1 - distance) * intensity * 255);

                    // Blend with existing color
                    const existingR = image.bitmap.data[idx];
                    const existingG = image.bitmap.data[idx + 1];
                    const existingB = image.bitmap.data[idx + 2];

                    const glowR = (color >> 16) & 0xFF;
                    const glowG = (color >> 8) & 0xFF;
                    const glowB = color & 0xFF;

                    image.bitmap.data[idx] = Math.floor((existingR * (255 - alpha) + glowR * alpha) / 255);
                    image.bitmap.data[idx + 1] = Math.floor((existingG * (255 - alpha) + glowG * alpha) / 255);
                    image.bitmap.data[idx + 2] = Math.floor((existingB * (255 - alpha) + glowB * alpha) / 255);
                    image.bitmap.data[idx + 3] = Math.max(image.bitmap.data[idx + 3], alpha);
                }
            }
        }
    }
}

module.exports = SpriteUtils;
