import { z } from 'zod';
import { VideoEnvironmentAngleSchema } from "./ambiente.js";
import { VideoCostUnitSchema } from "./costo-passi.js";
import { VideoEngineIdSchema, VideoEngineRevisionSchema } from "./engine.js";
import { VIDEO_LONG_MAX_SHOTS_PER_CHAPTER, VideoLongFramesApproveRequestSchema, VideoLongFramesStatusSchema, } from "./lungo-fotogrammi.js";
import { VIDEO_LONG_MAX_CHAPTERS, VideoLongProjectIdSchema } from "./lungo.js";
// Cost ledger entries retain the shared basis vocabulary; production adds no basis field.
export { VideoCostBasisSchema } from "./costo-passi.js";
const ChapterIndexSchema = z.number().int().min(1).max(VIDEO_LONG_MAX_CHAPTERS);
const QuoteIdSchema = VideoEngineIdSchema;
const TimestampSchema = z.string().min(1).max(40);
const VideoPathSchema = z.string().regex(/^[A-Za-z0-9_-]{1,100}\.mp4$/);
const Sha256Schema = VideoEnvironmentAngleSchema.shape.sha256;
export const VideoLongVoiceSettingsSchema = z.strictObject({
    provider: z.enum(['elevenlabs', 'openai']),
    model: z.string().min(1).max(100),
    voice: z.string().min(1).max(80),
});
/** Settings are chosen once per project; chapter assembly uses FFmpeg. */
export const VideoLongProductionSettingsSchema = z.strictObject({
    frameProvider: z.enum(['fal', 'byteplus', 'minimax']),
    frameModel: z.string().min(1).max(100).nullable(),
    clipProvider: z.enum(['minimax', 'fal', 'byteplus']),
    clipModel: z.string().min(1).max(100),
    voice: VideoLongVoiceSettingsSchema,
    subtitles: z.enum(['morbidi', 'nessuno']),
});
/** Declaration order is the chapter production chain. */
export const VideoLongRunStageSchema = z.enum(['fotogrammi', 'voce', 'clip', 'montaggio']);
export const VideoLongRunStatusSchema = z.enum(['da-fare', 'in-corso', 'da-approvare', 'approvato', 'completo', 'fallito']);
export const VideoLongRunQuoteRequestSchema = z.strictObject({
    chapterIndex: ChapterIndexSchema,
    stage: VideoLongRunStageSchema,
});
/** Unknown or expired tariffs use null, never a zero-cost placeholder.
 * The engine computes the 25% reserve and quote expiry against the project budget.
 */
export const VideoLongRunQuoteSchema = z.strictObject({
    id: QuoteIdSchema,
    chapterIndex: ChapterIndexSchema,
    stage: VideoLongRunStageSchema,
    units: z.number().int().min(0),
    unit: VideoCostUnitSchema,
    estimatedUsd: z.number().min(0).finite().nullable(),
    reserveUsd: z.number().min(0).finite().nullable(),
    remainingBudgetUsd: z.number().min(0).finite(),
    tariffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tariffFresh: z.boolean(),
    expiresAt: TimestampSchema,
});
export const VideoLongRunRequestSchema = z.strictObject({
    chapterIndex: ChapterIndexSchema,
    stage: VideoLongRunStageSchema,
    quoteId: QuoteIdSchema,
    framesRevision: VideoEngineRevisionSchema,
});
export const VideoLongRunRefusalSchema = z.enum([
    'piano_non_approvato', 'fotogrammi_non_approvati', 'preventivo_scaduto',
    'preventivo_diverso', 'tetto_superato', 'tariffa_scaduta', 'fornitore_non_pronto',
    'tappa_gia_in_corso', 'esito_incerto', 'progetto_sconosciuto', 'motore_non_disponibile',
]);
/** The engine checks stage order, frame-only approvals and done == total on completion. */
export const VideoLongRunStageStateSchema = z.strictObject({
    stage: VideoLongRunStageSchema,
    status: VideoLongRunStatusSchema,
    done: z.number().int().min(0),
    total: z.number().int().min(0),
    reused: z.number().int().min(0),
    estimatedUsd: z.number().min(0).finite(),
    confirmedUsd: z.number().min(0).finite().nullable(),
});
export const VideoLongFrameImageSchema = z.strictObject({
    shotIndex: z.number().int().min(1).max(VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
    imagePath: VideoEnvironmentAngleSchema.shape.imagePath,
    sha256: Sha256Schema,
    /** Measured facial similarity; null means no measurement, not automatic approval. */
    similarity: z.number().min(0).max(1).nullable(),
    status: z.enum(['generato', 'da-rigenerare', 'approvato']),
});
export const VideoLongChapterFramesSchema = z.strictObject({
    chapterIndex: ChapterIndexSchema,
    revision: VideoEngineRevisionSchema,
    status: VideoLongFramesStatusSchema,
    digest: VideoLongFramesApproveRequestSchema.shape.digest,
    frames: z.array(VideoLongFrameImageSchema).max(VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
    approvedAt: TimestampSchema.nullable(),
});
export const VideoLongChapterFramesApproveRequestSchema = VideoLongFramesApproveRequestSchema;
export const VideoLongChapterVideoSchema = z.strictObject({
    path: VideoPathSchema,
    sha256: Sha256Schema,
    seconds: z.number().positive().finite(),
});
export const VideoLongChapterRunSchema = z.strictObject({
    chapterIndex: ChapterIndexSchema,
    batches: z.number().int().min(1).max(10),
    stages: z.array(VideoLongRunStageStateSchema).length(4),
    chapterVideo: VideoLongChapterVideoSchema.nullable(),
});
/** The engine checks consecutive chapter indexes and a timeline without gaps. */
export const VideoLongFinalVideoSchema = z.strictObject({
    path: VideoPathSchema,
    sha256: Sha256Schema,
    seconds: z.number().positive().finite(),
    aspectRatio: z.literal('16:9'),
    chapters: z.array(z.strictObject({
        index: ChapterIndexSchema,
        startSeconds: z.number().min(0).finite(),
        seconds: z.number().positive().finite(),
    })).min(1).max(VIDEO_LONG_MAX_CHAPTERS),
    subtitles: z.boolean(),
    createdAt: TimestampSchema,
});
export const VideoLongJoinRequestSchema = z.strictObject({
    framesRevision: VideoEngineRevisionSchema,
});
export const VideoLongProductionSchema = z.strictObject({
    projectId: VideoLongProjectIdSchema,
    settings: VideoLongProductionSettingsSchema.nullable(),
    chapters: z.array(VideoLongChapterRunSchema).max(VIDEO_LONG_MAX_CHAPTERS),
    finalVideo: VideoLongFinalVideoSchema.nullable(),
    updatedAt: TimestampSchema,
});
//# sourceMappingURL=lungo-produzione.js.map