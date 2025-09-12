/**
 * TPT UI Generator - JavaScript/Node.js version
 * Procedural UI elements and interface components
 */

const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class UIGenerator {
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
     * Generate UI element
     */
    async generateUIElement(config) {
        const width = config.width || 64;
        const height = config.height || 32;

        this.initCanvas(width, height);

        switch (config.elementType) {
            case 'button':
                this.generateButton(config);
                break;
            case 'panel':
                this.generatePanel(config);
                break;
            case 'icon':
                this.generateIcon(config);
                break;
            case 'progress':
                this.generateProgressBar(config);
                break;
            case 'menu':
                this.generateMenuBackground(config);
                break;
            case 'scrollbar':
                this.generateScrollbar(config);
                break;
            case 'input':
                this.generateTextInput(config);
                break;
            case 'checkbox':
                this.generateCheckbox(config);
                break;
            case 'loading':
                this.generateLoadingIndicator(config);
                break;
            default:
                this.generateButton(config);
        }

        // Convert to buffer
        const buffer = this.canvas.toBuffer('image/png');

        return {
            id: uuidv4(),
            name: `${config.elementType.charAt(0).toUpperCase() + config.elementType.slice(1)} UI Element`,
            type: 'ui',
            sprite: {
                width: width,
                height: height,
                data: buffer.toString('base64'),
                format: 'png'
            },
            config: config,
            metadata: {
                elementType: config.elementType,
                style: config.style || 'default',
                state: config.state || 'normal',
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate button with different states
     */
    generateButton(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const state = config.state || 'normal';
        const style = config.style || 'rounded';

        // Button base
        let baseColor, borderColor, shadowColor;

        switch (state) {
            case 'normal':
                baseColor = config.color || '#4A90E2';
                borderColor = '#357ABD';
                shadowColor = 'rgba(0, 0, 0, 0.2)';
                break;
            case 'hover':
                baseColor = config.color || '#5BA0F2';
                borderColor = '#4A90E2';
                shadowColor = 'rgba(0, 0, 0, 0.3)';
                break;
            case 'pressed':
                baseColor = config.color || '#357ABD';
                borderColor = '#2E5F99';
                shadowColor = 'rgba(0, 0, 0, 0.1)';
                break;
            case 'disabled':
                baseColor = '#CCCCCC';
                borderColor = '#999999';
                shadowColor = 'rgba(0, 0, 0, 0.1)';
                break;
        }

        // Draw shadow
        ctx.fillStyle = shadowColor;
        ctx.fillRect(2, 2, width, height);

        // Draw button body
        ctx.fillStyle = baseColor;
        if (style === 'rounded') {
            this.roundedRect(0, 0, width, height, 8);
            ctx.fill();
        } else if (style === 'square') {
            ctx.fillRect(0, 0, width, height);
        }

        // Draw border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        if (style === 'rounded') {
            this.roundedRect(0, 0, width, height, 8);
            ctx.stroke();
        } else {
            ctx.strokeRect(0, 0, width, height);
        }

        // Add text if specified
        if (config.text) {
            ctx.fillStyle = state === 'disabled' ? '#666666' : '#FFFFFF';
            ctx.font = `${Math.floor(height * 0.4)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.text, width * 0.5, height * 0.5);
        }

        // Add icon if specified
        if (config.icon) {
            this.addIcon(width * 0.5, height * 0.5, config.icon, Math.floor(height * 0.6));
        }
    }

    /**
     * Generate panel/frame
     */
    generatePanel(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const style = config.style || 'bordered';
        const borderWidth = config.borderWidth || 3;
        const borderColor = config.borderColor || '#666666';
        const fillColor = config.fillColor || 'rgba(240, 240, 240, 0.9)';

        // Panel background
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, width, height);

        // Panel border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(borderWidth * 0.5, borderWidth * 0.5, width - borderWidth, height - borderWidth);

        // Add decorative elements
        if (style === 'ornate') {
            // Corner decorations
            ctx.fillStyle = borderColor;
            const cornerSize = Math.min(width, height) * 0.1;

            // Top-left corner
            ctx.fillRect(0, 0, cornerSize, borderWidth);
            ctx.fillRect(0, 0, borderWidth, cornerSize);

            // Top-right corner
            ctx.fillRect(width - cornerSize, 0, cornerSize, borderWidth);
            ctx.fillRect(width - borderWidth, 0, borderWidth, cornerSize);

            // Bottom-left corner
            ctx.fillRect(0, height - borderWidth, cornerSize, borderWidth);
            ctx.fillRect(0, height - cornerSize, borderWidth, cornerSize);

            // Bottom-right corner
            ctx.fillRect(width - cornerSize, height - borderWidth, cornerSize, borderWidth);
            ctx.fillRect(width - borderWidth, height - cornerSize, borderWidth, cornerSize);
        }
    }

    /**
     * Generate icon
     */
    generateIcon(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const iconType = config.iconType || 'gear';
        const color = config.color || '#666666';

        ctx.fillStyle = color;

        switch (iconType) {
            case 'gear':
                this.drawGear(width * 0.5, height * 0.5, Math.min(width, height) * 0.4);
                break;
            case 'heart':
                this.drawHeart(width * 0.5, height * 0.5, Math.min(width, height) * 0.4);
                break;
            case 'star':
                this.drawStar(width * 0.5, height * 0.5, Math.min(width, height) * 0.4);
                break;
            case 'arrow':
                this.drawArrow(width * 0.5, height * 0.5, Math.min(width, height) * 0.4);
                break;
            case 'check':
                this.drawCheck(width * 0.5, height * 0.5, Math.min(width, height) * 0.4);
                break;
            case 'cross':
                this.drawCross(width * 0.5, height * 0.5, Math.min(width, height) * 0.4);
                break;
            default:
                this.drawCircle(width * 0.5, height * 0.5, Math.min(width, height) * 0.3);
        }
    }

    /**
     * Generate progress bar
     */
    generateProgressBar(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const progress = Math.max(0, Math.min(1, config.progress || 0));
        const bgColor = config.bgColor || '#E0E0E0';
        const fillColor = config.fillColor || '#4A90E2';
        const borderColor = config.borderColor || '#CCCCCC';

        // Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Progress fill
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, width * progress, height);

        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, width, height);

        // Progress text
        if (config.showText) {
            ctx.fillStyle = '#000000';
            ctx.font = `${Math.floor(height * 0.6)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.round(progress * 100)}%`, width * 0.5, height * 0.5);
        }
    }

    /**
     * Generate menu background
     */
    generateMenuBackground(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const style = config.style || 'gradient';
        const color1 = config.color1 || '#4A90E2';
        const color2 = config.color2 || '#357ABD';

        if (style === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (style === 'pattern') {
            // Simple pattern background
            ctx.fillStyle = color1;
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = color2;
            for (let x = 0; x < width; x += 20) {
                for (let y = 0; y < height; y += 20) {
                    if ((x + y) % 40 === 0) {
                        ctx.fillRect(x, y, 10, 10);
                    }
                }
            }
        }

        // Add border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);
    }

    /**
     * Generate scrollbar
     */
    generateScrollbar(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const orientation = config.orientation || 'vertical';
        const trackColor = config.trackColor || '#F0F0F0';
        const thumbColor = config.thumbColor || '#CCCCCC';
        const thumbPosition = config.thumbPosition || 0;

        // Track
        ctx.fillStyle = trackColor;
        ctx.fillRect(0, 0, width, height);

        // Thumb
        ctx.fillStyle = thumbColor;
        if (orientation === 'vertical') {
            const thumbHeight = Math.max(20, height * 0.3);
            const thumbY = thumbPosition * (height - thumbHeight);
            ctx.fillRect(2, thumbY, width - 4, thumbHeight);
        } else {
            const thumbWidth = Math.max(20, width * 0.3);
            const thumbX = thumbPosition * (width - thumbWidth);
            ctx.fillRect(thumbX, 2, thumbWidth, height - 4);
        }

        // Border
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, width, height);
    }

    /**
     * Generate text input field
     */
    generateTextInput(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const bgColor = config.bgColor || '#FFFFFF';
        const borderColor = config.borderColor || '#CCCCCC';
        const textColor = config.textColor || '#000000';
        const placeholder = config.placeholder || '';

        // Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);

        // Placeholder text
        if (placeholder) {
            ctx.fillStyle = '#999999';
            ctx.font = `${Math.floor(height * 0.6)}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(placeholder, 8, height * 0.5);
        }

        // Cursor
        if (config.showCursor) {
            ctx.fillStyle = textColor;
            ctx.fillRect(width * 0.5, height * 0.2, 2, height * 0.6);
        }
    }

    /**
     * Generate checkbox
     */
    generateCheckbox(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const size = Math.min(width, height);
        const checked = config.checked || false;
        const bgColor = config.bgColor || '#FFFFFF';
        const borderColor = config.borderColor || '#CCCCCC';
        const checkColor = config.checkColor || '#4A90E2';

        // Checkbox background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Checkbox border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, size - 2, size - 2);

        // Check mark
        if (checked) {
            ctx.strokeStyle = checkColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(size * 0.2, size * 0.5);
            ctx.lineTo(size * 0.4, size * 0.7);
            ctx.lineTo(size * 0.8, size * 0.3);
            ctx.stroke();
        }
    }

    /**
     * Generate loading indicator
     */
    generateLoadingIndicator(config) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const radius = Math.min(width, height) * 0.4;
        const segments = config.segments || 8;
        const color = config.color || '#4A90E2';

        for (let i = 0; i < segments; i++) {
            const angle = (Math.PI * 2 * i) / segments;
            const alpha = (i / segments) * 0.8 + 0.2;

            ctx.fillStyle = this.hexToRgba(color, alpha);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, angle, angle + Math.PI * 2 / segments);
            ctx.lineTo(centerX, centerY);
            ctx.fill();
        }
    }

    /**
     * Helper function to draw rounded rectangle
     */
    roundedRect(x, y, width, height, radius) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Add icon to UI element
     */
    addIcon(x, y, iconType, size) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x - size * 0.5, y - size * 0.5);

        switch (iconType) {
            case 'play':
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(size, size * 0.5);
                ctx.lineTo(0, size);
                ctx.closePath();
                ctx.fill();
                break;
            case 'pause':
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size * 0.3, size);
                ctx.fillRect(size * 0.7, 0, size * 0.3, size);
                break;
            case 'settings':
                this.drawGear(size * 0.5, size * 0.5, size * 0.4);
                break;
        }

        ctx.restore();
    }

    /**
     * Draw gear icon
     */
    drawGear(x, y, radius) {
        const ctx = this.ctx;
        const teeth = 8;
        const toothHeight = radius * 0.2;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();

        for (let i = 0; i < teeth; i++) {
            const angle = (Math.PI * 2 * i) / teeth;
            const nextAngle = (Math.PI * 2 * (i + 1)) / teeth;

            // Tooth
            const toothAngle = angle + Math.PI / teeth;
            const toothX = x + Math.cos(toothAngle) * (radius + toothHeight);
            const toothY = y + Math.sin(toothAngle) * (radius + toothHeight);

            if (i === 0) {
                ctx.moveTo(toothX, toothY);
            } else {
                ctx.lineTo(toothX, toothY);
            }

            // Inner curve
            ctx.arc(x, y, radius, toothAngle, nextAngle);
        }

        ctx.closePath();
        ctx.fill();

        // Center hole
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw heart icon
     */
    drawHeart(x, y, size) {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x, y + size * 0.3);
        ctx.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
        ctx.bezierCurveTo(x - size * 0.5, y + size * 0.6, x, y + size, x, y + size);
        ctx.bezierCurveTo(x, y + size, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.3);
        ctx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);
        ctx.fill();
    }

    /**
     * Draw star icon
     */
    drawStar(x, y, size) {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();

        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x1 = x + Math.cos(angle) * size;
            const y1 = y + Math.sin(angle) * size;

            if (i === 0) {
                ctx.moveTo(x1, y1);
            } else {
                ctx.lineTo(x1, y1);
            }

            const innerAngle = angle + Math.PI / 5;
            const x2 = x + Math.cos(innerAngle) * (size * 0.5);
            const y2 = y + Math.sin(innerAngle) * (size * 0.5);
            ctx.lineTo(x2, y2);
        }

        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw arrow icon
     */
    drawArrow(x, y, size) {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.5);
        ctx.lineTo(x + size * 0.5, y);
        ctx.lineTo(x + size * 0.25, y);
        ctx.lineTo(x + size * 0.25, y + size * 0.5);
        ctx.lineTo(x - size * 0.25, y + size * 0.5);
        ctx.lineTo(x - size * 0.25, y);
        ctx.lineTo(x - size * 0.5, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw check icon
     */
    drawCheck(x, y, size) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.4, y);
        ctx.lineTo(x - size * 0.1, y + size * 0.3);
        ctx.lineTo(x + size * 0.4, y - size * 0.3);
        ctx.stroke();
    }

    /**
     * Draw cross icon
     */
    drawCross(x, y, size) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.4, y - size * 0.4);
        ctx.lineTo(x + size * 0.4, y + size * 0.4);
        ctx.moveTo(x + size * 0.4, y - size * 0.4);
        ctx.lineTo(x - size * 0.4, y + size * 0.4);
        ctx.stroke();
    }

    /**
     * Draw circle icon
     */
    drawCircle(x, y, radius) {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
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
     * Save UI element to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.sprite.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = UIGenerator;
