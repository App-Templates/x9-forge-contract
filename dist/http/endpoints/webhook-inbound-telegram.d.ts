import { z } from 'zod';
/**
 * POST /webhook/inbound/telegram — Telegram bot update receiver, mounted on
 * the Phase 11 `telegram-router-svc`. Telegram delivers a raw `Update`
 * object via long-poll OR webhook (router-svc supports both modes
 * internally); after grammy validates the secret-token header
 * (`X-Telegram-Bot-Api-Secret-Token`), the update is normalized into an
 * `IncomingMessageEnvelope` and forwarded to agent-core
 * `/internal/turn` for processing.
 *
 * Direction:   Telegram → X9 telegram-router-svc
 * Auth:        `external_provider` — secret-token header set by Telegram
 *              per-bot via setWebhook `secret_token` param (NOT bridge-typed
 *              because it's a provider-set header, not an X9 internal token;
 *              dilutes Bug #15 semantics to reuse `'token'` here).
 * Body:        Raw Telegram `Update` JSON (`z.unknown()` — lenient external
 *              shape; router-svc narrows internally via grammy types).
 * Response:    `{ received: true }` — fire-and-forget; the actual agent
 *              turn happens asynchronously inside router-svc.
 *
 * This endpoint contract is REGISTERED in the bridge so consumers (router-svc,
 * any future inspector) share the path constant + response shape, but the
 * body remains lenient because Telegram's `Update` schema is sprawling and
 * evolves quickly.
 */
export declare const WebhookInboundTelegramRequestSchema: z.ZodUnknown;
export declare const WebhookInboundTelegramResponseSchema: z.ZodObject<{
    received: z.ZodLiteral<true>;
}, z.core.$strip>;
export type WebhookInboundTelegramResponse = z.infer<typeof WebhookInboundTelegramResponseSchema>;
/**
 * Optional STRICT shape that router-svc uses INTERNALLY after normalization
 * (re-exported for symmetry with the email contract — not the wire body).
 */
export declare const WebhookInboundTelegramNormalizedSchema: z.ZodObject<{
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
export type WebhookInboundTelegramNormalized = z.infer<typeof WebhookInboundTelegramNormalizedSchema>;
export declare const webhookInboundTelegramContract: {
    readonly method: "POST";
    readonly path: "/webhook/inbound/telegram";
    /** Telegram's secret-token header — provider-managed, not bridge-typed. */
    readonly authType: "external_provider";
    readonly bodySchema: z.ZodUnknown;
    readonly responseSchema: z.ZodObject<{
        received: z.ZodLiteral<true>;
    }, z.core.$strip>;
};
//# sourceMappingURL=webhook-inbound-telegram.d.ts.map