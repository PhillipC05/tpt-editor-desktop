/**
 * TPT Music Composer - JavaScript/Node.js version
 * Specialized class for generating music compositions
 */

class MusicComposer {
    constructor(sampleRate = 44100, channels = 1, bitDepth = 16) {
        this.sampleRate = sampleRate;
        this.channels = channels;
        this.bitDepth = bitDepth;

        // Note frequency mapping (A4 = 440Hz)
        this.noteFrequencies = {
            'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
            'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
            'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
        };
    }

    /**
     * Convert note name and octave to frequency
     */
    noteToFrequency(note, octave = 4) {
        const baseFreq = this.noteFrequencies[note];
        if (!baseFreq) return 440; // Default to A4
        return baseFreq * Math.pow(2, octave - 4);
    }

    /**
     * Generate village music
     */
    generateVillageMusic(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateCombatMusic(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateDungeonMusic(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
    generateAmbientMusic(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
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
     * Generate generic music
     */
    generateGenericMusic(duration) {
        return this.generateVillageMusic(duration);
    }

    /**
     * Generate melody from note sequence
     */
    generateMelody(notes, noteDuration = 1.0, tempo = 120) {
        const adjustedDuration = noteDuration * (60 / tempo); // Adjust for tempo
        const totalDuration = notes.length * adjustedDuration;
        const numSamples = Math.floor(totalDuration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        let currentSample = 0;

        notes.forEach(note => {
            const noteSamples = Math.floor(adjustedDuration * this.sampleRate);
            const frequency = typeof note === 'string' ? this.noteToFrequency(note) : note;

            for (let i = 0; i < noteSamples && currentSample < numSamples; i++) {
                const t = i / this.sampleRate;
                const sample = Math.sin(2 * Math.PI * frequency * t) * 0.3 * Math.exp(-t * 0.5);
                audioData[currentSample] = Math.max(-1, Math.min(1, sample));
                currentSample++;
            }
        });

        return audioData;
    }

    /**
     * Generate harmony from chord progression
     */
    generateHarmony(chords, duration = 4.0) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        const chordDuration = numSamples / chords.length;

        chords.forEach((chord, chordIndex) => {
            const startSample = chordIndex * chordDuration;
            const endSample = (chordIndex + 1) * chordDuration;

            chord.forEach(frequency => {
                for (let i = startSample; i < endSample; i++) {
                    const t = (i - startSample) / this.sampleRate;
                    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.1 * Math.exp(-t * 0.2);
                    audioData[i] = Math.max(-1, Math.min(1, audioData[i] + sample));
                }
            });
        });

        return audioData;
    }

    /**
     * Generate rhythm pattern
     */
    generateRhythmPattern(pattern, tempo = 120, duration = 4.0) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        const beatDuration = 60 / tempo; // Duration of one beat in seconds
        const samplesPerBeat = Math.floor(beatDuration * this.sampleRate);

        pattern.forEach((beat, index) => {
            if (beat > 0) {
                const startSample = index * samplesPerBeat;
                const endSample = Math.min((index + 1) * samplesPerBeat, numSamples);

                for (let i = startSample; i < endSample; i++) {
                    const t = (i - startSample) / this.sampleRate;
                    // Simple drum-like sound
                    const frequency = 200 * Math.exp(-t * 10);
                    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.2 * Math.exp(-t * 5);
                    audioData[i] = Math.max(-1, Math.min(1, audioData[i] + sample));
                }
            }
        });

        return audioData;
    }

    /**
     * Get frequencies for a musical scale
     */
    getScaleFrequencies(rootNote, scaleType = 'major', octaves = 2) {
        const scales = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            pentatonic: [0, 2, 4, 7, 9]
        };

        const intervals = scales[scaleType] || scales.major;
        const frequencies = [];

        for (let octave = 0; octave < octaves; octave++) {
            intervals.forEach(interval => {
                const note = Object.keys(this.noteFrequencies)[interval];
                const frequency = this.noteToFrequency(note, 4 + octave);
                frequencies.push(frequency);
            });
        }

        return frequencies;
    }

    /**
     * Apply tempo adjustment
     */
    applyTempo(audioData, originalTempo = 120, newTempo = 120) {
        const ratio = originalTempo / newTempo;
        const newLength = Math.floor(audioData.length / ratio);
        const adjusted = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
            const sourceIndex = i * ratio;
            if (sourceIndex < audioData.length) {
                adjusted[i] = audioData[Math.floor(sourceIndex)];
            }
        }

        return adjusted;
    }

    /**
     * Apply time signature (simple implementation)
     */
    applyTimeSignature(audioData, beatsPerMeasure = 4, beatUnit = 4) {
        // For now, just return the audio data
        // Time signature affects rhythm generation, not post-processing
        return audioData;
    }
}

module.exports = MusicComposer;
