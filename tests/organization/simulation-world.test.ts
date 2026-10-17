import { describe, expect, it } from 'vitest';
import type { SimulationAction, SimulationScript } from '../../src/organization/index.js';
import {
  SimulationActionSchema,
  SimulationResultSchema,
  SimulationScriptSchema,
  SimulationWorldSchema,
  canonicalScriptHash,
  canonicalSha256,
  canonicalWorldHash,
} from '../../src/organization/index.js';

const sha = 'a'.repeat(64);
const world = {
  worldId: 'w1',
  schemaVersion: 1,
  scenarioRef: { scenarioId: 's1', version: 1, contentSha256: sha },
  tenantId: 't1',
  organizationId: 'org1',
  clock: { startAt: '2026-10-15T08:00:00.000Z' },
  initialState: {
    agents: [{ agentId: 'a1', role: 'ceo' }],
    jobs: [{ jobId: 'j1', agentId: 'a1', intervalSeconds: 60, destination: 'mail' }],
    caps: [{ unit: 'tokens', limit: 100 }],
  },
  allowedDestinations: ['mail'],
};
const turn = { type: 'turn', seq: 0, effectId: 'e0', agentId: 'a1', input: 'ciao' };

describe('SimulationWorld', () => {
  it('accepts a valid world', () => {
    expect(SimulationWorldSchema.safeParse(world).success).toBe(true);
  });
  it('rejects an extra field (strict)', () => {
    expect(SimulationWorldSchema.safeParse({ ...world, extra: 1 }).success).toBe(false);
    expect(
      SimulationWorldSchema.safeParse({
        ...world,
        initialState: { ...world.initialState, extra: 1 },
      }).success,
    ).toBe(false);
  });
  it('rejects a job destination outside the list', () => {
    const bad = {
      ...world,
      initialState: {
        ...world.initialState,
        jobs: [{ ...world.initialState.jobs[0], destination: 'sms' }],
      },
    };
    expect(SimulationWorldSchema.safeParse(bad).success).toBe(false);
  });
});

describe('SimulationAction / Script', () => {
  it('accepts every action type', () => {
    for (const a of [
      turn,
      { type: 'job_occurrence', seq: 1, effectId: 'e1', jobId: 'j1', occurrenceAt: '2026-10-15T08:01:00.000Z' },
      { type: 'stop', seq: 2, effectId: 'e2', runId: 'r1' },
      { type: 'advance_clock', seq: 3, effectId: 'e3', seconds: 60 },
      { type: 'inject_fault', seq: 4, effectId: 'e4', fault: 'timeout', target: 'j1' },
    ]) {
      expect(SimulationActionSchema.safeParse(a).success).toBe(true);
    }
  });
  it('rejects an unknown action type', () => {
    expect(SimulationActionSchema.safeParse({ ...turn, type: 'teleport' }).success).toBe(false);
  });
  it('rejects a duplicate seq', () => {
    const r = SimulationScriptSchema.safeParse({
      world,
      actions: [turn, { ...turn, effectId: 'e1' }],
    });
    expect(r.success).toBe(false);
  });
  it('rejects a turn destination outside the list', () => {
    const r = SimulationScriptSchema.safeParse({
      world,
      actions: [{ ...turn, destination: 'sms' }],
    });
    expect(r.success).toBe(false);
    expect(
      SimulationScriptSchema.safeParse({ world, actions: [{ ...turn, destination: 'mail' }] }).success,
    ).toBe(true);
  });
});

describe('SimulationResult', () => {
  const result = {
    worldId: 'w1',
    scenarioRef: world.scenarioRef,
    runs: [
      {
        runId: 'r1',
        attemptId: 'at1',
        outcome: {
          status: 'succeeded',
          runId: 'r1',
          attemptId: 'at1',
          evidence: [],
          consumption: [],
          recordedAt: '2026-10-15T08:02:00.000Z',
        },
      },
    ],
    receipts: [],
    coverage: { numerator: 1, denominator: 2, limits: ['no real provider'] },
    canonicalHash: sha,
  };
  it('accepts a valid result and rejects a bad hash or extra field', () => {
    expect(SimulationResultSchema.safeParse(result).success).toBe(true);
    expect(SimulationResultSchema.safeParse({ ...result, canonicalHash: 'XYZ' }).success).toBe(false);
    expect(SimulationResultSchema.safeParse({ ...result, extra: 1 }).success).toBe(false);
  });
});

describe('canonicalWorldHash', () => {
  const parsed = SimulationWorldSchema.parse(world);
  it('is stable with keys in a different order', () => {
    const reordered = Object.fromEntries(
      Object.entries(parsed).reverse(),
    ) as typeof parsed;
    expect(Object.keys(reordered)).not.toEqual(Object.keys(parsed));
    expect(canonicalWorldHash(reordered)).toBe(canonicalWorldHash(parsed));
    expect(canonicalWorldHash(parsed)).toMatch(/^[a-f0-9]{64}$/);
  });
  it('changes when a value changes', () => {
    const other = SimulationWorldSchema.parse({ ...world, tenantId: 't2' });
    expect(canonicalWorldHash(other)).not.toBe(canonicalWorldHash(parsed));
  });
});

describe('canonicalScriptHash', () => {
  const second = { type: 'advance_clock', seq: 1, effectId: 'e1', seconds: 60 };
  const script = SimulationScriptSchema.parse({ world, actions: [turn, second] });
  const base = canonicalScriptHash(script);

  it('matches canonicalSha256 for the world hash', () => {
    expect(canonicalWorldHash(script.world)).toBe(canonicalSha256(script.world));
  });
  it('is stable with action keys in a different order', () => {
    const first = script.actions[0] as SimulationAction;
    const reordered = Object.fromEntries(Object.entries(first).reverse()) as SimulationAction;
    expect(Object.keys(reordered)).not.toEqual(Object.keys(first));
    const other = { ...script, actions: [reordered, script.actions[1] as SimulationAction] };
    expect(canonicalScriptHash(other)).toBe(base);
  });
  // Mutazione: togliere `actions` dall'oggetto hashato fa rosso questo caso.
  it('changes when actions[0].input changes', () => {
    const first = { ...(script.actions[0] as SimulationAction), input: 'altro' };
    const other = { ...script, actions: [first, script.actions[1] as SimulationAction] };
    expect(canonicalScriptHash(other as SimulationScript)).not.toBe(base);
  });
  it('changes when two actions are swapped', () => {
    const other = { ...script, actions: [script.actions[1], script.actions[0]] as SimulationAction[] };
    expect(canonicalScriptHash(other)).not.toBe(base);
  });
  it('changes when world.scenarioRef.version changes', () => {
    const other = {
      ...script,
      world: { ...script.world, scenarioRef: { ...script.world.scenarioRef, version: 2 } },
    };
    expect(canonicalScriptHash(other)).not.toBe(base);
  });
});
