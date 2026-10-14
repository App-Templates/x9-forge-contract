import { z } from 'zod';
/** Private memory belongs to one agent and is never company memory. */
export declare const CompanyMemoryScopeSchema: z.ZodEnum<{
    private: "private";
    team: "team";
    organization: "organization";
}>;
export type CompanyMemoryScope = z.infer<typeof CompanyMemoryScopeSchema>;
/** A memory reference; organization-wide entries require a publication reference. */
export declare const CompanyMemoryEntryRefSchema: z.ZodObject<{
    context: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        organizationId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    scope: z.ZodEnum<{
        private: "private";
        team: "team";
        organization: "organization";
    }>;
    entryId: z.ZodString;
    ownerAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    publishedFrom: z.ZodOptional<z.ZodObject<{
        publicationSlug: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CompanyMemoryEntryRef = z.infer<typeof CompanyMemoryEntryRefSchema>;
//# sourceMappingURL=company-memory.d.ts.map