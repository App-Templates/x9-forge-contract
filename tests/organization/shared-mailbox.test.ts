import { describe, expect, it } from 'vitest';
import { AgentIdSchema } from '../../src/agent/agent-identity.js';
import { AgentEmailInboxSchema } from '../../src/messaging/agent-email-inbox.js';
import { BusinessUnitLeadBirthRequestSchema } from '../../src/organization/business-unit-lead.js';
import {
  SHARED_MAILBOX_ROUTE_VIAS,
  SharedMailboxHolderSchema,
  SharedMailboxLabelSchema,
  SharedMailboxSchema,
  SharedMailboxThreadSchema,
  parseSharedMailboxSubjectLabel,
  routeSharedMailboxMessage,
} from '../../src/organization/shared-mailbox.js';

const mailbox = SharedMailboxSchema.parse({
  mailboxId: 'mailbox-1',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  providerInboxId: 'inbox-1',
  address: 'company@example.com',
  holders: [
    { agentId: 'director', label: 'Director', displayName: 'Company Director' },
    { agentId: 'design-lead', label: 'Design', displayName: 'Design Lead' },
  ],
  defaultAgentId: 'director',
});
const thread = SharedMailboxThreadSchema.parse({
  mailboxId: mailbox.mailboxId,
  providerThreadId: 'thread-1',
  agentId: 'director',
  openedAt: '2026-10-20T21:00:00+02:00',
});

describe('SharedMailboxSchema', () => {
  it('accepts a valid shared company mailbox', () => {
    expect(SharedMailboxSchema.parse(mailbox)).toEqual(mailbox);
  });

  it('reuses canonical agent, company and provider identifiers', () => {
    expect(SharedMailboxHolderSchema.shape.agentId).toBe(AgentIdSchema);
    expect(SharedMailboxSchema.shape.defaultAgentId).toBe(AgentIdSchema);
    expect(SharedMailboxSchema.shape.companyId).toBe(BusinessUnitLeadBirthRequestSchema.shape.company.shape.companyId);
    expect(SharedMailboxSchema.shape.providerInboxId).toBe(AgentEmailInboxSchema.shape.provider_inbox_id);
    expect(SHARED_MAILBOX_ROUTE_VIAS).toEqual(['thread', 'label', 'default']);
  });

  it('rejects a default agent that is not a holder', () => {
    expect(SharedMailboxSchema.safeParse({ ...mailbox, defaultAgentId: 'outsider' }).success).toBe(false);
  });

  it('rejects duplicate labels ignoring case', () => {
    expect(SharedMailboxSchema.safeParse({
      ...mailbox,
      holders: [
        { ...mailbox.holders[0], label: 'Design' },
        { ...mailbox.holders[1], label: 'design' },
      ],
    }).success).toBe(false);
  });

  it('rejects duplicate holder agent IDs', () => {
    expect(SharedMailboxSchema.safeParse({
      ...mailbox,
      holders: mailbox.holders.map((holder) => ({ ...holder, agentId: mailbox.defaultAgentId })),
    }).success).toBe(false);
  });

  it('rejects a single holder and more than fifty holders', () => {
    expect(SharedMailboxSchema.safeParse({ ...mailbox, holders: [mailbox.holders[0]] }).success).toBe(false);
    expect(SharedMailboxSchema.safeParse({
      ...mailbox,
      holders: Array.from({ length: 51 }, (_, index) => ({
        agentId: index === 0 ? 'director' : `agent-${index}`,
        label: `Team ${index}`, displayName: `Lead ${index}`,
      })),
    }).success).toBe(false);
  });

  it('rejects extra keys on mailbox, holder and thread', () => {
    expect(SharedMailboxSchema.safeParse({ ...mailbox, extra: true }).success).toBe(false);
    expect(SharedMailboxHolderSchema.safeParse({ ...mailbox.holders[0], extra: true }).success).toBe(false);
    expect(SharedMailboxThreadSchema.safeParse({ ...thread, extra: true }).success).toBe(false);
  });

  it.each([
    { mailboxId: '' }, { mailboxId: 'x'.repeat(129) }, { tenantId: '' },
    { companyId: '' }, { companyId: 'x'.repeat(65) },
    { providerInboxId: '' }, { providerInboxId: 'x'.repeat(201) },
    { address: 'invalid' }, { defaultAgentId: '' },
  ])('rejects invalid mailbox fields: %j', (fields) => {
    expect(SharedMailboxSchema.safeParse({ ...mailbox, ...fields }).success).toBe(false);
  });

  it.each(['', '-Design', ' Design', 'Design!', 'x'.repeat(41)])('rejects invalid labels: %s', (label) => {
    expect(SharedMailboxLabelSchema.safeParse(label).success).toBe(false);
  });

  it.each(['Design', 'Ricerca e sviluppo', 'Équipe-2', '设计'])('accepts valid Unicode labels: %s', (label) => {
    expect(SharedMailboxLabelSchema.parse(label)).toBe(label);
  });

  it.each([{ agentId: '' }, { displayName: '' }, { displayName: 'x'.repeat(121) }])(
    'rejects invalid holder fields: %j', (fields) => {
      expect(SharedMailboxHolderSchema.safeParse({ ...mailbox.holders[0], ...fields }).success).toBe(false);
    },
  );
});

describe('SharedMailboxThreadSchema', () => {
  it('accepts a registered thread', () => {
    expect(SharedMailboxThreadSchema.parse(thread)).toEqual(thread);
  });

  it('rejects a thread without providerThreadId', () => {
    expect(SharedMailboxThreadSchema.safeParse({
      mailboxId: thread.mailboxId, agentId: thread.agentId, openedAt: thread.openedAt,
    }).success).toBe(false);
  });

  it.each([
    { mailboxId: '' }, { mailboxId: 'x'.repeat(129) },
    { providerThreadId: '' }, { providerThreadId: 'x'.repeat(513) },
    { agentId: '' }, { openedAt: '2026-10-20T21:00:00' }, { openedAt: 'invalid' },
  ])('rejects invalid thread fields: %j', (fields) => {
    expect(SharedMailboxThreadSchema.safeParse({ ...thread, ...fields }).success).toBe(false);
  });
});

describe('shared mailbox routing', () => {
  it('routes a reply to the agent that opened the thread', () => {
    expect(routeSharedMailboxMessage({
      mailbox, threads: [thread], providerThreadId: thread.providerThreadId, subject: 'Re: [Design] x',
    })).toEqual({ agentId: 'director', via: 'thread' });
  });

  it('ignores a thread registered on another mailbox', () => {
    expect(routeSharedMailboxMessage({
      mailbox, threads: [{ ...thread, mailboxId: 'other-mailbox' }],
      providerThreadId: thread.providerThreadId, subject: '[Design] Logo',
    })).toEqual({ agentId: 'design-lead', via: 'label' });
  });

  it('ignores a thread whose agent is no longer a holder', () => {
    expect(routeSharedMailboxMessage({
      mailbox, threads: [{ ...thread, agentId: AgentIdSchema.parse('former-holder') }],
      providerThreadId: thread.providerThreadId, subject: '[Design] Logo',
    })).toEqual({ agentId: 'design-lead', via: 'label' });
  });

  it('ignores a different provider thread', () => {
    expect(routeSharedMailboxMessage({
      mailbox, threads: [thread], providerThreadId: 'other-thread', subject: '[Design] Logo',
    })).toEqual({ agentId: 'design-lead', via: 'label' });
  });

  it('routes a new email by subject label', () => {
    expect(routeSharedMailboxMessage({ mailbox, threads: [], subject: '[design] Logo' }))
      .toEqual({ agentId: 'design-lead', via: 'label' });
  });

  it.each(['[Unknown] Hello', 'Hello', 'Hello [Design]', '[Design!]', '[]'])('defaults to the Director for %s', (subject) => {
    expect(routeSharedMailboxMessage({ mailbox, threads: [], subject }))
      .toEqual({ agentId: 'director', via: 'default' });
  });

  it.each(['RE: Fwd: [Design] x', 'r: I: Re: [Design] x', '[Design] x'])('parses repeated reply and forward prefixes: %s', (subject) => {
    expect(parseSharedMailboxSubjectLabel(subject)).toBe('Design');
  });

  it.each(['Hello [Design]', '[Design', 'Re: []', 'Re: [Design!]', ''])('returns null without a valid leading label: %s', (subject) => {
    expect(parseSharedMailboxSubjectLabel(subject)).toBeNull();
  });
});
