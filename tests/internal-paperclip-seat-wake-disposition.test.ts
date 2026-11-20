import { describe, expect, it } from 'vitest';
import {
  InternalPaperclipSeatNativeWakeResponseSchema,
  InternalPaperclipSeatReplyWakeResponseSchema,
} from '../src/http/endpoints/internal-paperclip-seats.js';

const issueId = '11111111-1111-4111-8111-111111111111';
const commentId = '22222222-2222-4222-8222-222222222222';
const runId = '33333333-3333-4333-8333-333333333333';
const otherId = '44444444-4444-4444-8444-444444444444';
const disposition = {
  outcome: 'commented', issueId, commentId,
  assigneeAgentId: '55555555-5555-4555-8555-555555555555',
  authorAgentId: null, woke: true, runId,
};

describe('Paperclip seat wake dispositions', () => {
  for (const [name, schema] of [
    ['reply-wake', InternalPaperclipSeatReplyWakeResponseSchema],
    ['native-wake', InternalPaperclipSeatNativeWakeResponseSchema],
  ] as const) {
    it(`${name}: accepts coherent wake, duplicate, refusal and not-woken dispositions`, () => {
      for (const response of [
        { result: 'woken', issueId, runId, disposition },
        { result: 'woken', issueId, runId, disposition: { ...disposition, runId: undefined } },
        { result: 'duplicate', disposition: { outcome: 'duplicate', dedupeKey: '<m1@example.invalid>' } },
        { result: 'not_waiting', issueId, disposition: { ...disposition, woke: false, runId: undefined, notWokenReason: 'run_alive' } },
        { result: 'not_waiting', issueId, disposition: { outcome: 'refused', disposition: { nature: 'permission_refused', retry: 'never', nextMove: 'ask_director' } } },
      ]) {
        expect(schema.parse(response)).toEqual(response);
      }
    });

    it(`${name}: rejects conflicting wake results and correlation ids`, () => {
      for (const response of [
        { result: 'not_waiting', issueId, disposition },
        { result: 'woken', issueId, runId, disposition: { outcome: 'duplicate', dedupeKey: '<m1@example.invalid>' } },
        { result: 'woken', issueId, runId, disposition: { ...disposition, issueId: otherId } },
        { result: 'woken', issueId, runId, disposition: { ...disposition, runId: otherId } },
      ]) {
        expect(schema.safeParse(response).success, JSON.stringify(response)).toBe(false);
      }
    });

    it(`${name}: preserves current production response shapes without disposition`, () => {
      for (const response of [
        { result: 'not_waiting', issueId },
        { result: 'woken', issueId, runId },
        { result: 'duplicate' },
      ]) {
        const parsed = schema.parse(response);
        expect(parsed).toEqual(response);
        expect(parsed).not.toHaveProperty('disposition');
      }
    });
  }

  it('native-wake: preserves opened and rate-limited production responses', () => {
    for (const response of [{ result: 'opened', issueId }, { result: 'rate_limited' }]) {
      expect(InternalPaperclipSeatNativeWakeResponseSchema.parse(response)).toEqual(response);
    }
  });
});
