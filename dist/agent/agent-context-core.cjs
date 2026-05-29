"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentContextCoreSchema = exports.LlmConfigSchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("./agent-identity.cjs");
const agent_credentials_js_1 = require("./agent-credentials.cjs");
/**
 * LLM configuration — provider + model pair.
 * Forge configures this per-agent, X9 reads it at boot.
 */
exports.LlmConfigSchema = zod_1.z.object({
    provider: zod_1.z.string().min(1),
    model: zod_1.z.string().min(1),
});
/**
 * AgentContextCore — the cross-repo contract for context.json.
 *
 * Forge writes this shape (plus additional Runtime fields).
 * X9 reads and validates it, then extends with Runtime fields locally.
 *
 * Uses `.passthrough()` so existing context.json files with Runtime fields
 * (`workspacePath`, `registryPath`, `telegramBotToken`, `displayName`)
 * parse successfully without stripping data.
 *
 * @see AGNT-02
 */
exports.AgentContextCoreSchema = zod_1.z
    .object({
    agentId: agent_identity_js_1.AgentIdSchema,
    ownerId: agent_identity_js_1.OwnerIdSchema,
    credentials: agent_credentials_js_1.AgentCredentialsSchema,
    llmConfig: exports.LlmConfigSchema,
    telegramAllowFrom: zod_1.z.array(zod_1.z.string()),
    /**
     * X9-CORE-3 (v1.10.0) — Optional per-agent inbound forward target.
     *
     * When set, agent-core (and any future channel adapter that consumes
     * AgentContextCore) routes inbound messages addressed to this agent
     * to the configured URL instead of running the local LLM turn loop.
     * Wire shape sent to the URL is the bridge `internalTurnContract`
     * body — symmetric with the X9-CORE-1 cap-email + X9-CORE-2 agent-core
     * Telegram forward pattern.
     *
     * Resolution precedence at the agent-core consumer:
     *   1. `AgentContext.inboundForwardUrl` (this field — per-agent override)
     *   2. `INBOUND_FORWARD_URL` env var (global fallback, X9-CORE-2)
     *   3. neither → forward gate is a no-op; local LLM path runs
     *
     * Forge writes this field via control-plane vault sync when an agent
     * is designated as a Parallel character bot (or any other forward-only
     * persona). When the field is absent or `null`, agent-core treats the
     * bot as the canonical x9 LLM agent (legacy behavior).
     *
     * R-17 N/A — this is config (URL), not a credential. The auth secret
     * the consumer attaches at POST time stays in the canonical
     * `INTERNAL_SECRET` env / vault entry.
     */
    inboundForwardUrl: zod_1.z.string().url().nullable().optional(),
})
    .passthrough();
//# sourceMappingURL=agent-context-core.js.map