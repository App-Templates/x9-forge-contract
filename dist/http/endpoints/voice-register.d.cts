import { z } from 'zod';
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
export declare const VoiceRegisterRequestSchema: z.ZodObject<{
    agentId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strip>;
export type VoiceRegisterRequest = z.infer<typeof VoiceRegisterRequestSchema>;
export declare const VoiceRegisterResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
export type VoiceRegisterResponse = z.infer<typeof VoiceRegisterResponseSchema>;
export declare const VoiceRegisterErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type VoiceRegisterErrorResponse = z.infer<typeof VoiceRegisterErrorResponseSchema>;
export declare const voiceRegisterContract: {
    readonly method: "POST";
    readonly path: "/api/voice/register";
    readonly authType: "token";
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
    }, z.core.$strip>;
};
//# sourceMappingURL=voice-register.d.ts.map