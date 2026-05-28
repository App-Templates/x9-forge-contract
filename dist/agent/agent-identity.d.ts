import { z } from 'zod';
/** Branded string type for agent identifiers. Prevents agentId/ownerId confusion. */
export declare const AgentIdSchema: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
export type AgentId = z.infer<typeof AgentIdSchema>;
/** Branded string type for owner (Clerk user) identifiers. */
export declare const OwnerIdSchema: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
export type OwnerId = z.infer<typeof OwnerIdSchema>;
/** Cross-repo agent identity. Both Forge and X9 use this to identify an agent. */
export declare const AgentIdentitySchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
}, z.core.$strip>;
export type AgentIdentity = z.infer<typeof AgentIdentitySchema>;
//# sourceMappingURL=agent-identity.d.ts.map