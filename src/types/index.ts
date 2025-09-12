/**
 * Core Type Definitions for TPT Asset Editor
 * TypeScript type definitions and interfaces
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface AppConfig {
  version: string;
  name: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface SystemInfo {
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: number;
  freeMemory: number;
  hostname: string;
  userInfo: {
    username: string;
    homedir: string;
  };
}

export interface PerformanceMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  eventLoopLag: number;
}

// ============================================================================
// ASSET TYPES
// ============================================================================

export interface AssetConfig {
  width: number;
  height: number;
  colors: string[];
  style: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'png' | 'jpeg' | 'webp';
  [key: string]: any;
}

export interface AssetMetadata {
  generator: string;
  version: string;
  createdAt: string;
  tags: string[];
  category: string;
  dependencies: string[];
  qualityScore: number;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface Asset {
  id: string;
  asset_id: string;
  asset_type: string;
  name: string;
  config: AssetConfig;
  metadata: AssetMetadata;
  file_path?: string;
  file_size: number;
  quality_score: number;
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
}

export interface AssetGenerationResult {
  success: boolean;
  asset?: Asset;
  error?: string;
  duration: number;
  data?: any;
}

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface DatabaseConfig {
  path: string;
  maxConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
  enableWAL: boolean;
  cacheSize: number;
}

export interface DatabaseStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  totalQueries: number;
  slowQueries: number;
  cacheHits: number;
  cacheMisses: number;
}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheConfig {
  maxSize: number;
  maxAge: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  cleanupInterval: number;
}

export interface CacheEntry {
  key: string;
  assetType: string;
  config: AssetConfig;
  data: any;
  size: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  compressed: boolean;
  encrypted: boolean;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  memoryUsage: number;
  hitRate: number;
  missRate: number;
  averageAccessTime: number;
}

// ============================================================================
// JOB/BACKGROUND PROCESSING TYPES
// ============================================================================

export interface JobConfig {
  type: string;
  data: any;
  priority: number;
  maxAttempts: number;
  timeout: number;
  dependencies?: string[];
}

export interface Job {
  id: number;
  type: string;
  data: any;
  priority: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  progressMessage: string;
  attempts: number;
  maxAttempts: number;
  timeout: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  duration?: number;
  result?: any;
  error?: string;
  errorStack?: string;
}

export interface JobStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  runningJobs: number;
  queuedJobs: number;
  averageDuration: number;
  successRate: number;
}

// ============================================================================
// PLUGIN TYPES
// ============================================================================

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  dependencies?: Record<string, string>;
  engines?: Record<string, string>;
  keywords?: string[];
  homepage?: string;
  repository?: string;
  license?: string;
}

export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  path: string;
  enabled: boolean;
  settings: Record<string, any>;
  installedAt: string;
  loadedAt?: string;
}

export interface Plugin {
  id: string;
  instance: any;
  manifest: PluginManifest;
  config: PluginConfig;
  hooks: Map<string, Function>;
}

export interface PluginHookContext {
  plugin: Plugin;
  args: any[];
  result?: any;
}

// ============================================================================
// WINDOW MANAGEMENT TYPES
// ============================================================================

export interface WindowConfig {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  x?: number;
  y?: number;
  center?: boolean;
  resizable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  closable: boolean;
  alwaysOnTop: boolean;
  fullscreenable: boolean;
  skipTaskbar: boolean;
  titleBarStyle: 'default' | 'hidden' | 'hiddenInset';
  vibrancy?: 'appearance-based' | 'light' | 'dark' | 'titlebar' | 'selection' | 'menu' | 'popover' | 'sidebar' | 'medium-light' | 'ultra-dark';
}

export interface WindowState {
  id: number;
  bounds: Electron.Rectangle;
  isMaximized: boolean;
  isMinimized: boolean;
  isFullScreen: boolean;
  isVisible: boolean;
  isFocused: boolean;
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface ErrorInfo {
  type: 'CRITICAL' | 'APP_ERROR' | 'GENERATOR_ERROR' | 'DATABASE_ERROR' | 'FILESYSTEM_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'PLUGIN_ERROR' | 'UNHANDLED_ERROR';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: string;
  processInfo: {
    pid: number;
    platform: string;
    arch: string;
    nodeVersion: string;
    electronVersion: string;
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
  };
}

export interface ErrorReport {
  generatedAt: string;
  systemInfo: SystemInfo;
  errorStats: {
    total: number;
    byType: Record<string, number>;
    recent: Array<{
      type: string;
      message: string;
      timestamp: string;
    }>;
    timeline: Record<string, number>;
  };
  recommendations: Array<{
    type: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
    actions: string[];
  }>;
}

// ============================================================================
// IPC TYPES
// ============================================================================

export interface IPCHandler {
  channel: string;
  handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>;
  validate?: (args: any[]) => boolean;
  sanitize?: (args: any[]) => any[];
}

export interface IPCRequest {
  channel: string;
  args: any[];
  timeout?: number;
}

export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  maxRecentFiles: number;
  showWelcomeScreen: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enableAutoUpdates: boolean;
}

export interface GeneratorSettings {
  defaultQuality: 'low' | 'medium' | 'high' | 'ultra';
  defaultFormat: 'png' | 'jpeg' | 'webp';
  maxConcurrentGenerations: number;
  enableCaching: boolean;
  cacheMaxSize: number;
  cacheMaxAge: number;
}

export interface PerformanceSettings {
  maxMemoryUsage: number;
  workerThreads: number;
  enableGPUAcceleration: boolean;
  textureCompression: boolean;
  batchProcessingSize: number;
}

export interface SecuritySettings {
  enableSandbox: boolean;
  enableContextIsolation: boolean;
  allowedDomains: string[];
  enableCSP: boolean;
  enableCORP: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Note: Using built-in Required<T> instead of custom implementation

export type ValueOf<T> = T[keyof T];

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Constructor<T = {}> = new (...args: any[]) => T;

export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface AppEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source: string;
}

export interface AssetEvent extends AppEvent {
  type: 'asset-created' | 'asset-updated' | 'asset-deleted' | 'asset-generated';
  payload: {
    asset: Asset;
    operation: string;
  };
}

export interface JobEvent extends AppEvent {
  type: 'job-queued' | 'job-started' | 'job-completed' | 'job-failed' | 'job-cancelled';
  payload: {
    job: Job;
  };
}

export interface PluginEvent extends AppEvent {
  type: 'plugin-loaded' | 'plugin-unloaded' | 'plugin-enabled' | 'plugin-disabled';
  payload: {
    plugin: PluginConfig;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: number;
    duration: number;
    version: string;
  };
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  meta: {
    timestamp: number;
    duration: number;
    version: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationRule<T = any> {
  name: string;
  validate: (value: T) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    rule: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    field: string;
    rule: string;
    message: string;
  }>;
}

// ============================================================================
// GENERATOR TYPES
// ============================================================================

export interface GeneratorConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  supportedTypes: string[];
  configSchema: any;
  capabilities: string[];
}

export interface GeneratorResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    generator: string;
    duration: number;
    quality: number;
    size: number;
  };
}

export interface GeneratorHookContext {
  config: AssetConfig;
  metadata: AssetMetadata;
  progress?: (progress: number, message: string) => void;
}

// ============================================================================
// EXPORT
// ============================================================================

// All types are exported via interface declarations above
// Built-in types like Required<T> are available globally
