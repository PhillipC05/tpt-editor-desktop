/**
 * Database Backup Manager
 * Comprehensive backup and recovery system with scheduling and verification
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

class DatabaseBackupManager {
    constructor(options = {}) {
        this.db = options.database;
        this.backupPath = options.backupPath || path.join(process.cwd(), 'backups');
        this.tempPath = options.tempPath || path.join(process.cwd(), 'temp');
        this.retentionDays = options.retentionDays || 30;
        this.compressionEnabled = options.compressionEnabled !== false;
        this.encryptionEnabled = options.encryptionEnabled || false;
        this.encryptionKey = options.encryptionKey;

        this.backupSchedule = new Map();
        this.backupHistory = new Map();
        this.backupLocks = new Set();

        this.init();
    }

    /**
     * Initialize the backup manager
     */
    async init() {
        await this.ensureDirectories();
        await this.loadBackupHistory();
        this.setupScheduledBackups();

        console.log('Database backup manager initialized');
    }

    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        const dirs = [this.backupPath, this.tempPath];

        for (const dir of dirs) {
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
            }
        }
    }

    /**
     * Create a database backup
     */
    async createBackup(options = {}) {
        const {
            name,
            type = 'full',
            compression = this.compressionEnabled,
            encryption = this.encryptionEnabled,
            verify = true
        } = options;

        const backupId = this.generateBackupId();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const baseName = name || `${type}_backup_${timestamp}`;
        const backupName = `${baseName}_${backupId}`;

        // Prevent concurrent backups
        if (this.backupLocks.has('backup')) {
            throw new Error('Backup already in progress');
        }

        this.backupLocks.add('backup');

        try {
            console.log(`Starting ${type} backup: ${backupName}`);

            // Create backup metadata
            const metadata = {
                id: backupId,
                name: backupName,
                type,
                timestamp: new Date().toISOString(),
                database: this.db.filename || 'database.db',
                compression,
                encryption,
                status: 'in_progress'
            };

            // Perform backup based on type
            let backupPath;
            switch (type) {
                case 'full':
                    backupPath = await this.createFullBackup(backupName, compression, encryption);
                    break;
                case 'incremental':
                    backupPath = await this.createIncrementalBackup(backupName, compression, encryption);
                    break;
                case 'differential':
                    backupPath = await this.createDifferentialBackup(backupName, compression, encryption);
                    break;
                default:
                    throw new Error(`Unknown backup type: ${type}`);
            }

            // Update metadata
            metadata.path = backupPath;
            metadata.size = await this.getFileSize(backupPath);
            metadata.checksum = await this.calculateChecksum(backupPath);
            metadata.status = 'completed';

            // Verify backup if requested
            if (verify) {
                const isValid = await this.verifyBackup(backupPath, metadata);
                if (!isValid) {
                    metadata.status = 'verification_failed';
                    console.error(`Backup verification failed: ${backupName}`);
                }
            }

            // Save backup metadata
            await this.saveBackupMetadata(metadata);

            // Update backup history
            this.backupHistory.set(backupId, metadata);

            // Cleanup old backups
            await this.cleanupOldBackups();

            console.log(`Backup completed: ${backupName} (${this.formatBytes(metadata.size)})`);

            return metadata;

        } catch (error) {
            console.error('Backup failed:', error);

            // Save failed backup metadata
            const metadata = {
                id: backupId,
                name: backupName,
                type,
                timestamp: new Date().toISOString(),
                status: 'failed',
                error: error.message
            };

            await this.saveBackupMetadata(metadata);
            throw error;

        } finally {
            this.backupLocks.delete('backup');
        }
    }

    /**
     * Create full database backup
     */
    async createFullBackup(name, compression, encryption) {
        const tempPath = path.join(this.tempPath, `${name}.db`);
        const finalPath = path.join(this.backupPath, `${name}.db`);

        try {
            // Use SQLite VACUUM INTO for full backup
            await this.db.run(`VACUUM INTO ?`, [tempPath]);

            // Apply compression if enabled
            if (compression) {
                const compressedPath = await this.compressFile(tempPath, finalPath);
                await fs.unlink(tempPath); // Remove uncompressed file
                return compressedPath;
            }

            // Apply encryption if enabled
            if (encryption) {
                const encryptedPath = await this.encryptFile(tempPath, finalPath);
                await fs.unlink(tempPath); // Remove unencrypted file
                return encryptedPath;
            }

            // Move to final location
            await fs.rename(tempPath, finalPath);
            return finalPath;

        } catch (error) {
            // Cleanup on failure
            try {
                await fs.unlink(tempPath);
            } catch {}
            throw error;
        }
    }

    /**
     * Create incremental backup
     */
    async createIncrementalBackup(name, compression, encryption) {
        // For SQLite, incremental backups are more complex
        // We'll implement a simple approach using WAL mode
        const walPath = `${this.db.filename || 'database.db'}-wal`;
        const shmPath = `${this.db.filename || 'database.db'}-shm`;

        const backupPath = path.join(this.backupPath, `${name}.zip`);

        try {
            // Create backup of main database and WAL files
            const files = [this.db.filename || 'database.db'];

            // Check if WAL files exist
            try {
                await fs.access(walPath);
                files.push(walPath);
            } catch {}

            try {
                await fs.access(shmPath);
                files.push(shmPath);
            } catch {}

            // Create compressed archive
            await this.createZipArchive(files, backupPath);

            return backupPath;

        } catch (error) {
            console.error('Incremental backup failed:', error);
            throw error;
        }
    }

    /**
     * Create differential backup
     */
    async createDifferentialBackup(name, compression, encryption) {
        // Differential backup since last full backup
        const lastFullBackup = await this.getLastFullBackup();

        if (!lastFullBackup) {
            // No full backup exists, create full backup instead
            return await this.createFullBackup(name, compression, encryption);
        }

        // For simplicity, we'll create a full backup
        // In a production system, you'd track changes since last backup
        return await this.createFullBackup(`${name}_diff`, compression, encryption);
    }

    /**
     * Restore from backup
     */
    async restoreFromBackup(backupId, options = {}) {
        const { targetPath, verify = true } = options;

        const metadata = this.backupHistory.get(backupId);
        if (!metadata) {
            throw new Error(`Backup not found: ${backupId}`);
        }

        if (metadata.status !== 'completed') {
            throw new Error(`Backup is not in completed state: ${metadata.status}`);
        }

        // Prevent concurrent restores
        if (this.backupLocks.has('restore')) {
            throw new Error('Restore already in progress');
        }

        this.backupLocks.add('restore');

        try {
            console.log(`Starting restore from backup: ${metadata.name}`);

            const restorePath = targetPath || this.db.filename || 'database.db';

            // Create backup of current database before restore
            const preRestoreBackup = await this.createBackup({
                name: `pre_restore_${Date.now()}`,
                type: 'full',
                verify: false
            });

            try {
                // Perform restore based on backup type
                switch (metadata.type) {
                    case 'full':
                        await this.restoreFullBackup(metadata.path, restorePath);
                        break;
                    case 'incremental':
                        await this.restoreIncrementalBackup(metadata.path, restorePath);
                        break;
                    case 'differential':
                        await this.restoreDifferentialBackup(metadata.path, restorePath);
                        break;
                    default:
                        throw new Error(`Unknown backup type: ${metadata.type}`);
                }

                // Verify restore if requested
                if (verify) {
                    const isValid = await this.verifyRestore(restorePath, metadata);
                    if (!isValid) {
                        throw new Error('Restore verification failed');
                    }
                }

                // Update metadata
                metadata.lastRestored = new Date().toISOString();
                metadata.restoreCount = (metadata.restoreCount || 0) + 1;
                await this.saveBackupMetadata(metadata);

                console.log(`Restore completed: ${metadata.name}`);

                return {
                    backupId,
                    restorePath,
                    preRestoreBackup: preRestoreBackup.id
                };

            } catch (restoreError) {
                // Attempt to restore from pre-restore backup
                console.error('Restore failed, attempting rollback:', restoreError);

                if (preRestoreBackup) {
                    await this.restoreFromBackup(preRestoreBackup.id, { verify: false });
                }

                throw restoreError;
            }

        } finally {
            this.backupLocks.delete('restore');
        }
    }

    /**
     * Restore full backup
     */
    async restoreFullBackup(backupPath, targetPath) {
        // Handle compression/encryption
        let sourcePath = backupPath;

        if (backupPath.endsWith('.gz')) {
            sourcePath = await this.decompressFile(backupPath);
        } else if (backupPath.endsWith('.enc')) {
            sourcePath = await this.decryptFile(backupPath);
        }

        // Copy backup to target location
        await fs.copyFile(sourcePath, targetPath);

        // Cleanup temporary files
        if (sourcePath !== backupPath) {
            await fs.unlink(sourcePath);
        }
    }

    /**
     * Restore incremental backup
     */
    async restoreIncrementalBackup(backupPath, targetPath) {
        // Extract files from archive
        const extractPath = path.join(this.tempPath, `restore_${Date.now()}`);
        await fs.mkdir(extractPath, { recursive: true });

        try {
            await this.extractZipArchive(backupPath, extractPath);

            // Copy main database file
            const dbFile = path.join(extractPath, path.basename(this.db.filename || 'database.db'));
            await fs.copyFile(dbFile, targetPath);

            // Handle WAL files if present
            const walFile = path.join(extractPath, `${path.basename(this.db.filename || 'database.db')}-wal`);
            try {
                await fs.copyFile(walFile, `${targetPath}-wal`);
            } catch {}

        } finally {
            // Cleanup
            await fs.rm(extractPath, { recursive: true, force: true });
        }
    }

    /**
     * Restore differential backup
     */
    async restoreDifferentialBackup(backupPath, targetPath) {
        // For simplicity, treat as full backup
        await this.restoreFullBackup(backupPath, targetPath);
    }

    /**
     * Verify backup integrity
     */
    async verifyBackup(backupPath, metadata) {
        try {
            // Check file exists and size matches
            const stats = await fs.stat(backupPath);
            if (stats.size !== metadata.size) {
                return false;
            }

            // Verify checksum
            const checksum = await this.calculateChecksum(backupPath);
            if (checksum !== metadata.checksum) {
                return false;
            }

            // For database backups, attempt to open and query
            if (metadata.type === 'full' && !backupPath.endsWith('.gz') && !backupPath.endsWith('.enc')) {
                const testDb = new (require('sqlite3').Database)(backupPath);
                try {
                    await new Promise((resolve, reject) => {
                        testDb.get('SELECT COUNT(*) as count FROM sqlite_master', (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    });
                } finally {
                    testDb.close();
                }
            }

            return true;

        } catch (error) {
            console.error('Backup verification failed:', error);
            return false;
        }
    }

    /**
     * Verify restore integrity
     */
    async verifyRestore(restorePath, originalMetadata) {
        try {
            const testDb = new (require('sqlite3').Database)(restorePath);

            try {
                // Basic integrity check
                const result = await new Promise((resolve, reject) => {
                    testDb.get('PRAGMA integrity_check', (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });

                return result['integrity_check'] === 'ok';

            } finally {
                testDb.close();
            }

        } catch (error) {
            console.error('Restore verification failed:', error);
            return false;
        }
    }

    /**
     * Schedule automated backups
     */
    scheduleBackup(scheduleConfig) {
        const {
            name,
            type = 'full',
            cronExpression,
            retentionDays = this.retentionDays,
            enabled = true
        } = scheduleConfig;

        const scheduleId = this.generateBackupId();

        this.backupSchedule.set(scheduleId, {
            id: scheduleId,
            name,
            type,
            cronExpression,
            retentionDays,
            enabled,
            nextRun: this.calculateNextRun(cronExpression),
            createdAt: new Date().toISOString()
        });

        console.log(`Scheduled backup: ${name} (${cronExpression})`);

        return scheduleId;
    }

    /**
     * Setup scheduled backup execution
     */
    setupScheduledBackups() {
        // Check for due backups every minute
        setInterval(() => {
            this.checkScheduledBackups();
        }, 60 * 1000);
    }

    /**
     * Check and execute scheduled backups
     */
    async checkScheduledBackups() {
        const now = new Date();

        for (const [scheduleId, schedule] of this.backupSchedule) {
            if (!schedule.enabled) continue;

            if (now >= new Date(schedule.nextRun)) {
                try {
                    console.log(`Executing scheduled backup: ${schedule.name}`);

                    await this.createBackup({
                        name: `${schedule.name}_${Date.now()}`,
                        type: schedule.type
                    });

                    // Calculate next run
                    schedule.nextRun = this.calculateNextRun(schedule.cronExpression);
                    schedule.lastRun = now.toISOString();

                } catch (error) {
                    console.error(`Scheduled backup failed: ${schedule.name}`, error);
                    schedule.lastError = error.message;
                    schedule.lastErrorTime = now.toISOString();
                }
            }
        }
    }

    /**
     * Calculate next run time from cron expression
     */
    calculateNextRun(cronExpression) {
        // Simple implementation - in production, use a proper cron parser
        const now = new Date();
        const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ');

        // For simplicity, assume hourly/daily schedules
        if (minute === '0' && hour !== '*') {
            // Daily at specific hour
            const nextRun = new Date(now);
            nextRun.setHours(parseInt(hour), 0, 0, 0);

            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1);
            }

            return nextRun.toISOString();
        }

        // Default to next hour
        const nextRun = new Date(now);
        nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0);
        return nextRun.toISOString();
    }

    /**
     * Get backup history
     */
    async getBackupHistory(options = {}) {
        const { type, status, limit = 50 } = options;

        let backups = Array.from(this.backupHistory.values());

        if (type) {
            backups = backups.filter(b => b.type === type);
        }

        if (status) {
            backups = backups.filter(b => b.status === status);
        }

        // Sort by timestamp descending
        backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return backups.slice(0, limit);
    }

    /**
     * Get backup statistics
     */
    getBackupStatistics() {
        const backups = Array.from(this.backupHistory.values());

        const stats = {
            total: backups.length,
            byType: {},
            byStatus: {},
            totalSize: 0,
            averageSize: 0,
            lastBackup: null,
            oldestBackup: null
        };

        for (const backup of backups) {
            // Count by type
            stats.byType[backup.type] = (stats.byType[backup.type] || 0) + 1;

            // Count by status
            stats.byStatus[backup.status] = (stats.byStatus[backup.status] || 0) + 1;

            // Size statistics
            if (backup.size) {
                stats.totalSize += backup.size;
            }

            // Date tracking
            const backupDate = new Date(backup.timestamp);
            if (!stats.lastBackup || backupDate > new Date(stats.lastBackup)) {
                stats.lastBackup = backup.timestamp;
            }
            if (!stats.oldestBackup || backupDate < new Date(stats.oldestBackup)) {
                stats.oldestBackup = backup.timestamp;
            }
        }

        stats.averageSize = stats.total > 0 ? stats.totalSize / stats.total : 0;

        return stats;
    }

    /**
     * Cleanup old backups
     */
    async cleanupOldBackups() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

        const files = await fs.readdir(this.backupPath);

        for (const file of files) {
            const filePath = path.join(this.backupPath, file);

            try {
                const stats = await fs.stat(filePath);
                if (stats.mtime < cutoffDate) {
                    await fs.unlink(filePath);
                    console.log(`Cleaned up old backup: ${file}`);
                }
            } catch (error) {
                console.warn(`Failed to cleanup backup ${file}:`, error);
            }
        }
    }

    /**
     * Load backup history from disk
     */
    async loadBackupHistory() {
        try {
            const historyPath = path.join(this.backupPath, 'backup_history.json');

            const data = await fs.readFile(historyPath, 'utf8');
            const history = JSON.parse(data);

            for (const [id, metadata] of Object.entries(history)) {
                this.backupHistory.set(id, metadata);
            }

            console.log(`Loaded ${this.backupHistory.size} backup records`);

        } catch (error) {
            // History file doesn't exist or is corrupted
            console.log('No existing backup history found');
        }
    }

    /**
     * Save backup metadata
     */
    async saveBackupMetadata(metadata) {
        const historyPath = path.join(this.backupPath, 'backup_history.json');

        // Load existing history
        let history = {};
        try {
            const data = await fs.readFile(historyPath, 'utf8');
            history = JSON.parse(data);
        } catch {}

        // Update history
        history[metadata.id] = metadata;

        // Save updated history
        await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
    }

    /**
     * Get last full backup
     */
    async getLastFullBackup() {
        const fullBackups = Array.from(this.backupHistory.values())
            .filter(b => b.type === 'full' && b.status === 'completed')
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return fullBackups[0] || null;
    }

    /**
     * Compress file using gzip
     */
    async compressFile(sourcePath, targetPath) {
        return new Promise((resolve, reject) => {
            const gzip = require('zlib').createGzip();
            const source = require('fs').createReadStream(sourcePath);
            const target = require('fs').createWriteStream(`${targetPath}.gz`);

            source.pipe(gzip).pipe(target)
                .on('finish', () => resolve(`${targetPath}.gz`))
                .on('error', reject);
        });
    }

    /**
     * Decompress file
     */
    async decompressFile(sourcePath) {
        const targetPath = sourcePath.replace('.gz', '');

        return new Promise((resolve, reject) => {
            const gunzip = require('zlib').createGunzip();
            const source = require('fs').createReadStream(sourcePath);
            const target = require('fs').createWriteStream(targetPath);

            source.pipe(gunzip).pipe(target)
                .on('finish', () => resolve(targetPath))
                .on('error', reject);
        });
    }

    /**
     * Encrypt file
     */
    async encryptFile(sourcePath, targetPath) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not configured');
        }

        const targetFile = `${targetPath}.enc`;
        const algorithm = 'aes-256-cbc';

        return new Promise((resolve, reject) => {
            const cipher = crypto.createCipher(algorithm, this.encryptionKey);
            const source = require('fs').createReadStream(sourcePath);
            const target = require('fs').createWriteStream(targetFile);

            source.pipe(cipher).pipe(target)
                .on('finish', () => resolve(targetFile))
                .on('error', reject);
        });
    }

    /**
     * Decrypt file
     */
    async decryptFile(sourcePath) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not configured');
        }

        const targetPath = sourcePath.replace('.enc', '');
        const algorithm = 'aes-256-cbc';

        return new Promise((resolve, reject) => {
            const decipher = crypto.createDecipher(algorithm, this.encryptionKey);
            const source = require('fs').createReadStream(sourcePath);
            const target = require('fs').createWriteStream(targetPath);

            source.pipe(decipher).pipe(target)
                .on('finish', () => resolve(targetPath))
                .on('error', reject);
        });
    }

    /**
     * Create ZIP archive
     */
    async createZipArchive(files, archivePath) {
        // Simple implementation - in production, use a proper ZIP library
        console.log(`Creating ZIP archive: ${archivePath} with ${files.length} files`);
        // Implementation would use 'archiver' or similar library
    }

    /**
     * Extract ZIP archive
     */
    async extractZipArchive(archivePath, extractPath) {
        // Simple implementation - in production, use a proper ZIP library
        console.log(`Extracting ZIP archive: ${archivePath} to ${extractPath}`);
        // Implementation would use 'yauzl' or similar library
    }

    /**
     * Generate backup ID
     */
    generateBackupId() {
        return crypto.randomBytes(8).toString('hex');
    }

    /**
     * Calculate file checksum
     */
    async calculateChecksum(filePath) {
        const hash = crypto.createHash('sha256');
        const stream = require('fs').createReadStream(filePath);

        return new Promise((resolve, reject) => {
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    /**
     * Get file size
     */
    async getFileSize(filePath) {
        const stats = await fs.stat(filePath);
        return stats.size;
    }

    /**
     * Format bytes for display
     */
    formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';

        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Destroy the backup manager
     */
    destroy() {
        this.backupSchedule.clear();
        this.backupHistory.clear();
        this.backupLocks.clear();

        console.log('Database backup manager destroyed');
    }
}

module.exports = DatabaseBackupManager;
