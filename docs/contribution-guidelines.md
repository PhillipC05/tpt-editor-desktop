# Contribution Guidelines

## Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Contribution](#code-contribution)
- [Documentation](#documentation)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)
- [Pull Request Process](#pull-request-process)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

---

## Getting Started

### Ways to Contribute

**Code Contributions**
- Bug fixes and patches
- New features and enhancements
- Performance improvements
- Code refactoring and cleanup

**Documentation**
- User manual updates
- API documentation
- Tutorial creation
- Translation work

**Testing**
- Writing test cases
- Bug reproduction
- Performance testing
- Compatibility testing

**Community Support**
- Answering questions
- Helping new users
- Creating tutorials
- Reporting issues

### Prerequisites

Before contributing, ensure you have:
- **Git**: Version control system
- **Node.js**: 18.0.0 or higher
- **npm**: Package manager
- **Code Editor**: VS Code recommended
- **GitHub Account**: For issue tracking and PRs

---

## Development Setup

### Fork and Clone

1. **Fork the Repository**
   - Visit https://github.com/your-repo/tpt-asset-editor-desktop
   - Click "Fork" button
   - Clone your fork locally

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tpt-asset-editor-desktop.git
   cd tpt-asset-editor-desktop
   ```

3. **Set Up Upstream Remote**
   ```bash
   git remote add upstream https://github.com/your-repo/tpt-asset-editor-desktop.git
   git fetch upstream
   ```

### Install Dependencies

```bash
# Install all dependencies
npm install

# Install development dependencies
npm install --save-dev

# Verify installation
npm run test
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

2. **Make Changes**
   - Write code following our style guidelines
   - Add tests for new functionality
   - Update documentation as needed
   - Test your changes thoroughly

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve issue with detailed description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Then create PR on GitHub
   ```

---

## Code Contribution

### Code Style Guidelines

#### JavaScript/TypeScript
- **ES6+ Features**: Use modern JavaScript features
- **Async/Await**: Prefer async/await over promises
- **Arrow Functions**: Use arrow functions for callbacks
- **Template Literals**: Use template literals for string interpolation
- **Destructuring**: Use destructuring for object/array access

#### Naming Conventions
```javascript
// Variables and functions: camelCase
const userName = 'john';
function getUserData() { }

// Classes: PascalCase
class AssetGenerator { }

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 1024;

// Private members: underscore prefix
class MyClass {
    _privateMethod() { }
}
```

#### Code Structure
```javascript
// File structure
src/
├── core/           # Core functionality
├── generators/     # Asset generators
├── ui/            # User interface
├── utils/         # Utility functions
├── tests/         # Test files
└── types/         # TypeScript definitions
```

### Best Practices

#### Error Handling
```javascript
// Good: Proper error handling
try {
    const result = await generateAsset(params);
    return result;
} catch (error) {
    logger.error('Asset generation failed:', error);
    throw new GenerationError('Failed to generate asset', error);
}

// Bad: Silent failures
try {
    const result = await generateAsset(params);
    return result;
} catch (error) {
    // Silent failure - don't do this!
}
```

#### Performance
```javascript
// Good: Efficient loops
for (let i = 0; i < array.length; i++) {
    processItem(array[i]);
}

// Better: Use for-of for arrays
for (const item of array) {
    processItem(item);
}

// Best: Use array methods when possible
array.forEach(processItem);
```

#### Memory Management
```javascript
// Good: Clean up resources
class AssetProcessor {
    constructor() {
        this.cache = new Map();
    }

    destroy() {
        this.cache.clear();
        // Clean up other resources
    }
}
```

### Commit Message Guidelines

#### Format
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples
```bash
# Feature commit
git commit -m "feat(audio): add FM synthesis support

- Implement frequency modulation algorithm
- Add modulation parameters to UI
- Update audio generator documentation"

# Bug fix commit
git commit -m "fix(generation): resolve memory leak in sprite generator

- Clear canvas context after generation
- Dispose of unused image data
- Add memory monitoring"

# Documentation commit
git commit -m "docs(api): update generator API documentation

- Add missing parameter descriptions
- Include code examples
- Update return type information"
```

---

## Documentation

### Documentation Standards

#### README Files
- **Clear Structure**: Use consistent formatting
- **Code Examples**: Include runnable examples
- **Installation Instructions**: Step-by-step setup
- **Troubleshooting**: Common issues and solutions

#### API Documentation
```javascript
/**
 * Generates a sprite asset using procedural algorithms
 * @param {Object} params - Generation parameters
 * @param {number} params.width - Sprite width in pixels
 * @param {number} params.height - Sprite height in pixels
 * @param {string} params.type - Asset type ('character', 'monster', etc.)
 * @param {Object} [params.options] - Additional options
 * @returns {Promise<Sprite>} Generated sprite asset
 * @throws {GenerationError} When generation fails
 */
async function generateSprite(params) {
    // Implementation
}
```

#### User Documentation
- **Step-by-Step Guides**: Clear, numbered instructions
- **Screenshots**: Visual aids where helpful
- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Recommended usage patterns

### Documentation Workflow

1. **Identify Need**: Determine what documentation is needed
2. **Create Content**: Write clear, concise documentation
3. **Add Examples**: Include code examples and screenshots
4. **Review**: Have someone else review for clarity
5. **Update**: Keep documentation current with code changes

---

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
├── fixtures/      # Test data
└── utils/         # Test utilities
```

### Writing Tests

#### Unit Tests
```javascript
// generator.test.js
const { AssetGenerator } = require('../src/generators/asset-generator');

describe('AssetGenerator', () => {
    let generator;

    beforeEach(() => {
        generator = new AssetGenerator();
    });

    describe('generate()', () => {
        it('should generate asset with valid parameters', async () => {
            const params = { width: 64, height: 64, type: 'sprite' };
            const result = await generator.generate(params);

            expect(result).toBeDefined();
            expect(result.width).toBe(64);
            expect(result.height).toBe(64);
        });

        it('should throw error with invalid parameters', async () => {
            const params = { width: -1, height: 64 };

            await expect(generator.generate(params))
                .rejects.toThrow(ValidationError);
        });
    });
});
```

#### Integration Tests
```javascript
// database-integration.test.js
describe('Database Integration', () => {
    let db;

    beforeAll(async () => {
        db = new DatabaseManager();
        await db.initialize();
    });

    afterAll(async () => {
        await db.close();
    });

    it('should save and retrieve asset', async () => {
        const asset = { id: 'test-1', name: 'Test Asset', data: '...' };

        // Save asset
        await db.saveAsset(asset);

        // Retrieve asset
        const retrieved = await db.getAsset('test-1');

        expect(retrieved.name).toBe('Test Asset');
    });
});
```

### Test Coverage

#### Coverage Requirements
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

#### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/generators/sprite-generator.test.js

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

### Test Best Practices

#### Test Organization
- **Describe Blocks**: Group related tests
- **Setup/Teardown**: Use beforeEach/afterEach
- **Test Isolation**: Each test should be independent
- **Mock Dependencies**: Mock external dependencies

#### Test Quality
- **Descriptive Names**: Clear test descriptions
- **Single Responsibility**: One assertion per test
- **Edge Cases**: Test boundary conditions
- **Error Cases**: Test error handling

---

## Reporting Issues

### Bug Reports

#### Required Information
- **Title**: Clear, descriptive title
- **Description**: Detailed description of the issue
- **Steps to Reproduce**: Step-by-step reproduction guide
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, application version
- **Screenshots**: Visual evidence when applicable
- **Logs**: Error messages, console output

#### Bug Report Template
```markdown
## Bug Report

**Title:** [Clear, descriptive title]

**Description:**
[Detailed description of the issue]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- OS: [Windows/macOS/Linux version]
- Node.js: [version]
- Application: [version]
- Browser: [if applicable]

**Additional Context:**
[Any additional information, screenshots, logs]
```

### Feature Requests

#### Feature Request Template
```markdown
## Feature Request

**Title:** [Clear, descriptive title]

**Problem:**
[Describe the problem this feature would solve]

**Solution:**
[Describe the proposed solution]

**Alternatives:**
[Describe alternative solutions considered]

**Use Case:**
[Describe how this feature would be used]

**Additional Context:**
[Any additional information]
```

### Issue Labels

#### Bug Labels
- `bug`: Confirmed bug
- `critical`: Critical/blocking issue
- `major`: Major functionality issue
- `minor`: Minor issue
- `enhancement`: Feature request

#### Status Labels
- `help wanted`: Community contribution welcome
- `good first issue`: Good for new contributors
- `in progress`: Work in progress
- `needs review`: Ready for review
- `blocked`: Blocked by other issues

---

## Pull Request Process

### PR Guidelines

#### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Commit messages follow format
- [ ] Branch is up to date with main
- [ ] No merge conflicts

#### PR Template
```markdown
## Description
[Brief description of changes]

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] All tests pass

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
[Add screenshots to help explain your changes]

## Additional Notes
[Any additional information or context]
```

### Review Process

#### Reviewer Checklist
- [ ] Code quality meets standards
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No security issues
- [ ] Performance impact assessed
- [ ] Breaking changes documented

#### Approval Process
1. **Automated Checks**: CI/CD pipeline passes
2. **Code Review**: At least one maintainer review
3. **Testing**: All tests pass
4. **Documentation**: Docs updated and reviewed
5. **Approval**: Maintainers approve PR
6. **Merge**: PR merged to main branch

### Branch Management

#### Branch Naming
```bash
# Feature branches
feature/add-new-generator
feature/audio-synthesis-improvements

# Bug fix branches
fix/memory-leak-sprite-generator
fix/audio-export-crash

# Documentation branches
docs/update-api-reference
docs/add-contribution-guide

# Hotfix branches
hotfix/critical-security-patch
```

#### Merging Strategy
- **Squash and Merge**: For small, focused changes
- **Merge Commit**: For larger features with multiple commits
- **Rebase and Merge**: For clean linear history

---

## Code of Conduct

### Our Standards

#### Positive Behavior
- **Respectful**: Treat everyone with respect
- **Inclusive**: Welcome people from all backgrounds
- **Collaborative**: Work together constructively
- **Helpful**: Assist others when possible
- **Professional**: Maintain professional communication

#### Unacceptable Behavior
- **Harassment**: Any form of harassment
- **Discrimination**: Based on race, gender, religion, etc.
- **Trolling**: Deliberately disruptive behavior
- **Spam**: Unnecessary or repetitive messages
- **Threats**: Threats of violence or harm

### Enforcement

#### Reporting Violations
- **Contact**: maintainers@tpt-asset-editor.com
- **Anonymous**: Anonymous reporting available
- **Confidential**: Reports handled confidentially
- **Swift Action**: Prompt investigation and response

#### Consequences
- **Warning**: First offense gets warning
- **Temporary Ban**: Repeated offenses get temporary ban
- **Permanent Ban**: Serious violations get permanent ban
- **Legal Action**: Criminal behavior reported to authorities

### Scope

This Code of Conduct applies to:
- **Project Spaces**: GitHub repository, issues, PRs
- **Community Spaces**: Forums, Discord, social media
- **Events**: Meetups, conferences, workshops
- **Communications**: All project-related communication

---

## License

### Contributing License Agreement

By contributing to TPT Asset Editor Desktop, you agree that:

1. **Your contributions** are licensed under the same license as the project (GPL-2.0-or-later)
2. **You have the right** to license your contributions
3. **You grant permission** for your contributions to be used in the project
4. **You understand** that your contributions may be modified or removed

### Attribution

Contributors will be:
- **Acknowledged**: In contributor lists and documentation
- **Credited**: In commit history and release notes
- **Recognized**: Through contributor badges and mentions

### Intellectual Property

- **Original Work**: Ensure contributions are your original work
- **Third-Party Code**: Clearly identify and license third-party code
- **Patents**: Disclose any patent claims related to contributions
- **Copyright**: Respect copyright of others

---

## Getting Help

### Resources

#### Documentation
- **Contribution Guide**: This document
- **Development Setup**: Detailed setup instructions
- **API Documentation**: Technical reference
- **User Manual**: User-facing documentation

#### Community
- **GitHub Discussions**: General discussion
- **Discord Server**: Real-time chat
- **Forum**: Long-form discussions
- **Mailing List**: Announcements and updates

#### Support
- **Issue Tracker**: Bug reports and feature requests
- **Wiki**: Community knowledge base
- **Tutorials**: Step-by-step guides
- **FAQ**: Frequently asked questions

### Contact Information

- **General Questions**: discussions@github.com
- **Technical Support**: support@tpt-asset-editor.com
- **Security Issues**: security@tpt-asset-editor.com
- **Business Inquiries**: business@tpt-asset-editor.com

---

*Thank you for contributing to TPT Asset Editor Desktop! Your contributions help make procedural asset generation better for everyone.*
