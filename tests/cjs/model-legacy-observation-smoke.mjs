import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const marker = 'LEGACY_OBSERVATION_PUBLIC_PROBE';
if (process.argv[2] !== '--surface') {
  const results = [];
  for (const format of ['esm', 'cjs']) for (const suffix of ['', '/model-router']) {
    const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--surface', format, suffix], { encoding: 'utf8' });
    assert.equal(child.status, 0, `${format}:${suffix || 'root'}: ${child.stderr}`);
    const result = JSON.parse(child.stdout.trim());
    assert.equal(result.marker, marker, 'Fresh public surface must execute semantic assertions');
    results.push(result);
  }
  console.log(JSON.stringify({ marker, passed: results.length, total: 4, assertions: results.reduce((sum, row) => sum + row.assertions, 0), results }));
} else {
  const format = process.argv[3], suffix = process.argv[4];
  const specifier = `@x9-forge/contracts${suffix}`;
  const api = format === 'esm' ? await import(specifier) : createRequire(import.meta.url)(specifier);
  let assertions = 0;
  const equal = (actual, expected, label) => { assert.equal(actual, expected, label); assertions++; };
  const identity = { managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 71 };
  const scope = { agentId: identity.runtimeAgentId, ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant' };
  const descriptor = { provider: 'openai', modelId: 'synthetic-model', protocol: 'chat-completions', adapterId: 'synthetic-adapter' };
  function observed(slotId = 'agent_classifier') {
    const definition = api.findModelConsumerDefinition(slotId);
    const common = { capability: definition.capability, function: definition.function, catalogVersion: 'synthetic-catalog', requirements: definition.requirements };
    const settings = definition.routing === 'tiered' ? { ...common, mode: 'automatic', tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor }
      : definition.routing === 'failover' ? { ...common, mode: 'failover', primary: descriptor, fallback: descriptor }
        : { ...common, mode: 'single', descriptor, ...(definition.function === 'embedding' ? { embeddingDimensions: 1536 } : {}) };
    return { schemaVersion: 1, identity, scope, slotId, sourceVersion: 'synthetic-generation', observedAt: '2026-10-09T06:20:00Z', validUntil: '2026-10-09T06:20:30Z', status: 'observed', configVersion: null, requestId: null, settings, reason: 'Actual legacy selection observed', embedding: null };
  }
  const parse = value => api.ModelConsumerRuntimeStateSchema.safeParse(value).success;
  for (const slot of ['agent_classifier', 'agent_chat', 'stt_file', 'memory_embedding']) equal(parse(observed(slot)), true, `${slot} actual selection`);
  const state = observed();
  const request = { schemaVersion: 1, identity, scope, slotId: state.slotId, configVersion: 1, requestId: 'synthetic-request-0001', expectedSourceVersion: state.sourceVersion, settings: state.settings };
  for (const [label, patch] of [['actual settings', { settings: null }], ['null version', { configVersion: 1 }], ['null request', { requestId: request.requestId }], ['null both', { configVersion: 1, requestId: request.requestId }], ['strict role', { role: 'master' }], ['strict extra', { extra: true }], ['reason', { reason: null }], ['generation', { sourceVersion: ' ' }], ['scope', { scope: { ...scope, agentId: 'other' } }], ['requirements', { settings: { ...state.settings, requirements: { tools: true, stream: false, structuredOutput: false } } }]]) equal(parse({ ...state, ...patch }), false, label);
  const now = new Date('2026-10-09T06:20:01Z');
  const installed = { ...state, status: 'installed', configVersion: 1, requestId: request.requestId, reason: null };
  equal(api.isModelConsumerInstallConfirmed(request, { requestId: request.requestId, outcome: 'installed', state: installed }, now), true, 'old installed confirms');
  for (const value of [state, { ...state, configVersion: 1, requestId: request.requestId }]) {
    const receipt = { requestId: request.requestId, outcome: 'installed', state: value };
    equal(api.ModelConsumerInstallReceiptSchema.safeParse(receipt).success, false, 'observed cannot claim installed receipt');
    equal(api.isModelConsumerInstallConfirmed(request, receipt, now), false, 'observed never confirms');
  }
  for (const status of ['unknown', 'pending', 'failed']) {
    equal(parse({ ...state, status }), true, `${status} preserved with settings`);
    equal(api.isModelConsumerInstallConfirmed(request, { requestId: request.requestId, outcome: 'installed', state: { ...state, status } }, now), false, `${status} does not confirm`);
  }
  const embedding = observed('memory_embedding');
  const target = { ...descriptor, modelId: 'synthetic-target' };
  const rebuild = { state: 'running', previous: descriptor, active: descriptor, target, progress: { completed: 1, total: 2 }, reason: null };
  equal(parse({ ...embedding, embedding: rebuild }), true, 'running embedding observes actual active');
  equal(parse({ ...embedding, settings: { ...embedding.settings, descriptor: target }, embedding: rebuild }), false, 'pending target not active');
  equal(parse({ ...embedding, settings: { ...embedding.settings, embeddingDimensions: 0 } }), false, 'positive embedding dimensions');
  console.log(JSON.stringify({ marker, format, suffix: suffix || 'root', assertions }));
}
