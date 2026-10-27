import { z } from 'zod';
/**
 * Admitted context of one capability tool call: the trusted run context, the
 * attempt the call belongs to and the tenant. The attempt must be of the same run.
 */
export declare const OrganizationToolCallContextSchema: z.ZodObject<{
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
    tenantId: z.ZodString;
}, z.core.$strict>;
export type OrganizationToolCallContext = z.infer<typeof OrganizationToolCallContextSchema>;
/** Run admitted for a capability tool call, as agent-core forwards it beside the strict call body: the trusted context plus the admitting tenant. */
export declare const OrganizationRunEnvelopeSchema: z.ZodObject<{
    context: z.ZodObject<{
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
    tenantId: z.ZodString;
}, z.core.$strict>;
export type OrganizationRunEnvelope = z.infer<typeof OrganizationRunEnvelopeSchema>;
/**
 * Receipt of a single tool call (callId is distinct from attemptId). An uncertain
 * call is never reported as succeeded; a failed call carries its failureCode.
 */
export declare const ToolCallReceiptSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type ToolCallReceipt = z.infer<typeof ToolCallReceiptSchema>;
//# sourceMappingURL=tool-call-correlation.d.ts.map