import { z } from 'zod';
/**
 * Shared cap-rag primitives — cross-repo envelopes, enums, refs, error shapes.
 *
 * @module @x9-forge/contracts/rag (rag-common)
 *
 * ADR-cap-rag.md §21.2 — required cross-repo primitives.
 * Scope: API envelopes, statuses, source/provider enums, references, error shape.
 */
// ADR §14.3 / §21.2 — provider set (must stay in lockstep with cap-rag _bridge_mirror.py)
export const RagProviderSchema = z.enum([
    'upload',
    'local_folder',
    'notion',
    'gdocs',
    'gdrive',
    'slack',
    'gmail',
]);
// ADR §14 rag_source_connections.status
export const RagSourceStatusEnumSchema = z.enum(['active', 'paused', 'error']);
// ADR §22.1 privacy taxonomy (rag_documents.privacy_level + ACL gating)
export const RagPrivacyLevelSchema = z.enum([
    'standard',
    'sensitive',
    'secret',
    'third_party',
    'restricted',
]);
// ADR §14 rag_topics.topic_type
export const RagTopicTypeSchema = z.enum([
    'project',
    'product',
    'research',
    'personal',
    'other',
]);
// ADR §6.6 / §19.2 multi-tenancy hard filter envelope
export const RagIdentityEnvelopeSchema = z.object({
    tenant_id: z.string().min(1),
    owner_id: z.string().min(1),
    agent_id: z.string().min(1),
});
// Topic reference returned in topic tool responses
export const RagTopicRefSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    topic_type: RagTopicTypeSchema,
});
// Corpus reference
export const RagCorpusRefSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
});
// ADR §17 — claims produced by the extraction pipeline
export const RagClaimSchema = z.object({
    id: z.string().uuid(),
    topic_id: z.string().uuid(),
    claim_type: z.string(),
    subject_text: z.string(),
    predicate: z.string(),
    object_text: z.string(),
    confidence: z.number().min(0).max(1),
    salience: z.number().min(0).max(1),
    status: z.enum(['active', 'superseded', 'deleted']),
    resolved_entity_id: z.string().nullable().optional(),
});
// ADR §17.8 — conflict resolver output entry
export const RagClaimConflictSchema = z.object({
    id: z.string().uuid(),
    topic_id: z.string().uuid(),
    conflict_type: z.string(),
    affected_claim_ids: z.array(z.string().uuid()),
    resolution_method: z.enum(['auto', 'manual_review']).nullable().optional(),
    winning_claim_id: z.string().uuid().nullable().optional(),
});
// ADR §7.6 cost cap telemetry (per tool response / per job summary)
export const RagCostEstimateSchema = z.object({
    embedding_tokens: z.number().int().min(0).default(0),
    llm_input_tokens: z.number().int().min(0).default(0),
    llm_output_tokens: z.number().int().min(0).default(0),
    estimated_cost_usd: z.number().min(0).default(0),
});
// Standard tool-call error envelope (ADR §9.4 + §20.3)
export const RagToolErrorSchema = z.object({
    code: z.enum([
        'TOOL_NOT_FOUND',
        'TOOL_CALL_INVALID',
        'TOOL_EXEC_FAILED',
        'TOOL_ACL_DENIED',
        'TOOL_PRIVACY_BLOCKED',
        'TOOL_COST_EXCEEDED',
    ]),
    error: z.string(),
});
// Degraded-mode markers (ADR §4.4 / §4.5 Option C — Memory v2 unavailable fallback)
// These are OPTIONAL passthrough markers consumers may read to detect fallback state.
export const RagDegradedMarkersSchema = z.object({
    _degraded: z.boolean().optional(),
    _memory_v2: z.enum(['unavailable', 'available']).optional(),
    _mode: z.enum(['evidence_only', 'joint_read']).optional(),
    _cached: z.boolean().optional(),
    _stale: z.boolean().optional(),
    reason: z.string().optional(),
    _enqueued_job_id: z.string().uuid().optional(),
});
//# sourceMappingURL=rag-common.js.map