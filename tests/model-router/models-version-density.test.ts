import {createHash} from 'node:crypto';
import {expect, it} from 'vitest';
import {AgentModelsConfigurationWithProvenanceSchema, ModelCatalogSchema, modelCatalogContentVersion,
  modelConfigurationContentVersion, modelsVersion, withCatalogVersion} from '../../src/model-router/index.js';
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const descriptor = {provider: 'openai', modelId: 'synthetic-model', protocol: 'responses', adapterId: 'synthetic-adapter'};
const settings = {capability: 'agent-core', function: 'reasoning', mode: 'single', descriptor,
  catalogVersion: 'synthetic-catalog', requirements: {tools: false, stream: false, structuredOutput: false}};
const config = () => AgentModelsConfigurationWithProvenanceSchema.parse({schemaVersion: 1, configVersion: 1,
  identity: {managementAgentId: 'agent-a', runtimeAgentId: 'runtime-a', vaultAgentId: 1},
  selections: [{slotId: 'agent_chat', settings}, {slotId: 'agent_classifier', settings}],
  provenance: {scope: {tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'runtime-a'}, bindings: [
    {slotId: 'agent_chat', origin: 'master', source: {identity: {managementAgentId: 'master-a', runtimeAgentId: 'master-runtime-a', vaultAgentId: 2}, sourceVersion: 7}},
    {slotId: 'agent_classifier', origin: 'custom'}]}});
const catalog = () => ModelCatalogSchema.parse({agentId: 'agent-a', version: 'synthetic-catalog', sourceVersion: 'synthetic-source', source: 'provider-api',
  observedAt: '2026-10-13T10:00:00Z', validUntil: '2026-10-13T11:00:00Z', state: 'partial', entries: [
    {...descriptor, function: 'reasoning', label: 'Synthetic A', access: 'available', runtimeSupport: 'supported', features: settings.requirements},
    {...descriptor, modelId: 'synthetic-other', function: 'reasoning', label: 'Synthetic B', access: 'available', runtimeSupport: 'supported', features: settings.requirements}],
  inventory: [{provider: 'openai', modelId: 'unqualified-a', access: 'available', compatibility: 'unqualified'},
    {provider: 'openai', modelId: 'unqualified-b', access: 'available', compatibility: 'unqualified'}]});
const reverseKeys = (value: unknown): unknown => Array.isArray(value) ? value.map(reverseKeys)
  : value !== null && typeof value === 'object' ? Object.fromEntries(Object.entries(value).reverse().map(([key,item]) => [key,reverseKeys(item)])) : value;
const freeze = (value: unknown): void => {if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value)}};
it('normalizes object-key ordering and optional catalog inventory absence independently of observation times', () => {
  const input = catalog(); expect(modelCatalogContentVersion(reverseKeys(input) as typeof input)).toBe(modelCatalogContentVersion(input));
  const {inventory: _inventory, ...without} = input;
  expect(modelCatalogContentVersion({...without, state: 'available'})).toBe(modelCatalogContentVersion({...without, state: 'available', inventory: []}));
});
it.each(['agent', 'source', 'label', 'access', 'support', 'features', 'limits', 'inventory', 'adapter', 'protocol'])('changes catalog content version for public %s content', kind => {
  const original = catalog(), changed = structuredClone(original);
  if (kind === 'agent') changed.agentId = 'agent-b';
  if (kind === 'source') changed.sourceVersion = 'source-b';
  if (kind === 'label') changed.entries[0]!.label = 'Changed label';
  if (kind === 'access') Object.assign(changed.entries[0]!, {access: 'unavailable', reason: 'Synthetic unavailable'});
  if (kind === 'support') Object.assign(changed.entries[0]!, {runtimeSupport: 'unsupported', reason: 'Synthetic unsupported'});
  if (kind === 'features') changed.entries[0]!.features.vision = true;
  if (kind === 'limits') changed.entries[0]!.limits = {maxInputTokens: 8000};
  if (kind === 'inventory') changed.inventory![0]!.modelId = 'other-unqualified';
  if (kind === 'adapter') changed.entries[0]!.adapterId = 'other-adapter';
  if (kind === 'protocol') changed.entries[0]!.protocol = 'chat-completions';
  expect(modelCatalogContentVersion(changed)).not.toBe(modelCatalogContentVersion(original));
});
it('normalizes selection, binding and nested object-key ordering without mutating either source', () => {
  const original = config(), changed = reverseKeys(structuredClone(original)) as typeof original;
  changed.selections.reverse(); changed.provenance.bindings.reverse(); changed.configVersion = 10;
  for (const slot of changed.selections) slot.settings.catalogVersion = 'another-catalog';
  freeze(original); freeze(changed);
  expect(modelConfigurationContentVersion(changed)).toBe(modelConfigurationContentVersion(original));
});
it.each(['management', 'runtime', 'vault', 'tenant', 'owner', 'source-version', 'source-identity', 'origin', 'model', 'requirements'])('retains configuration authority and %s content in its fingerprint', kind => {
  const original = config(), changed = structuredClone(original);
  if (kind === 'management') changed.identity.managementAgentId = 'agent-b';
  if (kind === 'runtime') {changed.identity.runtimeAgentId = 'runtime-b'; changed.provenance.scope.agentId = 'runtime-b'}
  if (kind === 'vault') changed.identity.vaultAgentId = 3;
  if (kind === 'tenant') changed.provenance.scope.tenantId = 'tenant-b';
  if (kind === 'owner') changed.provenance.scope.ownerId = 'owner-b';
  const binding = changed.provenance.bindings[0]!;
  if (kind === 'source-version' && binding.origin === 'master') binding.source.sourceVersion = 8;
  if (kind === 'source-identity' && binding.origin === 'master') binding.source.identity.managementAgentId = 'master-b';
  if (kind === 'origin') changed.provenance.bindings[0] = {slotId: binding.slotId, origin: 'custom'};
  if (kind === 'model' && changed.selections[0]!.settings.mode === 'single') changed.selections[0]!.settings.descriptor.modelId = 'another-model';
  if (kind === 'requirements') changed.selections[0]!.settings.requirements.tools = true;
  expect(modelConfigurationContentVersion(changed)).not.toBe(modelConfigurationContentVersion(original));
});
it('verifies 100 UTF-8 and block-boundary vectors against an independent native SHA-256 oracle', () => {
  const samples = ['', 'abc', '\ud800', '☀', 'è', '模型', '😀'];
  for (let n = 0; n < 100; n++) {
    const text = samples[n % samples.length]!.repeat(n) + 'x'.repeat(n * 7), other = 'configuration-' + n;
    expect(modelsVersion({catalogVersion: text, configurationVersion: other})).toBe('mv1-' + hash(text + '\n' + other).slice(0, 32));
  }
});
it('stamps the object token rather than recomputing or substituting its sourceVersion', () => {
  const input = {...config().selections[0]!, metadata: {synthetic: true}}, before = structuredClone(input);
  freeze(input);
  const result = withCatalogVersion(input, {...catalog(), version: 'validated-object-token', sourceVersion: 'different-source-token'});
  expect(result.settings.catalogVersion).toBe('validated-object-token'); expect(result.metadata).toEqual(before.metadata); expect(input).toEqual(before);
  expect(() => withCatalogVersion(input, {version: ''})).toThrow();
});
