import { describe, it, expect } from 'vitest';
import { ordinaryCapabilityAgentConfigGetContract, ordinaryCapabilityAgentConfigPutContract, ordinaryCapabilityLifecyclePutContract, selectCapabilityAgentConfigFormat, parseOrdinaryCapabilityAgentConfigGet, parseOrdinaryCapabilityAgentConfigPut, parseOrdinaryCapabilityLifecyclePut } from '../../src/http/endpoints/internal-capability-agent.js';
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

describe('ordinary explicit config transport', () => {
  const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'runtime-a' }, capability = 'cap-news';
  const configuration = { format: 'ordinary-v2', scope, capability, version: 1, parameters: [] };
  const body = { requestId: 'ordinary-request-a', expectedVersion: null, configuration };
  const query = { format: 'ordinary-v2', ...scope, capability };
  const target = { scope, capability, parameters: [] };
  it('reuses the path and secret auth without changing legacy contract bodies', () => {
    for (const contract of [ordinaryCapabilityAgentConfigPutContract, ordinaryCapabilityAgentConfigGetContract, ordinaryCapabilityLifecyclePutContract]) {
      expect(contract.path).toBe(ricercaAgentConfigPutContract.path); expect(contract.authType).toBe('secret');
    }
    expect(selectCapabilityAgentConfigFormat('GET', {})).toBe('legacy');
    expect(selectCapabilityAgentConfigFormat('PUT', { agentId: 'samira', version: 1 })).toBe('legacy');
    expect(selectCapabilityAgentConfigFormat('GET', query)).toBe('ordinary-v2');
    expect(selectCapabilityAgentConfigFormat('PUT', body)).toBe('ordinary-v2');
    expect(selectCapabilityAgentConfigFormat('PUT', { format: 'ordinary-lifecycle-v1' })).toBe('ordinary-lifecycle-v1');
  });
  it('rejects unknown or wrongly placed formats before legacy fallback', () => {
    for (const value of [{ format: 'unknown' }, { configuration: { format: 'unknown' } }, { configuration: {} }, { format: 'ordinary-v2' }]) expect(() => selectCapabilityAgentConfigFormat('PUT', value)).toThrow();
    expect(() => selectCapabilityAgentConfigFormat('GET', { format: 'ordinary-lifecycle-v1' })).toThrow();
  });
  it('binds GET path, full query scope and capability to server authority', () => {
    expect(parseOrdinaryCapabilityAgentConfigGet(query, { agentId: scope.agentId }, target)).toEqual(query);
    expect(() => parseOrdinaryCapabilityAgentConfigGet(query, { agentId: 'other' }, target)).toThrow('target');
    for (const key of ['tenantId', 'ownerId', 'agentId', 'capability']) expect(() => parseOrdinaryCapabilityAgentConfigGet({ ...query, [key]: 'other' }, { agentId: key === 'agentId' ? 'other' : scope.agentId }, target)).toThrow('target');
  });
  it('binds ordinary and lifecycle PUT to runtime path identity', () => {
    expect(parseOrdinaryCapabilityAgentConfigPut(body, { agentId: scope.agentId }, target, null)).toEqual(body);
    expect(() => parseOrdinaryCapabilityAgentConfigPut(body, { agentId: 'other' }, target, null)).toThrow('path');
    const identity = { managementAgentId: 'management-a', runtimeAgentId: scope.agentId }, bundle = { appliedVersion: 1, sha256: 'a'.repeat(64) };
    const request = { format: 'ordinary-lifecycle-v1', requestId: body.requestId, scope, identity, capability, phase: 'prepare', transition: { from: null, to: bundle }, targetMembership: 'enabled', configuration };
    const authority = { ...target, requestId: body.requestId, identity, bundle, current: null, membership: 'enabled', configuration, transaction: null };
    expect(parseOrdinaryCapabilityLifecyclePut(request, { agentId: scope.agentId }, authority).request).toEqual(request);
    expect(() => parseOrdinaryCapabilityLifecyclePut(request, { agentId: 'other' }, authority)).toThrow('path');
  });
});
