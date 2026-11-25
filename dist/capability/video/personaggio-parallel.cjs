"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoParallelExportErrorSchema = exports.VideoParallelExportSchema = exports.VideoParallelExportQuerySchema = exports.VideoParallelCharacterSchema = exports.VideoParallelMissingSchema = exports.VideoParallelConsentSchema = exports.VideoParallelVoiceSchema = exports.VideoParallelStyleSchema = exports.VideoParallelAppearanceSchema = exports.VideoParallelPersonTypeSchema = exports.VideoParallelPortraitSchema = exports.VideoParallelViewSchema = exports.VideoParallelCommunityIdSchema = exports.VideoParallelCharacterIdSchema = exports.VIDEO_PARALLEL_MAX_BACKSTORY = exports.VIDEO_PARALLEL_MAX_PORTRAITS = void 0;
const zod_1 = require("zod");
const modella_js_1 = require("./modella.cjs");
exports.VIDEO_PARALLEL_MAX_PORTRAITS = 8;
exports.VIDEO_PARALLEL_MAX_BACKSTORY = 4000;
exports.VideoParallelCharacterIdSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{1,100}$/);
exports.VideoParallelCommunityIdSchema = zod_1.z.string().regex(/^[0-9A-Z]{26}$/);
exports.VideoParallelViewSchema = modella_js_1.VideoModelRefKindSchema;
const Sha256Schema = zod_1.z.string().regex(/^[0-9a-f]{64}$/);
const PersonDetailListSchema = zod_1.z.array(zod_1.z.string().min(1).max(200)).max(20);
const AppearanceDetailSchema = zod_1.z.string().max(200).nullable().optional();
exports.VideoParallelPortraitSchema = zod_1.z.strictObject({
    imageId: zod_1.z.string().regex(/^[a-z0-9_-]{1,64}$/),
    assetUrl: zod_1.z.url().max(2000),
    contentType: zod_1.z.enum(modella_js_1.VIDEO_MODEL_REF_MEDIA_TYPES),
    sizeBytes: zod_1.z.number().int().min(1).max(modella_js_1.VIDEO_MODEL_REF_MAX_BYTES),
    view: exports.VideoParallelViewSchema.nullable().optional(),
    sha256: Sha256Schema.optional(),
});
exports.VideoParallelPersonTypeSchema = zod_1.z.strictObject({
    role: zod_1.z.string().min(1).max(200).nullable(),
    archetype: zod_1.z.enum(['engineer', 'fixer', 'challenger', 'diplomat', 'networker']).nullable().optional(),
    ladder: zod_1.z.enum(['R0', 'R1', 'R2', 'R3', 'R4', 'R5']).nullable().optional(),
    hobbies: PersonDetailListSchema.optional(),
    motivations: PersonDetailListSchema.optional(),
    flaws: PersonDetailListSchema.optional(),
    languages: PersonDetailListSchema.optional(),
});
exports.VideoParallelAppearanceSchema = zod_1.z.strictObject({
    hairColor: AppearanceDetailSchema,
    hairStyle: AppearanceDetailSchema,
    eyeColor: AppearanceDetailSchema,
    build: AppearanceDetailSchema,
    facialHair: AppearanceDetailSchema,
    distinguishingFeatures: AppearanceDetailSchema,
    skinTone: zod_1.z.string().max(40).nullable().optional(),
    heritage: zod_1.z.string().max(100).nullable().optional(),
    offDutyStyle: zod_1.z.string().max(600).nullable().optional(),
});
exports.VideoParallelStyleSchema = zod_1.z.strictObject({
    toneGuidelines: zod_1.z.string().min(1).max(800),
    styleTags: zod_1.z.array(zod_1.z.string().min(1).max(40)).max(20).optional(),
    wardrobeRules: PersonDetailListSchema.optional(),
});
exports.VideoParallelVoiceSchema = zod_1.z.strictObject({
    provider: zod_1.z.enum(['elevenlabs', 'segnaposto']),
    voiceId: zod_1.z.string().min(1).max(100),
    label: zod_1.z.string().max(100).nullable().optional(),
});
exports.VideoParallelConsentSchema = zod_1.z.strictObject({
    scope: zod_1.z.literal('officina-video'),
    grantedBy: zod_1.z.string().min(1).max(256),
    grantedAt: zod_1.z.string().min(1).max(40),
    revokedAt: zod_1.z.string().min(1).max(40).nullable(),
});
exports.VideoParallelMissingSchema = zod_1.z.enum([
    'portraitViews', 'portraitDigest', 'voice', 'styleLabels', 'wardrobeRules', 'consent', 'version',
]);
/** Only fields available for every current character are required. */
exports.VideoParallelCharacterSchema = zod_1.z.strictObject({
    characterId: exports.VideoParallelCharacterIdSchema,
    name: zod_1.z.string().min(1).max(200),
    backstory: zod_1.z.string().min(1).max(exports.VIDEO_PARALLEL_MAX_BACKSTORY),
    style: exports.VideoParallelStyleSchema,
    portraits: zod_1.z.array(exports.VideoParallelPortraitSchema).min(1).max(exports.VIDEO_PARALLEL_MAX_PORTRAITS),
    personType: exports.VideoParallelPersonTypeSchema.optional(),
    appearance: exports.VideoParallelAppearanceSchema.optional(),
    voice: exports.VideoParallelVoiceSchema.nullable().optional(),
    consent: exports.VideoParallelConsentSchema.nullable().optional(),
    version: Sha256Schema.optional(),
    missing: zod_1.z.array(exports.VideoParallelMissingSchema).max(7).optional(),
});
exports.VideoParallelExportQuerySchema = zod_1.z.strictObject({ communityId: exports.VideoParallelCommunityIdSchema });
exports.VideoParallelExportSchema = zod_1.z.strictObject({
    communityId: exports.VideoParallelCommunityIdSchema,
    groups: zod_1.z.array(zod_1.z.strictObject({
        tenantId: zod_1.z.string().min(1).max(256),
        ownerId: zod_1.z.string().min(1).max(256),
        characters: zod_1.z.array(exports.VideoParallelCharacterSchema).max(50),
    })).max(10),
});
exports.VideoParallelExportErrorSchema = zod_1.z.strictObject({
    error: zod_1.z.enum(['comunita_non_trovata', 'comunita_non_pronta', 'non_autorizzato']),
});
//# sourceMappingURL=personaggio-parallel.js.map