import { describe, expect, it } from 'vitest';
import {
  decisionOutcomeFromEmailReply,
  decisionRequestSubjectLabel,
  type DecisionEmailReply,
  type DecisionRequest,
} from '../../src/organization/decision-request.js';

const multi: DecisionRequest = {
  requestId: 'abc123',
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  question: 'Approvi il piano?',
  options: [
    { optionId: 'approve-plan', label: 'Approva' },
    { optionId: 'ask-changes', label: 'Chiedi modifiche' },
  ],
  requestedBy: { managementAgentId: 'director', runtimeAgentId: 'agent-director', vaultAgentId: 7 },
  addressedTo: { ownerId: 'owner-1' },
  channel: 'email',
  createdAt: '2026-10-20T10:00:00+02:00',
};
const single: DecisionRequest = { ...multi, options: [multi.options[0]!] };

const receivedAt = '2026-10-20T11:00:00.000Z';
const run = (request: DecisionRequest, reply: DecisionEmailReply, ownerId = 'owner-1', at = receivedAt) =>
  decisionOutcomeFromEmailReply({ request, reply, from: { ownerId }, receivedAt: at, messageId: 'msg-1' });

describe('decisionOutcomeFromEmailReply', () => {
  it('approve with a single option records that option', () => {
    expect(run(single, { kind: 'approve', requestId: 'abc123' })).toEqual({
      ok: true,
      outcome: {
        requestId: 'abc123',
        outcome: 'approved',
        optionId: 'approve-plan',
        decidedBy: { kind: 'owner', ownerId: 'owner-1' },
        decidedAt: receivedAt,
        channel: 'email',
        sourceRef: 'msg-1',
      },
    });
  });

  it('approve with an explicit option on a multi-option request records it', () => {
    const r = run(multi, { kind: 'approve', requestId: 'abc123', optionId: 'ask-changes' });
    expect(r.ok && r.outcome.outcome === 'approved' && r.outcome.optionId).toBe('ask-changes');
  });

  it('approve without option on a multi-option request is option_required', () => {
    expect(run(multi, { kind: 'approve', requestId: 'abc123' })).toEqual({ ok: false, code: 'option_required' });
  });

  it('refuse carries the reason into the outcome', () => {
    const r = run(multi, { kind: 'refuse', requestId: 'abc123', reason: 'Costi troppo alti' });
    expect(r).toMatchObject({ ok: true, outcome: { outcome: 'rejected', reason: 'Costi troppo alti', sourceRef: 'msg-1' } });
  });

  it('unclear never becomes an approval', () => {
    for (const why of ['missing_reason', 'no_decision', 'both'] as const) {
      expect(run(single, { kind: 'unclear', requestId: 'abc123', why })).toEqual({ ok: false, code: 'unclear' });
    }
  });

  it('a reply from someone else is not_addressee', () => {
    expect(run(single, { kind: 'approve', requestId: 'abc123' }, 'owner-2')).toEqual({
      ok: false,
      code: 'not_addressee',
    });
  });

  it('a reply for another requestId is a mismatch', () => {
    expect(run(single, { kind: 'approve', requestId: 'zzz999' })).toEqual({ ok: false, code: 'mismatch' });
  });

  it('a reply received before the request is before_request', () => {
    expect(run(single, { kind: 'approve', requestId: 'abc123' }, 'owner-1', '2026-10-20T07:00:00.000Z')).toEqual({
      ok: false,
      code: 'before_request',
    });
  });

  it('an option outside the request is unknown_option', () => {
    expect(run(multi, { kind: 'approve', requestId: 'abc123', optionId: 'other' })).toEqual({
      ok: false,
      code: 'unknown_option',
    });
  });
});

describe('decisionRequestSubjectLabel', () => {
  it('builds the subject label', () => {
    expect(decisionRequestSubjectLabel('abc123')).toBe('[decisione abc123]');
  });
});
