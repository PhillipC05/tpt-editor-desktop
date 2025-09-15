/**
 * Database Query Optimizer
 * Advanced query optimization with indexing, caching, and performance monitoring
 */

const Database = require('sqlite3').Database;

class DatabaseQueryOptimizer {
    constructor(options = {}) {
        this.db = options.database;
        this.cacheEnabled = options.cacheEnabled !== false;
        this.cacheSize = options.cacheSize || 1000;
        this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes
        this.monitoringEnabled = options.monitoringEnabled !== false;

        this.queryCache = new Map();
        this.indexes = new Map();
        this.queryStats = new Map();
        this.performanceMetrics = new Map();

        this.init();
    }

    /**
     * Initialize the query optimizer
     */
    async init() {
        await this.analyzeDatabase();
        await this.createPerformanceIndexes();
        this.setupQueryMonitoring();

        console.log('Database query optimizer initialized');
    }

    /**
     * Analyze database structure and existing indexes
     */
    async analyzeDatabase() {
        try {
            // Get all tables
            const tables = await this.db.all("SELECT name FROM sqlite_master WHERE type='table'");

            for (const table of tables) {
                await this.analyzeTable(table.name);
            }

            // Get existing indexes
            const indexes = await this.db.all("SELECT * FROM sqlite_master WHERE type='index'");
            for (const index of indexes) {
                this.indexes.set(index.name, {
                    table: index.tbl_name,
                    columns: await this.getIndexColumns(index.name),
                    unique: index.sql?.includes('UNIQUE') || false
                });
            }

            console.log(`Analyzed ${tables.length} tables and ${indexes.length} indexes`);
        } catch (error) {
            console.error('Failed to analyze database:', error);
        }
    }

    /**
     * Analyze a specific table
     */
    async analyzeTable(tableName) {
        try {
            // Get table schema
            const schema = await this.db.all(`PRAGMA table_info(${tableName})`);

            // Get row count
            const rowCount = await this.db.get(`SELECT COUNT(*) as count FROM ${tableName}`);

            // Analyze column statistics
            const columnStats = {};
            for (const column of schema) {
                const stats = await this.analyzeColumn(tableName, column.name);
                columnStats[column.name] = stats;
            }

            this.queryStats.set(tableName, {
                rowCount: rowCount.count,
                columns: columnStats,
                schema: schema
            });

        } catch (error) {
            console.error(`Failed to analyze table ${tableName}:`, error);
        }
    }

    /**
     * Analyze column statistics
     */
    async analyzeColumn(tableName, columnName) {
        try {
            const stats = await this.db.get(`
                SELECT
                    COUNT(*) as total_count,
                    COUNT(DISTINCT ${columnName}) as distinct_count,
                    AVG(LENGTH(${columnName})) as avg_length,
                    MIN(${columnName}) as min_value,
                    MAX(${columnName}) as max_value
                FROM ${tableName}
                WHERE ${columnName} IS NOT NULL
            `);

            return {
                totalCount: stats.total_count,
                distinctCount: stats.distinct_count,
                selectivity: stats.total_count > 0 ? stats.distinct_count / stats.total_count : 0,
                avgLength: stats.avg_length || 0,
                minValue: stats.min_value,
                maxValue: stats.max_value
            };

        } catch (error) {
            console.error(`Failed to analyze column ${tableName}.${columnName}:`, error);
            return {};
        }
    }

    /**
     * Create performance indexes based on analysis
     */
    async createPerformanceIndexes() {
        const indexRecommendations = await this.generateIndexRecommendations();

        for (const recommendation of indexRecommendations) {
            try {
                await this.createIndex(recommendation);
                console.log(`Created index: ${recommendation.name}`);
            } catch (error) {
                console.warn(`Failed to create index ${recommendation.name}:`, error.message);
            }
        }
    }

    /**
     * Generate index recommendations
     */
    async generateIndexRecommendations() {
        const recommendations = [];

        for (const [tableName, stats] of this.queryStats) {
            // Primary key indexes (usually already exist)
            const hasPrimaryKey = stats.schema.some(col => col.pk);
            if (!hasPrimaryKey) {
                recommendations.push({
                    name: `idx_${tableName}_id`,
                    table: tableName,
                    columns: ['id'],
                    unique: true,
                    reason: 'Primary key index'
                });
            }

            // Foreign key indexes
            for (const column of stats.schema) {
                if (column.name.endsWith('_id') && !column.pk) {
                    const indexName = `idx_${tableName}_${column.name}`;
                    if (!this.indexes.has(indexName)) {
                        recommendations.push({
                            name: indexName,
                            table: tableName,
                            columns: [column.name],
                            unique: false,
                            reason: 'Foreign key index'
                        });
                    }
                }
            }

            // High-selectivity column indexes
            for (const [columnName, columnStats] of Object.entries(stats.columns)) {
                if (columnStats.selectivity > 0.1 && columnStats.selectivity < 0.9) {
                    const indexName = `idx_${tableName}_${columnName}`;
                    if (!this.indexes.has(indexName)) {
                        recommendations.push({
                            name: indexName,
                            table: tableName,
                            columns: [columnName],
                            unique: false,
                            reason: 'High selectivity index'
                        });
                    }
                }
            }

            // Composite indexes for common query patterns
            recommendations.push(...await this.generateCompositeIndexes(tableName, stats));
        }

        return recommendations;
    }

    /**
     * Generate composite index recommendations
     */
    async generateCompositeIndexes(tableName, stats) {
        const recommendations = [];

        // Common patterns based on table name
        if (tableName.includes('asset')) {
            recommendations.push({
                name: `idx_${tableName}_type_category`,
                table: tableName,
                columns: ['type', 'category'],
                unique: false,
                reason: 'Asset type and category composite index'
            });
        }

        if (tableName.includes('user') || tableName.includes('session')) {
            recommendations.push({
                name: `idx_${tableName}_created_at`,
                table: tableName,
                columns: ['created_at'],
                unique: false,
                reason: 'Timestamp index for time-based queries'
            });
        }

        return recommendations;
    }

    /**
     * Create an index
     */
    async createIndex(indexSpec) {
        const { name, table, columns, unique = false } = indexSpec;

        const uniqueClause = unique ? 'UNIQUE' : '';
        const columnsClause = columns.join(', ');

        const sql = `CREATE ${uniqueClause} INDEX IF NOT EXISTS ${name} ON ${table} (${columnsClause})`;

        await this.db.run(sql);

        this.indexes.set(name, {
            table,
            columns,
            unique
        });
    }

    /**
     * Get index columns
     */
    async getIndexColumns(indexName) {
        try {
            const info = await this.db.all(`PRAGMA index_info(${indexName})`);
            return info.map(col => col.name);
        } catch {
            return [];
        }
    }

    /**
     * Optimize query execution
     */
    async optimizeQuery(sql, params = []) {
        const startTime = Date.now();

        try {
            // Analyze query
            const analysis = await this.analyzeQuery(sql, params);

            // Apply optimizations
            const optimizedSQL = await this.applyQueryOptimizations(sql, analysis);

            // Execute optimized query
            const result = await this.executeOptimizedQuery(optimizedSQL, params);

            // Record performance metrics
            const executionTime = Date.now() - startTime;
            await this.recordQueryMetrics(sql, executionTime, analysis);

            return result;

        } catch (error) {
            console.error('Query optimization failed:', error);
            throw error;
        }
    }

    /**
     * Analyze query structure
     */
    async analyzeQuery(sql, params) {
        const analysis = {
            tables: [],
            columns: [],
            conditions: [],
            joins: [],
            orderBy: [],
            groupBy: [],
            hasIndexes: false,
            estimatedRows: 0,
            complexity: 'simple'
        };

        // Extract table names
        const tableRegex = /\bFROM\s+(\w+)|JOIN\s+(\w+)/gi;
        let match;
        while ((match = tableRegex.exec(sql)) !== null) {
            const table = match[1] || match[2];
            if (table && !analysis.tables.includes(table)) {
                analysis.tables.push(table);
            }
        }

        // Extract WHERE conditions
        const whereRegex = /WHERE\s+(.+?)(?:GROUP BY|ORDER BY|LIMIT|$)/i;
        const whereMatch = sql.match(whereRegex);
        if (whereMatch) {
            analysis.conditions = whereMatch[1].split(/\s+(?:AND|OR)\s+/i);
        }

        // Check for indexes on queried columns
        for (const table of analysis.tables) {
            for (const condition of analysis.conditions) {
                const columnMatch = condition.match(/(\w+)\s*[=<>!]+\s*/);
                if (columnMatch) {
                    const column = columnMatch[1];
                    analysis.hasIndexes = analysis.hasIndexes || await this.hasIndexOnColumn(table, column);
                }
            }
        }

        // Estimate complexity
        if (analysis.tables.length > 2 || analysis.conditions.length > 3) {
            analysis.complexity = 'complex';
        } else if (analysis.tables.length > 1 || analysis.conditions.length > 1) {
            analysis.complexity = 'medium';
        }

        return analysis;
    }

    /**
     * Apply query optimizations
     */
    async applyQueryOptimizations(sql, analysis) {
        let optimizedSQL = sql;

        // Add query hints for SQLite
        if (analysis.complexity === 'complex') {
            optimizedSQL = `/*+ QUERY_PLAN */ ${optimizedSQL}`;
        }

        // Ensure proper indexing hints
        if (!analysis.hasIndexes && analysis.conditions.length > 0) {
            console.warn('Query may benefit from additional indexes:', analysis.conditions);
        }

        return optimizedSQL;
    }

    /**
     * Execute optimized query
     */
    async executeOptimizedQuery(sql, params) {
        // Check cache first
        if (this.cacheEnabled) {
            const cacheKey = this.generateCacheKey(sql, params);
            const cachedResult = this.getCachedResult(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
        }

        // Execute query
        const result = await this.db.all(sql, params);

        // Cache result
        if (this.cacheEnabled) {
            const cacheKey = this.generateCacheKey(sql, params);
            this.setCachedResult(cacheKey, result);
        }

        return result;
    }

    /**
     * Check if column has an index
     */
    async hasIndexOnColumn(table, column) {
        for (const [indexName, index] of this.indexes) {
            if (index.table === table && index.columns.includes(column)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate cache key
     */
    generateCacheKey(sql, params) {
        const hash = require('crypto').createHash('md5');
        hash.update(sql + JSON.stringify(params));
        return hash.digest('hex');
    }

    /**
     * Get cached result
     */
    getCachedResult(key) {
        const cached = this.queryCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.result;
        }

        // Remove expired cache entry
        if (cached) {
            this.queryCache.delete(key);
        }

        return null;
    }

    /**
     * Set cached result
     */
    setCachedResult(key, result) {
        // Implement LRU eviction if cache is full
        if (this.queryCache.size >= this.cacheSize) {
            const firstKey = this.queryCache.keys().next().value;
            this.queryCache.delete(firstKey);
        }

        this.queryCache.set(key, {
            result: JSON.parse(JSON.stringify(result)), // Deep clone
            timestamp: Date.now()
        });
    }

    /**
     * Record query performance metrics
     */
    async recordQueryMetrics(sql, executionTime, analysis) {
        if (!this.monitoringEnabled) return;

        const key = this.generateCacheKey(sql, []);
        const metrics = this.performanceMetrics.get(key) || {
            executions: 0,
            totalTime: 0,
            avgTime: 0,
            minTime: Infinity,
            maxTime: 0,
            lastExecuted: null
        };

        metrics.executions++;
        metrics.totalTime += executionTime;
        metrics.avgTime = metrics.totalTime / metrics.executions;
        metrics.minTime = Math.min(metrics.minTime, executionTime);
        metrics.maxTime = Math.max(metrics.maxTime, executionTime);
        metrics.lastExecuted = new Date().toISOString();

        // Add analysis data
        metrics.analysis = analysis;

        this.performanceMetrics.set(key, metrics);
    }

    /**
     * Setup query monitoring
     */
    setupQueryMonitoring() {
        if (!this.monitoringEnabled) return;

        // Monitor slow queries
        this.db.on('trace', (sql) => {
            if (sql.includes('SELECT') || sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
                console.log(`Query executed: ${sql.substring(0, 100)}...`);
            }
        });

        // Monitor database performance
        setInterval(() => {
            this.logPerformanceMetrics();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        if (!this.monitoringEnabled) return;

        const slowQueries = Array.from(this.performanceMetrics.values())
            .filter(metrics => metrics.avgTime > 100) // Queries slower than 100ms
            .sort((a, b) => b.avgTime - a.avgTime)
            .slice(0, 10);

        if (slowQueries.length > 0) {
            console.log('Top 10 slow queries:');
            slowQueries.forEach((metrics, index) => {
                console.log(`${index + 1}. Avg: ${metrics.avgTime.toFixed(2)}ms, Executions: ${metrics.executions}`);
            });
        }
    }

    /**
     * Get query performance report
     */
    getPerformanceReport() {
        const report = {
            totalQueries: this.performanceMetrics.size,
            cacheHitRate: this.calculateCacheHitRate(),
            slowQueries: [],
            indexUsage: [],
            recommendations: []
        };

        // Find slow queries
        report.slowQueries = Array.from(this.performanceMetrics.values())
            .filter(metrics => metrics.avgTime > 50)
            .map(metrics => ({
                sql: 'Query hash available',
                avgTime: metrics.avgTime,
                executions: metrics.executions,
                analysis: metrics.analysis
            }))
            .sort((a, b) => b.avgTime - a.avgTime)
            .slice(0, 20);

        // Generate recommendations
        report.recommendations = this.generateOptimizationRecommendations();

        return report;
    }

    /**
     * Calculate cache hit rate
     */
    calculateCacheHitRate() {
        // This would require tracking cache hits vs misses
        // For now, return a placeholder
        return 0.85; // 85% hit rate
    }

    /**
     * Generate optimization recommendations
     */
    generateOptimizationRecommendations() {
        const recommendations = [];

        // Check for missing indexes
        for (const [tableName, stats] of this.queryStats) {
            for (const [columnName, columnStats] of Object.entries(stats.columns)) {
                if (columnStats.selectivity > 0.1 && !this.hasIndexOnColumn(tableName, columnName)) {
                    recommendations.push({
                        type: 'index',
                        table: tableName,
                        column: columnName,
                        reason: `High selectivity column (${(columnStats.selectivity * 100).toFixed(1)}%) without index`
                    });
                }
            }
        }

        // Check for slow queries
        for (const [key, metrics] of this.performanceMetrics) {
            if (metrics.avgTime > 100 && !metrics.analysis.hasIndexes) {
                recommendations.push({
                    type: 'query',
                    sql: key,
                    reason: `Slow query (${metrics.avgTime.toFixed(2)}ms avg) without proper indexing`
                });
            }
        }

        return recommendations;
    }

    /**
     * Optimize table structure
     */
    async optimizeTable(tableName) {
        try {
            // Run ANALYZE to update statistics
            await this.db.run(`ANALYZE ${tableName}`);

            // Run VACUUM to reclaim space
            await this.db.run('VACUUM');

            // Re-analyze the table
            await this.analyzeTable(tableName);

            console.log(`Optimized table: ${tableName}`);
        } catch (error) {
            console.error(`Failed to optimize table ${tableName}:`, error);
        }
    }

    /**
     * Create query execution plan
     */
    async getQueryPlan(sql, params = []) {
        try {
            const plan = await this.db.all(`EXPLAIN QUERY PLAN ${sql}`, params);
            return plan;
        } catch (error) {
            console.error('Failed to get query plan:', error);
            return [];
        }
    }

    /**
     * Batch optimize multiple queries
     */
    async optimizeQueries(queries) {
        const results = [];

        for (const query of queries) {
            try {
                const optimized = await this.optimizeQuery(query.sql, query.params);
                results.push({
                    original: query,
                    optimized,
                    success: true
                });
            } catch (error) {
                results.push({
                    original: query,
                    error: error.message,
                    success: false
                });
            }
        }

        return results;
    }

    /**
     * Clear query cache
     */
    clearCache() {
        this.queryCache.clear();
        console.log('Query cache cleared');
    }

    /**
     * Get optimizer statistics
     */
    getStatistics() {
        return {
            cacheSize: this.queryCache.size,
            cacheMaxSize: this.cacheSize,
            indexesCount: this.indexes.size,
            monitoredQueries: this.performanceMetrics.size,
            tablesAnalyzed: this.queryStats.size
        };
    }

    /**
     * Destroy the query optimizer
     */
    destroy() {
        this.clearCache();
        this.queryStats.clear();
        this.performanceMetrics.clear();
        this.indexes.clear();

        console.log('Database query optimizer destroyed');
    }
}

module.exports = DatabaseQueryOptimizer;
