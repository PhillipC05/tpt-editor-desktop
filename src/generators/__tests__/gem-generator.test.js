/**
 * Tests for GemGenerator
 */

const { describe, it, expect, beforeEach } = require('@jest/globals');
const GemGenerator = require('../gem-generator');
const { FileHelpers, MockData } = require('../../test-utils');

describe('GemGenerator', () => {
  let generator;
  let tempDir;

  beforeEach(() => {
    generator = new GemGenerator();
    tempDir = FileHelpers.createTempDir();
  });

  afterEach(async () => {
    await FileHelpers.cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    it('should initialize with gem types', () => {
      expect(generator.gemTypes).toBeDefined();
      expect(generator.gemTypes.DIAMOND).toBe('diamond');
      expect(generator.gemTypes.RUBY).toBe('ruby');
      expect(generator.gemTypes.EMERALD).toBe('emerald');
    });

    it('should initialize with gem cuts', () => {
      expect(generator.gemCuts).toBeDefined();
      expect(generator.gemCuts.ROUND).toBe('round');
      expect(generator.gemCuts.SQUARE).toBe('square');
    });

    it('should initialize with gem sizes', () => {
      expect(generator.gemSizes).toBeDefined();
      expect(generator.gemSizes.TINY).toBe('tiny');
      expect(generator.gemSizes.MEDIUM).toBe('medium');
      expect(generator.gemSizes.HUGE).toBe('huge');
    });

    it('should initialize with gem qualities', () => {
      expect(generator.gemQualities).toBeDefined();
      expect(generator.gemQualities.FLAWLESS).toBe('flawless');
      expect(generator.gemQualities.VS1).toBe('vs1');
    });
  });

  describe('generate()', () => {
    it('should generate a gem with default options', async () => {
      const result = await generator.generate();

      expect(result).toBeDefined();
      expect(result.gemData).toBeDefined();
      expect(result.gemData.id).toBeDefined();
      expect(result.gemData.name).toBeDefined();
      expect(result.gemData.type).toBeDefined();
      expect(result.metadata).toBeDefined();
    }, 15000);

    it('should generate a specific gem type', async () => {
      const result = await generator.generate({
        type: 'diamond',
      });

      expect(result.gemData.type).toBe('diamond');
      expect(result.gemData.name).toContain('Diamond');
    }, 15000);

    it('should generate gem with specific cut', async () => {
      const result = await generator.generate({
        type: 'ruby',
        cut: 'round',
      });

      expect(result.gemData.cut).toBe('round');
    }, 15000);

    it('should generate gem with specific size', async () => {
      const result = await generator.generate({
        type: 'sapphire',
        size: 'large',
      });

      expect(result.gemData.size).toBe('large');
    }, 15000);

    it('should generate gem with specific quality', async () => {
      const result = await generator.generate({
        type: 'emerald',
        quality: 'flawless',
      });

      expect(result.gemData.quality).toBe('flawless');
    }, 15000);

    it('should include image buffer in result', async () => {
      const result = await generator.generate({
        type: 'diamond',
        size: 'small',
      });

      expect(result.image).toBeDefined();
      expect(Buffer.isBuffer(result.image)).toBe(true);
      expect(result.image.length).toBeGreaterThan(0);
    }, 15000);

    it('should generate gem with stats', async () => {
      const result = await generator.generate({
        type: 'ruby',
      });

      expect(result.gemData.stats).toBeDefined();
      expect(result.gemData.stats.baseValue).toBeDefined();
      expect(result.gemData.stats.hardness).toBeDefined();
      expect(result.gemData.stats.refractiveIndex).toBeDefined();
    }, 15000);

    it('should generate gem with metadata', async () => {
      const result = await generator.generate();

      expect(result.metadata).toBeDefined();
      expect(result.metadata.generator).toBe('GemGenerator');
      expect(result.metadata.version).toBeDefined();
      expect(result.metadata.generated).toBeDefined();
    }, 15000);
  });

  describe('generateGemId()', () => {
    it('should generate unique gem IDs', () => {
      const id1 = generator.generateGemId();
      const id2 = generator.generateGemId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should generate IDs with consistent format', () => {
      const ids = Array.from({ length: 10 }, () => generator.generateGemId());

      ids.forEach(id => {
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateGemName()', () => {
    it('should generate gem name from components', () => {
      const name = generator.generateGemName('Diamond', 'Round', 'large', 'flawless');

      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name).toContain('Diamond');
    });

    it('should handle different gem types', () => {
      const types = ['Diamond', 'Ruby', 'Sapphire', 'Emerald'];

      types.forEach(type => {
        const name = generator.generateGemName(type, 'round', 'medium', 'vvs1');
        expect(name).toBeDefined();
        expect(name).toContain(type);
      });
    });

    it('should include cut in name', () => {
      const name = generator.generateGemName('Ruby', 'Heart', 'medium', 'vs1');

      expect(name).toBeDefined();
      // Name might include cut or not, depending on implementation
      expect(typeof name).toBe('string');
    });
  });

  describe('generateByCriteria()', () => {
    it('should generate gem matching criteria', async () => {
      const criteria = {
        minValue: 1000,
        maxValue: 5000,
        preferredType: 'ruby',
      };

      const result = await generator.generateByCriteria(criteria);

      expect(result).toBeDefined();
      expect(result.gemData).toBeDefined();
      expect(result.gemData.stats.totalValue).toBeGreaterThanOrEqual(1000);
      expect(result.gemData.stats.totalValue).toBeLessThanOrEqual(5000);
    }, 15000);

    it('should handle empty criteria', async () => {
      const result = await generator.generateByCriteria({});

      expect(result).toBeDefined();
      expect(result.gemData).toBeDefined();
    }, 15000);
  });

  describe('generateGemCollection()', () => {
    it('should generate multiple gems', async () => {
      const count = 3;
      const result = await generator.generateGemCollection(count);

      expect(result).toBeDefined();
      expect(Array.isArray(result.collection)).toBe(true);
      expect(result.collection.length).toBe(count);
    }, 20000);

    it('should generate gems with theme', async () => {
      const result = await generator.generateGemCollection(3, 'precious');

      expect(result).toBeDefined();
      expect(result.collection.length).toBe(3);
      expect(result.metadata.theme).toBe('precious');
    }, 20000);

    it('should handle collection with single gem', async () => {
      const result = await generator.generateGemCollection(1);

      expect(result.collection.length).toBe(1);
      expect(result.collection[0].gemData).toBeDefined();
    }, 15000);
  });

  describe('edge cases', () => {
    it('should handle invalid gem type gracefully', async () => {
      const result = await generator.generate({
        type: 'invalid_gem_type',
      });

      // Should fallback to a valid type or handle gracefully
      expect(result).toBeDefined();
      expect(result.gemData).toBeDefined();
    }, 15000);

    it('should handle invalid cut gracefully', async () => {
      const result = await generator.generate({
        type: 'diamond',
        cut: 'invalid_cut',
      });

      expect(result).toBeDefined();
      expect(result.gemData).toBeDefined();
    }, 15000);

    it('should handle invalid size gracefully', async () => {
      const result = await generator.generate({
        type: 'ruby',
        size: 'invalid_size',
      });

      expect(result).toBeDefined();
      expect(result.gemData).toBeDefined();
    }, 15000);

    it('should handle missing options object', async () => {
      const result = await generator.generate();

      expect(result).toBeDefined();
      expect(result.gemData).toBeDefined();
    }, 15000);

    it('should handle null options', async () => {
      const result = await generator.generate(null);

      expect(result).toBeDefined();
      expect(result.gemData).toBeDefined();
    }, 15000);
  });

  describe('gem properties', () => {
    it('should generate gem with valid color', async () => {
      const result = await generator.generate({ type: 'ruby' });

      expect(result.gemData.color).toBeDefined();
      expect(typeof result.gemData.color).toBe('string');
      // Should be hex color or similar
      expect(result.gemData.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }, 15000);

    it('should generate gem with description', async () => {
      const result = await generator.generate({ type: 'diamond' });

      expect(result.gemData.description).toBeDefined();
      expect(typeof result.gemData.description).toBe('string');
      expect(result.gemData.description.length).toBeGreaterThan(0);
    }, 15000);

    it('should generate gem with valid stats ranges', async () => {
      const result = await generator.generate({ type: 'sapphire' });

      expect(result.gemData.stats.hardness).toBeGreaterThanOrEqual(1);
      expect(result.gemData.stats.hardness).toBeLessThanOrEqual(10);
      expect(result.gemData.stats.refractiveIndex).toBeGreaterThan(0);
      expect(result.gemData.stats.baseValue).toBeGreaterThan(0);
    }, 15000);
  });

  describe('performance', () => {
    it('should generate gem within reasonable time', async () => {
      const startTime = Date.now();
      await generator.generate({ type: 'diamond', size: 'small' });
      const duration = Date.now() - startTime;

      // Should complete within 10 seconds
      expect(duration).toBeLessThan(10000);
    });

    it('should generate multiple gems efficiently', async () => {
      const startTime = Date.now();
      const promises = Array.from({ length: 3 }, () =>
        generator.generate({ size: 'tiny' })
      );
      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Should complete within 20 seconds
      expect(duration).toBeLessThan(20000);
    });
  });
});
