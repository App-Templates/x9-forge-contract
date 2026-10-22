import { z } from 'zod';
import { ForgeVoiceWebhookNormalizedEventSchema } from "./normalized-event.js";
/**
 * Internal post-call ingest contract — Forge voice-svc -> cap-voice.
 *
 * cap-voice mounts `POST /internal/voice/post-call` (path exported from
 * `http/endpoints/voice.ts`) protected by `X-Internal-Token`. Forge forwards
 * the normalized event and waits only for synchronous persistence ACK;
 * Memory v2 ingestion + follow-up jobs are fire-and-forget (D-24).
 *
 * @see docs/adr/ADR-cap-voice.md §5.2 (CapVoicePostCallIngestRequestSchema / ResponseSchema)
 * @see docs/adr/ADR-cap-voice.md §6.2 (internal endpoint)
 * @see docs/adr/ADR-cap-voice.md §6.5 / D-08 (ACK rule)
 */
export const CapVoicePostCallIngestRequestSchema = z.object({
    /** Normalized event — STRICT schema, must pass structural validation. */
    normalized_event: ForgeVoiceWebhookNormalizedEventSchema,
});
/** Ingest outcome discriminator. */
export const CapVoiceIngestStatusSchema = z.enum([
    'processed',
    'duplicate',
    'rejected',
    'deferred',
]);
export const CapVoicePostCallIngestResponseSchema = z.object({
    accepted: z.boolean(),
    call_id: z.string().min(1),
    status: CapVoiceIngestStatusSchema,
    /** Populated when `accepted=false` (reason) or deferred with retry guidance. */
    error: z.string().optional(),
});
//# sourceMappingURL=ingest.js.map