import { z } from 'zod';
export declare const INTERNAL_RUN_NATIVE_STOP_PATH: "/internal/runs/native-stop";
export declare const InternalRunNativeStopRequestSchema: z.ZodObject<{
    organizationRun: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        organizationId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        personRef: z.ZodOptional<z.ZodString>;
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    attempt: z.ZodObject<{
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
        attemptNumber: z.ZodNumber;
        startedAt: z.ZodISODateTime;
        idempotencyKey: z.ZodString;
    }, z.core.$strict>;
    reason: z.ZodEnum<{
        error: "error";
        policy: "policy";
        budget: "budget";
        owner: "owner";
    }>;
}, z.core.$strict>;
export type InternalRunNativeStopRequest = z.infer<typeof InternalRunNativeStopRequestSchema>;
/** Unconfirmed cancellation must never be promoted to cancelled. */
export declare const InternalRunNativeStopResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"cancelled">;
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    attemptId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"not_started">;
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    attemptId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"already_finished">;
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    attemptId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"unconfirmed">;
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    attemptId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"unknown_run">;
    runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
    attemptId: z.ZodString;
}, z.core.$strict>], "status">;
export type InternalRunNativeStopResponse = z.infer<typeof InternalRunNativeStopResponseSchema>;
/** Authority derives from the persisted attempt owner, never a caller-supplied boolean. */
export declare const internalRunNativeStopContract: {
    readonly method: "POST";
    readonly path: "/internal/runs/native-stop";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly bodySchema: z.ZodObject<{
        organizationRun: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            personRef: z.ZodOptional<z.ZodString>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        attempt: z.ZodObject<{
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            attemptNumber: z.ZodNumber;
            startedAt: z.ZodISODateTime;
            idempotencyKey: z.ZodString;
        }, z.core.$strict>;
        reason: z.ZodEnum<{
            error: "error";
            policy: "policy";
            budget: "budget";
            owner: "owner";
        }>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"cancelled">;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"not_started">;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"already_finished">;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unconfirmed">;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unknown_run">;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        attemptId: z.ZodString;
    }, z.core.$strict>], "status">;
};
//# sourceMappingURL=internal-run-native-stop.d.ts.map