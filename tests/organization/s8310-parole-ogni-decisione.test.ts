import { describe, expect, it } from 'vitest';
import {
  COMPANY_MAP_CONFIRM_OPTIONS,
  CompanyMapEntrySchema,
  DecisionEmailReplySchema,
  DecisionOutcomeSchema,
  DecisionRequestSchema,
  REFERENT_WORDS_MAX,
  companyMapConfirmationSetSubject,
  decisionOutcomeFromEmailReply,
  type DecisionEmailReply,
  type DecisionOutcome,
  type DecisionRequest,
} from '../../src/organization/index.js';

// Synthetic fixtures built with the real schemas and helpers; no production data.
const WORDS = 'Va bene così,\n\tma  sposta la data di una settimana ✓ ';
const NOTE = 'sposta la data di una settimana';
const REFUSAL_WORDS = 'Non adesso: le date sono sbagliate.\nGrazie';
const CREATED_AT = '2026-11-22T08:00:00Z';
const RECEIVED_AT = '2026-11-23T09:00:00+00:00';
const MESSAGE_ID = 'message-s8310';
const identity = { managementAgentId: 'director', runtimeAgentId: 'agent-director', vaultAgentId: 7 };
const owner = { kind: 'owner' as const, ownerId: 'owner-1' };
const referent = { kind: 'referent' as const, email: 'design.lead@example.com' };
const effectOptions = [
  { optionId: 'approve-it', label: 'Approve it', effect: 'approve' },
  { optionId: 'ask-changes', label: 'Ask for changes', effect: 'request_changes' },
  { optionId: 'drop-it', label: 'Drop it now', effect: 'reject' },
] as const;

const planSubject = (kind: 'action_plan' | 'vertical_plan' | 'confirmation') => (
  { kind, planId: 'plan-0001', planVersion: 1, digest: 'b'.repeat(64) }
);
const deliverySubject = {
  kind: 'delivery' as const,
  organizationId: 'org-1',
  projectId: 'project-website',
  buSlug: 'design',
  deliveryRef: { assetId: 'asset-design-01', sha256: 'a'.repeat(64) },
};
const mapEntry = CompanyMapEntrySchema.parse({
  tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'good-choice',
  level: 'client', kind: 'referent', personRef: 'stefano', name: 'Stefano', role: 'Titolare',
  email: 'stefano@example.com', source: { kind: 'seed' },
  confirmedAt: '2026-10-22T10:00:00+02:00', version: 2, digest: 'a'.repeat(64),
});
const setSubject = companyMapConfirmationSetSubject([mapEntry]);

const makeRequest = (fields: Record<string, unknown>): DecisionRequest => DecisionRequestSchema.parse({
  requestId: 'req-s8310', tenantId: 'tenant-1', organizationId: 'org-1',
  question: 'Do you decide this?', options: effectOptions, requestedBy: identity,
  addressedTo: { ownerId: 'owner-1' }, channel: 'email', createdAt: CREATED_AT, ...fields,
});

interface Case {
  name: string;
  request: DecisionRequest;
  from: { ownerId: string } | { email: string };
  decidedBy: typeof owner | typeof referent;
  approveId: string;
  hasSubject: boolean;
}
const ownerFrom = { ownerId: 'owner-1' };
const cases: Case[] = [
  ...(['action_plan', 'vertical_plan', 'confirmation'] as const).map((kind): Case => ({
    name: kind, request: makeRequest({ subject: planSubject(kind) }), from: ownerFrom,
    decidedBy: owner, approveId: 'approve-it', hasSubject: false,
  })),
  {
    name: 'confirmation_set',
    request: makeRequest({ subject: setSubject, options: COMPANY_MAP_CONFIRM_OPTIONS }),
    from: ownerFrom, decidedBy: owner, approveId: 'confermo', hasSubject: true,
  },
  {
    name: 'delivery',
    request: makeRequest({
      subject: deliverySubject, projectId: deliverySubject.projectId, addressedTo: referent,
    }),
    from: { email: 'design.lead@example.com' }, decidedBy: referent, approveId: 'approve-it', hasSubject: true,
  },
  { name: 'no subject', request: makeRequest({}), from: ownerFrom, decidedBy: owner, approveId: 'approve-it', hasSubject: false },
];

const run = (c: Case, reply: DecisionEmailReply, over: Partial<{ request: DecisionRequest; from: Case['from']; receivedAt: string }> = {}) =>
  decisionOutcomeFromEmailReply({
    request: over.request ?? c.request, reply, from: over.from ?? c.from,
    receivedAt: over.receivedAt ?? RECEIVED_AT, messageId: MESSAGE_ID,
  });
const okOutcome = (result: ReturnType<typeof run>): DecisionOutcome => {
  if (!result.ok) throw new Error('expected an accepted reply, got ' + result.code);
  return result.outcome;
};
const without = <T extends object>(value: T, ...keys: string[]) => Object.fromEntries(
  Object.entries(value).filter(([key]) => !keys.includes(key)),
);

describe('s8310 all-subjects', () => {
  describe.each(cases)('$name', (c) => {
    const rid = c.request.requestId;

    it('approve keeps the referent words next to the unchanged option', () => {
      const reply = DecisionEmailReplySchema.parse({ kind: 'approve', requestId: rid, optionId: c.approveId, referentWords: WORDS });
      expect(reply).toEqual({ kind: 'approve', requestId: rid, optionId: c.approveId, referentWords: WORDS });
      const outcome = okOutcome(run(c, reply));
      expect(outcome).toMatchObject({ outcome: 'approved', optionId: c.approveId, referentWords: WORDS });
      expect(outcome.referentWords).toBe(WORDS);
      expect('note' in outcome).toBe(false);
      expect(DecisionOutcomeSchema.parse(outcome)).toEqual(outcome);
      // Same outcome as the reply without words, plus the words only.
      const before = okOutcome(run(c, { kind: 'approve', requestId: rid, optionId: c.approveId }));
      expect(without(outcome, 'referentWords')).toEqual(before);
      expect(Object.keys(before)).not.toContain('referentWords');
    });

    it('approve keeps words and note', () => {
      const reply = DecisionEmailReplySchema.parse({
        kind: 'approve', requestId: rid, optionId: c.approveId, referentWords: WORDS, note: NOTE,
      });
      const outcome = okOutcome(run(c, reply));
      expect(outcome).toMatchObject({ outcome: 'approved', optionId: c.approveId });
      expect((outcome as { note?: string }).note).toBe(NOTE);
      expect(outcome.referentWords).toBe(WORDS);
      expect(DecisionOutcomeSchema.parse(outcome)).toEqual(outcome);
      const before = okOutcome(run(c, { kind: 'approve', requestId: rid, optionId: c.approveId }));
      expect(without(outcome, 'referentWords', 'note')).toEqual(before);
    });

    it('refuse keeps the words and the lead reason', () => {
      const reply = DecisionEmailReplySchema.parse({
        kind: 'refuse', requestId: rid, reason: 'Dates are wrong', referentWords: REFUSAL_WORDS,
      });
      const outcome = okOutcome(run(c, reply));
      expect(outcome).toMatchObject({ outcome: 'rejected', reason: 'Dates are wrong', referentWords: REFUSAL_WORDS });
      expect(outcome.referentWords).toBe(REFUSAL_WORDS);
      expect(DecisionOutcomeSchema.parse(outcome)).toEqual(outcome);
      const before = okOutcome(run(c, { kind: 'refuse', requestId: rid, reason: 'Dates are wrong' }));
      expect(without(outcome, 'referentWords')).toEqual(before);
    });
  });

  it('request_changes and reject options keep the label as reason and the words apart', () => {
    for (const c of cases.filter((item) => item.name !== 'confirmation_set')) {
      for (const [optionId, label] of [['ask-changes', 'Ask for changes'], ['drop-it', 'Drop it now']] as const) {
        const outcome = okOutcome(run(c, { kind: 'approve', requestId: c.request.requestId, optionId, referentWords: WORDS }));
        expect(outcome).toMatchObject({ outcome: 'rejected', reason: label, referentWords: WORDS });
        expect(outcome.referentWords).not.toBe(label);
        expect('optionId' in outcome).toBe(false);
        expect(DecisionOutcomeSchema.parse(outcome)).toEqual(outcome);
      }
    }
  });

  it('confirmation_set: confermo with referent changes and words, e-cambiato stays rejected', () => {
    const c = cases.find((item) => item.name === 'confirmation_set')!;
    const change = {
      personRef: 'lucia-marketing', name: 'Lucia', role: 'Responsabile marketing', email: 'lucia@example.com',
      level: 'business_unit' as const, buSlug: 'marketing', replaces: 'mauro-marketing',
    };
    const confirmed = okOutcome(run(c, DecisionEmailReplySchema.parse({
      kind: 'approve', requestId: c.request.requestId, optionId: 'confermo', referentChanges: [change], referentWords: WORDS, note: NOTE,
    })));
    expect(confirmed).toMatchObject({
      outcome: 'approved', optionId: 'confermo', referentChanges: [change], referentWords: WORDS, subject: setSubject,
    });
    expect((confirmed as { note?: string }).note).toBe(NOTE);
    expect(DecisionOutcomeSchema.parse(confirmed)).toEqual(confirmed);
    const changed = okOutcome(run(c, { kind: 'approve', requestId: c.request.requestId, optionId: 'e-cambiato', referentWords: WORDS }));
    expect(changed).toMatchObject({ outcome: 'rejected', reason: 'È cambiato', referentWords: WORDS, subject: setSubject });
    expect(DecisionOutcomeSchema.parse(changed)).toEqual(changed);
  });

  it('a saved-shape outcome with words and a note parses for every subject', () => {
    for (const c of cases) {
      const common = {
        requestId: c.request.requestId, decidedBy: c.decidedBy, decidedAt: RECEIVED_AT,
        channel: 'email', sourceRef: MESSAGE_ID, ...(c.request.subject !== undefined ? { subject: c.request.subject } : {}),
      };
      const approved = { ...common, outcome: 'approved', optionId: c.approveId, referentWords: WORDS, note: NOTE };
      const rejected = { ...common, outcome: 'rejected', reason: 'Dates are wrong', referentWords: REFUSAL_WORDS };
      expect(DecisionOutcomeSchema.parse(approved)).toEqual(approved);
      expect(DecisionOutcomeSchema.parse(rejected)).toEqual(rejected);
    }
  });
});

describe('s8310 saved-shapes', () => {
  const savedOutcomes = (c: Case, channel: string = 'email') => {
    const common = {
      requestId: c.request.requestId, decidedBy: c.decidedBy, decidedAt: RECEIVED_AT,
      channel, sourceRef: MESSAGE_ID, ...(c.request.subject !== undefined ? { subject: c.request.subject } : {}),
    };
    return [
      { ...common, outcome: 'approved', optionId: c.approveId },
      { ...common, outcome: 'rejected', reason: 'Ask for changes' },
    ];
  };

  it.each(cases)('$name: requests and outcomes without the new fields parse deeply equal', (c) => {
    expect(DecisionRequestSchema.parse(c.request)).toEqual(c.request);
    expect(DecisionRequestSchema.parse(JSON.parse(JSON.stringify(c.request)))).toEqual(c.request);
    for (const outcome of savedOutcomes(c)) {
      const parsed = DecisionOutcomeSchema.parse(outcome);
      expect(parsed).toEqual(outcome);
      expect('referentWords' in parsed).toBe(false);
      expect('note' in parsed).toBe(false);
    }
  });

  it('non-delivery subjects keep the three channels', () => {
    for (const c of cases.filter((item) => item.name !== 'delivery')) {
      for (const channel of ['email', 'x9_conversation', 'forge_panel']) {
        const request = { ...c.request, channel };
        expect(DecisionRequestSchema.parse(request)).toEqual(request);
        for (const outcome of savedOutcomes(c, channel)) expect(DecisionOutcomeSchema.parse(outcome)).toEqual(outcome);
      }
    }
  });

  it('delivery keeps assetVersion, assetVersions and the package-only form', () => {
    const c = cases.find((item) => item.name === 'delivery')!;
    const versions = [{ key: 'home-page', version: 2 }, { key: 'about-page', version: 1 }];
    for (const extra of [{}, { assetVersion: versions[0] }, { assetVersions: versions }]) {
      const subject = { ...deliverySubject, ...extra };
      const request = makeRequest({ subject, projectId: deliverySubject.projectId, addressedTo: referent });
      expect(DecisionRequestSchema.parse(request)).toEqual(request);
      const outcome = { ...savedOutcomes(c)[0]!, subject };
      expect(DecisionOutcomeSchema.parse(outcome)).toEqual(outcome);
      // The reply still rebuilds the outcome with the same subject.
      expect(okOutcome(run(c, { kind: 'approve', requestId: request.requestId, optionId: 'approve-it' }, { request })))
        .toEqual(outcome);
    }
  });

  it('keeps the shape without subject and without optional fields', () => {
    const c = cases.find((item) => item.name === 'no subject')!;
    const minimal = {
      requestId: 'req-s8310', decidedBy: owner, decidedAt: RECEIVED_AT, channel: 'email',
      sourceRef: MESSAGE_ID, outcome: 'approved', optionId: 'approve-it',
    };
    expect(DecisionOutcomeSchema.parse(minimal)).toEqual(minimal);
    expect(okOutcome(run(c, { kind: 'approve', requestId: 'req-s8310', optionId: 'approve-it' }))).toEqual(minimal);
  });

  it('an old delivery note whose text differs from the words stays parseable (authenticity is not a bridge rule)', () => {
    const c = cases.find((item) => item.name === 'delivery')!;
    const old = { ...savedOutcomes(c)[0]!, referentWords: 'Sounds good to me', note: 'make the logo larger' };
    expect(DecisionOutcomeSchema.parse(old)).toEqual(old);
    expect(okOutcome(run(c, {
      kind: 'approve', requestId: c.request.requestId, optionId: 'approve-it', referentWords: 'Sounds good to me', note: 'make the logo larger',
    }))).toMatchObject({ outcome: 'approved', referentWords: 'Sounds good to me', note: 'make the logo larger' });
  });
});

describe('s8310 existing-guards', () => {
  it.each(cases)('$name: a note without words is refused by the function and by the parse', (c) => {
    expect(run(c, { kind: 'approve', requestId: c.request.requestId, optionId: c.approveId, note: NOTE }))
      .toEqual({ ok: false, code: 'note_without_words' });
    const outcome = {
      requestId: c.request.requestId, decidedBy: c.decidedBy, decidedAt: RECEIVED_AT, channel: 'email',
      sourceRef: MESSAGE_ID, outcome: 'approved', optionId: c.approveId, note: NOTE,
      ...(c.request.subject !== undefined ? { subject: c.request.subject } : {}),
    };
    const parsed = DecisionOutcomeSchema.safeParse(outcome);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((issue) => issue.message)).toContain('A note must sit inside the referent words');
    expect(DecisionOutcomeSchema.safeParse({ ...outcome, referentWords: WORDS }).success).toBe(true);
  });

  it.each(cases)('$name: words and note limits', (c) => {
    const rid = c.request.requestId;
    const base = { kind: 'approve', requestId: rid, optionId: c.approveId };
    const outcomeOf = (extra: object) => ({
      requestId: rid, decidedBy: c.decidedBy, decidedAt: RECEIVED_AT, channel: 'email', sourceRef: MESSAGE_ID,
      outcome: 'approved', optionId: c.approveId, ...(c.request.subject !== undefined ? { subject: c.request.subject } : {}), ...extra,
    });
    expect(REFERENT_WORDS_MAX).toBe(2000);
    for (const [words, valid] of [['x', true], ['x'.repeat(2000), true], ['', false], ['x'.repeat(2001), false]] as const) {
      expect(DecisionEmailReplySchema.safeParse({ ...base, referentWords: words }).success).toBe(valid);
      expect(DecisionOutcomeSchema.safeParse(outcomeOf({ referentWords: words })).success).toBe(valid);
    }
    for (const [note, valid] of [['abc', true], ['n'.repeat(2000), true], ['ab', false], ['n'.repeat(2001), false]] as const) {
      const words = 'w'.repeat(2000);
      expect(DecisionEmailReplySchema.safeParse({ ...base, referentWords: words, note }).success).toBe(valid);
      expect(DecisionOutcomeSchema.safeParse(outcomeOf({ referentWords: words, note })).success).toBe(valid);
    }
  });

  it.each(cases)('$name: identity, date, option and unclear guards are unchanged', (c) => {
    const rid = c.request.requestId;
    const approve = { kind: 'approve' as const, requestId: rid, optionId: c.approveId, referentWords: WORDS };
    expect(run(c, { ...approve, requestId: 'req-other-s8310' })).toEqual({ ok: false, code: 'mismatch' });
    const stranger = 'email' in c.from ? { email: 'stranger@example.com' } : { ownerId: 'owner-2' };
    expect(run(c, approve, { from: stranger })).toEqual({ ok: false, code: 'not_addressee' });
    const wrongKind = 'email' in c.from ? { ownerId: 'owner-1' } : { email: 'design.lead@example.com' };
    expect(run(c, approve, { from: wrongKind })).toEqual({ ok: false, code: 'not_addressee' });
    expect(run(c, approve, { receivedAt: '2026-11-21T09:00:00+00:00' })).toEqual({ ok: false, code: 'before_request' });
    expect(run(c, { ...approve, optionId: 'no-such-option' })).toEqual({ ok: false, code: 'unknown_option' });
    expect(run(c, { kind: 'unclear', requestId: rid, why: 'no_decision' })).toEqual({ ok: false, code: 'unclear' });
    // Referent changes still belong to a confirmed set only.
    const change = { personRef: 'lucia', name: 'Lucia', role: 'Lead', email: 'lucia@example.com', level: 'client' as const };
    expect(run(c, { ...approve, referentChanges: [change] }).ok).toBe(c.name === 'confirmation_set');
    if (c.request.options.length > 1) {
      expect(run(c, { kind: 'approve', requestId: rid, referentWords: WORDS })).toEqual({ ok: false, code: 'option_required' });
    }
  });

  it('the delivery receipt rules and the owner rule for the others stay in the parse', () => {
    const delivery = cases.find((item) => item.name === 'delivery')!;
    const others = cases.filter((item) => item.name !== 'delivery');
    const outcomeOf = (c: Case, extra: object) => ({
      requestId: c.request.requestId, decidedBy: c.decidedBy, decidedAt: RECEIVED_AT, channel: 'email', sourceRef: MESSAGE_ID,
      outcome: 'approved', optionId: c.approveId, referentWords: WORDS,
      ...(c.request.subject !== undefined ? { subject: c.request.subject } : {}), ...extra,
    });
    expect(DecisionOutcomeSchema.safeParse(outcomeOf(delivery, { decidedBy: owner })).success).toBe(false);
    expect(DecisionOutcomeSchema.safeParse(outcomeOf(delivery, { channel: 'x9_conversation' })).success).toBe(false);
    expect(DecisionOutcomeSchema.safeParse(outcomeOf(delivery, { sourceRef: '   ' })).success).toBe(false);
    for (const c of others) {
      expect(DecisionOutcomeSchema.safeParse(outcomeOf(c, { decidedBy: referent })).success).toBe(false);
    }
    expect(DecisionOutcomeSchema.safeParse(outcomeOf(
      cases.find((item) => item.name === 'confirmation_set')!, { optionId: 'e-cambiato' },
    )).success).toBe(false);
  });
});
