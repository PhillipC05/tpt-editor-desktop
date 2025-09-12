/**
 * TPT Asset Editor Desktop - Core Module Tests
 * Unit tests for core modules using the custom test framework
 */

const TestFramework = require('./test-framework');
const MemoryManager = require('../utils/memory-manager');
const BackgroundProcessor = require('../utils/background-processor');
const Store = require('../core/store');

// Create test framework instance
const testFramework = new TestFramework({
    verbose: true,
    bail: false,
    timeout: 10000,
    outputDir: './test-results'
});

// Memory Manager Tests
testFramework.describe('Memory Manager', () => {
    let memoryManager;

    testFramework.beforeEach(() => {
        memoryManager = new MemoryManager({
            maxMemoryMB: 256,
            warningThresholdMB: 200,
            criticalThresholdMB: 230
        });
    });

    testFramework.afterEach(async () => {
        if (memoryManager) {
            await memoryManager.cleanup();
        }
    });

    testFramework.it('should initialize with correct configuration', () => {
        testFramework.expect(memoryManager.maxMemoryMB).toBe(256);
        testFramework.expect(memoryManager.warningThresholdMB).toBe(200);
        testFramework.expect(memoryManager.criticalThresholdMB).toBe(230);
        testFramework.expect(memoryManager.objectPools).toBeDefined();
        testFramework.expect(typeof memoryManager.objectPools.get('canvas')).toBe('object');
    });

    testFramework.it('should create and manage object pools', () => {
        const canvasPool = memoryManager.objectPools.get('canvas');
        testFramework.expect(canvasPool).toBeDefined();
        testFramework.expect(canvasPool.maxSize).toBe(20);
        testFramework.expect(canvasPool.available).toBeInstanceOf(Array);
        testFramework.expect(canvasPool.inUse).toBeInstanceOf(Set);
    });

    testFramework.it('should get objects from pool correctly', () => {
        const canvas1 = memoryManager.getFromPool('canvas');
        const canvas2 = memoryManager.getFromPool('canvas');

        testFramework.expect(canvas1).toBeDefined();
        testFramework.expect(canvas2).toBeDefined();
        testFramework.expect(canvas1).not.toBe(canvas2); // Different objects
        testFramework.expect(canvas1.width).toBe(64); // Default size
        testFramework.expect(canvas1.height).toBe(64);
    });

    testFramework.it('should return objects to pool correctly', () => {
        const canvas = memoryManager.getFromPool('canvas');
        const canvasPool = memoryManager.objectPools.get('canvas');

        const initialAvailableCount = canvasPool.available.length;
        const initialInUseCount = canvasPool.inUse.size;

        memoryManager.returnToPool('canvas', canvas);

        testFramework.expect(canvasPool.available.length).toBe(initialAvailableCount + 1);
        testFramework.expect(canvasPool.inUse.size).toBe(initialInUseCount - 1);
    });

    testFramework.it('should reuse objects from pool', () => {
        const canvas1 = memoryManager.getFromPool('canvas');
        memoryManager.returnToPool('canvas', canvas1);
        const canvas2 = memoryManager.getFromPool('canvas');

        // Should be the same object
        testFramework.expect(canvas1).toBe(canvas2);

        const canvasPool = memoryManager.objectPools.get('canvas');
        testFramework.expect(canvasPool.stats.reused).toBe(1);
    });

    testFramework.it('should handle different pool types', () => {
        const canvas = memoryManager.getFromPool('canvas');
        const imageData = memoryManager.getFromPool('imageData');
        const array = memoryManager.getFromPool('array_small');

        testFramework.expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        testFramework.expect(imageData).toBeInstanceOf(ImageData);
        testFramework.expect(Array.isArray(array)).toBe(true);
        testFramework.expect(array.length).toBe(64);
    });

    testFramework.it('should track memory statistics', () => {
        const stats = memoryManager.getMemoryStats();
        testFramework.expect(stats).toHaveProperty('memory');
        testFramework.expect(stats).toHaveProperty('allocations');
        testFramework.expect(stats).toHaveProperty('cache');
        testFramework.expect(stats).toHaveProperty('pools');
        testFramework.expect(typeof stats.memory.current).toBe('number');
    });

    testFramework.it('should manage cache correctly', () => {
        memoryManager.setCache('test_key', { data: 'test_value' });
        const cached = memoryManager.getCache('test_key');
        testFramework.expect(cached).toEqual({ data: 'test_value' });

        memoryManager.clearCache('test_key');
        const cleared = memoryManager.getCache('test_key');
        testFramework.expect(cleared).toBeNull();
    });

    testFramework.it('should estimate object sizes', () => {
        const size1 = memoryManager.estimateObjectSize('hello');
        const size2 = memoryManager.estimateObjectSize([1, 2, 3]);
        const size3 = memoryManager.estimateObjectSize({ a: 1, b: 2 });

        testFramework.expect(size1).toBeGreaterThan(0);
        testFramework.expect(size2).toBeGreaterThan(size1);
        testFramework.expect(size3).toBeGreaterThan(size1);
    });

    testFramework.it('should handle pool statistics', () => {
        const poolStats = memoryManager.getPoolStats('canvas');
        testFramework.expect(poolStats).toHaveProperty('name', 'canvas');
        testFramework.expect(poolStats).toHaveProperty('available');
        testFramework.expect(poolStats).toHaveProperty('inUse');
        testFramework.expect(poolStats).toHaveProperty('maxSize', 20);
    });

    testFramework.it('should throw error for invalid pool', () => {
        testFramework.expect(() => {
            memoryManager.getFromPool('invalid_pool');
        }).toThrow('Object pool \'invalid_pool\' not found');
    });
});

// Background Processor Tests
testFramework.describe('Background Processor', () => {
    let backgroundProcessor;

    testFramework.beforeEach(() => {
        backgroundProcessor = new BackgroundProcessor({
            maxWorkers: 2,
            workerScriptPath: './src/utils/worker.js'
        });
    });

    testFramework.afterEach(async () => {
        if (backgroundProcessor) {
            await backgroundProcessor.cleanup();
        }
    });

    testFramework.it('should initialize with correct configuration', () => {
        testFramework.expect(backgroundProcessor.maxWorkers).toBe(2);
        testFramework.expect(backgroundProcessor.taskQueue).toBeInstanceOf(Array);
        testFramework.expect(backgroundProcessor.activeWorkers).toBeInstanceOf(Map);
        testFramework.expect(backgroundProcessor.workerPool).toBeInstanceOf(Array);
        testFramework.expect(backgroundProcessor.workerPool.length).toBe(2);
    });

    testFramework.it('should add tasks to queue', async () => {
        const taskId = await backgroundProcessor.addTask({
            type: 'generate_sprite',
            data: { width: 32, height: 32, type: 'character' }
        });

        testFramework.expect(typeof taskId).toBe('string');
        testFramework.expect(taskId).toMatch(/^task_/);
        testFramework.expect(backgroundProcessor.taskQueue.length).toBe(1);
    });

    testFramework.it('should handle task priority', async () => {
        await backgroundProcessor.addTask({
            type: 'generate_sprite',
            data: { width: 32, height: 32 },
            priority: 'normal'
        });

        await backgroundProcessor.addTask({
            type: 'generate_sprite',
            data: { width: 32, height: 32 },
            priority: 'high'
        });

        await backgroundProcessor.addTask({
            type: 'generate_sprite',
            data: { width: 32, height: 32 },
            priority: 'low'
        });

        // High priority should be first
        testFramework.expect(backgroundProcessor.taskQueue[0].priority).toBe('high');
        testFramework.expect(backgroundProcessor.taskQueue[1].priority).toBe('normal');
        testFramework.expect(backgroundProcessor.taskQueue[2].priority).toBe('low');
    });

    testFramework.it('should get task status', async () => {
        const taskId = await backgroundProcessor.addTask({
            type: 'generate_sprite',
            data: { width: 32, height: 32 }
        });

        const status = backgroundProcessor.getTaskStatus(taskId);
        testFramework.expect(status).toBeDefined();
        testFramework.expect(status.id).toBe(taskId);
        testFramework.expect(status.status).toBe('queued');
    });

    testFramework.it('should cancel tasks', async () => {
        const taskId = await backgroundProcessor.addTask({
            type: 'generate_sprite',
            data: { width: 32, height: 32 }
        });

        const cancelled = await backgroundProcessor.cancelTask(taskId);
        testFramework.expect(cancelled).toBe(true);

        const status = backgroundProcessor.getTaskStatus(taskId);
        testFramework.expect(status.status).toBe('cancelled');
    });

    testFramework.it('should return task statistics', () => {
        const stats = backgroundProcessor.getStats();
        testFramework.expect(stats).toHaveProperty('tasks');
        testFramework.expect(stats).toHaveProperty('workers');
        testFramework.expect(stats).toHaveProperty('performance');
        testFramework.expect(stats.tasks).toHaveProperty('total', 0);
        testFramework.expect(stats.workers).toHaveProperty('total', 2);
    });

    testFramework.it('should generate unique task IDs', async () => {
        const taskId1 = await backgroundProcessor.addTask({
            type: 'generate_sprite',
            data: { width: 32, height: 32 }
        });

        const taskId2 = await backgroundProcessor.addTask({
            type: 'generate_sprite',
            data: { width: 32, height: 32 }
        });

        testFramework.expect(taskId1).not.toBe(taskId2);
        testFramework.expect(taskId1).toMatch(/^task_/);
        testFramework.expect(taskId2).toMatch(/^task_/);
    });

    testFramework.it('should handle invalid task data', async () => {
        try {
            await backgroundProcessor.addTask(null);
            testFramework.expect(true).toBe(false); // Should not reach here
        } catch (error) {
            testFramework.expect(error.message).toBe('Task must be a valid object');
        }
    });

    testFramework.it('should handle invalid task type', async () => {
        try {
            await backgroundProcessor.addTask({ data: {} });
            testFramework.expect(true).toBe(false); // Should not reach here
        } catch (error) {
            testFramework.expect(error.message).toBe('Task must have a type property');
        }
    });
});

// Store Tests
testFramework.describe('Store', () => {
    let store;

    testFramework.beforeEach(() => {
        store = new Store({
            maxHistorySize: 10,
            persistenceEnabled: false,
            validationEnabled: true
        });
    });

    testFramework.afterEach(async () => {
        if (store) {
            await store.cleanup();
        }
    });

    testFramework.it('should initialize with default state', () => {
        const state = store.getState();
        testFramework.expect(state).toHaveProperty('app');
        testFramework.expect(state).toHaveProperty('ui');
        testFramework.expect(state).toHaveProperty('assets');
        testFramework.expect(state).toHaveProperty('generators');
        testFramework.expect(state).toHaveProperty('preferences');
        testFramework.expect(state.app.version).toBe('1.0.0');
    });

    testFramework.it('should dispatch actions correctly', async () => {
        const action = {
            type: 'TEST_ACTION',
            payload: { test: 'data' }
        };

        const newState = await store.dispatch(action);
        testFramework.expect(newState).toBeDefined();
        testFramework.expect(store.getState()).toBe(newState);
    });

    testFramework.it('should register reducers', () => {
        const testReducer = (state, action) => {
            if (action.type === 'TEST_INCREMENT') {
                return { ...state, counter: (state.counter || 0) + 1 };
            }
            return state;
        };

        store.registerReducer('test', testReducer);
        testFramework.expect(store.reducers.has('test')).toBe(true);
    });

    testFramework.it('should apply reducers correctly', async () => {
        let testState = { counter: 0 };
        const testReducer = (state, action) => {
            if (action.type === 'TEST_INCREMENT') {
                return { ...state, counter: state.counter + 1 };
            }
            return state;
        };

        store.registerReducer('test', testReducer);

        // Manually set test state for this test
        store.state.test = testState;

        await store.dispatch({ type: 'TEST_INCREMENT' });
        testFramework.expect(store.getState().test.counter).toBe(1);
    });

    testFramework.it('should handle subscriptions', () => {
        let callCount = 0;
        let lastAction = null;

        const unsubscribe = store.subscribe((data) => {
            callCount++;
            lastAction = data.action;
        });

        store.dispatch({ type: 'TEST_SUBSCRIBE' });

        testFramework.expect(callCount).toBe(1);
        testFramework.expect(lastAction.type).toBe('TEST_SUBSCRIBE');

        unsubscribe();
        store.dispatch({ type: 'TEST_UNSUBSCRIBE' });
        testFramework.expect(callCount).toBe(1); // Should not have increased
    });

    testFramework.it('should handle action-specific subscriptions', () => {
        let callCount = 0;

        const unsubscribe = store.subscribeToAction('SPECIFIC_ACTION', () => {
            callCount++;
        });

        store.dispatch({ type: 'SPECIFIC_ACTION' });
        store.dispatch({ type: 'OTHER_ACTION' });

        testFramework.expect(callCount).toBe(1);

        unsubscribe();
    });

    testFramework.it('should maintain history', async () => {
        await store.dispatch({ type: 'ACTION_1' });
        await store.dispatch({ type: 'ACTION_2' });
        await store.dispatch({ type: 'ACTION_3' });

        const historyInfo = store.getHistoryInfo();
        testFramework.expect(historyInfo.totalActions).toBe(3);
        testFramework.expect(historyInfo.canUndo).toBe(true);
        testFramework.expect(historyInfo.canRedo).toBe(false);
    });

    testFramework.it('should handle undo/redo', async () => {
        await store.dispatch({ type: 'ACTION_1' });
        const stateAfter1 = store.getState();

        await store.dispatch({ type: 'ACTION_2' });
        const stateAfter2 = store.getState();

        const undoResult = await store.undo();
        testFramework.expect(undoResult).toBe(true);
        testFramework.expect(store.getState()).toEqual(stateAfter1);

        const redoResult = await store.redo();
        testFramework.expect(redoResult).toBe(true);
        testFramework.expect(store.getState()).toEqual(stateAfter2);
    });

    testFramework.it('should validate actions', async () => {
        // Test with invalid action
        try {
            await store.dispatch(null);
            testFramework.expect(true).toBe(false); // Should not reach here
        } catch (error) {
            testFramework.expect(error.message).toBe('Action must have a type property');
        }
    });

    testFramework.it('should handle middleware', () => {
        let middlewareCalled = false;

        store.use((action, state) => {
            middlewareCalled = true;
            return action;
        });

        store.dispatch({ type: 'TEST_MIDDLEWARE' });
        testFramework.expect(middlewareCalled).toBe(true);
    });

    testFramework.it('should provide store statistics', () => {
        const stats = store.getStats();
        testFramework.expect(stats).toHaveProperty('stateSize');
        testFramework.expect(stats).toHaveProperty('historySize');
        testFramework.expect(stats).toHaveProperty('listenersCount');
        testFramework.expect(stats).toHaveProperty('reducersCount');
        testFramework.expect(stats).toHaveProperty('middlewaresCount');
        testFramework.expect(typeof stats.stateSize).toBe('number');
    });

    testFramework.it('should handle state reset', async () => {
        await store.dispatch({ type: 'MODIFY_STATE' });
        const modifiedState = store.getState();

        await store.resetState();
        const resetState = store.getState();

        testFramework.expect(modifiedState).not.toEqual(store.state);
        testFramework.expect(resetState.app.initialized).toBe(false);
    });
});

// Integration Tests
testFramework.describe('Integration Tests', () => {
    let memoryManager;
    let backgroundProcessor;
    let store;

    testFramework.beforeAll(() => {
        memoryManager = new MemoryManager({ maxMemoryMB: 256 });
        backgroundProcessor = new BackgroundProcessor({ maxWorkers: 1 });
        store = new Store({ persistenceEnabled: false });
    });

    testFramework.afterAll(async () => {
        if (memoryManager) await memoryManager.cleanup();
        if (backgroundProcessor) await backgroundProcessor.cleanup();
        if (store) await store.cleanup();
    });

    testFramework.it('should integrate memory manager with store', async () => {
        // Create a large object using memory manager
        const largeArray = memoryManager.getFromPool('array_large');

        // Store it in the store
        await store.dispatch({
            type: 'STORE_LARGE_OBJECT',
            payload: { largeArray }
        });

        const state = store.getState();
        testFramework.expect(state.largeArray).toBeDefined();

        // Clean up
        memoryManager.returnToPool('array_large', largeArray);
    });

    testFramework.it('should handle background tasks with store updates', async () => {
        let taskCompleted = false;

        // Subscribe to store changes
        const unsubscribe = store.subscribe((data) => {
            if (data.action.type === 'TASK_COMPLETED') {
                taskCompleted = true;
            }
        });

        // Add a background task
        const taskId = await backgroundProcessor.addTask({
            type: 'generate_sprite',
            data: { width: 32, height: 32, type: 'character' }
        });

        // Simulate task completion (in real scenario, this would happen automatically)
        setTimeout(() => {
            store.dispatch({
                type: 'TASK_COMPLETED',
                payload: { taskId, result: 'mock_result' }
            });
        }, 100);

        // Wait a bit for async operations
        await new Promise(resolve => setTimeout(resolve, 200));

        testFramework.expect(taskCompleted).toBe(true);
        unsubscribe();
    });

    testFramework.it('should handle memory pressure during operations', () => {
        // Create multiple objects to simulate memory pressure
        const objects = [];
        for (let i = 0; i < 10; i++) {
            objects.push(memoryManager.getFromPool('canvas'));
        }

        const stats = memoryManager.getMemoryStats();
        testFramework.expect(stats.pools.canvas.inUse).toBe(10);

        // Clean up
        objects.forEach(obj => memoryManager.returnToPool('canvas', obj));
    });

    testFramework.it('should maintain system stability under load', async () => {
        // Simulate multiple concurrent operations
        const promises = [];

        for (let i = 0; i < 5; i++) {
            promises.push(backgroundProcessor.addTask({
                type: 'generate_sprite',
                data: { width: 32, height: 32, type: 'character' },
                priority: i % 2 === 0 ? 'high' : 'normal'
            }));

            promises.push(store.dispatch({
                type: 'BATCH_OPERATION',
                payload: { operationId: i }
            }));
        }

        await Promise.all(promises);

        // Verify system is still stable
        const bgStats = backgroundProcessor.getStats();
        const storeStats = store.getStats();

        testFramework.expect(bgStats.tasks.total).toBe(5);
        testFramework.expect(typeof storeStats.stateSize).toBe('number');
    });
});

// Performance Tests
testFramework.describe('Performance Tests', () => {
    let memoryManager;
    let store;

    testFramework.beforeAll(() => {
        memoryManager = new MemoryManager({ maxMemoryMB: 512 });
        store = new Store({ persistenceEnabled: false });
    });

    testFramework.afterAll(async () => {
        if (memoryManager) await memoryManager.cleanup();
        if (store) await store.cleanup();
    });

    testFramework.it('should handle rapid object allocation/deallocation', () => {
        const startTime = Date.now();
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
            const obj = memoryManager.getFromPool('array_small');
            memoryManager.returnToPool('array_small', obj);
        }

        const duration = Date.now() - startTime;
        const avgTime = duration / iterations;

        console.log(`Object pooling performance: ${avgTime.toFixed(2)}ms per operation`);
        testFramework.expect(avgTime).toBeLessThan(1); // Should be very fast
    });

    testFramework.it('should handle rapid state updates', async () => {
        const startTime = Date.now();
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
            await store.dispatch({
                type: 'PERFORMANCE_TEST',
                payload: { iteration: i }
            });
        }

        const duration = Date.now() - startTime;
        const avgTime = duration / iterations;

        console.log(`State update performance: ${avgTime.toFixed(2)}ms per dispatch`);
        testFramework.expect(avgTime).toBeLessThan(5); // Should be reasonably fast
    });

    testFramework.it('should maintain performance under memory pressure', () => {
        // Fill up memory pools
        const objects = [];
        for (let i = 0; i < 50; i++) {
            objects.push(memoryManager.getFromPool('canvas'));
        }

        const startTime = Date.now();

        // Try operations under memory pressure
        for (let i = 0; i < 20; i++) {
            const obj = memoryManager.getFromPool('array_medium');
            memoryManager.returnToPool('array_medium', obj);
        }

        const duration = Date.now() - startTime;
        console.log(`Performance under memory pressure: ${duration}ms for 20 operations`);

        // Clean up
        objects.forEach(obj => memoryManager.returnToPool('canvas', obj));

        testFramework.expect(duration).toBeLessThan(100); // Should still be fast
    });

    testFramework.it('should handle large state objects efficiently', async () => {
        const largeData = {
            data: new Array(1000).fill().map((_, i) => ({ id: i, value: Math.random() }))
        };

        const startTime = Date.now();

        await store.dispatch({
            type: 'LARGE_DATA_TEST',
            payload: largeData
        });

        const duration = Date.now() - startTime;
        console.log(`Large state update: ${duration}ms`);
        testFramework.expect(duration).toBeLessThan(50); // Should handle large objects reasonably
    });
});

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testFramework,
        runTests: () => testFramework.run()
    };
}

// Auto-run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    testFramework.run().then((results) => {
        console.log('\nTest execution completed');
        process.exit(results.summary.failed > 0 ? 1 : 0);
    }).catch((error) => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}
