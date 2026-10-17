import { describe, expect, it } from 'vitest';
import { AgentManagementCommandResultSchema, isAgentManagementCommandInProgress } from '../../src/agent/index.js';

const result = () => ({
  ok: true, agentId: 'synthetic-agent', requestId: 'synthetic-request-0001',
  action: 'apply-config', replayed: false, outcome: 'error',
  results: [{ target: { kind: 'runtime', targetId: 'synthetic-runtime' }, outcome: 'error', reason: { code: 'in-progress' } }],
  requestedVersion: 2, versions: { desired: 2, applied: 1, failed: null },
  completedAt: '2026-10-13T10:00:00Z',
});

describe('in-progress apply command outcome', () => {
  it('recognizes the existing X9 response shape, including a replay', () => {
    expect(AgentManagementCommandResultSchema.parse(result())).toEqual(result());
    expect(isAgentManagementCommandInProgress(result())).toBe(true);
    expect(isAgentManagementCommandInProgress({ ...result(), replayed: true })).toBe(true);
    expect(isAgentManagementCommandInProgress({ ...result(), versions: { ...result().versions, applied: null } })).toBe(true);
  });
  it('allows successful targets beside at least one pending target', () => {
    const value = { ...result(), outcome: 'partial', results: [...result().results,
      { target: { kind: 'capability', targetId: 'synthetic-memory' }, outcome: 'ok' }] };
    expect(isAgentManagementCommandInProgress(value)).toBe(true);
  });
  it('accepts multiple unsuccessful targets only when every reason is in-progress', () => {
    const value = { ...result(), results: [...result().results,
      { target: { kind: 'capability', targetId: 'synthetic-memory' }, outcome: 'unmanageable', reason: { code: 'in-progress' } }] };
    expect(isAgentManagementCommandInProgress(value)).toBe(true);
    value.results[1]!.reason.code = 'timeout';
    expect(isAgentManagementCommandInProgress(value)).toBe(false);
  });
  it('does not require an error outcome if the valid per-target response is in-progress', () => {
    const value = { ...result(), outcome: 'unmanageable', results: result().results.map(entry => ({ ...entry, outcome: 'unmanageable' })) };
    expect(isAgentManagementCommandInProgress(value)).toBe(true);
  });
  it('does not classify a completed apply as in progress', () => {
    const value = { ...result(), outcome: 'ok', results: result().results.map(({ target }) => ({ target, outcome: 'ok' })),
      versions: { ...result().versions, applied: 2 } };
    expect(AgentManagementCommandResultSchema.safeParse(value).success).toBe(true);
    expect(isAgentManagementCommandInProgress(value)).toBe(false);
  });
  it('does not classify a lifecycle command as an apply job', () => {
    const { requestedVersion: _requested, versions: _versions, ...value } = result();
    const command = { ...value, action: 'reload' };
    expect(AgentManagementCommandResultSchema.safeParse(command).success).toBe(true);
    expect(isAgentManagementCommandInProgress(command)).toBe(false);
  });
  it('does not classify other unsuccessful reasons as in progress', () => {
    for (const code of ['timeout', 'validation-failed', 'unknown']) {
      expect(isAgentManagementCommandInProgress({ ...result(), results: result().results.map(entry => ({ ...entry, reason: { code } })) })).toBe(false);
    }
  });
  it('requires the applied version to differ from the requested one', () => {
    expect(isAgentManagementCommandInProgress({ ...result(), versions: { ...result().versions, applied: 2 } })).toBe(false);
  });
  it.each([null, {}, { ...result(), ok: false }, { ...result(), results: [] }, { ...result(), requestedVersion: undefined },
    { ...result(), versions: undefined }, { ...result(), completedAt: 'invalid' }, { ...result(), outcome: 'ok' }])('rejects invalid command responses %j', value => {
    expect(isAgentManagementCommandInProgress(value)).toBe(false);
  });
});
