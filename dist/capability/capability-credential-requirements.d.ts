import { z } from 'zod';
/** Fields a capability explicitly consumes from an admitted agent context, never their values. */
export declare const CapabilityCredentialRequirementSchema: z.ZodObject<{
    key: z.ZodLazy<z.ZodString>;
    required: z.ZodBoolean;
}, z.core.$strict>;
export type CapabilityCredentialRequirement = z.infer<typeof CapabilityCredentialRequirementSchema>;
/** Absence of this declaration grants no new projection authority; an explicit empty list needs no fields. */
export declare const CapabilityCredentialRequirementsSchema: z.ZodArray<z.ZodObject<{
    key: z.ZodLazy<z.ZodString>;
    required: z.ZodBoolean;
}, z.core.$strict>>;
export type CapabilityCredentialRequirements = z.infer<typeof CapabilityCredentialRequirementsSchema>;
//# sourceMappingURL=capability-credential-requirements.d.ts.map