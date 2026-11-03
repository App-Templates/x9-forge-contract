import { describe, expect, it } from 'vitest';
import { BriefingFeedsSchema, NewsFeedsSchema, NewsFeedsSettingsSchema } from '../../src/capability/configuration/feeds.js';
import { BriefingCategoryWeightsSchema, BriefingSettingsSchema } from '../../src/capability/configuration/briefing.js';

describe('existing feed and briefing settings', () => {
  it('preserves existing briefing feed weight default without inventing product settings', () => {
    expect(BriefingFeedsSchema.parse([{ url: 'https://example.com/rss', category: 'news' }]))
      .toEqual([{ url: 'https://example.com/rss', category: 'news', weight: 1 }]);
    expect(BriefingSettingsSchema.safeParse({}).success).toBe(false);
  });
  it('accepts resolved settings and finite category weights', () => {
    const settings = { greeting: 'Hello', tone: 'terse', maxWords: 100, promptStyle: 'concise',
      feeds: [], categoryWeights: { news: 2 }, structure: ['calendar', 'news'],
      cronSchedule: '0 7 * * *', newsCronSchedule: '0 6 * * *' };
    expect(BriefingSettingsSchema.parse(settings)).toEqual(settings);
    expect(BriefingCategoryWeightsSchema.safeParse({ news: Infinity }).success).toBe(false);
  });
  it.each([
    [{ url: 'invalid', category: 'news', weight: 1 }],
    [{ url: 'https://example.com', category: 'news', weight: -1 }],
    [{ url: 'https://example.com', category: 'news', weight: 11 }],
    [{ url: 'https://example.com', category: 'news', phone: 'synthetic' }],
  ])('rejects invalid briefing feed settings: %j', value => {
    expect(BriefingFeedsSchema.safeParse([value]).success).toBe(false);
  });
  it('excludes source and audit metadata from news editable settings', () => {
    const feed = { url: 'https://example.com/rss', category: 'news', maxPerCategory: 2, label: 'News' };
    expect(NewsFeedsSchema.parse([feed])).toEqual([feed]);
    for (const extra of [{ source: 'default' }, { addedAt: '2026-10-09T00:00:00Z' }, { telegramChatId: 1 }]) {
      expect(NewsFeedsSchema.safeParse([{ ...feed, ...extra }]).success).toBe(false);
    }
    expect(NewsFeedsSettingsSchema.parse({ feeds: [feed], hoursBack: 24 })).toEqual({ feeds: [feed], hoursBack: 24 });
    expect(NewsFeedsSettingsSchema.safeParse({ feeds: [feed], hoursBack: 169 }).success).toBe(false);
    expect(NewsFeedsSchema.safeParse([{ ...feed, maxPerCategory: 21 }]).success).toBe(false);
  });
  it('does not silently strip recipients or arbitrary config fields', () => {
    expect(BriefingSettingsSchema.safeParse({ recipients: [] }).success).toBe(false);
    expect(NewsFeedsSettingsSchema.safeParse({ feeds: [], configuration: '{}' }).success).toBe(false);
  });
});
