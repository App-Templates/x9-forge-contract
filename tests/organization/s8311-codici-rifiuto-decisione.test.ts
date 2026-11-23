import { describe, expect, it } from 'vitest';
import {
  COMPANY_MAP_CONFIRM_OPTIONS,
  CompanyMapEntrySchema,
  DecisionRequestSchema,
  ReferentReplyHandoverSchema,
  companyMapConfirmationSetSubject,
  decisionOutcomeFromEmailReply,
  decisionOutcomeFromHandover,
  type DecisionEmailReply,
  type DecisionEmailReplyRejection,
  type DecisionRequest,
} from '../../src/organization/index.js';

// Synthetic fixtures built with the real schemas; no production data.
const CREATED_AT = '2026-11-22T08:00:00Z';
const RECEIVED_AT = '2026-11-23T09:00:00+00:00';
const MESSAGE_ID = 'message-s8311';
const WORDS = 'Va bene così, ma sposta la data';
const NOTE = 'sposta la data';
const identity = { managementAgentId: 'director', runtimeAgentId: 'agent-director', vaultAgentId: 7 };
const referent = { kind: 'referent' as const, email: 'design.lead@example.com' };
const options = [
  { optionId: 'approve-it', label: 'Approve it', effect: 'approve' },
  { optionId: 'ask-changes', label: 'Ask for changes', effect: 'request_changes' },
] as const;
const planSubject = (kind: 'action_plan' | 'vertical_plan' | 'confirmation') => (
  { kind, planId: 'plan-0001', planVersion: 1, digest: 'b'.repeat(64) }
);
const deliverySubject = {
  kind: 'delivery' as const, organizationId: 'org-1', projectId: 'project-website', buSlug: 'design',
  deliveryRef: { assetId: 'asset-design-01', sha256: 'a'.repeat(64) },
};
const mapEntry = CompanyMapEntrySchema.parse({
  tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'good-choice',
  level: 'client', kind: 'referent', personRef: 'stefano', name: 'Stefano', role: 'Titolare',
  email: 'stefano@example.com', source: { kind: 'seed' },
  confirmedAt: '2026-10-22T10:00:00+02:00', version: 2, digest: 'a'.repeat(64),
});
const setSubject = companyMapConfirmationSetSubject([mapEntry]);
const change = {
  personRef: 'lucia-marketing', name: 'Lucia', role: 'Responsabile marketing', email: 'lucia@example.com',
  level: 'business_unit' as const, buSlug: 'marketing', replaces: 'mauro-marketing',
};

const makeRequest = (fields: Record<string, unknown>): DecisionRequest => DecisionRequestSchema.parse({
  requestId: 'req-s8311', tenantId: 'tenant-1', organizationId: 'org-1',
  question: 'Do you decide this?', options, requestedBy: identity,
  addressedTo: { ownerId: 'owner-1' }, channel: 'email', createdAt: CREATED_AT, ...fields,
});
const deliveryRequest = makeRequest({ subject: deliverySubject, projectId: deliverySubject.projectId, addressedTo: referent });
const rid = 'req-s8311';

interface Subject { name: string; request: DecisionRequest; from: { ownerId: string } | { email: string }; approveId: string }
const subjects: Subject[] = [
  ...(['action_plan', 'vertical_plan', 'confirmation'] as const).map((kind): Subject => ({
    name: kind, request: makeRequest({ subject: planSubject(kind) }), from: { ownerId: 'owner-1' }, approveId: 'approve-it',
  })),
  {
    name: 'confirmation_set', request: makeRequest({ subject: setSubject, options: COMPANY_MAP_CONFIRM_OPTIONS }),
    from: { ownerId: 'owner-1' }, approveId: 'confermo',
  },
  { name: 'delivery', request: deliveryRequest, from: { email: referent.email }, approveId: 'approve-it' },
  { name: 'no subject', request: makeRequest({}), from: { ownerId: 'owner-1' }, approveId: 'approve-it' },
];
const nonSet = subjects.filter((s) => s.name !== 'confirmation_set');

const email = (s: Subject, reply: DecisionEmailReply) => decisionOutcomeFromEmailReply({
  request: s.request, reply, from: s.from, receivedAt: RECEIVED_AT, messageId: MESSAGE_ID,
});
const rejected = (code: DecisionEmailReplyRejection) => ({ ok: false, code });

describe('s8311 request-id', () => {
  it.each(subjects)('$name: another request id is a mismatch for approve and refuse', (s) => {
    expect(email(s, { kind: 'approve', requestId: 'req-other', optionId: s.approveId })).toEqual(rejected('mismatch'));
    expect(email(s, { kind: 'refuse', requestId: 'req-other', reason: 'No' })).toEqual(rejected('mismatch'));
  });
});

describe('s8311 referent-changes', () => {
  it.each(nonSet)('$name: referent changes (even empty) outside a confirmation set', (s) => {
    for (const referentChanges of [[change], []]) {
      expect(email(s, { kind: 'approve', requestId: rid, optionId: s.approveId, referentChanges }))
        .toEqual(rejected('referent_changes_not_allowed'));
    }
  });
  it('confirmation_set: the changes with confermo are accepted', () => {
    const s = subjects.find((item) => item.name === 'confirmation_set')!;
    const result = email(s, { kind: 'approve', requestId: rid, optionId: 'confermo', referentChanges: [change] });
    expect(result).toMatchObject({ ok: true, outcome: { outcome: 'approved', optionId: 'confermo', referentChanges: [change] } });
  });
});

describe('s8311 note-without-words', () => {
  it.each(subjects)('$name: a note without the words', (s) => {
    expect(email(s, { kind: 'approve', requestId: rid, optionId: s.approveId, note: NOTE }))
      .toEqual(rejected('note_without_words'));
  });
  it.each(subjects)('$name: words, and words with a note, are accepted', (s) => {
    expect(email(s, { kind: 'approve', requestId: rid, optionId: s.approveId, referentWords: WORDS }).ok).toBe(true);
    expect(email(s, { kind: 'approve', requestId: rid, optionId: s.approveId, referentWords: WORDS, note: NOTE }).ok).toBe(true);
  });
});

describe('s8311 handover-codes', () => {
  const handover = ReferentReplyHandoverSchema.parse({
    tenantId: 'tenant-1', organizationId: 'org-1', projectId: 'project-website', toBuSlug: 'design',
    receivedBy: identity, referent, messageId: '<CAB123@mail.example>', receivedAt: RECEIVED_AT,
    text: 'va bene', requestId: rid,
  });
  const approve: DecisionEmailReply = { kind: 'approve', requestId: rid, optionId: 'approve-it', referentWords: WORDS, note: NOTE };
  const run = (request: DecisionRequest, over: Record<string, unknown>, reply: DecisionEmailReply = approve) => {
    const merged = { ...handover, ...over };
    for (const key of Object.keys(over)) if (over[key] === undefined) delete (merged as Record<string, unknown>)[key];
    return decisionOutcomeFromHandover({ request, reply, handover: ReferentReplyHandoverSchema.parse(merged) });
  };

  it('missing-request', () => {
    expect(run(deliveryRequest, { requestId: undefined })).toEqual(rejected('handover_request_missing'));
  });
  it('different-request', () => {
    expect(run(deliveryRequest, { requestId: 'req-other' })).toEqual(rejected('mismatch'));
  });
  it('tenant', () => {
    expect(run(deliveryRequest, { tenantId: 'tenant-2' })).toEqual(rejected('handover_tenant_mismatch'));
  });
  it('organization', () => {
    expect(run(deliveryRequest, { organizationId: 'org-2' })).toEqual(rejected('handover_organization_mismatch'));
  });
  it('project', () => {
    expect(run(deliveryRequest, { projectId: 'project-other' })).toEqual(rejected('handover_project_mismatch'));
  });
  it('subject', () => {
    for (const s of nonSet.filter((item) => item.name !== 'delivery')) {
      const request = makeRequest({ ...s.request, projectId: handover.projectId, subject: s.request.subject });
      expect(run(request, {})).toEqual(rejected('handover_subject_not_delivery'));
    }
    expect(run(makeRequest({ subject: setSubject, options: COMPANY_MAP_CONFIRM_OPTIONS, projectId: handover.projectId }), {}))
      .toEqual(rejected('handover_subject_not_delivery'));
  });
  it('business-unit', () => {
    expect(run(deliveryRequest, { toBuSlug: 'marketing' })).toEqual(rejected('handover_bu_mismatch'));
  });
  it('a valid handover keeps the words, the note and the receipt, and delegates the email rules', () => {
    expect(run(deliveryRequest, {})).toMatchObject({
      ok: true,
      outcome: { outcome: 'approved', optionId: 'approve-it', referentWords: WORDS, note: NOTE, sourceRef: '<CAB123@mail.example>', decidedBy: referent },
    });
    expect(run(deliveryRequest, { referent: { kind: 'referent', email: 'stranger@example.com' } })).toEqual(rejected('not_addressee'));
    expect(run(deliveryRequest, { receivedAt: '2026-11-21T09:00:00+00:00' })).toEqual(rejected('before_request'));
    expect(run(deliveryRequest, {}, { kind: 'unclear', requestId: rid, why: 'no_decision' })).toEqual(rejected('unclear'));
    expect(run(deliveryRequest, {}, { kind: 'approve', requestId: rid, referentWords: WORDS })).toEqual(rejected('option_required'));
    expect(run(deliveryRequest, {}, { ...approve, optionId: 'no-such-option' })).toEqual(rejected('unknown_option'));
  });
});

describe('s8311 precedence', () => {
  it('the handover comes before the email reply, and the first defect wins', () => {
    const handover = ReferentReplyHandoverSchema.parse({
      tenantId: 'tenant-1', organizationId: 'org-1', projectId: 'project-website', toBuSlug: 'design',
      receivedBy: identity, referent, messageId: 'm', receivedAt: RECEIVED_AT, text: 't', requestId: rid,
    });
    const run = (over: object, reply: DecisionEmailReply) => decisionOutcomeFromHandover({
      request: deliveryRequest, reply, handover: ReferentReplyHandoverSchema.parse({ ...handover, ...over }),
    });
    const bad: DecisionEmailReply = { kind: 'approve', requestId: 'req-other', optionId: 'approve-it', note: NOTE, referentChanges: [change] };
    expect(run({ tenantId: 'tenant-2', organizationId: 'org-2', projectId: 'p', toBuSlug: 'x' }, bad)).toEqual(rejected('handover_tenant_mismatch'));
    expect(run({ organizationId: 'org-2', projectId: 'p', toBuSlug: 'x' }, bad)).toEqual(rejected('handover_organization_mismatch'));
    expect(run({ projectId: 'p', toBuSlug: 'x' }, bad)).toEqual(rejected('handover_project_mismatch'));
    expect(run({ toBuSlug: 'x' }, bad)).toEqual(rejected('handover_bu_mismatch'));
    expect(run({}, bad)).toEqual(rejected('mismatch'));
  });
  it('email: request id, then changes, then note, then addressee, date and unclear', () => {
    const s = subjects.find((item) => item.name === 'action_plan')!;
    const both: DecisionEmailReply = { kind: 'approve', requestId: rid, optionId: 'approve-it', note: NOTE, referentChanges: [change] };
    expect(email(s, { ...both, requestId: 'req-other' })).toEqual(rejected('mismatch'));
    expect(email(s, both)).toEqual(rejected('referent_changes_not_allowed'));
    const { referentChanges: _changes, ...noteOnly } = both;
    const stranger = { ...s, from: { ownerId: 'owner-2' } };
    expect(email(stranger, noteOnly as DecisionEmailReply)).toEqual(rejected('note_without_words'));
    expect(email(stranger, { kind: 'approve', requestId: rid, optionId: 'approve-it' })).toEqual(rejected('not_addressee'));
  });
});

describe('s8311 additive', () => {
  it('the union admits the 6 old and the 8 new codes', () => {
    const all = [
      'mismatch', 'unclear', 'option_required', 'unknown_option', 'not_addressee', 'before_request',
      'referent_changes_not_allowed', 'note_without_words', 'handover_request_missing', 'handover_tenant_mismatch',
      'handover_organization_mismatch', 'handover_project_mismatch', 'handover_subject_not_delivery', 'handover_bu_mismatch',
    ] as const satisfies readonly DecisionEmailReplyRejection[];
    expect(new Set(all).size).toBe(14);
  });
  it('replies without words or note and valid replies of 8310 behave as before', () => {
    for (const s of subjects) {
      const result = email(s, { kind: 'approve', requestId: rid, optionId: s.approveId });
      expect(result).toMatchObject({ ok: true, outcome: { outcome: 'approved', optionId: s.approveId } });
      expect('referentWords' in (result as { outcome: object }).outcome).toBe(false);
    }
    const set = subjects.find((item) => item.name === 'confirmation_set')!;
    expect(email(set, { kind: 'approve', requestId: rid, optionId: 'e-cambiato', referentWords: WORDS }))
      .toMatchObject({ ok: true, outcome: { outcome: 'rejected', referentWords: WORDS } });
  });
});
