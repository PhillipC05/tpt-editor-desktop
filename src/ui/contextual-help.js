/**
 * Contextual Help System
 * Provides intelligent, context-aware help and tooltips
 */

const UserPreferences = require('../core/user-preferences');

class ContextualHelp {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.preferences = options.preferences || new UserPreferences();
        this.helpDatabase = new Map();
        this.activeTooltips = new Set();
        this.eventListeners = new Map();

        this.init();
    }

    /**
     * Initialize the contextual help system
     */
    async init() {
        await this.preferences.init();
        this.buildHelpDatabase();
        this.setupEventListeners();
        this.attachHelpTriggers();

        console.log('Contextual help system initialized');
    }

    /**
     * Build comprehensive help database
     */
    buildHelpDatabase() {
        // Generator help
        this.addHelpEntry('generators', {
            title: 'Asset Generators',
            beginner: {
                content: 'Generators create different types of game assets. Click on any generator to start creating!',
                examples: ['Try the "Character" generator to make a game character']
            },
            intermediate: {
                content: 'Each generator has unique parameters. Experiment with different settings to create varied assets.',
                tips: ['Use the preview to see changes instantly', 'Save your favorite parameter combinations']
            },
            advanced: {
                content: 'Advanced generators support batch processing, custom algorithms, and API integration.',
                shortcuts: ['Ctrl+B: Batch generate', 'Ctrl+S: Save preset']
            }
        });

        // Parameter controls help
        this.addHelpEntry('parameters', {
            title: 'Parameter Controls',
            beginner: {
                content: 'These sliders and inputs control how your asset looks. Drag them to see changes instantly!',
                examples: ['Size controls make things bigger or smaller', 'Color pickers change the asset colors']
            },
            intermediate: {
                content: 'Parameters have minimum and maximum values. Some work together for complex effects.',
                tips: ['Hold Shift while dragging for fine control', 'Right-click parameters to reset to default']
            },
            advanced: {
                content: 'Parameters can be linked, randomized, or controlled via expressions.',
                features: ['Parameter linking', 'Randomization ranges', 'Expression-based controls']
            }
        });

        // Generation process help
        this.addHelpEntry('generation', {
            title: 'Asset Generation',
            beginner: {
                content: 'Click the "Generate" button to create your asset. This might take a few seconds.',
                tips: ['Larger assets take longer to generate', 'You can cancel generation anytime']
            },
            intermediate: {
                content: 'Generation uses your computer\'s processing power. Monitor the progress bar.',
                tips: ['Use background generation for large batches', 'Check system resources in the status bar']
            },
            advanced: {
                content: 'Advanced generation supports parallel processing and GPU acceleration.',
                optimization: ['Enable GPU acceleration in preferences', 'Adjust concurrent operations limit']
            }
        });

        // Saving and export help
        this.addHelpEntry('saving', {
            title: 'Saving & Export',
            beginner: {
                content: 'Save your assets to use them in your game. Choose PNG for images, JSON for data.',
                tips: ['Use descriptive names for your files', 'Organize assets in folders by type']
            },
            intermediate: {
                content: 'Export formats affect file size and quality. Choose based on your game engine.',
                formats: ['PNG: High quality, larger files', 'WebP: Smaller files, good quality', 'SVG: Vector format, scalable']
            },
            advanced: {
                content: 'Batch export multiple assets with custom naming and folder structures.',
                automation: ['Use export templates', 'Set up automatic folder organization']
            }
        });

        // Performance monitoring help
        this.addHelpEntry('performance', {
            title: 'Performance Monitoring',
            beginner: {
                content: 'These numbers show how fast your computer is working. Green is good, red means slow.',
                tips: ['Close other programs if generation is slow', 'Restart the app if performance gets worse']
            },
            intermediate: {
                content: 'Monitor CPU, memory, and GPU usage. High usage might slow down generation.',
                tips: ['Use Task Manager to see overall system usage', 'Adjust settings if memory usage is high']
            },
            advanced: {
                content: 'Detailed performance metrics help optimize generation algorithms.',
                analysis: ['Track performance trends', 'Identify bottlenecks', 'Optimize resource allocation']
            }
        });

        // Batch processing help
        this.addHelpEntry('batch', {
            title: 'Batch Processing',
            beginner: {
                content: 'Create multiple assets at once! Select a generator and click "Batch Generate".',
                tips: ['Start with small batches (5-10 items)', 'Check your computer\'s performance first']
            },
            intermediate: {
                content: 'Batch processing saves time but uses more resources. Use background processing for large batches.',
                tips: ['Monitor progress in the batch queue', 'Pause/resume batches as needed']
            },
            advanced: {
                content: 'Advanced batch processing supports custom workflows, conditional generation, and automated export.',
                features: ['Workflow automation', 'Conditional parameters', 'Smart queuing']
            }
        });

        // Keyboard shortcuts help
        this.addHelpEntry('shortcuts', {
            title: 'Keyboard Shortcuts',
            beginner: {
                content: 'Keyboard shortcuts make you faster! Press Ctrl+/ to see all available shortcuts.',
                essentials: ['Ctrl+Z: Undo', 'Ctrl+Y: Redo', 'Ctrl+S: Save']
            },
            intermediate: {
                content: 'Learn shortcuts for common actions. Customize them in preferences.',
                productivity: ['Ctrl+G: Generate', 'Ctrl+B: Batch generate', 'Ctrl+E: Export']
            },
            advanced: {
                content: 'Create custom shortcuts and macros for complex workflows.',
                customization: ['Custom shortcut assignment', 'Macro recording', 'Workflow shortcuts']
            }
        });
    }

    /**
     * Add help entry to database
     */
    addHelpEntry(key, entry) {
        this.helpDatabase.set(key, entry);
    }

    /**
     * Setup event listeners for contextual help
     */
    setupEventListeners() {
        // Listen for user interactions
        document.addEventListener('mouseover', (e) => this.handleMouseOver(e));
        document.addEventListener('focus', (e) => this.handleFocus(e));
        document.addEventListener('click', (e) => this.handleClick(e));

        // Listen for preference changes
        this.preferences.on('experience-level-changed', ({ newLevel }) => {
            this.updateHelpForExperienceLevel(newLevel);
        });

        // Listen for workflow events
        document.addEventListener('workflow-step-shown', (e) => {
            this.handleWorkflowStep(e.detail);
        });
    }

    /**
     * Attach help triggers to UI elements
     */
    attachHelpTriggers() {
        // Add help buttons to major UI sections
        const helpSelectors = [
            { selector: '.generator-list', helpKey: 'generators' },
            { selector: '.generator-controls', helpKey: 'parameters' },
            { selector: '.generate-button', helpKey: 'generation' },
            { selector: '.save-button', helpKey: 'saving' },
            { selector: '.performance-monitor', helpKey: 'performance' },
            { selector: '.batch-controls', helpKey: 'batch' }
        ];

        helpSelectors.forEach(({ selector, helpKey }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.attachHelpTrigger(element, helpKey);
            });
        });
    }

    /**
     * Attach help trigger to element
     */
    attachHelpTrigger(element, helpKey) {
        if (!element) return;

        // Add help icon
        const helpIcon = this.createHelpIcon(helpKey);
        element.style.position = element.style.position || 'relative';
        element.appendChild(helpIcon);

        // Add event listeners
        element.addEventListener('mouseenter', () => {
            if (this.shouldShowHelp(helpKey)) {
                this.showContextualHelp(element, helpKey);
            }
        });

        element.addEventListener('mouseleave', () => {
            this.hideContextualHelp(helpKey);
        });
    }

    /**
     * Create help icon
     */
    createHelpIcon(helpKey) {
        const icon = document.createElement('div');
        icon.className = 'help-icon';
        icon.innerHTML = '?';
        icon.dataset.helpKey = helpKey;
        icon.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            background: var(--primary-color, #007bff);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            cursor: help;
            z-index: 1000;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        `;

        icon.addEventListener('mouseenter', () => {
            icon.style.opacity = '1';
        });

        icon.addEventListener('mouseleave', () => {
            icon.style.opacity = '0.7';
        });

        return icon;
    }

    /**
     * Handle mouse over events
     */
    handleMouseOver(event) {
        const target = event.target;

        // Check for help triggers
        if (target.classList.contains('help-icon')) {
            return; // Already handled
        }

        // Check for elements that should show help
        const helpKey = this.getHelpKeyForElement(target);
        if (helpKey && this.shouldShowHelp(helpKey)) {
            this.showContextualHelp(target, helpKey);
        }
    }

    /**
     * Handle focus events
     */
    handleFocus(event) {
        const target = event.target;

        // Show help for focused form elements
        if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
            const helpKey = this.getHelpKeyForElement(target);
            if (helpKey && this.shouldShowHelp(helpKey)) {
                this.showContextualHelp(target, helpKey);
            }
        }
    }

    /**
     * Handle click events
     */
    handleClick(event) {
        const target = event.target;

        // Handle help icon clicks
        if (target.classList.contains('help-icon') || target.closest('.help-icon')) {
            const helpIcon = target.closest('.help-icon');
            const helpKey = helpIcon?.dataset.helpKey;
            if (helpKey) {
                event.stopPropagation();
                this.showDetailedHelp(helpKey);
            }
        }
    }

    /**
     * Get help key for element
     */
    getHelpKeyForElement(element) {
        // Check element and its parents for help keys
        let current = element;
        while (current && current !== document.body) {
            if (current.dataset.helpKey) {
                return current.dataset.helpKey;
            }

            // Check by class or ID
            if (current.classList.contains('generator-list')) return 'generators';
            if (current.classList.contains('generator-controls')) return 'parameters';
            if (current.classList.contains('generate-button')) return 'generation';
            if (current.classList.contains('save-button')) return 'saving';
            if (current.classList.contains('performance-monitor')) return 'performance';
            if (current.classList.contains('batch-controls')) return 'batch';

            current = current.parentElement;
        }

        return null;
    }

    /**
     * Check if help should be shown
     */
    shouldShowHelp(helpKey) {
        const experienceLevel = this.preferences.get('experienceLevel');
        const showTooltips = this.preferences.get('showTooltips');

        // Don't show help if tooltips are disabled
        if (!showTooltips) return false;

        // Always show help for beginners
        if (experienceLevel === 'beginner') return true;

        // Show help for intermediate users on complex features
        if (experienceLevel === 'intermediate') {
            const complexFeatures = ['batch', 'performance', 'shortcuts'];
            return complexFeatures.includes(helpKey);
        }

        // Advanced users only see help on very complex features
        if (experienceLevel === 'advanced') {
            const advancedFeatures = ['shortcuts'];
            return advancedFeatures.includes(helpKey);
        }

        return false;
    }

    /**
     * Show contextual help tooltip
     */
    showContextualHelp(element, helpKey) {
        const helpEntry = this.helpDatabase.get(helpKey);
        if (!helpEntry) return;

        const experienceLevel = this.preferences.get('experienceLevel');
        const helpContent = helpEntry[experienceLevel] || helpEntry.beginner;

        if (!helpContent) return;

        // Create tooltip
        const tooltip = this.createHelpTooltip(helpEntry.title, helpContent, element);
        this.container.appendChild(tooltip);

        this.activeTooltips.add(helpKey);
    }

    /**
     * Create help tooltip
     */
    createHelpTooltip(title, content, targetElement) {
        const tooltip = document.createElement('div');
        tooltip.className = 'contextual-help-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: var(--bg-color, #ffffff);
            border: 1px solid var(--border-color, #e1e5e9);
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 12px 16px;
            max-width: 280px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            line-height: 1.4;
            pointer-events: none;
        `;

        // Position tooltip
        this.positionTooltip(tooltip, targetElement);

        // Title
        if (title) {
            const titleElement = document.createElement('div');
            titleElement.textContent = title;
            titleElement.style.cssText = `
                font-weight: 600;
                color: var(--text-color, #1a1a1a);
                margin-bottom: 6px;
                font-size: 14px;
            `;
            tooltip.appendChild(titleElement);
        }

        // Content
        const contentElement = document.createElement('div');
        contentElement.textContent = content.content || content;
        contentElement.style.cssText = `
            color: var(--text-color, #1a1a1a);
            margin-bottom: 8px;
        `;
        tooltip.appendChild(contentElement);

        // Additional content based on experience level
        if (content.tips) {
            const tipsElement = document.createElement('div');
            tipsElement.innerHTML = `<strong>Tips:</strong> ${content.tips.join(', ')}`;
            tipsElement.style.cssText = `
                color: var(--text-secondary, #666);
                font-size: 12px;
                margin-top: 6px;
            `;
            tooltip.appendChild(tipsElement);
        }

        if (content.examples) {
            const examplesElement = document.createElement('div');
            examplesElement.innerHTML = `<strong>Examples:</strong> ${content.examples.join(', ')}`;
            examplesElement.style.cssText = `
                color: var(--text-secondary, #666);
                font-size: 12px;
                margin-top: 4px;
            `;
            tooltip.appendChild(examplesElement);
        }

        return tooltip;
    }

    /**
     * Position tooltip relative to target element
     */
    positionTooltip(tooltip, targetElement) {
        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Try to position above first
        let top = targetRect.top - tooltipRect.height - 8;
        let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

        // If it doesn't fit above, try below
        if (top < 8) {
            top = targetRect.bottom + 8;
        }

        // Ensure it stays within viewport
        const margin = 8;
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
    }

    /**
     * Hide contextual help
     */
    hideContextualHelp(helpKey) {
        const tooltip = document.querySelector('.contextual-help-tooltip');
        if (tooltip) {
            tooltip.remove();
        }

        this.activeTooltips.delete(helpKey);
    }

    /**
     * Show detailed help modal
     */
    showDetailedHelp(helpKey) {
        const helpEntry = this.helpDatabase.get(helpKey);
        if (!helpEntry) return;

        const experienceLevel = this.preferences.get('experienceLevel');
        const helpContent = helpEntry[experienceLevel] || helpEntry.beginner;

        // Create detailed help modal
        const modal = this.createDetailedHelpModal(helpEntry, helpContent);
        this.container.appendChild(modal);
    }

    /**
     * Create detailed help modal
     */
    createDetailedHelpModal(helpEntry, helpContent) {
        const overlay = document.createElement('div');
        overlay.className = 'detailed-help-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const modal = document.createElement('div');
        modal.className = 'detailed-help-modal';
        modal.style.cssText = `
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
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color, #e1e5e9);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h2');
        title.textContent = helpEntry.title;
        title.style.cssText = `
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: var(--text-secondary, #666);
            padding: 0;
        `;
        closeButton.addEventListener('click', () => overlay.remove());

        header.appendChild(title);
        header.appendChild(closeButton);

        // Content
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 24px;
        `;

        // Main content
        const mainContent = document.createElement('div');
        mainContent.textContent = helpContent.content;
        mainContent.style.cssText = `
            margin-bottom: 20px;
            line-height: 1.6;
            color: var(--text-color, #1a1a1a);
        `;
        content.appendChild(mainContent);

        // Additional sections
        if (helpContent.tips) {
            const tipsSection = this.createHelpSection('💡 Tips', helpContent.tips);
            content.appendChild(tipsSection);
        }

        if (helpContent.examples) {
            const examplesSection = this.createHelpSection('🔍 Examples', helpContent.examples);
            content.appendChild(examplesSection);
        }

        if (helpContent.shortcuts) {
            const shortcutsSection = this.createHelpSection('⌨️ Shortcuts', helpContent.shortcuts);
            content.appendChild(shortcutsSection);
        }

        if (helpContent.features) {
            const featuresSection = this.createHelpSection('⚡ Features', helpContent.features);
            content.appendChild(featuresSection);
        }

        modal.appendChild(header);
        modal.appendChild(content);
        overlay.appendChild(modal);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        return overlay;
    }

    /**
     * Create help section
     */
    createHelpSection(title, items) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 20px;
        `;

        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title;
        sectionTitle.style.cssText = `
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        const list = document.createElement('ul');
        list.style.cssText = `
            margin: 0;
            padding-left: 20px;
        `;

        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            listItem.style.cssText = `
                margin-bottom: 6px;
                color: var(--text-color, #1a1a1a);
            `;
            list.appendChild(listItem);
        });

        section.appendChild(sectionTitle);
        section.appendChild(list);

        return section;
    }

    /**
     * Update help for experience level change
     */
    updateHelpForExperienceLevel(newLevel) {
        // Hide all active tooltips
        this.activeTooltips.forEach(helpKey => {
            this.hideContextualHelp(helpKey);
        });
        this.activeTooltips.clear();

        // Update help icons visibility
        const helpIcons = document.querySelectorAll('.help-icon');
        helpIcons.forEach(icon => {
            const helpKey = icon.dataset.helpKey;
            const shouldShow = this.shouldShowHelp(helpKey);
            icon.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    /**
     * Handle workflow step events
     */
    handleWorkflowStep(stepDetail) {
        // Pause contextual help during workflow
        this.activeTooltips.forEach(helpKey => {
            this.hideContextualHelp(helpKey);
        });
    }

    /**
     * Get help content for key
     */
    getHelpContent(helpKey) {
        return this.helpDatabase.get(helpKey);
    }

    /**
     * Check if help is available for key
     */
    hasHelp(helpKey) {
        return this.helpDatabase.has(helpKey);
    }

    /**
     * Get all available help keys
     */
    getAvailableHelpKeys() {
        return Array.from(this.helpDatabase.keys());
    }

    /**
     * Enable/disable contextual help
     */
    setEnabled(enabled) {
        this.preferences.set('showTooltips', enabled);
        this.updateHelpForExperienceLevel(this.preferences.get('experienceLevel'));
    }

    /**
     * Check if contextual help is enabled
     */
    isEnabled() {
        return this.preferences.get('showTooltips');
    }

    /**
     * Destroy the contextual help system
     */
    destroy() {
        // Remove all tooltips
        const tooltips = document.querySelectorAll('.contextual-help-tooltip, .detailed-help-overlay');
        tooltips.forEach(tooltip => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });

        // Remove help icons
        const helpIcons = document.querySelectorAll('.help-icon');
        helpIcons.forEach(icon => {
            if (icon.parentNode) {
                icon.parentNode.removeChild(icon);
            }
        });

        this.helpDatabase.clear();
        this.activeTooltips.clear();
        this.eventListeners.clear();

        console.log('Contextual help system destroyed');
    }
}

module.exports = ContextualHelp;
