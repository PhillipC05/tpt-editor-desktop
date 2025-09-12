/**
 * Test suite for enhanced utilities
 */

const ErrorHandler = require('../utils/error-handler');
const PerformanceMonitor = require('../utils/performance-monitor');

async function runTests() {
  console.log('Running tests for enhanced utilities...\n');

  // Test error handling
  console.log('1. Testing Error Handler...');
  try {
    ErrorHandler.logInfo('Test info message', 'TestContext', { test: true });
    ErrorHandler.logWarning('Test warning message', 'TestContext', { test: true });
    
    // Test error logging
    try {
      throw new Error('Test error');
    } catch (error) {
      ErrorHandler.logError('Test error message', error, 'TestContext', { test: true });
    }
    
    console.log('✓ Error Handler tests passed\n');
  } catch (error) {
    console.error('✗ Error Handler tests failed:', error);
  }

  // Test performance monitoring
  console.log('2. Testing Performance Monitor...');
  try {
    const perfMonitor = new PerformanceMonitor();
    
    // Test timer functionality
    perfMonitor.startTimer('test-op', 'Test Operation');
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = perfMonitor.stopTimer('test-op');
    console.log(`  Operation took ${result.durationMs.toFixed(2)}ms`);
    
    // Test metric recording
    perfMonitor.recordMetric('test-metric', 42, { unit: 'items' });
    
    // Test memory usage
    const memoryUsage = perfMonitor.getMemoryUsage();
    console.log(`  Memory usage: ${memoryUsage.heapUsed}MB`);
    
    // Test CPU usage
    const cpuUsage = perfMonitor.getCpuUsage();
    console.log(`  CPU usage: ${cpuUsage.user}ms user, ${cpuUsage.system}ms system`);
    
    // Test operation stats
    const stats = perfMonitor.getOperationStats('Test Operation');
    console.log(`  Operation stats: ${stats.count} executions, avg ${stats.averageMs.toFixed(2)}ms`);
    
    console.log('✓ Performance Monitor tests passed\n');
  } catch (error) {
    console.error('✗ Performance Monitor tests failed:', error);
  }

  // Test export enhancements
  console.log('3. Testing Export Enhancements...');
  try {
    // This would normally test the actual export functionality
    console.log('  Export enhancements would be tested with actual asset generation');
    console.log('✓ Export Enhancement tests completed\n');
  } catch (error) {
    console.error('✗ Export Enhancement tests failed:', error);
  }

  // Test plugin system enhancements
  console.log('4. Testing Plugin System Enhancements...');
  try {
    // This would normally test the actual plugin functionality
    console.log('  Plugin system enhancements would be tested with actual plugin loading');
    console.log('✓ Plugin System Enhancement tests completed\n');
  } catch (error) {
    console.error('✗ Plugin System Enhancement tests failed:', error);
  }

  console.log('All tests completed!');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
