import { describe, expect, it } from 'vitest';
import {
  DevAgentConfigStateSchema,
  DevProductionJobSchema,
  isDevProductionJobForConfig,
  isDevProductionJobModelsUsable,
  type DevAgentConfigState,
  type DevProductionJob,
} from '../../../src/capability/dev/index.js';
import type { DevelopmentSessionModels, DevProductionRoleModels } from '../../../src/http/index.js';

const roles = ['coordination', 'planning', 'unblocking', 'code', 'design', 'presentation'] as const;
const now = Date.parse('2026-10-16T10:01:00Z');

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

function job(): DevProductionJob {
  const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
  return {
    version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
    session: { scope: { ...scope }, sessionId: 'session-1',
      target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex', 'claude'] },
    productKind: 'code', instruction: 'Build the selected project', reportVersion: 1,
    reportDigest: 'a'.repeat(64), configVersion: 3, keyVersion: 2,
    limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
    roleModels: choices(),
  };
}

function catalog(): DevelopmentSessionModels {
  const base = job();
  return {
    lease: {
      binding: structuredClone(base.session), leaseId: 'lease-1', consentRef: 'consent-1', status: 'connected',
      issuedAt: '2026-10-16T10:00:00Z', lastSeenAt: '2026-10-16T10:00:30Z', expiresAt: '2026-10-16T10:02:00Z',
      availableEngines: ['codex', 'claude'],
    },
    models: roles.map((role) => {
      const { engine, modelId, reasoningEffort } = choices()[role];
      return { engine, modelId, label: `Label ${role}`, reasoningEfforts: reasoningEffort ? [reasoningEffort] : [] };
    }),
  };
}

describe('bridge230', () => {
  it('accepts six explicit available role choices', () => {
    expect(DevProductionJobSchema.safeParse(job()).success).toBe(true);
    expect(isDevProductionJobModelsUsable(job(), catalog(), now)).toBe(true);
  });

  it('rejects a removed model for each role', () => {
    for (const role of roles) {
      const gone = choices()[role];
      const reduced = catalog();
      reduced.models = reduced.models.filter((m) => !(m.engine === gone.engine && m.modelId === gone.modelId));
      expect(reduced.models).toHaveLength(5);
      expect(isDevProductionJobModelsUsable(job(), reduced, now), `removed ${role}`).toBe(false);
    }
  });

  it('rejects unavailable reasoning choice', () => {
    const withEffort = job();
    withEffort.roleModels!.design = { engine: 'claude', modelId: 'designer', reasoningEffort: 'ultra' };
    expect(isDevProductionJobModelsUsable(withEffort, catalog(), now), 'unattested effort').toBe(false);
    const noEffort = job();
    delete noEffort.roleModels!.unblocking.reasoningEffort;
    expect(isDevProductionJobModelsUsable(noEffort, catalog(), now), 'missing effort').toBe(false);
    const extra = job();
    extra.roleModels!.presentation = { engine: 'codex', modelId: 'presenter', reasoningEffort: 'high' };
    expect(isDevProductionJobModelsUsable(extra, catalog(), now), 'effort on a model without any').toBe(false);
  });

  it('rejects foreign or expired session catalog', () => {
    const foreignOwner = catalog();
    foreignOwner.lease.binding.scope.ownerId = 'owner-2';
    expect(isDevProductionJobModelsUsable(job(), foreignOwner, now), 'foreign owner').toBe(false);
    const foreignDevice = catalog();
    foreignDevice.lease.binding.target = { kind: 'local', deviceId: 'device-2' };
    expect(isDevProductionJobModelsUsable(job(), foreignDevice, now), 'foreign device').toBe(false);
    const expired = catalog();
    expect(isDevProductionJobModelsUsable(job(), expired, Date.parse('2026-10-16T10:02:00Z')), 'expired lease').toBe(false);
    const revoked = catalog();
    revoked.lease.status = 'revoked';
    revoked.models = [];
    expect(isDevProductionJobModelsUsable(job(), revoked, now), 'revoked lease').toBe(false);
    expect(isDevProductionJobModelsUsable(job(), catalog(), Number.NaN), 'invalid clock').toBe(false);
  });

  it('rejects malformed or legacy job without explicit choices', () => {
    expect(isDevProductionJobModelsUsable({ ...job(), unexpected: true }, catalog(), now), 'extra property').toBe(false);
    const legacy = job();
    delete legacy.roleModels;
    expect(DevProductionJobSchema.safeParse(legacy).success).toBe(true);
    expect(isDevProductionJobModelsUsable(legacy, catalog(), now), 'legacy job').toBe(false);
    for (const raw of [null, undefined, 'job', 7, {}, { ...job(), roleModels: { ...choices(), code: undefined } }]) {
      expect(isDevProductionJobModelsUsable(raw, catalog(), now), 'malformed job').toBe(false);
    }
    expect(isDevProductionJobModelsUsable(job(), null, now), 'malformed catalog').toBe(false);
  });

  it('preserves existing config matching behavior', () => {
    const scope = job().scope;
    const state = (): DevAgentConfigState => ({
      config: { ...scope, boardId: 'board-1', enabled: true, configVersion: 3, keyVersion: 2,
        bindings: [], ownerChatIds: [],
        production: { session: structuredClone(job().session), allowedProjectIds: ['project-1'], roleModels: choices() } },
      state: { status: 'applied', appliedConfigVersion: 3, lastSeenAt: null, reason: null },
    });
    expect(DevAgentConfigStateSchema.safeParse(state()).success).toBe(true);
    expect(isDevProductionJobForConfig(job(), state())).toBe(true);
    const drifted = state();
    drifted.config.production!.roleModels!.code = { engine: 'codex', modelId: 'other', reasoningEffort: 'low' };
    expect(isDevProductionJobForConfig(job(), drifted)).toBe(false);
    const pending = state();
    pending.state = { status: 'pending', appliedConfigVersion: null, lastSeenAt: null, reason: null };
    expect(isDevProductionJobForConfig(job(), pending)).toBe(false);
    // Model availability and config matching are independent checks.
    expect(isDevProductionJobModelsUsable(job(), catalog(), now)).toBe(true);
  });
});
