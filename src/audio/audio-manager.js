/**
 * TPT Audio Manager - Web Audio API integration for real-time playback
 */

const AudioContext = window.AudioContext || window.webkitAudioContext;

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map();
        this.masterVolume = 0.8;
        this.masterPan = 0;
        this.analyser = null;
        this.frequencyData = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            this.audioContext = new AudioContext();

            // Create analyser for frequency analysis
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

            // Connect analyser to destination
            this.analyser.connect(this.audioContext.destination);

            // Resume context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
            throw error;
        }
    }

    async loadAudioBuffer(audioData, format = 'wav') {
        if (!this.isInitialized) await this.init();

        try {
            const buffer = Buffer.from(audioData, 'base64');
            const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.error('Failed to decode audio data:', error);
            throw error;
        }
    }

    createAudioNodes() {
        if (!this.isInitialized) return null;

        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.masterVolume;

        // Create pan node for stereo panning
        const panNode = this.audioContext.createStereoPanner();
        panNode.pan.value = this.masterPan;

        // Create analyser for this source
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;

        return { gainNode, panNode, analyser };
    }

    async playAudio(audioData, format = 'wav', options = {}) {
        if (!this.isInitialized) await this.init();

        try {
            const audioBuffer = await this.loadAudioBuffer(audioData, format);
            const { gainNode, panNode, analyser } = this.createAudioNodes();

            // Create buffer source
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;

            // Connect nodes: source -> gain -> pan -> analyser -> destination
            source.connect(gainNode);
            gainNode.connect(panNode);
            panNode.connect(analyser);
            analyser.connect(this.audioContext.destination);

            // Apply options
            if (options.volume !== undefined) {
                gainNode.gain.value = Math.max(0, Math.min(1, options.volume));
            }
            if (options.pan !== undefined) {
                panNode.pan.value = Math.max(-1, Math.min(1, options.pan));
            }
            if (options.loop) {
                source.loop = true;
            }

            // Start playback
            source.start(options.startTime || 0);

            // Store reference for control
            const audioInstance = {
                source,
                gainNode,
                panNode,
                analyser,
                startTime: this.audioContext.currentTime,
                duration: audioBuffer.duration
            };

            // Handle playback end
            source.onended = () => {
                if (options.onEnded) {
                    options.onEnded();
                }
            };

            return audioInstance;
        } catch (error) {
            console.error('Failed to play audio:', error);
            throw error;
        }
    }

    stopAudio(audioInstance) {
        if (audioInstance && audioInstance.source) {
            try {
                audioInstance.source.stop();
            } catch (error) {
                // Source might already be stopped
            }
        }
    }

    pauseAudio(audioInstance) {
        if (audioInstance && audioInstance.source) {
            // Note: Web Audio API doesn't have pause, need to track time
            this.stopAudio(audioInstance);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        // Note: This affects new sources, existing ones need individual control
    }

    setMasterPan(pan) {
        this.masterPan = Math.max(-1, Math.min(1, pan));
    }

    setVolume(audioInstance, volume) {
        if (audioInstance && audioInstance.gainNode) {
            audioInstance.gainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    setPan(audioInstance, pan) {
        if (audioInstance && audioInstance.panNode) {
            audioInstance.panNode.pan.value = Math.max(-1, Math.min(1, pan));
        }
    }

    getFrequencyData() {
        if (this.analyser && this.frequencyData) {
            this.analyser.getByteFrequencyData(this.frequencyData);
            return this.frequencyData;
        }
        return null;
    }

    getWaveformData(audioBuffer, samples = 256) {
        if (!audioBuffer) return null;

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

        return waveformData;
    }

    createReverb(duration = 2, decay = 2) {
        if (!this.isInitialized) return null;

        const convolver = this.audioContext.createConvolver();
        const length = this.audioContext.sampleRate * duration;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }

        convolver.buffer = impulse;
        return convolver;
    }

    createDelay(delayTime = 0.3, feedback = 0.4) {
        if (!this.isInitialized) return null;

        const delay = this.audioContext.createDelay();
        delay.delayTime.value = delayTime;

        const feedbackGain = this.audioContext.createGain();
        feedbackGain.gain.value = feedback;

        delay.connect(feedbackGain);
        feedbackGain.connect(delay);

        return { delay, feedbackGain };
    }

    createFilter(type = 'lowpass', frequency = 1000, Q = 1) {
        if (!this.isInitialized) return null;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = frequency;
        filter.Q.value = Q;

        return filter;
    }

    suspend() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    getCurrentTime() {
        return this.audioContext ? this.audioContext.currentTime : 0;
    }

    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
            this.isInitialized = false;
        }
    }
}

module.exports = AudioManager;
