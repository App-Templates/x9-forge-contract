import { z } from 'zod';
/** Same ceiling as the outfit description in abito.ts. */
export declare const VIDEO_OUTFIT_STYLE_MAX_REQUEST = 300;
export declare const VIDEO_OUTFIT_STYLE_MAX_DESCRIPTION = 500;
export declare const VideoOutfitStyleRequestSchema: z.ZodObject<{
    request: z.ZodString;
}, z.core.$strict>;
export type VideoOutfitStyleRequest = z.infer<typeof VideoOutfitStyleRequestSchema>;
/** How completely the character's style rules backed the composed outfit. */
export declare const VideoOutfitStyleRulesSchema: z.ZodEnum<{
    complete: "complete";
    senza_regole: "senza_regole";
    senza_stile: "senza_stile";
}>;
export type VideoOutfitStyleRules = z.infer<typeof VideoOutfitStyleRulesSchema>;
/** `constraints` are Parallel's wardrobeRules, verbatim and in the same type. */
export declare const VideoOutfitStyleResultSchema: z.ZodObject<{
    description: z.ZodString;
    constraints: z.ZodArray<z.ZodString>;
    rules: z.ZodEnum<{
        complete: "complete";
        senza_regole: "senza_regole";
        senza_stile: "senza_stile";
    }>;
}, z.core.$strict>;
export type VideoOutfitStyleResult = z.infer<typeof VideoOutfitStyleResultSchema>;
//# sourceMappingURL=abito-stile.d.ts.map