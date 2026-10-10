import { z } from 'zod';
export declare const RagAuthorizedDocumentRefSchema: z.ZodObject<{
    identity: z.ZodObject<{
        tenant_id: z.ZodString;
        owner_id: z.ZodString;
        agent_id: z.ZodString;
    }, z.core.$strict>;
    corpus_id: z.ZodString;
    corpus_revision: z.ZodString;
    assignment_id: z.ZodUUID;
    authorization_revision: z.ZodString;
    document_id: z.ZodString;
    revision_id: z.ZodString;
}, z.core.$strict>;
export type RagAuthorizedDocumentRef = z.infer<typeof RagAuthorizedDocumentRefSchema>;
export declare const RagQualifiedCitationSchema: z.ZodObject<{
    document: z.ZodObject<{
        identity: z.ZodObject<{
            tenant_id: z.ZodString;
            owner_id: z.ZodString;
            agent_id: z.ZodString;
        }, z.core.$strict>;
        corpus_id: z.ZodString;
        corpus_revision: z.ZodString;
        assignment_id: z.ZodUUID;
        authorization_revision: z.ZodString;
        document_id: z.ZodString;
        revision_id: z.ZodString;
    }, z.core.$strict>;
    title: z.ZodString;
    chunk_text: z.ZodString;
    score: z.ZodNumber;
    chunk_index: z.ZodOptional<z.ZodNumber>;
    observed_at: z.ZodISODateTime;
}, z.core.$strict>;
export type RagQualifiedCitation = z.infer<typeof RagQualifiedCitationSchema>;
export declare function isRagQualifiedCitationForContext(raw: unknown, rawContext: unknown, currentAssignment: unknown, expectedIdentity: unknown, expectedDocument: unknown, now: Date): boolean;
//# sourceMappingURL=qualified-citation.d.ts.map