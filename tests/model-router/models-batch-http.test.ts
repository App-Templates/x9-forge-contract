import { expect, it } from 'vitest';
import * as http from '../../src/http/endpoints/index.js';
import * as router from '../../src/model-router/index.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
const api = http as unknown as Record<string, { path: string; method: string; authType: string; authHeader: string; bodySchema?: unknown; responseSchema: unknown }>;
it('exports producer models overview, preview, batch and per-agent state endpoints', () => { for (const name of ['internalModelsOverviewContract', 'internalModelsPreviewContract', 'internalModelsBatchContract', 'internalAgentModelsStateContract']) expect(api[name]).toBeDefined(); });
it.each([
  ['internalModelsOverviewContract', '/internal/models/overview', 'GET', undefined, 'AgentModelsOverviewSchema'],
  ['internalModelsPreviewContract', '/internal/models/preview', 'POST', 'AgentModelsBatchPreviewRequestSchema', 'AgentModelsBatchPreviewSchema'],
  ['internalModelsBatchContract', '/internal/models/batch', 'POST', 'AgentModelsBatchRequestSchema', 'AgentModelsBatchResultSchema'],
  ['internalAgentModelsStateContract', '/internal/agents/:agentId/models/state', 'GET', undefined, 'AgentModelsStateSchema'],
])('types and authenticates %s using existing headers', (name, path, method, body, response) => { const contract = api[name!]; expect(contract?.path).toBe(path); expect(contract?.method).toBe(method); expect(contract?.authType).toBe('secret'); expect(contract?.authHeader).toBe(INTERNAL_SECRET_HEADER); expect(contract?.responseSchema).toBe(router[response as keyof typeof router]); if (body) expect(contract?.bodySchema).toBe(router[body as keyof typeof router]); });
