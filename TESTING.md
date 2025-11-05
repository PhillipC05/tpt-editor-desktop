# Testing Guide

## Overview

The TPT Asset Editor Desktop project uses **Jest 29.7.0** as its primary test framework, providing comprehensive test coverage across error handling, generators, audio systems, and database operations.

## Test Statistics

- **Total Tests Written:** 280+
- **Currently Passing:** 107 tests (error handling system)
- **Test Suites:** 8 test files
- **Coverage Target:** 50% (branches, functions, lines, statements)

## Test Organization

```
src/
├── core/errors/__tests__/          # Error handling tests (83 tests) ✓
│   ├── base-error.test.js          # 25 tests - BaseError class
│   ├── validation-error.test.js    # 29 tests - ValidationError class
│   └── generation-error.test.js    # 29 tests - GenerationError class
├── generators/__tests__/           # Generator tests (120+ tests)
│   ├── gem-generator.test.js       # 30+ tests - Gem generation
│   ├── coin-generator.test.js      # 40+ tests - Coin generation
│   └── weapon-generator.test.js    # 50+ tests - Weapon generation
├── audio/__tests__/                # Audio system tests (40+ tests)
│   └── audio-manager.test.js       # AudioManager functionality
└── database/__tests__/             # Database tests (32 tests)
    └── schema.test.js              # DatabaseSchema operations

test-utils/                         # Shared test utilities
├── test-helpers.js                 # FileHelpers, RandomData, AsyncHelpers, etc.
├── mock-factory.js                 # Mock creators for Canvas, Database, Audio, etc.
└── index.js                        # Centralized exports
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run in watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test suite
npm run test:core          # Core error handling tests
npm run test:generators    # Generator tests
npm run test:audio         # Audio system tests

# Verbose output
npm run test:verbose

# Debug tests
npm run test:debug
```

### Advanced Usage

```bash
# Run tests matching a pattern
npx jest --testPathPattern="error"

# Run specific test file
npx jest src/core/errors/__tests__/base-error.test.js

# Update snapshots
npx jest --updateSnapshot

# Run tests in band (no parallel execution)
npx jest --runInBand

# Clear cache
npx jest --clearCache
```

## Test Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Branches | 50% | TBD |
| Functions | 50% | TBD |
| Lines | 50% | TBD |
| Statements | 50% | TBD |

### Generating Coverage Reports

```bash
# Generate full coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# View LCOV report
cat coverage/lcov.info
```

## Writing Tests

### Test Structure

```javascript
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const { FileHelpers, RandomData, createMockCanvas } = require('../../test-utils');
const MyGenerator = require('../my-generator');

describe('MyGenerator', () => {
  let generator;
  let tempDir;

  beforeEach(() => {
    generator = new MyGenerator();
    tempDir = FileHelpers.createTempDir();
  });

  afterEach(async () => {
    await FileHelpers.cleanupTempDir(tempDir);
  });

  describe('generate()', () => {
    it('should generate asset with default options', async () => {
      const result = await generator.generate();

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });
});
```

### Test Utilities Available

#### FileHelpers
```javascript
const { FileHelpers } = require('../../test-utils');

// Create temporary directory
const tempDir = FileHelpers.createTempDir();

// Clean up directory
await FileHelpers.cleanupTempDir(tempDir);

// Create temporary file
const filePath = await FileHelpers.createTempFile('test.txt', 'content');

// Check if file exists with minimum size
const exists = FileHelpers.fileExistsWithSize('/path/to/file', 100);
```

#### RandomData
```javascript
const { RandomData } = require('../../test-utils');

// Generate random values
const int = RandomData.int(0, 100);
const float = RandomData.float(0, 1);
const color = RandomData.color();
const rgbColor = RandomData.rgbColor();
const string = RandomData.string(10);
const element = RandomData.arrayElement(['a', 'b', 'c']);
const bool = RandomData.boolean();
```

#### MockData
```javascript
const { MockData } = require('../../test-utils');

// Create mock configurations
const assetConfig = MockData.assetConfig({ width: 128 });
const generatorConfig = MockData.generatorConfig({ quality: 'high' });
const audioConfig = MockData.audioConfig({ duration: 5.0 });
const dbRecord = MockData.dbRecord({ type: 'sprite' });
```

#### Mock Factories
```javascript
const { createMockCanvas, createMockDatabase, createMockAudioContext } = require('../../test-utils');

// Create mocks
const canvas = createMockCanvas(64, 64);
const db = createMockDatabase();
const audioContext = createMockAudioContext();
const audioBuffer = createMockAudioBuffer(2, 44100, 44100);
const fileSystem = createMockFileSystem();
```

### Best Practices

1. **Use descriptive test names**
   ```javascript
   it('should generate gold coin with legendary quality', async () => { ... });
   ```

2. **Test both happy paths and edge cases**
   ```javascript
   describe('edge cases', () => {
     it('should handle invalid input gracefully', () => { ... });
     it('should handle null options', () => { ... });
     it('should handle missing required fields', () => { ... });
   });
   ```

3. **Use appropriate timeouts for async operations**
   ```javascript
   it('should generate complex asset', async () => {
     // Test code
   }, 15000); // 15 second timeout
   ```

4. **Clean up resources**
   ```javascript
   afterEach(async () => {
     await FileHelpers.cleanupTempDir(tempDir);
     if (db) db.close();
   });
   ```

5. **Group related tests**
   ```javascript
   describe('MyClass', () => {
     describe('constructor', () => { ... });
     describe('method1()', () => { ... });
     describe('method2()', () => { ... });
     describe('edge cases', () => { ... });
   });
   ```

## Test Categories

### Unit Tests
Test individual functions and methods in isolation.

```bash
npm run test:unit
```

### Integration Tests
Test interaction between components.

```bash
npm run test:integration
```

### Performance Tests
Test execution time and resource usage.

```javascript
it('should complete within time limit', async () => {
  const startTime = Date.now();
  await generator.generate();
  const duration = Date.now() - startTime;

  expect(duration).toBeLessThan(5000);
});
```

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Push to any branch
- Pull request creation/update
- Scheduled nightly builds

### Coverage Requirements
Pull requests must maintain minimum 50% code coverage to merge.

## Troubleshooting

### Common Issues

#### Tests Timeout
```bash
# Increase Jest timeout
jest --testTimeout=30000
```

#### Out of Memory
```bash
# Limit parallel workers
jest --maxWorkers=2
```

#### Cache Issues
```bash
# Clear Jest cache
jest --clearCache
npm test
```

#### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

```bash
# Run tests with Node debugger
npm run test:debug

# Then in Chrome, navigate to:
chrome://inspect
```

## Mocking

### External Dependencies

#### Canvas (Jimp)
Automatically mocked in `jest.setup.js` for Node.js environment.

#### Better-SQLite3
Automatically mocked in `jest.setup.js` with full API compatibility.

#### Web Audio API
Mocked for tests requiring AudioContext in Node.js.

### Custom Mocks

```javascript
// Mock a module
jest.mock('../my-module', () => ({
  myFunction: jest.fn(() => 'mocked value'),
}));

// Mock a specific function
const myFunction = jest.fn();
myFunction.mockReturnValue('value');
myFunction.mockResolvedValue('async value');
```

## Code Coverage

### Viewing Coverage

```bash
# Generate and view coverage
npm run test:coverage
open coverage/index.html
```

### Coverage Reports
- **HTML**: `coverage/index.html` - Interactive browser report
- **LCOV**: `coverage/lcov.info` - For CI/CD integration
- **JSON**: `coverage/coverage-final.json` - Machine-readable format
- **Text**: Console output - Quick summary

### Coverage Thresholds

Configured in `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50
  }
}
```

## Contributing

### Adding New Tests

1. Create test file in appropriate `__tests__` directory
2. Follow naming convention: `<module-name>.test.js`
3. Import test utilities from `test-utils`
4. Write descriptive test cases
5. Run tests locally: `npm test`
6. Ensure coverage meets thresholds: `npm run test:coverage`
7. Commit and push changes

### Test File Template

```javascript
/**
 * Tests for ModuleName
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const { FileHelpers } = require('../../test-utils');
const ModuleName = require('../module-name');

describe('ModuleName', () => {
  let module;
  let tempDir;

  beforeEach(() => {
    module = new ModuleName();
    tempDir = FileHelpers.createTempDir();
  });

  afterEach(async () => {
    await FileHelpers.cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(module).toBeDefined();
    });
  });

  describe('method()', () => {
    it('should perform expected behavior', () => {
      const result = module.method();
      expect(result).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle invalid input', () => {
      expect(() => module.method(null)).not.toThrow();
    });
  });
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest Expect API](https://jestjs.io/docs/expect)
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
- [Jest Configuration](https://jestjs.io/docs/configuration)

## Support

For questions or issues with tests:
1. Check this guide
2. Review existing test files for examples
3. Check Jest documentation
4. Create an issue on GitHub
