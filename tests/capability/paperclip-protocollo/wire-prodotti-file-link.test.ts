import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { DELIVERY_PACKAGE_ATTACHMENT_MAX_BYTES } from '../../../src/organization/delivery-package.js';
import {
  PAPERCLIP_PREVIEW_PROVIDER,
  PaperclipProdottoCreaCorpoSchema,
  paperclipProdottoDaAnteprima,
  paperclipProdottoDaFileLink,
  paperclipProdottoEFileLink,
} from '../../../src/capability/paperclip-protocollo/wire-prodotti.js';

const MIB = 1024 * 1024;
const sha256 = createHash('sha256').update('pdf-di-tutte-le-schermate').digest('hex');
const file = { url: 'https://x9.example/f/Pq8w2LmN', sha256, title: 'schermate.pdf' };
const createdByRunId = '12345678-1234-4234-8234-123456789abc';

describe('s8229 heavy file by link', () => {
  it('s8229 file-pesante-per-link', () => {
    expect(DELIVERY_PACKAGE_ATTACHMENT_MAX_BYTES).toBe(10485760);
    expect(14 * MIB > DELIVERY_PACKAGE_ATTACHMENT_MAX_BYTES).toBe(true);
    expect(10 * MIB > DELIVERY_PACKAGE_ATTACHMENT_MAX_BYTES).toBe(false);
    const corpo = paperclipProdottoDaFileLink(file);
    expect(corpo).toEqual({
      type: 'document',
      provider: 'x9',
      externalId: sha256,
      title: 'schermate.pdf',
      url: file.url,
      status: 'active',
      reviewState: 'none',
      isPrimary: false,
    });
    expect(PaperclipProdottoCreaCorpoSchema.parse(corpo)).toEqual(corpo);
  });

  it('s8229 tipo-document', () => {
    const corpo = paperclipProdottoDaFileLink(file);
    expect(corpo.type).toBe('document');
    expect(corpo.type).not.toBe('preview_url');
    expect(corpo.type).not.toBe('artifact');
    expect(corpo.provider).toBe(PAPERCLIP_PREVIEW_PROVIDER);
    expect(corpo.provider).toBe('x9');
  });

  it('s8229 link-e-impronta', () => {
    for (const url of ['http://x9.example/f/Pq8w2LmN', '']) {
      expect(() => paperclipProdottoDaFileLink({ ...file, url })).toThrow();
    }
    for (const invalid of ['a'.repeat(63), `A${'a'.repeat(63)}`]) {
      expect(() => paperclipProdottoDaFileLink({ ...file, sha256: invalid })).toThrow();
    }
  });

  it('s8229 titolo-e-riassunto', () => {
    const base = paperclipProdottoDaFileLink(file);
    expect(paperclipProdottoDaFileLink({ ...file, summary: 'PDF di tutte le schermate', createdByRunId }))
      .toEqual({ ...base, summary: 'PDF di tutte le schermate', createdByRunId });
    expect(() => paperclipProdottoDaFileLink({ ...file, title: '' })).toThrow();
  });

  it('s8229 riconosce-il-gia-registrato', () => {
    const prodotto = paperclipProdottoDaFileLink(file);
    expect(paperclipProdottoEFileLink(prodotto, sha256)).toBe(true);
    expect(paperclipProdottoEFileLink(prodotto, '0'.repeat(64))).toBe(false);
    const anteprima = paperclipProdottoDaAnteprima(file);
    expect(paperclipProdottoEFileLink(anteprima, sha256)).toBe(false);
    expect(paperclipProdottoEFileLink({ ...prodotto, provider: 'paperclip' }, sha256)).toBe(false);
    expect(paperclipProdottoEFileLink({ type: 'document', provider: 'x9' }, sha256)).toBe(false);
  });
});
