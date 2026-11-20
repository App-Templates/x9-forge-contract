import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_INGRESSO_RIFIUTI,
  PAPERCLIP_STATI_APERTI,
  PAPERCLIP_STATI_TERMINALI,
  PAPERCLIP_TRANSIZIONI,
  PAPERCLIP_VIE_REVISIONE,
  paperclipIngressoStato,
  paperclipStatoTerminale,
  paperclipTransizioneAmmessa,
  type PaperclipIngressoFatti,
} from '../../../src/capability/paperclip-protocollo/stati.js';
import {
  PAPERCLIP_STATI_INCARICO,
  PaperclipStatoIncaricoSchema,
  type PaperclipStatoIncarico,
} from '../../../src/capability/paperclip-protocollo/wire-letture.js';
import { PaperclipIssueStatusSchema } from '../../../src/capability/paperclip/tools.js';

// Paperclip doc/SPEC-implementation.md:516-523, scritta a mano.
const TABELLA: Record<PaperclipStatoIncarico, readonly PaperclipStatoIncarico[]> = {
  backlog: ['todo', 'cancelled'],
  todo: ['in_progress', 'blocked', 'cancelled'],
  in_progress: ['in_review', 'blocked', 'done', 'cancelled'],
  in_review: ['in_progress', 'done', 'cancelled'],
  blocked: ['todo', 'in_progress', 'cancelled'],
  done: [],
  cancelled: [],
};

const fatti = (over: Partial<PaperclipIngressoFatti>): PaperclipIngressoFatti => ({
  da: 'todo',
  a: 'todo',
  haAssegnatario: true,
  bloccantiNonRisolti: 0,
  haDescrittoreSblocco: false,
  haInterazioneOApprovazionePendente: false,
  vieRevisione: [],
  ...over,
});

describe('s7401 stati di Paperclip', () => {
  it('s7401_fonte_unica', () => {
    expect(PaperclipIssueStatusSchema).toBe(PaperclipStatoIncaricoSchema);
    expect(PaperclipIssueStatusSchema.options).toEqual([...PAPERCLIP_STATI_INCARICO]);
    const uniti = [...PAPERCLIP_STATI_TERMINALI, ...PAPERCLIP_STATI_APERTI];
    expect(new Set(uniti).size).toBe(uniti.length);
    expect([...uniti].sort()).toEqual([...PAPERCLIP_STATI_INCARICO].sort());
    expect(uniti).toHaveLength(7);
    expect([...PAPERCLIP_STATI_TERMINALI]).toEqual(['done', 'cancelled']);
  });

  it('s7401_matrice_completa', () => {
    expect(Object.keys(PAPERCLIP_TRANSIZIONI).sort()).toEqual([...PAPERCLIP_STATI_INCARICO].sort());
    let coppie = 0;
    for (const da of PAPERCLIP_STATI_INCARICO) {
      for (const a of PAPERCLIP_STATI_INCARICO) {
        coppie += 1;
        const esito = paperclipTransizioneAmmessa(da, a);
        const atteso = da === a || TABELLA[da].includes(a);
        expect(esito.ok, `${da} -> ${a}`).toBe(atteso);
        if (da !== a && atteso) expect(esito).toEqual({ ok: true, via: 'matrice' });
      }
    }
    expect(coppie).toBe(49);
  });

  it('s7401_casi_veri', () => {
    expect(paperclipTransizioneAmmessa('backlog', 'done')).toEqual({ ok: false, motivo: 'transizione_non_ammessa' });
    expect(paperclipTransizioneAmmessa('done', 'todo')).toEqual({ ok: false, motivo: 'stato_terminale' });
    expect(paperclipTransizioneAmmessa('cancelled', 'todo')).toEqual({ ok: false, motivo: 'stato_terminale' });
    expect(paperclipTransizioneAmmessa('todo', 'in_progress')).toEqual({ ok: true, via: 'matrice' });
    expect(paperclipTransizioneAmmessa('in_progress', 'done')).toEqual({ ok: true, via: 'matrice' });
    expect(paperclipTransizioneAmmessa('blocked', 'blocked')).toEqual({ ok: true, via: 'invariato' });
    expect(paperclipStatoTerminale('done')).toBe(true);
    expect(paperclipStatoTerminale('cancelled')).toBe(true);
    expect(paperclipStatoTerminale('blocked')).toBe(false);
  });

  it('s7401_ingresso_in_progress', () => {
    expect(paperclipIngressoStato(fatti({ da: 'todo', a: 'in_progress' }))).toEqual({ ok: true });
    expect(paperclipIngressoStato(fatti({ da: 'todo', a: 'in_progress', haAssegnatario: false })))
      .toEqual({ ok: false, motivo: 'in_progress_senza_assegnatario' });
    expect(paperclipIngressoStato(fatti({ da: 'todo', a: 'in_progress', bloccantiNonRisolti: 1 })))
      .toEqual({ ok: false, motivo: 'in_progress_con_blocchi_non_risolti' });
    expect(paperclipIngressoStato(fatti({
      da: 'in_progress', a: 'in_progress', haAssegnatario: false, bloccantiNonRisolti: 2,
    }))).toEqual({ ok: true });
  });

  it('s7401_ingresso_blocked', () => {
    expect(paperclipIngressoStato(fatti({ da: 'todo', a: 'blocked' })))
      .toEqual({ ok: false, motivo: 'blocked_senza_percorso' });
    for (const percorso of [
      { bloccantiNonRisolti: 1 },
      { haDescrittoreSblocco: true },
      { haInterazioneOApprovazionePendente: true },
    ]) {
      expect(paperclipIngressoStato(fatti({ da: 'todo', a: 'blocked', ...percorso }))).toEqual({ ok: true });
    }
    expect(paperclipIngressoStato(fatti({ da: 'blocked', a: 'blocked' }))).toEqual({ ok: true });
  });

  it('s7401_ingresso_in_review', () => {
    expect(paperclipIngressoStato(fatti({ da: 'in_progress', a: 'in_review' })))
      .toEqual({ ok: false, motivo: 'in_review_senza_strada' });
    for (const via of PAPERCLIP_VIE_REVISIONE) {
      expect(paperclipIngressoStato(fatti({ da: 'in_progress', a: 'in_review', vieRevisione: [via] })))
        .toEqual({ ok: true });
    }
    expect([...PAPERCLIP_VIE_REVISIONE]).toEqual([
      'pending_issue_thread_interaction',
      'linked_pending_approval',
      'human_assignee_user_id',
      'typed_execution_state_current_participant',
      'scheduled_issue_monitor',
    ]);
    expect([...PAPERCLIP_INGRESSO_RIFIUTI]).toEqual([
      'in_progress_senza_assegnatario',
      'in_progress_con_blocchi_non_risolti',
      'blocked_senza_percorso',
      'in_review_senza_strada',
    ]);
  });
});
