import { describe, expect, it } from 'vitest';
import * as agent from '../../src/agent/index.js';

const identity = { managementAgentId: 'forge-child', runtimeAgentId: 'runtime-child', vaultAgentId: 42 };
const command = () => ({ requestId: 'delete-0001', identity: { ...identity }, confirmedName: 'Synthetic child' });
const steps = ['tombstone', 'admission', 'channels', 'runtime', 'caches', 'context', 'workspace', 'private-state'];
const result = () => ({ ok: true, agentId: identity.managementAgentId, identity: { ...identity }, requestId: 'delete-0001', replayed: false, outcome: 'complete', tombstoned: true, results: steps.map(step => ({ step, outcome: 'completed' })), completedAt: '2026-10-08T18:00:00Z' });
const commandSchema = () => { expect(agent.AgentDeletionCommandSchema).toBeDefined(); return agent.AgentDeletionCommandSchema; };
const resultSchema = () => { expect(agent.AgentDeletionResultSchema).toBeDefined(); return agent.AgentDeletionResultSchema; };

// Each invalid case starts from a valid independent payload and tests one boundary.
describe('C5 permanent deletion command', () => {
  it('exports a valid strict command without normalizing the exact name', () => {
    const value = { ...command(), confirmedName: '  Synthetic child  ' };
    expect(commandSchema().parse(value)).toEqual(value);
  });
  it.each(['requestId', 'identity', 'confirmedName'])('requires %s', field => {
    const value: Record<string, unknown> = command(); delete value[field];
    expect(commandSchema().safeParse(value).success).toBe(false);
  });
  it.each(['short', 'request/invalid', 'x'.repeat(129)])('uses the canonical idempotency boundary: %s', requestId => {
    expect(commandSchema().safeParse({ ...command(), requestId }).success).toBe(false);
  });
  it.each(['', '   ', 'bad\nname', 'x'.repeat(201)])('rejects invalid confirmation names: %s', confirmedName => {
    expect(commandSchema().safeParse({ ...command(), confirmedName }).success).toBe(false);
  });
  it.each(['../other', 'Other', 'bad/name', 'x'.repeat(129)])('rejects unsafe management and runtime identities: %s', id => {
    for (const field of ['managementAgentId', 'runtimeAgentId']) {
      expect(commandSchema().safeParse({ ...command(), identity: { ...identity, [field]: id } }).success).toBe(false);
    }
  });
  it('rejects an impersonating extra body field', () => { expect(commandSchema().safeParse({ ...command(), ownerId: 'another-person' }).success).toBe(false); });
  it('rejects an extra identity path and invalid vault ID', () => {
    expect(commandSchema().safeParse({ ...command(), identity: { ...identity, path: '/shared' } }).success).toBe(false);
    expect(commandSchema().safeParse({ ...command(), identity: { ...identity, vaultAgentId: 0 } }).success).toBe(false);
  });
  it('retains optional canonical vault identity and permits legacy long IDs', () => {
    const { vaultAgentId: _vault, ...withoutVault } = identity;
    expect(commandSchema().safeParse({ ...command(), identity: { ...withoutVault, managementAgentId: 'char-char-1modellista-48q71n1m' } }).success).toBe(true);
  });
});

describe('C5 deletion piece durability', () => {
  it.each(['absent', 'blocked'])('rejects %s for a durable tombstone piece', outcome => {
    expect(agent.AgentDeletionPieceSchema).toBeDefined();
    expect(agent.AgentDeletionPieceSchema.safeParse({ step: 'tombstone', outcome, ...(outcome === 'blocked' ? { reason: 'dependency-failed' } : {}) }).success).toBe(false);
  });
});

describe('C5 permanent deletion report', () => {
  it('requires all eight pieces for a complete durable result', () => { expect(resultSchema().parse(result())).toEqual(result()); });
  it('accepts absent runtime resources only after a completed tombstone', () => {
    const value = result(); value.results = value.results.map(piece => piece.step === 'tombstone' ? piece : { ...piece, outcome: 'absent' });
    expect(resultSchema().safeParse(value).success).toBe(true);
  });
  it.each(steps)('rejects an omitted piece: %s', step => {
    const value = result(); value.results = value.results.filter(piece => piece.step !== step);
    expect(resultSchema().safeParse(value).success).toBe(false);
  });
  it('rejects duplicate pieces even when the length is eight', () => {
    const value = result(); value.results[7] = { step: 'context', outcome: 'completed' };
    expect(resultSchema().safeParse(value).success).toBe(false);
  });
  it('rejects an unexpected cleanup scope', () => {
    const value = result(); value.results[7] = { step: 'shared-container', outcome: 'completed' };
    expect(resultSchema().safeParse(value).success).toBe(false);
  });
  it('rejects a failed piece hidden by complete', () => {
    const value = result(); value.results[7] = { step: 'private-state', outcome: 'failed', reason: 'cleanup-failed' } as typeof value.results[number];
    expect(resultSchema().safeParse(value).success).toBe(false);
  });
  it('rejects partial when all pieces completed', () => { expect(resultSchema().safeParse({ ...result(), outcome: 'partial' }).success).toBe(false); });
  it('accepts a partial result with a sanitized failed piece', () => {
    const value = result(); value.outcome = 'partial'; value.results[7] = { step: 'private-state', outcome: 'failed', reason: 'cleanup-failed' } as typeof value.results[number];
    expect(resultSchema().safeParse(value).success).toBe(true);
  });
  it('rejects false success and non-boolean flags', () => {
    expect(resultSchema().safeParse({ ...result(), ok: false }).success).toBe(false);
    expect(resultSchema().safeParse({ ...result(), replayed: 'false' }).success).toBe(false);
    expect(resultSchema().safeParse({ ...result(), tombstoned: 'true' }).success).toBe(false);
  });
  it.each(['yesterday', '2026-10-08', '2026-10-08T25:00:00Z'])('rejects invalid report timestamps: %s', completedAt => {
    expect(resultSchema().safeParse({ ...result(), completedAt }).success).toBe(false);
  });
  it('rejects raw detail in a piece and a forged blocked reason', () => {
    const value = result(); value.outcome = 'partial'; value.results[7] = { step: 'private-state', outcome: 'failed', reason: 'cleanup-failed', detail: '/shared/path' } as typeof value.results[number];
    expect(resultSchema().safeParse(value).success).toBe(false);
    value.results[1] = { step: 'admission', outcome: 'failed', reason: 'drain-failed' } as typeof value.results[number];
    value.results = value.results.map((piece, index) => index <= 1 ? piece : { step: piece.step, outcome: 'blocked', reason: 'cleanup-failed' });
    expect(resultSchema().safeParse(value).success).toBe(false);
  });
  it('requires the exact management identity in the report', () => {
    expect(resultSchema().safeParse({ ...result(), agentId: identity.runtimeAgentId }).success).toBe(false);
  });
  it.each(['ok', 'replayed', 'tombstoned', 'completedAt', 'identity', 'requestId'])('requires report field %s', field => {
    const value: Record<string, unknown> = result(); delete value[field]; expect(resultSchema().safeParse(value).success).toBe(false);
  });
  it('rejects success and absent outcomes carrying error data', () => {
    for (const outcome of ['completed', 'absent']) {
      const value = result(); value.results[7] = { step: 'private-state', outcome, reason: 'cleanup-failed' } as typeof value.results[number];
      expect(resultSchema().safeParse(value).success).toBe(false);
    }
  });
  it('rejects unsanitized provider errors and unknown report data', () => {
    const value = result(); value.outcome = 'partial'; value.results[7] = { step: 'private-state', outcome: 'failed', reason: 'raw provider token' } as typeof value.results[number];
    expect(resultSchema().safeParse(value).success).toBe(false);
    expect(resultSchema().safeParse({ ...result(), path: '/shared' }).success).toBe(false);
  });
  it('requires reasons for failed and blocked pieces', () => {
    for (const outcome of ['failed', 'blocked']) {
      const value = result(); value.outcome = 'partial'; value.results[7] = { step: 'private-state', outcome };
      expect(resultSchema().safeParse(value).success).toBe(false);
    }
  });
  it('does not permit an absent tombstone to claim durable removal', () => {
    const value = result(); value.results[0] = { step: 'tombstone', outcome: 'absent' };
    expect(resultSchema().safeParse(value).success).toBe(false);
  });
  it('rejects an absent tombstone in its own completed report', () => {
    const value = result(); value.tombstoned = false; value.results[0] = { step: 'tombstone', outcome: 'absent' };
    expect(resultSchema().safeParse(value).success).toBe(false);
  });
  it('binds the tombstoned flag to the persisted piece', () => { expect(resultSchema().safeParse({ ...result(), tombstoned: false }).success).toBe(false); });
  it('accepts a failed tombstone only when all effects are blocked', () => {
    const value = result(); value.outcome = 'partial'; value.tombstoned = false;
    value.results = steps.map(step => ({ step, outcome: step === 'tombstone' ? 'failed' : 'blocked', reason: step === 'tombstone' ? 'storage-failed' : 'dependency-failed' }));
    expect(resultSchema().safeParse(value).success).toBe(true);
    value.results[1] = { step: 'admission', outcome: 'completed' };
    expect(resultSchema().safeParse(value).success).toBe(false);
  });
  it('blocks every later effect when admission did not drain', () => {
    const value = result(); value.outcome = 'partial'; value.results[1] = { step: 'admission', outcome: 'failed', reason: 'drain-failed' } as typeof value.results[number];
    expect(resultSchema().safeParse(value).success).toBe(false);
    value.results = value.results.map((piece, index) => index <= 1 ? piece : { step: piece.step, outcome: 'blocked', reason: 'dependency-failed' });
    expect(resultSchema().safeParse(value).success).toBe(true);
  });
  it.each(['channels', 'runtime'])('blocks caches and durable removals after %s failure', step => {
    const value = result(); value.outcome = 'partial'; value.results = value.results.map(piece => piece.step === step ? { ...piece, outcome: 'failed', reason: 'cleanup-failed' } : piece);
    expect(resultSchema().safeParse(value).success).toBe(false);
    value.results = value.results.map(piece => ['caches', 'context', 'workspace', 'private-state'].includes(piece.step) ? { step: piece.step, outcome: 'blocked', reason: 'dependency-failed' } : piece);
    expect(resultSchema().safeParse(value).success).toBe(true);
  });
  it('rejects blocked pieces with no failed dependency', () => {
    const value = result(); value.outcome = 'partial'; value.results[7] = { step: 'private-state', outcome: 'blocked', reason: 'dependency-failed' } as typeof value.results[number];
    expect(resultSchema().safeParse(value).success).toBe(false);
  });
});

describe('C5 request/report correlation', () => {
  const current = (agentId: string, request: unknown, response: unknown) => { expect(agent.isAgentDeletionResultCurrent).toBeTypeOf('function'); return agent.isAgentDeletionResultCurrent(agentId, request, response); };
  it('accepts a parsed complete or replayed result for the same intention', () => {
    expect(current(identity.managementAgentId, command(), result())).toBe(true);
    expect(current(identity.managementAgentId, command(), { ...result(), replayed: true })).toBe(true);
  });
  it.each(['agentId', 'requestId', 'managementAgentId', 'runtimeAgentId', 'vaultAgentId'])('rejects a mismatched %s', field => {
    const value = result();
    if (field === 'agentId' || field === 'requestId') Object.assign(value, { [field]: 'another-agent' });
    else Object.assign(value.identity, { [field]: field === 'vaultAgentId' ? 43 : 'another-agent' });
    expect(current(identity.managementAgentId, command(), value)).toBe(false);
  });
  it('rejects an internally coherent report from another management agent', () => {
    const value = result(); value.agentId = 'another-agent'; value.identity.managementAgentId = 'another-agent';
    expect(resultSchema().safeParse(value).success).toBe(true);
    expect(current(identity.managementAgentId, command(), value)).toBe(false);
  });
  it('rejects a valid report coherently bound to the wrong requested namespace', () => {
    const value = result(); value.agentId = identity.runtimeAgentId; value.identity.managementAgentId = identity.runtimeAgentId;
    expect(resultSchema().safeParse(value).success).toBe(true);
    expect(current(identity.runtimeAgentId, command(), value)).toBe(false);
  });
  it('rejects the runtime address and an unsafe addressed ID', () => {
    expect(current(identity.runtimeAgentId, command(), result())).toBe(false);
    expect(current('../other', command(), result())).toBe(false);
  });
  it('rejects invalid commands and malformed reports before comparing identities', () => {
    expect(current(identity.managementAgentId, {}, result())).toBe(false);
    expect(current(identity.managementAgentId, command(), { ...result(), results: [] })).toBe(false);
  });
});
