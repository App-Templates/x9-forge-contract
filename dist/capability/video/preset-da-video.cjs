"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPresetSaveRequestSchema = exports.VideoPresetFromVideoJobSchema = exports.VideoPresetFromVideoStartRequestSchema = exports.VideoPresetFromVideoStartQuerySchema = exports.VideoUserPresetListSchema = exports.VideoUserPresetSchema = exports.VideoPresetSceneSchema = exports.VideoPresetRoleSourceSchema = exports.VideoPresetRoleSchema = exports.VideoPresetMovementSchema = exports.VideoPresetTransitionSchema = exports.VideoUserPresetIdSchema = exports.VideoPresetVideoUrlSchema = exports.VIDEO_PRESET_MAX_SCENES = exports.VIDEO_PRESET_TOTAL_MAX_SECONDS = exports.VIDEO_PRESET_VIDEO_MAX_SECONDS = exports.VIDEO_PRESET_VIDEO_MAX_BYTES = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const brief_js_1 = require("./brief.cjs");
const footage_js_1 = require("./footage.cjs");
/** Largest example video the engine downloads from a URL. */
exports.VIDEO_PRESET_VIDEO_MAX_BYTES = 768 * 1024 * 1024;
/** Longest example video the engine analyzes. */
exports.VIDEO_PRESET_VIDEO_MAX_SECONDS = 1800;
/** Longest preset made from a video: the sum of its scenes. */
exports.VIDEO_PRESET_TOTAL_MAX_SECONDS = 120;
/** Scenes of one preset, at most. */
exports.VIDEO_PRESET_MAX_SCENES = 12;
/** URL of the example video: http or https only. */
exports.VideoPresetVideoUrlSchema = zod_1.z.string().max(2000).regex(/^https?:\/\/[^\s]+$/);
/** Id of a preset made by the user; distinct from `VideoPresetIdSchema` (brief.ts), which stays as is. */
exports.VideoUserPresetIdSchema = zod_1.z.string().regex(/^utente-[a-z0-9][a-z0-9-]{0,55}$/);
exports.VideoPresetTransitionSchema = zod_1.z.enum(['taglio', 'dissolvenza', 'dissolvenza-nero', 'scorrimento', 'zoom']);
exports.VideoPresetMovementSchema = zod_1.z.enum(['fissa', 'push-in', 'pull-out', 'panoramica']);
exports.VideoPresetRoleSchema = zod_1.z.enum(['gancio', 'contesto', 'info', 'prova', 'svolta', 'conclusione', 'invito', 'atmosfera']);
/** `stimato` = guessed by the analysis; `corretto` = set by the user. */
exports.VideoPresetRoleSourceSchema = zod_1.z.enum(['stimato', 'corretto']);
exports.VideoPresetSceneSchema = zod_1.z.strictObject({
    index: zod_1.z.number().int().min(0).max(exports.VIDEO_PRESET_MAX_SCENES - 1),
    durationSeconds: zod_1.z.number().min(1).max(20),
    framing: footage_js_1.VideoFootageFramingSchema,
    movement: exports.VideoPresetMovementSchema,
    transitionIn: exports.VideoPresetTransitionSchema,
    role: exports.VideoPresetRoleSchema,
    roleSource: exports.VideoPresetRoleSourceSchema,
});
const VideoPresetNameSchema = zod_1.z.string().min(1).max(80);
const VideoPresetScenesSchema = zod_1.z.array(exports.VideoPresetSceneSchema).min(1).max(exports.VIDEO_PRESET_MAX_SCENES);
const VideoPresetTimestampSchema = zod_1.z.string().datetime();
/** A preset made from an example video: a draft until the user saves it. */
exports.VideoUserPresetSchema = zod_1.z.strictObject({
    id: exports.VideoUserPresetIdSchema,
    name: VideoPresetNameSchema,
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    status: zod_1.z.enum(['bozza', 'salvato']),
    revision: zod_1.z.number().int().min(1),
    /** The existing preset that gives voice, graphics and lip-sync; `singola` by default. */
    basedOn: brief_js_1.VideoPresetIdSchema.default('singola'),
    source: zod_1.z.strictObject({
        durationSeconds: zod_1.z.number().positive().max(exports.VIDEO_PRESET_VIDEO_MAX_SECONDS),
        aspectRatio: brief_js_1.VideoAspectRatioSchema,
        sceneCount: zod_1.z.number().int().min(1).max(exports.VIDEO_PRESET_MAX_SCENES),
    }),
    scenes: VideoPresetScenesSchema,
    createdAt: VideoPresetTimestampSchema,
    updatedAt: VideoPresetTimestampSchema,
});
/** Answer of `GET /api/preset-utente`. */
exports.VideoUserPresetListSchema = zod_1.z.strictObject({ presets: zod_1.z.array(exports.VideoUserPresetSchema) });
/** Query of every preset call: the identity, as in `footage.ts`. */
exports.VideoPresetFromVideoStartQuerySchema = capability_call_identity_js_1.CapabilityAgentScopeSchema;
exports.VideoPresetFromVideoStartRequestSchema = zod_1.z.strictObject({
    url: exports.VideoPresetVideoUrlSchema,
    name: VideoPresetNameSchema,
});
exports.VideoPresetFromVideoJobSchema = zod_1.z.strictObject({
    jobId: zod_1.z.string().regex(/^[a-f0-9]{32}$/),
    status: zod_1.z.enum(['queued', 'downloading', 'analyzing', 'done', 'failed']),
    presetId: exports.VideoUserPresetIdSchema.nullable(),
    code: zod_1.z.string().nullable(),
    error: zod_1.z.string().nullable(),
});
/** The user's correction: durations, framing, transitions, movement, role. */
exports.VideoPresetSaveRequestSchema = zod_1.z.strictObject({
    revision: zod_1.z.number().int().min(1),
    name: VideoPresetNameSchema,
    basedOn: brief_js_1.VideoPresetIdSchema,
    scenes: VideoPresetScenesSchema,
});
//# sourceMappingURL=preset-da-video.js.map