/**
 * TPT Audio Generator - JavaScript/Node.js version
 * Core audio synthesis and file generation for the desktop application
 */

const { WaveFile } = require('wavefile');
const lamejs = require('lamejs');
const ogg = require('ogg.js');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AudioGenerator {
    constructor() {
        this.sampleRate = 44100;
        this.bitDepth = 16;
        this.channels = 1; // Mono
        this.audioBuffers = new Map(); // Cache for generated audio
    }

    /**
     * Generate sound effect
     */
    async generateSFX(config) {
        const duration = config.duration || 1.0;
        const effectType = config.effectType || 'generic';

        // Generate audio data based on effect type
        const audioData = this.generateEffectAudio(effectType, duration);

        // Create WAV file
        const wav = this.createWAVFile(audioData, this.sampleRate);

        return {
            id: uuidv4(),
            name: `${effectType.charAt(0).toUpperCase() + effectType.slice(1).replace(/_/g, ' ')} SFX`,
            type: 'sfx',
            audio: {
                data: wav.toBuffer().toString('base64'),
                sampleRate: this.sampleRate,
                channels: this.channels,
                duration: duration,
                format: 'wav'
            },
            config: config,
            metadata: {
                effectType: effectType,
                duration: duration,
                sampleRate: this.sampleRate,
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate music
     */
    async generateMusic(config) {
        const duration = config.duration || 120;
        const style = config.style || 'village';

        // Generate music data based on style
        const audioData = this.generateMusicAudio(style, duration);

        // Create WAV file
        const wav = this.createWAVFile(audioData, this.sampleRate);

        return {
            id: uuidv4(),
            name: `${style.charAt(0).toUpperCase() + style.slice(1)} Music`,
            type: 'music',
            audio: {
                data: wav.toBuffer().toString('base64'),
                sampleRate: this.sampleRate,
                channels: this.channels,
                duration: duration,
                format: 'wav'
            },
            config: config,
            metadata: {
                style: style,
                duration: duration,
                sampleRate: this.sampleRate,
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Generate ambient sound
     */
    async generateAmbient(config) {
        const duration = config.duration || 30;
        const type = config.type || 'forest';

        // Generate ambient data based on type
        const audioData = this.generateAmbientAudio(type, duration);

        // Create WAV file
        const wav = this.createWAVFile(audioData, this.sampleRate);

        return {
            id: uuidv4(),
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Ambient`,
            type: 'ambient',
            audio: {
                data: wav.toBuffer().toString('base64'),
                sampleRate: this.sampleRate,
                channels: this.channels,
                duration: duration,
                format: 'wav'
            },
            config: config,
            metadata: {
                type: type,
                duration: duration,
                sampleRate: this.sampleRate,
                generated: new Date().toISOString(),
                version: '1.0'
            }
        };
    }

    /**
     * Create WAV file from audio data
     */
    createWAVFile(audioData, sampleRate) {
        const wav = new WaveFile();

        // Convert audio data to the correct format
        const samples = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
            // Convert from -1..1 range to 16-bit signed integer
            samples[i] = Math.max(-32768, Math.min(32767, Math.floor(audioData[i] * 32767)));
        }

        wav.fromScratch(this.channels, sampleRate, this.bitDepth, samples);
        return wav;
    }

    /**
     * Generate effect audio data
     */
    generateEffectAudio(effectType, duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        switch (effectType) {
            case 'sword_attack':
                return this.generateSwordAttack(numSamples);
            case 'fireball':
                return this.generateFireball(numSamples);
            case 'level_up':
                return this.generateLevelUp(numSamples);
            case 'item_pickup':
                return this.generateItemPickup(numSamples);
            case 'button_click':
                return this.generateButtonClick(numSamples);
            case 'magic_spell':
                return this.generateMagicSpell(numSamples);
            case 'monster_roar':
                return this.generateMonsterRoar(numSamples);
            case 'coin_collect':
                return this.generateCoinCollect(numSamples);
            case 'door_open':
                return this.generateDoorOpen(numSamples);
            default:
                return this.generateGenericEffect(numSamples);
        }
    }

    /**
     * Generate music audio data
     */
    generateMusicAudio(style, duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        switch (style) {
            case 'village':
                return this.generateVillageMusic(numSamples);
            case 'combat':
                return this.generateCombatMusic(numSamples);
            case 'dungeon':
                return this.generateDungeonMusic(numSamples);
            case 'ambient':
                return this.generateAmbientMusic(numSamples);
            default:
                return this.generateGenericMusic(numSamples);
        }
    }

    /**
     * Generate ambient audio data
     */
    generateAmbientAudio(type, duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        switch (type) {
            case 'forest':
                return this.generateForestAmbient(numSamples);
            case 'village':
                return this.generateVillageAmbient(numSamples);
            case 'cave':
                return this.generateCaveAmbient(numSamples);
            case 'wind':
                return this.generateWindAmbient(numSamples);
            default:
                return this.generateGenericAmbient(numSamples);
        }
    }

    /**
     * Generate sword attack sound
     */
    generateSwordAttack(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Quick attack sound with frequency sweep
            const frequency = 800 * Math.exp(-t * 8); // Exponential decay
            const sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 4);

            // Add some noise for metallic sound
            const noise = (Math.random() - 0.5) * 0.3 * Math.exp(-t * 6);

            audioData[i] = Math.max(-1, Math.min(1, sample + noise));
        }

        return audioData;
    }

    /**
     * Generate fireball sound
     */
    generateFireball(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Low frequency rumble with noise
            const baseFreq = 100 + 200 * (1 - t); // Rising frequency
            const sample = Math.sin(2 * Math.PI * baseFreq * t) * 0.5;

            // Add filtered noise
            const noise = (Math.random() - 0.5);
            const filterFreq = 1000 * Math.exp(-t * 2);
            const noiseFiltered = noise * Math.sin(2 * Math.PI * filterFreq * t) * 0.3;

            audioData[i] = Math.max(-1, Math.min(1, (sample + noiseFiltered) * Math.exp(-t * 1.5)));
        }

        return audioData;
    }

    /**
     * Generate level up sound
     */
    generateLevelUp(numSamples) {
        const audioData = new Float32Array(numSamples);

        // Musical notes for level up
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const noteDuration = Math.floor(numSamples / notes.length);

        for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
            const frequency = notes[noteIndex];
            const startSample = noteIndex * noteDuration;
            const endSample = Math.min((noteIndex + 1) * noteDuration, numSamples);

            for (let i = startSample; i < endSample; i++) {
                const t = (i - startSample) / this.sampleRate;
                const localT = t * 2; // Faster oscillation

                let sample = Math.sin(2 * Math.PI * frequency * localT) * Math.exp(-t * 2);

                // Add harmonics
                sample += Math.sin(2 * Math.PI * frequency * 2 * localT) * 0.3 * Math.exp(-t * 2);
                sample += Math.sin(2 * Math.PI * frequency * 3 * localT) * 0.1 * Math.exp(-t * 2);

                audioData[i] = Math.max(-1, Math.min(1, sample));
            }
        }

        return audioData;
    }

    /**
     * Generate item pickup sound
     */
    generateItemPickup(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Pleasant chime with rising frequency
            const frequency = 600 + 400 * t; // Linear rise
            let sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3);

            // Add bell-like harmonics
            sample += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.4 * Math.exp(-t * 3);
            sample += Math.sin(2 * Math.PI * frequency * 3 * t) * 0.2 * Math.exp(-t * 3);

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate button click sound
     */
    generateButtonClick(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Short, sharp click
            const frequency = 1200 * Math.exp(-t * 20); // Very fast decay
            let sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 15);

            // Add click noise
            if (t < 0.01) { // First 10ms
                sample += (Math.random() - 0.5) * 0.5;
            }

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate magic spell sound
     */
    generateMagicSpell(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Mystical sound with frequency modulation
            const carrierFreq = 600;
            const modulatorFreq = 50;
            const modulationIndex = 0.5;

            const modulator = Math.sin(2 * Math.PI * modulatorFreq * t);
            const frequency = carrierFreq * (1 + modulationIndex * modulator);

            let sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2);

            // Add some reverb-like effect
            if (i > Math.floor(0.1 * this.sampleRate)) {
                const delaySample = i - Math.floor(0.1 * this.sampleRate);
                if (delaySample >= 0 && delaySample < i) {
                    const prevSample = audioData[delaySample];
                    sample += prevSample * 0.3;
                }
            }

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate monster roar sound
     */
    generateMonsterRoar(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Low frequency growl with noise
            const baseFreq = 80 + 40 * Math.sin(2 * Math.PI * 2 * t); // Vibrato
            let sample = Math.sin(2 * Math.PI * baseFreq * t) * 0.6;

            // Add filtered noise
            const noise = (Math.random() - 0.5);
            const filterFreq = 300 * Math.exp(-t * 0.5);
            const noiseFiltered = noise * Math.sin(2 * Math.PI * filterFreq * t) * 0.4;

            sample = (sample + noiseFiltered) * Math.exp(-t * 0.8);

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate coin collect sound
     */
    generateCoinCollect(numSamples) {
        const audioData = new Float32Array(numSamples);

        // Multiple coin sounds
        const coinDelays = [0, 0.1, 0.2, 0.25];

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            let sample = 0;

            coinDelays.forEach(delay => {
                if (t >= delay) {
                    const localT = t - delay;
                    const frequency = 800 + 200 * localT;
                    const coinSample = Math.sin(2 * Math.PI * frequency * localT) * Math.exp(-localT * 8);
                    sample += coinSample * 0.3;
                }
            });

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate door open sound
     */
    generateDoorOpen(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Creaking door sound
            const baseFreq = 100 + 50 * Math.sin(2 * Math.PI * 0.5 * t);
            let sample = Math.sin(2 * Math.PI * baseFreq * t) * 0.4;

            // Add wood-like noise
            const noise = (Math.random() - 0.5);
            const filterFreq = 800 * (1 - t * 0.5); // Decreasing filter
            const noiseFiltered = noise * Math.sin(2 * Math.PI * filterFreq * t) * 0.3;

            sample = (sample + noiseFiltered) * Math.exp(-t * 1.2);

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate village music
     */
    generateVillageMusic(numSamples) {
        const audioData = new Float32Array(numSamples);

        // Simple melody notes (C major scale)
        const melodyNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
        const noteDuration = Math.floor(this.sampleRate * 1); // 1 second per note

        let currentNote = 0;
        let noteSamples = 0;

        for (let i = 0; i < numSamples; i++) {
            if (noteSamples >= noteDuration) {
                currentNote = (currentNote + 1) % melodyNotes.length;
                noteSamples = 0;
            }

            const t = noteSamples / this.sampleRate;
            const frequency = melodyNotes[currentNote];

            let sample = Math.sin(2 * Math.PI * frequency * t) * 0.3 * Math.exp(-t * 0.5);

            // Add simple harmony
            sample += Math.sin(2 * Math.PI * frequency * 1.25 * t) * 0.1 * Math.exp(-t * 0.5);

            audioData[i] = Math.max(-1, Math.min(1, sample));
            noteSamples++;
        }

        return audioData;
    }

    /**
     * Generate combat music
     */
    generateCombatMusic(numSamples) {
        const audioData = new Float32Array(numSamples);

        // Tense, fast-paced melody (A minor)
        const melodyNotes = [220.00, 246.94, 277.18, 293.66, 329.63, 369.99];
        const noteDuration = Math.floor(this.sampleRate * 0.5); // 0.5 seconds per note

        let currentNote = 0;
        let noteSamples = 0;

        for (let i = 0; i < numSamples; i++) {
            if (noteSamples >= noteDuration) {
                currentNote = (currentNote + 1) % melodyNotes.length;
                noteSamples = 0;
            }

            const t = noteSamples / this.sampleRate;
            const frequency = melodyNotes[currentNote];

            let sample = Math.sin(2 * Math.PI * frequency * t) * 0.4 * Math.exp(-t * 1);

            // Add tension with minor seconds
            sample += Math.sin(2 * Math.PI * frequency * 1.189 * t) * 0.2 * Math.exp(-t * 1);

            audioData[i] = Math.max(-1, Math.min(1, sample));
            noteSamples++;
        }

        return audioData;
    }

    /**
     * Generate dungeon music
     */
    generateDungeonMusic(numSamples) {
        const audioData = new Float32Array(numSamples);

        // Dark, mysterious melody (D minor)
        const melodyNotes = [146.83, 164.81, 185.00, 196.00, 220.00, 246.94];
        const noteDuration = Math.floor(this.sampleRate * 1.5); // 1.5 seconds per note

        let currentNote = 0;
        let noteSamples = 0;

        for (let i = 0; i < numSamples; i++) {
            if (noteSamples >= noteDuration) {
                currentNote = (currentNote + 1) % melodyNotes.length;
                noteSamples = 0;
            }

            const t = noteSamples / this.sampleRate;
            const frequency = melodyNotes[currentNote];

            let sample = Math.sin(2 * Math.PI * frequency * t) * 0.25 * Math.exp(-t * 0.3);

            // Add echo effect
            if (i > Math.floor(0.2 * this.sampleRate)) {
                const echoSample = i - Math.floor(0.2 * this.sampleRate);
                if (echoSample >= 0) {
                    const prevSample = audioData[echoSample];
                    sample += prevSample * 0.4;
                }
            }

            audioData[i] = Math.max(-1, Math.min(1, sample));
            noteSamples++;
        }

        return audioData;
    }

    /**
     * Generate ambient music
     */
    generateAmbientMusic(numSamples) {
        const audioData = new Float32Array(numSamples);

        // Slow, atmospheric pads (C minor)
        const padNotes = [130.81, 155.56, 185.00, 196.00, 233.08];

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            let sample = 0;

            padNotes.forEach((frequency, index) => {
                const phaseOffset = index * 0.1;
                const noteSample = Math.sin(2 * Math.PI * frequency * (t + phaseOffset)) * 0.1;
                sample += noteSample;
            });

            // Slow modulation
            const modulation = Math.sin(2 * Math.PI * 0.1 * t) * 0.5 + 0.5;
            sample *= modulation * 0.3;

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate forest ambient
     */
    generateForestAmbient(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            let sample = 0;

            // Wind-like low frequency noise
            const windNoise = (Math.random() - 0.5) * 0.2;
            const windFiltered = windNoise * Math.sin(2 * Math.PI * 100 * t);
            sample += windFiltered;

            // Occasional bird chirps
            if (Math.random() < 0.001) { // 0.1% chance per sample
                const chirpFreq = 1000 + Math.random() * 2000;
                const chirpSample = Math.sin(2 * Math.PI * chirpFreq * t) * 0.3 * Math.exp(-t * 10);
                sample += chirpSample;
            }

            // Rustling leaves
            const rustleNoise = (Math.random() - 0.5) * 0.1;
            const rustleFiltered = rustleNoise * Math.sin(2 * Math.PI * 800 * t);
            sample += rustleFiltered;

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate village ambient
     */
    generateVillageAmbient(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            let sample = 0;

            // Crowd murmur (filtered noise)
            const crowdNoise = (Math.random() - 0.5) * 0.15;
            const crowdFiltered = crowdNoise * Math.sin(2 * Math.PI * 200 * t);
            sample += crowdFiltered;

            // Footsteps
            if (Math.random() < 0.005) { // 0.5% chance
                const stepNoise = (Math.random() - 0.5) * 0.4;
                const stepFiltered = stepNoise * Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 8);
                sample += stepFiltered;
            }

            // Distant sounds
            const distantNoise = (Math.random() - 0.5) * 0.1;
            const distantFiltered = distantNoise * Math.sin(2 * Math.PI * 80 * t);
            sample += distantFiltered;

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate cave ambient
     */
    generateCaveAmbient(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            let sample = 0;

            // Water drip
            if (Math.random() < 0.002) { // 0.2% chance
                const dripFreq = 200 + Math.random() * 100;
                const dripSample = Math.sin(2 * Math.PI * dripFreq * t) * 0.3 * Math.exp(-t * 3);
                sample += dripSample;
            }

            // Cave echo (reverb simulation)
            const echoNoise = (Math.random() - 0.5) * 0.1;
            const echoFiltered = echoNoise * Math.sin(2 * Math.PI * 150 * t);

            // Add multiple echoes
            sample += echoFiltered;
            if (i > Math.floor(0.3 * this.sampleRate)) {
                const echo1Sample = i - Math.floor(0.3 * this.sampleRate);
                if (echo1Sample >= 0) {
                    const prevSample = audioData[echo1Sample];
                    sample += prevSample * 0.5;
                }
            }

            if (i > Math.floor(0.7 * this.sampleRate)) {
                const echo2Sample = i - Math.floor(0.7 * this.sampleRate);
                if (echo2Sample >= 0) {
                    const prevSample = audioData[echo2Sample];
                    sample += prevSample * 0.3;
                }
            }

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate wind ambient
     */
    generateWindAmbient(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Wind-like filtered noise
            const windNoise = (Math.random() - 0.5);
            const windFiltered = windNoise * Math.sin(2 * Math.PI * 100 * t) * 0.3;

            // Add some variation
            const modulation = Math.sin(2 * Math.PI * 0.1 * t) * 0.5 + 0.5;
            const sample = windFiltered * modulation;

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate generic effect
     */
    generateGenericEffect(numSamples) {
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Simple tone with noise
            const frequency = 440 * Math.exp(-t * 2);
            let sample = Math.sin(2 * Math.PI * frequency * t) * 0.5;
            sample += (Math.random() - 0.5) * 0.2;

            sample *= Math.exp(-t * 3);

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate generic music
     */
    generateGenericMusic(numSamples) {
        return this.generateVillageMusic(numSamples);
    }

    /**
     * Generate generic ambient
     */
    generateGenericAmbient(numSamples) {
        return this.generateForestAmbient(numSamples);
    }

    /**
     * Save audio to file
     */
    async saveToFile(asset, outputPath) {
        const buffer = Buffer.from(asset.audio.data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }

    /**
     * Get audio buffer for playback
     */
    getAudioBuffer(asset) {
        const buffer = Buffer.from(asset.audio.data, 'base64');
        return buffer;
    }

    /**
     * Export audio as MP3 with quality options
     */
    async exportAsMP3(asset, quality = 'high') {
        const audioBuffer = Buffer.from(asset.audio.data, 'base64');

        // Convert WAV buffer to PCM samples
        const wav = new WaveFile(audioBuffer);
        const samples = wav.getSamples(false, Int16Array);

        // MP3 encoder configuration based on quality
        const qualitySettings = {
            low: { bitrate: 64, mode: lamejs.STEREO },
            medium: { bitrate: 128, mode: lamejs.STEREO },
            high: { bitrate: 192, mode: lamejs.STEREO },
            very_high: { bitrate: 320, mode: lamejs.STEREO }
        };

        const settings = qualitySettings[quality] || qualitySettings.high;

        // Create MP3 encoder
        const mp3Encoder = new lamejs.Mp3Encoder(
            this.channels,
            this.sampleRate,
            settings.bitrate,
            settings.mode
        );

        // Encode to MP3
        const mp3Data = mp3Encoder.encodeBuffer(samples);
        const mp3Buffer = Buffer.from(mp3Data);

        return {
            ...asset,
            audio: {
                ...asset.audio,
                data: mp3Buffer.toString('base64'),
                format: 'mp3',
                quality: quality,
                bitrate: settings.bitrate
            }
        };
    }

    /**
     * Export audio as WAV (enhanced version)
     */
    async exportAsWAV(asset, options = {}) {
        const {
            sampleRate = this.sampleRate,
            bitDepth = this.bitDepth,
            channels = this.channels
        } = options;

        // Get original audio data
        const audioBuffer = Buffer.from(asset.audio.data, 'base64');
        const wav = new WaveFile(audioBuffer);

        // Resample if needed
        if (sampleRate !== wav.fmt.sampleRate) {
            wav.toSampleRate(sampleRate);
        }

        // Change bit depth if needed
        if (bitDepth !== wav.fmt.bitsPerSample) {
            wav.toBitDepth(bitDepth);
        }

        // Change channels if needed
        if (channels !== wav.fmt.numChannels) {
            if (channels === 1 && wav.fmt.numChannels === 2) {
                wav.toMono();
            } else if (channels === 2 && wav.fmt.numChannels === 1) {
                wav.toStereo();
            }
        }

        return {
            ...asset,
            audio: {
                ...asset.audio,
                data: wav.toBuffer().toString('base64'),
                sampleRate: sampleRate,
                channels: channels,
                bitDepth: bitDepth,
                format: 'wav'
            }
        };
    }

    /**
     * Export audio as OGG with quality options
     */
    async exportAsOGG(asset, quality = 'high') {
        const audioBuffer = Buffer.from(asset.audio.data, 'base64');

        // Convert WAV buffer to PCM samples
        const wav = new WaveFile(audioBuffer);
        const samples = wav.getSamples(false, Float32Array);

        // OGG encoder configuration based on quality
        const qualitySettings = {
            low: { bitrate: 64 },
            medium: { bitrate: 128 },
            high: { bitrate: 192 },
            very_high: { bitrate: 320 }
        };

        const settings = qualitySettings[quality] || qualitySettings.high;

        // Create OGG encoder (simplified implementation)
        // Note: ogg.js is a basic implementation, in production you might want a more robust OGG encoder
        const oggEncoder = new ogg.Encoder();
        oggEncoder.setChannels(this.channels);
        oggEncoder.setSampleRate(this.sampleRate);
        oggEncoder.setQuality(settings.bitrate / 320); // Normalize quality to 0-1 range

        // Encode to OGG
        const oggData = oggEncoder.encode(samples);
        const oggBuffer = Buffer.from(oggData);

        return {
            ...asset,
            audio: {
                ...asset.audio,
                data: oggBuffer.toString('base64'),
                format: 'ogg',
                quality: quality,
                bitrate: settings.bitrate
            }
        };
    }

    /**
     * Batch export audio files
     */
    async batchExport(assets, format = 'wav', options = {}) {
        const results = [];

        for (const asset of assets) {
            try {
                let exportedAsset;

                switch (format.toLowerCase()) {
                    case 'mp3':
                        exportedAsset = await this.exportAsMP3(asset, options.quality);
                        break;
                    case 'ogg':
                        exportedAsset = await this.exportAsOGG(asset, options.quality);
                        break;
                    case 'wav':
                        exportedAsset = await this.exportAsWAV(asset, options);
                        break;
                    case 'json':
                        exportedAsset = await this.exportAsJSON(asset);
                        break;
                    default:
                        throw new Error(`Unsupported export format: ${format}`);
                }

                results.push({
                    success: true,
                    asset: exportedAsset,
                    originalId: asset.id
                });
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    originalId: asset.id
                });
            }
        }

        return results;
    }

    /**
     * Export asset metadata as JSON
     */
    async exportAsJSON(asset) {
        // Create a clean metadata object for export
        const exportData = {
            id: asset.id,
            name: asset.name,
            type: asset.type,
            config: asset.config,
            metadata: asset.metadata,
            export: {
                format: 'json',
                timestamp: new Date().toISOString(),
                version: '1.0'
            }
        };

        // If it's an audio asset, include audio-specific metadata
        if (asset.audio) {
            exportData.audio = {
                sampleRate: asset.audio.sampleRate,
                channels: asset.audio.channels,
                duration: asset.audio.duration,
                format: asset.audio.format,
                bitrate: asset.audio.bitrate,
                quality: asset.audio.quality
            };
        }

        // If it's a visual asset, include sprite-specific metadata
        if (asset.sprite) {
            exportData.sprite = {
                width: asset.sprite.width,
                height: asset.sprite.height,
                format: asset.sprite.format
            };
        }

        return {
            ...asset,
            data: JSON.stringify(exportData, null, 2),
            format: 'json',
            metadata: {
                ...asset.metadata,
                exported: new Date().toISOString(),
                exportFormat: 'json'
            }
        };
    }

    /**
     * Apply pitch and tempo adjustment
     */
    applyPitchTempo(asset, pitchShift = 1.0, tempoShift = 1.0) {
        const audioBuffer = Buffer.from(asset.audio.data, 'base64');
        const wav = new WaveFile(audioBuffer);
        const samples = wav.getSamples(false, Float32Array);

        // Simple pitch/tempo adjustment using resampling
        const newLength = Math.floor(samples.length / tempoShift);
        const newSamples = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
            const sourceIndex = i * tempoShift;
            const index = Math.floor(sourceIndex);
            const fraction = sourceIndex - index;

            if (index < samples.length - 1) {
                // Linear interpolation
                newSamples[i] = samples[index] * (1 - fraction) + samples[index + 1] * fraction;
            } else {
                newSamples[i] = samples[index] || 0;
            }
        }

        // Create new WAV with adjusted samples
        const adjustedWav = new WaveFile();
        const intSamples = new Int16Array(newSamples.length);
        for (let i = 0; i < newSamples.length; i++) {
            intSamples[i] = Math.max(-32768, Math.min(32767, Math.floor(newSamples[i] * 32767)));
        }

        adjustedWav.fromScratch(this.channels, Math.floor(this.sampleRate * pitchShift), this.bitDepth, intSamples);

        return {
            ...asset,
            audio: {
                ...asset.audio,
                data: adjustedWav.toBuffer().toString('base64'),
                sampleRate: Math.floor(this.sampleRate * pitchShift),
                duration: asset.audio.duration / tempoShift
            },
            metadata: {
                ...asset.metadata,
                pitchShift: pitchShift,
                tempoShift: tempoShift,
                adjusted: new Date().toISOString()
            }
        };
    }

    /**
     * Clear audio buffer cache
     */
    clearCache() {
        this.audioBuffers.clear();
    }
}

module.exports = AudioGenerator;
