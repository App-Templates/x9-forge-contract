import { z } from 'zod';
import { ProjectIdSchema } from '../ricerca/project.js';
import { ResearchResultSchema } from '../ricerca/research.js';
import { CompetenceGapSchema, CompetenceNodeViewSchema } from './competence.js';
import { WikiClaimSchema, WikiPageSchema } from './wiki.js';

/**
 * The tools of cap-lab (v1.28.0, Phase 54), called at `capToolCallPath(LAB_TOOLS.<tool>)`.
 * `lab_ingest` takes a cap-ricerca result as cap-ricerca defines it (imported, never copied).
 */
export const LAB_TOOLS = {
  /** Store a research result: raw sources, then pages and claims updated. */
  ingest: 'lab_ingest',
  /** Ask the wiki: the pages and claims that answer. */
  query: 'lab_query',
  /** The open gaps: the next questions for research. */
  gaps: 'lab_gaps',
  /** The competence graph with levels and scores. */
  competence: 'lab_competence',
} as const;
export type LabToolName = (typeof LAB_TOOLS)[keyof typeof LAB_TOOLS];

export const LabIngestInputSchema = z.object({ result: ResearchResultSchema }).strict();
export const LabIngestOutputSchema = z.object({
  sourcesStored: z.number().int().nonnegative(),
  pagesTouched: z.number().int().nonnegative(),
  claimsAdded: z.number().int().nonnegative(),
}).strict();

export const LabQueryInputSchema = z.object({
  projectId: ProjectIdSchema,
  question: z.string().trim().min(1).max(2000),
  limit: z.number().int().min(1).max(50).optional(),
}).strict();
export const LabQueryOutputSchema = z.object({
  pages: z.array(WikiPageSchema).max(50),
  claims: z.array(WikiClaimSchema).max(200),
}).strict();

export const LabGapsInputSchema = z.object({ projectId: ProjectIdSchema, limit: z.number().int().min(1).max(50).optional() }).strict();
export const LabGapsOutputSchema = z.object({ gaps: z.array(CompetenceGapSchema).max(50) }).strict();

export const LabCompetenceInputSchema = z.object({ projectId: ProjectIdSchema }).strict();
export const LabCompetenceOutputSchema = z.object({ nodes: z.array(CompetenceNodeViewSchema).max(5000) }).strict();

export type LabIngestInput = z.infer<typeof LabIngestInputSchema>;
export type LabIngestOutput = z.infer<typeof LabIngestOutputSchema>;
export type LabQueryInput = z.infer<typeof LabQueryInputSchema>;
export type LabQueryOutput = z.infer<typeof LabQueryOutputSchema>;
export type LabGapsInput = z.infer<typeof LabGapsInputSchema>;
export type LabGapsOutput = z.infer<typeof LabGapsOutputSchema>;
export type LabCompetenceInput = z.infer<typeof LabCompetenceInputSchema>;
export type LabCompetenceOutput = z.infer<typeof LabCompetenceOutputSchema>;
