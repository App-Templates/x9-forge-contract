import { expect, it } from 'vitest';
import { CoachMeasureDefinitionSchema as Definition, CoachMeasureObservationSchema as Observation, isCoachMeasureForDefinition as matches } from '../../src/capability/index.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
const d = f.CoachMeasureDefinition, o = f.CoachMeasureObservation;
it.each([['skill', 'score', 100], ['breathwork', 'seconds', 600], ['trainer', 'repetitions', 30]])('uses declared %s units', (measureId, unit, max) => {
  const definition = { ...d, measureId, unit, max };
  const observation = { ...o, measureId, unit };
  expect(matches(observation, definition)).toBe(true);
});
it('keeps zero known, confidence null and unknown separate', () => {
  expect(Observation.parse(o).value).toEqual({ kind: 'known', value: 0, confidence: null });
  expect(matches({ ...o, value: { kind: 'unknown', reason: 'not-observed' } }, d)).toBe(true);
  expect(Observation.safeParse({ ...o, value: { kind: 'unknown', reason: 'missing', value: 0 } }).success).toBe(false);
  expect(Observation.safeParse({ ...o, value: { kind: 'known', value: 0, confidence: 2 } }).success).toBe(false);
  expect(Definition.safeParse({ ...d, min: 101 }).success).toBe(false);
});
it.each([{ unit: 'foreign' }, { definitionVersion: 'foreign' }, { measureId: 'foreign' }, { value: { kind: 'known', value: 101, confidence: null } }])('rejects mismatched evidence %j', change => expect(matches({ ...o, ...change }, d)).toBe(false));
