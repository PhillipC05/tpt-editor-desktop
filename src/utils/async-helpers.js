/**
 * TPT Asset Editor Desktop - Async Utilities
 * Promise and asynchronous operation helpers
 */

class AsyncUtils {
    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create a timeout promise that rejects after specified time
     * @param {number} ms - Timeout in milliseconds
     * @param {string} [message='Operation timed out'] - Timeout error message
     * @returns {Promise<never>}
     */
    static timeout(ms, message = 'Operation timed out') {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error(message)), ms);
        });
    }

    /**
     * Add timeout to a promise
     * @param {Promise} promise - Promise to add timeout to
     * @param {number} ms - Timeout in milliseconds
     * @param {string} [message='Operation timed out'] - Timeout error message
     * @returns {Promise} Promise that rejects if timeout is exceeded
     */
    static withTimeout(promise, ms, message = 'Operation timed out') {
        return Promise.race([
            promise,
            this.timeout(ms, message)
        ]);
    }

    /**
     * Retry an async operation with exponential backoff
     * @param {Function} operation - Async operation to retry
     * @param {Object} [options={}] - Retry options
     * @param {number} [options.maxRetries=3] - Maximum number of retries
     * @param {number} [options.initialDelay=1000] - Initial delay in milliseconds
     * @param {number} [options.backoffFactor=2] - Backoff multiplier
     * @param {number} [options.maxDelay=30000] - Maximum delay between retries
     * @param {Function} [options.shouldRetry] - Function to determine if error should be retried
     * @returns {Promise} Result of the operation
     */
    static async retry(operation, options = {}) {
        const {
            maxRetries = 3,
            initialDelay = 1000,
            backoffFactor = 2,
            maxDelay = 30000,
            shouldRetry = () => true
        } = options;

        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                // Don't retry if this is the last attempt or error shouldn't be retried
                if (attempt === maxRetries || !shouldRetry(error)) {
                    throw error;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt), maxDelay);
                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    /**
     * Execute operations in batches with concurrency control
     * @param {Array} items - Array of items to process
     * @param {Function} operation - Async operation to execute on each item
     * @param {Object} [options={}] - Batch options
     * @param {number} [options.concurrency=3] - Maximum concurrent operations
     * @param {number} [options.batchSize] - Process items in batches
     * @param {Function} [options.onProgress] - Progress callback function
     * @param {Function} [options.onError] - Error callback function
     * @returns {Promise<Array>} Array of results
     */
    static async batch(items, operation, options = {}) {
        const {
            concurrency = 3,
            batchSize,
            onProgress,
            onError
        } = options;

        const results = [];
        const errors = [];

        if (batchSize) {
            // Process in batches
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize);
                const batchResults = await this._processBatch(batch, operation, concurrency, onError);
                results.push(...batchResults);

                if (onProgress) {
                    onProgress(Math.min(i + batchSize, items.length), items.length);
                }
            }
        } else {
            // Process all with concurrency control
            const batchResults = await this._processBatch(items, operation, concurrency, onError);
            results.push(...batchResults);

            if (onProgress) {
                onProgress(items.length, items.length);
            }
        }

        return results;
    }

    /**
     * Internal method to process a batch with concurrency control
     * @private
     */
    static async _processBatch(items, operation, concurrency, onError) {
        const results = [];
        const semaphore = new Semaphore(concurrency);

        const promises = items.map(async (item, index) => {
            const release = await semaphore.acquire();

            try {
                const result = await operation(item, index);
                results[index] = result;
                return result;
            } catch (error) {
                if (onError) {
                    onError(error, item, index);
                }
                results[index] = null; // Mark as failed
                throw error;
            } finally {
                release();
            }
        });

        await Promise.allSettled(promises);
        return results;
    }

    /**
     * Execute operations sequentially
     * @param {Array} items - Array of items to process
     * @param {Function} operation - Async operation to execute on each item
     * @param {Object} [options={}] - Options
     * @param {Function} [options.onProgress] - Progress callback function
     * @param {Function} [options.onError] - Error callback function
     * @returns {Promise<Array>} Array of results
     */
    static async sequential(items, operation, options = {}) {
        const { onProgress, onError } = options;
        const results = [];

        for (let i = 0; i < items.length; i++) {
            try {
                const result = await operation(items[i], i);
                results.push(result);

                if (onProgress) {
                    onProgress(i + 1, items.length);
                }
            } catch (error) {
                if (onError) {
                    onError(error, items[i], i);
                }
                results.push(null); // Mark as failed
            }
        }

        return results;
    }

    /**
     * Create a debounced version of an async function
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @param {Object} [options={}] - Debounce options
     * @param {boolean} [options.leading=false] - Whether to execute on leading edge
     * @returns {Function} Debounced function
     */
    static debounce(func, delay, options = {}) {
        const { leading = false } = options;
        let timeoutId;
        let lastArgs;
        let lastThis;
        let result;
        let lastCallTime;
        let lastInvokeTime = 0;

        function invokeFunc(time) {
            const args = lastArgs;
            const thisArg = lastThis;

            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function leadingEdge(time) {
            lastInvokeTime = time;
            timeoutId = setTimeout(timerExpired, delay);
            return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
            const timeSinceLastCall = time - lastCallTime;
            const timeSinceLastInvoke = time - lastInvokeTime;
            const timeWaiting = delay - timeSinceLastCall;

            return timeWaiting;
        }

        function shouldInvoke(time) {
            const timeSinceLastCall = time - lastCallTime;
            const timeSinceLastInvoke = time - lastInvokeTime;

            return (lastCallTime === undefined || (timeSinceLastCall >= delay) ||
                    (timeSinceLastCall < 0) || (leading && timeSinceLastInvoke >= delay));
        }

        function timerExpired() {
            const time = Date.now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            timeoutId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
            timeoutId = undefined;

            if (lastArgs) {
                return invokeFunc(time);
            }
            lastArgs = lastThis = undefined;
            return result;
        }

        function cancel() {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timeoutId = undefined;
        }

        function flush() {
            return timeoutId === undefined ? result : trailingEdge(Date.now());
        }

        function debounced(...args) {
            const time = Date.now();
            const isInvoking = shouldInvoke(time);

            lastArgs = args;
            lastThis = this;
            lastCallTime = time;

            if (isInvoking) {
                if (timeoutId === undefined) {
                    return leadingEdge(lastCallTime);
                }
                if (leading) {
                    timeoutId = setTimeout(timerExpired, delay);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timeoutId === undefined) {
                timeoutId = setTimeout(timerExpired, delay);
            }
            return result;
        }

        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
    }

    /**
     * Create a throttled version of an async function
     * @param {Function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @param {Object} [options={}] - Throttle options
     * @param {boolean} [options.leading=true] - Whether to execute on leading edge
     * @param {boolean} [options.trailing=true] - Whether to execute on trailing edge
     * @returns {Function} Throttled function
     */
    static throttle(func, delay, options = {}) {
        const { leading = true, trailing = true } = options;
        let lastExecTime = 0;
        let timeoutId;
        let lastArgs;
        let lastThis;

        function invokeFunc(time) {
            lastExecTime = time;
            timeoutId = undefined;
            const args = lastArgs;
            const thisArg = lastThis;
            lastArgs = lastThis = undefined;
            return func.apply(thisArg, args);
        }

        function leadingEdge(time) {
            lastExecTime = time;
            timeoutId = setTimeout(timerExpired, delay);
            return leading ? invokeFunc(time) : undefined;
        }

        function remainingWait(time) {
            const timeSinceLastExec = time - lastExecTime;
            return delay - timeSinceLastExec;
        }

        function shouldInvoke(time) {
            const timeSinceLastExec = time - lastExecTime;
            return timeSinceLastExec >= delay;
        }

        function timerExpired() {
            const time = Date.now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            timeoutId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
            timeoutId = undefined;

            if (trailing && lastArgs) {
                return invokeFunc(time);
            }
            lastArgs = lastThis = undefined;
            return undefined;
        }

        function cancel() {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
            lastExecTime = 0;
            lastArgs = lastThis = timeoutId = undefined;
        }

        function flush() {
            return timeoutId === undefined ? undefined : trailingEdge(Date.now());
        }

        function throttled(...args) {
            const time = Date.now();

            if (shouldInvoke(time)) {
                return leadingEdge(time);
            }

            lastArgs = args;
            lastThis = this;

            if (timeoutId === undefined) {
                timeoutId = setTimeout(timerExpired, remainingWait(time));
            }

            return undefined;
        }

        throttled.cancel = cancel;
        throttled.flush = flush;
        return throttled;
    }

    /**
     * Create a promise that resolves after a condition is met
     * @param {Function} condition - Function that returns true when condition is met
     * @param {Object} [options={}] - Options
     * @param {number} [options.interval=100] - Check interval in milliseconds
     * @param {number} [options.timeout=10000] - Maximum time to wait
     * @param {string} [options.timeoutMessage='Condition not met within timeout'] - Timeout error message
     * @returns {Promise} Promise that resolves when condition is met
     */
    static waitFor(condition, options = {}) {
        const { interval = 100, timeout = 10000, timeoutMessage = 'Condition not met within timeout' } = options;

        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkCondition = () => {
                try {
                    if (condition()) {
                        resolve();
                        return;
                    }

                    if (Date.now() - startTime >= timeout) {
                        reject(new Error(timeoutMessage));
                        return;
                    }

                    setTimeout(checkCondition, interval);
                } catch (error) {
                    reject(error);
                }
            };

            checkCondition();
        });
    }

    /**
     * Execute promises with a timeout for each
     * @param {Promise[]} promises - Array of promises
     * @param {number} timeoutMs - Timeout in milliseconds for each promise
     * @returns {Promise<Array>} Array of settled promise results
     */
    static async allWithTimeout(promises, timeoutMs) {
        const timeoutPromises = promises.map(promise =>
            this.withTimeout(promise, timeoutMs)
        );

        return Promise.allSettled(timeoutPromises);
    }

    /**
     * Create a promise that can be resolved/rejected externally
     * @returns {Object} Object with promise, resolve, and reject functions
     */
    static createDeferred() {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });

        return { promise, resolve, reject };
    }

    /**
     * Execute a function with a cleanup callback
     * @param {Function} executor - Function that returns cleanup function
     * @returns {Promise} Promise that resolves after cleanup
     */
    static async withCleanup(executor) {
        let cleanup;
        try {
            cleanup = await executor();
            return await cleanup();
        } catch (error) {
            if (cleanup) {
                try {
                    await cleanup();
                } catch (cleanupError) {
                    // Log cleanup error but don't override original error
                    console.warn('Cleanup failed:', cleanupError);
                }
            }
            throw error;
        }
    }

    /**
     * Create a rate limiter for async operations
     * @param {number} maxOperations - Maximum operations per time window
     * @param {number} timeWindow - Time window in milliseconds
     * @returns {Function} Rate limited function wrapper
     */
    static createRateLimiter(maxOperations, timeWindow) {
        const operations = [];
        let timeoutId;

        return async function rateLimited(operation) {
            const now = Date.now();

            // Remove operations outside the time window
            while (operations.length > 0 && operations[0] < now - timeWindow) {
                operations.shift();
            }

            // If we've exceeded the rate limit, wait
            if (operations.length >= maxOperations) {
                const waitTime = timeWindow - (now - operations[0]);
                await this.sleep(waitTime);
            }

            // Execute the operation
            operations.push(Date.now());
            return operation();
        }.bind(this);
    }

    /**
     * Execute operations in a pool with resource limits
     * @param {Array} items - Items to process
     * @param {Function} operation - Operation to execute
     * @param {number} poolSize - Maximum concurrent operations
     * @returns {Promise<Array>} Results array
     */
    static async pool(items, operation, poolSize) {
        const results = [];
        const pool = new Set();

        for (const item of items) {
            if (pool.size >= poolSize) {
                await Promise.race(pool);
            }

            const promise = operation(item).then(result => {
                pool.delete(promise);
                return result;
            });

            pool.add(promise);
            results.push(promise);
        }

        return Promise.all(results);
    }
}

/**
 * Simple semaphore implementation for concurrency control
 * @private
 */
class Semaphore {
    constructor(count) {
        this.count = count;
        this.waiting = [];
    }

    async acquire() {
        if (this.count > 0) {
            this.count--;
            return () => this.release();
        }

        return new Promise(resolve => {
            this.waiting.push(() => {
                this.count--;
                resolve(() => this.release());
            });
        });
    }

    release() {
        this.count++;
        if (this.waiting.length > 0) {
            const next = this.waiting.shift();
            next();
        }
    }
}

module.exports = AsyncUtils;
