"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatusSchema = exports.EnvSchemaDocSchema = exports.EnvSchemaFieldSchema = exports.fromEndpoint = exports.toEndpoint = exports.CapabilityRegistryEntrySchema = exports.CapabilityManifestSchema = exports.ToolCallResponseSchema = exports.ToolCallErrorResponseSchema = exports.ToolCallSuccessResponseSchema = exports.ToolCallRequestSchema = exports.CapabilityToolSchema = void 0;
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
var capability_tool_js_1 = require("./capability-tool.cjs");
Object.defineProperty(exports, "CapabilityToolSchema", { enumerable: true, get: function () { return capability_tool_js_1.CapabilityToolSchema; } });
var tool_call_js_1 = require("./tool-call.cjs");
Object.defineProperty(exports, "ToolCallRequestSchema", { enumerable: true, get: function () { return tool_call_js_1.ToolCallRequestSchema; } });
Object.defineProperty(exports, "ToolCallSuccessResponseSchema", { enumerable: true, get: function () { return tool_call_js_1.ToolCallSuccessResponseSchema; } });
Object.defineProperty(exports, "ToolCallErrorResponseSchema", { enumerable: true, get: function () { return tool_call_js_1.ToolCallErrorResponseSchema; } });
Object.defineProperty(exports, "ToolCallResponseSchema", { enumerable: true, get: function () { return tool_call_js_1.ToolCallResponseSchema; } });
var capability_manifest_js_1 = require("./capability-manifest.cjs");
Object.defineProperty(exports, "CapabilityManifestSchema", { enumerable: true, get: function () { return capability_manifest_js_1.CapabilityManifestSchema; } });
var capability_registry_entry_js_1 = require("./capability-registry-entry.cjs");
Object.defineProperty(exports, "CapabilityRegistryEntrySchema", { enumerable: true, get: function () { return capability_registry_entry_js_1.CapabilityRegistryEntrySchema; } });
Object.defineProperty(exports, "toEndpoint", { enumerable: true, get: function () { return capability_registry_entry_js_1.toEndpoint; } });
Object.defineProperty(exports, "fromEndpoint", { enumerable: true, get: function () { return capability_registry_entry_js_1.fromEndpoint; } });
var env_schema_js_1 = require("./env-schema.cjs");
Object.defineProperty(exports, "EnvSchemaFieldSchema", { enumerable: true, get: function () { return env_schema_js_1.EnvSchemaFieldSchema; } });
Object.defineProperty(exports, "EnvSchemaDocSchema", { enumerable: true, get: function () { return env_schema_js_1.EnvSchemaDocSchema; } });
var health_status_js_1 = require("./health-status.cjs");
Object.defineProperty(exports, "HealthStatusSchema", { enumerable: true, get: function () { return health_status_js_1.HealthStatusSchema; } });
//# sourceMappingURL=index.js.map