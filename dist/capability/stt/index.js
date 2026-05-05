/**
 * Speech-to-text capability contracts — sub-path `@x9-forge/contracts/capability/stt`.
 *
 * Back-fills the previously-dangling ./capability/stt subpath that was declared
 * in package.json since bridge commit 43f7ef5 ("Phase 47.0 Plan 03 unblock") but
 * had no source file. Active consumers (verified 2026-05-05 via cross-repo grep):
 *
 *   - agent-x9/services/cap-stt/src/manifest.ts                  (CAP_STT_DEFAULT_PORT)
 *   - agent-x9/services/cap-stt/src/routes/transcribe.ts         (TranscribeRequestSchema, TranscribeResponseSchema, TranscribeResponse)
 *   - agent-x9/services/cap-stt/src/providers/openai.ts          (TranscribeResponse type only)
 *   - agent-x9/services/cap-stt/src/providers/elevenlabs.ts      (TranscribeResponse type only)
 *
 * Schema shapes mirror what those consumers actually destructure / return:
 *
 *   TranscribeRequest:  { telegramFileUrl, durationSec, mimeType? }
 *   TranscribeResponse: { text, language, durationSec, provider: "openai" | "elevenlabs" }
 *
 * Phase 18.1 closure: the dual ESM+CJS build (zshy) requires every "exports"
 * key to back a real source file or the toolchain reports an error. Resolves
 * CONTEXT.md SC-1 and RESEARCH.md Pitfall #2.
 *
 * R-13 minimality: only what the 4 import sites consume is exported. Add new
 * fields as new consumers appear; do not speculate.
 *
 * R-14: this is the canonical contract for cross-repo STT shapes. agent-x9
 * cap-stt service uses TranscribeRequestSchema for input validation and
 * TranscribeResponseSchema for provider-output shape guard. Any change here
 * is a contract change for that service.
 *
 * Portable .d.ts emit: named `z` import keeps emitted declarations as
 * `z.ZodObject<...>` (not synthesized inline-import paths). Required by
 * scripts/check-portable-dts.mjs (TS2883 guardrail, Phase 18-04 → 18.1).
 */
import { z } from 'zod';
/**
 * Default TCP port the cap-stt service listens on inside the X9 docker network.
 * Used by services/cap-stt/src/manifest.ts to build the capability endpoint URL
 * (`http://cap-stt:${CAP_STT_DEFAULT_PORT}`).
 */
export const CAP_STT_DEFAULT_PORT = 4011;
/**
 * STT provider identifier returned by the capability response. Two providers
 * supported in Phase 47.x: ElevenLabs Scribe v1 (primary) + OpenAI Whisper
 * (fallback).
 */
export const TranscribeProviderSchema = z.enum(['elevenlabs', 'openai']);
/**
 * STT request envelope. Sent as the `input` field of a ToolCallRequest to
 * `POST /call/transcribe` on cap-stt. Validated by
 * services/cap-stt/src/routes/transcribe.ts against this exact schema.
 *
 * Fields:
 *   - telegramFileUrl: HTTPS Telegram-signed URL (api.telegram.org) for the
 *                       voice OGG audio to transcribe. SSRF-guarded by
 *                       cap-stt's telegramFetcher (must match Telegram domain).
 *   - durationSec:     Reported audio duration from Telegram metadata.
 *                       Hard-capped at 60s upstream by agent-core.
 *   - mimeType:        Optional MIME hint. Default applied by cap-stt is
 *                       "audio/ogg" if absent or empty.
 */
export const TranscribeRequestSchema = z.object({
    telegramFileUrl: z.string().url(),
    durationSec: z.number().int().nonnegative().max(60),
    mimeType: z.string().min(1).optional(),
});
/**
 * STT response envelope. Returned in the `output` field of a successful
 * ToolCallResponse from `POST /call/transcribe`. Both provider implementations
 * (services/cap-stt/src/providers/{openai,elevenlabs}.ts) construct values of
 * this exact shape; cap-stt's route handler validates against this schema
 * before forwarding to agent-core (shape guard against external API drift).
 *
 * Fields:
 *   - text:        Transcribed text content. Non-empty on success.
 *   - language:    ISO-639-1 2-char code (e.g. "it", "en"). Normalized by the
 *                   provider implementation (LANGUAGE_NORMALIZE in openai.ts;
 *                   first-2-chars in elevenlabs.ts).
 *   - durationSec: Audio duration as reported by the provider when available,
 *                   otherwise echoes the request `durationSec`.
 *   - provider:    Which provider produced the transcription (informational +
 *                   used by agent-core observability metrics).
 */
export const TranscribeResponseSchema = z.object({
    text: z.string().min(1),
    language: z.string().min(2),
    durationSec: z.number().int().nonnegative(),
    provider: TranscribeProviderSchema,
});
//# sourceMappingURL=index.js.map