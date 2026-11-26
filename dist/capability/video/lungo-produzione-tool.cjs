"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLongJoinToolResponseSchema = exports.VideoLongChapterFramesApproveToolResponseSchema = exports.VideoLongRunStartToolResponseSchema = exports.VideoLongRunQuoteToolResponseSchema = exports.VideoLongProductionSettingsPutToolResponseSchema = exports.VideoLongFramesApproveToolResponseSchema = exports.VideoLongFramesPutToolResponseSchema = exports.VideoLongVideoGetToolResponseSchema = exports.VideoLongChapterFramesGetToolResponseSchema = exports.VideoLongProductionGetToolResponseSchema = exports.VideoLongFramesGetToolResponseSchema = exports.VideoLongVideoGetToolInputSchema = exports.VideoLongJoinToolInputSchema = exports.VideoLongChapterFramesApproveToolInputSchema = exports.VideoLongChapterFramesGetToolInputSchema = exports.VideoLongRunStartToolInputSchema = exports.VideoLongRunQuoteToolInputSchema = exports.VideoLongProductionGetToolInputSchema = exports.VideoLongProductionSettingsPutToolInputSchema = exports.VideoLongFramesApproveToolInputSchema = exports.VideoLongFramesGetToolInputSchema = exports.VideoLongFramesPutToolInputSchema = exports.VIDEO_LONG_VIDEO_GET_TOOL = exports.VIDEO_LONG_JOIN_TOOL = exports.VIDEO_LONG_CHAPTER_FRAMES_APPROVE_TOOL = exports.VIDEO_LONG_CHAPTER_FRAMES_GET_TOOL = exports.VIDEO_LONG_RUN_START_TOOL = exports.VIDEO_LONG_RUN_QUOTE_TOOL = exports.VIDEO_LONG_PRODUCTION_GET_TOOL = exports.VIDEO_LONG_PRODUCTION_SETTINGS_PUT_TOOL = exports.VIDEO_LONG_FRAMES_APPROVE_TOOL = exports.VIDEO_LONG_FRAMES_GET_TOOL = exports.VIDEO_LONG_FRAMES_PUT_TOOL = void 0;
const zod_1 = require("zod");
const lungo_js_1 = require("./lungo.cjs");
const lungo_fotogrammi_js_1 = require("./lungo-fotogrammi.cjs");
const lungo_produzione_js_1 = require("./lungo-produzione.cjs");
exports.VIDEO_LONG_FRAMES_PUT_TOOL = 'video_long_frames_put';
exports.VIDEO_LONG_FRAMES_GET_TOOL = 'video_long_frames_get';
exports.VIDEO_LONG_FRAMES_APPROVE_TOOL = 'video_long_frames_approve';
exports.VIDEO_LONG_PRODUCTION_SETTINGS_PUT_TOOL = 'video_long_production_settings_put';
exports.VIDEO_LONG_PRODUCTION_GET_TOOL = 'video_long_production_get';
exports.VIDEO_LONG_RUN_QUOTE_TOOL = 'video_long_run_quote';
exports.VIDEO_LONG_RUN_START_TOOL = 'video_long_run_start';
exports.VIDEO_LONG_CHAPTER_FRAMES_GET_TOOL = 'video_long_chapter_frames_get';
exports.VIDEO_LONG_CHAPTER_FRAMES_APPROVE_TOOL = 'video_long_chapter_frames_approve';
exports.VIDEO_LONG_JOIN_TOOL = 'video_long_join';
exports.VIDEO_LONG_VIDEO_GET_TOOL = 'video_long_video_get';
/** Identity comes only from the admitted envelope (R-33). cap-video supplies null usage. */
exports.VideoLongFramesPutToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    chaptersRevision: lungo_fotogrammi_js_1.VideoLongFramesDocumentSchema.shape.chaptersRevision.describe('Revisione dei capitoli approvati.'),
    chapters: lungo_fotogrammi_js_1.VideoLongFramesDocumentSchema.shape.chapters.describe('Capitoli con il piano delle inquadrature.'),
}).describe('Salva il piano delle inquadrature dei capitoli approvati.');
exports.VideoLongFramesGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge il piano delle inquadrature.');
exports.VideoLongFramesApproveToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    revision: lungo_fotogrammi_js_1.VideoLongFramesApproveRequestSchema.shape.revision.describe('Revisione del contenuto visto dalla persona.'),
    digest: lungo_fotogrammi_js_1.VideoLongFramesApproveRequestSchema.shape.digest.describe('Impronta del contenuto visto dalla persona, in esadecimale minuscolo.'),
}).describe('Approva il piano delle inquadrature letto dalla persona.');
exports.VideoLongProductionSettingsPutToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    frameProvider: lungo_produzione_js_1.VideoLongProductionSettingsSchema.shape.frameProvider.describe('Fornitore che genera i fotogrammi.'),
    frameModel: lungo_produzione_js_1.VideoLongProductionSettingsSchema.shape.frameModel.describe('Modello per i fotogrammi, oppure null per quello predefinito.'),
    clipProvider: lungo_produzione_js_1.VideoLongProductionSettingsSchema.shape.clipProvider.describe('Fornitore che genera le clip.'),
    clipModel: lungo_produzione_js_1.VideoLongProductionSettingsSchema.shape.clipModel.describe('Modello che genera le clip.'),
    voice: lungo_produzione_js_1.VideoLongProductionSettingsSchema.shape.voice.describe('Fornitore, modello e voce della narrazione.'),
    subtitles: lungo_produzione_js_1.VideoLongProductionSettingsSchema.shape.subtitles.describe('Sottotitoli separati oppure nessun sottotitolo.'),
}).describe('Salva le impostazioni di produzione del progetto.');
exports.VideoLongProductionGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge lo stato della produzione del progetto.');
exports.VideoLongRunQuoteToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    chapterIndex: lungo_produzione_js_1.VideoLongRunQuoteRequestSchema.shape.chapterIndex.describe('Numero del capitolo, da 1 a 24.'),
    stage: lungo_produzione_js_1.VideoLongRunQuoteRequestSchema.shape.stage.describe('Passo da eseguire: fotogrammi, voce, clip o montaggio.'),
}).describe('Richiede il preventivo di un passo per un capitolo.');
exports.VideoLongRunStartToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    chapterIndex: lungo_produzione_js_1.VideoLongRunQuoteRequestSchema.shape.chapterIndex.describe('Numero del capitolo, da 1 a 24.'),
    stage: lungo_produzione_js_1.VideoLongRunQuoteRequestSchema.shape.stage.describe('Passo da eseguire: fotogrammi, voce, clip o montaggio.'),
    quoteId: lungo_produzione_js_1.VideoLongRunRequestSchema.shape.quoteId.describe('Identificativo del preventivo accettato.'),
    framesRevision: lungo_produzione_js_1.VideoLongJoinRequestSchema.shape.framesRevision.describe('Revisione del piano delle inquadrature approvato.'),
}).describe('Avvia il passo del capitolo con il preventivo accettato.');
exports.VideoLongChapterFramesGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    chapterIndex: lungo_produzione_js_1.VideoLongRunQuoteRequestSchema.shape.chapterIndex.describe('Numero del capitolo, da 1 a 24.'),
}).describe('Legge i fotogrammi generati per il capitolo.');
exports.VideoLongChapterFramesApproveToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    chapterIndex: lungo_produzione_js_1.VideoLongRunQuoteRequestSchema.shape.chapterIndex.describe('Numero del capitolo, da 1 a 24.'),
    revision: lungo_fotogrammi_js_1.VideoLongFramesApproveRequestSchema.shape.revision.describe('Revisione del contenuto visto dalla persona.'),
    digest: lungo_fotogrammi_js_1.VideoLongFramesApproveRequestSchema.shape.digest.describe('Impronta del contenuto visto dalla persona, in esadecimale minuscolo.'),
}).describe('Approva i fotogrammi del capitolo visti dalla persona.');
exports.VideoLongJoinToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    framesRevision: lungo_produzione_js_1.VideoLongJoinRequestSchema.shape.framesRevision.describe('Revisione del piano delle inquadrature approvato.'),
}).describe('Unisce i capitoli completati secondo il piano approvato.');
exports.VideoLongVideoGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge il video finale del progetto.');
exports.VideoLongFramesGetToolResponseSchema = lungo_fotogrammi_js_1.VideoLongFramesSchema;
exports.VideoLongProductionGetToolResponseSchema = lungo_produzione_js_1.VideoLongProductionSchema;
exports.VideoLongChapterFramesGetToolResponseSchema = lungo_produzione_js_1.VideoLongChapterFramesSchema;
exports.VideoLongVideoGetToolResponseSchema = lungo_produzione_js_1.VideoLongFinalVideoSchema;
exports.VideoLongFramesPutToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('salvato'), frames: lungo_fotogrammi_js_1.VideoLongFramesSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'capitoli_non_approvati',
            'revisione_cambiata',
            'capitoli_diversi',
            'inquadrature_non_valide',
            'durata_fuori_misura',
            'parlato_troppo_lungo',
            'progetto_sconosciuto',
            'motore_non_disponibile',
        ]),
        message: zod_1.z.string(),
    }),
]);
exports.VideoLongFramesApproveToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('approvato'), frames: lungo_fotogrammi_js_1.VideoLongFramesSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'revisione_superata',
            'capitoli_non_approvati',
            'capitoli_cambiati',
            'impronta_diversa',
            'piano_non_trovato',
            'progetto_sconosciuto',
            'motore_non_disponibile',
        ]),
        message: zod_1.z.string(),
    }),
]);
exports.VideoLongProductionSettingsPutToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('salvate'), production: lungo_produzione_js_1.VideoLongProductionSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'impostazioni_non_valide',
            'tappa_gia_in_corso',
            'impostazioni_bloccate',
            'fornitore_non_pronto',
            'piano_non_approvato',
            'progetto_sconosciuto',
            'motore_non_disponibile',
        ]),
        message: zod_1.z.string(),
    }),
]);
exports.VideoLongRunQuoteToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('preventivo'), quote: lungo_produzione_js_1.VideoLongRunQuoteSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'piano_non_approvato',
            'fotogrammi_non_approvati',
            'fornitore_non_pronto',
            'tariffa_scaduta',
            'progetto_sconosciuto',
            'motore_non_disponibile',
            'voce_mancante',
        ]),
        message: zod_1.z.string(),
    }),
]);
exports.VideoLongRunStartToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('avviata'), production: lungo_produzione_js_1.VideoLongProductionSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: lungo_produzione_js_1.VideoLongRunRefusalSchema,
        message: zod_1.z.string(),
    }),
]);
exports.VideoLongChapterFramesApproveToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('approvati'), frames: lungo_produzione_js_1.VideoLongChapterFramesSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'revisione_superata',
            'impronta_diversa',
            'fotogrammi_non_trovati',
            'piano_cambiato',
            'progetto_sconosciuto',
            'motore_non_disponibile',
            'fotogrammi_da_rigenerare',
            'fotogrammi_incompleti',
            'capitolo_non_trovato',
        ]),
        message: zod_1.z.string(),
    }),
]);
exports.VideoLongJoinToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('unito'), video: lungo_produzione_js_1.VideoLongFinalVideoSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'capitoli_incompleti',
            'piano_cambiato',
            'progetto_sconosciuto',
            'motore_non_disponibile',
            'fotogrammi_non_approvati',
        ]),
        message: zod_1.z.string(),
    }),
]);
//# sourceMappingURL=lungo-produzione-tool.js.map