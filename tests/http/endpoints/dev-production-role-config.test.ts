import { describe, expect, it } from 'vitest';
import {
  devConfigGetContract, devConfigPutContract, devStateGetContract,
} from '../../../src/http/endpoints/internal-capability-dev.js';
import type { DevProductionRoleModels } from '../../../src/http/endpoints/development-session-models.js';
import type { DevelopmentSessionBinding } from '../../../src/capability/connect/development-session.js';

const roles = ['coordination', 'planning', 'unblocking', 'code', 'design', 'presentation'] as const;
const legacy = {
  tenantId: 'tenant', ownerId: 'owner', agentId: 'agent', boardId: 'board',
  enabled: true, configVersion: 9, keyVersion: 1, bindings: [],
};
function choices(): DevProductionRoleModels {
  return {
    coordination: { engine: 'claude', modelId: 'coordinator', reasoningEffort: 'high' },
    planning: { engine: 'codex', modelId: 'planner', reasoningEffort: 'medium' },
    unblocking: { engine: 'claude', modelId: 'unblocker', reasoningEffort: 'max' },
    code: { engine: 'codex', modelId: 'coder', reasoningEffort: 'low' },
    design: { engine: 'claude', modelId: 'designer', reasoningEffort: 'minimal' },
    presentation: { engine: 'codex', modelId: 'presenter' },
  };
}
function fixture() {
  const session: DevelopmentSessionBinding = {
    scope: { tenantId: 'tenant', ownerId: 'owner', agentId: 'agent' },
    sessionId: 'session', target: { kind: 'local', deviceId: 'device' }, engines: ['claude', 'codex'],
  };
  return { ...legacy, production: { session, allowedProjectIds: ['project'], roleModels: choices() } };
}

describe('bridge220', () => {
  it('preserves legacy config without production or role defaults', () => {
    const saved = devConfigPutContract.bodySchema.parse(legacy);
    expect(devConfigGetContract.responseSchema.parse(saved)).toEqual({ ...legacy, ownerChatIds: [] });
    expect(Object.hasOwn(saved, 'production')).toBe(false);
  });
  it('preserves legacy production without role defaults', () => {
    const { session, allowedProjectIds } = fixture().production;
    const production = { session, allowedProjectIds };
    const input = { ...legacy, production };
    const saved = devConfigPutContract.bodySchema.parse(input);
    expect(devConfigGetContract.responseSchema.parse(saved)).toEqual({ ...input, ownerChatIds: [] });
    expect(Object.hasOwn(saved.production ?? {}, 'roleModels')).toBe(false);
  });
  it('roundtrips six independent choices and reasoning through public contracts', () => {
    // Deliberately independent of the input factory and canonical schema shape.
    const expected = {
      coordination: { engine: 'claude', modelId: 'coordinator', reasoningEffort: 'high' },
      planning: { engine: 'codex', modelId: 'planner', reasoningEffort: 'medium' },
      unblocking: { engine: 'claude', modelId: 'unblocker', reasoningEffort: 'max' },
      code: { engine: 'codex', modelId: 'coder', reasoningEffort: 'low' },
      design: { engine: 'claude', modelId: 'designer', reasoningEffort: 'minimal' },
      presentation: { engine: 'codex', modelId: 'presenter' },
    };
    const put = devConfigPutContract.bodySchema.safeParse(fixture());
    const savedRoles = put.success ? put.data.production?.roleModels : undefined;
    expect(savedRoles).toEqual(expected);
    if (!put.success) throw put.error;
    const get = devConfigGetContract.responseSchema.parse(put.data);
    expect(get.production?.roleModels).toEqual(expected);
    const reported = devStateGetContract.responseSchema.parse({
      config: get, state: { status: 'pending', appliedConfigVersion: 2, lastSeenAt: null, reason: 'awaiting application' },
    });
    expect(reported.config.production?.roleModels).toEqual(expected);
    expect(reported.state).toEqual({ status: 'pending', appliedConfigVersion: 2, lastSeenAt: null, reason: 'awaiting application' });
  });
  for (const kind of ['local', 'cloud'] as const) {
    for (const engines of [['claude'], ['codex'], ['claude', 'codex']] as const) {
      it(`accepts ${kind} with ${engines.join(' and ')} without attesting availability`, () => {
        const input = fixture();
        input.production.session.target = kind === 'local' ? { kind, deviceId: 'device' } : { kind, connectionRef: 'connection' };
        input.production.session.engines = [...engines];
        for (const role of roles) input.production.roleModels[role].engine = engines[0];
        const saved = devConfigPutContract.bodySchema.parse(input);
        expect(devConfigGetContract.responseSchema.parse(saved).production).toEqual(input.production);
      });
    }
  }
  for (const role of roles) {
    it(`rejects an unselected engine for ${role}`, () => {
      const input = fixture();
      input.production.session.engines = ['claude'];
      for (const name of roles) input.production.roleModels[name].engine = 'claude';
      input.production.roleModels[role].engine = 'codex';
      const result = devConfigPutContract.bodySchema.safeParse(input);
      expect(result.success).toBe(false);
      if (result.success) throw new Error('Expected an engine validation issue');
      expect(result.error.issues).toContainEqual({
        code: 'custom', path: ['production', 'roleModels', role, 'engine'],
        message: 'Role model engine must be selected in the session',
      });
    });
  }
  it('rejects an unknown role and malformed choice using the canonical schema', () => {
    const input = fixture();
    expect(devConfigPutContract.bodySchema.safeParse({ ...input, production: {
      ...input.production, roleModels: { ...input.production.roleModels, unknown: input.production.roleModels.code },
    } }).success).toBe(false);
    for (const malformed of [{ engine: 'codex' }, { engine: 'codex', modelId: '' }, { engine: 'codex', modelId: 'model', reasoningEffort: 3 }, { engine: 'codex', modelId: 'model', extra: true }]) {
      expect(devConfigPutContract.bodySchema.safeParse({ ...input, production: {
        ...input.production, roleModels: { ...input.production.roleModels, code: malformed },
      } }).success).toBe(false);
    }
  });
  for (const status of ['pending', 'applied'] as const) {
    it(`preserves ${status} and the actual lower applied version after saving`, () => {
      const saved = devConfigPutContract.bodySchema.parse(fixture());
      const config = devConfigGetContract.responseSchema.parse(saved);
      const state = { status, appliedConfigVersion: 3, lastSeenAt: '2026-10-16T10:00:00Z', reason: null };
      const reported = devStateGetContract.responseSchema.parse({ config, state });
      expect(reported.state).toEqual(state);
      expect(reported.config.configVersion).toBe(9);
      expect(reported.config.production?.roleModels).toEqual(choices());
    });
  }
});
