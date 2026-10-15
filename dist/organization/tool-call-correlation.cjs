"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCallReceiptSchema = exports.OrganizationToolCallContextSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
const run_outcome_js_1 = require("./run-outcome.cjs");
/**
 * Admitted context of one capability tool call: the trusted run context, the
 * attempt the call belongs to and the tenant. The attempt must be of the same run.
 */
exports.OrganizationToolCallContextSchema = zod_1.z
    .strictObject({
    organizationRun: run_context_js_1.OrganizationRunContextSchema,
    attempt: run_outcome_js_1.RunAttemptSchema,
    tenantId: zod_1.z.string().min(1),
})
    .refine((ctx) => ctx.attempt.runId === ctx.organizationRun.runId, {
    message: 'attempt.runId must match organizationRun.runId',
    path: ['attempt', 'runId'],
});
/**
 * Receipt of a single tool call (callId is distinct from attemptId). An uncertain
 * call is never reported as succeeded; a failed call carries its failureCode.
 */
exports.ToolCallReceiptSchema = zod_1.z
    .strictObject({
    runId: run_context_js_1.RunIdSchema,
    attemptId: zod_1.z.string().min(1),
    callId: zod_1.z.string().min(1),
    status: zod_1.z.enum(['succeeded', 'failed', 'uncertain']),
    consumption: zod_1.z.array(run_outcome_js_1.ConsumptionSchema).max(10),
    evidence: zod_1.z.array(run_outcome_js_1.EvidenceRefSchema).max(50),
    failureCode: zod_1.z.string().min(1).optional(),
    recordedAt: zod_1.z.iso.datetime(),
})
    .refine((r) => r.status !== 'failed' || r.failureCode !== undefined, {
    message: "status 'failed' requires failureCode",
    path: ['failureCode'],
});
//# sourceMappingURL=tool-call-correlation.js.map