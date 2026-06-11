import { describe, it, expect } from 'vitest';
import {
  ToolCallRequestSchema,
  ToolCallResponseSchema,
  type ToolCallRequest,
  type ToolCallResponse,
} from '../../src/capability/index';

const VALID_REQUEST: ToolCallRequest = {
  callId: 'call-abc123',
  tool: 'memory_recall',
  input: { query: 'last week meeting notes' },
  agentId: 'agent-master',
  sessionId: 'session-xyz',
};

describe('ToolCallRequestSchema', () => {
  it('parses a valid tool call request', () => {
    const result = ToolCallRequestSchema.safeParse(VALID_REQUEST);
    expect(result.success).toBe(true);
  });

  it('parses request with optional credentials', () => {
    const withCreds = { ...VALID_REQUEST, credentials: { OPENAI_API_KEY: 'sk-test' } };
    const result = ToolCallRequestSchema.safeParse(withCreds);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.credentials).toEqual({ OPENAI_API_KEY: 'sk-test' });
    }
  });

  it('rejects request without callId (fail-loud)', () => {
    const { callId: _, ...withoutCallId } = VALID_REQUEST;
    expect(ToolCallRequestSchema.safeParse(withoutCallId).success).toBe(false);
  });

  it('rejects request with empty agentId (fail-loud)', () => {
    expect(ToolCallRequestSchema.safeParse({ ...VALID_REQUEST, agentId: '' }).success).toBe(false);
  });

  // F-2 (v1.13.0) — per-agent memory-scope identity on dispatch
  it('parses request with optional tenantId/ownerId (F-2 identity triple)', () => {
    const withIdentity = { ...VALID_REQUEST, tenantId: 'tenant-7', ownerId: 'owner-42' };
    const result = ToolCallRequestSchema.safeParse(withIdentity);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tenantId).toBe('tenant-7');
      expect(result.data.ownerId).toBe('owner-42');
    }
  });

  it('still parses without tenantId/ownerId (backward compat — env fallback path)', () => {
    const result = ToolCallRequestSchema.safeParse(VALID_REQUEST);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tenantId).toBeUndefined();
      expect(result.data.ownerId).toBeUndefined();
    }
  });

  it('rejects empty-string tenantId/ownerId (fail-loud, no silent "" scope)', () => {
    expect(ToolCallRequestSchema.safeParse({ ...VALID_REQUEST, tenantId: '' }).success).toBe(false);
    expect(ToolCallRequestSchema.safeParse({ ...VALID_REQUEST, ownerId: '' }).success).toBe(false);
  });
});

describe('ToolCallResponseSchema', () => {
  it('parses success response', () => {
    const success: ToolCallResponse = {
      callId: 'call-abc123',
      status: 'success',
      output: { memories: ['Team standup at 10am'] },
    };
    const result = ToolCallResponseSchema.safeParse(success);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('success');
    }
  });

  it('parses error response with valid code', () => {
    const error: ToolCallResponse = {
      callId: 'call-abc123',
      status: 'error',
      error: 'Tool not found: unknown_tool',
      code: 'TOOL_NOT_FOUND',
    };
    const result = ToolCallResponseSchema.safeParse(error);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('error');
    }
  });

  it('rejects error response with invalid code (fail-loud — Bug #15 regression)', () => {
    // Any untyped error code that slips through must be caught here.
    const invalidCode = {
      callId: 'call-abc123',
      status: 'error',
      error: 'Something went wrong',
      code: 'UNKNOWN_CODE',  // not in the enum → must fail
    };
    expect(ToolCallResponseSchema.safeParse(invalidCode).success).toBe(false);
  });

  it('rejects response with unknown status (fail-loud)', () => {
    const unknownStatus = { callId: 'x', status: 'pending', output: null };
    expect(ToolCallResponseSchema.safeParse(unknownStatus).success).toBe(false);
  });
});
