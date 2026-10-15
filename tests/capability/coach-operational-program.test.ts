import { expect, it } from 'vitest';
import { CoachProgramApplyRequestSchema as Request, CoachProgramApplyResultSchema as Result, isCoachProgramApplyResultForRequest as correlates, CoachOperationalCommandMetadataSchema as Metadata } from '../../src/capability/index.js';
import { programRequest as r, metadata } from './coach-operational-fixtures.js';
it.each(['meditation', 'breathwork', 'trainer'])('applies immutable %s revision', kind => {
  const program = { ...r.program, programId: kind, strategy: { strategyId: kind, strategyVersion: '1' } }, definition = { ...r.definition, programId: kind };
  const request = { ...r, program, definition }, result = { ok: true, requestId: r.requestId, replayed: true, program, definition };
  expect(Request.safeParse(request).success).toBe(true); expect(Result.safeParse(result).success).toBe(true); expect(correlates(result, request)).toBe(true);
  expect(correlates({ ...result, requestId: 'foreign' }, request)).toBe(false);
});
it('rejects foreign definitions, permissive versions and missing transition metadata', () => {
  expect(Request.safeParse({ ...r, definition: { ...r.definition, version: 2 } }).success).toBe(false);
  expect(Request.safeParse({ ...r, expectedProgramVersion: -1 }).success).toBe(false);
  expect(Request.safeParse({ ...r, program: { ...r.program, configVersion: 1 } }).success).toBe(false);
  expect(Metadata.safeParse(metadata).success).toBe(true); expect(Metadata.safeParse({ ...metadata, expectedRevision: -1 }).success).toBe(false);
  expect(Metadata.safeParse({ ...metadata, opening: undefined }).success).toBe(false);
});
