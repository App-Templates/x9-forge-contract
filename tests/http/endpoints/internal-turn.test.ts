import { describe, it, expect } from 'vitest';
import {
  LLMMessageSchema,
  InternalTurnRequestSchema,
  InternalTurnResponseSchema,
  internalTurnContract,
} from '../../../src/http/endpoints/internal-turn.js';

// Real fixtures derived from agent-core internalTurnSchema (index.ts:176-192)
const validRequest = {
  channelId: 'glasses',
  sessionId: 'session-abc-123',
  message: 'What is on my calendar today?',
  history: [
    { role: 'user' as const, content: 'Hello' },
    { role: 'assistant' as const, content: 'Hi there!' },
  ],
};

const validResponse = {
  ok: true as const,
  reply: 'You have 3 meetings today.',
  updatedHistory: [
    { role: 'user' as const, content: 'What is on my calendar today?' },
    { role: 'assistant' as const, content: 'You have 3 meetings today.' },
  ],
};

describe('LLMMessageSchema', () => {
  it('parses a minimal user message', () => {
    const result = LLMMessageSchema.parse({ role: 'user', content: 'hi' });
    expect(result.role).toBe('user');
  });

  it('parses assistant message with toolCalls', () => {
    const msg = {
      role: 'assistant' as const,
      content: '',
      toolCalls: [{ id: 'call_1', name: 'calendar_today', input: { tz: 'Europe/Rome' } }],
    };
    const result = LLMMessageSchema.parse(msg);
    expect(result.toolCalls?.[0]?.name).toBe('calendar_today');
  });

  it('parses a tool-result message with toolCallId + toolName', () => {
    const result = LLMMessageSchema.parse({
      role: 'tool',
      content: '[]',
      toolCallId: 'call_1',
      toolName: 'calendar_today',
    });
    expect(result.toolName).toBe('calendar_today');
  });

  it('rejects an invalid role', () => {
    expect(() => LLMMessageSchema.parse({ role: 'robot', content: 'x' })).toThrow();
  });
});

describe('InternalTurnRequestSchema', () => {
  it('parses a valid request with history', () => {
    const result = InternalTurnRequestSchema.parse(validRequest);
    expect(result.channelId).toBe('glasses');
    expect(result.history).toHaveLength(2);
  });

  it('parses a valid request WITHOUT history (optional)', () => {
    const { history: _omit, ...noHistory } = validRequest;
    void _omit;
    const result = InternalTurnRequestSchema.parse(noHistory);
    expect(result.history).toBeUndefined();
  });

  it('rejects channelId with uppercase letters', () => {
    expect(() =>
      InternalTurnRequestSchema.parse({ ...validRequest, channelId: 'Glasses' }),
    ).toThrow();
  });

  it('rejects channelId > 64 chars', () => {
    const tooLong = 'a'.repeat(65);
    expect(() =>
      InternalTurnRequestSchema.parse({ ...validRequest, channelId: tooLong }),
    ).toThrow();
  });

  it('rejects channelId with special characters', () => {
    expect(() =>
      InternalTurnRequestSchema.parse({ ...validRequest, channelId: 'glasses_1' }),
    ).toThrow();
  });

  it('rejects sessionId with uppercase letters', () => {
    expect(() =>
      InternalTurnRequestSchema.parse({ ...validRequest, sessionId: 'Session-abc' }),
    ).toThrow();
  });

  it('rejects empty message', () => {
    expect(() =>
      InternalTurnRequestSchema.parse({ ...validRequest, message: '' }),
    ).toThrow();
  });
});

describe('InternalTurnResponseSchema', () => {
  it('parses a valid response (real fixture)', () => {
    const result = InternalTurnResponseSchema.parse(validResponse);
    expect(result.ok).toBe(true);
    expect(result.reply).toBe('You have 3 meetings today.');
    expect(result.updatedHistory).toHaveLength(2);
  });

  it('rejects response with ok: false (wrong discriminator)', () => {
    expect(() =>
      InternalTurnResponseSchema.parse({ ...validResponse, ok: false }),
    ).toThrow();
  });
});

describe('internalTurnContract', () => {
  it('declares POST /internal/turn with secret auth', () => {
    expect(internalTurnContract.method).toBe('POST');
    expect(internalTurnContract.path).toBe('/internal/turn');
    expect(internalTurnContract.authType).toBe('secret');
  });
});
