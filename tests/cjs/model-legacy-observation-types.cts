import { CapabilityModelSettingsSchema, type ModelConsumerRuntimeState } from '@x9-forge/contracts';
import type { ModelConsumerRuntimeState as RouterState } from '@x9-forge/contracts/model-router';
import { AgentIdSchema } from '@x9-forge/contracts/agent';

const observed: ModelConsumerRuntimeState = {
  schemaVersion: 1,
  identity: { managementAgentId: AgentIdSchema.parse('synthetic-agent'), runtimeAgentId: AgentIdSchema.parse('synthetic-runtime'), vaultAgentId: 71 },
  scope: { agentId: 'synthetic-runtime', ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant' },
  slotId: 'agent_classifier', sourceVersion: 'synthetic-generation',
  observedAt: '2026-10-09T06:20:00Z', validUntil: '2026-10-09T06:20:30Z',
  status: 'observed', configVersion: null, requestId: null,
  settings: CapabilityModelSettingsSchema.parse({ capability: 'agent-core', function: 'reasoning', catalogVersion: 'synthetic-catalog', requirements: { tools: false, stream: false, structuredOutput: false }, mode: 'single', descriptor: { provider: 'openai', modelId: 'synthetic-model', protocol: 'chat-completions', adapterId: 'synthetic-adapter' } }),
  reason: 'Actual legacy selection observed', embedding: null,
};
const routerObserved: RouterState = observed;
const installed: RouterState = { ...routerObserved, status: 'installed', configVersion: 1, requestId: 'synthetic-request-0001', reason: null };
const unknown: RouterState = { ...routerObserved, status: 'unknown', reason: 'Legacy source unavailable' };
void [installed, unknown];
