/**
 * TPT Asset Editor Desktop - File Operations Utilities
 * Common file system operations and utilities
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileOperations {
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
}

module.exports = FileOperations;
