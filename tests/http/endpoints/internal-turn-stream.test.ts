import { describe, it, expect } from 'vitest';
import {
  InternalTurnStreamRequestSchema,
  InternalTurnStreamErrorResponseSchema,
  internalTurnStreamContract,
} from '../../../src/http/endpoints/internal-turn-stream.js';

// Same body shape as /internal/turn
const validRequest = {
  channelId: 'glasses',
  sessionId: 'session-xyz',
  message: 'Start streaming please.',
};

describe('InternalTurnStreamRequestSchema (re-export of /internal/turn body)', () => {
  it('parses a valid request body', () => {
    const result = InternalTurnStreamRequestSchema.parse(validRequest);
    expect(result.channelId).toBe('glasses');
  });

  it('rejects uppercase channelId', () => {
    expect(() =>
      InternalTurnStreamRequestSchema.parse({ ...validRequest, channelId: 'BAD' }),
    ).toThrow();
  });
});

describe('InternalTurnStreamErrorResponseSchema', () => {
  it('parses a non-200 JSON error body before stream opens', () => {
    const result = InternalTurnStreamErrorResponseSchema.parse({
      ok: false,
      error: 'Rate limited',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Rate limited');
  });
});

describe('internalTurnStreamContract', () => {
  it('declares POST /internal/turn/stream as SSE with secret auth', () => {
    expect(internalTurnStreamContract.method).toBe('POST');
    expect(internalTurnStreamContract.path).toBe('/internal/turn/stream');
    expect(internalTurnStreamContract.authType).toBe('secret');
    expect(internalTurnStreamContract.responseType).toBe('sse');
  });
});
