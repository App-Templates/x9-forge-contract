"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagTopicCoherenceResponseSchema = exports.RagCoherenceIssueSchema = exports.RagTopicCoherenceRequestSchema = exports.RagTopicTimelineResponseSchema = exports.RagTimelineEventSchema = exports.RagTopicTimelineRequestSchema = exports.RagTopicChangesResponseSchema = exports.RagChangeEntrySchema = exports.RagTopicChangesRequestSchema = exports.RagTopicStateResponseSchema = exports.RagTopicStateRequestSchema = void 0;
const zod_1 = require("zod");
/**
 * rag_topic_* tools — topic intelligence endpoints (ADR §20).
 *
 * All four tools accept a topic_id and return a structured synthesis
 * payload backed by rag_topic_state_snapshots (ADR §14.9).
 */
// -- rag_topic_state ---------------------------------------------------------
exports.RagTopicStateRequestSchema = zod_1.z.object({
    topic_id: zod_1.z.string().uuid(),
});
exports.RagTopicStateResponseSchema = zod_1.z.object({
    summary: zod_1.z.string(),
    key_facts: zod_1.z.array(zod_1.z.string()).optional(),
    open_questions: zod_1.z.array(zod_1.z.string()).optional(),
    confidence: zod_1.z.number().min(0).max(1).optional(),
    claim_count: zod_1.z.number().int().optional(),
});
// -- rag_topic_changes -------------------------------------------------------
exports.RagTopicChangesRequestSchema = zod_1.z.object({
    topic_id: zod_1.z.string().uuid(),
    since_hours: zod_1.z.number().int().min(1).max(24 * 30).default(24),
});
exports.RagChangeEntrySchema = zod_1.z.object({
    type: zod_1.z.string(),
    description: zod_1.z.string(),
    impact: zod_1.z.string().optional(),
});
exports.RagTopicChangesResponseSchema = zod_1.z.object({
    summary: zod_1.z.string(),
    changes: zod_1.z.array(exports.RagChangeEntrySchema),
    net_impact: zod_1.z.string().optional(),
});
// -- rag_topic_timeline ------------------------------------------------------
exports.RagTopicTimelineRequestSchema = zod_1.z.object({
    topic_id: zod_1.z.string().uuid(),
});
exports.RagTimelineEventSchema = zod_1.z.object({
    date_estimate: zod_1.z.string().optional(),
    description: zod_1.z.string(),
    type: zod_1.z.string().optional(),
    significance: zod_1.z.string().optional(),
});
exports.RagTopicTimelineResponseSchema = zod_1.z.object({
    events: zod_1.z.array(exports.RagTimelineEventSchema),
    summary: zod_1.z.string().optional(),
    key_milestones: zod_1.z.array(zod_1.z.string()).optional(),
});
// -- rag_topic_coherence_report ----------------------------------------------
exports.RagTopicCoherenceRequestSchema = zod_1.z.object({
    topic_id: zod_1.z.string().uuid(),
});
exports.RagCoherenceIssueSchema = zod_1.z.object({
    type: zod_1.z.string(),
    description: zod_1.z.string(),
    severity: zod_1.z.string().optional(),
    affected_claims: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.RagTopicCoherenceResponseSchema = zod_1.z.object({
    coherent: zod_1.z.boolean(),
    issues: zod_1.z.array(exports.RagCoherenceIssueSchema),
    summary: zod_1.z.string().optional(),
    recommended_actions: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=rag-topic.js.map