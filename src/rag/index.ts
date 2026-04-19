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

// -- Shared primitives (ADR §21.2) ---------------------------------------
export {
  RagProviderSchema,
  RagSourceStatusEnumSchema,
  RagPrivacyLevelSchema,
  RagTopicTypeSchema,
  RagIdentityEnvelopeSchema,
  RagTopicRefSchema,
  RagCorpusRefSchema,
  RagClaimSchema,
  RagClaimConflictSchema,
  RagCostEstimateSchema,
  RagToolErrorSchema,
  RagDegradedMarkersSchema,
} from './rag-common.js';
export type {
  RagProvider,
  RagSourceStatusEnum,
  RagPrivacyLevel,
  RagTopicType,
  RagIdentityEnvelope,
  RagTopicRef,
  RagCorpusRef,
  RagClaim,
  RagClaimConflict,
  RagCostEstimate,
  RagToolError,
  RagDegradedMarkers,
} from './rag-common.js';

// -- Source tools (rag_source_sync + rag_source_status) ------------------
export {
  RagSourceConnectionSchema,
  RagJobTypeSchema,
  RagJobStatusSchema,
  RagSyncJobSummarySchema,
  RagSourceStatusSchema,
  RagSourceSyncStatusSchema,
  RagSourceSyncRequestSchema,
  RagSourceSyncResponseSchema,
  RagSourceStatusRequestSchema,
  RagSourceStatusResponseSchema,
} from './rag-source.js';
export type {
  RagSourceConnection,
  RagJobType,
  RagJobStatus,
  RagSyncJobSummary,
  RagSourceStatus,
  RagSourceSyncStatus,
  RagSourceSyncRequest,
  RagSourceSyncResponse,
  RagSourceStatusRequest,
  RagSourceStatusResponse,
} from './rag-source.js';

// -- Document tools (rag_document_list + rag_document_open) --------------
export {
  RagDocumentRefSchema,
  RagDocumentRevisionRefSchema,
  RagDocumentStatusSchema,
  RagDocumentParseStatusSchema,
  RagDocumentListRequestSchema,
  RagDocumentListResponseSchema,
  RagDocumentOpenRequestSchema,
  RagDocumentOpenResponseSchema,
} from './rag-document.js';
export type {
  RagDocumentRef,
  RagDocumentRevisionRef,
  RagDocumentStatus,
  RagDocumentParseStatus,
  RagDocumentListRequest,
  RagDocumentListResponse,
  RagDocumentOpenRequest,
  RagDocumentOpenResponse,
} from './rag-document.js';
