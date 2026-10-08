/**
 * Agent domain — cross-repo contracts for agent identity, context, and credentials.
 *
 * @module @x9-forge/contracts/agent
 * @see .planning/phases/02-agentcontext-split-block-b/02-RESEARCH.md
 */

// Identity (branded types)
export { AgentIdSchema, OwnerIdSchema, AgentIdentitySchema } from './agent-identity.js';
export type { AgentId, OwnerId, AgentIdentity } from './agent-identity.js';

// Credentials (discriminated known keys + catchall)
export {
  KNOWN_CREDENTIAL_KEYS,
  AgentCredentialsSchema,
  AUTH_GATE_FIELDS,
} from './agent-credentials.js';
export type { KnownCredentialKey, AgentCredentials, AuthGateField } from './agent-credentials.js';

// Context Core (cross-repo contract)
export { LlmConfigSchema, AgentContextCoreSchema } from './agent-context-core.js';
export type { LlmConfig, AgentContextCore } from './agent-context-core.js';

// Context File (FULL context.json contract: Core + Runtime fields — F-1)
export {
  AgentContextRuntimeFieldsSchema,
  AgentContextFileSchema,
  AgentContextFileWriteSchema,
  hasTelegramBot,
  appliedAgentConfigVersion,
  parseAgentContextFile,
  parseAgentContextFileForWrite,
} from './agent-context-file.js';
export type { AgentContextRuntimeFields, AgentContextFile } from './agent-context-file.js';

// Canonical on-disk path derivation (Bug #15 path-drift fix — F-path)
export {
  agentWorkspacePath,
  agentRegistryPath,
  agentContextJsonPath,
} from './agent-paths.js';

// Parser helper
export { parseAgentContext } from './parse-agent-context.js';

// Explicit management/runtime identities
export * from './agent-runtime-identity.js';

// Canonical runtime evidence, per-channel state and readiness
export * from './agent-runtime-state.js';

// Runtime list source availability and completeness
export * from './agent-runtime-source.js';

// R1b logical management: lifecycle/apply-config commands, versions, per-target outcomes (v1.31.0)
export * from './agent-management.js';

// Scope and action policy: allow/ask/deny per capability/tool, approvals, action log (R5, v1.31.0)
export * from './agent-scope-policy.js';

// R2: scoped birth channels, optional context extension and replayable creation.
export * from './agent-channel-configuration.js';
export * from './agent-creation-replay.js';

export * from './agent-channel-attestation.js';

// R7 / D-A9: versioned human core and generated progressive skills.
export * from './agent-workspace.js';

// Public, metadata-only observations from the per-agent registry.
export * from './agent-inventory-metadata.js';

// Canonical credential service metadata, never credential values.
export * from './agent-credential-services.js';

// C1 explicit door access; policy absence retains legacy behavior.
export * from './agent-channel-access.js';

export * from './agent-channel-access-requests.js';

// C2 shared phone door, separately scoped from the two birth channels.
export * from './agent-phone-channel.js';
export * from './agent-phone-commands.js';
// Forge-declared context authority, including explicit Master/heir provenance.
export * from './agent-context-identity.js';

// C5 permanent single-agent deletion, separate from lifecycle and archival.
export * from './agent-deletion.js';
