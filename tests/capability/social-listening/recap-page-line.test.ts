import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  SOCIAL_ASCOLTO_PAGE_LINE_PREFIX,
  SocialRecapOutputSchema,
  socialAscoltoPageLine,
} from '../../../src/capability/social-listening/tools.js';

const URL_ = 'https://forge.example/agents/x9-staging/ascolto';
const summary = (i: number, verdict = 'funziona') => ({
  topicId: `cluster-anon-${i}-0123456789abcdef0123456789abcdef`,
  title: `Argomento finto ${i}`,
  category: 'coding',
  verdict,
  heat: 5,
  cost: { usd: 0, track: 'mac', uncertain: false },
});
const recap = {
  verticalId: 'ai',
  day: '2026-11-03',
  track: 'mac',
  finishedAt: '2026-11-03T14:40:00+00:00',
  counts: { funziona: 2, da_provare: 6, non_funziona: 0, fuffa: 2 },
  postsSeen: 10,
  spentUsd: 0,
  topics: [summary(1), summary(2, 'fuffa')],
};

describe('s9700 pageline', () => {
  it('(a) the line is the prefix plus the url', () => {
    expect(socialAscoltoPageLine(URL_)).toBe(`Apri la pagina Ascolto: ${URL_}`);
    expect(SOCIAL_ASCOLTO_PAGE_LINE_PREFIX.endsWith(': ')).toBe(true);
  });

  it('(b) pageLine must equal the function output and needs pageUrl', () => {
    const ok = SocialRecapOutputSchema.safeParse({ ...recap, pageUrl: URL_, pageLine: socialAscoltoPageLine(URL_) });
    expect(ok.success).toBe(true);

    const bad = SocialRecapOutputSchema.safeParse({
      ...recap,
      pageUrl: URL_,
      pageLine: socialAscoltoPageLine(URL_).replace('Apri', 'Apro'),
    });
    expect(bad.success).toBe(false);
    expect(!bad.success && bad.error.issues.some(i => i.path[0] === 'pageLine')).toBe(true);

    const alone = SocialRecapOutputSchema.safeParse({ ...recap, pageLine: socialAscoltoPageLine(URL_) });
    expect(alone.success).toBe(false);
    expect(!alone.success && alone.error.issues.some(i => i.path[0] === 'pageLine')).toBe(true);
  });

  it('(c) the link comes first, even with 50 topics', () => {
    const big = {
      ...recap,
      topics: Array.from({ length: 50 }, (_, i) => summary(i)),
      pageUrl: URL_,
      pageLine: socialAscoltoPageLine(URL_),
    };
    const parsed = SocialRecapOutputSchema.parse(big);
    expect(Object.keys(parsed).slice(0, 3)).toEqual(['pageLine', 'pageUrl', 'verticalId']);
    const json = JSON.stringify(parsed);
    expect(json.indexOf('"pageUrl"')).toBeGreaterThanOrEqual(0);
    expect(json.indexOf('"pageUrl"')).toBeLessThan(400);
  });

  it('(d) the JSON schema lists pageLine and pageUrl first', () => {
    const props = z.toJSONSchema(SocialRecapOutputSchema, { io: 'output' }).properties ?? {};
    expect(Object.keys(props).slice(0, 2)).toEqual(['pageLine', 'pageUrl']);
  });

  it('(e) older shapes stay valid (R-37)', () => {
    expect(SocialRecapOutputSchema.safeParse({ ...recap, pageUrl: URL_ }).success).toBe(true);
    expect(SocialRecapOutputSchema.safeParse(recap).success).toBe(true);
    expect(SocialRecapOutputSchema.safeParse({ ...recap, requestedDay: '2026-11-03', stale: false }).success).toBe(true);
    expect(SocialRecapOutputSchema.safeParse({ ...recap, requestedDay: '2026-11-04', stale: true }).success).toBe(true);
    expect(SocialRecapOutputSchema.safeParse({ ...recap, requestedDay: '2026-11-04', stale: false }).success).toBe(false);
    expect(SocialRecapOutputSchema.safeParse({ ...recap, stale: true }).success).toBe(false);
  });
});
