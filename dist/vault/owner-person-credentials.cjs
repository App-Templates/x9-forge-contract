"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalVaultOwnerPersonKeyContract = exports.OwnerPersonKeyResponseSchema = exports.OwnerPersonKeyNotFoundResponseSchema = exports.OwnerPersonKeyOkResponseSchema = exports.OwnerPersonKeyParamsSchema = exports.OWNER_PERSON_VAULT_SECRET_ENV = exports.OwnerPersonCredentialKeySchema = exports.OWNER_PERSON_CREDENTIAL_KEYS = void 0;
exports.isOwnerPersonCredentialKey = isOwnerPersonCredentialKey;
exports.stripOwnerPersonCredentials = stripOwnerPersonCredentials;
const zod_1 = require("zod");
const auth_headers_js_1 = require("../auth/auth-headers.cjs");
/**
 * chiave della persona del proprietario nel board di Paperclip; sta al livello del proprietario;
 * la legge solo cap-paperclip dalla sua porta; mai nel `context.json`, mai in `/resolve`,
 * mai nel `.env` di un agente
 */
exports.OWNER_PERSON_CREDENTIAL_KEYS = ['PAPERCLIP_OWNER_BOARD_KEY'];
exports.OwnerPersonCredentialKeySchema = zod_1.z.enum(exports.OWNER_PERSON_CREDENTIAL_KEYS);
function isOwnerPersonCredentialKey(key) {
    return exports.OWNER_PERSON_CREDENTIAL_KEYS.includes(key);
}
/** Copy of `credentials` without owner-person keys (input untouched). */
function stripOwnerPersonCredentials(credentials) {
    const out = {};
    for (const [key, value] of Object.entries(credentials)) {
        if (!isOwnerPersonCredentialKey(key))
            out[key] = value;
    }
    return out;
}
/** Infrastructure secret in vault-svc and cap-paperclip environments, never a Vault entry. */
exports.OWNER_PERSON_VAULT_SECRET_ENV = 'OWNER_PERSON_VAULT_SECRET';
exports.OwnerPersonKeyParamsSchema = zod_1.z.strictObject({
    ownerId: zod_1.z.string().regex(/^[1-9][0-9]*$/),
    key: exports.OwnerPersonCredentialKeySchema,
});
exports.OwnerPersonKeyOkResponseSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(true),
    key: exports.OwnerPersonCredentialKeySchema,
    value: zod_1.z.string().min(1),
});
/** HTTP 404: the owner has no value for this key. */
exports.OwnerPersonKeyNotFoundResponseSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    error: zod_1.z.literal('not_found'),
});
exports.OwnerPersonKeyResponseSchema = zod_1.z.discriminatedUnion('ok', [
    exports.OwnerPersonKeyOkResponseSchema,
    exports.OwnerPersonKeyNotFoundResponseSchema,
]);
/** Only cap-paperclip reads this owner-scoped port, authenticated with its dedicated secret. */
exports.internalVaultOwnerPersonKeyContract = {
    method: 'GET',
    path: '/internal/vault/owner-person-key/:ownerId/:key',
    authType: 'secret',
    authHeader: auth_headers_js_1.INTERNAL_SECRET_HEADER,
    secretEnv: exports.OWNER_PERSON_VAULT_SECRET_ENV,
    paramsSchema: exports.OwnerPersonKeyParamsSchema,
    responseSchema: exports.OwnerPersonKeyResponseSchema,
};
//# sourceMappingURL=owner-person-credentials.js.map