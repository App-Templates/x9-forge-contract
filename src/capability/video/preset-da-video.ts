import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { VideoPresetIdSchema, VideoAspectRatioSchema } from './brief.js';
import { VideoFootageFramingSchema } from './footage.js';

/** Largest example video the engine downloads from a URL. */
export const VIDEO_PRESET_VIDEO_MAX_BYTES = 768 * 1024 * 1024;
/** Longest example video the engine analyzes. */
export const VIDEO_PRESET_VIDEO_MAX_SECONDS = 1800;
/** Longest preset made from a video: the sum of its scenes. */
export const VIDEO_PRESET_TOTAL_MAX_SECONDS = 120;
/** Scenes of one preset, at most. */
export const VIDEO_PRESET_MAX_SCENES = 12;

/** URL of the example video: http or https only. */
export const VideoPresetVideoUrlSchema = z.string().max(2000).regex(/^https?:\/\/[^\s]+$/);
export type VideoPresetVideoUrl = z.infer<typeof VideoPresetVideoUrlSchema>;

/** Id of a preset made by the user; distinct from `VideoPresetIdSchema` (brief.ts), which stays as is. */
export const VideoUserPresetIdSchema = z.string().regex(/^utente-[a-z0-9][a-z0-9-]{0,55}$/);
export type VideoUserPresetId = z.infer<typeof VideoUserPresetIdSchema>;

export const VideoPresetTransitionSchema = z.enum(['taglio', 'dissolvenza', 'dissolvenza-nero', 'scorrimento', 'zoom']);
export type VideoPresetTransition = z.infer<typeof VideoPresetTransitionSchema>;
export const VideoPresetMovementSchema = z.enum(['fissa', 'push-in', 'pull-out', 'panoramica']);
export type VideoPresetMovement = z.infer<typeof VideoPresetMovementSchema>;
export const VideoPresetRoleSchema = z.enum(['gancio', 'contesto', 'info', 'prova', 'svolta', 'conclusione', 'invito', 'atmosfera']);
export type VideoPresetRole = z.infer<typeof VideoPresetRoleSchema>;
/** `stimato` = guessed by the analysis; `corretto` = set by the user. */
export const VideoPresetRoleSourceSchema = z.enum(['stimato', 'corretto']);
export type VideoPresetRoleSource = z.infer<typeof VideoPresetRoleSourceSchema>;

export const VideoPresetSceneSchema = z.strictObject({
  index: z.number().int().min(0).max(VIDEO_PRESET_MAX_SCENES - 1),
  durationSeconds: z.number().min(1).max(20),
  framing: VideoFootageFramingSchema,
  movement: VideoPresetMovementSchema,
  transitionIn: VideoPresetTransitionSchema,
  role: VideoPresetRoleSchema,
  roleSource: VideoPresetRoleSourceSchema,
});
export type VideoPresetScene = z.infer<typeof VideoPresetSceneSchema>;

const VideoPresetNameSchema = z.string().min(1).max(80);
const VideoPresetScenesSchema = z.array(VideoPresetSceneSchema).min(1).max(VIDEO_PRESET_MAX_SCENES);
const VideoPresetTimestampSchema = z.string().datetime();

/** A preset made from an example video: a draft until the user saves it. */
export const VideoUserPresetSchema = z.strictObject({
  id: VideoUserPresetIdSchema,
  name: VideoPresetNameSchema,
  identity: CapabilityAgentScopeSchema,
  status: z.enum(['bozza', 'salvato']),
  revision: z.number().int().min(1),
  /** The existing preset that gives voice, graphics and lip-sync; `singola` by default. */
  basedOn: VideoPresetIdSchema.default('singola'),
  source: z.strictObject({
    durationSeconds: z.number().positive().max(VIDEO_PRESET_VIDEO_MAX_SECONDS),
    aspectRatio: VideoAspectRatioSchema,
    sceneCount: z.number().int().min(1).max(VIDEO_PRESET_MAX_SCENES),
  }),
  scenes: VideoPresetScenesSchema,
  createdAt: VideoPresetTimestampSchema,
  updatedAt: VideoPresetTimestampSchema,
});
export type VideoUserPreset = z.infer<typeof VideoUserPresetSchema>;

/** Answer of `GET /api/preset-utente`. */
export const VideoUserPresetListSchema = z.strictObject({ presets: z.array(VideoUserPresetSchema) });
export type VideoUserPresetList = z.infer<typeof VideoUserPresetListSchema>;

/** Query of every preset call: the identity, as in `footage.ts`. */
export const VideoPresetFromVideoStartQuerySchema = CapabilityAgentScopeSchema;
export type VideoPresetFromVideoStartQuery = z.infer<typeof VideoPresetFromVideoStartQuerySchema>;

export const VideoPresetFromVideoStartRequestSchema = z.strictObject({
  url: VideoPresetVideoUrlSchema,
  name: VideoPresetNameSchema,
});
export type VideoPresetFromVideoStartRequest = z.infer<typeof VideoPresetFromVideoStartRequestSchema>;

export const VideoPresetFromVideoJobSchema = z.strictObject({
  jobId: z.string().regex(/^[a-f0-9]{32}$/),
  status: z.enum(['queued', 'downloading', 'analyzing', 'done', 'failed']),
  presetId: VideoUserPresetIdSchema.nullable(),
  code: z.string().nullable(),
  error: z.string().nullable(),
});
export type VideoPresetFromVideoJob = z.infer<typeof VideoPresetFromVideoJobSchema>;

/** The user's correction: durations, framing, transitions, movement, role. */
export const VideoPresetSaveRequestSchema = z.strictObject({
  revision: z.number().int().min(1),
  name: VideoPresetNameSchema,
  basedOn: VideoPresetIdSchema,
  scenes: VideoPresetScenesSchema,
});
export type VideoPresetSaveRequest = z.infer<typeof VideoPresetSaveRequestSchema>;
