import { describe, expect, it } from 'vitest';
import {
  DecisionOutcomeSchema,
  decisionOutcomeFromEmailReply,
  type DecisionOutcome,
  type DecisionRequest,
  type DeliveryDecisionSubject,
} from '../../src/organization/index.js';

const subject: DeliveryDecisionSubject = {
  kind: 'delivery',
  organizationId: 'org-acme',
  projectId: 'project-website',
  buSlug: 'design',
  deliveryRef: { assetId: 'asset-design-01', sha256: 'a'.repeat(64) },
};
const referent = { kind: 'referent' as const, email: 'design.lead@example.com' };
const request = {
  requestId: 'delivery-180',
  tenantId: 'tenant-acme',
  organizationId: subject.organizationId,
  projectId: subject.projectId,
  subject,
  question: 'Approve this exact design delivery?',
  options: [
    { optionId: 'approve-delivery', label: 'Approve the delivery', effect: 'approve' },
    { optionId: 'ask-changes', label: 'Ask for changes', effect: 'request_changes' },
  ],
  requestedBy: { managementAgentId: 'design-lead', runtimeAgentId: 'agent-design', vaultAgentId: 17 },
  addressedTo: referent,
  channel: 'email',
  createdAt: '2026-11-20T08:00:00Z',
} satisfies DecisionRequest;
const base = {
  request,
  from: { email: 'design.lead@example.com' },
  receivedAt: '2026-11-20T09:00:00+00:00',
  messageId: 'message-delivery-180',
};
const saved = {
  requestId: request.requestId,
  subject,
  decidedBy: referent,
  decidedAt: '2026-11-20T09:00:00+00:00',
  channel: 'email',
  sourceRef: 'message-delivery-180',
  outcome: 'rejected',
  reason: 'Ask for changes',
} satisfies DecisionOutcome;
const planSubject = { kind: 'vertical_plan' as const, planId: 'plan-0001', planVersion: 1, digest: 'b'.repeat(64) };
const planOutcome = {
  requestId: 'plan-1',
  subject: planSubject,
  decidedBy: { kind: 'owner' as const, ownerId: 'owner-1' },
  decidedAt: '2026-11-20T09:00:00+00:00',
  channel: 'email' as const,
  sourceRef: 'message-plan-1',
  outcome: 'approved' as const,
  optionId: 'approve-plan',
};

describe('s8230 parole-del-referente', () => {
  it('s8230 parole-del-referente: the outcome keeps the referent words and the approval note', () => {
    const words = 'I do not like the colours, please redo the header.';
    const refused = decisionOutcomeFromEmailReply({
      ...base, reply: { kind: 'refuse', requestId: request.requestId, reason: 'Redo the header', referentWords: words },
    });
    expect(refused).toMatchObject({ ok: true, outcome: { outcome: 'rejected', reason: 'Redo the header', referentWords: words } });

    const approvedReply = decisionOutcomeFromEmailReply({
      ...base,
      reply: { kind: 'approve', requestId: request.requestId, optionId: 'approve-delivery', referentWords: 'Approved, but make the logo larger', note: 'make the logo larger' },
    });
    expect(approvedReply).toMatchObject({
      ok: true,
      outcome: { outcome: 'approved', note: 'make the logo larger', referentWords: 'Approved, but make the logo larger' },
    });

    const changes = decisionOutcomeFromEmailReply({
      ...base, reply: { kind: 'approve', requestId: request.requestId, optionId: 'ask-changes', referentWords: words },
    });
    expect(changes).toMatchObject({ ok: true, outcome: { outcome: 'rejected', reason: 'Ask for changes', referentWords: words } });
  });
});

describe('s8230 decisione-vecchia-valida', () => {
  it('s8230 decisione-vecchia-valida: a saved outcome without the new fields still parses and is rebuilt identically', () => {
    expect(DecisionOutcomeSchema.parse(saved)).toEqual(saved);
    expect(DecisionOutcomeSchema.parse(planOutcome)).toEqual(planOutcome);
    const result = decisionOutcomeFromEmailReply({
      ...base, reply: { kind: 'approve', requestId: request.requestId, optionId: 'ask-changes' },
    });
    expect(result).toEqual({ ok: true, outcome: saved });
  });
});

describe('s8230 nota-senza-parole', () => {
  it('s8230 nota-senza-parole: a note needs the referent words', () => {
    const approved = { ...saved, outcome: 'approved' as const, optionId: 'approve-delivery', note: 'make the logo larger' };
    const { reason: _reason, ...noReason } = approved as typeof approved & { reason: string };
    expect(DecisionOutcomeSchema.safeParse(noReason).success).toBe(false);
    expect(DecisionOutcomeSchema.safeParse({ ...noReason, referentWords: 'Approved, make the logo larger' }).success).toBe(true);
  });
});

describe('s8230 solo-consegne', () => {
  it('s8230 solo-consegne: a plan outcome cannot carry the referent words or a note', () => {
    expect(DecisionOutcomeSchema.safeParse({ ...planOutcome, referentWords: 'ok' }).success).toBe(false);
    expect(DecisionOutcomeSchema.safeParse({ ...planOutcome, referentWords: 'ok, but', note: 'but' }).success).toBe(false);
    const { subject: _s, ...unbound } = planOutcome;
    expect(DecisionOutcomeSchema.safeParse({ ...unbound, referentWords: 'ok' }).success).toBe(false);
  });
});

describe('s8230 troppo-lungo', () => {
  it('s8230 troppo-lungo: words over 2000 characters and notes under 3 are refused', () => {
    expect(DecisionOutcomeSchema.safeParse({ ...saved, referentWords: 'x'.repeat(2000) }).success).toBe(true);
    expect(DecisionOutcomeSchema.safeParse({ ...saved, referentWords: 'x'.repeat(2001) }).success).toBe(false);
    const { reason: _reason, ...receipt } = saved as typeof saved & { reason: string };
    const approved = { ...receipt, outcome: 'approved' as const, optionId: 'approve-delivery', referentWords: 'ok, but' };
    expect(DecisionOutcomeSchema.safeParse({ ...approved, note: 'ab' }).success).toBe(false);
    expect(DecisionOutcomeSchema.safeParse({ ...approved, note: 'abc' }).success).toBe(true);
  });
});
