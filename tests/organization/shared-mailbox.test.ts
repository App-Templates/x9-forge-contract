import { describe, expect, it } from 'vitest';
import { AgentIdSchema } from '../../src/agent/agent-identity.js';
import { AgentEmailInboxSchema } from '../../src/messaging/agent-email-inbox.js';
import { BusinessUnitLeadBirthRequestSchema } from '../../src/organization/business-unit-lead.js';
import {
  SHARED_MAILBOXES_FILE,
  SHARED_MAILBOX_ROUTE_VIAS,
  SharedMailboxFileEntrySchema,
  SharedMailboxHolderSchema,
  SharedMailboxLabelSchema,
  SharedMailboxSchema,
  SharedMailboxThreadSchema,
  SharedMailboxesFileSchema,
  parseSharedMailboxesFile,
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

describe('SharedMailboxesFileSchema', () => {
  const secondMailbox = SharedMailboxSchema.parse({
    ...mailbox,
    mailboxId: 'mailbox-2',
    companyId: 'company-2',
    providerInboxId: 'inbox-2',
    address: 'second@example.com',
    holders: [
      { agentId: 'second-director', label: 'Director', displayName: 'Second Director' },
      { agentId: 'second-lead', label: 'Design', displayName: 'Second Design Lead' },
    ],
    defaultAgentId: 'second-director',
  });
  const entries = [
    { companyName: 'First Company', mailbox },
    { companyName: 'Second Company', mailbox: secondMailbox },
  ];

  it('accepts two companies and extracts their mailboxes in file order', () => {
    expect(SharedMailboxesFileSchema.parse(entries)).toEqual(entries);
    expect(parseSharedMailboxesFile(entries)).toEqual([mailbox, secondMailbox]);
    expect(SharedMailboxFileEntrySchema.shape.mailbox).toBe(SharedMailboxSchema);
  });

  it('extracts an empty list from an empty file', () => {
    expect(parseSharedMailboxesFile([])).toEqual([]);
  });

  it('rejects the legacy list of bare mailboxes and throws when parsing it', () => {
    expect(SharedMailboxesFileSchema.safeParse([mailbox]).success).toBe(false);
    expect(() => parseSharedMailboxesFile([mailbox])).toThrow();
  });

  it('rejects duplicate mailbox IDs across companies', () => {
    expect(SharedMailboxesFileSchema.safeParse([
      entries[0], { ...entries[1], mailbox: { ...secondMailbox, mailboxId: mailbox.mailboxId } },
    ]).success).toBe(false);
  });

  it('rejects duplicate providerInboxId across companies', () => {
    expect(SharedMailboxesFileSchema.safeParse([
      entries[0], { ...entries[1], mailbox: { ...secondMailbox, providerInboxId: mailbox.providerInboxId } },
    ]).success).toBe(false);
  });

  it('rejects the same holder agent in two mailboxes', () => {
    const result = SharedMailboxesFileSchema.safeParse([
      entries[0],
      {
        ...entries[1],
        mailbox: {
          ...secondMailbox,
          holders: [secondMailbox.holders[0], { ...secondMailbox.holders[1], agentId: mailbox.holders[1].agentId }],
        },
      },
    ]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        path: [1, 'mailbox', 'holders', 1, 'agentId'],
        message: 'Agent holds more than one shared mailbox',
      }));
    }
  });

  it('rejects an extra key in a file entry', () => {
    expect(SharedMailboxesFileSchema.safeParse([{ ...entries[0], extra: true }]).success).toBe(false);
  });

  it('rejects missing and invalid company names', () => {
    expect(SharedMailboxFileEntrySchema.safeParse({ mailbox }).success).toBe(false);
    expect(SharedMailboxFileEntrySchema.safeParse({ companyName: '', mailbox }).success).toBe(false);
    expect(SharedMailboxFileEntrySchema.safeParse({ companyName: 'x'.repeat(121), mailbox }).success).toBe(false);
    expect(SharedMailboxFileEntrySchema.parse({ companyName: 'x'.repeat(120), mailbox }).companyName).toHaveLength(120);
  });

  it('accepts 500 entries and rejects a file with 501 entries', () => {
    const manyEntries = Array.from({ length: 501 }, (_, index) => ({
      companyName: `Company ${index}`,
      mailbox: {
        ...mailbox,
        mailboxId: `mailbox-${index}`,
        providerInboxId: `inbox-${index}`,
        holders: [
          { agentId: `director-${index}`, label: 'Director', displayName: 'Director' },
          { agentId: `lead-${index}`, label: 'Design', displayName: 'Lead' },
        ],
        defaultAgentId: `director-${index}`,
      },
    }));
    expect(SharedMailboxesFileSchema.safeParse(manyEntries.slice(0, 500)).success).toBe(true);
    expect(SharedMailboxesFileSchema.safeParse(manyEntries).success).toBe(false);
  });

  it('throws for malformed files instead of returning an empty list', () => {
    expect(() => parseSharedMailboxesFile(null)).toThrow();
    expect(() => parseSharedMailboxesFile({})).toThrow();
    expect(() => parseSharedMailboxesFile([entries[0], { companyName: 'Broken', mailbox: {} }])).toThrow();
  });

  it('uses the canonical contexts-relative file path', () => {
    expect(SHARED_MAILBOXES_FILE).toBe('companies/shared-mailboxes.json');
  });
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
