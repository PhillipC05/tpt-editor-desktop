/**
 * TPT Asset Organizer
 * Advanced asset organization, search, and management system
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AssetOrganizer {
    constructor() {
        this.assets = new Map();
        this.folders = new Map();
        this.tags = new Map();
        this.collections = new Map();
        this.searchIndex = new Map();
        this.assetMetadata = new Map();
        this.folderStructure = {};
        this.isInitialized = false;
    }

    /**
     * Initialize asset organizer
     */
    async initialize() {
        if (this.isInitialized) return;

        await this.loadAssetDatabase();
        await this.loadFolderStructure();
        await this.loadTagsAndCollections();
        await this.buildSearchIndex();
        this.isInitialized = true;

        console.log('Asset Organizer initialized');
    }

    /**
     * Load asset database
     */
    async loadAssetDatabase() {
        try {
            const assetDbPath = path.join(process.cwd(), 'asset-database.json');
            const assetData = await fs.readFile(assetDbPath, 'utf8');
            const assetDb = JSON.parse(assetData);

            // Rebuild asset maps
            Object.entries(assetDb.assets || {}).forEach(([id, asset]) => {
                this.assets.set(id, asset);
            });

            Object.entries(assetDb.metadata || {}).forEach(([id, metadata]) => {
                this.assetMetadata.set(id, metadata);
            });

        } catch (error) {
            // Initialize empty database
            console.log('No existing asset database found, starting fresh');
        }
    }

    /**
     * Load folder structure
     */
    async loadFolderStructure() {
        try {
            const folderPath = path.join(process.cwd(), 'folder-structure.json');
            const folderData = await fs.readFile(folderPath, 'utf8');
            this.folderStructure = JSON.parse(folderData);

            // Rebuild folder maps
            this.rebuildFolderMaps();

        } catch (error) {
            // Create default folder structure
            this.folderStructure = {
                root: {
                    id: 'root',
                    name: 'Assets',
                    type: 'folder',
                    children: [],
                    parent: null,
                    created: new Date().toISOString()
                }
            };
            this.folders.set('root', this.folderStructure.root);
        }
    }

    /**
     * Load tags and collections
     */
    async loadTagsAndCollections() {
        try {
            const tagsPath = path.join(process.cwd(), 'tags-collections.json');
            const tagsData = await fs.readFile(tagsPath, 'utf8');
            const tagsDb = JSON.parse(tagsData);

            // Load tags
            Object.entries(tagsDb.tags || {}).forEach(([tagId, tag]) => {
                this.tags.set(tagId, tag);
            });

            // Load collections
            Object.entries(tagsDb.collections || {}).forEach(([collectionId, collection]) => {
                this.collections.set(collectionId, collection);
            });

        } catch (error) {
            // Initialize empty tags and collections
            console.log('No existing tags/collections found, starting fresh');
        }
    }

    /**
     * Rebuild folder maps from structure
     */
    rebuildFolderMaps() {
        this.folders.clear();

        const processFolder = (folder) => {
            this.folders.set(folder.id, folder);
            if (folder.children) {
                folder.children.forEach(child => {
                    if (child.type === 'folder') {
                        processFolder(child);
                    }
                });
            }
        };

        Object.values(this.folderStructure).forEach(folder => {
            processFolder(folder);
        });
    }

    /**
     * Build search index
     */
    async buildSearchIndex() {
        this.searchIndex.clear();

        for (const [assetId, asset] of this.assets) {
            const metadata = this.assetMetadata.get(assetId) || {};
            const searchTerms = this.extractSearchTerms(asset, metadata);

            searchTerms.forEach(term => {
                if (!this.searchIndex.has(term)) {
                    this.searchIndex.set(term, new Set());
                }
                this.searchIndex.get(term).add(assetId);
            });
        }

        console.log(`Search index built with ${this.searchIndex.size} terms`);
    }

    /**
     * Extract search terms from asset and metadata
     */
    extractSearchTerms(asset, metadata) {
        const terms = new Set();

        // Asset name and type
        if (asset.name) terms.add(asset.name.toLowerCase());
        if (asset.type) terms.add(asset.type.toLowerCase());

        // Metadata fields
        if (metadata.description) {
            metadata.description.toLowerCase().split(/\s+/).forEach(word => {
                if (word.length > 2) terms.add(word);
            });
        }

        if (metadata.tags) {
            metadata.tags.forEach(tag => terms.add(tag.toLowerCase()));
        }

        if (metadata.category) terms.add(metadata.category.toLowerCase());
        if (metadata.generator) terms.add(metadata.generator.toLowerCase());

        // File extension
        if (asset.path) {
            const ext = path.extname(asset.path).toLowerCase();
            if (ext) terms.add(ext);
        }

        return Array.from(terms);
    }

    /**
     * Add asset to organizer
     */
    async addAsset(asset, metadata = {}) {
        const assetId = asset.id || uuidv4();

        // Add to assets map
        this.assets.set(assetId, {
            ...asset,
            id: assetId,
            added: new Date().toISOString(),
            lastModified: new Date().toISOString()
        });

        // Add metadata
        this.assetMetadata.set(assetId, {
            ...metadata,
            assetId: assetId,
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        });

        // Add to default folder if no folder specified
        if (!metadata.folderId) {
            await this.addAssetToFolder(assetId, 'root');
        }

        // Update search index
        await this.updateSearchIndex(assetId);

        // Save to database
        await this.saveAssetDatabase();

        console.log(`Asset ${assetId} added to organizer`);
        return assetId;
    }

    /**
     * Update asset
     */
    async updateAsset(assetId, updates, metadataUpdates = {}) {
        if (!this.assets.has(assetId)) {
            throw new Error('Asset not found');
        }

        // Update asset
        const asset = this.assets.get(assetId);
        this.assets.set(assetId, {
            ...asset,
            ...updates,
            lastModified: new Date().toISOString()
        });

        // Update metadata
        const metadata = this.assetMetadata.get(assetId);
        if (metadata) {
            this.assetMetadata.set(assetId, {
                ...metadata,
                ...metadataUpdates,
                lastModified: new Date().toISOString()
            });
        }

        // Update search index
        await this.updateSearchIndex(assetId);

        // Save changes
        await this.saveAssetDatabase();

        console.log(`Asset ${assetId} updated`);
        return assetId;
    }

    /**
     * Remove asset
     */
    async removeAsset(assetId) {
        if (!this.assets.has(assetId)) {
            return false;
        }

        // Remove from folder
        await this.removeAssetFromFolder(assetId);

        // Remove from collections
        await this.removeAssetFromCollections(assetId);

        // Remove from assets and metadata
        this.assets.delete(assetId);
        this.assetMetadata.delete(assetId);

        // Update search index
        await this.removeFromSearchIndex(assetId);

        // Save changes
        await this.saveAssetDatabase();

        console.log(`Asset ${assetId} removed`);
        return true;
    }

    /**
     * Create folder
     */
    async createFolder(name, parentId = 'root', metadata = {}) {
        const folderId = uuidv4();

        const folder = {
            id: folderId,
            name: name,
            type: 'folder',
            children: [],
            parent: parentId,
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            ...metadata
        };

        // Add to folders map
        this.folders.set(folderId, folder);

        // Add to parent folder
        const parent = this.folders.get(parentId);
        if (parent) {
            parent.children = parent.children || [];
            parent.children.push({
                id: folderId,
                name: name,
                type: 'folder'
            });
            parent.lastModified = new Date().toISOString();
        }

        // Update folder structure
        this.folderStructure[folderId] = folder;

        // Save folder structure
        await this.saveFolderStructure();

        console.log(`Folder ${folderId} created: ${name}`);
        return folderId;
    }

    /**
     * Add asset to folder
     */
    async addAssetToFolder(assetId, folderId) {
        const folder = this.folders.get(folderId);
        const asset = this.assets.get(assetId);

        if (!folder || !asset) {
            throw new Error('Folder or asset not found');
        }

        // Remove from current folder
        await this.removeAssetFromFolder(assetId);

        // Add to new folder
        folder.children = folder.children || [];
        folder.children.push({
            id: assetId,
            name: asset.name,
            type: 'asset'
        });
        folder.lastModified = new Date().toISOString();

        // Update asset metadata
        const metadata = this.assetMetadata.get(assetId);
        if (metadata) {
            metadata.folderId = folderId;
            metadata.lastModified = new Date().toISOString();
        }

        // Save changes
        await this.saveFolderStructure();
        await this.saveAssetDatabase();

        console.log(`Asset ${assetId} added to folder ${folderId}`);
    }

    /**
     * Remove asset from folder
     */
    async removeAssetFromFolder(assetId) {
        for (const [folderId, folder] of this.folders) {
            if (folder.children) {
                const assetIndex = folder.children.findIndex(child =>
                    child.id === assetId && child.type === 'asset'
                );

                if (assetIndex !== -1) {
                    folder.children.splice(assetIndex, 1);
                    folder.lastModified = new Date().toISOString();

                    // Update asset metadata
                    const metadata = this.assetMetadata.get(assetId);
                    if (metadata) {
                        delete metadata.folderId;
                        metadata.lastModified = new Date().toISOString();
                    }

                    await this.saveFolderStructure();
                    await this.saveAssetDatabase();
                    break;
                }
            }
        }
    }

    /**
     * Create tag
     */
    async createTag(name, color = '#4A90E2', metadata = {}) {
        const tagId = uuidv4();

        const tag = {
            id: tagId,
            name: name,
            color: color,
            usage: 0,
            created: new Date().toISOString(),
            ...metadata
        };

        this.tags.set(tagId, tag);
        await this.saveTagsAndCollections();

        console.log(`Tag ${tagId} created: ${name}`);
        return tagId;
    }

    /**
     * Add tag to asset
     */
    async addTagToAsset(assetId, tagId) {
        const asset = this.assets.get(assetId);
        const tag = this.tags.get(tagId);

        if (!asset || !tag) {
            throw new Error('Asset or tag not found');
        }

        const metadata = this.assetMetadata.get(assetId);
        if (metadata) {
            metadata.tags = metadata.tags || [];
            if (!metadata.tags.includes(tagId)) {
                metadata.tags.push(tagId);
                metadata.lastModified = new Date().toISOString();

                // Increment tag usage
                tag.usage = (tag.usage || 0) + 1;

                // Update search index
                await this.updateSearchIndex(assetId);

                // Save changes
                await this.saveAssetDatabase();
                await this.saveTagsAndCollections();
            }
        }

        console.log(`Tag ${tagId} added to asset ${assetId}`);
    }

    /**
     * Remove tag from asset
     */
    async removeTagFromAsset(assetId, tagId) {
        const metadata = this.assetMetadata.get(assetId);
        const tag = this.tags.get(tagId);

        if (metadata && metadata.tags && tag) {
            const tagIndex = metadata.tags.indexOf(tagId);
            if (tagIndex !== -1) {
                metadata.tags.splice(tagIndex, 1);
                metadata.lastModified = new Date().toISOString();

                // Decrement tag usage
                tag.usage = Math.max(0, (tag.usage || 0) - 1);

                // Update search index
                await this.updateSearchIndex(assetId);

                // Save changes
                await this.saveAssetDatabase();
                await this.saveTagsAndCollections();
            }
        }

        console.log(`Tag ${tagId} removed from asset ${assetId}`);
    }

    /**
     * Create collection
     */
    async createCollection(name, description = '', metadata = {}) {
        const collectionId = uuidv4();

        const collection = {
            id: collectionId,
            name: name,
            description: description,
            assets: [],
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            ...metadata
        };

        this.collections.set(collectionId, collection);
        await this.saveTagsAndCollections();

        console.log(`Collection ${collectionId} created: ${name}`);
        return collectionId;
    }

    /**
     * Add asset to collection
     */
    async addAssetToCollection(assetId, collectionId) {
        const asset = this.assets.get(assetId);
        const collection = this.collections.get(collectionId);

        if (!asset || !collection) {
            throw new Error('Asset or collection not found');
        }

        if (!collection.assets.includes(assetId)) {
            collection.assets.push(assetId);
            collection.lastModified = new Date().toISOString();

            await this.saveTagsAndCollections();
        }

        console.log(`Asset ${assetId} added to collection ${collectionId}`);
    }

    /**
     * Remove asset from collections
     */
    async removeAssetFromCollections(assetId) {
        for (const [collectionId, collection] of this.collections) {
            const assetIndex = collection.assets.indexOf(assetId);
            if (assetIndex !== -1) {
                collection.assets.splice(assetIndex, 1);
                collection.lastModified = new Date().toISOString();
            }
        }

        await this.saveTagsAndCollections();
    }

    /**
     * Search assets
     */
    async searchAssets(query, options = {}) {
        const {
            folderId = null,
            tags = [],
            type = null,
            limit = 50,
            offset = 0
        } = options;

        let matchingAssets = new Set();

        if (query) {
            // Text search
            const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);

            for (const term of queryTerms) {
                const termMatches = this.searchIndex.get(term);
                if (termMatches) {
                    if (matchingAssets.size === 0) {
                        matchingAssets = new Set(termMatches);
                    } else {
                        // Intersection of matches
                        matchingAssets = new Set([...matchingAssets].filter(id => termMatches.has(id)));
                    }
                } else {
                    // No matches for this term
                    matchingAssets.clear();
                    break;
                }
            }
        } else {
            // Return all assets if no query
            matchingAssets = new Set(this.assets.keys());
        }

        // Apply filters
        let results = Array.from(matchingAssets).map(assetId => {
            const asset = this.assets.get(assetId);
            const metadata = this.assetMetadata.get(assetId);
            return { asset, metadata };
        });

        // Filter by folder
        if (folderId) {
            results = results.filter(result => result.metadata?.folderId === folderId);
        }

        // Filter by tags
        if (tags.length > 0) {
            results = results.filter(result => {
                const assetTags = result.metadata?.tags || [];
                return tags.every(tagId => assetTags.includes(tagId));
            });
        }

        // Filter by type
        if (type) {
            results = results.filter(result => result.asset.type === type);
        }

        // Apply pagination
        const total = results.length;
        results = results.slice(offset, offset + limit);

        return {
            results: results,
            total: total,
            hasMore: offset + limit < total
        };
    }

    /**
     * Get folder contents
     */
    getFolderContents(folderId) {
        const folder = this.folders.get(folderId);
        if (!folder) return null;

        const contents = {
            folders: [],
            assets: []
        };

        if (folder.children) {
            folder.children.forEach(child => {
                if (child.type === 'folder') {
                    const childFolder = this.folders.get(child.id);
                    if (childFolder) {
                        contents.folders.push(childFolder);
                    }
                } else if (child.type === 'asset') {
                    const asset = this.assets.get(child.id);
                    const metadata = this.assetMetadata.get(child.id);
                    if (asset) {
                        contents.assets.push({ asset, metadata });
                    }
                }
            });
        }

        return contents;
    }

    /**
     * Get asset statistics
     */
    getAssetStatistics() {
        const stats = {
            totalAssets: this.assets.size,
            totalFolders: this.folders.size,
            totalTags: this.tags.size,
            totalCollections: this.collections.size,
            assetsByType: {},
            assetsByFolder: {},
            tagsByUsage: {},
            collectionsBySize: {}
        };

        // Assets by type
        for (const asset of this.assets.values()) {
            stats.assetsByType[asset.type] = (stats.assetsByType[asset.type] || 0) + 1;
        }

        // Assets by folder
        for (const [folderId, folder] of this.folders) {
            const contents = this.getFolderContents(folderId);
            stats.assetsByFolder[folderId] = contents ? contents.assets.length : 0;
        }

        // Tags by usage
        for (const tag of this.tags.values()) {
            const usage = tag.usage || 0;
            stats.tagsByUsage[usage] = (stats.tagsByUsage[usage] || 0) + 1;
        }

        // Collections by size
        for (const collection of this.collections.values()) {
            const size = collection.assets.length;
            stats.collectionsBySize[size] = (stats.collectionsBySize[size] || 0) + 1;
        }

        return stats;
    }

    /**
     * Update search index for asset
     */
    async updateSearchIndex(assetId) {
        // Remove old terms
        await this.removeFromSearchIndex(assetId);

        // Add new terms
        const asset = this.assets.get(assetId);
        const metadata = this.assetMetadata.get(assetId);

        if (asset) {
            const searchTerms = this.extractSearchTerms(asset, metadata);

            searchTerms.forEach(term => {
                if (!this.searchIndex.has(term)) {
                    this.searchIndex.set(term, new Set());
                }
                this.searchIndex.get(term).add(assetId);
            });
        }
    }

    /**
     * Remove asset from search index
     */
    async removeFromSearchIndex(assetId) {
        for (const [term, assetIds] of this.searchIndex) {
            assetIds.delete(assetId);
            if (assetIds.size === 0) {
                this.searchIndex.delete(term);
            }
        }
    }

    /**
     * Save asset database
     */
    async saveAssetDatabase() {
        try {
            const assetDb = {
                assets: Object.fromEntries(this.assets),
                metadata: Object.fromEntries(this.assetMetadata),
                lastUpdated: new Date().toISOString()
            };

            const assetDbPath = path.join(process.cwd(), 'asset-database.json');
            await fs.writeFile(assetDbPath, JSON.stringify(assetDb, null, 2));
        } catch (error) {
            console.error('Failed to save asset database:', error);
        }
    }

    /**
     * Save folder structure
     */
    async saveFolderStructure() {
        try {
            const folderPath = path.join(process.cwd(), 'folder-structure.json');
            await fs.writeFile(folderPath, JSON.stringify(this.folderStructure, null, 2));
        } catch (error) {
            console.error('Failed to save folder structure:', error);
        }
    }

    /**
     * Save tags and collections
     */
    async saveTagsAndCollections() {
        try {
            const tagsDb = {
                tags: Object.fromEntries(this.tags),
                collections: Object.fromEntries(this.collections),
                lastUpdated: new Date().toISOString()
            };

            const tagsPath = path.join(process.cwd(), 'tags-collections.json');
            await fs.writeFile(tagsPath, JSON.stringify(tagsDb, null, 2));
        } catch (error) {
            console.error('Failed to save tags and collections:', error);
        }
    }

    /**
     * Export folder structure
     */
    async exportFolderStructure(exportPath) {
        const exportData = {
            folderStructure: this.folderStructure,
            assets: Object.fromEntries(this.assets),
            metadata: Object.fromEntries(this.assetMetadata),
            tags: Object.fromEntries(this.tags),
            collections: Object.fromEntries(this.collections),
            exported: new Date().toISOString()
        };

        await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
        console.log(`Asset organization exported to ${exportPath}`);
    }

    /**
     * Import folder structure
     */
    async importFolderStructure(importPath) {
        try {
            const importData = JSON.parse(await fs.readFile(importPath, 'utf8'));

            // Merge data
            this.folderStructure = { ...this.folderStructure, ...importData.folderStructure };
            this.assets = new Map([...this.assets, ...Object.entries(importData.assets || {})]);
            this.assetMetadata = new Map([...this.assetMetadata, ...Object.entries(importData.metadata || {})]);
            this.tags = new Map([...this.tags, ...Object.entries(importData.tags || {})]);
            this.collections = new Map([...this.collections, ...Object.entries(importData.collections || {})]);

            // Rebuild maps
            this.rebuildFolderMaps();
            await this.buildSearchIndex();

            // Save imported data
            await this.saveAssetDatabase();
            await this.saveFolderStructure();
            await this.saveTagsAndCollections();

            console.log(`Asset organization imported from ${importPath}`);
        } catch (error) {
            throw new Error(`Failed to import asset organization: ${error.message}`);
        }
    }

    /**
     * Cleanup unused data
     */
    async cleanup() {
        // Remove assets that no longer exist on disk
        const assetsToRemove = [];

        for (const [assetId, asset] of this.assets) {
            if (asset.path) {
                try {
                    await fs.access(asset.path);
                } catch (error) {
                    // File doesn't exist, mark for removal
                    assetsToRemove.push(assetId);
                }
            }
        }

        // Remove assets
        for (const assetId of assetsToRemove) {
            await this.removeAsset(assetId);
        }

        // Clean up empty folders
        const foldersToRemove = [];
        for (const [folderId, folder] of this.folders) {
            if (folderId !== 'root' && (!folder.children || folder.children.length === 0)) {
                foldersToRemove.push(folderId);
            }
        }

        // Remove empty folders
        for (const folderId of foldersToRemove) {
            delete this.folderStructure[folderId];
            this.folders.delete(folderId);
        }

        if (foldersToRemove.length > 0) {
            await this.saveFolderStructure();
        }

        console.log(`Cleanup completed: removed ${assetsToRemove.length} missing assets and ${foldersToRemove.length} empty folders`);
        return {
            removedAssets: assetsToRemove.length,
            removedFolders: foldersToRemove.length
        };
    }

    /**
     * Get asset by ID
     */
    getAsset(assetId) {
        const asset = this.assets.get(assetId);
        const metadata = this.assetMetadata.get(assetId);
        return asset ? { asset, metadata } : null;
    }

    /**
     * Get all assets
     */
    getAllAssets() {
        const results = [];
        for (const [assetId, asset] of this.assets) {
            const metadata = this.assetMetadata.get(assetId);
            results.push({ asset, metadata });
        }
        return results;
    }

    /**
     * Get folder by ID
     */
    getFolder(folderId) {
        return this.folders.get(folderId);
    }

    /**
     * Get all folders
     */
    getAllFolders() {
        return Array.from(this.folders.values());
    }

    /**
     * Get tag by ID
     */
    getTag(tagId) {
        return this.tags.get(tagId);
    }

    /**
     * Get all tags
     */
    getAllTags() {
        return Array.from(this.tags.values());
    }

    /**
     * Get collection by ID
     */
    getCollection(collectionId) {
        return this.collections.get(collectionId);
    }

    /**
     * Get all collections
     */
    getAllCollections() {
        return Array.from(this.collections.values());
    }
}

module.exports = AssetOrganizer;
