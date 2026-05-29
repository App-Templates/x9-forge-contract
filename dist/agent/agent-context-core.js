import { z } from 'zod';
import { AgentIdSchema, OwnerIdSchema } from "./agent-identity.js";
import { AgentCredentialsSchema } from "./agent-credentials.js";
/**
 * LLM configuration — provider + model pair.
 * Forge configures this per-agent, X9 reads it at boot.
 */
export const LlmConfigSchema = z.object({
    provider: z.string().min(1),
    model: z.string().min(1),
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
export const AgentContextCoreSchema = z
    .object({
    agentId: AgentIdSchema,
    ownerId: OwnerIdSchema,
    credentials: AgentCredentialsSchema,
    llmConfig: LlmConfigSchema,
    telegramAllowFrom: z.array(z.string()),
})
    .passthrough();
//# sourceMappingURL=agent-context-core.js.map