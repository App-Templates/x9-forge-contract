"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagDegradedMarkersSchema = exports.RagToolErrorSchema = exports.RagCostEstimateSchema = exports.RagClaimConflictSchema = exports.RagClaimSchema = exports.RagCorpusRefSchema = exports.RagTopicRefSchema = exports.RagIdentityEnvelopeSchema = exports.RagTopicTypeSchema = exports.RagPrivacyLevelSchema = exports.RagSourceStatusEnumSchema = exports.RagProviderSchema = void 0;
const zod_1 = require("zod");
/**
 * Shared cap-rag primitives — cross-repo envelopes, enums, refs, error shapes.
 *
 * @module @x9-forge/contracts/rag (rag-common)
 *
 * ADR-cap-rag.md §21.2 — required cross-repo primitives.
 * Scope: API envelopes, statuses, source/provider enums, references, error shape.
 */
// ADR §14.3 / §21.2 — provider set (must stay in lockstep with cap-rag _bridge_mirror.py)
exports.RagProviderSchema = zod_1.z.enum([
    'upload',
    'local_folder',
    'notion',
    'gdocs',
    'gdrive',
    'slack',
    'gmail',
]);
// ADR §14 rag_source_connections.status
exports.RagSourceStatusEnumSchema = zod_1.z.enum(['active', 'paused', 'error']);
// ADR §22.1 privacy taxonomy (rag_documents.privacy_level + ACL gating)
exports.RagPrivacyLevelSchema = zod_1.z.enum([
    'standard',
    'sensitive',
    'secret',
    'third_party',
    'restricted',
]);
// ADR §14 rag_topics.topic_type
exports.RagTopicTypeSchema = zod_1.z.enum([
    'project',
    'product',
    'research',
    'personal',
    'other',
]);
// ADR §6.6 / §19.2 multi-tenancy hard filter envelope
exports.RagIdentityEnvelopeSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().min(1),
    owner_id: zod_1.z.string().min(1),
    agent_id: zod_1.z.string().min(1),
});
// Topic reference returned in topic tool responses
exports.RagTopicRefSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    topic_type: exports.RagTopicTypeSchema,
});
// Corpus reference
exports.RagCorpusRefSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
});
// ADR §17 — claims produced by the extraction pipeline
exports.RagClaimSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    topic_id: zod_1.z.string().uuid(),
    claim_type: zod_1.z.string(),
    subject_text: zod_1.z.string(),
    predicate: zod_1.z.string(),
    object_text: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    salience: zod_1.z.number().min(0).max(1),
    status: zod_1.z.enum(['active', 'superseded', 'deleted']),
    resolved_entity_id: zod_1.z.string().nullable().optional(),
});
// ADR §17.8 — conflict resolver output entry
exports.RagClaimConflictSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    topic_id: zod_1.z.string().uuid(),
    conflict_type: zod_1.z.string(),
    affected_claim_ids: zod_1.z.array(zod_1.z.string().uuid()),
    resolution_method: zod_1.z.enum(['auto', 'manual_review']).nullable().optional(),
    winning_claim_id: zod_1.z.string().uuid().nullable().optional(),
});
// ADR §7.6 cost cap telemetry (per tool response / per job summary)
exports.RagCostEstimateSchema = zod_1.z.object({
    embedding_tokens: zod_1.z.number().int().min(0).default(0),
    llm_input_tokens: zod_1.z.number().int().min(0).default(0),
    llm_output_tokens: zod_1.z.number().int().min(0).default(0),
    estimated_cost_usd: zod_1.z.number().min(0).default(0),
});
// Standard tool-call error envelope (ADR §9.4 + §20.3)
exports.RagToolErrorSchema = zod_1.z.object({
    code: zod_1.z.enum([
        'TOOL_NOT_FOUND',
        'TOOL_CALL_INVALID',
        'TOOL_EXEC_FAILED',
        'TOOL_ACL_DENIED',
        'TOOL_PRIVACY_BLOCKED',
        'TOOL_COST_EXCEEDED',
    ]),
    error: zod_1.z.string(),
});
// Degraded-mode markers (ADR §4.4 / §4.5 Option C — Memory v2 unavailable fallback)
// These are OPTIONAL passthrough markers consumers may read to detect fallback state.
exports.RagDegradedMarkersSchema = zod_1.z.object({
    _degraded: zod_1.z.boolean().optional(),
    _memory_v2: zod_1.z.enum(['unavailable', 'available']).optional(),
    _mode: zod_1.z.enum(['evidence_only', 'joint_read']).optional(),
    _cached: zod_1.z.boolean().optional(),
    _stale: zod_1.z.boolean().optional(),
    reason: zod_1.z.string().optional(),
    _enqueued_job_id: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=rag-common.js.map