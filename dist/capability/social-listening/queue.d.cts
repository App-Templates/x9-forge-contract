import { z } from 'zod';
/** The pipeline of one round: collect posts, transcribe, filter, verify, group into topics. */
export declare const SOCIAL_JOB_KINDS: readonly ["collect", "transcribe", "filter", "verify", "group"];
export declare const SocialJobKindSchema: z.ZodEnum<{
    group: "group";
    filter: "filter";
    collect: "collect";
    transcribe: "transcribe";
    verify: "verify";
}>;
export type SocialJobKind = z.infer<typeof SocialJobKindSchema>;
export declare const SOCIAL_JOB_STATES: readonly ["queued", "running", "done", "failed", "cancelled"];
export declare const SocialJobStateSchema: z.ZodEnum<{
    failed: "failed";
    cancelled: "cancelled";
    done: "done";
    queued: "queued";
    running: "running";
}>;
export type SocialJobState = z.infer<typeof SocialJobStateSchema>;
/** One job of the queue. Tenant, owner and agent on every row (R-33). */
export declare const SocialJobSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    jobId: z.ZodUUID;
    kind: z.ZodEnum<{
        group: "group";
        filter: "filter";
        collect: "collect";
        transcribe: "transcribe";
        verify: "verify";
    }>;
    state: z.ZodEnum<{
        failed: "failed";
        cancelled: "cancelled";
        done: "done";
        queued: "queued";
        running: "running";
    }>;
    track: z.ZodEnum<{
        server: "server";
        mac: "mac";
    }>;
    day: z.ZodString;
    verticalId: z.ZodString;
    postId: z.ZodOptional<z.ZodString>;
    topicId: z.ZodOptional<z.ZodString>;
    attempts: z.ZodNumber;
    createdAt: z.ZodISODateTime;
    updatedAt: z.ZodISODateTime;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type SocialJob = z.infer<typeof SocialJobSchema>;
export declare const SOCIAL_ROUND_STATES: readonly ["scheduled", "running", "done", "failed", "cap_reached"];
export declare const SocialRoundStateSchema: z.ZodEnum<{
    failed: "failed";
    done: "done";
    running: "running";
    scheduled: "scheduled";
    cap_reached: "cap_reached";
}>;
export type SocialRoundState = z.infer<typeof SocialRoundStateSchema>;
/** State of the day's round for one vertical (D9, D20). */
export declare const SocialRoundSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    verticalId: z.ZodString;
    day: z.ZodString;
    track: z.ZodEnum<{
        server: "server";
        mac: "mac";
    }>;
    state: z.ZodEnum<{
        failed: "failed";
        done: "done";
        running: "running";
        scheduled: "scheduled";
        cap_reached: "cap_reached";
    }>;
    scheduledFor: z.ZodISODateTime;
    startedAt: z.ZodOptional<z.ZodISODateTime>;
    finishedAt: z.ZodOptional<z.ZodISODateTime>;
    handedToServerAt: z.ZodOptional<z.ZodISODateTime>;
    postsSeen: z.ZodNumber;
    topicsCount: z.ZodNumber;
    spentUsd: z.ZodNumber;
    capUsd: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type SocialRound = z.infer<typeof SocialRoundSchema>;
//# sourceMappingURL=queue.d.ts.map