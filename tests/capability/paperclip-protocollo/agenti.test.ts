import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_PROTOCOLLO_RUOLI,
  PaperclipProtocolloAgenteSchema,
  PaperclipProtocolloAgentiSchema,
  PaperclipProtocolloRuoloSchema,
  type PaperclipProtocolloAgenti,
} from '../../../src/capability/paperclip-protocollo/agenti.js';

function mappaP6(): PaperclipProtocolloAgenti {
  return {
    versione: 1,
    agenti: [
      {
        paperclipAgentId: '11111111-1111-4111-8111-111111111111',
        ruolo: 'capo',
        x9AgentId: 'capo-p6',
        tenantId: 'tenant-p6',
        ownerId: 'owner-p6',
        puoAffidareA: ['lab'],
      },
      {
        paperclipAgentId: '22222222-2222-4222-8222-222222222222',
        ruolo: 'lab',
        x9AgentId: 'lab-p6',
        tenantId: 'tenant-p6',
        ownerId: 'owner-p6',
        puoAffidareA: ['ricerca'],
      },
      {
        paperclipAgentId: '33333333-3333-4333-8333-333333333333',
        ruolo: 'ricerca',
        x9AgentId: 'ricerca-p6',
        tenantId: 'tenant-p6',
        ownerId: 'owner-p6',
        puoAffidareA: [],
      },
    ],
  };
}

describe('paperclip-protocollo agenti', () => {
  it('mappa_p6_valida', () => {
    const mappa = mappaP6();
    expect(PaperclipProtocolloAgentiSchema.parse(mappa)).toEqual(mappa);
    expect(PaperclipProtocolloAgentiSchema.parse({ ...mappa, agenti: [...mappa.agenti].reverse() }))
      .toEqual({ ...mappa, agenti: [...mappa.agenti].reverse() });
  });

  it('paperclip_agent_ripetuto_rifiutato', () => {
    const mappa = mappaP6();
    mappa.agenti[1].paperclipAgentId = mappa.agenti[0].paperclipAgentId;
    const result = PaperclipProtocolloAgentiSchema.safeParse(mappa);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path)).toEqual([['agenti', 1, 'paperclipAgentId']]);
  });

  it('x9_agent_ripetuto_rifiutato', () => {
    const mappa = mappaP6();
    mappa.agenti[1].x9AgentId = mappa.agenti[0].x9AgentId;
    const result = PaperclipProtocolloAgentiSchema.safeParse(mappa);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path)).toEqual([['agenti', 1, 'x9AgentId']]);
  });

  it('destinatario_assente_rifiutato', () => {
    const mappa = mappaP6();
    mappa.agenti = [mappa.agenti[0]];
    const result = PaperclipProtocolloAgentiSchema.safeParse(mappa);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path)).toEqual([['agenti', 0, 'puoAffidareA', 0]]);
    expect(result.error?.issues[0].message).toContain('found 0');
  });

  it('destinatario_doppio_rifiutato', () => {
    const mappa = mappaP6();
    mappa.agenti.push({
      ...mappa.agenti[1],
      paperclipAgentId: '44444444-4444-4444-8444-444444444444',
      x9AgentId: 'lab-secondo',
    });
    const result = PaperclipProtocolloAgentiSchema.safeParse(mappa);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path)).toEqual([['agenti', 0, 'puoAffidareA', 0]]);
    expect(result.error?.issues[0].message).toContain('found 2');
  });

  it('delega_configurabile_e_ruoli_non_destinatari_ripetibili', () => {
    const mappa = mappaP6();
    mappa.agenti[0].puoAffidareA = ['ricerca'];
    mappa.agenti[2].puoAffidareA = ['capo'];
    mappa.agenti.push({
      ...mappa.agenti[1],
      paperclipAgentId: '44444444-4444-4444-8444-444444444444',
      x9AgentId: 'lab-secondo',
    });
    expect(PaperclipProtocolloAgentiSchema.parse(mappa)).toEqual(mappa);
  });

  it('destinatario_assente_segnalato_alla_posizione_della_delega', () => {
    const mappa = mappaP6();
    mappa.agenti = [mappa.agenti[0], mappa.agenti[1]];
    mappa.agenti[0].puoAffidareA = ['lab', 'ricerca'];
    mappa.agenti[1].puoAffidareA = [];
    const result = PaperclipProtocolloAgentiSchema.safeParse(mappa);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path)).toEqual([['agenti', 0, 'puoAffidareA', 1]]);
  });

  it('delega_vuota_predefinita', () => {
    const { puoAffidareA: _delega, ...agente } = mappaP6().agenti[0];
    expect(PaperclipProtocolloAgenteSchema.parse(agente)).toEqual({ ...agente, puoAffidareA: [] });
    expect(PaperclipProtocolloAgentiSchema.parse({ versione: 1, agenti: [agente] }).agenti)
      .toEqual([{ ...agente, puoAffidareA: [] }]);
  });

  it('ruoli_del_protocollo', () => {
    expect(PAPERCLIP_PROTOCOLLO_RUOLI).toEqual(['capo', 'lab', 'ricerca']);
    for (const ruolo of PAPERCLIP_PROTOCOLLO_RUOLI) {
      expect(PaperclipProtocolloRuoloSchema.parse(ruolo)).toBe(ruolo);
    }
    expect(PaperclipProtocolloRuoloSchema.safeParse('altro').success).toBe(false);
  });

  it('identita_e_delega_non_valide_rifiutate', () => {
    const agente = mappaP6().agenti[0];
    for (const patch of [
      { paperclipAgentId: 'invalid' },
      { x9AgentId: '' },
      { x9AgentId: 'Capo' },
      { x9AgentId: 'capo_p6' },
      { x9AgentId: 'capo/p6' },
      { tenantId: '' },
      { ownerId: '' },
      { tenantId: undefined },
      { ownerId: undefined },
      { ruolo: 'altro' },
      { puoAffidareA: ['altro'] },
      { puoAffidareA: null },
      { extra: true },
    ]) {
      expect(PaperclipProtocolloAgenteSchema.safeParse({ ...agente, ...patch }).success).toBe(false);
    }
  });

  it('mappa_vuota_versione_errata_e_campi_extra_rifiutati', () => {
    const mappa = mappaP6();
    expect(PaperclipProtocolloAgentiSchema.safeParse({ ...mappa, agenti: [] }).success).toBe(false);
    expect(PaperclipProtocolloAgentiSchema.safeParse({ ...mappa, versione: 2 }).success).toBe(false);
    expect(PaperclipProtocolloAgentiSchema.safeParse({ agenti: mappa.agenti }).success).toBe(false);
    expect(PaperclipProtocolloAgentiSchema.safeParse({ ...mappa, extra: true }).success).toBe(false);
  });
});
