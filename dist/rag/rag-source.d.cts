import { z } from 'zod';
/**
 * rag_source_sync + rag_source_status tools — source admin surface.
 *
 * @module @x9-forge/contracts/rag (rag-source)
 *
 * ADR-cap-rag.md §14 (rag_source_connections, rag_jobs) + §20.1 (tool surface).
 *
 * Cross-repo contract between cap-rag and:
 *  - agent-core tool router (calls cap-rag /call/rag_source_* endpoints)
 *  - Forge UI (surfaces sync state per connection)
 */
export declare const RagSourceConnectionSchema: z.ZodObject<{
    id: z.ZodString;
    tenant_id: z.ZodString;
    owner_id: z.ZodString;
    agent_id: z.ZodString;
    provider: z.ZodEnum<{
        upload: "upload";
        local_folder: "local_folder";
        notion: "notion";
        gdocs: "gdocs";
        gdrive: "gdrive";
        slack: "slack";
        gmail: "gmail";
    }>;
    status: z.ZodEnum<{
        error: "error";
        active: "active";
        paused: "paused";
    }>;
    last_sync_at: z.ZodNullable<z.ZodString>;
    last_sync_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    credential_ref: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export type RagSourceConnection = z.infer<typeof RagSourceConnectionSchema>;
export declare const RagJobTypeSchema: z.ZodEnum<{
    full_sync: "full_sync";
    incremental_sync: "incremental_sync";
    parse: "parse";
    index: "index";
    extraction: "extraction";
    entity_resolution: "entity_resolution";
    claim_validation: "claim_validation";
    conflict_resolution: "conflict_resolution";
    state_synthesis: "state_synthesis";
    changes_digest: "changes_digest";
    timeline_extraction: "timeline_extraction";
    coherence_check: "coherence_check";
    kg_cleanup: "kg_cleanup";
    reindex: "reindex";
    topic_eval: "topic_eval";
}>;
export type RagJobType = z.infer<typeof RagJobTypeSchema>;
export declare const RagJobStatusSchema: z.ZodEnum<{
    pending: "pending";
    running: "running";
    completed: "completed";
    failed: "failed";
    cancelled: "cancelled";
}>;
export type RagJobStatus = z.infer<typeof RagJobStatusSchema>;
export declare const RagSyncJobSummarySchema: z.ZodObject<{
    id: z.ZodString;
    job_type: z.ZodEnum<{
        full_sync: "full_sync";
        incremental_sync: "incremental_sync";
        parse: "parse";
        index: "index";
        extraction: "extraction";
        entity_resolution: "entity_resolution";
        claim_validation: "claim_validation";
        conflict_resolution: "conflict_resolution";
        state_synthesis: "state_synthesis";
        changes_digest: "changes_digest";
        timeline_extraction: "timeline_extraction";
        coherence_check: "coherence_check";
        kg_cleanup: "kg_cleanup";
        reindex: "reindex";
        topic_eval: "topic_eval";
    }>;
    status: z.ZodEnum<{
        pending: "pending";
        running: "running";
        completed: "completed";
        failed: "failed";
        cancelled: "cancelled";
    }>;
    source_connection_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodString;
    started_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    completed_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type RagSyncJobSummary = z.infer<typeof RagSyncJobSummarySchema>;
export declare const RagSourceStatusSchema: z.ZodObject<{
    source: z.ZodObject<{
        id: z.ZodString;
        tenant_id: z.ZodString;
        owner_id: z.ZodString;
        agent_id: z.ZodString;
        provider: z.ZodEnum<{
            upload: "upload";
            local_folder: "local_folder";
            notion: "notion";
            gdocs: "gdocs";
            gdrive: "gdrive";
            slack: "slack";
            gmail: "gmail";
        }>;
        status: z.ZodEnum<{
            error: "error";
            active: "active";
            paused: "paused";
        }>;
        last_sync_at: z.ZodNullable<z.ZodString>;
        last_sync_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        credential_ref: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>;
    doc_count: z.ZodNumber;
    last_job: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        job_type: z.ZodEnum<{
            full_sync: "full_sync";
            incremental_sync: "incremental_sync";
            parse: "parse";
            index: "index";
            extraction: "extraction";
            entity_resolution: "entity_resolution";
            claim_validation: "claim_validation";
            conflict_resolution: "conflict_resolution";
            state_synthesis: "state_synthesis";
            changes_digest: "changes_digest";
            timeline_extraction: "timeline_extraction";
            coherence_check: "coherence_check";
            kg_cleanup: "kg_cleanup";
            reindex: "reindex";
            topic_eval: "topic_eval";
        }>;
        status: z.ZodEnum<{
            pending: "pending";
            running: "running";
            completed: "completed";
            failed: "failed";
            cancelled: "cancelled";
        }>;
        source_connection_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        created_at: z.ZodString;
        started_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        completed_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type RagSourceStatus = z.infer<typeof RagSourceStatusSchema>;
export declare const RagSourceSyncRequestSchema: z.ZodObject<{
    source_connection_id: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<{
        full: "full";
        incremental: "incremental";
    }>>;
    tenant_id: z.ZodString;
    owner_id: z.ZodString;
    agent_id: z.ZodString;
}, z.core.$strip>;
export type RagSourceSyncRequest = z.infer<typeof RagSourceSyncRequestSchema>;
export declare const RagSourceSyncStatusSchema: z.ZodEnum<{
    enqueued: "enqueued";
    already_queued: "already_queued";
}>;
export type RagSourceSyncStatus = z.infer<typeof RagSourceSyncStatusSchema>;
export declare const RagSourceSyncResponseSchema: z.ZodObject<{
    job_id: z.ZodString;
    status: z.ZodEnum<{
        enqueued: "enqueued";
        already_queued: "already_queued";
    }>;
    source_connection_id: z.ZodString;
}, z.core.$strip>;
export type RagSourceSyncResponse = z.infer<typeof RagSourceSyncResponseSchema>;
export declare const RagSourceStatusRequestSchema: z.ZodObject<{
    tenant_id: z.ZodString;
    owner_id: z.ZodString;
    agent_id: z.ZodString;
    source_connection_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RagSourceStatusRequest = z.infer<typeof RagSourceStatusRequestSchema>;
export declare const RagSourceStatusResponseSchema: z.ZodObject<{
    sources: z.ZodArray<z.ZodObject<{
        source: z.ZodObject<{
            id: z.ZodString;
            tenant_id: z.ZodString;
            owner_id: z.ZodString;
            agent_id: z.ZodString;
            provider: z.ZodEnum<{
                upload: "upload";
                local_folder: "local_folder";
                notion: "notion";
                gdocs: "gdocs";
                gdrive: "gdrive";
                slack: "slack";
                gmail: "gmail";
            }>;
            status: z.ZodEnum<{
                error: "error";
                active: "active";
                paused: "paused";
            }>;
            last_sync_at: z.ZodNullable<z.ZodString>;
            last_sync_cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            credential_ref: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>;
        doc_count: z.ZodNumber;
        last_job: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            job_type: z.ZodEnum<{
                full_sync: "full_sync";
                incremental_sync: "incremental_sync";
                parse: "parse";
                index: "index";
                extraction: "extraction";
                entity_resolution: "entity_resolution";
                claim_validation: "claim_validation";
                conflict_resolution: "conflict_resolution";
                state_synthesis: "state_synthesis";
                changes_digest: "changes_digest";
                timeline_extraction: "timeline_extraction";
                coherence_check: "coherence_check";
                kg_cleanup: "kg_cleanup";
                reindex: "reindex";
                topic_eval: "topic_eval";
            }>;
            status: z.ZodEnum<{
                pending: "pending";
                running: "running";
                completed: "completed";
                failed: "failed";
                cancelled: "cancelled";
            }>;
            source_connection_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            created_at: z.ZodString;
            started_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            completed_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type RagSourceStatusResponse = z.infer<typeof RagSourceStatusResponseSchema>;
//# sourceMappingURL=rag-source.d.ts.map