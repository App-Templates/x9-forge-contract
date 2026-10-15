import { z } from 'zod';
/** Shared capability dispatch URL; consumers must not duplicate the route literal. */
export declare const CapToolCallParamsSchema: z.ZodObject<{
    tool: z.ZodString;
}, z.core.$strip>;
/** agent-core -> capability, authenticated by INTERNAL_SECRET_HEADER. */
export declare const capToolCallContract: {
    readonly method: "POST";
    readonly path: "/call/:tool";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        tool: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        callId: z.ZodString;
        tool: z.ZodString;
        input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        agentId: z.ZodString;
        sessionId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        organization: z.ZodOptional<z.ZodObject<{
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
            tenantId: z.ZodString;
        }, z.core.$strict>>;
        tenantId: z.ZodOptional<z.ZodString>;
        ownerId: z.ZodOptional<z.ZodString>;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
        personRef: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        callId: z.ZodString;
        status: z.ZodLiteral<"success">;
        output: z.ZodUnknown;
        receipt: z.ZodOptional<z.ZodObject<{
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            callId: z.ZodString;
            status: z.ZodEnum<{
                succeeded: "succeeded";
                failed: "failed";
                uncertain: "uncertain";
            }>;
            consumption: z.ZodArray<z.ZodObject<{
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
            }, z.core.$strict>>;
            evidence: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    log: "log";
                    artifact: "artifact";
                    commit: "commit";
                    document: "document";
                    metric: "metric";
                }>;
                ref: z.ZodString;
                sha256: z.ZodOptional<z.ZodString>;
                grantsRead: z.ZodLiteral<false>;
            }, z.core.$strict>>;
            failureCode: z.ZodOptional<z.ZodString>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strip>, z.ZodObject<{
        callId: z.ZodString;
        status: z.ZodLiteral<"error">;
        error: z.ZodString;
        code: z.ZodEnum<{
            TOOL_NOT_FOUND: "TOOL_NOT_FOUND";
            TOOL_CALL_INVALID: "TOOL_CALL_INVALID";
            TOOL_EXEC_FAILED: "TOOL_EXEC_FAILED";
        }>;
        receipt: z.ZodOptional<z.ZodObject<{
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            attemptId: z.ZodString;
            callId: z.ZodString;
            status: z.ZodEnum<{
                succeeded: "succeeded";
                failed: "failed";
                uncertain: "uncertain";
            }>;
            consumption: z.ZodArray<z.ZodObject<{
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
            }, z.core.$strict>>;
            evidence: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    log: "log";
                    artifact: "artifact";
                    commit: "commit";
                    document: "document";
                    metric: "metric";
                }>;
                ref: z.ZodString;
                sha256: z.ZodOptional<z.ZodString>;
                grantsRead: z.ZodLiteral<false>;
            }, z.core.$strict>>;
            failureCode: z.ZodOptional<z.ZodString>;
            recordedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strip>], "status">;
};
export declare function capToolCallPath(tool: string): string;
//# sourceMappingURL=cap-tool-call.d.ts.map