"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentIdentitySchema = exports.OwnerIdSchema = exports.AgentIdSchema = void 0;
const zod_1 = require("zod");
/** Branded string type for agent identifiers. Prevents agentId/ownerId confusion. */
exports.AgentIdSchema = zod_1.z.string().min(1).brand();
/** Branded string type for owner (Clerk user) identifiers. */
exports.OwnerIdSchema = zod_1.z.string().min(1).brand();
/** Cross-repo agent identity. Both Forge and X9 use this to identify an agent. */
exports.AgentIdentitySchema = zod_1.z.object({
    agentId: exports.AgentIdSchema,
    ownerId: exports.OwnerIdSchema,
});
//# sourceMappingURL=agent-identity.js.map