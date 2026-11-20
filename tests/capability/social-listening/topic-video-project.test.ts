import { describe, expect, it } from 'vitest';
import { SocialTopicSchema } from '../../../src/capability/social-listening/topic.js';
import { socialTopicAfterBrief } from '../../../src/capability/social-listening/video-brief.js';

const topic = SocialTopicSchema.parse({
  identity: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' },
  topicId: 't-1',
  verticalId: 'ai',
  day: '2026-10-27',
  title: 'Skill di Claude Code e Claude',
  category: 'coding',
  summary: 'Le skill di Claude Code per design, scrittura e montaggio.',
  verdict: 'da_provare',
  facts: [{ text: 'Le skill si installano da una cartella.', sourceUrls: ['https://example.com/post/1'] }],
  sources: [{ url: 'https://example.com/post/1', title: 'Post', opened: true }],
  heat: 7.6,
  postIds: ['p1'],
  creators: ['alassafi.ai'],
  cost: { usd: 0, track: 'mac', uncertain: false },
  computedAt: '2026-10-27T14:31:00+00:00',
});
const output = { topicId: 't-1', externalRef: 'social:t-1', projectId: 'vp-1', state: 'created' };

describe('topic video project', () => {
  it('(a) writes the project id and the schema accepts it', () => {
    const r = socialTopicAfterBrief(topic, output);
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error('expected ok');
    expect(r.topic.videoProjectId).toBe('vp-1');
    expect(SocialTopicSchema.safeParse(r.topic).success).toBe(true);
  });

  it('(b) a topic without the field stays valid; an invalid id is rejected', () => {
    expect(SocialTopicSchema.safeParse(topic).success).toBe(true);
    expect(SocialTopicSchema.safeParse({ ...topic, videoProjectId: '' }).success).toBe(false);
  });

  it('(c) an answer about another topic is refused', () => {
    expect(socialTopicAfterBrief(topic, { ...output, topicId: 't-2' })).toEqual({ ok: false, error: 'topic_mismatch' });
  });

  it('(d) a foreign reference or a malformed answer is refused', () => {
    expect(socialTopicAfterBrief(topic, { ...output, externalRef: 'social:t-2' })).toEqual({ ok: false, error: 'ref_mismatch' });
    expect(socialTopicAfterBrief(topic, { ...output, extra: 1 })).toEqual({ ok: false, error: 'invalid_output' });
    expect(socialTopicAfterBrief(topic, null)).toEqual({ ok: false, error: 'invalid_output' });
  });

  it('(e) a second brief replaces the project id', () => {
    const first = socialTopicAfterBrief(topic, output);
    if (!first.ok) throw new Error('expected ok');
    const second = socialTopicAfterBrief(first.topic, { ...output, projectId: 'vp-2' });
    expect(second.ok && second.topic.videoProjectId).toBe('vp-2');
  });
});
