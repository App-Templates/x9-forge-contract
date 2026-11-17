import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AGENT_ROLES } from '../../src/organization/agent-role.js';
import {
  EMAIL_RECIPIENT_BASES,
  EMAIL_RECIPIENT_REFUSALS,
  EMAIL_RECIPIENT_ROLE_BASES,
  EMAIL_REFUSAL_CHANNELS,
  EmailRecipientFactsSchema,
  decideEmailRecipient,
} from '../../src/organization/email-recipient-policy.js';

// Stored seed and decision shapes from company-map.test.ts.
const referent = {
  tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'good-choice',
  level: 'client', kind: 'referent', personRef: 'stefano', name: 'Stefano',
  role: 'Titolare', email: 'stefano@example.com', source: { kind: 'seed' },
  confirmedAt: '2026-10-22T10:00:00+02:00', version: 2, digest: 'a'.repeat(64),
};
const addresses = {
  certified_referent: referent.email,
  brief_opener: 'opener@example.com',
  thread_referent_sender: 'sender@example.com',
  owner: 'owner@example.com',
};
const facts = {
  role: 'director', recipient: referent.email, referents: [referent],
  ownerAddresses: [addresses.owner], companyAgentAddresses: ['agent@example.com'],
  briefOpener: { address: addresses.brief_opener },
  threadSender: { address: addresses.thread_referent_sender, isCertifiedReferent: true },
};
const unavailable = { ok: false, refusal: 'recipient_check_unavailable', channels: [] };
const uncertified = { ok: false, refusal: 'recipient_not_certified', channels: [] };
const companyAgent = {
  ok: false, refusal: 'recipient_is_company_agent',
  channels: ['addressed_question', 'assigned_issue', 'child_issue_with_blockers'],
};
const expectedBases = {
  director: ['certified_referent', 'brief_opener', 'thread_referent_sender', 'owner'],
  'capo-bu': ['certified_referent', 'brief_opener', 'thread_referent_sender'],
  lab: ['thread_referent_sender'], ricerca: ['thread_referent_sender'],
};

describe('s7303 email recipient policy', () => {
  it('s7303 exposes closed bases, refusals and role/channel tables', () => {
    expect(EMAIL_RECIPIENT_BASES).toEqual(Object.keys(addresses));
    expect(EMAIL_RECIPIENT_REFUSALS).toEqual([
      'recipient_is_company_agent', 'recipient_not_certified', 'role_not_admitted', 'recipient_check_unavailable',
    ]);
    expect(EMAIL_RECIPIENT_ROLE_BASES).toEqual(expectedBases);
    expect(EMAIL_REFUSAL_CHANNELS).toEqual({
      recipient_is_company_agent: companyAgent.channels,
      recipient_not_certified: [], role_not_admitted: [], recipient_check_unavailable: [],
    });
  });

  for (const role of AGENT_ROLES) {
    for (const [basis, recipient] of Object.entries(addresses)) {
      it(`s7303 ${role} checks ${basis}`, () => {
        expect(decideEmailRecipient({ ...facts, role, recipient })).toEqual(
          expectedBases[role].includes(basis) ? { ok: true, basis } : uncertified,
        );
      });
    }
    it(`s7303 ${role} refuses a company agent with Paperclip channels`, () => {
      expect(decideEmailRecipient({ ...facts, role, recipient: 'Agent <AGENT@example.com>' })).toEqual(companyAgent);
    });
    it(`s7303 ${role} refuses an unknown address`, () => {
      expect(decideEmailRecipient({ ...facts, role, recipient: 'unknown@example.com' })).toEqual(uncertified);
    });
    it(`s7303 ${role} requires certification of the thread sender`, () => {
      expect(decideEmailRecipient({
        ...facts, role, recipient: addresses.thread_referent_sender,
        threadSender: { ...facts.threadSender, isCertifiedReferent: false },
      })).toEqual(uncertified);
    });
  }

  it.each([
    referent,
    { ...referent, source: { kind: 'decision', requestId: 'req-123456', planVersion: 1 }, supersedes: 1 },
  ])('s7303 accepts stored seed and decision referents: %j', (entry) => {
    expect(decideEmailRecipient({ ...facts, role: 'capo-bu', referents: [entry] }))
      .toEqual({ ok: true, basis: 'certified_referent' });
  });

  it('s7303 trusts caller scope rather than filtering a different client', () => {
    expect(decideEmailRecipient({ ...facts, referents: [{ ...referent, clientId: 'other-client' }] }))
      .toEqual({ ok: true, basis: 'certified_referent' });
  });

  it('s7303 rejects a person row even when its email is a company agent address', () => {
    expect(decideEmailRecipient({
      ...facts, companyAgentAddresses: [referent.email], referents: [{ ...referent, kind: 'person' }],
    })).toEqual(unavailable);
  });

  it('s7303 admits a certified referent also using a company agent mailbox', () => {
    expect(decideEmailRecipient({ ...facts, companyAgentAddresses: [referent.email] }))
      .toEqual({ ok: true, basis: 'certified_referent' });
    expect(decideEmailRecipient({ ...facts, companyAgentAddresses: [referent.email], referents: [] }))
      .toEqual(companyAgent);
  });

  it('s7303 admits the owner company mailbox only to the Director', () => {
    const input = { ...facts, recipient: addresses.owner, companyAgentAddresses: [addresses.owner] };
    expect(decideEmailRecipient(input)).toEqual({ ok: true, basis: 'owner' });
    expect(decideEmailRecipient({ ...input, role: 'capo-bu' })).toEqual(companyAgent);
  });

  it('s7303 applies the documented basis precedence', () => {
    const input = {
      ...facts, ownerAddresses: [referent.email], briefOpener: { address: referent.email },
      threadSender: { address: referent.email, isCertifiedReferent: true },
    };
    expect(decideEmailRecipient(input)).toEqual({ ok: true, basis: 'owner' });
    expect(decideEmailRecipient({ ...input, ownerAddresses: [] })).toEqual({ ok: true, basis: 'certified_referent' });
    expect(decideEmailRecipient({ ...input, ownerAddresses: [], referents: [] }))
      .toEqual({ ok: true, basis: 'brief_opener' });
  });

  it('s7303 normalizes recipient and all address facts consistently', () => {
    expect(EmailRecipientFactsSchema.parse({ ...facts, recipient: 'Stefano <STEFANO@EXAMPLE.COM>' }).recipient)
      .toBe(referent.email);
    for (const [basis, recipient] of Object.entries(addresses)) {
      expect(decideEmailRecipient({
        ...facts, recipient: `Name <${recipient.toUpperCase()}>`,
        referents: [{ ...referent, email: referent.email.toUpperCase() }],
        ownerAddresses: [`Owner <${addresses.owner.toUpperCase()}>`],
        briefOpener: { address: `Opener <${addresses.brief_opener.toUpperCase()}>` },
        threadSender: { address: `Sender <${addresses.thread_referent_sender.toUpperCase()}>`, isCertifiedReferent: true },
      })).toEqual({ ok: true, basis });
    }
  });

  it('s7303 allows omitted optional brief and thread facts', () => {
    const { briefOpener: _brief, threadSender: _thread, ...input } = facts;
    expect(decideEmailRecipient(input)).toEqual({ ok: true, basis: 'certified_referent' });
  });

  it('s7303 refuses a role whose admission table has no bases', () => {
    const original = EMAIL_RECIPIENT_ROLE_BASES.lab;
    try {
      EMAIL_RECIPIENT_ROLE_BASES.lab = [];
      expect(decideEmailRecipient({ ...facts, role: 'lab', recipient: addresses.thread_referent_sender }))
        .toEqual({ ok: false, refusal: 'role_not_admitted', channels: [] });
    } finally {
      EMAIL_RECIPIENT_ROLE_BASES.lab = original;
    }
  });

  it.each([
    null, {}, { ...facts, role: 'specialista' }, { ...facts, recipient: 'invalid' },
    { ...facts, referents: undefined }, { ...facts, ownerAddresses: undefined },
    { ...facts, companyAgentAddresses: undefined }, { ...facts, extra: true },
    { ...facts, briefOpener: { address: 'invalid' } },
    { ...facts, briefOpener: { ...facts.briefOpener, extra: true } },
    { ...facts, threadSender: { address: addresses.thread_referent_sender } },
    { ...facts, threadSender: { ...facts.threadSender, extra: true } },
    { ...facts, referents: [{ ...referent, source: { kind: 'model' } }] },
  ])('s7303 refuses invalid or unavailable facts without throwing: %j', (input) => {
    expect(decideEmailRecipient(input)).toEqual(unavailable);
  });

  it('s7303 does not read settings, time or network', () => {
    const source = readFileSync(new URL('../../src/organization/email-recipient-policy.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/process\.env|Date|fetch/);
  });
});
