import { describe, expect, it } from 'vitest';
import {
  paperclipIdentificatoriNudi,
  paperclipLinkIncarico,
  paperclipPercorsoCommento,
  paperclipPercorsoIncarico,
  paperclipPrefissoAzienda,
} from '../../../src/capability/paperclip-protocollo/riferimenti.js';

describe('Paperclip issue references', () => {
  it('s7411_link', () => {
    expect(paperclipPercorsoIncarico('PAP-224')).toBe('/PAP/issues/PAP-224');
    expect(paperclipLinkIncarico('PAP-224')).toBe('[PAP-224](/PAP/issues/PAP-224)');
    expect(paperclipLinkIncarico('ZED-24')).toBe('[ZED-24](/ZED/issues/ZED-24)');
    const commentId = '55555555-5555-4555-8555-555555555555';
    expect(paperclipPercorsoCommento('PAP-224', commentId))
      .toBe(`/PAP/issues/PAP-224#comment-${commentId}`);
    for (const invalid of ['pap-224', 'PAP224', 'PAP-']) {
      expect(() => paperclipPrefissoAzienda(invalid)).toThrow();
      expect(() => paperclipPercorsoIncarico(invalid)).toThrow();
      expect(() => paperclipLinkIncarico(invalid)).toThrow();
      expect(() => paperclipPercorsoCommento(invalid, commentId)).toThrow();
    }
  });

  it('s7411_prefisso', () => {
    expect(paperclipPrefissoAzienda('PAP-315')).toBe('PAP');
    expect(paperclipPrefissoAzienda('AB2-7')).toBe('AB2');
  });

  it('s7411_nudi', () => {
    expect(paperclipIdentificatoriNudi(
      'Vedi PAP-224 e [PAP-225](/PAP/issues/PAP-225), UTF-8, `PAP-226`', 'PAP',
    )).toEqual(['PAP-224']);
    expect(paperclipIdentificatoriNudi(
      '```text\nPAP-227\n```\nPAP-228', 'PAP',
    )).toEqual(['PAP-228']);
    expect(paperclipIdentificatoriNudi(
      'xPAP-1 _PAP-2 PAP-12abc PAP-1234567890 UTF-8 SHA-256 ZED-24 PAP-224 PAP-224 (PAP-225)',
      'PAP',
    )).toEqual(['PAP-224', 'PAP-225']);
    expect(paperclipIdentificatoriNudi('[Vedi incarico](/PAP/issues/PAP-225)', 'PAP'))
      .toEqual([]);
    expect(paperclipIdentificatoriNudi('PAP-1 AB2-7 AB2-7 UTF-8 SHA-256', 'AB2'))
      .toEqual(['AB2-7']);
    expect(paperclipIdentificatoriNudi('', 'PAP')).toEqual([]);
  });

  it('s7411_caso_vero', () => {
    // Production-shaped cross-department wake request: a bare identifier followed by its UUID.
    const text = 'Richiesta fra reparti: PAP-224 (11111111-1111-4111-8111-111111111111)';
    expect(paperclipIdentificatoriNudi(text, 'PAP')).toEqual(['PAP-224']);
    expect(paperclipIdentificatoriNudi(
      text.replace('PAP-224', paperclipLinkIncarico('PAP-224')), 'PAP',
    )).toEqual([]);
  });
});
