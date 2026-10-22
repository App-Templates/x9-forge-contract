/**
 * `@x9-forge/contracts/messaging` — cross-channel inbound messaging contracts.
 *
 * Added in Phase 11 to support multi-channel routing: per-character email
 * inbox + per-character Telegram bot + normalized inbound envelopes from
 * AgentMail/Telegram/(future WhatsApp) webhooks.
 *
 * The voice channel keeps its own `capability/voice/` subpath because its
 * call-shaped contract (post-call recap, transcript, conversation_id)
 * predates this generic envelope and remains the canonical source for
 * voice. This subpath covers everything that is NOT call-shaped.
 *
 * **STRICT internal boundary** — no `.passthrough()`. Bug #15 prevention.
 *
 * Subpath bridge consumers: cap-email (Phase 11.B), telegram-router-svc
 * (Phase 11.C), Forge factory-svc (per-agent provisioning lookup), and
 * Parallel inbound-router (downstream).
 */
export { ChannelTypeSchema } from "./channel-type.js";
export { IncomingMessageAttachmentSchema } from "./attachment.js";
export { IncomingMessageEnvelopeSchema } from "./incoming-message-envelope.js";
export { AgentEmailInboxSchema } from "./agent-email-inbox.js";
export { AgentTelegramBotSchema } from "./agent-telegram-bot.js";
//# sourceMappingURL=index.js.map