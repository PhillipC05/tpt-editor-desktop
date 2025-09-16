/**
 * Asynchronous operation utilities with TypeScript support
 * Provides type-safe async/await helpers and utilities
 */

import { PerformanceMetrics } from '../types/index.js';

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a timeout promise that rejects after the specified time
 */
export function timeout<T>(promise: Promise<T>, ms: number, message = 'Operation timed out'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    )
  ]);
}

/**
 * Retry an async operation with exponential backoff
 */
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: Error) => boolean;
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryCondition = () => true
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry if this is the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Check if we should retry this error
      if (!retryCondition(lastError)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Execute operations in parallel with concurrency control
 */
export async function parallel<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const promise = (async () => {
      try {
        const result = await task();
        results.push(result);
      } catch (error) {
        // Handle individual task errors
        console.error('Task failed:', error);
        throw error;
      }
    })();

    results.push(promise as any); // Type assertion for simplicity

    if (tasks.length >= concurrency) {
      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }
  }

  await Promise.allSettled(executing);
  return results.filter(result => !(result instanceof Promise));
}

/**
 * Execute operations sequentially
 */
export async function sequential<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
  const results: T[] = [];

  for (const task of tasks) {
    try {
      const result = await task();
      results.push(result);
    } catch (error) {
      console.error('Sequential task failed:', error);
      throw error;
    }
  }

  return results;
}

/**
 * Create a debounced version of an async function
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, wait);
    });
  };
}

/**
 * Create a throttled version of an async function
 */
export function throttleAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  let inThrottle = false;

  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    if (!inThrottle) {
      inThrottle = true;
      try {
        const result = await func(...args);
        return result;
      } finally {
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    }
    return null;
  };
}

/**
 * Measure execution time of an async operation
 */
export async function measureExecutionTime<T>(
  operation: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number; performance: PerformanceMetrics }> {
  const startTime = process.hrtime.bigint();
  const startUsage = process.cpuUsage();
  const startMemory = process.memoryUsage();

  try {
    const result = await operation();
    const endTime = process.hrtime.bigint();
    const endUsage = process.cpuUsage(startUsage);
    const endMemory = process.memoryUsage();

    const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

    const performance: PerformanceMetrics = {
      memoryUsage: endMemory,
      cpuUsage: endUsage,
      uptime: process.uptime(),
      eventLoopLag: 0 // Would need additional measurement
    };

    if (label) {
      console.log(`${label} completed in ${duration.toFixed(2)}ms`);
    }

    return { result, duration, performance };
  } catch (error) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000;

    if (label) {
      console.error(`${label} failed after ${duration.toFixed(2)}ms:`, error);
    }

    throw error;
  }
}

/**
 * Create a promise that resolves after a minimum time
 */
export function withMinimumDelay<T>(promise: Promise<T>, minDelay: number): Promise<T> {
  const startTime = Date.now();

  return Promise.all([
    promise,
    sleep(minDelay)
  ]).then(([result]) => {
    const elapsed = Date.now() - startTime;
    if (elapsed < minDelay) {
      return sleep(minDelay - elapsed).then(() => result);
    }
    return result;
  });
}

/**
 * Execute with timeout and retry logic
 */
export async function executeWithTimeoutAndRetry<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  const operationWithTimeout = () => timeout(operation(), timeoutMs);
  return retry(operationWithTimeout, retryOptions);
}

/**
 * Create a cancellable promise
 */
export interface CancellablePromise<T> {
  promise: Promise<T>;
  cancel: () => void;
  isCancelled: () => boolean;
}

export function createCancellablePromise<T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void,
    onCancel: (callback: () => void) => void
  ) => void
): CancellablePromise<T> {
  let isCancelled = false;
  let cancelCallback: (() => void) | null = null;

  const promise = new Promise<T>((resolve, reject) => {
    executor(
      resolve,
      reject,
      (callback) => {
        cancelCallback = callback;
      }
    );
  });

  const cancel = () => {
    isCancelled = true;
    if (cancelCallback) {
      cancelCallback();
    }
  };

  return {
    promise: promise.then(result => {
      if (isCancelled) {
        throw new Error('Operation was cancelled');
      }
      return result;
    }),
    cancel,
    isCancelled: () => isCancelled
  };
}

/**
 * Execute operations with progress tracking
 */
export interface ProgressCallback {
  (completed: number, total: number, message?: string): void;
}

export async function executeWithProgress<T>(
  operations: (() => Promise<T>)[],
  onProgress?: ProgressCallback,
  concurrency: number = 3
): Promise<T[]> {
  const results: T[] = [];
  let completed = 0;
  const total = operations.length;

  onProgress?.(0, total, 'Starting operations...');

  const executeOperation = async (operation: () => Promise<T>): Promise<void> => {
    try {
      const result = await operation();
      results.push(result);
      completed++;
      onProgress?.(completed, total, `Completed ${completed}/${total} operations`);
    } catch (error) {
      completed++;
      onProgress?.(completed, total, `Failed ${completed}/${total} operations`);
      throw error;
    }
  };

  // Execute operations with concurrency control
  const chunks = [];
  for (let i = 0; i < operations.length; i += concurrency) {
    chunks.push(operations.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.allSettled(chunk.map(executeOperation));
  }

  onProgress?.(total, total, 'All operations completed');
  return results;
}

/**
 * Create a promise that resolves when any of the promises resolve
 */
export function raceWithContext<T>(
  promises: Promise<T>[],
  context?: string
): Promise<{ result: T; index: number }> {
  return Promise.race(
    promises.map((promise, index) =>
      promise.then(result => ({ result, index }))
    )
  );
}

/**
 * Execute with circuit breaker pattern
 */
export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.options.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  getFailureCount(): number {
    return this.failures;
  }
}

// Export default async helpers for backward compatibility
export default {
  sleep,
  timeout,
  retry,
  parallel,
  sequential,
  debounceAsync,
  throttleAsync,
  measureExecutionTime,
  withMinimumDelay,
  executeWithTimeoutAndRetry,
  createCancellablePromise,
  executeWithProgress,
  raceWithContext,
  CircuitBreaker
};
