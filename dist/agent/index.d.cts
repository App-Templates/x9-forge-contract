/**
 * Agent domain — cross-repo contracts for agent identity, context, and credentials.
 *
 * @module @x9-forge/contracts/agent
 * @see .planning/phases/02-agentcontext-split-block-b/02-RESEARCH.md
 */
export { AgentIdSchema, OwnerIdSchema, AgentIdentitySchema } from "./agent-identity.cjs";
export type { AgentId, OwnerId, AgentIdentity } from "./agent-identity.cjs";
export { KNOWN_CREDENTIAL_KEYS, AgentCredentialsSchema, AUTH_GATE_FIELDS, } from "./agent-credentials.cjs";
export type { KnownCredentialKey, AgentCredentials, AuthGateField } from "./agent-credentials.cjs";
export { LlmConfigSchema, AgentContextCoreSchema } from "./agent-context-core.cjs";
export type { LlmConfig, AgentContextCore } from "./agent-context-core.cjs";
export { AgentContextRuntimeFieldsSchema, AgentContextFileSchema, hasTelegramBot, parseAgentContextFile, } from "./agent-context-file.cjs";
export type { AgentContextRuntimeFields, AgentContextFile } from "./agent-context-file.cjs";
export { parseAgentContext } from "./parse-agent-context.cjs";
//# sourceMappingURL=index.d.ts.map