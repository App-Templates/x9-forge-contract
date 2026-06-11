import { describe, it, expect } from 'vitest';
import {
  ReloadAgentParamsSchema,
  ReloadAgentResponseSchema,
  ReloadAgentErrorResponseSchema,
  reloadAgentContract,
} from '../../../src/http/endpoints/internal-agents-reload.js';

// Real fixture from agent-core services/agent-core/src/index.ts:362
const validResponse = { ok: true as const, agentId: 'stefano-main' };
const validParams = { agentId: 'stefano-main' };

describe('ReloadAgentParamsSchema', () => {
  it('parses a valid agentId (lowercase + dash)', () => {
    expect(ReloadAgentParamsSchema.parse(validParams).agentId).toBe('stefano-main');
  });

  it('accepts numeric agentIds', () => {
    expect(ReloadAgentParamsSchema.parse({ agentId: 'agent-123' }).agentId).toBe('agent-123');
  });

  it('rejects uppercase agentIds (AGENT_ID regex)', () => {
    expect(() => ReloadAgentParamsSchema.parse({ agentId: 'Stefano' })).toThrow();
  });

  it('rejects agentIds with special characters', () => {
    expect(() => ReloadAgentParamsSchema.parse({ agentId: 'stefano_main' })).toThrow();
    expect(() => ReloadAgentParamsSchema.parse({ agentId: 'stefano.main' })).toThrow();
    expect(() => ReloadAgentParamsSchema.parse({ agentId: 'ste fano' })).toThrow();
  });

  it('rejects empty agentId', () => {
    expect(() => ReloadAgentParamsSchema.parse({ agentId: '' })).toThrow();
  });
});

describe('ReloadAgentResponseSchema', () => {
  // v1.13.2: bot-less reload marker (F-1 follow-up)
  it("parses the bot-less response { ok, agentId, telegram: 'skipped' }", () => {
    const r = ReloadAgentResponseSchema.parse({ ok: true, agentId: 'a-1', telegram: 'skipped' });
    expect(r.telegram).toBe('skipped');
  });

  it('rejects unknown telegram values (only the skipped marker is legal)', () => {
    expect(ReloadAgentResponseSchema.safeParse({ ok: true, agentId: 'a-1', telegram: 'on' }).success).toBe(false);
  });

  it('parses a valid success response (real fixture)', () => {
    const result = ReloadAgentResponseSchema.parse(validResponse);
    expect(result.ok).toBe(true);
    expect(result.agentId).toBe('stefano-main');
  });

  it('rejects response with ok: false (wrong discriminator)', () => {
    expect(() => ReloadAgentResponseSchema.parse({ ok: false, agentId: 'x' })).toThrow();
  });

  it('rejects response missing agentId', () => {
    expect(() => ReloadAgentResponseSchema.parse({ ok: true })).toThrow();
  });
});

describe('ReloadAgentErrorResponseSchema', () => {
  it('parses a valid error response', () => {
    const result = ReloadAgentErrorResponseSchema.parse({ ok: false, error: 'Agent not found' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Agent not found');
  });

  it('rejects error with ok: true', () => {
    expect(() => ReloadAgentErrorResponseSchema.parse({ ok: true, error: 'x' })).toThrow();
  });
});

describe('reloadAgentContract', () => {
  it('declares POST /internal/agents/:agentId/reload with secret auth', () => {
    expect(reloadAgentContract.method).toBe('POST');
    expect(reloadAgentContract.path).toBe('/internal/agents/:agentId/reload');
    expect(reloadAgentContract.authType).toBe('secret');
  });
});
