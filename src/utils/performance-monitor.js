/**
 * Performance Monitor for TPT Asset Editor Desktop
 * Tracks performance metrics for asset generation and application usage
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
  }

  /**
   * Start timing an operation
   * @param {string} operationId - Unique identifier for the operation
   * @param {string} operationName - Name of the operation
   */
  startTimer(operationId, operationName) {
    this.timers.set(operationId, {
      name: operationName,
      startTime: process.hrtime.bigint()
    });
  }

  /**
   * Stop timing an operation and record the result
   * @param {string} operationId - Unique identifier for the operation
   * @returns {Object} Performance data for the operation
   */
  stopTimer(operationId) {
    const timer = this.timers.get(operationId);
    if (!timer) {
      console.warn(`No timer found for operation ID: ${operationId}`);
      return null;
    }

    const endTime = process.hrtime.bigint();
    const durationNs = endTime - timer.startTime;
    const durationMs = Number(durationNs) / 1000000;

    const performanceData = {
      operationId,
      operationName: timer.name,
      durationMs,
      timestamp: new Date().toISOString()
    };

    // Store the metric
    if (!this.metrics.has(timer.name)) {
      this.metrics.set(timer.name, []);
    }
    this.metrics.get(timer.name).push(performanceData);

    // Clean up the timer
    this.timers.delete(operationId);

    return performanceData;
  }

  /**
   * Record a custom metric
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   * @param {Object} metadata - Additional metadata
   */
  recordMetric(metricName, value, metadata = {}) {
    const metricData = {
      metricName,
      value,
      metadata,
      timestamp: new Date().toISOString()
    };

    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }
    this.metrics.get(metricName).push(metricData);

    return metricData;
  }

  /**
   * Get memory usage statistics
   * @returns {Object} Memory usage information
   */
  getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get CPU usage information
   * @returns {Object} CPU usage information
   */
  getCpuUsage() {
    const cpuUsage = process.cpuUsage();
    return {
      user: cpuUsage.user / 1000, // ms
      system: cpuUsage.system / 1000, // ms
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get performance statistics for an operation
   * @param {string} operationName - Name of the operation
   * @returns {Object} Statistics for the operation
   */
  getOperationStats(operationName) {
    const metrics = this.metrics.get(operationName);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.durationMs);
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    const average = total / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      operationName,
      count: durations.length,
      totalMs: Math.round(total * 100) / 100,
      averageMs: Math.round(average * 100) / 100,
      minMs: Math.round(min * 100) / 100,
      maxMs: Math.round(max * 100) / 100,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get all performance metrics
   * @returns {Map} All performance metrics
   */
  getAllMetrics() {
    const stats = new Map();
    for (const [operationName] of this.metrics) {
      stats.set(operationName, this.getOperationStats(operationName));
    }
    return stats;
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
    this.timers.clear();
  }

  /**
   * Export metrics to JSON
   * @returns {string} JSON string of all metrics
   */
  exportMetrics() {
    const exportData = {
      metrics: {},
      timestamp: new Date().toISOString()
    };

    for (const [key, value] of this.metrics) {
      exportData.metrics[key] = value;
    }

    return JSON.stringify(exportData, null, 2);
  }
}

module.exports = PerformanceMonitor;