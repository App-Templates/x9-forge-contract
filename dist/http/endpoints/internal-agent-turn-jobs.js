import { z } from 'zod';
import { BridgeErrorResponseSchema } from "../response.js";
import { InternalAgentTurnParamsSchema, InternalAgentTurnRequestSchema, InternalAgentTurnResponseSchema, } from "./internal-agent-turn.js";
export const InternalAgentTurnJobStatusSchema = z.enum([
    'queued', 'running', 'uncertain', 'completed', 'failed',
]);
export const InternalAgentTurnJobParamsSchema = InternalAgentTurnParamsSchema.extend({
    jobId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
});
export const InternalAgentTurnJobSubmitRequestSchema = InternalAgentTurnRequestSchema.extend({
    idempotencyKey: z.string().min(1).max(200),
    origin: z.object({
        channel: z.literal('email'),
        messageId: z.string().min(1),
        inboxId: z.string().min(1),
    }).optional(),
});
/** HTTP 202, including a replay of an already persisted job. */
export const InternalAgentTurnJobSubmitResponseSchema = z.object({
    jobId: InternalAgentTurnJobParamsSchema.shape.jobId,
    status: InternalAgentTurnJobStatusSchema,
    replayed: z.boolean(),
});
export const INTERNAL_AGENT_TURN_JOB_CONFLICT = 'INTERNAL_AGENT_TURN_JOB_CONFLICT';
/** HTTP 409 when the same scoped idempotency key carries different content. */
export const InternalAgentTurnJobConflictResponseSchema = BridgeErrorResponseSchema.extend({
    code: z.literal(INTERNAL_AGENT_TURN_JOB_CONFLICT),
});
export const InternalAgentTurnJobReadResponseSchema = z.object({
    jobId: InternalAgentTurnJobParamsSchema.shape.jobId,
    status: InternalAgentTurnJobStatusSchema,
    error: z.object({ code: z.string().min(1), message: z.string().min(1) }).optional(),
    result: InternalAgentTurnResponseSchema.optional(),
    resultDigest: z.string().min(1).optional(),
}).refine(job => job.result === undefined || job.status === 'completed', {
    message: 'A result is only valid for a completed job', path: ['result'],
}).refine(job => job.error === undefined || job.status === 'failed' || job.status === 'uncertain', {
    message: 'An error is only valid for a failed or uncertain job', path: ['error'],
});
/** Opaque digest supplied by the read response, echoed without transformation. */
export const InternalAgentTurnJobResultAckRequestSchema = z.object({
    resultDigest: InternalAgentTurnJobReadResponseSchema.shape.resultDigest.unwrap(),
});
export const InternalAgentTurnJobResultAckResponseSchema = z.object({
    jobId: InternalAgentTurnJobParamsSchema.shape.jobId,
    acknowledged: z.literal(true),
});
export function internalAgentTurnJobsPath(agentId) {
    const safe = InternalAgentTurnParamsSchema.parse({ agentId });
    return `/internal/agents/${safe.agentId}/turn-jobs`;
}
export function internalAgentTurnJobPath(agentId, jobId) {
    const safe = InternalAgentTurnJobParamsSchema.parse({ agentId, jobId });
    return `${internalAgentTurnJobsPath(safe.agentId)}/${safe.jobId}`;
}
export function internalAgentTurnJobResultAckPath(agentId, jobId) {
    return `${internalAgentTurnJobPath(agentId, jobId)}/result-ack`;
}
/**
 * HTTP 202. The service persists the turn before accepting it. Within the authenticated
 * agent scope, the same key and content return the same jobId with replayed: true;
 * different content returns HTTP 409 InternalAgentTurnJobConflictResponseSchema.
 * The service authenticates and verifies ownership before looking up the key or job.
 * This contract does not implement persistence, deduplication or turn execution.
 */
export const internalAgentTurnJobSubmitContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/turn-jobs',
    authType: 'secret',
    paramsSchema: InternalAgentTurnParamsSchema,
    bodySchema: InternalAgentTurnJobSubmitRequestSchema,
    responseSchema: InternalAgentTurnJobSubmitResponseSchema,
};
/** Reading the durable job never starts or retries a turn, including uncertain work. */
export const internalAgentTurnJobReadContract = {
    method: 'GET',
    path: '/internal/agents/:agentId/turn-jobs/:jobId',
    authType: 'secret',
    paramsSchema: InternalAgentTurnJobParamsSchema,
    responseSchema: InternalAgentTurnJobReadResponseSchema,
};
/**
 * Idempotent acknowledgement after delivery. The service checks the digest against
 * the stored result; repeating the same acknowledgement returns acknowledged: true.
 * A mismatched digest must be refused without acknowledging a different result.
 */
export const internalAgentTurnJobResultAckContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/turn-jobs/:jobId/result-ack',
    authType: 'secret',
    paramsSchema: InternalAgentTurnJobParamsSchema,
    bodySchema: InternalAgentTurnJobResultAckRequestSchema,
    responseSchema: InternalAgentTurnJobResultAckResponseSchema,
};
//# sourceMappingURL=internal-agent-turn-jobs.js.map