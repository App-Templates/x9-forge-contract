import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { RunIdSchema } from "../../organization/run-context.js";
import { StopReasonSchema } from "../../organization/operations.js";
import { RequestStopResultSchema } from "../../organization/run-receipt.js";
export const INTERNAL_RUN_STOP_PATH = '/internal/runs/stop';
export const InternalRunStopRequestSchema = z.strictObject({
    runId: RunIdSchema,
    reason: StopReasonSchema,
});
export const InternalRunStopResponseSchema = RequestStopResultSchema;
/** The server must authorize the caller against the stored run ownership. */
export const internalRunStopContract = {
    method: 'POST',
    path: INTERNAL_RUN_STOP_PATH,
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    bodySchema: InternalRunStopRequestSchema,
    responseSchema: InternalRunStopResponseSchema,
};
//# sourceMappingURL=internal-run-stop.js.map