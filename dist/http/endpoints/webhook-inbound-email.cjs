"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookInboundEmailContract = exports.WebhookInboundEmailNormalizedSchema = exports.WebhookInboundEmailResponseSchema = exports.WebhookInboundEmailRequestSchema = void 0;
const zod_1 = require("zod");
const incoming_message_envelope_js_1 = require("../../messaging/incoming-message-envelope.cjs");
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
exports.WebhookInboundEmailRequestSchema = zod_1.z.unknown();
exports.WebhookInboundEmailResponseSchema = zod_1.z.object({
    received: zod_1.z.literal(true),
});
/**
 * Optional STRICT shape used INTERNALLY by cap-email after Svix verification +
 * normalization (re-exported for symmetry with the telegram contract — not the
 * wire body).
 */
exports.WebhookInboundEmailNormalizedSchema = incoming_message_envelope_js_1.IncomingMessageEnvelopeSchema;
exports.webhookInboundEmailContract = {
    method: 'POST',
    path: '/webhook/agentmail/inbound',
    /** Svix HMAC signature — provider-managed, not bridge-typed. */
    authType: 'external_provider',
    bodySchema: exports.WebhookInboundEmailRequestSchema,
    responseSchema: exports.WebhookInboundEmailResponseSchema,
};
//# sourceMappingURL=webhook-inbound-email.js.map