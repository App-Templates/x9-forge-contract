import { describe, expect, it } from 'vitest';
import {
  PaperclipSeatNativeWakeEventSchema,
  internalPaperclipSeatNativeWakeContract,
} from '../src/http/endpoints/internal-paperclip-seats.js';
import { DecisionRequestSchema } from '../src/organization/decision-request.js';

// Current cap-email reply shape, with synthetic identities and no secrets.
const email = {
  kind: 'email',
  messageId: '<reply-1@example.invalid>',
  threadKey: '<question-1@example.invalid>',
  mode: 'reply',
  from: 'owner@example.invalid',
  subject: 'Re: Piano di progetto',
  receivedAt: '2026-11-10T09:11:00.000Z',
  excerpt: 'Rivediamo il piano prima di procedere.',
  attachments: [],
};
const base = {
  scope: { tenantId: 't1', ownerId: 'o1', agentId: 'director-a' },
  eventId: 'evt-reply-1',
  organizationId: 'org-a',
  identity: { managementAgentId: 'director-a', runtimeAgentId: 'director-a', vaultAgentId: 7 },
};
const issueId = '11111111-1111-4111-8111-111111111111';

describe('email native-wake project reference (v1.134.0)', () => {
  it('s6118 sveglia-email-senza-progetto: the email native-wake event keeps an optional projectRef with the same limits as DecisionRequest.projectId, and an event without it still parses', () => {
    const without = PaperclipSeatNativeWakeEventSchema.parse(email);
    expect(without).toEqual(email);
    expect(without).not.toHaveProperty('projectRef');
    const withProject = { ...email, projectRef: 'good-choice' };
    expect(PaperclipSeatNativeWakeEventSchema.parse(withProject)).toEqual(withProject);
    for (const projectRef of [undefined, 'a', 'p'.repeat(64), '', 'p'.repeat(65), null, 42]) {
      const expected = DecisionRequestSchema.shape.projectId.safeParse(projectRef);
      const actual = PaperclipSeatNativeWakeEventSchema.safeParse({ ...email, projectRef });
      expect(actual.success, String(projectRef)).toBe(expected.success);
      if (actual.success) expect(actual.data).toEqual({ ...email, projectRef });
    }
  });

  it('s6118 projectRef refuses an empty string and 65 characters', () => {
    for (const projectRef of ['', 'p'.repeat(65)]) {
      const parsed = PaperclipSeatNativeWakeEventSchema.safeParse({ ...email, projectRef });
      expect(parsed.success).toBe(false);
      if (!parsed.success) expect(parsed.error.issues.some(issue => issue.path[0] === 'projectRef')).toBe(true);
    }
  });

  it('s6118 projectRef is refused on non-email events', () => {
    const events = [
      { kind: 'research_done', researchId: 'r1', state: 'completed', question: 'Question?' },
      { kind: 'dev_delivered', sessionIssue: 12, commit: 'a'.repeat(40), projectId: issueId },
      {
        kind: 'work_stalled', issueId, identifier: 'ORG-1', title: 'Review plan', unitId: 'design',
        status: 'in_progress', stalledSince: email.receivedAt, reason: 'no_activity',
      },
      {
        kind: 'approved_units_failed', requestId: 'req-123456', directorIssueId: issueId,
        units: [{ unitId: 'design', reason: 'Unavailable' }], attempt: 1, maxAttempts: 3,
      },
      {
        kind: 'agent_request',
        request: {
          schemaVersion: 1, requestId: 'areq_12345678',
          from: { unitId: 'design', paperclipAgentId: issueId }, to: { kind: 'director' },
          need: 'Review plan', why: 'Owner requested changes',
          mandate: { issueId, identifier: 'ORG-1' }, requestedAt: email.receivedAt,
        },
      },
    ];
    for (const event of events) {
      expect(PaperclipSeatNativeWakeEventSchema.safeParse(event).success, event.kind).toBe(true);
      expect(PaperclipSeatNativeWakeEventSchema.safeParse({ ...event, projectRef: 'good-choice' }).success, event.kind).toBe(false);
    }
  });

  it('s6118 internalPaperclipSeatNativeWakeContract body keeps projectRef', () => {
    const body = { ...base, event: { ...email, projectRef: 'good-choice' } };
    expect(internalPaperclipSeatNativeWakeContract.bodySchema.parse(body)).toEqual(body);
    const without = { ...base, event: email };
    expect(internalPaperclipSeatNativeWakeContract.bodySchema.parse(without)).toEqual(without);
  });
});
