/**
 * TPT Interface Manager
 * Manages UI modes, tutorials, and user experience enhancements
 */

const fs = require('fs').promises;
const path = require('path');

class InterfaceManager {
    constructor() {
        this.currentMode = 'beginner'; // 'beginner' or 'advanced'
        this.userPreferences = {};
        this.tutorialState = {};
        this.shortcuts = {};
        this.tooltips = {};
    }

    /**
     * Initialize interface manager
     */
    async initialize() {
        await this.loadUserPreferences();
        await this.loadTutorialState();
        this.setupKeyboardShortcuts();
        this.initializeTooltips();
        this.applyCurrentMode();
    }

    /**
     * Load user preferences
     */
    async loadUserPreferences() {
        try {
            const prefsPath = path.join(process.cwd(), 'user-preferences.json');
            const prefsData = await fs.readFile(prefsPath, 'utf8');
            this.userPreferences = JSON.parse(prefsData);
        } catch (error) {
            // Use default preferences
            this.userPreferences = {
                mode: 'beginner',
                theme: 'light',
                showTooltips: true,
                autoSave: true,
                previewQuality: 'medium'
            };
        }
        this.currentMode = this.userPreferences.mode || 'beginner';
    }

    /**
     * Save user preferences
     */
    async saveUserPreferences() {
        try {
            const prefsPath = path.join(process.cwd(), 'user-preferences.json');
            await fs.writeFile(prefsPath, JSON.stringify(this.userPreferences, null, 2));
        } catch (error) {
            console.error('Failed to save user preferences:', error);
        }
    }

    /**
     * Load tutorial completion state
     */
    async loadTutorialState() {
        try {
            const tutorialPath = path.join(process.cwd(), 'tutorial-state.json');
            const tutorialData = await fs.readFile(tutorialPath, 'utf8');
            this.tutorialState = JSON.parse(tutorialData);
        } catch (error) {
            // Initialize tutorial state
            this.tutorialState = {
                completedTutorials: [],
                currentTutorial: null,
                showHints: true
            };
        }
    }

    /**
     * Save tutorial state
     */
    async saveTutorialState() {
        try {
            const tutorialPath = path.join(process.cwd(), 'tutorial-state.json');
            await fs.writeFile(tutorialPath, JSON.stringify(this.tutorialState, null, 2));
        } catch (error) {
            console.error('Failed to save tutorial state:', error);
        }
    }

    /**
     * Switch between beginner and advanced modes
     */
    async switchMode(newMode) {
        if (newMode !== 'beginner' && newMode !== 'advanced') {
            throw new Error('Invalid mode. Must be "beginner" or "advanced"');
        }

        this.currentMode = newMode;
        this.userPreferences.mode = newMode;
        await this.saveUserPreferences();
        this.applyCurrentMode();

        // Emit mode change event
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.send('mode-changed', { mode: newMode });
        }

        return { success: true, mode: newMode };
    }

    /**
     * Apply current mode settings to UI
     */
    applyCurrentMode() {
        const isBeginner = this.currentMode === 'beginner';

        // Update UI elements based on mode
        this.updateGeneratorVisibility(isBeginner);
        this.updateParameterComplexity(isBeginner);
        this.updateHelpSystem(isBeginner);
        this.updateLayout(isBeginner);
    }

    /**
     * Update generator visibility based on mode
     */
    updateGeneratorVisibility(isBeginner) {
        if (isBeginner) {
            // Show only essential generators for beginners
            this.showEssentialGenerators();
            this.hideAdvancedGenerators();
        } else {
            // Show all generators for advanced users
            this.showAllGenerators();
        }
    }

    /**
     * Update parameter complexity
     */
    updateParameterComplexity(isBeginner) {
        const parameterElements = document.querySelectorAll('.parameter-control');

        parameterElements.forEach(element => {
            const isAdvanced = element.classList.contains('advanced-parameter');

            if (isBeginner && isAdvanced) {
                element.style.display = 'none';
            } else {
                element.style.display = 'block';
            }
        });
    }

    /**
     * Update help system
     */
    updateHelpSystem(isBeginner) {
        const helpElements = document.querySelectorAll('.help-tooltip');

        helpElements.forEach(element => {
            if (isBeginner) {
                element.style.display = 'inline-block';
            } else {
                element.style.display = this.userPreferences.showTooltips ? 'inline-block' : 'none';
            }
        });
    }

    /**
     * Update layout for current mode
     */
    updateLayout(isBeginner) {
        const body = document.body;

        if (isBeginner) {
            body.classList.add('beginner-mode');
            body.classList.remove('advanced-mode');
        } else {
            body.classList.add('advanced-mode');
            body.classList.remove('beginner-mode');
        }
    }

    /**
     * Show only essential generators for beginners
     */
    showEssentialGenerators() {
        const essentialGenerators = [
            'character-generator',
            'monster-generator',
            'item-generator',
            'building-generator',
            'landscape-generator',
            'level-generator'
        ];

        // Hide all generators first
        document.querySelectorAll('.generator-item').forEach(item => {
            item.style.display = 'none';
        });

        // Show essential generators
        essentialGenerators.forEach(generatorId => {
            const generator = document.getElementById(generatorId);
            if (generator) {
                generator.style.display = 'block';
                generator.classList.add('essential-generator');
            }
        });
    }

    /**
     * Hide advanced generators
     */
    hideAdvancedGenerators() {
        const advancedGenerators = [
            'spell-effect-generator',
            'aura-generator',
            'buff-icon-generator',
            'debuff-icon-generator',
            'health-bar-generator',
            'rune-generator',
            'scroll-generator',
            'coin-generator',
            'gem-generator'
        ];

        advancedGenerators.forEach(generatorId => {
            const generator = document.getElementById(generatorId);
            if (generator) {
                generator.style.display = 'none';
            }
        });
    }

    /**
     * Show all generators for advanced users
     */
    showAllGenerators() {
        document.querySelectorAll('.generator-item').forEach(item => {
            item.style.display = 'block';
            item.classList.remove('essential-generator');
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        this.shortcuts = {
            'ctrl+b': () => this.switchMode('beginner'),
            'ctrl+a': () => this.switchMode('advanced'),
            'ctrl+h': () => this.toggleHelp(),
            'ctrl+s': () => this.quickSave(),
            'f1': () => this.showTutorial(),
            'ctrl+z': () => this.undoLastAction()
        };

        document.addEventListener('keydown', (event) => {
            const key = this.getKeyCombination(event);
            const shortcut = this.shortcuts[key];

            if (shortcut) {
                event.preventDefault();
                shortcut();
            }
        });
    }

    /**
     * Get key combination string
     */
    getKeyCombination(event) {
        const parts = [];
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        parts.push(event.key.toLowerCase());
        return parts.join('+');
    }

    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        this.tooltips = {
            'character-generator': 'Create player characters and NPCs with various classes and equipment',
            'monster-generator': 'Generate enemies and creatures for your game world',
            'level-generator': 'Create complete game levels with terrain, structures, and entities',
            'batch-generator': 'Generate multiple assets at once with consistent styling',
            'export-button': 'Export your generated assets in various formats'
        };

        // Create tooltip elements
        Object.keys(this.tooltips).forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                this.createTooltip(element, this.tooltips[elementId]);
            }
        });
    }

    /**
     * Create tooltip for element
     */
    createTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'help-tooltip';
        tooltip.textContent = '?';
        tooltip.title = text;

        // Position tooltip
        tooltip.style.position = 'absolute';
        tooltip.style.top = '-5px';
        tooltip.style.right = '-5px';
        tooltip.style.width = '16px';
        tooltip.style.height = '16px';
        tooltip.style.borderRadius = '50%';
        tooltip.style.backgroundColor = '#4A90E2';
        tooltip.style.color = 'white';
        tooltip.style.fontSize = '12px';
        tooltip.style.fontWeight = 'bold';
        tooltip.style.display = 'flex';
        tooltip.style.alignItems = 'center';
        tooltip.style.justifyContent = 'center';
        tooltip.style.cursor = 'help';
        tooltip.style.zIndex = '1000';

        element.style.position = 'relative';
        element.appendChild(tooltip);
    }

    /**
     * Toggle help system
     */
    toggleHelp() {
        this.userPreferences.showTooltips = !this.userPreferences.showTooltips;
        this.saveUserPreferences();
        this.updateHelpSystem(this.currentMode === 'beginner');
    }

    /**
     * Quick save current work
     */
    quickSave() {
        // Emit save event
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.send('quick-save');
        }
    }

    /**
     * Show tutorial
     */
    showTutorial(tutorialId = null) {
        if (tutorialId) {
            this.startTutorial(tutorialId);
        } else {
            this.showTutorialMenu();
        }
    }

    /**
     * Start specific tutorial
     */
    startTutorial(tutorialId) {
        this.tutorialState.currentTutorial = tutorialId;

        // Load tutorial content
        const tutorialContent = this.getTutorialContent(tutorialId);
        this.displayTutorial(tutorialContent);
    }

    /**
     * Show tutorial menu
     */
    showTutorialMenu() {
        const tutorials = [
            { id: 'getting-started', title: 'Getting Started', description: 'Basic introduction to TPT Asset Editor' },
            { id: 'sprite-basics', title: 'Sprite Generation', description: 'Learn to create characters, items, and environments' },
            { id: 'level-design', title: 'Level Creation', description: 'Build complete game worlds' },
            { id: 'batch-processing', title: 'Batch Operations', description: 'Efficiently generate multiple assets' },
            { id: 'advanced-features', title: 'Advanced Features', description: 'Unlock the full power of the editor' }
        ];

        this.displayTutorialMenu(tutorials);
    }

    /**
     * Get tutorial content
     */
    getTutorialContent(tutorialId) {
        const tutorialFiles = {
            'getting-started': 'docs/tutorials/getting-started.md',
            'sprite-basics': 'docs/tutorials/sprite-generation-basics.md',
            'level-design': 'docs/tutorials/level-design.md',
            'batch-processing': 'docs/tutorials/batch-processing.md',
            'advanced-features': 'docs/tutorials/advanced-features.md'
        };

        const filePath = tutorialFiles[tutorialId];
        if (filePath) {
            try {
                return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
            } catch (error) {
                return `# Tutorial Not Found\n\nThe tutorial "${tutorialId}" could not be loaded.`;
            }
        }

        return '# Tutorial Not Available\n\nThis tutorial is not yet available.';
    }

    /**
     * Display tutorial content
     */
    displayTutorial(content) {
        // Create tutorial overlay
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-modal">
                <div class="tutorial-header">
                    <h2>Tutorial</h2>
                    <button class="tutorial-close">&times;</button>
                </div>
                <div class="tutorial-content">
                    ${this.markdownToHtml(content)}
                </div>
                <div class="tutorial-footer">
                    <button class="tutorial-prev">Previous</button>
                    <button class="tutorial-next">Next</button>
                    <button class="tutorial-complete">Mark Complete</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add event listeners
        overlay.querySelector('.tutorial-close').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelector('.tutorial-complete').addEventListener('click', () => {
            this.markTutorialComplete(this.tutorialState.currentTutorial);
            overlay.remove();
        });
    }

    /**
     * Display tutorial menu
     */
    displayTutorialMenu(tutorials) {
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-modal tutorial-menu">
                <div class="tutorial-header">
                    <h2>Choose a Tutorial</h2>
                    <button class="tutorial-close">&times;</button>
                </div>
                <div class="tutorial-list">
                    ${tutorials.map(tutorial => `
                        <div class="tutorial-item" data-tutorial="${tutorial.id}">
                            <h3>${tutorial.title}</h3>
                            <p>${tutorial.description}</p>
                            ${this.tutorialState.completedTutorials.includes(tutorial.id) ?
                                '<span class="tutorial-completed">✓ Completed</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add event listeners
        overlay.querySelector('.tutorial-close').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelectorAll('.tutorial-item').forEach(item => {
            item.addEventListener('click', () => {
                const tutorialId = item.dataset.tutorial;
                overlay.remove();
                this.startTutorial(tutorialId);
            });
        });
    }

    /**
     * Mark tutorial as complete
     */
    markTutorialComplete(tutorialId) {
        if (!this.tutorialState.completedTutorials.includes(tutorialId)) {
            this.tutorialState.completedTutorials.push(tutorialId);
            this.saveTutorialState();
        }
    }

    /**
     * Convert markdown to HTML (simple implementation)
     */
    markdownToHtml(markdown) {
        return markdown
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Undo last action
     */
    undoLastAction() {
        // Emit undo event
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.send('undo-action');
        }
    }

    /**
     * Get current mode
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Get user preferences
     */
    getUserPreferences() {
        return { ...this.userPreferences };
    }

    /**
     * Update user preference
     */
    async updateUserPreference(key, value) {
        this.userPreferences[key] = value;
        await this.saveUserPreferences();
    }

    /**
     * Reset to default settings
     */
    async resetToDefaults() {
        this.userPreferences = {
            mode: 'beginner',
            theme: 'light',
            showTooltips: true,
            autoSave: true,
            previewQuality: 'medium'
        };
        this.currentMode = 'beginner';
        await this.saveUserPreferences();
        this.applyCurrentMode();
    }
}

module.exports = InterfaceManager;
