/**
 * Keyboard Shortcuts Management System
 * Provides customizable keyboard shortcuts with conflict resolution and documentation
 */

const UserPreferences = require('../core/user-preferences');

class KeyboardShortcuts {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.shortcuts = new Map();
        this.categories = new Map();
        this.activeModifiers = new Set();
        this.eventListeners = new Map();
        this.conflicts = new Map();

        this.init();
    }

    /**
     * Initialize the keyboard shortcuts system
     */
    async init() {
        await this.preferences.init();
        this.defineDefaultShortcuts();
        this.setupEventListeners();
        this.loadCustomShortcuts();

        console.log('Keyboard shortcuts system initialized');
    }

    /**
     * Define default keyboard shortcuts
     */
    defineDefaultShortcuts() {
        // Application shortcuts
        this.addShortcut('app.new', {
            key: 'n',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('new-project'),
            description: 'Create new project',
            category: 'application',
            context: 'global'
        });

        this.addShortcut('app.open', {
            key: 'o',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('open-project'),
            description: 'Open project',
            category: 'application',
            context: 'global'
        });

        this.addShortcut('app.save', {
            key: 's',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('save-project'),
            description: 'Save project',
            category: 'application',
            context: 'global'
        });

        this.addShortcut('app.preferences', {
            key: ',',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('open-preferences'),
            description: 'Open preferences',
            category: 'application',
            context: 'global'
        });

        // Generation shortcuts
        this.addShortcut('generation.generate', {
            key: 'g',
            modifiers: [],
            action: () => this.triggerAction('generate-asset'),
            description: 'Generate asset',
            category: 'generation',
            context: 'generator'
        });

        this.addShortcut('generation.batch', {
            key: 'b',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('batch-generate'),
            description: 'Batch generate assets',
            category: 'generation',
            context: 'generator'
        });

        this.addShortcut('generation.cancel', {
            key: 'Escape',
            modifiers: [],
            action: () => this.triggerAction('cancel-generation'),
            description: 'Cancel current generation',
            category: 'generation',
            context: 'generating'
        });

        // Navigation shortcuts
        this.addShortcut('navigation.next', {
            key: 'Tab',
            modifiers: [],
            action: () => this.triggerAction('next-element'),
            description: 'Move to next element',
            category: 'navigation',
            context: 'global'
        });

        this.addShortcut('navigation.previous', {
            key: 'Tab',
            modifiers: ['shift'],
            action: () => this.triggerAction('previous-element'),
            description: 'Move to previous element',
            category: 'navigation',
            context: 'global'
        });

        this.addShortcut('navigation.focus-generator', {
            key: '1',
            modifiers: ['alt'],
            action: () => this.triggerAction('focus-generator-list'),
            description: 'Focus generator list',
            category: 'navigation',
            context: 'global'
        });

        this.addShortcut('navigation.focus-controls', {
            key: '2',
            modifiers: ['alt'],
            action: () => this.triggerAction('focus-controls'),
            description: 'Focus parameter controls',
            category: 'navigation',
            context: 'global'
        });

        // View shortcuts
        this.addShortcut('view.zoom-in', {
            key: '+',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('zoom-in'),
            description: 'Zoom in',
            category: 'view',
            context: 'global'
        });

        this.addShortcut('view.zoom-out', {
            key: '-',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('zoom-out'),
            description: 'Zoom out',
            category: 'view',
            context: 'global'
        });

        this.addShortcut('view.reset-zoom', {
            key: '0',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('reset-zoom'),
            description: 'Reset zoom',
            category: 'view',
            context: 'global'
        });

        // Edit shortcuts
        this.addShortcut('edit.undo', {
            key: 'z',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('undo'),
            description: 'Undo last action',
            category: 'edit',
            context: 'global'
        });

        this.addShortcut('edit.redo', {
            key: 'y',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('redo'),
            description: 'Redo last undone action',
            category: 'edit',
            context: 'global'
        });

        this.addShortcut('edit.copy', {
            key: 'c',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('copy'),
            description: 'Copy selected item',
            category: 'edit',
            context: 'global'
        });

        this.addShortcut('edit.paste', {
            key: 'v',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('paste'),
            description: 'Paste from clipboard',
            category: 'edit',
            context: 'global'
        });

        // Help shortcuts
        this.addShortcut('help.shortcuts', {
            key: '/',
            modifiers: ['ctrl'],
            action: () => this.showShortcutHelp(),
            description: 'Show keyboard shortcuts',
            category: 'help',
            context: 'global'
        });

        this.addShortcut('help.documentation', {
            key: 'F1',
            modifiers: [],
            action: () => this.triggerAction('show-documentation'),
            description: 'Open documentation',
            category: 'help',
            context: 'global'
        });

        // Window shortcuts
        this.addShortcut('window.minimize', {
            key: 'm',
            modifiers: ['ctrl', 'alt'],
            action: () => this.triggerAction('minimize-window'),
            description: 'Minimize window',
            category: 'window',
            context: 'global'
        });

        this.addShortcut('window.close', {
            key: 'w',
            modifiers: ['ctrl'],
            action: () => this.triggerAction('close-window'),
            description: 'Close current window',
            category: 'window',
            context: 'global'
        });
    }

    /**
     * Add a keyboard shortcut
     */
    addShortcut(id, shortcut) {
        const shortcutKey = this.generateShortcutKey(shortcut.key, shortcut.modifiers);

        // Check for conflicts
        if (this.shortcuts.has(shortcutKey)) {
            const existing = this.shortcuts.get(shortcutKey);
            this.addConflict(shortcutKey, existing, shortcut);
        }

        this.shortcuts.set(shortcutKey, {
            id,
            ...shortcut,
            enabled: true
        });

        // Add to category
        if (!this.categories.has(shortcut.category)) {
            this.categories.set(shortcut.category, []);
        }
        this.categories.get(shortcut.category).push(id);
    }

    /**
     * Generate shortcut key string
     */
    generateShortcutKey(key, modifiers = []) {
        const sortedModifiers = [...modifiers].sort();
        return [...sortedModifiers, key].join('+');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Listen for preference changes
        this.preferences.on('changed', ({ key, newValue }) => {
            if (key === 'enableKeyboardShortcuts') {
                this.setEnabled(newValue);
            }
        });
    }

    /**
     * Handle key down events
     */
    handleKeyDown(event) {
        // Don't handle shortcuts if disabled
        if (!this.isEnabled()) return;

        // Track modifier keys
        this.updateActiveModifiers(event);

        // Generate shortcut key
        const shortcutKey = this.generateShortcutKey(event.key, Array.from(this.activeModifiers));

        // Check if shortcut exists
        const shortcut = this.shortcuts.get(shortcutKey);
        if (shortcut && shortcut.enabled) {
            // Check context
            if (this.isValidContext(shortcut.context)) {
                event.preventDefault();
                event.stopPropagation();

                try {
                    shortcut.action();
                    this.emit('shortcut-executed', {
                        shortcutId: shortcut.id,
                        shortcut: shortcut,
                        key: event.key,
                        modifiers: Array.from(this.activeModifiers)
                    });
                } catch (error) {
                    console.error('Shortcut execution failed:', error);
                    this.emit('shortcut-error', {
                        shortcutId: shortcut.id,
                        error: error.message
                    });
                }
            }
        }
    }

    /**
     * Handle key up events
     */
    handleKeyUp(event) {
        this.updateActiveModifiers(event);
    }

    /**
     * Update active modifiers
     */
    updateActiveModifiers(event) {
        const modifiers = ['ctrl', 'alt', 'shift', 'meta'];

        modifiers.forEach(modifier => {
            if (event[`${modifier}Key`]) {
                this.activeModifiers.add(modifier);
            } else {
                this.activeModifiers.delete(modifier);
            }
        });
    }

    /**
     * Check if context is valid for shortcut
     */
    isValidContext(context) {
        switch (context) {
            case 'global':
                return true;
            case 'generator':
                return document.querySelector('.generator-controls') !== null;
            case 'generating':
                return document.querySelector('.generation-progress') !== null;
            case 'modal':
                return document.querySelector('.modal, [role="dialog"]') !== null;
            default:
                return true;
        }
    }

    /**
     * Trigger action by name
     */
    triggerAction(actionName) {
        const event = new CustomEvent('keyboard-shortcut-action', {
            detail: { action: actionName }
        });
        document.dispatchEvent(event);
    }

    /**
     * Add conflict between shortcuts
     */
    addConflict(shortcutKey, existing, newShortcut) {
        if (!this.conflicts.has(shortcutKey)) {
            this.conflicts.set(shortcutKey, []);
        }

        const conflictList = this.conflicts.get(shortcutKey);
        if (!conflictList.find(c => c.id === existing.id)) {
            conflictList.push(existing);
        }
        if (!conflictList.find(c => c.id === newShortcut.id)) {
            conflictList.push(newShortcut);
        }
    }

    /**
     * Get conflicts
     */
    getConflicts() {
        return Array.from(this.conflicts.entries()).map(([key, shortcuts]) => ({
            shortcut: key,
            shortcuts: shortcuts
        }));
    }

    /**
     * Resolve conflict by disabling one shortcut
     */
    resolveConflict(shortcutKey, disabledShortcutId) {
        const conflictList = this.conflicts.get(shortcutKey);
        if (conflictList) {
            const shortcut = conflictList.find(s => s.id === disabledShortcutId);
            if (shortcut) {
                shortcut.enabled = false;
                this.emit('conflict-resolved', {
                    shortcut: shortcutKey,
                    disabledShortcut: disabledShortcutId
                });
            }
        }
    }

    /**
     * Load custom shortcuts from preferences
     */
    loadCustomShortcuts() {
        const customShortcuts = this.preferences.get('customShortcuts', {});

        Object.entries(customShortcuts).forEach(([shortcutId, customShortcut]) => {
            if (this.shortcuts.has(shortcutId)) {
                const existing = this.shortcuts.get(shortcutId);
                const newShortcut = {
                    ...existing,
                    key: customShortcut.key,
                    modifiers: customShortcut.modifiers || []
                };

                // Remove old shortcut
                const oldKey = this.generateShortcutKey(existing.key, existing.modifiers);
                this.shortcuts.delete(oldKey);

                // Add new shortcut
                this.addShortcut(shortcutId, newShortcut);
            }
        });
    }

    /**
     * Customize shortcut
     */
    customizeShortcut(shortcutId, newKey, newModifiers = []) {
        const existing = Array.from(this.shortcuts.values()).find(s => s.id === shortcutId);
        if (!existing) {
            throw new Error(`Shortcut '${shortcutId}' not found`);
        }

        // Check for conflicts with new combination
        const newShortcutKey = this.generateShortcutKey(newKey, newModifiers);
        if (this.shortcuts.has(newShortcutKey)) {
            const conflicting = this.shortcuts.get(newShortcutKey);
            if (conflicting.id !== shortcutId) {
                throw new Error(`Shortcut conflicts with existing: ${conflicting.description}`);
            }
        }

        // Remove old shortcut
        const oldKey = this.generateShortcutKey(existing.key, existing.modifiers);
        this.shortcuts.delete(oldKey);

        // Update shortcut
        const updatedShortcut = {
            ...existing,
            key: newKey,
            modifiers: newModifiers
        };

        this.shortcuts.set(newShortcutKey, updatedShortcut);

        // Save to preferences
        const customShortcuts = this.preferences.get('customShortcuts', {});
        customShortcuts[shortcutId] = {
            key: newKey,
            modifiers: newModifiers
        };
        this.preferences.set('customShortcuts', customShortcuts);

        this.emit('shortcut-customized', {
            shortcutId,
            oldShortcut: existing,
            newShortcut: updatedShortcut
        });
    }

    /**
     * Reset shortcut to default
     */
    resetShortcut(shortcutId) {
        const existing = Array.from(this.shortcuts.values()).find(s => s.id === shortcutId);
        if (!existing) return;

        // Remove current shortcut
        const currentKey = this.generateShortcutKey(existing.key, existing.modifiers);
        this.shortcuts.delete(currentKey);

        // Re-add with default
        this.defineDefaultShortcuts();

        // Remove from custom shortcuts
        const customShortcuts = this.preferences.get('customShortcuts', {});
        delete customShortcuts[shortcutId];
        this.preferences.set('customShortcuts', customShortcuts);

        this.emit('shortcut-reset', { shortcutId });
    }

    /**
     * Get all shortcuts
     */
    getAllShortcuts() {
        return Array.from(this.shortcuts.values());
    }

    /**
     * Get shortcuts by category
     */
    getShortcutsByCategory(category) {
        const categoryShortcuts = this.categories.get(category) || [];
        return categoryShortcuts.map(id => {
            const shortcut = Array.from(this.shortcuts.values()).find(s => s.id === id);
            return shortcut;
        }).filter(Boolean);
    }

    /**
     * Get shortcut by ID
     */
    getShortcut(shortcutId) {
        return Array.from(this.shortcuts.values()).find(s => s.id === shortcutId);
    }

    /**
     * Get shortcut display string
     */
    getShortcutDisplay(shortcut) {
        const modifiers = shortcut.modifiers.map(mod => {
            switch (mod) {
                case 'ctrl': return 'Ctrl';
                case 'alt': return 'Alt';
                case 'shift': return 'Shift';
                case 'meta': return 'Cmd';
                default: return mod;
            }
        });

        const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
        return [...modifiers, key].join('+');
    }

    /**
     * Show shortcut help modal
     */
    showShortcutHelp() {
        const modal = this.createShortcutHelpModal();
        document.body.appendChild(modal);
    }

    /**
     * Create shortcut help modal
     */
    createShortcutHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'shortcut-help-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--bg-color, #ffffff);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 800px;
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
        title.textContent = 'Keyboard Shortcuts';
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
        closeButton.addEventListener('click', () => modal.remove());

        header.appendChild(title);
        header.appendChild(closeButton);

        // Categories
        const categoriesContainer = document.createElement('div');
        categoriesContainer.style.cssText = `
            padding: 24px;
        `;

        const categories = ['application', 'generation', 'navigation', 'view', 'edit', 'help', 'window'];

        categories.forEach(category => {
            const categorySection = this.createCategorySection(category);
            if (categorySection) {
                categoriesContainer.appendChild(categorySection);
            }
        });

        content.appendChild(header);
        content.appendChild(categoriesContainer);
        modal.appendChild(content);

        // Close on escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });

        return modal;
    }

    /**
     * Create category section for help modal
     */
    createCategorySection(category) {
        const shortcuts = this.getShortcutsByCategory(category);
        if (shortcuts.length === 0) return null;

        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 24px;
        `;

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryTitle.style.cssText = `
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
            border-bottom: 2px solid var(--primary-color, #007bff);
            padding-bottom: 4px;
        `;

        const shortcutList = document.createElement('div');
        shortcutList.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 8px;
            font-size: 14px;
        `;

        shortcuts.forEach(shortcut => {
            const keyCell = document.createElement('div');
            keyCell.style.cssText = `
                font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
                background: var(--bg-secondary, #f8f9fa);
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 500;
                color: var(--text-color, #1a1a1a);
            `;
            keyCell.textContent = this.getShortcutDisplay(shortcut);

            const descCell = document.createElement('div');
            descCell.textContent = shortcut.description;
            descCell.style.cssText = `
                color: var(--text-secondary, #666);
            `;

            shortcutList.appendChild(keyCell);
            shortcutList.appendChild(descCell);
        });

        section.appendChild(categoryTitle);
        section.appendChild(shortcutList);

        return section;
    }

    /**
     * Check if shortcuts are enabled
     */
    isEnabled() {
        return this.preferences.get('enableKeyboardShortcuts', true);
    }

    /**
     * Enable/disable shortcuts
     */
    setEnabled(enabled) {
        this.preferences.set('enableKeyboardShortcuts', enabled);
        this.emit('shortcuts-toggled', { enabled });
    }

    /**
     * Get shortcut statistics
     */
    getStatistics() {
        const total = this.shortcuts.size;
        const enabled = Array.from(this.shortcuts.values()).filter(s => s.enabled).length;
        const custom = Object.keys(this.preferences.get('customShortcuts', {})).length;
        const conflicts = this.conflicts.size;

        return {
            total,
            enabled,
            disabled: total - enabled,
            custom,
            conflicts
        };
    }

    /**
     * Export shortcuts configuration
     */
    exportConfiguration() {
        const config = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            shortcuts: Array.from(this.shortcuts.values()),
            customShortcuts: this.preferences.get('customShortcuts', {}),
            conflicts: Array.from(this.conflicts.entries())
        };

        return JSON.stringify(config, null, 2);
    }

    /**
     * Import shortcuts configuration
     */
    importConfiguration(configJson) {
        try {
            const config = JSON.parse(configJson);

            if (config.customShortcuts) {
                this.preferences.set('customShortcuts', config.customShortcuts);
                this.loadCustomShortcuts();
            }

            this.emit('configuration-imported', config);
            return true;
        } catch (error) {
            console.error('Failed to import shortcuts configuration:', error);
            return false;
        }
    }

    /**
     * Emit event
     */
    emit(eventType, data) {
        const event = new CustomEvent(`keyboard-shortcuts-${eventType}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the keyboard shortcuts system
     */
    destroy() {
        this.shortcuts.clear();
        this.categories.clear();
        this.activeModifiers.clear();
        this.conflicts.clear();
        this.eventListeners.clear();

        console.log('Keyboard shortcuts system destroyed');
    }
}

module.exports = KeyboardShortcuts;
