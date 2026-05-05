"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthInternalTokenSchema = exports.AuthInternalSecretSchema = exports.INTERNAL_TOKEN_HEADER = exports.INTERNAL_SECRET_HEADER = void 0;
const zod_1 = require("zod");
/**
 * Literal header names for internal auth.
 * Discriminated: X-Internal-Secret (Forge -> X9 agent-core /internal/* routes)
 * vs X-Internal-Token (inter-service s2s and cross-repo voice/webhook flows).
 *
 * The bridge types the header SHAPE (compile-time safety), not the comparison
 * implementation. Each service owns its own timing-safe validation logic.
 */
exports.INTERNAL_SECRET_HEADER = 'X-Internal-Secret';
exports.INTERNAL_TOKEN_HEADER = 'X-Internal-Token';
/**
 * Auth header for X9 agent-core /internal/* routes.
 * Used by Forge factory-svc X9Client to call reload, stop, listAgents, turn, query.
 * Env var (caller side): X9_INTERNAL_SECRET (Forge) / INTERNAL_SECRET (X9 internal).
 */
exports.AuthInternalSecretSchema = zod_1.z.object({
    'X-Internal-Secret': zod_1.z.string().min(1),
});
/**
 * Auth header for inter-service and cross-repo token-based auth.
 * Used by Forge voice-svc -> X9 cap-voice /webhook/post-call (Bug #15 endpoint),
 * X9 cap-voice -> Forge voice-svc /api/voice/register,
 * Forge factory -> docker-svc, vault-svc, mc-env routes.
 * Env var (caller side): varies per use case (INTERNAL_SERVICE_TOKEN,
 * FORGE_VOICE_REGISTER_TOKEN, X9_INTERNAL_SECRET from vault).
 */
exports.AuthInternalTokenSchema = zod_1.z.object({
    'X-Internal-Token': zod_1.z.string().min(1),
});
//# sourceMappingURL=auth-headers.js.map