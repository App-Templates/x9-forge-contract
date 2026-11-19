import { describe, expect, it } from 'vitest';
import { AgentSpendResponseSchema, ricercaAgentSpendContract, socialAgentSpendContract } from '../../src/http/index.js';

const day = {
  agentId: 'samira', capability: 'social', day: '2026-11-20',
  spentUsd: 0.42, reservedUsd: 0, capUsd: 2, calls: 0, webCalls: 0,
  budgetStops: 0, budgetReachedAt: null, overrunAt: null,
};

describe('social listening per-agent spend contract', () => {
  it('exports the shared social spend route through the HTTP entry point', () => {
    expect(socialAgentSpendContract).toBeDefined();
    expect(socialAgentSpendContract).toMatchObject({
      method: 'GET', path: '/internal/capability/agents/:agentId/spend', authType: 'secret',
    });
  });

  it('reuses exactly the ricerca path, params, query and response schemas', () => {
    expect(socialAgentSpendContract.path).toBe(ricercaAgentSpendContract.path);
    for (const key of ['paramsSchema', 'querySchema', 'responseSchema'] as const) {
      expect(socialAgentSpendContract[key]).toBe(ricercaAgentSpendContract[key]);
    }
  });

  it('accepts social spend values and rejects an undeclared capability', () => {
    const value = { days: [day], queuedNow: 0 };
    expect(AgentSpendResponseSchema.safeParse(value)).toEqual({ success: true, data: value });
    expect(AgentSpendResponseSchema.safeParse({
      ...value, days: [{ ...day, capability: 'altro' }],
    }).success).toBe(false);
  });
});
