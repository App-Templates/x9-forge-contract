import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { VideoEngineIdSchema } from "./engine.js";
import { VideoModelIdSchema } from "./modella.js";
export const VIDEO_ENVIRONMENT_KINDS = ['studio', 'esterno', 'documentario'];
export const VIDEO_ENVIRONMENT_MAX_ANGLES = 10;
export const VIDEO_ENVIRONMENT_MAX_VERSIONS = 50;
export const VIDEO_ENVIRONMENT_MAX_PER_AGENT = 200;
export const VideoEnvironmentIdSchema = z.string().regex(/^[a-z][a-z0-9-]{0,47}$/);
export const VideoEnvironmentKindSchema = z.enum(VIDEO_ENVIRONMENT_KINDS);
export const VideoEnvironmentNameSchema = z.string().trim().min(1).max(80);
export const VideoEnvironmentVersionNumberSchema = z.number().int().min(1).max(VIDEO_ENVIRONMENT_MAX_VERSIONS);
/** Version number as a path segment. The engine checks the version range. */
export const VideoEnvironmentVersionParamSchema = z.string().regex(/^[1-9][0-9]{0,1}$/);
export const VideoEnvironmentAngleNameSchema = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);
const Sha256Schema = z.string().regex(/^[0-9a-f]{64}$/);
const TimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/);
const DescriptionPartSchema = z.string().trim().min(1).max(300);
export const VideoEnvironmentDescriptionSchema = z.strictObject({
    room: DescriptionPartSchema,
    furniture: DescriptionPartSchema,
    light: DescriptionPartSchema,
});
export const VideoEnvironmentAngleSchema = z.strictObject({
    name: VideoEnvironmentAngleNameSchema,
    framing: DescriptionPartSchema,
    imagePath: z.string().regex(/^[A-Za-z0-9_-]{1,100}\.(png|jpg|jpeg)$/),
    sha256: Sha256Schema,
});
export const VideoEnvironmentVersionStatusSchema = z.enum(['bozza', 'approvata', 'sostituita']);
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
export const VideoEnvironmentSchema = z.strictObject({
    id: VideoEnvironmentIdSchema,
    name: VideoEnvironmentNameSchema,
    kind: VideoEnvironmentKindSchema,
    identity: CapabilityAgentScopeSchema,
    versions: z.array(VideoEnvironmentVersionSchema).max(VIDEO_ENVIRONMENT_MAX_VERSIONS),
    currentVersion: VideoEnvironmentVersionNumberSchema.nullable(),
});
export const VideoEnvironmentListSchema = z.strictObject({
    environments: z.array(VideoEnvironmentSchema).max(VIDEO_ENVIRONMENT_MAX_PER_AGENT),
});
/** Identity belongs in the query, never in an angle generation body. */
export const VideoEnvironmentScopeQuerySchema = CapabilityAgentScopeSchema;
export const VideoEnvironmentCreateRequestSchema = z.strictObject({
    name: VideoEnvironmentNameSchema,
    kind: VideoEnvironmentKindSchema,
    description: VideoEnvironmentDescriptionSchema,
});
export const VideoEnvironmentVersionCreateRequestSchema = z.strictObject({
    description: VideoEnvironmentDescriptionSchema,
});
export const VideoEnvironmentApproveRequestSchema = z.strictObject({ digest: Sha256Schema });
/** The project owns the frame-step cost; a null model generates an empty background. */
export const VideoEnvironmentAngleRequestSchema = z.strictObject({
    projectId: VideoEngineIdSchema,
    name: VideoEnvironmentAngleNameSchema,
    framing: DescriptionPartSchema,
    modelId: VideoModelIdSchema.nullable(),
    maxCostUsd: z.number().positive().finite(),
});
//# sourceMappingURL=ambiente.js.map