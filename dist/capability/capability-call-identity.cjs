"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityCallIdentitySchema = void 0;
const internal_memory_extract_js_1 = require("../http/endpoints/internal-memory-extract.cjs");
/** Trusted identity shared by capability admission and native per-agent turns. */
exports.CapabilityCallIdentitySchema = internal_memory_extract_js_1.InternalMemoryExtractRequestSchema.pick({
    tenantId: true,
    ownerId: true,
    agentId: true,
    userId: true,
}).strict();
//# sourceMappingURL=capability-call-identity.js.map