"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLongProductionSchema = exports.VideoLongJoinRequestSchema = exports.VideoLongFinalVideoSchema = exports.VideoLongChapterRunSchema = exports.VideoLongChapterVideoSchema = exports.VideoLongChapterFramesApproveRequestSchema = exports.VideoLongChapterFramesSchema = exports.VideoLongFrameImageSchema = exports.VideoLongRunStageStateSchema = exports.VideoLongRunRefusalSchema = exports.VideoLongRunRequestSchema = exports.VideoLongRunQuoteSchema = exports.VideoLongRunQuoteRequestSchema = exports.VideoLongRunStatusSchema = exports.VideoLongRunStageSchema = exports.VideoLongProductionSettingsSchema = exports.VideoLongVoiceSettingsSchema = exports.VideoCostBasisSchema = void 0;
const zod_1 = require("zod");
const ambiente_js_1 = require("./ambiente.cjs");
const costo_passi_js_1 = require("./costo-passi.cjs");
const engine_js_1 = require("./engine.cjs");
const lungo_fotogrammi_js_1 = require("./lungo-fotogrammi.cjs");
const lungo_js_1 = require("./lungo.cjs");
// Cost ledger entries retain the shared basis vocabulary; production adds no basis field.
var costo_passi_js_2 = require("./costo-passi.cjs");
Object.defineProperty(exports, "VideoCostBasisSchema", { enumerable: true, get: function () { return costo_passi_js_2.VideoCostBasisSchema; } });
const ChapterIndexSchema = zod_1.z.number().int().min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS);
const QuoteIdSchema = engine_js_1.VideoEngineIdSchema;
const TimestampSchema = zod_1.z.string().min(1).max(40);
const VideoPathSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{1,100}\.mp4$/);
const Sha256Schema = ambiente_js_1.VideoEnvironmentAngleSchema.shape.sha256;
exports.VideoLongVoiceSettingsSchema = zod_1.z.strictObject({
    provider: zod_1.z.enum(['elevenlabs', 'openai']),
    model: zod_1.z.string().min(1).max(100),
    voice: zod_1.z.string().min(1).max(80),
});
/** Settings are chosen once per project; chapter assembly uses FFmpeg. */
exports.VideoLongProductionSettingsSchema = zod_1.z.strictObject({
    frameProvider: zod_1.z.enum(['fal', 'byteplus', 'minimax']),
    frameModel: zod_1.z.string().min(1).max(100).nullable(),
    clipProvider: zod_1.z.enum(['minimax', 'fal', 'byteplus']),
    clipModel: zod_1.z.string().min(1).max(100),
    voice: exports.VideoLongVoiceSettingsSchema,
    subtitles: zod_1.z.enum(['morbidi', 'nessuno']),
});
/** Declaration order is the chapter production chain. */
exports.VideoLongRunStageSchema = zod_1.z.enum(['fotogrammi', 'voce', 'clip', 'montaggio']);
exports.VideoLongRunStatusSchema = zod_1.z.enum(['da-fare', 'in-corso', 'da-approvare', 'approvato', 'completo', 'fallito']);
exports.VideoLongRunQuoteRequestSchema = zod_1.z.strictObject({
    chapterIndex: ChapterIndexSchema,
    stage: exports.VideoLongRunStageSchema,
});
/** Unknown or expired tariffs use null, never a zero-cost placeholder.
 * The engine computes the 25% reserve and quote expiry against the project budget.
 */
exports.VideoLongRunQuoteSchema = zod_1.z.strictObject({
    id: QuoteIdSchema,
    chapterIndex: ChapterIndexSchema,
    stage: exports.VideoLongRunStageSchema,
    units: zod_1.z.number().int().min(0),
    unit: costo_passi_js_1.VideoCostUnitSchema,
    estimatedUsd: zod_1.z.number().min(0).finite().nullable(),
    reserveUsd: zod_1.z.number().min(0).finite().nullable(),
    remainingBudgetUsd: zod_1.z.number().min(0).finite(),
    tariffDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tariffFresh: zod_1.z.boolean(),
    expiresAt: TimestampSchema,
});
exports.VideoLongRunRequestSchema = zod_1.z.strictObject({
    chapterIndex: ChapterIndexSchema,
    stage: exports.VideoLongRunStageSchema,
    quoteId: QuoteIdSchema,
    framesRevision: engine_js_1.VideoEngineRevisionSchema,
});
exports.VideoLongRunRefusalSchema = zod_1.z.enum([
    'piano_non_approvato', 'fotogrammi_non_approvati', 'preventivo_scaduto',
    'preventivo_diverso', 'tetto_superato', 'tariffa_scaduta', 'fornitore_non_pronto',
    'tappa_gia_in_corso', 'esito_incerto', 'progetto_sconosciuto', 'motore_non_disponibile',
    'voce_mancante',
]);
/** The engine checks stage order, frame-only approvals and done == total on completion. */
exports.VideoLongRunStageStateSchema = zod_1.z.strictObject({
    stage: exports.VideoLongRunStageSchema,
    status: exports.VideoLongRunStatusSchema,
    done: zod_1.z.number().int().min(0),
    total: zod_1.z.number().int().min(0),
    reused: zod_1.z.number().int().min(0),
    estimatedUsd: zod_1.z.number().min(0).finite(),
    confirmedUsd: zod_1.z.number().min(0).finite().nullable(),
});
exports.VideoLongFrameImageSchema = zod_1.z.strictObject({
    shotIndex: zod_1.z.number().int().min(1).max(lungo_fotogrammi_js_1.VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
    imagePath: ambiente_js_1.VideoEnvironmentAngleSchema.shape.imagePath,
    sha256: Sha256Schema,
    /** Measured facial similarity; null means no measurement, not automatic approval. */
    similarity: zod_1.z.number().min(0).max(1).nullable(),
    status: zod_1.z.enum(['generato', 'da-rigenerare', 'approvato']),
});
exports.VideoLongChapterFramesSchema = zod_1.z.strictObject({
    chapterIndex: ChapterIndexSchema,
    revision: engine_js_1.VideoEngineRevisionSchema,
    status: lungo_fotogrammi_js_1.VideoLongFramesStatusSchema,
    digest: lungo_fotogrammi_js_1.VideoLongFramesApproveRequestSchema.shape.digest,
    frames: zod_1.z.array(exports.VideoLongFrameImageSchema).max(lungo_fotogrammi_js_1.VIDEO_LONG_MAX_SHOTS_PER_CHAPTER),
    approvedAt: TimestampSchema.nullable(),
});
exports.VideoLongChapterFramesApproveRequestSchema = lungo_fotogrammi_js_1.VideoLongFramesApproveRequestSchema;
exports.VideoLongChapterVideoSchema = zod_1.z.strictObject({
    path: VideoPathSchema,
    sha256: Sha256Schema,
    seconds: zod_1.z.number().positive().finite(),
});
exports.VideoLongChapterRunSchema = zod_1.z.strictObject({
    chapterIndex: ChapterIndexSchema,
    batches: zod_1.z.number().int().min(1).max(10),
    stages: zod_1.z.array(exports.VideoLongRunStageStateSchema).length(4),
    chapterVideo: exports.VideoLongChapterVideoSchema.nullable(),
});
/** The engine checks consecutive chapter indexes and a timeline without gaps. */
exports.VideoLongFinalVideoSchema = zod_1.z.strictObject({
    path: VideoPathSchema,
    sha256: Sha256Schema,
    seconds: zod_1.z.number().positive().finite(),
    aspectRatio: zod_1.z.literal('16:9'),
    chapters: zod_1.z.array(zod_1.z.strictObject({
        index: ChapterIndexSchema,
        startSeconds: zod_1.z.number().min(0).finite(),
        seconds: zod_1.z.number().positive().finite(),
    })).min(1).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS),
    subtitles: zod_1.z.boolean(),
    createdAt: TimestampSchema,
});
exports.VideoLongJoinRequestSchema = zod_1.z.strictObject({
    framesRevision: engine_js_1.VideoEngineRevisionSchema,
});
exports.VideoLongProductionSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema,
    settings: exports.VideoLongProductionSettingsSchema.nullable(),
    chapters: zod_1.z.array(exports.VideoLongChapterRunSchema).max(lungo_js_1.VIDEO_LONG_MAX_CHAPTERS),
    finalVideo: exports.VideoLongFinalVideoSchema.nullable(),
    updatedAt: TimestampSchema,
});
//# sourceMappingURL=lungo-produzione.js.map