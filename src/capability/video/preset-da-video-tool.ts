import { z } from 'zod';
import {
  VideoPresetFromVideoJobSchema,
  VideoPresetVideoUrlSchema,
  VideoUserPresetIdSchema,
  VideoUserPresetSchema,
} from './preset-da-video.js';

export const VIDEO_PRESET_FROM_VIDEO_TOOL = 'video_preset_da_url';

/** Identity comes only from the admitted tool envelope (R-33). */
export const VideoPresetFromVideoToolInputSchema = z.strictObject({
  url: VideoPresetVideoUrlSchema,
  name: z.string().trim().min(1).max(80),
});
export type VideoPresetFromVideoToolInput = z.infer<typeof VideoPresetFromVideoToolInputSchema>;

/** Polling uses the same job id returned when the analysis starts. */
export const VideoPresetFromVideoToolStatusInputSchema = z.strictObject({
  jobId: VideoPresetFromVideoJobSchema.shape.jobId,
});
export type VideoPresetFromVideoToolStatusInput = z.infer<typeof VideoPresetFromVideoToolStatusInputSchema>;

export const VideoPresetFromVideoToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.literal('avviato'),
    jobId: VideoPresetFromVideoJobSchema.shape.jobId,
  }),
  z.strictObject({
    status: z.literal('rifiutato'),
    reason: z.enum([
      'url_non_valida',
      'video_troppo_lungo',
      'video_troppo_grande',
      'rete_interna',
      'non_e_un_video',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
  z.strictObject({
    status: z.literal('pronto'),
    presetId: VideoUserPresetIdSchema,
    scenes: VideoUserPresetSchema.shape.source.shape.sceneCount,
    studioUrl: z.string(),
  }),
]);
export type VideoPresetFromVideoToolResponse = z.infer<typeof VideoPresetFromVideoToolResponseSchema>;
