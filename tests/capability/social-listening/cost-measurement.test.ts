import { describe, expect, it } from 'vitest';
import {
  SOCIAL_DAYS_PER_MONTH,
  SOCIAL_MEASUREMENT_KINDS,
  SocialCostMeasurementSchema,
  socialMeasurementSummary,
  socialMonthlyCostPerAuthor,
} from '../../../src/capability/social-listening/index.js';

const measurement = {
  measurementId: 'p0-server-1',
  track: 'server',
  kind: 'post_analysis',
  postId: 'post-1',
  usd: 0.0875,
  durationSec: 42,
  quality: 4,
  measuredAt: '2026-11-19T10:00:00+01:00',
};

// Server rows deliberately come first to distinguish fixed order from insertion order.
const rows = [
  ...[0.08, 0.09, 0.10].map((usd, i) => ({
    ...measurement, measurementId: `server-${i}`, usd, durationSec: 40 + i,
  })),
  ...[0, 1, 2].map(i => ({
    ...measurement, measurementId: `mac-${i}`, track: 'mac', usd: 0, durationSec: 20 + i,
  })),
  ...[0.30, 0.28].map((usd, i) => ({
    ...measurement, measurementId: `research-${i}`, kind: 'extended_research',
    postId: undefined, usd, durationSec: 60 + i,
  })),
];

const expectedSummary = [
  { track: 'mac', kind: 'post_analysis', count: 3, avgUsd: 0, avgDurationSec: 21 },
  { track: 'server', kind: 'post_analysis', count: 3, avgUsd: 0.09, avgDurationSec: 41 },
  { track: 'server', kind: 'extended_research', count: 2, avgUsd: 0.29, avgDurationSec: 60.5 },
];

describe('P0 cost measurements', () => {
  it('(a) accepts post analysis and research measurements', () => {
    expect(SOCIAL_MEASUREMENT_KINDS).toEqual(['post_analysis', 'extended_research']);
    expect(SocialCostMeasurementSchema.parse(measurement)).toEqual(measurement);
    const { postId, quality, ...research } = measurement;
    expect(postId).toBe('post-1');
    expect(quality).toBe(4);
    expect(SocialCostMeasurementSchema.safeParse({
      ...research, kind: 'extended_research', usd: 0.30,
    }).success).toBe(true);
    expect(SocialCostMeasurementSchema.safeParse({ ...measurement, track: 'mac', usd: 0 }).success)
      .toBe(true);
  });

  it('(b) rejects paid Mac usage, missing post IDs and malformed fields', () => {
    for (const patch of [
      { track: 'mac', usd: 0.01 }, { postId: undefined }, { quality: 6 }, { quality: 2.5 },
      { quality: 0 }, { postId: '' }, { postId: 'p'.repeat(101) },
      { measurementId: '' }, { measurementId: 'm'.repeat(101) },
      { usd: -0.01 }, { usd: NaN }, { usd: Infinity },
      { durationSec: -1 }, { durationSec: NaN }, { durationSec: Infinity },
      { measuredAt: '2026-11-19' }, { note: 'n'.repeat(501) },
      { kind: 'unknown' }, { track: 'unknown' }, { extra: true },
    ]) {
      expect(SocialCostMeasurementSchema.safeParse({ ...measurement, ...patch }).success,
        JSON.stringify(patch)).toBe(false);
    }
  });

  it('(c) calculates monthly costs in microdollars and rejects invalid inputs', () => {
    expect(SOCIAL_DAYS_PER_MONTH).toBe(30);
    expect(socialMonthlyCostPerAuthor({ postsPerDay: 4, costPerPostUsd: 0.0875 })).toBe(10.5);
    expect(socialMonthlyCostPerAuthor({ postsPerDay: 0, costPerPostUsd: 0.0875 })).toBe(0);
    expect(socialMonthlyCostPerAuthor({ postsPerDay: 4, costPerPostUsd: 0 })).toBe(0);
    expect(socialMonthlyCostPerAuthor({ postsPerDay: 0.1, costPerPostUsd: 0.1 })).toBe(0.3);
    expect(socialMonthlyCostPerAuthor({ postsPerDay: 1, costPerPostUsd: 0.000001 })).toBe(0.00003);
    for (const invalid of [NaN, -1, Infinity, -Infinity]) {
      expect(socialMonthlyCostPerAuthor({ postsPerDay: invalid, costPerPostUsd: 0.0875 })).toBeNull();
      expect(socialMonthlyCostPerAuthor({ postsPerDay: 4, costPerPostUsd: invalid })).toBeNull();
    }
  });

  it('(d) groups measurements by track and kind in fixed order with six-decimal means', () => {
    expect(socialMeasurementSummary(rows)).toEqual(expectedSummary);
    expect(socialMeasurementSummary([])).toEqual([]);
    expect(socialMeasurementSummary([
      { ...measurement, durationSec: 1, usd: 0.1 },
      { ...measurement, durationSec: 1, usd: 0.1 },
      { ...measurement, durationSec: 2, usd: 0.2 },
    ])).toEqual([
      { track: 'server', kind: 'post_analysis', count: 3, avgUsd: 0.133333, avgDurationSec: 1.333333 },
    ]);
    expect(socialMeasurementSummary([
      { ...measurement, kind: 'extended_research' }, measurement,
      { ...measurement, track: 'mac', kind: 'extended_research', usd: 0 },
      { ...measurement, track: 'mac', usd: 0 },
    ]).map(({ track, kind }) => [track, kind])).toEqual([
      ['mac', 'post_analysis'], ['mac', 'extended_research'],
      ['server', 'post_analysis'], ['server', 'extended_research'],
    ]);
  });

  it('(e) ignores invalid rows without changing valid measurements', () => {
    const invalid = [null, { ...measurement, extra: true }, { ...measurement, usd: -0.1 }];
    expect(socialMeasurementSummary([invalid[0], ...rows, ...invalid.slice(1)]))
      .toEqual(expectedSummary);
    expect(socialMeasurementSummary(invalid)).toEqual([]);
  });
});
