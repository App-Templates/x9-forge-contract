import { z } from 'zod';
/**
 * IncomingMessageEnvelope — normalized inbound message at the X9-internal
 * boundary, emitted by:
 *   - cap-email after Svix-validated AgentMail `message.received` webhook
 *   - telegram-router-svc after grammy-validated bot update
 *   - (future) cap-whatsapp after its provider webhook normalization
 *
 * **STRICT by design** — boundary contract between channel adapters and
 * agent-core / Parallel routing. No `.passthrough()`. Every field validated.
 * Bug #15-style silent drift MUST fail at compile time (R-14).
 *
 * The companion to `capability/voice/normalized-event.ts` for non-voice
 * channels. Voice keeps its own envelope because the post-call shape
 * carries call-specific fields (transcript, conversation_id, analysis).
 *
 * Resolution lifecycle (filled progressively by the receiving pipeline):
 *   1. Channel adapter assembles the envelope with `agent_id?/owner_id?/
 *      session_id?` set to null when not yet known (e.g. router-svc only
 *      knows the bot token at receipt — agentId resolution happens via
 *      `to.address` + bot↔agent map upstream).
 *   2. Resolver (agent-core or Parallel) fills the optional fields, then
 *      dispatches downstream.
 *   3. Once forwarded to `/internal/turn`, all 3 resolution fields MUST be
 *      non-null (enforced by the consumer, not by this schema, to keep the
 *      envelope reusable at every pipeline stage).
 *
 * Provider-specific raw payload is preserved verbatim in `raw_provider_event`
 * (z.unknown — LENIENT escape hatch). Consumers branch on `provider` literal
 * to narrow the unknown to the provider's actual shape.
 *
 * @see docs/adr/ADR-cap-voice.md §6.4 (HMAC validation gate — sibling pattern)
 * @see capability/voice/normalized-event.ts (voice analogue with `signature_valid`)
 */
export declare const IncomingMessageEnvelopeSchema: z.ZodObject<{
    message_id: z.ZodString;
    channel: z.ZodEnum<{
        email: "email";
        telegram: "telegram";
        voice: "voice";
        whatsapp: "whatsapp";
    }>;
    provider: z.ZodEnum<{
        elevenlabs: "elevenlabs";
        telegram: "telegram";
        agentmail: "agentmail";
        whatsapp_cloud: "whatsapp_cloud";
    }>;
    agent_id: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "AgentId", "out">>;
    owner_id: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
    tenant_id: z.ZodNullable<z.ZodString>;
    session_id: z.ZodNullable<z.ZodString>;
    from: z.ZodString;
    to: z.ZodString;
    cc: z.ZodDefault<z.ZodArray<z.ZodString>>;
    body_text: z.ZodString;
    body_html: z.ZodNullable<z.ZodString>;
    attachments: z.ZodArray<z.ZodObject<{
        mime: z.ZodString;
        filename: z.ZodNullable<z.ZodString>;
        size_bytes: z.ZodNullable<z.ZodNumber>;
        url: z.ZodNullable<z.ZodString>;
        inline_b64: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    reply_to_message_id: z.ZodNullable<z.ZodString>;
    received_at: z.ZodString;
    provider_event_hash: z.ZodString;
    signature_valid: z.ZodLiteral<true>;
    raw_provider_event: z.ZodUnknown;
}, z.core.$strip>;
export type IncomingMessageEnvelope = z.infer<typeof IncomingMessageEnvelopeSchema>;
//# sourceMappingURL=incoming-message-envelope.d.ts.map