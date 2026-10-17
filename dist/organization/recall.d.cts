import { z } from 'zod';
/** Organizational context a recall request is made on behalf of. */
export declare const OrganizationRecallContextSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type OrganizationRecallContext = z.infer<typeof OrganizationRecallContextSchema>;
/** Authorized reference returned by recall. Carries no content. */
export declare const OrganizationRecallReferenceSchema: z.ZodObject<{
    ref: z.ZodObject<{
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
    authorizedAt: z.ZodISODateTime;
    bindingVersion: z.ZodNumber;
}, z.core.$strict>;
export type OrganizationRecallReference = z.infer<typeof OrganizationRecallReferenceSchema>;
//# sourceMappingURL=recall.d.ts.map