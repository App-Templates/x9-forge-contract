import { expect, it } from 'vitest';
import * as api from '../../../src/http/index.js';
import * as coach from '../../../src/capability/index.js';
import { metadata, opening } from '../../capability/coach-operational-fixtures.js';
const contracts = [api.coachProgramApplyContract, api.coachOpeningContract, api.coachConversationInputContract, api.coachExecutionStartContract, api.coachExecutionEventContract, api.coachGuideEndContract, api.coachSessionCloseContract, api.coachUsageObserveContract];
it('publishes eight distinct trusted write routes using the canonical schemas', () => {
  expect(contracts).toHaveLength(8); expect(new Set(contracts.map(c => c.path)).size).toBe(8);
  for (const contract of contracts) { expect(contract.authType).toBe('secret'); expect(contract.path).toContain('/coach/v2/'); expect(contract.errorSchema).toBe(api.CoachOperationalErrorSchema); }
  expect(api.coachProgramApplyContract.method).toBe('PUT'); expect(api.coachExecutionStartContract.bodySchema).toBe(coach.CoachExecutionStartRequestSchema);
  expect(api.coachUsageObserveContract.responseSchema).toBe(coach.CoachUsageObserveResultSchema);
  expect(api.coachProgramPutContract.path).toBe('/internal/capability/agents/:agentId/coach/programs/:programId');
});
it('binds program/session routes and encodes session identifiers', () => {
  const params = { agentId: opening.scope.agentId, sessionId: opening.sessionId };
  expect(api.isCoachOpeningForSessionRoute(opening, params)).toBe(true);
  expect(api.isCoachOpeningForSessionRoute(opening, { ...params, sessionId: 'foreign-session' })).toBe(false);
  expect(api.isCoachOpeningForSessionRoute(opening, { ...params, agentId: 'foreign' })).toBe(false);
  expect(api.capCoachSessionInputPath(params.agentId, 'session/a')).toContain('session%2Fa/inputs');
  expect(api.isCoachProgramForRevisionRoute(opening.program, { agentId: params.agentId, programId: opening.program.programId, programVersion: '1' })).toBe(true);
  expect(api.CoachOperationalProgramParamsSchema.safeParse({ agentId: params.agentId, programId: opening.program.programId, programVersion: '1suffix' }).success).toBe(false);
  expect(api.coachExecutionStartContract.bodySchema.safeParse({ ...metadata, elapsedSeconds: 1 }).success).toBe(false);
});
it('exposes exact bounded error status and conditional revision readback', () => {
  expect(api.COACH_OPERATIONAL_ERROR_STATUS.budget_unavailable).toBe(503); expect(api.COACH_OPERATIONAL_ERROR_STATUS.budget_exhausted).toBe(429);
  expect(api.CoachOperationalErrorSchema.safeParse({ ok: false, error: 'stale_revision', currentRevision: 0 }).success).toBe(true);
  expect(api.CoachOperationalErrorSchema.safeParse({ ok: false, error: 'stale_revision' }).success).toBe(false);
  expect(api.CoachOperationalErrorSchema.safeParse({ ok: false, error: 'not_found', currentRevision: 1 }).success).toBe(false);
  expect(api.CoachOperationalErrorSchema.safeParse({ ok: false, error: 'not_found', message: 'internal' }).success).toBe(false);
});
