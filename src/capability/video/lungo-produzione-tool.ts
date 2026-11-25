import { z } from 'zod';
import { VideoLongProjectIdSchema } from './lungo.js';
import {
  VideoLongFramesDocumentSchema,
  VideoLongFramesSchema,
  VideoLongFramesApproveRequestSchema,
} from './lungo-fotogrammi.js';
import {
  VideoLongProductionSettingsSchema,
  VideoLongProductionSchema,
  VideoLongRunQuoteRequestSchema,
  VideoLongRunQuoteSchema,
  VideoLongRunRequestSchema,
  VideoLongRunRefusalSchema,
  VideoLongChapterFramesSchema,
  VideoLongJoinRequestSchema,
  VideoLongFinalVideoSchema,
} from './lungo-produzione.js';

export const VIDEO_LONG_FRAMES_PUT_TOOL = 'video_long_frames_put';
export const VIDEO_LONG_FRAMES_GET_TOOL = 'video_long_frames_get';
export const VIDEO_LONG_FRAMES_APPROVE_TOOL = 'video_long_frames_approve';
export const VIDEO_LONG_PRODUCTION_SETTINGS_PUT_TOOL = 'video_long_production_settings_put';
export const VIDEO_LONG_PRODUCTION_GET_TOOL = 'video_long_production_get';
export const VIDEO_LONG_RUN_QUOTE_TOOL = 'video_long_run_quote';
export const VIDEO_LONG_RUN_START_TOOL = 'video_long_run_start';
export const VIDEO_LONG_CHAPTER_FRAMES_GET_TOOL = 'video_long_chapter_frames_get';
export const VIDEO_LONG_CHAPTER_FRAMES_APPROVE_TOOL = 'video_long_chapter_frames_approve';
export const VIDEO_LONG_JOIN_TOOL = 'video_long_join';
export const VIDEO_LONG_VIDEO_GET_TOOL = 'video_long_video_get';

/** Identity comes only from the admitted envelope (R-33). cap-video supplies null usage. */
export const VideoLongFramesPutToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  chaptersRevision: VideoLongFramesDocumentSchema.shape.chaptersRevision.describe('Revisione dei capitoli approvati.'),
  chapters: VideoLongFramesDocumentSchema.shape.chapters.describe('Capitoli con il piano delle inquadrature.'),
}).describe('Salva il piano delle inquadrature dei capitoli approvati.');
export type VideoLongFramesPutToolInput = z.infer<typeof VideoLongFramesPutToolInputSchema>;

export const VideoLongFramesGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge il piano delle inquadrature.');
export type VideoLongFramesGetToolInput = z.infer<typeof VideoLongFramesGetToolInputSchema>;

export const VideoLongFramesApproveToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  revision: VideoLongFramesApproveRequestSchema.shape.revision.describe('Revisione del contenuto visto dalla persona.'),
  digest: VideoLongFramesApproveRequestSchema.shape.digest.describe('Impronta del contenuto visto dalla persona, in esadecimale minuscolo.'),
}).describe('Approva il piano delle inquadrature letto dalla persona.');
export type VideoLongFramesApproveToolInput = z.infer<typeof VideoLongFramesApproveToolInputSchema>;

export const VideoLongProductionSettingsPutToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  frameProvider: VideoLongProductionSettingsSchema.shape.frameProvider.describe('Fornitore che genera i fotogrammi.'),
  frameModel: VideoLongProductionSettingsSchema.shape.frameModel.describe('Modello per i fotogrammi, oppure null per quello predefinito.'),
  clipProvider: VideoLongProductionSettingsSchema.shape.clipProvider.describe('Fornitore che genera le clip.'),
  clipModel: VideoLongProductionSettingsSchema.shape.clipModel.describe('Modello che genera le clip.'),
  voice: VideoLongProductionSettingsSchema.shape.voice.describe('Fornitore, modello e voce della narrazione.'),
  subtitles: VideoLongProductionSettingsSchema.shape.subtitles.describe('Sottotitoli separati oppure nessun sottotitolo.'),
}).describe('Salva le impostazioni di produzione del progetto.');
export type VideoLongProductionSettingsPutToolInput = z.infer<typeof VideoLongProductionSettingsPutToolInputSchema>;

export const VideoLongProductionGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge lo stato della produzione del progetto.');
export type VideoLongProductionGetToolInput = z.infer<typeof VideoLongProductionGetToolInputSchema>;

export const VideoLongRunQuoteToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  chapterIndex: VideoLongRunQuoteRequestSchema.shape.chapterIndex.describe('Numero del capitolo, da 1 a 24.'),
  stage: VideoLongRunQuoteRequestSchema.shape.stage.describe('Passo da eseguire: fotogrammi, voce, clip o montaggio.'),
}).describe('Richiede il preventivo di un passo per un capitolo.');
export type VideoLongRunQuoteToolInput = z.infer<typeof VideoLongRunQuoteToolInputSchema>;

export const VideoLongRunStartToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  chapterIndex: VideoLongRunQuoteRequestSchema.shape.chapterIndex.describe('Numero del capitolo, da 1 a 24.'),
  stage: VideoLongRunQuoteRequestSchema.shape.stage.describe('Passo da eseguire: fotogrammi, voce, clip o montaggio.'),
  quoteId: VideoLongRunRequestSchema.shape.quoteId.describe('Identificativo del preventivo accettato.'),
  framesRevision: VideoLongJoinRequestSchema.shape.framesRevision.describe('Revisione del piano delle inquadrature approvato.'),
}).describe('Avvia il passo del capitolo con il preventivo accettato.');
export type VideoLongRunStartToolInput = z.infer<typeof VideoLongRunStartToolInputSchema>;

export const VideoLongChapterFramesGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  chapterIndex: VideoLongRunQuoteRequestSchema.shape.chapterIndex.describe('Numero del capitolo, da 1 a 24.'),
}).describe('Legge i fotogrammi generati per il capitolo.');
export type VideoLongChapterFramesGetToolInput = z.infer<typeof VideoLongChapterFramesGetToolInputSchema>;

export const VideoLongChapterFramesApproveToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  chapterIndex: VideoLongRunQuoteRequestSchema.shape.chapterIndex.describe('Numero del capitolo, da 1 a 24.'),
  revision: VideoLongFramesApproveRequestSchema.shape.revision.describe('Revisione del contenuto visto dalla persona.'),
  digest: VideoLongFramesApproveRequestSchema.shape.digest.describe('Impronta del contenuto visto dalla persona, in esadecimale minuscolo.'),
}).describe('Approva i fotogrammi del capitolo visti dalla persona.');
export type VideoLongChapterFramesApproveToolInput = z.infer<typeof VideoLongChapterFramesApproveToolInputSchema>;

export const VideoLongJoinToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
  framesRevision: VideoLongJoinRequestSchema.shape.framesRevision.describe('Revisione del piano delle inquadrature approvato.'),
}).describe('Unisce i capitoli completati secondo il piano approvato.');
export type VideoLongJoinToolInput = z.infer<typeof VideoLongJoinToolInputSchema>;

export const VideoLongVideoGetToolInputSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema.describe('Identificativo del progetto lungo.'),
}).describe('Legge il video finale del progetto.');
export type VideoLongVideoGetToolInput = z.infer<typeof VideoLongVideoGetToolInputSchema>;

export const VideoLongFramesGetToolResponseSchema = VideoLongFramesSchema;
export type VideoLongFramesGetToolResponse = z.infer<typeof VideoLongFramesGetToolResponseSchema>;

export const VideoLongProductionGetToolResponseSchema = VideoLongProductionSchema;
export type VideoLongProductionGetToolResponse = z.infer<typeof VideoLongProductionGetToolResponseSchema>;

export const VideoLongChapterFramesGetToolResponseSchema = VideoLongChapterFramesSchema;
export type VideoLongChapterFramesGetToolResponse = z.infer<typeof VideoLongChapterFramesGetToolResponseSchema>;

export const VideoLongVideoGetToolResponseSchema = VideoLongFinalVideoSchema;
export type VideoLongVideoGetToolResponse = z.infer<typeof VideoLongVideoGetToolResponseSchema>;

export const VideoLongFramesPutToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('salvato'), frames: VideoLongFramesSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'capitoli_non_approvati',
      'revisione_cambiata',
      'capitoli_diversi',
      'inquadrature_non_valide',
      'durata_fuori_misura',
      'parlato_troppo_lungo',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongFramesPutToolResponse = z.infer<typeof VideoLongFramesPutToolResponseSchema>;

export const VideoLongFramesApproveToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('approvato'), frames: VideoLongFramesSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'revisione_superata',
      'capitoli_non_approvati',
      'capitoli_cambiati',
      'impronta_diversa',
      'piano_non_trovato',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongFramesApproveToolResponse = z.infer<typeof VideoLongFramesApproveToolResponseSchema>;

export const VideoLongProductionSettingsPutToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('salvate'), production: VideoLongProductionSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'impostazioni_non_valide',
      'tappa_gia_in_corso',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongProductionSettingsPutToolResponse = z.infer<typeof VideoLongProductionSettingsPutToolResponseSchema>;

export const VideoLongRunQuoteToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('preventivo'), quote: VideoLongRunQuoteSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'piano_non_approvato',
      'fotogrammi_non_approvati',
      'fornitore_non_pronto',
      'tariffa_scaduta',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongRunQuoteToolResponse = z.infer<typeof VideoLongRunQuoteToolResponseSchema>;

export const VideoLongRunStartToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('avviata'), production: VideoLongProductionSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: VideoLongRunRefusalSchema,
    message: z.string(),
  }),
]);
export type VideoLongRunStartToolResponse = z.infer<typeof VideoLongRunStartToolResponseSchema>;

export const VideoLongChapterFramesApproveToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('approvati'), frames: VideoLongChapterFramesSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'revisione_superata',
      'impronta_diversa',
      'fotogrammi_non_trovati',
      'piano_cambiato',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongChapterFramesApproveToolResponse = z.infer<typeof VideoLongChapterFramesApproveToolResponseSchema>;

export const VideoLongJoinToolResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('unito'), video: VideoLongFinalVideoSchema }),
  z.strictObject({
    status: z.literal('rifiutata'),
    reason: z.enum([
      'capitoli_incompleti',
      'piano_cambiato',
      'progetto_sconosciuto',
      'motore_non_disponibile',
    ]),
    message: z.string(),
  }),
]);
export type VideoLongJoinToolResponse = z.infer<typeof VideoLongJoinToolResponseSchema>;

