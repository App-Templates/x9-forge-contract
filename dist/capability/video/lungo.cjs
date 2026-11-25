"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLongProjectListSchema = exports.VideoLongProjectSchema = exports.VideoLongCreateRequestSchema = exports.VideoLongScopeQuerySchema = exports.VideoLongStepStateSchema = exports.VideoLongStepStatusSchema = exports.VideoLongStepSchema = exports.VideoLongFamilySchema = exports.VideoLongProjectIdSchema = exports.VIDEO_LONG_MAX_CHAPTERS = exports.VIDEO_LONG_MAX_SECONDS = exports.VIDEO_LONG_MIN_SECONDS = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const brief_js_1 = require("./brief.cjs");
const engine_js_1 = require("./engine.cjs");
const modella_js_1 = require("./modella.cjs");
exports.VIDEO_LONG_MIN_SECONDS = 120;
exports.VIDEO_LONG_MAX_SECONDS = 1200;
exports.VIDEO_LONG_MAX_CHAPTERS = 24;
exports.VideoLongProjectIdSchema = engine_js_1.VideoEngineIdSchema;
exports.VideoLongFamilySchema = zod_1.z.enum(['essay', 'podcast', 'brand', 'microdrama']);
exports.VideoLongStepSchema = zod_1.z.enum(['bozza', 'ricerca', 'capitoli', 'fotogrammi', 'video']);
exports.VideoLongStepStatusSchema = zod_1.z.enum(['da-fare', 'in-corso', 'da-approvare', 'approvato', 'fallito']);
exports.VideoLongStepStateSchema = zod_1.z.strictObject({
    step: exports.VideoLongStepSchema,
    status: exports.VideoLongStepStatusSchema,
});
/** Query identity shared by all long-project calls. */
exports.VideoLongScopeQuerySchema = capability_call_identity_js_1.CapabilityAgentScopeSchema;
const projectFields = {
    name: zod_1.z.string().min(1).max(200),
    family: exports.VideoLongFamilySchema,
    presetId: brief_js_1.VideoPresetIdSchema,
    aspectRatio: brief_js_1.VideoAspectRatioSchema,
    durationSeconds: zod_1.z.number().int().min(exports.VIDEO_LONG_MIN_SECONDS).max(exports.VIDEO_LONG_MAX_SECONDS),
    modelId: modella_js_1.VideoModelIdSchema.nullable(),
    brief: zod_1.z.string().min(1).max(6000),
    budgetUsd: zod_1.z.number().positive().finite(),
};
exports.VideoLongCreateRequestSchema = zod_1.z.strictObject({
    requestedBy: zod_1.z.string().min(1).max(256),
    ...projectFields,
});
/** The engine checks cross-field consistency, including step order and uniqueness. */
exports.VideoLongProjectSchema = zod_1.z.strictObject({
    id: exports.VideoLongProjectIdSchema,
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    ...projectFields,
    steps: zod_1.z.array(exports.VideoLongStepStateSchema).min(5).max(5),
    createdAt: zod_1.z.string().min(1).max(40),
});
exports.VideoLongProjectListSchema = zod_1.z.strictObject({
    projects: zod_1.z.array(exports.VideoLongProjectSchema).max(200),
});
//# sourceMappingURL=lungo.js.map