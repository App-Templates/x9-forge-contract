import { z } from 'zod';
/** requestId identifies the original production request, not a new permit. */
export declare const DevProductionCancelRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    requestId: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type DevProductionCancelRequest = z.infer<typeof DevProductionCancelRequestSchema>;
/** Acknowledges the stop request only; final state, costs and effects are separate reads. */
export declare const DevProductionCancelReceiptSchema: z.ZodObject<{
    jobId: z.ZodString;
    requestId: z.ZodString;
    status: z.ZodLiteral<"stop_requested">;
    requestedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DevProductionCancelReceipt = z.infer<typeof DevProductionCancelReceiptSchema>;
/**
 * The service authenticates the owner and compares scope, path and original requestId
 * with the persisted job. It owns idempotency and stop propagation, and must not
 * requeue uncertain work. Receipt does not mean cancellation has completed.
 * This contract neither invokes night nor consumes A11 nor authorizes new production;
 * jobId is never a native runId and the signed command v2 stop remains separate.
 */
export declare const cancelDevProductionJobContract: {
    readonly method: "POST";
    readonly path: "/internal/capability/agents/:agentId/dev/jobs/:jobId/cancel";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        jobId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        requestId: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        jobId: z.ZodString;
        requestId: z.ZodString;
        status: z.ZodLiteral<"stop_requested">;
        requestedAt: z.ZodISODateTime;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-dev-cancel.d.ts.map