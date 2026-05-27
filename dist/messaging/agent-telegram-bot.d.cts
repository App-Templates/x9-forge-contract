import { z } from 'zod';
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
export declare const AgentTelegramBotSchema: z.ZodObject<{
    agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    bot_username: z.ZodString;
    bot_token_ref: z.ZodString;
    chat_allow_list: z.ZodArray<z.ZodString>;
    created_at: z.ZodString;
}, z.core.$strip>;
export type AgentTelegramBot = z.infer<typeof AgentTelegramBotSchema>;
//# sourceMappingURL=agent-telegram-bot.d.ts.map