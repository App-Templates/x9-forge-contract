import { describe, expect, it } from 'vitest';
import { devSessionContractDocumentBody } from '../../../src/capability/dev/session-acceptance-paperclip.js';
import * as seats from '../../../src/http/endpoints/internal-paperclip-seats.js';

// Use the R61 production shape available in task 8160; no live Paperclip data is read.
const document = devSessionContractDocumentBody({
  issueNumber: 61,
  digest: '0123456789abcdef'.repeat(4),
  acceptance: {
    version: 1,
    template: { id: 'sviluppo-pezzo-app', version: 1 },
    input: {
      userPath: ['Apre il backtest', 'Sceglie il periodo', 'Lancia il calcolo', 'Legge il risultato'],
      data: 'di_prova',
      proofScripts: ['test:unit', 'test:build', 'test:lint', 'test:types', 'test:path', 'test:smoke'],
      visualSource: { kind: 'tavola_approvata', reference: 'asset-design-1' },
      look: { kind: 'prototipo', tryPath: ['Apri il backtest', 'Scegli il periodo', 'Leggi il risultato'] },
    },
    criteria: [
      { id: 'm-1', text: 'Il risultato rispetta il mandato.', attestor: 'referente', proof: 'Risposta del referente.', origin: 'mandato' },
      { id: 'c-1', text: 'Il percorso richiesto funziona.', attestor: 'sessione', proof: 'Attestazione del percorso.', origin: 'capo' },
      { id: 'r-1', text: 'Il difetto segnalato è risolto.', attestor: 'revisore', proof: 'Revisione del risultato.', origin: 'ritorno', reference: 'R57: risultato mancante' },
    ],
  },
});
const request = {
  organizationId: 'dispensa-pronta',
  identity: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
  sourceRunId: 'chief-run-r61',
  issueNumber: 61,
  // Padding exercises the requested 8 KiB body without depending on a live document revision.
  document: { ...document, body: document.body.padEnd(8192, ' ') },
};
const issueId = '11111111-1111-4111-8111-111111111111';

describe('session contract document route', () => {
  it('s8161 rotta-del-contratto', () => {
    const contract = seats.internalPaperclipSeatSessionContractContract;
    expect(contract).toBeDefined();
    expect(contract.method).toBe('POST');
    expect(contract.path).toBe('/internal/paperclip/seats/session-contract');
    expect(contract.path).toBe(seats.INTERNAL_PAPERCLIP_SEAT_SESSION_CONTRACT_PATH);
    expect(contract.authType).toBe('secret');
    expect(contract.bodySchema).toBe(seats.InternalPaperclipSeatSessionContractRequestSchema);
    expect(contract.responseSchema).toBe(seats.InternalPaperclipSeatSessionContractResponseSchema);
    expect(contract.errorResponseSchema).toBe(seats.InternalPaperclipSeatWakeErrorResponseSchema);
    expect(request.document.body.length).toBe(8192);
    expect(contract.bodySchema.parse(request)).toEqual(request);
    expect(seats.PAPERCLIP_SEAT_SESSION_CONTRACT_RESULTS).toEqual([
      'written', 'unchanged', 'not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS,
    ]);
    for (const result of seats.PAPERCLIP_SEAT_SESSION_CONTRACT_RESULTS) {
      const response = result === 'written' || result === 'unchanged'
        ? { result, issueId, revisionNumber: 1 } : { result };
      expect(contract.responseSchema.parse(response)).toEqual(response);
    }
    for (const issueNumber of [0, -1, 1.5]) {
      expect(contract.bodySchema.safeParse({ ...request, issueNumber }).success).toBe(false);
    }
    for (const field of ['organizationId', 'identity', 'sourceRunId', 'issueNumber', 'document'] as const) {
      const { [field]: _missing, ...partial } = request;
      expect(contract.bodySchema.safeParse(partial).success).toBe(false);
    }
    expect(contract.bodySchema.safeParse({ ...request, sourceRunId: '' }).success).toBe(false);
    expect(contract.bodySchema.safeParse({ ...request, identity: { runtimeAgentId: 'capo-sviluppo' } }).success).toBe(false);
  });

  it('s8161 chiave-diversa-dal-numero', () => {
    const result = seats.InternalPaperclipSeatSessionContractRequestSchema.safeParse({
      ...request, document: { ...request.document, key: 'contratto-r62' },
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues).toContainEqual(expect.objectContaining({
      path: ['document', 'key'], message: 'document_key_not_session_contract',
    }));
  });

  it('s8161 esito-incoerente', () => {
    const schema = seats.InternalPaperclipSeatSessionContractResponseSchema;
    for (const result of ['written', 'unchanged']) {
      expect(schema.safeParse({ result, issueId }).success).toBe(false);
      expect(schema.safeParse({ result, revisionNumber: 1 }).success).toBe(false);
      expect(schema.safeParse({ result, issueId, revisionNumber: 0 }).success).toBe(false);
      expect(schema.safeParse({ result, issueId, revisionNumber: 1.5 }).success).toBe(false);
      expect(schema.safeParse({ result, issueId: 'invalid', revisionNumber: 1 }).success).toBe(false);
    }
    for (const result of ['not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS]) {
      expect(schema.safeParse({ result, issueId }).success).toBe(false);
      expect(schema.safeParse({ result, revisionNumber: 1 }).success).toBe(false);
    }
    expect(schema.safeParse({ result: 'unknown' }).success).toBe(false);
  });

  it('s8161 campo-in-piu', () => {
    const schema = seats.InternalPaperclipSeatSessionContractRequestSchema;
    expect(schema.safeParse({ ...request, parentId: issueId }).success).toBe(false);
    expect(schema.safeParse({ ...request, document: { ...request.document, parentId: issueId } }).success).toBe(false);
    expect(seats.InternalPaperclipSeatSessionContractResponseSchema.safeParse({
      result: 'written', issueId, revisionNumber: 1, parentId: issueId,
    }).success).toBe(false);
  });

  it('s8161 corpo-troppo-grande', () => {
    const schema = seats.InternalPaperclipSeatSessionContractRequestSchema;
    expect(schema.safeParse({ ...request, document: { ...request.document, body: 'x'.repeat(524288) } }).success).toBe(true);
    expect(schema.safeParse({ ...request, document: { ...request.document, body: 'x'.repeat(524289) } }).success).toBe(false);
  });
});
