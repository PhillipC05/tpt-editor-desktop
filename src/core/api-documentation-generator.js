/**
 * API Documentation Generator
 * Comprehensive API documentation generation with interactive docs and examples
 */

const fs = require('fs').promises;
const path = require('path');

class APIDocumentationGenerator {
    constructor(options = {}) {
        this.outputPath = options.outputPath || path.join(process.cwd(), 'docs', 'api');
        this.templatePath = options.templatePath || path.join(process.cwd(), 'docs', 'templates');
        this.sourcePaths = options.sourcePaths || [
            path.join(process.cwd(), 'src', 'core'),
            path.join(process.cwd(), 'src', 'generators'),
            path.join(process.cwd(), 'src', 'utils'),
            path.join(process.cwd(), 'src', 'ui'),
            path.join(process.cwd(), 'src', 'plugins')
        ];

        this.documentation = {
            modules: new Map(),
            classes: new Map(),
            functions: new Map(),
            methods: new Map(),
            examples: new Map(),
            guides: new Map()
        };

        this.init();
    }

    /**
     * Initialize the documentation generator
     */
    async init() {
        await this.ensureDirectories();
        await this.parseSourceFiles();
        await this.generateDocumentation();

        console.log('API documentation generator initialized');
    }

    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        const dirs = [
            this.outputPath,
            path.join(this.outputPath, 'modules'),
            path.join(this.outputPath, 'classes'),
            path.join(this.outputPath, 'examples'),
            path.join(this.outputPath, 'guides'),
            path.join(this.outputPath, 'assets')
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
     * Parse source files for documentation
     */
    async parseSourceFiles() {
        for (const sourcePath of this.sourcePaths) {
            try {
                await this.parseDirectory(sourcePath);
            } catch (error) {
                console.warn(`Failed to parse directory ${sourcePath}:`, error.message);
            }
        }

        console.log(`Parsed ${this.documentation.modules.size} modules, ${this.documentation.classes.size} classes, ${this.documentation.functions.size} functions`);
    }

    /**
     * Parse a directory recursively
     */
    async parseDirectory(dirPath, moduleName = '') {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                const subModuleName = moduleName ? `${moduleName}.${entry.name}` : entry.name;
                await this.parseDirectory(fullPath, subModuleName);
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                const relativeModuleName = moduleName || path.basename(entry.name, '.js');
                await this.parseJavaScriptFile(fullPath, relativeModuleName);
            }
        }
    }

    /**
     * Parse a JavaScript file for documentation
     */
    async parseJavaScriptFile(filePath, moduleName) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const docBlocks = this.extractDocBlocks(content);
            const moduleDoc = this.parseModuleDocumentation(docBlocks, filePath, moduleName);

            if (moduleDoc) {
                this.documentation.modules.set(moduleName, moduleDoc);
            }

            // Parse classes, functions, and methods
            const parsedItems = this.parseCodeItems(content, docBlocks, moduleName);
            this.mergeParsedItems(parsedItems);

        } catch (error) {
            console.warn(`Failed to parse file ${filePath}:`, error.message);
        }
    }

    /**
     * Extract JSDoc blocks from content
     */
    extractDocBlocks(content) {
        const docBlocks = [];
        const lines = content.split('\n');
        let currentBlock = null;
        let inBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('/**')) {
                currentBlock = {
                    lines: [line],
                    startLine: i,
                    endLine: i
                };
                inBlock = true;
            } else if (inBlock && line.startsWith('*/')) {
                currentBlock.lines.push(line);
                currentBlock.endLine = i;
                docBlocks.push(currentBlock);
                currentBlock = null;
                inBlock = false;
            } else if (inBlock) {
                currentBlock.lines.push(line);
            }
        }

        return docBlocks;
    }

    /**
     * Parse module documentation
     */
    parseModuleDocumentation(docBlocks, filePath, moduleName) {
        // Find module-level documentation (usually at the top)
        const moduleBlock = docBlocks.find(block => {
            const nextLines = this.getNextCodeLines(filePath, block.endLine, 5);
            return nextLines.some(line =>
                line.includes('module.exports') ||
                line.includes('class ') ||
                line.includes('function ')
            );
        });

        if (!moduleBlock) return null;

        const parsed = this.parseDocBlock(moduleBlock.lines);
        return {
            name: moduleName,
            file: path.relative(process.cwd(), filePath),
            description: parsed.description,
            examples: parsed.examples,
            author: parsed.author,
            version: parsed.version,
            since: parsed.since,
            deprecated: parsed.deprecated,
            see: parsed.see,
            todo: parsed.todo
        };
    }

    /**
     * Parse code items (classes, functions, methods)
     */
    parseCodeItems(content, docBlocks, moduleName) {
        const items = {
            classes: new Map(),
            functions: new Map(),
            methods: new Map()
        };

        for (const block of docBlocks) {
            const nextLines = this.getNextCodeLines(content, block.endLine, 10);
            const parsed = this.parseDocBlock(block.lines);
            const codeItem = this.extractCodeItem(nextLines, parsed);

            if (codeItem) {
                codeItem.module = moduleName;
                codeItem.line = block.startLine;

                switch (codeItem.type) {
                    case 'class':
                        items.classes.set(codeItem.name, codeItem);
                        break;
                    case 'function':
                        items.functions.set(codeItem.name, codeItem);
                        break;
                    case 'method':
                        items.methods.set(`${codeItem.className || 'global'}.${codeItem.name}`, codeItem);
                        break;
                }
            }
        }

        return items;
    }

    /**
     * Extract code item from next lines
     */
    extractCodeItem(nextLines, parsed) {
        for (const line of nextLines) {
            const trimmed = line.trim();

            // Class definition
            const classMatch = trimmed.match(/^(?:export\s+)?class\s+(\w+)/);
            if (classMatch) {
                return {
                    type: 'class',
                    name: classMatch[1],
                    ...parsed
                };
            }

            // Function definition
            const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
            if (funcMatch) {
                return {
                    type: 'function',
                    name: funcMatch[1],
                    ...parsed
                };
            }

            // Method definition (inside class)
            const methodMatch = trimmed.match(/^\s*(?:async\s+)?(\w+)\s*\(/);
            if (methodMatch && !trimmed.includes('function') && !trimmed.includes('class')) {
                return {
                    type: 'method',
                    name: methodMatch[1],
                    ...parsed
                };
            }

            // Arrow function or const function
            const arrowMatch = trimmed.match(/^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?/);
            if (arrowMatch) {
                return {
                    type: 'function',
                    name: arrowMatch[1],
                    ...parsed
                };
            }
        }

        return null;
    }

    /**
     * Parse JSDoc block
     */
    parseDocBlock(lines) {
        const parsed = {
            description: '',
            params: [],
            returns: null,
            throws: [],
            examples: [],
            author: null,
            version: null,
            since: null,
            deprecated: false,
            see: [],
            todo: []
        };

        let currentSection = 'description';
        let currentExample = null;

        for (const line of lines) {
            const trimmed = line.replace(/^\s*\*\s?/, '').trim();

            if (trimmed.startsWith('@param')) {
                const paramMatch = trimmed.match(/@param\s+{([^}]+)}\s+(\w+)\s*(.*)/);
                if (paramMatch) {
                    parsed.params.push({
                        type: paramMatch[1],
                        name: paramMatch[2],
                        description: paramMatch[3]
                    });
                }
                currentSection = 'param';
            } else if (trimmed.startsWith('@returns') || trimmed.startsWith('@return')) {
                const returnMatch = trimmed.match(/@returns?\s+{([^}]+)}\s*(.*)/);
                if (returnMatch) {
                    parsed.returns = {
                        type: returnMatch[1],
                        description: returnMatch[2]
                    };
                }
                currentSection = 'returns';
            } else if (trimmed.startsWith('@throws') || trimmed.startsWith('@exception')) {
                const throwMatch = trimmed.match(/@throws?\s+{([^}]+)}\s*(.*)/);
                if (throwMatch) {
                    parsed.throws.push({
                        type: throwMatch[1],
                        description: throwMatch[2]
                    });
                }
                currentSection = 'throws';
            } else if (trimmed.startsWith('@example')) {
                currentExample = '';
                parsed.examples.push(currentExample);
                currentSection = 'example';
            } else if (trimmed.startsWith('@author')) {
                parsed.author = trimmed.replace('@author', '').trim();
                currentSection = 'author';
            } else if (trimmed.startsWith('@version')) {
                parsed.version = trimmed.replace('@version', '').trim();
                currentSection = 'version';
            } else if (trimmed.startsWith('@since')) {
                parsed.since = trimmed.replace('@since', '').trim();
                currentSection = 'since';
            } else if (trimmed.startsWith('@deprecated')) {
                parsed.deprecated = true;
                currentSection = 'deprecated';
            } else if (trimmed.startsWith('@see')) {
                parsed.see.push(trimmed.replace('@see', '').trim());
                currentSection = 'see';
            } else if (trimmed.startsWith('@todo')) {
                parsed.todo.push(trimmed.replace('@todo', '').trim());
                currentSection = 'todo';
            } else if (trimmed === '') {
                // Empty line, continue with current section
            } else {
                // Content line
                if (currentSection === 'description' && !parsed.description) {
                    parsed.description = trimmed;
                } else if (currentSection === 'example' && currentExample !== null) {
                    currentExample += (currentExample ? '\n' : '') + trimmed;
                }
            }
        }

        return parsed;
    }

    /**
     * Get next code lines after a line number
     */
    getNextCodeLines(content, startLine, count) {
        const lines = content.split('\n');
        const result = [];

        for (let i = startLine + 1; i < Math.min(startLine + count + 1, lines.length); i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('*') && !line.startsWith('/*') && !line.startsWith('//')) {
                result.push(line);
            }
        }

        return result;
    }

    /**
     * Merge parsed items into documentation
     */
    mergeParsedItems(items) {
        // Merge classes
        for (const [name, classDoc] of items.classes) {
            this.documentation.classes.set(name, classDoc);
        }

        // Merge functions
        for (const [name, funcDoc] of items.functions) {
            this.documentation.functions.set(name, funcDoc);
        }

        // Merge methods
        for (const [name, methodDoc] of items.methods) {
            this.documentation.methods.set(name, methodDoc);
        }
    }

    /**
     * Generate documentation files
     */
    async generateDocumentation() {
        await this.generateIndexPage();
        await this.generateModulePages();
        await this.generateClassPages();
        await this.generateFunctionPages();
        await this.generateExamples();
        await this.generateGuides();
        await this.generateSearchIndex();

        console.log('Documentation generated successfully');
    }

    /**
     * Generate main index page
     */
    async generateIndexPage() {
        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TPT Asset Editor Desktop - API Documentation</title>
    <link rel="stylesheet" href="./assets/styles.css">
</head>
<body>
    <header>
        <h1>TPT Asset Editor Desktop</h1>
        <p>API Documentation</p>
        <nav>
            <input type="search" id="search" placeholder="Search API...">
        </nav>
    </header>

    <main>
        <aside id="sidebar">
            <nav>
                <h3>Modules</h3>
                <ul id="module-list">
                    ${Array.from(this.documentation.modules.keys()).map(name =>
                        `<li><a href="./modules/${name}.html">${name}</a></li>`
                    ).join('')}
                </ul>

                <h3>Classes</h3>
                <ul id="class-list">
                    ${Array.from(this.documentation.classes.keys()).map(name =>
                        `<li><a href="./classes/${name}.html">${name}</a></li>`
                    ).join('')}
                </ul>

                <h3>Functions</h3>
                <ul id="function-list">
                    ${Array.from(this.documentation.functions.keys()).map(name =>
                        `<li><a href="./functions/${name}.html">${name}</a></li>`
                    ).join('')}
                </ul>
            </nav>
        </aside>

        <section id="content">
            <h2>Welcome to TPT Asset Editor Desktop API</h2>
            <p>This comprehensive API documentation provides detailed information about all modules, classes, functions, and methods available in the TPT Asset Editor Desktop application.</p>

            <div class="stats">
                <div class="stat">
                    <h3>${this.documentation.modules.size}</h3>
                    <p>Modules</p>
                </div>
                <div class="stat">
                    <h3>${this.documentation.classes.size}</h3>
                    <p>Classes</p>
                </div>
                <div class="stat">
                    <h3>${this.documentation.functions.size}</h3>
                    <p>Functions</p>
                </div>
                <div class="stat">
                    <h3>${this.documentation.methods.size}</h3>
                    <p>Methods</p>
                </div>
            </div>

            <h3>Getting Started</h3>
            <ul>
                <li><a href="./guides/getting-started.html">Getting Started Guide</a></li>
                <li><a href="./guides/architecture.html">Architecture Overview</a></li>
                <li><a href="./examples/">Code Examples</a></li>
            </ul>
        </section>
    </main>

    <script src="./assets/search.js"></script>
</body>
</html>`;

        await fs.writeFile(path.join(this.outputPath, 'index.html'), template);
    }

    /**
     * Generate module pages
     */
    async generateModulePages() {
        for (const [name, moduleDoc] of this.documentation.modules) {
            const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Module: ${name} - API Documentation</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <h1><a href="../index.html">API Documentation</a></h1>
    </header>

    <main>
        <section>
            <h2>Module: ${name}</h2>
            <p class="file-path">${moduleDoc.file}</p>

            <div class="description">
                ${this.formatMarkdown(moduleDoc.description)}
            </div>

            ${moduleDoc.examples.length > 0 ? `
            <h3>Examples</h3>
            ${moduleDoc.examples.map(example => `
                <pre><code>${this.escapeHtml(example)}</code></pre>
            `).join('')}
            ` : ''}

            ${moduleDoc.author ? `<p><strong>Author:</strong> ${moduleDoc.author}</p>` : ''}
            ${moduleDoc.version ? `<p><strong>Version:</strong> ${moduleDoc.version}</p>` : ''}
            ${moduleDoc.since ? `<p><strong>Since:</strong> ${moduleDoc.since}</p>` : ''}
            ${moduleDoc.deprecated ? `<p class="deprecated"><strong>Deprecated</strong></p>` : ''}

            ${moduleDoc.see.length > 0 ? `
            <h3>See Also</h3>
            <ul>
                ${moduleDoc.see.map(ref => `<li>${ref}</li>`).join('')}
            </ul>
            ` : ''}

            ${moduleDoc.todo.length > 0 ? `
            <h3>TODO</h3>
            <ul>
                ${moduleDoc.todo.map(item => `<li>${item}</li>`).join('')}
            </ul>
            ` : ''}
        </section>
    </main>
</body>
</html>`;

            await fs.writeFile(path.join(this.outputPath, 'modules', `${name}.html`), template);
        }
    }

    /**
     * Generate class pages
     */
    async generateClassPages() {
        for (const [name, classDoc] of this.documentation.classes) {
            const methods = Array.from(this.documentation.methods.entries())
                .filter(([key]) => key.startsWith(`${name}.`))
                .map(([key, method]) => method);

            const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class: ${name} - API Documentation</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <h1><a href="../index.html">API Documentation</a></h1>
    </header>

    <main>
        <section>
            <h2>Class: ${name}</h2>
            <p class="module">Module: ${classDoc.module}</p>

            <div class="description">
                ${this.formatMarkdown(classDoc.description)}
            </div>

            ${classDoc.examples.length > 0 ? `
            <h3>Examples</h3>
            ${classDoc.examples.map(example => `
                <pre><code>${this.escapeHtml(example)}</code></pre>
            `).join('')}
            ` : ''}

            ${methods.length > 0 ? `
            <h3>Methods</h3>
            <ul class="method-list">
                ${methods.map(method => `
                <li>
                    <code>${method.name}(${method.params.map(p => p.name).join(', ')})</code>
                    <p>${method.description}</p>
                </li>
                `).join('')}
            </ul>
            ` : ''}

            ${classDoc.deprecated ? `<p class="deprecated"><strong>Deprecated</strong></p>` : ''}
        </section>
    </main>
</body>
</html>`;

            await fs.writeFile(path.join(this.outputPath, 'classes', `${name}.html`), template);
        }
    }

    /**
     * Generate function pages
     */
    async generateFunctionPages() {
        for (const [name, funcDoc] of this.documentation.functions) {
            const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Function: ${name} - API Documentation</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <h1><a href="../index.html">API Documentation</a></h1>
    </header>

    <main>
        <section>
            <h2>Function: ${name}</h2>
            <p class="module">Module: ${funcDoc.module}</p>

            <div class="signature">
                <code>${name}(${funcDoc.params.map(p => `${p.name}: ${p.type}`).join(', ')})</code>
                ${funcDoc.returns ? `<code> → ${funcDoc.returns.type}</code>` : ''}
            </div>

            <div class="description">
                ${this.formatMarkdown(funcDoc.description)}
            </div>

            ${funcDoc.params.length > 0 ? `
            <h3>Parameters</h3>
            <dl class="params">
                ${funcDoc.params.map(param => `
                <dt><code>${param.name}: ${param.type}</code></dt>
                <dd>${param.description}</dd>
                `).join('')}
            </dl>
            ` : ''}

            ${funcDoc.returns ? `
            <h3>Returns</h3>
            <p><code>${funcDoc.returns.type}</code> - ${funcDoc.returns.description}</p>
            ` : ''}

            ${funcDoc.throws.length > 0 ? `
            <h3>Throws</h3>
            <ul>
                ${funcDoc.throws.map(throwDoc => `
                <li><code>${throwDoc.type}</code> - ${throwDoc.description}</li>
                `).join('')}
            </ul>
            ` : ''}

            ${funcDoc.examples.length > 0 ? `
            <h3>Examples</h3>
            ${funcDoc.examples.map(example => `
                <pre><code>${this.escapeHtml(example)}</code></pre>
            `).join('')}
            ` : ''}

            ${funcDoc.deprecated ? `<p class="deprecated"><strong>Deprecated</strong></p>` : ''}
        </section>
    </main>
</body>
</html>`;

            await fs.writeFile(path.join(this.outputPath, 'functions', `${name}.html`), template);
        }
    }

    /**
     * Generate examples
     */
    async generateExamples() {
        const examples = [
            {
                title: 'Basic Asset Generation',
                code: `
// Generate a simple sprite asset
const generator = new SpriteGenerator();
const asset = await generator.generate({
    type: 'character',
    style: 'pixel-art',
    width: 32,
    height: 32
});

console.log('Generated asset:', asset);
`
            },
            {
                title: 'Advanced Search Query',
                code: `
// Perform advanced search with filters
const results = await searchManager.search('character sprite', {
    filters: {
        type: 'sprite',
        category: 'character',
        created_after: '2024-01-01'
    },
    sortBy: 'relevance',
    limit: 50
});

console.log('Search results:', results);
`
            },
            {
                title: 'Plugin Development',
                code: `
// Create a custom generator plugin
class CustomGenerator extends BaseGenerator {
    async generate(options) {
        // Custom generation logic
        return {
            type: 'custom',
            data: 'generated content',
            metadata: options
        };
    }
}

// Register the plugin
pluginManager.registerPlugin({
    name: 'custom-generator',
    version: '1.0.0',
    generators: [CustomGenerator]
});
`
            }
        ];

        for (let i = 0; i < examples.length; i++) {
            const example = examples[i];
            const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example: ${example.title} - API Documentation</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <h1><a href="../index.html">API Documentation</a></h1>
    </header>

    <main>
        <section>
            <h2>${example.title}</h2>
            <p>This example demonstrates how to use the API for ${example.title.toLowerCase()}.</p>

            <pre><code>${this.escapeHtml(example.code)}</code></pre>

            <p><a href="../examples/">← Back to Examples</a></p>
        </section>
    </main>
</body>
</html>`;

            await fs.writeFile(path.join(this.outputPath, 'examples', `example-${i + 1}.html`), template);
        }

        // Generate examples index
        const examplesIndex = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Examples - API Documentation</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <h1><a href="../index.html">API Documentation</a></h1>
    </header>

    <main>
        <section>
            <h2>Code Examples</h2>
            <p>Practical examples demonstrating how to use the TPT Asset Editor Desktop API.</p>

            <ul class="example-list">
                ${examples.map((example, i) => `
                <li>
                    <h3><a href="example-${i + 1}.html">${example.title}</a></h3>
                    <p>Example demonstrating ${example.title.toLowerCase()} functionality.</p>
                </li>
                `).join('')}
            </ul>
        </section>
    </main>
</body>
</html>`;

        await fs.writeFile(path.join(this.outputPath, 'examples', 'index.html'), examplesIndex);
    }

    /**
     * Generate guides
     */
    async generateGuides() {
        const guides = [
            {
                title: 'Getting Started',
                content: `
# Getting Started with TPT Asset Editor Desktop

## Installation

\`\`\`bash
npm install
npm run build
npm start
\`\`\`

## Basic Usage

\`\`\`javascript
const { AssetGenerator } = require('./src/core/asset-generator');

// Create a generator
const generator = new AssetGenerator();

// Generate an asset
const asset = await generator.generate({
    type: 'sprite',
    style: 'pixel-art',
    dimensions: { width: 32, height: 32 }
});

console.log('Generated asset:', asset);
\`\`\`
`
            },
            {
                title: 'Architecture Overview',
                content: `
# Architecture Overview

## Core Components

- **Asset Generator**: Main generation engine
- **Plugin System**: Extensible plugin architecture
- **UI Framework**: Modern user interface components
- **Database Layer**: Efficient data storage and retrieval
- **Export System**: Multiple format export capabilities

## Design Patterns

- **MVC Architecture**: Separation of concerns
- **Observer Pattern**: Event-driven communication
- **Factory Pattern**: Object creation abstraction
- **Strategy Pattern**: Algorithm selection
- **Decorator Pattern**: Feature extension
`
            }
        ];

        for (const guide of guides) {
            const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guide: ${guide.title} - API Documentation</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <h1><a href="../index.html">API Documentation</a></h1>
    </header>

    <main>
        <section>
            <article>
                ${this.formatMarkdown(guide.content)}
            </article>
        </section>
    </main>
</body>
</html>`;

            const filename = guide.title.toLowerCase().replace(/\s+/g, '-');
            await fs.writeFile(path.join(this.outputPath, 'guides', `${filename}.html`), template);
        }
    }

    /**
     * Generate search index for client-side search
     */
    async generateSearchIndex() {
        const searchIndex = {
            modules: Array.from(this.documentation.modules.entries()),
            classes: Array.from(this.documentation.classes.entries()),
            functions: Array.from(this.documentation.functions.entries()),
            methods: Array.from(this.documentation.methods.entries())
        };

        await fs.writeFile(
            path.join(this.outputPath, 'assets', 'search-index.json'),
            JSON.stringify(searchIndex, null, 2)
        );
    }

    /**
     * Format markdown content to HTML
     */
    formatMarkdown(content) {
        if (!content) return '';

        // Simple markdown to HTML conversion
        return content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/\n/gim, '<br>');
    }

    /**
     * Escape HTML content
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Generate CSS styles
     */
    async generateStyles() {
        const styles = `
/* API Documentation Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f5f5f5;
}

header {
    background: #2c3e50;
    color: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

header h1 {
    margin-bottom: 0.5rem;
}

header nav input[type="search"] {
    width: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    margin-top: 0.5rem;
}

main {
    display: flex;
    min-height: calc(100vh - 80px);
}

aside {
    width: 300px;
    background: white;
    border-right: 1px solid #ddd;
    padding: 1rem;
    overflow-y: auto;
}

aside h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

aside ul {
    list-style: none;
}

aside li {
    margin-bottom: 0.25rem;
}

aside a {
    color: #3498db;
    text-decoration: none;
}

aside a:hover {
    text-decoration: underline;
}

#content {
    flex: 1;
    padding: 2rem;
    background: white;
    margin: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stats {
    display: flex;
    gap: 2rem;
    margin: 2rem 0;
}

.stat {
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.stat h3 {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.description {
    margin: 1rem 0;
    line-height: 1.7;
}

.signature {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    border-left: 4px solid #3498db;
    margin: 1rem 0;
}

.params {
    margin: 1rem 0;
}

.params dt {
    font-weight: bold;
    margin-top: 0.5rem;
}

.params dd {
    margin-left: 2rem;
    margin-bottom: 0.5rem;
}

pre {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    border: 1px solid #e9ecef;
}

code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    background: #f1f3f4;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-size: 0.9em;
}

.deprecated {
    color: #dc3545;
    font-weight: bold;
}

.method-list {
    list-style: none;
}

.method-list li {
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
}

.method-list code {
    font-size: 1.1em;
    color: #2c3e50;
}

.file-path {
    color: #6c757d;
    font-style: italic;
    margin-bottom: 1rem;
}

.module {
    color: #6c757d;
    margin-bottom: 1rem;
}

.example-list {
    list-style: none;
}

.example-list li {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.example-list h3 {
    margin-bottom: 0.5rem;
}

.example-list a {
    color: #3498db;
    text-decoration: none;
}

.example-list a:hover {
    text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
    main {
        flex-direction: column;
    }

    aside {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #ddd;
    }

    .stats {
        flex-direction: column;
        gap: 1rem;
    }
}
`;

        await fs.writeFile(path.join(this.outputPath, 'assets', 'styles.css'), styles);
    }

    /**
     * Generate JavaScript for search functionality
     */
    async generateSearchScript() {
        const searchScript = `
// API Documentation Search
class APISearch {
    constructor() {
        this.searchIndex = null;
        this.searchInput = document.getElementById('search');
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.id = 'search-results';
        this.resultsContainer.style.cssText = \`
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            max-height: 400px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
        \`;

        this.init();
    }

    async init() {
        await this.loadSearchIndex();
        this.setupEventListeners();
        this.searchInput.parentNode.appendChild(this.resultsContainer);
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
        this.searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.resultsContainer.children.length > 0) {
                this.resultsContainer.style.display = 'block';
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.resultsContainer.contains(e.target)) {
                this.resultsContainer.style.display = 'none';
            }
        });
    }

    performSearch(query) {
        if (!query.trim() || !this.searchIndex) {
            this.resultsContainer.style.display = 'none';
            return;
        }

        const results = [];
        const searchTerm = query.toLowerCase();

        // Search modules
        for (const [name, module] of this.searchIndex.modules) {
            if (name.toLowerCase().includes(searchTerm) ||
                module.description?.toLowerCase().includes(searchTerm)) {
                results.push({
                    type: 'module',
                    name,
                    description: module.description,
                    url: \`./modules/\${name}.html\`
                });
            }
        }

        // Search classes
        for (const [name, classDoc] of this.searchIndex.classes) {
            if (name.toLowerCase().includes(searchTerm) ||
                classDoc.description?.toLowerCase().includes(searchTerm)) {
                results.push({
                    type: 'class',
                    name,
                    description: classDoc.description,
                    url: \`./classes/\${name}.html\`
                });
            }
        }

        // Search functions
        for (const [name, funcDoc] of this.searchIndex.functions) {
            if (name.toLowerCase().includes(searchTerm) ||
                funcDoc.description?.toLowerCase().includes(searchTerm)) {
                results.push({
                    type: 'function',
                    name,
                    description: funcDoc.description,
                    url: \`./functions/\${name}.html\`
                });
            }
        }

        this.displayResults(results.slice(0, 10));
    }

    displayResults(results) {
        this.resultsContainer.innerHTML = '';

        if (results.length === 0) {
            this.resultsContainer.style.display = 'none';
            return;
        }

        for (const result of results) {
            const item = document.createElement('div');
            item.style.cssText = \`
                padding: 0.5rem 1rem;
                border-bottom: 1px solid #eee;
                cursor: pointer;
            \`;

            item.innerHTML = \`
                <div style="font-weight: bold; color: #2c3e50;">
                    \${result.name}
                    <span style="font-size: 0.8em; color: #6c757d; margin-left: 0.5rem;">
                        \${result.type}
                    </span>
                </div>
                <div style="font-size: 0.9em; color: #6c757d; margin-top: 0.25rem;">
                    \${result.description || 'No description available'}
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

        this.resultsContainer.style.display = 'block';
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new APISearch();
});
`;

        await fs.writeFile(path.join(this.outputPath, 'assets', 'search.js'), searchScript);
    }

    /**
     * Regenerate documentation
     */
    async regenerate() {
        console.log('Regenerating API documentation...');

        // Clear existing documentation
        await this.clearDocumentation();

        // Re-parse source files
        await this.parseSourceFiles();

        // Generate new documentation
        await this.generateDocumentation();

        console.log('API documentation regenerated');
    }

    /**
     * Clear existing documentation
     */
    async clearDocumentation() {
        const dirs = ['modules', 'classes', 'functions', 'examples', 'guides', 'assets'];

        for (const dir of dirs) {
            const dirPath = path.join(this.outputPath, dir);
            try {
                await fs.rm(dirPath, { recursive: true, force: true });
                await fs.mkdir(dirPath, { recursive: true });
            } catch (error) {
                // Directory might not exist
            }
        }
    }

    /**
     * Get documentation statistics
     */
    getStatistics() {
        return {
            modules: this.documentation.modules.size,
            classes: this.documentation.classes.size,
            functions: this.documentation.functions.size,
            methods: this.documentation.methods.size,
            totalItems: this.documentation.modules.size +
                       this.documentation.classes.size +
                       this.documentation.functions.size +
                       this.documentation.methods.size
        };
    }

    /**
     * Destroy the documentation generator
     */
    destroy() {
        this.documentation.modules.clear();
        this.documentation.classes.clear();
        this.documentation.functions.clear();
        this.documentation.methods.clear();
        this.documentation.examples.clear();
        this.documentation.guides.clear();

        console.log('API documentation generator destroyed');
    }
}

module.exports = APIDocumentationGenerator;
