/**
 * Database Migration Manager
 * Comprehensive database migration system with versioning, rollback, and testing
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class DatabaseMigrationManager {
    constructor(options = {}) {
        this.db = options.database;
        this.migrationPath = options.migrationPath || path.join(process.cwd(), 'src', 'database', 'migrations');
        this.schemaTable = options.schemaTable || 'schema_migrations';
        this.backupPath = options.backupPath || path.join(process.cwd(), 'backups');

        this.migrations = new Map();
        this.executedMigrations = new Set();
        this.pendingMigrations = new Set();

        this.init();
    }

    /**
     * Initialize the migration manager
     */
    async init() {
        await this.ensureDirectories();
        await this.ensureSchemaTable();
        await this.loadMigrations();
        await this.loadExecutedMigrations();

        console.log('Database migration manager initialized');
    }

    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        try {
            await fs.access(this.migrationPath);
        } catch {
            await fs.mkdir(this.migrationPath, { recursive: true });
        }

        try {
            await fs.access(this.backupPath);
        } catch {
            await fs.mkdir(this.backupPath, { recursive: true });
        }
    }

    /**
     * Ensure schema migrations table exists
     */
    async ensureSchemaTable() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS ${this.schemaTable} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                migration_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                checksum TEXT NOT NULL,
                status TEXT DEFAULT 'completed',
                error_message TEXT,
                rollback_sql TEXT
            )
        `;

        try {
            await this.db.run(createTableSQL);
        } catch (error) {
            console.error('Failed to create schema migrations table:', error);
            throw error;
        }
    }

    /**
     * Load migration files
     */
    async loadMigrations() {
        try {
            const files = await fs.readdir(this.migrationPath);
            const migrationFiles = files
                .filter(file => file.endsWith('.js'))
                .sort();

            for (const file of migrationFiles) {
                const migrationPath = path.join(this.migrationPath, file);
                const migration = require(migrationPath);

                if (this.validateMigration(migration)) {
                    const migrationId = this.extractMigrationId(file);
                    this.migrations.set(migrationId, {
                        id: migrationId,
                        name: migration.name,
                        file: migrationPath,
                        up: migration.up,
                        down: migration.down,
                        checksum: this.calculateChecksum(migrationPath)
                    });
                }
            }

            console.log(`Loaded ${this.migrations.size} migrations`);
        } catch (error) {
            console.error('Failed to load migrations:', error);
            throw error;
        }
    }

    /**
     * Load executed migrations from database
     */
    async loadExecutedMigrations() {
        try {
            const rows = await this.db.all(`SELECT migration_id FROM ${this.schemaTable} WHERE status = 'completed'`);
            this.executedMigrations = new Set(rows.map(row => row.migration_id));

            // Update pending migrations
            this.pendingMigrations = new Set();
            for (const [id] of this.migrations) {
                if (!this.executedMigrations.has(id)) {
                    this.pendingMigrations.add(id);
                }
            }

            console.log(`Found ${this.executedMigrations.size} executed migrations`);
        } catch (error) {
            console.error('Failed to load executed migrations:', error);
            throw error;
        }
    }

    /**
     * Create a new migration file
     */
    async createMigration(name, template = 'basic') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const migrationId = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}`;
        const filename = `${migrationId}.js`;

        const templateContent = this.getMigrationTemplate(template, name);

        const filePath = path.join(this.migrationPath, filename);

        try {
            await fs.writeFile(filePath, templateContent, 'utf8');
            console.log(`Created migration: ${filename}`);

            // Reload migrations
            await this.loadMigrations();

            return migrationId;
        } catch (error) {
            console.error('Failed to create migration:', error);
            throw error;
        }
    }

    /**
     * Run pending migrations
     */
    async migrate(options = {}) {
        const { dryRun = false, targetVersion } = options;

        if (this.pendingMigrations.size === 0) {
            console.log('No pending migrations');
            return { executed: [], skipped: [] };
        }

        const toExecute = Array.from(this.pendingMigrations)
            .filter(id => !targetVersion || id <= targetVersion)
            .sort();

        const executed = [];
        const skipped = [];

        for (const migrationId of toExecute) {
            try {
                const migration = this.migrations.get(migrationId);

                if (dryRun) {
                    console.log(`[DRY RUN] Would execute migration: ${migrationId}`);
                    executed.push(migrationId);
                    continue;
                }

                // Create backup before migration
                await this.createBackup(`pre_migration_${migrationId}`);

                // Execute migration
                await this.executeMigration(migration);

                // Record execution
                await this.recordMigration(migration);

                executed.push(migrationId);
                console.log(`Executed migration: ${migrationId}`);

            } catch (error) {
                console.error(`Failed to execute migration ${migrationId}:`, error);

                // Attempt rollback if migration failed
                if (!dryRun) {
                    await this.rollbackMigration(migrationId);
                }

                throw new Error(`Migration ${migrationId} failed: ${error.message}`);
            }
        }

        return { executed, skipped };
    }

    /**
     * Rollback migrations
     */
    async rollback(options = {}) {
        const { steps = 1, targetVersion, dryRun = false } = options;

        const executed = Array.from(this.executedMigrations).sort().reverse();
        const toRollback = [];

        if (targetVersion) {
            // Rollback to specific version
            toRollback.push(...executed.filter(id => id > targetVersion));
        } else {
            // Rollback specified number of steps
            toRollback.push(...executed.slice(0, steps));
        }

        const rolledBack = [];

        for (const migrationId of toRollback) {
            try {
                const migration = this.migrations.get(migrationId);

                if (dryRun) {
                    console.log(`[DRY RUN] Would rollback migration: ${migrationId}`);
                    rolledBack.push(migrationId);
                    continue;
                }

                // Create backup before rollback
                await this.createBackup(`pre_rollback_${migrationId}`);

                // Execute rollback
                await this.rollbackMigration(migrationId);

                // Remove from executed
                await this.unrecordMigration(migrationId);

                rolledBack.push(migrationId);
                console.log(`Rolled back migration: ${migrationId}`);

            } catch (error) {
                console.error(`Failed to rollback migration ${migrationId}:`, error);
                throw new Error(`Rollback ${migrationId} failed: ${error.message}`);
            }
        }

        return rolledBack;
    }

    /**
     * Execute a single migration
     */
    async executeMigration(migration) {
        if (!migration.up) {
            throw new Error(`Migration ${migration.id} has no up function`);
        }

        // Wrap migration in transaction
        await this.db.run('BEGIN TRANSACTION');

        try {
            if (typeof migration.up === 'string') {
                // SQL string
                await this.db.run(migration.up);
            } else if (typeof migration.up === 'function') {
                // Function
                await migration.up(this.db);
            } else {
                throw new Error('Invalid migration up format');
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Rollback a single migration
     */
    async rollbackMigration(migrationId) {
        const migration = this.migrations.get(migrationId);

        if (!migration || !migration.down) {
            console.warn(`No rollback function for migration ${migrationId}`);
            return;
        }

        // Wrap rollback in transaction
        await this.db.run('BEGIN TRANSACTION');

        try {
            if (typeof migration.down === 'string') {
                // SQL string
                await this.db.run(migration.down);
            } else if (typeof migration.down === 'function') {
                // Function
                await migration.down(this.db);
            } else {
                throw new Error('Invalid migration down format');
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Record migration execution
     */
    async recordMigration(migration) {
        const sql = `
            INSERT INTO ${this.schemaTable}
            (migration_id, name, checksum, status)
            VALUES (?, ?, ?, 'completed')
        `;

        await this.db.run(sql, [
            migration.id,
            migration.name,
            migration.checksum
        ]);

        this.executedMigrations.add(migration.id);
        this.pendingMigrations.delete(migration.id);
    }

    /**
     * Remove migration record
     */
    async unrecordMigration(migrationId) {
        const sql = `DELETE FROM ${this.schemaTable} WHERE migration_id = ?`;
        await this.db.run(sql, [migrationId]);

        this.executedMigrations.delete(migrationId);
        this.pendingMigrations.add(migrationId);
    }

    /**
     * Create database backup
     */
    async createBackup(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupFile = path.join(this.backupPath, `${name}_${timestamp}.db`);

        try {
            // SQLite backup using VACUUM INTO (SQLite 3.27+)
            await this.db.run(`VACUUM INTO ?`, [backupFile]);
            console.log(`Created backup: ${backupFile}`);
        } catch (error) {
            console.warn('VACUUM INTO not supported, skipping backup:', error.message);
        }
    }

    /**
     * Restore from backup
     */
    async restoreFromBackup(backupFile) {
        const backupPath = path.join(this.backupPath, backupFile);

        try {
            // Close current database
            await this.db.close();

            // Copy backup to main database
            await fs.copyFile(backupPath, this.db.filename || 'database.db');

            // Reinitialize
            await this.init();

            console.log(`Restored from backup: ${backupFile}`);
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            throw error;
        }
    }

    /**
     * Get migration status
     */
    async getStatus() {
        const status = {
            total: this.migrations.size,
            executed: this.executedMigrations.size,
            pending: this.pendingMigrations.size,
            migrations: []
        };

        for (const [id, migration] of this.migrations) {
            const executed = this.executedMigrations.has(id);
            const record = executed ? await this.getMigrationRecord(id) : null;

            status.migrations.push({
                id,
                name: migration.name,
                executed,
                executedAt: record?.executed_at,
                checksum: migration.checksum,
                status: record?.status || 'pending'
            });
        }

        status.migrations.sort((a, b) => a.id.localeCompare(b.id));

        return status;
    }

    /**
     * Get migration record from database
     */
    async getMigrationRecord(migrationId) {
        const sql = `SELECT * FROM ${this.schemaTable} WHERE migration_id = ?`;
        return await this.db.get(sql, [migrationId]);
    }

    /**
     * Validate migration structure
     */
    validateMigration(migration) {
        return (
            migration &&
            typeof migration === 'object' &&
            migration.name &&
            (migration.up || migration.down)
        );
    }

    /**
     * Extract migration ID from filename
     */
    extractMigrationId(filename) {
        return filename.replace('.js', '');
    }

    /**
     * Calculate checksum for migration file
     */
    calculateChecksum(filePath) {
        try {
            const content = require(filePath);
            const hash = crypto.createHash('sha256');
            hash.update(JSON.stringify(content));
            return hash.digest('hex');
        } catch {
            return '';
        }
    }

    /**
     * Get migration template
     */
    getMigrationTemplate(template, name) {
        const templates = {
            basic: `
module.exports = {
    name: '${name}',

    up: async function(db) {
        // Migration up logic
        await db.run(\`
            -- Add your migration SQL here
            CREATE TABLE IF NOT EXISTS example_table (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        \`);
    },

    down: async function(db) {
        // Migration down logic
        await db.run(\`
            -- Add your rollback SQL here
            DROP TABLE IF EXISTS example_table
        \`);
    }
};
`,
            data: `
module.exports = {
    name: '${name}',

    up: async function(db) {
        // Data migration logic
        const data = [
            // Add your data here
        ];

        for (const item of data) {
            await db.run(
                'INSERT INTO your_table (column1, column2) VALUES (?, ?)',
                [item.value1, item.value2]
            );
        }
    },

    down: async function(db) {
        // Data rollback logic
        await db.run('DELETE FROM your_table WHERE condition = ?', ['rollback_condition']);
    }
};
`,
            schema: `
module.exports = {
    name: '${name}',

    up: async function(db) {
        // Schema changes
        await db.run(\`
            ALTER TABLE existing_table ADD COLUMN new_column TEXT
        \`);

        await db.run(\`
            CREATE INDEX idx_new_column ON existing_table(new_column)
        \`);
    },

    down: async function(db) {
        // Schema rollback
        await db.run(\`
            DROP INDEX IF EXISTS idx_new_column
        \`);

        await db.run(\`
            ALTER TABLE existing_table DROP COLUMN new_column
        \`);
    }
};
`
        };

        return templates[template] || templates.basic;
    }

    /**
     * Test migration
     */
    async testMigration(migrationId) {
        const migration = this.migrations.get(migrationId);

        if (!migration) {
            throw new Error(`Migration ${migrationId} not found`);
        }

        console.log(`Testing migration: ${migrationId}`);

        // Create test database
        const testDb = new (require('sqlite3').Database)(':memory:');

        try {
            // Execute migration
            await this.executeMigration({ ...migration, db: testDb });

            // Test rollback if available
            if (migration.down) {
                await this.rollbackMigration({ ...migration, db: testDb });
            }

            console.log(`Migration ${migrationId} test passed`);
            return true;

        } catch (error) {
            console.error(`Migration ${migrationId} test failed:`, error);
            return false;

        } finally {
            testDb.close();
        }
    }

    /**
     * Clean up old backups
     */
    async cleanupBackups(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
        try {
            const files = await fs.readdir(this.backupPath);
            const now = Date.now();

            for (const file of files) {
                const filePath = path.join(this.backupPath, file);
                const stats = await fs.stat(filePath);

                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.unlink(filePath);
                    console.log(`Cleaned up old backup: ${file}`);
                }
            }
        } catch (error) {
            console.error('Failed to cleanup backups:', error);
        }
    }

    /**
     * Get migration statistics
     */
    getStatistics() {
        return {
            totalMigrations: this.migrations.size,
            executedMigrations: this.executedMigrations.size,
            pendingMigrations: this.pendingMigrations.size,
            backupCount: 0, // Would need to count backup files
            lastMigration: Array.from(this.executedMigrations).sort().pop()
        };
    }

    /**
     * Destroy the migration manager
     */
    destroy() {
        this.migrations.clear();
        this.executedMigrations.clear();
        this.pendingMigrations.clear();

        console.log('Database migration manager destroyed');
    }
}

module.exports = DatabaseMigrationManager;
