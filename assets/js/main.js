/**
 * TPT Asset Editor Desktop - Main Application Script
 */

// Global application state
const App = {
    currentView: 'dashboard',
    currentAssetType: null,
    currentConfig: {},
    generatedAsset: null,
    assets: [],
    settings: {}
};

// DOM elements
const elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TPT Asset Editor Desktop initializing...');

    // Cache DOM elements
    cacheElements();

    // Setup event listeners
    setupEventListeners();

    // Load initial data
    await loadInitialData();

    // Initialize views
    initializeViews();

    // Setup menu actions
    setupMenuActions();

    console.log('TPT Asset Editor Desktop ready!');
});

// Cache frequently used DOM elements
function cacheElements() {
    elements.app = document.getElementById('app');
    elements.globalSearch = document.getElementById('global-search');
    elements.newAssetBtn = document.getElementById('new-asset-btn');
    elements.settingsBtn = document.getElementById('settings-btn');

    // Views
    elements.dashboardView = document.getElementById('dashboard-view');
    elements.generatorView = document.getElementById('generator-view');
    elements.libraryView = document.getElementById('library-view');
    elements.batchView = document.getElementById('batch-view');
    elements.templatesView = document.getElementById('templates-view');
    elements.settingsView = document.getElementById('settings-view');

    // Generator elements
    elements.configPanel = document.getElementById('config-panel');
    elements.configContent = document.getElementById('config-content');
    elements.previewPanel = document.getElementById('preview-panel');
    elements.previewContent = document.getElementById('preview-content');
    elements.generateBtn = document.getElementById('generate-btn');
    elements.regenerateBtn = document.getElementById('regenerate-btn');
    elements.saveBtn = document.getElementById('save-btn');

    // Status
    elements.statusText = document.getElementById('status-text');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    elements.loadingText = document.getElementById('loading-text');
}

// Setup event listeners
function setupEventListeners() {
    // Global search
    elements.globalSearch.addEventListener('input', handleGlobalSearch);
    elements.globalSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGlobalSearch();
        }
    });

    // Header buttons
    elements.newAssetBtn.addEventListener('click', () => switchView('generator'));
    elements.settingsBtn.addEventListener('click', () => switchView('settings'));

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
        });
    });

    // Generator actions
    elements.generateBtn.addEventListener('click', handleGenerateAsset);
    elements.regenerateBtn.addEventListener('click', handleRegenerateAsset);
    elements.saveBtn.addEventListener('click', handleSaveAsset);

    // Dashboard actions
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handleQuickAction(action);
        });
    });
}

// Setup menu actions from main process
function setupMenuActions() {
    if (window.electronAPI) {
        window.electronAPI.onMenuAction((event, action) => {
            handleMenuAction(action);
        });
    }
}

// Handle menu actions
function handleMenuAction(action) {
    switch (action) {
        case 'new-asset':
            switchView('generator');
            break;
        case 'open-library':
            switchView('library');
            break;
        case 'open-settings':
            switchView('settings');
            break;
        case 'export-assets':
            handleExportAssets();
            break;
        default:
            console.log('Unknown menu action:', action);
    }
}

// Load initial data
async function loadInitialData() {
    try {
        // Load assets
        await loadAssets();

        // Load settings
        await loadSettings();

        // Update UI
        updateStats();
        updateRecentAssets();

    } catch (error) {
        console.error('Error loading initial data:', error);
        showStatus('Error loading data', 'error');
    }
}

// Load assets from database
async function loadAssets() {
    try {
        if (!window.electronAPI) return;

        const assets = await window.electronAPI.dbGetAssets({});
        App.assets = assets || [];
        console.log(`Loaded ${App.assets.length} assets`);
    } catch (error) {
        console.error('Error loading assets:', error);
        App.assets = [];
    }
}

// Load settings
async function loadSettings() {
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
            const saved = await window.electronAPI.dbGetSetting(key);
            App.settings[key] = saved !== null ? saved : value;
        }

        console.log('Settings loaded:', App.settings);
    } catch (error) {
        console.error('Error loading settings:', error);
        App.settings = {};
    }
}

// Initialize views
function initializeViews() {
    // Set initial view
    switchView('dashboard');

    // Initialize asset type selection
    initializeAssetTypes();
}

// Initialize asset type selection
function initializeAssetTypes() {
    document.querySelectorAll('.asset-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            selectAssetType(type);
        });
    });
}

// Switch between views
function switchView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        App.currentView = viewName;

        // View-specific initialization
        switch (viewName) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'library':
                updateLibrary();
                break;
            case 'settings':
                updateSettings();
                break;
        }
    }
}

// Select asset type for generation
function selectAssetType(type) {
    App.currentAssetType = type;

    // Update UI
    document.querySelectorAll('.asset-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Handle special cases for vehicle and building types
    if (type === 'vehicle') {
        showVehicleTypeSelection();
    } else if (type.startsWith('building')) {
        showBuildingTypeSelection(type);
    } else {
        // Hide type-specific panels
        document.getElementById('vehicle-type-panel').classList.add('hidden');
        document.getElementById('building-type-panel').classList.add('hidden');

        // Show configuration panel
        elements.configPanel.classList.remove('hidden');
        elements.previewPanel.classList.remove('hidden');

        // Load configuration form
        loadConfigForm(type);

        // Enable generate button
        elements.generateBtn.disabled = false;
        elements.generateBtn.textContent = 'Generate Asset';
    }
}

// Show vehicle type selection panel
function showVehicleTypeSelection() {
    // Hide other panels
    document.getElementById('building-type-panel').classList.add('hidden');
    elements.configPanel.classList.add('hidden');
    elements.previewPanel.classList.add('hidden');

    // Show vehicle type panel
    const vehiclePanel = document.getElementById('vehicle-type-panel');
    vehiclePanel.classList.remove('hidden');

    // Setup vehicle type selection listeners
    setupVehicleTypeSelection();

// Initialize vehicle preview system
initializeVehiclePreview();

// Initialize building preview system
initializeBuildingPreview();
}

// Setup vehicle type selection event listeners
function setupVehicleTypeSelection() {
    document.querySelectorAll('.vehicle-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const vehicleType = e.currentTarget.dataset.vehicleType;

            // Update active state
            document.querySelectorAll('.vehicle-type-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Store selected vehicle type
            App.currentVehicleType = vehicleType;

            // Show configuration panel with vehicle-specific config
            elements.configPanel.classList.remove('hidden');
            elements.previewPanel.classList.remove('hidden');

            // Load vehicle configuration form
            loadConfigForm('vehicle');

            // Enable generate button
            elements.generateBtn.disabled = false;
            elements.generateBtn.textContent = 'Generate Vehicle';
        });
    });
}

// Show building type selection panel
function showBuildingTypeSelection(buildingType) {
    // Hide other panels
    document.getElementById('vehicle-type-panel').classList.add('hidden');
    elements.configPanel.classList.add('hidden');
    elements.previewPanel.classList.add('hidden');

    // Show building type panel
    const buildingPanel = document.getElementById('building-type-panel');
    buildingPanel.classList.remove('hidden');

    // Setup building type selection listeners
    setupBuildingTypeSelection();

    // If specific building type was selected, set it
    if (buildingType !== 'building') {
        const specificType = buildingType.replace('building-', '');
        selectBuildingType(specificType);
    }
}

// Setup building type selection event listeners
function setupBuildingTypeSelection() {
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
            selectBuildingType(buildingType);
        });
    });
}

// Select specific building type
function selectBuildingType(buildingType) {
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
    App.currentBuildingType = buildingType;

    // Show configuration panel with building-specific config
    elements.configPanel.classList.remove('hidden');
    elements.previewPanel.classList.remove('hidden');

    // Load building configuration form
    loadConfigForm('building');

    // Enable generate button
    elements.generateBtn.disabled = false;
    elements.generateBtn.textContent = 'Generate Building';
}

// Load configuration form for asset type
function loadConfigForm(type) {
    let formHtml = '';

    switch (type) {
        case 'character':
            formHtml = getCharacterConfigForm();
            break;
        case 'monster':
            formHtml = getMonsterConfigForm();
            break;
        case 'item':
            formHtml = getItemConfigForm();
            break;
        case 'tile':
            formHtml = getTileConfigForm();
            break;
        case 'sfx':
            formHtml = getSFXConfigForm();
            break;
        case 'music':
            formHtml = getMusicConfigForm();
            break;
        case 'vehicle':
            formHtml = getVehicleConfigForm();
            break;
        case 'building':
            formHtml = getBuildingConfigForm();
            break;
        case 'building-house':
            formHtml = getBuildingConfigForm();
            break;
        case 'building-castle':
            formHtml = getBuildingConfigForm();
            break;
        case 'building-shop':
            formHtml = getBuildingConfigForm();
            break;
        case 'building-tower':
            formHtml = getBuildingConfigForm();
            break;
        case 'particle':
            formHtml = getParticleConfigForm();
            break;
        case 'ui':
            formHtml = getUIConfigForm();
            break;
        default:
            formHtml = '<p>Configuration form not available for this type.</p>';
    }

    elements.configContent.innerHTML = formHtml;

    // Setup form event listeners
    setupConfigFormListeners();
}

// Get character configuration form
function getCharacterConfigForm() {
    return `
        <div class="config-form">
            <div class="form-group">
                <label for="character-class">Character Class</label>
                <select id="character-class" name="classType" class="form-control">
                    <option value="warrior">Warrior</option>
                    <option value="mage">Mage</option>
                    <option value="ranger">Ranger</option>
                </select>
            </div>

            <div class="form-group">
                <label>Equipment</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="equipment" value="iron_sword"> Iron Sword</label>
                    <label><input type="checkbox" name="equipment" value="leather_armor"> Leather Armor</label>
                    <label><input type="checkbox" name="equipment" value="wooden_shield"> Wooden Shield</label>
                </div>
            </div>
        </div>
    `;
}

// Get monster configuration form
function getMonsterConfigForm() {
    return `
        <div class="config-form">
            <div class="form-group">
                <label for="monster-type">Monster Type</label>
                <select id="monster-type" name="monsterType" class="form-control">
                    <option value="goblin">Goblin</option>
                    <option value="wolf">Wolf</option>
                    <option value="skeleton">Skeleton</option>
                    <option value="orc">Orc</option>
                </select>
            </div>

            <div class="form-group">
                <label for="size-variant">Size Variant</label>
                <select id="size-variant" name="sizeVariant" class="form-control">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                </select>
            </div>
        </div>
    `;
}

// Get item configuration form
function getItemConfigForm() {
    return `
        <div class="config-form">
            <div class="form-group">
                <label for="item-type">Item Type</label>
                <select id="item-type" name="itemType" class="form-control">
                    <option value="sword">Sword</option>
                    <option value="armor">Armor</option>
                    <option value="potion">Potion</option>
                    <option value="shield">Shield</option>
                    <option value="bow">Bow</option>
                </select>
            </div>

            <div class="form-group">
                <label for="rarity">Rarity</label>
                <select id="rarity" name="rarity" class="form-control">
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                </select>
            </div>
        </div>
    `;
}

// Get tile configuration form
function getTileConfigForm() {
    return `
        <div class="config-form">
            <div class="form-group">
                <label for="tile-type">Tile Type</label>
                <select id="tile-type" name="tileType" class="form-control">
                    <option value="grass">Grass</option>
                    <option value="water">Water</option>
                    <option value="stone">Stone</option>
                    <option value="dirt">Dirt</option>
                    <option value="sand">Sand</option>
                </select>
            </div>

            <div class="form-group">
                <label for="biome">Biome</label>
                <select id="biome" name="biome" class="form-control">
                    <option value="grass">Grassland</option>
                    <option value="forest">Forest</option>
                    <option value="desert">Desert</option>
                    <option value="mountain">Mountain</option>
                </select>
            </div>

            <div class="form-group">
                <label for="variation">Variation</label>
                <input type="range" id="variation" name="variation" min="0" max="1" step="0.1" value="0" class="form-control">
                <small>Controls tile variation (0 = uniform, 1 = highly varied)</small>
            </div>
        </div>
    `;
}

// Get SFX configuration form
function getSFXConfigForm() {
    return `
        <div class="config-form">
            <div class="form-group">
                <label for="effect-type">Effect Type</label>
                <select id="effect-type" name="effectType" class="form-control">
                    <option value="sword_attack">Sword Attack</option>
                    <option value="fireball">Fireball</option>
                    <option value="level_up">Level Up</option>
                    <option value="item_pickup">Item Pickup</option>
                    <option value="button_click">Button Click</option>
                    <option value="magic_spell">Magic Spell</option>
                    <option value="monster_roar">Monster Roar</option>
                    <option value="coin_collect">Coin Collect</option>
                    <option value="door_open">Door Open</option>
                </select>
            </div>

            <div class="form-group">
                <label for="duration">Duration (seconds)</label>
                <input type="number" id="duration" name="duration" min="0.1" max="10" step="0.1" value="1.0" class="form-control">
            </div>
        </div>
    `;
}

// Get music configuration form
function getMusicConfigForm() {
    return `
        <div class="config-form">
            <div class="form-group">
                <label for="music-style">Music Style</label>
                <select id="music-style" name="style" class="form-control">
                    <option value="village">Village</option>
                    <option value="combat">Combat</option>
                    <option value="dungeon">Dungeon</option>
                    <option value="ambient">Ambient</option>
                </select>
            </div>

            <div class="form-group">
                <label for="music-duration">Duration (seconds)</label>
                <input type="number" id="music-duration" name="duration" min="30" max="300" step="10" value="120" class="form-control">
            </div>
        </div>
    `;
}

// Get vehicle configuration form
function getVehicleConfigForm() {
    return `
        <div class="config-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="vehicle-type">Vehicle Category</label>
                    <select id="vehicle-type" name="vehicleType" class="form-control">
                        <option value="car">Automobile</option>
                        <option value="truck">Commercial Vehicle</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="spaceship">Spacecraft</option>
                        <option value="boat">Watercraft</option>
                        <option value="aircraft">Aircraft</option>
                        <option value="tank">Military Vehicle</option>
                        <option value="mech">Mech Suit</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="vehicle-era">Time Period</label>
                    <select id="vehicle-era" name="era" class="form-control">
                        <option value="modern">Modern (2020s)</option>
                        <option value="futuristic">Futuristic</option>
                        <option value="retro">Retro (1950s-1980s)</option>
                        <option value="medieval">Medieval</option>
                        <option value="prehistoric">Prehistoric</option>
                        <option value="steampunk">Steampunk</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="vehicle-size">Size Scale</label>
                    <input type="range" id="vehicle-size" name="size" min="0.5" max="3.0" step="0.1" value="1.0" class="form-control">
                    <small>Scale: 0.5x to 3.0x</small>
                </div>

                <div class="form-group">
                    <label for="vehicle-detail">Detail Level</label>
                    <input type="range" id="vehicle-detail" name="detailLevel" min="1" max="10" step="1" value="5" class="form-control">
                    <small>Complexity: 1 (simple) to 10 (highly detailed)</small>
                </div>
            </div>

            <div class="form-section">
                <h4>Color Scheme</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="primary-color">Primary Color</label>
                        <input type="color" id="primary-color" name="primaryColor" value="#FF0000" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="secondary-color">Secondary Color</label>
                        <input type="color" id="secondary-color" name="secondaryColor" value="#000000" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="accent-color">Accent Color</label>
                        <input type="color" id="accent-color" name="accentColor" value="#FFFFFF" class="form-control">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Condition & Customization</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="damage-level">Damage Level</label>
                        <input type="range" id="damage-level" name="damage" min="0" max="1" step="0.05" value="0" class="form-control">
                        <small>0 = pristine, 1 = heavily damaged</small>
                    </div>
                    <div class="form-group">
                        <label for="wear-level">Wear Level</label>
                        <input type="range" id="wear-level" name="wear" min="0" max="1" step="0.05" value="0" class="form-control">
                        <small>0 = brand new, 1 = heavily worn</small>
                    </div>
                </div>

                <div class="form-group">
                    <label>Optional Features</label>
                    <div class="checkbox-grid">
                        <label><input type="checkbox" name="features" value="lights"> Headlights</label>
                        <label><input type="checkbox" name="features" value="wheels"> Custom Wheels</label>
                        <label><input type="checkbox" name="features" value="spoiler"> Spoiler</label>
                        <label><input type="checkbox" name="features" value="turbo"> Turbo/Engine Mods</label>
                        <label><input type="checkbox" name="features" value="armor"> Armor Plating</label>
                        <label><input type="checkbox" name="features" value="weapons"> Weapon Systems</label>
                        <label><input type="checkbox" name="features" value="nitro"> Nitrous Boost</label>
                        <label><input type="checkbox" name="features" value="hover"> Hover Capability</label>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Advanced Options</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="vehicle-style">Art Style</label>
                        <select id="vehicle-style" name="artStyle" class="form-control">
                            <option value="realistic">Realistic</option>
                            <option value="cartoon">Cartoon</option>
                            <option value="pixel">Pixel Art</option>
                            <option value="lowpoly">Low Poly</option>
                            <option value="wireframe">Wireframe</option>
                            <option value="sketch">Sketch</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="perspective">Perspective</label>
                        <select id="perspective" name="perspective" class="form-control">
                            <option value="side">Side View</option>
                            <option value="top">Top View</option>
                            <option value="isometric">Isometric</option>
                            <option value="3quarter">3/4 View</option>
                            <option value="front">Front View</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get building configuration form
function getBuildingConfigForm() {
    return `
        <div class="config-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="building-category">Building Category</label>
                    <select id="building-category" name="buildingCategory" class="form-control">
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="military">Military</option>
                        <option value="religious">Religious</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="infrastructure">Infrastructure</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="building-era">Time Period</label>
                    <select id="building-era" name="era" class="form-control">
                        <option value="ancient">Ancient</option>
                        <option value="medieval">Medieval</option>
                        <option value="renaissance">Renaissance</option>
                        <option value="industrial">Industrial</option>
                        <option value="modern">Modern</option>
                        <option value="futuristic">Futuristic</option>
                        <option value="steampunk">Steampunk</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="building-size">Building Scale</label>
                    <input type="range" id="building-size" name="size" min="0.3" max="5.0" step="0.1" value="1.0" class="form-control">
                    <small>Scale: 0.3x to 5.0x</small>
                </div>

                <div class="form-group">
                    <label for="building-complexity">Detail Level</label>
                    <input type="range" id="building-complexity" name="detailLevel" min="1" max="10" step="1" value="5" class="form-control">
                    <small>Complexity: 1 (simple) to 10 (highly detailed)</small>
                </div>
            </div>

            <div class="form-section">
                <h4>Architectural Style</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="architectural-style">Style</label>
                        <select id="architectural-style" name="architecturalStyle" class="form-control">
                            <option value="gothic">Gothic</option>
                            <option value="baroque">Baroque</option>
                            <option value="classical">Classical</option>
                            <option value="modernist">Modernist</option>
                            <option value="brutalist">Brutalist</option>
                            <option value="art_deco">Art Deco</option>
                            <option value="victorian">Victorian</option>
                            <option value="colonial">Colonial</option>
                            <option value="japanese">Japanese</option>
                            <option value="mayan">Mayan</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="roof-style">Roof Style</label>
                        <select id="roof-style" name="roofStyle" class="form-control">
                            <option value="flat">Flat</option>
                            <option value="pitched">Pitched</option>
                            <option value="mansard">Mansard</option>
                            <option value="hipped">Hipped</option>
                            <option value="gabled">Gabled</option>
                            <option value="domed">Domed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Color Scheme</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="primary-color">Primary Color</label>
                        <input type="color" id="primary-color" name="primaryColor" value="#8B4513" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="secondary-color">Secondary Color</label>
                        <input type="color" id="secondary-color" name="secondaryColor" value="#654321" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="accent-color">Accent Color</label>
                        <input type="color" id="accent-color" name="accentColor" value="#2F4F4F" class="form-control">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="roof-color">Roof Color</label>
                        <input type="color" id="roof-color" name="roofColor" value="#654321" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="window-color">Window Color</label>
                        <input type="color" id="window-color" name="windowColor" value="#87CEEB" class="form-control">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Features & Amenities</h4>
                <div class="form-group">
                    <label>Structural Features</label>
                    <div class="checkbox-grid">
                        <label><input type="checkbox" name="features" value="chimney"> Chimney</label>
                        <label><input type="checkbox" name="features" value="porch"> Porch</label>
                        <label><input type="checkbox" name="features" value="balcony"> Balcony</label>
                        <label><input type="checkbox" name="features" value="tower"> Tower</label>
                        <label><input type="checkbox" name="features" value="spire"> Spire</label>
                        <label><input type="checkbox" name="features" value="dome"> Dome</label>
                        <label><input type="checkbox" name="features" value="columns"> Columns</label>
                        <label><input type="checkbox" name="features" value="fountain"> Fountain</label>
                    </div>
                </div>

                <div class="form-group">
                    <label>Environmental Features</label>
                    <div class="checkbox-grid">
                        <label><input type="checkbox" name="features" value="garden"> Garden</label>
                        <label><input type="checkbox" name="features" value="trees"> Trees</label>
                        <label><input type="checkbox" name="features" value="path"> Walking Path</label>
                        <label><input type="checkbox" name="features" value="fence"> Fence</label>
                        <label><input type="checkbox" name="features" value="statue"> Statue</label>
                        <label><input type="checkbox" name="features" value="bench"> Bench</label>
                        <label><input type="checkbox" name="features" value="lamp"> Lamp Post</label>
                        <label><input type="checkbox" name="features" value="well"> Well</label>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Advanced Options</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="building-art-style">Art Style</label>
                        <select id="building-art-style" name="artStyle" class="form-control">
                            <option value="realistic">Realistic</option>
                            <option value="cartoon">Cartoon</option>
                            <option value="pixel">Pixel Art</option>
                            <option value="lowpoly">Low Poly</option>
                            <option value="wireframe">Wireframe</option>
                            <option value="sketch">Sketch</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="building-perspective">Perspective</label>
                        <select id="building-perspective" name="perspective" class="form-control">
                            <option value="side">Side View</option>
                            <option value="front">Front View</option>
                            <option value="isometric">Isometric</option>
                            <option value="3quarter">3/4 View</option>
                            <option value="aerial">Aerial View</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="condition">Building Condition</label>
                        <input type="range" id="condition" name="condition" min="0" max="1" step="0.05" value="1" class="form-control">
                        <small>0 = ruined, 1 = pristine</small>
                    </div>
                    <div class="form-group">
                        <label for="lighting">Time of Day</label>
                        <select id="lighting" name="lighting" class="form-control">
                            <option value="daylight">Daylight</option>
                            <option value="sunset">Sunset</option>
                            <option value="night">Night</option>
                            <option value="dawn">Dawn</option>
                            <option value="overcast">Overcast</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get particle configuration form
function getParticleConfigForm() {
    return `
        <div class="config-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="effect-category">Effect Category</label>
                    <select id="effect-category" name="effectCategory" class="form-control">
                        <option value="combat">Combat Effects</option>
                        <option value="magic">Magic Effects</option>
                        <option value="environmental">Environmental</option>
                        <option value="mechanical">Mechanical</option>
                        <option value="atmospheric">Atmospheric</option>
                        <option value="energy">Energy Effects</option>
                        <option value="destruction">Destruction</option>
                        <option value="celebration">Celebration</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="effect-style">Visual Style</label>
                    <select id="effect-style" name="visualStyle" class="form-control">
                        <option value="realistic">Realistic</option>
                        <option value="cartoon">Cartoon</option>
                        <option value="fantasy">Fantasy</option>
                        <option value="sci-fi">Sci-Fi</option>
                        <option value="abstract">Abstract</option>
                        <option value="geometric">Geometric</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="particle-count">Particle Count</label>
                    <input type="range" id="particle-count" name="particleCount" min="10" max="1000" step="10" value="100" class="form-control">
                    <small>Number of particles: 10-1000</small>
                </div>

                <div class="form-group">
                    <label for="effect-duration">Effect Duration</label>
                    <input type="range" id="effect-duration" name="duration" min="0.5" max="10.0" step="0.5" value="2.0" class="form-control">
                    <small>Duration in seconds: 0.5-10.0</small>
                </div>
            </div>

            <div class="form-section">
                <h4>Color & Appearance</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="primary-color">Primary Color</label>
                        <input type="color" id="primary-color" name="primaryColor" value="#FFFFFF" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="secondary-color">Secondary Color</label>
                        <input type="color" id="secondary-color" name="secondaryColor" value="#FFFF00" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="glow-color">Glow Color</label>
                        <input type="color" id="glow-color" name="glowColor" value="#FFFFFF" class="form-control">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="particle-size">Particle Size</label>
                        <input type="range" id="particle-size" name="particleSize" min="1" max="20" step="1" value="3" class="form-control">
                        <small>Size in pixels: 1-20</small>
                    </div>
                    <div class="form-group">
                        <label for="opacity">Base Opacity</label>
                        <input type="range" id="opacity" name="opacity" min="0.1" max="1.0" step="0.1" value="0.8" class="form-control">
                        <small>Transparency: 0.1-1.0</small>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Motion & Behavior</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="speed">Movement Speed</label>
                        <input type="range" id="speed" name="speed" min="0.1" max="5.0" step="0.1" value="1.0" class="form-control">
                        <small>Particle speed multiplier</small>
                    </div>
                    <div class="form-group">
                        <label for="spread">Spread Angle</label>
                        <input type="range" id="spread" name="spread" min="0" max="360" step="15" value="180" class="form-control">
                        <small>Emission angle in degrees</small>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="gravity">Gravity Effect</label>
                        <input type="range" id="gravity" name="gravity" min="-2.0" max="2.0" step="0.1" value="0" class="form-control">
                        <small>Downward force: -2.0 to +2.0</small>
                    </div>
                    <div class="form-group">
                        <label for="wind">Wind Effect</label>
                        <input type="range" id="wind" name="wind" min="-2.0" max="2.0" step="0.1" value="0" class="form-control">
                        <small>Horizontal force: -2.0 to +2.0</small>
                    </div>
                </div>

                <div class="form-group">
                    <label>Motion Patterns</label>
                    <div class="checkbox-grid">
                        <label><input type="checkbox" name="patterns" value="radial"> Radial Burst</label>
                        <label><input type="checkbox" name="patterns" value="spiral"> Spiral</label>
                        <label><input type="checkbox" name="patterns" value="wave"> Wave Motion</label>
                        <label><input type="checkbox" name="patterns" value="random"> Random</label>
                        <label><input type="checkbox" name="patterns" value="circular"> Circular</label>
                        <label><input type="checkbox" name="patterns" value="linear"> Linear</label>
                        <label><input type="checkbox" name="patterns" value="bounce"> Bounce</label>
                        <label><input type="checkbox" name="patterns" value="fade"> Fade Out</label>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Advanced Effects</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="blend-mode">Blend Mode</label>
                        <select id="blend-mode" name="blendMode" class="form-control">
                            <option value="normal">Normal</option>
                            <option value="additive">Additive</option>
                            <option value="multiply">Multiply</option>
                            <option value="screen">Screen</option>
                            <option value="overlay">Overlay</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="lifetime">Particle Lifetime</label>
                        <input type="range" id="lifetime" name="lifetime" min="0.5" max="5.0" step="0.5" value="2.0" class="form-control">
                        <small>How long particles live (seconds)</small>
                    </div>
                </div>

                <div class="form-group">
                    <label>Special Effects</label>
                    <div class="checkbox-grid">
                        <label><input type="checkbox" name="effects" value="glow"> Glow Effect</label>
                        <label><input type="checkbox" name="effects" value="trail"> Particle Trails</label>
                        <label><input type="checkbox" name="effects" value="spark"> Spark Emission</label>
                        <label><input type="checkbox" name="effects" value="ripple"> Ripple Effect</label>
                        <label><input type="checkbox" name="effects" value="distortion"> Distortion</label>
                        <label><input type="checkbox" name="effects" value="reflection"> Reflection</label>
                        <label><input type="checkbox" name="effects" value="shadow"> Drop Shadow</label>
                        <label><input type="checkbox" name="effects" value="blur"> Motion Blur</label>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Animation & Timing</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="frame-count">Animation Frames</label>
                        <input type="number" id="frame-count" name="frameCount" min="1" max="60" value="16" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="fps">Animation Speed</label>
                        <input type="range" id="fps" name="fps" min="8" max="60" step="4" value="24" class="form-control">
                        <small>Frames per second: 8-60</small>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="loop">Loop Animation</label>
                        <select id="loop" name="loop" class="form-control">
                            <option value="once">Play Once</option>
                            <option value="loop">Loop Forever</option>
                            <option value="pingpong">Ping-Pong</option>
                            <option value="reverse">Reverse Loop</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="trigger">Trigger Type</label>
                        <select id="trigger" name="trigger" class="form-control">
                            <option value="instant">Instant</option>
                            <option value="continuous">Continuous</option>
                            <option value="burst">Burst</option>
                            <option value="timed">Timed</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get UI element configuration form
function getUIConfigForm() {
    return `
        <div class="config-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="element-category">Element Category</label>
                    <select id="element-category" name="elementCategory" class="form-control">
                        <option value="interactive">Interactive Elements</option>
                        <option value="containers">Containers & Panels</option>
                        <option value="indicators">Progress & Indicators</option>
                        <option value="navigation">Navigation Elements</option>
                        <option value="input">Input Controls</option>
                        <option value="display">Display Elements</option>
                        <option value="icons">Icons & Symbols</option>
                        <option value="decorative">Decorative Elements</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="ui-style">UI Style Theme</label>
                    <select id="ui-style" name="uiStyle" class="form-control">
                        <option value="modern">Modern/Flat</option>
                        <option value="material">Material Design</option>
                        <option value="skeuomorphic">Skeuomorphic</option>
                        <option value="retro">Retro/Pixel</option>
                        <option value="minimalist">Minimalist</option>
                        <option value="neumorphic">Neumorphic</option>
                        <option value="glassmorphism">Glassmorphism</option>
                        <option value="cyberpunk">Cyberpunk</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="element-size">Element Size</label>
                    <input type="range" id="element-size" name="size" min="16" max="256" step="8" value="64" class="form-control">
                    <small>Size in pixels: 16-256</small>
                </div>

                <div class="form-group">
                    <label for="corner-radius">Corner Radius</label>
                    <input type="range" id="corner-radius" name="cornerRadius" min="0" max="50" step="2" value="8" class="form-control">
                    <small>Border radius: 0-50px</small>
                </div>
            </div>

            <div class="form-section">
                <h4>Color Scheme</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="primary-color">Primary Color</label>
                        <input type="color" id="primary-color" name="primaryColor" value="#4A90E2" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="secondary-color">Secondary Color</label>
                        <input type="color" id="secondary-color" name="secondaryColor" value="#FFFFFF" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="accent-color">Accent Color</label>
                        <input type="color" id="accent-color" name="accentColor" value="#FF6B6B" class="form-control">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="background-color">Background Color</label>
                        <input type="color" id="background-color" name="backgroundColor" value="#F5F5F5" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="border-color">Border Color</label>
                        <input type="color" id="border-color" name="borderColor" value="#E0E0E0" class="form-control">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Typography & Content</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="font-family">Font Family</label>
                        <select id="font-family" name="fontFamily" class="form-control">
                            <option value="sans-serif">Sans Serif</option>
                            <option value="serif">Serif</option>
                            <option value="monospace">Monospace</option>
                            <option value="display">Display</option>
                            <option value="handwriting">Handwriting</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="font-weight">Font Weight</label>
                        <select id="font-weight" name="fontWeight" class="form-control">
                            <option value="300">Light (300)</option>
                            <option value="400">Regular (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">Semi Bold (600)</option>
                            <option value="700">Bold (700)</option>
                            <option value="900">Black (900)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="text-content">Text Content</label>
                    <input type="text" id="text-content" name="textContent" placeholder="Button text, label, etc..." class="form-control">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="text-size">Text Size</label>
                        <input type="range" id="text-size" name="textSize" min="8" max="72" step="2" value="16" class="form-control">
                        <small>Font size: 8-72px</small>
                    </div>
                    <div class="form-group">
                        <label for="text-align">Text Alignment</label>
                        <select id="text-align" name="textAlign" class="form-control">
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Visual Effects & States</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="shadow-depth">Shadow Depth</label>
                        <input type="range" id="shadow-depth" name="shadowDepth" min="0" max="20" step="1" value="2" class="form-control">
                        <small>Drop shadow intensity: 0-20</small>
                    </div>
                    <div class="form-group">
                        <label for="glow-intensity">Glow Intensity</label>
                        <input type="range" id="glow-intensity" name="glowIntensity" min="0" max="100" step="5" value="0" class="form-control">
                        <small>Glow effect: 0-100%</small>
                    </div>
                </div>

                <div class="form-group">
                    <label>Element States</label>
                    <div class="checkbox-grid">
                        <label><input type="checkbox" name="states" value="normal" checked> Normal</label>
                        <label><input type="checkbox" name="states" value="hover"> Hover</label>
                        <label><input type="checkbox" name="states" value="active"> Active/Pressed</label>
                        <label><input type="checkbox" name="states" value="focus"> Focus</label>
                        <label><input type="checkbox" name="states" value="disabled"> Disabled</label>
                        <label><input type="checkbox" name="states" value="selected"> Selected</label>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Advanced Properties</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="border-width">Border Width</label>
                        <input type="range" id="border-width" name="borderWidth" min="0" max="10" step="1" value="1" class="form-control">
                        <small>Border thickness: 0-10px</small>
                    </div>
                    <div class="form-group">
                        <label for="padding">Padding</label>
                        <input type="range" id="padding" name="padding" min="0" max="50" step="2" value="12" class="form-control">
                        <small>Internal spacing: 0-50px</small>
                    </div>
                </div>

                <div class="form-group">
                    <label>Special Features</label>
                    <div class="checkbox-grid">
                        <label><input type="checkbox" name="features" value="gradient"> Gradient Background</label>
                        <label><input type="checkbox" name="features" value="animation"> Hover Animation</label>
                        <label><input type="checkbox" name="features" value="ripple"> Ripple Effect</label>
                        <label><input type="checkbox" name="features" value="tooltip"> Tooltip Support</label>
                        <label><input type="checkbox" name="features" value="loading"> Loading State</label>
                        <label><input type="checkbox" name="features" value="responsive"> Responsive Design</label>
                        <label><input type="checkbox" name="features" value="accessibility"> Accessibility Features</label>
                        <label><input type="checkbox" name="features" value="darkmode"> Dark Mode Support</label>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>Export & Compatibility</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="resolution">Export Resolution</label>
                        <select id="resolution" name="resolution" class="form-control">
                            <option value="1x">1x (Standard)</option>
                            <option value="2x">2x (Retina)</option>
                            <option value="3x">3x (High DPI)</option>
                            <option value="4x">4x (Ultra HD)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="format">Export Format</label>
                        <select id="format" name="format" class="form-control">
                            <option value="png">PNG (Transparent)</option>
                            <option value="svg">SVG (Vector)</option>
                            <option value="pdf">PDF (Print)</option>
                            <option value="webp">WebP (Web)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Platform Compatibility</label>
                    <div class="checkbox-grid">
                        <label><input type="checkbox" name="platforms" value="web" checked> Web Browsers</label>
                        <label><input type="checkbox" name="platforms" value="mobile"> Mobile Apps</label>
                        <label><input type="checkbox" name="platforms" value="desktop"> Desktop Apps</label>
                        <label><input type="checkbox" name="platforms" value="gaming"> Game Engines</label>
                        <label><input type="checkbox" name="platforms" value="print"> Print Media</label>
                        <label><input type="checkbox" name="platforms" value="accessibility"> Screen Readers</label>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Setup configuration form listeners
function setupConfigFormListeners() {
    // Add listeners for form changes
    elements.configContent.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('change', updateCurrentConfig);
        input.addEventListener('input', updateCurrentConfig); // Real-time updates for sliders
    });

    // Setup real-time parameter adjustment sliders
    setupRealTimeSliders();
}

// Setup real-time parameter adjustment sliders
function setupRealTimeSliders() {
    const sliders = elements.configContent.querySelectorAll('input[type="range"]');

    sliders.forEach(slider => {
        // Add value display
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'slider-value';
        valueDisplay.textContent = slider.value;

        // Insert after slider
        slider.parentNode.insertBefore(valueDisplay, slider.nextSibling);

        // Update value display in real-time
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;

            // Add visual feedback for slider changes
            this.style.setProperty('--value', this.value);
            this.style.setProperty('--max', this.max);
            this.style.setProperty('--min', this.min);

            // Trigger real-time preview update
            updateRealTimePreview(this.name, this.value, this.type);
        });

        // Initialize CSS custom properties
        slider.style.setProperty('--value', slider.value);
        slider.style.setProperty('--max', slider.max);
        slider.style.setProperty('--min', slider.min);
    });

    // Add keyboard shortcuts for sliders
    document.addEventListener('keydown', handleSliderKeyboard);
}

// Handle keyboard shortcuts for sliders
function handleSliderKeyboard(event) {
    const activeElement = document.activeElement;

    if (activeElement && activeElement.type === 'range') {
        const step = parseFloat(activeElement.step) || 1;
        const min = parseFloat(activeElement.min) || 0;
        const max = parseFloat(activeElement.max) || 100;
        let newValue = parseFloat(activeElement.value);

        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowRight':
                newValue = Math.min(max, newValue + step);
                event.preventDefault();
                break;
            case 'ArrowDown':
            case 'ArrowLeft':
                newValue = Math.max(min, newValue - step);
                event.preventDefault();
                break;
            case 'PageUp':
                newValue = Math.min(max, newValue + step * 10);
                event.preventDefault();
                break;
            case 'PageDown':
                newValue = Math.max(min, newValue - step * 10);
                event.preventDefault();
                break;
            case 'Home':
                newValue = min;
                event.preventDefault();
                break;
            case 'End':
                newValue = max;
                event.preventDefault();
                break;
        }

        if (newValue !== parseFloat(activeElement.value)) {
            activeElement.value = newValue;
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
            activeElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

// Update real-time preview based on parameter changes
function updateRealTimePreview(parameterName, value, inputType) {
    // Only update preview for certain parameters to avoid excessive updates
    const previewParameters = [
        'size', 'detailLevel', 'damage', 'wear', 'intensity',
        'particleCount', 'duration', 'speed', 'opacity'
    ];

    if (!previewParameters.includes(parameterName)) {
        return;
    }

    // Debounce preview updates to avoid excessive processing
    clearTimeout(window.previewTimeout);
    window.previewTimeout = setTimeout(() => {
        updatePreviewWithCurrentConfig();
    }, 300); // 300ms debounce
}

// Update preview with current configuration
async function updatePreviewWithCurrentConfig() {
    if (!App.currentAssetType || !App.currentConfig) {
        return;
    }

    try {
        // Show loading indicator for preview
        const previewContent = elements.previewContent;
        const originalContent = previewContent.innerHTML;

        previewContent.innerHTML = `
            <div class="preview-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Updating preview...</p>
            </div>
        `;

        // Generate preview asset
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }

        const previewAsset = await window.electronAPI.generateAsset(App.currentAssetType, App.currentConfig);

        // Update preview display
        if (previewAsset.type === 'sfx' || previewAsset.type === 'music' || previewAsset.type === 'ambient') {
            previewContent.innerHTML = `
                <div class="audio-preview">
                    <h4>Live Preview</h4>
                    <audio controls>
                        <source src="data:audio/wav;base64,${previewAsset.audio.data}" type="audio/wav">
                    </audio>
                    <div class="asset-info">
                        <p><strong>Type:</strong> ${previewAsset.type}</p>
                        <p><strong>Duration:</strong> ${previewAsset.audio.duration.toFixed(1)}s</p>
                        <p><strong>Sample Rate:</strong> ${previewAsset.audio.sampleRate}Hz</p>
                    </div>
                    <div class="preview-note">
                        <small>💡 Real-time preview - changes apply instantly</small>
                    </div>
                </div>
            `;
        } else {
            previewContent.innerHTML = `
                <div class="image-preview">
                    <h4>Live Preview</h4>
                    <img src="data:image/png;base64,${previewAsset.sprite.data}"
                         alt="Live Preview"
                         style="max-width: 100%; height: auto; border: 1px solid #ddd;">
                    <div class="asset-info">
                        <p><strong>Type:</strong> ${previewAsset.type}</p>
                        <p><strong>Dimensions:</strong> ${previewAsset.sprite.width}x${previewAsset.sprite.height}</p>
                        <p><strong>Format:</strong> ${previewAsset.sprite.format.toUpperCase()}</p>
                    </div>
                    <div class="preview-note">
                        <small>💡 Real-time preview - changes apply instantly</small>
                    </div>
                </div>
            `;
        }

        // Update status
        showStatus('Preview updated successfully!', 'success');

    } catch (error) {
        console.error('Error updating preview:', error);
        showStatus('Failed to update preview', 'error');

        // Restore original content on error
        elements.previewContent.innerHTML = originalContent;
    }
}

// Update current configuration
function updateCurrentConfig() {
    const formData = new FormData();
    const inputs = elements.configContent.querySelectorAll('input[name], select[name]');

    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (input.checked) {
                if (!formData.has(input.name)) {
                    formData.set(input.name, []);
                }
                const values = formData.get(input.name);
                values.push(input.value);
                formData.set(input.name, values);
            }
        } else {
            formData.set(input.name, input.value);
        }
    });

    // Convert to object
    const config = {};
    for (const [key, value] of formData.entries()) {
        config[key] = value;
    }

    App.currentConfig = config;
}

// Handle quick actions from dashboard
function handleQuickAction(action) {
    const type = action.replace('generate-', '');
    selectAssetType(type);
    switchView('generator');
}

// Handle asset generation
async function handleGenerateAsset() {
    if (!App.currentAssetType) {
        showStatus('Please select an asset type first', 'error');
        return;
    }

    try {
        showLoading('Generating asset...');
        elements.generateBtn.disabled = true;
        elements.generateBtn.textContent = 'Generating...';

        // Generate asset using main process
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }

        const asset = await window.electronAPI.generateAsset(App.currentAssetType, App.currentConfig);

        App.generatedAsset = asset;

        // Show preview
        showAssetPreview(asset);

        // Enable save button
        elements.saveBtn.disabled = false;

        showStatus('Asset generated successfully!', 'success');

    } catch (error) {
        console.error('Error generating asset:', error);
        showStatus('Failed to generate asset: ' + error.message, 'error');
    } finally {
        hideLoading();
        elements.generateBtn.disabled = false;
        elements.generateBtn.textContent = 'Generate Asset';
    }
}

// Handle asset regeneration
async function handleRegenerateAsset() {
    if (!App.generatedAsset) {
        showStatus('No asset to regenerate', 'error');
        return;
    }

    await handleGenerateAsset();
}

// Handle asset saving
async function handleSaveAsset() {
    if (!App.generatedAsset) {
        showStatus('No asset to save', 'error');
        return;
    }

    try {
        showLoading('Saving asset...');

        // Save to database
        const savedAsset = {
            ...App.generatedAsset,
            name: App.generatedAsset.name || `${App.currentAssetType} Asset`,
            quality_score: 85 // Default quality score
        };

        await window.electronAPI.dbSaveAsset(savedAsset);

        // Add to local assets array
        App.assets.unshift(savedAsset);

        // Update UI
        updateStats();
        updateRecentAssets();

        showStatus('Asset saved successfully!', 'success');

        // Reset for next generation
        App.generatedAsset = null;
        elements.saveBtn.disabled = true;

    } catch (error) {
        console.error('Error saving asset:', error);
        showStatus('Failed to save asset: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Show asset preview
function showAssetPreview(asset) {
    let previewHtml = '';

    if (asset.type === 'sfx' || asset.type === 'music' || asset.type === 'ambient') {
        // Audio preview
        previewHtml = `
            <div class="audio-preview">
                <h4>${asset.name}</h4>
                <audio controls>
                    <source src="data:audio/wav;base64,${asset.audio.data}" type="audio/wav">
                    Your browser does not support audio playback.
                </audio>
                <div class="asset-info">
                    <p><strong>Type:</strong> ${asset.type}</p>
                    <p><strong>Duration:</strong> ${asset.audio.duration}s</p>
                    <p><strong>Sample Rate:</strong> ${asset.audio.sampleRate}Hz</p>
                </div>
            </div>
        `;
    } else {
        // Image preview
        previewHtml = `
            <div class="image-preview">
                <h4>${asset.name}</h4>
                <img src="data:image/png;base64,${asset.sprite.data}"
                     alt="${asset.name}"
                     style="max-width: 100%; height: auto; border: 1px solid #ddd;">
                <div class="asset-info">
                    <p><strong>Type:</strong> ${asset.type}</p>
                    <p><strong>Dimensions:</strong> ${asset.sprite.width}x${asset.sprite.height}</p>
                    <p><strong>Format:</strong> ${asset.sprite.format.toUpperCase()}</p>
                </div>
            </div>
        `;
    }

    elements.previewContent.innerHTML = previewHtml;
}

// Handle global search
function handleGlobalSearch() {
    const query = elements.globalSearch.value.trim();
    if (query) {
        // Filter assets based on search
        const filteredAssets = App.assets.filter(asset =>
            asset.name.toLowerCase().includes(query.toLowerCase()) ||
            asset.type.toLowerCase().includes(query.toLowerCase())
        );

        // Update library view with filtered results
        if (App.currentView === 'library') {
            updateLibrary(filteredAssets);
        }
    } else {
        // Show all assets
        if (App.currentView === 'library') {
            updateLibrary();
        }
    }
}

// Update dashboard
function updateDashboard() {
    updateStats();
    updateRecentAssets();
}

// Update statistics
function updateStats() {
    const totalAssets = App.assets.length;
    document.getElementById('total-assets').textContent = totalAssets;

    // Count by type
    const typeCounts = {};
    App.assets.forEach(asset => {
        typeCounts[asset.type] = (typeCounts[asset.type] || 0) + 1;
    });

    // Update stat cards
    document.getElementById('stat-characters').textContent = typeCounts.character || 0;
    document.getElementById('stat-monsters').textContent = typeCounts.monster || 0;
    document.getElementById('stat-items').textContent = typeCounts.item || 0;
    document.getElementById('stat-tiles').textContent = typeCounts.tile || 0;
    document.getElementById('stat-sfx').textContent = typeCounts.sfx || 0;
    document.getElementById('stat-music').textContent = typeCounts.music || 0;

    // Today generated (simplified - just show recent count)
    const todayGenerated = App.assets.filter(asset => {
        const today = new Date();
        const assetDate = new Date(asset.created_at);
        return assetDate.toDateString() === today.toDateString();
    }).length;

    document.getElementById('today-generated').textContent = todayGenerated;
}

// Update recent assets
function updateRecentAssets() {
    const recentAssets = App.assets.slice(0, 6); // Show 6 most recent
    const container = document.getElementById('recent-assets');

    if (recentAssets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>No assets generated yet</p>
                <button class="btn btn-primary" onclick="switchView('generator')">Generate Your First Asset</button>
            </div>
        `;
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

    container.innerHTML = `<div class="asset-grid">${html}</div>`;
}

// Update library view
function updateLibrary(filteredAssets = null) {
    const assets = filteredAssets || App.assets;
    const container = document.getElementById('library-content');

    if (assets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>No assets found</p>
                <button class="btn btn-primary" onclick="switchView('generator')">Generate New Asset</button>
            </div>
        `;
        return;
    }

    let html = '';
    assets.forEach(asset => {
        if (asset.type === 'sfx' || asset.type === 'music' || asset.type === 'ambient') {
            html += `
                <div class="asset-card audio-card" data-asset-id="${asset.id}">
                    <div class="asset-preview">
                        <div class="audio-waveform" id="waveform-${asset.id}">
                            <canvas width="200" height="60"></canvas>
                        </div>
                        <div class="audio-controls">
                            <button class="play-btn" data-asset-id="${asset.id}">
                                <i class="fas fa-play"></i>
                            </button>
                            <div class="audio-progress">
                                <div class="progress-bar" id="progress-${asset.id}">
                                    <div class="progress-fill"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="asset-details">
                        <h4>${asset.name}</h4>
                        <p>Type: ${asset.type}</p>
                        <p>Duration: ${asset.audio ? asset.audio.duration.toFixed(1) : 'N/A'}s</p>
                        <p>Sample Rate: ${asset.audio ? asset.audio.sampleRate : 'N/A'}Hz</p>
                        <p>Created: ${new Date(asset.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="asset-actions">
                        <button class="btn btn-sm btn-primary play-asset-btn" data-asset-id="${asset.id}">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="btn btn-sm btn-secondary export-asset-btn" data-asset-id="${asset.id}">
                            <i class="fas fa-download"></i> Export
                        </button>
                        <button class="btn btn-sm btn-danger delete-asset-btn" data-asset-id="${asset.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="asset-card image-card" data-asset-id="${asset.id}">
                    <div class="asset-preview">
                        <img src="data:image/png;base64,${asset.sprite.data}" alt="${asset.name}">
                    </div>
                    <div class="asset-details">
                        <h4>${asset.name}</h4>
                        <p>Type: ${asset.type}</p>
                        <p>Size: ${asset.sprite.width}x${asset.sprite.height}</p>
                        <p>Created: ${new Date(asset.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="asset-actions">
                        <button class="btn btn-sm btn-primary view-asset-btn" data-asset-id="${asset.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-secondary export-asset-btn" data-asset-id="${asset.id}">
                            <i class="fas fa-download"></i> Export
                        </button>
                        <button class="btn btn-sm btn-danger delete-asset-btn" data-asset-id="${asset.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = `<div class="asset-grid">${html}</div>`;

    // Setup audio asset event listeners
    setupAudioAssetListeners();

    // Generate waveforms for audio assets
    assets.forEach(asset => {
        if (asset.type === 'sfx' || asset.type === 'music' || asset.type === 'ambient') {
            generateAudioWaveform(asset);
        }
    });

    // Setup audio tagging for audio assets
    setupAudioTagging();

    // Setup batch tagging controls
    setupBatchAudioTagging();

    // Add batch selection checkboxes
    addBatchSelectionCheckboxes();
}

// Update settings view
function updateSettings() {
    // Load current settings into form
    document.getElementById('max-batch-size').value = App.settings.maxBatchSize || 50;
    document.getElementById('default-quality').value = App.settings.defaultQuality || 0.9;

    // Update export format checkboxes
    const exportFormats = App.settings.exportFormats || ['png'];
    document.querySelectorAll('input[name="export-format"]').forEach(checkbox => {
        checkbox.checked = exportFormats.includes(checkbox.value);
    });
}

// Handle export assets
async function handleExportAssets() {
    if (App.assets.length === 0) {
        showStatus('No assets to export', 'error');
        return;
    }

    try {
        // Open directory selection dialog
        const result = await window.electronAPI.dialogOpenDirectory();

        if (result.canceled) return;

        const exportPath = result.filePaths[0];

        showLoading('Exporting assets...');

        // Export each asset
        for (const asset of App.assets) {
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

        showStatus(`Exported ${App.assets.length} assets successfully!`, 'success');

    } catch (error) {
        console.error('Error exporting assets:', error);
        showStatus('Failed to export assets: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Utility functions
function showLoading(text = 'Loading...') {
    elements.loadingText.textContent = text;
    elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

function showStatus(message, type = 'info') {
    elements.statusText.textContent = message;
    elements.statusText.className = `status-${type}`;

    // Auto-clear status after 5 seconds
    setTimeout(() => {
        elements.statusText.textContent = 'Ready';
        elements.statusText.className = '';
    }, 5000);
}

// Setup audio asset event listeners
function setupAudioAssetListeners() {
    // Play/pause buttons
    document.querySelectorAll('.play-asset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const assetId = e.currentTarget.dataset.assetId;
            handleAudioPlayback(assetId);
        });
    });

    // Export buttons
    document.querySelectorAll('.export-asset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const assetId = e.currentTarget.dataset.assetId;
            handleAssetExport(assetId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-asset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const assetId = e.currentTarget.dataset.assetId;
            handleAssetDelete(assetId);
        });
    });

    // View buttons for images
    document.querySelectorAll('.view-asset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const assetId = e.currentTarget.dataset.assetId;
            handleAssetView(assetId);
        });
    });
}

// Handle audio playback
async function handleAudioPlayback(assetId) {
    const asset = App.assets.find(a => a.id === assetId);
    if (!asset) return;

    try {
        // Create audio element for playback
        const audioData = `data:audio/wav;base64,${asset.audio.data}`;
        const audio = new Audio(audioData);

        // Update button state
        const playBtn = document.querySelector(`.play-asset-btn[data-asset-id="${assetId}"]`);
        const originalIcon = playBtn.innerHTML;

        playBtn.innerHTML = '<i class="fas fa-pause"></i> Playing';
        playBtn.disabled = true;

        // Play audio
        await audio.play();

        // Reset button when audio ends
        audio.onended = () => {
            playBtn.innerHTML = originalIcon;
            playBtn.disabled = false;
        };

        // Handle play/pause toggle
        audio.onplay = () => {
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Playing';
        };

        audio.onpause = () => {
            playBtn.innerHTML = originalIcon;
        };

    } catch (error) {
        console.error('Error playing audio:', error);
        showStatus('Failed to play audio', 'error');
    }
}

// Handle asset export
async function handleAssetExport(assetId) {
    const asset = App.assets.find(a => a.id === assetId);
    if (!asset) return;

    try {
        // Open save dialog
        const result = await window.electronAPI.dialogSaveFile({
            defaultPath: `${asset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${asset.type === 'sfx' || asset.type === 'music' || asset.type === 'ambient' ? 'wav' : 'png'}`,
            filters: asset.type === 'sfx' || asset.type === 'music' || asset.type === 'ambient' ? [
                { name: 'WAV Audio', extensions: ['wav'] },
                { name: 'MP3 Audio', extensions: ['mp3'] },
                { name: 'OGG Audio', extensions: ['ogg'] }
            ] : [
                { name: 'PNG Image', extensions: ['png'] },
                { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
                { name: 'WebP Image', extensions: ['webp'] }
            ]
        });

        if (result.canceled) return;

        showLoading('Exporting asset...');

        // Export the asset
        if (asset.type === 'sfx' || asset.type === 'music' || asset.type === 'ambient') {
            await window.electronAPI.fsSaveFile(result.filePath, asset.audio.data, 'base64');
        } else {
            const imageBuffer = Buffer.from(asset.sprite.data, 'base64');
            await window.electronAPI.fsSaveFile(result.filePath, imageBuffer);
        }

        showStatus('Asset exported successfully!', 'success');

    } catch (error) {
        console.error('Error exporting asset:', error);
        showStatus('Failed to export asset', 'error');
    } finally {
        hideLoading();
    }
}

// Handle asset deletion
async function handleAssetDelete(assetId) {
    const asset = App.assets.find(a => a.id === assetId);
    if (!asset) return;

    if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) {
        return;
    }

    try {
        showLoading('Deleting asset...');

        // Delete from database
        await window.electronAPI.dbDeleteAsset(assetId);

        // Remove from local array
        App.assets = App.assets.filter(a => a.id !== assetId);

        // Update UI
        updateStats();
        updateRecentAssets();
        updateLibrary();

        showStatus('Asset deleted successfully!', 'success');

    } catch (error) {
        console.error('Error deleting asset:', error);
        showStatus('Failed to delete asset', 'error');
    } finally {
        hideLoading();
    }
}

// Handle asset view
function handleAssetView(assetId) {
    const asset = App.assets.find(a => a.id === assetId);
    if (!asset) return;

    // Create modal for viewing asset
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${asset.name}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${asset.type === 'sfx' || asset.type === 'music' || asset.type === 'ambient' ?
                    `<audio controls style="width: 100%;">
                        <source src="data:audio/wav;base64,${asset.audio.data}" type="audio/wav">
                    </audio>
                    <div class="asset-details">
                        <p><strong>Type:</strong> ${asset.type}</p>
                        <p><strong>Duration:</strong> ${asset.audio.duration.toFixed(1)}s</p>
                        <p><strong>Sample Rate:</strong> ${asset.audio.sampleRate}Hz</p>
                        <p><strong>Created:</strong> ${new Date(asset.created_at).toLocaleString()}</p>
                    </div>` :
                    `<img src="data:image/png;base64,${asset.sprite.data}" style="max-width: 100%; height: auto;">
                    <div class="asset-details">
                        <p><strong>Type:</strong> ${asset.type}</p>
                        <p><strong>Size:</strong> ${asset.sprite.width}x${asset.sprite.height}</p>
                        <p><strong>Format:</strong> ${asset.sprite.format.toUpperCase()}</p>
                        <p><strong>Created:</strong> ${new Date(asset.created_at).toLocaleString()}</p>
                    </div>`
                }
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Generate audio waveform visualization
function generateAudioWaveform(asset) {
    const canvas = document.querySelector(`#waveform-${asset.id} canvas`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Decode audio data (simplified - in real implementation you'd use Web Audio API)
    try {
        // Create a simple waveform visualization
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const samples = 100; // Number of waveform points to draw
        const step = Math.floor(asset.audio.duration * asset.audio.sampleRate / samples);

        for (let i = 0; i < samples; i++) {
            const x = (i / samples) * width;
            const y = height / 2 + (Math.sin(i * 0.1) * height / 4); // Simplified waveform

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

    } catch (error) {
        console.error('Error generating waveform:', error);
        // Fallback: draw a simple line
        ctx.strokeStyle = '#ccc';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }
}

// Audio tagging functionality
function setupAudioTagging() {
    // Add tag input to audio cards
    document.querySelectorAll('.audio-card').forEach(card => {
        const assetId = card.dataset.assetId;
        const asset = App.assets.find(a => a.id === assetId);
        if (!asset) return;

        // Add tag display area
        const detailsDiv = card.querySelector('.asset-details');
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'asset-tags';
        tagsDiv.id = `tags-${assetId}`;

        // Add tag input
        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.placeholder = 'Add tags...';
        tagInput.className = 'tag-input';
        tagInput.id = `tag-input-${assetId}`;

        // Add tag button
        const addTagBtn = document.createElement('button');
        addTagBtn.textContent = 'Add Tag';
        addTagBtn.className = 'btn btn-sm btn-secondary';
        addTagBtn.onclick = () => addTagToAsset(assetId);

        tagsDiv.appendChild(tagInput);
        tagsDiv.appendChild(addTagBtn);
        detailsDiv.appendChild(tagsDiv);

        // Load existing tags
        loadAssetTags(assetId);
    });
}

function loadAssetTags(assetId) {
    if (!window.electronAPI) return;

    window.electronAPI.dbGetAssetTags(assetId).then(tags => {
        const tagsDiv = document.getElementById(`tags-${assetId}`);
        if (!tagsDiv) return;

        // Clear existing tags display
        const existingTags = tagsDiv.querySelectorAll('.tag-chip');
        existingTags.forEach(tag => tag.remove());

        // Add tag chips
        tags.forEach(tag => {
            const tagChip = document.createElement('span');
            tagChip.className = 'tag-chip';
            tagChip.style.backgroundColor = tag.color;
            tagChip.textContent = tag.name;

            // Add remove button
            const removeBtn = document.createElement('span');
            removeBtn.className = 'tag-remove';
            removeBtn.textContent = '×';
            removeBtn.onclick = () => removeTagFromAsset(assetId, tag.name);

            tagChip.appendChild(removeBtn);
            tagsDiv.insertBefore(tagChip, tagsDiv.lastElementChild);
        });
    }).catch(error => {
        console.error('Error loading asset tags:', error);
    });
}

function addTagToAsset(assetId) {
    const tagInput = document.getElementById(`tag-input-${assetId}`);
    const tagName = tagInput.value.trim();

    if (!tagName) return;

    if (!window.electronAPI) {
        showStatus('Database API not available', 'error');
        return;
    }

    // Determine category based on asset type
    const asset = App.assets.find(a => a.id === assetId);
    let category = 'general';
    if (asset) {
        if (asset.type === 'sfx') category = 'sfx';
        else if (asset.type === 'music') category = 'music';
        else if (asset.type === 'ambient') category = 'ambient';
    }

    window.electronAPI.dbAddAudioTag(assetId, tagName, category).then(() => {
        tagInput.value = '';
        loadAssetTags(assetId);
        showStatus(`Tag "${tagName}" added successfully!`, 'success');
    }).catch(error => {
        console.error('Error adding tag:', error);
        showStatus('Failed to add tag', 'error');
    });
}

function removeTagFromAsset(assetId, tagName) {
    if (!window.electronAPI) {
        showStatus('Database API not available', 'error');
        return;
    }

    window.electronAPI.dbRemoveTag(assetId, tagName).then(() => {
        loadAssetTags(assetId);
        showStatus(`Tag "${tagName}" removed successfully!`, 'success');
    }).catch(error => {
        console.error('Error removing tag:', error);
        showStatus('Failed to remove tag', 'error');
    });
}

// Batch audio tagging
function setupBatchAudioTagging() {
    // Add batch tagging controls to library
    const libraryControls = document.querySelector('.library-controls');
    if (!libraryControls) return;

    const batchTagDiv = document.createElement('div');
    batchTagDiv.className = 'batch-tag-controls';
    batchTagDiv.innerHTML = `
        <div class="batch-tag-input">
            <input type="text" id="batch-tag-input" placeholder="Batch tag selected audio assets..." class="form-control">
            <select id="batch-tag-category" class="form-control">
                <option value="general">General</option>
                <option value="sfx">SFX</option>
                <option value="music">Music</option>
                <option value="ambient">Ambient</option>
                <option value="voice">Voice</option>
                <option value="ui">UI</option>
            </select>
            <button id="batch-tag-btn" class="btn btn-primary">Batch Tag</button>
        </div>
    `;

    libraryControls.appendChild(batchTagDiv);

    // Setup batch tagging event listener
    document.getElementById('batch-tag-btn').addEventListener('click', handleBatchTagging);
}

function handleBatchTagging() {
    const tagInput = document.getElementById('batch-tag-input');
    const categorySelect = document.getElementById('batch-tag-category');
    const tagName = tagInput.value.trim();
    const category = categorySelect.value;

    if (!tagName) {
        showStatus('Please enter a tag name', 'error');
        return;
    }

    // Get selected audio assets
    const selectedAssets = [];
    document.querySelectorAll('.audio-card input[type="checkbox"]:checked').forEach(checkbox => {
        const assetId = checkbox.closest('.audio-card').dataset.assetId;
        selectedAssets.push(assetId);
    });

    if (selectedAssets.length === 0) {
        showStatus('Please select audio assets to tag', 'error');
        return;
    }

    if (!window.electronAPI) {
        showStatus('Database API not available', 'error');
        return;
    }

    window.electronAPI.dbBatchAddAudioTags(selectedAssets, [tagName], category).then(() => {
        tagInput.value = '';
        selectedAssets.forEach(assetId => loadAssetTags(assetId));
        showStatus(`Tag "${tagName}" added to ${selectedAssets.length} assets!`, 'success');
    }).catch(error => {
        console.error('Error batch tagging:', error);
        showStatus('Failed to batch tag assets', 'error');
    });
}

// Add checkboxes to audio cards for batch operations
function addBatchSelectionCheckboxes() {
    document.querySelectorAll('.audio-card').forEach(card => {
        const header = card.querySelector('.asset-details h4');
        if (!header) return;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'asset-checkbox';
        checkbox.title = 'Select for batch operations';

        header.insertBefore(checkbox, header.firstChild);
    });
}

// Preset Management System
function setupPresetSystem() {
    // Add preset controls to configuration panel
    const configPanel = document.getElementById('config-panel');
    if (!configPanel) return;

    const presetControls = document.createElement('div');
    presetControls.className = 'preset-controls';
    presetControls.innerHTML = `
        <div class="preset-header">
            <h4>Presets</h4>
            <div class="preset-actions">
                <select id="preset-select" class="form-control">
                    <option value="">Load Preset...</option>
                </select>
                <button id="save-preset-btn" class="btn btn-sm btn-secondary">
                    <i class="fas fa-save"></i> Save
                </button>
                <button id="delete-preset-btn" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
        <div id="preset-name-input" class="preset-name-input hidden">
            <input type="text" id="preset-name" placeholder="Enter preset name..." class="form-control">
            <button id="confirm-save-preset" class="btn btn-sm btn-primary">Save Preset</button>
            <button id="cancel-save-preset" class="btn btn-sm btn-secondary">Cancel</button>
        </div>
    `;

    // Insert at the top of config panel
    const configContent = document.getElementById('config-content');
    configPanel.insertBefore(presetControls, configContent);

    // Setup preset event listeners
    setupPresetEventListeners();

    // Load available presets
    loadAvailablePresets();
}

function setupPresetEventListeners() {
    // Save preset button
    document.getElementById('save-preset-btn').addEventListener('click', () => {
        document.getElementById('preset-name-input').classList.remove('hidden');
        document.getElementById('preset-name').focus();
    });

    // Confirm save preset
    document.getElementById('confirm-save-preset').addEventListener('click', handleSavePreset);

    // Cancel save preset
    document.getElementById('cancel-save-preset').addEventListener('click', () => {
        document.getElementById('preset-name-input').classList.add('hidden');
        document.getElementById('preset-name').value = '';
    });

    // Preset selection
    document.getElementById('preset-select').addEventListener('change', handleLoadPreset);

    // Delete preset
    document.getElementById('delete-preset-btn').addEventListener('click', handleDeletePreset);

    // Enter key for preset name input
    document.getElementById('preset-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSavePreset();
        }
    });
}

async function handleSavePreset() {
    const presetName = document.getElementById('preset-name').value.trim();
    if (!presetName) {
        showStatus('Please enter a preset name', 'error');
        return;
    }

    if (!App.currentAssetType || !App.currentConfig) {
        showStatus('No configuration to save', 'error');
        return;
    }

    try {
        const preset = {
            name: presetName,
            assetType: App.currentAssetType,
            config: App.currentConfig,
            createdAt: new Date().toISOString()
        };

        if (!window.electronAPI) {
            showStatus('Database API not available', 'error');
            return;
        }

        await window.electronAPI.dbSavePreset(preset);

        // Hide input and clear
        document.getElementById('preset-name-input').classList.add('hidden');
        document.getElementById('preset-name').value = '';

        // Reload presets
        loadAvailablePresets();

        showStatus(`Preset "${presetName}" saved successfully!`, 'success');

    } catch (error) {
        console.error('Error saving preset:', error);
        showStatus('Failed to save preset', 'error');
    }
}

async function handleLoadPreset(event) {
    const presetId = event.target.value;
    if (!presetId) return;

    try {
        if (!window.electronAPI) {
            showStatus('Database API not available', 'error');
            return;
        }

        const preset = await window.electronAPI.dbLoadPreset(presetId);
        if (!preset) {
            showStatus('Preset not found', 'error');
            return;
        }

        // Load configuration
        App.currentConfig = preset.config;

        // Update form fields
        loadConfigIntoForm(preset.config);

        // Update preview if possible
        if (Object.keys(preset.config).length > 0) {
            updatePreviewWithCurrentConfig();
        }

        showStatus(`Preset "${preset.name}" loaded successfully!`, 'success');

    } catch (error) {
        console.error('Error loading preset:', error);
        showStatus('Failed to load preset', 'error');
    }
}

async function handleDeletePreset() {
    const presetSelect = document.getElementById('preset-select');
    const presetId = presetSelect.value;

    if (!presetId) {
        showStatus('Please select a preset to delete', 'error');
        return;
    }

    const presetName = presetSelect.options[presetSelect.selectedIndex].text;
    if (!confirm(`Are you sure you want to delete the preset "${presetName}"?`)) {
        return;
    }

    try {
        if (!window.electronAPI) {
            showStatus('Database API not available', 'error');
            return;
        }

        await window.electronAPI.dbDeletePreset(presetId);

        // Reload presets
        loadAvailablePresets();

        showStatus(`Preset "${presetName}" deleted successfully!`, 'success');

    } catch (error) {
        console.error('Error deleting preset:', error);
        showStatus('Failed to delete preset', 'error');
    }
}

async function loadAvailablePresets() {
    if (!App.currentAssetType) return;

    try {
        if (!window.electronAPI) return;

        const presets = await window.electronAPI.dbGetPresets(App.currentAssetType);
        const presetSelect = document.getElementById('preset-select');

        // Clear existing options except the first one
        while (presetSelect.options.length > 1) {
            presetSelect.remove(1);
        }

        // Add presets
        presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading presets:', error);
    }
}

function loadConfigIntoForm(config) {
    // Update all form inputs with the loaded configuration
    Object.keys(config).forEach(key => {
        const value = config[key];
        const inputs = document.querySelectorAll(`[name="${key}"]`);

        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (Array.isArray(value)) {
                    input.checked = value.includes(input.value);
                } else {
                    input.checked = value === input.value;
                }
            } else if (input.type === 'radio') {
                input.checked = input.value === value;
            } else {
                input.value = value;
                // Trigger input event for sliders
                if (input.type === 'range') {
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });
    });
}

// Parameter Randomization System
function setupParameterRandomization() {
    // Add randomization controls to configuration panel
    const configPanel = document.getElementById('config-panel');
    if (!configPanel) return;

    const randomizationControls = document.createElement('div');
    randomizationControls.className = 'randomization-controls';
    randomizationControls.innerHTML = `
        <div class="randomization-header">
            <h4>Randomization</h4>
            <div class="randomization-actions">
                <button id="randomize-all-btn" class="btn btn-sm btn-warning">
                    <i class="fas fa-dice"></i> Randomize All
                </button>
                <button id="randomize-colors-btn" class="btn btn-sm btn-info">
                    <i class="fas fa-palette"></i> Random Colors
                </button>
                <button id="randomize-sizes-btn" class="btn btn-sm btn-success">
                    <i class="fas fa-expand-arrows-alt"></i> Random Sizes
                </button>
            </div>
        </div>
        <div class="randomization-intensity">
            <label for="random-intensity">Randomization Intensity:</label>
            <input type="range" id="random-intensity" min="0.1" max="1.0" step="0.1" value="0.5" class="form-control">
            <span class="intensity-value">0.5</span>
        </div>
    `;

    // Insert after preset controls
    const presetControls = configPanel.querySelector('.preset-controls');
    if (presetControls) {
        configPanel.insertBefore(randomizationControls, presetControls.nextSibling);
    }

    // Setup randomization event listeners
    setupRandomizationEventListeners();
}

function setupRandomizationEventListeners() {
    // Randomize all button
    document.getElementById('randomize-all-btn').addEventListener('click', () => {
        randomizeParameters('all');
    });

    // Randomize colors button
    document.getElementById('randomize-colors-btn').addEventListener('click', () => {
        randomizeParameters('colors');
    });

    // Randomize sizes button
    document.getElementById('randomize-sizes-btn').addEventListener('click', () => {
        randomizeParameters('sizes');
    });

    // Randomization intensity slider
    const intensitySlider = document.getElementById('random-intensity');
    const intensityValue = document.querySelector('.intensity-value');

    intensitySlider.addEventListener('input', function() {
        intensityValue.textContent = this.value;
    });
}

function randomizeParameters(type) {
    const intensity = parseFloat(document.getElementById('random-intensity').value);
    const inputs = document.querySelectorAll('#config-content input, #config-content select');

    inputs.forEach(input => {
        if (input.type === 'range') {
            randomizeSlider(input, intensity, type);
        } else if (input.type === 'color') {
            randomizeColor(input, intensity, type);
        } else if (input.type === 'number') {
            randomizeNumber(input, intensity, type);
        }
    });

    // Update configuration and preview
    updateCurrentConfig();
    updatePreviewWithCurrentConfig();

    showStatus(`Parameters randomized (${type})!`, 'success');
}

function randomizeSlider(slider, intensity, type) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const currentValue = parseFloat(slider.value);
    const range = max - min;

    // Check if this parameter should be randomized based on type
    const parameterName = slider.name.toLowerCase();
    let shouldRandomize = false;

    switch (type) {
        case 'all':
            shouldRandomize = true;
            break;
        case 'colors':
            shouldRandomize = parameterName.includes('color') || parameterName.includes('hue') ||
                            parameterName.includes('saturation') || parameterName.includes('brightness');
            break;
        case 'sizes':
            shouldRandomize = parameterName.includes('size') || parameterName.includes('scale') ||
                            parameterName.includes('width') || parameterName.includes('height') ||
                            parameterName.includes('radius') || parameterName.includes('detail');
            break;
    }

    if (!shouldRandomize) return;

    // Calculate randomization range based on intensity
    const randomizationRange = range * intensity * 0.5; // 50% of full range at max intensity
    const minValue = Math.max(min, currentValue - randomizationRange);
    const maxValue = Math.min(max, currentValue + randomizationRange);

    // Generate random value within the constrained range
    const randomValue = minValue + Math.random() * (maxValue - minValue);

    slider.value = randomValue;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
}

function randomizeColor(colorInput, intensity, type) {
    if (type !== 'all' && type !== 'colors') return;

    // Generate random color with some constraints based on intensity
    const hue = Math.floor(Math.random() * 360);
    const saturation = 30 + Math.random() * (70 * intensity); // 30-100% saturation
    const lightness = 20 + Math.random() * (60 * intensity); // 20-80% lightness

    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    colorInput.value = rgbToHex(hslToRgb(hue, saturation / 100, lightness / 100));
    colorInput.dispatchEvent(new Event('input', { bubbles: true }));
}

function randomizeNumber(numberInput, intensity, type) {
    const min = parseFloat(numberInput.min) || 0;
    const max = parseFloat(numberInput.max) || 100;
    const currentValue = parseFloat(numberInput.value);
    const range = max - min;

    // Similar logic to sliders
    const randomizationRange = range * intensity * 0.3;
    const minValue = Math.max(min, currentValue - randomizationRange);
    const maxValue = Math.min(max, currentValue + randomizationRange);

    const randomValue = minValue + Math.random() * (maxValue - minValue);

    numberInput.value = Math.round(randomValue * 100) / 100; // Round to 2 decimal places
    numberInput.dispatchEvent(new Event('input', { bubbles: true }));
}

// Utility functions for color conversion
function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    return [r + m, g + m, b + m];
}

function rgbToHex(rgb) {
    const [r, g, b] = rgb.map(c => Math.round(c * 255));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Parameter Templates System
function setupParameterTemplates() {
    // Add template controls to configuration panel
    const configPanel = document.getElementById('config-panel');
    if (!configPanel) return;

    const templateControls = document.createElement('div');
    templateControls.className = 'template-controls';
    templateControls.innerHTML = `
        <div class="template-header">
            <h4>Templates</h4>
            <div class="template-actions">
                <select id="template-select" class="form-control">
                    <option value="">Apply Template...</option>
                </select>
                <button id="create-template-btn" class="btn btn-sm btn-primary">
                    <i class="fas fa-plus"></i> Create
                </button>
                <button id="manage-templates-btn" class="btn btn-sm btn-secondary">
                    <i class="fas fa-cog"></i> Manage
                </button>
            </div>
        </div>
        <div id="template-creator" class="template-creator hidden">
            <div class="template-creator-form">
                <input type="text" id="template-name" placeholder="Template name..." class="form-control">
                <textarea id="template-description" placeholder="Template description..." class="form-control" rows="2"></textarea>
                <div class="template-creator-actions">
                    <button id="save-template-btn" class="btn btn-sm btn-success">Save Template</button>
                    <button id="cancel-template-btn" class="btn btn-sm btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Insert after randomization controls
    const randomizationControls = configPanel.querySelector('.randomization-controls');
    if (randomizationControls) {
        configPanel.insertBefore(templateControls, randomizationControls.nextSibling);
    }

    // Setup template event listeners
    setupTemplateEventListeners();

    // Load available templates
    loadAvailableTemplates();
}

function setupTemplateEventListeners() {
    // Create template button
    document.getElementById('create-template-btn').addEventListener('click', () => {
        document.getElementById('template-creator').classList.remove('hidden');
        document.getElementById('template-name').focus();
    });

    // Save template
    document.getElementById('save-template-btn').addEventListener('click', handleCreateTemplate);

    // Cancel template creation
    document.getElementById('cancel-template-btn').addEventListener('click', () => {
        document.getElementById('template-creator').classList.add('hidden');
        document.getElementById('template-name').value = '';
        document.getElementById('template-description').value = '';
    });

    // Template selection
    document.getElementById('template-select').addEventListener('change', handleApplyTemplate);

    // Manage templates
    document.getElementById('manage-templates-btn').addEventListener('click', showTemplateManager);

    // Enter key for template name
    document.getElementById('template-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCreateTemplate();
        }
    });
}

async function handleCreateTemplate() {
    const templateName = document.getElementById('template-name').value.trim();
    const templateDescription = document.getElementById('template-description').value.trim();

    if (!templateName) {
        showStatus('Please enter a template name', 'error');
        return;
    }

    if (!App.currentAssetType || !App.currentConfig) {
        showStatus('No configuration to save as template', 'error');
        return;
    }

    try {
        const template = {
            name: templateName,
            description: templateDescription,
            assetType: App.currentAssetType,
            config: App.currentConfig,
            category: getTemplateCategory(App.currentAssetType),
            createdAt: new Date().toISOString(),
            usageCount: 0
        };

        if (!window.electronAPI) {
            showStatus('Database API not available', 'error');
            return;
        }

        await window.electronAPI.dbSaveTemplate(template);

        // Hide creator and clear
        document.getElementById('template-creator').classList.add('hidden');
        document.getElementById('template-name').value = '';
        document.getElementById('template-description').value = '';

        // Reload templates
        loadAvailableTemplates();

        showStatus(`Template "${templateName}" created successfully!`, 'success');

    } catch (error) {
        console.error('Error creating template:', error);
        showStatus('Failed to create template', 'error');
    }
}

function getTemplateCategory(assetType) {
    if (assetType.includes('vehicle')) return 'vehicles';
    if (assetType.includes('building')) return 'buildings';
    if (assetType.includes('particle')) return 'particles';
    if (assetType.includes('ui')) return 'ui';
    if (assetType === 'sfx') return 'audio-sfx';
    if (assetType === 'music') return 'audio-music';
    if (assetType === 'ambient') return 'audio-ambient';
    return 'general';
}

async function handleApplyTemplate(event) {
    const templateId = event.target.value;
    if (!templateId) return;

    try {
        if (!window.electronAPI) {
            showStatus('Database API not available', 'error');
            return;
        }

        const template = await window.electronAPI.dbLoadTemplate(templateId);
        if (!template) {
            showStatus('Template not found', 'error');
            return;
        }

        // Load configuration
        App.currentConfig = template.config;

        // Update form fields
        loadConfigIntoForm(template.config);

        // Update preview if possible
        if (Object.keys(template.config).length > 0) {
            updatePreviewWithCurrentConfig();
        }

        // Increment usage count
        await window.electronAPI.dbIncrementTemplateUsage(templateId);

        showStatus(`Template "${template.name}" applied successfully!`, 'success');

    } catch (error) {
        console.error('Error applying template:', error);
        showStatus('Failed to apply template', 'error');
    }
}

async function loadAvailableTemplates() {
    if (!App.currentAssetType) return;

    try {
        if (!window.electronAPI) return;

        const templates = await window.electronAPI.dbGetTemplates(App.currentAssetType);
        const templateSelect = document.getElementById('template-select');

        // Clear existing options except the first one
        while (templateSelect.options.length > 1) {
            templateSelect.remove(1);
        }

        // Add templates grouped by category
        const categories = {};
        templates.forEach(template => {
            if (!categories[template.category]) {
                categories[template.category] = [];
            }
            categories[template.category].push(template);
        });

        Object.keys(categories).forEach(category => {
            // Add category header
            const categoryOption = document.createElement('option');
            categoryOption.disabled = true;
            categoryOption.textContent = `--- ${category.toUpperCase()} ---`;
            templateSelect.appendChild(categoryOption);

            // Add templates in category
            categories[category].forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = `${template.name} (${template.usageCount} uses)`;
                option.title = template.description || '';
                templateSelect.appendChild(option);
            });
        });

    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

function showTemplateManager() {
    // Create template manager modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content template-manager-modal">
            <div class="modal-header">
                <h3>Template Manager</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="template-manager-content">
                    <div class="template-categories">
                        <button class="category-tab active" data-category="all">All Templates</button>
                        <button class="category-tab" data-category="vehicles">Vehicles</button>
                        <button class="category-tab" data-category="buildings">Buildings</button>
                        <button class="category-tab" data-category="particles">Particles</button>
                        <button class="category-tab" data-category="ui">UI Elements</button>
                        <button class="category-tab" data-category="audio">Audio</button>
                    </div>
                    <div class="template-list" id="template-list">
                        <div class="template-loading">Loading templates...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup modal functionality
    setupTemplateManagerModal(modal);

    // Load templates for manager
    loadTemplatesForManager(modal, 'all');

    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function setupTemplateManagerModal(modal) {
    const categoryTabs = modal.querySelectorAll('.category-tab');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            modal.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Load templates for category
            const category = tab.dataset.category;
            loadTemplatesForManager(modal, category);
        });
    });
}

async function loadTemplatesForManager(modal, category) {
    const templateList = modal.querySelector('#template-list');

    try {
        if (!window.electronAPI) {
            templateList.innerHTML = '<div class="template-error">Database API not available</div>';
            return;
        }

        const templates = category === 'all' ?
            await window.electronAPI.dbGetAllTemplates() :
            await window.electronAPI.dbGetTemplatesByCategory(category);

        if (templates.length === 0) {
            templateList.innerHTML = '<div class="template-empty">No templates found</div>';
            return;
        }

        let html = '';
        templates.forEach(template => {
            html += `
                <div class="template-item" data-template-id="${template.id}">
                    <div class="template-info">
                        <h4>${template.name}</h4>
                        <p class="template-description">${template.description || 'No description'}</p>
                        <div class="template-meta">
                            <span class="template-type">${template.assetType}</span>
                            <span class="template-usage">${template.usageCount} uses</span>
                            <span class="template-date">${new Date(template.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="template-actions">
                        <button class="btn btn-sm btn-primary apply-template-btn" data-template-id="${template.id}">
                            <i class="fas fa-check"></i> Apply
                        </button>
                        <button class="btn btn-sm btn-secondary edit-template-btn" data-template-id="${template.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-template-btn" data-template-id="${template.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });

        templateList.innerHTML = html;

        // Setup template action buttons
        setupTemplateActionButtons(modal);

    } catch (error) {
        console.error('Error loading templates for manager:', error);
        templateList.innerHTML = '<div class="template-error">Failed to load templates</div>';
    }
}

function setupTemplateActionButtons(modal) {
    // Apply template buttons
    modal.querySelectorAll('.apply-template-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const templateId = e.currentTarget.dataset.templateId;

            try {
                const template = await window.electronAPI.dbLoadTemplate(templateId);
                if (template) {
                    // Switch to generator view and apply template
                    switchView('generator');
                    selectAssetType(template.assetType);

                    // Wait for config form to load, then apply template
                    setTimeout(() => {
                        App.currentConfig = template.config;
                        loadConfigIntoForm(template.config);
                        updatePreviewWithCurrentConfig();
                        showStatus(`Template "${template.name}" applied!`, 'success');
                    }, 500);

                    // Close modal
                    document.body.removeChild(modal);
                }
            } catch (error) {
                console.error('Error applying template:', error);
                showStatus('Failed to apply template', 'error');
            }
        });
    });

    // Delete template buttons
    modal.querySelectorAll('.delete-template-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const templateId = e.currentTarget.dataset.templateId;
            const templateItem = e.currentTarget.closest('.template-item');
            const templateName = templateItem.querySelector('h4').textContent;

            if (confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
                try {
                    await window.electronAPI.dbDeleteTemplate(templateId);
                    templateItem.remove();
                    showStatus(`Template "${templateName}" deleted!`, 'success');

                    // Reload templates in main interface
                    loadAvailableTemplates();
                } catch (error) {
                    console.error('Error deleting template:', error);
                    showStatus('Failed to delete template', 'error');
                }
            }
        });
    });

    // Edit template buttons (placeholder for future implementation)
    modal.querySelectorAll('.edit-template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const templateId = e.currentTarget.dataset.templateId;
            showStatus('Template editing coming soon!', 'info');
        });
    });
}

// Template Analytics and Recommendations
function setupTemplateAnalytics() {
    // Track template usage for recommendations
    if (!window.electronAPI) return;

    // This would be called when templates are used
    window.trackTemplateUsage = async (templateId) => {
        try {
            await window.electronAPI.dbIncrementTemplateUsage(templateId);
        } catch (error) {
            console.error('Error tracking template usage:', error);
        }
    };

    // Get recommended templates based on current asset type
    window.getRecommendedTemplates = async (assetType) => {
        try {
            const templates = await window.electronAPI.dbGetRecommendedTemplates(assetType);
            return templates.slice(0, 5); // Return top 5 recommendations
        } catch (error) {
            console.error('Error getting recommended templates:', error);
            return [];
        }
    };
}

// Initialize preset and randomization systems when config panel is shown
function initializeAdvancedControls() {
    // Only initialize if not already done
    if (!document.querySelector('.preset-controls')) {
        setupPresetSystem();
        setupParameterRandomization();
        setupParameterTemplates();
        setupTemplateAnalytics();
    }
}

// Batch Audio Processing System
function setupBatchAudioProcessor() {
    // Add batch audio controls to batch view
    const batchView = document.getElementById('batch-view');
    if (!batchView) return;

    const batchAudioControls = document.createElement('div');
    batchAudioControls.className = 'batch-audio-controls';
    batchAudioControls.innerHTML = `
        <div class="batch-audio-header">
            <h3>Audio Batch Processing</h3>
            <div class="batch-audio-actions">
                <button id="add-audio-batch-btn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add Audio Assets
                </button>
                <button id="clear-audio-batch-btn" class="btn btn-secondary">
                    <i class="fas fa-trash"></i> Clear All
                </button>
            </div>
        </div>

        <div class="batch-audio-queue" id="batch-audio-queue">
            <div class="empty-batch-queue">
                <i class="fas fa-music"></i>
                <p>No audio assets in batch queue</p>
                <button class="btn btn-primary" onclick="switchView('library')">Select from Library</button>
            </div>
        </div>

        <div class="batch-audio-processing hidden" id="batch-audio-processing">
            <div class="processing-options">
                <h4>Processing Options</h4>
                <div class="processing-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="batch-normalize">Normalize Audio:</label>
                            <input type="checkbox" id="batch-normalize" checked>
                        </div>
                        <div class="form-group">
                            <label for="batch-compress">Apply Compression:</label>
                            <input type="checkbox" id="batch-compress">
                        </div>
                        <div class="form-group">
                            <label for="batch-convert-format">Convert Format:</label>
                            <select id="batch-convert-format" class="form-control">
                                <option value="">Keep Original</option>
                                <option value="wav">WAV</option>
                                <option value="mp3">MP3</option>
                                <option value="ogg">OGG</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="batch-sample-rate">Sample Rate:</label>
                            <select id="batch-sample-rate" class="form-control">
                                <option value="">Keep Original</option>
                                <option value="44100">44.1 kHz</option>
                                <option value="48000">48 kHz</option>
                                <option value="22050">22.05 kHz</option>
                                <option value="11025">11.025 kHz</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="batch-bit-depth">Bit Depth:</label>
                            <select id="batch-bit-depth" class="form-control">
                                <option value="">Keep Original</option>
                                <option value="16">16-bit</option>
                                <option value="24">24-bit</option>
                                <option value="32">32-bit</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="batch-channels">Channels:</label>
                            <select id="batch-channels" class="form-control">
                                <option value="">Keep Original</option>
                                <option value="1">Mono</option>
                                <option value="2">Stereo</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="batch-progress-section">
                <div class="batch-progress-controls">
                    <button id="start-batch-audio-btn" class="btn btn-success">
                        <i class="fas fa-play"></i> Start Batch Processing
                    </button>
                    <button id="pause-batch-audio-btn" class="btn btn-warning hidden">
                        <i class="fas fa-pause"></i> Pause
                    </button>
                    <button id="stop-batch-audio-btn" class="btn btn-danger hidden">
                        <i class="fas fa-stop"></i> Stop
                    </button>
                </div>

                <div class="batch-progress-display">
                    <div class="progress-bar">
                        <div class="progress-fill" id="batch-audio-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">
                        <span id="batch-audio-progress-text">Ready to process</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insert at the top of batch view
    const batchContainer = batchView.querySelector('.batch-container');
    if (batchContainer) {
        batchContainer.insertBefore(batchAudioControls, batchContainer.firstChild);
    }

    // Setup batch audio event listeners
    setupBatchAudioEventListeners();
}

function setupBatchAudioEventListeners() {
    // Add audio batch button
    document.getElementById('add-audio-batch-btn').addEventListener('click', showAudioBatchSelector);

    // Clear audio batch button
    document.getElementById('clear-audio-batch-btn').addEventListener('click', clearAudioBatch);

    // Batch processing controls
    document.getElementById('start-batch-audio-btn').addEventListener('click', startBatchAudioProcessing);
    document.getElementById('pause-batch-audio-btn').addEventListener('click', pauseBatchAudioProcessing);
    document.getElementById('stop-batch-audio-btn').addEventListener('click', stopBatchAudioProcessing);
}

function showAudioBatchSelector() {
    // Create audio batch selector modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content audio-batch-selector-modal">
            <div class="modal-header">
                <h3>Select Audio Assets for Batch Processing</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="audio-selector-controls">
                    <div class="selector-filters">
                        <input type="text" id="audio-search" placeholder="Search audio assets..." class="form-control">
                        <select id="audio-type-filter" class="form-control">
                            <option value="">All Types</option>
                            <option value="sfx">SFX</option>
                            <option value="music">Music</option>
                            <option value="ambient">Ambient</option>
                        </select>
                    </div>
                    <div class="selector-actions">
                        <button id="select-all-audio" class="btn btn-sm btn-secondary">Select All</button>
                        <button id="clear-selection-audio" class="btn btn-sm btn-secondary">Clear Selection</button>
                        <button id="add-selected-audio" class="btn btn-sm btn-primary">Add Selected</button>
                    </div>
                </div>
                <div class="audio-asset-list" id="audio-asset-list">
                    <div class="audio-loading">Loading audio assets...</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup modal functionality
    setupAudioBatchSelectorModal(modal);

    // Load audio assets
    loadAudioAssetsForBatch(modal);

    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function setupAudioBatchSelectorModal(modal) {
    // Search functionality
    const searchInput = modal.querySelector('#audio-search');
    searchInput.addEventListener('input', () => {
        filterAudioAssets(modal, searchInput.value, modal.querySelector('#audio-type-filter').value);
    });

    // Type filter
    const typeFilter = modal.querySelector('#audio-type-filter');
    typeFilter.addEventListener('change', () => {
        filterAudioAssets(modal, searchInput.value, typeFilter.value);
    });

    // Select all button
    modal.querySelector('#select-all-audio').addEventListener('click', () => {
        const checkboxes = modal.querySelectorAll('.audio-item-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = true);
    });

    // Clear selection button
    modal.querySelector('#clear-selection-audio').addEventListener('click', () => {
        const checkboxes = modal.querySelectorAll('.audio-item-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    });

    // Add selected button
    modal.querySelector('#add-selected-audio').addEventListener('click', () => {
        const selectedAssets = [];
        const checkboxes = modal.querySelectorAll('.audio-item-checkbox:checked');
        checkboxes.forEach(checkbox => {
            selectedAssets.push(checkbox.dataset.assetId);
        });

        if (selectedAssets.length > 0) {
            addAudioAssetsToBatch(selectedAssets);
            document.body.removeChild(modal);
            showStatus(`${selectedAssets.length} audio assets added to batch!`, 'success');
        } else {
            showStatus('Please select audio assets to add', 'error');
        }
    });
}

async function loadAudioAssetsForBatch(modal) {
    const assetList = modal.querySelector('#audio-asset-list');

    try {
        if (!window.electronAPI) {
            assetList.innerHTML = '<div class="audio-error">Database API not available</div>';
            return;
        }

        const assets = await window.electronAPI.dbGetAssets({ type: ['sfx', 'music', 'ambient'] });

        if (assets.length === 0) {
            assetList.innerHTML = '<div class="audio-empty">No audio assets found</div>';
            return;
        }

        let html = '';
        assets.forEach(asset => {
            html += `
                <div class="audio-batch-item">
                    <input type="checkbox" class="audio-item-checkbox" data-asset-id="${asset.id}">
                    <div class="audio-item-info">
                        <h4>${asset.name}</h4>
                        <p>Type: ${asset.type} | Duration: ${asset.audio ? asset.audio.duration.toFixed(1) : 'N/A'}s</p>
                    </div>
                </div>
            `;
        });

        assetList.innerHTML = html;

    } catch (error) {
        console.error('Error loading audio assets for batch:', error);
        assetList.innerHTML = '<div class="audio-error">Failed to load audio assets</div>';
    }
}

function filterAudioAssets(modal, searchTerm, typeFilter) {
    const items = modal.querySelectorAll('.audio-batch-item');

    items.forEach(item => {
        const name = item.querySelector('h4').textContent.toLowerCase();
        const type = item.querySelector('p').textContent.toLowerCase();

        const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || type.includes(typeFilter.toLowerCase());

        item.style.display = (matchesSearch && matchesType) ? 'flex' : 'none';
    });
}

function addAudioAssetsToBatch(assetIds) {
    // Get asset details
    const batchAssets = App.assets.filter(asset => assetIds.includes(asset.id.toString()));

    if (batchAssets.length === 0) return;

    // Update batch queue display
    updateAudioBatchQueue(batchAssets);

    // Show processing options
    document.getElementById('batch-audio-processing').classList.remove('hidden');
}

function updateAudioBatchQueue(assets) {
    const queueContainer = document.getElementById('batch-audio-queue');

    if (assets.length === 0) {
        queueContainer.innerHTML = `
            <div class="empty-batch-queue">
                <i class="fas fa-music"></i>
                <p>No audio assets in batch queue</p>
                <button class="btn btn-primary" onclick="switchView('library')">Select from Library</button>
            </div>
        `;
        return;
    }

    let html = '<div class="batch-queue-header"><h4>Audio Assets in Queue</h4></div>';
    html += '<div class="batch-queue-items">';

    assets.forEach(asset => {
        html += `
            <div class="batch-queue-item" data-asset-id="${asset.id}">
                <div class="batch-item-info">
                    <h5>${asset.name}</h5>
                    <p>Type: ${asset.type} | Duration: ${asset.audio ? asset.audio.duration.toFixed(1) : 'N/A'}s</p>
                </div>
                <div class="batch-item-status">
                    <span class="status-badge pending">Pending</span>
                    <button class="btn btn-sm btn-danger remove-from-batch" data-asset-id="${asset.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    queueContainer.innerHTML = html;

    // Setup remove buttons
    document.querySelectorAll('.remove-from-batch').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const assetId = e.currentTarget.dataset.assetId;
            removeAudioFromBatch(assetId);
        });
    });
}

function removeAudioFromBatch(assetId) {
    // This would remove the asset from the batch queue
    // For now, just update the display
    const item = document.querySelector(`.batch-queue-item[data-asset-id="${assetId}"]`);
    if (item) {
        item.remove();
    }

    // Check if queue is empty
    const remainingItems = document.querySelectorAll('.batch-queue-item');
    if (remainingItems.length === 0) {
        document.getElementById('batch-audio-processing').classList.add('hidden');
        updateAudioBatchQueue([]);
    }
}

function clearAudioBatch() {
    updateAudioBatchQueue([]);
    document.getElementById('batch-audio-processing').classList.add('hidden');
    showStatus('Audio batch cleared!', 'info');
}

async function startBatchAudioProcessing() {
    const queueItems = document.querySelectorAll('.batch-queue-item');
    if (queueItems.length === 0) {
        showStatus('No audio assets in batch queue', 'error');
        return;
    }

    try {
        // Get processing options
        const options = {
            normalize: document.getElementById('batch-normalize').checked,
            compress: document.getElementById('batch-compress').checked,
            convertFormat: document.getElementById('batch-convert-format').value,
            sampleRate: document.getElementById('batch-sample-rate').value,
            bitDepth: document.getElementById('batch-bit-depth').value,
            channels: document.getElementById('batch-channels').value
        };

        // Update UI for processing
        document.getElementById('start-batch-audio-btn').classList.add('hidden');
        document.getElementById('pause-batch-audio-btn').classList.remove('hidden');
        document.getElementById('stop-batch-audio-btn').classList.remove('hidden');

        // Process each audio asset
        const totalItems = queueItems.length;
        let processedItems = 0;

        for (const item of queueItems) {
            const assetId = item.dataset.assetId;
            const statusBadge = item.querySelector('.status-badge');

            try {
                // Update status
                statusBadge.textContent = 'Processing...';
                statusBadge.className = 'status-badge processing';

                // Process audio (this would call the actual processing function)
                await processAudioAsset(assetId, options);

                // Update status
                statusBadge.textContent = 'Completed';
                statusBadge.className = 'status-badge completed';

            } catch (error) {
                console.error(`Error processing audio asset ${assetId}:`, error);
                statusBadge.textContent = 'Failed';
                statusBadge.className = 'status-badge failed';
            }

            // Update progress
            processedItems++;
            const progress = (processedItems / totalItems) * 100;
            document.getElementById('batch-audio-progress-fill').style.width = `${progress}%`;
            document.getElementById('batch-audio-progress-text').textContent =
                `Processing ${processedItems}/${totalItems} assets`;
        }

        // Processing complete
        document.getElementById('start-batch-audio-btn').classList.remove('hidden');
        document.getElementById('pause-batch-audio-btn').classList.add('hidden');
        document.getElementById('stop-batch-audio-btn').classList.add('hidden');

        document.getElementById('batch-audio-progress-text').textContent = 'Batch processing completed!';

        showStatus(`Batch processing completed! ${processedItems}/${totalItems} assets processed.`, 'success');

    } catch (error) {
        console.error('Error in batch audio processing:', error);
        showStatus('Batch processing failed', 'error');
    }
}

async function processAudioAsset(assetId, options) {
    // This would implement the actual audio processing logic
    // For now, it's a placeholder that simulates processing time

    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate processing with different outcomes
            if (Math.random() > 0.1) { // 90% success rate
                resolve();
            } else {
                throw new Error('Simulated processing error');
            }
        }, 1000 + Math.random() * 2000); // 1-3 seconds processing time
    });
}

function pauseBatchAudioProcessing() {
    // Implementation for pausing batch processing
    showStatus('Batch processing paused', 'info');
}

function stopBatchAudioProcessing() {
    // Implementation for stopping batch processing
    document.getElementById('start-batch-audio-btn').classList.remove('hidden');
    document.getElementById('pause-batch-audio-btn').classList.add('hidden');
    document.getElementById('stop-batch-audio-btn').classList.add('hidden');

    document.getElementById('batch-audio-progress-text').textContent = 'Batch processing stopped';
    showStatus('Batch processing stopped', 'warning');
}

// New Asset Type Batch Generation System
function setupNewAssetBatchGenerator() {
    // Add new asset batch controls to batch view
    const batchView = document.getElementById('batch-view');
    if (!batchView) return;

    const newAssetBatchControls = document.createElement('div');
    newAssetBatchControls.className = 'new-asset-batch-controls';
    newAssetBatchControls.innerHTML = `
        <div class="new-asset-batch-header">
            <h3>Batch Asset Generation</h3>
            <div class="new-asset-batch-actions">
                <button id="add-batch-job-btn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add Batch Job
                </button>
                <button id="clear-batch-jobs-btn" class="btn btn-secondary">
                    <i class="fas fa-trash"></i> Clear All Jobs
                </button>
            </div>
        </div>

        <div class="batch-jobs-queue" id="batch-jobs-queue">
            <div class="empty-batch-jobs">
                <i class="fas fa-cubes"></i>
                <p>No batch jobs configured</p>
                <button class="btn btn-primary" onclick="document.getElementById('add-batch-job-btn').click()">Create Your First Batch Job</button>
            </div>
        </div>

        <div class="batch-jobs-processing hidden" id="batch-jobs-processing">
            <div class="batch-jobs-summary" id="batch-jobs-summary">
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Assets:</span>
                        <span class="stat-value" id="total-assets-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Estimated Time:</span>
                        <span class="stat-value" id="estimated-time">0s</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Jobs:</span>
                        <span class="stat-value" id="jobs-count">0</span>
                    </div>
                </div>
            </div>

            <div class="batch-jobs-progress-section">
                <div class="batch-jobs-progress-controls">
                    <button id="start-batch-jobs-btn" class="btn btn-success">
                        <i class="fas fa-play"></i> Start Batch Generation
                    </button>
                    <button id="pause-batch-jobs-btn" class="btn btn-warning hidden">
                        <i class="fas fa-pause"></i> Pause
                    </button>
                    <button id="stop-batch-jobs-btn" class="btn btn-danger hidden">
                        <i class="fas fa-stop"></i> Stop
                    </button>
                </div>

                <div class="batch-jobs-progress-display">
                    <div class="progress-bar">
                        <div class="progress-fill" id="batch-jobs-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">
                        <span id="batch-jobs-progress-text">Ready to generate</span>
                    </div>
                    <div class="progress-details">
                        <span id="batch-jobs-current-job">No active job</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insert after batch audio controls
    const batchAudioControls = batchView.querySelector('.batch-audio-controls');
    if (batchAudioControls) {
        batchView.querySelector('.batch-container').insertBefore(newAssetBatchControls, batchAudioControls.nextSibling);
    }

    // Setup new asset batch event listeners
    setupNewAssetBatchEventListeners();
}

function setupNewAssetBatchEventListeners() {
    // Add batch job button
    document.getElementById('add-batch-job-btn').addEventListener('click', showBatchJobCreator);

    // Clear batch jobs button
    document.getElementById('clear-batch-jobs-btn').addEventListener('click', clearBatchJobs);

    // Batch generation controls
    document.getElementById('start-batch-jobs-btn').addEventListener('click', startBatchJobsGeneration);
    document.getElementById('pause-batch-jobs-btn').addEventListener('click', pauseBatchJobsGeneration);
    document.getElementById('stop-batch-jobs-btn').addEventListener('click', stopBatchJobsGeneration);
}

function showBatchJobCreator() {
    // Create batch job creator modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content batch-job-creator-modal">
            <div class="modal-header">
                <h3>Create Batch Generation Job</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="batch-job-form">
                    <div class="form-section">
                        <h4>Job Configuration</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="job-name">Job Name:</label>
                                <input type="text" id="job-name" placeholder="e.g., Forest Environment Pack" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="job-description">Description:</label>
                                <input type="text" id="job-description" placeholder="Optional description..." class="form-control">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Asset Type & Quantity</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="asset-type">Asset Type:</label>
                                <select id="asset-type" class="form-control">
                                    <option value="character">Character</option>
                                    <option value="monster">Monster</option>
                                    <option value="item">Item</option>
                                    <option value="tile">Tile</option>
                                    <option value="sfx">Sound Effect</option>
                                    <option value="music">Music</option>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="building">Building</option>
                                    <option value="particle">Particle Effect</option>
                                    <option value="ui">UI Element</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="quantity">Quantity:</label>
                                <input type="number" id="quantity" min="1" max="100" value="5" class="form-control">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Generation Mode</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="generation-mode">Mode:</label>
                                <select id="generation-mode" class="form-control">
                                    <option value="random">Random Variations</option>
                                    <option value="template">Use Template</option>
                                    <option value="preset">Use Preset</option>
                                    <option value="custom">Custom Configuration</option>
                                </select>
                            </div>
                            <div class="form-group" id="template-preset-group" style="display: none;">
                                <label for="template-preset-select">Template/Preset:</label>
                                <select id="template-preset-select" class="form-control">
                                    <option value="">Select template/preset...</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Naming & Organization</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="name-prefix">Name Prefix:</label>
                                <input type="text" id="name-prefix" placeholder="e.g., forest_" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="name-suffix">Name Suffix:</label>
                                <input type="text" id="name-suffix" placeholder="e.g., _variant" class="form-control">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="auto-numbering">Auto Numbering:</label>
                                <input type="checkbox" id="auto-numbering" checked>
                            </div>
                            <div class="form-group">
                                <label for="create-collection">Create Collection:</label>
                                <input type="checkbox" id="create-collection" checked>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button id="preview-batch-job" class="btn btn-info">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button id="add-batch-job" class="btn btn-success">
                            <i class="fas fa-plus"></i> Add Job
                        </button>
                        <button id="cancel-batch-job" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup modal functionality
    setupBatchJobCreatorModal(modal);

    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function setupBatchJobCreatorModal(modal) {
    // Generation mode change handler
    const generationMode = modal.querySelector('#generation-mode');
    const templatePresetGroup = modal.querySelector('#template-preset-group');

    generationMode.addEventListener('change', async () => {
        const mode = generationMode.value;
        if (mode === 'template' || mode === 'preset') {
            templatePresetGroup.style.display = 'block';
            await loadTemplatesPresetsForJob(modal, mode);
        } else {
            templatePresetGroup.style.display = 'none';
        }
    });

    // Preview batch job
    modal.querySelector('#preview-batch-job').addEventListener('click', () => {
        previewBatchJob(modal);
    });

    // Add batch job
    modal.querySelector('#add-batch-job').addEventListener('click', () => {
        addBatchJob(modal);
    });

    // Cancel batch job
    modal.querySelector('#cancel-batch-job').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

async function loadTemplatesPresetsForJob(modal, mode) {
    const select = modal.querySelector('#template-preset-select');

    try {
        if (!window.electronAPI) return;

        let items = [];
        if (mode === 'template') {
            const assetType = modal.querySelector('#asset-type').value;
            items = await window.electronAPI.dbGetTemplates(assetType);
        } else if (mode === 'preset') {
            const assetType = modal.querySelector('#asset-type').value;
            items = await window.electronAPI.dbGetPresets(assetType);
        }

        // Clear existing options
        select.innerHTML = '<option value="">Select template/preset...</option>';

        // Add items
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading templates/presets:', error);
    }
}

function previewBatchJob(modal) {
    const jobConfig = getBatchJobConfig(modal);

    // Create preview modal
    const previewModal = document.createElement('div');
    previewModal.className = 'modal-overlay';
    previewModal.innerHTML = `
        <div class="modal-content batch-job-preview-modal">
            <div class="modal-header">
                <h3>Batch Job Preview</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="batch-job-preview">
                    <div class="preview-summary">
                        <h4>Job Summary</h4>
                        <div class="summary-details">
                            <p><strong>Name:</strong> ${jobConfig.name}</p>
                            <p><strong>Type:</strong> ${jobConfig.assetType}</p>
                            <p><strong>Quantity:</strong> ${jobConfig.quantity}</p>
                            <p><strong>Mode:</strong> ${jobConfig.generationMode}</p>
                        </div>
                    </div>

                    <div class="preview-assets">
                        <h4>Generated Asset Names</h4>
                        <div class="asset-names-list" id="asset-names-list">
                            <div class="loading-names">Generating preview names...</div>
                        </div>
                    </div>

                    <div class="preview-estimates">
                        <h4>Estimates</h4>
                        <div class="estimate-details">
                            <p><strong>Estimated Time:</strong> <span id="preview-time">Calculating...</span></p>
                            <p><strong>Estimated Size:</strong> <span id="preview-size">Calculating...</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(previewModal);

    // Generate preview names
    generatePreviewNames(previewModal, jobConfig);

    // Close preview modal
    previewModal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(previewModal);
    });

    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            document.body.removeChild(previewModal);
        }
    });
}

function getBatchJobConfig(modal) {
    return {
        name: modal.querySelector('#job-name').value || 'Unnamed Job',
        description: modal.querySelector('#job-description').value,
        assetType: modal.querySelector('#asset-type').value,
        quantity: parseInt(modal.querySelector('#quantity').value) || 1,
        generationMode: modal.querySelector('#generation-mode').value,
        templatePresetId: modal.querySelector('#template-preset-select').value,
        namePrefix: modal.querySelector('#name-prefix').value,
        nameSuffix: modal.querySelector('#name-suffix').value,
        autoNumbering: modal.querySelector('#auto-numbering').checked,
        createCollection: modal.querySelector('#create-collection').checked
    };
}

function generatePreviewNames(previewModal, jobConfig) {
    const namesList = previewModal.querySelector('#asset-names-list');
    const timeEstimate = previewModal.querySelector('#preview-time');
    const sizeEstimate = previewModal.querySelector('#preview-size');

    // Generate sample names
    let html = '';
    for (let i = 1; i <= Math.min(jobConfig.quantity, 10); i++) {
        let name = jobConfig.namePrefix;
        if (jobConfig.autoNumbering) {
            name += i.toString().padStart(2, '0');
        }
        name += jobConfig.nameSuffix;
        html += `<div class="preview-name">${name}</div>`;
    }

    if (jobConfig.quantity > 10) {
        html += `<div class="preview-name">... and ${jobConfig.quantity - 10} more</div>`;
    }

    namesList.innerHTML = html;

    // Calculate estimates
    const avgGenerationTime = getAvgGenerationTime(jobConfig.assetType);
    const totalTime = avgGenerationTime * jobConfig.quantity;
    timeEstimate.textContent = formatTime(totalTime);

    const avgAssetSize = getAvgAssetSize(jobConfig.assetType);
    const totalSize = avgAssetSize * jobConfig.quantity;
    sizeEstimate.textContent = formatSize(totalSize);
}

function getAvgGenerationTime(assetType) {
    const times = {
        'character': 2.5,
        'monster': 3.0,
        'item': 1.5,
        'tile': 1.0,
        'sfx': 1.2,
        'music': 8.0,
        'vehicle': 4.0,
        'building': 3.5,
        'particle': 2.0,
        'ui': 1.8
    };
    return times[assetType] || 2.0;
}

function getAvgAssetSize(assetType) {
    const sizes = {
        'character': 256 * 256 * 4, // RGBA image
        'monster': 256 * 256 * 4,
        'item': 128 * 128 * 4,
        'tile': 64 * 64 * 4,
        'sfx': 44100 * 2 * 2, // 1 second stereo WAV
        'music': 44100 * 60 * 2, // 1 minute stereo
        'vehicle': 256 * 256 * 4,
        'building': 256 * 256 * 4,
        'particle': 128 * 128 * 4,
        'ui': 128 * 128 * 4
    };
    return sizes[assetType] || 65536;
}

function formatTime(seconds) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
}

function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function addBatchJob(modal) {
    const jobConfig = getBatchJobConfig(modal);

    // Validate job config
    if (!jobConfig.name.trim()) {
        showStatus('Please enter a job name', 'error');
        return;
    }

    if (jobConfig.quantity < 1 || jobConfig.quantity > 100) {
        showStatus('Quantity must be between 1 and 100', 'error');
        return;
    }

    // Add job to queue
    addJobToBatchQueue(jobConfig);

    // Close modal
    document.body.removeChild(modal);

    showStatus(`Batch job "${jobConfig.name}" added!`, 'success');
}

function addJobToBatchQueue(jobConfig) {
    // Store job in global state
    if (!App.batchJobs) App.batchJobs = [];
    App.batchJobs.push(jobConfig);

    // Update UI
    updateBatchJobsQueue();

    // Show processing section
    document.getElementById('batch-jobs-processing').classList.remove('hidden');
}

function updateBatchJobsQueue() {
    const queueContainer = document.getElementById('batch-jobs-queue');

    if (!App.batchJobs || App.batchJobs.length === 0) {
        queueContainer.innerHTML = `
            <div class="empty-batch-jobs">
                <i class="fas fa-cubes"></i>
                <p>No batch jobs configured</p>
                <button class="btn btn-primary" onclick="document.getElementById('add-batch-job-btn').click()">Create Your First Batch Job</button>
            </div>
        `;
        return;
    }

    let html = '<div class="batch-jobs-header"><h4>Batch Jobs Queue</h4></div>';
    html += '<div class="batch-jobs-items">';

    App.batchJobs.forEach((job, index) => {
        const totalAssets = job.quantity;
        const avgTime = getAvgGenerationTime(job.assetType);
        const estimatedTime = avgTime * totalAssets;

        html += `
            <div class="batch-job-item" data-job-index="${index}">
                <div class="job-item-info">
                    <h5>${job.name}</h5>
                    <p>${job.assetType} × ${totalAssets} | ${job.generationMode} | ~${formatTime(estimatedTime)}</p>
                </div>
                <div class="job-item-status">
                    <span class="status-badge pending">Pending</span>
                    <button class="btn btn-sm btn-danger remove-job" data-job-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    queueContainer.innerHTML = html;

    // Update summary
    updateBatchJobsSummary();

    // Setup remove buttons
    document.querySelectorAll('.remove-job').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobIndex = parseInt(e.currentTarget.dataset.jobIndex);
            removeBatchJob(jobIndex);
        });
    });
}

function updateBatchJobsSummary() {
    if (!App.batchJobs || App.batchJobs.length === 0) return;

    let totalAssets = 0;
    let totalTime = 0;

    App.batchJobs.forEach(job => {
        totalAssets += job.quantity;
        totalTime += getAvgGenerationTime(job.assetType) * job.quantity;
    });

    document.getElementById('total-assets-count').textContent = totalAssets;
    document.getElementById('estimated-time').textContent = formatTime(totalTime);
    document.getElementById('jobs-count').textContent = App.batchJobs.length;
}

function removeBatchJob(jobIndex) {
    if (!App.batchJobs) return;

    App.batchJobs.splice(jobIndex, 1);
    updateBatchJobsQueue();

    if (App.batchJobs.length === 0) {
        document.getElementById('batch-jobs-processing').classList.add('hidden');
    }

    showStatus('Batch job removed!', 'info');
}

function clearBatchJobs() {
    App.batchJobs = [];
    updateBatchJobsQueue();
    document.getElementById('batch-jobs-processing').classList.add('hidden');
    showStatus('All batch jobs cleared!', 'info');
}

async function startBatchJobsGeneration() {
    if (!App.batchJobs || App.batchJobs.length === 0) {
        showStatus('No batch jobs to process', 'error');
        return;
    }

    try {
        // Update UI for processing
        document.getElementById('start-batch-jobs-btn').classList.add('hidden');
        document.getElementById('pause-batch-jobs-btn').classList.remove('hidden');
        document.getElementById('stop-batch-jobs-btn').classList.remove('hidden');

        let totalProcessed = 0;
        const totalAssets = App.batchJobs.reduce((sum, job) => sum + job.quantity, 0);

        for (let jobIndex = 0; jobIndex < App.batchJobs.length; jobIndex++) {
            const job = App.batchJobs[jobIndex];
            const jobItem = document.querySelector(`.batch-job-item[data-job-index="${jobIndex}"]`);
            const statusBadge = jobItem.querySelector('.status-badge');

            // Update current job display
            document.getElementById('batch-jobs-current-job').textContent = `Processing: ${job.name}`;

            // Update job status
            statusBadge.textContent = 'Processing...';
            statusBadge.className = 'status-badge processing';

            // Process assets for this job
            for (let i = 0; i < job.quantity; i++) {
                try {
                    await generateBatchAsset(job, i + 1);
                    totalProcessed++;

                    // Update progress
                    const progress = (totalProcessed / totalAssets) * 100;
                    document.getElementById('batch-jobs-progress-fill').style.width = `${progress}%`;
                    document.getElementById('batch-jobs-progress-text').textContent =
                        `Generated ${totalProcessed}/${totalAssets} assets`;

                } catch (error) {
                    console.error(`Error generating asset ${i + 1} for job ${job.name}:`, error);
                }
            }

            // Mark job as completed
            statusBadge.textContent = 'Completed';
            statusBadge.className = 'status-badge completed';
        }

        // Processing complete
        document.getElementById('start-batch-jobs-btn').classList.remove('hidden');
        document.getElementById('pause-batch-jobs-btn').classList.add('hidden');
        document.getElementById('stop-batch-jobs-btn').classList.add('hidden');

        document.getElementById('batch-jobs-progress-text').textContent = 'Batch generation completed!';
        document.getElementById('batch-jobs-current-job').textContent = 'All jobs completed';

        showStatus(`Batch generation completed! ${totalProcessed} assets generated.`, 'success');

        // Clear completed jobs
        App.batchJobs = [];

    } catch (error) {
        console.error('Error in batch jobs generation:', error);
        showStatus('Batch generation failed', 'error');
    }
}

async function generateBatchAsset(job, assetNumber) {
    // Generate asset name
    let assetName = job.namePrefix;
    if (job.autoNumbering) {
        assetName += assetNumber.toString().padStart(2, '0');
    }
    assetName += job.nameSuffix;

    // Prepare configuration based on generation mode
    let config = {};

    if (job.generationMode === 'template' && job.templatePresetId) {
        // Load template configuration
        if (window.electronAPI) {
            const template = await window.electronAPI.dbLoadTemplate(job.templatePresetId);
            if (template) {
                config = { ...template.config };
            }
        }
    } else if (job.generationMode === 'preset' && job.templatePresetId) {
        // Load preset configuration
        if (window.electronAPI) {
            const preset = await window.electronAPI.dbLoadPreset(job.templatePresetId);
            if (preset) {
                config = { ...preset.config };
            }
        }
    } else if (job.generationMode === 'random') {
        // Use default config with randomization
        config = getDefaultConfigForType(job.assetType);
        // Apply randomization
        randomizeConfig(config, 0.7); // High randomization for variety
    }

    // Generate the asset
    if (!window.electronAPI) {
        throw new Error('Electron API not available');
    }

    const asset = await window.electronAPI.generateAsset(job.assetType, config);

    // Save the asset
    const savedAsset = {
        ...asset,
        name: assetName,
        quality_score: 85,
        batch_job: job.name,
        batch_index: assetNumber
    };

    await window.electronAPI.dbSaveAsset(savedAsset);

    // Add to local assets
    App.assets.unshift(savedAsset);

    // Simulate generation time
    return new Promise(resolve => {
        setTimeout(resolve, getAvgGenerationTime(job.assetType) * 1000);
    });
}

function getDefaultConfigForType(assetType) {
    // Return default configuration for asset type
    const defaults = {
        'character': { classType: 'warrior' },
        'monster': { monsterType: 'goblin', sizeVariant: 'medium' },
        'item': { itemType: 'sword', rarity: 'common' },
        'tile': { tileType: 'grass', biome: 'grassland', variation: 0.2 },
        'sfx': { effectType: 'sword_attack', duration: 1.0 },
        'music': { style: 'village', duration: 120 },
        'vehicle': { vehicleType: 'car', era: 'modern', size: 1.0, detailLevel: 5 },
        'building': { buildingCategory: 'residential', era: 'modern', size: 1.0, detailLevel: 5 },
        'particle': { effectCategory: 'combat', visualStyle: 'realistic', particleCount: 100, duration: 2.0 },
        'ui': { elementCategory: 'interactive', uiStyle: 'modern', size: 64, cornerRadius: 8 }
    };

    return defaults[assetType] || {};
}

function randomizeConfig(config, intensity) {
    // Apply randomization to configuration values
    Object.keys(config).forEach(key => {
        const value = config[key];
        if (typeof value === 'number') {
            const range = value * intensity * 0.5;
            config[key] = value + (Math.random() - 0.5) * range;
        }
    });
}

function pauseBatchJobsGeneration() {
    showStatus('Batch generation paused', 'info');
}

function stopBatchJobsGeneration() {
    // Reset UI
    document.getElementById('start-batch-jobs-btn').classList.remove('hidden');
    document.getElementById('pause-batch-jobs-btn').classList.add('hidden');
    document.getElementById('stop-batch-jobs-btn').classList.add('hidden');

    document.getElementById('batch-jobs-progress-text').textContent = 'Batch generation stopped';
    document.getElementById('batch-jobs-current-job').textContent = 'Generation stopped';

    showStatus('Batch generation stopped', 'warning');
}

// Progress Tracking System for All Asset Types
function setupProgressTrackingSystem() {
    // Initialize progress tracking state
    App.progressTracker = {
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

    // Setup progress tracking UI
    setupProgressTrackingUI();

    // Setup progress tracking event listeners
    setupProgressTrackingListeners();

    // Load progress history
    loadProgressHistory();
}

function setupProgressTrackingUI() {
    // Add progress tracking panel to dashboard
    const dashboardView = document.getElementById('dashboard-view');
    if (!dashboardView) return;

    const progressPanel = document.createElement('div');
    progressPanel.className = 'progress-tracking-panel';
    progressPanel.innerHTML = `
        <div class="progress-header">
            <h3>Progress Tracking</h3>
            <div class="progress-controls">
                <button id="view-progress-history" class="btn btn-sm btn-secondary">
                    <i class="fas fa-history"></i> History
                </button>
                <button id="clear-progress-history" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i> Clear
                </button>
            </div>
        </div>

        <div class="active-operations" id="active-operations">
            <div class="no-active-ops">
                <i class="fas fa-check-circle"></i>
                <p>No active operations</p>
            </div>
        </div>

        <div class="progress-metrics" id="progress-metrics">
            <div class="metric-grid">
                <div class="metric-item">
                    <div class="metric-value" id="total-generated">0</div>
                    <div class="metric-label">Total Generated</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" id="total-processed">0</div>
                    <div class="metric-label">Total Processed</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" id="avg-gen-time">0s</div>
                    <div class="metric-label">Avg Gen Time</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" id="success-rate">100%</div>
                    <div class="metric-label">Success Rate</div>
                </div>
            </div>
        </div>

        <div class="recent-operations" id="recent-operations">
            <h4>Recent Operations</h4>
            <div class="operations-list" id="operations-list">
                <div class="no-recent-ops">
                    <p>No recent operations</p>
                </div>
            </div>
        </div>
    `;

    // Insert after stats section
    const statsSection = dashboardView.querySelector('.stats-section');
    if (statsSection) {
        dashboardView.insertBefore(progressPanel, statsSection.nextSibling);
    }

    // Add global progress notification area
    const globalProgress = document.createElement('div');
    globalProgress.className = 'global-progress-notification hidden';
    globalProgress.id = 'global-progress-notification';
    globalProgress.innerHTML = `
        <div class="progress-notification-content">
            <div class="progress-icon">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="progress-details">
                <div class="progress-title" id="progress-title">Processing...</div>
                <div class="progress-subtitle" id="progress-subtitle">Please wait</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="global-progress-fill" style="width: 0%"></div>
                </div>
            </div>
            <button class="progress-close" id="progress-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(globalProgress);
}

function setupProgressTrackingListeners() {
    // View progress history
    document.getElementById('view-progress-history')?.addEventListener('click', showProgressHistory);

    // Clear progress history
    document.getElementById('clear-progress-history')?.addEventListener('click', clearProgressHistory);

    // Close global progress notification
    document.getElementById('progress-close')?.addEventListener('click', () => {
        document.getElementById('global-progress-notification').classList.add('hidden');
    });
}

function startProgressTracking(operationId, operationType, description, totalItems = 1) {
    const operation = {
        id: operationId,
        type: operationType,
        description: description,
        totalItems: totalItems,
        completedItems: 0,
        startTime: new Date(),
        status: 'running',
        progress: 0,
        currentItem: null,
        estimatedTimeRemaining: null
    };

    App.progressTracker.activeOperations.set(operationId, operation);

    // Update UI
    updateActiveOperations();
    showGlobalProgressNotification(operation);

    // Auto-save progress every 5 seconds
    operation.progressInterval = setInterval(() => {
        saveProgressState();
    }, 5000);

    return operation;
}

function updateProgress(operationId, completedItems, currentItem = null, details = null) {
    const operation = App.progressTracker.activeOperations.get(operationId);
    if (!operation) return;

    operation.completedItems = completedItems;
    operation.currentItem = currentItem;
    operation.progress = (completedItems / operation.totalItems) * 100;

    // Calculate estimated time remaining
    const elapsed = (new Date() - operation.startTime) / 1000; // seconds
    const avgTimePerItem = elapsed / completedItems;
    const remainingItems = operation.totalItems - completedItems;
    operation.estimatedTimeRemaining = avgTimePerItem * remainingItems;

    // Update UI
    updateActiveOperations();
    updateGlobalProgressNotification(operation, details);
}

function completeProgressTracking(operationId, success = true, finalDetails = null) {
    const operation = App.progressTracker.activeOperations.get(operationId);
    if (!operation) return;

    operation.endTime = new Date();
    operation.status = success ? 'completed' : 'failed';
    operation.progress = 100;
    operation.finalDetails = finalDetails;

    // Calculate final metrics
    const duration = (operation.endTime - operation.startTime) / 1000; // seconds
    operation.totalDuration = duration;
    operation.avgTimePerItem = duration / operation.totalItems;

    // Clear progress interval
    if (operation.progressInterval) {
        clearInterval(operation.progressInterval);
    }

    // Move to history
    App.progressTracker.operationHistory.unshift(operation);
    App.progressTracker.activeOperations.delete(operationId);

    // Update performance metrics
    updatePerformanceMetrics(operation);

    // Save to database
    saveOperationToHistory(operation);

    // Update UI
    updateActiveOperations();
    updateRecentOperations();
    hideGlobalProgressNotification();

    // Show completion notification
    showCompletionNotification(operation, success);
}

function updateActiveOperations() {
    const container = document.getElementById('active-operations');
    if (!container) return;

    const activeOps = Array.from(App.progressTracker.activeOperations.values());

    if (activeOps.length === 0) {
        container.innerHTML = `
            <div class="no-active-ops">
                <i class="fas fa-check-circle"></i>
                <p>No active operations</p>
            </div>
        `;
        return;
    }

    let html = '<div class="active-ops-header"><h4>Active Operations</h4></div>';
    html += '<div class="active-ops-list">';

    activeOps.forEach(op => {
        const progressPercent = Math.round(op.progress);
        const timeRemaining = op.estimatedTimeRemaining ?
            formatTime(op.estimatedTimeRemaining) : 'Calculating...';

        html += `
            <div class="active-op-item" data-op-id="${op.id}">
                <div class="op-info">
                    <div class="op-title">${op.description}</div>
                    <div class="op-details">
                        ${op.currentItem ? `<span>${op.currentItem}</span> | ` : ''}
                        <span>${op.completedItems}/${op.totalItems}</span> |
                        <span>~${timeRemaining} remaining</span>
                    </div>
                </div>
                <div class="op-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${progressPercent}%</div>
                </div>
                <button class="btn btn-sm btn-danger cancel-op" data-op-id="${op.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Setup cancel buttons
    document.querySelectorAll('.cancel-op').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const opId = e.currentTarget.dataset.opId;
            cancelOperation(opId);
        });
    });
}

function updateRecentOperations() {
    const container = document.getElementById('operations-list');
    if (!container) return;

    const recentOps = App.progressTracker.operationHistory.slice(0, 5);

    if (recentOps.length === 0) {
        container.innerHTML = `
            <div class="no-recent-ops">
                <p>No recent operations</p>
            </div>
        `;
        return;
    }

    let html = '';
    recentOps.forEach(op => {
        const duration = formatTime(op.totalDuration);
        const statusClass = op.status === 'completed' ? 'success' : 'error';
        const statusIcon = op.status === 'completed' ? 'check-circle' : 'times-circle';

        html += `
            <div class="recent-op-item">
                <div class="op-icon">
                    <i class="fas fa-${statusIcon} ${statusClass}"></i>
                </div>
                <div class="op-summary">
                    <div class="op-desc">${op.description}</div>
                    <div class="op-meta">
                        ${op.totalItems} items | ${duration} |
                        ${new Date(op.endTime).toLocaleTimeString()}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function updatePerformanceMetrics(operation) {
    const metrics = App.progressTracker.performanceMetrics;

    if (operation.type.includes('generate')) {
        metrics.totalGenerated += operation.totalItems;
        // Update average generation time
        const totalGenTime = metrics.averageGenerationTime * (metrics.totalGenerated - operation.totalItems) +
                           operation.totalDuration;
        metrics.averageGenerationTime = totalGenTime / metrics.totalGenerated;
    } else if (operation.type.includes('process')) {
        metrics.totalProcessed += operation.totalItems;
        // Update average processing time
        const totalProcTime = metrics.averageProcessingTime * (metrics.totalProcessed - operation.totalItems) +
                            operation.totalDuration;
        metrics.averageProcessingTime = totalProcTime / metrics.totalProcessed;
    }

    // Update success rate
    const totalOperations = App.progressTracker.operationHistory.length;
    const successfulOperations = App.progressTracker.operationHistory.filter(op => op.status === 'completed').length;
    metrics.successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 100;

    metrics.lastUpdated = new Date();

    // Update UI
    updateMetricsDisplay();
}

function updateMetricsDisplay() {
    const metrics = App.progressTracker.performanceMetrics;

    document.getElementById('total-generated').textContent = metrics.totalGenerated;
    document.getElementById('total-processed').textContent = metrics.totalProcessed;
    document.getElementById('avg-gen-time').textContent = formatTime(metrics.averageGenerationTime);
    document.getElementById('success-rate').textContent = `${Math.round(metrics.successRate)}%`;
}

function showGlobalProgressNotification(operation) {
    const notification = document.getElementById('global-progress-notification');
    if (!notification) return;

    document.getElementById('progress-title').textContent = operation.description;
    document.getElementById('progress-subtitle').textContent = 'Initializing...';

    notification.classList.remove('hidden');
}

function updateGlobalProgressNotification(operation, details = null) {
    const notification = document.getElementById('global-progress-notification');
    if (!notification || notification.classList.contains('hidden')) return;

    const progressPercent = Math.round(operation.progress);
    const subtitle = details || `${operation.completedItems}/${operation.totalItems} completed`;

    document.getElementById('progress-title').textContent = operation.description;
    document.getElementById('progress-subtitle').textContent = subtitle;
    document.getElementById('global-progress-fill').style.width = `${progressPercent}%`;
}

function hideGlobalProgressNotification() {
    const notification = document.getElementById('global-progress-notification');
    if (notification) {
        notification.classList.add('hidden');
    }
}

function showCompletionNotification(operation, success) {
    const title = success ? 'Operation Completed' : 'Operation Failed';
    const message = success ?
        `${operation.description} completed successfully in ${formatTime(operation.totalDuration)}` :
        `${operation.description} failed after ${formatTime(operation.totalDuration)}`;

    showStatus(message, success ? 'success' : 'error');
}

function cancelOperation(operationId) {
    const operation = App.progressTracker.activeOperations.get(operationId);
    if (!operation) return;

    if (confirm(`Are you sure you want to cancel "${operation.description}"?`)) {
        completeProgressTracking(operationId, false, 'Cancelled by user');
        showStatus('Operation cancelled', 'warning');
    }
}

function showProgressHistory() {
    // Create progress history modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content progress-history-modal">
            <div class="modal-header">
                <h3>Progress History</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="history-filters">
                    <select id="history-filter-type" class="form-control">
                        <option value="all">All Operations</option>
                        <option value="generation">Generation</option>
                        <option value="processing">Processing</option>
                        <option value="export">Export</option>
                    </select>
                    <select id="history-filter-status" class="form-control">
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                    <input type="date" id="history-filter-date" class="form-control">
                </div>
                <div class="history-list" id="history-list">
                    <div class="loading-history">Loading history...</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup modal functionality
    setupProgressHistoryModal(modal);

    // Load history
    loadProgressHistoryForModal(modal);

    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function setupProgressHistoryModal(modal) {
    // Setup filters
    const typeFilter = modal.querySelector('#history-filter-type');
    const statusFilter = modal.querySelector('#history-filter-status');
    const dateFilter = modal.querySelector('#history-filter-date');

    const applyFilters = () => {
        loadProgressHistoryForModal(modal, {
            type: typeFilter.value,
            status: statusFilter.value,
            date: dateFilter.value
        });
    };

    typeFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    dateFilter.addEventListener('change', applyFilters);
}

function loadProgressHistoryForModal(modal, filters = {}) {
    const historyList = modal.querySelector('#history-list');

    let operations = [...App.progressTracker.operationHistory];

    // Apply filters
    if (filters.type && filters.type !== 'all') {
        operations = operations.filter(op => op.type.includes(filters.type));
    }

    if (filters.status && filters.status !== 'all') {
        operations = operations.filter(op => op.status === filters.status);
    }

    if (filters.date) {
        const filterDate = new Date(filters.date);
        operations = operations.filter(op => {
            const opDate = new Date(op.endTime);
            return opDate.toDateString() === filterDate.toDateString();
        });
    }

    if (operations.length === 0) {
        historyList.innerHTML = '<div class="no-history">No operations found</div>';
        return;
    }

    let html = '';
    operations.forEach(op => {
        const duration = formatTime(op.totalDuration);
        const statusClass = op.status === 'completed' ? 'success' : 'error';
        const statusIcon = op.status === 'completed' ? 'check-circle' : 'times-circle';

        html += `
            <div class="history-item">
                <div class="history-icon">
                    <i class="fas fa-${statusIcon} ${statusClass}"></i>
                </div>
                <div class="history-details">
                    <div class="history-title">${op.description}</div>
                    <div class="history-meta">
                        ${op.type} | ${op.totalItems} items | ${duration} |
                        ${new Date(op.endTime).toLocaleString()}
                    </div>
                    ${op.finalDetails ? `<div class="history-details-text">${op.finalDetails}</div>` : ''}
                </div>
            </div>
        `;
    });

    historyList.innerHTML = html;
}

function clearProgressHistory() {
    if (confirm('Are you sure you want to clear all progress history? This cannot be undone.')) {
        App.progressTracker.operationHistory = [];
        updateRecentOperations();
        updateMetricsDisplay();

        // Clear from database
        if (window.electronAPI) {
            window.electronAPI.dbClearProgressHistory();
        }

        showStatus('Progress history cleared', 'info');
    }
}

async function loadProgressHistory() {
    try {
        if (!window.electronAPI) return;

        const history = await window.electronAPI.dbGetProgressHistory();
        App.progressTracker.operationHistory = history || [];

        // Load performance metrics
        const metrics = await window.electronAPI.dbGetPerformanceMetrics();
        if (metrics) {
            App.progressTracker.performanceMetrics = { ...App.progressTracker.performanceMetrics, ...metrics };
        }

        updateRecentOperations();
        updateMetricsDisplay();

    } catch (error) {
        console.error('Error loading progress history:', error);
    }
}

async function saveOperationToHistory(operation) {
    try {
        if (!window.electronAPI) return;

        await window.electronAPI.dbSaveOperationHistory(operation);
    } catch (error) {
        console.error('Error saving operation to history:', error);
    }
}

function saveProgressState() {
    // Save current progress state to local storage as backup
    try {
        const progressState = {
            operationHistory: App.progressTracker.operationHistory.slice(0, 50), // Keep last 50
            performanceMetrics: App.progressTracker.performanceMetrics,
            lastSaved: new Date()
        };

        localStorage.setItem('tptProgressState', JSON.stringify(progressState));
    } catch (error) {
        console.error('Error saving progress state:', error);
    }
}

// Integration with existing generation functions
function integrateProgressTracking() {
    // Override existing generation functions to include progress tracking
    const originalHandleGenerateAsset = window.handleGenerateAsset;
    window.handleGenerateAsset = async function() {
        const operationId = `gen-${Date.now()}`;
        const operation = startProgressTracking(operationId, 'generation', 'Generating Asset', 1);

        try {
            updateProgress(operationId, 0, 'Preparing...');
            await originalHandleGenerateAsset();
            updateProgress(operationId, 1, 'Completing...');
            completeProgressTracking(operationId, true, 'Asset generated successfully');
        } catch (error) {
            completeProgressTracking(operationId, false, error.message);
        }
    };

    // Override batch processing functions
    const originalStartBatchAudioProcessing = window.startBatchAudioProcessing;
    window.startBatchAudioProcessing = async function() {
        const operationId = `batch-audio-${Date.now()}`;
        const queueItems = document.querySelectorAll('.batch-queue-item');
        const operation = startProgressTracking(operationId, 'processing', 'Batch Audio Processing', queueItems.length);

        let completed = 0;
        const originalProcessAudioAsset = window.processAudioAsset;

        window.processAudioAsset = async function(assetId, options) {
            const result = await originalProcessAudioAsset(assetId, options);
            completed++;
            updateProgress(operationId, completed, `Processing ${completed}/${queueItems.length}`);
            return result;
        };

        try {
            await originalStartBatchAudioProcessing();
            completeProgressTracking(operationId, true, `${queueItems.length} audio assets processed`);
        } catch (error) {
            completeProgressTracking(operationId, false, error.message);
        } finally {
            window.processAudioAsset = originalProcessAudioAsset;
        }
    };

    // Override batch generation functions
    const originalStartBatchJobsGeneration = window.startBatchJobsGeneration;
    window.startBatchJobsGeneration = async function() {
        const operationId = `batch-gen-${Date.now()}`;
        const totalAssets = App.batchJobs.reduce((sum, job) => sum + job.quantity, 0);
        const operation = startProgressTracking(operationId, 'generation', 'Batch Asset Generation', totalAssets);

        let completed = 0;
        const originalGenerateBatchAsset = window.generateBatchAsset;

        window.generateBatchAsset = async function(job, assetNumber) {
            const result = await originalGenerateBatchAsset(job, assetNumber);
            completed++;
            updateProgress(operationId, completed, `Generated ${completed}/${totalAssets}`);
            return result;
        };

        try {
            await originalStartBatchJobsGeneration();
            completeProgressTracking(operationId, true, `${totalAssets} assets generated`);
        } catch (error) {
            completeProgressTracking(operationId, false, error.message);
        } finally {
            window.generateBatchAsset = originalGenerateBatchAsset;
        }
    };
}

// Audio Generation IPC Integration
function setupAudioIPCIntegration() {
    // Audio generation IPC calls
    window.generateAudioAsset = async (type, config) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `audio-gen-${Date.now()}`;
            startProgressTracking(operationId, 'generation', `Generating ${type} audio`, 1);

            const result = await window.electronAPI.generateAudioAsset(type, config);

            completeProgressTracking(operationId, true, 'Audio asset generated successfully');
            return result;
        } catch (error) {
            console.error('Error generating audio asset:', error);
            completeProgressTracking(`audio-gen-${Date.now()}`, false, error.message);
            throw error;
        }
    };

    // Audio export IPC calls
    window.exportAudioAsset = async (assetId, format, options = {}) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `audio-export-${Date.now()}`;
            startProgressTracking(operationId, 'export', `Exporting audio as ${format}`, 1);

            const result = await window.electronAPI.exportAudioAsset(assetId, format, options);

            completeProgressTracking(operationId, true, `Audio exported as ${format}`);
            return result;
        } catch (error) {
            console.error('Error exporting audio asset:', error);
            completeProgressTracking(`audio-export-${Date.now()}`, false, error.message);
            throw error;
        }
    };

    // Batch audio processing IPC calls
    window.batchProcessAudio = async (assetIds, operations) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `batch-audio-${Date.now()}`;
            startProgressTracking(operationId, 'processing', 'Batch processing audio assets', assetIds.length);

            let completed = 0;
            const results = [];

            for (const assetId of assetIds) {
                try {
                    const result = await window.electronAPI.processAudioAsset(assetId, operations);
                    results.push(result);
                    completed++;
                    updateProgress(operationId, completed, `Processing asset ${completed}/${assetIds.length}`);
                } catch (error) {
                    console.error(`Error processing audio asset ${assetId}:`, error);
                    results.push({ assetId, error: error.message });
                }
            }

            completeProgressTracking(operationId, true, `Processed ${completed}/${assetIds.length} audio assets`);
            return results;
        } catch (error) {
            console.error('Error in batch audio processing:', error);
            completeProgressTracking(`batch-audio-${Date.now()}`, false, error.message);
            throw error;
        }
    };

    // Audio playback IPC calls
    window.playAudioAsset = async (assetId) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.playAudioAsset(assetId);
            }
        } catch (error) {
            console.error('Error playing audio asset:', error);
            throw error;
        }
    };

    window.stopAudioPlayback = async () => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.stopAudioPlayback();
            }
        } catch (error) {
            console.error('Error stopping audio playback:', error);
            throw error;
        }
    };

    // Audio parameter updates IPC calls
    window.updateAudioParameters = async (assetId, parameters) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.updateAudioParameters(assetId, parameters);
            }
        } catch (error) {
            console.error('Error updating audio parameters:', error);
            throw error;
        }
    };

    // Audio analysis IPC calls
    window.analyzeAudioAsset = async (assetId) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.analyzeAudioAsset(assetId);
            }
        } catch (error) {
            console.error('Error analyzing audio asset:', error);
            throw error;
        }
    };

    // Audio mixing IPC calls
    window.mixAudioAssets = async (assetIds, mixConfig) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `audio-mix-${Date.now()}`;
            startProgressTracking(operationId, 'processing', 'Mixing audio assets', 1);

            const result = await window.electronAPI.mixAudioAssets(assetIds, mixConfig);

            completeProgressTracking(operationId, true, 'Audio assets mixed successfully');
            return result;
        } catch (error) {
            console.error('Error mixing audio assets:', error);
            completeProgressTracking(`audio-mix-${Date.now()}`, false, error.message);
            throw error;
        }
    };
}

// Vehicle Generation IPC Integration
function setupVehicleIPCIntegration() {
    // Vehicle generation IPC calls
    window.generateVehicleAsset = async (type, config) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `vehicle-gen-${Date.now()}`;
            startProgressTracking(operationId, 'generation', `Generating ${type} vehicle`, 1);

            const result = await window.electronAPI.generateVehicleAsset(type, config);

            completeProgressTracking(operationId, true, 'Vehicle asset generated successfully');
            return result;
        } catch (error) {
            console.error('Error generating vehicle asset:', error);
            completeProgressTracking(`vehicle-gen-${Date.now()}`, false, error.message);
            throw error;
        }
    };

    // Vehicle customization IPC calls
    window.customizeVehicleAsset = async (assetId, customizations) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.customizeVehicleAsset(assetId, customizations);
            }
        } catch (error) {
            console.error('Error customizing vehicle asset:', error);
            throw error;
        }
    };

    // Vehicle preview IPC calls
    window.generateVehiclePreview = async (type, config) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.generateVehiclePreview(type, config);
            }
        } catch (error) {
            console.error('Error generating vehicle preview:', error);
            throw error;
        }
    };
}

// Building Generation IPC Integration
function setupBuildingIPCIntegration() {
    // Building generation IPC calls
    window.generateBuildingAsset = async (type, config) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `building-gen-${Date.now()}`;
            startProgressTracking(operationId, 'generation', `Generating ${type} building`, 1);

            const result = await window.electronAPI.generateBuildingAsset(type, config);

            completeProgressTracking(operationId, true, 'Building asset generated successfully');
            return result;
        } catch (error) {
            console.error('Error generating building asset:', error);
            completeProgressTracking(`building-gen-${Date.now()}`, false, error.message);
            throw error;
        }
    };

    // Building customization IPC calls
    window.customizeBuildingAsset = async (assetId, customizations) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.customizeBuildingAsset(assetId, customizations);
            }
        } catch (error) {
            console.error('Error customizing building asset:', error);
            throw error;
        }
    };

    // Architectural style IPC calls
    window.applyArchitecturalStyle = async (assetId, style) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.applyArchitecturalStyle(assetId, style);
            }
        } catch (error) {
            console.error('Error applying architectural style:', error);
            throw error;
        }
    };
}

// Particle Effect IPC Integration
function setupParticleIPCIntegration() {
    // Particle effect generation IPC calls
    window.generateParticleAsset = async (type, config) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `particle-gen-${Date.now()}`;
            startProgressTracking(operationId, 'generation', `Generating ${type} particle effect`, 1);

            const result = await window.electronAPI.generateParticleAsset(type, config);

            completeProgressTracking(operationId, true, 'Particle effect generated successfully');
            return result;
        } catch (error) {
            console.error('Error generating particle asset:', error);
            completeProgressTracking(`particle-gen-${Date.now()}`, false, error.message);
            throw error;
        }
    };

    // Particle animation IPC calls
    window.generateParticleAnimation = async (assetId, frames) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.generateParticleAnimation(assetId, frames);
            }
        } catch (error) {
            console.error('Error generating particle animation:', error);
            throw error;
        }
    };

    // Particle preview IPC calls
    window.previewParticleEffect = async (type, config) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.previewParticleEffect(type, config);
            }
        } catch (error) {
            console.error('Error previewing particle effect:', error);
            throw error;
        }
    };
}

// UI Element IPC Integration
function setupUIIPCIntegration() {
    // UI element generation IPC calls
    window.generateUIAsset = async (type, config) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `ui-gen-${Date.now()}`;
            startProgressTracking(operationId, 'generation', `Generating ${type} UI element`, 1);

            const result = await window.electronAPI.generateUIAsset(type, config);

            completeProgressTracking(operationId, true, 'UI element generated successfully');
            return result;
        } catch (error) {
            console.error('Error generating UI asset:', error);
            completeProgressTracking(`ui-gen-${Date.now()}`, false, error.message);
            throw error;
        }
    };

    // UI state generation IPC calls
    window.generateUIStates = async (assetId, states) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.generateUIStates(assetId, states);
            }
        } catch (error) {
            console.error('Error generating UI states:', error);
            throw error;
        }
    };

    // UI theme application IPC calls
    window.applyUITheme = async (assetId, theme) => {
        try {
            if (!window.electronAPI) {
                return await window.electronAPI.applyUITheme(assetId, theme);
            }
        } catch (error) {
            console.error('Error applying UI theme:', error);
            throw error;
        }
    };
}

// Batch Export IPC Integration
function setupBatchExportIPCIntegration() {
    // Batch export IPC calls
    window.batchExportAssets = async (assetIds, format, options = {}) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `batch-export-${Date.now()}`;
            startProgressTracking(operationId, 'export', `Batch exporting ${assetIds.length} assets`, assetIds.length);

            let completed = 0;
            const results = [];

            for (const assetId of assetIds) {
                try {
                    const result = await window.electronAPI.exportAsset(assetId, format, options);
                    results.push(result);
                    completed++;
                    updateProgress(operationId, completed, `Exporting asset ${completed}/${assetIds.length}`);
                } catch (error) {
                    console.error(`Error exporting asset ${assetId}:`, error);
                    results.push({ assetId, error: error.message });
                }
            }

            completeProgressTracking(operationId, true, `Exported ${completed}/${assetIds.length} assets`);
            return results;
        } catch (error) {
            console.error('Error in batch export:', error);
            completeProgressTracking(`batch-export-${Date.now()}`, false, error.message);
            throw error;
        }
    };

    // Mixed asset type batch export
    window.batchExportMixedAssets = async (exportConfig) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const totalAssets = Object.values(exportConfig).reduce((sum, assets) => sum + assets.length, 0);
            const operationId = `mixed-export-${Date.now()}`;
            startProgressTracking(operationId, 'export', 'Batch exporting mixed assets', totalAssets);

            let completed = 0;
            const results = { success: [], errors: [] };

            for (const [format, assetIds] of Object.entries(exportConfig)) {
                for (const assetId of assetIds) {
                    try {
                        const result = await window.electronAPI.exportAsset(assetId, format);
                        results.success.push(result);
                        completed++;
                        updateProgress(operationId, completed, `Exporting asset ${completed}/${totalAssets}`);
                    } catch (error) {
                        console.error(`Error exporting asset ${assetId}:`, error);
                        results.errors.push({ assetId, format, error: error.message });
                    }
                }
            }

            completeProgressTracking(operationId, true,
                `Exported ${results.success.length}/${totalAssets} assets (${results.errors.length} errors)`);
            return results;
        } catch (error) {
            console.error('Error in mixed batch export:', error);
            completeProgressTracking(`mixed-export-${Date.now()}`, false, error.message);
            throw error;
        }
    };

    // Export with custom naming
    window.exportWithCustomNaming = async (assetIds, namingPattern, format, options = {}) => {
        try {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const operationId = `custom-export-${Date.now()}`;
            startProgressTracking(operationId, 'export', 'Exporting with custom naming', assetIds.length);

            const result = await window.electronAPI.exportWithCustomNaming(assetIds, namingPattern, format, options);

            completeProgressTracking(operationId, true, `Exported ${assetIds.length} assets with custom naming`);
            return result;
        } catch (error) {
            console.error('Error in custom naming export:', error);
            completeProgressTracking(`custom-export-${Date.now()}`, false, error.message);
            throw error;
        }
    };
}

// Initialize all IPC integrations
function initializeIPCIntegrations() {
    setupAudioIPCIntegration();
    setupVehicleIPCIntegration();
    setupBuildingIPCIntegration();
    setupParticleIPCIntegration();
    setupUIIPCIntegration();
    setupBatchExportIPCIntegration();

    console.log('IPC integrations initialized');
}

// Vehicle Preview System
function initializeVehiclePreview() {
    // Setup vehicle preview functionality
    setupVehiclePreviewControls();
    setupVehiclePreviewCanvas();
}

function setupVehiclePreviewControls() {
    // Add preview controls to vehicle type selection
    const vehiclePanel = document.getElementById('vehicle-type-panel');
    if (!vehiclePanel) return;

    // Add preview controls section
    const previewControls = document.createElement('div');
    previewControls.className = 'vehicle-preview-controls';
    previewControls.innerHTML = `
        <div class="preview-controls-header">
            <h4>Live Preview</h4>
            <div class="preview-actions">
                <button id="refresh-vehicle-preview" class="btn btn-sm btn-secondary">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
                <button id="randomize-vehicle-preview" class="btn btn-sm btn-info">
                    <i class="fas fa-dice"></i> Randomize
                </button>
            </div>
        </div>
        <div class="vehicle-preview-canvas-container">
            <canvas id="vehicle-preview-canvas" width="200" height="120"></canvas>
            <div class="preview-info">
                <span id="vehicle-preview-name">Select a vehicle type</span>
            </div>
        </div>
    `;

    vehiclePanel.appendChild(previewControls);

    // Setup event listeners
    document.getElementById('refresh-vehicle-preview').addEventListener('click', refreshVehiclePreview);
    document.getElementById('randomize-vehicle-preview').addEventListener('click', randomizeVehiclePreview);
}

function setupVehiclePreviewCanvas() {
    // Initialize canvas for vehicle preview
    const canvas = document.getElementById('vehicle-preview-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas with background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add grid pattern
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Add placeholder text
    ctx.fillStyle = '#999';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Vehicle Preview', canvas.width / 2, canvas.height / 2);
}

async function refreshVehiclePreview() {
    const selectedType = document.querySelector('.vehicle-type-btn.active');
    if (!selectedType) {
        showStatus('Please select a vehicle type first', 'warning');
        return;
    }

    const vehicleType = selectedType.dataset.vehicleType;
    await updateVehiclePreview(vehicleType);
}

async function randomizeVehiclePreview() {
    const selectedType = document.querySelector('.vehicle-type-btn.active');
    if (!selectedType) {
        showStatus('Please select a vehicle type first', 'warning');
        return;
    }

    const vehicleType = selectedType.dataset.vehicleType;

    // Generate random configuration
    const randomConfig = generateRandomVehicleConfig(vehicleType);

    await updateVehiclePreview(vehicleType, randomConfig);
}

function generateRandomVehicleConfig(vehicleType) {
    // Generate random configuration for preview
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
    const sizes = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
    const detailLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return {
        vehicleType: vehicleType,
        era: ['modern', 'futuristic', 'retro', 'medieval'][Math.floor(Math.random() * 4)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        detailLevel: detailLevels[Math.floor(Math.random() * detailLevels.length)],
        primaryColor: colors[Math.floor(Math.random() * colors.length)],
        secondaryColor: colors[Math.floor(Math.random() * colors.length)],
        accentColor: colors[Math.floor(Math.random() * colors.length)],
        damage: Math.random() * 0.5, // 0-50% damage
        wear: Math.random() * 0.5, // 0-50% wear
        features: {
            lights: Math.random() > 0.5,
            wheels: Math.random() > 0.5,
            spoiler: Math.random() > 0.5,
            armor: Math.random() > 0.5,
            weapons: Math.random() > 0.5
        }
    };
}

async function updateVehiclePreview(vehicleType, config = null) {
    const canvas = document.getElementById('vehicle-preview-canvas');
    const previewName = document.getElementById('vehicle-preview-name');

    if (!canvas) return;

    try {
        // Show loading state
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Generating preview...', canvas.width / 2, canvas.height / 2);

        // Generate preview configuration if not provided
        if (!config) {
            config = generateRandomVehicleConfig(vehicleType);
        }

        // Generate preview asset
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }

        const previewAsset = await window.electronAPI.generateVehiclePreview(vehicleType, config);

        if (previewAsset && previewAsset.sprite) {
            // Draw the preview image
            const img = new Image();
            img.onload = function() {
                // Clear canvas
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Calculate scaling to fit canvas
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;

                // Draw image
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Update preview name
                previewName.textContent = `${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} Preview`;
            };

            img.src = `data:image/png;base64,${previewAsset.sprite.data}`;
        } else {
            throw new Error('Invalid preview asset');
        }

    } catch (error) {
        console.error('Error updating vehicle preview:', error);

        // Show error state
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Preview failed', canvas.width / 2, canvas.height / 2);

        previewName.textContent = 'Preview Error';
        showStatus('Failed to generate vehicle preview', 'error');
    }
}

// Building Preview System
function initializeBuildingPreview() {
    // Setup building preview functionality
    setupBuildingPreviewControls();
    setupBuildingPreviewCanvas();
}

function setupBuildingPreviewControls() {
    // Add preview controls to building type selection
    const buildingPanel = document.getElementById('building-type-panel');
    if (!buildingPanel) return;

    // Add preview controls section
    const previewControls = document.createElement('div');
    previewControls.className = 'building-preview-controls';
    previewControls.innerHTML = `
        <div class="preview-controls-header">
            <h4>Live Preview</h4>
            <div class="preview-actions">
                <button id="refresh-building-preview" class="btn btn-sm btn-secondary">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
                <button id="randomize-building-preview" class="btn btn-sm btn-info">
                    <i class="fas fa-dice"></i> Randomize
                </button>
            </div>
        </div>
        <div class="building-preview-canvas-container">
            <canvas id="building-preview-canvas" width="200" height="150"></canvas>
            <div class="preview-info">
                <span id="building-preview-name">Select a building type</span>
            </div>
        </div>
    `;

    buildingPanel.appendChild(previewControls);

    // Setup event listeners
    document.getElementById('refresh-building-preview').addEventListener('click', refreshBuildingPreview);
    document.getElementById('randomize-building-preview').addEventListener('click', randomizeBuildingPreview);
}

function setupBuildingPreviewCanvas() {
    // Initialize canvas for building preview
    const canvas = document.getElementById('building-preview-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas with background (sky)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

    // Add placeholder text
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Building Preview', canvas.width / 2, canvas.height / 2);
}

async function refreshBuildingPreview() {
    const selectedType = document.querySelector('.building-type-btn.active');
    if (!selectedType) {
        showStatus('Please select a building type first', 'warning');
        return;
    }

    const buildingType = selectedType.dataset.buildingType;
    await updateBuildingPreview(buildingType);
}

async function randomizeBuildingPreview() {
    const selectedType = document.querySelector('.building-type-btn.active');
    if (!selectedType) {
        showStatus('Please select a building type first', 'warning');
        return;
    }

    const buildingType = selectedType.dataset.buildingType;

    // Generate random configuration
    const randomConfig = generateRandomBuildingConfig(buildingType);

    await updateBuildingPreview(buildingType, randomConfig);
}

function generateRandomBuildingConfig(buildingType) {
    // Generate random configuration for preview
    const colors = ['#8B4513', '#654321', '#D2691E', '#A0522D', '#CD853F', '#DEB887', '#F4A460'];
    const roofColors = ['#654321', '#8B4513', '#A0522D', '#696969', '#2F4F4F'];
    const windowColors = ['#87CEEB', '#98FB98', '#F0E68C', '#DDA0DD', '#FFB6C1'];
    const sizes = [0.3, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
    const detailLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return {
        buildingType: buildingType,
        buildingCategory: getBuildingCategory(buildingType),
        era: ['ancient', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic'][Math.floor(Math.random() * 6)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        detailLevel: detailLevels[Math.floor(Math.random() * detailLevels.length)],
        architecturalStyle: ['gothic', 'baroque', 'classical', 'modernist', 'victorian'][Math.floor(Math.random() * 5)],
        roofStyle: ['flat', 'pitched', 'mansard', 'gabled'][Math.floor(Math.random() * 4)],
        primaryColor: colors[Math.floor(Math.random() * colors.length)],
        secondaryColor: colors[Math.floor(Math.random() * colors.length)],
        accentColor: colors[Math.floor(Math.random() * colors.length)],
        roofColor: roofColors[Math.floor(Math.random() * roofColors.length)],
        windowColor: windowColors[Math.floor(Math.random() * windowColors.length)],
        condition: Math.random() * 0.3 + 0.7, // 70-100% condition
        lighting: ['daylight', 'sunset', 'night'][Math.floor(Math.random() * 3)],
        features: {
            chimney: Math.random() > 0.6,
            porch: Math.random() > 0.7,
            balcony: Math.random() > 0.8,
            tower: Math.random() > 0.85,
            garden: Math.random() > 0.6,
            trees: Math.random() > 0.5
        }
    };
}

function getBuildingCategory(buildingType) {
    const categories = {
        'house': 'residential',
        'cottage': 'residential',
        'mansion': 'residential',
        'apartment': 'residential',
        'townhouse': 'residential',
        'shop': 'commercial',
        'restaurant': 'commercial',
        'office': 'commercial',
        'hotel': 'commercial',
        'bank': 'commercial',
        'factory': 'industrial',
        'warehouse': 'industrial',
        'powerplant': 'industrial',
        'refinery': 'industrial',
        'barracks': 'military',
        'fortress': 'military',
        'watchtower': 'military',
        'castle': 'military',
        'church': 'religious',
        'temple': 'religious',
        'mosque': 'religious',
        'shrine': 'religious',
        'bridge': 'infrastructure',
        'tunnel': 'infrastructure',
        'lighthouse': 'infrastructure',
        'dam': 'infrastructure'
    };

    return categories[buildingType] || 'residential';
}

async function updateBuildingPreview(buildingType, config = null) {
    const canvas = document.getElementById('building-preview-canvas');
    const previewName = document.getElementById('building-preview-name');

    if (!canvas) return;

    try {
        // Show loading state
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Generating preview...', canvas.width / 2, canvas.height / 2);

        // Generate preview configuration if not provided
        if (!config) {
            config = generateRandomBuildingConfig(buildingType);
        }

        // Generate preview asset
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }

        const previewAsset = await window.electronAPI.generateBuildingPreview(buildingType, config);

        if (previewAsset && previewAsset.sprite) {
            // Draw the preview image
            const img = new Image();
            img.onload = function() {
                // Clear canvas with sky background
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Add ground
                ctx.fillStyle = '#90EE90';
                ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

                // Calculate scaling to fit canvas
                const scale = Math.min(canvas.width / img.width, canvas.height * 0.6 / img.height) * 0.9;
                const x = (canvas.width - img.width * scale) / 2;
                const y = canvas.height * 0.7 - img.height * scale;

                // Draw image
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Update preview name
                previewName.textContent = `${buildingType.charAt(0).toUpperCase() + buildingType.slice(1)} Preview`;
            };

            img.src = `data:image/png;base64,${previewAsset.sprite.data}`;
        } else {
            throw new Error('Invalid preview asset');
        }

    } catch (error) {
        console.error('Error updating building preview:', error);

        // Show error state
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Preview failed', canvas.width / 2, canvas.height / 2);

        previewName.textContent = 'Preview Error';
        showStatus('Failed to generate building preview', 'error');
    }
}

// Make functions globally available for HTML event handlers
window.switchView = switchView;
window.App = App;
