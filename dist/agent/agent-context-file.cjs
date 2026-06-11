"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentContextFileSchema = exports.AgentContextRuntimeFieldsSchema = void 0;
exports.hasTelegramBot = hasTelegramBot;
exports.parseAgentContextFile = parseAgentContextFile;
const zod_1 = require("zod");
const agent_context_core_js_1 = require("./agent-context-core.cjs");
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
exports.AgentContextRuntimeFieldsSchema = zod_1.z.object({
    /** Absolute path to the agent workspace dir (Forge: /data/workspaces/{agentId}). */
    workspacePath: zod_1.z.string().min(1),
    /** Absolute path to the agent registry.json (Forge: /data/agents/{agentId}/registry.json). */
    registryPath: zod_1.z.string().min(1),
    /**
     * Telegram bot token. Absent or `''` ⇒ bot-less agent (legal): no
     * Telegram channel is booted, the agent is still registered for
     * `/internal/turn` and proactive delivery. Use {@link hasTelegramBot}.
     */
    telegramBotToken: zod_1.z.string().optional(),
    /** Human-readable agent name (logs, UI). */
    displayName: zod_1.z.string().min(1),
});
/**
 * Full context.json schema: Core (cross-repo identity/credentials/llm) +
 * Runtime fields (paths, telegram, display). Passthrough is inherited from
 * Core so future additive fields never break either consumer.
 */
exports.AgentContextFileSchema = agent_context_core_js_1.AgentContextCoreSchema.extend(exports.AgentContextRuntimeFieldsSchema.shape);
/**
 * Canonical bot-less discriminator. `''` and whitespace-only count as
 * "no bot" because Forge's writer emits `params.telegram_bot_token?.trim() ?? ''`.
 */
function hasTelegramBot(ctx) {
    return typeof ctx.telegramBotToken === 'string' && ctx.telegramBotToken.trim().length > 0;
}
/**
 * Parse and validate raw JSON into the full AgentContextFile shape.
 * Fail-loud: throws ZodError on invalid input. Boundary helper for both
 * the Forge writer (validate-before-write) and the X9 reader.
 */
function parseAgentContextFile(json) {
    return exports.AgentContextFileSchema.parse(json);
}
//# sourceMappingURL=agent-context-file.js.map