"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagDocumentOpenResponseSchema = exports.RagDocumentOpenRequestSchema = exports.RagDocumentListResponseSchema = exports.RagDocumentListRequestSchema = exports.RagDocumentParseStatusSchema = exports.RagDocumentStatusSchema = exports.RagDocumentRevisionRefSchema = exports.RagDocumentRefSchema = exports.RagSourceStatusResponseSchema = exports.RagSourceStatusRequestSchema = exports.RagSourceSyncResponseSchema = exports.RagSourceSyncRequestSchema = exports.RagSourceSyncStatusSchema = exports.RagSourceStatusSchema = exports.RagSyncJobSummarySchema = exports.RagJobStatusSchema = exports.RagJobTypeSchema = exports.RagSourceConnectionSchema = exports.RagDegradedMarkersSchema = exports.RagToolErrorSchema = exports.RagCostEstimateSchema = exports.RagClaimConflictSchema = exports.RagClaimSchema = exports.RagCorpusRefSchema = exports.RagTopicRefSchema = exports.RagIdentityEnvelopeSchema = exports.RagTopicTypeSchema = exports.RagPrivacyLevelSchema = exports.RagSourceStatusEnumSchema = exports.RagProviderSchema = exports.RagCoherenceIssueSchema = exports.RagTopicCoherenceResponseSchema = exports.RagTopicCoherenceRequestSchema = exports.RagTimelineEventSchema = exports.RagTopicTimelineResponseSchema = exports.RagTopicTimelineRequestSchema = exports.RagChangeEntrySchema = exports.RagTopicChangesResponseSchema = exports.RagTopicChangesRequestSchema = exports.RagTopicStateResponseSchema = exports.RagTopicStateRequestSchema = exports.RagCitationSchema = exports.RagQueryResponseSchema = exports.RagQueryRequestSchema = void 0;
// -- rag_query -----------------------------------------------------------
var rag_query_js_1 = require("./rag-query.cjs");
Object.defineProperty(exports, "RagQueryRequestSchema", { enumerable: true, get: function () { return rag_query_js_1.RagQueryRequestSchema; } });
Object.defineProperty(exports, "RagQueryResponseSchema", { enumerable: true, get: function () { return rag_query_js_1.RagQueryResponseSchema; } });
Object.defineProperty(exports, "RagCitationSchema", { enumerable: true, get: function () { return rag_query_js_1.RagCitationSchema; } });
// -- rag_topic_state -----------------------------------------------------
var rag_topic_js_1 = require("./rag-topic.cjs");
Object.defineProperty(exports, "RagTopicStateRequestSchema", { enumerable: true, get: function () { return rag_topic_js_1.RagTopicStateRequestSchema; } });
Object.defineProperty(exports, "RagTopicStateResponseSchema", { enumerable: true, get: function () { return rag_topic_js_1.RagTopicStateResponseSchema; } });
// -- rag_topic_changes ---------------------------------------------------
var rag_topic_js_2 = require("./rag-topic.cjs");
Object.defineProperty(exports, "RagTopicChangesRequestSchema", { enumerable: true, get: function () { return rag_topic_js_2.RagTopicChangesRequestSchema; } });
Object.defineProperty(exports, "RagTopicChangesResponseSchema", { enumerable: true, get: function () { return rag_topic_js_2.RagTopicChangesResponseSchema; } });
Object.defineProperty(exports, "RagChangeEntrySchema", { enumerable: true, get: function () { return rag_topic_js_2.RagChangeEntrySchema; } });
// -- rag_topic_timeline --------------------------------------------------
var rag_topic_js_3 = require("./rag-topic.cjs");
Object.defineProperty(exports, "RagTopicTimelineRequestSchema", { enumerable: true, get: function () { return rag_topic_js_3.RagTopicTimelineRequestSchema; } });
Object.defineProperty(exports, "RagTopicTimelineResponseSchema", { enumerable: true, get: function () { return rag_topic_js_3.RagTopicTimelineResponseSchema; } });
Object.defineProperty(exports, "RagTimelineEventSchema", { enumerable: true, get: function () { return rag_topic_js_3.RagTimelineEventSchema; } });
// -- rag_topic_coherence_report ------------------------------------------
var rag_topic_js_4 = require("./rag-topic.cjs");
Object.defineProperty(exports, "RagTopicCoherenceRequestSchema", { enumerable: true, get: function () { return rag_topic_js_4.RagTopicCoherenceRequestSchema; } });
Object.defineProperty(exports, "RagTopicCoherenceResponseSchema", { enumerable: true, get: function () { return rag_topic_js_4.RagTopicCoherenceResponseSchema; } });
Object.defineProperty(exports, "RagCoherenceIssueSchema", { enumerable: true, get: function () { return rag_topic_js_4.RagCoherenceIssueSchema; } });
// -- Shared primitives (ADR §21.2) ---------------------------------------
var rag_common_js_1 = require("./rag-common.cjs");
Object.defineProperty(exports, "RagProviderSchema", { enumerable: true, get: function () { return rag_common_js_1.RagProviderSchema; } });
Object.defineProperty(exports, "RagSourceStatusEnumSchema", { enumerable: true, get: function () { return rag_common_js_1.RagSourceStatusEnumSchema; } });
Object.defineProperty(exports, "RagPrivacyLevelSchema", { enumerable: true, get: function () { return rag_common_js_1.RagPrivacyLevelSchema; } });
Object.defineProperty(exports, "RagTopicTypeSchema", { enumerable: true, get: function () { return rag_common_js_1.RagTopicTypeSchema; } });
Object.defineProperty(exports, "RagIdentityEnvelopeSchema", { enumerable: true, get: function () { return rag_common_js_1.RagIdentityEnvelopeSchema; } });
Object.defineProperty(exports, "RagTopicRefSchema", { enumerable: true, get: function () { return rag_common_js_1.RagTopicRefSchema; } });
Object.defineProperty(exports, "RagCorpusRefSchema", { enumerable: true, get: function () { return rag_common_js_1.RagCorpusRefSchema; } });
Object.defineProperty(exports, "RagClaimSchema", { enumerable: true, get: function () { return rag_common_js_1.RagClaimSchema; } });
Object.defineProperty(exports, "RagClaimConflictSchema", { enumerable: true, get: function () { return rag_common_js_1.RagClaimConflictSchema; } });
Object.defineProperty(exports, "RagCostEstimateSchema", { enumerable: true, get: function () { return rag_common_js_1.RagCostEstimateSchema; } });
Object.defineProperty(exports, "RagToolErrorSchema", { enumerable: true, get: function () { return rag_common_js_1.RagToolErrorSchema; } });
Object.defineProperty(exports, "RagDegradedMarkersSchema", { enumerable: true, get: function () { return rag_common_js_1.RagDegradedMarkersSchema; } });
// -- Source tools (rag_source_sync + rag_source_status) ------------------
var rag_source_js_1 = require("./rag-source.cjs");
Object.defineProperty(exports, "RagSourceConnectionSchema", { enumerable: true, get: function () { return rag_source_js_1.RagSourceConnectionSchema; } });
Object.defineProperty(exports, "RagJobTypeSchema", { enumerable: true, get: function () { return rag_source_js_1.RagJobTypeSchema; } });
Object.defineProperty(exports, "RagJobStatusSchema", { enumerable: true, get: function () { return rag_source_js_1.RagJobStatusSchema; } });
Object.defineProperty(exports, "RagSyncJobSummarySchema", { enumerable: true, get: function () { return rag_source_js_1.RagSyncJobSummarySchema; } });
Object.defineProperty(exports, "RagSourceStatusSchema", { enumerable: true, get: function () { return rag_source_js_1.RagSourceStatusSchema; } });
Object.defineProperty(exports, "RagSourceSyncStatusSchema", { enumerable: true, get: function () { return rag_source_js_1.RagSourceSyncStatusSchema; } });
Object.defineProperty(exports, "RagSourceSyncRequestSchema", { enumerable: true, get: function () { return rag_source_js_1.RagSourceSyncRequestSchema; } });
Object.defineProperty(exports, "RagSourceSyncResponseSchema", { enumerable: true, get: function () { return rag_source_js_1.RagSourceSyncResponseSchema; } });
Object.defineProperty(exports, "RagSourceStatusRequestSchema", { enumerable: true, get: function () { return rag_source_js_1.RagSourceStatusRequestSchema; } });
Object.defineProperty(exports, "RagSourceStatusResponseSchema", { enumerable: true, get: function () { return rag_source_js_1.RagSourceStatusResponseSchema; } });
// -- Document tools (rag_document_list + rag_document_open) --------------
var rag_document_js_1 = require("./rag-document.cjs");
Object.defineProperty(exports, "RagDocumentRefSchema", { enumerable: true, get: function () { return rag_document_js_1.RagDocumentRefSchema; } });
Object.defineProperty(exports, "RagDocumentRevisionRefSchema", { enumerable: true, get: function () { return rag_document_js_1.RagDocumentRevisionRefSchema; } });
Object.defineProperty(exports, "RagDocumentStatusSchema", { enumerable: true, get: function () { return rag_document_js_1.RagDocumentStatusSchema; } });
Object.defineProperty(exports, "RagDocumentParseStatusSchema", { enumerable: true, get: function () { return rag_document_js_1.RagDocumentParseStatusSchema; } });
Object.defineProperty(exports, "RagDocumentListRequestSchema", { enumerable: true, get: function () { return rag_document_js_1.RagDocumentListRequestSchema; } });
Object.defineProperty(exports, "RagDocumentListResponseSchema", { enumerable: true, get: function () { return rag_document_js_1.RagDocumentListResponseSchema; } });
Object.defineProperty(exports, "RagDocumentOpenRequestSchema", { enumerable: true, get: function () { return rag_document_js_1.RagDocumentOpenRequestSchema; } });
Object.defineProperty(exports, "RagDocumentOpenResponseSchema", { enumerable: true, get: function () { return rag_document_js_1.RagDocumentOpenResponseSchema; } });
//# sourceMappingURL=index.js.map