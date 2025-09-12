/**
 * TPT Asset Editor Desktop - Main Application Class
 * Handles application lifecycle, initialization, and coordination
 */

const { app, BrowserWindow, ipcMain, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const WindowManager = require('./window-manager');
const IPCHandler = require('./ipc-handler');
const DatabaseManager = require('./database-manager');
const ErrorHandler = require('./errors/error-handler');

class TPTAssetEditor {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.mainWindow = null;
        this.windowManager = null;
        this.ipcHandler = null;
        this.databaseManager = null;
        this.errorHandler = null;
        this.isQuitting = false;

        this.initializeApp();
    }

    /**
     * Initialize the application
     */
    async initializeApp() {
        try {
            // Set up error handling first
            this.setupGlobalErrorHandling();

            // Initialize core components
            await this.initializeCoreComponents();

            // Set up application event handlers
            this.setupAppEventHandlers();

            // Create application menu
            this.createApplicationMenu();

            // Initialize main window
            await this.createMainWindow();

            console.log('TPT Asset Editor initialized successfully');

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Set up global error handling
     */
    setupGlobalErrorHandling() {
        this.errorHandler = new ErrorHandler();

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            this.errorHandler.handleError(error, 'uncaughtException');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            this.errorHandler.handleError(reason, 'unhandledRejection');
        });

        // Handle Electron app crashes
        app.on('render-process-gone', (event, webContents, details) => {
            console.error('Renderer process gone:', details);
            this.errorHandler.handleRendererCrash(details);
        });
    }

    /**
     * Initialize core application components
     */
    async initializeCoreComponents() {
        // Initialize database manager
        this.databaseManager = new DatabaseManager();
        await this.databaseManager.initialize();

        // Initialize IPC handler
        this.ipcHandler = new IPCHandler(this.databaseManager);

        // Initialize window manager
        this.windowManager = new WindowManager();
    }

    /**
     * Set up application event handlers
     */
    setupAppEventHandlers() {
        // App ready event
        app.whenReady().then(async () => {
            console.log('Electron app is ready');
        });

        // Window all closed event
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                this.quit();
            }
        });

        // App activate event (macOS)
        app.on('activate', async () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                await this.createMainWindow();
            }
        });

        // App before quit event
        app.on('before-quit', (event) => {
            this.isQuitting = true;
            this.cleanup();
        });

        // App second instance (prevent multiple instances)
        app.on('second-instance', () => {
            if (this.mainWindow) {
                if (this.mainWindow.isMinimized()) {
                    this.mainWindow.restore();
                }
                this.mainWindow.focus();
            }
        });

        // Prevent multiple instances
        if (!app.requestSingleInstanceLock()) {
            this.quit();
        }
    }

    /**
     * Create the main application window
     */
    async createMainWindow() {
        try {
            this.mainWindow = await this.windowManager.createMainWindow();

            // Set up window event handlers
            this.mainWindow.on('closed', () => {
                this.mainWindow = null;
            });

            // Load the application
            await this.loadApplication();

        } catch (error) {
            console.error('Failed to create main window:', error);
            this.errorHandler.handleError(error, 'windowCreation');
            this.quit();
        }
    }

    /**
     * Load the application content
     */
    async loadApplication() {
        if (!this.mainWindow) return;

        try {
            // Load the main HTML file
            const indexPath = path.join(__dirname, '../index.html');
            await this.mainWindow.loadFile(indexPath);

            // Set up IPC communication
            this.ipcHandler.setupIPCHandlers(this.mainWindow);

            // Show window when ready
            this.mainWindow.once('ready-to-show', () => {
                this.mainWindow.show();

                // Open DevTools in development
                if (this.isDevelopment) {
                    this.mainWindow.webContents.openDevTools();
                }

                console.log('Main window ready and shown');
            });

        } catch (error) {
            console.error('Failed to load application:', error);
            this.errorHandler.handleError(error, 'applicationLoad');
        }
    }

    /**
     * Create application menu
     */
    createApplicationMenu() {
        const template = this.buildMenuTemplate();
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    /**
     * Build the application menu template
     */
    buildMenuTemplate() {
        const template = [
            // File menu
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Project',
                        accelerator: 'CmdOrCtrl+N',
                        click: () => this.handleMenuAction('new-project')
                    },
                    {
                        label: 'Open Project',
                        accelerator: 'CmdOrCtrl+O',
                        click: () => this.handleMenuAction('open-project')
                    },
                    { type: 'separator' },
                    {
                        label: 'Save',
                        accelerator: 'CmdOrCtrl+S',
                        click: () => this.handleMenuAction('save')
                    },
                    {
                        label: 'Save As...',
                        accelerator: 'CmdOrCtrl+Shift+S',
                        click: () => this.handleMenuAction('save-as')
                    },
                    { type: 'separator' },
                    {
                        label: 'Export Assets',
                        accelerator: 'CmdOrCtrl+E',
                        click: () => this.handleMenuAction('export-assets')
                    },
                    { type: 'separator' },
                    {
                        label: 'Quit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => this.quit()
                    }
                ]
            },

            // Edit menu
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'selectall' }
                ]
            },

            // View menu
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forcereload' },
                    { role: 'toggledevtools' },
                    { type: 'separator' },
                    { role: 'resetzoom' },
                    { role: 'zoomin' },
                    { role: 'zoomout' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },

            // Window menu
            {
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'close' }
                ]
            },

            // Help menu
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'Documentation',
                        click: () => this.handleMenuAction('documentation')
                    },
                    {
                        label: 'Keyboard Shortcuts',
                        click: () => this.handleMenuAction('shortcuts')
                    },
                    { type: 'separator' },
                    {
                        label: 'Check for Updates',
                        click: () => this.handleMenuAction('check-updates')
                    },
                    {
                        label: 'About TPT Asset Editor',
                        click: () => this.handleMenuAction('about')
                    }
                ]
            }
        ];

        // Add macOS specific menu items
        if (process.platform === 'darwin') {
            template.unshift({
                label: app.getName(),
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services', submenu: [] },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            });

            // Window menu for macOS
            template[4].submenu = [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' }
            ];
        }

        return template;
    }

    /**
     * Handle menu actions
     */
    async handleMenuAction(action) {
        try {
            switch (action) {
                case 'new-project':
                    this.ipcHandler.sendToRenderer('menu-action', { action: 'new-project' });
                    break;

                case 'open-project':
                    const result = await dialog.showOpenDialog(this.mainWindow, {
                        properties: ['openDirectory'],
                        title: 'Open Project Directory'
                    });

                    if (!result.canceled) {
                        this.ipcHandler.sendToRenderer('menu-action', {
                            action: 'open-project',
                            path: result.filePaths[0]
                        });
                    }
                    break;

                case 'save':
                    this.ipcHandler.sendToRenderer('menu-action', { action: 'save' });
                    break;

                case 'save-as':
                    this.ipcHandler.sendToRenderer('menu-action', { action: 'save-as' });
                    break;

                case 'export-assets':
                    this.ipcHandler.sendToRenderer('menu-action', { action: 'export-assets' });
                    break;

                case 'documentation':
                    await shell.openExternal('https://github.com/your-repo/docs');
                    break;

                case 'shortcuts':
                    this.showKeyboardShortcuts();
                    break;

                case 'check-updates':
                    this.checkForUpdates();
                    break;

                case 'about':
                    this.showAboutDialog();
                    break;

                default:
                    console.log('Unknown menu action:', action);
            }
        } catch (error) {
            console.error('Error handling menu action:', error);
            this.errorHandler.handleError(error, 'menuAction');
        }
    }

    /**
     * Show keyboard shortcuts dialog
     */
    showKeyboardShortcuts() {
        const shortcutsWindow = new BrowserWindow({
            parent: this.mainWindow,
            modal: true,
            width: 500,
            height: 600,
            resizable: false,
            title: 'Keyboard Shortcuts',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        // Load shortcuts HTML content
        const shortcutsHtml = this.getShortcutsHtml();
        shortcutsWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(shortcutsHtml)}`);
    }

    /**
     * Get keyboard shortcuts HTML
     */
    getShortcutsHtml() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Keyboard Shortcuts</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; }
                    .shortcut-group { margin-bottom: 20px; }
                    .shortcut-group h3 { margin-bottom: 10px; color: #333; }
                    .shortcut { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
                    .shortcut:last-child { border-bottom: none; }
                    .keys { font-weight: bold; color: #666; }
                </style>
            </head>
            <body>
                <h2>Keyboard Shortcuts</h2>

                <div class="shortcut-group">
                    <h3>File Operations</h3>
                    <div class="shortcut">
                        <span>New Project</span>
                        <span class="keys">Ctrl+N</span>
                    </div>
                    <div class="shortcut">
                        <span>Open Project</span>
                        <span class="keys">Ctrl+O</span>
                    </div>
                    <div class="shortcut">
                        <span>Save</span>
                        <span class="keys">Ctrl+S</span>
                    </div>
                    <div class="shortcut">
                        <span>Export Assets</span>
                        <span class="keys">Ctrl+E</span>
                    </div>
                </div>

                <div class="shortcut-group">
                    <h3>Navigation</h3>
                    <div class="shortcut">
                        <span>Dashboard</span>
                        <span class="keys">Ctrl+1</span>
                    </div>
                    <div class="shortcut">
                        <span>Generator</span>
                        <span class="keys">Ctrl+2</span>
                    </div>
                    <div class="shortcut">
                        <span>Library</span>
                        <span class="keys">Ctrl+3</span>
                    </div>
                    <div class="shortcut">
                        <span>Settings</span>
                        <span class="keys">Ctrl+4</span>
                    </div>
                </div>

                <div class="shortcut-group">
                    <h3>Generation</h3>
                    <div class="shortcut">
                        <span>Generate Asset</span>
                        <span class="keys">Ctrl+G</span>
                    </div>
                    <div class="shortcut">
                        <span>Regenerate</span>
                        <span class="keys">Ctrl+R</span>
                    </div>
                    <div class="shortcut">
                        <span>Quick Generate</span>
                        <span class="keys">Ctrl+Shift+G</span>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Check for application updates
     */
    async checkForUpdates() {
        // Implementation for update checking
        // This would integrate with electron-updater or similar
        console.log('Checking for updates...');

        // For now, show a placeholder dialog
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'Check for Updates',
            message: 'Update checking is not yet implemented.',
            detail: 'This feature will be available in a future version.'
        });
    }

    /**
     * Show about dialog
     */
    showAboutDialog() {
        const packageJson = require('../../package.json');

        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'About TPT Asset Editor',
            message: `TPT Asset Editor Desktop v${packageJson.version}`,
            detail: `A comprehensive tool for generating game assets using AI and procedural techniques.\n\nBuilt with Electron and modern web technologies.`,
            buttons: ['OK'],
            icon: path.join(__dirname, '../../assets/icons/icon.png')
        });
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('Application initialization failed:', error);

        dialog.showErrorBox(
            'Application Error',
            'Failed to initialize TPT Asset Editor. The application will now close.'
        );

        this.quit();
    }

    /**
     * Clean up resources before quitting
     */
    cleanup() {
        console.log('Cleaning up application resources...');

        // Close database connections
        if (this.databaseManager) {
            this.databaseManager.close();
        }

        // Clean up IPC handlers
        if (this.ipcHandler) {
            this.ipcHandler.cleanup();
        }

        // Close all windows
        if (this.windowManager) {
            this.windowManager.closeAllWindows();
        }
    }

    /**
     * Quit the application
     */
    quit() {
        this.isQuitting = true;
        app.quit();
    }

    /**
     * Get application instance (for external access)
     */
    getInstance() {
        return {
            mainWindow: this.mainWindow,
            databaseManager: this.databaseManager,
            ipcHandler: this.ipcHandler,
            windowManager: this.windowManager
        };
    }
}

module.exports = TPTAssetEditor;
