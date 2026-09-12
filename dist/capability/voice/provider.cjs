"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_LIVE_DEFAULT_BACKEND_MODEL = exports.OPENAI_LIVE_DEFAULT_VOICE = exports.OPENAI_LIVE_MODEL = exports.VoiceProviderSchema = void 0;
const zod_1 = require("zod");
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
exports.VoiceProviderSchema = zod_1.z.enum(['elevenlabs', 'openai_live']);
/** GPT-Live model id (developers.openai.com/api/docs/models/gpt-live-1). */
exports.OPENAI_LIVE_MODEL = 'gpt-live-1';
/** Stock OpenAI voice recommended by the docs for quality. */
exports.OPENAI_LIVE_DEFAULT_VOICE = 'marin';
/**
 * Backend model for `delegation.responses` (reasoning + tool selection).
 * Default per developers.openai.com/api/docs/guides/live-delegation (2026-09);
 * overridable per agent via `OPENAI_LIVE_BACKEND_MODEL`.
 */
exports.OPENAI_LIVE_DEFAULT_BACKEND_MODEL = 'gpt-5.6-terra';
//# sourceMappingURL=provider.js.map