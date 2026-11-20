import { describe, expect, it } from 'vitest';
import {
  SocialRecapEndReasonSchema,
  SocialRecapOutputSchema,
  type SocialRecapEndReason,
} from '../../../src/capability/social-listening/index.js';

const recap = {
  verticalId: 'ai',
  day: '2026-11-03',
  track: 'server',
  finishedAt: '2026-11-03T14:40:00+00:00',
  counts: { funziona: 0, da_provare: 0, non_funziona: 0, fuffa: 0 },
  postsSeen: 0,
  spentUsd: 0,
  topics: [],
};

const endReason: SocialRecapEndReason = {
  code: 'meta_credentials_missing',
  text: 'manca la chiave di Meta di questo agente nel Vault',
};

describe('s9860 recap-end-reason', () => {
  it('(a) accepts and preserves the failed round reason', () => {
    const value = { ...recap, endReason };
    expect(SocialRecapOutputSchema.parse(value)).toEqual(value);
  });

  it('(b) preserves legacy recaps without endReason', () => {
    expect(SocialRecapOutputSchema.parse(recap)).toEqual(recap);
    // Production-shaped legacy recaps; no live data is read.
    for (const day of ['2026-11-02', '2026-11-03']) {
      const legacy = {
        ...recap,
        day,
        finishedAt: `${day}T14:40:00+00:00`,
        postsSeen: 22,
        spentUsd: 0.48,
      };
      expect(SocialRecapOutputSchema.parse(legacy)).toEqual(legacy);
    }
  });

  it.each([
    { name: 'empty code', value: { ...endReason, code: '' } },
    { name: 'uppercase code', value: { ...endReason, code: 'Meta_credentials_missing' } },
    { name: 'code with spaces', value: { ...endReason, code: 'meta credentials missing' } },
    { name: '49-character code', value: { ...endReason, code: 'a'.repeat(49) } },
    { name: 'empty text', value: { ...endReason, text: '' } },
    { name: '201-character text', value: { ...endReason, text: 'a'.repeat(201) } },
    { name: 'extra key', value: { ...endReason, extra: 'unexpected' } },
    { name: 'null reason', value: null },
  ])('(c) rejects $name', ({ value }) => {
    expect(SocialRecapOutputSchema.safeParse({ ...recap, endReason: value }).success).toBe(false);
  });

  it('(d) coexists with freshness and coherent cost metadata', () => {
    const cost = { postsSeen: 22, spentUsd: 0.48, costPerPostUsd: 0.021818 };
    const freshness = { requestedDay: '2026-11-04', stale: true };
    for (const metadata of [freshness, cost, { ...freshness, ...cost }]) {
      const value = { ...recap, ...metadata, endReason };
      expect(SocialRecapOutputSchema.parse(value)).toEqual(value);
    }
  });

  it('(e) exports the schema and type through index with inclusive limits', () => {
    expect(SocialRecapEndReasonSchema.parse(endReason)).toEqual(endReason);
    for (const code of ['a', 'a'.repeat(48)]) {
      const boundary: SocialRecapEndReason = { code, text: 'a'.repeat(200) };
      expect(SocialRecapEndReasonSchema.parse(boundary)).toEqual(boundary);
      expect(SocialRecapOutputSchema.parse({ ...recap, endReason: boundary }).endReason).toEqual(boundary);
    }
  });
});
