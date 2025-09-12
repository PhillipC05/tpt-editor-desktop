/**
 * TPT Spectrum Visualizer - Real-time frequency spectrum display
 */

class SpectrumVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.frequencyData = null;
        this.color = '#4A90E2';
        this.backgroundColor = '#FFFFFF';
        this.barWidth = 2;
        this.isDrawing = false;
        this.smoothing = 0.8;
        this.previousData = null;
    }

    setFrequencyData(frequencyData) {
        // Apply smoothing
        if (this.previousData && this.smoothing > 0) {
            for (let i = 0; i < frequencyData.length; i++) {
                frequencyData[i] = frequencyData[i] * (1 - this.smoothing) + this.previousData[i] * this.smoothing;
            }
        }

        this.frequencyData = new Uint8Array(frequencyData);
        this.previousData = new Uint8Array(frequencyData);
        this.draw();
    }

    setColor(color) {
        this.color = color;
        if (this.frequencyData) this.draw();
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        if (this.frequencyData) this.draw();
    }

    setBarWidth(width) {
        this.barWidth = width;
        if (this.frequencyData) this.draw();
    }

    setSmoothing(smoothing) {
        this.smoothing = Math.max(0, Math.min(1, smoothing));
    }

    draw() {
        if (!this.frequencyData || this.isDrawing) return;

        this.isDrawing = true;

        const { width, height } = this.canvas;

        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        const barCount = Math.min(this.frequencyData.length, Math.floor(width / (this.barWidth + 1)));
        const barSpacing = 1;
        const totalBarWidth = barCount * (this.barWidth + barSpacing) - barSpacing;
        const startX = (width - totalBarWidth) / 2;

        for (let i = 0; i < barCount; i++) {
            const barHeight = (this.frequencyData[i] / 255) * height;
            const x = startX + i * (this.barWidth + barSpacing);
            const y = height - barHeight;

            // Create gradient for each bar
            const gradient = this.ctx.createLinearGradient(0, height, 0, y);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.7, this.lightenColor(this.color, 0.3));
            gradient.addColorStop(1, this.lightenColor(this.color, 0.6));

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, this.barWidth, barHeight);

            // Add glow effect
            this.ctx.shadowColor = this.color;
            this.ctx.shadowBlur = 4;
            this.ctx.fillRect(x, y, this.barWidth, barHeight);
            this.ctx.shadowBlur = 0;
        }

        this.isDrawing = false;
    }

    clear() {
        const { width, height } = this.canvas;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);
        this.frequencyData = null;
        this.previousData = null;
    }

    // Lighten color for gradient
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Draw circular spectrum
    drawCircular() {
        if (!this.frequencyData || this.isDrawing) return;

        this.isDrawing = true;

        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;

        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        const barCount = this.frequencyData.length;

        for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * Math.PI * 2;
            const barLength = (this.frequencyData[i] / 255) * radius * 0.8;

            const x1 = centerX + Math.cos(angle) * radius * 0.2;
            const y1 = centerY + Math.sin(angle) * radius * 0.2;

            const x2 = centerX + Math.cos(angle) * (radius * 0.2 + barLength);
            const y2 = centerY + Math.sin(angle) * (radius * 0.2 + barLength);

            // Create gradient for each bar
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, this.lightenColor(this.color, 0.5));

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        this.isDrawing = false;
    }

    // Draw with mirror effect
    drawMirrored() {
        if (!this.frequencyData || this.isDrawing) return;

        this.isDrawing = true;

        const { width, height } = this.canvas;

        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        const barCount = Math.min(this.frequencyData.length, Math.floor(width / 2 / (this.barWidth + 1)));
        const barSpacing = 1;
        const totalBarWidth = barCount * (this.barWidth + barSpacing) - barSpacing;
        const centerX = width / 2;

        for (let i = 0; i < barCount; i++) {
            const barHeight = (this.frequencyData[i] / 255) * height * 0.4;
            const x = centerX - totalBarWidth / 2 + i * (this.barWidth + barSpacing);
            const y = height / 2 - barHeight;

            // Left side
            const gradientLeft = this.ctx.createLinearGradient(x, height / 2, x, y);
            gradientLeft.addColorStop(0, this.color);
            gradientLeft.addColorStop(1, this.lightenColor(this.color, 0.4));

            this.ctx.fillStyle = gradientLeft;
            this.ctx.fillRect(x, y, this.barWidth, barHeight);

            // Right side (mirror)
            const xRight = centerX + (centerX - x - this.barWidth);
            const gradientRight = this.ctx.createLinearGradient(xRight, height / 2, xRight, y);
            gradientRight.addColorStop(0, this.color);
            gradientRight.addColorStop(1, this.lightenColor(this.color, 0.4));

            this.ctx.fillStyle = gradientRight;
            this.ctx.fillRect(xRight, y, this.barWidth, barHeight);
        }

        this.isDrawing = false;
    }

    // Resize canvas
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.frequencyData) this.draw();
    }

    // Get peak frequency
    getPeakFrequency() {
        if (!this.frequencyData) return 0;

        let peakIndex = 0;
        let peakValue = 0;

        for (let i = 0; i < this.frequencyData.length; i++) {
            if (this.frequencyData[i] > peakValue) {
                peakValue = this.frequencyData[i];
                peakIndex = i;
            }
        }

        // Convert index to frequency (approximate)
        // Assuming sample rate of 44100 and FFT size of 256
        return (peakIndex * 44100) / (256 * 2);
    }
}

module.exports = SpectrumVisualizer;
