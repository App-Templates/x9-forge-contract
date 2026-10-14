"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalRunStopContract = exports.InternalRunStopResponseSchema = exports.InternalRunStopRequestSchema = exports.INTERNAL_RUN_STOP_PATH = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
const operations_js_1 = require("../../organization/operations.cjs");
const run_receipt_js_1 = require("../../organization/run-receipt.cjs");
exports.INTERNAL_RUN_STOP_PATH = '/internal/runs/stop';
exports.InternalRunStopRequestSchema = zod_1.z.strictObject({
    runId: run_context_js_1.RunIdSchema,
    reason: operations_js_1.StopReasonSchema,
});
exports.InternalRunStopResponseSchema = run_receipt_js_1.RequestStopResultSchema;
/** The server must authorize the caller against the stored run ownership. */
exports.internalRunStopContract = {
    method: 'POST',
    path: exports.INTERNAL_RUN_STOP_PATH,
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: exports.InternalRunStopRequestSchema,
    responseSchema: exports.InternalRunStopResponseSchema,
};
//# sourceMappingURL=internal-run-stop.js.map