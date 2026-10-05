import { z } from 'zod';
import { ResearchIdSchema, ResearchRequestSchema, ResearchResultSchema, ResearchStateSchema } from './research.js';

/**
 * The tools of cap-ricerca (v1.28.0, Phase 54). Agents and other capabilities call them at
 * `capToolCallPath(RICERCA_TOOLS.<tool>)` — never with a hand-written path.
 */
export const RICERCA_TOOLS = {
  /** Queue a research; answers at once with its id. */
  start: 'research_start',
  /** Where a research is. */
  status: 'research_status',
  /** The findings of a completed research. */
  result: 'research_result',
} as const;
export type RicercaToolName = (typeof RICERCA_TOOLS)[keyof typeof RICERCA_TOOLS];

export const ResearchStartInputSchema = ResearchRequestSchema;
export const ResearchStartOutputSchema = z.object({ researchId: ResearchIdSchema, state: ResearchStateSchema }).strict();

export const ResearchStatusInputSchema = z.object({ researchId: ResearchIdSchema }).strict();
export const ResearchStatusOutputSchema = z.object({ researchId: ResearchIdSchema, state: ResearchStateSchema }).strict();

export const ResearchResultInputSchema = z.object({ researchId: ResearchIdSchema }).strict();
export const ResearchResultOutputSchema = ResearchResultSchema;

export type ResearchStartInput = z.infer<typeof ResearchStartInputSchema>;
export type ResearchStartOutput = z.infer<typeof ResearchStartOutputSchema>;
export type ResearchStatusInput = z.infer<typeof ResearchStatusInputSchema>;
export type ResearchStatusOutput = z.infer<typeof ResearchStatusOutputSchema>;
export type ResearchResultInput = z.infer<typeof ResearchResultInputSchema>;
export type ResearchResultOutput = z.infer<typeof ResearchResultOutputSchema>;
