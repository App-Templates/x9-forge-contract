"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelDevProductionJobContract = exports.DevProductionCancelReceiptSchema = exports.DevProductionCancelRequestSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const production_job_js_1 = require("../../capability/dev/production-job.cjs");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
/** requestId identifies the original production request, not a new permit. */
exports.DevProductionCancelRequestSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    requestId: production_job_js_1.DevProductionJobSchema.shape.requestId,
    reason: zod_1.z.string().trim().min(1).max(500),
});
/** Acknowledges the stop request only; final state, costs and effects are separate reads. */
exports.DevProductionCancelReceiptSchema = zod_1.z.strictObject({
    jobId: production_job_js_1.DevProductionJobSchema.shape.jobId,
    requestId: production_job_js_1.DevProductionJobSchema.shape.requestId,
    status: zod_1.z.literal('stop_requested'),
    requestedAt: zod_1.z.iso.datetime(),
});
/**
 * The service authenticates the owner and compares scope, path and original requestId
 * with the persisted job. It owns idempotency and stop propagation, and must not
 * requeue uncertain work. Receipt does not mean cancellation has completed.
 * This contract neither invokes night nor consumes A11 nor authorizes new production;
 * jobId is never a native runId and the signed command v2 stop remains separate.
 */
exports.cancelDevProductionJobContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/cancel',
    authType: 'secret',
    paramsSchema: zod_1.z.strictObject({
        agentId: internal_capability_agent_js_1.CapabilityAgentParamsSchema.shape.agentId,
        jobId: production_job_js_1.DevProductionJobSchema.shape.jobId,
    }),
    bodySchema: exports.DevProductionCancelRequestSchema,
    responseSchema: exports.DevProductionCancelReceiptSchema,
};
//# sourceMappingURL=internal-dev-cancel.js.map