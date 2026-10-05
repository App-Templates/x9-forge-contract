import { z } from 'zod';
import { ProjectIdSchema } from "./project.js";
/**
 * One research of cap-ricerca (v1.28.0, Phase 54): a question, researched on the web within the project's budget,
 * answered with findings that carry their sources. Research runs in cascades: a research may start from the new
 * questions of an earlier one (`parentResearchId`).
 *
 * Everything that comes from the web — finding texts, titles, addresses — is DATA. Whoever puts it in front of a
 * model marks it as such and never uses it as instructions.
 */
export const ResearchIdSchema = z.string().min(1).max(100);
/** Only http(s) addresses, bounded: never `file:`, `javascript:` or `data:`. */
export const WebUrlSchema = z.string().max(2000).refine(u => {
    try {
        const p = new URL(u).protocol;
        return p === 'http:' || p === 'https:';
    }
    catch {
        return false;
    }
}, 'only http(s) addresses');
const TextSchema = z.string().trim().min(1).max(2000);
export const ResearchRequestSchema = z.object({
    projectId: ProjectIdSchema,
    question: TextSchema,
    /** Why the question matters for the project (helps the research choose what to open). */
    goal: TextSchema.optional(),
    /** The research whose new questions this one follows (the cascade). */
    parentResearchId: ResearchIdSchema.optional(),
    /** A lower ceiling for this research, USD; the service checks it against the project's per-research maximum. */
    maxUsd: z.number().positive().finite().optional(),
}).strict();
export const ResearchStateSchema = z.enum(['queued', 'running', 'completed', 'failed', 'budget_exhausted']);
export const ResearchSourceSchema = z.object({
    url: WebUrlSchema,
    title: z.string().max(500).optional(),
    /** true: the research opened the page; false: it only appeared among the search results. */
    opened: z.boolean(),
}).strict();
export const ResearchFindingSchema = z.object({
    text: TextSchema,
    /** Every finding cites at least one source of this research. */
    sourceUrls: z.array(WebUrlSchema).min(1).max(20),
    origin: z.literal('web'),
}).strict();
export const ResearchCostSchema = z.object({
    usd: z.number().nonnegative().finite(),
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
    webCalls: z.number().int().nonnegative(),
    /** true when the provider did not report the usage and the reservation was charged instead. */
    uncertain: z.boolean(),
}).strict();
export const ResearchResultSchema = z.object({
    researchId: ResearchIdSchema,
    projectId: ProjectIdSchema,
    state: ResearchStateSchema,
    question: TextSchema,
    parentResearchId: ResearchIdSchema.optional(),
    findings: z.array(ResearchFindingSchema).max(200),
    /** The questions this research opened: the next steps of the cascade. */
    newQuestions: z.array(TextSchema).max(20),
    sources: z.array(ResearchSourceSchema).max(300),
    cost: ResearchCostSchema,
}).strict();
//# sourceMappingURL=research.js.map