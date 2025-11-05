/**
 * Jest Setup File
 * Runs before each test suite
 */

// Extend timeout for tests that generate assets
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests (optional)
// Uncomment if you want to suppress console output during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Mock canvas for visual generators
jest.mock('canvas', () => {
  const actualCanvas = jest.requireActual('canvas');
  return {
    ...actualCanvas,
    createCanvas: jest.fn((width, height) => {
      if (!actualCanvas || !actualCanvas.createCanvas) {
        // Return a mock canvas if the actual module is not available
        return {
          width,
          height,
          getContext: jest.fn(() => ({
            fillRect: jest.fn(),
            clearRect: jest.fn(),
            getImageData: jest.fn(),
            putImageData: jest.fn(),
            createImageData: jest.fn(),
            setTransform: jest.fn(),
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            closePath: jest.fn(),
            stroke: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            measureText: jest.fn(() => ({ width: 0 })),
            fillText: jest.fn(),
            strokeText: jest.fn(),
          })),
          toBuffer: jest.fn(() => Buffer.from([])),
          toDataURL: jest.fn(() => 'data:image/png;base64,'),
        };
      }
      return actualCanvas.createCanvas(width, height);
    }),
  };
}, { virtual: true });

// Mock better-sqlite3 for database tests
jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    prepare: jest.fn(() => ({
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn(() => []),
    })),
    exec: jest.fn(),
    close: jest.fn(),
    pragma: jest.fn(),
  }));
}, { virtual: true });

// Mock sharp for image processing
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from([])),
    toFile: jest.fn().mockResolvedValue({}),
    png: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
  }));
}, { virtual: true });

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.TEST_MODE = 'true';

// Global test utilities
global.testUtils = {
  /**
   * Create a temporary test directory
   */
  createTempDir: () => {
    const fs = require('fs-extra');
    const path = require('path');
    const tempDir = path.join(__dirname, 'test-temp', Date.now().toString());
    fs.ensureDirSync(tempDir);
    return tempDir;
  },

  /**
   * Clean up temporary test directory
   */
  cleanupTempDir: (dir) => {
    const fs = require('fs-extra');
    if (fs.existsSync(dir)) {
      fs.removeSync(dir);
    }
  },

  /**
   * Wait for a specified amount of time
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate random test data
   */
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  randomFloat: (min, max) => Math.random() * (max - min) + min,
  randomColor: () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
};

// Clean up after all tests
afterAll(() => {
  // Clean up any test-temp directories
  const fs = require('fs-extra');
  const path = require('path');
  const tempBase = path.join(__dirname, 'test-temp');
  if (fs.existsSync(tempBase)) {
    fs.removeSync(tempBase);
  }
});
