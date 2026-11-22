"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoOutfitProductionCreatedSchema = exports.VideoOutfitProductionQuerySchema = exports.VideoOutfitResolutionSchema = exports.VideoOutfitModelSchema = exports.VIDEO_OUTFIT_MEDIA_TYPES = exports.VIDEO_OUTFIT_MAX_BYTES = exports.VIDEO_OUTFIT_MAX_SECONDS = exports.VIDEO_OUTFIT_MIN_SECONDS = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const brief_js_1 = require("./brief.cjs");
exports.VIDEO_OUTFIT_MIN_SECONDS = 3;
exports.VIDEO_OUTFIT_MAX_SECONDS = 15;
exports.VIDEO_OUTFIT_MAX_BYTES = 64 * 1024 * 1024;
exports.VIDEO_OUTFIT_MEDIA_TYPES = ['video/mp4', 'video/quicktime'];
/** Same names as the engine's `outfit_adapter.OUTFIT_MODELS`. */
exports.VideoOutfitModelSchema = zod_1.z.enum(['kling-4-edit', 'happy-horse', 'kling-o1-edit']);
exports.VideoOutfitResolutionSchema = zod_1.z.enum(['720p', '1080p']);
/** The person's own video is the binary body; identity and production metadata are text query values. */
exports.VideoOutfitProductionQuerySchema = zod_1.z.strictObject({
    ...capability_call_identity_js_1.CapabilityAgentScopeSchema.shape,
    videoProjectId: brief_js_1.VideoProjectIdSchema,
    name: zod_1.z.string().trim().min(1).max(120),
    description: zod_1.z.string().trim().min(1).max(500).optional(),
    model: exports.VideoOutfitModelSchema,
    resolution: exports.VideoOutfitResolutionSchema,
    budgetUsd: zod_1.z.string().regex(/^(0\.[0-9]{1,2}|[1-9][0-9]{0,2}(\.[0-9]{1,2})?)$/),
    fileName: zod_1.z.string().regex(/^[A-Za-z0-9][A-Za-z0-9 ()._-]{0,119}\.([mM][pP]4|[mM][oO][vV])$/),
});
exports.VideoOutfitProductionCreatedSchema = zod_1.z.strictObject({
    engineProjectId: zod_1.z.string().regex(/^[a-f0-9]{32}$/),
    sourceSha256: zod_1.z.string().regex(/^[0-9a-f]{64}$/),
    durationSeconds: zod_1.z.number().min(exports.VIDEO_OUTFIT_MIN_SECONDS).max(exports.VIDEO_OUTFIT_MAX_SECONDS),
});
//# sourceMappingURL=abito.js.map