import { z } from 'zod';
import { VideoParallelStyleSchema } from './personaggio-parallel.js';

/** Same ceiling as the outfit description in abito.ts. */
export const VIDEO_OUTFIT_STYLE_MAX_REQUEST = 300;
export const VIDEO_OUTFIT_STYLE_MAX_DESCRIPTION = 500;

export const VideoOutfitStyleRequestSchema = z.strictObject({
  request: z.string().trim().min(1).max(VIDEO_OUTFIT_STYLE_MAX_REQUEST),
});
export type VideoOutfitStyleRequest = z.infer<typeof VideoOutfitStyleRequestSchema>;

/** How completely the character's style rules backed the composed outfit. */
export const VideoOutfitStyleRulesSchema = z.enum(['complete', 'senza_regole', 'senza_stile']);
export type VideoOutfitStyleRules = z.infer<typeof VideoOutfitStyleRulesSchema>;

/** `constraints` are Parallel's wardrobeRules, verbatim and in the same type. */
export const VideoOutfitStyleResultSchema = z.strictObject({
  description: z.string().trim().min(1).max(VIDEO_OUTFIT_STYLE_MAX_DESCRIPTION),
  constraints: VideoParallelStyleSchema.shape.wardrobeRules.unwrap(),
  rules: VideoOutfitStyleRulesSchema,
});
export type VideoOutfitStyleResult = z.infer<typeof VideoOutfitStyleResultSchema>;
