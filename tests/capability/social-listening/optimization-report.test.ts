import { describe, expect, it } from 'vitest';
import {
  SocialRoundOptimizationSchema,
  socialRoundOptimization,
} from '../../../src/capability/social-listening/index.js';

const base = { day: '2026-11-20', track: 'server' as const, topics: 3, factsReused: 2, factsNew: 5 };

describe('socialRoundOptimization', () => {
  it('(a) server round with filter, facts and cost near the estimate', () => {
    const r = socialRoundOptimization({ ...base, postsSeen: 10, postsKept: 6, postsDiscarded: 4, spentUsd: 0.6 });
    expect(r.keepRatio).toBe(0.6);
    expect(r.costPerPostUsd).toBe(0.06);
    expect(r.vsEstimate?.near).toBe(true);
    expect(r.postsUnfiltered).toBe(0);
    expect(SocialRoundOptimizationSchema.safeParse(r).success).toBe(true);
  });

  it('(b) filtered posts above seen throw; a wrong sum fails the schema', () => {
    expect(() => socialRoundOptimization({ ...base, postsSeen: 10, postsKept: 8, postsDiscarded: 5, spentUsd: 1 })).toThrow(
      'filtered_posts_exceed_seen',
    );
    const ok = socialRoundOptimization({ ...base, postsSeen: 10, postsKept: 6, postsDiscarded: 4, spentUsd: 0.6 });
    expect(SocialRoundOptimizationSchema.safeParse({ ...ok, postsKept: 7 }).success).toBe(false);
  });

  it('(c) no filter run: all posts unfiltered, keepRatio null', () => {
    const r = socialRoundOptimization({ ...base, postsSeen: 4, postsKept: 0, postsDiscarded: 0, spentUsd: 0.2 });
    expect(r.postsUnfiltered).toBe(4);
    expect(r.keepRatio).toBeNull();
  });

  it('(c) partial filtering uses only filtered posts and rounds to six decimals', () => {
    const r = socialRoundOptimization({ ...base, postsSeen: 4, postsKept: 2, postsDiscarded: 1, spentUsd: 0.2 });
    expect(r.postsUnfiltered).toBe(1);
    expect(r.keepRatio).toBe(0.666667);
    expect(SocialRoundOptimizationSchema.safeParse(r).success).toBe(true);
  });

  it('(d) Mac round and empty server round have no estimate comparison', () => {
    const mac = socialRoundOptimization({ ...base, track: 'mac', postsSeen: 10, postsKept: 6, postsDiscarded: 4, spentUsd: 0 });
    expect(mac.vsEstimate).toBeNull();
    const empty = socialRoundOptimization({ ...base, postsSeen: 0, postsKept: 0, postsDiscarded: 0, spentUsd: 0 });
    expect(empty.costPerPostUsd).toBeNull();
    expect(empty.vsEstimate).toBeNull();
  });

  it('(e) cost far above the estimate is not near', () => {
    const r = socialRoundOptimization({ ...base, postsSeen: 3, postsKept: 3, postsDiscarded: 0, spentUsd: 0.5 });
    expect(r.vsEstimate?.near).toBe(false);
    expect(r.vsEstimate?.ratio).toBeGreaterThan(1.5);
  });
});
