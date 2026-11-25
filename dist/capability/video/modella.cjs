"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModelApproveRequestSchema = exports.VideoModelVersionCreateRequestSchema = exports.VideoModelCreateRequestSchema = exports.VideoModelRefAddQuerySchema = exports.VideoModelScopeQuerySchema = exports.VideoModelListSchema = exports.VideoModelSchema = exports.VideoModelVersionSchema = exports.VideoModelVersionStatusSchema = exports.VideoModelRefSchema = exports.VideoModelGenerationSchema = exports.VideoModelDescriptionSchema = exports.VideoModelVersionParamSchema = exports.VideoModelVersionNumberSchema = exports.VideoModelNameSchema = exports.VideoModelIdSchema = exports.VIDEO_MODEL_MAX_PER_AGENT = exports.VIDEO_MODEL_MAX_VERSIONS = exports.VIDEO_MODEL_REF_MEDIA_TYPES = exports.VIDEO_MODEL_REF_MAX_BYTES = exports.VideoModelRefKindSchema = exports.VIDEO_MODEL_REF_KINDS = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
/** The four angles of a fixed model's approved references (one per angle; the engine checks it). */
exports.VIDEO_MODEL_REF_KINDS = ['frontale', 'tre_quarti', 'profilo', 'figura_intera'];
exports.VideoModelRefKindSchema = zod_1.z.enum(exports.VIDEO_MODEL_REF_KINDS);
/** Largest reference image the engine takes. */
exports.VIDEO_MODEL_REF_MAX_BYTES = 10 * 1024 * 1024;
exports.VIDEO_MODEL_REF_MEDIA_TYPES = ['image/png', 'image/jpeg'];
exports.VIDEO_MODEL_MAX_VERSIONS = 50;
exports.VIDEO_MODEL_MAX_PER_AGENT = 200;
/** Id of a model: a slug, never a path. */
exports.VideoModelIdSchema = zod_1.z.string().regex(/^[a-z][a-z0-9-]{0,47}$/);
exports.VideoModelNameSchema = zod_1.z.string().trim().min(1).max(80);
exports.VideoModelVersionNumberSchema = zod_1.z.number().int().min(1).max(exports.VIDEO_MODEL_MAX_VERSIONS);
/** The same version number as a path piece. */
exports.VideoModelVersionParamSchema = zod_1.z.string().regex(/^[1-9][0-9]{0,1}$/);
const Sha256Schema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
const TimestampSchema = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/);
const DescriptionPartSchema = zod_1.z.string().trim().min(1).max(300);
exports.VideoModelDescriptionSchema = zod_1.z.strictObject({
    face: DescriptionPartSchema,
    body: DescriptionPartSchema,
    hair: DescriptionPartSchema,
});
/** How the images were generated. The seed helps reproducibility; it is not a guarantee of identity. */
exports.VideoModelGenerationSchema = zod_1.z.strictObject({
    model: zod_1.z.string().trim().min(1).max(120),
    seed: zod_1.z.number().int().min(0).nullable(),
    parameters: zod_1.z
        .array(zod_1.z.strictObject({ name: zod_1.z.string().regex(/^[a-z][a-z0-9_]{0,63}$/), value: zod_1.z.string().max(200) }))
        .max(20),
});
exports.VideoModelRefSchema = zod_1.z.strictObject({
    kind: exports.VideoModelRefKindSchema,
    fileName: zod_1.z.string().regex(/^[A-Za-z0-9_-]{1,100}\.(png|jpg|jpeg)$/),
    sha256: Sha256Schema,
    width: zod_1.z.number().int().min(64).max(16384),
    height: zod_1.z.number().int().min(64).max(16384),
    sizeBytes: zod_1.z.number().int().min(1).max(exports.VIDEO_MODEL_REF_MAX_BYTES),
});
exports.VideoModelVersionStatusSchema = zod_1.z.enum(['bozza', 'approvata', 'sostituita']);
exports.VideoModelVersionSchema = zod_1.z.strictObject({
    version: exports.VideoModelVersionNumberSchema,
    status: exports.VideoModelVersionStatusSchema,
    description: exports.VideoModelDescriptionSchema,
    refs: zod_1.z.array(exports.VideoModelRefSchema).max(exports.VIDEO_MODEL_REF_KINDS.length),
    generation: exports.VideoModelGenerationSchema,
    createdAt: TimestampSchema,
    approvedAt: TimestampSchema.nullable(),
    digest: Sha256Schema,
});
exports.VideoModelSchema = zod_1.z.strictObject({
    id: exports.VideoModelIdSchema,
    name: exports.VideoModelNameSchema,
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    versions: zod_1.z.array(exports.VideoModelVersionSchema).max(exports.VIDEO_MODEL_MAX_VERSIONS),
    currentVersion: exports.VideoModelVersionNumberSchema.nullable(),
    origin: zod_1.z.enum(['manuale', 'parallel']).optional(),
    parallelRef: zod_1.z.strictObject({
        communityId: zod_1.z.string().regex(/^[0-9A-Z]{26}$/),
        characterId: zod_1.z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
        version: Sha256Schema.nullable(),
    }).nullable().optional(),
});
exports.VideoModelListSchema = zod_1.z.strictObject({
    models: zod_1.z.array(exports.VideoModelSchema).max(exports.VIDEO_MODEL_MAX_PER_AGENT),
});
/** Query of the model routes: the identity only. */
exports.VideoModelScopeQuerySchema = capability_call_identity_js_1.CapabilityAgentScopeSchema;
/** Query of the reference upload: the identity and the angle; the body is the image itself. */
exports.VideoModelRefAddQuerySchema = zod_1.z.strictObject({
    ...capability_call_identity_js_1.CapabilityAgentScopeSchema.shape,
    kind: exports.VideoModelRefKindSchema,
});
exports.VideoModelCreateRequestSchema = zod_1.z.strictObject({
    name: exports.VideoModelNameSchema,
    description: exports.VideoModelDescriptionSchema,
    generation: exports.VideoModelGenerationSchema,
});
exports.VideoModelVersionCreateRequestSchema = zod_1.z.strictObject({
    description: exports.VideoModelDescriptionSchema,
    generation: exports.VideoModelGenerationSchema,
});
/** One approves the version the person has seen: its digest. */
exports.VideoModelApproveRequestSchema = zod_1.z.strictObject({ digest: Sha256Schema });
//# sourceMappingURL=modella.js.map