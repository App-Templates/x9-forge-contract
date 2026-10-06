"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachRouteErrorSchema = exports.CoachRouteErrorCodeSchema = exports.CoachSessionRecordResultSchema = exports.CoachPersonSnapshotSchema = exports.CoachMinuteBudgetSchema = exports.CoachBudgetPeriodSchema = exports.CoachProgressSchema = exports.CoachUsageScoresSchema = exports.CoachSessionSchema = exports.CoachSessionStatusSchema = exports.CoachPersonProfileSchema = exports.CoachProgramSchema = exports.CoachStepSchema = exports.CoachStepIdSchema = exports.CoachProgramKindSchema = exports.CoachProgramIdSchema = exports.CoachPersonScopeSchema = exports.CoachAgentScopeSchema = void 0;
exports.coachRemainingMinutes = coachRemainingMinutes;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const parameters_js_1 = require("../parameters.cjs");
const agent_voice_settings_js_1 = require("../voice/agent-voice-settings.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const agent_runtime_state_js_1 = require("../../agent/agent-runtime-state.cjs");
/**
 * cap-coach (R6, v1.31.0) — generic coaching engine: programs, sessions, progress and minute budget.
 *
 * - Programs (meditation, training, …) are PROJECT content stored in the coach format, one set per agent.
 * - Person data (profile, sessions, progress, budget) is isolated by tenant/owner/agent/person; a payload that mixes
 *   scopes is rejected. Conversational memory stays in X9 memory; cap-coach holds the structured data only.
 * - Session writes are idempotent by `idempotencyKey` (replayed callbacks are recorded once).
 * - UI and web apps belong to the project, not to this engine.
 */
exports.CoachAgentScopeSchema = capability_call_context_js_1.CapabilityAgentScopeSchema;
exports.CoachPersonScopeSchema = capability_call_context_js_1.CapabilityPersonScopeSchema;
const SlugSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/);
exports.CoachProgramIdSchema = SlugSchema;
/** Kind of program: meditation, training, … (open slug). */
exports.CoachProgramKindSchema = SlugSchema;
exports.CoachStepIdSchema = SlugSchema;
const InstantSchema = zod_1.z.iso.datetime({ offset: true });
const MinutesSchema = zod_1.z.number().int().positive().max(1440);
exports.CoachStepSchema = zod_1.z.object({
    stepId: exports.CoachStepIdSchema,
    order: zod_1.z.number().int().nonnegative(),
    title: zod_1.z.string().trim().min(1).max(200),
    durationMinutes: MinutesSchema.optional(),
    technique: zod_1.z.string().trim().min(1).max(200).optional(),
    instructions: zod_1.z.string().trim().min(1).max(8000).optional(),
}).strict();
exports.CoachProgramSchema = zod_1.z.object({
    scope: exports.CoachAgentScopeSchema,
    programId: exports.CoachProgramIdSchema,
    kind: exports.CoachProgramKindSchema,
    title: zod_1.z.string().trim().min(1).max(200),
    locale: agent_voice_settings_js_1.AgentVoiceLocaleSchema,
    /** Raised at every change; an older or equal version is refused (stale_version). */
    version: agent_config_js_1.AgentConfigVersionSchema,
    steps: zod_1.z.array(exports.CoachStepSchema).min(1).max(500),
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
exports.CoachPersonProfileSchema = zod_1.z.object({
    scope: exports.CoachPersonScopeSchema,
    displayName: zod_1.z.string().trim().min(1).max(80).optional(),
    locale: agent_voice_settings_js_1.AgentVoiceLocaleSchema.optional(),
    timezone: agent_config_js_1.AgentTimeZoneSchema.optional(),
    preferences: zod_1.z.record(parameters_js_1.CapabilityParameterKeySchema, parameters_js_1.CapabilityParameterValueSchema),
    version: agent_config_js_1.AgentConfigVersionSchema,
    updatedAt: InstantSchema,
}).strict();
exports.CoachSessionStatusSchema = zod_1.z.enum(['scheduled', 'in-progress', 'completed', 'abandoned']);
exports.CoachSessionSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1).max(128),
    /** Idempotency key of the write (e.g. provider conversation id or callback id). */
    idempotencyKey: agent_management_js_1.AgentManagementRequestIdSchema,
    scope: exports.CoachPersonScopeSchema,
    programId: exports.CoachProgramIdSchema.optional(),
    stepId: exports.CoachStepIdSchema.optional(),
    status: exports.CoachSessionStatusSchema,
    plannedMinutes: MinutesSchema,
    startedAt: InstantSchema.nullable(),
    endedAt: InstantSchema.nullable(),
    actualMinutes: zod_1.z.number().nonnegative().max(1440).nullable(),
    channel: agent_runtime_state_js_1.AgentRuntimeChannelKindSchema.optional(),
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
exports.CoachUsageScoresSchema = zod_1.z.object({
    shortTerm: zod_1.z.number().min(0).max(100),
    longTerm: zod_1.z.number().min(0).max(100),
}).strict();
exports.CoachProgressSchema = zod_1.z.object({
    scope: exports.CoachPersonScopeSchema,
    programId: exports.CoachProgramIdSchema,
    completedStepIds: zod_1.z.array(exports.CoachStepIdSchema).max(500)
        .refine((ids) => new Set(ids).size === ids.length, { message: 'Duplicate completed step' }),
    sessionsCompleted: zod_1.z.number().int().nonnegative(),
    minutesTotal: zod_1.z.number().nonnegative(),
    streakDays: zod_1.z.number().int().nonnegative(),
    /** End of the last completed session; null when none. */
    lastSessionAt: InstantSchema.nullable(),
    usageScores: exports.CoachUsageScoresSchema.optional(),
    updatedAt: InstantSchema,
}).strict().superRefine((progress, ctx) => {
    if ((progress.sessionsCompleted > 0) !== (progress.lastSessionAt !== null)) {
        ctx.addIssue({ code: 'custom', path: ['lastSessionAt'], message: 'A last session exists exactly when sessions were completed' });
    }
    if (progress.sessionsCompleted === 0 && progress.minutesTotal !== 0) {
        ctx.addIssue({ code: 'custom', path: ['minutesTotal'], message: 'No completed session means no minutes' });
    }
});
exports.CoachBudgetPeriodSchema = zod_1.z.enum(['day', 'week', 'month']);
exports.CoachMinuteBudgetSchema = zod_1.z.object({
    scope: exports.CoachPersonScopeSchema,
    period: exports.CoachBudgetPeriodSchema,
    /** Start of the current period in `timezone`. */
    periodStart: InstantSchema,
    timezone: agent_config_js_1.AgentTimeZoneSchema,
    limitMinutes: zod_1.z.number().int().positive().max(100_000),
    /** May exceed the limit when a session in progress ends over it; new sessions are then refused. */
    usedMinutes: zod_1.z.number().nonnegative(),
}).strict();
function coachRemainingMinutes(budget) {
    return Math.max(0, budget.limitMinutes - budget.usedMinutes);
}
/** Everything cap-coach holds about ONE person of ONE agent. */
exports.CoachPersonSnapshotSchema = zod_1.z.object({
    scope: exports.CoachPersonScopeSchema,
    profile: exports.CoachPersonProfileSchema.nullable(),
    progress: zod_1.z.array(exports.CoachProgressSchema).max(500),
    budget: exports.CoachMinuteBudgetSchema.nullable(),
    recentSessions: zod_1.z.array(exports.CoachSessionSchema).max(50),
}).superRefine((snapshot, ctx) => {
    const foreign = (path) => ctx.addIssue({ code: 'custom', path, message: 'Data of another scope' });
    if (snapshot.profile && !(0, capability_call_context_js_1.sameCapabilityScope)(snapshot.profile.scope, snapshot.scope))
        foreign(['profile', 'scope']);
    if (snapshot.budget && !(0, capability_call_context_js_1.sameCapabilityScope)(snapshot.budget.scope, snapshot.scope))
        foreign(['budget', 'scope']);
    const programs = new Set();
    for (const [index, entry] of snapshot.progress.entries()) {
        if (!(0, capability_call_context_js_1.sameCapabilityScope)(entry.scope, snapshot.scope))
            foreign(['progress', index, 'scope']);
        if (programs.has(entry.programId))
            ctx.addIssue({ code: 'custom', path: ['progress', index, 'programId'], message: 'Duplicate program progress' });
        programs.add(entry.programId);
    }
    for (const [index, session] of snapshot.recentSessions.entries()) {
        if (!(0, capability_call_context_js_1.sameCapabilityScope)(session.scope, snapshot.scope))
            foreign(['recentSessions', index, 'scope']);
    }
});
exports.CoachSessionRecordResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    /** true: this idempotencyKey was already recorded; nothing was counted twice. */
    replayed: zod_1.z.boolean(),
    session: exports.CoachSessionSchema,
    progress: exports.CoachProgressSchema.optional(),
    budget: exports.CoachMinuteBudgetSchema.optional(),
}).superRefine((result, ctx) => {
    if (result.progress && !(0, capability_call_context_js_1.sameCapabilityScope)(result.progress.scope, result.session.scope)) {
        ctx.addIssue({ code: 'custom', path: ['progress', 'scope'], message: 'Data of another scope' });
    }
    if (result.progress && result.progress.programId !== result.session.programId) {
        ctx.addIssue({ code: 'custom', path: ['progress', 'programId'], message: 'Progress belongs to the recorded session\'s program' });
    }
    if (result.budget && !(0, capability_call_context_js_1.sameCapabilityScope)(result.budget.scope, result.session.scope)) {
        ctx.addIssue({ code: 'custom', path: ['budget', 'scope'], message: 'Data of another scope' });
    }
});
exports.CoachRouteErrorCodeSchema = zod_1.z.enum([
    'invalid_request',
    'agent_mismatch',
    'person_mismatch',
    'not_found',
    'program_not_found',
    'idempotency_conflict',
    'stale_version',
    'budget_exhausted',
]);
exports.CoachRouteErrorSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: exports.CoachRouteErrorCodeSchema,
    /** stale_version only. */
    currentVersion: agent_config_js_1.AgentConfigVersionSchema.optional(),
}).superRefine((response, ctx) => {
    if ((response.error === 'stale_version') !== (response.currentVersion !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['currentVersion'], message: 'currentVersion is present exactly for stale_version' });
    }
});
//# sourceMappingURL=index.js.map