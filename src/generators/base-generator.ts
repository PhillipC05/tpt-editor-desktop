/**
 * TPT Asset Editor Desktop - Base Generator Class (TypeScript)
 * Provides common functionality and patterns for all asset generators
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  Asset,
  AssetConfig,
  AssetMetadata,
  GeneratorResult,
  ValidationResult
} from '../types/index.js';

/**
 * Generator options interface
 */
export interface GeneratorOptions {
  name?: string;
  version?: string;
  description?: string;
  assetType?: string;
  defaultConfig?: Partial<AssetConfig>;
  supportedFormats?: string[];
  maxBatchSize?: number;
  cacheEnabled?: boolean;
  cacheMaxSize?: number;
}

/**
 * Generation options interface
 */
export interface GenerationOptions {
  operationId?: string;
  useCache?: boolean;
  trackProgress?: boolean;
  batchIndex?: number;
  batchId?: string;
  id?: string;
  namePrefix?: string;
  nameSuffix?: string;
  quality?: string;
  tags?: string[];
  postProcessing?: PostProcessingOptions;
}

/**
 * Post-processing options interface
 */
export interface PostProcessingOptions {
  resize?: {
    width: number;
    height: number;
  };
  optimize?: {
    quality: number;
    compression: string;
  };
}

/**
 * Generation statistics interface
 */
export interface GenerationStats {
  totalGenerated: number;
  totalTime: number;
  averageTime: number;
  successRate: number;
  lastGenerated: string | null;
}

/**
 * Progress tracking interface
 */
export interface ProgressInfo {
  operation: string | null;
  completed: number;
  total: number;
  startTime: number | null;
}

/**
 * Batch result interface
 */
export interface BatchResult {
  success: boolean;
  asset?: Asset;
  error?: string;
  index: number;
  config?: any;
}

/**
 * Progress tracker interface
 */
export interface ProgressTracker {
  operation: string;
  completed: number;
  total: number;
  startTime: number;
  update: (completed: number) => void;
  complete: () => void;
}

/**
 * Base Generator Class - TypeScript Implementation
 */
export abstract class BaseGenerator extends EventEmitter {
  // Generator metadata
  public name: string;
  public version: string;
  public description: string;
  public assetType: string;

  // Configuration
  public defaultConfig: Partial<AssetConfig>;
  public supportedFormats: string[];
  public maxBatchSize: number;

  // Performance tracking
  public generationStats: GenerationStats;

  // Caching
  public cache: Map<string, Asset>;
  public cacheEnabled: boolean;
  public cacheMaxSize: number;

  // Validation
  public validators: Map<string, (value: any, config: any) => Promise<boolean> | boolean>;

  // Progress tracking
  public currentProgress: ProgressInfo;

  constructor(options: GeneratorOptions = {}) {
    super();

    // Generator metadata
    this.name = options.name || 'Base Generator';
    this.version = options.version || '1.0.0';
    this.description = options.description || 'Base asset generator';
    this.assetType = options.assetType || 'unknown';

    // Configuration defaults
    this.defaultConfig = options.defaultConfig || {};
    this.supportedFormats = options.supportedFormats || ['png'];
    this.maxBatchSize = options.maxBatchSize || 50;

    // Performance tracking
    this.generationStats = {
      totalGenerated: 0,
      totalTime: 0,
      averageTime: 0,
      successRate: 100,
      lastGenerated: null
    };

    // Caching
    this.cache = new Map<string, Asset>();
    this.cacheEnabled = options.cacheEnabled !== false;
    this.cacheMaxSize = options.cacheMaxSize || 100;

    // Validation
    this.validators = new Map<string, (value: any, config: any) => Promise<boolean> | boolean>();

    // Progress tracking
    this.currentProgress = {
      operation: null,
      completed: 0,
      total: 0,
      startTime: null
    };
  }

  /**
   * Generate asset with common processing pipeline
   */
  public async generate(config: Partial<AssetConfig> = {}, options: GenerationOptions = {}): Promise<Asset> {
    const startTime = Date.now();
    const operationId = options.operationId || uuidv4();

    try {
      // Validate configuration
      const validatedConfig = await this.validateConfig(config);

      // Check cache first
      if (this.cacheEnabled && options.useCache !== false) {
        const cacheKey = this.getCacheKey(validatedConfig);
        const cachedResult = this.cache.get(cacheKey);
        if (cachedResult) {
          this.emit('cacheHit', { operationId, cacheKey });
          return cachedResult;
        }
      }

      // Emit generation start event
      this.emit('generationStart', {
        operationId,
        config: validatedConfig,
        options
      });

      // Pre-generation setup
      await this.preGenerate(validatedConfig, options);

      // Core generation logic (implemented by subclasses)
      const result = await this.generateAsset(validatedConfig, options);

      // Post-generation processing
      const processedResult = await this.postGenerate(result, validatedConfig, options);

      // Create standardized asset object
      const asset = this.createAssetObject(processedResult, validatedConfig, options);

      // Cache result if enabled
      if (this.cacheEnabled && options.useCache !== false) {
        const cacheKey = this.getCacheKey(validatedConfig);
        this.cache.set(cacheKey, asset);

        // Maintain cache size limit
        if (this.cache.size > this.cacheMaxSize) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) {
            this.cache.delete(firstKey);
          }
        }
      }

      // Update statistics
      const generationTime = Date.now() - startTime;
      this.updateGenerationStats(generationTime, true);

      // Emit success event
      this.emit('generationSuccess', {
        operationId,
        asset,
        generationTime,
        config: validatedConfig
      });

      return asset;

    } catch (error) {
      // Update statistics for failure
      const generationTime = Date.now() - startTime;
      this.updateGenerationStats(generationTime, false);

      // Emit error event
      this.emit('generationError', {
        operationId,
        error: (error as Error).message,
        config,
        generationTime
      });

      throw error;
    }
  }

  /**
   * Generate multiple assets in batch
   */
  public async generateBatch(configs: Partial<AssetConfig>[] = [], options: GenerationOptions = {}): Promise<BatchResult[]> {
    const results: BatchResult[] = [];
    const startTime = Date.now();
    const batchId = options.batchId || uuidv4();

    this.emit('batchStart', { batchId, count: configs.length });

    for (let i = 0; i < configs.length; i++) {
      try {
        const config = configs[i];
        const asset = await this.generate(config, {
          ...options,
          batchIndex: i,
          batchId,
          operationId: `${batchId}-${i}`
        });

        results.push({
          success: true,
          asset,
          index: i
        });

        // Emit batch progress
        this.emit('batchProgress', {
          batchId,
          completed: i + 1,
          total: configs.length,
          currentAsset: asset
        });

      } catch (error) {
        results.push({
          success: false,
          error: (error as Error).message,
          index: i,
          config: configs[i]
        });

        this.emit('batchError', {
          batchId,
          index: i,
          error: (error as Error).message
        });
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;

    this.emit('batchComplete', {
      batchId,
      results,
      totalTime,
      successCount,
      totalCount: configs.length
    });

    return results;
  }

  /**
   * Validate configuration object
   */
  public async validateConfig(config: Partial<AssetConfig>): Promise<AssetConfig> {
    // Merge with defaults
    const mergedConfig = { ...this.defaultConfig, ...config } as AssetConfig;

    // Run custom validators
    for (const [key, validator] of this.validators) {
      try {
        const value = (mergedConfig as any)[key];
        const isValid = await validator(value, mergedConfig);
        if (!isValid) {
          throw new Error(`Validation failed for ${key}: ${value}`);
        }
      } catch (error) {
        throw new Error(`Configuration validation error: ${(error as Error).message}`);
      }
    }

    // Run built-in validation
    await this.validateConfigInternal(mergedConfig);

    return mergedConfig;
  }

  /**
   * Internal configuration validation (override in subclasses)
   */
  protected async validateConfigInternal(config: AssetConfig): Promise<void> {
    // Default validation - can be overridden by subclasses
    if (typeof config !== 'object') {
      throw new Error('Configuration must be an object');
    }
  }

  /**
   * Pre-generation setup
   */
  protected async preGenerate(config: AssetConfig, options: GenerationOptions): Promise<void> {
    // Setup progress tracking
    if (options.trackProgress) {
      this.currentProgress = {
        operation: 'generation',
        completed: 0,
        total: 100,
        startTime: Date.now()
      };
    }

    // Emit pre-generation event
    this.emit('preGenerate', { config, options });
  }

  /**
   * Core asset generation logic (must be implemented by subclasses)
   */
  protected abstract generateAsset(config: AssetConfig, options: GenerationOptions): Promise<GeneratorResult>;

  /**
   * Post-generation processing
   */
  protected async postGenerate(result: GeneratorResult, config: AssetConfig, options: GenerationOptions): Promise<GeneratorResult> {
    // Apply post-processing if specified
    if (options.postProcessing) {
      return await this.applyPostProcessing(result, options.postProcessing);
    }

    return result;
  }

  /**
   * Create standardized asset object
   */
  protected createAssetObject(result: GeneratorResult, config: AssetConfig, options: GenerationOptions): Asset {
    const asset: Asset = {
      id: options.id || uuidv4(),
      asset_id: options.id || uuidv4(),
      asset_type: this.assetType,
      name: this.generateAssetName(result, config, options),
      config: config,
      metadata: this.generateMetadata(result, config, options),
      file_size: 0,
      quality_score: result.metadata?.quality || 0,
      tags: options.tags || [],
      category: this.assetType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add result-specific data
    if (result.data) {
      (asset as any).data = result.data;
    }

    return asset;
  }

  /**
   * Generate asset name
   */
  protected generateAssetName(result: GeneratorResult, config: AssetConfig, options: GenerationOptions): string {
    // Default naming strategy - can be overridden
    const prefix = options.namePrefix || '';
    const suffix = options.nameSuffix || '';
    const baseName = (config as any).name || `${this.assetType.charAt(0).toUpperCase() + this.assetType.slice(1)} Asset`;

    return `${prefix}${baseName}${suffix}`;
  }

  /**
   * Generate asset metadata
   */
  protected generateMetadata(result: GeneratorResult, config: AssetConfig, options: GenerationOptions): AssetMetadata {
    return {
      generator: this.name,
      version: this.version,
      createdAt: new Date().toISOString(),
      tags: options.tags || [],
      category: this.assetType,
      dependencies: [],
      qualityScore: result.metadata?.quality || 0,
      fileSize: 0,
      dimensions: (result.metadata as any)?.dimensions || { width: 0, height: 0 }
    };
  }

  /**
   * Apply post-processing to result
   */
  protected async applyPostProcessing(result: GeneratorResult, postProcessing: PostProcessingOptions): Promise<GeneratorResult> {
    // Default post-processing - can be extended by subclasses
    if (postProcessing.resize && (result as any).sprite) {
      return await this.resizeAsset(result, postProcessing.resize);
    }

    if (postProcessing.optimize && (result as any).sprite) {
      return await this.optimizeAsset(result, postProcessing.optimize);
    }

    return result;
  }

  /**
   * Get cache key for configuration
   */
  protected getCacheKey(config: AssetConfig): string {
    // Create a deterministic string from config
    return JSON.stringify(config, Object.keys(config).sort());
  }

  /**
   * Update generation statistics
   */
  protected updateGenerationStats(generationTime: number, success: boolean): void {
    this.generationStats.totalGenerated++;
    this.generationStats.totalTime += generationTime;
    this.generationStats.averageTime = this.generationStats.totalTime / this.generationStats.totalGenerated;
    this.generationStats.lastGenerated = new Date().toISOString();

    if (!success) {
      const failureRate = (this.generationStats.totalGenerated - (this.generationStats.successRate / 100 * this.generationStats.totalGenerated)) / this.generationStats.totalGenerated;
      this.generationStats.successRate = (1 - failureRate) * 100;
    }
  }

  /**
   * Get generation statistics
   */
  public getGenerationStats(): GenerationStats {
    return { ...this.generationStats };
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.emit('cacheCleared');
  }

  /**
   * Get cache size
   */
  public getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Add configuration validator
   */
  public addValidator(key: string, validator: (value: any, config: any) => Promise<boolean> | boolean): void {
    this.validators.set(key, validator);
  }

  /**
   * Remove configuration validator
   */
  public removeValidator(key: string): void {
    this.validators.delete(key);
  }

  /**
   * Export generator configuration
   */
  public exportConfiguration(): any {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      assetType: this.assetType,
      defaultConfig: { ...this.defaultConfig },
      supportedFormats: [...this.supportedFormats],
      maxBatchSize: this.maxBatchSize,
      cacheEnabled: this.cacheEnabled,
      cacheMaxSize: this.cacheMaxSize,
      validators: Array.from(this.validators.keys()),
      generationStats: { ...this.generationStats }
    };
  }

  /**
   * Import generator configuration
   */
  public importConfiguration(config: any): void {
    if (config.name) this.name = config.name;
    if (config.version) this.version = config.version;
    if (config.description) this.description = config.description;
    if (config.assetType) this.assetType = config.assetType;
    if (config.defaultConfig) this.defaultConfig = { ...config.defaultConfig };
    if (config.supportedFormats) this.supportedFormats = [...config.supportedFormats];
    if (config.maxBatchSize) this.maxBatchSize = config.maxBatchSize;
    if (config.cacheEnabled !== undefined) this.cacheEnabled = config.cacheEnabled;
    if (config.cacheMaxSize) this.cacheMaxSize = config.cacheMaxSize;

    this.emit('configurationImported', config);
  }

  /**
   * Create progress tracker
   */
  public createProgressTracker(operation: string, total: number): ProgressTracker {
    return {
      operation,
      completed: 0,
      total,
      startTime: Date.now(),
      update: (completed: number) => {
        this.currentProgress.completed = completed;
        this.emit('progressUpdate', {
          operation,
          completed,
          total,
          percentage: (completed / total) * 100
        });
      },
      complete: () => {
        const duration = Date.now() - (this.currentProgress.startTime || Date.now());
        this.emit('progressComplete', {
          operation,
          duration,
          total
        });
      }
    };
  }

  /**
   * Get current progress
   */
  public getCurrentProgress(): ProgressInfo {
    return { ...this.currentProgress };
  }

  /**
   * Utility method to resize assets
   */
  protected async resizeAsset(asset: GeneratorResult, dimensions: { width: number; height: number }): Promise<GeneratorResult> {
    // Default implementation - should be overridden by subclasses
    console.warn('resizeAsset() not implemented for this generator type');
    return asset;
  }

  /**
   * Utility method to optimize assets
   */
  protected async optimizeAsset(asset: GeneratorResult, options: { quality: number; compression: string }): Promise<GeneratorResult> {
    // Default implementation - should be overridden by subclasses
    console.warn('optimizeAsset() not implemented for this generator type');
    return asset;
  }

  /**
   * Utility method to validate asset
   */
  public async validateAsset(asset: Asset): Promise<boolean> {
    // Basic validation
    if (!asset.id) {
      throw new Error('Asset must have an ID');
    }

    if (!asset.name) {
      throw new Error('Asset must have a name');
    }

    if (!asset.asset_type) {
      throw new Error('Asset must have a type');
    }

    return true;
  }

  /**
   * Utility method to merge configurations
   */
  protected mergeConfigurations(baseConfig: AssetConfig, overrideConfig: Partial<AssetConfig>): AssetConfig {
    return { ...baseConfig, ...overrideConfig };
  }

  /**
   * Utility method to deep clone objects
   */
  protected deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Utility method to generate random values within range
   */
  protected randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Utility method to clamp values
   */
  protected clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Utility method to normalize values
   */
  protected normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    // Clear cache
    this.clearCache();

    // Clear validators
    this.validators.clear();

    // Remove all listeners
    this.removeAllListeners();

    // Reset progress
    this.currentProgress = {
      operation: null,
      completed: 0,
      total: 0,
      startTime: null
    };

    console.log(`Cleaned up ${this.name} generator`);
  }
}

export default BaseGenerator;
