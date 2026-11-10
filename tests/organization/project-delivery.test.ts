import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanSchema,
  actionPlanCanonicalJson,
  canonicalJson,
  AssetRefSchema,
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  PROJECT_DELIVERY_OUTCOMES,
  PROJECT_DELIVERY_PIECE_STATES,
  PROJECT_DELIVERY_SENT_KINDS,
  PROJECT_DELIVERY_TOOL,
  ProjectDeliveryInputSchema,
  ProjectDeliveryPieceSchema,
  ProjectDeliveryReconciliationSchema,
  projectDeliveryDigest,
  projectDeliveryUnitDigest,
  reconcileProjectDelivery,
  type ActionPlan,
  type AssetRef,
  type DecisionOutcome,
  type DecisionRequest,
} from '../../src/organization/index.js';

// The saved shape of the plan in production (8 units, no sections, no deliveryShape), version 3.
const plan = ActionPlanSchema.parse(
  JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8')),
);
const SLUGS = plan.businessUnits.map((unit) => unit.buSlug);
const FIRST_APPROVAL = '2026-11-04T09:00:00+01:00';
const V4_APPROVAL = '2026-11-09T10:00:00+01:00';

const sha = (char: string) => char.repeat(64);

function asset(buSlug: string, assetId: string, fingerprint: string): AssetRef {
  return AssetRefSchema.parse({
    assetId, sha256: fingerprint, name: 'CONSEGNA.json', mediaType: 'application/json', sizeBytes: 120,
    origin: { kind: 'session', sessionId: 'R12' },
    tenantId: plan.tenantId, companyId: plan.clientId, projectId: plan.projectId, buSlug,
    createdAt: '2026-11-06T07:00:00Z',
  });
}

function request(buSlug: string, requestId: string, assetId: string, fingerprint: string, createdAt: string, over: Partial<DecisionRequest> = {}): DecisionRequest {
  return DecisionRequestSchema.parse({
    requestId, tenantId: plan.tenantId, organizationId: plan.organizationId, projectId: plan.projectId,
    subject: {
      kind: 'delivery', organizationId: plan.organizationId, projectId: plan.projectId, buSlug,
      deliveryRef: { assetId, sha256: fingerprint },
    },
    question: 'Approvi la consegna di ' + buSlug + '?',
    options: [{ optionId: 'approva', label: 'Approvo' }],
    requestedBy: { managementAgentId: buSlug + '-lead', runtimeAgentId: 'agent-' + buSlug, vaultAgentId: 17 },
    addressedTo: { kind: 'referent', email: 'referente@example.com' },
    channel: 'email', createdAt, ...over,
  });
}

function answer(req: DecisionRequest, decidedAt: string, kind: 'approved' | 'rejected' = 'approved'): DecisionOutcome {
  return DecisionOutcomeSchema.parse({
    requestId: req.requestId, subject: req.subject, decidedBy: { kind: 'referent', email: 'referente@example.com' },
    decidedAt, channel: 'email', sourceRef: 'message-' + req.requestId,
    ...(kind === 'approved' ? { outcome: 'approved', optionId: 'approva' } : { outcome: 'rejected', reason: 'Da rifare' }),
  });
}

/** An approved delivery of one unit: the request, the referent's answer and the saved asset. */
function approvedUnit(buSlug: string, createdAt = '2026-11-06T08:00:00Z', fingerprint = sha('a')) {
  const req = request(buSlug, 'req-' + buSlug, 'asset-' + buSlug, fingerprint, createdAt);
  return { decision: { request: req, outcome: answer(req, '2026-11-06T09:00:00Z') }, asset: asset(buSlug, 'asset-' + buSlug, fingerprint) };
}

function reconcile(decisions: { request: DecisionRequest; outcome: DecisionOutcome | null }[], assets: AssetRef[], planApprovedAt = FIRST_APPROVAL) {
  return reconcileProjectDelivery({ plan, planApprovedAt, decisions, assets });
}

function planApproval(version: number, digest: string, createdAt: string, decidedAt: string) {
  const req = DecisionRequestSchema.parse({
    requestId: 'req-plan-v' + version,
    tenantId: plan.tenantId, organizationId: plan.organizationId, projectId: plan.projectId,
    subject: { kind: 'action_plan', planId: plan.planId, planVersion: version, digest },
    question: 'Approve this plan?', options: [{ optionId: 'approva', label: 'Approve' }],
    requestedBy: { managementAgentId: 'director', runtimeAgentId: 'agent-director', vaultAgentId: 17 },
    addressedTo: { ownerId: 'owner-1' }, channel: 'email', createdAt,
  });
  const outcome = DecisionOutcomeSchema.parse({
    requestId: req.requestId, subject: req.subject, outcome: 'approved', optionId: 'approva',
    decidedBy: { kind: 'owner', ownerId: 'owner-1' }, decidedAt,
    channel: 'email', sourceRef: 'message-' + req.requestId,
  });
  return { request: req, outcome };
}

function revisedPlan(changes: Partial<ActionPlan> = {}): ActionPlan {
  const revised = ActionPlanSchema.parse({ ...plan, version: 4, ...changes });
  return { ...revised, digest: createHash('sha256').update(actionPlanCanonicalJson(revised)).digest('hex') };
}

function versionedInput(current: ActionPlan, units: ReturnType<typeof approvedUnit>[]) {
  return {
    plan: current, planApprovedAt: FIRST_APPROVAL,
    decisions: [
      planApproval(3, plan.digest, '2026-11-04T07:00:00Z', FIRST_APPROVAL),
      ...units.map((unit) => unit.decision),
      planApproval(4, current.digest, '2026-11-09T08:00:00Z', V4_APPROVAL),
    ],
    assets: units.map((unit) => unit.asset),
  };
}

describe('project delivery reconciliation', () => {
  it('s5985 consegna-finale-con-reparti-mancanti: one approved unit out of eight is partial with seven missing and who they wait on', () => {
    const design = approvedUnit('design');
    const result = reconcile([design.decision], [design.asset]);

    expect(SLUGS).toHaveLength(8);
    expect(result.outcome).toBe('partial');
    expect(result.pieces.map((piece) => piece.buSlug)).toEqual(SLUGS);
    expect(result.pieces.filter((piece) => piece.state === 'approved').map((piece) => piece.buSlug)).toEqual(['design']);
    expect(result.missing.map((entry) => entry.buSlug)).toEqual(SLUGS.filter((slug) => slug !== 'design'));
    expect(result.missing.every((entry) => entry.state === 'missing')).toBe(true);
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);

    const waits = (slug: string) => result.missing.find((entry) => entry.buSlug === slug)?.waitsOn;
    // backend has no milestone and no section: it waits on `dati` only through the exchange.
    expect(waits('backend')).toEqual([{ buSlug: 'dati', what: 'Campi, provenienza, qualità e regole di correzione dei dati.' }]);
    // milestone 2 of `dati` is blocked by milestone 1 of itself: no self wait; `conformita` feeds it.
    expect(waits('dati')).toEqual([{ buSlug: 'conformita', what: 'Condizioni d’uso e vincoli su dati e immagini.' }]);
    // the approved design never appears as something to wait on, even though app depends on it.
    expect(waits('app')?.map((wait) => wait.buSlug)).not.toContain('design');
    expect(waits('app')?.map((wait) => wait.buSlug)).toEqual(expect.arrayContaining(['contenuti', 'conformita', 'qa']));
    expect(result.missing.flatMap((entry) => entry.waitsOn).every((wait) => wait.buSlug !== 'design')).toBe(true);
  });

  it('s5985 every unit approved with the same fingerprint is complete', () => {
    const units = SLUGS.map((slug) => approvedUnit(slug));
    const result = reconcile(units.map((unit) => unit.decision), units.map((unit) => unit.asset));

    expect(result.outcome).toBe('complete');
    expect(result.missing).toEqual([]);
    expect(result.pieces.every((piece) => piece.state === 'approved' && piece.deliveryRef?.sha256 === sha('a'))).toBe(true);
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);
    const sent = { ...result, sent: { messageId: 'message-final-1', sentAt: '2026-11-10T08:00:00+01:00', kind: 'final' } };
    expect(ProjectDeliveryReconciliationSchema.parse(sent)).toEqual(sent);
  });

  it('s5985 a rejected piece is rejected and missing', () => {
    const design = approvedUnit('design');
    const brandReq = request('brand', 'req-brand', 'asset-brand', sha('b'), '2026-11-07T08:00:00Z');
    const brand = { request: brandReq, outcome: answer(brandReq, '2026-11-07T09:00:00Z', 'rejected') };
    const result = reconcile([design.decision, brand], [design.asset, asset('brand', 'asset-brand', sha('b'))]);

    expect(result.pieces.find((piece) => piece.buSlug === 'brand')).toMatchObject({
      state: 'rejected', requestId: 'req-brand', decidedAt: '2026-11-07T09:00:00Z',
    });
    expect(result.missing.find((entry) => entry.buSlug === 'brand')?.state).toBe('rejected');
    expect(result.outcome).toBe('partial');
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);
  });

  it('s5985 an approval whose asset fingerprint changed is not approved', () => {
    const changed = approvedUnit('design');
    // The saved asset now has another content than the one the referent approved.
    const result = reconcile([changed.decision], [asset('design', 'asset-design', sha('c'))]);
    expect(result.pieces.find((piece) => piece.buSlug === 'design')).toEqual({ buSlug: 'design', state: 'missing' });
    expect(result.outcome).toBe('empty');

    const otherUnit = reconcile([changed.decision], [asset('app', 'asset-design', sha('a'))]);
    expect(otherUnit.pieces.find((piece) => piece.buSlug === 'design')?.state).toBe('missing');
    const noAsset = reconcile([changed.decision], []);
    expect(noAsset.pieces.find((piece) => piece.buSlug === 'design')?.state).toBe('missing');
  });

  it('s5985 a delivery created before the plan approval does not count', () => {
    const early = approvedUnit('design', '2026-11-03T08:00:00Z');
    const before = reconcile([early.decision], [early.asset]);
    expect(before.pieces.find((piece) => piece.buSlug === 'design')?.state).toBe('missing');
    expect(before.outcome).toBe('empty');

    // Exactly at the approval instant (other offset, same moment) it counts.
    const onTime = approvedUnit('design', '2026-11-04T08:00:00Z');
    expect(reconcile([onTime.decision], [onTime.asset]).pieces.find((piece) => piece.buSlug === 'design')?.state).toBe('approved');

    // A request of another project or tenant is not this project's piece.
    const design = approvedUnit('design');
    const foreign = { ...design.decision, request: request('design', 'req-other', 'asset-design', sha('a'), '2026-11-06T08:00:00Z', { tenantId: 'other-tenant' }) };
    expect(reconcile([foreign], [design.asset]).pieces.find((piece) => piece.buSlug === 'design')?.state).toBe('missing');
  });

  it('s5985 the latest request of a unit decides its state', () => {
    const older = approvedUnit('design', '2026-11-06T08:00:00Z');
    const reopenedReq = request('design', 'req-design-2', 'asset-design', sha('a'), '2026-11-08T08:00:00Z');
    const reopened = { request: reopenedReq, outcome: null };
    const result = reconcile([older.decision, reopened], [older.asset]);
    expect(result.pieces.find((piece) => piece.buSlug === 'design')).toMatchObject({ state: 'pending', requestId: 'req-design-2' });
    expect(result.pieces.find((piece) => piece.buSlug === 'design')?.decidedAt).toBeUndefined();

    // Offsets are compared as instants, not as text: 09:30Z is later than 10:00+01:00.
    const early = request('design', 'req-design-a', 'asset-design', sha('a'), '2026-11-06T10:00:00+01:00');
    const late = request('design', 'req-design-b', 'asset-design', sha('a'), '2026-11-06T09:30:00Z');
    const byInstant = reconcile([{ request: late, outcome: null }, { request: early, outcome: answer(early, '2026-11-06T12:00:00Z') }], [older.asset]);
    expect(byInstant.pieces.find((piece) => piece.buSlug === 'design')).toMatchObject({ state: 'pending', requestId: 'req-design-b' });

    // Same creation instant: the greater requestId wins, whatever the order.
    const tieA = request('design', 'req-tie-a', 'asset-design', sha('a'), '2026-11-06T08:00:00Z');
    const tieB = request('design', 'req-tie-b', 'asset-design', sha('a'), '2026-11-06T08:00:00Z');
    for (const order of [[tieA, tieB], [tieB, tieA]]) {
      const tie = reconcile(order.map((req) => ({ request: req, outcome: req === tieA ? answer(tieA, '2026-11-06T09:00:00Z') : null })), [older.asset]);
      expect(tie.pieces.find((piece) => piece.buSlug === 'design')).toMatchObject({ state: 'pending', requestId: 'req-tie-b' });
    }
  });

  it('s5985 the digest does not depend on the order of the decisions', () => {
    const design = approvedUnit('design');
    const app = approvedUnit('app');
    const brandReq = request('brand', 'req-brand', 'asset-brand', sha('b'), '2026-11-07T08:00:00Z');
    const decisions = [design.decision, app.decision, { request: brandReq, outcome: null }];
    const assets = [design.asset, app.asset];
    const forward = reconcile(decisions, assets);
    const backward = reconcile([...decisions].reverse(), [...assets].reverse());

    expect(backward).toEqual(forward);
    expect(backward.digest).toBe(forward.digest);
    expect(projectDeliveryDigest(forward.plan, [...forward.pieces].reverse())).toBe(forward.digest);
    expect(forward.digest).toMatch(/^[0-9a-f]{64}$/);

    // It changes with the state of a piece and with the plan.
    const other = approvedUnit('design', '2026-11-06T08:00:00Z', sha('d'));
    expect(reconcile([other.decision, app.decision], [other.asset, app.asset]).digest).not.toBe(forward.digest);
    expect(projectDeliveryDigest({ ...forward.plan, version: 4 }, forward.pieces)).not.toBe(forward.digest);
  });

  it('s5985 the schema refuses complete with missing units and a final send on a partial outcome', () => {
    const units = SLUGS.map((slug) => approvedUnit(slug));
    const complete = reconcile(units.map((unit) => unit.decision), units.map((unit) => unit.asset));
    const design = approvedUnit('design');
    const partial = reconcile([design.decision], [design.asset]);
    const empty = reconcile([], []);
    const sent = (kind: string) => ({ messageId: 'message-1', sentAt: '2026-11-10T08:00:00+01:00', kind });
    const refuses = (value: unknown) => ProjectDeliveryReconciliationSchema.safeParse(value).success;

    expect(refuses({ ...complete, missing: partial.missing })).toBe(false);
    expect(refuses({ ...partial, missing: [] })).toBe(false);
    expect(refuses({ ...partial, outcome: 'complete', missing: [] })).toBe(false);
    expect(refuses({ ...complete, outcome: 'partial' })).toBe(false);
    expect(refuses({ ...partial, sent: sent('final') })).toBe(false);
    expect(refuses({ ...complete, sent: sent('partial') })).toBe(false);
    expect(refuses({ ...empty, sent: sent('partial') })).toBe(false);
    expect(refuses({ ...partial, sent: sent('partial') })).toBe(true);
    expect(refuses({ ...complete, sent: sent('final') })).toBe(true);
    expect(refuses({ ...empty })).toBe(true);
    // Missing must be exactly the pieces that are not approved, in the same state.
    expect(refuses({ ...partial, missing: partial.missing.slice(1) })).toBe(false);
    expect(refuses({ ...partial, missing: partial.missing.map((entry, i) => (i === 0 ? { ...entry, state: 'pending' } : entry)) })).toBe(false);
    // The digest is recomputed from the plan and the pieces.
    expect(refuses({ ...partial, digest: sha('0') })).toBe(false);
    // Unique units, approved pieces carry their evidence, missing pieces carry none.
    expect(refuses({ ...partial, pieces: [...partial.pieces, partial.pieces[0]] })).toBe(false);
    const { requestId: _requestId, ...bare } = partial.pieces.find((piece) => piece.state === 'approved')!;
    const unproven = partial.pieces.map((piece) => (piece.state === 'approved' ? bare : piece));
    expect(refuses({ ...partial, pieces: unproven, digest: projectDeliveryDigest(partial.plan, unproven) })).toBe(false);
    const stuffed = partial.pieces.map((piece) => (piece.state === 'missing' ? { ...piece, requestId: 'req-x1234' } : piece));
    expect(refuses({ ...partial, pieces: stuffed, digest: projectDeliveryDigest(partial.plan, stuffed) })).toBe(false);
    expect(refuses({ ...partial, extra: true })).toBe(false);
  });

  it('s5985 production shape: the first approval keeps the design approved under v4, the v4 approval would drop it', () => {
    // Seen in production on 10/11: design approved twice by the referent on 06/11 (after the first approval of the
    // plan, before the v4 one), brand opened on 09/11, the other six never asked.
    const first = request('design', 'req-design-1', 'asset-design-1', sha('1'), '2026-11-06T08:00:00Z');
    const second = request('design', 'req-design-2', 'asset-design-2', sha('2'), '2026-11-06T10:00:00Z');
    const brand = request('brand', 'req-brand-1', 'asset-brand-1', sha('3'), '2026-11-09T11:00:00Z');
    const decisions = [
      { request: first, outcome: answer(first, '2026-11-06T09:00:00Z') },
      { request: second, outcome: answer(second, '2026-11-06T11:00:00Z') },
      { request: brand, outcome: null },
    ];
    const assets = [asset('design', 'asset-design-1', sha('1')), asset('design', 'asset-design-2', sha('2')), asset('brand', 'asset-brand-1', sha('3'))];

    const result = reconcile(decisions, assets, FIRST_APPROVAL);
    expect(result.outcome).toBe('partial');
    expect(result.pieces.find((piece) => piece.buSlug === 'design')).toMatchObject({
      state: 'approved', requestId: 'req-design-2', deliveryRef: { assetId: 'asset-design-2', sha256: sha('2') },
    });
    expect(result.pieces.find((piece) => piece.buSlug === 'brand')?.state).toBe('pending');
    expect(result.pieces.filter((piece) => piece.state === 'missing').map((piece) => piece.buSlug).sort())
      .toEqual(SLUGS.filter((slug) => slug !== 'design' && slug !== 'brand').sort());
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);

    // With the approval of the current version as threshold the design piece disappears: that is why the caller passes the first one.
    const v4 = reconcile(decisions, assets, V4_APPROVAL);
    expect(v4.outcome).toBe('empty');
    expect(v4.pieces.find((piece) => piece.buSlug === 'design')?.state).toBe('missing');
    expect(v4.pieces.find((piece) => piece.buSlug === 'brand')?.state).toBe('pending');
  });

  it('s6100 consegna-completa-falsa-dopo-ripianificazione: a v4 plan with the design mandate changed and eight approvals under v3 is not complete', () => {
    const v4 = revisedPlan({ businessUnits: plan.businessUnits.map((unit) => unit.buSlug === 'design'
      ? { ...unit, mandate: 'Design a revised checkout flow.' } : unit) });
    const result = reconcileProjectDelivery({
      ...versionedInput(v4, SLUGS.map((slug) => approvedUnit(slug))),
      planVersions: [{ plan, approvedAt: FIRST_APPROVAL }, { plan: v4, approvedAt: V4_APPROVAL }],
    });

    // Before needs_reapproval and the unit comparison, these eight old approvals incorrectly yielded complete (M1).
    expect(result.outcome).toBe('partial');
    expect(result.pieces.find((piece) => piece.buSlug === 'design')).toEqual({
      buSlug: 'design', state: 'needs_reapproval', requestId: 'req-design',
      deliveryRef: { assetId: 'asset-design', sha256: sha('a') },
      decidedAt: '2026-11-06T09:00:00Z', approvedUnderVersion: 3,
    });
    expect(result.pieces.filter((piece) => piece.state === 'approved').map((piece) => piece.buSlug))
      .toEqual(SLUGS.filter((slug) => slug !== 'design'));
    expect(result.missing).toEqual([{ buSlug: 'design', state: 'needs_reapproval', waitsOn: [] }]);
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);
  });

  it('s6100 a v4 identical for every unit keeps the eight approvals and is complete', () => {
    const v4 = revisedPlan({ risks: [...plan.risks, 'A newly identified project risk.'] });
    const result = reconcileProjectDelivery({
      ...versionedInput(v4, SLUGS.map((slug) => approvedUnit(slug))),
      planVersions: [{ plan, approvedAt: FIRST_APPROVAL }],
    });
    expect(result.outcome).toBe('complete');
    expect(result.pieces).toHaveLength(8);
    expect(result.pieces.every((piece) => piece.state === 'approved' && piece.approvedUnderVersion === undefined)).toBe(true);
    expect(result.missing).toEqual([]);
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);
  });

  it('s6100 without the content of the old version a piece approved under it needs reapproval', () => {
    const result = reconcileProjectDelivery(versionedInput(revisedPlan(), SLUGS.map((slug) => approvedUnit(slug))));
    expect(result.outcome).toBe('empty');
    expect(result.pieces).toHaveLength(8);
    expect(result.pieces.every((piece) => piece.state === 'needs_reapproval' && piece.approvedUnderVersion === 3)).toBe(true);
    expect(result.missing.map((piece) => piece.buSlug)).toEqual(SLUGS);
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);
  });

  it('s6100 a delivery sent after the v4 approval is approved under v4', () => {
    const design = approvedUnit('design', '2026-11-09T09:00:00Z');
    design.decision.outcome = answer(design.decision.request, '2026-11-10T09:00:00Z');
    const result = reconcileProjectDelivery(versionedInput(revisedPlan(), [design]));
    expect(result.pieces.find((piece) => piece.buSlug === 'design')).toMatchObject({ state: 'approved' });
    expect(result.pieces.find((piece) => piece.buSlug === 'design')?.approvedUnderVersion).toBeUndefined();
    expect(result.outcome).toBe('partial');
  });

  it('s6100 a delivery sent under v3 and decided after v4 still needs reapproval', () => {
    const design = approvedUnit('design');
    design.decision.outcome = answer(design.decision.request, '2026-11-10T09:00:00Z');
    const result = reconcileProjectDelivery(versionedInput(revisedPlan(), [design]));
    // Using the reply instant instead of the request instant would incorrectly approve this piece (M3).
    expect(result.pieces.find((piece) => piece.buSlug === 'design')).toMatchObject({
      state: 'needs_reapproval', approvedUnderVersion: 3, decidedAt: '2026-11-10T09:00:00Z',
    });
    expect(result.outcome).toBe('empty');
  });

  it('s6100 a change of start or referent alone does not ask for reapproval', () => {
    const v4 = revisedPlan({ businessUnits: plan.businessUnits.map((unit) => ({
      ...unit, referent: { personRef: 'new-referent', entryVersion: 2 },
      start: { kind: 'planned', unlockedBy: { milestone: 1, delivery: 'Inputs verified.' } },
    })) });
    const result = reconcileProjectDelivery({
      ...versionedInput(v4, SLUGS.map((slug) => approvedUnit(slug))),
      planVersions: [{ plan, approvedAt: FIRST_APPROVAL }],
    });
    expect(result.outcome).toBe('complete');
    for (const slug of SLUGS) expect(projectDeliveryUnitDigest(v4, slug)).toBe(projectDeliveryUnitDigest(plan, slug));
  });

  it('s6100 a unit that starts later still counts: seven approved and the later unit missing is partial', () => {
    const later = revisedPlan({
      businessUnits: plan.businessUnits.map((unit) => unit.buSlug === 'qa' ? {
        ...unit, start: { kind: 'planned', unlockedBy: { milestone: 4, delivery: 'Integrated application.' } },
      } : unit),
      ifApproved: { ...plan.ifApproved, startNow: SLUGS.filter((slug) => slug !== 'qa'),
        startLater: [{ buSlug: 'qa', after: 'Integrated application.' }] },
    });
    const result = reconcileProjectDelivery({
      ...versionedInput(later, SLUGS.filter((slug) => slug !== 'qa').map((slug) => approvedUnit(slug))),
      planVersions: [{ plan, approvedAt: FIRST_APPROVAL }],
    });
    // Counting only startNow would lose qa and incorrectly return complete (M2).
    expect(result.pieces).toHaveLength(8);
    expect(result.pieces.filter((piece) => piece.state === 'approved')).toHaveLength(7);
    expect(result.outcome).toBe('partial');
    expect(result.missing).toEqual([{ buSlug: 'qa', state: 'missing', waitsOn: [] }]);
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);
  });

  it('s6100 the schema refuses needs_reapproval without approvedUnderVersion and approvedUnderVersion on other states', () => {
    const piece = { buSlug: 'design', state: 'needs_reapproval', requestId: 'req-design',
      deliveryRef: { assetId: 'asset-design', sha256: sha('a') }, decidedAt: '2026-11-06T09:00:00Z', approvedUnderVersion: 3 };
    expect(ProjectDeliveryPieceSchema.parse(piece)).toEqual(piece);
    for (const key of ['requestId', 'deliveryRef', 'decidedAt', 'approvedUnderVersion'] as const) {
      const incomplete = { ...piece };
      Reflect.deleteProperty(incomplete, key);
      expect(ProjectDeliveryPieceSchema.safeParse(incomplete).success).toBe(false);
    }
    for (const approvedUnderVersion of [0, 1.5]) {
      expect(ProjectDeliveryPieceSchema.safeParse({ ...piece, approvedUnderVersion }).success).toBe(false);
    }
    const otherPieces = [
      { ...piece, state: 'approved' },
      { buSlug: 'design', state: 'pending', requestId: 'req-design', approvedUnderVersion: 3 },
      { ...piece, state: 'rejected' },
      { buSlug: 'design', state: 'missing', approvedUnderVersion: 3 },
    ];
    for (const other of otherPieces) expect(ProjectDeliveryPieceSchema.safeParse(other).success).toBe(false);
  });

  it('s6100 production shape with v2, v3 and v4 approvals keeps unchanged design approved and brand pending', () => {
    const v4 = revisedPlan({ risks: [...plan.risks, 'Updated production risk.'] });
    const design = approvedUnit('design');
    const brand = request('brand', 'req-brand-1', 'asset-brand-1', sha('3'), '2026-11-09T11:00:00Z');
    const result = reconcileProjectDelivery({
      plan: v4, planApprovedAt: '2026-11-03T09:00:00Z',
      decisions: [
        planApproval(2, revisedPlan({ version: 2 }).digest, '2026-11-03T08:00:00Z', '2026-11-03T09:00:00Z'),
        planApproval(3, plan.digest, '2026-11-04T07:00:00Z', FIRST_APPROVAL),
        design.decision, { request: brand, outcome: null },
        planApproval(4, v4.digest, '2026-11-09T14:00:00Z', '2026-11-09T14:43:00Z'),
      ],
      assets: [design.asset], planVersions: [{ plan, approvedAt: FIRST_APPROVAL }],
    });
    expect(plan.businessUnits).toHaveLength(8);
    expect(plan.deliveryShape).toBeUndefined();
    expect(plan.businessUnits.every((unit) => unit.sections === undefined)).toBe(true);
    expect(result.outcome).toBe('partial');
    expect(result.pieces.find((piece) => piece.buSlug === 'design')?.state).toBe('approved');
    expect(result.pieces.find((piece) => piece.buSlug === 'brand')?.state).toBe('pending');
    expect(result.pieces.filter((piece) => piece.state === 'missing')).toHaveLength(6);
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);
  });

  it('s6100 unit digest uses canonical unit, objective, owned work and delivery criteria', () => {
    const workItem = { id: 'checkout', title: 'Checkout', expectedGoal: 'Place an order.',
      deliveryCriteria: ['Order confirmed.'], milestone: 3, owners: [{ buSlug: 'design', does: 'Design checkout.' }] };
    const withWork = revisedPlan({ workBreakdown: [
      { ...workItem, id: 'summary' }, workItem,
      { ...workItem, id: 'backend', owners: [{ buSlug: 'backend', does: 'Store the order.' }] },
    ], milestones: [...plan.milestones, { number: 6, buSlug: 'design', delivery: 'Additional screens.',
      closeCriterion: 'Screens approved.', blockedBy: [] }] });
    const { start: _start, referent: _referent, ...unit } = withWork.businessUnits.find((candidate) => candidate.buSlug === 'design')!;
    const expected = { unit, objective: withWork.objectiveTree.businessUnits.find((candidate) => candidate.buSlug === 'design'),
      work: [workItem, { ...workItem, id: 'summary' }],
      milestones: withWork.milestones.filter((milestone) => milestone.buSlug === 'design')
        .map(({ delivery, closeCriterion }) => ({ delivery, closeCriterion }))
        .sort((a, b) => a.delivery < b.delivery ? -1 : a.delivery > b.delivery ? 1 : 0) };
    const digest = projectDeliveryUnitDigest(withWork, 'design');
    expect(digest).toBe(createHash('sha256').update(canonicalJson(expected)).digest('hex'));
    const reordered = revisedPlan({ ...withWork,
      businessUnits: [...withWork.businessUnits].reverse(),
      objectiveTree: { ...withWork.objectiveTree, businessUnits: [...withWork.objectiveTree.businessUnits].reverse() },
      workBreakdown: [...withWork.workBreakdown!].reverse(),
      milestones: [...withWork.milestones].reverse().map((milestone) => ({ ...milestone, dueDate: '2026-12-01' })),
    });
    expect(projectDeliveryUnitDigest(reordered, 'design')).toBe(digest);
    const changes: Partial<ActionPlan>[] = [
      { businessUnits: withWork.businessUnits.map((candidate) => candidate.buSlug === 'design'
        ? { ...candidate, mandate: 'Changed design mandate.' } : candidate) },
      { objectiveTree: { ...withWork.objectiveTree, businessUnits: withWork.objectiveTree.businessUnits.map((candidate) => candidate.buSlug === 'design'
        ? { ...candidate, expectedResult: 'Changed design objective.' } : candidate) } },
      { workBreakdown: withWork.workBreakdown!.map((item) => item.id === 'checkout' ? { ...item, expectedGoal: 'Changed checkout.' } : item) },
      { milestones: withWork.milestones.map((milestone) => milestone.buSlug === 'design'
        ? { ...milestone, closeCriterion: 'Changed acceptance criterion.' } : milestone) },
    ];
    for (const change of changes) expect(projectDeliveryUnitDigest(revisedPlan({ ...withWork, ...change }), 'design')).not.toBe(digest);
    const noObjective = revisedPlan({ objectiveTree: { ...plan.objectiveTree,
      businessUnits: plan.objectiveTree.businessUnits.filter((candidate) => candidate.buSlug !== 'design') } });
    const { start: _oldStart, referent: _oldReferent, ...originalUnit } = plan.businessUnits.find((candidate) => candidate.buSlug === 'design')!;
    expect(projectDeliveryUnitDigest(noObjective, 'design')).toBe(createHash('sha256').update(canonicalJson({
      unit: originalUnit, objective: null, work: [], milestones: plan.milestones.filter((milestone) => milestone.buSlug === 'design')
        .map(({ delivery, closeCriterion }) => ({ delivery, closeCriterion })),
    })).digest('hex'));
  });

  it('s6100 the earliest approval per version and highest version at submission win regardless of decision order', () => {
    const v4 = revisedPlan();
    const input = versionedInput(v4, [approvedUnit('design')]);
    const laterV3 = planApproval(3, plan.digest, '2026-11-08T07:00:00Z', '2026-11-08T09:00:00Z');
    const v2 = planApproval(2, revisedPlan({ version: 2 }).digest, '2026-11-03T07:00:00Z', '2026-11-03T09:00:00Z');
    for (const decisions of [[laterV3, ...input.decisions, v2], [v2, ...input.decisions, laterV3].reverse()]) {
      const result = reconcileProjectDelivery({ ...input, decisions });
      expect(result.pieces.find((piece) => piece.buSlug === 'design')).toMatchObject({ state: 'needs_reapproval', approvedUnderVersion: 3 });
    }
  });

  it('s6100 an unrelated or unanswered current plan approval preserves legacy behavior', () => {
    const input = versionedInput(revisedPlan(), [approvedUnit('design')]);
    const current = input.decisions[2]!;
    const foreignDecisions = [
      { ...current, outcome: null },
      { ...current, outcome: { ...current.outcome!, requestId: 'req-unrelated' } },
      { ...current, request: { ...current.request, subject: { kind: 'action_plan' as const, planId: 'plan-other', planVersion: 4, digest: sha('b') } } },
      { ...current, request: { ...current.request, tenantId: 'other-tenant' } },
      { ...current, request: { ...current.request, organizationId: 'other-organization' } },
      { ...current, request: { ...current.request, projectId: 'other-project' } },
    ];
    for (const other of foreignDecisions) {
      const result = reconcileProjectDelivery({ ...input, decisions: [input.decisions[0]!, input.decisions[1]!, other] });
      expect(result.pieces.find((piece) => piece.buSlug === 'design')?.state).toBe('approved');
    }
    const foreignPlan = revisedPlan({ planId: 'plan-other', version: 3 });
    const result = reconcileProjectDelivery({ ...input, planVersions: [{ plan: foreignPlan, approvedAt: FIRST_APPROVAL }] });
    expect(result.pieces.find((piece) => piece.buSlug === 'design')?.state).toBe('needs_reapproval');
  });

  it('s6100 a known current approval with no approved version at submission leaves the piece missing', () => {
    const input = versionedInput(revisedPlan(), [approvedUnit('design')]);
    const result = reconcileProjectDelivery({ ...input, decisions: input.decisions.slice(1) });
    expect(result.pieces.find((piece) => piece.buSlug === 'design')).toEqual({ buSlug: 'design', state: 'missing' });
    expect(result.outcome).toBe('empty');
    expect(ProjectDeliveryReconciliationSchema.parse(result)).toEqual(result);
  });

  it('exports the tool name, the vocabularies and a strict input', () => {
    expect(PROJECT_DELIVERY_TOOL).toBe('email_deliver_project');
    expect(PROJECT_DELIVERY_OUTCOMES).toEqual(['complete', 'partial', 'empty']);
    expect(PROJECT_DELIVERY_PIECE_STATES).toEqual(['approved', 'pending', 'rejected', 'missing', 'needs_reapproval']);
    expect(PROJECT_DELIVERY_SENT_KINDS).toEqual(['final', 'partial']);
    expect(ProjectDeliveryInputSchema.parse({ projectId: 'good-choice', partial: true })).toEqual({ projectId: 'good-choice', partial: true });
    expect(ProjectDeliveryInputSchema.parse({ projectId: 'good-choice' })).toEqual({ projectId: 'good-choice' });
    expect(ProjectDeliveryInputSchema.safeParse({ projectId: 'good-choice', other: 1 }).success).toBe(false);
    expect(ProjectDeliveryInputSchema.safeParse({}).success).toBe(false);
  });
});
