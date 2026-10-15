import { z } from 'zod';
import { ConnectProviderSchema, ConnectScopeSchema, ConnectStateResponseSchema, } from "../../capability/connect/index.js";
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
export const VAULT_CONNECTION_VALUE_MAX_LENGTH = 8192;
export const VaultConnectionParamsSchema = z.object({
    agentId: z.string().regex(/^[1-9][0-9]{0,9}$/),
    provider: ConnectProviderSchema,
}).strict();
export const PutVaultConnectionBodySchema = z.object({
    value: z.string().min(1).max(VAULT_CONNECTION_VALUE_MAX_LENGTH),
    accountLabel: z.string().max(200).optional(),
    scopes: z.array(ConnectScopeSchema).min(1).refine((scopes) => new Set(scopes).size === scopes.length, {
        message: 'Scopes must not contain duplicates',
    }),
}).strict();
export const PutVaultConnectionResponseSchema = z.object({
    ok: z.literal(true),
    status: z.literal('connected'),
}).strict();
export const DeleteVaultConnectionResponseSchema = z.object({
    ok: z.literal(true),
    status: z.literal('revoked'),
}).strict();
export const GetVaultConnectionStateResponseSchema = ConnectStateResponseSchema;
export const GetVaultConnectionValueResponseSchema = z.object({
    ok: z.literal(true),
    value: z.string().min(1).max(VAULT_CONNECTION_VALUE_MAX_LENGTH),
}).strict();
export const VaultConnectionErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.string(),
}).strict();
export const putVaultConnectionContract = {
    method: 'PUT',
    path: '/internal/vault/connections/:agentId/:provider',
    authType: 'secret',
    paramsSchema: VaultConnectionParamsSchema,
    bodySchema: PutVaultConnectionBodySchema,
    responseSchema: PutVaultConnectionResponseSchema,
};
export const deleteVaultConnectionContract = {
    method: 'DELETE',
    path: '/internal/vault/connections/:agentId/:provider',
    authType: 'secret',
    paramsSchema: VaultConnectionParamsSchema,
    responseSchema: DeleteVaultConnectionResponseSchema,
};
export const getVaultConnectionStateContract = {
    method: 'GET',
    path: '/internal/vault/connections/:agentId/:provider',
    authType: 'secret',
    paramsSchema: VaultConnectionParamsSchema,
    responseSchema: GetVaultConnectionStateResponseSchema,
};
export const getVaultConnectionValueContract = {
    method: 'GET',
    path: '/internal/vault/connections/:agentId/:provider/value',
    authType: 'secret',
    paramsSchema: VaultConnectionParamsSchema,
    responseSchema: GetVaultConnectionValueResponseSchema,
};
//# sourceMappingURL=internal-vault-connection.js.map