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
export { CapabilityToolSchema, } from "./capability-tool.js";
export { ToolCallRequestSchema, ToolCallSuccessResponseSchema, ToolCallErrorResponseSchema, ToolCallResponseSchema, } from "./tool-call.js";
export { CapabilityManifestSchema, } from "./capability-manifest.js";
export { CapabilityRegistryEntrySchema, toEndpoint, fromEndpoint, } from "./capability-registry-entry.js";
export { AgentRegistryFileSchema, } from "./agent-registry-file.js";
export { EnvSchemaFieldSchema, EnvSchemaDocSchema, } from "./env-schema.js";
export { HealthStatusSchema, } from "./health-status.js";
//# sourceMappingURL=index.js.map