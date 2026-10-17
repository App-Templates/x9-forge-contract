import { z } from 'zod';
import { type DevProductionProgress } from "../../capability/dev/production-progress.js";
/**
 * Read progress on demand, ordered by the domain snapshot sequence; no new event channel.
 * The backend authenticates the owner and compares path and scope with the persisted
 * record, returning only that snapshot. A poll neither enqueues work nor starts retries
 * nor certifies completion. Missing or foreign records produce a service-owned 404,
 * never a fabricated queued snapshot.
 */
export declare const getDevProductionProgressContract: {
    readonly method: "GET";
    readonly path: "/internal/capability/agents/:agentId/dev/jobs/:jobId/progress";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        jobId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
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
};
/**
 * Pure selector for out-of-order poll answers. Only snapshots that parse and correlate
 * with the expected job count; a strictly higher domain sequence replaces the current one
 * and updatedAt never decides precedence. It stores nothing and does not attest completion.
 */
export declare function selectDevProductionProgressSnapshot(rawCurrent: unknown, rawIncoming: unknown, expectedJob: unknown): DevProductionProgress | null;
//# sourceMappingURL=internal-dev-progress.d.ts.map