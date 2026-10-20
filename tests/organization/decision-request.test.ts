import { describe, expect, it } from 'vitest';
import { DecisionOutcomeSchema, DecisionRequestSchema } from '../../src/organization/decision-request.js';

const request = {
  requestId: 'req-0001',
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  question: 'Approvi il piano?',
  options: [
    { optionId: 'approve-plan', label: 'Approva' },
    { optionId: 'ask-changes', label: 'Chiedi modifiche', detail: 'Indica cosa cambiare' },
  ],
  requestedBy: { managementAgentId: 'director', runtimeAgentId: 'agent-director', vaultAgentId: 7 },
  addressedTo: { ownerId: 'owner-1' },
  channel: 'email',
  createdAt: '2026-10-20T10:00:00+02:00',
};

const approved = {
  requestId: 'req-0001',
  outcome: 'approved',
  optionId: 'approve-plan',
  decidedBy: { kind: 'owner', ownerId: 'owner-1' },
  decidedAt: '2026-10-20T11:00:00.000Z',
  channel: 'email',
  sourceRef: 'email:msg-1',
};

const rejected = {
  requestId: 'req-0001',
  outcome: 'rejected',
  reason: 'Costi troppo alti',
  decidedBy: { kind: 'owner', ownerId: 'owner-1' },
  decidedAt: '2026-10-20T11:00:00.000Z',
  channel: 'email',
  sourceRef: 'email:msg-2',
};

describe('DecisionRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(DecisionRequestSchema.parse(request)).toEqual(request);
  });

  it('rejects duplicate option ids', () => {
    const options = [request.options[0], { ...request.options[1], optionId: 'approve-plan' }];
    expect(DecisionRequestSchema.safeParse({ ...request, options }).success).toBe(false);
  });

  it('rejects a request without requestedBy.vaultAgentId', () => {
    const { vaultAgentId: _omit, ...partial } = request.requestedBy;
    expect(DecisionRequestSchema.safeParse({ ...request, requestedBy: partial }).success).toBe(false);
  });

  it('rejects a channel outside the list', () => {
    expect(DecisionRequestSchema.safeParse({ ...request, channel: 'sms' }).success).toBe(false);
  });

  it('rejects an unknown key', () => {
    expect(DecisionRequestSchema.safeParse({ ...request, extra: 1 }).success).toBe(false);
  });
});

describe('DecisionOutcomeSchema', () => {
  it('accepts approved and rejected outcomes', () => {
    expect(DecisionOutcomeSchema.parse(approved)).toEqual(approved);
    expect(DecisionOutcomeSchema.parse(rejected)).toEqual(rejected);
  });

  it('a rejection requires a reason', () => {
    const { reason: _omit, ...noReason } = rejected;
    expect(DecisionOutcomeSchema.safeParse(noReason).success).toBe(false);
  });

  it('rejects a rejection carrying an optionId', () => {
    expect(DecisionOutcomeSchema.safeParse({ ...rejected, optionId: 'approve-plan' }).success).toBe(false);
  });

  it('rejects decidedBy.kind agent', () => {
    expect(
      DecisionOutcomeSchema.safeParse({ ...approved, decidedBy: { kind: 'agent', ownerId: 'owner-1' } }).success,
    ).toBe(false);
  });

  it('rejects an unknown key', () => {
    expect(DecisionOutcomeSchema.safeParse({ ...approved, approved: true }).success).toBe(false);
  });
});
