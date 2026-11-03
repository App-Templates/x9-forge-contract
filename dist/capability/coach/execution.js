import { z } from 'zod';
import { CapabilityPersonScopeSchema, sameCapabilityScope } from "../capability-call-context.js";
import { AgentConfigVersionSchema } from "../ricerca/agent-config.js";
import { CoachStepIdSchema } from "./index.js";
import { CoachProgramVersionRefSchema } from "./program-version.js";
import { RefId, SessionId, Instant, Seconds, DecisionCodes, agentScope, sameValue } from "./shared.js";
export const CoachSessionOpeningRefSchema = z.object({
    openingId: RefId, scope: CapabilityPersonScopeSchema, sessionId: SessionId,
    program: CoachProgramVersionRefSchema, appliedConfigVersion: AgentConfigVersionSchema, openedAt: Instant,
}).strict().refine(x => sameCapabilityScope(agentScope(x.scope), x.program.scope), 'Program belongs to opening agent');
export const CoachExecutionSegmentSchema = z.object({
    segmentId: CoachStepIdSchema, stepId: CoachStepIdSchema.optional(), offsetSeconds: Seconds,
    durationSeconds: Seconds.positive(),
}).strict();
const timeline = { segments: z.array(CoachExecutionSegmentSchema).min(1).max(500), totalSeconds: Seconds.positive(), decisionCodes: DecisionCodes };
function validTimeline(x) {
    let end = 0;
    const ids = new Set();
    return x.segments.every(segment => {
        const valid = !ids.has(segment.segmentId) && segment.offsetSeconds >= end && segment.offsetSeconds + segment.durationSeconds <= x.totalSeconds;
        ids.add(segment.segmentId);
        end = segment.offsetSeconds + segment.durationSeconds;
        return valid;
    });
}
export const CoachSessionExecutionSnapshotSchema = z.object({
    snapshotId: RefId, opening: CoachSessionOpeningRefSchema, ...timeline, startedAt: Instant,
}).strict().refine(validTimeline, 'Ordered nonoverlapping bounded timeline')
    .refine(x => Date.parse(x.startedAt) >= Date.parse(x.opening.openedAt), 'Start follows opening');
export const CoachSessionPlanRevisionSchema = z.object({
    revisionId: RefId, scope: CapabilityPersonScopeSchema, sessionId: SessionId, snapshotId: RefId,
    sequence: z.number().int().positive(), appliedAt: Instant, effectiveFromSeconds: Seconds, ...timeline,
}).strict().refine(validTimeline, 'Ordered nonoverlapping bounded timeline');
export function isCoachExecutionSnapshotForOpening(raw, expected) {
    const snapshot = CoachSessionExecutionSnapshotSchema.safeParse(raw), opening = CoachSessionOpeningRefSchema.safeParse(expected);
    return snapshot.success && opening.success && sameValue(snapshot.data.opening, opening.data);
}
export function isCoachSessionPlanRevisionForSnapshot(raw, expected) {
    const revision = CoachSessionPlanRevisionSchema.safeParse(raw), snapshot = CoachSessionExecutionSnapshotSchema.safeParse(expected);
    if (!revision.success || !snapshot.success)
        return false;
    const r = revision.data, s = snapshot.data;
    return sameCapabilityScope(r.scope, s.opening.scope) && r.sessionId === s.opening.sessionId && r.snapshotId === s.snapshotId
        && Date.parse(r.appliedAt) >= Date.parse(s.startedAt) && r.effectiveFromSeconds <= s.totalSeconds;
}
//# sourceMappingURL=execution.js.map