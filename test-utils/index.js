/**
 * Test Utils Index
 * Central export for all test utilities
 */

const helpers = require('./test-helpers');
const mocks = require('./mock-factory');

module.exports = {
  // Re-export all helpers
  ...helpers,
  ...mocks,

  // Convenience exports
  FileHelpers: helpers.FileHelpers,
  RandomData: helpers.RandomData,
  AsyncHelpers: helpers.AsyncHelpers,
  MockData: helpers.MockData,
  AssertionHelpers: helpers.AssertionHelpers,
  PerformanceHelpers: helpers.PerformanceHelpers,

  // Mock factories
  createMockCanvas: mocks.createMockCanvas,
  createMockDatabase: mocks.createMockDatabase,
  createMockAudioContext: mocks.createMockAudioContext,
  createMockAudioBuffer: mocks.createMockAudioBuffer,
  createMockFileSystem: mocks.createMockFileSystem,
  createMockGenerator: mocks.createMockGenerator,
  createMockAsset: mocks.createMockAsset,
};
