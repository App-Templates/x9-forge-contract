"use strict";
/**
 * Agent domain — cross-repo contracts for agent identity, context, and credentials.
 *
 * @module @x9-forge/contracts/agent
 * @see .planning/phases/02-agentcontext-split-block-b/02-RESEARCH.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAgentContext = exports.parseAgentContextFile = exports.hasTelegramBot = exports.AgentContextFileSchema = exports.AgentContextRuntimeFieldsSchema = exports.AgentContextCoreSchema = exports.LlmConfigSchema = exports.AUTH_GATE_FIELDS = exports.AgentCredentialsSchema = exports.KNOWN_CREDENTIAL_KEYS = exports.AgentIdentitySchema = exports.OwnerIdSchema = exports.AgentIdSchema = void 0;
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
Object.defineProperty(exports, "hasTelegramBot", { enumerable: true, get: function () { return agent_context_file_js_1.hasTelegramBot; } });
Object.defineProperty(exports, "parseAgentContextFile", { enumerable: true, get: function () { return agent_context_file_js_1.parseAgentContextFile; } });
// Parser helper
var parse_agent_context_js_1 = require("./parse-agent-context.cjs");
Object.defineProperty(exports, "parseAgentContext", { enumerable: true, get: function () { return parse_agent_context_js_1.parseAgentContext; } });
//# sourceMappingURL=index.js.map