/**
 * Accessibility Manager
 * Handles ARIA labels, semantic HTML, screen reader support, and keyboard navigation
 */

const UserPreferences = require('../core/user-preferences');

class AccessibilityManager {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.container = options.container || document.body;
        this.focusableElements = new Set();
        this.ariaLiveRegions = new Map();
        this.keyboardHandlers = new Map();

        this.init();
    }

    /**
     * Initialize accessibility features
     */
    async init() {
        await this.preferences.init();
        this.setupAriaLabels();
        this.setupSemanticHTML();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupHighContrastSupport();

        console.log('Accessibility manager initialized');
    }

    /**
     * Setup ARIA labels and roles
     */
    setupAriaLabels() {
        // Add ARIA labels to major UI elements
        this.addAriaToElement('.generator-list', {
            role: 'listbox',
            'aria-label': 'Asset Generators',
            'aria-describedby': 'generator-description'
        });

        this.addAriaToElement('.generate-button', {
            'aria-label': 'Generate Asset',
            'aria-describedby': 'generate-description'
        });

        this.addAriaToElement('.save-button', {
            'aria-label': 'Save Generated Asset',
            'aria-describedby': 'save-description'
        });

        this.addAriaToElement('.generator-controls', {
            role: 'group',
            'aria-label': 'Generator Parameters'
        });

        this.addAriaToElement('.performance-monitor', {
            role: 'status',
            'aria-label': 'Performance Information',
            'aria-live': 'polite'
        });

        // Add ARIA to form controls
        this.addAriaToFormControls();

        // Add skip links
        this.addSkipLinks();
    }

    /**
     * Add ARIA attributes to form controls
     */
    addAriaToFormControls() {
        // Sliders and inputs
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            const label = this.findLabelForElement(slider);
            if (label) {
                slider.setAttribute('aria-labelledby', label.id);
            }
            slider.setAttribute('aria-valuemin', slider.min || '0');
            slider.setAttribute('aria-valuemax', slider.max || '100');
            slider.setAttribute('aria-valuenow', slider.value);
            slider.setAttribute('aria-valuetext', `${slider.value}%`);

            // Update aria-valuenow on change
            slider.addEventListener('input', () => {
                slider.setAttribute('aria-valuenow', slider.value);
                slider.setAttribute('aria-valuetext', `${slider.value}%`);
            });
        });

        // Color pickers
        const colorPickers = document.querySelectorAll('input[type="color"]');
        colorPickers.forEach(picker => {
            picker.setAttribute('aria-label', 'Choose color');
        });

        // Checkboxes and toggles
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = this.findLabelForElement(checkbox);
            if (label) {
                checkbox.setAttribute('aria-labelledby', label.id);
            }
        });
    }

    /**
     * Add skip links for keyboard navigation
     */
    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#generator-list" class="skip-link">Skip to generators</a>
            <a href="#generator-controls" class="skip-link">Skip to controls</a>
        `;
        skipLinks.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 1000;
        `;

        const style = document.createElement('style');
        style.textContent = `
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--primary-color, #007bff);
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 500;
                z-index: 1000;
                transition: top 0.2s ease;
            }

            .skip-link:focus {
                top: 6px;
            }
        `;
        document.head.appendChild(style);

        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    /**
     * Setup semantic HTML structure
     */
    setupSemanticHTML() {
        // Ensure main content has proper semantic structure
        this.ensureSemanticStructure();

        // Add landmark roles
        this.addLandmarkRoles();

        // Improve heading hierarchy
        this.improveHeadingHierarchy();
    }

    /**
     * Ensure semantic HTML structure
     */
    ensureSemanticStructure() {
        // Add main content wrapper if not exists
        if (!document.querySelector('main')) {
            const main = document.createElement('main');
            main.id = 'main-content';
            main.setAttribute('role', 'main');
            main.setAttribute('aria-label', 'Main Content');

            // Move primary content into main
            const primaryContent = document.querySelector('.app-content, .main-content, #app');
            if (primaryContent) {
                // Wrap existing content
                const content = primaryContent.innerHTML;
                primaryContent.innerHTML = '';
                main.innerHTML = content;
                primaryContent.appendChild(main);
            } else {
                // Create main content area
                main.innerHTML = '<p>Welcome to TPT Asset Editor</p>';
                document.body.appendChild(main);
            }
        }

        // Add header if not exists
        if (!document.querySelector('header')) {
            const header = document.createElement('header');
            header.setAttribute('role', 'banner');
            header.innerHTML = '<h1>TPT Asset Editor</h1>';

            const main = document.querySelector('main');
            if (main) {
                document.body.insertBefore(header, main);
            }
        }

        // Add navigation landmark
        if (!document.querySelector('nav')) {
            const nav = document.createElement('nav');
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Main Navigation');

            const generatorList = document.querySelector('.generator-list');
            if (generatorList) {
                nav.appendChild(generatorList.cloneNode(true));
                document.body.insertBefore(nav, document.querySelector('main'));
            }
        }
    }

    /**
     * Add landmark roles for screen readers
     */
    addLandmarkRoles() {
        // Complementary landmarks
        const sidebars = document.querySelectorAll('.sidebar, .side-panel');
        sidebars.forEach((sidebar, index) => {
            sidebar.setAttribute('role', 'complementary');
            sidebar.setAttribute('aria-label', `Sidebar ${index + 1}`);
        });

        // Status regions
        const statusElements = document.querySelectorAll('.status, .performance-monitor, .progress');
        statusElements.forEach(element => {
            element.setAttribute('role', 'status');
            element.setAttribute('aria-live', 'polite');
            element.setAttribute('aria-atomic', 'true');
        });

        // Alert regions
        const alertElements = document.querySelectorAll('.error, .warning, .notification');
        alertElements.forEach(element => {
            element.setAttribute('role', 'alert');
            element.setAttribute('aria-live', 'assertive');
        });
    }

    /**
     * Improve heading hierarchy
     */
    improveHeadingHierarchy() {
        // Ensure proper heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

        headings.forEach((heading, index) => {
            // Add unique IDs for anchor links
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }

            // Ensure proper hierarchy (no skipping levels)
            const level = parseInt(heading.tagName.charAt(1));
            const prevHeading = headings[index - 1];
            if (prevHeading) {
                const prevLevel = parseInt(prevHeading.tagName.charAt(1));
                if (level > prevLevel + 1) {
                    // Fix hierarchy by adjusting level
                    const newLevel = Math.min(prevLevel + 1, 6);
                    const newTag = `h${newLevel}`;
                    const newHeading = document.createElement(newTag);
                    newHeading.innerHTML = heading.innerHTML;
                    newHeading.className = heading.className;
                    newHeading.id = heading.id;
                    heading.parentNode.replaceChild(newHeading, heading);
                }
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Tab order management
        this.setupTabOrder();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Focus trapping for modals
        this.setupFocusTrapping();

        // Custom keyboard navigation
        this.setupCustomNavigation();
    }

    /**
     * Setup logical tab order
     */
    setupTabOrder() {
        // Ensure logical tab order
        const focusableElements = this.getFocusableElements();

        focusableElements.forEach((element, index) => {
            element.setAttribute('tabindex', '0');

            // Add visual focus indicators
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid var(--primary-color, #007bff)';
                element.style.outlineOffset = '2px';
            });

            element.addEventListener('blur', () => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        });

        this.focusableElements = new Set(focusableElements);
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        const shortcuts = {
            'g': () => this.focusElement('.generate-button'), // Generate
            's': () => this.focusElement('.save-button'), // Save
            'o': () => this.focusElement('.open-button'), // Open
            'h': () => this.showKeyboardHelp(), // Help
            '?': () => this.showKeyboardHelp(), // Help (alternative)
            'Escape': () => this.handleEscape(), // Close modals
            'Tab': (e) => this.handleTabNavigation(e), // Tab navigation
            'ArrowUp': (e) => this.handleArrowNavigation(e, -1), // Up arrow
            'ArrowDown': (e) => this.handleArrowNavigation(e, 1), // Down arrow
            'ArrowLeft': (e) => this.handleArrowNavigation(e, -1), // Left arrow
            'ArrowRight': (e) => this.handleArrowNavigation(e, 1), // Right arrow
        };

        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
                return;
            }

            const shortcut = shortcuts[e.key];
            if (shortcut) {
                e.preventDefault();
                shortcut(e);
            }
        });
    }

    /**
     * Setup focus trapping for modals
     */
    setupFocusTrapping() {
        // Focus trap for modal dialogs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal, .dialog, [role="dialog"]');
                if (modal) {
                    this.trapFocusInModal(modal, e);
                }
            }
        });
    }

    /**
     * Trap focus within modal
     */
    trapFocusInModal(modal, event) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Setup custom navigation patterns
     */
    setupCustomNavigation() {
        // Generator list navigation
        const generatorList = document.querySelector('.generator-list');
        if (generatorList) {
            generatorList.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const generator = e.target.closest('.generator-item');
                    if (generator) {
                        generator.click();
                    }
                }
            });
        }

        // Parameter controls navigation
        const parameterControls = document.querySelectorAll('.parameter-control');
        parameterControls.forEach(control => {
            control.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const input = control.querySelector('input, select');
                    if (input) {
                        input.focus();
                    }
                }
            });
        });
    }

    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Announce dynamic content changes
        this.setupAriaLiveRegions();

        // Provide context for complex interactions
        this.setupContextualAnnouncements();

        // Screen reader specific enhancements
        this.setupScreenReaderEnhancements();
    }

    /**
     * Setup ARIA live regions for dynamic content
     */
    setupAriaLiveRegions() {
        // Generation progress
        const progressRegion = document.createElement('div');
        progressRegion.id = 'generation-progress';
        progressRegion.setAttribute('aria-live', 'polite');
        progressRegion.setAttribute('aria-atomic', 'true');
        progressRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(progressRegion);
        this.ariaLiveRegions.set('progress', progressRegion);

        // Status updates
        const statusRegion = document.createElement('div');
        statusRegion.id = 'status-updates';
        statusRegion.setAttribute('aria-live', 'polite');
        statusRegion.setAttribute('aria-atomic', 'true');
        statusRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(statusRegion);
        this.ariaLiveRegions.set('status', statusRegion);

        // Error announcements
        const errorRegion = document.createElement('div');
        errorRegion.id = 'error-announcements';
        errorRegion.setAttribute('aria-live', 'assertive');
        errorRegion.setAttribute('aria-atomic', 'true');
        errorRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(errorRegion);
        this.ariaLiveRegions.set('error', errorRegion);
    }

    /**
     * Setup contextual announcements
     */
    setupContextualAnnouncements() {
        // Announce generation start
        document.addEventListener('generation-start', () => {
            this.announce('Generation started', 'status');
        });

        // Announce generation completion
        document.addEventListener('generation-complete', (e) => {
            const count = e.detail?.count || 1;
            this.announce(`Generation completed. ${count} asset${count > 1 ? 's' : ''} created.`, 'status');
        });

        // Announce errors
        document.addEventListener('generation-error', (e) => {
            this.announce(`Generation failed: ${e.detail?.message || 'Unknown error'}`, 'error');
        });

        // Announce saves
        document.addEventListener('asset-saved', () => {
            this.announce('Asset saved successfully', 'status');
        });
    }

    /**
     * Setup screen reader enhancements
     */
    setupScreenReaderEnhancements() {
        // Add descriptive text for complex elements
        this.addDescriptiveText();

        // Improve form labels
        this.improveFormLabels();

        // Add instructions for complex interactions
        this.addInteractionInstructions();
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Manage focus on modal open/close
        this.setupModalFocusManagement();

        // Restore focus after operations
        this.setupFocusRestoration();

        // Focus management for dynamic content
        this.setupDynamicContentFocus();
    }

    /**
     * Setup modal focus management
     */
    setupModalFocusManagement() {
        // Focus first focusable element when modal opens
        document.addEventListener('modal-open', (e) => {
            const modal = e.detail?.modal;
            if (modal) {
                setTimeout(() => {
                    const firstFocusable = modal.querySelector(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    if (firstFocusable) {
                        firstFocusable.focus();
                    }
                }, 100);
            }
        });

        // Restore focus when modal closes
        document.addEventListener('modal-close', (e) => {
            const previousFocus = e.detail?.previousFocus;
            if (previousFocus) {
                previousFocus.focus();
            }
        });
    }

    /**
     * Setup high contrast support
     */
    setupHighContrastSupport() {
        const highContrast = this.preferences.get('highContrast', false);

        if (highContrast) {
            this.enableHighContrast();
        }

        // Listen for high contrast preference changes
        this.preferences.on('changed', ({ key, newValue }) => {
            if (key === 'highContrast') {
                if (newValue) {
                    this.enableHighContrast();
                } else {
                    this.disableHighContrast();
                }
            }
        });
    }

    /**
     * Enable high contrast mode
     */
    enableHighContrast() {
        const style = document.createElement('style');
        style.id = 'high-contrast-styles';
        style.textContent = `
            :root {
                --bg-color: #000000;
                --text-color: #ffffff;
                --border-color: #ffffff;
                --primary-color: #ffff00;
                --hover-color: #ffff00;
                --secondary-bg: #333333;
            }

            * {
                border-color: var(--border-color) !important;
            }

            button, input, select, textarea {
                border: 2px solid var(--border-color) !important;
                background: var(--bg-color) !important;
                color: var(--text-color) !important;
            }

            button:focus, input:focus, select:focus, textarea:focus {
                outline: 3px solid var(--primary-color) !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Disable high contrast mode
     */
    disableHighContrast() {
        const style = document.querySelector('#high-contrast-styles');
        if (style) {
            style.remove();
        }
    }

    /**
     * Helper methods
     */

    /**
     * Add ARIA attributes to element
     */
    addAriaToElement(selector, attributes) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        });
    }

    /**
     * Find label for form element
     */
    findLabelForElement(element) {
        // Check for explicit label
        const id = element.id;
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) return label;
        }

        // Check for wrapping label
        let parent = element.parentElement;
        while (parent) {
            if (parent.tagName === 'LABEL') {
                return parent;
            }
            parent = parent.parentElement;
        }

        return null;
    }

    /**
     * Get all focusable elements
     */
    getFocusableElements() {
        return document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
    }

    /**
     * Focus element by selector
     */
    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
        }
    }

    /**
     * Handle escape key
     */
    handleEscape() {
        // Close modals, cancel operations, etc.
        const modal = document.querySelector('.modal, .dialog, [role="dialog"]');
        if (modal) {
            const closeButton = modal.querySelector('.close, [aria-label="Close"]');
            if (closeButton) {
                closeButton.click();
            }
        }
    }

    /**
     * Handle tab navigation
     */
    handleTabNavigation(event) {
        // Custom tab navigation logic if needed
        // For now, let browser handle default tab navigation
    }

    /**
     * Handle arrow navigation
     */
    handleArrowNavigation(event, direction) {
        // Custom arrow navigation for lists, menus, etc.
        const target = event.target;

        // Generator list navigation
        if (target.closest('.generator-list')) {
            event.preventDefault();
            const items = Array.from(target.closest('.generator-list').querySelectorAll('.generator-item'));
            const currentIndex = items.indexOf(target.closest('.generator-item'));

            if (currentIndex !== -1) {
                const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
                items[nextIndex].focus();
            }
        }
    }

    /**
     * Show keyboard help
     */
    showKeyboardHelp() {
        const helpContent = `
            <h3>Keyboard Shortcuts</h3>
            <ul>
                <li><kbd>G</kbd> - Generate asset</li>
                <li><kbd>S</kbd> - Save asset</li>
                <li><kbd>O</kbd> - Open file</li>
                <li><kbd>H</kbd> or <kbd>?</kbd> - Show this help</li>
                <li><kbd>Esc</kbd> - Close modals</li>
                <li><kbd>Tab</kbd> - Navigate between elements</li>
                <li><kbd>Arrow Keys</kbd> - Navigate lists and menus</li>
            </ul>
        `;

        this.showHelpModal('Keyboard Shortcuts', helpContent);
    }

    /**
     * Show help modal
     */
    showHelpModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'accessibility-help-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-color, #ffffff);
            border: 2px solid var(--primary-color, #007bff);
            border-radius: 8px;
            padding: 20px;
            max-width: 400px;
            z-index: 10001;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: var(--text-color, #1a1a1a);">${title}</h3>
                <button class="close-help" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
            </div>
            <div>${content}</div>
        `;

        modal.querySelector('.close-help').addEventListener('click', () => modal.remove());

        document.body.appendChild(modal);

        // Focus management
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'help-title');

        setTimeout(() => modal.focus(), 100);
    }

    /**
     * Announce message to screen readers
     */
    announce(message, region = 'status') {
        const liveRegion = this.ariaLiveRegions.get(region);
        if (liveRegion) {
            liveRegion.textContent = message;

            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Add descriptive text for complex elements
     */
    addDescriptiveText() {
        // Add descriptions for complex UI elements
        const descriptions = {
            'generator-description': 'List of available asset generators. Use arrow keys to navigate and Enter to select.',
            'generate-description': 'Click to generate a new asset based on current parameters.',
            'save-description': 'Save the generated asset to your computer.'
        };

        Object.entries(descriptions).forEach(([id, text]) => {
            const desc = document.createElement('div');
            desc.id = id;
            desc.textContent = text;
            desc.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(desc);
        });
    }

    /**
     * Improve form labels
     */
    improveFormLabels() {
        // Ensure all form controls have proper labels
        const formControls = document.querySelectorAll('input, select, textarea');
        formControls.forEach(control => {
            if (!control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby')) {
                const label = this.findLabelForElement(control);
                if (!label) {
                    // Create a label if none exists
                    const placeholder = control.getAttribute('placeholder');
                    if (placeholder) {
                        control.setAttribute('aria-label', placeholder);
                    }
                }
            }
        });
    }

    /**
     * Add interaction instructions
     */
    addInteractionInstructions() {
        // Add instructions for complex interactions
        const instructions = {
            '.generator-list': 'Use arrow keys to navigate generators, Enter to select.',
            '.parameter-control input[type="range"]': 'Use arrow keys or drag to adjust value.',
            '.color-picker': 'Click to open color picker, or press Enter to edit hex value.'
        };

        Object.entries(instructions).forEach(([selector, instruction]) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.setAttribute('aria-describedby', `${selector.replace(/[.#]/g, '')}-instruction`);

                const desc = document.createElement('div');
                desc.id = `${selector.replace(/[.#]/g, '')}-instruction`;
                desc.textContent = instruction;
                desc.style.cssText = `
                    position: absolute;
                    left: -10000px;
                    width: 1px;
                    height: 1px;
                    overflow: hidden;
                `;
                document.body.appendChild(desc);
            });
        });
    }

    /**
     * Setup focus restoration
     */
    setupFocusRestoration() {
        // Store focus before operations that might change it
        document.addEventListener('operation-start', (e) => {
            e.detail.previousFocus = document.activeElement;
        });

        // Restore focus after operations
        document.addEventListener('operation-complete', (e) => {
            const previousFocus = e.detail?.previousFocus;
            if (previousFocus && previousFocus.focus) {
                setTimeout(() => previousFocus.focus(), 100);
            }
        });
    }

    /**
     * Setup dynamic content focus
     */
    setupDynamicContentFocus() {
        // Focus newly added content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const focusable = node.querySelector('button, [href], input, select, textarea');
                        if (focusable && this.shouldAutoFocus(node)) {
                            setTimeout(() => focusable.focus(), 100);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Check if element should be auto-focused
     */
    shouldAutoFocus(element) {
        // Auto-focus notifications, modals, and important updates
        return element.classList.contains('notification') ||
               element.classList.contains('modal') ||
               element.classList.contains('alert') ||
               element.getAttribute('role') === 'alert';
    }

    /**
     * Destroy accessibility manager
     */
    destroy() {
        // Remove added elements
        const addedElements = document.querySelectorAll('.skip-links, [id*="instruction"], [id*="description"]');
        addedElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        // Remove styles
        const styles = document.querySelectorAll('#high-contrast-styles');
        styles.forEach(style => style.remove());

        // Clear collections
        this.focusableElements.clear();
        this.ariaLiveRegions.clear();
        this.keyboardHandlers.clear();

        console.log('Accessibility manager destroyed');
    }
}

module.exports = AccessibilityManager;
