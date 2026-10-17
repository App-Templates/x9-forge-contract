import { z } from 'zod';
import { type ApprovalBindings } from "../approvals/index.cjs";
export declare const DevProductionKindSchema: z.ZodEnum<{
    code: "code";
    presentation: "presentation";
    design: "design";
    automation: "automation";
}>;
export type DevProductionKind = z.infer<typeof DevProductionKindSchema>;
/** Additive job domain; it does not change the signed command v2 protocol. */
export declare const DevProductionJobSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    jobId: z.ZodString;
    requestId: z.ZodString;
    projectId: z.ZodString;
    session: z.ZodObject<{
        scope: z.ZodLazy<z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>>;
        sessionId: z.ZodString;
        target: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"local">;
            deviceId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"cloud">;
            connectionRef: z.ZodString;
        }, z.core.$strict>], "kind">;
        engines: z.ZodArray<z.ZodEnum<{
            claude: "claude";
            codex: "codex";
        }>>;
    }, z.core.$strict>;
    productKind: z.ZodEnum<{
        code: "code";
        presentation: "presentation";
        design: "design";
        automation: "automation";
    }>;
    instruction: z.ZodString;
    roleModels: z.ZodOptional<z.ZodObject<{
        coordination: z.ZodObject<{
            engine: z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>;
            modelId: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        planning: z.ZodObject<{
            engine: z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>;
            modelId: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        unblocking: z.ZodObject<{
            engine: z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>;
            modelId: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        code: z.ZodObject<{
            engine: z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>;
            modelId: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        design: z.ZodObject<{
            engine: z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>;
            modelId: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        presentation: z.ZodObject<{
            engine: z.ZodEnum<{
                claude: "claude";
                codex: "codex";
            }>;
            modelId: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    reportVersion: z.ZodNumber;
    reportDigest: z.ZodString;
    configVersion: z.ZodNumber;
    keyVersion: z.ZodNumber;
    limits: z.ZodObject<{
        maxDurationSeconds: z.ZodNumber;
        maxAttempts: z.ZodNumber;
        maxTasks: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type DevProductionJob = z.infer<typeof DevProductionJobSchema>;
/**
 * S3 must compute/compare reportDigest as SHA-256 of this string's UTF-8 bytes
 * before A11 verification and before effects. A supplied digest is not authoritative;
 * this reversible report format neither signs the job nor replaces the A11 verifier.
 */
export declare function canonicalizeDevProductionReport(rawJob: unknown): string;
/**
 * The service must compute and verify the report digest over text, limits and destination
 * before every effect. These bindings identify that snapshot; the bridge does not attest it.
 * Scope and requestId are already canonical fields of the A11 permit.
 */
export declare function devProductionApprovalBindings(raw: unknown): ApprovalBindings;
/** Automation is delivered as code; decks and design use the selected session. */
export declare function devProductionExecutionMode(raw: unknown): 'night' | 'session';
//# sourceMappingURL=production-job.d.ts.map