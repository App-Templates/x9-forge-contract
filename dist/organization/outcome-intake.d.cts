import { z } from 'zod';
/** Experiment outcome intake; references carry no private research content. */
export declare const OutcomeIntakeSchema: z.ZodObject<{
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
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    experimentId: z.core.$ZodBranded<z.ZodString, "ExperimentId", "out">;
    /** Reference to the hypothesis, never its private text. */
    hypothesisRef: z.ZodString;
    baselineRef: z.ZodObject<{
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
    }, z.core.$strict>;
    resultRef: z.ZodObject<{
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
    }, z.core.$strict>;
    sameDenominator: z.ZodBoolean;
    /** Reference to the criterion fixed before observing the result. */
    criterionRef: z.ZodString;
    verdict: z.ZodEnum<{
        confirmed: "confirmed";
        refuted: "refuted";
        inconclusive: "inconclusive";
    }>;
}, z.core.$strict>;
export type OutcomeIntake = z.infer<typeof OutcomeIntakeSchema>;
//# sourceMappingURL=outcome-intake.d.ts.map