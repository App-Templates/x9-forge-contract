import type { z } from 'zod';
/** Trusted identity shared by capability admission and native per-agent turns. */
export declare const CapabilityCallIdentitySchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type CapabilityCallIdentity = z.infer<typeof CapabilityCallIdentitySchema>;
/**
 * Agent-level scope of capability data (no person): e.g. one provider resource or one program per agent.
 * Lives beside the identity so leaf contracts can use it without loading the call-context graph.
 */
export declare const CapabilityAgentScopeSchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type CapabilityAgentScope = z.infer<typeof CapabilityAgentScopeSchema>;
//# sourceMappingURL=capability-call-identity.d.ts.map