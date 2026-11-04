import { z } from 'zod';
/**
 * What the model writes when an agent calls `video_brief_create`: the brief without identity.
 * Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33), never from the model.
 */
export declare const VideoBriefToolInputSchema: z.ZodObject<{
    mode: z.ZodEnum<{
        approval: "approval";
        autonomous: "autonomous";
    }>;
    presetId: z.ZodString;
    approverEmail: z.ZodEmail;
    budgetUsd: z.ZodNumber;
    brief: z.ZodString;
    externalRef: z.ZodOptional<z.ZodString>;
    footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
    requestedBy: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VideoBriefToolInput = z.infer<typeof VideoBriefToolInputSchema>;
/** What the model writes when an agent calls `video_project_get`. */
export declare const VideoProjectGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoProjectGetToolInput = z.infer<typeof VideoProjectGetToolInputSchema>;
/** Production step inside a project state, for people and agents reading the project. */
export declare const VideoProjectStepSchema: z.ZodEnum<{
    failed: "failed";
    done: "done";
    queued: "queued";
    frames: "frames";
    clips: "clips";
    assemble: "assemble";
    plan: "plan";
    review_sent: "review_sent";
    delivery_sent: "delivery_sent";
    regia: "regia";
    story: "story";
}>;
export type VideoProjectStep = z.infer<typeof VideoProjectStepSchema>;
/** One project as the owning agent sees it: state, step and the two links of the two emails. */
export declare const VideoProjectViewSchema: z.ZodObject<{
    projectId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        created: "created";
        delivered: "delivered";
        planning: "planning";
        awaiting_approval: "awaiting_approval";
        producing: "producing";
    }>;
    step: z.ZodEnum<{
        failed: "failed";
        done: "done";
        queued: "queued";
        frames: "frames";
        clips: "clips";
        assemble: "assemble";
        plan: "plan";
        review_sent: "review_sent";
        delivery_sent: "delivery_sent";
        regia: "regia";
        story: "story";
    }>;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    presetId: z.ZodString;
    mode: z.ZodEnum<{
        approval: "approval";
        autonomous: "autonomous";
    }>;
    budgetUsd: z.ZodNumber;
    spentUsd: z.ZodNumber;
    reviewUrl: z.ZodOptional<z.ZodURL>;
    videoUrl: z.ZodOptional<z.ZodURL>;
    error: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strict>;
export type VideoProjectView = z.infer<typeof VideoProjectViewSchema>;
//# sourceMappingURL=tools.d.ts.map