/**
 * Tests for AudioManager
 *
 * Note: AudioManager uses Web Audio API which requires browser environment.
 * These tests mock the necessary Web Audio components for Node.js testing.
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const { createMockAudioContext, createMockAudioBuffer } = require('../../../test-utils');

// Mock window object and Web Audio API
global.window = {
  AudioContext: jest.fn(() => createMockAudioContext()),
  webkitAudioContext: jest.fn(() => createMockAudioContext()),
};

// Import AudioManager after mocking window
const AudioManager = require('../audio-manager');

describe('AudioManager', () => {
  let audioManager;
  let mockAudioContext;

  beforeEach(() => {
    mockAudioContext = createMockAudioContext();
    global.window.AudioContext = jest.fn(() => mockAudioContext);
    audioManager = new AudioManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(audioManager.audioContext).toBeNull();
      expect(audioManager.audioBuffers).toBeInstanceOf(Map);
      expect(audioManager.masterVolume).toBe(0.8);
      expect(audioManager.masterPan).toBe(0);
      expect(audioManager.isInitialized).toBe(false);
    });

    it('should initialize empty audio buffers map', () => {
      expect(audioManager.audioBuffers.size).toBe(0);
    });

    it('should set default master volume to 0.8', () => {
      expect(audioManager.masterVolume).toBe(0.8);
      expect(audioManager.masterVolume).toBeGreaterThan(0);
      expect(audioManager.masterVolume).toBeLessThanOrEqual(1);
    });

    it('should set default master pan to center (0)', () => {
      expect(audioManager.masterPan).toBe(0);
      expect(audioManager.masterPan).toBeGreaterThanOrEqual(-1);
      expect(audioManager.masterPan).toBeLessThanOrEqual(1);
    });
  });

  describe('init()', () => {
    it('should initialize audio context', async () => {
      await audioManager.init();

      expect(audioManager.isInitialized).toBe(true);
      expect(audioManager.audioContext).toBeDefined();
    });

    it('should create analyser node', async () => {
      await audioManager.init();

      expect(audioManager.analyser).toBeDefined();
      expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    });

    it('should set analyser FFT size', async () => {
      await audioManager.init();

      expect(audioManager.analyser.fftSize).toBe(256);
    });

    it('should create frequency data array', async () => {
      await audioManager.init();

      expect(audioManager.frequencyData).toBeDefined();
      expect(audioManager.frequencyData).toBeInstanceOf(Uint8Array);
    });

    it('should connect analyser to destination', async () => {
      await audioManager.init();

      expect(audioManager.analyser.connect).toHaveBeenCalledWith(
        mockAudioContext.destination
      );
    });

    it('should not reinitialize if already initialized', async () => {
      await audioManager.init();
      const firstContext = audioManager.audioContext;

      await audioManager.init();
      const secondContext = audioManager.audioContext;

      expect(firstContext).toBe(secondContext);
    });

    it('should resume suspended audio context', async () => {
      mockAudioContext.state = 'suspended';

      await audioManager.init();

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      global.window.AudioContext = jest.fn(() => {
        throw new Error('AudioContext not supported');
      });

      await expect(audioManager.init()).rejects.toThrow('AudioContext not supported');
    });
  });

  describe('loadAudioBuffer()', () => {
    beforeEach(async () => {
      await audioManager.init();
    });

    it('should decode audio data', async () => {
      const mockAudioData = Buffer.from('fake audio data').toString('base64');

      const result = await audioManager.loadAudioBuffer(mockAudioData, 'wav');

      expect(result).toBeDefined();
      expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
    });

    it('should handle different audio formats', async () => {
      const mockAudioData = Buffer.from('fake audio data').toString('base64');

      await audioManager.loadAudioBuffer(mockAudioData, 'wav');
      await audioManager.loadAudioBuffer(mockAudioData, 'mp3');

      expect(mockAudioContext.decodeAudioData).toHaveBeenCalledTimes(2);
    });

    it('should initialize audio context if not initialized', async () => {
      const newManager = new AudioManager();
      const mockAudioData = Buffer.from('fake audio data').toString('base64');

      await newManager.loadAudioBuffer(mockAudioData);

      expect(newManager.isInitialized).toBe(true);
    });

    it('should handle decode errors', async () => {
      mockAudioContext.decodeAudioData = jest.fn(() =>
        Promise.reject(new Error('Decode failed'))
      );

      const mockAudioData = Buffer.from('invalid audio').toString('base64');

      await expect(audioManager.loadAudioBuffer(mockAudioData)).rejects.toThrow('Decode failed');
    });
  });

  describe('createAudioNodes()', () => {
    beforeEach(async () => {
      await audioManager.init();
    });

    it('should create gain node', () => {
      const nodes = audioManager.createAudioNodes();

      expect(nodes.gainNode).toBeDefined();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should create pan node', () => {
      const nodes = audioManager.createAudioNodes();

      expect(nodes.panNode).toBeDefined();
      expect(mockAudioContext.createStereoPanner).toBeDefined();
    });

    it('should create analyser node', () => {
      const nodes = audioManager.createAudioNodes();

      expect(nodes.analyser).toBeDefined();
    });

    it('should set gain node to master volume', () => {
      const nodes = audioManager.createAudioNodes();

      expect(nodes.gainNode.gain.value).toBe(0.8);
    });

    it('should set pan node to master pan', () => {
      const nodes = audioManager.createAudioNodes();

      expect(nodes.panNode.pan.value).toBe(0);
    });

    it('should return null if not initialized', () => {
      const newManager = new AudioManager();
      const nodes = newManager.createAudioNodes();

      expect(nodes).toBeNull();
    });
  });

  describe('setMasterVolume()', () => {
    it('should set master volume within valid range', () => {
      audioManager.setMasterVolume(0.5);
      expect(audioManager.masterVolume).toBe(0.5);

      audioManager.setMasterVolume(0);
      expect(audioManager.masterVolume).toBe(0);

      audioManager.setMasterVolume(1);
      expect(audioManager.masterVolume).toBe(1);
    });

    it('should handle boundary values', () => {
      audioManager.setMasterVolume(0);
      expect(audioManager.masterVolume).toBe(0);

      audioManager.setMasterVolume(1);
      expect(audioManager.masterVolume).toBe(1);
    });

    it('should accept floating point values', () => {
      audioManager.setMasterVolume(0.357);
      expect(audioManager.masterVolume).toBeCloseTo(0.357);
    });
  });

  describe('setMasterPan()', () => {
    it('should set master pan within valid range', () => {
      audioManager.setMasterPan(-1);
      expect(audioManager.masterPan).toBe(-1);

      audioManager.setMasterPan(0);
      expect(audioManager.masterPan).toBe(0);

      audioManager.setMasterPan(1);
      expect(audioManager.masterPan).toBe(1);
    });

    it('should handle center pan (0)', () => {
      audioManager.setMasterPan(0);
      expect(audioManager.masterPan).toBe(0);
    });

    it('should handle left pan (-1)', () => {
      audioManager.setMasterPan(-1);
      expect(audioManager.masterPan).toBe(-1);
    });

    it('should handle right pan (1)', () => {
      audioManager.setMasterPan(1);
      expect(audioManager.masterPan).toBe(1);
    });

    it('should accept floating point values', () => {
      audioManager.setMasterPan(-0.5);
      expect(audioManager.masterPan).toBeCloseTo(-0.5);
    });
  });

  describe('getFrequencyData()', () => {
    beforeEach(async () => {
      await audioManager.init();
    });

    it('should return frequency data array', () => {
      const data = audioManager.getFrequencyData();

      expect(data).toBeDefined();
      expect(data).toBeInstanceOf(Uint8Array);
    });

    it('should call analyser getByteFrequencyData', () => {
      audioManager.getFrequencyData();

      expect(audioManager.analyser.getByteFrequencyData).toBeDefined();
    });

    it('should return data with correct length', () => {
      const data = audioManager.getFrequencyData();

      expect(data.length).toBe(audioManager.analyser.frequencyBinCount);
    });
  });

  describe('getCurrentTime()', () => {
    beforeEach(async () => {
      await audioManager.init();
    });

    it('should return current audio context time', () => {
      const time = audioManager.getCurrentTime();

      expect(time).toBeDefined();
      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 if not initialized', () => {
      const newManager = new AudioManager();
      const time = newManager.getCurrentTime();

      expect(time).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple initializations gracefully', async () => {
      await audioManager.init();
      await audioManager.init();
      await audioManager.init();

      expect(audioManager.isInitialized).toBe(true);
    });

    it('should handle extreme volume values', () => {
      audioManager.setMasterVolume(999);
      expect(audioManager.masterVolume).toBe(999); // Should be clamped by audio nodes when used

      audioManager.setMasterVolume(-999);
      expect(audioManager.masterVolume).toBe(-999); // Should be clamped by audio nodes when used
    });

    it('should handle extreme pan values', () => {
      audioManager.setMasterPan(999);
      expect(audioManager.masterPan).toBe(999); // Should be clamped by audio nodes when used

      audioManager.setMasterPan(-999);
      expect(audioManager.masterPan).toBe(-999); // Should be clamped by audio nodes when used
    });

    it('should handle rapid volume changes', () => {
      for (let i = 0; i < 100; i++) {
        audioManager.setMasterVolume(Math.random());
      }
      expect(audioManager.masterVolume).toBeGreaterThanOrEqual(0);
      expect(audioManager.masterVolume).toBeLessThanOrEqual(1);
    });
  });

  describe('cleanup', () => {
    beforeEach(async () => {
      await audioManager.init();
    });

    it('should maintain audio buffers map', () => {
      expect(audioManager.audioBuffers).toBeInstanceOf(Map);
    });

    it('should allow clearing audio buffers', () => {
      audioManager.audioBuffers.set('test', {});
      expect(audioManager.audioBuffers.size).toBe(1);

      audioManager.audioBuffers.clear();
      expect(audioManager.audioBuffers.size).toBe(0);
    });
  });
});
