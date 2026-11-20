import { z } from 'zod';
/**
 * For every route the service verifies the device signature and nonce and checks
 * that the device is registered for this tenant and owner, including server devices.
 * Body executorId must match the signed device; jobId and leaseId must refer to the
 * persisted assignment for that device. Header validation alone is not authentication.
 * The service never leases the same job to two executors while its lease is alive,
 * never revives an expired lease with a heartbeat, and chooses all expiry timestamps.
 * On completion it compares the result with the stored job using
 * devGenericResultMatchesJob, rejecting mismatches as result_mismatch.
 */
export declare const claimDevGenericJobContract: {
    readonly method: "POST";
    readonly path: "/connect/generic-jobs/claim";
    readonly authType: "device_signature";
    readonly headersSchema: z.ZodObject<{
        "X-X9-Device": z.ZodString;
        "X-X9-Device-Timestamp": z.ZodString;
        "X-X9-Device-Nonce": z.ZodString;
        "X-X9-Device-Signature": z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        version: z.ZodLiteral<1>;
        executorId: z.ZodString;
        executor: z.ZodEnum<{
            server: "server";
            laptop: "laptop";
        }>;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        capabilities: z.ZodArray<z.ZodString>;
        tools: z.ZodArray<z.ZodEnum<{
            mlx_whisper: "mlx_whisper";
            claude_p: "claude_p";
            ig_collect: "ig_collect";
        }>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"empty">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"job">;
        job: z.ZodObject<{
            version: z.ZodLiteral<1>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            jobId: z.ZodString;
            capability: z.ZodString;
            kind: z.ZodString;
            tool: z.ZodEnum<{
                mlx_whisper: "mlx_whisper";
                claude_p: "claude_p";
                ig_collect: "ig_collect";
            }>;
            executor: z.ZodEnum<{
                server: "server";
                laptop: "laptop";
            }>;
            input: z.ZodRecord<z.ZodString, z.ZodJSONSchema>;
            configVersion: z.ZodNumber;
            limits: z.ZodObject<{
                maxDurationSeconds: z.ZodNumber;
                maxAttempts: z.ZodNumber;
            }, z.core.$strict>;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>;
        lease: z.ZodObject<{
            leaseId: z.ZodString;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>], "status">;
};
/** Device and owner checks and lease rules documented on claimDevGenericJobContract apply. */
export declare const heartbeatDevGenericJobContract: {
    readonly method: "POST";
    readonly path: "/connect/generic-jobs/:jobId/heartbeat";
    readonly authType: "device_signature";
    readonly headersSchema: z.ZodObject<{
        "X-X9-Device": z.ZodString;
        "X-X9-Device-Timestamp": z.ZodString;
        "X-X9-Device-Nonce": z.ZodString;
        "X-X9-Device-Signature": z.ZodString;
    }, z.core.$strip>;
    readonly paramsSchema: z.ZodObject<{
        jobId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        version: z.ZodLiteral<1>;
        executorId: z.ZodString;
        leaseId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"extended">;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"lease_expired">;
    }, z.core.$strict>], "status">;
};
/** Device and owner checks, lease rules and result correlation documented above apply. */
export declare const completeDevGenericJobContract: {
    readonly method: "POST";
    readonly path: "/connect/generic-jobs/:jobId/complete";
    readonly authType: "device_signature";
    readonly headersSchema: z.ZodObject<{
        "X-X9-Device": z.ZodString;
        "X-X9-Device-Timestamp": z.ZodString;
        "X-X9-Device-Nonce": z.ZodString;
        "X-X9-Device-Signature": z.ZodString;
    }, z.core.$strip>;
    readonly paramsSchema: z.ZodObject<{
        jobId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        version: z.ZodLiteral<1>;
        executorId: z.ZodString;
        leaseId: z.ZodString;
        result: z.ZodObject<{
            version: z.ZodLiteral<1>;
            jobId: z.ZodString;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            tool: z.ZodEnum<{
                mlx_whisper: "mlx_whisper";
                claude_p: "claude_p";
                ig_collect: "ig_collect";
            }>;
            state: z.ZodEnum<{
                failed: "failed";
                done: "done";
            }>;
            output: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodJSONSchema>>;
            error: z.ZodOptional<z.ZodString>;
            durationSeconds: z.ZodNumber;
            finishedAt: z.ZodISODateTime;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"accepted">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"lease_expired">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"rejected">;
        error: z.ZodLiteral<"result_mismatch">;
    }, z.core.$strict>], "status">;
};
//# sourceMappingURL=dev-generic-jobs.d.ts.map