import { describe, expect, it } from 'vitest';
import {
  DELIVERY_DECISION_DUPLICATE_CODES,
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  ReferentReplyHandoverSchema,
  decisionOutcomeFromHandover,
  deliveryDecisionDuplicate,
  type DecisionOutcome,
  type DecisionRequest,
} from '../../src/organization/index.js';

const referent = { kind: 'referent' as const, email: 'referente@goodchoice.example' };
const capo = { managementAgentId: 'capo-orto-design', runtimeAgentId: 'agent-capo-orto-design', vaultAgentId: 21 };
const director = { managementAgentId: 'director-good-choice', runtimeAgentId: 'agent-director-good-choice', vaultAgentId: 20 };
const file = (n: string) => ({ assetId: `asset-${n}`, sha256: n.repeat(64).slice(0, 64) });

function req(requestId: string, over: {
  ref?: ReturnType<typeof file>; version?: { key: string; version: number }; bu?: string;
  project?: string; tenant?: string; createdAt?: string; plan?: boolean;
} = {}): DecisionRequest {
  const projectId = over.project ?? 'orto-facile';
  const base = {
    requestId, tenantId: over.tenant ?? '1', organizationId: 'good-choice', projectId,
    question: 'Approvi questa consegna?',
    options: [{ optionId: 'approvo', label: 'Approvo', effect: 'approve' as const },
      { optionId: 'modifiche', label: 'Chiedo modifiche', effect: 'request_changes' as const }],
    requestedBy: capo, addressedTo: referent, channel: 'email' as const,
    createdAt: over.createdAt ?? '2026-11-11T10:00:00Z',
  };
  if (over.plan) {
    return DecisionRequestSchema.parse({
      ...base, addressedTo: { ownerId: 'stefano' }, options: [{ optionId: 'ok', label: 'Ok' }],
      subject: { kind: 'action_plan', planId: 'plan-001', planVersion: 1, digest: 'd'.repeat(64) },
    });
  }
  return DecisionRequestSchema.parse({
    ...base,
    subject: {
      kind: 'delivery', organizationId: 'good-choice', projectId, buSlug: over.bu ?? 'orto-design',
      deliveryRef: over.ref ?? file('a'), ...(over.version ? { assetVersion: over.version } : {}),
    },
  });
}
function outcomeOf(r: DecisionRequest, kind: 'approved' | 'rejected'): DecisionOutcome {
  const b = { requestId: r.requestId, subject: r.subject, decidedBy: referent, decidedAt: '2026-11-11T11:00:00Z',
    channel: 'email', sourceRef: 'msg-1' };
  return DecisionOutcomeSchema.parse(kind === 'approved'
    ? { ...b, outcome: 'approved', optionId: 'approvo' } : { ...b, outcome: 'rejected', reason: 'chiedo modifiche' });
}

describe('s6344 decisione-unica: duplicate delivery decision request', () => {
  it('s6344 decisione-unica: names an approved or pending request on the same saved file', () => {
    expect(DELIVERY_DECISION_DUPLICATE_CODES).toEqual(['decision_already_pending', 'decision_already_approved']);
    const old = req('dec_a2cdf8c3');
    const candidate = req('dec_8c1f1501', { createdAt: '2026-11-11T12:00:00Z' });
    expect(deliveryDecisionDuplicate(candidate, [{ request: old, outcome: outcomeOf(old, 'approved') }]))
      .toEqual({ code: 'decision_already_approved', requestId: 'dec_a2cdf8c3' });
    expect(deliveryDecisionDuplicate(candidate, [{ request: old, outcome: null }]))
      .toEqual({ code: 'decision_already_pending', requestId: 'dec_a2cdf8c3' });
  });

  it('lets through rejected, other scope, same id, other file and non-delivery candidates', () => {
    const candidate = req('dec_8c1f1501');
    const rej = req('dec_ef223ebd');
    expect(deliveryDecisionDuplicate(candidate, [{ request: rej, outcome: outcomeOf(rej, 'rejected') }])).toBeNull();
    for (const other of [req('dec_00000001', { bu: 'orto-web' }), req('dec_00000002', { project: 'altro' }),
      req('dec_00000003', { tenant: '2' }), req('dec_00000004', { ref: file('b') })]) {
      expect(deliveryDecisionDuplicate(candidate, [{ request: other, outcome: null }])).toBeNull();
    }
    expect(deliveryDecisionDuplicate(candidate, [{ request: req('dec_8c1f1501'), outcome: null }])).toBeNull();
    expect(deliveryDecisionDuplicate(req('dec_plan0001', { plan: true }), [{ request: req('dec_a2cdf8c3'), outcome: null }])).toBeNull();
    expect(deliveryDecisionDuplicate(candidate, [{ request: req('dec_plan0002', { plan: true }), outcome: null }])).toBeNull();
  });

  it('compares versions when both declare one, the file otherwise', () => {
    const v = (n: number) => ({ key: 'design', version: n });
    const cand = req('dec_8c1f1501', { ref: file('b'), version: v(1) });
    expect(deliveryDecisionDuplicate(cand, [{ request: req('dec_a2cdf8c3', { ref: file('a'), version: v(1) }), outcome: null }]))
      .toEqual({ code: 'decision_already_pending', requestId: 'dec_a2cdf8c3' });
    expect(deliveryDecisionDuplicate(cand, [{ request: req('dec_a2cdf8c3', { ref: file('b'), version: v(2) }), outcome: null }])).toBeNull();
    expect(deliveryDecisionDuplicate(cand, [{ request: req('dec_a2cdf8c3', { ref: file('b') }), outcome: null }]))
      .toEqual({ code: 'decision_already_pending', requestId: 'dec_a2cdf8c3' });
    expect(deliveryDecisionDuplicate(cand, [{ request: req('dec_a2cdf8c3', { ref: file('a') }), outcome: null }])).toBeNull();
  });

  it('returns the oldest of several open requests', () => {
    const newer = req('dec_00000009', { createdAt: '2026-11-11T11:00:00Z' });
    const older = req('dec_00000008', { createdAt: '2026-11-11T09:00:00Z' });
    expect(deliveryDecisionDuplicate(req('dec_8c1f1501', { createdAt: '2026-11-11T12:00:00Z' }),
      [{ request: newer, outcome: null }, { request: older, outcome: null }]))
      .toEqual({ code: 'decision_already_pending', requestId: 'dec_00000008' });
  });
});

describe('s6344 referent reply handover', () => {
  const request = req('dec_ef223ebd');
  const handover = {
    tenantId: '1', organizationId: 'good-choice', projectId: 'orto-facile', toBuSlug: 'orto-design',
    receivedBy: director, referent, messageId: '<CAB123@mail.example>', receivedAt: '2026-11-11T11:00:00Z',
    text: 'chiedo modifiche: colture segnaposto', requestId: 'dec_ef223ebd',
  };
  const refuse = { kind: 'refuse' as const, requestId: 'dec_ef223ebd', reason: 'colture segnaposto' };

  it('records a refusal with the handover message as source', () => {
    const h = ReferentReplyHandoverSchema.parse(handover);
    const r = decisionOutcomeFromHandover({ request, reply: refuse, handover: h });
    expect(r).toMatchObject({ ok: true, outcome: { outcome: 'rejected', sourceRef: '<CAB123@mail.example>' } });
  });

  it('is a mismatch for a missing or other request and for another unit', () => {
    const { requestId: _r, ...noId } = handover;
    for (const h of [noId, { ...handover, requestId: 'dec_a2cdf8c3' }, { ...handover, toBuSlug: 'orto-web' }]) {
      expect(decisionOutcomeFromHandover({ request, reply: refuse, handover: ReferentReplyHandoverSchema.parse(h) }))
        .toEqual({ ok: false, code: 'mismatch' });
    }
  });

  it('is not_addressee for another sender; the schema refuses empty text and extra keys', () => {
    const h = ReferentReplyHandoverSchema.parse({ ...handover, referent: { kind: 'referent', email: 'altro@x.example' } });
    expect(decisionOutcomeFromHandover({ request, reply: refuse, handover: h })).toEqual({ ok: false, code: 'not_addressee' });
    expect(ReferentReplyHandoverSchema.safeParse({ ...handover, text: '' }).success).toBe(false);
    expect(ReferentReplyHandoverSchema.safeParse({ ...handover, extra: 1 }).success).toBe(false);
  });
});
