/**
 * Animation Metadata Export - JSON/XML files with frame timing and animation data
 * Handles generation of animation metadata for spritesheets and game engines
 */

const fs = require('fs').promises;
const path = require('path');

class AnimationMetadataExporter {
    constructor() {
        this.exportFormats = {
            JSON: 'json',
            XML: 'xml',
            UNITY: 'unity',
            GODOT: 'godot',
            GAMEMAKER: 'gamemaker',
            ASEPRITE: 'aseprite'
        };

        // Animation timing presets
        this.timingPresets = {
            walk: { duration: 800, easing: 'linear', loop: true },
            run: { duration: 600, easing: 'ease_out', loop: true },
            idle: { duration: 2000, easing: 'ease_in_out', loop: true },
            attack: { duration: 400, easing: 'ease_out', loop: false },
            cast: { duration: 800, easing: 'ease_in_out', loop: false },
            block: { duration: 200, easing: 'ease_out', loop: false },
            hurt: { duration: 300, easing: 'ease_in', loop: false },
            death: { duration: 1000, easing: 'ease_in', loop: false },
            jump: { duration: 500, easing: 'ease_out', loop: false }
        };

        // Default export options
        this.defaultOptions = {
            format: this.exportFormats.JSON,
            includeAnimations: true,
            includeMetadata: true,
            includeTimings: true,
            includeHitboxes: false,
            includeSoundEvents: false,
            compressOutput: false,
            prettyPrint: true
        };
    }

    /**
     * Main export method
     */
    async export(animationData, spritesheetData, options = {}) {
        const config = { ...this.defaultOptions, ...options };

        // Prepare animation data
        const preparedData = this.prepareAnimationData(animationData, spritesheetData, config);

        // Export based on format
        switch (config.format) {
            case this.exportFormats.JSON:
                return await this.exportJSON(preparedData, config);
            case this.exportFormats.XML:
                return await this.exportXML(preparedData, config);
            case this.exportFormats.UNITY:
                return await this.exportUnity(preparedData, config);
            case this.exportFormats.GODOT:
                return await this.exportGodot(preparedData, config);
            case this.exportFormats.GAMEMAKER:
                return await this.exportGameMaker(preparedData, config);
            case this.exportFormats.ASEPRITE:
                return await this.exportAseprite(preparedData, config);
            default:
                return await this.exportJSON(preparedData, config);
        }
    }

    /**
     * Prepare animation data for export
     */
    prepareAnimationData(animationData, spritesheetData, config) {
        const prepared = {
            spritesheet: {
                image: spritesheetData.metadata?.meta?.image || 'spritesheet.png',
                width: spritesheetData.metadata?.meta?.size?.w || 0,
                height: spritesheetData.metadata?.meta?.size?.h || 0,
                format: spritesheetData.metadata?.meta?.format || 'RGBA8888'
            },
            frames: {},
            animations: {},
            metadata: {
                app: 'TPT Asset Editor',
                version: '1.0',
                exported: new Date().toISOString(),
                totalFrames: 0,
                totalAnimations: 0
            }
        };

        // Process frames
        if (spritesheetData.metadata?.frames) {
            prepared.frames = { ...spritesheetData.metadata.frames };
            prepared.metadata.totalFrames = Object.keys(prepared.frames).length;
        }

        // Process animations
        if (animationData && config.includeAnimations) {
            prepared.animations = this.processAnimations(animationData, config);
            prepared.metadata.totalAnimations = Object.keys(prepared.animations).length;
        }

        // Add timing information
        if (config.includeTimings) {
            prepared.timings = this.generateTimingData(prepared.animations);
        }

        // Add hitbox data
        if (config.includeHitboxes) {
            prepared.hitboxes = this.generateHitboxData(prepared.frames);
        }

        // Add sound events
        if (config.includeSoundEvents) {
            prepared.soundEvents = this.generateSoundEvents(prepared.animations);
        }

        return prepared;
    }

    /**
     * Process animations from animation data
     */
    processAnimations(animationData, config) {
        const animations = {};

        for (const [animationName, animationFrames] of Object.entries(animationData)) {
            animations[animationName] = {
                name: animationName,
                frames: animationFrames,
                duration: this.timingPresets[animationName]?.duration || 500,
                loop: this.timingPresets[animationName]?.loop || false,
                easing: this.timingPresets[animationName]?.easing || 'linear',
                frameDuration: 0, // Will be calculated
                totalFrames: animationFrames.length
            };

            // Calculate frame duration
            animations[animationName].frameDuration = animations[animationName].duration / animationFrames.length;
        }

        return animations;
    }

    /**
     * Generate timing data for animations
     */
    generateTimingData(animations) {
        const timings = {};

        for (const [animationName, animation] of Object.entries(animations)) {
            timings[animationName] = {
                totalDuration: animation.duration,
                frameDuration: animation.frameDuration,
                loop: animation.loop,
                easing: animation.easing,
                keyframes: []
            };

            // Generate keyframe timing
            for (let i = 0; i < animation.frames.length; i++) {
                timings[animationName].keyframes.push({
                    frame: i,
                    time: i * animation.frameDuration,
                    normalizedTime: i / (animation.frames.length - 1)
                });
            }
        }

        return timings;
    }

    /**
     * Generate hitbox data for frames
     */
    generateHitboxData(frames) {
        const hitboxes = {};

        for (const [frameId, frameData] of Object.entries(frames)) {
            const frame = frameData.frame;
            hitboxes[frameId] = {
                body: {
                    x: Math.floor(frame.w * 0.2),
                    y: Math.floor(frame.h * 0.3),
                    width: Math.floor(frame.w * 0.6),
                    height: Math.floor(frame.h * 0.7)
                },
                head: {
                    x: Math.floor(frame.w * 0.35),
                    y: Math.floor(frame.h * 0.1),
                    width: Math.floor(frame.w * 0.3),
                    height: Math.floor(frame.h * 0.2)
                },
                feet: {
                    x: Math.floor(frame.w * 0.25),
                    y: Math.floor(frame.h * 0.8),
                    width: Math.floor(frame.w * 0.5),
                    height: Math.floor(frame.h * 0.2)
                }
            };
        }

        return hitboxes;
    }

    /**
     * Generate sound events for animations
     */
    generateSoundEvents(animations) {
        const soundEvents = {};

        for (const [animationName, animation] of Object.entries(animations)) {
            soundEvents[animationName] = [];

            // Add sound events based on animation type
            switch (animationName) {
                case 'walk':
                    soundEvents[animationName].push({
                        frame: 0,
                        event: 'footstep',
                        sound: 'footstep_grass'
                    });
                    soundEvents[animationName].push({
                        frame: Math.floor(animation.frames.length / 2),
                        event: 'footstep',
                        sound: 'footstep_grass'
                    });
                    break;

                case 'attack':
                    soundEvents[animationName].push({
                        frame: Math.floor(animation.frames.length * 0.3),
                        event: 'swing',
                        sound: 'sword_swing'
                    });
                    soundEvents[animationName].push({
                        frame: Math.floor(animation.frames.length * 0.7),
                        event: 'impact',
                        sound: 'sword_impact'
                    });
                    break;

                case 'cast':
                    soundEvents[animationName].push({
                        frame: Math.floor(animation.frames.length * 0.2),
                        event: 'cast_start',
                        sound: 'magic_cast'
                    });
                    soundEvents[animationName].push({
                        frame: Math.floor(animation.frames.length * 0.8),
                        event: 'cast_end',
                        sound: 'magic_release'
                    });
                    break;

                case 'hurt':
                    soundEvents[animationName].push({
                        frame: 0,
                        event: 'hurt',
                        sound: 'hurt_grunt'
                    });
                    break;

                case 'death':
                    soundEvents[animationName].push({
                        frame: Math.floor(animation.frames.length * 0.5),
                        event: 'death',
                        sound: 'death_thud'
                    });
                    break;
            }
        }

        return soundEvents;
    }

    /**
     * Export as JSON format
     */
    async exportJSON(data, config) {
        const output = config.prettyPrint
            ? JSON.stringify(data, null, 2)
            : JSON.stringify(data);

        return {
            content: output,
            format: 'json',
            extension: '.json'
        };
    }

    /**
     * Export as XML format
     */
    async exportXML(data, config) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<spritesheet>\n';

        // Spritesheet info
        xml += `  <image file="${data.spritesheet.image}" width="${data.spritesheet.width}" height="${data.spritesheet.height}" format="${data.spritesheet.format}" />\n`;

        // Frames
        xml += '  <frames>\n';
        for (const [frameId, frameData] of Object.entries(data.frames)) {
            xml += `    <frame id="${frameId}" x="${frameData.frame.x}" y="${frameData.frame.y}" width="${frameData.frame.w}" height="${frameData.frame.h}"`;
            if (frameData.rotated) xml += ' rotated="true"';
            xml += ' />\n';
        }
        xml += '  </frames>\n';

        // Animations
        if (data.animations) {
            xml += '  <animations>\n';
            for (const [animName, animData] of Object.entries(data.animations)) {
                xml += `    <animation name="${animName}" duration="${animData.duration}" loop="${animData.loop}" easing="${animData.easing}">\n`;
                xml += '      <frames>\n';
                for (const frame of animData.frames) {
                    xml += `        <frame>${frame}</frame>\n`;
                }
                xml += '      </frames>\n';
                xml += '    </animation>\n';
            }
            xml += '  </animations>\n';
        }

        xml += '</spritesheet>\n';

        return {
            content: xml,
            format: 'xml',
            extension: '.xml'
        };
    }

    /**
     * Export for Unity game engine
     */
    async exportUnity(data, config) {
        const unityData = {
            m_Name: 'CharacterAnimation',
            m_AnimationClips: []
        };

        // Convert animations to Unity format
        for (const [animName, animData] of Object.entries(data.animations)) {
            const clip = {
                m_Name: animName,
                m_Loop: animData.loop,
                m_Curve: [],
                m_Events: []
            };

            // Add frame events
            for (let i = 0; i < animData.frames.length; i++) {
                const time = (i / animData.frames.length) * animData.duration / 1000; // Convert to seconds
                clip.m_Events.push({
                    time: time,
                    functionName: 'SetFrame',
                    data: animData.frames[i],
                    objectReferenceParameter: null
                });
            }

            unityData.m_AnimationClips.push(clip);
        }

        return {
            content: JSON.stringify(unityData, null, 2),
            format: 'unity',
            extension: '.anim'
        };
    }

    /**
     * Export for Godot game engine
     */
    async exportGodot(data, config) {
        let godotScript = '[gd_resource type="SpriteFrames" load_steps=2 format=3]\n\n';
        godotScript += '[ext_resource path="res://spritesheet.png" type="Texture" id=1]\n\n';
        godotScript += '[sub_resource type="AtlasTexture" id=2]\n';
        godotScript += 'atlas = ExtResource( 1 )\n';
        godotScript += 'region = Rect2( 0, 0, 64, 64 )\n\n';

        godotScript += '[resource]\n';
        godotScript += 'animations = [\n';

        // Add animations
        for (const [animName, animData] of Object.entries(data.animations)) {
            godotScript += `  {\n`;
            godotScript += `    "frames": [\n`;

            for (const frameId of animData.frames) {
                const frame = data.frames[frameId];
                if (frame) {
                    godotScript += `      SubResource( 2 ),\n`;
                }
            }

            godotScript += `    ],\n`;
            godotScript += `    "loop": ${animData.loop ? 'true' : 'false'},\n`;
            godotScript += `    "name": "${animName}",\n`;
            godotScript += `    "speed": ${1000 / animData.frameDuration}\n`;
            godotScript += `  },\n`;
        }

        godotScript += ']\n';

        return {
            content: godotScript,
            format: 'godot',
            extension: '.tres'
        };
    }

    /**
     * Export for GameMaker Studio
     */
    async exportGameMaker(data, config) {
        const gmData = {
            kind: 'GMSprite',
            name: 'CharacterSprite',
            bboxMode: 0,
            collisionKind: 1,
            type: 0,
            origin: 0,
            preMultiplyAlpha: false,
            edgeFiltering: false,
            collisionTolerance: 0,
            swfPrecision: 2.525,
            bbox_left: 0,
            bbox_right: data.spritesheet.width - 1,
            bbox_top: 0,
            bbox_bottom: data.spritesheet.height - 1,
            HTile: false,
            VTile: false,
            For3D: false,
            width: data.spritesheet.width,
            height: data.spritesheet.height,
            textureGroupId: {
                name: 'Default',
                path: 'texturegroups/Default'
            },
            swatchColours: null,
            gridX: 0,
            gridY: 0,
            frames: [],
            sequence: {
                kind: 'GMSequence',
                name: 'CharacterAnimation',
                autoRecord: true,
                volume: 1.0,
                length: 60.0,
                playback: 1,
                playbackSpeed: 60.0,
                playbackSpeedType: 0,
                autoRecord: true,
                visibleRange: null,
                showBackdrop: true,
                showBackdropImage: false,
                backdropImagePath: '',
                backdropImageOpacity: 0.5,
                backdropWidth: 1366,
                backdropHeight: 768,
                backdropXOffset: 0.0,
                backdropYOffset: 0.0,
                events: {
                    Keyframes: [],
                    resourceVersion: '1.0',
                    resourceType: 'KeyframeStore<MessageEventKeyframe>'
                },
                moments: {
                    Keyframes: [],
                    resourceVersion: '1.0',
                    resourceType: 'KeyframeStore<MomentsEventKeyframe>'
                },
                tracks: [],
                usesMoments: false,
                playbackNaturalSpeed: 60.0,
                playbackSpeed: 60.0,
                playbackSpeedType: 0,
                resourceVersion: '1.0',
                name: 'CharacterAnimation',
                autoRecord: true,
                volume: 1.0,
                length: 60.0,
                events: {
                    Keyframes: [],
                    resourceVersion: '1.0',
                    resourceType: 'KeyframeStore<MessageEventKeyframe>'
                },
                moments: {
                    Keyframes: [],
                    resourceVersion: '1.0',
                    resourceType: 'KeyframeStore<MomentsEventKeyframe>'
                },
                tracks: [],
                usesMoments: false,
                playbackNaturalSpeed: 60.0,
                playbackSpeed: 60.0,
                playbackSpeedType: 0,
                resourceVersion: '1.0'
            },
            layers: [
                {
                    visible: true,
                    isLocked: false,
                    blendMode: 0,
                    opacity: 100.0,
                    displayName: 'default',
                    resourceVersion: '1.0',
                    name: '12345678-1234-1234-1234-123456789012',
                    tags: [],
                    resourceType: 'GMImageLayer'
                }
            ],
            nineSlice: null,
            parent: {
                name: 'Sprites',
                path: 'folders/Sprites.yy'
            },
            resourceVersion: '1.0',
            name: 'CharacterSprite',
            tags: [],
            resourceType: 'GMSprite'
        };

        return {
            content: JSON.stringify(gmData, null, 2),
            format: 'gamemaker',
            extension: '.yy'
        };
    }

    /**
     * Export for Aseprite
     */
    async exportAseprite(data, config) {
        const aseData = {
            frames: {},
            meta: {
                app: 'TPT Asset Editor',
                version: '1.0',
                image: data.spritesheet.image,
                format: 'RGBA8888',
                size: {
                    w: data.spritesheet.width,
                    h: data.spritesheet.height
                },
                scale: '1',
                frameTags: []
            }
        };

        // Convert frames to Aseprite format
        for (const [frameId, frameData] of Object.entries(data.frames)) {
            aseData.frames[frameId] = {
                frame: {
                    x: frameData.frame.x,
                    y: frameData.frame.y,
                    w: frameData.frame.w,
                    h: frameData.frame.h
                },
                rotated: frameData.rotated || false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: frameData.frame.w,
                    h: frameData.frame.h
                },
                sourceSize: {
                    w: frameData.frame.w,
                    h: frameData.frame.h
                },
                duration: 100 // Default 100ms per frame
            };
        }

        // Add animation tags
        for (const [animName, animData] of Object.entries(data.animations)) {
            aseData.meta.frameTags.push({
                name: animName,
                from: 0, // Would need proper frame indexing
                to: animData.frames.length - 1,
                direction: animData.loop ? 'forward' : 'pingpong'
            });
        }

        return {
            content: JSON.stringify(aseData, null, 2),
            format: 'aseprite',
            extension: '.json'
        };
    }

    /**
     * Save exported data to file
     */
    async saveToFile(exportData, outputPath) {
        const fullPath = outputPath.endsWith(exportData.extension)
            ? outputPath
            : outputPath + exportData.extension;

        await fs.writeFile(fullPath, exportData.content, 'utf8');

        return {
            path: fullPath,
            format: exportData.format,
            size: exportData.content.length
        };
    }

    /**
     * Generate animation preview data
     */
    generateAnimationPreview(animations, frames) {
        const preview = {};

        for (const [animName, animData] of Object.entries(animations)) {
            preview[animName] = {
                name: animName,
                frameCount: animData.frames.length,
                duration: animData.duration,
                loop: animData.loop,
                thumbnail: this.generateAnimationThumbnail(animData.frames, frames),
                frameSequence: animData.frames
            };
        }

        return preview;
    }

    /**
     * Generate animation thumbnail (simplified)
     */
    generateAnimationThumbnail(frameSequence, frames) {
        if (frameSequence.length === 0) return null;

        // Use first frame as thumbnail
        const firstFrameId = frameSequence[0];
        const firstFrame = frames[firstFrameId];

        if (firstFrame) {
            return {
                x: firstFrame.frame.x,
                y: firstFrame.frame.y,
                width: firstFrame.frame.w,
                height: firstFrame.frame.h
            };
        }

        return null;
    }

    /**
     * Validate animation data
     */
    validateAnimationData(data) {
        const errors = [];

        // Check if frames exist
        if (!data.frames || Object.keys(data.frames).length === 0) {
            errors.push('No frames found in animation data');
        }

        // Check animations
        if (data.animations) {
            for (const [animName, animData] of Object.entries(data.animations)) {
                if (!animData.frames || animData.frames.length === 0) {
                    errors.push(`Animation '${animName}' has no frames`);
                }

                // Check if all frames exist
                for (const frameId of animData.frames) {
                    if (!data.frames[frameId]) {
                        errors.push(`Animation '${animName}' references missing frame '${frameId}'`);
                    }
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Optimize animation data for export
     */
    optimizeAnimationData(data, options = {}) {
        const optimized = { ...data };

        // Remove unused frames if requested
        if (options.removeUnusedFrames && optimized.animations) {
            const usedFrames = new Set();

            for (const animData of Object.values(optimized.animations)) {
                for (const frameId of animData.frames) {
                    usedFrames.add(frameId);
                }
            }

            // Remove unused frames
            for (const frameId of Object.keys(optimized.frames)) {
                if (!usedFrames.has(frameId)) {
                    delete optimized.frames[frameId];
                }
            }
        }

        // Compress frame data if requested
        if (options.compressFrames) {
            for (const [frameId, frameData] of Object.entries(optimized.frames)) {
                // Remove redundant data
                if (frameData.spriteSourceSize.x === 0 && frameData.spriteSourceSize.y === 0) {
                    delete frameData.spriteSourceSize;
                }
            }
        }

        return optimized;
    }
}

module.exports = AnimationMetadataExporter;
