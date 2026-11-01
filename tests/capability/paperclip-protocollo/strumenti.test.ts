import { describe, expect, it } from 'vitest';
import { PAPERCLIP_PROTOCOLLO_RUOLI } from '../../../src/capability/paperclip-protocollo/agenti.js';
import { PAPERCLIP_STATI_INCARICO } from '../../../src/capability/paperclip-protocollo/wire-letture.js';
import {
  PAPERCLIP_PROTOCOLLO_ERRORI,
  PAPERCLIP_PROTOCOLLO_TOOLS,
  PaperclipProtocolloErroreSchema,
  PcpAffidaIngressoSchema,
  PcpCommentaIngressoSchema,
  PcpConcludiIngressoSchema,
  PcpEsitoSchema,
  PcpLeggiIngressoSchema,
  PcpLeggiUscitaSchema,
  PcpPianoIngressoSchema,
  PcpPrendiIngressoSchema,
} from '../../../src/capability/paperclip-protocollo/strumenti.js';

const issueId = '11111111-1111-4111-8111-111111111111';
const figlioId = '22222222-2222-4222-8222-222222222222';
const affida = { issueId, a: 'lab', titolo: 'Check the gaps', istruzioni: 'x'.repeat(40) };
const ingressi = [
  [PcpPrendiIngressoSchema, { issueId }],
  [PcpLeggiIngressoSchema, { issueId }],
  [PcpCommentaIngressoSchema, { issueId, testo: 'Comment' }],
  [PcpAffidaIngressoSchema, affida],
  [PcpConcludiIngressoSchema, { issueId, risultato: 'Result' }],
  [PcpPianoIngressoSchema, { issueId, piano: 'x'.repeat(300) }],
] as const;

describe('paperclip-protocollo strumenti', () => {
  it('sei_strumenti_con_prefisso_pcp', () => {
    expect(PAPERCLIP_PROTOCOLLO_TOOLS).toEqual({
      prendi: 'pcp_prendi', leggi: 'pcp_leggi', commenta: 'pcp_commenta',
      affida: 'pcp_affida', concludi: 'pcp_concludi', piano: 'pcp_scrivi_piano',
    });
    const nomi = Object.values(PAPERCLIP_PROTOCOLLO_TOOLS);
    expect(nomi).toHaveLength(6);
    expect(new Set(nomi).size).toBe(6);
    expect(nomi.every(nome => nome.startsWith('pcp_'))).toBe(true);
  });

  it('affida_istruzioni_corte_rifiutate', () => {
    for (const istruzioni of ['', ' ', 'x'.repeat(39), ` ${'x'.repeat(39)} `]) {
      expect(PcpAffidaIngressoSchema.safeParse({ ...affida, istruzioni }).success).toBe(false);
    }
    expect(PcpAffidaIngressoSchema.parse(affida)).toEqual(affida);
  });

  it('affida_ruolo_sconosciuto_rifiutato', () => {
    expect(PcpAffidaIngressoSchema.safeParse({ ...affida, a: 'altro' }).success).toBe(false);
    for (const a of PAPERCLIP_PROTOCOLLO_RUOLI) {
      expect(PcpAffidaIngressoSchema.parse({ ...affida, a }).a).toBe(a);
    }
  });

  it('piano_troppo_corto_rifiutato', () => {
    for (const piano of ['', ' ', 'x'.repeat(299), ` ${'x'.repeat(299)} `]) {
      expect(PcpPianoIngressoSchema.safeParse({ issueId, piano }).success).toBe(false);
    }
    expect(PcpPianoIngressoSchema.parse({ issueId, piano: ` ${'x'.repeat(300)} ` }).piano)
      .toBe('x'.repeat(300));
  });

  it('errore_conflitto_presente', () => {
    expect(PAPERCLIP_PROTOCOLLO_ERRORI).toContain('conflitto_proprietario');
    expect(PaperclipProtocolloErroreSchema.parse('conflitto_proprietario')).toBe('conflitto_proprietario');
  });

  it('errori_esatti_e_sconosciuti_rifiutati', () => {
    expect(PAPERCLIP_PROTOCOLLO_ERRORI).toEqual([
      'feature_off', 'turno_assente', 'identity_mismatch', 'credential_missing',
      'incarico_non_preso', 'delega_non_ammessa', 'conflitto_proprietario',
      'non_autorizzato', 'non_trovato', 'risposta_non_valida', 'errore_paperclip',
    ]);
    for (const errore of PAPERCLIP_PROTOCOLLO_ERRORI) {
      expect(PaperclipProtocolloErroreSchema.parse(errore)).toBe(errore);
    }
    expect(PaperclipProtocolloErroreSchema.safeParse('altro').success).toBe(false);
  });

  it('ingressi_richiedono_guid_campi_obbligatori_e_oggetti_stretti', () => {
    for (const [schema, input] of ingressi) {
      expect(schema.parse(input)).toEqual(input);
      expect(schema.safeParse({ ...input, issueId: 'invalid' }).success).toBe(false);
      expect(schema.safeParse({ ...input, extra: true }).success).toBe(false);
      for (const campo of Object.keys(input)) {
        expect(schema.safeParse({ ...input, [campo]: undefined }).success).toBe(false);
      }
    }
  });

  it('testi_rifilati_e_limiti_rispettati', () => {
    const casi = [
      [PcpCommentaIngressoSchema, { issueId }, 'testo', 1, 10000],
      [PcpAffidaIngressoSchema, affida, 'titolo', 1, 240],
      [PcpAffidaIngressoSchema, affida, 'istruzioni', 40, 20000],
      [PcpConcludiIngressoSchema, { issueId }, 'risultato', 1, 20000],
      [PcpPianoIngressoSchema, { issueId }, 'piano', 300, 524288],
    ] as const;
    for (const [schema, base, campo, min, max] of casi) {
      for (const lunghezza of [min, max]) {
        const testo = 'x'.repeat(lunghezza);
        expect(schema.parse({ ...base, [campo]: ` ${testo}\n` }))
          .toEqual({ ...base, [campo]: testo });
      }
      for (const testo of [' '.repeat(min), 'x'.repeat(min - 1), 'x'.repeat(max + 1)]) {
        expect(schema.safeParse({ ...base, [campo]: testo }).success).toBe(false);
      }
    }
  });

  it('lettura_preserva_thread_e_campi_wire', () => {
    const commento = { id: figlioId, body: 'Thread result', authorAgentId: null, metadata: 'wire' };
    const output = {
      incarico: { id: issueId, title: 'Task', status: 'in_progress', identifier: 'PCP-1' },
      commenti: [commento],
      commentoSveglia: commento,
      risultatiBlocchi: [{ id: figlioId, status: 'done', risultato: commento.body }],
    };
    expect(PcpLeggiUscitaSchema.parse(output)).toEqual(output);
    expect(PcpLeggiUscitaSchema.parse({
      ...output, commenti: [], commentoSveglia: null,
      risultatiBlocchi: [{ id: figlioId, status: 'blocked', risultato: null }],
    }).commentoSveglia).toBeNull();
    expect(PcpLeggiUscitaSchema.parse({ ...output, risultatiBlocchi: [] }).risultatiBlocchi).toEqual([]);
  });

  it('lettura_rifiuta_forme_non_valide', () => {
    const blocco = { id: figlioId, status: 'done', risultato: null };
    const output = {
      incarico: { id: issueId, title: 'Task', status: 'todo' },
      commenti: [], commentoSveglia: null, risultatiBlocchi: [blocco],
    };
    for (const patch of [
      { extra: true }, { incarico: { ...output.incarico, status: 'invalid' } },
      { commenti: [{ id: 'invalid', body: 'Comment' }] },
      { commentoSveglia: { id: figlioId } }, { risultatiBlocchi: null },
    ]) {
      expect(PcpLeggiUscitaSchema.safeParse({ ...output, ...patch }).success).toBe(false);
    }
    for (const campo of Object.keys(output)) {
      expect(PcpLeggiUscitaSchema.safeParse({ ...output, [campo]: undefined }).success).toBe(false);
    }
    for (const patch of [
      { id: 'invalid' }, { status: 'invalid' }, { risultato: 42 },
      { risultato: undefined }, { id: undefined }, { status: undefined }, { extra: true },
    ]) {
      expect(PcpLeggiUscitaSchema.safeParse({
        ...output, risultatiBlocchi: [{ ...blocco, ...patch }],
      }).success).toBe(false);
    }
    for (const status of PAPERCLIP_STATI_INCARICO) {
      expect(PcpLeggiUscitaSchema.safeParse({
        ...output, risultatiBlocchi: [{ ...blocco, status }],
      }).success).toBe(true);
    }
  });

  it('esito_valida_stati_e_figlio_facoltativo', () => {
    for (const stato of PAPERCLIP_STATI_INCARICO) {
      expect(PcpEsitoSchema.parse({ issueId, stato })).toEqual({ issueId, stato });
      expect(PcpEsitoSchema.parse({ issueId, stato, figlioId })).toEqual({ issueId, stato, figlioId });
    }
    for (const patch of [
      { issueId: 'invalid' }, { issueId: undefined }, { stato: 'invalid' },
      { stato: undefined }, { figlioId: 'invalid' }, { figlioId: null }, { extra: true },
    ]) {
      expect(PcpEsitoSchema.safeParse({ issueId, stato: 'done', ...patch }).success).toBe(false);
    }
  });
});
