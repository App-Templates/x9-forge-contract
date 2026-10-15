import { z } from 'zod';
/** One alternative considered for a decision. */
export declare const DecisionAlternativeSchema: z.ZodObject<{
    label: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type DecisionAlternative = z.infer<typeof DecisionAlternativeSchema>;
export declare const DecisionCompletenessSchema: z.ZodEnum<{
    incomplete: "incomplete";
    denied: "denied";
    complete: "complete";
}>;
export type DecisionCompleteness = z.infer<typeof DecisionCompletenessSchema>;
/**
 * Structured decision response. Without evidence the response is incomplete;
 * `denied` must carry a reason, other states must not.
 */
export declare const DecisionResponseSchema: z.ZodObject<{
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
    decision: z.ZodString;
    alternatives: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strict>>;
    recommendation: z.ZodString;
    uncertainties: z.ZodArray<z.ZodString>;
    verifications: z.ZodArray<z.ZodString>;
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
    completeness: z.ZodEnum<{
        incomplete: "incomplete";
        denied: "denied";
        complete: "complete";
    }>;
    denialReason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type DecisionResponse = z.infer<typeof DecisionResponseSchema>;
//# sourceMappingURL=decision-response.d.ts.map