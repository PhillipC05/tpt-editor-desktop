/**
 * Advanced Search Manager
 * Comprehensive search and filtering system with full-text search, ranking, and performance optimization
 */

const Database = require('sqlite3').Database;

class AdvancedSearchManager {
    constructor(options = {}) {
        this.db = options.database;
        this.enableFullTextSearch = options.enableFullTextSearch !== false;
        this.enableCaching = options.enableCaching !== false;
        this.cacheSize = options.cacheSize || 1000;
        this.cacheTTL = options.cacheTTL || 10 * 60 * 1000; // 10 minutes
        this.maxResults = options.maxResults || 1000;
        this.searchTimeout = options.searchTimeout || 30000; // 30 seconds

        this.searchCache = new Map();
        this.searchIndexes = new Map();
        this.searchStats = new Map();
        this.activeSearches = new Set();

        this.init();
    }

    /**
     * Initialize the search manager
     */
    async init() {
        await this.setupFullTextSearch();
        await this.createSearchIndexes();
        this.setupSearchMonitoring();

        console.log('Advanced search manager initialized');
    }

    /**
     * Setup full-text search capabilities
     */
    async setupFullTextSearch() {
        if (!this.enableFullTextSearch) return;

        try {
            // Create FTS5 virtual tables for searchable content
            const ftsTables = [
                {
                    name: 'assets_fts',
                    columns: ['asset_id', 'name', 'description', 'tags', 'metadata'],
                    sourceTable: 'assets'
                },
                {
                    name: 'generators_fts',
                    columns: ['generator_id', 'name', 'description', 'category', 'tags'],
                    sourceTable: 'generators'
                },
                {
                    name: 'projects_fts',
                    columns: ['project_id', 'name', 'description', 'tags'],
                    sourceTable: 'projects'
                }
            ];

            for (const table of ftsTables) {
                await this.createFTSTable(table);
            }

            console.log('Full-text search tables created');
        } catch (error) {
            console.error('Failed to setup full-text search:', error);
        }
    }

    /**
     * Create FTS5 virtual table
     */
    async createFTSTable(tableConfig) {
        const { name, columns, sourceTable } = tableConfig;

        // Create FTS5 virtual table
        const ftsColumns = columns.join(', ');
        const createFTS = `CREATE VIRTUAL TABLE IF NOT EXISTS ${name} USING fts5(${ftsColumns})`;

        await this.db.run(createFTS);

        // Create triggers to keep FTS table in sync
        const idColumn = columns[0];
        const dataColumns = columns.slice(1);

        // Insert trigger
        const insertTrigger = `
            CREATE TRIGGER IF NOT EXISTS ${name}_insert AFTER INSERT ON ${sourceTable}
            BEGIN
                INSERT INTO ${name} (${columns.join(', ')})
                VALUES (${columns.map(col => `NEW.${col}`).join(', ')});
            END
        `;

        // Update trigger
        const updateTrigger = `
            CREATE TRIGGER IF NOT EXISTS ${name}_update AFTER UPDATE ON ${sourceTable}
            BEGIN
                UPDATE ${name} SET ${dataColumns.map(col => `${col} = NEW.${col}`).join(', ')}
                WHERE ${idColumn} = NEW.${idColumn};
            END
        `;

        // Delete trigger
        const deleteTrigger = `
            CREATE TRIGGER IF NOT EXISTS ${name}_delete AFTER DELETE ON ${sourceTable}
            BEGIN
                DELETE FROM ${name} WHERE ${idColumn} = OLD.${idColumn};
            END
        `;

        await this.db.run(insertTrigger);
        await this.db.run(updateTrigger);
        await this.db.run(deleteTrigger);

        // Populate existing data
        const populateQuery = `
            INSERT OR IGNORE INTO ${name} (${columns.join(', ')})
            SELECT ${columns.join(', ')} FROM ${sourceTable}
        `;

        await this.db.run(populateQuery);
    }

    /**
     * Create search indexes for performance
     */
    async createSearchIndexes() {
        const indexes = [
            // Asset indexes
            'CREATE INDEX IF NOT EXISTS idx_assets_type_category ON assets(type, category)',
            'CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_assets_updated_at ON assets(updated_at)',
            'CREATE INDEX IF NOT EXISTS idx_assets_name ON assets(name)',
            'CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets(tags)',

            // Generator indexes
            'CREATE INDEX IF NOT EXISTS idx_generators_category ON generators(category)',
            'CREATE INDEX IF NOT EXISTS idx_generators_type ON generators(type)',
            'CREATE INDEX IF NOT EXISTS idx_generators_created_at ON generators(created_at)',

            // Project indexes
            'CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at)',
            'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)',

            // Composite indexes for common queries
            'CREATE INDEX IF NOT EXISTS idx_assets_type_created ON assets(type, created_at)',
            'CREATE INDEX IF NOT EXISTS idx_generators_category_type ON generators(category, type)',
            'CREATE INDEX IF NOT EXISTS idx_projects_status_updated ON projects(status, updated_at)'
        ];

        for (const indexSQL of indexes) {
            try {
                await this.db.run(indexSQL);
            } catch (error) {
                console.warn(`Failed to create index: ${indexSQL}`, error.message);
            }
        }

        console.log('Search indexes created');
    }

    /**
     * Perform advanced search
     */
    async search(query, options = {}) {
        const {
            type = 'all', // 'all', 'assets', 'generators', 'projects'
            filters = {},
            sortBy = 'relevance',
            sortOrder = 'desc',
            limit = this.maxResults,
            offset = 0,
            includeFacets = true
        } = options;

        const searchId = this.generateSearchId();
        this.activeSearches.add(searchId);

        try {
            // Check cache first
            if (this.enableCaching) {
                const cacheKey = this.generateCacheKey(query, options);
                const cachedResult = this.getCachedResult(cacheKey);
                if (cachedResult) {
                    return cachedResult;
                }
            }

            const startTime = Date.now();

            // Parse search query
            const parsedQuery = this.parseSearchQuery(query);

            // Build search conditions
            const searchConditions = this.buildSearchConditions(parsedQuery, filters, type);

            // Execute search
            const results = await this.executeSearch(searchConditions, {
                sortBy,
                sortOrder,
                limit,
                offset
            });

            // Calculate facets if requested
            let facets = null;
            if (includeFacets) {
                facets = await this.calculateFacets(searchConditions, type);
            }

            // Rank and sort results
            const rankedResults = this.rankAndSortResults(results, parsedQuery, sortBy, sortOrder);

            // Apply pagination
            const paginatedResults = this.paginateResults(rankedResults, limit, offset);

            // Record search metrics
            const executionTime = Date.now() - startTime;
            await this.recordSearchMetrics(query, options, executionTime, paginatedResults.length);

            const searchResult = {
                query,
                total: rankedResults.length,
                results: paginatedResults,
                facets,
                executionTime,
                searchId
            };

            // Cache result
            if (this.enableCaching) {
                const cacheKey = this.generateCacheKey(query, options);
                this.setCachedResult(cacheKey, searchResult);
            }

            return searchResult;

        } catch (error) {
            console.error('Search failed:', error);
            throw error;

        } finally {
            this.activeSearches.delete(searchId);
        }
    }

    /**
     * Parse search query with advanced syntax
     */
    parseSearchQuery(query) {
        if (!query || typeof query !== 'string') {
            return { terms: [], operators: [] };
        }

        // Advanced query parsing with operators
        const parsed = {
            terms: [],
            operators: [],
            filters: {},
            phrases: []
        };

        // Extract quoted phrases
        const phraseRegex = /"([^"]+)"/g;
        let match;
        while ((match = phraseRegex.exec(query)) !== null) {
            parsed.phrases.push(match[1]);
        }

        // Remove phrases from query for term extraction
        let cleanQuery = query.replace(phraseRegex, '');

        // Extract field-specific searches (field:value)
        const fieldRegex = /(\w+):([^\s]+)/g;
        while ((match = fieldRegex.exec(cleanQuery)) !== null) {
            const [, field, value] = match;
            parsed.filters[field] = value;
        }

        // Remove field searches from query
        cleanQuery = cleanQuery.replace(fieldRegex, '');

        // Extract operators
        const operators = ['AND', 'OR', 'NOT', '(', ')'];
        for (const op of operators) {
            if (cleanQuery.includes(op)) {
                parsed.operators.push(op);
            }
        }

        // Extract search terms
        const terms = cleanQuery
            .split(/\s+/)
            .filter(term => term.length > 0 && !operators.includes(term.toUpperCase()))
            .map(term => term.toLowerCase());

        parsed.terms = [...terms, ...parsed.phrases];

        return parsed;
    }

    /**
     * Build search conditions
     */
    buildSearchConditions(parsedQuery, filters, type) {
        const conditions = {
            where: [],
            params: [],
            tables: [],
            joins: []
        };

        // Determine which tables to search
        switch (type) {
            case 'assets':
                conditions.tables.push('assets');
                if (this.enableFullTextSearch) {
                    conditions.tables.push('assets_fts');
                }
                break;
            case 'generators':
                conditions.tables.push('generators');
                if (this.enableFullTextSearch) {
                    conditions.tables.push('generators_fts');
                }
                break;
            case 'projects':
                conditions.tables.push('projects');
                if (this.enableFullTextSearch) {
                    conditions.tables.push('projects_fts');
                }
                break;
            default: // 'all'
                conditions.tables.push('assets', 'generators', 'projects');
                if (this.enableFullTextSearch) {
                    conditions.tables.push('assets_fts', 'generators_fts', 'projects_fts');
                }
        }

        // Build WHERE conditions
        if (parsedQuery.terms.length > 0) {
            const termConditions = [];

            for (const term of parsedQuery.terms) {
                if (this.enableFullTextSearch) {
                    // Use FTS for better performance
                    termConditions.push('assets_fts MATCH ?');
                    conditions.params.push(term);

                    termConditions.push('generators_fts MATCH ?');
                    conditions.params.push(term);

                    termConditions.push('projects_fts MATCH ?');
                    conditions.params.push(term);
                } else {
                    // Fallback to LIKE queries
                    termConditions.push('assets.name LIKE ? OR assets.description LIKE ?');
                    conditions.params.push(`%${term}%`, `%${term}%`);

                    termConditions.push('generators.name LIKE ? OR generators.description LIKE ?');
                    conditions.params.push(`%${term}%`, `%${term}%`);

                    termConditions.push('projects.name LIKE ? OR projects.description LIKE ?');
                    conditions.params.push(`%${term}%`, `%${term}%`);
                }
            }

            conditions.where.push(`(${termConditions.join(' OR ')})`);
        }

        // Add field-specific filters
        for (const [field, value] of Object.entries({ ...parsedQuery.filters, ...filters })) {
            switch (field) {
                case 'type':
                    conditions.where.push('assets.type = ?');
                    conditions.params.push(value);
                    break;
                case 'category':
                    conditions.where.push('assets.category = ? OR generators.category = ?');
                    conditions.params.push(value, value);
                    break;
                case 'status':
                    conditions.where.push('projects.status = ?');
                    conditions.params.push(value);
                    break;
                case 'created_after':
                    conditions.where.push('created_at > ?');
                    conditions.params.push(value);
                    break;
                case 'created_before':
                    conditions.where.push('created_at < ?');
                    conditions.params.push(value);
                    break;
                case 'updated_after':
                    conditions.where.push('updated_at > ?');
                    conditions.params.push(value);
                    break;
                case 'updated_before':
                    conditions.where.push('updated_at < ?');
                    conditions.params.push(value);
                    break;
            }
        }

        return conditions;
    }

    /**
     * Execute search query
     */
    async executeSearch(conditions, options) {
        const { sortBy, sortOrder, limit, offset } = options;

        // Build the main search query
        let sql = `
            SELECT
                'asset' as result_type,
                assets.id,
                assets.name,
                assets.description,
                assets.type,
                assets.category,
                assets.created_at,
                assets.updated_at,
                NULL as status
            FROM assets
        `;

        if (this.enableFullTextSearch) {
            sql += `
                LEFT JOIN assets_fts ON assets.id = assets_fts.asset_id
            `;
        }

        // Add WHERE conditions
        if (conditions.where.length > 0) {
            sql += ` WHERE ${conditions.where.join(' AND ')}`;
        }

        // Add UNION for other types
        sql += `
            UNION ALL
            SELECT
                'generator' as result_type,
                generators.id,
                generators.name,
                generators.description,
                generators.type,
                generators.category,
                generators.created_at,
                generators.updated_at,
                NULL as status
            FROM generators
        `;

        if (this.enableFullTextSearch) {
            sql += `
                LEFT JOIN generators_fts ON generators.id = generators_fts.generator_id
            `;
        }

        if (conditions.where.length > 0) {
            sql += ` WHERE ${conditions.where.join(' AND ')}`;
        }

        sql += `
            UNION ALL
            SELECT
                'project' as result_type,
                projects.id,
                projects.name,
                projects.description,
                NULL as type,
                NULL as category,
                projects.created_at,
                projects.updated_at,
                projects.status
            FROM projects
        `;

        if (this.enableFullTextSearch) {
            sql += `
                LEFT JOIN projects_fts ON projects.id = projects_fts.project_id
            `;
        }

        if (conditions.where.length > 0) {
            sql += ` WHERE ${conditions.where.join(' AND ')}`;
        }

        // Add sorting
        const sortField = this.getSortField(sortBy);
        sql += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;

        // Add pagination
        sql += ` LIMIT ? OFFSET ?`;
        conditions.params.push(limit, offset);

        const results = await this.db.all(sql, conditions.params);
        return results;
    }

    /**
     * Calculate search facets
     */
    async calculateFacets(conditions, type) {
        const facets = {
            types: {},
            categories: {},
            statuses: {},
            dateRanges: {}
        };

        // Count by type
        const typeQuery = `
            SELECT result_type, COUNT(*) as count
            FROM (${this.buildFacetSubquery(conditions, type)})
            GROUP BY result_type
        `;

        const typeResults = await this.db.all(typeQuery, conditions.params);
        for (const row of typeResults) {
            facets.types[row.result_type] = row.count;
        }

        // Count by category
        const categoryQuery = `
            SELECT category, COUNT(*) as count
            FROM (${this.buildFacetSubquery(conditions, type)})
            WHERE category IS NOT NULL
            GROUP BY category
        `;

        const categoryResults = await this.db.all(categoryQuery, conditions.params);
        for (const row of categoryResults) {
            facets.categories[row.category] = row.count;
        }

        return facets;
    }

    /**
     * Build facet subquery
     */
    buildFacetSubquery(conditions, type) {
        // Similar to executeSearch but without pagination
        let sql = `
            SELECT result_type, category, status
            FROM (
                SELECT 'asset' as result_type, category, NULL as status FROM assets
                UNION ALL
                SELECT 'generator' as result_type, category, NULL as status FROM generators
                UNION ALL
                SELECT 'project' as result_type, NULL as category, status FROM projects
            )
        `;

        if (conditions.where.length > 0) {
            sql += ` WHERE ${conditions.where.join(' AND ')}`;
        }

        return sql;
    }

    /**
     * Rank and sort results
     */
    rankAndSortResults(results, parsedQuery, sortBy, sortOrder) {
        // Calculate relevance scores
        for (const result of results) {
            result.relevanceScore = this.calculateRelevanceScore(result, parsedQuery);
        }

        // Sort by specified field
        const sortField = this.getSortField(sortBy);
        const sortMultiplier = sortOrder === 'desc' ? -1 : 1;

        results.sort((a, b) => {
            if (sortBy === 'relevance') {
                return (b.relevanceScore - a.relevanceScore) * sortMultiplier;
            }

            const aValue = a[sortField] || '';
            const bValue = b[sortField] || '';

            if (aValue < bValue) return -1 * sortMultiplier;
            if (aValue > bValue) return 1 * sortMultiplier;
            return 0;
        });

        return results;
    }

    /**
     * Calculate relevance score
     */
    calculateRelevanceScore(result, parsedQuery) {
        let score = 0;

        // Exact matches in name get highest score
        for (const term of parsedQuery.terms) {
            if (result.name && result.name.toLowerCase().includes(term)) {
                score += 10;
            }
            if (result.description && result.description.toLowerCase().includes(term)) {
                score += 5;
            }
        }

        // Phrase matches get bonus
        for (const phrase of parsedQuery.phrases) {
            if (result.name && result.name.toLowerCase().includes(phrase.toLowerCase())) {
                score += 20;
            }
        }

        // Recency bonus
        if (result.updated_at) {
            const daysSinceUpdate = (Date.now() - new Date(result.updated_at)) / (1000 * 60 * 60 * 24);
            score += Math.max(0, 10 - daysSinceUpdate);
        }

        return score;
    }

    /**
     * Get sort field mapping
     */
    getSortField(sortBy) {
        const fieldMap = {
            'relevance': 'relevanceScore',
            'name': 'name',
            'created': 'created_at',
            'updated': 'updated_at',
            'type': 'type'
        };

        return fieldMap[sortBy] || 'relevanceScore';
    }

    /**
     * Paginate results
     */
    paginateResults(results, limit, offset) {
        return results.slice(offset, offset + limit);
    }

    /**
     * Generate search suggestions
     */
    async getSearchSuggestions(query, options = {}) {
        const { limit = 10, type = 'all' } = options;

        if (!query || query.length < 2) {
            return [];
        }

        const suggestions = [];

        // Get popular search terms
        const popularTerms = await this.getPopularSearchTerms(query, limit);
        suggestions.push(...popularTerms);

        // Get field suggestions
        const fieldSuggestions = this.getFieldSuggestions(query);
        suggestions.push(...fieldSuggestions);

        // Get result previews
        const resultPreviews = await this.getResultPreviews(query, type, limit);
        suggestions.push(...resultPreviews);

        return suggestions.slice(0, limit);
    }

    /**
     * Get popular search terms
     */
    async getPopularSearchTerms(prefix, limit) {
        // This would typically query a search analytics table
        // For now, return some example suggestions
        const popularTerms = [
            'character sprite',
            'background texture',
            'ui button',
            'animation frame',
            'sound effect'
        ];

        return popularTerms
            .filter(term => term.startsWith(prefix.toLowerCase()))
            .slice(0, limit)
            .map(term => ({ type: 'popular', text: term }));
    }

    /**
     * Get field suggestions
     */
    getFieldSuggestions(query) {
        const fields = ['type:', 'category:', 'status:', 'created:', 'updated:'];
        const suggestions = [];

        for (const field of fields) {
            if (field.startsWith(query.toLowerCase())) {
                suggestions.push({
                    type: 'field',
                    text: field,
                    description: `Search by ${field.slice(0, -1)}`
                });
            }
        }

        return suggestions;
    }

    /**
     * Get result previews
     */
    async getResultPreviews(query, type, limit) {
        try {
            const searchResult = await this.search(query, {
                type,
                limit: Math.min(limit, 5),
                includeFacets: false
            });

            return searchResult.results.map(result => ({
                type: 'result',
                text: result.name,
                description: `${result.result_type} - ${result.description || ''}`,
                result
            }));

        } catch (error) {
            console.error('Failed to get result previews:', error);
            return [];
        }
    }

    /**
     * Record search metrics
     */
    async recordSearchMetrics(query, options, executionTime, resultCount) {
        const key = this.generateCacheKey(query, options);
        const metrics = this.searchStats.get(key) || {
            query,
            options,
            executions: 0,
            totalTime: 0,
            avgTime: 0,
            minTime: Infinity,
            maxTime: 0,
            totalResults: 0,
            avgResults: 0,
            lastExecuted: null
        };

        metrics.executions++;
        metrics.totalTime += executionTime;
        metrics.avgTime = metrics.totalTime / metrics.executions;
        metrics.minTime = Math.min(metrics.minTime, executionTime);
        metrics.maxTime = Math.max(metrics.maxTime, executionTime);
        metrics.totalResults += resultCount;
        metrics.avgResults = metrics.totalResults / metrics.executions;
        metrics.lastExecuted = new Date().toISOString();

        this.searchStats.set(key, metrics);
    }

    /**
     * Get search analytics
     */
    getSearchAnalytics(options = {}) {
        const { limit = 50, sortBy = 'executions' } = options;

        const analytics = Array.from(this.searchStats.values())
            .sort((a, b) => b[sortBy] - a[sortBy])
            .slice(0, limit);

        return {
            totalSearches: this.searchStats.size,
            analytics,
            summary: this.calculateAnalyticsSummary()
        };
    }

    /**
     * Calculate analytics summary
     */
    calculateAnalyticsSummary() {
        const searches = Array.from(this.searchStats.values());

        if (searches.length === 0) {
            return {};
        }

        const summary = {
            totalExecutions: searches.reduce((sum, s) => sum + s.executions, 0),
            avgExecutionTime: searches.reduce((sum, s) => sum + s.avgTime, 0) / searches.length,
            totalResults: searches.reduce((sum, s) => sum + s.totalResults, 0),
            avgResultsPerSearch: searches.reduce((sum, s) => sum + s.avgResults, 0) / searches.length
        };

        return summary;
    }

    /**
     * Generate cache key
     */
    generateCacheKey(query, options) {
        const hash = require('crypto').createHash('md5');
        hash.update(JSON.stringify({ query, options }));
        return hash.digest('hex');
    }

    /**
     * Get cached result
     */
    getCachedResult(key) {
        const cached = this.searchCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.result;
        }

        if (cached) {
            this.searchCache.delete(key);
        }

        return null;
    }

    /**
     * Set cached result
     */
    setCachedResult(key, result) {
        if (this.searchCache.size >= this.cacheSize) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }

        this.searchCache.set(key, {
            result: JSON.parse(JSON.stringify(result)),
            timestamp: Date.now()
        });
    }

    /**
     * Generate search ID
     */
    generateSearchId() {
        return require('crypto').randomBytes(8).toString('hex');
    }

    /**
     * Setup search monitoring
     */
    setupSearchMonitoring() {
        // Monitor search performance
        setInterval(() => {
            this.logSearchPerformance();
        }, 10 * 60 * 1000); // Every 10 minutes
    }

    /**
     * Log search performance
     */
    logSearchPerformance() {
        const analytics = this.getSearchAnalytics({ limit: 10 });

        if (analytics.analytics.length > 0) {
            console.log('Top 10 search queries:');
            analytics.analytics.forEach((search, index) => {
                console.log(`${index + 1}. "${search.query}" - ${search.executions} executions, ${search.avgTime.toFixed(2)}ms avg`);
            });
        }
    }

    /**
     * Clear search cache
     */
    clearCache() {
        this.searchCache.clear();
        console.log('Search cache cleared');
    }

    /**
     * Rebuild search indexes
     */
    async rebuildIndexes() {
        console.log('Rebuilding search indexes...');

        // Clear existing FTS tables
        if (this.enableFullTextSearch) {
            const ftsTables = ['assets_fts', 'generators_fts', 'projects_fts'];

            for (const table of ftsTables) {
                try {
                    await this.db.run(`DROP TABLE IF EXISTS ${table}`);
                } catch (error) {
                    console.warn(`Failed to drop FTS table ${table}:`, error);
                }
            }
        }

        // Recreate indexes and FTS tables
        await this.setupFullTextSearch();
        await this.createSearchIndexes();

        console.log('Search indexes rebuilt');
    }

    /**
     * Get search statistics
     */
    getStatistics() {
        return {
            cacheSize: this.searchCache.size,
            cacheMaxSize: this.cacheSize,
            activeSearches: this.activeSearches.size,
            indexedQueries: this.searchStats.size,
            ftsEnabled: this.enableFullTextSearch
        };
    }

    /**
     * Destroy the search manager
     */
    destroy() {
        this.clearCache();
        this.searchStats.clear();
        this.searchIndexes.clear();
        this.activeSearches.clear();

        console.log('Advanced search manager destroyed');
    }
}

module.exports = AdvancedSearchManager;
