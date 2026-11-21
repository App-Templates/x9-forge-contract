import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  PAPERCLIP_PREVIEW_PROVIDER,
  PaperclipProdottoCreaCorpoSchema,
  paperclipProdottoDaAnteprima,
  paperclipProdottoEAnteprima,
} from '../../../src/capability/paperclip-protocollo/wire-prodotti.js';

const sha256 = createHash('sha256').update('<!doctype html><title>Demo</title>').digest('hex');
const anteprima = { url: 'https://x9.example/m/Xk3f9aQ2', sha256, title: 'demo.html' };
const createdByRunId = '12345678-1234-4234-8234-123456789abc';

describe('s8221 preview work products', () => {
  it('s8221 anteprima-della-demo', () => {
    const corpo = paperclipProdottoDaAnteprima(anteprima);
    expect(corpo).toEqual({
      type: 'preview_url',
      provider: 'x9',
      externalId: sha256,
      title: 'demo.html',
      url: anteprima.url,
      status: 'active',
      reviewState: 'none',
      isPrimary: false,
    });
    expect(PaperclipProdottoCreaCorpoSchema.parse(corpo)).toEqual(corpo);
  });

  it('s8221 link-non-https', () => {
    for (const url of ['http://x9.example/m/Xk3f9aQ2', 'ftp://x9.example/demo.html', '']) {
      expect(() => paperclipProdottoDaAnteprima({ ...anteprima, url })).toThrow();
    }
  });

  it('s8221 impronta-corta', () => {
    for (const invalid of ['a'.repeat(63), `A${'a'.repeat(63)}`, `g${'a'.repeat(63)}`]) {
      expect(() => paperclipProdottoDaAnteprima({ ...anteprima, sha256: invalid })).toThrow();
    }
  });

  it('s8221 tipo-e-provider', () => {
    const corpo = paperclipProdottoDaAnteprima(anteprima);
    expect(corpo.type).toBe('preview_url');
    expect(corpo.type).not.toBe('artifact');
    expect(corpo.type).not.toBe('document');
    expect(PAPERCLIP_PREVIEW_PROVIDER).toBe('x9');
    expect(corpo.provider).toBe(PAPERCLIP_PREVIEW_PROVIDER);
  });

  it('s8221 riconosce-il-gia-registrato', () => {
    const prodotto = paperclipProdottoDaAnteprima(anteprima);
    expect(paperclipProdottoEAnteprima(prodotto, sha256)).toBe(true);
    expect(paperclipProdottoEAnteprima(prodotto, '0'.repeat(64))).toBe(false);
    expect(paperclipProdottoEAnteprima({ ...prodotto, type: 'commit' }, sha256)).toBe(false);
    expect(paperclipProdottoEAnteprima({ ...prodotto, provider: 'paperclip' }, sha256)).toBe(false);
    expect(paperclipProdottoEAnteprima({ ...prodotto, externalId: null }, sha256)).toBe(false);
    expect(paperclipProdottoEAnteprima({ type: 'preview_url', provider: 'x9' }, sha256)).toBe(false);
  });

  it('s8221 titolo-e-riassunto', () => {
    const base = paperclipProdottoDaAnteprima(anteprima);
    expect(base.title).toBe(anteprima.title);
    expect(base).not.toHaveProperty('summary');
    expect(base).not.toHaveProperty('createdByRunId');
    expect(paperclipProdottoDaAnteprima({ ...anteprima, summary: 'Demo navigabile' }))
      .toEqual({ ...base, summary: 'Demo navigabile' });
    expect(paperclipProdottoDaAnteprima({ ...anteprima, createdByRunId }))
      .toEqual({ ...base, createdByRunId });
    expect(paperclipProdottoDaAnteprima({ ...anteprima, summary: '', createdByRunId }))
      .toEqual({ ...base, summary: '', createdByRunId });
    // The builder must keep schema validation for titles and authenticated run identifiers.
    expect(() => paperclipProdottoDaAnteprima({ ...anteprima, title: '' })).toThrow();
    expect(() => paperclipProdottoDaAnteprima({ ...anteprima, createdByRunId: 'invalid' })).toThrow();
  });
});
