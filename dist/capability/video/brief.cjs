"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoBriefResponseSchema = exports.VideoProjectStateSchema = exports.VideoProjectIdSchema = exports.VideoBriefRequestSchema = exports.VideoRequestChoicesSchema = exports.VideoDurationSecondsSchema = exports.VIDEO_DURATION_SECONDS_MAX = exports.VIDEO_DURATION_SECONDS_MIN = exports.VideoVoiceIdSchema = exports.VideoResolutionSchema = exports.VideoAspectRatioSchema = exports.VideoPresetIdSchema = exports.VideoModeSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const footage_js_1 = require("./footage.cjs");
exports.VideoModeSchema = zod_1.z.enum(['approval', 'autonomous']);
exports.VideoPresetIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
exports.VideoAspectRatioSchema = zod_1.z.enum(['9:16', '16:9', '1:1']);
exports.VideoResolutionSchema = zod_1.z.enum(['480p', '720p', '1080p']);
/** Id of a voice of the preset catalogue (e.g. `stefano-pro`, `marco`), never the provider's id. */
exports.VideoVoiceIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
exports.VIDEO_DURATION_SECONDS_MIN = 5;
exports.VIDEO_DURATION_SECONDS_MAX = 180;
exports.VideoDurationSecondsSchema = zod_1.z
    .number()
    .int()
    .min(exports.VIDEO_DURATION_SECONDS_MIN)
    .max(exports.VIDEO_DURATION_SECONDS_MAX);
/** The choices of one request, already resolved with the preset (null: the preset has no such choice). */
exports.VideoRequestChoicesSchema = zod_1.z.strictObject({
    voice: exports.VideoVoiceIdSchema.nullable(),
    aspectRatio: exports.VideoAspectRatioSchema,
    durationSeconds: exports.VideoDurationSecondsSchema,
    resolution: exports.VideoResolutionSchema.nullable(),
});
exports.VideoBriefRequestSchema = zod_1.z.object({
    identity: capability_call_context_js_1.CapabilityAgentScopeSchema,
    requestedBy: zod_1.z.string().min(1).max(256),
    approverEmail: zod_1.z.email(),
    presetId: exports.VideoPresetIdSchema,
    mode: exports.VideoModeSchema,
    budgetUsd: zod_1.z.number().positive().finite(),
    brief: zod_1.z.string().min(1).max(6000),
    externalRef: zod_1.z.string().max(256).optional(),
    /** The shot(s) of the archive the person chose (1-2 ids of the same place); absent: the regia chooses. */
    footage: footage_js_1.VideoFootageChoiceSchema.optional(),
    /** Per-request choices within the preset's limits; absent: the preset's defaults. */
    voice: exports.VideoVoiceIdSchema.optional(),
    aspectRatio: exports.VideoAspectRatioSchema.optional(),
    durationSeconds: exports.VideoDurationSecondsSchema.optional(),
    resolution: exports.VideoResolutionSchema.optional(),
}).strict();
exports.VideoProjectIdSchema = zod_1.z.string().min(1).max(100);
exports.VideoProjectStateSchema = zod_1.z.enum([
    'created', 'planning', 'awaiting_approval', 'producing', 'delivered', 'failed',
]);
exports.VideoBriefResponseSchema = zod_1.z.object({
    projectId: exports.VideoProjectIdSchema,
    state: exports.VideoProjectStateSchema,
    identity: capability_call_context_js_1.CapabilityAgentScopeSchema,
    presetId: exports.VideoPresetIdSchema,
    mode: exports.VideoModeSchema,
    budgetUsd: zod_1.z.number().positive().finite(),
}).strict();
//# sourceMappingURL=brief.js.map