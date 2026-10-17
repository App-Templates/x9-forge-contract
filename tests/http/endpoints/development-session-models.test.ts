import { describe, expect, it } from 'vitest';
import * as http from '../../../src/http/index.js';
import type { DevelopmentSessionModels } from '../../../src/http/index.js';

const scope = { tenantId: 'tenant', ownerId: 'owner', agentId: 'agent' };
const now = Date.parse('2026-10-16T10:01:00Z');
function fixture(): DevelopmentSessionModels {
  return {
    lease: {
      binding: { scope: { ...scope }, sessionId: 'session', target: { kind: 'local', deviceId: 'device-one' }, engines: ['claude', 'codex'] },
      leaseId: 'lease', consentRef: 'consent', status: 'connected',
      issuedAt: '2026-10-16T10:00:00Z', lastSeenAt: '2026-10-16T10:00:30Z', expiresAt: '2026-10-16T10:02:00Z',
      availableEngines: ['claude', 'codex'],
    },
    models: [
      { engine: 'claude', modelId: 'adapter-model-a', label: 'Adapter A', reasoningEfforts: ['adapter-effort'] },
      { engine: 'codex', modelId: 'adapter-model-a', label: 'Adapter B', reasoningEfforts: [] },
    ],
  };
}
const valid = (raw: unknown) => http.DevelopmentSessionModelsSchema.safeParse(raw).success;
const contract = http.getDevelopmentSessionModelsContract;

describe('development session models', () => {
  it('exports the exact route metadata through public http', () => {
    expect(contract.method === 'GET' && contract.path === '/internal/connect/development-sessions/:sessionId/models' && contract.authType === 'secret' && contract.responseSchema === http.DevelopmentSessionModelsSchema).toBe(true);
  });
  it('accepts strict route params and scope query', () => {
    expect(contract.paramsSchema.safeParse({ sessionId: 'session' }).success).toBe(true);
    expect(contract.querySchema.safeParse({ scope }).success).toBe(true);
    expect(contract.paramsSchema.safeParse({ sessionId: '' }).success).toBe(false);
    expect(contract.paramsSchema.safeParse({ sessionId: 'session', token: 'untrusted' }).success).toBe(false);
    expect(contract.querySchema.safeParse({ scope, token: 'untrusted' }).success).toBe(false);
    expect(contract.querySchema.safeParse({ scope: { ...scope, token: 'untrusted' } }).success).toBe(false);
    expect(contract.querySchema.safeParse({ scope: { ...scope, ownerId: '' } }).success).toBe(false);
  });
  it('accepts local cloud single and both engines without implied efforts', () => {
    const raw = fixture();
    expect(valid(raw)).toBe(true);
    raw.lease.binding.target = { kind: 'cloud', connectionRef: 'registered-adapter' };
    expect(valid(raw)).toBe(true);
    for (const model of raw.models) {
      const single = { lease: { ...raw.lease, availableEngines: [model.engine], binding: { ...raw.lease.binding, engines: [model.engine] } }, models: [model] };
      expect(valid(single)).toBe(true);
    }
    expect(http.DevelopmentSessionModelsSchema.parse(raw).models[1].reasoningEfforts).toEqual([]);
  });
  it('trims names and rejects blank or oversized fields and arrays', () => {
    const raw = fixture();
    raw.models[0] = { ...raw.models[0], modelId: ' custom ', label: ' Label ', reasoningEfforts: [' custom-effort '] };
    expect(http.DevelopmentSessionModelsSchema.parse(raw).models[0]).toEqual({ engine: 'claude', modelId: 'custom', label: 'Label', reasoningEfforts: ['custom-effort'] });
    for (const [field, limit] of [['modelId', 200], ['label', 120]] as const) {
      for (const value of [' ', 'x'.repeat(limit + 1)]) {
        expect(valid({ ...raw, models: [{ ...raw.models[0], [field]: value }] })).toBe(false);
      }
      expect(valid({ ...raw, models: [{ ...raw.models[0], [field]: 'x'.repeat(limit) }] })).toBe(true);
    }
    for (const value of [' ', 'x'.repeat(41)]) expect(valid({ ...raw, models: [{ ...raw.models[0], reasoningEfforts: [value] }] })).toBe(false);
    expect(valid({ ...raw, models: [{ ...raw.models[0], reasoningEfforts: ['x'.repeat(40)] }] })).toBe(true);
    const models = Array.from({ length: 128 }, (_, i) => ({ ...raw.models[0], modelId: `model-${i}` }));
    expect(valid({ ...raw, models })).toBe(true);
    expect(valid({ ...raw, models: [...models, { ...raw.models[0], modelId: 'overflow' }] })).toBe(false);
    const efforts = Array.from({ length: 16 }, (_, i) => `effort-${i}`);
    expect(valid({ ...raw, models: [{ ...raw.models[0], reasoningEfforts: efforts }] })).toBe(true);
    expect(valid({ ...raw, models: [{ ...raw.models[0], reasoningEfforts: [...efforts, 'overflow'] }] })).toBe(false);
  });
  it('trims all adapter strings', () => {
    const raw = fixture();
    raw.models[0] = { ...raw.models[0], modelId: ' id ', label: ' label ', reasoningEfforts: [' effort '] };
    const model = http.DevelopmentSessionModelsSchema.parse(raw).models[0];
    expect(model.modelId !== 'id' || model.label !== 'label' || model.reasoningEfforts[0] !== 'effort').toBe(false);
  });
  it('rejects extra fields and tokens at every response boundary', () => {
    const raw = fixture();
    for (const value of [
      { ...raw, token: 'untrusted' },
      { ...raw, lease: { ...raw.lease, token: 'untrusted' } },
      { ...raw, models: [{ ...raw.models[0], token: 'untrusted' }] },
      { ...raw, models: [{ ...raw.models[0], engine: 'api-provider' }] },
    ]) expect(valid(value)).toBe(false);
  });
  it('rejects duplicate model pairs after trimming', () => {
    const raw = fixture();
    raw.models.push({ ...raw.models[0], modelId: ` ${raw.models[0].modelId} ` });
    expect(valid(raw)).toBe(false);
  });
  it('rejects duplicate efforts after trimming', () => {
    const raw = fixture(); raw.models[0].reasoningEfforts = ['custom', ' custom '];
    expect(valid(raw)).toBe(false);
  });
  it('rejects engines absent from the lease attestation', () => {
    const raw = fixture(); raw.lease.availableEngines = ['claude'];
    expect(valid(raw)).toBe(false);
  });
  it('rejects models on offline and revoked leases but accepts empty lists', () => {
    for (const status of ['offline', 'revoked'] as const) {
      const raw = fixture(); raw.lease.status = status;
      expect(valid(raw)).toBe(false);
      raw.models = []; expect(valid(raw)).toBe(true);
    }
  });
  it('selects fresh models and rejects invalid responses', () => {
    const raw = fixture();
    expect(http.selectableDevelopmentSessionModels(raw, raw.lease.binding, now)).toEqual(raw.models);
    expect(http.selectableDevelopmentSessionModels(null, raw.lease.binding, now).length > 0).toBe(false);
    expect(http.selectableDevelopmentSessionModels({ ...raw, token: 'untrusted' }, raw.lease.binding, now)).toEqual([]);
  });
  it('delegates selection to existing lease usability checks', () => {
    const raw = fixture();
    const expired = http.selectableDevelopmentSessionModels(raw, raw.lease.binding, Date.parse(raw.lease.expiresAt));
    expect(expired.length > 0).toBe(false);
    const otherOwner = { ...raw.lease.binding, scope: { ...scope, ownerId: 'other' } };
    expect(http.selectableDevelopmentSessionModels(raw, otherOwner, now)).toEqual([]);
    const absentEngine = { ...raw, lease: { ...raw.lease, availableEngines: ['claude'] }, models: [raw.models[1]] };
    expect(http.selectableDevelopmentSessionModels(absentEngine, raw.lease.binding, now)).toEqual([]);
  });
  it('returns detached models and reasoning arrays', () => {
    const raw = fixture(); const original = structuredClone(raw);
    const selected = http.selectableDevelopmentSessionModels(raw, raw.lease.binding, now);
    selected[0].label = 'Changed'; selected[0].reasoningEfforts.push('changed'); selected.pop();
    expect(JSON.stringify(raw) !== JSON.stringify(original)).toBe(false);
  });
});
