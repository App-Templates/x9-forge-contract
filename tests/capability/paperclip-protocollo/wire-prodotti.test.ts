import { describe, expect, it } from 'vitest';
import * as capability from '../../../src/capability/index.js';
import { paperclipPercorsi } from '../../../src/capability/paperclip-protocollo/percorsi.js';
import { PaperclipIncaricoSchema } from '../../../src/capability/paperclip-protocollo/wire-letture.js';
import {
  PAPERCLIP_WORK_PRODUCT_HEALTH,
  PAPERCLIP_WORK_PRODUCT_REVIEW_STATES,
  PAPERCLIP_WORK_PRODUCT_STATUSES,
  PAPERCLIP_WORK_PRODUCT_TYPES,
  PaperclipIncaricoConProdottiSchema,
  PaperclipProdottiSchema,
  PaperclipProdottoAggiornaCorpoSchema,
  PaperclipProdottoCreaCorpoSchema,
  PaperclipProdottoSchema,
  PaperclipProdottoTipoSchema,
  paperclipProdottoDaAllegato,
  paperclipProdottoDellaCorsa,
} from '../../../src/capability/paperclip-protocollo/wire-prodotti.js';

const g = (n: number): string => `${String(n).repeat(8)}-${String(n).repeat(4)}-4${String(n).repeat(3)}-8${String(n).repeat(3)}-${String(n).repeat(12)}`;
const attachmentId = g(3);

const riga = {
  id: g(1),
  companyId: g(2),
  issueId: g(4),
  projectId: null,
  executionWorkspaceId: null,
  runtimeServiceId: null,
  type: 'artifact',
  provider: 'paperclip',
  externalId: null,
  title: 's1.png',
  url: null,
  status: 'active',
  reviewState: 'none',
  isPrimary: false,
  healthStatus: 'unknown',
  summary: null,
  metadata: { attachmentId },
  createdByRunId: null,
  createdAt: '2026-11-18T10:00:00.000Z',
  updatedAt: '2026-11-18T10:00:00.000Z',
};

describe('s7418 prodotti-del-lavoro', () => {
  it('s7418_enum_chiusi', () => {
    expect([...PAPERCLIP_WORK_PRODUCT_TYPES]).toEqual(['preview_url', 'runtime_service', 'pull_request', 'branch', 'commit', 'artifact', 'document']);
    expect([...PAPERCLIP_WORK_PRODUCT_STATUSES]).toEqual(['active', 'ready_for_review', 'approved', 'changes_requested', 'merged', 'closed', 'failed', 'archived', 'draft']);
    expect([...PAPERCLIP_WORK_PRODUCT_REVIEW_STATES]).toEqual(['none', 'needs_board_review', 'approved', 'changes_requested']);
    expect([...PAPERCLIP_WORK_PRODUCT_HEALTH]).toEqual(['unknown', 'healthy', 'unhealthy']);
    for (const t of PAPERCLIP_WORK_PRODUCT_TYPES) expect(PaperclipProdottoTipoSchema.safeParse(t).success).toBe(true);
    for (const t of ['artefatto', 'pr', '']) expect(PaperclipProdottoTipoSchema.safeParse(t).success).toBe(false);
  });

  it('s7418_artifact_paperclip', () => {
    const base = { type: 'artifact', provider: 'paperclip', title: 's1.png' };
    expect(PaperclipProdottoCreaCorpoSchema.safeParse({ ...base, metadata: { attachmentId } }).success).toBe(true);
    expect(PaperclipProdottoCreaCorpoSchema.safeParse(base).success).toBe(false);
    expect(PaperclipProdottoCreaCorpoSchema.safeParse({ ...base, metadata: null }).success).toBe(false);
    expect(PaperclipProdottoCreaCorpoSchema.safeParse({ ...base, metadata: { attachmentId: 'x' } }).success).toBe(false);
    expect(PaperclipProdottoCreaCorpoSchema.safeParse({ ...base, metadata: { attachmentId, byteSize: 10 } }).success).toBe(false);
    expect(PaperclipProdottoCreaCorpoSchema.safeParse({ type: 'artifact', provider: 'github', title: 'x', metadata: { qualsiasi: 1 } }).success).toBe(true);
  });

  it('s7418_commit_di_oggi', () => {
    const corpo = {
      type: 'commit',
      provider: 'github',
      externalId: 'abc123',
      title: 'Commit abc123',
      url: 'https://github.com/org/repo/commit/abc123',
      status: 'approved',
      isPrimary: true,
    };
    const r = PaperclipProdottoCreaCorpoSchema.safeParse(corpo);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual(corpo);
    expect(PaperclipProdottoCreaCorpoSchema.safeParse({ ...corpo, url: 'non-un-url' }).success).toBe(false);
    expect(PaperclipProdottoCreaCorpoSchema.safeParse({ ...corpo, status: 'fatto' }).success).toBe(false);
    expect(PaperclipProdottoCreaCorpoSchema.safeParse({ ...corpo, chiaveIgnota: 1 }).success).toBe(false);
  });

  it('s7418_correzione', () => {
    expect(PaperclipProdottoAggiornaCorpoSchema.safeParse({}).success).toBe(true);
    expect(PaperclipProdottoAggiornaCorpoSchema.safeParse({ status: 'merged' }).success).toBe(true);
    expect(PaperclipProdottoAggiornaCorpoSchema.safeParse({ type: 'artifact', provider: 'paperclip', metadata: { x: 1 } }).success).toBe(false);
    expect(PaperclipProdottoAggiornaCorpoSchema.safeParse({ metadata: { x: 1 } }).success).toBe(true);
  });

  it('s7418_riga_letta', () => {
    expect(PaperclipProdottoSchema.safeParse(riga).success).toBe(true);
    expect(PaperclipProdottoSchema.safeParse({ ...riga, nuovo: 1 }).success).toBe(true);
    expect(PaperclipProdottoSchema.safeParse({ ...riga, type: 'altro' }).success).toBe(false);
    expect(PaperclipProdottoSchema.safeParse({ ...riga, isPrimary: 'si' }).success).toBe(false);
    const { issueId: _omesso, ...senzaIssue } = riga;
    expect(PaperclipProdottoSchema.safeParse(senzaIssue).success).toBe(false);
    expect(PaperclipProdottiSchema.safeParse([]).success).toBe(true);
    expect(PaperclipProdottiSchema.safeParse([riga, { ...riga, type: 'altro' }]).success).toBe(false);
  });

  it('s7418_incarico_con_prodotti', () => {
    const incarico = { id: g(5), title: 'Incarico', status: 'todo' };
    expect(PaperclipIncaricoSchema.safeParse(incarico).success).toBe(true);
    expect(PaperclipIncaricoConProdottiSchema.safeParse(incarico).success).toBe(true);
    expect(PaperclipIncaricoConProdottiSchema.safeParse({ ...incarico, workProducts: [riga] }).success).toBe(true);
    expect(PaperclipIncaricoConProdottiSchema.safeParse({ ...incarico, workProducts: [{ ...riga, type: 'altro' }] }).success).toBe(false);
    expect(PaperclipIncaricoSchema.safeParse({ ...incarico, workProducts: [riga] }).success).toBe(true);
  });

  it('s7418_prodotto_da_allegato', () => {
    const corpo = paperclipProdottoDaAllegato({ id: attachmentId, originalFilename: 's1.png' });
    expect(corpo).toEqual({
      type: 'artifact',
      provider: 'paperclip',
      title: 's1.png',
      status: 'active',
      reviewState: 'none',
      isPrimary: false,
      metadata: { attachmentId },
    });
    expect(PaperclipProdottoCreaCorpoSchema.safeParse(corpo).success).toBe(true);
    expect(paperclipProdottoDaAllegato({ id: attachmentId, originalFilename: null }).title).toBe('Attachment');
    const o = paperclipProdottoDaAllegato({ id: attachmentId, originalFilename: 's1.png' }, { status: 'ready_for_review', reviewState: 'needs_board_review', isPrimary: true });
    expect(o).toMatchObject({ status: 'ready_for_review', reviewState: 'needs_board_review', isPrimary: true });
  });

  it('s7418_corsa_autenticata', () => {
    expect(paperclipProdottoDellaCorsa({ createdByRunId: g(7) }, g(6))).toBe(false);
    expect(paperclipProdottoDellaCorsa({}, g(6))).toBe(true);
    expect(paperclipProdottoDellaCorsa({ createdByRunId: null }, g(6))).toBe(true);
    expect(paperclipProdottoDellaCorsa({ createdByRunId: g(6) }, g(6))).toBe(true);
  });

  it('s7418_percorsi_esatti', () => {
    expect(paperclipPercorsi.prodottiLavoro(g(4))).toBe(`/api/issues/${g(4)}/work-products`);
    expect(paperclipPercorsi.prodottoLavoro(g(1))).toBe(`/api/work-products/${g(1)}`);
    expect(() => paperclipPercorsi.prodottiLavoro('x')).toThrow();
    expect(() => paperclipPercorsi.prodottoLavoro('x')).toThrow();
  });

  it('s7418_esportazioni', () => {
    expect(capability.PaperclipProdottoCreaCorpoSchema).toBeDefined();
  });
});
