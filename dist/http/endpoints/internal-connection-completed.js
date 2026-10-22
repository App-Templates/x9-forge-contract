import { z } from 'zod';
import { ConnectProviderSchema, ConnectScopeSchema } from "../../capability/connect/index.js";
/**
 * POST /internal/connect/completed — "connection completed" event.
 * Direction: cap-connect -> agent-core, after the user's consent (or its denial/expiry).
 * Auth: X-Internal-Secret (INTERNAL_SECRET_HEADER) or X-Internal-Token (INTERNAL_TOKEN_HEADER).
 *
 * Carries the full identity of the turn to resume (tenant, owner, agent, person)
 * and the correlation id issued with the card; X9 never invents the correlation.
 * Never carries a Google token, permit or secret.
 */
export const ConnectionCompletedOutcomeSchema = z.enum(['connected', 'denied', 'expired']);
export const ConnectionCompletedBodySchema = z.object({
    cardId: z.string().min(1).max(200),
    correlationId: z.string().min(1).max(200),
    tenantId: z.string().min(1),
    ownerId: z.string().min(1),
    agentId: z.string().min(1),
    personRef: z.string().min(1),
    provider: ConnectProviderSchema,
    grantedPermissions: z.array(ConnectScopeSchema).refine((scopes) => new Set(scopes).size === scopes.length, {
        message: 'grantedPermissions must not contain duplicates',
    }),
    outcome: ConnectionCompletedOutcomeSchema,
    completedAt: z.number().int().positive(),
}).strict();
export const ConnectionCompletedErrorCodeSchema = z.enum([
    'unauthenticated',
    'identity_mismatch',
    'unknown_correlation',
    'invalid_event',
]);
export const ConnectionCompletedErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: ConnectionCompletedErrorCodeSchema,
    reason: z.string().min(1).max(500),
}).strict();
export const ConnectionCompletedResponseSchema = z.discriminatedUnion('ok', [
    z.object({
        ok: z.literal(true),
        resumed: z.boolean(),
    }).strict(),
    ConnectionCompletedErrorResponseSchema,
]);
export const INTERNAL_CONNECTION_COMPLETED_PATH = '/internal/connect/completed';
export const connectionCompletedContract = {
    method: 'POST',
    path: INTERNAL_CONNECTION_COMPLETED_PATH,
    authType: 'secret',
    bodySchema: ConnectionCompletedBodySchema,
    responseSchema: ConnectionCompletedResponseSchema,
};
//# sourceMappingURL=internal-connection-completed.js.map