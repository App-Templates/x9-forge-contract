import { describe, expect, it } from 'vitest';
import {
  EvaluationVerdictSchema,
  SimulationBoundarySchema,
  SimulationEvaluationItemSchema,
  SimulationEvaluationSchema,
  summarizeEvaluationItems,
  type SimulationEvaluation,
  type SimulationEvaluationItem,
} from '../../src/organization/index.js';

const items: SimulationEvaluationItem[] = [
  { expectationId: 'e1', verdict: 'met' },
  { expectationId: 'e2', verdict: 'met' },
  { expectationId: 'e3', verdict: 'not_met', observed: 'Two effects instead of three' },
  { expectationId: 'e4', verdict: 'not_observable', reason: 'Recall is replaced' },
];
const valid: SimulationEvaluation = {
  schemaVersion: 1,
  worldId: 'world-1',
  scenarioRef: { scenarioId: 'scenario-1', version: 1, contentSha256: 'a'.repeat(64) },
  scriptSha256: 'b'.repeat(64),
  items,
  totals: { met: 2, notMet: 1, notObservable: 1, applicable: 3 },
  boundaries: [
    { name: 'clock', kind: 'real', note: 'Uses the runtime clock' },
    { name: 'recall', kind: 'replaced', note: 'Returns an empty result' },
    { name: 'provider', kind: 'simulated_fault', note: 'Timeout injected' },
  ],
  limits: ['Recall quality cannot be evaluated'],
};

describe('simulation evaluation', () => {
  it('accepts a valid evaluation', () => {
    expect(SimulationEvaluationSchema.parse(valid)).toEqual(valid);
  });

  it('rejects not_met without observed', () => {
    expect(SimulationEvaluationItemSchema.safeParse({
      expectationId: 'e1', verdict: 'not_met',
    }).success).toBe(false);
  });

  it('rejects not_observable without reason', () => {
    expect(SimulationEvaluationItemSchema.safeParse({
      expectationId: 'e1', verdict: 'not_observable',
    }).success).toBe(false);
  });

  it.each(['met', 'notMet', 'notObservable'] as const)('rejects inconsistent %s totals', (key) => {
    expect(SimulationEvaluationSchema.safeParse({
      ...valid, totals: { ...valid.totals, [key]: valid.totals[key] + 1 },
    }).success).toBe(false);
  });

  // Mutation: including notObservable in applicable must make this totals case fail.
  it('rejects applicable including an unobservable expectation', () => {
    expect(SimulationEvaluationSchema.safeParse({
      ...valid, totals: { ...valid.totals, applicable: 4 },
    }).success).toBe(false);
  });

  it('summarizes two met, one not_met and one not_observable', () => {
    expect(summarizeEvaluationItems(items)).toEqual({
      met: 2, notMet: 1, notObservable: 1, applicable: 3,
    });
  });

  it('keeps empty evaluations at zero over zero', () => {
    const totals = { met: 0, notMet: 0, notObservable: 0, applicable: 0 };
    expect(summarizeEvaluationItems([])).toEqual(totals);
    expect(SimulationEvaluationSchema.parse({ ...valid, items: [], totals }).totals).toEqual(totals);
  });

  it('rejects extra fields at every new object boundary', () => {
    expect(SimulationEvaluationSchema.safeParse({ ...valid, extra: true }).success).toBe(false);
    expect(SimulationEvaluationSchema.safeParse({
      ...valid, totals: { ...valid.totals, extra: true },
    }).success).toBe(false);
    expect(SimulationEvaluationItemSchema.safeParse({ ...items[0], extra: true }).success).toBe(false);
    expect(SimulationBoundarySchema.safeParse({ ...valid.boundaries[0], extra: true }).success).toBe(false);
  });

  it('rejects unknown verdicts and boundary kinds', () => {
    expect(EvaluationVerdictSchema.safeParse('unknown').success).toBe(false);
    expect(SimulationBoundarySchema.safeParse({
      name: 'recall', kind: 'unknown', note: 'Unavailable',
    }).success).toBe(false);
  });

  it.each(['expectationId', 'observed', 'reason'])('rejects empty item %s', (key) => {
    expect(SimulationEvaluationItemSchema.safeParse({
      expectationId: 'e1', verdict: 'met', [key]: '',
    }).success).toBe(false);
  });

  it.each(['name', 'note'])('rejects empty boundary %s', (key) => {
    expect(SimulationBoundarySchema.safeParse({
      name: 'recall', kind: 'replaced', note: 'Empty recall', [key]: '',
    }).success).toBe(false);
  });

  it.each([
    { schemaVersion: 2 }, { worldId: '' }, { scriptSha256: 'B'.repeat(64) },
    { scriptSha256: 'a'.repeat(63) }, { limits: [''] },
    { scenarioRef: { ...valid.scenarioRef, version: 0 } },
  ])('rejects invalid evaluation fields %j', (patch) => {
    expect(SimulationEvaluationSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  it.each(['met', 'notMet', 'notObservable', 'applicable'] as const)(
    'rejects negative and fractional %s totals', (key) => {
      for (const value of [-1, 0.5]) {
        expect(SimulationEvaluationSchema.safeParse({
          ...valid, totals: { ...valid.totals, [key]: value },
        }).success).toBe(false);
      }
    },
  );

  it('accepts 200 items and rejects 201 items with matching totals', () => {
    for (const count of [200, 201]) {
      const entries = Array.from({ length: count }, (_, index): SimulationEvaluationItem => ({
        expectationId: `e${index}`, verdict: 'met',
      }));
      expect(SimulationEvaluationSchema.safeParse({
        ...valid, items: entries,
        totals: { met: count, notMet: 0, notObservable: 0, applicable: count },
      }).success).toBe(count === 200);
    }
  });
});
