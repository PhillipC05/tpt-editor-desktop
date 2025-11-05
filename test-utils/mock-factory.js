/**
 * Mock Factory
 * Creates mock instances of common objects for testing
 */

/**
 * Create a mock Canvas instance
 */
function createMockCanvas(width = 64, height = 64) {
  const imageData = {
    data: new Uint8ClampedArray(width * height * 4),
    width,
    height,
  };

  const context = {
    canvas: null, // Will be set after canvas is created
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: '10px sans-serif',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',

    // Drawing methods
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    measureText: jest.fn((text) => ({ width: text.length * 5 })),

    // Path methods
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    arcTo: jest.fn(),
    ellipse: jest.fn(),
    rect: jest.fn(),

    // Path drawing
    fill: jest.fn(),
    stroke: jest.fn(),
    clip: jest.fn(),

    // Transformations
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    setTransform: jest.fn(),
    resetTransform: jest.fn(),

    // State
    save: jest.fn(),
    restore: jest.fn(),

    // Image data
    createImageData: jest.fn((w, h) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    })),
    getImageData: jest.fn((x, y, w, h) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    })),
    putImageData: jest.fn(),

    // Drawing images
    drawImage: jest.fn(),

    // Gradients and patterns
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
    createRadialGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
    createPattern: jest.fn(),
  };

  const canvas = {
    width,
    height,
    getContext: jest.fn((type) => {
      if (type === '2d') return context;
      return null;
    }),
    toBuffer: jest.fn((mimeType) => Buffer.from([])),
    toDataURL: jest.fn((mimeType) => `data:${mimeType || 'image/png'};base64,`),
    toBlob: jest.fn((callback, mimeType) => {
      callback(new Blob([], { type: mimeType || 'image/png' }));
    }),
  };

  context.canvas = canvas;
  return canvas;
}

/**
 * Create a mock Database instance
 */
function createMockDatabase() {
  const mockStatements = new Map();

  const mockStatement = (sql) => {
    if (!mockStatements.has(sql)) {
      mockStatements.set(sql, {
        run: jest.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
        get: jest.fn(() => null),
        all: jest.fn(() => []),
        iterate: jest.fn(function* () {}),
      });
    }
    return mockStatements.get(sql);
  };

  return {
    prepare: jest.fn((sql) => mockStatement(sql)),
    exec: jest.fn(() => undefined),
    pragma: jest.fn(() => []),
    function: jest.fn(),
    aggregate: jest.fn(),
    table: jest.fn(),
    loadExtension: jest.fn(),
    close: jest.fn(),
    defaultSafeIntegers: jest.fn(),
    backup: jest.fn(),
    serialize: jest.fn(),
    memory: false,
    readonly: false,
    name: 'test.db',
    open: true,
    inTransaction: false,
  };
}

/**
 * Create a mock AudioContext
 */
function createMockAudioContext() {
  const mockNodes = [];

  const createNode = (type) => {
    const node = {
      type,
      connect: jest.fn((destination) => node),
      disconnect: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    mockNodes.push(node);
    return node;
  };

  const context = {
    state: 'running',
    sampleRate: 44100,
    currentTime: 0,
    destination: createNode('destination'),
    listener: {},

    // Audio nodes
    createOscillator: jest.fn(() => ({
      ...createNode('oscillator'),
      type: 'sine',
      frequency: { value: 440 },
      detune: { value: 0 },
      start: jest.fn(),
      stop: jest.fn(),
    })),

    createGain: jest.fn(() => ({
      ...createNode('gain'),
      gain: { value: 1.0 },
    })),

    createBiquadFilter: jest.fn(() => ({
      ...createNode('biquadFilter'),
      type: 'lowpass',
      frequency: { value: 350 },
      Q: { value: 1 },
      gain: { value: 0 },
    })),

    createDelay: jest.fn((maxDelayTime) => ({
      ...createNode('delay'),
      delayTime: { value: 0 },
    })),

    createConvolver: jest.fn(() => ({
      ...createNode('convolver'),
      buffer: null,
      normalize: true,
    })),

    createDynamicsCompressor: jest.fn(() => ({
      ...createNode('dynamicsCompressor'),
      threshold: { value: -24 },
      knee: { value: 30 },
      ratio: { value: 12 },
      attack: { value: 0.003 },
      release: { value: 0.25 },
    })),

    createBufferSource: jest.fn(() => ({
      ...createNode('bufferSource'),
      buffer: null,
      loop: false,
      loopStart: 0,
      loopEnd: 0,
      playbackRate: { value: 1 },
      start: jest.fn(),
      stop: jest.fn(),
    })),

    createBuffer: jest.fn((channels, length, sampleRate) => ({
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: jest.fn((channel) => new Float32Array(length)),
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
    })),

    decodeAudioData: jest.fn((arrayBuffer) =>
      Promise.resolve({
        numberOfChannels: 2,
        length: 44100,
        sampleRate: 44100,
        duration: 1.0,
        getChannelData: jest.fn(() => new Float32Array(44100)),
      })
    ),

    // Context control
    close: jest.fn(() => Promise.resolve()),
    resume: jest.fn(() => Promise.resolve()),
    suspend: jest.fn(() => Promise.resolve()),
  };

  return context;
}

/**
 * Create a mock AudioBuffer
 */
function createMockAudioBuffer(channels = 2, length = 44100, sampleRate = 44100) {
  const channelData = Array.from({ length: channels }, () => new Float32Array(length));

  return {
    numberOfChannels: channels,
    length,
    sampleRate,
    duration: length / sampleRate,
    getChannelData: jest.fn((channel) => channelData[channel]),
    copyFromChannel: jest.fn(),
    copyToChannel: jest.fn(),
  };
}

/**
 * Create mock file system operations
 */
function createMockFileSystem() {
  const files = new Map();

  return {
    existsSync: jest.fn((path) => files.has(path)),
    readFileSync: jest.fn((path) => files.get(path) || Buffer.from([])),
    writeFileSync: jest.fn((path, data) => files.set(path, data)),
    unlinkSync: jest.fn((path) => files.delete(path)),
    mkdirSync: jest.fn(),
    readdirSync: jest.fn(() => Array.from(files.keys())),
    statSync: jest.fn((path) => ({
      isFile: () => files.has(path),
      isDirectory: () => false,
      size: files.get(path)?.length || 0,
    })),
    // Expose internal state for testing
    _files: files,
    _reset: () => files.clear(),
  };
}

/**
 * Create a mock Generator instance
 */
function createMockGenerator(type = 'test-generator') {
  return {
    type,
    generate: jest.fn(async (config) => ({
      data: Buffer.from([]),
      width: config.width || 64,
      height: config.height || 64,
      format: config.format || 'png',
      metadata: {},
    })),
    validate: jest.fn((config) => true),
    getDefaultConfig: jest.fn(() => ({})),
  };
}

/**
 * Create a mock Asset instance
 */
function createMockAsset(overrides = {}) {
  return {
    id: Math.floor(Math.random() * 10000),
    name: `test-asset-${Math.random().toString(36).substring(7)}`,
    type: 'sprite',
    width: 64,
    height: 64,
    data: Buffer.from([]),
    format: 'png',
    metadata: {},
    created_at: Date.now(),
    updated_at: Date.now(),
    ...overrides,
  };
}

module.exports = {
  createMockCanvas,
  createMockDatabase,
  createMockAudioContext,
  createMockAudioBuffer,
  createMockFileSystem,
  createMockGenerator,
  createMockAsset,
};
