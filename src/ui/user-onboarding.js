/**
 * User Onboarding System
 * Provides comprehensive onboarding experience with feature discovery
 */

const UserPreferences = require('../core/user-preferences');
const FeatureGate = require('../core/feature-gate');
const GuidedWorkflow = require('./guided-workflow');

class UserOnboarding {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.featureGate = options.featureGate || new FeatureGate();
        this.guidedWorkflow = options.guidedWorkflow || new GuidedWorkflow();
        this.container = options.container || document.body;

        this.onboardingSteps = [];
        this.currentStep = 0;
        this.isActive = false;
        this.discoveryQueue = new Map();

        this.init();
    }

    /**
     * Initialize the onboarding system
     */
    async init() {
        await this.preferences.init();
        await this.featureGate.init();
        await this.guidedWorkflow.init();

        this.defineOnboardingFlow();
        this.setupEventListeners();

        // Check if onboarding should start
        if (this.shouldStartOnboarding()) {
            this.startOnboarding();
        }

        console.log('User onboarding system initialized');
    }

    /**
     * Define the complete onboarding flow
     */
    defineOnboardingFlow() {
        this.onboardingSteps = [
            {
                id: 'welcome',
                title: 'Welcome to TPT Asset Editor!',
                content: 'Let\'s get you started with creating amazing game assets. This quick tour will show you the basics.',
                type: 'modal',
                action: 'continue',
                canSkip: false
            },
            {
                id: 'experience-level',
                title: 'Choose Your Experience Level',
                content: 'Select the option that best describes your experience level. This helps us customize your experience.',
                type: 'interactive',
                target: '.experience-level-selector',
                action: 'select-level',
                canSkip: false
            },
            {
                id: 'first-generator',
                title: 'Your First Generator',
                content: 'Click on any generator to start creating assets. Try the Character generator to make a game character!',
                type: 'highlight',
                target: '.generator-list',
                action: 'click-generator',
                canSkip: true,
                timeout: 10000
            },
            {
                id: 'basic-generation',
                title: 'Generate Your First Asset',
                content: 'Now click the Generate button to create your asset. It\'s that simple!',
                type: 'highlight',
                target: '.generate-button',
                action: 'click-generate',
                canSkip: true,
                timeout: 15000
            },
            {
                id: 'save-asset',
                title: 'Save Your Creation',
                content: 'Great! Now let\'s save your asset. Click the Save button to keep your work.',
                type: 'highlight',
                target: '.save-button',
                action: 'click-save',
                canSkip: true,
                timeout: 10000
            },
            {
                id: 'feature-discovery',
                title: 'Discover More Features',
                content: 'You\'ve completed the basics! As you use the app, you\'ll unlock more advanced features.',
                type: 'modal',
                action: 'explore',
                canSkip: false
            }
        ];
    }

    /**
     * Setup event listeners for onboarding flow
     */
    setupEventListeners() {
        // Listen for user actions
        document.addEventListener('generator-selected', (e) => {
            this.handleStepCompletion('first-generator');
        });

        document.addEventListener('generation-complete', (e) => {
            this.handleStepCompletion('basic-generation');
        });

        document.addEventListener('asset-saved', (e) => {
            this.handleStepCompletion('save-asset');
        });

        // Listen for experience level changes
        this.preferences.on('experience-level-changed', ({ newLevel }) => {
            this.handleExperienceLevelChange(newLevel);
        });

        // Listen for feature unlocks
        document.addEventListener('feature-gate-feature-unlocked', (e) => {
            this.handleFeatureUnlock(e.detail);
        });

        // Listen for workflow completions
        document.addEventListener('workflow-completed', (e) => {
            this.handleWorkflowCompletion(e.detail);
        });
    }

    /**
     * Check if onboarding should start
     */
    shouldStartOnboarding() {
        const onboardingCompleted = this.preferences.get('onboardingCompleted', false);
        const onboardingSkipped = this.preferences.get('onboardingSkipped', false);
        const appLaunches = this.preferences.get('appLaunches', 0);

        // Don't start if already completed or skipped
        if (onboardingCompleted || onboardingSkipped) {
            return false;
        }

        // Start on first launch or if very few launches
        return appLaunches <= 2;
    }

    /**
     * Start the onboarding flow
     */
    async startOnboarding() {
        if (this.isActive) return;

        this.isActive = true;
        this.currentStep = 0;

        // Increment app launch counter
        const launches = this.preferences.get('appLaunches', 0);
        this.preferences.set('appLaunches', launches + 1);

        // Start with welcome modal
        this.showOnboardingStep(0);
    }

    /**
     * Show onboarding step
     */
    showOnboardingStep(stepIndex) {
        if (stepIndex >= this.onboardingSteps.length) {
            this.completeOnboarding();
            return;
        }

        const step = this.onboardingSteps[stepIndex];
        this.currentStep = stepIndex;

        switch (step.type) {
            case 'modal':
                this.showModalStep(step);
                break;
            case 'highlight':
                this.showHighlightStep(step);
                break;
            case 'interactive':
                this.showInteractiveStep(step);
                break;
        }
    }

    /**
     * Show modal step
     */
    showModalStep(step) {
        const overlay = document.createElement('div');
        overlay.className = 'onboarding-overlay';
        overlay.style.cssText = `
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

        const modal = document.createElement('div');
        modal.className = 'onboarding-modal';
        modal.style.cssText = `
            background: var(--bg-color, #ffffff);
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            max-width: 500px;
            width: 90%;
            padding: 40px;
            text-align: center;
            position: relative;
            animation: modal-appear 0.4s ease;
        `;

        // Progress indicator
        const progress = document.createElement('div');
        progress.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--border-color, #e1e5e9);
            border-radius: 16px 16px 0 0;
        `;

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            height: 100%;
            background: var(--primary-color, #007bff);
            border-radius: 16px 16px 0 0;
            width: ${((this.currentStep + 1) / this.onboardingSteps.length) * 100}%;
            transition: width 0.3s ease;
        `;

        progress.appendChild(progressBar);

        // Content
        const title = document.createElement('h2');
        title.textContent = step.title;
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 28px;
            font-weight: 700;
            color: var(--text-color, #1a1a1a);
        `;

        const content = document.createElement('p');
        content.textContent = step.content;
        content.style.cssText = `
            margin: 0 0 32px 0;
            font-size: 16px;
            color: var(--text-secondary, #666);
            line-height: 1.6;
        `;

        // Action buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: center;
        `;

        const actionButton = this.createOnboardingButton(
            step.action === 'continue' ? 'Continue' : 'Get Started',
            'primary',
            () => this.nextStep()
        );

        buttonContainer.appendChild(actionButton);

        if (step.canSkip) {
            const skipButton = this.createOnboardingButton(
                'Skip Tour',
                'secondary',
                () => this.skipOnboarding()
            );
            buttonContainer.appendChild(skipButton);
        }

        modal.appendChild(progress);
        modal.appendChild(title);
        modal.appendChild(content);
        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modal-appear {
                from { opacity: 0; transform: scale(0.9) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
        `;
        document.head.appendChild(style);

        this.container.appendChild(overlay);
        this.currentOverlay = overlay;
    }

    /**
     * Show highlight step
     */
    showHighlightStep(step) {
        const target = document.querySelector(step.target);
        if (!target) {
            // Skip if target not found
            this.nextStep();
            return;
        }

        // Create highlight overlay
        const overlay = document.createElement('div');
        overlay.className = 'onboarding-highlight-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            pointer-events: none;
        `;

        // Create highlight hole
        const targetRect = target.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'onboarding-highlight';
        highlight.style.cssText = `
            position: absolute;
            top: ${targetRect.top - 8}px;
            left: ${targetRect.left - 8}px;
            width: ${targetRect.width + 16}px;
            height: ${targetRect.height + 16}px;
            background: var(--primary-color, #007bff);
            border-radius: 8px;
            box-shadow: 0 0 0 4px var(--primary-color, #007bff), 0 0 0 9999px rgba(0, 0, 0, 0.7);
            animation: highlight-pulse 2s infinite;
            pointer-events: none;
        `;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'onboarding-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: var(--bg-color, #ffffff);
            border: 2px solid var(--primary-color, #007bff);
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            padding: 16px 20px;
            max-width: 280px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            pointer-events: all;
        `;

        // Position tooltip
        this.positionTooltip(tooltip, targetRect, step);

        const title = document.createElement('div');
        title.textContent = step.title;
        title.style.cssText = `
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
            margin-bottom: 8px;
            font-size: 16px;
        `;

        const content = document.createElement('div');
        content.textContent = step.content;
        content.style.cssText = `
            color: var(--text-color, #1a1a1a);
            margin-bottom: 12px;
            line-height: 1.5;
        `;

        const nextButton = this.createOnboardingButton('Next', 'primary', () => this.nextStep());
        nextButton.style.cssText += `
            font-size: 14px;
            padding: 8px 16px;
        `;

        tooltip.appendChild(title);
        tooltip.appendChild(content);
        tooltip.appendChild(nextButton);

        overlay.appendChild(highlight);
        overlay.appendChild(tooltip);
        this.container.appendChild(overlay);

        this.currentOverlay = overlay;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes highlight-pulse {
                0%, 100% { opacity: 0.8; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.02); }
            }
        `;
        document.head.appendChild(style);

        // Set up timeout if specified
        if (step.timeout) {
            this.stepTimeout = setTimeout(() => {
                this.nextStep();
            }, step.timeout);
        }
    }

    /**
     * Show interactive step
     */
    showInteractiveStep(step) {
        // For experience level selection, show the preferences UI
        const preferencesUI = new (require('./preferences-ui'))();
        preferencesUI.show();

        // Listen for experience level selection
        document.addEventListener('experience-level-changed', () => {
            this.nextStep();
        }, { once: true });
    }

    /**
     * Position tooltip relative to target
     */
    positionTooltip(tooltip, targetRect, step) {
        const tooltipRect = tooltip.getBoundingClientRect();
        let top, left;

        // Try to position below first
        top = targetRect.bottom + 16;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

        // If it doesn't fit below, try above
        if (top + tooltipRect.height > window.innerHeight - 16) {
            top = targetRect.top - tooltipRect.height - 16;
        }

        // Ensure it stays within viewport
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
    }

    /**
     * Create onboarding button
     */
    createOnboardingButton(text, variant, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `onboarding-button ${variant}`;
        button.style.cssText = `
            padding: 12px 24px;
            border: 1px solid ${variant === 'primary' ? 'var(--primary-color, #007bff)' : 'var(--border-color, #ced4da)'};
            border-radius: 8px;
            background: ${variant === 'primary' ? 'var(--primary-color, #007bff)' : 'var(--bg-color, #ffffff)'};
            color: ${variant === 'primary' ? 'white' : 'var(--text-color, #1a1a1a)'};
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.opacity = '0.8';
            button.style.transform = 'translateY(-1px)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        });

        button.addEventListener('click', onClick);

        return button;
    }

    /**
     * Handle step completion
     */
    handleStepCompletion(stepId) {
        const stepIndex = this.onboardingSteps.findIndex(step => step.id === stepId);
        if (stepIndex === this.currentStep) {
            // Clear timeout if it exists
            if (this.stepTimeout) {
                clearTimeout(this.stepTimeout);
                this.stepTimeout = null;
            }

            this.nextStep();
        }
    }

    /**
     * Move to next step
     */
    nextStep() {
        // Clean up current step
        this.cleanupCurrentStep();

        // Move to next step
        this.showOnboardingStep(this.currentStep + 1);
    }

    /**
     * Skip onboarding
     */
    skipOnboarding() {
        this.preferences.set('onboardingSkipped', true);
        this.endOnboarding();
    }

    /**
     * Complete onboarding
     */
    completeOnboarding() {
        this.preferences.set('onboardingCompleted', true);
        this.endOnboarding();

        // Show completion message
        this.showCompletionMessage();
    }

    /**
     * End onboarding
     */
    endOnboarding() {
        this.cleanupCurrentStep();
        this.isActive = false;

        // Start feature discovery
        this.startFeatureDiscovery();
    }

    /**
     * Clean up current step
     */
    cleanupCurrentStep() {
        if (this.currentOverlay) {
            if (this.currentOverlay.parentNode) {
                this.currentOverlay.parentNode.removeChild(this.currentOverlay);
            }
            this.currentOverlay = null;
        }

        if (this.stepTimeout) {
            clearTimeout(this.stepTimeout);
            this.stepTimeout = null;
        }
    }

    /**
     * Show completion message
     */
    showCompletionMessage() {
        const notification = document.createElement('div');
        notification.className = 'onboarding-completion';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideUp 0.5s ease;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <div style="font-size: 24px; margin-right: 12px;">🎉</div>
                <div style="font-weight: 600; font-size: 16px;">Welcome Aboard!</div>
            </div>
            <div style="opacity: 0.9; line-height: 1.4;">
                You've completed the onboarding tour! As you use the app, you'll unlock more features and capabilities.
            </div>
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 8000);
    }

    /**
     * Start feature discovery system
     */
    startFeatureDiscovery() {
        // Set up feature discovery triggers
        this.setupFeatureDiscovery();

        // Show initial feature suggestions
        setTimeout(() => {
            this.showFeatureSuggestions();
        }, 30000); // Show after 30 seconds of usage
    }

    /**
     * Setup feature discovery triggers
     */
    setupFeatureDiscovery() {
        // Discover batch processing after multiple generations
        document.addEventListener('generation-complete', () => {
            const stats = this.featureGate.getUserStats();
            if (stats.totalGenerations >= 5 && !this.featureGate.isUnlocked('batch-processing')) {
                this.queueFeatureDiscovery('batch-processing', {
                    title: 'Try Batch Processing',
                    message: 'Generate multiple assets at once to save time!',
                    icon: '🔄'
                });
            }
        });

        // Discover presets after many parameter changes
        document.addEventListener('parameters-changed', () => {
            // This would need to be implemented to track parameter changes
            if (!this.featureGate.isUnlocked('preset-management')) {
                this.queueFeatureDiscovery('preset-management', {
                    title: 'Save Your Settings',
                    message: 'Save your favorite parameter combinations as presets!',
                    icon: '💾'
                });
            }
        });

        // Discover performance tools after slow generations
        document.addEventListener('generation-slow', () => {
            if (!this.featureGate.isUnlocked('performance-optimization')) {
                this.queueFeatureDiscovery('performance-optimization', {
                    title: 'Optimize Performance',
                    message: 'Learn how to speed up your asset generation!',
                    icon: '⚡'
                });
            }
        });
    }

    /**
     * Queue feature discovery
     */
    queueFeatureDiscovery(featureId, discovery) {
        if (!this.discoveryQueue.has(featureId)) {
            this.discoveryQueue.set(featureId, {
                ...discovery,
                featureId,
                queuedAt: Date.now()
            });

            // Show discovery after a delay
            setTimeout(() => {
                this.showFeatureDiscovery(featureId);
            }, 5000);
        }
    }

    /**
     * Show feature discovery
     */
    showFeatureDiscovery(featureId) {
        const discovery = this.discoveryQueue.get(featureId);
        if (!discovery) return;

        const notification = document.createElement('div');
        notification.className = 'feature-discovery';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--bg-color, #ffffff);
            border: 2px solid var(--primary-color, #007bff);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            padding: 20px;
            z-index: 10000;
            max-width: 320px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInLeft 0.5s ease;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="font-size: 32px; line-height: 1;">${discovery.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-color, #1a1a1a); margin-bottom: 6px;">
                        ${discovery.title}
                    </div>
                    <div style="color: var(--text-secondary, #666); line-height: 1.4; margin-bottom: 12px;">
                        ${discovery.message}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="discovery-learn" style="
                            padding: 6px 12px;
                            background: var(--primary-color, #007bff);
                            color: white;
                            border: none;
                            border-radius: 4px;
                            font-size: 12px;
                            cursor: pointer;
                        ">Learn More</button>
                        <button class="discovery-dismiss" style="
                            padding: 6px 12px;
                            background: none;
                            color: var(--text-secondary, #666);
                            border: 1px solid var(--border-color, #ced4da);
                            border-radius: 4px;
                            font-size: 12px;
                            cursor: pointer;
                        ">Later</button>
                    </div>
                </div>
                <button class="discovery-close" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: var(--text-secondary, #666);
                    padding: 0;
                ">×</button>
            </div>
        `;

        // Add event listeners
        const learnButton = notification.querySelector('.discovery-learn');
        const dismissButton = notification.querySelector('.discovery-dismiss');
        const closeButton = notification.querySelector('.discovery-close');

        const dismiss = () => {
            notification.remove();
            this.discoveryQueue.delete(featureId);
        };

        learnButton.addEventListener('click', () => {
            this.showFeatureTutorial(featureId);
            dismiss();
        });

        dismissButton.addEventListener('click', dismiss);
        closeButton.addEventListener('click', dismiss);

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-dismiss after 30 seconds
        setTimeout(dismiss, 30000);
    }

    /**
     * Show feature tutorial
     */
    showFeatureTutorial(featureId) {
        // Start appropriate workflow or show help
        switch (featureId) {
            case 'batch-processing':
                this.guidedWorkflow.startWorkflow('performance-tips');
                break;
            case 'preset-management':
                // Show preset management tutorial
                this.showPresetTutorial();
                break;
            case 'performance-optimization':
                this.guidedWorkflow.startWorkflow('performance-tips');
                break;
            default:
                // Show general help
                const help = new (require('./contextual-help'))();
                help.showDetailedHelp(featureId);
        }
    }

    /**
     * Show preset tutorial
     */
    showPresetTutorial() {
        // Create a simple tutorial for presets
        const tutorial = document.createElement('div');
        tutorial.className = 'preset-tutorial';
        tutorial.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-color, #ffffff);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 32px;
            z-index: 10001;
            max-width: 400px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        tutorial.innerHTML = `
            <h3 style="margin: 0 0 16px 0; color: var(--text-color, #1a1a1a);">Save Your Settings</h3>
            <p style="margin: 0 0 24px 0; color: var(--text-secondary, #666); line-height: 1.5;">
                You can save your current parameter settings as a preset for easy reuse later.
            </p>
            <button class="tutorial-got-it" style="
                padding: 10px 20px;
                background: var(--primary-color, #007bff);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
            ">Got It!</button>
        `;

        tutorial.querySelector('.tutorial-got-it').addEventListener('click', () => {
            tutorial.remove();
        });

        document.body.appendChild(tutorial);
    }

    /**
     * Show feature suggestions
     */
    showFeatureSuggestions() {
        const recommendations = this.featureGate.getRecommendations();

        if (recommendations.length > 0) {
            const suggestion = recommendations[0];

            this.queueFeatureDiscovery(suggestion.featureId, {
                title: `Try ${suggestion.name}`,
                message: suggestion.description,
                icon: '💡'
            });
        }
    }

    /**
     * Handle experience level change
     */
    handleExperienceLevelChange(newLevel) {
        // Adjust onboarding based on experience level
        if (newLevel === 'advanced') {
            // Skip basic steps for advanced users
            this.currentStep = Math.max(this.currentStep, 2);
        }
    }

    /**
     * Handle feature unlock
     */
    handleFeatureUnlock(detail) {
        // Show congratulations for major feature unlocks
        if (['batch-processing', 'custom-generators', 'ai-enhancement'].includes(detail.featureId)) {
            this.showFeatureUnlockCelebration(detail.gate);
        }
    }

    /**
     * Show feature unlock celebration
     */
    showFeatureUnlockCelebration(gate) {
        const celebration = document.createElement('div');
        celebration.className = 'feature-celebration';
        celebration.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: fadeIn 0.5s ease;
        `;

        celebration.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                max-width: 400px;
                animation: scaleIn 0.6s ease;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h2 style="margin: 0 0 16px 0; font-size: 28px;">New Feature Unlocked!</h2>
                <h3 style="margin: 0 0 12px 0; font-size: 20px;">${gate.name}</h3>
                <p style="margin: 0; opacity: 0.9; line-height: 1.5;">${gate.description}</p>
            </div>
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(celebration);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 4000);
    }

    /**
     * Handle workflow completion
     */
    handleWorkflowCompletion(detail) {
        if (detail.completed) {
            // Could trigger additional onboarding or feature suggestions
            console.log(`Workflow completed: ${detail.workflowId}`);
        }
    }

    /**
     * Get onboarding progress
     */
    getProgress() {
        return {
            isActive: this.isActive,
            currentStep: this.currentStep,
            totalSteps: this.onboardingSteps.length,
            completed: this.preferences.get('onboardingCompleted', false),
            skipped: this.preferences.get('onboardingSkipped', false)
        };
    }

    /**
     * Reset onboarding (for testing)
     */
    resetOnboarding() {
        this.preferences.set('onboardingCompleted', false);
        this.preferences.set('onboardingSkipped', false);
        this.preferences.set('appLaunches', 0);
        this.currentStep = 0;
        this.isActive = false;
    }

    /**
     * Destroy the onboarding system
     */
    destroy() {
        this.cleanupCurrentStep();
        this.discoveryQueue.clear();

        console.log('User onboarding system destroyed');
    }
}

module.exports = UserOnboarding;
