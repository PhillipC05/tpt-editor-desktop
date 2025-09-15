/**
 * Custom Generator Framework
 * Advanced framework for creating, managing, and distributing custom generators
 */

const UserPreferences = require('./user-preferences');
const PluginSystem = require('./plugin-system');
const PluginSecurity = require('./plugin-security');
const BaseGenerator = require('../generators/base-generator');

class GeneratorFramework {
    constructor(options = {}) {
        this.preferences = options.preferences || new UserPreferences();
        this.pluginSystem = options.pluginSystem || new PluginSystem();
        this.pluginSecurity = options.pluginSecurity || new PluginSecurity();

        this.generators = new Map();
        this.generatorInstances = new Map();
        this.generatorMetadata = new Map();
        this.generatorCategories = new Map();
        this.generatorTemplates = new Map();
        this.generatorTests = new Map();
        this.generatorPerformance = new Map();

        this.init();
    }

    /**
     * Initialize the generator framework
     */
    async init() {
        await this.preferences.init();
        this.setupBuiltInGenerators();
        this.setupGeneratorCategories();
        this.setupGeneratorTemplates();
        this.loadCustomGenerators();

        console.log('Generator framework initialized');
    }

    /**
     * Setup built-in generators
     */
    setupBuiltInGenerators() {
        // This would scan and register all built-in generators
        // For now, we'll set up the framework structure
        this.registerGeneratorCategory('sprites', {
            name: 'Sprite Generators',
            description: 'Generators for creating game sprites and characters',
            icon: 'sprite-icon.png',
            color: '#4CAF50'
        });

        this.registerGeneratorCategory('audio', {
            name: 'Audio Generators',
            description: 'Generators for creating sound effects and music',
            icon: 'audio-icon.png',
            color: '#2196F3'
        });

        this.registerGeneratorCategory('levels', {
            name: 'Level Generators',
            description: 'Generators for creating game levels and environments',
            icon: 'level-icon.png',
            color: '#FF9800'
        });
    }

    /**
     * Setup generator categories
     */
    setupGeneratorCategories() {
        const categories = {
            '2d-sprites': {
                name: '2D Sprites',
                parent: 'sprites',
                description: 'Traditional 2D sprite generation',
                tags: ['2d', 'pixel-art', 'sprites']
            },
            '3d-models': {
                name: '3D Models',
                parent: 'sprites',
                description: '3D model and mesh generation',
                tags: ['3d', 'models', 'meshes']
            },
            'ui-elements': {
                name: 'UI Elements',
                parent: 'sprites',
                description: 'User interface element generation',
                tags: ['ui', 'interface', 'buttons']
            },
            'sound-effects': {
                name: 'Sound Effects',
                parent: 'audio',
                description: 'Game sound effect generation',
                tags: ['sfx', 'sound', 'effects']
            },
            'background-music': {
                name: 'Background Music',
                parent: 'audio',
                description: 'Background music and ambient audio',
                tags: ['music', 'ambient', 'background']
            },
            'level-layouts': {
                name: 'Level Layouts',
                parent: 'levels',
                description: 'Procedural level layout generation',
                tags: ['levels', 'layouts', 'procedural']
            },
            'environments': {
                name: 'Environments',
                parent: 'levels',
                description: 'Environmental asset generation',
                tags: ['environments', 'nature', 'buildings']
            }
        };

        Object.entries(categories).forEach(([id, category]) => {
            this.registerGeneratorCategory(id, category);
        });
    }

    /**
     * Setup generator templates
     */
    setupGeneratorTemplates() {
        const templates = {
            'basic-sprite': {
                name: 'Basic Sprite Generator',
                description: 'Simple template for creating 2D sprites',
                category: '2d-sprites',
                parameters: {
                    width: { type: 'number', default: 32, min: 8, max: 512 },
                    height: { type: 'number', default: 32, min: 8, max: 512 },
                    colors: { type: 'color[]', default: ['#FF0000', '#00FF00', '#0000FF'] }
                },
                code: `
// Basic Sprite Generator Template
class BasicSpriteGenerator extends BaseGenerator {
    constructor(options = {}) {
        super(options);
        this.width = options.width || 32;
        this.height = options.height || 32;
        this.colors = options.colors || ['#FF0000', '#00FF00', '#0000FF'];
    }

    async generate(params = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');

        // Simple pattern generation
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const colorIndex = (x + y) % this.colors.length;
                ctx.fillStyle = this.colors[colorIndex];
                ctx.fillRect(x, y, 1, 1);
            }
        }

        return {
            canvas,
            metadata: {
                width: this.width,
                height: this.height,
                colors: this.colors
            }
        };
    }
}

return BasicSpriteGenerator;
                `
            },

            'procedural-level': {
                name: 'Procedural Level Generator',
                description: 'Template for creating procedural game levels',
                category: 'level-layouts',
                parameters: {
                    width: { type: 'number', default: 100, min: 10, max: 1000 },
                    height: { type: 'number', default: 100, min: 10, max: 1000 },
                    complexity: { type: 'number', default: 0.5, min: 0, max: 1 },
                    seed: { type: 'string', default: 'random' }
                },
                code: `
// Procedural Level Generator Template
class ProceduralLevelGenerator extends BaseGenerator {
    constructor(options = {}) {
        super(options);
        this.width = options.width || 100;
        this.height = options.height || 100;
        this.complexity = options.complexity || 0.5;
        this.seed = options.seed || Math.random().toString();
    }

    async generate(params = {}) {
        const level = [];
        const random = this.createSeededRandom(this.seed);

        // Generate level layout
        for (let y = 0; y < this.height; y++) {
            level[y] = [];
            for (let x = 0; x < this.width; x++) {
                // Simple procedural generation
                const noise = random();
                let tileType = 'empty';

                if (noise < 0.1) tileType = 'wall';
                else if (noise < 0.2) tileType = 'floor';
                else if (noise < 0.25) tileType = 'treasure';

                level[y][x] = tileType;
            }
        }

        return {
            level,
            metadata: {
                width: this.width,
                height: this.height,
                complexity: this.complexity,
                seed: this.seed
            }
        };
    }

    createSeededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return function() {
            x = Math.sin(x) * 10000;
            return x - Math.floor(x);
        };
    }
}

return ProceduralLevelGenerator;
                `
            }
        };

        Object.entries(templates).forEach(([id, template]) => {
            this.registerGeneratorTemplate(id, template);
        });
    }

    /**
     * Register a generator category
     */
    registerGeneratorCategory(categoryId, categoryInfo) {
        this.generatorCategories.set(categoryId, {
            id: categoryId,
            ...categoryInfo,
            generators: [],
            createdAt: new Date().toISOString()
        });
    }

    /**
     * Register a generator template
     */
    registerGeneratorTemplate(templateId, templateInfo) {
        this.generatorTemplates.set(templateId, {
            id: templateId,
            ...templateInfo,
            createdAt: new Date().toISOString()
        });
    }

    /**
     * Create a custom generator from template
     */
    async createGeneratorFromTemplate(templateId, customizations = {}) {
        const template = this.generatorTemplates.get(templateId);
        if (!template) {
            throw new Error(`Template '${templateId}' not found`);
        }

        const generatorId = `custom_${templateId}_${Date.now()}`;
        const generatorCode = this.customizeTemplateCode(template.code, customizations);

        const generatorDefinition = {
            id: generatorId,
            name: customizations.name || `${template.name} (Custom)`,
            description: customizations.description || template.description,
            category: template.category,
            version: '1.0.0',
            author: 'Custom Generator',
            parameters: { ...template.parameters, ...customizations.parameters },
            factory: () => this.createGeneratorFromCode(generatorCode, customizations),
            config: {
                templateId,
                customizations,
                code: generatorCode
            }
        };

        // Register the generator
        await this.registerCustomGenerator(generatorDefinition);

        return generatorId;
    }

    /**
     * Customize template code with user modifications
     */
    customizeTemplateCode(templateCode, customizations) {
        let code = templateCode;

        // Apply parameter customizations
        if (customizations.parameters) {
            Object.entries(customizations.parameters).forEach(([param, value]) => {
                // This is a simplified example - in practice, you'd need more sophisticated code modification
                const paramRegex = new RegExp(`this\\.${param}\\s*=\\s*[^;]+;`, 'g');
                code = code.replace(paramRegex, `this.${param} = ${JSON.stringify(value)};`);
            });
        }

        return code;
    }

    /**
     * Create generator from code
     */
    createGeneratorFromCode(code, options = {}) {
        try {
            // Create a safe context for code execution
            const sandbox = this.pluginSecurity.createSandbox('generator-builder', 'moderate');

            // Execute the code in the sandbox
            const GeneratorClass = this.pluginSecurity.executeInSandbox('generator-builder', code);

            // Create and return instance
            return new GeneratorClass(options);

        } catch (error) {
            console.error('Failed to create generator from code:', error);
            throw new Error(`Generator creation failed: ${error.message}`);
        }
    }

    /**
     * Register a custom generator
     */
    async registerCustomGenerator(generatorDefinition) {
        try {
            // Validate the generator definition
            this.validateGeneratorDefinition(generatorDefinition);

            // Register with plugin system
            const pluginId = await this.pluginSystem.registerPlugin({
                id: generatorDefinition.id,
                name: generatorDefinition.name,
                version: generatorDefinition.version,
                description: generatorDefinition.description,
                author: generatorDefinition.author,
                category: 'generators',
                factory: generatorDefinition.factory,
                config: generatorDefinition.config
            });

            // Store generator metadata
            this.generators.set(generatorDefinition.id, generatorDefinition);
            this.generatorMetadata.set(generatorDefinition.id, {
                ...generatorDefinition,
                pluginId,
                registeredAt: new Date().toISOString(),
                usageCount: 0,
                lastUsed: null,
                performanceMetrics: {
                    averageExecutionTime: 0,
                    successRate: 1.0,
                    errorCount: 0
                }
            });

            // Add to category
            const category = this.generatorCategories.get(generatorDefinition.category);
            if (category) {
                category.generators.push(generatorDefinition.id);
            }

            console.log(`Custom generator '${generatorDefinition.name}' registered successfully`);
            return pluginId;

        } catch (error) {
            console.error('Failed to register custom generator:', error);
            throw error;
        }
    }

    /**
     * Validate generator definition
     */
    validateGeneratorDefinition(definition) {
        if (!definition.id) throw new Error('Generator ID is required');
        if (!definition.name) throw new Error('Generator name is required');
        if (!definition.factory && !definition.code) throw new Error('Generator factory or code is required');
        if (!definition.category) throw new Error('Generator category is required');

        // Validate parameters
        if (definition.parameters) {
            Object.entries(definition.parameters).forEach(([paramName, paramConfig]) => {
                if (!paramConfig.type) throw new Error(`Parameter '${paramName}' missing type`);
                if (paramConfig.min !== undefined && paramConfig.max !== undefined) {
                    if (paramConfig.min > paramConfig.max) {
                        throw new Error(`Parameter '${paramName}' min > max`);
                    }
                }
            });
        }
    }

    /**
     * Execute a generator
     */
    async executeGenerator(generatorId, parameters = {}) {
        const generator = this.generators.get(generatorId);
        if (!generator) {
            throw new Error(`Generator '${generatorId}' not found`);
        }

        const metadata = this.generatorMetadata.get(generatorId);
        const startTime = Date.now();

        try {
            // Get or create generator instance
            let instance = this.generatorInstances.get(generatorId);
            if (!instance) {
                instance = await generator.factory();
                this.generatorInstances.set(generatorId, instance);
            }

            // Execute the generator
            const result = await instance.generate(parameters);

            // Update metadata
            const executionTime = Date.now() - startTime;
            metadata.usageCount++;
            metadata.lastUsed = new Date().toISOString();

            // Update performance metrics
            const perf = metadata.performanceMetrics;
            perf.averageExecutionTime = (perf.averageExecutionTime * (metadata.usageCount - 1) + executionTime) / metadata.usageCount;

            // Store performance data
            this.generatorPerformance.set(generatorId, {
                timestamp: new Date().toISOString(),
                executionTime,
                parameters,
                success: true
            });

            return result;

        } catch (error) {
            // Update error metrics
            const perf = metadata.performanceMetrics;
            perf.errorCount++;
            perf.successRate = (metadata.usageCount - perf.errorCount) / metadata.usageCount;

            // Store error data
            this.generatorPerformance.set(generatorId, {
                timestamp: new Date().toISOString(),
                executionTime: Date.now() - startTime,
                parameters,
                success: false,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Get generator information
     */
    getGeneratorInfo(generatorId) {
        const generator = this.generators.get(generatorId);
        const metadata = this.generatorMetadata.get(generatorId);

        if (!generator) return null;

        return {
            ...generator,
            ...metadata,
            isLoaded: this.generatorInstances.has(generatorId),
            performance: this.getGeneratorPerformance(generatorId)
        };
    }

    /**
     * Get generator performance metrics
     */
    getGeneratorPerformance(generatorId) {
        const performances = Array.from(this.generatorPerformance.entries())
            .filter(([id]) => id === generatorId)
            .map(([, perf]) => perf)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10); // Last 10 executions

        if (performances.length === 0) return null;

        const avgExecutionTime = performances.reduce((sum, p) => sum + p.executionTime, 0) / performances.length;
        const successRate = performances.filter(p => p.success).length / performances.length;
        const errorRate = 1 - successRate;

        return {
            averageExecutionTime: avgExecutionTime,
            successRate,
            errorRate,
            recentExecutions: performances,
            totalExecutions: performances.length
        };
    }

    /**
     * Get generators by category
     */
    getGeneratorsByCategory(categoryId) {
        const category = this.generatorCategories.get(categoryId);
        if (!category) return [];

        return category.generators.map(id => this.getGeneratorInfo(id)).filter(Boolean);
    }

    /**
     * Get all generator categories
     */
    getGeneratorCategories() {
        return Array.from(this.generatorCategories.values());
    }

    /**
     * Get all generator templates
     */
    getGeneratorTemplates() {
        return Array.from(this.generatorTemplates.values());
    }

    /**
     * Search generators
     */
    searchGenerators(query, filters = {}) {
        const { category, author, tags } = filters;

        return Array.from(this.generators.values())
            .filter(generator => {
                // Text search
                if (query) {
                    const searchTerm = query.toLowerCase();
                    const searchableText = `${generator.name} ${generator.description}`.toLowerCase();
                    if (!searchableText.includes(searchTerm)) return false;
                }

                // Category filter
                if (category && generator.category !== category) return false;

                // Author filter
                if (author && generator.author !== author) return false;

                // Tags filter
                if (tags && tags.length > 0) {
                    const generatorTags = generator.tags || [];
                    if (!tags.some(tag => generatorTags.includes(tag))) return false;
                }

                return true;
            })
            .map(generator => this.getGeneratorInfo(generator.id))
            .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    }

    /**
     * Export generator
     */
    exportGenerator(generatorId) {
        const generator = this.generators.get(generatorId);
        const metadata = this.generatorMetadata.get(generatorId);

        if (!generator) {
            throw new Error(`Generator '${generatorId}' not found`);
        }

        return {
            generator,
            metadata,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Import generator
     */
    async importGenerator(exportData) {
        try {
            const { generator, metadata } = exportData;

            // Generate new ID to avoid conflicts
            const newId = `${generator.id}_imported_${Date.now()}`;
            generator.id = newId;

            // Register the imported generator
            await this.registerCustomGenerator(generator);

            return newId;

        } catch (error) {
            console.error('Failed to import generator:', error);
            throw error;
        }
    }

    /**
     * Delete custom generator
     */
    async deleteGenerator(generatorId) {
        const generator = this.generators.get(generatorId);
        if (!generator) {
            throw new Error(`Generator '${generatorId}' not found`);
        }

        // Check if it's a built-in generator (don't allow deletion)
        if (!generator.id.startsWith('custom_')) {
            throw new Error('Cannot delete built-in generators');
        }

        try {
            // Unload from plugin system
            await this.pluginSystem.unloadPlugin(generatorId);

            // Remove from collections
            this.generators.delete(generatorId);
            this.generatorInstances.delete(generatorId);
            this.generatorMetadata.delete(generatorId);

            // Remove from category
            const category = this.generatorCategories.get(generator.category);
            if (category) {
                const index = category.generators.indexOf(generatorId);
                if (index > -1) {
                    category.generators.splice(index, 1);
                }
            }

            console.log(`Generator '${generatorId}' deleted successfully`);

        } catch (error) {
            console.error(`Failed to delete generator '${generatorId}':`, error);
            throw error;
        }
    }

    /**
     * Get framework statistics
     */
    getStatistics() {
        const totalGenerators = this.generators.size;
        const customGenerators = Array.from(this.generators.values())
            .filter(g => g.id.startsWith('custom_')).length;
        const builtInGenerators = totalGenerators - customGenerators;
        const loadedGenerators = this.generatorInstances.size;

        const categories = {};
        this.generatorCategories.forEach((category, id) => {
            categories[id] = category.generators.length;
        });

        const totalUsage = Array.from(this.generatorMetadata.values())
            .reduce((sum, meta) => sum + (meta.usageCount || 0), 0);

        return {
            totalGenerators,
            customGenerators,
            builtInGenerators,
            loadedGenerators,
            categories,
            totalUsage,
            templates: this.generatorTemplates.size
        };
    }

    /**
     * Load custom generators from storage
     */
    async loadCustomGenerators() {
        const customGenerators = this.preferences.get('customGenerators', []);

        for (const generatorData of customGenerators) {
            try {
                await this.registerCustomGenerator(generatorData);
            } catch (error) {
                console.error(`Failed to load custom generator '${generatorData.id}':`, error);
            }
        }
    }

    /**
     * Save custom generators to storage
     */
    async saveCustomGenerators() {
        const customGenerators = Array.from(this.generators.values())
            .filter(g => g.id.startsWith('custom_'));

        await this.preferences.set('customGenerators', customGenerators);
    }

    /**
     * Create generator test suite
     */
    createGeneratorTest(generatorId) {
        const generator = this.generators.get(generatorId);
        if (!generator) return null;

        const testSuite = {
            generatorId,
            tests: [],
            createdAt: new Date().toISOString()
        };

        // Create basic parameter validation tests
        if (generator.parameters) {
            Object.entries(generator.parameters).forEach(([paramName, paramConfig]) => {
                testSuite.tests.push({
                    name: `Parameter ${paramName} validation`,
                    type: 'parameter',
                    parameter: paramName,
                    config: paramConfig,
                    testFunction: async (value) => {
                        // This would validate the parameter value
                        return this.validateParameter(paramConfig, value);
                    }
                });
            });
        }

        // Create execution test
        testSuite.tests.push({
            name: 'Generator execution',
            type: 'execution',
            testFunction: async () => {
                try {
                    const result = await this.executeGenerator(generatorId, {});
                    return { success: true, result };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
        });

        this.generatorTests.set(generatorId, testSuite);
        return testSuite;
    }

    /**
     * Validate parameter
     */
    validateParameter(config, value) {
        const { type, min, max, required } = config;

        if (required && (value === undefined || value === null)) {
            return { valid: false, error: 'Parameter is required' };
        }

        if (type === 'number') {
            if (typeof value !== 'number') {
                return { valid: false, error: 'Must be a number' };
            }
            if (min !== undefined && value < min) {
                return { valid: false, error: `Must be >= ${min}` };
            }
            if (max !== undefined && value > max) {
                return { valid: false, error: `Must be <= ${max}` };
            }
        }

        if (type === 'string' && typeof value !== 'string') {
            return { valid: false, error: 'Must be a string' };
        }

        return { valid: true };
    }

    /**
     * Run generator tests
     */
    async runGeneratorTests(generatorId) {
        const testSuite = this.generatorTests.get(generatorId);
        if (!testSuite) return null;

        const results = {
            generatorId,
            passed: 0,
            failed: 0,
            total: testSuite.tests.length,
            tests: [],
            executedAt: new Date().toISOString()
        };

        for (const test of testSuite.tests) {
            try {
                const result = await test.testFunction();
                const passed = result.success !== false;

                results.tests.push({
                    name: test.name,
                    type: test.type,
                    passed,
                    result,
                    error: passed ? null : result.error
                });

                if (passed) {
                    results.passed++;
                } else {
                    results.failed++;
                }

            } catch (error) {
                results.tests.push({
                    name: test.name,
                    type: test.type,
                    passed: false,
                    result: null,
                    error: error.message
                });
                results.failed++;
            }
        }

        return results;
    }

    /**
     * Destroy the generator framework
     */
    destroy() {
        // Clean up instances
        this.generatorInstances.clear();
        this.generators.clear();
        this.generatorMetadata.clear();
        this.generatorCategories.clear();
        this.generatorTemplates.clear();
        this.generatorTests.clear();
        this.generatorPerformance.clear();

        console.log('Generator framework destroyed');
    }
}

module.exports = GeneratorFramework;
