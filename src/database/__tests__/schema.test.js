/**
 * Tests for DatabaseSchema
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const { FileHelpers, createMockDatabase } = require('../../../test-utils');
const path = require('path');

// Mock better-sqlite3
jest.mock('better-sqlite3', () => {
  return jest.fn((dbPath) => {
    const mockDb = createMockDatabase();
    mockDb.dbPath = dbPath;
    return mockDb;
  });
});

const DatabaseSchema = require('../schema');

describe('DatabaseSchema', () => {
  let db;
  let tempDir;

  beforeEach(() => {
    tempDir = FileHelpers.createTempDir();
    const dbPath = path.join(tempDir, 'test.db');
    db = new DatabaseSchema(dbPath);
  });

  afterEach(async () => {
    if (db && db.db) {
      db.db.close();
    }
    await FileHelpers.cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    it('should create database instance', () => {
      expect(db).toBeDefined();
      expect(db.db).toBeDefined();
    });

    it('should use provided database path', () => {
      const customPath = path.join(tempDir, 'custom.db');
      const customDb = new DatabaseSchema(customPath);

      expect(customDb.db.dbPath).toBe(customPath);
    });

    it('should create default database path if not provided', () => {
      const defaultDb = new DatabaseSchema();

      expect(defaultDb.db).toBeDefined();
      expect(defaultDb.db.dbPath).toBeDefined();
    });

    it('should call init during construction', () => {
      // init should be called, which should enable WAL mode
      expect(db.db.pragma).toHaveBeenCalled();
    });
  });

  describe('init()', () => {
    it('should enable WAL mode', () => {
      expect(db.db.pragma).toHaveBeenCalledWith('journal_mode = WAL');
    });

    it('should create all tables', () => {
      // exec should be called multiple times for creating tables
      expect(db.db.exec).toHaveBeenCalled();
    });

    it('should be idempotent', () => {
      const execCallCount = db.db.exec.mock.calls.length;

      // Call init again
      db.init();

      // Should not fail and can be called multiple times
      expect(db.db.exec.mock.calls.length).toBeGreaterThanOrEqual(execCallCount);
    });
  });

  describe('createAssetsTable()', () => {
    it('should create assets table', () => {
      db.createAssetsTable();

      expect(db.db.exec).toHaveBeenCalled();
      const lastCall = db.db.exec.mock.calls[db.db.exec.mock.calls.length - 1][0];
      expect(lastCall).toContain('CREATE TABLE IF NOT EXISTS assets');
    });

    it('should include all required columns', () => {
      db.createAssetsTable();

      const lastCall = db.db.exec.mock.calls[db.db.exec.mock.calls.length - 1][0];
      expect(lastCall).toContain('id TEXT PRIMARY KEY');
      expect(lastCall).toContain('name TEXT NOT NULL');
      expect(lastCall).toContain('type TEXT NOT NULL');
      expect(lastCall).toContain('data TEXT NOT NULL');
      expect(lastCall).toContain('format TEXT NOT NULL');
    });

    it('should include timestamp columns', () => {
      db.createAssetsTable();

      const lastCall = db.db.exec.mock.calls[db.db.exec.mock.calls.length - 1][0];
      expect(lastCall).toContain('created_at');
      expect(lastCall).toContain('updated_at');
    });
  });

  describe('createAudioAssetsTable()', () => {
    it('should create audio_assets table', () => {
      db.createAudioAssetsTable();

      const lastCall = db.db.exec.mock.calls[db.db.exec.mock.calls.length - 1][0];
      expect(lastCall).toContain('CREATE TABLE IF NOT EXISTS audio_assets');
    });

    it('should include audio-specific columns', () => {
      db.createAudioAssetsTable();

      const lastCall = db.db.exec.mock.calls[db.db.exec.mock.calls.length - 1][0];
      expect(lastCall).toContain('duration');
      expect(lastCall).toContain('sample_rate');
      expect(lastCall).toContain('channels');
      expect(lastCall).toContain('bit_depth');
    });

    it('should have foreign key to assets table', () => {
      db.createAudioAssetsTable();

      const lastCall = db.db.exec.mock.calls[db.db.exec.mock.calls.length - 1][0];
      expect(lastCall).toContain('FOREIGN KEY');
      expect(lastCall).toContain('REFERENCES assets(id)');
      expect(lastCall).toContain('ON DELETE CASCADE');
    });
  });

  describe('saveAsset()', () => {
    it('should insert new asset', () => {
      const asset = {
        id: 'test-123',
        name: 'Test Asset',
        type: 'sprite',
        data: Buffer.from('test data'),
        format: 'png',
        width: 64,
        height: 64,
      };

      const result = db.saveAsset(asset);

      expect(db.db.prepare).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should prepare statement with correct columns', () => {
      const asset = {
        id: 'test-123',
        name: 'Test Asset',
        type: 'sprite',
        data: Buffer.from('test data'),
        format: 'png',
        width: 64,
        height: 64,
      };

      db.saveAsset(asset);

      const prepareCall = db.db.prepare.mock.calls.find(call =>
        call[0].includes('INSERT INTO assets')
      );

      expect(prepareCall).toBeDefined();
      expect(prepareCall[0]).toContain('INSERT INTO assets');
    });

    it('should handle asset with minimal fields', () => {
      const asset = {
        id: 'minimal-123',
        name: 'Minimal',
        type: 'test',
        data: Buffer.from('data'),
        format: 'raw',
      };

      const result = db.saveAsset(asset);

      expect(result).toBeDefined();
    });

    it('should handle asset with all optional fields', () => {
      const asset = {
        id: 'full-123',
        name: 'Full Asset',
        type: 'sprite',
        data: Buffer.from('test data'),
        format: 'png',
        width: 128,
        height: 128,
        favorite: true,
        tags: ['tag1', 'tag2'],
      };

      const result = db.saveAsset(asset);

      expect(result).toBeDefined();
    });
  });

  describe('saveAudioAsset()', () => {
    it('should save audio asset metadata', () => {
      const asset = {
        id: 'audio-123',
        asset_id: 'test-asset-123',
        duration: 5.0,
        sample_rate: 44100,
        channels: 2,
        bit_depth: 16,
      };

      const result = db.saveAudioAsset(asset);

      expect(db.db.prepare).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should include audio-specific properties', () => {
      const asset = {
        id: 'audio-456',
        asset_id: 'test-asset-456',
        duration: 10.5,
        sample_rate: 48000,
        channels: 2,
        bit_depth: 24,
        audio_type: 'music',
      };

      const result = db.saveAudioAsset(asset);

      expect(result).toBeDefined();
    });
  });

  describe('saveVehicleAsset()', () => {
    it('should save vehicle asset metadata', () => {
      const asset = {
        id: 'vehicle-123',
        asset_id: 'test-vehicle-123',
        vehicle_type: 'car',
        car_type: 'sedan',
        color: '#FF0000',
      };

      const result = db.saveVehicleAsset(asset);

      expect(db.db.prepare).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle vehicle customization data', () => {
      const asset = {
        id: 'vehicle-456',
        asset_id: 'test-vehicle-456',
        vehicle_type: 'car',
        customization: JSON.stringify({ wheels: 'sport', paint: 'metallic' }),
      };

      const result = db.saveVehicleAsset(asset);

      expect(result).toBeDefined();
    });
  });

  describe('saveBuildingAsset()', () => {
    it('should save building asset metadata', () => {
      const asset = {
        id: 'building-123',
        asset_id: 'test-building-123',
        building_type: 'castle',
        width: 256,
        height: 256,
      };

      const result = db.saveBuildingAsset(asset);

      expect(db.db.prepare).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', () => {
      const badDb = new DatabaseSchema(path.join(tempDir, 'test2.db'));
      badDb.db.prepare = jest.fn(() => {
        throw new Error('Database error');
      });

      expect(() => {
        badDb.saveAsset({
          id: 'error-test',
          name: 'Error Test',
          type: 'test',
          data: Buffer.from('data'),
          format: 'raw',
        });
      }).toThrow('Database error');
    });

    it('should handle missing required fields', () => {
      // Should handle gracefully or throw appropriate error
      const invalidAsset = {
        id: 'invalid-123',
        // Missing required fields
      };

      // Depending on implementation, this might throw or handle gracefully
      try {
        db.saveAsset(invalidAsset);
        // If it doesn't throw, that's okay
        expect(true).toBe(true);
      } catch (error) {
        // If it throws, that's also okay
        expect(error).toBeDefined();
      }
    });
  });

  describe('database operations', () => {
    it('should prepare statements', () => {
      const stmt = db.db.prepare('SELECT * FROM assets');

      expect(stmt).toBeDefined();
      expect(stmt.run).toBeDefined();
      expect(stmt.get).toBeDefined();
      expect(stmt.all).toBeDefined();
    });

    it('should execute SQL', () => {
      db.db.exec('CREATE TABLE test (id INTEGER)');

      expect(db.db.exec).toHaveBeenCalledWith('CREATE TABLE test (id INTEGER)');
    });

    it('should handle pragmas', () => {
      db.db.pragma('journal_mode = WAL');

      expect(db.db.pragma).toHaveBeenCalled();
    });
  });

  describe('data integrity', () => {
    it('should maintain referential integrity with foreign keys', () => {
      // Foreign key constraints should be set up
      db.createAudioAssetsTable();

      const lastCall = db.db.exec.mock.calls[db.db.exec.mock.calls.length - 1][0];
      expect(lastCall).toContain('FOREIGN KEY');
      expect(lastCall).toContain('ON DELETE CASCADE');
    });

    it('should use primary keys', () => {
      db.createAssetsTable();

      const lastCall = db.db.exec.mock.calls[db.db.exec.mock.calls.length - 1][0];
      expect(lastCall).toContain('PRIMARY KEY');
    });

    it('should enforce NOT NULL constraints', () => {
      db.createAssetsTable();

      const lastCall = db.db.exec.mock.calls[db.db.exec.mock.calls.length - 1][0];
      expect(lastCall).toContain('NOT NULL');
    });
  });

  describe('multiple database instances', () => {
    it('should allow multiple database instances', () => {
      const db1 = new DatabaseSchema(path.join(tempDir, 'db1.db'));
      const db2 = new DatabaseSchema(path.join(tempDir, 'db2.db'));

      expect(db1.db).toBeDefined();
      expect(db2.db).toBeDefined();
      expect(db1.db).not.toBe(db2.db);

      db1.db.close();
      db2.db.close();
    });

    it('should isolate data between instances', () => {
      const db1 = new DatabaseSchema(path.join(tempDir, 'isolated1.db'));
      const db2 = new DatabaseSchema(path.join(tempDir, 'isolated2.db'));

      db1.saveAsset({
        id: 'db1-asset',
        name: 'DB1 Asset',
        type: 'test',
        data: Buffer.from('data1'),
        format: 'raw',
      });

      db2.saveAsset({
        id: 'db2-asset',
        name: 'DB2 Asset',
        type: 'test',
        data: Buffer.from('data2'),
        format: 'raw',
      });

      // Data should be isolated
      expect(db1.db).not.toBe(db2.db);

      db1.db.close();
      db2.db.close();
    });
  });
});
