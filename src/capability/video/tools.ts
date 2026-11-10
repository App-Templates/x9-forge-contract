import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { VideoStoryOutroSchema, VideoStoryScenesSchema } from './story.js';
import { ConnectScopeSchema } from '../connect/index.js';
import { ConnectAccessErrorCodeSchema } from '../../http/endpoints/internal-connect.js';
import {
  VIDEO_FOOTAGE_MAX_PER_PERSON,
  VideoFootageIdSchema,
  VideoFootagePersonSchema,
  VideoFootageRejectionReasonSchema,
} from './footage.js';
import { VideoBriefRequestSchema, VideoModeSchema, VideoRequestChoicesSchema, VideoPresetIdSchema, VideoProjectIdSchema, VideoProjectStateSchema } from './brief.js';

/**
 * What the model writes when an agent calls `video_brief_create`: the brief without identity.
 * Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33), never from the model.
 */
export const VideoBriefToolInputSchema = VideoBriefRequestSchema.omit({ identity: true, requestedBy: true }).extend({
  presetId: VideoPresetIdSchema.describe("Id di un preset dell'Officina, come lo restituisce video_presets_list (es. «singola»)."),
  requestedBy: VideoBriefRequestSchema.shape.requestedBy.optional(),
}).strict();
export type VideoBriefToolInput = z.infer<typeof VideoBriefToolInputSchema>;

/** Identity comes only from the admitted tool envelope (R-33). */
export const VideoPresetsListToolInputSchema = z.strictObject({});
export type VideoPresetsListToolInput = z.infer<typeof VideoPresetsListToolInputSchema>;

/** Number of archive shots used by a preset. */
export const VideoPresetFootageShotsSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);
export type VideoPresetFootageShots = z.infer<typeof VideoPresetFootageShotsSchema>;

export const VideoPresetSummarySchema = z.strictObject({
  id: VideoPresetIdSchema,
  title: z.string().min(1).max(200),
  expectedCostUsd: z.number().nonnegative().finite(),
  footageShots: VideoPresetFootageShotsSchema,
});
export type VideoPresetSummary = z.infer<typeof VideoPresetSummarySchema>;

export const VideoPresetsListResponseSchema = z.strictObject({
  presets: z.array(VideoPresetSummarySchema).min(1),
});
export type VideoPresetsListResponse = z.infer<typeof VideoPresetsListResponseSchema>;

/** What the model writes when an agent calls `video_project_get`. */
export const VideoProjectGetToolInputSchema = z.object({ projectId: VideoProjectIdSchema }).strict();
export type VideoProjectGetToolInput = z.infer<typeof VideoProjectGetToolInputSchema>;

/** Revision of the script the regia wrote; a correction is always based on the one the person read. */
export const VideoScriptRevisionSchema = z.number().int().min(1);

/**
 * What the model writes when an agent calls `video_script_revise`: new texts on the revision the person read.
 * No identity (from the envelope, R-33), no footage or graphic (they stay the regia's); absent `outro` keeps the old closing.
 */
export const VideoScriptReviseToolInputSchema = z.strictObject({
  projectId: VideoProjectIdSchema,
  basedOnRevision: VideoScriptRevisionSchema,
  scenes: VideoStoryScenesSchema,
  outro: VideoStoryOutroSchema.optional(),
});
export type VideoScriptReviseToolInput = z.infer<typeof VideoScriptReviseToolInputSchema>;

/** Production step inside a project state, for people and agents reading the project. */
export const VideoProjectStepSchema = z.enum([
  'queued', 'plan', 'frames', 'review_sent', 'clips', 'assemble', 'delivery_sent', 'done', 'failed',
  // Presets with a face or a pure infographic: the regia session writes script and graphic, the engine produces the story.
  'regia', 'story',
]);
export type VideoProjectStep = z.infer<typeof VideoProjectStepSchema>;

export const VideoScriptReviseResponseSchema = z.strictObject({
  projectId: VideoProjectIdSchema,
  state: VideoProjectStateSchema,
  step: VideoProjectStepSchema,
  scriptRevision: VideoScriptRevisionSchema,
});
export type VideoScriptReviseResponse = z.infer<typeof VideoScriptReviseResponseSchema>;

/** One project as the owning agent sees it: state, step and the two links of the two emails. */
export const VideoProjectViewSchema = z.object({
  projectId: VideoProjectIdSchema,
  state: VideoProjectStateSchema,
  step: VideoProjectStepSchema,
  identity: CapabilityAgentScopeSchema,
  presetId: VideoPresetIdSchema,
  mode: VideoModeSchema,
  budgetUsd: z.number().positive().finite(),
  spentUsd: z.number().nonnegative().finite(),
  reviewUrl: z.url().optional(),
  videoUrl: z.url().optional(),
  error: z.string().max(500).optional(),
  /** The choices of the request, resolved with the preset; absent in views written before 1.97.0. */
  choices: VideoRequestChoicesSchema.optional(),
  /** Revision of the script the regia wrote (the person may ask to correct it); absent for presets without regia. */
  scriptRevision: VideoScriptRevisionSchema.optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
}).strict();
export type VideoProjectView = z.infer<typeof VideoProjectViewSchema>;

/** Link of a Google Drive folder or its id. */
export const VideoDriveFolderRefSchema = z.string().trim().min(10).max(300)
  .describe('Link di una cartella di Google Drive (https://drive.google.com/drive/folders/…) o il suo id.');

/**
 * What the model writes when an agent calls `video_footage_sync`: no identity (from the envelope, R-33).
 * `folder` absent = the last folder used for the same tenant and person.
 */
export const VideoFootageSyncToolInputSchema = z.strictObject({
  person: VideoFootagePersonSchema.describe("Chi è ripreso, come nell'archivio (es. «stefano»)."),
  folder: VideoDriveFolderRefSchema.optional(),
});
export type VideoFootageSyncToolInput = z.infer<typeof VideoFootageSyncToolInputSchema>;

/** Id of a Google Drive file or folder. */
export const VideoDriveFileIdSchema = z.string().regex(/^[A-Za-z0-9_-]{10,200}$/);
export type VideoDriveFileId = z.infer<typeof VideoDriveFileIdSchema>;

export const VideoFootageSyncFileStatusSchema = z.enum(['in_coda', 'in_corso', 'aggiunta', 'gia_nell_archivio', 'rifiutata', 'errore']);
export type VideoFootageSyncFileStatus = z.infer<typeof VideoFootageSyncFileStatusSchema>;

/** The engine's reasons, plus the two cap-video sees itself before downloading (over the byte limit, not a video type). */
export const VideoFootageSyncReasonSchema = z.enum([...VideoFootageRejectionReasonSchema.options, 'troppo_grande', 'non_video']);
export type VideoFootageSyncReason = z.infer<typeof VideoFootageSyncReasonSchema>;

export const VideoFootageSyncFileSchema = z.strictObject({
  driveFileId: VideoDriveFileIdSchema,
  name: z.string().min(1).max(300),
  status: VideoFootageSyncFileStatusSchema,
  footageId: VideoFootageIdSchema.optional(),
  reason: VideoFootageSyncReasonSchema.optional(),
}).superRefine((file, ctx) => {
  if ((file.footageId !== undefined) !== (file.status === 'aggiunta')) {
    ctx.addIssue({ code: 'custom', path: ['footageId'], message: 'footageId solo e sempre con lo stato aggiunta' });
  }
  if ((file.reason !== undefined) !== (file.status === 'rifiutata')) {
    ctx.addIssue({ code: 'custom', path: ['reason'], message: 'reason solo e sempre con lo stato rifiutata' });
  }
});
export type VideoFootageSyncFile = z.infer<typeof VideoFootageSyncFileSchema>;

const syncFolderBase = {
  person: VideoFootagePersonSchema,
  folderId: VideoDriveFileIdSchema,
  limit: z.literal(VIDEO_FOOTAGE_MAX_PER_PERSON),
};

/** One outcome for the whole folder; `sincronizzata` carries one status per file. */
export const VideoFootageSyncResponseSchema = z.discriminatedUnion('outcome', [
  z.strictObject({
    outcome: z.literal('sincronizzata'),
    ...syncFolderBase,
    counted: z.number().int().min(0).max(VIDEO_FOOTAGE_MAX_PER_PERSON),
    files: z.array(VideoFootageSyncFileSchema).max(200),
  }),
  z.strictObject({
    outcome: z.literal('oltre_il_tetto'),
    ...syncFolderBase,
    counted: z.number().int().min(0),
    newFiles: z.number().int().positive(),
  }),
  z.strictObject({
    outcome: z.literal('serve_google'),
    permission: ConnectScopeSchema.extract(['drive_read']),
    reason: ConnectAccessErrorCodeSchema,
  }),
  z.strictObject({
    outcome: z.literal('cartella_illeggibile'),
    reason: z.enum(['link_non_valido', 'nessuna_cartella', 'non_trovata']),
  }),
]);
export type VideoFootageSyncResponse = z.infer<typeof VideoFootageSyncResponseSchema>;

/** Identity comes only from the admitted tool envelope (R-33), never from the model. */
export const VideoStudioOpenToolInputSchema = z.strictObject({});
export type VideoStudioOpenToolInput = z.infer<typeof VideoStudioOpenToolInputSchema>;

/** One-use access link lifetime (15 minutes). */
export const VIDEO_STUDIO_ACCESS_TTL_SECONDS = 900;
/** Authenticated studio session lifetime (12 hours). */
export const VIDEO_STUDIO_SESSION_TTL_SECONDS = 43200;

export const VideoStudioOpenResponseSchema = z.strictObject({
  url: z.url({ protocol: /^https$/ }).max(500),
  expiresAt: z.iso.datetime({ offset: true }),
  sessionHours: z.literal(12),
});
export type VideoStudioOpenResponse = z.infer<typeof VideoStudioOpenResponseSchema>;
