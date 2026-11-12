import { describe, expect, it } from 'vitest';
import { AgentIdSchema } from '../../src/agent/agent-identity.js';
import { AgentEmailInboxSchema } from '../../src/messaging/agent-email-inbox.js';
import { BusinessUnitLeadBirthRequestSchema } from '../../src/organization/business-unit-lead.js';
import {
  SHARED_MAILBOXES_FILE,
  SHARED_MAILBOX_AUDIENCES,
  SHARED_MAILBOX_ROUTE_VIAS,
  SharedMailboxFileEntrySchema,
  SharedMailboxHolderSchema,
  SharedMailboxLabelSchema,
  SharedMailboxSchema,
  SharedMailboxThreadSchema,
  SharedMailboxesFileSchema,
  decideSharedMailboxRoute,
  formatSharedMailboxSubjectLabel,
  sharedMailboxAudience,
  sharedMailboxLabelFromName,
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

describe('s6703 casella-director: directors audience of the shared mailbox', () => {
  const base = {
    tenantId: '1', companyId: 'good-choice', providerInboxId: 'inbox-gc', address: 'chiefs@agentmail.to',
  };
  const chiefsInput = {
    ...base, mailboxId: 'chiefs-gc',
    holders: [
      { agentId: 'capo-dati', label: 'Dati', displayName: 'Capo Dati' },
      { agentId: 'bu-dati-good-choice', label: 'Dati GC', displayName: 'BU Dati Good Choice' },
    ],
    defaultAgentId: 'capo-dati',
  };
  const directorHolders = [
    { agentId: 'director-good-choice', label: 'Good Choice', displayName: 'Director Good Choice' },
    { agentId: 'director-cantina-facile', label: 'Cantina Facile', displayName: 'Director Cantina Facile' },
  ];
  const directorsInput = {
    ...base, mailboxId: 'directors-gc', providerInboxId: 'inbox-dir', address: 'director-good-choice@agentmail.to',
    audience: 'directors', holders: directorHolders, defaultAgentId: 'director-good-choice',
  };
  const chiefs = SharedMailboxSchema.parse(chiefsInput);
  const directors = SharedMailboxSchema.parse(directorsInput);
  const directorThread = SharedMailboxThreadSchema.parse({
    mailboxId: 'directors-gc', providerThreadId: 'th-1', agentId: 'director-cantina-facile',
    openedAt: '2026-11-12T10:00:00+01:00',
  });

  it('(a) today file parses to the same object and has the chiefs audience', () => {
    const parsed = parseSharedMailboxesFile([{ companyName: 'Good Choice', mailbox: chiefsInput }]);
    expect(parsed).toEqual([chiefsInput]);
    expect('audience' in parsed[0]!).toBe(false);
    expect(sharedMailboxAudience(parsed[0]!)).toBe('business_unit_leads');
    expect(SHARED_MAILBOX_AUDIENCES).toEqual(['business_unit_leads', 'directors']);
  });

  it('(a) holder count per audience', () => {
    const one = [directorHolders[0]];
    expect(SharedMailboxSchema.safeParse({ ...chiefsInput, holders: [chiefsInput.holders[0]] }).success).toBe(false);
    expect(SharedMailboxSchema.safeParse({ ...chiefsInput, audience: 'business_unit_leads', holders: [chiefsInput.holders[0]] }).success).toBe(false);
    expect(SharedMailboxSchema.safeParse({ ...directorsInput, holders: one }).success).toBe(true);
    expect(SharedMailboxSchema.safeParse({ ...directorsInput, holders: [] }).success).toBe(false);
    expect(SharedMailboxSchema.safeParse({ ...directorsInput, audience: 'invented' }).success).toBe(false);
    expect(sharedMailboxAudience(directors)).toBe('directors');
  });

  it('(a) the same agent in two mailboxes is refused', () => {
    const other = { ...directorsInput, mailboxId: 'directors-2', providerInboxId: 'inbox-2' };
    expect(SharedMailboxesFileSchema.safeParse([
      { companyName: 'A', mailbox: directorsInput }, { companyName: 'B', mailbox: other },
    ]).success).toBe(false);
  });

  it('(b) directors: thread wins, then label, then default', () => {
    expect(decideSharedMailboxRoute({ mailbox: directors, threads: [directorThread], providerThreadId: 'th-1', subject: '[Good Choice] x' }))
      .toEqual({ agentId: 'director-cantina-facile', via: 'thread' });
    for (const subject of ['[Cantina Facile] x', 'Re: [cantina facile] x']) {
      expect(decideSharedMailboxRoute({ mailbox: directors, threads: [], subject }))
        .toEqual({ agentId: 'director-cantina-facile', via: 'label' });
    }
    for (const subject of ['Hello', 'Hello [Cantina Facile]']) {
      expect(decideSharedMailboxRoute({ mailbox: directors, threads: [], subject }))
        .toEqual({ agentId: 'director-good-choice', via: 'default' });
    }
  });

  it('(b) directors: an unknown leading label is refused with the text read', () => {
    expect(decideSharedMailboxRoute({ mailbox: directors, threads: [], subject: '[Cantina Facil] x' }))
      .toEqual({ via: 'refused', reason: 'label_unknown', label: 'Cantina Facil' });
    expect(decideSharedMailboxRoute({ mailbox: directors, threads: [], subject: 'Re: [Good Choice!] x' }))
      .toEqual({ via: 'refused', reason: 'label_unknown', label: 'Good Choice!' });
    const long = decideSharedMailboxRoute({ mailbox: directors, threads: [], subject: `[${'x'.repeat(100)}] y` });
    expect(long).toMatchObject({ via: 'refused', label: 'x'.repeat(80) });
  });

  it('(c) chiefs never refuse; routeSharedMailboxMessage throws on a refusal', () => {
    expect(routeSharedMailboxMessage({ mailbox: chiefs, threads: [], subject: '[Unknown] Hello' }))
      .toEqual({ agentId: 'capo-dati', via: 'default' });
    expect(decideSharedMailboxRoute({ mailbox: chiefs, threads: [], subject: '[Unknown] Hello' }))
      .toEqual({ agentId: 'capo-dati', via: 'default' });
    expect(() => routeSharedMailboxMessage({ mailbox: directors, threads: [], subject: '[Cantina Facil] x' })).toThrow(/label_unknown/);
    expect(routeSharedMailboxMessage({ mailbox: directors, threads: [], subject: '[Cantina Facile] x' }))
      .toEqual({ agentId: 'director-cantina-facile', via: 'label' });
  });

  it('(d) subject label and label from a project name', () => {
    expect(formatSharedMailboxSubjectLabel('Cantina Facile')).toBe('[Cantina Facile]');
    expect(parseSharedMailboxSubjectLabel(formatSharedMailboxSubjectLabel('Cantina Facile'))).toBe('Cantina Facile');
    expect(() => formatSharedMailboxSubjectLabel('Bad!')).toThrow();
    expect(sharedMailboxLabelFromName('Cantina Facile')).toBe('Cantina Facile');
    expect(sharedMailboxLabelFromName('  Orto   Facile! ')).toBe('Orto Facile');
    expect(sharedMailboxLabelFromName('a'.repeat(60))).toBe('a'.repeat(40));
    expect(sharedMailboxLabelFromName(`${'a'.repeat(39)} bbb`)).toBe('a'.repeat(39));
    expect(() => sharedMailboxLabelFromName('!!!')).toThrow();
  });
});
