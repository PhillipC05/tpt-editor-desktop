/**
 * TPT Asset Editor Plugin Template
 * Use this template as a starting point for creating new plugins
 */

// Import required modules
const { PluginBase } = require('./plugin-base');

/**
 * Example Plugin - Replace with your plugin name
 */
class ExamplePlugin extends PluginBase {
  /**
   * Constructor
   * @param {Object} options - Plugin options
   */
  constructor(options = {}) {
    super(options);
    
    // Plugin metadata
    this.id = 'example-plugin';
    this.name = 'Example Plugin';
    this.version = '1.0.0';
    this.description = 'An example plugin template for TPT Asset Editor';
    this.author = 'Your Name';
    
    // Plugin configuration
    this.config = {
      // Add your plugin-specific configuration here
      exampleSetting: 'defaultValue'
    };
    
    // Merge with provided options
    Object.assign(this.config, options);
  }

  /**
   * Initialize the plugin
   * Called when the plugin is loaded
   */
  async init() {
    console.log(`Initializing ${this.name} v${this.version}`);
    
    // Register event listeners
    this.registerEventListener('asset-generated', this.onAssetGenerated.bind(this));
    this.registerEventListener('app-ready', this.onAppReady.bind(this));
    
    // Add UI elements if needed
    // this.addMenuItem('Tools', 'Example Action', this.onExampleAction.bind(this));
    
    // Add generator if needed
    // this.registerGenerator('example-generator', this.exampleGenerator.bind(this));
  }

  /**
   * Called when the application is ready
   */
  async onAppReady() {
    console.log(`${this.name} is ready`);
  }

  /**
   * Called when an asset is generated
   * @param {Object} asset - Generated asset
   */
  async onAssetGenerated(asset) {
    // Process the generated asset
    console.log(`Processing asset: ${asset.name}`);
  }

  /**
   * Example action handler
   */
  async onExampleAction() {
    // Implement your action here
    console.log('Example action triggered');
  }

  /**
   * Example generator
   * @param {Object} config - Generation configuration
   * @returns {Object} Generated asset
   */
  async exampleGenerator(config) {
    // Implement your generator logic here
    return {
      id: this.generateId(),
      name: 'Example Asset',
      type: 'example',
      data: 'example-data',
      config: config,
      metadata: {
        generated: new Date().toISOString(),
        plugin: this.id
      }
    };
  }

  /**
   * Clean up resources when plugin is unloaded
   */
  async destroy() {
    console.log(`Destroying ${this.name}`);
    
    // Clean up event listeners
    this.unregisterEventListener('asset-generated', this.onAssetGenerated.bind(this));
    this.unregisterEventListener('app-ready', this.onAppReady.bind(this));
  }
}

// Export the plugin
module.exports = ExamplePlugin;

/**
 * Plugin Installation Instructions:
 * 
 * 1. Save this file as your-plugin-name.js in the plugins directory
 * 2. Update the class name and metadata
 * 3. Implement your plugin functionality
 * 4. Register the plugin in plugin-manager.js
 * 
 * Plugin API Reference:
 * 
 * Event Listeners:
 * - this.registerEventListener(eventName, handler) - Register event listener
 * - this.unregisterEventListener(eventName, handler) - Unregister event listener
 * 
 * UI Elements:
 * - this.addMenuItem(category, label, handler) - Add menu item
 * - this.addToolbarButton(icon, handler) - Add toolbar button
 * - this.showNotification(message, type) - Show notification
 * 
 * Generators:
 * - this.registerGenerator(name, handler) - Register custom generator
 * - this.unregisterGenerator(name) - Unregister generator
 * 
 * Utilities:
 * - this.generateId() - Generate unique ID
 * - this.getSetting(key) - Get plugin setting
 * - this.setSetting(key, value) - Set plugin setting
 * 
 * Available Events:
 * - 'app-ready' - Application is ready
 * - 'asset-generated' - Asset generated
 * - 'asset-saved' - Asset saved
 * - 'asset-deleted' - Asset deleted
 * - 'settings-changed' - Settings changed
 * - 'plugin-loaded' - Plugin loaded
 * - 'plugin-unloaded' - Plugin unloaded
 */