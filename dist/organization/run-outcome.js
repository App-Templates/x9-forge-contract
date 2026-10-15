import { z } from 'zod';
import { OrganizationRunContextSchema } from "./run-context.js";
/** Run id type, reused from the run context (single source of truth). */
const RunIdField = OrganizationRunContextSchema.shape.runId;
/** One attempt of a run: the unit that retries and idempotency refer to. */
export const RunAttemptSchema = z.strictObject({
    runId: RunIdField,
    attemptId: z.string().min(1),
    attemptNumber: z.number().int().min(1),
    startedAt: z.iso.datetime(),
    idempotencyKey: z.string().min(1),
});
/**
 * Reference to evidence. A reference never grants read access to the
 * referenced (possibly private) data: `grantsRead` is always false.
 */
export const EvidenceRefSchema = z.strictObject({
    kind: z.enum(['log', 'artifact', 'commit', 'document', 'metric']),
    ref: z.string().min(1),
    sha256: z
        .string()
        .regex(/^[0-9a-fA-F]{64}$/)
        .optional(),
    grantsRead: z.literal(false),
});
/** Consumption of one unit; an unknown amount must be flagged as estimated. */
export const ConsumptionSchema = z
    .strictObject({
    unit: z.enum(['usd_micros', 'tokens', 'seconds']),
    quantity: z.number().int().min(0),
    state: z.enum(['reserved', 'settled', 'unknown']),
    estimated: z.boolean(),
})
    .refine((c) => c.state !== 'unknown' || c.estimated === true, {
    message: "state 'unknown' requires estimated: true",
    path: ['estimated'],
});
const outcomeBase = {
    runId: RunIdField,
    attemptId: z.string().min(1),
    evidence: z.array(EvidenceRefSchema).max(50),
    consumption: z.array(ConsumptionSchema).max(10),
    recordedAt: z.iso.datetime(),
};
/** Shared status of a run outcome. */
export const RunOutcomeStatusSchema = z.enum(['succeeded', 'failed', 'cancelled', 'uncertain']);
/** Outcome of an attempt. An uncertain outcome is never reported as succeeded. */
export const RunOutcomeSchema = z.discriminatedUnion('status', [
    z.strictObject({ ...outcomeBase, status: z.literal('succeeded') }),
    z.strictObject({ ...outcomeBase, status: z.literal('failed'), failureCode: z.string().min(1) }),
    z.strictObject({ ...outcomeBase, status: z.literal('cancelled') }),
    z.strictObject({
        ...outcomeBase,
        status: z.literal('uncertain'),
        reason: z.enum(['response_lost', 'timeout', 'provider_unknown', 'worker_crashed']),
    }),
]);
//# sourceMappingURL=run-outcome.js.map