import { describe, expect, it } from 'vitest';
import {
  SOCIAL_FACT_MEMORY_MAX_AGE_DAYS,
  SOCIAL_TITLE_LINKING_WORDS,
  SocialJobInputSchema,
  SocialVerifiedFactSchema,
  shortenSocialTopicTitle,
  socialCostPerPost,
  socialFactFresh,
  socialFactKey,
  socialGroupResultIssues,
  socialTopicTitleIssue,
} from '../../../src/capability/social-listening/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const fact = { text: 'The tool exports code.', sourceUrls: ['https://example.com/a'] };
const groupInput = { kind: 'group', verticalId: 'ai', postIds: ['p1', 'p2', 'p3'], categories: ['coding', 'video'] };
const topic = (over: Record<string, unknown> = {}) => ({
  title: 'Emergent crea app da prompt', category: 'coding', summary: 'Sintesi.',
  postIds: ['p1'], creators: ['creator.one'], heat: 5, ...over,
});
const result = (topics: unknown[]) => ({ kind: 'group', topics });

describe('socialTopicTitleIssue (a)', () => {
  it('flags the four problems and accepts informative titles', () => {
    expect(socialTopicTitleIssue('Come Emergent')).toBe('too_few_words');
    expect(socialTopicTitleIssue('Pulizia Android TV da')).toBe('dangling_word');
    expect(socialTopicTitleIssue('Weight-space programming (MIT')).toBe('open_bracket');
    expect(socialTopicTitleIssue('a'.repeat(32))).toBe('too_long');
    expect(socialTopicTitleIssue('Emergent crea app da prompt')).toBeNull();
    expect(socialTopicTitleIssue('Pulizia Android TV')).toBeNull();
  });
});

describe('socialGroupResultIssues (b)', () => {
  it('accepts a clean result', () => {
    expect(socialGroupResultIssues(groupInput, result([topic(), topic({ postIds: ['p2'], category: 'video' })]))).toEqual([]);
  });
  it('reports each problem with the right index', () => {
    expect(socialGroupResultIssues(groupInput, result([topic(), topic({ postIds: ['p2'], category: 'altro' })])))
      .toEqual([{ index: 1, issue: 'category_not_in_job' }]);
    expect(socialGroupResultIssues(groupInput, result([topic({ postIds: ['p9'] })])))
      .toEqual([{ index: 0, issue: 'post_not_in_job' }]);
    expect(socialGroupResultIssues(groupInput, result([topic(), topic({ postIds: ['p1', 'p2'] })])))
      .toEqual([{ index: 1, issue: 'post_in_two_topics' }]);
    expect(socialGroupResultIssues(groupInput, result([topic(), topic({ title: 'Come Emergent', postIds: ['p2'] })])))
      .toEqual([{ index: 1, issue: 'title:too_few_words' }]);
  });
  it('never throws on malformed input', () => {
    expect(socialGroupResultIssues(null, undefined)).toEqual([{ index: -1, issue: 'invalid_input' }]);
    expect(socialGroupResultIssues({ kind: 'filter', postId: 'p1' }, result([topic()]))).toEqual([{ index: -1, issue: 'invalid_input' }]);
  });
});

describe('fact memory (c, d, e, f)', () => {
  it('(c) normalises the key', () => {
    expect(socialFactKey('  Claude Code è GRATIS! ')).toBe(socialFactKey('claude code e gratis'));
    expect(socialFactKey('  Claude Code è GRATIS! ')).toBe('claude code e gratis');
  });
  it('(d) freshness is inclusive at the limit and never future', () => {
    const now = '2026-11-18T10:00:00Z';
    expect(SOCIAL_FACT_MEMORY_MAX_AGE_DAYS).toBe(30);
    expect(socialFactFresh({ verifiedAt: '2026-10-19T10:00:00Z' }, now)).toBe(true);
    expect(socialFactFresh({ verifiedAt: '2026-10-18T10:00:00Z' }, now)).toBe(false);
    expect(socialFactFresh({ verifiedAt: '2026-11-18T10:00:01Z' }, now)).toBe(false);
    expect(socialFactFresh({ verifiedAt: 'ieri' }, now)).toBe(false);
  });
  it('(e) cost per post', () => {
    expect(socialCostPerPost({ spentUsd: 0.3, postsSeen: 0 })).toBeNull();
    expect(socialCostPerPost({ spentUsd: 0.3, postsSeen: 4 })).toBe(0.075);
    expect(socialCostPerPost({ spentUsd: 2, postsSeen: 3 })).toBe(0.666667);
  });
  it('(f) verify input stays valid without knownFacts, caps at 20, row needs full identity', () => {
    const plain = { kind: 'verify', topicId: 't1' };
    expect(SocialJobInputSchema.parse(plain)).toEqual(plain);
    expect(SocialJobInputSchema.safeParse({ ...plain, knownFacts: [fact] }).success).toBe(true);
    expect(SocialJobInputSchema.safeParse({ ...plain, knownFacts: Array(21).fill(fact) }).success).toBe(false);
    const row = {
      identity, verticalId: 'ai', category: 'coding', factKey: socialFactKey(fact.text),
      fact, topicId: 't1', verifiedAt: '2026-11-18T10:00:00Z',
    };
    expect(SocialVerifiedFactSchema.safeParse(row).success).toBe(true);
    expect(SocialVerifiedFactSchema.safeParse({ ...row, identity: { tenantId: 'tenant-1', agentId: 'x9' } }).success).toBe(false);
  });
});

describe('same linking words as the 3632 title shortener (g)', () => {
  it.each([...SOCIAL_TITLE_LINKING_WORDS])('%s', w => {
    expect(shortenSocialTopicTitle(`Alfa beta gamma delta ${w} omegaomegaomega`)).toBe('Alfa beta gamma delta');
    expect(socialTopicTitleIssue(`Alfa beta ${w}`)).toBe('dangling_word');
  });
});
