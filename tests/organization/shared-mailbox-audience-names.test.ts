import { describe, expect, it } from 'vitest';
import {
  BUSINESS_UNIT_LEADS_MAILBOX_AUDIENCE,
  DIRECTORS_MAILBOX_AUDIENCE,
  SHARED_MAILBOX_AUDIENCES,
  SharedMailboxAudienceSchema,
  SharedMailboxSchema,
  sharedMailboxAudience,
} from '../../src/organization/shared-mailbox.js';

const base = {
  mailboxId: 'mailbox-1',
  tenantId: '1',
  companyId: 'good-choice',
  providerInboxId: 'inbox-1',
  address: 'company@example.com',
  holders: [{ agentId: 'director-good-choice', label: 'Director', displayName: 'Director Good Choice' }],
  defaultAgentId: 'director-good-choice',
};

describe('s6732 casella-condivisa-pubblici-con-nome: named mailbox audiences', () => {
  it('(a) constants hold the saved texts and build the list in order', () => {
    expect(BUSINESS_UNIT_LEADS_MAILBOX_AUDIENCE).toBe('business_unit_leads');
    expect(DIRECTORS_MAILBOX_AUDIENCE).toBe('directors');
    expect(SHARED_MAILBOX_AUDIENCES).toEqual([BUSINESS_UNIT_LEADS_MAILBOX_AUDIENCE, DIRECTORS_MAILBOX_AUDIENCE]);
    expect(SharedMailboxAudienceSchema.options).toEqual(['business_unit_leads', 'directors']);
  });

  it('(b) an absent audience means the business unit leads', () => {
    expect(sharedMailboxAudience({})).toBe('business_unit_leads');
    expect(sharedMailboxAudience({ audience: 'directors' })).toBe('directors');
    expect(sharedMailboxAudience({ audience: 'business_unit_leads' })).toBe('business_unit_leads');
  });

  it('(c) holders are counted per named audience', () => {
    expect(SharedMailboxSchema.safeParse({ ...base, audience: DIRECTORS_MAILBOX_AUDIENCE }).success).toBe(true);
    expect(SharedMailboxSchema.safeParse({ ...base, audience: BUSINESS_UNIT_LEADS_MAILBOX_AUDIENCE }).success).toBe(false);
    expect(SharedMailboxSchema.safeParse(base).success).toBe(false);
    expect(SharedMailboxSchema.safeParse({ ...base, audience: 'other' }).success).toBe(false);
  });
});
