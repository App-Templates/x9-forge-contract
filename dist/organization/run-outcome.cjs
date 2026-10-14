"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunOutcomeSchema = exports.ConsumptionSchema = exports.EvidenceRefSchema = exports.RunAttemptSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
/** Run id type, reused from the run context (single source of truth). */
const RunIdField = run_context_js_1.OrganizationRunContextSchema.shape.runId;
/** One attempt of a run: the unit that retries and idempotency refer to. */
exports.RunAttemptSchema = zod_1.z.strictObject({
    runId: RunIdField,
    attemptId: zod_1.z.string().min(1),
    attemptNumber: zod_1.z.number().int().min(1),
    startedAt: zod_1.z.iso.datetime(),
    idempotencyKey: zod_1.z.string().min(1),
});
/**
 * Reference to evidence. A reference never grants read access to the
 * referenced (possibly private) data: `grantsRead` is always false.
 */
exports.EvidenceRefSchema = zod_1.z.strictObject({
    kind: zod_1.z.enum(['log', 'artifact', 'commit', 'document', 'metric']),
    ref: zod_1.z.string().min(1),
    sha256: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{64}$/)
        .optional(),
    grantsRead: zod_1.z.literal(false),
});
/** Consumption of one unit; an unknown amount must be flagged as estimated. */
exports.ConsumptionSchema = zod_1.z
    .strictObject({
    unit: zod_1.z.enum(['usd_micros', 'tokens', 'seconds']),
    quantity: zod_1.z.number().int().min(0),
    state: zod_1.z.enum(['reserved', 'settled', 'unknown']),
    estimated: zod_1.z.boolean(),
})
    .refine((c) => c.state !== 'unknown' || c.estimated === true, {
    message: "state 'unknown' requires estimated: true",
    path: ['estimated'],
});
const outcomeBase = {
    runId: RunIdField,
    attemptId: zod_1.z.string().min(1),
    evidence: zod_1.z.array(exports.EvidenceRefSchema).max(50),
    consumption: zod_1.z.array(exports.ConsumptionSchema).max(10),
    recordedAt: zod_1.z.iso.datetime(),
};
/** Outcome of an attempt. An uncertain outcome is never reported as succeeded. */
exports.RunOutcomeSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ ...outcomeBase, status: zod_1.z.literal('succeeded') }),
    zod_1.z.strictObject({ ...outcomeBase, status: zod_1.z.literal('failed'), failureCode: zod_1.z.string().min(1) }),
    zod_1.z.strictObject({ ...outcomeBase, status: zod_1.z.literal('cancelled') }),
    zod_1.z.strictObject({
        ...outcomeBase,
        status: zod_1.z.literal('uncertain'),
        reason: zod_1.z.enum(['response_lost', 'timeout', 'provider_unknown', 'worker_crashed']),
    }),
]);
//# sourceMappingURL=run-outcome.js.map