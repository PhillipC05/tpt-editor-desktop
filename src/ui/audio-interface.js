/**
 * TPT Audio Interface - Renderer process logic for audio generation UI
 */

const { ipcRenderer } = require('electron');

// Import audio components (these would need to be made available in renderer)
const AudioManager = require('../audio/audio-manager');
const WaveformVisualizer = require('../audio/waveform-visualizer');
const SpectrumVisualizer = require('../audio/spectrum-visualizer');

class AudioInterface {
    constructor() {
        this.audioManager = null;
        this.waveformVisualizer = null;
        this.spectrumVisualizer = null;
        this.currentAudioInstance = null;
        this.currentAudioData = null;
        this.animationId = null;

        this.init();
    }

    async init() {
        try {
            // Initialize audio manager
            this.audioManager = new AudioManager();
            await this.audioManager.init();

            // Initialize visualizers
            const waveformCanvas = document.getElementById('waveformCanvas');
            const spectrumCanvas = document.getElementById('spectrumCanvas');

            if (waveformCanvas) {
                this.waveformVisualizer = new WaveformVisualizer(waveformCanvas);
            }

            if (spectrumCanvas) {
                this.spectrumVisualizer = new SpectrumVisualizer(spectrumCanvas);
            }

            // Set up event listeners
            this.setupEventListeners();

            // Initialize configuration panel
            this.updateConfigPanel();

            console.log('Audio interface initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio interface:', error);
        }
    }

    setupEventListeners() {
        // Audio type selection
        const audioTypeSelect = document.getElementById('audioType');
        if (audioTypeSelect) {
            audioTypeSelect.addEventListener('change', () => this.updateConfigPanel());
        }

        // Generate button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateAudio());
        }

        // Play button
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playAudio());
        }

        // Stop button
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopAudio());
        }

        // Volume slider
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => this.updateVolume(e.target.value));
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAudio());
        }
    }

    updateConfigPanel() {
        const audioType = document.getElementById('audioType')?.value || 'sfx';
        const configPanel = document.getElementById('configPanel');

        if (!configPanel) return;

        configPanel.innerHTML = '';

        if (audioType === 'sfx') {
            configPanel.innerHTML = `
                <label for="effectType">Effect Type:</label>
                <select id="effectType">
                    <option value="sword_attack">⚔️ Sword Attack</option>
                    <option value="fireball">🔥 Fireball</option>
                    <option value="level_up">⬆️ Level Up</option>
                    <option value="item_pickup">📦 Item Pickup</option>
                    <option value="button_click">🔘 Button Click</option>
                    <option value="magic_spell">✨ Magic Spell</option>
                    <option value="monster_roar">👹 Monster Roar</option>
                    <option value="coin_collect">🪙 Coin Collect</option>
                    <option value="door_open">🚪 Door Open</option>
                </select>
                <label for="duration">Duration (seconds):</label>
                <input type="number" id="duration" value="1.0" step="0.1" min="0.1" max="5.0">
                <label for="quality">Quality (for MP3):</label>
                <select id="quality">
                    <option value="128">128 kbps</option>
                    <option value="192">192 kbps</option>
                    <option value="256">256 kbps</option>
                </select>
            `;
        } else if (audioType === 'music') {
            configPanel.innerHTML = `
                <label for="style">Music Style:</label>
                <select id="style">
                    <option value="village">🏘️ Village</option>
                    <option value="combat">⚔️ Combat</option>
                    <option value="dungeon">🏰 Dungeon</option>
                    <option value="ambient">🌌 Ambient</option>
                </select>
                <label for="duration">Duration (seconds):</label>
                <input type="number" id="duration" value="30" step="5" min="10" max="300">
                <label for="tempo">Tempo (BPM):</label>
                <input type="number" id="tempo" value="120" step="10" min="60" max="200">
                <label for="quality">Quality (for MP3):</label>
                <select id="quality">
                    <option value="128">128 kbps</option>
                    <option value="192">192 kbps</option>
                    <option value="256">256 kbps</option>
                </select>
            `;
        } else if (audioType === 'ambient') {
            configPanel.innerHTML = `
                <label for="type">Ambient Type:</label>
                <select id="type">
                    <option value="forest">🌲 Forest</option>
                    <option value="village">🏘️ Village</option>
                    <option value="cave">🕳️ Cave</option>
                    <option value="wind">💨 Wind</option>
                    <option value="ocean">🌊 Ocean</option>
                    <option value="weather">⛈️ Weather</option>
                </select>
                <label for="duration">Duration (seconds):</label>
                <input type="number" id="duration" value="30" step="5" min="10" max="300">
                <label for="intensity">Intensity:</label>
                <input type="range" id="intensity" min="0.1" max="1.0" step="0.1" value="0.5">
                <label for="quality">Quality (for MP3):</label>
                <select id="quality">
                    <option value="128">128 kbps</option>
                    <option value="192">192 kbps</option>
                    <option value="256">256 kbps</option>
                </select>
            `;
        }
    }

    getConfigFromPanel() {
        const audioType = document.getElementById('audioType')?.value || 'sfx';
        const config = {};

        if (audioType === 'sfx') {
            config.effectType = document.getElementById('effectType')?.value;
            config.duration = parseFloat(document.getElementById('duration')?.value || 1.0);
            config.quality = parseInt(document.getElementById('quality')?.value || 128);
        } else if (audioType === 'music') {
            config.style = document.getElementById('style')?.value;
            config.duration = parseFloat(document.getElementById('duration')?.value || 30);
            config.tempo = parseInt(document.getElementById('tempo')?.value || 120);
            config.quality = parseInt(document.getElementById('quality')?.value || 128);
        } else if (audioType === 'ambient') {
            config.type = document.getElementById('type')?.value;
            config.duration = parseFloat(document.getElementById('duration')?.value || 30);
            config.intensity = parseFloat(document.getElementById('intensity')?.value || 0.5);
            config.quality = parseInt(document.getElementById('quality')?.value || 128);
        }

        return config;
    }

    async generateAudio() {
        const audioType = document.getElementById('audioType')?.value || 'sfx';
        const config = this.getConfigFromPanel();

        try {
            // Show loading state
            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn) {
                generateBtn.textContent = '⏳ Generating...';
                generateBtn.disabled = true;
            }

            // Generate audio via IPC
            const result = await ipcRenderer.invoke('generate-audio', {
                type: audioType,
                config: config
            });

            this.currentAudioData = result.audio.data;
            const format = result.audio.format;

            // Load audio buffer for visualization
            if (this.audioManager) {
                const audioBuffer = await this.audioManager.loadAudioBuffer(this.currentAudioData, format);

                // Update visualizers
                if (this.waveformVisualizer) {
                    this.waveformVisualizer.drawFromBuffer(audioBuffer);
                }
            }

            // Reset button
            if (generateBtn) {
                generateBtn.textContent = '🎯 Generate';
                generateBtn.disabled = false;
            }

            console.log('Audio generated successfully');
        } catch (error) {
            console.error('Audio generation failed:', error);
            alert('Failed to generate audio: ' + error.message);

            // Reset button
            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn) {
                generateBtn.textContent = '🎯 Generate';
                generateBtn.disabled = false;
            }
        }
    }

    async playAudio() {
        if (!this.currentAudioData || !this.audioManager) return;

        try {
            // Stop current playback
            this.stopAudio();

            // Play new audio
            const format = document.getElementById('format')?.value || 'wav';
            this.currentAudioInstance = await this.audioManager.playAudio(this.currentAudioData, format);

            // Start spectrum animation
            this.startSpectrumAnimation();

            console.log('Audio playback started');
        } catch (error) {
            console.error('Audio playback failed:', error);
        }
    }

    stopAudio() {
        if (this.currentAudioInstance && this.audioManager) {
            this.audioManager.stopAudio(this.currentAudioInstance);
            this.currentAudioInstance = null;
        }

        // Stop spectrum animation
        this.stopSpectrumAnimation();
    }

    updateVolume(volume) {
        if (this.audioManager) {
            this.audioManager.setMasterVolume(volume);
        }
    }

    async exportAudio() {
        if (!this.currentAudioData) {
            alert('No audio to export. Generate audio first.');
            return;
        }

        const format = document.getElementById('format')?.value || 'wav';

        try {
            // Show loading state
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.textContent = '⏳ Exporting...';
                exportBtn.disabled = true;
            }

            // Export via IPC
            const result = await ipcRenderer.invoke('export-audio', {
                audioData: this.currentAudioData,
                format: format,
                config: this.getConfigFromPanel()
            });

            // Reset button
            if (exportBtn) {
                exportBtn.textContent = '💾 Export Audio';
                exportBtn.disabled = false;
            }

            alert(`Audio exported successfully to: ${result.filePath}`);
            console.log('Audio exported:', result.filePath);
        } catch (error) {
            console.error('Audio export failed:', error);
            alert('Failed to export audio: ' + error.message);

            // Reset button
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.textContent = '💾 Export Audio';
                exportBtn.disabled = false;
            }
        }
    }

    startSpectrumAnimation() {
        if (!this.spectrumVisualizer || !this.audioManager) return;

        const animate = () => {
            if (this.currentAudioInstance) {
                const frequencyData = this.audioManager.getFrequencyData();
                if (frequencyData) {
                    this.spectrumVisualizer.setFrequencyData(frequencyData);
                }
                this.animationId = requestAnimationFrame(animate);
            }
        };

        animate();
    }

    stopSpectrumAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AudioInterface();
});

module.exports = AudioInterface;
