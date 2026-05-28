"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncAllContract = exports.SyncAllErrorResponseSchema = exports.SyncAllResponseSchema = exports.SyncAllRequestSchema = exports.SyncAgentResultSchema = void 0;
const zod_1 = require("zod");
/**
 * Per-agent result of `POST /api/vault/sync-all`. Shape used for both the
 * `synced` (success) and `errors` (failure) arrays in the response.
 *
 * NOTE: `keys` is currently always 0 in Forge (vault.service.ts:301). Ship
 * the field as optional for forward-compat — Forge may populate it later.
 *
 * @see forge-v2/services/vault/src/services/vault.service.ts:62-66
 */
exports.SyncAgentResultSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1),
    keys: zod_1.z.number().int().nonnegative().optional(),
    error: zod_1.z.string().optional(),
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
exports.SyncAllRequestSchema = zod_1.z.object({}).strict();
exports.SyncAllResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    synced: zod_1.z.array(exports.SyncAgentResultSchema),
    errors: zod_1.z.array(exports.SyncAgentResultSchema),
});
exports.SyncAllErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string(),
});
/**
 * Endpoint contract for `POST /api/vault/sync-all`.
 * Shape conforms structurally to `EndpointContract` from `src/http/endpoint-contract.ts`
 * but is declared as a plain `const` object — no generic wrapping needed (D-16).
 *
 * @see src/http/endpoint-contract.ts
 */
exports.syncAllContract = {
    method: 'POST',
    path: '/api/vault/sync-all',
    authType: 'none',
    bodySchema: exports.SyncAllRequestSchema,
    responseSchema: exports.SyncAllResponseSchema,
    errorResponseSchema: exports.SyncAllErrorResponseSchema,
};
//# sourceMappingURL=vault-sync-event.js.map