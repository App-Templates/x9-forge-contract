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
export { AgentContextRuntimeFieldsSchema, AgentContextFileSchema, AgentContextFileWriteSchema, hasTelegramBot, parseAgentContextFile, parseAgentContextFileForWrite, } from "./agent-context-file.js";
// Canonical on-disk path derivation (Bug #15 path-drift fix — F-path)
export { agentWorkspacePath, agentRegistryPath, agentContextJsonPath, } from "./agent-paths.js";
// Parser helper
export { parseAgentContext } from "./parse-agent-context.js";
// Explicit management/runtime identities
export * from "./agent-runtime-identity.js";
// Canonical runtime evidence, per-channel state and readiness
export * from "./agent-runtime-state.js";
// Runtime list source availability and completeness
export * from "./agent-runtime-source.js";
//# sourceMappingURL=index.js.map