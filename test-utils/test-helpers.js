/**
 * Test Helpers and Utilities
 * Shared utilities for all test suites
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * File system helpers
 */
class FileHelpers {
  /**
   * Create a temporary test directory
   * @returns {string} Path to the temporary directory
   */
  static createTempDir() {
    const tempDir = path.join(__dirname, '..', 'test-temp', `test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    fs.ensureDirSync(tempDir);
    return tempDir;
  }

  /**
   * Clean up a temporary directory
   * @param {string} dir - Directory to clean up
   */
  static async cleanupTempDir(dir) {
    if (fs.existsSync(dir)) {
      await fs.remove(dir);
    }
  }

  /**
   * Create a temporary file with content
   * @param {string} filename - Name of the file
   * @param {string|Buffer} content - File content
   * @param {string} [dir] - Optional directory (creates temp dir if not provided)
   * @returns {Promise<string>} Path to the created file
   */
  static async createTempFile(filename, content, dir = null) {
    const tempDir = dir || this.createTempDir();
    const filePath = path.join(tempDir, filename);
    await fs.writeFile(filePath, content);
    return filePath;
  }

  /**
   * Check if a file exists and has expected size
   * @param {string} filePath - Path to file
   * @param {number} [minSize] - Minimum expected size in bytes
   * @returns {boolean}
   */
  static fileExistsWithSize(filePath, minSize = 0) {
    if (!fs.existsSync(filePath)) return false;
    const stats = fs.statSync(filePath);
    return stats.size >= minSize;
  }
}

/**
 * Random data generators
 */
class RandomData {
  /**
   * Generate random integer between min and max (inclusive)
   */
  static int(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random float between min and max
   */
  static float(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate random hex color
   */
  static color() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  }

  /**
   * Generate random RGB color object
   */
  static rgbColor() {
    return {
      r: this.int(0, 255),
      g: this.int(0, 255),
      b: this.int(0, 255),
    };
  }

  /**
   * Generate random string of specified length
   */
  static string(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Pick random element from array
   */
  static arrayElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate random boolean
   */
  static boolean() {
    return Math.random() < 0.5;
  }
}

/**
 * Async testing helpers
 */
class AsyncHelpers {
  /**
   * Wait for specified milliseconds
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  static wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for condition to be true
   * @param {Function} condition - Function that returns boolean
   * @param {number} [timeout] - Timeout in milliseconds (default 5000)
   * @param {number} [interval] - Check interval in milliseconds (default 100)
   * @returns {Promise<void>}
   */
  static async waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.wait(interval);
    }
    throw new Error('Timeout waiting for condition');
  }

  /**
   * Retry async function until it succeeds or max retries reached
   * @param {Function} fn - Async function to retry
   * @param {number} [maxRetries] - Maximum number of retries
   * @param {number} [delay] - Delay between retries in ms
   * @returns {Promise<any>}
   */
  static async retry(fn, maxRetries = 3, delay = 100) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await this.wait(delay);
        }
      }
    }
    throw lastError;
  }
}

/**
 * Mock data factories
 */
class MockData {
  /**
   * Create mock asset configuration
   */
  static assetConfig(overrides = {}) {
    return {
      width: 64,
      height: 64,
      primaryColor: '#FF0000',
      secondaryColor: '#0000FF',
      style: 'default',
      seed: Math.random(),
      ...overrides,
    };
  }

  /**
   * Create mock generator configuration
   */
  static generatorConfig(overrides = {}) {
    return {
      width: 64,
      height: 64,
      scale: 1,
      quality: 'high',
      format: 'png',
      ...overrides,
    };
  }

  /**
   * Create mock audio configuration
   */
  static audioConfig(overrides = {}) {
    return {
      duration: 1.0,
      sampleRate: 44100,
      format: 'wav',
      volume: 1.0,
      ...overrides,
    };
  }

  /**
   * Create mock database record
   */
  static dbRecord(overrides = {}) {
    return {
      id: RandomData.int(1, 10000),
      name: `test-asset-${RandomData.string(8)}`,
      type: RandomData.arrayElement(['sprite', 'audio', 'particle']),
      created_at: Date.now(),
      updated_at: Date.now(),
      metadata: '{}',
      ...overrides,
    };
  }
}

/**
 * Assertion helpers
 */
class AssertionHelpers {
  /**
   * Assert that value is within range
   */
  static assertInRange(value, min, max, message = '') {
    if (value < min || value > max) {
      throw new Error(message || `Expected ${value} to be between ${min} and ${max}`);
    }
  }

  /**
   * Assert that array contains element
   */
  static assertContains(array, element, message = '') {
    if (!array.includes(element)) {
      throw new Error(message || `Expected array to contain ${element}`);
    }
  }

  /**
   * Assert that object has properties
   */
  static assertHasProperties(obj, properties, message = '') {
    const missing = properties.filter(prop => !(prop in obj));
    if (missing.length > 0) {
      throw new Error(message || `Expected object to have properties: ${missing.join(', ')}`);
    }
  }

  /**
   * Assert that value is valid color
   */
  static assertValidColor(color, message = '') {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(color)) {
      throw new Error(message || `Expected ${color} to be a valid hex color`);
    }
  }

  /**
   * Assert that buffer is valid
   */
  static assertValidBuffer(buffer, minSize = 0, message = '') {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error(message || 'Expected value to be a Buffer');
    }
    if (buffer.length < minSize) {
      throw new Error(message || `Expected buffer size to be at least ${minSize}, got ${buffer.length}`);
    }
  }
}

/**
 * Performance measurement helpers
 */
class PerformanceHelpers {
  /**
   * Measure execution time of a function
   * @param {Function} fn - Function to measure
   * @returns {Promise<{result: any, duration: number}>}
   */
  static async measureTime(fn) {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }

  /**
   * Assert that function executes within time limit
   * @param {Function} fn - Function to test
   * @param {number} maxDuration - Maximum duration in milliseconds
   * @returns {Promise<any>}
   */
  static async assertExecutionTime(fn, maxDuration) {
    const { result, duration } = await this.measureTime(fn);
    if (duration > maxDuration) {
      throw new Error(`Expected execution time to be less than ${maxDuration}ms, but was ${duration}ms`);
    }
    return result;
  }

  /**
   * Measure memory usage of a function
   * @param {Function} fn - Function to measure
   * @returns {Promise<{result: any, memoryDelta: number}>}
   */
  static async measureMemory(fn) {
    if (global.gc) global.gc();
    const before = process.memoryUsage().heapUsed;
    const result = await fn();
    if (global.gc) global.gc();
    const after = process.memoryUsage().heapUsed;
    const memoryDelta = after - before;
    return { result, memoryDelta };
  }
}

module.exports = {
  FileHelpers,
  RandomData,
  AsyncHelpers,
  MockData,
  AssertionHelpers,
  PerformanceHelpers,
};
