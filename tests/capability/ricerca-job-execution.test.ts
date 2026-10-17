import { describe, expect, it } from 'vitest';
import * as ricerca from '../../src/capability/ricerca/index.js';
import * as http from '../../src/http/index.js';
const api = ricerca; const dispatch = http;
const input = { researchId: 'research-1', leaseToken: '00000000-0000-4000-8000-000000000001' };
describe('native research lease execution', () => {
  it('exports a distinct internal tool and path without changing public tools', () => {
    expect(api.RICERCA_INTERNAL_TOOLS?.execute).toBe('research_execute');
    expect(api.researchExecutePath?.()).toBe('/call/research_execute');
    expect(Object.values(api.RICERCA_TOOLS)).toEqual(['research_start', 'research_status', 'research_result']);
    expect(api.ResearchExecuteInputSchema?.safeParse(input).success).toBe(true);
  });
  it.each(['question', 'url', 'tool', 'input', 'credentials', 'context'])('rejects %s injection', key => {
    expect(api.ResearchExecuteInputSchema).toBeDefined();
    expect(api.ResearchExecuteInputSchema.safeParse({ ...input, [key]: {} }).success).toBe(false);
  });
  it('requires the existing opaque UUID lease and research id', () => {
    expect(api.ResearchExecuteInputSchema).toBeDefined();
    for (const bad of [{ researchId: 'research-1' }, { ...input, leaseToken: '' }, { ...input, leaseToken: 'other' }, { ...input, researchId: '' }]) {
      expect(api.ResearchExecuteInputSchema.safeParse(bad).success).toBe(false);
    }
  });
  it('composes research execution in the fixed internal dispatch union', () => {
    expect(dispatch.INTERNAL_AGENT_EXECUTIONS?.research_execute?.tool).toBe(api.RICERCA_INTERNAL_TOOLS?.execute);
    expect(dispatch.InternalAgentToolDispatchRequestSchema?.safeParse({ requestId: 'research-1', identity: { tenantId: 't', ownerId: 'o', agentId: 'a' }, execution: 'research_execute', input }).success).toBe(true);
  });
});

it('loads the actual compiled ESM research lease schema', async () => {
  const compiled = await import('@x9-forge/contracts/capability/ricerca');
  expect(compiled.ResearchExecuteInputSchema?.safeParse(input).success).toBe(true);
  expect(compiled.researchExecutePath?.()).toBe('/call/research_execute');
});
