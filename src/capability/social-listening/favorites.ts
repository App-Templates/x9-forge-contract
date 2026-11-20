import { z } from 'zod';
import { sameCapabilityScope } from '../capability-call-context.js';
import { CapabilityAgentScopeSchema, type CapabilityAgentScope } from '../capability-call-identity.js';
import { SocialVerticalIdSchema } from './post.js';
import { SocialTopicSchema, type SocialTopic } from './topic.js';

/** Personal favorites tools: separate from SOCIAL_LISTENING_TOOLS (the exact tool list stays unchanged). */
export const SOCIAL_FAVORITES_TOOLS = {
  add: 'social_favorite_add',
  remove: 'social_favorite_remove',
  list: 'social_favorite_list',
} as const;

/** Provisional cap on the favorites of one scope. */
export const SOCIAL_FAVORITES_MAX = 200;

const TopicIdSchema = SocialTopicSchema.shape.topicId;

/** Archive row: tenant, owner and agent on every row (R-33); "personal" = the tenant+owner+agent scope. */
export const SocialFavoriteSchema = z.strictObject({
  identity: CapabilityAgentScopeSchema,
  topicId: TopicIdSchema,
  addedAt: z.iso.datetime({ offset: true }),
});
export type SocialFavorite = z.infer<typeof SocialFavoriteSchema>;

/** No identity in the input: it comes from the call envelope (R-33). */
export const SocialFavoriteAddInputSchema = z.strictObject({ topicId: TopicIdSchema });
export type SocialFavoriteAddInput = z.infer<typeof SocialFavoriteAddInputSchema>;

export const SocialFavoriteRemoveInputSchema = z.strictObject({ topicId: TopicIdSchema });
export type SocialFavoriteRemoveInput = z.infer<typeof SocialFavoriteRemoveInputSchema>;

export const SocialFavoriteListInputSchema = z.strictObject({ verticalId: SocialVerticalIdSchema.optional() });
export type SocialFavoriteListInput = z.infer<typeof SocialFavoriteListInputSchema>;

export const SocialFavoriteItemSchema = z.strictObject({
  topicId: SocialTopicSchema.shape.topicId,
  verticalId: SocialTopicSchema.shape.verticalId,
  day: SocialTopicSchema.shape.day,
  title: SocialTopicSchema.shape.title,
  category: SocialTopicSchema.shape.category,
  verdict: SocialTopicSchema.shape.verdict,
  heat: SocialTopicSchema.shape.heat,
  addedAt: z.iso.datetime({ offset: true }),
});
export type SocialFavoriteItem = z.infer<typeof SocialFavoriteItemSchema>;

export const SocialFavoriteAddOutputSchema = z.strictObject({ favorite: SocialFavoriteItemSchema });
export type SocialFavoriteAddOutput = z.infer<typeof SocialFavoriteAddOutputSchema>;

export const SocialFavoriteRemoveOutputSchema = z.strictObject({ favorite: SocialFavoriteItemSchema });
export type SocialFavoriteRemoveOutput = z.infer<typeof SocialFavoriteRemoveOutputSchema>;

export const SocialFavoriteListOutputSchema = z.strictObject({
  favorites: z.array(SocialFavoriteItemSchema).max(SOCIAL_FAVORITES_MAX),
});
export type SocialFavoriteListOutput = z.infer<typeof SocialFavoriteListOutputSchema>;

export const SocialFavoritesToolErrorSchema = z.enum([
  'invalid_request',
  'not_configured',
  'unknown_topic',
  'favorite_already_added',
  'favorite_not_found',
  'favorite_limit_reached',
]);
export type SocialFavoritesToolError = z.infer<typeof SocialFavoritesToolErrorSchema>;

type TopicForFavorite = Pick<SocialTopic, 'identity' | 'topicId' | 'verticalId' | 'day' | 'title' | 'category' | 'verdict' | 'heat'>;

/**
 * Pure list: only favorites and topics of the scope; joined by `topicId`; a favorite whose topic is missing
 * (or belongs to another scope) is dropped; newest `addedAt` first, then `topicId`. No clock.
 */
export function listSocialFavorites(
  favorites: readonly SocialFavorite[],
  topics: readonly TopicForFavorite[],
  query: { scope: CapabilityAgentScope; verticalId?: string },
): SocialFavoriteListOutput {
  const byId = new Map<string, TopicForFavorite>();
  for (const t of topics) {
    if (sameCapabilityScope(t.identity, query.scope)) byId.set(t.topicId, t);
  }
  const items: SocialFavoriteItem[] = [];
  for (const f of favorites) {
    if (!sameCapabilityScope(f.identity, query.scope)) continue;
    const t = byId.get(f.topicId);
    if (t === undefined) continue;
    if (query.verticalId !== undefined && t.verticalId !== query.verticalId) continue;
    items.push({
      topicId: t.topicId,
      verticalId: t.verticalId,
      day: t.day,
      title: t.title,
      category: t.category,
      verdict: t.verdict,
      heat: t.heat,
      addedAt: f.addedAt,
    });
  }
  items.sort((a, b) =>
    a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : a.topicId < b.topicId ? -1 : a.topicId > b.topicId ? 1 : 0);
  return { favorites: items.slice(0, SOCIAL_FAVORITES_MAX) };
}

/** Pure decision before an add: counts only the rows of the scope. */
export function decideSocialFavoriteAdd(
  existing: readonly Pick<SocialFavorite, 'identity' | 'topicId'>[],
  scope: CapabilityAgentScope,
  topicId: string,
): { ok: true } | { ok: false; error: 'favorite_already_added' | 'favorite_limit_reached' } {
  const mine = existing.filter(f => sameCapabilityScope(f.identity, scope));
  if (mine.some(f => f.topicId === topicId)) return { ok: false, error: 'favorite_already_added' };
  if (mine.length >= SOCIAL_FAVORITES_MAX) return { ok: false, error: 'favorite_limit_reached' };
  return { ok: true };
}
