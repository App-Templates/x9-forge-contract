import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
import { WikiClaimSchema, WikiOriginSchema } from '../../../src/capability/lab/wiki.js';

// Existing saved-claim shape from lab.test.ts, without the optional quotes field.
const savedClaim = {
  id: 'c-1',
  pageSlug: 'hollandaise',
  text: 'Oltre 65 °C il tuorlo coagula.',
  sourceIds: ['s-1'],
  status: 'aperta',
  origin: 'web',
};

it('s5943 a model claim has no sources and is never confirmed', () => {
  expect(WikiOriginSchema.options).toEqual(['web', 'dataset', 'human', 'model']);
  const modelClaim = { ...savedClaim, origin: 'model', sourceIds: [] };
  for (const status of ['aperta', 'contraddetta', 'scartata']) {
    const claim = { ...modelClaim, status };
    expect(WikiClaimSchema.parse(claim)).toEqual(claim);
  }
  expect(WikiClaimSchema.safeParse({ ...modelClaim, status: 'confermata' }).success).toBe(false);
  expect(WikiClaimSchema.safeParse({ ...modelClaim, sourceIds: ['s-1'] }).success).toBe(false);
  expect(WikiClaimSchema.safeParse({ ...modelClaim, sourceIds: undefined }).success).toBe(false);
});

it('s5943 a web or human claim still needs a source', () => {
  for (const origin of ['web', 'human', 'dataset']) {
    const claim = { ...savedClaim, origin };
    expect(WikiClaimSchema.parse(claim)).toEqual(claim);
    expect(WikiClaimSchema.safeParse({ ...claim, status: 'confermata' }).success).toBe(true);
    expect(WikiClaimSchema.safeParse({ ...claim, sourceIds: [] }).success).toBe(false);
    expect(WikiClaimSchema.safeParse({ ...claim, sourceIds: [''] }).success).toBe(false);
    expect(WikiClaimSchema.safeParse({ ...claim, sourceIds: Array(51).fill('s-1') }).success).toBe(false);
  }
});

it('s5943 a quote must name one of the claim sources', () => {
  const quote = { sourceId: 's-1', text: 'Egg yolk coagulates above 65 °C.' };
  const claim = { ...savedClaim, quotes: [quote] };
  expect(WikiClaimSchema.parse(claim)).toEqual(claim);
  expect(WikiClaimSchema.parse({ ...savedClaim, quotes: [] }).quotes).toEqual([]);
  expect(WikiClaimSchema.safeParse({
    ...savedClaim, sourceIds: ['s-1', 's-2'], quotes: [{ ...quote, sourceId: 's-2' }, quote],
  }).success).toBe(true);
  for (const invalidQuote of [
    { ...quote, sourceId: 's-other' },
    { ...quote, sourceId: '' },
    { ...quote, text: '' },
    { ...quote, text: 'x'.repeat(501) },
    { ...quote, extra: true },
    { sourceId: quote.sourceId },
  ]) {
    expect(WikiClaimSchema.safeParse({ ...savedClaim, quotes: [invalidQuote] }).success).toBe(false);
  }
  expect(WikiClaimSchema.safeParse({ ...savedClaim, quotes: Array(51).fill(quote) }).success).toBe(false);
  const boundary = { ...savedClaim, quotes: Array(50).fill({ ...quote, text: 'x'.repeat(500) }) };
  expect(WikiClaimSchema.parse(boundary)).toEqual(boundary);
  expect(WikiClaimSchema.safeParse({ ...savedClaim, quotes: null }).success).toBe(false);
  expect(WikiClaimSchema.safeParse({
    ...claim, origin: 'model', sourceIds: [],
  }).success).toBe(false);
});

it('s5943 a claim saved today parses unchanged', () => {
  expect(WikiClaimSchema.parse(savedClaim)).toEqual(savedClaim);
  expect(WikiClaimSchema.parse(savedClaim)).not.toHaveProperty('quotes');
  for (const status of ['aperta', 'confermata', 'contraddetta', 'scartata']) {
    const claim = { ...savedClaim, status };
    expect(WikiClaimSchema.parse(claim)).toEqual(claim);
  }
  expect(WikiClaimSchema.safeParse({ ...savedClaim, extra: true }).success).toBe(false);
});

it('s5943 the CommonJS dist accepts origin model', () => {
  const cjs: { WikiClaimSchema: typeof WikiClaimSchema } = createRequire(import.meta.url)(
    '@x9-forge/contracts/capability/lab',
  );
  const claim = { ...savedClaim, origin: 'model', sourceIds: [] };
  expect(cjs.WikiClaimSchema.parse(claim)).toEqual(claim);
  expect(cjs.WikiClaimSchema.safeParse({ ...claim, status: 'confermata' }).success).toBe(false);
  expect(cjs.WikiClaimSchema.safeParse({ ...savedClaim, sourceIds: [] }).success).toBe(false);
});
