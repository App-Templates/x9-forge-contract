import { z } from 'zod';
import {
  ConnectProviderSchema,
  ConnectScopeSchema,
  ConnectStateResponseSchema,
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
