import { z } from 'zod';
import { WikiSourceIdSchema } from '../lab/wiki.js';
import { VideoEnvironmentAngleNameSchema } from './ambiente.js';
import { VideoEngineRevisionSchema } from './engine.js';
import { VideoLongDraftSchema, VideoLongUsageSchema } from './lungo-bozza.js';
import { VideoLongFramingSchema } from './lungo-ricerca.js';
import { VIDEO_LONG_MAX_CHAPTERS, VIDEO_LONG_MAX_SECONDS } from './lungo.js';

/** Bounds the size of the shot plan for a single chapter. */
export const VIDEO_LONG_MAX_SHOTS_PER_CHAPTER = 80;
/** Local stills may be shorter than the engine's four-second minimum for paid clips. */
export const VIDEO_LONG_MIN_SHOT_SECONDS = 2;
/** Provider clip ceiling (engine video_adapters.py). */
export const VIDEO_LONG_MAX_SHOT_SECONDS = 15;
/** Engine production limits; longer chapters are split into batches by the engine. */
export const VIDEO_LONG_BATCH_MAX_SCENES = 16;
export const VIDEO_LONG_BATCH_MAX_SECONDS = 120;
/** Working speech-rate estimate to measure, rather than an established fact. */
export const VIDEO_LONG_SPEECH_CHARS_PER_SECOND = 15;
/** Allowed difference in seconds between a chapter's shots and its target. */
export const VIDEO_LONG_SHOT_SUM_TOLERANCE = 0.1;
/** Docuseries rule 13: a working hypothesis for a warning, never a rejection. */
export const VIDEO_LONG_MAX_SECONDS_WITHOUT_INTERVIEW = 50;

/** Paid provider clip, or a local still with slow movement and no generation spend. */
export const VideoLongShotRenderSchema = z.enum(['clip', 'fermo']);
export type VideoLongShotRender = z.infer<typeof VideoLongShotRenderSchema>;

export const VideoLongShotSchema = z.strictObject({
  index: z.number().int().min(1).max(VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
  framing: VideoLongFramingSchema,
  description: z.string().min(1).max(1500),
  motion: z.string().min(1).max(400),
  seconds: z.number().int().min(VIDEO_LONG_MIN_SHOT_SECONDS).max(VIDEO_LONG_MAX_SHOT_SECONDS),
  render: VideoLongShotRenderSchema,
  /** Empty when the preceding shot's narration continues over this image. */
  narration: z.string().max(1200),
  environmentAngle: VideoEnvironmentAngleNameSchema.nullable(),
  withCharacter: z.boolean(),
  sourceId: WikiSourceIdSchema.nullable(),
});
export type VideoLongShot = z.infer<typeof VideoLongShotSchema>;

export const VideoLongChapterShotsSchema = z.strictObject({
  chapterIndex: z.number().int().min(1).max(VIDEO_LONG_MAX_CHAPTERS),
  shots: z.array(VideoLongShotSchema).min(1).max(VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
});
export type VideoLongChapterShots = z.infer<typeof VideoLongChapterShotsSchema>;

/**
 * Written by the director; cap-video supplies null usage when not measured.
 * The engine checks consecutive indexes, each chapter's targetSeconds within
 * tolerance, speech fit, clips of at least four seconds, dossier sources and
 * angles present in the project's environment.
 */
export const VideoLongFramesDocumentSchema = z.strictObject({
  chaptersRevision: VideoEngineRevisionSchema,
  chapters: z.array(VideoLongChapterShotsSchema).min(1).max(VIDEO_LONG_MAX_CHAPTERS),
  usage: VideoLongUsageSchema.nullable(),
});
export type VideoLongFramesDocument = z.infer<typeof VideoLongFramesDocumentSchema>;

export const VideoLongFramesStatusSchema = z.enum(['da-approvare', 'approvati']);
export type VideoLongFramesStatus = z.infer<typeof VideoLongFramesStatusSchema>;

export const VideoLongFramesSchema = VideoLongFramesDocumentSchema.extend({
  revision: VideoEngineRevisionSchema,
  status: VideoLongFramesStatusSchema,
  totalSeconds: z.number().int().min(10).max(VIDEO_LONG_MAX_SECONDS),
  shotCount: z.number().int().min(1).max(VIDEO_LONG_MAX_CHAPTERS * VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
  /** Share of total shot time framed as an interview. */
  interviewShare: z.number().min(0).max(1),
  warnings: z.array(z.string().min(1).max(200)).max(20),
  digest: VideoLongDraftSchema.shape.digest,
  approvedAt: z.string().min(1).max(40).nullable(),
});
export type VideoLongFrames = z.infer<typeof VideoLongFramesSchema>;

/** Approval records the revision and digest seen by the person; it starts no spend. */
export const VideoLongFramesApproveRequestSchema = z.strictObject({
  revision: VideoEngineRevisionSchema,
  digest: VideoLongDraftSchema.shape.digest,
});
export type VideoLongFramesApproveRequest = z.infer<typeof VideoLongFramesApproveRequestSchema>;
