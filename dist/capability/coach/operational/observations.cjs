"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachOperationalSessionReadSchema = exports.CoachUsageObserveResultSchema = exports.CoachUsageObserveRequestSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability-call-context.cjs");
const execution_js_1 = require("../execution.cjs");
const accounting_js_1 = require("../accounting.cjs");
const measures_js_1 = require("../measures.cjs");
const shared_js_1 = require("../shared.cjs");
const opening_js_1 = require("./opening.cjs");
const conversation_js_1 = require("./conversation.cjs");
const common_js_1 = require("./common.cjs");
exports.CoachUsageObserveRequestSchema = zod_1.z.object({
    requestId: shared_js_1.RefId, opening: execution_js_1.CoachSessionOpeningRefSchema, expectedUsageRevision: common_js_1.RevisionNumber.nullable(), observation: accounting_js_1.CoachProviderUsageSchema,
}).strict().refine(x => (0, common_js_1.forOpening)(x.observation, x.opening), 'Usage belongs to original opening');
exports.CoachUsageObserveResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), requestId: shared_js_1.RefId, replayed: zod_1.z.boolean(), usage: accounting_js_1.CoachProviderUsageSchema,
    usageRevision: common_js_1.RevisionNumber.positive(), budget: opening_js_1.CoachOperationalBudgetStateSchema, reservation: opening_js_1.CoachReservationSchema.nullable(),
}).strict().refine(x => (x.budget.status === 'unknown' || (0, capability_call_context_js_1.sameCapabilityScope)(x.usage.scope, x.budget.budget.scope))
    && (x.reservation === null || ((0, capability_call_context_js_1.sameCapabilityScope)(x.reservation.scope, x.usage.scope) && x.reservation.openingId === x.usage.openingId)), 'Usage readback retains original person and reservation');
exports.CoachOperationalSessionReadSchema = zod_1.z.object({
    opening: execution_js_1.CoachSessionOpeningRefSchema, revision: common_js_1.RevisionNumber, lifecycle: zod_1.z.enum(['opened', 'executing', 'execution_ended', 'closed']),
    practice: accounting_js_1.CoachPracticeObservationSchema.nullable(), measureDefinitions: zod_1.z.array(measures_js_1.CoachMeasureDefinitionSchema).max(500),
    initialSnapshot: execution_js_1.CoachSessionExecutionSnapshotSchema.nullable(), latestRevision: execution_js_1.CoachSessionPlanRevisionSchema.nullable(),
    projection: conversation_js_1.CoachProgramProjectionSchema.nullable(), measures: zod_1.z.array(measures_js_1.CoachMeasureObservationSchema).max(500),
    accounting: accounting_js_1.CoachSessionAccountingSchema.nullable(), budget: opening_js_1.CoachOperationalBudgetStateSchema, reservation: opening_js_1.CoachReservationSchema.nullable(),
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
    if (x.initialSnapshot && !(0, execution_js_1.isCoachExecutionSnapshotForOpening)(x.initialSnapshot, x.opening))
        fail('Foreign execution');
    if (x.latestRevision && (!x.initialSnapshot || !(0, execution_js_1.isCoachSessionPlanRevisionForSnapshot)(x.latestRevision, x.initialSnapshot)))
        fail('Foreign revision');
    const snapshotId = x.initialSnapshot?.snapshotId ?? null;
    for (const record of [x.practice, x.accounting, ...x.measures])
        if (record && (!(0, common_js_1.forOpening)(record, x.opening) || record.snapshotId !== snapshotId))
            fail('Foreign evidence');
    if (x.practice !== null && x.initialSnapshot === null)
        fail('Practice requires execution');
    if (x.accounting && (!(0, common_js_1.sameValue)(x.accounting.practice, x.practice) || !(0, common_js_1.sameValue)(x.accounting.strategy, x.opening.program.strategy)))
        fail('Accounting and practice readback agree');
    if (x.projection && !(0, common_js_1.sameValue)(x.projection.strategy, x.opening.program.strategy))
        fail('Foreign projection');
    if (x.budget.status === 'known' && !(0, capability_call_context_js_1.sameCapabilityScope)(x.budget.budget.scope, x.opening.scope))
        fail('Foreign budget');
    if (x.reservation && (!(0, capability_call_context_js_1.sameCapabilityScope)(x.reservation.scope, x.opening.scope) || x.reservation.openingId !== x.opening.openingId))
        fail('Foreign reservation');
    const definitions = new Set(x.measureDefinitions.map(d => d.measureId + ':' + d.version));
    if (definitions.size !== x.measureDefinitions.length)
        fail('Duplicate definition');
    for (const measure of x.measures)
        if (!x.measureDefinitions.some(definition => (0, measures_js_1.isCoachMeasureForDefinition)(measure, definition)))
            fail('Measure needs pinned matching definition');
});
//# sourceMappingURL=observations.js.map