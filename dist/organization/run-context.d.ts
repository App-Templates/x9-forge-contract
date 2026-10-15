import { z } from 'zod';
/** Branded identifier of one run of an organization (agentic team). */
export declare const RunIdSchema: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
export type RunId = z.infer<typeof RunIdSchema>;
/** Who issued the run context. */
export declare const OrganizationRunIssuerSchema: z.ZodEnum<{
    x9: "x9";
    forge: "forge";
    paperclip: "paperclip";
}>;
export type OrganizationRunIssuer = z.infer<typeof OrganizationRunIssuerSchema>;
/**
 * Trusted context of one organization run. Carries identity and validity only:
 * no secrets, no private content, no free-form fields (strictObject).
 */
export declare const OrganizationRunContextSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    organizationId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    /** Attested person this run acts for, set by the context issuer (runtime), never the model.
     * Absent for group turns and runs without a person. */
    personRef: z.ZodOptional<z.ZodString>;
    issuer: z.ZodEnum<{
        x9: "x9";
        forge: "forge";
        paperclip: "paperclip";
    }>;
    issuedAt: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
export type OrganizationRunContext = z.infer<typeof OrganizationRunContextSchema>;
//# sourceMappingURL=run-context.d.ts.map