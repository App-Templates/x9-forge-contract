import { describe, it, expect } from 'vitest';
import {
  AgentConfigStaleSchema,
  AgentSpendResponseSchema,
  AgentGrowthResponseSchema,
  AgentSpendQuerySchema,
  CapabilityAgentRouteErrorSchema,
  capAgentConfigPath,
  capAgentGrowthPath,
  capAgentSpendPath,
  labAgentConfigPutContract,
  ricercaAgentConfigPutContract,
  ricercaAgentSpendContract,
} from '../../src/http/index';

describe('per-agent capability routes (v1.28.0)', () => {
  it('paths are built from a validated agent id, never by hand', () => {
    expect(capAgentConfigPath('samira')).toBe('/internal/capability/agents/samira/config');
    expect(capAgentSpendPath('samira')).toBe('/internal/capability/agents/samira/spend');
    expect(capAgentGrowthPath('samira')).toBe('/internal/capability/agents/samira/growth');
    for (const bad of ['../etc', 'Samira', 'a/b', '']) expect(() => capAgentConfigPath(bad), bad).toThrow();
  });

  it('each capability receives its own configuration of the agent on the same path, with the platform secret', () => {
    expect(ricercaAgentConfigPutContract.path).toBe(labAgentConfigPutContract.path);
    expect(ricercaAgentConfigPutContract.authType).toBe('secret');
    expect(labAgentConfigPutContract.authType).toBe('secret');
    expect(ricercaAgentSpendContract.authType).toBe('secret');
    expect(ricercaAgentConfigPutContract.bodySchema.safeParse({ agentId: 'samira', version: 1, domain: 'cucina' }).success).toBe(false);
  });

  it('a stale version and the other refusals are declared', () => {
    expect(AgentConfigStaleSchema.safeParse({ ok: false, error: 'stale_version', currentVersion: 3 }).success).toBe(true);
    for (const error of ['invalid_request', 'agent_mismatch', 'not_configured', 'invalid_config', 'unknown_model_rate', 'budget_below_minimum']) {
      expect(CapabilityAgentRouteErrorSchema.safeParse({ ok: false, error }).success, error).toBe(true);
    }
    expect(CapabilityAgentRouteErrorSchema.safeParse({ ok: false, error: 'boom' }).success).toBe(false);
  });

  it('the spend window is two real agent days in order, at most 400 days', () => {
    expect(AgentSpendQuerySchema.safeParse({ from: '2026-10-01', to: '2026-10-05' }).success).toBe(true);
    expect(AgentSpendQuerySchema.safeParse({ from: '2026-10-05', to: '2026-10-01' }).success).toBe(false);
    expect(AgentSpendQuerySchema.safeParse({ from: '1/10', to: '2026-10-05' }).success).toBe(false);
    expect(AgentSpendQuerySchema.safeParse({ from: '2026-02-30', to: '2026-03-01' }).success).toBe(false);
    expect(AgentSpendQuerySchema.safeParse({ from: '2025-01-01', to: '2026-10-05' }).success).toBe(false);
    expect(AgentSpendQuerySchema.safeParse({ from: '2025-09-01', to: '2026-10-04' }).success).toBe(true);
  });

  it('spend carries the days and the researches queued right now', () => {
    expect(AgentSpendResponseSchema.safeParse({ days: [], queuedNow: 2 }).success).toBe(true);
    expect(AgentSpendResponseSchema.safeParse({ days: [] }).success).toBe(false);
  });

  it('growth carries the graph, the gaps and the wiki counts of one agent', () => {
    const growth = {
      agentId: 'samira',
      nodes: [{ nodeId: 'tec_hollandaise', label: 'Hollandaise', requires: [], level: 1, score: 0.3 }],
      gaps: [{ agentId: 'samira', question: 'Perché impazzisce?', reason: 'non_so' }],
      wiki: { pages: 12, claims: 80, claimsMultiSource: 31, contradictions: 2, sources: 40 },
    };
    expect(AgentGrowthResponseSchema.safeParse(growth).success).toBe(true);
    expect(AgentGrowthResponseSchema.safeParse({ ...growth, wiki: { ...growth.wiki, pages: -1 } }).success).toBe(false);
  });
});
