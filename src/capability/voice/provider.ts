import { z } from 'zod';

/**
 * Voice-call provider lane (Phase 50, 2026-09-12).
 *
 *   - `elevenlabs`  — ElevenLabs Conversational AI over its SIP trunk (the
 *                     original path; ElevenLabs owns media + turn-taking).
 *   - `openai_live` — OpenAI GPT-Live-1 (`wss://api.openai.com/v1/live/sessions`,
 *                     full-duplex) with Telnyx as the PSTN originator and
 *                     `services/cap-voice-live` as the media bridge.
 *
 * Shared across cap-voice (selects the lane), cap-voice-live (executes it),
 * Forge voice-svc (reads `provider` on normalized events) and the `calls`
 * table — hence declared here (R-14: no inline `z.enum` for shared states).
 */
export const VoiceProviderSchema = z.enum(['elevenlabs', 'openai_live']);
export type VoiceProvider = z.infer<typeof VoiceProviderSchema>;

/** GPT-Live model id (developers.openai.com/api/docs/models/gpt-live-1). */
export const OPENAI_LIVE_MODEL = 'gpt-live-1';
/** Stock OpenAI voice recommended by the docs for quality. */
export const OPENAI_LIVE_DEFAULT_VOICE = 'marin';
/**
 * Backend model for `delegation.responses` (reasoning + tool selection).
 * Default per developers.openai.com/api/docs/guides/live-delegation (2026-09);
 * overridable per agent via `OPENAI_LIVE_BACKEND_MODEL`.
 */
export const OPENAI_LIVE_DEFAULT_BACKEND_MODEL = 'gpt-5.6-terra';
