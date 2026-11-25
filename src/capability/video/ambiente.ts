import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { VideoEngineIdSchema } from './engine.js';
import { VideoModelIdSchema } from './modella.js';

export const VIDEO_ENVIRONMENT_KINDS = ['studio', 'esterno', 'documentario'] as const;
export const VIDEO_ENVIRONMENT_MAX_ANGLES = 8;
export const VIDEO_ENVIRONMENT_MAX_VERSIONS = 50;
export const VIDEO_ENVIRONMENT_MAX_PER_AGENT = 200;

export const VideoEnvironmentIdSchema = z.string().regex(/^[a-z][a-z0-9-]{0,47}$/);
export type VideoEnvironmentId = z.infer<typeof VideoEnvironmentIdSchema>;
export const VideoEnvironmentKindSchema = z.enum(VIDEO_ENVIRONMENT_KINDS);
export type VideoEnvironmentKind = z.infer<typeof VideoEnvironmentKindSchema>;
export const VideoEnvironmentNameSchema = z.string().trim().min(1).max(80);
export type VideoEnvironmentName = z.infer<typeof VideoEnvironmentNameSchema>;
export const VideoEnvironmentVersionNumberSchema = z.number().int().min(1).max(VIDEO_ENVIRONMENT_MAX_VERSIONS);
export type VideoEnvironmentVersionNumber = z.infer<typeof VideoEnvironmentVersionNumberSchema>;
/** Version number as a path segment. The engine checks the version range. */
export const VideoEnvironmentVersionParamSchema = z.string().regex(/^[1-9][0-9]{0,1}$/);
export type VideoEnvironmentVersionParam = z.infer<typeof VideoEnvironmentVersionParamSchema>;
export const VideoEnvironmentAngleNameSchema = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);
export type VideoEnvironmentAngleName = z.infer<typeof VideoEnvironmentAngleNameSchema>;

const Sha256Schema = z.string().regex(/^[0-9a-f]{64}$/);
const TimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/);
const DescriptionPartSchema = z.string().trim().min(1).max(300);

export const VideoEnvironmentDescriptionSchema = z.strictObject({
  room: DescriptionPartSchema,
  furniture: DescriptionPartSchema,
  light: DescriptionPartSchema,
});
export type VideoEnvironmentDescription = z.infer<typeof VideoEnvironmentDescriptionSchema>;

export const VideoEnvironmentAngleSchema = z.strictObject({
  name: VideoEnvironmentAngleNameSchema,
  framing: DescriptionPartSchema,
  imagePath: z.string().regex(/^[A-Za-z0-9_-]{1,100}\.(png|jpg|jpeg)$/),
  sha256: Sha256Schema,
});
export type VideoEnvironmentAngle = z.infer<typeof VideoEnvironmentAngleSchema>;

export const VideoEnvironmentVersionStatusSchema = z.enum(['bozza', 'approvata', 'sostituita']);
export type VideoEnvironmentVersionStatus = z.infer<typeof VideoEnvironmentVersionStatusSchema>;

export const VideoEnvironmentVersionSchema = z.strictObject({
  number: VideoEnvironmentVersionNumberSchema,
  status: VideoEnvironmentVersionStatusSchema,
  description: VideoEnvironmentDescriptionSchema,
  // Drafts can start empty; the engine requires at least one angle before approval.
  angles: z.array(VideoEnvironmentAngleSchema).max(VIDEO_ENVIRONMENT_MAX_ANGLES),
  createdAt: TimestampSchema,
  approvedAt: TimestampSchema.nullable(),
  digest: Sha256Schema,
});
export type VideoEnvironmentVersion = z.infer<typeof VideoEnvironmentVersionSchema>;

export const VideoEnvironmentSchema = z.strictObject({
  id: VideoEnvironmentIdSchema,
  name: VideoEnvironmentNameSchema,
  kind: VideoEnvironmentKindSchema,
  identity: CapabilityAgentScopeSchema,
  versions: z.array(VideoEnvironmentVersionSchema).max(VIDEO_ENVIRONMENT_MAX_VERSIONS),
  currentVersion: VideoEnvironmentVersionNumberSchema.nullable(),
});
export type VideoEnvironment = z.infer<typeof VideoEnvironmentSchema>;

export const VideoEnvironmentListSchema = z.strictObject({
  environments: z.array(VideoEnvironmentSchema).max(VIDEO_ENVIRONMENT_MAX_PER_AGENT),
});
export type VideoEnvironmentList = z.infer<typeof VideoEnvironmentListSchema>;

/** Identity belongs in the query, never in an angle generation body. */
export const VideoEnvironmentScopeQuerySchema = CapabilityAgentScopeSchema;
export type VideoEnvironmentScopeQuery = z.infer<typeof VideoEnvironmentScopeQuerySchema>;

export const VideoEnvironmentCreateRequestSchema = z.strictObject({
  name: VideoEnvironmentNameSchema,
  kind: VideoEnvironmentKindSchema,
  description: VideoEnvironmentDescriptionSchema,
});
export type VideoEnvironmentCreateRequest = z.infer<typeof VideoEnvironmentCreateRequestSchema>;

export const VideoEnvironmentVersionCreateRequestSchema = z.strictObject({
  description: VideoEnvironmentDescriptionSchema,
});
export type VideoEnvironmentVersionCreateRequest = z.infer<typeof VideoEnvironmentVersionCreateRequestSchema>;

export const VideoEnvironmentApproveRequestSchema = z.strictObject({ digest: Sha256Schema });
export type VideoEnvironmentApproveRequest = z.infer<typeof VideoEnvironmentApproveRequestSchema>;

/** The project owns the frame-step cost; a null model generates an empty background. */
export const VideoEnvironmentAngleRequestSchema = z.strictObject({
  projectId: VideoEngineIdSchema,
  name: VideoEnvironmentAngleNameSchema,
  framing: DescriptionPartSchema,
  modelId: VideoModelIdSchema.nullable(),
  maxCostUsd: z.number().positive().finite(),
});
export type VideoEnvironmentAngleRequest = z.infer<typeof VideoEnvironmentAngleRequestSchema>;
