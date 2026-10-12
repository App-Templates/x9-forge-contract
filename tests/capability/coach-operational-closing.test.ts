import { expect, it } from 'vitest';
import { CoachGuideEndRequestSchema as EndRequest, CoachGuideEndResultSchema as End, CoachSessionCloseRequestSchema as Request, CoachSessionCloseResultSchema as Close } from '../../src/capability/index.js';
import { metadata, response, accounting, projection } from './coach-operational-fixtures.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
it('keeps guide end and session close as separate server decisions', () => {
  expect(EndRequest.safeParse(metadata).success).toBe(true);
  expect(End.safeParse({ ...response, done: false, remainingSeconds: 1, practice: null }).success).toBe(true);
  expect(End.safeParse({ ...response, done: true, remainingSeconds: 0, practice: f.CoachPracticeObservation }).success).toBe(true);
  expect(End.safeParse({ ...response, done: true, remainingSeconds: 1, practice: null }).success).toBe(false);
  expect(End.safeParse({ ...response, done: true, remainingSeconds: 1, practice: f.CoachPracticeObservation }).success).toBe(false);
  expect(Request.safeParse({ ...metadata, conclusion: null, finalStatus: 'completed' }).success).toBe(false);
  expect(Close.safeParse({ ...response, accounting, projection, measures: [] }).success).toBe(true);
  expect(Close.safeParse({ ...response, accounting: f.CoachSessionAccounting, projection: null, measures: [] }).success).toBe(true);
});
it('does not allow foreign accounting, measures or strategy', () => {
  const value = { ...response, accounting, projection, measures: [] };
  expect(Close.safeParse({ ...value, accounting: { ...accounting, openingId: 'foreign' } }).success).toBe(false);
  expect(Close.safeParse({ ...value, accounting: { ...accounting, strategy: { strategyId: 'foreign', strategyVersion: '1' } } }).success).toBe(false);
  expect(Close.safeParse({ ...value, measures: [f.CoachMeasureObservation] }).success).toBe(false);
});
