import { z } from 'zod';
export declare const VIDEO_PRESET_FROM_VIDEO_TOOL = "video_preset_da_url";
/** Identity comes only from the admitted tool envelope (R-33). */
export declare const VideoPresetFromVideoToolInputSchema: z.ZodObject<{
    url: z.ZodString;
    name: z.ZodString;
}, z.core.$strict>;
export type VideoPresetFromVideoToolInput = z.infer<typeof VideoPresetFromVideoToolInputSchema>;
/** Polling uses the same job id returned when the analysis starts. */
export declare const VideoPresetFromVideoToolStatusInputSchema: z.ZodObject<{
    jobId: z.ZodString;
}, z.core.$strict>;
export type VideoPresetFromVideoToolStatusInput = z.infer<typeof VideoPresetFromVideoToolStatusInputSchema>;
export declare const VideoPresetFromVideoToolResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"avviato">;
    jobId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"rifiutato">;
    reason: z.ZodEnum<{
        motore_non_disponibile: "motore_non_disponibile";
        url_non_valida: "url_non_valida";
        video_troppo_lungo: "video_troppo_lungo";
        video_troppo_grande: "video_troppo_grande";
        rete_interna: "rete_interna";
        non_e_un_video: "non_e_un_video";
    }>;
    message: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"pronto">;
    presetId: z.ZodString;
    scenes: z.ZodNumber;
    studioUrl: z.ZodString;
}, z.core.$strict>], "status">;
export type VideoPresetFromVideoToolResponse = z.infer<typeof VideoPresetFromVideoToolResponseSchema>;
//# sourceMappingURL=preset-da-video-tool.d.ts.map