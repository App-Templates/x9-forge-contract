import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {AgentModelsConfigurationSchema, AgentModelsPendingWorkSchema, ModelCatalogSchema,
  modelCatalogContentVersion, modelConfigurationContentVersion, modelsVersion, withCatalogVersion} from '../../src/model-router/index.js';
import {AgentManagementReasonSchema} from '../../src/agent/agent-management.js';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const descriptor = {provider: 'openai', modelId: 'synthetic-a', protocol: 'responses', adapterId: 'synthetic-adapter'};
const settings = {capability: 'agent-core', function: 'reasoning', catalogVersion: 'old-catalog', requirements: {
  tools: false, stream: false, structuredOutput: false}, mode: 'single', descriptor};
const configuration = () => AgentModelsConfigurationSchema.parse({schemaVersion: 1,
  identity: {managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 1}, configVersion: 1,
  selections: [{slotId: 'agent_chat', settings}, {slotId: 'agent_classifier', settings}]});
const catalog = () => ModelCatalogSchema.parse({agentId: 'synthetic-agent', version: 'old-catalog', sourceVersion: 'synthetic-source',
  source: 'provider-api', observedAt: '2026-10-13T10:00:00Z', validUntil: '2026-10-13T11:00:00Z', state: 'partial',
  entries: [{...descriptor, function: 'reasoning', label: 'Synthetic ☀', access: 'available', runtimeSupport: 'supported', features: settings.requirements},
    {...descriptor, modelId: 'synthetic-b', function: 'reasoning', label: 'Synthetic B', access: 'available', runtimeSupport: 'supported', features: settings.requirements}],
  inventory: [{provider: 'openai', modelId: 'unqualified-b', access: 'available', compatibility: 'unqualified'},
    {provider: 'openai', modelId: 'unqualified-a', access: 'available', compatibility: 'unqualified'}]});
const work = () => ({requestId: 'synthetic-request', kind: 'initial', desiredVersion: 1, phase: 'accepted',
  startedAt: '2026-10-13T10:00:00Z', updatedAt: '2026-10-13T10:00:00Z', slots: [{slotId: 'memory_embedding', status: 'waiting'}]});
describe('shared models content versions', () => {
  it('matches the existing agent-core SHA-256 content serialization', () => {
    const input = catalog(), {version: _version, observedAt: _observedAt, validUntil: _validUntil, ...content} = input;
    const entries = [...content.entries].sort((a,b) => JSON.stringify([a.provider,a.modelId,a.function]).localeCompare(JSON.stringify([b.provider,b.modelId,b.function])));
    const inventory = [...(content.inventory ?? [])].sort((a,b) => JSON.stringify([a.provider,a.modelId]).localeCompare(JSON.stringify([b.provider,b.modelId])));
    expect(modelCatalogContentVersion(input)).toBe(hash(JSON.stringify({...content, entries, inventory})));
  });
  it('keeps catalog version across row reordering and observation time/token changes', () => {
    const input = catalog(), expected = modelCatalogContentVersion(input);
    const changed = {...input, version: 'another-token', observedAt: '2026-10-14T10:00:00Z', validUntil: '2026-10-14T11:00:00Z',
      entries: [...input.entries].reverse(), inventory: [...input.inventory!].reverse()};
    expect(modelCatalogContentVersion(changed)).toBe(expected);
    expect(modelCatalogContentVersion({...input, sourceVersion: 'changed-source'})).not.toBe(expected);
  });
  it('keeps configuration content version across ordering, save sequence and catalog observation tokens', () => {
    const input = configuration(), expected = modelConfigurationContentVersion(input);
    const changed = {...input, configVersion: 2, selections: [...input.selections].reverse().map(s => withCatalogVersion(s, {version: 'new-catalog'}))};
    expect(modelConfigurationContentVersion(changed)).toBe(expected);
    changed.selections[0]!.settings.descriptor.modelId = 'changed-model';
    expect(modelConfigurationContentVersion(changed)).not.toBe(expected);
  });
  it.each(['', 'a', '☀'.repeat(100), 'a'.repeat(1000)])('derives the exact bounded pair version for %j', text => {
    expect(modelsVersion({catalogVersion: text, configurationVersion: 'configuration'}))
      .toBe('mv1-' + hash(text + '\nconfiguration').slice(0, 32));
  });
  it('stamps only the validated catalog token and leaves its input unchanged', () => {
    const input = configuration().selections[0]!, before = structuredClone(input), result = withCatalogVersion(input, {version: 'new-catalog'});
    expect(result.settings.catalogVersion).toBe('new-catalog'); expect(input).toEqual(before);
    expect(result).not.toBe(input); expect(result.settings).not.toBe(input.settings); expect(result.slotId).toBe(input.slotId);
  });
  it.skipIf(!process.env.MODELS_CAPTURE)('matches the captured public catalog token without committing production data', () => {
    const captured = JSON.parse(readFileSync(process.env.MODELS_CAPTURE!, 'utf8')).catalog.body;
    expect(captured.version).toBe('af963e00d3e0e7fa32b0798841c101ae0e76078fde56ec2d600edab0dc36313f');
    expect(modelCatalogContentVersion(captured)).toBe(captured.version);
  });
});
describe('additive per-slot work fields', () => {
  it('accepts old work and new unchanged counts/reasons/version', () => {
    expect(AgentModelsPendingWorkSchema.safeParse(work()).success).toBe(true);
    expect(AgentModelsPendingWorkSchema.safeParse({...work(), modelsVersion: modelsVersion({catalogVersion: 'a', configurationVersion: 'b'}),
      slots: [{slotId: 'memory_embedding', status: 'unchanged', calls: {state: 0, install: 0}},
        {slotId: 'agent_chat', status: 'failed', reason: {code: 'catalog-changed', detail: 'Synthetic catalog changed'}, calls: {state: 1, install: 1}}]}).success).toBe(true);
  });
  it.each(['catalog-changed', 'catalog-version-mismatch', 'model-unavailable', 'qualification-failed', 'consumer-rejected'])('exports reason %s', code => {
    expect(AgentManagementReasonSchema.safeParse({code, detail: 'Synthetic operator explanation'}).success).toBe(true);
  });
  it.each([{state: 1, install: 0}, {state: 0, install: 1}, {state: -1, install: 0}, {state: 0, install: 0.5}, {state: 0, install: 0, extra: true}])('rejects invalid call accounting %j', calls => {
    expect(AgentModelsPendingWorkSchema.safeParse({...work(), slots: [{slotId: 'memory_embedding', status: 'unchanged', calls}]}).success).toBe(false);
  });
  it('keeps a failure reason on failed slots only', () => {
    expect(AgentModelsPendingWorkSchema.safeParse({...work(), slots: [{slotId: 'memory_embedding', status: 'unchanged', reason: {code: 'consumer-rejected'}}]}).success).toBe(false);
  });
  it('keeps slot reasons strict and bounded', () => {
    for (const reason of [{code: 'unknown', detail: 'x'.repeat(501)}, {code: 'not-a-code'}, {code: 'consumer-rejected', private: true}]) {
      expect(AgentModelsPendingWorkSchema.safeParse({...work(), slots: [{slotId: 'memory_embedding', status: 'failed', reason}]}).success).toBe(false);
    }
  });
});
