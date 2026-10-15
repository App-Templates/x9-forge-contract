import { z } from 'zod';
import {
  ConnectProviderSchema,
  ConnectScopeSchema,
  ConnectStartRequestSchema,
  ConnectStateResponseSchema,
  ConnectStatusSchema,
} from '../../capability/connect/index.js';

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
export type VaultConnectionParams = z.infer<typeof VaultConnectionParamsSchema>;

export const PutVaultConnectionBodySchema = z.object({
  value: z.string().min(1).max(VAULT_CONNECTION_VALUE_MAX_LENGTH),
  accountLabel: z.string().max(200).optional(),
  scopes: z.array(ConnectScopeSchema).min(1).refine((scopes) => new Set(scopes).size === scopes.length, {
    message: 'Scopes must not contain duplicates',
  }),
}).strict();
export type PutVaultConnectionBody = z.infer<typeof PutVaultConnectionBodySchema>;

export const PutVaultConnectionResponseSchema = z.object({
  ok: z.literal(true),
  status: z.literal('connected'),
}).strict();
export type PutVaultConnectionResponse = z.infer<typeof PutVaultConnectionResponseSchema>;

export const DeleteVaultConnectionResponseSchema = z.object({
  ok: z.literal(true),
  status: z.literal('revoked'),
}).strict();
export type DeleteVaultConnectionResponse = z.infer<typeof DeleteVaultConnectionResponseSchema>;

/** Revoca presso il provider con il refresh custodito dal Vault: il token non esce. */
export const RevokeVaultConnectionResponseSchema = z.object({
  ok: z.literal(true),
  status: z.enum(['revoked', 'not_connected']),
}).strict();
export type RevokeVaultConnectionResponse = z.infer<typeof RevokeVaultConnectionResponseSchema>;

export const GetVaultConnectionStateResponseSchema = ConnectStateResponseSchema;
export type GetVaultConnectionStateResponse = z.infer<typeof GetVaultConnectionStateResponseSchema>;

export const GetVaultConnectionValueResponseSchema = z.object({
  ok: z.literal(true),
  value: z.string().min(1).max(VAULT_CONNECTION_VALUE_MAX_LENGTH),
}).strict();
export type GetVaultConnectionValueResponse = z.infer<typeof GetVaultConnectionValueResponseSchema>;

export const VaultConnectionErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
}).strict();
export type VaultConnectionErrorResponse = z.infer<typeof VaultConnectionErrorResponseSchema>;

/** Access tokens are issued by Vault; refresh credentials stay in Vault. */
export const VAULT_ACCESS_TOKEN_MAX_LENGTH = 4096;
export const VAULT_ACCESS_ERROR_CODES = ['not_connected', 'revoked', 'scope_missing', 'expired'] as const;
export const VaultAccessErrorCodeSchema = z.enum(VAULT_ACCESS_ERROR_CODES);
export type VaultAccessErrorCode = z.infer<typeof VaultAccessErrorCodeSchema>;

export const VaultAccessScopeSchema = ConnectScopeSchema.refine((scope) => scope !== 'mail_send', {
  message: 'Mail sending cannot request an access token through this route',
});
export type VaultAccessScope = z.infer<typeof VaultAccessScopeSchema>;

export const PostVaultAccessTokenBodySchema = z.object({
  scope: VaultAccessScopeSchema,
  personRef: ConnectStartRequestSchema.shape.personRef,
}).strict();
export type PostVaultAccessTokenBody = z.infer<typeof PostVaultAccessTokenBodySchema>;

export const PostVaultAccessTokenResponseSchema = z.object({
  ok: z.literal(true),
  accessToken: z.string().min(1).max(VAULT_ACCESS_TOKEN_MAX_LENGTH),
  expiresAt: z.number().int().positive(),
  scopes: z.array(ConnectScopeSchema),
}).strict();
export type PostVaultAccessTokenResponse = z.infer<typeof PostVaultAccessTokenResponseSchema>;

export const VaultAccessErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: VaultAccessErrorCodeSchema,
}).strict();
export type VaultAccessErrorResponse = z.infer<typeof VaultAccessErrorResponseSchema>;

export const ListVaultConnectionsParamsSchema = VaultConnectionParamsSchema.pick({ agentId: true });
export type ListVaultConnectionsParams = z.infer<typeof ListVaultConnectionsParamsSchema>;

export const ListVaultConnectionsResponseSchema = z.object({
  ok: z.literal(true),
  connections: z.array(z.object({
    provider: ConnectProviderSchema,
    status: ConnectStatusSchema,
    scopes: z.array(ConnectScopeSchema),
    accountLabel: z.string().max(200).optional(),
  }).strict()),
}).strict();
export type ListVaultConnectionsResponse = z.infer<typeof ListVaultConnectionsResponseSchema>;

export const putVaultConnectionContract = {
  method: 'PUT' as const,
  path: '/internal/vault/connections/:agentId/:provider' as const,
  authType: 'secret' as const,
  paramsSchema: VaultConnectionParamsSchema,
  bodySchema: PutVaultConnectionBodySchema,
  responseSchema: PutVaultConnectionResponseSchema,
} as const;

export const deleteVaultConnectionContract = {
  method: 'DELETE' as const,
  path: '/internal/vault/connections/:agentId/:provider' as const,
  authType: 'secret' as const,
  paramsSchema: VaultConnectionParamsSchema,
  responseSchema: DeleteVaultConnectionResponseSchema,
} as const;

export const revokeVaultConnectionContract = {
  method: 'POST' as const,
  path: '/internal/vault/connections/:agentId/:provider/revoke' as const,
  authType: 'secret' as const,
  paramsSchema: VaultConnectionParamsSchema,
  responseSchema: RevokeVaultConnectionResponseSchema,
} as const;

export const getVaultConnectionStateContract = {
  method: 'GET' as const,
  path: '/internal/vault/connections/:agentId/:provider' as const,
  authType: 'secret' as const,
  paramsSchema: VaultConnectionParamsSchema,
  responseSchema: GetVaultConnectionStateResponseSchema,
} as const;

export const getVaultConnectionValueContract = {
  method: 'GET' as const,
  path: '/internal/vault/connections/:agentId/:provider/value' as const,
  authType: 'secret' as const,
  paramsSchema: VaultConnectionParamsSchema,
  responseSchema: GetVaultConnectionValueResponseSchema,
} as const;

export const postVaultAccessTokenContract = {
  method: 'POST' as const,
  path: '/internal/vault/connections/:agentId/:provider/access-token' as const,
  authType: 'secret' as const,
  paramsSchema: VaultConnectionParamsSchema,
  bodySchema: PostVaultAccessTokenBodySchema,
  responseSchema: PostVaultAccessTokenResponseSchema,
} as const;

export const listVaultConnectionsContract = {
  method: 'GET' as const,
  path: '/internal/vault/connections/:agentId' as const,
  authType: 'secret' as const,
  paramsSchema: ListVaultConnectionsParamsSchema,
  responseSchema: ListVaultConnectionsResponseSchema,
} as const;
