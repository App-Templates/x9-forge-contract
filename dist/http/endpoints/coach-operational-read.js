import { z } from 'zod';
import { CapabilityPersonScopeSchema, sameCapabilityScope } from "../../capability/capability-call-context.js";
import { CoachProgramSchema } from "../../capability/coach/index.js";
import { CoachProgramVersionRefSchema } from "../../capability/coach/program-version.js";
import { CoachSessionOpeningRefSchema, CoachSessionPlanRevisionSchema, isCoachSessionPlanRevisionForSnapshot, CoachSessionExecutionSnapshotSchema } from "../../capability/coach/execution.js";
import { CoachMeasureDefinitionSchema } from "../../capability/coach/measures.js";
import { CoachOperationalBudgetStateSchema, CoachReservationSchema } from "../../capability/coach/operational/opening.js";
import { CoachOperationalSessionReadSchema } from "../../capability/coach/operational/observations.js";
import { matchesProgram } from "../../capability/coach/operational/program.js";
import { RevisionNumber } from "../../capability/coach/operational/common.js";
import { agentScope, sameValue } from "../../capability/coach/shared.js";
import { COACH_OPERATIONAL_PREFIX as prefix, COACH_OPERATIONAL_ERROR_STATUS as errorStatus, CoachOperationalErrorSchema as errorSchema, CoachOperationalAgentParamsSchema as Agent, operationalAgentPath } from "./coach-operational-common.js";
export const CoachProgramVersionReadRequestSchema = z.object({ program: CoachProgramVersionRefSchema }).strict();
export const CoachProgramVersionReadResultSchema = z.object({ ok: z.literal(true), program: CoachProgramVersionRefSchema, definition: CoachProgramSchema, measureDefinitions: z.array(CoachMeasureDefinitionSchema).max(500) }).strict()
    .refine(matchesProgram, 'Definition matches pinned program')
    .refine(x => new Set(x.measureDefinitions.map(d => d.measureId + ':' + d.version)).size === x.measureDefinitions.length, 'Unique measure definitions');
export const CoachOperationalSessionReadRequestSchema = z.object({ opening: CoachSessionOpeningRefSchema, expectedRevision: RevisionNumber.nullable() }).strict();
export const CoachOperationalSessionReadResultSchema = z.object({ ok: z.literal(true), state: CoachOperationalSessionReadSchema }).strict();
export function isCoachOperationalSessionReadForRequest(raw, expected) {
    const result = CoachOperationalSessionReadResultSchema.safeParse(raw), request = CoachOperationalSessionReadRequestSchema.safeParse(expected);
    return result.success && request.success && sameValue(result.data.state.opening, request.data.opening)
        && (request.data.expectedRevision === null || result.data.state.revision === request.data.expectedRevision);
}
export const CoachSessionRevisionsReadRequestSchema = z.object({ opening: CoachSessionOpeningRefSchema, expectedRevision: RevisionNumber, afterSequence: RevisionNumber, limit: z.number().int().min(1).max(100) }).strict();
export const CoachSessionRevisionsPageSchema = z.object({ ok: z.literal(true), opening: CoachSessionOpeningRefSchema, asOfRevision: RevisionNumber, revisions: z.array(CoachSessionPlanRevisionSchema).max(100), nextAfterSequence: RevisionNumber.nullable() }).strict()
    .refine(x => x.revisions.every((r, i) => sameCapabilityScope(r.scope, x.opening.scope) && r.sessionId === x.opening.sessionId && r.sequence <= x.asOfRevision && (i === 0 || r.sequence > x.revisions[i - 1].sequence))
    && (x.nextAfterSequence === null || (x.revisions.length > 0 && x.nextAfterSequence === x.revisions.at(-1).sequence)), 'Ordered correlated revision page with exact cursor');
export function isCoachSessionRevisionsPageForRequest(raw, expected, rawSnapshot) {
    const page = CoachSessionRevisionsPageSchema.safeParse(raw), request = CoachSessionRevisionsReadRequestSchema.safeParse(expected), snapshot = CoachSessionExecutionSnapshotSchema.safeParse(rawSnapshot);
    if (!page.success || !request.success || !snapshot.success)
        return false;
    const p = page.data, r = request.data;
    return sameValue(p.opening, r.opening) && sameValue(snapshot.data.opening, r.opening) && p.asOfRevision === r.expectedRevision
        && p.revisions.length <= r.limit && p.revisions.every(revision => revision.sequence > r.afterSequence && isCoachSessionPlanRevisionForSnapshot(revision, snapshot.data))
        && (p.nextAfterSequence === null || p.revisions.length === r.limit);
}
export const CoachOperationalBudgetReadRequestSchema = z.object({ scope: CapabilityPersonScopeSchema, program: CoachProgramVersionRefSchema }).strict()
    .refine(x => sameCapabilityScope(agentScope(x.scope), x.program.scope), 'Program belongs to budget agent');
export const CoachOperationalBudgetReadResultSchema = z.object({ ok: z.literal(true), budget: CoachOperationalBudgetStateSchema, reservation: CoachReservationSchema.nullable() }).strict()
    .refine(x => x.budget.status === 'unknown' || x.reservation === null || sameCapabilityScope(x.budget.budget.scope, x.reservation.scope), 'Budget readback belongs to one person');
const auth = { authType: 'secret', errorSchema, errorStatus, paramsSchema: Agent, method: 'POST' };
export const coachProgramVersionReadContract = { ...auth, path: `${prefix}/programs/read`, bodySchema: CoachProgramVersionReadRequestSchema, responseSchema: CoachProgramVersionReadResultSchema };
export const coachOperationalSessionReadContract = { ...auth, path: `${prefix}/sessions/read`, bodySchema: CoachOperationalSessionReadRequestSchema, responseSchema: CoachOperationalSessionReadResultSchema };
export const coachSessionRevisionsReadContract = { ...auth, path: `${prefix}/sessions/revisions/read`, bodySchema: CoachSessionRevisionsReadRequestSchema, responseSchema: CoachSessionRevisionsPageSchema };
export const coachOperationalBudgetReadContract = { ...auth, path: `${prefix}/budget/read`, bodySchema: CoachOperationalBudgetReadRequestSchema, responseSchema: CoachOperationalBudgetReadResultSchema };
export function capCoachProgramVersionReadPath(agentId) { return operationalAgentPath(agentId) + '/programs/read'; }
export function capCoachOperationalSessionReadPath(agentId) { return operationalAgentPath(agentId) + '/sessions/read'; }
export function capCoachSessionRevisionsReadPath(agentId) { return operationalAgentPath(agentId) + '/sessions/revisions/read'; }
export function capCoachOperationalBudgetReadPath(agentId) { return operationalAgentPath(agentId) + '/budget/read'; }
//# sourceMappingURL=coach-operational-read.js.map