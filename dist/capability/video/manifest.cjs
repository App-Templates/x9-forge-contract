"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoProjectManifestSchema = exports.VideoProjectManifestScriptSchema = exports.VideoProjectManifestSceneSchema = exports.VideoProjectManifestFileSchema = exports.VIDEO_PROJECT_MANIFEST_VERSION = void 0;
const zod_1 = require("zod");
const brief_js_1 = require("./brief.cjs");
const footage_js_1 = require("./footage.cjs");
const story_js_1 = require("./story.cjs");
/**
 * The manifest of a delivered video: a public document, downloaded from the link of the video page.
 * cap-video writes it and every reader (Parallel, Forge, an agent) validates it with this schema.
 * It is not the engine's internal project: no identity, no referent email, no internal paths.
 */
exports.VIDEO_PROJECT_MANIFEST_VERSION = 1;
const usd = zod_1.z.number().finite().min(0);
/** One downloadable file of the delivery: the video or its subtitles. */
exports.VideoProjectManifestFileSchema = zod_1.z.strictObject({
    kind: zod_1.z.enum(['video', 'subtitles']),
    name: zod_1.z.string().regex(/^[A-Za-z0-9_-]+\.(mp4|mov|srt)$/),
    url: zod_1.z.url(),
});
/** A scene of the engine for presets without regia (the demo). */
exports.VideoProjectManifestSceneSchema = zod_1.z.strictObject({
    title: zod_1.z.string().max(500),
    narration: zod_1.z.string().max(6000),
});
/** The script of the preset with regia; `null` in the manifest for presets without. */
exports.VideoProjectManifestScriptSchema = zod_1.z.strictObject({
    revision: zod_1.z.number().int().min(1),
    scenes: story_js_1.VideoStoryScenesSchema,
    outro: story_js_1.VideoStoryOutroSchema,
});
exports.VideoProjectManifestSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(exports.VIDEO_PROJECT_MANIFEST_VERSION),
    projectId: brief_js_1.VideoProjectIdSchema,
    presetId: brief_js_1.VideoPresetIdSchema,
    presetTitle: zod_1.z.string().min(1).max(200),
    mode: brief_js_1.VideoModeSchema,
    brief: brief_js_1.VideoBriefRequestSchema.shape.brief,
    choices: brief_js_1.VideoRequestChoicesSchema,
    footage: footage_js_1.VideoFootageChoiceSchema.nullable(),
    script: exports.VideoProjectManifestScriptSchema.nullable(),
    /** Engine scenes for presets without regia; `[]` for the story presets. */
    scenes: zod_1.z.array(exports.VideoProjectManifestSceneSchema).max(32),
    cost: zod_1.z.strictObject({
        budgetUsd: usd,
        spentUsd: usd,
        estimateUsd: usd.nullable(),
    }),
    output: zod_1.z.strictObject({
        durationSeconds: zod_1.z.number().finite().min(0).nullable(),
        width: zod_1.z.number().int().min(1).nullable(),
        height: zod_1.z.number().int().min(1).nullable(),
        sha256: zod_1.z.string().regex(/^[0-9a-f]{64}$/).nullable(),
    }),
    files: zod_1.z.array(exports.VideoProjectManifestFileSchema).min(1).max(4)
        .refine((files) => files.filter((f) => f.kind === 'video').length === 1, { message: 'exactly one file of kind video' }),
    createdAt: zod_1.z.string().min(1),
    deliveredAt: zod_1.z.string().min(1),
});
//# sourceMappingURL=manifest.js.map