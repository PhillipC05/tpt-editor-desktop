/**
 * TPT Asset Editor Desktop - Enhanced File Operations Utilities
 * Common file system operations with advanced I/O optimization
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');
const os = require('os');

class FileOperations extends EventEmitter {
    /**
     * Ensure a directory exists, creating it if necessary
     * @param {string} dirPath - Directory path to ensure
     * @returns {Promise<boolean>} True if directory exists or was created
     */
    static async ensureDirectory(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
            return true;
        } catch (error) {
            if (error.code === 'EEXIST') {
                return true; // Directory already exists
            }
            throw error;
        }
    }

    /**
     * Check if a file or directory exists
     * @param {string} filePath - Path to check
     * @returns {Promise<boolean>} True if path exists
     */
    static async pathExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get file statistics
     * @param {string} filePath - File path
     * @returns {Promise<fs.Stats>} File statistics
     */
    static async getFileStats(filePath) {
        return await fs.stat(filePath);
    }

    /**
     * Read file as buffer
     * @param {string} filePath - File path
     * @returns {Promise<Buffer>} File contents as buffer
     */
    static async readFileBuffer(filePath) {
        return await fs.readFile(filePath);
    }

    /**
     * Read file as string
     * @param {string} filePath - File path
     * @param {string} [encoding='utf8'] - Text encoding
     * @returns {Promise<string>} File contents as string
     */
    static async readFileText(filePath, encoding = 'utf8') {
        return await fs.readFile(filePath, encoding);
    }

    /**
     * Read JSON file and parse
     * @param {string} filePath - JSON file path
     * @returns {Promise<Object>} Parsed JSON object
     */
    static async readJsonFile(filePath) {
        const content = await this.readFileText(filePath);
        return JSON.parse(content);
    }

    /**
     * Write buffer to file
     * @param {string} filePath - File path
     * @param {Buffer} buffer - Data to write
     * @returns {Promise<void>}
     */
    static async writeFileBuffer(filePath, buffer) {
        await this.ensureDirectory(path.dirname(filePath));
        await fs.writeFile(filePath, buffer);
    }

    /**
     * Write string to file
     * @param {string} filePath - File path
     * @param {string} content - Content to write
     * @param {string} [encoding='utf8'] - Text encoding
     * @returns {Promise<void>}
     */
    static async writeFileText(filePath, content, encoding = 'utf8') {
        await this.ensureDirectory(path.dirname(filePath));
        await fs.writeFile(filePath, content, encoding);
    }

    /**
     * Write object as JSON to file
     * @param {string} filePath - File path
     * @param {Object} object - Object to serialize
     * @param {number} [indent=2] - JSON indentation
     * @returns {Promise<void>}
     */
    static async writeJsonFile(filePath, object, indent = 2) {
        const content = JSON.stringify(object, null, indent);
        await this.writeFileText(filePath, content);
    }

    /**
     * Copy file from source to destination
     * @param {string} sourcePath - Source file path
     * @param {string} destPath - Destination file path
     * @returns {Promise<void>}
     */
    static async copyFile(sourcePath, destPath) {
        await this.ensureDirectory(path.dirname(destPath));
        await fs.copyFile(sourcePath, destPath);
    }

    /**
     * Move/rename file
     * @param {string} oldPath - Current file path
     * @param {string} newPath - New file path
     * @returns {Promise<void>}
     */
    static async moveFile(oldPath, newPath) {
        await this.ensureDirectory(path.dirname(newPath));
        await fs.rename(oldPath, newPath);
    }

    /**
     * Delete file
     * @param {string} filePath - File path to delete
     * @returns {Promise<boolean>} True if file was deleted
     */
    static async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return false; // File doesn't exist
            }
            throw error;
        }
    }

    /**
     * List files in directory
     * @param {string} dirPath - Directory path
     * @param {Object} [options={}] - Options
     * @param {boolean} [options.recursive=false] - Include subdirectories
     * @param {string|string[]} [options.extensions] - Filter by file extensions
     * @returns {Promise<string[]>} Array of file paths
     */
    static async listFiles(dirPath, options = {}) {
        const files = [];
        await this._listFilesRecursive(dirPath, files, options);
        return files;
    }

    /**
     * Internal recursive file listing
     * @private
     */
    static async _listFilesRecursive(dirPath, files, options) {
        const items = await fs.readdir(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = await fs.stat(itemPath);

            if (stats.isDirectory() && options.recursive) {
                await this._listFilesRecursive(itemPath, files, options);
            } else if (stats.isFile()) {
                if (this._matchesExtension(item, options.extensions)) {
                    files.push(itemPath);
                }
            }
        }
    }

    /**
     * Check if file matches extension filter
     * @private
     */
    static _matchesExtension(filename, extensions) {
        if (!extensions) return true;

        const extArray = Array.isArray(extensions) ? extensions : [extensions];
        const fileExt = path.extname(filename).toLowerCase();

        return extArray.some(ext => ext.toLowerCase() === fileExt || ext.toLowerCase() === fileExt.slice(1));
    }

    /**
     * Get file extension
     * @param {string} filePath - File path
     * @returns {string} File extension (without dot)
     */
    static getFileExtension(filePath) {
        return path.extname(filePath).slice(1).toLowerCase();
    }

    /**
     * Get file name without extension
     * @param {string} filePath - File path
     * @returns {string} File name without extension
     */
    static getFileNameWithoutExtension(filePath) {
        return path.basename(filePath, path.extname(filePath));
    }

    /**
     * Generate unique filename to avoid conflicts
     * @param {string} dirPath - Directory path
     * @param {string} baseName - Base filename
     * @param {string} extension - File extension
     * @returns {Promise<string>} Unique filename
     */
    static async generateUniqueFilename(dirPath, baseName, extension) {
        let filename = `${baseName}${extension}`;
        let counter = 1;

        while (await this.pathExists(path.join(dirPath, filename))) {
            filename = `${baseName}_${counter}${extension}`;
            counter++;
        }

        return filename;
    }

    /**
     * Calculate file hash for integrity checking
     * @param {string} filePath - File path
     * @param {string} [algorithm='sha256'] - Hash algorithm
     * @returns {Promise<string>} File hash
     */
    static async calculateFileHash(filePath, algorithm = 'sha256') {
        const fileBuffer = await this.readFileBuffer(filePath);
        return crypto.createHash(algorithm).update(fileBuffer).digest('hex');
    }

    /**
     * Get file size in human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Human readable file size
     */
    static formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    /**
     * Create temporary file path
     * @param {string} [prefix='temp_'] - Filename prefix
     * @param {string} [extension=''] - File extension
     * @returns {string} Temporary file path
     */
    static createTempFilePath(prefix = 'temp_', extension = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const filename = `${prefix}${timestamp}_${random}${extension}`;
        return path.join(require('os').tmpdir(), filename);
    }

    /**
     * Clean up temporary files older than specified age
     * @param {string} tempDir - Temporary directory path
     * @param {number} maxAgeMs - Maximum age in milliseconds
     * @returns {Promise<number>} Number of files cleaned up
     */
    static async cleanupTempFiles(tempDir, maxAgeMs = 24 * 60 * 60 * 1000) {
        let cleanedCount = 0;
        const files = await this.listFiles(tempDir);

        for (const file of files) {
            try {
                const stats = await this.getFileStats(file);
                const age = Date.now() - stats.mtime.getTime();

                if (age > maxAgeMs) {
                    await this.deleteFile(file);
                    cleanedCount++;
                }
            } catch (error) {
                // Skip files that can't be accessed
                continue;
            }
        }

        return cleanedCount;
    }

    /**
     * Safely delete directory and all contents
     * @param {string} dirPath - Directory path to delete
     * @returns {Promise<boolean>} True if directory was deleted
     */
    static async deleteDirectory(dirPath) {
        try {
            await fs.rm(dirPath, { recursive: true, force: true });
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return false; // Directory doesn't exist
            }
            throw error;
        }
    }

    /**
     * Get directory size recursively
     * @param {string} dirPath - Directory path
     * @returns {Promise<number>} Total size in bytes
     */
    static async getDirectorySize(dirPath) {
        let totalSize = 0;
        const files = await this.listFiles(dirPath, { recursive: true });

        for (const file of files) {
            try {
                const stats = await this.getFileStats(file);
                totalSize += stats.size;
            } catch (error) {
                // Skip files that can't be accessed
                continue;
            }
        }

        return totalSize;
    }

    /**
     * Validate file path for security
     * @param {string} filePath - File path to validate
     * @param {Object} [options={}] - Validation options
     * @param {string[]} [options.allowedExtensions] - Allowed file extensions
     * @param {number} [options.maxPathLength=260] - Maximum path length
     * @returns {boolean} True if path is valid
     */
    static validateFilePath(filePath, options = {}) {
        // Check path length
        if (filePath.length > (options.maxPathLength || 260)) {
            return false;
        }

        // Check for directory traversal attempts
        if (filePath.includes('..') || filePath.includes('../')) {
            return false;
        }

        // Check file extension if specified
        if (options.allowedExtensions) {
            const ext = this.getFileExtension(filePath);
            if (!options.allowedExtensions.includes(ext)) {
                return false;
            }
        }

        // Check for absolute path requirement
        if (options.requireAbsolute && !path.isAbsolute(filePath)) {
            return false;
        }

        return true;
    }

    /**
     * Create backup of file
     * @param {string} filePath - Original file path
     * @param {string} [backupDir] - Backup directory (defaults to same directory)
     * @returns {Promise<string>} Backup file path
     */
    static async createBackup(filePath, backupDir = null) {
        const fileName = path.basename(filePath);
        const fileDir = path.dirname(filePath);
        const backupDirectory = backupDir || fileDir;

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const backupName = `${this.getFileNameWithoutExtension(fileName)}_backup_${timestamp}${path.extname(fileName)}`;
        const backupPath = path.join(backupDirectory, backupName);

        await this.copyFile(filePath, backupPath);
        return backupPath;
    }

    // ===== ENHANCED I/O OPTIMIZATION METHODS =====

    /**
     * Stream file content with progress tracking
     * @param {string} filePath - File path to stream
     * @param {Object} [options={}] - Streaming options
     * @param {Function} [options.onProgress] - Progress callback (bytesRead, totalBytes)
     * @param {Function} [options.onData] - Data chunk callback
     * @param {number} [options.chunkSize=65536] - Chunk size in bytes
     * @returns {Promise<Buffer>} Complete file content
     */
    static async streamFile(filePath, options = {}) {
        const stats = await this.getFileStats(filePath);
        const totalBytes = stats.size;
        let bytesRead = 0;
        const chunks = [];

        const { onProgress, onData, chunkSize = 65536 } = options;

        return new Promise((resolve, reject) => {
            const stream = fsSync.createReadStream(filePath, { highWaterMark: chunkSize });

            stream.on('data', (chunk) => {
                chunks.push(chunk);
                bytesRead += chunk.length;

                if (onData) {
                    onData(chunk, bytesRead, totalBytes);
                }

                if (onProgress) {
                    onProgress(bytesRead, totalBytes);
                }
            });

            stream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });

            stream.on('error', reject);
        });
    }

    /**
     * Write large file using streaming to prevent memory issues
     * @param {string} filePath - File path to write
     * @param {Buffer|Readable} data - Data to write (Buffer or Readable stream)
     * @param {Object} [options={}] - Write options
     * @param {Function} [options.onProgress] - Progress callback
     * @returns {Promise<void>}
     */
    static async streamWriteFile(filePath, data, options = {}) {
        await this.ensureDirectory(path.dirname(filePath));

        const { onProgress } = options;

        return new Promise((resolve, reject) => {
            const writeStream = fsSync.createWriteStream(filePath);

            let totalBytes = 0;
            let bytesWritten = 0;

            if (Buffer.isBuffer(data)) {
                totalBytes = data.length;
                writeStream.write(data);
                writeStream.end();
            } else if (data.pipe) {
                // Handle Readable stream
                data.on('data', (chunk) => {
                    totalBytes += chunk.length;
                });

                data.pipe(writeStream);
            } else {
                reject(new Error('Invalid data type for streaming write'));
                return;
            }

            writeStream.on('drain', () => {
                bytesWritten += writeStream.writableHighWaterMark;
                if (onProgress && totalBytes > 0) {
                    onProgress(bytesWritten, totalBytes);
                }
            });

            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    }

    /**
     * Batch file operations for improved performance
     * @param {Array} operations - Array of operation objects
     * @param {Object} [options={}] - Batch options
     * @param {number} [options.concurrency=5] - Max concurrent operations
     * @param {Function} [options.onProgress] - Progress callback
     * @returns {Promise<Array>} Results array
     */
    static async batchFileOperations(operations, options = {}) {
        const { concurrency = 5, onProgress } = options;
        const results = [];
        let completed = 0;

        // Process operations in batches
        for (let i = 0; i < operations.length; i += concurrency) {
            const batch = operations.slice(i, i + concurrency);
            const batchPromises = batch.map(async (operation, index) => {
                try {
                    const result = await this._executeFileOperation(operation);
                    results[i + index] = { success: true, result, operation };
                } catch (error) {
                    results[i + index] = { success: false, error, operation };
                }

                completed++;
                if (onProgress) {
                    onProgress(completed, operations.length);
                }
            });

            await Promise.all(batchPromises);
        }

        return results;
    }

    /**
     * Execute individual file operation
     * @private
     */
    static async _executeFileOperation(operation) {
        const { type, ...params } = operation;

        switch (type) {
            case 'read':
                return await this.readFileText(params.filePath, params.encoding);
            case 'write':
                return await this.writeFileText(params.filePath, params.content, params.encoding);
            case 'copy':
                return await this.copyFile(params.sourcePath, params.destPath);
            case 'delete':
                return await this.deleteFile(params.filePath);
            case 'move':
                return await this.moveFile(params.oldPath, params.newPath);
            case 'mkdir':
                return await this.ensureDirectory(params.dirPath);
            default:
                throw new Error(`Unknown operation type: ${type}`);
        }
    }

    /**
     * Get disk usage information
     * @param {string} [dirPath] - Directory to check (defaults to current working directory)
     * @returns {Promise<Object>} Disk usage statistics
     */
    static async getDiskUsage(dirPath = process.cwd()) {
        try {
            const stats = await fs.stat(dirPath);
            const diskInfo = {
                path: dirPath,
                totalSize: 0,
                fileCount: 0,
                dirCount: 0,
                largestFile: { path: '', size: 0 },
                extensions: new Map(),
                lastModified: stats.mtime,
                created: stats.birthtime
            };

            await this._calculateDiskUsage(dirPath, diskInfo);
            return diskInfo;
        } catch (error) {
            throw new Error(`Failed to get disk usage: ${error.message}`);
        }
    }

    /**
     * Recursively calculate disk usage
     * @private
     */
    static async _calculateDiskUsage(dirPath, diskInfo) {
        const items = await fs.readdir(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);

            try {
                const stats = await fs.stat(itemPath);

                if (stats.isDirectory()) {
                    diskInfo.dirCount++;
                    await this._calculateDiskUsage(itemPath, diskInfo);
                } else if (stats.isFile()) {
                    diskInfo.fileCount++;
                    diskInfo.totalSize += stats.size;

                    // Track largest file
                    if (stats.size > diskInfo.largestFile.size) {
                        diskInfo.largestFile = { path: itemPath, size: stats.size };
                    }

                    // Track file extensions
                    const ext = this.getFileExtension(itemPath);
                    diskInfo.extensions.set(ext, (diskInfo.extensions.get(ext) || 0) + 1);
                }
            } catch (error) {
                // Skip inaccessible files
                console.warn(`Skipping inaccessible file: ${itemPath}`);
            }
        }
    }

    /**
     * Monitor disk usage with periodic updates
     * @param {string} dirPath - Directory to monitor
     * @param {Object} [options={}] - Monitoring options
     * @param {number} [options.interval=60000] - Check interval in ms
     * @param {Function} [options.onUpdate] - Update callback
     * @param {number} [options.threshold] - Size threshold for alerts
     * @returns {Object} Monitor control object
     */
    static monitorDiskUsage(dirPath, options = {}) {
        const { interval = 60000, onUpdate, threshold } = options;
        let lastSize = 0;
        let isMonitoring = true;

        const checkUsage = async () => {
            if (!isMonitoring) return;

            try {
                const usage = await this.getDiskUsage(dirPath);

                if (onUpdate) {
                    onUpdate(usage);
                }

                // Check threshold
                if (threshold && usage.totalSize > threshold) {
                    this.emit('disk-threshold-exceeded', {
                        path: dirPath,
                        currentSize: usage.totalSize,
                        threshold
                    });
                }

                // Track size changes
                if (lastSize > 0 && usage.totalSize !== lastSize) {
                    this.emit('disk-usage-changed', {
                        path: dirPath,
                        previousSize: lastSize,
                        currentSize: usage.totalSize,
                        change: usage.totalSize - lastSize
                    });
                }

                lastSize = usage.totalSize;

            } catch (error) {
                this.emit('disk-monitor-error', { path: dirPath, error: error.message });
            }
        };

        // Start monitoring
        const intervalId = setInterval(checkUsage, interval);
        checkUsage(); // Initial check

        return {
            stop: () => {
                isMonitoring = false;
                clearInterval(intervalId);
            },
            checkNow: checkUsage
        };
    }

    /**
     * Get system disk information
     * @returns {Promise<Object>} System disk information
     */
    static async getSystemDiskInfo() {
        try {
            const diskInfo = {
                platform: os.platform(),
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                cpus: os.cpus().length,
                arch: os.arch(),
                tmpdir: os.tmpdir(),
                homedir: os.homedir()
            };

            // Get disk space information (platform-specific)
            if (os.platform() === 'win32') {
                // Windows disk info
                const drive = path.parse(process.cwd()).root;
                diskInfo.currentDrive = drive;
            } else {
                // Unix-like systems
                diskInfo.currentDrive = '/';
            }

            return diskInfo;
        } catch (error) {
            throw new Error(`Failed to get system disk info: ${error.message}`);
        }
    }

    /**
     * Optimize file access patterns with prefetching
     * @param {string[]} filePaths - Array of file paths to prefetch
     * @param {Object} [options={}] - Prefetch options
     * @param {number} [options.concurrency=3] - Max concurrent prefetches
     * @param {Function} [options.onComplete] - Completion callback
     * @returns {Promise<Map>} Prefetched file cache
     */
    static async prefetchFiles(filePaths, options = {}) {
        const { concurrency = 3, onComplete } = options;
        const cache = new Map();
        let completed = 0;

        for (let i = 0; i < filePaths.length; i += concurrency) {
            const batch = filePaths.slice(i, i + concurrency);
            const batchPromises = batch.map(async (filePath) => {
                try {
                    const content = await this.readFileBuffer(filePath);
                    cache.set(filePath, {
                        content,
                        size: content.length,
                        prefetchedAt: Date.now()
                    });
                } catch (error) {
                    console.warn(`Failed to prefetch ${filePath}:`, error.message);
                }

                completed++;
                if (onComplete) {
                    onComplete(completed, filePaths.length);
                }
            });

            await Promise.all(batchPromises);
        }

        return cache;
    }

    /**
     * Create memory-mapped file access for large files
     * @param {string} filePath - File path
     * @param {Object} [options={}] - Memory mapping options
     * @returns {Promise<Object>} Memory mapped file interface
     */
    static async createMemoryMappedFile(filePath, options = {}) {
        const stats = await this.getFileStats(filePath);
        const fileSize = stats.size;

        // For very large files, use streaming instead of full mapping
        if (fileSize > 100 * 1024 * 1024) { // 100MB threshold
            return this._createStreamingFileInterface(filePath, options);
        }

        // For smaller files, load into memory
        const content = await this.readFileBuffer(filePath);

        return {
            size: fileSize,
            read: (offset, length) => content.slice(offset, offset + length),
            readAll: () => content,
            close: () => {} // No-op for in-memory files
        };
    }

    /**
     * Create streaming file interface for large files
     * @private
     */
    static async _createStreamingFileInterface(filePath, options) {
        const stats = await this.getFileStats(filePath);
        const fileSize = stats.size;

        return {
            size: fileSize,
            read: async (offset, length) => {
                const buffer = Buffer.alloc(length);
                const fd = await fs.open(filePath, 'r');
                await fd.read(buffer, 0, length, offset);
                await fd.close();
                return buffer;
            },
            readAll: () => this.readFileBuffer(filePath),
            close: () => {} // No-op
        };
    }

    /**
     * Compress file using built-in compression
     * @param {string} inputPath - Input file path
     * @param {string} outputPath - Output compressed file path
     * @param {Object} [options={}] - Compression options
     * @returns {Promise<Object>} Compression results
     */
    static async compressFile(inputPath, outputPath, options = {}) {
        const zlib = require('zlib');
        const { algorithm = 'gzip', level = 6 } = options;

        const input = fsSync.createReadStream(inputPath);
        const output = fsSync.createWriteStream(outputPath);

        const compressor = algorithm === 'gzip' ?
            zlib.createGzip({ level }) :
            zlib.createDeflate({ level });

        return new Promise((resolve, reject) => {
            let originalSize = 0;
            let compressedSize = 0;

            input.on('data', (chunk) => {
                originalSize += chunk.length;
            });

            output.on('finish', async () => {
                const stats = await fs.stat(outputPath);
                compressedSize = stats.size;

                resolve({
                    originalSize,
                    compressedSize,
                    ratio: compressedSize / originalSize,
                    savedBytes: originalSize - compressedSize
                });
            });

            input.pipe(compressor).pipe(output).on('error', reject);
        });
    }

    /**
     * Decompress file
     * @param {string} inputPath - Compressed file path
     * @param {string} outputPath - Output decompressed file path
     * @param {Object} [options={}] - Decompression options
     * @returns {Promise<Object>} Decompression results
     */
    static async decompressFile(inputPath, outputPath, options = {}) {
        const zlib = require('zlib');
        const { algorithm = 'gzip' } = options;

        const input = fsSync.createReadStream(inputPath);
        const output = fsSync.createWriteStream(outputPath);

        const decompressor = algorithm === 'gzip' ?
            zlib.createGunzip() :
            zlib.createInflate();

        return new Promise((resolve, reject) => {
            let compressedSize = 0;
            let decompressedSize = 0;

            input.on('data', (chunk) => {
                compressedSize += chunk.length;
            });

            output.on('finish', async () => {
                const stats = await fs.stat(outputPath);
                decompressedSize = stats.size;

                resolve({
                    compressedSize,
                    decompressedSize,
                    ratio: decompressedSize / compressedSize
                });
            });

            input.pipe(decompressor).pipe(output).on('error', reject);
        });
    }
}

module.exports = FileOperations;
