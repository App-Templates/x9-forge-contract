import { describe, expect, it } from 'vitest';
import * as social from '../../../src/capability/social-listening/index.js';

const server = { track: 'server', capUsd: 2, spentUsd: 1.95, estimateUsd: 0.05 };
const invalidInputs: unknown[] = [
  null, undefined, [], 'server',
  ...[0, -1, NaN, Infinity, -Infinity, '2', undefined].map(capUsd => ({ ...server, capUsd })),
  ...[-1, NaN, Infinity, -Infinity, '0', undefined].map(spentUsd => ({ ...server, spentUsd })),
  ...[-1, NaN, Infinity, -Infinity, '0', undefined].map(estimateUsd => ({ ...server, estimateUsd })),
  { ...server, track: 'unknown' },
  { ...server, extra: true },
  { ...server, track: 'mac', estimateUsd: -1 },
];

describe('social daily server cap', () => {
  it('(a) records D24 while preserving the fallback proposal and cap limits', () => {
    expect(social.SOCIAL_SERVER_DAILY_CAP_DEFAULT_USD).toBe(2);
    const cap = social.SOCIAL_LISTENING_PARAMETERS.parameters.find(p => p.key === 'round.serverDailyCapUsd');
    expect(cap).toMatchObject({ status: 'decided', platformDefault: social.SOCIAL_SERVER_DAILY_CAP_DEFAULT_USD, min: 0.01 });
    expect(cap?.reference).toContain('D24');
    const fallback = social.SOCIAL_LISTENING_PARAMETERS.parameters.find(p => p.key === 'round.fallbackTime');
    expect(fallback?.status).toBe('proposed');
  });

  it('(b) allows a reservation exactly at the cap and rejects the next cent', () => {
    expect(social.socialCapDecision(server)).toEqual({ ok: true, capped: true, remainingUsd: 0.05 });
    expect(social.socialCapDecision({ ...server, estimateUsd: 0.06 }))
      .toEqual({ ok: false, reason: 'cap_reached', remainingUsd: 0.05 });
  });

  it('(b) adds decimal costs in integer microdollars', () => {
    expect(social.socialCapDecision({ track: 'server', capUsd: 0.3, spentUsd: 0.1, estimateUsd: 0.2 }))
      .toEqual({ ok: true, capped: true, remainingUsd: 0.2 });
  });

  it('(b) clamps the remaining budget to zero above the cap', () => {
    expect(social.socialCapDecision({ ...server, spentUsd: 2.01, estimateUsd: 0 }))
      .toEqual({ ok: false, reason: 'cap_reached', remainingUsd: 0 });
    expect(social.socialCapDecision({ ...server, spentUsd: 2, estimateUsd: 0 }))
      .toEqual({ ok: true, capped: true, remainingUsd: 0 });
  });

  it('(b) rounds each amount and the remainder to six decimal places', () => {
    expect(social.socialCapDecision({ ...server, capUsd: 0.3000004, spentUsd: 0.1000004, estimateUsd: 0.2000004 }))
      .toEqual({ ok: true, capped: true, remainingUsd: 0.2 });
    expect(social.socialCapDecision({ ...server, capUsd: 0.3000004, spentUsd: 0.1000004, estimateUsd: 0.2000006 }))
      .toEqual({ ok: false, reason: 'cap_reached', remainingUsd: 0.2 });
    expect(social.socialCapDecision({ ...server, spentUsd: 1.2345674, estimateUsd: 0 }))
      .toEqual({ ok: true, capped: true, remainingUsd: 0.765433 });
  });

  it('(b) handles large finite costs without overflowing the microdollar sum', () => {
    const capUsd = Number.MAX_VALUE;
    expect(social.socialCapDecision({ ...server, capUsd, spentUsd: 0, estimateUsd: 0 }))
      .toEqual({ ok: true, capped: true, remainingUsd: capUsd });
    expect(social.socialCapDecision({ ...server, capUsd, spentUsd: capUsd, estimateUsd: capUsd }))
      .toEqual({ ok: false, reason: 'cap_reached', remainingUsd: 0 });
  });

  it('(c) leaves the Mac subscription uncapped for every valid amount', () => {
    for (const amounts of [server, { capUsd: 0.01, spentUsd: 100, estimateUsd: 100 },
      { capUsd: 2, spentUsd: 0, estimateUsd: 0 },
      { capUsd: Number.MIN_VALUE, spentUsd: Number.MAX_VALUE, estimateUsd: Number.MAX_VALUE }]) {
      expect(social.socialCapDecision({ ...amounts, track: 'mac' })).toEqual({ ok: true, capped: false });
    }
  });

  it('(d) rejects invalid inputs without throwing or allowing a call', () => {
    for (const input of invalidInputs) {
      expect(social.socialCapDecision(input)).toEqual({ ok: false, reason: 'invalid_input' });
    }
    const unreadable = { get track() { throw new Error('Unreadable input'); } };
    expect(social.socialCapDecision(unreadable)).toEqual({ ok: false, reason: 'invalid_input' });
  });

  it('(e) accepts valid checks including a reservation that exceeds the cap', () => {
    for (const input of [server, { ...server, estimateUsd: 0.06 },
      { ...server, capUsd: 0.3, spentUsd: 0.1, estimateUsd: 0.2 },
      { ...server, spentUsd: 3 }, { ...server, spentUsd: 0, estimateUsd: 0 },
      { ...server, track: 'mac' }]) {
      expect(social.SocialCapCheckSchema.safeParse(input).success).toBe(true);
    }
    expect(social.SocialCapCheckSchema.shape.track).toBe(social.SocialTrackSchema);
  });

  it('(e) rejects invalid checks and unknown fields at the schema boundary', () => {
    for (const input of invalidInputs) {
      expect(social.SocialCapCheckSchema.safeParse(input).success).toBe(false);
    }
  });
});
