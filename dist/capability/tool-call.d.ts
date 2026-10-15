import { z } from 'zod';
/**
 * Request sent by X9 agent-core to a capability service.
 *
 * Endpoint: POST /call/:tool — mounted at the capability service root
 * (e.g. `http://cap-news:3000/call/news_digest`). The capability identity is
 * conveyed by the caller's `baseUrl`, not a path prefix — each X9 capability
 * service registers `app.post("/call/<toolName>", ...)` directly at root
 * (see `agent-x9/services/cap-<name>/src/tools/`).
 *
 * Auth: X-Internal-Secret (platform secret) — typed in Phase 3 auth contracts.
 *
 * `credentials`: per-request vault credentials injected by Forge at dispatch
 * time. Optional: not all capability calls require credentials.
 */
export declare const ToolCallRequestSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type ToolCallRequest = z.infer<typeof ToolCallRequestSchema>;
export declare const ToolCallSuccessResponseSchema: z.ZodObject<{
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
}, z.core.$strip>;
export declare const ToolCallErrorResponseSchema: z.ZodObject<{
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
}, z.core.$strip>;
/**
 * Discriminated union on `status`. Use `.parse()` at the X9 tool-router
 * response boundary to catch silent contract violations at compile time.
 *
 * Phase 3 note: This schema is the compile-time enforcement for Bug #15
 * (silent 401 that was never caught because no type-level contract existed).
 */
export declare const ToolCallResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type ToolCallSuccessResponse = z.infer<typeof ToolCallSuccessResponseSchema>;
export type ToolCallErrorResponse = z.infer<typeof ToolCallErrorResponseSchema>;
export type ToolCallResponse = z.infer<typeof ToolCallResponseSchema>;
//# sourceMappingURL=tool-call.d.ts.map