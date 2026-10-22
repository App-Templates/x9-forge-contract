import { z } from 'zod';
/**
 * rag_query tool — vector similarity search over a document corpus.
 *
 * Cross-repo contract between cap-rag (agent-x9) and consumers
 * (agent-core tool router, Forge UI).
 *
 * ADR: ADR-cap-rag.md §20.1, §14.10 (query_log fields).
 */
export declare const RagQueryRequestSchema: z.ZodObject<{
    corpus_id: z.ZodString;
    query: z.ZodString;
    top_k: z.ZodDefault<z.ZodNumber>;
    source_filter: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RagQueryRequest = z.infer<typeof RagQueryRequestSchema>;
/**
 * Single citation entry — links a chunk back to its source document.
 */
export declare const RagCitationSchema: z.ZodObject<{
    document_id: z.ZodNullable<z.ZodString>;
    title: z.ZodString;
    chunk_text: z.ZodString;
    chunk_index: z.ZodOptional<z.ZodNumber>;
    score: z.ZodNumber;
    revision_id: z.ZodNullable<z.ZodString>;
    source_kind: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type RagCitation = z.infer<typeof RagCitationSchema>;
export declare const RagQueryResponseSchema: z.ZodObject<{
    citations: z.ZodArray<z.ZodObject<{
        document_id: z.ZodNullable<z.ZodString>;
        title: z.ZodString;
        chunk_text: z.ZodString;
        chunk_index: z.ZodOptional<z.ZodNumber>;
        score: z.ZodNumber;
        revision_id: z.ZodNullable<z.ZodString>;
        source_kind: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    query: z.ZodString;
    total_results: z.ZodNumber;
    embedding_tokens: z.ZodNumber;
}, z.core.$strip>;
export type RagQueryResponse = z.infer<typeof RagQueryResponseSchema>;
//# sourceMappingURL=rag-query.d.ts.map