import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { LabIngestIdSchema } from "../lab/tools.js";
import { ResearchIdSchema, ResearchSourceSchema } from "../ricerca/research.js";
import { AgentDaySchema } from "../ricerca/spend.js";
import { SocialHandleSchema, SocialVerticalIdSchema } from "./post.js";
import { SocialFactSchema, SocialVerdictSchema } from "./verdict.js";
const IsoDateTimeSchema = z.iso.datetime({ offset: true });
export const SocialCategorySlugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export const SocialCategorySchema = z.object({
    slug: SocialCategorySlugSchema,
    label: z.string().min(1).max(60),
}).strict();
/** A vertical with its own category vocabulary (the vocabulary data lives in the project, not here). */
export const SocialVerticalSchema = z.object({
    id: SocialVerticalIdSchema,
    label: z.string().min(1).max(100),
    description: z.string().max(500),
    categories: z.array(SocialCategorySchema).min(1).max(30),
}).strict().superRefine((v, ctx) => {
    const seen = new Set();
    v.categories.forEach((c, i) => {
        if (seen.has(c.slug))
            ctx.addIssue({ code: 'custom', path: ['categories', i, 'slug'], message: 'duplicate category slug' });
        seen.add(c.slug);
    });
});
export function socialCategoryInVertical(vertical, slug) {
    return vertical.categories.some(c => c.slug === slug);
}
export { SOCIAL_VERDICTS, SocialVerdictSchema } from "./verdict.js";
/** Creators' "truth" score per verdict (D16). */
export const SOCIAL_VERDICT_TRUTH_SCORE = {
    funziona: 100,
    da_provare: 50,
    non_funziona: 0,
    fuffa: 0,
};
/** The track that did the work (D9). */
export const SOCIAL_TRACKS = ['mac', 'server'];
export const SocialTrackSchema = z.enum(SOCIAL_TRACKS);
/** Short title: under 32 characters. */
export const SOCIAL_TOPIC_TITLE_MAX = 31;
export const SocialTopicTitleSchema = z.string().trim().min(1).max(SOCIAL_TOPIC_TITLE_MAX);
/** A fact cites at least one http(s) source: reused from research, minus its `origin`. */
export const SocialTopicFactSchema = SocialFactSchema;
export const SocialTopicSourceSchema = ResearchSourceSchema;
/** Cost per topic (D8). On the Mac `usd` is 0 (subscription quota). */
export const SocialTopicCostSchema = z.object({
    usd: z.number().nonnegative().finite(),
    track: SocialTrackSchema,
    uncertain: z.boolean(),
}).strict();
export const SocialTopicSchema = z.object({
    identity: CapabilityAgentScopeSchema,
    topicId: z.string().min(1).max(100),
    verticalId: SocialVerticalIdSchema,
    day: AgentDaySchema,
    title: SocialTopicTitleSchema,
    category: SocialCategorySlugSchema,
    summary: z.string().min(1).max(2000),
    verdict: SocialVerdictSchema,
    facts: z.array(SocialTopicFactSchema).max(20),
    sources: z.array(SocialTopicSourceSchema).max(50),
    heat: z.number().min(0).max(10),
    postIds: z.array(z.string().min(1).max(100)).min(1).max(100),
    creators: z.array(SocialHandleSchema).min(1).max(50),
    cost: SocialTopicCostSchema,
    computedAt: IsoDateTimeSchema,
    /** The extended research already done (D14): the button goes away. */
    extendedResearchId: ResearchIdSchema.optional(),
    /** Set by the service after `lab_ingest` accepted the topic (D15). */
    wikiIngestId: LabIngestIdSchema.optional(),
    wikiSavedAt: IsoDateTimeSchema.optional(),
}).strict().superRefine((t, ctx) => {
    if ((t.verdict === 'funziona' || t.verdict === 'da_provare') && t.facts.length < 1) {
        ctx.addIssue({ code: 'custom', path: ['facts'], message: 'verdict funziona/da_provare needs at least one fact' });
    }
    if (t.wikiIngestId !== undefined && t.wikiSavedAt === undefined) {
        ctx.addIssue({ code: 'custom', path: ['wikiSavedAt'], message: 'wiki ingest requires a saved timestamp' });
    }
    if (t.wikiSavedAt !== undefined && t.wikiIngestId === undefined) {
        ctx.addIssue({ code: 'custom', path: ['wikiIngestId'], message: 'wiki saved timestamp requires an ingest id' });
    }
});
//# sourceMappingURL=topic.js.map