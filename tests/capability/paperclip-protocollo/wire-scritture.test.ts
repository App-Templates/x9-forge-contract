import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_CHECKOUT_STATI_ATTESI,
  PaperclipAggiornaCorpoSchema,
  PaperclipCheckoutCorpoSchema,
  PaperclipConfermaCorpoSchema,
  PaperclipDocumentoSchema,
  PaperclipFiglioCorpoSchema,
  PaperclipInterazioneSchema,
  PaperclipPianoCorpoSchema,
} from '../../../src/capability/paperclip-protocollo/wire-scritture.js';

const G1 = '11111111-1111-4111-8111-111111111111';
const G2 = '22222222-2222-4222-8222-222222222222';

describe('wire-scritture', () => {
  it('figlio_senza_blocco_del_padre_rifiutato', () => {
    const base = { title: 'T', description: 'D', assigneeAgentId: G1 };
    expect(PaperclipFiglioCorpoSchema.safeParse({ ...base, blockParentUntilDone: true }).success).toBe(true);
    expect(PaperclipFiglioCorpoSchema.safeParse({ ...base, blockParentUntilDone: false }).success).toBe(false);
    expect(PaperclipFiglioCorpoSchema.safeParse(base).success).toBe(false);
    expect(
      PaperclipFiglioCorpoSchema.safeParse({ ...base, blockParentUntilDone: true, goalId: null }).success,
    ).toBe(true);
    expect(
      PaperclipFiglioCorpoSchema.safeParse({ ...base, title: 'x'.repeat(241), blockParentUntilDone: true }).success,
    ).toBe(false);
  });

  it('aggiorna_vuoto_rifiutato', () => {
    expect(PaperclipAggiornaCorpoSchema.safeParse({}).success).toBe(false);
    expect(PaperclipAggiornaCorpoSchema.safeParse({ comment: '  ' }).success).toBe(false);
    expect(PaperclipAggiornaCorpoSchema.safeParse({ status: 'done' }).success).toBe(true);
    expect(PaperclipAggiornaCorpoSchema.safeParse({ comment: 'chiuso' }).success).toBe(true);
    expect(PaperclipAggiornaCorpoSchema.safeParse({ status: 'fatto' }).success).toBe(false);
  });

  it('conferma_senza_revisione_rifiutata', () => {
    const target = { type: 'issue_document', key: 'plan', revisionId: G2 };
    const ok = { kind: 'request_confirmation', payload: { version: 1, prompt: 'ok?', target } };
    expect(PaperclipConfermaCorpoSchema.safeParse(ok).success).toBe(true);
    const { revisionId: _r, ...senza } = target;
    expect(
      PaperclipConfermaCorpoSchema.safeParse({ ...ok, payload: { ...ok.payload, target: senza } }).success,
    ).toBe(false);
    expect(
      PaperclipConfermaCorpoSchema.safeParse({
        ...ok,
        payload: { ...ok.payload, target: { ...target, key: 'altro' } },
      }).success,
    ).toBe(false);
  });

  it('checkout_con_stati_attesi_del_protocollo', () => {
    expect([...PAPERCLIP_CHECKOUT_STATI_ATTESI]).toEqual(['todo', 'backlog', 'blocked', 'in_review']);
    expect(
      PaperclipCheckoutCorpoSchema.safeParse({ agentId: G1, expectedStatuses: [...PAPERCLIP_CHECKOUT_STATI_ATTESI] })
        .success,
    ).toBe(true);
    expect(PaperclipCheckoutCorpoSchema.safeParse({ agentId: G1, expectedStatuses: [] }).success).toBe(false);
  });

  it('piano_solo_markdown', () => {
    expect(PaperclipPianoCorpoSchema.safeParse({ format: 'markdown', body: '# Piano' }).success).toBe(true);
    expect(PaperclipPianoCorpoSchema.safeParse({ format: 'html', body: '# Piano' }).success).toBe(false);
    expect(PaperclipPianoCorpoSchema.safeParse({ format: 'markdown', body: ' ' }).success).toBe(false);
    expect(
      PaperclipPianoCorpoSchema.safeParse({ format: 'markdown', body: 'x', changeSummary: 'y'.repeat(501) }).success,
    ).toBe(false);
  });

  it('risposte_tollerano_campi_extra', () => {
    expect(
      PaperclipDocumentoSchema.safeParse({ id: G1, key: 'plan', latestRevisionId: G2, extra: 1 }).success,
    ).toBe(true);
    expect(PaperclipDocumentoSchema.safeParse({ id: G1, key: 'plan' }).success).toBe(false);
    expect(PaperclipInterazioneSchema.safeParse({ id: G1, kind: 'k', status: 'pending', x: 1 }).success).toBe(true);
  });
});
