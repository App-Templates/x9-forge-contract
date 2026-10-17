import { describe, expect, it } from 'vitest';
import { DevAgentConfigStateSchema, type DevAgentConfigState } from '../../../src/capability/dev/config-state.js';
import { DevProductionJobSchema, type DevProductionJob } from '../../../src/capability/dev/production-job.js';
import { isDevProductionJobForConfig } from '../../../src/capability/dev/production-config-match.js';

function fixtures(cloud = false): { job: DevProductionJob; configState: DevAgentConfigState } {
  const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
  const job: DevProductionJob = {
    version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
    session: { scope: { ...scope }, sessionId: 'session-1',
      target: cloud ? { kind: 'cloud', connectionRef: 'connection-1' } : { kind: 'local', deviceId: 'device-1' },
      engines: ['codex', 'claude'] },
    productKind: 'code', instruction: 'Build the selected project', reportVersion: 1,
    reportDigest: 'a'.repeat(64), configVersion: 3, keyVersion: 2,
    limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
  };
  return { job, configState: {
    config: { ...scope, boardId: 'board-1', enabled: true, configVersion: 3, keyVersion: 2,
      bindings: [], ownerChatIds: [],
      production: { session: structuredClone(job.session), allowedProjectIds: ['project-2', 'project-1'] } },
    state: { status: 'applied', appliedConfigVersion: 3, lastSeenAt: null, reason: null },
  } };
}

function expectValidPair(job: DevProductionJob, configState: DevAgentConfigState): void {
  expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
  expect(DevAgentConfigStateSchema.safeParse(configState).success).toBe(true);
}

describe('isDevProductionJobForConfig', () => {
  it('accepts local production with web only and no chat', () => {
    const { job, configState } = fixtures();
    expectValidPair(job, configState);
    expect(configState.config.ownerChatIds).toEqual([]);
    expect(isDevProductionJobForConfig(job, configState)).toBe(true);
  });
  it('accepts cloud production', () => {
    const { job, configState } = fixtures(true);
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(true);
  });
  it('compares engine sets and target fields without changing inputs', () => {
    const { job, configState } = fixtures();
    job.session.engines.reverse();
    job.session.target = { deviceId: 'device-1', kind: 'local' };
    const before = JSON.stringify({ job, configState });
    expect(isDevProductionJobForConfig(job, configState)).toBe(true);
    expect(JSON.stringify({ job, configState })).toBe(before);
  });
  it('accepts the selected single engine', () => {
    const { job, configState } = fixtures();
    job.session.engines = ['codex'];
    configState.config.production!.session.engines = ['codex'];
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(true);
  });
  it('rejects tenantId with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.scope.tenantId = 'other';
    job.session.scope.tenantId = 'other';
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects ownerId with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.scope.ownerId = 'other';
    job.session.scope.ownerId = 'other';
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects agentId with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.scope.agentId = 'other';
    job.session.scope.agentId = 'other';
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects projectId with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.projectId = 'unlisted-project';
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects configVersion with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.configVersion = 4;
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects keyVersion with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.keyVersion = 3;
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects appliedConfigVersion with individually valid inputs', () => {
    const { job, configState } = fixtures();
    configState.state.appliedConfigVersion = 2;
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects sessionId with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.session.sessionId = 'other-session';
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects local target kind with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.session.target = { kind: 'cloud', connectionRef: 'connection-1' };
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects cloud target kind with individually valid inputs', () => {
    const { job, configState } = fixtures(true);
    job.session.target = { kind: 'local', deviceId: 'device-1' };
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects deviceId with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.session.target = { kind: 'local', deviceId: 'other-device' };
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects connectionRef with individually valid inputs', () => {
    const { job, configState } = fixtures(true);
    job.session.target = { kind: 'cloud', connectionRef: 'other-connection' };
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects engine subset with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.session.engines = ['codex'];
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects engine superset with individually valid inputs', () => {
    const { job, configState } = fixtures();
    configState.config.production!.session.engines = ['codex'];
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects different engine with individually valid inputs', () => {
    const { job, configState } = fixtures();
    job.session.engines = ['claude'];
    configState.config.production!.session.engines = ['codex'];
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects disabled config with individually valid inputs', () => {
    const { job, configState } = fixtures();
    configState.config.enabled = false;
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects missing production with individually valid inputs', () => {
    const { job, configState } = fixtures();
    delete configState.config.production;
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects ready state with individually valid inputs', () => {
    const { job, configState } = fixtures();
    configState.state.status = 'ready';
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects pending state with individually valid inputs', () => {
    const { job, configState } = fixtures();
    configState.state.status = 'pending';
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects offline state with individually valid inputs', () => {
    const { job, configState } = fixtures();
    configState.state.status = 'offline';
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects revoked state with individually valid inputs', () => {
    const { job, configState } = fixtures();
    configState.state.status = 'revoked';
    expectValidPair(job, configState);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects an invalid job despite matching configuration', () => {
    const { job, configState } = fixtures();
    job.instruction = '';
    expect(DevProductionJobSchema.safeParse(job).success).toBe(false);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it('rejects an invalid config despite matching job', () => {
    const { job, configState } = fixtures();
    configState.config.boardId = '';
    expect(DevAgentConfigStateSchema.safeParse(configState).success).toBe(false);
    expect(isDevProductionJobForConfig(job, configState)).toBe(false);
  });
  it.each([null, undefined, {}, [], 'invalid'])('rejects malformed input %#', raw => {
    const { job, configState } = fixtures();
    expect(isDevProductionJobForConfig(raw, configState)).toBe(false);
    expect(isDevProductionJobForConfig(job, raw)).toBe(false);
  });
});
