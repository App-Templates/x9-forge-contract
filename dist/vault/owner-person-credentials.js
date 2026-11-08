import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from "../auth/auth-headers.js";
/**
 * chiave della persona del proprietario nel board di Paperclip; sta al livello del proprietario;
 * la legge solo cap-paperclip dalla sua porta; mai nel `context.json`, mai in `/resolve`,
 * mai nel `.env` di un agente
 */
export const OWNER_PERSON_CREDENTIAL_KEYS = ['PAPERCLIP_OWNER_BOARD_KEY'];
export const OwnerPersonCredentialKeySchema = z.enum(OWNER_PERSON_CREDENTIAL_KEYS);
export function isOwnerPersonCredentialKey(key) {
    return OWNER_PERSON_CREDENTIAL_KEYS.includes(key);
}
/** Copy of `credentials` without owner-person keys (input untouched). */
export function stripOwnerPersonCredentials(credentials) {
    const out = {};
    for (const [key, value] of Object.entries(credentials)) {
        if (!isOwnerPersonCredentialKey(key))
            out[key] = value;
    }
    return out;
}
/** Infrastructure secret in vault-svc and cap-paperclip environments, never a Vault entry. */
export const OWNER_PERSON_VAULT_SECRET_ENV = 'OWNER_PERSON_VAULT_SECRET';
export const OwnerPersonKeyParamsSchema = z.strictObject({
    ownerId: z.string().regex(/^[1-9][0-9]*$/),
    key: OwnerPersonCredentialKeySchema,
});
export const OwnerPersonKeyOkResponseSchema = z.strictObject({
    ok: z.literal(true),
    key: OwnerPersonCredentialKeySchema,
    value: z.string().min(1),
});
/** HTTP 404: the owner has no value for this key. */
export const OwnerPersonKeyNotFoundResponseSchema = z.strictObject({
    ok: z.literal(false),
    error: z.literal('not_found'),
});
export const OwnerPersonKeyResponseSchema = z.discriminatedUnion('ok', [
    OwnerPersonKeyOkResponseSchema,
    OwnerPersonKeyNotFoundResponseSchema,
]);
/** Only cap-paperclip reads this owner-scoped port, authenticated with its dedicated secret. */
export const internalVaultOwnerPersonKeyContract = {
    method: 'GET',
    path: '/internal/vault/owner-person-key/:ownerId/:key',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    secretEnv: OWNER_PERSON_VAULT_SECRET_ENV,
    paramsSchema: OwnerPersonKeyParamsSchema,
    responseSchema: OwnerPersonKeyResponseSchema,
};
//# sourceMappingURL=owner-person-credentials.js.map