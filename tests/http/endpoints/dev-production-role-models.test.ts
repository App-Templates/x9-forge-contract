import { describe, expect, it } from 'vitest';
import {
  DevProductionRoleModelsSchema, DevelopmentSessionModelSelectionSchema,
  isDevProductionRoleModelsUsable,
} from '../../../src/http/index.js';
import type { DevProductionRoleModels, DevelopmentSessionModels } from '../../../src/http/index.js';

const roles = ['coordination', 'planning', 'unblocking', 'code', 'design', 'presentation'] as const;
const now = Date.parse('2026-10-16T10:01:00Z');
function fixture() {
  const choices: DevProductionRoleModels = {
    coordination: { engine: 'claude', modelId: 'shared-id', reasoningEffort: 'high' },
    planning: { engine: 'codex', modelId: 'shared-id', reasoningEffort: 'low' },
    unblocking: { engine: 'claude', modelId: 'unblocking-model', reasoningEffort: 'medium' },
    code: { engine: 'codex', modelId: 'code-model', reasoningEffort: 'high' },
    design: { engine: 'claude', modelId: 'design-model', reasoningEffort: 'low' },
    presentation: { engine: 'codex', modelId: 'presentation-model' },
  };
  const catalog: DevelopmentSessionModels = {
    lease: {
      binding: { scope: { tenantId: 'tenant', ownerId: 'owner', agentId: 'agent' }, sessionId: 'session', target: { kind: 'local', deviceId: 'device' }, engines: ['claude', 'codex'] },
      leaseId: 'lease', consentRef: 'consent', status: 'connected',
      issuedAt: '2026-10-16T10:00:00Z', lastSeenAt: '2026-10-16T10:00:30Z', expiresAt: '2026-10-16T10:02:00Z',
      availableEngines: ['claude', 'codex'],
    },
    models: roles.map(role => ({
      engine: choices[role].engine, modelId: choices[role].modelId, label: `${role} adapter`,
      reasoningEfforts: choices[role].reasoningEffort === undefined ? [] : [choices[role].reasoningEffort],
    })),
  };
  return { choices, catalog, binding: structuredClone(catalog.lease.binding) };
}
function usable(choices: unknown, catalog: DevelopmentSessionModels, binding: unknown = catalog.lease.binding, clock = now) {
  return isDevProductionRoleModelsUsable(choices, catalog, binding, clock);
}

describe('bridge219', () => {
  it('accepts six distinct explicit choices through public exports', () => {
    const { choices, catalog, binding } = fixture();
    expect(DevProductionRoleModelsSchema.parse(choices)).toEqual(choices);
    expect(Object.keys(DevProductionRoleModelsSchema.shape)).toEqual(roles);
    for (const role of roles) expect(DevProductionRoleModelsSchema.shape[role]).toBe(DevelopmentSessionModelSelectionSchema);
    expect(usable(choices, catalog, binding)).toBe(true);
    catalog.lease.binding.target = { kind: 'cloud', connectionRef: 'connection' };
    expect(usable(choices, catalog)).toBe(true);
  });
  it.each(roles)('requires role %s', (role) => {
    const { choices } = fixture();
    const missing: Partial<DevProductionRoleModels> = { ...choices };
    delete missing[role];
    expect(DevProductionRoleModelsSchema.safeParse(missing).success).toBe(false);
  });
  it('rejects foreign container keys', () => {
    const { choices } = fixture();
    expect(DevProductionRoleModelsSchema.safeParse({ ...choices, foreign: true }).success).toBe(false);
  });
  it('rejects extra choice fields', () => {
    const { choices, catalog } = fixture();
    const extra = { ...choices, code: { ...choices.code, extra: true } };
    expect(DevProductionRoleModelsSchema.safeParse(extra).success).toBe(false);
    expect(usable(extra, catalog)).toBe(false);
  });
  it('parses roles before delegation', () => {
    const { choices, catalog } = fixture();
    expect(usable({ ...choices, foreign: choices.code }, catalog)).toBe(false);
  });
  it('rejects malformed roles without throwing', () => {
    const { catalog } = fixture();
    for (const raw of [null, undefined, {}, [], 'roles']) expect(usable(raw, catalog)).toBe(false);
  });
  it.each(roles)('rejects unavailable model for %s', (role) => {
    const { choices, catalog } = fixture();
    choices[role] = { ...choices[role], modelId: 'missing' };
    expect(usable(choices, catalog)).toBe(false);
  });
  it.each(roles)('rejects unavailable reasoning for %s', (role) => {
    const { choices, catalog } = fixture();
    choices[role] = { ...choices[role], reasoningEffort: 'missing' };
    expect(usable(choices, catalog)).toBe(false);
  });
  it('delegates every choice with only one unavailable among five available', () => {
    const { choices, catalog, binding } = fixture();
    expect(usable(choices, catalog, binding)).toBe(true);
    choices.presentation = { ...choices.presentation, modelId: 'missing' };
    expect(usable(choices, catalog, binding)).toBe(false);
  });
  it('distinguishes engines sharing a model id', () => {
    const { choices, catalog } = fixture();
    choices.planning = { ...choices.planning, reasoningEffort: 'high' };
    expect(usable(choices, catalog)).toBe(false);
  });
  it('rejects another owner expired offline and revoked catalogs', () => {
    const { choices, catalog, binding } = fixture();
    catalog.lease.binding.scope.ownerId = 'other';
    expect(usable(choices, catalog, binding)).toBe(false);
    catalog.lease.binding.scope.ownerId = binding.scope.ownerId;
    expect(usable(choices, catalog, binding, Date.parse(catalog.lease.expiresAt))).toBe(false);
    for (const status of ['offline', 'revoked'] as const) {
      const offline = { ...catalog, lease: { ...catalog.lease, status, availableEngines: [] }, models: [] };
      expect(usable(choices, offline, binding)).toBe(false);
    }
    for (const raw of [null, {}]) expect(isDevProductionRoleModelsUsable(choices, raw, binding, now)).toBe(false);
    expect(usable(choices, catalog, binding, NaN)).toBe(false);
  });
  it('leaves successful and rejected inputs unchanged', () => {
    const { choices, catalog, binding } = fixture();
    choices.code.modelId = ` ${choices.code.modelId} `;
    const before = structuredClone({ choices, catalog, binding });
    expect(usable(choices, catalog, binding)).toBe(true);
    expect(usable(choices, catalog, { ...binding, sessionId: 'other' })).toBe(false);
    expect({ choices, catalog, binding }).toEqual(before);
  });
});
