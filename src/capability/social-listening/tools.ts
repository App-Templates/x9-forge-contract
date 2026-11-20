import { z } from 'zod';
import { WebUrlSchema } from '../ricerca/research.js';
import { AgentDaySchema } from '../ricerca/spend.js';
import {
  SocialFollowedProfileSchema,
  SocialHandleSchema,
  SocialProviderSchema,
  SocialVerticalIdSchema,
} from './post.js';
import {
  SOCIAL_VERDICTS,
  SocialCategorySlugSchema,
  SocialTopicCostSchema,
  SocialTopicSchema,
  SocialTopicTitleSchema,
  SocialTrackSchema,
  SocialVerdictSchema,
  SocialVerticalSchema,
} from './topic.js';
import { socialCostPerPost } from './fact-memory.js';

/**
 * The tools of the social listening capability. Agents (Telegram and X9 Live web reach the same agent-core router)
 * call them at `capToolCallPath(SOCIAL_LISTENING_TOOLS.<tool>)` — never with a hand-written path.
 * Errors use the bridge tool-call codes (`TOOL_CALL_INVALID`, `TOOL_EXEC_FAILED`) with a
 * {@link SocialListeningToolError} as the error text.
 */
export const SOCIAL_LISTENING_TOOLS = {
  /** The recap of a day for a vertical. */
  recap: 'social_recap',
  /** One topic in full. */
  topicGet: 'social_topic_get',
  /** The followed profiles. */
  profilesList: 'social_profiles_list',
  profileFollow: 'social_profile_follow',
  profileUnfollow: 'social_profile_unfollow',
  /** The verticals with their category vocabulary. */
  verticalsList: 'social_verticals_list',
  verticalSet: 'social_vertical_set',
} as const;
export type SocialListeningToolName = (typeof SOCIAL_LISTENING_TOOLS)[keyof typeof SOCIAL_LISTENING_TOOLS];

/** Why a social listening tool call failed (the `error` text of a bridge tool-call error). */
export const SocialListeningToolErrorSchema = z.enum([
  'invalid_request',
  'not_configured',
  'unknown_vertical',
  'unknown_topic',
  'profile_already_followed',
  'profile_not_found',
  'profile_limit_reached',
]);
export type SocialListeningToolError = z.infer<typeof SocialListeningToolErrorSchema>;

/** Followed profiles allowed per agent (provisional size). */
export const SOCIAL_FOLLOWED_PROFILES_MAX = 100;

/** Inputs: never any identity. Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33). */
export const SocialRecapInputSchema = z.strictObject({
  verticalId: SocialVerticalIdSchema.optional(),
  /** Without `day`: the last finished round. */
  day: AgentDaySchema.optional().describe("Giorno richiesto (AAAA-MM-GG); se non c'è un giro finito quel giorno si riceve l'ultimo giro finito prima. Senza giorno: l'ultimo giro finito."),
});
export const SocialTopicGetInputSchema = z.strictObject({ topicId: z.string().min(1).max(100) });
export const SocialProfilesListInputSchema = z.strictObject({ verticalId: SocialVerticalIdSchema.optional() });
export const SocialProfileFollowInputSchema = z.strictObject({
  provider: SocialProviderSchema,
  handle: SocialHandleSchema,
  verticalId: SocialVerticalIdSchema,
});
export const SocialProfileUnfollowInputSchema = z.strictObject({
  provider: SocialProviderSchema,
  handle: SocialHandleSchema,
});
export const SocialVerticalsListInputSchema = z.strictObject({});
export const SocialVerticalSetInputSchema = SocialVerticalSchema;

/** The topic as the recap lists it: the full text is read with `social_topic_get`. */
export const SocialRecapTopicSummarySchema = z.strictObject({
  topicId: z.string().min(1).max(100),
  title: SocialTopicTitleSchema,
  category: SocialCategorySlugSchema,
  verdict: SocialVerdictSchema,
  heat: z.number().min(0).max(10),
  cost: SocialTopicCostSchema,
});

const NonNegativeIntSchema = z.number().int().nonnegative();

/** The agent's Ascolto page in Forge, relative to the caller's base URL. */
export const SOCIAL_ASCOLTO_PAGE_PATH = '/agents/{slug}/ascolto' as const;

/** Build a path from one slug segment without coercing untrusted values. */
export function socialAscoltoPagePath(agentSlug: unknown): string | null {
  if (
    typeof agentSlug !== 'string' ||
    agentSlug.length < 1 ||
    agentSlug.length > 100 ||
    /[/\\\u0000-\u001f\u007f-\u009f]/.test(agentSlug) ||
    /^(?:\.|%2e){1,2}$/i.test(agentSlug)
  ) {
    return null;
  }

  try {
    return SOCIAL_ASCOLTO_PAGE_PATH.replace('{slug}', encodeURIComponent(agentSlug));
  } catch {
    // encodeURIComponent rejects malformed UTF-16, such as a lone surrogate.
    return null;
  }
}

/** The sentence that introduces the Ascolto page link; written once, here. */
export const SOCIAL_ASCOLTO_PAGE_LINE_PREFIX = 'Apri la pagina Ascolto: ' as const;

/** Ready-to-send line with the Ascolto page link. */
export function socialAscoltoPageLine(pageUrl: string): string {
  return SOCIAL_ASCOLTO_PAGE_LINE_PREFIX + pageUrl;
}

/** One shape for Telegram and X9 Live web. */
export const SocialRecapOutputSchema = z.strictObject({
  /** Ready-to-send line with the Ascolto page link; the first thing in the result. */
  pageLine: z.string().max(400).optional(),
  /** Link to the agent's Ascolto page in Forge, up front so the model sees it before the topics; absent when the service has no page template or cannot resolve the agent slug. */
  pageUrl: WebUrlSchema.optional(),
  verticalId: SocialVerticalIdSchema,
  day: AgentDaySchema,
  /** The requested day, paired with `stale`; absent on recaps built before freshness metadata. */
  requestedDay: AgentDaySchema.optional(),
  /** Whether the returned round predates `requestedDay`; present only with `requestedDay`. */
  stale: z.boolean().optional(),
  track: SocialTrackSchema,
  finishedAt: z.iso.datetime({ offset: true }).nullable(),
  counts: z.strictObject(
    Object.fromEntries(SOCIAL_VERDICTS.map(v => [v, NonNegativeIntSchema])) as Record<
      (typeof SOCIAL_VERDICTS)[number],
      typeof NonNegativeIntSchema
    >,
  ),
  postsSeen: NonNegativeIntSchema,
  spentUsd: z.number().nonnegative().finite(),
  /** Cost of one post in USD of the round, from `socialCostPerPost`; absent when no post was seen and on recaps built before. */
  costPerPostUsd: z.number().nonnegative().finite().optional(),
  topics: z.array(SocialRecapTopicSummarySchema).max(50),
}).superRefine((r, ctx) => {
  if (r.pageLine !== undefined && (r.pageUrl === undefined || r.pageLine !== socialAscoltoPageLine(r.pageUrl))) {
    ctx.addIssue({ code: 'custom', path: ['pageLine'], message: 'pageLine must be socialAscoltoPageLine(pageUrl)' });
  }
  if ((r.requestedDay === undefined) !== (r.stale === undefined)) {
    ctx.addIssue({
      code: 'custom',
      path: [r.requestedDay === undefined ? 'requestedDay' : 'stale'],
      message: 'requestedDay and stale must be present together',
    });
  }
  if (r.requestedDay !== undefined && r.stale !== undefined) {
    if (r.stale !== (r.day !== r.requestedDay)) {
      ctx.addIssue({ code: 'custom', path: ['stale'], message: 'stale must match whether day differs from requestedDay' });
    }
    if (r.day > r.requestedDay) {
      ctx.addIssue({ code: 'custom', path: ['requestedDay'], message: 'requestedDay must not precede day' });
    }
  }
  if (r.costPerPostUsd === undefined) return;
  if (r.costPerPostUsd !== socialCostPerPost({ spentUsd: r.spentUsd, postsSeen: r.postsSeen })) {
    ctx.addIssue({ code: 'custom', path: ['costPerPostUsd'], message: 'costPerPostUsd must match spentUsd / postsSeen' });
  }
});

/**
 * The topic without identity. `.omit()` is not allowed on a refined schema (zod 4), so the shape is rebuilt from
 * {@link SocialTopicSchema} and the same fact rule is applied again.
 */
const { identity: _topicIdentity, ...socialTopicShape } = SocialTopicSchema.shape;
export const SocialTopicGetOutputSchema = z.strictObject(socialTopicShape).superRefine((t, ctx) => {
  if ((t.verdict === 'funziona' || t.verdict === 'da_provare') && t.facts.length < 1) {
    ctx.addIssue({ code: 'custom', path: ['facts'], message: 'verdict funziona/da_provare needs at least one fact' });
  }
});
export const SocialProfilesListOutputSchema = z.strictObject({
  profiles: z.array(SocialFollowedProfileSchema).max(SOCIAL_FOLLOWED_PROFILES_MAX),
});
export const SocialProfileFollowOutputSchema = z.strictObject({ profile: SocialFollowedProfileSchema });
export const SocialProfileUnfollowOutputSchema = z.strictObject({ profile: SocialFollowedProfileSchema });
export const SocialVerticalsListOutputSchema = z.strictObject({ verticals: z.array(SocialVerticalSchema).max(20) });
export const SocialVerticalSetOutputSchema = z.strictObject({ vertical: SocialVerticalSchema });

export type SocialRecapInput = z.infer<typeof SocialRecapInputSchema>;
export type SocialTopicGetInput = z.infer<typeof SocialTopicGetInputSchema>;
export type SocialProfilesListInput = z.infer<typeof SocialProfilesListInputSchema>;
export type SocialProfileFollowInput = z.infer<typeof SocialProfileFollowInputSchema>;
export type SocialProfileUnfollowInput = z.infer<typeof SocialProfileUnfollowInputSchema>;
export type SocialVerticalsListInput = z.infer<typeof SocialVerticalsListInputSchema>;
export type SocialVerticalSetInput = z.infer<typeof SocialVerticalSetInputSchema>;
export type SocialRecapTopicSummary = z.infer<typeof SocialRecapTopicSummarySchema>;
export type SocialRecapOutput = z.infer<typeof SocialRecapOutputSchema>;
export type SocialTopicGetOutput = z.infer<typeof SocialTopicGetOutputSchema>;
export type SocialProfilesListOutput = z.infer<typeof SocialProfilesListOutputSchema>;
export type SocialProfileFollowOutput = z.infer<typeof SocialProfileFollowOutputSchema>;
export type SocialProfileUnfollowOutput = z.infer<typeof SocialProfileUnfollowOutputSchema>;
export type SocialVerticalsListOutput = z.infer<typeof SocialVerticalsListOutputSchema>;
export type SocialVerticalSetOutput = z.infer<typeof SocialVerticalSetOutputSchema>;
