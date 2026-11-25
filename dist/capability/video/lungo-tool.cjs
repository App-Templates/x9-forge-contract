"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLongDraftApproveToolResponseSchema = exports.VideoLongDraftPutToolResponseSchema = exports.VideoLongCostGetToolResponseSchema = exports.VideoLongDraftGetToolResponseSchema = exports.VideoLongGetToolResponseSchema = exports.VideoLongListToolResponseSchema = exports.VideoLongCreateToolResponseSchema = exports.VideoLongCostGetToolInputSchema = exports.VideoLongDraftApproveToolInputSchema = exports.VideoLongDraftGetToolInputSchema = exports.VideoLongDraftPutToolInputSchema = exports.VideoLongGetToolInputSchema = exports.VideoLongListToolInputSchema = exports.VideoLongCreateToolInputSchema = exports.VIDEO_LONG_COST_GET_TOOL = exports.VIDEO_LONG_DRAFT_APPROVE_TOOL = exports.VIDEO_LONG_DRAFT_GET_TOOL = exports.VIDEO_LONG_DRAFT_PUT_TOOL = exports.VIDEO_LONG_GET_TOOL = exports.VIDEO_LONG_LIST_TOOL = exports.VIDEO_LONG_CREATE_TOOL = void 0;
const zod_1 = require("zod");
const lungo_js_1 = require("./lungo.cjs");
const lungo_bozza_js_1 = require("./lungo-bozza.cjs");
const costo_passi_js_1 = require("./costo-passi.cjs");
exports.VIDEO_LONG_CREATE_TOOL = 'video_long_create';
exports.VIDEO_LONG_LIST_TOOL = 'video_long_list';
exports.VIDEO_LONG_GET_TOOL = 'video_long_get';
exports.VIDEO_LONG_DRAFT_PUT_TOOL = 'video_long_draft_put';
exports.VIDEO_LONG_DRAFT_GET_TOOL = 'video_long_draft_get';
exports.VIDEO_LONG_DRAFT_APPROVE_TOOL = 'video_long_draft_approve';
exports.VIDEO_LONG_COST_GET_TOOL = 'video_long_cost_get';
/** Identity comes only from the admitted tool envelope (R-33). */
exports.VideoLongCreateToolInputSchema = lungo_js_1.VideoLongCreateRequestSchema.omit({ requestedBy: true }).extend({
    name: lungo_js_1.VideoLongCreateRequestSchema.shape.name.describe('Nome del progetto lungo.'),
    family: lungo_js_1.VideoLongCreateRequestSchema.shape.family.describe('Famiglia narrativa del video lungo.'),
    presetId: lungo_js_1.VideoLongCreateRequestSchema.shape.presetId.describe("Identificativo del preset dell'Officina."),
    aspectRatio: lungo_js_1.VideoLongCreateRequestSchema.shape.aspectRatio.describe('Formato del video.'),
    durationSeconds: lungo_js_1.VideoLongCreateRequestSchema.shape.durationSeconds.describe('Durata del video in secondi, da 120 a 1200.'),
    modelId: lungo_js_1.VideoLongCreateRequestSchema.shape.modelId.describe('Identificativo del personaggio; null se assente.'),
    brief: lungo_js_1.VideoLongCreateRequestSchema.shape.brief.describe('Indicazioni per il contenuto del video lungo.'),
    budgetUsd: lungo_js_1.VideoLongCreateRequestSchema.shape.budgetUsd.describe('Budget del progetto in dollari.'),
}).describe('Crea un progetto video lungo.');
exports.VideoLongListToolInputSchema = zod_1.z.strictObject({}).describe('Elenca i progetti video lunghi accessibili.');
exports.VideoLongGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge un progetto video lungo.');
/** cap-video supplies usage as null; the model cannot declare consumption. */
exports.VideoLongDraftPutToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    ...lungo_bozza_js_1.VideoLongDraftDocumentSchema.omit({ usage: true }).shape,
}).extend({
    logline: lungo_bozza_js_1.VideoLongDraftDocumentSchema.shape.logline.describe('Sintesi della storia in una riga.'),
    thesis: lungo_bozza_js_1.VideoLongDraftDocumentSchema.shape.thesis.describe('Tesi del video lungo.'),
    paragraphs: lungo_bozza_js_1.VideoLongDraftDocumentSchema.shape.paragraphs.describe('Testo della bozza, da 1 a 40 paragrafi.'),
    chapters: lungo_bozza_js_1.VideoLongDraftDocumentSchema.shape.chapters.describe('Capitoli della bozza con indice e durata prevista.'),
}).describe('Salva la bozza a capitoli del progetto lungo.');
exports.VideoLongDraftGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge la bozza del progetto lungo.');
exports.VideoLongDraftApproveToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    revision: lungo_bozza_js_1.VideoLongDraftApproveRequestSchema.shape.revision.describe('Revisione della bozza vista dalla persona.'),
    digest: lungo_bozza_js_1.VideoLongDraftApproveRequestSchema.shape.digest.describe('Impronta della bozza vista dalla persona, in esadecimale minuscolo.'),
}).describe('Approva la revisione e il contenuto della bozza letta.');
exports.VideoLongCostGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge i costi del progetto lungo suddivisi per passo.');
exports.VideoLongCreateToolResponseSchema = lungo_js_1.VideoLongProjectSchema;
exports.VideoLongListToolResponseSchema = lungo_js_1.VideoLongProjectListSchema;
exports.VideoLongGetToolResponseSchema = lungo_js_1.VideoLongProjectSchema;
exports.VideoLongDraftGetToolResponseSchema = lungo_bozza_js_1.VideoLongDraftSchema;
exports.VideoLongCostGetToolResponseSchema = costo_passi_js_1.VideoCostByStepSchema;
exports.VideoLongDraftPutToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('salvata'), draft: lungo_bozza_js_1.VideoLongDraftSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'somma_capitoli',
            'indici_non_consecutivi',
            'gia_approvata',
            'progetto_sconosciuto',
            'motore_non_disponibile',
        ]),
        message: zod_1.z.string(),
    }),
]);
exports.VideoLongDraftApproveToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('approvata'), draft: lungo_bozza_js_1.VideoLongDraftSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'bozza_mancante',
            'revisione_cambiata',
            'impronta_diversa',
            'gia_approvata',
            'progetto_sconosciuto',
            'motore_non_disponibile',
        ]),
        message: zod_1.z.string(),
    }),
]);
//# sourceMappingURL=lungo-tool.js.map