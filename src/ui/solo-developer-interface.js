/**
 * Solo Developer Interface - User-friendly interface for indie game developers
 * Provides simple, intuitive controls for asset creation and project management
 */

const AssetWorkflowManager = require('../core/asset-workflow-manager');

class SoloDeveloperInterface {
    constructor(container) {
        this.container = container;
        this.workflowManager = new AssetWorkflowManager();
        this.currentView = 'dashboard';
        this.selectedAssets = new Set();

        this.init();
    }

    /**
     * Initialize the interface
     */
    async init() {
        await this.workflowManager.init();
        this.render();
        this.bindEvents();
        console.log('Solo Developer Interface initialized');
    }

    /**
     * Render the interface
     */
    render() {
        this.container.innerHTML = this.getHTML();
        this.updateStats();
    }

    /**
     * Get HTML structure
     */
    getHTML() {
        return `
            <div class="solo-dev-interface">
                <!-- Header -->
                <header class="interface-header">
                    <h1>🎮 TPT Asset Editor</h1>
                    <div class="project-info">
                        <span id="project-name">No Project Loaded</span>
                        <button id="new-project-btn" class="btn btn-primary">New Project</button>
                        <button id="load-project-btn" class="btn btn-secondary">Load Project</button>
                    </div>
                </header>

                <!-- Navigation -->
                <nav class="interface-nav">
                    <button class="nav-btn active" data-view="dashboard">Dashboard</button>
                    <button class="nav-btn" data-view="quick-generate">Quick Generate</button>
                    <button class="nav-btn" data-view="asset-packs">Asset Packs</button>
                    <button class="nav-btn" data-view="my-assets">My Assets</button>
                    <button class="nav-btn" data-view="export">Export</button>
                </nav>

                <!-- Main Content -->
                <main class="interface-content">
                    <div id="dashboard-view" class="view active">
                        ${this.getDashboardHTML()}
                    </div>
                    <div id="quick-generate-view" class="view">
                        ${this.getQuickGenerateHTML()}
                    </div>
                    <div id="asset-packs-view" class="view">
                        ${this.getAssetPacksHTML()}
                    </div>
                    <div id="my-assets-view" class="view">
                        ${this.getMyAssetsHTML()}
                    </div>
                    <div id="export-view" class="view">
                        ${this.getExportHTML()}
                    </div>
                </main>

                <!-- Status Bar -->
                <footer class="interface-footer">
                    <div class="status-info">
                        <span id="status-text">Ready</span>
                        <span id="asset-count">0 assets</span>
                    </div>
                    <div class="progress-container">
                        <div id="progress-bar" class="progress-bar" style="width: 0%"></div>
                    </div>
                </footer>
            </div>
        `;
    }

    /**
     * Get dashboard HTML
     */
    getDashboardHTML() {
        return `
            <div class="dashboard">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Assets</h3>
                        <div class="stat-value" id="total-assets">0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Characters</h3>
                        <div class="stat-value" id="character-count">0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Monsters</h3>
                        <div class="stat-value" id="monster-count">0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Items</h3>
                        <div class="stat-value" id="item-count">0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Tiles</h3>
                        <div class="stat-value" id="tile-count">0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Environments</h3>
                        <div class="stat-value" id="environment-count">0</div>
                    </div>
                </div>

                <div class="quick-actions">
                    <h3>Quick Actions</h3>
                    <div class="action-buttons">
                        <button class="quick-action-btn" data-action="generate-hero">
                            <span class="icon">⚔️</span>
                            <span>Generate Hero</span>
                        </button>
                        <button class="quick-action-btn" data-action="generate-monsters">
                            <span class="icon">👹</span>
                            <span>Generate Monsters</span>
                        </button>
                        <button class="quick-action-btn" data-action="generate-items">
                            <span class="icon">🗡️</span>
                            <span>Generate Items</span>
                        </button>
                        <button class="quick-action-btn" data-action="generate-tiles">
                            <span class="icon">🌱</span>
                            <span>Generate Tiles</span>
                        </button>
                        <button class="quick-action-btn" data-action="create-level">
                            <span class="icon">🏰</span>
                            <span>Create Level</span>
                        </button>
                        <button class="quick-action-btn" data-action="export-project">
                            <span class="icon">📦</span>
                            <span>Export Project</span>
                        </button>
                    </div>
                </div>

                <div class="recent-activity">
                    <h3>Recent Activity</h3>
                    <div id="activity-list" class="activity-list">
                        <p class="no-activity">No recent activity</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get quick generate HTML
     */
    getQuickGenerateHTML() {
        return `
            <div class="quick-generate">
                <div class="generate-section">
                    <h3>🎭 Characters</h3>
                    <div class="preset-grid">
                        <div class="preset-card" data-type="character" data-preset="warrior">
                            <div class="preset-icon">⚔️</div>
                            <div class="preset-name">Warrior</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                        <div class="preset-card" data-type="character" data-preset="mage">
                            <div class="preset-icon">🔮</div>
                            <div class="preset-name">Mage</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                        <div class="preset-card" data-type="character" data-preset="rogue">
                            <div class="preset-icon">🗡️</div>
                            <div class="preset-name">Rogue</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                    </div>
                </div>

                <div class="generate-section">
                    <h3>👹 Monsters</h3>
                    <div class="preset-grid">
                        <div class="preset-card" data-type="monster" data-preset="goblin">
                            <div class="preset-icon">👺</div>
                            <div class="preset-name">Goblin</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                        <div class="preset-card" data-type="monster" data-preset="orc">
                            <div class="preset-icon">👹</div>
                            <div class="preset-name">Orc</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                        <div class="preset-card" data-type="monster" data-preset="skeleton">
                            <div class="preset-icon">💀</div>
                            <div class="preset-name">Skeleton</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                    </div>
                </div>

                <div class="generate-section">
                    <h3>🗡️ Items</h3>
                    <div class="preset-grid">
                        <div class="preset-card" data-type="item" data-preset="sword">
                            <div class="preset-icon">⚔️</div>
                            <div class="preset-name">Sword</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                        <div class="preset-card" data-type="item" data-preset="shield">
                            <div class="preset-icon">🛡️</div>
                            <div class="preset-name">Shield</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                        <div class="preset-card" data-type="item" data-preset="potion">
                            <div class="preset-icon">🧪</div>
                            <div class="preset-name">Potion</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                    </div>
                </div>

                <div class="generate-section">
                    <h3>🌍 Tiles</h3>
                    <div class="preset-grid">
                        <div class="preset-card" data-type="tile" data-preset="grass">
                            <div class="preset-icon">🌱</div>
                            <div class="preset-name">Grass</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                        <div class="preset-card" data-type="tile" data-preset="stone">
                            <div class="preset-icon">🪨</div>
                            <div class="preset-name">Stone</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                        <div class="preset-card" data-type="tile" data-preset="water">
                            <div class="preset-icon">🌊</div>
                            <div class="preset-name">Water</div>
                            <button class="generate-btn">Generate</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get asset packs HTML
     */
    getAssetPacksHTML() {
        return `
            <div class="asset-packs">
                <div class="pack-section">
                    <h3>🎭 Character Sets</h3>
                    <div class="pack-grid">
                        <div class="pack-card" data-pack="character-set">
                            <div class="pack-icon">👥</div>
                            <div class="pack-info">
                                <h4>Complete Character Set</h4>
                                <p>Warrior, Mage, Rogue, Cleric - Male & Female variants</p>
                                <span class="pack-count">8 assets</span>
                            </div>
                            <button class="generate-pack-btn">Generate Pack</button>
                        </div>
                    </div>
                </div>

                <div class="pack-section">
                    <h3>👹 Monster Packs</h3>
                    <div class="pack-grid">
                        <div class="pack-card" data-pack="monster-pack">
                            <div class="pack-icon">🐉</div>
                            <div class="pack-info">
                                <h4>Monster Collection</h4>
                                <p>Goblin, Orc, Skeleton, Slime - Multiple sizes</p>
                                <span class="pack-count">8 assets</span>
                            </div>
                            <button class="generate-pack-btn">Generate Pack</button>
                        </div>
                    </div>
                </div>

                <div class="pack-section">
                    <h3>🗡️ Item Collections</h3>
                    <div class="pack-grid">
                        <div class="pack-card" data-pack="item-collection">
                            <div class="pack-icon">🎒</div>
                            <div class="pack-info">
                                <h4>Equipment Set</h4>
                                <p>Weapons, Armor, Consumables - All rarities</p>
                                <span class="pack-count">15 assets</span>
                            </div>
                            <button class="generate-pack-btn">Generate Pack</button>
                        </div>
                    </div>
                </div>

                <div class="pack-section">
                    <h3>🌍 Tile Sets</h3>
                    <div class="pack-grid">
                        <div class="pack-card" data-pack="tile-set">
                            <div class="pack-icon">🏞️</div>
                            <div class="pack-info">
                                <h4>Environment Tiles</h4>
                                <p>Grass, Stone, Water, Wood - Multiple biomes</p>
                                <span class="pack-count">20 assets</span>
                            </div>
                            <button class="generate-pack-btn">Generate Pack</button>
                        </div>
                    </div>
                </div>

                <div class="pack-section">
                    <h3>🏠 Environment Packs</h3>
                    <div class="pack-grid">
                        <div class="pack-card" data-pack="environment-pack">
                            <div class="pack-icon">🌳</div>
                            <div class="pack-info">
                                <h4>World Elements</h4>
                                <p>Trees, Rocks, Buildings, Decorations</p>
                                <span class="pack-count">12 assets</span>
                            </div>
                            <button class="generate-pack-btn">Generate Pack</button>
                        </div>
                    </div>
                </div>

                <div class="pack-section">
                    <h3>🎨 UI Packs</h3>
                    <div class="pack-grid">
                        <div class="pack-card" data-pack="ui-pack">
                            <div class="pack-icon">🖼️</div>
                            <div class="pack-info">
                                <h4>Interface Elements</h4>
                                <p>Buttons, Panels, Icons, Progress Bars</p>
                                <span class="pack-count">10 assets</span>
                            </div>
                            <button class="generate-pack-btn">Generate Pack</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get my assets HTML
     */
    getMyAssetsHTML() {
        return `
            <div class="my-assets">
                <div class="assets-toolbar">
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="characters">Characters</button>
                        <button class="filter-btn" data-filter="monsters">Monsters</button>
                        <button class="filter-btn" data-filter="items">Items</button>
                        <button class="filter-btn" data-filter="tiles">Tiles</button>
                        <button class="filter-btn" data-filter="environments">Environments</button>
                    </div>
                    <div class="search-box">
                        <input type="text" id="asset-search" placeholder="Search assets...">
                    </div>
                </div>

                <div id="assets-grid" class="assets-grid">
                    <div class="no-assets">
                        <p>No assets yet. Generate some assets to get started!</p>
                        <button class="btn btn-primary" onclick="switchView('quick-generate')">Generate Assets</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get export HTML
     */
    getExportHTML() {
        return `
            <div class="export">
                <div class="export-options">
                    <h3>Export for Game Engine</h3>
                    <div class="engine-grid">
                        <div class="engine-card" data-engine="unity">
                            <div class="engine-icon">🎮</div>
                            <div class="engine-info">
                                <h4>Unity</h4>
                                <p>Export with .meta files for Unity projects</p>
                            </div>
                            <button class="export-btn">Export</button>
                        </div>
                        <div class="engine-card" data-engine="godot">
                            <div class="engine-icon">🚀</div>
                            <div class="engine-info">
                                <h4>Godot</h4>
                                <p>Export with resource files for Godot projects</p>
                            </div>
                            <button class="export-btn">Export</button>
                        </div>
                        <div class="engine-card" data-engine="gamemaker">
                            <div class="engine-icon">🎯</div>
                            <div class="engine-info">
                                <h4>GameMaker Studio</h4>
                                <p>Export sprites for GameMaker projects</p>
                            </div>
                            <button class="export-btn">Export</button>
                        </div>
                        <div class="engine-card" data-engine="phaser">
                            <div class="engine-icon">🌐</div>
                            <div class="engine-info">
                                <h4>Phaser.js</h4>
                                <p>Export with JavaScript loader for web games</p>
                            </div>
                            <button class="export-btn">Export</button>
                        </div>
                        <div class="engine-card" data-engine="generic">
                            <div class="engine-icon">📁</div>
                            <div class="engine-info">
                                <h4>Generic</h4>
                                <p>Export as PNG files with JSON manifest</p>
                            </div>
                            <button class="export-btn">Export</button>
                        </div>
                    </div>
                </div>

                <div class="export-history">
                    <h3>Export History</h3>
                    <div id="export-history-list" class="export-history-list">
                        <p class="no-exports">No exports yet</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Navigation
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-btn')) {
                this.switchView(e.target.dataset.view);
            }
        });

        // Project management
        this.container.addEventListener('click', (e) => {
            if (e.target.id === 'new-project-btn') {
                this.createNewProject();
            } else if (e.target.id === 'load-project-btn') {
                this.loadExistingProject();
            }
        });

        // Quick actions
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                this.handleQuickAction(e.target.dataset.action);
            }
        });

        // Quick generate
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('generate-btn')) {
                const card = e.target.closest('.preset-card');
                if (card) {
                    this.generateFromPreset(card.dataset.type, card.dataset.preset);
                }
            }
        });

        // Asset packs
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('generate-pack-btn')) {
                const card = e.target.closest('.pack-card');
                if (card) {
                    this.generateAssetPack(card.dataset.pack);
                }
            }
        });

        // Export
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-btn')) {
                const card = e.target.closest('.engine-card');
                if (card) {
                    this.exportForEngine(card.dataset.engine);
                }
            }
        });

        // Asset filters
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.filterAssets(e.target.dataset.filter);
            }
        });

        // Asset search
        const searchInput = this.container.querySelector('#asset-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchAssets(e.target.value);
            });
        }
    }

    /**
     * Switch view
     */
    switchView(viewName) {
        // Update navigation
        this.container.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update content
        this.container.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}-view`);
        });

        this.currentView = viewName;

        // Update specific view content
        if (viewName === 'my-assets') {
            this.refreshAssetsView();
        }
    }

    /**
     * Create new project
     */
    async createNewProject() {
        const projectName = prompt('Enter project name:', 'My Game Assets');
        if (!projectName) return;

        const gameType = prompt('Game type (action-rpg, platformer, etc.):', 'action-rpg');
        if (!gameType) return;

        try {
            this.setStatus('Creating project...');
            const project = await this.workflowManager.createProject({
                name: projectName,
                gameType: gameType
            });

            this.updateProjectInfo(project);
            this.addActivity(`Created project: ${projectName}`);
            this.setStatus('Project created successfully');

        } catch (error) {
            console.error('Failed to create project:', error);
            this.setStatus('Failed to create project');
        }
    }

    /**
     * Load existing project
     */
    async loadExistingProject() {
        // In a real implementation, this would show a file picker
        // For now, we'll use a simple prompt
        const projectId = prompt('Enter project ID:');
        if (!projectId) return;

        try {
            this.setStatus('Loading project...');
            const project = await this.workflowManager.loadProject(projectId);

            this.updateProjectInfo(project);
            this.addActivity(`Loaded project: ${project.name}`);
            this.setStatus('Project loaded successfully');

        } catch (error) {
            console.error('Failed to load project:', error);
            this.setStatus('Failed to load project');
        }
    }

    /**
     * Handle quick actions
     */
    async handleQuickAction(action) {
        if (!this.workflowManager.currentProject) {
            alert('Please create or load a project first');
            return;
        }

        switch (action) {
            case 'generate-hero':
                await this.generateFromPreset('character', 'warrior');
                break;
            case 'generate-monsters':
                await this.generateAssetPack('monster-pack');
                break;
            case 'generate-items':
                await this.generateAssetPack('item-collection');
                break;
            case 'generate-tiles':
                await this.generateAssetPack('tile-set');
                break;
            case 'create-level':
                // This would integrate with level generator
                alert('Level creation coming soon!');
                break;
            case 'export-project':
                this.switchView('export');
                break;
        }
    }

    /**
     * Generate asset from preset
     */
    async generateFromPreset(assetType, presetName) {
        try {
            this.setStatus(`Generating ${assetType}...`);
            this.setProgress(0);

            const asset = await this.workflowManager.generateQuickAsset(assetType, presetName);

            this.setProgress(100);
            this.addActivity(`Generated ${asset.name}`);
            this.setStatus(`Generated ${asset.name}`);
            this.updateStats();

        } catch (error) {
            console.error('Failed to generate asset:', error);
            this.setStatus('Failed to generate asset');
        }
    }

    /**
     * Generate asset pack
     */
    async generateAssetPack(packType) {
        try {
            this.setStatus(`Generating ${packType}...`);
            this.setProgress(0);

            const assets = await this.workflowManager.generateAssetPack(packType);

            this.setProgress(100);
            this.addActivity(`Generated ${packType} (${assets.length} assets)`);
            this.setStatus(`Generated ${assets.length} assets`);
            this.updateStats();

        } catch (error) {
            console.error('Failed to generate asset pack:', error);
            this.setStatus('Failed to generate asset pack');
        }
    }

    /**
     * Export for game engine
     */
    async exportForEngine(engine) {
        try {
            this.setStatus(`Exporting for ${engine}...`);
            this.setProgress(0);

            const result = await this.workflowManager.exportForGameEngine(engine);

            this.setProgress(100);
            this.addActivity(`Exported ${result.exportedAssets} assets for ${engine}`);
            this.setStatus(`Exported ${result.exportedAssets} assets`);
            this.addExportHistory(result);

        } catch (error) {
            console.error('Failed to export:', error);
            this.setStatus('Failed to export');
        }
    }

    /**
     * Update project info display
     */
    updateProjectInfo(project) {
        const projectNameEl = this.container.querySelector('#project-name');
        if (projectNameEl) {
            projectNameEl.textContent = project.name;
        }
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const stats = this.workflowManager.getProjectStats();
        if (!stats) return;

        // Update stat cards
        Object.entries(stats.assetsByCategory).forEach(([category, count]) => {
            const element = this.container.querySelector(`#${category}-count`);
            if (element) {
                element.textContent = count;
            }
        });

        const totalEl = this.container.querySelector('#total-assets');
        if (totalEl) {
            totalEl.textContent = stats.totalAssets;
        }

        const assetCountEl = this.container.querySelector('#asset-count');
        if (assetCountEl) {
            assetCountEl.textContent = `${stats.totalAssets} assets`;
        }
    }

    /**
     * Refresh assets view
     */
    refreshAssetsView() {
        const assetsGrid = this.container.querySelector('#assets-grid');
        if (!assetsGrid) return;

        const assets = [];
        for (const [category, categoryAssets] of Object.entries(this.workflowManager.assetCategories)) {
            assets.push(...categoryAssets.map(asset => ({ ...asset, category })));
        }

        if (assets.length === 0) return;

        const html = assets.map(asset => `
            <div class="asset-card" data-category="${asset.category}" data-id="${asset.id}">
                <div class="asset-preview">
                    <img src="data:image/png;base64,${asset.sprite.data}" alt="${asset.name}">
                </div>
                <div class="asset-info">
                    <h4>${asset.name}</h4>
                    <span class="asset-category">${asset.category}</span>
                </div>
                <div class="asset-actions">
                    <button class="asset-action-btn" data-action="view">👁️</button>
                    <button class="asset-action-btn" data-action="edit">✏️</button>
                    <button class="asset-action-btn" data-action="delete">🗑️</button>
                </div>
            </div>
        `).join('');

        assetsGrid.innerHTML = html;
    }

    /**
     * Filter assets
     */
    filterAssets(filter) {
        const cards = this.container.querySelectorAll('.asset-card');
        const filterBtns = this.container.querySelectorAll('.filter-btn');

        // Update active filter button
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Filter cards
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Search assets
     */
    searchAssets(query) {
        const cards = this.container.querySelectorAll('.asset-card');

        cards.forEach(card => {
            const name = card.querySelector('h4').textContent.toLowerCase();
            const category = card.dataset.category.toLowerCase();

            if (name.includes(query.toLowerCase()) || category.includes(query.toLowerCase())) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Add activity to log
     */
    addActivity(activity) {
        const activityList = this.container.querySelector('#activity-list');
        if (!activityList) return;

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-time">${new Date().toLocaleTimeString()}</span>
            <span class="activity-text">${activity}</span>
        `;

        // Remove "no activity" message if present
        const noActivity = activityList.querySelector('.no-activity');
        if (noActivity) {
            noActivity.remove();
        }

        // Add new activity at top
        activityList.insertBefore(activityItem, activityList.firstChild);

        // Keep only recent activities
        const items = activityList.querySelectorAll('.activity-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
    }

    /**
     * Add export to history
     */
    addExportHistory(result) {
        const historyList = this.container.querySelector('#export-history-list');
        if (!historyList) return;

        const historyItem = document.createElement('div');
        historyItem.className = 'export-history-item';
        historyItem.innerHTML = `
            <div class="export-info">
                <span class="export-engine">${result.engine}</span>
                <span class="export-count">${result.exportedAssets} assets</span>
                <span class="export-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="export-actions">
                <button class="open-folder-btn" data-path="${result.exportPath}">📁 Open Folder</button>
            </div>
        `;

        // Remove "no exports" message if present
        const noExports = historyList.querySelector('.no-exports');
        if (noExports) {
            noExports.remove();
        }

        // Add new export at top
        historyList.insertBefore(historyItem, historyList.firstChild);
    }

    /**
     * Set status text
     */
    setStatus(text) {
        const statusEl = this.container.querySelector('#status-text');
        if (statusEl) {
            statusEl.textContent = text;
        }
    }

    /**
     * Set progress bar
     */
    setProgress(percent) {
        const progressBar = this.container.querySelector('#progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    }

    /**
     * Get current project
     */
    getCurrentProject() {
        return this.workflowManager.currentProject;
    }

    /**
     * Get workflow manager
     */
    getWorkflowManager() {
        return this.workflowManager;
    }
}

module.exports = SoloDeveloperInterface;
