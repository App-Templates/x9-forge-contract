import { z } from 'zod';
import { VideoBriefRequestSchema, VideoModeSchema, VideoPresetIdSchema, VideoProjectIdSchema, VideoRequestChoicesSchema } from './brief.js';
import { VideoFootageChoiceSchema } from './footage.js';
import { VideoStoryOutroSchema, VideoStoryScenesSchema } from './story.js';

/**
 * The manifest of a delivered video: a public document, downloaded from the link of the video page.
 * cap-video writes it and every reader (Parallel, Forge, an agent) validates it with this schema.
 * It is not the engine's internal project: no identity, no referent email, no internal paths.
 */
export const VIDEO_PROJECT_MANIFEST_VERSION = 1;

const usd = z.number().finite().min(0);

/** One downloadable file of the delivery: the video or its subtitles. */
export const VideoProjectManifestFileSchema = z.strictObject({
  kind: z.enum(['video', 'subtitles']),
  name: z.string().regex(/^[A-Za-z0-9_-]+\.(mp4|mov|srt)$/),
  url: z.url(),
});
export type VideoProjectManifestFile = z.infer<typeof VideoProjectManifestFileSchema>;

/** A scene of the engine for presets without regia (the demo). */
export const VideoProjectManifestSceneSchema = z.strictObject({
  title: z.string().max(500),
  narration: z.string().max(6000),
});
export type VideoProjectManifestScene = z.infer<typeof VideoProjectManifestSceneSchema>;

/** The script of the preset with regia; `null` in the manifest for presets without. */
export const VideoProjectManifestScriptSchema = z.strictObject({
  revision: z.number().int().min(1),
  scenes: VideoStoryScenesSchema,
  outro: VideoStoryOutroSchema,
});
export type VideoProjectManifestScript = z.infer<typeof VideoProjectManifestScriptSchema>;

export const VideoProjectManifestSchema = z.strictObject({
  version: z.literal(VIDEO_PROJECT_MANIFEST_VERSION),
  projectId: VideoProjectIdSchema,
  presetId: VideoPresetIdSchema,
  presetTitle: z.string().min(1).max(200),
  mode: VideoModeSchema,
  brief: VideoBriefRequestSchema.shape.brief,
  choices: VideoRequestChoicesSchema,
  footage: VideoFootageChoiceSchema.nullable(),
  script: VideoProjectManifestScriptSchema.nullable(),
  /** Engine scenes for presets without regia; `[]` for the story presets. */
  scenes: z.array(VideoProjectManifestSceneSchema).max(32),
  cost: z.strictObject({
    budgetUsd: usd,
    spentUsd: usd,
    estimateUsd: usd.nullable(),
  }),
  output: z.strictObject({
    durationSeconds: z.number().finite().min(0).nullable(),
    width: z.number().int().min(1).nullable(),
    height: z.number().int().min(1).nullable(),
    sha256: z.string().regex(/^[0-9a-f]{64}$/).nullable(),
  }),
  files: z.array(VideoProjectManifestFileSchema).min(1).max(4)
    .refine((files) => files.filter((f) => f.kind === 'video').length === 1, { message: 'exactly one file of kind video' }),
  createdAt: z.string().min(1),
  deliveredAt: z.string().min(1),
});
export type VideoProjectManifest = z.infer<typeof VideoProjectManifestSchema>;
