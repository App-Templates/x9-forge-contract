"use strict";
/**
 * Agent domain — cross-repo contracts for agent identity, context, and credentials.
 *
 * @module @x9-forge/contracts/agent
 * @see .planning/phases/02-agentcontext-split-block-b/02-RESEARCH.md
 */
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
exports.parseAgentContext = exports.agentContextJsonPath = exports.agentRegistryPath = exports.agentWorkspacePath = exports.parseAgentContextFileForWrite = exports.parseAgentContextFile = exports.appliedAgentConfigVersion = exports.hasTelegramBot = exports.AgentContextFileWriteSchema = exports.AgentContextFileSchema = exports.AgentContextRuntimeFieldsSchema = exports.AgentContextCoreSchema = exports.LlmConfigSchema = exports.AUTH_GATE_FIELDS = exports.AgentCredentialsSchema = exports.KNOWN_CREDENTIAL_KEYS = exports.AgentIdentitySchema = exports.OwnerIdSchema = exports.AgentIdSchema = void 0;
// Identity (branded types)
var agent_identity_js_1 = require("./agent-identity.cjs");
Object.defineProperty(exports, "AgentIdSchema", { enumerable: true, get: function () { return agent_identity_js_1.AgentIdSchema; } });
Object.defineProperty(exports, "OwnerIdSchema", { enumerable: true, get: function () { return agent_identity_js_1.OwnerIdSchema; } });
Object.defineProperty(exports, "AgentIdentitySchema", { enumerable: true, get: function () { return agent_identity_js_1.AgentIdentitySchema; } });
// Credentials (discriminated known keys + catchall)
var agent_credentials_js_1 = require("./agent-credentials.cjs");
Object.defineProperty(exports, "KNOWN_CREDENTIAL_KEYS", { enumerable: true, get: function () { return agent_credentials_js_1.KNOWN_CREDENTIAL_KEYS; } });
Object.defineProperty(exports, "AgentCredentialsSchema", { enumerable: true, get: function () { return agent_credentials_js_1.AgentCredentialsSchema; } });
Object.defineProperty(exports, "AUTH_GATE_FIELDS", { enumerable: true, get: function () { return agent_credentials_js_1.AUTH_GATE_FIELDS; } });
// Context Core (cross-repo contract)
var agent_context_core_js_1 = require("./agent-context-core.cjs");
Object.defineProperty(exports, "LlmConfigSchema", { enumerable: true, get: function () { return agent_context_core_js_1.LlmConfigSchema; } });
Object.defineProperty(exports, "AgentContextCoreSchema", { enumerable: true, get: function () { return agent_context_core_js_1.AgentContextCoreSchema; } });
// Context File (FULL context.json contract: Core + Runtime fields — F-1)
var agent_context_file_js_1 = require("./agent-context-file.cjs");
Object.defineProperty(exports, "AgentContextRuntimeFieldsSchema", { enumerable: true, get: function () { return agent_context_file_js_1.AgentContextRuntimeFieldsSchema; } });
Object.defineProperty(exports, "AgentContextFileSchema", { enumerable: true, get: function () { return agent_context_file_js_1.AgentContextFileSchema; } });
Object.defineProperty(exports, "AgentContextFileWriteSchema", { enumerable: true, get: function () { return agent_context_file_js_1.AgentContextFileWriteSchema; } });
Object.defineProperty(exports, "hasTelegramBot", { enumerable: true, get: function () { return agent_context_file_js_1.hasTelegramBot; } });
Object.defineProperty(exports, "appliedAgentConfigVersion", { enumerable: true, get: function () { return agent_context_file_js_1.appliedAgentConfigVersion; } });
Object.defineProperty(exports, "parseAgentContextFile", { enumerable: true, get: function () { return agent_context_file_js_1.parseAgentContextFile; } });
Object.defineProperty(exports, "parseAgentContextFileForWrite", { enumerable: true, get: function () { return agent_context_file_js_1.parseAgentContextFileForWrite; } });
// Canonical on-disk path derivation (Bug #15 path-drift fix — F-path)
var agent_paths_js_1 = require("./agent-paths.cjs");
Object.defineProperty(exports, "agentWorkspacePath", { enumerable: true, get: function () { return agent_paths_js_1.agentWorkspacePath; } });
Object.defineProperty(exports, "agentRegistryPath", { enumerable: true, get: function () { return agent_paths_js_1.agentRegistryPath; } });
Object.defineProperty(exports, "agentContextJsonPath", { enumerable: true, get: function () { return agent_paths_js_1.agentContextJsonPath; } });
// Parser helper
var parse_agent_context_js_1 = require("./parse-agent-context.cjs");
Object.defineProperty(exports, "parseAgentContext", { enumerable: true, get: function () { return parse_agent_context_js_1.parseAgentContext; } });
// Explicit management/runtime identities
__exportStar(require("./agent-runtime-identity.cjs"), exports);
// Canonical runtime evidence, per-channel state and readiness
__exportStar(require("./agent-runtime-state.cjs"), exports);
// Runtime list source availability and completeness
__exportStar(require("./agent-runtime-source.cjs"), exports);
// R1b logical management: lifecycle/apply-config commands, versions, per-target outcomes (v1.31.0)
__exportStar(require("./agent-management.cjs"), exports);
// Scope and action policy: allow/ask/deny per capability/tool, approvals, action log (R5, v1.31.0)
__exportStar(require("./agent-scope-policy.cjs"), exports);
// R2: scoped birth channels, optional context extension and replayable creation.
__exportStar(require("./agent-channel-configuration.cjs"), exports);
__exportStar(require("./agent-creation-replay.cjs"), exports);
__exportStar(require("./agent-channel-attestation.cjs"), exports);
// R7 / D-A9: versioned human core and generated progressive skills.
__exportStar(require("./agent-workspace.cjs"), exports);
// Public, metadata-only observations from the per-agent registry.
__exportStar(require("./agent-inventory-metadata.cjs"), exports);
// Canonical credential service metadata, never credential values.
__exportStar(require("./agent-credential-services.cjs"), exports);
// C1 explicit door access; policy absence retains legacy behavior.
__exportStar(require("./agent-channel-access.cjs"), exports);
__exportStar(require("./agent-channel-access-requests.cjs"), exports);
// C2 shared phone door, separately scoped from the two birth channels.
__exportStar(require("./agent-phone-channel.cjs"), exports);
__exportStar(require("./agent-phone-commands.cjs"), exports);
// Forge-declared context authority, including explicit Master/heir provenance.
__exportStar(require("./agent-context-identity.cjs"), exports);
// C5 resource operations for existing agents; no credential material.
__exportStar(require("./agent-channel-resource-operation.cjs"), exports);
// C5 permanent single-agent deletion, separate from lifecycle and archival.
__exportStar(require("./agent-deletion.cjs"), exports);
// C5: exact telephone admission and explicit server-owned outbound correlation.
__exportStar(require("./agent-phone-admission.cjs"), exports);
__exportStar(require("./agent-channel-history.cjs"), exports);
__exportStar(require("./agent-channel-history-content.cjs"), exports);
//# sourceMappingURL=index.js.map