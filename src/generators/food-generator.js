/**
 * Food Generator - Complete food and consumable sprite generation system
 * Generates various food items with cooking states, nutritional values, and quality variations
 */

const Jimp = require('jimp');
const path = require('path');

class FoodGenerator {
    constructor() {
        this.foodTypes = {
            BREAD: 'bread',
            FRUITS: 'fruits',
            VEGETABLES: 'vegetables',
            MEATS: 'meats',
            DAIRY: 'dairy',
            PREPARED: 'prepared',
            DESSERTS: 'desserts',
            BEVERAGES: 'beverages'
        };

        this.cookingStates = {
            RAW: 'raw',
            COOKED: 'cooked',
            BURNT: 'burnt',
            SPOILED: 'spoiled',
            FRESH: 'fresh',
            STALE: 'stale',
            ROTTEN: 'rotten'
        };

        this.qualityLevels = {
            POOR: 'poor',
            COMMON: 'common',
            GOOD: 'good',
            EXCELLENT: 'excellent',
            PERFECT: 'perfect'
        };

        this.nutritionalTypes = {
            CARBOHYDRATE: 'carbohydrate',
            PROTEIN: 'protein',
            FAT: 'fat',
            VITAMIN: 'vitamin',
            MINERAL: 'mineral',
            FIBER: 'fiber'
        };

        // Bread and baked goods templates
        this.breadTemplates = {
            LOAF: {
                name: 'Loaf of Bread',
                description: 'A standard loaf of bread',
                baseNutrition: 200,
                weight: 500,
                shelfLife: 5,
                cookingTime: 30,
                features: ['slicing', 'toasting', 'sandwiches']
            },
            ROLL: {
                name: 'Bread Roll',
                description: 'A small round bread roll',
                baseNutrition: 150,
                weight: 80,
                shelfLife: 3,
                cookingTime: 15,
                features: ['portable', 'quick', 'versatile']
            },
            CAKE: {
                name: 'Cake',
                description: 'A sweet baked cake',
                baseNutrition: 350,
                weight: 800,
                shelfLife: 7,
                cookingTime: 45,
                features: ['sweet', 'celebration', 'sharing']
            },
            PIE: {
                name: 'Pie',
                description: 'A baked pie with filling',
                baseNutrition: 400,
                weight: 600,
                shelfLife: 4,
                cookingTime: 60,
                features: ['filling', 'crust', 'warm']
            },
            BAGUETTE: {
                name: 'Baguette',
                description: 'A long French bread',
                baseNutrition: 180,
                weight: 250,
                shelfLife: 2,
                cookingTime: 25,
                features: ['crispy', 'long', 'traditional']
            }
        };

        // Fruit templates
        this.fruitTemplates = {
            APPLE: {
                name: 'Apple',
                description: 'A crisp red apple',
                baseNutrition: 80,
                weight: 150,
                shelfLife: 14,
                colors: ['#FF0000', '#FFA500', '#008000'],
                features: ['crisp', 'juicy', 'versatile']
            },
            ORANGE: {
                name: 'Orange',
                description: 'A juicy citrus orange',
                baseNutrition: 60,
                weight: 130,
                shelfLife: 21,
                colors: ['#FFA500', '#FFD700'],
                features: ['citrus', 'vitamin_c', 'juicy']
            },
            BERRY: {
                name: 'Berries',
                description: 'Mixed berries',
                baseNutrition: 50,
                weight: 100,
                shelfLife: 5,
                colors: ['#8B0000', '#4B0082', '#000080'],
                features: ['antioxidants', 'small', 'sweet']
            },
            GRAPE: {
                name: 'Grapes',
                description: 'Bunch of grapes',
                baseNutrition: 70,
                weight: 200,
                shelfLife: 10,
                colors: ['#8B0000', '#4B0082', '#008000'],
                features: ['bunch', 'juicy', 'wine_making']
            },
            BANANA: {
                name: 'Banana',
                description: 'A yellow banana',
                baseNutrition: 90,
                weight: 120,
                shelfLife: 7,
                colors: ['#FFD700', '#FFFF00'],
                features: ['potassium', 'easy_peel', 'quick_energy']
            }
        };

        // Vegetable templates
        this.vegetableTemplates = {
            CARROT: {
                name: 'Carrot',
                description: 'An orange root vegetable',
                baseNutrition: 30,
                weight: 80,
                shelfLife: 21,
                colors: ['#FFA500', '#FF8C00'],
                features: ['vitamin_a', 'crunchy', 'versatile']
            },
            POTATO: {
                name: 'Potato',
                description: 'A starchy root vegetable',
                baseNutrition: 90,
                weight: 200,
                shelfLife: 30,
                colors: ['#8B4513', '#D2691E'],
                features: ['starchy', 'versatile', 'filling']
            },
            TOMATO: {
                name: 'Tomato',
                description: 'A red juicy fruit-vegetable',
                baseNutrition: 20,
                weight: 100,
                shelfLife: 7,
                colors: ['#FF0000', '#FF6347'],
                features: ['vitamin_c', 'juicy', 'versatile']
            },
            LETTUCE: {
                name: 'Lettuce',
                description: 'Crisp green lettuce leaves',
                baseNutrition: 15,
                weight: 150,
                shelfLife: 5,
                colors: ['#006400', '#228B22'],
                features: ['low_calorie', 'crisp', 'salads']
            },
            CABBAGE: {
                name: 'Cabbage',
                description: 'A round leafy vegetable',
                baseNutrition: 25,
                weight: 500,
                shelfLife: 14,
                colors: ['#006400', '#228B22', '#32CD32'],
                features: ['vitamin_k', 'long_shelf_life', 'versatile']
            }
        };

        // Meat templates
        this.meatTemplates = {
            STEAK: {
                name: 'Steak',
                description: 'A thick cut of beef',
                baseNutrition: 250,
                weight: 300,
                shelfLife: 3,
                cookingTime: 10,
                features: ['protein_rich', 'flavorful', 'premium']
            },
            CHICKEN: {
                name: 'Chicken',
                description: 'Chicken meat portions',
                baseNutrition: 180,
                weight: 200,
                shelfLife: 2,
                cookingTime: 20,
                features: ['lean', 'versatile', 'affordable']
            },
            FISH: {
                name: 'Fish',
                description: 'Fresh fish fillet',
                baseNutrition: 120,
                weight: 150,
                shelfLife: 1,
                cookingTime: 8,
                features: ['omega_3', 'lean', 'delicate']
            },
            SAUSAGE: {
                name: 'Sausage',
                description: 'Processed meat sausage',
                baseNutrition: 300,
                weight: 100,
                shelfLife: 7,
                cookingTime: 15,
                features: ['processed', 'flavorful', 'convenient']
            }
        };

        // Dairy templates
        this.dairyTemplates = {
            CHEESE: {
                name: 'Cheese',
                description: 'Aged cheese wedge',
                baseNutrition: 110,
                weight: 50,
                shelfLife: 30,
                features: ['calcium', 'protein', 'aged']
            },
            MILK: {
                name: 'Milk',
                description: 'Fresh milk',
                baseNutrition: 60,
                weight: 1000,
                shelfLife: 7,
                features: ['calcium', 'protein', 'fresh']
            },
            BUTTER: {
                name: 'Butter',
                description: 'Creamy butter',
                baseNutrition: 100,
                weight: 100,
                shelfLife: 14,
                features: ['fat', 'cooking', 'spreading']
            },
            YOGURT: {
                name: 'Yogurt',
                description: 'Creamy yogurt',
                baseNutrition: 80,
                weight: 150,
                shelfLife: 10,
                features: ['probiotics', 'calcium', 'creamy']
            }
        };

        // Prepared food templates
        this.preparedTemplates = {
            STEW: {
                name: 'Stew',
                description: 'Hearty meat and vegetable stew',
                baseNutrition: 300,
                weight: 400,
                shelfLife: 2,
                cookingTime: 90,
                features: ['hearty', 'warming', 'nutritious']
            },
            SOUP: {
                name: 'Soup',
                description: 'Broth-based soup',
                baseNutrition: 150,
                weight: 300,
                shelfLife: 3,
                cookingTime: 45,
                features: ['light', 'warming', 'versatile']
            },
            SANDWICH: {
                name: 'Sandwich',
                description: 'Bread with fillings',
                baseNutrition: 250,
                weight: 200,
                shelfLife: 1,
                features: ['portable', 'quick', 'customizable']
            },
            SALAD: {
                name: 'Salad',
                description: 'Mixed greens and vegetables',
                baseNutrition: 100,
                weight: 150,
                shelfLife: 1,
                features: ['healthy', 'fresh', 'light']
            }
        };

        // Nutritional profiles
        this.nutritionalProfiles = {
            [this.nutritionalTypes.CARBOHYDRATE]: {
                color: '#DEB887',
                energyDensity: 4,
                satiety: 0.7
            },
            [this.nutritionalTypes.PROTEIN]: {
                color: '#8B4513',
                energyDensity: 4,
                satiety: 0.9
            },
            [this.nutritionalTypes.FAT]: {
                color: '#FFD700',
                energyDensity: 9,
                satiety: 0.8
            },
            [this.nutritionalTypes.VITAMIN]: {
                color: '#FF6347',
                energyDensity: 0,
                satiety: 0.1
            },
            [this.nutritionalTypes.MINERAL]: {
                color: '#708090',
                energyDensity: 0,
                satiety: 0.1
            },
            [this.nutritionalTypes.FIBER]: {
                color: '#228B22',
                energyDensity: 2,
                satiety: 0.8
            }
        };
    }

    /**
     * Generate a food item sprite
     */
    async generate(options = {}) {
        const config = {
            type: options.type || this.foodTypes.BREAD,
            subtype: options.subtype || 'LOAF',
            cookingState: options.cookingState || this.cookingStates.FRESH,
            quality: options.quality || this.qualityLevels.COMMON,
            quantity: options.quantity || 1,
            customizations: options.customizations || {},
            ...options
        };

        // Get appropriate template based on type
        let template;
        switch (config.type) {
            case this.foodTypes.BREAD:
                template = this.breadTemplates[config.subtype];
                break;
            case this.foodTypes.FRUITS:
                template = this.fruitTemplates[config.subtype];
                break;
            case this.foodTypes.VEGETABLES:
                template = this.vegetableTemplates[config.subtype];
                break;
            case this.foodTypes.MEATS:
                template = this.meatTemplates[config.subtype];
                break;
            case this.foodTypes.DAIRY:
                template = this.dairyTemplates[config.subtype];
                break;
            case this.foodTypes.PREPARED:
                template = this.preparedTemplates[config.subtype];
                break;
            default:
                template = this.breadTemplates.LOAF;
        }

        if (!template) {
            throw new Error(`Unknown food subtype: ${config.subtype}`);
        }

        // Calculate nutritional values
        const nutrition = this.calculateNutrition(template, config.quality, config.cookingState);

        // Generate food data
        const foodData = {
            id: this.generateFoodId(),
            name: this.generateFoodName(template.name, config.cookingState, config.quality),
            type: config.type,
            subtype: config.subtype,
            cookingState: config.cookingState,
            quality: config.quality,
            quantity: config.quantity,
            template: template,
            nutrition: nutrition,
            weight: template.weight * config.quantity,
            shelfLife: this.calculateShelfLife(template.shelfLife, config.cookingState),
            description: this.generateDescription(template, config.cookingState, config.quality),
            appearance: this.generateAppearance(template, config.cookingState, config.quality),
            effects: this.generateEffects(nutrition, config.cookingState)
        };

        // Generate sprite image
        const spriteImage = await this.generateFoodSprite(foodData, config);

        return {
            image: spriteImage,
            data: foodData,
            metadata: {
                generated: new Date().toISOString(),
                generator: 'FoodGenerator',
                version: '1.0'
            }
        };
    }

    /**
     * Generate food sprite image
     */
    async generateFoodSprite(foodData, config) {
        const width = config.width || 64;
        const height = config.height || 64;

        // Create base image
        const image = new Jimp(width, height, 0x00000000); // Transparent background

        // Draw food based on type
        await this.drawFoodBase(image, foodData, config);

        // Apply cooking state effects
        await this.applyCookingStateEffects(image, foodData.cookingState);

        // Apply quality effects
        if (foodData.quality !== this.qualityLevels.COMMON) {
            await this.applyQualityEffects(image, foodData.quality);
        }

        return image;
    }

    /**
     * Draw food base shape
     */
    async drawFoodBase(image, foodData, config) {
        const centerX = image.bitmap.width / 2;
        const centerY = image.bitmap.height / 2;
        const scale = config.quantity > 1 ? Math.min(1.5, 0.8 + config.quantity * 0.1) : 1.0;

        switch (foodData.type) {
            case this.foodTypes.BREAD:
                await this.drawBread(image, centerX, centerY, foodData.subtype, scale);
                break;
            case this.foodTypes.FRUITS:
                await this.drawFruit(image, centerX, centerY, foodData.subtype, scale);
                break;
            case this.foodTypes.VEGETABLES:
                await this.drawVegetable(image, centerX, centerY, foodData.subtype, scale);
                break;
            case this.foodTypes.MEATS:
                await this.drawMeat(image, centerX, centerY, foodData.subtype, scale);
                break;
            case this.foodTypes.DAIRY:
                await this.drawDairy(image, centerX, centerY, foodData.subtype, scale);
                break;
            case this.foodTypes.PREPARED:
                await this.drawPrepared(image, centerX, centerY, foodData.subtype, scale);
                break;
        }
    }

    /**
     * Draw bread
     */
    async drawBread(image, x, y, subtype, scale) {
        switch (subtype) {
            case 'LOAF':
                await this.drawLoaf(image, x, y, scale);
                break;
            case 'ROLL':
                await this.drawRoll(image, x, y, scale);
                break;
            case 'CAKE':
                await this.drawCake(image, x, y, scale);
                break;
            case 'PIE':
                await this.drawPie(image, x, y, scale);
                break;
            case 'BAGUETTE':
                await this.drawBaguette(image, x, y, scale);
                break;
            default:
                await this.drawLoaf(image, x, y, scale);
        }
    }

    /**
     * Draw loaf of bread
     */
    async drawLoaf(image, x, y, scale) {
        const width = 35 * scale;
        const height = 20 * scale;

        // Bread loaf shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        // Bread color with slight crust variation
                        const crust = Math.abs(j) > height * 0.3 ? 0.8 : 1.0;
                        const r = Math.floor(0xDEB887 * crust);
                        const g = Math.floor(0xDEB887 * crust);
                        const b = Math.floor(0xF4A460 * crust);
                        image.setPixelColor((r << 16) | (g << 8) | b | 0xFF000000, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw bread roll
     */
    async drawRoll(image, x, y, scale) {
        const radius = 8 * scale;

        // Circular roll shape
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFDEB887, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw cake
     */
    async drawCake(image, x, y, scale) {
        const width = 25 * scale;
        const height = 15 * scale;

        // Cake layers
        for (let layer = 0; layer < 3; layer++) {
            const layerY = y - 5 * scale + layer * 3 * scale;
            for (let i = -width / 2; i < width / 2; i++) {
                for (let j = -2; j < 2; j++) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(layerY + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        const color = layer === 0 ? 0xFFFF69B4 : layer === 1 ? 0xFF98FB98 : 0xFFFFD700;
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw pie
     */
    async drawPie(image, x, y, scale) {
        const radius = 12 * scale;

        // Pie filling
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < 0; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF8B0000, pixelX, pixelY); // Red filling
                    }
                }
            }
        }

        // Pie crust
        for (let i = -radius; i < radius; i++) {
            for (let j = 0; j < 3 * scale; j++) {
                if (Math.abs(i) < radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFDEB887, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw baguette
     */
    async drawBaguette(image, x, y, scale) {
        const width = 30 * scale;
        const height = 6 * scale;

        // Long thin bread shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFDEB887, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw fruit
     */
    async drawFruit(image, x, y, subtype, scale) {
        switch (subtype) {
            case 'APPLE':
                await this.drawApple(image, x, y, scale);
                break;
            case 'ORANGE':
                await this.drawOrange(image, x, y, scale);
                break;
            case 'BERRY':
                await this.drawBerries(image, x, y, scale);
                break;
            case 'GRAPE':
                await this.drawGrapes(image, x, y, scale);
                break;
            case 'BANANA':
                await this.drawBanana(image, x, y, scale);
                break;
            default:
                await this.drawApple(image, x, y, scale);
        }
    }

    /**
     * Draw apple
     */
    async drawApple(image, x, y, scale) {
        const radius = 8 * scale;

        // Apple shape
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFF0000, pixelX, pixelY);
                    }
                }
            }
        }

        // Stem
        for (let i = -1; i < 1; i++) {
            for (let j = -radius - 3; j < -radius; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw orange
     */
    async drawOrange(image, x, y, scale) {
        const radius = 7 * scale;

        // Orange shape
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFFA500, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw berries
     */
    async drawBerries(image, x, y, scale) {
        const berries = [
            { x: x - 5 * scale, y: y - 3 * scale, color: 0xFF8B0000 },
            { x: x + 2 * scale, y: y - 1 * scale, color: 0xFF4B0082 },
            { x: x + 3 * scale, y: y + 4 * scale, color: 0xFF000080 },
            { x: x - 3 * scale, y: y + 2 * scale, color: 0xFF8B0000 }
        ];

        for (const berry of berries) {
            const radius = 2 * scale;
            for (let i = -radius; i < radius; i++) {
                for (let j = -radius; j < radius; j++) {
                    if (i * i + j * j <= radius * radius) {
                        const pixelX = Math.floor(berry.x + i);
                        const pixelY = Math.floor(berry.y + j);
                        if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                            image.setPixelColor(berry.color, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw grapes
     */
    async drawGrapes(image, x, y, scale) {
        const grapes = [];
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const radius = 6 * scale;
            grapes.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                color: i % 2 === 0 ? 0xFF8B0000 : 0xFF4B0082
            });
        }

        for (const grape of grapes) {
            const radius = 2 * scale;
            for (let i = -radius; i < radius; i++) {
                for (let j = -radius; j < radius; j++) {
                    if (i * i + j * j <= radius * radius) {
                        const pixelX = Math.floor(grape.x + i);
                        const pixelY = Math.floor(grape.y + j);
                        if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                            image.setPixelColor(grape.color, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw banana
     */
    async drawBanana(image, x, y, scale) {
        const width = 12 * scale;
        const height = 4 * scale;

        // Curved banana shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const curve = Math.sin(i / width * Math.PI) * 2;
                if (Math.abs(j - curve) < height / 2) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFFD700, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw vegetable
     */
    async drawVegetable(image, x, y, subtype, scale) {
        switch (subtype) {
            case 'CARROT':
                await this.drawCarrot(image, x, y, scale);
                break;
            case 'POTATO':
                await this.drawPotato(image, x, y, scale);
                break;
            case 'TOMATO':
                await this.drawTomato(image, x, y, scale);
                break;
            case 'LETTUCE':
                await this.drawLettuce(image, x, y, scale);
                break;
            case 'CABBAGE':
                await this.drawCabbage(image, x, y, scale);
                break;
            default:
                await this.drawCarrot(image, x, y, scale);
        }
    }

    /**
     * Draw carrot
     */
    async drawCarrot(image, x, y, scale) {
        const width = 4 * scale;
        const height = 15 * scale;

        // Carrot shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = 0; j < height; j++) {
                const currentWidth = width * (1 - j / height * 0.7);
                if (Math.abs(i) < currentWidth / 2) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j - height / 2);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFFA500, pixelX, pixelY);
                    }
                }
            }
        }

        // Green tops
        for (let i = -2; i < 2; i++) {
            for (let j = -height / 2 - 5; j < -height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF006400, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw potato
     */
    async drawPotato(image, x, y, scale) {
        const radius = 6 * scale;

        // Irregular potato shape
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                const distortion = Math.sin(i * 0.3) * Math.cos(j * 0.3) * 1.5;
                if (i * i + j * j <= (radius + distortion) * (radius + distortion)) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF8B4513, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw tomato
     */
    async drawTomato(image, x, y, scale) {
        const radius = 6 * scale;

        // Tomato shape
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFF0000, pixelX, pixelY);
                    }
                }
            }
        }

        // Stem
        for (let i = -1; i < 1; i++) {
            for (let j = -radius - 2; j < -radius; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF006400, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw lettuce
     */
    async drawLettuce(image, x, y, scale) {
        const radius = 10 * scale;

        // Lettuce leaves
        for (let layer = 0; layer < 4; layer++) {
            const layerRadius = radius - layer * 2;
            for (let i = -layerRadius; i < layerRadius; i++) {
                for (let j = -layerRadius; j < layerRadius; j++) {
                    if (i * i + j * j <= layerRadius * layerRadius) {
                        const pixelX = Math.floor(x + i);
                        const pixelY = Math.floor(y + j);
                        if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                            const color = layer === 0 ? 0xFF228B22 : 0xFF32CD32;
                            image.setPixelColor(color, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw cabbage
     */
    async drawCabbage(image, x, y, scale) {
        const radius = 8 * scale;

        // Cabbage head
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF228B22, pixelX, pixelY);
                    }
                }
            }
        }

        // Leaf layers
        for (let layer = 1; layer < 3; layer++) {
            const layerRadius = radius + layer * 2;
            for (let i = -layerRadius; i < layerRadius; i++) {
                for (let j = -layerRadius; j < layerRadius; j++) {
                    if (i * i + j * j <= layerRadius * layerRadius && i * i + j * j > (layerRadius - 2) * (layerRadius - 2)) {
                        const pixelX = Math.floor(x + i);
                        const pixelY = Math.floor(y + j);
                        if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                            image.setPixelColor(0xFF32CD32, pixelX, pixelY);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw meat
     */
    async drawMeat(image, x, y, subtype, scale) {
        switch (subtype) {
            case 'STEAK':
                await this.drawSteak(image, x, y, scale);
                break;
            case 'CHICKEN':
                await this.drawChicken(image, x, y, scale);
                break;
            case 'FISH':
                await this.drawFish(image, x, y, scale);
                break;
            case 'SAUSAGE':
                await this.drawSausage(image, x, y, scale);
                break;
            default:
                await this.drawSteak(image, x, y, scale);
        }
    }

    /**
     * Draw steak
     */
    async drawSteak(image, x, y, scale) {
        const width = 20 * scale;
        const height = 12 * scale;

        // Steak shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF8B0000, pixelX, pixelY);
                    }
                }
            }
        }

        // Fat marbling
        for (let i = -width / 3; i < width / 3; i += 3 * scale) {
            for (let j = -height / 3; j < height / 3; j += 2 * scale) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFFFD700, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw chicken
     */
    async drawChicken(image, x, y, scale) {
        const width = 15 * scale;
        const height = 10 * scale;

        // Chicken piece shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFFD700, pixelX, pixelY);
                    }
                }
            }
        }

        // Bone
        for (let i = -2; i < 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFFFFFF0, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw fish
     */
    async drawFish(image, x, y, scale) {
        const width = 18 * scale;
        const height = 8 * scale;

        // Fish fillet shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const distFromCenter = Math.abs(i) / (width / 2) + Math.abs(j) / (height / 2);
                if (distFromCenter <= 1.0) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFFA500, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw sausage
     */
    async drawSausage(image, x, y, scale) {
        const width = 12 * scale;
        const height = 4 * scale;

        // Sausage shape
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFF8B4513, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw dairy
     */
    async drawDairy(image, x, y, subtype, scale) {
        switch (subtype) {
            case 'CHEESE':
                await this.drawCheese(image, x, y, scale);
                break;
            case 'MILK':
                await this.drawMilk(image, x, y, scale);
                break;
            case 'BUTTER':
                await this.drawButter(image, x, y, scale);
                break;
            case 'YOGURT':
                await this.drawYogurt(image, x, y, scale);
                break;
            default:
                await this.drawCheese(image, x, y, scale);
        }
    }

    /**
     * Draw cheese
     */
    async drawCheese(image, x, y, scale) {
        const width = 12 * scale;
        const height = 8 * scale;

        // Cheese wedge
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const triangleX = (i + width / 2) / width;
                const triangleY = (j + height / 2) / height;
                if (triangleX + triangleY <= 1.2) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFFD700, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw milk
     */
    async drawMilk(image, x, y, scale) {
        const width = 8 * scale;
        const height = 20 * scale;

        // Milk bottle/jug
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFFFFFFF, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw butter
     */
    async drawButter(image, x, y, scale) {
        const width = 10 * scale;
        const height = 6 * scale;

        // Butter pat
        for (let i = -width / 2; i < width / 2; i++) {
            for (let j = -height / 2; j < height / 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFFFD700, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Draw yogurt
     */
    async drawYogurt(image, x, y, scale) {
        const radius = 6 * scale;

        // Yogurt container
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFFFFFF, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw prepared food
     */
    async drawPrepared(image, x, y, subtype, scale) {
        switch (subtype) {
            case 'STEW':
                await this.drawStew(image, x, y, scale);
                break;
            case 'SOUP':
                await this.drawSoup(image, x, y, scale);
                break;
            case 'SANDWICH':
                await this.drawSandwich(image, x, y, scale);
                break;
            case 'SALAD':
                await this.drawSalad(image, x, y, scale);
                break;
            default:
                await this.drawStew(image, x, y, scale);
        }
    }

    /**
     * Draw stew
     */
    async drawStew(image, x, y, scale) {
        const radius = 10 * scale;

        // Stew bowl
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < 0; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF8B4513, pixelX, pixelY); // Brown stew
                    }
                }
            }
        }

        // Steam
        for (let i = -3; i < 3; i++) {
            for (let j = -radius - 5; j < -radius; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFE6E6FA, pixelX, pixelY); // Light steam
                }
            }
        }
    }

    /**
     * Draw soup
     */
    async drawSoup(image, x, y, scale) {
        const radius = 8 * scale;

        // Soup bowl
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < -2; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFFFFA500, pixelX, pixelY); // Orange soup
                    }
                }
            }
        }
    }

    /**
     * Draw sandwich
     */
    async drawSandwich(image, x, y, scale) {
        const width = 15 * scale;
        const height = 8 * scale;

        // Bread slices
        for (let layer = 0; layer < 3; layer++) {
            const layerY = y - 3 * scale + layer * 2 * scale;
            for (let i = -width / 2; i < width / 2; i++) {
                for (let j = -1; j < 1; j++) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(layerY + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        const color = layer === 1 ? 0xFFFF0000 : 0xFFDEB887; // Red filling, brown bread
                        image.setPixelColor(color, pixelX, pixelY);
                    }
                }
            }
        }
    }

    /**
     * Draw salad
     */
    async drawSalad(image, x, y, scale) {
        const radius = 9 * scale;

        // Bowl
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < -1; j++) {
                if (i * i + j * j <= radius * radius) {
                    const pixelX = Math.floor(x + i);
                    const pixelY = Math.floor(y + j);
                    if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                        image.setPixelColor(0xFF228B22, pixelX, pixelY); // Green salad
                    }
                }
            }
        }

        // Tomatoes
        for (let i = -2; i < 2; i++) {
            for (let j = -2; j < 2; j++) {
                const pixelX = Math.floor(x + i);
                const pixelY = Math.floor(y + j - 3);
                if (pixelX >= 0 && pixelX < image.bitmap.width && pixelY >= 0 && pixelY < image.bitmap.height) {
                    image.setPixelColor(0xFFFF0000, pixelX, pixelY);
                }
            }
        }
    }

    /**
     * Apply cooking state effects
     */
    async applyCookingStateEffects(image, cookingState) {
        switch (cookingState) {
            case this.cookingStates.COOKED:
                await this.applyCookedEffect(image);
                break;
            case this.cookingStates.BURNT:
                await this.applyBurntEffect(image);
                break;
            case this.cookingStates.SPOILED:
                await this.applySpoiledEffect(image);
                break;
            case this.cookingStates.STALE:
                await this.applyStaleEffect(image);
                break;
            case this.cookingStates.ROTTEN:
                await this.applyRottenEffect(image);
                break;
        }
    }

    /**
     * Apply quality effects
     */
    async applyQualityEffects(image, quality) {
        switch (quality) {
            case this.qualityLevels.POOR:
                await this.applyPoorQualityEffect(image);
                break;
            case this.qualityLevels.EXCELLENT:
                await this.applyExcellentQualityEffect(image);
                break;
            case this.qualityLevels.PERFECT:
                await this.applyPerfectQualityEffect(image);
                break;
        }
    }

    /**
     * Calculate nutrition
     */
    calculateNutrition(template, quality, cookingState) {
        let baseNutrition = template.baseNutrition;

        // Quality modifier
        const qualityMultiplier = {
            [this.qualityLevels.POOR]: 0.7,
            [this.qualityLevels.COMMON]: 1.0,
            [this.qualityLevels.GOOD]: 1.2,
            [this.qualityLevels.EXCELLENT]: 1.4,
            [this.qualityLevels.PERFECT]: 1.6
        };

        // Cooking state modifier
        const cookingMultiplier = {
            [this.cookingStates.RAW]: 0.8,
            [this.cookingStates.FRESH]: 1.0,
            [this.cookingStates.COOKED]: 1.1,
            [this.cookingStates.BURNT]: 0.5,
            [this.cookingStates.SPOILED]: 0.3,
            [this.cookingStates.STALE]: 0.7,
            [this.cookingStates.ROTTEN]: 0.2
        };

        const finalNutrition = Math.round(
            baseNutrition *
            qualityMultiplier[quality] *
            cookingMultiplier[cookingState]
        );

        return {
            calories: finalNutrition,
            protein: this.calculateProtein(template, finalNutrition),
            carbohydrates: this.calculateCarbs(template, finalNutrition),
            fat: this.calculateFat(template, finalNutrition),
            vitamins: this.calculateVitamins(template, quality),
            minerals: this.calculateMinerals(template, quality),
            fiber: this.calculateFiber(template, quality)
        };
    }

    /**
     * Calculate shelf life
     */
    calculateShelfLife(baseShelfLife, cookingState) {
        const modifiers = {
            [this.cookingStates.FRESH]: 1.0,
            [this.cookingStates.COOKED]: 0.5,
            [this.cookingStates.RAW]: 1.0,
            [this.cookingStates.STALE]: 0.3,
            [this.cookingStates.SPOILED]: 0.1,
            [this.cookingStates.ROTTEN]: 0.05,
            [this.cookingStates.BURNT]: 2.0
        };

        return Math.round(baseShelfLife * modifiers[cookingState]);
    }

    /**
     * Generate food ID
     */
    generateFoodId() {
        return 'food_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate food name
     */
    generateFoodName(baseName, cookingState, quality) {
        const cookingPrefixes = {
            [this.cookingStates.RAW]: 'Raw ',
            [this.cookingStates.COOKED]: 'Cooked ',
            [this.cookingStates.BURNT]: 'Burnt ',
            [this.cookingStates.FRESH]: '',
            [this.cookingStates.STALE]: 'Stale ',
            [this.cookingStates.SPOILED]: 'Spoiled ',
            [this.cookingStates.ROTTEN]: 'Rotten '
        };

        const qualityPrefixes = {
            [this.qualityLevels.POOR]: 'Poor Quality ',
            [this.qualityLevels.COMMON]: '',
            [this.qualityLevels.GOOD]: 'Good Quality ',
            [this.qualityLevels.EXCELLENT]: 'Excellent Quality ',
            [this.qualityLevels.PERFECT]: 'Perfect Quality '
        };

        return `${qualityPrefixes[quality]}${cookingPrefixes[cookingState]}${baseName}`.trim();
    }

    /**
     * Generate description
     */
    generateDescription(template, cookingState, quality) {
        const cookingDesc = {
            [this.cookingStates.FRESH]: 'fresh and crisp',
            [this.cookingStates.COOKED]: 'properly cooked',
            [this.cookingStates.RAW]: 'raw and uncooked',
            [this.cookingStates.BURNT]: 'overcooked and charred',
            [this.cookingStates.STALE]: 'dried out and stale',
            [this.cookingStates.SPOILED]: 'spoiled and unsafe',
            [this.cookingStates.ROTTEN]: 'rotten and decayed'
        };

        const qualityDesc = {
            [this.qualityLevels.POOR]: 'of poor quality',
            [this.qualityLevels.COMMON]: 'of standard quality',
            [this.qualityLevels.GOOD]: 'of good quality',
            [this.qualityLevels.EXCELLENT]: 'of excellent quality',
            [this.qualityLevels.PERFECT]: 'of perfect quality'
        };

        return `A ${cookingDesc[cookingState]} ${template.name.toLowerCase()} ${qualityDesc[quality]}.`;
    }

    /**
     * Generate appearance
     */
    generateAppearance(template, cookingState, quality) {
        const baseColors = template.colors || ['#8B4513'];

        return {
            primaryColor: baseColors[0],
            secondaryColor: baseColors[1] || baseColors[0],
            cookingState: cookingState,
            quality: quality,
            effects: this.generateVisualEffects(cookingState, quality)
        };
    }

    /**
     * Generate effects
     */
    generateEffects(nutrition, cookingState) {
        const effects = [];

        // Nutritional effects
        if (nutrition.calories > 300) {
            effects.push({ type: 'satiety', duration: 120, strength: 0.8 });
        }

        if (nutrition.protein > 20) {
            effects.push({ type: 'strength', duration: 60, strength: 0.3 });
        }

        if (cookingState === this.cookingStates.SPOILED) {
            effects.push({ type: 'poison', duration: 30, strength: 0.5 });
        }

        return effects;
    }

    /**
     * Calculate protein content
     */
    calculateProtein(template, totalNutrition) {
        const proteinRatios = {
            [this.foodTypes.MEATS]: 0.25,
            [this.foodTypes.DAIRY]: 0.20,
            [this.foodTypes.VEGETABLES]: 0.10,
            [this.foodTypes.FRUITS]: 0.05,
            [this.foodTypes.BREAD]: 0.12,
            [this.foodTypes.PREPARED]: 0.15
        };

        return Math.round(totalNutrition * (proteinRatios[template.type] || 0.10));
    }

    /**
     * Calculate carbohydrate content
     */
    calculateCarbs(template, totalNutrition) {
        const carbRatios = {
            [this.foodTypes.BREAD]: 0.60,
            [this.foodTypes.FRUITS]: 0.15,
            [this.foodTypes.VEGETABLES]: 0.08,
            [this.foodTypes.MEATS]: 0.02,
            [this.foodTypes.DAIRY]: 0.05,
            [this.foodTypes.PREPARED]: 0.25
        };

        return Math.round(totalNutrition * (carbRatios[template.type] || 0.20));
    }

    /**
     * Calculate fat content
     */
    calculateFat(template, totalNutrition) {
        const fatRatios = {
            [this.foodTypes.MEATS]: 0.20,
            [this.foodTypes.DAIRY]: 0.30,
            [this.foodTypes.BREAD]: 0.05,
            [this.foodTypes.FRUITS]: 0.02,
            [this.foodTypes.VEGETABLES]: 0.01,
            [this.foodTypes.PREPARED]: 0.15
        };

        return Math.round(totalNutrition * (fatRatios[template.type] || 0.10));
    }

    /**
     * Calculate vitamin content
     */
    calculateVitamins(template, quality) {
        const baseVitamins = {
            [this.foodTypes.FRUITS]: 15,
            [this.foodTypes.VEGETABLES]: 20,
            [this.foodTypes.MEATS]: 5,
            [this.foodTypes.DAIRY]: 10,
            [this.foodTypes.BREAD]: 3,
            [this.foodTypes.PREPARED]: 8
        };

        const qualityMultiplier = {
            [this.qualityLevels.POOR]: 0.5,
            [this.qualityLevels.COMMON]: 1.0,
            [this.qualityLevels.GOOD]: 1.3,
            [this.qualityLevels.EXCELLENT]: 1.6,
            [this.qualityLevels.PERFECT]: 2.0
        };

        return Math.round((baseVitamins[template.type] || 5) * qualityMultiplier[quality]);
    }

    /**
     * Calculate mineral content
     */
    calculateMinerals(template, quality) {
        const baseMinerals = {
            [this.foodTypes.VEGETABLES]: 12,
            [this.foodTypes.MEATS]: 8,
            [this.foodTypes.DAIRY]: 15,
            [this.foodTypes.FRUITS]: 6,
            [this.foodTypes.BREAD]: 4,
            [this.foodTypes.PREPARED]: 7
        };

        const qualityMultiplier = {
            [this.qualityLevels.POOR]: 0.5,
            [this.qualityLevels.COMMON]: 1.0,
            [this.qualityLevels.GOOD]: 1.3,
            [this.qualityLevels.EXCELLENT]: 1.6,
            [this.qualityLevels.PERFECT]: 2.0
        };

        return Math.round((baseMinerals[template.type] || 5) * qualityMultiplier[quality]);
    }

    /**
     * Calculate fiber content
     */
    calculateFiber(template, quality) {
        const baseFiber = {
            [this.foodTypes.VEGETABLES]: 8,
            [this.foodTypes.FRUITS]: 5,
            [this.foodTypes.BREAD]: 3,
            [this.foodTypes.MEATS]: 0,
            [this.foodTypes.DAIRY]: 0,
            [this.foodTypes.PREPARED]: 2
        };

        const qualityMultiplier = {
            [this.qualityLevels.POOR]: 0.7,
            [this.qualityLevels.COMMON]: 1.0,
            [this.qualityLevels.GOOD]: 1.2,
            [this.qualityLevels.EXCELLENT]: 1.4,
            [this.qualityLevels.PERFECT]: 1.6
        };

        return Math.round((baseFiber[template.type] || 1) * qualityMultiplier[quality]);
    }

    /**
     * Generate visual effects
     */
    generateVisualEffects(cookingState, quality) {
        const effects = [];

        if (cookingState === this.cookingStates.BURNT) {
            effects.push('charred');
        }

        if (cookingState === this.cookingStates.SPOILED) {
            effects.push('moldy');
        }

        if (quality === this.qualityLevels.PERFECT) {
            effects.push('glowing');
        }

        return effects;
    }

    // Placeholder methods for effects (would be implemented with actual image processing)
    async applyCookedEffect(image) { return image; }
    async applyBurntEffect(image) { return image; }
    async applySpoiledEffect(image) { return image; }
    async applyStaleEffect(image) { return image; }
    async applyRottenEffect(image) { return image; }
    async applyPoorQualityEffect(image) { return image; }
    async applyExcellentQualityEffect(image) { return image; }
    async applyPerfectQualityEffect(image) { return image; }

    /**
     * Batch generate food items
     */
    async batchGenerate(count = 10, options = {}) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                const food = await this.generate({
                    ...options,
                    seed: options.seed || Math.random()
                });
                results.push(food);
            } catch (error) {
                console.error(`Failed to generate food ${i}:`, error);
                results.push(null);
            }
        }

        return results.filter(f => f !== null);
    }

    /**
     * Generate food by specific criteria
     */
    async generateByCriteria(criteria) {
        const options = {};

        // Apply criteria
        if (criteria.type) options.type = criteria.type;
        if (criteria.subtype) options.subtype = criteria.subtype;
        if (criteria.cookingState) options.cookingState = criteria.cookingState;
        if (criteria.quality) options.quality = criteria.quality;
        if (criteria.quantity) options.quantity = criteria.quantity;

        // Generate with criteria
        return await this.generate(options);
    }

    /**
     * Get food statistics
     */
    getFoodStatistics() {
        return {
            totalTypes: Object.keys(this.foodTypes).length,
            totalBreadTypes: Object.keys(this.breadTemplates).length,
            totalFruitTypes: Object.keys(this.fruitTemplates).length,
            totalVegetableTypes: Object.keys(this.vegetableTemplates).length,
            totalMeatTypes: Object.keys(this.meatTemplates).length,
            totalDairyTypes: Object.keys(this.dairyTemplates).length,
            totalPreparedTypes: Object.keys(this.preparedTemplates).length,
            totalCookingStates: Object.keys(this.cookingStates).length,
            totalQualityLevels: Object.keys(this.qualityLevels).length
        };
    }

    /**
     * Export food data
     */
    async exportFoodData(food, outputPath) {
        const exportData = {
            ...food.data,
            exportDate: new Date().toISOString(),
            spritePath: outputPath
        };

        // Save food data as JSON
        const dataPath = outputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.json');
        await require('fs').promises.writeFile(dataPath, JSON.stringify(exportData, null, 2), 'utf8');

        return dataPath;
    }

    /**
     * Validate food configuration
     */
    validateFoodConfig(config) {
        const errors = [];

        if (config.type && !Object.values(this.foodTypes).includes(config.type)) {
            errors.push(`Invalid food type: ${config.type}`);
        }

        if (config.cookingState && !Object.values(this.cookingStates).includes(config.cookingState)) {
            errors.push(`Invalid cooking state: ${config.cookingState}`);
        }

        if (config.quality && !Object.values(this.qualityLevels).includes(config.quality)) {
            errors.push(`Invalid quality level: ${config.quality}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = FoodGenerator;
