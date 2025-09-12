/**
 * Game Engine Exporters - Export formats for Unity, Godot, GameMaker, and generic engines
 * Handles conversion of spritesheets and animations to game engine formats
 */

const fs = require('fs').promises;
const path = require('path');

class GameEngineExporters {
    constructor() {
        this.exportFormats = {
            UNITY: 'unity',
            GODOT: 'godot',
            GAMEMAKER: 'gamemaker',
            CONSTRUCT: 'construct',
            RENPY: 'renpy',
            GENERIC: 'generic'
        };

        // Engine-specific settings
        this.engineSettings = {
            unity: {
                textureType: 'Sprite',
                spriteMode: 'Multiple',
                pixelsPerUnit: 32,
                filterMode: 'Point',
                compression: 'None'
            },
            godot: {
                importAs: 'Texture',
                flags: {
                    repeat: false,
                    filter: true,
                    mipmaps: false,
                    anisotropic: false
                }
            },
            gamemaker: {
                origin: 0, // Top-left
                collisionKind: 1, // Precise
                type: 0, // Normal
                preload: false
            }
        };
    }

    /**
     * Export spritesheet and animations for specific game engine
     */
    async export(spritesheetData, animationData, options = {}) {
        const config = {
            format: options.format || this.exportFormats.UNITY,
            outputPath: options.outputPath || './exports',
            includeAnimations: options.includeAnimations !== false,
            includeMetadata: options.includeMetadata !== false,
            optimizeForEngine: options.optimizeForEngine !== false,
            ...options
        };

        // Create output directory
        await this.ensureDirectoryExists(config.outputPath);

        // Export based on format
        switch (config.format) {
            case this.exportFormats.UNITY:
                return await this.exportUnity(spritesheetData, animationData, config);
            case this.exportFormats.GODOT:
                return await this.exportGodot(spritesheetData, animationData, config);
            case this.exportFormats.GAMEMAKER:
                return await this.exportGameMaker(spritesheetData, animationData, config);
            case this.exportFormats.CONSTRUCT:
                return await this.exportConstruct(spritesheetData, animationData, config);
            case this.exportFormats.RENPY:
                return await this.exportRenPy(spritesheetData, animationData, config);
            case this.exportFormats.GENERIC:
                return await this.exportGeneric(spritesheetData, animationData, config);
            default:
                return await this.exportGeneric(spritesheetData, animationData, config);
        }
    }

    /**
     * Export for Unity game engine
     */
    async exportUnity(spritesheetData, animationData, config) {
        const baseName = config.baseName || 'CharacterSprite';
        const outputFiles = [];

        // 1. Export spritesheet image
        const imagePath = path.join(config.outputPath, `${baseName}.png`);
        await spritesheetData.spritesheet.writeAsync(imagePath);
        outputFiles.push(imagePath);

        // 2. Export texture metadata (.meta file)
        const textureMeta = this.generateUnityTextureMeta(baseName, spritesheetData);
        const textureMetaPath = path.join(config.outputPath, `${baseName}.png.meta`);
        await fs.writeFile(textureMetaPath, textureMeta, 'utf8');
        outputFiles.push(textureMetaPath);

        // 3. Export sprite metadata
        const spriteMeta = this.generateUnitySpriteMeta(baseName, spritesheetData);
        const spriteMetaPath = path.join(config.outputPath, `${baseName}_Sprites.asset.meta`);
        await fs.writeFile(spriteMetaPath, spriteMeta, 'utf8');
        outputFiles.push(spriteMetaPath);

        // 4. Export animation controller
        if (config.includeAnimations && animationData) {
            const controllerData = this.generateUnityAnimationController(baseName, animationData);
            const controllerPath = path.join(config.outputPath, `${baseName}_Controller.controller`);
            await fs.writeFile(controllerPath, controllerData, 'utf8');
            outputFiles.push(controllerPath);

            // Export individual animation clips
            for (const [animName, animData] of Object.entries(animationData.animations || {})) {
                const clipData = this.generateUnityAnimationClip(baseName, animName, animData, spritesheetData);
                const clipPath = path.join(config.outputPath, `${baseName}_${animName}.anim`);
                await fs.writeFile(clipPath, clipData, 'utf8');
                outputFiles.push(clipPath);
            }
        }

        // 5. Export prefab
        const prefabData = this.generateUnityPrefab(baseName);
        const prefabPath = path.join(config.outputPath, `${baseName}.prefab`);
        await fs.writeFile(prefabPath, prefabData, 'utf8');
        outputFiles.push(prefabPath);

        return {
            format: 'unity',
            files: outputFiles,
            mainImage: imagePath,
            metadata: {
                textureMeta: textureMetaPath,
                spriteMeta: spriteMetaPath,
                controller: config.includeAnimations ? path.join(config.outputPath, `${baseName}_Controller.controller`) : null
            }
        };
    }

    /**
     * Generate Unity texture metadata
     */
    generateUnityTextureMeta(baseName, spritesheetData) {
        const settings = this.engineSettings.unity;

        return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!28 &1
Texture2D:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: ${baseName}
  m_ForcedFallbackFormat: 0
  m_DownscaleFallback: 0
  serializedVersion: 2
  m_TextureSettings:
    serializedVersion: 2
    m_FilterMode: 0
    m_Aniso: 1
    m_MipBias: 0
    m_WrapU: 0
    m_WrapV: 0
    m_WrapW: 0
  m_LightmapFormat: 0
  m_ColorSpace: 0
  m_PlatformSettings:
  - serializedVersion: 3
    m_BuildTarget: DefaultTexturePlatform
    m_MaxTextureSize: 2048
    m_ResizeAlgorithm: 0
    m_TextureFormat: -1
    m_TextureCompression: 0
    m_CompressionQuality: 50
    m_CrunchedCompression: 0
    m_AllowsAlphaSplitting: 0
    m_OverridePlatform: 0
    m_AndroidETC2FallbackOverride: 0
    m_ForceMaximumCompressionQuality_BC6H_BC7: 0
  m_StreamData:
    offset: 0
    size: 0
    path: 

--- !u!114 &2
MonoBehaviour:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 0}
  m_Enabled: 1
  m_EditorHideFlags: 0
  m_Script: {fileID: 10913, guid: 0000000000000000e000000000000000, type: 0}
  m_Name: 
  m_EditorClassIdentifier: 
  spriteSheet:
    m_SpriteSheet:
      m_Sprites: []
      m_Texture: {fileID: 1}
    m_NameFileIdTable: {}
  spriteSheetTexture: {fileID: 1}
  m_AtlasRectOffset: {x: 0, y: 0}
  m_SettingsRaw: 3240099840
  m_CompressionQuality: 50
  m_MipMapMode: 0
  m_SpriteMode: 2
  m_SpriteExtrude: 1
  m_SpriteMeshType: 1
  m_Alignment: 0
  m_SpritePivot: {x: .5, y: .5}
  m_SpritePixelsToUnits: ${settings.pixelsPerUnit}
  m_SpriteBorder: {x: 0, y: 0, z: 0, w: 0}
  m_SpriteGenerateFallbackPhysicsShape: 1
  m_AlphaUsage: 1
  m_AlphaIsTransparency: 1
  m_SpriteTessellationDetail: -1
  m_TextureType: 8
  m_TextureShape: 1
  m_SingleChannelComponent: 0
  m_MaxTextureSizeSet: 0
  m_CompressionQualitySet: 0
  m_TextureFormatSet: 0
  m_PlatformSettings:
  - serializedVersion: 3
    m_BuildTarget: DefaultTexturePlatform
    m_MaxTextureSize: 2048
    m_ResizeAlgorithm: 0
    m_TextureFormat: -1
    m_TextureCompression: 0
    m_CompressionQuality: 50
    m_CrunchedCompression: 0
    m_AllowsAlphaSplitting: 0
    m_OverridePlatform: 0
    m_AndroidETC2FallbackOverride: 0
    m_ForceMaximumCompressionQuality_BC6H_BC7: 0
  m_SpriteEditorData:
    serializedVersion: 2
    textureRect:
      serializedVersion: 2
      x: 0
      y: 0
      width: ${spritesheetData.spritesheet.bitmap.width}
      height: ${spritesheetData.spritesheet.bitmap.height}
    textureRectOffset: {x: 0, y: 0}
    atlasRectOffset: {x: 0, y: 0}
    spriteOutline: []
    spriteOutlineOutline: []
    spriteMask: {Path: [], Rect: {x: 0, y: 0, width: 0, height: 0}}
    spriteColor: {r: 1, g: 1, b: 1, a: 1}
    spriteBorder: {x: 0, y: 0, z: 0, w: 0}
  m_SourceTextureRect: {x: 0, y: 0, width: ${spritesheetData.spritesheet.bitmap.width}, height: ${spritesheetData.spritesheet.bitmap.height}}
  m_IsReadable: 1`;
    }

    /**
     * Generate Unity sprite metadata
     */
    generateUnitySpriteMeta(baseName, spritesheetData) {
        let meta = `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
`;

        let fileId = 3;
        const frames = spritesheetData.metadata.frames || {};

        for (const [frameId, frameData] of Object.entries(frames)) {
            meta += `--- !u!213 &${fileId}
Sprite:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: ${frameId}
  m_Rect:
    serializedVersion: 2
    x: ${frameData.frame.x}
    y: ${frameData.frame.y}
    width: ${frameData.frame.w}
    height: ${frameData.frame.h}
  m_Offset: {x: 0, y: 0}
  m_Border: {x: 0, y: 0, z: 0, w: 0}
  m_PixelsToUnits: 32
  m_Pivot: {x: 0.5, y: 0.5}
  m_Extrude: 1
  m_IsPolygon: 0
  m_AtlasName: ${baseName}
  m_PackingTag: 
  m_RenderDataKey: 
  m_AtlasTags: []
  m_SpriteAtlas: {fileID: 0}
  m_RD:
    serializedVersion: 3
    texture: {fileID: 0}
    alphaTexture: {fileID: 0}
  m_SubMeshes: []
  m_IndexBuffer: 
  m_VertexData:
    serializedVersion: 4
    m_VertexCount: 0
    m_VertexData: []
    m_VertexBufferSize: 0
    m_IndexBuffer: 
    m_IndexBufferSize: 0
    m_SubMeshes: []
    m_BindposeIndexBuffer: []
    m_BindposeIndexBufferSize: 0
    m_VertexDataSize: 0
    m_IndexDataSize: 0
  m_LocalAABB:
    m_Center: {x: 0, y: 0, z: 0}
    m_Extent: {x: 0, y: 0, z: 0}
  m_PhysicsShape: []
  m_Bones: []
  m_SpriteID: 
  m_VertexColor: {r: 1, g: 1, b: 1, a: 1}
  m_HasPhysicsShape: 0

`;
            fileId++;
        }

        return meta;
    }

    /**
     * Generate Unity animation controller
     */
    generateUnityAnimationController(baseName, animationData) {
        return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!91 &1
AnimatorController:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: ${baseName}_Controller
  serializedVersion: 5
  m_AnimatorParameters: []
  m_AnimatorLayers:
  - serializedVersion: 5
    m_Name: Base Layer
    m_StateMachine: {fileID: 2}
    m_Mask: {fileID: 0}
    m_Motions: []
    m_Behaviours: []
    m_BlendingMode: 0
    m_SyncedLayerIndex: -1
    m_DefaultWeight: 1
    m_IKPass: 0
    m_SyncedLayerAffectsTiming: 0
    m_Controller: {fileID: 1}

--- !u!1107 &2
AnimatorStateMachine:
  serializedVersion: 6
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: Base Layer
  m_ChildStates: []
  m_ChildStatesSize: 0
  m_AnyStateTransitions: []
  m_EntryTransitions: []
  m_StateMachineTransitions: {}
  m_StateMachineBehaviours: []
  m_AnyStatePosition: {x: 50, y: 20, z: 0}
  m_EntryPosition: {x: 50, y: 120, z: 0}
  m_ExitPosition: {x: 800, y: 120, z: 0}
  m_ParentStateMachinePosition: {x: 800, y: 20, z: 0}
  m_DefaultState: {fileID: 0}`;
    }

    /**
     * Generate Unity animation clip
     */
    generateUnityAnimationClip(baseName, animName, animData, spritesheetData) {
        return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!74 &1
AnimationClip:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: ${animName}
  serializedVersion: 6
  m_Legacy: 0
  m_Compressed: 0
  m_UseHighQualityCurve: 1
  m_RotationCurves: []
  m_CompressedRotationCurves: []
  m_EulerCurves: []
  m_PositionCurves: []
  m_ScaleCurves: []
  m_FloatCurves: []
  m_PPtrCurves:
  - serializedVersion: 2
    m_Curve:
    - time: 0
      value: {fileID: 21300000, guid: 0000000000000000f000000000000000, type: 0}
    - time: ${animData.duration / 1000}
      value: {fileID: 21300000, guid: 0000000000000000f000000000000000, type: 0}
    m_PreInfinity: 2
    m_PostInfinity: 2
    m_RotationOrder: 4
    attribute: m_Sprite
    path: 
    classID: 212
    script: {fileID: 0}
  m_SampleRate: 60
  m_WrapMode: ${animData.loop ? 0 : 1}
  m_Bounds:
    m_Center: {x: 0, y: 0, z: 0}
    m_Extent: {x: 0, y: 0, z: 0}
  m_ClipBindingConstant:
    genericBindings: []
    pptrCurveMapping: []
  m_AnimationClipSettings:
    serializedVersion: 2
    m_AdditiveReferencePoseClip: {fileID: 0}
    m_AdditiveReferencePoseTime: 0
    m_StartTime: 0
    m_StopTime: ${animData.duration / 1000}
    m_OrientationOffsetY: 0
    m_Level: 0
    m_CycleOffset: 0
    m_HasAdditiveReferencePose: 0
    m_LoopTime: ${animData.loop ? 1 : 0}
    m_LoopBlend: 0
    m_LoopBlendOrientation: 0
    m_LoopBlendPositionY: 0
    m_LoopBlendPositionXZ: 0
    m_KeepOriginalOrientation: 0
    m_KeepOriginalPositionY: 1
    m_KeepOriginalPositionXZ: 0
    m_HeightFromFeet: 0
    m_Mirror: 0
  m_EditorCurves: []
  m_EulerEditorCurves: []
  m_HasGenericRootTransform: 0
  m_HasMotionFloatCurves: 0
  m_Events: []`;
    }

    /**
     * Generate Unity prefab
     */
    generateUnityPrefab(baseName) {
        return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!1 &1
GameObject:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_Name: ${baseName}
  serializedVersion: 6
  m_Component:
  - component: {fileID: 2}
  - component: {fileID: 3}
  - component: {fileID: 4}
  m_Layer: 0
  m_Name: ${baseName}
  m_TagString: Untagged
  m_Icon: {fileID: 0}
  m_NavMeshLayer: 0
  m_StaticEditorFlags: 0
  m_IsActive: 1

--- !u!4 &2
Transform:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 1}
  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}
  m_LocalPosition: {x: 0, y: 0, z: 0}
  m_LocalScale: {x: 1, y: 1, z: 1}
  m_Children: []
  m_Father: {fileID: 0}
  m_RootOrder: 0
  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}

--- !u!212 &3
SpriteRenderer:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 1}
  m_Enabled: 1
  m_CastShadows: 0
  m_ReceiveShadows: 0
  m_DynamicOccludee: 1
  m_MotionVectors: 1
  m_LightProbeUsage: 1
  m_ReflectionProbeUsage: 1
  m_RayTracingMode: 0
  m_RayTraceProcedural: 0
  m_RenderingLayerMask: 1
  m_RendererPriority: 0
  m_Materials:
  - {fileID: 10754, guid: 0000000000000000f000000000000000, type: 0}
  m_StaticBatchInfo:
    firstSubMesh: 0
    subMeshCount: 0
  m_StaticBatchRoot: {fileID: 0}
  m_ProbeAnchor: {fileID: 0}
  m_LightProbeVolumeOverride: {fileID: 0}
  m_ScaleInLightmap: 1
  m_ReceiveGI: 1
  m_PreserveUVs: 0
  m_IgnoreNormalsForChartDetection: 0
  m_ImportantGI: 0
  m_StitchLightmapSeams: 1
  m_SelectedEditorRenderState: 0
  m_MinimumChartSize: 4
  m_AutoUVMaxDistance: 0.5
  m_AutoUVMaxAngle: 89
  m_LightmapParameters: {fileID: 0}
  m_SortingLayerID: 0
  m_SortingLayer: 0
  m_SortingOrder: 0
  m_Sprite: {fileID: 21300000, guid: 0000000000000000f000000000000000, type: 0}
  m_Color: {r: 1, g: 1, b: 1, a: 1}
  m_FlipX: 0
  m_FlipY: 0
  m_DrawMode: 0
  m_Size: {x: 1, y: 1}
  m_AdaptiveModeThreshold: 0.5
  m_SpriteTileMode: 0
  m_WasSpriteAssigned: 1
  m_MaskInteraction: 0
  m_SpriteSortPoint: 0

--- !u!95 &4
Animator:
  serializedVersion: 4
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 1}
  m_Enabled: 1
  m_Avatar: {fileID: 0}
  m_Controller: {fileID: 9100000, guid: 0000000000000000f000000000000000, type: 0}
  m_CullingMode: 0
  m_UpdateMode: 0
  m_ApplyRootMotion: 0
  m_LinearVelocityBlending: 0
  m_StabilizeFeet: 0
  m_WarningMessage: 
  m_HasTransformHierarchy: 1
  m_AllowConstantClipSampling: 1
  m_KeepAnimatorControllerStateOnDisable: 0`;
    }

    /**
     * Export for Godot game engine
     */
    async exportGodot(spritesheetData, animationData, config) {
        const baseName = config.baseName || 'CharacterSprite';
        const outputFiles = [];

        // 1. Export spritesheet image
        const imagePath = path.join(config.outputPath, `${baseName}.png`);
        await spritesheetData.spritesheet.writeAsync(imagePath);
        outputFiles.push(imagePath);

        // 2. Export texture resource (.tres)
        const textureResource = this.generateGodotTextureResource(baseName, spritesheetData);
        const texturePath = path.join(config.outputPath, `${baseName}.tres`);
        await fs.writeFile(texturePath, textureResource, 'utf8');
        outputFiles.push(texturePath);

        // 3. Export sprite frames resource
        if (config.includeAnimations && animationData) {
            const spriteFrames = this.generateGodotSpriteFrames(baseName, spritesheetData, animationData);
            const spriteFramesPath = path.join(config.outputPath, `${baseName}_frames.tres`);
            await fs.writeFile(spriteFramesPath, spriteFrames, 'utf8');
            outputFiles.push(spriteFramesPath);
        }

        // 4. Export scene (.tscn)
        const sceneData = this.generateGodotScene(baseName);
        const scenePath = path.join(config.outputPath, `${baseName}.tscn`);
        await fs.writeFile(scenePath, sceneData, 'utf8');
        outputFiles.push(scenePath);

        return {
            format: 'godot',
            files: outputFiles,
            mainImage: imagePath,
            textureResource: texturePath,
            spriteFrames: config.includeAnimations ? path.join(config.outputPath, `${baseName}_frames.tres`) : null
        };
    }

    /**
     * Generate Godot texture resource
     */
    generateGodotTextureResource(baseName, spritesheetData) {
        const settings = this.engineSettings.godot;

        return `[gd_resource type="Texture" load_steps=1 format=3]

[ext_resource path="res://${baseName}.png" type="Texture" id=1]

[resource]
resource_name = "${baseName}"
texture = ExtResource( 1 )
flags = ${settings.flags.repeat ? 1 : 0} | ${settings.flags.filter ? 4 : 0} | ${settings.flags.mipmaps ? 8 : 0} | ${settings.flags.anisotropic ? 16 : 0}
load_path = "res://.import/${baseName}.png-${this.generateGodotImportHash(baseName)}"`;
    }

    /**
     * Generate Godot sprite frames
     */
    generateGodotSpriteFrames(baseName, spritesheetData, animationData) {
        let framesData = `[gd_resource type="SpriteFrames" load_steps=2 format=3]

[ext_resource path="res://${baseName}.tres" type="Texture" id=1]

[resource]
resource_name = "${baseName}_frames"
animations = [
`;

        // Add animations
        const animations = animationData.animations || {};
        const frames = spritesheetData.metadata.frames || {};

        for (const [animName, animData] of Object.entries(animations)) {
            framesData += `\t{\n`;
            framesData += `\t\t"frames": [\n`;

            for (const frameId of animData.frames) {
                const frame = frames[frameId];
                if (frame) {
                    framesData += `\t\t\t{\n`;
                    framesData += `\t\t\t\t"atlas": ExtResource( 1 ),\n`;
                    framesData += `\t\t\t\t"region": Rect2( ${frame.frame.x}, ${frame.frame.y}, ${frame.frame.w}, ${frame.frame.h} ),\n`;
                    framesData += `\t\t\t\t"margin": Rect2( 0, 0, 0, 0 ),\n`;
                    framesData += `\t\t\t\t"flip_h": false,\n`;
                    framesData += `\t\t\t\t"flip_v": false\n`;
                    framesData += `\t\t\t},\n`;
                }
            }

            framesData += `\t\t],\n`;
            framesData += `\t\t"loop": ${animData.loop ? 'true' : 'false'},\n`;
            framesData += `\t\t"name": "${animName}",\n`;
            framesData += `\t\t"speed": ${1000 / animData.frameDuration}\n`;
            framesData += `\t},\n`;
        }

        framesData += ']\n';

        return framesData;
    }

    /**
     * Generate Godot scene
     */
    generateGodotScene(baseName) {
        return `[gd_scene load_steps=4 format=3]

[ext_resource path="res://${baseName}_frames.tres" type="SpriteFrames" id=1]

[sub_resource type="Animation" id=2]
resource_name = "RESET"
tracks/0/type = "value"
tracks/0/imported = false
tracks/0/enabled = true
tracks/0/path = NodePath(".:frame")
tracks/0/interp = 1
tracks/0/loop_wrap = true
tracks/0/keys = {
"times": PackedFloat32Array(0),
"transitions": PackedFloat32Array(1),
"update": 1,
"values": [0]
}

[node name="${baseName}" type="AnimatedSprite2D"]
sprite_frames = ExtResource( 1 )
animation = &"idle"
autoplay = "idle"
frame = 0
centered = true`;
    }

    /**
     * Export for GameMaker Studio
     */
    async exportGameMaker(spritesheetData, animationData, config) {
        const baseName = config.baseName || 'CharacterSprite';
        const outputFiles = [];

        // 1. Export spritesheet image
        const imagePath = path.join(config.outputPath, `${baseName}.png`);
        await spritesheetData.spritesheet.writeAsync(imagePath);
        outputFiles.push(imagePath);

        // 2. Export sprite data (.yy file)
        const spriteData = this.generateGameMakerSprite(baseName, spritesheetData, animationData);
        const spritePath = path.join(config.outputPath, `${baseName}.yy`);
        await fs.writeFile(spritePath, spriteData, 'utf8');
        outputFiles.push(spritePath);

        // 3. Export object data if animations exist
        if (config.includeAnimations && animationData) {
            const objectData = this.generateGameMakerObject(baseName, animationData);
            const objectPath = path.join(config.outputPath, `${baseName}Object.yy`);
            await fs.writeFile(objectPath, objectData, 'utf8');
            outputFiles.push(objectPath);
        }

        return {
            format: 'gamemaker',
            files: outputFiles,
            mainImage: imagePath,
            spriteData: spritePath
        };
    }

    /**
     * Generate GameMaker sprite data
     */
    generateGameMakerSprite(baseName, spritesheetData, animationData) {
        const settings = this.engineSettings.gamemaker;
        const frames = spritesheetData.metadata.frames || {};

        const spriteData = {
            kind: 'GMSprite',
            name: baseName,
            bboxMode: 0,
            collisionKind: settings.collisionKind,
            type: settings.type,
            origin: settings.origin,
            preMultiplyAlpha: false,
            edgeFiltering: false,
            collisionTolerance: 0,
            swfPrecision: 2.525,
            bbox_left: 0,
            bbox_right: spritesheetData.spritesheet.bitmap.width - 1,
            bbox_top: 0,
            bbox_bottom: spritesheetData.spritesheet.bitmap.height - 1,
            HTile: false,
            VTile: false,
            For3D: false,
            width: spritesheetData.spritesheet.bitmap.width,
            height: spritesheetData.spritesheet.bitmap.height,
            textureGroupId: {
                name: 'Default',
                path: 'texturegroups/Default'
            },
            swatchColours: null,
            gridX: 0,
            gridY: 0,
            frames: [],
            sequence: this.generateGameMakerSequence(baseName, spritesheetData, animationData),
            layers: [
                {
                    visible: true,
                    isLocked: false,
                    blendMode: 0,
                    opacity: 100.0,
                    displayName: 'default',
                    resourceVersion: '1.0',
                    name: this.generateGUID(),
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
            name: baseName,
            tags: [],
            resourceType: 'GMSprite'
        };

        return JSON.stringify(spriteData, null, 2);
    }

    /**
     * Generate GameMaker sequence
     */
    generateGameMakerSequence(baseName, spritesheetData, animationData) {
        const animations = animationData.animations || {};
        const frames = spritesheetData.metadata.frames || {};

        return {
            kind: 'GMSequence',
            name: `${baseName}_Animation`,
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
            tracks: this.generateGameMakerTracks(animations, frames),
            usesMoments: false,
            playbackNaturalSpeed: 60.0,
            playbackSpeed: 60.0,
            playbackSpeedType: 0,
            resourceVersion: '1.0',
            name: `${baseName}_Animation`,
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
        };
    }

    /**
     * Generate GameMaker tracks
     */
    generateGameMakerTracks(animations, frames) {
        const tracks = [];

        for (const [animName, animData] of Object.entries(animations)) {
            const track = {
                kind: 'GMGraphicTrack',
                name: animName,
                builtinName: 0,
                traits: 0,
                interpolation: 1,
                tracks: [],
                traits: 0,
                visibleRange: null,
                interpolation: 1,
                tracks: [],
                resourceVersion: '1.0',
                name: animName,
                tags: [],
                resourceType: 'GMGraphicTrack'
            };

            tracks.push(track);
        }

        return tracks;
    }

    /**
     * Export for Construct 3
     */
    async exportConstruct(spritesheetData, animationData, config) {
        const baseName = config.baseName || 'CharacterSprite';
        const outputFiles = [];

        // 1. Export spritesheet image
        const imagePath = path.join(config.outputPath, `${baseName}.png`);
        await spritesheetData.spritesheet.writeAsync(imagePath);
        outputFiles.push(imagePath);

        // 2. Export sprite data
        const spriteData = this.generateConstructSprite(baseName, spritesheetData, animationData);
        const spritePath = path.join(config.outputPath, `${baseName}.sprite`);
        await fs.writeFile(spritePath, spriteData, 'utf8');
        outputFiles.push(spritePath);

        return {
            format: 'construct',
            files: outputFiles,
            mainImage: imagePath,
            spriteData: spritePath
        };
    }

    /**
     * Generate Construct sprite data
     */
    generateConstructSprite(baseName, spritesheetData, animationData) {
        const frames = spritesheetData.metadata.frames || {};
        const animations = animationData.animations || {};

        const spriteData = {
            type: 'sprite',
            name: baseName,
            width: spritesheetData.spritesheet.bitmap.width,
            height: spritesheetData.spritesheet.bitmap.height,
            image: `${baseName}.png`,
            frames: {},
            animations: {}
        };

        // Add frames
        for (const [frameId, frameData] of Object.entries(frames)) {
            spriteData.frames[frameId] = {
                x: frameData.frame.x,
                y: frameData.frame.y,
                w: frameData.frame.w,
                h: frameData.frame.h,
                rotated: frameData.rotated || false
            };
        }

        // Add animations
        for (const [animName, animData] of Object.entries(animations)) {
            spriteData.animations[animName] = {
                frames: animData.frames,
                speed: 1000 / animData.frameDuration,
                loop: animData.loop,
                repeat: animData.loop ? -1 : 0,
                repeatTo: 0
            };
        }

        return JSON.stringify(spriteData, null, 2);
    }

    /**
     * Export for Ren'Py
     */
    async exportRenPy(spritesheetData, animationData, config) {
        const baseName = config.baseName || 'CharacterSprite';
        const outputFiles = [];

        // 1. Export spritesheet image
        const imagePath = path.join(config.outputPath, `${baseName}.png`);
        await spritesheetData.spritesheet.writeAsync(imagePath);
        outputFiles.push(imagePath);

        // 2. Export Ren'Py image definitions
        const renpyData = this.generateRenPyImages(baseName, spritesheetData, animationData);
        const renpyPath = path.join(config.outputPath, `${baseName}_images.rpy`);
        await fs.writeFile(renpyPath, renpyData, 'utf8');
        outputFiles.push(renpyPath);

        return {
            format: 'renpy',
            files: outputFiles,
            mainImage: imagePath,
            renpyScript: renpyPath
        };
    }

    /**
     * Generate Ren'Py image definitions
     */
    generateRenPyImages(baseName, spritesheetData, animationData) {
        const frames = spritesheetData.metadata.frames || {};
        const animations = animationData.animations || {};

        let renpyScript = `# ${baseName} sprite definitions\n\n`;

        // Define individual frames
        for (const [frameId, frameData] of Object.entries(frames)) {
            renpyScript += `image ${baseName}_${frameId}:\n`;
            renpyScript += `    "${baseName}.png"\n`;
            renpyScript += `    crop (${frameData.frame.x}, ${frameData.frame.y}, ${frameData.frame.w}, ${frameData.frame.h})\n\n`;
        }

        // Define animations
        for (const [animName, animData] of Object.entries(animations)) {
            renpyScript += `image ${baseName}_${animName}:\n`;
            renpyScript += `    Animation(\n`;

            for (const frameId of animData.frames) {
                const frame = frames[frameId];
                if (frame) {
                    renpyScript += `        "${baseName}.png",\n`;
                    renpyScript += `        ${animData.frameDuration / 1000},\n`;
                    renpyScript += `        crop=(${frame.frame.x}, ${frame.frame.y}, ${frame.frame.w}, ${frame.frame.h}),\n`;
                }
            }

            renpyScript += `        loop=${animData.loop}\n`;
            renpyScript += `    )\n\n`;
        }

        return renpyScript;
    }

    /**
     * Export generic format
     */
    async exportGeneric(spritesheetData, animationData, config) {
        const baseName = config.baseName || 'CharacterSprite';
        const outputFiles = [];

        // 1. Export spritesheet image
        const imagePath = path.join(config.outputPath, `${baseName}.png`);
        await spritesheetData.spritesheet.writeAsync(imagePath);
        outputFiles.push(imagePath);

        // 2. Export JSON metadata
        const genericData = this.generateGenericData(baseName, spritesheetData, animationData);
        const jsonPath = path.join(config.outputPath, `${baseName}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(genericData, null, 2), 'utf8');
        outputFiles.push(jsonPath);

        return {
            format: 'generic',
            files: outputFiles,
            mainImage: imagePath,
            metadata: jsonPath
        };
    }

    /**
     * Generate generic data format
     */
    generateGenericData(baseName, spritesheetData, animationData) {
        const frames = spritesheetData.metadata.frames || {};
        const animations = animationData.animations || {};

        return {
            name: baseName,
            spritesheet: {
                image: `${baseName}.png`,
                width: spritesheetData.spritesheet.bitmap.width,
                height: spritesheetData.spritesheet.bitmap.height,
                format: spritesheetData.metadata?.meta?.format || 'RGBA8888'
            },
            frames: frames,
            animations: animations,
            metadata: {
                app: 'TPT Asset Editor',
                version: '1.0',
                exported: new Date().toISOString(),
                totalFrames: Object.keys(frames).length,
                totalAnimations: Object.keys(animations).length
            }
        };
    }

    /**
     * Generate GameMaker object data
     */
    generateGameMakerObject(baseName, animationData) {
        const animations = animationData.animations || {};

        const objectData = {
            kind: 'GMObject',
            name: `${baseName}Object`,
            spriteId: null, // Would need to reference the sprite
            solid: false,
            visible: true,
            managed: true,
            spriteNoCrop: false,
            showBackdrop: true,
            showBackdropImage: false,
            backdropImagePath: '',
            backdropImageOpacity: 0.5,
            backdropWidth: 1366,
            backdropHeight: 768,
            backdropXOffset: 0.0,
            backdropYOffset: 0.0,
            physicsObject: false,
            physicsSensor: false,
            physicsShape: 1,
            physicsDensity: 0.5,
            physicsRestitution: 0.1,
            physicsGroup: 1,
            physicsLinearDamping: 0.1,
            physicsAngularDamping: 0.1,
            physicsFriction: 0.2,
            physicsStartAwake: true,
            physicsKinematic: false,
            physicsShapePoints: [],
            eventList: [],
            properties: [],
            overiddenProperties: [],
            parent: {
                name: 'Objects',
                path: 'folders/Objects.yy'
            },
            resourceVersion: '1.0',
            name: `${baseName}Object`,
            tags: [],
            resourceType: 'GMObject'
        };

        return JSON.stringify(objectData, null, 2);
    }

    /**
     * Generate GUID for GameMaker
     */
    generateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Generate Godot import hash
     */
    generateGodotImportHash(baseName) {
        // Simple hash for Godot import files
        let hash = 0;
        for (let i = 0; i < baseName.length; i++) {
            const char = baseName.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Ensure directory exists
     */
    async ensureDirectoryExists(dirPath) {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    /**
     * Get supported export formats
     */
    getSupportedFormats() {
        return Object.values(this.exportFormats);
    }

    /**
     * Get format extensions
     */
    getFormatExtensions() {
        return {
            [this.exportFormats.UNITY]: ['.png', '.png.meta', '.controller', '.anim', '.prefab'],
            [this.exportFormats.GODOT]: ['.png', '.tres', '.tscn'],
            [this.exportFormats.GAMEMAKER]: ['.png', '.yy'],
            [this.exportFormats.CONSTRUCT]: ['.png', '.sprite'],
            [this.exportFormats.RENPY]: ['.png', '.rpy'],
            [this.exportFormats.GENERIC]: ['.png', '.json']
        };
    }

    /**
     * Validate export data
     */
    validateExportData(spritesheetData, animationData) {
        const errors = [];

        if (!spritesheetData || !spritesheetData.spritesheet) {
            errors.push('Spritesheet data is missing or invalid');
        }

        if (!spritesheetData.metadata || !spritesheetData.metadata.frames) {
            errors.push('Spritesheet metadata is missing frame data');
        }

        if (animationData && animationData.animations) {
            for (const [animName, animData] of Object.entries(animationData.animations)) {
                if (!animData.frames || animData.frames.length === 0) {
                    errors.push(`Animation '${animName}' has no frames`);
                }

                // Check if all frames exist
                for (const frameId of animData.frames) {
                    if (!spritesheetData.metadata.frames[frameId]) {
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
}

module.exports = GameEngineExporters;
