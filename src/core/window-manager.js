/**
 * TPT Asset Editor Desktop - Window Manager
 * Handles creation and management of application windows
 */

const { BrowserWindow, screen } = require('electron');
const path = require('path');

class WindowManager {
    constructor() {
        this.windows = new Map();
        this.mainWindow = null;
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    /**
     * Create the main application window
     */
    async createMainWindow() {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;

        // Calculate window size (80% of screen size, max 1600x900)
        const windowWidth = Math.min(Math.floor(width * 0.8), 1600);
        const windowHeight = Math.min(Math.floor(height * 0.8), 900);

        // Center the window
        const x = Math.floor((width - windowWidth) / 2);
        const y = Math.floor((height - windowHeight) / 2);

        this.mainWindow = new BrowserWindow({
            width: windowWidth,
            height: windowHeight,
            x: x,
            y: y,
            minWidth: 1000,
            minHeight: 700,
            title: 'TPT Asset Editor Desktop',
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
            show: false, // Don't show until ready
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, '../../preload.js'),
                webSecurity: true,
                allowRunningInsecureContent: false
            },
            icon: this.getAppIcon(),
            backgroundColor: '#1a1a1a'
        });

        // Set up window event handlers
        this.setupWindowEventHandlers(this.mainWindow, 'main');

        // Store window reference
        this.windows.set('main', this.mainWindow);

        return this.mainWindow;
    }

    /**
     * Create a secondary window
     */
    async createSecondaryWindow(name, options = {}) {
        const defaultOptions = {
            width: 800,
            height: 600,
            title: 'TPT Asset Editor',
            modal: false,
            resizable: true,
            minimizable: true,
            maximizable: true,
            closable: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, '../../preload.js')
            }
        };

        const windowOptions = { ...defaultOptions, ...options };
        const window = new BrowserWindow(windowOptions);

        // Set up window event handlers
        this.setupWindowEventHandlers(window, name);

        // Store window reference
        this.windows.set(name, window);

        return window;
    }

    /**
     * Create a modal dialog window
     */
    async createModalDialog(name, options = {}) {
        if (!this.mainWindow) {
            throw new Error('Main window must be created before modal dialogs');
        }

        const defaultOptions = {
            parent: this.mainWindow,
            modal: true,
            width: 600,
            height: 400,
            resizable: false,
            minimizable: false,
            maximizable: false,
            titleBarStyle: 'default',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, '../../preload.js')
            }
        };

        const windowOptions = { ...defaultOptions, ...options };
        const window = new BrowserWindow(windowOptions);

        // Set up window event handlers
        this.setupWindowEventHandlers(window, name);

        // Store window reference
        this.windows.set(name, window);

        return window;
    }

    /**
     * Set up event handlers for a window
     */
    setupWindowEventHandlers(window, name) {
        // Window closed event
        window.on('closed', () => {
            console.log(`Window '${name}' closed`);
            this.windows.delete(name);

            // If main window closed, clean up
            if (name === 'main') {
                this.mainWindow = null;
                this.closeAllWindows();
            }
        });

        // Window focus event
        window.on('focus', () => {
            console.log(`Window '${name}' focused`);
        });

        // Window blur event
        window.on('blur', () => {
            console.log(`Window '${name}' blurred`);
        });

        // Window resize event
        window.on('resize', () => {
            this.saveWindowBounds(name, window);
        });

        // Window move event
        window.on('move', () => {
            this.saveWindowBounds(name, window);
        });

        // Window maximize event
        window.on('maximize', () => {
            console.log(`Window '${name}' maximized`);
        });

        // Window minimize event
        window.on('minimize', () => {
            console.log(`Window '${name}' minimized`);
        });

        // Window restore event
        window.on('restore', () => {
            console.log(`Window '${name}' restored`);
        });

        // Prevent new window creation
        window.webContents.setWindowOpenHandler(() => {
            console.warn('Blocked attempt to open new window');
            return { action: 'deny' };
        });

        // Handle navigation
        window.webContents.on('will-navigate', (event, url) => {
            // Only allow navigation within the app
            const parsedUrl = new URL(url);
            if (parsedUrl.protocol !== 'file:') {
                event.preventDefault();
                console.warn('Blocked navigation to external URL:', url);
            }
        });

        // Handle new window requests
        window.webContents.on('new-window', (event, url) => {
            event.preventDefault();
            console.warn('Blocked new window creation:', url);
        });

        // Handle context menu
        window.webContents.on('context-menu', (event, params) => {
            // Custom context menu can be implemented here
            console.log('Context menu requested:', params);
        });

        // Handle crashes
        window.webContents.on('crashed', (event, killed) => {
            console.error(`Window '${name}' crashed. Killed: ${killed}`);
            this.handleWindowCrash(name, killed);
        });

        // Handle unresponsive
        window.on('unresponsive', () => {
            console.error(`Window '${name}' became unresponsive`);
            this.handleWindowUnresponsive(name);
        });

        // Handle responsive
        window.on('responsive', () => {
            console.log(`Window '${name}' became responsive again`);
        });
    }

    /**
     * Get the application icon path
     */
    getAppIcon() {
        const iconPath = path.join(__dirname, '../../assets/icons');

        switch (process.platform) {
            case 'win32':
                return path.join(iconPath, 'icon.ico');
            case 'darwin':
                return path.join(iconPath, 'icon.icns');
            default:
                return path.join(iconPath, 'icon.png');
        }
    }

    /**
     * Save window bounds to persistent storage
     */
    saveWindowBounds(name, window) {
        try {
            const bounds = window.getBounds();
            const isMaximized = window.isMaximized();
            const isMinimized = window.isMinimized();

            const windowState = {
                bounds,
                isMaximized,
                isMinimized,
                display: screen.getDisplayMatching(bounds).id
            };

            // Save to local storage (in a real app, this would be persistent)
            if (!this.windowStates) {
                this.windowStates = new Map();
            }
            this.windowStates.set(name, windowState);

        } catch (error) {
            console.error(`Error saving window bounds for '${name}':`, error);
        }
    }

    /**
     * Restore window bounds from persistent storage
     */
    restoreWindowBounds(name, window) {
        try {
            if (!this.windowStates || !this.windowStates.has(name)) {
                return;
            }

            const windowState = this.windowStates.get(name);

            // Check if display still exists
            const displays = screen.getAllDisplays();
            const displayExists = displays.some(display => display.id === windowState.display);

            if (displayExists) {
                window.setBounds(windowState.bounds);

                if (windowState.isMaximized) {
                    window.maximize();
                }
            }

        } catch (error) {
            console.error(`Error restoring window bounds for '${name}':`, error);
        }
    }

    /**
     * Handle window crash
     */
    handleWindowCrash(name, killed) {
        console.error(`Handling crash for window '${name}'`);

        // Show error dialog
        const { dialog } = require('electron');

        dialog.showErrorBox(
            'Window Crash',
            `The ${name} window has crashed. The application will attempt to recover.`
        );

        // Attempt to recreate the window
        if (name === 'main') {
            setTimeout(async () => {
                try {
                    await this.createMainWindow();
                } catch (error) {
                    console.error('Failed to recreate main window after crash:', error);
                }
            }, 1000);
        }
    }

    /**
     * Handle unresponsive window
     */
    handleWindowUnresponsive(name) {
        console.warn(`Window '${name}' is unresponsive`);

        const window = this.windows.get(name);
        if (!window) return;

        const { dialog } = require('electron');

        const choice = dialog.showMessageBoxSync(window, {
            type: 'warning',
            buttons: ['Wait', 'Force Close'],
            defaultId: 0,
            cancelId: 0,
            title: 'Window Unresponsive',
            message: `The ${name} window is not responding.`,
            detail: 'You can wait for it to become responsive again, or force close it.'
        });

        if (choice === 1) { // Force Close
            window.destroy();
        }
    }

    /**
     * Get a window by name
     */
    getWindow(name) {
        return this.windows.get(name) || null;
    }

    /**
     * Get all windows
     */
    getAllWindows() {
        return Array.from(this.windows.values());
    }

    /**
     * Close a specific window
     */
    closeWindow(name) {
        const window = this.windows.get(name);
        if (window && !window.isDestroyed()) {
            window.close();
        }
    }

    /**
     * Close all windows except main
     */
    closeSecondaryWindows() {
        for (const [name, window] of this.windows) {
            if (name !== 'main' && !window.isDestroyed()) {
                window.close();
            }
        }
    }

    /**
     * Close all windows
     */
    closeAllWindows() {
        for (const [name, window] of this.windows) {
            if (!window.isDestroyed()) {
                window.close();
            }
        }
        this.windows.clear();
    }

    /**
     * Send message to a specific window
     */
    sendToWindow(name, channel, data) {
        const window = this.windows.get(name);
        if (window && !window.isDestroyed()) {
            window.webContents.send(channel, data);
        }
    }

    /**
     * Send message to all windows
     */
    sendToAllWindows(channel, data) {
        for (const [name, window] of this.windows) {
            if (!window.isDestroyed()) {
                window.webContents.send(channel, data);
            }
        }
    }

    /**
     * Get window count
     */
    getWindowCount() {
        return this.windows.size;
    }

    /**
     * Check if main window exists and is visible
     */
    isMainWindowReady() {
        return this.mainWindow && !this.mainWindow.isDestroyed() && this.mainWindow.isVisible();
    }

    /**
     * Focus main window
     */
    focusMainWindow() {
        if (this.isMainWindowReady()) {
            if (this.mainWindow.isMinimized()) {
                this.mainWindow.restore();
            }
            this.mainWindow.focus();
        }
    }

    /**
     * Toggle main window dev tools
     */
    toggleDevTools() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.toggleDevTools();
        }
    }

    /**
     * Reload main window
     */
    reloadMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.reload();
        }
    }

    /**
     * Get main window bounds
     */
    getMainWindowBounds() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            return this.mainWindow.getBounds();
        }
        return null;
    }

    /**
     * Set main window bounds
     */
    setMainWindowBounds(bounds) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.setBounds(bounds);
        }
    }

    /**
     * Center main window on screen
     */
    centerMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.center();
        }
    }

    /**
     * Maximize main window
     */
    maximizeMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.maximize();
        }
    }

    /**
     * Minimize main window
     */
    minimizeMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.minimize();
        }
    }

    /**
     * Restore main window
     */
    restoreMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.restore();
        }
    }

    /**
     * Check if main window is maximized
     */
    isMainWindowMaximized() {
        return this.mainWindow && !this.mainWindow.isDestroyed() && this.mainWindow.isMaximized();
    }

    /**
     * Check if main window is minimized
     */
    isMainWindowMinimized() {
        return this.mainWindow && !this.mainWindow.isDestroyed() && this.mainWindow.isMinimized();
    }

    /**
     * Get window information for debugging
     */
    getWindowInfo() {
        const info = {};

        for (const [name, window] of this.windows) {
            info[name] = {
                id: window.id,
                title: window.getTitle(),
                bounds: window.getBounds(),
                isVisible: window.isVisible(),
                isDestroyed: window.isDestroyed(),
                isMaximized: window.isMaximized(),
                isMinimized: window.isMinimized(),
                isFocused: window.isFocused()
            };
        }

        return info;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        console.log('Cleaning up window manager...');

        // Save window states before cleanup
        for (const [name, window] of this.windows) {
            if (!window.isDestroyed()) {
                this.saveWindowBounds(name, window);
            }
        }

        // Close all windows
        this.closeAllWindows();

        // Clear references
        this.mainWindow = null;
        this.windows.clear();
        this.windowStates = null;
    }
}

module.exports = WindowManager;
