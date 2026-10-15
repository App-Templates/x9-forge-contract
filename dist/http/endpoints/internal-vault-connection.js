import { z } from 'zod';
import { ConnectProviderSchema, ConnectScopeSchema, ConnectStartRequestSchema, ConnectStateResponseSchema, ConnectStatusSchema, } from "../../capability/connect/index.js";
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
/** Revoca presso il provider con il refresh custodito dal Vault: il token non esce. */
export const RevokeVaultConnectionResponseSchema = z.object({
    ok: z.literal(true),
    status: z.enum(['revoked', 'not_connected']),
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
/** Access tokens are issued by Vault; refresh credentials stay in Vault. */
export const VAULT_ACCESS_TOKEN_MAX_LENGTH = 4096;
export const VAULT_ACCESS_ERROR_CODES = ['not_connected', 'revoked', 'scope_missing', 'expired'];
export const VaultAccessErrorCodeSchema = z.enum(VAULT_ACCESS_ERROR_CODES);
export const VaultAccessScopeSchema = ConnectScopeSchema.refine((scope) => scope !== 'mail_send', {
    message: 'Mail sending cannot request an access token through this route',
});
export const PostVaultAccessTokenBodySchema = z.object({
    scope: VaultAccessScopeSchema,
    personRef: ConnectStartRequestSchema.shape.personRef,
}).strict();
export const PostVaultAccessTokenResponseSchema = z.object({
    ok: z.literal(true),
    accessToken: z.string().min(1).max(VAULT_ACCESS_TOKEN_MAX_LENGTH),
    expiresAt: z.number().int().positive(),
    scopes: z.array(ConnectScopeSchema),
}).strict();
export const VaultAccessErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: VaultAccessErrorCodeSchema,
}).strict();
export const ListVaultConnectionsParamsSchema = VaultConnectionParamsSchema.pick({ agentId: true });
export const ListVaultConnectionsResponseSchema = z.object({
    ok: z.literal(true),
    connections: z.array(z.object({
        provider: ConnectProviderSchema,
        status: ConnectStatusSchema,
        scopes: z.array(ConnectScopeSchema),
        accountLabel: z.string().max(200).optional(),
    }).strict()),
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
export const revokeVaultConnectionContract = {
    method: 'POST',
    path: '/internal/vault/connections/:agentId/:provider/revoke',
    authType: 'secret',
    paramsSchema: VaultConnectionParamsSchema,
    responseSchema: RevokeVaultConnectionResponseSchema,
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
export const postVaultAccessTokenContract = {
    method: 'POST',
    path: '/internal/vault/connections/:agentId/:provider/access-token',
    authType: 'secret',
    paramsSchema: VaultConnectionParamsSchema,
    bodySchema: PostVaultAccessTokenBodySchema,
    responseSchema: PostVaultAccessTokenResponseSchema,
};
export const listVaultConnectionsContract = {
    method: 'GET',
    path: '/internal/vault/connections/:agentId',
    authType: 'secret',
    paramsSchema: ListVaultConnectionsParamsSchema,
    responseSchema: ListVaultConnectionsResponseSchema,
};
//# sourceMappingURL=internal-vault-connection.js.map