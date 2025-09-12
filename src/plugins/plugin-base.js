/**
 * Plugin Base Class for TPT Asset Editor Desktop
 * Base class that all plugins should extend
 */

class PluginBase {
  /**
   * Constructor
   * @param {Object} options - Plugin options
   */
  constructor(options = {}) {
    this.options = options;
    this.eventListeners = new Map();
    this.generators = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the plugin
   * Override this method in your plugin
   */
  async init() {
    // Override in subclass
    this.initialized = true;
  }

  /**
   * Clean up resources when plugin is unloaded
   * Override this method in your plugin
   */
  async destroy() {
    // Override in subclass
    this.initialized = false;
  }

  /**
   * Register an event listener
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler function
   */
  registerEventListener(eventName, handler) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(handler);
    
    // In a real implementation, this would register with the main event system
    console.log(`Registered event listener for ${eventName}`);
  }

  /**
   * Unregister an event listener
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler function
   */
  unregisterEventListener(eventName, handler) {
    if (!this.eventListeners.has(eventName)) {
      return;
    }
    
    const handlers = this.eventListeners.get(eventName);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    console.log(`Unregistered event listener for ${eventName}`);
  }

  /**
   * Emit an event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  async emitEvent(eventName, data) {
    if (!this.eventListeners.has(eventName)) {
      return;
    }
    
    const handlers = this.eventListeners.get(eventName);
    for (const handler of handlers) {
      try {
        await handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    }
  }

  /**
   * Register a custom generator
   * @param {string} name - Generator name
   * @param {Function} handler - Generator function
   */
  registerGenerator(name, handler) {
    this.generators.set(name, handler);
    console.log(`Registered generator: ${name}`);
  }

  /**
   * Unregister a custom generator
   * @param {string} name - Generator name
   */
  unregisterGenerator(name) {
    this.generators.delete(name);
    console.log(`Unregistered generator: ${name}`);
  }

  /**
   * Get a registered generator
   * @param {string} name - Generator name
   * @returns {Function|null} Generator function or null if not found
   */
  getGenerator(name) {
    return this.generators.get(name) || null;
  }

  /**
   * Get all registered generators
   * @returns {Map} Map of generators
   */
  getGenerators() {
    return new Map(this.generators);
  }

  /**
   * Generate a unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get a plugin setting
   * @param {string} key - Setting key
   * @returns {*} Setting value
   */
  getSetting(key) {
    // In a real implementation, this would retrieve from persistent storage
    return this.options[key];
  }

  /**
   * Set a plugin setting
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  setSetting(key, value) {
    // In a real implementation, this would save to persistent storage
    this.options[key] = value;
  }

  /**
   * Show a notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, warning, error)
   */
  showNotification(message, type = 'info') {
    // In a real implementation, this would show a UI notification
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  /**
   * Add a menu item
   * @param {string} category - Menu category
   * @param {string} label - Menu item label
   * @param {Function} handler - Click handler
   */
  addMenuItem(category, label, handler) {
    // In a real implementation, this would add a menu item to the UI
    console.log(`Added menu item: ${category} > ${label}`);
  }

  /**
   * Add a toolbar button
   * @param {string} icon - Button icon
   * @param {Function} handler - Click handler
   */
  addToolbarButton(icon, handler) {
    // In a real implementation, this would add a toolbar button to the UI
    console.log(`Added toolbar button: ${icon}`);
  }

  /**
   * Check if plugin is initialized
   * @returns {boolean} Initialization status
   */
  isInitialized() {
    return this.initialized;
  }
}

module.exports = PluginBase;