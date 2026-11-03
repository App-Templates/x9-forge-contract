"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueConnectAccessTokenContract = exports.issueConnectPermitContract = exports.revokeConnectContract = exports.getConnectStateContract = exports.startConnectContract = exports.IssueConnectAccessTokenResponseSchema = exports.ConnectAccessErrorCodeSchema = exports.CONNECT_ACCESS_ERROR_CODES = exports.IssueConnectAccessTokenBodySchema = exports.IssueConnectPermitResponseSchema = exports.IssueConnectPermitBodySchema = exports.ConnectStateParamsSchema = exports.ConnectErrorResponseSchema = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../capability/connect/index.cjs");
const internal_vault_connection_js_1 = require("./internal-vault-connection.cjs");
/**
 * /internal/connect/* — internal routes of the Connessioni service (cap-connect).
 * Direction: agent-core / X9 tool -> cap-connect.
 * Auth: X-Internal-Secret (fleet secret, INTERNAL_SECRET_HEADER).
 *
 * The state response never carries a Google token or value; the permit route
 * returns only a signed, time-limited permit for tools.
 */
/** Common error body of the Connessioni internal routes. */
exports.ConnectErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string().min(1).max(500),
}).strict();
exports.ConnectStateParamsSchema = zod_1.z.object({
    agentId: zod_1.z.string().regex(/^[a-z0-9-]+$/),
    provider: index_js_1.ConnectProviderSchema,
}).strict();
exports.IssueConnectPermitBodySchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    provider: index_js_1.ConnectProviderSchema,
    scopes: zod_1.z.array(index_js_1.ConnectScopeSchema).min(1).refine((scopes) => new Set(scopes).size === scopes.length, {
        message: 'Scopes must not contain duplicates',
    }),
}).strict();
exports.IssueConnectPermitResponseSchema = zod_1.z.discriminatedUnion('ok', [
    zod_1.z.object({
        ok: zod_1.z.literal(true),
        permit: index_js_1.ConnectToolPermitSchema,
        token: zod_1.z.string().min(32),
    }).strict(),
    exports.ConnectErrorResponseSchema,
]);
/** Capability services (calendar, contacts, email) ask cap-connect for a short-lived access token. */
exports.IssueConnectAccessTokenBodySchema = zod_1.z.object({
    agentId: internal_vault_connection_js_1.VaultConnectionParamsSchema.shape.agentId,
    provider: index_js_1.ConnectProviderSchema,
    scope: internal_vault_connection_js_1.VaultAccessScopeSchema,
    personRef: zod_1.z.string().min(1),
}).strict();
exports.CONNECT_ACCESS_ERROR_CODES = [
    ...internal_vault_connection_js_1.VAULT_ACCESS_ERROR_CODES,
    'person_not_determinable',
    'unavailable',
];
exports.ConnectAccessErrorCodeSchema = zod_1.z.enum(exports.CONNECT_ACCESS_ERROR_CODES);
exports.IssueConnectAccessTokenResponseSchema = zod_1.z.discriminatedUnion('ok', [
    internal_vault_connection_js_1.PostVaultAccessTokenResponseSchema,
    zod_1.z.object({
        ok: zod_1.z.literal(false),
        error: exports.ConnectAccessErrorCodeSchema,
    }).strict(),
]);
exports.startConnectContract = {
    method: 'POST',
    path: '/internal/connect/start',
    authType: 'secret',
    bodySchema: index_js_1.ConnectStartRequestSchema,
    responseSchema: index_js_1.ConnectStartResponseSchema,
};
exports.getConnectStateContract = {
    method: 'GET',
    path: '/internal/connect/state/:agentId/:provider',
    authType: 'secret',
    paramsSchema: exports.ConnectStateParamsSchema,
    responseSchema: index_js_1.ConnectStateResponseSchema,
};
exports.revokeConnectContract = {
    method: 'POST',
    path: '/internal/connect/revoke',
    authType: 'secret',
    bodySchema: index_js_1.ConnectRevokeRequestSchema,
    responseSchema: index_js_1.ConnectRevokeResponseSchema,
};
exports.issueConnectPermitContract = {
    method: 'POST',
    path: '/internal/connect/permit',
    authType: 'secret',
    bodySchema: exports.IssueConnectPermitBodySchema,
    responseSchema: exports.IssueConnectPermitResponseSchema,
};
exports.issueConnectAccessTokenContract = {
    method: 'POST',
    path: '/internal/connect/access-token',
    authType: 'secret',
    bodySchema: exports.IssueConnectAccessTokenBodySchema,
    responseSchema: exports.IssueConnectAccessTokenResponseSchema,
};
//# sourceMappingURL=internal-connect.js.map