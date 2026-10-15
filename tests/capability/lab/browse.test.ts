import { describe, expect, it } from 'vitest';
import * as lab from '../../../src/capability/lab/index.js';
import {
  LabPageListInputSchema, LabPageListOutputSchema, LabPageDetailInputSchema, LabPageDetailOutputSchema,
  LabExportRequestSchema, LabExportResultSchema, LabBrowseErrorSchema,
} from '../../../src/capability/lab/browse.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'samira' };
const entry = { slug: 'pasta', title: 'Pasta', kind: 'concept', version: 2, updatedAt: '2026-10-14T01:00:00Z' };
const page = { agentId: 'samira', slug: 'pasta', kind: 'concept', title: 'Pasta', body: '# Pasta', version: 2, updatedAt: '2026-10-14T01:00:00Z' };
const source = { id: 's1', agentId: 'samira', url: 'https://example.com/a', fetchedAt: '2026-10-14T01:00:00Z', contentSha256: 'a'.repeat(64), origin: 'web' };
const claim = { id: 'c1', pageSlug: 'pasta', text: 'Boils at 100C', sourceIds: ['s1'], status: 'aperta', origin: 'web' };
const link = { from: 'pasta', to: 'acqua', kind: 'uses' };
const result = { filename: 'wiki-samira.md', bytes: 7, content: 'caffè!', partial: false, generatedFrom: 3 };
const truncated = { claims: false, links: false, sources: false };
const list = { snapshotVersion: 0, pages: [entry], nextCursor: null };
const detail = { snapshotVersion: 3, truncated, page, claims: [claim], links: [link], sources: [source] };

describe('lab browse', () => {
  it('requires a nonnegative integer snapshot version on both outputs', () => {
    for (const [schema, valid] of [[LabPageListOutputSchema, list], [LabPageDetailOutputSchema, detail]] as const) {
      for (const snapshotVersion of [0, 3]) {
        expect(schema.parse({ ...valid, snapshotVersion }).snapshotVersion).toBe(snapshotVersion);
      }
      for (const snapshotVersion of [-1, 0.5, '3', undefined]) {
        expect(schema.safeParse({ ...valid, snapshotVersion }).success).toBe(false);
      }
    }
  });

  it('allows an optional positive integer detail version', () => {
    expect(LabPageDetailInputSchema.parse({ scope, slug: 'pasta', version: 2 }).version).toBe(2);
    expect(LabPageDetailInputSchema.safeParse({ scope, slug: 'pasta' }).success).toBe(true);
    for (const version of [0, -1, 1.5, '2', null]) {
      expect(LabPageDetailInputSchema.safeParse({ scope, slug: 'pasta', version }).success).toBe(false);
    }
  });

  it('requires exactly three boolean truncation flags', () => {
    for (const value of [false, true]) {
      const flags = { claims: value, links: value, sources: value };
      expect(LabPageDetailOutputSchema.parse({ ...detail, truncated: flags }).truncated).toEqual(flags);
    }
    expect(LabPageDetailOutputSchema.safeParse({ ...detail, truncated: undefined }).success).toBe(false);
    expect(LabPageDetailOutputSchema.safeParse({ ...detail, truncated: { ...truncated, extra: true } }).success).toBe(false);
    for (const key of ['claims', 'links', 'sources'] as const) {
      for (const value of [undefined, 'false', 0]) {
        expect(LabPageDetailOutputSchema.safeParse({ ...detail, truncated: { ...truncated, [key]: value } }).success).toBe(false);
      }
    }
  });

  it('requires bounded content, a partial flag and matching UTF-8 bytes', () => {
    for (const content of ['', 'plain text', 'caffè ☕😀']) {
      for (const partial of [true, false]) {
        const valid = { ...result, content, partial, bytes: new TextEncoder().encode(content).length };
        expect(LabExportResultSchema.parse(valid)).toEqual(valid);
        expect(LabExportResultSchema.safeParse({ ...valid, bytes: valid.bytes + 1 }).success).toBe(false);
      }
    }
    expect(LabExportResultSchema.safeParse({ ...result, bytes: result.content.length }).success).toBe(false);
    for (const partial of [undefined, 'false', 0]) {
      expect(LabExportResultSchema.safeParse({ ...result, partial }).success).toBe(false);
    }
    for (const content of [undefined, 123, 'a'.repeat(5_000_001)]) {
      expect(LabExportResultSchema.safeParse({ ...result, content }).success).toBe(false);
    }
    // Isolate the character limit from the independent bytes bound and consistency check.
    expect(LabExportResultSchema.shape.content.safeParse('a'.repeat(5_000_000)).success).toBe(true);
    expect(LabExportResultSchema.shape.content.safeParse('a'.repeat(5_000_001)).success).toBe(false);
  });

  it('defaults and bounds the page list', () => {
    expect(LabPageListInputSchema.parse({ scope }).limit).toBe(50);
    expect(LabPageListInputSchema.parse({ scope, limit: 200 }).limit).toBe(200);
    for (const limit of [0, 201, 1.5]) expect(LabPageListInputSchema.safeParse({ scope, limit }).success).toBe(false);
    expect(LabPageListInputSchema.safeParse({ scope, cursor: '' }).success).toBe(false);
  });

  it('rejects extra keys everywhere', () => {
    expect(LabPageListInputSchema.safeParse({ scope, extra: 1 }).success).toBe(false);
    expect(LabPageListInputSchema.safeParse({ scope: { ...scope, x: 1 } }).success).toBe(false);
    expect(LabPageDetailInputSchema.safeParse({ scope, slug: 'pasta', extra: 1 }).success).toBe(false);
    expect(LabExportRequestSchema.safeParse({ scope, format: 'json', path: '/tmp/x' }).success).toBe(false);
    expect(LabExportResultSchema.safeParse({ ...result, extra: 1 }).success).toBe(false);
    expect(LabPageListOutputSchema.safeParse({ ...list, pages: [{ ...entry, body: 'x' }] }).success).toBe(false);
  });

  it('accepts a list and a detail', () => {
    expect(LabPageListOutputSchema.safeParse(list).success).toBe(true);
    expect(LabPageDetailInputSchema.safeParse({ scope, slug: 'pasta' }).success).toBe(true);
    expect(LabPageDetailInputSchema.safeParse({ scope, slug: '../x' }).success).toBe(false);
    expect(LabPageDetailOutputSchema.safeParse(detail).success).toBe(true);
    expect(LabPageDetailOutputSchema.safeParse({ ...detail, claims: [{ ...claim, sourceIds: [] }], links: [], sources: [] }).success).toBe(false);
  });

  it('restricts the export format', () => {
    for (const format of ['markdown', 'json']) expect(LabExportRequestSchema.safeParse({ scope, format }).success).toBe(true);
    for (const format of ['pdf', '', undefined]) expect(LabExportRequestSchema.safeParse({ scope, format }).success).toBe(false);
  });

  it('accepts only safe filenames and bounded sizes', () => {
    expect(LabExportResultSchema.safeParse(result).success).toBe(true);
    for (const filename of ['../x.md', 'a/b.md', 'a b.md', '', 'a'.repeat(121), '..', 'a..b.md']) {
      expect(LabExportResultSchema.safeParse({ ...result, filename }).success).toBe(false);
    }
    expect(LabExportResultSchema.safeParse({ ...result, bytes: 5_000_001 }).success).toBe(false);
    expect(LabExportResultSchema.safeParse({ ...result, bytes: 5_000_000, content: 'a'.repeat(5_000_000) }).success).toBe(true);
  });

  it('reuses the canonical tool errors', () => {
    expect(LabBrowseErrorSchema.safeParse({ error: 'not_found' }).success).toBe(true);
    expect(LabBrowseErrorSchema.safeParse({ error: 'boom' }).success).toBe(false);
  });

  it('exports growth and browse symbols from the index', () => {
    for (const name of [
      'LabScopeSchema', 'LabGrowthPointSchema', 'LabGrowthHistoryInputSchema', 'LabGrowthHistoryOutputSchema',
      'LabPageListInputSchema', 'LabPageListEntrySchema', 'LabPageListOutputSchema', 'LabPageDetailInputSchema',
      'LabPageDetailOutputSchema', 'LabExportFormatSchema', 'LabExportRequestSchema', 'LabExportResultSchema',
      'LabBrowseErrorSchema',
    ]) expect(Object.keys(lab)).toContain(name);
  });
});
