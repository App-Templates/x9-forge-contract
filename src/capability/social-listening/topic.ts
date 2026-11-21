import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { LabIngestIdSchema } from '../lab/tools.js';
import { ResearchIdSchema, ResearchSourceSchema } from '../ricerca/research.js';
import { AgentDaySchema } from '../ricerca/spend.js';
import { VideoProjectIdSchema } from '../video/brief.js';
import { SocialHandleSchema, SocialVerticalIdSchema } from './post.js';
import { SocialFactSchema, SocialVerdictSchema, type SocialVerdict } from './verdict.js';

const IsoDateTimeSchema = z.iso.datetime({ offset: true });

export const SocialCategorySlugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export type SocialCategorySlug = z.infer<typeof SocialCategorySlugSchema>;

export const SocialCategorySchema = z.object({
  slug: SocialCategorySlugSchema,
  label: z.string().min(1).max(60),
}).strict();
export type SocialCategory = z.infer<typeof SocialCategorySchema>;

/** A vertical with its own category vocabulary (the vocabulary data lives in the project, not here). */
export const SocialVerticalSchema = z.object({
  id: SocialVerticalIdSchema,
  label: z.string().min(1).max(100),
  description: z.string().max(500),
  categories: z.array(SocialCategorySchema).min(1).max(30),
}).strict().superRefine((v, ctx) => {
  const seen = new Set<string>();
  v.categories.forEach((c, i) => {
    if (seen.has(c.slug)) ctx.addIssue({ code: 'custom', path: ['categories', i, 'slug'], message: 'duplicate category slug' });
    seen.add(c.slug);
  });
});
export type SocialVertical = z.infer<typeof SocialVerticalSchema>;

export function socialCategoryInVertical(vertical: Pick<SocialVertical, 'categories'>, slug: string): boolean {
  return vertical.categories.some(c => c.slug === slug);
}

export { SOCIAL_VERDICTS, SocialVerdictSchema, type SocialVerdict } from './verdict.js';

/** Creators' "truth" score per verdict (D16). */
export const SOCIAL_VERDICT_TRUTH_SCORE = {
  funziona: 100,
  da_provare: 50,
  non_funziona: 0,
  fuffa: 0,
} satisfies Record<SocialVerdict, number>;

/** The track that did the work (D9). */
export const SOCIAL_TRACKS = ['mac', 'server'] as const;
export const SocialTrackSchema = z.enum(SOCIAL_TRACKS);
export type SocialTrack = z.infer<typeof SocialTrackSchema>;

/** Short title: under 32 characters. */
export const SOCIAL_TOPIC_TITLE_MAX = 31;
export const SocialTopicTitleSchema = z.string().trim().min(1).max(SOCIAL_TOPIC_TITLE_MAX);

export const SOCIAL_TOPIC_ANGLE_MAX = 600;
/** How to tell this topic as a story: one or two sentences for the owner; DATA, never instructions. */
export const SocialTopicAngleSchema = z.string().trim().min(1).max(SOCIAL_TOPIC_ANGLE_MAX);

/** A fact cites at least one http(s) source: reused from research, minus its `origin`. */
export const SocialTopicFactSchema = SocialFactSchema;
export type SocialTopicFact = z.infer<typeof SocialTopicFactSchema>;

export const SocialTopicSourceSchema = ResearchSourceSchema;
export type SocialTopicSource = z.infer<typeof SocialTopicSourceSchema>;

/** Cost per topic (D8). On the Mac `usd` is 0 (subscription quota). */
export const SocialTopicCostSchema = z.object({
  usd: z.number().nonnegative().finite(),
  track: SocialTrackSchema,
  uncertain: z.boolean(),
}).strict();
export type SocialTopicCost = z.infer<typeof SocialTopicCostSchema>;

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
  angle: SocialTopicAngleSchema.optional(),
  cost: SocialTopicCostSchema,
  computedAt: IsoDateTimeSchema,
  /** The extended research already done (D14): the button goes away. */
  extendedResearchId: ResearchIdSchema.optional(),
  /** Set by the service after `lab_ingest` accepted the topic (D15). */
  wikiIngestId: LabIngestIdSchema.optional(),
  wikiSavedAt: IsoDateTimeSchema.optional(),
  /** The cap-video project born from this topic's brief (P9). */
  videoProjectId: VideoProjectIdSchema.optional(),
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
export type SocialTopic = z.infer<typeof SocialTopicSchema>;
