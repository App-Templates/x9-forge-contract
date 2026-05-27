import { z } from 'zod';
import { AgentIdSchema, OwnerIdSchema } from "../agent/agent-identity.js";
import { ChannelTypeSchema } from "./channel-type.js";
import { IncomingMessageAttachmentSchema } from "./attachment.js";
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
export const IncomingMessageEnvelopeSchema = z.object({
    /** Provider-assigned message id (telegram update_id, agentmail messageId, …). */
    message_id: z.string().min(1),
    /** Semantic channel — narrows which provider literal `provider` may take. */
    channel: ChannelTypeSchema,
    /**
     * Provider literal — discriminator for `raw_provider_event` shape.
     * Telegram channel today only has provider `'telegram'`, but email could
     * route via `'agentmail'` OR a future SMTP provider (sendgrid/etc.).
     */
    provider: z.enum(['telegram', 'agentmail', 'elevenlabs', 'whatsapp_cloud']),
    /**
     * Resolved agent id when known (null pre-resolution at the adapter layer,
     * filled by the resolver before `/internal/turn` dispatch). Branded to
     * prevent agentId/ownerId confusion (see `agent/agent-identity.ts`).
     */
    agent_id: AgentIdSchema.nullable(),
    /** Resolved owner (tenant user) id. null pre-resolution. */
    owner_id: OwnerIdSchema.nullable(),
    /** Multi-tenant scoping. null pre-resolution. */
    tenant_id: z.string().min(1).nullable(),
    /**
     * Session id used by agent-core/Parallel runtime to thread the conversation.
     * Convention: `tg-router-<botId>-<chatId>` for telegram-router-svc;
     * `email-<inboxId>-<threadId>` for cap-email inbound. null pre-resolution.
     * Validated against `^[a-z0-9-]{1,64}$` by `internal-turn.ts` downstream.
     */
    session_id: z.string().min(1).max(64).nullable(),
    /**
     * Sender address in channel-native format:
     *   - telegram: `tg:<chat_id>` (stringified; chat ids are int64 — keep
     *     `string` to avoid JS number precision loss above 2^53)
     *   - email:    RFC-5321 mailbox (`user@example.com`)
     *   - voice:    E.164 (`+390302041493`)
     *   - whatsapp: E.164 with `wa:` prefix (`wa:+390302041493`)
     */
    from: z.string().min(1).max(500),
    /** Recipient address in channel-native format (same convention as `from`). */
    to: z.string().min(1).max(500),
    /** Plain-text rendering of the message body. Always present (max 64KB). */
    body_text: z.string().max(65536),
    /**
     * Optional HTML rendering when the channel emits one (email primarily).
     * null for plain channels (telegram/voice/whatsapp). Capped at 256KB.
     */
    body_html: z.string().max(262144).nullable(),
    /** Attachments (files, photos, voice notes). Empty array when none. */
    attachments: z.array(IncomingMessageAttachmentSchema).max(20),
    /**
     * Provider thread anchor — `In-Reply-To` for email, telegram
     * `reply_to_message.message_id`, whatsapp quoted message id. null when
     * the message is a new thread.
     */
    reply_to_message_id: z.string().min(1).max(500).nullable(),
    /** RFC-3339 timestamp when the channel adapter received the webhook. */
    received_at: z.string().datetime({ offset: true }),
    /**
     * SHA-256 hash of the raw provider payload — used by consumers for
     * idempotency (e.g. cap-email keys its dedupe table on this hash combined
     * with the Svix-id header).
     */
    provider_event_hash: z.string().min(1),
    /**
     * Signature validity literal — adapters MUST verify provider signature
     * (Svix for AgentMail, telegram bot secret-token, etc.) BEFORE
     * constructing the envelope. Invalid-signature events MUST be dropped at
     * the boundary; never propagated downstream with `signature_valid: false`.
     * Pattern mirrors `capability/voice/normalized-event.ts:43` (D-09 no-fallback).
     */
    signature_valid: z.literal(true),
    /**
     * The raw provider payload preserved verbatim. Typed as `unknown` — consumers
     * narrow via the `provider` discriminator. This is the LENIENT escape hatch
     * for provider schema drift; the surrounding STRICT fields keep the
     * boundary contract stable.
     */
    raw_provider_event: z.unknown(),
});
//# sourceMappingURL=incoming-message-envelope.js.map