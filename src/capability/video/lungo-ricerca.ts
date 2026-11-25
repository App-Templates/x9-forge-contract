import { z } from 'zod';
import { AssetRefSchema } from '../../organization/asset.js';
import { LabQueryInputSchema } from '../lab/tools.js';
import { LabGapsRefSchema, ResearchIdSchema, ResearchStateSchema } from '../ricerca/research.js';
import { VideoEngineRevisionSchema } from './engine.js';
import { VideoLongDraftSchema } from './lungo-bozza.js';
import { VideoLongProjectIdSchema } from './lungo.js';

export const VIDEO_LONG_RESEARCH_MAX_QUESTIONS = 12;

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
