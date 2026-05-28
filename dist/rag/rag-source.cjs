"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagSourceStatusResponseSchema = exports.RagSourceStatusRequestSchema = exports.RagSourceSyncResponseSchema = exports.RagSourceSyncStatusSchema = exports.RagSourceSyncRequestSchema = exports.RagSourceStatusSchema = exports.RagSyncJobSummarySchema = exports.RagJobStatusSchema = exports.RagJobTypeSchema = exports.RagSourceConnectionSchema = void 0;
const zod_1 = require("zod");
const rag_common_js_1 = require("./rag-common.cjs");
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
exports.RagSourceConnectionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenant_id: zod_1.z.string(),
    owner_id: zod_1.z.string(),
    agent_id: zod_1.z.string(),
    provider: rag_common_js_1.RagProviderSchema,
    status: rag_common_js_1.RagSourceStatusEnumSchema,
    last_sync_at: zod_1.z.string().nullable(),
    last_sync_cursor: zod_1.z.string().nullable().optional(),
    credential_ref: zod_1.z.string().nullable().optional(),
    config: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
// ADR §14 rag_jobs.job_type — canonical list shared with cap-rag worker handlers.
exports.RagJobTypeSchema = zod_1.z.enum([
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
exports.RagJobStatusSchema = zod_1.z.enum([
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
]);
exports.RagSyncJobSummarySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    job_type: exports.RagJobTypeSchema,
    status: exports.RagJobStatusSchema,
    source_connection_id: zod_1.z.string().uuid().nullable().optional(),
    created_at: zod_1.z.string(),
    started_at: zod_1.z.string().nullable().optional(),
    completed_at: zod_1.z.string().nullable().optional(),
    error: zod_1.z.string().nullable().optional(),
});
exports.RagSourceStatusSchema = zod_1.z.object({
    source: exports.RagSourceConnectionSchema,
    doc_count: zod_1.z.number().int().min(0),
    last_job: exports.RagSyncJobSummarySchema.nullable().optional(),
});
// -- rag_source_sync ---------------------------------------------------------
exports.RagSourceSyncRequestSchema = zod_1.z.object({
    source_connection_id: zod_1.z.string().uuid(),
    mode: zod_1.z.enum(['full', 'incremental']).default('incremental'),
    tenant_id: zod_1.z.string().min(1),
    owner_id: zod_1.z.string().min(1),
    agent_id: zod_1.z.string().min(1),
});
// ADR §20.1 — rag_source_sync response: idempotent enqueue (existing-pending guard).
exports.RagSourceSyncStatusSchema = zod_1.z.enum(['enqueued', 'already_queued']);
exports.RagSourceSyncResponseSchema = zod_1.z.object({
    job_id: zod_1.z.string().uuid(),
    status: exports.RagSourceSyncStatusSchema,
    source_connection_id: zod_1.z.string().uuid(),
});
// -- rag_source_status -------------------------------------------------------
exports.RagSourceStatusRequestSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().min(1),
    owner_id: zod_1.z.string().min(1),
    agent_id: zod_1.z.string().min(1),
    source_connection_id: zod_1.z.string().uuid().optional(),
});
exports.RagSourceStatusResponseSchema = zod_1.z.object({
    sources: zod_1.z.array(exports.RagSourceStatusSchema),
});
//# sourceMappingURL=rag-source.js.map