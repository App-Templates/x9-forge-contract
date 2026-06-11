/**
 * Agent domain — cross-repo contracts for agent identity, context, and credentials.
 *
 * @module @x9-forge/contracts/agent
 * @see .planning/phases/02-agentcontext-split-block-b/02-RESEARCH.md
 */
// Identity (branded types)
export { AgentIdSchema, OwnerIdSchema, AgentIdentitySchema } from "./agent-identity.js";
// Credentials (discriminated known keys + catchall)
export { KNOWN_CREDENTIAL_KEYS, AgentCredentialsSchema, AUTH_GATE_FIELDS, } from "./agent-credentials.js";
// Context Core (cross-repo contract)
export { LlmConfigSchema, AgentContextCoreSchema } from "./agent-context-core.js";
// Context File (FULL context.json contract: Core + Runtime fields — F-1)
export { AgentContextRuntimeFieldsSchema, AgentContextFileSchema, hasTelegramBot, parseAgentContextFile, } from "./agent-context-file.js";
// Parser helper
export { parseAgentContext } from "./parse-agent-context.js";
//# sourceMappingURL=index.js.map