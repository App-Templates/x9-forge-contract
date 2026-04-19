import { z } from 'zod';
import { RagProviderSchema, RagPrivacyLevelSchema } from './rag-common.js';

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

export const RagDocumentParseStatusSchema = z.enum([
  'success',
  'failed',
  'skipped',
  'blocked_secret',
]);
export type RagDocumentParseStatus = z.infer<typeof RagDocumentParseStatusSchema>;

// -- Document + revision refs -----------------------------------------------

export const RagDocumentStatusSchema = z.enum(['active', 'superseded', 'deleted']);
export type RagDocumentStatus = z.infer<typeof RagDocumentStatusSchema>;

export const RagDocumentRefSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string(),
  owner_id: z.string(),
  agent_id: z.string(),
  title: z.string(),
  provider: RagProviderSchema,
  source_kind: z.string().nullable().optional(),
  privacy_level: RagPrivacyLevelSchema.optional(),
  status: RagDocumentStatusSchema,
  created_at: z.string(),
  last_revision_at: z.string().nullable().optional(),
});
export type RagDocumentRef = z.infer<typeof RagDocumentRefSchema>;

export const RagDocumentRevisionRefSchema = z.object({
  id: z.string().uuid(),
  document_id: z.string().uuid(),
  revision_hash: z.string(),
  created_at: z.string(),
  parse_status: RagDocumentParseStatusSchema.optional(),
});
export type RagDocumentRevisionRef = z.infer<typeof RagDocumentRevisionRefSchema>;

// -- rag_document_list -------------------------------------------------------

export const RagDocumentListRequestSchema = z.object({
  tenant_id: z.string().min(1),
  owner_id: z.string().min(1),
  agent_id: z.string().min(1),
  corpus_id: z.string().uuid().optional(),
  topic_id: z.string().uuid().optional(),
  provider: RagProviderSchema.optional(),
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().nullable().optional(),
});
export type RagDocumentListRequest = z.infer<typeof RagDocumentListRequestSchema>;

export const RagDocumentListResponseSchema = z.object({
  documents: z.array(RagDocumentRefSchema),
  next_cursor: z.string().nullable(),
});
export type RagDocumentListResponse = z.infer<typeof RagDocumentListResponseSchema>;

// -- rag_document_open -------------------------------------------------------

export const RagDocumentOpenRequestSchema = z.object({
  tenant_id: z.string().min(1),
  owner_id: z.string().min(1),
  agent_id: z.string().min(1),
  document_id: z.string().uuid(),
  revision_id: z.string().uuid().optional(),
});
export type RagDocumentOpenRequest = z.infer<typeof RagDocumentOpenRequestSchema>;

// ADR §19.2 — raw_excerpt is null when ACL.allow_raw_excerpt=false (redacted body).
export const RagDocumentOpenResponseSchema = z.object({
  document: RagDocumentRefSchema,
  revision: RagDocumentRevisionRefSchema,
  raw_excerpt: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
});
export type RagDocumentOpenResponse = z.infer<typeof RagDocumentOpenResponseSchema>;
