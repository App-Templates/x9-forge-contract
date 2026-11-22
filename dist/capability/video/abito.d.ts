import { z } from 'zod';
export declare const VIDEO_OUTFIT_MIN_SECONDS = 3;
export declare const VIDEO_OUTFIT_MAX_SECONDS = 15;
export declare const VIDEO_OUTFIT_MAX_BYTES: number;
export declare const VIDEO_OUTFIT_MEDIA_TYPES: readonly ["video/mp4", "video/quicktime"];
/** Same names as the engine's `outfit_adapter.OUTFIT_MODELS`. */
export declare const VideoOutfitModelSchema: z.ZodEnum<{
    "kling-4-edit": "kling-4-edit";
    "happy-horse": "happy-horse";
    "kling-o1-edit": "kling-o1-edit";
}>;
export type VideoOutfitModel = z.infer<typeof VideoOutfitModelSchema>;
export declare const VideoOutfitResolutionSchema: z.ZodEnum<{
    "720p": "720p";
    "1080p": "1080p";
}>;
export type VideoOutfitResolution = z.infer<typeof VideoOutfitResolutionSchema>;
/** The person's own video is the binary body; identity and production metadata are text query values. */
export declare const VideoOutfitProductionQuerySchema: z.ZodObject<{
    videoProjectId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    model: z.ZodEnum<{
        "kling-4-edit": "kling-4-edit";
        "happy-horse": "happy-horse";
        "kling-o1-edit": "kling-o1-edit";
    }>;
    resolution: z.ZodEnum<{
        "720p": "720p";
        "1080p": "1080p";
    }>;
    budgetUsd: z.ZodString;
    fileName: z.ZodString;
    agentId: z.ZodString;
    ownerId: z.ZodString;
    tenantId: z.ZodString;
}, z.core.$strict>;
export type VideoOutfitProductionQuery = z.infer<typeof VideoOutfitProductionQuerySchema>;
export declare const VideoOutfitProductionCreatedSchema: z.ZodObject<{
    engineProjectId: z.ZodString;
    sourceSha256: z.ZodString;
    durationSeconds: z.ZodNumber;
}, z.core.$strict>;
export type VideoOutfitProductionCreated = z.infer<typeof VideoOutfitProductionCreatedSchema>;
//# sourceMappingURL=abito.d.ts.map