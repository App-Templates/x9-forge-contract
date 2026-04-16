import { z } from 'zod';

/**
 * rag_topic_* tools — topic intelligence endpoints (ADR §20).
 *
 * All four tools accept a topic_id and return a structured synthesis
 * payload backed by rag_topic_state_snapshots (ADR §14.9).
 */

// -- rag_topic_state ---------------------------------------------------------

export const RagTopicStateRequestSchema = z.object({
  topic_id: z.string().uuid(),
});

export type RagTopicStateRequest = z.infer<typeof RagTopicStateRequestSchema>;

export const RagTopicStateResponseSchema = z.object({
  summary: z.string(),
  key_facts: z.array(z.string()).optional(),
  open_questions: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  claim_count: z.number().int().optional(),
});

export type RagTopicStateResponse = z.infer<typeof RagTopicStateResponseSchema>;

// -- rag_topic_changes -------------------------------------------------------

export const RagTopicChangesRequestSchema = z.object({
  topic_id: z.string().uuid(),
  since_hours: z.number().int().min(1).max(24 * 30).default(24),
});

export type RagTopicChangesRequest = z.infer<typeof RagTopicChangesRequestSchema>;

export const RagChangeEntrySchema = z.object({
  type: z.string(),
  description: z.string(),
  impact: z.string().optional(),
});

export const RagTopicChangesResponseSchema = z.object({
  summary: z.string(),
  changes: z.array(RagChangeEntrySchema),
  net_impact: z.string().optional(),
});

export type RagTopicChangesResponse = z.infer<typeof RagTopicChangesResponseSchema>;

// -- rag_topic_timeline ------------------------------------------------------

export const RagTopicTimelineRequestSchema = z.object({
  topic_id: z.string().uuid(),
});

export type RagTopicTimelineRequest = z.infer<typeof RagTopicTimelineRequestSchema>;

export const RagTimelineEventSchema = z.object({
  date_estimate: z.string().optional(),
  description: z.string(),
  type: z.string().optional(),
  significance: z.string().optional(),
});

export const RagTopicTimelineResponseSchema = z.object({
  events: z.array(RagTimelineEventSchema),
  summary: z.string().optional(),
  key_milestones: z.array(z.string()).optional(),
});

export type RagTopicTimelineResponse = z.infer<typeof RagTopicTimelineResponseSchema>;

// -- rag_topic_coherence_report ----------------------------------------------

export const RagTopicCoherenceRequestSchema = z.object({
  topic_id: z.string().uuid(),
});

export type RagTopicCoherenceRequest = z.infer<typeof RagTopicCoherenceRequestSchema>;

export const RagCoherenceIssueSchema = z.object({
  type: z.string(),
  description: z.string(),
  severity: z.string().optional(),
  affected_claims: z.array(z.string()).optional(),
});

export const RagTopicCoherenceResponseSchema = z.object({
  coherent: z.boolean(),
  issues: z.array(RagCoherenceIssueSchema),
  summary: z.string().optional(),
  recommended_actions: z.array(z.string()).optional(),
});

export type RagTopicCoherenceResponse = z.infer<typeof RagTopicCoherenceResponseSchema>;
