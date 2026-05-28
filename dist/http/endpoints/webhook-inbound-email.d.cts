import { z } from 'zod';
/**
 * POST /webhook/agentmail/inbound — AgentMail inbound email webhook receiver,
 * mounted on X9 `cap-email`. AgentMail emits **Svix-signed** events (headers
 * `svix-id`, `svix-timestamp`, `svix-signature`) with `eventType ∈
 * { 'message.received', 'message.sent', 'message.delivered', 'message.bounced',
 * 'message.complained', 'message.rejected', 'domain.verified' }`. Phase 11.A
 * only routes `message.received` downstream; the other event types are
 * acknowledged (200) and logged for observability without triggering an
 * agent turn.
 *
 * Direction:   AgentMail (external) → X9 cap-email
 * Auth:        `external_provider` — Svix signature verification owned by
 *              cap-email (uses `svix` npm package). Bridge does NOT type the
 *              signature shape (mirrors the precedent of cap-voice's direct
 *              ElevenLabs HMAC path, see
 *              `http/endpoints/webhook-post-call.ts:6` JSDoc).
 *              The Svix secret (`AGENTMAIL_WEBHOOK_SECRET`) is service-local
 *              in cap-email `env.ts` with `@bridge-optout` documentation —
 *              this matches the `ELEVENLABS_WEBHOOK_SECRET` exclusion pattern
 *              in `agent-credentials.ts:67-79`.
 * Body:        Raw AgentMail event payload (`z.unknown()` — lenient external
 *              shape; cap-email narrows via the `eventType` discriminator).
 * Response:    `{ received: true }` — fire-and-forget; agent turn dispatch
 *              happens asynchronously after the envelope is constructed and
 *              forwarded to `/internal/turn`.
 *
 * AgentMail retry semantics: same Svix-id reused; cap-email MUST keep an
 * idempotency table keyed on `svix-id` (or `provider_event_hash` from the
 * normalized envelope). Reuses the `x9-memory` Postgres with schema
 * `cap_email_inbound` per Phase 11 D2 decision.
 */
export declare const WebhookInboundEmailRequestSchema: z.ZodUnknown;
export declare const WebhookInboundEmailResponseSchema: z.ZodObject<{
    received: z.ZodLiteral<true>;
}, z.core.$strip>;
export type WebhookInboundEmailResponse = z.infer<typeof WebhookInboundEmailResponseSchema>;
/**
 * Optional STRICT shape used INTERNALLY by cap-email after Svix verification +
 * normalization (re-exported for symmetry with the telegram contract — not the
 * wire body).
 */
export declare const WebhookInboundEmailNormalizedSchema: z.ZodObject<{
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
export type WebhookInboundEmailNormalized = z.infer<typeof WebhookInboundEmailNormalizedSchema>;
export declare const webhookInboundEmailContract: {
    readonly method: "POST";
    readonly path: "/webhook/agentmail/inbound";
    /** Svix HMAC signature — provider-managed, not bridge-typed. */
    readonly authType: "external_provider";
    readonly bodySchema: z.ZodUnknown;
    readonly responseSchema: z.ZodObject<{
        received: z.ZodLiteral<true>;
    }, z.core.$strip>;
};
//# sourceMappingURL=webhook-inbound-email.d.ts.map