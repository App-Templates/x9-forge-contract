import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_CONFERMA_CONTINUATION_POLICIES,
  PAPERCLIP_DOCUMENT_BODY_MAX,
  PAPERCLIP_DOCUMENT_FORMATS,
  PAPERCLIP_DOCUMENT_KEY_PATTERN,
  PaperclipConfermaDocumentoCorpoSchema,
  PaperclipDocumentoAggiornaCorpoSchema,
  PaperclipDocumentoChiaveSchema,
  PaperclipDocumentoConflittoSchema,
  PaperclipDocumentoCreaCorpoSchema,
  PaperclipDocumentoLettoSchema,
  PaperclipDocumentoScriviCorpoSchema,
  PaperclipIncaricoConDocumentiSchema,
  PaperclipPianoLegacySchema,
  paperclipConfermaPianoIdempotencyKey,
  paperclipDocumentoScritto,
} from '../../../src/capability/paperclip-protocollo/wire-documenti.js';
import { paperclipPercorsi } from '../../../src/capability/paperclip-protocollo/percorsi.js';
import { PaperclipPianoCorpoSchema } from '../../../src/capability/paperclip-protocollo/wire-scritture.js';

const ISSUE_ID = '11111111-1111-4111-8111-111111111111';
const REVISION_ID = '22222222-2222-4222-8222-222222222222';
const DOCUMENT_ID = '33333333-3333-4333-8333-333333333333';
const COMPANY_ID = '44444444-4444-4444-8444-444444444444';
const document = {
  id: DOCUMENT_ID,
  companyId: COMPANY_ID,
  issueId: ISSUE_ID,
  key: 'plan',
  title: 'Work plan',
  format: 'markdown',
  body: '# Plan\nReview the implementation.',
  latestRevisionId: REVISION_ID,
  latestRevisionNumber: 1,
  lockedAt: null,
  lockedByAgentId: null,
  lockedByUserId: null,
  createdAt: '2026-11-18T10:00:00Z',
  updatedAt: '2026-11-18T10:00:00Z',
};

describe('issue documents', () => {
  it('s7406_chiave', () => {
    expect(PAPERCLIP_DOCUMENT_KEY_PATTERN.source).toBe('^[a-z0-9][a-z0-9_-]*$');
    for (const key of ['plan', 'consegna', 'design-2', 'a_b', 'a'.repeat(64)]) {
      expect(PaperclipDocumentoChiaveSchema.parse(key)).toBe(key);
    }
    for (const key of ['Plan', '-x', '_x', '', 'a'.repeat(65), 'a/b', '..']) {
      expect(PaperclipDocumentoChiaveSchema.safeParse(key).success).toBe(false);
    }
  });

  it('s7406_percorso', () => {
    expect(paperclipPercorsi.documento(ISSUE_ID, 'plan')).toBe(paperclipPercorsi.piano(ISSUE_ID));
    expect(paperclipPercorsi.documento(ISSUE_ID, 'consegna')).toBe(`/api/issues/${ISSUE_ID}/documents/consegna`);
    expect(() => paperclipPercorsi.documento(ISSUE_ID, 'a/b')).toThrow();
    expect(() => paperclipPercorsi.documento('invalid', 'plan')).toThrow();
  });

  it('s7406_creazione', () => {
    const body = { format: 'markdown', body: '# Plan' };
    expect(PAPERCLIP_DOCUMENT_FORMATS).toEqual(['markdown']);
    expect(PAPERCLIP_DOCUMENT_BODY_MAX).toBe(524288);
    expect(PaperclipDocumentoCreaCorpoSchema.parse(body)).toEqual(body);
    expect(PaperclipDocumentoScriviCorpoSchema.safeParse({ ...body, baseRevisionId: REVISION_ID }).success).toBe(true);
    for (const extra of [
      { title: 'x'.repeat(200) }, { title: null }, { baseRevisionId: null },
      { body: 'x'.repeat(524288) }, { changeSummary: 'x'.repeat(500) }, { changeSummary: null },
    ]) {
      expect(PaperclipDocumentoCreaCorpoSchema.safeParse({ ...body, ...extra }).success).toBe(true);
    }
    for (const extra of [
      { title: 'x'.repeat(201) }, { baseRevisionId: REVISION_ID }, { baseRevisionId: 'invalid' },
      { format: 'html' }, { body: 'x'.repeat(524289) }, { changeSummary: 'x'.repeat(501) }, { extra: true },
    ]) {
      expect(PaperclipDocumentoCreaCorpoSchema.safeParse({ ...body, ...extra }).success).toBe(false);
    }
  });

  it('s7406_aggiornamento', () => {
    const body = { format: 'markdown', body: '# Revised plan' };
    expect(PaperclipDocumentoAggiornaCorpoSchema.safeParse(body).success).toBe(false);
    expect(PaperclipDocumentoAggiornaCorpoSchema.parse({ ...body, baseRevisionId: REVISION_ID }))
      .toEqual({ ...body, baseRevisionId: REVISION_ID });
    for (const extra of [{ baseRevisionId: null }, { baseRevisionId: 'invalid' }, { baseRevisionId: REVISION_ID, extra: true }]) {
      expect(PaperclipDocumentoAggiornaCorpoSchema.safeParse({ ...body, ...extra }).success).toBe(false);
    }
  });

  it('s7406_riga_letta', () => {
    expect(PaperclipDocumentoLettoSchema.parse(document)).toEqual(document);
    const { body, ...summary } = document;
    expect(body).toBe('# Plan\nReview the implementation.');
    expect(PaperclipDocumentoLettoSchema.parse(summary)).toEqual(summary);
    expect(PaperclipDocumentoLettoSchema.safeParse({ ...summary, latestRevisionId: null, latestRevisionNumber: 0 }).success).toBe(true);
    for (const extra of [{ key: 'Plan' }, { format: 'html' }, { latestRevisionId: 'invalid' }]) {
      expect(PaperclipDocumentoLettoSchema.safeParse({ ...document, ...extra }).success).toBe(false);
    }
  });

  it('s7406_incarico_con_documenti', () => {
    const issue = { id: ISSUE_ID, title: 'Review the plan', status: 'in_review' };
    const { body, ...summary } = document;
    const legacy = { key: 'plan', body, source: 'issue_description' };
    const bundled = { ...issue, planDocument: document, documentSummaries: [summary], legacyPlanDocument: legacy };
    expect(PaperclipIncaricoConDocumentiSchema.parse(bundled)).toEqual(bundled);
    expect(PaperclipIncaricoConDocumentiSchema.parse(issue)).toEqual(issue);
    expect(PaperclipIncaricoConDocumentiSchema.safeParse({
      ...issue, planDocument: null, documentSummaries: [], legacyPlanDocument: null,
    }).success).toBe(true);
    expect(PaperclipPianoLegacySchema.parse(legacy)).toEqual(legacy);
    expect(PaperclipIncaricoConDocumentiSchema.safeParse({
      ...bundled, legacyPlanDocument: { ...legacy, source: 'document' },
    }).success).toBe(false);
  });

  it('s7406_redirect_del_documento_bloccato', () => {
    expect(paperclipDocumentoScritto('plan', { key: 'plan-2' })).toEqual({ key: 'plan-2', rediretto: true });
    expect(paperclipDocumentoScritto('plan', { key: 'plan' })).toEqual({ key: 'plan', rediretto: false });
    expect(() => paperclipDocumentoScritto('plan', { key: 'Plan-2' })).toThrow();
    expect(() => paperclipDocumentoScritto('a/b', { key: 'plan' })).toThrow();
  });

  it('s7406_conflitto', () => {
    const conflict = { error: 'Document revision conflict', details: { currentRevisionId: REVISION_ID } };
    expect(PaperclipDocumentoConflittoSchema.parse(conflict)).toEqual(conflict);
    expect(PaperclipDocumentoConflittoSchema.safeParse({ ...conflict, details: { currentRevisionId: 'invalid' } }).success).toBe(false);
  });

  it('s7406_conferma', () => {
    const target = { type: 'issue_document', key: 'plan', revisionId: REVISION_ID };
    const confirmation = {
      kind: 'request_confirmation',
      idempotencyKey: `confirmation:${ISSUE_ID}:plan:${REVISION_ID}`,
      continuationPolicy: 'wake_assignee_on_accept',
      payload: { version: 1, prompt: 'Accept this plan?', target },
    };
    expect(PaperclipConfermaDocumentoCorpoSchema.parse(confirmation)).toEqual(confirmation);
    expect(PAPERCLIP_CONFERMA_CONTINUATION_POLICIES).toEqual(['none', 'wake_assignee', 'wake_assignee_on_accept']);
    for (const continuationPolicy of PAPERCLIP_CONFERMA_CONTINUATION_POLICIES) {
      expect(PaperclipConfermaDocumentoCorpoSchema.safeParse({ ...confirmation, continuationPolicy }).success).toBe(true);
    }
    const { continuationPolicy, ...withoutPolicy } = confirmation;
    expect(continuationPolicy).toBe('wake_assignee_on_accept');
    expect(PaperclipConfermaDocumentoCorpoSchema.safeParse(withoutPolicy).success).toBe(false);
    expect(PaperclipConfermaDocumentoCorpoSchema.safeParse({ ...confirmation, continuationPolicy: 'always' }).success).toBe(false);
    const { revisionId, ...withoutRevision } = target;
    expect(revisionId).toBe(REVISION_ID);
    expect(PaperclipConfermaDocumentoCorpoSchema.safeParse({
      ...confirmation, payload: { ...confirmation.payload, target: withoutRevision },
    }).success).toBe(false);
    for (const href of ['#document-plan', '/it/issues/X#document-plan', 'https://x.test/a']) {
      expect(PaperclipConfermaDocumentoCorpoSchema.safeParse({
        ...confirmation, payload: { ...confirmation.payload, target: { ...target, label: 'Plan', href } },
      }).success).toBe(true);
    }
    expect(PaperclipConfermaDocumentoCorpoSchema.safeParse({
      ...confirmation, payload: { ...confirmation.payload, target: { ...target, href: '//evil' } },
    }).success).toBe(false);
    expect(PaperclipConfermaDocumentoCorpoSchema.safeParse({
      ...confirmation, payload: { ...confirmation.payload, prompt: 'x'.repeat(1001) },
    }).success).toBe(false);
    const { idempotencyKey, ...withoutIdempotency } = confirmation;
    expect(paperclipConfermaPianoIdempotencyKey(ISSUE_ID, REVISION_ID)).toBe(idempotencyKey);
    expect(PaperclipConfermaDocumentoCorpoSchema.safeParse(withoutIdempotency).success).toBe(false);
    expect(() => paperclipConfermaPianoIdempotencyKey('invalid', REVISION_ID)).toThrow();
    expect(() => paperclipConfermaPianoIdempotencyKey(ISSUE_ID, 'invalid')).toThrow();
  });

  it('s7406_compatibilita_col_piano_di_oggi', () => {
    const body = { format: 'markdown', body: '# Plan', changeSummary: 'First draft' };
    expect(PaperclipPianoCorpoSchema.parse(body)).toEqual(body);
    expect(PaperclipDocumentoCreaCorpoSchema.parse(body)).toEqual(body);
    expect(PaperclipPianoCorpoSchema.safeParse({ ...body, title: 'Plan' }).success).toBe(false);
    expect(PaperclipDocumentoCreaCorpoSchema.safeParse({ ...body, title: 'Plan' }).success).toBe(true);
    expect(PaperclipPianoCorpoSchema.safeParse({ ...body, format: 'html' }).success).toBe(false);
    expect(PaperclipDocumentoCreaCorpoSchema.safeParse({ ...body, format: 'html' }).success).toBe(false);
  });
});
