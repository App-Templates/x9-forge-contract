"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevProductionResultSchema = exports.DevProductionArtifactSchema = void 0;
exports.isDevProductionResultForJob = isDevProductionResultForJob;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const production_job_js_1 = require("./production-job.cjs");
const JobShape = production_job_js_1.DevProductionJobSchema.shape;
/** Opaque authorized references, never machine paths or signed download URLs. */
exports.DevProductionArtifactSchema = zod_1.z.strictObject({
    artifactRef: zod_1.z.string().min(1),
    mediaType: zod_1.z.string().min(1),
    bytes: zod_1.z.number().int().positive().finite(),
    sha256: JobShape.reportDigest,
    // Suggested download metadata only; artifactRef remains the storage authority.
    fileName: zod_1.z.string().trim().min(1).max(180)
        .refine((name) => !name.includes('/'), { message: 'File name must not contain slash' })
        .refine((name) => !name.includes('\\'), { message: 'File name must not contain backslash' })
        .refine((name) => !name.includes(':'), { message: 'File name must not contain colon' })
        .refine((name) => !/\p{Cc}/u.test(name), { message: 'File name must not contain controls' })
        .refine((name) => name !== '.', { message: 'File name must not be dot' })
        .refine((name) => name !== '..', { message: 'File name must not be dot-dot' })
        .optional(),
    displayName: zod_1.z.string().trim().min(1).max(160).optional(),
});
const TestsVerificationSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('tests'),
    passed: zod_1.z.number().int().positive(),
    total: zod_1.z.number().int().positive(),
}).refine((proof) => proof.passed === proof.total, { message: 'All tests must pass', path: ['passed'] });
const VisualVerificationSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('visual_review'),
    previewRef: zod_1.z.string().min(1),
    reviewRef: zod_1.z.string().min(1),
    ownerAcceptanceRef: zod_1.z.string().min(1),
});
const ResultBaseSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    jobId: JobShape.jobId,
    requestId: JobShape.requestId,
    projectId: JobShape.projectId,
    sessionId: JobShape.session.shape.sessionId,
    productKind: production_job_js_1.DevProductionKindSchema,
    reportVersion: JobShape.reportVersion,
    reportDigest: JobShape.reportDigest,
    finishedAt: zod_1.z.iso.datetime(),
});
/** References identify evidence; the service must verify the corresponding authorized records. */
exports.DevProductionResultSchema = zod_1.z.discriminatedUnion('status', [
    ResultBaseSchema.extend({
        status: zod_1.z.literal('succeeded'),
        artifacts: zod_1.z.array(exports.DevProductionArtifactSchema).min(1),
        delivery: zod_1.z.strictObject({
            summary: zod_1.z.string().trim().min(1).max(1000),
            instructions: zod_1.z.string().min(1).max(8000)
                .refine((text) => /\S/u.test(text), { message: 'Instructions must contain non-whitespace text' }),
            primaryArtifactRef: exports.DevProductionArtifactSchema.shape.artifactRef,
        }).optional(),
        verification: zod_1.z.discriminatedUnion('kind', [TestsVerificationSchema, VisualVerificationSchema]),
    }).superRefine((result, ctx) => {
        if (result.delivery && result.artifacts.filter((artifact) => artifact.artifactRef === result.delivery?.primaryArtifactRef).length !== 1) {
            ctx.addIssue({ code: 'custom', path: ['delivery', 'primaryArtifactRef'], message: 'Primary artifact must identify exactly one artifact' });
        }
        const expected = result.productKind === 'code' || result.productKind === 'automation' ? 'tests' : 'visual_review';
        if (result.verification.kind !== expected) {
            ctx.addIssue({ code: 'custom', path: ['verification', 'kind'], message: 'Evidence must match product kind' });
        }
    }),
    ResultBaseSchema.extend({
        // Uncertainty is terminal here: it never authorizes an automatic retry.
        status: zod_1.z.enum(['failed', 'blocked', 'cancelled', 'uncertain']),
        reason: zod_1.z.string().min(1).max(1000),
    }),
]);
/** Correlation only: this does not attest execution, evidence records or permission to retry. */
function isDevProductionResultForJob(raw, expectedJob) {
    const parsedResult = exports.DevProductionResultSchema.safeParse(raw);
    const parsedJob = production_job_js_1.DevProductionJobSchema.safeParse(expectedJob);
    if (!parsedResult.success || !parsedJob.success)
        return false;
    const result = parsedResult.data;
    const job = parsedJob.data;
    return (0, capability_call_context_js_1.sameCapabilityScope)(result.scope, job.scope)
        && result.jobId === job.jobId
        && result.requestId === job.requestId
        && result.projectId === job.projectId
        && result.sessionId === job.session.sessionId
        && result.productKind === job.productKind
        && result.reportVersion === job.reportVersion
        && result.reportDigest === job.reportDigest;
}
//# sourceMappingURL=production-result.js.map