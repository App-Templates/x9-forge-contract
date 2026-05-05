"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagQueryResponseSchema = exports.RagCitationSchema = exports.RagQueryRequestSchema = void 0;
const zod_1 = require("zod");
/**
 * rag_query tool — vector similarity search over a document corpus.
 *
 * Cross-repo contract between cap-rag (agent-x9) and consumers
 * (agent-core tool router, Forge UI).
 *
 * ADR: ADR-cap-rag.md §20.1, §14.10 (query_log fields).
 */
exports.RagQueryRequestSchema = zod_1.z.object({
    corpus_id: zod_1.z.string().uuid(),
    query: zod_1.z.string().min(1),
    top_k: zod_1.z.number().int().min(1).max(20).default(5),
    source_filter: zod_1.z.string().optional(),
});
/**
 * Single citation entry — links a chunk back to its source document.
 */
exports.RagCitationSchema = zod_1.z.object({
    document_id: zod_1.z.string().uuid().nullable(),
    title: zod_1.z.string(),
    chunk_text: zod_1.z.string(),
    chunk_index: zod_1.z.number().int().optional(),
    score: zod_1.z.number(),
    revision_id: zod_1.z.string().nullable(),
    source_kind: zod_1.z.string().nullable(),
});
exports.RagQueryResponseSchema = zod_1.z.object({
    citations: zod_1.z.array(exports.RagCitationSchema),
    query: zod_1.z.string(),
    total_results: zod_1.z.number().int().min(0),
    embedding_tokens: zod_1.z.number().int().min(0),
});
//# sourceMappingURL=rag-query.js.map