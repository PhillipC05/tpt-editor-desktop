/**
 * TPT Asset Editor Desktop - Main UI Controller
 * Coordinates all UI components and manages application state
 */

class AppController {
    constructor() {
        this.currentView = 'dashboard';
        this.currentAssetType = null;
        this.currentConfig = {};
        this.generatedAsset = null;
        this.assets = [];
        this.settings = {};
        this.isInitialized = false;

        // UI managers
        this.viewManager = null;
        this.eventHandler = null;
        this.stateManager = null;

        // Progress tracking
        this.progressTracker = {
            activeOperations: new Map(),
            operationHistory: [],
            performanceMetrics: {
                totalGenerated: 0,
                totalProcessed: 0,
                averageGenerationTime: 0,
                averageProcessingTime: 0,
                successRate: 100,
                lastUpdated: new Date()
            }
        };
    }

    /**
     * Initialize the UI controller
     */
    async initialize() {
        try {
            console.log('Initializing UI Controller...');

            // Initialize UI managers
            await this.initializeUIManagers();

            // Set up global event listeners
            this.setupGlobalEventListeners();

            // Load initial data
            await this.loadInitialData();

            // Initialize views
            this.initializeViews();

            // Set up menu actions
            this.setupMenuActions();

            this.isInitialized = true;
            console.log('UI Controller initialized successfully');

        } catch (error) {
            console.error('Failed to initialize UI Controller:', error);
            throw error;
        }
    }

    /**
     * Initialize UI managers
     */
    async initializeUIManagers() {
        // Import UI managers dynamically
        const { ViewManager } = await import('./view-manager.js');
        const { EventHandler } = await import('./event-handler.js');
        const { StateManager } = await import('./state-manager.js');

        this.viewManager = new ViewManager();
        this.eventHandler = new EventHandler(this);
        this.stateManager = new StateManager();

        await Promise.all([
            this.viewManager.initialize(),
            this.eventHandler.initialize(),
            this.stateManager.initialize()
        ]);
    }

    /**
     * Set up global event listeners
     */
    setupGlobalEventListeners() {
        // Global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => this.handleGlobalSearch(e));
            globalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleGlobalSearch(e);
                }
            });
        }

        // Header buttons
        const newAssetBtn = document.getElementById('new-asset-btn');
        const settingsBtn = document.getElementById('settings-btn');

        if (newAssetBtn) {
            newAssetBtn.addEventListener('click', () => this.switchView('generator'));
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.switchView('settings'));
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.switchView(view);
            });
        });

        // Dashboard actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    /**
     * Set up menu actions from main process
     */
    setupMenuActions() {
        if (window.electronAPI && window.electronAPI.onMenuAction) {
            window.electronAPI.onMenuAction((event, action) => {
                this.handleMenuAction(action);
            });
        }
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            // Load assets
            await this.loadAssets();

            // Load settings
            await this.loadSettings();

            // Update UI
            this.updateStats();
            this.updateRecentAssets();

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showStatus('Error loading data', 'error');
        }
    }

    /**
     * Load assets from database
     */
    async loadAssets() {
        try {
            if (!window.electronAPI) return;

            const result = await window.electronAPI.dbGetAssets({});
            if (result.success) {
                this.assets = result.assets || [];
                console.log(`Loaded ${this.assets.length} assets`);
            } else {
                console.error('Failed to load assets:', result.error);
                this.assets = [];
            }
        } catch (error) {
            console.error('Error loading assets:', error);
            this.assets = [];
        }
    }

    /**
     * Load settings
     */
    async loadSettings() {
        try {
            if (!window.electronAPI) return;

            // Load default settings if not exist
            const defaultSettings = {
                maxBatchSize: 50,
                defaultQuality: 0.9,
                exportFormats: ['png'],
                theme: 'light'
            };

            for (const [key, value] of Object.entries(defaultSettings)) {
                const result = await window.electronAPI.dbGetSettings(key);
                if (result.success) {
                    this.settings[key] = result.value !== null ? result.value : value;
                } else {
                    this.settings[key] = value;
                }
            }

            console.log('Settings loaded:', this.settings);
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = {};
        }
    }

    /**
     * Initialize views
     */
    initializeViews() {
        // Set initial view
        this.switchView('dashboard');

        // Initialize asset type selection
        this.initializeAssetTypes();
    }

    /**
     * Initialize asset type selection
     */
    initializeAssetTypes() {
        document.querySelectorAll('.asset-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                this.selectAssetType(type);
            });
        });
    }

    /**
     * Switch between views
     */
    switchView(viewName) {
        if (this.viewManager) {
            this.viewManager.switchView(viewName);
        }

        this.currentView = viewName;

        // View-specific initialization
        switch (viewName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'library':
                this.updateLibrary();
                break;
            case 'settings':
                this.updateSettings();
                break;
        }
    }

    /**
     * Select asset type for generation
     */
    selectAssetType(type) {
        this.currentAssetType = type;

        // Update UI
        document.querySelectorAll('.asset-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // Handle special cases for vehicle and building types
        if (type === 'vehicle') {
            this.showVehicleTypeSelection();
        } else if (type.startsWith('building')) {
            this.showBuildingTypeSelection(type);
        } else {
            // Hide type-specific panels
            this.hideElement('vehicle-type-panel');
            this.hideElement('building-type-panel');

            // Show configuration panel
            this.showElement('config-panel');
            this.showElement('preview-panel');

            // Load configuration form
            this.loadConfigForm(type);

            // Enable generate button
            this.enableGenerateButton();
        }
    }

    /**
     * Show vehicle type selection panel
     */
    showVehicleTypeSelection() {
        // Hide other panels
        this.hideElement('building-type-panel');
        this.hideElement('config-panel');
        this.hideElement('preview-panel');

        // Show vehicle type panel
        this.showElement('vehicle-type-panel');

        // Setup vehicle type selection listeners
        this.setupVehicleTypeSelection();

        // Initialize vehicle preview system
        this.initializeVehiclePreview();
    }

    /**
     * Show building type selection panel
     */
    showBuildingTypeSelection(buildingType) {
        // Hide other panels
        this.hideElement('vehicle-type-panel');
        this.hideElement('config-panel');
        this.hideElement('preview-panel');

        // Show building type panel
        this.showElement('building-type-panel');

        // Setup building type selection listeners
        this.setupBuildingTypeSelection();

        // If specific building type was selected, set it
        if (buildingType !== 'building') {
            const specificType = buildingType.replace('building-', '');
            this.selectBuildingType(specificType);
        }

        // Initialize building preview system
        this.initializeBuildingPreview();
    }

    /**
     * Setup vehicle type selection event listeners
     */
    setupVehicleTypeSelection() {
        document.querySelectorAll('.vehicle-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vehicleType = e.currentTarget.dataset.vehicleType;

                // Update active state
                document.querySelectorAll('.vehicle-type-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Store selected vehicle type
                this.currentVehicleType = vehicleType;

                // Show configuration panel with vehicle-specific config
                this.showElement('config-panel');
                this.showElement('preview-panel');

                // Load vehicle configuration form
                this.loadConfigForm('vehicle');

                // Enable generate button
                this.enableGenerateButton();
            });
        });
    }

    /**
     * Setup building type selection event listeners
     */
    setupBuildingTypeSelection() {
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;

                // Update active tab
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Show corresponding building types
                document.querySelectorAll('.building-types-category').forEach(cat => {
                    cat.classList.toggle('active', cat.dataset.category === category);
                });
            });
        });

        // Building type buttons
        document.querySelectorAll('.building-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buildingType = e.currentTarget.dataset.buildingType;
                this.selectBuildingType(buildingType);
            });
        });
    }

    /**
     * Select specific building type
     */
    selectBuildingType(buildingType) {
        // Update active state
        document.querySelectorAll('.building-type-btn').forEach(b => b.classList.remove('active'));
        const selectedBtn = document.querySelector(`[data-building-type="${buildingType}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');

            // Also activate the correct category tab
            const category = selectedBtn.closest('.building-types-category').dataset.category;
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            const categoryTab = document.querySelector(`[data-category="${category}"]`);
            if (categoryTab) {
                categoryTab.classList.add('active');
            }

            // Show corresponding category
            document.querySelectorAll('.building-types-category').forEach(cat => {
                cat.classList.toggle('active', cat.dataset.category === category);
            });
        }

        // Store selected building type
        this.currentBuildingType = buildingType;

        // Show configuration panel with building-specific config
        this.showElement('config-panel');
        this.showElement('preview-panel');

        // Load building configuration form
        this.loadConfigForm('building');

        // Enable generate button
        this.enableGenerateButton();
    }

    /**
     * Load configuration form for asset type
     */
    loadConfigForm(type) {
        // This will be implemented with the form manager
        console.log(`Loading config form for type: ${type}`);
    }

    /**
     * Enable generate button
     */
    enableGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Asset';
        }
    }

    /**
     * Handle global search
     */
    handleGlobalSearch(event) {
        const query = event.target.value.trim();
        if (query) {
            // Filter assets based on search
            const filteredAssets = this.assets.filter(asset =>
                asset.name.toLowerCase().includes(query.toLowerCase()) ||
                asset.type.toLowerCase().includes(query.toLowerCase())
            );

            // Update library view with filtered results
            if (this.currentView === 'library') {
                this.updateLibrary(filteredAssets);
            }
        } else {
            // Show all assets
            if (this.currentView === 'library') {
                this.updateLibrary();
            }
        }
    }

    /**
     * Handle quick actions from dashboard
     */
    handleQuickAction(action) {
        const type = action.replace('generate-', '');
        this.selectAssetType(type);
        this.switchView('generator');
    }

    /**
     * Handle menu actions
     */
    handleMenuAction(action) {
        switch (action) {
            case 'new-asset':
                this.switchView('generator');
                break;
            case 'open-library':
                this.switchView('library');
                break;
            case 'open-settings':
                this.switchView('settings');
                break;
            case 'export-assets':
                this.handleExportAssets();
                break;
            default:
                console.log('Unknown menu action:', action);
        }
    }

    /**
     * Update dashboard
     */
    updateDashboard() {
        this.updateStats();
        this.updateRecentAssets();
    }

    /**
     * Update statistics
     */
    updateStats() {
        const totalAssets = this.assets.length;
        this.setElementText('total-assets', totalAssets);

        // Count by type
        const typeCounts = {};
        this.assets.forEach(asset => {
            typeCounts[asset.type] = (typeCounts[asset.type] || 0) + 1;
        });

        // Update stat cards
        this.setElementText('stat-characters', typeCounts.character || 0);
        this.setElementText('stat-monsters', typeCounts.monster || 0);
        this.setElementText('stat-items', typeCounts.item || 0);
        this.setElementText('stat-tiles', typeCounts.tile || 0);
        this.setElementText('stat-sfx', typeCounts.sfx || 0);
        this.setElementText('stat-music', typeCounts.music || 0);

        // Today generated (simplified - just show recent count)
        const todayGenerated = this.assets.filter(asset => {
            const today = new Date();
            const assetDate = new Date(asset.created_at);
            return assetDate.toDateString() === today.toDateString();
        }).length;

        this.setElementText('today-generated', todayGenerated);
    }

    /**
     * Update recent assets
     */
    updateRecentAssets() {
        const recentAssets = this.assets.slice(0, 6); // Show 6 most recent
        const container = document.getElementById('recent-assets');

        if (recentAssets.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-images"></i>
                        <p>No assets generated yet</p>
                        <button class="btn btn-primary" onclick="appController.switchView('generator')">Generate Your First Asset</button>
                    </div>
                `;
            }
            return;
        }

        let html = '';
        recentAssets.forEach(asset => {
            if (asset.type === 'sfx' || asset.type === 'music' || asset.type === 'ambient') {
                html += `
                    <div class="asset-item audio-item">
                        <i class="fas fa-music"></i>
                        <div class="asset-name">${asset.name}</div>
                        <div class="asset-type">${asset.type}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="asset-item image-item">
                        <img src="data:image/png;base64,${asset.sprite.data}" alt="${asset.name}">
                        <div class="asset-name">${asset.name}</div>
                        <div class="asset-type">${asset.type}</div>
                    </div>
                `;
            }
        });

        if (container) {
            container.innerHTML = `<div class="asset-grid">${html}</div>`;
        }
    }

    /**
     * Update library view
     */
    updateLibrary(filteredAssets = null) {
        // This will be implemented with the library manager
        console.log('Updating library view');
    }

    /**
     * Update settings view
     */
    updateSettings() {
        // This will be implemented with the settings manager
        console.log('Updating settings view');
    }

    /**
     * Handle export assets
     */
    async handleExportAssets() {
        if (this.assets.length === 0) {
            this.showStatus('No assets to export', 'error');
            return;
        }

        try {
            // Open directory selection dialog
            const result = await window.electronAPI.dialogOpenDirectory();

            if (result.canceled) return;

            const exportPath = result.filePaths[0];

            this.showLoading('Exporting assets...');

            // Export each asset
            for (const asset of this.assets) {
                let fileName = `${asset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
                let filePath;

                if (asset.type === 'sfx' || asset.type === 'music' || asset.type === 'ambient') {
                    filePath = `${exportPath}/${fileName}.wav`;
                    await window.electronAPI.fsSaveFile(filePath, asset.audio.data, 'base64');
                } else {
                    filePath = `${exportPath}/${fileName}.png`;
                    const imageBuffer = Buffer.from(asset.sprite.data, 'base64');
                    await window.electronAPI.fsSaveFile(filePath, imageBuffer);
                }
            }

            this.showStatus(`Exported ${this.assets.length} assets successfully!`, 'success');

        } catch (error) {
            console.error('Error exporting assets:', error);
            this.showStatus('Failed to export assets: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.textContent = message;
            statusText.className = `status-${type}`;

            // Auto-clear status after 5 seconds
            setTimeout(() => {
                statusText.textContent = 'Ready';
                statusText.className = '';
            }, 5000);
        }
    }

    /**
     * Show loading overlay
     */
    showLoading(text = 'Loading...') {
        const loadingOverlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');

        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }

        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }

    /**
     * Show element
     */
    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    /**
     * Hide element
     */
    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    /**
     * Set element text
     */
    setElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Get current state
     */
    getState() {
        return {
            currentView: this.currentView,
            currentAssetType: this.currentAssetType,
            currentConfig: this.currentConfig,
            assetsCount: this.assets.length,
            settings: this.settings
        };
    }

    /**
     * Save state
     */
    async saveState() {
        if (this.stateManager) {
            await this.stateManager.saveState(this.getState());
        }
    }

    /**
     * Load state
     */
    async loadState() {
        if (this.stateManager) {
            const state = await this.stateManager.loadState();
            if (state) {
                Object.assign(this, state);
            }
        }
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        console.log('Cleaning up UI Controller...');

        // Save final state
        await this.saveState();

        // Clean up managers
        if (this.viewManager) {
            await this.viewManager.cleanup();
        }

        if (this.eventHandler) {
            await this.eventHandler.cleanup();
        }

        if (this.stateManager) {
            await this.stateManager.cleanup();
        }
    }
}

// Create global instance
const appController = new AppController();

// Make it globally available
window.appController = appController;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await appController.initialize();
        console.log('TPT Asset Editor Desktop ready!');
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
});

module.exports = AppController;
