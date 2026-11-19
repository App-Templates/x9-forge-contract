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
  day: AgentDaySchema.optional(),
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

/** One shape for Telegram and X9 Live web. */
export const SocialRecapOutputSchema = z.strictObject({
  verticalId: SocialVerticalIdSchema,
  day: AgentDaySchema,
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
  /** Link to the agent's Ascolto page in Forge; absent when the service has no page template or cannot resolve the agent slug. */
  pageUrl: WebUrlSchema.optional(),
}).superRefine((r, ctx) => {
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
