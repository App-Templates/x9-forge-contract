import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_DESTINATARIO_RIFIUTI,
  paperclipDestinatarioPerRuolo,
} from '../src/capability/paperclip/index.js';

const G1 = '11111111-1111-4111-8111-111111111111';
const G2 = '22222222-2222-4222-8222-222222222222';
const G3 = '33333333-3333-4333-8333-333333333333';
const G4 = '44444444-4444-4444-8444-444444444444';

describe('s7410 ruolo-in-id', () => {
  it('s7410_risoluzione', () => {
    const m = { 'rd-lab': G1, bad: 'non-un-guid' };
    expect(paperclipDestinatarioPerRuolo(m, 'rd-lab')).toEqual({ ok: true, agentId: G1 });
    expect(paperclipDestinatarioPerRuolo(m, 'director')).toEqual({ ok: false, refusal: 'role_not_configured' });
    expect(paperclipDestinatarioPerRuolo(m, 'bad')).toEqual({ ok: false, refusal: 'agent_not_valid' });
  });

  it('s7410_chiavi_ereditate', () => {
    const m = { 'rd-lab': G1 };
    for (const k of ['toString', '__proto__', 'constructor', 'Rd-Lab', '']) {
      expect(paperclipDestinatarioPerRuolo(m, k)).toEqual({ ok: false, refusal: 'role_not_configured' });
    }
  });

  it('s7410_mappa_vuota', () => {
    for (const k of ['director', 'rd-lab', '', 'toString']) {
      expect(paperclipDestinatarioPerRuolo({}, k)).toEqual({ ok: false, refusal: 'role_not_configured' });
    }
  });

  it('s7410_valori_non_guid', () => {
    for (const v of ['', 'rd-lab', G1.replaceAll('-', ''), `${G1} `]) {
      expect(paperclipDestinatarioPerRuolo({ x: v }, 'x')).toEqual({ ok: false, refusal: 'agent_not_valid' });
    }
  });

  it('s7410_rifiuti_elenco', () => {
    expect([...PAPERCLIP_DESTINATARIO_RIFIUTI]).toEqual(['role_not_configured', 'agent_not_valid']);
    const m = { a: 'x' };
    for (const k of ['a', 'b']) {
      const r = paperclipDestinatarioPerRuolo(m, k);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(PAPERCLIP_DESTINATARIO_RIFIUTI).toContain(r.refusal);
    }
  });

  it('s7410_mappa_di_un_posto_vero', () => {
    const m = { 'rd-lab': G1, 'rd-ricerca': G2, 'reparto-x': G3, director: G4, 'rd-lab@azienda': G1 };
    for (const [k, id] of Object.entries(m)) {
      expect(paperclipDestinatarioPerRuolo(m, k)).toEqual({ ok: true, agentId: id });
    }
  });
});
