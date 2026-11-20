import { describe, expect, it } from 'vitest';
import {
  SOCIAL_ROUND_ENDED_STATES,
  SOCIAL_ROUND_STATES,
  socialRoundEnded,
  SocialRoundReadResponseSchema,
  SocialRoundSchema,
} from '../../../src/capability/social-listening/index';

const round = {
  identity: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' },
  verticalId: 'ai',
  day: '2026-11-19',
  track: 'mac',
  state: 'done',
  scheduledFor: '2026-11-19T07:00:00+01:00',
  postsSeen: 0,
  topicsCount: 0,
  spentUsd: 0,
};
const finishedAt = '2026-11-19T07:40:00+01:00';
const noticeSentAt = '2026-11-19T07:42:00+01:00';

describe('social round completion', () => {
  it('(a) exports the three ended states', () => {
    expect(SOCIAL_ROUND_ENDED_STATES).toEqual(['done', 'failed', 'cap_reached']);
    for (const state of SOCIAL_ROUND_ENDED_STATES) {
      expect(SOCIAL_ROUND_STATES).toContain(state);
    }
  });

  it('(b) recognizes only ended states without throwing on other inputs', () => {
    for (const state of ['done', 'failed', 'cap_reached']) {
      expect(socialRoundEnded(state)).toBe(true);
    }
    for (const state of ['scheduled', 'running', 'DONE', '', undefined, null, 1, {}]) {
      expect(socialRoundEnded(state)).toBe(false);
    }
  });

  it('(c) preserves noticeSentAt on a completed round', () => {
    const completed = { ...round, finishedAt, noticeSentAt };
    expect(SocialRoundSchema.parse(completed)).toEqual(completed);
  });

  it('(d) rejects noticeSentAt on a running round at its field path', () => {
    const parsed = SocialRoundSchema.safeParse({ ...round, state: 'running', noticeSentAt });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map(issue => issue.path)).toContainEqual(['noticeSentAt']);
    }
  });

  it('(e) accepts saved completed rounds without noticeSentAt', () => {
    const saved = { ...round, finishedAt };
    expect(SocialRoundSchema.parse(saved)).toEqual(saved);
  });

  it('(f) accepts the read response and still rejects finishedAt on running rounds', () => {
    const response = { round: { ...round, finishedAt, noticeSentAt } };
    expect(SocialRoundReadResponseSchema.parse(response)).toEqual(response);
    const running = { ...round, state: 'running', finishedAt };
    const parsed = SocialRoundSchema.safeParse(running);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map(issue => issue.path)).toContainEqual(['finishedAt']);
    }
    expect(SocialRoundReadResponseSchema.safeParse({ round: running }).success).toBe(false);
  });
});
