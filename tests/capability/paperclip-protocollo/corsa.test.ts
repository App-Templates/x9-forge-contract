import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_ANNULLO_CORSA_ATTORI,
  PAPERCLIP_ANNULLO_STATO_RICHIESTO,
  PAPERCLIP_CORSA_STATI,
  PAPERCLIP_CORSA_STATI_FINALI,
  PaperclipCorsaAnnullataSchema,
  PaperclipCorsaSchema,
  PaperclipCorsaStatoSchema,
  paperclipAnnulloCorsaAmmesso,
  paperclipAnnulloCorsaConfermato,
  paperclipCorsaPuoScrivere,
  type PaperclipCorsa,
  type PaperclipCorsaStato,
} from '../../../src/capability/paperclip-protocollo/index.js';

const RUN_ID = '11111111-1111-4111-8111-111111111111';
const AGENT_ID = '22222222-2222-4222-8222-222222222222';
const COMPANY_ID = '33333333-3333-4333-8333-333333333333';

describe('corsa di Paperclip', () => {
  it('s7404_stati', () => {
    const states = [
      'queued', 'scheduled_retry', 'running', 'succeeded',
      'interrupted', 'failed', 'cancelled', 'timed_out',
    ] as const satisfies readonly PaperclipCorsaStato[];
    expect(PAPERCLIP_CORSA_STATI).toEqual(states);
    expect(PaperclipCorsaStatoSchema.options).toEqual(states);
    for (const status of states) {
      expect(PaperclipCorsaStatoSchema.safeParse(status).success).toBe(true);
    }
    for (const status of ['done', 'finished']) {
      expect(PaperclipCorsaStatoSchema.safeParse(status).success).toBe(false);
    }
    expect(PAPERCLIP_CORSA_STATI_FINALI).toEqual(['succeeded', 'failed', 'cancelled', 'timed_out']);
    for (const status of PAPERCLIP_CORSA_STATI_FINALI) {
      expect(PAPERCLIP_CORSA_STATI).toContain(status);
    }
  });

  it('s7404_corsa_letta', () => {
    const run: PaperclipCorsa = {
      id: RUN_ID,
      agentId: AGENT_ID,
      companyId: COMPANY_ID,
      status: 'running',
      contextSnapshot: { issueId: RUN_ID },
      execution: { status: 'running' },
      resultJson: {
        output: 'Working',
        executionCancellation: { state: 'requested', requestedAt: '2026-11-18T10:00:00Z' },
      },
    };
    expect(PaperclipCorsaSchema.parse(run)).toEqual(run);
    expect(PaperclipCorsaSchema.safeParse({ ...run, resultJson: null }).success).toBe(true);
    expect(PaperclipCorsaSchema.safeParse({ ...run, resultJson: {} }).success).toBe(true);
    const { agentId, ...withoutAgent } = run;
    expect(agentId).toBe(AGENT_ID);
    for (const invalid of [
      withoutAgent,
      { ...run, id: 'invalid' },
      { ...run, agentId: 'invalid' },
      { ...run, companyId: 'invalid' },
      { ...run, status: 'stopped' },
      { ...run, resultJson: { executionCancellation: {} } },
      { ...run, resultJson: { executionCancellation: { state: 1 } } },
    ]) {
      expect(PaperclipCorsaSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('s7404_puo_scrivere', () => {
    expect(PAPERCLIP_ANNULLO_STATO_RICHIESTO).toBe('requested');
    expect(paperclipCorsaPuoScrivere({ status: 'running' })).toBe(true);
    expect(paperclipCorsaPuoScrivere({ status: 'running', resultJson: null })).toBe(true);
    expect(paperclipCorsaPuoScrivere({ status: 'running', resultJson: {} })).toBe(true);
    expect(paperclipCorsaPuoScrivere({
      status: 'running', resultJson: { executionCancellation: { state: 'requested' } },
    })).toBe(false);
    expect(paperclipCorsaPuoScrivere({
      status: 'running', resultJson: { executionCancellation: { state: 'acknowledged' } },
    })).toBe(true);
    for (const status of PAPERCLIP_CORSA_STATI) {
      if (status === 'running') continue;
      expect(paperclipCorsaPuoScrivere({ status })).toBe(false);
      expect(paperclipCorsaPuoScrivere({
        status, resultJson: { executionCancellation: { state: 'acknowledged' } },
      })).toBe(false);
    }
  });

  it('s7404_annullo_solo_board', () => {
    expect(PAPERCLIP_ANNULLO_CORSA_ATTORI).toEqual(['board']);
    expect(paperclipAnnulloCorsaAmmesso('board')).toEqual({ ok: true });
    for (const actor of ['agent', 'user'] as const) {
      expect(paperclipAnnulloCorsaAmmesso(actor)).toEqual({ ok: false, motivo: 'solo_board' });
    }
  });

  it('s7404_conferma_annullo', () => {
    const response = { id: RUN_ID, status: 'cancelled', agentId: AGENT_ID };
    expect(PaperclipCorsaAnnullataSchema.parse(response)).toEqual(response);
    expect(paperclipAnnulloCorsaConfermato(RUN_ID, response)).toBe(true);
    for (const invalid of [
      { ...response, id: AGENT_ID },
      { ...response, status: 'succeeded' },
      { ...response, id: 'invalid' },
      { id: RUN_ID },
      { status: 'cancelled' },
      {},
      null,
    ]) {
      expect(paperclipAnnulloCorsaConfermato(RUN_ID, invalid)).toBe(false);
    }
    expect(paperclipAnnulloCorsaConfermato('invalid', { id: 'invalid', status: 'cancelled' })).toBe(false);
  });

  it('s7404_conferma_attuale', () => {
    const response = { id: RUN_ID, status: 'cancelled' };
    expect(PaperclipCorsaAnnullataSchema.parse(response)).toEqual(response);
    expect(paperclipAnnulloCorsaConfermato(RUN_ID, response)).toBe(true);
  });
});
