import { z } from 'zod';
import { OrganizationRunContextSchema, RunIdSchema } from "./run-context.js";
import { ConsumptionSchema, EvidenceRefSchema, RunAttemptSchema } from "./run-outcome.js";
/**
 * Admitted context of one capability tool call: the trusted run context, the
 * attempt the call belongs to and the tenant. The attempt must be of the same run.
 */
export const OrganizationToolCallContextSchema = z
    .strictObject({
    organizationRun: OrganizationRunContextSchema,
    attempt: RunAttemptSchema,
    tenantId: z.string().min(1),
})
    .refine((ctx) => ctx.attempt.runId === ctx.organizationRun.runId, {
    message: 'attempt.runId must match organizationRun.runId',
    path: ['attempt', 'runId'],
});
/**
 * Receipt of a single tool call (callId is distinct from attemptId). An uncertain
 * call is never reported as succeeded; a failed call carries its failureCode.
 */
export const ToolCallReceiptSchema = z
    .strictObject({
    runId: RunIdSchema,
    attemptId: z.string().min(1),
    callId: z.string().min(1),
    status: z.enum(['succeeded', 'failed', 'uncertain']),
    consumption: z.array(ConsumptionSchema).max(10),
    evidence: z.array(EvidenceRefSchema).max(50),
    failureCode: z.string().min(1).optional(),
    recordedAt: z.iso.datetime(),
})
    .refine((r) => r.status !== 'failed' || r.failureCode !== undefined, {
    message: "status 'failed' requires failureCode",
    path: ['failureCode'],
});
//# sourceMappingURL=tool-call-correlation.js.map