/**
 * Agent domain — cross-repo contracts for agent identity, context, and credentials.
 *
 * @module @x9-forge/contracts/agent
 * @see .planning/phases/02-agentcontext-split-block-b/02-RESEARCH.md
 */
export { AgentIdSchema, OwnerIdSchema, AgentIdentitySchema } from "./agent-identity.js";
export type { AgentId, OwnerId, AgentIdentity } from "./agent-identity.js";
export { KNOWN_CREDENTIAL_KEYS, AgentCredentialsSchema, AUTH_GATE_FIELDS, } from "./agent-credentials.js";
export type { KnownCredentialKey, AgentCredentials, AuthGateField } from "./agent-credentials.js";
export { LlmConfigSchema, AgentContextCoreSchema } from "./agent-context-core.js";
export type { LlmConfig, AgentContextCore } from "./agent-context-core.js";
export { parseAgentContext } from "./parse-agent-context.js";
//# sourceMappingURL=index.d.ts.map