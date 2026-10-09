import { z } from 'zod';
/** Trusted identity shared by capability admission and native per-agent turns. */
export declare const CapabilityCallIdentitySchema: z.ZodObject<{
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type CapabilityCallIdentity = z.infer<typeof CapabilityCallIdentitySchema>;
//# sourceMappingURL=capability-call-identity.d.ts.map