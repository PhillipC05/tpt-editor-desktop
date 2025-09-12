/**
 * TPT Waveform Visualizer - Canvas-based audio waveform display
 */

class WaveformVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioData = null;
        this.color = '#4A90E2';
        this.backgroundColor = '#FFFFFF';
        this.lineWidth = 2;
        this.isDrawing = false;
    }

    setAudioData(audioData) {
        this.audioData = audioData;
        this.draw();
    }

    setColor(color) {
        this.color = color;
        if (this.audioData) this.draw();
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        if (this.audioData) this.draw();
    }

    setLineWidth(width) {
        this.lineWidth = width;
        if (this.audioData) this.draw();
    }

    draw() {
        if (!this.audioData || this.isDrawing) return;

        this.isDrawing = true;

        const { width, height } = this.canvas;

        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        // Draw waveform
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();

        const sliceWidth = width / this.audioData.length;
        let x = 0;

        for (let i = 0; i < this.audioData.length; i++) {
            const v = this.audioData[i];
            const y = (1 - v) * height * 0.8 + height * 0.1; // Scale to 80% height with 10% margin

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.stroke();

        // Draw center line
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, height * 0.5);
        this.ctx.lineTo(width, height * 0.5);
        this.ctx.stroke();

        this.isDrawing = false;
    }

    clear() {
        const { width, height } = this.canvas;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);
        this.audioData = null;
    }

    // Draw from audio buffer
    drawFromBuffer(audioBuffer, samples = 256) {
        if (!audioBuffer) return;

        const channelData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(channelData.length / samples);
        const waveformData = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const start = i * blockSize;
            let sum = 0;

            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(channelData[start + j]);
            }

            waveformData[i] = sum / blockSize;
        }

        this.setAudioData(waveformData);
    }

    // Get color at position for gradient effect
    getGradientColor(position) {
        // Simple gradient from blue to purple
        const r = Math.floor(74 + position * 181);
        const g = Math.floor(144 - position * 144);
        const b = Math.floor(226 + position * 29);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Draw with gradient
    drawWithGradient() {
        if (!this.audioData || this.isDrawing) return;

        this.isDrawing = true;

        const { width, height } = this.canvas;

        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        // Create gradient
        const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#4A90E2');
        gradient.addColorStop(0.5, '#9B59B6');
        gradient.addColorStop(1, '#E74C3C');

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();

        const sliceWidth = width / this.audioData.length;
        let x = 0;

        for (let i = 0; i < this.audioData.length; i++) {
            const v = this.audioData[i];
            const y = (1 - v) * height * 0.8 + height * 0.1;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.stroke();

        this.isDrawing = false;
    }

    // Draw filled waveform
    drawFilled() {
        if (!this.audioData || this.isDrawing) return;

        this.isDrawing = true;

        const { width, height } = this.canvas;

        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 1;

        const sliceWidth = width / this.audioData.length;
        let x = 0;

        this.ctx.beginPath();
        this.ctx.moveTo(0, height * 0.5);

        for (let i = 0; i < this.audioData.length; i++) {
            const v = this.audioData[i];
            const y = (1 - v) * height * 0.4 + height * 0.3;

            this.ctx.lineTo(x, y);
            x += sliceWidth;
        }

        this.ctx.lineTo(width, height * 0.5);
        this.ctx.closePath();
        this.ctx.fill();

        this.isDrawing = false;
    }

    // Resize canvas
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.audioData) this.draw();
    }
}

module.exports = WaveformVisualizer;
