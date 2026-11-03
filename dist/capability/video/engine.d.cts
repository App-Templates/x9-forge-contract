import { z } from 'zod';
export declare const VideoProviderSchema: z.ZodEnum<{
    demo: "demo";
    minimax: "minimax";
    fal: "fal";
    byteplus: "byteplus";
}>;
export type VideoProvider = z.infer<typeof VideoProviderSchema>;
export declare const VideoEngineSettingsSchema: z.ZodObject<{
    aspectRatio: z.ZodEnum<{
        "9:16": "9:16";
        "16:9": "16:9";
        "1:1": "1:1";
    }>;
    provider: z.ZodEnum<{
        demo: "demo";
        minimax: "minimax";
        fal: "fal";
        byteplus: "byteplus";
    }>;
    durationSeconds: z.ZodNumber;
    sceneCount: z.ZodNumber;
    planner: z.ZodOptional<z.ZodString>;
    renderer: z.ZodOptional<z.ZodEnum<{
        ffmpeg: "ffmpeg";
        remotion: "remotion";
    }>>;
    frameProvider: z.ZodOptional<z.ZodEnum<{
        demo: "demo";
        minimax: "minimax";
        fal: "fal";
        byteplus: "byteplus";
    }>>;
    audioSource: z.ZodOptional<z.ZodEnum<{
        none: "none";
        track: "track";
        native: "native";
        mix: "mix";
    }>>;
}, z.core.$strict>;
export type VideoEngineSettings = z.infer<typeof VideoEngineSettingsSchema>;
/** One decided production job: the TypeScript facade owns identity, preset, budget and mode. */
export declare const VideoEngineJobSchema: z.ZodObject<{
    videoProjectId: z.ZodString;
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    requestedBy: z.ZodString;
    presetId: z.ZodString;
    settings: z.ZodObject<{
        aspectRatio: z.ZodEnum<{
            "9:16": "9:16";
            "16:9": "16:9";
            "1:1": "1:1";
        }>;
        provider: z.ZodEnum<{
            demo: "demo";
            minimax: "minimax";
            fal: "fal";
            byteplus: "byteplus";
        }>;
        durationSeconds: z.ZodNumber;
        sceneCount: z.ZodNumber;
        planner: z.ZodOptional<z.ZodString>;
        renderer: z.ZodOptional<z.ZodEnum<{
            ffmpeg: "ffmpeg";
            remotion: "remotion";
        }>>;
        frameProvider: z.ZodOptional<z.ZodEnum<{
            demo: "demo";
            minimax: "minimax";
            fal: "fal";
            byteplus: "byteplus";
        }>>;
        audioSource: z.ZodOptional<z.ZodEnum<{
            none: "none";
            track: "track";
            native: "native";
            mix: "mix";
        }>>;
    }, z.core.$strict>;
    budgetUsd: z.ZodNumber;
    mode: z.ZodEnum<{
        approval: "approval";
        autonomous: "autonomous";
    }>;
    name: z.ZodString;
    brief: z.ZodString;
    externalRef: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VideoEngineJob = z.infer<typeof VideoEngineJobSchema>;
export declare const VideoEngineJobResponseSchema: z.ZodObject<{
    engineProjectId: z.ZodString;
    status: z.ZodString;
}, z.core.$strict>;
export type VideoEngineJobResponse = z.infer<typeof VideoEngineJobResponseSchema>;
export declare const VideoProjectGetRequestSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    projectId: z.ZodString;
}, z.core.$strict>;
export type VideoProjectGetRequest = z.infer<typeof VideoProjectGetRequestSchema>;
/** Stages the facade drives on the engine, in production order. */
export declare const VideoEngineRunStageSchema: z.ZodEnum<{
    frames: "frames";
    clips: "clips";
    assemble: "assemble";
}>;
export type VideoEngineRunStage = z.infer<typeof VideoEngineRunStageSchema>;
export declare const VideoEngineApproveStageSchema: z.ZodEnum<{
    frames: "frames";
    plan: "plan";
    final: "final";
}>;
export type VideoEngineApproveStage = z.infer<typeof VideoEngineApproveStageSchema>;
export declare const VideoEngineRevisionSchema: z.ZodNumber;
export declare const VideoEnginePlanRequestSchema: z.ZodObject<{}, z.core.$strict>;
export declare const VideoEngineApproveRequestSchema: z.ZodObject<{
    stage: z.ZodEnum<{
        frames: "frames";
        plan: "plan";
        final: "final";
    }>;
    revision: z.ZodNumber;
}, z.core.$strict>;
export type VideoEngineApproveRequest = z.infer<typeof VideoEngineApproveRequestSchema>;
export declare const VideoEngineRunRequestSchema: z.ZodObject<{
    stage: z.ZodEnum<{
        frames: "frames";
        clips: "clips";
        assemble: "assemble";
    }>;
    revision: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type VideoEngineRunRequest = z.infer<typeof VideoEngineRunRequestSchema>;
/** Engine media path served behind the internal secret: `/media/<engineProjectId>/<file>`. */
export declare const VideoEngineMediaPathSchema: z.ZodString;
/**
 * The part of an engine project the facade reads. The engine answers with more fields: they pass
 * through untouched (the engine owns its full project document).
 */
export declare const VideoEngineProjectSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodString;
    revision: z.ZodNumber;
    scenes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        narration: z.ZodOptional<z.ZodString>;
        frame_prompt: z.ZodOptional<z.ZodString>;
        frame_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clip_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$loose>>;
    jobs: z.ZodArray<z.ZodObject<{
        stage: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$loose>>;
    output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    spent_usd: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
export type VideoEngineProject = z.infer<typeof VideoEngineProjectSchema>;
//# sourceMappingURL=engine.d.ts.map