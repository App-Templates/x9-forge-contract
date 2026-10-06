import { z } from 'zod';
import { ResearchResultSchema, ResearchStateSchema } from "../ricerca/research.js";
import { CompetenceGapSchema, CompetenceNodeViewSchema } from "./competence.js";
import { WikiClaimSchema, WikiPageSchema } from "./wiki.js";
/**
 * The tools of cap-lab (v1.29.0, Phase 54), called at `capToolCallPath(LAB_TOOLS.<tool>)`. The wiki is the one of
 * the agent of the tool call envelope.
 * `lab_ingest` takes a cap-ricerca result as cap-ricerca defines it (imported, never copied).
 */
export const LAB_TOOLS = {
    /** Queue a research result for digestion into raw sources, pages and claims. */
    ingest: 'lab_ingest',
    /** State of a queued ingest, with final counts when completed. */
    ingestStatus: 'lab_ingest_status',
    /** Ask the wiki: the pages and claims that answer. */
    query: 'lab_query',
    /** The open gaps: the next questions for research. */
    gaps: 'lab_gaps',
    /** The competence graph with levels and scores. */
    competence: 'lab_competence',
};
/** Why a lab tool call failed, as the bridge tool-call error text. */
export const LabToolErrorSchema = z.enum(['invalid_request', 'not_configured', 'not_found', 'not_ready']);
export const LabIngestIdSchema = z.uuid();
export const LabIngestInputSchema = z.object({ result: ResearchResultSchema }).strict();
export const LabIngestOutputSchema = z.object({
    ingestId: LabIngestIdSchema,
    state: z.literal('queued'),
}).strict();
export const LabIngestStatusInputSchema = z.object({ ingestId: LabIngestIdSchema }).strict();
export const LabIngestStatusOutputSchema = z.object({
    ingestId: LabIngestIdSchema,
    state: ResearchStateSchema,
    sourcesStored: z.number().int().nonnegative().optional(),
    pagesTouched: z.number().int().nonnegative().optional(),
    claimsAdded: z.number().int().nonnegative().optional(),
}).strict().refine(result => result.state === 'completed'
    ? result.sourcesStored !== undefined && result.pagesTouched !== undefined && result.claimsAdded !== undefined
    : result.sourcesStored === undefined && result.pagesTouched === undefined && result.claimsAdded === undefined, { message: 'counts are present only for completed ingests' });
export const LabQueryInputSchema = z.object({
    question: z.string().trim().min(1).max(2000),
    limit: z.number().int().min(1).max(50).optional(),
}).strict();
export const LabQueryOutputSchema = z.object({
    pages: z.array(WikiPageSchema).max(50),
    claims: z.array(WikiClaimSchema).max(200),
}).strict();
export const LabGapsInputSchema = z.object({ limit: z.number().int().min(1).max(50).optional() }).strict();
export const LabGapsOutputSchema = z.object({ gaps: z.array(CompetenceGapSchema).max(50) }).strict();
export const LabCompetenceInputSchema = z.object({}).strict();
export const LabCompetenceOutputSchema = z.object({ nodes: z.array(CompetenceNodeViewSchema).max(5000) }).strict();
//# sourceMappingURL=tools.js.map