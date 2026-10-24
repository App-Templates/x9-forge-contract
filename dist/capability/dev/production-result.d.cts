import { z } from 'zod';
/** Opaque authorized references, never machine paths or signed download URLs. */
export declare const DevProductionArtifactSchema: z.ZodObject<{
    artifactRef: z.ZodString;
    mediaType: z.ZodString;
    bytes: z.ZodNumber;
    sha256: z.ZodString;
    fileName: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type DevProductionArtifact = z.infer<typeof DevProductionArtifactSchema>;
/** References identify evidence; the service must verify the corresponding authorized records. */
export declare const DevProductionResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    jobId: z.ZodString;
    requestId: z.ZodString;
    projectId: z.ZodString;
    sessionId: z.ZodString;
    productKind: z.ZodEnum<{
        code: "code";
        design: "design";
        presentation: "presentation";
        automation: "automation";
    }>;
    reportVersion: z.ZodNumber;
    reportDigest: z.ZodString;
    finishedAt: z.ZodISODateTime;
    status: z.ZodLiteral<"succeeded">;
    artifacts: z.ZodArray<z.ZodObject<{
        artifactRef: z.ZodString;
        mediaType: z.ZodString;
        bytes: z.ZodNumber;
        sha256: z.ZodString;
        fileName: z.ZodOptional<z.ZodString>;
        displayName: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    delivery: z.ZodOptional<z.ZodObject<{
        summary: z.ZodString;
        instructions: z.ZodString;
        primaryArtifactRef: z.ZodString;
    }, z.core.$strict>>;
    verification: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"tests">;
        passed: z.ZodNumber;
        total: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"visual_review">;
        previewRef: z.ZodString;
        reviewRef: z.ZodString;
        ownerAcceptanceRef: z.ZodString;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>, z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    jobId: z.ZodString;
    requestId: z.ZodString;
    projectId: z.ZodString;
    sessionId: z.ZodString;
    productKind: z.ZodEnum<{
        code: "code";
        design: "design";
        presentation: "presentation";
        automation: "automation";
    }>;
    reportVersion: z.ZodNumber;
    reportDigest: z.ZodString;
    finishedAt: z.ZodISODateTime;
    status: z.ZodEnum<{
        failed: "failed";
        cancelled: "cancelled";
        uncertain: "uncertain";
        blocked: "blocked";
    }>;
    reason: z.ZodString;
}, z.core.$strict>], "status">;
export type DevProductionResult = z.infer<typeof DevProductionResultSchema>;
/** Correlation only: this does not attest execution, evidence records or permission to retry. */
export declare function isDevProductionResultForJob(raw: unknown, expectedJob: unknown): boolean;
//# sourceMappingURL=production-result.d.ts.map