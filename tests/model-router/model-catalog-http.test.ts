import { describe, expect, it } from 'vitest';
import * as http from '../../src/http/endpoints/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import { ModelCatalogSchema } from '../../src/model-router/index.js';

const api = http as unknown as { internalAgentModelCatalogContract: { method: string; path: string; authType: string; authHeader: string; paramsSchema: { safeParse: (value: unknown) => { success: boolean } }; responseSchema: unknown }; agentModelCatalogPath: (agentId: string) => string };
describe('per-agent model catalog HTTP contract', () => {
  it('exports the metadata endpoint and path helper', () => { expect(api.internalAgentModelCatalogContract).toBeDefined(); expect(api.agentModelCatalogPath).toBeDefined(); });
  it('uses the canonical agent path and existing authentication', () => {
    const contract = api.internalAgentModelCatalogContract;
    expect(contract.method).toBe('GET'); expect(contract.path).toBe('/internal/agents/:agentId/models/catalog');
    expect(contract.authType).toBe('secret'); expect(contract.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(contract.responseSchema).toBe(ModelCatalogSchema); expect(api.agentModelCatalogPath('agent-42')).toBe('/internal/agents/agent-42/models/catalog');
  });
  it.each(['', '../primary', 'primary?url=synthetic', 'https://synthetic.invalid'])('uses the existing agent guard for %s', agentId => { expect(() => api.agentModelCatalogPath(agentId)).toThrow(); expect(api.internalAgentModelCatalogContract.paramsSchema.safeParse({ agentId }).success).toBe(false); });
});
