"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryDecisionRequestProjectListContract = exports.internalMemoryDecisionRequestListContract = exports.internalMemoryDecisionRequestOutcomeContract = exports.internalMemoryDecisionRequestReadContract = exports.internalMemoryDecisionRequestCreateContract = exports.DecisionRequestErrorResponseSchema = exports.DecisionRequestErrorCodeSchema = exports.InternalMemoryDecisionRequestOutcomeResponseSchema = exports.InternalMemoryDecisionRequestProjectListResponseSchema = exports.InternalMemoryDecisionRequestProjectCursorSchema = exports.InternalMemoryDecisionRequestProjectListQuerySchema = exports.InternalMemoryDecisionRequestListResponseSchema = exports.InternalMemoryDecisionRequestListQuerySchema = exports.InternalMemoryDecisionRequestReadResponseSchema = exports.InternalMemoryDecisionRequestCreateResponseSchema = exports.InternalMemoryDecisionRequestQuerySchema = exports.InternalMemoryDecisionRequestParamsSchema = exports.INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH = exports.INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH = exports.INTERNAL_MEMORY_DECISION_REQUEST_PATH = exports.INTERNAL_MEMORY_DECISION_REQUESTS_PATH = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
exports.INTERNAL_MEMORY_DECISION_REQUESTS_PATH = '/internal/memory/decision-requests';
exports.INTERNAL_MEMORY_DECISION_REQUEST_PATH = '/internal/memory/decision-requests/:requestId';
exports.INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH = '/internal/memory/decision-requests/:requestId/outcome';
exports.INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH = '/internal/memory/decision-requests/by-project';
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
/**
 * List (1.66.0, stage probes T3/T7 and readers that do not know the request id): the requests opened by one agent,
 * optionally only those whose subject is one plan, newest first. Same scope rule as the read: tenant and agent.
 */
exports.InternalMemoryDecisionRequestListQuerySchema = zod_1.z.strictObject({
    tenantId: decision_request_js_1.DecisionRequestSchema.shape.tenantId,
    agentId: agent_identity_js_1.AgentIdSchema,
    planId: decision_request_js_1.DecisionRequestIdSchema.optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
});
exports.InternalMemoryDecisionRequestListResponseSchema = zod_1.z.strictObject({
    requests: zod_1.z.array(exports.InternalMemoryDecisionRequestReadResponseSchema).max(100),
});
/** agentId identifies the Director reader to authorize, never the requests' producers. */
exports.InternalMemoryDecisionRequestProjectListQuerySchema = zod_1.z.strictObject({
    tenantId: decision_request_js_1.DecisionRequestSchema.shape.tenantId,
    agentId: agent_identity_js_1.AgentIdSchema,
    organizationId: decision_request_js_1.DecisionRequestSchema.shape.organizationId,
    projectId: decision_request_js_1.DecisionRequestSchema.shape.projectId.unwrap(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    cursor: zod_1.z.string().min(1).max(2048).optional(),
});
/**
 * Decoded cursor: transported as opaque base64url-encoded JSON. The service must
 * validate the decoded value and match its tenant/organization/project against
 * the query and authenticated scope on every page; a cursor grants no access.
 * Both ordering keys are mandatory, including when several rows share a timestamp.
 */
exports.InternalMemoryDecisionRequestProjectCursorSchema = zod_1.z.strictObject({
    tenantId: exports.InternalMemoryDecisionRequestProjectListQuerySchema.shape.tenantId,
    organizationId: exports.InternalMemoryDecisionRequestProjectListQuerySchema.shape.organizationId,
    projectId: exports.InternalMemoryDecisionRequestProjectListQuerySchema.shape.projectId,
    createdAt: decision_request_js_1.DecisionRequestSchema.shape.createdAt,
    requestId: decision_request_js_1.DecisionRequestIdSchema,
});
exports.InternalMemoryDecisionRequestProjectListResponseSchema = zod_1.z.strictObject({
    requests: zod_1.z.array(exports.InternalMemoryDecisionRequestReadResponseSchema).max(100).refine((requests) => new Set(requests.map(({ request }) => request.requestId)).size === requests.length, { message: 'requestId must be unique within a page' }),
    nextCursor: zod_1.z.string().min(1).max(2048).nullable(),
});
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
/** List: 200 with the agent's requests (newest first); an unknown agent answers an empty list, never another's. */
exports.internalMemoryDecisionRequestListContract = {
    method: 'GET',
    path: exports.INTERNAL_MEMORY_DECISION_REQUESTS_PATH,
    authType: 'secret',
    querySchema: exports.InternalMemoryDecisionRequestListQuerySchema,
    responseSchema: exports.InternalMemoryDecisionRequestListResponseSchema,
};
/**
 * Project list: authorize agentId as a Director for this tenant, organization
 * and project before returning data, on every page. Return no data from other
 * scopes; query parameters and decoded cursors alone authorize nobody.
 * Include every lead's requests and every state, preserving full requests,
 * referents, outcomes and email receipts. No producer, plan or state filter.
 *
 * Stable order: createdAt DESC, requestId ASC. Continue strictly after BOTH keys:
 * createdAt < cursor.createdAt OR (createdAt = cursor.createdAt AND requestId >
 * cursor.requestId). Never use an offset. Decode and validate cursors with
 * InternalMemoryDecisionRequestProjectCursorSchema and verify their scope as
 * documented above on every page.
 *
 * The service reads limit + 1 rows (default limit: 50), returns at most limit
 * rows, and emits a cursor for the last returned row only if more rows remain.
 * Only the mandatory nextCursor: null marks completion; clients must read all
 * pages. State changes do not move rows. New requests require a new complete
 * read before assembly; an empty or partial list does not authorize assembly.
 * Authorization, database pagination and assembly checks belong to consumers.
 */
exports.internalMemoryDecisionRequestProjectListContract = {
    method: 'GET',
    path: exports.INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH,
    authType: 'secret',
    querySchema: exports.InternalMemoryDecisionRequestProjectListQuerySchema,
    responseSchema: exports.InternalMemoryDecisionRequestProjectListResponseSchema,
};
//# sourceMappingURL=internal-memory-decision-requests.js.map