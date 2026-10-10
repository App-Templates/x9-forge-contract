import { z } from 'zod';
import { RagIdentityEnvelopeSchema, RagCorpusRefSchema } from './rag-common.js';
import { RagDocumentRefSchema, RagDocumentRevisionRefSchema } from './rag-document.js';
import { RagCitationSchema } from './rag-query.js';
import { RagAuthorizedQueryContextSchema, isRagAuthorizedContextCurrent } from './authorized-context.js';
import { Text128, Instant, sameValue } from '../capability/coach/shared.js';
export const RagAuthorizedDocumentRefSchema = z.object({
  identity: RagIdentityEnvelopeSchema.strict(), corpus_id: RagCorpusRefSchema.shape.id, corpus_revision: Text128,
  assignment_id: z.uuid(), authorization_revision: Text128,
  document_id: RagDocumentRefSchema.shape.id, revision_id: RagDocumentRevisionRefSchema.shape.id,
}).strict();
export type RagAuthorizedDocumentRef = z.infer<typeof RagAuthorizedDocumentRefSchema>;
export const RagQualifiedCitationSchema = z.object({
  document: RagAuthorizedDocumentRefSchema, title: RagCitationSchema.shape.title, chunk_text: RagCitationSchema.shape.chunk_text,
  score: RagCitationSchema.shape.score, chunk_index: RagCitationSchema.shape.chunk_index, observed_at: Instant,
}).strict();
export type RagQualifiedCitation = z.infer<typeof RagQualifiedCitationSchema>;
export function isRagQualifiedCitationForContext(raw: unknown, rawContext: unknown, currentAssignment: unknown, expectedIdentity: unknown, expectedDocument: unknown, now: Date): boolean {
  const citation = RagQualifiedCitationSchema.safeParse(raw), context = RagAuthorizedQueryContextSchema.safeParse(rawContext), document = RagAuthorizedDocumentRefSchema.safeParse(expectedDocument);
  if (!citation.success || !context.success || !document.success || !isRagAuthorizedContextCurrent(context.data, currentAssignment, expectedIdentity, now)) return false;
  const d = citation.data.document, a = context.data.assignment;
  return sameValue(d, document.data) && sameValue(d.identity, a.identity) && d.corpus_id === a.corpus_id && d.assignment_id === a.assignment_id
    && d.corpus_revision === a.corpus_revision && d.authorization_revision === a.authorization_revision && Date.parse(citation.data.observed_at) <= now.getTime();
}
