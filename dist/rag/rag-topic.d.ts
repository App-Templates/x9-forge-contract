import { z } from 'zod';
/**
 * rag_topic_* tools — topic intelligence endpoints (ADR §20).
 *
 * All four tools accept a topic_id and return a structured synthesis
 * payload backed by rag_topic_state_snapshots (ADR §14.9).
 */
export declare const RagTopicStateRequestSchema: z.ZodObject<{
    topic_id: z.ZodString;
}, z.core.$strip>;
export type RagTopicStateRequest = z.infer<typeof RagTopicStateRequestSchema>;
export declare const RagTopicStateResponseSchema: z.ZodObject<{
    summary: z.ZodString;
    key_facts: z.ZodOptional<z.ZodArray<z.ZodString>>;
    open_questions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    confidence: z.ZodOptional<z.ZodNumber>;
    claim_count: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type RagTopicStateResponse = z.infer<typeof RagTopicStateResponseSchema>;
export declare const RagTopicChangesRequestSchema: z.ZodObject<{
    topic_id: z.ZodString;
    since_hours: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type RagTopicChangesRequest = z.infer<typeof RagTopicChangesRequestSchema>;
export declare const RagChangeEntrySchema: z.ZodObject<{
    type: z.ZodString;
    description: z.ZodString;
    impact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const RagTopicChangesResponseSchema: z.ZodObject<{
    summary: z.ZodString;
    changes: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        description: z.ZodString;
        impact: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    net_impact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RagTopicChangesResponse = z.infer<typeof RagTopicChangesResponseSchema>;
export declare const RagTopicTimelineRequestSchema: z.ZodObject<{
    topic_id: z.ZodString;
}, z.core.$strip>;
export type RagTopicTimelineRequest = z.infer<typeof RagTopicTimelineRequestSchema>;
export declare const RagTimelineEventSchema: z.ZodObject<{
    date_estimate: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    type: z.ZodOptional<z.ZodString>;
    significance: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const RagTopicTimelineResponseSchema: z.ZodObject<{
    events: z.ZodArray<z.ZodObject<{
        date_estimate: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        type: z.ZodOptional<z.ZodString>;
        significance: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    summary: z.ZodOptional<z.ZodString>;
    key_milestones: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type RagTopicTimelineResponse = z.infer<typeof RagTopicTimelineResponseSchema>;
export declare const RagTopicCoherenceRequestSchema: z.ZodObject<{
    topic_id: z.ZodString;
}, z.core.$strip>;
export type RagTopicCoherenceRequest = z.infer<typeof RagTopicCoherenceRequestSchema>;
export declare const RagCoherenceIssueSchema: z.ZodObject<{
    type: z.ZodString;
    description: z.ZodString;
    severity: z.ZodOptional<z.ZodString>;
    affected_claims: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const RagTopicCoherenceResponseSchema: z.ZodObject<{
    coherent: z.ZodBoolean;
    issues: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        description: z.ZodString;
        severity: z.ZodOptional<z.ZodString>;
        affected_claims: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    summary: z.ZodOptional<z.ZodString>;
    recommended_actions: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type RagTopicCoherenceResponse = z.infer<typeof RagTopicCoherenceResponseSchema>;
//# sourceMappingURL=rag-topic.d.ts.map