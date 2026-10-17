import { InternalMemoryExtractRequestSchema } from "../http/endpoints/internal-memory-extract.js";
/** Trusted identity shared by capability admission and native per-agent turns. */
export const CapabilityCallIdentitySchema = InternalMemoryExtractRequestSchema.pick({
    tenantId: true,
    ownerId: true,
    agentId: true,
    userId: true,
}).strict();
//# sourceMappingURL=capability-call-identity.js.map