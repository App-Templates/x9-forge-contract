import { describe, expect, it } from 'vitest';
import * as http from '../../../src/http/index.js';
import * as agent from '../../../src/agent/index.js';

describe('C5 permanent deletion HTTP boundary', () => {
  it('exports a separate POST with secret auth and canonical schemas', () => {
    expect(http.agentDeletionContract).toMatchObject({ method: 'POST', path: '/internal/agents/:agentId/deletion', authType: 'secret' });
    expect(http.agentDeletionContract.bodySchema).toBe(agent.AgentDeletionCommandSchema);
    expect(http.agentDeletionContract.responseSchema).toBe(agent.AgentDeletionResultSchema);
    expect(http.agentDeletionContract.paramsSchema.shape.agentId).toBe(http.ReloadAgentParamsSchema.shape.agentId);
  });
  it('builds the management path and accepts legacy long canonical IDs', () => {
    expect(http.agentDeletionPath).toBeTypeOf('function');
    expect(http.agentDeletionPath('forge-child')).toBe('/internal/agents/forge-child/deletion');
    expect(http.agentDeletionPath('char-char-1modellista-48q71n1m')).toBe('/internal/agents/char-char-1modellista-48q71n1m/deletion');
  });
  it.each(['../other', 'Upper', 'bad/name', '', 'a?other'])('rejects an unsafe path: %s', id => {
    expect(http.agentDeletionPath).toBeTypeOf('function'); expect(() => http.agentDeletionPath(id)).toThrow();
  });
  it.each(['invalid_request','agent_not_found','protected_agent','confirmation_mismatch','identity_mismatch','idempotency_conflict','command_in_progress','source_unavailable'])('accepts sanitized not-processed error: %s', error => {
    expect(http.AgentDeletionErrorResponseSchema).toBeDefined(); expect(http.AgentDeletionErrorResponseSchema.parse({ ok: false, error })).toEqual({ ok: false, error });
  });
  it('rejects a raw error and additional private diagnostics', () => {
    expect(http.AgentDeletionErrorResponseSchema).toBeDefined();
    expect(http.AgentDeletionErrorResponseSchema.safeParse({ ok: false, error: 'provider token' }).success).toBe(false);
    expect(http.AgentDeletionErrorResponseSchema.safeParse({ ok: false, error: 'source_unavailable', detail: '/shared/path' }).success).toBe(false);
  });
  it('rejects forged successful error responses and extra path params', () => {
    expect(http.AgentDeletionErrorResponseSchema).toBeDefined(); expect(http.AgentDeletionParamsSchema).toBeDefined();
    expect(http.AgentDeletionErrorResponseSchema.safeParse({ ok: true, error: 'agent_not_found' }).success).toBe(false);
    expect(http.AgentDeletionParamsSchema.safeParse({ agentId: 'forge-child', ownerId: 'other' }).success).toBe(false);
  });
});
