import { z } from 'zod';
import { sameCapabilityScope } from "../../capability-call-context.js";
import { CoachSessionOpeningRefSchema, CoachSessionExecutionSnapshotSchema, CoachSessionPlanRevisionSchema, isCoachExecutionSnapshotForOpening, isCoachSessionPlanRevisionForSnapshot } from "../execution.js";
import { CoachProviderUsageSchema, CoachPracticeObservationSchema, CoachSessionAccountingSchema } from "../accounting.js";
import { CoachMeasureDefinitionSchema, CoachMeasureObservationSchema, isCoachMeasureForDefinition } from "../measures.js";
import { RefId } from "../shared.js";
import { CoachOperationalBudgetStateSchema, CoachReservationSchema } from "./opening.js";
import { CoachProgramProjectionSchema } from "./conversation.js";
import { RevisionNumber, forOpening, sameValue } from "./common.js";
export const CoachUsageObserveRequestSchema = z.object({
    requestId: RefId, opening: CoachSessionOpeningRefSchema, expectedUsageRevision: RevisionNumber.nullable(), observation: CoachProviderUsageSchema,
}).strict().refine(x => forOpening(x.observation, x.opening), 'Usage belongs to original opening');
export const CoachUsageObserveResultSchema = z.object({
    ok: z.literal(true), requestId: RefId, replayed: z.boolean(), usage: CoachProviderUsageSchema,
    usageRevision: RevisionNumber.positive(), budget: CoachOperationalBudgetStateSchema, reservation: CoachReservationSchema.nullable(),
}).strict().refine(x => (x.budget.status === 'unknown' || sameCapabilityScope(x.usage.scope, x.budget.budget.scope))
    && (x.reservation === null || (sameCapabilityScope(x.reservation.scope, x.usage.scope) && x.reservation.openingId === x.usage.openingId)), 'Usage readback retains original person and reservation');
export const CoachOperationalSessionReadSchema = z.object({
    opening: CoachSessionOpeningRefSchema, revision: RevisionNumber, lifecycle: z.enum(['opened', 'executing', 'execution_ended', 'closed']),
    practice: CoachPracticeObservationSchema.nullable(), measureDefinitions: z.array(CoachMeasureDefinitionSchema).max(500),
    initialSnapshot: CoachSessionExecutionSnapshotSchema.nullable(), latestRevision: CoachSessionPlanRevisionSchema.nullable(),
    projection: CoachProgramProjectionSchema.nullable(), measures: z.array(CoachMeasureObservationSchema).max(500),
    accounting: CoachSessionAccountingSchema.nullable(), budget: CoachOperationalBudgetStateSchema, reservation: CoachReservationSchema.nullable(),
}).strict().superRefine((x, ctx) => {
    const fail = (message) => ctx.addIssue({ code: 'custom', message });
    if (x.lifecycle === 'opened' && (x.initialSnapshot !== null || x.practice !== null || x.accounting !== null))
        fail('Opened precedes execution');
    if (x.lifecycle === 'executing' && (x.initialSnapshot === null || x.practice !== null || x.accounting !== null))
        fail('Executing has no final practice or accounting');
    if (x.lifecycle === 'execution_ended' && (x.initialSnapshot === null || x.practice === null || x.accounting !== null))
        fail('Execution ended retains final practice');
    if (x.lifecycle === 'closed' && x.accounting === null)
        fail('Closed retains accounting');
    if (x.initialSnapshot && !isCoachExecutionSnapshotForOpening(x.initialSnapshot, x.opening))
        fail('Foreign execution');
    if (x.latestRevision && (!x.initialSnapshot || !isCoachSessionPlanRevisionForSnapshot(x.latestRevision, x.initialSnapshot)))
        fail('Foreign revision');
    const snapshotId = x.initialSnapshot?.snapshotId ?? null;
    for (const record of [x.practice, x.accounting, ...x.measures])
        if (record && (!forOpening(record, x.opening) || record.snapshotId !== snapshotId))
            fail('Foreign evidence');
    if (x.practice !== null && x.initialSnapshot === null)
        fail('Practice requires execution');
    if (x.accounting && (!sameValue(x.accounting.practice, x.practice) || !sameValue(x.accounting.strategy, x.opening.program.strategy)))
        fail('Accounting and practice readback agree');
    if (x.projection && !sameValue(x.projection.strategy, x.opening.program.strategy))
        fail('Foreign projection');
    if (x.budget.status === 'known' && !sameCapabilityScope(x.budget.budget.scope, x.opening.scope))
        fail('Foreign budget');
    if (x.reservation && (!sameCapabilityScope(x.reservation.scope, x.opening.scope) || x.reservation.openingId !== x.opening.openingId))
        fail('Foreign reservation');
    const definitions = new Set(x.measureDefinitions.map(d => d.measureId + ':' + d.version));
    if (definitions.size !== x.measureDefinitions.length)
        fail('Duplicate definition');
    for (const measure of x.measures)
        if (!x.measureDefinitions.some(definition => isCoachMeasureForDefinition(measure, definition)))
            fail('Measure needs pinned matching definition');
});
//# sourceMappingURL=observations.js.map