import { describe, expect, it } from 'vitest';
import {
  AgentConfigVersionStateSchema,
  AgentLifecycleActionSchema,
  AgentManagementActionSchema,
  AgentManagementCommandSchema,
  AgentManagementCommandResultSchema,
  AgentManagementStateSchema,
  AgentManagementTargetResultSchema,
  deriveAgentManagementOutcome,
  sameAgentCommand,
} from '../../src/agent/index.js';

const runtime = { kind: 'runtime', targetId: 'x9' } as const;
const telegram = { kind: 'channel', targetId: 'telegram' } as const;
const ok = (target: { kind: string; targetId: string }) => ({ target, outcome: 'ok' });
const failed = (target: { kind: string; targetId: string }) => ({ target, outcome: 'error', reason: { code: 'load-failed', detail: 'context rejected' } });
const shared = (target: { kind: string; targetId: string }) => ({ target, outcome: 'unmanageable', reason: { code: 'shared-runtime' } });
const base = { ok: true, agentId: 'x9-staging', requestId: 'req-00000001', replayed: false, completedAt: '2026-10-07T01:00:00Z' };

describe('R1b actions and request identity', () => {
  it('separates logical lifecycle from apply-config', () => {
    expect(AgentLifecycleActionSchema.options).toEqual(['start', 'stop', 'restart', 'reload']);
    expect(AgentManagementActionSchema.options).toEqual(['start', 'stop', 'restart', 'reload', 'apply-config']);
  });

  it.each(['start', 'stop', 'restart', 'reload'])('accepts lifecycle %s with a request key', (action) => {
    expect(AgentManagementCommandSchema.safeParse({ action, requestId: 'req-00000001' }).success).toBe(true);
  });

  it.each([
    ['missing request key', { action: 'stop' }],
    ['short request key', { action: 'stop', requestId: 'abc' }],
    ['request key with spaces', { action: 'stop', requestId: 'req 0000001' }],
    ['unknown action', { action: 'kill', requestId: 'req-00000001' }],
    ['apply without version', { action: 'apply-config', requestId: 'req-00000001' }],
    ['apply with zero version', { action: 'apply-config', requestId: 'req-00000001', desiredVersion: 0 }],
    ['lifecycle with version', { action: 'stop', requestId: 'req-00000001', desiredVersion: 2 }],
    ['empty target list', { action: 'stop', requestId: 'req-00000001', targets: [] }],
    ['duplicate targets', { action: 'stop', requestId: 'req-00000001', targets: [telegram, telegram] }],
    ['extra field', { action: 'stop', requestId: 'req-00000001', compose: 'down' }],
  ])('rejects %s', (_label, input) => {
    expect(AgentManagementCommandSchema.safeParse(input).success).toBe(false);
  });

  it('treats the same key and same command as a replay, regardless of target order', () => {
    const a = AgentManagementCommandSchema.parse({ action: 'restart', requestId: 'req-00000001', targets: [runtime, telegram] });
    const b = AgentManagementCommandSchema.parse({ action: 'restart', requestId: 'req-00000001', targets: [telegram, runtime] });
    expect(sameAgentCommand(a, b)).toBe(true);
  });

  it.each([
    [{ action: 'restart', requestId: 'req-00000001' }, { action: 'stop', requestId: 'req-00000001' }],
    [{ action: 'stop', requestId: 'req-00000001' }, { action: 'stop', requestId: 'req-00000001', targets: [telegram] }],
    [{ action: 'apply-config', requestId: 'req-00000001', desiredVersion: 3 }, { action: 'apply-config', requestId: 'req-00000001', desiredVersion: 4 }],
  ])('flags a different command under the same key', (left, right) => {
    expect(sameAgentCommand(AgentManagementCommandSchema.parse(left), AgentManagementCommandSchema.parse(right))).toBe(false);
  });
});

describe('R1b versions', () => {
  it('accepts desired ahead of applied and a failure between them', () => {
    expect(AgentConfigVersionStateSchema.safeParse({ desired: 4, applied: 2, failed: { version: 3, reason: { code: 'validation-failed' } } }).success).toBe(true);
    expect(AgentConfigVersionStateSchema.safeParse({ desired: 1, applied: null, failed: null }).success).toBe(true);
  });

  it.each([
    ['applied ahead of desired', { desired: 2, applied: 3, failed: null }],
    ['failure not newer than applied', { desired: 3, applied: 3, failed: { version: 3, reason: { code: 'load-failed' } } }],
    ['failure beyond desired', { desired: 3, applied: 1, failed: { version: 4, reason: { code: 'load-failed' } } }],
  ])('rejects %s', (_label, input) => {
    expect(AgentConfigVersionStateSchema.safeParse(input).success).toBe(false);
  });
});

describe('R1b per-target results and derived outcome', () => {
  it('requires a reason exactly when a target is not ok', () => {
    expect(AgentManagementTargetResultSchema.safeParse(ok(runtime)).success).toBe(true);
    expect(AgentManagementTargetResultSchema.safeParse({ target: runtime, outcome: 'error' }).success).toBe(false);
    expect(AgentManagementTargetResultSchema.safeParse({ target: runtime, outcome: 'unmanageable' }).success).toBe(false);
    expect(AgentManagementTargetResultSchema.safeParse({ ...ok(runtime), reason: { code: 'unknown' } }).success).toBe(false);
  });

  it.each([
    [[ok(runtime), ok(telegram)], 'ok'],
    [[ok(runtime), failed(telegram)], 'partial'],
    [[ok(runtime), shared(telegram)], 'partial'],
    [[failed(runtime), shared(telegram)], 'error'],
    [[shared(runtime)], 'unmanageable'],
  ])('derives the overall outcome', (results, expected) => {
    expect(deriveAgentManagementOutcome(results.map((r) => AgentManagementTargetResultSchema.parse(r)))).toBe(expected);
  });

  it('accepts a lifecycle result whose outcome matches its targets', () => {
    expect(AgentManagementCommandResultSchema.safeParse({ ...base, action: 'stop', outcome: 'partial', results: [ok(runtime), shared(telegram)] }).success).toBe(true);
  });

  it('never reports a global success over a failed target', () => {
    expect(AgentManagementCommandResultSchema.safeParse({ ...base, action: 'stop', outcome: 'ok', results: [ok(runtime), failed(telegram)] }).success).toBe(false);
  });

  it('rejects duplicate target results and an empty result list', () => {
    expect(AgentManagementCommandResultSchema.safeParse({ ...base, action: 'stop', outcome: 'ok', results: [ok(runtime), ok(runtime)] }).success).toBe(false);
    expect(AgentManagementCommandResultSchema.safeParse({ ...base, action: 'stop', outcome: 'ok', results: [] }).success).toBe(false);
  });

  it('applies config only when every target converged', () => {
    const applied = { ...base, action: 'apply-config', requestedVersion: 4, outcome: 'ok', results: [ok(runtime)], versions: { desired: 4, applied: 4, failed: null } };
    expect(AgentManagementCommandResultSchema.safeParse(applied).success).toBe(true);
    const keptPrevious = { ...applied, outcome: 'error', results: [failed(runtime)], versions: { desired: 4, applied: 3, failed: { version: 4, reason: { code: 'load-failed' } } } };
    expect(AgentManagementCommandResultSchema.safeParse(keptPrevious).success).toBe(true);
  });

  it.each([
    ['success without applied version', { outcome: 'ok', results: [ok(runtime)], versions: { desired: 4, applied: 3, failed: null } }],
    ['failure claiming the requested version', { outcome: 'error', results: [failed(runtime)], versions: { desired: 4, applied: 4, failed: null } }],
    ['missing versions', { outcome: 'ok', results: [ok(runtime)], versions: undefined }],
  ])('rejects apply-config %s', (_label, patch) => {
    const input = { ...base, action: 'apply-config', requestedVersion: 4, ...patch };
    expect(AgentManagementCommandResultSchema.safeParse(input).success).toBe(false);
  });

  it('keeps versions out of lifecycle results', () => {
    const input = { ...base, action: 'restart', outcome: 'ok', results: [ok(runtime)], requestedVersion: 2, versions: { desired: 2, applied: 2, failed: null } };
    expect(AgentManagementCommandResultSchema.safeParse(input).success).toBe(false);
  });
});

describe('R1b management state per target', () => {
  const state = {
    agentId: 'x9-staging',
    identity: { managementAgentId: 'x9-staging', runtimeAgentId: 'x9' },
    versions: { desired: 2, applied: 2, failed: null },
    targets: [
      { target: runtime, actions: ['start', 'stop', 'restart', 'reload', 'apply-config'] },
      { target: { kind: 'channel', targetId: 'elevenlabs' }, actions: [], reason: { code: 'externally-owned' } },
    ],
  };

  it('describes what each target supports and why the others are not manageable', () => {
    expect(AgentManagementStateSchema.safeParse(state).success).toBe(true);
    expect(AgentManagementStateSchema.safeParse({ ...state, versions: null }).success).toBe(true);
  });

  it.each([
    ['unmanageable target without reason', [{ target: runtime, actions: [] }]],
    ['manageable target with reason', [{ target: runtime, actions: ['stop'], reason: { code: 'unknown' } }]],
    ['duplicate actions', [{ target: runtime, actions: ['stop', 'stop'] }]],
    ['duplicate targets', [{ target: runtime, actions: ['stop'] }, { target: runtime, actions: ['start'] }]],
  ])('rejects %s', (_label, targets) => {
    expect(AgentManagementStateSchema.safeParse({ ...state, targets }).success).toBe(false);
  });
});
