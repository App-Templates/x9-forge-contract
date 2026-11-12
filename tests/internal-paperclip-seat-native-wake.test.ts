import { describe, expect, it } from 'vitest';
import {
  INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH,
  INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH,
  InternalPaperclipSeatNativeWakeRequestSchema,
  InternalPaperclipSeatNativeWakeResponseSchema,
  PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS,
  internalPaperclipSeatNativeWakeContract,
} from '../src/http/endpoints/internal-paperclip-seats.js';

const scope = { tenantId: 't1', ownerId: 'o1', agentId: 'director-a' };
const identity = { managementAgentId: 'director-a', runtimeAgentId: 'director-a', vaultAgentId: 7 };
const email = {
  kind: 'email',
  messageId: '<m1@example.invalid>',
  threadKey: '<t1@example.invalid>',
  mode: 'request',
  from: 'capo@example.invalid',
  subject: 'Richiesta',
  receivedAt: '2026-11-02T09:11:00.000Z',
  excerpt: 'Testo',
  attachments: [{ name: 'a.pdf', contentType: 'application/pdf', size: 10 }],
};
const base = { scope, eventId: 'evt-1', organizationId: 'org-a', identity };
const emailRequest = { ...base, event: email };
const researchRequest = {
  scope,
  eventId: 'evt-2',
  event: { kind: 'research_done', researchId: 'r1', state: 'completed', question: 'Domanda?' },
};
const devRequest = {
  ...base,
  eventId: 'evt-3',
  event: { kind: 'dev_delivered', sessionIssue: 12, commit: 'a'.repeat(40), projectId: '33333333-3333-4333-8333-333333333333' },
};
const decisionEvent = { ...email, mode: 'decision', decision: { requestId: 'req-123456', outcome: 'approved' } };
const issueId = '11111111-1111-4111-8111-111111111111';
const commentId = '44444444-4444-4444-8444-444444444444';
const runId = '22222222-2222-4222-8222-222222222222';
const parse = (v: unknown) => InternalPaperclipSeatNativeWakeRequestSchema.safeParse(v).success;
const parseRes = (v: unknown) => InternalPaperclipSeatNativeWakeResponseSchema.safeParse(v).success;

describe('internal Paperclip seat native-wake contract', () => {
  it('(a) accepts one valid request per event kind', () => {
    expect(parse(emailRequest)).toBe(true);
    expect(parse(researchRequest)).toBe(true);
    expect(parse(devRequest)).toBe(true);
    expect(parse({ ...base, event: decisionEvent })).toBe(true);
  });

  it('(b) requires identity for email and dev_delivered, and a sane eventId', () => {
    const { identity: _i, ...noIdentity } = emailRequest;
    expect(parse(noIdentity)).toBe(false);
    const { identity: _j, ...devNoIdentity } = devRequest;
    expect(parse(devNoIdentity)).toBe(false);
    const { organizationId: _o, ...noOrg } = emailRequest;
    expect(parse(noOrg)).toBe(false);
    expect(parse({ ...emailRequest, eventId: '   ' })).toBe(false);
    expect(parse({ ...emailRequest, eventId: 'e'.repeat(201) })).toBe(false);
  });

  it('(c) rejects an identity whose runtimeAgentId differs from scope.agentId', () => {
    expect(parse({ ...emailRequest, identity: { ...identity, runtimeAgentId: 'other' } })).toBe(false);
    expect(parse({ ...researchRequest, identity: { ...identity, runtimeAgentId: 'other' } })).toBe(false);
  });

  it('(d) decision is present if and only if mode is decision; limits and strictness hold', () => {
    expect(parse({ ...base, event: { ...email, mode: 'reply', decision: decisionEvent.decision } })).toBe(false);
    const { decision: _d, ...noDecision } = decisionEvent;
    expect(parse({ ...base, event: noDecision })).toBe(false);
    expect(parse({ ...base, event: { ...decisionEvent, decision: { requestId: 'req-123456', outcome: 'maybe' } } })).toBe(false);
    expect(parse({ ...base, event: { ...email, excerpt: 'x'.repeat(8001) } })).toBe(false);
    const attachments = Array.from({ length: 21 }, () => email.attachments[0]);
    expect(parse({ ...base, event: { ...email, attachments } })).toBe(false);
    expect(parse({ ...emailRequest, extra: 1 })).toBe(false);
    expect(parse({ ...base, event: { ...email, extra: 1 } })).toBe(false);
  });

  it('(e) response rules between result and ids', () => {
    expect(parseRes({ result: 'woken', issueId, commentId, runId })).toBe(true);
    expect(parseRes({ result: 'opened', issueId })).toBe(true);
    expect(parseRes({ result: 'opened', issueId, runId })).toBe(false);
    expect(parseRes({ result: 'woken', issueId })).toBe(false);
    expect(parseRes({ result: 'deferred' })).toBe(false);
    expect(parseRes({ result: 'no_task', issueId })).toBe(false);
    expect(parseRes({ result: 'not_enabled', issueId })).toBe(false);
    expect(parseRes({ result: 'duplicate' })).toBe(true);
    expect(parseRes({ result: 'opened', issueId, commentId })).toBe(false);
  });

  it('(f) declares a secret-authenticated POST on its own path', () => {
    expect(internalPaperclipSeatNativeWakeContract.method).toBe('POST');
    expect(internalPaperclipSeatNativeWakeContract.authType).toBe('secret');
    expect(internalPaperclipSeatNativeWakeContract.path).toBe('/internal/paperclip/seats/native-wake');
    expect(INTERNAL_PAPERCLIP_SEAT_NATIVE_WAKE_PATH).not.toBe(INTERNAL_PAPERCLIP_SEAT_REPLY_WAKE_PATH);
    expect(PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS).toHaveLength(11);
  });

  it('s6513 consegna-inviata-e-gemello-in-attesa: the native wake request accepts a project_delivered event with project, message, time and digest only with organization and identity, and the response accepts waiting_on_blockers only with the waiting issue and without run or comment', () => {
    const delivered = {
      kind: 'project_delivered',
      projectId: 'orto-facile',
      messageId: '<final@example.invalid>',
      sentAt: '2026-11-12T10:00:00.000Z',
      digest: 'a'.repeat(64),
    };
    const request = { ...base, organizationId: 'good-choice', eventId: 'evt-6513', event: delivered };
    expect(parse(request)).toBe(true);
    const { organizationId: _o, ...noOrg } = request;
    expect(parse(noOrg)).toBe(false);
    const { identity: _i, ...noIdentity } = request;
    expect(parse(noIdentity)).toBe(false);
    const { projectId: _p, ...noProject } = delivered;
    expect(parse({ ...request, event: noProject })).toBe(false);
    expect(parse({ ...request, event: { ...delivered, digest: 'z'.repeat(64) } })).toBe(false);
    expect(parse({ ...request, event: { ...delivered, digest: 'A'.repeat(64) } })).toBe(false);
    expect(parse({ ...request, event: { ...delivered, extra: 1 } })).toBe(false);

    expect(parseRes({ result: 'waiting_on_blockers', issueId })).toBe(true);
    expect(parseRes({ result: 'waiting_on_blockers' })).toBe(false);
    expect(parseRes({ result: 'waiting_on_blockers', issueId, runId })).toBe(false);
    expect(parseRes({ result: 'waiting_on_blockers', issueId, commentId })).toBe(false);
  });

  it('s6526 tetto-alzato-evento: the native wake request accepts a limit_lifted event with company_spend, revision and liftedAt only with organization and identity, and the result count stays 11', () => {
    const lifted = { kind: 'limit_lifted', limit: 'company_spend', revision: 3, liftedAt: '2026-11-12T10:00:00.000Z' };
    const request = { ...base, eventId: 'evt-6526', event: lifted };
    expect(parse(request)).toBe(true);
    expect(parse({ ...request, event: { ...lifted, liftedAt: '2026-11-12T11:00:00+01:00' } })).toBe(true);
    const { organizationId: _o, ...noOrg } = request;
    expect(parse(noOrg)).toBe(false);
    const { identity: _i, ...noIdentity } = request;
    expect(parse(noIdentity)).toBe(false);
    expect(parse({ ...request, event: { ...lifted, limit: 'daily_runs' } })).toBe(false);
    expect(parse({ ...request, event: { ...lifted, extra: 1 } })).toBe(false);
    expect(parse({ ...request, event: { ...lifted, revision: 0 } })).toBe(false);
    expect(parse({ ...request, event: { ...lifted, liftedAt: '2026-11-12T10:00:00' } })).toBe(false);
    const { revision: _r, ...noRevision } = lifted;
    expect(parse({ ...request, event: noRevision })).toBe(false);

    expect(parseRes({ result: 'deferred', issueId })).toBe(true);
    expect(parseRes({ result: 'no_task' })).toBe(true);
    expect(parseRes({ result: 'no_task', issueId })).toBe(false);
    expect(PAPERCLIP_SEAT_NATIVE_WAKE_RESULTS).toHaveLength(11);

    // Dry run on today's shapes: nothing was tightened.
    expect(parse(emailRequest)).toBe(true);
    expect(parse({ ...base, eventId: 'evt-6513', event: { kind: 'project_delivered', projectId: 'orto-facile', messageId: '<f@example.invalid>', sentAt: '2026-11-12T10:00:00.000Z', digest: 'a'.repeat(64) } })).toBe(true);
    expect(parseRes({ result: 'opened', issueId })).toBe(true);
    expect(parseRes({ result: 'woken', issueId, runId })).toBe(true);
    expect(parseRes({ result: 'duplicate' })).toBe(true);
  });
});
