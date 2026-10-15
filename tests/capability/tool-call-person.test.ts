import { describe, expect, it } from 'vitest';
import { ToolCallRequestSchema } from '../../src/capability/tool-call.js';

const base = {
  callId: 'call-abc123',
  tool: 'calendar_list_events',
  input: { from: '2026-10-15' },
  agentId: 'agent-master',
  sessionId: 'session-xyz',
};

describe('ToolCallRequestSchema person attestation (additive)', () => {
  it('accepts a body without vaultAgentId and personRef, as before', () => {
    const parsed = ToolCallRequestSchema.safeParse(base);
    expect(parsed.success).toBe(true);
  });

  it('accepts a body with both fields and keeps them out of input', () => {
    const parsed = ToolCallRequestSchema.safeParse({ ...base, vaultAgentId: 42, personRef: 'person-1' });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.vaultAgentId).toBe(42);
      expect(parsed.data.personRef).toBe('person-1');
      expect(parsed.data.input).toEqual({ from: '2026-10-15' });
      expect('vaultAgentId' in parsed.data.input).toBe(false);
      expect('personRef' in parsed.data.input).toBe(false);
    }
  });

  it('rejects an empty personRef', () => {
    expect(ToolCallRequestSchema.safeParse({ ...base, personRef: '' }).success).toBe(false);
  });

  it('rejects vaultAgentId 0, negative, fractional or a string', () => {
    for (const vaultAgentId of [0, -1, 1.5, '42']) {
      expect(ToolCallRequestSchema.safeParse({ ...base, vaultAgentId }).success).toBe(false);
    }
  });
});
