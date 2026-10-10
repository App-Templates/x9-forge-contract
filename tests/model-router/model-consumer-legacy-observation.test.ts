import { describe, expect, it } from 'vitest';
import { ModelConsumerRuntimeStateSchema, ModelConsumerInstallReceiptSchema, isModelConsumerInstallConfirmed, findModelConsumerDefinition } from '../../src/model-router/index.js';

const identity = { managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 71 };
const scope = { agentId: identity.runtimeAgentId, ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant' };
const descriptor = { provider: 'openai', modelId: 'synthetic-model', protocol: 'chat-completions', adapterId: 'synthetic-adapter' };
function observed(slotId = 'agent_classifier') {
  const definition = findModelConsumerDefinition(slotId)!;
  const common = { capability: definition.capability, function: definition.function, catalogVersion: 'synthetic-catalog', requirements: definition.requirements };
  const settings = definition.routing === 'tiered'
    ? { ...common, mode: 'automatic', tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor }
    : definition.routing === 'failover' ? { ...common, mode: 'failover', primary: descriptor, fallback: descriptor }
      : { ...common, mode: 'single', descriptor, ...(definition.function === 'embedding' ? { embeddingDimensions: 1536 } : {}) };
  return { schemaVersion: 1, identity, scope, slotId, sourceVersion: 'synthetic-generation', observedAt: '2026-10-09T06:20:00Z', validUntil: '2026-10-09T06:20:30Z', status: 'observed', configVersion: null, requestId: null, settings, reason: 'Actual legacy selection observed', embedding: null };
}
const state = observed();
const request = { schemaVersion: 1, identity, scope, slotId: state.slotId, configVersion: 1, requestId: 'synthetic-request-0001', expectedSourceVersion: state.sourceVersion, settings: state.settings };
const installed = { ...state, status: 'installed', configVersion: 1, requestId: request.requestId, reason: null };
const now = new Date('2026-10-09T06:20:01Z');
const parse = (value: unknown) => ModelConsumerRuntimeStateSchema.safeParse(value).success;

describe('positive legacy observation without Forge installation authority', () => {
  it.each(['agent_classifier', 'agent_chat', 'stt_file', 'memory_embedding'])('O01 admits actual canonical %s selection', slotId => {
    const value = observed(slotId);
    expect(parse(value)).toBe(true);
    expect(ModelConsumerRuntimeStateSchema.parse(value)).toEqual(value);
  });
  it('O02 requires actual settings', () => expect(parse({ ...state, settings: null })).toBe(false));
  it('O03 forbids a claimed config version', () => expect(parse({ ...state, configVersion: 1 })).toBe(false));
  it('O04 forbids a claimed request', () => expect(parse({ ...state, requestId: request.requestId })).toBe(false));
  it('O05 forbids both installation fields', () => expect(parse({ ...state, configVersion: 1, requestId: request.requestId })).toBe(false));
  it.each([
    { settings: { ...state.settings, capability: 'memory' } },
    { settings: { ...state.settings, function: 'tts' } },
    { settings: { ...state.settings, requirements: { tools: true, stream: false, structuredOutput: false } } },
    { settings: observed('agent_chat').settings },
    { scope: { ...scope, agentId: 'another-runtime' } },
    { scope: { ...scope, ownerId: ' ' } },
    { identity: { ...identity, managementAgentId: ' ' } },
    { identity: { ...identity, runtimeAgentId: ' ' } },
    { identity: { ...identity, vaultAgentId: 0 } },
    { validUntil: state.observedAt },
    { validUntil: 'invalid' },
    { observedAt: 'invalid' },
    { sourceVersion: ' ' },
    { reason: null },
    { reason: ' ' },
    { role: 'master' },
    { extra: true },
  ])('O06 preserves canonical evidence guards %j', patch => expect(parse({ ...state, ...patch })).toBe(false));
  it('O07 trims the public reason using the existing reason rule', () => {
    expect(ModelConsumerRuntimeStateSchema.parse({ ...state, reason: '  Legacy selection  ' }).reason).toBe('Legacy selection');
  });
  it('O08 observes the active embedding while target rebuild is running', () => {
    const value = observed('memory_embedding');
    const target = { ...descriptor, modelId: 'synthetic-target' };
    const embedding = { state: 'running', previous: descriptor, active: descriptor, target, progress: { completed: 1, total: 2 }, reason: null };
    expect(parse({ ...value, embedding })).toBe(true);
    expect(parse({ ...value, settings: { ...value.settings, descriptor: target }, embedding })).toBe(false);
    expect(parse({ ...value, settings: { ...value.settings, embeddingDimensions: undefined }, embedding })).toBe(false);
    expect(parse({ ...value, settings: { ...value.settings, embeddingDimensions: 0 }, embedding })).toBe(false);
  });
  it('O09 never confirms an installed receipt even with complete forged correlation', () => {
    for (const value of [state, { ...state, configVersion: 1, requestId: request.requestId }]) {
      const receipt = { requestId: request.requestId, outcome: 'installed', state: value };
      expect(ModelConsumerInstallReceiptSchema.safeParse(receipt).success).toBe(false);
      expect(isModelConsumerInstallConfirmed(request, receipt, now)).toBe(false);
    }
  });
  it.each(['observed', 'ok'])('O10 does not add receipt outcome %s', outcome => {
    expect(ModelConsumerInstallReceiptSchema.safeParse({ requestId: request.requestId, outcome, state }).success).toBe(false);
  });
  it.each(['pending', 'failed'])('O11 preserves non-confirming %s receipt', outcome => {
    const receipt = { requestId: request.requestId, outcome, state };
    expect(ModelConsumerInstallReceiptSchema.safeParse(receipt).success).toBe(true);
    expect(isModelConsumerInstallConfirmed(request, receipt, now)).toBe(false);
  });
  it.each(['unknown', 'pending', 'failed'])('O12 preserves old %s with settings', status => {
    const value = { ...state, status };
    expect(parse(value)).toBe(true);
    expect(isModelConsumerInstallConfirmed(request, { requestId: request.requestId, outcome: 'installed', state: value }, now)).toBe(false);
  });
  it('O13 preserves actual installed confirmation', () => {
    expect(parse(installed)).toBe(true);
    expect(isModelConsumerInstallConfirmed(request, { requestId: request.requestId, outcome: 'installed', state: installed }, now)).toBe(true);
  });
  it.each([{ configVersion: null }, { requestId: null }, { settings: null }, { configVersion: 2 }, { requestId: 'another-request' }, { settings: { ...state.settings, catalogVersion: 'another-catalog' } }])('O14 installed evidence/correlation remains required %j', patch => {
    expect(isModelConsumerInstallConfirmed(request, { requestId: request.requestId, outcome: 'installed', state: { ...installed, ...patch } }, now)).toBe(false);
  });
  it.each(['2026-10-09T06:20:30Z', '2026-10-09T06:19:00Z', 'invalid'])('O15 installed freshness remains required %s', time => {
    expect(isModelConsumerInstallConfirmed(request, { requestId: request.requestId, outcome: 'installed', state: installed }, new Date(time))).toBe(false);
  });
});
