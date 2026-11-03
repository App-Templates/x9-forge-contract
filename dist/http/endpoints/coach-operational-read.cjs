"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coachOperationalBudgetReadContract = exports.coachSessionRevisionsReadContract = exports.coachOperationalSessionReadContract = exports.coachProgramVersionReadContract = exports.CoachOperationalBudgetReadResultSchema = exports.CoachOperationalBudgetReadRequestSchema = exports.CoachSessionRevisionsPageSchema = exports.CoachSessionRevisionsReadRequestSchema = exports.CoachOperationalSessionReadResultSchema = exports.CoachOperationalSessionReadRequestSchema = exports.CoachProgramVersionReadResultSchema = exports.CoachProgramVersionReadRequestSchema = void 0;
exports.isCoachOperationalSessionReadForRequest = isCoachOperationalSessionReadForRequest;
exports.isCoachSessionRevisionsPageForRequest = isCoachSessionRevisionsPageForRequest;
exports.capCoachProgramVersionReadPath = capCoachProgramVersionReadPath;
exports.capCoachOperationalSessionReadPath = capCoachOperationalSessionReadPath;
exports.capCoachSessionRevisionsReadPath = capCoachSessionRevisionsReadPath;
exports.capCoachOperationalBudgetReadPath = capCoachOperationalBudgetReadPath;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const index_js_1 = require("../../capability/coach/index.cjs");
const program_version_js_1 = require("../../capability/coach/program-version.cjs");
const execution_js_1 = require("../../capability/coach/execution.cjs");
const measures_js_1 = require("../../capability/coach/measures.cjs");
const opening_js_1 = require("../../capability/coach/operational/opening.cjs");
const observations_js_1 = require("../../capability/coach/operational/observations.cjs");
const program_js_1 = require("../../capability/coach/operational/program.cjs");
const common_js_1 = require("../../capability/coach/operational/common.cjs");
const shared_js_1 = require("../../capability/coach/shared.cjs");
const coach_operational_common_js_1 = require("./coach-operational-common.cjs");
exports.CoachProgramVersionReadRequestSchema = zod_1.z.object({ program: program_version_js_1.CoachProgramVersionRefSchema }).strict();
exports.CoachProgramVersionReadResultSchema = zod_1.z.object({ ok: zod_1.z.literal(true), program: program_version_js_1.CoachProgramVersionRefSchema, definition: index_js_1.CoachProgramSchema, measureDefinitions: zod_1.z.array(measures_js_1.CoachMeasureDefinitionSchema).max(500) }).strict()
    .refine(program_js_1.matchesProgram, 'Definition matches pinned program')
    .refine(x => new Set(x.measureDefinitions.map(d => d.measureId + ':' + d.version)).size === x.measureDefinitions.length, 'Unique measure definitions');
exports.CoachOperationalSessionReadRequestSchema = zod_1.z.object({ opening: execution_js_1.CoachSessionOpeningRefSchema, expectedRevision: common_js_1.RevisionNumber.nullable() }).strict();
exports.CoachOperationalSessionReadResultSchema = zod_1.z.object({ ok: zod_1.z.literal(true), state: observations_js_1.CoachOperationalSessionReadSchema }).strict();
function isCoachOperationalSessionReadForRequest(raw, expected) {
    const result = exports.CoachOperationalSessionReadResultSchema.safeParse(raw), request = exports.CoachOperationalSessionReadRequestSchema.safeParse(expected);
    return result.success && request.success && (0, shared_js_1.sameValue)(result.data.state.opening, request.data.opening)
        && (request.data.expectedRevision === null || result.data.state.revision === request.data.expectedRevision);
}
exports.CoachSessionRevisionsReadRequestSchema = zod_1.z.object({ opening: execution_js_1.CoachSessionOpeningRefSchema, expectedRevision: common_js_1.RevisionNumber, afterSequence: common_js_1.RevisionNumber, limit: zod_1.z.number().int().min(1).max(100) }).strict();
exports.CoachSessionRevisionsPageSchema = zod_1.z.object({ ok: zod_1.z.literal(true), opening: execution_js_1.CoachSessionOpeningRefSchema, asOfRevision: common_js_1.RevisionNumber, revisions: zod_1.z.array(execution_js_1.CoachSessionPlanRevisionSchema).max(100), nextAfterSequence: common_js_1.RevisionNumber.nullable() }).strict()
    .refine(x => x.revisions.every((r, i) => (0, capability_call_context_js_1.sameCapabilityScope)(r.scope, x.opening.scope) && r.sessionId === x.opening.sessionId && r.sequence <= x.asOfRevision && (i === 0 || r.sequence > x.revisions[i - 1].sequence))
    && (x.nextAfterSequence === null || (x.revisions.length > 0 && x.nextAfterSequence === x.revisions.at(-1).sequence)), 'Ordered correlated revision page with exact cursor');
function isCoachSessionRevisionsPageForRequest(raw, expected, rawSnapshot) {
    const page = exports.CoachSessionRevisionsPageSchema.safeParse(raw), request = exports.CoachSessionRevisionsReadRequestSchema.safeParse(expected), snapshot = execution_js_1.CoachSessionExecutionSnapshotSchema.safeParse(rawSnapshot);
    if (!page.success || !request.success || !snapshot.success)
        return false;
    const p = page.data, r = request.data;
    return (0, shared_js_1.sameValue)(p.opening, r.opening) && (0, shared_js_1.sameValue)(snapshot.data.opening, r.opening) && p.asOfRevision === r.expectedRevision
        && p.revisions.length <= r.limit && p.revisions.every(revision => revision.sequence > r.afterSequence && (0, execution_js_1.isCoachSessionPlanRevisionForSnapshot)(revision, snapshot.data))
        && (p.nextAfterSequence === null || p.revisions.length === r.limit);
}
exports.CoachOperationalBudgetReadRequestSchema = zod_1.z.object({ scope: capability_call_context_js_1.CapabilityPersonScopeSchema, program: program_version_js_1.CoachProgramVersionRefSchema }).strict()
    .refine(x => (0, capability_call_context_js_1.sameCapabilityScope)((0, shared_js_1.agentScope)(x.scope), x.program.scope), 'Program belongs to budget agent');
exports.CoachOperationalBudgetReadResultSchema = zod_1.z.object({ ok: zod_1.z.literal(true), budget: opening_js_1.CoachOperationalBudgetStateSchema, reservation: opening_js_1.CoachReservationSchema.nullable() }).strict()
    .refine(x => x.budget.status === 'unknown' || x.reservation === null || (0, capability_call_context_js_1.sameCapabilityScope)(x.budget.budget.scope, x.reservation.scope), 'Budget readback belongs to one person');
const auth = { authType: 'secret', errorSchema: coach_operational_common_js_1.CoachOperationalErrorSchema, errorStatus: coach_operational_common_js_1.COACH_OPERATIONAL_ERROR_STATUS, paramsSchema: coach_operational_common_js_1.CoachOperationalAgentParamsSchema, method: 'POST' };
exports.coachProgramVersionReadContract = { ...auth, path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/programs/read`, bodySchema: exports.CoachProgramVersionReadRequestSchema, responseSchema: exports.CoachProgramVersionReadResultSchema };
exports.coachOperationalSessionReadContract = { ...auth, path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/sessions/read`, bodySchema: exports.CoachOperationalSessionReadRequestSchema, responseSchema: exports.CoachOperationalSessionReadResultSchema };
exports.coachSessionRevisionsReadContract = { ...auth, path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/sessions/revisions/read`, bodySchema: exports.CoachSessionRevisionsReadRequestSchema, responseSchema: exports.CoachSessionRevisionsPageSchema };
exports.coachOperationalBudgetReadContract = { ...auth, path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/budget/read`, bodySchema: exports.CoachOperationalBudgetReadRequestSchema, responseSchema: exports.CoachOperationalBudgetReadResultSchema };
function capCoachProgramVersionReadPath(agentId) { return (0, coach_operational_common_js_1.operationalAgentPath)(agentId) + '/programs/read'; }
function capCoachOperationalSessionReadPath(agentId) { return (0, coach_operational_common_js_1.operationalAgentPath)(agentId) + '/sessions/read'; }
function capCoachSessionRevisionsReadPath(agentId) { return (0, coach_operational_common_js_1.operationalAgentPath)(agentId) + '/sessions/revisions/read'; }
function capCoachOperationalBudgetReadPath(agentId) { return (0, coach_operational_common_js_1.operationalAgentPath)(agentId) + '/budget/read'; }
//# sourceMappingURL=coach-operational-read.js.map