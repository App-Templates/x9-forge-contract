import { z } from 'zod';
import { RagProviderSchema, RagSourceStatusEnumSchema, } from "./rag-common.js";
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
// -- Source connection + job summary -----------------------------------------
export const RagSourceConnectionSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string(),
    owner_id: z.string(),
    agent_id: z.string(),
    provider: RagProviderSchema,
    status: RagSourceStatusEnumSchema,
    last_sync_at: z.string().nullable(),
    last_sync_cursor: z.string().nullable().optional(),
    credential_ref: z.string().nullable().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
});
// ADR §14 rag_jobs.job_type — canonical list shared with cap-rag worker handlers.
export const RagJobTypeSchema = z.enum([
    'full_sync',
    'incremental_sync',
    'parse',
    'index',
    'extraction',
    'entity_resolution',
    'claim_validation',
    'conflict_resolution',
    'state_synthesis',
    'changes_digest',
    'timeline_extraction',
    'coherence_check',
    'kg_cleanup',
    'reindex',
    'topic_eval',
]);
export const RagJobStatusSchema = z.enum([
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
]);
export const RagSyncJobSummarySchema = z.object({
    id: z.string().uuid(),
    job_type: RagJobTypeSchema,
    status: RagJobStatusSchema,
    source_connection_id: z.string().uuid().nullable().optional(),
    created_at: z.string(),
    started_at: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
    error: z.string().nullable().optional(),
});
export const RagSourceStatusSchema = z.object({
    source: RagSourceConnectionSchema,
    doc_count: z.number().int().min(0),
    last_job: RagSyncJobSummarySchema.nullable().optional(),
});
// -- rag_source_sync ---------------------------------------------------------
export const RagSourceSyncRequestSchema = z.object({
    source_connection_id: z.string().uuid(),
    mode: z.enum(['full', 'incremental']).default('incremental'),
    tenant_id: z.string().min(1),
    owner_id: z.string().min(1),
    agent_id: z.string().min(1),
});
// ADR §20.1 — rag_source_sync response: idempotent enqueue (existing-pending guard).
export const RagSourceSyncStatusSchema = z.enum(['enqueued', 'already_queued']);
export const RagSourceSyncResponseSchema = z.object({
    job_id: z.string().uuid(),
    status: RagSourceSyncStatusSchema,
    source_connection_id: z.string().uuid(),
});
// -- rag_source_status -------------------------------------------------------
export const RagSourceStatusRequestSchema = z.object({
    tenant_id: z.string().min(1),
    owner_id: z.string().min(1),
    agent_id: z.string().min(1),
    source_connection_id: z.string().uuid().optional(),
});
export const RagSourceStatusResponseSchema = z.object({
    sources: z.array(RagSourceStatusSchema),
});
//# sourceMappingURL=rag-source.js.map