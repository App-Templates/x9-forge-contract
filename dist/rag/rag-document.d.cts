import { z } from 'zod';
/**
 * rag_document_list + rag_document_open tools — document access surface.
 *
 * @module @x9-forge/contracts/rag (rag-document)
 *
 * ADR-cap-rag.md §14 (rag_documents, rag_document_revisions) + §19.2 (ACL hard filter)
 * + §20.1 (tool surface) + §22.1 (privacy levels).
 *
 * Cross-repo contract between cap-rag and:
 *  - agent-core tool router
 *  - Forge UI document viewer (Phase 37.7)
 */
export declare const RagDocumentParseStatusSchema: z.ZodEnum<{
    success: "success";
    skipped: "skipped";
    failed: "failed";
    blocked_secret: "blocked_secret";
}>;
export type RagDocumentParseStatus = z.infer<typeof RagDocumentParseStatusSchema>;
export declare const RagDocumentStatusSchema: z.ZodEnum<{
    active: "active";
    superseded: "superseded";
    deleted: "deleted";
}>;
export type RagDocumentStatus = z.infer<typeof RagDocumentStatusSchema>;
export declare const RagDocumentRefSchema: z.ZodObject<{
    id: z.ZodString;
    tenant_id: z.ZodString;
    owner_id: z.ZodString;
    agent_id: z.ZodString;
    title: z.ZodString;
    provider: z.ZodEnum<{
        upload: "upload";
        local_folder: "local_folder";
        notion: "notion";
        gdocs: "gdocs";
        gdrive: "gdrive";
        slack: "slack";
        gmail: "gmail";
    }>;
    source_kind: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    privacy_level: z.ZodOptional<z.ZodEnum<{
        standard: "standard";
        secret: "secret";
        sensitive: "sensitive";
        restricted: "restricted";
        third_party: "third_party";
    }>>;
    status: z.ZodEnum<{
        active: "active";
        superseded: "superseded";
        deleted: "deleted";
    }>;
    created_at: z.ZodString;
    last_revision_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type RagDocumentRef = z.infer<typeof RagDocumentRefSchema>;
export declare const RagDocumentRevisionRefSchema: z.ZodObject<{
    id: z.ZodString;
    document_id: z.ZodString;
    revision_hash: z.ZodString;
    created_at: z.ZodString;
    parse_status: z.ZodOptional<z.ZodEnum<{
        success: "success";
        skipped: "skipped";
        failed: "failed";
        blocked_secret: "blocked_secret";
    }>>;
}, z.core.$strip>;
export type RagDocumentRevisionRef = z.infer<typeof RagDocumentRevisionRefSchema>;
export declare const RagDocumentListRequestSchema: z.ZodObject<{
    tenant_id: z.ZodString;
    owner_id: z.ZodString;
    agent_id: z.ZodString;
    corpus_id: z.ZodOptional<z.ZodString>;
    topic_id: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodEnum<{
        upload: "upload";
        local_folder: "local_folder";
        notion: "notion";
        gdocs: "gdocs";
        gdrive: "gdrive";
        slack: "slack";
        gmail: "gmail";
    }>>;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type RagDocumentListRequest = z.infer<typeof RagDocumentListRequestSchema>;
export declare const RagDocumentListResponseSchema: z.ZodObject<{
    documents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenant_id: z.ZodString;
        owner_id: z.ZodString;
        agent_id: z.ZodString;
        title: z.ZodString;
        provider: z.ZodEnum<{
            upload: "upload";
            local_folder: "local_folder";
            notion: "notion";
            gdocs: "gdocs";
            gdrive: "gdrive";
            slack: "slack";
            gmail: "gmail";
        }>;
        source_kind: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        privacy_level: z.ZodOptional<z.ZodEnum<{
            standard: "standard";
            secret: "secret";
            sensitive: "sensitive";
            restricted: "restricted";
            third_party: "third_party";
        }>>;
        status: z.ZodEnum<{
            active: "active";
            superseded: "superseded";
            deleted: "deleted";
        }>;
        created_at: z.ZodString;
        last_revision_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
    next_cursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type RagDocumentListResponse = z.infer<typeof RagDocumentListResponseSchema>;
export declare const RagDocumentOpenRequestSchema: z.ZodObject<{
    tenant_id: z.ZodString;
    owner_id: z.ZodString;
    agent_id: z.ZodString;
    document_id: z.ZodString;
    revision_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RagDocumentOpenRequest = z.infer<typeof RagDocumentOpenRequestSchema>;
export declare const RagDocumentOpenResponseSchema: z.ZodObject<{
    document: z.ZodObject<{
        id: z.ZodString;
        tenant_id: z.ZodString;
        owner_id: z.ZodString;
        agent_id: z.ZodString;
        title: z.ZodString;
        provider: z.ZodEnum<{
            upload: "upload";
            local_folder: "local_folder";
            notion: "notion";
            gdocs: "gdocs";
            gdrive: "gdrive";
            slack: "slack";
            gmail: "gmail";
        }>;
        source_kind: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        privacy_level: z.ZodOptional<z.ZodEnum<{
            standard: "standard";
            secret: "secret";
            sensitive: "sensitive";
            restricted: "restricted";
            third_party: "third_party";
        }>>;
        status: z.ZodEnum<{
            active: "active";
            superseded: "superseded";
            deleted: "deleted";
        }>;
        created_at: z.ZodString;
        last_revision_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
    revision: z.ZodObject<{
        id: z.ZodString;
        document_id: z.ZodString;
        revision_hash: z.ZodString;
        created_at: z.ZodString;
        parse_status: z.ZodOptional<z.ZodEnum<{
            success: "success";
            skipped: "skipped";
            failed: "failed";
            blocked_secret: "blocked_secret";
        }>>;
    }, z.core.$strip>;
    raw_excerpt: z.ZodNullable<z.ZodString>;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
export type RagDocumentOpenResponse = z.infer<typeof RagDocumentOpenResponseSchema>;
//# sourceMappingURL=rag-document.d.ts.map