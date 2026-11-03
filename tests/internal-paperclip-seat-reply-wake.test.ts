import { describe, expect, it } from 'vitest';
import {
  INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH,
  INTERNAL_PAPERCLIP_SEATS_PATH,
  InternalPaperclipSeatReplyWakeRequestSchema,
  InternalPaperclipSeatReplyWakeResponseSchema,
  internalPaperclipSeatReplyWakeContract,
} from '../src/http/endpoints/index.js';

const request = {
  organizationId: 'org-a',
  identity: { managementAgentId: 'capo-finanza', runtimeAgentId: 'capo-finanza', vaultAgentId: 42 },
  messageId: '<m1@example.invalid>',
};
const issueId = '11111111-1111-4111-8111-111111111111';
const runId = '22222222-2222-4222-8222-222222222222';

describe('internal Paperclip seat reply-wake contract', () => {
  it('accepts a valid request', () => {
    expect(InternalPaperclipSeatReplyWakeRequestSchema.parse(request)).toEqual(request);
  });

  it('rejects blank, empty and oversized message ids', () => {
    for (const messageId of ['   ', '', 'a'.repeat(999)]) {
      expect(InternalPaperclipSeatReplyWakeRequestSchema.safeParse({ ...request, messageId }).success).toBe(false);
    }
    expect(InternalPaperclipSeatReplyWakeRequestSchema.safeParse({ ...request, messageId: 'a'.repeat(998) }).success).toBe(true);
  });

  it('rejects an identity without vaultAgentId and unknown fields', () => {
    const { vaultAgentId: _omitted, ...identity } = request.identity;
    expect(InternalPaperclipSeatReplyWakeRequestSchema.safeParse({ ...request, identity }).success).toBe(false);
    expect(InternalPaperclipSeatReplyWakeRequestSchema.safeParse({ ...request, extra: 1 }).success).toBe(false);
  });

  it('woken requires issueId and runId', () => {
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'woken', issueId, runId }).success).toBe(true);
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'woken', issueId }).success).toBe(false);
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'woken', runId }).success).toBe(false);
  });

  it('skipped and not_waiting require issueId and never carry runId', () => {
    for (const result of ['skipped', 'not_waiting']) {
      expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result }).success).toBe(false);
      expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result, issueId }).success).toBe(true);
      expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result, issueId, runId }).success).toBe(false);
    }
  });

  it('no_mandate and ambiguous carry no issueId; duplicate is free', () => {
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'no_mandate', issueId }).success).toBe(false);
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'no_mandate' }).success).toBe(true);
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'ambiguous', issueId }).success).toBe(false);
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'ambiguous' }).success).toBe(true);
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'duplicate' }).success).toBe(true);
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'duplicate', issueId }).success).toBe(true);
    expect(InternalPaperclipSeatReplyWakeResponseSchema.safeParse({ result: 'duplicate', runId }).success).toBe(false);
  });

  it('declares a secret-authenticated POST on its own path', () => {
    expect(internalPaperclipSeatReplyWakeContract.method).toBe('POST');
    expect(internalPaperclipSeatReplyWakeContract.authType).toBe('secret');
    expect(internalPaperclipSeatReplyWakeContract.path).toBe('/internal/paperclip/seats/reply-wake');
    expect(internalPaperclipSeatReplyWakeContract.path).not.toBe(INTERNAL_PAPERCLIP_SEAT_ISSUES_PATH);
    expect(internalPaperclipSeatReplyWakeContract.path).not.toBe(INTERNAL_PAPERCLIP_SEATS_PATH);
  });
});
