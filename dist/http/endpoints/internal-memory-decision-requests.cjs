"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryDecisionRequestOutcomeContract = exports.internalMemoryDecisionRequestReadContract = exports.internalMemoryDecisionRequestCreateContract = exports.DecisionRequestErrorResponseSchema = exports.DecisionRequestErrorCodeSchema = exports.InternalMemoryDecisionRequestOutcomeResponseSchema = exports.InternalMemoryDecisionRequestReadResponseSchema = exports.InternalMemoryDecisionRequestCreateResponseSchema = exports.InternalMemoryDecisionRequestQuerySchema = exports.InternalMemoryDecisionRequestParamsSchema = exports.INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH = exports.INTERNAL_MEMORY_DECISION_REQUEST_PATH = exports.INTERNAL_MEMORY_DECISION_REQUESTS_PATH = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
exports.INTERNAL_MEMORY_DECISION_REQUESTS_PATH = '/internal/memory/decision-requests';
exports.INTERNAL_MEMORY_DECISION_REQUEST_PATH = '/internal/memory/decision-requests/:requestId';
exports.INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH = '/internal/memory/decision-requests/:requestId/outcome';
exports.InternalMemoryDecisionRequestParamsSchema = zod_1.z.strictObject({
    requestId: decision_request_js_1.DecisionRequestIdSchema,
});
exports.InternalMemoryDecisionRequestQuerySchema = zod_1.z.strictObject({
    tenantId: decision_request_js_1.DecisionRequestSchema.shape.tenantId,
    agentId: agent_identity_js_1.AgentIdSchema,
});
exports.InternalMemoryDecisionRequestCreateResponseSchema = zod_1.z.strictObject({
    requestId: decision_request_js_1.DecisionRequestIdSchema,
    state: zod_1.z.literal('open'),
});
exports.InternalMemoryDecisionRequestReadResponseSchema = zod_1.z.discriminatedUnion('state', [
    zod_1.z.strictObject({ request: decision_request_js_1.DecisionRequestSchema, state: zod_1.z.literal('open'), outcome: zod_1.z.null() }),
    zod_1.z.strictObject({ request: decision_request_js_1.DecisionRequestSchema, state: zod_1.z.literal('decided'), outcome: decision_request_js_1.DecisionOutcomeSchema }),
]);
exports.InternalMemoryDecisionRequestOutcomeResponseSchema = zod_1.z.strictObject({
    result: zod_1.z.enum(['recorded', 'duplicate']),
});
exports.DecisionRequestErrorCodeSchema = zod_1.z.enum([
    'decision_request_conflict',
    'decision_request_not_found',
    'decision_already_taken',
]);
exports.DecisionRequestErrorResponseSchema = zod_1.z.strictObject({
    code: exports.DecisionRequestErrorCodeSchema,
    message: zod_1.z.string().min(1),
});
/**
 * Create: 201 for a new request, 200 for an identical replay (same receipt),
 * 409 decision_request_conflict for the same ID with different content.
 */
exports.internalMemoryDecisionRequestCreateContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_DECISION_REQUESTS_PATH,
    authType: 'secret',
    bodySchema: decision_request_js_1.DecisionRequestSchema,
    responseSchema: exports.InternalMemoryDecisionRequestCreateResponseSchema,
};
/**
 * Read: 200 with the current state; 404 decision_request_not_found for a missing
 * request or a different tenant/agent. The service must check the authenticated
 * scope before returning data; query parameters alone authorize nobody.
 */
exports.internalMemoryDecisionRequestReadContract = {
    method: 'GET',
    path: exports.INTERNAL_MEMORY_DECISION_REQUEST_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalMemoryDecisionRequestParamsSchema,
    querySchema: exports.InternalMemoryDecisionRequestQuerySchema,
    responseSchema: exports.InternalMemoryDecisionRequestReadResponseSchema,
};
/**
 * Outcome: 200 recorded or duplicate for an identical replay; 409
 * decision_already_taken for a different outcome on an already decided request.
 * The service must correlate body.requestId with params.requestId and validate
 * the authenticated scope and owner against the stored request before writing.
 */
exports.internalMemoryDecisionRequestOutcomeContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH,
    authType: 'secret',
    paramsSchema: exports.InternalMemoryDecisionRequestParamsSchema,
    bodySchema: decision_request_js_1.DecisionOutcomeSchema,
    responseSchema: exports.InternalMemoryDecisionRequestOutcomeResponseSchema,
};
//# sourceMappingURL=internal-memory-decision-requests.js.map