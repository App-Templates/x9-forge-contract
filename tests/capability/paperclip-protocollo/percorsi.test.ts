import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_RUN_ID_HEADER,
  paperclipPercorsi,
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
});
