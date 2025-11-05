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

// Mock jimp for generator tests
jest.mock('jimp', () => {
  const mockImage = {
    bitmap: {
      width: 64,
      height: 64,
      data: Buffer.alloc(64 * 64 * 4),
    },
    getPixelColor: jest.fn(() => 0xFFFFFFFF),
    setPixelColor: jest.fn(),
    getBufferAsync: jest.fn(async () => Buffer.from([])),
    getBase64Async: jest.fn(async () => 'data:image/png;base64,'),
    write: jest.fn(async () => {}),
    writeAsync: jest.fn(async () => {}),
    clone: jest.fn(function() { return this; }),
    crop: jest.fn(function() { return this; }),
    resize: jest.fn(function() { return this; }),
    scale: jest.fn(function() { return this; }),
    rotate: jest.fn(function() { return this; }),
    flip: jest.fn(function() { return this; }),
    mirror: jest.fn(function() { return this; }),
    blur: jest.fn(function() { return this; }),
    contrast: jest.fn(function() { return this; }),
    brightness: jest.fn(function() { return this; }),
    greyscale: jest.fn(function() { return this; }),
    invert: jest.fn(function() { return this; }),
    normalize: jest.fn(function() { return this; }),
    fade: jest.fn(function() { return this; }),
    opacity: jest.fn(function() { return this; }),
    opaque: jest.fn(function() { return this; }),
    composite: jest.fn(function() { return this; }),
    blit: jest.fn(function() { return this; }),
    mask: jest.fn(function() { return this; }),
    contain: jest.fn(function() { return this; }),
    cover: jest.fn(function() { return this; }),
    print: jest.fn(function() { return this; }),
    scan: jest.fn(function(x, y, w, h, cb) {
      for (let y2 = 0; y2 < h; y2++) {
        for (let x2 = 0; x2 < w; x2++) {
          cb(x + x2, y + y2, x2 + y2 * w);
        }
      }
      return this;
    }),
    color: jest.fn(function() { return this; }),
  };

  const createMockImage = (width = 64, height = 64) => ({
    ...mockImage,
    bitmap: {
      width,
      height,
      data: Buffer.alloc(width * height * 4),
    },
  });

  const Jimp = function(width, height, color) {
    // Handle both new Jimp() and Jimp() calls
    if (typeof width === 'string') {
      // Reading from file/url - return promise
      return Promise.resolve(createMockImage());
    }
    // Creating new image - return the image directly for new Jimp()
    return createMockImage(width || 64, height || 64);
  };

  // Make it work with async/await
  Jimp.prototype.then = function(resolve) {
    return resolve(this);
  };

  // Static methods
  Jimp.read = jest.fn(async () => createMockImage());
  Jimp.create = jest.fn(async (width, height, color) => createMockImage(width || 64, height || 64));
  Jimp.AUTO = -1;
  Jimp.MIME_PNG = 'image/png';
  Jimp.MIME_JPEG = 'image/jpeg';
  Jimp.FONT_SANS_8_BLACK = 'FONT_SANS_8_BLACK';
  Jimp.FONT_SANS_16_BLACK = 'FONT_SANS_16_BLACK';

  // Colors
  Jimp.rgbaToInt = jest.fn((r, g, b, a) =>
    ((r << 24) | (g << 16) | (b << 8) | a) >>> 0
  );
  Jimp.intToRGBA = jest.fn((int) => ({
    r: (int >>> 24) & 0xFF,
    g: (int >>> 16) & 0xFF,
    b: (int >>> 8) & 0xFF,
    a: int & 0xFF,
  }));

  Jimp.cssColorToHex = jest.fn((color) => color.replace('#', '0x'));

  return Jimp;
}, { virtual: true });

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
