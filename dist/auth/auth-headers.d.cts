import { z } from 'zod';
/**
 * Literal header names for internal auth.
 * Discriminated: X-Internal-Secret (Forge -> X9 agent-core /internal/* routes)
 * vs X-Internal-Token (inter-service s2s and cross-repo voice/webhook flows).
 *
 * The bridge types the header SHAPE (compile-time safety), not the comparison
 * implementation. Each service owns its own timing-safe validation logic.
 */
export declare const INTERNAL_SECRET_HEADER: "X-Internal-Secret";
export declare const INTERNAL_TOKEN_HEADER: "X-Internal-Token";
/**
 * Auth header for X9 agent-core /internal/* routes.
 * Used by Forge factory-svc X9Client to call reload, stop, listAgents, turn, query.
 * Env var (caller side): X9_INTERNAL_SECRET (Forge) / INTERNAL_SECRET (X9 internal).
 */
export declare const AuthInternalSecretSchema: z.ZodObject<{
    'X-Internal-Secret': z.ZodString;
}, z.core.$strip>;
export type AuthInternalSecret = z.infer<typeof AuthInternalSecretSchema>;
/**
 * Auth header for inter-service and cross-repo token-based auth.
 * Used by Forge voice-svc -> X9 cap-voice /webhook/post-call (Bug #15 endpoint),
 * X9 cap-voice -> Forge voice-svc /api/voice/register,
 * Forge factory -> docker-svc, vault-svc, mc-env routes.
 * Env var (caller side): varies per use case (INTERNAL_SERVICE_TOKEN,
 * FORGE_VOICE_REGISTER_TOKEN, X9_INTERNAL_SECRET from vault).
 */
export declare const AuthInternalTokenSchema: z.ZodObject<{
    'X-Internal-Token': z.ZodString;
}, z.core.$strip>;
export type AuthInternalToken = z.infer<typeof AuthInternalTokenSchema>;
/**
 * No auth required. Used by capability discovery endpoints:
 * `GET /manifest`, `GET /env-schema`, `GET /health` (capability identity is
 * conveyed by the caller's baseUrl, not a path prefix).
 */
export type AuthNone = Record<string, never>;
/**
 * Discriminated union of all auth header types.
 * Each endpoint contract declares which auth it requires.
 */
export type AuthHeaders = AuthInternalSecret | AuthInternalToken | AuthNone;
/**
 * String literal union for endpoint auth requirement declarations.
 * Used by endpoint contracts (Phase 4 onward) to annotate required auth type.
 *
 * Values:
 *   - `'secret'`            — X-Internal-Secret header (Forge→X9 `/internal/*`)
 *   - `'token'`             — X-Internal-Token header (cross-repo s2s,
 *                             Bug #15 endpoint family — preserve this meaning
 *                             strictly; don't dilute with provider webhooks)
 *   - `'none'`              — no auth (discovery endpoints)
 *   - `'external_provider'` — auth supplied by an external provider's own
 *                             scheme (Svix HMAC for AgentMail, Telegram bot
 *                             secret-token, ElevenLabs HMAC). The bridge
 *                             does NOT type the header shape — each consumer
 *                             owns its own provider-specific verification
 *                             (matches the precedent of cap-voice's direct
 *                             ElevenLabs HMAC path, see
 *                             `http/endpoints/webhook-post-call.ts:6`).
 *                             Added in Phase 11.A (v1.8.0) for inbound
 *                             webhooks from AgentMail + Telegram.
 */
export type EndpointAuthType = 'secret' | 'token' | 'none' | 'external_provider';
//# sourceMappingURL=auth-headers.d.ts.map