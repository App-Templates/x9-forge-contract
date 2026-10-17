import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const descriptor = { provider: 'openai', modelId: 'synthetic-only', protocol: 'responses', adapterId: 'synthetic-adapter' };
const settings = { capability: 'agent-core', function: 'reasoning', catalogVersion: 'synthetic-catalog', requirements: { tools: true, stream: false, structuredOutput: false }, mode: 'pin', pin: descriptor, tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor };
const config = { schemaVersion: 1, identity: { managementAgentId: 'forge-heir', runtimeAgentId: 'runtime-heir', vaultAgentId: 21 }, configVersion: 4, selections: [{ slotId: 'agent_chat', settings }], provenance: { scope: { agentId: 'runtime-heir', ownerId: 'owner-a', tenantId: 'tenant-a' }, bindings: [{ slotId: 'agent_chat', origin: 'master', source: { identity: { managementAgentId: 'forge-master', runtimeAgentId: 'runtime-master', vaultAgentId: 31 }, sourceVersion: 19 } }] } };
const context = { agentId: 'runtime-heir', ownerId: 'owner-a', tenantId: 'tenant-a', identity: config.identity, role: 'erede', masterAgentId: 'runtime-master', credentials: {}, llmConfig: { provider: 'openai', model: 'legacy-synthetic' }, telegramAllowFrom: [], workspacePath: '/synthetic/workspace', registryPath: '/synthetic/registry', displayName: 'Synthetic', configVersion: 4, modelConfiguration: config };
let assertions = 0;
const check = fn => { fn(); assertions++; };
for (const [mode, api] of [['esm', await import('@x9-forge/contracts/model-router')], ['cjs', require('@x9-forge/contracts/model-router')]]) {
  for (const key of ['AgentModelSourceSchema', 'AgentModelBindingSchema', 'AgentModelsProvenanceSchema', 'AgentModelsConfigurationWithProvenanceSchema', 'AgentContextWithModelProvenanceSchema', 'AgentContextWithModelProvenanceWriteSchema', 'createAgentModelsConfigurationWithProvenance', 'ModelCatalogInventoryEntrySchema']) check(() => assert.ok(api[key], mode + ':' + key));
  check(() => assert.deepEqual(api.createAgentModelsConfigurationWithProvenance(config), config));
  check(() => assert.deepEqual(api.AgentContextWithModelProvenanceWriteSchema.parse(context), context));
  check(() => assert.equal(api.AgentModelsConfigurationWithProvenanceSchema.safeParse({ ...config, provenance: undefined }).success, false));
  check(() => assert.equal(api.AgentContextWithModelProvenanceSchema.safeParse({ ...context, tenantId: 'other' }).success, false));
  check(() => assert.equal(api.AgentModelBindingSchema.safeParse({ slotId: 'agent_chat', origin: 'custom', source: config.provenance.bindings[0].source }).success, false));
  const unqualified = { provider: 'openai', modelId: 'synthetic-unclassified', access: 'available', compatibility: 'unqualified' };
  check(() => assert.deepEqual(api.ModelCatalogInventoryEntrySchema.parse(unqualified), unqualified));
  check(() => assert.equal(api.ModelCatalogEntrySchema.safeParse(unqualified).success, false));
  check(() => assert.equal(api.ModelCatalogInventoryEntrySchema.safeParse({ ...unqualified, protocol: 'responses' }).success, false));
  const { provenance, ...legacy } = config; void provenance;
  check(() => assert.deepEqual(api.AgentModelsConfigurationSchema.parse(legacy), legacy));
}
console.log(JSON.stringify({ assertions, modes: ['esm','cjs'], package: '@x9-forge/contracts/model-router' }));
