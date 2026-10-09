import { z } from 'zod';
/** Shared management values initialize before model authority, preserving public module cycles. */
/** Caller-chosen idempotency key, unique per intended command (e.g. a UUID). */
export declare const AgentManagementRequestIdSchema: z.ZodString;
export type AgentManagementRequestId = z.infer<typeof AgentManagementRequestIdSchema>;
export declare const AgentManagementOutcomeSchema: z.ZodEnum<{
    error: "error";
    ok: "ok";
    unmanageable: "unmanageable";
}>;
export type AgentManagementOutcome = z.infer<typeof AgentManagementOutcomeSchema>;
export declare const AgentManagementOverallOutcomeSchema: z.ZodEnum<{
    error: "error";
    ok: "ok";
    partial: "partial";
    unmanageable: "unmanageable";
}>;
export type AgentManagementOverallOutcome = z.infer<typeof AgentManagementOverallOutcomeSchema>;
export declare const AgentManagementReasonCodeSchema: z.ZodEnum<{
    unknown: "unknown";
    "not-loaded": "not-loaded";
    "load-failed": "load-failed";
    "validation-failed": "validation-failed";
    timeout: "timeout";
    "source-unavailable": "source-unavailable";
    "shared-runtime": "shared-runtime";
    "externally-owned": "externally-owned";
    "not-supported": "not-supported";
    "in-progress": "in-progress";
}>;
export type AgentManagementReasonCode = z.infer<typeof AgentManagementReasonCodeSchema>;
/** `detail` is sanitized operator text: never secrets, tokens or personal data. */
export declare const AgentManagementReasonSchema: z.ZodObject<{
    code: z.ZodEnum<{
        unknown: "unknown";
        "not-loaded": "not-loaded";
        "load-failed": "load-failed";
        "validation-failed": "validation-failed";
        timeout: "timeout";
        "source-unavailable": "source-unavailable";
        "shared-runtime": "shared-runtime";
        "externally-owned": "externally-owned";
        "not-supported": "not-supported";
        "in-progress": "in-progress";
    }>;
    detail: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type AgentManagementReason = z.infer<typeof AgentManagementReasonSchema>;
/** Desired (saved) vs applied (effective) configuration version of one agent. */
export declare const AgentConfigVersionStateSchema: z.ZodObject<{
    desired: z.ZodNumber;
    applied: z.ZodNullable<z.ZodNumber>;
    failed: z.ZodNullable<z.ZodObject<{
        version: z.ZodNumber;
        reason: z.ZodObject<{
            code: z.ZodEnum<{
                unknown: "unknown";
                "not-loaded": "not-loaded";
                "load-failed": "load-failed";
                "validation-failed": "validation-failed";
                timeout: "timeout";
                "source-unavailable": "source-unavailable";
                "shared-runtime": "shared-runtime";
                "externally-owned": "externally-owned";
                "not-supported": "not-supported";
                "in-progress": "in-progress";
            }>;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type AgentConfigVersionState = z.infer<typeof AgentConfigVersionStateSchema>;
/** ok: all ok · unmanageable: none manageable · error: none ok · partial: some ok, some not. */
export declare function deriveAgentManagementOutcome(results: ReadonlyArray<{
    readonly outcome: AgentManagementOutcome;
}>): AgentManagementOverallOutcome;
//# sourceMappingURL=agent-model-management-values.d.ts.map