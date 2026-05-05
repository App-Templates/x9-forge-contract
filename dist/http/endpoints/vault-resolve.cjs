"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaultResolveContract = exports.VaultResolveErrorResponseSchema = exports.VaultResolveNotFoundResponseSchema = exports.VaultResolveResponseSchema = exports.VaultResolveParamsSchema = void 0;
const zod_1 = require("zod");
const vault_tier_js_1 = require("../../vault/vault-tier.cjs");
/**
 * GET /resolve/:agentId/:key — resolve a single credential from the Forge vault via
 * 3-tier cascade (platform < owner < agent).
 * Direction: X9 capabilities (cap-scheduler, cap-voice, cap-glasses, cap-websocket,
 *            agent-core, cap-briefing cron) -> Forge vault-svc
 * Auth: X-Internal-Token (INTERNAL_TOKEN_HEADER)
 * Requirement: HTTP-12 (Phase 38 — centralized voice credential resolution)
 *
 * Incident reference: 2026-04-17 Phase 38 Wave 1 R-14 violation — VaultClient
 * was shipped in @x9/capability-sdk with an inline `z.enum(["agent","owner","platform"])`
 * (wrong-ordered vs bridge `['platform','owner','agent']`), a literal `"X-Internal-Token"`
 * string, and no endpoint contract for this URL. This contract closes that gap
 * and is the single source of truth for every capability calling the vault.
 *
 * Response shapes:
 *   200 — `{ ok: true, key, value, tier }` where tier is the cascade tier that
 *         answered the lookup (imported from `@x9-forge/contracts/vault`).
 *   404 — `{ ok: false, error }` when the key was not found in any tier.
 *
 * Security contract (ASVS V7, mirrored by the capability-sdk VaultClient):
 *   - `value` crosses the trust boundary only; callers MUST NOT log it.
 *   - Token auth is header-only; token MUST NOT appear in the URL.
 *
 * @see packages/capability-sdk/src/vault-client.ts (consumer)
 * @see forge-v2 services/vault/src/repositories/vault.repo.ts (producer)
 */
/** Path params for GET /resolve/:agentId/:key. */
exports.VaultResolveParamsSchema = zod_1.z.object({
    /** Numeric forge agent id, URL-encoded into the path. */
    agentId: zod_1.z.string().regex(/^\d+$/),
    /** Credential key. Callers must URL-encode this before constructing the path. */
    key: zod_1.z.string().min(1),
});
/** 200 response — credential resolved by the cascade. */
exports.VaultResolveResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    key: zod_1.z.string().min(1),
    value: zod_1.z.string(),
    tier: vault_tier_js_1.VaultTierSchema,
});
/** 404 response — key not found in any tier. */
exports.VaultResolveNotFoundResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string().min(1),
});
/** Shared error-response alias for non-200 bodies (currently only 404 is specified). */
exports.VaultResolveErrorResponseSchema = exports.VaultResolveNotFoundResponseSchema;
exports.vaultResolveContract = {
    method: 'GET',
    path: '/resolve/:agentId/:key',
    authType: 'token',
    paramsSchema: exports.VaultResolveParamsSchema,
    responseSchema: exports.VaultResolveResponseSchema,
};
//# sourceMappingURL=vault-resolve.js.map