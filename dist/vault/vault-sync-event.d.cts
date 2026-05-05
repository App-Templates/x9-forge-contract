import { z } from 'zod';
/**
 * Per-agent result of `POST /api/vault/sync-all`. Shape used for both the
 * `synced` (success) and `errors` (failure) arrays in the response.
 *
 * NOTE: `keys` is currently always 0 in Forge (vault.service.ts:301). Ship
 * the field as optional for forward-compat — Forge may populate it later.
 *
 * @see forge-v2/services/vault/src/services/vault.service.ts:62-66
 */
export declare const SyncAgentResultSchema: z.ZodObject<{
    slug: z.ZodString;
    keys: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SyncAgentResult = z.infer<typeof SyncAgentResultSchema>;
/**
 * `POST /api/vault/sync-all` — trigger-only bulk resync. Request body is empty.
 *
 * Auth is Clerk session + superadmin check (Forge applicative auth, not a
 * bridge `X-Internal-*` header). The bridge contract declares `authType: 'none'`
 * to denote "no bridge-managed auth header" — Clerk middleware runs outside
 * the bridge client.
 *
 * @see forge-v2/services/vault/src/routes/vault.ts:167-181
 */
export declare const SyncAllRequestSchema: z.ZodObject<{}, z.core.$strict>;
export type SyncAllRequest = z.infer<typeof SyncAllRequestSchema>;
export declare const SyncAllResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    synced: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        keys: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    errors: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        keys: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SyncAllResponse = z.infer<typeof SyncAllResponseSchema>;
export declare const SyncAllErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type SyncAllErrorResponse = z.infer<typeof SyncAllErrorResponseSchema>;
/** Alias for VLT-05 requirement nomenclature (`VaultSyncEvent`). */
export type VaultSyncEvent = SyncAllResponse;
/**
 * Endpoint contract for `POST /api/vault/sync-all`.
 * Shape conforms structurally to `EndpointContract` from `src/http/endpoint-contract.ts`
 * but is declared as a plain `const` object — no generic wrapping needed (D-16).
 *
 * @see src/http/endpoint-contract.ts
 */
export declare const syncAllContract: {
    readonly method: "POST";
    readonly path: "/api/vault/sync-all";
    readonly authType: "none";
    readonly bodySchema: z.ZodObject<{}, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        synced: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            keys: z.ZodOptional<z.ZodNumber>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        errors: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            keys: z.ZodOptional<z.ZodNumber>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    readonly errorResponseSchema: z.ZodObject<{
        ok: z.ZodLiteral<false>;
        error: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=vault-sync-event.d.ts.map