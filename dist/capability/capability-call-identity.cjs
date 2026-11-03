"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityAgentScopeSchema = exports.CapabilityCallIdentitySchema = void 0;
const internal_memory_extract_js_1 = require("../http/endpoints/internal-memory-extract.cjs");
/** Trusted identity shared by capability admission and native per-agent turns. */
exports.CapabilityCallIdentitySchema = internal_memory_extract_js_1.InternalMemoryExtractRequestSchema.pick({
    tenantId: true,
    ownerId: true,
    agentId: true,
    userId: true,
}).strict();
/**
 * Agent-level scope of capability data (no person): e.g. one provider resource or one program per agent.
 * Lives beside the identity so leaf contracts can use it without loading the call-context graph.
 */
exports.CapabilityAgentScopeSchema = exports.CapabilityCallIdentitySchema.omit({ userId: true }); // strict, inherited
//# sourceMappingURL=capability-call-identity.js.map