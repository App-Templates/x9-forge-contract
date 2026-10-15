import { z } from 'zod';
/** Lifecycle of a published piece of knowledge. */
export declare const KnowledgeStatusSchema: z.ZodEnum<{
    proposed: "proposed";
    current: "current";
    withdrawn: "withdrawn";
}>;
export type KnowledgeStatus = z.infer<typeof KnowledgeStatusSchema>;
export declare const KnowledgeKindSchema: z.ZodEnum<{
    decision: "decision";
    procedure: "procedure";
    knowledge: "knowledge";
}>;
export type KnowledgeKind = z.infer<typeof KnowledgeKindSchema>;
/** Proof a publication stands on: a reference with its digest, never content. */
export declare const KnowledgeEvidenceRefSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        source: "source";
        decision: "decision";
        run_receipt: "run_receipt";
        experience: "experience";
    }>;
    id: z.ZodString;
    digest: z.ZodString;
}, z.core.$strict>;
export type KnowledgeEvidenceRef = z.infer<typeof KnowledgeEvidenceRefSchema>;
/**
 * Publication of knowledge with provenance and version chain. Strict: no field
 * can enable tools or permissions.
 */
export declare const KnowledgePublicationSchema: z.ZodObject<{
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
    kind: z.ZodEnum<{
        decision: "decision";
        procedure: "procedure";
        knowledge: "knowledge";
    }>;
    status: z.ZodEnum<{
        proposed: "proposed";
        current: "current";
        withdrawn: "withdrawn";
    }>;
    evidence: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            source: "source";
            decision: "decision";
            run_receipt: "run_receipt";
            experience: "experience";
        }>;
        id: z.ZodString;
        digest: z.ZodString;
    }, z.core.$strict>>;
    supersedes: z.ZodOptional<z.ZodNumber>;
    validFrom: z.ZodISODateTime;
    validUntil: z.ZodOptional<z.ZodISODateTime>;
    contradicts: z.ZodOptional<z.ZodArray<z.ZodString>>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type KnowledgePublication = z.infer<typeof KnowledgePublicationSchema>;
//# sourceMappingURL=knowledge-publication.d.ts.map