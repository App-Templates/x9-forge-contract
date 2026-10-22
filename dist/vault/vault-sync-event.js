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
export const SyncAgentResultSchema = z.object({
    slug: z.string().min(1),
    keys: z.number().int().nonnegative().optional(),
    error: z.string().optional(),
});
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
export const SyncAllRequestSchema = z.object({}).strict();
export const SyncAllResponseSchema = z.object({
    ok: z.literal(true),
    synced: z.array(SyncAgentResultSchema),
    errors: z.array(SyncAgentResultSchema),
});
export const SyncAllErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.string(),
});
/**
 * Endpoint contract for `POST /api/vault/sync-all`.
 * Shape conforms structurally to `EndpointContract` from `src/http/endpoint-contract.ts`
 * but is declared as a plain `const` object — no generic wrapping needed (D-16).
 *
 * @see src/http/endpoint-contract.ts
 */
export const syncAllContract = {
    method: 'POST',
    path: '/api/vault/sync-all',
    authType: 'none',
    bodySchema: SyncAllRequestSchema,
    responseSchema: SyncAllResponseSchema,
    errorResponseSchema: SyncAllErrorResponseSchema,
};
//# sourceMappingURL=vault-sync-event.js.map