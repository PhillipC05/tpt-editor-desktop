# Enhanced Utilities Documentation

This document explains the new utilities added to the TPT Asset Editor Desktop to enhance its functionality.

## Error Handler

The `ErrorHandler` utility provides centralized error handling and logging across the application.

### Features

- Consistent error logging with context
- Different log levels (error, warning, info)
- Standardized error responses
- Wrapper functions for async and sync operations

### Usage

```javascript
const ErrorHandler = require('./src/utils/error-handler');

// Log an error
ErrorHandler.logError('Database connection failed', error, 'DatabaseService');

// Log a warning
ErrorHandler.logWarning('Low memory warning', 'MemoryManager');

// Log an info message
ErrorHandler.logInfo('Application started', 'App');

// Create a standardized error response
const errorResponse = ErrorHandler.createErrorResponse('Invalid input', 'INVALID_INPUT', 400);

// Wrap async functions with error handling
const wrappedFunction = ErrorHandler.asyncWrapper(myAsyncFunction, 'MyComponent');
```

## Performance Monitor

The `PerformanceMonitor` utility tracks performance metrics for asset generation and application usage.

### Features

- Operation timing with start/stop timers
- Custom metric recording
- Memory and CPU usage monitoring
- Performance statistics calculation
- Metrics export functionality

### Usage

```javascript
const PerformanceMonitor = require('./src/utils/performance-monitor');

const perfMonitor = new PerformanceMonitor();

// Start timing an operation
perfMonitor.startTimer('asset-generation', 'GenerateSprite');

// ... perform operation ...

// Stop timing and get results
const result = perfMonitor.stopTimer('asset-generation');

// Record a custom metric
perfMonitor.recordMetric('assets-generated', 10, { type: 'sprite' });

// Get memory usage
const memory = perfMonitor.getMemoryUsage();

// Get CPU usage
const cpu = perfMonitor.getCpuUsage();

// Get operation statistics
const stats = perfMonitor.getOperationStats('GenerateSprite');

// Export all metrics
const metricsJson = perfMonitor.exportMetrics();
```

## Additional Export Formats

The asset generators now support additional export formats including JSON metadata export.

### Audio Generator Enhancements

- JSON metadata export for audio assets
- Extended batch export to support JSON format

### Visual Generator Enhancements

- JSON metadata export for visual assets
- Sprite sheet export functionality

### Usage

```javascript
// Export audio asset as JSON
const jsonAsset = await audioGenerator.exportAsJSON(audioAsset);

// Export visual asset as JSON
const jsonAsset = await vehicleGenerator.exportAsJSON(vehicleAsset);

// Batch export with JSON format
const results = await audioGenerator.batchExport([asset1, asset2], 'json');
```

## Plugin System Enhancements

The plugin system has been enhanced with new utilities for marketplace integration and rating systems.

### Plugin Marketplace

- Fetch available plugins from marketplace
- Search plugins by query
- Download plugins
- Get plugin ratings and reviews

### Plugin Rating System

- Add ratings for plugins
- Calculate average ratings
- Manage user reviews
- Get top-rated plugins

### Plugin Template

A template is provided to help developers create new plugins with:
- Base plugin class to extend
- Event listener registration
- Custom generator registration
- UI element integration
- Standardized plugin structure

## Testing

New test scripts have been added to verify the enhanced utilities:

- `npm run test:enhanced` - Run tests for enhanced utilities

## Linting

ESLint configuration has been added for code quality:

- `npm run lint` - Check code quality
- `npm run lint:fix` - Automatically fix code quality issues

## Documentation

JSDoc configuration has been added for API documentation:

- `npm run docs` - Generate API documentation
- `npm run docs:serve` - Serve documentation locally