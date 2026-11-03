import { z } from 'zod';
import { CapabilityPersonScopeSchema } from "../capability-call-context.js";
import { CoachProgramIdSchema } from "./index.js";
import { RefId, SessionId, Text128, Instant } from "./shared.js";
export const CoachMeasureDefinitionSchema = z.object({
    measureId: CoachProgramIdSchema, version: Text128, unit: Text128, min: z.number().finite(), max: z.number().finite(),
}).strict().refine(x => x.min <= x.max, 'Ordered measure bounds');
const source = { sourceRef: Text128 };
const provenance = z.discriminatedUnion('source', [
    z.object({ source: z.literal('server-clock'), ...source }).strict(),
    z.object({ source: z.literal('self-report'), ...source }).strict(),
    z.object({ source: z.literal('strategy'), ...source, strategyId: CoachProgramIdSchema, strategyVersion: Text128 }).strict(),
]);
export const CoachMeasureObservationSchema = z.object({
    observationId: RefId, scope: CapabilityPersonScopeSchema, sessionId: SessionId, openingId: RefId, snapshotId: RefId.nullable(),
    measureId: CoachProgramIdSchema, definitionVersion: Text128, unit: Text128, observedAt: Instant, provenance,
    value: z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('known'), value: z.number().finite(), confidence: z.number().min(0).max(1).nullable() }).strict(),
        z.object({ kind: z.literal('unknown'), reason: Text128 }).strict(),
    ]),
}).strict();
export function isCoachMeasureForDefinition(raw, expected) {
    const observation = CoachMeasureObservationSchema.safeParse(raw), definition = CoachMeasureDefinitionSchema.safeParse(expected);
    if (!observation.success || !definition.success)
        return false;
    const o = observation.data, d = definition.data;
    return o.measureId === d.measureId && o.definitionVersion === d.version && o.unit === d.unit
        && (o.value.kind === 'unknown' || (o.value.value >= d.min && o.value.value <= d.max));
}
//# sourceMappingURL=measures.js.map