import { z } from 'zod';
import { sameCapabilityScope } from '../capability-call-context.js';
import type { CapabilityAgentScope } from '../capability-call-identity.js';
import { AgentDaySchema } from '../ricerca/spend.js';
import { SocialHandleSchema, SocialVerticalIdSchema } from './post.js';
import { SOCIAL_VERDICT_TRUTH_SCORE, type SocialTopic, type SocialVerdict } from './topic.js';

/** Creator ranking tool: separate from SOCIAL_LISTENING_TOOLS (the exact tool list stays unchanged). */
export const SOCIAL_CREATORS_TOOLS = { rank: 'social_creators_rank' } as const;

export const SOCIAL_CREATORS_RANK_DAYS_DEFAULT = 30;
export const SOCIAL_CREATORS_RANK_LIMIT_DEFAULT = 50;

/** No identity in the input: tenant, owner and agent come from the call envelope (R-33). */
export const SocialCreatorsRankInputSchema = z.strictObject({
  verticalId: SocialVerticalIdSchema.optional(),
  days: z.int().min(1).max(30).optional(),
  limit: z.int().min(1).max(100).optional(),
  orderBy: z.enum(['truth', 'heat']).optional(),
});
export type SocialCreatorsRankInput = z.infer<typeof SocialCreatorsRankInputSchema>;

export const SocialCreatorRankSchema = z.strictObject({
  handle: SocialHandleSchema,
  topics: z.int().min(1),
  counts: z.strictObject({
    funziona: z.int().min(0),
    da_provare: z.int().min(0),
    non_funziona: z.int().min(0),
    fuffa: z.int().min(0),
  }),
  /** Average of the verdict scores of the creator's topics, 0..100 (D16). */
  truthScore: z.number().min(0).max(100),
  lastDay: AgentDaySchema,
  /** Heat: the sum of the heat of the creator's topics, each divided by the number of creators who talk about it (REVISIONE-DESIGN, creators). */
  heatScore: z.number().nonnegative().optional(),
  postsAnalyzed: z.int().min(0).optional(),
});
export type SocialCreatorRank = z.infer<typeof SocialCreatorRankSchema>;

export const SocialCreatorsRankOutputSchema = z.strictObject({
  fromDay: AgentDaySchema,
  toDay: AgentDaySchema,
  creators: z.array(SocialCreatorRankSchema).max(100),
  idle: z.array(SocialHandleSchema).max(100).optional(),
}).refine(o => o.fromDay <= o.toDay, { path: ['fromDay'], message: 'fromDay after toDay' });
export type SocialCreatorsRankOutput = z.infer<typeof SocialCreatorsRankOutputSchema>;

export const SocialCreatorsToolErrorSchema = z.enum(['invalid_request', 'not_configured', 'unknown_vertical']);
export type SocialCreatorsToolError = z.infer<typeof SocialCreatorsToolErrorSchema>;

function shiftDay(day: string, delta: number): string {
  const t = new Date(day + 'T00:00:00Z');
  t.setUTCDate(t.getUTCDate() + delta);
  return t.toISOString().slice(0, 10);
}

/** Pure ranking: no clock, `toDay` comes from the caller. Topics of another scope never count. */
export function rankSocialCreators(
  topics: readonly (Pick<SocialTopic, 'identity' | 'verticalId' | 'day' | 'verdict' | 'creators'> & Partial<Pick<SocialTopic, 'heat' | 'postIds'>>)[],
  query: {
    scope: CapabilityAgentScope;
    toDay: string;
    verticalId?: string;
    days?: number;
    limit?: number;
    orderBy?: SocialCreatorsRankInput['orderBy'];
    followed?: readonly string[];
    posts?: readonly { postId: string; handle: string }[];
  },
): SocialCreatorsRankOutput {
  const days = query.days ?? SOCIAL_CREATORS_RANK_DAYS_DEFAULT;
  const limit = query.limit ?? SOCIAL_CREATORS_RANK_LIMIT_DEFAULT;
  const fromDay = shiftDay(query.toDay, -(days - 1));
  const postsByHandle = new Map<string, Set<string>>();
  for (const post of query.posts ?? []) {
    const ids = postsByHandle.get(post.handle) ?? new Set<string>();
    ids.add(post.postId);
    postsByHandle.set(post.handle, ids);
  }
  const acc = new Map<string, {
    counts: Record<SocialVerdict, number>;
    sum: number;
    heat: number;
    postIds: Set<string>;
    topics: number;
    lastDay: string;
  }>();
  for (const t of topics) {
    if (!sameCapabilityScope(t.identity, query.scope)) continue;
    if (query.verticalId !== undefined && t.verticalId !== query.verticalId) continue;
    if (t.day < fromDay || t.day > query.toDay) continue;
    for (const handle of new Set(t.creators)) {
      const e = acc.get(handle) ?? {
        counts: { funziona: 0, da_provare: 0, non_funziona: 0, fuffa: 0 },
        sum: 0, heat: 0, postIds: new Set<string>(), topics: 0, lastDay: t.day,
      };
      e.counts[t.verdict] += 1;
      e.sum += SOCIAL_VERDICT_TRUTH_SCORE[t.verdict];
      // Empty creator lists never enter this loop; legacy projections may omit heat/postIds.
      e.heat += (t.heat ?? 0) / t.creators.length;
      const ownPostIds = postsByHandle.get(handle);
      for (const postId of t.postIds ?? []) {
        if (ownPostIds?.has(postId)) e.postIds.add(postId);
      }
      e.topics += 1;
      if (t.day > e.lastDay) e.lastDay = t.day;
      acc.set(handle, e);
    }
  }
  const creators = [...acc.entries()]
    .map(([handle, e]) => ({
      handle,
      topics: e.topics,
      counts: e.counts,
      truthScore: Math.round((e.sum / e.topics) * 10) / 10,
      lastDay: e.lastDay,
      heatScore: Math.round(e.heat * 10) / 10,
      postsAnalyzed: e.postIds.size,
    }))
    .sort((a, b) => (query.orderBy === 'heat'
      ? b.heatScore - a.heatScore || b.truthScore - a.truthScore
      : b.truthScore - a.truthScore || b.topics - a.topics)
      || (a.handle < b.handle ? -1 : a.handle > b.handle ? 1 : 0))
    .slice(0, limit);
  return {
    fromDay, toDay: query.toDay, creators,
    ...(query.followed === undefined ? {} : {
      idle: [...new Set(query.followed)].filter(handle => !acc.has(handle)).sort().slice(0, 100),
    }),
  };
}
