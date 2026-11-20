import { describe, expect, it } from 'vitest';
import { SocialTopicSchema } from '../../../src/capability/social-listening/topic.js';
import {
  SOCIAL_WIKI_REVERIFY_DAYS,
  socialWikiReverifyDue,
} from '../../../src/capability/social-listening/save-wiki.js';

// Same persisted topic shape as the MVP, before wiki metadata was introduced.
const topic = {
  identity: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' },
  topicId: 'cluster-1',
  verticalId: 'ai',
  day: '2026-10-27',
  title: 'Skill di Claude Code e Claude',
  category: 'coding',
  summary: 'Le skill di Claude Code per design, scrittura e montaggio.',
  verdict: 'da_provare',
  facts: [{ text: 'Le skill si installano da una cartella.', sourceUrls: ['https://example.com/post/1'] }],
  sources: [{ url: 'https://example.com/post/1', title: 'Post', opened: true }],
  heat: 7.6,
  postIds: ['p1', 'p2', 'p3'],
  creators: ['alassafi.ai', 'davi.d_roberts', 'third_one'],
  cost: { usd: 0, track: 'mac', uncertain: false },
  computedAt: '2026-10-27T14:31:00+00:00',
};
const saved = {
  ...topic,
  wikiIngestId: '2b1c1f0e-4f6b-4a8e-9a53-7a7d1f0a9c11',
  wikiSavedAt: '2026-11-19T08:00:00Z',
};

describe('wiki reverify', () => {
  it('(a) preserves the accepted wiki ingest id and saved timestamp', () => {
    expect(SocialTopicSchema.parse(saved)).toEqual(saved);
  });

  it('(b) requires both wiki fields with the missing field path', () => {
    for (const missing of ['wikiIngestId', 'wikiSavedAt'] as const) {
      const { [missing]: _omitted, ...partial } = saved;
      const result = SocialTopicSchema.safeParse(partial);
      expect(result.success).toBe(false);
      if (result.success) throw new Error('expected missing wiki metadata to be rejected');
      expect(result.error.issues.map(issue => issue.path)).toContainEqual([missing]);
    }
  });

  it('(c) accepts persisted MVP topics without wiki metadata', () => {
    expect(SocialTopicSchema.parse(topic)).toEqual(topic);
  });

  it('(d) uses whole elapsed days and marks exactly 90 days as due', () => {
    expect(SOCIAL_WIKI_REVERIFY_DAYS).toBe(90);
    expect(socialWikiReverifyDue(topic, saved.wikiSavedAt)).toEqual({ state: 'not_saved' });
    expect(socialWikiReverifyDue(saved, '2026-11-19T08:00:00Z')).toEqual({ state: 'fresh', daysOld: 0 });
    expect(socialWikiReverifyDue(saved, '2027-02-17T07:00:00Z')).toEqual({ state: 'fresh', daysOld: 89 });
    expect(socialWikiReverifyDue(saved, '2027-02-17T08:00:00Z')).toEqual({ state: 'due', daysOld: 90 });
    expect(socialWikiReverifyDue(saved, '2027-06-07T08:00:00Z')).toEqual({ state: 'due', daysOld: 200 });
    expect(socialWikiReverifyDue(saved, '2027-02-17T09:00:00+01:00')).toEqual({ state: 'due', daysOld: 90 });
  });

  it('(e) rejects future timestamps, invalid dates and malformed topics without throwing', () => {
    const invalidTopics: unknown[] = [
      null,
      undefined,
      [],
      { ...saved, wikiSavedAt: 'not-a-date' },
      { ...saved, wikiSavedAt: '2026-02-30T08:00:00Z' },
    ];
    for (const input of invalidTopics) {
      expect(socialWikiReverifyDue(input, '2027-02-17T08:00:00Z')).toEqual({ state: 'invalid_input' });
    }
    expect(socialWikiReverifyDue(saved, '2026-11-19T07:59:59Z')).toEqual({ state: 'invalid_input' });
    for (const nowIso of ['not-a-date', '2026-02-30T08:00:00Z', '2027-02-17']) {
      expect(socialWikiReverifyDue(saved, nowIso)).toEqual({ state: 'invalid_input' });
      expect(socialWikiReverifyDue(topic, nowIso)).toEqual({ state: 'invalid_input' });
    }
  });

  it('(e) catches throwing accessors for either wiki field', () => {
    for (const field of ['wikiSavedAt'] as const) {
      const input =Object.defineProperty({ ...saved }, field, {
        get() { throw new Error('unreadable wiki metadata'); },
      });
      expect(socialWikiReverifyDue(input, '2027-02-17T08:00:00Z')).toEqual({ state: 'invalid_input' });
    }
  });
});
