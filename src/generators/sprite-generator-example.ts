/**
 * Example TypeScript Sprite Generator
 * Demonstrates TypeScript migration with proper type safety
 */

import { BaseGenerator, GeneratorOptions, GenerationOptions } from './base-generator.js';
import { AssetConfig, GeneratorResult } from '../types/index.js';

/**
 * Sprite-specific configuration interface
 */
interface SpriteConfig extends AssetConfig {
  width: number;
  height: number;
  colors: string[];
  style: 'pixel' | 'smooth' | 'retro';
  complexity: 'simple' | 'medium' | 'complex';
  theme?: string;
}

/**
 * Sprite generation result interface
 */
interface SpriteResult extends GeneratorResult {
  sprite: {
    data: Buffer;
    width: number;
    height: number;
    format: string;
  };
  metadata: GeneratorResult['metadata'] & {
    colors: string[];
    complexity: number;
    dimensions: { width: number; height: number };
  };
}

/**
 * Example Sprite Generator - TypeScript Implementation
 */
export class SpriteGeneratorExample extends BaseGenerator {
  constructor(options: GeneratorOptions = {}) {
    super({
      name: 'TypeScript Sprite Generator',
      version: '1.0.0',
      description: 'Example sprite generator implemented in TypeScript',
      assetType: 'sprite',
      supportedFormats: ['png', 'webp'],
      maxBatchSize: 20,
      cacheEnabled: true,
      cacheMaxSize: 50,
      ...options
    });

    // Add sprite-specific validators
    this.addValidator('width', (value: any) => {
      return typeof value === 'number' && value >= 8 && value <= 512;
    });

    this.addValidator('height', (value: any) => {
      return typeof value === 'number' && value >= 8 && value <= 512;
    });

    this.addValidator('colors', (value: any) => {
      return Array.isArray(value) && value.length >= 1 && value.length <= 16;
    });
  }

  /**
   * Generate sprite asset
   */
  protected async generateAsset(config: AssetConfig, options: GenerationOptions): Promise<SpriteResult> {
    const spriteConfig = config as SpriteConfig;
    const startTime = Date.now();

    // Update progress
    this.currentProgress.completed = 10;
    this.emit('progressUpdate', {
      operation: 'sprite-generation',
      completed: 10,
      total: 100,
      message: 'Initializing sprite generation...'
    });

    // Generate sprite data (simplified example)
    const spriteData = await this.generateSpriteData(spriteConfig);

    // Update progress
    this.currentProgress.completed = 80;
    this.emit('progressUpdate', {
      operation: 'sprite-generation',
      completed: 80,
      total: 100,
      message: 'Finalizing sprite...'
    });

    const generationTime = Date.now() - startTime;

    const result: SpriteResult = {
      success: true,
      data: spriteData.buffer,
      sprite: {
        data: spriteData.buffer,
        width: spriteConfig.width,
        height: spriteConfig.height,
        format: 'png'
      },
      metadata: {
        generator: this.name,
        duration: generationTime,
        quality: this.calculateQualityScore(spriteConfig),
        size: spriteData.buffer.length,
        colors: spriteConfig.colors,
        complexity: this.getComplexityScore(spriteConfig.complexity),
        dimensions: {
          width: spriteConfig.width,
          height: spriteConfig.height
        }
      }
    };

    // Complete progress
    this.currentProgress.completed = 100;
    this.emit('progressUpdate', {
      operation: 'sprite-generation',
      completed: 100,
      total: 100,
      message: 'Sprite generation complete!'
    });

    return result;
  }

  /**
   * Generate sprite pixel data
   */
  private async generateSpriteData(config: SpriteConfig): Promise<{ buffer: Buffer }> {
    // This is a simplified example - in a real implementation,
    // this would generate actual pixel data
    const pixelCount = config.width * config.height * 4; // RGBA
    const buffer = Buffer.alloc(pixelCount);

    // Simple pattern generation based on style
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const index = (y * config.width + x) * 4;

        if (this.shouldDrawPixel(x, y, config)) {
          const color = this.selectColor(x, y, config.colors);
          const rgba = this.hexToRgba(color);

          buffer[index] = rgba.r;     // Red
          buffer[index + 1] = rgba.g; // Green
          buffer[index + 2] = rgba.b; // Blue
          buffer[index + 3] = rgba.a; // Alpha
        } else {
          // Transparent background
          buffer[index] = 0;
          buffer[index + 1] = 0;
          buffer[index + 2] = 0;
          buffer[index + 3] = 0;
        }
      }
    }

    return { buffer };
  }

  /**
   * Determine if a pixel should be drawn
   */
  private shouldDrawPixel(x: number, y: number, config: SpriteConfig): boolean {
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const maxDistance = Math.min(centerX, centerY);

    // Create different patterns based on style
    switch (config.style) {
      case 'pixel':
        return distance < maxDistance * 0.8;
      case 'smooth':
        return distance < maxDistance;
      case 'retro':
        return (x + y) % 3 === 0 && distance < maxDistance * 0.9;
      default:
        return distance < maxDistance * 0.7;
    }
  }

  /**
   * Select color for pixel
   */
  private selectColor(x: number, y: number, colors: string[]): string {
    const colorIndex = (x + y) % colors.length;
    return colors[colorIndex];
  }

  /**
   * Convert hex color to RGBA
   */
  private hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : { r: 0, g: 0, b: 0, a: 255 };
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(config: SpriteConfig): number {
    let score = 50; // Base score

    // Size bonus
    if (config.width >= 64 && config.height >= 64) score += 20;
    else if (config.width >= 32 && config.height >= 32) score += 10;

    // Color variety bonus
    if (config.colors.length >= 4) score += 15;
    else if (config.colors.length >= 2) score += 5;

    // Style bonus
    switch (config.style) {
      case 'smooth': score += 10; break;
      case 'pixel': score += 5; break;
      case 'retro': score += 8; break;
    }

    // Complexity bonus
    switch (config.complexity) {
      case 'complex': score += 15; break;
      case 'medium': score += 8; break;
      case 'simple': score += 2; break;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get complexity score
   */
  private getComplexityScore(complexity: string | undefined): number {
    switch (complexity) {
      case 'simple': return 1;
      case 'medium': return 2;
      case 'complex': return 3;
      default: return 1;
    }
  }

  /**
   * Validate sprite-specific configuration
   */
  protected override async validateConfigInternal(config: AssetConfig): Promise<void> {
    const spriteConfig = config as SpriteConfig;

    if (!spriteConfig.colors || !Array.isArray(spriteConfig.colors)) {
      throw new Error('Sprite configuration must include a colors array');
    }

    if (spriteConfig.colors.length === 0) {
      throw new Error('Sprite must have at least one color');
    }

    // Validate color format
    for (const color of spriteConfig.colors) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        throw new Error(`Invalid color format: ${color}. Must be in #RRGGBB format`);
      }
    }

    // Validate dimensions are reasonable for sprites
    if (spriteConfig.width > 512 || spriteConfig.height > 512) {
      throw new Error('Sprite dimensions cannot exceed 512x512 pixels');
    }

    if (spriteConfig.width < 8 || spriteConfig.height < 8) {
      throw new Error('Sprite dimensions must be at least 8x8 pixels');
    }
  }

  /**
   * Get default sprite configuration
   */
  public getDefaultConfig(): SpriteConfig {
    return {
      width: 64,
      height: 64,
      colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
      style: 'pixel',
      complexity: 'medium',
      quality: 'medium',
      format: 'png'
    };
  }

  /**
   * Export sprite generator configuration
   */
  public exportConfiguration(): any {
    const baseConfig = super.exportConfiguration();
    return {
      ...baseConfig,
      spriteDefaults: this.getDefaultConfig(),
      supportedStyles: ['pixel', 'smooth', 'retro'],
      supportedComplexities: ['simple', 'medium', 'complex']
    };
  }
}

export default SpriteGeneratorExample;
