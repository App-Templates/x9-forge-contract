import { z } from 'zod';
/**
 * What the model writes when an agent calls `video_brief_create`: the brief without identity.
 * Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33), never from the model.
 */
export declare const VideoBriefToolInputSchema: z.ZodObject<{
    voice: z.ZodOptional<z.ZodString>;
    mode: z.ZodEnum<{
        approval: "approval";
        autonomous: "autonomous";
    }>;
    durationSeconds: z.ZodOptional<z.ZodNumber>;
    aspectRatio: z.ZodOptional<z.ZodEnum<{
        "9:16": "9:16";
        "16:9": "16:9";
        "1:1": "1:1";
    }>>;
    resolution: z.ZodOptional<z.ZodEnum<{
        "480p": "480p";
        "720p": "720p";
        "1080p": "1080p";
    }>>;
    approverEmail: z.ZodEmail;
    budgetUsd: z.ZodNumber;
    brief: z.ZodString;
    externalRef: z.ZodOptional<z.ZodString>;
    footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
    presetId: z.ZodString;
    requestedBy: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VideoBriefToolInput = z.infer<typeof VideoBriefToolInputSchema>;
/** Identity comes only from the admitted tool envelope (R-33). */
export declare const VideoPresetsListToolInputSchema: z.ZodObject<{}, z.core.$strict>;
export type VideoPresetsListToolInput = z.infer<typeof VideoPresetsListToolInputSchema>;
/** Number of archive shots used by a preset. */
export declare const VideoPresetFootageShotsSchema: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
export type VideoPresetFootageShots = z.infer<typeof VideoPresetFootageShotsSchema>;
export declare const VideoPresetSummarySchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    expectedCostUsd: z.ZodNumber;
    footageShots: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
}, z.core.$strict>;
export type VideoPresetSummary = z.infer<typeof VideoPresetSummarySchema>;
export declare const VideoPresetsListResponseSchema: z.ZodObject<{
    presets: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        expectedCostUsd: z.ZodNumber;
        footageShots: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoPresetsListResponse = z.infer<typeof VideoPresetsListResponseSchema>;
/** What the model writes when an agent calls `video_project_get`. */
export declare const VideoProjectGetToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoProjectGetToolInput = z.infer<typeof VideoProjectGetToolInputSchema>;
/** Revision of the script the regia wrote; a correction is always based on the one the person read. */
export declare const VideoScriptRevisionSchema: z.ZodNumber;
/**
 * What the model writes when an agent calls `video_script_revise`: new texts on the revision the person read.
 * No identity (from the envelope, R-33), no footage or graphic (they stay the regia's); absent `outro` keeps the old closing.
 */
export declare const VideoScriptReviseToolInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    basedOnRevision: z.ZodNumber;
    scenes: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
    outro: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        line: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VideoScriptReviseToolInput = z.infer<typeof VideoScriptReviseToolInputSchema>;
/** Production step inside a project state, for people and agents reading the project. */
export declare const VideoProjectStepSchema: z.ZodEnum<{
    failed: "failed";
    done: "done";
    queued: "queued";
    frames: "frames";
    clips: "clips";
    assemble: "assemble";
    plan: "plan";
    story: "story";
    review_sent: "review_sent";
    delivery_sent: "delivery_sent";
    regia: "regia";
}>;
export type VideoProjectStep = z.infer<typeof VideoProjectStepSchema>;
export declare const VideoScriptReviseResponseSchema: z.ZodObject<{
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
        story: "story";
        review_sent: "review_sent";
        delivery_sent: "delivery_sent";
        regia: "regia";
    }>;
    scriptRevision: z.ZodNumber;
}, z.core.$strict>;
export type VideoScriptReviseResponse = z.infer<typeof VideoScriptReviseResponseSchema>;
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
        story: "story";
        review_sent: "review_sent";
        delivery_sent: "delivery_sent";
        regia: "regia";
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
    choices: z.ZodOptional<z.ZodObject<{
        voice: z.ZodNullable<z.ZodString>;
        aspectRatio: z.ZodEnum<{
            "9:16": "9:16";
            "16:9": "16:9";
            "1:1": "1:1";
        }>;
        durationSeconds: z.ZodNumber;
        resolution: z.ZodNullable<z.ZodEnum<{
            "480p": "480p";
            "720p": "720p";
            "1080p": "1080p";
        }>>;
    }, z.core.$strict>>;
    scriptRevision: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strict>;
export type VideoProjectView = z.infer<typeof VideoProjectViewSchema>;
//# sourceMappingURL=tools.d.ts.map