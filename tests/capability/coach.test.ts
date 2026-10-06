import { describe, expect, it } from 'vitest';
import {
  CoachMinuteBudgetSchema,
  CoachPersonProfileSchema,
  CoachPersonSnapshotSchema,
  CoachProgramSchema,
  CoachProgressSchema,
  CoachRouteErrorSchema,
  CoachSessionRecordResultSchema,
  CoachSessionSchema,
  coachRemainingMinutes,
} from '../../src/capability/index.js';
import {
  AgentConfigSavedSchema,
  capCoachPersonPath,
  capCoachProgramPath,
  capCoachSessionsPath,
  coachPersonSnapshotContract,
  coachProgramPutContract,
  coachSessionRecordContract,
} from '../../src/http/index.js';

const agentScope = { tenantId: 't-1', ownerId: '2', agentId: 'x9-meditazione' };
const person = { ...agentScope, userId: 'person-9' };
const program = {
  scope: agentScope, programId: 'respiro-7', kind: 'meditation', title: 'Sette giorni di respiro', locale: 'it', version: 2,
  steps: [
    { stepId: 'day-1', order: 0, title: 'Respiro consapevole', durationMinutes: 10, technique: 'breath' },
    { stepId: 'day-2', order: 1, title: 'Body scan', durationMinutes: 15 },
  ],
};
const completed = {
  sessionId: 'sess-1', idempotencyKey: 'sess-key-0001', scope: person, programId: 'respiro-7', stepId: 'day-1',
  status: 'completed', plannedMinutes: 10, startedAt: '2026-10-07T07:00:00Z', endedAt: '2026-10-07T07:11:00Z', actualMinutes: 11, channel: 'web',
};
const progress = {
  scope: person, programId: 'respiro-7', completedStepIds: ['day-1'], sessionsCompleted: 1, minutesTotal: 11, streakDays: 1,
  lastSessionAt: '2026-10-07T07:11:00Z', usageScores: { shortTerm: 40, longTerm: 10 }, updatedAt: '2026-10-07T07:11:01Z',
};
const budget = { scope: person, period: 'month', periodStart: '2026-10-01T00:00:00Z', timezone: 'Europe/Rome', limitMinutes: 300, usedMinutes: 11 };
const profile = { scope: person, displayName: 'Anna', locale: 'it', timezone: 'Europe/Rome', preferences: { 'voice.speed': 0.9, 'session.length': 10 }, version: 1, updatedAt: '2026-10-07T06:00:00Z' };

describe('R6 cap-coach programs (project content, per agent)', () => {
  it('accepts a generic program with ordered steps', () => {
    expect(CoachProgramSchema.safeParse(program).success).toBe(true);
    expect(CoachProgramSchema.safeParse({ ...program, kind: 'training' }).success).toBe(true);
  });

  it.each([
    ['person-scoped program', { scope: person }],
    ['no steps', { steps: [] }],
    ['duplicate step id', { steps: [program.steps[0], { ...program.steps[1], stepId: 'day-1' }] }],
    ['duplicate step order', { steps: [program.steps[0], { ...program.steps[1], order: 0 }] }],
    ['invalid program id', { programId: 'Respiro 7' }],
    ['zero version', { version: 0 }],
    ['step without minutes > 0', { steps: [{ ...program.steps[0], durationMinutes: 0 }] }],
  ])('rejects %s', (_label, patch) => {
    expect(CoachProgramSchema.safeParse({ ...program, ...patch }).success).toBe(false);
  });
});

describe('R6 cap-coach person data isolated by tenant/owner/agent/person', () => {
  it('accepts a profile with preferences and time zone', () => {
    expect(CoachPersonProfileSchema.safeParse(profile).success).toBe(true);
    expect(CoachPersonProfileSchema.safeParse({ ...profile, scope: agentScope }).success).toBe(false);
    expect(CoachPersonProfileSchema.safeParse({ ...profile, timezone: 'Mars/Olympus' }).success).toBe(false);
  });

  it.each([
    [{}],
    [{ status: 'scheduled', startedAt: null, endedAt: null, actualMinutes: null }],
    [{ status: 'in-progress', endedAt: null, actualMinutes: null }],
    [{ status: 'abandoned', actualMinutes: 4 }],
    [{ status: 'abandoned', actualMinutes: null }],
    [{ programId: undefined, stepId: undefined }],
  ])('accepts a coherent session %#', (patch) => {
    expect(CoachSessionSchema.safeParse({ ...completed, ...patch }).success).toBe(true);
  });

  it.each([
    ['completed without end', { endedAt: null }],
    ['completed without minutes', { actualMinutes: null }],
    ['in progress with end', { status: 'in-progress' }],
    ['scheduled already started', { status: 'scheduled', endedAt: null, actualMinutes: null }],
    ['end before start', { endedAt: '2026-10-07T06:59:00Z' }],
    ['step without program', { programId: undefined }],
    ['session without person', { scope: agentScope }],
    ['missing idempotency key', { idempotencyKey: undefined }],
    ['abandoned without end', { status: 'abandoned', endedAt: null, actualMinutes: null }],
  ])('rejects %s', (_label, patch) => {
    expect(CoachSessionSchema.safeParse({ ...completed, ...patch }).success).toBe(false);
  });

  it('tracks progress with short and long term usage scores', () => {
    expect(CoachProgressSchema.safeParse(progress).success).toBe(true);
    expect(CoachProgressSchema.safeParse({ ...progress, completedStepIds: [], sessionsCompleted: 0, minutesTotal: 0, streakDays: 0, lastSessionAt: null, usageScores: undefined }).success).toBe(true);
  });

  it.each([
    ['sessions without last session', { lastSessionAt: null }],
    ['last session without sessions', { sessionsCompleted: 0, minutesTotal: 0 }],
    ['minutes without sessions', { sessionsCompleted: 0, lastSessionAt: null }],
    ['duplicate completed step', { completedStepIds: ['day-1', 'day-1'] }],
    ['score above 100', { usageScores: { shortTerm: 140, longTerm: 10 } }],
  ])('rejects progress with %s', (_label, patch) => {
    expect(CoachProgressSchema.safeParse({ ...progress, ...patch }).success).toBe(false);
  });

  it('counts the minute budget per period and never goes negative', () => {
    expect(CoachMinuteBudgetSchema.safeParse(budget).success).toBe(true);
    expect(coachRemainingMinutes(CoachMinuteBudgetSchema.parse(budget))).toBe(289);
    expect(coachRemainingMinutes(CoachMinuteBudgetSchema.parse({ ...budget, usedMinutes: 320 }))).toBe(0);
    expect(CoachMinuteBudgetSchema.safeParse({ ...budget, limitMinutes: 0 }).success).toBe(false);
    expect(CoachMinuteBudgetSchema.safeParse({ ...budget, period: 'year' }).success).toBe(false);
    expect(CoachMinuteBudgetSchema.safeParse({ ...budget, scope: agentScope }).success).toBe(false);
  });
});

describe('R6 cap-coach snapshot, results and errors', () => {
  const snapshot = { scope: person, profile, progress: [progress], budget, recentSessions: [completed] };

  it('returns one person\'s data only', () => {
    expect(CoachPersonSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(CoachPersonSnapshotSchema.safeParse({ ...snapshot, profile: null, progress: [], budget: null, recentSessions: [] }).success).toBe(true);
  });

  it.each([
    ['another person\'s session', { recentSessions: [{ ...completed, scope: { ...person, userId: 'person-10' } }] }],
    ['another agent\'s progress', { progress: [{ ...progress, scope: { ...person, agentId: 'x9' } }] }],
    ['another tenant\'s budget', { budget: { ...budget, scope: { ...person, tenantId: 't-2' } } }],
    ['another person\'s profile', { profile: { ...profile, scope: { ...person, userId: 'person-10' } } }],
    ['duplicate program progress', { progress: [progress, progress] }],
  ])('rejects %s', (_label, patch) => {
    expect(CoachPersonSnapshotSchema.safeParse({ ...snapshot, ...patch }).success).toBe(false);
  });

  it('records a session once and reports replays', () => {
    const result = { ok: true, replayed: false, session: completed, progress, budget };
    expect(CoachSessionRecordResultSchema.safeParse(result).success).toBe(true);
    expect(CoachSessionRecordResultSchema.safeParse({ ...result, replayed: true }).success).toBe(true);
    expect(CoachSessionRecordResultSchema.safeParse({ ...result, progress: { ...progress, scope: { ...person, userId: 'x' } } }).success).toBe(false);
    expect(CoachSessionRecordResultSchema.safeParse({ ...result, budget: { ...budget, scope: { ...person, userId: 'x' } } }).success).toBe(false);
  });

  it('distinguishes budget exhaustion, idempotency conflict and stale programs', () => {
    expect(CoachRouteErrorSchema.safeParse({ ok: false, error: 'budget_exhausted' }).success).toBe(true);
    expect(CoachRouteErrorSchema.safeParse({ ok: false, error: 'idempotency_conflict' }).success).toBe(true);
    expect(CoachRouteErrorSchema.safeParse({ ok: false, error: 'stale_version', currentVersion: 3 }).success).toBe(true);
    expect(CoachRouteErrorSchema.safeParse({ ok: false, error: 'stale_version' }).success).toBe(false);
    expect(CoachRouteErrorSchema.safeParse({ ok: false, error: 'person_mismatch', currentVersion: 3 }).success).toBe(false);
  });
});

describe('R6 cap-coach routes', () => {
  it('declares secret-auth per-agent routes and reuses the saved-version answer', () => {
    expect(coachProgramPutContract).toMatchObject({ method: 'PUT', path: '/internal/capability/agents/:agentId/coach/programs/:programId', authType: 'secret' });
    expect(coachProgramPutContract.responseSchema).toBe(AgentConfigSavedSchema);
    expect(coachSessionRecordContract).toMatchObject({ method: 'POST', path: '/internal/capability/agents/:agentId/coach/sessions', authType: 'secret' });
    expect(coachPersonSnapshotContract).toMatchObject({ method: 'GET', path: '/internal/capability/agents/:agentId/coach/people/:userId', authType: 'secret' });
  });

  it('builds validated and encoded paths', () => {
    expect(capCoachProgramPath('x9-meditazione', 'respiro-7')).toBe('/internal/capability/agents/x9-meditazione/coach/programs/respiro-7');
    expect(capCoachSessionsPath('x9-meditazione')).toBe('/internal/capability/agents/x9-meditazione/coach/sessions');
    expect(capCoachPersonPath('x9-meditazione', 'user/1 a')).toBe('/internal/capability/agents/x9-meditazione/coach/people/user%2F1%20a');
    expect(() => capCoachProgramPath('x9-meditazione', '../etc')).toThrow();
    expect(() => capCoachSessionsPath('X9')).toThrow();
    expect(() => capCoachPersonPath('x9-meditazione', '')).toThrow();
  });
});
