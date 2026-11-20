import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  LabQueryInputSchema,
  LabQueryOutputSchema,
  LabReadPublishedInputSchema,
  LabReadPublishedOutputSchema,
} from '../../../src/capability/lab/index.js';

const recipient = { kind: 'client', clientId: 'client-orto-facile' };
const slugs = ['orto-facile-pianificazione', 'orto-facile-copertura-agronomica'];
const wikiPage = (slug: string) => ({
  agentId: 'lab-orto-facile', slug, kind: 'dossier', title: 'Orto Facile', body: '# Orto Facile',
  version: 1, updatedAt: '2026-11-12T01:00:00Z',
});
const publishedPage = (slug: string) => ({
  slug, version: 1, digest: 'a'.repeat(64), title: 'Orto Facile', content: '# Orto Facile', contradicts: [],
});

describe('s6352 lab-per-slug: lab_query and lab_read_published read by page name', () => {
  it('s6352 lab-per-slug: inputs accept slugs, and today\'s inputs still parse', () => {
    expect(LabQueryInputSchema.safeParse({ question: 'Quali pagine ci sono su Orto Facile?', slugs }).success).toBe(true);
    expect(LabReadPublishedInputSchema.safeParse({ recipient, slugs: [slugs[0]] }).success).toBe(true);
    // production-shaped forms of today
    expect(LabQueryInputSchema.parse({ question: 'Orto Facile' })).toEqual({ question: 'Orto Facile' });
    expect(LabQueryOutputSchema.parse({ pages: [], claims: [] })).toEqual({ pages: [], claims: [] });
    const today = { pages: [publishedPage(slugs[0])] };
    expect(LabReadPublishedOutputSchema.parse(today)).toEqual(today);
  });

  it('outputs say how each page was matched and why an answer is empty', () => {
    expect(LabQueryOutputSchema.safeParse({
      pages: [wikiPage(slugs[0])], claims: [], matches: [{ slug: slugs[0], matchedBy: 'slug' }],
    }).success).toBe(true);
    expect(LabQueryOutputSchema.safeParse({ pages: [], claims: [], emptyReason: 'slug_not_found' }).success).toBe(true);
    expect(LabReadPublishedOutputSchema.safeParse({
      pages: [publishedPage(slugs[0])], matches: [{ slug: slugs[0], matchedBy: 'any_word' }],
    }).success).toBe(true);
    expect(LabReadPublishedOutputSchema.safeParse({ pages: [], emptyReason: 'notebook_empty' }).success).toBe(true);
  });

  it('rejects bad slugs, inconsistent matches and emptyReason with pages', () => {
    const q = 'Orto Facile';
    for (const bad of [[], [slugs[0], slugs[0]], ['Orto-Facile'], ['orto facile'],
      Array.from({ length: 51 }, (_, i) => `pagina-${i}`)]) {
      expect(LabQueryInputSchema.safeParse({ question: q, slugs: bad }).success).toBe(false);
      expect(LabReadPublishedInputSchema.safeParse({ recipient, slugs: bad }).success).toBe(false);
    }
    const p0 = wikiPage(slugs[0]);
    const p1 = wikiPage(slugs[1]);
    const m = (slug: string) => ({ slug, matchedBy: 'slug' });
    for (const out of [
      { pages: [p0], claims: [], matches: [m(slugs[1])] },
      { pages: [p0, p1], claims: [], matches: [m(slugs[0])] },
      { pages: [p0], claims: [], matches: [m(slugs[0]), m(slugs[0])] },
      { pages: [p0], claims: [], matches: [{ slug: slugs[0], matchedBy: 'fuzzy' }] },
      { pages: [p0], claims: [], emptyReason: 'no_match' },
    ]) expect(LabQueryOutputSchema.safeParse(out).success).toBe(false);
    const r0 = publishedPage(slugs[0]);
    expect(LabReadPublishedOutputSchema.safeParse({ pages: [r0], matches: [m(slugs[1])] }).success).toBe(false);
    expect(LabReadPublishedOutputSchema.safeParse({ pages: [r0], emptyReason: 'no_match' }).success).toBe(false);
  });

  it('inputs convert to JSON Schema and describe slugs', () => {
    for (const schema of [LabQueryInputSchema, LabReadPublishedInputSchema]) {
      const json = z.toJSONSchema(schema, { io: 'input' }) as { properties: Record<string, unknown> };
      expect(json.properties.slugs).toBeDefined();
    }
  });
});
