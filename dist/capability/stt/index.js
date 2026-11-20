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
 * Phase 50 (2026-09-12) — which provider cap-stt tries FIRST. The other one
 * stays the automatic fallback. Same enum as `TranscribeProviderSchema`; the
 * value travels Forge vault → cap-stt (`STT_PRIMARY_PROVIDER`), hence declared
 * here (R-14). Default preserves today's behaviour (ElevenLabs Scribe first).
 */
export const DEFAULT_STT_PRIMARY_PROVIDER = 'elevenlabs';
/**
 * OpenAI transcription model used by cap-stt's OpenAI provider when it is
 * PRIMARY (Phase 50). `gpt-transcribe` is OpenAI's recommended file model
 * (developers.openai.com/api/docs/models/gpt-transcribe, 2026-09). `whisper-1`
 * remains the model for the legacy fallback path.
 */
export const OPENAI_STT_DEFAULT_MODEL = 'gpt-transcribe';
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
/** Cost boundary for media-file transcription, independent of the Telegram limit. */
export const STT_MEDIA_MAX_DURATION_SEC = 600;
/**
 * Validate only URL syntax. The consuming service must enforce its domain allowlist
 * and reject internal addresses before fetching media, including after redirects.
 */
export const TranscribeMediaUrlSchema = z.string().max(2000).refine(value => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && url.username === '' && url.password === ''
            && !value.includes('#');
    }
    catch {
        return false;
    }
}, { message: 'Expected an HTTPS media URL without credentials or a fragment' });
/** Identity is supplied by the authenticated ToolCallRequest envelope. */
export const TranscribeMediaRequestSchema = z.strictObject({
    mediaUrl: TranscribeMediaUrlSchema,
    durationSec: z.number().int().nonnegative().max(STT_MEDIA_MAX_DURATION_SEC),
    mimeType: z.string().min(1).optional(),
    languageHint: z.string().regex(/^[a-z]{2}$/).optional(),
});
/**
 * Select the source before parsing: the legacy Telegram schema strips unknown
 * fields, so parsing it first could silently discard an ambiguous media source.
 * Both sources keep the existing TranscribeResponseSchema and provider choices.
 */
export function parseTranscribeInput(raw) {
    try {
        if (typeof raw === 'object' && raw !== null) {
            if ('telegramFileUrl' in raw && 'mediaUrl' in raw) {
                return { ok: false, error: 'transcribe_source_ambiguous' };
            }
            if ('mediaUrl' in raw) {
                const parsed = TranscribeMediaRequestSchema.safeParse(raw);
                return parsed.success
                    ? { ok: true, kind: 'media', request: parsed.data }
                    : { ok: false, error: 'invalid_transcribe_input' };
            }
        }
        const parsed = TranscribeRequestSchema.safeParse(raw);
        return parsed.success
            ? { ok: true, kind: 'telegram', request: parsed.data }
            : { ok: false, error: 'invalid_transcribe_input' };
    }
    catch {
        // Unknown input may contain throwing getters or proxies; never expose them.
        return { ok: false, error: 'invalid_transcribe_input' };
    }
}
//# sourceMappingURL=index.js.map