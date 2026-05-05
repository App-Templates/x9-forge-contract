"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceRegisterContract = exports.VoiceRegisterErrorResponseSchema = exports.VoiceRegisterResponseSchema = exports.VoiceRegisterRequestSchema = void 0;
const zod_1 = require("zod");
/**
 * POST /api/voice/register — register a voice session before a call completes.
 * Direction: X9 cap-voice -> Forge voice-svc
 * Auth: X-Internal-Token (FORGE_VOICE_REGISTER_TOKEN / VOICE_REGISTER_TOKEN)
 * Requirement: HTTP-11
 *
 * This is the ONLY X9 -> Forge endpoint. All other cross-repo endpoints are
 * Forge -> X9.
 *
 * Real registerBodySchema from voice-svc (forge-v2 services/voice/src/routes/voice.ts:23-26):
 *   - agentId: string min 1 (numeric Forge agent ID as string)
 *   - conversationId: string min 1 (ElevenLabs conversation ID)
 *
 * Response: `{ ok: true }` on success, `{ ok: false, error }` on failure.
 * 409 returned when VOICE-02 duplicate registration detected.
 */
exports.VoiceRegisterRequestSchema = zod_1.z.object({
    agentId: zod_1.z.string().min(1),
    conversationId: zod_1.z.string().min(1),
});
exports.VoiceRegisterResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
});
exports.VoiceRegisterErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.string(),
});
exports.voiceRegisterContract = {
    method: 'POST',
    path: '/api/voice/register',
    authType: 'token',
    bodySchema: exports.VoiceRegisterRequestSchema,
    responseSchema: exports.VoiceRegisterResponseSchema,
};
//# sourceMappingURL=voice-register.js.map