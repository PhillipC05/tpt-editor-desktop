/**
 * User Documentation Generator
 * Comprehensive user documentation with interactive guides, troubleshooting, and searchable content
 */

const fs = require('fs').promises;
const path = require('path');

class UserDocumentationGenerator {
    constructor(options = {}) {
        this.outputPath = options.outputPath || path.join(process.cwd(), 'docs', 'user');
        this.templatePath = options.templatePath || path.join(process.cwd(), 'docs', 'templates');
        this.contentPath = options.contentPath || path.join(process.cwd(), 'docs', 'content');

        this.documentation = {
            guides: new Map(),
            tutorials: new Map(),
            troubleshooting: new Map(),
            faq: new Map(),
            reference: new Map(),
            searchIndex: new Map()
        };

        this.init();
    }

    /**
     * Initialize the user documentation generator
     */
    async init() {
        await this.ensureDirectories();
        await this.generateUserManual();
        await this.generateTroubleshootingGuides();
        await this.generateTutorials();
        await this.generateFAQ();
        await this.generateReference();
        await this.generateSearchIndex();
        await this.generateMainInterface();

        console.log('User documentation generator initialized');
    }

    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        const dirs = [
            this.outputPath,
            path.join(this.outputPath, 'guides'),
            path.join(this.outputPath, 'tutorials'),
            path.join(this.outputPath, 'troubleshooting'),
            path.join(this.outputPath, 'reference'),
            path.join(this.outputPath, 'assets'),
            path.join(this.outputPath, 'faq')
        ];

        for (const dir of dirs) {
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
            }
        }
    }

    /**
     * Generate comprehensive user manual
     */
    async generateUserManual() {
        console.log('Generating user manual...');

        const manualSections = [
            {
                id: 'getting-started',
                title: 'Getting Started',
                content: this.getGettingStartedContent()
            },
            {
                id: 'interface-overview',
                title: 'Interface Overview',
                content: this.getInterfaceOverviewContent()
            },
            {
                id: 'asset-generation',
                title: 'Asset Generation',
                content: this.getAssetGenerationContent()
            },
            {
                id: 'project-management',
                title: 'Project Management',
                content: this.getProjectManagementContent()
            },
            {
                id: 'advanced-features',
                title: 'Advanced Features',
                content: this.getAdvancedFeaturesContent()
            },
            {
                id: 'customization',
                title: 'Customization',
                content: this.getCustomizationContent()
            },
            {
                id: 'export-options',
                title: 'Export Options',
                content: this.getExportOptionsContent()
            },
            {
                id: 'best-practices',
                title: 'Best Practices',
                content: this.getBestPracticesContent()
            }
        ];

        // Generate individual section pages
        for (const section of manualSections) {
            await this.generateManualSection(section);
        }

        // Generate table of contents
        await this.generateTableOfContents(manualSections);

        console.log('User manual generated');
    }

    /**
     * Generate troubleshooting guides
     */
    async generateTroubleshootingGuides() {
        console.log('Generating troubleshooting guides...');

        const troubleshootingTopics = [
            {
                id: 'installation-issues',
                title: 'Installation Issues',
                category: 'Installation',
                content: this.getInstallationIssuesContent()
            },
            {
                id: 'performance-problems',
                title: 'Performance Problems',
                category: 'Performance',
                content: this.getPerformanceProblemsContent()
            },
            {
                id: 'generation-failures',
                title: 'Generation Failures',
                category: 'Generation',
                content: this.getGenerationFailuresContent()
            },
            {
                id: 'export-issues',
                title: 'Export Issues',
                category: 'Export',
                content: this.getExportIssuesContent()
            },
            {
                id: 'plugin-problems',
                title: 'Plugin Problems',
                category: 'Plugins',
                content: this.getPluginProblemsContent()
            },
            {
                id: 'file-corruption',
                title: 'File Corruption',
                category: 'Data',
                content: this.getFileCorruptionContent()
            },
            {
                id: 'memory-issues',
                title: 'Memory Issues',
                category: 'System',
                content: this.getMemoryIssuesContent()
            },
            {
                id: 'crash-recovery',
                title: 'Crash Recovery',
                category: 'System',
                content: this.getCrashRecoveryContent()
            }
        ];

        // Generate individual troubleshooting guides
        for (const topic of troubleshootingTopics) {
            await this.generateTroubleshootingGuide(topic);
        }

        // Generate troubleshooting index
        await this.generateTroubleshootingIndex(troubleshootingTopics);

        console.log('Troubleshooting guides generated');
    }

    /**
     * Generate tutorials
     */
    async generateTutorials() {
        console.log('Generating tutorials...');

        const tutorials = [
            {
                id: 'first-sprite',
                title: 'Creating Your First Sprite',
                level: 'Beginner',
                duration: '15 minutes',
                content: this.getFirstSpriteTutorial()
            },
            {
                id: 'character-animation',
                title: 'Character Animation Basics',
                level: 'Intermediate',
                duration: '30 minutes',
                content: this.getCharacterAnimationTutorial()
            },
            {
                id: 'level-design',
                title: 'Level Design Fundamentals',
                level: 'Intermediate',
                duration: '45 minutes',
                content: this.getLevelDesignTutorial()
            },
            {
                id: 'audio-integration',
                title: 'Audio Integration',
                level: 'Advanced',
                duration: '25 minutes',
                content: this.getAudioIntegrationTutorial()
            },
            {
                id: 'plugin-development',
                title: 'Plugin Development',
                level: 'Advanced',
                duration: '60 minutes',
                content: this.getPluginDevelopmentTutorial()
            },
            {
                id: 'batch-processing',
                title: 'Batch Processing',
                level: 'Intermediate',
                duration: '20 minutes',
                content: this.getBatchProcessingTutorial()
            }
        ];

        // Generate individual tutorials
        for (const tutorial of tutorials) {
            await this.generateTutorial(tutorial);
        }

        // Generate tutorials index
        await this.generateTutorialsIndex(tutorials);

        console.log('Tutorials generated');
    }

    /**
     * Generate FAQ
     */
    async generateFAQ() {
        console.log('Generating FAQ...');

        const faqCategories = [
            {
                id: 'general',
                title: 'General Questions',
                questions: this.getGeneralFAQ()
            },
            {
                id: 'technical',
                title: 'Technical Questions',
                questions: this.getTechnicalFAQ()
            },
            {
                id: 'features',
                title: 'Features & Functionality',
                questions: this.getFeaturesFAQ()
            },
            {
                id: 'troubleshooting',
                title: 'Common Issues',
                questions: this.getTroubleshootingFAQ()
            }
        ];

        // Generate FAQ pages
        for (const category of faqCategories) {
            await this.generateFAQCategory(category);
        }

        // Generate FAQ index
        await this.generateFAQIndex(faqCategories);

        console.log('FAQ generated');
    }

    /**
     * Generate reference documentation
     */
    async generateReference() {
        console.log('Generating reference documentation...');

        const referenceSections = [
            {
                id: 'keyboard-shortcuts',
                title: 'Keyboard Shortcuts',
                content: this.getKeyboardShortcutsReference()
            },
            {
                id: 'file-formats',
                title: 'Supported File Formats',
                content: this.getFileFormatsReference()
            },
            {
                id: 'generator-parameters',
                title: 'Generator Parameters',
                content: this.getGeneratorParametersReference()
            },
            {
                id: 'api-endpoints',
                title: 'API Endpoints',
                content: this.getAPIEndpointsReference()
            },
            {
                id: 'configuration-options',
                title: 'Configuration Options',
                content: this.getConfigurationOptionsReference()
            },
            {
                id: 'system-requirements',
                title: 'System Requirements',
                content: this.getSystemRequirementsReference()
            }
        ];

        // Generate reference pages
        for (const section of referenceSections) {
            await this.generateReferenceSection(section);
        }

        // Generate reference index
        await this.generateReferenceIndex(referenceSections);

        console.log('Reference documentation generated');
    }

    /**
     * Generate search index
     */
    async generateSearchIndex() {
        console.log('Generating search index...');

        const searchIndex = {
            pages: [],
            keywords: new Map(),
            categories: new Map()
        };

        // Collect all documentation content
        const allContent = [
            ...Array.from(this.documentation.guides.values()),
            ...Array.from(this.documentation.tutorials.values()),
            ...Array.from(this.documentation.troubleshooting.values()),
            ...Array.from(this.documentation.faq.values()),
            ...Array.from(this.documentation.reference.values())
        ];

        for (const content of allContent) {
            const pageData = {
                id: content.id,
                title: content.title,
                category: content.category,
                content: this.extractSearchableText(content.content),
                url: content.url,
                keywords: this.extractKeywords(content.content)
            };

            searchIndex.pages.push(pageData);

            // Index keywords
            for (const keyword of pageData.keywords) {
                if (!searchIndex.keywords.has(keyword)) {
                    searchIndex.keywords.set(keyword, []);
                }
                searchIndex.keywords.get(keyword).push(pageData.id);
            }

            // Index categories
            if (!searchIndex.categories.has(content.category)) {
                searchIndex.categories.set(content.category, []);
            }
            searchIndex.categories.get(content.category).push(pageData.id);
        }

        // Save search index
        await fs.writeFile(
            path.join(this.outputPath, 'assets', 'search-index.json'),
            JSON.stringify({
                pages: searchIndex.pages,
                keywords: Object.fromEntries(searchIndex.keywords),
                categories: Object.fromEntries(searchIndex.categories)
            }, null, 2)
        );

        console.log('Search index generated');
    }

    /**
     * Generate main user documentation interface
     */
    async generateMainInterface() {
        console.log('Generating main documentation interface...');

        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TPT Asset Editor Desktop - User Documentation</title>
    <link rel="stylesheet" href="./assets/styles.css">
    <link rel="stylesheet" href="./assets/prism.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1>TPT Asset Editor Desktop</h1>
            <p>User Documentation & Guides</p>
            <nav>
                <div class="search-container">
                    <input type="search" id="search" placeholder="Search documentation...">
                    <button id="search-button">Search</button>
                </div>
            </nav>
        </div>
    </header>

    <nav class="main-nav">
        <div class="nav-container">
            <ul>
                <li><a href="#manual" class="nav-link" data-section="manual">User Manual</a></li>
                <li><a href="#tutorials" class="nav-link" data-section="tutorials">Tutorials</a></li>
                <li><a href="#troubleshooting" class="nav-link" data-section="troubleshooting">Troubleshooting</a></li>
                <li><a href="#faq" class="nav-link" data-section="faq">FAQ</a></li>
                <li><a href="#reference" class="nav-link" data-section="reference">Reference</a></li>
            </ul>
        </div>
    </nav>

    <main>
        <aside id="sidebar">
            <div id="sidebar-content">
                <!-- Dynamic sidebar content -->
            </div>
        </aside>

        <section id="content">
            <div id="welcome-section" class="content-section active">
                <h2>Welcome to TPT Asset Editor Desktop</h2>
                <p>Your comprehensive guide to creating, managing, and exporting game assets with professional tools and workflows.</p>

                <div class="quick-start">
                    <h3>Quick Start</h3>
                    <div class="quick-start-grid">
                        <div class="quick-start-item">
                            <h4>🚀 Getting Started</h4>
                            <p>Learn the basics and create your first asset in minutes.</p>
                            <a href="./manual/getting-started.html" class="cta-button">Start Here</a>
                        </div>
                        <div class="quick-start-item">
                            <h4>🎨 Asset Generation</h4>
                            <p>Discover powerful generators for sprites, audio, and more.</p>
                            <a href="./manual/asset-generation.html" class="cta-button">Explore Generators</a>
                        </div>
                        <div class="quick-start-item">
                            <h4>🔧 Troubleshooting</h4>
                            <p>Find solutions to common issues and problems.</p>
                            <a href="./troubleshooting/index.html" class="cta-button">Get Help</a>
                        </div>
                    </div>
                </div>

                <div class="features-overview">
                    <h3>Key Features</h3>
                    <ul class="features-list">
                        <li><strong>Advanced Generators:</strong> AI-powered asset creation with customizable parameters</li>
                        <li><strong>Batch Processing:</strong> Generate multiple assets simultaneously</li>
                        <li><strong>Plugin System:</strong> Extend functionality with community plugins</li>
                        <li><strong>Export Options:</strong> Support for multiple game engines and formats</li>
                        <li><strong>Project Management:</strong> Organize assets with advanced project tools</li>
                        <li><strong>Real-time Preview:</strong> See changes instantly with live preview</li>
                    </ul>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="footer-content">
            <p>&copy; 2025 TPT Asset Editor Desktop. Comprehensive documentation for users and developers.</p>
            <div class="footer-links">
                <a href="./manual/best-practices.html">Best Practices</a> |
                <a href="./reference/keyboard-shortcuts.html">Keyboard Shortcuts</a> |
                <a href="./reference/system-requirements.html">System Requirements</a>
            </div>
        </div>
    </footer>

    <script src="./assets/prism.js"></script>
    <script src="./assets/search.js"></script>
    <script src="./assets/navigation.js"></script>
</body>
</html>`;

        await fs.writeFile(path.join(this.outputPath, 'index.html'), template);
        await this.generateStyles();
        await this.generateScripts();

        console.log('Main documentation interface generated');
    }

    /**
     * Generate CSS styles
     */
    async generateStyles() {
        const styles = `
/* User Documentation Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f8f9fa;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    font-weight: 300;
}

header p {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 1.5rem;
}

.search-container {
    display: flex;
    gap: 0.5rem;
    max-width: 500px;
}

#search {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

#search-button {
    padding: 0.75rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.3s ease;
}

#search-button:hover {
    background: #218838;
}

.main-nav {
    background: white;
    border-bottom: 1px solid #e9ecef;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.main-nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.main-nav a {
    display: block;
    padding: 1rem 0;
    color: #495057;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
}

.main-nav a:hover,
.main-nav a.active {
    color: #667eea;
    border-bottom-color: #667eea;
}

main {
    display: flex;
    min-height: calc(100vh - 200px);
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    gap: 2rem;
}

aside {
    width: 300px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 1.5rem;
    height: fit-content;
    position: sticky;
    top: 2rem;
}

aside h3 {
    color: #495057;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

aside ul {
    list-style: none;
}

aside li {
    margin-bottom: 0.5rem;
}

aside a {
    color: #667eea;
    text-decoration: none;
    display: block;
    padding: 0.5rem 0;
    border-radius: 4px;
    transition: background 0.3s ease;
}

aside a:hover {
    background: #f8f9fa;
    color: #764ba2;
}

#content {
    flex: 1;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 2rem;
    min-height: 600px;
}

.content-section {
    display: none;
}

.content-section.active {
    display: block;
}

.quick-start-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.quick-start-item {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.quick-start-item h4 {
    color: #495057;
    margin-bottom: 0.5rem;
}

.quick-start-item p {
    color: #6c757d;
    margin-bottom: 1rem;
}

.cta-button {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: background 0.3s ease;
}

.cta-button:hover {
    background: #764ba2;
}

.features-list {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #28a745;
}

.features-list li {
    margin-bottom: 0.5rem;
    padding-left: 1rem;
}

.features-list strong {
    color: #495057;
}

.tutorial-card,
.troubleshooting-card,
.faq-item {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: box-shadow 0.3s ease;
}

.tutorial-card:hover,
.troubleshooting-card:hover {
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.tutorial-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #6c757d;
}

.tutorial-meta span {
    background: #e9ecef;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
}

.step-number {
    display: inline-block;
    width: 30px;
    height: 30px;
    background: #667eea;
    color: white;
    border-radius: 50%;
    text-align: center;
    line-height: 30px;
    font-weight: bold;
    margin-right: 1rem;
}

.code-example {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    overflow-x: auto;
}

.note, .warning, .tip {
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
}

.note {
    background: #d1ecf1;
    border-left: 4px solid #17a2b8;
    color: #0c5460;
}

.warning {
    background: #f8d7da;
    border-left: 4px solid #dc3545;
    color: #721c24;
}

.tip {
    background: #d4edda;
    border-left: 4px solid #28a745;
    color: #155724;
}

footer {
    background: #343a40;
    color: white;
    padding: 2rem 0;
    margin-top: 2rem;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
}

.footer-links {
    margin-top: 1rem;
}

.footer-links a {
    color: #adb5bd;
    text-decoration: none;
    margin: 0 1rem;
}

.footer-links a:hover {
    color: white;
}

/* Responsive design */
@media (max-width: 768px) {
    main {
        flex-direction: column;
        padding: 1rem;
    }

    aside {
        width: 100%;
        position: static;
    }

    .main-nav ul {
        flex-direction: column;
        gap: 0;
    }

    .main-nav li {
        border-bottom: 1px solid #e9ecef;
    }

    .quick-start-grid {
        grid-template-columns: 1fr;
    }

    .search-container {
        flex-direction: column;
        max-width: none;
    }

    #search {
        border-radius: 4px;
    }

    #search-button {
        border-radius: 4px;
    }
}

/* Print styles */
@media print {
    header, nav, aside, footer {
        display: none;
    }

    #content {
        box-shadow: none;
        border: none;
        padding: 0;
    }
}
`;

        await fs.writeFile(path.join(this.outputPath, 'assets', 'styles.css'), styles);
    }

    /**
     * Generate JavaScript for interactivity
     */
    async generateScripts() {
        const searchScript = `
// User Documentation Search
class DocumentationSearch {
    constructor() {
        this.searchIndex = null;
        this.searchInput = document.getElementById('search');
        this.searchButton = document.getElementById('search-button');
        this.resultsContainer = null;

        this.init();
    }

    async init() {
        await this.loadSearchIndex();
        this.setupEventListeners();
        this.createResultsContainer();
    }

    async loadSearchIndex() {
        try {
            const response = await fetch('./assets/search-index.json');
            this.searchIndex = await response.json();
        } catch (error) {
            console.error('Failed to load search index:', error);
        }
    }

    setupEventListeners() {
        this.searchButton.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    createResultsContainer() {
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.id = 'search-results';
        this.resultsContainer.style.cssText = \`
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            max-height: 400px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        \`;

        this.searchInput.parentNode.style.position = 'relative';
        this.searchInput.parentNode.appendChild(this.resultsContainer);
    }

    performSearch() {
        const query = this.searchInput.value.trim();
        if (!query || !this.searchIndex) {
            this.hideResults();
            return;
        }

        const results = this.search(query);
        this.displayResults(results, query);
    }

    search(query) {
        const searchTerm = query.toLowerCase();
        const results = [];

        for (const page of this.searchIndex.pages) {
            let score = 0;

            // Title match
            if (page.title.toLowerCase().includes(searchTerm)) {
                score += 10;
            }

            // Content match
            const contentMatches = (page.content.toLowerCase().match(new RegExp(searchTerm, 'g')) || []).length;
            score += contentMatches * 2;

            // Keyword match
            if (page.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) {
                score += 5;
            }

            if (score > 0) {
                results.push({
                    ...page,
                    score,
                    highlights: this.generateHighlights(page.content, searchTerm)
                });
            }
        }

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    generateHighlights(content, searchTerm) {
        const regex = new RegExp(\`(\${searchTerm})\`, 'gi');
        const snippet = content.substring(0, 200);
        return snippet.replace(regex, '<mark>$1</mark>');
    }

    displayResults(results, query) {
        this.resultsContainer.innerHTML = '';

        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div style="padding: 1rem; color: #6c757d;">No results found</div>';
        } else {
            for (const result of results) {
                const item = document.createElement('div');
                item.style.cssText = \`
                    padding: 1rem;
                    border-bottom: 1px solid #e9ecef;
                    cursor: pointer;
                    transition: background 0.3s ease;
                \`;

                item.innerHTML = \`
                    <div style="font-weight: bold; color: #495057; margin-bottom: 0.5rem;">
                        \${result.title}
                        <span style="font-size: 0.8em; color: #6c757d; margin-left: 0.5rem;">
                            \${result.category}
                        </span>
                    </div>
                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 0.5rem;">
                        \${result.highlights}...
                    </div>
                    <div style="font-size: 0.8em; color: #adb5bd;">
                        Score: \${result.score}
                    </div>
                \`;

                item.addEventListener('click', () => {
                    window.location.href = result.url;
                });

                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f8f9fa';
                });

                item.addEventListener('mouseleave', () => {
                    item.style.background = 'white';
                });

                this.resultsContainer.appendChild(item);
            }
        }

        this.resultsContainer.style.display = 'block';
    }

    hideResults() {
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'none';
        }
    }
}

// Navigation handler
class DocumentationNavigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.contentSections = document.querySelectorAll('.content-section');
        this.sidebar = document.getElementById('sidebar-content');

        this.init();
    }

    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // Load initial section
        this.showSection('manual');
    }

    async showSection(sectionId) {
        // Update navigation
        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });

        // Update content
        this.contentSections.forEach(section => {
            section.classList.toggle('active', section.id === \`\${sectionId}-section\`);
        });

        // Update sidebar
        await this.loadSidebarContent(sectionId);
    }

    async loadSidebarContent(sectionId) {
        let content = '';

        switch (sectionId) {
            case 'manual':
                content = this.getManualSidebar();
                break;
            case 'tutorials':
                content = this.getTutorialsSidebar();
                break;
            case 'troubleshooting':
                content = this.getTroubleshootingSidebar();
                break;
            case 'faq':
                content = this.getFAQSidebar();
                break;
            case 'reference':
                content = this.getReferenceSidebar();
                break;
        }

        this.sidebar.innerHTML = content;
    }

    getManualSidebar() {
        return \`
            <h3>User Manual</h3>
            <ul>
                <li><a href="./manual/getting-started.html">Getting Started</a></li>
                <li><a href="./manual/interface-overview.html">Interface Overview</a></li>
                <li><a href="./manual/asset-generation.html">Asset Generation</a></li>
                <li><a href="./manual/project-management.html">Project Management</a></li>
                <li><a href="./manual/advanced-features.html">Advanced Features</a></li>
                <li><a href="./manual/customization.html">Customization</a></li>
                <li><a href="./manual/export-options.html">Export Options</a></li>
                <li><a href="./manual/best-practices.html">Best Practices</a></li>
            </ul>
        \`;
    }

    getTutorialsSidebar() {
        return \`
            <h3>Tutorials</h3>
            <ul>
                <li><a href="./tutorials/first-sprite.html">Creating Your First Sprite</a></li>
                <li><a href="./tutorials/character-animation.html">Character Animation Basics</a></li>
                <li><a href="./tutorials/level-design.html">Level Design Fundamentals</a></li>
                <li><a href="./tutorials/audio-integration.html">Audio Integration</a></li>
                <li><a href="./tutorials/plugin-development.html">Plugin Development</a></li>
                <li><a href="./tutorials/batch-processing.html">Batch Processing</a></li>
            </ul>
        \`;
    }

    getTroubleshootingSidebar() {
        return \`
            <h3>Troubleshooting</h3>
            <h4>Installation</h4>
            <ul>
                <li><a href="./troubleshooting/installation-issues.html">Installation Issues</a></li>
            </ul>
            <h4>Performance</h4>
            <ul>
                <li><a href="./troubleshooting/performance-problems.html">Performance Problems</a></li>
                <li><a href="./troubleshooting/memory-issues.html">Memory Issues</a></li>
            </ul>
            <h4>Generation</h4>
            <ul>
                <li><a href="./troubleshooting/generation-failures.html">Generation Failures</a></li>
            </ul>
            <h4>System</h4>
            <ul>
                <li><a href="./troubleshooting/crash-recovery.html">Crash Recovery</a></li>
                <li><a href="./troubleshooting/file-corruption.html">File Corruption</a></li>
            </ul>
        \`;
    }

    getFAQSidebar() {
        return \`
            <h3>FAQ</h3>
            <ul>
                <li><a href="./faq/general.html">General Questions</a></li>
                <li><a href="./faq/technical.html">Technical Questions</a></li>
                <li><a href="./faq/features.html">Features & Functionality</a></li>
                <li><a href="./faq/troubleshooting.html">Common Issues</a></li>
            </ul>
        \`;
    }

    getReferenceSidebar() {
        return \`
            <h3>Reference</h3>
            <ul>
                <li><a href="./reference/keyboard-shortcuts.html">Keyboard Shortcuts</a></li>
                <li><a href="./reference/file-formats.html">File Formats</a></li>
                <li><a href="./reference/generator-parameters.html">Generator Parameters</a></li>
                <li><a href="./reference/api-endpoints.html">API Endpoints</a></li>
                <li><a href="./reference/configuration-options.html">Configuration</a></li>
                <li><a href="./reference/system-requirements.html">System Requirements</a></li>
            </ul>
        \`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DocumentationSearch();
    new DocumentationNavigation();
});
`;

        await fs.writeFile(path.join(this.outputPath, 'assets', 'search.js'), searchScript);
        await fs.writeFile(path.join(this.outputPath, 'assets', 'navigation.js'), ''); // Empty for now
    }

    // Content generation methods would go here...
    // These would contain the actual content for each section

    getGettingStartedContent() { return 'Getting started content...'; }
    getInterfaceOverviewContent() { return 'Interface overview content...'; }
    getAssetGenerationContent() { return 'Asset generation content...'; }
    getProjectManagementContent() { return 'Project management content...'; }
    getAdvancedFeaturesContent() { return 'Advanced features content...'; }
    getCustomizationContent() { return 'Customization content...'; }
    getExportOptionsContent() { return 'Export options content...'; }
    getBestPracticesContent() { return 'Best practices content...'; }

    getInstallationIssuesContent() { return 'Installation issues content...'; }
    getPerformanceProblemsContent() { return 'Performance problems content...'; }
    getGenerationFailuresContent() { return 'Generation failures content...'; }
    getExportIssuesContent() { return 'Export issues content...'; }
    getPluginProblemsContent() { return 'Plugin problems content...'; }
    getFileCorruptionContent() { return 'File corruption content...'; }
    getMemoryIssuesContent() { return 'Memory issues content...'; }
    getCrashRecoveryContent() { return 'Crash recovery content...'; }

    getFirstSpriteTutorial() { return 'First sprite tutorial content...'; }
    getCharacterAnimationTutorial() { return 'Character animation tutorial content...'; }
    getLevelDesignTutorial() { return 'Level design tutorial content...'; }
    getAudioIntegrationTutorial() { return 'Audio integration tutorial content...'; }
    getPluginDevelopmentTutorial() { return 'Plugin development tutorial content...'; }
    getBatchProcessingTutorial() { return 'Batch processing tutorial content...'; }

    getGeneralFAQ() { return []; }
    getTechnicalFAQ() { return []; }
    getFeaturesFAQ() { return []; }
    getTroubleshootingFAQ() { return []; }

    getKeyboardShortcutsReference() { return 'Keyboard shortcuts reference...'; }
    getFileFormatsReference() { return 'File formats reference...'; }
    getGeneratorParametersReference() { return 'Generator parameters reference...'; }
    getAPIEndpointsReference() { return 'API endpoints reference...'; }
    getConfigurationOptionsReference() { return 'Configuration options reference...'; }
    getSystemRequirementsReference() { return 'System requirements reference...'; }

    /**
     * Extract searchable text from content
     */
    extractSearchableText(content) {
        // Remove HTML tags and extract plain text
        return content.replace(/<[^>]*>/g, '').toLowerCase();
    }

    /**
     * Extract keywords from content
     */
    extractKeywords(content) {
        const text = this.extractSearchableText(content);
        const words = text.split(/\s+/);
        const keywords = new Set();

        // Common keywords to extract
        const commonKeywords = [
            'generate', 'create', 'export', 'import', 'project', 'asset', 'sprite',
            'audio', 'plugin', 'tutorial', 'troubleshoot', 'error', 'fix', 'help',
            'guide', 'reference', 'configuration', 'settings', 'performance'
        ];

        for (const word of words) {
            if (word.length > 3 && commonKeywords.some(keyword => word.includes(keyword))) {
                keywords.add(word);
            }
        }

        return Array.from(keywords);
    }

    /**
     * Generate manual section page
     */
    async generateManualSection(section) {
        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${section.title} - User Manual</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1><a href="../index.html">User Documentation</a></h1>
        </div>
    </header>

    <main>
        <section>
            <h2>${section.title}</h2>
            <div class="content">
                ${section.content}
            </div>
            <div class="navigation">
                <a href="../manual/" class="cta-button">← Back to Manual</a>
            </div>
        </section>
    </main>
</body>
</html>`;

        await fs.writeFile(path.join(this.outputPath, 'manual', `${section.id}.html`), template);
    }

    /**
     * Generate table of contents
     */
    async generateTableOfContents(sections) {
        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Manual - Table of Contents</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1><a href="../index.html">User Documentation</a></h1>
        </div>
    </header>

    <main>
        <section>
            <h2>User Manual</h2>
            <p>This comprehensive manual will guide you through all aspects of using TPT Asset Editor Desktop effectively.</p>

            <div class="toc">
                ${sections.map(section => `
                <div class="toc-item">
                    <h3><a href="./${section.id}.html">${section.title}</a></h3>
                    <p>${this.getSectionDescription(section.id)}</p>
                </div>
                `).join('')}
            </div>
        </section>
    </main>
</body>
</html>`;

        await fs.writeFile(path.join(this.outputPath, 'manual', 'index.html'), template);
    }

    /**
     * Get section description
     */
    getSectionDescription(sectionId) {
        const descriptions = {
            'getting-started': 'Learn the basics and get up and running quickly',
            'interface-overview': 'Explore the user interface and main components',
            'asset-generation': 'Master the powerful asset generation tools',
            'project-management': 'Organize and manage your projects effectively',
            'advanced-features': 'Discover advanced features and capabilities',
            'customization': 'Customize the editor to fit your workflow',
            'export-options': 'Learn about export formats and options',
            'best-practices': 'Follow best practices for optimal results'
        };

        return descriptions[sectionId] || 'Learn about this topic';
    }

    /**
     * Generate troubleshooting guide
     */
    async generateTroubleshootingGuide(topic) {
        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic.title} - Troubleshooting</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1><a href="../index.html">User Documentation</a></h1>
        </div>
    </header>

    <main>
        <section>
            <h2>${topic.title}</h2>
            <p class="category">Category: ${topic.category}</p>
            <div class="content">
                ${topic.content}
            </div>
            <div class="navigation">
                <a href="../troubleshooting/" class="cta-button">← Back to Troubleshooting</a>
            </div>
        </section>
    </main>
</body>
</html>`;

        await fs.writeFile(path.join(this.outputPath, 'troubleshooting', `${topic.id}.html`), template);
    }

    /**
     * Generate troubleshooting index
     */
    async generateTroubleshootingIndex(topics) {
        const categories = {};
        topics.forEach(topic => {
            if (!categories[topic.category]) {
                categories[topic.category] = [];
            }
            categories[topic.category].push(topic);
        });

        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Troubleshooting Guide</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1><a href="../index.html">User Documentation</a></h1>
        </div>
    </header>

    <main>
        <section>
            <h2>Troubleshooting Guide</h2>
            <p>Find solutions to common issues and problems you might encounter while using TPT Asset Editor Desktop.</p>

            ${Object.entries(categories).map(([category, categoryTopics]) => `
            <div class="troubleshooting-category">
                <h3>${category}</h3>
                <div class="troubleshooting-grid">
                    ${categoryTopics.map(topic => `
                    <div class="troubleshooting-card">
                        <h4><a href="./${topic.id}.html">${topic.title}</a></h4>
                        <p>Learn how to resolve ${topic.title.toLowerCase()}.</p>
                    </div>
                    `).join('')}
                </div>
            </div>
            `).join('')}
        </section>
    </main>
</body>
</html>`;

        await fs.writeFile(path.join(this.outputPath, 'troubleshooting', 'index.html'), template);
    }

    /**
     * Generate tutorial
     */
    async generateTutorial(tutorial) {
        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tutorial.title} - Tutorial</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1><a href="../index.html">User Documentation</a></h1>
        </div>
    </header>

    <main>
        <section>
            <h2>${tutorial.title}</h2>
            <div class="tutorial-meta">
                <span>Level: ${tutorial.level}</span>
                <span>Duration: ${tutorial.duration}</span>
            </div>
            <div class="content">
                ${tutorial.content}
            </div>
            <div class="navigation">
                <a href="../tutorials/" class="cta-button">← Back to Tutorials</a>
            </div>
        </section>
    </main>
</body>
</html>`;

        await fs.writeFile(path.join(this.outputPath, 'tutorials', `${tutorial.id}.html
