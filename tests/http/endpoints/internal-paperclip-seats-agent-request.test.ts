import { describe, expect, it } from 'vitest';
import {
  InternalPaperclipSeatNativeWakeRequestSchema,
  PaperclipSeatNativeWakeEventSchema,
} from '../../../src/http/endpoints/internal-paperclip-seats.js';

const scope = { tenantId: 't1', ownerId: 'o1', agentId: 'director-a' };
const identity = { managementAgentId: 'director-a', runtimeAgentId: 'director-a', vaultAgentId: 7 };
const base = { scope, eventId: 'evt-1', organizationId: 'org-a', identity };
const agentRequest = {
  schemaVersion: 1,
  requestId: 'areq_abcdefgh',
  from: { unitId: 'unit-design', paperclipAgentId: '11111111-1111-4111-8111-111111111111' },
  to: { kind: 'director' },
  need: 'Serve la decisione sul budget',
  why: 'Senza budget la consegna non parte',
  mandate: { issueId: '22222222-2222-4222-8222-222222222222', identifier: 'GOO-58' },
  requestedAt: '2026-11-09T23:50:00+01:00',
};
const event = { kind: 'agent_request', request: agentRequest };

// Bodies already queued in the service (copied from internal-paperclip-seats-work-stalled.test.ts).
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
  {
    ...base,
    eventId: 'evt-4',
    event: {
      kind: 'work_stalled',
      issueId: '11111111-1111-4111-8111-111111111111',
      identifier: 'AZ-12',
      title: 'Prepare the delivery',
      unitId: 'unit-design',
      status: 'in_progress',
      stalledSince: '2026-11-06T09:00:00+01:00',
      reason: 'no_activity',
    },
  },
];

describe('agent_request native wake', () => {
  it('s5975 the agent_request event wakes with the request', () => {
    const input = { ...base, event };
    expect(InternalPaperclipSeatNativeWakeRequestSchema.parse(input)).toStrictEqual(input);
    expect(PaperclipSeatNativeWakeEventSchema.parse(event)).toStrictEqual(event);
    expect(PaperclipSeatNativeWakeEventSchema.safeParse({ ...event, extra: 1 }).success).toBe(false);
    expect(PaperclipSeatNativeWakeEventSchema.safeParse({ kind: 'agent_request' }).success).toBe(false);
  });

  it('s5975 agent_request requires organizationId and identity', () => {
    const { organizationId: _organizationId, ...withoutOrganization } = base;
    const { identity: _identity, ...withoutIdentity } = base;
    for (const [input, path] of [
      [{ ...withoutOrganization, event }, ['organizationId']],
      [{ ...withoutIdentity, event }, ['identity']],
    ] as const) {
      const result = InternalPaperclipSeatNativeWakeRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues.map(issue => issue.path)).toContainEqual(path);
    }
  });

  it('s5975 the saved queued wake bodies still parse', () => {
    for (const input of legacyRequests) {
      expect(InternalPaperclipSeatNativeWakeRequestSchema.parse(input)).toStrictEqual(input);
    }
  });
});
