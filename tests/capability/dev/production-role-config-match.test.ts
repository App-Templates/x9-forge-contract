import { describe, expect, it } from 'vitest';
import { DevAgentConfigStateSchema, type DevAgentConfigState } from '../../../src/capability/dev/config-state.js';
import { DevProductionJobSchema, type DevProductionJob } from '../../../src/capability/dev/production-job.js';
import { isDevProductionJobForConfig } from '../../../src/capability/dev/production-config-match.js';
import type { DevProductionRoleModels } from '../../../src/http/endpoints/development-session-models.js';

const roles = ['coordination', 'planning', 'unblocking', 'code', 'design', 'presentation'] as const;
const fields = ['engine', 'modelId', 'reasoningEffort'] as const;

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

function fixtures(): { job: DevProductionJob; configState: DevAgentConfigState } {
  const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
  const session = { scope: { ...scope }, sessionId: 'session-1',
    target: { kind: 'local' as const, deviceId: 'device-1' }, engines: ['codex' as const, 'claude' as const] };
  const job: DevProductionJob = {
    version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
    session, productKind: 'code', instruction: 'Build the selected project', reportVersion: 1,
    reportDigest: 'a'.repeat(64), configVersion: 3, keyVersion: 2,
    limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
    roleModels: choices(),
  };
  return { job, configState: {
    config: { ...scope, boardId: 'board-1', enabled: true, configVersion: 3, keyVersion: 2,
      bindings: [], ownerChatIds: [],
      production: { session: structuredClone(session), allowedProjectIds: ['project-1'], roleModels: choices() } },
    state: { status: 'applied', appliedConfigVersion: 3, lastSeenAt: null, reason: null },
  } };
}

function expectValidPair(job: DevProductionJob, configState: DevAgentConfigState): void {
  expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
  expect(DevAgentConfigStateSchema.safeParse(configState).success).toBe(true);
}

describe('bridge222 role model matching', () => {
  it('keeps the historical match when both sides omit role models', () => {
    const { job, configState } = fixtures();
    delete job.roleModels;
    delete configState.config.production!.roleModels;
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(true);
  });
  it('accepts six identical choices with a different key order and leaves inputs unchanged', () => {
    const { job, configState } = fixtures();
    const forward = choices();
    configState.config.production!.roleModels = {
      presentation: forward.presentation, design: forward.design, code: forward.code,
      unblocking: forward.unblocking, planning: forward.planning, coordination: forward.coordination,
    };
    expectValidPair(job, configState);
    const before = JSON.stringify({ job, configState });
    expect(isDevProductionJobForConfig(job, configState)).toBe(true);
    expect(JSON.stringify({ job, configState })).toBe(before);
  });
  it('rejects role models present only in the job', () => {
    const { job, configState } = fixtures();
    delete configState.config.production!.roleModels;
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects role models present only in the config', () => {
    const { job, configState } = fixtures();
    delete job.roleModels;
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  for (const role of roles) {
    for (const field of fields) {
      it(`rejects ${role} ${field} change`, () => {
        const { job, configState } = fixtures();
        const applied = configState.config.production!.roleModels!;
        if (field === 'engine') {
          applied[role] = { ...applied[role], engine: applied[role].engine === 'codex' ? 'claude' : 'codex' };
        } else if (field === 'modelId') {
          applied[role] = { ...applied[role], modelId: `${applied[role].modelId}-other` };
        } else {
          applied[role] = { ...applied[role], reasoningEffort: job.roleModels![role].reasoningEffort === 'high' ? 'low' : 'high' };
        }
        expectValidPair(job, configState);
        expect(isDevProductionJobForConfig(job, configState)).toBe(false);
      });
    }
  }
  it('rejects omitted reasoning against explicit reasoning in both directions', () => {
    const omittedInJob = fixtures();
    omittedInJob.job.roleModels!.code = { engine: 'codex', modelId: 'coder' };
    expectValidPair(omittedInJob.job, omittedInJob.configState);
    expect(isDevProductionJobForConfig(omittedInJob.job, omittedInJob.configState)).toBe(false);
    const omittedInConfig = fixtures();
    omittedInConfig.configState.config.production!.roleModels!.code = { engine: 'codex', modelId: 'coder' };
    expectValidPair(omittedInConfig.job, omittedInConfig.configState);
    expect(isDevProductionJobForConfig(omittedInConfig.job, omittedInConfig.configState)).toBe(false);
  });
});
