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
