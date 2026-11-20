import { describe, expect, it } from 'vitest';
import { ActionPlanSchema } from '../../src/organization/action-plan.js';
import { AssetRefSchema } from '../../src/organization/asset.js';
import {
  AssetVersionRecordSchema,
  deriveAssetVersionStates,
  type AssetVersionState,
} from '../../src/organization/asset-version.js';
import {
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  type DecisionOutcome,
  type DecisionRequest,
} from '../../src/organization/decision-request.js';
import {
  reconcileProjectDelivery,
  type ProjectDeliveryPieceState,
} from '../../src/organization/project-delivery.js';

const scope = { tenantId: 'tenant-goodchoice', organizationId: 'good-choice', projectId: 'orto-facile' };
const units = ['design', 'web'] as const;
const referent = { kind: 'referent', email: 'referente@ortofacile.example' } as const;
const lead = { managementAgentId: 'bu-design-goodchoice', runtimeAgentId: 'agent-bu-design-goodchoice', vaultAgentId: 20 };
const approvedAt = '2026-11-04T08:00:00Z';
const decidedAt = '2026-11-06T10:00:00Z';

const plan = ActionPlanSchema.parse({
  ...scope, planId: 'plan-orto-facile', version: 3, digest: 'd'.repeat(64), clientId: 'orto-facile',
  objective: { request: 'Build the calendar site', expectedResult: 'A usable calendar', measure: 'Calendar published' },
  analysis: {
    startingPoint: 'The calendar needs a website',
    marketAndAlternatives: { text: 'A dedicated calendar', sources: ['https://ortofacile.example'] },
    recommendedMethod: { method: 'Design then build', why: 'Review the calendar before publishing' },
  },
  strategy: { approach: 'Build a calendar site', choices: ['Review each delivery'], discardedAlternatives: [] },
  objectiveTree: {
    project: { expectedResult: 'Calendar site', deliveryCriteria: ['Calendar is usable'] },
    businessUnits: units.map((buSlug) => ({
      buSlug, expectedResult: 'Deliver the calendar', deliveryCriteria: ['Referent approval'], indicators: [],
    })),
  },
  milestones: units.map((buSlug, index) => ({
    number: index + 1, buSlug, delivery: 'Calendar delivery', closeCriterion: 'Referent approval', blockedBy: [],
  })),
  criticalPath: [1, 2],
  businessUnits: units.map((buSlug) => ({
    buSlug, typeId: buSlug === 'design' ? 'design' : 'sviluppo', mandate: 'Deliver the calendar',
    competencies: ['Calendar delivery'], lead: { role: 'capo-bu' }, executor: 'dev_session',
    referent: { personRef: 'referente', entryVersion: 1 }, firstActivities: ['Read the plan'], start: { kind: 'now' },
  })),
  exchanges: [{ fromBu: 'design', toBu: 'web', what: 'Approved calendar design', format: 'PDF' }],
  budget: { currency: 'EUR', total: 100, perBu: units.map((buSlug) => ({ buSlug, cap: 50 })) },
  risks: [], assumptions: [], missingMaterials: [], questions: [],
  ifApproved: {
    startNow: [...units], startLater: [], verticalPlanDueBy: [], updates: { how: 'Email', every: 'Milestone' },
  },
});

const assets = units.map((buSlug, index) => AssetRefSchema.parse({
  tenantId: scope.tenantId, projectId: scope.projectId,
  assetId: 'asset-' + buSlug, sha256: (index === 0 ? 'a' : 'b').repeat(64),
  name: buSlug + '.pdf', mediaType: 'application/pdf', sizeBytes: 2048,
  origin: { kind: 'session', sessionId: 'R20' }, companyId: plan.clientId, buSlug,
  createdAt: '2026-11-06T07:00:00Z',
}));
const versions = assets.map((asset) => AssetVersionRecordSchema.parse({
  ...scope, buSlug: asset.buSlug, key: asset.buSlug + '-calendar', version: 1,
  files: [{ assetId: asset.assetId, sha256: asset.sha256 }],
  provenance: { createdBy: lead, sessionId: 'R20' }, recordedAt: asset.createdAt,
}));

function requestFor(buSlug: string, requestId = 'dec-' + buSlug, createdAt = '2026-11-06T08:00:00Z'): DecisionRequest {
  const asset = assets.find((entry) => entry.buSlug === buSlug)!;
  return DecisionRequestSchema.parse({
    ...scope, requestId, createdAt,
    subject: {
      kind: 'delivery', organizationId: scope.organizationId, projectId: scope.projectId, buSlug,
      deliveryRef: { assetId: asset.assetId, sha256: asset.sha256 },
    },
    question: 'Approve the calendar?', options: [{ optionId: 'approva', label: 'Approve' }],
    requestedBy: lead, addressedTo: referent, channel: 'email',
  });
}

function answer(request: DecisionRequest, outcome: 'approved' | 'rejected' = 'approved'): DecisionOutcome {
  return DecisionOutcomeSchema.parse({
    requestId: request.requestId, subject: request.subject, decidedBy: referent, decidedAt,
    channel: 'email', sourceRef: 'message-' + request.requestId,
    ...(outcome === 'approved' ? { outcome, optionId: 'approva' } : { outcome, reason: 'Revise the calendar' }),
  });
}

type Decision = { request: DecisionRequest; outcome: DecisionOutcome | null };
type Scenario = {
  name: string;
  outcome: (request: DecisionRequest) => DecisionOutcome | null;
  pieceState: ProjectDeliveryPieceState;
  versionState: AssetVersionState;
};

const scenarios: Scenario[] = [
  { name: 'open request', outcome: () => null, pieceState: 'pending', versionState: 'awaiting_decision' },
  {
    name: 'outcome for another request',
    outcome: (request) => ({ ...answer(request, 'rejected'), requestId: 'dec-another' }),
    pieceState: 'pending', versionState: 'awaiting_decision',
  },
  { name: 'rejected', outcome: (request) => answer(request, 'rejected'), pieceState: 'rejected', versionState: 'changes_requested' },
  { name: 'approved by referent', outcome: answer, pieceState: 'approved', versionState: 'approved' },
  {
    name: 'approved with another subject',
    outcome: (request) => DecisionOutcomeSchema.parse({
      ...answer(request),
      subject: {
        ...request.subject,
        deliveryRef: { assetId: 'asset-another', sha256: 'f'.repeat(64) },
      },
    }),
    pieceState: 'missing', versionState: 'awaiting_decision',
  },
  {
    name: 'approval without referent',
    outcome: (request) => DecisionOutcomeSchema.parse({
      ...answer(request), subject: undefined, decidedBy: { kind: 'owner', ownerId: 'owner-goodchoice' },
    }),
    pieceState: 'missing', versionState: 'awaiting_decision',
  },
];

function expectCorrespondence(
  buSlug: string, decisions: Decision[], selected: DecisionRequest,
  pieceState: ProjectDeliveryPieceState, versionState: AssetVersionState,
) {
  const delivery = reconcileProjectDelivery({ plan, planApprovedAt: approvedAt, decisions, assets });
  const states = deriveAssetVersionStates({ versions, decisions, leadReviews: [] });
  const piece = delivery.pieces.find((entry) => entry.buSlug === buSlug);
  const version = states.find((entry) => entry.buSlug === buSlug);
  const statePairs: Partial<Record<ProjectDeliveryPieceState, AssetVersionState>> = {
    pending: 'awaiting_decision', rejected: 'changes_requested', approved: 'approved', missing: 'awaiting_decision',
  };
  expect(piece?.state).toBe(pieceState);
  expect(version?.state).toBe(versionState);
  expect(version?.state).toBe(statePairs[pieceState]);
  expect(version?.requestId).toBe(selected.requestId);
  if (pieceState === 'missing') {
    expect(piece).toEqual({ buSlug, state: 'missing' });
  } else {
    expect(piece).toMatchObject({ requestId: selected.requestId, deliveryRef: selected.subject?.kind === 'delivery' ? selected.subject.deliveryRef : undefined });
  }
  if (pieceState === 'approved' || pieceState === 'rejected') {
    expect(piece?.decidedAt).toBe(decidedAt);
    expect(version?.decidedAt).toBe(decidedAt);
  } else {
    expect(piece?.decidedAt).toBeUndefined();
    expect(version?.decidedAt).toBeUndefined();
  }
}

describe.each(units)('s6309 una-sola-derivazione: %s', (buSlug) => {
  it.each(scenarios)('$name gives corresponding project delivery and asset version states', (scenario) => {
    const request = requestFor(buSlug);
    const decisions = units.map((unit) => {
      const req = unit === buSlug ? request : requestFor(unit);
      return { request: req, outcome: unit === buSlug ? scenario.outcome(req) : answer(req) };
    });
    expectCorrespondence(buSlug, decisions, request, scenario.pieceState, scenario.versionState);
  });

  it.each([false, true])('the greater requestId wins at the same instant, reversed input %s', (reverse) => {
    const earlier = requestFor(buSlug, 'dec-' + buSlug + '-a');
    const later = requestFor(buSlug, 'dec-' + buSlug + '-z', '2026-11-06T09:00:00+01:00');
    const decisions = units.map((unit) => {
      const req = requestFor(unit);
      return { request: req, outcome: answer(req) };
    });
    const tied: Decision[] = [
      { request: earlier, outcome: answer(earlier, 'rejected') },
      { request: later, outcome: answer(later) },
    ];
    decisions.splice(units.indexOf(buSlug), 1);
    const allDecisions = [...decisions, ...tied];
    expectCorrespondence(buSlug, reverse ? allDecisions.reverse() : allDecisions, later, 'approved', 'approved');
  });
});
