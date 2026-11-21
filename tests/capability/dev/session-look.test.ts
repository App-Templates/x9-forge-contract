import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_LOOK_LABELS,
  DevSessionAcceptanceSchema,
  DevSessionLookSchema,
  devSessionLookDeliveryProblem,
  devSessionLookKindOfBytes,
  devSessionLookKindOfMediaType,
  devSessionLookOpeningProblem,
  type DevSessionAcceptance,
} from '../../../src/capability/dev/session-acceptance.js';

const bytes = (...values: number[]) => Uint8Array.from(values);
const text = (value: string) => new TextEncoder().encode(value);
// The 16 real leading bytes of the R63 preview (a PNG), read read-only on 2026-11-21.
const PNG_R63 = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52);
const HTML = text('<!doctype html><html><body>x</body></html>');
const proto = { kind: 'prototipo' as const, tryPath: ['Opens the list'] };

const make = (template: string, look?: unknown): DevSessionAcceptance => ({
  version: 1,
  template: { id: template, version: 1 },
  input: look === undefined ? {} : { look: look as never },
  criteria: [{ id: 'c1', text: 'The user can see it.', attestor: 'referente', proof: 'Looks.', origin: 'capo' }],
});

describe('s8115 session look', () => {
  it('s8115 tipo-dai-byte', () => {
    expect(devSessionLookKindOfBytes(PNG_R63)).toBe('immagine');
    expect(devSessionLookKindOfBytes(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe('immagine');
    expect(devSessionLookKindOfBytes(text('﻿\n  <!DOCTYPE HTML><html>'))).toBe('prototipo');
    expect(devSessionLookKindOfBytes(text('<HTML lang="it">'))).toBe('prototipo');
    expect(devSessionLookKindOfBytes(text('%PDF-1.7'))).toBe('documento');
    expect(devSessionLookKindOfBytes(text('x'))).toBeNull();
    expect(devSessionLookKindOfBytes(text('<div>'))).toBeNull();
    expect(devSessionLookDeliveryProblem(proto, PNG_R63)).toEqual({ code: 'look_kind_mismatch', actual: 'immagine' });
    expect(devSessionLookDeliveryProblem(proto, HTML)).toBeNull();
    expect(devSessionLookDeliveryProblem({ kind: 'documento' }, PNG_R63)).toEqual({ code: 'look_kind_mismatch', actual: 'immagine' });
  });

  it('s8115 file-vuoto-e-sconosciuto', () => {
    expect(devSessionLookDeliveryProblem(proto, new Uint8Array(0))).toEqual({ code: 'look_file_empty' });
    expect(devSessionLookDeliveryProblem(proto, text('x'))).toEqual({ code: 'look_kind_unknown' });
  });

  it('s8115 apertura', () => {
    expect(devSessionLookOpeningProblem(make('design-sito'))).toEqual({ code: 'look_missing' });
    expect(devSessionLookOpeningProblem(make('design-sito', { kind: 'immagine' }))).toEqual({ code: 'look_not_prototype' });
    expect(devSessionLookOpeningProblem(make('sviluppo-pezzo-app', { kind: 'prototipo' }))).toEqual({ code: 'look_path_missing' });
    expect(devSessionLookOpeningProblem(make('sviluppo-pezzo-app', proto))).toBeNull();
    expect(devSessionLookOpeningProblem(make('design-ritocco', { kind: 'immagine' }))).toBeNull();
  });

  it('s8115 forma-e-storico', () => {
    expect(DevSessionLookSchema.safeParse({ kind: 'video' }).success).toBe(false);
    expect(DevSessionLookSchema.safeParse({ kind: 'prototipo', tryPath: Array.from({ length: 21 }, (_, i) => `step ${i}`) }).success).toBe(false);
    expect(DevSessionLookSchema.safeParse({ kind: 'prototipo', extra: 1 }).success).toBe(false);
    expect(DevSessionLookSchema.safeParse(proto).success).toBe(true);
    const saved56 = {
      version: 1,
      template: { id: 'sviluppo-pezzo-app', version: 1 },
      input: {
        userPath: ['Opens the backtest', 'Reads the result'],
        data: 'di_prova',
        proofScripts: ['test:unit', 'test:build'],
        screens: [{ name: 'home', purpose: 'Open' }, { name: 'risultato', purpose: 'Read' }],
        behaviors: ['apri', 'leggi'],
        states: ['pieno', 'vuoto', 'errore', 'caricamento'],
        formats: ['telefono'],
        visualSource: { kind: 'tavola_approvata', reference: 'asset-design-1' },
      },
      criteria: [
        { id: 'm-1', text: 'The mandate holds.', attestor: 'referente', proof: 'Decision.', origin: 'mandato' },
        { id: 'c-1', text: 'The capo asks.', attestor: 'sessione', proof: 'Attestation.', origin: 'capo' },
      ],
    };
    expect(DevSessionAcceptanceSchema.parse(saved56)).toEqual(saved56);
  });

  it('s8115 etichette', () => {
    expect(DEV_SESSION_LOOK_LABELS).toEqual({
      prototipo: 'Apri il prototipo da provare',
      immagine: "Guarda l'immagine dello schermo",
      documento: 'Apri il documento',
    });
    expect(devSessionLookKindOfMediaType('image/png')).toBe('immagine');
    expect(devSessionLookKindOfMediaType('text/html; charset=utf-8')).toBe('prototipo');
    expect(devSessionLookKindOfMediaType('Application/PDF')).toBe('documento');
    expect(devSessionLookKindOfMediaType('application/zip')).toBeNull();
  });
});
