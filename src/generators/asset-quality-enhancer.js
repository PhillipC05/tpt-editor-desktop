/**
 * Asset Quality Enhancer - Higher resolution, better materials, lighting effects
 * Enhances the quality of generated assets with advanced rendering techniques
 */

const Jimp = require('jimp');
const SpriteUtils = require('./sprite-generators/sprite-utils');

class AssetQualityEnhancer {
    constructor() {
        this.utils = new SpriteUtils();

        // Quality enhancement settings
        this.qualitySettings = {
            resolutions: {
                low: { width: 32, height: 32, scale: 1 },
                medium: { width: 64, height: 64, scale: 2 },
                high: { width: 128, height: 128, scale: 4 },
                ultra: { width: 256, height: 256, scale: 8 },
                extreme: { width: 512, height: 512, scale: 16 }
            },
            materials: {
                matte: { shininess: 0.1, reflectivity: 0.1, roughness: 0.9 },
                glossy: { shininess: 0.8, reflectivity: 0.6, roughness: 0.2 },
                metallic: { shininess: 0.9, reflectivity: 0.8, roughness: 0.1 },
                plastic: { shininess: 0.5, reflectivity: 0.3, roughness: 0.4 },
                ceramic: { shininess: 0.7, reflectivity: 0.4, roughness: 0.3 },
                fabric: { shininess: 0.2, reflectivity: 0.1, roughness: 0.8 },
                wood: { shininess: 0.3, reflectivity: 0.2, roughness: 0.7 },
                stone: { shininess: 0.4, reflectivity: 0.3, roughness: 0.6 },
                glass: { shininess: 0.95, reflectivity: 0.9, roughness: 0.05 },
                leather: { shininess: 0.25, reflectivity: 0.15, roughness: 0.75 }
            },
            lighting: {
                ambient: { intensity: 0.3, color: 0xFFFFFF },
                directional: { intensity: 0.7, color: 0xFFFFFF, direction: { x: 1, y: -1, z: 1 } },
                point: { intensity: 0.8, color: 0xFFFFFF, position: { x: 0.5, y: 0.5, z: 0.5 }, range: 1.0 },
                spot: { intensity: 1.0, color: 0xFFFFFF, position: { x: 0.5, y: 0.5, z: 0.5 }, direction: { x: 0, y: 0, z: -1 }, angle: 45, range: 2.0 }
            },
            effects: {
                bloom: { intensity: 0.3, radius: 2, threshold: 0.8 },
                depth_of_field: { focal_distance: 0.5, aperture: 0.1, blur_strength: 0.5 },
                motion_blur: { strength: 0.2, direction: { x: 1, y: 0 } },
                chromatic_aberration: { strength: 0.01, direction: { x: 1, y: 0 } },
                vignette: { intensity: 0.2, radius: 0.8 },
                film_grain: { intensity: 0.05, size: 1 },
                color_grading: { contrast: 1.1, saturation: 1.05, brightness: 1.0, temperature: 6500 }
            }
        };

        // Material properties database
        this.materialDatabase = {
            metals: {
                gold: { base_color: 0xFFD700, shininess: 0.9, reflectivity: 0.8, roughness: 0.1 },
                silver: { base_color: 0xC0C0C0, shininess: 0.95, reflectivity: 0.9, roughness: 0.05 },
                copper: { base_color: 0xB87333, shininess: 0.7, reflectivity: 0.6, roughness: 0.3 },
                bronze: { base_color: 0xCD7F32, shininess: 0.6, reflectivity: 0.5, roughness: 0.4 },
                iron: { base_color: 0x43464B, shininess: 0.4, reflectivity: 0.3, roughness: 0.6 },
                steel: { base_color: 0x71797E, shininess: 0.8, reflectivity: 0.7, roughness: 0.2 }
            },
            woods: {
                oak: { base_color: 0x8B4513, grain_intensity: 0.3, shininess: 0.3, reflectivity: 0.2 },
                pine: { base_color: 0xDEB887, grain_intensity: 0.4, shininess: 0.25, reflectivity: 0.15 },
                mahogany: { base_color: 0x8B4513, grain_intensity: 0.5, shininess: 0.35, reflectivity: 0.25 },
                birch: { base_color: 0xF5DEB3, grain_intensity: 0.2, shininess: 0.4, reflectivity: 0.3 },
                ebony: { base_color: 0x2F1B14, grain_intensity: 0.6, shininess: 0.5, reflectivity: 0.4 }
            },
            stones: {
                marble: { base_color: 0xF5F5F0, vein_intensity: 0.4, shininess: 0.8, reflectivity: 0.6 },
                granite: { base_color: 0x696969, speckle_intensity: 0.5, shininess: 0.3, reflectivity: 0.2 },
                limestone: { base_color: 0xF5F5DC, fossil_intensity: 0.3, shininess: 0.4, reflectivity: 0.3 },
                slate: { base_color: 0x708090, layer_intensity: 0.6, shininess: 0.2, reflectivity: 0.1 },
                obsidian: { base_color: 0x2F2F2F, glass_intensity: 0.8, shininess: 0.95, reflectivity: 0.9 }
            },
            fabrics: {
                cotton: { base_color: 0xFFFFFF, weave_intensity: 0.2, shininess: 0.1, reflectivity: 0.05 },
                silk: { base_color: 0xF5F5F5, sheen_intensity: 0.4, shininess: 0.6, reflectivity: 0.5 },
                wool: { base_color: 0xF5F5DC, fiber_intensity: 0.3, shininess: 0.15, reflectivity: 0.1 },
                leather: { base_color: 0x8B4513, grain_intensity: 0.4, shininess: 0.25, reflectivity: 0.15 },
                velvet: { base_color: 0x800080, pile_intensity: 0.5, shininess: 0.3, reflectivity: 0.2 }
            },
            magical: {
                enchanted: { base_color: 0x9370DB, glow_intensity: 0.6, particle_density: 0.4 },
                divine: { base_color: 0xFFD700, aura_intensity: 0.8, light_rays: 0.5 },
                cursed: { base_color: 0x8B0000, darkness_intensity: 0.7, shadow_density: 0.6 },
                elemental: { base_color: 0x00CED1, energy_intensity: 0.9, flow_density: 0.5 },
                void: { base_color: 0x2F2F2F, void_intensity: 0.8, distortion_density: 0.4 }
            }
        };

        // Lighting presets
        this.lightingPresets = {
            natural: {
                ambient: { intensity: 0.4, color: 0xFFF8DC },
                directional: { intensity: 0.8, color: 0xFFFFFF, direction: { x: 0.5, y: -0.8, z: 0.3 } },
                rim: { intensity: 0.3, color: 0xFFF8DC, direction: { x: -0.3, y: 0.2, z: 0.9 } }
            },
            studio: {
                key: { intensity: 1.0, color: 0xFFFFFF, direction: { x: 0.3, y: -0.4, z: 0.9 } },
                fill: { intensity: 0.4, color: 0xE6E6FA, direction: { x: -0.5, y: 0.2, z: 0.8 } },
                rim: { intensity: 0.6, color: 0xFFFFFF, direction: { x: 0, y: 0.8, z: 0.6 } }
            },
            dramatic: {
                main: { intensity: 1.2, color: 0xFFD700, direction: { x: 0.8, y: -0.6, z: 0.1 } },
                shadow: { intensity: 0.2, color: 0x4169E1, direction: { x: -0.4, y: 0.3, z: 0.9 } },
                accent: { intensity: 0.5, color: 0xDC143C, direction: { x: 0, y: 0.9, z: 0.4 } }
            },
            magical: {
                ambient: { intensity: 0.3, color: 0x9370DB },
                mystical: { intensity: 0.7, color: 0xFFD700, direction: { x: 0, y: -1, z: 0.5 } },
                ethereal: { intensity: 0.4, color: 0xE6E6FA, direction: { x: 0.5, y: 0.5, z: 0.7 } }
            },
            horror: {
                dim: { intensity: 0.2, color: 0x8B0000, direction: { x: 0.2, y: -0.3, z: 0.9 } },
                silhouette: { intensity: 0.8, color: 0x2F2F2F, direction: { x: -0.8, y: 0.6, z: 0.1 } },
                flicker: { intensity: 0.3, color: 0xFFFF00, direction: { x: 0, y: 0, z: 1 } }
            }
        };

        // Post-processing effects
        this.postProcessingEffects = {
            sharpen: { strength: 0.5, radius: 1 },
            denoise: { strength: 0.3, radius: 2 },
            contrast: { adjustment: 1.2, midpoint: 0.5 },
            saturation: { adjustment: 1.1 },
            brightness: { adjustment: 1.05 },
            gamma: { adjustment: 1.1 },
            vibrance: { adjustment: 1.15 },
            clarity: { adjustment: 0.2 },
            dehaze: { strength: 0.1 },
            vignette: { amount: 0.2, midpoint: 0.5 }
        };
    }

    /**
     * Main enhancement method
     */
    async enhance(image, config) {
        const { width, height } = image.bitmap;

        // Apply resolution enhancement
        if (config.resolution && config.resolution !== 'low') {
            await this.enhanceResolution(image, config.resolution);
        }

        // Apply material enhancements
        if (config.material) {
            await this.applyMaterialProperties(image, config.material);
        }

        // Apply lighting effects
        if (config.lighting) {
            await this.applyLighting(image, config.lighting);
        }

        // Apply special effects
        if (config.effects) {
            await this.applySpecialEffects(image, config.effects);
        }

        // Apply post-processing
        if (config.postProcessing) {
            await this.applyPostProcessing(image, config.postProcessing);
        }

        return image;
    }

    /**
     * Enhance resolution using advanced upscaling
     */
    async enhanceResolution(image, targetResolution) {
        const { width, height } = image.bitmap;
        const target = this.qualitySettings.resolutions[targetResolution];

        if (!target || target.scale <= 1) return image;

        // Create high-resolution canvas
        const highResImage = new Jimp(target.width, target.height);

        // Advanced upscaling algorithm
        await this.advancedUpscale(image, highResImage, target.scale);

        return highResImage;
    }

    /**
     * Advanced upscaling algorithm
     */
    async advancedUpscale(sourceImage, targetImage, scale) {
        const { width: srcWidth, height: srcHeight } = sourceImage.bitmap;
        const { width: tgtWidth, height: tgtHeight } = targetImage.bitmap;

        // Edge-directed interpolation
        for (let y = 0; y < tgtHeight; y++) {
            for (let x = 0; x < tgtWidth; x++) {
                const srcX = (x / scale);
                const srcY = (y / scale);

                // Bicubic interpolation with edge detection
                const color = this.bicubicInterpolate(sourceImage, srcX, srcY);
                targetImage.setPixelColor(color, x, y);
            }
        }

        // Apply sharpening to maintain detail
        await this.applySharpening(targetImage, 0.3);
    }

    /**
     * Bicubic interpolation
     */
    bicubicInterpolate(image, x, y) {
        const { width, height } = image.bitmap;

        // Get integer and fractional parts
        const xInt = Math.floor(x);
        const yInt = Math.floor(y);
        const xFrac = x - xInt;
        const yFrac = y - yInt;

        // Sample 4x4 neighborhood
        const samples = [];
        for (let dy = -1; dy <= 2; dy++) {
            for (let dx = -1; dx <= 2; dx++) {
                const sampleX = Math.max(0, Math.min(width - 1, xInt + dx));
                const sampleY = Math.max(0, Math.min(height - 1, yInt + dy));
                samples.push(image.getPixelColor(sampleX, sampleY));
            }
        }

        // Bicubic interpolation weights
        const weights = this.calculateBicubicWeights(xFrac, yFrac);

        // Interpolate each color component
        let r = 0, g = 0, b = 0, a = 0;
        for (let i = 0; i < 16; i++) {
            const color = samples[i];
            const weight = weights[i];

            r += ((color >> 16) & 0xFF) * weight;
            g += ((color >> 8) & 0xFF) * weight;
            b += (color & 0xFF) * weight;
            a += ((color >> 24) & 0xFF) * weight;
        }

        return ((Math.round(a) << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b));
    }

    /**
     * Calculate bicubic interpolation weights
     */
    calculateBicubicWeights(xFrac, yFrac) {
        const weights = [];

        for (let i = 0; i < 4; i++) {
            const dy = i - 1 - yFrac;
            const wy = this.cubicWeight(dy);

            for (let j = 0; j < 4; j++) {
                const dx = j - 1 - xFrac;
                const wx = this.cubicWeight(dx);

                weights.push(wx * wy);
            }
        }

        return weights;
    }

    /**
     * Cubic interpolation weight function
     */
    cubicWeight(x) {
        const absX = Math.abs(x);
        if (absX <= 1) {
            return 1.5 * absX * absX * absX - 2.5 * absX * absX + 1;
        } else if (absX < 2) {
            return -0.5 * absX * absX * absX + 2.5 * absX * absX - 4 * absX + 2;
        }
        return 0;
    }

    /**
     * Apply material properties
     */
    async applyMaterialProperties(image, materialConfig) {
        const { width, height } = image.bitmap;

        // Get material properties
        const material = this.materialDatabase[materialConfig.category]?.[materialConfig.type];
        if (!material) return;

        // Apply material-specific enhancements
        switch (materialConfig.category) {
            case 'metals':
                await this.applyMetalMaterial(image, material);
                break;
            case 'woods':
                await this.applyWoodMaterial(image, material);
                break;
            case 'stones':
                await this.applyStoneMaterial(image, material);
                break;
            case 'fabrics':
                await this.applyFabricMaterial(image, material);
                break;
            case 'magical':
                await this.applyMagicalMaterial(image, material);
                break;
        }
    }

    /**
     * Apply metal material properties
     */
    async applyMetalMaterial(image, material) {
        const { width, height } = image.bitmap;

        // Apply metallic sheen
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = image.bitmap.data[idx];
                const g = image.bitmap.data[idx + 1];
                const b = image.bitmap.data[idx + 2];

                // Calculate metallic reflection
                const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
                const reflection = Math.pow(luminance, material.shininess) * material.reflectivity;

                // Apply reflection
                const newR = Math.min(255, r + reflection * 50);
                const newG = Math.min(255, g + reflection * 50);
                const newB = Math.min(255, b + reflection * 50);

                image.bitmap.data[idx] = newR;
                image.bitmap.data[idx + 1] = newG;
                image.bitmap.data[idx + 2] = newB;
            }
        }

        // Add specular highlights
        await this.addSpecularHighlights(image, material.shininess);
    }

    /**
     * Apply wood material properties
     */
    async applyWoodMaterial(image, material) {
        const { width, height } = image.bitmap;

        // Generate wood grain pattern
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Wood grain noise
                const grain = this.perlinNoise(x * 0.1, y * 0.1) * material.grain_intensity;
                const variation = grain * 30;

                // Apply grain variation
                image.bitmap.data[idx] = Math.max(0, Math.min(255, image.bitmap.data[idx] + variation));
                image.bitmap.data[idx + 1] = Math.max(0, Math.min(255, image.bitmap.data[idx + 1] + variation * 0.8));
                image.bitmap.data[idx + 2] = Math.max(0, Math.min(255, image.bitmap.data[idx + 2] + variation * 0.6));
            }
        }

        // Add wood texture
        await this.addWoodTexture(image, material);
    }

    /**
     * Apply stone material properties
     */
    async applyStoneMaterial(image, material) {
        const { width, height } = image.bitmap;

        // Generate stone texture
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Stone surface variation
                const surfaceNoise = this.perlinNoise(x * 0.05, y * 0.05) * 0.3;
                const poreNoise = this.perlinNoise(x * 0.2, y * 0.2) * 0.2;

                const variation = (surfaceNoise + poreNoise) * 40;

                image.bitmap.data[idx] = Math.max(0, Math.min(255, image.bitmap.data[idx] + variation));
                image.bitmap.data[idx + 1] = Math.max(0, Math.min(255, image.bitmap.data[idx + 1] + variation * 0.9));
                image.bitmap.data[idx + 2] = Math.max(0, Math.min(255, image.bitmap.data[idx + 2] + variation * 0.8));
            }
        }

        // Add stone-specific details
        if (material.vein_intensity) {
            await this.addMarbleVeins(image, material.vein_intensity);
        } else if (material.speckle_intensity) {
            await this.addGraniteSpeckles(image, material.speckle_intensity);
        }
    }

    /**
     * Apply fabric material properties
     */
    async applyFabricMaterial(image, material) {
        const { width, height } = image.bitmap;

        // Generate fabric texture
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Fabric weave pattern
                const weaveX = Math.sin(x * 0.3) * Math.cos(y * 0.3);
                const weaveY = Math.sin(y * 0.3) * Math.cos(x * 0.3);
                const weave = (weaveX + weaveY) * 0.5 * material.weave_intensity;

                const variation = weave * 20;

                image.bitmap.data[idx] = Math.max(0, Math.min(255, image.bitmap.data[idx] + variation));
                image.bitmap.data[idx + 1] = Math.max(0, Math.min(255, image.bitmap.data[idx + 1] + variation * 0.8));
                image.bitmap.data[idx + 2] = Math.max(0, Math.min(255, image.bitmap.data[idx + 2] + variation * 0.6));
            }
        }

        // Add fabric-specific effects
        if (material.sheen_intensity) {
            await this.addSilkSheen(image, material.sheen_intensity);
        }
    }

    /**
     * Apply magical material properties
     */
    async applyMagicalMaterial(image, material) {
        const { width, height } = image.bitmap;

        // Add magical glow
        if (material.glow_intensity) {
            await this.addMagicalGlow(image, material.glow_intensity, material.base_color);
        }

        // Add magical particles
        if (material.particle_density) {
            await this.addMagicalParticles(image, material.particle_density);
        }

        // Add aura effects
        if (material.aura_intensity) {
            await this.addMagicalAura(image, material.aura_intensity);
        }

        // Add energy effects
        if (material.energy_intensity) {
            await this.addEnergyField(image, material.energy_intensity);
        }
    }

    /**
     * Apply lighting effects
     */
    async applyLighting(image, lightingConfig) {
        const { width, height } = image.bitmap;

        // Get lighting preset
        const preset = this.lightingPresets[lightingConfig.preset];
        if (!preset) return;

        // Apply each light source
        for (const [lightName, light] of Object.entries(preset)) {
            await this.applyLightSource(image, light, lightName);
        }

        // Apply ambient occlusion
        if (lightingConfig.ambientOcclusion) {
            await this.applyAmbientOcclusion(image, lightingConfig.ambientOcclusion);
        }

        // Apply shadows
        if (lightingConfig.shadows) {
            await this.applyShadows(image, lightingConfig.shadows);
        }
    }

    /**
     * Apply light source
     */
    async applyLightSource(image, light, lightName) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Calculate lighting based on light type
                let lightIntensity = 1.0;

                switch (lightName) {
                    case 'ambient':
                        lightIntensity = light.intensity;
                        break;
                    case 'directional':
                    case 'key':
                    case 'main':
                    case 'mystical':
                        lightIntensity = this.calculateDirectionalLight(x / width, y / height, light);
                        break;
                    case 'fill':
                    case 'shadow':
                    case 'rim':
                    case 'accent':
                    case 'ethereal':
                        lightIntensity = this.calculateDirectionalLight(x / width, y / height, light) * 0.5;
                        break;
                    case 'dim':
                    case 'silhouette':
                        lightIntensity = this.calculateDirectionalLight(x / width, y / height, light) * 0.3;
                        break;
                }

                // Apply lighting to each color channel
                for (let c = 0; c < 3; c++) {
                    const original = image.bitmap.data[idx + c];
                    const lit = Math.min(255, original * lightIntensity);
                    image.bitmap.data[idx + c] = lit;
                }
            }
        }
    }

    /**
     * Calculate directional light intensity
     */
    calculateDirectionalLight(u, v, light) {
        const normalX = 0; // Assume flat surface
        const normalY = 0;
        const normalZ = 1;

        const lightDir = light.direction;
        const dotProduct = normalX * lightDir.x + normalY * lightDir.y + normalZ * lightDir.z;

        return Math.max(0.2, dotProduct * light.intensity + 0.3);
    }

    /**
     * Apply special effects
     */
    async applySpecialEffects(image, effectsConfig) {
        // Apply each effect
        for (const [effectName, effectConfig] of Object.entries(effectsConfig)) {
            switch (effectName) {
                case 'bloom':
                    await this.applyBloomEffect(image, effectConfig);
                    break;
                case 'depthOfField':
                    await this.applyDepthOfField(image, effectConfig);
                    break;
                case 'motionBlur':
                    await this.applyMotionBlur(image, effectConfig);
                    break;
                case 'chromaticAberration':
                    await this.applyChromaticAberration(image, effectConfig);
                    break;
                case 'vignette':
                    await this.applyVignette(image, effectConfig);
                    break;
                case 'filmGrain':
                    await this.applyFilmGrain(image, effectConfig);
                    break;
                case 'colorGrading':
                    await this.applyColorGrading(image, effectConfig);
                    break;
            }
        }
    }

    /**
     * Apply bloom effect
     */
    async applyBloomEffect(image, config) {
        const { width, height } = image.bitmap;

        // Create bloom layer
        const bloomLayer = new Jimp(width, height);

        // Extract bright areas
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = image.bitmap.data[idx];
                const g = image.bitmap.data[idx + 1];
                const b = image.bitmap.data[idx + 2];

                const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

                if (luminance > config.threshold) {
                    const bloomIntensity = (luminance - config.threshold) / (1 - config.threshold);
                    bloomLayer.bitmap.data[idx] = r * bloomIntensity * config.intensity;
                    bloomLayer.bitmap.data[idx + 1] = g * bloomIntensity * config.intensity;
                    bloomLayer.bitmap.data[idx + 2] = b * bloomIntensity * config.intensity;
                    bloomLayer.bitmap.data[idx + 3] = 255;
                }
            }
        }

        // Blur bloom layer
        await this.applyGaussianBlur(bloomLayer, config.radius);

        // Composite bloom layer
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                const bloomR = bloomLayer.bitmap.data[idx];
                const bloomG = bloomLayer.bitmap.data[idx + 1];
                const bloomB = bloomLayer.bitmap.data[idx + 2];

                image.bitmap.data[idx] = Math.min(255, image.bitmap.data[idx] + bloomR);
                image.bitmap.data[idx + 1] = Math.min(255, image.bitmap.data[idx + 1] + bloomG);
                image.bitmap.data[idx + 2] = Math.min(255, image.bitmap.data[idx + 2] + bloomB);
            }
        }
    }

    /**
     * Apply post-processing effects
     */
    async applyPostProcessing(image, postProcessingConfig) {
        // Apply each post-processing effect
        for (const [effectName, effectConfig] of Object.entries(postProcessingConfig)) {
            switch (effectName) {
                case 'sharpen':
                    await this.applySharpening(image, effectConfig.strength);
                    break;
                case 'denoise':
                    await this.applyDenoising(image, effectConfig.strength);
                    break;
                case 'contrast':
                    await this.adjustContrast(image, effectConfig.adjustment);
                    break;
                case 'saturation':
                    await this.adjustSaturation(image, effectConfig.adjustment);
                    break;
                case 'brightness':
                    await this.adjustBrightness(image, effectConfig.adjustment);
                    break;
                case 'gamma':
                    await this.adjustGamma(image, effectConfig.adjustment);
                    break;
                case 'vibrance':
                    await this.adjustVibrance(image, effectConfig.adjustment);
                    break;
            }
        }
    }

    // Helper methods
    async addSpecularHighlights(image, shininess) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Calculate specular reflection
                const normalX = (x / width - 0.5) * 2;
                const normalY = (y / height - 0.5) * 2;
                const normalZ = Math.sqrt(1 - normalX * normalX - normalY * normalY);

                const lightDir = { x: 1, y: -1, z: 1 };
                const viewDir = { x: 0, y: 0, z: 1 };

                const reflectX = 2 * normalZ * normalZ * lightDir.x - lightDir.x;
                const reflectY = 2 * normalZ * normalZ * lightDir.y - lightDir.y;
                const reflectZ = 2 * normalZ * normalZ * lightDir.z - lightDir.z;

                const specular = Math.pow(Math.max(0, reflectZ), shininess * 100);

                if (specular > 0.5) {
                    const highlight = specular * 100;
                    image.bitmap.data[idx] = Math.min(255, image.bitmap.data[idx] + highlight);
                    image.bitmap.data[idx + 1] = Math.min(255, image.bitmap.data[idx + 1] + highlight);
                    image.bitmap.data[idx + 2] = Math.min(255, image.bitmap.data[idx + 2] + highlight);
                }
            }
        }
    }

    async addWoodTexture(image, material) {
        const { width, height } = image.bitmap;

        // Add wood grain lines
        for (let y = 0; y < height; y += 3) {
            const grainWidth = 1 + Math.random() * 2;
            const grainColor = material.base_color;

            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const noise = this.perlinNoise(x * 0.01, y * 0.1);

                if (noise > 0.7) {
                    image.bitmap.data[idx] = Math.max(0, ((grainColor >> 16) & 0xFF) - 30);
                    image.bitmap.data[idx + 1] = Math.max(0, ((grainColor >> 8) & 0xFF) - 30);
                    image.bitmap.data[idx + 2] = Math.max(0, (grainColor & 0xFF) - 30);
                }
            }
        }
    }

    async addMarbleVeins(image, intensity) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Generate vein pattern
                const veinNoise = Math.sin(x * 0.05) * Math.cos(y * 0.03) * intensity;

                if (Math.abs(veinNoise) > 0.3) {
                    const veinColor = 0xD3D3D3;
                    image.bitmap.data[idx] = (veinColor >> 16) & 0xFF;
                    image.bitmap.data[idx + 1] = (veinColor >> 8) & 0xFF;
                    image.bitmap.data[idx + 2] = veinColor & 0xFF;
                }
            }
        }
    }

    async addGraniteSpeckles(image, intensity) {
        const { width, height } = image.bitmap;

        for (let i = 0; i < Math.floor(width * height * intensity * 0.1); i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;

            const speckleColor = Math.random() < 0.5 ? 0x000000 : 0xFFFFFF;
            image.bitmap.data[idx] = (speckleColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (speckleColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = speckleColor & 0xFF;
        }
    }

    async addSilkSheen(image, intensity) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Silk sheen pattern
                const sheen = Math.sin(x * 0.1 + y * 0.1) * intensity;

                if (sheen > 0.2) {
                    const sheenAmount = sheen * 30;
                    image.bitmap.data[idx] = Math.min(255, image.bitmap.data[idx] + sheenAmount);
                    image.bitmap.data[idx + 1] = Math.min(255, image.bitmap.data[idx + 1] + sheenAmount);
                    image.bitmap.data[idx + 2] = Math.min(255, image.bitmap.data[idx + 2] + sheenAmount);
                }
            }
        }
    }

    async addMagicalGlow(image, intensity, color) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Distance from center
                const centerX = width * 0.5;
                const centerY = height * 0.5;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);

                const glow = (1 - distance / maxDistance) * intensity;

                if (glow > 0) {
                    const glowR = ((color >> 16) & 0xFF) * glow * 0.5;
                    const glowG = ((color >> 8) & 0xFF) * glow * 0.5;
                    const glowB = (color & 0xFF) * glow * 0.5;

                    image.bitmap.data[idx] = Math.min(255, image.bitmap.data[idx] + glowR);
                    image.bitmap.data[idx + 1] = Math.min(255, image.bitmap.data[idx + 1] + glowG);
                    image.bitmap.data[idx + 2] = Math.min(255, image.bitmap.data[idx + 2] + glowB);
                }
            }
        }
    }

    async addMagicalParticles(image, density) {
        const { width, height } = image.bitmap;
        const particleCount = Math.floor(width * height * density * 0.01);

        for (let i = 0; i < particleCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const idx = (y * width + x) * 4;

            const particleColor = 0xFFD700;
            image.bitmap.data[idx] = (particleColor >> 16) & 0xFF;
            image.bitmap.data[idx + 1] = (particleColor >> 8) & 0xFF;
            image.bitmap.data[idx + 2] = particleColor & 0xFF;
        }
    }

    async addMagicalAura(image, intensity) {
        const { width, height } = image.bitmap;

        // Add aura gradient
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                const centerX = width * 0.5;
                const centerY = height * 0.5;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);

                const aura = Math.pow(1 - distance / maxDistance, 2) * intensity;

                if (aura > 0.1) {
                    const auraColor = 0x9370DB;
                    const auraR = ((auraColor >> 16) & 0xFF) * aura * 0.3;
                    const auraG = ((auraColor >> 8) & 0xFF) * aura * 0.3;
                    const auraB = (auraColor & 0xFF) * aura * 0.3;

                    image.bitmap.data[idx] = Math.min(255, image.bitmap.data[idx] + auraR);
                    image.bitmap.data[idx + 1] = Math.min(255, image.bitmap.data[idx + 1] + auraG);
                    image.bitmap.data[idx + 2] = Math.min(255, image.bitmap.data[idx + 2] + auraB);
                }
            }
        }
    }

    async addEnergyField(image, intensity) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Energy field pattern
                const energy = Math.sin(x * 0.1) * Math.cos(y * 0.1) * intensity;

                if (Math.abs(energy) > 0.3) {
                    const energyColor = 0x00CED1;
                    const energyR = ((energyColor >> 16) & 0xFF) * Math.abs(energy) * 0.4;
                    const energyG = ((energyColor >> 8) & 0xFF) * Math.abs(energy) * 0.4;
                    const energyB = (energyColor & 0xFF) * Math.abs(energy) * 0.4;

                    image.bitmap.data[idx] = Math.min(255, image.bitmap.data[idx] + energyR);
                    image.bitmap.data[idx + 1] = Math.min(255, image.bitmap.data[idx + 1] + energyG);
                    image.bitmap.data[idx + 2] = Math.min(255, image.bitmap.data[idx + 2] + energyB);
                }
            }
        }
    }

    async applyAmbientOcclusion(image, config) {
        const { width, height } = image.bitmap;

        // Simple ambient occlusion based on neighboring pixels
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                // Sample neighboring pixels
                const neighbors = [
                    image.getPixelColor(x - 1, y - 1),
                    image.getPixelColor(x, y - 1),
                    image.getPixelColor(x + 1, y - 1),
                    image.getPixelColor(x - 1, y),
                    image.getPixelColor(x + 1, y),
                    image.getPixelColor(x - 1, y + 1),
                    image.getPixelColor(x, y + 1),
                    image.getPixelColor(x + 1, y + 1)
                ];

                // Calculate average luminance of neighbors
                let totalLuminance = 0;
                for (const neighbor of neighbors) {
                    const r = (neighbor >> 16) & 0xFF;
                    const g = (neighbor >> 8) & 0xFF;
                    const b = neighbor & 0xFF;
                    totalLuminance += (r * 0.299 + g * 0.587 + b * 0.114) / 255;
                }
                const avgLuminance = totalLuminance / neighbors.length;

                // Current pixel luminance
                const currentR = image.bitmap.data[idx];
                const currentG = image.bitmap.data[idx + 1];
                const currentB = image.bitmap.data[idx + 2];
                const currentLuminance = (currentR * 0.299 + currentG * 0.587 + currentB * 0.114) / 255;

                // Apply ambient occlusion
                const occlusion = (currentLuminance - avgLuminance) * config.intensity;
                const aoFactor = Math.max(0.3, 1 - Math.abs(occlusion));

                image.bitmap.data[idx] = Math.floor(currentR * aoFactor);
                image.bitmap.data[idx + 1] = Math.floor(currentG * aoFactor);
                image.bitmap.data[idx + 2] = Math.floor(currentB * aoFactor);
            }
        }
    }

    async applyShadows(image, config) {
        const { width, height } = image.bitmap;

        // Apply shadow based on light direction
        const lightDir = config.direction || { x: 1, y: -1, z: 1 };

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Calculate shadow factor
                const normalX = 0; // Assume flat surface
                const normalY = 0;
                const normalZ = 1;

                const dotProduct = normalX * lightDir.x + normalY * lightDir.y + normalZ * lightDir.z;
                const shadowFactor = Math.max(0.2, dotProduct * config.intensity + 0.5);

                // Apply shadow
                image.bitmap.data[idx] = Math.floor(image.bitmap.data[idx] * shadowFactor);
                image.bitmap.data[idx + 1] = Math.floor(image.bitmap.data[idx + 1] * shadowFactor);
                image.bitmap.data[idx + 2] = Math.floor(image.bitmap.data[idx + 2] * shadowFactor);
            }
        }
    }

    // Additional effect methods
    async applyDepthOfField(image, config) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Calculate distance from focal point
                const centerX = width * 0.5;
                const centerY = height * config.focal_distance;
                const distance = Math.abs(y - centerY);

                // Apply blur based on distance
                const blurAmount = Math.min(config.blur_strength, distance * config.aperture);

                if (blurAmount > 0) {
                    // Simple blur by averaging with neighbors
                    const blurRadius = Math.floor(blurAmount);
                    let totalR = 0, totalG = 0, totalB = 0, count = 0;

                    for (let by = -blurRadius; by <= blurRadius; by++) {
                        for (let bx = -blurRadius; bx <= blurRadius; bx++) {
                            const nx = Math.max(0, Math.min(width - 1, x + bx));
                            const ny = Math.max(0, Math.min(height - 1, y + by));
                            const nidx = (ny * width + nx) * 4;

                            totalR += image.bitmap.data[nidx];
                            totalG += image.bitmap.data[nidx + 1];
                            totalB += image.bitmap.data[nidx + 2];
                            count++;
                        }
                    }

                    image.bitmap.data[idx] = Math.floor(totalR / count);
                    image.bitmap.data[idx + 1] = Math.floor(totalG / count);
                    image.bitmap.data[idx + 2] = Math.floor(totalB / count);
                }
            }
        }
    }

    async applyMotionBlur(image, config) {
        const { width, height } = image.bitmap;

        // Create motion blur by averaging pixels along motion direction
        const blurImage = new Jimp(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let totalR = 0, totalG = 0, totalB = 0, count = 0;

                // Sample along motion direction
                for (let i = 0; i < 5; i++) {
                    const offsetX = x + config.direction.x * i * config.strength;
                    const offsetY = y + config.direction.y * i * config.strength;

                    const sampleX = Math.max(0, Math.min(width - 1, Math.floor(offsetX)));
                    const sampleY = Math.max(0, Math.min(height - 1, Math.floor(offsetY)));
                    const idx = (sampleY * width + sampleX) * 4;

                    totalR += image.bitmap.data[idx];
                    totalG += image.bitmap.data[idx + 1];
                    totalB += image.bitmap.data[idx + 2];
                    count++;
                }

                const idx = (y * width + x) * 4;
                blurImage.bitmap.data[idx] = Math.floor(totalR / count);
                blurImage.bitmap.data[idx + 1] = Math.floor(totalG / count);
                blurImage.bitmap.data[idx + 2] = Math.floor(totalB / count);
                blurImage.bitmap.data[idx + 3] = image.bitmap.data[idx + 3];
            }
        }

        // Copy blurred image back
        image.bitmap.data = blurImage.bitmap.data;
    }

    async applyChromaticAberration(image, config) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Calculate aberration based on distance from center
                const centerX = width * 0.5;
                const centerY = height * 0.5;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);

                const aberration = (distance / maxDistance) * config.strength;

                // Shift color channels
                const shiftX = config.direction.x * aberration * 5;
                const shiftY = config.direction.y * aberration * 5;

                // Red channel shift
                const redX = Math.max(0, Math.min(width - 1, x + shiftX));
                const redY = Math.max(0, Math.min(height - 1, y + shiftY));
                const redIdx = (Math.floor(redY) * width + Math.floor(redX)) * 4;

                // Blue channel shift (opposite direction)
                const blueX = Math.max(0, Math.min(width - 1, x - shiftX));
                const blueY = Math.max(0, Math.min(height - 1, y - shiftY));
                const blueIdx = (Math.floor(blueY) * width + Math.floor(blueX)) * 4;

                // Apply shifted colors
                image.bitmap.data[idx] = image.bitmap.data[redIdx]; // Red from shifted position
                image.bitmap.data[idx + 2] = image.bitmap.data[blueIdx + 2]; // Blue from shifted position
                // Green stays in place
            }
        }
    }

    async applyVignette(image, config) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Calculate distance from center
                const centerX = width * 0.5;
                const centerY = height * 0.5;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);

                // Apply vignette falloff
                const vignette = 1 - Math.pow(distance / maxDistance, config.radius) * config.intensity;
                const vignetteFactor = Math.max(0.3, vignette);

                image.bitmap.data[idx] = Math.floor(image.bitmap.data[idx] * vignetteFactor);
                image.bitmap.data[idx + 1] = Math.floor(image.bitmap.data[idx + 1] * vignetteFactor);
                image.bitmap.data[idx + 2] = Math.floor(image.bitmap.data[idx + 2] * vignetteFactor);
            }
        }
    }

    async applyFilmGrain(image, config) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Generate film grain noise
                const grain = (Math.random() - 0.5) * 2 * config.intensity;
                const grainSize = Math.sin(x * 0.1) * Math.cos(y * 0.1) * config.size;

                const grainValue = grain * (1 + grainSize);

                image.bitmap.data[idx] = Math.max(0, Math.min(255, image.bitmap.data[idx] + grainValue * 50));
                image.bitmap.data[idx + 1] = Math.max(0, Math.min(255, image.bitmap.data[idx + 1] + grainValue * 50));
                image.bitmap.data[idx + 2] = Math.max(0, Math.min(255, image.bitmap.data[idx + 2] + grainValue * 50));
            }
        }
    }

    async applyColorGrading(image, config) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                let r = image.bitmap.data[idx];
                let g = image.bitmap.data[idx + 1];
                let b = image.bitmap.data[idx + 2];

                // Apply contrast
                r = ((r / 255 - 0.5) * config.contrast + 0.5) * 255;
                g = ((g / 255 - 0.5) * config.contrast + 0.5) * 255;
                b = ((b / 255 - 0.5) * config.contrast + 0.5) * 255;

                // Apply saturation
                const luminance = r * 0.299 + g * 0.587 + b * 0.114;
                r = luminance + (r - luminance) * config.saturation;
                g = luminance + (g - luminance) * config.saturation;
                b = luminance + (b - luminance) * config.saturation;

                // Apply brightness
                r *= config.brightness;
                g *= config.brightness;
                b *= config.brightness;

                // Clamp values
                image.bitmap.data[idx] = Math.max(0, Math.min(255, r));
                image.bitmap.data[idx + 1] = Math.max(0, Math.min(255, g));
                image.bitmap.data[idx + 2] = Math.max(0, Math.min(255, b));
            }
        }
    }

    // Post-processing methods
    async applySharpening(image, strength) {
        const { width, height } = image.bitmap;
        const sharpened = new Jimp(width, height);

        // Simple sharpening kernel
        const kernel = [
            0, -strength, 0,
            -strength, 1 + 4 * strength, -strength,
            0, -strength, 0
        ];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const kidx = ((y + ky) * width + (x + kx)) * 4;
                            const kvalue = kernel[(ky + 1) * 3 + (kx + 1)];
                            sum += image.bitmap.data[kidx + c] * kvalue;
                        }
                    }
                    sharpened.bitmap.data[idx + c] = Math.max(0, Math.min(255, sum));
                }
                sharpened.bitmap.data[idx + 3] = image.bitmap.data[idx + 3];
            }
        }

        image.bitmap.data = sharpened.bitmap.data;
    }

    async applyDenoising(image, strength) {
        const { width, height } = image.bitmap;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                for (let c = 0; c < 3; c++) {
                    // Average with neighbors
                    let sum = image.bitmap.data[idx + c];
                    let count = 1;

                    for (let ny = -1; ny <= 1; ny++) {
                        for (let nx = -1; nx <= 1; nx++) {
                            if (nx === 0 && ny === 0) continue;
                            const nidx = ((y + ny) * width + (x + nx)) * 4;
                            sum += image.bitmap.data[nidx + c];
                            count++;
                        }
                    }

                    const average = sum / count;
                    const original = image.bitmap.data[idx + c];
                    image.bitmap.data[idx + c] = original * (1 - strength) + average * strength;
                }
            }
        }
    }

    async adjustContrast(image, adjustment) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                for (let c = 0; c < 3; c++) {
                    const value = image.bitmap.data[idx + c] / 255;
                    const contrasted = ((value - 0.5) * adjustment + 0.5) * 255;
                    image.bitmap.data[idx + c] = Math.max(0, Math.min(255, contrasted));
                }
            }
        }
    }

    async adjustSaturation(image, adjustment) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                const r = image.bitmap.data[idx] / 255;
                const g = image.bitmap.data[idx + 1] / 255;
                const b = image.bitmap.data[idx + 2] / 255;

                const luminance = r * 0.299 + g * 0.587 + b * 0.114;

                const newR = luminance + (r - luminance) * adjustment;
                const newG = luminance + (g - luminance) * adjustment;
                const newB = luminance + (b - luminance) * adjustment;

                image.bitmap.data[idx] = Math.max(0, Math.min(255, newR * 255));
                image.bitmap.data[idx + 1] = Math.max(0, Math.min(255, newG * 255));
                image.bitmap.data[idx + 2] = Math.max(0, Math.min(255, newB * 255));
            }
        }
    }

    async adjustBrightness(image, adjustment) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                for (let c = 0; c < 3; c++) {
                    const brightened = image.bitmap.data[idx + c] * adjustment;
                    image.bitmap.data[idx + c] = Math.max(0, Math.min(255, brightened));
                }
            }
        }
    }

    async adjustGamma(image, adjustment) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                for (let c = 0; c < 3; c++) {
                    const normalized = image.bitmap.data[idx + c] / 255;
                    const gammaCorrected = Math.pow(normalized, 1 / adjustment) * 255;
                    image.bitmap.data[idx + c] = Math.max(0, Math.min(255, gammaCorrected));
                }
            }
        }
    }

    async adjustVibrance(image, adjustment) {
        const { width, height } = image.bitmap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                const r = image.bitmap.data[idx];
                const g = image.bitmap.data[idx + 1];
                const b = image.bitmap.data[idx + 2];

                const max = Math.max(r, g, b);
                const avg = (r + g + b) / 3;
                const amt = ((Math.abs(max - avg) * 2 / 255) * adjustment);

                if (r !== max) image.bitmap.data[idx] = Math.max(0, Math.min(255, r + (max - r) * amt));
                if (g !== max) image.bitmap.data[idx + 1] = Math.max(0, Math.min(255, g + (max - g) * amt));
                if (b !== max) image.bitmap.data[idx + 2] = Math.max(0, Math.min(255, b + (max - b) * amt));
            }
        }
    }

    // Utility methods
    async applyGaussianBlur(image, radius) {
        const { width, height } = image.bitmap;
        const blurred = new Jimp(width, height);

        // Simple box blur approximation
        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                const idx = (y * width + x) * 4;

                let totalR = 0, totalG = 0, totalB = 0, count = 0;

                for (let by = -radius; by <= radius; by++) {
                    for (let bx = -radius; bx <= radius; bx++) {
                        const bidx = ((y + by) * width + (x + bx)) * 4;
                        totalR += image.bitmap.data[bidx];
                        totalG += image.bitmap.data[bidx + 1];
                        totalB += image.bitmap.data[bidx + 2];
                        count++;
                    }
                }

                blurred.bitmap.data[idx] = Math.floor(totalR / count);
                blurred.bitmap.data[idx + 1] = Math.floor(totalG / count);
                blurred.bitmap.data[idx + 2] = Math.floor(totalB / count);
                blurred.bitmap.data[idx + 3] = image.bitmap.data[idx + 3];
            }
        }

        image.bitmap.data = blurred.bitmap.data;
    }

    // Perlin noise for procedural textures
    perlinNoise(x, y) {
        // Simple pseudo-random noise function
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }
}

module.exports = AssetQualityEnhancer;
