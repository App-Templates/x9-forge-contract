import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  GENERATED_DECISION_REQUEST_ID_PREFIX,
  SharedMailboxSchema,
  decideSharedMailboxRoute,
  formatSharedMailboxSubjectLabel,
  parseSharedMailboxSubjectLabel,
  stripSharedMailboxReplyPrefixes,
} from '../../src/organization/shared-mailbox.js';

const base = {
  tenantId: '1', companyId: 'good-choice', providerInboxId: 'inbox-gc', address: 'chiefs@agentmail.to',
};
const chiefs = SharedMailboxSchema.parse({
  ...base, mailboxId: 'chiefs-gc',
  holders: [
    { agentId: 'capo-dati', label: 'Dati', displayName: 'Capo Dati' },
    { agentId: 'bu-dati-good-choice', label: 'Dati GC', displayName: 'BU Dati Good Choice' },
  ],
  defaultAgentId: 'capo-dati',
});
const directors = SharedMailboxSchema.parse({
  ...base, mailboxId: 'directors-gc', providerInboxId: 'inbox-dir', address: 'director-good-choice@agentmail.to',
  audience: 'directors',
  holders: [
    { agentId: 'director-good-choice', label: 'Good Choice', displayName: 'Director Good Choice' },
    { agentId: 'director-cantina-facile', label: 'Cantina Facile', displayName: 'Director Cantina Facile' },
  ],
  defaultAgentId: 'director-good-choice',
});
const route = (mailbox: typeof directors, subject: string) =>
  decideSharedMailboxRoute({ mailbox, threads: [], providerThreadId: null, subject });

describe('s6746 prefissi-di-inoltro: reply and forward prefixes are stripped in one place', () => {
  const forwarded = [
    'Fw: [Cantina Facile] Nuovo sito',
    'FW:[Cantina Facile] x',
    'AW: [Cantina Facile] x',
    'WG: [Cantina Facile] x',
    'Rif: [Cantina Facile] x',
    'Re[2]: [Cantina Facile] x',
    'RE: RE: [Cantina Facile] x',
    'Re: Fw: Re[3]: [Cantina Facile] x',
    'R : [Cantina Facile] x',
  ];
  it.each(forwarded)('(a) %s reaches the project Director', (subject) => {
    expect(route(directors, subject)).toEqual({ agentId: 'director-cantina-facile', via: 'label' });
    expect(parseSharedMailboxSubjectLabel(subject)).toBe('Cantina Facile');
  });

  it('(b) a stack tag after the prefixes is skipped', () => {
    const tag = `[decisione ${GENERATED_DECISION_REQUEST_ID_PREFIX}${randomUUID()}] Piano`;
    expect(route(directors, `Fw: Re: ${tag}`)).toEqual({ agentId: 'director-good-choice', via: 'default' });
  });

  it('(c) unknown labels after Fw: are refused on directors, defaulted on chiefs', () => {
    expect(route(directors, 'Fw: [Cantina Facil] x')).toEqual({ via: 'refused', reason: 'label_unknown', label: 'Cantina Facil' });
    expect(route(chiefs, 'Fw: [Dati GC] x')).toEqual({ agentId: 'bu-dati-good-choice', via: 'label' });
    expect(route(chiefs, 'Fw: [Sconosciuta] x')).toEqual({ agentId: 'capo-dati', via: 'default' });
  });

  it.each(['Fwx: [Cantina Facile] x', 'Rif [Cantina Facile] x', 'Re[]: [Cantina Facile] x', 'Re[1234]: [Cantina Facile] x'])(
    '(d) %s is not a prefix',
    (subject) => {
      expect(route(directors, subject)).toEqual({ agentId: 'director-good-choice', via: 'default' });
      expect(parseSharedMailboxSubjectLabel(subject)).toBeNull();
    },
  );

  it('(e) the helper splits prefix and rest', () => {
    expect(stripSharedMailboxReplyPrefixes('Re: Fw: [X] y')).toEqual({ prefix: 'Re: Fw: ', rest: '[X] y' });
    expect(stripSharedMailboxReplyPrefixes('Nuovo sito')).toEqual({ prefix: '', rest: 'Nuovo sito' });
    expect(formatSharedMailboxSubjectLabel('Cantina Facile')).toBe('[Cantina Facile]');
  });
});
