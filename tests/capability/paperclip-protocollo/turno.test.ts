import { describe, expect, it } from 'vitest';
import {
  PaperclipTurnoErroreSchema,
  PaperclipTurnoRichiestaSchema,
  incaricoDelTurno,
} from '../../../src/capability/paperclip-protocollo/turno.js';
import { paperclipProtocolloTurnoContract } from '../../../src/http/endpoints/paperclip-protocollo-turno.js';

const RUN = '11111111-1111-4111-8111-111111111111';
const AGENTE = '22222222-2222-4222-8222-222222222222';
const INCARICO = '33333333-3333-4333-8333-333333333333';
const ALTRO = '44444444-4444-4444-8444-444444444444';

describe('turno Paperclip', () => {
  it('corpo_reale_adattatore_http', () => {
    const corpo = {
      campoDelTemplate: 'valore',
      agentId: AGENTE,
      runId: RUN,
      context: { taskId: INCARICO, wakeReason: 'issue_assigned', extra: 1 },
      paperclipRuntimeTools: [{ name: 'x' }],
    };
    const r = PaperclipTurnoRichiestaSchema.parse(corpo);
    expect(r.runId).toBe(RUN);
    expect((r as Record<string, unknown>).campoDelTemplate).toBe('valore');
    expect((r as Record<string, unknown>).paperclipRuntimeTools).toEqual([{ name: 'x' }]);
    expect(PaperclipTurnoRichiestaSchema.safeParse({ ...corpo, agentId: 'x' }).success).toBe(false);
    expect(PaperclipTurnoRichiestaSchema.safeParse({ runId: RUN, agentId: AGENTE }).success).toBe(
      false,
    );
    expect(PaperclipTurnoErroreSchema.safeParse({ ok: false, error: 'altro' }).success).toBe(false);
    expect(
      PaperclipTurnoErroreSchema.safeParse({ ok: false, error: 'turno_gia_aperto' }).success,
    ).toBe(true);
  });

  it('run_id_non_guid_rifiutato', () => {
    const r = PaperclipTurnoRichiestaSchema.safeParse({
      runId: 'non-un-guid',
      agentId: AGENTE,
      context: {},
    });
    expect(r.success).toBe(false);
  });

  it('incarico_da_task_id_poi_issue_id', () => {
    expect(incaricoDelTurno({ taskId: INCARICO, issueId: ALTRO })).toBe(INCARICO);
    expect(incaricoDelTurno({ issueId: ALTRO })).toBe(ALTRO);
    expect(incaricoDelTurno({})).toBeNull();
  });

  it('percorso_webhook_esatto', () => {
    expect(paperclipProtocolloTurnoContract.path).toBe('/webhook/paperclip/turno');
    expect(paperclipProtocolloTurnoContract.method).toBe('POST');
    expect(paperclipProtocolloTurnoContract.authType).toBe('external_provider');
  });
});
