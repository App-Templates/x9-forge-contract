import { describe, expect, it } from 'vitest';
import {
  SessionModelSchema, DevelopmentSessionModelSelectionSchema,
  isDevelopmentSessionModelSelectionUsable,
} from '../../../src/http/index.js';
import type { DevelopmentSessionModels, DevelopmentSessionModelSelection } from '../../../src/http/index.js';

const now = Date.parse('2026-10-16T10:01:00Z');
function fixture(): DevelopmentSessionModels {
  return {
    lease: {
      binding: { scope: { tenantId: 'tenant', ownerId: 'owner', agentId: 'agent' }, sessionId: 'session', target: { kind: 'local', deviceId: 'device' }, engines: ['claude', 'codex'] },
      leaseId: 'lease', consentRef: 'consent', status: 'connected',
      issuedAt: '2026-10-16T10:00:00Z', lastSeenAt: '2026-10-16T10:00:30Z', expiresAt: '2026-10-16T10:02:00Z',
      availableEngines: ['claude', 'codex'],
    },
    models: [
      { engine: 'claude', modelId: 'shared-id', label: 'Claude adapter', reasoningEfforts: ['high', 'low'] },
      { engine: 'codex', modelId: 'shared-id', label: 'Codex adapter', reasoningEfforts: [] },
    ],
  };
}
const choice: DevelopmentSessionModelSelection = { engine: 'claude', modelId: 'shared-id', reasoningEffort: 'high' };
function usable(selection: unknown, catalog = fixture(), binding: unknown = catalog.lease.binding, clock = now) {
  return isDevelopmentSessionModelSelectionUsable(selection, catalog, binding, clock);
}

describe('development session model selection', () => {
  it('exports canonical schemas and accepts local cloud and both engines', () => {
    const catalog = fixture();
    expect(SessionModelSchema.safeParse(catalog.models[0]).success).toBe(true);
    expect(usable(choice, catalog)).toBe(true);
    expect(usable({ engine: 'codex', modelId: 'shared-id' }, catalog)).toBe(true);
    catalog.lease.binding.target = { kind: 'cloud', connectionRef: 'connection' };
    expect(usable(choice, catalog)).toBe(true);
    expect(usable({ engine: 'codex', modelId: 'shared-id' }, catalog)).toBe(true);
    expect(DevelopmentSessionModelSelectionSchema.parse({ ...choice, modelId: ' shared-id ', reasoningEffort: ' high ' })).toEqual(choice);
  });
  it('rejects extra selection fields', () => {
    expect(DevelopmentSessionModelSelectionSchema.safeParse({ ...choice, extra: true }).success).toBe(false);
  });
  it('parses selection before lookup', () => {
    expect(usable({ ...choice, extra: true })).toBe(false);
  });
  it('rejects malformed selections', () => {
    for (const value of [null, {}, { modelId: 'shared-id' }, { engine: 'claude' }, { ...choice, engine: 'other' }, { ...choice, modelId: '' }, { ...choice, reasoningEffort: null }, { ...choice, reasoningEffort: '' }, { ...choice, modelId: 'x'.repeat(201) }, { ...choice, reasoningEffort: 'x'.repeat(41) }]) {
      expect(usable(value)).toBe(false);
      expect(DevelopmentSessionModelSelectionSchema.safeParse(value).success).toBe(false);
    }
  });
  it('delegates to usable catalog selection', () => {
    const catalog = fixture();
    const binding = { ...catalog.lease.binding, scope: { ...catalog.lease.binding.scope, ownerId: 'other' } };
    expect(usable(choice, catalog, binding)).toBe(false);
  });
  it('matches engine independently of model id', () => {
    expect(usable({ engine: 'codex', modelId: 'shared-id', reasoningEffort: 'high' })).toBe(false);
  });
  it('matches model id independently of engine', () => {
    expect(usable({ ...choice, modelId: 'absent' })).toBe(false);
  });
  it('requires omitted effort for an empty list', () => {
    expect(usable({ engine: 'codex', modelId: 'shared-id', reasoningEffort: 'high' })).toBe(false);
  });
  it('requires explicit effort for a nonempty list', () => {
    expect(usable({ engine: 'claude', modelId: 'shared-id' })).toBe(false);
  });
  it('requires an included effort', () => {
    expect(usable({ ...choice, reasoningEffort: 'foreign' })).toBe(false);
  });
  it('rejects invalid catalogs leases bindings targets and clocks', () => {
    const catalog = fixture();
    for (const raw of [null, {}, { ...catalog, extra: true }]) {
      expect(isDevelopmentSessionModelSelectionUsable(choice, raw, catalog.lease.binding, now)).toBe(false);
    }
    for (const status of ['offline', 'revoked'] as const) expect(usable(choice, { ...catalog, lease: { ...catalog.lease, status } })).toBe(false);
    for (const clock of [NaN, Infinity, -Infinity, Date.parse(catalog.lease.expiresAt), 0]) expect(usable(choice, catalog, catalog.lease.binding, clock)).toBe(false);
    for (const binding of [null, {}, { ...catalog.lease.binding, target: { kind: 'local', deviceId: 'other' } }, { ...catalog.lease.binding, target: { kind: 'cloud', connectionRef: 'other' } }]) expect(usable(choice, catalog, binding)).toBe(false);
  });
  it('leaves all inputs unchanged', () => {
    const catalog = fixture();
    const binding = structuredClone(catalog.lease.binding);
    const selection = { ...choice, modelId: ' shared-id ', reasoningEffort: ' high ' };
    const before = structuredClone({ catalog, binding, selection });
    expect(usable(selection, catalog, binding)).toBe(true);
    expect({ catalog, binding, selection }).toEqual(before);
  });
});
