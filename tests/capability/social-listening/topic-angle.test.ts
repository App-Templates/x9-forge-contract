import { describe, expect, it } from 'vitest';
import { SocialTopicGetOutputSchema } from '../../../src/capability/social-listening/tools';
import { SocialJobInputSchema, SocialJobResultSchema } from '../../../src/capability/social-listening/job-io';
import { socialImportTopic } from '../../../src/capability/social-listening/import';
import { SOCIAL_TOPIC_ANGLE_MAX, SocialTopicSchema } from '../../../src/capability/social-listening/topic';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const links = [1, 2, 3].map(id => `https://example.com/post/${id}`);
const ANGLE = 'Mostra il prima e il dopo di una skill in 20 secondi';

// Shape of a topic saved by the 03/11 import: heat 7.6, 3 creators, no angle.
const baseTopic = {
  identity,
  topicId: 'cluster-1',
  verticalId: 'ai',
  day: '2026-11-03',
  title: 'Skill di Claude Code',
  category: 'coding',
  summary: 'Le skill raccolgono procedure riutilizzabili.',
  verdict: 'da_provare',
  facts: [{ text: 'Si installano localmente.', sourceUrls: links }],
  sources: links.map(url => ({ url, opened: true })),
  heat: 7.6,
  postIds: ['p1', 'p2', 'p3'],
  creators: ['creator.one', 'creator.two', 'creator.three'],
  cost: { usd: 0, track: 'mac', uncertain: true },
  computedAt: '2026-11-03T20:29:03.000Z',
};
const { identity: _id, ...publicTopic } = baseTopic;

const cluster = (angolo_story: string) => ({
  schema: 'ig-ascolto-cluster-v1',
  argomento: 'Skill di Claude Code e Claude: design, scrittura, montaggio',
  post_ids: ['p1', 'p2', 'p3'],
  sintesi: 'Le skill raccolgono procedure riutilizzabili.',
  fatti: ['Si installano localmente.'],
  link: links,
  verdetto: 'da provare',
  angolo_story,
  verticale: 'ai',
  destinazioni: ['story'],
  creator: ['creator.one', 'creator.two', 'creator.three'],
  n_post: 3,
  ultimo_post: '2026-11-03T20:00:00+0100',
  calcolato_il: '2026-11-03T21:29:03+01:00',
  hype: 7.6,
  post: links.map((link, i) => ({ post_id: `p${i + 1}`, profilo: `creator.${['one', 'two', 'three'][i]}`, link })),
});
const ctx = {
  identity,
  topicId: 'cluster-1',
  vertical: { id: 'ai', categories: [{ slug: 'coding', label: 'Coding' }] },
  category: 'coding',
};

const groupItem = {
  title: 'Skill di Claude Code',
  category: 'coding',
  summary: 'Sintesi.',
  postIds: ['p1'],
  creators: ['creator.one'],
  heat: 7.6,
};

describe('s9817 topic-angle', () => {
  it('(a) accepts an angle on the topic and on the get output', () => {
    const t = SocialTopicSchema.parse({ ...baseTopic, angle: ANGLE });
    expect(t.angle).toBe(ANGLE);
    expect(SocialTopicGetOutputSchema.parse({ ...publicTopic, angle: ANGLE }).angle).toBe(ANGLE);
  });

  it('(b) a topic without angle still passes (03/11 shape)', () => {
    expect(SocialTopicSchema.parse(baseTopic).angle).toBeUndefined();
    expect(SocialTopicGetOutputSchema.safeParse(publicTopic).success).toBe(true);
  });

  it('(c) rejects empty, blank, too long, null and extra keys', () => {
    for (const angle of ['', '   ', 'x'.repeat(SOCIAL_TOPIC_ANGLE_MAX + 1), null]) {
      expect(SocialTopicSchema.safeParse({ ...baseTopic, angle }).success).toBe(false);
    }
    expect(SocialTopicSchema.safeParse({ ...baseTopic, angle: 'x'.repeat(SOCIAL_TOPIC_ANGLE_MAX) }).success).toBe(true);
    expect(SocialTopicSchema.safeParse({ ...baseTopic, angle: ANGLE, extra: 1 }).success).toBe(false);
  });

  it('(d) the group result takes an angle per topic, max 600', () => {
    const ok = SocialJobResultSchema.safeParse({ kind: 'group', topics: [{ ...groupItem, angle: ANGLE }] });
    expect(ok.success).toBe(true);
    expect(SocialJobResultSchema.safeParse({ kind: 'group', topics: [groupItem] }).success).toBe(true);
    const long = SocialJobResultSchema.safeParse({
      kind: 'group', topics: [{ ...groupItem, angle: 'x'.repeat(SOCIAL_TOPIC_ANGLE_MAX + 1) }],
    });
    expect(long.success).toBe(false);
  });

  it('(d) the group input accepts an optional bounded angle', () => {
    const input = { kind: 'group', verticalId: 'ai', postIds: ['p1'], categories: ['coding'] };
    expect(SocialJobInputSchema.parse(input)).toEqual(input);
    expect(SocialJobInputSchema.parse({ ...input, angle: ANGLE })).toEqual({ ...input, angle: ANGLE });
    for (const angle of ['', '   ', 'x'.repeat(SOCIAL_TOPIC_ANGLE_MAX + 1), null]) {
      expect(SocialJobInputSchema.safeParse({ ...input, angle }).success).toBe(false);
    }
    expect(SocialJobInputSchema.safeParse({ ...input, angle: ANGLE, extra: 1 }).success).toBe(false);
  });

  it('(e) the import maps angolo_story to angle', () => {
    const r = socialImportTopic(cluster('  Taglio da story: il prima e il dopo.  '), ctx);
    expect(r.ok && r.topic.angle).toBe('Taglio da story: il prima e il dopo.');
    for (const empty of ['', '   ']) {
      const e = socialImportTopic(cluster(empty), ctx);
      expect(e.ok).toBe(true);
      expect(e.ok && e.topic.angle).toBeUndefined();
      if (e.ok) expect(e.topic).not.toHaveProperty('angle');
    }
    const longText = Array.from({ length: 150 }, () => 'parola').join(' ');
    expect(longText.length).toBeGreaterThan(850);
    const l = socialImportTopic(cluster(longText), ctx);
    expect(l.ok).toBe(true);
    if (l.ok) {
      const angle = l.topic.angle ?? '';
      expect(angle.length).toBeGreaterThan(0);
      expect(angle.length).toBeLessThanOrEqual(SOCIAL_TOPIC_ANGLE_MAX);
      expect(longText.startsWith(angle)).toBe(true);
      expect(longText[angle.length]).toBe(' ');
    }
  });
});
