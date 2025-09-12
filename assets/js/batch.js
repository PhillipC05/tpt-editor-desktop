/**
 * Batch Processing Module for TPT Asset Editor Desktop
 * Handles batch generation, queue management, and progress tracking
 */

class BatchProcessor {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.currentIndex = 0;
        this.maxConcurrent = 3;
        this.activePromises = new Set();

        this.initializeEventListeners();
        this.loadSavedQueue();
    }

    /**
     * Initialize event listeners for batch processing UI
     */
    initializeEventListeners() {
        // Batch control buttons
        const startBatchBtn = document.getElementById('start-batch-btn');
        const clearBatchBtn = document.getElementById('clear-batch-btn');

        if (startBatchBtn) {
            startBatchBtn.addEventListener('click', () => this.startBatchProcessing());
        }

        if (clearBatchBtn) {
            clearBatchBtn.addEventListener('click', () => this.clearBatchQueue());
        }

        // Add to batch buttons (from generator)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-batch-btn') || e.target.closest('.add-to-batch-btn')) {
                e.preventDefault();
                this.addCurrentAssetToBatch();
            }
        });

        // Queue item controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-from-queue-btn')) {
                const itemId = e.target.dataset.itemId;
                this.removeFromQueue(itemId);
            }

            if (e.target.classList.contains('edit-queue-item-btn')) {
                const itemId = e.target.dataset.itemId;
                this.editQueueItem(itemId);
            }
        });
    }

    /**
     * Add current generator configuration to batch queue
     */
    addCurrentAssetToBatch() {
        const currentConfig = window.generator?.getCurrentConfiguration();
        if (!currentConfig) {
            showNotification('No asset configuration to add to batch', 'warning');
            return;
        }

        const batchItem = {
            id: Date.now().toString(),
            type: currentConfig.type,
            config: { ...currentConfig },
            name: this.generateBatchItemName(currentConfig),
            status: 'queued',
            created: new Date().toISOString()
        };

        this.queue.push(batchItem);
        this.saveQueue();
        this.updateQueueDisplay();
        this.updateBatchControls();

        showNotification(`Added ${batchItem.name} to batch queue`, 'success');
    }

    /**
     * Generate a descriptive name for batch queue item
     */
    generateBatchItemName(config) {
        const type = config.type || 'unknown';
        const timestamp = new Date().toLocaleTimeString();

        switch (type) {
            case 'character':
                return `Character (${config.class || 'Warrior'}) - ${timestamp}`;
            case 'monster':
                return `Monster (${config.type || 'Generic'}) - ${timestamp}`;
            case 'item':
                return `Item (${config.category || 'Generic'}) - ${timestamp}`;
            case 'tile':
                return `Tile (${config.category || 'Generic'}) - ${timestamp}`;
            case 'sfx':
                return `SFX (${config.effect || 'Generic'}) - ${timestamp}`;
            case 'music':
                return `Music (${config.genre || 'Generic'}) - ${timestamp}`;
            case 'ambient':
                return `Ambient (${config.type || 'Generic'}) - ${timestamp}`;
            case 'vehicle':
                return `Vehicle (${config.vehicleType || 'Car'}) - ${timestamp}`;
            case 'building':
                return `Building (${config.buildingType || 'House'}) - ${timestamp}`;
            case 'particle':
                return `Particles (${config.effect || 'Generic'}) - ${timestamp}`;
            case 'ui':
                return `UI (${config.element || 'Generic'}) - ${timestamp}`;
            default:
                return `${type} Asset - ${timestamp}`;
        }
    }

    /**
     * Remove item from batch queue
     */
    removeFromQueue(itemId) {
        const index = this.queue.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const item = this.queue[index];
            this.queue.splice(index, 1);
            this.saveQueue();
            this.updateQueueDisplay();
            this.updateBatchControls();
            showNotification(`Removed ${item.name} from batch queue`, 'info');
        }
    }

    /**
     * Edit queue item configuration
     */
    editQueueItem(itemId) {
        const item = this.queue.find(item => item.id === itemId);
        if (!item) return;

        // Switch to generator view and load configuration
        switchView('generator');

        // Load the configuration into the generator
        if (window.generator && window.generator.loadConfiguration) {
            window.generator.loadConfiguration(item.config);
        }

        showNotification(`Loaded ${item.name} configuration for editing`, 'info');
    }

    /**
     * Start batch processing
     */
    async startBatchProcessing() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        this.currentIndex = 0;
        this.activePromises.clear();

        this.updateBatchControls();
        this.updateProgressDisplay(0, this.queue.length);

        showNotification('Starting batch processing...', 'info');

        try {
            await this.processBatchQueue();
        } catch (error) {
            console.error('Batch processing error:', error);
            showNotification('Batch processing failed: ' + error.message, 'error');
        } finally {
            this.isProcessing = false;
            this.updateBatchControls();
        }
    }

    /**
     * Process the batch queue with concurrency control
     */
    async processBatchQueue() {
        const promises = [];

        for (let i = 0; i < this.queue.length; i++) {
            const item = this.queue[i];

            // Wait if we've reached max concurrent operations
            if (this.activePromises.size >= this.maxConcurrent) {
                await Promise.race(this.activePromises);
            }

            const promise = this.processBatchItem(item, i);
            promises.push(promise);
            this.activePromises.add(promise);

            promise.finally(() => {
                this.activePromises.delete(promise);
            });
        }

        await Promise.all(promises);

        showNotification(`Batch processing completed! Generated ${this.queue.length} assets.`, 'success');
        this.clearBatchQueue();
    }

    /**
     * Process individual batch item
     */
    async processBatchItem(item, index) {
        try {
            item.status = 'processing';
            this.updateQueueDisplay();

            // Generate the asset
            const result = await this.generateAsset(item.config);

            if (result.success) {
                item.status = 'completed';
                item.result = result;

                // Auto-save the generated asset
                await this.saveGeneratedAsset(result.asset, item);

                showNotification(`Generated: ${item.name}`, 'success');
            } else {
                item.status = 'failed';
                item.error = result.error;
                showNotification(`Failed to generate: ${item.name}`, 'error');
            }

        } catch (error) {
            item.status = 'failed';
            item.error = error.message;
            console.error(`Failed to process batch item ${item.id}:`, error);
        }

        this.updateQueueDisplay();
        this.updateProgressDisplay(
            this.queue.filter(item => item.status === 'completed').length,
            this.queue.length
        );
    }

    /**
     * Generate asset using the appropriate generator
     */
    async generateAsset(config) {
        try {
            // This would integrate with the actual generator modules
            // For now, return a mock successful result
            const mockAsset = {
                id: Date.now().toString(),
                type: config.type,
                data: 'mock-generated-data',
                metadata: {
                    ...config,
                    generatedAt: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            // Simulate generation time
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

            return {
                success: true,
                asset: mockAsset
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Save generated asset to library
     */
    async saveGeneratedAsset(asset, batchItem) {
        try {
            // Add to library if available
            if (window.library && window.library.addAsset) {
                await window.library.addAsset(asset);
            }

            // Update statistics
            this.updateStatistics(asset.type);

        } catch (error) {
            console.error('Failed to save generated asset:', error);
        }
    }

    /**
     * Update generation statistics
     */
    updateStatistics(assetType) {
        // Update stats in the UI
        const statElement = document.getElementById(`stat-${assetType}s`);
        if (statElement) {
            const currentCount = parseInt(statElement.textContent) || 0;
            statElement.textContent = currentCount + 1;
        }

        // Update total assets
        const totalElement = document.getElementById('total-assets');
        if (totalElement) {
            const currentTotal = parseInt(totalElement.textContent) || 0;
            totalElement.textContent = currentTotal + 1;
        }

        // Update today generated
        const todayElement = document.getElementById('today-generated');
        if (todayElement) {
            const currentToday = parseInt(todayElement.textContent) || 0;
            todayElement.textContent = currentToday + 1;
        }
    }

    /**
     * Clear the batch queue
     */
    clearBatchQueue() {
        this.queue = [];
        this.saveQueue();
        this.updateQueueDisplay();
        this.updateBatchControls();
        this.updateProgressDisplay(0, 0);
        showNotification('Batch queue cleared', 'info');
    }

    /**
     * Update the queue display in the UI
     */
    updateQueueDisplay() {
        const queueContainer = document.getElementById('batch-queue-list');
        if (!queueContainer) return;

        if (this.queue.length === 0) {
            queueContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-list"></i>
                    <p>No assets in batch queue</p>
                    <button class="btn btn-primary" onclick="switchView('generator')">Add Assets to Queue</button>
                </div>
            `;
            return;
        }

        const queueItems = this.queue.map(item => `
            <div class="queue-item ${item.status}" data-item-id="${item.id}">
                <div class="queue-item-header">
                    <div class="queue-item-info">
                        <div class="queue-item-name">${item.name}</div>
                        <div class="queue-item-type">${item.type}</div>
                    </div>
                    <div class="queue-item-status">
                        <span class="status-badge status-${item.status}">
                            ${item.status}
                        </span>
                    </div>
                </div>
                <div class="queue-item-actions">
                    <button class="btn btn-sm btn-secondary edit-queue-item-btn" data-item-id="${item.id}">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger remove-from-queue-btn" data-item-id="${item.id}">
                        <i class="fas fa-trash"></i>
                        Remove
                    </button>
                </div>
                ${item.error ? `<div class="queue-item-error">${item.error}</div>` : ''}
            </div>
        `).join('');

        queueContainer.innerHTML = queueItems;
    }

    /**
     * Update batch control buttons state
     */
    updateBatchControls() {
        const startBtn = document.getElementById('start-batch-btn');
        const clearBtn = document.getElementById('clear-batch-btn');

        if (startBtn) {
            startBtn.disabled = this.queue.length === 0 || this.isProcessing;
            startBtn.innerHTML = this.isProcessing ?
                '<i class="fas fa-spinner fa-spin"></i> Processing...' :
                '<i class="fas fa-play"></i> Start Batch Processing';
        }

        if (clearBtn) {
            clearBtn.disabled = this.queue.length === 0 || this.isProcessing;
        }
    }

    /**
     * Update progress display
     */
    updateProgressDisplay(completed, total) {
        const progressFill = document.getElementById('batch-progress-fill');
        const progressText = document.getElementById('batch-progress-text');

        if (progressFill && progressText) {
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            progressFill.style.width = `${percentage}%`;

            if (this.isProcessing) {
                progressText.textContent = `Processing: ${completed}/${total} assets (${percentage}%)`;
            } else if (completed === total && total > 0) {
                progressText.textContent = `Completed: ${completed}/${total} assets`;
            } else {
                progressText.textContent = 'Ready to process';
            }
        }
    }

    /**
     * Save queue to local storage
     */
    saveQueue() {
        try {
            localStorage.setItem('tpt-batch-queue', JSON.stringify(this.queue));
        } catch (error) {
            console.error('Failed to save batch queue:', error);
        }
    }

    /**
     * Load queue from local storage
     */
    loadSavedQueue() {
        try {
            const saved = localStorage.getItem('tpt-batch-queue');
            if (saved) {
                this.queue = JSON.parse(saved);
                this.updateQueueDisplay();
                this.updateBatchControls();
            }
        } catch (error) {
            console.error('Failed to load batch queue:', error);
        }
    }

    /**
     * Export batch configuration
     */
    exportBatchConfig() {
        const config = {
            queue: this.queue.map(item => ({
                type: item.type,
                config: item.config,
                name: item.name
            })),
            settings: {
                maxConcurrent: this.maxConcurrent
            }
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `batch-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import batch configuration
     */
    importBatchConfig(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                if (config.queue && Array.isArray(config.queue)) {
                    this.queue = config.queue.map(item => ({
                        ...item,
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        status: 'queued',
                        created: new Date().toISOString()
                    }));
                    this.saveQueue();
                    this.updateQueueDisplay();
                    this.updateBatchControls();
                    showNotification(`Imported ${this.queue.length} items to batch queue`, 'success');
                }
            } catch (error) {
                showNotification('Failed to import batch configuration', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Global batch processor instance
let batchProcessor;

document.addEventListener('DOMContentLoaded', () => {
    batchProcessor = new BatchProcessor();
});

// Export for use in other modules
window.BatchProcessor = BatchProcessor;
window.batchProcessor = batchProcessor;
