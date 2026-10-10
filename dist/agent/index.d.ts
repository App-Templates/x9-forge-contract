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
export { AgentContextRuntimeFieldsSchema, AgentContextFileSchema, AgentContextFileWriteSchema, hasTelegramBot, appliedAgentConfigVersion, parseAgentContextFile, parseAgentContextFileForWrite, } from "./agent-context-file.js";
export type { AgentContextRuntimeFields, AgentContextFile } from "./agent-context-file.js";
export { agentWorkspacePath, agentRegistryPath, agentContextJsonPath, } from "./agent-paths.js";
export { parseAgentContext } from "./parse-agent-context.js";
export * from "./agent-runtime-identity.js";
export * from "./agent-runtime-state.js";
export * from "./agent-runtime-source.js";
export * from "./agent-management.js";
export * from "./agent-scope-policy.js";
export * from "./agent-channel-configuration.js";
export * from "./agent-creation-replay.js";
export * from "./agent-channel-attestation.js";
export * from "./agent-workspace.js";
export * from "./agent-inventory-metadata.js";
export * from "./agent-credential-services.js";
export * from "./agent-channel-access.js";
export * from "./agent-channel-access-requests.js";
export * from "./agent-phone-channel.js";
export * from "./agent-phone-commands.js";
export * from "./agent-context-identity.js";
export * from "./agent-channel-resource-operation.js";
export * from "./agent-deletion.js";
export * from "./agent-phone-admission.js";
export * from "./agent-channel-history.js";
export * from "./agent-channel-history-content.js";
//# sourceMappingURL=index.d.ts.map