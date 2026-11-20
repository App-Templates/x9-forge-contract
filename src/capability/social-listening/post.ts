import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { WebUrlSchema } from '../ricerca/research.js';
import { SocialPostAnalysisSchema } from './verdict.js';

/**
 * Social providers. The provider sits behind an interface: TikTok, YouTube, LinkedIn are added here
 * without changing the tools. Instagram collection goes through the Mac, never from the server with cookies.
 */
export const SOCIAL_PROVIDERS = ['instagram'] as const;
export const SocialProviderSchema = z.enum(SOCIAL_PROVIDERS);
export type SocialProvider = z.infer<typeof SocialProviderSchema>;

/** A real account name, e.g. `alassafi.ai`, `davi.d_roberts`. */
export const SocialHandleSchema = z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9._-]+$/);
export type SocialHandle = z.infer<typeof SocialHandleSchema>;

const IsoDateTimeSchema = z.iso.datetime({ offset: true });

/** Slug of a vertical (same rule as video preset ids). */
export const SocialVerticalIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export type SocialVerticalId = z.infer<typeof SocialVerticalIdSchema>;

export const SocialFollowedProfileSchema = z.object({
  provider: SocialProviderSchema,
  handle: SocialHandleSchema,
  verticalId: SocialVerticalIdSchema,
  addedAt: IsoDateTimeSchema,
}).strict();
export type SocialFollowedProfile = z.infer<typeof SocialFollowedProfileSchema>;

export const SOCIAL_POST_KINDS = ['video', 'image', 'carousel'] as const;
export const SocialPostKindSchema = z.enum(SOCIAL_POST_KINDS);
export type SocialPostKind = z.infer<typeof SocialPostKindSchema>;

/** Outcome of the `filter` job on a post: kept or dropped, why, and when the service applied it. */
export const SocialPostFilterSchema = z.object({
  keep: z.boolean(),
  reason: z.string().min(1).max(300).optional(),
  filteredAt: IsoDateTimeSchema,
}).strict();
export type SocialPostFilter = z.infer<typeof SocialPostFilterSchema>;

/** Web text (caption, transcript) is DATA, never instructions: bounded in length. */
export const SocialPostSchema = z.object({
  identity: CapabilityAgentScopeSchema,
  postId: z.string().min(1).max(100),
  provider: SocialProviderSchema,
  handle: SocialHandleSchema,
  link: WebUrlSchema,
  publishedAt: IsoDateTimeSchema,
  kind: SocialPostKindSchema,
  caption: z.string().max(5000),
  transcript: z.string().max(60000).optional(),
  analysis: SocialPostAnalysisSchema.optional(),
  filter: SocialPostFilterSchema.optional(),
  collectedAt: IsoDateTimeSchema,
}).strict();
export type SocialPost = z.infer<typeof SocialPostSchema>;
