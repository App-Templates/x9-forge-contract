"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentTurnJobResultAckContract = exports.internalAgentTurnJobReadContract = exports.internalAgentTurnJobSubmitContract = exports.InternalAgentTurnJobResultAckResponseSchema = exports.InternalAgentTurnJobResultAckRequestSchema = exports.InternalAgentTurnJobReadResponseSchema = exports.InternalAgentTurnJobConflictResponseSchema = exports.INTERNAL_AGENT_TURN_JOB_CONFLICT = exports.InternalAgentTurnJobSubmitResponseSchema = exports.InternalAgentTurnJobSubmitRequestSchema = exports.InternalAgentTurnJobParamsSchema = exports.InternalAgentTurnJobStatusSchema = void 0;
exports.internalAgentTurnJobsPath = internalAgentTurnJobsPath;
exports.internalAgentTurnJobPath = internalAgentTurnJobPath;
exports.internalAgentTurnJobResultAckPath = internalAgentTurnJobResultAckPath;
const zod_1 = require("zod");
const response_js_1 = require("../response.cjs");
const internal_agent_turn_js_1 = require("./internal-agent-turn.cjs");
exports.InternalAgentTurnJobStatusSchema = zod_1.z.enum([
    'queued', 'running', 'uncertain', 'completed', 'failed',
]);
exports.InternalAgentTurnJobParamsSchema = internal_agent_turn_js_1.InternalAgentTurnParamsSchema.extend({
    jobId: zod_1.z.string().regex(/^[a-zA-Z0-9_-]+$/),
});
exports.InternalAgentTurnJobSubmitRequestSchema = internal_agent_turn_js_1.InternalAgentTurnRequestSchema.extend({
    idempotencyKey: zod_1.z.string().min(1).max(200),
    origin: zod_1.z.object({
        channel: zod_1.z.literal('email'),
        messageId: zod_1.z.string().min(1),
        inboxId: zod_1.z.string().min(1),
    }).optional(),
});
/** HTTP 202, including a replay of an already persisted job. */
exports.InternalAgentTurnJobSubmitResponseSchema = zod_1.z.object({
    jobId: exports.InternalAgentTurnJobParamsSchema.shape.jobId,
    status: exports.InternalAgentTurnJobStatusSchema,
    replayed: zod_1.z.boolean(),
});
exports.INTERNAL_AGENT_TURN_JOB_CONFLICT = 'INTERNAL_AGENT_TURN_JOB_CONFLICT';
/** HTTP 409 when the same scoped idempotency key carries different content. */
exports.InternalAgentTurnJobConflictResponseSchema = response_js_1.BridgeErrorResponseSchema.extend({
    code: zod_1.z.literal(exports.INTERNAL_AGENT_TURN_JOB_CONFLICT),
});
exports.InternalAgentTurnJobReadResponseSchema = zod_1.z.object({
    jobId: exports.InternalAgentTurnJobParamsSchema.shape.jobId,
    status: exports.InternalAgentTurnJobStatusSchema,
    error: zod_1.z.object({ code: zod_1.z.string().min(1), message: zod_1.z.string().min(1) }).optional(),
    result: internal_agent_turn_js_1.InternalAgentTurnResponseSchema.optional(),
    resultDigest: zod_1.z.string().min(1).optional(),
}).refine(job => job.result === undefined || job.status === 'completed', {
    message: 'A result is only valid for a completed job', path: ['result'],
}).refine(job => job.error === undefined || job.status === 'failed' || job.status === 'uncertain', {
    message: 'An error is only valid for a failed or uncertain job', path: ['error'],
});
/** Opaque digest supplied by the read response, echoed without transformation. */
exports.InternalAgentTurnJobResultAckRequestSchema = zod_1.z.object({
    resultDigest: exports.InternalAgentTurnJobReadResponseSchema.shape.resultDigest.unwrap(),
});
exports.InternalAgentTurnJobResultAckResponseSchema = zod_1.z.object({
    jobId: exports.InternalAgentTurnJobParamsSchema.shape.jobId,
    acknowledged: zod_1.z.literal(true),
});
function internalAgentTurnJobsPath(agentId) {
    const safe = internal_agent_turn_js_1.InternalAgentTurnParamsSchema.parse({ agentId });
    return `/internal/agents/${safe.agentId}/turn-jobs`;
}
function internalAgentTurnJobPath(agentId, jobId) {
    const safe = exports.InternalAgentTurnJobParamsSchema.parse({ agentId, jobId });
    return `${internalAgentTurnJobsPath(safe.agentId)}/${safe.jobId}`;
}
function internalAgentTurnJobResultAckPath(agentId, jobId) {
    return `${internalAgentTurnJobPath(agentId, jobId)}/result-ack`;
}
/**
 * HTTP 202. The service persists the turn before accepting it. Within the authenticated
 * agent scope, the same key and content return the same jobId with replayed: true;
 * different content returns HTTP 409 InternalAgentTurnJobConflictResponseSchema.
 * The service authenticates and verifies ownership before looking up the key or job.
 * This contract does not implement persistence, deduplication or turn execution.
 */
exports.internalAgentTurnJobSubmitContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/turn-jobs',
    authType: 'secret',
    paramsSchema: internal_agent_turn_js_1.InternalAgentTurnParamsSchema,
    bodySchema: exports.InternalAgentTurnJobSubmitRequestSchema,
    responseSchema: exports.InternalAgentTurnJobSubmitResponseSchema,
};
/** Reading the durable job never starts or retries a turn, including uncertain work. */
exports.internalAgentTurnJobReadContract = {
    method: 'GET',
    path: '/internal/agents/:agentId/turn-jobs/:jobId',
    authType: 'secret',
    paramsSchema: exports.InternalAgentTurnJobParamsSchema,
    responseSchema: exports.InternalAgentTurnJobReadResponseSchema,
};
/**
 * Idempotent acknowledgement after delivery. The service checks the digest against
 * the stored result; repeating the same acknowledgement returns acknowledged: true.
 * A mismatched digest must be refused without acknowledging a different result.
 */
exports.internalAgentTurnJobResultAckContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/turn-jobs/:jobId/result-ack',
    authType: 'secret',
    paramsSchema: exports.InternalAgentTurnJobParamsSchema,
    bodySchema: exports.InternalAgentTurnJobResultAckRequestSchema,
    responseSchema: exports.InternalAgentTurnJobResultAckResponseSchema,
};
//# sourceMappingURL=internal-agent-turn-jobs.js.map