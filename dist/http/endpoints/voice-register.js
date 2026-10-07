import { z } from 'zod';
import { OutboundCallerIdentitySchema } from "../../capability/voice/agent-voice-settings.js";
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
export const VoiceRegisterRequestSchema = z.object({
    agentId: z.string().min(1),
    conversationId: z.string().min(1),
    /** Authoritative caller identity when present; agentId remains the legacy Forge management id. */
    caller: OutboundCallerIdentitySchema.optional(),
}).superRefine((request, ctx) => {
    if (request.caller && request.agentId !== request.caller.agent.managementAgentId) {
        ctx.addIssue({ code: 'custom', path: ['agentId'], message: 'Legacy agent id differs from caller management identity' });
    }
});
export const VoiceRegisterResponseSchema = z.object({
    ok: z.literal(true),
});
export const VoiceRegisterErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.string(),
});
export const voiceRegisterContract = {
    method: 'POST',
    path: '/api/voice/register',
    authType: 'token',
    bodySchema: VoiceRegisterRequestSchema,
    responseSchema: VoiceRegisterResponseSchema,
};
//# sourceMappingURL=voice-register.js.map