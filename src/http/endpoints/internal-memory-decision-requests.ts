import { z } from 'zod';
import { AgentIdSchema } from '../../agent/agent-identity.js';
import {
  DecisionOutcomeSchema,
  DecisionRequestIdSchema,
  DecisionRequestSchema,
} from '../../organization/decision-request.js';

export const INTERNAL_MEMORY_DECISION_REQUESTS_PATH = '/internal/memory/decision-requests' as const;
export const INTERNAL_MEMORY_DECISION_REQUEST_PATH = '/internal/memory/decision-requests/:requestId' as const;
export const INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH = '/internal/memory/decision-requests/:requestId/outcome' as const;
export const INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH = '/internal/memory/decision-requests/by-project' as const;

export const InternalMemoryDecisionRequestParamsSchema = z.strictObject({
  requestId: DecisionRequestIdSchema,
});
export type InternalMemoryDecisionRequestParams = z.infer<typeof InternalMemoryDecisionRequestParamsSchema>;

export const InternalMemoryDecisionRequestQuerySchema = z.strictObject({
  tenantId: DecisionRequestSchema.shape.tenantId,
  agentId: AgentIdSchema,
});
export type InternalMemoryDecisionRequestQuery = z.infer<typeof InternalMemoryDecisionRequestQuerySchema>;

export const InternalMemoryDecisionRequestCreateResponseSchema = z.strictObject({
  requestId: DecisionRequestIdSchema,
  state: z.literal('open'),
});
export type InternalMemoryDecisionRequestCreateResponse = z.infer<typeof InternalMemoryDecisionRequestCreateResponseSchema>;

export const InternalMemoryDecisionRequestReadResponseSchema = z.discriminatedUnion('state', [
  z.strictObject({ request: DecisionRequestSchema, state: z.literal('open'), outcome: z.null() }),
  z.strictObject({ request: DecisionRequestSchema, state: z.literal('decided'), outcome: DecisionOutcomeSchema }),
]);
export type InternalMemoryDecisionRequestReadResponse = z.infer<typeof InternalMemoryDecisionRequestReadResponseSchema>;

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
export type InternalMemoryDecisionRequestListQuery = z.infer<typeof InternalMemoryDecisionRequestListQuerySchema>;

export const InternalMemoryDecisionRequestListResponseSchema = z.strictObject({
  requests: z.array(InternalMemoryDecisionRequestReadResponseSchema).max(100),
});
export type InternalMemoryDecisionRequestListResponse = z.infer<typeof InternalMemoryDecisionRequestListResponseSchema>;

/** agentId identifies the Director reader to authorize, never the requests' producers. */
export const InternalMemoryDecisionRequestProjectListQuerySchema = z.strictObject({
  tenantId: DecisionRequestSchema.shape.tenantId,
  agentId: AgentIdSchema,
  organizationId: DecisionRequestSchema.shape.organizationId,
  projectId: DecisionRequestSchema.shape.projectId.unwrap(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).max(2048).optional(),
});
export type InternalMemoryDecisionRequestProjectListQuery = z.infer<typeof InternalMemoryDecisionRequestProjectListQuerySchema>;

/**
 * Decoded cursor: transported as opaque base64url-encoded JSON. The service must
 * validate the decoded value and match its tenant/organization/project against
 * the query and authenticated scope on every page; a cursor grants no access.
 * Both ordering keys are mandatory, including when several rows share a timestamp.
 */
export const InternalMemoryDecisionRequestProjectCursorSchema = z.strictObject({
  tenantId: InternalMemoryDecisionRequestProjectListQuerySchema.shape.tenantId,
  organizationId: InternalMemoryDecisionRequestProjectListQuerySchema.shape.organizationId,
  projectId: InternalMemoryDecisionRequestProjectListQuerySchema.shape.projectId,
  createdAt: DecisionRequestSchema.shape.createdAt,
  requestId: DecisionRequestIdSchema,
});
export type InternalMemoryDecisionRequestProjectCursor = z.infer<typeof InternalMemoryDecisionRequestProjectCursorSchema>;

export const InternalMemoryDecisionRequestProjectListResponseSchema = z.strictObject({
  requests: z.array(InternalMemoryDecisionRequestReadResponseSchema).max(100).refine(
    (requests) => new Set(requests.map(({ request }) => request.requestId)).size === requests.length,
    { message: 'requestId must be unique within a page' },
  ),
  nextCursor: z.string().min(1).max(2048).nullable(),
});
export type InternalMemoryDecisionRequestProjectListResponse = z.infer<typeof InternalMemoryDecisionRequestProjectListResponseSchema>;

export const InternalMemoryDecisionRequestOutcomeResponseSchema = z.strictObject({
  result: z.enum(['recorded', 'duplicate']),
});
export type InternalMemoryDecisionRequestOutcomeResponse = z.infer<typeof InternalMemoryDecisionRequestOutcomeResponseSchema>;

export const DecisionRequestErrorCodeSchema = z.enum([
  'decision_request_conflict',
  'decision_request_not_found',
  'decision_already_taken',
]);
export type DecisionRequestErrorCode = z.infer<typeof DecisionRequestErrorCodeSchema>;

export const DecisionRequestErrorResponseSchema = z.strictObject({
  code: DecisionRequestErrorCodeSchema,
  message: z.string().min(1),
});
export type DecisionRequestErrorResponse = z.infer<typeof DecisionRequestErrorResponseSchema>;

/**
 * Create: 201 for a new request, 200 for an identical replay (same receipt),
 * 409 decision_request_conflict for the same ID with different content.
 */
export const internalMemoryDecisionRequestCreateContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_DECISION_REQUESTS_PATH,
  authType: 'secret' as const,
  bodySchema: DecisionRequestSchema,
  responseSchema: InternalMemoryDecisionRequestCreateResponseSchema,
} as const;

/**
 * Read: 200 with the current state; 404 decision_request_not_found for a missing
 * request or a different tenant/agent. The service must check the authenticated
 * scope before returning data; query parameters alone authorize nobody.
 */
export const internalMemoryDecisionRequestReadContract = {
  method: 'GET' as const,
  path: INTERNAL_MEMORY_DECISION_REQUEST_PATH,
  authType: 'secret' as const,
  paramsSchema: InternalMemoryDecisionRequestParamsSchema,
  querySchema: InternalMemoryDecisionRequestQuerySchema,
  responseSchema: InternalMemoryDecisionRequestReadResponseSchema,
} as const;

/**
 * Outcome: 200 recorded or duplicate for an identical replay; 409
 * decision_already_taken for a different outcome on an already decided request.
 * The service must correlate body.requestId with params.requestId and validate
 * the authenticated scope and owner against the stored request before writing.
 */
export const internalMemoryDecisionRequestOutcomeContract = {
  method: 'POST' as const,
  path: INTERNAL_MEMORY_DECISION_REQUEST_OUTCOME_PATH,
  authType: 'secret' as const,
  paramsSchema: InternalMemoryDecisionRequestParamsSchema,
  bodySchema: DecisionOutcomeSchema,
  responseSchema: InternalMemoryDecisionRequestOutcomeResponseSchema,
} as const;

/** List: 200 with the agent's requests (newest first); an unknown agent answers an empty list, never another's. */
export const internalMemoryDecisionRequestListContract = {
  method: 'GET' as const,
  path: INTERNAL_MEMORY_DECISION_REQUESTS_PATH,
  authType: 'secret' as const,
  querySchema: InternalMemoryDecisionRequestListQuerySchema,
  responseSchema: InternalMemoryDecisionRequestListResponseSchema,
} as const;

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
export const internalMemoryDecisionRequestProjectListContract = {
  method: 'GET' as const,
  path: INTERNAL_MEMORY_DECISION_REQUEST_PROJECT_LIST_PATH,
  authType: 'secret' as const,
  querySchema: InternalMemoryDecisionRequestProjectListQuerySchema,
  responseSchema: InternalMemoryDecisionRequestProjectListResponseSchema,
} as const;
