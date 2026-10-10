"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatusSchema = exports.EnvSchemaDocSchema = exports.EnvSchemaFieldSchema = exports.AgentRegistryFileSchema = exports.fromEndpoint = exports.toEndpoint = exports.CapabilityRegistryEntrySchema = exports.CapabilityManifestSchema = exports.CapabilityContextResponseSchema = exports.CapabilityContextRequestSchema = exports.CapabilityContextDeclarationSchema = exports.CAPABILITY_CONTEXT_TIMEOUT_MS = exports.CAPABILITY_CONTEXT_MAX_CHARS = exports.ToolCallResponseSchema = exports.ToolCallErrorResponseSchema = exports.ToolCallSuccessResponseSchema = exports.ToolCallRequestSchema = exports.CapabilityToolSchema = void 0;
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
var capability_context_js_1 = require("./capability-context.cjs");
Object.defineProperty(exports, "CAPABILITY_CONTEXT_MAX_CHARS", { enumerable: true, get: function () { return capability_context_js_1.CAPABILITY_CONTEXT_MAX_CHARS; } });
Object.defineProperty(exports, "CAPABILITY_CONTEXT_TIMEOUT_MS", { enumerable: true, get: function () { return capability_context_js_1.CAPABILITY_CONTEXT_TIMEOUT_MS; } });
Object.defineProperty(exports, "CapabilityContextDeclarationSchema", { enumerable: true, get: function () { return capability_context_js_1.CapabilityContextDeclarationSchema; } });
Object.defineProperty(exports, "CapabilityContextRequestSchema", { enumerable: true, get: function () { return capability_context_js_1.CapabilityContextRequestSchema; } });
Object.defineProperty(exports, "CapabilityContextResponseSchema", { enumerable: true, get: function () { return capability_context_js_1.CapabilityContextResponseSchema; } });
var capability_manifest_js_1 = require("./capability-manifest.cjs");
Object.defineProperty(exports, "CapabilityManifestSchema", { enumerable: true, get: function () { return capability_manifest_js_1.CapabilityManifestSchema; } });
var capability_registry_entry_js_1 = require("./capability-registry-entry.cjs");
Object.defineProperty(exports, "CapabilityRegistryEntrySchema", { enumerable: true, get: function () { return capability_registry_entry_js_1.CapabilityRegistryEntrySchema; } });
Object.defineProperty(exports, "toEndpoint", { enumerable: true, get: function () { return capability_registry_entry_js_1.toEndpoint; } });
Object.defineProperty(exports, "fromEndpoint", { enumerable: true, get: function () { return capability_registry_entry_js_1.fromEndpoint; } });
var agent_registry_file_js_1 = require("./agent-registry-file.cjs");
Object.defineProperty(exports, "AgentRegistryFileSchema", { enumerable: true, get: function () { return agent_registry_file_js_1.AgentRegistryFileSchema; } });
var env_schema_js_1 = require("./env-schema.cjs");
Object.defineProperty(exports, "EnvSchemaFieldSchema", { enumerable: true, get: function () { return env_schema_js_1.EnvSchemaFieldSchema; } });
Object.defineProperty(exports, "EnvSchemaDocSchema", { enumerable: true, get: function () { return env_schema_js_1.EnvSchemaDocSchema; } });
var health_status_js_1 = require("./health-status.cjs");
Object.defineProperty(exports, "HealthStatusSchema", { enumerable: true, get: function () { return health_status_js_1.HealthStatusSchema; } });
__exportStar(require("./capability-turn-lead.cjs"), exports);
__exportStar(require("./parameters.cjs"), exports);
__exportStar(require("./presentation.cjs"), exports);
// Per-call capability context: trusted identity + minimal versioned credentials (R3, v1.31.0)
__exportStar(require("./capability-call-context.cjs"), exports);
// cap-agent-elevenlabs: idempotent provisioning, provider mapping, external channel state (R6, v1.31.0)
__exportStar(require("./agent-elevenlabs/index.cjs"), exports);
// cap-coach: programs, sessions, progress, minute budget per tenant/owner/agent/person (R6, v1.31.0)
__exportStar(require("./coach/index.cjs"), exports);
// Signed approvals: one shared passkey approval for every sensitive action of every agent (phase 59)
__exportStar(require("./approvals/index.cjs"), exports);
// cap-backup: restore points of the owner's servers, first client of the signed approvals (phase 59)
__exportStar(require("./backup/index.cjs"), exports);
// C3-B1: independent Web admission policy and server-owned invitations.
__exportStar(require("./agent-elevenlabs/web-channel.cjs"), exports);
__exportStar(require("./agent-elevenlabs/web-session.cjs"), exports);
__exportStar(require("./agent-elevenlabs/web-catalog.cjs"), exports);
__exportStar(require("./agent-elevenlabs/web-context.cjs"), exports);
__exportStar(require("./paperclip/index.cjs"), exports);
__exportStar(require("./agent-elevenlabs/web-browser.cjs"), exports);
__exportStar(require("./agent-elevenlabs/web-invitations.cjs"), exports);
//# sourceMappingURL=index.js.map