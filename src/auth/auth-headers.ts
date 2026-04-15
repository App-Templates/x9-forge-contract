import { z } from 'zod';

/**
 * Literal header names for internal auth.
 * Discriminated: X-Internal-Secret (Forge -> X9 agent-core /internal/* routes)
 * vs X-Internal-Token (inter-service s2s and cross-repo voice/webhook flows).
 *
 * The bridge types the header SHAPE (compile-time safety), not the comparison
 * implementation. Each service owns its own timing-safe validation logic.
 */
export const INTERNAL_SECRET_HEADER = 'X-Internal-Secret' as const;
export const INTERNAL_TOKEN_HEADER = 'X-Internal-Token' as const;

/**
 * Auth header for X9 agent-core /internal/* routes.
 * Used by Forge factory-svc X9Client to call reload, stop, listAgents, turn, query.
 * Env var (caller side): X9_INTERNAL_SECRET (Forge) / INTERNAL_SECRET (X9 internal).
 */
export const AuthInternalSecretSchema = z.object({
  'X-Internal-Secret': z.string().min(1),
});
export type AuthInternalSecret = z.infer<typeof AuthInternalSecretSchema>;

/**
 * Auth header for inter-service and cross-repo token-based auth.
 * Used by Forge voice-svc -> X9 cap-voice /webhook/post-call (Bug #15 endpoint),
 * X9 cap-voice -> Forge voice-svc /api/voice/register,
 * Forge factory -> docker-svc, vault-svc, mc-env routes.
 * Env var (caller side): varies per use case (INTERNAL_SERVICE_TOKEN,
 * FORGE_VOICE_REGISTER_TOKEN, X9_INTERNAL_SECRET from vault).
 */
export const AuthInternalTokenSchema = z.object({
  'X-Internal-Token': z.string().min(1),
});
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
 * Used by endpoint contracts (Phase 4) to annotate required auth type.
 */
export type EndpointAuthType = 'secret' | 'token' | 'none';
