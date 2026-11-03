import { describe, expect, it } from 'vitest';
import {
  SimulationExpectationSchema,
  SimulationExpectationSetSchema,
} from '../../src/organization/index.js';

const sha = 'b'.repeat(64);
const valid = {
  schemaVersion: 1,
  scenarioRef: { scenarioId: 's1', version: 1, contentSha256: sha },
  scriptSha256: sha,
  expectations: [
    { expectationId: 'e1', kind: 'turn_outcome', actionSeq: 0, status: 'succeeded' },
    { expectationId: 'e2', kind: 'effects_total', count: 3 },
    { expectationId: 'e3', kind: 'no_effect_after_stop', stopSeq: 4 },
  ],
};

describe('SimulationExpectationSetSchema', () => {
  it('accepts a set with the three kinds', () => {
    expect(SimulationExpectationSetSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an unknown kind', () => {
    const bad = { ...valid, expectations: [{ expectationId: 'e1', kind: 'other' }] };
    expect(SimulationExpectationSetSchema.safeParse(bad).success).toBe(false);
  });

  // Mutation: removing `.strict()` from the entries must turn this red.
  it('rejects an extra field', () => {
    const entry = { expectationId: 'e2', kind: 'effects_total', count: 1, extra: true };
    expect(SimulationExpectationSchema.safeParse(entry).success).toBe(false);
    expect(SimulationExpectationSetSchema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
  });

  // Mutation: removing the duplicate `superRefine` must turn this red.
  it('rejects duplicate expectationId', () => {
    const dup = {
      ...valid,
      expectations: [
        { expectationId: 'e1', kind: 'effects_total', count: 1 },
        { expectationId: 'e1', kind: 'no_effect_after_stop', stopSeq: 2 },
      ],
    };
    expect(SimulationExpectationSetSchema.safeParse(dup).success).toBe(false);
  });

  it('rejects a non-hex scriptSha256', () => {
    expect(
      SimulationExpectationSetSchema.safeParse({ ...valid, scriptSha256: 'Z'.repeat(64) }).success,
    ).toBe(false);
  });

  it('rejects a status outside the outcome set', () => {
    const bad = {
      ...valid,
      expectations: [{ expectationId: 'e1', kind: 'turn_outcome', actionSeq: 0, status: 'ok' }],
    };
    expect(SimulationExpectationSetSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects empty expectations', () => {
    expect(SimulationExpectationSetSchema.safeParse({ ...valid, expectations: [] }).success).toBe(
      false,
    );
  });
});
