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
export { CapabilityToolSchema, type CapabilityTool, } from "./capability-tool.cjs";
export { ToolCallRequestSchema, ToolCallSuccessResponseSchema, ToolCallErrorResponseSchema, ToolCallResponseSchema, type ToolCallRequest, type ToolCallSuccessResponse, type ToolCallErrorResponse, type ToolCallResponse, } from "./tool-call.cjs";
export { CAPABILITY_CONTEXT_MAX_CHARS, CAPABILITY_CONTEXT_TIMEOUT_MS, CapabilityContextDeclarationSchema, CapabilityContextRequestSchema, CapabilityContextResponseSchema, type CapabilityContextDeclaration, type CapabilityContextRequest, type CapabilityContextResponse, } from "./capability-context.cjs";
export { CapabilityManifestSchema, type CapabilityManifest, } from "./capability-manifest.cjs";
export { CapabilityRegistryEntrySchema, type CapabilityRegistryEntry, toEndpoint, fromEndpoint, } from "./capability-registry-entry.cjs";
export { AgentRegistryFileSchema, type AgentRegistryFile, } from "./agent-registry-file.cjs";
export { EnvSchemaFieldSchema, EnvSchemaDocSchema, type EnvSchemaField, type EnvSchemaDoc, } from "./env-schema.cjs";
export { HealthStatusSchema, type HealthStatus, } from "./health-status.cjs";
export * from "./capability-turn-lead.cjs";
export * from "./parameters.cjs";
export * from "./presentation.cjs";
export * from "./capability-call-context.cjs";
export * from "./agent-elevenlabs/index.cjs";
export * from "./coach/index.cjs";
export * from "./approvals/index.cjs";
export * from "./backup/index.cjs";
export * from "./agent-elevenlabs/web-channel.cjs";
export * from "./agent-elevenlabs/web-session.cjs";
export * from "./agent-elevenlabs/web-catalog.cjs";
export * from "./agent-elevenlabs/web-context.cjs";
export * from "./paperclip/index.cjs";
export * from "./agent-elevenlabs/web-browser.cjs";
export * from "./agent-elevenlabs/web-invitations.cjs";
//# sourceMappingURL=index.d.ts.map