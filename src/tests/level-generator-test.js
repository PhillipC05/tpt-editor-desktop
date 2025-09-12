/**
 * Level Generator Test
 * Demonstrates the level generation system
 */

const LevelGenerator = require('../generators/level-generator');

async function testLevelGeneration() {
    console.log('🧪 Testing Level Generation System...\n');

    const levelGen = new LevelGenerator();

    // Test dungeon generation
    console.log('🏰 Generating Dungeon Level...');
    const dungeonConfig = {
        levelType: 'dungeon',
        size: 'medium',
        theme: 'dark',
        difficulty: 'normal',
        name: 'Test Dungeon'
    };

    try {
        const dungeonLevel = await levelGen.generateLevel(dungeonConfig);
        console.log('✅ Dungeon generated successfully!');
        console.log(`   Name: ${dungeonLevel.name}`);
        console.log(`   Size: ${dungeonLevel.config.dimensions.width}x${dungeonLevel.config.dimensions.height}`);
        console.log(`   Entities: ${dungeonLevel.entities.length}`);
        console.log(`   Lighting: ${dungeonLevel.lighting.length}`);

        // Test validation
        const validation = await levelGen.validator.validate(dungeonLevel);
        console.log(`   Validation: ${validation.overall} (${validation.score}/100)`);

        // Test export
        const jsonExport = await levelGen.exportLevel(dungeonLevel, 'json');
        console.log(`   JSON Export: ${jsonExport.substring(0, 50)}...`);

        console.log('\n🏰 Dungeon Level Stats:');
        const stats = levelGen.getLevelStats(dungeonLevel);
        console.log(`   - Total Entities: ${stats.totalEntities}`);
        console.log(`   - Entity Types: ${Object.keys(stats.entityTypes).join(', ')}`);
        console.log(`   - Connectivity: ${(stats.connectivity * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('❌ Dungeon generation failed:', error.message);
    }

    // Test forest generation
    console.log('\n🌲 Generating Forest Level...');
    const forestConfig = {
        levelType: 'forest',
        size: 'small',
        theme: 'bright',
        difficulty: 'easy',
        name: 'Enchanted Grove'
    };

    try {
        const forestLevel = await levelGen.generateLevel(forestConfig);
        console.log('✅ Forest generated successfully!');
        console.log(`   Name: ${forestLevel.name}`);
        console.log(`   Size: ${forestLevel.config.dimensions.width}x${forestLevel.config.dimensions.height}`);

        // Test TMX export
        const tmxExport = await levelGen.exportLevel(forestLevel, 'tmx');
        console.log(`   TMX Export Length: ${tmxExport.length} characters`);

    } catch (error) {
        console.error('❌ Forest generation failed:', error.message);
    }

    // Test town generation
    console.log('\n🏘️ Generating Town Level...');
    const townConfig = {
        levelType: 'town',
        size: 'large',
        theme: 'classic',
        difficulty: 'normal',
        name: 'Merchant District'
    };

    try {
        const townLevel = await levelGen.generateLevel(townConfig);
        console.log('✅ Town generated successfully!');
        console.log(`   Name: ${townLevel.name}`);
        console.log(`   Buildings: ${townLevel.entities.filter(e => e.type === 'building').length}`);

        // Test Unity export
        const unityExport = await levelGen.exportLevel(townLevel, 'unity');
        console.log(`   Unity Export Length: ${unityExport.length} characters`);

    } catch (error) {
        console.error('❌ Town generation failed:', error.message);
    }

    console.log('\n🎉 Level Generation System Test Complete!');
    console.log('\n📋 Supported Level Types:');
    console.log('   • dungeon - Underground complexes with rooms and corridors');
    console.log('   • cave - Natural cave systems with cellular automata');
    console.log('   • forest - Outdoor environments with trees and paths');
    console.log('   • town - Urban areas with buildings and streets');
    console.log('   • castle - Fortified structures with towers and walls');
    console.log('   • ruins - Overgrown ancient structures');
    console.log('   • mountain - Rocky terrain with height maps');
    console.log('   • swamp - Wetland areas with water features');

    console.log('\n📋 Export Formats:');
    console.log('   • JSON - Complete level data with metadata');
    console.log('   • TMX - Tiled Map Editor format');
    console.log('   • Unity - Unity game engine format');
    console.log('   • Godot - Godot game engine format');
    console.log('   • Generic - Universal level format');
}

// Run the test if this file is executed directly
if (require.main === module) {
    testLevelGeneration().catch(console.error);
}

module.exports = { testLevelGeneration };
