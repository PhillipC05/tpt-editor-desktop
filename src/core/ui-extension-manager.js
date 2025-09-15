/**
 * UI Extension Manager
 * Manages plugin UI extensions including menus, toolbars, dialogs, and panels
 */

const UserPreferences = require('./user-preferences');
const PluginSystem = require('./plugin-system');

class UIExtensionManager {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.pluginSystem = options.pluginSystem || new PluginSystem();

        this.extensions = new Map();
        this.menus = new Map();
        this.toolbars = new Map();
        this.panels = new Map();
        this.dialogs = new Map();
        this.shortcuts = new Map();
        this.contextMenus = new Map();

        this.init();
    }

    /**
     * Initialize the UI extension manager
     */
    async init() {
        await this.preferences.init();
        this.setupDefaultUI();
        this.setupEventListeners();

        console.log('UI extension manager initialized');
    }

    /**
     * Setup default UI structure
     */
    setupDefaultUI() {
        // Setup default menus
        this.menus.set('main-menu', {
            id: 'main-menu',
            type: 'menu',
            items: [],
            position: 'top'
        });

        this.menus.set('context-menu', {
            id: 'context-menu',
            type: 'context',
            items: [],
            triggers: ['right-click']
        });

        // Setup default toolbars
        this.toolbars.set('main-toolbar', {
            id: 'main-toolbar',
            type: 'toolbar',
            items: [],
            position: 'top',
            size: 'normal'
        });

        this.toolbars.set('generator-toolbar', {
            id: 'generator-toolbar',
            type: 'toolbar',
            items: [],
            position: 'left',
            size: 'compact'
        });

        // Setup default panels
        this.panels.set('properties-panel', {
            id: 'properties-panel',
            type: 'panel',
            title: 'Properties',
            content: null,
            position: 'right',
            size: { width: 300, height: 'auto' },
            collapsible: true,
            closable: false
        });

        this.panels.set('layers-panel', {
            id: 'layers-panel',
            type: 'panel',
            title: 'Layers',
            content: null,
            position: 'left',
            size: { width: 250, height: 'auto' },
            collapsible: true,
            closable: false
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for plugin system events
        this.pluginSystem.on('plugin-loaded', (data) => {
            this.handlePluginLoaded(data);
        });

        this.pluginSystem.on('plugin-unloaded', (data) => {
            this.handlePluginUnloaded(data);
        });

        // Listen for UI events
        document.addEventListener('ui-extension-registered', (event) => {
            this.handleUIExtensionRegistered(event.detail);
        });
    }

    /**
     * Register a UI extension
     */
    async registerUIExtension(extensionDefinition) {
        try {
            this.validateExtensionDefinition(extensionDefinition);

            const extension = {
                ...extensionDefinition,
                id: extensionDefinition.id,
                pluginId: extensionDefinition.pluginId,
                registeredAt: new Date().toISOString(),
                enabled: extensionDefinition.enabled !== false
            };

            this.extensions.set(extension.id, extension);

            // Register with appropriate UI component
            await this.registerWithUIComponent(extension);

            this.emit('extension-registered', { extension });

            return extension.id;

        } catch (error) {
            console.error('Failed to register UI extension:', error);
            throw error;
        }
    }

    /**
     * Register extension with UI component
     */
    async registerWithUIComponent(extension) {
        switch (extension.type) {
            case 'menu-item':
                await this.registerMenuItem(extension);
                break;
            case 'toolbar-item':
                await this.registerToolbarItem(extension);
                break;
            case 'panel':
                await this.registerPanel(extension);
                break;
            case 'dialog':
                await this.registerDialog(extension);
                break;
            case 'shortcut':
                await this.registerShortcut(extension);
                break;
            case 'context-menu-item':
                await this.registerContextMenuItem(extension);
                break;
            default:
                throw new Error(`Unknown extension type: ${extension.type}`);
        }
    }

    /**
     * Register menu item
     */
    async registerMenuItem(extension) {
        const menuId = extension.menuId || 'main-menu';
        const menu = this.menus.get(menuId);

        if (!menu) {
            throw new Error(`Menu '${menuId}' not found`);
        }

        const menuItem = {
            id: extension.id,
            label: extension.label,
            icon: extension.icon,
            action: extension.action,
            shortcut: extension.shortcut,
            submenu: extension.submenu,
            position: extension.position || 'end',
            separator: extension.separator || false,
            enabled: extension.enabled !== false,
            visible: extension.visible !== false
        };

        // Insert at specified position
        this.insertMenuItem(menu, menuItem);

        // Update UI
        this.updateMenuUI(menuId);
    }

    /**
     * Register toolbar item
     */
    async registerToolbarItem(extension) {
        const toolbarId = extension.toolbarId || 'main-toolbar';
        const toolbar = this.toolbars.get(toolbarId);

        if (!toolbar) {
            throw new Error(`Toolbar '${toolbarId}' not found`);
        }

        const toolbarItem = {
            id: extension.id,
            label: extension.label,
            icon: extension.icon,
            action: extension.action,
            tooltip: extension.tooltip,
            type: extension.itemType || 'button', // button, separator, dropdown
            size: extension.size || 'normal',
            position: extension.position || 'end',
            group: extension.group,
            enabled: extension.enabled !== false,
            visible: extension.visible !== false
        };

        // Insert at specified position
        this.insertToolbarItem(toolbar, toolbarItem);

        // Update UI
        this.updateToolbarUI(toolbarId);
    }

    /**
     * Register panel
     */
    async registerPanel(extension) {
        const panel = {
            id: extension.id,
            type: 'panel',
            title: extension.title,
            content: extension.content,
            position: extension.position || 'right',
            size: extension.size || { width: 300, height: 'auto' },
            collapsible: extension.collapsible !== false,
            closable: extension.closable !== false,
            resizable: extension.resizable !== false,
            floating: extension.floating || false,
            zIndex: extension.zIndex || 100,
            pluginId: extension.pluginId
        };

        this.panels.set(extension.id, panel);

        // Create panel in UI
        this.createPanelUI(panel);
    }

    /**
     * Register dialog
     */
    async registerDialog(extension) {
        const dialog = {
            id: extension.id,
            type: 'dialog',
            title: extension.title,
            content: extension.content,
            size: extension.size || { width: 500, height: 400 },
            modal: extension.modal !== false,
            resizable: extension.resizable !== false,
            draggable: extension.draggable !== false,
            buttons: extension.buttons || [],
            onOpen: extension.onOpen,
            onClose: extension.onClose,
            pluginId: extension.pluginId
        };

        this.dialogs.set(extension.id, dialog);
    }

    /**
     * Register shortcut
     */
    async registerShortcut(extension) {
        const shortcut = {
            id: extension.id,
            key: extension.key,
            modifiers: extension.modifiers || [],
            action: extension.action,
            description: extension.description,
            global: extension.global !== false,
            enabled: extension.enabled !== false,
            pluginId: extension.pluginId
        };

        // Check for conflicts
        const conflict = this.checkShortcutConflict(shortcut);
        if (conflict) {
            console.warn(`Shortcut conflict detected: ${extension.key} already used by ${conflict.id}`);
        }

        this.shortcuts.set(extension.id, shortcut);

        // Register with keyboard manager
        this.registerShortcutWithKeyboard(shortcut);
    }

    /**
     * Register context menu item
     */
    async registerContextMenuItem(extension) {
        const menuId = extension.menuId || 'context-menu';
        const menu = this.contextMenus.get(menuId);

        if (!menu) {
            // Create new context menu if it doesn't exist
            this.contextMenus.set(menuId, {
                id: menuId,
                items: [],
                triggers: extension.triggers || ['right-click']
            });
        }

        const menuItem = {
            id: extension.id,
            label: extension.label,
            icon: extension.icon,
            action: extension.action,
            condition: extension.condition, // Function to determine if item should be shown
            position: extension.position || 'end',
            separator: extension.separator || false,
            enabled: extension.enabled !== false
        };

        const contextMenu = this.contextMenus.get(menuId);
        this.insertMenuItem(contextMenu, menuItem);
    }

    /**
     * Insert menu item at specified position
     */
    insertMenuItem(menu, item) {
        const position = item.position;

        if (position === 'start') {
            menu.items.unshift(item);
        } else if (position === 'end') {
            menu.items.push(item);
        } else if (typeof position === 'number') {
            menu.items.splice(position, 0, item);
        } else {
            // Insert after item with matching ID
            const index = menu.items.findIndex(existing => existing.id === position);
            if (index !== -1) {
                menu.items.splice(index + 1, 0, item);
            } else {
                menu.items.push(item);
            }
        }
    }

    /**
     * Insert toolbar item at specified position
     */
    insertToolbarItem(toolbar, item) {
        const position = item.position;

        if (position === 'start') {
            toolbar.items.unshift(item);
        } else if (position === 'end') {
            toolbar.items.push(item);
        } else if (typeof position === 'number') {
            toolbar.items.splice(position, 0, item);
        } else {
            // Insert after item with matching ID
            const index = toolbar.items.findIndex(existing => existing.id === position);
            if (index !== -1) {
                toolbar.items.splice(index + 1, 0, item);
            } else {
                toolbar.items.push(item);
            }
        }
    }

    /**
     * Check for shortcut conflicts
     */
    checkShortcutConflict(shortcut) {
        for (const [id, existing] of this.shortcuts) {
            if (existing.key === shortcut.key &&
                JSON.stringify(existing.modifiers.sort()) === JSON.stringify(shortcut.modifiers.sort()) &&
                existing.global === shortcut.global) {
                return existing;
            }
        }
        return null;
    }

    /**
     * Execute extension action
     */
    async executeExtensionAction(extensionId, ...args) {
        const extension = this.extensions.get(extensionId);
        if (!extension || !extension.enabled) {
            return;
        }

        try {
            if (typeof extension.action === 'function') {
                await extension.action(...args);
            } else if (typeof extension.action === 'string') {
                // Execute action by name
                this.executeNamedAction(extension.action, ...args);
            }

            this.emit('extension-executed', { extensionId, args });

        } catch (error) {
            console.error(`Failed to execute extension action '${extensionId}':`, error);
            this.emit('extension-execution-error', { extensionId, error });
        }
    }

    /**
     * Execute named action
     */
    executeNamedAction(actionName, ...args) {
        // This would integrate with the application's action system
        console.log(`Executing named action: ${actionName}`, args);
    }

    /**
     * Show dialog
     */
    async showDialog(dialogId, options = {}) {
        const dialog = this.dialogs.get(dialogId);
        if (!dialog) {
            throw new Error(`Dialog '${dialogId}' not found`);
        }

        // Create dialog UI
        const dialogElement = this.createDialogUI(dialog, options);

        // Call onOpen callback
        if (dialog.onOpen) {
            await dialog.onOpen(dialogElement, options);
        }

        return dialogElement;
    }

    /**
     * Hide dialog
     */
    async hideDialog(dialogId) {
        const dialog = this.dialogs.get(dialogId);
        if (!dialog) {
            return;
        }

        // Remove dialog from UI
        this.removeDialogUI(dialogId);

        // Call onClose callback
        if (dialog.onClose) {
            await dialog.onClose();
        }
    }

    /**
     * Toggle panel visibility
     */
    togglePanel(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) {
            return;
        }

        panel.visible = !panel.visible;
        this.updatePanelUI(panelId);
    }

    /**
     * Get extension information
     */
    getExtensionInfo(extensionId) {
        return this.extensions.get(extensionId);
    }

    /**
     * Get all extensions for a plugin
     */
    getPluginExtensions(pluginId) {
        return Array.from(this.extensions.values())
            .filter(ext => ext.pluginId === pluginId);
    }

    /**
     * Enable extension
     */
    enableExtension(extensionId) {
        const extension = this.extensions.get(extensionId);
        if (extension) {
            extension.enabled = true;
            this.updateExtensionUI(extension);
        }
    }

    /**
     * Disable extension
     */
    disableExtension(extensionId) {
        const extension = this.extensions.get(extensionId);
        if (extension) {
            extension.enabled = false;
            this.updateExtensionUI(extension);
        }
    }

    /**
     * Unregister extension
     */
    async unregisterExtension(extensionId) {
        const extension = this.extensions.get(extensionId);
        if (!extension) {
            return;
        }

        // Remove from UI components
        await this.removeFromUIComponent(extension);

        // Remove from collections
        this.extensions.delete(extensionId);

        this.emit('extension-unregistered', { extensionId });
    }

    /**
     * Remove extension from UI component
     */
    async removeFromUIComponent(extension) {
        switch (extension.type) {
            case 'menu-item':
                await this.removeMenuItem(extension);
                break;
            case 'toolbar-item':
                await this.removeToolbarItem(extension);
                break;
            case 'panel':
                await this.removePanel(extension);
                break;
            case 'dialog':
                await this.removeDialog(extension);
                break;
            case 'shortcut':
                await this.removeShortcut(extension);
                break;
            case 'context-menu-item':
                await this.removeContextMenuItem(extension);
                break;
        }
    }

    /**
     * Remove menu item
     */
    async removeMenuItem(extension) {
        const menuId = extension.menuId || 'main-menu';
        const menu = this.menus.get(menuId);

        if (menu) {
            menu.items = menu.items.filter(item => item.id !== extension.id);
            this.updateMenuUI(menuId);
        }
    }

    /**
     * Remove toolbar item
     */
    async removeToolbarItem(extension) {
        const toolbarId = extension.toolbarId || 'main-toolbar';
        const toolbar = this.toolbars.get(toolbarId);

        if (toolbar) {
            toolbar.items = toolbar.items.filter(item => item.id !== extension.id);
            this.updateToolbarUI(toolbarId);
        }
    }

    /**
     * Remove panel
     */
    async removePanel(extension) {
        this.panels.delete(extension.id);
        this.removePanelUI(extension.id);
    }

    /**
     * Remove dialog
     */
    async removeDialog(extension) {
        this.dialogs.delete(extension.id);
        this.removeDialogUI(extension.id);
    }

    /**
     * Remove shortcut
     */
    async removeShortcut(extension) {
        this.shortcuts.delete(extension.id);
        this.unregisterShortcutFromKeyboard(extension.id);
    }

    /**
     * Remove context menu item
     */
    async removeContextMenuItem(extension) {
        const menuId = extension.menuId || 'context-menu';
        const menu = this.contextMenus.get(menuId);

        if (menu) {
            menu.items = menu.items.filter(item => item.id !== extension.id);
        }
    }

    /**
     * Validate extension definition
     */
    validateExtensionDefinition(definition) {
        if (!definition.id) throw new Error('Extension ID is required');
        if (!definition.type) throw new Error('Extension type is required');
        if (!definition.pluginId) throw new Error('Plugin ID is required');

        // Type-specific validation
        switch (definition.type) {
            case 'menu-item':
                if (!definition.label) throw new Error('Menu item label is required');
                if (!definition.action) throw new Error('Menu item action is required');
                break;
            case 'toolbar-item':
                if (!definition.action) throw new Error('Toolbar item action is required');
                break;
            case 'panel':
                if (!definition.title) throw new Error('Panel title is required');
                break;
            case 'dialog':
                if (!definition.title) throw new Error('Dialog title is required');
                break;
            case 'shortcut':
                if (!definition.key) throw new Error('Shortcut key is required');
                if (!definition.action) throw new Error('Shortcut action is required');
                break;
        }
    }

    /**
     * Get extension statistics
     */
    getStatistics() {
        return {
            totalExtensions: this.extensions.size,
            menus: this.menus.size,
            toolbars: this.toolbars.size,
            panels: this.panels.size,
            dialogs: this.dialogs.size,
            shortcuts: this.shortcuts.size,
            contextMenus: this.contextMenus.size,
            extensionsByType: this.getExtensionsByType(),
            extensionsByPlugin: this.getExtensionsByPlugin()
        };
    }

    /**
     * Get extensions by type
     */
    getExtensionsByType() {
        const byType = {};
        for (const extension of this.extensions.values()) {
            byType[extension.type] = (byType[extension.type] || 0) + 1;
        }
        return byType;
    }

    /**
     * Get extensions by plugin
     */
    getExtensionsByPlugin() {
        const byPlugin = {};
        for (const extension of this.extensions.values()) {
            byPlugin[extension.pluginId] = (byPlugin[extension.pluginId] || 0) + 1;
        }
        return byPlugin;
    }

    // UI Update Methods (would integrate with actual UI framework)

    updateMenuUI(menuId) {
        // Update menu in UI
        console.log(`Updating menu UI: ${menuId}`);
    }

    updateToolbarUI(toolbarId) {
        // Update toolbar in UI
        console.log(`Updating toolbar UI: ${toolbarId}`);
    }

    createPanelUI(panel) {
        // Create panel in UI
        console.log(`Creating panel UI: ${panel.id}`);
    }

    updatePanelUI(panelId) {
        // Update panel in UI
        console.log(`Updating panel UI: ${panelId}`);
    }

    removePanelUI(panelId) {
        // Remove panel from UI
        console.log(`Removing panel UI: ${panelId}`);
    }

    createDialogUI(dialog, options) {
        // Create dialog in UI
        console.log(`Creating dialog UI: ${dialog.id}`);
        return { id: dialog.id, element: null }; // Mock return
    }

    removeDialogUI(dialogId) {
        // Remove dialog from UI
        console.log(`Removing dialog UI: ${dialogId}`);
    }

    registerShortcutWithKeyboard(shortcut) {
        // Register shortcut with keyboard manager
        console.log(`Registering shortcut: ${shortcut.key}`);
    }

    unregisterShortcutFromKeyboard(shortcutId) {
        // Unregister shortcut from keyboard manager
        console.log(`Unregistering shortcut: ${shortcutId}`);
    }

    updateExtensionUI(extension) {
        // Update extension in UI
        console.log(`Updating extension UI: ${extension.id}`);
    }

    /**
     * Handle plugin loaded event
     */
    handlePluginLoaded(data) {
        // Load plugin's UI extensions
        console.log(`Loading UI extensions for plugin: ${data.pluginId}`);
    }

    /**
     * Handle plugin unloaded event
     */
    handlePluginUnloaded(data) {
        // Remove plugin's UI extensions
        const pluginExtensions = this.getPluginExtensions(data.pluginId);
        for (const extension of pluginExtensions) {
            this.unregisterExtension(extension.id);
        }
    }

    /**
     * Handle UI extension registered event
     */
    handleUIExtensionRegistered(data) {
        // Handle dynamic extension registration
        console.log(`UI extension registered: ${data.extensionId}`);
    }

    /**
     * Emit event
     */
    emit(eventType, data) {
        const event = new CustomEvent(`ui-extension-${eventType}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the UI extension manager
     */
    destroy() {
        // Clean up all extensions
        for (const [id] of this.extensions) {
            this.unregisterExtension(id);
        }

        this.extensions.clear();
        this.menus.clear();
        this.toolbars.clear();
        this.panels.clear();
        this.dialogs.clear();
        this.shortcuts.clear();
        this.contextMenus.clear();

        console.log('UI extension manager destroyed');
    }
}

module.exports = UIExtensionManager;
