import { describe, expect, it } from 'vitest';
import {
  SOCIAL_P0_KEEP_RATIOS,
  SOCIAL_P0_POSTS_PER_DAY,
  SocialP0TableSchema,
  socialP0Table,
} from '../../../src/capability/social-listening/index.js';

const base = {
  measurementId: 'm', track: 'server', kind: 'post_analysis', postId: 'p',
  usd: 0.1, durationSec: 30, quality: 4, measuredAt: '2026-11-19T10:00:00+01:00',
};

const server = [[0.10, 4], [0.12, 5], [0.14, 3]].map(([usd, quality], i) => ({
  ...base, measurementId: `s${i}`, usd, quality,
}));
const mac = [0, 1, 2].map(i => ({ ...base, measurementId: `m${i}`, track: 'mac', usd: 0, quality: undefined }));
const research = [0.29, 0.30].map((usd, i) => ({
  ...base, measurementId: `r${i}`, kind: 'extended_research', postId: undefined, usd, quality: undefined,
}));
const all = [...server, ...mac, ...research];

describe('socialP0Table', () => {
  it('(a) builds rows, quality, extended research and no missing groups', () => {
    const t = socialP0Table(all);
    expect(SocialP0TableSchema.safeParse(t).success).toBe(true);
    expect(t.rows.map(r => `${r.track}/${r.kind}`)).toEqual([
      'mac/post_analysis', 'server/post_analysis', 'server/extended_research',
    ]);
    expect(t.rows[1]?.avgQuality).toBe(4);
    expect(t.rows[0]?.avgQuality).toBeNull();
    expect(t.extendedResearch).toEqual({ count: 2, avgUsd: 0.295, maxUsd: 0.3 });
    expect(t.missing).toEqual([]);
  });

  it('(b) monthly cost per author uses the keep ratio; the Mac stays at zero', () => {
    const t = socialP0Table(all);
    const find = (track: string, ppd: number, keep: number) =>
      t.monthlyPerAuthor.find(r => r.track === track && r.postsPerDay === ppd && r.keepRatio === keep)?.monthlyUsd;
    expect(find('server', 1.04, 1)).toBeCloseTo(3.744, 6);
    expect(find('server', 1.04, 0.6)).toBeCloseTo(2.2464, 6);
    const macRows = t.monthlyPerAuthor.filter(r => r.track === 'mac');
    expect(macRows).toHaveLength(SOCIAL_P0_POSTS_PER_DAY.length * SOCIAL_P0_KEEP_RATIOS.length);
    expect(macRows.every(r => r.monthlyUsd === 0)).toBe(true);
    expect(t.monthlyPerAuthor.some(r => r.track === 'server' && r.keepRatio === 1 && r.postsPerDay === 0.49)).toBe(true);
  });

  it('(c) no measurements: empty table and the three missing groups', () => {
    expect(socialP0Table([])).toEqual({
      rows: [], monthlyPerAuthor: [], extendedResearch: null,
      missing: ['mac_post_analysis', 'server_post_analysis', 'extended_research'],
    });
  });

  it('(d) invalid rows do not change the result', () => {
    const junk = [null, { ...base, usd: -1 }, { ...base, track: 'mac', usd: 0.5 }];
    expect(socialP0Table([...junk, ...all])).toEqual(socialP0Table(all));
  });

  it('(e) options narrow the rows and invalid values throw', () => {
    const t = socialP0Table(all, { postsPerDay: [2], keepRatios: [1] });
    expect(t.monthlyPerAuthor.map(r => [r.track, r.postsPerDay, r.keepRatio])).toEqual([
      ['mac', 2, 1], ['server', 2, 1],
    ]);
    expect(t.monthlyPerAuthor[1]?.monthlyUsd).toBeCloseTo(7.2, 6);
    for (const bad of [[Number.NaN], [-1], [Infinity]]) {
      expect(() => socialP0Table(all, { postsPerDay: bad })).toThrow('invalid_p0_option');
      expect(() => socialP0Table(all, { keepRatios: bad })).toThrow('invalid_p0_option');
    }
  });

  it('reports the missing group when only one track is measured', () => {
    expect(socialP0Table(server).missing).toEqual(['mac_post_analysis', 'extended_research']);
  });
});
