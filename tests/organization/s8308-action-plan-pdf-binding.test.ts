import { describe, expect, it } from 'vitest';
import {
  DecisionOutcomeSchema, DecisionRequestSchema, actionPlanPdfDeliveryProblems, decisionOutcomeMatchesSubject,
} from '../../src/organization/decision-request.js';
import { DocumentPdfReceiptSchema } from '../../src/capability/document-receipt.js';

const hex = (char: string) => char.repeat(64);
const context = {
  planId: 'plan_0001', planVersion: 3, planDigest: hex('a'),
  dossierSnapshotId: 'snapshot-9', dossierDigest: hex('b'),
};
const receipt = (role: 'action_plan' | 'lab_dossier') => ({
  schemaVersion: 1,
  role,
  tenantId: 'tenant-a', organizationId: 'org-1', clientId: 'client-1', projectId: 'project-1',
  source: role === 'action_plan'
    ? { kind: role, planId: context.planId, version: context.planVersion, digest: context.planDigest }
    : { kind: role, snapshotId: context.dossierSnapshotId, digest: context.dossierDigest },
  documentDigest: hex('d'),
  asset: {
    assetId: role === 'action_plan' ? 'asset_plan' : 'asset_dossier',
    sha256: hex(role === 'action_plan' ? 'c' : 'e'),
    name: `${role}.pdf`, mediaType: 'application/pdf', sizeBytes: 2048,
    origin: { kind: 'generated', agentId: 'agent-qa' },
    tenantId: 'tenant-a', companyId: 'client-1', projectId: 'project-1',
    createdAt: '2026-11-23T10:00:00.000Z',
  },
  renderer: { name: 'pdfmake', version: '0.2.18' },
  fontSet: { name: 'roboto-embedded', version: '1.0.0' }, pageCount: 4,
  createdAt: '2026-11-23T10:00:01.000Z', producedBy: { agentId: 'agent-qa' },
  deliveryContext: { ...context },
});
const legacy = () => ({
  requestId: 'request_01', tenantId: 'tenant-a', organizationId: 'org-1', projectId: 'project-1',
  subject: { kind: 'action_plan', planId: context.planId, planVersion: 3, digest: context.planDigest },
  question: 'Approve this plan?', options: [{ optionId: 'approve', label: 'Approve' }],
  requestedBy: { managementAgentId: 'agent-director', runtimeAgentId: 'agent-director', vaultAgentId: 1 },
  addressedTo: { ownerId: 'owner-1' }, channel: 'email', createdAt: '2026-11-23T10:00:02.000Z',
});
const pair = () => [receipt('action_plan'), receipt('lab_dossier')];
const requestWith = (documents = pair()) => ({ ...legacy(), subject: { ...legacy().subject, documents } });
const problems = (documents = pair()) => actionPlanPdfDeliveryProblems(
  DecisionRequestSchema.parse(requestWith(documents)), documents.map((value) => DocumentPdfReceiptSchema.parse(value)),
);

describe('s8308 action plan PDF binding', () => {
  it('s8308 rejects two roles that point to the same PDF bytes', () => {
    // A valid pair must survive storage before the duplicate-byte rejection can be meaningful.
    const input = requestWith();
    expect(DecisionRequestSchema.safeParse(input).success).toBe(true);
    expect(problems()).toEqual([]);
    const documents = pair();
    documents[1]!.asset.sha256 = documents[0]!.asset.sha256;
    expect(documents[0]!.asset.assetId).not.toBe(documents[1]!.asset.assetId);
    expect(problems(documents)).toEqual(['pdf_bytes_must_differ']);
  });

  it('preserves historical requests and concluded outcomes without adding documents', () => {
    for (const kind of ['action_plan', 'vertical_plan', 'confirmation']) {
      const input = { ...legacy(), subject: { ...legacy().subject, kind } };
      expect(DecisionRequestSchema.parse(input)).toEqual(input);
      const outcome = {
        requestId: input.requestId, subject: input.subject, outcome: 'approved', optionId: 'approve',
        decidedBy: { kind: 'owner', ownerId: 'owner-1' }, channel: 'email',
        decidedAt: '2026-11-23T12:00:00.000Z', sourceRef: 'email-message-1',
      };
      expect(DecisionOutcomeSchema.parse(outcome)).toEqual(outcome);
    }
  });

  it('requires the pair only for new action plan deliveries', () => {
    expect(actionPlanPdfDeliveryProblems(DecisionRequestSchema.parse(legacy())))
      .toEqual(['missing_pdf_documents']);
    for (const kind of ['vertical_plan', 'confirmation']) {
      expect(actionPlanPdfDeliveryProblems(DecisionRequestSchema.parse({
        ...legacy(), subject: { ...legacy().subject, kind },
      }))).toEqual([]);
      expect(DecisionRequestSchema.safeParse({
        ...legacy(), subject: { ...legacy().subject, kind, documents: pair() },
      }).success).toBe(false);
    }
  });

  it('retains the complete immutable receipt pair through a JSON round trip', () => {
    const input = requestWith();
    const saved = JSON.stringify(input);
    const restored = DecisionRequestSchema.parse(JSON.parse(saved));
    expect(restored).toEqual(input);
    expect(restored.subject?.kind === 'action_plan' && restored.subject.digest).toBe(context.planDigest);
    expect(actionPlanPdfDeliveryProblems(restored, pair().map((value) => DocumentPdfReceiptSchema.parse(value))))
      .toEqual([]);
    expect(JSON.stringify(input)).toBe(saved);
  });

  it('rejects reversed, duplicate, missing and extra document roles', () => {
    for (const documents of [pair().reverse(), [receipt('action_plan'), receipt('action_plan')],
      [receipt('action_plan')], [...pair(), receipt('lab_dossier')]]) {
      expect(DecisionRequestSchema.safeParse(requestWith(documents)).success).toBe(false);
    }
  });

  it('rejects an altered plan source even when its own context agrees', () => {
    for (const field of ['planId', 'version', 'digest'] as const) {
      const documents = pair();
      const plan = documents[0]!;
      if (plan.source.kind !== 'action_plan') throw new Error('Invalid plan fixture');
      if (field === 'planId') {
        plan.source.planId = 'other_plan'; plan.deliveryContext.planId = 'other_plan';
      } else if (field === 'version') {
        plan.source.version = 4; plan.deliveryContext.planVersion = 4;
      } else {
        plan.source.digest = hex('f'); plan.deliveryContext.planDigest = hex('f');
      }
      expect(problems(documents)).toContain('pdf_plan_source_mismatch');
    }
  });

  it('rejects a foreign snapshot with an internally coherent dossier receipt', () => {
    for (const field of ['snapshotId', 'digest'] as const) {
      const documents = pair();
      const dossier = documents[1]!;
      if (dossier.source.kind !== 'lab_dossier') throw new Error('Invalid dossier fixture');
      if (field === 'snapshotId') {
        dossier.source.snapshotId = 'foreign-snapshot'; dossier.deliveryContext.dossierSnapshotId = 'foreign-snapshot';
      } else {
        dossier.source.digest = hex('f'); dossier.deliveryContext.dossierDigest = hex('f');
      }
      expect(problems(documents)).toContain('pdf_delivery_context_mismatch');
    }
  });

  it('rejects one asset identifier reused for two different PDFs', () => {
    const documents = pair();
    documents[1]!.asset.assetId = documents[0]!.asset.assetId;
    expect(problems(documents)).toEqual(['pdf_assets_must_differ']);
  });

  it('rejects foreign identities even when each asset agrees with its receipt', () => {
    for (const field of ['tenantId', 'organizationId', 'projectId', 'clientId'] as const) {
      const documents = pair();
      const dossier = documents[1]!;
      dossier[field] = 'foreign-scope';
      if (field === 'tenantId') dossier.asset.tenantId = dossier.tenantId;
      if (field === 'projectId') dossier.asset.projectId = dossier.projectId;
      if (field === 'clientId') dossier.asset.companyId = dossier.clientId;
      expect(problems(documents)).toContain('pdf_identity_mismatch');
    }
  });

  it('rejects non-PDF assets, absent renderer metadata and unbound producers', () => {
    const documents = pair();
    documents[0]!.asset.mediaType = 'text/markdown';
    expect(DecisionRequestSchema.safeParse(requestWith(documents)).success).toBe(false);
    const original = pair();
    expect(DecisionRequestSchema.safeParse(requestWith([
      { ...original[0]!, renderer: { name: 'pdfmake', version: '^0.2' } }, original[1]!,
    ])).success).toBe(false);
    original[0]!.producedBy.agentId = 'other-agent';
    expect(DecisionRequestSchema.safeParse(requestWith(original)).success).toBe(false);
  });

  it('does not treat model receipts as authoritative renderer evidence', () => {
    const request = DecisionRequestSchema.parse(requestWith());
    expect(actionPlanPdfDeliveryProblems(request)).toContain('pdf_renderer_receipt_not_attested');
    const attested = pair();
    attested[0]!.pageCount = 5;
    expect(actionPlanPdfDeliveryProblems(request, attested.map((value) => DocumentPdfReceiptSchema.parse(value))))
      .toEqual(['pdf_renderer_receipt_not_attested']);
  });

  it('keeps the original subject matching semantics', () => {
    const request = DecisionRequestSchema.parse(requestWith());
    expect(decisionOutcomeMatchesSubject(request, { subject: DecisionRequestSchema.parse(legacy()).subject })).toBe(true);
    expect(decisionOutcomeMatchesSubject(request, {
      subject: DecisionRequestSchema.parse({ ...legacy(), subject: { ...legacy().subject, digest: hex('f') } }).subject,
    })).toBe(false);
  });
});
