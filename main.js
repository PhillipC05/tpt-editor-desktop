/**
 * TPT Asset Editor Desktop - Main Entry Point
 * This file serves as the entry point for the Electron application
 * and initializes the modular application architecture.
 */

// Import the main application class
const TPTAssetEditor = require('./src/core/app');

// Initialize the application
// The TPTAssetEditor class handles all initialization and lifecycle management
const app = new TPTAssetEditor();

// Export the app instance for potential external access
module.exports = app;
