"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVaultConnectionValueContract = exports.getVaultConnectionStateContract = exports.deleteVaultConnectionContract = exports.putVaultConnectionContract = exports.VaultConnectionErrorResponseSchema = exports.GetVaultConnectionValueResponseSchema = exports.GetVaultConnectionStateResponseSchema = exports.DeleteVaultConnectionResponseSchema = exports.PutVaultConnectionResponseSchema = exports.PutVaultConnectionBodySchema = exports.VaultConnectionParamsSchema = exports.VAULT_CONNECTION_VALUE_MAX_LENGTH = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../capability/connect/index.cjs");
/**
 * /internal/vault/connections/:agentId/:provider[/value] — per-agent Vault port
 * for connection credentials (Connessioni service <-> Forge Vault).
 * Direction: cap-connect -> Forge vault; Forge panel reads state only.
 * Auth: X-Internal-Secret carrying CONNECT_VAULT_SECRET (never INTERNAL_SERVICE_TOKEN).
 *
 * The state response never carries a value; only the value route does, and only
 * the Connessioni service reads it.
 */
/** Maximum length of a stored connection value. */
exports.VAULT_CONNECTION_VALUE_MAX_LENGTH = 8192;
exports.VaultConnectionParamsSchema = zod_1.z.object({
    agentId: zod_1.z.string().regex(/^[1-9][0-9]{0,9}$/),
    provider: index_js_1.ConnectProviderSchema,
}).strict();
exports.PutVaultConnectionBodySchema = zod_1.z.object({
    value: zod_1.z.string().min(1).max(exports.VAULT_CONNECTION_VALUE_MAX_LENGTH),
    accountLabel: zod_1.z.string().max(200).optional(),
    scopes: zod_1.z.array(index_js_1.ConnectScopeSchema).min(1).refine((scopes) => new Set(scopes).size === scopes.length, {
        message: 'Scopes must not contain duplicates',
    }),
}).strict();
exports.PutVaultConnectionResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    status: zod_1.z.literal('connected'),
}).strict();
exports.DeleteVaultConnectionResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    status: zod_1.z.literal('revoked'),
}).strict();
exports.GetVaultConnectionStateResponseSchema = index_js_1.ConnectStateResponseSchema;
exports.GetVaultConnectionValueResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    value: zod_1.z.string().min(1).max(exports.VAULT_CONNECTION_VALUE_MAX_LENGTH),
}).strict();
exports.VaultConnectionErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string(),
}).strict();
exports.putVaultConnectionContract = {
    method: 'PUT',
    path: '/internal/vault/connections/:agentId/:provider',
    authType: 'secret',
    paramsSchema: exports.VaultConnectionParamsSchema,
    bodySchema: exports.PutVaultConnectionBodySchema,
    responseSchema: exports.PutVaultConnectionResponseSchema,
};
exports.deleteVaultConnectionContract = {
    method: 'DELETE',
    path: '/internal/vault/connections/:agentId/:provider',
    authType: 'secret',
    paramsSchema: exports.VaultConnectionParamsSchema,
    responseSchema: exports.DeleteVaultConnectionResponseSchema,
};
exports.getVaultConnectionStateContract = {
    method: 'GET',
    path: '/internal/vault/connections/:agentId/:provider',
    authType: 'secret',
    paramsSchema: exports.VaultConnectionParamsSchema,
    responseSchema: exports.GetVaultConnectionStateResponseSchema,
};
exports.getVaultConnectionValueContract = {
    method: 'GET',
    path: '/internal/vault/connections/:agentId/:provider/value',
    authType: 'secret',
    paramsSchema: exports.VaultConnectionParamsSchema,
    responseSchema: exports.GetVaultConnectionValueResponseSchema,
};
//# sourceMappingURL=internal-vault-connection.js.map