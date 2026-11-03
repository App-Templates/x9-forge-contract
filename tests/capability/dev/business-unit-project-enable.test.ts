import { describe, expect, it } from 'vitest';
import { DevAgentConfigSchema } from '../../../src/capability/dev/config-state.js';
import { isDevProductionJobForConfig } from '../../../src/capability/dev/production-config-match.js';
import * as http from '../../../src/http/index.js';
import {
  DevBusinessUnitProjectEnableRequestSchema,
  DevBusinessUnitProjectEnableResponseSchema,
  devBusinessUnitProjectEnableContract,
} from '../../../src/http/endpoints/internal-capability-dev.js';

const base = {
  tenantId: 'tenant', ownerId: 'owner', agentId: 'agent', boardId: 'board',
  enabled: true, configVersion: 1, keyVersion: 1, bindings: [],
};
const session = {
  scope: { tenantId: 'tenant', ownerId: 'owner', agentId: 'agent' },
  sessionId: 'session', target: { kind: 'local' as const, deviceId: 'device' }, engines: ['claude', 'codex'] as ['claude', 'codex'],
};
const roleModels = {
  coordination: { engine: 'claude' as const, modelId: 'coordinator' },
  planning: { engine: 'codex' as const, modelId: 'planner' },
  unblocking: { engine: 'claude' as const, modelId: 'unblocker' },
  code: { engine: 'codex' as const, modelId: 'coder' },
  design: { engine: 'claude' as const, modelId: 'designer' },
  presentation: { engine: 'codex' as const, modelId: 'presenter' },
};

describe('cap-dev board-driven business unit configuration', () => {
  it('(a) accepts a configuration without production.session', () => {
    const input = { ...base, production: { allowedProjectIds: ['good-choice'] } };
    expect(DevAgentConfigSchema.safeParse(input).success).toBe(true);
  });

  it('(b) keeps today\'s full configuration valid and unchanged', () => {
    const input = { ...base, ownerChatIds: [], production: { session, allowedProjectIds: ['p'], roleModels } };
    expect(DevAgentConfigSchema.parse(input)).toEqual(input);
  });

  it('(c) rejects roleModels without a session', () => {
    const input = { ...base, production: { allowedProjectIds: ['p'], roleModels } };
    const r = DevAgentConfigSchema.safeParse(input);
    expect(r.success).toBe(false);
    expect(r.error?.issues.some((i) => i.message === 'Role models need a session')).toBe(true);
  });

  it('(d) still rejects a session scope with a different agentId', () => {
    const input = { ...base, production: { session: { ...session, scope: { ...session.scope, agentId: 'other' } }, allowedProjectIds: ['p'] } };
    expect(DevAgentConfigSchema.safeParse(input).success).toBe(false);
  });

  it('(e) request and response of the enable contract', () => {
    const req = { tenantId: 'tenant', ownerId: 'owner', projectId: 'good-choice' };
    expect(DevBusinessUnitProjectEnableRequestSchema.safeParse(req).success).toBe(true);
    expect(DevBusinessUnitProjectEnableRequestSchema.safeParse({ ...req, extra: 1 }).success).toBe(false);
    expect(DevBusinessUnitProjectEnableRequestSchema.safeParse({ ...req, projectId: '' }).success).toBe(false);
    expect(DevBusinessUnitProjectEnableRequestSchema.safeParse({ ...req, projectId: 'x'.repeat(65) }).success).toBe(false);
    const res = { status: 'enabled' as const, configVersion: 1, allowedProjectIds: ['good-choice'] };
    expect(DevBusinessUnitProjectEnableResponseSchema.safeParse(res).success).toBe(true);
    expect(DevBusinessUnitProjectEnableResponseSchema.safeParse({ ...res, status: 'already' }).success).toBe(true);
    expect(DevBusinessUnitProjectEnableResponseSchema.safeParse({ ...res, status: 'done' }).success).toBe(false);
    expect(DevBusinessUnitProjectEnableResponseSchema.safeParse({ ...res, extra: 1 }).success).toBe(false);
    expect(DevBusinessUnitProjectEnableResponseSchema.safeParse({ ...res, allowedProjectIds: [] }).success).toBe(false);
    expect(DevBusinessUnitProjectEnableResponseSchema.safeParse({ ...res, configVersion: 0 }).success).toBe(false);
  });

  it('(f) the contract is exported from http and has the :agentId path', () => {
    expect(http.devBusinessUnitProjectEnableContract).toBe(devBusinessUnitProjectEnableContract);
    expect(devBusinessUnitProjectEnableContract.path).toContain(':agentId');
    expect(devBusinessUnitProjectEnableContract.method).toBe('POST');
  });

  it('(g) rejects matching a session job to a configuration without a session', () => {
    const job = {
      version: 1, scope: session.scope, jobId: 'job', requestId: 'request_12345678', projectId: 'good-choice',
      session, productKind: 'code', instruction: 'Build the selected project', reportVersion: 1,
      reportDigest: 'a'.repeat(64), configVersion: 1, keyVersion: 1,
      limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
    };
    const state = { status: 'applied', appliedConfigVersion: 1, lastSeenAt: null, reason: null };
    const production = { allowedProjectIds: ['good-choice'] };
    expect(isDevProductionJobForConfig(job, { config: { ...base, production: { ...production, session } }, state })).toBe(true);
    expect(isDevProductionJobForConfig(job, { config: { ...base, production }, state })).toBe(false);
  });
});
