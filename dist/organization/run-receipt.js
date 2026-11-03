import { z } from 'zod';
import { RunIdSchema } from "./run-context.js";
import { StopReasonSchema } from "./operations.js";
import { ConsumptionSchema } from "./run-outcome.js";
/** Acceptance acknowledges the request, not completion of the stop. */
export const RequestStopResultSchema = z.discriminatedUnion('status', [
    z.strictObject({ runId: RunIdSchema, status: z.literal('accepted') }),
    z.strictObject({ runId: RunIdSchema, status: z.literal('already_stopped') }),
    z.strictObject({ runId: RunIdSchema, status: z.literal('unknown_run') }),
]);
/** A run receipt retains consumption uncertainty even after the run stops. */
export const RunReceiptSchema = z.strictObject({
    runId: RunIdSchema,
    state: z.enum(['running', 'stop_requested', 'stopped', 'settled']),
    consumption: ConsumptionSchema,
    stopReason: StopReasonSchema.optional(),
    updatedAt: z.iso.datetime(),
});
/** An absent limit means no cap is imposed for this unit; zero is a real cap. */
export const ConsumptionCapSchema = z.strictObject({
    unit: ConsumptionSchema.shape.unit,
    limit: z.number().int().min(0).optional(),
});
//# sourceMappingURL=run-receipt.js.map