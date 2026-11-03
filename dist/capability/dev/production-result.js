import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../capability-call-context.js";
import { DevProductionJobSchema, DevProductionKindSchema } from "./production-job.js";
const JobShape = DevProductionJobSchema.shape;
/** Opaque authorized references, never machine paths or signed download URLs. */
export const DevProductionArtifactSchema = z.strictObject({
    artifactRef: z.string().min(1),
    mediaType: z.string().min(1),
    bytes: z.number().int().positive().finite(),
    sha256: JobShape.reportDigest,
    // Suggested download metadata only; artifactRef remains the storage authority.
    fileName: z.string().trim().min(1).max(180)
        .refine((name) => !name.includes('/'), { message: 'File name must not contain slash' })
        .refine((name) => !name.includes('\\'), { message: 'File name must not contain backslash' })
        .refine((name) => !name.includes(':'), { message: 'File name must not contain colon' })
        .refine((name) => !/\p{Cc}/u.test(name), { message: 'File name must not contain controls' })
        .refine((name) => name !== '.', { message: 'File name must not be dot' })
        .refine((name) => name !== '..', { message: 'File name must not be dot-dot' })
        .optional(),
    displayName: z.string().trim().min(1).max(160).optional(),
});
const TestsVerificationSchema = z.strictObject({
    kind: z.literal('tests'),
    passed: z.number().int().positive(),
    total: z.number().int().positive(),
}).refine((proof) => proof.passed === proof.total, { message: 'All tests must pass', path: ['passed'] });
const VisualVerificationSchema = z.strictObject({
    kind: z.literal('visual_review'),
    previewRef: z.string().min(1),
    reviewRef: z.string().min(1),
    ownerAcceptanceRef: z.string().min(1),
});
const ResultBaseSchema = z.strictObject({
    scope: CapabilityAgentScopeSchema,
    jobId: JobShape.jobId,
    requestId: JobShape.requestId,
    projectId: JobShape.projectId,
    sessionId: JobShape.session.shape.sessionId,
    productKind: DevProductionKindSchema,
    reportVersion: JobShape.reportVersion,
    reportDigest: JobShape.reportDigest,
    finishedAt: z.iso.datetime(),
});
/** References identify evidence; the service must verify the corresponding authorized records. */
export const DevProductionResultSchema = z.discriminatedUnion('status', [
    ResultBaseSchema.extend({
        status: z.literal('succeeded'),
        artifacts: z.array(DevProductionArtifactSchema).min(1),
        delivery: z.strictObject({
            summary: z.string().trim().min(1).max(1000),
            instructions: z.string().min(1).max(8000)
                .refine((text) => /\S/u.test(text), { message: 'Instructions must contain non-whitespace text' }),
            primaryArtifactRef: DevProductionArtifactSchema.shape.artifactRef,
        }).optional(),
        verification: z.discriminatedUnion('kind', [TestsVerificationSchema, VisualVerificationSchema]),
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
        status: z.enum(['failed', 'blocked', 'cancelled', 'uncertain']),
        reason: z.string().min(1).max(1000),
    }),
]);
/** Correlation only: this does not attest execution, evidence records or permission to retry. */
export function isDevProductionResultForJob(raw, expectedJob) {
    const parsedResult = DevProductionResultSchema.safeParse(raw);
    const parsedJob = DevProductionJobSchema.safeParse(expectedJob);
    if (!parsedResult.success || !parsedJob.success)
        return false;
    const result = parsedResult.data;
    const job = parsedJob.data;
    return sameCapabilityScope(result.scope, job.scope)
        && result.jobId === job.jobId
        && result.requestId === job.requestId
        && result.projectId === job.projectId
        && result.sessionId === job.session.sessionId
        && result.productKind === job.productKind
        && result.reportVersion === job.reportVersion
        && result.reportDigest === job.reportDigest;
}
//# sourceMappingURL=production-result.js.map