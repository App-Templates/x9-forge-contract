import { z } from 'zod';
import { VideoLongProjectIdSchema } from './lungo.js';
import {
  VideoLongChaptersApproveRequestSchema,
  VideoLongChaptersDocumentSchema,
  VideoLongChaptersSchema,
  VideoLongDossierSchema,
  VideoLongResearchSchema,
  VideoLongResearchStartRequestSchema,
} from './lungo-ricerca.js';

export const VIDEO_LONG_RESEARCH_START_TOOL = 'video_long_research_start';
export const VIDEO_LONG_RESEARCH_GET_TOOL = 'video_long_research_get';
export const VIDEO_LONG_DOSSIER_GET_TOOL = 'video_long_dossier_get';
export const VIDEO_LONG_CHAPTERS_PUT_TOOL = 'video_long_chapters_put';
export const VIDEO_LONG_CHAPTERS_GET_TOOL = 'video_long_chapters_get';
export const VIDEO_LONG_CHAPTERS_APPROVE_TOOL = 'video_long_chapters_approve';

/**
 * Identity comes only from the admitted tool envelope (R-33); the lab scope
 * (labClientId, labProjectId) is filled in by cap-video, never by the model.
 */
export const VideoLongResearchStartToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  draftRevision: VideoLongResearchStartRequestSchema.shape.draftRevision.describe('Revisione della bozza approvata da cui parte la ricerca.'),
  draftDigest: VideoLongResearchStartRequestSchema.shape.draftDigest.describe('Impronta della bozza approvata, in esadecimale minuscolo.'),
  questions: VideoLongResearchStartRequestSchema.shape.questions.describe('Domande della ricerca, da 1 a 12.'),
}).describe('Avvia la ricerca con fonti, solo su una bozza approvata.');
export type VideoLongResearchStartToolInput = z.infer<typeof VideoLongResearchStartToolInputSchema>;

export const VideoLongResearchGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge lo stato della ricerca del progetto lungo.');
export type VideoLongResearchGetToolInput = z.infer<typeof VideoLongResearchGetToolInputSchema>;

export const VideoLongDossierGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge il dossier di fonti e affermazioni del progetto lungo.');
export type VideoLongDossierGetToolInput = z.infer<typeof VideoLongDossierGetToolInputSchema>;

/** cap-video supplies usage as null; the model cannot declare consumption. */
export const VideoLongChaptersPutToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  ...VideoLongChaptersDocumentSchema.omit({ usage: true }).shape,
}).extend({
  draftRevision: VideoLongChaptersDocumentSchema.shape.draftRevision.describe('Revisione della bozza approvata.'),
  dossierRevision: VideoLongChaptersDocumentSchema.shape.dossierRevision.describe('Revisione del dossier usato per i capitoli.'),
  chapters: VideoLongChaptersDocumentSchema.shape.chapters.describe('Capitoli con fonti e ipotesi di inquadratura, da 1 a 24.'),
}).describe('Salva i capitoli con fonti e ipotesi di inquadratura.');
export type VideoLongChaptersPutToolInput = z.infer<typeof VideoLongChaptersPutToolInputSchema>;

export const VideoLongChaptersGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge i capitoli del progetto lungo.');
export type VideoLongChaptersGetToolInput = z.infer<typeof VideoLongChaptersGetToolInputSchema>;

export const VideoLongChaptersApproveToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  revision: VideoLongChaptersApproveRequestSchema.shape.revision.describe('Revisione dei capitoli vista dalla persona.'),
  digest: VideoLongChaptersApproveRequestSchema.shape.digest.describe('Impronta dei capitoli vista dalla persona, in esadecimale minuscolo.'),
}).describe('Approva la revisione e il contenuto dei capitoli letti.');
export type VideoLongChaptersApproveToolInput = z.infer<typeof VideoLongChaptersApproveToolInputSchema>;

export const VideoLongResearchGetToolResponseSchema = VideoLongResearchSchema;
export type VideoLongResearchGetToolResponse = z.infer<typeof VideoLongResearchGetToolResponseSchema>;
export const VideoLongDossierGetToolResponseSchema = VideoLongDossierSchema;
export type VideoLongDossierGetToolResponse = z.infer<typeof VideoLongDossierGetToolResponseSchema>;
export const VideoLongChaptersGetToolResponseSchema = VideoLongChaptersSchema;
export type VideoLongChaptersGetToolResponse = z.infer<typeof VideoLongChaptersGetToolResponseSchema>;

export const VideoLongResearchStartToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('avviata'), research: VideoLongResearchSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'bozza_non_approvata',
      'revisione_cambiata',
      'impronta_diversa',
      'ricerca_gia_avviata',
      'progetto_sconosciuto',
      'richiesta_non_valida',
      'lab_non_collegato',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongResearchStartToolResponse = z.infer<typeof VideoLongResearchStartToolResponseSchema>;

export const VideoLongChaptersPutToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('salvati'), chapters: VideoLongChaptersSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'bozza_non_approvata',
      'dossier_non_trovato',
      'revisione_cambiata',
      'dossier_cambiato',
      'capitoli_non_validi',
      'durata_fuori_misura',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongChaptersPutToolResponse = z.infer<typeof VideoLongChaptersPutToolResponseSchema>;

export const VideoLongChaptersApproveToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('approvati'), chapters: VideoLongChaptersSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'revisione_superata',
      'dossier_cambiato',
      'impronta_diversa',
      'bozza_non_approvata',
      'capitoli_non_trovati',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongChaptersApproveToolResponse = z.infer<typeof VideoLongChaptersApproveToolResponseSchema>;
