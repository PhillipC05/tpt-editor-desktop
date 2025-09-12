/**
 * Nature Generator - Trees, Plants, Rocks, and Environmental Assets
 * Handles generation of natural elements with seasonal variations and environmental themes
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class NatureGenerator {
    constructor() {
        this.utils = new SpriteUtils();

        // Tree database with seasonal variations
        this.treeDatabase = {
            oak: {
                name: 'Oak Tree',
                seasons: {
                    spring: { leaves: '#228B22', flowers: '#FFB6C1', trunk: '#8B4513' },
                    summer: { leaves: '#006400', flowers: null, trunk: '#8B4513' },
                    autumn: { leaves: '#FF6347', flowers: null, trunk: '#8B4513' },
                    winter: { leaves: null, flowers: null, trunk: '#654321', snow: '#FFFFFF' }
                },
                size: { width: 64, height: 96 },
                variations: ['young', 'mature', 'ancient']
            },
            pine: {
                name: 'Pine Tree',
                seasons: {
                    spring: { needles: '#0F5132', cones: '#8B4513', trunk: '#654321' },
                    summer: { needles: '#006400', cones: '#8B4513', trunk: '#654321' },
                    autumn: { needles: '#228B22', cones: '#8B4513', trunk: '#654321' },
                    winter: { needles: '#0F5132', cones: '#8B4513', trunk: '#654321', snow: '#FFFFFF' }
                },
                size: { width: 48, height: 80 },
                variations: ['tall', 'bushy', 'leaning']
            },
            birch: {
                name: 'Birch Tree',
                seasons: {
                    spring: { leaves: '#90EE90', trunk: '#F5DEB3', bark: '#D2B48C' },
                    summer: { leaves: '#32CD32', trunk: '#F5DEB3', bark: '#D2B48C' },
                    autumn: { leaves: '#FFD700', trunk: '#F5DEB3', bark: '#D2B48C' },
                    winter: { leaves: null, trunk: '#F5DEB3', bark: '#D2B48C', snow: '#FFFFFF' }
                },
                size: { width: 40, height: 72 },
                variations: ['slender', 'curved', 'clustered']
            },
            palm: {
                name: 'Palm Tree',
                seasons: {
                    spring: { leaves: '#228B22', coconuts: '#8B4513', trunk: '#DEB887' },
                    summer: { leaves: '#006400', coconuts: '#8B4513', trunk: '#DEB887' },
                    autumn: { leaves: '#32CD32', coconuts: '#8B4513', trunk: '#DEB887' },
                    winter: { leaves: '#228B22', coconuts: '#8B4513', trunk: '#DEB887' }
                },
                size: { width: 56, height: 88 },
                variations: ['tall', 'bushy', 'leaning']
            },
            willow: {
                name: 'Willow Tree',
                seasons: {
                    spring: { leaves: '#98FB98', trunk: '#8B4513', vines: '#228B22' },
                    summer: { leaves: '#00FF7F', trunk: '#8B4513', vines: '#228B22' },
                    autumn: { leaves: '#FFA500', trunk: '#8B4513', vines: '#228B22' },
                    winter: { leaves: null, trunk: '#654321', vines: '#228B22', snow: '#FFFFFF' }
                },
                size: { width: 72, height: 84 },
                variations: ['weeping', 'upright', 'river']
            },
            maple: {
                name: 'Maple Tree',
                seasons: {
                    spring: { leaves: '#7CFC00', trunk: '#8B4513', flowers: '#FFB6C1' },
                    summer: { leaves: '#FF0000', trunk: '#8B4513', flowers: null },
                    autumn: { leaves: '#DC143C', trunk: '#8B4513', flowers: null },
                    winter: { leaves: null, trunk: '#654321', flowers: null, snow: '#FFFFFF' }
                },
                size: { width: 60, height: 90 },
                variations: ['japanese', 'sugar', 'red']
            }
        };

        // Plant database
        this.plantDatabase = {
            flower: {
                rose: { name: 'Rose', colors: ['#FF0000', '#FFFFFF', '#FFFF00', '#FF69B4'], stem: '#228B22' },
                tulip: { name: 'Tulip', colors: ['#FF0000', '#FFA500', '#FFFF00', '#9370DB'], stem: '#228B22' },
                daisy: { name: 'Daisy', colors: ['#FFFFFF', '#FFFF00'], stem: '#228B22' },
                sunflower: { name: 'Sunflower', colors: ['#FFD700'], stem: '#228B22' }
            },
            bush: {
                berry: { name: 'Berry Bush', colors: ['#228B22', '#8B0000'], berries: ['#FF0000', '#8B0000'] },
                rose: { name: 'Rose Bush', colors: ['#228B22'], flowers: ['#FF0000', '#FFFFFF', '#FFB6C1'] },
                lavender: { name: 'Lavender Bush', colors: ['#9370DB'], flowers: ['#9370DB', '#DDA0DD'] }
            },
            grass: {
                tall: { name: 'Tall Grass', colors: ['#228B22', '#32CD32', '#006400'] },
                wheat: { name: 'Wheat', colors: ['#DEB887', '#D2691E'] },
                reed: { name: 'Reed', colors: ['#228B22', '#98FB98'] }
            },
            mushroom: {
                common: { name: 'Common Mushroom', cap: ['#8B4513', '#D2691E'], stem: '#F5DEB3' },
                poisonous: { name: 'Poisonous Mushroom', cap: ['#FF0000', '#8B0000'], stem: '#F5DEB3' },
                glowing: { name: 'Glowing Mushroom', cap: ['#FFFF00', '#FFD700'], stem: '#F5DEB3', glow: '#FFFF00' }
            }
        };

        // Rock and mineral database
        this.rockDatabase = {
            boulder: {
                granite: { name: 'Granite Boulder', colors: ['#696969', '#808080', '#A9A9A9'], texture: 'rough' },
                limestone: { name: 'Limestone Boulder', colors: ['#F5F5DC', '#FFFACD'], texture: 'smooth' },
                sandstone: { name: 'Sandstone Boulder', colors: ['#DEB887', '#D2B48C'], texture: 'layered' }
            },
            crystal: {
                quartz: { name: 'Quartz Crystal', colors: ['#FFFFFF', '#87CEEB', '#9370DB'], glow: true },
                amethyst: { name: 'Amethyst Crystal', colors: ['#9370DB', '#8A2BE2'], glow: true },
                ruby: { name: 'Ruby Crystal', colors: ['#DC143C', '#FF0000'], glow: true }
            },
            ore: {
                copper: { name: 'Copper Ore', colors: ['#B87333', '#CD853F'], veins: '#FF6347' },
                iron: { name: 'Iron Ore', colors: ['#696969', '#808080'], veins: '#FF4500' },
                gold: { name: 'Gold Ore', colors: ['#DAA520', '#FFD700'], veins: '#FFFF00' },
                mithril: { name: 'Mithril Ore', colors: ['#C0C0C0', '#F5F5F5'], veins: '#E6E6FA' }
            }
        };
    }

    /**
     * Main generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Determine asset type and generate accordingly
        const assetType = config.assetType || 'tree';
        const subType = config.subType || 'oak';

        switch (assetType) {
            case 'tree':
                await this.generateTree(image, config);
                break;
            case 'plant':
                await this.generatePlant(image, config);
                break;
            case 'rock':
                await this.generateRock(image, config);
                break;
            case 'crystal':
                await this.generateCrystal(image, config);
                break;
            case 'ore':
                await this.generateOre(image, config);
                break;
            default:
                await this.generateTree(image, config);
        }
    }

    /**
     * Generate tree with seasonal variations
     */
    async generateTree(image, config) {
        const { width, height } = image.bitmap;
        const treeType = config.treeType || 'oak';
        const season = config.season || 'summer';
        const variation = config.variation || 'mature';

        const treeData = this.treeDatabase[treeType];
        if (!treeData) return;

        const seasonData = treeData.seasons[season];
        const treeWidth = treeData.size.width;
        const treeHeight = treeData.size.height;

        // Generate trunk
        const trunkWidth = Math.floor(treeWidth * 0.15);
        const trunkHeight = Math.floor(treeHeight * 0.6);
        const trunkX = Math.floor((width - trunkWidth) * 0.5);
        const trunkY = height - trunkHeight;

        this.utils.drawRectangle(image, trunkX, trunkY, trunkWidth, trunkHeight, this.utils.getColor(seasonData.trunk));

        // Add bark texture
        if (seasonData.bark) {
            for (let i = 0; i < 5; i++) {
                const barkX = trunkX + Math.floor(Math.random() * trunkWidth);
                const barkY = trunkY + Math.floor(Math.random() * trunkHeight);
                const barkWidth = Math.floor(trunkWidth * 0.1);
                const barkHeight = Math.floor(trunkHeight * 0.1);
                this.utils.drawRectangle(image, barkX, barkY, barkWidth, barkHeight, this.utils.getColor(seasonData.bark));
            }
        }

        // Generate foliage based on tree type
        switch (treeType) {
            case 'oak':
                await this.generateOakFoliage(image, seasonData, width, height, treeWidth, treeHeight);
                break;
            case 'pine':
                await this.generatePineFoliage(image, seasonData, width, height, treeWidth, treeHeight);
                break;
            case 'birch':
                await this.generateBirchFoliage(image, seasonData, width, height, treeWidth, treeHeight);
                break;
            case 'palm':
                await this.generatePalmFoliage(image, seasonData, width, height, treeWidth, treeHeight);
                break;
            case 'willow':
                await this.generateWillowFoliage(image, seasonData, width, height, treeWidth, treeHeight);
                break;
            case 'maple':
                await this.generateMapleFoliage(image, seasonData, width, height, treeWidth, treeHeight);
                break;
        }

        // Add seasonal effects
        if (season === 'winter' && seasonData.snow) {
            await this.addSnowEffect(image, seasonData.snow);
        }

        if (season === 'spring' && seasonData.flowers) {
            await this.addFlowerEffect(image, seasonData.flowers, treeType);
        }
    }

    /**
     * Generate oak tree foliage
     */
    async generateOakFoliage(image, seasonData, width, height, treeWidth, treeHeight) {
        if (!seasonData.leaves) return;

        const leafColor = this.utils.getColor(seasonData.leaves);
        const crownWidth = Math.floor(treeWidth * 0.8);
        const crownHeight = Math.floor(treeHeight * 0.5);
        const crownX = Math.floor((width - crownWidth) * 0.5);
        const crownY = Math.floor(height * 0.2);

        // Main crown
        this.utils.drawEllipse(image, Math.floor(width * 0.5), crownY + crownHeight * 0.5, crownWidth * 0.5, crownHeight * 0.5, leafColor);

        // Additional leaf clusters
        for (let i = 0; i < 3; i++) {
            const clusterX = crownX + Math.floor(Math.random() * crownWidth);
            const clusterY = crownY + Math.floor(Math.random() * crownHeight * 0.8);
            const clusterSize = Math.floor(crownWidth * 0.3);
            this.utils.drawEllipse(image, clusterX, clusterY, clusterSize * 0.5, clusterSize * 0.4, leafColor);
        }
    }

    /**
     * Generate pine tree foliage
     */
    async generatePineFoliage(image, seasonData, width, height, treeWidth, treeHeight) {
        const needleColor = this.utils.getColor(seasonData.needles || seasonData.leaves);
        const trunkTop = height - Math.floor(treeHeight * 0.6);

        // Pine branches (triangular layers)
        for (let layer = 0; layer < 4; layer++) {
            const layerY = trunkTop - layer * Math.floor(treeHeight * 0.15);
            const layerWidth = Math.floor(treeWidth * (0.8 - layer * 0.1));
            const layerHeight = Math.floor(treeHeight * 0.12);

            // Draw triangular branch
            for (let y = layerY; y < layerY + layerHeight; y++) {
                const progress = (y - layerY) / layerHeight;
                const currentWidth = Math.floor(layerWidth * (1 - progress));
                const startX = Math.floor((width - currentWidth) * 0.5);

                for (let x = startX; x < startX + currentWidth; x++) {
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const idx = (y * width + x) * 4;
                        image.bitmap.data[idx] = (needleColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (needleColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = needleColor & 0xFF;
                        image.bitmap.data[idx + 3] = 255;
                    }
                }
            }
        }

        // Add cones if specified
        if (seasonData.cones) {
            const coneColor = this.utils.getColor(seasonData.cones);
            for (let i = 0; i < 3; i++) {
                const coneX = Math.floor(width * 0.5 + (Math.random() - 0.5) * treeWidth * 0.6);
                const coneY = trunkTop - Math.floor(Math.random() * treeHeight * 0.4);
                this.utils.drawEllipse(image, coneX, coneY, 3, 5, coneColor);
            }
        }
    }

    /**
     * Generate birch tree foliage
     */
    async generateBirchFoliage(image, seasonData, width, height, treeWidth, treeHeight) {
        if (!seasonData.leaves) return;

        const leafColor = this.utils.getColor(seasonData.leaves);
        const trunkTop = height - Math.floor(treeHeight * 0.6);

        // Birch has more delicate, rounded foliage
        for (let i = 0; i < 6; i++) {
            const clusterX = Math.floor(width * 0.5 + (Math.random() - 0.5) * treeWidth * 0.8);
            const clusterY = trunkTop - Math.floor(Math.random() * treeHeight * 0.5);
            const clusterSize = Math.floor(treeWidth * 0.2);
            this.utils.drawEllipse(image, clusterX, clusterY, clusterSize * 0.5, clusterSize * 0.4, leafColor);
        }
    }

    /**
     * Generate palm tree foliage
     */
    async generatePalmFoliage(image, seasonData, width, height, treeWidth, treeHeight) {
        const leafColor = this.utils.getColor(seasonData.leaves);
        const trunkTop = height - Math.floor(treeHeight * 0.6);

        // Palm fronds
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const frondLength = Math.floor(treeWidth * 0.6);
            const frondWidth = Math.floor(treeWidth * 0.08);

            // Draw curved frond
            for (let j = 0; j < frondLength; j++) {
                const curve = Math.sin(j / frondLength * Math.PI) * 0.3;
                const x = Math.floor(width * 0.5 + Math.cos(angle) * j + Math.cos(angle + Math.PI * 0.5) * curve * j);
                const y = trunkTop - Math.floor(Math.sin(angle) * j + Math.sin(angle + Math.PI * 0.5) * curve * j);

                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx] = (leafColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (leafColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = leafColor & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }

        // Add coconuts if specified
        if (seasonData.coconuts) {
            const coconutColor = this.utils.getColor(seasonData.coconuts);
            for (let i = 0; i < 3; i++) {
                const coconutX = Math.floor(width * 0.5 + (Math.random() - 0.5) * treeWidth * 0.4);
                const coconutY = trunkTop - Math.floor(Math.random() * treeHeight * 0.3);
                this.utils.drawEllipse(image, coconutX, coconutY, 4, 4, coconutColor);
            }
        }
    }

    /**
     * Generate willow tree foliage
     */
    async generateWillowFoliage(image, seasonData, width, height, treeWidth, treeHeight) {
        if (!seasonData.leaves) return;

        const leafColor = this.utils.getColor(seasonData.leaves);
        const vineColor = this.utils.getColor(seasonData.vines);
        const trunkTop = height - Math.floor(treeHeight * 0.6);

        // Weeping willow style - drooping branches
        for (let branch = 0; branch < 5; branch++) {
            const branchStartX = Math.floor(width * 0.5 + (Math.random() - 0.5) * treeWidth * 0.3);
            const branchStartY = trunkTop - Math.floor(Math.random() * treeHeight * 0.2);
            const branchLength = Math.floor(treeWidth * 0.5);

            // Draw drooping branch
            for (let i = 0; i < branchLength; i++) {
                const sag = Math.sin(i / branchLength * Math.PI) * 0.5;
                const x = branchStartX + i - branchLength * 0.5;
                const y = branchStartY + Math.floor(sag * treeHeight * 0.2);

                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx] = (vineColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (vineColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = vineColor & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }

                // Add leaves along branch
                if (i % 3 === 0) {
                    const leafX = x + Math.floor((Math.random() - 0.5) * 6);
                    const leafY = y + Math.floor((Math.random() - 0.5) * 6);
                    if (leafX >= 0 && leafX < width && leafY >= 0 && leafY < height) {
                        const leafIdx = (leafY * width + leafX) * 4;
                        image.bitmap.data[leafIdx] = (leafColor >> 16) & 0xFF;
                        image.bitmap.data[leafIdx + 1] = (leafColor >> 8) & 0xFF;
                        image.bitmap.data[leafIdx + 2] = leafColor & 0xFF;
                        image.bitmap.data[leafIdx + 3] = 255;
                    }
                }
            }
        }
    }

    /**
     * Generate maple tree foliage
     */
    async generateMapleFoliage(image, seasonData, width, height, treeWidth, treeHeight) {
        if (!seasonData.leaves) return;

        const leafColor = this.utils.getColor(seasonData.leaves);
        const trunkTop = height - Math.floor(treeHeight * 0.6);

        // Maple leaves - distinctive star shape
        for (let i = 0; i < 8; i++) {
            const leafX = Math.floor(width * 0.5 + (Math.random() - 0.5) * treeWidth * 0.8);
            const leafY = trunkTop - Math.floor(Math.random() * treeHeight * 0.5);
            const leafSize = Math.floor(treeWidth * 0.15);

            // Draw star-shaped maple leaf
            this.drawMapleLeaf(image, leafX, leafY, leafSize, leafColor);
        }
    }

    /**
     * Draw a maple leaf shape
     */
    drawMapleLeaf(image, centerX, centerY, size, color) {
        const { width, height } = image.bitmap;

        // Main leaf lobes
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI * 0.25) {
            const lobeX = centerX + Math.cos(angle) * size * 0.5;
            const lobeY = centerY + Math.sin(angle) * size * 0.5;

            this.utils.drawEllipse(image, lobeX, lobeY, size * 0.3, size * 0.4, color);
        }

        // Stem
        this.utils.drawRectangle(image, centerX - 1, centerY, 2, size * 0.6, color);
    }

    /**
     * Add snow effect to tree
     */
    async addSnowEffect(image, snowColor) {
        const { width, height } = image.bitmap;
        const snow = this.utils.getColor(snowColor);

        // Add snow to branches and ground
        for (let y = Math.floor(height * 0.8); y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < 0.1) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx] = (snow >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (snow >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = snow & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }
    }

    /**
     * Add flower effect to tree
     */
    async addFlowerEffect(image, flowerColor, treeType) {
        const { width, height } = image.bitmap;
        const flower = this.utils.getColor(flowerColor);

        // Add flowers to appropriate parts of tree
        const flowerCount = treeType === 'oak' ? 5 : 3;

        for (let i = 0; i < flowerCount; i++) {
            const flowerX = Math.floor(width * 0.5 + (Math.random() - 0.5) * width * 0.6);
            const flowerY = Math.floor(height * 0.3 + Math.random() * height * 0.4);
            const flowerSize = Math.floor(width * 0.03);

            this.utils.drawEllipse(image, flowerX, flowerY, flowerSize, flowerSize, flower);
        }
    }

    /**
     * Generate plant
     */
    async generatePlant(image, config) {
        const { width, height } = image.bitmap;
        const plantType = config.plantType || 'flower';
        const subType = config.subType || 'rose';

        switch (plantType) {
            case 'flower':
                await this.generateFlower(image, config);
                break;
            case 'bush':
                await this.generateBush(image, config);
                break;
            case 'grass':
                await this.generateGrass(image, config);
                break;
            case 'mushroom':
                await this.generateMushroom(image, config);
                break;
            default:
                await this.generateFlower(image, config);
        }
    }

    /**
     * Generate flower
     */
    async generateFlower(image, config) {
        const { width, height } = image.bitmap;
        const flowerType = config.flowerType || 'rose';

        const flowerData = this.plantDatabase.flower[flowerType];
        if (!flowerData) return;

        const flowerColor = this.utils.getColor(flowerData.colors[Math.floor(Math.random() * flowerData.colors.length)]);
        const stemColor = this.utils.getColor(flowerData.stem);

        // Stem
        const stemWidth = Math.floor(width * 0.02);
        const stemHeight = Math.floor(height * 0.6);
        const stemX = Math.floor(width * 0.5 - stemWidth * 0.5);
        const stemY = Math.floor(height * 0.4);

        this.utils.drawRectangle(image, stemX, stemY, stemWidth, stemHeight, stemColor);

        // Flower head
        const flowerSize = Math.floor(width * 0.15);
        const flowerX = Math.floor(width * 0.5);
        const flowerY = Math.floor(height * 0.35);

        // Petals
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const petalX = flowerX + Math.cos(angle) * flowerSize * 0.5;
            const petalY = flowerY + Math.sin(angle) * flowerSize * 0.5;
            this.utils.drawEllipse(image, petalX, petalY, flowerSize * 0.3, flowerSize * 0.4, flowerColor);
        }

        // Center
        const centerColor = this.utils.getColor('#FFFF00');
        this.utils.drawEllipse(image, flowerX, flowerY, flowerSize * 0.2, flowerSize * 0.2, centerColor);
    }

    /**
     * Generate bush
     */
    async generateBush(image, config) {
        const { width, height } = image.bitmap;
        const bushType = config.bushType || 'berry';

        const bushData = this.plantDatabase.bush[bushType];
        if (!bushData) return;

        const bushColor = this.utils.getColor(bushData.colors[Math.floor(Math.random() * bushData.colors.length)]);

        // Bush shape
        const bushWidth = Math.floor(width * 0.8);
        const bushHeight = Math.floor(height * 0.6);
        const bushX = Math.floor((width - bushWidth) * 0.5);
        const bushY = Math.floor(height * 0.4);

        this.utils.drawEllipse(image, Math.floor(width * 0.5), bushY + bushHeight * 0.5, bushWidth * 0.5, bushHeight * 0.5, bushColor);

        // Add berries or flowers
        if (bushData.berries) {
            const berryColor = this.utils.getColor(bushData.berries[Math.floor(Math.random() * bushData.berries.length)]);
            for (let i = 0; i < 8; i++) {
                const berryX = bushX + Math.floor(Math.random() * bushWidth);
                const berryY = bushY + Math.floor(Math.random() * bushHeight);
                this.utils.drawEllipse(image, berryX, berryY, 3, 3, berryColor);
            }
        }

        if (bushData.flowers) {
            const flowerColor = this.utils.getColor(bushData.flowers[Math.floor(Math.random() * bushData.flowers.length)]);
            for (let i = 0; i < 5; i++) {
                const flowerX = bushX + Math.floor(Math.random() * bushWidth);
                const flowerY = bushY + Math.floor(Math.random() * bushHeight);
                this.utils.drawEllipse(image, flowerX, flowerY, 4, 4, flowerColor);
            }
        }
    }

    /**
     * Generate grass
     */
    async generateGrass(image, config) {
        const { width, height } = image.bitmap;
        const grassType = config.grassType || 'tall';

        const grassData = this.plantDatabase.grass[grassType];
        if (!grassData) return;

        const grassColor = this.utils.getColor(grassData.colors[Math.floor(Math.random() * grassData.colors.length)]);

        // Generate grass blades
        for (let i = 0; i < 15; i++) {
            const bladeX = Math.floor(Math.random() * width);
            const bladeHeight = Math.floor(height * (0.3 + Math.random() * 0.4));
            const bladeY = height - bladeHeight;

            // Draw curved grass blade
            for (let j = 0; j < bladeHeight; j++) {
                const curve = Math.sin(j / bladeHeight * Math.PI) * 0.2;
                const x = bladeX + Math.floor(curve * width * 0.05);
                const y = bladeY + j;

                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const idx = (y * width + x) * 4;
                    image.bitmap.data[idx] = (grassColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (grassColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = grassColor & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }
    }

    /**
     * Generate mushroom
     */
    async generateMushroom(image, config) {
        const { width, height } = image.bitmap;
        const mushroomType = config.mushroomType || 'common';

        const mushroomData = this.plantDatabase.mushroom[mushroomType];
        if (!mushroomData) return;

        const capColor = this.utils.getColor(mushroomData.cap[Math.floor(Math.random() * mushroomData.cap.length)]);
        const stemColor = this.utils.getColor(mushroomData.stem);

        // Stem
        const stemWidth = Math.floor(width * 0.08);
        const stemHeight = Math.floor(height * 0.6);
        const stemX = Math.floor(width * 0.5 - stemWidth * 0.5);
        const stemY = Math.floor(height * 0.4);

        this.utils.drawRectangle(image, stemX, stemY, stemWidth, stemHeight, stemColor);

        // Cap
        const capWidth = Math.floor(width * 0.25);
        const capHeight = Math.floor(height * 0.2);
        const capX = Math.floor(width * 0.5);
        const capY = Math.floor(height * 0.35);

        this.utils.drawEllipse(image, capX, capY, capWidth * 0.5, capHeight * 0.5, capColor);

        // Add glow effect for glowing mushrooms
        if (mushroomData.glow) {
            const glowColor = this.utils.getColor(mushroomData.glow);
            this.utils.applyGlow(image, capX, capY, capWidth * 0.3, glowColor, 0.5);
        }
    }

    /**
     * Generate rock
     */
    async generateRock(image, config) {
        const { width, height } = image.bitmap;
        const rockType = config.rockType || 'boulder';
        const subType = config.subType || 'granite';

        const rockData = this.rockDatabase[rockType][subType];
        if (!rockData) return;

        const rockColor = this.utils.getColor(rockData.colors[Math.floor(Math.random() * rockData.colors.length)]);

        // Generate irregular rock shape
        const rockWidth = Math.floor(width * 0.8);
        const rockHeight = Math.floor(height * 0.6);
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.6);

        // Create irregular shape using multiple overlapping ellipses
        for (let i = 0; i < 5; i++) {
            const offsetX = Math.floor((Math.random() - 0.5) * rockWidth * 0.3);
            const offsetY = Math.floor((Math.random() - 0.5) * rockHeight * 0.3);
            const sizeX = Math.floor(rockWidth * (0.4 + Math.random() * 0.4));
            const sizeY = Math.floor(rockHeight * (0.4 + Math.random() * 0.4));

            this.utils.drawEllipse(image, centerX + offsetX, centerY + offsetY, sizeX * 0.5, sizeY * 0.5, rockColor);
        }

        // Add texture based on rock type
        if (rockData.texture === 'rough') {
            await this.addRoughTexture(image, rockColor);
        } else if (rockData.texture === 'layered') {
            await this.addLayeredTexture(image, rockColor);
        }
    }

    /**
     * Generate crystal
     */
    async generateCrystal(image, config) {
        const { width, height } = image.bitmap;
        const crystalType = config.crystalType || 'quartz';

        const crystalData = this.rockDatabase.crystal[crystalType];
        if (!crystalData) return;

        const crystalColor = this.utils.getColor(crystalData.colors[Math.floor(Math.random() * crystalData.colors.length)]);

        // Generate crystal facets
        const crystalHeight = Math.floor(height * 0.8);
        const crystalWidth = Math.floor(width * 0.4);
        const centerX = Math.floor(width * 0.5);
        const baseY = height - Math.floor(height * 0.1);

        // Draw crystal as a series of connected facets
        const facets = 6;
        for (let i = 0; i < facets; i++) {
            const angle = (i * Math.PI * 2) / facets;
            const nextAngle = ((i + 1) * Math.PI * 2) / facets;

            // Top point
            const topX = centerX;
            const topY = baseY - crystalHeight;

            // Base points
            const baseX1 = centerX + Math.cos(angle) * crystalWidth * 0.5;
            const baseY1 = baseY;
            const baseX2 = centerX + Math.cos(nextAngle) * crystalWidth * 0.5;
            const baseY2 = baseY;

            // Draw facet
            this.drawTriangle(image, topX, topY, baseX1, baseY1, baseX2, baseY2, crystalColor);
        }

        // Add glow effect if crystal glows
        if (crystalData.glow) {
            this.utils.applyGlow(image, centerX, baseY - crystalHeight * 0.5, crystalWidth * 0.3, crystalColor, 0.6);
        }
    }

    /**
     * Generate ore
     */
    async generateOre(image, config) {
        const { width, height } = image.bitmap;
        const oreType = config.oreType || 'copper';

        const oreData = this.rockDatabase.ore[oreType];
        if (!oreData) return;

        const baseColor = this.utils.getColor(oreData.colors[Math.floor(Math.random() * oreData.colors.length)]);
        const veinColor = this.utils.getColor(oreData.veins);

        // Generate base rock
        const rockWidth = Math.floor(width * 0.8);
        const rockHeight = Math.floor(height * 0.6);
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.6);

        this.utils.drawEllipse(image, centerX, centerY, rockWidth * 0.5, rockHeight * 0.5, baseColor);

        // Add ore veins
        for (let i = 0; i < 8; i++) {
            const veinStartX = centerX + Math.floor((Math.random() - 0.5) * rockWidth * 0.6);
            const veinStartY = centerY + Math.floor((Math.random() - 0.5) * rockHeight * 0.6);
            const veinLength = Math.floor(Math.random() * rockWidth * 0.3) + 10;

            // Draw vein as a series of connected points
            for (let j = 0; j < veinLength; j++) {
                const veinX = veinStartX + Math.floor((Math.random() - 0.5) * 4);
                const veinY = veinStartY + j;

                if (veinX >= 0 && veinX < width && veinY >= 0 && veinY < height) {
                    const idx = (veinY * width + veinX) * 4;
                    image.bitmap.data[idx] = (veinColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (veinColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = veinColor & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }
    }

    /**
     * Draw triangle
     */
    drawTriangle(image, x1, y1, x2, y2, x3, y3, color) {
        const { width, height } = image.bitmap;

        // Simple triangle fill using barycentric coordinates
        const minX = Math.min(x1, x2, x3);
        const maxX = Math.max(x1, x2, x3);
        const minY = Math.min(y1, y2, y3);
        const maxY = Math.max(y1, y2, y3);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (this.pointInTriangle(x, y, x1, y1, x2, y2, x3, y3)) {
                        const idx = (y * width + x) * 4;
                        image.bitmap.data[idx] = (color >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (color >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = color & 0xFF;
                        image.bitmap.data[idx + 3] = 255;
                    }
                }
            }
        }
    }

    /**
     * Check if point is inside triangle
     */
    pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
        const area = 0.5 * (-y2 * x3 + y1 * (-x2 + x3) + x1 * (y2 - y3) + x2 * y3);
        const s = 1 / (2 * area) * (y1 * x3 - x1 * y3 + (y3 - y1) * px + (x1 - x3) * py);
        const t = 1 / (2 * area) * (x1 * y2 - y1 * x2 + (y1 - y2) * px + (x2 - x1) * py);

        return s >= 0 && t >= 0 && (s + t) <= 1;
    }

    /**
     * Add rough texture to rock
     */
    async addRoughTexture(image, baseColor) {
        const { width, height } = image.bitmap;
        const darkerColor = this.utils.adjustBrightness(baseColor, -30);
        const lighterColor = this.utils.adjustBrightness(baseColor, 30);

        // Add random texture variations
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < 0.15) {
                    const idx = (y * width + x) * 4;
                    const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                    if (currentColor !== 0) { // Not transparent
                        const textureColor = Math.random() < 0.5 ? darkerColor : lighterColor;
                        image.bitmap.data[idx] = (textureColor >> 16) & 0xFF;
                        image.bitmap.data[idx + 1] = (textureColor >> 8) & 0xFF;
                        image.bitmap.data[idx + 2] = textureColor & 0xFF;
                    }
                }
            }
        }
    }

    /**
     * Add layered texture to rock
     */
    async addLayeredTexture(image, baseColor) {
        const { width, height } = image.bitmap;
        const layerColors = [
            this.utils.adjustBrightness(baseColor, -20),
            baseColor,
            this.utils.adjustBrightness(baseColor, -10),
            this.utils.adjustBrightness(baseColor, 10)
        ];

        // Add horizontal layers
        for (let y = 0; y < height; y++) {
            const layerIndex = Math.floor((y / height) * layerColors.length);
            const layerColor = layerColors[layerIndex];

            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const currentColor = image.bitmap.data[idx] << 16 | image.bitmap.data[idx + 1] << 8 | image.bitmap.data[idx + 2];

                if (currentColor !== 0 && Math.random() < 0.3) {
                    image.bitmap.data[idx] = (layerColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (layerColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = layerColor & 0xFF;
                }
            }
        }
    }
}

module.exports = NatureGenerator;
