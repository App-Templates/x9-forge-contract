import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let assertions = 0;
const equal = (actual, expected, label) => { assert.equal(actual, expected, label); assertions++; };
const present = (value, label) => { assert.ok(value, label); assertions++; return value; };
const identity = { managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 71 };
const scope = { agentId: identity.runtimeAgentId, ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant' };
const expected = { identity, scope, sourceVersion: 'synthetic-generation' };
const observedAt = '2026-10-09T06:19:59Z';
const validUntil = '2026-10-09T06:20:30Z';
const now = new Date('2026-10-09T06:20:00Z');

function initialSource(api) {
  return {
    schemaVersion: 1, ...expected, authority: 'runtime-loaded', observedAt, validUntil, coverage: 'complete', missingSlots: [],
    selections: api.registeredModelConsumerDefinitions().map(definition => {
      const descriptor = { provider: 'openai', modelId: 'synthetic-model', adapterId: 'synthetic-adapter', protocol: definition.function === 'embedding' ? 'embeddings' : 'chat-completions' };
      const common = { capability: definition.capability, function: definition.function, requirements: definition.requirements, catalogVersion: 'synthetic-catalog' };
      const settings = definition.routing === 'tiered'
        ? { ...common, mode: 'automatic', tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor }
        : definition.routing === 'failover'
          ? { ...common, mode: 'failover', primary: descriptor, fallback: descriptor }
          : { ...common, mode: 'single', descriptor, ...(definition.function === 'embedding' ? { embeddingDimensions: 1536 } : {}) };
      return { slotId: definition.slotId, settings };
    }),
  };
}

const surfaces = [];
for (const format of ['esm', 'cjs']) {
  const load = specifier => format === 'esm' ? import(specifier) : require(specifier);
  for (const suffix of ['', '/model-router']) {
    const api = await load(`@x9-forge/contracts${suffix}`);
    const label = `${format}:${suffix || 'root'}`;
    const schema = api.AgentModelInitialSourceSchema ?? api.AgentModelBootstrapSourceSchema;
    equal(schema.safeParse(initialSource(api)).success, true, `${label} semantic roleless admission`);
    present(api.AgentModelInitialSourceSchema, `${label} initial schema`);
    present(api.isAgentModelInitialSourceCurrent, `${label} current helper`);
    const source = initialSource(api);
    equal(api.AgentModelInitialSourceSchema.safeParse(source).success, true, `${label} roleless complete source`);
    for (const role of ['master', 'erede']) equal(api.AgentModelInitialSourceSchema.safeParse({ ...source, role }).success, false, `${label} no role ${role}`);
    equal(api.AgentModelBootstrapSourceSchema.safeParse(source).success, false, `${label} old Master required`);
    equal(api.AgentModelBootstrapSourceSchema.safeParse({ ...source, role: 'master' }).success, true, `${label} old Master valid`);
    equal(api.isAgentModelInitialSourceCurrent(source, expected, now), true, `${label} fresh source`);
    equal(api.isAgentModelInitialSourceCurrent(source, { ...expected, sourceVersion: 'raced-generation' }, now), false, `${label} generation race`);
    equal(api.isAgentModelInitialSourceCurrent(source, { ...expected, scope: { ...scope, tenantId: 'another' } }, now), false, `${label} scope race`);
    equal(api.isAgentModelInitialSourceCurrent(source, expected, new Date(validUntil)), false, `${label} expired`);
    equal(api.AgentModelInitialSourceSchema.safeParse({ ...source, selections: source.selections.slice(1) }).success, false, `${label} topology incomplete`);
    equal(api.isAgentModelInitialSourceCurrent({ ...source, validUntil: '2026-10-09T06:30:00Z' }, expected, new Date('2026-10-09T06:22:00Z')), true, `${label} no added age cap`);
    for (const clock of [new Date('invalid'), new Date('2026-10-09T06:19:53Z')]) equal(api.isAgentModelInitialSourceCurrent(source, expected, clock), false, `${label} invalid/future clock`);
    equal(api.isAgentModelInitialSourceCurrent(null, expected, now), false, `${label} malformed source`);
    equal(api.isAgentModelInitialSourceCurrent(source, { ...expected, extra: true }, now), false, `${label} malformed expectation`);
    const partial = { ...source, coverage: 'partial', selections: [], missingSlots: source.selections.map(row => row.slotId) };
    equal(api.AgentModelInitialSourceSchema.safeParse(partial).success, true, `${label} explicit all missing`);
    equal(api.isAgentModelInitialSourceCurrent(partial, expected, now), false, `${label} incomplete current source`);
    equal(api.AgentModelInitialSourceSchema.safeParse({ ...source, scope: { ...scope, agentId: 'different' } }).success, false, `${label} runtime scope`);
    equal(api.AgentModelInitialSourceSchema.safeParse({ ...source, validUntil: observedAt }).success, false, `${label} ordered validity`);
    equal(api.AgentModelInitialSourceSchema.safeParse({ ...source, selections: [...source.selections, source.selections[0]] }).success, false, `${label} duplicate partition`);
    equal(api.AgentModelInitialSourceSchema.safeParse({ ...source, selections: [], excludedSlots: source.selections.map(row => ({ slotId: row.slotId, state: 'not-installed', reason: 'Synthetic absent' })) }).success, false, `${label} no complete all excluded`);
    const incompatible = structuredClone(source); incompatible.selections[0].settings.requirements.tools = false;
    equal(api.AgentModelInitialSourceSchema.safeParse(incompatible).success, false, `${label} canonical requirements`);
    for (const key of ['managementAgentId', 'runtimeAgentId', 'vaultAgentId']) equal(api.isAgentModelInitialSourceCurrent(source, { ...expected, identity: { ...identity, [key]: key === 'vaultAgentId' ? 72 : 'different' } }, now), false, `${label} identity ${key}`);
    for (const key of ['agentId', 'ownerId', 'tenantId']) equal(api.isAgentModelInitialSourceCurrent(source, { ...expected, scope: { ...scope, [key]: 'different' } }, now), false, `${label} scope ${key}`);
    const state = { identity, versions: null, saved: null, runtime: null, initialSource: source };
    equal(api.AgentModelsStateSchema.safeParse(state).success, true, `${label} initial state`);
    equal(api.AgentModelsStateSchema.safeParse({ ...state, identity: { ...identity, vaultAgentId: 72 } }).success, false, `${label} foreign state identity`);
    equal(api.AgentModelsStateSchema.safeParse({ ...state, versions: { desired: null, applied: null, failed: null } }).success, false, `${label} no version authority`);
    equal(api.AgentModelsStateSchema.safeParse({ ...state, bootstrapSource: { ...source, role: 'master' } }).success, false, `${label} no concurrent Master source`);
    equal(api.AgentModelsStateSchema.safeParse({ ...state, initialSource: { ...source, role: 'master' } }).success, false, `${label} state strict payload`);
    const persisted = { schemaVersion: 1, identity, configVersion: 1, selections: source.selections };
    const runtime = { identity, configVersion: 1, requestId: 'synthetic-request', observedAt, selections: [{ slotId: 'agent_chat', capability: 'agent-core', function: 'reasoning', tier: 'standard', descriptor: source.selections[0].settings.tiers.standard }] };
    for (const [key, value] of [['saved', persisted], ['runtime', runtime], ['versions', { desired: 1, applied: null, failed: null }]]) {
      const parsed = api.AgentModelsStateSchema.safeParse({ ...state, [key]: value });
      equal(!parsed.success && parsed.error.issues.some(issue => issue.path.join('.') === 'initialSource' && issue.message === 'Initial source cannot claim a saved or applied version'), true, `${label} explicit initial absence ${key}`);
    }
    for (const [key, value] of [['bootstrapSource', { ...source, role: 'master' }], ['sourceObservation', { ...expected, observedAt, validUntil }]]) {
      const parsed = api.AgentModelsStateSchema.safeParse({ ...state, [key]: value });
      equal(!parsed.success && parsed.error.issues.some(issue => issue.path.join('.') === 'initialSource' && issue.message === 'Initial source cannot coexist with another model authority'), true, `${label} explicit mutual exclusion ${key}`);
    }
    surfaces.push(label);
  }
  const http = await load('@x9-forge/contracts/http');
  const api = await load('@x9-forge/contracts/model-router');
  const auth = await load('@x9-forge/contracts/auth');
  const endpoint = present(http.internalAgentModelSourceObservationContract, `${format}:http endpoint`);
  equal(endpoint.method, 'GET', `${format}:http method`);
  equal(endpoint.path, '/internal/agents/:agentId/models/local-source', `${format}:http path`);
  equal(endpoint.authType, 'secret', `${format}:http auth`);
  equal(endpoint.authHeader, auth.INTERNAL_SECRET_HEADER, `${format}:http header`);
  equal(endpoint.paramsSchema, http.AgentManagementParamsSchema, `${format}:http canonical params`);
  equal(endpoint.responseSchema, api.AgentModelSourceObservationSchema, `${format}:http canonical response`);
  equal(http.agentModelSourceObservationPath(identity.managementAgentId), '/internal/agents/synthetic-agent/models/local-source', `${format}:http helper`);
  assert.throws(() => http.agentModelSourceObservationPath('../synthetic'), `${format}:http invalid path`); assertions++;
  equal(endpoint.responseSchema.safeParse({ ...expected, observedAt, validUntil }).success, true, `${format}:http pre-priming observation`);
  equal(endpoint.responseSchema.safeParse({ ...expected, observedAt, validUntil, role: 'master' }).success, false, `${format}:http no role`);
  surfaces.push(`${format}:http`);
}
console.log(JSON.stringify({ status: 'passed', surfaces, surfaceCount: surfaces.length, assertions }));
