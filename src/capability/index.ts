/**
 * Capability contracts — sub-path `@x9-forge/contracts/capability`.
 *
 * Single source of truth for all cross-repo contracts between X9 capability
 * services and their consumers (X9 agent-core, Forge factory-svc).
 *
 * Contracts added in Phase 1-01:
 * - CapabilityTool / CapabilityToolSchema
 * - ToolCallRequest / ToolCallResponse (and subtypes) with Zod schemas
 * - CapabilityManifest / CapabilityManifestSchema
 * - CapabilityRegistryEntry / CapabilityRegistryEntrySchema + toEndpoint/fromEndpoint
 * - EnvSchemaField / EnvSchemaDoc with Zod schemas
 * - HealthStatus / HealthStatusSchema
 */
export {
  CapabilityToolSchema,
  type CapabilityTool,
} from './capability-tool.js';

export {
  ToolCallRequestSchema,
  ToolCallSuccessResponseSchema,
  ToolCallErrorResponseSchema,
  ToolCallResponseSchema,
  type ToolCallRequest,
  type ToolCallSuccessResponse,
  type ToolCallErrorResponse,
  type ToolCallResponse,
} from './tool-call.js';

export {
  CAPABILITY_CONTEXT_MAX_CHARS,
  CAPABILITY_CONTEXT_TIMEOUT_MS,
  CapabilityContextDeclarationSchema,
  CapabilityContextRequestSchema,
  CapabilityContextResponseSchema,
  type CapabilityContextDeclaration,
  type CapabilityContextRequest,
  type CapabilityContextResponse,
} from './capability-context.js';

export {
  CapabilityManifestSchema,
  type CapabilityManifest,
} from './capability-manifest.js';

export {
  CapabilityRegistryEntrySchema,
  type CapabilityRegistryEntry,
  toEndpoint,
  fromEndpoint,
} from './capability-registry-entry.js';

export {
  AgentRegistryFileSchema,
  type AgentRegistryFile,
} from './agent-registry-file.js';

export {
  EnvSchemaFieldSchema,
  EnvSchemaDocSchema,
  type EnvSchemaField,
  type EnvSchemaDoc,
} from './env-schema.js';

export {
  HealthStatusSchema,
  type HealthStatus,
} from './health-status.js';

export * from './capability-turn-lead.js';

export * from './parameters.js';
export * from './presentation.js';

// Per-call capability context: trusted identity + minimal versioned credentials (R3, v1.31.0)
export * from './capability-call-context.js';

// cap-agent-elevenlabs: idempotent provisioning, provider mapping, external channel state (R6, v1.31.0)
export * from './agent-elevenlabs/index.js';

// cap-coach: programs, sessions, progress, minute budget per tenant/owner/agent/person (R6, v1.31.0)
export * from './coach/index.js';

// Signed approvals: one shared passkey approval for every sensitive action of every agent (phase 59)
export * from './approvals/index.js';

// cap-backup: restore points of the owner's servers, first client of the signed approvals (phase 59)
export * from './backup/index.js';

// C3-B1: independent Web admission policy and server-owned invitations.
export * from './agent-elevenlabs/web-channel.js';

export * from './agent-elevenlabs/web-session.js';
export * from './agent-elevenlabs/web-catalog.js';

export * from './agent-elevenlabs/web-context.js';

export * from './paperclip/index.js';

export * from './coach/program-version.js';
export * from './coach/execution.js';

export * from './coach/measures.js';
export * from './coach/accounting.js';
export * from './coach/rolling-budget.js';

export * from './agent-elevenlabs/coach-binding.js';

export * from './coach/operational/index.js';

export * from './agent-elevenlabs/native-session.js';

export * from './agent-elevenlabs/native-tools.js';

export * from './agent-elevenlabs/native-config.js';
export * from './agent-elevenlabs/native-readback.js';
