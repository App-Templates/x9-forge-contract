import { z } from 'zod';
/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export declare const officinaVideoJobContract: {
    readonly method: "POST";
    readonly path: "/api/jobs";
    readonly paramsSchema: z.ZodObject<{}, z.core.$strict>;
    readonly requestSchema: z.ZodObject<{
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
    readonly responseSchema: z.ZodObject<{
        engineProjectId: z.ZodString;
        status: z.ZodString;
    }, z.core.$strict>;
};
/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export declare const officinaVideoHealthContract: {
    readonly method: "GET";
    readonly path: "/api/health";
    readonly paramsSchema: z.ZodObject<{}, z.core.$strict>;
};
//# sourceMappingURL=officina-video.d.ts.map