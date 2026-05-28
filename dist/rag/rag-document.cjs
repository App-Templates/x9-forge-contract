"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagDocumentOpenResponseSchema = exports.RagDocumentOpenRequestSchema = exports.RagDocumentListResponseSchema = exports.RagDocumentListRequestSchema = exports.RagDocumentRevisionRefSchema = exports.RagDocumentRefSchema = exports.RagDocumentStatusSchema = exports.RagDocumentParseStatusSchema = void 0;
const zod_1 = require("zod");
const rag_common_js_1 = require("./rag-common.cjs");
/**
 * rag_document_list + rag_document_open tools — document access surface.
 *
 * @module @x9-forge/contracts/rag (rag-document)
 *
 * ADR-cap-rag.md §14 (rag_documents, rag_document_revisions) + §19.2 (ACL hard filter)
 * + §20.1 (tool surface) + §22.1 (privacy levels).
 *
 * Cross-repo contract between cap-rag and:
 *  - agent-core tool router
 *  - Forge UI document viewer (Phase 37.7)
 */
// -- Parse status enum (ADR §14 rag_document_revisions.parse_status) ---------
exports.RagDocumentParseStatusSchema = zod_1.z.enum([
    'success',
    'failed',
    'skipped',
    'blocked_secret',
]);
// -- Document + revision refs -----------------------------------------------
exports.RagDocumentStatusSchema = zod_1.z.enum(['active', 'superseded', 'deleted']);
exports.RagDocumentRefSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenant_id: zod_1.z.string(),
    owner_id: zod_1.z.string(),
    agent_id: zod_1.z.string(),
    title: zod_1.z.string(),
    provider: rag_common_js_1.RagProviderSchema,
    source_kind: zod_1.z.string().nullable().optional(),
    privacy_level: rag_common_js_1.RagPrivacyLevelSchema.optional(),
    status: exports.RagDocumentStatusSchema,
    created_at: zod_1.z.string(),
    last_revision_at: zod_1.z.string().nullable().optional(),
});
exports.RagDocumentRevisionRefSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    document_id: zod_1.z.string().uuid(),
    revision_hash: zod_1.z.string(),
    created_at: zod_1.z.string(),
    parse_status: exports.RagDocumentParseStatusSchema.optional(),
});
// -- rag_document_list -------------------------------------------------------
exports.RagDocumentListRequestSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().min(1),
    owner_id: zod_1.z.string().min(1),
    agent_id: zod_1.z.string().min(1),
    corpus_id: zod_1.z.string().uuid().optional(),
    topic_id: zod_1.z.string().uuid().optional(),
    provider: rag_common_js_1.RagProviderSchema.optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(25),
    cursor: zod_1.z.string().nullable().optional(),
});
exports.RagDocumentListResponseSchema = zod_1.z.object({
    documents: zod_1.z.array(exports.RagDocumentRefSchema),
    next_cursor: zod_1.z.string().nullable(),
});
// -- rag_document_open -------------------------------------------------------
exports.RagDocumentOpenRequestSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().min(1),
    owner_id: zod_1.z.string().min(1),
    agent_id: zod_1.z.string().min(1),
    document_id: zod_1.z.string().uuid(),
    revision_id: zod_1.z.string().uuid().optional(),
});
// ADR §19.2 — raw_excerpt is null when ACL.allow_raw_excerpt=false (redacted body).
exports.RagDocumentOpenResponseSchema = zod_1.z.object({
    document: exports.RagDocumentRefSchema,
    revision: exports.RagDocumentRevisionRefSchema,
    raw_excerpt: zod_1.z.string().nullable(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
});
//# sourceMappingURL=rag-document.js.map