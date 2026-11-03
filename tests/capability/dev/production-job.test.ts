import { describe, expect, it } from 'vitest';
import { DevProductionJobSchema as schema, DevProductionKindSchema, devProductionApprovalBindings as bindings, devProductionExecutionMode as mode } from '../../../src/capability/dev/production-job.js';
import { DevSignedCommandV2Schema } from '../../../src/capability/dev/signed-command.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const job = {
  version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
  session: { scope, sessionId: 'session-1', target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex', 'claude'] },
  productKind: 'code', instruction: 'Create the requested deliverable.', reportVersion: 1,
  reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
  limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
};
const expected = {
  jobId: 'job-1', projectId: 'project-1', sessionId: 'session-1', sessionKind: 'local',
  sessionTarget: 'device-1', engines: 'claude,codex', productKind: 'code',
  reportVersion: 1, reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
};

function rejects(run: () => unknown): boolean {
  try { run(); return false; } catch { return true; }
}

describe('dev production job', () => {
  it('accepts code on local without GitHub metadata', () => {
    expect(schema.safeParse({ ...job, productKind: 'code', session: { ...job.session, target: { kind: 'local', deviceId: 'device-1' } } }).success).toBe(true);
  });
  it('accepts code on cloud without GitHub metadata', () => {
    expect(schema.safeParse({ ...job, productKind: 'code', session: { ...job.session, target: { kind: 'cloud', connectionRef: 'cloud-1' } } }).success).toBe(true);
  });
  it('accepts automation on local without GitHub metadata', () => {
    expect(schema.safeParse({ ...job, productKind: 'automation', session: { ...job.session, target: { kind: 'local', deviceId: 'device-1' } } }).success).toBe(true);
  });
  it('accepts automation on cloud without GitHub metadata', () => {
    expect(schema.safeParse({ ...job, productKind: 'automation', session: { ...job.session, target: { kind: 'cloud', connectionRef: 'cloud-1' } } }).success).toBe(true);
  });
  it('accepts presentation on local without GitHub metadata', () => {
    expect(schema.safeParse({ ...job, productKind: 'presentation', session: { ...job.session, target: { kind: 'local', deviceId: 'device-1' } } }).success).toBe(true);
  });
  it('accepts presentation on cloud without GitHub metadata', () => {
    expect(schema.safeParse({ ...job, productKind: 'presentation', session: { ...job.session, target: { kind: 'cloud', connectionRef: 'cloud-1' } } }).success).toBe(true);
  });
  it('accepts design on local without GitHub metadata', () => {
    expect(schema.safeParse({ ...job, productKind: 'design', session: { ...job.session, target: { kind: 'local', deviceId: 'device-1' } } }).success).toBe(true);
  });
  it('accepts design on cloud without GitHub metadata', () => {
    expect(schema.safeParse({ ...job, productKind: 'design', session: { ...job.session, target: { kind: 'cloud', connectionRef: 'cloud-1' } } }).success).toBe(true);
  });
  it('rejects another version', () => {
    expect(schema.safeParse({ ...job, version: 2 }).success).toBe(false);
  });
  it('rejects empty jobId', () => {
    expect(schema.safeParse({ ...job, jobId: '' }).success).toBe(false);
  });
  it('rejects empty projectId', () => {
    expect(schema.safeParse({ ...job, projectId: '' }).success).toBe(false);
  });
  it('rejects malformed request id', () => {
    expect(schema.safeParse({ ...job, requestId: 'short' }).success).toBe(false);
  });
  it('rejects unknown product kind', () => {
    expect(schema.safeParse({ ...job, productKind: 'shell' }).success).toBe(false);
  });
  it('rejects empty instruction', () => {
    expect(schema.safeParse({ ...job, instruction: '' }).success).toBe(false);
  });
  it('rejects oversized instruction', () => {
    expect(schema.safeParse({ ...job, instruction: 'x'.repeat(16001) }).success).toBe(false);
  });
  it('accepts instruction at upper bound', () => {
    expect(schema.safeParse({ ...job, instruction: 'x'.repeat(16000) }).success).toBe(true);
  });
  it('rejects zero report version', () => {
    expect(schema.safeParse({ ...job, reportVersion: 0 }).success).toBe(false);
  });
  it('rejects fractional report version', () => {
    expect(schema.safeParse({ ...job, reportVersion: 1.5 }).success).toBe(false);
  });
  it('rejects uppercase digest', () => {
    expect(schema.safeParse({ ...job, reportDigest: 'A'.repeat(64) }).success).toBe(false);
  });
  it('rejects short digest', () => {
    expect(schema.safeParse({ ...job, reportDigest: 'a'.repeat(63) }).success).toBe(false);
  });
  it('rejects non hex digest', () => {
    expect(schema.safeParse({ ...job, reportDigest: 'g'.repeat(64) }).success).toBe(false);
  });
  it('rejects invalid configVersion', () => {
    expect(schema.safeParse({ ...job, configVersion: -1 }).success).toBe(false);
  });
  it('rejects fractional configVersion', () => {
    expect(schema.safeParse({ ...job, configVersion: 1.5 }).success).toBe(false);
  });
  it('rejects invalid keyVersion', () => {
    expect(schema.safeParse({ ...job, keyVersion: 0 }).success).toBe(false);
  });
  it('rejects fractional keyVersion', () => {
    expect(schema.safeParse({ ...job, keyVersion: 1.5 }).success).toBe(false);
  });
  it('rejects zero maxDurationSeconds', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxDurationSeconds: 0 } }).success).toBe(false);
  });
  it('rejects fractional maxDurationSeconds', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxDurationSeconds: 1.5 } }).success).toBe(false);
  });
  it('rejects infinite maxDurationSeconds', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxDurationSeconds: Infinity } }).success).toBe(false);
  });
  it('rejects negative maxDurationSeconds', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxDurationSeconds: -1 } }).success).toBe(false);
  });
  it('rejects NaN maxDurationSeconds', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxDurationSeconds: NaN } }).success).toBe(false);
  });
  it('rejects negative infinity maxDurationSeconds', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxDurationSeconds: -Infinity } }).success).toBe(false);
  });
  it('rejects zero maxAttempts', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxAttempts: 0 } }).success).toBe(false);
  });
  it('rejects fractional maxAttempts', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxAttempts: 1.5 } }).success).toBe(false);
  });
  it('rejects infinite maxAttempts', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxAttempts: Infinity } }).success).toBe(false);
  });
  it('rejects negative maxAttempts', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxAttempts: -1 } }).success).toBe(false);
  });
  it('rejects NaN maxAttempts', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxAttempts: NaN } }).success).toBe(false);
  });
  it('rejects negative infinity maxAttempts', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxAttempts: -Infinity } }).success).toBe(false);
  });
  it('rejects zero maxTasks', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxTasks: 0 } }).success).toBe(false);
  });
  it('rejects fractional maxTasks', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxTasks: 1.5 } }).success).toBe(false);
  });
  it('rejects infinite maxTasks', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxTasks: Infinity } }).success).toBe(false);
  });
  it('rejects negative maxTasks', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxTasks: -1 } }).success).toBe(false);
  });
  it('rejects NaN maxTasks', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxTasks: NaN } }).success).toBe(false);
  });
  it('rejects negative infinity maxTasks', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, maxTasks: -Infinity } }).success).toBe(false);
  });
  it('rejects crossed tenantId', () => {
    expect(schema.safeParse({ ...job, session: { ...job.session, scope: { ...scope, tenantId: 'foreign' } } }).success).toBe(false);
  });
  it('rejects crossed ownerId', () => {
    expect(schema.safeParse({ ...job, session: { ...job.session, scope: { ...scope, ownerId: 'foreign' } } }).success).toBe(false);
  });
  it('rejects crossed agentId', () => {
    expect(schema.safeParse({ ...job, session: { ...job.session, scope: { ...scope, agentId: 'foreign' } } }).success).toBe(false);
  });
  it('rejects model supplied extra', () => {
    expect(schema.safeParse({ ...job, extra: true }).success).toBe(false);
  });
  it('rejects model supplied command', () => {
    expect(schema.safeParse({ ...job, command: 'run' }).success).toBe(false);
  });
  it('rejects model supplied path', () => {
    expect(schema.safeParse({ ...job, path: '/tmp/work' }).success).toBe(false);
  });
  it('rejects model supplied argv', () => {
    expect(schema.safeParse({ ...job, argv: ['run'] }).success).toBe(false);
  });
  it('rejects model supplied shell', () => {
    expect(schema.safeParse({ ...job, shell: 'sh' }).success).toBe(false);
  });
  it('rejects model supplied root', () => {
    expect(schema.safeParse({ ...job, root: '/tmp' }).success).toBe(false);
  });
  it('rejects model supplied url', () => {
    expect(schema.safeParse({ ...job, url: 'https://example.com' }).success).toBe(false);
  });
  it('rejects extra limits', () => {
    expect(schema.safeParse({ ...job, limits: { ...job.limits, extra: true } }).success).toBe(false);
  });
  it('rejects extra session fields', () => {
    expect(schema.safeParse({ ...job, session: { ...job.session, command: 'run' } }).success).toBe(false);
  });
  it('binds exactly the eleven approval values', () => {
    expect(bindings(job)).toEqual(expected);
  });
  it('binds cloud target', () => {
    expect(bindings({ ...job, session: { ...job.session, target: { kind: 'cloud', connectionRef: 'cloud-1' } } })).toEqual({ ...expected, sessionKind: 'cloud', sessionTarget: 'cloud-1' });
  });
  it('sorts engines independently of input order', () => {
    expect(bindings(job).engines === bindings({ ...job, session: { ...job.session, engines: ['claude', 'codex'] } }).engines).toBe(true);
  });
  it('binds changes to jobId', () => {
    expect(bindings({ ...job, jobId: 'job-2' }).jobId !== bindings(job).jobId).toBe(true);
  });
  it('binds changes to projectId', () => {
    expect(bindings({ ...job, projectId: 'project-2' }).projectId !== bindings(job).projectId).toBe(true);
  });
  it('binds changes to sessionId', () => {
    expect(bindings({ ...job, session: { ...job.session, sessionId: 'session-2' } }).sessionId !== bindings(job).sessionId).toBe(true);
  });
  it('binds changes to sessionKind', () => {
    expect(bindings({ ...job, session: { ...job.session, target: { kind: 'cloud', connectionRef: 'device-1' } } }).sessionKind !== bindings(job).sessionKind).toBe(true);
  });
  it('binds changes to sessionTarget', () => {
    expect(bindings({ ...job, session: { ...job.session, target: { kind: 'local', deviceId: 'device-2' } } }).sessionTarget !== bindings(job).sessionTarget).toBe(true);
  });
  it('binds changes to engines', () => {
    expect(bindings({ ...job, session: { ...job.session, engines: ['claude'] } }).engines !== bindings(job).engines).toBe(true);
  });
  it('binds changes to productKind', () => {
    expect(bindings({ ...job, productKind: 'design' }).productKind !== bindings(job).productKind).toBe(true);
  });
  it('binds changes to reportVersion', () => {
    expect(bindings({ ...job, reportVersion: 2 }).reportVersion !== bindings(job).reportVersion).toBe(true);
  });
  it('binds changes to reportDigest', () => {
    expect(bindings({ ...job, reportDigest: 'b'.repeat(64) }).reportDigest !== bindings(job).reportDigest).toBe(true);
  });
  it('binds changes to configVersion', () => {
    expect(bindings({ ...job, configVersion: 1 }).configVersion !== bindings(job).configVersion).toBe(true);
  });
  it('binds changes to keyVersion', () => {
    expect(bindings({ ...job, keyVersion: 2 }).keyVersion !== bindings(job).keyVersion).toBe(true);
  });
  it('binds changed cloud reference', () => {
    expect(bindings({ ...job, session: { ...job.session, target: { kind: 'cloud', connectionRef: 'cloud-2' } } }).sessionTarget === 'cloud-2').toBe(true);
  });
  it('validates job before binding', () => {
    expect(rejects(() => bindings({ ...job, instruction: '' }))).toBe(true);
  });
  it('validates approval binding constraints', () => {
    expect(rejects(() => bindings({ ...job, jobId: 'x'.repeat(257) }))).toBe(true);
  });
  it('routes code to night', () => {
    expect(mode('code') === 'night').toBe(true);
  });
  it('routes automation to night', () => {
    expect(mode('automation') === 'night').toBe(true);
  });
  it('routes presentation to session', () => {
    expect(mode('presentation') === 'session').toBe(true);
  });
  it('routes design to session', () => {
    expect(mode('design') === 'session').toBe(true);
  });
  it('rejects invalid execution kind', () => {
    expect(rejects(() => mode('shell'))).toBe(true);
  });
  it('reuses signed v2 version schemas', () => {
    expect(schema.shape.configVersion).toBe(DevSignedCommandV2Schema.shape.configVersion);
    expect(schema.shape.keyVersion).toBe(DevSignedCommandV2Schema.shape.keyVersion);
  });
  it('lists exactly four product kinds', () => {
    expect(DevProductionKindSchema.options).toEqual(['code', 'automation', 'presentation', 'design']);
  });
});
