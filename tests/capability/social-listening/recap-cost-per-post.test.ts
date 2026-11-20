import { describe, expect, it } from 'vitest';
import { SocialRecapOutputSchema } from '../../../src/capability/social-listening/tools.js';

const summary = (i: number, verdict = 'funziona') => ({
  topicId: `cluster-${i}`,
  title: `Argomento ${i}`,
  category: 'coding',
  verdict,
  heat: 5,
  cost: { usd: 0, track: 'mac', uncertain: false },
});
const recap = {
  verticalId: 'ai',
  day: '2026-11-03',
  track: 'mac',
  finishedAt: '2026-11-03T14:40:00+00:00',
  counts: { funziona: 2, da_provare: 6, non_funziona: 0, fuffa: 2 },
  postsSeen: 10,
  spentUsd: 0.875,
  topics: [summary(1), summary(2, 'fuffa')],
};

describe('social_recap costPerPostUsd', () => {
  it('(a) accepts and returns the cost per post matching spend / posts', () => {
    const r = SocialRecapOutputSchema.safeParse({ ...recap, costPerPostUsd: 0.0875 });
    expect(r.success).toBe(true);
    expect(r.success && r.data.costPerPostUsd).toBe(0.0875);
  });

  it('(b) a recap without costPerPostUsd stays valid', () => {
    expect(SocialRecapOutputSchema.safeParse(recap).success).toBe(true);
  });

  it('(c) rejects a cost per post that does not match, with the field path', () => {
    const r = SocialRecapOutputSchema.safeParse({ ...recap, costPerPostUsd: 0.09 });
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues.some(i => i.path.join('.') === 'costPerPostUsd')).toBe(true);
  });

  it('(d) with no post seen the field cannot be present', () => {
    const zero = { ...recap, postsSeen: 0, spentUsd: 0 };
    expect(SocialRecapOutputSchema.safeParse({ ...zero, costPerPostUsd: 0 }).success).toBe(false);
    expect(SocialRecapOutputSchema.safeParse(zero).success).toBe(true);
  });

  it('(e) rejects a negative or infinite cost per post', () => {
    for (const costPerPostUsd of [-0.0875, Infinity]) {
      expect(SocialRecapOutputSchema.safeParse({ ...recap, costPerPostUsd }).success).toBe(false);
    }
  });
});
