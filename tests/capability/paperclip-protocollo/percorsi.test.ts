import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_RUN_ID_HEADER,
  PaperclipCommentiQuerySchema,
  PaperclipElencoIncarichiFiltriSchema,
  paperclipPercorsi,
  paperclipPercorsoSenzaPrefisso,
} from '../../../src/capability/paperclip-protocollo/percorsi.js';

const issueId = '11111111-1111-4111-8111-111111111111';
const commentId = '22222222-2222-4222-8222-222222222222';
const issuePaths = [
  paperclipPercorsi.contesto,
  paperclipPercorsi.commenti,
  paperclipPercorsi.checkout,
  paperclipPercorsi.figli,
  paperclipPercorsi.incarico,
  paperclipPercorsi.piano,
  paperclipPercorsi.interazioni,
];

describe('paperclipPercorsi', () => {
  it('percorsi_esatti', () => {
    expect(paperclipPercorsi.agenteMe()).toBe('/api/agents/me');
    expect(paperclipPercorsi.contesto(issueId)).toBe(`/api/issues/${issueId}/heartbeat-context`);
    expect(paperclipPercorsi.commenti(issueId)).toBe(`/api/issues/${issueId}/comments`);
    expect(paperclipPercorsi.checkout(issueId)).toBe(`/api/issues/${issueId}/checkout`);
    expect(paperclipPercorsi.figli(issueId)).toBe(`/api/issues/${issueId}/children`);
    expect(paperclipPercorsi.incarico(issueId)).toBe(`/api/issues/${issueId}`);
    expect(paperclipPercorsi.piano(issueId)).toBe(`/api/issues/${issueId}/documents/plan`);
    expect(paperclipPercorsi.interazioni(issueId)).toBe(`/api/issues/${issueId}/interactions`);
  });

  it('id_con_barra_rifiutato', () => {
    for (const path of issuePaths) {
      expect(() => path(`${issueId}/comments`)).toThrow();
    }
  });

  it('id_non_guid_rifiutato', () => {
    for (const path of issuePaths) {
      for (const id of ['', '..', `${issueId}..`, 'not-a-guid']) {
        expect(() => path(id)).toThrow();
      }
    }
  });

  it('contesto_con_commento_di_sveglia', () => {
    expect(paperclipPercorsi.contesto(issueId, commentId)).toBe(
      `/api/issues/${issueId}/heartbeat-context?wakeCommentId=${commentId}`,
    );
  });

  it('commento_di_sveglia_non_guid_rifiutato', () => {
    for (const id of ['', '..', `${commentId}/extra`, `${commentId}&extra=true`, 'not-a-guid']) {
      expect(() => paperclipPercorsi.contesto(issueId, id)).toThrow();
    }
  });

  it('intestazione_corsa_esatta', () => {
    expect(PAPERCLIP_RUN_ID_HEADER).toBe('X-Paperclip-Run-Id');
  });

  it('s7400_percorsi_nuovi_esatti', () => {
    expect(paperclipPercorsi.incarichiAzienda(issueId)).toBe(`/api/companies/${issueId}/issues`);
    expect(paperclipPercorsi.agente(issueId)).toBe(`/api/agents/${issueId}`);
    expect(paperclipPercorsi.rilascio(issueId)).toBe(`/api/issues/${issueId}/release`);
    expect(paperclipPercorsi.titolo(issueId)).toBe(`/api/issues/${issueId}/title`);
    expect(paperclipPercorsi.monitorCheckNow(issueId)).toBe(`/api/issues/${issueId}/monitor/check-now`);
    expect(paperclipPercorsi.watchdog(issueId)).toBe(`/api/issues/${issueId}/watchdog`);
    expect(paperclipPercorsi.corsa(issueId)).toBe(`/api/heartbeat-runs/${issueId}`);
    expect(paperclipPercorsi.annullaCorsa(issueId)).toBe(`/api/heartbeat-runs/${issueId}/cancel`);
    expect(paperclipPercorsi.commento(issueId, commentId)).toBe(
      `/api/issues/${issueId}/comments/${commentId}`,
    );
  });

  it('s7400_id_non_valido_rifiutato_nei_nuovi', () => {
    const costruttori = [
      paperclipPercorsi.incarichiAzienda,
      (id: string) => paperclipPercorsi.elencoIncarichi(id),
      paperclipPercorsi.agente,
      paperclipPercorsi.rilascio,
      paperclipPercorsi.titolo,
      paperclipPercorsi.monitorCheckNow,
      paperclipPercorsi.watchdog,
      paperclipPercorsi.corsa,
      paperclipPercorsi.annullaCorsa,
      (id: string) => paperclipPercorsi.commento(id, commentId),
    ];
    for (const costruisci of costruttori) {
      for (const id of ['', '..', `${issueId}/x`, 'not-a-guid']) {
        expect(() => costruisci(id)).toThrow();
      }
    }
    for (const id of ['', '..', `${commentId}/x`, 'not-a-guid']) {
      expect(() => paperclipPercorsi.commento(issueId, id)).toThrow();
    }
  });

  it('s7400_elenco_filtri', () => {
    const ok = (f: unknown) => PaperclipElencoIncarichiFiltriSchema.safeParse(f).success;
    expect(ok({ assigneeAgentId: issueId, status: ['todo', 'in_progress'], limit: 100 })).toBe(true);
    expect(ok({ assigneeAgentId: 'null' })).toBe(true);
    expect(ok({ limit: 1000 })).toBe(true);
    expect(ok({ assigneeAgentId: 'director' })).toBe(false);
    expect(ok({ status: [] })).toBe(false);
    expect(ok({ status: ['todo', 'todo'] })).toBe(false);
    expect(ok({ status: ['fatto'] })).toBe(false);
    expect(ok({ limit: 0 })).toBe(false);
    expect(ok({ limit: 1001 })).toBe(false);
    expect(ok({ assignee: issueId })).toBe(false);
    expect(ok({ parentId: 'x' })).toBe(false);
    expect(paperclipPercorsi.elencoIncarichi(issueId)).toBe(`/api/companies/${issueId}/issues`);
    expect(() => paperclipPercorsi.elencoIncarichi(issueId, { assigneeAgentId: 'director' })).toThrow();
  });

  it('s7400_elenco_casi_veri_di_oggi', () => {
    const parametri = (percorso: string) =>
      [...new URL(percorso, 'http://x').searchParams.entries()].map(([k, v]) => `${k}=${v}`).sort();
    expect(
      parametri(paperclipPercorsi.elencoIncarichi(issueId, {
        assigneeAgentId: commentId, status: ['in_progress'], limit: 100,
      })),
    ).toEqual([`assigneeAgentId=${commentId}`, 'limit=100', 'status=in_progress']);
    expect(
      parametri(paperclipPercorsi.elencoIncarichi(issueId, { parentId: commentId, limit: 50 })),
    ).toEqual(['limit=50', `parentId=${commentId}`]);
    expect(
      parametri(paperclipPercorsi.elencoIncarichi(issueId, {
        assigneeAgentId: commentId, status: ['backlog'], limit: 100,
      })),
    ).toEqual([`assigneeAgentId=${commentId}`, 'limit=100', 'status=backlog']);
    expect(
      paperclipPercorsi.elencoIncarichi(issueId, { status: ['todo', 'in_progress'] }),
    ).toBe(`/api/companies/${issueId}/issues?status=todo%2Cin_progress`);
  });

  it('s7400_commenti_query', () => {
    const ok = (q: unknown) => PaperclipCommentiQuerySchema.safeParse(q).success;
    expect(ok({ after: commentId, order: 'asc', limit: 500 })).toBe(true);
    expect(ok({ order: 'desc', limit: 100 })).toBe(true);
    expect(ok({ after: commentId })).toBe(false);
    expect(ok({ after: commentId, order: 'desc' })).toBe(false);
    expect(ok({ limit: 501 })).toBe(false);
    expect(ok({ order: 'ASC' })).toBe(false);
    expect(ok({ order: 'asc', extra: 1 })).toBe(false);
    expect(paperclipPercorsi.commenti(issueId)).toBe(`/api/issues/${issueId}/comments`);
    expect(paperclipPercorsi.commenti(issueId, { after: commentId, order: 'asc', limit: 500 })).toBe(
      `/api/issues/${issueId}/comments?after=${commentId}&order=asc&limit=500`,
    );
    expect(() => paperclipPercorsi.commenti(issueId, { after: commentId })).toThrow();
  });

  it('s7400_senza_prefisso', () => {
    expect(paperclipPercorsoSenzaPrefisso(paperclipPercorsi.checkout(issueId))).toBe(
      `/issues/${issueId}/checkout`,
    );
    expect(() => paperclipPercorsoSenzaPrefisso('/issues/x')).toThrow();
    expect(() => paperclipPercorsoSenzaPrefisso('/apix/issues/x')).toThrow();
  });
});
