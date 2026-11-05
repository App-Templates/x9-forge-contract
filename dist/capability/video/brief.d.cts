import { z } from 'zod';
export declare const VideoModeSchema: z.ZodEnum<{
    approval: "approval";
    autonomous: "autonomous";
}>;
export type VideoMode = z.infer<typeof VideoModeSchema>;
export declare const VideoPresetIdSchema: z.ZodString;
export type VideoPresetId = z.infer<typeof VideoPresetIdSchema>;
export declare const VideoAspectRatioSchema: z.ZodEnum<{
    "9:16": "9:16";
    "16:9": "16:9";
    "1:1": "1:1";
}>;
export type VideoAspectRatio = z.infer<typeof VideoAspectRatioSchema>;
export declare const VideoResolutionSchema: z.ZodEnum<{
    "480p": "480p";
    "720p": "720p";
    "1080p": "1080p";
}>;
export type VideoResolution = z.infer<typeof VideoResolutionSchema>;
/** Id of a voice of the preset catalogue (e.g. `stefano-pro`, `marco`), never the provider's id. */
export declare const VideoVoiceIdSchema: z.ZodString;
export type VideoVoiceId = z.infer<typeof VideoVoiceIdSchema>;
export declare const VIDEO_DURATION_SECONDS_MIN = 5;
export declare const VIDEO_DURATION_SECONDS_MAX = 180;
export declare const VideoDurationSecondsSchema: z.ZodNumber;
export type VideoDurationSeconds = z.infer<typeof VideoDurationSecondsSchema>;
/** The choices of one request, already resolved with the preset (null: the preset has no such choice). */
export declare const VideoRequestChoicesSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type VideoRequestChoices = z.infer<typeof VideoRequestChoicesSchema>;
export declare const VideoBriefRequestSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    requestedBy: z.ZodString;
    approverEmail: z.ZodEmail;
    presetId: z.ZodString;
    mode: z.ZodEnum<{
        approval: "approval";
        autonomous: "autonomous";
    }>;
    budgetUsd: z.ZodNumber;
    brief: z.ZodString;
    externalRef: z.ZodOptional<z.ZodString>;
    footage: z.ZodOptional<z.ZodArray<z.ZodString>>;
    voice: z.ZodOptional<z.ZodString>;
    aspectRatio: z.ZodOptional<z.ZodEnum<{
        "9:16": "9:16";
        "16:9": "16:9";
        "1:1": "1:1";
    }>>;
    durationSeconds: z.ZodOptional<z.ZodNumber>;
    resolution: z.ZodOptional<z.ZodEnum<{
        "480p": "480p";
        "720p": "720p";
        "1080p": "1080p";
    }>>;
}, z.core.$strict>;
export type VideoBriefRequest = z.infer<typeof VideoBriefRequestSchema>;
export declare const VideoProjectIdSchema: z.ZodString;
export type VideoProjectId = z.infer<typeof VideoProjectIdSchema>;
export declare const VideoProjectStateSchema: z.ZodEnum<{
    failed: "failed";
    created: "created";
    delivered: "delivered";
    planning: "planning";
    awaiting_approval: "awaiting_approval";
    producing: "producing";
}>;
export type VideoProjectState = z.infer<typeof VideoProjectStateSchema>;
export declare const VideoBriefResponseSchema: z.ZodObject<{
    projectId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        created: "created";
        delivered: "delivered";
        planning: "planning";
        awaiting_approval: "awaiting_approval";
        producing: "producing";
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
}, z.core.$strict>;
export type VideoBriefResponse = z.infer<typeof VideoBriefResponseSchema>;
//# sourceMappingURL=brief.d.ts.map