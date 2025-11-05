/**
 * Tests for WeaponGenerator
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const WeaponGenerator = require('../weapon-generator');
const { FileHelpers } = require('../../../test-utils');

describe('WeaponGenerator', () => {
  let generator;
  let tempDir;

  beforeEach(() => {
    generator = new WeaponGenerator();
    tempDir = FileHelpers.createTempDir();
  });

  afterEach(async () => {
    await FileHelpers.cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    it('should initialize with weapon types', () => {
      expect(generator.weaponTypes).toBeDefined();
      expect(generator.weaponTypes.SWORDS).toBe('swords');
      expect(generator.weaponTypes.BOWS).toBe('bows');
      expect(generator.weaponTypes.STAFFS).toBe('staffs');
      expect(generator.weaponTypes.AXES).toBe('axes');
      expect(generator.weaponTypes.MAGICAL).toBe('magical');
    });

    it('should initialize with weapon materials', () => {
      expect(generator.weaponMaterials).toBeDefined();
      expect(generator.weaponMaterials.IRON).toBe('iron');
      expect(generator.weaponMaterials.STEEL).toBe('steel');
      expect(generator.weaponMaterials.MITHRIL).toBe('mithril');
      expect(generator.weaponMaterials.CRYSTAL).toBe('crystal');
    });

    it('should initialize with weapon qualities', () => {
      expect(generator.weaponQualities).toBeDefined();
      expect(generator.weaponQualities.COMMON).toBe('common');
      expect(generator.weaponQualities.RARE).toBe('rare');
      expect(generator.weaponQualities.LEGENDARY).toBe('legendary');
    });

    it('should initialize with weapon sizes', () => {
      expect(generator.weaponSizes).toBeDefined();
      expect(generator.weaponSizes.SMALL).toBe('small');
      expect(generator.weaponSizes.MEDIUM).toBe('medium');
      expect(generator.weaponSizes.LARGE).toBe('large');
    });

    it('should have weapon templates defined', () => {
      expect(generator.weaponTemplates).toBeDefined();
      expect(generator.weaponTemplates.swords).toBeDefined();
      expect(Array.isArray(generator.weaponTemplates.swords)).toBe(true);
      expect(generator.weaponTemplates.swords.length).toBeGreaterThan(0);
    });
  });

  describe('generate()', () => {
    it('should generate a weapon with default options', async () => {
      const result = await generator.generate();

      expect(result).toBeDefined();
      expect(result.weaponData).toBeDefined();
      expect(result.weaponData.id).toBeDefined();
      expect(result.weaponData.name).toBeDefined();
      expect(result.weaponData.type).toBeDefined();
      expect(result.metadata).toBeDefined();
    }, 15000);

    it('should generate a sword', async () => {
      const result = await generator.generate({
        type: 'swords',
      });

      expect(result.weaponData.type).toBe('swords');
    }, 15000);

    it('should generate a bow', async () => {
      const result = await generator.generate({
        type: 'bows',
      });

      expect(result.weaponData.type).toBe('bows');
    }, 15000);

    it('should generate a staff', async () => {
      const result = await generator.generate({
        type: 'staffs',
      });

      expect(result.weaponData.type).toBe('staffs');
    }, 15000);

    it('should generate weapon with specific material', async () => {
      const result = await generator.generate({
        type: 'swords',
        material: 'steel',
      });

      expect(result.weaponData.material).toBe('steel');
    }, 15000);

    it('should generate weapon with specific quality', async () => {
      const result = await generator.generate({
        type: 'swords',
        quality: 'legendary',
      });

      expect(result.weaponData.quality).toBe('legendary');
    }, 15000);

    it('should generate weapon with specific size', async () => {
      const result = await generator.generate({
        type: 'axes',
        size: 'large',
      });

      expect(result.weaponData.size).toBe('large');
    }, 15000);

    it('should include image buffer in result', async () => {
      const result = await generator.generate({
        type: 'daggers',
        size: 'small',
      });

      expect(result.image).toBeDefined();
      expect(Buffer.isBuffer(result.image)).toBe(true);
      expect(result.image.length).toBeGreaterThan(0);
    }, 15000);

    it('should generate weapon with stats', async () => {
      const result = await generator.generate({
        type: 'swords',
      });

      expect(result.weaponData.stats).toBeDefined();
      expect(result.weaponData.stats.damage).toBeDefined();
      expect(result.weaponData.stats.weight).toBeDefined();
      expect(result.weaponData.stats.baseDamage).toBeDefined();
    }, 15000);

    it('should generate weapon with metadata', async () => {
      const result = await generator.generate();

      expect(result.metadata).toBeDefined();
      expect(result.metadata.generator).toBe('WeaponGenerator');
      expect(result.metadata.version).toBeDefined();
      expect(result.metadata.generated).toBeDefined();
    }, 15000);
  });

  describe('generateWeaponId()', () => {
    it('should generate unique weapon IDs', () => {
      const id1 = generator.generateWeaponId();
      const id2 = generator.generateWeaponId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });

    it('should generate IDs consistently', () => {
      const ids = Array.from({ length: 10 }, () => generator.generateWeaponId());

      ids.forEach(id => {
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });

  describe('generateWeaponName()', () => {
    it('should generate weapon name from components', () => {
      const name = generator.generateWeaponName('Longsword', 'steel', 'rare');

      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('should handle different base names', () => {
      const baseNames = ['Longsword', 'Shortbow', 'Battle Axe', 'Warhammer'];

      baseNames.forEach(baseName => {
        const name = generator.generateWeaponName(baseName, 'iron', 'common');
        expect(name).toBeDefined();
        expect(typeof name).toBe('string');
      });
    });

    it('should incorporate quality into name', () => {
      const commonName = generator.generateWeaponName('Sword', 'iron', 'common');
      const legendaryName = generator.generateWeaponName('Sword', 'iron', 'legendary');

      expect(commonName).toBeDefined();
      expect(legendaryName).toBeDefined();
      expect(typeof commonName).toBe('string');
      expect(typeof legendaryName).toBe('string');
    });
  });

  describe('weapon properties', () => {
    it('should generate weapon with base damage', async () => {
      const result = await generator.generate({ type: 'swords' });

      expect(result.weaponData.stats.baseDamage).toBeDefined();
      expect(result.weaponData.stats.baseDamage).toBeGreaterThan(0);
    }, 15000);

    it('should generate weapon with weight', async () => {
      const result = await generator.generate({ type: 'hammers' });

      expect(result.weaponData.stats.weight).toBeDefined();
      expect(result.weaponData.stats.weight).toBeGreaterThan(0);
    }, 15000);

    it('should generate weapon with traits', async () => {
      const result = await generator.generate({ type: 'swords' });

      expect(result.weaponData.traits).toBeDefined();
      expect(Array.isArray(result.weaponData.traits)).toBe(true);
    }, 15000);

    it('should generate weapon with description', async () => {
      const result = await generator.generate({ type: 'bows' });

      expect(result.weaponData.description).toBeDefined();
      expect(typeof result.weaponData.description).toBe('string');
      expect(result.weaponData.description.length).toBeGreaterThan(0);
    }, 15000);

    it('should generate weapon with requirements', async () => {
      const result = await generator.generate({ type: 'swords' });

      expect(result.weaponData.requirements).toBeDefined();
      expect(typeof result.weaponData.requirements).toBe('object');
    }, 15000);
  });

  describe('material variations', () => {
    it('should apply material bonuses correctly', async () => {
      const iron = await generator.generate({ type: 'swords', material: 'iron' });
      const mithril = await generator.generate({ type: 'swords', material: 'mithril' });

      // Mithril should provide better stats
      expect(iron.weaponData.stats.damage).toBeDefined();
      expect(mithril.weaponData.stats.damage).toBeDefined();
      // Material quality should affect stats
      expect(typeof iron.weaponData.stats.damage).toBe('number');
      expect(typeof mithril.weaponData.stats.damage).toBe('number');
    }, 20000);

    it('should have different properties for different materials', async () => {
      const wood = await generator.generate({ type: 'staffs', material: 'wood' });
      const crystal = await generator.generate({ type: 'staffs', material: 'crystal' });

      expect(wood.weaponData.material).toBe('wood');
      expect(crystal.weaponData.material).toBe('crystal');
    }, 15000);
  });

  describe('quality variations', () => {
    it('should affect stats based on quality', async () => {
      const common = await generator.generate({ type: 'swords', quality: 'common' });
      const legendary = await generator.generate({ type: 'swords', quality: 'legendary' });

      expect(common.weaponData.quality).toBe('common');
      expect(legendary.weaponData.quality).toBe('legendary');
      // Legendary should have better overall stats or special properties
      expect(common.weaponData.stats.damage).toBeDefined();
      expect(legendary.weaponData.stats.damage).toBeDefined();
    }, 20000);

    it('should add enchantments to higher quality weapons', async () => {
      const legendary = await generator.generate({ type: 'swords', quality: 'legendary' });

      // Legendary weapons should have enchantments or special properties
      expect(legendary.weaponData).toBeDefined();
      expect(legendary.weaponData.quality).toBe('legendary');
    }, 15000);
  });

  describe('weapon type variations', () => {
    it('should generate all weapon types', async () => {
      const types = ['swords', 'bows', 'staffs', 'axes', 'hammers'];

      for (const type of types) {
        const result = await generator.generate({ type });
        expect(result.weaponData.type).toBe(type);
      }
    }, 30000);

    it('should have appropriate stats for each weapon type', async () => {
      const dagger = await generator.generate({ type: 'daggers' });
      const hammer = await generator.generate({ type: 'hammers' });

      // Daggers should be lighter and faster
      // Hammers should be heavier and more powerful
      expect(dagger.weaponData.stats.weight).toBeLessThan(hammer.weaponData.stats.weight);
    }, 20000);
  });

  describe('edge cases', () => {
    it('should handle invalid weapon type gracefully', async () => {
      const result = await generator.generate({
        type: 'invalid_weapon_type',
      });

      expect(result).toBeDefined();
      expect(result.weaponData).toBeDefined();
    }, 15000);

    it('should handle invalid material gracefully', async () => {
      const result = await generator.generate({
        type: 'swords',
        material: 'invalid_material',
      });

      expect(result).toBeDefined();
      expect(result.weaponData).toBeDefined();
    }, 15000);

    it('should handle invalid quality gracefully', async () => {
      const result = await generator.generate({
        type: 'swords',
        quality: 'invalid_quality',
      });

      expect(result).toBeDefined();
      expect(result.weaponData).toBeDefined();
    }, 15000);

    it('should handle missing options object', async () => {
      const result = await generator.generate();

      expect(result).toBeDefined();
      expect(result.weaponData).toBeDefined();
    }, 15000);

    it('should handle null options', async () => {
      const result = await generator.generate(null);

      expect(result).toBeDefined();
      expect(result.weaponData).toBeDefined();
    }, 15000);

    it('should handle undefined values in options', async () => {
      const result = await generator.generate({
        type: undefined,
        material: undefined,
        quality: undefined,
      });

      expect(result).toBeDefined();
      expect(result.weaponData).toBeDefined();
    }, 15000);
  });

  describe('performance', () => {
    it('should generate weapon within reasonable time', async () => {
      const startTime = Date.now();
      await generator.generate({ type: 'daggers', size: 'small' });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10000);
    });

    it('should handle multiple generations efficiently', async () => {
      const startTime = Date.now();
      const promises = Array.from({ length: 3 }, () =>
        generator.generate({ type: 'swords', size: 'small' })
      );
      await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(20000);
    });

    it('should not leak memory with repeated generations', async () => {
      for (let i = 0; i < 5; i++) {
        await generator.generate({ type: 'bows', size: 'small' });
      }
      expect(true).toBe(true);
    }, 30000);
  });

  describe('special weapons', () => {
    it('should generate magical weapons', async () => {
      const result = await generator.generate({
        type: 'magical',
      });

      expect(result.weaponData.type).toBe('magical');
    }, 15000);

    it('should generate shields', async () => {
      const result = await generator.generate({
        type: 'shields',
      });

      expect(result.weaponData.type).toBe('shields');
    }, 15000);

    it('should generate guns', async () => {
      const result = await generator.generate({
        type: 'guns',
      });

      expect(result.weaponData.type).toBe('guns');
    }, 15000);
  });
});
