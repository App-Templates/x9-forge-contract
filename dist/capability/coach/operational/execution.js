import { z } from 'zod';
import { CoachSessionExecutionSnapshotSchema, CoachSessionPlanRevisionSchema, isCoachExecutionSnapshotForOpening, isCoachSessionPlanRevisionForSnapshot } from "../execution.js";
import { RefId } from "../shared.js";
import { CoachOperationalCommandMetadataSchema, result, DecisionCodes, sameValue } from "./common.js";
import { CoachProgramInputEnvelopeSchema, CoachProgramProjectionSchema } from "./conversation.js";
export const CoachExecutionStartRequestSchema = CoachOperationalCommandMetadataSchema;
export const CoachExecutionStartResultSchema = z.object({
    ok: z.literal(true), requestId: RefId, replayed: z.boolean(), snapshot: CoachSessionExecutionSnapshotSchema,
    revision: z.number().int().positive(), projection: CoachProgramProjectionSchema,
}).strict().refine(x => sameValue(x.projection.strategy, x.snapshot.opening.program.strategy), 'Execution uses pinned strategy');
export function isCoachExecutionStartResultForRequest(raw, expected) {
    const value = CoachExecutionStartResultSchema.safeParse(raw), request = CoachExecutionStartRequestSchema.safeParse(expected);
    return value.success && request.success && value.data.requestId === request.data.requestId && value.data.revision > request.data.expectedRevision && isCoachExecutionSnapshotForOpening(value.data.snapshot, request.data.opening);
}
export const CoachExecutionEventRequestSchema = CoachOperationalCommandMetadataSchema.extend({ event: CoachProgramInputEnvelopeSchema }).strict();
export const CoachExecutionEventResultSchema = z.object({
    ...result, initialSnapshot: CoachSessionExecutionSnapshotSchema.nullable(), appliedRevision: CoachSessionPlanRevisionSchema.nullable(),
    projection: CoachProgramProjectionSchema.nullable(), decisionCodes: DecisionCodes,
}).strict().refine(x => (x.initialSnapshot === null || isCoachExecutionSnapshotForOpening(x.initialSnapshot, x.opening))
    && (x.appliedRevision === null || (x.initialSnapshot !== null && isCoachSessionPlanRevisionForSnapshot(x.appliedRevision, x.initialSnapshot)))
    && (x.projection === null || sameValue(x.projection.strategy, x.opening.program.strategy)), 'Event preserves original execution and strategy');
export function isCoachExecutionEventResultForRequest(raw, expected, originalSnapshot) {
    const value = CoachExecutionEventResultSchema.safeParse(raw), request = CoachExecutionEventRequestSchema.safeParse(expected);
    if (!value.success || !request.success || value.data.requestId !== request.data.requestId || !sameValue(value.data.opening, request.data.opening))
        return false;
    if (originalSnapshot === null)
        return value.data.initialSnapshot === null;
    const snapshot = CoachSessionExecutionSnapshotSchema.safeParse(originalSnapshot);
    return snapshot.success && sameValue(value.data.initialSnapshot, snapshot.data);
}
//# sourceMappingURL=execution.js.map