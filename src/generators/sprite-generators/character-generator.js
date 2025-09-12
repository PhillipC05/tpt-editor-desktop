/**
 * Character Sprite Generator
 * Handles generation of character sprites
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-utils');

class CharacterGenerator {
    constructor() {
        this.utils = new SpriteUtils();
    }

    /**
     * Main character generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Generate character based on class
        switch (config.classType) {
            case 'warrior':
                await this.generateWarrior(image, config);
                break;
            case 'mage':
                await this.generateMage(image, config);
                break;
            case 'ranger':
                await this.generateRanger(image, config);
                break;
            case 'paladin':
                await this.generatePaladin(image, config);
                break;
            case 'rogue':
                await this.generateRogue(image, config);
                break;
            case 'druid':
                await this.generateDruid(image, config);
                break;
            case 'necromancer':
                await this.generateNecromancer(image, config);
                break;
            case 'summoner':
                await this.generateSummoner(image, config);
                break;
            case 'archer':
                await this.generateArcher(image, config);
                break;
            case 'knight':
                await this.generateKnight(image, config);
                break;
            case 'barbarian':
                await this.generateBarbarian(image, config);
                break;
            case 'assassin':
                await this.generateAssassin(image, config);
                break;
            case 'cleric':
                await this.generateCleric(image, config);
                break;
            case 'monk':
                await this.generateMonk(image, config);
                break;
            case 'sorcerer':
                await this.generateSorcerer(image, config);
                break;
            default:
                await this.generateWarrior(image, config);
        }
    }

    /**
     * Generate warrior sprite
     */
    async generateWarrior(image, config) {
        const { width, height } = image.bitmap;

        // Enhanced warrior with detailed features
        const skinColor = this.utils.getColor('#D2B48C');
        const hairColor = this.utils.getColor('#8B4513');
        const armorColor = this.utils.getColor('#A9A9A9');
        const leatherColor = this.utils.getColor('#8B4513');
        const shadowColor = this.utils.getColor('#696969');

        // Draw shadow for depth
        this.utils.drawShadow(image, width, height);

        // Head with facial features
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.18);
        const headRadiusY = Math.floor(height * 0.12);
        
        // Head base
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, skinColor);
        
        // Hair
        this.utils.drawHair(image, headX, headY - headRadiusY * 0.8, headRadiusX * 1.2, hairColor, 'short');
        
        // Eyes
        this.utils.drawEyes(image, headX, headY, headRadiusX * 0.6);
        
        // Mouth
        this.utils.drawMouth(image, headX, headY + headRadiusY * 0.6, headRadiusX * 0.4);

        // Body with layered armor
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.4);
        const bodyWidth = Math.floor(width * 0.3);
        const bodyHeight = Math.floor(height * 0.35);
        
        // Chest armor with shading
        this.utils.drawRoundedRect(image, bodyX - bodyWidth/2, bodyY, bodyWidth, bodyHeight, 3, armorColor);
        // Armor shading
        this.utils.drawShading(image, bodyX - bodyWidth/2 + 2, bodyY + 2, bodyWidth - 4, bodyHeight - 4, shadowColor, 0.3);
        
        // Leather straps
        this.utils.drawLeatherStraps(image, bodyX, bodyY, bodyWidth, bodyHeight, leatherColor);

        // Arms with detailed structure
        const armLength = Math.floor(height * 0.25);
        const armWidth = Math.floor(width * 0.08);
        
        // Left arm (upper)
        this.utils.drawArm(image, Math.floor(width * 0.25), bodyY + bodyHeight * 0.3, armLength, armWidth, armorColor, 'left_upper');
        // Left forearm
        this.utils.drawArm(image, Math.floor(width * 0.22), bodyY + bodyHeight * 0.6, armLength * 0.7, armWidth * 0.8, leatherColor, 'left_lower');
        
        // Right arm (upper)
        this.utils.drawArm(image, Math.floor(width * 0.75), bodyY + bodyHeight * 0.3, armLength, armWidth, armorColor, 'right_upper');
        // Right forearm
        this.utils.drawArm(image, Math.floor(width * 0.78), bodyY + bodyHeight * 0.6, armLength * 0.7, armWidth * 0.8, leatherColor, 'right_lower');

        // Legs with boots
        const legWidth = Math.floor(width * 0.09);
        const legLength = Math.floor(height * 0.25);
        
        // Left leg
        this.utils.drawLeg(image, Math.floor(width * 0.38), bodyY + bodyHeight, legLength, legWidth, leatherColor, 'left');
        this.utils.drawBoot(image, Math.floor(width * 0.38), bodyY + bodyHeight + legLength, legWidth * 1.2, '#4A4A4A');
        
        // Right leg
        this.utils.drawLeg(image, Math.floor(width * 0.53), bodyY + bodyHeight, legLength, legWidth, leatherColor, 'right');
        this.utils.drawBoot(image, Math.floor(width * 0.53), bodyY + bodyHeight + legLength, legWidth * 1.2, '#4A4A4A');

        // Equipment - Enhanced sword
        if (config.equipment && config.equipment.weapon === 'iron_sword') {
            await this.addDetailedSword(image, config);
        }

        // Enhanced armor details
        if (config.equipment && config.equipment.armor === 'leather_armor') {
            await this.addDetailedArmor(image, config);
        }

        // Add belt
        this.utils.drawBelt(image, bodyX, bodyY + bodyHeight * 0.7, bodyWidth * 0.8, '#654321');
    }

    /**
     * Generate mage sprite
     */
    async generateMage(image, config) {
        const { width, height } = image.bitmap;

        // Robe (purple)
        const robeColor = this.utils.getColor('#4B0082');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.3), Math.floor(width * 0.5), Math.floor(height * 0.5), robeColor);

        // Head (pale)
        const headColor = this.utils.getColor('#FFFACD');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.2);
        const headRadiusX = Math.floor(width * 0.175);
        const headRadiusY = Math.floor(height * 0.125);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Hat (dark purple)
        const hatColor = this.utils.getColor('#2E0854');
        const hatX = Math.floor(width * 0.5);
        const hatY = Math.floor(height * 0.15);
        const hatRadiusX = Math.floor(width * 0.25);
        const hatRadiusY = Math.floor(height * 0.1);
        this.utils.drawEllipse(image, hatX, hatY, hatRadiusX, hatRadiusY, hatColor);

        // Arms
        const armColor = this.utils.getColor('#4B0082');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'wooden_staff') {
            await this.addStaff(image, config);
        }
    }

    /**
     * Generate ranger sprite
     */
    async generateRanger(image, config) {
        const { width, height } = image.bitmap;

        // Tunic (green)
        const tunicColor = this.utils.getColor('#228B22');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.35), tunicColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Arms
        const armColor = this.utils.getColor('#228B22');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs (brown)
        const legColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), legColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), legColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'hunting_bow') {
            await this.addBow(image, config);
        }
    }

    /**
     * Generate paladin sprite
     */
    async generatePaladin(image, config) {
        const { width, height } = image.bitmap;

        // Armor (silver)
        const armorColor = this.utils.getColor('#C0C0C0');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.4), Math.floor(width * 0.5), Math.floor(height * 0.4), armorColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Helmet (gold)
        const helmetColor = this.utils.getColor('#FFD700');
        const helmetX = Math.floor(width * 0.5);
        const helmetY = Math.floor(height * 0.2);
        const helmetRadiusX = Math.floor(width * 0.22);
        const helmetRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, helmetX, helmetY, helmetRadiusX, helmetRadiusY, helmetColor);

        // Arms
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armorColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armorColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armorColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armorColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'holy_sword') {
            await this.addSword(image, config);
        }
        if (config.equipment && config.equipment.shield === 'holy_shield') {
            await this.addShield(image, config);
        }
    }

    /**
     * Generate rogue sprite
     */
    async generateRogue(image, config) {
        const { width, height } = image.bitmap;

        // Leather armor (dark brown)
        const armorColor = this.utils.getColor('#654321');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.35), armorColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Hood (black)
        const hoodColor = this.utils.getColor('#000000');
        const hoodX = Math.floor(width * 0.5);
        const hoodY = Math.floor(height * 0.2);
        const hoodRadiusX = Math.floor(width * 0.25);
        const hoodRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, hoodX, hoodY, hoodRadiusX, hoodRadiusY, hoodColor);

        // Arms
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armorColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armorColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armorColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armorColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'dagger') {
            await this.addDagger(image, config);
        }
    }

    /**
     * Generate druid sprite
     */
    async generateDruid(image, config) {
        const { width, height } = image.bitmap;

        // Robes (earth tones)
        const robeColor = this.utils.getColor('#8B7355');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.3), Math.floor(width * 0.5), Math.floor(height * 0.5), robeColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.2);
        const headRadiusX = Math.floor(width * 0.175);
        const headRadiusY = Math.floor(height * 0.125);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Leaf crown (green)
        const crownColor = this.utils.getColor('#228B22');
        const crownX = Math.floor(width * 0.5);
        const crownY = Math.floor(height * 0.15);
        const crownRadiusX = Math.floor(width * 0.2);
        const crownRadiusY = Math.floor(height * 0.08);
        this.utils.drawEllipse(image, crownX, crownY, crownRadiusX, crownRadiusY, crownColor);

        // Arms
        const armColor = this.utils.getColor('#8B7355');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'druid_staff') {
            await this.addStaff(image, config);
        }
    }

    /**
     * Generate necromancer sprite
     */
    async generateNecromancer(image, config) {
        const { width, height } = image.bitmap;

        // Dark robes (black)
        const robeColor = this.utils.getColor('#2F2F2F');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.3), Math.floor(width * 0.5), Math.floor(height * 0.5), robeColor);

        // Head (pale)
        const headColor = this.utils.getColor('#F5F5DC');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.2);
        const headRadiusX = Math.floor(width * 0.175);
        const headRadiusY = Math.floor(height * 0.125);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Hood (dark)
        const hoodColor = this.utils.getColor('#1C1C1C');
        const hoodX = Math.floor(width * 0.5);
        const hoodY = Math.floor(height * 0.15);
        const hoodRadiusX = Math.floor(width * 0.2);
        const hoodRadiusY = Math.floor(height * 0.1);
        this.utils.drawEllipse(image, hoodX, hoodY, hoodRadiusX, hoodRadiusY, hoodColor);

        // Arms
        const armColor = this.utils.getColor('#2F2F2F');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'necromancer_staff') {
            await this.addStaff(image, config);
        }
    }

    /**
     * Generate summoner sprite
     */
    async generateSummoner(image, config) {
        const { width, height } = image.bitmap;

        // Mystical robes (purple-blue)
        const robeColor = this.utils.getColor('#4B0082');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.3), Math.floor(width * 0.5), Math.floor(height * 0.5), robeColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.2);
        const headRadiusX = Math.floor(width * 0.175);
        const headRadiusY = Math.floor(height * 0.125);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Summoning tome (book)
        const tomeColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.45), Math.floor(width * 0.08), Math.floor(height * 0.12), tomeColor);

        // Arms
        const armColor = this.utils.getColor('#4B0082');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
    }

    /**
     * Generate archer sprite
     */
    async generateArcher(image, config) {
        const { width, height } = image.bitmap;

        // Leather armor (brown)
        const armorColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.35), armorColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Arms
        const armColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'longbow') {
            await this.addBow(image, config);
        }
    }

    /**
     * Generate knight sprite
     */
    async generateKnight(image, config) {
        const { width, height } = image.bitmap;

        // Heavy armor (steel)
        const armorColor = this.utils.getColor('#708090');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.4), Math.floor(width * 0.5), Math.floor(height * 0.4), armorColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Helmet (metallic)
        const helmetColor = this.utils.getColor('#C0C0C0');
        const helmetX = Math.floor(width * 0.5);
        const helmetY = Math.floor(height * 0.2);
        const helmetRadiusX = Math.floor(width * 0.22);
        const helmetRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, helmetX, helmetY, helmetRadiusX, helmetRadiusY, helmetColor);

        // Arms
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armorColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armorColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armorColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armorColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'greatsword') {
            await this.addSword(image, config);
        }
        if (config.equipment && config.equipment.shield === 'tower_shield') {
            await this.addShield(image, config);
        }
    }

    /**
     * Generate barbarian sprite
     */
    async generateBarbarian(image, config) {
        const { width, height } = image.bitmap;

        // Fur and leather (brown/tan)
        const armorColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.35), armorColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Fur trim (darker brown)
        const furColor = this.utils.getColor('#654321');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.35), Math.floor(width * 0.5), Math.floor(height * 0.05), furColor);

        // Arms (muscular)
        const armColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.18), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.62), Math.floor(height * 0.5), Math.floor(width * 0.18), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'great_axe') {
            await this.addAxe(image, config);
        }
    }

    /**
     * Generate assassin sprite
     */
    async generateAssassin(image, config) {
        const { width, height } = image.bitmap;

        // Tight black clothing
        const clothingColor = this.utils.getColor('#2F2F2F');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.35), clothingColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Face mask (black)
        const maskColor = this.utils.getColor('#000000');
        const maskX = Math.floor(width * 0.5);
        const maskY = Math.floor(height * 0.22);
        const maskRadiusX = Math.floor(width * 0.15);
        const maskRadiusY = Math.floor(height * 0.08);
        this.utils.drawEllipse(image, maskX, maskY, maskRadiusX, maskRadiusY, maskColor);

        // Arms
        const armColor = this.utils.getColor('#2F2F2F');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'dual_daggers') {
            await this.addDagger(image, config);
        }
    }

    /**
     * Generate cleric sprite
     */
    async generateCleric(image, config) {
        const { width, height } = image.bitmap;

        // Holy robes (white/gold)
        const robeColor = this.utils.getColor('#F5F5F5');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.3), Math.floor(width * 0.5), Math.floor(height * 0.5), robeColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.2);
        const headRadiusX = Math.floor(width * 0.175);
        const headRadiusY = Math.floor(height * 0.125);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Holy symbol (gold cross)
        const symbolColor = this.utils.getColor('#FFD700');
        // Vertical part
        this.utils.drawRectangle(image, Math.floor(width * 0.48), Math.floor(height * 0.15), Math.floor(width * 0.04), Math.floor(height * 0.1), symbolColor);
        // Horizontal part
        this.utils.drawRectangle(image, Math.floor(width * 0.44), Math.floor(height * 0.18), Math.floor(width * 0.12), Math.floor(height * 0.04), symbolColor);

        // Arms
        const armColor = this.utils.getColor('#F5F5F5');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'mace') {
            await this.addMace(image, config);
        }
    }

    /**
     * Generate monk sprite
     */
    async generateMonk(image, config) {
        const { width, height } = image.bitmap;

        // Simple robes (orange)
        const robeColor = this.utils.getColor('#FF8C00');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.3), Math.floor(width * 0.5), Math.floor(height * 0.5), robeColor);

        // Head (tan)
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.2);
        const headRadiusX = Math.floor(width * 0.175);
        const headRadiusY = Math.floor(height * 0.125);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Bald head (no hair)
        const baldColor = this.utils.getColor('#D2B48C');
        const baldX = Math.floor(width * 0.5);
        const baldY = Math.floor(height * 0.18);
        const baldRadiusX = Math.floor(width * 0.18);
        const baldRadiusY = Math.floor(height * 0.1);
        this.utils.drawEllipse(image, baldX, baldY, baldRadiusX, baldRadiusY, baldColor);

        // Arms
        const armColor = this.utils.getColor('#FF8C00');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
    }

    /**
     * Generate sorcerer sprite
     */
    async generateSorcerer(image, config) {
        const { width, height } = image.bitmap;

        // Mystical robes (deep purple)
        const robeColor = this.utils.getColor('#4B0082');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.3), Math.floor(width * 0.5), Math.floor(height * 0.5), robeColor);

        // Head (pale)
        const headColor = this.utils.getColor('#FFFACD');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.2);
        const headRadiusX = Math.floor(width * 0.175);
        const headRadiusY = Math.floor(height * 0.125);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Pointed hat (purple)
        const hatColor = this.utils.getColor('#8A2BE2');
        const hatX = Math.floor(width * 0.5);
        const hatY = Math.floor(height * 0.15);
        const hatRadiusX = Math.floor(width * 0.25);
        const hatRadiusY = Math.floor(height * 0.1);
        this.utils.drawEllipse(image, hatX, hatY, hatRadiusX, hatRadiusY, hatColor);

        // Arms
        const armColor = this.utils.getColor('#4B0082');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.3), armColor);

        // Equipment
        if (config.equipment && config.equipment.weapon === 'sorcerer_staff') {
            await this.addStaff(image, config);
        }
    }

    /**
     * Add equipment methods
     */
    async addSword(image, config) {
        const { width, height } = image.bitmap;
        const swordColor = this.utils.getColor('#C0C0C0');
        this.utils.drawRectangle(image, Math.floor(width * 0.8), Math.floor(height * 0.4), Math.floor(width * 0.05), Math.floor(height * 0.4), swordColor);
    }

    async addArmor(image, config) {
        const { width, height } = image.bitmap;
        const armorColor = this.utils.getColor('#8B4513');
        // Draw armor outline
        const startX = Math.floor(width * 0.25);
        const startY = Math.floor(height * 0.45);
        const armorWidth = Math.floor(width * 0.5);
        const armorHeight = Math.floor(height * 0.3);

        // Top border
        this.utils.drawRectangle(image, startX, startY, armorWidth, 1, armorColor);
        // Bottom border
        this.utils.drawRectangle(image, startX, startY + armorHeight - 1, armorWidth, 1, armorColor);
        // Left border
        this.utils.drawRectangle(image, startX, startY, 1, armorHeight, armorColor);
        // Right border
        this.utils.drawRectangle(image, startX + armorWidth - 1, startY, 1, armorHeight, armorColor);
    }

    async addStaff(image, config) {
        const { width, height } = image.bitmap;
        const staffColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.8), Math.floor(height * 0.3), Math.floor(width * 0.03), Math.floor(height * 0.4), staffColor);
    }

    async addBow(image, config) {
        const { width, height } = image.bitmap;
        const bowColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.8), Math.floor(height * 0.4), Math.floor(width * 0.03), Math.floor(height * 0.25), bowColor);
    }

    async addDagger(image, config) {
        const { width, height } = image.bitmap;
        const daggerColor = this.utils.getColor('#C0C0C0');
        this.utils.drawRectangle(image, Math.floor(width * 0.8), Math.floor(height * 0.5), Math.floor(width * 0.03), Math.floor(height * 0.2), daggerColor);
    }

    async addShield(image, config) {
        const { width, height } = image.bitmap;
        const shieldColor = this.utils.getColor('#4682B4');
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.45), Math.floor(width * 0.08), Math.floor(height * 0.25), shieldColor);
    }

    async addAxe(image, config) {
        const { width, height } = image.bitmap;
        const axeColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.8), Math.floor(height * 0.4), Math.floor(width * 0.06), Math.floor(height * 0.35), axeColor);
    }

    async addMace(image, config) {
        const { width, height } = image.bitmap;
        const maceColor = this.utils.getColor('#C0C0C0');
        this.utils.drawRectangle(image, Math.floor(width * 0.8), Math.floor(height * 0.4), Math.floor(width * 0.04), Math.floor(height * 0.3), maceColor);
    }
}

module.exports = CharacterGenerator;
