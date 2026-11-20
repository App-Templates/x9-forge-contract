import { describe, expect, it } from 'vitest';
import * as social from '../../../src/capability/social-listening/index.js';

const base = {
  roundDay: '2026-11-19',
  nowIso: '2026-11-19T10:00:00Z',
  timezone: 'Europe/Rome',
  roundTime: '07:00',
};
const invalid = { state: 'invalid_input' };

describe('social round freshness', () => {
  it('exports the states', () => {
    expect(social.SOCIAL_ROUND_FRESHNESS).toEqual(['today', 'yesterday_pending', 'stale']);
  });

  it('(a) round of the local day is today', () => {
    expect(social.socialRoundFreshness(base)).toEqual({ state: 'today', daysOld: 0 });
  });

  it('(b) uses the agent timezone, not UTC, for the local day', () => {
    expect(social.socialRoundFreshness({ ...base, roundDay: '2026-11-18', nowIso: '2026-11-18T23:30:00Z' }))
      .toEqual({ state: 'yesterday_pending', daysOld: 1 });
  });

  it('(c) yesterday after the round time is stale; old rounds count days', () => {
    expect(social.socialRoundFreshness({ ...base, roundDay: '2026-11-18', nowIso: '2026-11-19T06:30:00Z' }))
      .toEqual({ state: 'stale', daysOld: 1 });
    expect(social.socialRoundFreshness({ ...base, roundDay: '2026-11-03' }))
      .toEqual({ state: 'stale', daysOld: 16 });
  });

  it('(d) at exactly the round time yesterday is already stale', () => {
    expect(social.socialRoundFreshness({ ...base, roundDay: '2026-11-18', nowIso: '2026-11-19T06:00:00Z' }))
      .toEqual({ state: 'stale', daysOld: 1 });
  });

  it('(e) rejects invalid input without throwing', () => {
    const thrower = { ...base };
    Object.defineProperty(thrower, 'roundDay', { enumerable: true, get() { throw new Error('boom'); } });
    expect(social.socialRoundFreshness({ ...base, roundDay: '2026-11-20' })).toEqual(invalid);
    expect(social.socialRoundFreshness({ ...base, timezone: 'Mars/Base' })).toEqual(invalid);
    expect(social.socialRoundFreshness({ ...base, roundTime: '7:00' })).toEqual(invalid);
    expect(social.socialRoundFreshness({ ...base, extra: 1 })).toEqual(invalid);
    expect(social.socialRoundFreshness(null)).toEqual(invalid);
    expect(social.socialRoundFreshness(thrower)).toEqual(invalid);
  });

  it('(f) counts calendar days across the DST change', () => {
    expect(social.socialRoundFreshness({ ...base, roundDay: '2026-10-24', nowIso: '2026-10-26T10:00:00Z' }))
      .toEqual({ state: 'stale', daysOld: 2 });
  });
});
