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
const result = { filename: 'wiki-samira.md', bytes: 1200, generatedFrom: 3 };

describe('lab browse', () => {
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
    expect(LabPageListOutputSchema.safeParse({ pages: [{ ...entry, body: 'x' }], nextCursor: null }).success).toBe(false);
  });

  it('accepts a list and a detail', () => {
    expect(LabPageListOutputSchema.safeParse({ pages: [entry], nextCursor: null }).success).toBe(true);
    expect(LabPageDetailInputSchema.safeParse({ scope, slug: 'pasta' }).success).toBe(true);
    expect(LabPageDetailInputSchema.safeParse({ scope, slug: '../x' }).success).toBe(false);
    expect(LabPageDetailOutputSchema.safeParse({ page, claims: [claim], links: [link], sources: [source] }).success).toBe(true);
    expect(LabPageDetailOutputSchema.safeParse({ page, claims: [{ ...claim, sourceIds: [] }], links: [], sources: [] }).success).toBe(false);
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
    expect(LabExportResultSchema.safeParse({ ...result, bytes: 5_000_000 }).success).toBe(true);
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
