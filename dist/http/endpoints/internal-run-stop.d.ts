import { z } from 'zod';
export declare const INTERNAL_RUN_STOP_PATH: "/internal/runs/stop";
export declare const InternalRunStopRequestSchema: z.ZodObject<{
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    reason: z.ZodEnum<{
        error: "error";
        policy: "policy";
        budget: "budget";
        owner: "owner";
    }>;
}, z.core.$strict>;
export type InternalRunStopRequest = z.infer<typeof InternalRunStopRequestSchema>;
export declare const InternalRunStopResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    status: z.ZodLiteral<"accepted">;
}, z.core.$strict>, z.ZodObject<{
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    status: z.ZodLiteral<"already_stopped">;
}, z.core.$strict>, z.ZodObject<{
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    status: z.ZodLiteral<"unknown_run">;
}, z.core.$strict>], "status">;
export type InternalRunStopResponse = z.infer<typeof InternalRunStopResponseSchema>;
/** The server must authorize the caller against the stored run ownership. */
export declare const internalRunStopContract: {
    readonly method: "POST";
    readonly path: "/internal/runs/stop";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly bodySchema: z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        reason: z.ZodEnum<{
            error: "error";
            policy: "policy";
            budget: "budget";
            owner: "owner";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        status: z.ZodLiteral<"accepted">;
    }, z.core.$strict>, z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        status: z.ZodLiteral<"already_stopped">;
    }, z.core.$strict>, z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        status: z.ZodLiteral<"unknown_run">;
    }, z.core.$strict>], "status">;
};
//# sourceMappingURL=internal-run-stop.d.ts.map