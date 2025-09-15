/**
 * Preferences UI Component
 * Handles user preferences interface with beginner/advanced mode switching
 */

const UserPreferences = require('../core/user-preferences');

class PreferencesUI {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.preferences = options.preferences || new UserPreferences();
        this.isVisible = false;

        this.currentUI = null;
        this.eventListeners = new Map();

        this.init();
    }

    /**
     * Initialize the preferences UI
     */
    async init() {
        await this.preferences.init();
        this.createUI();
        this.setupEventListeners();
        this.applyCurrentPreferences();

        console.log('Preferences UI initialized');
    }

    /**
     * Create the preferences UI structure
     */
    createUI() {
        // Main preferences container
        this.currentUI = document.createElement('div');
        this.currentUI.id = 'preferences-ui';
        this.currentUI.className = 'preferences-overlay';
        this.currentUI.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Preferences panel
        const panel = document.createElement('div');
        panel.className = 'preferences-panel';
        panel.style.cssText = `
            background: var(--bg-color, #ffffff);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;

        // Header
        const header = this.createHeader();
        panel.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.className = 'preferences-content';
        content.style.cssText = `
            padding: 24px;
        `;

        // Experience level selector
        const experienceSection = this.createExperienceLevelSection();
        content.appendChild(experienceSection);

        // UI preferences
        const uiSection = this.createUISection();
        content.appendChild(uiSection);

        // Performance preferences
        const performanceSection = this.createPerformanceSection();
        content.appendChild(performanceSection);

        // Generator preferences
        const generatorSection = this.createGeneratorSection();
        content.appendChild(generatorSection);

        // Feature gating preferences
        const featureGatingSection = this.createFeatureGatingSection();
        content.appendChild(featureGatingSection);

        // Privacy preferences
        const privacySection = this.createPrivacySection();
        content.appendChild(privacySection);

        panel.appendChild(content);

        // Footer with save/reset buttons
        const footer = this.createFooter();
        panel.appendChild(footer);

        this.currentUI.appendChild(panel);
        this.container.appendChild(this.currentUI);
    }

    /**
     * Create header section
     */
    createHeader() {
        const header = document.createElement('div');
        header.className = 'preferences-header';
        header.style.cssText = `
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color, #e1e5e9);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Preferences';
        title.style.cssText = `
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.className = 'close-button';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: var(--text-color, #666);
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
        `;

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'var(--hover-color, #f0f0f0)';
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'none';
        });

        closeButton.addEventListener('click', () => this.hide());

        header.appendChild(title);
        header.appendChild(closeButton);

        return header;
    }

    /**
     * Create experience level section
     */
    createExperienceLevelSection() {
        const section = document.createElement('div');
        section.className = 'preferences-section';
        section.style.cssText = `
            margin-bottom: 32px;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Experience Level';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        const description = document.createElement('p');
        description.textContent = 'Choose your experience level to customize the interface and features.';
        description.style.cssText = `
            margin: 0 0 20px 0;
            color: var(--text-secondary, #666);
            font-size: 14px;
            line-height: 1.5;
        `;

        const levelSelector = document.createElement('div');
        levelSelector.className = 'experience-level-selector';
        levelSelector.style.cssText = `
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        `;

        const levels = [
            {
                id: 'beginner',
                title: 'Beginner',
                description: 'Simplified interface with guided tutorials',
                icon: '👶'
            },
            {
                id: 'intermediate',
                title: 'Intermediate',
                description: 'Balanced interface with helpful tooltips',
                icon: '👤'
            },
            {
                id: 'advanced',
                title: 'Advanced',
                description: 'Full interface with all features and options',
                icon: '🚀'
            }
        ];

        levels.forEach(level => {
            const card = this.createExperienceLevelCard(level);
            levelSelector.appendChild(card);
        });

        section.appendChild(title);
        section.appendChild(description);
        section.appendChild(levelSelector);

        return section;
    }

    /**
     * Create experience level card
     */
    createExperienceLevelCard(level) {
        const card = document.createElement('div');
        card.className = `experience-level-card ${level.id}`;
        card.dataset.level = level.id;

        const isSelected = this.preferences.get('experienceLevel') === level.id;
        card.style.cssText = `
            flex: 1;
            min-width: 160px;
            padding: 20px;
            border: 2px solid ${isSelected ? 'var(--primary-color, #007bff)' : 'var(--border-color, #e1e5e9)'};
            border-radius: 8px;
            cursor: pointer;
            background: ${isSelected ? 'var(--primary-light, #e7f3ff)' : 'var(--bg-color, #ffffff)'};
            transition: all 0.2s ease;
        `;

        card.addEventListener('mouseenter', () => {
            if (!isSelected) {
                card.style.borderColor = 'var(--primary-color, #007bff)';
                card.style.background = 'var(--hover-color, #f8f9fa)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (!isSelected) {
                card.style.borderColor = 'var(--border-color, #e1e5e9)';
                card.style.background = 'var(--bg-color, #ffffff)';
            }
        });

        card.addEventListener('click', () => {
            this.selectExperienceLevel(level.id);
        });

        const icon = document.createElement('div');
        icon.textContent = level.icon;
        icon.style.cssText = `
            font-size: 32px;
            margin-bottom: 12px;
            text-align: center;
        `;

        const title = document.createElement('h4');
        title.textContent = level.title;
        title.style.cssText = `
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
            text-align: center;
        `;

        const description = document.createElement('p');
        description.textContent = level.description;
        description.style.cssText = `
            margin: 0;
            font-size: 12px;
            color: var(--text-secondary, #666);
            text-align: center;
            line-height: 1.4;
        `;

        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(description);

        return card;
    }

    /**
     * Create UI preferences section
     */
    createUISection() {
        const section = document.createElement('div');
        section.className = 'preferences-section';
        section.style.cssText = `
            margin-bottom: 32px;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Interface';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        // Theme selector
        const themeGroup = this.createPreferenceGroup('Theme', 'theme-selector');
        const themeSelect = this.createSelect('theme', ['system', 'light', 'dark'], this.preferences.get('theme'));
        themeGroup.appendChild(themeSelect);
        section.appendChild(themeGroup);

        // Font size
        const fontSizeGroup = this.createPreferenceGroup('Font Size', 'font-size-selector');
        const fontSizeSelect = this.createSelect('fontSize', ['small', 'medium', 'large'], this.preferences.get('fontSize'));
        fontSizeGroup.appendChild(fontSizeSelect);
        section.appendChild(fontSizeGroup);

        // Other UI toggles
        const toggles = [
            { key: 'highContrast', label: 'High Contrast Mode' },
            { key: 'animations', label: 'Enable Animations' },
            { key: 'compactMode', label: 'Compact Mode' },
            { key: 'showTooltips', label: 'Show Tooltips' }
        ];

        toggles.forEach(toggle => {
            const toggleElement = this.createToggle(toggle.key, toggle.label, this.preferences.get(toggle.key));
            section.appendChild(toggleElement);
        });

        return section;
    }

    /**
     * Create performance preferences section
     */
    createPerformanceSection() {
        const section = document.createElement('div');
        section.className = 'preferences-section';
        section.style.cssText = `
            margin-bottom: 32px;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Performance';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        // Max concurrent operations
        const concurrencyGroup = this.createPreferenceGroup('Max Concurrent Operations', 'concurrency-selector');
        const concurrencySelect = this.createSelect('maxConcurrentOperations', ['1', '2', '4', '8', '16'], this.preferences.get('maxConcurrentOperations'));
        concurrencyGroup.appendChild(concurrencySelect);
        section.appendChild(concurrencyGroup);

        // Memory limit
        const memoryGroup = this.createPreferenceGroup('Memory Limit (MB)', 'memory-selector');
        const memorySelect = this.createSelect('memoryLimit', ['256', '512', '1024', '2048'], this.preferences.get('memoryLimit'));
        memoryGroup.appendChild(memorySelect);
        section.appendChild(memoryGroup);

        // Performance toggles
        const performanceToggles = [
            { key: 'enableGpuAcceleration', label: 'Enable GPU Acceleration' },
            { key: 'enableBackgroundProcessing', label: 'Enable Background Processing' },
            { key: 'autoSave', label: 'Auto-save Preferences' }
        ];

        performanceToggles.forEach(toggle => {
            const toggleElement = this.createToggle(toggle.key, toggle.label, this.preferences.get(toggle.key));
            section.appendChild(toggleElement);
        });

        return section;
    }

    /**
     * Create generator preferences section
     */
    createGeneratorSection() {
        const section = document.createElement('div');
        section.className = 'preferences-section';
        section.style.cssText = `
            margin-bottom: 32px;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Generators';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        // Export format
        const formatGroup = this.createPreferenceGroup('Default Export Format', 'export-format-selector');
        const formatSelect = this.createSelect('defaultExportFormat', ['png', 'jpg', 'webp', 'svg'], this.preferences.get('defaultExportFormat'));
        formatGroup.appendChild(formatSelect);
        section.appendChild(formatGroup);

        // Export quality
        const qualityGroup = this.createPreferenceGroup('Export Quality', 'export-quality-selector');
        const qualitySelect = this.createSelect('defaultExportQuality', ['70', '80', '90', '100'], this.preferences.get('defaultExportQuality'));
        qualityGroup.appendChild(qualitySelect);
        section.appendChild(qualityGroup);

        return section;
    }

    /**
     * Create feature gating preferences section
     */
    createFeatureGatingSection() {
        const section = document.createElement('div');
        section.className = 'preferences-section';
        section.style.cssText = `
            margin-bottom: 32px;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Feature Unlocking';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        const description = document.createElement('p');
        description.textContent = 'Control how features are unlocked as you use the application.';
        description.style.cssText = `
            margin: 0 0 20px 0;
            color: var(--text-secondary, #666);
            font-size: 14px;
            line-height: 1.5;
        `;

        const gatingToggle = this.createToggle('disableFeatureGating', 'Disable Feature Gating', this.preferences.get('disableFeatureGating'));
        section.appendChild(gatingToggle);

        const explanation = document.createElement('p');
        explanation.textContent = 'When enabled, all features will be available immediately without requiring progression milestones.';
        explanation.style.cssText = `
            margin: 8px 0 0 0;
            color: var(--text-secondary, #666);
            font-size: 12px;
            line-height: 1.4;
            font-style: italic;
        `;

        section.appendChild(explanation);

        return section;
    }

    /**
     * Create privacy preferences section
     */
    createPrivacySection() {
        const section = document.createElement('div');
        section.className = 'preferences-section';
        section.style.cssText = `
            margin-bottom: 32px;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Privacy & Analytics';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        const privacyToggles = [
            { key: 'enableAnalytics', label: 'Enable Usage Analytics' },
            { key: 'enableCrashReporting', label: 'Enable Crash Reporting' },
            { key: 'shareUsageData', label: 'Share Usage Data' },
            { key: 'enableNotifications', label: 'Enable Notifications' }
        ];

        privacyToggles.forEach(toggle => {
            const toggleElement = this.createToggle(toggle.key, toggle.label, this.preferences.get(toggle.key));
            section.appendChild(toggleElement);
        });

        return section;
    }

    /**
     * Create footer with action buttons
     */
    createFooter() {
        const footer = document.createElement('div');
        footer.className = 'preferences-footer';
        footer.style.cssText = `
            padding: 20px 24px;
            border-top: 1px solid var(--border-color, #e1e5e9);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const leftButtons = document.createElement('div');
        leftButtons.style.cssText = `
            display: flex;
            gap: 12px;
        `;

        const exportButton = this.createButton('Export', 'secondary', () => this.exportPreferences());
        const importButton = this.createButton('Import', 'secondary', () => this.importPreferences());

        leftButtons.appendChild(exportButton);
        leftButtons.appendChild(importButton);

        const rightButtons = document.createElement('div');
        rightButtons.style.cssText = `
            display: flex;
            gap: 12px;
        `;

        const resetButton = this.createButton('Reset All', 'danger', () => this.resetAllPreferences());
        const cancelButton = this.createButton('Cancel', 'secondary', () => this.hide());
        const saveButton = this.createButton('Save', 'primary', () => this.savePreferences());

        rightButtons.appendChild(resetButton);
        rightButtons.appendChild(cancelButton);
        rightButtons.appendChild(saveButton);

        footer.appendChild(leftButtons);
        footer.appendChild(rightButtons);

        return footer;
    }

    /**
     * Create preference group
     */
    createPreferenceGroup(label, className) {
        const group = document.createElement('div');
        group.className = `preference-group ${className}`;
        group.style.cssText = `
            margin-bottom: 16px;
        `;

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-color, #1a1a1a);
        `;

        group.appendChild(labelElement);
        return group;
    }

    /**
     * Create select element
     */
    createSelect(key, options, selectedValue) {
        const select = document.createElement('select');
        select.className = `preference-select ${key}`;
        select.dataset.preference = key;
        select.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border-color, #ced4da);
            border-radius: 4px;
            font-size: 14px;
            background: var(--bg-color, #ffffff);
            color: var(--text-color, #1a1a1a);
        `;

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
            if (option == selectedValue) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        select.addEventListener('change', (e) => {
            this.preferences.set(key, e.target.value);
        });

        return select;
    }

    /**
     * Create toggle element
     */
    createToggle(key, label, initialValue) {
        const container = document.createElement('div');
        container.className = `preference-toggle ${key}`;
        container.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        `;

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            font-weight: 500;
            color: var(--text-color, #1a1a1a);
            cursor: pointer;
        `;

        const toggle = document.createElement('div');
        toggle.className = 'toggle-switch';
        toggle.style.cssText = `
            position: relative;
            width: 44px;
            height: 24px;
            background: ${initialValue ? 'var(--primary-color, #007bff)' : 'var(--border-color, #ced4da)'};
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.2s ease;
        `;

        const toggleHandle = document.createElement('div');
        toggleHandle.className = 'toggle-handle';
        toggleHandle.style.cssText = `
            position: absolute;
            top: 2px;
            left: ${initialValue ? '22px' : '2px'};
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: left 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        `;

        const clickHandler = () => {
            const newValue = !this.preferences.get(key);
            this.preferences.set(key, newValue);

            toggle.style.background = newValue ? 'var(--primary-color, #007bff)' : 'var(--border-color, #ced4da)';
            toggleHandle.style.left = newValue ? '22px' : '2px';
        };

        labelElement.addEventListener('click', clickHandler);
        toggle.addEventListener('click', clickHandler);

        toggle.appendChild(toggleHandle);
        container.appendChild(labelElement);
        container.appendChild(toggle);

        return container;
    }

    /**
     * Create button element
     */
    createButton(text, variant, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `preference-button ${variant}`;
        button.style.cssText = `
            padding: 8px 16px;
            border: 1px solid ${variant === 'primary' ? 'var(--primary-color, #007bff)' : variant === 'danger' ? '#dc3545' : 'var(--border-color, #ced4da)'};
            border-radius: 4px;
            background: ${variant === 'primary' ? 'var(--primary-color, #007bff)' : variant === 'danger' ? '#dc3545' : 'var(--bg-color, #ffffff)'};
            color: ${variant === 'secondary' ? 'var(--text-color, #1a1a1a)' : 'white'};
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.opacity = '0.8';
        });

        button.addEventListener('mouseleave', () => {
            button.style.opacity = '1';
        });

        button.addEventListener('click', onClick);

        return button;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for preference changes
        this.preferences.on('experience-level-changed', ({ oldLevel, newLevel }) => {
            this.updateExperienceLevelUI(newLevel);
            this.emitUIUpdate();
        });

        this.preferences.on('changed', ({ key, oldValue, newValue }) => {
            this.updateUIForPreference(key, newValue);
        });
    }

    /**
     * Select experience level
     */
    selectExperienceLevel(level) {
        // Update UI immediately
        this.updateExperienceLevelUI(level);

        // Update preference
        this.preferences.setExperienceLevel(level);
    }

    /**
     * Update experience level UI
     */
    updateExperienceLevelUI(selectedLevel) {
        const cards = this.currentUI.querySelectorAll('.experience-level-card');

        cards.forEach(card => {
            const level = card.dataset.level;
            const isSelected = level === selectedLevel;

            card.style.borderColor = isSelected ? 'var(--primary-color, #007bff)' : 'var(--border-color, #e1e5e9)';
            card.style.background = isSelected ? 'var(--primary-light, #e7f3ff)' : 'var(--bg-color, #ffffff)';
        });
    }

    /**
     * Update UI for preference change
     */
    updateUIForPreference(key, value) {
        const element = this.currentUI.querySelector(`[data-preference="${key}"]`);
        if (element) {
            if (element.tagName === 'SELECT') {
                element.value = value;
            } else if (element.classList.contains('toggle-switch')) {
                const handle = element.querySelector('.toggle-handle');
                element.style.background = value ? 'var(--primary-color, #007bff)' : 'var(--border-color, #ced4da)';
                handle.style.left = value ? '22px' : '2px';
            }
        }
    }

    /**
     * Apply current preferences to UI
     */
    applyCurrentPreferences() {
        const uiConfig = this.preferences.getUIConfiguration();
        this.updateExperienceLevelUI(uiConfig.experienceLevel);

        // Update all form elements
        const selects = this.currentUI.querySelectorAll('select[data-preference]');
        selects.forEach(select => {
            const key = select.dataset.preference;
            const value = this.preferences.get(key);
            if (value !== undefined) {
                select.value = value;
            }
        });

        // Update all toggles
        const toggles = this.currentUI.querySelectorAll('.toggle-switch');
        toggles.forEach(toggle => {
            const container = toggle.closest('.preference-toggle');
            const key = container.className.split(' ').find(cls => cls !== 'preference-toggle');
            if (key) {
                const value = this.preferences.get(key);
                const handle = toggle.querySelector('.toggle-handle');
                toggle.style.background = value ? 'var(--primary-color, #007bff)' : 'var(--border-color, #ced4da)';
                handle.style.left = value ? '22px' : '2px';
            }
        });
    }

    /**
     * Emit UI update event
     */
    emitUIUpdate() {
        const uiConfig = this.preferences.getUIConfiguration();
        const event = new CustomEvent('preferences-ui-update', {
            detail: uiConfig
        });
        document.dispatchEvent(event);
    }

    /**
     * Save preferences
     */
    async savePreferences() {
        try {
            await this.preferences.save();
            this.showNotification('Preferences saved successfully!', 'success');
            this.emitUIUpdate();
        } catch (error) {
            console.error('Failed to save preferences:', error);
            this.showNotification('Failed to save preferences', 'error');
        }
    }

    /**
     * Reset all preferences
     */
    async resetAllPreferences() {
        if (confirm('Are you sure you want to reset all preferences to defaults? This action cannot be undone.')) {
            try {
                await this.preferences.resetAll();
                this.applyCurrentPreferences();
                this.showNotification('All preferences reset to defaults', 'success');
                this.emitUIUpdate();
            } catch (error) {
                console.error('Failed to reset preferences:', error);
                this.showNotification('Failed to reset preferences', 'error');
            }
        }
    }

    /**
     * Export preferences
     */
    async exportPreferences() {
        try {
            const filePath = await this.showSaveDialog({
                title: 'Export Preferences',
                filters: [{ name: 'JSON Files', extensions: ['json'] }],
                defaultPath: 'user-preferences.json'
            });

            if (filePath) {
                await this.preferences.exportPreferences(filePath);
                this.showNotification('Preferences exported successfully!', 'success');
            }
        } catch (error) {
            console.error('Failed to export preferences:', error);
            this.showNotification('Failed to export preferences', 'error');
        }
    }

    /**
     * Import preferences
     */
    async importPreferences() {
        try {
            const filePath = await this.showOpenDialog({
                title: 'Import Preferences',
                filters: [{ name: 'JSON Files', extensions: ['json'] }],
                properties: ['openFile']
            });

            if (filePath && filePath.length > 0) {
                await this.preferences.importPreferences(filePath[0]);
                this.applyCurrentPreferences();
                this.showNotification('Preferences imported successfully!', 'success');
                this.emitUIUpdate();
            }
        } catch (error) {
            console.error('Failed to import preferences:', error);
            this.showNotification('Failed to import preferences', 'error');
        }
    }

    /**
     * Show save dialog (placeholder - would integrate with Electron dialog)
     */
    async showSaveDialog(options) {
        // Placeholder - in real implementation, this would use Electron's dialog
        console.log('Save dialog:', options);
        return null;
    }

    /**
     * Show open dialog (placeholder - would integrate with Electron dialog)
     */
    async showOpenDialog(options) {
        // Placeholder - in real implementation, this would use Electron's dialog
        console.log('Open dialog:', options);
        return null;
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            border-radius: 4px;
            z-index: 10001;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Show preferences UI
     */
    show() {
        this.currentUI.style.display = 'flex';
        this.isVisible = true;
        this.applyCurrentPreferences();
    }

    /**
     * Hide preferences UI
     */
    hide() {
        this.currentUI.style.display = 'none';
        this.isVisible = false;
    }

    /**
     * Toggle preferences UI visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Get current UI configuration
     */
    getUIConfiguration() {
        return this.preferences.getUIConfiguration();
    }

    /**
     * Get performance configuration
     */
    getPerformanceConfiguration() {
        return this.preferences.getPerformanceConfiguration();
    }

    /**
     * Check if beginner mode is active
     */
    isBeginnerMode() {
        return this.preferences.isBeginnerMode();
    }

    /**
     * Check if advanced mode is active
     */
    isAdvancedMode() {
        return this.preferences.isAdvancedMode();
    }

    /**
     * Destroy the preferences UI
     */
    async destroy() {
        if (this.currentUI && this.currentUI.parentNode) {
            this.currentUI.parentNode.removeChild(this.currentUI);
        }

        await this.preferences.destroy();
        console.log('Preferences UI destroyed');
    }
}

module.exports = PreferencesUI;
