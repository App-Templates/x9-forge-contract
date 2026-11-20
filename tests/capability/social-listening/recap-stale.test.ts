import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  SocialListeningToolErrorSchema,
  SocialRecapInputSchema,
  SocialRecapOutputSchema,
} from '../../../src/capability/social-listening/tools.js';

const recap = {
  verticalId: 'ai',
  day: '2026-11-03',
  track: 'mac',
  finishedAt: '2026-11-03T14:40:00+00:00',
  counts: { funziona: 2, da_provare: 6, non_funziona: 0, fuffa: 2 },
  postsSeen: 10,
  spentUsd: 0.875,
  topics: [],
};

describe('social_recap requested day and freshness', () => {
  it('s3962 (a) exposes the fallback to the model in the input JSON schema', () => {
    const schema = z.toJSONSchema(SocialRecapInputSchema);
    expect(schema.properties?.day?.description).toContain('ultimo giro finito prima');
  });

  it('s3962 (b) accepts and preserves an older finished round marked stale', () => {
    const value = { ...recap, requestedDay: '2026-11-20', stale: true };
    expect(SocialRecapOutputSchema.parse(value)).toEqual(value);
  });

  it('s3962 (c) rejects incomplete or inconsistent freshness metadata with field paths', () => {
    const invalid = [
      { value: { ...recap, stale: true }, field: 'requestedDay' },
      { value: { ...recap, requestedDay: '2026-11-20' }, field: 'stale' },
      { value: { ...recap, requestedDay: '2026-11-20', stale: false }, field: 'stale' },
      { value: { ...recap, requestedDay: recap.day, stale: true }, field: 'stale' },
      { value: { ...recap, requestedDay: '2026-11-02', stale: true }, field: 'requestedDay' },
    ];
    for (const { value, field } of invalid) {
      // Both legacy recaps and recaps with cost metadata must enforce freshness.
      for (const cost of [{}, { costPerPostUsd: 0.0875 }]) {
        const result = SocialRecapOutputSchema.safeParse({ ...value, ...cost });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(issue => issue.path.join('.') === field)).toBe(true);
        }
      }
    }
  });

  it('s3962 (d) accepts matching requested and returned days marked fresh', () => {
    const value = { ...recap, requestedDay: recap.day, stale: false };
    expect(SocialRecapOutputSchema.parse(value)).toEqual(value);
  });

  it('s3962 (e) preserves a current-day recap without freshness metadata', () => {
    const value = { ...recap, day: '2026-11-20', finishedAt: '2026-11-20T14:40:00+00:00' };
    expect(SocialRecapOutputSchema.parse(value)).toEqual(value);
  });

  it('s3962 (f) keeps unknown vertical distinct from missing configuration', () => {
    expect(SocialListeningToolErrorSchema.options).toContain('unknown_vertical');
    expect(SocialListeningToolErrorSchema.options).toContain('not_configured');
  });
});
