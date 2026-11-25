"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLongChaptersApproveToolResponseSchema = exports.VideoLongChaptersPutToolResponseSchema = exports.VideoLongResearchStartToolResponseSchema = exports.VideoLongChaptersGetToolResponseSchema = exports.VideoLongDossierGetToolResponseSchema = exports.VideoLongResearchGetToolResponseSchema = exports.VideoLongChaptersApproveToolInputSchema = exports.VideoLongChaptersGetToolInputSchema = exports.VideoLongChaptersPutToolInputSchema = exports.VideoLongDossierGetToolInputSchema = exports.VideoLongResearchGetToolInputSchema = exports.VideoLongResearchStartToolInputSchema = exports.VIDEO_LONG_CHAPTERS_APPROVE_TOOL = exports.VIDEO_LONG_CHAPTERS_GET_TOOL = exports.VIDEO_LONG_CHAPTERS_PUT_TOOL = exports.VIDEO_LONG_DOSSIER_GET_TOOL = exports.VIDEO_LONG_RESEARCH_GET_TOOL = exports.VIDEO_LONG_RESEARCH_START_TOOL = void 0;
const zod_1 = require("zod");
const lungo_js_1 = require("./lungo.cjs");
const lungo_ricerca_js_1 = require("./lungo-ricerca.cjs");
exports.VIDEO_LONG_RESEARCH_START_TOOL = 'video_long_research_start';
exports.VIDEO_LONG_RESEARCH_GET_TOOL = 'video_long_research_get';
exports.VIDEO_LONG_DOSSIER_GET_TOOL = 'video_long_dossier_get';
exports.VIDEO_LONG_CHAPTERS_PUT_TOOL = 'video_long_chapters_put';
exports.VIDEO_LONG_CHAPTERS_GET_TOOL = 'video_long_chapters_get';
exports.VIDEO_LONG_CHAPTERS_APPROVE_TOOL = 'video_long_chapters_approve';
/**
 * Identity comes only from the admitted tool envelope (R-33); the lab scope
 * (labClientId, labProjectId) is filled in by cap-video, never by the model.
 */
exports.VideoLongResearchStartToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    draftRevision: lungo_ricerca_js_1.VideoLongResearchStartRequestSchema.shape.draftRevision.describe('Revisione della bozza approvata da cui parte la ricerca.'),
    draftDigest: lungo_ricerca_js_1.VideoLongResearchStartRequestSchema.shape.draftDigest.describe('Impronta della bozza approvata, in esadecimale minuscolo.'),
    questions: lungo_ricerca_js_1.VideoLongResearchStartRequestSchema.shape.questions.describe('Domande della ricerca, da 1 a 12.'),
}).describe('Avvia la ricerca con fonti, solo su una bozza approvata.');
exports.VideoLongResearchGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge lo stato della ricerca del progetto lungo.');
exports.VideoLongDossierGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge il dossier di fonti e affermazioni del progetto lungo.');
/** cap-video supplies usage as null; the model cannot declare consumption. */
exports.VideoLongChaptersPutToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    ...lungo_ricerca_js_1.VideoLongChaptersDocumentSchema.omit({ usage: true }).shape,
}).extend({
    draftRevision: lungo_ricerca_js_1.VideoLongChaptersDocumentSchema.shape.draftRevision.describe('Revisione della bozza approvata.'),
    dossierRevision: lungo_ricerca_js_1.VideoLongChaptersDocumentSchema.shape.dossierRevision.describe('Revisione del dossier usato per i capitoli.'),
    chapters: lungo_ricerca_js_1.VideoLongChaptersDocumentSchema.shape.chapters.describe('Capitoli con fonti e ipotesi di inquadratura, da 1 a 24.'),
}).describe('Salva i capitoli con fonti e ipotesi di inquadratura.');
exports.VideoLongChaptersGetToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge i capitoli del progetto lungo.');
exports.VideoLongChaptersApproveToolInputSchema = zod_1.z.strictObject({
    projectId: lungo_js_1.VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
    revision: lungo_ricerca_js_1.VideoLongChaptersApproveRequestSchema.shape.revision.describe('Revisione dei capitoli vista dalla persona.'),
    digest: lungo_ricerca_js_1.VideoLongChaptersApproveRequestSchema.shape.digest.describe('Impronta dei capitoli vista dalla persona, in esadecimale minuscolo.'),
}).describe('Approva la revisione e il contenuto dei capitoli letti.');
exports.VideoLongResearchGetToolResponseSchema = lungo_ricerca_js_1.VideoLongResearchSchema;
exports.VideoLongDossierGetToolResponseSchema = lungo_ricerca_js_1.VideoLongDossierSchema;
exports.VideoLongChaptersGetToolResponseSchema = lungo_ricerca_js_1.VideoLongChaptersSchema;
exports.VideoLongResearchStartToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('avviata'), research: lungo_ricerca_js_1.VideoLongResearchSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'bozza_non_approvata',
            'revisione_cambiata',
            'impronta_diversa',
            'ricerca_gia_avviata',
            'progetto_sconosciuto',
            'richiesta_non_valida',
            'lab_non_collegato',
            'motore_non_disponibile',
        ]),
        message: zod_1.z.string(),
    }),
]);
exports.VideoLongChaptersPutToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('salvati'), chapters: lungo_ricerca_js_1.VideoLongChaptersSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'bozza_non_approvata',
            'dossier_non_trovato',
            'revisione_cambiata',
            'dossier_cambiato',
            'capitoli_non_validi',
            'durata_fuori_misura',
            'progetto_sconosciuto',
            'motore_non_disponibile',
        ]),
        message: zod_1.z.string(),
    }),
]);
exports.VideoLongChaptersApproveToolResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('approvati'), chapters: lungo_ricerca_js_1.VideoLongChaptersSchema }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('rifiutata'),
        reason: zod_1.z.enum([
            'revisione_superata',
            'dossier_cambiato',
            'impronta_diversa',
            'bozza_non_approvata',
            'capitoli_non_trovati',
            'progetto_sconosciuto',
            'motore_non_disponibile',
        ]),
        message: zod_1.z.string(),
    }),
]);
//# sourceMappingURL=lungo-ricerca-tool.js.map