import { z } from 'zod';
/**
 * ElevenLabs webhook event schemas (ADR §5.3 / §6.3 / D-05).
 *
 * **LENIENT by design** per `feedback_external_provider_schema_lenient.md`:
 * ElevenLabs changes payload shape silently (see 2026-04-19 cap-voice post-call
 * transcript-array regression). These schemas use `z.unknown()` + `.passthrough()`
 * so the bridge NEVER rejects a provider-side drift — normalization happens
 * at the consumer boundary in Forge voice-svc (Plan 03).
 *
 * Contrast with `normalized-event.ts` which is STRICT — that is the internal
 * X9↔Forge contract, where Bug #15-style silent drift would be catastrophic.
 *
 * @see docs/adr/ADR-cap-voice.md §6.3 (webhook event handling)
 * @see feedback_external_provider_schema_lenient.md
 */
/**
 * Canonical event-type enum. Named schema (not inline) so consumers can
 * reference `ElevenLabsWebhookEventTypeSchema` — R-14 compliance.
 */
export const ElevenLabsWebhookEventTypeSchema = z.enum([
    'post_call_transcription',
    'post_call_audio',
    'call_initiation_failure',
]);
/**
 * post_call_transcription — transcript + metadata + analysis + success eval.
 *
 * `data` is intentionally `z.unknown()` — ElevenLabs nests everything under
 * `data.*` and the inner shape drifts (transcript has been string AND array;
 * analysis gains/loses fields across deployments).
 */
export const ElevenLabsPostCallTranscriptionEventSchema = z
    .object({
    type: z.literal('post_call_transcription'),
    event_timestamp: z.number().optional(),
    data: z.unknown(),
})
    .passthrough();
/**
 * post_call_audio — base64 audio payload. Per ADR §16.4 / D-26 audio is
 * NOT stored by default; the consumer (Forge voice-svc) persists metadata only.
 */
export const ElevenLabsPostCallAudioEventSchema = z
    .object({
    type: z.literal('post_call_audio'),
    event_timestamp: z.number().optional(),
    data: z.unknown(),
})
    .passthrough();
/**
 * call_initiation_failure — outbound call could not be placed. cap-voice
 * releases any pending holds + notifies Stefano; NO Memory ingestion (D-23).
 */
export const ElevenLabsCallInitiationFailureEventSchema = z
    .object({
    type: z.literal('call_initiation_failure'),
    event_timestamp: z.number().optional(),
    data: z.unknown(),
})
    .passthrough();
//# sourceMappingURL=webhook-events.js.map