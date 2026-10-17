import { expect, it } from 'vitest';
import * as api from '../../../src/http/endpoints/coach-person-program-read.js';
import { CoachPersonSnapshotSchema } from '../../../src/capability/coach/index.js';
import { opening, state, budget, projection } from '../../capability/coach-operational-fixtures.js';

const request = { requestId: 'synthetic-person-read', scope: opening.scope, program: opening.program, after: null, limit: 1 };
const result = { ok: true, request, observedAt: opening.openedAt,
  personState: { partition: 'person_strategy', scope: opening.scope, strategy: opening.program.strategy, projection },
  budget, sessions: [state], nextCursor: 'synthetic-next-cursor' };

it('reads operational history without an opening request or any legacy snapshot fallback', () => {
  expect(api.CoachPersonProgramReadRequestSchema.safeParse(request).success).toBe(true);
  expect(api.isCoachPersonProgramReadForRequest(result, request)).toBe(true);
  expect(api.coachPersonProgramReadContract.authType).toBe('secret');
  expect(api.coachPersonProgramReadContract.method).toBe('POST');
  expect(api.capCoachPersonProgramReadPath(opening.scope.agentId)).toBe(`/internal/capability/agents/${opening.scope.agentId}/coach/v2/persons/programs/read`);
  expect(CoachPersonSnapshotSchema.safeParse(result).success).toBe(false);
  expect(api.isCoachPersonProgramReadForRoute(request, { agentId: opening.scope.agentId })).toBe(true);
  expect(api.isCoachPersonProgramReadForRoute(request, { agentId: 'foreign-agent' })).toBe(false);
});

it.each(['requestId', 'after', 'limit', 'program'] as const)('binds response to requested %s', field => {
  const changes = { requestId: 'foreign-request', after: 'synthetic-old-cursor', limit: 2, program: { ...opening.program, catalogRevision: 'catalog-2' } };
  expect(api.isCoachPersonProgramReadForRequest(result, { ...request, [field]: changes[field] })).toBe(false);
});

it.each(['userId', 'ownerId', 'tenantId', 'agentId'] as const)('fences state, budget and sessions to the whole person at %s', field => {
  const other = { ...opening.scope, [field]: field === 'tenantId' || field === 'ownerId' ? '30000000-0000-4000-8000-000000000003' : 'foreign-person' };
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...result, personState: { ...result.personState, scope: other } }).success).toBe(false);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...result, budget: { ...budget, budget: { ...budget.budget, scope: other }, quota: { ...budget.quota, scope: other } } }).success).toBe(false);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...result, sessions: [{ ...state, opening: { ...opening, scope: other } }] }).success).toBe(false);
});

it.each(['programId', 'programVersion', 'strategy', 'catalogRevision', 'policyRevision', 'progressionRevision', 'measureDefinitionRevision'] as const)('filters history by full program pin including %s', field => {
  const changes = { programId: 'another-program', programVersion: 2, strategy: { ...opening.program.strategy, strategyVersion: '2' }, catalogRevision: '2', policyRevision: '2', progressionRevision: '2', measureDefinitionRevision: '2' };
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...result, sessions: [{ ...state, opening: { ...opening, program: { ...opening.program, [field]: changes[field] } } }] }).success).toBe(false);
});

it('keeps person state shared by strategy while history stays on one program', () => {
  const program = { ...opening.program, programId: 'another-program' }, r = { ...request, program };
  const s = { ...result, request: r, sessions: [], nextCursor: null };
  expect(api.isCoachPersonProgramReadForRequest(s, r)).toBe(true);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...s, personState: { ...s.personState, partition: 'person_program' } }).success).toBe(false);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...s, personState: { ...s.personState, projection: { ...projection, strategy: { ...projection.strategy, strategyVersion: 'foreign' } } } }).success).toBe(false);
});

it('pages beyond fifty by opaque cursor and rejects nonadvancing or oversized pages', () => {
  const sessions = Array.from({ length: 51 }, (_, i) => ({ ...state, measures: [], reservation: null,
    opening: { ...opening, openingId: `synthetic-opening-${String(100 - i).padStart(3, '0')}`, sessionId: `synthetic-session-${i}` } }));
  const r = { ...request, after: 'synthetic-page-50', limit: 100 }, s = { ...result, request: r, sessions, nextCursor: null };
  expect(api.isCoachPersonProgramReadForRequest(s, r)).toBe(true);
  expect(api.CoachPersonProgramReadRequestSchema.safeParse({ ...r, limit: 101 }).success).toBe(false);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...result, sessions: [state, state] }).success).toBe(false);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...result, request: { ...request, limit: 2 } }).success).toBe(false);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...result, request: { ...request, after: result.nextCursor } }).success).toBe(false);
});

it('orders unique openings newest first with a deterministic id tie-break', () => {
  const older = { ...state, opening: { ...opening, openingId: 'synthetic-opening-0', sessionId: 'synthetic-session-0' }, reservation: null, measures: [] };
  const r = { ...request, limit: 2 }, s = { ...result, request: r, sessions: [state, older], nextCursor: null };
  expect(api.CoachPersonProgramReadResultSchema.safeParse(s).success).toBe(true);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...s, sessions: [older, state] }).success).toBe(false);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...s, sessions: [older, older] }).success).toBe(false);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...s, request, sessions: [state, older] }).success).toBe(false);
  expect(api.CoachPersonProgramReadResultSchema.safeParse({ ...result, observedAt: '2020-01-01T00:00:00Z' }).success).toBe(false);
});

it.each(['opening', 'authority', 'grant', 'proof', 'userId'])('rejects caller authority field %s', field => {
  expect(api.CoachPersonProgramReadRequestSchema.safeParse({ ...request, [field]: {} }).success).toBe(false);
});
