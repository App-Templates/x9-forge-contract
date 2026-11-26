"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoEnvironmentAngleRequestSchema = exports.VideoEnvironmentApproveRequestSchema = exports.VideoEnvironmentVersionCreateRequestSchema = exports.VideoEnvironmentCreateRequestSchema = exports.VideoEnvironmentScopeQuerySchema = exports.VideoEnvironmentListSchema = exports.VideoEnvironmentSchema = exports.VideoEnvironmentVersionSchema = exports.VideoEnvironmentVersionStatusSchema = exports.VideoEnvironmentAngleSchema = exports.VideoEnvironmentDescriptionSchema = exports.VideoEnvironmentAngleNameSchema = exports.VideoEnvironmentVersionParamSchema = exports.VideoEnvironmentVersionNumberSchema = exports.VideoEnvironmentNameSchema = exports.VideoEnvironmentKindSchema = exports.VideoEnvironmentIdSchema = exports.VIDEO_ENVIRONMENT_MAX_PER_AGENT = exports.VIDEO_ENVIRONMENT_MAX_VERSIONS = exports.VIDEO_ENVIRONMENT_MAX_ANGLES = exports.VIDEO_ENVIRONMENT_KINDS = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const engine_js_1 = require("./engine.cjs");
const modella_js_1 = require("./modella.cjs");
exports.VIDEO_ENVIRONMENT_KINDS = ['studio', 'esterno', 'documentario'];
exports.VIDEO_ENVIRONMENT_MAX_ANGLES = 10;
exports.VIDEO_ENVIRONMENT_MAX_VERSIONS = 50;
exports.VIDEO_ENVIRONMENT_MAX_PER_AGENT = 200;
exports.VideoEnvironmentIdSchema = zod_1.z.string().regex(/^[a-z][a-z0-9-]{0,47}$/);
exports.VideoEnvironmentKindSchema = zod_1.z.enum(exports.VIDEO_ENVIRONMENT_KINDS);
exports.VideoEnvironmentNameSchema = zod_1.z.string().trim().min(1).max(80);
exports.VideoEnvironmentVersionNumberSchema = zod_1.z.number().int().min(1).max(exports.VIDEO_ENVIRONMENT_MAX_VERSIONS);
/** Version number as a path segment. The engine checks the version range. */
exports.VideoEnvironmentVersionParamSchema = zod_1.z.string().regex(/^[1-9][0-9]{0,1}$/);
exports.VideoEnvironmentAngleNameSchema = zod_1.z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);
const Sha256Schema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
const TimestampSchema = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/);
const DescriptionPartSchema = zod_1.z.string().trim().min(1).max(300);
exports.VideoEnvironmentDescriptionSchema = zod_1.z.strictObject({
    room: DescriptionPartSchema,
    furniture: DescriptionPartSchema,
    light: DescriptionPartSchema,
});
exports.VideoEnvironmentAngleSchema = zod_1.z.strictObject({
    name: exports.VideoEnvironmentAngleNameSchema,
    framing: DescriptionPartSchema,
    imagePath: zod_1.z.string().regex(/^[A-Za-z0-9_-]{1,100}\.(png|jpg|jpeg)$/),
    sha256: Sha256Schema,
});
exports.VideoEnvironmentVersionStatusSchema = zod_1.z.enum(['bozza', 'approvata', 'sostituita']);
exports.VideoEnvironmentVersionSchema = zod_1.z.strictObject({
    number: exports.VideoEnvironmentVersionNumberSchema,
    status: exports.VideoEnvironmentVersionStatusSchema,
    description: exports.VideoEnvironmentDescriptionSchema,
    // Drafts can start empty; the engine requires at least one angle before approval.
    angles: zod_1.z.array(exports.VideoEnvironmentAngleSchema).max(exports.VIDEO_ENVIRONMENT_MAX_ANGLES),
    createdAt: TimestampSchema,
    approvedAt: TimestampSchema.nullable(),
    digest: Sha256Schema,
});
exports.VideoEnvironmentSchema = zod_1.z.strictObject({
    id: exports.VideoEnvironmentIdSchema,
    name: exports.VideoEnvironmentNameSchema,
    kind: exports.VideoEnvironmentKindSchema,
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    versions: zod_1.z.array(exports.VideoEnvironmentVersionSchema).max(exports.VIDEO_ENVIRONMENT_MAX_VERSIONS),
    currentVersion: exports.VideoEnvironmentVersionNumberSchema.nullable(),
});
exports.VideoEnvironmentListSchema = zod_1.z.strictObject({
    environments: zod_1.z.array(exports.VideoEnvironmentSchema).max(exports.VIDEO_ENVIRONMENT_MAX_PER_AGENT),
});
/** Identity belongs in the query, never in an angle generation body. */
exports.VideoEnvironmentScopeQuerySchema = capability_call_identity_js_1.CapabilityAgentScopeSchema;
exports.VideoEnvironmentCreateRequestSchema = zod_1.z.strictObject({
    name: exports.VideoEnvironmentNameSchema,
    kind: exports.VideoEnvironmentKindSchema,
    description: exports.VideoEnvironmentDescriptionSchema,
});
exports.VideoEnvironmentVersionCreateRequestSchema = zod_1.z.strictObject({
    description: exports.VideoEnvironmentDescriptionSchema,
});
exports.VideoEnvironmentApproveRequestSchema = zod_1.z.strictObject({ digest: Sha256Schema });
/** The project owns the frame-step cost; a null model generates an empty background. */
exports.VideoEnvironmentAngleRequestSchema = zod_1.z.strictObject({
    projectId: engine_js_1.VideoEngineIdSchema,
    name: exports.VideoEnvironmentAngleNameSchema,
    framing: DescriptionPartSchema,
    modelId: modella_js_1.VideoModelIdSchema.nullable(),
    maxCostUsd: zod_1.z.number().positive().finite(),
});
//# sourceMappingURL=ambiente.js.map