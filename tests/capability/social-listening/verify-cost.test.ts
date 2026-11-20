import { describe, expect, it } from 'vitest';
import {
  SocialJobResultSchema,
  socialVerifyTopicCost,
} from '../../../src/capability/social-listening/index.js';

const verify = {
  kind: 'verify',
  topicId: 't1',
  verdict: 'da_provare',
  summary: 'The demo shows code generation.',
  facts: [{ text: 'The demo generates code.', sourceUrls: ['https://example.com/demo'] }],
  sources: [{ url: 'https://example.com/demo', opened: true }],
};

describe('verification cost', () => {
  it('(a) preserves costUsd and accepts existing results without it', () => {
    expect(SocialJobResultSchema.parse({ ...verify, costUsd: 0.042 }))
      .toEqual({ ...verify, costUsd: 0.042 });
    expect(SocialJobResultSchema.parse(verify)).toEqual(verify);
    expect(SocialJobResultSchema.parse({ ...verify, costUsd: 0 }))
      .toEqual({ ...verify, costUsd: 0 });
  });

  it.each([-0.001, Infinity, '0.042'])('(b) rejects invalid costUsd %s', costUsd => {
    expect(SocialJobResultSchema.safeParse({ ...verify, costUsd }).success).toBe(false);
  });

  it('(c) derives the exact topic cost for each track and cost availability', () => {
    const withCost = SocialJobResultSchema.parse({ ...verify, costUsd: 0.042 });
    const withoutCost = SocialJobResultSchema.parse(verify);
    expect(socialVerifyTopicCost(withCost, 'mac'))
      .toEqual({ usd: 0, track: 'mac', uncertain: false });
    expect(socialVerifyTopicCost(withoutCost, 'mac'))
      .toEqual({ usd: 0, track: 'mac', uncertain: false });
    expect(socialVerifyTopicCost(withCost, 'server'))
      .toEqual({ usd: 0.042, track: 'server', uncertain: false });
    expect(socialVerifyTopicCost(withoutCost, 'server'))
      .toEqual({ usd: 0, track: 'server', uncertain: true });
    expect(socialVerifyTopicCost(SocialJobResultSchema.parse({ ...verify, costUsd: 0 }), 'server'))
      .toEqual({ usd: 0, track: 'server', uncertain: false });
  });

  it('(d) throws not_a_verify_result for a filter result', () => {
    const result = SocialJobResultSchema.parse({ kind: 'filter', postId: 'p1', keep: true });
    expect(() => socialVerifyTopicCost(result, 'server'))
      .toThrow(new TypeError('not_a_verify_result'));
  });

  it('(e) rejects executor-supplied identity even with a valid cost', () => {
    expect(SocialJobResultSchema.safeParse({ ...verify, costUsd: 0.042, agentId: 'x' }).success)
      .toBe(false);
    expect(SocialJobResultSchema.safeParse({ ...verify, agentId: 'x' }).success).toBe(false);
  });
});
