import { z } from 'zod';
import { AssetRefSchema } from '../../organization/asset.js';
import { LabQueryInputSchema } from '../lab/tools.js';
import { WikiOriginSchema, WikiPageSlugSchema, WikiSourceIdSchema } from '../lab/wiki.js';
import { LabGapsRefSchema, ResearchCostSchema, ResearchIdSchema, ResearchStateSchema } from '../ricerca/research.js';
import { VideoEngineRevisionSchema } from './engine.js';
import { VideoLongDraftSchema } from './lungo-bozza.js';
import { VideoLongProjectIdSchema } from './lungo.js';

export const VIDEO_LONG_RESEARCH_MAX_QUESTIONS = 12;
export const VIDEO_LONG_MAX_SOURCES = 60;
export const VIDEO_LONG_MAX_CLAIMS = 200;

export const VideoLongSourceSchema = z.strictObject({
  id: WikiSourceIdSchema,
  title: z.string().min(1).max(500).nullable(),
  url: z.url().max(2000).nullable(),
  publisher: z.string().min(1).max(200).nullable(),
  excerpt: z.string().min(1).max(600),
  origin: WikiOriginSchema,
  labPageSlug: WikiPageSlugSchema.nullable(),
  retrievedAt: z.string().min(1).max(40),
});
export type VideoLongSource = z.infer<typeof VideoLongSourceSchema>;

export const VideoLongClaimSchema = z.strictObject({
  id: z.string().min(1).max(64),
  text: z.string().min(1).max(600),
  sourceIds: z.array(WikiSourceIdSchema).min(1).max(5),
  attributed: z.boolean(),
});
export type VideoLongClaim = z.infer<typeof VideoLongClaimSchema>;

/** The engine checks source/claim references and links claims to chapters. */
export const VideoLongDossierDocumentSchema = z.strictObject({
  draftRevision: VideoEngineRevisionSchema,
  researchIds: z.array(ResearchIdSchema).max(VIDEO_LONG_RESEARCH_MAX_QUESTIONS),
  sources: z.array(VideoLongSourceSchema).max(VIDEO_LONG_MAX_SOURCES),
  claims: z.array(VideoLongClaimSchema).max(VIDEO_LONG_MAX_CLAIMS),
  /** null means cap-ricerca did not measure the cost. */
  costUsd: ResearchCostSchema.shape.usd.nullable(),
});
export type VideoLongDossierDocument = z.infer<typeof VideoLongDossierDocumentSchema>;

export const VideoLongDossierSchema = VideoLongDossierDocumentSchema.extend({
  revision: VideoEngineRevisionSchema,
  digest: VideoLongDraftSchema.shape.digest,
  recordedAt: z.string().min(1).max(40),
});
export type VideoLongDossier = z.infer<typeof VideoLongDossierSchema>;

/** The engine checks approval, revision/digest consistency and question uniqueness. */
export const VideoLongResearchStartRequestSchema = z.strictObject({
  draftRevision: VideoEngineRevisionSchema,
  draftDigest: VideoLongDraftSchema.shape.digest,
  questions: z.array(LabQueryInputSchema.shape.question).min(1).max(VIDEO_LONG_RESEARCH_MAX_QUESTIONS),
  labClientId: AssetRefSchema.shape.companyId,
  labProjectId: AssetRefSchema.shape.projectId,
});
export type VideoLongResearchStartRequest = z.infer<typeof VideoLongResearchStartRequestSchema>;

export const VideoLongResearchSchema = z.strictObject({
  projectId: VideoLongProjectIdSchema,
  draftRevision: VideoEngineRevisionSchema,
  draftDigest: VideoLongDraftSchema.shape.digest,
  state: ResearchStateSchema,
  gapsRef: LabGapsRefSchema.nullable(),
  researchIds: z.array(ResearchIdSchema).max(VIDEO_LONG_RESEARCH_MAX_QUESTIONS),
  startedAt: z.string().min(1).max(40),
  finishedAt: z.string().min(1).max(40).nullable(),
});
export type VideoLongResearch = z.infer<typeof VideoLongResearchSchema>;

export const VideoLongResearchRefusalSchema = z.enum([
  'bozza_non_approvata',
  'revisione_cambiata',
  'impronta_diversa',
  'ricerca_gia_avviata',
  'motore_non_disponibile',
]);
export type VideoLongResearchRefusal = z.infer<typeof VideoLongResearchRefusalSchema>;
