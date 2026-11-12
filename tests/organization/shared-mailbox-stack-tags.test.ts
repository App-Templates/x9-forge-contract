import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { DecisionRequestIdSchema } from '../../src/organization/decision-request.js';
import {
  GENERATED_DECISION_REQUEST_ID_PREFIX,
  GeneratedDecisionRequestIdSchema,
  SharedMailboxSchema,
  SharedMailboxThreadSchema,
  decideSharedMailboxRoute,
  isStackSubjectTag,
  parseSharedMailboxSubjectLabel,
} from '../../src/organization/shared-mailbox.js';

const requestId = 'dec_123e4567-e89b-42d3-a456-426614174000';
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
const directorThread = SharedMailboxThreadSchema.parse({
  mailboxId: 'directors-gc', providerThreadId: 'th-1', agentId: 'director-cantina-facile',
  openedAt: '2026-11-12T10:00:00+01:00',
});

describe('s6728 etichetta-di-sistema: a stack decision tag is never a holder label', () => {
  it('(a) delivers pre-seed decision replies by default or registered thread', () => {
    for (const subject of [
      `Re: [decisione ${requestId}] Piano d'azione`,
      `R: [Decisione ${requestId}] Piano`,
      `[decisione ${requestId}] Consegna`,
    ]) {
      expect(decideSharedMailboxRoute({ mailbox: directors, threads: [], subject }))
        .toEqual({ agentId: 'director-good-choice', via: 'default' });
      expect(decideSharedMailboxRoute({
        mailbox: directors, threads: [directorThread], providerThreadId: 'th-1', subject,
      })).toEqual({ agentId: 'director-cantina-facile', via: 'thread' });
    }
  });

  it('(b) reads holders before and after stack tags and refuses the actual unknown group', () => {
    expect(decideSharedMailboxRoute({
      mailbox: directors, threads: [], subject: `Re: [Good Choice] [decisione ${requestId}] Piano`,
    })).toEqual({ agentId: 'director-good-choice', via: 'label' });
    for (const subject of [
      `[decisione ${requestId}] [Cantina Facile] x`,
      `Re: Fwd: [ DECISIONE  ${requestId} ]  [cantina facile] x`,
      `[decisione ${requestId}] [decisione ${requestId}] [Cantina Facile] x`,
    ]) {
      expect(decideSharedMailboxRoute({ mailbox: directors, threads: [], subject }))
        .toEqual({ agentId: 'director-cantina-facile', via: 'label' });
    }
    for (const label of ['Cantina Facil', 'x'.repeat(100), '']) {
      expect(decideSharedMailboxRoute({
        mailbox: directors, threads: [], subject: `[decisione ${requestId}] [${label}] x`,
      })).toEqual({ via: 'refused', reason: 'label_unknown', label: label.slice(0, 80) });
    }
    expect(decideSharedMailboxRoute({
      mailbox: directors, threads: [], subject: `[decisione ${requestId}] Piano [Cantina Facile]`,
    })).toEqual({ agentId: 'director-good-choice', via: 'default' });
  });

  it('(c) validates the whole tag with the decision id schema and preserves holder labels', () => {
    for (const group of [
      'decisione', 'decisione abc', `decisioni ${requestId}`, `decisione ${requestId} altro`,
    ]) {
      expect(isStackSubjectTag(group)).toBe(false);
      expect(decideSharedMailboxRoute({ mailbox: directors, threads: [], subject: `[${group}] x` }))
        .toEqual({ via: 'refused', reason: 'label_unknown', label: group });
    }
    expect(isStackSubjectTag(`decisione ${requestId}`)).toBe(true);
    expect(isStackSubjectTag(` DECISIONE  ${requestId} `)).toBe(true);
    // only a generated id makes a tag: "Finale" is a plain word, so the holder label wins in routing anyway.
    expect(isStackSubjectTag('Decisione Finale')).toBe(false);
    const finalDecisionMailbox = SharedMailboxSchema.parse({
      ...directors,
      holders: [...directors.holders, {
        agentId: 'director-decisione-finale', label: 'Decisione Finale', displayName: 'Director Decisione Finale',
      }],
    });
    expect(decideSharedMailboxRoute({ mailbox: finalDecisionMailbox, threads: [], subject: '[Decisione Finale] x' }))
      .toEqual({ agentId: 'director-decisione-finale', via: 'label' });
  });

  it('(d) preserves chiefs defaults and the subject label parser while reading holders after tags', () => {
    for (const subject of [`[decisione ${requestId}] x`, '[Sconosciuta] [Dati GC] x']) {
      expect(decideSharedMailboxRoute({ mailbox: chiefs, threads: [], subject }))
        .toEqual({ agentId: 'capo-dati', via: 'default' });
    }
    expect(decideSharedMailboxRoute({
      mailbox: chiefs, threads: [], subject: `[decisione ${requestId}] [Dati GC] x`,
    })).toEqual({ agentId: 'bu-dati-good-choice', via: 'label' });
    expect(parseSharedMailboxSubjectLabel(`[decisione ${requestId}] x`)).toBeNull();
  });
});

describe('s6709 forma-vera-del-tag: only the id shape the stack generates makes a decision tag', () => {
  it('(a) refuses holder-like groups as unknown labels on the directors mailbox', () => {
    const groups = [
      'Decisione urgente', 'decisione Cantina-Facile', 'Decisione Rapide', 'decisione dec_12345',
      `decisione ${requestId.toUpperCase()}`,
    ];
    for (const group of groups) {
      expect(isStackSubjectTag(group)).toBe(false);
      expect(decideSharedMailboxRoute({ mailbox: directors, threads: [], subject: `[${group}] x` }))
        .toEqual({ via: 'refused', reason: 'label_unknown', label: group });
      expect(decideSharedMailboxRoute({ mailbox: chiefs, threads: [], subject: `[${group}] x` }))
        .toEqual({ agentId: 'capo-dati', via: 'default' });
    }
  });

  it('(b) keeps real generated tags going by default or thread, and the wide schema reading saved ids', () => {
    const id = `${GENERATED_DECISION_REQUEST_ID_PREFIX}${randomUUID()}`;
    const subject = `Re: [decisione ${id}] Piano`;
    expect(isStackSubjectTag(`decisione ${id}`)).toBe(true);
    expect(decideSharedMailboxRoute({ mailbox: directors, threads: [], subject }))
      .toEqual({ agentId: 'director-good-choice', via: 'default' });
    expect(decideSharedMailboxRoute({
      mailbox: directors, threads: [directorThread], providerThreadId: 'th-1', subject,
    })).toEqual({ agentId: 'director-cantina-facile', via: 'thread' });
    expect(GeneratedDecisionRequestIdSchema.safeParse(id).success).toBe(true);
    expect(isStackSubjectTag(`decisione ${randomUUID()}`)).toBe(false);
    expect(GeneratedDecisionRequestIdSchema.safeParse(randomUUID()).success).toBe(false);
    for (const saved of ['Finale', 'req-1311', 'abc123']) {
      expect(DecisionRequestIdSchema.safeParse(saved).success).toBe(true);
      expect(GeneratedDecisionRequestIdSchema.safeParse(saved).success).toBe(false);
    }
  });
});
