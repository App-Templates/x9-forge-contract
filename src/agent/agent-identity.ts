import { z } from 'zod';

/** Branded string type for agent identifiers. Prevents agentId/ownerId confusion. */
export const AgentIdSchema = z.string().min(1).brand<'AgentId'>();
export type AgentId = z.infer<typeof AgentIdSchema>;

/** Branded string type for owner (Clerk user) identifiers. */
export const OwnerIdSchema = z.string().min(1).brand<'OwnerId'>();
export type OwnerId = z.infer<typeof OwnerIdSchema>;

/** Cross-repo agent identity. Both Forge and X9 use this to identify an agent. */
export const AgentIdentitySchema = z.object({
  agentId: AgentIdSchema,
  ownerId: OwnerIdSchema,
});
export type AgentIdentity = z.infer<typeof AgentIdentitySchema>;
