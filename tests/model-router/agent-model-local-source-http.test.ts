import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as HTTP from '../../src/http/index.js';
import * as API from '../../src/model-router/index.js';
import * as ENDPOINTS from '../../src/http/endpoints/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import { AgentManagementParamsSchema } from '../../src/http/endpoints/internal-agents-management.js';

function exported(namespace: object, name: string): unknown {
  const value: unknown = Reflect.get(namespace, name);
  expect(value, name).toBeDefined();
  return value;
}
function contract(): { method: string; path: string; authType: string; authHeader: string; paramsSchema: z.ZodType; responseSchema: z.ZodType } {
  return exported(HTTP, 'internalAgentModelSourceObservationContract') as ReturnType<typeof contract>;
}
const observation = {
  identity: { managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 71 },
  scope: { agentId: 'synthetic-runtime', ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant' },
  sourceVersion: 'synthetic-loaded-generation', observedAt: '2026-10-09T06:20:00Z', validUntil: '2026-10-09T06:20:30Z',
};

describe('local model source observation HTTP contract', () => {
  it('L01 exposes a local-only GET before priming using the exact canonical response', () => {
    const value = contract();
    expect(value.method).toBe('GET');
    expect(value.path).toBe('/internal/agents/:agentId/models/local-source');
    expect(value.responseSchema).toBe(API.AgentModelSourceObservationSchema);
    expect(value.responseSchema.parse(observation)).toEqual(observation);
  });
  it('L02 reuses canonical internal authentication and agent parameters', () => {
    expect(contract().authType).toBe('secret');
    expect(contract().authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(contract().paramsSchema).toBe(AgentManagementParamsSchema);
  });
  it.each(['role', 'selections', 'credentials', 'context', 'configVersion'])('L03 refuses non-observation field %s', key => {
    expect(contract().responseSchema.safeParse({ ...observation, [key]: 'synthetic' }).success).toBe(false);
  });
  it('L04 validates and replaces the management agent path parameter', () => {
    const path = exported(HTTP, 'agentModelSourceObservationPath') as (id: string) => string;
    expect(path('synthetic-agent')).toBe('/internal/agents/synthetic-agent/models/local-source');
  });
  it.each(['', '../other', 'agent/child', 'agent?x=1', 'agent#frag', 'Agent', ' agent', 'agent%2fchild'])('L05 rejects unsafe agent ID %s', id => {
    const path = exported(HTTP, 'agentModelSourceObservationPath') as (id: string) => string;
    expect(() => path(id)).toThrow();
  });
  it('L06 exposes identical endpoint and HTTP barrel contract/helper objects', () => {
    for (const key of ['internalAgentModelSourceObservationContract', 'agentModelSourceObservationPath']) {
      expect(exported(ENDPOINTS, key)).toBe(exported(HTTP, key));
    }
  });
});
