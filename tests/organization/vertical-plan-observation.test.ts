import { describe, expect, it } from 'vitest';
import {
  VERTICAL_PLAN_ATTEMPT_EVENT_KINDS,
  VerticalPlanAttemptObservationSchema,
  VerticalPlanSendThreadSchema,
  verticalPlanDecisionSubject,
  verticalPlanMatchesAttempt,
  VerticalPlanSchema,
} from '../../src/organization/index.js';

const asset = (assetId: string, extra: Record<string, unknown> = {}) => ({
  assetId,
  sha256: 'a'.repeat(64),
  name: `${assetId}.pdf`,
  mediaType: 'application/pdf',
  sizeBytes: 10,
  origin: { kind: 'session', sessionId: 'session-1' },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  createdAt: '2026-10-20T21:00:00+02:00',
  ...extra,
});

const plan = () => ({
  planId: 'plan-0001',
  version: 1,
  digest: 'b'.repeat(64),
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  clientId: 'company-1',
  projectId: 'project-1',
  buSlug: 'vendite',
  actionPlan: { planId: 'action-0001', version: 2 },
  analysis: 'Partiamo dai clienti già raggiunti.',
  milestones: [
    { number: 1, expectedGoal: 'Primi dieci contatti', dueDate: '2026-11-01', blockedBy: [] },
    { number: 2, expectedGoal: 'Primo cliente', dueDate: '2026-11-15', blockedBy: [1] },
  ],
  blockers: [{ what: 'Elenco contatti', unlocksMilestone: 1 }],
  questions: [{ question: 'Quale budget?', unlocks: 'Milestone 2' }],
  attachments: [
    { role: 'rd_dossier', asset: asset('asset-rd', { origin: { kind: 'generated', agentId: 'agent-1' } }) },
    { role: 'executor', asset: asset('asset-ex') },
    { role: 'reviewer', asset: asset('asset-rv', { buSlug: 'vendite' }) },
    { role: 'budget', asset: asset('asset-bd') },
    { role: 'criteria', asset: asset('asset-cr') },
  ],
});

const REQUEST_ID = 'request-0001';
const subject = () => verticalPlanDecisionSubject(VerticalPlanSchema.parse(plan()));
const thread = () => ({ mailboxId: 'mailbox-1', providerThreadId: 'thread-1' });
const referent = () => ({ personRef: 'mario-rossi', entryVersion: 1 });

const sent = () => ({
  kind: 'sent',
  eventId: 'event-sent-1',
  at: '2026-10-21T09:00:00+02:00',
  requestId: REQUEST_ID,
  plan: plan(),
  referent: referent(),
  to: 'mario@example.com',
  thread: thread(),
  providerMessageId: 'msg-1',
});
const received = () => ({
  kind: 'reply_received',
  eventId: 'event-reply-1',
  at: '2026-10-21T10:00:00+02:00',
  requestId: REQUEST_ID,
  thread: thread(),
  providerMessageId: 'msg-2',
});
const outcome = (extra: Record<string, unknown> = {}) => ({
  outcome: 'approved',
  optionId: 'procedi',
  requestId: REQUEST_ID,
  decidedBy: { kind: 'owner', ownerId: 'owner-1' },
  decidedAt: '2026-10-21T10:05:00+02:00',
  channel: 'email',
  sourceRef: 'msg-2',
  subject: subject(),
  ...extra,
});
const delivered = (extra: Record<string, unknown> = {}) => ({
  kind: 'reply_delivered',
  eventId: 'event-delivered-1',
  at: '2026-10-21T10:06:00+02:00',
  requestId: REQUEST_ID,
  outcome: outcome(extra),
});

const observation = (events: unknown[] = [sent(), received(), delivered()]) => ({
  observationId: 'observation-1',
  scope: {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    clientId: 'company-1',
    projectId: 'project-1',
    buSlug: 'vendite',
    agent: { managementAgentId: 'agent-1', runtimeAgentId: 'agent-1', vaultAgentId: 7 },
  },
  subject: subject(),
  events,
});

const ok = (value: unknown) => VerticalPlanAttemptObservationSchema.safeParse(value).success;

describe('VerticalPlanAttemptObservationSchema', () => {
  it('exports the four event kinds', () => {
    expect(VERTICAL_PLAN_ATTEMPT_EVENT_KINDS).toEqual(['sent', 'send_failed', 'reply_received', 'reply_delivered']);
  });

  it('keeps only the thread reference', () => {
    expect(VerticalPlanSendThreadSchema.safeParse(thread()).success).toBe(true);
    expect(VerticalPlanSendThreadSchema.safeParse({ ...thread(), ownerId: 'x' }).success).toBe(false);
  });

  it('accepts the complete path', () => {
    expect(ok(observation())).toBe(true);
  });

  it('accepts a failed send', () => {
    const failed = {
      kind: 'send_failed',
      eventId: 'event-failed-1',
      at: '2026-10-21T09:00:00+02:00',
      requestId: REQUEST_ID,
      referent: referent(),
      to: 'mario@example.com',
      error: 'mailbox unavailable',
    };
    expect(ok(observation([failed]))).toBe(true);
  });

  it('rejects a plan version different from the subject', () => {
    expect(ok(observation([{ ...sent(), plan: { ...plan(), version: 2 } }]))).toBe(false);
  });

  it('rejects a plan digest different from the subject', () => {
    expect(ok(observation([{ ...sent(), plan: { ...plan(), digest: 'c'.repeat(64) } }]))).toBe(false);
  });

  it('rejects a subject of kind action_plan', () => {
    expect(ok({ ...observation(), subject: { ...subject(), kind: 'action_plan' } })).toBe(false);
  });

  it.each([
    ['tenant', { tenantId: 'tenant-2' }],
    ['client', { clientId: 'company-2' }],
    ['project', { projectId: 'project-2' }],
    ['business unit', { buSlug: 'marketing' }],
  ])('rejects a scope with a different %s', (_name, change) => {
    const value = observation();
    expect(ok({ ...value, scope: { ...value.scope, ...change } })).toBe(false);
  });

  it('rejects an event with a different requestId', () => {
    expect(ok(observation([sent(), { ...received(), requestId: 'request-0002' }]))).toBe(false);
  });

  it('rejects two sent events', () => {
    expect(ok(observation([sent(), { ...sent(), eventId: 'event-sent-2' }]))).toBe(false);
  });

  it('rejects a reply on another thread', () => {
    const other = { ...received(), thread: { ...thread(), providerThreadId: 'thread-2' } };
    expect(ok(observation([sent(), other]))).toBe(false);
  });

  it('rejects a reply without a preceding sent event', () => {
    expect(ok(observation([received()]))).toBe(false);
  });

  it('rejects a delivered reply without a received reply', () => {
    expect(ok(observation([sent(), delivered()]))).toBe(false);
  });

  it('rejects an outcome of another plan version', () => {
    const other = { subject: { ...subject(), planVersion: 2 } };
    expect(ok(observation([sent(), received(), delivered(other)]))).toBe(false);
  });

  it('rejects an outcome with another requestId', () => {
    expect(ok(observation([sent(), received(), delivered({ requestId: 'request-0002' })]))).toBe(false);
  });

  it('rejects a repeated eventId', () => {
    expect(ok(observation([sent(), { ...received(), eventId: 'event-sent-1' }]))).toBe(false);
  });

  it('rejects extra fields on the observation and on an event', () => {
    expect(ok({ ...observation(), extra: true })).toBe(false);
    expect(ok(observation([{ ...sent(), extra: true }]))).toBe(false);
  });
});

describe('verticalPlanMatchesAttempt', () => {
  const scope = observation().scope;
  const parsed = () => VerticalPlanSchema.parse(plan());

  it('is true for the plan the subject names inside the scope', () => {
    expect(verticalPlanMatchesAttempt(scope, subject(), parsed())).toBe(true);
  });

  it('is false when the digest differs', () => {
    expect(verticalPlanMatchesAttempt(scope, { ...subject(), digest: 'c'.repeat(64) }, parsed())).toBe(false);
  });

  it('is false when the organization differs', () => {
    expect(verticalPlanMatchesAttempt({ ...scope, organizationId: 'org-2' }, subject(), parsed())).toBe(false);
  });
});
