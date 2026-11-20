import { describe, it, expect } from 'vitest';
import {
  SOCIAL_TOPIC_WIKI_TOOLS,
  SOCIAL_LISTENING_TOOLS,
  SOCIAL_TOPIC_VIDEO_TOOLS,
  SocialTopicSaveWikiInputSchema,
  SocialTopicSaveWikiOutputSchema,
  socialTopicLabIngestInput,
  type SocialTopicGetOutput,
} from '../../../src/capability/social-listening/index';
import { LabIngestInputSchema } from '../../../src/capability/lab/tools';

const url = 'https://example.com/post/1';
const topic: SocialTopicGetOutput = {
  topicId: 'cluster-1',
  verticalId: 'ai',
  day: '2026-11-03',
  title: 'Skill di Claude Code e Claude',
  category: 'coding',
  summary: 'Le skill di Claude Code per design, scrittura e montaggio.',
  verdict: 'da_provare',
  facts: [
    { text: 'Le skill si installano da una cartella.', sourceUrls: [url] },
    { text: 'Ogni skill ha un file di istruzioni.', sourceUrls: [url, 'https://example.com/doc'] },
  ],
  sources: [{ url, title: 'Post', opened: true }],
  heat: 7.6,
  postIds: ['p1', 'p2'],
  creators: ['alassafi.ai'],
  cost: { usd: 0.12, track: 'server', uncertain: true },
  computedAt: '2026-11-03T14:31:00+00:00',
};

describe('social_topic_save_wiki', () => {
  it('(a) has its own tool name', () => {
    expect(SOCIAL_TOPIC_WIKI_TOOLS.save).toBe('social_topic_save_wiki');
    expect(Object.values(SOCIAL_LISTENING_TOOLS)).not.toContain('social_topic_save_wiki');
    expect(Object.values(SOCIAL_TOPIC_VIDEO_TOOLS)).not.toContain('social_topic_save_wiki');
  });

  it('(b) needs the explicit yes of the owner and no identity', () => {
    const ok = { topicId: 'cluster-1', ownerConfirmed: true };
    expect(SocialTopicSaveWikiInputSchema.safeParse(ok).success).toBe(true);
    expect(SocialTopicSaveWikiInputSchema.safeParse({ topicId: 'cluster-1' }).success).toBe(false);
    expect(SocialTopicSaveWikiInputSchema.safeParse({ ...ok, ownerConfirmed: false }).success).toBe(false);
    expect(SocialTopicSaveWikiInputSchema.safeParse({ ...ok, ownerConfirmed: 'true' }).success).toBe(false);
    expect(SocialTopicSaveWikiInputSchema.safeParse({ ...ok, agentId: 'x9' }).success).toBe(false);
  });

  it('(c) with an extended research passes the research id', () => {
    const r = socialTopicLabIngestInput({ ...topic, extendedResearchId: 'r-1' }, 'x9');
    expect(r).toEqual({ ok: true, input: { researchId: 'r-1' } });
  });

  it('(d) without it builds a result valid for cap-lab with every fact', () => {
    const r = socialTopicLabIngestInput(topic, 'x9');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(LabIngestInputSchema.safeParse(r.input).success).toBe(true);
    if (!('result' in r.input)) throw new Error('expected a result');
    const { result } = r.input;
    expect(result.researchId).toBe('social:cluster-1');
    expect(result.agentId).toBe('x9');
    expect(result.state).toBe('completed');
    expect(result.question).toBe(topic.title);
    expect(result.findings).toHaveLength(topic.facts.length);
    result.findings.forEach((f, i) => {
      expect(f.sourceUrls).toEqual(topic.facts[i]!.sourceUrls);
      expect(f.origin).toBe('web');
    });
    expect(result.newQuestions).toEqual([]);
    expect(result.sources).toEqual(topic.sources);
    expect(result.cost).toEqual({ usd: 0.12, inputTokens: 0, outputTokens: 0, webCalls: 0, uncertain: true });
  });

  it('(e) a topic with no facts and no research has nothing to save', () => {
    const r = socialTopicLabIngestInput({ ...topic, verdict: 'fuffa', facts: [] }, 'x9');
    expect(r).toEqual({ ok: false, error: 'nothing_to_save' });
  });

  it('(f) output only says queued', () => {
    const out = { topicId: 'cluster-1', ingestId: '2b1c1f0e-4f6b-4a8e-9a53-7a7d1f0a9c11', state: 'queued' };
    expect(SocialTopicSaveWikiOutputSchema.safeParse(out).success).toBe(true);
    expect(SocialTopicSaveWikiOutputSchema.safeParse({ ...out, state: 'running' }).success).toBe(false);
  });
});
