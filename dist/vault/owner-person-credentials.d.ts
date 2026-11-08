import { z } from 'zod';
/**
 * chiave della persona del proprietario nel board di Paperclip; sta al livello del proprietario;
 * la legge solo cap-paperclip dalla sua porta; mai nel `context.json`, mai in `/resolve`,
 * mai nel `.env` di un agente
 */
export declare const OWNER_PERSON_CREDENTIAL_KEYS: readonly ["PAPERCLIP_OWNER_BOARD_KEY"];
export declare const OwnerPersonCredentialKeySchema: z.ZodEnum<{
    PAPERCLIP_OWNER_BOARD_KEY: "PAPERCLIP_OWNER_BOARD_KEY";
}>;
export type OwnerPersonCredentialKey = z.infer<typeof OwnerPersonCredentialKeySchema>;
export declare function isOwnerPersonCredentialKey(key: string): key is OwnerPersonCredentialKey;
/** Copy of `credentials` without owner-person keys (input untouched). */
export declare function stripOwnerPersonCredentials<T extends Record<string, string>>(credentials: T): T;
/** Infrastructure secret in vault-svc and cap-paperclip environments, never a Vault entry. */
export declare const OWNER_PERSON_VAULT_SECRET_ENV: "OWNER_PERSON_VAULT_SECRET";
export declare const OwnerPersonKeyParamsSchema: z.ZodObject<{
    ownerId: z.ZodString;
    key: z.ZodEnum<{
        PAPERCLIP_OWNER_BOARD_KEY: "PAPERCLIP_OWNER_BOARD_KEY";
    }>;
}, z.core.$strict>;
export type OwnerPersonKeyParams = z.infer<typeof OwnerPersonKeyParamsSchema>;
export declare const OwnerPersonKeyOkResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    key: z.ZodEnum<{
        PAPERCLIP_OWNER_BOARD_KEY: "PAPERCLIP_OWNER_BOARD_KEY";
    }>;
    value: z.ZodString;
}, z.core.$strict>;
export type OwnerPersonKeyOkResponse = z.infer<typeof OwnerPersonKeyOkResponseSchema>;
/** HTTP 404: the owner has no value for this key. */
export declare const OwnerPersonKeyNotFoundResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodLiteral<"not_found">;
}, z.core.$strict>;
export type OwnerPersonKeyNotFoundResponse = z.infer<typeof OwnerPersonKeyNotFoundResponseSchema>;
export declare const OwnerPersonKeyResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    key: z.ZodEnum<{
        PAPERCLIP_OWNER_BOARD_KEY: "PAPERCLIP_OWNER_BOARD_KEY";
    }>;
    value: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodLiteral<"not_found">;
}, z.core.$strict>], "ok">;
export type OwnerPersonKeyResponse = z.infer<typeof OwnerPersonKeyResponseSchema>;
/** Only cap-paperclip reads this owner-scoped port, authenticated with its dedicated secret. */
export declare const internalVaultOwnerPersonKeyContract: {
    readonly method: "GET";
    readonly path: "/internal/vault/owner-person-key/:ownerId/:key";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly secretEnv: "OWNER_PERSON_VAULT_SECRET";
    readonly paramsSchema: z.ZodObject<{
        ownerId: z.ZodString;
        key: z.ZodEnum<{
            PAPERCLIP_OWNER_BOARD_KEY: "PAPERCLIP_OWNER_BOARD_KEY";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        ok: z.ZodLiteral<true>;
        key: z.ZodEnum<{
            PAPERCLIP_OWNER_BOARD_KEY: "PAPERCLIP_OWNER_BOARD_KEY";
        }>;
        value: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodLiteral<"not_found">;
    }, z.core.$strict>], "ok">;
};
//# sourceMappingURL=owner-person-credentials.d.ts.map