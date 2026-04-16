/**
 * RAG domain — cap-rag topic-scoped document intelligence contracts.
 *
 * @module @x9-forge/contracts/rag
 *
 * Cross-repo contracts between cap-rag (agent-x9) capability service and
 * its consumers (agent-core tool router, Forge UI).
 *
 * See: agent-x9/docs/adr/ADR-cap-rag.md §20 (tool surface), §14
 * (database schema), §14.10 (query/citation logging).
 */

// -- rag_query -----------------------------------------------------------
export {
  RagQueryRequestSchema,
  RagQueryResponseSchema,
  RagCitationSchema,
} from './rag-query.js';
export type {
  RagQueryRequest,
  RagQueryResponse,
  RagCitation,
} from './rag-query.js';

// -- rag_topic_state -----------------------------------------------------
export {
  RagTopicStateRequestSchema,
  RagTopicStateResponseSchema,
} from './rag-topic.js';
export type {
  RagTopicStateRequest,
  RagTopicStateResponse,
} from './rag-topic.js';

// -- rag_topic_changes ---------------------------------------------------
export {
  RagTopicChangesRequestSchema,
  RagTopicChangesResponseSchema,
  RagChangeEntrySchema,
} from './rag-topic.js';
export type {
  RagTopicChangesRequest,
  RagTopicChangesResponse,
} from './rag-topic.js';

// -- rag_topic_timeline --------------------------------------------------
export {
  RagTopicTimelineRequestSchema,
  RagTopicTimelineResponseSchema,
  RagTimelineEventSchema,
} from './rag-topic.js';
export type {
  RagTopicTimelineRequest,
  RagTopicTimelineResponse,
} from './rag-topic.js';

// -- rag_topic_coherence_report ------------------------------------------
export {
  RagTopicCoherenceRequestSchema,
  RagTopicCoherenceResponseSchema,
  RagCoherenceIssueSchema,
} from './rag-topic.js';
export type {
  RagTopicCoherenceRequest,
  RagTopicCoherenceResponse,
} from './rag-topic.js';
