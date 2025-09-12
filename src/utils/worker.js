/**
 * TPT Asset Editor Desktop - Web Worker Script
 * Handles CPU-intensive tasks in background threads
 */

// Task handlers registry
const taskHandlers = new Map();

// Register built-in task handlers
registerTaskHandler('generate_sprite', handleSpriteGeneration);
registerTaskHandler('generate_audio', handleAudioGeneration);
registerTaskHandler('process_image', handleImageProcessing);
registerTaskHandler('batch_process', handleBatchProcessing);
registerTaskHandler('optimize_asset', handleAssetOptimization);
registerTaskHandler('validate_data', handleDataValidation);

/**
 * Register a task handler
 */
function registerTaskHandler(type, handler) {
    taskHandlers.set(type, handler);
}

/**
 * Handle messages from main thread
 */
self.onmessage = function(event) {
    const { type, taskId, taskType, data } = event.data;

    try {
        switch (type) {
            case 'execute':
                executeTask(taskId, taskType, data);
                break;
            case 'cancel':
                cancelTask(taskId);
                break;
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            taskId,
            error: error.message
        });
    }
};

/**
 * Execute a task
 */
async function executeTask(taskId, taskType, data) {
    const handler = taskHandlers.get(taskType);

    if (!handler) {
        throw new Error(`No handler registered for task type: ${taskType}`);
    }

    try {
        // Execute the task
        const result = await handler(data, (progress) => {
            self.postMessage({
                type: 'progress',
                taskId,
                progress
            });
        });

        // Send result back
        self.postMessage({
            type: 'result',
            taskId,
            data: result
        });

    } catch (error) {
        self.postMessage({
            type: 'error',
            taskId,
            error: error.message
        });
    }
}

/**
 * Cancel a task
 */
function cancelTask(taskId) {
    // In a real implementation, you'd need to track running tasks
    // and implement cancellation logic for each task type
    console.log(`Cancelling task: ${taskId}`);
}

/**
 * Sprite generation handler
 */
async function handleSpriteGeneration(data, progressCallback) {
    const { width, height, type, parameters } = data;

    progressCallback(10);

    // Simulate sprite generation work
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Generate sprite based on type
    switch (type) {
        case 'character':
            await generateCharacterSprite(ctx, width, height, parameters);
            break;
        case 'monster':
            await generateMonsterSprite(ctx, width, height, parameters);
            break;
        case 'item':
            await generateItemSprite(ctx, width, height, parameters);
            break;
        default:
            await generateGenericSprite(ctx, width, height, parameters);
    }

    progressCallback(90);

    // Convert to blob
    const blob = await canvas.convertToBlob({ type: 'image/png' });

    progressCallback(100);

    return {
        blob,
        width,
        height,
        type,
        format: 'png'
    };
}

/**
 * Generate character sprite
 */
async function generateCharacterSprite(ctx, width, height, params) {
    // Simple character generation algorithm
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

    // Body
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(width * 0.3, height * 0.4, width * 0.4, height * 0.4);

    // Head
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.25, width * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(width * 0.45, height * 0.22, width * 0.02, 0, Math.PI * 2);
    ctx.arc(width * 0.55, height * 0.22, width * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Simulate processing time
    await delay(100);
}

/**
 * Generate monster sprite
 */
async function generateMonsterSprite(ctx, width, height, params) {
    // Simple monster generation
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(width * 0.2, height * 0.3, width * 0.6, height * 0.5);

    // Spikes
    ctx.fillStyle = '#FF0000';
    for (let i = 0; i < 5; i++) {
        const x = width * (0.3 + i * 0.1);
        ctx.beginPath();
        ctx.moveTo(x, height * 0.3);
        ctx.lineTo(x + width * 0.05, height * 0.2);
        ctx.lineTo(x + width * 0.1, height * 0.3);
        ctx.fill();
    }

    // Eyes
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(width * 0.35, height * 0.4, width * 0.03, 0, Math.PI * 2);
    ctx.arc(width * 0.65, height * 0.4, width * 0.03, 0, Math.PI * 2);
    ctx.fill();

    await delay(100);
}

/**
 * Generate item sprite
 */
async function generateItemSprite(ctx, width, height, params) {
    // Simple item generation
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(width * 0.4, height * 0.3, width * 0.2, height * 0.4);

    // Handle
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(width * 0.45, height * 0.6, width * 0.1, height * 0.2);

    await delay(100);
}

/**
 * Generate generic sprite
 */
async function generateGenericSprite(ctx, width, height, params) {
    // Random pixel art generation
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const a = Math.random() > 0.1 ? 255 : 0; // 90% opaque

        data[i] = r;     // red
        data[i + 1] = g; // green
        data[i + 2] = b; // blue
        data[i + 3] = a; // alpha
    }

    ctx.putImageData(imageData, 0, 0);
    await delay(100);
}

/**
 * Audio generation handler
 */
async function handleAudioGeneration(data, progressCallback) {
    const { duration, sampleRate, type, parameters } = data;

    progressCallback(10);

    // Create audio buffer
    const length = duration * sampleRate;
    const audioBuffer = new AudioBuffer({
        length,
        sampleRate,
        numberOfChannels: 1
    });

    const channelData = audioBuffer.getChannelData(0);

    progressCallback(30);

    // Generate audio based on type
    switch (type) {
        case 'sine':
            generateSineWave(channelData, sampleRate, parameters.frequency || 440);
            break;
        case 'square':
            generateSquareWave(channelData, sampleRate, parameters.frequency || 440);
            break;
        case 'noise':
            generateNoise(channelData);
            break;
        default:
            generateSineWave(channelData, sampleRate, 440);
    }

    progressCallback(80);

    // Convert to WAV blob
    const wavBlob = audioBufferToWav(audioBuffer);

    progressCallback(100);

    return {
        blob: wavBlob,
        duration,
        sampleRate,
        type,
        format: 'wav'
    };
}

/**
 * Generate sine wave
 */
function generateSineWave(channelData, sampleRate, frequency) {
    for (let i = 0; i < channelData.length; i++) {
        channelData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
    }
}

/**
 * Generate square wave
 */
function generateSquareWave(channelData, sampleRate, frequency) {
    const period = sampleRate / frequency;

    for (let i = 0; i < channelData.length; i++) {
        channelData[i] = (i % period) < (period / 2) ? 0.3 : -0.3;
    }
}

/**
 * Generate noise
 */
function generateNoise(channelData) {
    for (let i = 0; i < channelData.length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * 0.1;
    }
}

/**
 * Convert AudioBuffer to WAV Blob
 */
function audioBufferToWav(buffer) {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const numChannels = buffer.numberOfChannels;

    // Create WAV file buffer
    const arrayBuffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numChannels * 2, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Image processing handler
 */
async function handleImageProcessing(data, progressCallback) {
    const { imageData, operation, parameters } = data;

    progressCallback(20);

    let result;

    switch (operation) {
        case 'resize':
            result = await resizeImage(imageData, parameters);
            break;
        case 'filter':
            result = await applyFilter(imageData, parameters);
            break;
        case 'optimize':
            result = await optimizeImage(imageData, parameters);
            break;
        default:
            throw new Error(`Unknown image operation: ${operation}`);
    }

    progressCallback(100);

    return result;
}

/**
 * Resize image
 */
async function resizeImage(imageData, params) {
    const { width, height } = params;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Create source canvas
    const sourceCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const sourceCtx = sourceCanvas.getContext('2d');
    sourceCtx.putImageData(imageData, 0, 0);

    // Draw resized image
    ctx.drawImage(sourceCanvas, 0, 0, width, height);

    const resultImageData = ctx.getImageData(0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: 'image/png' });

    return {
        blob,
        imageData: resultImageData,
        width,
        height,
        operation: 'resize'
    };
}

/**
 * Apply filter to image
 */
async function applyFilter(imageData, params) {
    const { filterType } = params;
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    // Apply CSS filter
    ctx.filter = getCSSFilter(filterType);
    ctx.drawImage(canvas, 0, 0);

    const resultImageData = ctx.getImageData(0, 0, imageData.width, imageData.height);
    const blob = await canvas.convertToBlob({ type: 'image/png' });

    return {
        blob,
        imageData: resultImageData,
        width: imageData.width,
        height: imageData.height,
        operation: 'filter',
        filter: filterType
    };
}

/**
 * Get CSS filter string
 */
function getCSSFilter(filterType) {
    const filters = {
        grayscale: 'grayscale(100%)',
        sepia: 'sepia(100%)',
        blur: 'blur(2px)',
        brightness: 'brightness(1.2)',
        contrast: 'contrast(1.2)',
        saturate: 'saturate(1.5)',
        hueRotate: 'hue-rotate(90deg)'
    };

    return filters[filterType] || 'none';
}

/**
 * Optimize image
 */
async function optimizeImage(imageData, params) {
    // Simple optimization - reduce quality
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    const quality = params.quality || 0.8;
    const blob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality
    });

    return {
        blob,
        width: imageData.width,
        height: imageData.height,
        operation: 'optimize',
        quality,
        originalSize: imageData.data.length,
        optimizedSize: blob.size
    };
}

/**
 * Batch processing handler
 */
async function handleBatchProcessing(data, progressCallback) {
    const { tasks, concurrent = 2 } = data;
    const results = [];
    const totalTasks = tasks.length;

    // Process tasks in batches
    for (let i = 0; i < totalTasks; i += concurrent) {
        const batch = tasks.slice(i, i + concurrent);
        const batchPromises = batch.map(async (task, index) => {
            const taskIndex = i + index;
            try {
                const result = await executeTask(`batch_${taskIndex}`, task.type, task.data);
                return { success: true, result, taskIndex };
            } catch (error) {
                return { success: false, error: error.message, taskIndex };
            }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Update progress
        const progress = Math.round(((i + batch.length) / totalTasks) * 100);
        progressCallback(progress);
    }

    return {
        results,
        totalTasks,
        successfulTasks: results.filter(r => r.success).length,
        failedTasks: results.filter(r => !r.success).length
    };
}

/**
 * Asset optimization handler
 */
async function handleAssetOptimization(data, progressCallback) {
    const { assets, optimizationType } = data;
    const results = [];

    progressCallback(10);

    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];

        try {
            let optimizedAsset;

            switch (optimizationType) {
                case 'compress':
                    optimizedAsset = await compressAsset(asset);
                    break;
                case 'resize':
                    optimizedAsset = await resizeAsset(asset);
                    break;
                case 'convert':
                    optimizedAsset = await convertAsset(asset);
                    break;
                default:
                    throw new Error(`Unknown optimization type: ${optimizationType}`);
            }

            results.push({
                success: true,
                asset: optimizedAsset,
                originalSize: asset.size,
                optimizedSize: optimizedAsset.size
            });

        } catch (error) {
            results.push({
                success: false,
                asset,
                error: error.message
            });
        }

        // Update progress
        const progress = 10 + Math.round(((i + 1) / assets.length) * 90);
        progressCallback(progress);
    }

    progressCallback(100);

    return {
        results,
        optimizationType,
        totalAssets: assets.length,
        successfulOptimizations: results.filter(r => r.success).length,
        totalSizeReduction: results
            .filter(r => r.success)
            .reduce((sum, r) => sum + (r.originalSize - r.optimizedSize), 0)
    };
}

/**
 * Compress asset
 */
async function compressAsset(asset) {
    // Simple compression simulation
    const compressionRatio = 0.7;
    const compressedSize = Math.floor(asset.size * compressionRatio);

    return {
        ...asset,
        size: compressedSize,
        compressed: true,
        compressionRatio
    };
}

/**
 * Resize asset
 */
async function resizeAsset(asset) {
    if (asset.type === 'image') {
        // Simulate image resizing
        const newWidth = Math.floor(asset.width * 0.8);
        const newHeight = Math.floor(asset.height * 0.8);
        const newSize = Math.floor(asset.size * 0.6);

        return {
            ...asset,
            width: newWidth,
            height: newHeight,
            size: newSize,
            resized: true
        };
    }

    return asset;
}

/**
 * Convert asset format
 */
async function convertAsset(asset) {
    // Simulate format conversion
    const formatMap = {
        'png': 'webp',
        'jpg': 'webp',
        'wav': 'mp3',
        'mp3': 'ogg'
    };

    const newFormat = formatMap[asset.format] || asset.format;
    const newSize = Math.floor(asset.size * 0.8);

    return {
        ...asset,
        format: newFormat,
        size: newSize,
        converted: true,
        originalFormat: asset.format
    };
}

/**
 * Data validation handler
 */
async function handleDataValidation(data, progressCallback) {
    const { data: validationData, rules } = data;
    const results = {
        valid: true,
        errors: [],
        warnings: [],
        stats: {
            totalFields: 0,
            validatedFields: 0,
            failedFields: 0
        }
    };

    progressCallback(20);

    // Validate data against rules
    for (const [field, value] of Object.entries(validationData)) {
        results.stats.totalFields++;

        try {
            const fieldRules = rules[field];
            if (fieldRules) {
                const fieldResult = validateField(value, fieldRules);
                if (fieldResult.valid) {
                    results.stats.validatedFields++;
                } else {
                    results.valid = false;
                    results.stats.failedFields++;
                    results.errors.push({
                        field,
                        value,
                        errors: fieldResult.errors
                    });
                }
            }
        } catch (error) {
            results.valid = false;
            results.stats.failedFields++;
            results.errors.push({
                field,
                value,
                errors: [error.message]
            });
        }
    }

    progressCallback(100);

    return results;
}

/**
 * Validate a single field
 */
function validateField(value, rules) {
    const errors = [];

    // Required validation
    if (rules.required && (value === null || value === undefined || value === '')) {
        errors.push('Field is required');
    }

    // Type validation
    if (rules.type && value !== null && value !== undefined) {
        const actualType = typeof value;
        if (rules.type === 'array' && !Array.isArray(value)) {
            errors.push(`Expected array, got ${actualType}`);
        } else if (rules.type !== 'array' && actualType !== rules.type) {
            errors.push(`Expected ${rules.type}, got ${actualType}`);
        }
    }

    // Range validation
    if (rules.min !== undefined && value < rules.min) {
        errors.push(`Value must be at least ${rules.min}`);
    }

    if (rules.max !== undefined && value > rules.max) {
        errors.push(`Value must be at most ${rules.max}`);
    }

    // Length validation
    if (rules.minLength !== undefined && value && value.length < rules.minLength) {
        errors.push(`Length must be at least ${rules.minLength}`);
    }

    if (rules.maxLength !== undefined && value && value.length > rules.maxLength) {
        errors.push(`Length must be at most ${rules.maxLength}`);
    }

    // Pattern validation
    if (rules.pattern && value && !rules.pattern.test(value)) {
        errors.push('Value does not match required pattern');
    }

    // Enum validation
    if (rules.enum && value && !rules.enum.includes(value)) {
        errors.push(`Value must be one of: ${rules.enum.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Utility function for delays
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerTaskHandler,
        taskHandlers
    };
}
