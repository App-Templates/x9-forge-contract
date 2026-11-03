import { describe, expect, it } from 'vitest';
import {
  AssetRefSchema,
  DECISION_SUBJECT_KINDS,
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  DecisionSubjectKindSchema,
  DecisionSubjectSchema,
  DeliveryDecisionSubjectSchema,
  decisionOutcomeFromEmailReply,
  decisionOutcomeMatchesSubject,
  decisionRequestSubjectLabel,
  type DecisionOutcome,
  type DecisionRequest,
  type DeliveryDecisionSubject,
} from '../../src/organization/index.js';
import {
  internalMemoryDecisionRequestCreateContract as create,
  internalMemoryDecisionRequestReadContract as read,
  internalMemoryDecisionRequestOutcomeContract as outcome,
} from '../../src/http/index.js';

const subject: DeliveryDecisionSubject = {
  kind: 'delivery',
  organizationId: 'org-acme',
  projectId: 'project-website',
  buSlug: 'design',
  deliveryRef: { assetId: 'asset-design-01', sha256: 'a'.repeat(64) },
};
const referent = { kind: 'referent' as const, email: 'Design.Lead@example.com' };
const request = {
  requestId: 'delivery-364',
  tenantId: 'tenant-acme',
  organizationId: subject.organizationId,
  projectId: subject.projectId,
  subject,
  question: 'Approve this exact design delivery?',
  options: [{ optionId: 'approve-delivery', label: 'Approve the delivery' }],
  requestedBy: { managementAgentId: 'design-lead', runtimeAgentId: 'agent-design', vaultAgentId: 17 },
  addressedTo: referent,
  channel: 'email',
  createdAt: '2026-10-28T08:00:00Z',
} satisfies DecisionRequest;
const approved = {
  requestId: request.requestId,
  subject,
  decidedBy: referent,
  decidedAt: '2026-10-28T09:00:00+00:00',
  channel: 'email',
  sourceRef: 'message-delivery-364',
  outcome: 'approved',
  optionId: 'approve-delivery',
} satisfies DecisionOutcome;
const { optionId: _optionId, ...receipt } = approved;
const rejected = { ...receipt, outcome: 'rejected' as const, reason: 'Please revise the colours' };
const emailInput = {
  request,
  reply: { kind: 'approve' as const, requestId: request.requestId },
  from: { email: '  design.lead@EXAMPLE.COM  ' },
  receivedAt: approved.decidedAt,
  messageId: approved.sourceRef,
};
const planSubject = { kind: 'vertical_plan' as const, planId: 'plan-0001', planVersion: 1, digest: 'b'.repeat(64) };

describe('delivery decision exports and inherited HTTP contracts', () => {
  it('exports the strict delivery branch through organization and reuses create/read/outcome schemas', () => {
    expect(DECISION_SUBJECT_KINDS).toEqual(['action_plan', 'vertical_plan', 'confirmation', 'delivery']);
    expect(DecisionSubjectKindSchema.parse('delivery')).toBe('delivery');
    expect(DeliveryDecisionSubjectSchema.parse(subject)).toEqual(subject);
    expect(DecisionSubjectSchema.parse(subject)).toEqual(subject);
    expect(DeliveryDecisionSubjectSchema.shape.projectId).toBe(AssetRefSchema.shape.projectId);
    expect(DeliveryDecisionSubjectSchema.shape.buSlug).toBe(AssetRefSchema.shape.buSlug.unwrap());
    expect(DeliveryDecisionSubjectSchema.shape.deliveryRef.shape.assetId).toBe(AssetRefSchema.shape.assetId);
    expect(DecisionRequestSchema.shape.tenantId.parse(request.tenantId)).toBe(request.tenantId);
    expect(create.bodySchema).toBe(DecisionRequestSchema);
    expect(outcome.bodySchema).toBe(DecisionOutcomeSchema);
    expect(create.bodySchema.parse(request)).toEqual(request);
    expect(create.responseSchema.parse({ requestId: request.requestId, state: 'open' })).toEqual({ requestId: request.requestId, state: 'open' });
    expect(read.responseSchema.parse({ request, state: 'open', outcome: null })).toEqual({ request, state: 'open', outcome: null });
    for (const answer of [approved, rejected]) {
      expect(outcome.bodySchema.parse(answer)).toEqual(answer);
      expect(read.responseSchema.parse({ request, state: 'decided', outcome: answer })).toEqual({ request, state: 'decided', outcome: answer });
    }
    expect(decisionRequestSubjectLabel(request.requestId)).toBe('[decisione delivery-364]');
  });
});

describe('strict delivery subject', () => {
  it.each([
    ['missing organization', { organizationId: undefined }],
    ['empty organization', { organizationId: '' }],
    ['long organization', { organizationId: 'o'.repeat(65) }],
    ['missing project', { projectId: undefined }],
    ['empty project', { projectId: '' }],
    ['long project', { projectId: 'p'.repeat(65) }],
    ['missing BU', { buSlug: undefined }],
    ['empty BU', { buSlug: '' }],
    ['invalid BU', { buSlug: 'Design Team' }],
    ['long BU', { buSlug: 'd'.repeat(31) }],
    ['missing asset', { deliveryRef: undefined }],
    ['missing asset id', { deliveryRef: { sha256: subject.deliveryRef.sha256 } }],
    ['invalid asset id', { deliveryRef: { ...subject.deliveryRef, assetId: 'bad/id' } }],
    ['missing fingerprint', { deliveryRef: { assetId: subject.deliveryRef.assetId } }],
    ['invalid fingerprint', { deliveryRef: { ...subject.deliveryRef, sha256: 'a'.repeat(63) } }],
    ['uppercase fingerprint', { deliveryRef: { ...subject.deliveryRef, sha256: 'A'.repeat(64) } }],
    ['generic URL', { deliveryRef: { url: 'https://example.com/delivery' } }],
    ['moving branch', { deliveryRef: { ...subject.deliveryRef, branch: 'main' } }],
    ['plan id on delivery', { planId: 'plan-0001' }],
    ['plan version on delivery', { planVersion: 1 }],
    ['plan digest on delivery', { digest: 'a'.repeat(64) }],
    ['unknown subject key', { extra: true }],
  ])('rejects %s', (_name, patch) => {
    const invalid = { ...subject, ...patch };
    expect(DeliveryDecisionSubjectSchema.safeParse(invalid).success).toBe(false);
    expect(DecisionSubjectSchema.safeParse(invalid).success).toBe(false);
    expect(create.bodySchema.safeParse({ ...request, subject: invalid }).success).toBe(false);
    expect(outcome.bodySchema.safeParse({ ...approved, subject: invalid }).success).toBe(false);
  });

  it('keeps the previous plan branch strict and distinct', () => {
    expect(DecisionSubjectSchema.parse(planSubject)).toEqual(planSubject);
    for (const invalid of [
      { ...planSubject, deliveryRef: subject.deliveryRef },
      { ...subject, kind: 'vertical_plan' },
      { ...planSubject, kind: 'delivery' },
      { ...planSubject, kind: 'other' },
      { ...planSubject, planVersion: 0 },
      { ...planSubject, digest: 'invalid' },
    ]) expect(DecisionSubjectSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('delivery request scope and referent', () => {
  it.each([
    ['owner recipient', { addressedTo: { ownerId: 'owner-acme' } }],
    ['missing referent kind', { addressedTo: { email: referent.email } }],
    ['invalid referent email', { addressedTo: { ...referent, email: 'not-an-email' } }],
    ['mixed recipient identity', { addressedTo: { ...referent, ownerId: 'owner-acme' } }],
    ['unknown recipient key', { addressedTo: { ...referent, extra: true } }],
    ['conversation channel', { channel: 'x9_conversation' }],
    ['panel channel', { channel: 'forge_panel' }],
    ['organization mismatch', { organizationId: 'another-org' }],
    ['project mismatch', { projectId: 'another-project' }],
    ['missing request project', { projectId: undefined }],
    ['missing delivery subject for referent', { subject: undefined }],
    ['plan subject for referent', { subject: planSubject }],
    ['duplicate options', { options: [request.options[0], request.options[0]] }],
    ['no options', { options: [] }],
  ])('rejects %s on create and read', (_name, patch) => {
    const invalid = { ...request, ...patch };
    expect(create.bodySchema.safeParse(invalid).success).toBe(false);
    expect(read.responseSchema.safeParse({ request: invalid, state: 'open', outcome: null }).success).toBe(false);
  });
});

describe('delivery outcome identity and receipt', () => {
  it.each([
    ['owner decision', { decidedBy: { kind: 'owner', ownerId: 'owner-acme' } }],
    ['missing referent kind', { decidedBy: { email: referent.email } }],
    ['invalid referent email', { decidedBy: { ...referent, email: 'invalid' } }],
    ['mixed decision identity', { decidedBy: { ...referent, ownerId: 'owner-acme' } }],
    ['unknown decision key', { decidedBy: { ...referent, extra: true } }],
    ['conversation channel', { channel: 'x9_conversation' }],
    ['panel channel', { channel: 'forge_panel' }],
    ['missing message receipt', { sourceRef: undefined }],
    ['empty message receipt', { sourceRef: '' }],
    ['blank message receipt', { sourceRef: ' \t\n ' }],
    ['long message receipt', { sourceRef: 'm'.repeat(513) }],
    ['missing decision date', { decidedAt: undefined }],
    ['invalid decision date', { decidedAt: 'not-a-date' }],
    ['missing delivery subject', { subject: undefined }],
    ['plan subject for referent', { subject: planSubject }],
  ])('rejects %s for approval and refusal', (_name, patch) => {
    for (const answer of [approved, rejected]) {
      const invalid = { ...answer, ...patch };
      expect(outcome.bodySchema.safeParse(invalid).success).toBe(false);
      expect(read.responseSchema.safeParse({ request, state: 'decided', outcome: invalid }).success).toBe(false);
    }
  });

  it('keeps approval options and rejection reasons mandatory and exclusive', () => {
    const { optionId: _option, ...withoutOption } = approved;
    const { reason: _reason, ...withoutReason } = rejected;
    for (const invalid of [
      withoutOption,
      withoutReason,
      { ...approved, reason: 'Not approved' },
      { ...rejected, optionId: approved.optionId },
      { ...rejected, reason: 'no' },
      { ...rejected, reason: 'r'.repeat(2001) },
    ]) expect(DecisionOutcomeSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('exact delivery correlation', () => {
  it('matches the identical immutable delivery', () => {
    expect(decisionOutcomeMatchesSubject(request, approved)).toBe(true);
    expect(decisionOutcomeMatchesSubject(request, rejected)).toBe(true);
  });

  it.each([
    ['organization', { ...subject, organizationId: 'another-org' }],
    ['project', { ...subject, projectId: 'another-project' }],
    ['BU', { ...subject, buSlug: 'development' }],
    ['asset', { ...subject, deliveryRef: { ...subject.deliveryRef, assetId: 'asset-design-02' } }],
    ['fingerprint', { ...subject, deliveryRef: { ...subject.deliveryRef, sha256: 'b'.repeat(64) } }],
    ['plan branch', planSubject],
    ['missing subject', undefined],
  ])('rejects changed %s in either direction', (_name, different) => {
    expect(decisionOutcomeMatchesSubject(request, { subject: different })).toBe(false);
    expect(decisionOutcomeMatchesSubject({ subject: different }, approved)).toBe(false);
  });
});

describe('already interpreted delivery email', () => {
  it('matches the real sender ignoring case and surrounding whitespace and copies the exact subject and receipt', () => {
    expect(decisionOutcomeFromEmailReply(emailInput)).toEqual({ ok: true, outcome: approved });
    expect(decisionOutcomeFromEmailReply({
      ...emailInput,
      reply: { kind: 'refuse', requestId: request.requestId, reason: rejected.reason },
    })).toEqual({ ok: true, outcome: rejected });
  });

  it.each([
    ['different email', { email: 'other@example.com' }],
    ['owner fallback', { ownerId: 'owner-acme' }],
    ['blank sender', { email: '  ' }],
    ['owner identity with wrong email', { ownerId: 'owner-acme', email: 'other@example.com' }],
  ])('rejects %s as not_addressee', (_name, from) => {
    expect(decisionOutcomeFromEmailReply({ ...emailInput, from })).toEqual({ ok: false, code: 'not_addressee' });
  });

  it('preserves mismatch, before_request and every unclear reason', () => {
    expect(decisionOutcomeFromEmailReply({ ...emailInput, reply: { kind: 'approve', requestId: 'another-request' } }))
      .toEqual({ ok: false, code: 'mismatch' });
    expect(decisionOutcomeFromEmailReply({ ...emailInput, receivedAt: '2026-10-28T07:59:59Z' }))
      .toEqual({ ok: false, code: 'before_request' });
    for (const why of ['missing_reason', 'no_decision', 'both'] as const) {
      expect(decisionOutcomeFromEmailReply({ ...emailInput, reply: { kind: 'unclear', requestId: request.requestId, why } }))
        .toEqual({ ok: false, code: 'unclear' });
    }
  });

  it('preserves option_required and unknown_option and accepts an explicit available option', () => {
    const multi = { ...request, options: [...request.options, { optionId: 'revise', label: 'Revise' }] };
    expect(decisionOutcomeFromEmailReply({ ...emailInput, request: multi })).toEqual({ ok: false, code: 'option_required' });
    expect(decisionOutcomeFromEmailReply({ ...emailInput, reply: { ...emailInput.reply, optionId: 'unknown' } }))
      .toEqual({ ok: false, code: 'unknown_option' });
    expect(decisionOutcomeFromEmailReply({ ...emailInput, request: multi, reply: { ...emailInput.reply, optionId: 'revise' } }))
      .toEqual({ ok: true, outcome: { ...approved, optionId: 'revise' } });
  });

  it('rejects invalid dates and blank receipts instead of recording an outcome', () => {
    expect(() => decisionOutcomeFromEmailReply({ ...emailInput, receivedAt: 'invalid' })).toThrow();
    expect(() => decisionOutcomeFromEmailReply({ ...emailInput, messageId: ' \t ' })).toThrow();
  });
});

describe('saved owner decisions remain unchanged', () => {
  const subjects = [
    { name: 'without subject', subject: undefined },
    ...(['action_plan', 'vertical_plan', 'confirmation'] as const).map((kind) => ({ name: kind, subject: { ...planSubject, kind } })),
  ];

  it.each(subjects)('preserves open, approved and rejected JSON $name', ({ subject: legacySubject }) => {
    const { subject: _deliverySubject, projectId: _projectId, ...base } = request;
    const ownerRequest = {
      ...base,
      addressedTo: { ownerId: 'owner-acme' },
      ...(legacySubject === undefined ? {} : { subject: legacySubject }),
    };
    const ownerOutcomes = [approved, rejected].map(({ subject: _delivery, ...answer }) => ({
      ...answer,
      decidedBy: { kind: 'owner' as const, ownerId: 'owner-acme' },
      ...(legacySubject === undefined ? {} : { subject: legacySubject }),
    }));
    const views = [
      { request: ownerRequest, state: 'open', outcome: null },
      ...ownerOutcomes.map((answer) => ({ request: ownerRequest, state: 'decided', outcome: answer })),
    ];
    expect(create.bodySchema.parse(ownerRequest)).toEqual(ownerRequest);
    for (const view of views) {
      expect(read.responseSchema.parse(view)).toStrictEqual(view);
    }
    for (const answer of ownerOutcomes) {
      expect(outcome.bodySchema.parse(answer)).toEqual(answer);
      expect(decisionOutcomeMatchesSubject(ownerRequest, answer)).toBe(true);
      for (const channel of ['email', 'x9_conversation', 'forge_panel'] as const) {
        expect(DecisionRequestSchema.parse({ ...ownerRequest, channel })).toEqual({ ...ownerRequest, channel });
        expect(DecisionOutcomeSchema.parse({ ...answer, channel, sourceRef: ' ' })).toEqual({ ...answer, channel, sourceRef: ' ' });
      }
    }
    expect(DecisionRequestSchema.safeParse({ ...ownerRequest, addressedTo: referent }).success).toBe(false);
    expect(DecisionRequestSchema.safeParse({ ...ownerRequest, addressedTo: { kind: 'owner', ownerId: 'owner-acme' } }).success).toBe(false);
    for (const answer of ownerOutcomes) {
      expect(DecisionOutcomeSchema.safeParse({ ...answer, decidedBy: referent }).success).toBe(false);
    }
    const parsed = DecisionRequestSchema.parse(ownerRequest);
    const { subject: _oldSubject, ...oldApproved } = ownerOutcomes[0]!;
    expect(decisionOutcomeFromEmailReply({ ...emailInput, request: parsed, from: { ownerId: 'owner-acme' } }))
      .toEqual({ ok: true, outcome: oldApproved });
    expect(decisionOutcomeFromEmailReply({ ...emailInput, request: parsed, from: { ownerId: 'another-owner' } }))
      .toEqual({ ok: false, code: 'not_addressee' });
    expect(decisionOutcomeFromEmailReply({ ...emailInput, request: parsed, from: { email: referent.email } }))
      .toEqual({ ok: false, code: 'not_addressee' });
  });
});
