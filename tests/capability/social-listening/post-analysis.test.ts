import { describe, expect, it } from 'vitest';
import {
  SOCIAL_VERDICTS,
  SocialFactSchema,
  SocialPostAnalysisSchema,
  SocialPostSchema,
  SocialPostToolSchema,
  SocialTopicFactSchema,
  SocialTopicSchema,
  SocialVerdictSchema,
  type SocialFact,
  type SocialPostAnalysis,
  type SocialPostTool,
  type SocialVerdict,
} from '../../../src/capability/social-listening/index';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const timestamp = '2026-11-17T10:30:00+01:00';
const url = 'https://example.com/post/1';
const post = {
  identity,
  postId: 'p1',
  provider: 'instagram',
  handle: 'alassafi.ai',
  link: url,
  publishedAt: timestamp,
  kind: 'video',
  caption: '',
  collectedAt: timestamp,
};
const fact: SocialFact = { text: 'The tool supports local processing.', sourceUrls: [url] };
const tool: SocialPostTool = {
  name: 'Research tool',
  link: 'https://example.com/tool',
  whatItDoes: 'Processes the sources cited by the post.',
};
const verdict: SocialVerdict = 'da_provare';
const analysis: SocialPostAnalysis = {
  verdict,
  reason: 'r'.repeat(861),
  relevance: 'Useful for reviewing the daily sources.',
  facts: [fact, { text: 'The documentation describes the workflow.', sourceUrls: ['http://example.com/docs'] }],
  tools: [tool, { name: 'Local tool', whatItDoes: 'Checks local sources.' }],
  analyzedAt: timestamp,
};

describe('s3617 social post analysis', () => {
  it.each([
    ['without a transcript', post],
    ['with a transcript', { ...post, transcript: 'The original transcript.' }],
  ])('accepts a saved post %s without adding analysis', (_name, savedPost) => {
    const parsed = SocialPostSchema.parse(savedPost);
    expect(parsed).toEqual(savedPost);
    expect(parsed).not.toHaveProperty('analysis');
  });

  it('s3617 accepts a full post analysis with a tool without a link', () => {
    const fullPost = { ...post, analysis };
    expect(SocialPostSchema.safeParse(fullPost).success).toBe(true);
    expect(SocialPostSchema.parse(fullPost)).toEqual(fullPost);
    expect(SocialPostAnalysisSchema.parse(analysis)).toEqual(analysis);
    expect(SocialPostToolSchema.parse(analysis.tools[1])).not.toHaveProperty('link');
  });

  it.each(SOCIAL_VERDICTS)('accepts verdict %s with no post facts or tools', value => {
    const { relevance: _relevance, ...withoutRelevance } = analysis;
    const minimal = { ...withoutRelevance, verdict: value, facts: [], tools: [] };
    expect(SocialPostSchema.parse({ ...post, analysis: minimal }).analysis).toEqual(minimal);
  });

  it('accepts the maximum text and array lengths', () => {
    const maximumTool = { name: 'n'.repeat(200), whatItDoes: 'w'.repeat(500), link: tool.link };
    const maximum = {
      ...analysis,
      reason: 'r'.repeat(2000),
      relevance: 'r'.repeat(1000),
      facts: Array.from({ length: 20 }, () => fact),
      tools: Array.from({ length: 20 }, () => maximumTool),
    };
    expect(SocialPostSchema.parse({ ...post, analysis: maximum }).analysis).toEqual(maximum);
  });

  it('accepts the minimum text lengths and a UTC timestamp', () => {
    const minimum = {
      ...analysis,
      reason: 'r',
      relevance: 'r',
      tools: [{ name: 'n', whatItDoes: 'w' }],
      analyzedAt: '2026-11-17T09:30:00Z',
    };
    expect(SocialPostSchema.parse({ ...post, analysis: minimum }).analysis).toEqual(minimum);
  });

  it.each([
    ['unknown verdict', { verdict: 'ottimo' }, 'verdict'],
    ['missing verdict', { verdict: undefined }, 'verdict'],
    ['empty reason', { reason: '' }, 'reason'],
    ['reason over 2000 characters', { reason: 'r'.repeat(2001) }, 'reason'],
    ['missing reason', { reason: undefined }, 'reason'],
    ['empty relevance', { relevance: '' }, 'relevance'],
    ['relevance over 1000 characters', { relevance: 'r'.repeat(1001) }, 'relevance'],
    ['fact without sourceUrls', { facts: [{ text: fact.text }] }, 'facts'],
    ['fact with no sources', { facts: [{ ...fact, sourceUrls: [] }] }, 'facts'],
    ['fact with a file URL', { facts: [{ ...fact, sourceUrls: ['file:///x'] }] }, 'facts'],
    ['fact with origin', { facts: [{ ...fact, origin: 'web' }] }, 'facts'],
    ['21 facts', { facts: Array.from({ length: 21 }, () => fact) }, 'facts'],
    ['missing facts', { facts: undefined }, 'facts'],
    ['21 tools', { tools: Array.from({ length: 21 }, () => tool) }, 'tools'],
    ['missing tools', { tools: undefined }, 'tools'],
    ['empty tool link', { tools: [{ ...tool, link: '' }] }, 'tools'],
    ['unsafe tool link', { tools: [{ ...tool, link: 'file:///x' }] }, 'tools'],
    ['empty tool name', { tools: [{ ...tool, name: '' }] }, 'tools'],
    ['tool name over 200 characters', { tools: [{ ...tool, name: 'n'.repeat(201) }] }, 'tools'],
    ['missing tool name', { tools: [{ whatItDoes: tool.whatItDoes }] }, 'tools'],
    ['empty tool description', { tools: [{ ...tool, whatItDoes: '' }] }, 'tools'],
    ['tool description over 500 characters', { tools: [{ ...tool, whatItDoes: 'w'.repeat(501) }] }, 'tools'],
    ['missing tool description', { tools: [{ name: tool.name }] }, 'tools'],
    ['extra tool field', { tools: [{ ...tool, extra: true }] }, 'tools'],
    ['missing timestamp', { analyzedAt: undefined }, 'analyzedAt'],
    ['timestamp without an offset', { analyzedAt: '2026-11-17T10:30:00' }, 'analyzedAt'],
    ['invalid timestamp', { analyzedAt: '2026-02-30T10:30:00+01:00' }, 'analyzedAt'],
  ] as const)('rejects %s', (_name, patch, field) => {
    const result = SocialPostSchema.safeParse({ ...post, analysis: { ...analysis, ...patch } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(issue => issue.path)).toContainEqual(expect.arrayContaining(['analysis', field]));
    }
  });

  it('rejects an extra field in analysis', () => {
    const result = SocialPostSchema.safeParse({ ...post, analysis: { ...analysis, extra: true } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ code: 'unrecognized_keys', path: ['analysis'] }));
    }
  });

  it('preserves the verdict exports and shares the topic fact schema object', () => {
    expect(SOCIAL_VERDICTS).toEqual(['funziona', 'da_provare', 'non_funziona', 'fuffa']);
    expect(SocialVerdictSchema.options).toEqual(SOCIAL_VERDICTS);
    expect(SocialVerdictSchema.parse(verdict)).toBe(verdict);
    expect(SocialVerdictSchema.safeParse('ottimo').success).toBe(false);
    expect(SocialTopicFactSchema).toBe(SocialFactSchema);
    expect(SocialFactSchema.parse(fact)).toEqual(fact);
  });

  it.each(['funziona', 'da_provare'])('still requires facts for a %s topic', value => {
    const topic = {
      identity,
      topicId: 'cluster-1',
      verticalId: 'ai',
      day: '2026-11-17',
      title: 'Local research tools',
      category: 'coding',
      summary: 'A workflow for reviewing local sources.',
      verdict: value,
      facts: [fact],
      sources: [{ url, opened: true }],
      heat: 7,
      postIds: [post.postId],
      creators: [post.handle],
      cost: { usd: 0, track: 'mac', uncertain: false },
      computedAt: timestamp,
    };
    expect(SocialTopicSchema.safeParse(topic).success).toBe(true);
    const result = SocialTopicSchema.safeParse({ ...topic, facts: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ code: 'custom', path: ['facts'] }));
    }
  });
});
