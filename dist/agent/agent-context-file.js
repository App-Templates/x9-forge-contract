import { z } from 'zod';
import { AgentContextCoreSchema } from "./agent-context-core.js";
/**
 * AgentContextFile — the FULL canonical contract for `context.json` on disk.
 *
 * Forge `deploy.machine.ts` WRITES this shape; X9 `agent-manager.ts` READS
 * and validates it. Both sides therefore share it cross-repo — it lives
 * here, not in either consumer (R-14).
 *
 * History (F-1, 2026-06-11): the Runtime fields used to be re-declared
 * X9-side with `telegramBotToken: z.string().min(1)` while Forge wrote
 * `''` for bot-less agents (BotFather skipped/failed, email-only persona).
 * X9's reload threw on the schema, Forge swallowed the error, and the agent
 * was silently never registered in agent-core — Bug #15 class drift.
 *
 * DECISION (encoded here, both consumers import):
 * **bot-less agents are legal.** `telegramBotToken` may be absent, or the
 * empty string (what Forge's writer emits today). Consumers MUST use
 * {@link hasTelegramBot} to decide whether to boot a Telegram channel for
 * the agent; `/internal/turn` + proactive delivery remain available either
 * way.
 *
 * @see F-1 — E2E-FINDINGS-2026-06-11
 */
export const AgentContextRuntimeFieldsSchema = z.object({
    /** Absolute path to the agent workspace dir (Forge: /data/workspaces/{agentId}). */
    workspacePath: z.string().min(1),
    /** Absolute path to the agent registry.json (Forge: /data/agents/{agentId}/registry.json). */
    registryPath: z.string().min(1),
    /**
     * Telegram bot token. Absent or `''` ⇒ bot-less agent (legal): no
     * Telegram channel is booted, the agent is still registered for
     * `/internal/turn` and proactive delivery. Use {@link hasTelegramBot}.
     */
    telegramBotToken: z.string().optional(),
    /** Human-readable agent name (logs, UI). */
    displayName: z.string().min(1),
});
/**
 * Full context.json schema: Core (cross-repo identity/credentials/llm) +
 * Runtime fields (paths, telegram, display). Passthrough is inherited from
 * Core so future additive fields never break either consumer.
 */
export const AgentContextFileSchema = AgentContextCoreSchema.extend(AgentContextRuntimeFieldsSchema.shape);
/**
 * Canonical bot-less discriminator. `''` and whitespace-only count as
 * "no bot" because Forge's writer emits `params.telegram_bot_token?.trim() ?? ''`.
 */
export function hasTelegramBot(ctx) {
    return typeof ctx.telegramBotToken === 'string' && ctx.telegramBotToken.trim().length > 0;
}
/**
 * Parse and validate raw JSON into the full AgentContextFile shape.
 * Fail-loud: throws ZodError on invalid input. Boundary helper for both
 * the Forge writer (validate-before-write) and the X9 reader.
 */
export function parseAgentContextFile(json) {
    return AgentContextFileSchema.parse(json);
}
//# sourceMappingURL=agent-context-file.js.map