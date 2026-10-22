import { z } from 'zod';
import { CapabilityAgentScopeSchema, CapabilityPersonScopeSchema, sameCapabilityScope } from "../capability-call-context.js";
import { AgentConfigVersionSchema, AgentTimeZoneSchema } from "../ricerca/agent-config.js";
import { CapabilityParameterKeySchema, CapabilityParameterValueSchema } from "../parameters.js";
import { AgentVoiceLocaleSchema } from "../voice/agent-voice-settings.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-management.js";
import { AgentRuntimeChannelKindSchema } from "../../agent/agent-runtime-state.js";
/**
 * cap-coach (R6, v1.31.0) — generic coaching engine: programs, sessions, progress and minute budget.
 *
 * - Programs (meditation, training, …) are PROJECT content stored in the coach format, one set per agent.
 * - Person data (profile, sessions, progress, budget) is isolated by tenant/owner/agent/person; a payload that mixes
 *   scopes is rejected. Conversational memory stays in X9 memory; cap-coach holds the structured data only.
 * - Session writes are idempotent by `idempotencyKey` (replayed callbacks are recorded once).
 * - UI and web apps belong to the project, not to this engine.
 */
export const CoachAgentScopeSchema = CapabilityAgentScopeSchema;
export const CoachPersonScopeSchema = CapabilityPersonScopeSchema;
const SlugSchema = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/);
export const CoachProgramIdSchema = SlugSchema;
/** Kind of program: meditation, training, … (open slug). */
export const CoachProgramKindSchema = SlugSchema;
export const CoachStepIdSchema = SlugSchema;
const InstantSchema = z.iso.datetime({ offset: true });
const MinutesSchema = z.number().int().positive().max(1440);
export const CoachStepSchema = z.object({
    stepId: CoachStepIdSchema,
    order: z.number().int().nonnegative(),
    title: z.string().trim().min(1).max(200),
    durationMinutes: MinutesSchema.optional(),
    technique: z.string().trim().min(1).max(200).optional(),
    instructions: z.string().trim().min(1).max(8000).optional(),
}).strict();
export const CoachProgramSchema = z.object({
    scope: CoachAgentScopeSchema,
    programId: CoachProgramIdSchema,
    kind: CoachProgramKindSchema,
    title: z.string().trim().min(1).max(200),
    locale: AgentVoiceLocaleSchema,
    /** Raised at every change; an older or equal version is refused (stale_version). */
    version: AgentConfigVersionSchema,
    steps: z.array(CoachStepSchema).min(1).max(500),
}).strict().superRefine((program, ctx) => {
    const ids = new Set();
    const orders = new Set();
    for (const [index, step] of program.steps.entries()) {
        if (ids.has(step.stepId))
            ctx.addIssue({ code: 'custom', path: ['steps', index, 'stepId'], message: 'Duplicate step id' });
        if (orders.has(step.order))
            ctx.addIssue({ code: 'custom', path: ['steps', index, 'order'], message: 'Duplicate step order' });
        ids.add(step.stepId);
        orders.add(step.order);
    }
});
export const CoachPersonProfileSchema = z.object({
    scope: CoachPersonScopeSchema,
    displayName: z.string().trim().min(1).max(80).optional(),
    locale: AgentVoiceLocaleSchema.optional(),
    timezone: AgentTimeZoneSchema.optional(),
    preferences: z.record(CapabilityParameterKeySchema, CapabilityParameterValueSchema),
    version: AgentConfigVersionSchema,
    updatedAt: InstantSchema,
}).strict();
export const CoachSessionStatusSchema = z.enum(['scheduled', 'in-progress', 'completed', 'abandoned']);
export const CoachSessionSchema = z.object({
    sessionId: z.string().min(1).max(128),
    /** Idempotency key of the write (e.g. provider conversation id or callback id). */
    idempotencyKey: AgentManagementRequestIdSchema,
    scope: CoachPersonScopeSchema,
    programId: CoachProgramIdSchema.optional(),
    stepId: CoachStepIdSchema.optional(),
    status: CoachSessionStatusSchema,
    plannedMinutes: MinutesSchema,
    startedAt: InstantSchema.nullable(),
    endedAt: InstantSchema.nullable(),
    actualMinutes: z.number().nonnegative().max(1440).nullable(),
    channel: AgentRuntimeChannelKindSchema.optional(),
}).strict().superRefine((session, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    const started = session.startedAt !== null;
    const ended = session.endedAt !== null;
    const measured = session.actualMinutes !== null;
    switch (session.status) {
        case 'scheduled':
            if (started || ended || measured)
                issue('status', 'A scheduled session has not started');
            break;
        case 'in-progress':
            if (!started || ended || measured)
                issue('status', 'An in-progress session has started and not ended');
            break;
        case 'completed':
            if (!started || !ended || !measured)
                issue('status', 'A completed session has start, end and minutes');
            break;
        case 'abandoned':
            if (!started || !ended)
                issue('status', 'An abandoned session has start and end');
            break;
    }
    if (session.startedAt !== null && session.endedAt !== null && Date.parse(session.endedAt) < Date.parse(session.startedAt)) {
        issue('endedAt', 'A session cannot end before it starts');
    }
    if (session.stepId !== undefined && session.programId === undefined)
        issue('programId', 'A step belongs to a program');
});
/** Usage scores 0–100 over a short and a long window (definition owned by cap-coach, versioned with it). */
export const CoachUsageScoresSchema = z.object({
    shortTerm: z.number().min(0).max(100),
    longTerm: z.number().min(0).max(100),
}).strict();
export const CoachProgressSchema = z.object({
    scope: CoachPersonScopeSchema,
    programId: CoachProgramIdSchema,
    completedStepIds: z.array(CoachStepIdSchema).max(500)
        .refine((ids) => new Set(ids).size === ids.length, { message: 'Duplicate completed step' }),
    sessionsCompleted: z.number().int().nonnegative(),
    minutesTotal: z.number().nonnegative(),
    streakDays: z.number().int().nonnegative(),
    /** End of the last completed session; null when none. */
    lastSessionAt: InstantSchema.nullable(),
    usageScores: CoachUsageScoresSchema.optional(),
    updatedAt: InstantSchema,
}).strict().superRefine((progress, ctx) => {
    if ((progress.sessionsCompleted > 0) !== (progress.lastSessionAt !== null)) {
        ctx.addIssue({ code: 'custom', path: ['lastSessionAt'], message: 'A last session exists exactly when sessions were completed' });
    }
    if (progress.sessionsCompleted === 0 && progress.minutesTotal !== 0) {
        ctx.addIssue({ code: 'custom', path: ['minutesTotal'], message: 'No completed session means no minutes' });
    }
});
export const CoachBudgetPeriodSchema = z.enum(['day', 'week', 'month']);
export const CoachMinuteBudgetSchema = z.object({
    scope: CoachPersonScopeSchema,
    period: CoachBudgetPeriodSchema,
    /** Start of the current period in `timezone`. */
    periodStart: InstantSchema,
    timezone: AgentTimeZoneSchema,
    limitMinutes: z.number().int().positive().max(100_000),
    /** May exceed the limit when a session in progress ends over it; new sessions are then refused. */
    usedMinutes: z.number().nonnegative(),
}).strict();
export function coachRemainingMinutes(budget) {
    return Math.max(0, budget.limitMinutes - budget.usedMinutes);
}
/** Everything cap-coach holds about ONE person of ONE agent. */
export const CoachPersonSnapshotSchema = z.object({
    scope: CoachPersonScopeSchema,
    profile: CoachPersonProfileSchema.nullable(),
    progress: z.array(CoachProgressSchema).max(500),
    budget: CoachMinuteBudgetSchema.nullable(),
    recentSessions: z.array(CoachSessionSchema).max(50),
}).superRefine((snapshot, ctx) => {
    const foreign = (path) => ctx.addIssue({ code: 'custom', path, message: 'Data of another scope' });
    if (snapshot.profile && !sameCapabilityScope(snapshot.profile.scope, snapshot.scope))
        foreign(['profile', 'scope']);
    if (snapshot.budget && !sameCapabilityScope(snapshot.budget.scope, snapshot.scope))
        foreign(['budget', 'scope']);
    const programs = new Set();
    for (const [index, entry] of snapshot.progress.entries()) {
        if (!sameCapabilityScope(entry.scope, snapshot.scope))
            foreign(['progress', index, 'scope']);
        if (programs.has(entry.programId))
            ctx.addIssue({ code: 'custom', path: ['progress', index, 'programId'], message: 'Duplicate program progress' });
        programs.add(entry.programId);
    }
    for (const [index, session] of snapshot.recentSessions.entries()) {
        if (!sameCapabilityScope(session.scope, snapshot.scope))
            foreign(['recentSessions', index, 'scope']);
    }
});
export const CoachSessionRecordResultSchema = z.object({
    ok: z.literal(true),
    /** true: this idempotencyKey was already recorded; nothing was counted twice. */
    replayed: z.boolean(),
    session: CoachSessionSchema,
    progress: CoachProgressSchema.optional(),
    budget: CoachMinuteBudgetSchema.optional(),
}).superRefine((result, ctx) => {
    if (result.progress && !sameCapabilityScope(result.progress.scope, result.session.scope)) {
        ctx.addIssue({ code: 'custom', path: ['progress', 'scope'], message: 'Data of another scope' });
    }
    if (result.progress && result.progress.programId !== result.session.programId) {
        ctx.addIssue({ code: 'custom', path: ['progress', 'programId'], message: 'Progress belongs to the recorded session\'s program' });
    }
    if (result.budget && !sameCapabilityScope(result.budget.scope, result.session.scope)) {
        ctx.addIssue({ code: 'custom', path: ['budget', 'scope'], message: 'Data of another scope' });
    }
});
export const CoachRouteErrorCodeSchema = z.enum([
    'invalid_request',
    'agent_mismatch',
    'person_mismatch',
    'not_found',
    'program_not_found',
    'idempotency_conflict',
    'stale_version',
    'budget_exhausted',
]);
export const CoachRouteErrorSchema = z.object({
    ok: z.literal(false),
    error: CoachRouteErrorCodeSchema,
    /** stale_version only. */
    currentVersion: AgentConfigVersionSchema.optional(),
}).superRefine((response, ctx) => {
    if ((response.error === 'stale_version') !== (response.currentVersion !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['currentVersion'], message: 'currentVersion is present exactly for stale_version' });
    }
});
//# sourceMappingURL=index.js.map