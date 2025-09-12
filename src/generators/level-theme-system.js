/**
 * Level Theme System
 * Applies themes and styling to levels
 */

class LevelThemeSystem {
    constructor() {}

    async applyTheme(config, level) {
        const themedConfig = { ...config };

        // Apply theme-specific modifications
        switch (config.theme) {
            case 'classic':
                themedConfig.tileSet = 'medieval';
                themedConfig.colorPalette = 'warm';
                break;
            case 'dark':
                themedConfig.tileSet = 'dungeon';
                themedConfig.colorPalette = 'cool';
                break;
            case 'bright':
                themedConfig.tileSet = 'fantasy';
                themedConfig.colorPalette = 'vibrant';
                break;
            default:
                themedConfig.tileSet = 'default';
                themedConfig.colorPalette = 'neutral';
        }

        // Apply difficulty modifications
        switch (config.difficulty) {
            case 'easy':
                themedConfig.enemyDensity = 0.3;
                themedConfig.trapFrequency = 0.2;
                break;
            case 'normal':
                themedConfig.enemyDensity = 0.5;
                themedConfig.trapFrequency = 0.4;
                break;
            case 'hard':
                themedConfig.enemyDensity = 0.7;
                themedConfig.trapFrequency = 0.6;
                break;
        }

        return themedConfig;
    }

    /**
     * Get available themes
     */
    getAvailableThemes() {
        return [
            'classic',
            'dark',
            'bright',
            'mystical',
            'industrial',
            'natural',
            'ruins',
            'ice',
            'fire',
            'forest'
        ];
    }

    /**
     * Get theme properties
     */
    getThemeProperties(theme) {
        const themes = {
            classic: {
                primaryColor: '#8B4513',
                secondaryColor: '#228B22',
                accentColor: '#FFD700',
                atmosphere: 'medieval'
            },
            dark: {
                primaryColor: '#2F2F2F',
                secondaryColor: '#696969',
                accentColor: '#FF4500',
                atmosphere: 'dungeon'
            },
            bright: {
                primaryColor: '#87CEEB',
                secondaryColor: '#98FB98',
                accentColor: '#FFFF00',
                atmosphere: 'fantasy'
            }
        };

        return themes[theme] || themes.classic;
    }
}

module.exports = LevelThemeSystem;
