import { z } from 'zod';
/** Acceptance acknowledges the request, not completion of the stop. */
export declare const RequestStopResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    status: z.ZodLiteral<"accepted">;
}, z.core.$strict>, z.ZodObject<{
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    status: z.ZodLiteral<"already_stopped">;
}, z.core.$strict>, z.ZodObject<{
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    status: z.ZodLiteral<"unknown_run">;
}, z.core.$strict>], "status">;
export type RequestStopResult = z.infer<typeof RequestStopResultSchema>;
/** A run receipt retains consumption uncertainty even after the run stops. */
export declare const RunReceiptSchema: z.ZodObject<{
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    state: z.ZodEnum<{
        settled: "settled";
        stopped: "stopped";
        running: "running";
        stop_requested: "stop_requested";
    }>;
    consumption: z.ZodObject<{
        unit: z.ZodEnum<{
            usd_micros: "usd_micros";
            tokens: "tokens";
            seconds: "seconds";
        }>;
        quantity: z.ZodNumber;
        state: z.ZodEnum<{
            unknown: "unknown";
            reserved: "reserved";
            settled: "settled";
        }>;
        estimated: z.ZodBoolean;
    }, z.core.$strict>;
    stopReason: z.ZodOptional<z.ZodEnum<{
        error: "error";
        policy: "policy";
        budget: "budget";
        owner: "owner";
    }>>;
    updatedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type RunReceipt = z.infer<typeof RunReceiptSchema>;
/** An absent limit means no cap is imposed for this unit; zero is a real cap. */
export declare const ConsumptionCapSchema: z.ZodObject<{
    unit: z.ZodEnum<{
        usd_micros: "usd_micros";
        tokens: "tokens";
        seconds: "seconds";
    }>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type ConsumptionCap = z.infer<typeof ConsumptionCapSchema>;
//# sourceMappingURL=run-receipt.d.ts.map