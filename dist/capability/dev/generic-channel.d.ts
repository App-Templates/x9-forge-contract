import { z } from 'zod';
import { type DevGenericJob } from "./generic-job.js";
/** One registered device claims work for one owner, using only its supported tools. */
export declare const DevGenericClaimRequestSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    executorId: z.ZodString;
    executor: z.ZodEnum<{
        laptop: "laptop";
        server: "server";
    }>;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    capabilities: z.ZodArray<z.ZodString>;
    tools: z.ZodArray<z.ZodEnum<{
        mlx_whisper: "mlx_whisper";
        claude_p: "claude_p";
    }>>;
}, z.core.$strict>;
export type DevGenericClaimRequest = z.infer<typeof DevGenericClaimRequestSchema>;
export declare const DevGenericLeaseSchema: z.ZodObject<{
    leaseId: z.ZodString;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DevGenericLease = z.infer<typeof DevGenericLeaseSchema>;
export declare const DevGenericClaimResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        }>;
        executor: z.ZodEnum<{
            laptop: "laptop";
            server: "server";
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
export type DevGenericClaimResponse = z.infer<typeof DevGenericClaimResponseSchema>;
export declare const DevGenericHeartbeatRequestSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    executorId: z.ZodString;
    leaseId: z.ZodString;
}, z.core.$strict>;
export type DevGenericHeartbeatRequest = z.infer<typeof DevGenericHeartbeatRequestSchema>;
export declare const DevGenericHeartbeatResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"extended">;
    expiresAt: z.ZodISODateTime;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"lease_expired">;
}, z.core.$strict>], "status">;
export type DevGenericHeartbeatResponse = z.infer<typeof DevGenericHeartbeatResponseSchema>;
export declare const DevGenericCompleteRequestSchema: z.ZodObject<{
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
export type DevGenericCompleteRequest = z.infer<typeof DevGenericCompleteRequestSchema>;
export declare const DevGenericCompleteResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"accepted">;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"lease_expired">;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rejected">;
    error: z.ZodLiteral<"result_mismatch">;
}, z.core.$strict>], "status">;
export type DevGenericCompleteResponse = z.infer<typeof DevGenericCompleteResponseSchema>;
export type DevGenericClaimSelection = {
    ok: true;
    empty: true;
} | {
    ok: true;
    empty: false;
    job: DevGenericJob;
    lease: DevGenericLease;
} | {
    ok: false;
    error: 'invalid_response' | 'foreign_scope' | 'capability_not_requested' | 'tool_not_requested' | 'wrong_executor';
};
/**
 * Correlate a parsed response with the owner's request; foreign work is an error,
 * never an empty queue. This does not verify signatures, ownership or lease freshness.
 */
export declare function selectDevGenericClaim(rawResponse: unknown, expectedRequest: DevGenericClaimRequest): DevGenericClaimSelection;
//# sourceMappingURL=generic-channel.d.ts.map