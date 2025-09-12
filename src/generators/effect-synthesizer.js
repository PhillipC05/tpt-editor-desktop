/**
 * TPT Effect Synthesizer - JavaScript/Node.js version
 * Specialized class for generating sound effects
 */

class EffectSynthesizer {
    constructor(sampleRate = 44100, channels = 1, bitDepth = 16) {
        this.sampleRate = sampleRate;
        this.channels = channels;
        this.bitDepth = bitDepth;
    }

    /**
     * Generate sword attack sound
     */
    generateSwordAttack(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateFireball(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateLevelUp(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateItemPickup(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateButtonClick(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateMagicSpell(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateMonsterRoar(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateCoinCollect(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateDoorOpen(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
     * Generate generic effect
     */
    generateGenericEffect(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
     * Generate FM synthesis effect
     */
    generateFMSynthesis(duration, carrierFreq = 440, modulatorFreq = 220, modulationIndex = 1.0) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // FM synthesis
            const modulator = Math.sin(2 * Math.PI * modulatorFreq * t);
            const frequency = carrierFreq * (1 + modulationIndex * modulator);
            const sample = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2);

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Apply noise generation and filtering
     */
    applyNoiseAndFilter(audioData, noiseLevel = 0.1, filterFreq = 1000) {
        const filtered = new Float32Array(audioData.length);

        for (let i = 0; i < audioData.length; i++) {
            const t = i / this.sampleRate;

            // Add noise
            const noise = (Math.random() - 0.5) * noiseLevel;
            const sample = audioData[i] + noise;

            // Apply low-pass filter
            const filterSample = sample * Math.sin(2 * Math.PI * filterFreq * t);

            filtered[i] = Math.max(-1, Math.min(1, filterSample));
        }

        return filtered;
    }

    /**
     * Apply reverb effect
     */
    applyReverb(audioData, delayTime = 0.1, decay = 0.5) {
        const reverb = new Float32Array(audioData.length);

        for (let i = 0; i < audioData.length; i++) {
            reverb[i] = audioData[i];

            // Add delayed and decayed version
            const delaySamples = Math.floor(delayTime * this.sampleRate);
            if (i >= delaySamples) {
                reverb[i] += audioData[i - delaySamples] * decay;
            }
        }

        return reverb;
    }

    /**
     * Apply distortion effect
     */
    applyDistortion(audioData, drive = 2.0) {
        const distorted = new Float32Array(audioData.length);

        for (let i = 0; i < audioData.length; i++) {
            // Simple distortion
            const sample = audioData[i] * drive;
            distorted[i] = Math.max(-1, Math.min(1, sample));
        }

        return distorted;
    }

    /**
     * Apply pitch shifting
     */
    applyPitchShift(audioData, shiftFactor = 1.0) {
        const shifted = new Float32Array(audioData.length);

        for (let i = 0; i < audioData.length; i++) {
            const sourceIndex = i * shiftFactor;
            if (sourceIndex < audioData.length) {
                shifted[i] = audioData[Math.floor(sourceIndex)];
            }
        }

        return shifted;
    }
}

module.exports = EffectSynthesizer;
