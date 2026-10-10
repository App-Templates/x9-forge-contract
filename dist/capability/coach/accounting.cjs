"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachSessionAccountingSchema = exports.CoachPracticeObservationSchema = exports.CoachProviderUsageSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const program_version_js_1 = require("./program-version.cjs");
const shared_js_1 = require("./shared.cjs");
const reference = { scope: capability_call_context_js_1.CapabilityPersonScopeSchema, sessionId: shared_js_1.SessionId, openingId: shared_js_1.RefId, snapshotId: shared_js_1.RefId.nullable() };
const duration = zod_1.z.number().finite().nonnegative();
exports.CoachProviderUsageSchema = zod_1.z.object({
    usageId: shared_js_1.RefId, ...reference, providerConversationId: shared_js_1.Text128, callStartedAt: shared_js_1.Instant, callEndedAt: shared_js_1.Instant,
    billableSeconds: duration.nullable(), durationSeconds: duration.nullable(),
    source: zod_1.z.enum(['provider-report', 'transcript-lower-bound', 'estimate', 'pending', 'unavailable']),
    sourceRef: shared_js_1.Text128.nullable(), confidence: zod_1.z.number().min(0).max(1).nullable(), observedAt: shared_js_1.Instant,
}).strict().superRefine((x, ctx) => {
    const fail = (message) => ctx.addIssue({ code: 'custom', message });
    if (Date.parse(x.callEndedAt) < Date.parse(x.callStartedAt) || Date.parse(x.observedAt) < Date.parse(x.callEndedAt))
        fail('Ordered usage timestamps');
    if (x.source !== 'provider-report' && x.billableSeconds !== null)
        fail('Only provider report can declare billing');
    if (x.source === 'pending' || x.source === 'unavailable') {
        if (x.durationSeconds !== null || x.confidence !== null)
            fail('Unknown usage has no numeric duration or confidence');
    }
    else if (x.durationSeconds === null || x.sourceRef === null)
        fail('Observed usage needs duration and source');
});
exports.CoachPracticeObservationSchema = zod_1.z.object({
    observationId: shared_js_1.RefId, ...reference, snapshotId: shared_js_1.RefId, startedAt: shared_js_1.Instant, endedAt: shared_js_1.Instant,
    guidedSeconds: duration, wakeSeconds: duration,
}).strict().refine(x => x.guidedSeconds + x.wakeSeconds <= (Date.parse(x.endedAt) - Date.parse(x.startedAt)) / 1000, 'Practice is bounded by server elapsed time');
exports.CoachSessionAccountingSchema = zod_1.z.object({
    ...reference, usage: exports.CoachProviderUsageSchema.nullable(), practice: exports.CoachPracticeObservationSchema.nullable(),
    outcome: zod_1.z.enum(['completed', 'interrupted', 'abandoned']), progressionCredit: zod_1.z.boolean(), strategy: program_version_js_1.CoachStrategyRefSchema,
}).strict().superRefine((x, ctx) => {
    const fail = (message) => ctx.addIssue({ code: 'custom', message });
    if (x.progressionCredit && (x.outcome !== 'completed' || x.snapshotId === null || x.practice === null))
        fail('Credit needs completed guided practice');
    if (x.snapshotId === null && (x.practice !== null || x.progressionCredit))
        fail('Pre-guide accounting has no practice or credit');
    for (const child of [x.usage, x.practice])
        if (child && (!(0, capability_call_context_js_1.sameCapabilityScope)(child.scope, x.scope) || child.sessionId !== x.sessionId || child.openingId !== x.openingId || child.snapshotId !== x.snapshotId))
            fail('Accounting evidence belongs to the same opening and snapshot');
});
//# sourceMappingURL=accounting.js.map