import { describe, expect, it } from 'vitest';
import {
  INBOUND_EVENT_NOT_WOKEN_REASONS,
  INBOUND_EVENT_OUTCOMES,
  InboundEventDispositionSchema,
  inboundEmailDedupeKey,
} from '../../src/capability/paperclip/inbound-event.js';

const issueId = '11111111-1111-4111-8111-111111111111';
const commentId = '22222222-2222-4222-8222-222222222222';
const assigneeAgentId = '33333333-3333-4333-8333-333333333333';
const runId = '44444444-4444-4444-8444-444444444444';
const commented = { outcome: 'commented', issueId, commentId, assigneeAgentId, authorAgentId: null, woke: true, runId };
const notWoken = { ...commented, woke: false, runId: undefined, notWokenReason: 'daily_run_limit' };
const refusal = { nature: 'permission_refused', retry: 'never', nextMove: 'ask_director' };
const messageId = '010001a1ca7de3f4-0a1b2c3d-0000@email.amazonses.com';

describe('inbound Paperclip events', () => {
  it('s6348 evento-in-ingresso: accepts commented, duplicate and fixed refused outcomes', () => {
    const dedupeKey = inboundEmailDedupeKey(messageId);
    expect(dedupeKey).toBe(`<${messageId}>`);
    expect(inboundEmailDedupeKey(`<${messageId}>`)).toBe(dedupeKey);
    expect(inboundEmailDedupeKey(`  <${messageId}>  `)).toBe(dedupeKey);
    for (const disposition of [
      commented,
      notWoken,
      { ...commented, authorAgentId: '55555555-5555-4555-8555-555555555555' },
      { outcome: 'duplicate', dedupeKey },
      { outcome: 'duplicate', dedupeKey, issueId, commentId },
      { outcome: 'refused', disposition: refusal },
    ]) {
      expect(InboundEventDispositionSchema.parse(disposition)).toEqual(disposition);
    }
    expect(INBOUND_EVENT_OUTCOMES).toEqual(['commented', 'duplicate', 'refused']);
    expect(INBOUND_EVENT_NOT_WOKEN_REASONS).toEqual([
      'issue_closed', 'run_alive', 'daily_run_limit', 'daily_cost_limit', 'unknown',
    ]);
  });

  it('rejects self-authored comments and inconsistent wake evidence', () => {
    for (const disposition of [
      { ...commented, authorAgentId: assigneeAgentId },
      { ...commented, woke: false, runId: undefined },
      { ...commented, notWokenReason: 'run_alive' },
      { ...notWoken, runId },
      { outcome: 'refused' },
      { ...notWoken, notWokenReason: 'invented' },
      { ...commented, extra: true },
      { outcome: 'duplicate', dedupeKey: 'key', extra: true },
      { outcome: 'refused', disposition: refusal, extra: true },
      { outcome: 'refused', disposition: { ...refusal, retry: 'next_turn' } },
      { ...commented, authorAgentId: 'not-a-uuid' },
      { ...commented, issueId: 'not-a-uuid' },
      { ...commented, commentId: 'not-a-uuid' },
      { ...commented, assigneeAgentId: null },
      { ...commented, runId: 'not-a-uuid' },
      { outcome: 'duplicate', dedupeKey: '' },
      { outcome: 'duplicate', dedupeKey: 'x'.repeat(999) },
    ]) {
      expect(InboundEventDispositionSchema.safeParse(disposition).success, JSON.stringify(disposition)).toBe(false);
    }
    expect(InboundEventDispositionSchema.safeParse({ outcome: 'duplicate', dedupeKey: 'x'.repeat(998) }).success).toBe(true);
  });
});
