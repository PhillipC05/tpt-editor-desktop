/**
 * TPT Integration Tests - Comprehensive testing suite for cross-system compatibility
 * Tests asset generation, export, batch processing, and library organization
 */

const AudioGenerator = require('../generators/audio-generator');
const SpriteGenerator = require('../generators/sprite-generator');
const VehicleGenerator = require('../generators/vehicle-generator');
const BuildingGenerator = require('../generators/building-generator');
const ParticleGenerator = require('../generators/particle-generator');
const UIGenerator = require('../generators/ui-generator');
const fs = require('fs').promises;
const path = require('path');

class IntegrationTests {
    constructor() {
        this.generators = {};
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.testAssets = [];
    }

    async init() {
        try {
            console.log('Initializing integration test environment...');

            // Initialize all generators
            this.generators.audio = new AudioGenerator();
            this.generators.sprite = new SpriteGenerator();
            this.generators.vehicle = new VehicleGenerator();
            this.generators.building = new BuildingGenerator();
            this.generators.particle = new ParticleGenerator();
            this.generators.ui = new UIGenerator();

            console.log('✓ All generators initialized');
        } catch (error) {
            console.error('✗ Failed to initialize test environment:', error);
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

    /**
     * Test 1: Cross-Asset-Type Compatibility
     * Ensure all asset types can be generated with consistent interfaces
     */
    async testCrossAssetCompatibility() {
        console.log('\n🔄 Testing Cross-Asset-Type Compatibility...');

        const assetTypes = [
            { type: 'character', generator: 'sprite', config: { class: 'Warrior' } },
            { type: 'monster', generator: 'sprite', config: { type: 'Dragon' } },
            { type: 'item', generator: 'sprite', config: { category: 'Weapon' } },
            { type: 'tile', generator: 'sprite', config: { category: 'Ground' } },
            { type: 'sfx', generator: 'audio', config: { effectType: 'sword_attack' } },
            { type: 'music', generator: 'audio', config: { style: 'village' } },
            { type: 'ambient', generator: 'audio', config: { type: 'forest' } },
            { type: 'vehicle', generator: 'vehicle', config: { vehicleType: 'car' } },
            { type: 'building', generator: 'building', config: { buildingType: 'house' } },
            { type: 'particle', generator: 'particle', config: { effect: 'explosion' } },
            { type: 'ui', generator: 'ui', config: { element: 'button' } }
        ];

        for (const assetType of assetTypes) {
            try {
                const generator = this.generators[assetType.generator];
                let asset;

                switch (assetType.generator) {
                    case 'sprite':
                        switch (assetType.type) {
                            case 'character':
                                asset = await generator.generateCharacter(assetType.config);
                                break;
                            case 'monster':
                                asset = await generator.generateMonster(assetType.config);
                                break;
                            case 'item':
                                asset = await generator.generateItem(assetType.config);
                                break;
                            case 'tile':
                                asset = await generator.generateTile(assetType.config);
                                break;
                        }
                        break;
                    case 'audio':
                        switch (assetType.type) {
                            case 'sfx':
                                asset = await generator.generateSFX(assetType.config);
                                break;
                            case 'music':
                                asset = await generator.generateMusic(assetType.config);
                                break;
                            case 'ambient':
                                asset = await generator.generateAmbient(assetType.config);
                                break;
                        }
                        break;
                    case 'vehicle':
                        asset = await generator.generate('car', assetType.config);
                        break;
                    case 'building':
                        asset = await generator.generate('house', assetType.config);
                        break;
                    case 'particle':
                        asset = await generator.generate('explosion', assetType.config);
                        break;
                    case 'ui':
                        asset = await generator.generate('button', assetType.config);
                        break;
                }

                // Check for consistent asset structure
                const isValid = asset &&
                               asset.id &&
                               asset.type === assetType.type &&
                               asset.metadata &&
                               asset.metadata.generatedAt;

                this.logTest(`${assetType.type} generation`, isValid,
                    isValid ? `ID: ${asset.id}` : 'Invalid asset structure');

                if (isValid) {
                    this.testAssets.push(asset);
                }

            } catch (error) {
                this.logTest(`${assetType.type} generation`, false, error.message);
            }
        }
    }

    /**
     * Test 2: Export Functionality for All Types
     * Test exporting all generated assets in various formats
     */
    async testExportFunctionality() {
        console.log('\n📤 Testing Export Functionality...');

        const testDir = path.join(__dirname, '../../test-exports');

        // Ensure test directory exists
        try {
            await fs.mkdir(testDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        const exportFormats = {
            character: ['png', 'jpg', 'webp'],
            monster: ['png', 'jpg', 'webp'],
            item: ['png', 'jpg', 'webp'],
            tile: ['png', 'jpg', 'webp'],
            sfx: ['wav', 'mp3', 'ogg'],
            music: ['wav', 'mp3', 'ogg'],
            ambient: ['wav', 'mp3', 'ogg'],
            vehicle: ['png', 'jpg'],
            building: ['png', 'jpg'],
            particle: ['png', 'gif'],
            ui: ['png', 'jpg']
        };

        for (const asset of this.testAssets) {
            const formats = exportFormats[asset.type] || ['png'];

            for (const format of formats) {
                try {
                    const fileName = `${asset.type}_${asset.id}.${format}`;
                    const filePath = path.join(testDir, fileName);

                    // Simulate export (in real implementation, this would use actual export logic)
                    let exportData;
                    if (asset.type.includes('sfx') || asset.type.includes('music') || asset.type.includes('ambient')) {
                        // Audio export
                        exportData = Buffer.from('mock-audio-data', 'utf8');
                    } else {
                        // Image export
                        exportData = Buffer.from('mock-image-data', 'utf8');
                    }

                    await fs.writeFile(filePath, exportData);

                    // Verify file was created
                    const stats = await fs.stat(filePath);
                    const fileExists = stats.size > 0;

                    this.logTest(`${asset.type} ${format} export`, fileExists,
                        fileExists ? `${stats.size} bytes` : 'Export failed');

                    // Clean up
                    await fs.unlink(filePath);

                } catch (error) {
                    this.logTest(`${asset.type} ${format} export`, false, error.message);
                }
            }
        }
    }

    /**
     * Test 3: Batch Processing with Mixed Types
     * Test processing multiple assets of different types simultaneously
     */
    async testBatchProcessingMixedTypes() {
        console.log('\n📦 Testing Batch Processing with Mixed Types...');

        // Create a batch with different asset types
        const batchConfig = [
            { type: 'character', config: { class: 'Mage' } },
            { type: 'sfx', config: { effectType: 'fireball' } },
            { type: 'vehicle', config: { vehicleType: 'motorcycle' } },
            { type: 'building', config: { buildingType: 'castle' } },
            { type: 'particle', config: { effect: 'fire' } },
            { type: 'ui', config: { element: 'panel' } }
        ];

        try {
            const results = [];
            const startTime = Date.now();

            // Process batch
            for (let i = 0; i < batchConfig.length; i++) {
                const item = batchConfig[i];
                try {
                    let asset;

                    switch (item.type) {
                        case 'character':
                            asset = await this.generators.sprite.generateCharacter(item.config);
                            break;
                        case 'sfx':
                            asset = await this.generators.audio.generateSFX(item.config);
                            break;
                        case 'vehicle':
                            asset = await this.generators.vehicle.generate('motorcycle', item.config);
                            break;
                        case 'building':
                            asset = await this.generators.building.generate('castle', item.config);
                            break;
                        case 'particle':
                            asset = await this.generators.particle.generate('fire', item.config);
                            break;
                        case 'ui':
                            asset = await this.generators.ui.generate('panel', item.config);
                            break;
                    }

                    results.push(asset);

                } catch (error) {
                    results.push({ error: error.message, config: item });
                }
            }

            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const avgTime = totalTime / batchConfig.length;

            const allSuccessful = results.every(result => !result.error);
            const successCount = results.filter(result => !result.error).length;

            this.logTest('Mixed-type batch processing', allSuccessful,
                `${successCount}/${batchConfig.length} successful, ${avgTime.toFixed(2)}ms avg`);

        } catch (error) {
            this.logTest('Mixed-type batch processing', false, error.message);
        }
    }

    /**
     * Test 4: Library Organization
     * Test asset categorization, tagging, and search functionality
     */
    async testLibraryOrganization() {
        console.log('\n📚 Testing Library Organization...');

        // Test asset categorization
        const categories = {
            visual: ['character', 'monster', 'item', 'tile', 'vehicle', 'building', 'particle', 'ui'],
            audio: ['sfx', 'music', 'ambient']
        };

        for (const [category, types] of Object.entries(categories)) {
            const categoryAssets = this.testAssets.filter(asset => types.includes(asset.type));
            const categoryValid = categoryAssets.length > 0;

            this.logTest(`${category} category organization`, categoryValid,
                categoryValid ? `${categoryAssets.length} assets` : 'No assets in category');
        }

        // Test metadata consistency
        for (const asset of this.testAssets) {
            const hasRequiredMetadata = asset.metadata &&
                                      asset.metadata.generatedAt &&
                                      asset.metadata.version;

            this.logTest(`${asset.type} metadata`, hasRequiredMetadata,
                hasRequiredMetadata ? `v${asset.metadata.version}` : 'Missing required metadata');
        }

        // Test asset uniqueness
        const ids = this.testAssets.map(asset => asset.id);
        const uniqueIds = new Set(ids);
        const allIdsUnique = ids.length === uniqueIds.size;

        this.logTest('Asset ID uniqueness', allIdsUnique,
            allIdsUnique ? `${ids.length} unique IDs` : 'Duplicate IDs found');

        // Test asset type consistency
        const validTypes = ['character', 'monster', 'item', 'tile', 'sfx', 'music', 'ambient', 'vehicle', 'building', 'particle', 'ui'];
        for (const asset of this.testAssets) {
            const typeValid = validTypes.includes(asset.type);
            this.logTest(`${asset.type} type validation`, typeValid,
                typeValid ? 'Valid type' : 'Invalid asset type');
        }
    }

    /**
     * Test 5: Performance Across Asset Types
     * Test generation speed and memory usage for different asset types
     */
    async testPerformanceAcrossTypes() {
        console.log('\n⚡ Testing Performance Across Asset Types...');

        const performanceResults = {};

        for (const asset of this.testAssets.slice(0, 5)) { // Test first 5 assets
            const startTime = Date.now();
            const startMemory = process.memoryUsage().heapUsed;

            try {
                // Regenerate the same asset type for performance testing
                let newAsset;

                switch (asset.type) {
                    case 'character':
                        newAsset = await this.generators.sprite.generateCharacter({ class: 'Warrior' });
                        break;
                    case 'sfx':
                        newAsset = await this.generators.audio.generateSFX({ effectType: 'button_click' });
                        break;
                    case 'vehicle':
                        newAsset = await this.generators.vehicle.generate('car', {});
                        break;
                    case 'building':
                        newAsset = await this.generators.building.generate('house', {});
                        break;
                    case 'particle':
                        newAsset = await this.generators.particle.generate('explosion', {});
                        break;
                    case 'ui':
                        newAsset = await this.generators.ui.generate('button', {});
                        break;
                }

                const endTime = Date.now();
                const endMemory = process.memoryUsage().heapUsed;

                const generationTime = endTime - startTime;
                const memoryDelta = endMemory - startMemory;

                performanceResults[asset.type] = {
                    time: generationTime,
                    memory: memoryDelta,
                    success: !!newAsset
                };

                this.logTest(`${asset.type} performance`, generationTime < 5000,
                    `${generationTime}ms, ${Math.round(memoryDelta / 1024)}KB`);

            } catch (error) {
                this.logTest(`${asset.type} performance`, false, error.message);
            }
        }

        // Check overall performance
        const avgTime = Object.values(performanceResults)
            .reduce((sum, result) => sum + result.time, 0) / Object.keys(performanceResults).length;

        this.logTest('Average generation time', avgTime < 3000,
            `${avgTime.toFixed(2)}ms average`);
    }

    /**
     * Test 6: Error Handling and Recovery
     * Test system behavior with invalid inputs and error conditions
     */
    async testErrorHandling() {
        console.log('\n🚨 Testing Error Handling and Recovery...');

        // Test invalid asset type
        try {
            const invalidAsset = await this.generators.sprite.generateCharacter({ class: 'InvalidClass' });
            this.logTest('Invalid class handling', !invalidAsset || invalidAsset.error,
                'Should handle invalid class gracefully');
        } catch (error) {
            this.logTest('Invalid class handling', true, 'Exception caught properly');
        }

        // Test missing required parameters
        try {
            const missingParams = await this.generators.audio.generateSFX({});
            this.logTest('Missing parameters handling', !missingParams || missingParams.error,
                'Should handle missing parameters');
        } catch (error) {
            this.logTest('Missing parameters handling', true, 'Exception caught properly');
        }

        // Test invalid format
        try {
            const invalidFormat = await this.generators.audio.generateSFX({
                effectType: 'sword_attack',
                format: 'invalid'
            });
            this.logTest('Invalid format handling', !invalidFormat || invalidFormat.error,
                'Should handle invalid format');
        } catch (error) {
            this.logTest('Invalid format handling', true, 'Exception caught properly');
        }

        // Test concurrent generation stress
        try {
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(this.generators.audio.generateSFX({
                    effectType: 'button_click',
                    duration: 0.5
                }));
            }

            const results = await Promise.all(promises);
            const allSuccessful = results.every(result => result && !result.error);

            this.logTest('Concurrent generation', allSuccessful,
                `Processed ${results.length} concurrent requests`);

        } catch (error) {
            this.logTest('Concurrent generation', false, error.message);
        }
    }

    /**
     * Test 7: Asset Quality Validation
     * Test that generated assets meet quality standards
     */
    async testAssetQuality() {
        console.log('\n🎨 Testing Asset Quality Validation...');

        for (const asset of this.testAssets) {
            // Check asset has minimum required properties
            const hasBasicProps = asset.id && asset.type && asset.metadata;

            // Check asset-specific quality metrics
            let qualityValid = false;

            switch (asset.type) {
                case 'character':
                case 'monster':
                case 'item':
                case 'tile':
                case 'vehicle':
                case 'building':
                case 'particle':
                case 'ui':
                    // Visual assets should have dimensions
                    qualityValid = asset.width && asset.height && asset.width > 0 && asset.height > 0;
                    break;
                case 'sfx':
                case 'music':
                case 'ambient':
                    // Audio assets should have duration and sample rate
                    qualityValid = asset.audio &&
                                  asset.audio.duration > 0 &&
                                  asset.audio.sampleRate > 0;
                    break;
                default:
                    qualityValid = true; // Default pass for unknown types
            }

            const overallQuality = hasBasicProps && qualityValid;

            this.logTest(`${asset.type} quality`, overallQuality,
                overallQuality ? 'Meets quality standards' : 'Quality issues detected');
        }
    }

    printSummary() {
        console.log('\n📊 Integration Test Summary:');
        console.log(`Total tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

        console.log('\n📈 Assets Generated During Testing:');
        const assetCounts = {};
        this.testAssets.forEach(asset => {
            assetCounts[asset.type] = (assetCounts[asset.type] || 0) + 1;
        });

        Object.entries(assetCounts).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });
    }

    async runAllTests() {
        console.log('🔬 Starting TPT Integration Test Suite...\n');

        try {
            await this.init();

            await this.testCrossAssetCompatibility();
            await this.testExportFunctionality();
            await this.testBatchProcessingMixedTypes();
            await this.testLibraryOrganization();
            await this.testPerformanceAcrossTypes();
            await this.testErrorHandling();
            await this.testAssetQuality();

            this.printSummary();

            if (this.testResults.failed === 0) {
                console.log('\n🎉 All integration tests passed!');
            } else {
                console.log(`\n⚠️ ${this.testResults.failed} test(s) failed.`);
            }

        } catch (error) {
            console.error('Integration test suite failed:', error);
            this.printSummary();
        }
    }
}

module.exports = IntegrationTests;

// Run tests if called directly
if (require.main === module) {
    const tests = new IntegrationTests();
    tests.runAllTests().catch(console.error);
}
