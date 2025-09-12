/**
 * TPT Ambient Generator - JavaScript/Node.js version
 * Specialized class for generating ambient sound environments
 */

class AmbientGenerator {
    constructor(sampleRate = 44100, channels = 1, bitDepth = 16) {
        this.sampleRate = sampleRate;
        this.channels = channels;
        this.bitDepth = bitDepth;
    }

    /**
     * Generate forest ambient
     */
    generateForestAmbient(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateVillageAmbient(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateCaveAmbient(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateWindAmbient(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
     * Generate ocean/coastal ambient
     */
    generateOceanAmbient(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            let sample = 0;

            // Wave sounds (low frequency rumble)
            const waveFreq = 50 + Math.sin(2 * Math.PI * 0.2 * t) * 20;
            const waveSample = Math.sin(2 * Math.PI * waveFreq * t) * 0.2;
            sample += waveSample;

            // Surf noise
            const surfNoise = (Math.random() - 0.5) * 0.15;
            const surfFiltered = surfNoise * Math.sin(2 * Math.PI * 300 * t);
            sample += surfFiltered;

            // Occasional seagull cries
            if (Math.random() < 0.0005) { // 0.05% chance
                const gullFreq = 800 + Math.random() * 400;
                const gullSample = Math.sin(2 * Math.PI * gullFreq * t) * 0.4 * Math.exp(-t * 5);
                sample += gullSample;
            }

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate generic ambient
     */
    generateGenericAmbient(duration) {
        return this.generateForestAmbient(duration);
    }

    /**
     * Generate weather sounds (rain, thunder, etc.)
     */
    generateWeatherAmbient(duration, weatherType = 'rain') {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            let sample = 0;

            if (weatherType === 'rain') {
                // Rain drops
                if (Math.random() < 0.01) { // 1% chance
                    const dropFreq = 1000 + Math.random() * 2000;
                    const dropSample = Math.sin(2 * Math.PI * dropFreq * t) * 0.2 * Math.exp(-t * 8);
                    sample += dropSample;
                }

                // Rain hiss
                const hissNoise = (Math.random() - 0.5) * 0.1;
                const hissFiltered = hissNoise * Math.sin(2 * Math.PI * 500 * t);
                sample += hissFiltered;

            } else if (weatherType === 'thunder') {
                // Thunder rumble
                if (Math.random() < 0.0001) { // 0.01% chance
                    const thunderFreq = 50 + Math.random() * 100;
                    const thunderSample = Math.sin(2 * Math.PI * thunderFreq * t) * 0.5 * Math.exp(-t * 2);
                    sample += thunderSample;
                }

                // Distant thunder
                const distantNoise = (Math.random() - 0.5) * 0.05;
                const distantFiltered = distantNoise * Math.sin(2 * Math.PI * 60 * t);
                sample += distantFiltered;
            }

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate crowd murmur
     */
    generateCrowdMurmur(duration, intensity = 0.5) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;

            // Crowd noise (filtered random noise)
            const crowdNoise = (Math.random() - 0.5) * intensity;
            const crowdFiltered = crowdNoise * Math.sin(2 * Math.PI * 200 * t);

            // Add some variation
            const variation = Math.sin(2 * Math.PI * 0.5 * t) * 0.2 + 0.8;
            const sample = crowdFiltered * variation;

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Generate footsteps
     */
    generateFootsteps(duration, stepRate = 2.0) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        const stepsPerSecond = stepRate;
        const samplesPerStep = Math.floor(this.sampleRate / stepsPerSecond);

        for (let step = 0; step < Math.floor(duration * stepsPerSecond); step++) {
            const stepStart = step * samplesPerStep;

            for (let i = 0; i < Math.min(1000, samplesPerStep) && stepStart + i < numSamples; i++) {
                const t = i / this.sampleRate;
                const frequency = 150 + Math.random() * 100;
                const sample = Math.sin(2 * Math.PI * frequency * t) * 0.3 * Math.exp(-t * 6);
                audioData[stepStart + i] = Math.max(-1, Math.min(1, audioData[stepStart + i] + sample));
            }
        }

        return audioData;
    }

    /**
     * Generate distant sounds
     */
    generateDistantSounds(duration, soundType = 'generic') {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            let sample = 0;

            // Low-pass filtered noise for distant effect
            const distantNoise = (Math.random() - 0.5) * 0.1;
            const distantFiltered = distantNoise * Math.sin(2 * Math.PI * 100 * t);

            // Add occasional distant events
            if (Math.random() < 0.0002) { // 0.02% chance
                const eventFreq = 200 + Math.random() * 300;
                const eventSample = Math.sin(2 * Math.PI * eventFreq * t) * 0.2 * Math.exp(-t * 4);
                sample += eventSample;
            }

            sample += distantFiltered;

            audioData[i] = Math.max(-1, Math.min(1, sample));
        }

        return audioData;
    }

    /**
     * Apply spatial audio positioning (simple stereo simulation)
     */
    applySpatialPositioning(audioData, pan = 0.0) {
        // For mono, just return the data
        // In a real implementation, this would create stereo output
        return audioData;
    }

    /**
     * Mix multiple ambient layers
     */
    mixAmbientLayers(layers, volumes = []) {
        if (layers.length === 0) return new Float32Array(0);

        const length = layers[0].length;
        const mixed = new Float32Array(length);

        layers.forEach((layer, index) => {
            const volume = volumes[index] || 1.0;
            for (let i = 0; i < length; i++) {
                mixed[i] = Math.max(-1, Math.min(1, mixed[i] + layer[i] * volume));
            }
        });

        return mixed;
    }
}

module.exports = AmbientGenerator;
