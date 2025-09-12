/**
 * Collaboration Manager - Real-time multi-user collaboration system
 * Enables multiple users to work on the same project simultaneously
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const { app } = require('electron');

class CollaborationManager extends EventEmitter {
    constructor(options = {}) {
        super();

        this.serverUrl = options.serverUrl || 'ws://localhost:8080';
        this.projectId = options.projectId || null;
        this.userId = options.userId || this.generateUserId();
        this.username = options.username || 'Anonymous User';
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;

        this.ws = null;
        this.peers = new Map();
        this.pendingOperations = [];
        this.conflictResolver = new ConflictResolver();
        this.changeBuffer = [];
        this.bufferTimeout = null;

        this.sessionId = this.generateSessionId();
        this.lastSyncTimestamp = 0;
        this.operationQueue = [];
        this.isProcessingQueue = false;

        this.init();
    }

    /**
     * Initialize collaboration manager
     */
    async init() {
        console.log('Initializing collaboration manager...');

        // Setup event handlers
        this.setupEventHandlers();

        // Connect if project ID is provided
        if (this.projectId) {
            await this.connect();
        }
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Handle app events
        app.on('before-quit', () => {
            this.disconnect();
        });

        // Handle process events
        process.on('SIGINT', () => {
            this.disconnect();
        });

        process.on('SIGTERM', () => {
            this.disconnect();
        });
    }

    /**
     * Connect to collaboration server
     */
    async connect() {
        if (this.isConnected) return;

        try {
            console.log(`Connecting to collaboration server: ${this.serverUrl}`);

            this.ws = new WebSocket(this.serverUrl);

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 10000);

                this.ws.onopen = () => {
                    clearTimeout(timeout);
                    this.onConnected();
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.onMessage(event);
                };

                this.ws.onclose = (event) => {
                    clearTimeout(timeout);
                    this.onDisconnected(event);
                };

                this.ws.onerror = (error) => {
                    clearTimeout(timeout);
                    this.onError(error);
                    reject(error);
                };
            });

        } catch (error) {
            console.error('Failed to connect to collaboration server:', error);
            throw error;
        }
    }

    /**
     * Disconnect from collaboration server
     */
    disconnect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('Disconnecting from collaboration server...');
            this.ws.close(1000, 'Client disconnecting');
        }

        this.isConnected = false;
        this.peers.clear();
        this.pendingOperations = [];
        this.changeBuffer = [];

        if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
            this.bufferTimeout = null;
        }

        this.emit('disconnected');
    }

    /**
     * Handle successful connection
     */
    onConnected() {
        console.log('Connected to collaboration server');

        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Send join project message
        this.sendMessage({
            type: 'join-project',
            projectId: this.projectId,
            userId: this.userId,
            username: this.username,
            sessionId: this.sessionId,
            timestamp: Date.now()
        });

        this.emit('connected', {
            userId: this.userId,
            projectId: this.projectId
        });
    }

    /**
     * Handle disconnection
     */
    onDisconnected(event) {
        console.log(`Disconnected from collaboration server: ${event.code} - ${event.reason}`);

        this.isConnected = false;
        this.peers.clear();

        this.emit('disconnected', {
            code: event.code,
            reason: event.reason
        });

        // Attempt reconnection if not intentional disconnect
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnection();
        }
    }

    /**
     * Handle connection errors
     */
    onError(error) {
        console.error('Collaboration connection error:', error);
        this.emit('error', error);
    }

    /**
     * Handle incoming messages
     */
    onMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        } catch (error) {
            console.error('Failed to parse collaboration message:', error);
        }
    }

    /**
     * Handle different message types
     */
    handleMessage(message) {
        switch (message.type) {
            case 'project-joined':
                this.handleProjectJoined(message);
                break;
            case 'user-joined':
                this.handleUserJoined(message);
                break;
            case 'user-left':
                this.handleUserLeft(message);
                break;
            case 'operation':
                this.handleOperation(message);
                break;
            case 'sync-request':
                this.handleSyncRequest(message);
                break;
            case 'sync-response':
                this.handleSyncResponse(message);
                break;
            case 'conflict':
                this.handleConflict(message);
                break;
            case 'ping':
                this.handlePing(message);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    /**
     * Handle project joined message
     */
    handleProjectJoined(message) {
        console.log(`Joined project: ${message.projectId}`);

        // Update peers list
        this.peers.clear();
        for (const peer of message.peers || []) {
            this.peers.set(peer.userId, peer);
        }

        this.lastSyncTimestamp = message.timestamp || 0;

        this.emit('project-joined', {
            projectId: message.projectId,
            peers: Array.from(this.peers.values()),
            timestamp: this.lastSyncTimestamp
        });
    }

    /**
     * Handle user joined message
     */
    handleUserJoined(message) {
        const peer = message.user;
        this.peers.set(peer.userId, peer);

        console.log(`User joined: ${peer.username} (${peer.userId})`);

        this.emit('user-joined', peer);
    }

    /**
     * Handle user left message
     */
    handleUserLeft(message) {
        const userId = message.userId;
        const peer = this.peers.get(userId);

        if (peer) {
            this.peers.delete(userId);
            console.log(`User left: ${peer.username} (${userId})`);

            this.emit('user-left', {
                userId,
                username: peer.username
            });
        }
    }

    /**
     * Handle operation message
     */
    handleOperation(message) {
        const operation = message.operation;

        // Add to operation queue for processing
        this.operationQueue.push({
            ...operation,
            remote: true,
            timestamp: message.timestamp
        });

        // Process operations
        this.processOperationQueue();

        this.emit('remote-operation', operation);
    }

    /**
     * Handle sync request
     */
    handleSyncRequest(message) {
        // Send current state to requesting peer
        this.sendMessage({
            type: 'sync-response',
            requestId: message.requestId,
            userId: message.userId,
            state: this.getCurrentState(),
            timestamp: Date.now()
        });
    }

    /**
     * Handle sync response
     */
    handleSyncResponse(message) {
        if (message.state) {
            this.applyRemoteState(message.state);
            this.lastSyncTimestamp = message.timestamp;
        }

        this.emit('sync-completed', {
            timestamp: message.timestamp
        });
    }

    /**
     * Handle conflict message
     */
    handleConflict(message) {
        const resolution = this.conflictResolver.resolve(message.conflict);

        // Send resolution back
        this.sendMessage({
            type: 'conflict-resolution',
            conflictId: message.conflict.id,
            resolution,
            timestamp: Date.now()
        });

        this.emit('conflict-resolved', {
            conflict: message.conflict,
            resolution
        });
    }

    /**
     * Handle ping message
     */
    handlePing(message) {
        // Respond with pong
        this.sendMessage({
            type: 'pong',
            timestamp: message.timestamp,
            serverTime: Date.now()
        });
    }

    /**
     * Send message to server
     */
    sendMessage(message) {
        if (!this.isConnected || !this.ws) {
            console.warn('Cannot send message: not connected');
            return;
        }

        try {
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }

    /**
     * Broadcast operation to all peers
     */
    broadcastOperation(operation) {
        if (!this.isConnected) return;

        const message = {
            type: 'operation',
            operation: {
                ...operation,
                userId: this.userId,
                sessionId: this.sessionId,
                timestamp: Date.now()
            }
        };

        this.sendMessage(message);
    }

    /**
     * Buffer operation for batch sending
     */
    bufferOperation(operation) {
        this.changeBuffer.push({
            ...operation,
            timestamp: Date.now()
        });

        // Debounce sending
        if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
        }

        this.bufferTimeout = setTimeout(() => {
            this.flushOperationBuffer();
        }, 100); // Send after 100ms of inactivity
    }

    /**
     * Flush operation buffer
     */
    flushOperationBuffer() {
        if (this.changeBuffer.length === 0) return;

        // Combine operations if possible
        const combinedOperation = this.combineOperations(this.changeBuffer);

        if (combinedOperation) {
            this.broadcastOperation(combinedOperation);
        } else {
            // Send operations individually
            for (const operation of this.changeBuffer) {
                this.broadcastOperation(operation);
            }
        }

        this.changeBuffer = [];
        this.bufferTimeout = null;
    }

    /**
     * Combine similar operations
     */
    combineOperations(operations) {
        if (operations.length === 1) {
            return operations[0];
        }

        // Simple combination logic - can be enhanced
        const firstOp = operations[0];

        if (operations.every(op => op.type === firstOp.type && op.assetId === firstOp.assetId)) {
            return {
                ...firstOp,
                combined: true,
                operationCount: operations.length,
                operations: operations
            };
        }

        return null;
    }

    /**
     * Process operation queue
     */
    async processOperationQueue() {
        if (this.isProcessingQueue || this.operationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        try {
            while (this.operationQueue.length > 0) {
                const operation = this.operationQueue.shift();

                // Check for conflicts
                const conflict = await this.detectConflict(operation);
                if (conflict) {
                    await this.handleConflictLocally(conflict);
                    continue;
                }

                // Apply operation
                await this.applyOperation(operation);

                // Update sync timestamp
                this.lastSyncTimestamp = Math.max(this.lastSyncTimestamp, operation.timestamp);
            }
        } catch (error) {
            console.error('Failed to process operation queue:', error);
        } finally {
            this.isProcessingQueue = false;
        }
    }

    /**
     * Detect operation conflicts
     */
    async detectConflict(operation) {
        // Simple conflict detection - can be enhanced
        const recentOperations = this.operationQueue.filter(op =>
            op.assetId === operation.assetId &&
            op.timestamp > operation.timestamp - 5000 // Within 5 seconds
        );

        if (recentOperations.length > 0) {
            return {
                id: crypto.randomUUID(),
                operation,
                conflictingOperations: recentOperations,
                timestamp: Date.now()
            };
        }

        return null;
    }

    /**
     * Handle conflict locally
     */
    async handleConflictLocally(conflict) {
        const resolution = this.conflictResolver.resolve(conflict);

        // Apply resolution
        await this.applyOperation(resolution.operation);

        this.emit('conflict-handled', {
            conflict,
            resolution
        });
    }

    /**
     * Apply operation
     */
    async applyOperation(operation) {
        // This would integrate with the asset management system
        // For now, just emit the operation
        this.emit('operation-applied', operation);
    }

    /**
     * Get current project state
     */
    getCurrentState() {
        // This would return the current project state
        // For now, return a placeholder
        return {
            assets: [],
            settings: {},
            timestamp: Date.now()
        };
    }

    /**
     * Apply remote state
     */
    applyRemoteState(state) {
        // This would apply the remote state to local project
        // For now, just emit the state
        this.emit('state-applied', state);
    }

    /**
     * Request synchronization
     */
    requestSync() {
        if (!this.isConnected) return;

        this.sendMessage({
            type: 'sync-request',
            userId: this.userId,
            timestamp: Date.now()
        });
    }

    /**
     * Attempt reconnection
     */
    attemptReconnection() {
        this.reconnectAttempts++;

        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        const maxDelay = 30000; // Max 30 seconds

        setTimeout(async () => {
            console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

            try {
                await this.connect();
            } catch (error) {
                console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);

                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('Max reconnection attempts reached');
                    this.emit('reconnection-failed');
                }
            }
        }, Math.min(delay, maxDelay));
    }

    /**
     * Generate unique user ID
     */
    generateUserId() {
        return crypto.randomUUID();
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return crypto.randomUUID();
    }

    /**
     * Set project ID
     */
    setProject(projectId) {
        this.projectId = projectId;

        if (this.isConnected) {
            // Reconnect with new project
            this.disconnect();
            setTimeout(() => this.connect(), 1000);
        } else if (!this.isConnected) {
            // Connect if not already connected
            this.connect();
        }
    }

    /**
     * Set user information
     */
    setUser(userId, username) {
        this.userId = userId || this.generateUserId();
        this.username = username || 'Anonymous User';

        if (this.isConnected) {
            // Send updated user info
            this.sendMessage({
                type: 'update-user',
                userId: this.userId,
                username: this.username,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Get collaboration status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            projectId: this.projectId,
            userId: this.userId,
            username: this.username,
            peerCount: this.peers.size,
            peers: Array.from(this.peers.values()),
            pendingOperations: this.pendingOperations.length,
            lastSyncTimestamp: this.lastSyncTimestamp,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    /**
     * Get peer information
     */
    getPeers() {
        return Array.from(this.peers.values());
    }

    /**
     * Check if user is online
     */
    isUserOnline(userId) {
        return this.peers.has(userId);
    }

    /**
     * Send typing indicator
     */
    sendTyping(isTyping) {
        if (!this.isConnected) return;

        this.sendMessage({
            type: 'typing',
            userId: this.userId,
            username: this.username,
            isTyping,
            timestamp: Date.now()
        });
    }

    /**
     * Send cursor position
     */
    sendCursor(cursor) {
        if (!this.isConnected) return;

        this.sendMessage({
            type: 'cursor',
            userId: this.userId,
            username: this.username,
            cursor,
            timestamp: Date.now()
        });
    }

    /**
     * Get collaboration statistics
     */
    getStatistics() {
        const now = Date.now();
        const uptime = this.isConnected ? now - this.lastSyncTimestamp : 0;

        return {
            connectionStatus: this.isConnected ? 'connected' : 'disconnected',
            uptime,
            peerCount: this.peers.size,
            operationsProcessed: this.operationQueue.length,
            conflictsResolved: 0, // Would track this
            dataTransferred: 0, // Would track this
            averageLatency: 0 // Would measure this
        };
    }
}

/**
 * Conflict Resolver - Handles operation conflicts in collaborative editing
 */
class ConflictResolver {
    constructor() {
        this.strategies = {
            'last-writer-wins': this.lastWriterWins.bind(this),
            'merge': this.mergeOperations.bind(this),
            'manual': this.manualResolution.bind(this)
        };

        this.defaultStrategy = 'last-writer-wins';
    }

    /**
     * Resolve conflict using specified strategy
     */
    resolve(conflict, strategy = this.defaultStrategy) {
        const resolver = this.strategies[strategy] || this.strategies[this.defaultStrategy];
        return resolver(conflict);
    }

    /**
     * Last writer wins strategy
     */
    lastWriterWins(conflict) {
        const operations = [conflict.operation, ...conflict.conflictingOperations];
        const latest = operations.reduce((latest, op) =>
            op.timestamp > latest.timestamp ? op : latest
        );

        return {
            strategy: 'last-writer-wins',
            winner: latest,
            losers: operations.filter(op => op !== latest)
        };
    }

    /**
     * Merge operations strategy
     */
    mergeOperations(conflict) {
        // Simple merge logic - can be enhanced based on operation types
        const merged = {
            ...conflict.operation,
            merged: true,
            sources: [conflict.operation, ...conflict.conflictingOperations]
        };

        return {
            strategy: 'merge',
            merged,
            originals: [conflict.operation, ...conflict.conflictingOperations]
        };
    }

    /**
     * Manual resolution strategy
     */
    manualResolution(conflict) {
        // Return conflict for manual resolution
        return {
            strategy: 'manual',
            requiresManualResolution: true,
            conflict
        };
    }

    /**
     * Add custom resolution strategy
     */
    addStrategy(name, strategy) {
        this.strategies[name] = strategy;
    }

    /**
     * Set default strategy
     */
    setDefaultStrategy(strategy) {
        if (this.strategies[strategy]) {
            this.defaultStrategy = strategy;
        }
    }
}

module.exports = CollaborationManager;
