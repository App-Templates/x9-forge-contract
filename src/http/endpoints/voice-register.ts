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

export const VoiceRegisterRequestSchema = z.object({
  agentId: z.string().min(1),
  conversationId: z.string().min(1),
});
export type VoiceRegisterRequest = z.infer<typeof VoiceRegisterRequestSchema>;

export const VoiceRegisterResponseSchema = z.object({
  ok: z.literal(true),
});
export type VoiceRegisterResponse = z.infer<typeof VoiceRegisterResponseSchema>;

export const VoiceRegisterErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});
export type VoiceRegisterErrorResponse = z.infer<typeof VoiceRegisterErrorResponseSchema>;

export const voiceRegisterContract = {
  method: 'POST' as const,
  path: '/api/voice/register' as const,
  authType: 'token' as const,
  bodySchema: VoiceRegisterRequestSchema,
  responseSchema: VoiceRegisterResponseSchema,
} as const;
