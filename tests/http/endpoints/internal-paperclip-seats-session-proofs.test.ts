import { describe, expect, it } from 'vitest';
import * as seats from '../../../src/http/endpoints/internal-paperclip-seats.js';

const identity = { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 };
const sourceRunId = 'chief-run-dispensa-pronta-r61';
// Reconstruct the R61 shape described in the task; the original live envelope is not supplied in this repository.
const request = {
  organizationId: 'dispensa-pronta', identity, sourceRunId, sessionId: 'R61',
  call: {
    callId: 'r61-email-request-decision', tool: 'email_request_decision',
    input: { sessionId: 'R61' }, agentId: identity.runtimeAgentId,
    sessionId: 'chief-turn-r61', userId: '7', tenantId: 'tenant-1', ownerId: '7', vaultAgentId: 62,
    organization: {
      tenantId: 'tenant-1',
      organizationRun: {
        schemaVersion: 1, runId: sourceRunId, organizationId: 'dispensa-pronta', ownerId: '7',
        identity, issuer: 'paperclip', issuedAt: '2026-11-21T09:00:00Z', expiresAt: '2026-11-21T10:00:00Z',
      },
      attempt: {
        runId: sourceRunId, attemptId: 'attempt-r61', attemptNumber: 1,
        startedAt: '2026-11-21T09:00:00Z', idempotencyKey: 'r61-email-request-decision',
      },
    },
  },
};
const issueId = '11111111-1111-4111-8111-111111111111';
const counts = { new: 0, alreadyThere: 0, failed: 0, tooLarge: 0 };

describe('session proofs route', () => {
  it('s8236 rotta-delle-prove', () => {
    const contract = seats.internalPaperclipSeatSessionProofsContract;
    expect(contract).toBeDefined();
    expect(contract.method).toBe('POST');
    expect(contract.path).toBe('/internal/paperclip/seats/session-proofs');
    expect(contract.path).toBe(seats.INTERNAL_PAPERCLIP_SEAT_SESSION_PROOFS_PATH);
    expect(contract.authType).toBe('secret');
    expect(contract.bodySchema).toBe(seats.InternalPaperclipSeatSessionProofsRequestSchema);
    expect(contract.responseSchema).toBe(seats.InternalPaperclipSeatSessionProofsResponseSchema);
    expect(contract.errorResponseSchema).toBe(seats.InternalPaperclipSeatWakeErrorResponseSchema);
    expect(contract.bodySchema.parse(request)).toEqual(request);
    expect(seats.PAPERCLIP_SEAT_SESSION_PROOFS_RESULTS).toEqual([
      'carried', 'incomplete', 'status_only', 'not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS,
    ]);
    for (const response of [
      { result: 'carried', issueId, counts },
      { result: 'carried', issueId, counts: { ...counts, new: 2, alreadyThere: 3 } },
      { result: 'incomplete', issueId, counts: { ...counts, failed: 1, tooLarge: 1 } },
      { result: 'status_only', issueId, counts },
      ...['not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS].map(result => ({ result })),
    ]) {
      expect(contract.responseSchema.parse(response)).toEqual(response);
    }
    for (const field of ['organizationId', 'identity', 'sourceRunId', 'sessionId', 'call'] as const) {
      const { [field]: _missing, ...partial } = request;
      expect(contract.bodySchema.safeParse(partial).success).toBe(false);
    }
    expect(contract.bodySchema.safeParse({ ...request, sourceRunId: '' }).success).toBe(false);
    expect(contract.bodySchema.safeParse({ ...request, identity: { runtimeAgentId: 'capo-sviluppo' } }).success).toBe(false);
  });

  it('s8236 carried-con-prove-mancanti', () => {
    for (const missing of [{ failed: 1 }, { tooLarge: 1 }]) {
      expect(seats.InternalPaperclipSeatSessionProofsResponseSchema.safeParse({
        result: 'carried', issueId, counts: { ...counts, ...missing },
      }).success).toBe(false);
    }
  });

  it('s8236 sessione-malformata', () => {
    const schema = seats.InternalPaperclipSeatSessionProofsRequestSchema;
    for (const sessionId of ['61', 'R0', 'R61/../x', 'R01', 'R1000000000']) {
      expect(schema.safeParse({ ...request, sessionId }).success).toBe(false);
    }
    for (const sessionId of ['R1', 'R999999999']) {
      expect(schema.safeParse({ ...request, sessionId }).success).toBe(true);
    }
  });

  it('s8236 credenziali-non-viaggiano', () => {
    for (const credentials of [{}, { provider: 'synthetic-test-value' }]) {
      expect(seats.InternalPaperclipSeatSessionProofsRequestSchema.safeParse({
        ...request, call: { ...request.call, credentials },
      }).success).toBe(false);
    }
  });

  it('s8236 esito-incoerente', () => {
    const schema = seats.InternalPaperclipSeatSessionProofsResponseSchema;
    for (const result of ['not_enabled', ...seats.PAPERCLIP_SOURCE_RUN_REFUSALS]) {
      expect(schema.safeParse({ result, counts }).success).toBe(false);
      expect(schema.safeParse({ result, issueId }).success).toBe(false);
    }
    for (const result of ['carried', 'incomplete', 'status_only']) {
      expect(schema.safeParse({ result, counts }).success).toBe(false);
      expect(schema.safeParse({ result, issueId }).success).toBe(false);
      expect(schema.safeParse({ result, issueId: 'not-a-uuid', counts }).success).toBe(false);
      for (const field of ['new', 'alreadyThere', 'failed', 'tooLarge'] as const) {
        for (const invalid of [-1, 0.5]) {
          expect(schema.safeParse({ result, issueId, counts: { ...counts, [field]: invalid } }).success).toBe(false);
        }
        const { [field]: _missing, ...partial } = counts;
        expect(schema.safeParse({ result, issueId, counts: partial }).success).toBe(false);
      }
    }
  });

  it('s8236 campo-in-piu', () => {
    expect(seats.InternalPaperclipSeatSessionProofsRequestSchema.safeParse({ ...request, issueId }).success).toBe(false);
    const schema = seats.InternalPaperclipSeatSessionProofsResponseSchema;
    expect(schema.safeParse({ result: 'carried', issueId, counts, extra: true }).success).toBe(false);
    expect(schema.safeParse({ result: 'carried', issueId, counts: { ...counts, extra: 0 } }).success).toBe(false);
  });
});
