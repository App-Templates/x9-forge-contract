import { z } from 'zod';
import { VIDEO_LONG_MAX_CHAPTERS, VideoLongStepSchema, VideoLongProjectIdSchema } from './lungo.js';

export const VideoCostUnitSchema = z.enum(['token', 'char', 'second', 'image', 'clip']);
export type VideoCostUnit = z.infer<typeof VideoCostUnitSchema>;

export const VideoCostBasisSchema = z.enum(['misurato', 'stimato', 'non-misurato']);
export type VideoCostBasis = z.infer<typeof VideoCostBasisSchema>;

export const VideoCostModelSchema = z.strictObject({
  step: VideoLongStepSchema,
  provider: z.string().min(1).max(64),
  model: z.string().min(1).max(100),
  quantity: z.number().min(0).finite(),
  unit: VideoCostUnitSchema,
  costUsd: z.number().min(0).finite(),
  basis: VideoCostBasisSchema,
});
export type VideoCostModel = z.infer<typeof VideoCostModelSchema>;

export const VideoCostChapterSchema = z.strictObject({
  chapterIndex: z.number().int().min(1).max(VIDEO_LONG_MAX_CHAPTERS),
  costUsd: z.number().min(0).finite(),
  seconds: z.number().int().min(0).nullable(),
  usdPerMinute: z.number().min(0).finite().nullable(),
});
export type VideoCostChapter = z.infer<typeof VideoCostChapterSchema>;

export const VideoCostEntrySchema = VideoCostModelSchema.extend({
  chapterIndex: VideoCostChapterSchema.shape.chapterIndex.optional(),
  at: z.string().min(1).max(40),
});
export type VideoCostEntry = z.infer<typeof VideoCostEntrySchema>;

export const VideoCostStepSchema = z.strictObject({
  step: VideoLongStepSchema,
  estimatedUsd: z.number().min(0).finite(),
  confirmedUsd: z.number().min(0).finite(),
  entries: z.array(VideoCostEntrySchema).max(200),
});
export type VideoCostStep = z.infer<typeof VideoCostStepSchema>;

/**
 * The engine keeps usdPerMinute null until a finished video is available,
 * and never uses zero to represent a missing cost.
 */
export const VideoCostByStepSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema,
  steps: z.array(VideoCostStepSchema).max(5),
  totalUsd: z.number().min(0).finite(),
  finishedSeconds: z.number().int().min(0).nullable(),
  usdPerMinute: z.number().min(0).finite().nullable(),
  models: z.array(VideoCostModelSchema).max(60).optional(),
  chapters: z.array(VideoCostChapterSchema).max(VIDEO_LONG_MAX_CHAPTERS).optional(),
  // Any unmeasured entry takes precedence over estimated entries; measured requires all entries measured.
  usdPerMinuteBasis: VideoCostBasisSchema.nullable().optional(),
  unmeasuredEntries: z.number().int().min(0).optional(),
});
export type VideoCostByStep = z.infer<typeof VideoCostByStepSchema>;
