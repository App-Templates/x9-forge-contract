import { describe, it, expect } from 'vitest';
import {
  InternalAgentSendParamsSchema,
  InternalAgentSendRequestSchema,
  InternalAgentSendResponseSchema,
  InternalAgentSendErrorResponseSchema,
  internalAgentSendContract,
} from '../../../src/http/endpoints/internal-agent-send.js';

describe('InternalAgentSendParamsSchema', () => {
  it('parses a valid agentId (lowercase + dash)', () => {
    expect(InternalAgentSendParamsSchema.parse({ agentId: 'char-bellotti-abc123' }).agentId).toBe(
      'char-bellotti-abc123',
    );
  });

  it('accepts numeric agentIds', () => {
    expect(InternalAgentSendParamsSchema.parse({ agentId: 'agent-123' }).agentId).toBe('agent-123');
  });

  it('rejects uppercase agentIds (AGENT_ID regex)', () => {
    expect(() => InternalAgentSendParamsSchema.parse({ agentId: 'Char' })).toThrow();
  });

  it('rejects agentIds with special characters', () => {
    expect(() => InternalAgentSendParamsSchema.parse({ agentId: 'char_bellotti' })).toThrow();
    expect(() => InternalAgentSendParamsSchema.parse({ agentId: 'char.bellotti' })).toThrow();
    expect(() => InternalAgentSendParamsSchema.parse({ agentId: 'char bellotti' })).toThrow();
  });

  it('rejects empty agentId', () => {
    expect(() => InternalAgentSendParamsSchema.parse({ agentId: '' })).toThrow();
  });
});

describe('InternalAgentSendRequestSchema', () => {
  it('parses a valid request (positive chat id)', () => {
    const r = InternalAgentSendRequestSchema.parse({ chatId: '6244251507', text: 'Buongiorno.' });
    expect(r.chatId).toBe('6244251507');
    expect(r.text).toBe('Buongiorno.');
  });

  it('accepts a negative (group) chat id as a string', () => {
    const r = InternalAgentSendRequestSchema.parse({ chatId: '-1001234567890', text: 'ciao' });
    expect(r.chatId).toBe('-1001234567890');
  });

  it('rejects an empty chatId', () => {
    expect(() => InternalAgentSendRequestSchema.parse({ chatId: '', text: 'hi' })).toThrow();
  });

  it('rejects an empty text', () => {
    expect(() => InternalAgentSendRequestSchema.parse({ chatId: '123', text: '' })).toThrow();
  });

  it('rejects a numeric chatId (must be a string — chat ids exceed JS-safe range)', () => {
    expect(() =>
      InternalAgentSendRequestSchema.parse({ chatId: 6244251507, text: 'hi' }),
    ).toThrow();
  });

  it('rejects a missing text', () => {
    expect(() => InternalAgentSendRequestSchema.parse({ chatId: '123' })).toThrow();
  });
});

describe('InternalAgentSendResponseSchema', () => {
  it('parses a valid success response with messageId', () => {
    const r = InternalAgentSendResponseSchema.parse({ ok: true, messageId: 42 });
    expect(r.ok).toBe(true);
    expect(r.messageId).toBe(42);
  });

  it('parses a valid success response without messageId (optional)', () => {
    const r = InternalAgentSendResponseSchema.parse({ ok: true });
    expect(r.ok).toBe(true);
    expect(r.messageId).toBeUndefined();
  });

  it('rejects response with ok: false (wrong discriminator)', () => {
    expect(() => InternalAgentSendResponseSchema.parse({ ok: false })).toThrow();
  });

  it('rejects a non-numeric messageId', () => {
    expect(() => InternalAgentSendResponseSchema.parse({ ok: true, messageId: '42' })).toThrow();
  });
});

describe('InternalAgentSendErrorResponseSchema', () => {
  it('parses a valid error response', () => {
    const r = InternalAgentSendErrorResponseSchema.parse({ ok: false, error: 'agent not found' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('agent not found');
  });

  it('rejects an error with ok: true', () => {
    expect(() => InternalAgentSendErrorResponseSchema.parse({ ok: true, error: 'x' })).toThrow();
  });
});

describe('internalAgentSendContract', () => {
  it('declares POST /internal/agents/:agentId/send with secret auth', () => {
    expect(internalAgentSendContract.method).toBe('POST');
    expect(internalAgentSendContract.path).toBe('/internal/agents/:agentId/send');
    expect(internalAgentSendContract.authType).toBe('secret');
  });

  it('binds the params + body + response schemas', () => {
    expect(internalAgentSendContract.paramsSchema).toBe(InternalAgentSendParamsSchema);
    expect(internalAgentSendContract.bodySchema).toBe(InternalAgentSendRequestSchema);
    expect(internalAgentSendContract.responseSchema).toBe(InternalAgentSendResponseSchema);
  });
});
