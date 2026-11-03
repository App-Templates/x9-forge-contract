"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionCompletedContract = exports.INTERNAL_CONNECTION_COMPLETED_PATH = exports.ConnectionCompletedResponseSchema = exports.ConnectionCompletedErrorResponseSchema = exports.ConnectionCompletedErrorCodeSchema = exports.ConnectionCompletedBodySchema = exports.ConnectionCompletedOutcomeSchema = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../capability/connect/index.cjs");
/**
 * POST /internal/connect/completed — "connection completed" event.
 * Direction: cap-connect -> agent-core, after the user's consent (or its denial/expiry).
 * Auth: X-Internal-Secret (INTERNAL_SECRET_HEADER) or X-Internal-Token (INTERNAL_TOKEN_HEADER).
 *
 * Carries the full identity of the turn to resume (tenant, owner, agent, person)
 * and the correlation id issued with the card; X9 never invents the correlation.
 * Never carries a Google token, permit or secret.
 */
exports.ConnectionCompletedOutcomeSchema = zod_1.z.enum(['connected', 'denied', 'expired']);
exports.ConnectionCompletedBodySchema = zod_1.z.object({
    cardId: zod_1.z.string().min(1).max(200),
    correlationId: zod_1.z.string().min(1).max(200),
    tenantId: zod_1.z.string().min(1),
    ownerId: zod_1.z.string().min(1),
    agentId: zod_1.z.string().min(1),
    personRef: zod_1.z.string().min(1),
    provider: index_js_1.ConnectProviderSchema,
    grantedPermissions: zod_1.z.array(index_js_1.ConnectScopeSchema).refine((scopes) => new Set(scopes).size === scopes.length, {
        message: 'grantedPermissions must not contain duplicates',
    }),
    outcome: exports.ConnectionCompletedOutcomeSchema,
    completedAt: zod_1.z.number().int().positive(),
}).strict();
exports.ConnectionCompletedErrorCodeSchema = zod_1.z.enum([
    'unauthenticated',
    'identity_mismatch',
    'unknown_correlation',
    'invalid_event',
]);
exports.ConnectionCompletedErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: exports.ConnectionCompletedErrorCodeSchema,
    reason: zod_1.z.string().min(1).max(500),
}).strict();
exports.ConnectionCompletedResponseSchema = zod_1.z.discriminatedUnion('ok', [
    zod_1.z.object({
        ok: zod_1.z.literal(true),
        resumed: zod_1.z.boolean(),
    }).strict(),
    exports.ConnectionCompletedErrorResponseSchema,
]);
exports.INTERNAL_CONNECTION_COMPLETED_PATH = '/internal/connect/completed';
exports.connectionCompletedContract = {
    method: 'POST',
    path: exports.INTERNAL_CONNECTION_COMPLETED_PATH,
    authType: 'secret',
    bodySchema: exports.ConnectionCompletedBodySchema,
    responseSchema: exports.ConnectionCompletedResponseSchema,
};
//# sourceMappingURL=internal-connection-completed.js.map