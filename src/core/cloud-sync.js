/**
 * Cloud Sync - Cloud storage and synchronization system
 * Enables seamless asset storage, backup, and multi-device synchronization
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

class CloudSync {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || 'https://api.tpt-asset-editor.com';
        this.apiKey = options.apiKey || null;
        this.userId = options.userId || null;
        this.projectId = options.projectId || null;

        this.syncEnabled = options.syncEnabled !== false;
        this.autoSync = options.autoSync !== false;
        this.syncInterval = options.syncInterval || 300000; // 5 minutes
        this.maxConcurrentUploads = options.maxConcurrentUploads || 3;
        this.maxFileSize = options.maxFileSize || 50 * 1024 * 1024; // 50MB

        this.localPath = options.localPath || path.join(app.getPath('userData'), 'projects');
        this.tempPath = path.join(app.getPath('temp'), 'tpt-sync');

        this.syncQueue = [];
        this.activeUploads = new Map();
        this.lastSyncTimestamp = 0;
        this.syncInProgress = false;
        this.isOnline = navigator.onLine;

        this.changeTracker = new ChangeTracker();
        this.conflictResolver = new ConflictResolver();
        this.bandwidthManager = new BandwidthManager();

        this.syncTimer = null;
        this.isInitialized = false;

        this.init();
    }

    /**
     * Initialize cloud sync
     */
    async init() {
        try {
            // Ensure directories exist
            await fs.mkdir(this.localPath, { recursive: true });
            await fs.mkdir(this.tempPath, { recursive: true });

            // Load sync state
            await this.loadSyncState();

            // Setup network monitoring
            this.setupNetworkMonitoring();

            // Start auto-sync if enabled
            if (this.autoSync && this.syncEnabled) {
                this.startAutoSync();
            }

            this.isInitialized = true;
            console.log('Cloud sync initialized successfully');

        } catch (error) {
            console.error('Failed to initialize cloud sync:', error);
            throw error;
        }
    }

    /**
     * Setup network monitoring
     */
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            console.log('Network connection restored');
            this.isOnline = true;
            this.emit('network-online');

            // Trigger sync when coming back online
            if (this.syncEnabled && this.syncQueue.length > 0) {
                this.performSync();
            }
        });

        window.addEventListener('offline', () => {
            console.log('Network connection lost');
            this.isOnline = false;
            this.emit('network-offline');
        });
    }

    /**
     * Authenticate with cloud service
     */
    async authenticate(credentials) {
        try {
            const response = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            if (response.success) {
                this.apiKey = response.data.apiKey;
                this.userId = response.data.userId;

                // Save authentication state
                await this.saveAuthState();

                this.emit('authenticated', {
                    userId: this.userId,
                    apiKey: this.apiKey
                });

                console.log('Cloud authentication successful');
                return { success: true };
            } else {
                throw new Error(response.error || 'Authentication failed');
            }

        } catch (error) {
            console.error('Cloud authentication failed:', error);
            throw error;
        }
    }

    /**
     * Create new project in cloud
     */
    async createProject(projectData) {
        try {
            const response = await this.apiRequest('/projects', {
                method: 'POST',
                body: JSON.stringify({
                    ...projectData,
                    localPath: this.localPath
                })
            });

            if (response.success) {
                this.projectId = response.data.projectId;

                // Create local project directory
                const projectPath = path.join(this.localPath, this.projectId);
                await fs.mkdir(projectPath, { recursive: true });

                // Save project state
                await this.saveProjectState();

                this.emit('project-created', {
                    projectId: this.projectId,
                    projectData: response.data
                });

                console.log(`Project created: ${this.projectId}`);
                return { success: true, projectId: this.projectId };
            } else {
                throw new Error(response.error || 'Project creation failed');
            }

        } catch (error) {
            console.error('Project creation failed:', error);
            throw error;
        }
    }

    /**
     * Sync project with cloud
     */
    async syncProject(options = {}) {
        if (!this.isOnline || !this.syncEnabled) {
            console.log('Sync skipped: offline or disabled');
            return { success: false, reason: 'offline or disabled' };
        }

        if (this.syncInProgress) {
            console.log('Sync already in progress');
            return { success: false, reason: 'sync in progress' };
        }

        this.syncInProgress = true;

        try {
            console.log('Starting project sync...');

            // Get local changes
            const localChanges = await this.getLocalChanges();

            // Get remote changes
            const remoteChanges = await this.getRemoteChanges();

            // Resolve conflicts
            const resolvedChanges = await this.resolveSyncConflicts(localChanges, remoteChanges);

            // Apply changes
            const syncResult = await this.applySyncChanges(resolvedChanges);

            // Update sync timestamp
            this.lastSyncTimestamp = Date.now();
            await this.saveSyncState();

            this.emit('sync-completed', syncResult);

            console.log('Project sync completed successfully');
            return { success: true, ...syncResult };

        } catch (error) {
            console.error('Project sync failed:', error);
            this.emit('sync-failed', { error: error.message });
            return { success: false, error: error.message };
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Upload file to cloud
     */
    async uploadFile(localPath, remotePath, options = {}) {
        try {
            // Check file size
            const stats = await fs.stat(localPath);
            if (stats.size > this.maxFileSize) {
                throw new Error(`File too large: ${stats.size} bytes (max: ${this.maxFileSize})`);
            }

            // Check if upload already in progress
            if (this.activeUploads.has(localPath)) {
                console.log(`Upload already in progress for: ${localPath}`);
                return this.activeUploads.get(localPath);
            }

            // Wait for upload slot
            await this.waitForUploadSlot();

            // Start upload
            const uploadPromise = this.performFileUpload(localPath, remotePath, options);
            this.activeUploads.set(localPath, uploadPromise);

            const result = await uploadPromise;

            this.activeUploads.delete(localPath);

            this.emit('file-uploaded', {
                localPath,
                remotePath,
                result
            });

            return result;

        } catch (error) {
            console.error('File upload failed:', error);
            this.activeUploads.delete(localPath);
            throw error;
        }
    }

    /**
     * Download file from cloud
     */
    async downloadFile(remotePath, localPath, options = {}) {
        try {
            const response = await this.apiRequest(`/files/${encodeURIComponent(remotePath)}`, {
                method: 'GET'
            });

            if (!response.success) {
                throw new Error(response.error || 'Download failed');
            }

            // Ensure local directory exists
            const localDir = path.dirname(localPath);
            await fs.mkdir(localDir, { recursive: true });

            // Save file
            await fs.writeFile(localPath, Buffer.from(response.data));

            this.emit('file-downloaded', {
                remotePath,
                localPath,
                size: response.data.length
            });

            return { success: true, localPath, size: response.data.length };

        } catch (error) {
            console.error('File download failed:', error);
            throw error;
        }
    }

    /**
     * Get local changes since last sync
     */
    async getLocalChanges() {
        try {
            const changes = await this.changeTracker.getChangesSince(this.lastSyncTimestamp);

            // Filter and categorize changes
            const categorizedChanges = {
                created: changes.filter(c => c.type === 'created'),
                modified: changes.filter(c => c.type === 'modified'),
                deleted: changes.filter(c => c.type === 'deleted')
            };

            return categorizedChanges;

        } catch (error) {
            console.error('Failed to get local changes:', error);
            return { created: [], modified: [], deleted: [] };
        }
    }

    /**
     * Get remote changes since last sync
     */
    async getRemoteChanges() {
        try {
            const response = await this.apiRequest(`/projects/${this.projectId}/changes`, {
                method: 'GET',
                params: { since: this.lastSyncTimestamp }
            });

            if (response.success) {
                return response.data.changes || [];
            } else {
                console.warn('Failed to get remote changes:', response.error);
                return [];
            }

        } catch (error) {
            console.error('Failed to get remote changes:', error);
            return [];
        }
    }

    /**
     * Resolve sync conflicts
     */
    async resolveSyncConflicts(localChanges, remoteChanges) {
        const conflicts = [];
        const resolvedChanges = [];

        // Find conflicts (same file modified in both local and remote)
        for (const localChange of localChanges.modified) {
            const remoteChange = remoteChanges.find(rc =>
                rc.path === localChange.path && rc.type === 'modified'
            );

            if (remoteChange) {
                conflicts.push({
                    path: localChange.path,
                    local: localChange,
                    remote: remoteChange
                });
            } else {
                resolvedChanges.push({ ...localChange, source: 'local' });
            }
        }

        // Add non-conflicting remote changes
        for (const remoteChange of remoteChanges) {
            const hasConflict = conflicts.some(c => c.path === remoteChange.path);
            if (!hasConflict) {
                resolvedChanges.push({ ...remoteChange, source: 'remote' });
            }
        }

        // Resolve conflicts
        for (const conflict of conflicts) {
            const resolution = await this.conflictResolver.resolve(conflict);
            resolvedChanges.push({
                ...resolution,
                source: 'conflict-resolution',
                originalConflict: conflict
            });
        }

        return resolvedChanges;
    }

    /**
     * Apply sync changes
     */
    async applySyncChanges(changes) {
        const results = {
            uploaded: 0,
            downloaded: 0,
            deleted: 0,
            conflicts: 0,
            errors: 0
        };

        for (const change of changes) {
            try {
                switch (change.type) {
                    case 'created':
                    case 'modified':
                        if (change.source === 'local') {
                            await this.uploadFile(change.path, change.path);
                            results.uploaded++;
                        } else {
                            await this.downloadFile(change.path, change.path);
                            results.downloaded++;
                        }
                        break;

                    case 'deleted':
                        if (change.source === 'local') {
                            await this.deleteRemoteFile(change.path);
                        } else {
                            await fs.unlink(change.path);
                        }
                        results.deleted++;
                        break;
                }
            } catch (error) {
                console.error(`Failed to apply change ${change.path}:`, error);
                results.errors++;
            }
        }

        return results;
    }

    /**
     * Perform file upload
     */
    async performFileUpload(localPath, remotePath, options) {
        const fileData = await fs.readFile(localPath);
        const fileHash = this.calculateFileHash(fileData);

        const response = await this.apiRequest('/files/upload', {
            method: 'POST',
            body: JSON.stringify({
                projectId: this.projectId,
                remotePath,
                fileHash,
                fileSize: fileData.length,
                metadata: options.metadata || {}
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.success) {
            throw new Error(response.error || 'Upload request failed');
        }

        // Upload file data if needed
        if (response.data.requiresUpload) {
            await this.uploadFileData(response.data.uploadUrl, fileData, fileHash);
        }

        return {
            success: true,
            remotePath,
            fileHash,
            size: fileData.length
        };
    }

    /**
     * Upload file data to storage
     */
    async uploadFileData(uploadUrl, fileData, fileHash) {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: fileData,
            headers: {
                'Content-Type': 'application/octet-stream',
                'x-file-hash': fileHash
            }
        });

        if (!response.ok) {
            throw new Error(`File upload failed: ${response.status}`);
        }
    }

    /**
     * Delete remote file
     */
    async deleteRemoteFile(remotePath) {
        const response = await this.apiRequest(`/files/${encodeURIComponent(remotePath)}`, {
            method: 'DELETE'
        });

        if (!response.success) {
            throw new Error(response.error || 'Delete failed');
        }
    }

    /**
     * Wait for upload slot
     */
    async waitForUploadSlot() {
        while (this.activeUploads.size >= this.maxConcurrentUploads) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    /**
     * API request helper
     */
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiEndpoint}${endpoint}`;

        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : undefined,
                ...options.headers
            },
            body: options.body,
            ...options
        };

        // Remove undefined headers
        Object.keys(requestOptions.headers).forEach(key => {
            if (requestOptions.headers[key] === undefined) {
                delete requestOptions.headers[key];
            }
        });

        try {
            const response = await fetch(url, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return { success: true, data };

        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate file hash
     */
    calculateFileHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Start auto-sync
     */
    startAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.syncTimer = setInterval(async () => {
            if (this.isOnline && !this.syncInProgress) {
                try {
                    await this.performSync();
                } catch (error) {
                    console.error('Auto-sync failed:', error);
                }
            }
        }, this.syncInterval);

        console.log(`Auto-sync started (interval: ${this.syncInterval}ms)`);
    }

    /**
     * Stop auto-sync
     */
    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
            console.log('Auto-sync stopped');
        }
    }

    /**
     * Perform sync (alias for syncProject)
     */
    async performSync() {
        return this.syncProject();
    }

    /**
     * Load sync state
     */
    async loadSyncState() {
        try {
            const statePath = path.join(app.getPath('userData'), 'sync-state.json');

            try {
                await fs.access(statePath);
                const stateData = await fs.readFile(statePath, 'utf8');
                const state = JSON.parse(stateData);

                this.lastSyncTimestamp = state.lastSyncTimestamp || 0;
                this.projectId = state.projectId || null;

            } catch {
                // State file doesn't exist, use defaults
            }
        } catch (error) {
            console.error('Failed to load sync state:', error);
        }
    }

    /**
     * Save sync state
     */
    async saveSyncState() {
        try {
            const statePath = path.join(app.getPath('userData'), 'sync-state.json');
            const state = {
                lastSyncTimestamp: this.lastSyncTimestamp,
                projectId: this.projectId,
                lastSaved: new Date().toISOString()
            };

            await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf8');

        } catch (error) {
            console.error('Failed to save sync state:', error);
        }
    }

    /**
     * Load authentication state
     */
    async loadAuthState() {
        try {
            const authPath = path.join(app.getPath('userData'), 'auth-state.json');

            try {
                await fs.access(authPath);
                const authData = await fs.readFile(authPath, 'utf8');
                const auth = JSON.parse(authData);

                this.apiKey = auth.apiKey;
                this.userId = auth.userId;

            } catch {
                // Auth file doesn't exist
            }
        } catch (error) {
            console.error('Failed to load auth state:', error);
        }
    }

    /**
     * Save authentication state
     */
    async saveAuthState() {
        try {
            const authPath = path.join(app.getPath('userData'), 'auth-state.json');
            const auth = {
                apiKey: this.apiKey,
                userId: this.userId,
                lastSaved: new Date().toISOString()
            };

            await fs.writeFile(authPath, JSON.stringify(auth, null, 2), 'utf8');

        } catch (error) {
            console.error('Failed to save auth state:', error);
        }
    }

    /**
     * Save project state
     */
    async saveProjectState() {
        try {
            const projectPath = path.join(app.getPath('userData'), 'project-state.json');
            const project = {
                projectId: this.projectId,
                localPath: this.localPath,
                lastSaved: new Date().toISOString()
            };

            await fs.writeFile(projectPath, JSON.stringify(project, null, 2), 'utf8');

        } catch (error) {
            console.error('Failed to save project state:', error);
        }
    }

    /**
     * Get sync status
     */
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            syncEnabled: this.syncEnabled,
            autoSync: this.autoSync,
            syncInProgress: this.syncInProgress,
            lastSyncTimestamp: this.lastSyncTimestamp,
            activeUploads: this.activeUploads.size,
            queuedUploads: this.syncQueue.length,
            projectId: this.projectId,
            userId: this.userId
        };
    }

    /**
     * Get bandwidth usage
     */
    getBandwidthUsage() {
        return this.bandwidthManager.getUsage();
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        this.stopAutoSync();

        // Cancel active uploads
        for (const [localPath, uploadPromise] of this.activeUploads) {
            // Note: In a real implementation, you'd want to properly cancel uploads
            console.log(`Cancelling upload: ${localPath}`);
        }
        this.activeUploads.clear();

        // Clear sync queue
        this.syncQueue = [];

        console.log('Cloud sync cleaned up');
    }

    /**
     * Event emission helper
     */
    emit(event, data) {
        // This would integrate with the main event system
        console.log(`Cloud sync event: ${event}`, data);
    }
}

/**
 * Change Tracker - Tracks file system changes for sync
 */
class ChangeTracker {
    constructor() {
        this.watchedPaths = new Set();
        this.changeLog = [];
        this.fileHashes = new Map();
    }

    /**
     * Watch directory for changes
     */
    async watchDirectory(dirPath) {
        if (this.watchedPaths.has(dirPath)) return;

        this.watchedPaths.add(dirPath);

        // Initial scan
        await this.scanDirectory(dirPath);

        // Setup file watcher (simplified - would use fs.watch in production)
        console.log(`Watching directory: ${dirPath}`);
    }

    /**
     * Scan directory for files
     */
    async scanDirectory(dirPath) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.isDirectory()) {
                    await this.scanDirectory(fullPath);
                } else if (entry.isFile()) {
                    await this.trackFile(fullPath);
                }
            }
        } catch (error) {
            console.error(`Failed to scan directory ${dirPath}:`, error);
        }
    }

    /**
     * Track file changes
     */
    async trackFile(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath);
            const hash = crypto.createHash('sha256').update(content).digest('hex');

            const existingHash = this.fileHashes.get(filePath);

            if (!existingHash) {
                // New file
                this.recordChange('created', filePath, stats.mtime.getTime());
            } else if (existingHash !== hash) {
                // Modified file
                this.recordChange('modified', filePath, stats.mtime.getTime());
            }

            this.fileHashes.set(filePath, hash);

        } catch (error) {
            console.error(`Failed to track file ${filePath}:`, error);
        }
    }

    /**
     * Record change
     */
    recordChange(type, filePath, timestamp) {
        this.changeLog.push({
            type,
            path: filePath,
            timestamp,
            recordedAt: Date.now()
        });
    }

    /**
     * Get changes since timestamp
     */
    async getChangesSince(timestamp) {
        // Filter changes after timestamp
        const recentChanges = this.changeLog.filter(change => change.timestamp > timestamp);

        // Group by file to avoid duplicates
        const changesByFile = new Map();

        for (const change of recentChanges) {
            const existing = changesByFile.get(change.path);
            if (!existing || change.timestamp > existing.timestamp) {
                changesByFile.set(change.path, change);
            }
        }

        return Array.from(changesByFile.values());
    }
}

/**
 * Conflict Resolver - Resolves sync conflicts
 */
class ConflictResolver {
    constructor() {
        this.strategies = {
            'newer-wins': this.newerWins.bind(this),
            'manual': this.manualResolution.bind(this),
            'merge': this.mergeChanges.bind(this)
        };

        this.defaultStrategy = 'newer-wins';
    }

    /**
     * Resolve conflict
     */
    async resolve(conflict, strategy = this.defaultStrategy) {
        const resolver = this.strategies[strategy] || this.strategies[this.defaultStrategy];
        return resolver(conflict);
    }

    /**
     * Newer wins strategy
     */
    newerWins(conflict) {
        const localTime = conflict.local.timestamp;
        const remoteTime = conflict.remote.timestamp;

        if (localTime > remoteTime) {
            return conflict.local;
        } else {
            return conflict.remote;
        }
    }

    /**
     * Manual resolution strategy
     */
    manualResolution(conflict) {
        // In a real implementation, this would prompt the user
        console.log('Manual conflict resolution required:', conflict);
        return conflict.local; // Default to local
    }

    /**
     * Merge changes strategy
     */
    mergeChanges(conflict) {
        // Simple merge - in practice, this would be much more sophisticated
        return {
            ...conflict.local,
            merged: true,
            sources: [conflict.local, conflict.remote]
        };
    }
}

/**
 * Bandwidth Manager - Manages network usage
 */
class BandwidthManager {
    constructor() {
        this.usage = {
            uploaded: 0,
            downloaded: 0,
            sessionStart: Date.now()
        };
    }

    /**
     * Record upload
     */
    recordUpload(bytes) {
        this.usage.uploaded += bytes;
    }

    /**
     * Record download
     */
    recordDownload(bytes) {
        this.usage.downloaded += bytes;
    }

    /**
     * Get usage statistics
     */
    getUsage() {
        const sessionTime = (Date.now() - this.usage.sessionStart) / 1000; // seconds
        const totalBytes = this.usage.uploaded + this.usage.downloaded;

        return {
            ...this.usage,
            sessionTime,
            totalBytes,
            averageSpeed: totalBytes / sessionTime // bytes per second
        };
    }

    /**
     * Reset usage counters
     */
    reset() {
        this.usage.uploaded = 0;
        this.usage.downloaded = 0;
        this.usage.sessionStart = Date.now();
    }
}

module.exports = CloudSync;
