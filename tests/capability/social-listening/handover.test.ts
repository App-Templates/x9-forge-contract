import { describe, expect, it, vi } from 'vitest';
import * as social from '../../../src/capability/social-listening/index.js';

const input = {
  round: { runsOn: 'mac', fallbackToServer: true, fallbackTime: '08:00', timezone: 'Europe/Rome' },
  giro: { day: '2026-11-17', track: 'mac', state: 'scheduled' },
  nowIso: '2026-11-17T07:00:00Z',
};
const invalid = { action: 'none', reason: 'invalid_input' };

describe('social round handover', () => {
  it('exports the D9 reasons and hands over exactly at the winter deadline', () => {
    expect(social.SOCIAL_HANDOVER_REASONS).toEqual([
      'not_mac', 'no_fallback', 'already_done', 'already_on_server',
      'before_fallback_time', 'fallback_time_reached', 'day_passed',
    ]);
    expect(social.socialRoundHandover(input)).toEqual({ action: 'hand_to_server', reason: 'fallback_time_reached' });
  });

  it('waits until 08:00 in Rome in winter', () => {
    expect(social.socialRoundHandover({ ...input, nowIso: '2026-11-17T06:59:00Z' }))
      .toEqual({ action: 'wait', reason: 'before_fallback_time' });
  });

  it.each(['scheduled', 'running', 'failed'])('hands over an unfinished Mac round: %s', state => {
    expect(social.socialRoundHandover({
      ...input, giro: { ...input.giro, state }, nowIso: '2026-11-17T08:00:00Z',
    })).toEqual({ action: 'hand_to_server', reason: 'fallback_time_reached' });
  });

  it('waits for the deadline even when the Mac round has failed', () => {
    expect(social.socialRoundHandover({
      ...input, giro: { ...input.giro, state: 'failed' }, nowIso: '2026-11-17T06:59:00Z',
    })).toEqual({ action: 'wait', reason: 'before_fallback_time' });
  });

  it('uses the summer IANA offset instead of a fixed winter offset', () => {
    const summer = { ...input, giro: { ...input.giro, day: '2026-07-15' } };
    expect(social.socialRoundHandover({ ...summer, nowIso: '2026-07-15T05:59:00Z' }))
      .toEqual({ action: 'wait', reason: 'before_fallback_time' });
    expect(social.socialRoundHandover({ ...summer, nowIso: '2026-07-15T06:00:00Z' }))
      .toEqual({ action: 'hand_to_server', reason: 'fallback_time_reached' });
  });

  it('hands over the next local day even before the deadline', () => {
    for (const nowIso of ['2026-11-18T00:30:00Z', '2026-11-17T23:30:00Z']) {
      expect(social.socialRoundHandover({ ...input, nowIso }))
        .toEqual({ action: 'hand_to_server', reason: 'day_passed' });
    }
  });

  it('waits for a future round even after the current local deadline', () => {
    expect(social.socialRoundHandover({ ...input, giro: { ...input.giro, day: '2026-11-18' } }))
      .toEqual({ action: 'wait', reason: 'before_fallback_time' });
  });

  it('uses the supplied offset as an instant and honors the configured deadline', () => {
    expect(social.socialRoundHandover({ ...input, nowIso: '2026-11-17T02:00:00-05:00' }))
      .toEqual({ action: 'hand_to_server', reason: 'fallback_time_reached' });
    expect(social.socialRoundHandover({ ...input, round: { ...input.round, fallbackTime: '08:01' } }))
      .toEqual({ action: 'wait', reason: 'before_fallback_time' });
  });

  it('uses the agent zone across midnight and year boundaries', () => {
    expect(social.socialRoundHandover({
      ...input, round: { ...input.round, timezone: 'America/Los_Angeles' },
    })).toEqual({ action: 'wait', reason: 'before_fallback_time' });
    expect(social.socialRoundHandover({
      ...input, round: { ...input.round, fallbackTime: '00:30' },
      nowIso: '2026-11-16T23:15:00Z',
    })).toEqual({ action: 'wait', reason: 'before_fallback_time' });
    expect(social.socialRoundHandover({
      ...input, giro: { ...input.giro, day: '2026-12-31' }, nowIso: '2026-12-31T23:00:00Z',
    })).toEqual({ action: 'hand_to_server', reason: 'day_passed' });
  });

  it('does nothing for finished, server or disabled rounds, including stale rounds', () => {
    for (const nowIso of [input.nowIso, '2026-11-18T00:30:00Z']) {
      expect(social.socialRoundHandover({ ...input, nowIso, giro: { ...input.giro, state: 'done' } }))
        .toEqual({ action: 'none', reason: 'already_done' });
      expect(social.socialRoundHandover({ ...input, nowIso, giro: { ...input.giro, track: 'server' } }))
        .toEqual({ action: 'none', reason: 'already_on_server' });
      expect(social.socialRoundHandover({ ...input, nowIso, round: { ...input.round, runsOn: 'server' } }))
        .toEqual({ action: 'none', reason: 'not_mac' });
      expect(social.socialRoundHandover({ ...input, nowIso, round: { ...input.round, fallbackToServer: false } }))
        .toEqual({ action: 'none', reason: 'no_fallback' });
    }
  });

  it('applies the documented guard precedence', () => {
    const finishedOnServer = { ...input.giro, track: 'server', state: 'done' };
    expect(social.socialRoundHandover({ ...input, giro: finishedOnServer }))
      .toEqual({ action: 'none', reason: 'already_on_server' });
    expect(social.socialRoundHandover({
      ...input, giro: finishedOnServer, round: { ...input.round, fallbackToServer: false },
    })).toEqual({ action: 'none', reason: 'no_fallback' });
    expect(social.socialRoundHandover({
      ...input, giro: finishedOnServer, round: { ...input.round, runsOn: 'server', fallbackToServer: false },
    })).toEqual({ action: 'none', reason: 'not_mac' });
  });

  it('rejects invalid input and unknown fields without throwing', () => {
    const invalidInputs: unknown[] = [
      null, undefined, [], 'mac', {},
      { ...input, nowIso: '2026-11-17T08:00:00' },
      { ...input, nowIso: '2026-02-30T08:00:00Z' },
      { ...input, nowIso: 1794902400000 },
      { ...input, round: { ...input.round, timezone: 'Unknown/Zone' } },
      { ...input, round: { ...input.round, fallbackTime: '24:00' } },
      { ...input, round: { ...input.round, fallbackToServer: 'true' } },
      { ...input, round: { ...input.round, runsOn: 'desktop' } },
      { ...input, giro: { ...input.giro, day: '2026-02-30' } },
      { ...input, giro: { ...input.giro, state: 'queued' } },
      { ...input, giro: { ...input.giro, state: 'cap_reached' } },
      { ...input, giro: { ...input.giro, track: 'desktop' } },
      { ...input, extra: true },
      { ...input, round: { ...input.round, localTime: '07:00' } },
      { ...input, giro: { ...input.giro, extra: true } },
      { ...input, round: { ...input.round, fallbackTime: undefined } },
      { ...input, giro: { ...input.giro, day: undefined } },
      { get round() { throw new Error('Unreadable input'); } },
    ];
    for (const value of invalidInputs) expect(social.socialRoundHandover(value)).toEqual(invalid);
    expect(social.socialRoundHandover({
      ...input, giro: { ...input.giro, track: 'server', state: 'cap_reached' },
    })).toEqual({ action: 'none', reason: 'already_on_server' });
  });

  it('never reads the current clock', () => {
    vi.useFakeTimers();
    const clock = vi.spyOn(Date, 'now').mockImplementation(() => { throw new Error('Clock read'); });
    try {
      expect(social.socialRoundHandover(input))
        .toEqual({ action: 'hand_to_server', reason: 'fallback_time_reached' });
    } finally {
      clock.mockRestore();
      vi.useRealTimers();
    }
  });
});
