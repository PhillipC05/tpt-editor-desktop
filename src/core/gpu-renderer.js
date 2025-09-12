/**
 * GPU Renderer - Hardware-accelerated rendering engine
 * Provides GPU acceleration for sprite rendering, effects, and real-time processing
 */

const { app } = require('electron');
const path = require('path');
const fs = require('fs').promises;

class GPURenderer {
    constructor(options = {}) {
        this.canvas = null;
        this.gl = null;
        this.isInitialized = false;
        this.isSupported = false;

        this.shaders = new Map();
        this.textures = new Map();
        this.framebuffers = new Map();
        this.buffers = new Map();

        this.renderQueue = [];
        this.isRendering = false;

        this.performanceMetrics = {
            fps: 0,
            frameTime: 0,
            drawCalls: 0,
            triangles: 0,
            textureSwitches: 0
        };

        this.options = {
            antialiasing: options.antialiasing || false,
            vsync: options.vsync !== false,
            powerPreference: options.powerPreference || 'default',
            alpha: options.alpha || false,
            depth: options.depth || false,
            stencil: options.stencil || false,
            ...options
        };

        this.init();
    }

    /**
     * Initialize GPU renderer
     */
    async init() {
        try {
            // Check WebGL support
            this.isSupported = this.checkWebGLSupport();

            if (!this.isSupported) {
                console.warn('WebGL not supported, falling back to software rendering');
                return;
            }

            // Create canvas for WebGL context
            await this.createCanvas();

            // Initialize WebGL context
            await this.initializeWebGL();

            // Load default shaders
            await this.loadDefaultShaders();

            // Setup render state
            this.setupRenderState();

            this.isInitialized = true;
            console.log('GPU renderer initialized successfully');

        } catch (error) {
            console.error('Failed to initialize GPU renderer:', error);
            this.isSupported = false;
        }
    }

    /**
     * Check WebGL support
     */
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return gl !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * Create canvas element
     */
    async createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1920;
        this.canvas.height = 1080;
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);
    }

    /**
     * Initialize WebGL context
     */
    async initializeWebGL() {
        const contextAttributes = {
            alpha: this.options.alpha,
            depth: this.options.depth,
            stencil: this.options.stencil,
            antialias: this.options.antialiasing,
            powerPreference: this.options.powerPreference,
            preserveDrawingBuffer: false
        };

        this.gl = this.canvas.getContext('webgl', contextAttributes) ||
                 this.canvas.getContext('experimental-webgl', contextAttributes);

        if (!this.gl) {
            throw new Error('Failed to create WebGL context');
        }

        // Log WebGL info
        const debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = this.gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            const vendor = this.gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            console.log(`WebGL Renderer: ${renderer}`);
            console.log(`WebGL Vendor: ${vendor}`);
        }

        // Enable extensions
        this.enableExtensions();
    }

    /**
     * Enable WebGL extensions
     */
    enableExtensions() {
        const extensions = [
            'OES_texture_float',
            'OES_texture_float_linear',
            'OES_standard_derivatives',
            'EXT_shader_texture_lod',
            'WEBGL_draw_buffers',
            'WEBGL_depth_texture',
            'OES_element_index_uint',
            'ANGLE_instanced_arrays'
        ];

        for (const ext of extensions) {
            const extension = this.gl.getExtension(ext);
            if (extension) {
                console.log(`Enabled WebGL extension: ${ext}`);
            }
        }
    }

    /**
     * Load default shaders
     */
    async loadDefaultShaders() {
        // Vertex shader for sprite rendering
        const vertexShader = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            attribute vec4 a_color;

            uniform mat3 u_matrix;
            uniform vec2 u_resolution;

            varying vec2 v_texCoord;
            varying vec4 v_color;

            void main() {
                vec2 position = (u_matrix * vec3(a_position, 1)).xy;
                vec2 zeroToOne = position / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;

                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                v_texCoord = a_texCoord;
                v_color = a_color;
            }
        `;

        // Fragment shader for sprite rendering
        const fragmentShader = `
            precision mediump float;

            uniform sampler2D u_texture;
            uniform float u_opacity;

            varying vec2 v_texCoord;
            varying vec4 v_color;

            void main() {
                vec4 texColor = texture2D(u_texture, v_texCoord);
                gl_FragColor = texColor * v_color * u_opacity;
            }
        `;

        // Load and compile shaders
        await this.createShaderProgram('sprite', vertexShader, fragmentShader);

        // Effect shaders
        await this.loadEffectShaders();
    }

    /**
     * Load effect shaders
     */
    async loadEffectShaders() {
        // Bloom effect
        const bloomVertex = `
            attribute vec2 a_position;
            uniform mat3 u_matrix;
            uniform vec2 u_resolution;
            varying vec2 v_texCoord;

            void main() {
                vec2 position = (u_matrix * vec3(a_position, 1)).xy;
                vec2 zeroToOne = position / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                v_texCoord = position / u_resolution;
            }
        `;

        const bloomFragment = `
            precision mediump float;
            uniform sampler2D u_texture;
            uniform float u_intensity;
            varying vec2 v_texCoord;

            void main() {
                vec4 color = texture2D(u_texture, v_texCoord);
                float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
                gl_FragColor = color + (color * brightness * u_intensity);
            }
        `;

        await this.createShaderProgram('bloom', bloomVertex, bloomFragment);
    }

    /**
     * Create shader program
     */
    async createShaderProgram(name, vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(program);
            throw new Error(`Shader program linking failed: ${info}`);
        }

        this.shaders.set(name, program);
        return program;
    }

    /**
     * Compile shader
     */
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`Shader compilation failed: ${info}`);
        }

        return shader;
    }

    /**
     * Setup render state
     */
    setupRenderState() {
        const gl = this.gl;

        // Set clear color
        gl.clearColor(0, 0, 0, 0);

        // Enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Enable scissor test for clipping
        gl.enable(gl.SCISSOR_TEST);

        // Set viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Create texture from image data
     */
    createTexture(imageData, options = {}) {
        const gl = this.gl;
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload texture data
        if (imageData instanceof ImageData) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
        } else if (imageData instanceof HTMLImageElement || imageData instanceof HTMLCanvasElement) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
        } else {
            // Raw pixel data
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, options.width, options.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
        }

        // Generate mipmaps if requested
        if (options.mipmaps) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }

        gl.bindTexture(gl.TEXTURE_2D, null);

        const textureId = `texture_${Date.now()}_${Math.random()}`;
        this.textures.set(textureId, {
            texture,
            width: options.width || imageData.width,
            height: options.height || imageData.height,
            format: gl.RGBA
        });

        return textureId;
    }

    /**
     * Update texture data
     */
    updateTexture(textureId, imageData, x = 0, y = 0, width = null, height = null) {
        const textureInfo = this.textures.get(textureId);
        if (!textureInfo) return;

        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);

        if (width === null) width = textureInfo.width - x;
        if (height === null) height = textureInfo.height - y;

        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * Delete texture
     */
    deleteTexture(textureId) {
        const textureInfo = this.textures.get(textureId);
        if (textureInfo) {
            this.gl.deleteTexture(textureInfo.texture);
            this.textures.delete(textureId);
        }
    }

    /**
     * Create framebuffer
     */
    createFramebuffer(width, height, options = {}) {
        const gl = this.gl;
        const framebuffer = gl.createFramebuffer();
        const texture = gl.createTexture();
        const renderbuffer = options.depth ? gl.createRenderbuffer() : null;

        // Setup texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Setup framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        // Setup renderbuffer for depth
        if (renderbuffer) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
        }

        // Check framebuffer status
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error(`Framebuffer incomplete: ${status}`);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        const framebufferId = `framebuffer_${Date.now()}_${Math.random()}`;
        this.framebuffers.set(framebufferId, {
            framebuffer,
            texture,
            renderbuffer,
            width,
            height
        });

        return framebufferId;
    }

    /**
     * Delete framebuffer
     */
    deleteFramebuffer(framebufferId) {
        const fbInfo = this.framebuffers.get(framebufferId);
        if (fbInfo) {
            const gl = this.gl;
            gl.deleteFramebuffer(fbInfo.framebuffer);
            gl.deleteTexture(fbInfo.texture);
            if (fbInfo.renderbuffer) {
                gl.deleteRenderbuffer(fbInfo.renderbuffer);
            }
            this.framebuffers.delete(framebufferId);
        }
    }

    /**
     * Render sprite
     */
    renderSprite(textureId, x, y, width, height, options = {}) {
        if (!this.isInitialized) return;

        const textureInfo = this.textures.get(textureId);
        if (!textureInfo) return;

        const renderItem = {
            type: 'sprite',
            textureId,
            x, y, width, height,
            rotation: options.rotation || 0,
            scale: options.scale || 1,
            opacity: options.opacity !== undefined ? options.opacity : 1,
            color: options.color || [1, 1, 1, 1],
            shader: options.shader || 'sprite'
        };

        this.renderQueue.push(renderItem);
    }

    /**
     * Render effect
     */
    renderEffect(effectType, textureId, options = {}) {
        if (!this.isInitialized) return;

        const renderItem = {
            type: 'effect',
            effectType,
            textureId,
            options
        };

        this.renderQueue.push(renderItem);
    }

    /**
     * Begin frame rendering
     */
    beginFrame() {
        if (!this.isInitialized) return;

        const gl = this.gl;

        // Clear buffers
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Reset performance metrics
        this.performanceMetrics.drawCalls = 0;
        this.performanceMetrics.triangles = 0;
        this.performanceMetrics.textureSwitches = 0;

        this.isRendering = true;
    }

    /**
     * End frame rendering
     */
    endFrame() {
        if (!this.isRendering) return;

        // Process render queue
        this.processRenderQueue();

        // Flush commands
        this.gl.flush();

        this.isRendering = false;
    }

    /**
     * Process render queue
     */
    processRenderQueue() {
        // Group by shader for better performance
        const shaderGroups = new Map();

        for (const item of this.renderQueue) {
            const shader = item.shader || 'sprite';
            if (!shaderGroups.has(shader)) {
                shaderGroups.set(shader, []);
            }
            shaderGroups.get(shader).push(item);
        }

        // Render each shader group
        for (const [shaderName, items] of shaderGroups) {
            this.renderShaderGroup(shaderName, items);
        }

        this.renderQueue = [];
    }

    /**
     * Render shader group
     */
    renderShaderGroup(shaderName, items) {
        const program = this.shaders.get(shaderName);
        if (!program) return;

        const gl = this.gl;
        gl.useProgram(program);

        // Setup uniforms and attributes
        this.setupShaderUniforms(program, shaderName);

        // Batch render items
        for (const item of items) {
            this.renderItem(program, item);
        }
    }

    /**
     * Setup shader uniforms
     */
    setupShaderUniforms(program, shaderName) {
        const gl = this.gl;

        // Common uniforms
        const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
        if (resolutionLoc) {
            gl.uniform2f(resolutionLoc, this.canvas.width, this.canvas.height);
        }

        // Shader-specific uniforms
        switch (shaderName) {
            case 'sprite':
                // Sprite shader uniforms are set per item
                break;
            case 'bloom':
                const intensityLoc = gl.getUniformLocation(program, 'u_intensity');
                if (intensityLoc) {
                    gl.uniform1f(intensityLoc, 1.0);
                }
                break;
        }
    }

    /**
     * Render individual item
     */
    renderItem(program, item) {
        const gl = this.gl;
        const textureInfo = this.textures.get(item.textureId);

        if (!textureInfo) return;

        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);

        const textureLoc = gl.getUniformLocation(program, 'u_texture');
        if (textureLoc) {
            gl.uniform1i(textureLoc, 0);
        }

        // Set opacity
        const opacityLoc = gl.getUniformLocation(program, 'u_opacity');
        if (opacityLoc) {
            gl.uniform1f(opacityLoc, item.opacity);
        }

        // Create transformation matrix
        const matrix = this.createTransformationMatrix(item);
        const matrixLoc = gl.getUniformLocation(program, 'u_matrix');
        if (matrixLoc) {
            gl.uniformMatrix3fv(matrixLoc, false, matrix);
        }

        // Create vertex data
        const vertices = this.createQuadVertices(item.x, item.y, item.width, item.height);
        const texCoords = this.createQuadTexCoords();

        // Setup vertex attributes
        this.setupVertexAttributes(program, vertices, texCoords, item.color);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.performanceMetrics.drawCalls++;
        this.performanceMetrics.triangles += 2;
    }

    /**
     * Create transformation matrix
     */
    createTransformationMatrix(item) {
        const matrix = new Float32Array(9);

        // Identity matrix
        matrix[0] = 1; matrix[1] = 0; matrix[2] = 0;
        matrix[3] = 0; matrix[4] = 1; matrix[5] = 0;
        matrix[6] = 0; matrix[7] = 0; matrix[8] = 1;

        // Apply translation
        matrix[6] = item.x;
        matrix[7] = item.y;

        // Apply scaling
        matrix[0] *= item.scale;
        matrix[4] *= item.scale;

        // Apply rotation (simplified)
        if (item.rotation) {
            const cos = Math.cos(item.rotation);
            const sin = Math.sin(item.rotation);
            const m0 = matrix[0], m1 = matrix[1], m3 = matrix[3], m4 = matrix[4];

            matrix[0] = m0 * cos - m1 * sin;
            matrix[1] = m0 * sin + m1 * cos;
            matrix[3] = m3 * cos - m4 * sin;
            matrix[4] = m3 * sin + m4 * cos;
        }

        return matrix;
    }

    /**
     * Create quad vertices
     */
    createQuadVertices(x, y, width, height) {
        return new Float32Array([
            x, y,
            x + width, y,
            x, y + height,
            x + width, y + height
        ]);
    }

    /**
     * Create quad texture coordinates
     */
    createQuadTexCoords() {
        return new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ]);
    }

    /**
     * Setup vertex attributes
     */
    setupVertexAttributes(program, vertices, texCoords, color) {
        const gl = this.gl;

        // Position attribute
        const positionLoc = gl.getAttribLocation(program, 'a_position');
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        // Texture coordinate attribute
        const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');
        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLoc);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

        // Color attribute
        const colorLoc = gl.getAttribLocation(program, 'a_color');
        if (colorLoc >= 0) {
            const colorBuffer = gl.createBuffer();
            const colors = new Float32Array(color.concat(color)); // Repeat for all vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(colorLoc);
            gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        }

        // Store buffers for cleanup
        const bufferId = `buffer_${Date.now()}_${Math.random()}`;
        this.buffers.set(bufferId, {
            position: positionBuffer,
            texCoord: texCoordBuffer,
            color: colorLoc >= 0 ? colorBuffer : null
        });
    }

    /**
     * Get rendered image data
     */
    getImageData(x = 0, y = 0, width = null, height = null) {
        if (!this.isInitialized) return null;

        if (width === null) width = this.canvas.width;
        if (height === null) height = this.canvas.height;

        const gl = this.gl;
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        return new ImageData(new Uint8ClampedArray(pixels), width, height);
    }

    /**
     * Resize canvas
     */
    resize(width, height) {
        if (!this.canvas) return;

        this.canvas.width = width;
        this.canvas.height = height;

        if (this.gl) {
            this.gl.viewport(0, 0, width, height);
        }
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    /**
     * Check if GPU rendering is supported
     */
    isGPUSupported() {
        return this.isSupported && this.isInitialized;
    }

    /**
     * Get WebGL info
     */
    getWebGLInfo() {
        if (!this.gl) return null;

        return {
            version: this.gl.getParameter(this.gl.VERSION),
            vendor: this.gl.getParameter(this.gl.VENDOR),
            renderer: this.gl.getParameter(this.gl.RENDERER),
            shadingLanguageVersion: this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION),
            maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
            maxViewportDims: this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS),
            extensions: this.gl.getSupportedExtensions()
        };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (!this.isInitialized) return;

        const gl = this.gl;

        // Delete shaders
        for (const program of this.shaders.values()) {
            gl.deleteProgram(program);
        }
        this.shaders.clear();

        // Delete textures
        for (const textureInfo of this.textures.values()) {
            gl.deleteTexture(textureInfo.texture);
        }
        this.textures.clear();

        // Delete framebuffers
        for (const fbInfo of this.framebuffers.values()) {
            gl.deleteFramebuffer(fbInfo.framebuffer);
            gl.deleteTexture(fbInfo.texture);
            if (fbInfo.renderbuffer) {
                gl.deleteRenderbuffer(fbInfo.renderbuffer);
            }
        }
        this.framebuffers.clear();

        // Delete buffers
        for (const bufferInfo of this.buffers.values()) {
            if (bufferInfo.position) gl.deleteBuffer(bufferInfo.position);
            if (bufferInfo.texCoord) gl.deleteBuffer(bufferInfo.texCoord);
            if (bufferInfo.color) gl.deleteBuffer(bufferInfo.color);
        }
        this.buffers.clear();

        // Remove canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        this.isInitialized = false;
        console.log('GPU renderer cleaned up');
    }
}

module.exports = GPURenderer;
