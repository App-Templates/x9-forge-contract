"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTelegramBotSchema = exports.AgentEmailInboxSchema = exports.IncomingMessageEnvelopeSchema = exports.IncomingMessageAttachmentSchema = exports.ChannelTypeSchema = void 0;
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
var channel_type_js_1 = require("./channel-type.cjs");
Object.defineProperty(exports, "ChannelTypeSchema", { enumerable: true, get: function () { return channel_type_js_1.ChannelTypeSchema; } });
var attachment_js_1 = require("./attachment.cjs");
Object.defineProperty(exports, "IncomingMessageAttachmentSchema", { enumerable: true, get: function () { return attachment_js_1.IncomingMessageAttachmentSchema; } });
var incoming_message_envelope_js_1 = require("./incoming-message-envelope.cjs");
Object.defineProperty(exports, "IncomingMessageEnvelopeSchema", { enumerable: true, get: function () { return incoming_message_envelope_js_1.IncomingMessageEnvelopeSchema; } });
var agent_email_inbox_js_1 = require("./agent-email-inbox.cjs");
Object.defineProperty(exports, "AgentEmailInboxSchema", { enumerable: true, get: function () { return agent_email_inbox_js_1.AgentEmailInboxSchema; } });
var agent_telegram_bot_js_1 = require("./agent-telegram-bot.cjs");
Object.defineProperty(exports, "AgentTelegramBotSchema", { enumerable: true, get: function () { return agent_telegram_bot_js_1.AgentTelegramBotSchema; } });
//# sourceMappingURL=index.js.map