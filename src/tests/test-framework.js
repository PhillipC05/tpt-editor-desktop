/**
 * TPT Asset Editor Desktop - Test Framework
 * Comprehensive testing framework for unit and integration tests
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class TestFramework extends EventEmitter {
    constructor(options = {}) {
        super();

        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0,
            suites: [],
            errors: []
        };

        this.currentSuite = null;
        this.currentTest = null;
        this.options = {
            verbose: options.verbose || false,
            bail: options.bail || false, // Stop on first failure
            timeout: options.timeout || 5000, // 5 second default timeout
            slowThreshold: options.slowThreshold || 1000, // 1 second slow threshold
            grep: options.grep || null, // Pattern to filter tests
            reporter: options.reporter || 'console',
            outputDir: options.outputDir || path.join(process.cwd(), 'test-results'),
            coverage: options.coverage || false,
            ...options
        };

        this.assertions = 0;
        this.startTime = null;
        this.suiteStartTime = null;
        this.testStartTime = null;

        // Test utilities
        this.utils = {
            createMock: this.createMock.bind(this),
            createStub: this.createStub.bind(this),
            createSpy: this.createSpy.bind(this),
            fakeTimers: this.fakeTimers.bind(this),
            restoreTimers: this.restoreTimers.bind(this)
        };

        console.log('Test Framework initialized');
    }

    /**
     * Define a test suite
     */
    describe(name, fn) {
        if (this.options.grep && !this.options.grep.test(name)) {
            return; // Skip this suite
        }

        const suite = {
            name,
            tests: [],
            beforeAll: [],
            afterAll: [],
            beforeEach: [],
            afterEach: [],
            duration: 0,
            passed: 0,
            failed: 0,
            skipped: 0
        };

        this.testResults.suites.push(suite);
        this.currentSuite = suite;

        this.suiteStartTime = Date.now();

        try {
            fn.call(this);
        } catch (error) {
            this.handleSuiteError(suite, error);
        } finally {
            suite.duration = Date.now() - this.suiteStartTime;
            this.currentSuite = null;
        }
    }

    /**
     * Define a test case
     */
    it(name, fn) {
        if (!this.currentSuite) {
            throw new Error('Test case must be defined within a describe block');
        }

        if (this.options.grep && !this.options.grep.test(name)) {
            this.currentSuite.tests.push({
                name,
                status: 'skipped',
                duration: 0,
                error: null
            });
            this.currentSuite.skipped++;
            this.testResults.skipped++;
            return;
        }

        const test = {
            name,
            status: 'pending',
            duration: 0,
            error: null,
            assertions: 0
        };

        this.currentSuite.tests.push(test);
        this.currentTest = test;
        this.testStartTime = Date.now();

        // Run beforeEach hooks
        for (const hook of this.currentSuite.beforeEach) {
            try {
                hook();
            } catch (error) {
                this.handleTestError(test, error, 'beforeEach hook failed');
                return;
            }
        }

        try {
            // Set up timeout
            const timeoutId = setTimeout(() => {
                this.handleTestError(test, new Error(`Test timeout after ${this.options.timeout}ms`), 'timeout');
            }, this.options.timeout);

            // Run the test
            const result = fn.call(this);

            // Handle async tests
            if (result && typeof result.then === 'function') {
                result
                    .then(() => {
                        clearTimeout(timeoutId);
                        this.completeTest(test);
                    })
                    .catch((error) => {
                        clearTimeout(timeoutId);
                        this.handleTestError(test, error);
                    });
            } else {
                clearTimeout(timeoutId);
                this.completeTest(test);
            }

        } catch (error) {
            this.handleTestError(test, error);
        } finally {
            // Run afterEach hooks
            for (const hook of this.currentSuite.afterEach) {
                try {
                    hook();
                } catch (error) {
                    console.warn(`afterEach hook failed: ${error.message}`);
                }
            }
        }
    }

    /**
     * Alias for it()
     */
    test(name, fn) {
        return this.it(name, fn);
    }

    /**
     * Skip a test
     */
    xit(name, fn) {
        if (!this.currentSuite) {
            throw new Error('Test case must be defined within a describe block');
        }

        this.currentSuite.tests.push({
            name,
            status: 'skipped',
            duration: 0,
            error: null
        });

        this.currentSuite.skipped++;
        this.testResults.skipped++;
    }

    /**
     * Mark test as pending
     */
    todo(name) {
        return this.xit(name);
    }

    /**
     * Run setup before all tests in suite
     */
    beforeAll(fn) {
        if (!this.currentSuite) {
            throw new Error('beforeAll must be called within a describe block');
        }
        this.currentSuite.beforeAll.push(fn);
    }

    /**
     * Run setup before each test
     */
    beforeEach(fn) {
        if (!this.currentSuite) {
            throw new Error('beforeEach must be called within a describe block');
        }
        this.currentSuite.beforeEach.push(fn);
    }

    /**
     * Run cleanup after each test
     */
    afterEach(fn) {
        if (!this.currentSuite) {
            throw new Error('afterEach must be called within a describe block');
        }
        this.currentSuite.afterEach.push(fn);
    }

    /**
     * Run cleanup after all tests in suite
     */
    afterAll(fn) {
        if (!this.currentSuite) {
            throw new Error('afterAll must be called within a describe block');
        }
        this.currentSuite.afterAll.push(fn);
    }

    /**
     * Assertion methods
     */
    expect(value) {
        return new Assertion(value, this);
    }

    /**
     * Complete a test successfully
     */
    completeTest(test) {
        test.duration = Date.now() - this.testStartTime;
        test.status = 'passed';

        this.currentSuite.passed++;
        this.testResults.passed++;

        if (this.options.verbose) {
            console.log(`✓ ${test.name} (${test.duration}ms)`);
        }

        // Check if test is slow
        if (test.duration > this.options.slowThreshold) {
            console.warn(`⚠ Slow test: ${test.name} (${test.duration}ms)`);
        }

        this.currentTest = null;
    }

    /**
     * Handle test error
     */
    handleTestError(test, error, context = '') {
        test.duration = Date.now() - this.testStartTime;
        test.status = 'failed';
        test.error = {
            message: error.message,
            stack: error.stack,
            context
        };

        this.currentSuite.failed++;
        this.testResults.failed++;
        this.testResults.errors.push({
            suite: this.currentSuite.name,
            test: test.name,
            error: test.error
        });

        console.error(`✗ ${test.name}: ${error.message}`);

        if (this.options.verbose) {
            console.error(error.stack);
        }

        this.currentTest = null;

        // Bail on first failure if configured
        if (this.options.bail) {
            throw error;
        }
    }

    /**
     * Handle suite error
     */
    handleSuiteError(suite, error) {
        console.error(`Suite error in "${suite.name}": ${error.message}`);
        suite.error = {
            message: error.message,
            stack: error.stack
        };
    }

    /**
     * Run all tests
     */
    async run() {
        console.log('Starting test execution...');
        this.startTime = Date.now();

        // Run beforeAll hooks
        for (const suite of this.testResults.suites) {
            for (const hook of suite.beforeAll) {
                try {
                    await hook();
                } catch (error) {
                    console.error(`beforeAll hook failed in ${suite.name}: ${error.message}`);
                }
            }
        }

        // Run afterAll hooks
        for (const suite of this.testResults.suites) {
            for (const hook of suite.afterAll) {
                try {
                    await hook();
                } catch (error) {
                    console.error(`afterAll hook failed in ${suite.name}: ${error.message}`);
                }
            }
        }

        this.testResults.duration = Date.now() - this.startTime;

        // Generate report
        await this.generateReport();

        return this.testResults;
    }

    /**
     * Generate test report
     */
    async generateReport() {
        const report = {
            summary: {
                total: this.testResults.total,
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                skipped: this.testResults.skipped,
                duration: this.testResults.duration,
                successRate: this.testResults.total > 0 ?
                    (this.testResults.passed / this.testResults.total * 100).toFixed(2) : 0
            },
            suites: this.testResults.suites,
            errors: this.testResults.errors
        };

        // Console output
        console.log('\n' + '='.repeat(50));
        console.log('TEST RESULTS');
        console.log('='.repeat(50));
        console.log(`Total: ${report.summary.total}`);
        console.log(`Passed: ${report.summary.passed}`);
        console.log(`Failed: ${report.summary.failed}`);
        console.log(`Skipped: ${report.summary.skipped}`);
        console.log(`Duration: ${report.summary.duration}ms`);
        console.log(`Success Rate: ${report.summary.successRate}%`);
        console.log('='.repeat(50));

        if (report.errors.length > 0) {
            console.log('\nFAILED TESTS:');
            report.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.suite} > ${error.test}`);
                console.log(`   ${error.error.message}`);
            });
        }

        // Save to file if output directory is specified
        if (this.options.outputDir) {
            try {
                await fs.mkdir(this.options.outputDir, { recursive: true });
                const reportPath = path.join(this.options.outputDir, `test-report-${Date.now()}.json`);
                await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
                console.log(`\nReport saved to: ${reportPath}`);
            } catch (error) {
                console.warn('Failed to save test report:', error.message);
            }
        }

        this.emit('complete', report);
        return report;
    }

    /**
     * Create a mock object
     */
    createMock(obj = {}) {
        const mock = { ...obj };

        mock.calls = [];
        mock.callCount = 0;

        const handler = {
            get(target, prop) {
                if (prop === 'calls') return target.calls;
                if (prop === 'callCount') return target.callCount;

                if (typeof target[prop] === 'function') {
                    return (...args) => {
                        target.calls.push({ prop, args });
                        target.callCount++;
                        return target[prop].apply(target, args);
                    };
                }

                return target[prop];
            }
        };

        return new Proxy(mock, handler);
    }

    /**
     * Create a stub function
     */
    createStub(returnValue = undefined) {
        const stub = (...args) => {
            stub.calls.push(args);
            stub.callCount++;
            return typeof returnValue === 'function' ? returnValue(...args) : returnValue;
        };

        stub.calls = [];
        stub.callCount = 0;
        stub.returns = (value) => {
            returnValue = value;
            return stub;
        };

        return stub;
    }

    /**
     * Create a spy function
     */
    createSpy(originalFn) {
        const spy = (...args) => {
            spy.calls.push(args);
            spy.callCount++;
            if (originalFn) {
                return originalFn.apply(this, args);
            }
        };

        spy.calls = [];
        spy.callCount = 0;

        return spy;
    }

    /**
     * Fake timers for testing
     */
    fakeTimers() {
        this.originalSetTimeout = global.setTimeout;
        this.originalSetInterval = global.setInterval;
        this.originalClearTimeout = global.clearTimeout;
        this.originalClearInterval = global.clearInterval;

        global.setTimeout = (fn, delay) => {
            // Immediately execute for testing
            fn();
            return { id: Math.random() };
        };

        global.setInterval = (fn, delay) => {
            fn();
            return { id: Math.random() };
        };

        global.clearTimeout = () => {};
        global.clearInterval = () => {};
    }

    /**
     * Restore original timers
     */
    restoreTimers() {
        if (this.originalSetTimeout) {
            global.setTimeout = this.originalSetTimeout;
            global.setInterval = this.originalSetInterval;
            global.clearTimeout = this.originalClearTimeout;
            global.clearInterval = this.originalClearInterval;
        }
    }

    /**
     * Get test statistics
     */
    getStats() {
        return {
            total: this.testResults.total,
            passed: this.testResults.passed,
            failed: this.testResults.failed,
            skipped: this.testResults.skipped,
            duration: this.testResults.duration,
            suites: this.testResults.suites.length,
            successRate: this.testResults.total > 0 ?
                (this.testResults.passed / this.testResults.total * 100) : 0
        };
    }
}

/**
 * Assertion class for fluent assertions
 */
class Assertion {
    constructor(value, testFramework) {
        this.value = value;
        this.testFramework = testFramework;
        this.negated = false;
    }

    /**
     * Negate the assertion
     */
    get not() {
        this.negated = !this.negated;
        return this;
    }

    /**
     * Assert equality
     */
    toBe(expected) {
        const passed = this.value === expected;
        this.assert(passed, `Expected ${this.value} to be ${expected}`);
        return this;
    }

    /**
     * Assert deep equality
     */
    toEqual(expected) {
        const passed = this.deepEqual(this.value, expected);
        this.assert(passed, `Expected ${JSON.stringify(this.value)} to equal ${JSON.stringify(expected)}`);
        return this;
    }

    /**
     * Assert truthiness
     */
    toBeTruthy() {
        const passed = !!this.value;
        this.assert(passed, `Expected ${this.value} to be truthy`);
        return this;
    }

    /**
     * Assert falsiness
     */
    toBeFalsy() {
        const passed = !this.value;
        this.assert(passed, `Expected ${this.value} to be falsy`);
        return this;
    }

    /**
     * Assert null
     */
    toBeNull() {
        const passed = this.value === null;
        this.assert(passed, `Expected ${this.value} to be null`);
        return this;
    }

    /**
     * Assert undefined
     */
    toBeUndefined() {
        const passed = this.value === undefined;
        this.assert(passed, `Expected ${this.value} to be undefined`);
        return this;
    }

    /**
     * Assert defined
     */
    toBeDefined() {
        const passed = this.value !== undefined;
        this.assert(passed, `Expected ${this.value} to be defined`);
        return this;
    }

    /**
     * Assert greater than
     */
    toBeGreaterThan(expected) {
        const passed = this.value > expected;
        this.assert(passed, `Expected ${this.value} to be greater than ${expected}`);
        return this;
    }

    /**
     * Assert less than
     */
    toBeLessThan(expected) {
        const passed = this.value < expected;
        this.assert(passed, `Expected ${this.value} to be less than ${expected}`);
        return this;
    }

    /**
     * Assert instance type
     */
    toBeInstanceOf(expected) {
        const passed = this.value instanceof expected;
        this.assert(passed, `Expected ${this.value} to be instance of ${expected.name}`);
        return this;
    }

    /**
     * Assert array to contain
     */
    toContain(expected) {
        const passed = Array.isArray(this.value) && this.value.includes(expected);
        this.assert(passed, `Expected ${JSON.stringify(this.value)} to contain ${expected}`);
        return this;
    }

    /**
     * Assert string to match regex
     */
    toMatch(expected) {
        const passed = typeof this.value === 'string' && expected.test(this.value);
        this.assert(passed, `Expected ${this.value} to match ${expected}`);
        return this;
    }

    /**
     * Assert array length
     */
    toHaveLength(expected) {
        const passed = Array.isArray(this.value) && this.value.length === expected;
        this.assert(passed, `Expected array to have length ${expected}, got ${this.value.length}`);
        return this;
    }

    /**
     * Assert object to have property
     */
    toHaveProperty(prop, value) {
        const hasProp = this.value && typeof this.value === 'object' && prop in this.value;
        let passed = hasProp;

        if (passed && value !== undefined) {
            passed = this.deepEqual(this.value[prop], value);
        }

        this.assert(passed, `Expected object to have property ${prop}${value !== undefined ? ` with value ${value}` : ''}`);
        return this;
    }

    /**
     * Assert function to throw
     */
    toThrow(expected) {
        let threw = false;
        let thrownError = null;

        try {
            if (typeof this.value === 'function') {
                this.value();
            }
        } catch (error) {
            threw = true;
            thrownError = error;
        }

        let passed = threw;
        if (passed && expected) {
            if (typeof expected === 'string') {
                passed = thrownError.message.includes(expected);
            } else if (expected instanceof RegExp) {
                passed = expected.test(thrownError.message);
            } else if (typeof expected === 'function') {
                passed = thrownError instanceof expected;
            }
        }

        this.assert(passed, `Expected function to throw${expected ? ` ${expected}` : ''}`);
        return this;
    }

    /**
     * Deep equality check
     */
    deepEqual(a, b) {
        if (a === b) return true;

        if (a == null || b == null) return a === b;

        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.deepEqual(a[i], b[i])) return false;
            }
            return true;
        }

        if (typeof a === 'object' && typeof b === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);

            if (keysA.length !== keysB.length) return false;

            for (const key of keysA) {
                if (!keysB.includes(key)) return false;
                if (!this.deepEqual(a[key], b[key])) return false;
            }

            return true;
        }

        return false;
    }

    /**
     * Execute assertion
     */
    assert(passed, message) {
        this.testFramework.assertions++;

        if (this.negated) {
            passed = !passed;
            message = message.replace('Expected', 'Expected not');
        }

        if (!passed) {
            throw new Error(message);
        }
    }
}

module.exports = TestFramework;
