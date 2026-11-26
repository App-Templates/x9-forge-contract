import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { VideoEngineMediaPathSchema, VideoEngineRevisionSchema } from './engine.js';
import { VideoProjectIdSchema } from './brief.js';
import { VideoEnvironmentIdSchema, VideoEnvironmentVersionParamSchema } from './ambiente.js';
import { VideoModelIdSchema, VideoModelVersionNumberSchema, VideoModelVersionParamSchema } from './modella.js';

export const VIDEO_MODEL_PRODUCTION_MIN_SECONDS = 18;
export const VIDEO_MODEL_PRODUCTION_MAX_SECONDS = 60;

const Sha256Schema = z.string().regex(/^[0-9a-f]{64}$/);
const TimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/);

/** The look is the binary body; identity and production metadata are text query values. */
export const VideoModelProductionQuerySchema = z.strictObject({
  ...CapabilityAgentScopeSchema.shape,
  videoProjectId: VideoProjectIdSchema,
  modelId: VideoModelIdSchema,
  modelVersion: VideoModelVersionParamSchema,
  purpose: z.string().trim().min(1).max(300),
  name: z.string().trim().min(1).max(120),
  durationSeconds: z.string().regex(/^(1[89]|[2-5][0-9]|60)$/),
  budgetUsd: z.string().regex(/^(0\.[0-9]{1,2}|[1-9][0-9]{0,2}(\.[0-9]{1,2})?)$/),
  fileName: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9 ()._-]{0,119}\.(png|jpg|jpeg|PNG|JPG|JPEG)$/),
  lookNote: z.string().trim().min(1).max(300).optional(),
  environmentId: VideoEnvironmentIdSchema.optional(),
  environmentVersion: VideoEnvironmentVersionParamSchema.optional(),
});
export type VideoModelProductionQuery = z.infer<typeof VideoModelProductionQuerySchema>;

export const VideoModelProductionCreatedSchema = z.strictObject({
  engineProjectId: z.string().regex(/^[a-f0-9]{32}$/),
  lookSha256: Sha256Schema,
  modelDigest: Sha256Schema,
});
export type VideoModelProductionCreated = z.infer<typeof VideoModelProductionCreatedSchema>;

export const VideoModelSimilarityOutcomeSchema = z.enum(['ok', 'da_rivedere', 'respinto']);
export type VideoModelSimilarityOutcome = z.infer<typeof VideoModelSimilarityOutcomeSchema>;
export const VideoModelSimilarityReasonSchema = z.enum([
  'confermata', 'sotto_soglia', 'volto_non_rilevato', 'modello_non_disponibile', 'riferimenti_insufficienti',
]);
export type VideoModelSimilarityReason = z.infer<typeof VideoModelSimilarityReasonSchema>;
export const VideoModelSimilaritySchema = z.strictObject({
  outcome: VideoModelSimilarityOutcomeSchema,
  reason: VideoModelSimilarityReasonSchema,
  score: z.number().min(-1).max(1).nullable(),
  threshold: z.number().min(-1).max(1).nullable(),
});
export type VideoModelSimilarity = z.infer<typeof VideoModelSimilaritySchema>;

export const VideoModelFrameStatusSchema = z.enum(['assente', 'in_corso', 'pronto', 'fallito']);
export type VideoModelFrameStatus = z.infer<typeof VideoModelFrameStatusSchema>;
export const VideoModelFrameStateSchema = z.strictObject({
  status: VideoModelFrameStatusSchema,
  frameUrl: VideoEngineMediaPathSchema.nullable(),
  frameSha256: Sha256Schema.nullable(),
  similarity: VideoModelSimilaritySchema.nullable(),
  approvedAt: TimestampSchema.nullable(),
  approvedBy: z.literal('persona').nullable(),
  reviewConfirmed: z.boolean(),
  error: z.string().max(500).nullable(),
});
export type VideoModelFrameState = z.infer<typeof VideoModelFrameStateSchema>;

export const VideoModelProductionStateSchema = z.strictObject({
  modelId: VideoModelIdSchema,
  modelVersion: VideoModelVersionNumberSchema,
  modelDigest: Sha256Schema,
  lookSha256: Sha256Schema,
  purpose: z.string().trim().min(1).max(300),
  regiaApplied: z.boolean(),
  frame: VideoModelFrameStateSchema,
});
export type VideoModelProductionState = z.infer<typeof VideoModelProductionStateSchema>;

export const VideoModelFrameRequestSchema = z.strictObject({ revision: VideoEngineRevisionSchema });
export type VideoModelFrameRequest = z.infer<typeof VideoModelFrameRequestSchema>;

/** Approval binds the person's explicit review to the exact frame shown. */
export const VideoModelFrameApproveRequestSchema = z.strictObject({
  revision: VideoEngineRevisionSchema,
  frameSha256: Sha256Schema,
  confirmReview: z.boolean(),
});
export type VideoModelFrameApproveRequest = z.infer<typeof VideoModelFrameApproveRequestSchema>;
