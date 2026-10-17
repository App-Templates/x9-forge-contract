import { z } from 'zod';
/** Informational snapshot; the service owns sequence monotonicity across snapshots.
 * Completing all tasks does not attest success: the production result still needs evidence.
 */
export declare const DevProductionProgressSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    jobId: z.ZodString;
    requestId: z.ZodString;
    projectId: z.ZodString;
    reportVersion: z.ZodNumber;
    reportDigest: z.ZodString;
    sequence: z.ZodNumber;
    updatedAt: z.ZodISODateTime;
    phase: z.ZodEnum<{
        queued: "queued";
        running: "running";
        blocked: "blocked";
        stopping: "stopping";
    }>;
    message: z.ZodString;
    tasks: z.ZodObject<{
        completed: z.ZodNumber;
        total: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type DevProductionProgress = z.infer<typeof DevProductionProgressSchema>;
/** Correlation only; neither execution nor permission nor success is attested. */
export declare function isDevProductionProgressForJob(raw: unknown, expectedJob: unknown): boolean;
//# sourceMappingURL=production-progress.d.ts.map