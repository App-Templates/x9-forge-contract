import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_COMMENTO_MANCANTE_RITENTATIVI,
  PAPERCLIP_COMMENTO_OBBLIGATORIO_STATI,
  PAPERCLIP_MOTIVO_COMMENTO_MANCANTE,
  PAPERCLIP_RECUPERO_INTENTI,
  PaperclipTurnoContestoSchema,
  PaperclipTurnoErroreSchema,
  PaperclipTurnoRichiestaSchema,
  incaricoDelTurno,
  paperclipTurnoSoloDisposizione,
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

  it('s7413_contesto_solo_disposizione', () => {
    const context = {
      issueId: INCARICO,
      recoveryIntent: 'status_only',
      allowDeliverableWork: false,
      allowDocumentUpdates: false,
      resumeRequiresNormalModel: true,
      wakeReason: 'missing_issue_comment',
    };
    const parsed = PaperclipTurnoRichiestaSchema.parse({
      runId: RUN,
      agentId: AGENTE,
      context,
    });
    expect(parsed.context).toEqual(context);
    expect(paperclipTurnoSoloDisposizione(parsed.context)).toBe(true);
    expect(
      paperclipTurnoSoloDisposizione(
        PaperclipTurnoContestoSchema.parse({ recoveryIntent: 'status_only' }),
      ),
    ).toBe(true);
  });

  it('s7413_solo_disposizione_per_lavoro_vietato', () => {
    expect(
      paperclipTurnoSoloDisposizione(
        PaperclipTurnoContestoSchema.parse({ allowDeliverableWork: false }),
      ),
    ).toBe(true);
    expect(
      paperclipTurnoSoloDisposizione(
        PaperclipTurnoContestoSchema.parse({ allowDeliverableWork: true }),
      ),
    ).toBe(false);
    expect(paperclipTurnoSoloDisposizione(PaperclipTurnoContestoSchema.parse({}))).toBe(false);
  });

  it('s7413_valore_storto_scartato', () => {
    const context = {
      issueId: INCARICO,
      wakeReason: 'missing_issue_comment',
      recoveryIntent: 'normal_model',
      allowDeliverableWork: 'no',
      allowDocumentUpdates: 'no',
      resumeRequiresNormalModel: 'yes',
    };
    const parsed = PaperclipTurnoRichiestaSchema.parse({
      runId: RUN,
      agentId: AGENTE,
      context,
    }).context;
    expect(parsed.recoveryIntent).toBeUndefined();
    expect(parsed.allowDeliverableWork).toBeUndefined();
    expect(parsed.allowDocumentUpdates).toBeUndefined();
    expect(parsed.resumeRequiresNormalModel).toBeUndefined();
    expect(parsed.issueId).toBe(INCARICO);
    expect(parsed.wakeReason).toBe('missing_issue_comment');
    expect(paperclipTurnoSoloDisposizione(parsed)).toBe(false);
    expect(
      PaperclipTurnoContestoSchema.safeParse({ ...context, issueId: 'non-un-guid' }).success,
    ).toBe(false);
  });

  it('s7413_contesti_di_oggi_invariati', () => {
    const contexts = [
      { taskId: INCARICO, wakeReason: 'issue_assigned', extra: 1 },
      { taskId: INCARICO, issueId: ALTRO },
      { issueId: ALTRO },
      {},
    ];
    for (const context of contexts) {
      const parsed = PaperclipTurnoContestoSchema.parse(context);
      expect(parsed).toStrictEqual(context);
      expect(paperclipTurnoSoloDisposizione(parsed)).toBe(false);
    }
  });

  it('s7413_costanti', () => {
    expect(PAPERCLIP_MOTIVO_COMMENTO_MANCANTE).toBe('missing_issue_comment');
    expect(PAPERCLIP_COMMENTO_OBBLIGATORIO_STATI).toEqual([
      'satisfied',
      'retry_queued',
      'retry_exhausted',
    ]);
    expect(PAPERCLIP_RECUPERO_INTENTI).toEqual(['status_only']);
    expect(PAPERCLIP_COMMENTO_MANCANTE_RITENTATIVI).toBe(1);
  });
});
