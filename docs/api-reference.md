# TPT Asset Editor - API Reference

## Table of Contents
- [Core Classes](#core-classes)
- [Generator API](#generator-api)
- [Plugin System](#plugin-system)
- [Asset Management](#asset-management)
- [Performance & Memory](#performance--memory)
- [File Operations](#file-operations)
- [Events & Hooks](#events--hooks)

## Core Classes

### AssetOrganizer
Advanced asset organization, search, and management system.

#### Constructor
```javascript
const organizer = new AssetOrganizer();
await organizer.initialize();
```

#### Methods

##### Asset Management
```javascript
// Add asset to organizer
await organizer.addAsset(asset, metadata);

// Update existing asset
await organizer.updateAsset(assetId, updates, metadataUpdates);

// Remove asset
await organizer.removeAsset(assetId);

// Get asset by ID
const { asset, metadata } = organizer.getAsset(assetId);
```

##### Folder Management
```javascript
// Create new folder
const folderId = await organizer.createFolder('My Folder', parentId, metadata);

// Add asset to folder
await organizer.addAssetToFolder(assetId, folderId);

// Get folder contents
const contents = organizer.getFolderContents(folderId);
```

##### Tag Management
```javascript
// Create tag
const tagId = await organizer.createTag('fantasy', '#4A90E2', metadata);

// Add tag to asset
await organizer.addTagToAsset(assetId, tagId);

// Remove tag from asset
await organizer.removeTagFromAsset(assetId, tagId);
```

##### Collection Management
```javascript
// Create collection
const collectionId = await organizer.createCollection('Game Assets', 'Assets for my game', metadata);

// Add asset to collection
await organizer.addAssetToCollection(assetId, collectionId);
```

##### Search & Discovery
```javascript
// Search assets
const results = await organizer.searchAssets('sword', {
    folderId: 'weapons',
    tags: ['fantasy', 'melee'],
    type: 'sprite',
    limit: 50,
    offset: 0
});

// Results format
{
    results: [{ asset, metadata }, ...],
    total: 150,
    hasMore: true
}
```

##### Statistics & Maintenance
```javascript
// Get asset statistics
const stats = organizer.getAssetStatistics();
// Returns: { totalAssets, totalFolders, totalTags, totalCollections, ... }

// Cleanup orphaned assets
const cleanupResult = await organizer.cleanup();
// Returns: { removedAssets, removedFolders }
```

### PluginManager
Manages plugin loading, execution, and lifecycle.

#### Constructor
```javascript
const pluginManager = new PluginManager();
await pluginManager.initialize();
```

#### Methods

##### Plugin Lifecycle
```javascript
// Activate plugin
await pluginManager.activatePlugin('my-plugin');

// Deactivate plugin
await pluginManager.deactivatePlugin('my-plugin');

// Get plugin info
const info = pluginManager.getPluginInfo('my-plugin');
// Returns: { id, name, version, description, author, status, isActive }
```

##### Plugin Management
```javascript
// Get all plugins
const plugins = pluginManager.getAllPlugins();

// Get active plugins
const activePlugins = pluginManager.getActivePlugins();

// Get plugin statistics
const stats = pluginManager.getPluginStatistics();
// Returns: { totalPlugins, activePlugins, inactivePlugins, hooksRegistered }
```

##### Permission Management
```javascript
// Grant permission
pluginManager.grantPermission('my-plugin', 'file-system');

// Revoke permission
pluginManager.revokePermission('my-plugin', 'file-system');

// Check permission
const hasPermission = pluginManager.hasPermission('my-plugin', 'file-system');
```

### MemoryManager
Advanced memory management and optimization system.

#### Constructor
```javascript
const memoryManager = new MemoryManager();
await memoryManager.initialize();
```

#### Methods

##### Memory Monitoring
```javascript
// Get memory statistics
const stats = memoryManager.getMemoryStats();
// Returns: { v8Heap, nodeProcess, systemMemory, pools, alerts }

// Check memory health
const health = memoryManager.checkMemoryHealth();
// Returns: { healthy, issues, recommendations }
```

##### Memory Pools
```javascript
// Create memory pool
const pool = memoryManager.createPool('images', {
    maxSize: 100 * 1024 * 1024, // 100MB
    itemLimit: 1000,
    autoCleanup: true
});

// Add item to pool
pool.add('sprite-1', spriteData, spriteSize);

// Get item from pool
const spriteData = pool.get('sprite-1');

// Clear pool
pool.clear();
```

##### Garbage Collection
```javascript
// Trigger garbage collection
await memoryManager.triggerGC();

// Get GC statistics
const gcStats = memoryManager.getGCStats();
// Returns: { collections, freedMemory, duration }
```

### BackgroundProcessor
Multi-threaded task processing system.

#### Constructor
```javascript
const processor = new BackgroundProcessor();
await processor.initialize();
```

#### Methods

##### Task Management
```javascript
// Add task to queue
const taskId = await processor.addTask('sprite-generation', taskData, {
    priority: 'high',
    timeout: 300000, // 5 minutes
    retries: 2
});

// Cancel task
processor.cancelTask(taskId);

// Get task status
const status = processor.getTaskStatus(taskId);
// Returns: { id, type, status, progress, result, error }
```

##### Queue Management
```javascript
// Get active tasks
const activeTasks = processor.getActiveTasks();

// Get queued tasks
const queuedTasks = processor.getQueuedTasks();

// Get processing statistics
const stats = processor.getStatistics();
// Returns: { activeWorkers, maxWorkers, queuedTasks, activeTasks, ... }
```

##### Worker Management
```javascript
// Set maximum workers
processor.setMaxWorkers(8);

// Get worker utilization
const utilization = processor.getWorkerUtilization();
// Returns: { activeWorkers, maxWorkers, utilization }
```

## Generator API

### Base Generator Interface
All generators implement this common interface.

```javascript
class BaseGenerator {
    constructor(options = {}) {
        this.options = { ...this.defaultOptions, ...options };
    }

    // Required methods
    async generate(params) {
        // Implementation
        return generatedAsset;
    }

    getInfo() {
        return {
            name: 'Generator Name',
            description: 'Generator description',
            version: '1.0.0',
            author: 'Author Name',
            category: 'sprites',
            tags: ['fantasy', 'medieval']
        };
    }

    getParameters() {
        return {
            width: { type: 'number', default: 32, min: 8, max: 512 },
            height: { type: 'number', default: 32, min: 8, max: 512 },
            colors: { type: 'color[]', default: ['#ff0000', '#00ff00'] }
        };
    }

    validateParameters(params) {
        // Parameter validation
        return { valid: true, errors: [] };
    }
}
```

### Sprite Generator
Generates 2D sprite assets.

```javascript
const spriteGen = new SpriteGenerator();

// Generate sprite
const sprite = await spriteGen.generate({
    type: 'character',
    style: 'fantasy',
    width: 64,
    height: 64,
    colors: ['#8B4513', '#228B22', '#4169E1']
});

// Export sprite
await spriteGen.export(sprite, 'character.png', {
    format: 'png',
    quality: 90
});
```

### Audio Generator
Generates audio assets and sound effects.

```javascript
const audioGen = new AudioGenerator();

// Generate sound effect
const audio = await audioGen.generate({
    type: 'sword',
    duration: 1.5,
    sampleRate: 44100,
    effects: ['reverb', 'echo']
});

// Export audio
await audioGen.export(audio, 'sword.wav', {
    format: 'wav',
    bitDepth: 16
});
```

### Level Generator
Generates complete game levels.

```javascript
const levelGen = new LevelGenerator();

// Generate level
const level = await levelGen.generate({
    type: 'dungeon',
    size: 'large',
    theme: 'medieval',
    difficulty: 'normal',
    features: ['chests', 'monsters', 'traps']
});

// Export level
await levelGen.export(level, 'dungeon.tmx', {
    format: 'tiled',
    includeMetadata: true
});
```

## Plugin System

### Plugin Interface
All plugins must implement this interface.

```javascript
class MyPlugin {
    constructor() {
        this.name = 'My Plugin';
        this.version = '1.0.0';
        this.description = 'Plugin description';
    }

    // Required methods
    async initialize(context) {
        // Plugin initialization
        this.context = context;
        console.log('Plugin initialized');
    }

    getInfo() {
        return {
            name: this.name,
            version: this.version,
            description: this.description,
            author: 'Author Name',
            homepage: 'https://example.com'
        };
    }

    async activate() {
        // Plugin activation logic
        console.log('Plugin activated');
    }

    async deactivate() {
        // Plugin deactivation logic
        console.log('Plugin deactivated');
    }

    // Optional methods
    getPermissions() {
        return ['file-system', 'network'];
    }

    getHooks() {
        return {
            'pre-generation': this.onPreGeneration.bind(this),
            'post-generation': this.onPostGeneration.bind(this),
            'ui-render': this.onUIRender.bind(this)
        };
    }

    // Hook implementations
    async onPreGeneration(data) {
        // Pre-generation processing
        console.log('Pre-generation hook:', data);
        return data; // Modified data
    }

    async onPostGeneration(data) {
        // Post-generation processing
        console.log('Post-generation hook:', data);
        return data;
    }

    async onUIRender(data) {
        // UI rendering hook
        return this.renderCustomUI(data);
    }
}
```

### Plugin Context API
Plugins receive a context object with access to application functionality.

```javascript
// In plugin initialize method
async initialize(context) {
    this.api = context.api;
    this.hooks = context.hooks;

    // Register hooks
    this.hooks.register('pre-generation', this.onPreGeneration.bind(this));

    // Use API
    const generators = this.api.getGenerators();
    const assets = this.api.getAssets();

    // Add custom generator
    this.api.addGenerator(myCustomGenerator);

    // Add menu item
    this.api.addMenuItem({
        label: 'My Plugin Action',
        action: () => this.doSomething()
    });
}
```

### Hook Types
Available hook points for plugin extensibility.

#### Generation Hooks
```javascript
// Pre-generation
'pre-generation': (data) => {
    // data: { generator, params, options }
    return modifiedData;
}

// Post-generation
'post-generation': (data) => {
    // data: { generator, params, result, asset }
    return modifiedData;
}
```

#### Export Hooks
```javascript
// Pre-export
'pre-export': (data) => {
    // data: { asset, format, options }
    return modifiedData;
}

// Post-export
'post-export': (data) => {
    // data: { asset, format, path, success }
    return modifiedData;
}
```

#### UI Hooks
```javascript
// UI render
'ui-render': (data) => {
    // data: { component, props }
    return customComponent;
}

// Menu item
'menu-item': (data) => {
    // data: { menu, items }
    return modifiedItems;
}

// Toolbar button
'toolbar-button': (data) => {
    // data: { toolbar, buttons }
    return modifiedButtons;
}
```

#### File Hooks
```javascript
// File open
'file-open': (data) => {
    // data: { path, content, type }
    return modifiedData;
}

// File save
'file-save': (data) => {
    // data: { path, content, type }
    return modifiedData;
}
```

## Asset Management

### Asset Structure
Standard asset object structure.

```javascript
const asset = {
    id: 'unique-asset-id',
    name: 'Asset Name',
    type: 'sprite', // sprite, audio, level, etc.
    path: '/path/to/asset.png',
    size: 1024, // File size in bytes
    dimensions: { width: 64, height: 64 }, // For visual assets
    duration: 2.5, // For audio assets
    format: 'png',
    created: '2025-01-01T00:00:00.000Z',
    modified: '2025-01-01T00:00:00.000Z',
    generator: 'sprite-generator',
    tags: ['fantasy', 'character'],
    metadata: {
        // Generator-specific metadata
        style: 'medieval',
        colors: ['#8B4513', '#228B22'],
        complexity: 'medium'
    }
};
```

### Asset Metadata
Standard metadata structure.

```javascript
const metadata = {
    assetId: 'unique-asset-id',
    folderId: 'folder-id',
    collectionIds: ['collection-1', 'collection-2'],
    tags: ['fantasy', 'character', 'warrior'],
    description: 'A brave warrior sprite',
    author: 'Generator Name',
    license: 'CC0',
    usage: 'Free for commercial use',
    created: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z',
    version: '1.0.0',
    dependencies: [], // Other asset IDs
    customFields: {
        // Plugin-specific fields
        difficulty: 'normal',
        rarity: 'common'
    }
};
```

### Asset Operations
Common asset management operations.

```javascript
// Create new asset
const asset = await createAsset({
    name: 'Hero Sprite',
    type: 'sprite',
    data: spriteData,
    metadata: {
        tags: ['character', 'hero'],
        description: 'Main character sprite'
    }
});

// Update asset
await updateAsset(assetId, {
    name: 'Updated Hero Sprite',
    tags: ['character', 'hero', 'updated']
});

// Delete asset
await deleteAsset(assetId);

// Search assets
const results = await searchAssets({
    query: 'hero',
    type: 'sprite',
    tags: ['character'],
    limit: 20
});

// Get asset by ID
const asset = await getAsset(assetId);

// Get assets by type
const sprites = await getAssetsByType('sprite');

// Get assets by tag
const heroes = await getAssetsByTag('hero');
```

## Performance & Memory

### Memory Pool Usage
Efficient memory management for large datasets.

```javascript
// Create typed memory pool
const spritePool = memoryManager.createPool('sprites', {
    maxSize: 50 * 1024 * 1024, // 50MB
    itemLimit: 500,
    itemSize: 64 * 64 * 4, // 64x64 RGBA
    autoCleanup: true,
    cleanupInterval: 300000 // 5 minutes
});

// Add sprite to pool
const spriteId = spritePool.add('hero-sprite', spriteData, spriteData.length);

// Get sprite from pool
const spriteData = spritePool.get('hero-sprite');

// Check pool status
const status = spritePool.getStatus();
// Returns: { size, itemCount, hitRate, lastAccess }

// Clear old items
spritePool.cleanup(Date.now() - 3600000); // Remove items older than 1 hour
```

### Background Processing
Non-blocking task execution.

```javascript
// Create background task
const taskId = await backgroundProcessor.addTask('batch-generate', {
    generator: 'sprite',
    count: 100,
    params: { type: 'character', style: 'fantasy' }
}, {
    priority: 'normal',
    onProgress: (progress) => {
        console.log(`Progress: ${progress}%`);
    },
    onComplete: (result) => {
        console.log('Batch generation complete:', result);
    },
    onError: (error) => {
        console.error('Batch generation failed:', error);
    }
});

// Monitor task
const status = backgroundProcessor.getTaskStatus(taskId);
// Returns: { id, type, status, progress, result, error, startTime, endTime }

// Cancel task
backgroundProcessor.cancelTask(taskId);

// Get all active tasks
const activeTasks = backgroundProcessor.getActiveTasks();

// Pause processing
backgroundProcessor.pauseProcessing();

// Resume processing
backgroundProcessor.resumeProcessing();
```

### Performance Monitoring
Track application performance.

```javascript
// Get performance metrics
const metrics = performanceMonitor.getMetrics();
// Returns: { cpu, memory, disk, network, tasks }

// Monitor specific operation
const timer = performanceMonitor.startTimer('sprite-generation');

try {
    const sprite = await generateSprite(params);
    timer.end();
    console.log(`Generation took ${timer.duration}ms`);
} catch (error) {
    timer.end();
    throw error;
}

// Get operation statistics
const stats = performanceMonitor.getOperationStats('sprite-generation');
// Returns: { count, totalTime, averageTime, minTime, maxTime }
```

## File Operations

### File System Access
Safe file system operations with permissions.

```javascript
// Read file
const content = await fs.readFile('/path/to/file.png');

// Write file
await fs.writeFile('/path/to/output.png', data);

// List directory
const files = await fs.listDirectory('/assets/sprites');

// Create directory
await fs.createDirectory('/assets/new-folder');

// Copy file
await fs.copyFile('/source.png', '/destination.png');

// Move file
await fs.moveFile('/old-path.png', '/new-path.png');

// Delete file
await fs.deleteFile('/path/to/file.png');

// Get file info
const info = await fs.getFileInfo('/path/to/file.png');
// Returns: { size, modified, created, type, permissions }
```

### Asset Import/Export
Bulk asset operations.

```javascript
// Import assets from directory
const importedAssets = await importAssets('/path/to/assets', {
    recursive: true,
    types: ['png', 'jpg', 'wav'],
    organize: true, // Auto-organize into folders
    metadata: true // Extract metadata
});

// Export assets to directory
await exportAssets(assetIds, '/export/path', {
    format: 'png',
    quality: 90,
    createSubfolders: true,
    includeMetadata: true
});

// Import from ZIP archive
const importedAssets = await importFromArchive('/path/to/assets.zip', {
    extractTo: '/temp/extract',
    organize: true
});

// Export to ZIP archive
await exportToArchive(assetIds, '/path/to/export.zip', {
    compression: 'deflate',
    includeMetadata: true
});
```

## Events & Hooks

### Application Events
Global application event system.

```javascript
// Listen to application events
app.on('ready', () => {
    console.log('Application is ready');
});

app.on('asset-created', (asset) => {
    console.log('New asset created:', asset.name);
});

app.on('asset-updated', (assetId, updates) => {
    console.log('Asset updated:', assetId);
});

app.on('asset-deleted', (assetId) => {
    console.log('Asset deleted:', assetId);
});

app.on('plugin-activated', (pluginId) => {
    console.log('Plugin activated:', pluginId);
});

app.on('generation-started', (generator, params) => {
    console.log('Generation started:', generator, params);
});

app.on('generation-completed', (result) => {
    console.log('Generation completed:', result);
});

// Emit custom events
app.emit('custom-event', customData);
```

### Plugin Events
Plugin-specific event handling.

```javascript
// In plugin
this.context.api.on('asset-created', (asset) => {
    // React to new assets
    this.processNewAsset(asset);
});

this.context.api.on('generation-completed', (result) => {
    // Post-process generated assets
    this.postProcessAsset(result);
});

// Emit plugin events
this.context.api.emit('plugin-custom-event', pluginData);
```

### Hook System
Extensible hook system for plugins.

```javascript
// Register hook
this.hooks.register('pre-generation', async (data) => {
    // Pre-processing
    data.params.quality = 'enhanced';
    return data;
});

// Register multiple hooks
this.hooks.register('post-generation', this.onPostGeneration.bind(this));
this.hooks.register('ui-render', this.onUIRender.bind(this));

// Unregister hook
this.hooks.unregister('pre-generation', callbackFunction);

// Emit hook
const results = await this.hooks.emit('custom-hook', hookData);
```

## Error Handling

### Error Types
Standardized error handling.

```javascript
// Generator errors
class GeneratorError extends Error {
    constructor(message, generator, params) {
        super(message);
        this.name = 'GeneratorError';
        this.generator = generator;
        this.params = params;
    }
}

// Plugin errors
class PluginError extends Error {
    constructor(message, pluginId, hook) {
        super(message);
        this.name = 'PluginError';
        this.pluginId = pluginId;
        this.hook = hook;
    }
}

// File system errors
class FileSystemError extends Error {
    constructor(message, path, operation) {
        super(message);
        this.name = 'FileSystemError';
        this.path = path;
        this.operation = operation;
    }
}
```

### Error Handling Patterns
Best practices for error handling.

```javascript
// Try-catch with specific error types
try {
    const result = await generateAsset(params);
    return result;
} catch (error) {
    if (error instanceof GeneratorError) {
        console.error(`Generator error in ${error.generator}:`, error.message);
        // Handle generator-specific errors
    } else if (error instanceof PluginError) {
        console.error(`Plugin error in ${error.pluginId}:`, error.message);
        // Handle plugin errors
    } else {
        console.error('Unexpected error:', error);
        // Handle unexpected errors
    }
    throw error;
}

// Async error handling
async function safeGenerate(params) {
    try {
        return await generator.generate(params);
    } catch (error) {
        await logError(error, params);
        throw new GeneratorError(`Generation failed: ${error.message}`, generator.name, params);
    }
}

// Error recovery
async function generateWithRetry(params, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await generator.generate(params);
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            console.warn(`Attempt ${attempt} failed, retrying...`);
            await delay(1000 * attempt); // Exponential backoff
        }
    }
}
```

## Best Practices

### Plugin Development
```javascript
// 1. Always validate inputs
function validateParams(params) {
    if (!params.width || params.width < 8) {
        throw new Error('Width must be at least 8 pixels');
    }
}

// 2. Use proper error handling
async function safeOperation() {
    try {
        // Operation logic
    } catch (error) {
        // Clean up resources
        await cleanup();
        throw error;
    }
}

// 3. Document your plugin
const pluginInfo = {
    name: 'My Awesome Plugin',
    version: '1.0.0',
    description: 'Does amazing things',
    author: 'Your Name',
    permissions: ['file-system'],
    hooks: ['pre-generation', 'post-generation']
};
```

### Performance Optimization
```javascript
// 1. Use memory pools for large data
const pool = memoryManager.createPool('large-data', { maxSize: 100 * 1024 * 1024 });

// 2. Process data in chunks
async function processLargeDataset(data) {
    const chunkSize = 1000;
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await processChunk(chunk);
        // Allow UI to remain responsive
        await new Promise(resolve => setImmediate(resolve));
    }
}

// 3. Cache expensive operations
const cache = new Map();

async function getCachedResult(key, computeFunction) {
    if (cache.has(key)) {
        return cache.get(key);
    }
    const result = await computeFunction();
    cache.set(key, result);
    return result;
}
```

### Security Considerations
```javascript
// 1. Validate file paths
function validatePath(path) {
    const normalized = path.normalize();
    if (normalized.includes('..') || !normalized.startsWith('/safe/')) {
        throw new Error('Invalid path');
    }
    return normalized;
}

// 2. Sanitize user inputs
function sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
}

// 3. Use permission checks
async function secureFileOperation(path, operation) {
    if (!this.hasPermission('file-system')) {
        throw new Error('File system access not permitted');
    }
    // Proceed with operation
}
```

This API reference provides comprehensive documentation for developing with the TPT Asset Editor. For more detailed examples and tutorials, see the [Developer Guide](./developer-guide.md).
