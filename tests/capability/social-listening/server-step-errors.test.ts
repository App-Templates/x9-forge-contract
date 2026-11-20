import { describe, expect, it } from 'vitest';
import {
  SOCIAL_SERVER_STEP_ERRORS,
  SocialServerStepErrorSchema,
  isSocialServerStepError,
} from '../../../src/capability/social-listening/index';

const EXPECTED = [
  'step_failed',
  'step_timeout',
  'invalid_result',
  'meta_credentials_missing',
  'identity_mismatch',
  'meta_unauthorized',
  'meta_rate_limited',
  'meta_unavailable',
  'post_not_found',
  'not_a_video',
  'media_url_unavailable',
  'stt_media_refused',
  'stt_unavailable',
  'stt_invalid_response',
];

describe('social server step errors', () => {
  it('(a) lists exactly the 14 codes in order, without duplicates', () => {
    expect([...SOCIAL_SERVER_STEP_ERRORS]).toEqual(EXPECTED);
    expect(new Set(SOCIAL_SERVER_STEP_ERRORS).size).toBe(14);
  });

  it('(b) the schema accepts every code and refuses others', () => {
    for (const c of EXPECTED) expect(SocialServerStepErrorSchema.safeParse(c).success).toBe(true);
    for (const c of ['too_many_attempts', 'Step_Failed', ' step_failed', '']) {
      expect(SocialServerStepErrorSchema.safeParse(c).success).toBe(false);
    }
  });

  it('(c) the guard is true for codes and false for anything else, never throwing', () => {
    for (const c of EXPECTED) expect(isSocialServerStepError(c)).toBe(true);
    for (const v of [undefined, null, 42, {}, ['step_failed'], 'https://private.example/x']) {
      expect(isSocialServerStepError(v)).toBe(false);
    }
  });

  it('(d) every code is a fixed lowercase snake_case text of at most 40 characters', () => {
    for (const c of SOCIAL_SERVER_STEP_ERRORS) {
      expect(c).toMatch(/^[a-z]+(_[a-z]+)+$/);
      expect(c.length).toBeLessThanOrEqual(40);
    }
  });
});
