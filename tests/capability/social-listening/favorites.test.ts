import { describe, it, expect } from 'vitest';
import {
  SOCIAL_LISTENING_TOOLS,
  SOCIAL_CREATORS_TOOLS,
  SOCIAL_FAVORITES_TOOLS,
  SOCIAL_FAVORITES_MAX,
  SocialFavoriteSchema,
  SocialFavoriteAddInputSchema,
  SocialFavoriteRemoveInputSchema,
  SocialFavoriteListInputSchema,
  SocialFavoriteListOutputSchema,
  decideSocialFavoriteAdd,
  listSocialFavorites,
} from '../../../src/capability/social-listening/index';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const other = { ...scope, ownerId: 'owner-2' };

type Topic = Parameters<typeof listSocialFavorites>[1][number];
function topic(topicId: string, over: Partial<Topic> = {}): Topic {
  return {
    identity: scope, topicId, verticalId: 'ai', day: '2026-11-10', title: `Titolo ${topicId}`,
    category: 'tools', verdict: 'funziona', heat: 5, ...over,
  };
}
const fav = (topicId: string, addedAt: string, identity = scope) => ({ identity, topicId, addedAt });

describe('social favorites', () => {
  it('(a) tool names are fixed and distinct from the other tool sets', () => {
    expect(SOCIAL_FAVORITES_TOOLS).toEqual({
      add: 'social_favorite_add', remove: 'social_favorite_remove', list: 'social_favorite_list',
    });
    const others = [...Object.values(SOCIAL_LISTENING_TOOLS), ...Object.values(SOCIAL_CREATORS_TOOLS)];
    for (const n of Object.values(SOCIAL_FAVORITES_TOOLS)) expect(others).not.toContain(n);
  });

  it('(b) row needs identity; input carries none', () => {
    const row = fav('t1', '2026-11-10T10:00:00Z');
    expect(SocialFavoriteSchema.safeParse(row).success).toBe(true);
    expect(SocialFavoriteSchema.safeParse({ topicId: 't1', addedAt: row.addedAt }).success).toBe(false);
    expect(SocialFavoriteSchema.safeParse({ ...row, identity: { ...scope, ownerId: '' } }).success).toBe(false);
    expect(SocialFavoriteAddInputSchema.safeParse({ topicId: 't1' }).success).toBe(true);
    expect(SocialFavoriteAddInputSchema.safeParse({ topicId: 't1', agentId: 'x9' }).success).toBe(false);
    expect(SocialFavoriteRemoveInputSchema.safeParse({ topicId: 't1', agentId: 'x9' }).success).toBe(false);
    expect(SocialFavoriteListInputSchema.safeParse({}).success).toBe(true);
    expect(SocialFavoriteListInputSchema.safeParse({ verticalId: 'ai', agentId: 'x9' }).success).toBe(false);
  });

  it('(c) list keeps only the scope, newest first', () => {
    const out = listSocialFavorites(
      [fav('t1', '2026-11-10T10:00:00Z'), fav('t2', '2026-11-12T10:00:00Z'), fav('t3', '2026-11-13T10:00:00Z', other)],
      [topic('t1'), topic('t2'), topic('t3', { identity: other })],
      { scope },
    );
    expect(out.favorites.map(f => f.topicId)).toEqual(['t2', 't1']);
    expect(SocialFavoriteListOutputSchema.safeParse(out).success).toBe(true);
  });

  it('(c2) a topic of another scope never lends its data to a favorite of this scope', () => {
    const out = listSocialFavorites([fav('t1', '2026-11-10T10:00:00Z')], [topic('t1', { identity: other })], { scope });
    expect(out.favorites).toEqual([]);
  });

  it('(c3) ties on addedAt break by topicId', () => {
    const at = '2026-11-10T10:00:00Z';
    const out = listSocialFavorites([fav('b', at), fav('a', at)], [topic('a'), topic('b')], { scope });
    expect(out.favorites.map(f => f.topicId)).toEqual(['a', 'b']);
  });

  it('(d) orphan favorite is dropped and the output stays valid', () => {
    const out = listSocialFavorites(
      [fav('t1', '2026-11-10T10:00:00Z'), fav('gone', '2026-11-11T10:00:00Z')],
      [topic('t1')],
      { scope },
    );
    expect(out.favorites.map(f => f.topicId)).toEqual(['t1']);
    expect(SocialFavoriteListOutputSchema.safeParse(out).success).toBe(true);
  });

  it('(e) filters by vertical', () => {
    const out = listSocialFavorites(
      [fav('t1', '2026-11-10T10:00:00Z'), fav('t2', '2026-11-11T10:00:00Z')],
      [topic('t1', { verticalId: 'ai' }), topic('t2', { verticalId: 'fitness' })],
      { scope, verticalId: 'fitness' },
    );
    expect(out.favorites.map(f => f.topicId)).toEqual(['t2']);
  });

  it('(f) add decision: duplicate, limit, other scope does not count', () => {
    expect(decideSocialFavoriteAdd([fav('t1', '2026-11-10T10:00:00Z')], scope, 't1'))
      .toEqual({ ok: false, error: 'favorite_already_added' });
    const full = (identity: typeof scope) =>
      Array.from({ length: SOCIAL_FAVORITES_MAX }, (_, i) => fav(`x${i}`, '2026-11-10T10:00:00Z', identity));
    expect(decideSocialFavoriteAdd(full(scope), scope, 'new')).toEqual({ ok: false, error: 'favorite_limit_reached' });
    expect(decideSocialFavoriteAdd(full(other), scope, 'new')).toEqual({ ok: true });
    expect(decideSocialFavoriteAdd([fav('t1', '2026-11-10T10:00:00Z', other)], scope, 't1')).toEqual({ ok: true });
  });
});
