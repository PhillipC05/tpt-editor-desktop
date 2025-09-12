/**
 * TPT Audio Tests - Comprehensive testing suite for audio generation and playback
 */

const AudioGenerator = require('../generators/audio-generator');
const AudioManager = require('../audio/audio-manager');
const fs = require('fs').promises;
const path = require('path');

class AudioTests {
    constructor() {
        this.audioGenerator = new AudioGenerator();
        this.audioManager = null;
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async init() {
        try {
            this.audioManager = new AudioManager();
            await this.audioManager.init();
            console.log('✓ Audio test environment initialized');
        } catch (error) {
            console.error('✗ Failed to initialize audio test environment:', error);
            throw error;
        }
    }

    logTest(testName, passed, message = '') {
        this.testResults.total++;
        if (passed) {
            this.testResults.passed++;
            console.log(`✓ ${testName}${message ? ': ' + message : ''}`);
        } else {
            this.testResults.failed++;
            console.log(`✗ ${testName}${message ? ': ' + message : ''}`);
        }
    }

    async testSFXGeneration() {
        console.log('\n🎵 Testing SFX Generation...');

        const effects = ['sword_attack', 'fireball', 'level_up', 'item_pickup', 'button_click', 'magic_spell', 'monster_roar', 'coin_collect', 'door_open'];

        for (const effect of effects) {
            try {
                const asset = await this.audioGenerator.generateSFX({
                    effectType: effect,
                    duration: 1.0,
                    format: 'wav'
                });

                const isValid = asset &&
                               asset.audio &&
                               asset.audio.data &&
                               asset.audio.duration > 0 &&
                               asset.audio.sampleRate === 44100;

                this.logTest(`${effect} generation`, isValid,
                    isValid ? `${asset.audio.duration}s, ${asset.audio.sampleRate}Hz` : 'Invalid asset structure');

            } catch (error) {
                this.logTest(`${effect} generation`, false, error.message);
            }
        }
    }

    async testMusicGeneration() {
        console.log('\n🎼 Testing Music Generation...');

        const styles = ['village', 'combat', 'dungeon', 'ambient'];

        for (const style of styles) {
            try {
                const asset = await this.audioGenerator.generateMusic({
                    style: style,
                    duration: 5, // Shorter for testing
                    format: 'wav'
                });

                const isValid = asset &&
                               asset.audio &&
                               asset.audio.data &&
                               asset.audio.duration > 0;

                this.logTest(`${style} music generation`, isValid,
                    isValid ? `${asset.audio.duration}s` : 'Invalid asset structure');

            } catch (error) {
                this.logTest(`${style} music generation`, false, error.message);
            }
        }
    }

    async testAmbientGeneration() {
        console.log('\n🌍 Testing Ambient Generation...');

        const types = ['forest', 'village', 'cave', 'wind', 'ocean'];

        for (const type of types) {
            try {
                const asset = await this.audioGenerator.generateAmbient({
                    type: type,
                    duration: 5, // Shorter for testing
                    format: 'wav'
                });

                const isValid = asset &&
                               asset.audio &&
                               asset.audio.data &&
                               asset.audio.duration > 0;

                this.logTest(`${type} ambient generation`, isValid,
                    isValid ? `${asset.audio.duration}s` : 'Invalid asset structure');

            } catch (error) {
                this.logTest(`${type} ambient generation`, false, error.message);
            }
        }
    }

    async testAudioPlayback() {
        console.log('\n▶️ Testing Audio Playback...');

        try {
            // Generate a test asset
            const asset = await this.audioGenerator.generateSFX({
                effectType: 'button_click',
                duration: 0.5,
                format: 'wav'
            });

            // Test playback
            const audioInstance = await this.audioManager.playAudio(asset.audio.data, asset.audio.format);

            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 200));

            // Stop playback
            this.audioManager.stopAudio(audioInstance);

            this.logTest('Audio playback', true, 'Playback started and stopped successfully');

        } catch (error) {
            this.logTest('Audio playback', false, error.message);
        }
    }

    async testMP3Export() {
        console.log('\n🎵 Testing MP3 Export...');

        try {
            const asset = await this.audioGenerator.generateSFX({
                effectType: 'sword_attack',
                duration: 1.0,
                format: 'mp3',
                quality: 128
            });

            const isValid = asset &&
                           asset.audio &&
                           asset.audio.data &&
                           asset.audio.format === 'mp3' &&
                           asset.config.quality === 128;

            this.logTest('MP3 export', isValid,
                isValid ? `Quality: ${asset.config.quality}kbps` : 'Invalid MP3 asset');

        } catch (error) {
            this.logTest('MP3 export', false, error.message);
        }
    }

    async testParameterRanges() {
        console.log('\n⚙️ Testing Parameter Ranges...');

        // Test duration limits
        try {
            const asset = await this.audioGenerator.generateSFX({
                effectType: 'sword_attack',
                duration: 0.1,
                format: 'wav'
            });
            this.logTest('Minimum duration (0.1s)', asset.audio.duration >= 0.1);
        } catch (error) {
            this.logTest('Minimum duration (0.1s)', false, error.message);
        }

        try {
            const asset = await this.audioGenerator.generateSFX({
                effectType: 'sword_attack',
                duration: 5.0,
                format: 'wav'
            });
            this.logTest('Maximum duration (5.0s)', asset.audio.duration <= 5.0);
        } catch (error) {
            this.logTest('Maximum duration (5.0s)', false, error.message);
        }

        // Test quality limits
        try {
            const asset = await this.audioGenerator.generateSFX({
                effectType: 'sword_attack',
                duration: 1.0,
                format: 'mp3',
                quality: 64
            });
            this.logTest('Minimum MP3 quality (64kbps)', asset.config.quality >= 64);
        } catch (error) {
            this.logTest('Minimum MP3 quality (64kbps)', false, error.message);
        }

        try {
            const asset = await this.audioGenerator.generateSFX({
                effectType: 'sword_attack',
                duration: 1.0,
                format: 'mp3',
                quality: 320
            });
            this.logTest('Maximum MP3 quality (320kbps)', asset.config.quality <= 320);
        } catch (error) {
            this.logTest('Maximum MP3 quality (320kbps)', false, error.message);
        }
    }

    async testBatchExport() {
        console.log('\n📦 Testing Batch Export...');

        try {
            const assets = [];
            const testDir = path.join(__dirname, '../../test-exports');

            // Ensure test directory exists
            try {
                await fs.mkdir(testDir, { recursive: true });
            } catch (error) {
                // Directory might already exist
            }

            // Generate test assets
            for (let i = 0; i < 3; i++) {
                const asset = await this.audioGenerator.generateSFX({
                    effectType: 'button_click',
                    duration: 0.5,
                    format: 'wav'
                });
                assets.push(asset);
            }

            // Test batch export
            const results = await this.audioGenerator.batchExport(assets, testDir);

            const allExported = results.every(result => result && typeof result === 'string');

            this.logTest('Batch export', allExported,
                allExported ? `Exported ${results.length} files` : 'Some exports failed');

            // Clean up test files
            for (const result of results) {
                try {
                    await fs.unlink(result);
                } catch (error) {
                    // Ignore cleanup errors
                }
            }

        } catch (error) {
            this.logTest('Batch export', false, error.message);
        }
    }

    async testPerformance() {
        console.log('\n⚡ Testing Performance...');

        const startTime = Date.now();

        // Generate multiple assets
        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(this.audioGenerator.generateSFX({
                effectType: 'button_click',
                duration: 0.5,
                format: 'wav'
            }));
        }

        try {
            await Promise.all(promises);
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const avgTime = totalTime / 10;

            this.logTest('Performance (10 assets)', avgTime < 2000,
                `Average: ${avgTime.toFixed(2)}ms per asset`);

        } catch (error) {
            this.logTest('Performance (10 assets)', false, error.message);
        }
    }

    async testAudioQuality() {
        console.log('\n🎚️ Testing Audio Quality...');

        try {
            const asset = await this.audioGenerator.generateSFX({
                effectType: 'sword_attack',
                duration: 1.0,
                format: 'wav'
            });

            // Check if audio data exists and has reasonable size
            const dataSize = Buffer.from(asset.audio.data, 'base64').length;
            const expectedSize = asset.audio.duration * asset.audio.sampleRate * 2; // 16-bit mono

            const qualityOk = dataSize > expectedSize * 0.8 && dataSize < expectedSize * 1.2;

            this.logTest('Audio quality check', qualityOk,
                `Data size: ${dataSize} bytes, Expected: ~${expectedSize} bytes`);

        } catch (error) {
            this.logTest('Audio quality check', false, error.message);
        }
    }

    printSummary() {
        console.log('\n📊 Test Summary:');
        console.log(`Total tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    }

    async runAllTests() {
        console.log('🎵 Starting TPT Audio Test Suite...\n');

        try {
            await this.init();

            await this.testSFXGeneration();
            await this.testMusicGeneration();
            await this.testAmbientGeneration();
            await this.testAudioPlayback();
            await this.testMP3Export();
            await this.testParameterRanges();
            await this.testBatchExport();
            await this.testPerformance();
            await this.testAudioQuality();

            this.printSummary();

            if (this.testResults.failed === 0) {
                console.log('\n🎉 All audio tests passed!');
            } else {
                console.log(`\n⚠️ ${this.testResults.failed} test(s) failed.`);
            }

        } catch (error) {
            console.error('Test suite failed:', error);
            this.printSummary();
        }
    }
}

module.exports = AudioTests;

// Run tests if called directly
if (require.main === module) {
    const tests = new AudioTests();
    tests.runAllTests().catch(console.error);
}
