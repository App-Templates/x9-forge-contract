import { z } from 'zod';
export declare const ExperimentStatusSchema: z.ZodEnum<{
    proposed: "proposed";
    running: "running";
    abandoned: "abandoned";
    concluded: "concluded";
}>;
export type ExperimentStatus = z.infer<typeof ExperimentStatusSchema>;
/**
 * An experiment: hypothesis, proof/domain version, baseline and success
 * criterion. `conclusion` is required if and only if the experiment is
 * concluded; an abandoned experiment must say why (`reason`).
 */
export declare const ExperimentSchema: z.ZodObject<{
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
    experimentId: z.ZodString;
    hypothesisRef: z.ZodString;
    domainVersionRef: z.ZodObject<{
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
    corpus: z.ZodOptional<z.ZodObject<{
        corpusId: z.ZodString;
        scenarios: z.ZodArray<z.ZodObject<{
            scenarioId: z.ZodString;
            version: z.ZodNumber;
            contentSha256: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    criterionRef: z.ZodString;
    status: z.ZodEnum<{
        proposed: "proposed";
        running: "running";
        abandoned: "abandoned";
        concluded: "concluded";
    }>;
    conclusion: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type Experiment = z.infer<typeof ExperimentSchema>;
//# sourceMappingURL=experiment.d.ts.map