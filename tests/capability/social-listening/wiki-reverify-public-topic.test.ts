import { describe, expect, it } from 'vitest';
import { socialWikiReverifyDue } from '../../../src/capability/social-listening/save-wiki.js';
import { SocialTopicGetOutputSchema } from '../../../src/capability/social-listening/tools.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const base = {
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
const SAVED_AT = '2026-11-19T08:00:00Z';
const publicSaved = SocialTopicGetOutputSchema.parse({
  ...base,
  wikiIngestId: '2b1c1f0e-4f6b-4a8e-9a53-7a7d1f0a9c11',
  wikiSavedAt: SAVED_AT,
});
const publicUnsaved = SocialTopicGetOutputSchema.parse(base);

const AT_14 = '2026-12-03T08:00:00Z';
const AT_89 = '2027-02-16T08:00:00Z';
const AT_89_23H = '2027-02-17T07:00:00Z';
const AT_90 = '2027-02-17T08:00:00Z';

describe('wiki reverify on the public topic shape (no identity)', () => {
  it('builds the fixture without identity', () => {
    expect('identity' in publicSaved).toBe(false);
    expect('identity' in publicUnsaved).toBe(false);
  });

  it('(a) public shape gives fresh/due with whole days', () => {
    expect(socialWikiReverifyDue(publicSaved, AT_14)).toEqual({ state: 'fresh', daysOld: 14 });
    expect(socialWikiReverifyDue(publicSaved, AT_89)).toEqual({ state: 'fresh', daysOld: 89 });
    expect(socialWikiReverifyDue(publicSaved, AT_89_23H)).toEqual({ state: 'fresh', daysOld: 89 });
    expect(socialWikiReverifyDue(publicSaved, AT_90)).toEqual({ state: 'due', daysOld: 90 });
  });

  it('(b) public shape without wiki fields is not_saved', () => {
    expect(socialWikiReverifyDue(publicUnsaved, AT_14)).toEqual({ state: 'not_saved' });
  });

  it('(c) broken dates are invalid_input', () => {
    for (const wikiSavedAt of ['not-a-date', '2026-02-30T08:00:00Z', 123, null]) {
      expect(socialWikiReverifyDue({ ...publicSaved, wikiSavedAt }, AT_90)).toEqual({ state: 'invalid_input' });
    }
    expect(socialWikiReverifyDue(publicSaved, '2026-11-19T07:59:59Z')).toEqual({ state: 'invalid_input' });
    for (const nowIso of ['not-a-date', '2026-02-30T08:00:00Z', '2027-02-17']) {
      expect(socialWikiReverifyDue(publicSaved, nowIso)).toEqual({ state: 'invalid_input' });
      expect(socialWikiReverifyDue(publicUnsaved, nowIso)).toEqual({ state: 'invalid_input' });
    }
  });

  it('(d) non-objects are invalid_input and unread fields are ignored', () => {
    for (const input of [null, undefined, [], 'x']) {
      expect(socialWikiReverifyDue(input, AT_90)).toEqual({ state: 'invalid_input' });
    }
    const throwingTitle = Object.defineProperty({ ...publicSaved }, 'title', {
      get() { throw new Error('unreadable title'); },
    });
    expect(socialWikiReverifyDue(throwingTitle, AT_14)).toEqual({ state: 'fresh', daysOld: 14 });
    const throwingSavedAt = Object.defineProperty({ ...publicSaved }, 'wikiSavedAt', {
      get() { throw new Error('unreadable wikiSavedAt'); },
    });
    expect(socialWikiReverifyDue(throwingSavedAt, AT_90)).toEqual({ state: 'invalid_input' });
  });

  it('(e) the same topic with identity gives the same result', () => {
    for (const at of [AT_14, AT_89, AT_90]) {
      expect(socialWikiReverifyDue({ ...publicSaved, identity }, at)).toEqual(socialWikiReverifyDue(publicSaved, at));
    }
    expect(socialWikiReverifyDue({ ...publicSaved, identity }, AT_90)).toEqual({ state: 'due', daysOld: 90 });
  });

  it('(f) a minimal object with only wikiSavedAt works', () => {
    expect(socialWikiReverifyDue({ wikiSavedAt: SAVED_AT }, AT_90)).toEqual({ state: 'due', daysOld: 90 });
  });
});
