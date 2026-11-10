import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanSchema,
  AssetRefSchema,
  AssetTypeSchema,
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  PROJECT_DELIVERY_ASSET_TYPE,
  PROJECT_DELIVERY_DUPLICATE_UNIT,
  PROJECT_DELIVERY_MAX_ATTEMPTS,
  ProjectDeliveryRecordSchema,
  ProjectDeliveryToolOutputSchema,
  projectDeliveryRecordAssetId,
  projectDeliveryRecordName,
  reconcileProjectDelivery,
} from '../../src/organization/index.js';

const plan = ActionPlanSchema.parse(
  JSON.parse(readFileSync(new URL('./fixtures/action-plan-v3-forma.json', import.meta.url), 'utf8')),
);
const APPROVED_AT = '2026-11-04T09:00:00+01:00';

const sha = (char: string) => char.repeat(64);

/** One unit with an approved delivery: request, referent's answer and saved asset. */
function approvedUnit(buSlug: string) {
  const assetId = 'asset-' + buSlug;
  const req = DecisionRequestSchema.parse({
    requestId: 'req-' + buSlug, tenantId: plan.tenantId, organizationId: plan.organizationId, projectId: plan.projectId,
    subject: {
      kind: 'delivery', organizationId: plan.organizationId, projectId: plan.projectId, buSlug,
      deliveryRef: { assetId, sha256: sha('a') },
    },
    question: 'Approvi la consegna di ' + buSlug + '?', options: [{ optionId: 'approva', label: 'Approvo' }],
    requestedBy: { managementAgentId: buSlug + '-lead', runtimeAgentId: 'agent-' + buSlug, vaultAgentId: 17 },
    addressedTo: { kind: 'referent', email: 'referente@example.com' },
    channel: 'email', createdAt: '2026-11-06T08:00:00Z',
  });
  const outcome = DecisionOutcomeSchema.parse({
    requestId: req.requestId, subject: req.subject, decidedBy: { kind: 'referent', email: 'referente@example.com' },
    decidedAt: '2026-11-06T09:00:00Z', channel: 'email', sourceRef: 'message-' + req.requestId,
    outcome: 'approved', optionId: 'approva',
  });
  const stored = AssetRefSchema.parse({
    assetId, sha256: sha('a'), name: 'CONSEGNA.json', mediaType: 'application/json', sizeBytes: 120,
    origin: { kind: 'session', sessionId: 'R12' },
    tenantId: plan.tenantId, companyId: plan.clientId, projectId: plan.projectId, buSlug,
    createdAt: '2026-11-06T07:00:00Z',
  });
  return { decision: { request: req, outcome }, asset: stored };
}

// No piece is approved: outcome `empty`, which is enough to exercise the record forms.
const emptyReconciliation = () => reconcileProjectDelivery({ plan, planApprovedAt: APPROVED_AT, decisions: [], assets: [] });
const SENT = { messageId: 'msg-1', sentAt: '2026-11-10T08:00:00Z', kind: 'partial' as const };

function partialReconciliation(sent?: typeof SENT) {
  const unit = approvedUnit(plan.businessUnits[0]!.buSlug);
  const base = reconcileProjectDelivery({ plan, planApprovedAt: APPROVED_AT, decisions: [unit.decision], assets: [unit.asset] });
  return sent === undefined ? base : { ...base, sent };
}

describe('project delivery record', () => {
  it('s6101 piano-con-reparto-doppio-senza-errore-leggibile: a plan listing a unit twice is refused with project_delivery_duplicate_unit naming the unit', () => {
    const doubled = { ...plan, businessUnits: [...plan.businessUnits, plan.businessUnits[0]!] };
    const slug = plan.businessUnits[0]!.buSlug;
    let message = '';
    try {
      reconcileProjectDelivery({ plan: doubled, planApprovedAt: APPROVED_AT, decisions: [], assets: [] });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message.startsWith(PROJECT_DELIVERY_DUPLICATE_UNIT + ':')).toBe(true);
    expect(message).toContain(slug);
    expect(message).not.toContain('"code"');
  });

  it('s6101 the record name and asset id are deterministic and valid asset fields', () => {
    const digest = 'ab'.repeat(32);
    const sent1 = projectDeliveryRecordName({ kind: 'final', digest, stage: 'sent', attempt: 1 });
    const sent2 = projectDeliveryRecordName({ kind: 'final', digest, stage: 'sent', attempt: 2 });
    expect(sent1).toBe(sent2);
    expect(sent1).toBe('consegna-progetto-final-' + 'ab'.repeat(8) + '-sent.json');
    const sending1 = projectDeliveryRecordName({ kind: 'final', digest, stage: 'sending', attempt: 1 });
    const sending2 = projectDeliveryRecordName({ kind: 'final', digest, stage: 'sending', attempt: 2 });
    const released1 = projectDeliveryRecordName({ kind: 'final', digest, stage: 'released', attempt: 1 });
    expect(new Set([sent1, sending1, sending2, released1]).size).toBe(4);
    const scope = { tenantId: plan.tenantId, organizationId: plan.organizationId, projectId: plan.projectId };
    const id = projectDeliveryRecordAssetId({ ...scope, name: sending1 });
    expect(projectDeliveryRecordAssetId({ ...scope, name: sending1 })).toBe(id);
    expect(projectDeliveryRecordAssetId({ ...scope, name: sending2 })).not.toBe(id);
    expect(id).toMatch(/^a_[0-9a-f]{40}$/);
    expect(AssetRefSchema.shape.assetId.safeParse(id).success).toBe(true);
    for (const name of [sent1, sending1, sending2, released1]) {
      expect(AssetRefSchema.shape.name.safeParse(name).success).toBe(true);
    }
  });

  it('s6101 a sending record carries no send and a sent record carries the send of its kind', () => {
    const open = partialReconciliation();
    expect(open.outcome).toBe('partial');
    const sending = { stage: 'sending', kind: 'partial', digest: open.digest, attempt: 1, reconciliation: open, claimedBy: 'call-1', claimedAt: '2026-11-10T08:00:00Z' };
    expect(ProjectDeliveryRecordSchema.safeParse(sending).success).toBe(true);
    expect(ProjectDeliveryRecordSchema.safeParse({ ...sending, kind: 'final' }).success).toBe(false);
    expect(ProjectDeliveryRecordSchema.safeParse({ ...sending, reconciliation: partialReconciliation(SENT) }).success).toBe(false);

    const sentRecord = { stage: 'sent', kind: 'partial', digest: open.digest, attempt: 1, reconciliation: partialReconciliation(SENT) };
    expect(ProjectDeliveryRecordSchema.safeParse(sentRecord).success).toBe(true);
    expect(ProjectDeliveryRecordSchema.safeParse({ ...sentRecord, reconciliation: open }).success).toBe(false);
    expect(ProjectDeliveryRecordSchema.safeParse({ ...sentRecord, extra: 1 }).success).toBe(false);

    // `empty` has no kind: it can never be claimed or sent.
    const empty = emptyReconciliation();
    expect(ProjectDeliveryRecordSchema.safeParse({ ...sending, digest: empty.digest, reconciliation: empty }).success).toBe(false);

    const released = { stage: 'released', kind: 'final', digest: empty.digest, attempt: 1, reason: 'smtp giù', releasedAt: '2026-11-10T08:01:00Z' };
    expect(ProjectDeliveryRecordSchema.safeParse(released).success).toBe(true);
    expect(ProjectDeliveryRecordSchema.safeParse({ ...released, attempt: PROJECT_DELIVERY_MAX_ATTEMPTS + 1 }).success).toBe(false);
  });

  it('s6101 a record whose digest differs from its reconciliation is refused', () => {
    const reconciliation = partialReconciliation();
    const record = { stage: 'sending', kind: 'partial', digest: 'cd'.repeat(32), attempt: 1, reconciliation, claimedBy: 'call-1', claimedAt: '2026-11-10T08:00:00Z' };
    const result = ProjectDeliveryRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain('Digest must equal');
  });

  it('s6101 the tool output is exactly { reconciliation }', () => {
    const reconciliation = emptyReconciliation();
    expect(ProjectDeliveryToolOutputSchema.safeParse({ reconciliation }).success).toBe(true);
    expect(ProjectDeliveryToolOutputSchema.safeParse({ reconciliation, extra: true }).success).toBe(false);
    expect(ProjectDeliveryToolOutputSchema.safeParse({}).success).toBe(false);
  });

  it('s6101 the asset type is a valid asset type', () => {
    expect(AssetTypeSchema.safeParse(PROJECT_DELIVERY_ASSET_TYPE).success).toBe(true);
  });
});
