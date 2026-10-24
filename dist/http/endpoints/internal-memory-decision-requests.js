import { z } from 'zod';
import { AgentIdSchema } from "../../agent/agent-identity.js";
import { DecisionOutcomeSchema, DecisionRequestIdSchema, DecisionRequestSchema, } from "../../organization/decision-request.js";
export const INTERNAL_MEMORY_DECISION_REQUESTS_PATH = '/internal/memory/decision-requests';
export const INTERNAL_MEMORY_DECISION_REQUEST_PATH = '/internal/memory/decision-requests/:requestId';
export const INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH = '/internal/memory/decision-requests/:requestId/outcome';
export const InternalMemoryDecisionRequestParamsSchema = z.strictObject({
    requestId: DecisionRequestIdSchema,
});
export const InternalMemoryDecisionRequestQuerySchema = z.strictObject({
    tenantId: DecisionRequestSchema.shape.tenantId,
    agentId: AgentIdSchema,
});
export const InternalMemoryDecisionRequestCreateResponseSchema = z.strictObject({
    requestId: DecisionRequestIdSchema,
    state: z.literal('open'),
});
export const InternalMemoryDecisionRequestReadResponseSchema = z.discriminatedUnion('state', [
    z.strictObject({ request: DecisionRequestSchema, state: z.literal('open'), outcome: z.null() }),
    z.strictObject({ request: DecisionRequestSchema, state: z.literal('decided'), outcome: DecisionOutcomeSchema }),
]);
/**
 * List (1.66.0, stage probes T3/T7 and readers that do not know the request id): the requests opened by one agent,
 * optionally only those whose subject is one plan, newest first. Same scope rule as the read: tenant and agent.
 */
export const InternalMemoryDecisionRequestListQuerySchema = z.strictObject({
    tenantId: DecisionRequestSchema.shape.tenantId,
    agentId: AgentIdSchema,
    planId: DecisionRequestIdSchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
});
export const InternalMemoryDecisionRequestListResponseSchema = z.strictObject({
    requests: z.array(InternalMemoryDecisionRequestReadResponseSchema).max(100),
});
export const InternalMemoryDecisionRequestOutcomeResponseSchema = z.strictObject({
    result: z.enum(['recorded', 'duplicate']),
});
export const DecisionRequestErrorCodeSchema = z.enum([
    'decision_request_conflict',
    'decision_request_not_found',
    'decision_already_taken',
]);
export const DecisionRequestErrorResponseSchema = z.strictObject({
    code: DecisionRequestErrorCodeSchema,
    message: z.string().min(1),
});
/**
 * Create: 201 for a new request, 200 for an identical replay (same receipt),
 * 409 decision_request_conflict for the same ID with different content.
 */
export const internalMemoryDecisionRequestCreateContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_DECISION_REQUESTS_PATH,
    authType: 'secret',
    bodySchema: DecisionRequestSchema,
    responseSchema: InternalMemoryDecisionRequestCreateResponseSchema,
};
/**
 * Read: 200 with the current state; 404 decision_request_not_found for a missing
 * request or a different tenant/agent. The service must check the authenticated
 * scope before returning data; query parameters alone authorize nobody.
 */
export const internalMemoryDecisionRequestReadContract = {
    method: 'GET',
    path: INTERNAL_MEMORY_DECISION_REQUEST_PATH,
    authType: 'secret',
    paramsSchema: InternalMemoryDecisionRequestParamsSchema,
    querySchema: InternalMemoryDecisionRequestQuerySchema,
    responseSchema: InternalMemoryDecisionRequestReadResponseSchema,
};
/**
 * Outcome: 200 recorded or duplicate for an identical replay; 409
 * decision_already_taken for a different outcome on an already decided request.
 * The service must correlate body.requestId with params.requestId and validate
 * the authenticated scope and owner against the stored request before writing.
 */
export const internalMemoryDecisionRequestOutcomeContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH,
    authType: 'secret',
    paramsSchema: InternalMemoryDecisionRequestParamsSchema,
    bodySchema: DecisionOutcomeSchema,
    responseSchema: InternalMemoryDecisionRequestOutcomeResponseSchema,
};
/** List: 200 with the agent's requests (newest first); an unknown agent answers an empty list, never another's. */
export const internalMemoryDecisionRequestListContract = {
    method: 'GET',
    path: INTERNAL_MEMORY_DECISION_REQUESTS_PATH,
    authType: 'secret',
    querySchema: InternalMemoryDecisionRequestListQuerySchema,
    responseSchema: InternalMemoryDecisionRequestListResponseSchema,
};
//# sourceMappingURL=internal-memory-decision-requests.js.map