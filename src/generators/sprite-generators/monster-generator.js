/**
 * Monster Sprite Generator
 * Handles generation of monster sprites
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-utils');

class MonsterGenerator {
    constructor() {
        this.utils = new SpriteUtils();
    }

    /**
     * Main monster generation method
     */
    async generate(image, config) {
        const { width, height } = image.bitmap;

        // Generate monster based on type
        switch (config.monsterType) {
            case 'goblin':
                await this.generateGoblin(image, config);
                break;
            case 'wolf':
                await this.generateWolf(image, config);
                break;
            case 'skeleton':
                await this.generateSkeleton(image, config);
                break;
            case 'orc':
                await this.generateOrc(image, config);
                break;
            case 'dragon':
                await this.generateDragon(image, config);
                break;
            case 'giant':
                await this.generateGiant(image, config);
                break;
            case 'demon':
                await this.generateDemon(image, config);
                break;
            case 'zombie':
                await this.generateZombie(image, config);
                break;
            case 'vampire':
                await this.generateVampire(image, config);
                break;
            case 'werewolf':
                await this.generateWerewolf(image, config);
                break;
            case 'spider':
                await this.generateSpider(image, config);
                break;
            case 'scorpion':
                await this.generateScorpion(image, config);
                break;
            case 'troll':
                await this.generateTroll(image, config);
                break;
            case 'ogre':
                await this.generateOgre(image, config);
                break;
            case 'golem':
                await this.generateGolem(image, config);
                break;
            case 'elemental':
                await this.generateElemental(image, config);
                break;
            case 'ghost':
                await this.generateGhost(image, config);
                break;
            case 'wraith':
                await this.generateWraith(image, config);
                break;
            case 'lich':
                await this.generateLich(image, config);
                break;
            case 'behemoth':
                await this.generateBehemoth(image, config);
                break;
            case 'leviathan':
                await this.generateLeviathan(image, config);
                break;
            case 'phoenix':
                await this.generatePhoenix(image, config);
                break;
            case 'griffin':
                await this.generateGriffin(image, config);
                break;
            case 'unicorn':
                await this.generateUnicorn(image, config);
                break;
            case 'minotaur':
                await this.generateMinotaur(image, config);
                break;
            case 'centaur':
                await this.generateCentaur(image, config);
                break;
            case 'harpy':
                await this.generateHarpy(image, config);
                break;
            case 'manticore':
                await this.generateManticore(image, config);
                break;
            case 'basilisk':
                await this.generateBasilisk(image, config);
                break;
            case 'chimera':
                await this.generateChimera(image, config);
                break;
            default:
                await this.generateGoblin(image, config);
        }
    }

    /**
     * Generate goblin sprite
     */
    async generateGoblin(image, config) {
        const { width, height } = image.bitmap;

        // Body (green)
        const bodyColor = this.utils.getColor('#228B22');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.3);
        const bodyRadiusY = Math.floor(height * 0.35);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Head (darker green)
        const headColor = this.utils.getColor('#006400');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.3);
        const headRadiusX = Math.floor(width * 0.25);
        const headRadiusY = Math.floor(height * 0.2);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Eyes (yellow)
        const eyeColor = this.utils.getColor('#FFFF00');
        const eyeRadiusX = Math.floor(width * 0.04);
        const eyeRadiusY = Math.floor(height * 0.03);

        // Left eye
        const leftEyeX = Math.floor(width * 0.4);
        const leftEyeY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, leftEyeX, leftEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Right eye
        const rightEyeX = Math.floor(width * 0.6);
        const rightEyeY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, rightEyeX, rightEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Ears
        const earColor = this.utils.getColor('#006400');
        const earRadiusX = Math.floor(width * 0.075);
        const earRadiusY = Math.floor(height * 0.1);

        // Left ear
        const leftEarX = Math.floor(width * 0.25);
        const leftEarY = Math.floor(height * 0.3);
        this.utils.drawEllipse(image, leftEarX, leftEarY, earRadiusX, earRadiusY, earColor);

        // Right ear
        const rightEarX = Math.floor(width * 0.75);
        const rightEarY = Math.floor(height * 0.3);
        this.utils.drawEllipse(image, rightEarX, rightEarY, earRadiusX, earRadiusY, earColor);
    }

    /**
     * Generate wolf sprite
     */
    async generateWolf(image, config) {
        const { width, height } = image.bitmap;

        // Body (gray)
        const bodyColor = this.utils.getColor('#808080');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.4);
        const bodyRadiusY = Math.floor(height * 0.3);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Head
        const headColor = this.utils.getColor('#A9A9A9');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.3);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.175);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Ears
        const earColor = this.utils.getColor('#A9A9A9');
        const earRadiusX = Math.floor(width * 0.05);
        const earRadiusY = Math.floor(height * 0.075);

        // Left ear
        const leftEarX = Math.floor(width * 0.35);
        const leftEarY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, leftEarX, leftEarY, earRadiusX, earRadiusY, earColor);

        // Right ear
        const rightEarX = Math.floor(width * 0.65);
        const rightEarY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, rightEarX, rightEarY, earRadiusX, earRadiusY, earColor);

        // Eyes (red)
        const eyeColor = this.utils.getColor('#FF0000');
        const eyeRadiusX = Math.floor(width * 0.025);
        const eyeRadiusY = Math.floor(height * 0.02);

        // Left eye
        const leftEyeX = Math.floor(width * 0.45);
        const leftEyeY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, leftEyeX, leftEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Right eye
        const rightEyeX = Math.floor(width * 0.55);
        const rightEyeY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, rightEyeX, rightEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Legs
        const legColor = this.utils.getColor('#808080');
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(width * (0.3 + i * 0.1));
            const legWidth = Math.floor(width * 0.025);
            const legHeight = Math.floor(height * 0.2);
            const legY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, legY, legWidth, legHeight, legColor);
        }
    }

    /**
     * Generate skeleton sprite
     */
    async generateSkeleton(image, config) {
        const { width, height } = image.bitmap;

        // Bones (white)
        const boneColor = this.utils.getColor('#FFFFFF');

        // Skull
        const skullX = Math.floor(width * 0.5);
        const skullY = Math.floor(height * 0.2);
        const skullRadiusX = Math.floor(width * 0.2);
        const skullRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, skullX, skullY, skullRadiusX, skullRadiusY, boneColor);

        // Eye sockets (black)
        const socketColor = this.utils.getColor('#000000');
        const socketRadiusX = Math.floor(width * 0.04);
        const socketRadiusY = Math.floor(height * 0.03);

        // Left eye socket
        const leftSocketX = Math.floor(width * 0.45);
        const leftSocketY = Math.floor(height * 0.18);
        this.utils.drawEllipse(image, leftSocketX, leftSocketY, socketRadiusX, socketRadiusY, socketColor);

        // Right eye socket
        const rightSocketX = Math.floor(width * 0.55);
        const rightSocketY = Math.floor(height * 0.18);
        this.utils.drawEllipse(image, rightSocketX, rightSocketY, socketRadiusX, socketRadiusY, socketColor);

        // Ribcage
        for (let i = 0; i < 6; i++) {
            const y = Math.floor(height * (0.35 + i * 0.04));
            this.utils.drawRectangle(image, Math.floor(width * 0.3), y, Math.floor(width * 0.4), 2, boneColor);
        }

        // Spine
        this.utils.drawRectangle(image, Math.floor(width * 0.5 - 1), Math.floor(height * 0.2), 2, Math.floor(height * 0.4), boneColor);

        // Arms and legs (simple bones)
        // Right arm
        this.utils.drawRectangle(image, Math.floor(width * 0.5), Math.floor(height * 0.4), Math.floor(width * 0.2), 2, boneColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.5), Math.floor(height * 0.4), 2, Math.floor(height * 0.2), boneColor);

        // Left arm
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.2), 2, boneColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), 2, Math.floor(height * 0.2), boneColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.5), Math.floor(height * 0.8), 2, Math.floor(height * 0.2), boneColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.4), Math.floor(height * 0.8), 2, Math.floor(height * 0.2), boneColor);
    }

    /**
     * Generate orc sprite
     */
    async generateOrc(image, config) {
        const { width, height } = image.bitmap;

        // Body (dark green)
        const bodyColor = this.utils.getColor('#006400');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.35);
        const bodyRadiusY = Math.floor(height * 0.35);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Head (darker green)
        const headColor = this.utils.getColor('#004400');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.3);
        const headRadiusY = Math.floor(height * 0.2);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Tusks (white)
        const tuskColor = this.utils.getColor('#FFFFFF');
        this.utils.drawRectangle(image, Math.floor(width * 0.45), Math.floor(height * 0.35), Math.floor(width * 0.02), Math.floor(height * 0.05), tuskColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.53), Math.floor(height * 0.35), Math.floor(width * 0.02), Math.floor(height * 0.05), tuskColor);

        // Eyes (red)
        const eyeColor = this.utils.getColor('#FF0000');
        const eyeRadiusX = Math.floor(width * 0.03);
        const eyeRadiusY = Math.floor(height * 0.025);

        // Left eye
        const leftEyeX = Math.floor(width * 0.42);
        const leftEyeY = Math.floor(height * 0.22);
        this.utils.drawEllipse(image, leftEyeX, leftEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Right eye
        const rightEyeX = Math.floor(width * 0.58);
        const rightEyeY = Math.floor(height * 0.22);
        this.utils.drawEllipse(image, rightEyeX, rightEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Arms
        const armColor = this.utils.getColor('#006400');
        this.utils.drawRectangle(image, Math.floor(width * 0.15), Math.floor(height * 0.45), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.7), Math.floor(height * 0.45), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
    }

    /**
     * Generate dragon sprite
     */
    async generateDragon(image, config) {
        const { width, height } = image.bitmap;

        // Body (scales - dark green)
        const bodyColor = this.utils.getColor('#006400');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.4);
        const bodyRadiusY = Math.floor(height * 0.35);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Head (larger)
        const headColor = this.utils.getColor('#228B22');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.3);
        const headRadiusX = Math.floor(width * 0.3);
        const headRadiusY = Math.floor(height * 0.2);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Horns (black)
        const hornColor = this.utils.getColor('#000000');
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.15), Math.floor(width * 0.05), Math.floor(height * 0.15), hornColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.6), Math.floor(height * 0.15), Math.floor(width * 0.05), Math.floor(height * 0.15), hornColor);

        // Wings (membrane)
        const wingColor = this.utils.getColor('#DC143C');
        this.utils.drawRectangle(image, Math.floor(width * 0.1), Math.floor(height * 0.4), Math.floor(width * 0.2), Math.floor(height * 0.3), wingColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.7), Math.floor(height * 0.4), Math.floor(width * 0.2), Math.floor(height * 0.3), wingColor);

        // Legs
        const legColor = this.utils.getColor('#006400');
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(width * (0.25 + i * 0.15));
            const legWidth = Math.floor(width * 0.05);
            const legHeight = Math.floor(height * 0.25);
            const legY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, legY, legWidth, legHeight, legColor);
        }
    }

    /**
     * Generate giant sprite
     */
    async generateGiant(image, config) {
        const { width, height } = image.bitmap;

        // Massive body (gray)
        const bodyColor = this.utils.getColor('#808080');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.5), bodyColor);

        // Large head
        const headColor = this.utils.getColor('#A9A9A9');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.25);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Arms (thick)
        const armColor = this.utils.getColor('#808080');
        this.utils.drawRectangle(image, Math.floor(width * 0.15), Math.floor(height * 0.5), Math.floor(width * 0.2), Math.floor(height * 0.4), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.2), Math.floor(height * 0.4), armColor);

        // Legs (thick)
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.8), Math.floor(width * 0.1), Math.floor(height * 0.2), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.8), Math.floor(width * 0.1), Math.floor(height * 0.2), armColor);

        // Club (brown)
        const clubColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.6), Math.floor(width * 0.05), Math.floor(height * 0.3), clubColor);
    }

    /**
     * Generate demon sprite
     */
    async generateDemon(image, config) {
        const { width, height } = image.bitmap;

        // Body (dark red)
        const bodyColor = this.utils.getColor('#8B0000');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.35);
        const bodyRadiusY = Math.floor(height * 0.35);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Head (angular)
        const headColor = this.utils.getColor('#DC143C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.3);
        const headRadiusX = Math.floor(width * 0.25);
        const headRadiusY = Math.floor(height * 0.18);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Horns (black)
        const hornColor = this.utils.getColor('#000000');
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.15), Math.floor(width * 0.06), Math.floor(height * 0.12), hornColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.59), Math.floor(height * 0.15), Math.floor(width * 0.06), Math.floor(height * 0.12), hornColor);

        // Eyes (yellow)
        const eyeColor = this.utils.getColor('#FFFF00');
        const eyeRadiusX = Math.floor(width * 0.04);
        const eyeRadiusY = Math.floor(height * 0.03);

        // Left eye
        const leftEyeX = Math.floor(width * 0.42);
        const leftEyeY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, leftEyeX, leftEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Right eye
        const rightEyeX = Math.floor(width * 0.58);
        const rightEyeY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, rightEyeX, rightEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Wings (leathery)
        const wingColor = this.utils.getColor('#654321');
        this.utils.drawRectangle(image, Math.floor(width * 0.1), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.25), wingColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.25), wingColor);

        // Tail
        this.utils.drawRectangle(image, Math.floor(width * 0.8), Math.floor(height * 0.7), Math.floor(width * 0.1), Math.floor(height * 0.15), bodyColor);
    }

    /**
     * Generate zombie sprite
     */
    async generateZombie(image, config) {
        const { width, height } = image.bitmap;

        // Decaying body (gray-green)
        const bodyColor = this.utils.getColor('#696969');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.4), bodyColor);

        // Head (decaying)
        const headColor = this.utils.getColor('#808080');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Arms (hanging)
        const armColor = this.utils.getColor('#696969');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs (stiff)
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.75), Math.floor(width * 0.1), Math.floor(height * 0.25), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.75), Math.floor(width * 0.1), Math.floor(height * 0.25), armColor);
    }

    /**
     * Generate vampire sprite
     */
    async generateVampire(image, config) {
        const { width, height } = image.bitmap;

        // Pale body (white)
        const bodyColor = this.utils.getColor('#F5F5F5');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.4), bodyColor);

        // Head (pale)
        const headColor = this.utils.getColor('#FFFACD');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Cape (black)
        const capeColor = this.utils.getColor('#000000');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.35), Math.floor(width * 0.6), Math.floor(height * 0.15), capeColor);

        // Fangs (white)
        const fangColor = this.utils.getColor('#FFFFFF');
        this.utils.drawRectangle(image, Math.floor(width * 0.45), Math.floor(height * 0.32), Math.floor(width * 0.02), Math.floor(height * 0.03), fangColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.53), Math.floor(height * 0.32), Math.floor(width * 0.02), Math.floor(height * 0.03), fangColor);

        // Arms
        const armColor = this.utils.getColor('#F5F5F5');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.75), Math.floor(width * 0.1), Math.floor(height * 0.25), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.75), Math.floor(width * 0.1), Math.floor(height * 0.25), armColor);
    }

    /**
     * Generate werewolf sprite
     */
    async generateWerewolf(image, config) {
        const { width, height } = image.bitmap;

        // Fur body (brown)
        const bodyColor = this.utils.getColor('#8B4513');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.35);
        const bodyRadiusY = Math.floor(height * 0.35);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Wolf head
        const headColor = this.utils.getColor('#654321');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.3);
        const headRadiusX = Math.floor(width * 0.25);
        const headRadiusY = Math.floor(height * 0.18);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Ears
        const earColor = this.utils.getColor('#654321');
        const earRadiusX = Math.floor(width * 0.05);
        const earRadiusY = Math.floor(height * 0.08);

        // Left ear
        const leftEarX = Math.floor(width * 0.35);
        const leftEarY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, leftEarX, leftEarY, earRadiusX, earRadiusY, earColor);

        // Right ear
        const rightEarX = Math.floor(width * 0.65);
        const rightEarY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, rightEarX, rightEarY, earRadiusX, earRadiusY, earColor);

        // Eyes (yellow)
        const eyeColor = this.utils.getColor('#FFFF00');
        const eyeRadiusX = Math.floor(width * 0.03);
        const eyeRadiusY = Math.floor(height * 0.025);

        // Left eye
        const leftEyeX = Math.floor(width * 0.42);
        const leftEyeY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, leftEyeX, leftEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Right eye
        const rightEyeX = Math.floor(width * 0.58);
        const rightEyeY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, rightEyeX, rightEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Legs
        const legColor = this.utils.getColor('#8B4513');
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(width * (0.3 + i * 0.1));
            const legWidth = Math.floor(width * 0.04);
            const legHeight = Math.floor(height * 0.2);
            const legY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, legY, legWidth, legHeight, legColor);
        }
    }

    /**
     * Generate spider sprite
     */
    async generateSpider(image, config) {
        const { width, height } = image.bitmap;

        // Body (black)
        const bodyColor = this.utils.getColor('#000000');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.25);
        const bodyRadiusY = Math.floor(height * 0.2);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Abdomen (larger)
        const abdomenColor = this.utils.getColor('#2F2F2F');
        const abdomenX = Math.floor(width * 0.5);
        const abdomenY = Math.floor(height * 0.75);
        const abdomenRadiusX = Math.floor(width * 0.3);
        const abdomenRadiusY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, abdomenX, abdomenY, abdomenRadiusX, abdomenRadiusY, abdomenColor);

        // Eyes (red)
        const eyeColor = this.utils.getColor('#FF0000');
        const eyeRadiusX = Math.floor(width * 0.02);
        const eyeRadiusY = Math.floor(height * 0.015);

        // Multiple eyes
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const eyeX = Math.floor(width * 0.5 + Math.cos(angle) * width * 0.15);
            const eyeY = Math.floor(height * 0.55 + Math.sin(angle) * height * 0.1);
            this.utils.drawEllipse(image, eyeX, eyeY, eyeRadiusX, eyeRadiusY, eyeColor);
        }

        // Legs (8 legs)
        const legColor = this.utils.getColor('#000000');
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const legX = Math.floor(width * 0.5 + Math.cos(angle) * width * 0.25);
            const legY = Math.floor(height * 0.65 + Math.sin(angle) * height * 0.15);
            const legLength = Math.floor(height * 0.2);

            // Draw leg extending outward
            for (let j = 0; j < legLength; j++) {
                const legPixelX = Math.floor(legX + Math.cos(angle) * j * 2);
                const legPixelY = Math.floor(legY + Math.sin(angle) * j * 2);
                if (legPixelX >= 0 && legPixelX < width && legPixelY >= 0 && legPixelY < height) {
                    const idx = (legPixelY * width + legPixelX) * 4;
                    image.bitmap.data[idx] = (legColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (legColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = legColor & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }
    }

    /**
     * Generate scorpion sprite
     */
    async generateScorpion(image, config) {
        const { width, height } = image.bitmap;

        // Body (dark brown)
        const bodyColor = this.utils.getColor('#654321');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.25);
        const bodyRadiusY = Math.floor(height * 0.2);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Tail segments
        const tailColor = this.utils.getColor('#8B4513');
        for (let i = 0; i < 5; i++) {
            const tailX = Math.floor(width * (0.7 + i * 0.05));
            const tailY = Math.floor(height * (0.5 - i * 0.05));
            const tailRadius = Math.floor(width * (0.03 - i * 0.005));
            this.utils.drawEllipse(image, tailX, tailY, tailRadius, tailRadius, tailColor);
        }

        // Pincers
        const pincerColor = this.utils.getColor('#654321');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.55), Math.floor(width * 0.1), Math.floor(height * 0.05), pincerColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.55), Math.floor(width * 0.1), Math.floor(height * 0.05), pincerColor);

        // Legs
        const legColor = this.utils.getColor('#654321');
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const legX = Math.floor(width * 0.5 + Math.cos(angle) * width * 0.2);
            const legY = Math.floor(height * 0.65 + Math.sin(angle) * height * 0.1);
            const legLength = Math.floor(height * 0.15);

            for (let j = 0; j < legLength; j++) {
                const legPixelX = Math.floor(legX + Math.cos(angle) * j * 1.5);
                const legPixelY = Math.floor(legY + Math.sin(angle) * j * 1.5);
                if (legPixelX >= 0 && legPixelX < width && legPixelY >= 0 && legPixelY < height) {
                    const idx = (legPixelY * width + legPixelX) * 4;
                    image.bitmap.data[idx] = (legColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (legColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = legColor & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }
    }

    /**
     * Generate troll sprite
     */
    async generateTroll(image, config) {
        const { width, height } = image.bitmap;

        // Large green body
        const bodyColor = this.utils.getColor('#228B22');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.45), bodyColor);

        // Large head
        const headColor = this.utils.getColor('#32CD32');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.25);
        const headRadiusY = Math.floor(height * 0.18);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Tusks
        const tuskColor = this.utils.getColor('#FFFFF0');
        this.utils.drawRectangle(image, Math.floor(width * 0.45), Math.floor(height * 0.35), Math.floor(width * 0.03), Math.floor(height * 0.05), tuskColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.52), Math.floor(height * 0.35), Math.floor(width * 0.03), Math.floor(height * 0.05), tuskColor);

        // Arms (thick)
        const armColor = this.utils.getColor('#228B22');
        this.utils.drawRectangle(image, Math.floor(width * 0.15), Math.floor(height * 0.5), Math.floor(width * 0.2), Math.floor(height * 0.35), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.2), Math.floor(height * 0.35), armColor);

        // Legs (thick)
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.8), Math.floor(width * 0.12), Math.floor(height * 0.2), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.53), Math.floor(height * 0.8), Math.floor(width * 0.12), Math.floor(height * 0.2), armColor);

        // Club
        const clubColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.6), Math.floor(width * 0.06), Math.floor(height * 0.25), clubColor);
    }

    /**
     * Generate ogre sprite
     */
    async generateOgre(image, config) {
        const { width, height } = image.bitmap;

        // Large gray body
        const bodyColor = this.utils.getColor('#808080');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.45), bodyColor);

        // Large head
        const headColor = this.utils.getColor('#A9A9A9');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.25);
        const headRadiusY = Math.floor(height * 0.18);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Arms (very thick)
        const armColor = this.utils.getColor('#808080');
        this.utils.drawRectangle(image, Math.floor(width * 0.15), Math.floor(height * 0.5), Math.floor(width * 0.2), Math.floor(height * 0.35), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.2), Math.floor(height * 0.35), armColor);

        // Legs (very thick)
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.8), Math.floor(width * 0.12), Math.floor(height * 0.2), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.8), Math.floor(width * 0.12), Math.floor(height * 0.2), armColor);

        // Weapon (large club)
        const clubColor = this.utils.getColor('#654321');
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.6), Math.floor(width * 0.08), Math.floor(height * 0.3), clubColor);
    }

    /**
     * Generate golem sprite
     */
    async generateGolem(image, config) {
        const { width, height } = image.bitmap;

        // Stone body (gray)
        const bodyColor = this.utils.getColor('#696969');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.45), bodyColor);

        // Stone head
        const headColor = this.utils.getColor('#808080');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Glowing eyes (red)
        const eyeColor = this.utils.getColor('#FF0000');
        const eyeRadiusX = Math.floor(width * 0.03);
        const eyeRadiusY = Math.floor(height * 0.025);

        // Left eye
        const leftEyeX = Math.floor(width * 0.45);
        const leftEyeY = Math.floor(height * 0.22);
        this.utils.drawEllipse(image, leftEyeX, leftEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Right eye
        const rightEyeX = Math.floor(width * 0.55);
        const rightEyeY = Math.floor(height * 0.22);
        this.utils.drawEllipse(image, rightEyeX, rightEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Arms (stone)
        const armColor = this.utils.getColor('#696969');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.35), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.35), armColor);

        // Legs (stone)
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.8), Math.floor(width * 0.1), Math.floor(height * 0.2), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.8), Math.floor(width * 0.1), Math.floor(height * 0.2), armColor);
    }

    /**
     * Generate elemental sprite
     */
    async generateElemental(image, config) {
        const { width, height } = image.bitmap;

        // Energy body (blue-white)
        const bodyColor = this.utils.getColor('#87CEEB');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.3);
        const bodyRadiusY = Math.floor(height * 0.35);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Energy head
        const headColor = this.utils.getColor('#00BFFF');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.3);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Energy tendrils
        const tendrilColor = this.utils.getColor('#1E90FF');
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const tendrilX = Math.floor(width * 0.5 + Math.cos(angle) * width * 0.2);
            const tendrilY = Math.floor(height * 0.6 + Math.sin(angle) * height * 0.15);
            const tendrilLength = Math.floor(height * 0.2);

            for (let j = 0; j < tendrilLength; j++) {
                const tendrilPixelX = Math.floor(tendrilX + Math.cos(angle) * j * 1.5);
                const tendrilPixelY = Math.floor(tendrilY + Math.sin(angle) * j * 1.5);
                if (tendrilPixelX >= 0 && tendrilPixelX < width && tendrilPixelY >= 0 && tendrilPixelY < height) {
                    const idx = (tendrilPixelY * width + tendrilPixelX) * 4;
                    image.bitmap.data[idx] = (tendrilColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (tendrilColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = tendrilColor & 0xFF;
                    image.bitmap.data[idx + 3] = 255;
                }
            }
        }

        // Glowing core (bright blue)
        const coreColor = this.utils.getColor('#00FFFF');
        const coreX = Math.floor(width * 0.5);
        const coreY = Math.floor(height * 0.55);
        const coreRadiusX = Math.floor(width * 0.08);
        const coreRadiusY = Math.floor(height * 0.06);
        this.utils.drawEllipse(image, coreX, coreY, coreRadiusX, coreRadiusY, coreColor);
    }

    /**
     * Generate ghost sprite
     */
    async generateGhost(image, config) {
        const { width, height } = image.bitmap;

        // Translucent body (white with transparency effect)
        const bodyColor = this.utils.getColor('#F8F8FF');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.3);
        const bodyRadiusY = Math.floor(height * 0.35);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);
        this.utils.addTransparency(image, Math.floor(width * 0.2), Math.floor(height * 0.25), Math.floor(width * 0.6), Math.floor(height * 0.6), 200);

        // Ghostly head
        const headColor = this.utils.getColor('#FFFFFF');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.3);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);
        this.utils.addTransparency(image, Math.floor(width * 0.3), Math.floor(height * 0.15), Math.floor(width * 0.4), Math.floor(height * 0.3), 180);

        // Eyes (dark)
        const eyeColor = this.utils.getColor('#000000');
        const eyeRadiusX = Math.floor(width * 0.025);
        const eyeRadiusY = Math.floor(height * 0.02);

        // Left eye
        const leftEyeX = Math.floor(width * 0.45);
        const leftEyeY = Math.floor(height * 0.27);
        this.utils.drawEllipse(image, leftEyeX, leftEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Right eye
        const rightEyeX = Math.floor(width * 0.55);
        const rightEyeY = Math.floor(height * 0.27);
        this.utils.drawEllipse(image, rightEyeX, rightEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Wavy bottom (ghost tail)
        const tailColor = this.utils.getColor('#F8F8FF');
        for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x++) {
            const waveOffset = Math.sin((x - width * 0.3) / (width * 0.4) * Math.PI * 2) * height * 0.05;
            const y = Math.floor(height * 0.85 + waveOffset);
            if (y >= 0 && y < height) {
                const idx = (y * width + x) * 4;
                image.bitmap.data[idx] = (tailColor >> 16) & 0xFF;
                image.bitmap.data[idx + 1] = (tailColor >> 8) & 0xFF;
                image.bitmap.data[idx + 2] = tailColor & 0xFF;
                image.bitmap.data[idx + 3] = 150; // Very transparent
            }
        }
    }

    /**
     * Generate wraith sprite
     */
    async generateWraith(image, config) {
        const { width, height } = image.bitmap;

        // Dark shadowy body
        const bodyColor = this.utils.getColor('#2F2F2F');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.3);
        const bodyRadiusY = Math.floor(height * 0.35);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);
        this.utils.addTransparency(image, Math.floor(width * 0.2), Math.floor(height * 0.25), Math.floor(width * 0.6), Math.floor(height * 0.6), 120);

        // Hooded head
        const hoodColor = this.utils.getColor('#1C1C1C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.3);
        const headRadiusX = Math.floor(width * 0.25);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, hoodColor);
        this.utils.addTransparency(image, Math.floor(width * 0.25), Math.floor(height * 0.15), Math.floor(width * 0.5), Math.floor(height * 0.3), 100);

        // Glowing eyes (red)
        const eyeColor = this.utils.getColor('#FF0000');
        const eyeRadiusX = Math.floor(width * 0.03);
        const eyeRadiusY = Math.floor(height * 0.025);

        // Left eye
        const leftEyeX = Math.floor(width * 0.45);
        const leftEyeY = Math.floor(height * 0.27);
        this.utils.drawEllipse(image, leftEyeX, leftEyeY, eyeRadiusX, eyeRadiusY, eyeColor);

        // Right eye
        const rightEyeX = Math.floor(width * 0.55);
        const rightEyeY = Math.floor(height * 0.27);
        this.utils.drawEllipse(image, rightEyeX, rightEyeY, eyeRadiusX, eyeRadiusY, eyeColor);
    }

    /**
     * Generate lich sprite
     */
    async generateLich(image, config) {
        const { width, height } = image.bitmap;

        // Skeletal body (white bones)
        const bodyColor = this.utils.getColor('#FFFFFF');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.4), bodyColor);

        // Skull head
        const headColor = this.utils.getColor('#F5F5F5');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Crown (gold)
        const crownColor = this.utils.getColor('#FFD700');
        const crownX = Math.floor(width * 0.5);
        const crownY = Math.floor(height * 0.18);
        const crownRadiusX = Math.floor(width * 0.22);
        const crownRadiusY = Math.floor(height * 0.08);
        this.utils.drawEllipse(image, crownX, crownY, crownRadiusX, crownRadiusY, crownColor);

        // Arms
        const armColor = this.utils.getColor('#FFFFFF');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.15), Math.floor(height * 0.3), armColor);

        // Legs
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.75), Math.floor(width * 0.1), Math.floor(height * 0.25), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.75), Math.floor(width * 0.1), Math.floor(height * 0.25), armColor);

        // Staff
        const staffColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.4), Math.floor(width * 0.03), Math.floor(height * 0.4), staffColor);
    }

    /**
     * Generate behemoth sprite
     */
    async generateBehemoth(image, config) {
        const { width, height } = image.bitmap;

        // Massive body (dark brown)
        const bodyColor = this.utils.getColor('#654321');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.4), Math.floor(width * 0.5), Math.floor(height * 0.5), bodyColor);

        // Large head
        const headColor = this.utils.getColor('#8B4513');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.25);
        const headRadiusY = Math.floor(height * 0.18);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Horns
        const hornColor = this.utils.getColor('#000000');
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.15), Math.floor(width * 0.05), Math.floor(height * 0.12), hornColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.6), Math.floor(height * 0.15), Math.floor(width * 0.05), Math.floor(height * 0.12), hornColor);

        // Arms (thick)
        const armColor = this.utils.getColor('#654321');
        this.utils.drawRectangle(image, Math.floor(width * 0.15), Math.floor(height * 0.5), Math.floor(width * 0.2), Math.floor(height * 0.4), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.5), Math.floor(width * 0.2), Math.floor(height * 0.4), armColor);

        // Legs (very thick)
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.8), Math.floor(width * 0.15), Math.floor(height * 0.2), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.8), Math.floor(width * 0.15), Math.floor(height * 0.2), armColor);
    }

    /**
     * Generate leviathan sprite
     */
    async generateLeviathan(image, config) {
        const { width, height } = image.bitmap;

        // Long serpentine body (blue-green)
        const bodyColor = this.utils.getColor('#008B8B');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.6), Math.floor(height * 0.3), bodyColor);

        // Large head
        const headColor = this.utils.getColor('#00CED1');
        const headX = Math.floor(width * 0.3);
        const headY = Math.floor(height * 0.4);
        const headRadiusX = Math.floor(width * 0.15);
        const headRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Fins
        const finColor = this.utils.getColor('#008B8B');
        this.utils.drawRectangle(image, Math.floor(width * 0.4), Math.floor(height * 0.45), Math.floor(width * 0.1), Math.floor(height * 0.15), finColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.6), Math.floor(height * 0.45), Math.floor(width * 0.1), Math.floor(height * 0.15), finColor);

        // Tail
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.55), Math.floor(width * 0.15), Math.floor(height * 0.2), bodyColor);

        // Eyes (yellow)
        const eyeColor = this.utils.getColor('#FFFF00');
        const eyeRadiusX = Math.floor(width * 0.025);
        const eyeRadiusY = Math.floor(height * 0.02);

        const eyeX = Math.floor(width * 0.28);
        const eyeY = Math.floor(height * 0.38);
        this.utils.drawEllipse(image, eyeX, eyeY, eyeRadiusX, eyeRadiusY, eyeColor);
    }

    /**
     * Generate phoenix sprite
     */
    async generatePhoenix(image, config) {
        const { width, height } = image.bitmap;

        // Fiery body (orange-red)
        const bodyColor = this.utils.getColor('#FF4500');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.3);
        const bodyRadiusY = Math.floor(height * 0.3);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Head
        const headColor = this.utils.getColor('#FFD700');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.35);
        const headRadiusX = Math.floor(width * 0.15);
        const headRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Wings (flames)
        const wingColor = this.utils.getColor('#FF6347');
        this.utils.drawRectangle(image, Math.floor(width * 0.15), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);

        // Tail feathers (flames)
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.6), Math.floor(width * 0.15), Math.floor(height * 0.2), wingColor);

        // Legs
        const legColor = this.utils.getColor('#FF4500');
        for (let i = 0; i < 2; i++) {
            const x = Math.floor(width * (0.4 + i * 0.2));
            const legWidth = Math.floor(width * 0.03);
            const legHeight = Math.floor(height * 0.15);
            const legY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, legY, legWidth, legHeight, legColor);
        }
    }

    /**
     * Generate griffin sprite
     */
    async generateGriffin(image, config) {
        const { width, height } = image.bitmap;

        // Body (golden)
        const bodyColor = this.utils.getColor('#FFD700');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.3);
        const bodyRadiusY = Math.floor(height * 0.3);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Eagle head
        const headColor = this.utils.getColor('#FFFFFF');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.35);
        const headRadiusX = Math.floor(width * 0.15);
        const headRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Beak
        const beakColor = this.utils.getColor('#FFFF00');
        this.utils.drawRectangle(image, Math.floor(width * 0.5), Math.floor(height * 0.4), Math.floor(width * 0.03), Math.floor(height * 0.05), beakColor);

        // Wings
        const wingColor = this.utils.getColor('#FFD700');
        this.utils.drawRectangle(image, Math.floor(width * 0.15), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);

        // Lion tail
        const tailColor = this.utils.getColor('#FFD700');
        this.utils.drawRectangle(image, Math.floor(width * 0.75), Math.floor(height * 0.6), Math.floor(width * 0.1), Math.floor(height * 0.15), tailColor);

        // Legs
        const legColor = this.utils.getColor('#FFD700');
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(width * (0.35 + i * 0.1));
            const legWidth = Math.floor(width * 0.03);
            const legHeight = Math.floor(height * 0.15);
            const legY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, legY, legWidth, legHeight, legColor);
        }
    }

    /**
     * Generate unicorn sprite
     */
    async generateUnicorn(image, config) {
        const { width, height } = image.bitmap;

        // White body
        const bodyColor = this.utils.getColor('#FFFFFF');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.3);
        const bodyRadiusY = Math.floor(height * 0.3);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Head
        const headColor = this.utils.getColor('#F5F5F5');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.35);
        const headRadiusX = Math.floor(width * 0.15);
        const headRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Horn (spiral)
        const hornColor = this.utils.getColor('#FFD700');
        this.utils.drawRectangle(image, Math.floor(width * 0.5), Math.floor(height * 0.25), Math.floor(width * 0.02), Math.floor(height * 0.15), hornColor);

        // Mane (flowing hair)
        const maneColor = this.utils.getColor('#FFB6C1');
        this.utils.drawRectangle(image, Math.floor(width * 0.45), Math.floor(height * 0.35), Math.floor(width * 0.1), Math.floor(height * 0.2), maneColor);

        // Legs
        const legColor = this.utils.getColor('#FFFFFF');
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(width * (0.35 + i * 0.1));
            const legWidth = Math.floor(width * 0.03);
            const legHeight = Math.floor(height * 0.2);
            const legY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, legY, legWidth, legHeight, legColor);
        }
    }

    /**
     * Generate minotaur sprite
     */
    async generateMinotaur(image, config) {
        const { width, height } = image.bitmap;

        // Muscular body (brown)
        const bodyColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.4), Math.floor(width * 0.4), Math.floor(height * 0.45), bodyColor);

        // Bull head
        const headColor = this.utils.getColor('#654321');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.25);
        const headRadiusX = Math.floor(width * 0.2);
        const headRadiusY = Math.floor(height * 0.15);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Horns
        const hornColor = this.utils.getColor('#000000');
        this.utils.drawRectangle(image, Math.floor(width * 0.4), Math.floor(height * 0.15), Math.floor(width * 0.05), Math.floor(height * 0.1), hornColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.15), Math.floor(width * 0.05), Math.floor(height * 0.1), hornColor);

        // Arms (muscular)
        const armColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.18), Math.floor(height * 0.35), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.62), Math.floor(height * 0.5), Math.floor(width * 0.18), Math.floor(height * 0.35), armColor);

        // Legs (muscular)
        this.utils.drawRectangle(image, Math.floor(width * 0.35), Math.floor(height * 0.8), Math.floor(width * 0.1), Math.floor(height * 0.2), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.8), Math.floor(width * 0.1), Math.floor(height * 0.2), armColor);
    }

    /**
     * Generate centaur sprite
     */
    async generateCentaur(image, config) {
        const { width, height } = image.bitmap;

        // Human torso (tan)
        const torsoColor = this.utils.getColor('#D2B48C');
        this.utils.drawRectangle(image, Math.floor(width * 0.3), Math.floor(height * 0.3), Math.floor(width * 0.4), Math.floor(height * 0.3), torsoColor);

        // Human head
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.2);
        const headRadiusX = Math.floor(width * 0.15);
        const headRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Horse body (brown)
        const horseColor = this.utils.getColor('#8B4513');
        this.utils.drawRectangle(image, Math.floor(width * 0.25), Math.floor(height * 0.55), Math.floor(width * 0.5), Math.floor(height * 0.3), horseColor);

        // Horse legs
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(width * (0.3 + i * 0.1));
            const legWidth = Math.floor(width * 0.03);
            const legHeight = Math.floor(height * 0.2);
            const legY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, legY, legWidth, legHeight, horseColor);
        }

        // Arms
        const armColor = this.utils.getColor('#D2B48C');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.25), armColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.4), Math.floor(width * 0.15), Math.floor(height * 0.25), armColor);
    }

    /**
     * Generate harpy sprite
     */
    async generateHarpy(image, config) {
        const { width, height } = image.bitmap;

        // Bird body (brown)
        const bodyColor = this.utils.getColor('#8B4513');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.25);
        const bodyRadiusY = Math.floor(height * 0.25);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Human head
        const headColor = this.utils.getColor('#D2B48C');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.35);
        const headRadiusX = Math.floor(width * 0.15);
        const headRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Wings
        const wingColor = this.utils.getColor('#654321');
        this.utils.drawRectangle(image, Math.floor(width * 0.15), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.65), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);

        // Talons
        const talonColor = this.utils.getColor('#FFFF00');
        for (let i = 0; i < 2; i++) {
            const x = Math.floor(width * (0.45 + i * 0.1));
            const talonWidth = Math.floor(width * 0.02);
            const talonHeight = Math.floor(height * 0.1);
            const talonY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, talonY, talonWidth, talonHeight, talonColor);
        }
    }

    /**
     * Generate manticore sprite
     */
    async generateManticore(image, config) {
        const { width, height } = image.bitmap;

        // Lion body (golden)
        const bodyColor = this.utils.getColor('#FFD700');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.35);
        const bodyRadiusY = Math.floor(height * 0.3);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Lion head
        const headColor = this.utils.getColor('#FFD700');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.35);
        const headRadiusX = Math.floor(width * 0.18);
        const headRadiusY = Math.floor(height * 0.14);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Mane
        const maneColor = this.utils.getColor('#8B4513');
        const maneX = Math.floor(width * 0.5);
        const maneY = Math.floor(height * 0.32);
        const maneRadiusX = Math.floor(width * 0.22);
        const maneRadiusY = Math.floor(height * 0.1);
        this.utils.drawEllipse(image, maneX, maneY, maneRadiusX, maneRadiusY, maneColor);

        // Wings
        const wingColor = this.utils.getColor('#DC143C');
        this.utils.drawRectangle(image, Math.floor(width * 0.1), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.7), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);

        // Tail with spikes
        const tailColor = this.utils.getColor('#FFD700');
        this.utils.drawRectangle(image, Math.floor(width * 0.8), Math.floor(height * 0.6), Math.floor(width * 0.1), Math.floor(height * 0.15), tailColor);

        // Legs
        const legColor = this.utils.getColor('#FFD700');
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(width * (0.35 + i * 0.1));
            const legWidth = Math.floor(width * 0.03);
            const legHeight = Math.floor(height * 0.15);
            const legY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, legY, legWidth, legHeight, legColor);
        }
    }

    /**
     * Generate basilisk sprite
     */
    async generateBasilisk(image, config) {
        const { width, height } = image.bitmap;

        // Serpent body (green)
        const bodyColor = this.utils.getColor('#228B22');
        this.utils.drawRectangle(image, Math.floor(width * 0.2), Math.floor(height * 0.5), Math.floor(width * 0.6), Math.floor(height * 0.3), bodyColor);

        // Crown-like head
        const headColor = this.utils.getColor('#32CD32');
        const headX = Math.floor(width * 0.3);
        const headY = Math.floor(height * 0.4);
        const headRadiusX = Math.floor(width * 0.15);
        const headRadiusY = Math.floor(height * 0.12);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Crown spikes
        const spikeColor = this.utils.getColor('#006400');
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI) / 4;
            const spikeX = Math.floor(width * 0.3 + Math.cos(angle) * width * 0.12);
            const spikeY = Math.floor(height * 0.35 + Math.sin(angle) * height * 0.08);
            const spikeWidth = Math.floor(width * 0.02);
            const spikeHeight = Math.floor(height * 0.05);
            this.utils.drawRectangle(image, spikeX, spikeY, spikeWidth, spikeHeight, spikeColor);
        }

        // Eyes (yellow)
        const eyeColor = this.utils.getColor('#FFFF00');
        const eyeRadiusX = Math.floor(width * 0.025);
        const eyeRadiusY = Math.floor(height * 0.02);

        const eyeX = Math.floor(width * 0.28);
        const eyeY = Math.floor(height * 0.38);
        this.utils.drawEllipse(image, eyeX, eyeY, eyeRadiusX, eyeRadiusY, eyeColor);
    }

    /**
     * Generate chimera sprite
     */
    async generateChimera(image, config) {
        const { width, height } = image.bitmap;

        // Goat body (brown)
        const bodyColor = this.utils.getColor('#8B4513');
        const bodyX = Math.floor(width * 0.5);
        const bodyY = Math.floor(height * 0.6);
        const bodyRadiusX = Math.floor(width * 0.35);
        const bodyRadiusY = Math.floor(height * 0.3);
        this.utils.drawEllipse(image, bodyX, bodyY, bodyRadiusX, bodyRadiusY, bodyColor);

        // Goat head
        const headColor = this.utils.getColor('#654321');
        const headX = Math.floor(width * 0.5);
        const headY = Math.floor(height * 0.35);
        const headRadiusX = Math.floor(width * 0.18);
        const headRadiusY = Math.floor(height * 0.14);
        this.utils.drawEllipse(image, headX, headY, headRadiusX, headRadiusY, headColor);

        // Goat horns
        const hornColor = this.utils.getColor('#000000');
        this.utils.drawRectangle(image, Math.floor(width * 0.42), Math.floor(height * 0.25), Math.floor(width * 0.03), Math.floor(height * 0.1), hornColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.55), Math.floor(height * 0.25), Math.floor(width * 0.03), Math.floor(height * 0.1), hornColor);

        // Lion head (secondary)
        const lionHeadColor = this.utils.getColor('#FFD700');
        const lionHeadX = Math.floor(width * 0.7);
        const lionHeadY = Math.floor(height * 0.4);
        const lionHeadRadiusX = Math.floor(width * 0.12);
        const lionHeadRadiusY = Math.floor(height * 0.1);
        this.utils.drawEllipse(image, lionHeadX, lionHeadY, lionHeadRadiusX, lionHeadRadiusY, lionHeadColor);

        // Snake head (tertiary)
        const snakeHeadColor = this.utils.getColor('#228B22');
        const snakeHeadX = Math.floor(width * 0.3);
        const snakeHeadY = Math.floor(height * 0.45);
        const snakeHeadRadiusX = Math.floor(width * 0.08);
        const snakeHeadRadiusY = Math.floor(height * 0.06);
        this.utils.drawEllipse(image, snakeHeadX, snakeHeadY, snakeHeadRadiusX, snakeHeadRadiusY, snakeHeadColor);

        // Wings
        const wingColor = this.utils.getColor('#DC143C');
        this.utils.drawRectangle(image, Math.floor(width * 0.1), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);
        this.utils.drawRectangle(image, Math.floor(width * 0.7), Math.floor(height * 0.45), Math.floor(width * 0.2), Math.floor(height * 0.25), wingColor);

        // Legs
        const legColor = this.utils.getColor('#8B4513');
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(width * (0.35 + i * 0.1));
            const legWidth = Math.floor(width * 0.03);
            const legHeight = Math.floor(height * 0.15);
            const legY = Math.floor(height * 0.8);
            this.utils.drawRectangle(image, x, legY, legWidth, legHeight, legColor);
        }
    }
}

module.exports = MonsterGenerator;
