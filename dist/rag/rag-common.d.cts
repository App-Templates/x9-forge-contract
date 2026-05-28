import { z } from 'zod';
/**
 * Shared cap-rag primitives — cross-repo envelopes, enums, refs, error shapes.
 *
 * @module @x9-forge/contracts/rag (rag-common)
 *
 * ADR-cap-rag.md §21.2 — required cross-repo primitives.
 * Scope: API envelopes, statuses, source/provider enums, references, error shape.
 */
export declare const RagProviderSchema: z.ZodEnum<{
    upload: "upload";
    local_folder: "local_folder";
    notion: "notion";
    gdocs: "gdocs";
    gdrive: "gdrive";
    slack: "slack";
    gmail: "gmail";
}>;
export type RagProvider = z.infer<typeof RagProviderSchema>;
export declare const RagSourceStatusEnumSchema: z.ZodEnum<{
    error: "error";
    active: "active";
    paused: "paused";
}>;
export type RagSourceStatusEnum = z.infer<typeof RagSourceStatusEnumSchema>;
export declare const RagPrivacyLevelSchema: z.ZodEnum<{
    standard: "standard";
    secret: "secret";
    sensitive: "sensitive";
    restricted: "restricted";
    third_party: "third_party";
}>;
export type RagPrivacyLevel = z.infer<typeof RagPrivacyLevelSchema>;
export declare const RagTopicTypeSchema: z.ZodEnum<{
    other: "other";
    project: "project";
    product: "product";
    research: "research";
    personal: "personal";
}>;
export type RagTopicType = z.infer<typeof RagTopicTypeSchema>;
export declare const RagIdentityEnvelopeSchema: z.ZodObject<{
    tenant_id: z.ZodString;
    owner_id: z.ZodString;
    agent_id: z.ZodString;
}, z.core.$strip>;
export type RagIdentityEnvelope = z.infer<typeof RagIdentityEnvelopeSchema>;
export declare const RagTopicRefSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    topic_type: z.ZodEnum<{
        other: "other";
        project: "project";
        product: "product";
        research: "research";
        personal: "personal";
    }>;
}, z.core.$strip>;
export type RagTopicRef = z.infer<typeof RagTopicRefSchema>;
export declare const RagCorpusRefSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
export type RagCorpusRef = z.infer<typeof RagCorpusRefSchema>;
export declare const RagClaimSchema: z.ZodObject<{
    id: z.ZodString;
    topic_id: z.ZodString;
    claim_type: z.ZodString;
    subject_text: z.ZodString;
    predicate: z.ZodString;
    object_text: z.ZodString;
    confidence: z.ZodNumber;
    salience: z.ZodNumber;
    status: z.ZodEnum<{
        active: "active";
        superseded: "superseded";
        deleted: "deleted";
    }>;
    resolved_entity_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type RagClaim = z.infer<typeof RagClaimSchema>;
export declare const RagClaimConflictSchema: z.ZodObject<{
    id: z.ZodString;
    topic_id: z.ZodString;
    conflict_type: z.ZodString;
    affected_claim_ids: z.ZodArray<z.ZodString>;
    resolution_method: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        auto: "auto";
        manual_review: "manual_review";
    }>>>;
    winning_claim_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type RagClaimConflict = z.infer<typeof RagClaimConflictSchema>;
export declare const RagCostEstimateSchema: z.ZodObject<{
    embedding_tokens: z.ZodDefault<z.ZodNumber>;
    llm_input_tokens: z.ZodDefault<z.ZodNumber>;
    llm_output_tokens: z.ZodDefault<z.ZodNumber>;
    estimated_cost_usd: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type RagCostEstimate = z.infer<typeof RagCostEstimateSchema>;
export declare const RagToolErrorSchema: z.ZodObject<{
    code: z.ZodEnum<{
        TOOL_NOT_FOUND: "TOOL_NOT_FOUND";
        TOOL_CALL_INVALID: "TOOL_CALL_INVALID";
        TOOL_EXEC_FAILED: "TOOL_EXEC_FAILED";
        TOOL_ACL_DENIED: "TOOL_ACL_DENIED";
        TOOL_PRIVACY_BLOCKED: "TOOL_PRIVACY_BLOCKED";
        TOOL_COST_EXCEEDED: "TOOL_COST_EXCEEDED";
    }>;
    error: z.ZodString;
}, z.core.$strip>;
export type RagToolError = z.infer<typeof RagToolErrorSchema>;
export declare const RagDegradedMarkersSchema: z.ZodObject<{
    _degraded: z.ZodOptional<z.ZodBoolean>;
    _memory_v2: z.ZodOptional<z.ZodEnum<{
        unavailable: "unavailable";
        available: "available";
    }>>;
    _mode: z.ZodOptional<z.ZodEnum<{
        evidence_only: "evidence_only";
        joint_read: "joint_read";
    }>>;
    _cached: z.ZodOptional<z.ZodBoolean>;
    _stale: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    _enqueued_job_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RagDegradedMarkers = z.infer<typeof RagDegradedMarkersSchema>;
//# sourceMappingURL=rag-common.d.ts.map