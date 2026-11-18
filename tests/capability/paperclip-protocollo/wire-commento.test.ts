import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_ALLEGATI_MASSIMI_PER_COMMENTO,
  PAPERCLIP_CAMPI_COMMENTO_VIETATI,
  PAPERCLIP_RIPRESA_RIFIUTI,
  PAPERCLIP_STATI_RIPRENDIBILI,
  PaperclipAggiornaConCommentoCorpoSchema,
  PaperclipAggiornaRispostaCompletaSchema,
  PaperclipAggiornaRispostaMinimaSchema,
  PaperclipAggiornaRispostaSchema,
  PaperclipCambiamentiSchema,
  PaperclipCommentoCorpoEstesoSchema,
  paperclipCommentoGiaScritto,
  paperclipRipresaAmmessa,
  type PaperclipRipresaFatti,
} from '../../../src/capability/paperclip-protocollo/wire-commento.js';
import {
  PaperclipAggiornaCorpoSchema,
  PaperclipCommentoCorpoSchema,
} from '../../../src/capability/paperclip-protocollo/wire-scritture.js';

const G1 = '11111111-1111-4111-8111-111111111111';
const G2 = '22222222-2222-4222-8222-222222222222';
const attachments = Array.from(
  { length: 21 },
  (_, index) => `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
);

describe('wire-commento', () => {
  it('s7403_commento_esteso', () => {
    expect(PAPERCLIP_ALLEGATI_MASSIMI_PER_COMMENTO).toBe(20);
    for (const body of [
      { body: 'c' },
      { body: 'c', attachmentIds: [G1] },
      { body: 'c', attachmentIds: attachments.slice(0, 20) },
      { body: 'c', reopen: true },
      { body: 'c', resume: true },
    ]) {
      expect(PaperclipCommentoCorpoEstesoSchema.safeParse(body).success).toBe(true);
    }
    expect(PaperclipCommentoCorpoEstesoSchema.parse({ body: ' c ' })).toEqual({ body: 'c' });
    for (const body of [
      { body: '  ' },
      { body: 'c', reopen: false },
      { body: 'c', resume: false },
      { body: 'c', reopen: true, resume: true },
      { body: 'c', attachmentIds: attachments },
      { body: 'c', attachmentIds: [G1, G1] },
      { body: 'c', attachmentIds: ['not-a-uuid'] },
    ]) {
      expect(PaperclipCommentoCorpoEstesoSchema.safeParse(body).success).toBe(false);
    }
  });

  it('s7403_aggiornamento_esteso', () => {
    for (const body of [
      { status: 'done' },
      { comment: 'c' },
      { assigneeAgentId: G1 },
      { assigneeAgentId: G1, comment: 'passo a te' },
      { resume: true, comment: 'riprendi' },
      { reopen: true, comment: 'riapri' },
      { comment: 'prove', attachmentIds: attachments.slice(0, 20) },
    ]) {
      expect(PaperclipAggiornaConCommentoCorpoSchema.safeParse(body).success).toBe(true);
    }
    for (const body of [
      {},
      { comment: '  ' },
      { assigneeAgentId: 'director' },
      { attachmentIds: [G1], status: 'done' },
      { attachmentIds: [], status: 'done' },
      { resume: true },
      { reopen: true },
      { reopen: true, comment: 'riapri', status: 'todo' },
      { resume: true, comment: 'riprendi', status: 'todo' },
      { reopen: true, resume: true, comment: 'c' },
      { reopen: false, comment: 'c' },
      { resume: false, comment: 'c' },
      { status: 'fatto' },
      { comment: 'c', attachmentIds: attachments },
      { comment: 'c', attachmentIds: [G1, G1] },
      { comment: 'c', attachmentIds: ['not-a-uuid'] },
      { comment: 'c', priority: 'high' },
      { comment: 'c', parentId: G1 },
    ]) {
      expect(PaperclipAggiornaConCommentoCorpoSchema.safeParse(body).success).toBe(false);
    }
  });

  it('s7403_campi_vietati', () => {
    const fields = [
      'interrupt', 'presentation', 'metadata', 'clientRequestId',
      'commentClientRequestId', 'onBehalfOfUserId', 'authorType',
    ];
    expect(Object.keys(PAPERCLIP_CAMPI_COMMENTO_VIETATI).sort()).toEqual(fields.sort());
    for (const [field, reason] of Object.entries(PAPERCLIP_CAMPI_COMMENTO_VIETATI)) {
      expect(reason.trim().length).toBeGreaterThan(0);
      expect(reason).toMatch(/\.ts:\d+/);
      expect(PaperclipCommentoCorpoEstesoSchema.safeParse({ body: 'c', [field]: true }).success).toBe(false);
      expect(PaperclipAggiornaConCommentoCorpoSchema.safeParse({ comment: 'c', [field]: true }).success).toBe(false);
    }
  });

  it('s7403_coerenza_con_oggi', () => {
    for (const body of [{ status: 'done' }, { comment: 'c' }, { status: 'done', comment: 'c' }]) {
      expect(PaperclipAggiornaConCommentoCorpoSchema.safeParse(body)).toEqual(
        PaperclipAggiornaCorpoSchema.safeParse(body),
      );
    }
    expect(PaperclipCommentoCorpoEstesoSchema.safeParse({ body: 'c' })).toEqual(
      PaperclipCommentoCorpoSchema.safeParse({ body: 'c' }),
    );
    expect(PaperclipAggiornaCorpoSchema.safeParse({}).success).toBe(false);
    expect(PaperclipAggiornaConCommentoCorpoSchema.safeParse({}).success).toBe(false);
    expect(PaperclipCommentoCorpoSchema.safeParse({}).success).toBe(false);
    expect(PaperclipCommentoCorpoEstesoSchema.safeParse({}).success).toBe(false);
  });

  it('s7403_ripresa', () => {
    const base: PaperclipRipresaFatti = {
      via: 'resume', stato: 'done', bloccantiNonRisolti: 0,
      sottoalberoInPausa: false, haAssegnatarioAgente: true,
    };
    expect(PAPERCLIP_STATI_RIPRENDIBILI).toEqual(['done', 'cancelled', 'blocked', 'todo', 'in_progress']);
    expect(PAPERCLIP_RIPRESA_RIFIUTI).toEqual([
      'non_riprendibile', 'cancellato_serve_resume', 'blocchi_non_risolti',
      'sottoalbero_in_pausa', 'senza_assegnatario',
    ]);
    expect(paperclipRipresaAmmessa({ ...base, via: 'reopen' })).toEqual({ ok: true });
    expect(paperclipRipresaAmmessa({ ...base, stato: 'cancelled', via: 'reopen' })).toEqual({
      ok: false, motivo: 'cancellato_serve_resume',
    });
    for (const stato of ['cancelled', 'todo', 'in_progress', 'blocked'] as const) {
      expect(paperclipRipresaAmmessa({ ...base, stato })).toEqual({ ok: true });
    }
    for (const stato of ['in_review', 'backlog'] as const) {
      expect(paperclipRipresaAmmessa({ ...base, stato })).toEqual({ ok: false, motivo: 'non_riprendibile' });
    }
    expect(paperclipRipresaAmmessa({ ...base, stato: 'blocked', bloccantiNonRisolti: 1 })).toEqual({
      ok: false, motivo: 'blocchi_non_risolti',
    });
    expect(paperclipRipresaAmmessa({ ...base, sottoalberoInPausa: true })).toEqual({
      ok: false, motivo: 'sottoalbero_in_pausa',
    });
    expect(paperclipRipresaAmmessa({ ...base, haAssegnatarioAgente: false })).toEqual({
      ok: false, motivo: 'senza_assegnatario',
    });
  });

  it('s7403_risposta_aggiornamento', () => {
    const changes = { priority: { from: 'medium', to: 'high' } };
    const minimal = { id: G1, identifier: 'PC-5', updatedAt: '2026-11-18T10:00:00Z', changes, comment: null };
    const full = { ...minimal, title: 'Incarico', status: 'done' };
    expect(PaperclipCambiamentiSchema.parse(changes)).toEqual(changes);
    expect(PaperclipAggiornaRispostaCompletaSchema.parse(full)).toEqual(full);
    expect(PaperclipAggiornaRispostaMinimaSchema.parse(minimal)).toEqual(minimal);
    for (const response of [
      full, minimal, { ...minimal, identifier: null },
      { ...minimal, comment: { id: G2 } },
      { ...full, comment: { id: G2, body: 'c' } },
    ]) {
      expect(PaperclipAggiornaRispostaSchema.safeParse(response).success).toBe(true);
    }
    for (const response of [
      undefined, '', {}, { id: G1, title: 'Incarico', status: 'done' },
      { ...minimal, extra: 1 }, { ...minimal, comment: {} },
      { ...minimal, changes: { priority: { from: 'medium' } } },
      { ...minimal, changes: { priority: { from: 'medium', to: 'high', extra: 1 } } },
    ]) {
      expect(PaperclipAggiornaRispostaSchema.safeParse(response).success).toBe(false);
    }
  });

  it('s7403_commento_gia_scritto', () => {
    expect(paperclipCommentoGiaScritto([{ body: 'c', authorAgentId: G1 }], G1, 'c')).toBe(true);
    expect(paperclipCommentoGiaScritto([{ body: ' c ', authorAgentId: G1 }], G1, 'c')).toBe(true);
    expect(paperclipCommentoGiaScritto([{ body: 'c', authorAgentId: G1 }], G1, ' c ')).toBe(true);
    expect(paperclipCommentoGiaScritto([{ body: 'c', authorAgentId: G2 }], G1, 'c')).toBe(false);
    expect(paperclipCommentoGiaScritto([{ body: 'other', authorAgentId: G1 }], G1, 'c')).toBe(false);
    expect(paperclipCommentoGiaScritto([{ body: 'c', authorAgentId: null }], G1, 'c')).toBe(false);
    expect(paperclipCommentoGiaScritto([{ body: 'c' }], G1, 'c')).toBe(false);
    expect(paperclipCommentoGiaScritto([], G1, 'c')).toBe(false);
  });
});
