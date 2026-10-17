"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalRunNativeStopContract = exports.InternalRunNativeStopResponseSchema = exports.InternalRunNativeStopRequestSchema = exports.INTERNAL_RUN_NATIVE_STOP_PATH = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
const run_outcome_js_1 = require("../../organization/run-outcome.cjs");
const operations_js_1 = require("../../organization/operations.cjs");
exports.INTERNAL_RUN_NATIVE_STOP_PATH = '/internal/runs/native-stop';
exports.InternalRunNativeStopRequestSchema = zod_1.z
    .strictObject({
    organizationRun: run_context_js_1.OrganizationRunContextSchema,
    attempt: run_outcome_js_1.RunAttemptSchema,
    reason: operations_js_1.StopReasonSchema,
})
    .refine((request) => request.attempt.runId === request.organizationRun.runId, {
    message: 'attempt.runId must match organizationRun.runId',
    path: ['attempt', 'runId'],
});
const responseBase = {
    runId: run_context_js_1.RunIdSchema,
    attemptId: run_outcome_js_1.RunAttemptSchema.shape.attemptId,
};
/** Unconfirmed cancellation must never be promoted to cancelled. */
exports.InternalRunNativeStopResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ ...responseBase, status: zod_1.z.literal('cancelled') }),
    zod_1.z.strictObject({ ...responseBase, status: zod_1.z.literal('not_started') }),
    zod_1.z.strictObject({ ...responseBase, status: zod_1.z.literal('already_finished') }),
    zod_1.z.strictObject({ ...responseBase, status: zod_1.z.literal('unconfirmed') }),
    zod_1.z.strictObject({ ...responseBase, status: zod_1.z.literal('unknown_run') }),
]);
/** Authority derives from the persisted attempt owner, never a caller-supplied boolean. */
exports.internalRunNativeStopContract = {
    method: 'POST',
    path: exports.INTERNAL_RUN_NATIVE_STOP_PATH,
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: exports.InternalRunNativeStopRequestSchema,
    responseSchema: exports.InternalRunNativeStopResponseSchema,
};
//# sourceMappingURL=internal-run-native-stop.js.map