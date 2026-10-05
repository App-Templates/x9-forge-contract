import { z } from 'zod';
import { ResearchIdSchema, ResearchRequestSchema, ResearchResultSchema, ResearchStateSchema } from './research.js';

/**
 * The tools of cap-ricerca (v1.28.0, Phase 54). The agent is the one of the tool call envelope. Agents and other
 * capabilities call them at `capToolCallPath(RICERCA_TOOLS.<tool>)` — never with a hand-written path.
 * Errors use the bridge tool-call codes (`TOOL_CALL_INVALID`, `TOOL_EXEC_FAILED`) with a {@link RicercaToolError}
 * as the error text.
 */
export const RICERCA_TOOLS = {
  /** Queue a research; answers at once with its id. */
  start: 'research_start',
  /** Where a research is. */
  status: 'research_status',
  /** The findings of a finished research. */
  result: 'research_result',
} as const;
export type RicercaToolName = (typeof RICERCA_TOOLS)[keyof typeof RICERCA_TOOLS];

/** Why a cap-ricerca tool call failed (the `error` text of a bridge tool-call error). */
export const RicercaToolErrorSchema = z.enum([
  'not_configured',
  'max_usd_above_agent',
  'unknown_parent',
  'unknown_research',
  'not_ready',
]);
export type RicercaToolError = z.infer<typeof RicercaToolErrorSchema>;

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
