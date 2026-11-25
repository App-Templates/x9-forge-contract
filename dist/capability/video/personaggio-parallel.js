import { z } from 'zod';
import { VIDEO_MODEL_REF_MAX_BYTES, VIDEO_MODEL_REF_MEDIA_TYPES, VideoModelRefKindSchema } from "./modella.js";
export const VIDEO_PARALLEL_MAX_PORTRAITS = 8;
export const VIDEO_PARALLEL_MAX_BACKSTORY = 4000;
export const VideoParallelCharacterIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/);
export const VideoParallelCommunityIdSchema = z.string().regex(/^[0-9A-Z]{26}$/);
export const VideoParallelViewSchema = VideoModelRefKindSchema;
const Sha256Schema = z.string().regex(/^[0-9a-f]{64}$/);
const PersonDetailListSchema = z.array(z.string().min(1).max(200)).max(20);
const AppearanceDetailSchema = z.string().max(200).nullable().optional();
export const VideoParallelPortraitSchema = z.strictObject({
    imageId: z.string().regex(/^[a-z0-9_-]{1,64}$/),
    assetUrl: z.url().max(2000),
    contentType: z.enum(VIDEO_MODEL_REF_MEDIA_TYPES),
    sizeBytes: z.number().int().min(1).max(VIDEO_MODEL_REF_MAX_BYTES),
    view: VideoParallelViewSchema.nullable().optional(),
    sha256: Sha256Schema.optional(),
});
export const VideoParallelPersonTypeSchema = z.strictObject({
    role: z.string().min(1).max(200).nullable(),
    archetype: z.enum(['engineer', 'fixer', 'challenger', 'diplomat', 'networker']).nullable().optional(),
    ladder: z.enum(['R0', 'R1', 'R2', 'R3', 'R4', 'R5']).nullable().optional(),
    hobbies: PersonDetailListSchema.optional(),
    motivations: PersonDetailListSchema.optional(),
    flaws: PersonDetailListSchema.optional(),
    languages: PersonDetailListSchema.optional(),
});
export const VideoParallelAppearanceSchema = z.strictObject({
    hairColor: AppearanceDetailSchema,
    hairStyle: AppearanceDetailSchema,
    eyeColor: AppearanceDetailSchema,
    build: AppearanceDetailSchema,
    facialHair: AppearanceDetailSchema,
    distinguishingFeatures: AppearanceDetailSchema,
    skinTone: z.string().max(40).nullable().optional(),
    heritage: z.string().max(100).nullable().optional(),
    offDutyStyle: z.string().max(600).nullable().optional(),
});
export const VideoParallelStyleSchema = z.strictObject({
    toneGuidelines: z.string().min(1).max(800),
    styleTags: z.array(z.string().min(1).max(40)).max(20).optional(),
    wardrobeRules: PersonDetailListSchema.optional(),
});
export const VideoParallelVoiceSchema = z.strictObject({
    provider: z.enum(['elevenlabs', 'segnaposto']),
    voiceId: z.string().min(1).max(100),
    label: z.string().max(100).nullable().optional(),
});
export const VideoParallelConsentSchema = z.strictObject({
    scope: z.literal('officina-video'),
    grantedBy: z.string().min(1).max(256),
    grantedAt: z.string().min(1).max(40),
    revokedAt: z.string().min(1).max(40).nullable(),
});
export const VideoParallelMissingSchema = z.enum([
    'portraitViews', 'portraitDigest', 'voice', 'styleLabels', 'wardrobeRules', 'consent', 'version',
]);
/** Only fields available for every current character are required. */
export const VideoParallelCharacterSchema = z.strictObject({
    characterId: VideoParallelCharacterIdSchema,
    name: z.string().min(1).max(200),
    backstory: z.string().min(1).max(VIDEO_PARALLEL_MAX_BACKSTORY),
    style: VideoParallelStyleSchema,
    portraits: z.array(VideoParallelPortraitSchema).min(1).max(VIDEO_PARALLEL_MAX_PORTRAITS),
    personType: VideoParallelPersonTypeSchema.optional(),
    appearance: VideoParallelAppearanceSchema.optional(),
    voice: VideoParallelVoiceSchema.nullable().optional(),
    consent: VideoParallelConsentSchema.nullable().optional(),
    version: Sha256Schema.optional(),
    missing: z.array(VideoParallelMissingSchema).max(7).optional(),
});
export const VideoParallelExportQuerySchema = z.strictObject({ communityId: VideoParallelCommunityIdSchema });
export const VideoParallelExportSchema = z.strictObject({
    communityId: VideoParallelCommunityIdSchema,
    groups: z.array(z.strictObject({
        tenantId: z.string().min(1).max(256),
        ownerId: z.string().min(1).max(256),
        characters: z.array(VideoParallelCharacterSchema).max(50),
    })).max(10),
});
export const VideoParallelExportErrorSchema = z.strictObject({
    error: z.enum(['comunita_non_trovata', 'comunita_non_pronta', 'non_autorizzato']),
});
//# sourceMappingURL=personaggio-parallel.js.map