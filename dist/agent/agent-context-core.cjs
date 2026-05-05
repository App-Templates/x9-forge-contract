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
})
    .passthrough();
//# sourceMappingURL=agent-context-core.js.map