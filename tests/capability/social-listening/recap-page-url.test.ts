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
  spentUsd: 0,
  topics: [summary(1), summary(2, 'fuffa')],
};

describe('social_recap pageUrl', () => {
  it('(a) accepts and returns pageUrl', () => {
    const url = 'https://forge.example/agents/x9/ascolto';
    const r = SocialRecapOutputSchema.safeParse({ ...recap, pageUrl: url });
    expect(r.success).toBe(true);
    expect(r.success && r.data.pageUrl).toBe(url);
  });

  it('(b) a recap without pageUrl stays valid', () => {
    expect(SocialRecapOutputSchema.safeParse(recap).success).toBe(true);
  });

  it('(c) rejects non-web and empty pageUrl', () => {
    for (const pageUrl of ['javascript:alert(1)', 'ftp://x/y', '']) {
      expect(SocialRecapOutputSchema.safeParse({ ...recap, pageUrl }).success).toBe(false);
    }
  });

  it('(d) an unknown field stays rejected', () => {
    expect(SocialRecapOutputSchema.safeParse({ ...recap, link: 'https://forge.example/x' }).success).toBe(false);
  });

  it('(e) pageUrl is in the shape and optional', () => {
    expect(SocialRecapOutputSchema.shape.pageUrl).toBeDefined();
    expect(SocialRecapOutputSchema.shape.pageUrl.safeParse(undefined).success).toBe(true);
  });
});
