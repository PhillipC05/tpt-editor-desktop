/**
 * Level Exporter
 * Exports levels to various game engine formats
 */

const fs = require('fs').promises;
const path = require('path');

class LevelExporter {
    constructor() {
        this.supportedFormats = ['json', 'tmx', 'unity', 'godot', 'generic'];
    }

    /**
     * Export level to specified format
     */
    async export(level, format = 'json', options = {}) {
        switch (format.toLowerCase()) {
            case 'json':
                return await this.exportToJSON(level, options);
            case 'tmx':
                return await this.exportToTMX(level, options);
            case 'unity':
                return await this.exportToUnity(level, options);
            case 'godot':
                return await this.exportToGodot(level, options);
            case 'generic':
                return await this.exportToGeneric(level, options);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export to JSON format
     */
    async exportToJSON(level, options = {}) {
        const exportData = {
            version: '1.0',
            level: {
                id: level.id,
                name: level.name,
                type: level.type,
                size: level.size,
                theme: level.theme,
                difficulty: level.difficulty,
                dimensions: level.config.dimensions,
                metadata: level.metadata
            },
            layers: this.serializeLayers(level.layers),
            entities: this.serializeEntities(level.entities),
            lighting: level.lighting,
            audio: level.audio,
            exportInfo: {
                format: 'json',
                timestamp: new Date().toISOString(),
                exporter: 'TPT Level Exporter'
            }
        };

        if (options.pretty) {
            return JSON.stringify(exportData, null, 2);
        }

        return JSON.stringify(exportData);
    }

    /**
     * Export to Tiled Map Editor format (.tmx)
     */
    async exportToTMX(level, options = {}) {
        const tileWidth = 32;
        const tileHeight = 32;
        const { width, height } = level.config.dimensions;

        let tmxContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
        tmxContent += '<map version="1.5" tiledversion="1.7.2" orientation="orthogonal" ';
        tmxContent += `renderorder="right-down" width="${width}" height="${height}" `;
        tmxContent += `tilewidth="${tileWidth}" tileheight="${tileHeight}" infinite="0" `;
        tmxContent += 'backgroundcolor="#000000">\n';

        // Add tilesets
        tmxContent += this.generateTilesets();

        // Add layers
        tmxContent += this.generateTMXLayers(level);

        // Add object groups for entities
        tmxContent += this.generateTMXObjectGroups(level);

        tmxContent += '</map>';

        return tmxContent;
    }

    /**
     * Export to Unity format
     */
    async exportToUnity(level, options = {}) {
        const unityData = {
            levelData: {
                name: level.name,
                dimensions: level.config.dimensions,
                tileSize: 32
            },
            terrainData: this.convertToUnityTerrain(level.layers),
            objectData: this.convertToUnityObjects(level.entities),
            lightingData: this.convertToUnityLighting(level.lighting),
            metadata: level.metadata
        };

        return JSON.stringify(unityData, null, 2);
    }

    /**
     * Export to Godot format
     */
    async exportToGodot(level, options = {}) {
        const godotData = {
            level_name: level.name,
            level_type: level.type,
            dimensions: level.config.dimensions,
            tile_size: 32,
            layers: this.convertToGodotLayers(level.layers),
            entities: this.convertToGodotEntities(level.entities),
            lighting: level.lighting,
            metadata: level.metadata
        };

        return JSON.stringify(godotData, null, 2);
    }

    /**
     * Export to generic format
     */
    async exportToGeneric(level, options = {}) {
        const genericData = {
            header: {
                format: 'TPT_LEVEL',
                version: '1.0',
                name: level.name,
                type: level.type,
                dimensions: level.config.dimensions
            },
            tiles: this.convertToGenericTiles(level.layers),
            objects: this.convertToGenericObjects(level.entities),
            properties: {
                lighting: level.lighting,
                audio: level.audio,
                metadata: level.metadata
            }
        };

        return JSON.stringify(genericData, null, 2);
    }

    /**
     * Serialize layers for export
     */
    serializeLayers(layers) {
        const serialized = {};

        Object.keys(layers).forEach(layerName => {
            const layer = layers[layerName];
            serialized[layerName] = layer.map(row =>
                row.map(tile => ({
                    id: tile.tileId,
                    type: tile.tileType,
                    walkable: tile.walkable,
                    solid: tile.solid,
                    x: tile.x,
                    y: tile.y
                }))
            );
        });

        return serialized;
    }

    /**
     * Serialize entities for export
     */
    serializeEntities(entities) {
        return entities.map(entity => ({
            id: entity.id,
            type: entity.type,
            name: entity.name,
            position: entity.position,
            properties: entity.properties || {},
            metadata: entity.metadata || {}
        }));
    }

    /**
     * Generate tilesets for TMX
     */
    generateTilesets() {
        let tilesets = '';

        // Ground tileset
        tilesets += '  <tileset firstgid="1" name="ground" tilewidth="32" tileheight="32" tilecount="100" columns="10">\n';
        tilesets += '    <image source="tiles/ground.png" width="320" height="320"/>\n';
        tilesets += '  </tileset>\n';

        // Wall tileset
        tilesets += '  <tileset firstgid="101" name="walls" tilewidth="32" tileheight="32" tilecount="50" columns="10">\n';
        tilesets += '    <image source="tiles/walls.png" width="320" height="160"/>\n';
        tilesets += '  </tileset>\n';

        // Decoration tileset
        tilesets += '  <tileset firstgid="151" name="decorations" tilewidth="32" tileheight="32" tilecount="50" columns="10">\n';
        tilesets += '    <image source="tiles/decorations.png" width="320" height="160"/>\n';
        tilesets += '  </tileset>\n';

        return tilesets;
    }

    /**
     * Generate TMX layers
     */
    generateTMXLayers(level) {
        let layers = '';

        // Ground layer
        if (level.layers.ground) {
            layers += '  <layer id="1" name="Ground" width="' + level.config.dimensions.width +
                     '" height="' + level.config.dimensions.height + '">\n';
            layers += '    <data encoding="csv">\n';
            layers += this.encodeTMXLayerData(level.layers.ground);
            layers += '    </data>\n';
            layers += '  </layer>\n';
        }

        // Wall layer
        if (level.layers.walls) {
            layers += '  <layer id="2" name="Walls" width="' + level.config.dimensions.width +
                     '" height="' + level.config.dimensions.height + '">\n';
            layers += '    <data encoding="csv">\n';
            layers += this.encodeTMXLayerData(level.layers.walls, 100);
            layers += '    </data>\n';
            layers += '  </layer>\n';
        }

        // Decoration layer
        if (level.layers.decorations) {
            layers += '  <layer id="3" name="Decorations" width="' + level.config.dimensions.width +
                     '" height="' + level.config.dimensions.height + '">\n';
            layers += '    <data encoding="csv">\n';
            layers += this.encodeTMXLayerData(level.layers.decorations, 150);
            layers += '    </data>\n';
            layers += '  </layer>\n';
        }

        return layers;
    }

    /**
     * Encode layer data for TMX
     */
    encodeTMXLayerData(layer, offset = 0) {
        let data = '';
        const { width, height } = layer.length > 0 ? { width: layer[0].length, height: layer.length } : { width: 0, height: 0 };

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tileId = layer[y] && layer[y][x] ? layer[y][x].tileId + offset : 0;
                data += tileId;
                if (!(y === height - 1 && x === width - 1)) {
                    data += ',';
                }
            }
            data += '\n';
        }

        return data;
    }

    /**
     * Generate TMX object groups
     */
    generateTMXObjectGroups(level) {
        let objectGroups = '';

        if (level.entities && level.entities.length > 0) {
            objectGroups += '  <objectgroup id="1" name="Entities">\n';

            level.entities.forEach((entity, index) => {
                const x = (entity.position?.x || 0) * 32;
                const y = (entity.position?.y || 0) * 32;
                const width = entity.size?.width || 32;
                const height = entity.size?.height || 32;

                objectGroups += `    <object id="${index + 1}" name="${entity.name || entity.type}" `;
                objectGroups += `type="${entity.type}" x="${x}" y="${y}" width="${width}" height="${height}">\n`;

                // Add properties
                if (entity.properties) {
                    objectGroups += '      <properties>\n';
                    Object.entries(entity.properties).forEach(([key, value]) => {
                        objectGroups += `        <property name="${key}" value="${value}"/>\n`;
                    });
                    objectGroups += '      </properties>\n';
                }

                objectGroups += '    </object>\n';
            });

            objectGroups += '  </objectgroup>\n';
        }

        return objectGroups;
    }

    /**
     * Convert layers to Unity terrain format
     */
    convertToUnityTerrain(layers) {
        return {
            groundLayer: this.convertLayerToUnity(layers.ground),
            wallLayer: this.convertLayerToUnity(layers.walls),
            decorationLayer: this.convertLayerToUnity(layers.decorations)
        };
    }

    /**
     * Convert single layer to Unity format
     */
    convertLayerToUnity(layer) {
        if (!layer) return [];

        return layer.flat().map(tile => ({
            tileId: tile.tileId,
            position: { x: tile.x, y: tile.y },
            walkable: tile.walkable,
            solid: tile.solid
        }));
    }

    /**
     * Convert entities to Unity objects
     */
    convertToUnityObjects(entities) {
        if (!entities) return [];

        return entities.map(entity => ({
            name: entity.name,
            type: entity.type,
            position: entity.position || { x: 0, y: 0, z: 0 },
            rotation: entity.rotation || { x: 0, y: 0, z: 0 },
            scale: entity.scale || { x: 1, y: 1, z: 1 },
            properties: entity.properties || {}
        }));
    }

    /**
     * Convert lighting to Unity format
     */
    convertToUnityLighting(lighting) {
        if (!lighting) return [];

        return lighting.map(light => ({
            type: light.type || 'point',
            position: light.position || { x: 0, y: 0, z: 0 },
            color: light.color || { r: 1, g: 1, b: 1 },
            intensity: light.intensity || 1,
            range: light.range || 10
        }));
    }

    /**
     * Convert layers to Godot format
     */
    convertToGodotLayers(layers) {
        const godotLayers = {};

        Object.keys(layers).forEach(layerName => {
            godotLayers[layerName] = layers[layerName].map(row =>
                row.map(tile => ({
                    tile_id: tile.tileId,
                    position: { x: tile.x, y: tile.y },
                    properties: {
                        walkable: tile.walkable,
                        solid: tile.solid
                    }
                }))
            );
        });

        return godotLayers;
    }

    /**
     * Convert entities to Godot format
     */
    convertToGodotEntities(entities) {
        if (!entities) return [];

        return entities.map(entity => ({
            name: entity.name,
            type: entity.type,
            position: entity.position || { x: 0, y: 0 },
            properties: entity.properties || {},
            metadata: entity.metadata || {}
        }));
    }

    /**
     * Convert layers to generic tile format
     */
    convertToGenericTiles(layers) {
        const tiles = [];

        Object.keys(layers).forEach(layerName => {
            const layer = layers[layerName];
            layer.forEach(row => {
                row.forEach(tile => {
                    if (tile.tileId > 0) {
                        tiles.push({
                            layer: layerName,
                            x: tile.x,
                            y: tile.y,
                            id: tile.tileId,
                            type: tile.tileType,
                            properties: {
                                walkable: tile.walkable,
                                solid: tile.solid
                            }
                        });
                    }
                });
            });
        });

        return tiles;
    }

    /**
     * Convert entities to generic object format
     */
    convertToGenericObjects(entities) {
        if (!entities) return [];

        return entities.map(entity => ({
            id: entity.id,
            name: entity.name,
            type: entity.type,
            position: entity.position || { x: 0, y: 0 },
            properties: entity.properties || {},
            metadata: entity.metadata || {}
        }));
    }

    /**
     * Save exported data to file
     */
    async saveToFile(data, filePath, format = 'json') {
        let content = data;
        let extension = format;

        // Add appropriate extension if not present
        if (!filePath.includes('.')) {
            filePath += `.${extension}`;
        }

        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Write file
        await fs.writeFile(filePath, content, 'utf8');

        return filePath;
    }

    /**
     * Get supported export formats
     */
    getSupportedFormats() {
        return this.supportedFormats;
    }

    /**
     * Validate export options
     */
    validateOptions(format, options) {
        const formatOptions = {
            json: ['pretty', 'compact'],
            tmx: ['embedTilesets', 'compress'],
            unity: ['sceneName', 'prefabPath'],
            godot: ['sceneName', 'resourcePath'],
            generic: ['schemaVersion', 'includeMetadata']
        };

        const validOptions = formatOptions[format] || [];
        const invalidOptions = Object.keys(options).filter(opt => !validOptions.includes(opt));

        if (invalidOptions.length > 0) {
            console.warn(`Invalid options for ${format} format: ${invalidOptions.join(', ')}`);
        }

        return options;
    }
}

module.exports = LevelExporter;
