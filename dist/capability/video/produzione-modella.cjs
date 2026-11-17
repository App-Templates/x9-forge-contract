"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModelFrameApproveRequestSchema = exports.VideoModelFrameRequestSchema = exports.VideoModelProductionStateSchema = exports.VideoModelFrameStateSchema = exports.VideoModelFrameStatusSchema = exports.VideoModelSimilaritySchema = exports.VideoModelSimilarityReasonSchema = exports.VideoModelSimilarityOutcomeSchema = exports.VideoModelProductionCreatedSchema = exports.VideoModelProductionQuerySchema = exports.VIDEO_MODEL_PRODUCTION_MAX_SECONDS = exports.VIDEO_MODEL_PRODUCTION_MIN_SECONDS = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const engine_js_1 = require("./engine.cjs");
const brief_js_1 = require("./brief.cjs");
const modella_js_1 = require("./modella.cjs");
exports.VIDEO_MODEL_PRODUCTION_MIN_SECONDS = 18;
exports.VIDEO_MODEL_PRODUCTION_MAX_SECONDS = 60;
const Sha256Schema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
const TimestampSchema = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/);
/** The look is the binary body; identity and production metadata are text query values. */
exports.VideoModelProductionQuerySchema = zod_1.z.strictObject({
    ...capability_call_identity_js_1.CapabilityAgentScopeSchema.shape,
    videoProjectId: brief_js_1.VideoProjectIdSchema,
    modelId: modella_js_1.VideoModelIdSchema,
    modelVersion: modella_js_1.VideoModelVersionParamSchema,
    purpose: zod_1.z.string().trim().min(1).max(300),
    name: zod_1.z.string().trim().min(1).max(120),
    durationSeconds: zod_1.z.string().regex(/^(1[89]|[2-5][0-9]|60)$/),
    budgetUsd: zod_1.z.string().regex(/^(0\.[0-9]{1,2}|[1-9][0-9]{0,2}(\.[0-9]{1,2})?)$/),
    fileName: zod_1.z.string().regex(/^[A-Za-z0-9][A-Za-z0-9 ()._-]{0,119}\.(png|jpg|jpeg|PNG|JPG|JPEG)$/),
    lookNote: zod_1.z.string().trim().min(1).max(300).optional(),
});
exports.VideoModelProductionCreatedSchema = zod_1.z.strictObject({
    engineProjectId: zod_1.z.string().regex(/^[a-f0-9]{32}$/),
    lookSha256: Sha256Schema,
    modelDigest: Sha256Schema,
});
exports.VideoModelSimilarityOutcomeSchema = zod_1.z.enum(['ok', 'da_rivedere', 'respinto']);
exports.VideoModelSimilarityReasonSchema = zod_1.z.enum([
    'confermata', 'sotto_soglia', 'volto_non_rilevato', 'modello_non_disponibile', 'riferimenti_insufficienti',
]);
exports.VideoModelSimilaritySchema = zod_1.z.strictObject({
    outcome: exports.VideoModelSimilarityOutcomeSchema,
    reason: exports.VideoModelSimilarityReasonSchema,
    score: zod_1.z.number().min(-1).max(1).nullable(),
    threshold: zod_1.z.number().min(-1).max(1).nullable(),
});
exports.VideoModelFrameStatusSchema = zod_1.z.enum(['assente', 'in_corso', 'pronto', 'fallito']);
exports.VideoModelFrameStateSchema = zod_1.z.strictObject({
    status: exports.VideoModelFrameStatusSchema,
    frameUrl: engine_js_1.VideoEngineMediaPathSchema.nullable(),
    frameSha256: Sha256Schema.nullable(),
    similarity: exports.VideoModelSimilaritySchema.nullable(),
    approvedAt: TimestampSchema.nullable(),
    approvedBy: zod_1.z.literal('persona').nullable(),
    reviewConfirmed: zod_1.z.boolean(),
    error: zod_1.z.string().max(500).nullable(),
});
exports.VideoModelProductionStateSchema = zod_1.z.strictObject({
    modelId: modella_js_1.VideoModelIdSchema,
    modelVersion: modella_js_1.VideoModelVersionNumberSchema,
    modelDigest: Sha256Schema,
    lookSha256: Sha256Schema,
    purpose: zod_1.z.string().trim().min(1).max(300),
    regiaApplied: zod_1.z.boolean(),
    frame: exports.VideoModelFrameStateSchema,
});
exports.VideoModelFrameRequestSchema = zod_1.z.strictObject({ revision: engine_js_1.VideoEngineRevisionSchema });
/** Approval binds the person's explicit review to the exact frame shown. */
exports.VideoModelFrameApproveRequestSchema = zod_1.z.strictObject({
    revision: engine_js_1.VideoEngineRevisionSchema,
    frameSha256: Sha256Schema,
    confirmReview: zod_1.z.boolean(),
});
//# sourceMappingURL=produzione-modella.js.map