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
//# sourceMappingURL=engine.d.ts.map