import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ActionPlanReferentProposalSchema,
  COMPANY_MAP_CONFIRM_OPTIONS,
  CompanyMapAnyEntrySchema,
  CompanyMapEntrySchema,
  CompanyMapReferentChangeSchema,
  ConfirmationSetDecisionSubjectSchema,
  DecisionEmailReplySchema,
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  DecisionSubjectSchema,
  companyMapConfirmationSetSubject,
  companyMapConfirmationSubject,
  confirmationSetDigest,
  decisionOutcomeFromEmailReply,
  decisionOutcomeMatchesSubject,
  type DecisionEmailReply,
  type DecisionRequest,
} from '../../src/organization/index.js';

// Same saved entry and request shapes as company-map and decision-request tests.
const baseEntry = {
  tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'good-choice',
  level: 'client', kind: 'referent', personRef: 'stefano', name: 'Stefano', role: 'Titolare',
  email: 'stefano@example.com', source: { kind: 'seed' },
  confirmedAt: '2026-10-22T10:00:00+02:00', version: 2, digest: 'a'.repeat(64),
};
const entries = [
  CompanyMapEntrySchema.parse(baseEntry),
  CompanyMapEntrySchema.parse({
    ...baseEntry, level: 'project', projectId: 'sito', personRef: 'mauro-project',
    name: 'Mauro', email: 'mauro@example.com', version: 3, digest: 'b'.repeat(64),
  }),
  CompanyMapEntrySchema.parse({
    ...baseEntry, level: 'business_unit', projectId: 'sito', buSlug: 'marketing',
    personRef: 'mauro-marketing', name: 'Mauro', email: 'mauro@example.com', version: 4, digest: 'c'.repeat(64),
  }),
];
const subject = companyMapConfirmationSetSubject(entries);
const request = DecisionRequestSchema.parse({
  requestId: 'req-0001', tenantId: 'tenant-1', organizationId: 'org-1', subject,
  question: 'Confermi tutti i referenti?', options: COMPANY_MAP_CONFIRM_OPTIONS,
  requestedBy: { managementAgentId: 'director', runtimeAgentId: 'agent-director', vaultAgentId: 7 },
  addressedTo: { ownerId: 'owner-1' }, channel: 'email', createdAt: '2026-10-20T10:00:00+02:00',
});
const approved = {
  requestId: request.requestId, outcome: 'approved' as const, optionId: 'confermo', subject,
  decidedBy: { kind: 'owner' as const, ownerId: 'owner-1' },
  decidedAt: '2026-10-20T11:00:00.000Z', channel: 'email' as const, sourceRef: 'email:msg-1',
};
const change = {
  personRef: 'lucia-marketing', name: 'Lucia', role: 'Responsabile marketing', email: 'lucia@example.com',
  level: 'business_unit' as const, buSlug: 'marketing', replaces: 'mauro-marketing',
};
const run = (reply: DecisionEmailReply, target: DecisionRequest = request) => decisionOutcomeFromEmailReply({
  request: target, reply, from: { ownerId: 'owner-1' }, receivedAt: approved.decidedAt, messageId: approved.sourceRef,
});

describe('confirmation sets', () => {
  it('A1 builds a stable set and rejects altered digest, planId and duplicate entries', () => {
    const canonical = [
      ['business_unit', 'sito', 'marketing', 'referent', 'mauro-marketing', 4, 'c'.repeat(64)],
      ['client', null, null, 'referent', 'stefano', 2, 'a'.repeat(64)],
      ['project', 'sito', null, 'referent', 'mauro-project', 3, 'b'.repeat(64)],
    ];
    const expectedDigest = createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
    expect(subject).toEqual({
      kind: 'confirmation_set', planId: 'mapset-' + expectedDigest.slice(0, 40), planVersion: 1,
      digest: expectedDigest, clientId: 'good-choice',
      entries: [
        { level: 'client', kind: 'referent', entryRef: 'stefano', entryVersion: 2, entryDigest: 'a'.repeat(64) },
        { level: 'project', projectId: 'sito', kind: 'referent', entryRef: 'mauro-project', entryVersion: 3, entryDigest: 'b'.repeat(64) },
        {
          level: 'business_unit', projectId: 'sito', buSlug: 'marketing', kind: 'referent',
          entryRef: 'mauro-marketing', entryVersion: 4, entryDigest: 'c'.repeat(64),
        },
      ],
    });
    expect(ConfirmationSetDecisionSubjectSchema.parse(subject)).toEqual(subject);
    expect(DecisionSubjectSchema.parse(subject)).toEqual(subject);
    expect(DecisionRequestSchema.parse(request)).toEqual(request);
    expect(companyMapConfirmationSetSubject([...entries].reverse()).digest).toBe(expectedDigest);
    expect(confirmationSetDigest([...subject.entries].reverse())).toBe(expectedDigest);
    // Keep the plan id consistent with the forged digest to isolate the digest check.
    const forgedDigest = 'f'.repeat(64);
    const forged = { ...subject, digest: forgedDigest, planId: 'mapset-' + forgedDigest.slice(0, 40) };
    expect(ConfirmationSetDecisionSubjectSchema.safeParse(forged).success).toBe(false);
    expect(DecisionSubjectSchema.safeParse(forged).success).toBe(false);
    expect(DecisionSubjectSchema.safeParse({ ...subject, planId: 'mapset-' + 'e'.repeat(40) }).success).toBe(false);
    const duplicates = [...subject.entries, { ...subject.entries[0]!, entryVersion: 99 }];
    const digest = confirmationSetDigest(duplicates);
    expect(DecisionSubjectSchema.safeParse({
      ...subject, entries: duplicates, digest, planId: 'mapset-' + digest.slice(0, 40),
    }).success).toBe(false);
    expect(() => companyMapConfirmationSetSubject([...entries, entries[0]!])).toThrow();
    expect(() => companyMapConfirmationSetSubject([entries[0]!, { ...entries[1]!, clientId: 'other-client' }])).toThrow();
  });

  it('A1 enforces bounds, strict entries and every map level scope rule', () => {
    expect(() => companyMapConfirmationSetSubject([])).toThrow();
    expect(DecisionSubjectSchema.safeParse({ ...subject, planVersion: 2 }).success).toBe(false);
    expect(DecisionSubjectSchema.safeParse({ ...subject, extra: true }).success).toBe(false);
    const client = subject.entries[0]!;
    const invalidEntries = [
      { ...client, projectId: 'sito' },
      { ...client, buSlug: 'marketing' },
      { ...client, level: 'project' },
      { ...client, level: 'project', projectId: 'sito', buSlug: 'marketing' },
      { ...client, level: 'business_unit', projectId: 'sito' },
      { ...client, level: 'business_unit', buSlug: 'marketing' },
      { ...client, level: 'other' },
      { ...client, kind: 'other' },
      { ...client, entryRef: '' },
      { ...client, entryVersion: 0 },
      { ...client, entryDigest: 'invalid' },
      { ...client, extra: true },
    ];
    for (const entry of invalidEntries) {
      expect(DecisionSubjectSchema.safeParse({ ...subject, entries: [entry] }).success).toBe(false);
    }
    // Valid, unique entries and matching hashes isolate the array bounds.
    for (const count of [1, 50, 51]) {
      const many = Array.from({ length: count }, (_, index) => ({ ...entries[0]!, personRef: `person-${index}` }));
      if (count <= 50) expect(companyMapConfirmationSetSubject(many).entries).toHaveLength(count);
      else expect(() => companyMapConfirmationSetSubject(many)).toThrow();
    }
  });

  it('A1 includes scope, kind, identity, version and fingerprint in the digest', () => {
    const entry = subject.entries[2]!;
    const digest = confirmationSetDigest([entry]);
    for (const different of [
      { ...entry, level: 'project' as const, buSlug: undefined },
      { ...entry, projectId: 'other-project' },
      { ...entry, buSlug: 'design' },
      { ...entry, kind: 'person' as const },
      { ...entry, entryRef: 'another-person' },
      { ...entry, entryVersion: entry.entryVersion + 1 },
      { ...entry, entryDigest: 'd'.repeat(64) },
    ]) expect(confirmationSetDigest([different])).not.toBe(digest);
    const mixedKinds = ['person', 'responsibility', 'asset', 'access'].map((kind) => CompanyMapAnyEntrySchema.parse({
      tenantId: baseEntry.tenantId, organizationId: baseEntry.organizationId, clientId: baseEntry.clientId,
      level: 'client', source: baseEntry.source, confirmedAt: baseEntry.confirmedAt,
      version: 1, digest: 'd'.repeat(64), kind,
      ...(kind === 'asset' ? { asset: { assetId: 'asset-01', assetType: 'document', version: 1, sha256: 'e'.repeat(64) } }
        : kind === 'access' ? { accessRef: 'access-01', provider: 'google', resource: 'calendar', holderAgentId: 'agent-director' }
          : kind === 'responsibility' ? { personRef: 'person-01', responsibility: 'Coordinates the project' }
            : { personRef: 'person-01', name: 'Person' }),
    }));
    expect(companyMapConfirmationSetSubject(mixedKinds).entries.map((entry) => entry.entryRef))
      .toEqual(['person-01', 'person-01', 'asset-01', 'access-01']);
  });

  it('A2 maps e-cambiato to rejected with its label and the complete subject', () => {
    expect(run({ kind: 'approve', requestId: request.requestId, optionId: 'e-cambiato' })).toEqual({
      ok: true, outcome: {
        requestId: request.requestId, outcome: 'rejected', reason: 'È cambiato', subject,
        decidedBy: approved.decidedBy, decidedAt: approved.decidedAt, channel: 'email', sourceRef: approved.sourceRef,
      },
    });
    expect(DecisionOutcomeSchema.safeParse({ ...approved, optionId: 'e-cambiato' }).success).toBe(false);
    const other = { ...request, options: [{ optionId: 'da-rivedere', label: 'Da rivedere' }] };
    expect(run({ kind: 'approve', requestId: request.requestId }, other)).toMatchObject({
      ok: true, outcome: { outcome: 'rejected', reason: 'Da rivedere', subject },
    });
    expect(run({ kind: 'refuse', requestId: request.requestId, reason: 'I referenti sono cambiati' })).toMatchObject({
      ok: true, outcome: { outcome: 'rejected', reason: 'I referenti sono cambiati', subject },
    });
  });

  it('A3 records confermo with referent changes and the replaced person', () => {
    const reply = DecisionEmailReplySchema.parse({
      kind: 'approve', requestId: request.requestId, optionId: 'confermo', referentChanges: [change],
    });
    expect(run(reply)).toEqual({ ok: true, outcome: { ...approved, referentChanges: [change] } });
    expect(run({ kind: 'approve', requestId: request.requestId, optionId: 'confermo' }))
      .toEqual({ ok: true, outcome: approved });
    expect(DecisionOutcomeSchema.parse({ ...approved, referentChanges: [change] }))
      .toEqual({ ...approved, referentChanges: [change] });
    const { replaces: _replaces, ...proposal } = change;
    expect(ActionPlanReferentProposalSchema.parse(proposal)).toEqual(proposal);
    expect(CompanyMapReferentChangeSchema.parse(proposal)).toEqual(proposal);
    for (const level of ['client', 'project'] as const) {
      const { buSlug: _buSlug, ...withoutBu } = proposal;
      expect(CompanyMapReferentChangeSchema.parse({ ...withoutBu, level })).toEqual({ ...withoutBu, level });
    }
    expect(CompanyMapReferentChangeSchema.safeParse({ ...change, replaces: 'bad/ref' }).success).toBe(false);
    expect(CompanyMapReferentChangeSchema.safeParse({ ...change, level: 'client' }).success).toBe(false);
    expect(CompanyMapReferentChangeSchema.safeParse({ ...change, buSlug: undefined }).success).toBe(false);
    expect(CompanyMapReferentChangeSchema.safeParse({ ...change, extra: true }).success).toBe(false);
    for (const count of [20, 21]) {
      const referentChanges = Array.from({ length: count }, () => change);
      expect(DecisionEmailReplySchema.safeParse({ ...reply, referentChanges }).success).toBe(count === 20);
      expect(DecisionOutcomeSchema.safeParse({ ...approved, referentChanges }).success).toBe(count === 20);
    }
  });

  it('A4 rejects referent changes outside a confirmed set', () => {
    const actionPlan = { kind: 'action_plan' as const, planId: 'plan-0001', planVersion: 1, digest: 'a'.repeat(64) };
    const reply = { kind: 'approve' as const, requestId: request.requestId, optionId: 'confermo', referentChanges: [change] };
    expect(run(reply, { ...request, subject: actionPlan })).toEqual({ ok: false, code: 'mismatch' });
    expect(run(reply, { ...request, subject: undefined })).toEqual({ ok: false, code: 'mismatch' });
    for (const otherSubject of [undefined, actionPlan, companyMapConfirmationSubject(entries[0]!)]) {
      expect(DecisionOutcomeSchema.safeParse({ ...approved, subject: otherSubject, referentChanges: [change] }).success).toBe(false);
      expect(DecisionOutcomeSchema.safeParse({ ...approved, subject: otherSubject, referentChanges: [] }).success).toBe(false);
    }
    expect(DecisionOutcomeSchema.safeParse({ ...approved, optionId: 'e-cambiato', referentChanges: [change] }).success).toBe(false);
    const { optionId: _optionId, ...base } = approved;
    expect(DecisionOutcomeSchema.safeParse({
      ...base, outcome: 'rejected', reason: 'È cambiato', referentChanges: [change],
    }).success).toBe(false);
    expect(DecisionEmailReplySchema.safeParse({ kind: 'refuse', requestId: request.requestId, reason: 'È cambiato', referentChanges: [change] }).success).toBe(false);
  });

  it('A5 preserves saved owner requests and outcomes without subject and with legacy plan subjects', () => {
    const { subject: _subject, ...unboundRequest } = request;
    const { subject: _outcomeSubject, ...unboundApproved } = approved;
    const { optionId: _optionId, ...unboundReceipt } = unboundApproved;
    const unboundRejected = { ...unboundReceipt, outcome: 'rejected' as const, reason: 'Costi troppo alti' };
    for (const requestId of ['dec_808f1712', 'dec_b8fb42d4', 'dec_147ec7d4', 'dec_a16ddb1a', 'dec_eee6594c']) {
      const saved = { ...unboundRequest, requestId };
      expect(DecisionRequestSchema.parse(saved)).toEqual(saved);
    }
    const subjects = [
      undefined,
      companyMapConfirmationSubject(entries[0]!),
      { kind: 'action_plan' as const, planId: 'plan-0001', planVersion: 1, digest: 'a'.repeat(64) },
      { kind: 'vertical_plan' as const, planId: 'plan-0001', planVersion: 1, digest: 'b'.repeat(64) },
    ];
    for (const legacySubject of subjects) {
      const legacyRequest = { ...unboundRequest, ...(legacySubject ? { subject: legacySubject } : {}) };
      expect(DecisionRequestSchema.parse(legacyRequest)).toEqual(legacyRequest);
      for (const answer of [unboundApproved, unboundRejected]) {
        const legacyOutcome = { ...answer, ...(legacySubject ? { subject: legacySubject } : {}) };
        expect(DecisionOutcomeSchema.parse(legacyOutcome)).toEqual(legacyOutcome);
        expect(decisionOutcomeMatchesSubject(legacyRequest, legacyOutcome)).toBe(true);
      }
      expect(run({ kind: 'approve', requestId: request.requestId, optionId: 'e-cambiato' }, legacyRequest))
        .toEqual({ ok: true, outcome: { ...unboundApproved, optionId: 'e-cambiato' } });
    }
  });

  it('A5 preserves the existing delivery request and outcomes', () => {
    const deliverySubject = {
      kind: 'delivery' as const, organizationId: 'org-acme', projectId: 'project-website', buSlug: 'design',
      deliveryRef: { assetId: 'asset-design-01', sha256: 'a'.repeat(64) },
    };
    const referent = { kind: 'referent' as const, email: 'Design.Lead@example.com' };
    const deliveryRequest = {
      requestId: 'delivery-364', tenantId: 'tenant-acme', organizationId: deliverySubject.organizationId,
      projectId: deliverySubject.projectId, subject: deliverySubject,
      question: 'Approve this exact design delivery?', options: [{ optionId: 'approve-delivery', label: 'Approve the delivery' }],
      requestedBy: { managementAgentId: 'design-lead', runtimeAgentId: 'agent-design', vaultAgentId: 17 },
      addressedTo: referent, channel: 'email' as const, createdAt: '2026-10-28T08:00:00Z',
    };
    const deliveryApproved = {
      requestId: deliveryRequest.requestId, subject: deliverySubject, decidedBy: referent,
      decidedAt: '2026-10-28T09:00:00+00:00', channel: 'email' as const, sourceRef: 'message-delivery-364',
      outcome: 'approved' as const, optionId: 'approve-delivery',
    };
    expect(DecisionRequestSchema.parse(deliveryRequest)).toEqual(deliveryRequest);
    expect(DecisionOutcomeSchema.parse(deliveryApproved)).toEqual(deliveryApproved);
    expect(decisionOutcomeFromEmailReply({
      request: deliveryRequest, reply: { kind: 'approve', requestId: deliveryRequest.requestId },
      from: { email: '  design.lead@EXAMPLE.COM  ' }, receivedAt: deliveryApproved.decidedAt, messageId: deliveryApproved.sourceRef,
    })).toEqual({ ok: true, outcome: deliveryApproved });
    expect(DecisionOutcomeSchema.safeParse({ ...deliveryApproved, referentChanges: [change] }).success).toBe(false);
  });

  it('A5 matches the same set and rejects a different set or missing subject', () => {
    expect(decisionOutcomeMatchesSubject(request, approved)).toBe(true);
    expect(decisionOutcomeMatchesSubject(request, { subject: companyMapConfirmationSetSubject([...entries].reverse()) })).toBe(true);
    const different = companyMapConfirmationSetSubject([{ ...entries[0]!, digest: 'd'.repeat(64) }, ...entries.slice(1)]);
    expect(decisionOutcomeMatchesSubject(request, { subject: different })).toBe(false);
    expect(decisionOutcomeMatchesSubject({ subject: different }, approved)).toBe(false);
    expect(decisionOutcomeMatchesSubject(request, {})).toBe(false);
    expect(decisionOutcomeMatchesSubject({}, approved)).toBe(false);
    expect(decisionOutcomeMatchesSubject(request, { subject: companyMapConfirmationSubject(entries[0]!) })).toBe(false);
    expect(DecisionRequestSchema.safeParse({ ...request, addressedTo: { kind: 'referent', email: change.email } }).success).toBe(false);
    expect(decisionOutcomeFromEmailReply({
      request, reply: { kind: 'approve', requestId: request.requestId, optionId: 'confermo' },
      from: { email: change.email }, receivedAt: approved.decidedAt, messageId: approved.sourceRef,
    })).toEqual({ ok: false, code: 'not_addressee' });
    expect(run({ kind: 'approve', requestId: request.requestId, optionId: 'unknown' })).toEqual({ ok: false, code: 'unknown_option' });
  });
});
