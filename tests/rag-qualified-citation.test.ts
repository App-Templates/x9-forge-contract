import { expect, it } from 'vitest';
import { RagQualifiedCitationSchema as Citation, isRagQualifiedCitationForContext as matches, RagCitationSchema as Legacy } from '../src/rag/index.js';
import { fixtures as f } from './capability/meditation-contract-fixtures.js';
const c = f.RagQualifiedCitation, context = f.RagAuthorizedQueryContext, a = f.RagCorpusAssignment, now = new Date(context.observed_at);
it('requires exact authorized document and revision without inventing a source id', () => {
  expect(Citation.safeParse(c).success).toBe(true); expect(matches(c, context, a, a.identity, c.document, now)).toBe(true);
  expect(Legacy.safeParse({ document_id: null, revision_id: null, source_kind: null, title: '', chunk_text: '', score: 0 }).success).toBe(true);
  expect(Citation.safeParse({ ...c, document: { ...c.document, revision_id: null } }).success).toBe(false);
});
it.each(['document_id', 'revision_id', 'authorization_revision', 'corpus_revision'])('denies changed %s', key => {
  const value = key.endsWith('_id') ? '50000000-0000-4000-8000-000000000009' : 'foreign';
  expect(matches(c, context, a, a.identity, { ...c.document, [key]: value }, now)).toBe(false);
});
it('refuses revoked current rights even for an immutable citation', () => {
  const foreign = { ...c, document: { ...c.document, authorization_revision: 'foreign' } };
  expect(matches(foreign, context, a, a.identity, foreign.document, now)).toBe(false);
  expect(matches(c, context, { ...a, state: 'revoked' }, a.identity, c.document, now)).toBe(false);
  expect(matches(c, null, a, a.identity, c.document, now)).toBe(false);
});
