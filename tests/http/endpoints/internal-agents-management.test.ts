import { describe, expect, it } from 'vitest';
import {
  AgentManagementErrorResponseSchema,
  agentCommandContract,
  agentCommandsPath,
  agentManagementPath,
  agentManagementStateContract,
  reloadAgentContract,
} from '../../../src/http/index.js';

describe('R1b management endpoints', () => {
  it('declares secret-auth command and state routes next to reload/stop', () => {
    expect(agentCommandContract).toMatchObject({ method: 'POST', path: '/internal/agents/:agentId/commands', authType: 'secret' });
    expect(agentManagementStateContract).toMatchObject({ method: 'GET', path: '/internal/agents/:agentId/management', authType: 'secret' });
    expect(agentCommandContract.paramsSchema).toBe(reloadAgentContract.paramsSchema);
  });

  it('builds validated paths', () => {
    expect(agentCommandsPath('x9')).toBe('/internal/agents/x9/commands');
    expect(agentManagementPath('x9-meditazione')).toBe('/internal/agents/x9-meditazione/management');
    expect(() => agentCommandsPath('../x9')).toThrow();
    expect(() => agentManagementPath('X9')).toThrow();
  });

  it('distinguishes idempotency conflicts and stale versions', () => {
    expect(AgentManagementErrorResponseSchema.safeParse({ ok: false, error: 'idempotency_conflict' }).success).toBe(true);
    expect(AgentManagementErrorResponseSchema.safeParse({ ok: false, error: 'stale_version', currentVersion: 5 }).success).toBe(true);
    expect(AgentManagementErrorResponseSchema.safeParse({ ok: false, error: 'stale_version' }).success).toBe(false);
    expect(AgentManagementErrorResponseSchema.safeParse({ ok: false, error: 'compose_failed' }).success).toBe(false);
  });

  it('validates bodies and responses through the contract', () => {
    expect(agentCommandContract.bodySchema.safeParse({ action: 'apply-config', requestId: 'req-00000002', desiredVersion: 3 }).success).toBe(true);
    expect(agentCommandContract.responseSchema.safeParse({
      ok: true, agentId: 'x9', requestId: 'req-00000002', replayed: true, action: 'reload', outcome: 'ok',
      results: [{ target: { kind: 'runtime', targetId: 'x9' }, outcome: 'ok' }], completedAt: '2026-10-07T01:00:00Z',
    }).success).toBe(true);
  });
});
