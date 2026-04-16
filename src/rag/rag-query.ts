import { z } from 'zod';

/**
 * rag_query tool — vector similarity search over a document corpus.
 *
 * Cross-repo contract between cap-rag (agent-x9) and consumers
 * (agent-core tool router, Forge UI).
 *
 * ADR: ADR-cap-rag.md §20.1, §14.10 (query_log fields).
 */

export const RagQueryRequestSchema = z.object({
  corpus_id: z.string().uuid(),
  query: z.string().min(1),
  top_k: z.number().int().min(1).max(20).default(5),
  source_filter: z.string().optional(),
});

export type RagQueryRequest = z.infer<typeof RagQueryRequestSchema>;

/**
 * Single citation entry — links a chunk back to its source document.
 */
export const RagCitationSchema = z.object({
  document_id: z.string().uuid().nullable(),
  title: z.string(),
  chunk_text: z.string(),
  chunk_index: z.number().int().optional(),
  score: z.number(),
  revision_id: z.string().nullable(),
  source_kind: z.string().nullable(),
});

export type RagCitation = z.infer<typeof RagCitationSchema>;

export const RagQueryResponseSchema = z.object({
  citations: z.array(RagCitationSchema),
  query: z.string(),
  total_results: z.number().int().min(0),
  embedding_tokens: z.number().int().min(0),
});

export type RagQueryResponse = z.infer<typeof RagQueryResponseSchema>;
