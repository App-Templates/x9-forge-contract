import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  InternalPaperclipSeatNativeWakeRequestSchema,
  PaperclipSeatNativeWakeEventSchema,
} from '../../../src/http/endpoints/internal-paperclip-seats.js';
import type * as SrcEndpoints from '../../../src/http/endpoints/index.js';

const built = createRequire(import.meta.url)('../../../dist/http/endpoints/index.cjs') as Pick<
  typeof SrcEndpoints,
  'InternalPaperclipSeatNativeWakeRequestSchema' | 'PaperclipSeatNativeWakeEventSchema'
>;

const scope = { tenantId: 't1', ownerId: 'o1', agentId: 'director-a' };
const identity = { managementAgentId: 'director-a', runtimeAgentId: 'director-a', vaultAgentId: 7 };
const base = { scope, eventId: 'evt-1', organizationId: 'org-a', identity };
const event = {
  kind: 'approved_units_failed',
  requestId: 'dec_b0633120',
  directorIssueId: '11111111-1111-4111-8111-111111111111',
  units: [{ unitId: 'area-1', reason: 'factory refused: 409' }],
  attempt: 1,
  maxAttempts: 3,
};

describe('s5884 source', () => {
  it('s5884 an approved_units_failed event is accepted', () => {
    const input = { ...base, event };
    expect(InternalPaperclipSeatNativeWakeRequestSchema.parse(input)).toStrictEqual(input);
    expect(PaperclipSeatNativeWakeEventSchema.parse(event)).toStrictEqual(event);
    const last = { ...event, attempt: 3 };
    expect(PaperclipSeatNativeWakeEventSchema.parse(last)).toStrictEqual(last);
  });

  it('s5884 attempt above maxAttempts is refused', () => {
    const result = InternalPaperclipSeatNativeWakeRequestSchema.safeParse({ ...base, event: { ...event, attempt: 4 } });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(i => i.path)).toContainEqual(['event', 'attempt']);
  });

  it('s5884 an extra field is refused', () => {
    expect(PaperclipSeatNativeWakeEventSchema.safeParse({ ...event, extra: true }).success).toBe(false);
    expect(PaperclipSeatNativeWakeEventSchema.safeParse({
      ...event, units: [{ unitId: 'a', reason: 'r', extra: 1 }],
    }).success).toBe(false);
  });

  it('s5884 empty units are refused', () => {
    expect(PaperclipSeatNativeWakeEventSchema.safeParse({ ...event, units: [] }).success).toBe(false);
  });

  it('s5884 requires organizationId and identity', () => {
    const { organizationId: _o, ...noOrg } = base;
    const { identity: _i, ...noIdentity } = base;
    expect(InternalPaperclipSeatNativeWakeRequestSchema.safeParse({ ...noOrg, event }).success).toBe(false);
    expect(InternalPaperclipSeatNativeWakeRequestSchema.safeParse({ ...noIdentity, event }).success).toBe(false);
  });

  it("s5884 today's four kinds still parse", () => {
    const today = [
      {
        ...base,
        event: {
          kind: 'email', messageId: '<m1@example.invalid>', threadKey: '<t1@example.invalid>', mode: 'request',
          from: 'capo@example.invalid', subject: 'Richiesta', receivedAt: '2026-11-02T09:11:00.000Z',
          excerpt: 'Testo', attachments: [{ name: 'a.pdf', contentType: 'application/pdf', size: 10 }],
        },
      },
      { scope, eventId: 'evt-2', event: { kind: 'research_done', researchId: 'r1', state: 'completed', question: 'Domanda?' } },
      {
        ...base, eventId: 'evt-3',
        event: { kind: 'dev_delivered', sessionIssue: 12, commit: 'a'.repeat(40), projectId: '33333333-3333-4333-8333-333333333333' },
      },
      {
        ...base, eventId: 'evt-4',
        event: {
          kind: 'work_stalled', issueId: '11111111-1111-4111-8111-111111111111', identifier: 'AZ-12',
          title: 'Prepare', unitId: 'unit-design', status: 'in_progress',
          stalledSince: '2026-11-06T09:00:00+01:00', reason: 'no_activity',
        },
      },
    ];
    for (const input of today) expect(InternalPaperclipSeatNativeWakeRequestSchema.parse(input)).toStrictEqual(input);
  });
});

describe('s5884 dist', () => {
  it('s5884 the CommonJS dist parses the new kind', () => {
    const input = { ...base, event };
    expect(built.InternalPaperclipSeatNativeWakeRequestSchema.parse(input)).toStrictEqual(input);
    expect(built.PaperclipSeatNativeWakeEventSchema.safeParse({ ...event, attempt: 4 }).success).toBe(false);
  });
});
