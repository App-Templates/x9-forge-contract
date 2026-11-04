import { z } from 'zod';
export declare const VideoEngineErrorSchema: z.ZodObject<{
    error: z.ZodString;
    operation_state: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        uncertain: "uncertain";
        pending: "pending";
        rejected: "rejected";
    }>>>;
    code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export type VideoEngineError = z.infer<typeof VideoEngineErrorSchema>;
export declare const VideoEngineHealthSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    ffmpeg: z.ZodBoolean;
    ffprobe: z.ZodBoolean;
    paid_enabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$loose>;
export type VideoEngineHealth = z.infer<typeof VideoEngineHealthSchema>;
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
export declare const VideoEngineIdSchema: z.ZodString;
/** Stages the engine route accepts on run; the facade drives a subset (`VideoEngineRunStageSchema`). */
export declare const VideoEngineRouteRunStageSchema: z.ZodEnum<{
    voice: "voice";
    frames: "frames";
    clips: "clips";
    assemble: "assemble";
    animatic: "animatic";
}>;
export type VideoEngineRouteRunStage = z.infer<typeof VideoEngineRouteRunStageSchema>;
/** Stages the engine route accepts on approve; the facade drives a subset (`VideoEngineApproveStageSchema`). */
export declare const VideoEngineRouteApproveStageSchema: z.ZodEnum<{
    voice: "voice";
    frames: "frames";
    plan: "plan";
    final: "final";
    references: "references";
}>;
export type VideoEngineRouteApproveStage = z.infer<typeof VideoEngineRouteApproveStageSchema>;
/** Whole plan body of the engine route; the facade sends `{}` (`VideoEnginePlanRequestSchema`). */
export declare const VideoEngineRoutePlanRequestSchema: z.ZodObject<{
    quote_id: z.ZodOptional<z.ZodString>;
    retry_authorization_id: z.ZodOptional<z.ZodString>;
    revision: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type VideoEngineRoutePlanRequest = z.infer<typeof VideoEngineRoutePlanRequestSchema>;
/** Whole approve body of the engine route; the facade body is a subset of it. */
export declare const VideoEngineRouteApproveRequestSchema: z.ZodObject<{
    stage: z.ZodEnum<{
        voice: "voice";
        frames: "frames";
        plan: "plan";
        final: "final";
        references: "references";
    }>;
    revision: z.ZodNumber;
}, z.core.$strict>;
export type VideoEngineRouteApproveRequest = z.infer<typeof VideoEngineRouteApproveRequestSchema>;
/**
 * Whole run body of the engine route; the facade body is a subset of it. The uniqueness of `scene_ids`
 * is checked by the engine (`officina/pipeline.py:1730`): no `refine` here, the portable catalog would block it.
 */
export declare const VideoEngineRouteRunRequestSchema: z.ZodObject<{
    stage: z.ZodEnum<{
        voice: "voice";
        frames: "frames";
        clips: "clips";
        assemble: "assemble";
        animatic: "animatic";
    }>;
    scene_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    revision: z.ZodOptional<z.ZodNumber>;
    quote_id: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VideoEngineRouteRunRequest = z.infer<typeof VideoEngineRouteRunRequestSchema>;
/** Engine media path served behind the internal secret: `/media/<engineProjectId>/<file>`. */
export declare const VideoEngineMediaPathSchema: z.ZodString;
export declare const VideoEngineStoryStatusSchema: z.ZodEnum<{
    failed: "failed";
    completed: "completed";
    queued: "queued";
    running: "running";
    interrupted: "interrupted";
}>;
export type VideoEngineStoryStatus = z.infer<typeof VideoEngineStoryStatusSchema>;
/** Stato della story scritto dal motore (`officina/story_op.py`); gli altri campi passano. */
export declare const VideoEngineStoryStateSchema: z.ZodObject<{
    status: z.ZodEnum<{
        failed: "failed";
        completed: "completed";
        queued: "queued";
        running: "running";
        interrupted: "interrupted";
    }>;
    step: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$loose>;
export type VideoEngineStoryState = z.infer<typeof VideoEngineStoryStateSchema>;
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
    story: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        status: z.ZodEnum<{
            failed: "failed";
            completed: "completed";
            queued: "queued";
            running: "running";
            interrupted: "interrupted";
        }>;
        step: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        output_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export type VideoEngineProject = z.infer<typeof VideoEngineProjectSchema>;
//# sourceMappingURL=engine.d.ts.map