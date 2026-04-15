import { describe, it, expect } from 'vitest';
import {
  InternalQueryRequestSchema,
  InternalQueryResponseSchema,
  InternalQueryErrorResponseSchema,
  internalQueryContract,
} from '../../../src/http/endpoints/internal-query.js';

// Real fixture from agent-core internalQuerySchema (index.ts:162-166)
const fullRequest = {
  question: 'What time is it?',
  sessionId: 'test-session',
  context: 'User is in Italy',
};

describe('InternalQueryRequestSchema', () => {
  it('parses a request with all fields (real fixture)', () => {
    const result = InternalQueryRequestSchema.parse(fullRequest);
    expect(result.question).toBe('What time is it?');
    expect(result.sessionId).toBe('test-session');
    expect(result.context).toBe('User is in Italy');
  });

  it('parses a request with only question (sessionId/context optional)', () => {
    const result = InternalQueryRequestSchema.parse({ question: 'x?' });
    expect(result.sessionId).toBeUndefined();
    expect(result.context).toBeUndefined();
  });

  it('rejects empty question', () => {
    expect(() => InternalQueryRequestSchema.parse({ question: '' })).toThrow();
  });
});

describe('InternalQueryResponseSchema', () => {
  it('parses a valid answer response', () => {
    const result = InternalQueryResponseSchema.parse({ answer: 'It is 15:30 CET.' });
    expect(result.answer).toBe('It is 15:30 CET.');
  });

  it('rejects response missing answer', () => {
    expect(() => InternalQueryResponseSchema.parse({})).toThrow();
  });
});

describe('InternalQueryErrorResponseSchema', () => {
  it('parses an error response', () => {
    const result = InternalQueryErrorResponseSchema.parse({ error: 'timeout' });
    expect(result.error).toBe('timeout');
  });
});

describe('internalQueryContract', () => {
  it('declares POST /internal/query with secret auth', () => {
    expect(internalQueryContract.method).toBe('POST');
    expect(internalQueryContract.path).toBe('/internal/query');
    expect(internalQueryContract.authType).toBe('secret');
  });
});
