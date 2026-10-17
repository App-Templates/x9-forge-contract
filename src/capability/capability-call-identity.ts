import type { z } from 'zod';
import { InternalMemoryExtractRequestSchema } from '../http/endpoints/internal-memory-extract.js';

/** Trusted identity shared by capability admission and native per-agent turns. */
export const CapabilityCallIdentitySchema = InternalMemoryExtractRequestSchema.pick({
  tenantId: true,
  ownerId: true,
  agentId: true,
  userId: true,
}).strict();
export type CapabilityCallIdentity = z.infer<typeof CapabilityCallIdentitySchema>;

/**
 * Agent-level scope of capability data (no person): e.g. one provider resource or one program per agent.
 * Lives beside the identity so leaf contracts can use it without loading the call-context graph.
 */
export const CapabilityAgentScopeSchema = CapabilityCallIdentitySchema.omit({ userId: true }); // strict, inherited
export type CapabilityAgentScope = z.infer<typeof CapabilityAgentScopeSchema>;
