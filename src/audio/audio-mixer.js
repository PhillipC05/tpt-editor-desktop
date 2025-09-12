/**
 * TPT Audio Mixer - Multi-track audio mixing and processing
 */

class AudioMixer {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.tracks = new Map();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterPan = this.audioContext.createStereoPanner();
        this.masterPan.pan.value = 0;
        this.masterGain.connect(this.masterPan);
        this.masterPan.connect(this.audioContext.destination);

        // Master effects chain
        this.masterEffects = [];
        this.buildMasterEffectsChain();
    }

    buildMasterEffectsChain() {
        // Master compressor
        this.masterCompressor = this.audioContext.createDynamicsCompressor();
        this.masterCompressor.threshold.value = -24;
        this.masterCompressor.knee.value = 30;
        this.masterCompressor.ratio.value = 12;
        this.masterCompressor.attack.value = 0.003;
        this.masterCompressor.release.value = 0.25;

        // Master EQ
        this.masterEQ = this.createEQ();

        // Connect master effects
        this.masterPan.connect(this.masterEQ.input);
        this.masterEQ.connect(this.masterCompressor);
        this.masterCompressor.connect(this.audioContext.destination);
    }

    createTrack(trackId, options = {}) {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = options.volume || 0.8;

        const panNode = this.audioContext.createStereoPanner();
        panNode.pan.value = options.pan || 0;

        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;

        // Track effects chain
        const effectsChain = [];
        if (options.reverb) {
            effectsChain.push(this.createReverb(options.reverb));
        }
        if (options.delay) {
            effectsChain.push(this.createDelay(options.delay));
        }
        if (options.filter) {
            effectsChain.push(this.createFilter(options.filter));
        }

        // Connect: gain -> pan -> effects -> analyser -> master
        gainNode.connect(panNode);

        let currentNode = panNode;
        effectsChain.forEach(effect => {
            currentNode.connect(effect.input || effect);
            currentNode = effect;
        });

        currentNode.connect(analyser);
        analyser.connect(this.masterGain);

        const track = {
            gainNode,
            panNode,
            analyser,
            effectsChain,
            sources: [],
            volume: options.volume || 0.8,
            pan: options.pan || 0,
            muted: false,
            solo: false,
            name: options.name || trackId
        };

        this.tracks.set(trackId, track);
        return track;
    }

    playOnTrack(trackId, audioBuffer, options = {}) {
        const track = this.tracks.get(trackId);
        if (!track) return null;

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Source gain for individual control
        const sourceGain = this.audioContext.createGain();
        sourceGain.gain.value = options.volume || 1.0;

        // Connect source to track
        source.connect(sourceGain);
        sourceGain.connect(track.gainNode);

        if (options.loop) {
            source.loop = true;
        }

        if (options.startTime !== undefined) {
            source.start(this.audioContext.currentTime + options.startTime);
        } else {
            source.start();
        }

        const sourceInstance = {
            source,
            sourceGain,
            startTime: this.audioContext.currentTime,
            trackId
        };

        track.sources.push(sourceInstance);

        source.onended = () => {
            const index = track.sources.indexOf(sourceInstance);
            if (index > -1) {
                track.sources.splice(index, 1);
            }
            if (options.onEnded) {
                options.onEnded();
            }
        };

        return sourceInstance;
    }

    stopTrack(trackId) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.sources.forEach(sourceInstance => {
                try {
                    sourceInstance.source.stop();
                } catch (error) {
                    // Source might already be stopped
                }
            });
            track.sources = [];
        }
    }

    stopSource(sourceInstance) {
        if (sourceInstance && sourceInstance.source) {
            try {
                sourceInstance.source.stop();
            } catch (error) {
                // Source might already be stopped
            }
            // Remove from track sources
            const track = this.tracks.get(sourceInstance.trackId);
            if (track) {
                const index = track.sources.indexOf(sourceInstance);
                if (index > -1) {
                    track.sources.splice(index, 1);
                }
            }
        }
    }

    setTrackVolume(trackId, volume) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.volume = Math.max(0, Math.min(1, volume));
            track.gainNode.gain.value = track.volume;
        }
    }

    setTrackPan(trackId, pan) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.pan = Math.max(-1, Math.min(1, pan));
            track.panNode.pan.value = track.pan;
        }
    }

    muteTrack(trackId) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.muted = true;
            track.gainNode.gain.value = 0;
        }
    }

    unmuteTrack(trackId) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.muted = false;
            track.gainNode.gain.value = track.volume;
        }
    }

    soloTrack(trackId) {
        this.tracks.forEach((track, id) => {
            if (id === trackId) {
                track.solo = true;
                track.gainNode.gain.value = track.volume;
            } else {
                track.solo = false;
                if (!track.muted) {
                    track.gainNode.gain.value = 0;
                }
            }
        });
    }

    unsoloAll() {
        this.tracks.forEach(track => {
            track.solo = false;
            track.gainNode.gain.value = track.muted ? 0 : track.volume;
        });
    }

    setMasterVolume(volume) {
        this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }

    setMasterPan(pan) {
        this.masterPan.pan.value = Math.max(-1, Math.min(1, pan));
    }

    // Effects creation methods
    createReverb(options = {}) {
        const convolver = this.audioContext.createConvolver();
        const length = this.audioContext.sampleRate * (options.duration || 2);
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, options.decay || 2);
            }
        }

        convolver.buffer = impulse;
        return convolver;
    }

    createDelay(options = {}) {
        const delay = this.audioContext.createDelay();
        delay.delayTime.value = options.delayTime || 0.3;

        const feedbackGain = this.audioContext.createGain();
        feedbackGain.gain.value = options.feedback || 0.4;

        delay.connect(feedbackGain);
        feedbackGain.connect(delay);

        return { delay, feedbackGain, input: delay, output: delay };
    }

    createFilter(options = {}) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = options.type || 'lowpass';
        filter.frequency.value = options.frequency || 1000;
        filter.Q.value = options.Q || 1;

        return filter;
    }

    createEQ() {
        // Simple 3-band EQ
        const eq = {
            input: this.audioContext.createGain(),
            low: this.audioContext.createBiquadFilter(),
            mid: this.audioContext.createBiquadFilter(),
            high: this.audioContext.createBiquadFilter(),
            output: this.audioContext.createGain()
        };

        // Low band
        eq.low.type = 'lowshelf';
        eq.low.frequency.value = 250;

        // Mid band
        eq.mid.type = 'peaking';
        eq.mid.frequency.value = 1000;
        eq.mid.Q.value = 1;

        // High band
        eq.high.type = 'highshelf';
        eq.high.frequency.value = 4000;

        // Connect
        eq.input.connect(eq.low);
        eq.low.connect(eq.mid);
        eq.mid.connect(eq.high);
        eq.high.connect(eq.output);

        return eq;
    }

    // Get track information
    getTrackInfo(trackId) {
        const track = this.tracks.get(trackId);
        if (!track) return null;

        return {
            id: trackId,
            name: track.name,
            volume: track.volume,
            pan: track.pan,
            muted: track.muted,
            solo: track.solo,
            sourceCount: track.sources.length
        };
    }

    getAllTracksInfo() {
        const tracksInfo = [];
        this.tracks.forEach((track, id) => {
            tracksInfo.push(this.getTrackInfo(id));
        });
        return tracksInfo;
    }

    getTrackAnalyser(trackId) {
        const track = this.tracks.get(trackId);
        return track ? track.analyser : null;
    }

    // Master effects control
    setMasterReverb(wet = 0.3) {
        // This would require a send/return system
        // For simplicity, we'll skip advanced routing
    }

    dispose() {
        this.tracks.forEach(track => {
            track.sources.forEach(sourceInstance => {
                try {
                    sourceInstance.source.stop();
                } catch (error) {
                    // Source might already be stopped
                }
            });
        });
        this.tracks.clear();
    }
}

module.exports = AudioMixer;
