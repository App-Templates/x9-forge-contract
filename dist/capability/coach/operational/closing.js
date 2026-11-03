import { z } from 'zod';
import { CoachPracticeObservationSchema, CoachSessionAccountingSchema } from "../accounting.js";
import { CoachMeasureObservationSchema } from "../measures.js";
import { CoachOperationalCommandMetadataSchema, result, forOpening, sameValue } from "./common.js";
import { CoachProgramInputEnvelopeSchema, CoachProgramProjectionSchema } from "./conversation.js";
export const CoachGuideEndRequestSchema = CoachOperationalCommandMetadataSchema;
export const CoachGuideEndResultSchema = z.object({
    ...result, done: z.boolean(), remainingSeconds: z.number().int().nonnegative(), practice: CoachPracticeObservationSchema.nullable(),
}).strict().refine(x => x.done ? x.remainingSeconds === 0 && x.practice !== null && forOpening(x.practice, x.opening)
    : x.remainingSeconds > 0 && x.practice === null, 'Guide end requires server-observed practice or remaining time');
export const CoachSessionCloseRequestSchema = CoachOperationalCommandMetadataSchema.extend({ conclusion: CoachProgramInputEnvelopeSchema.nullable() }).strict();
export const CoachSessionCloseResultSchema = z.object({
    ...result, accounting: CoachSessionAccountingSchema, measures: z.array(CoachMeasureObservationSchema).max(500), projection: CoachProgramProjectionSchema.nullable(),
}).strict().refine(x => forOpening(x.accounting, x.opening) && sameValue(x.accounting.strategy, x.opening.program.strategy)
    && (x.projection === null || sameValue(x.projection.strategy, x.opening.program.strategy))
    && x.measures.every(measure => forOpening(measure, x.opening) && measure.snapshotId === x.accounting.snapshotId), 'Close preserves opening, snapshot and pinned strategy');
//# sourceMappingURL=closing.js.map