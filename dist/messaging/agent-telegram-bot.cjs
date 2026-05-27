"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTelegramBotSchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
/**
 * AgentTelegramBot — per-agent Telegram bot identity used by the Phase 11
 * `telegram-router-svc` to long-poll/webhook on N character bots without
 * touching agent-core's legacy single-bot listener.
 *
 * **NO secret material in this schema (R-17).** The actual bot token lives
 * in the per-agent vault under `TELEGRAM_BOT_TOKEN` (see
 * `agent-credentials.ts:13`). This schema carries only:
 *   - the public bot username (`@parallel_char_bellini_giov_bot`)
 *   - a `bot_token_ref` pointer to the vault entry (NOT the token value)
 *   - the allow-list of chat ids the agent is permitted to converse with
 *
 * Telegram chat ids are int64 — exceed JS `Number.MAX_SAFE_INTEGER` for
 * supergroups (>2^53). Stored as `string` here to avoid silent truncation.
 * Same convention used in `IncomingMessageEnvelopeSchema.from/to`.
 *
 * @see Phase 10.11 BotFather automation: workspace-seeder-svc creates the
 *      bot and registers the token in vault; this schema documents the
 *      handle that downstream services (router, agent-core, Parallel) use
 *      to resolve botUsername → agentId at runtime.
 */
exports.AgentTelegramBotSchema = zod_1.z.object({
    /** Branded agent id this bot is bound to. */
    agent_id: agent_identity_js_1.AgentIdSchema,
    /**
     * Public bot username WITHOUT the leading `@` (e.g. `parallel_char_bellini_giov_bot`).
     * 5-32 chars, must end with `_bot` (Telegram BotFather constraint).
     */
    bot_username: zod_1.z
        .string()
        .min(5)
        .max(32)
        .regex(/^[A-Za-z0-9_]+_bot$/, 'bot_username must end with _bot (BotFather constraint)'),
    /**
     * Opaque reference to the vault entry holding the bot token. Example
     * format: `vault://agent/{agentId}/TELEGRAM_BOT_TOKEN`. Consumers MUST
     * resolve via the vault client; raw tokens NEVER appear in this schema.
     * R-17 boundary: contracts carry references, vault carries values.
     */
    bot_token_ref: zod_1.z.string().min(1).max(500),
    /**
     * Allow-list of Telegram chat ids the bot is permitted to converse with.
     * Empty array = no chats allowed (kill-switch). Strings to avoid int64
     * precision loss (Telegram supergroup ids exceed 2^53).
     */
    chat_allow_list: zod_1.z.array(zod_1.z.string().regex(/^-?\d+$/, 'chat id must be a signed integer string')),
    /** RFC-3339 timestamp of bot registration in the system. */
    created_at: zod_1.z.string().datetime({ offset: true }),
});
//# sourceMappingURL=agent-telegram-bot.js.map