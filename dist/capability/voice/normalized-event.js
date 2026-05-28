import { z } from 'zod';
import { ElevenLabsWebhookEventTypeSchema } from "./webhook-events.js";
/**
 * Normalized voice webhook event — emitted by Forge voice-svc after HMAC
 * validation + conversation->agent routing + vault credential lookup, and
 * consumed by cap-voice `POST /internal/voice/post-call`.
 *
 * **STRICT by design** — this is the internal X9↔Forge boundary. No
 * `.passthrough()`. Every field is validated. Bug #15-style silent drift
 * MUST fail at compile time (R-14).
 *
 * Contrast with `webhook-events.ts` (LENIENT, for external ElevenLabs inputs).
 *
 * @see docs/adr/ADR-cap-voice.md §5.2 (required bridge exports)
 * @see docs/adr/ADR-cap-voice.md §6.4 (HMAC validation gate)
 * @see docs/adr/ADR-cap-voice.md §7 / D-09 (signature_valid is mandatory)
 */
export const ForgeVoiceWebhookNormalizedEventSchema = z.object({
    /** Canonical call id derived from conversation_id → voice_sessions mapping. */
    call_id: z.string().min(1),
    /** Forge agent id (resolved from conversation_id via voice_sessions). */
    agent_id: z.string().min(1),
    /** Owner (tenant user) id. */
    owner_id: z.string().min(1),
    /** Tenant id (multi-tenant scoping). */
    tenant_id: z.string().min(1),
    /** ElevenLabs conversation id — preserved for traceability. */
    conversation_id: z.string().min(1),
    /** Which ElevenLabs event triggered this normalized payload. */
    event_type: ElevenLabsWebhookEventTypeSchema,
    /** RFC-3339 timestamp when Forge received the webhook. */
    received_at: z.string().datetime({ offset: true }),
    /** RFC-3339 timestamp when Forge forwarded to cap-voice. */
    forwarded_at: z.string().datetime({ offset: true }).optional(),
    /** SHA-256 hash of the raw ElevenLabs payload (for dedupe + audit). */
    raw_event_hash: z.string().min(1),
    /**
     * HMAC signature validity. Literal true — Forge MUST NOT forward an
     * invalid-signature event (D-06 no-fallback rule). If false surfaces
     * here it's a Forge bug, caught by this strict schema.
     */
    signature_valid: z.literal(true),
    /** Webhook provider — literal "elevenlabs" today; extensible later. */
    provider: z.literal('elevenlabs'),
    /**
     * Event-type-specific payload. Kept as `unknown` at the bridge boundary
     * because cap-voice narrows via `event_type` discriminator internally;
     * consumer code can safely treat this as the raw ElevenLabs `data.*`.
     */
    payload: z.unknown(),
    /** For `call_initiation_failure` — structured failure reason. */
    failure_reason: z.string().optional(),
});
//# sourceMappingURL=normalized-event.js.map