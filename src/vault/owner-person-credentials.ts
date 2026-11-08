import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../auth/auth-headers.js';

/**
 * chiave della persona del proprietario nel board di Paperclip; sta al livello del proprietario;
 * la legge solo cap-paperclip dalla sua porta; mai nel `context.json`, mai in `/resolve`,
 * mai nel `.env` di un agente
 */
export const OWNER_PERSON_CREDENTIAL_KEYS = ['PAPERCLIP_OWNER_BOARD_KEY'] as const;
export const OwnerPersonCredentialKeySchema = z.enum(OWNER_PERSON_CREDENTIAL_KEYS);
export type OwnerPersonCredentialKey = z.infer<typeof OwnerPersonCredentialKeySchema>;

export function isOwnerPersonCredentialKey(key: string): key is OwnerPersonCredentialKey {
  return (OWNER_PERSON_CREDENTIAL_KEYS as readonly string[]).includes(key);
}

/** Copy of `credentials` without owner-person keys (input untouched). */
export function stripOwnerPersonCredentials<T extends Record<string, string>>(credentials: T): T {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(credentials)) {
    if (!isOwnerPersonCredentialKey(key)) out[key] = value;
  }
  return out as T;
}

/** Infrastructure secret in vault-svc and cap-paperclip environments, never a Vault entry. */
export const OWNER_PERSON_VAULT_SECRET_ENV = 'OWNER_PERSON_VAULT_SECRET' as const;

export const OwnerPersonKeyParamsSchema = z.strictObject({
  ownerId: z.string().regex(/^[1-9][0-9]*$/),
  key: OwnerPersonCredentialKeySchema,
});
export type OwnerPersonKeyParams = z.infer<typeof OwnerPersonKeyParamsSchema>;

export const OwnerPersonKeyOkResponseSchema = z.strictObject({
  ok: z.literal(true),
  key: OwnerPersonCredentialKeySchema,
  value: z.string().min(1),
});
export type OwnerPersonKeyOkResponse = z.infer<typeof OwnerPersonKeyOkResponseSchema>;

/** HTTP 404: the owner has no value for this key. */
export const OwnerPersonKeyNotFoundResponseSchema = z.strictObject({
  ok: z.literal(false),
  error: z.literal('not_found'),
});
export type OwnerPersonKeyNotFoundResponse = z.infer<typeof OwnerPersonKeyNotFoundResponseSchema>;

export const OwnerPersonKeyResponseSchema = z.discriminatedUnion('ok', [
  OwnerPersonKeyOkResponseSchema,
  OwnerPersonKeyNotFoundResponseSchema,
]);
export type OwnerPersonKeyResponse = z.infer<typeof OwnerPersonKeyResponseSchema>;

/** Only cap-paperclip reads this owner-scoped port, authenticated with its dedicated secret. */
export const internalVaultOwnerPersonKeyContract = {
  method: 'GET' as const,
  path: '/internal/vault/owner-person-key/:ownerId/:key' as const,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  secretEnv: OWNER_PERSON_VAULT_SECRET_ENV,
  paramsSchema: OwnerPersonKeyParamsSchema,
  responseSchema: OwnerPersonKeyResponseSchema,
} as const;
