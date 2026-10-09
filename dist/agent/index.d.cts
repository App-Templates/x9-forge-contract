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
export { AgentContextRuntimeFieldsSchema, AgentContextFileSchema, AgentContextFileWriteSchema, hasTelegramBot, appliedAgentConfigVersion, parseAgentContextFile, parseAgentContextFileForWrite, } from "./agent-context-file.cjs";
export type { AgentContextRuntimeFields, AgentContextFile } from "./agent-context-file.cjs";
export { agentWorkspacePath, agentRegistryPath, agentContextJsonPath, } from "./agent-paths.cjs";
export { parseAgentContext } from "./parse-agent-context.cjs";
export * from "./agent-runtime-identity.cjs";
export * from "./agent-runtime-state.cjs";
export * from "./agent-runtime-source.cjs";
export * from "./agent-management.cjs";
export * from "./agent-scope-policy.cjs";
export * from "./agent-channel-configuration.cjs";
export * from "./agent-creation-replay.cjs";
export * from "./agent-channel-attestation.cjs";
export * from "./agent-workspace.cjs";
export * from "./agent-inventory-metadata.cjs";
export * from "./agent-credential-services.cjs";
export * from "./agent-channel-access.cjs";
export * from "./agent-channel-access-requests.cjs";
export * from "./agent-phone-channel.cjs";
export * from "./agent-phone-commands.cjs";
export * from "./agent-context-identity.cjs";
export * from "./agent-channel-resource-operation.cjs";
export * from "./agent-deletion.cjs";
export * from "./agent-phone-admission.cjs";
export * from "./agent-channel-history.cjs";
export * from "./agent-workspace-digest.cjs";
export * from "./ordinary-authority.cjs";
//# sourceMappingURL=index.d.ts.map