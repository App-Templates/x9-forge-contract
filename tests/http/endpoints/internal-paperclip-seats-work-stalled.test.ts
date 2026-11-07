import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  InternalPaperclipSeatNativeWakeRequestSchema,
  PaperclipSeatNativeWakeEventSchema,
} from '../../../src/http/endpoints/internal-paperclip-seats.js';

const built = createRequire(import.meta.url)('../../../dist/http/endpoints/index.cjs') as Pick<
  typeof import('../../../src/http/endpoints/index.js'),
  'InternalPaperclipSeatNativeWakeRequestSchema' | 'PaperclipSeatNativeWakeEventSchema'
>;

const scope = { tenantId: 't1', ownerId: 'o1', agentId: 'director-a' };
const identity = { managementAgentId: 'director-a', runtimeAgentId: 'director-a', vaultAgentId: 7 };
const base = { scope, eventId: 'evt-1', organizationId: 'org-a', identity };
const event = {
  kind: 'work_stalled',
  issueId: '11111111-1111-4111-8111-111111111111',
  identifier: 'AZ-12',
  title: 'Prepare the delivery',
  unitId: 'unit-design',
  status: 'in_progress',
  stalledSince: '2026-11-06T09:00:00+01:00',
  reason: 'no_activity',
};

// Keep the existing native-wake test bodies to cover queued retries unchanged.
const legacyRequests = [
  {
    ...base,
    event: {
      kind: 'email',
      messageId: '<m1@example.invalid>',
      threadKey: '<t1@example.invalid>',
      mode: 'request',
      from: 'capo@example.invalid',
      subject: 'Richiesta',
      receivedAt: '2026-11-02T09:11:00.000Z',
      excerpt: 'Testo',
      attachments: [{ name: 'a.pdf', contentType: 'application/pdf', size: 10 }],
    },
  },
  {
    scope,
    eventId: 'evt-2',
    event: { kind: 'research_done', researchId: 'r1', state: 'completed', question: 'Domanda?' },
  },
  {
    ...base,
    eventId: 'evt-3',
    event: {
      kind: 'dev_delivered', sessionIssue: 12, commit: 'a'.repeat(40),
      projectId: '33333333-3333-4333-8333-333333333333',
    },
  },
];

describe.each([
  { name: 'source', requestSchema: InternalPaperclipSeatNativeWakeRequestSchema, eventSchema: PaperclipSeatNativeWakeEventSchema },
  { name: 'CommonJS', requestSchema: built.InternalPaperclipSeatNativeWakeRequestSchema, eventSchema: built.PaperclipSeatNativeWakeEventSchema },
])('work_stalled native wake ($name)', ({ requestSchema, eventSchema }) => {
  it('(a) accepts work_stalled with each supported reason and timezone offset', () => {
    for (const reason of ['no_activity', 'waiting_too_long', 'queue_not_continued']) {
      const input = { ...base, event: { ...event, reason } };
      expect(requestSchema.parse(input)).toStrictEqual(input);
      expect(eventSchema.parse(input.event)).toStrictEqual(input.event);
    }
    const utcEvent = { ...event, stalledSince: '2026-11-06T08:00:00Z' };
    expect(eventSchema.parse(utcEvent)).toStrictEqual(utcEvent);
  });

  it('(b) rejects an unsupported reason', () => {
    const result = requestSchema.safeParse({ ...base, event: { ...event, reason: 'unknown' } });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path)).toContainEqual(['event', 'reason']);
  });

  it('(c) rejects extra event fields', () => {
    const result = requestSchema.safeParse({ ...base, event: { ...event, extra: true } });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(expect.objectContaining({
      code: 'unrecognized_keys', keys: ['extra'], path: ['event'],
    }));
  });

  it.each(legacyRequests)('(d) preserves the existing $event.kind request', input => {
    expect(requestSchema.parse(input)).toStrictEqual(input);
  });

  it('requires organizationId and identity for work_stalled', () => {
    const { organizationId: _organizationId, ...withoutOrganization } = base;
    const { identity: _identity, ...withoutIdentity } = base;
    for (const [input, path] of [
      [{ ...withoutOrganization, event }, ['organizationId']],
      [{ ...withoutIdentity, event }, ['identity']],
    ] as const) {
      const result = requestSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues.map(issue => issue.path)).toContainEqual(path);
    }
  });

  it('rejects an identity belonging to another agent', () => {
    const result = requestSchema.safeParse({
      ...base, event, identity: { ...identity, runtimeAgentId: 'other' },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.path)).toContainEqual(['identity', 'runtimeAgentId']);
  });

  it.each([
    { issueId: 'invalid' }, { identifier: '' }, { identifier: 'x'.repeat(41) },
    { title: '' }, { title: 'x'.repeat(301) },
    { unitId: '' }, { unitId: 'x'.repeat(201) },
    { status: 'unknown' }, { stalledSince: '2026-11-06T09:00:00' },
  ])('rejects invalid event fields %j', fields => {
    expect(requestSchema.safeParse({ ...base, event: { ...event, ...fields } }).success).toBe(false);
  });
});
