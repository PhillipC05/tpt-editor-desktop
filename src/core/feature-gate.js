/**
 * Feature Gate System
 * Controls feature access based on user progress, experience level, and completion criteria
 */

const UserPreferences = require('./user-preferences');

class FeatureGate {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.gates = new Map();
        this.userProgress = new Map();
        this.eventListeners = new Map();

        this.init();
    }

    /**
     * Initialize the feature gate system
     */
    async init() {
        await this.preferences.init();
        this.defineFeatureGates();
        this.loadUserProgress();
        this.setupEventListeners();

        console.log('Feature gate system initialized');
    }

    /**
     * Define all feature gates
     */
    defineFeatureGates() {
        // Basic features (always available)
        this.addGate('basic-generation', {
            name: 'Basic Asset Generation',
            description: 'Generate simple assets using basic generators',
            requiredLevel: 'beginner',
            prerequisites: [],
            unlockCriteria: null, // Always available
            category: 'generation'
        });

        // Intermediate features
        this.addGate('advanced-parameters', {
            name: 'Advanced Parameters',
            description: 'Access advanced generator parameters and fine-tuning options',
            requiredLevel: 'intermediate',
            prerequisites: ['basic-generation'],
            unlockCriteria: {
                type: 'usage',
                condition: 'generations_completed',
                value: 10
            },
            category: 'generation'
        });

        this.addGate('batch-processing', {
            name: 'Batch Processing',
            description: 'Generate multiple assets simultaneously',
            requiredLevel: 'intermediate',
            prerequisites: ['basic-generation'],
            unlockCriteria: {
                type: 'usage',
                condition: 'generations_completed',
                value: 25
            },
            category: 'productivity'
        });

        this.addGate('preset-management', {
            name: 'Preset Management',
            description: 'Save and load custom parameter presets',
            requiredLevel: 'intermediate',
            prerequisites: ['advanced-parameters'],
            unlockCriteria: {
                type: 'usage',
                condition: 'generations_completed',
                value: 50
            },
            category: 'organization'
        });

        // Advanced features
        this.addGate('performance-optimization', {
            name: 'Performance Optimization',
            description: 'Access performance monitoring and optimization tools',
            requiredLevel: 'advanced',
            prerequisites: ['batch-processing'],
            unlockCriteria: {
                type: 'usage',
                condition: 'batch_generations_completed',
                value: 100
            },
            category: 'performance'
        });

        this.addGate('custom-generators', {
            name: 'Custom Generators',
            description: 'Create and modify custom asset generators',
            requiredLevel: 'advanced',
            prerequisites: ['preset-management', 'performance-optimization'],
            unlockCriteria: {
                type: 'achievement',
                condition: 'tutorials_completed',
                value: ['welcome', 'advanced-sprite']
            },
            category: 'development'
        });

        this.addGate('api-integration', {
            name: 'API Integration',
            description: 'Connect with external services and APIs',
            requiredLevel: 'advanced',
            prerequisites: ['custom-generators'],
            unlockCriteria: {
                type: 'usage',
                condition: 'api_calls_made',
                value: 10
            },
            category: 'integration'
        });

        this.addGate('collaboration-tools', {
            name: 'Collaboration Tools',
            description: 'Share assets and collaborate with team members',
            requiredLevel: 'advanced',
            prerequisites: ['preset-management'],
            unlockCriteria: {
                type: 'usage',
                condition: 'assets_exported',
                value: 200
            },
            category: 'collaboration'
        });

        // Expert features
        this.addGate('ai-enhancement', {
            name: 'AI Enhancement',
            description: 'AI-powered asset optimization and suggestions',
            requiredLevel: 'advanced',
            prerequisites: ['performance-optimization', 'api-integration'],
            unlockCriteria: {
                type: 'achievement',
                condition: 'expert_badges_earned',
                value: 5
            },
            category: 'ai'
        });

        this.addGate('plugin-development', {
            name: 'Plugin Development',
            description: 'Create and distribute custom plugins',
            requiredLevel: 'advanced',
            prerequisites: ['custom-generators', 'api-integration'],
            unlockCriteria: {
                type: 'achievement',
                condition: 'plugins_created',
                value: 3
            },
            category: 'development'
        });
    }

    /**
     * Add a feature gate
     */
    addGate(id, gate) {
        this.gates.set(id, {
            id,
            ...gate,
            unlocked: false,
            unlockedAt: null,
            progress: 0
        });
    }

    /**
     * Load user progress from preferences
     */
    loadUserProgress() {
        const savedProgress = this.preferences.get('featureProgress', {});
        const unlockedFeatures = this.preferences.get('unlockedFeatures', []);

        // Load progress data
        Object.entries(savedProgress).forEach(([featureId, progress]) => {
            this.userProgress.set(featureId, progress);
        });

        // Mark unlocked features
        unlockedFeatures.forEach(featureId => {
            const gate = this.gates.get(featureId);
            if (gate) {
                gate.unlocked = true;
                gate.unlockedAt = savedProgress[featureId]?.unlockedAt || new Date().toISOString();
            }
        });

        // Check for newly unlocked features
        this.checkForUnlocks();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for user actions that could unlock features
        document.addEventListener('generation-complete', (e) => {
            this.recordProgress('generations_completed', 1);
        });

        document.addEventListener('batch-generation-complete', (e) => {
            this.recordProgress('batch_generations_completed', e.detail?.count || 1);
        });

        document.addEventListener('asset-exported', (e) => {
            this.recordProgress('assets_exported', 1);
        });

        document.addEventListener('api-call-made', (e) => {
            this.recordProgress('api_calls_made', 1);
        });

        document.addEventListener('workflow-completed', (e) => {
            if (e.detail?.completed) {
                this.recordAchievement('tutorials_completed', e.detail.workflowId);
            }
        });

        document.addEventListener('plugin-created', (e) => {
            this.recordProgress('plugins_created', 1);
        });

        document.addEventListener('expert-badge-earned', (e) => {
            this.recordProgress('expert_badges_earned', 1);
        });

        // Listen for experience level changes
        this.preferences.on('experience-level-changed', ({ newLevel }) => {
            this.handleExperienceLevelChange(newLevel);
        });
    }

    /**
     * Record user progress
     */
    recordProgress(metric, value) {
        const currentProgress = this.userProgress.get(metric) || 0;
        const newProgress = currentProgress + value;

        this.userProgress.set(metric, newProgress);

        // Check if this unlocks any features
        this.checkUnlockCriteria(metric, newProgress);

        // Save progress
        this.saveProgress();
    }

    /**
     * Record achievement
     */
    recordAchievement(achievement, value) {
        const currentAchievements = this.userProgress.get(achievement) || [];
        if (!currentAchievements.includes(value)) {
            currentAchievements.push(value);
            this.userProgress.set(achievement, currentAchievements);

            // Check if this unlocks any features
            this.checkUnlockCriteria(achievement, currentAchievements);

            // Save progress
            this.saveProgress();
        }
    }

    /**
     * Check unlock criteria for all gates
     */
    checkForUnlocks() {
        this.gates.forEach(gate => {
            if (!gate.unlocked) {
                this.checkGateUnlock(gate);
            }
        });
    }

    /**
     * Check if a specific gate should be unlocked
     */
    checkGateUnlock(gate) {
        // Check experience level requirement
        const userLevel = this.preferences.get('experienceLevel');
        const levelOrder = ['beginner', 'intermediate', 'advanced'];
        const requiredIndex = levelOrder.indexOf(gate.requiredLevel);
        const userIndex = levelOrder.indexOf(userLevel);

        if (userIndex < requiredIndex) {
            return false; // User level too low
        }

        // Check prerequisites
        for (const prereq of gate.prerequisites) {
            const prereqGate = this.gates.get(prereq);
            if (!prereqGate?.unlocked) {
                return false; // Prerequisite not met
            }
        }

        // Check unlock criteria
        if (gate.unlockCriteria) {
            const criteria = gate.unlockCriteria;
            const currentValue = this.userProgress.get(criteria.condition);

            if (!this.meetsUnlockCriteria(criteria, currentValue)) {
                return false; // Criteria not met
            }
        }

        // Unlock the feature
        this.unlockFeature(gate.id);
        return true;
    }

    /**
     * Check if unlock criteria is met
     */
    meetsUnlockCriteria(criteria, currentValue) {
        switch (criteria.type) {
            case 'usage':
                return (currentValue || 0) >= criteria.value;

            case 'achievement':
                if (Array.isArray(criteria.value)) {
                    return criteria.value.every(item => (currentValue || []).includes(item));
                } else {
                    return (currentValue || []).includes(criteria.value);
                }

            case 'time':
                // Could implement time-based unlocks
                return false;

            default:
                return false;
        }
    }

    /**
     * Check unlock criteria for a specific metric
     */
    checkUnlockCriteria(metric, value) {
        this.gates.forEach(gate => {
            if (!gate.unlocked && gate.unlockCriteria?.condition === metric) {
                if (this.meetsUnlockCriteria(gate.unlockCriteria, value)) {
                    this.checkGateUnlock(gate);
                }
            }
        });
    }

    /**
     * Unlock a feature
     */
    unlockFeature(featureId) {
        const gate = this.gates.get(featureId);
        if (!gate || gate.unlocked) return;

        gate.unlocked = true;
        gate.unlockedAt = new Date().toISOString();

        // Update progress
        const progress = this.userProgress.get(featureId) || {};
        progress.unlockedAt = gate.unlockedAt;
        this.userProgress.set(featureId, progress);

        // Save to preferences
        this.saveProgress();

        // Emit unlock event
        this.emit('feature-unlocked', {
            featureId,
            gate: { ...gate }
        });

        // Show unlock notification
        this.showUnlockNotification(gate);

        console.log(`Feature unlocked: ${featureId}`);
    }

    /**
     * Handle experience level change
     */
    handleExperienceLevelChange(newLevel) {
        // Check for features that can now be unlocked
        this.checkForUnlocks();
    }

    /**
     * Check if a feature is unlocked
     */
    isUnlocked(featureId) {
        // Check if feature gating is disabled
        const gatingDisabled = this.preferences.get('disableFeatureGating', false);
        if (gatingDisabled) {
            return true; // All features are unlocked if gating is disabled
        }

        const gate = this.gates.get(featureId);
        return gate?.unlocked || false;
    }

    /**
     * Get feature gate information
     */
    getGate(featureId) {
        return this.gates.get(featureId);
    }

    /**
     * Get all unlocked features
     */
    getUnlockedFeatures() {
        return Array.from(this.gates.values())
            .filter(gate => gate.unlocked)
            .map(gate => gate.id);
    }

    /**
     * Get all locked features
     */
    getLockedFeatures() {
        return Array.from(this.gates.values())
            .filter(gate => !gate.unlocked)
            .map(gate => ({
                id: gate.id,
                name: gate.name,
                description: gate.description,
                requiredLevel: gate.requiredLevel,
                category: gate.category,
                progress: this.getFeatureProgress(gate)
            }));
    }

    /**
     * Get progress for a feature
     */
    getFeatureProgress(gate) {
        if (!gate.unlockCriteria) return null;

        const criteria = gate.unlockCriteria;
        const currentValue = this.userProgress.get(criteria.condition) || 0;

        let progress = 0;
        let required = criteria.value;

        switch (criteria.type) {
            case 'usage':
                progress = Math.min(currentValue / required, 1);
                break;

            case 'achievement':
                if (Array.isArray(required)) {
                    const completed = required.filter(item => (currentValue || []).includes(item)).length;
                    progress = completed / required.length;
                } else {
                    progress = (currentValue || []).includes(required) ? 1 : 0;
                }
                break;
        }

        return {
            current: currentValue,
            required: required,
            percentage: Math.round(progress * 100),
            type: criteria.type
        };
    }

    /**
     * Get features by category
     */
    getFeaturesByCategory(category) {
        return Array.from(this.gates.values())
            .filter(gate => gate.category === category);
    }

    /**
     * Show unlock notification
     */
    showUnlockNotification(gate) {
        const notification = document.createElement('div');
        notification.className = 'feature-unlock-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInRight 0.5s ease;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <div style="font-size: 24px; margin-right: 12px;">🎉</div>
                <div style="font-weight: 600; font-size: 16px;">New Feature Unlocked!</div>
            </div>
            <div style="font-weight: 600; margin-bottom: 8px; font-size: 18px;">${gate.name}</div>
            <div style="opacity: 0.9; line-height: 1.4;">${gate.description}</div>
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    /**
     * Save progress to preferences
     */
    saveProgress() {
        const progressData = {};
        this.userProgress.forEach((value, key) => {
            progressData[key] = value;
        });

        const unlockedFeatures = this.getUnlockedFeatures();

        this.preferences.set('featureProgress', progressData);
        this.preferences.set('unlockedFeatures', unlockedFeatures);
    }

    /**
     * Get user statistics
     */
    getUserStats() {
        return {
            totalGenerations: this.userProgress.get('generations_completed') || 0,
            batchGenerations: this.userProgress.get('batch_generations_completed') || 0,
            assetsExported: this.userProgress.get('assets_exported') || 0,
            tutorialsCompleted: (this.userProgress.get('tutorials_completed') || []).length,
            pluginsCreated: this.userProgress.get('plugins_created') || 0,
            expertBadges: this.userProgress.get('expert_badges_earned') || 0,
            unlockedFeatures: this.getUnlockedFeatures().length,
            totalFeatures: this.gates.size
        };
    }

    /**
     * Reset all progress (for testing)
     */
    resetProgress() {
        this.userProgress.clear();
        this.gates.forEach(gate => {
            gate.unlocked = false;
            gate.unlockedAt = null;
        });

        this.saveProgress();
        console.log('Feature progress reset');
    }

    /**
     * Emit event
     */
    emit(eventType, data) {
        const event = new CustomEvent(`feature-gate-${eventType}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Get feature recommendations
     */
    getRecommendations() {
        const recommendations = [];
        const userLevel = this.preferences.get('experienceLevel');

        this.gates.forEach(gate => {
            if (!gate.unlocked) {
                // Check if prerequisites are met
                const prereqsMet = gate.prerequisites.every(prereq => {
                    const prereqGate = this.gates.get(prereq);
                    return prereqGate?.unlocked;
                });

                // Check if experience level is appropriate
                const levelOrder = ['beginner', 'intermediate', 'advanced'];
                const requiredIndex = levelOrder.indexOf(gate.requiredLevel);
                const userIndex = levelOrder.indexOf(userLevel);

                if (prereqsMet && userIndex >= requiredIndex) {
                    const progress = this.getFeatureProgress(gate);
                    if (progress && progress.percentage > 50) {
                        recommendations.push({
                            featureId: gate.id,
                            name: gate.name,
                            description: gate.description,
                            progress: progress,
                            category: gate.category
                        });
                    }
                }
            }
        });

        return recommendations.slice(0, 3); // Return top 3 recommendations
    }

    /**
     * Destroy the feature gate system
     */
    destroy() {
        this.saveProgress();
        this.gates.clear();
        this.userProgress.clear();
        this.eventListeners.clear();

        console.log('Feature gate system destroyed');
    }
}

module.exports = FeatureGate;
