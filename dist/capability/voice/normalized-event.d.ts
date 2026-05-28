import { z } from 'zod';
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
export declare const ForgeVoiceWebhookNormalizedEventSchema: z.ZodObject<{
    call_id: z.ZodString;
    agent_id: z.ZodString;
    owner_id: z.ZodString;
    tenant_id: z.ZodString;
    conversation_id: z.ZodString;
    event_type: z.ZodEnum<{
        post_call_transcription: "post_call_transcription";
        post_call_audio: "post_call_audio";
        call_initiation_failure: "call_initiation_failure";
    }>;
    received_at: z.ZodString;
    forwarded_at: z.ZodOptional<z.ZodString>;
    raw_event_hash: z.ZodString;
    signature_valid: z.ZodLiteral<true>;
    provider: z.ZodLiteral<"elevenlabs">;
    payload: z.ZodUnknown;
    failure_reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ForgeVoiceWebhookNormalizedEvent = z.infer<typeof ForgeVoiceWebhookNormalizedEventSchema>;
//# sourceMappingURL=normalized-event.d.ts.map