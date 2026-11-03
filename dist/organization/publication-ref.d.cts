import { z } from 'zod';
/** Scope the published content comes from. */
export declare const PublicationSourceScopeSchema: z.ZodEnum<{
    organization: "organization";
    private: "private";
    team: "team";
}>;
export type PublicationSourceScope = z.infer<typeof PublicationSourceScopeSchema>;
/** Who receives the publication. `department` is reserved: accepted as a type only. */
export declare const PublicationRecipientSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"organization">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"group">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"project">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"department">;
    id: z.ZodString;
}, z.core.$strict>], "kind">;
export type PublicationRecipient = z.infer<typeof PublicationRecipientSchema>;
/**
 * Reference to an explicit publication. A publication never widens visibility
 * by itself: a private source requires `explicit: true`. Carries no content.
 */
export declare const PublicationRefSchema: z.ZodObject<{
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
        personRef: z.ZodOptional<z.ZodString>;
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    sourceScope: z.ZodEnum<{
        organization: "organization";
        private: "private";
        team: "team";
    }>;
    slug: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    recipient: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"organization">;
        id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"group">;
        id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"project">;
        id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"department">;
        id: z.ZodString;
    }, z.core.$strict>], "kind">;
    explicit: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type PublicationRef = z.infer<typeof PublicationRefSchema>;
//# sourceMappingURL=publication-ref.d.ts.map