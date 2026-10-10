"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachMeasureObservationSchema = exports.CoachMeasureDefinitionSchema = void 0;
exports.isCoachMeasureForDefinition = isCoachMeasureForDefinition;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const index_js_1 = require("./index.cjs");
const shared_js_1 = require("./shared.cjs");
exports.CoachMeasureDefinitionSchema = zod_1.z.object({
    measureId: index_js_1.CoachProgramIdSchema, version: shared_js_1.Text128, unit: shared_js_1.Text128, min: zod_1.z.number().finite(), max: zod_1.z.number().finite(),
}).strict().refine(x => x.min <= x.max, 'Ordered measure bounds');
const source = { sourceRef: shared_js_1.Text128 };
const provenance = zod_1.z.discriminatedUnion('source', [
    zod_1.z.object({ source: zod_1.z.literal('server-clock'), ...source }).strict(),
    zod_1.z.object({ source: zod_1.z.literal('self-report'), ...source }).strict(),
    zod_1.z.object({ source: zod_1.z.literal('strategy'), ...source, strategyId: index_js_1.CoachProgramIdSchema, strategyVersion: shared_js_1.Text128 }).strict(),
]);
exports.CoachMeasureObservationSchema = zod_1.z.object({
    observationId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityPersonScopeSchema, sessionId: shared_js_1.SessionId, openingId: shared_js_1.RefId, snapshotId: shared_js_1.RefId.nullable(),
    measureId: index_js_1.CoachProgramIdSchema, definitionVersion: shared_js_1.Text128, unit: shared_js_1.Text128, observedAt: shared_js_1.Instant, provenance,
    value: zod_1.z.discriminatedUnion('kind', [
        zod_1.z.object({ kind: zod_1.z.literal('known'), value: zod_1.z.number().finite(), confidence: zod_1.z.number().min(0).max(1).nullable() }).strict(),
        zod_1.z.object({ kind: zod_1.z.literal('unknown'), reason: shared_js_1.Text128 }).strict(),
    ]),
}).strict();
function isCoachMeasureForDefinition(raw, expected) {
    const observation = exports.CoachMeasureObservationSchema.safeParse(raw), definition = exports.CoachMeasureDefinitionSchema.safeParse(expected);
    if (!observation.success || !definition.success)
        return false;
    const o = observation.data, d = definition.data;
    return o.measureId === d.measureId && o.definitionVersion === d.version && o.unit === d.unit
        && (o.value.kind === 'unknown' || (o.value.value >= d.min && o.value.value <= d.max));
}
//# sourceMappingURL=measures.js.map