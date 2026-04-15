import { describe, it, expect } from 'vitest';
import {
  StopAgentParamsSchema,
  StopAgentResponseSchema,
  StopAgentErrorResponseSchema,
  stopAgentContract,
} from '../../../src/http/endpoints/internal-agents-stop.js';

// Structurally identical to reload
const validResponse = { ok: true as const, agentId: 'stefano-main' };

describe('StopAgentParamsSchema', () => {
  it('parses a valid lowercase+dash agentId', () => {
    expect(StopAgentParamsSchema.parse({ agentId: 'stefano-main' }).agentId).toBe('stefano-main');
  });

  it('rejects uppercase agentId', () => {
    expect(() => StopAgentParamsSchema.parse({ agentId: 'Stefano' })).toThrow();
  });
});

describe('StopAgentResponseSchema', () => {
  it('parses a valid success response', () => {
    const result = StopAgentResponseSchema.parse(validResponse);
    expect(result.ok).toBe(true);
    expect(result.agentId).toBe('stefano-main');
  });

  it('rejects response missing agentId', () => {
    expect(() => StopAgentResponseSchema.parse({ ok: true })).toThrow();
  });
});

describe('StopAgentErrorResponseSchema', () => {
  it('parses a valid error response', () => {
    const result = StopAgentErrorResponseSchema.parse({ ok: false, error: 'Agent not running' });
    expect(result.ok).toBe(false);
  });
});

describe('stopAgentContract', () => {
  it('declares POST /internal/agents/:agentId/stop with secret auth', () => {
    expect(stopAgentContract.method).toBe('POST');
    expect(stopAgentContract.path).toBe('/internal/agents/:agentId/stop');
    expect(stopAgentContract.authType).toBe('secret');
  });
});
