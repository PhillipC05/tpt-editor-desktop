/**
 * TPT Asset Editor Desktop - CPU Throttling Integration
 * Integrates CPU monitoring with background processing and other components
 */

const CPUMonitor = require('./cpu-monitor');
const AsyncUtils = require('./async-helpers');

class CPUThrottlingIntegration {
    /**
     * Creates a new CPU throttling integration instance
     * @param {Object} [options={}] - Integration options
     * @param {CPUMonitor} [options.cpuMonitor] - Existing CPU monitor instance
     * @param {Object} [options.throttlingOptions] - CPU monitor options
     */
    constructor(options = {}) {
        this.options = {
            enableAutoThrottling: true,
            throttleBackgroundTasks: true,
            throttleGenerators: true,
            throttleFileOperations: false,
            ...options
        };

        // Initialize CPU monitor
        this.cpuMonitor = options.cpuMonitor || new CPUMonitor(options.throttlingOptions);

        // Throttling state
        this.isEnabled = false;
        this.throttledComponents = new Map();

        // Bind methods
        this.enableThrottling = this.enableThrottling.bind(this);
        this.disableThrottling = this.disableThrottling.bind(this);
        this.registerComponent = this.registerComponent.bind(this);
        this.unregisterComponent = this.unregisterComponent.bind(this);
        this.createThrottledWrapper = this.createThrottledWrapper.bind(this);
        this.getThrottlingStatus = this.getThrottlingStatus.bind(this);
    }

    /**
     * Enable CPU throttling integration
     */
    enableThrottling() {
        if (this.isEnabled) return;

        this.isEnabled = true;

        // Start CPU monitoring if not already started
        if (!this.cpuMonitor.isMonitoring) {
            this.cpuMonitor.startMonitoring();
        }

        // Set up event listeners for CPU monitor
        this.setupCPUEventListeners();

        console.log('CPU throttling integration enabled');
    }

    /**
     * Disable CPU throttling integration
     */
    disableThrottling() {
        if (!this.isEnabled) return;

        this.isEnabled = false;

        // Remove event listeners
        this.removeCPUEventListeners();

        // Reset all throttled components
        this.resetAllThrottling();

        console.log('CPU throttling integration disabled');
    }

    /**
     * Set up CPU monitor event listeners
     */
    setupCPUEventListeners() {
        // Listen for high CPU usage
        this.cpuMonitor.on('high', (data) => {
            this.handleHighCPU(data);
        });

        // Listen for critical CPU usage
        this.cpuMonitor.on('critical', (data) => {
            this.handleCriticalCPU(data);
        });

        // Listen for normal CPU usage
        this.cpuMonitor.on('normal', (data) => {
            this.handleNormalCPU(data);
        });

        // Listen for throttle level changes
        this.cpuMonitor.on('throttleLevelChanged', (data) => {
            this.handleThrottleLevelChange(data);
        });
    }

    /**
     * Remove CPU monitor event listeners
     */
    removeCPUEventListeners() {
        // Remove all listeners by creating new instances of listeners
        this.cpuMonitor.listeners.clear();
    }

    /**
     * Handle high CPU usage event
     * @param {Object} data - CPU usage data
     */
    handleHighCPU(data) {
        console.warn(`High CPU usage detected: ${data.usage.toFixed(1)}%`);

        if (this.options.enableAutoThrottling) {
            this.applyThrottlingLevel(1);
        }

        // Emit event for external handling
        this.emit('highCPU', data);
    }

    /**
     * Handle critical CPU usage event
     * @param {Object} data - CPU usage data
     */
    handleCriticalCPU(data) {
        console.error(`Critical CPU usage detected: ${data.usage.toFixed(1)}%`);

        if (this.options.enableAutoThrottling) {
            this.applyThrottlingLevel(2);
        }

        // Emit event for external handling
        this.emit('criticalCPU', data);
    }

    /**
     * Handle normal CPU usage event
     * @param {Object} data - CPU usage data
     */
    handleNormalCPU(data) {
        console.log(`CPU usage returned to normal: ${data.usage.toFixed(1)}%`);

        if (this.options.enableAutoThrottling) {
            this.applyThrottlingLevel(0);
        }

        // Emit event for external handling
        this.emit('normalCPU', data);
    }

    /**
     * Handle throttle level change event
     * @param {Object} data - Throttle level change data
     */
    handleThrottleLevelChange(data) {
        console.log(`Throttle level changed from ${data.oldLevel} to ${data.newLevel}`);

        // Emit event for external handling
        this.emit('throttleLevelChanged', data);
    }

    /**
     * Apply throttling level to all registered components
     * @param {number} level - Throttling level (0-3)
     */
    applyThrottlingLevel(level) {
        for (const [componentName, component] of this.throttledComponents) {
            if (component.setThrottleLevel) {
                component.setThrottleLevel(level);
            }
        }

        this.emit('throttlingLevelApplied', { level });
    }

    /**
     * Reset all throttling to normal levels
     */
    resetAllThrottling() {
        for (const [componentName, component] of this.throttledComponents) {
            if (component.resetThrottling) {
                component.resetThrottling();
            }
        }

        this.emit('throttlingReset');
    }

    /**
     * Register a component for CPU throttling
     * @param {string} name - Component name
     * @param {Object} component - Component instance
     * @param {Object} [options={}] - Registration options
     */
    registerComponent(name, component, options = {}) {
        if (this.throttledComponents.has(name)) {
            console.warn(`Component ${name} is already registered for throttling`);
            return;
        }

        const componentConfig = {
            component,
            options: {
                throttleBackgroundTasks: this.options.throttleBackgroundTasks,
                throttleGenerators: this.options.throttleGenerators,
                throttleFileOperations: this.options.throttleFileOperations,
                ...options
            }
        };

        this.throttledComponents.set(name, componentConfig);

        // Initialize throttling for the component
        this.initializeComponentThrottling(name, componentConfig);

        console.log(`Component ${name} registered for CPU throttling`);
        this.emit('componentRegistered', { name, component, options });
    }

    /**
     * Unregister a component from CPU throttling
     * @param {string} name - Component name
     */
    unregisterComponent(name) {
        if (!this.throttledComponents.has(name)) {
            console.warn(`Component ${name} is not registered for throttling`);
            return;
        }

        const componentConfig = this.throttledComponents.get(name);

        // Reset throttling for the component
        if (componentConfig.component.resetThrottling) {
            componentConfig.component.resetThrottling();
        }

        this.throttledComponents.delete(name);

        console.log(`Component ${name} unregistered from CPU throttling`);
        this.emit('componentUnregistered', { name });
    }

    /**
     * Initialize throttling for a component
     * @param {string} name - Component name
     * @param {Object} componentConfig - Component configuration
     */
    initializeComponentThrottling(name, componentConfig) {
        const { component, options } = componentConfig;

        // Add throttling methods to the component if they don't exist
        if (!component.setThrottleLevel) {
            component.setThrottleLevel = (level) => {
                this.setComponentThrottleLevel(component, level, options);
            };
        }

        if (!component.resetThrottling) {
            component.resetThrottling = () => {
                this.setComponentThrottleLevel(component, 0, options);
            };
        }

        // Set initial throttle level
        component.setThrottleLevel(this.cpuMonitor.throttleLevel);
    }

    /**
     * Set throttle level for a specific component
     * @param {Object} component - Component instance
     * @param {number} level - Throttle level
     * @param {Object} options - Component options
     */
    setComponentThrottleLevel(component, level, options) {
        // Apply different throttling strategies based on component type
        if (options.throttleBackgroundTasks && component.pauseBackgroundTasks) {
            this.applyBackgroundTaskThrottling(component, level);
        }

        if (options.throttleGenerators && component.throttleGeneration) {
            this.applyGeneratorThrottling(component, level);
        }

        if (options.throttleFileOperations && component.throttleFileOperations) {
            this.applyFileOperationThrottling(component, level);
        }
    }

    /**
     * Apply background task throttling
     * @param {Object} component - Component instance
     * @param {number} level - Throttle level
     */
    applyBackgroundTaskThrottling(component, level) {
        switch (level) {
            case 0: // No throttling
                component.pauseBackgroundTasks(false);
                break;
            case 1: // Light throttling
                component.setBackgroundTaskDelay(100);
                break;
            case 2: // High throttling
                component.setBackgroundTaskDelay(500);
                component.pauseBackgroundTasks(true);
                break;
            case 3: // Critical throttling
                component.setBackgroundTaskDelay(2000);
                component.pauseBackgroundTasks(true);
                break;
        }
    }

    /**
     * Apply generator throttling
     * @param {Object} component - Component instance
     * @param {number} level - Throttle level
     */
    applyGeneratorThrottling(component, level) {
        switch (level) {
            case 0: // No throttling
                component.throttleGeneration(1);
                break;
            case 1: // Light throttling
                component.throttleGeneration(0.7);
                break;
            case 2: // High throttling
                component.throttleGeneration(0.3);
                break;
            case 3: // Critical throttling
                component.throttleGeneration(0.1);
                break;
        }
    }

    /**
     * Apply file operation throttling
     * @param {Object} component - Component instance
     * @param {number} level - Throttle level
     */
    applyFileOperationThrottling(component, level) {
        switch (level) {
            case 0: // No throttling
                component.throttleFileOperations(1);
                break;
            case 1: // Light throttling
                component.throttleFileOperations(0.8);
                break;
            case 2: // High throttling
                component.throttleFileOperations(0.5);
                break;
            case 3: // Critical throttling
                component.throttleFileOperations(0.2);
                break;
        }
    }

    /**
     * Create a throttled wrapper for a function
     * @param {Function} func - Function to wrap
     * @param {Object} [options={}] - Throttling options
     * @returns {Function} Throttled function
     */
    createThrottledWrapper(func, options = {}) {
        const throttledFunc = this.cpuMonitor.createThrottledFunction(func, options);

        // Add additional throttling logic
        return async (...args) => {
            if (!this.isEnabled) {
                return func(...args);
            }

            return throttledFunc(...args);
        };
    }

    /**
     * Get current throttling status
     * @returns {Object} Throttling status information
     */
    getThrottlingStatus() {
        return {
            isEnabled: this.isEnabled,
            cpuStats: this.cpuMonitor.getStatistics(),
            registeredComponents: Array.from(this.throttledComponents.keys()),
            throttleLevel: this.cpuMonitor.throttleLevel,
            isThrottling: this.cpuMonitor.isThrottling
        };
    }

    /**
     * Configure throttling options
     * @param {Object} options - New options
     */
    configure(options) {
        this.options = { ...this.options, ...options };

        // Re-apply throttling with new options
        if (this.isEnabled) {
            this.applyThrottlingLevel(this.cpuMonitor.throttleLevel);
        }

        this.emit('configurationChanged', options);
    }

    /**
     * Event emitter methods
     */
    on(event, listener) {
        if (!this.listeners) {
            this.listeners = new Map();
        }
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(listener);
    }

    off(event, listener) {
        if (!this.listeners) return;
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (!this.listeners) return;
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`Error in CPU throttling integration event listener:`, error);
                }
            });
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.disableThrottling();
        this.throttledComponents.clear();
        this.listeners?.clear();
    }

    /**
     * Create integration with background processor
     * @param {Object} backgroundProcessor - Background processor instance
     * @returns {Object} Integration methods
     */
    static integrateWithBackgroundProcessor(backgroundProcessor) {
        return {
            registerForThrottling: (cpuIntegration) => {
                cpuIntegration.registerComponent('backgroundProcessor', backgroundProcessor, {
                    throttleBackgroundTasks: true
                });

                // Add throttling methods to background processor
                backgroundProcessor.setThrottleLevel = (level) => {
                    switch (level) {
                        case 0:
                            backgroundProcessor.setConcurrency(3);
                            backgroundProcessor.resume();
                            break;
                        case 1:
                            backgroundProcessor.setConcurrency(2);
                            break;
                        case 2:
                            backgroundProcessor.setConcurrency(1);
                            backgroundProcessor.pause();
                            break;
                        case 3:
                            backgroundProcessor.setConcurrency(1);
                            backgroundProcessor.pause();
                            break;
                    }
                };

                backgroundProcessor.resetThrottling = () => {
                    backgroundProcessor.setThrottleLevel(0);
                };
            }
        };
    }

    /**
     * Create integration with generator service
     * @param {Object} generatorService - Generator service instance
     * @returns {Object} Integration methods
     */
    static integrateWithGeneratorService(generatorService) {
        return {
            registerForThrottling: (cpuIntegration) => {
                cpuIntegration.registerComponent('generatorService', generatorService, {
                    throttleGenerators: true
                });

                // Add throttling methods to generator service
                generatorService.setThrottleLevel = (level) => {
                    switch (level) {
                        case 0:
                            generatorService.setMaxConcurrentGenerations(3);
                            break;
                        case 1:
                            generatorService.setMaxConcurrentGenerations(2);
                            break;
                        case 2:
                            generatorService.setMaxConcurrentGenerations(1);
                            break;
                        case 3:
                            generatorService.setMaxConcurrentGenerations(1);
                            generatorService.pauseAllGenerations();
                            break;
                    }
                };

                generatorService.resetThrottling = () => {
                    generatorService.setThrottleLevel(0);
                };
            }
        };
    }
}

module.exports = CPUThrottlingIntegration;
