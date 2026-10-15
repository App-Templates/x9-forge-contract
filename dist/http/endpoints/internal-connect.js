import { z } from 'zod';
import { ConnectProviderSchema, ConnectRevokeRequestSchema, ConnectRevokeResponseSchema, ConnectScopeSchema, ConnectStartRequestSchema, ConnectStartResponseSchema, ConnectStateResponseSchema, ConnectToolPermitSchema, } from "../../capability/connect/index.js";
/**
 * /internal/connect/* — internal routes of the Connessioni service (cap-connect).
 * Direction: agent-core / X9 tool -> cap-connect.
 * Auth: X-Internal-Secret (fleet secret, INTERNAL_SECRET_HEADER).
 *
 * The state response never carries a Google token or value; the permit route
 * returns only a signed, time-limited permit for tools.
 */
/** Common error body of the Connessioni internal routes. */
export const ConnectErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.string().min(1).max(500),
}).strict();
export const ConnectStateParamsSchema = z.object({
    agentId: z.string().regex(/^[a-z0-9-]+$/),
    provider: ConnectProviderSchema,
}).strict();
export const IssueConnectPermitBodySchema = z.object({
    agentId: z.string().min(1),
    provider: ConnectProviderSchema,
    scopes: z.array(ConnectScopeSchema).min(1).refine((scopes) => new Set(scopes).size === scopes.length, {
        message: 'Scopes must not contain duplicates',
    }),
}).strict();
export const IssueConnectPermitResponseSchema = z.discriminatedUnion('ok', [
    z.object({
        ok: z.literal(true),
        permit: ConnectToolPermitSchema,
        token: z.string().min(32),
    }).strict(),
    ConnectErrorResponseSchema,
]);
export const startConnectContract = {
    method: 'POST',
    path: '/internal/connect/start',
    authType: 'secret',
    bodySchema: ConnectStartRequestSchema,
    responseSchema: ConnectStartResponseSchema,
};
export const getConnectStateContract = {
    method: 'GET',
    path: '/internal/connect/state/:agentId/:provider',
    authType: 'secret',
    paramsSchema: ConnectStateParamsSchema,
    responseSchema: ConnectStateResponseSchema,
};
export const revokeConnectContract = {
    method: 'POST',
    path: '/internal/connect/revoke',
    authType: 'secret',
    bodySchema: ConnectRevokeRequestSchema,
    responseSchema: ConnectRevokeResponseSchema,
};
export const issueConnectPermitContract = {
    method: 'POST',
    path: '/internal/connect/permit',
    authType: 'secret',
    bodySchema: IssueConnectPermitBodySchema,
    responseSchema: IssueConnectPermitResponseSchema,
};
//# sourceMappingURL=internal-connect.js.map