/**
 * Guided Workflow System
 * Interactive tutorials and step-by-step guidance for users
 */

const UserPreferences = require('../core/user-preferences');

class GuidedWorkflow {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.preferences = options.preferences || new UserPreferences();
        this.currentWorkflow = null;
        this.currentStep = 0;
        this.isActive = false;

        this.workflows = new Map();
        this.eventListeners = new Map();

        this.init();
    }

    /**
     * Initialize the guided workflow system
     */
    async init() {
        await this.preferences.init();
        this.registerDefaultWorkflows();
        this.setupEventListeners();

        console.log('Guided workflow system initialized');
    }

    /**
     * Register default workflows
     */
    registerDefaultWorkflows() {
        // First-time user onboarding
        this.registerWorkflow('welcome', {
            title: 'Welcome to TPT Asset Editor',
            description: 'Get started with your first asset generation',
            steps: [
                {
                    title: 'Choose a Generator',
                    content: 'Select a generator from the sidebar to create your first asset.',
                    target: '.generator-list',
                    position: 'right',
                    action: 'highlight',
                    waitFor: 'generator-selected'
                },
                {
                    title: 'Configure Parameters',
                    content: 'Adjust the settings to customize your asset generation.',
                    target: '.generator-controls',
                    position: 'top',
                    action: 'highlight',
                    waitFor: 'parameters-changed'
                },
                {
                    title: 'Generate Asset',
                    content: 'Click the generate button to create your asset.',
                    target: '.generate-button',
                    position: 'bottom',
                    action: 'pulse',
                    waitFor: 'generation-complete'
                },
                {
                    title: 'Save Your Work',
                    content: 'Save your generated asset to your project.',
                    target: '.save-button',
                    position: 'left',
                    action: 'highlight',
                    waitFor: 'asset-saved'
                }
            ]
        });

        // Advanced sprite generation workflow
        this.registerWorkflow('advanced-sprite', {
            title: 'Advanced Sprite Generation',
            description: 'Master advanced sprite generation techniques',
            steps: [
                {
                    title: 'Select Sprite Generator',
                    content: 'Choose a specialized sprite generator for detailed assets.',
                    target: '.sprite-generators',
                    position: 'right',
                    action: 'highlight'
                },
                {
                    title: 'Advanced Parameters',
                    content: 'Explore advanced parameters for fine-tuned control.',
                    target: '.advanced-controls',
                    position: 'top',
                    action: 'highlight'
                },
                {
                    title: 'Quality Settings',
                    content: 'Adjust quality settings for optimal results.',
                    target: '.quality-settings',
                    position: 'left',
                    action: 'highlight'
                },
                {
                    title: 'Batch Generation',
                    content: 'Generate multiple variations at once.',
                    target: '.batch-controls',
                    position: 'bottom',
                    action: 'highlight'
                }
            ]
        });

        // Performance optimization workflow
        this.registerWorkflow('performance-tips', {
            title: 'Performance Optimization',
            description: 'Learn to optimize generation performance',
            steps: [
                {
                    title: 'Check System Resources',
                    content: 'Monitor your system resources for optimal performance.',
                    target: '.performance-monitor',
                    position: 'top',
                    action: 'highlight'
                },
                {
                    title: 'Adjust Settings',
                    content: 'Fine-tune performance settings based on your hardware.',
                    target: '.performance-settings',
                    position: 'right',
                    action: 'highlight'
                },
                {
                    title: 'Use Background Processing',
                    content: 'Enable background processing for large batches.',
                    target: '.background-toggle',
                    position: 'left',
                    action: 'highlight'
                }
            ]
        });
    }

    /**
     * Register a new workflow
     */
    registerWorkflow(id, workflow) {
        this.workflows.set(id, {
            id,
            ...workflow,
            completed: false,
            progress: 0
        });
    }

    /**
     * Start a workflow
     */
    async startWorkflow(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow '${workflowId}' not found`);
        }

        // Check if user should see this workflow
        if (!this.shouldShowWorkflow(workflow)) {
            return false;
        }

        this.currentWorkflow = workflow;
        this.currentStep = 0;
        this.isActive = true;

        this.showWorkflowIntro();
        return true;
    }

    /**
     * Check if workflow should be shown to user
     */
    shouldShowWorkflow(workflow) {
        const experienceLevel = this.preferences.get('experienceLevel');

        // Don't show advanced workflows to beginners
        if (workflow.id.includes('advanced') && experienceLevel === 'beginner') {
            return false;
        }

        // Don't show basic workflows to advanced users
        if (workflow.id === 'welcome' && experienceLevel === 'advanced') {
            return false;
        }

        // Check if workflow was previously completed
        const completedWorkflows = this.preferences.get('completedWorkflows', []);
        if (completedWorkflows.includes(workflow.id)) {
            return false;
        }

        return true;
    }

    /**
     * Show workflow introduction
     */
    showWorkflowIntro() {
        const overlay = this.createOverlay();
        const introModal = this.createIntroModal();

        overlay.appendChild(introModal);
        this.container.appendChild(overlay);

        // Focus management
        introModal.focus();
    }

    /**
     * Create workflow overlay
     */
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'workflow-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        return overlay;
    }

    /**
     * Create introduction modal
     */
    createIntroModal() {
        const modal = document.createElement('div');
        modal.className = 'workflow-intro-modal';
        modal.style.cssText = `
            background: var(--bg-color, #ffffff);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            padding: 32px;
            position: relative;
            text-align: center;
        `;
        modal.setAttribute('tabindex', '-1');

        const title = document.createElement('h2');
        title.textContent = this.currentWorkflow.title;
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 28px;
            font-weight: 700;
            color: var(--text-color, #1a1a1a);
        `;

        const description = document.createElement('p');
        description.textContent = this.currentWorkflow.description;
        description.style.cssText = `
            margin: 0 0 24px 0;
            font-size: 16px;
            color: var(--text-secondary, #666);
            line-height: 1.5;
        `;

        const steps = document.createElement('div');
        steps.textContent = `${this.currentWorkflow.steps.length} steps • ~${this.estimateDuration()} minutes`;
        steps.style.cssText = `
            margin: 0 0 32px 0;
            font-size: 14px;
            color: var(--text-secondary, #666);
            font-weight: 500;
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: center;
        `;

        const startButton = this.createButton('Start Tutorial', 'primary', () => {
            this.startTutorial();
        });

        const skipButton = this.createButton('Skip for Now', 'secondary', () => {
            this.skipWorkflow();
        });

        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(skipButton);

        modal.appendChild(title);
        modal.appendChild(description);
        modal.appendChild(steps);
        modal.appendChild(buttonContainer);

        return modal;
    }

    /**
     * Start the tutorial
     */
    startTutorial() {
        // Remove intro modal
        const overlay = document.querySelector('.workflow-overlay');
        if (overlay) {
            overlay.remove();
        }

        // Start first step
        this.showStep(0);
    }

    /**
     * Skip the workflow
     */
    skipWorkflow() {
        this.endWorkflow(false);
    }

    /**
     * Show tutorial step
     */
    showStep(stepIndex) {
        if (stepIndex >= this.currentWorkflow.steps.length) {
            this.completeWorkflow();
            return;
        }

        const step = this.currentWorkflow.steps[stepIndex];
        this.currentStep = stepIndex;

        // Create step tooltip
        const tooltip = this.createStepTooltip(step);
        this.container.appendChild(tooltip);

        // Highlight target element
        this.highlightTarget(step);

        // Setup step interaction
        this.setupStepInteraction(step);
    }

    /**
     * Create step tooltip
     */
    createStepTooltip(step) {
        const tooltip = document.createElement('div');
        tooltip.className = 'workflow-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: var(--bg-color, #ffffff);
            border: 2px solid var(--primary-color, #007bff);
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            padding: 20px;
            max-width: 300px;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Position tooltip
        this.positionTooltip(tooltip, step);

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        `;

        const stepCounter = document.createElement('div');
        stepCounter.textContent = `Step ${this.currentStep + 1} of ${this.currentWorkflow.steps.length}`;
        stepCounter.style.cssText = `
            font-size: 12px;
            color: var(--text-secondary, #666);
            font-weight: 500;
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: var(--text-secondary, #666);
            padding: 0;
            width: 24px;
            height: 24px;
        `;
        closeButton.addEventListener('click', () => this.endWorkflow(false));

        header.appendChild(stepCounter);
        header.appendChild(closeButton);

        const title = document.createElement('h3');
        title.textContent = step.title;
        title.style.cssText = `
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #1a1a1a);
        `;

        const content = document.createElement('p');
        content.textContent = step.content;
        content.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 14px;
            color: var(--text-color, #1a1a1a);
            line-height: 1.5;
        `;

        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;

        const nextButton = this.createButton(
            this.currentStep === this.currentWorkflow.steps.length - 1 ? 'Finish' : 'Next',
            'primary',
            () => this.nextStep()
        );

        const backButton = this.currentStep > 0 ?
            this.createButton('Back', 'secondary', () => this.previousStep()) : null;

        actions.appendChild(nextButton);
        if (backButton) {
            actions.appendChild(backButton);
        }

        tooltip.appendChild(header);
        tooltip.appendChild(title);
        tooltip.appendChild(content);
        tooltip.appendChild(actions);

        return tooltip;
    }

    /**
     * Position tooltip relative to target
     */
    positionTooltip(tooltip, step) {
        const target = document.querySelector(step.target);
        if (!target) {
            // Default positioning
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;

        switch (step.position) {
            case 'top':
                top = targetRect.top - 10 - tooltipRect.height;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = targetRect.bottom + 10;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.left - 10 - tooltipRect.width;
                break;
            case 'right':
            default:
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.right + 10;
                break;
        }

        // Ensure tooltip stays within viewport
        const margin = 10;
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
        tooltip.style.position = 'fixed';
    }

    /**
     * Highlight target element
     */
    highlightTarget(step) {
        const target = document.querySelector(step.target);
        if (!target) return;

        // Add highlight class
        target.classList.add('workflow-highlight');

        // Add CSS for highlighting
        if (!document.querySelector('#workflow-styles')) {
            const style = document.createElement('style');
            style.id = 'workflow-styles';
            style.textContent = `
                .workflow-highlight {
                    position: relative;
                    z-index: 9999;
                }

                .workflow-highlight::before {
                    content: '';
                    position: absolute;
                    top: -4px;
                    left: -4px;
                    right: -4px;
                    bottom: -4px;
                    background: var(--primary-color, #007bff);
                    border-radius: 4px;
                    z-index: -1;
                    animation: workflow-pulse 2s infinite;
                }

                @keyframes workflow-pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.02); }
                }

                .workflow-tooltip {
                    animation: tooltip-appear 0.3s ease;
                }

                @keyframes tooltip-appear {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        // Store reference for cleanup
        this.currentHighlight = target;
    }

    /**
     * Setup step interaction
     */
    setupStepInteraction(step) {
        if (!step.waitFor) {
            // No specific interaction required
            return;
        }

        // Listen for the specified event
        const eventHandler = (event) => {
            this.completeStep();
        };

        // Add event listener based on waitFor type
        switch (step.waitFor) {
            case 'generator-selected':
                document.addEventListener('generator-selected', eventHandler, { once: true });
                break;
            case 'parameters-changed':
                document.addEventListener('parameters-changed', eventHandler, { once: true });
                break;
            case 'generation-complete':
                document.addEventListener('generation-complete', eventHandler, { once: true });
                break;
            case 'asset-saved':
                document.addEventListener('asset-saved', eventHandler, { once: true });
                break;
            default:
                // Auto-advance after delay
                setTimeout(() => this.completeStep(), 3000);
        }

        this.currentEventHandler = eventHandler;
    }

    /**
     * Complete current step
     */
    completeStep() {
        // Clean up current step
        this.cleanupStep();

        // Move to next step
        this.showStep(this.currentStep + 1);
    }

    /**
     * Move to next step
     */
    nextStep() {
        this.completeStep();
    }

    /**
     * Move to previous step
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.cleanupStep();
            this.showStep(this.currentStep - 1);
        }
    }

    /**
     * Clean up current step
     */
    cleanupStep() {
        // Remove tooltip
        const tooltip = document.querySelector('.workflow-tooltip');
        if (tooltip) {
            tooltip.remove();
        }

        // Remove highlight
        if (this.currentHighlight) {
            this.currentHighlight.classList.remove('workflow-highlight');
            this.currentHighlight = null;
        }

        // Remove event listener
        if (this.currentEventHandler) {
            // Note: In a real implementation, you'd need to track and remove specific listeners
            this.currentEventHandler = null;
        }
    }

    /**
     * Complete workflow
     */
    completeWorkflow() {
        this.endWorkflow(true);
        this.showCompletionModal();
    }

    /**
     * End workflow
     */
    endWorkflow(completed = false) {
        this.cleanupStep();

        // Remove overlay if it exists
        const overlay = document.querySelector('.workflow-overlay');
        if (overlay) {
            overlay.remove();
        }

        if (completed) {
            // Mark workflow as completed
            const completedWorkflows = this.preferences.get('completedWorkflows', []);
            completedWorkflows.push(this.currentWorkflow.id);
            this.preferences.set('completedWorkflows', completedWorkflows);

            this.currentWorkflow.completed = true;
        }

        this.currentWorkflow = null;
        this.currentStep = 0;
        this.isActive = false;

        // Emit completion event
        this.emit('workflow-completed', {
            workflowId: this.currentWorkflow?.id,
            completed
        });
    }

    /**
     * Show completion modal
     */
    showCompletionModal() {
        const overlay = this.createOverlay();
        const completionModal = this.createCompletionModal();

        overlay.appendChild(completionModal);
        this.container.appendChild(overlay);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 5000);
    }

    /**
     * Create completion modal
     */
    createCompletionModal() {
        const modal = document.createElement('div');
        modal.className = 'workflow-completion-modal';
        modal.style.cssText = `
            background: var(--bg-color, #ffffff);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            padding: 32px;
            text-align: center;
        `;

        const icon = document.createElement('div');
        icon.textContent = '🎉';
        icon.style.cssText = `
            font-size: 48px;
            margin-bottom: 16px;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Tutorial Completed!';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 24px;
            font-weight: 700;
            color: var(--text-color, #1a1a1a);
        `;

        const message = document.createElement('p');
        message.textContent = `You've successfully completed the "${this.currentWorkflow.title}" tutorial. You're now ready to use these features!`;
        message.style.cssText = `
            margin: 0 0 24px 0;
            font-size: 16px;
            color: var(--text-secondary, #666);
            line-height: 1.5;
        `;

        const button = this.createButton('Continue', 'primary', () => {
            const overlay = document.querySelector('.workflow-overlay');
            if (overlay) {
                overlay.remove();
            }
        });

        modal.appendChild(icon);
        modal.appendChild(title);
        modal.appendChild(message);
        modal.appendChild(button);

        return modal;
    }

    /**
     * Create button element
     */
    createButton(text, variant, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `workflow-button ${variant}`;
        button.style.cssText = `
            padding: 10px 20px;
            border: 1px solid ${variant === 'primary' ? 'var(--primary-color, #007bff)' : 'var(--border-color, #ced4da)'};
            border-radius: 6px;
            background: ${variant === 'primary' ? 'var(--primary-color, #007bff)' : 'var(--bg-color, #ffffff)'};
            color: ${variant === 'primary' ? 'white' : 'var(--text-color, #1a1a1a)'};
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
     * Estimate workflow duration
     */
    estimateDuration() {
        // Rough estimate: 1 minute per 2 steps
        return Math.ceil(this.currentWorkflow.steps.length / 2);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for preference changes
        this.preferences.on('experience-level-changed', ({ newLevel }) => {
            this.handleExperienceLevelChange(newLevel);
        });
    }

    /**
     * Handle experience level change
     */
    handleExperienceLevelChange(newLevel) {
        // Reset completed workflows if switching to beginner
        if (newLevel === 'beginner') {
            this.preferences.set('completedWorkflows', []);
        }
    }

    /**
     * Get available workflows
     */
    getAvailableWorkflows() {
        return Array.from(this.workflows.values()).filter(workflow =>
            this.shouldShowWorkflow(workflow)
        );
    }

    /**
     * Check if workflow is active
     */
    isWorkflowActive() {
        return this.isActive;
    }

    /**
     * Get current workflow progress
     */
    getCurrentProgress() {
        if (!this.currentWorkflow) return null;

        return {
            workflowId: this.currentWorkflow.id,
            currentStep: this.currentStep,
            totalSteps: this.currentWorkflow.steps.length,
            progress: ((this.currentStep + 1) / this.currentWorkflow.steps.length) * 100
        };
    }

    /**
     * Emit event
     */
    emit(eventType, data) {
        const event = new CustomEvent(`workflow-${eventType}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the guided workflow system
     */
    destroy() {
        this.cleanupStep();

        // Remove overlay if it exists
        const overlay = document.querySelector('.workflow-overlay');
        if (overlay) {
            overlay.remove();
        }

        // Remove styles
        const styles = document.querySelector('#workflow-styles');
        if (styles) {
            styles.remove();
        }

        this.workflows.clear();
        this.eventListeners.clear();

        console.log('Guided workflow system destroyed');
    }
}

module.exports = GuidedWorkflow;
