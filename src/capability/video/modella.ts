import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';

/** The four angles of a fixed model's approved references (one per angle; the engine checks it). */
export const VIDEO_MODEL_REF_KINDS = ['frontale', 'tre_quarti', 'profilo', 'figura_intera'] as const;
export const VideoModelRefKindSchema = z.enum(VIDEO_MODEL_REF_KINDS);
export type VideoModelRefKind = z.infer<typeof VideoModelRefKindSchema>;

/** Largest reference image the engine takes. */
export const VIDEO_MODEL_REF_MAX_BYTES = 10 * 1024 * 1024;
export const VIDEO_MODEL_REF_MEDIA_TYPES = ['image/png', 'image/jpeg'] as const;
export const VIDEO_MODEL_MAX_VERSIONS = 50;
export const VIDEO_MODEL_MAX_PER_AGENT = 200;

/** Id of a model: a slug, never a path. */
export const VideoModelIdSchema = z.string().regex(/^[a-z][a-z0-9-]{0,47}$/);
export type VideoModelId = z.infer<typeof VideoModelIdSchema>;
export const VideoModelNameSchema = z.string().trim().min(1).max(80);
export type VideoModelName = z.infer<typeof VideoModelNameSchema>;
export const VideoModelVersionNumberSchema = z.number().int().min(1).max(VIDEO_MODEL_MAX_VERSIONS);
export type VideoModelVersionNumber = z.infer<typeof VideoModelVersionNumberSchema>;
/** The same version number as a path piece. */
export const VideoModelVersionParamSchema = z.string().regex(/^[1-9][0-9]{0,1}$/);
export type VideoModelVersionParam = z.infer<typeof VideoModelVersionParamSchema>;

const Sha256Schema = z.string().regex(/^[0-9a-f]{64}$/);
const TimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/);
const DescriptionPartSchema = z.string().trim().min(1).max(300);

export const VideoModelDescriptionSchema = z.strictObject({
  face: DescriptionPartSchema,
  body: DescriptionPartSchema,
  hair: DescriptionPartSchema,
});
export type VideoModelDescription = z.infer<typeof VideoModelDescriptionSchema>;

/** How the images were generated. The seed helps reproducibility; it is not a guarantee of identity. */
export const VideoModelGenerationSchema = z.strictObject({
  model: z.string().trim().min(1).max(120),
  seed: z.number().int().min(0).nullable(),
  parameters: z
    .array(z.strictObject({ name: z.string().regex(/^[a-z][a-z0-9_]{0,63}$/), value: z.string().max(200) }))
    .max(20),
});
export type VideoModelGeneration = z.infer<typeof VideoModelGenerationSchema>;

export const VideoModelRefSchema = z.strictObject({
  kind: VideoModelRefKindSchema,
  fileName: z.string().regex(/^[A-Za-z0-9_-]{1,100}\.(png|jpg|jpeg)$/),
  sha256: Sha256Schema,
  width: z.number().int().min(64).max(16384),
  height: z.number().int().min(64).max(16384),
  sizeBytes: z.number().int().min(1).max(VIDEO_MODEL_REF_MAX_BYTES),
});
export type VideoModelRef = z.infer<typeof VideoModelRefSchema>;

export const VideoModelVersionStatusSchema = z.enum(['bozza', 'approvata', 'sostituita']);
export type VideoModelVersionStatus = z.infer<typeof VideoModelVersionStatusSchema>;

export const VideoModelVersionSchema = z.strictObject({
  version: VideoModelVersionNumberSchema,
  status: VideoModelVersionStatusSchema,
  description: VideoModelDescriptionSchema,
  refs: z.array(VideoModelRefSchema).max(VIDEO_MODEL_REF_KINDS.length),
  generation: VideoModelGenerationSchema,
  createdAt: TimestampSchema,
  approvedAt: TimestampSchema.nullable(),
  digest: Sha256Schema,
});
export type VideoModelVersion = z.infer<typeof VideoModelVersionSchema>;

export const VideoModelSchema = z.strictObject({
  id: VideoModelIdSchema,
  name: VideoModelNameSchema,
  identity: CapabilityAgentScopeSchema,
  versions: z.array(VideoModelVersionSchema).max(VIDEO_MODEL_MAX_VERSIONS),
  currentVersion: VideoModelVersionNumberSchema.nullable(),
});
export type VideoModel = z.infer<typeof VideoModelSchema>;

export const VideoModelListSchema = z.strictObject({
  models: z.array(VideoModelSchema).max(VIDEO_MODEL_MAX_PER_AGENT),
});
export type VideoModelList = z.infer<typeof VideoModelListSchema>;

/** Query of the model routes: the identity only. */
export const VideoModelScopeQuerySchema = CapabilityAgentScopeSchema;
export type VideoModelScopeQuery = z.infer<typeof VideoModelScopeQuerySchema>;

/** Query of the reference upload: the identity and the angle; the body is the image itself. */
export const VideoModelRefAddQuerySchema = z.strictObject({
  ...CapabilityAgentScopeSchema.shape,
  kind: VideoModelRefKindSchema,
});
export type VideoModelRefAddQuery = z.infer<typeof VideoModelRefAddQuerySchema>;

export const VideoModelCreateRequestSchema = z.strictObject({
  name: VideoModelNameSchema,
  description: VideoModelDescriptionSchema,
  generation: VideoModelGenerationSchema,
});
export type VideoModelCreateRequest = z.infer<typeof VideoModelCreateRequestSchema>;

export const VideoModelVersionCreateRequestSchema = z.strictObject({
  description: VideoModelDescriptionSchema,
  generation: VideoModelGenerationSchema,
});
export type VideoModelVersionCreateRequest = z.infer<typeof VideoModelVersionCreateRequestSchema>;

/** One approves the version the person has seen: its digest. */
export const VideoModelApproveRequestSchema = z.strictObject({ digest: Sha256Schema });
export type VideoModelApproveRequest = z.infer<typeof VideoModelApproveRequestSchema>;
