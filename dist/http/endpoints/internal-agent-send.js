import { z } from 'zod';
/**
 * POST /internal/agents/:agentId/send — proactively send a pre-composed
 * message AS a deployed agent, via that agent's OWN grammy Telegram bot.
 * Direction: trusted internal service (e.g. Parallel narrative runtime) -> X9 agent-core
 * Auth: X-Internal-Secret (INTERNAL_SECRET_HEADER)
 * Requirement: Wave 3 (Parallel proactive narrative delivery).
 *
 * This is the proactive-delivery sibling of `POST /internal/turn`. Where
 * `/internal/turn` runs the LLM turn loop, this endpoint runs NO turn: it is a
 * pure send. agent-core looks up the agent's already-booted bot in its
 * `activeBots` map (keyed by agentId) and calls `bot.api.sendMessage(chatId,
 * text)`. The character speaks through its own bot — never another agent's,
 * never Stefano's personal `x9` agent (which is single-agent fallback mode and
 * is not registered in `activeBots`, so a `send` for it 404s unless explicitly
 * deployed as a context.json agent).
 *
 * R-17: the Telegram bot token is an X9/Forge credential. It NEVER leaves
 * agent-core — it is loaded from the agent's `context.json` at boot, held in
 * the in-memory bot instance, and used here server-side. This contract carries
 * NO token: the caller supplies only `{ chatId, text }` and the server resolves
 * the bot by `agentId`. The response NEVER echoes or logs the token. This is
 * the mechanism Parallel uses to deliver proactive narrative hooks on Telegram
 * without the per-character bot token ever existing in Parallel's DB/vault or
 * an HTTP body (the alternative — a TelegramDirectAdapter holding the token —
 * was rejected per R-17).
 *
 * Consumers:
 *   - X9 agent-core — validates params + body, resolves the bot, sends (server side)
 *   - parallel proactive narrative delivery — builds the request (client side)
 */
export const InternalAgentSendParamsSchema = z.object({
    /** Target agent slug (= agentId). Lowercase alphanumeric + dash. */
    agentId: z.string().regex(/^[a-z0-9-]+$/),
});
export const InternalAgentSendRequestSchema = z.object({
    /**
     * Telegram chat id to deliver to, as a string. Telegram chat ids are 64-bit
     * integers that exceed JS-safe range and may be negative (groups), so they
     * are carried as strings end-to-end and passed straight to grammy's
     * `bot.api.sendMessage(chatId, text)`.
     */
    chatId: z.string().min(1),
    /** Pre-composed message body. No LLM turn runs — this text is sent verbatim. */
    text: z.string().min(1),
});
export const InternalAgentSendResponseSchema = z.object({
    ok: z.literal(true),
    /** Telegram message id of the sent message (from the bot.api.sendMessage result). */
    messageId: z.number().optional(),
});
export const InternalAgentSendErrorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.string(),
});
export const internalAgentSendContract = {
    method: 'POST',
    path: '/internal/agents/:agentId/send',
    authType: 'secret',
    paramsSchema: InternalAgentSendParamsSchema,
    bodySchema: InternalAgentSendRequestSchema,
    responseSchema: InternalAgentSendResponseSchema,
};
//# sourceMappingURL=internal-agent-send.js.map