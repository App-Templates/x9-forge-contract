import { z } from 'zod';
import {
  VideoLongCreateRequestSchema,
  VideoLongProjectIdSchema,
  VideoLongProjectSchema,
  VideoLongProjectListSchema,
} from './lungo.js';
import {
  VideoLongDraftDocumentSchema,
  VideoLongDraftApproveRequestSchema,
  VideoLongDraftSchema,
} from './lungo-bozza.js';
import { VideoCostByStepSchema } from './costo-passi.js';

export const VIDEO_LONG_CREATE_TOOL = 'video_long_create';
export const VIDEO_LONG_LIST_TOOL = 'video_long_list';
export const VIDEO_LONG_GET_TOOL = 'video_long_get';
export const VIDEO_LONG_DRAFT_PUT_TOOL = 'video_long_draft_put';
export const VIDEO_LONG_DRAFT_GET_TOOL = 'video_long_draft_get';
export const VIDEO_LONG_DRAFT_APPROVE_TOOL = 'video_long_draft_approve';
export const VIDEO_LONG_COST_GET_TOOL = 'video_long_cost_get';

/** Identity comes only from the admitted tool envelope (R-33). */
export const VideoLongCreateToolInputSchema = VideoLongCreateRequestSchema.omit({ requestedBy: true }).extend({
  name: VideoLongCreateRequestSchema.shape.name.describe('Nome del progetto lungo.'),
  family: VideoLongCreateRequestSchema.shape.family.describe('Famiglia narrativa del video lungo.'),
  presetId: VideoLongCreateRequestSchema.shape.presetId.describe("Identificativo del preset dell'Officina."),
  aspectRatio: VideoLongCreateRequestSchema.shape.aspectRatio.describe('Formato del video.'),
  durationSeconds: VideoLongCreateRequestSchema.shape.durationSeconds.describe('Durata del video in secondi, da 120 a 1200.'),
  modelId: VideoLongCreateRequestSchema.shape.modelId.describe('Identificativo del personaggio; null se assente.'),
  brief: VideoLongCreateRequestSchema.shape.brief.describe('Indicazioni per il contenuto del video lungo.'),
  budgetUsd: VideoLongCreateRequestSchema.shape.budgetUsd.describe('Budget del progetto in dollari.'),
}).describe('Crea un progetto video lungo.');
export type VideoLongCreateToolInput = z.infer<typeof VideoLongCreateToolInputSchema>;

export const VideoLongListToolInputSchema = z.strictObject({}).describe('Elenca i progetti video lunghi accessibili.');
export type VideoLongListToolInput = z.infer<typeof VideoLongListToolInputSchema>;

export const VideoLongGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge un progetto video lungo.');
export type VideoLongGetToolInput = z.infer<typeof VideoLongGetToolInputSchema>;

/** cap-video supplies usage as null; the model cannot declare consumption. */
export const VideoLongDraftPutToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  ...VideoLongDraftDocumentSchema.omit({ usage: true }).shape,
}).extend({
  logline: VideoLongDraftDocumentSchema.shape.logline.describe('Sintesi della storia in una riga.'),
  thesis: VideoLongDraftDocumentSchema.shape.thesis.describe('Tesi del video lungo.'),
  paragraphs: VideoLongDraftDocumentSchema.shape.paragraphs.describe('Testo della bozza, da 1 a 40 paragrafi.'),
  chapters: VideoLongDraftDocumentSchema.shape.chapters.describe('Capitoli della bozza con indice e durata prevista.'),
}).describe('Salva la bozza a capitoli del progetto lungo.');
export type VideoLongDraftPutToolInput = z.infer<typeof VideoLongDraftPutToolInputSchema>;

export const VideoLongDraftGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge la bozza del progetto lungo.');
export type VideoLongDraftGetToolInput = z.infer<typeof VideoLongDraftGetToolInputSchema>;

export const VideoLongDraftApproveToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  revision: VideoLongDraftApproveRequestSchema.shape.revision.describe('Revisione della bozza vista dalla persona.'),
  digest: VideoLongDraftApproveRequestSchema.shape.digest.describe('Impronta della bozza vista dalla persona, in esadecimale minuscolo.'),
}).describe('Approva la revisione e il contenuto della bozza letta.');
export type VideoLongDraftApproveToolInput = z.infer<typeof VideoLongDraftApproveToolInputSchema>;

export const VideoLongCostGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge i costi del progetto lungo suddivisi per passo.');
export type VideoLongCostGetToolInput = z.infer<typeof VideoLongCostGetToolInputSchema>;

export const VideoLongCreateToolResponseSchema = VideoLongProjectSchema;
export type VideoLongCreateToolResponse = z.infer<typeof VideoLongCreateToolResponseSchema>;
export const VideoLongListToolResponseSchema = VideoLongProjectListSchema;
export type VideoLongListToolResponse = z.infer<typeof VideoLongListToolResponseSchema>;
export const VideoLongGetToolResponseSchema = VideoLongProjectSchema;
export type VideoLongGetToolResponse = z.infer<typeof VideoLongGetToolResponseSchema>;
export const VideoLongDraftGetToolResponseSchema = VideoLongDraftSchema;
export type VideoLongDraftGetToolResponse = z.infer<typeof VideoLongDraftGetToolResponseSchema>;
export const VideoLongCostGetToolResponseSchema = VideoCostByStepSchema;
export type VideoLongCostGetToolResponse = z.infer<typeof VideoLongCostGetToolResponseSchema>;

export const VideoLongDraftPutToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('salvata'), draft: VideoLongDraftSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'somma_capitoli',
      'indici_non_consecutivi',
      'gia_approvata',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongDraftPutToolResponse = z.infer<typeof VideoLongDraftPutToolResponseSchema>;

export const VideoLongDraftApproveToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('approvata'), draft: VideoLongDraftSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'bozza_mancante',
      'revisione_cambiata',
      'impronta_diversa',
      'gia_approvata',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongDraftApproveToolResponse = z.infer<typeof VideoLongDraftApproveToolResponseSchema>;
