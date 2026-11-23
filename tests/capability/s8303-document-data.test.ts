import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_DATA_MAX_BLOCKS,
  DOCUMENT_DATA_MAX_BYTES,
  DOCUMENT_DATA_MAX_CELLS,
  DocumentDataSchema,
  documentDataCanonicalJson,
} from '../../src/capability/document-render.js';

const text = (value: string) => [{ text: value }];
const table = () => ({
  kind: 'table' as const,
  header: [text('Voce'), text('Valore')],
  widths: [1, '*'],
  rows: [[text('Prima'), text('è')], [text('Ultima'), text('42')]],
});
const document = () => ({
  title: 'Analisi e qualità',
  language: 'it-IT',
  source: { kind: 'dossier', id: 'published-dossier', version: '7', sha256: 'a'.repeat(64) },
  blocks: [
    { kind: 'heading', level: 1, content: text('Perché') },
    { kind: 'paragraph', content: [
      { text: 'Caffè', bold: true, italic: true },
      { text: ' fonte', href: 'https://example.invalid/source?q=qualit%C3%A0' },
    ] },
    { kind: 'list', ordered: true, items: [text('Uno'), text('Due')] },
    { kind: 'list', ordered: false, items: [text('Tre')] },
    table(),
    { kind: 'code', language: 'typescript', text: 'const qualità = 42;\n' },
    { kind: 'paragraph', content: text('Ultimo blocco: integrità') },
  ],
});
const digest = (value: unknown) => createHash('sha256')
  .update(documentDataCanonicalJson(value)).digest('hex');

describe('s8303 document data', () => {
  it('s8303 rejects a ragged table and preserves the last block in canonical data', () => {
    const valid = document();
    expect(DocumentDataSchema.parse(valid)).toEqual(valid);
    expect(JSON.parse(documentDataCanonicalJson(valid))).toEqual(valid);
    expect(JSON.parse(documentDataCanonicalJson(valid)).blocks.at(-1)).toEqual(valid.blocks.at(-1));
    const ragged = { ...valid, blocks: [{ ...table(), rows: [[text('Only one cell')]] }] };
    const result = DocumentDataSchema.safeParse(ragged);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: ['blocks', 0, 'rows'], message: 'Table rows must be rectangular' }),
      ]));
    }
  });

  it('round trips every block, accents, links and the last table row without fetching', () => {
    const value = document();
    const parsed = DocumentDataSchema.parse(value);
    const canonical = JSON.parse(documentDataCanonicalJson(parsed));
    expect(parsed).toEqual(value);
    expect(canonical).toEqual(value);
    expect(canonical.blocks.map((block: { kind: string }) => block.kind))
      .toEqual(['heading', 'paragraph', 'list', 'list', 'table', 'code', 'paragraph']);
    expect(canonical.blocks[4].rows.at(-1)).toEqual([text('Ultima'), text('42')]);
    expect(canonical.blocks[1].content[1].href).toBe('https://example.invalid/source?q=qualit%C3%A0');
  });

  it('keeps the digest stable for reordered keys and changes it for the last cell', () => {
    const value = document();
    const reordered = {
      blocks: value.blocks,
      source: { sha256: value.source.sha256, version: '7', id: value.source.id, kind: 'dossier' },
      language: value.language,
      title: value.title,
    };
    expect(documentDataCanonicalJson(reordered)).toBe(documentDataCanonicalJson(value));
    expect(digest(reordered)).toBe(digest(value));
    const changed = { ...value, blocks: [{ ...table(), rows: [[text('Prima'), text('è')], [text('Ultima'), text('43')]] }] };
    const original = { ...value, blocks: [table()] };
    expect(digest(changed)).not.toBe(digest(original));
    expect(digest({ ...value, blocks: [...value.blocks].reverse() })).not.toBe(digest(value));
  });

  it.each([0, -1, Number.POSITIVE_INFINITY, 'auto', '/fonts/font.ttf'])('rejects invalid table width %s', width => {
    expect(DocumentDataSchema.safeParse({ ...document(), blocks: [{ ...table(), widths: [width, '*'] }] }).success).toBe(false);
  });

  it('rejects a width count that differs from the header and empty tables', () => {
    for (const block of [
      { ...table(), widths: [1] },
      { ...table(), header: [], rows: [] },
      { ...table(), rows: [] },
    ]) expect(DocumentDataSchema.safeParse({ ...document(), blocks: [block] }).success).toBe(false);
  });

  it('rejects HTML, font paths, download instructions and caller functions', () => {
    for (const block of [
      { kind: 'html', html: '<script>alert(1)</script>' },
      { kind: 'paragraph', content: text('<img src=x onerror=alert(1)>') },
      { kind: 'paragraph', content: [{ text: 'click', href: 'javascript:alert(1)' }] },
      { kind: 'paragraph', content: [{ text: 'font', font: '/fonts/custom.ttf' }] },
      { kind: 'code', text: 'code', render: () => 'injected' },
      { kind: 'paragraph', content: text('file'), downloadUrl: 'https://example.invalid/file' },
    ]) expect(DocumentDataSchema.safeParse({ ...document(), blocks: [block] }).success).toBe(false);
    for (const extra of [{ fontPath: '/fonts/custom.ttf' }, { url: 'https://example.invalid/file' }, { render: () => '' }]) {
      expect(DocumentDataSchema.safeParse({ ...document(), ...extra }).success).toBe(false);
    }
  });

  it('enforces the block limit without truncating', () => {
    const block = { kind: 'paragraph', content: text('x') };
    const valid = { ...document(), blocks: Array.from({ length: DOCUMENT_DATA_MAX_BLOCKS }, () => block) };
    expect(DocumentDataSchema.parse(valid).blocks).toHaveLength(DOCUMENT_DATA_MAX_BLOCKS);
    expect(DocumentDataSchema.safeParse({ ...valid, blocks: [...valid.blocks, block] }).success).toBe(false);
  });

  it('enforces the cell limit across tables including header cells', () => {
    const cells = Array.from({ length: 100 }, () => text('x'));
    const first = { kind: 'table', header: cells, rows: Array.from({ length: 99 }, () => cells) };
    const valid = { ...document(), blocks: [first, first] };
    expect(DOCUMENT_DATA_MAX_CELLS).toBe(20000);
    expect(DocumentDataSchema.parse(valid)).toEqual(valid);
    expect(DocumentDataSchema.safeParse({ ...valid, blocks: [...valid.blocks, { kind: 'table', header: [text('x')], rows: [[text('x')]] }] }).success).toBe(false);
  });

  it('enforces serialized UTF-8 bytes and canonicalization never truncates invalid input', () => {
    const value = { ...document(), blocks: Array.from({ length: 20 }, () => ({ kind: 'code', text: 'è'.repeat(30000) })) };
    expect(new TextEncoder().encode(JSON.stringify(value)).byteLength).toBeGreaterThan(DOCUMENT_DATA_MAX_BYTES);
    expect(DocumentDataSchema.safeParse(value).success).toBe(false);
    expect(() => documentDataCanonicalJson(value)).toThrow();
  });

  it('ignores absent optional properties in canonical JSON and rejects unknown source metadata', () => {
    const value = { ...document(), blocks: [{ kind: 'code', text: 'x', language: undefined }] };
    expect(JSON.parse(documentDataCanonicalJson(value)).blocks).toEqual([{ kind: 'code', text: 'x' }]);
    expect(DocumentDataSchema.safeParse({ ...document(), source: { ...document().source, fontPath: '/fonts/custom.ttf' } }).success).toBe(false);
  });
});
