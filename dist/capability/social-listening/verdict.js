import { z } from 'zod';
import { ResearchFindingSchema, WebUrlSchema } from "../ricerca/research.js";
export const SOCIAL_VERDICTS = ['funziona', 'da_provare', 'non_funziona', 'fuffa'];
export const SocialVerdictSchema = z.enum(SOCIAL_VERDICTS);
/** A fact cites at least one http(s) source: reused from research, minus its `origin`. */
export const SocialFactSchema = ResearchFindingSchema.omit({ origin: true });
/** A tool cited by a post may have no known public link. */
export const SocialPostToolSchema = z.object({
    name: z.string().min(1).max(200),
    link: WebUrlSchema.optional(),
    whatItDoes: z.string().min(1).max(500),
}).strict();
/** Analysis text is DATA, never instructions; individual posts may have no verified facts yet. */
export const SocialPostAnalysisSchema = z.object({
    verdict: SocialVerdictSchema,
    reason: z.string().min(1).max(2000),
    relevance: z.string().min(1).max(1000).optional(),
    facts: z.array(SocialFactSchema).max(20),
    tools: z.array(SocialPostToolSchema).max(20),
    analyzedAt: z.iso.datetime({ offset: true }),
}).strict();
//# sourceMappingURL=verdict.js.map