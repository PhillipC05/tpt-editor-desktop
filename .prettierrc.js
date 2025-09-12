/**
 * TPT Asset Editor Desktop - Prettier Configuration
 * Code formatting configuration for consistent styling
 */

module.exports = {
  // Basic formatting
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',

  // Line breaks
  endOfLine: 'lf',

  // File patterns to ignore
  overrides: [
    {
      // JavaScript files
      files: '*.js',
      options: {
        parser: 'babel'
      }
    },
    {
      // TypeScript files
      files: '*.ts',
      options: {
        parser: 'typescript'
      }
    },
    {
      // JSON files
      files: ['*.json', '*.jsonc'],
      options: {
        parser: 'json'
      }
    },
    {
      // Markdown files
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'preserve'
      }
    },
    {
      // YAML files
      files: ['*.yml', '*.yaml'],
      options: {
        parser: 'yaml',
        singleQuote: false,
        tabWidth: 2
      }
    },
    {
      // HTML files
      files: '*.html',
      options: {
        parser: 'html'
      }
    },
    {
      // CSS files
      files: '*.css',
      options: {
        parser: 'css'
      }
    },
    {
      // SCSS/Sass files
      files: ['*.scss', '*.sass'],
      options: {
        parser: 'scss'
      }
    },
    {
      // Configuration files
      files: [
        '.eslintrc.js',
        '.prettierrc.js',
        'webpack.config.js',
        'rollup.config.js',
        'babel.config.js',
        'jest.config.js'
      ],
      options: {
        printWidth: 100,
        singleQuote: true,
        trailingComma: 'es5'
      }
    },
    {
      // Package.json
      files: 'package.json',
      options: {
        printWidth: 200,
        parser: 'json'
      }
    },
    {
      // Ignore minified files
      files: ['*.min.js', '*.min.css'],
      options: {
        parser: 'babel'
      }
    }
  ]
};
