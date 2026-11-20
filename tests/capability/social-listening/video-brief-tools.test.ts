import { describe, it, expect } from 'vitest';
import {
  SOCIAL_VIDEO_CAPABILITY,
  SOCIAL_VIDEO_TOOLS,
  SocialTopicBriefOutputSchema,
  SocialTopicSchema,
  socialTopicAfterBrief,
  socialTopicBriefOutputFromVideo,
} from '../../../src/capability/social-listening/index';

const response = {
  projectId: 'vp-1',
  state: 'created',
  identity: { tenantId: 't1', ownerId: 'o1', agentId: 'a1' },
  presetId: 'singola',
  mode: 'approval',
  budgetUsd: 5,
};

const topic = SocialTopicSchema.parse({
  identity: response.identity,
  topicId: 'cluster-1',
  verticalId: 'ai',
  day: '2026-11-03',
  title: 'Skill di Claude Code',
  category: 'coding',
  summary: 'Le skill di Claude Code.',
  verdict: 'da_provare',
  facts: [{ text: 'Si installano da una cartella.', sourceUrls: ['https://example.com/post/1'] }],
  sources: [{ url: 'https://example.com/post/1', title: 'Post', opened: true }],
  heat: 7.6,
  postIds: ['p1'],
  creators: ['alassafi.ai'],
  cost: { usd: 0, track: 'mac', uncertain: false },
  computedAt: '2026-11-03T14:31:00+00:00',
});

describe('social video tools', () => {
  it('(a) tool names and capability', () => {
    expect(SOCIAL_VIDEO_TOOLS).toEqual({ brief: 'video_brief_create', presets: 'video_presets_list' });
    expect(SOCIAL_VIDEO_CAPABILITY).toBe('video');
  });

  it('(b) valid response gives a valid output with the social ref', () => {
    const r = socialTopicBriefOutputFromVideo('cluster-1', response);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(SocialTopicBriefOutputSchema.safeParse(r.output).success).toBe(true);
    expect(r.output.externalRef).toBe('social:cluster-1');
  });

  it('(c) output carries only topicId, externalRef, projectId, state', () => {
    const r = socialTopicBriefOutputFromVideo('cluster-1', response);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(Object.keys(r.output).sort()).toEqual(['externalRef', 'projectId', 'state', 'topicId']);
  });

  it('(d) output is accepted by socialTopicAfterBrief', () => {
    const r = socialTopicBriefOutputFromVideo('cluster-1', response);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const after = socialTopicAfterBrief(topic, r.output);
    expect(after.ok).toBe(true);
    if (after.ok) expect(after.topic.videoProjectId).toBe('vp-1');
  });

  const { projectId: _p, ...noProject } = response;
  const badResponses: unknown[] = [
    noProject,
    { ...response, state: 'x' },
    { ...response, extra: 1 },
    null,
    undefined,
    'testo',
  ];
  const badTopicIds: unknown[] = ['', 42, undefined, 'x'.repeat(101)];

  it('(e) invalid response gives invalid_output', () => {
    for (const bad of badResponses) {
      expect(socialTopicBriefOutputFromVideo('cluster-1', bad)).toEqual({ ok: false, error: 'invalid_output' });
    }
  });

  it('(f) invalid topicId gives invalid_output', () => {
    for (const bad of badTopicIds) {
      expect(socialTopicBriefOutputFromVideo(bad, response)).toEqual({ ok: false, error: 'invalid_output' });
    }
  });

  it('(g) never throws', () => {
    for (const bad of badResponses) {
      expect(() => socialTopicBriefOutputFromVideo('cluster-1', bad)).not.toThrow();
    }
    for (const bad of badTopicIds) {
      expect(() => socialTopicBriefOutputFromVideo(bad, response)).not.toThrow();
    }
  });
});
