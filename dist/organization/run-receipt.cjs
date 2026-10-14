"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumptionCapSchema = exports.RunReceiptSchema = exports.RequestStopResultSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
const operations_js_1 = require("./operations.cjs");
const run_outcome_js_1 = require("./run-outcome.cjs");
/** Acceptance acknowledges the request, not completion of the stop. */
exports.RequestStopResultSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ runId: run_context_js_1.RunIdSchema, status: zod_1.z.literal('accepted') }),
    zod_1.z.strictObject({ runId: run_context_js_1.RunIdSchema, status: zod_1.z.literal('already_stopped') }),
    zod_1.z.strictObject({ runId: run_context_js_1.RunIdSchema, status: zod_1.z.literal('unknown_run') }),
]);
/** A run receipt retains consumption uncertainty even after the run stops. */
exports.RunReceiptSchema = zod_1.z.strictObject({
    runId: run_context_js_1.RunIdSchema,
    state: zod_1.z.enum(['running', 'stop_requested', 'stopped', 'settled']),
    consumption: run_outcome_js_1.ConsumptionSchema,
    stopReason: operations_js_1.StopReasonSchema.optional(),
    updatedAt: zod_1.z.iso.datetime(),
});
/** An absent limit means no cap is imposed for this unit; zero is a real cap. */
exports.ConsumptionCapSchema = zod_1.z.strictObject({
    unit: run_outcome_js_1.ConsumptionSchema.shape.unit,
    limit: zod_1.z.number().int().min(0).optional(),
});
//# sourceMappingURL=run-receipt.js.map