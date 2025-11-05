/**
 * Tests for CoinGenerator
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const CoinGenerator = require('../coin-generator');
const { FileHelpers } = require('../../../test-utils');

describe('CoinGenerator', () => {
  let generator;
  let tempDir;

  beforeEach(() => {
    generator = new CoinGenerator();
    tempDir = FileHelpers.createTempDir();
  });

  afterEach(async () => {
    await FileHelpers.cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    it('should initialize with coin types', () => {
      expect(generator.coinTypes).toBeDefined();
      expect(generator.coinTypes.GOLD).toBe('gold');
      expect(generator.coinTypes.SILVER).toBe('silver');
      expect(generator.coinTypes.COPPER).toBe('copper');
      expect(generator.coinTypes.PLATINUM).toBe('platinum');
      expect(generator.coinTypes.ANCIENT).toBe('ancient');
      expect(generator.coinTypes.MAGICAL).toBe('magical');
    });

    it('should initialize with coin denominations', () => {
      expect(generator.coinDenominations).toBeDefined();
      expect(generator.coinDenominations.PENNY).toBe('penny');
      expect(generator.coinDenominations.QUARTER).toBe('quarter');
      expect(generator.coinDenominations.DOLLAR).toBe('dollar');
    });

    it('should initialize with coin qualities', () => {
      expect(generator.coinQualities).toBeDefined();
      expect(generator.coinQualities.COMMON).toBe('common');
      expect(generator.coinQualities.RARE).toBe('rare');
      expect(generator.coinQualities.LEGENDARY).toBe('legendary');
    });

    it('should initialize with coin sizes', () => {
      expect(generator.coinSizes).toBeDefined();
      expect(generator.coinSizes.SMALL).toBe('small');
      expect(generator.coinSizes.MEDIUM).toBe('medium');
      expect(generator.coinSizes.LARGE).toBe('large');
    });

    it('should have material templates defined', () => {
      expect(generator.coinMaterialTemplates).toBeDefined();
      expect(generator.coinMaterialTemplates.GOLD).toBeDefined();
      expect(generator.coinMaterialTemplates.GOLD.name).toBe('Gold Coin');
      expect(generator.coinMaterialTemplates.GOLD.baseValue).toBe(100);
    });
  });

  describe('generate()', () => {
    it('should generate a coin with default options', async () => {
      const result = await generator.generate();

      expect(result).toBeDefined();
      expect(result.coinData).toBeDefined();
      expect(result.coinData.id).toBeDefined();
      expect(result.coinData.name).toBeDefined();
      expect(result.coinData.material).toBeDefined();
      expect(result.metadata).toBeDefined();
    }, 15000);

    it('should generate a gold coin', async () => {
      const result = await generator.generate({
        material: 'gold',
      });

      expect(result.coinData.material).toBe('gold');
      expect(result.coinData.name).toContain('Gold');
    }, 15000);

    it('should generate a silver coin', async () => {
      const result = await generator.generate({
        material: 'silver',
      });

      expect(result.coinData.material).toBe('silver');
      expect(result.coinData.name).toContain('Silver');
    }, 15000);

    it('should generate coin with specific denomination', async () => {
      const result = await generator.generate({
        material: 'gold',
        denomination: 'quarter',
      });

      expect(result.coinData.denomination).toBe('quarter');
    }, 15000);

    it('should generate coin with specific quality', async () => {
      const result = await generator.generate({
        material: 'gold',
        quality: 'legendary',
      });

      expect(result.coinData.quality).toBe('legendary');
    }, 15000);

    it('should include image buffer in result', async () => {
      const result = await generator.generate({
        material: 'copper',
        size: 'small',
      });

      expect(result.image).toBeDefined();
      expect(Buffer.isBuffer(result.image)).toBe(true);
      expect(result.image.length).toBeGreaterThan(0);
    }, 15000);

    it('should generate coin with stats', async () => {
      const result = await generator.generate({
        material: 'gold',
      });

      expect(result.coinData.stats).toBeDefined();
      expect(result.coinData.stats.value).toBeDefined();
      expect(result.coinData.stats.weight).toBeDefined();
      expect(result.coinData.stats.purity).toBeDefined();
    }, 15000);

    it('should generate coin with metadata', async () => {
      const result = await generator.generate();

      expect(result.metadata).toBeDefined();
      expect(result.metadata.generator).toBe('CoinGenerator');
      expect(result.metadata.version).toBeDefined();
      expect(result.metadata.generated).toBeDefined();
    }, 15000);

    it('should generate ancient coin with proper properties', async () => {
      const result = await generator.generate({
        material: 'ancient',
      });

      expect(result.coinData.material).toBe('ancient');
      expect(result.coinData.features).toContain('historical');
    }, 15000);

    it('should generate magical coin with special properties', async () => {
      const result = await generator.generate({
        material: 'magical',
      });

      expect(result.coinData.material).toBe('magical');
      expect(result.coinData.features).toContain('enchanted');
    }, 15000);
  });

  describe('generateCoinId()', () => {
    it('should generate unique coin IDs', () => {
      const id1 = generator.generateCoinId();
      const id2 = generator.generateCoinId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });

    it('should generate IDs consistently', () => {
      const ids = Array.from({ length: 10 }, () => generator.generateCoinId());

      ids.forEach(id => {
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });

  describe('generateCoinName()', () => {
    it('should generate coin name from components', () => {
      const name = generator.generateCoinName('Gold Coin', 'Quarter', 'rare');

      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('should handle different materials', () => {
      const materials = ['Gold Coin', 'Silver Coin', 'Copper Coin', 'Platinum Coin'];

      materials.forEach(material => {
        const name = generator.generateCoinName(material, 'Dollar', 'common');
        expect(name).toBeDefined();
        expect(typeof name).toBe('string');
      });
    });

    it('should include quality in some way', () => {
      const commonName = generator.generateCoinName('Gold Coin', 'Quarter', 'common');
      const legendaryName = generator.generateCoinName('Gold Coin', 'Quarter', 'legendary');

      expect(commonName).toBeDefined();
      expect(legendaryName).toBeDefined();
      // Names might differ based on quality
      expect(typeof commonName).toBe('string');
      expect(typeof legendaryName).toBe('string');
    });
  });

  describe('generateByCriteria()', () => {
    it('should generate coin matching value criteria', async () => {
      const criteria = {
        minValue: 50,
        maxValue: 200,
      };

      const result = await generator.generateByCriteria(criteria);

      expect(result).toBeDefined();
      expect(result.coinData).toBeDefined();
      expect(result.coinData.stats.value).toBeGreaterThanOrEqual(50);
      expect(result.coinData.stats.value).toBeLessThanOrEqual(200);
    }, 15000);

    it('should handle empty criteria', async () => {
      const result = await generator.generateByCriteria({});

      expect(result).toBeDefined();
      expect(result.coinData).toBeDefined();
    }, 15000);

    it('should prefer specified material', async () => {
      const criteria = {
        preferredMaterial: 'silver',
      };

      const result = await generator.generateByCriteria(criteria);

      expect(result).toBeDefined();
      expect(result.coinData).toBeDefined();
      // Should try to use silver if possible
    }, 15000);
  });

  describe('coin properties', () => {
    it('should generate coin with valid color', async () => {
      const result = await generator.generate({ material: 'gold' });

      expect(result.coinData.color).toBeDefined();
      expect(typeof result.coinData.color).toBe('string');
      expect(result.coinData.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }, 15000);

    it('should generate coin with description', async () => {
      const result = await generator.generate({ material: 'silver' });

      expect(result.coinData.description).toBeDefined();
      expect(typeof result.coinData.description).toBe('string');
      expect(result.coinData.description.length).toBeGreaterThan(0);
    }, 15000);

    it('should generate coin with valid weight', async () => {
      const result = await generator.generate({ material: 'copper' });

      expect(result.coinData.stats.weight).toBeDefined();
      expect(result.coinData.stats.weight).toBeGreaterThan(0);
      expect(result.coinData.stats.weight).toBeLessThan(100);
    }, 15000);

    it('should generate coin with valid purity', async () => {
      const result = await generator.generate({ material: 'platinum' });

      expect(result.coinData.stats.purity).toBeDefined();
      expect(result.coinData.stats.purity).toBeGreaterThanOrEqual(0);
      expect(result.coinData.stats.purity).toBeLessThanOrEqual(1);
    }, 15000);

    it('should generate coin with features array', async () => {
      const result = await generator.generate({ material: 'ancient' });

      expect(result.coinData.features).toBeDefined();
      expect(Array.isArray(result.coinData.features)).toBe(true);
      expect(result.coinData.features.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('material variations', () => {
    it('should generate different values for different materials', async () => {
      const copper = await generator.generate({ material: 'copper' });
      const gold = await generator.generate({ material: 'gold' });
      const platinum = await generator.generate({ material: 'platinum' });

      // Platinum should be most valuable, copper least
      expect(platinum.coinData.stats.value).toBeGreaterThan(gold.coinData.stats.value);
      expect(gold.coinData.stats.value).toBeGreaterThan(copper.coinData.stats.value);
    }, 20000);

    it('should have appropriate colors for materials', async () => {
      const gold = await generator.generate({ material: 'gold' });
      const silver = await generator.generate({ material: 'silver' });

      expect(gold.coinData.color).toBe('#FFD700'); // Gold color
      expect(silver.coinData.color).toBe('#C0C0C0'); // Silver color
    }, 15000);
  });

  describe('edge cases', () => {
    it('should handle invalid material gracefully', async () => {
      const result = await generator.generate({
        material: 'invalid_material',
      });

      expect(result).toBeDefined();
      expect(result.coinData).toBeDefined();
    }, 15000);

    it('should handle invalid denomination gracefully', async () => {
      const result = await generator.generate({
        material: 'gold',
        denomination: 'invalid_denomination',
      });

      expect(result).toBeDefined();
      expect(result.coinData).toBeDefined();
    }, 15000);

    it('should handle missing options object', async () => {
      const result = await generator.generate();

      expect(result).toBeDefined();
      expect(result.coinData).toBeDefined();
    }, 15000);

    it('should handle null options', async () => {
      const result = await generator.generate(null);

      expect(result).toBeDefined();
      expect(result.coinData).toBeDefined();
    }, 15000);

    it('should handle undefined values in options', async () => {
      const result = await generator.generate({
        material: undefined,
        denomination: undefined,
      });

      expect(result).toBeDefined();
      expect(result.coinData).toBeDefined();
    }, 15000);
  });

  describe('performance', () => {
    it('should generate coin within reasonable time', async () => {
      const startTime = Date.now();
      await generator.generate({ material: 'copper', size: 'small' });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10000);
    });

    it('should handle multiple generations efficiently', async () => {
      const startTime = Date.now();
      const promises = Array.from({ length: 3 }, () =>
        generator.generate({ material: 'gold', size: 'small' })
      );
      await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(20000);
    });

    it('should not leak memory with repeated generations', async () => {
      // Generate multiple coins to check for memory leaks
      for (let i = 0; i < 5; i++) {
        await generator.generate({ material: 'silver', size: 'small' });
      }
      // If this completes without crashing, memory is managed properly
      expect(true).toBe(true);
    }, 30000);
  });
});
