import {describe, expect, it} from 'vitest';
import {ModelsTargetSchema, ModelsApplyJobSchema, AgentModelOverviewRowSchema} from '../../src/model-router/index.js';
import {ModelsApplyRequestSchema, ModelsApplyResponseSchema, internalModelsApplyContract,
  internalModelsApplyJobContract, modelsApplyJobPath} from '../../src/http/index.js';
import {INTERNAL_SECRET_HEADER} from '../../src/auth/index.js';
const identity = {managementAgentId: 'physical-executor', runtimeAgentId: 'physical-runtime', vaultAgentId: 1};
const configuration = {schemaVersion: 1, identity, configVersion: 1, selections: [{slotId: 'agent_chat', settings: {
  capability: 'agent-core', function: 'reasoning', catalogVersion: 'synthetic-catalog', requirements: {tools: false, stream: false, structuredOutput: false},
  mode: 'single', descriptor: {provider: 'openai', modelId: 'synthetic-model', protocol: 'responses', adapterId: 'synthetic-adapter'}}}]};
const request = () => ({requestId: 'synthetic-apply-request', target: {scope: 'stack'}, desiredVersion: 1, configuration,
  heirs: ['synthetic-agent-a', 'synthetic-agent-b']});
const job = () => ({requestId: 'synthetic-apply-request', kind: 'initial', desiredVersion: 1, phase: 'accepted',
  startedAt: '2026-10-13T10:00:00Z', updatedAt: '2026-10-13T10:00:00Z', slots: [{slotId: 'agent_chat', status: 'waiting'}],
  target: {scope: 'stack'}, children: [{agentId: 'synthetic-agent-a', state: 'queued'}]});
const row = () => ({identity, ownerId: 'synthetic-owner', slotId: 'agent_chat', capability: 'agent-core', function: 'reasoning',
  channelId: null, installation: 'unknown', editability: 'readonly', reason: 'Synthetic missing source', origin: 'unknown',
  masterAgentId: null, masterConfigVersion: null, requirements: {tools: false, stream: false, structuredOutput: false},
  default: null, saved: null, applied: null, versions: null, catalogVersion: null, cost: {state: 'unknown', reason: 'Synthetic unavailable'}, embedding: null});
describe('stack and agent model targets', () => {
  it('keeps stack target independent of the physical executor identity', () => {
    expect(ModelsApplyRequestSchema.parse(request()).target).toEqual({scope: 'stack'});
    expect(ModelsApplyRequestSchema.parse(request()).configuration.identity).toEqual(identity);
    expect(ModelsTargetSchema.parse({scope: 'agent', agentId: 'ordinary-x9-agent'})).toEqual({scope: 'agent', agentId: 'ordinary-x9-agent'});
  });
  it.each([{scope: 'stack', agentId: 'ordinary-x9-agent'}, {scope: 'agent'}, {scope: 'agent', agentId: ''}, {scope: 'master'},
    {scope: 'agent', agentId: 'ordinary-x9-agent', extra: true}])('rejects ambiguous or noncanonical target %j', target => {
    expect(ModelsTargetSchema.safeParse(target).success).toBe(false);
  });
  it('uses one additive internal endpoint pair with canonical secret auth', () => {
    expect(internalModelsApplyContract).toMatchObject({method: 'POST', path: '/internal/models/apply', authType: 'secret', authHeader: INTERNAL_SECRET_HEADER});
    expect(internalModelsApplyJobContract).toMatchObject({method: 'GET', path: '/internal/models/apply/:requestId', authType: 'secret', authHeader: INTERNAL_SECRET_HEADER});
    expect(modelsApplyJobPath(request().requestId)).toBe('/internal/models/apply/' + request().requestId);
    expect(() => modelsApplyJobPath('bad/path')).toThrow();
  });
  it('admits an agent request without supplying heirs and retains strict requests', () => {
    const {heirs: _heirs, ...body} = request(); expect(ModelsApplyRequestSchema.safeParse({...body, target: {scope: 'agent', agentId: 'ordinary-x9-agent'}}).success).toBe(true);
    for (const patch of [{private: true}, {desiredVersion: 0}, {heirs: ['synthetic-agent-a', 'synthetic-agent-a']}, {heirs: [null]}]) {
      expect(ModelsApplyRequestSchema.safeParse({...request(), ...patch}).success).toBe(false);
    }
  });
  it('distinguishes accepted queue admission from failed admission without claiming installation', () => {
    expect(ModelsApplyResponseSchema.safeParse({ok: true, requestId: request().requestId, outcome: 'accepted'}).success).toBe(true);
    expect(ModelsApplyResponseSchema.safeParse({ok: false, requestId: request().requestId, outcome: 'error', reason: {code: 'catalog-changed'}}).success).toBe(true);
    for (const response of [{ok: true, outcome: 'error'}, {ok: false, outcome: 'accepted'}, {ok: true, outcome: 'installed'}]) {
      expect(ModelsApplyResponseSchema.safeParse({requestId: request().requestId, ...response}).success).toBe(false);
    }
  });
  it('extends pending work with strict target and distinct child progress', () => {
    expect(ModelsApplyJobSchema.safeParse(job()).success).toBe(true);
    expect(ModelsApplyJobSchema.safeParse({...job(), target: {scope: 'agent', agentId: 'ordinary-x9-agent'}, children: []}).success).toBe(true);
    for (const patch of [{private: true}, {children: [...job().children, ...job().children]}, {children: [{agentId: 'synthetic-agent-a', state: 'invented'}]},
      {children: [{agentId: 'synthetic-agent-a', state: 'queued', private: true}]}]) expect(ModelsApplyJobSchema.safeParse({...job(), ...patch}).success).toBe(false);
  });
});
describe('optional canonical overview projection for Forge', () => {
  it('preserves a legacy row and represents known/unknown heir counts separately', () => {
    expect(AgentModelOverviewRowSchema.safeParse(row()).success).toBe(true);
    for (const count of [null, 0, 3]) expect(AgentModelOverviewRowSchema.parse({...row(), heirs: {count}}).heirs?.count).toBe(count);
  });
  it.each(['queued', 'applying', 'applied', 'failed', 'unchanged'])('carries state %s and a typed operator reason', state => {
    expect(AgentModelOverviewRowSchema.safeParse({...row(), apply: {state, reason: {code: 'consumer-rejected', text: 'Synthetic rejection'}},
      card: {modelsVersion: 'mv1-' + 'a'.repeat(32), observedAt: '2026-10-13T10:00:00Z'}}).success).toBe(true);
  });
  it.each([{heirs: {count: -1}}, {heirs: {count: 0.5}}, {heirs: {count: 1, extra: true}}, {apply: {state: 'invented'}},
    {apply: {state: 'failed', reason: {code: 'consumer-rejected', text: 'x'.repeat(501)}}}, {apply: {state: 'queued', private: true}},
    {card: {modelsVersion: 'synthetic-version', observedAt: 'yesterday'}}, {card: {modelsVersion: 'synthetic-version', observedAt: '2026-10-13T10:00:00Z', private: true}}])('keeps additive row projections strict %j', patch => {
    expect(AgentModelOverviewRowSchema.safeParse({...row(), ...patch}).success).toBe(false);
  });
});
